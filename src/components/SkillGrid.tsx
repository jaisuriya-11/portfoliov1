import type { CSSProperties } from "react";
import { brandColor, TechIcon } from "../lib/tech-icons";

/**
 * One flat grid of skill chips, Arc-styled. Each chip sits in grey and takes
 * on its brand colour on hover: icon, a tinted fill and border, and
 * a soft glow. Chips fill each row edge to edge, as in a wrapped flex.
 */
export default function SkillGrid({ skills }: { skills: string[] }) {
  return (
    <ul className="skillgrid">
      {skills.map((s) => {
        const color = brandColor(s);
        return (
          <li
            key={s}
            className="skill"
            style={{ "--brand": color } as CSSProperties}
          >
            <span className="skill__icon">
              <TechIcon name={s} />
            </span>
            {s}
          </li>
        );
      })}
    </ul>
  );
}
