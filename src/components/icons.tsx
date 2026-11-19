import type { ReactNode } from "react";
import { ArrowUp, ArrowUpRight, Calendar, Check, ChevronDown, Code2, Copy, Github, Globe, Hash, Instagram, Linkedin, Mail, MapPin, Search, Shuffle, Sun, Twitter } from "../lib/animated-icons";

/** Small stroke icons, currentColor. All animated (animateicons.in) except the LeetCode mark, which has no animated version. */
const base = (children: ReactNode, size = 18) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const Icon = {
  github: () => <Github size={18} />,
  linkedin: () => <Linkedin size={18} />,
  instagram: () => <Instagram size={18} />,
  // No animated LeetCode mark exists, so this one gets a small CSS wiggle on hover instead (.icon-leetcode).
  leetcode: () => <span className="aicon icon-leetcode">{base(<path d="M13.5 3 6.3 10.7a2 2 0 0 0 0 2.7l4.6 4.9a2 2 0 0 0 2.9 0L16 16M8.5 12.1h11M13.5 3l3 3" />)}</span>,
  pin: () => <MapPin size={18} />,
  shuffle: () => <Shuffle size={14} />,
  x: () => <Twitter size={18} />,
  mail: () => <Mail size={18} />,
  globe: () => <Globe size={18} />,
  code: () => <Code2 size={16} />,
  arrow: () => <ArrowUpRight size={14} />,
  chevron: () => <ChevronDown size={16} />,
  copy: () => <Copy size={16} />,
  check: () => <Check size={16} />,
  up: () => <ArrowUp size={16} />,
  calendar: () => <Calendar size={18} />,
  search: () => <Search size={16} />,
  hash: () => <Hash size={16} />,
  sun: () => <Sun size={16} />,
};
