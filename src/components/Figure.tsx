import { createSignal, Show } from "solid-js";

/**
 * Your own artwork, seated in the bottom of the right margin.
 *
 * Drop a black-on-white image at `public/figure.png`. It is blended so the
 * white paper disappears: in light mode the ink sits on the page as-is; in
 * dark mode it is inverted, so the ink becomes pale on black. Nothing renders
 * until the file exists.
 */
export default function Figure() {
  const [ok, setOk] = createSignal(true);
  return (
    <Show when={ok()}>
      <img class="figure" src="/figure.png" alt="" aria-hidden="true" decoding="async" onError={() => setOk(false)} />
    </Show>
  );
}
