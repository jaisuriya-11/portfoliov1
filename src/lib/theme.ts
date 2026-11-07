import { createSignal } from "solid-js";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const root = document.documentElement;

// index.html sets data-theme before first paint; read it back here.
const [theme, setThemeSignal] = createSignal<Theme>(root.dataset.theme === "dark" ? "dark" : "light");

function apply(next: Theme) {
  root.dataset.theme = next;
  root.style.colorScheme = next;
  setThemeSignal(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage blocked — theme still applies for this visit */
  }
}

/**
 * Toggle theme. When the View Transitions API is available, the new theme
 * spreads out as a circle from the click point.
 */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = theme() === "dark" ? "light" : "dark";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

  if (!doc.startViewTransition || reduce || !origin) {
    apply(next);
    return;
  }

  const { x, y } = origin;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = doc.startViewTransition(() => apply(next));
  t.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

export { theme };
