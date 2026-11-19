import { ArrowLeft, ChevronLeft, ChevronRight, X } from "../lib/animated-icons";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Place } from "../data/offclock";

/**
 * A place's photos as a full-screen bento grid: one large photo with the rest
 * around it. Each photo is revealed as it arrives — it rises in from below,
 * uncovering from the bottom edge, one after another as the grid opens.
 *
 * Clicking a photo zooms it in place: the same photo grows out of its spot in
 * the grid to fill the screen (the rest of the grid fades back), all within
 * this one overlay — no second modal on top. ← → step through the photos;
 * Back, Esc or a click on the backdrop shrinks it back into its spot.
 */
export default function GalleryGrid({ place, onClose }: { place: Place | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [view, setView] = useState<number | null>(null);
  // Magnifier inside the expanded photo: click to zoom in at that point, move (or drag) to look around, click again to zoom out.
  const [mag, setMag] = useState<{ on: boolean; x: number; y: number }>({ on: false, x: 50, y: 50 });
  // Cells clip to their rounded shape while revealing, then stop clipping so a zoomed photo can fly back into them.
  const [revealed, setRevealed] = useState(false);
  // Natural aspect ratio of each photo, so the zoomed frame fits the screen without cropping.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [win, setWin] = useState({ w: window.innerWidth, h: window.innerHeight });
  const photos = place ? [place.image, ...(place.photos ?? [])].filter((x): x is string => !!x) : [];
  const n = photos.length;

  // Latest values for the key handler, which is bound once per open.
  const live = useRef({ view, n, mag: mag.on });
  live.current = { view, n, mag: mag.on };
  // Any change of photo starts un-magnified.
  useEffect(() => setMag((m) => ({ ...m, on: false })), [view]);

  useEffect(() => {
    if (!place) return;
    setView(null);
    setRevealed(false);
    const t = window.setTimeout(() => setRevealed(true), 1400);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      const { view: v, n: count, mag: magOn } = live.current;
      // Esc steps back one level at a time: magnified → expanded → grid → closed.
      if (e.key === "Escape") magOn ? setMag((m) => ({ ...m, on: false })) : v === null ? onClose() : setView(null);
      if (v !== null && e.key === "ArrowRight") setView((v + 1) % count);
      if (v !== null && e.key === "ArrowLeft") setView((v - 1 + count) % count);
    };
    const onResize = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  const ease = [0.22, 1, 0.36, 1] as const;
  const zoom = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 32 };
  const step = (d: number) => setView((v) => (v === null ? v : (v + d + n) % n));

  // The expanded frame: as large as fits the screen (below the bar, between the arrows) at the photo's own shape.
  // On phones it runs edge to edge and only leaves room for the bar and the arrows, so the whole photo shows as big as possible.
  const cur = view !== null ? photos[view] : null;
  const ar = cur ? (ratios[cur] ?? 4 / 3) : 4 / 3;
  const phone = win.w < 640;
  const maxW = win.w - (phone ? 0 : 160);
  const maxH = win.h - (phone ? 160 : 170);
  const fw = Math.min(maxW, maxH * ar);
  const fh = fw / ar;

  return createPortal(
    <AnimatePresence>
      {place && (
        <motion.div
          className="tripgrid"
          role="dialog"
          aria-modal="true"
          aria-label={`${place.name} photos`}
          data-zoomed={view !== null || undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <LayoutGroup id={`trip-${place.name}`}>
            <div className="tripgrid__inner">
              <motion.header className="tripgrid__head" animate={{ opacity: view === null ? 1 : 0 }} transition={{ duration: 0.25 }}>
                <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
                  <h2 className="tripgrid__title">{place.name}</h2>
                  <p className="tripgrid__meta">{place.region}</p>
                </motion.div>
                <button type="button" className="tripgrid__close" onClick={onClose} aria-label="Close" autoFocus tabIndex={view === null ? 0 : -1}>
                  <X size={18} />
                </button>
              </motion.header>

              <ul className="tripgrid__grid" data-count={Math.min(n, 5)} data-revealed={revealed || undefined}>
                {photos.map((src, k) => (
                  <motion.li
                    key={src}
                    className="tripgrid__cell"
                    initial={reduce ? false : { opacity: 0, y: 40, clipPath: "inset(100% 0% 0% 0% round 14px)" }}
                    animate={{
                      // While a photo is zoomed, the others fade back.
                      opacity: view !== null && view !== k ? 0 : 1,
                      y: 0,
                      clipPath: revealed ? "none" : "inset(0% 0% 0% 0% round 14px)",
                    }}
                    transition={revealed ? { duration: 0.25 } : { duration: 0.9, ease, delay: 0.15 + k * 0.09 }}
                  >
                    <button type="button" onClick={() => setView(k)} aria-label={`Open photo ${k + 1} of ${place.name}`} tabIndex={view === null ? 0 : -1}>
                      {view !== k && (
                        <motion.div layoutId={src} className="tripgrid__frame" transition={zoom}>
                          <motion.img
                            layout
                            src={src}
                            alt=""
                            decoding="async"
                            transition={zoom}
                            onLoad={(e) => {
                              const im = e.currentTarget;
                              if (im.naturalWidth && !ratios[src]) setRatios((r) => ({ ...r, [src]: im.naturalWidth / im.naturalHeight }));
                            }}
                          />
                        </motion.div>
                      )}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>

            <AnimatePresence>
              {view !== null && cur && (
                <motion.div className="tripzoom" key="zoom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <div className="tripzoom__bar">
                    <button type="button" className="tripzoom__back" onClick={() => setView(null)}>
                      <ArrowLeft size={16} /> All photos
                    </button>
                    <span className="tripzoom__count">
                      {String(view + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                    </span>
                    <button type="button" className="tripgrid__close" onClick={onClose} aria-label="Close">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="tripzoom__stage" onClick={() => setView(null)}>
                    {n > 1 && (
                      <button type="button" className="tripzoom__nav tripzoom__nav--prev" aria-label="Previous photo" onClick={(e) => (e.stopPropagation(), step(-1))}>
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    {n > 1 && (
                      <button type="button" className="tripzoom__nav tripzoom__nav--next" aria-label="Next photo" onClick={(e) => (e.stopPropagation(), step(1))}>
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The zoomed photo shares its layoutId with its grid cell, so it grows out of that spot and back. */}
            {view !== null && cur && (
              <div className="tripzoom__slot" style={{ width: fw, height: fh }}>
                <motion.div
                  key={cur}
                  layoutId={cur}
                  className="tripgrid__frame tripzoom__frame"
                  data-mag={mag.on || undefined}
                  transition={zoom}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - r.left) / r.width) * 100;
                    const y = ((e.clientY - r.top) / r.height) * 100;
                    setMag((m) => ({ on: !m.on, x, y }));
                  }}
                  onPointerMove={(e) => {
                    if (!mag.on) return;
                    const r = e.currentTarget.getBoundingClientRect();
                    setMag({ on: true, x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)), y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) });
                  }}
                >
                  <motion.div layout className="tripzoom__pan" transition={zoom}>
                    <img
                      src={cur}
                      alt={`${place.name}, photo ${view + 1} of ${n}`}
                      draggable={false}
                      style={{ transform: mag.on ? "scale(2.5)" : "none", transformOrigin: `${mag.x}% ${mag.y}%` }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            )}
          </LayoutGroup>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
