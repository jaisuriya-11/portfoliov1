import { ArrowUpRight, Code2, Globe, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../data/profile";
import { brandColor, hasTechIcon, TechIcon } from "../lib/tech-icons";
import { useTheme } from "../lib/theme";
import ArcLink from "./ArcLink";
import WaveArt from "./WaveArt";
import { Badge } from "./arc/badge/badge";
import { motionTokens } from "./arc/lib/motion-tokens";

/** Wave palettes for the hover backdrop, one per card in turn: [base, band, band, band]. */
const PALETTES: [string, string, string, string][] = [
  ["#e0601f", "#f5b37a", "#fbe6d2", "#b8441a"],
  ["#2b3440", "#5b6b7f", "#c9d2dc", "#141a21"],
  ["#5a4bd1", "#a99cf5", "#e7e3ff", "#3b2fa0"],
  ["#0f8b8d", "#7fd6cf", "#e0f6f3", "#0a5e60"],
  ["#d98a10", "#f6cf73", "#fff1cf", "#b5650a"],
];

/** The project's screenshot, matching the portfolio theme when a dark capture exists. */
function Shot({ p }: { p: Project }) {
  const theme = useTheme();
  const src = theme === "dark" && p.imageDark ? p.imageDark : p.image;
  return src ? (
    <img key={src} src={src} alt="" loading="lazy" decoding="async" style={p.imagePos ? { objectPosition: p.imagePos } : undefined} />
  ) : (
    <div className="pj__ph" aria-hidden="true">
      {p.title.slice(0, 1)}
    </div>
  );
}

/**
 * A project: a framed screenshot that zooms out over a soft tinted backdrop
 * on hover, then title, blurb, tech marks and a "View project" action.
 * The frame morphs into a detail sheet (after Watermelon UI's expandable card).
 */
export default function ProjectCard({ p, i }: { p: Project; i: number }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  // Unique per card, so Projects and Highlights never share a morph id.
  const id = `pc${useId().replace(/:/g, "")}`;
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const palette = PALETTES[i % PALETTES.length];
  // Tech with a brand mark shows as an icon; the rest fold into a "+N" with the names on hover.
  const marked = p.tech.filter(hasTechIcon);
  const rest = p.tech.filter((t) => !hasTechIcon(t));

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    close.current?.focus({ preventScroll: true });
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      trigger.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const layout = reduce ? { duration: 0 } : motionTokens.spring.morph;

  return (
    <>
      <article className="pj">
        <motion.button layoutId={`frame-${id}`} transition={{ layout }} type="button" className="pj__frame" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`Open ${p.title} details`}>
          <span className="pj__backdrop" aria-hidden="true">
            <WaveArt variant={i} palette={palette} />
          </span>
          <span className="pj__shot">
            <Shot p={p} />
          </span>
        </motion.button>

        <motion.h3 layoutId={`title-${id}`} transition={{ layout }} className="pj__title">
          {p.title}
        </motion.h3>
        <p className="pj__blurb">{p.blurb}</p>
        <div className="pj__foot">
          <ul className="pj__tech" aria-label="Built with">
            {marked.map((t) => (
              <li key={t} title={t} style={{ "--brand": brandColor(t) } as CSSProperties}>
                <TechIcon name={t} size={15} />
                <span className="sr-only">{t}</span>
              </li>
            ))}
            {rest.length > 0 && (
              <li className="pj__extra" title={rest.join(", ")}>
                +{rest.length}
                <span className="sr-only">: {rest.join(", ")}</span>
              </li>
            )}
          </ul>
          <button ref={trigger} type="button" className="pj__view" onClick={() => setOpen(true)}>
            {p.viewLabel ?? "View project"} <ArrowUpRight size={14} />
          </button>
        </div>
      </article>

      {createPortal(
        <AnimatePresence>
          {open && (
            <div className="pc-sheet" role="dialog" aria-modal="true" aria-labelledby={`title-${id}-sheet`}>
              <motion.div className="pc-sheet__scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: motionTokens.duration.standard }} onClick={() => setOpen(false)} />
              <motion.div layoutId={`frame-${id}`} transition={{ layout }} className="pc-sheet__panel">
                <button ref={close} type="button" className="pc-sheet__close" onClick={() => setOpen(false)} aria-label="Close">
                  <X size={16} />
                </button>
                <div className="pc-sheet__media">
                  <span className="pj__backdrop" aria-hidden="true">
            <WaveArt variant={i} palette={palette} />
          </span>
                  <span className="pj__shot">
                    <Shot p={p} />
                  </span>
                </div>
                <div className="pc-sheet__body">
                  <motion.h3 layoutId={`title-${id}`} transition={{ layout }} id={`title-${id}-sheet`} className="pj__title">
                    {p.title}
                  </motion.h3>
                  <motion.div
                    className="pc-sheet__more"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }}
                    transition={{ ...motionTokens.spring.smooth, delay: reduce ? 0 : 0.08 }}
                  >
                    <p className="pj__blurb">{p.blurb}</p>
                    {p.highlight && <p className="pc-sheet__highlight">{p.highlight}</p>}
                    <p className="pc-sheet__label">Built with</p>
                    <ul className="chips">
                      {p.tech.map((t) => (
                        <li key={t}>
                          <Badge icon={hasTechIcon(t) ? <TechIcon name={t} size={14} /> : undefined}>{t}</Badge>
                        </li>
                      ))}
                    </ul>
                    {(p.site || p.code) && (
                      <div className="pc-sheet__actions">
                        {p.site && (
                          <ArcLink variant="primary" size="sm" href={p.site}>
                            <Globe size={15} /> {p.siteLabel ?? "Visit site"}
                          </ArcLink>
                        )}
                        {p.code && (
                          <ArcLink size="sm" href={p.code}>
                            <Code2 size={15} /> Source
                          </ArcLink>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
