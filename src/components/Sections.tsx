import { createResource, createSignal, For, onCleanup, Show, type JSX } from "solid-js";
import { profile, type Project, type Role } from "../data/profile";
import { Icon } from "./icons";

// ──────────────────────────────── shared ────────────────────────────────────

/** Numbered section heading: 01 · 作品 · Projects, with a hairline running out. */
export function Section(props: { id: string; n: string; kanji: string; title: string; children: JSX.Element; aside?: JSX.Element }) {
  return (
    <section id={props.id} class="sec">
      <header class="sec__head">
        <span class="sec__n">{props.n}</span>
        <span class="sec__kanji" aria-hidden="true">
          {props.kanji}
        </span>
        <h2 class="sec__title">{props.title}</h2>
        <span class="sec__rule" aria-hidden="true" />
        {props.aside}
      </header>
      {props.children}
    </section>
  );
}

// ───────────────────────────────── hero ─────────────────────────────────────

export function Hero() {
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: profile.timeZone, timeZoneName: "short" });
  const [now, setNow] = createSignal(fmt.format(new Date()));
  const t = setInterval(() => setNow(fmt.format(new Date())), 15_000);
  onCleanup(() => clearInterval(t));

  return (
    <section class="hero">
      <div class="hero__seal" aria-hidden="true">
        {profile.seal}
      </div>
      <div class="hero__body">
        <p class="hero__meta">
          <Show when={profile.available}>
            <span class="status">
              <i />
              Open to work
            </span>
          </Show>
          <span>{profile.location}</span>
          <span class="dot" aria-hidden="true">
            ·
          </span>
          <time>{now()}</time>
        </p>
        <h1 class="hero__name">{profile.name}</h1>
        <p class="hero__role">{profile.role}</p>
        <div class="hero__lines">
          <For each={profile.lines}>{(l) => <p>{l}</p>}</For>
        </div>
        <nav class="socials" aria-label="Social links">
          <For each={profile.socials}>
            {(s) => (
              <a href={s.href} target={s.icon === "mail" ? undefined : "_blank"} rel="noreferrer" aria-label={s.label}>
                {Icon[s.icon]()}
                <span>{s.label}</span>
              </a>
            )}
          </For>
          <Show when={profile.resume}>
            <a class="socials__cv" href={profile.resume} target="_blank" rel="noreferrer">
              Résumé {Icon.arrow()}
            </a>
          </Show>
        </nav>
      </div>
    </section>
  );
}

// ─────────────────────────────── projects ───────────────────────────────────

const STATUS: Record<NonNullable<Project["status"]>, string> = { live: "Live", building: "Building", archived: "Archived" };

