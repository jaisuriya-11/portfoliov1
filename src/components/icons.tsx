import type { JSX } from "solid-js";

/** Small stroke icons, 1.6px, currentColor. */
const base = (children: JSX.Element, size = 18) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
};
