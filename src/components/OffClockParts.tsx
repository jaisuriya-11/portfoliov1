import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import type { ReactNode } from "react";
import type { Game, GameStatus } from "../data/offclock";
import ArcLink from "./ArcLink";
import { Dialog, DialogContent } from "./arc/dialog/dialog";

export const STATUS_LABEL: Record<GameStatus, string> = { playing: "Playing now", played: "Played", backlog: "Backlog" };

/** Game cover: Steam library art, a logo on a brand tile (SVG covers, e.g. Valorant), or the title as a fallback. */
export function Cover({ game, className }: { game: Game; className?: string }) {
  const logo = game.cover?.endsWith(".svg");
  return (
    <div className={["gcover", logo && "gcover--logo", className].filter(Boolean).join(" ")}>
      {game.cover ? <img src={game.cover} alt="" loading="lazy" decoding="async" style={game.coverPos ? { objectPosition: game.coverPos } : undefined} /> : <span className="gcover__ph">{game.title}</span>}
    </div>
  );
}

/** Detail card for one game: cover, title, status, note and a store link. */
export function GameDialog({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const isSteam = game?.link?.includes("steampowered");
  return (
    <Dialog open={!!game} onOpenChange={(o) => !o && onClose()}>
      {game && (
        <DialogContent className="gdialog" title={game.title} description={STATUS_LABEL[game.status]}>
          <div className="gdialog__body">
            <Cover game={game} className="gdialog__cover" />
            <div className="gdialog__text">
              {game.about && <p className="gdialog__about">{game.about}</p>}
              <dl className="gdialog__facts">
                {game.dev && (
                  <div>
                    <dt>Developer</dt>
                    <dd>{game.dev}</dd>
                  </div>
                )}
                {game.year && (
                  <div>
                    <dt>Released</dt>
                    <dd>{game.year}</dd>
                  </div>
                )}
                {game.genres?.length ? (
                  <div>
                    <dt>Genre</dt>
                    <dd>{game.genres.join(" · ")}</dd>
                  </div>
                ) : null}
                {game.note && (
                  <div>
                    <dt>Status</dt>
                    <dd>{game.note}</dd>
                  </div>
                )}
              </dl>
              {game.link && (
                <ArcLink size="sm" href={game.link}>
                  {isSteam ? "Look up on Steam" : "Official site"} <ArrowUpRight size={14} />
                </ArcLink>
              )}
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

/** Page frame for /games and /places: back link, title, intro, then content. */
export function PageShell({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <section className="page frame">
      <a className="page__back" href="/">
        <ArrowLeft size={14} /> Home
      </a>
      <h1 className="page__title">{title}</h1>
      <p className="page__intro">{intro}</p>
      {children}
    </section>
  );
}

export function SearchBox({ value, onChange, placeholder, count }: { value: string; onChange: (v: string) => void; placeholder: string; count?: string }) {
  return (
    <label className="searchbox">
      <Search size={15} aria-hidden="true" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {count && <span className="searchbox__count">{count}</span>}
    </label>
  );
}

