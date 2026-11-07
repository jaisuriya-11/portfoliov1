import { createEffect, createSignal, on, onCleanup, onMount, Show } from "solid-js";
import { createSakura } from "../lib/sakura";
import { theme } from "../lib/theme";
import "./Backdrop.css";
import Figure from "./Figure";

/** Selector for the content column; pointer events over it never reach the art. */
const CONTENT = ".column";
/** Below this there are no side margins, so there is no garden at all (phones, small tablets). */
const WIDE = "(min-width: 1101px)";
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Ink cherry boughs growing in from both margins (behind the page, kept to
 * the gutters), and a separate petal layer that floats over everything —
 * including the middle column — without catching any clicks. Only on wide
 * screens; on narrow ones nothing is drawn or animated.
 */
export default function Backdrop(props: { contentWidth: number }) {
  const mq = window.matchMedia(WIDE);
  const [wide, setWide] = createSignal(mq.matches);
  const onChange = (e: MediaQueryListEvent) => setWide(e.matches);
  mq.addEventListener("change", onChange);
  onCleanup(() => mq.removeEventListener("change", onChange));

  return (
    <Show when={wide()}>
      <Garden contentWidth={props.contentWidth} />
    </Show>
  );
}

function Garden(props: { contentWidth: number }) {
  let art!: HTMLCanvasElement;
  let fx!: HTMLCanvasElement;

  onMount(() => {
    const garden = createSakura({ art, fx, contentWidth: props.contentWidth, contentSelector: CONTENT, reducedMotion: reducedMotion(), dark: theme() === "dark" });
    createEffect(on(theme, (t) => garden.setDark(t === "dark"), { defer: true }));
    onCleanup(() => garden.destroy());
  });

  return (
    <>
      <div class="backdrop" aria-hidden="true">
        <canvas ref={art} />
        <Figure />
      </div>
      <div class="petals" aria-hidden="true">
        <canvas ref={fx} />
      </div>
    </>
  );
}
