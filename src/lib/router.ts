import { createStore, useStore } from "./store";

/*
 * A tiny client-side router for "/", "/games", "/places" and "/anime".
 *  - Internal links are intercepted, so changing page never reloads the site
 *    (the sakura, sounds and theme carry on).
 *  - The change runs inside a View Transition where supported, so pages cross-fade.
 *  - Leaving home remembers the scroll position; coming back (via the Home link
 *    or the browser's back button) returns to exactly where you were.
 */

const clean = (p: string) => p.replace(/\/+$/, "") || "/";
const ROUTES = new Set(["/", "/games", "/places", "/anime"]);

export const pathStore = createStore(clean(window.location.pathname));
export const usePath = () => useStore(pathStore);

/** True right after returning to home, so its intro animation is skipped. */
export let returning = false;

const KEY = "home-scroll";

function swap(to: string, scroll: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const run = () => {
    pathStore.set(to);
    // Let React paint the new page, then position the scroll.
    requestAnimationFrame(scroll);
  };
  if (doc.startViewTransition && !reduce) {
    const root = document.documentElement;
    root.classList.add("vt-page");
    const t = doc.startViewTransition(run) as { finished?: Promise<void> };
    t.finished?.finally(() => root.classList.remove("vt-page"));
  } else run();
}

function go(to: string, push: boolean) {
  const from = pathStore.get();
  if (to === from) return;
  if (from === "/") {
    try {
      sessionStorage.setItem(KEY, String(window.scrollY));
    } catch {
      /* storage blocked */
    }
  }
  if (push) history.pushState(null, "", to);
  returning = to === "/";
  swap(to, () => {
    if (to === "/") {
      let y = 0;
      try {
        y = Number(sessionStorage.getItem(KEY) ?? 0);
      } catch {
        /* storage blocked */
      }
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    } else window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  });
}

export function navigate(to: string) {
  go(clean(to), true);
}

/** Intercept clicks on internal links and the browser's back/forward buttons. Returns a cleanup function. */
export function installRouter() {
  history.scrollRestoration = "manual";
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !ROUTES.has(clean(url.pathname)) || url.hash) return;
    e.preventDefault();
    navigate(url.pathname);
  };
  const onPop = () => go(clean(location.pathname), false);
  document.addEventListener("click", onClick);
  window.addEventListener("popstate", onPop);
  return () => {
    document.removeEventListener("click", onClick);
    window.removeEventListener("popstate", onPop);
  };
}
