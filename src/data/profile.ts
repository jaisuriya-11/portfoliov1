/**
 * Everything personal on the page lives here — edit this file, not the
 * components. Entries marked TODO are placeholders to replace.
 */

export interface Social {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "x" | "mail" | "instagram" | "leetcode";
  /** Shown in the hover preview card. */
  handle?: string;
  blurb?: string;
  /** Name on the card if it differs from your full name (e.g. a username). */
  displayName?: string;
  verified?: boolean;
  /** Numbers in the card footer. GitHub and LeetCode fill theirs live. */
  stats?: { n: string | number; label: string }[];
}

export interface Project {
  title: string;
  blurb: string;
  /** Screenshot URL (optional — a sakura-ink placeholder is drawn without one). */
  image?: string;
  /** Screenshot of the site in its dark theme, shown when the portfolio is dark. Falls back to `image`. */
  imageDark?: string;
  site?: string;
  /** Label for the `site` button in the detail sheet (default "Visit site"). */
  siteLabel?: string;
  /** Card action label (default "View project") and image crop (default top). */
  viewLabel?: string;
  imagePos?: string;
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

export interface Win {
  title: string;
  date: string;
  place: string;
  org: string;
  image?: string;
  link?: string;
  tags: string[];
}

export interface Cert {
  title: string;
  issuer: string;
  image?: string;
  link: string;
}

export interface School {
  degree: string;
  school: string;
  dates: string;
}

export interface OffItem {
  title: string;
  note: string;
  image?: string;
  link?: string;
}

export interface Place {
  name: string;
  region: string;
  note: string;
  image?: string;
  visited: boolean;
}

export interface OffClock {
  playing: OffItem;
  played: OffItem[];
  places: Place[];
}

export interface Quote {
  text: string;
  who: string;
  anime: string;
  /** Artwork with the quote set into it; the text above becomes its alt text. */
  image?: string;
}

export const profile = {
  name: "Jaisuriya Paranthaman",
  role: "Full Stack Developer",
  /**
   * Wide image across the top of the column. `bannerNight` (optional) replaces it in dark mode.
   * Earlier banners are still in public/: banner.jpg + banner-night.jpg (painting), banner-panels.webp (Fuji panels).
   */
  banner: "/hands-day.jpg",
  bannerNight: "/hands-night.jpg" as string | undefined,
  /** Square photo in the profile row. */
  avatar: "/avatar-skull.png",
  /** Second avatar, swapped in when the avatar is clicked (white rays behind it). */
  avatarAlt: "/avatar.png",
  /** First line of the bio. `**word**` renders bold. */
  intro:
    "Hey, I'm a developer who turns **caffeine into code** and random ideas into things that actually work. ☕",
  /** Lines under the intro. `**word**` renders bold, `` `code` `` renders as inline code. */
  lines: [
    "I love **building for the web**, playing with creative designs, and making tiny details unnecessarily perfect. I break things, fix things, and occasionally wonder why a `div` isn't behaving.",
    "Here to make the internet a little more interesting, **one pixel at a time**. ✨",
  ],
  /** Booking link (Cal.com, Calendly…) for the "Book an intro call" button. Empty hides it. */
  call: "",
  location: "Chennai, India",
  timeZone: "Asia/Kolkata",
  available: false,
  /** GitHub username for the contribution graph and pull requests. */
  github: "jaisuriya-11",
  email: "jaisuriya200297@gmail.com",
  resume: "/projects/resume.pdf",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jaisuriya-p-k-7156a2236/", icon: "linkedin", handle: "in/jaisuriyapk", blurb: "Associate Software Engineer @Toddle · Full Stack Developer", stats: [] /* TODO e.g. { n: "500+", label: "Connections" } */ },
    { label: "GitHub", href: "https://github.com/jaisuriya-11", icon: "github", handle: "@jaisuriya-11", blurb: "React, Laravel and cloud experiments — the code behind the projects here." },
    { label: "Instagram", href: "https://www.instagram.com/jai_.suriya/", icon: "instagram", handle: "@jai_.suriya", blurb: "Life outside the editor.", displayName: "jai_.suriya", stats: [] /* TODO e.g. { n: 120, label: "Posts" }, { n: "1K", label: "Followers" } */ },
    { label: "LeetCode", href: "https://leetcode.com/u/jai_sa/", icon: "leetcode", handle: "@jai_sa", blurb: "Daily problem solving, one submission at a time." },
    { label: "Email", href: "mailto:jaisuriya200297@gmail.com", icon: "mail" },
  ] as Social[],

