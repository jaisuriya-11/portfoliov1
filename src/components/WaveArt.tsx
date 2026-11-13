/**
 * Flowing wave bands for the project hover backdrop (after the orange/pink
 * swirl in the reference). Each variant is a different composition of thick,
 * curved strokes over a base colour; `palette` is [base, band 1, band 2, band 3].
 */
const COMPOSITIONS: string[][] = [
  // 0: big sweeping arcs from the top right
  ["M-40 60 C 80 -20, 220 140, 460 20", "M-40 130 C 90 40, 240 210, 460 90", "M-40 200 C 100 120, 250 280, 460 160", "M-40 270 C 110 190, 260 350, 460 230"],
  // 1: concentric swirls from the bottom left
  ["M-20 300 C 40 160, 160 80, 420 40", "M-20 340 C 70 210, 200 140, 440 110", "M10 380 C 110 260, 240 210, 460 190", "M60 420 C 160 320, 280 290, 460 270"],
  // 2: tall S-curves across the frame
  ["M40 -40 C 160 80, -40 180, 120 320", "M130 -40 C 250 80, 50 180, 210 320", "M220 -40 C 340 80, 140 180, 300 320", "M310 -40 C 430 80, 230 180, 390 320"],
  // 3: gentle horizontal ripples
  ["M-40 40 C 60 10, 140 80, 240 50 S 380 20, 460 60", "M-40 105 C 60 75, 140 145, 240 115 S 380 85, 460 125", "M-40 170 C 60 140, 140 210, 240 180 S 380 150, 460 190", "M-40 235 C 60 205, 140 275, 240 245 S 380 215, 460 255"],
  // 4: a fan opening from the top left
  ["M-30 -30 C 90 40, 140 160, 120 320", "M-30 -30 C 140 20, 230 140, 250 320", "M-30 -30 C 190 0, 320 110, 380 320", "M-30 -30 C 240 -20, 400 70, 470 250"],
];

export default function WaveArt({ variant, palette }: { variant: number; palette: [string, string, string, string] }) {
  const paths = COMPOSITIONS[variant % COMPOSITIONS.length];
  const [base, ...bands] = palette;
  return (
    <svg className="wave-art" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="260" fill={base} />
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={bands[i % bands.length]} strokeWidth={i % 2 ? 30 : 42} strokeLinecap="round" />
      ))}
    </svg>
  );
}
