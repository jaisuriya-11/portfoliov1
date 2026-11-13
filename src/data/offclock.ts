/**
 * "Off the clock": achievements, games and places. Shown as a bento on the
 * home page and in full on /games and /places.
 */

export interface Achievement {
  title: string;
  kind: string;
  date: string;
  place: string;
  org: string;
  image?: string;
  /** A round badge (square image, shown clipped to a circle) set on its own backdrop instead of a full-bleed photo. */
  badge?: string;
  link?: string;
  /** A sentence for the highlight card. */
  blurb?: string;
  tags?: string[];
}

export const achievements: Achievement[] = [
  {
    title: "Agentic Premier League — Digital Champion",
    kind: "Hackathon",
    date: "May 2026",
    place: "Chennai, India",
    org: "Organized by Google Cloud",
    image: "/projects/apl-champion-badge.jpg",
    badge: "/projects/apl-badge.jpg",
    link: "https://www.linkedin.com/posts/jaisuriya-p-k-7156a2236_googlecloud-buildwithai-googlecloudapl-share-7461669793603964928-O9jJ",
    blurb: "Won the Chennai round of Google Cloud's Agentic Premier League — building with agentic AI and Gemini under the clock.",
    tags: ["Agentic AI", "Gemini", "JavaScript", "Python"],
  },
  {
    title: "Agentic Premier League — Top 15, Grand Finale",
    kind: "Hackathon",
    date: "2026",
    place: "Google Ananta, Bengaluru",
    org: "Google Cloud · GDG Chennai",
    image: "/projects/apl-top15-group.jpg",
    blurb: "Made the Top 15 at the Grand Finale, competing live at Google's Ananta office in Bengaluru.",
    tags: ["Agentic AI", "Google Cloud", "GDG"],
    link: "https://www.linkedin.com/posts/jaisuriya-p-k-7156a2236_googlecloud-agenticai-genai-ugcPost-7464333953055764480-leF3/",
  },
];

export type GameStatus = "playing" | "played" | "backlog";

export interface Game {
  title: string;
  status: GameStatus;
  /** Cover art (Steam library art, saved in public/games). */
  cover?: string;
  /** Wide key art for full-bleed tiles, and its crop. */
  banner?: string;
  bannerPos?: string;
  /** CSS object-position for the cover crop (for landscape art cropped to a portrait tile). */
  coverPos?: string;
  /** Store or official page. */
  link?: string;
  note?: string;
  /** Short store description. */
  about?: string;
  dev?: string;
  year?: string;
  genres?: string[];
}

const steam = (id: number) => ({ cover: `/games/${id}.jpg`, link: `https://store.steampowered.com/app/${id}/` });

