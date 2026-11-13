import { useState } from "react";

/**
 * Your own artwork, seated in the bottom of the right margin.
 *
 * Drop a black-on-white image at `public/figure.png`. It is blended so the
 * white paper disappears: in light mode the ink sits on the page as-is; in
 * dark mode it is inverted, so the ink becomes pale on black. Nothing renders
 * until the file exists.
 */
export default function Figure() {
  const [ok, setOk] = useState(true);
  return ok ? <img className="figure" src="/figure.png" alt="" aria-hidden="true" decoding="async" onError={() => setOk(false)} /> : null;
}
