import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import SegmentedControl from "../components/arc/segmented-control/segmented-control";
import { PageShell } from "../components/OffClockParts";
import PlaceViewer from "../components/PlaceViewer";
import { places } from "../data/offclock";

type Filter = "all" | "visited" | "want";

/** /places: places I've been (with my own photos) and places I want to go. */
export default function Places() {
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<number | null>(null);

  const shown = useMemo(() => {
    return places.filter(
      (p) =>
        (filter === "all" || (filter === "visited" ? p.visited : !p.visited)),
    );
  }, [filter]);

  // The viewer steps through the places currently shown that have a photo.
  const withPhotos = shown.filter((p) => p.image);

  return (
    <PageShell
      title="Places"
      intro={
        <>
          A list of places I want to go, and the ones I've made it to. Once I've been somewhere, <strong>it gets marked visited and filled with my own photos.</strong>
        </>
      }
    >
      <div className="page__bar">
        <SegmentedControl
          label="Filter places"
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          options={[
            { value: "all", label: "All" },
            { value: "visited", label: "Visited" },
            { value: "want", label: "Want to go" },
          ]}
        />
      </div>

      <div className="ghead ghead--places">
        <span className="ghead__dot" aria-hidden="true" />
        <h2 className="ghead__title">{filter === "visited" ? "Been there" : filter === "want" ? "Want to go" : "All places"}</h2>
        <span className="ghead__count">{shown.length}</span>
      </div>
      <ul className="pgrid">
        {shown.map((p) => (
          <li key={p.name} className={p.visited ? "pcard" : "pcard pcard--want"}>
            <button type="button" className="pcard__media" onClick={() => p.image && setView(withPhotos.indexOf(p))} disabled={!p.image} aria-label={`View photo of ${p.name}`}>
              {p.image ? (
                <img src={p.image} alt={`${p.name}, ${p.region}`} loading="lazy" decoding="async" />
              ) : (
                <span className="pcard__ph">
                  <MapPin size={18} aria-hidden="true" />
                  {p.name}
                </span>
              )}
            </button>
            <div className="pcard__body">
              <p className="pcard__name">
                <strong>{p.name}</strong>, {p.region}
              </p>
              <p className="pcard__meta">{p.visited ? `Visited${p.date ? ` · ${p.date}` : ""}` : "Not yet · stand-in photo"}</p>
              {p.about && <p className="pcard__about">{p.about}</p>}
              {p.note && <p className="pcard__note">{p.note}</p>}
            </div>
          </li>
        ))}
      </ul>
      <PlaceViewer list={withPhotos} index={view} onIndex={setView} onClose={() => setView(null)} />
    </PageShell>
  );
}