  projects: [
    {
      title: "Tsuzuri",
      blurb: "Block-based notebook for the terminal. Plain Markdown files, Vim editing, live preview, boards, calendars and 96 themes.",
      image: "/projects/tsuzuri.jpg",
      imageDark: "/projects/tsuzuri-dark.jpg",
      site: "https://tsuzuri-site-eyla.vercel.app/",
      code: "https://github.com/jaisuriya-11/tsuzuri",
      tech: ["Go", "JavaScript", "CSS"],
      status: "live",
      highlight: "355+ stars on GitHub",
    },
    {
      title: "CodeTurtle",
      blurb: "Open-source AI code review for GitHub PRs and GitLab MRs with any OpenAI-compatible model. Runs locally: no server, no webhooks.",
      image: "/projects/codeturtle.jpg",
      imageDark: "/projects/codeturtle-dark.jpg",
      site: "https://codeturtle-docs.vercel.app/",
      code: "https://github.com/jaisuriya-11/codeturtle",
      tech: ["TypeScript", "Node.js", "GitHub", "LLM"],
      status: "live",
    },
    {
      title: "SchemaFlow",
      blurb: "Design databases at the speed of thought.",
      image: "/projects/schemaflow.jpg",
      site: "https://schema-to-board.vercel.app/",
      tech: ["React", "JavaScript"],
      status: "live",
    },
    {
      title: "Todo App",
      blurb: "Blockchain-based todo application with smart contracts.",
      image: "/projects/todo-app.jpg",
      site: "https://5rhf7-eqaaa-aaaal-aczua-cai.icp0.io/",
      tech: ["Juno", "React"],
      status: "live",
    },
    {
      title: "MediCare Hub: High Availability on AWS",
      blurb: "Highly available, fault-tolerant healthcare app on AWS.",
      image: "/projects/medicare-aws.jpg",
      site: "https://www.linkedin.com/posts/jaisuriya-p-k-7156a2236_aws-cloudcomputing-reliability-activity-7382701401333927936-Hb56",
      tech: ["AWS", "EC2", "ALB", "RDS", "EFS", "Route 53", "CloudWatch"],
    },
  ] as Project[],

  experience: [
    {
      company: "Toddle",
      title: "Associate Software Engineer",
      dates: "Feb 2026 — Present",
      place: "Full-time",
      logo: "https://www.google.com/s2/favicons?domain=toddleapp.com&sz=128",
      points: [
        "Triaged and resolved frontend bugs and support tickets across a React-based platform, ensuring high product reliability and user satisfaction.",
        "Contributed to feature development as a product-focused frontend engineer, translating design requirements into polished, maintainable React components.",
        "Identified and addressed performance bottlenecks in React rendering and Webpack build pipelines, improving overall application responsiveness.",
      ],
      tech: ["React", "Webpack", "HTML", "CSS", "JavaScript", "GraphQL"],
    },
    {
      company: "Whirldata",
      title: "Solution Engineer",
      dates: "Dec 2024 — Feb 2026",
      place: "Full-time",
      logo: "https://www.google.com/s2/favicons?domain=whirldatascience.com&sz=128",
      points: [
        "Engineered a robust visualization module for 400k+ invoice cases using Recharts in React, improving financial auditing efficiency by 30%.",
        "Enhanced real-time discrepancy tracking, boosting user efficiency by 25% and reducing manual errors.",
        "Optimized Laravel data export for 400K+ records using queued jobs, reducing export time from 5 minutes to 60 seconds.",
        "Migrated UI from Syncfusion (paid) to Rsuite (open source), reducing licensing costs by 40% while maintaining feature parity.",
      ],
      tech: ["React", "Recharts", "Laravel", "Data Visualization", "Rsuite"],
    },
    {
      company: "Whirldata",
      title: "Solution Trainee",
      dates: "Mar 2024 — Dec 2024",
      place: "Intern",
      logo: "https://www.google.com/s2/favicons?domain=whirldatascience.com&sz=128",
      points: ["Started at Whirldata as a trainee, building React and Laravel features before converting to a full-time role."], // TODO: your own words
      tech: ["React", "Laravel"],
    },
  ] as Role[],

  skills: {
    Frontend: ["React", "React Native", "Redux", "JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind", "Webpack", "GraphQL"],
    Backend: ["Laravel", "Node.js", "Python", "Java", "Go", "MySQL"],
    "Cloud & tools": ["AWS", "Docker", "Linux", "Git", "GitHub", "Figma", "Claude"],
  } as Record<string, string[]>,

  wins: [
    {
      title: "Agentic Premier League — Digital Champion",
      date: "May 2026",
      place: "Chennai, India",
      org: "Organized by Google Cloud",
      image: "/projects/Chennai_Champion.jpg",
      link: "https://www.linkedin.com/posts/jaisuriya-p-k-7156a2236_googlecloud-buildwithai-googlecloudapl-share-7461669793603964928-O9jJ",
      tags: ["Agentic AI", "Gemini", "Vibe Coding", "JavaScript", "Python"],
    },
  ] as Win[],

