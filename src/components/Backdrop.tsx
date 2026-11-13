import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { createSakura, type Sakura } from "../lib/sakura";
import { useSakura } from "../lib/settings";
import { themeStore } from "../lib/theme";
import "./Backdrop.css";
import Figure from "./Figure";

/** Selector for the content column; pointer events over it never reach the art. */
const CONTENT = ".column";
/** Things in the column that falling petals settle on. */
const SURFACES = [
  // Cards: the profile card, every section card, the quote, the index.
  ".column > .frame",
  ".column > .sec",
  ".column > .quote",
  ".index__inner",
  // Things inside them with a clear top edge.
  ".avatar",
  ".role__avatar",
  ".role__logo",
  ".pj__frame",
  ".skill",
  ".chips li",
  ".tool-btn",
  ".settings__btn",
  ".bio__actions > *",
  ".bio__socials > *",
  ".more button",
].join(", ");
/** Below this there are no side margins, so there is no garden at all (phones, small tablets). */
const WIDE = "(min-width: 1101px)";

/**
 * Ink cherry boughs growing in from both margins (behind the page, kept to
 * the gutters), and a separate petal layer that floats over everything —
 * including the middle column — without catching any clicks. Only on wide
 * screens, and only while the Sakura setting is on.
 */
export default function Backdrop({ contentWidth }: { contentWidth: number }) {
  const wide = useMediaQuery(WIDE);
  const on = useSakura();
  return wide && on ? <Garden contentWidth={contentWidth} /> : null;
}

function Garden({ contentWidth }: { contentWidth: number }) {
  const art = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  const fx = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Let the page load and paint first; grow the trees once the browser is idle.
    let garden: Sakura | undefined;
    let dead = false;
    const begin = () => {
      if (dead || !art.current || !front.current || !fx.current) return;
      garden = createSakura({
        art: art.current,
        front: front.current,
        fx: fx.current,
        contentWidth,
        contentSelector: CONTENT,
        surfaceSelector: SURFACES,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        dark: themeStore.get() === "dark",
      });
    };
    const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(begin, { timeout: 1200 }) : setTimeout(begin, 300));
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });

    const unsub = themeStore.subscribe(() => garden?.setDark(themeStore.get() === "dark"));
    return () => {
      dead = true;
      unsub();
      window.removeEventListener("load", idle);
      garden?.destroy();
    };
  }, [contentWidth]);

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <canvas ref={art} />
        <Figure />
      </div>
      <div className="vines" aria-hidden="true">
        <canvas ref={front} />
      </div>
      <div className="petals" aria-hidden="true">
        <canvas ref={fx} />
      </div>
    </>
  );
}
