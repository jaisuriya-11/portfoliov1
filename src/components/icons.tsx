import type { ReactNode } from "react";

/** Small stroke icons, 1.6px, currentColor. */
const base = (children: ReactNode, size = 18) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const Icon = {
  github: () =>
    base(<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />),
  linkedin: () =>
    base(
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
      </>,
    ),
  instagram: () =>
    base(
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5v.01" />
      </>,
    ),
  leetcode: () => base(<path d="M13.5 3 6.3 10.7a2 2 0 0 0 0 2.7l4.6 4.9a2 2 0 0 0 2.9 0L16 16M8.5 12.1h11M13.5 3l3 3" />),
  pin: () =>
    base(
      <>
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </>,
      14,
    ),
  shuffle: () => base(<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />, 14),
  x: () => base(<path d="M4 4l16 16M20 4L4 20" />),
  mail: () =>
    base(
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>,
    ),
  globe: () =>
    base(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>,
      16,
    ),
  code: () => base(<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />, 16),
  arrow: () => base(<path d="M7 17 17 7M8 7h9v9" />, 14),
  chevron: () => base(<path d="m6 9 6 6 6-6" />, 16),
  copy: () =>
    base(
      <>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </>,
      16,
    ),
  check: () => base(<path d="m5 12 5 5 9-10" />, 16),
  up: () => base(<path d="M12 19V5M6 11l6-6 6 6" />, 16),
  calendar: () =>
    base(
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>,
      15,
    ),
  search: () =>
    base(
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>,
      16,
    ),
  hash: () => base(<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16" />, 16),
  sun: () =>
    base(
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>,
      16,
    ),
};