  certs: [
    {
      title: "AWS Certified Cloud Practitioner (CCP)",
      issuer: "Amazon Web Services Training and Certification",
      image: "/projects/aws-ccp.png",
      link: "https://www.credly.com/badges/4c97d390-66db-40ec-b617-f067ddd92f55",
    },
    {
      title: "Networking Basics",
      issuer: "Cisco",
      image: "/projects/cisco-networking.png",
      link: "https://www.credly.com/badges/6d4b641f-ecd9-4c51-8c2e-a979ef504efe",
    },
  ] as Cert[],

  education: [
    { degree: "B.E Computer Science", school: "Rajalakshmi Engineering College, Chennai", dates: "2020 — 2024" },
    { degree: "HSC", school: "Mount Park Higher Secondary School, Kallakurichi", dates: "2019 — 2020" },
    { degree: "SSLC", school: "Saraswathi Vidyalaya Matric School, Vellore", dates: "2017 — 2018" },
  ] as School[],

  /**
   * "Off the clock" grid. Put cover art / photos in `public/off/` and point
   * `image` at them; without an image a drawn placeholder shows.
   * TODO: replace these placeholders with your own games and places.
   */
  offClock: {
    playing: { title: "Your current game", note: "Playing now", image: "", link: "" },
    played: [
      { title: "Game one", note: "Finished 2026", image: "" },
      { title: "Game two", note: "Finished 2025", image: "" },
      { title: "Game three", note: "Finished 2025", image: "" },
    ],
    places: [
      { name: "Chennai", region: "Tamil Nadu, India", note: "Home", image: "", visited: true },
      { name: "A place you've been", region: "Somewhere", note: "Visited · 2025", image: "", visited: true },
    ],
  } as OffClock,

  /** Footer quotes — a random one shows first; the button steps through the rest in order. */
  quotes: [
    { text: "If I can't be equal to a God, I'll make a God equal to me.", who: "Magna Swing", anime: "Black Clover", image: "/quotes/magna.jpg" },
    { text: "Kids who never seen peace and kids who never seen war have different values!", who: "Donquixote Doflamingo", anime: "One Piece", image: "/quotes/doflamingo.jpg" },
    { text: "The only way to deal with this cruel world is to become so strong that your very existence becomes an act of rebellion.", who: "Toji Fushiguro", anime: "Jujutsu Kaisen", image: "/quotes/toji.jpg" },
    { text: "As long as I'm alive there are infinite chances.", who: "Monkey D. Luffy", anime: "One Piece", image: "/quotes/luffy.jpg" },
    { text: "Nothing can be gained without losing; even heaven demands death.", who: "Eren Yeager", anime: "Attack on Titan", image: "/quotes/eren.jpg" },
  ] as Quote[],
  /** Optional image behind the footer quote (`public/footer.jpg`). A drawn dusk scene shows without it. */
  footerImage: "/footer.jpg",
};

/**
 * What each social hover card shows — copied from the real profiles.
 * GitHub follower/repo counts and LeetCode solved counts refresh live when
 * the card opens; everything else is a snapshot, so update it now and then.
 */
export const cards = {
  github: {
    avatar: "/social/gh.jpg",
    name: "Jaisuriya Paranthaman",
    login: "jaisuriya-11",
    pronouns: "he/him",
    followers: 4,
    following: 4,
    location: "Probably with girls",
    site: "https://jaisur.vercel.app/",
    linkedin: "in/jaisuriya-p-k-7156a2236",
    pinned: { name: "tsuzuri", about: "Block-based notebook for the terminal. Plain Markdown files, Vim editing, live preview, boards, calendars and 96 themes.", lang: "Go", langColor: "#00ADD8", stars: 353, forks: 13 },
  },
  instagram: {
    avatar: "/social/ig.jpg",
    username: "jai_.suriya",
    name: "Jai",
    posts: 0,
    followers: 216,
    following: 455,
    bio: ["REC '24", "🍀"],
  },
  linkedin: {
    banner: "/social/li-banner.jpg",
    avatar: "/social/li.jpg",
    name: "Jaisuriya P K",
    pronouns: "He/Him",
    headline: "Associate Software Engineer @Toddle",
    location: "Chennai, Tamil Nadu, India",
    followers: 487,
    connections: 428,
    orgs: [
      { name: "Toddle - Your Teaching Partner", logo: "/social/toddle.png" },
      { name: "Rajalakshmi Engineering College", logo: "/social/rec.png" },
    ],
  },
  leetcode: {
    avatar: "/social/lc.jpg",
    name: "Jaisuriya",
    username: "jai_sa",
    rank: "461,622",
    following: 0,
    followers: 0,
    rating: "1,480",
    badge: "50 Days Badge 2025",
    solved: { all: 325, easy: 203, medium: 116, hard: 6 },
    totals: { all: 4105, easy: 975, medium: 2142, hard: 988 },
  },
};
