import { ArrowUpRight, BookOpen, RefreshCw, Sparkles, Wrench, Gamepad2, GraduationCap, MapPin, School, Trophy } from "lucide-react";
import { Avatar } from "./arc/avatar/avatar";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "../lib/theme";
import { flipSound } from "../lib/sound";
import { achievements } from "../data/offclock";
import { profile, type Role } from "../data/profile";
import ArcLink from "./ArcLink";
import { ActivityHeatmap } from "./arc/activity-heatmap/activity-heatmap";
import { Badge } from "./arc/badge/badge";
import { Button } from "./arc/button/button";
import { motionTokens } from "./arc/lib/motion-tokens";
import ProjectCard from "./ProjectCard";
import ResumeButton from "./ResumeButton";
import SkillGrid from "./SkillGrid";
import SplitAccordion from "./SplitAccordion";
import DuskScene from "./DuskScene";
import EmailDialog from "./EmailDialog";
import { Icon } from "./icons";
import SocialLink from "./SocialCards";

// ──────────────────────────────── shared ────────────────────────────────────

/** Five-petal cherry blossom that marks each section title. */
function Blossom() {
  return (
    <svg className="sec__mark" viewBox="-12 -12 24 24" width="14" height="14" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} transform={`rotate(${a})`} d="M0 -1.5 C -4.2 -4.5, -4 -10, -1.4 -10.6 L 0 -9.2 L 1.4 -10.6 C 4 -10, 4.2 -4.5, 0 -1.5 Z" />
      ))}
      <circle r="1.9" className="sec__mark-eye" />
    </svg>
  );
}

/** Section: a bordered card with a plain title, led by a blossom in the section's colour. */
export function Section(props: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={props.id} className="sec" data-index={props.title} data-sec={props.id}>
      <h2 className="sec__title">
        <Blossom />
        {props.title}
      </h2>
      <div className="sec__body">{props.children}</div>
    </section>
  );
}

/** Renders `**bold**` and `` `code` `` spans inside an otherwise plain string. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, i) =>
        part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith("`") ? <code key={i} className="inline-code">{part.slice(1, -1)}</code> : part,
      )}
    </>
  );
}

/** Image that falls back to something else if the file is missing. */
function useImageOk(src?: string) {
  const [ok, setOk] = useState(!!src);
  return [ok, () => setOk(false)] as const;
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="chips">
      {items.map((t) => (
        <li key={t}>
          <Badge size="sm">{t}</Badge>
        </li>
      ))}
    </ul>
  );
}

// ───────────────────────────────── hero ─────────────────────────────────────

/** Header image: the day scene in light mode, the night scene in dark mode, cross-fading on a theme change. */
export function Banner() {
  const [ok, fail] = useImageOk(profile.banner);
  const night = useTheme() === "dark" && !!profile.bannerNight;
  return (
    <div className="banner" aria-hidden="true">
      {ok ? (
        <>
          <img className={cn("banner__img", !night && "is-on")} src={profile.banner} alt="" onError={fail} />
          {profile.bannerNight && <img className={cn("banner__img", night && "is-on")} src={profile.bannerNight} alt="" />}
        </>
      ) : (
        <div className="banner__fallback">{profile.name.slice(0, 1)}</div>
      )}
    </div>
  );
}

/** One icon per bio line, in order: building and fixing things, then the bigger aim. */
const BIO_ICONS = [Wrench, Sparkles];

