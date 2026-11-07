import { createEffect, on, onCleanup, onMount } from "solid-js";
import { theme } from "../lib/theme";

/**
 * The 3D pagoda in the left margin, with its courtyard, clouds and sun/moon.
 * Three.js is loaded on demand so it never delays the rest of the page.
 */
export default function Pagoda3D() {
  let host!: HTMLCanvasElement;
  onMount(() => {
    let destroyed = false;
    let api: { setDark(d: boolean): void; destroy(): void } | undefined;
    import("../lib/pagoda3d").then(({ createPagoda3D }) => {
      if (destroyed) return;
      api = createPagoda3D(host, {
        dark: theme() === "dark",
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        contentWidth: 800,
      });
      host.classList.add("is-ready");
    });
    createEffect(on(theme, (t) => api?.setDark(t === "dark"), { defer: true }));
    onCleanup(() => {
      destroyed = true;
      api?.destroy();
    });
  });
  return <canvas ref={host} class="pagoda3d" aria-hidden="true" />;
}
