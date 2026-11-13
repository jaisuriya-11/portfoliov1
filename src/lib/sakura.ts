/**
 * Sakura — ink cherry boughs growing in from both margins.
 *
 * Branches are stroked in dark ink (outline pass, then fill pass, so joints
 * merge cleanly). Blossoms are opaque five-petal
 * flowers in crimson-to-pink on short twigs, with red buds.
 *
 * Growth is natural: boughs enter from the margin, lean toward the light,
 * zig-zag hard at knots, fork and taper; blossoms open as the branch reaches
 * them. The tree is kept as data and repainted while anything grows, then
 * left still.
 *
 * Nature, not effects:
 *   - nothing falls on its own: petals only come loose when the cursor (or a
 *     finger) brushes or taps the blossoms, then fall under gravity and drift
 *     on a slow breeze;
 *   - the cursor is wind: petals near it are carried along its motion, and
 *     sweeping through blossoms shakes petals loose in that direction;
 *   - petals that fall onto the column's buttons and cards come to rest on
 *     their top edges (and ride along as the page scrolls); sweep the cursor
 *     over them and they lift off again;
 *   - scrolling moves the surfaces under them, with inertia: a surface that
 *     drops away fast leaves its petals floating, one that rises and stops
 *     sharply tosses them up, and any jolt makes them slide and wobble;
 *   - a click is a gust: nearby blossoms shed a flurry, and the nearest
 *     branch sends out a new twig that grows up and outward, then flowers.
 *
 * Depth: where a bough reaches the content column it splits. One limb bends
 * down and carries on *behind* the column (the back canvas is masked at the
 * column edge, so it vanishes under the paper); the other rises and grows
 * *over* the column's edge on the front canvas, then curls back out before
 * it reaches the text.
 */

export interface SakuraOptions {
  art: HTMLCanvasElement;
  /** Unmasked canvas above the page, for limbs that grow over the column. */
  front: HTMLCanvasElement;
  fx: HTMLCanvasElement;
  contentWidth: number;
  contentSelector: string;
  /** Elements in the column that falling petals can land on. */
  surfaceSelector: string;
  reducedMotion: boolean;
  dark: boolean;
}

export interface Sakura {
  setDark(dark: boolean): void;
  /** Current wind from the cursor (px/s), for other scene elements to follow. */
  wind(): { vx: number; vy: number };
  destroy(): void;
}

interface Palette {
  ink: string;
  bark: string;
  petals: string[];
  petalLine: string;
  bud: string;
}
const LIGHT: Palette = {
  ink: "#1b1714",
  bark: "#3a302a",
  petals: ["#b8263f", "#cf3a50", "#e0566a", "#ec8296", "#f3a9b6"],
  petalLine: "#7e1428",
  bud: "#9e1c33",
};
const DARK: Palette = {
  ink: "#a89a8a",
  bark: "#d6cdc0",
  // Slightly dimmed (less saturated) so the trees don't glare on black.
  petals: ["#8e3a47", "#9a4c58", "#a5636f", "#ad808a", "#b49ba1"],
  petalLine: "#3e1419",
  bud: "#7e3340",
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const UP = -Math.PI / 2;
const DOWN = Math.PI / 2;
/** How far a front limb may reach into the column before curling back out. */
const OVER_SOFT = 10;
const OVER_HARD = 30;
/** Front limbs per side, so the column is never overgrown. */
const OVER_MAX = 8;
const TAU = Math.PI * 2;
/** Signed shortest turn from a to b. */
const turn = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const STEP = 2; // px per growth step

interface SpinePt {
  x: number;
  y: number;
  r: number;
  /** Edge noise, left and right, so the outline is ragged like a dry brush. */
  jl: number;
  jr: number;
}

interface Bough {
  pts: SpinePt[];
  knots: Array<{ x: number; y: number; r: number; seed: number }>;
  x: number;
  y: number;
  angle: number;
  life: number;
  total: number;
  width: number;
  speed: number;
  acc: number;
  nextNode: number;
  nextKink: number;
  depth: number;
  forks: number;
  growing: boolean;
  /** 0 = behind the column, 1 = over it. */
  layer: Layer;
  /** Which margin it belongs to. */
  left: boolean;
  /** Already split at the column edge. */
  split: boolean;
}

type Layer = 0 | 1;

interface Flower {
  kind: "blossom" | "bud";
  x: number;
  y: number;
  r: number;
  rot: number;
  color: number;
  delay: number;
  t: number;
  dur: number;
  jitter: number[];
  layer: Layer;
}

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vrot: number;
  flip: number;
  vflip: number;
  phase: number;
  color: number;
  /** Element the petal is resting on, with its offset from the element's left edge. */
  on: Element | null;
  dx: number;
  /** Seconds since it landed. */
  settle: number;
  /** Sliding speed along the surface after touchdown (px/s), easing to rest. */
  slide: number;
  /** Rocking amplitude (radians) and the angle it comes to rest at. */
  rock: number;
  restRot: number;
  /** 0 = tumbling in the air, 1 = lying flat (foreshortened). */
  flat: number;
  /** Seconds before it may land again (just brushed off). */
  skip: number;
  /** Order it landed in, so the oldest gives way first. */
  landed: number;
}