export function Hero({ tools }: { tools: ReactNode }) {
  const [avatarOk, fail] = useImageOk(profile.avatar);
  // Clicking the avatar swaps between the skull and the portrait.
  const [alt, setAlt] = useState(false);
  const [mail, setMail] = useState(false);
  return (
    <>
      <EmailDialog open={mail} onOpenChange={setMail} />
      <div className="profile band">
        <button
          type="button"
          className={cn("avatar", alt && "is-alt")}
          data-own-sound
          onClick={() => {
            if (!profile.avatarAlt) return;
            flipSound();
            setAlt((a) => !a);
          }}
          aria-label={`${profile.name}: flip picture`}
          aria-pressed={alt}
        >
          {avatarOk ? (
            <span className="avatar__card">
              <span className="avatar__face avatar__face--front">
                <img src={profile.avatar} alt={profile.name} onError={fail} />
              </span>
              {profile.avatarAlt && (
                <span className="avatar__face avatar__face--back">
                  <img src={profile.avatarAlt} alt="" />
                </span>
              )}
            </span>
          ) : (
            <span className="avatar__initial" aria-hidden="true">{profile.name.slice(0, 1)}</span>
          )}
          {profile.available && <i className="avatar__status" title="Open to work" />}
        </button>
        <div className="profile__id">
          <h1 className="profile__name">{profile.name}</h1>
          <p className="profile__sub">
            {profile.role}
          </p>
        </div>
        <div className="profile__tools">{tools}</div>
      </div>

      <div className="bio band">
        <p>
          <Rich text={profile.intro} />
        </p>
        <ul className="bio__list">
          {profile.lines.map((l, i) => {
            const Glyph = BIO_ICONS[i % BIO_ICONS.length];
            return (
              <li key={l}>
                <span className="bio__icon" aria-hidden="true">
                  <Glyph size={14} strokeWidth={1.8} />
                </span>
                <span>
                  <Rich text={l} />
                </span>
              </li>
            );
          })}
        </ul>
        {/* One action bar: what to do (email, résumé) on the left, where to find me (icon socials) on the right. */}
        <div className="bio__bar">
        <div className="bio__actions">
          {profile.call && (
            <ArcLink variant="primary" size="sm" href={profile.call}>
              {Icon.calendar()} Book an intro call
            </ArcLink>
          )}
          <Button variant="primary" size="sm" type="button" onClick={() => setMail(true)} aria-haspopup="dialog">
            {Icon.mail()} Send an email
          </Button>
          {profile.resume && <ResumeButton href={profile.resume} />}
        </div>
        <nav className="bio__socials" aria-label="Social links">
          {profile.socials
            .filter((s) => s.icon !== "mail")
            .map((s) => (
              <SocialLink key={s.label} s={s} compact />
            ))}
        </nav>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────── projects ───────────────────────────────────

export function Projects() {
  const [all, setAll] = useState(false);
  const reduce = useReducedMotion();
  const top = useRef<HTMLDivElement>(null);
  const shown = all ? profile.projects : profile.projects.slice(0, 2);

  const toggle = () => {
    // Collapsing from far down the list: bring the section back into view first.
    if (all) top.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setAll(!all);
  };

  return (
    <Section id="projects" title="Projects">
      <div className="pjs" ref={top}>
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((p, i) => (
            <motion.div
              key={p.title}
              layout={reduce ? false : "position"}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.18 } }}
              transition={{ ...motionTokens.spring.smooth, delay: reduce ? 0 : Math.max(0, i - 2) * 0.09 }}
            >
              <ProjectCard p={p} i={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {profile.projects.length > 2 && (
        <div className="more">
          <Button variant="secondary" size="sm" type="button" onClick={toggle} aria-expanded={all}>
            {all ? "Show less" : `View all ${profile.projects.length}`}
            <motion.span className="viewall__icon" animate={{ rotate: all ? -90 : 0 }} transition={motionTokens.spring.snappy}>
              <ArrowUpRight size={15} />
            </motion.span>
          </Button>
        </div>
      )}
    </Section>
  );
}

// ────────────────────────────── experience ──────────────────────────────────

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Feb 2026" → months since year 0; "Present" → now. */
function toMonths(part: string) {
  if (/present/i.test(part)) {
    const d = new Date();
    return d.getFullYear() * 12 + d.getMonth();
  }
  const m = part.trim().match(/([a-z]{3})[a-z]*\s+(\d{4})/i);
  return m ? Number(m[2]) * 12 + MONTHS.indexOf(m[1].toLowerCase()) : NaN;
}

/** "Feb 2026 — Present" → "9 mo", "Dec 2024 — Feb 2026" → "1 yr 3 mo" (both ends counted). */
function tenure(dates: string) {
  const [a, b] = dates.split(/\s*[—–-]\s*/);
  const n = toMonths(b ?? "") - toMonths(a ?? "") + 1;
  if (!Number.isFinite(n) || n <= 0) return "";
  const y = Math.floor(n / 12);
  const m = n % 12;
  return [y && `${y} yr`, m && `${m} mo`].filter(Boolean).join(" ");
}

function RoleHead({ r }: { r: Role }) {
  const current = /present/i.test(r.dates);
  const span = tenure(r.dates);
  return (
    <>
      {/* Arc avatar: round company mark, with a green dot on the current role. */}
      <Avatar className="role__avatar" name={r.company} src={r.logo} size="lg" status={current ? "online" : undefined} aria-hidden="true" />
      <span className="role__what">
        <strong>{r.company}</strong>
        <span>{r.title}</span>
      </span>
      <span className="role__when">
        <span>{r.dates}</span>
        <small>{[r.place, span].filter(Boolean).join(" · ")}</small>
      </span>
    </>
  );
}

export function Experience() {
  return (
    <Section id="experience" title="Experience">
      <SplitAccordion
        items={profile.experience.map((r) => ({
          id: `${r.company}-${r.title}`,
          head: <RoleHead r={r} />,
          body: (
            <>
              <ul className="role__points">
                {r.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
              <Chips items={r.tech} />
            </>
          ),
        }))}
      />
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
  const [cal, setCal] = useState<{ days: Day[]; total: number } | null>(null);
  const [prs, setPrs] = useState<PR[]>([]);

  useEffect(() => {
    if (!profile.github) return;
    let live = true;
    loadContributions(profile.github).then((c) => live && setCal(c));
    loadPRs(profile.github).then((p) => live && setPrs(p));
    return () => {
      live = false;
    };
  }, []);

  return (
    <Section id="work" title="GitHub">
      {!profile.github ? (
        <p className="note">
          Add your GitHub username to <code>src/data/profile.ts</code> to show your contribution calendar and recent pull requests here.
        </p>
      ) : (
        <>
          {cal ? (
            <ActivityHeatmap
              className="gh-heat"
              days={cal.days.map(({ date, count }) => ({ date, count }))}
              label={`GitHub contributions by ${profile.github} in the last year`}
              period="the last year"
              legend={false}
            />
          ) : (
            <div className="heat heat--loading" aria-hidden="true" />
          )}
          {prs.length > 0 && (
            <ul className="prs">
              {prs.map((pr) => (
                <li key={pr.url}>
                  <span className={`state state--${pr.state === "merged" ? "live" : pr.state === "open" ? "building" : "archived"}`}>
                    <i />
                    {pr.state}
                  </span>
                  <a href={pr.url} target="_blank" rel="noreferrer">
                    {pr.title}
                  </a>
                  <small>{pr.repo}</small>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Section>
  );
}

// ──────────────────────────────── skills ────────────────────────────────────

export function Skills() {
  const all = [...new Set(Object.values(profile.skills).flat())];
  return (
    <Section id="skills" title="Skills & Technologies">
      <SkillGrid skills={all} />
    </Section>
  );
}

// ──────────────────────────────── contact ───────────────────────────────────

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [mail, setMail] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <Section id="contact" title="Contact">
      <div className="contact">
        <p className="contact__lead">Have something worth building? I read every message and reply within a couple of days.</p>
        <div className="contact__actions">
          <Button variant="primary" type="button" onClick={() => setMail(true)} aria-haspopup="dialog">
            {Icon.mail()} Write to me
          </Button>
          <Button variant="secondary" type="button" onClick={copy} aria-live="polite">
            {copied ? Icon.check() : Icon.copy()}
            {copied ? "Copied" : profile.email}
          </Button>
        </div>
      </div>
      <EmailDialog open={mail} onOpenChange={setMail} />
    </Section>
  );
}

// ─────────────────────────────── highlights ─────────────────────────────────

/** Cover art or photo, with a drawn placeholder (title over a dot pattern) until one exists. */
function Art({ src, label, className }: { src?: string; label: string; className?: string }) {
  const [ok, fail] = useImageOk(src);
  return <div className={cn("art", className)}>{ok ? <img src={src} alt="" loading="lazy" decoding="async" onError={fail} /> : <span className="art__ph">{label}</span>}</div>;
}

/**
 * Highlights: wins and life off the clock in one bento grid.
 * Win (large) | Now playing / Places, then a shelf of finished games.
 * Not rendered at the moment (see App.tsx); kept for later.
 */
export function Wins() {
  const o = profile.offClock;
  const [place, setPlace] = useState(0);
  const pl = o.places[place];
  const win = profile.wins[0];

  return (
    <Section id="highlights" title="Highlights">
      <div className="bento">
        {win && (
          <a className="tile tile--win" href={win.link} target="_blank" rel="noreferrer">
            <Art src={win.image} label={win.title} className="tile__bg" />
            <div className="tile__shade" aria-hidden="true" />
            <div className="tile__meta">
              <span className="tile__kicker">
                <Trophy size={13} /> Win · {win.date}
              </span>
              <strong>{win.title}</strong>
              <small>
                {win.org} · {win.place}
              </small>
            </div>
            <span className="tile__go" aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          </a>
        )}

        <a className="tile tile--row tile--play" href={o.playing.link || undefined} target="_blank" rel="noreferrer">
          <Art src={o.playing.image} label={o.playing.title} className="tile__thumb" />
          <div className="tile__meta">
            <span className="tile__kicker">
              <i className="live" /> {o.playing.note}
            </span>
            <strong>{o.playing.title}</strong>
          </div>
        </a>

        <div className="tile tile--row tile--place">
          {pl && <Art key={pl.name} src={pl.image} label={pl.name} className="tile__thumb" />}
          <div className="tile__meta">
            <span className="tile__kicker">
              <MapPin size={13} /> {pl?.note}
            </span>
            <strong>{pl?.name}</strong>
            <small>{pl?.region}</small>
          </div>
          {o.places.length > 1 && (
            <div className="tile__dots" role="tablist" aria-label="Places">
              {o.places.map((x, i) => (
                <button key={x.name} type="button" role="tab" aria-selected={place === i} aria-label={x.name} className={cn(place === i && "on")} onClick={() => setPlace(i)} />
              ))}
            </div>
          )}
        </div>

        <div className="tile tile--shelf">
          <span className="tile__kicker">
            <Gamepad2 size={13} /> Played · {String(o.played.length).padStart(2, "0")}
          </span>
          <ul>
            {o.played.map((g) => (
              <li key={g.title}>
                <Art src={g.image} label={g.title} className="tile__cover" />
                <span>
                  <strong>{g.title}</strong>
                  <small>{g.note}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────── highlights ─────────────────────────────────

/**
 * Highlights: each achievement as its own card — framed image (same hover
 * waves as the projects), the event and date, the title, who ran it, tags,
 * and a direct link to the post. No "view project" sheet.
 */
export function Highlights() {
  return (
    <Section id="highlights" title="Highlights">
      <ul className="hlgrid">
        {achievements.map((a) => {
          const Tag = a.link ? "a" : "div";
          return (
            <li key={a.title}>
              <Tag className="hlc" {...(a.link ? { href: a.link, target: "_blank", rel: "noreferrer" } : {})}>
                {a.badge ? (
                  <>
                    <span className="hlc__stage" aria-hidden="true" />
                    <img className="hlc__badge" src={a.badge} alt="" loading="lazy" decoding="async" />
                  </>
                ) : (
                  a.image && <img className="hlc__img" src={a.image} alt="" loading="lazy" decoding="async" />
                )}
                <span className="hlc__fade" aria-hidden="true" />
                <span className="hlc__text">
                  <span className="hlc__kind">{a.kind}</span>
                  <strong>{a.title.split("— ")[1] ?? a.title}</strong>
                  <small>
                    {a.date} · {a.place}
                  </small>
                </span>
                {a.link && <ArrowUpRight className="hlc__go" size={15} aria-hidden="true" />}
              </Tag>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// ──────────────────────────────── certs ─────────────────────────────────────

export function Certs() {
  return (
    <Section id="certs" title="Certifications">
      <div className="swipe">
        <ul className="swipe__list" aria-label="Certifications">
          {profile.certs.map((c) => (
            <li className="swipe__row" key={c.title}>
              <a className="swipe__content" href={c.link} target="_blank" rel="noreferrer">
                <span className="role__logo">{c.image ? <img src={c.image} alt="" loading="lazy" decoding="async" /> : c.title.slice(0, 1)}</span>
                <span className="role__what swipe__body">
                  <strong>{c.title}</strong>
                  <span>Issued by {c.issuer} · Credly</span>
                </span>
                <span className="swipe__more" aria-hidden="true">
                  <ArrowUpRight size={17} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

// ─────────────────────────────── education ──────────────────────────────────

/** One icon per stage, newest first: degree, higher secondary, secondary school. */
const SCHOOL_ICONS = [GraduationCap, BookOpen, School];

export function Education() {
  return (
    <Section id="education" title="Education">
      <div className="swipe">
        <ul className="swipe__list" aria-label="Education">
          {profile.education.map((e, i) => {
            const Glyph = SCHOOL_ICONS[i] ?? GraduationCap;
            return (
            <li className="swipe__row" key={e.degree}>
              <div className="swipe__content">
                <span className="role__logo" aria-hidden="true">
                  <Glyph size={20} strokeWidth={1.75} />
                </span>
                <span className="role__what swipe__body">
                  <strong>{e.degree}</strong>
                  <span>{e.school}</span>
                </span>
                <span className="row__when">{e.dates}</span>
              </div>
            </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

// ──────────────────────────────── quote ─────────────────────────────────────

/** Pixel grid for the quote transition: 3:1 art, so 24 × 8 square cells. */
const PX_COLS = 24;
const PX_ROWS = 8;
const PX_MS = 650;

export function QuoteBand() {
  const n = profile.quotes.length;
  const reduce = useReducedMotion();
  const [i, setI] = useState(() => Math.floor(Math.random() * n));
  // While set, the next artwork is laid over the current one in square cells that pop in at random.
  const [incoming, setIncoming] = useState<number | null>(null);
  const [imgOk, fail] = useImageOk(profile.footerImage);
  const q = profile.quotes[i];
  const delays = useMemo(() => Array.from({ length: PX_COLS * PX_ROWS }, () => Math.random() * (PX_MS - 120)), [incoming]);

  // Warm the next artwork so the cells never show half-loaded.
  useEffect(() => {
    const next = profile.quotes[(i + 1) % n]?.image;
    if (next) new Image().src = next;
  }, [i, n]);

  const step = async () => {
    if (incoming !== null) return;
    const to = (i + 1) % n;
    const src = profile.quotes[to]?.image;
    if (!src || reduce) return setI(to);
    const img = new Image();
    img.src = src;
    await img.decode().catch(() => {});
    setIncoming(to);
    window.setTimeout(() => {
      setI(to);
      setIncoming(null);
    }, PX_MS);
  };

  if (q?.image) {
    const next = incoming !== null ? profile.quotes[incoming] : null;
    return (
      <figure className="quote quote--art band">
        <img className="quote__art" src={q.image} alt={`“${q.text}” — ${q.who}, ${q.anime}`} decoding="async" />
        {next?.image && (
          <div className="quote__px" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${PX_COLS}, 1fr)` }}>
            {delays.map((d, k) => {
              const c = k % PX_COLS;
              const r = Math.floor(k / PX_COLS);
              return (
                <span
                  key={k}
                  style={{
                    backgroundImage: `url(${next.image})`,
                    backgroundSize: `${PX_COLS * 100}% ${PX_ROWS * 100}%`,
                    backgroundPosition: `${(c / (PX_COLS - 1)) * 100}% ${(r / (PX_ROWS - 1)) * 100}%`,
                    animationDelay: `${d}ms`,
                  }}
                />
              );
            })}
          </div>
        )}
        {n > 1 && (
          <button type="button" className="quote__next" onClick={step} aria-label="Next quote">
            <RefreshCw size={14} />
          </button>
        )}
      </figure>
    );
  }

  return (
    <figure className="quote band">
      <div className="quote__bg" aria-hidden="true">
        {imgOk ? <img src={profile.footerImage} alt="" loading="lazy" decoding="async" onError={fail} /> : <DuskScene />}
      </div>
      {q && (
        <div className="quote__inner" key={i}>
          <blockquote>“{q.text}”</blockquote>
          <figcaption>
            <span>{q.who}</span>
            <small>{q.anime}</small>
          </figcaption>
        </div>
      )}
      {n > 1 && (
        <button type="button" className="quote__next" onClick={step} aria-label="Next quote">
          <RefreshCw size={14} />
        </button>
      )}
    </figure>
  );
}

// ──────────────────────────────── footer ────────────────────────────────────

export function Footer() {
  return (
    <footer className="foot band">
      <span>
        © {new Date().getFullYear()} {profile.name}
      </span>
      <a href="#top" className="foot__top">
        Back to top {Icon.up()}
      </a>
    </footer>
  );
}
