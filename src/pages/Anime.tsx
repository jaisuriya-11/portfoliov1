import { useMemo, useState } from "react";
import SegmentedControl from "../components/arc/segmented-control/segmented-control";
import { PageShell } from "../components/OffClockParts";
import { Dialog, DialogContent } from "../components/arc/dialog/dialog";
import { anime, type Anime as AnimeItem, type AnimeStatus } from "../data/offclock";

type Filter = "all" | AnimeStatus;
const ORDER: AnimeStatus[] = ["watching", "watched", "plan"];
const HEADINGS: Record<AnimeStatus, string> = { watching: "Watching now", watched: "Watched", plan: "Want to watch" };

/** /anime: what I'm watching, what I've watched, and what's next. */
export default function Anime() {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<AnimeItem | null>(null);
  const shown = useMemo(() => {
    return anime.filter((a) => (filter === "all" || a.status === filter));
  }, [filter]);

  return (
    <PageShell
      title="Anime"
      intro={
        <>
          What I'm watching, what I've finished, and <strong>the list that keeps getting longer.</strong>
        </>
      }
    >
      <div className="page__bar">
        <SegmentedControl
          label="Filter anime"
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          options={[
            { value: "all", label: "All" },
            { value: "watching", label: "Watching" },
            { value: "watched", label: "Watched" },
            { value: "plan", label: "Want to watch" },
          ]}
        />
      </div>

      {ORDER.map((status) => {
        const list = shown.filter((a) => a.status === status);
        if (!list.length) return null;
        return (
          <div className="page__group" key={status}>
            <div className={`ghead ghead--${status === "watching" ? "playing" : status === "watched" ? "played" : "backlog"}`}>
              <span className="ghead__dot" aria-hidden="true" />
              <h2 className="ghead__title">{HEADINGS[status]}</h2>
              <span className="ghead__count">{list.length}</span>
            </div>
            <ul className="ggrid">
              {list.map((a) => (
                <li key={a.title}>
                  <button type="button" className="gcard" onClick={() => setOpen(a)} aria-haspopup="dialog">
                    <div className="gcover">
                      <img src={a.cover} alt="" loading="lazy" decoding="async" />
                    </div>
                    <span className="gcard__title">{a.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {/* Details stay on the page: no redirect to AniList. */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {open && (
          <DialogContent className="gdialog" title={open.title} description={HEADINGS[open.status]}>
            <div className="gdialog__body">
              <div className="gcover gdialog__cover">
                <img src={open.cover} alt="" />
              </div>
              <div className="gdialog__text">
                <dl className="gdialog__facts">
                  <div>
                    <dt>Studio</dt>
                    <dd>{open.studio}</dd>
                  </div>
                  <div>
                    <dt>Released</dt>
                    <dd>{open.year}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{HEADINGS[open.status]}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </PageShell>
  );
}
