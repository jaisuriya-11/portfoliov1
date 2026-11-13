import { createStore, useStore } from "./store";
import type { Theme } from "./theme";

/*
 * UI sounds, synthesised with Web Audio (no audio files):
 *  - tap: a short, soft water-drop pop on clicks;
 *  - flip: a soft swish and a light card snap, for the avatar turning over;
 *  - theme: two plucked-string notes, koto-like to suit the sakura, rising
 *    into light and falling into dark.
 * On by default; the Settings switch turns them off and the choice is
 * remembered per visitor. Browsers keep audio locked until the first click or
 * key press, so the very first cue may be silent.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx.state === "closed" ? null : ctx;
}

/**
 * Soft pop: a short triangle tone that bends up in pitch, like a drop of
 * water, with a gentle lowpass so it never sounds sharp.
 */
function tick(volume: number) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const out = c.createGain();
  out.gain.value = volume;
  const soften = c.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 2200;
  out.connect(soften).connect(c.destination);

  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(420, t);
  osc.frequency.exponentialRampToValueAtTime(980, t + 0.035);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(0.9, t + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  osc.connect(env).connect(out);
  osc.start(t);
  osc.stop(t + 0.1);
}

/** One plucked-string note (Karplus–Strong): a noise burst ringing through a damped delay line. */
function pluckBuffer(c: AudioContext, freq: number, seconds: number) {
  const rate = c.sampleRate;
  const period = Math.round(rate / freq);
  const n = Math.floor(rate * seconds);
  const buf = c.createBuffer(1, n, rate);
  const out = buf.getChannelData(0);
  const line = new Float32Array(period);
  for (let i = 0; i < period; i++) line[i] = Math.random() * 2 - 1;
  let k = 0;
  for (let i = 0; i < n; i++) {
    const next = (k + 1) % period;
    const v = line[k];
    line[k] = 0.996 * 0.5 * (v + line[next]);
    out[i] = v;
    k = next;
  }
  return buf;
}

/** Two plucked notes a fourth apart, with a soft lowpass and a short echo. */
function pluck(notes: number[], volume: number) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const out = c.createGain();
  out.gain.value = volume;
  const tone = c.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2600;
  const echo = c.createDelay();
  echo.delayTime.value = 0.13;
  const wet = c.createGain();
  wet.gain.value = 0.18;
  out.connect(tone);
  tone.connect(c.destination);
  tone.connect(echo).connect(wet).connect(c.destination);

  notes.forEach((f, i) => {
    const src = c.createBufferSource();
    const env = c.createGain();
    src.buffer = pluckBuffer(c, f, 1.1);
    env.gain.setValueAtTime(1, t + i * 0.11);
    env.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.11 + 1.05);
    src.connect(env).connect(out);
    src.start(t + i * 0.11);
  });
}

const KEY = "sound";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export const soundStore = createStore(read());
export const useSound = () => useStore(soundStore);

export function setSound(on: boolean) {
  soundStore.set(on);
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage blocked — applies for this visit only */
  }
  if (on) tick(0.3);
}

let lastTap = 0;

/** A quiet pop; repeated taps within 60ms collapse into one. */
export function tap() {
  if (!soundStore.get()) return;
  const now = performance.now();
  if (now - lastTap < 60) return;
  lastTap = now;
  tick(0.18);
}

/**
 * Card flip: a short burst of filtered noise sweeping up (the swish of the
 * card turning), then a quiet low pop as it lands.
 */
export function flipSound() {
  if (!soundStore.get()) return;
  const c = audio();
  if (!c) return;
  const t = c.currentTime;

  const len = Math.floor(c.sampleRate * 0.22);
  const noise = c.createBuffer(1, len, c.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = noise;
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 1.4;
  band.frequency.setValueAtTime(700, t);
  band.frequency.exponentialRampToValueAtTime(3200, t + 0.16);
  const swish = c.createGain();
  swish.gain.setValueAtTime(0.0001, t);
  swish.gain.exponentialRampToValueAtTime(0.16, t + 0.05);
  swish.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  src.connect(band).connect(swish).connect(c.destination);
  src.start(t);
  src.stop(t + 0.22);

  const osc = c.createOscillator();
  const pop = c.createGain();
  const at = t + 0.17;
  osc.type = "sine";
  osc.frequency.setValueAtTime(260, at);
  osc.frequency.exponentialRampToValueAtTime(140, at + 0.08);
  pop.gain.setValueAtTime(0.0001, at);
  pop.gain.exponentialRampToValueAtTime(0.22, at + 0.005);
  pop.gain.exponentialRampToValueAtTime(0.0001, at + 0.1);
  osc.connect(pop).connect(c.destination);
  osc.start(at);
  osc.stop(at + 0.12);
}

/** Two plucked notes: rising into light, falling into dark. */
export function themeSound(next: Theme) {
  if (!soundStore.get()) return;
  // E5 → A5 into light, A4 → E4 into dark (a pentatonic-friendly fourth).
  pluck(next === "light" ? [659.25, 880] : [440, 329.63], 0.32);
}

/** Things that make a tap when pressed. The theme toggle and avatar have their own cues. */
const TAPPABLE = "a[href], button:not([data-theme-toggle]):not([data-own-sound]), [role='tab'], .skill";

/** Plays the tap for any press on an interactive element. Returns a cleanup function. */
export function installTapSounds() {
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as Element | null)?.closest?.(TAPPABLE)) tap();
  };
  const onKey = (e: KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && (e.target as Element | null)?.closest?.(TAPPABLE)) tap();
  };
  document.addEventListener("pointerdown", onDown, true);
  document.addEventListener("keydown", onKey, true);
  return () => {
    document.removeEventListener("pointerdown", onDown, true);
    document.removeEventListener("keydown", onKey, true);
  };
}
