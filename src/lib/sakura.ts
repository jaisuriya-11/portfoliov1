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
 *   - petals come from the flowers (plus a few from trees off-screen), fall
 *     under gravity and drift on a slow breeze;
 *   - the cursor is wind: petals near it are carried along its motion, and
 *     sweeping through blossoms shakes petals loose in that direction;
 *   - a click is a gust: nearby blossoms shed a flurry, and the nearest
 *     branch sends out a new twig that grows up and outward, then flowers.
 */

export interface SakuraOptions {
  art: HTMLCanvasElement;
  fx: HTMLCanvasElement;
  contentWidth: number;
  contentSelector: string;
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
  petals: ["#c22f47", "#d6455a", "#e46479", "#ee8ea0", "#f4b2be"],
  petalLine: "#5e0f1d",
  bud: "#b02741",
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const UP = -Math.PI / 2;
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
}

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
  petals: number;
  cool: number;
  jitter: number[];
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
}

export function createSakura(opts: SakuraOptions): Sakura {
  const art = opts.art.getContext("2d")!;
  const fx = opts.fx.getContext("2d")!;
  let pal = opts.dark ? DARK : LIGHT;
  let W = 0;
  let H = 0;
  let boughs: Bough[] = [];
  let flowers: Flower[] = [];
  let petals: Petal[] = [];
  let nodes: Array<{ x: number; y: number; angle: number }> = [];
  let col: [number, number] = [0, 0];
  let raf = 0;
  let last = 0;
  let destroyed = false;
  let breezeT = 0;
  /** Per-load character: how readily boughs fork, and how thickly they flower. */
  let forkRate = 0.0145;
  let bloom = 1;
  let dirty = true;

  // ─────────────────────────────── painting ────────────────────────────────

  /** Stroke a bough as round-capped segments, batching runs of similar width. */
  function strokeBough(b: Bough, extra: number, color: string) {
    art.strokeStyle = color;
    art.lineCap = "round";
    art.lineJoin = "round";
    const P = b.pts;
    for (let i = 1; i < P.length; ) {
      const w = P[i].r * 2 + extra;
      art.lineWidth = w;
      art.beginPath();
      art.moveTo(P[i - 1].x, P[i - 1].y);
      while (i < P.length && Math.abs(P[i].r * 2 + extra - w) < 0.4) {
        art.lineTo(P[i].x, P[i].y);
        i++;
      }
      art.stroke();
    }
  }

  function paintBlossom(f: Flower, p: number) {
    const r = f.r * (0.3 + 0.7 * p);
    art.lineWidth = 0.8;
    art.lineJoin = "round";
    art.fillStyle = pal.petals[f.color];
    art.strokeStyle = pal.petalLine;
    for (let i = 0; i < 5; i++) {
      const a = f.rot + (i / 5) * TAU + f.jitter[i] * 0.3;
      const L = r * (0.85 + f.jitter[i + 5] * 0.3);
      const w = L * 0.62;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const P = (u: number, v: number): [number, number] => [f.x + u * ca - v * sa, f.y + u * sa + v * ca];
      art.beginPath();
      art.moveTo(...P(L * 0.1, 0));
      art.bezierCurveTo(...P(L * 0.3, -w), ...P(L * 0.95, -w * 0.9), ...P(L, -w * 0.15));
      art.lineTo(...P(L * 0.82, 0));
      art.lineTo(...P(L, w * 0.15));
      art.bezierCurveTo(...P(L * 0.95, w * 0.9), ...P(L * 0.3, w), ...P(L * 0.1, 0));
      art.closePath();
      art.fill();
      art.stroke();
    }
    if (p < 0.6) return;
    art.fillStyle = pal.petalLine;
    art.beginPath();
    art.arc(f.x, f.y, Math.max(1, f.r * 0.18), 0, TAU);
    art.fill();
  }

  function paintBud(f: Flower, p: number) {
    const r = f.r * (0.4 + 0.6 * p);
    art.fillStyle = pal.bud;
    art.beginPath();
    art.ellipse(f.x, f.y, r, r * 0.75, f.rot, 0, TAU);
    art.fill();
  }

  function render() {
    art.clearRect(0, 0, W, H);
    // Outline pass for every bough, then the fill pass: joints merge cleanly.
    for (const b of boughs) strokeBough(b, 1.6, pal.ink);
    for (const b of boughs) strokeBough(b, 0, pal.bark);
    for (const f of flowers) {
      if (f.delay > 0) continue;
      const p = Math.min(1, f.t / f.dur);
      const e = 1 - (1 - p) ** 3;
      if (f.kind === "blossom") paintBlossom(f, e);
      else paintBud(f, e);
    }
  }

  // ─────────────────────────────── growth ──────────────────────────────────

  function addFlower(x: number, y: number, a: number, big: boolean, delay: number) {
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
      petals: bud ? 0 : Math.round(rand(1, 4)),
      cool: rand(3, 12),
      jitter: Array.from({ length: 10 }, () => Math.random() - 0.5),
    });
  }

  /** A node: short twigs each ending in a blossom or bud, facing the light. */
  function cluster(x: number, y: number, angle: number, big: boolean) {
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
      boughs.push({ pts, knots: [], x, y, angle: a, life: 0, total: 1, width: 1, speed: 0, acc: 0, nextNode: 0, nextKink: 0, depth: 9, forks: 0, growing: false });
      const end = pts[pts.length - 1];
      addFlower(end.x + Math.cos(a) * 3, end.y + Math.sin(a) * 3, a, big && i === 0, i * 0.12);
    }
  }

  function bough(x: number, y: number, angle: number, length: number, width: number, depth: number): Bough {
    return { pts: [{ x, y, r: width, jl: 0, jr: 0 }], knots: [], x, y, angle, life: length, total: length, width, speed: rand(110, 140), acc: 0, nextNode: rand(26, 44), nextKink: rand(20, 45), depth, forks: 0, growing: true };
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

    if (Math.random() < STEP / 12) nodes.push({ x: b.x, y: b.y, angle: b.angle });
    if ((b.nextNode -= STEP) <= 0) {
      if (f > 0.15) cluster(b.x, b.y, b.angle, false);
      b.nextNode = (f > 0.6 ? rand(20, 32) : rand(28, 50)) / bloom;
    }
    if (b.depth < 3 && b.forks < 5 - b.depth && b.life > 50 && Math.random() < STEP * forkRate) {
      b.forks++;
      boughs.push(bough(b.x, b.y, b.angle + pick([-1, 1]) * rand(0.45, 0.95), b.life * rand(0.4, 0.75), r * 0.7, b.depth + 1));
    }
    if (b.life <= 0 || b.x < -40 || b.x > W + 40 || b.y < -40 || b.y > H + 40) {
      if (b.life <= 0) cluster(b.x, b.y, b.angle, true);
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
      } else if (f.t < f.dur) {
        f.t += dt;
        busy = true;
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
    if (petals.length > 140) return;
    petals.push({ x, y, vx, vy, r: rand(3.5, 6), rot: rand(0, TAU), vrot: rand(-2, 2), flip: rand(0, TAU), vflip: rand(2, 4), phase: rand(0, TAU), color: Math.floor(Math.random() * 5) });
  }

  function drawPetal(p: Petal) {
    fx.save();
    fx.translate(p.x, p.y);
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

  function tickPetals(dt: number, t: number) {
    breezeT += dt;
    // A slow breeze, gusting now and then.
    const breeze = 22 + Math.sin(breezeT * 0.3) * 10 + Math.max(0, Math.sin(breezeT * 0.11)) ** 4 * 45;
    const damp = 1 - Math.exp(-dt * 1.2);
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
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
      if (p.y > H + 10 || p.x > W + 15 || p.x < -15) {
        petals.splice(i, 1);
        continue;
      }
      drawPetal(p);
    }
  }

  function tickAmbient(dt: number) {
    for (const f of flowers) {
      if (f.kind !== "blossom" || f.petals <= 0 || f.t < f.dur) continue;
      if ((f.cool -= dt) <= 0) {
        f.cool = rand(5, 14);
        f.petals--;
        shed(f.x + rand(-3, 3), f.y + 3, rand(-6, 10), rand(4, 14));
      }
    }
    if (Math.random() < dt * 0.8) shed(rand(-0.05, 0.95) * W, -8, rand(10, 20), rand(10, 20));
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
      if (Math.hypot(f.x - x, f.y - y) < 130 && count < 30) {
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
      boughs.push(bough(best.x, best.y, a + turn(a, UP) * 0.3, rand(40, 90), 1.8, 3));
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
      if (dx * dx + dy * dy < 30 * 30 && Math.random() < dt * speed * 0.02) shed(f.x, f.y, pointer.vx * 0.3 + rand(-10, 10), pointer.vy * 0.3 + rand(-10, 5));
    }
  }

  // ───────────────────────────────── loop ──────────────────────────────────

  function size() {
    W = window.innerWidth;
    H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const c of [opts.art, opts.fx]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.style.width = `${W}px`;
      c.style.height = `${H}px`;
    }
    art.setTransform(dpr, 0, 0, dpr, 0, 0);
    fx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame(now: number) {
    if (destroyed) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const busy = tickGrowth(dt);
    if (busy || dirty) {
      render();
      dirty = busy;
    }
    tickAmbient(dt);
    brush(dt);
    fx.clearRect(0, 0, W, H);
    tickPetals(dt, now / 1000);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(raf);
    size();
    boughs = [];
    flowers = [];
    petals = [];
    nodes = [];
    fx.clearRect(0, 0, W, H);
    compose();
    if (opts.reducedMotion) {
      for (let i = 0; i < 4000 && tickGrowth(0.1); i++);
      render();
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
      render();
    },
    wind: () => ({ vx: pointer.active ? pointer.vx : 0, vy: pointer.active ? pointer.vy : 0 }),
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    },
  };
}
