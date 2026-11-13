/**
 * An original, hand-drawn-in-SVG dusk scene in the style of anime
 * backgrounds: a big low sun, towering clouds, a distant town, and a
 * telephone pole with sagging wires. Colours come from CSS variables, so
 * it turns to a starry night in dark mode.
 */
export default function DuskScene() {
  return (
    <svg className="dusk" viewBox="0 0 800 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="dusk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sky-top)" />
          <stop offset="0.55" stopColor="var(--sky-mid)" />
          <stop offset="1" stopColor="var(--sky-low)" />
        </linearGradient>
        <radialGradient id="dusk-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--sun)" stopOpacity="0.75" />
          <stop offset="1" stopColor="var(--sun)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dusk-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--cloud-hi)" />
          <stop offset="1" stopColor="var(--cloud-lo)" />
        </linearGradient>
      </defs>

      <rect width="800" height="340" fill="url(#dusk-sky)" />

      <g className="dusk__stars" fill="#fff">
        <circle cx="80" cy="40" r="1" />
        <circle cx="160" cy="90" r="0.8" />
        <circle cx="250" cy="30" r="1.2" />
        <circle cx="330" cy="70" r="0.7" />
        <circle cx="470" cy="25" r="1" />
        <circle cx="560" cy="60" r="0.8" />
        <circle cx="640" cy="35" r="1.1" />
        <circle cx="720" cy="80" r="0.7" />
        <circle cx="770" cy="20" r="0.9" />
        <circle cx="40" cy="110" r="0.7" />
        <circle cx="400" cy="50" r="0.6" />
      </g>

      <circle cx="650" cy="225" r="120" fill="url(#dusk-glow)" />
      <circle cx="650" cy="225" r="40" fill="var(--sun)" />

      <g fill="url(#dusk-cloud)" className="dusk__clouds">
        <path d="M-20 200c30-34 70-30 86-14 10-40 64-52 92-20 22-26 70-22 82 14 34-6 58 16 54 40H-20Z" />
        <path d="M600 150c16-28 52-30 68-10 14-22 50-22 64 2 26-6 48 10 46 32H596c-10-8-8-18 4-24Z" opacity="0.85" />
        <path d="M250 110c10-18 34-20 44-6 10-14 34-12 40 4 18-2 30 10 28 22H246c-8-6-6-14 4-20Z" opacity="0.6" />
      </g>

      <path
        fill="var(--town)"
        d="M0 340V268h22v-14h18v20h16v-30h24v24h14v-12h20v26h12v-40h10v-8h8v8h10v38h18v-18h26v14h16v-26h30v30h12v-10h22v18h20v-34h8v-10h6v10h8v34h22v-16h28v22h14v-30h26v26h18v-12h20v16h14v-40h14v-6h6v6h12v42h22v-20h24v16h16v-24h28v28h18v-14h24v18h14v-30h22v26h20v-10h26v18h18v-22h22v20h10v72Z"
      />

      <g stroke="var(--line-ink)" fill="none" strokeLinecap="round">
        <path d="M-10 112q60 20 128 -2" strokeWidth="1.4" />
        <path d="M-10 128q60 20 128 -2" strokeWidth="1.2" />
        <path d="M122 112q340 90 700 -10" strokeWidth="1.4" />
        <path d="M122 128q340 90 700 -10" strokeWidth="1.2" />
      </g>
      <g fill="var(--line-ink)" transform="translate(-170 0)">
        <rect x="284" y="78" width="8" height="262" />
        <rect x="262" y="98" width="52" height="5" rx="1" />
        <rect x="268" y="116" width="40" height="4" rx="1" />
        <circle cx="268" cy="96" r="3" />
        <circle cx="308" cy="96" r="3" />
        <circle cx="274" cy="114" r="2.5" />
        <circle cx="302" cy="114" r="2.5" />
      </g>
    </svg>
  );
}
