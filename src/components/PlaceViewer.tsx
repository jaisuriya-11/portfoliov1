import { X } from "lucide-react";
import { Pagination } from "./arc/pagination/pagination";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Place } from "../data/offclock";

/**
 * Full-screen viewer for a place's photo: name and visit info top-left, close
 * top-right, the photo centred, and Arc UI pagination at the bottom to step
 * through the places in view. Arrow keys step, Esc closes.
 */
export default function PlaceViewer({ list, index, onIndex, onClose }: { list: Place[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const reduce = useReducedMotion();
  const open = index !== null && !!list[index];
  const p = open ? list[index] : null;
  const step = (d: number) => index !== null && onIndex((index + d + list.length) % list.length);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  });

  return createPortal(
    <AnimatePresence>
      {p && (
        <motion.div
          className="pview"
          role="dialog"
          aria-modal="true"
          aria-label={`${p.name}, ${p.region}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <header className="pview__head">
            <div>
              <p className="pview__title">
                {p.name}, {p.region}
              </p>
              <p className="pview__meta">{p.visited ? `Visited${p.date ? ` · ${p.date}` : ""}` : "Not yet · stand-in photo"}</p>
            </div>
            <button type="button" className="pview__close" onClick={onClose} aria-label="Close" autoFocus>
              <X size={18} />
            </button>
          </header>

          <div className="pview__stage" onClick={onClose}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={p.image}
                src={p.image}
                alt={`${p.name}, ${p.region}`}
                onClick={(e) => e.stopPropagation()}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
          </div>

          <footer className="pview__foot">
            {p.credit && (
              <a className="pview__credit" href={p.creditLink} target="_blank" rel="noreferrer">
                Photo: {p.credit}
              </a>
            )}
            {list.length > 1 && (
              <div className="pview__nav">
                {/* Arc UI pagination: previous / numbered pages / next. Arrow keys work too. */}
                <Pagination label="Places" page={(index ?? 0) + 1} pageCount={list.length} onPageChange={(n) => onIndex(n - 1)} />
              </div>
            )}
          </footer>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
