/**
 * Animated Lucide icons (animateicons.in, `@animateicons/react`) with the same
 * props the app already passes to `lucide-react` icons, so a file only has to
 * change its import.
 *
 * The icons animate when the thing they sit in is hovered or focused — the
 * nearest button, link, tab or label — not only the tiny glyph itself.
 * They respect reduced-motion. `strokeWidth` is accepted for compatibility but
 * the animated set draws at its own stroke width.
 */
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudIcon,
  CodeXmlIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  GamepadIcon,
  GithubIcon,
  GlobeIcon,
  GraduationCapIcon,
  HashIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  MoonIcon,
  RefreshCwIcon,
  SchoolIcon,
  SearchIcon,
  ShuffleIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  SunIcon,
  TrophyIcon,
  TwitterIcon,
  WrenchIcon,
  XIcon,
} from "@animateicons/react/lucide";
import { useEffect, useRef, type ComponentType, type CSSProperties, type Ref } from "react";

type Handle = { startAnimation: () => void; stopAnimation: () => void };
type AnimatedComp = ComponentType<{ size?: number; color?: string; ref?: Ref<Handle> }>;

export type IconProps = {
  size?: number | string;
  /** lucide-style width/height also work; the icon is square, so width wins. */
  width?: number | string;
  height?: number | string;
  strokeWidth?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
  "aria-label"?: string;
};

/** What counts as the icon's "control": hovering or focusing it plays the animation. */
const HOST = 'a, button, [role="button"], [role="tab"], [role="menuitem"], label, summary';

function wrap(Comp: AnimatedComp, name: string) {
  function Icon({ size, width, height, color, className, style, "aria-label": label }: IconProps) {
    const px = Number(width ?? height ?? size ?? 24);
    const handle = useRef<Handle>(null);
    const self = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      const el = self.current?.closest(HOST) ?? self.current;
      if (!el) return;
      const on = () => handle.current?.startAnimation();
      const off = () => handle.current?.stopAnimation();
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", off);
      el.addEventListener("focusin", on);
      el.addEventListener("focusout", off);
      return () => {
        el.removeEventListener("pointerenter", on);
        el.removeEventListener("pointerleave", off);
        el.removeEventListener("focusin", on);
        el.removeEventListener("focusout", off);
      };
    }, []);

    return (
      <span ref={self} className={className ? `aicon ${className}` : "aicon"} style={style} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
        <Comp ref={handle} size={px} color={color} />
      </span>
    );
  }
  Icon.displayName = name;
  return Icon;
}

export const ArrowLeft = wrap(ArrowLeftIcon as AnimatedComp, "ArrowLeft");
export const ArrowRight = wrap(ArrowRightIcon as AnimatedComp, "ArrowRight");
export const ArrowUpRight = wrap(ArrowUpRightIcon as AnimatedComp, "ArrowUpRight");
export const BookOpen = wrap(BookOpenIcon as AnimatedComp, "BookOpen");
export const ChevronDown = wrap(ChevronDownIcon as AnimatedComp, "ChevronDown");
export const ChevronLeft = wrap(ChevronLeftIcon as AnimatedComp, "ChevronLeft");
export const ChevronRight = wrap(ChevronRightIcon as AnimatedComp, "ChevronRight");
export const Cloud = wrap(CloudIcon as AnimatedComp, "Cloud");
export const Code2 = wrap(CodeXmlIcon as AnimatedComp, "Code2");
export const Download = wrap(DownloadIcon as AnimatedComp, "Download");
export const ExternalLink = wrap(ExternalLinkIcon as AnimatedComp, "ExternalLink");
export const Eye = wrap(EyeIcon as AnimatedComp, "Eye");
export const Globe = wrap(GlobeIcon as AnimatedComp, "Globe");
export const GraduationCap = wrap(GraduationCapIcon as AnimatedComp, "GraduationCap");
export const MapPin = wrap(MapPinIcon as AnimatedComp, "MapPin");
export const RefreshCw = wrap(RefreshCwIcon as AnimatedComp, "RefreshCw");
export const School = wrap(SchoolIcon as AnimatedComp, "School");
export const Search = wrap(SearchIcon as AnimatedComp, "Search");
export const Sparkles = wrap(SparklesIcon as AnimatedComp, "Sparkles");
export const Trophy = wrap(TrophyIcon as AnimatedComp, "Trophy");
export const Wrench = wrap(WrenchIcon as AnimatedComp, "Wrench");
export const X = wrap(XIcon as AnimatedComp, "X");
export const ArrowUp = wrap(ArrowUpIcon as AnimatedComp, "ArrowUp");
export const Calendar = wrap(CalendarIcon as AnimatedComp, "Calendar");
export const Check = wrap(CheckIcon as AnimatedComp, "Check");
export const Copy = wrap(CopyIcon as AnimatedComp, "Copy");
export const Gamepad = wrap(GamepadIcon as AnimatedComp, "Gamepad");
export const Github = wrap(GithubIcon as AnimatedComp, "Github");
export const Hash = wrap(HashIcon as AnimatedComp, "Hash");
export const Instagram = wrap(InstagramIcon as AnimatedComp, "Instagram");
export const Linkedin = wrap(LinkedinIcon as AnimatedComp, "Linkedin");
export const Mail = wrap(MailIcon as AnimatedComp, "Mail");
export const Moon = wrap(MoonIcon as AnimatedComp, "Moon");
export const Shuffle = wrap(ShuffleIcon as AnimatedComp, "Shuffle");
export const SlidersHorizontal = wrap(SlidersHorizontalIcon as AnimatedComp, "SlidersHorizontal");
export const Sun = wrap(SunIcon as AnimatedComp, "Sun");
export const Twitter = wrap(TwitterIcon as AnimatedComp, "Twitter");
