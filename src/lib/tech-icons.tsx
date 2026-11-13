import { Cloud } from "lucide-react";
import {
  siClaude,
  siCss,
  siDocker,
  siFigma,
  siGit,
  siGithub,
  siGo,
  siGooglegemini,
  siGraphql,
  siHtml5,
  siInternetcomputer,
  siJavascript,
  siLaravel,
  siLinux,
  siMongodb,
  siMysql,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siPython,
  siReact,
  siRedux,
  siTailwindcss,
  siTypescript,
  siWebpack,
  type SimpleIcon,
} from "simple-icons";

type Mark = SimpleIcon | { hex: string; lucide: typeof Cloud };

/** Brand marks keyed by the names used in profile.ts (skills and project tech). */
export const TECH_ICONS: Record<string, Mark> = {
  React: siReact,
  // React Native shares the React mark.
  "React Native": siReact,
  Redux: siRedux,
  JavaScript: siJavascript,
  TypeScript: siTypescript,
  HTML: siHtml5,
  HTML5: siHtml5,
  CSS: siCss,
  CSS3: siCss,
  Tailwind: siTailwindcss,
  Webpack: siWebpack,
  GraphQL: siGraphql,
  Laravel: siLaravel,
  PHP: siPhp,
  "Node.js": siNodedotjs,
  Python: siPython,
  Go: siGo,
  // simple-icons has no Java mark; the OpenJDK duke in Java orange stands in.
  Java: { ...siOpenjdk, hex: "E76F00" },
  MySQL: siMysql,
  MongoDB: siMongodb,
  "Gemini API": siGooglegemini,
  // Juno hosts on the Internet Computer.
  Juno: siInternetcomputer,
  // simple-icons dropped the AWS mark; a cloud in AWS orange stands in.
  AWS: { hex: "FF9900", lucide: Cloud },
  Docker: siDocker,
  Linux: siLinux,
  Claude: siClaude,
  Git: siGit,
  GitHub: siGithub,
  Figma: siFigma,
};

/** Near-black brand colours (GitHub, Vercel…) would vanish on the dark theme, so they use the text colour instead. */
export function brandColor(name: string) {
  const icon = TECH_ICONS[name];
  if (!icon) return "var(--fg)";
  const n = parseInt(icon.hex, 16);
  const lum = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum < 40 ? "var(--fg)" : `#${icon.hex}`;
}

export function hasTechIcon(name: string) {
  return name in TECH_ICONS;
}

export function TechIcon({ name, size = 16 }: { name: string; size?: number }) {
  const icon = TECH_ICONS[name];
  if (!icon) return <span className="tech-fallback">{name.slice(0, 1)}</span>;
  if ("lucide" in icon) return <icon.lucide size={size} strokeWidth={2} aria-hidden="true" />;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d={icon.path} />
    </svg>
  );
}
