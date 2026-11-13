import { ArrowUpRight, Trophy } from "lucide-react";
import { useState } from "react";
import { achievements, anime, games, places } from "../data/offclock";
import ArcLink from "./ArcLink";
import WaveArt from "./WaveArt";
import { Dialog, DialogContent } from "./arc/dialog/dialog";

/**
 * "Off the clock": a minimal bento. Images carry each tile; text is one small
 * label and one line. Three columns: tall · stacked · tall.
 *   [ Anime  ][ Achievements ][ Places ]
 *   [ (tall) ][ Playing      ][ (tall) ]
 * Hover: the image eases in a little and an arrow appears. Nothing else moves.
 */
export default function OffClock() {
  const [dialog, setDialog] = useState<"wins" | null>(null);
  const playing = games.filter((g) => g.status === "playing");
  const watched = anime.filter((a) => a.status === "watched");
  const watching = anime.filter((a) => a.status === "watching");
  const visited = places.filter((p) => p.visited);
  const place = places.find((p) => p.name === "Calicut") ?? visited[0];
  const [featured, ...rest] = achievements;

  return (
    <>
      <div className="mb">
        <button type="button" className="mb__tile mb__wins" onClick={() => setDialog("wins")} aria-haspopup="dialog">
          <span className="mb__wins-bg" aria-hidden="true">
            <WaveArt variant={1} palette={["#8a5a0e", "#c88a0e", "#e8b84a", "#5e3d08"]} />
          </span>
          <span className="mb__fade" aria-hidden="true" />
          {featured?.image && <img className="mb__badge" src={featured.image} alt="" />}
          <span className="mb__text mb__text--light">
            <span className="mb__label">Achievements</span>
            <strong>{featured?.title.split("— ")[1] ?? featured?.title}</strong>
            {rest[0] && <small>{rest[0].title.split("— ")[1] ?? rest[0].title}</small>}
          </span>
          <ArrowUpRight className="mb__go" size={15} aria-hidden="true" />
        </button>

        <a className="mb__tile mb__play" href="/games">
          <span className="mb__split" aria-hidden="true">
            {playing.slice(0, 2).map((g) => (
              <img key={g.title} src={g.banner ?? g.cover} alt="" loading="lazy" decoding="async" style={{ objectPosition: g.bannerPos ?? g.coverPos }} />
            ))}
          </span>
          <span className="mb__fade" aria-hidden="true" />
          <span className="mb__text mb__text--light">
            <span className="mb__label">Playing</span>
            <strong>{playing.map((g) => g.title).join(" & ")}</strong>
          </span>
          <ArrowUpRight className="mb__go mb__go--light" size={15} aria-hidden="true" />
        </a>

        <a className="mb__tile mb__anime" href="/anime">
          <img className="mb__photo" src="/anime/jujutsu-kaisen.jpg" alt="" loading="lazy" decoding="async" />
          <span className="mb__fade" aria-hidden="true" />
          <span className="mb__text mb__text--light">
            <span className="mb__label">Anime</span>
            <strong>{watched.length} watched</strong>
            {watching[0] && <small>Now: {watching[0].title}</small>}
          </span>
          <ArrowUpRight className="mb__go mb__go--light" size={15} aria-hidden="true" />
        </a>

        {place && (
          <a className="mb__tile mb__place" href="/places">
            <img className="mb__photo" src={place.image} alt="" loading="lazy" decoding="async" />
            <span className="mb__fade" aria-hidden="true" />
            <span className="mb__text mb__text--light">
              <span className="mb__label">Places</span>
              <strong>{place.name}</strong>
              <small>
                {visited.length} visited · {places.length - visited.length} to go
              </small>
            </span>
            <ArrowUpRight className="mb__go mb__go--light" size={15} aria-hidden="true" />
          </a>
        )}
      </div>

      <Dialog open={dialog === "wins"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="achv" title="Achievements" description={`${achievements.length} so far`}>
          <ul className="achv__list">
            {achievements.map((a) => (
              <li key={a.title}>
                <span className="achv__icon" aria-hidden="true">
                  {a.image ? <img src={a.image} alt="" /> : <Trophy size={18} />}
                </span>
                <span className="achv__text">
                  <small>
                    {a.kind} · {a.date} · {a.place}
                  </small>
                  <strong>{a.title}</strong>
                  <span>{a.org}</span>
                </span>
                {a.link && (
                  <ArcLink variant="ghost" size="sm" href={a.link} aria-label={`${a.title} on LinkedIn`}>
                    <ArrowUpRight size={15} />
                  </ArcLink>
                )}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

    </>
  );
}