/** At most this many petals rest on the page at once. */
const REST_MAX = 40;

export function createSakura(opts: SakuraOptions): Sakura {
  const art = opts.art.getContext("2d")!;
  const front = opts.front.getContext("2d")!;
  /** Context currently being painted (back or front). */
  let g = art;
  const fx = opts.fx.getContext("2d")!;
  let pal = opts.dark ? DARK : LIGHT;
  let W = 0;
  let H = 0;
  let boughs: Bough[] = [];
  let flowers: Flower[] = [];
  let petals: Petal[] = [];
  let nodes: Array<{ x: number; y: number; angle: number; layer: Layer; left: boolean }> = [];
  let col: [number, number] = [0, 0];
  /** The column's real edges; limbs split where they meet them. */
  let edge: [number, number] = [0, 0];
  let over = { left: 0, right: 0 };
  let raf = 0;
  let last = 0;
  let destroyed = false;
  let breezeT = 0;
  /** Per-load character: how readily boughs fork, and how thickly they flower. */
  let forkRate = 0.0145;
  let bloom = 1;
  let dirty = true;
  let fxDrawn = true;
  let paintWait = 0;
  let growingNow = false;

  // ─────────────────────────────── painting ────────────────────────────────

  /** Stroke a bough as round-capped segments, batching runs of similar width. */
  function strokeBough(b: Bough, extra: number, color: string) {
    g.strokeStyle = color;
    g.lineCap = "round";
    g.lineJoin = "round";
    const P = b.pts;
    for (let i = 1; i < P.length; ) {
      const w = P[i].r * 2 + extra;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(P[i - 1].x, P[i - 1].y);
      while (i < P.length && Math.abs(P[i].r * 2 + extra - w) < 0.4) {
        g.lineTo(P[i].x, P[i].y);
        i++;
      }
      g.stroke();
    }
  }

  function paintBlossom(f: Flower, p: number) {
    const r = f.r * (0.3 + 0.7 * p);
    g.lineWidth = 0.8;
    g.lineJoin = "round";
    g.fillStyle = pal.petals[f.color];
    g.strokeStyle = pal.petalLine;
    for (let i = 0; i < 5; i++) {
      const a = f.rot + (i / 5) * TAU + f.jitter[i] * 0.3;
      const L = r * (0.85 + f.jitter[i + 5] * 0.3);
      const w = L * 0.62;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const P = (u: number, v: number): [number, number] => [f.x + u * ca - v * sa, f.y + u * sa + v * ca];
      g.beginPath();
      g.moveTo(...P(L * 0.1, 0));
      g.bezierCurveTo(...P(L * 0.3, -w), ...P(L * 0.95, -w * 0.9), ...P(L, -w * 0.15));
      g.lineTo(...P(L * 0.82, 0));
      g.lineTo(...P(L, w * 0.15));
      g.bezierCurveTo(...P(L * 0.95, w * 0.9), ...P(L * 0.3, w), ...P(L * 0.1, 0));
      g.closePath();
      g.fill();
      g.stroke();
    }
    if (p < 0.6) return;
    g.fillStyle = pal.petalLine;
    g.beginPath();
    g.arc(f.x, f.y, Math.max(1, f.r * 0.18), 0, TAU);
    g.fill();
  }

  function paintBud(f: Flower, p: number) {
    const r = f.r * (0.4 + 0.6 * p);
    g.fillStyle = pal.bud;
    g.beginPath();
    g.ellipse(f.x, f.y, r, r * 0.75, f.rot, 0, TAU);
    g.fill();
  }

  /**
   * Caches, per layer: finished boughs' ink outlines, their bark fills, and
   * fully open flowers. Each is painted once and composited with drawImage in
   * the same order as a full repaint (outlines → fills → flowers), so a frame
   * only redraws what is still growing or opening. They are released once the
   * tree stops growing and rebuilt on demand.
   */
  type Cache = { c: HTMLCanvasElement; g: CanvasRenderingContext2D };
  const mk = (): Cache => {
    const c = document.createElement("canvas");
    return { c, g: c.getContext("2d")! };
  };
  const caches = [0, 1].map(() => ({ ink: mk(), bark: mk(), bloom: mk() }));
  let baked = new WeakSet<Flower | Bough>();
  let cachesLive = false;
  let dpr = 1;

  function paintFlower(f: Flower) {
    const p = Math.min(1, f.t / f.dur);
    const e = 1 - (1 - p) ** 3;
    if (f.kind === "blossom") paintBlossom(f, e);
    else paintBud(f, e);
  }

  /** Allocate (or clear) the caches; everything will be re-baked. */
  function resetBake() {
    for (const set of caches)
      for (const k of [set.ink, set.bark, set.bloom]) {
        k.c.width = Math.round(W * dpr);
        k.c.height = Math.round(H * dpr);
        k.g.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    baked = new WeakSet();
    cachesLive = true;
  }

  /** Free the cache memory; the next render re-allocates them if needed. */
  function releaseBake() {
    for (const set of caches) for (const k of [set.ink, set.bark, set.bloom]) k.c.width = k.c.height = 0;
    cachesLive = false;
  }

  /**
   * Limbs over the column cast a soft shadow on the page, drawn in the canvas
   * itself: a CSS drop-shadow on a full-screen layer is re-filtered every frame.
   */
  function shade(ctx: CanvasRenderingContext2D, on: boolean) {
    ctx.shadowColor = on ? (pal === DARK ? "rgba(0,0,0,0.7)" : "rgba(40,20,10,0.22)") : "transparent";
    ctx.shadowBlur = on ? 4 : 0;
    ctx.shadowOffsetY = on ? 3 : 0;
  }

  function renderLayer(layer: Layer) {
    if (!cachesLive) resetBake();
    const set = caches[layer];
    const front1 = layer === 1;

    // Bake whatever has finished since the last paint.
    for (const b of boughs) {
      if (b.layer !== layer || b.growing || baked.has(b)) continue;
      g = set.ink.g;
      shade(g, front1);
      strokeBough(b, 1.6, pal.ink);
      g = set.bark.g;
      strokeBough(b, 0, pal.bark);
      baked.add(b);
    }
    g = set.bloom.g;
    shade(g, front1);
    for (const f of flowers) {
      if (f.layer !== layer || baked.has(f) || f.delay > 0 || f.t < f.dur) continue;
      paintFlower(f);
      baked.add(f);
    }

    // Composite: outlines, then fills, then flowers — the same order as a full repaint.
    g = layer ? front : art;
    g.clearRect(0, 0, W, H);
    shade(g, false);
    g.drawImage(set.ink.c, 0, 0, W, H);
    shade(g, front1);
    for (const b of boughs) if (b.layer === layer && !baked.has(b)) strokeBough(b, 1.6, pal.ink);
    shade(g, false);
    g.drawImage(set.bark.c, 0, 0, W, H);
    for (const b of boughs) if (b.layer === layer && !baked.has(b)) strokeBough(b, 0, pal.bark);
    g.drawImage(set.bloom.c, 0, 0, W, H);
    shade(g, front1);
    for (const f of flowers) if (f.layer === layer && !baked.has(f) && f.delay <= 0) paintFlower(f);
    shade(g, false);
  }

  /** Which layers changed since the last paint. */
  const layerDirty: [boolean, boolean] = [true, true];

  function render(all = false) {
    for (const l of [0, 1] as const) {
      if (!all && !layerDirty[l]) continue;
      layerDirty[l] = false;
      renderLayer(l);
    }
  }

  /** Repaint everything from scratch (palette change). */
  function repaintAll() {
    resetBake();
    render(true);
    if (!growingNow) releaseBake();
  }

  // ─────────────────────────────── growth ──────────────────────────────────

  function addFlower(x: number, y: number, a: number, big: boolean, delay: number, layer: Layer) {
    const bud = !big && Math.random() < 0.25;
    flowers.push({
      kind: bud ? "bud" : "blossom",
      x,
      y,
      r: bud ? rand(3.5, 5) : big ? rand(13, 17) : rand(9, 13),
      rot: bud ? a : rand(0, TAU),
      color: Math.floor(Math.pow(Math.random(), 1.4) * 5),
      delay,
      t: 0,
      dur: rand(0.4, 0.8),
      jitter: Array.from({ length: 10 }, () => Math.random() - 0.5),
      layer,
    });
  }

  /** A node: short twigs each ending in a blossom or bud, facing the light. */
  function cluster(x: number, y: number, angle: number, big: boolean, parent: Bough) {
    const n = big ? 3 : Math.round(rand(1, 3));
    for (let i = 0; i < n; i++) {
      let a = angle + (i % 2 ? 1 : -1) * rand(0.5, 1.2);
      a += turn(a, UP) * 0.25;
      const L = rand(10, 22);
      const pts: SpinePt[] = [];
      for (let k = 0; k <= 4; k++) {
        const t = k / 4;
        pts.push({ x: x + Math.cos(a + (t - 0.5) * 0.3) * L * t, y: y + Math.sin(a + (t - 0.5) * 0.3) * L * t, r: 1.1 * (1 - t * 0.4), jl: 0, jr: 0 });
      }
      boughs.push({ pts, knots: [], x, y, angle: a, life: 0, total: 1, width: 1, speed: 0, acc: 0, nextNode: 0, nextKink: 0, depth: 9, forks: 0, growing: false, layer: parent.layer, left: parent.left, split: true });
      const end = pts[pts.length - 1];
      addFlower(end.x + Math.cos(a) * 3, end.y + Math.sin(a) * 3, a, big && i === 0, i * 0.12, parent.layer);
    }
  }

  function bough(x: number, y: number, angle: number, length: number, width: number, depth: number, layer: Layer = 0, left = x < W / 2): Bough {
    return { pts: [{ x, y, r: width, jl: 0, jr: 0 }], knots: [], x, y, angle, life: length, total: length, width, speed: rand(110, 140), acc: 0, nextNode: rand(26, 44), nextKink: rand(20, 45), depth, forks: 0, growing: true, layer, left, split: layer === 1 };
  }

  /** How far past its own column edge a point is (negative while still in the margin). */
  const inside = (b: Bough, x: number) => (b.left ? x - edge[0] : edge[1] - x);

  /**
   * At the column edge a back bough splits: a limb rises over the column on
   * the front layer, and the bough itself turns downward and slips behind.
   */
  function splitAtEdge(b: Bough, r: number) {
    b.split = true;
    const side = b.left ? "left" : "right";
    if (over[side] < OVER_MAX && b.life > 16) {
      over[side]++;
      const a = b.angle + turn(b.angle, UP) * rand(0.45, 0.7);
      const limb = bough(b.x, b.y, a, Math.max(36, Math.min(b.life * rand(0.55, 0.8), 190)), Math.max(1.2, r * 0.85), b.depth + 1, 1, b.left);
      limb.pts[0].r = r;
      limb.nextNode = rand(14, 24);
      boughs.push(limb);
    }
    b.angle += turn(b.angle, DOWN) * rand(0.35, 0.55);
    b.life = Math.min(b.life, 70);
  }

  function stepBough(b: Bough): boolean {
    const f = 1 - b.life / b.total;
    const r = Math.max(0.9, b.width * (1 - f * 0.85));
    b.angle += turn(b.angle, UP) * 0.004 * (1 + b.depth);
    b.angle += rand(-0.03, 0.03);
    if ((b.nextKink -= STEP) <= 0) {
      b.angle += rand(-0.45, 0.45);
      b.nextKink = rand(30, 65);
    }
    b.x += Math.cos(b.angle) * STEP;
    b.y += Math.sin(b.angle) * STEP;
    b.life -= STEP;
    b.pts.push({ x: b.x, y: b.y, r, jl: 0, jr: 0 });

    if (b.layer === 1) {
      // Over the column: reach in a little, then curl back out to the margin.
      const d = inside(b, b.x);
      if (d > OVER_SOFT) b.angle += turn(b.angle, b.left ? Math.PI : 0) * 0.12 * ((d - OVER_SOFT) / (OVER_HARD - OVER_SOFT) + 0.3);
      if (d > OVER_HARD) b.life = Math.min(b.life, 0);
    } else if (!b.split && edge[1] > edge[0] && inside(b, b.x) > -4) {
      splitAtEdge(b, r);
    }

    if (Math.random() < STEP / 12) nodes.push({ x: b.x, y: b.y, angle: b.angle, layer: b.layer, left: b.left });
    if ((b.nextNode -= STEP) <= 0) {
      if (f > 0.15 || b.layer === 1) cluster(b.x, b.y, b.angle, false, b);
      b.nextNode = (f > 0.6 ? rand(20, 32) : rand(28, 50)) / bloom;
    }
    if (b.depth < 3 && b.forks < 5 - b.depth && b.life > 50 && Math.random() < STEP * forkRate) {
      b.forks++;
      boughs.push(bough(b.x, b.y, b.angle + pick([-1, 1]) * rand(0.45, 0.95), b.life * rand(0.4, 0.75), r * 0.7, b.depth + 1, b.layer, b.left));
    }
    if (b.life <= 0 || b.x < -40 || b.x > W + 40 || b.y < -40 || b.y > H + 40) {
      if (b.life <= 0) cluster(b.x, b.y, b.angle, true, b);
      return false;
    }
    return true;
  }

  function tickGrowth(dt: number): boolean {
    let busy = false;
    for (let i = 0; i < boughs.length; i++) {
      const b = boughs[i];
      if (!b.growing) continue;
      busy = true;
      layerDirty[b.layer] = true;
      b.acc += b.speed * dt;
      while (b.acc >= STEP && b.growing) {
        b.acc -= STEP;
        b.growing = stepBough(b);
      }
    }
    for (const f of flowers) {
      if (f.delay > 0) {
        f.delay -= dt;
        busy = true;
        if (f.delay <= 0) layerDirty[f.layer] = true;
      } else if (f.t < f.dur) {
        f.t += dt;
        busy = true;
        layerDirty[f.layer] = true;
      }
    }
    return busy;
  }

  /**
   * A fresh arrangement every load: each side gets 1–3 boughs, each entering
   * from the side edge, rising from the bottom corner, or hanging from the top;
   * angles, lengths and thickness vary, and the whole tree gets its own
   * bushiness and bloom density.
   */
  function compose() {
    const gutter = Math.max(0, (W - opts.contentWidth) / 2);
    const wide = gutter > 150;
    const band = wide ? gutter : W * 0.3;
    col = wide ? [gutter - 20, W - gutter + 20] : [W / 2, W / 2];
    edge = wide ? [gutter, W - gutter] : [0, 0];
    over = { left: 0, right: 0 };
    const len = Math.min(H * 1.05, 900);
    const thick = (wide ? Math.min(3.6, band / 90) : 2.6) * rand(0.85, 1.25);
    forkRate = rand(0.012, 0.019);
    bloom = rand(0.75, 1.3);

    type Entry = "side" | "bottom" | "top";
    for (const left of [true, false]) {
      const count = wide ? pick([1, 2, 2, 3]) : 1;
      const used = new Set<Entry>();
      for (let i = 0; i < count; i++) {
        let entry: Entry = pick(["side", "side", "bottom", "top"] as const);
        if (used.has(entry)) entry = pick((["side", "bottom", "top"] as const).filter((e) => !used.has(e)));
        used.add(entry);
        const main = i === 0;
        const w = thick * (main ? rand(0.85, 1.1) : rand(0.5, 0.75));
        const l = len * (main ? rand(0.75, 1) : rand(0.45, 0.7));
        let x: number;
        let y: number;
        let a: number; // angle as if on the left side; mirrored for the right
        if (entry === "side") {
          x = -10;
          y = H * rand(0.25, 0.85);
          a = rand(-0.8, -0.1);
        } else if (entry === "bottom") {
          x = band * rand(0.05, 0.45);
          y = H + 10;
          a = -Math.PI / 2 + rand(0.15, 0.6);
        } else {
          x = band * rand(0.05, 0.5);
          y = -10;
          a = rand(0.25, 0.9);
        }
        boughs.push(bough(left ? x : W - x, y, left ? a : Math.PI - a, l, w, main ? 0 : 1));
      }
    }
  }

  // ─────────────────────────────── petals ──────────────────────────────────

  function shed(x: number, y: number, vx: number, vy: number) {
    if (petals.length - resting > 20) return;
    petals.push({ x, y, vx, vy, r: rand(3.5, 6), rot: rand(0, TAU), vrot: rand(-2, 2), flip: rand(0, TAU), vflip: rand(2, 4), phase: rand(0, TAU), color: Math.floor(Math.random() * 5), on: null, dx: 0, settle: 0, slide: 0, rock: 0, restRot: 0, flat: 0, skip: 0, landed: 0 });
  }

  function drawPetal(p: Petal) {
    fx.save();
    fx.translate(p.x, p.y);
    // Lying on a surface, the petal is seen edge-on: squash it vertically.
    if (p.flat > 0.01) fx.scale(1, 1 - 0.5 * p.flat);
    fx.rotate(p.rot);
    fx.scale(0.3 + 0.7 * Math.abs(Math.cos(p.flip)), 1);
    const r = p.r;
    fx.beginPath();
    fx.moveTo(0, r);
    fx.bezierCurveTo(r * 0.95, r * 0.45, r * 0.75, -r * 0.75, r * 0.22, -r);
    fx.lineTo(0, -r * 0.72);
    fx.lineTo(-r * 0.22, -r);
    fx.bezierCurveTo(-r * 0.75, -r * 0.75, -r * 0.95, r * 0.45, 0, r);
    fx.fillStyle = pal.petals[p.color];
    fx.fill();
    fx.restore();
  }

  // ─────────────────────────────── surfaces ────────────────────────────────

  interface Surface {
    el: Element;
    l: number;
    r: number;
    top: number;
    bottom: number;
    /** Vertical screen velocity (px/s, + = moving down) and last frame's. */
    v: number;
    vPrev: number;
  }
  /** Surfaces in document coordinates; re-measured only when layout can have changed. */
  let docSurfaces: Array<{ el: Element; l: number; r: number; top: number; bottom: number }> = [];
  let surfaces: Surface[] = [];
  let layoutDirty = true;
  let surfaceAge = 0;
  let lastScroll = window.scrollY;
  let scrollV = 0;
  let resting = 0;
  let landings = 0;
  // Page height changes (a role expands, images load): measure again on the next frame.
  const layoutWatch = new ResizeObserver(() => (layoutDirty = true));
  layoutWatch.observe(document.body);

  /**
   * Visible landing spots. Layout is read only when it may have changed (and
   * at most once a second otherwise); each frame just offsets the cached
   * rectangles by the scroll position, so scrolling never forces a layout.
   */
  function measureSurfaces(dt: number) {
    if (layoutDirty || (surfaceAge += dt) > 1.5) {
      layoutDirty = false;
      surfaceAge = 0;
      const sy = window.scrollY;
      docSurfaces = [];
      for (const el of document.querySelectorAll(opts.surfaceSelector)) {
        // Skip things inside a collapsed experience row; they are hidden.
        if (el.closest(".split__panel") && !el.closest(".split__item[data-open]")) continue;
        const b = el.getBoundingClientRect();
        if (b.width < 12 || b.height < 8) continue;
        docSurfaces.push({ el, l: b.left, r: b.right, top: b.top + sy, bottom: b.bottom + sy });
      }
    }
    const sy = window.scrollY;
    const vPrev = scrollV;
    // Screen velocity of everything on the page: + when it moves down (scrolling up).
    scrollV = dt > 0 ? vPrev * 0.4 + (-(sy - lastScroll) / dt) * 0.6 : 0;
    lastScroll = sy;
    surfaces = [];
    for (const d of docSurfaces) {
      const top = d.top - sy;
      const bottom = d.bottom - sy;
      if (bottom < 0 || top > H) continue;
      surfaces.push({ el: d.el, l: d.l, r: d.r, top, bottom, v: scrollV, vPrev });
    }
  }

  function land(p: Petal, s: Surface) {
    p.on = s.el;
    p.dx = p.x - s.l;
    p.settle = 0;
    // Keep some of the drift as a slide along the edge; friction stops it.
    p.slide = p.vx * 0.55 + Math.sin(p.rot) * 12;
    // Land lying along the edge, on whichever side it was already leaning.
    p.restRot = (Math.cos(p.rot) > 0 ? 1 : -1) * (Math.PI / 2) + rand(-0.18, 0.18);
    p.rot = p.restRot + turn(p.restRot, p.rot) * 0.6;
    p.rock = rand(0.25, 0.5) * (Math.random() < 0.5 ? -1 : 1);
    p.vx = p.vy = 0;
    p.landed = ++landings;
    resting++;
    if (resting > REST_MAX) {
      let oldest: Petal | null = null;
      for (const q of petals) if (q.on && (!oldest || q.landed < oldest.landed)) oldest = q;
      if (oldest) lift(oldest, rand(-20, 20), rand(-30, -10));
    }
  }

  function lift(p: Petal, vx: number, vy: number) {
    if (!p.on) return;
    p.on = null;
    resting--;
    p.vx = vx;
    p.vy = vy;
    p.vrot = rand(-6, 6);
    p.vflip = rand(4, 8);
    p.skip = 0.7;
  }

  /** Resting petal: sits on its element's top edge; the cursor sweeping by lifts it off. */
  function tickResting(p: Petal, dt: number): boolean {
    const s = surfaces.find((q) => q.el === p.on);
    if (!s) {
      // Element scrolled away or hidden: keep the petal only while its element still exists.
      if (!p.on!.isConnected) {
        lift(p, 0, 0);
        return false;
      }
      p.y = -999; // off-screen with its element; not drawn
      return true;
    }
    // Scrolling moves the surface under the petal; the petal has inertia.
    const heavy = 240 + p.r * 30; // bigger petals cling a little better
    if (s.v > heavy) {
      // Surface drops away faster than the petal can fall: it floats off.
      lift(p, p.slide + rand(-40, 40), s.v * rand(0.15, 0.3));
      return true;
    }
    if (s.vPrev < -heavy && s.v > s.vPrev * 0.35) {
      // Surface was rising and stopped sharply: the petal keeps going up.
      lift(p, p.slide + rand(-60, 60), s.vPrev * rand(0.25, 0.4) - rand(20, 60));
      return true;
    }
    const jolt = Math.abs(s.v - s.vPrev);
    if (jolt > 60) {
      // Smaller jolts: it skids along the edge and starts rocking again.
      p.slide += rand(-1, 1) * Math.min(jolt, 600) * 0.12;
      p.settle = Math.min(p.settle, 0.15);
      p.rock = Math.sign(p.rock || 1) * Math.min(0.6, Math.abs(p.rock) + jolt * 0.0006);
    }

    const t = (p.settle += dt);
    // Slide with friction; past the end of the element it tips off and falls.
    p.dx += p.slide * dt;
    p.slide *= Math.exp(-dt * 3.2);
    if (p.dx < -p.r * 0.4 || p.dx > s.r - s.l + p.r * 0.4) {
      lift(p, p.slide, 10);
      return true;
    }
    p.x = s.l + p.dx;
    // Touchdown: a soft, quickly damped bounce, then it lies on the edge.
    const bounce = Math.abs(Math.sin(t * 11)) * Math.exp(-t * 7) * 3;
    p.flat = Math.min(1, p.flat + dt * 4);
    p.y = s.top - p.r * (1 - 0.5 * p.flat) * 0.32 - bounce;
    // Rocks like a leaf finding its balance, settling to its resting angle.
    p.rot += (p.restRot + p.rock * Math.exp(-t * 3) * Math.cos(t * 8) - p.rot) * Math.min(1, dt * 14);
    // Stop the 3D tumble on its nearest face.
    p.flip += (Math.PI * Math.round(p.flip / Math.PI) - p.flip) * Math.min(1, dt * 7);

    if (pointer.active) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const speed = Math.hypot(pointer.vx, pointer.vy);
      if (dx * dx + dy * dy < 34 * 34 && speed > 70) {
        lift(p, pointer.vx * 0.45 + dx * 2 + rand(-20, 20), Math.min(pointer.vy * 0.3, 0) - rand(60, 120));
      }
    }
    return true;
  }

  function tickPetals(dt: number, t: number) {
    measureSurfaces(dt);
    breezeT += dt;
    // A slow breeze, gusting now and then.
    const breeze = 22 + Math.sin(breezeT * 0.3) * 10 + Math.max(0, Math.sin(breezeT * 0.11)) ** 4 * 45;
    const damp = 1 - Math.exp(-dt * 1.2);
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      if (p.on) {
        if (tickResting(p, dt)) {
          if (p.on) drawPetal(p);
          continue;
        }
      }
      const prevY = p.y;
      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 100 * 100) {
          const k = (1 - Math.sqrt(d2) / 100) * dt * 3;
          p.vx += (pointer.vx * 0.8 - p.vx) * k;
          p.vy += (pointer.vy * 0.8 - p.vy) * k;
        }
      }
      p.vx += (breeze - p.vx) * damp * 0.5;
      p.vy += (30 - p.vy) * damp * 0.7;
      p.x += (p.vx + Math.sin(t * 2 + p.phase) * 14) * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      p.flip += p.vflip * dt;
      p.flat *= Math.exp(-dt * 5);
      p.skip -= dt;
      // Falling onto a button or card: every petal that crosses its top edge lands.
      if (p.skip <= 0 && p.vy > 0) {
        for (const s of surfaces) {
          if (p.x > s.l + 3 && p.x < s.r - 3 && prevY < s.top && p.y >= s.top - 1) {
            land(p, s);
            break;
          }
        }
        if (p.on) {
          drawPetal(p);
          continue;
        }
      }
      if (p.y > H + 10 || p.x > W + 15 || p.x < -15) {
        petals.splice(i, 1);
        continue;
      }
      drawPetal(p);
    }
  }

  // ─────────────────────────────── pointer ─────────────────────────────────

  const pointer = { x: -999, y: -999, vx: 0, vy: 0, t: 0, active: false };

  function onMove(e: PointerEvent) {
    const now = performance.now();
    if (pointer.active) {
      const dt = Math.max(1 / 240, (now - pointer.t) / 1000);
      pointer.vx = pointer.vx * 0.6 + ((e.clientX - pointer.x) / dt) * 0.4;
      pointer.vy = pointer.vy * 0.6 + ((e.clientY - pointer.y) / dt) * 0.4;
    }
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.t = now;
    pointer.active = true;
  }
  const onLeave = () => {
    pointer.active = false;
  };

  function onDown(e: PointerEvent) {
    if ((e.target as Element | null)?.closest?.(opts.contentSelector)) return;
    const x = e.clientX;
    const y = e.clientY;
    const gx = pointer.vx * 0.15 || rand(-30, 30);
    const gy = pointer.vy * 0.15;
    let count = 0;
    for (const f of flowers) {
      if (f.kind !== "blossom" || f.t < f.dur) continue;
      if (Math.hypot(f.x - x, f.y - y) < 130 && count < 14) {
        for (let i = 0; i < 2; i++, count++) shed(f.x + rand(-3, 3), f.y + rand(-3, 3), gx + (f.x - x) * 0.6 + rand(-15, 15), gy + (f.y - y) * 0.3 + rand(-25, 5));
      }
    }
    let best: (typeof nodes)[number] | null = null;
    let bd = 150;
    for (const n of nodes) {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < bd) {
        bd = d;
        best = n;
      }
    }
    if (best && boughs.filter((b) => b.growing).length < 20) {
      const side = Math.sign(x - best.x) || pick([-1, 1]);
      const a = best.angle + side * rand(0.4, 0.8);
      boughs.push(bough(best.x, best.y, a + turn(a, UP) * 0.3, rand(40, 90), 1.8, 3, best.layer, best.left));
      dirty = true;
    }
  }

  function brush(dt: number) {
    if (!pointer.active) return;
    pointer.vx *= Math.exp(-dt * 6);
    pointer.vy *= Math.exp(-dt * 6);
    const speed = Math.hypot(pointer.vx, pointer.vy);
    if (speed < 120 || (pointer.x > col[0] && pointer.x < col[1])) return;
    for (const f of flowers) {
      if (f.kind !== "blossom" || f.t < f.dur) continue;
      const dx = f.x - pointer.x;
      const dy = f.y - pointer.y;
      if (dx * dx + dy * dy < 30 * 30 && Math.random() < dt * speed * 0.01) shed(f.x, f.y, pointer.vx * 0.3 + rand(-10, 10), pointer.vy * 0.3 + rand(-10, 5));
    }
  }

  // ───────────────────────────────── loop ──────────────────────────────────

  function size() {
    W = window.innerWidth;
    H = window.innerHeight;
    // 1.5× is indistinguishable for soft ink art and much cheaper than 2× or 3×.
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    for (const c of [opts.art, opts.front, opts.fx]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.style.width = `${W}px`;
      c.style.height = `${H}px`;
    }
    art.setTransform(dpr, 0, 0, dpr, 0, 0);
    front.setTransform(dpr, 0, 0, dpr, 0, 0);
    fx.setTransform(dpr, 0, 0, dpr, 0, 0);
    releaseBake();
  }

  function frame(now: number) {
    if (destroyed) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const busy = tickGrowth(dt);
    // While growing, repaint the trees at ~30fps: growth reads the same, and
    // the petals (and the page) keep the other half of every frame.
    paintWait -= dt;
    if ((busy && paintWait <= 0) || dirty || (growingNow && !busy)) {
      if (dirty || !busy) layerDirty[0] = layerDirty[1] = true;
      render();
      dirty = false;
      paintWait = 1 / 32;
      // Growth just finished: the canvases now hold the final picture.
      if (!busy && cachesLive) releaseBake();
    }
    growingNow = busy;
    brush(dt);
    // Skip the full-screen clear when there was nothing on the petal layer.
    if (petals.length || fxDrawn) fx.clearRect(0, 0, W, H);
    fxDrawn = petals.length > 0;
    tickPetals(dt, now / 1000);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(raf);
    size();
    boughs = [];
    flowers = [];
    petals = [];
    resting = 0;
    nodes = [];
    fx.clearRect(0, 0, W, H);
    compose();
    if (opts.reducedMotion) {
      for (let i = 0; i < 4000 && tickGrowth(0.1); i++);
      render(true);
      releaseBake();
      return;
    }
    dirty = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  let lastW = window.innerWidth;
  let lastH = window.innerHeight;
  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (Math.abs(window.innerWidth - lastW) < 40 && Math.abs(window.innerHeight - lastH) < 160) return;
      lastW = window.innerWidth;
      lastH = window.innerHeight;
      start();
    }, 250);
  }

  start();
  window.addEventListener("resize", onResize);
  if (!opts.reducedMotion) {
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    document.documentElement.addEventListener("pointerleave", onLeave);
  }

  return {
    setDark(dark) {
      pal = dark ? DARK : LIGHT;
      repaintAll();
    },
    wind: () => ({ vx: pointer.active ? pointer.vx : 0, vy: pointer.active ? pointer.vy : 0 }),
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      layoutWatch.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    },
  };
}
