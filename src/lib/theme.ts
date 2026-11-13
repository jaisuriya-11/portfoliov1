import { themeSound } from "./sound";
import { createStore, useStore } from "./store";

export type Theme = "light" | "dark";
/** What the visitor chose; "system" follows the OS setting. */
export type ThemePref = Theme | "system";

const STORAGE_KEY = "theme";
const root = document.documentElement;
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

function readPref(): ThemePref {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    if (t === "light" || t === "dark") return t;
  } catch {
    /* storage blocked */
  }
  return "system";
}

// index.html sets data-theme before first paint; read it back here.
export const themeStore = createStore<Theme>(root.dataset.theme === "dark" ? "dark" : "light");
export const themePrefStore = createStore<ThemePref>(readPref());

export const useTheme = () => useStore(themeStore);
export const useThemePref = () => useStore(themePrefStore);

function paint(next: Theme) {
  root.dataset.theme = next;
  root.style.colorScheme = next;
  themeStore.set(next);
}

function apply(next: Theme) {
  paint(next);
  themePrefStore.set(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage blocked — theme still applies for this visit */
  }
}

/** Light, dark, or follow the OS. */
export function setThemePref(pref: ThemePref) {
  const next: Theme = pref === "system" ? (systemDark.matches ? "dark" : "light") : pref;
  if (next !== themeStore.get()) themeSound(next);
  if (pref !== "system") return apply(pref);
  themePrefStore.set("system");
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked */
  }
  paint(systemDark.matches ? "dark" : "light");
}

systemDark.addEventListener("change", (e) => {
  if (themePrefStore.get() === "system") paint(e.matches ? "dark" : "light");
});

/**
 * Toggle theme. When the View Transitions API is available, the new theme
 * spreads out as a circle from the click point.
 */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = themeStore.get() === "dark" ? "light" : "dark";
  themeSound(next);
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