function ProjectCard(props: { p: Project; i: number }) {
  return (
    <article class="card">
      <div class="card__media">
        <Show when={props.p.image} fallback={<div class="card__placeholder" aria-hidden="true">{props.p.title.slice(0, 1)}</div>}>
          <img src={props.p.image} alt="" loading="lazy" />
        </Show>
        <span class="card__index">{String(props.i + 1).padStart(2, "0")}</span>
      </div>
      <div class="card__body">
        <div class="card__top">
          <h3>{props.p.title}</h3>
          <div class="card__links">
            <Show when={props.p.site}>
              <a href={props.p.site} target="_blank" rel="noreferrer" aria-label={`${props.p.title} website`}>
                {Icon.globe()}
              </a>
            </Show>
            <Show when={props.p.code}>
              <a href={props.p.code} target="_blank" rel="noreferrer" aria-label={`${props.p.title} source code`}>
                {Icon.code()}
              </a>
            </Show>
          </div>
        </div>
        <Show when={props.p.highlight}>
          <span class="card__highlight">{props.p.highlight}</span>
        </Show>
        <p class="card__blurb">{props.p.blurb}</p>
        <div class="card__foot">
          <ul class="chips">
            <For each={props.p.tech}>{(t) => <li>{t}</li>}</For>
          </ul>
          <Show when={props.p.status}>
            <span class={`state state--${props.p.status}`}>
              <i />
              {STATUS[props.p.status!]}
            </span>
          </Show>
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const [all, setAll] = createSignal(false);
  const shown = () => (all() ? profile.projects : profile.projects.slice(0, 2));
  return (
    <Section id="projects" n="01" kanji="作品" title="Selected work">
      <div class="cards">
        <For each={shown()}>{(p, i) => <ProjectCard p={p} i={i()} />}</For>
      </div>
      <Show when={profile.projects.length > 2}>
        <button class="more" type="button" onClick={() => setAll(!all())}>
          {all() ? "Show fewer" : `All ${profile.projects.length} projects`}
          <span classList={{ flip: all() }}>{Icon.chevron()}</span>
        </button>
      </Show>
    </Section>
  );
}

// ────────────────────────────── experience ──────────────────────────────────

function RoleItem(props: { r: Role; open: boolean; onToggle: () => void }) {
  return (
    <li class="role" classList={{ "is-open": props.open }}>
      <span class="role__dot" aria-hidden="true" />
      <button class="role__head" type="button" aria-expanded={props.open} onClick={props.onToggle}>
        <span class="role__logo" aria-hidden="true">
          <Show when={props.r.logo} fallback={props.r.company.slice(0, 1)}>
            <img src={props.r.logo} alt="" />
          </Show>
        </span>
        <span class="role__what">
          <strong>{props.r.company}</strong>
          <span>{props.r.title}</span>
        </span>
        <span class="role__when">
          <span>{props.r.dates}</span>
          <small>{props.r.place}</small>
        </span>
        <span class="role__chev">{Icon.chevron()}</span>
      </button>
      <div class="role__more">
        <div>
          <ul class="role__points">
            <For each={props.r.points}>{(pt) => <li>{pt}</li>}</For>
          </ul>
          <ul class="chips">
            <For each={props.r.tech}>{(t) => <li>{t}</li>}</For>
          </ul>
        </div>
      </div>
    </li>
  );
}

export function Experience() {
  const [open, setOpen] = createSignal(0);
  return (
    <Section id="experience" n="02" kanji="経歴" title="Experience">
      <ol class="timeline">
        <For each={profile.experience}>{(r, i) => <RoleItem r={r} open={open() === i()} onToggle={() => setOpen(open() === i() ? -1 : i())} />}</For>
      </ol>
    </Section>
  );
}

// ───────────────────────────── proof of work ────────────────────────────────

interface Day {
  date: string;
  count: number;
  level: number;
}
interface PR {
  title: string;
  url: string;
  repo: string;
  state: "merged" | "open" | "closed";
}

async function loadContributions(user: string): Promise<{ days: Day[]; total: number } | null> {
  if (!user) return null;
  try {
    const r = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`);
    if (!r.ok) return null;
    const j = await r.json();
    const days: Day[] = j.contributions ?? [];
    return { days, total: days.reduce((s, d) => s + d.count, 0) };
  } catch {
    return null;
  }
}

async function loadPRs(user: string): Promise<PR[]> {
  if (!user) return [];
  try {
    const r = await fetch(`https://api.github.com/search/issues?q=author:${encodeURIComponent(user)}+type:pr+-user:${encodeURIComponent(user)}&sort=created&order=desc&per_page=6`);
    if (!r.ok) return [];
    const j = await r.json();
    return (j.items ?? []).map((it: { title: string; html_url: string; repository_url: string; state: string; pull_request?: { merged_at?: string } }) => ({
      title: it.title,
      url: it.html_url,
      repo: it.repository_url.split("/repos/")[1] ?? "",
      state: it.pull_request?.merged_at ? "merged" : it.state === "open" ? "open" : "closed",
    }));
  } catch {
    return [];
  }
}

export function ProofOfWork() {
  const [cal] = createResource(() => profile.github, loadContributions);
  const [prs] = createResource(() => profile.github, loadPRs);

  // Weeks as columns (GitHub-style), starting on Sunday.
  const weeks = () => {
    const days = cal()?.days ?? [];
    const out: Day[][] = [];
    let week: Day[] = [];
    if (days.length) {
      const pad = new Date(days[0].date).getDay();
      for (let i = 0; i < pad; i++) week.push({ date: "", count: -1, level: -1 });
    }
    for (const d of days) {
      week.push(d);
      if (week.length === 7) {
        out.push(week);
        week = [];
      }
    }
    if (week.length) out.push(week);
    return out;
  };

  return (
    <Section id="work" n="03" kanji="証" title="Proof of work" aside={<Show when={cal()}>{(c) => <span class="sec__aside">{c().total.toLocaleString()} contributions this year</span>}</Show>}>
      <Show
        when={profile.github}
        fallback={
          <p class="note">
            Add your GitHub username to <code>src/data/profile.ts</code> to show your contribution calendar and recent pull requests here.
          </p>
        }
      >
        <Show when={cal()} fallback={<div class="heat heat--loading" aria-hidden="true" />}>
          <div class="heat" role="img" aria-label={`${cal()!.total} GitHub contributions in the last year`}>
            <For each={weeks()}>
              {(w) => (
                <div class="heat__week">
                  <For each={w}>{(d) => <span class={`heat__day l${Math.max(0, d.level)}`} classList={{ "is-pad": d.level < 0 }} title={d.date ? `${d.count} on ${d.date}` : undefined} />}</For>
                </div>
              )}
            </For>
          </div>
          <div class="heat__legend" aria-hidden="true">
            Less
            <For each={[0, 1, 2, 3, 4]}>{(l) => <span class={`heat__day l${l}`} />}</For>
            More
          </div>
        </Show>
        <Show when={(prs() ?? []).length}>
          <ul class="prs">
            <For each={prs()}>
              {(pr) => (
                <li>
                  <span class={`state state--${pr.state === "merged" ? "live" : pr.state === "open" ? "building" : "archived"}`}>
                    <i />
                    {pr.state}
                  </span>
                  <a href={pr.url} target="_blank" rel="noreferrer">
                    {pr.title}
                  </a>
                  <small>{pr.repo}</small>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Show>
    </Section>
  );
}

// ──────────────────────────────── skills ────────────────────────────────────

export function Skills() {
  return (
    <Section id="skills" n="04" kanji="技" title="Toolkit">
      <dl class="skills">
        <For each={Object.entries(profile.skills)}>
          {([group, items]) => (
            <div class="skills__row">
              <dt>{group}</dt>
              <dd>
                <ul class="chips chips--stamp">
                  <For each={items}>{(s) => <li>{s}</li>}</For>
                </ul>
              </dd>
            </div>
          )}
        </For>
      </dl>
    </Section>
  );
}

// ──────────────────────────────── contact ───────────────────────────────────

export function Contact() {
  const [copied, setCopied] = createSignal(false);
  let timer = 0;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(timer);
      timer = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  onCleanup(() => clearTimeout(timer));

  return (
    <Section id="contact" n="05" kanji="便り" title="Get in touch">
      <div class="contact">
        <p class="contact__lead">Have something worth building? I read every message and reply within a couple of days.</p>
        <div class="contact__actions">
          <a class="btn btn--ink" href={`mailto:${profile.email}`}>
            {Icon.mail()} Write to me
          </a>
          <button class="btn" type="button" onClick={copy} aria-live="polite">
            {copied() ? Icon.check() : Icon.copy()}
            {copied() ? "Copied" : profile.email}
          </button>
        </div>
      </div>
    </Section>
  );
}

// ──────────────────────────────── footer ────────────────────────────────────

export function Footer() {
  return (
    <footer class="foot">
      <span>
        © {new Date().getFullYear()} {profile.name}
      </span>
      <span class="foot__mid" aria-hidden="true">
        {profile.seal}
      </span>
      <a href="#top" class="foot__top">
        Back to top {Icon.up()}
      </a>
    </footer>
  );
}
