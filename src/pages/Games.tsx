import { useMemo, useState } from "react";
import SegmentedControl from "../components/arc/segmented-control/segmented-control";
import { Cover, GameDialog, PageShell, STATUS_LABEL } from "../components/OffClockParts";
import { games, type Game, type GameStatus } from "../data/offclock";

type Filter = "all" | GameStatus;
const ORDER: GameStatus[] = ["playing", "played", "backlog"];
const HEADINGS: Record<GameStatus, { title: string; hint: string }> = {
  playing: { title: "Playing now", hint: "on rotation this week" },
  played: { title: "Played", hint: "finished, credits rolled" },
  backlog: { title: "Backlog", hint: "one day, surely" },
};

/** /games: what I've played, what I'm playing, and the backlog. */
export default function Games() {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Game | null>(null);

  const shown = useMemo(() => {
    return games.filter((g) => (filter === "all" || g.status === filter));
  }, [filter]);


  return (
    <PageShell
      title="Games"
      intro={
        <>
          What I've played, what I'm playing, and <strong>the backlog I keep pretending I'll finish.</strong>
        </>
      }
    >
      <div className="page__bar">
        <SegmentedControl
          label="Filter games"
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          options={[
            { value: "all", label: "All" },
            { value: "playing", label: "Playing" },
            { value: "played", label: "Played" },
            { value: "backlog", label: "Backlog" },
          ]}
        />
      </div>

      {ORDER.map((status) => {
        const list = shown.filter((g) => g.status === status);
        if (!list.length) return null;
        return (
          <div className="page__group" key={status}>
            <div className={`ghead ghead--${status}`}>
              <span className="ghead__dot" aria-hidden="true" />
              <h2 className="ghead__title">{HEADINGS[status].title}</h2>
              <span className="ghead__count">{list.length}</span>
              <span className="ghead__hint">{HEADINGS[status].hint}</span>
            </div>
            <ul className="ggrid">
              {list.map((g) => (
                <li key={g.title}>
                  <button type="button" className="gcard" onClick={() => setOpen(g)} aria-label={`${g.title} — ${STATUS_LABEL[g.status]}`}>
                    <Cover game={g} />
                    <span className="gcard__title">{g.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <GameDialog game={open} onClose={() => setOpen(null)} />
    </PageShell>
  );
}
