import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Entry {
  id: string;
  title: string;
}

/**
 * Floating index (after Watermelon UI's Scroll Island): a pill at the bottom of
 * the screen with a ring that fills as you scroll, the section you're in, and
 * the overall progress. Clicking it opens the list of sections upward; picking one
 * scrolls there. Clicking outside, or Esc, closes it.
 */
export default function ScrollIsland() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState("");
  const [progress, setProgress] = useState(0);

  // Sections and the one currently being read.
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("section[data-index]")];
    setEntries(sections.map((s) => ({ id: s.id, title: s.dataset.index! })));
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) if (r.isIntersecting) setActive(r.target.id);
      },
      { rootMargin: "-35% 0px -64% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Page scroll progress.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = entries.find((e) => e.id === active);
  const go = (id: string) => {
    setOpen(false);
    // Scroll once the list has collapsed: changing layout mid-scroll cancels a smooth scroll.
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    }, reduce ? 0 : 300);
  };

  if (!entries.length) return null;

  return createPortal(
    <MotionConfig transition={reduce ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
      <AnimatePresence>
        {open && (
          <motion.div className="island__scrim" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} aria-hidden="true" />
        )}
      </AnimatePresence>

      <div className="island">
        <nav className={open ? "island__pill is-open" : "island__pill"} aria-label="Sections">
          <AnimatePresence initial={false}>
            {open && (
              <motion.ul className="island__list" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                {entries.map((e) => (
                  <li key={e.id}>
                    <button type="button" data-sec={e.id} className={e.id === active ? "is-active" : undefined} onClick={() => go(e.id)}>
                      <span className="island__dot" aria-hidden="true" />
                      {e.title}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
          <button type="button" className="island__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            <span className="island__ring" style={{ background: `conic-gradient(var(--fg) ${progress}%, var(--border) 0)` }} aria-hidden="true">
              <i />
            </span>
            <span className="island__current">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={current?.id ?? "top"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  {current?.title ?? "Index"}
                </motion.span>
              </AnimatePresence>
            </span>
            <motion.span className="island__chev" animate={{ rotate: open ? 180 : 0 }}>
              <ChevronDown size={16} />
            </motion.span>
            <span className="island__pct">{Math.round(progress)}%</span>
          </button>

        </nav>
      </div>
    </MotionConfig>,
    document.body,
  );
}