export const games: Game[] = [
  { title: "Tiny Glade", status: "playing", ...steam(2198150), banner: "/games/2198150-hero.jpg", bannerPos: "38% 50%", about: "Tiny Glade is a small diorama builder where you doodle whimsical castles, cozy cottages & romantic ruins. Explore gridless building chemistry as the game adorns your glades with procedural detail. No management, combat\u2026", dev: "Pounce Light", year: "2024", genres: ["Casual", "Indie", "Simulation"], link: "https://store.steampowered.com/news/app/2198150/view/692009343487311899" },
  {
    title: "Valorant",
    status: "playing",
    cover: "/games/valorant.jpg",
    coverPos: "44% 50%",
    banner: "/games/valorant.jpg",
    bannerPos: "42% 30%",
    link: "https://playvalorant.com/",
    about: "A 5v5 character-based tactical shooter: precise gunplay meets unique agent abilities.",
    dev: "Riot Games",
    year: "2020",
    genres: ["Tactical shooter", "Free to play"],
  },

  { title: "God of War", status: "played", ...steam(1593500), about: "His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters. It is in this harsh, unforgiving world that he must fight to survive\u2026 and teach his son to\u2026", dev: "Santa Monica Studio, Jetpack Interactive", year: "2022", genres: ["Action", "Adventure", "RPG"], note: "Completed." },
  { title: "Ghost of Tsushima Director's Cut", status: "played", ...steam(2215430), about: "A storm is coming. Venture into the complete Ghost of Tsushima DIRECTOR\u2019S CUT on PC; forge your own path through this open-world action adventure and uncover its hidden wonders. Brought to you by Sucker Punch\u2026", dev: "Sucker Punch Productions, Nixxes Software", year: "2024", genres: ["Action", "Adventure"], note: "Completed." },
  { title: "Grand Theft Auto: Vice City", status: "played", ...steam(12110), about: "Welcome to Vice City. Welcome to the 1980s. From the decade of big hair, excess and pastel suits comes a story of one man's rise to the top of the criminal pile.", dev: "Rockstar Games", year: "2008", genres: ["Action"], note: "Completed." },
  { title: "Grand Theft Auto: San Andreas", status: "played", ...steam(12120), about: "Five years ago Carl Johnson escaped from the pressures of life in Los Santos, San Andreas... a city tearing itself apart with gang trouble, drugs and corruption. Where filmstars and millionaires do their best to avoid\u2026", dev: "Rockstar Games", year: "2008", genres: ["Action"], note: "Completed." },
  { title: "Hollow Knight: Silksong", status: "played", ...steam(1030300), about: "Discover a vast, haunted kingdom in Hollow Knight: Silksong! Explore, fight and survive as you ascend to the peak of a land ruled by silk and song.", dev: "Team Cherry", year: "2025", genres: ["Action","Adventure","Indie"], note: "Completed." },
  { title: "Sleeping Dogs", status: "played", ...steam(202170), about: "As Wei Shen, an undercover cop trying to take down the Triads, you'll have to fight your way up the organization without blowing your cover.", dev: "United Front Games", year: "2012", genres: ["Action", "Adventure"], note: "Completed." },

  { title: "Red Dead Redemption 2", status: "backlog", ...steam(1174180), about: "Arthur Morgan and the Van der Linde Gang are outlaws on the run. With federal agents and bounty hunters massing on their heels, the gang must rob, steal, and fight their way across the rugged heartland in order to\u2026", dev: "Rockstar Games", year: "2019", genres: ["Action", "Adventure"] },
  { title: "Elden Ring", status: "backlog", ...steam(1245620), about: "THE CRITICALLY ACCLAIMED FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.", dev: "FromSoftware, Inc.", year: "2022", genres: ["Action", "RPG"] },
  { title: "Cyberpunk 2077", status: "backlog", ...steam(1091500), about: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City \u2014 a dangerous megalopolis obsessed with power, glamor, and ceaseless body modification.", dev: "CD PROJEKT RED", year: "2020", genres: ["RPG"] },
  { title: "The Witcher 3: Wild Hunt", status: "backlog", ...steam(292030), about: "The Witcher 3: Wild Hunt \u2014 Remastered modernizes the acclaimed role-playing game with a range of upgrades and enhancements. Become monster slayer for hire Geralt of Rivia and journey across a dark fantasy open world in\u2026", dev: "CD PROJEKT RED", year: "2015", genres: ["RPG"] },
  { title: "God of War Ragnarök", status: "backlog", ...steam(2322010), about: "Kratos and Atreus embark on a mythic journey for answers before Ragnar\u00f6k arrives \u2013 now on PC.", dev: "Santa Monica Studio, Jetpack Interactive", year: "2024", genres: ["Action", "Adventure", "RPG"] },
  { title: "Baldur's Gate 3", status: "backlog", ...steam(1086940), about: "Baldur\u2019s Gate 3 is a story-rich, party-based RPG set in the universe of Dungeons & Dragons, where your choices shape a tale of fellowship and betrayal, survival and sacrifice, and the lure of absolute power.", dev: "Larian Studios", year: "2023", genres: ["Adventure", "RPG", "Strategy"] },
  { title: "Sekiro: Shadows Die Twice", status: "backlog", ...steam(814380), about: "Game of the Year - The Game Awards 2019 Best Action Game of 2019 - IGN Carve your own clever path to vengeance in the award winning adventure from developer FromSoftware, creators of Bloodborne and the Dark Souls\u2026", dev: "FromSoftware, Inc.", year: "2019", genres: ["Action", "Adventure"] },
  { title: "Black Myth: Wukong", status: "backlog", ...steam(2358720), about: "Black Myth: Wukong is an action RPG rooted in Chinese mythology. You shall set out as the Destined One to venture into the challenges and marvels ahead, to uncover the obscured truth beneath the veil of a glorious\u2026", dev: "Game Science", year: "2024", genres: ["Action", "Adventure", "RPG"] },
  { title: "Hollow Knight", status: "backlog", ...steam(367520), about: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a classic\u2026", dev: "Team Cherry", year: "2017", genres: ["Action", "Adventure", "Indie"] },
  { title: "Hades", status: "backlog", ...steam(1145360), about: "Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion, Transistor, and Pyre.", dev: "Supergiant Games", year: "2020", genres: ["Action", "Indie", "RPG"] },
];

export interface Place {
  name: string;
  region: string;
  visited: boolean;
  date?: string;
  /** Short description of the place. */
  about?: string;
  /** My own note (visited places). */
  note?: string;
  image?: string;
  /** For stand-in photos (places not visited yet): author · licence, and the source page. */
  credit?: string;
  creditLink?: string;
}

const cc = (credit: string, creditLink: string) => ({ credit, creditLink });

export const places: Place[] = [
  {
    name: "Kanthalloor",
    region: "Idukki, Kerala",
    visited: true,
    date: "Aug 2025",
    image: "/places/kanthalloor.jpg",
    about: "A quiet hill village near Munnar, known for its terraced farms, orchards and the mist that rolls in over the Western Ghats.",
  },
  {
    name: "Kolli Hills",
    region: "Namakkal, Tamil Nadu",
    visited: true,
    date: "Aug 2024",
    image: "/places/kolli-hills.jpg",
    about: "Reached by a road of 70 hairpin bends, with sweeping views across the plains from the edge of the Eastern Ghats.",
  },
  {
    name: "Calicut",
    region: "Kozhikode, Kerala",
    visited: true,
    date: "Sep 2026",
    image: "/places/calicut.jpg",
    note: "My first solo trip. I wandered the old streets and the murals on my own, figured things out as I went, and came back having learned a lot — about travelling, and about myself.",
  },
  {
    name: "N4 Beach",
    region: "Chennai, Tamil Nadu",
    visited: true,
    date: "Jun 2026",
    image: "/places/n4-beach.jpg",
    note: "An evening out with friends on the north Chennai coast — sitting by the water, watching the fishing boats come in against the harbour cranes.",
  },

  {
    name: "Kochi",
    region: "Kerala, India",
    visited: false,
    image: "/places/kochi.jpg",
    about: "Chinese fishing nets against the sunset, colonial lanes in Fort Kochi, and the backwaters close by.",
    ...cc("Bockomet \u00b7 CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Fishing_nets_in_Fort_Kochi.jpg"),
  },
  {
    name: "Ladakh",
    region: "India",
    visited: false,
    image: "/places/ladakh.jpg",
    about: "High desert, monasteries and mountain passes, with Pangong Tso's impossible blue stretching to Tibet.",
    ...cc("Stanzin1945 \u00b7 CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Pangong_Tso_in_eastern_Ladakh(Changthang).jpg"),
  },
  {
    name: "Japan",
    region: "Asia",
    visited: false,
    image: "/places/japan.jpg",
    about: "Mount Fuji framed by the Chureito Pagoda, then Kyoto's temples and Tokyo's neon.",
    ...cc("Dang Son \u00b7 CC0", "https://commons.wikimedia.org/wiki/File:12-Chureito-pagoda-and-Mount-Fuji-Japan_(29677439878).jpg"),
  },
  {
    name: "Thailand",
    region: "Asia",
    visited: false,
    image: "/places/thailand.jpg",
    about: "Limestone cliffs dropping into turquoise water at Railay, and street food everywhere in between.",
    ...cc("Wendy Harman \u00b7 CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Railay.jpg"),
  },
  {
    name: "Paris",
    region: "France",
    visited: false,
    image: "/places/paris.jpg",
    about: "The Eiffel Tower from the Trocadéro fountains, the Seine, and long walks through old streets and museums.",
    ...cc("NonOmnisMoriar \u00b7 CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Eiffel_tower_from_trocadero.jpg"),
  },
  {
    name: "Los Angeles",
    region: "California, USA",
    visited: false,
    image: "/places/los-angeles.jpg",
    about: "Griffith Observatory above the city, the Hollywood Sign on the hills, beaches on the other side.",
    ...cc("dconvertini \u00b7 CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Griffith_Observatory,_Los_Angeles1.jpg"),
  },
];


export type AnimeStatus = "watching" | "watched" | "plan";

export interface Anime {
  title: string;
  status: AnimeStatus;
  year: number;
  studio: string;
  cover: string;
  link: string;
}

/**
 * Anime: watching, watched and want to watch (covers and details from AniList,
 * saved in public/anime).
 */
export const anime: Anime[] = [
  { status: "watched", title: "One Piece", year: 1999, studio: "Toei Animation", cover: "/anime/one-piece.jpg", link: "https://anilist.co/anime/21" },
  { status: "watched", title: "Naruto", year: 2002, studio: "Studio Pierrot", cover: "/anime/naruto.jpg", link: "https://anilist.co/anime/20" },
  { status: "watched", title: "Bleach", year: 2004, studio: "Studio Pierrot", cover: "/anime/bleach.jpg", link: "https://anilist.co/anime/269" },
  { status: "watched", title: "Attack on Titan", year: 2013, studio: "Wit Studio", cover: "/anime/attack-on-titan.jpg", link: "https://anilist.co/anime/16498" },
  { status: "watched", title: "Demon Slayer: Kimetsu no Yaiba", year: 2019, studio: "ufotable", cover: "/anime/demon-slayer-kimetsu-no-yaiba.jpg", link: "https://anilist.co/anime/101922" },
  { status: "watched", title: "Haikyu!!", year: 2014, studio: "Production I.G", cover: "/anime/haikyu.jpg", link: "https://anilist.co/anime/20464" },
  { status: "watched", title: "Summer Time Rendering", year: 2022, studio: "OLM", cover: "/anime/summer-time-rendering.jpg", link: "https://anilist.co/anime/129201" },
  { status: "watched", title: "Death Note", year: 2006, studio: "Madhouse", cover: "/anime/death-note.jpg", link: "https://anilist.co/anime/1535" },
  { status: "watched", title: "Jujutsu Kaisen", year: 2020, studio: "MAPPA", cover: "/anime/jujutsu-kaisen.jpg", link: "https://anilist.co/anime/113415" },
  { status: "watched", title: "Chainsaw Man", year: 2022, studio: "MAPPA", cover: "/anime/chainsaw-man.jpg", link: "https://anilist.co/anime/127230" },
  { status: "watched", title: "Daemons of the Shadow Realm", year: 2026, studio: "Bones Film", cover: "/anime/daemons-of-the-shadow-realm.jpg", link: "https://anilist.co/anime/195600" },
  { status: "watching", title: "Black Clover", year: 2017, studio: "Studio Pierrot", cover: "/anime/black-clover.jpg", link: "https://anilist.co/anime/97940" },
  { status: "plan", title: "Dragon Ball Z", year: 1989, studio: "Toei Animation", cover: "/anime/dragon-ball-z.jpg", link: "https://anilist.co/anime/813" },
  { status: "plan", title: "Dr. Stone", year: 2019, studio: "TMS Entertainment", cover: "/anime/dr-stone.jpg", link: "https://anilist.co/anime/105333" },
  { status: "plan", title: "Fullmetal Alchemist: Brotherhood", year: 2009, studio: "Bones", cover: "/anime/fullmetal-alchemist-brotherhood.jpg", link: "https://anilist.co/anime/5114" },
  { status: "plan", title: "Tokyo Revengers", year: 2021, studio: "Liden Films", cover: "/anime/tokyo-revengers.jpg", link: "https://anilist.co/anime/120120" },
];
