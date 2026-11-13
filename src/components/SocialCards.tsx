import { MapPin } from "lucide-react";
import { useState } from "react";
import { cards, profile, type Social } from "../data/profile";
import ArcLink from "./ArcLink";
import { HoverCard } from "./arc/hover-card/hover-card";
import { useTheme } from "../lib/theme";
import { Icon } from "./icons";

/**
 * Hover cards for the social buttons, built on Arc UI's HoverCard: each shows
 * the real profile photo, name, handle, a line, a few numbers and the location.
 * Real numbers: GitHub is fetched live in the browser (falling back to the
 * build snapshot); LeetCode comes from public/social.json, which
 * scripts/fetch-social.mjs refreshes from LeetCode's API on every build and
 * dev start (LeetCode blocks browser requests). LinkedIn and Instagram have
 * no public API without signing in, so those cards use the saved numbers in
 * profile.ts.
 */

// ─────────────────────────────── live data ──────────────────────────────────

const once = <T,>(load: () => Promise<T | null>) => {
  let p: Promise<T | null> | undefined;
  return () => (p ??= load().catch(() => null));
};

interface GitHubLive {
  name?: string;
  avatar?: string;
  location?: string;
  followers: number;
  following: number;
  repos: number;
  top?: { name: string; about: string; stars: number };
}
const loadGitHub = once<GitHubLive>(async () => {
  const base = `https://api.github.com/users/${cards.github.login}`;
  const [u, repos] = await Promise.all([
    fetch(base).then((r) => (r.ok ? r.json() : null)),
    fetch(`${base}/repos?per_page=100&type=owner`).then((r) => (r.ok ? r.json() : [])),
  ]);
  if (!u) {
    const snap = (await loadSnapshot())?.github;
    return snap ? ({ followers: 0, following: 0, repos: 0, ...snap } as GitHubLive) : null;
  }
  // GitHub's REST API has no "pinned" list; the most-starred own repo stands in.
  const best = (repos as { name: string; description: string | null; stargazers_count: number; fork: boolean }[])
    .filter((x) => !x.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
  return {
    name: u.name ?? undefined,
    avatar: u.avatar_url ?? undefined,
    location: u.location ?? undefined,
    followers: u.followers,
    following: u.following,
    repos: u.public_repos,
    top: best && { name: best.name, about: best.description ?? "", stars: best.stargazers_count },
  };
});

interface LeetCodeLive {
  name?: string;
  avatar?: string;
  rank?: number;
  rating?: number;
  all: number;
  easy: number;
  medium: number;
  hard: number;
}
/** Numbers fetched at build / dev start by scripts/fetch-social.mjs (same origin, so no CORS or rate limits). */
const loadSnapshot = once<{ leetcode?: LeetCodeLive; github?: Partial<GitHubLive> }>(async () => {
  const r = await fetch("/social.json", { cache: "no-cache" });
  return r.ok ? r.json() : null;
});

const loadLeetCode = once<LeetCodeLive>(async () => (await loadSnapshot())?.leetcode ?? null);

const n = (v: number) => v.toLocaleString("en-US");

// ─────────────────────────────── the link ───────────────────────────────────

// ───────────────────────────── profile card ─────────────────────────────────

interface Peek {
  /** Optional cover strip; without one the avatar sits beside the name. */
  banner?: { day: string; night?: string };
  avatar: string;
  name: string;
  handle: string;
  line?: string;
  location?: string;
  stats: { label: string; value: string | number }[];
}

/**
 * Compact profile card. With a banner: cover strip, avatar overlapping it,
 * name and handle below. Without: avatar beside the name and handle.
 * Then one line, location and inline stats.
 */
function PeekCard(p: Peek) {
  const dark = useTheme() === "dark";
  const id = (
    <span className="peek__id">
      <strong className="peek__name">{p.name}</strong>
      <code className="peek__handle">{p.handle}</code>
    </span>
  );
  return (
    <div className={p.banner ? "peek peek--cover" : "peek"}>
      {p.banner ? (
        <>
          <div className="peek__banner" aria-hidden="true">
            <img src={dark && p.banner.night ? p.banner.night : p.banner.day} alt="" />
          </div>
          <img className="peek__avatar" src={p.avatar} alt="" />
        </>
      ) : null}
      <div className="peek__body">
        {p.banner ? (
          id
        ) : (
          <div className="peek__head">
            <img className="peek__avatar" src={p.avatar} alt="" />
            {id}
          </div>
        )}
        {p.line && <p className="peek__line">{p.line}</p>}
        {p.location && (
          <span className="peek__loc">
            <MapPin size={12} aria-hidden="true" /> {p.location}
          </span>
        )}
        {p.stats.length > 0 && (
          <dl className="peek__stats">
            {p.stats.map((st) => (
              <div key={st.label}>
                <dt>{st.label}</dt>
                <dd>{st.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

/** Banners, from the header images shared earlier: the samurai painting (LinkedIn) and Mount Fuji (LeetCode). */
const BANNERS = {
  samurai: { day: "/banner.jpg", night: "/banner-night.jpg" },
  fuji: { day: "/banner-panels.webp" },
};

/** Social button; an Arc hover card with the profile opens on hover, focus or tap. */
export default function SocialLink({ s, compact = false }: { s: Social; compact?: boolean }) {
  const [gh, setGh] = useState<GitHubLive | null>(null);
  const [lc, setLc] = useState<LeetCodeLive | null>(null);
  const kind = s.icon;

  // Live numbers load once, the first time the pointer or focus reaches the link.
  const warm = () => {
    if (kind === "github" && !gh) loadGitHub().then(setGh);
    if (kind === "leetcode" && !lc) loadLeetCode().then(setLc);
  };


  const card = () => {
    switch (kind) {
      case "github": {
        const g = cards.github;
        const top = gh?.top ?? (g.pinned && { name: g.pinned.name, about: g.pinned.about, stars: g.pinned.stars });
        return (
          <PeekCard
            avatar={gh?.avatar ?? g.avatar}
            name={gh?.name ?? g.name}
            handle={`@${g.login}`}
            line={top ? `★ ${n(top.stars)} · ${top.name}${top.about ? ` — ${top.about}` : ""}` : undefined}
            location={gh?.location ?? g.location}
            stats={[
              { label: "Repos", value: gh?.repos ?? "—" },
              { label: "Followers", value: gh?.followers ?? g.followers },
            ]}
          />
        );
      }
      case "linkedin": {
        const l = cards.linkedin;
        return (
          <PeekCard
            banner={BANNERS.samurai}
            avatar={l.avatar}
            name={l.name}
            handle={cards.github.linkedin}
            line={l.headline}
            location={l.location}
            stats={[
              { label: "Connections", value: n(l.connections) },
              { label: "Followers", value: n(l.followers) },
            ]}
          />
        );
      }
      case "instagram": {
        const i = cards.instagram;
        return (
          <PeekCard
            avatar={i.avatar}
            name={i.name}
            handle={`@${i.username}`}
            line={i.bio.join(" · ")}
            location={profile.location}
            stats={[
              { label: "Followers", value: n(i.followers) },
              { label: "Following", value: n(i.following) },
            ]}
          />
        );
      }
      case "leetcode": {
        const c = cards.leetcode;
        const v = lc ?? c.solved;
        return (
          <PeekCard
            banner={BANNERS.fuji}
            avatar={lc?.avatar ?? c.avatar}
            name={lc?.name ?? c.name}
            handle={`@${c.username}`}
            line={`${v.all} solved · rank ${lc?.rank ? n(lc.rank) : c.rank} · rating ${lc?.rating ? n(Math.round(lc.rating)) : c.rating}`}
            stats={[
              { label: "Easy", value: v.easy },
              { label: "Med", value: v.medium },
              { label: "Hard", value: v.hard },
            ]}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <HoverCard className="peek-surface" content={card()} side="bottom" align={compact ? "end" : "start"} openDelay={60} closeDelay={120}>
      <ArcLink
        variant={compact ? "ghost" : "secondary"}
        size="sm"
        className={compact ? "social-icon" : undefined}
        href={s.href}
        aria-label={compact ? s.label : undefined}
        onPointerEnter={warm}
        onFocus={warm}
      >
        {Icon[kind]()}
        {!compact && s.label}
      </ArcLink>
    </HoverCard>
  );
}
