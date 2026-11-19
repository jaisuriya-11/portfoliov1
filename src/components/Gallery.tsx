import { ArrowUpRight } from "../lib/animated-icons";
import { useState } from "react";
import { places, type Place } from "../data/offclock";
import GalleryGrid from "./GalleryGrid";
import { Section } from "./Sections";

/** Gallery order, by place name; the wish list stays on /places. */
const ORDER = ["Calicut", "N4 Beach", "Kolli Hills", "Kanthalloor"];
const shots = ORDER.map((name) => places.find((p) => p.name === name)).filter((p): p is Place => !!p?.image);

/**
 * Gallery: photos as tall panels side by side. One panel is open wide with
 * its name and place; the others are narrow slices showing only their number.
 * Hovering or focusing a panel opens it; clicking the open one shows all
 * of that place's photos in a grid. On phones the panels stack and open downward instead.
 */
export default function Gallery() {
  const [open, setOpen] = useState(0);
  const [grid, setGrid] = useState<Place | null>(null);

  return (
    <Section id="gallery" title="Gallery">
      <ul className="gal" role="list">
        {shots.map((p, i) => {
          const on = i === open;
          return (
            <li key={p.name} className="gal__item" data-open={on || undefined} onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(i)}>
              <button
                type="button"
                className="gal__panel"
                aria-label={on ? `See all photos from ${p.name}` : `Show ${p.name}`}
                aria-expanded={on}
                onFocus={() => setOpen(i)}
                onClick={() => (on ? setGrid(p) : setOpen(i))}
              >
                <img src={p.image} alt="" loading="lazy" decoding="async" />
                <span className="gal__shade" aria-hidden="true" />
                <span className="gal__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="gal__caption" aria-hidden={!on}>
                  <strong>{p.name}</strong>
                  <small>{p.region}</small>
                </span>
                <span className="gal__go" aria-hidden="true">
                  <ArrowUpRight size={16} strokeWidth={2} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <GalleryGrid place={grid} onClose={() => setGrid(null)} />
    </Section>
  );
}
