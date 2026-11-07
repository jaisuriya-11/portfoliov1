/**
 * Everything personal on the page lives here — edit this file, not the
 * components. Entries marked TODO are placeholders to replace.
 */

export interface Social {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "x" | "mail";
}

export interface Project {
  title: string;
  blurb: string;
  /** Screenshot URL (optional — a sakura-ink placeholder is drawn without one). */
  image?: string;
  site?: string;
  code?: string;
  tech: string[];
  status?: "live" | "building" | "archived";
  highlight?: string; // e.g. "500+ GitHub stars"
}

export interface Role {
  company: string;
  title: string;
  dates: string;
  place: string;
  logo?: string;
  points: string[];
  tech: string[];
}

export const profile = {
  name: "Jaisuriya Paranthaman",
  /** The single kanji on the seal. */
  seal: "桜",
  role: "Frontend Engineer",
  lines: [
    "I build calm, precise interfaces — the kind you stop noticing because they just work.",
    "Currently obsessed with motion, generative art and fast UIs.", // TODO: your own words
    "I ship small, polish hard, and sweat the last 10%.", // TODO
  ],
  location: "India", // TODO: city
  timeZone: "Asia/Kolkata",
  available: true,
  /** GitHub username for the contribution graph and pull requests. TODO: set it. */
  github: "",
  email: "hello@example.com", // TODO
  resume: "", // TODO: link to a PDF, or leave empty to hide
  socials: [
    { label: "GitHub", href: "https://github.com/", icon: "github" }, // TODO
    { label: "LinkedIn", href: "https://linkedin.com/in/", icon: "linkedin" }, // TODO
    { label: "X", href: "https://x.com/", icon: "x" }, // TODO
    { label: "Email", href: "mailto:hello@example.com", icon: "mail" }, // TODO
  ] as Social[],

  projects: [
    {
      title: "Sakura Garden", // TODO: real projects
      blurb: "A generative ink-painting background for the web — branches grow, blossoms open, petals ride the cursor's wind.",
      tech: ["SolidJS", "TypeScript", "Canvas"],
      status: "live",
      site: "#",
      code: "#",
    },
    {
      title: "Project Two",
      blurb: "One line on what it does and why it matters. Keep it short and concrete.",
      tech: ["React", "Node.js", "Postgres"],
      status: "building",
      code: "#",
    },
    {
      title: "Project Three",
      blurb: "Another short, concrete description of the problem and the result.",
      tech: ["TypeScript", "Vite"],
      status: "archived",
      highlight: "Featured on …",
    },
    {
      title: "Project Four",
      blurb: "Placeholder — swap in something you are proud of.",
      tech: ["Solid", "Tailwind"],
      status: "live",
      site: "#",
    },
  ] as Project[],

  experience: [
    {
      company: "Company Name", // TODO
      title: "Frontend Engineer",
      dates: "2024 — Present",
      place: "Remote",
      points: ["What you owned, in one line.", "A result with a number in it.", "Something you shipped that you are proud of."],
      tech: ["React", "TypeScript", "GraphQL"],
    },
    {
      company: "Previous Company",
      title: "Software Engineer Intern",
      dates: "2023 — 2024",
      place: "Chennai",
      points: ["What you learned and built.", "Impact, briefly."],
      tech: ["JavaScript", "CSS"],
    },
    {
      company: "Open Source",
      title: "Contributor",
      dates: "2022 — Present",
      place: "Internet",
      points: ["Projects you contributed to and what you changed."],
      tech: ["Git", "TypeScript"],
    },
  ] as Role[],

  skills: {
    Languages: ["TypeScript", "JavaScript", "HTML", "CSS"],
    Frameworks: ["SolidJS", "React", "Next.js", "Vite"],
    Craft: ["Motion", "Canvas & SVG", "Accessibility", "Design systems"],
    Tools: ["Git", "Figma", "Node.js", "Vercel"],
  } as Record<string, string[]>,
};
