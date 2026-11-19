import { useEffect, useRef } from "react";
import Backdrop from "./components/Backdrop";
import ScrollIsland from "./components/ScrollIsland";
import OffClock from "./components/OffClock";
import Anime from "./pages/Anime";
import Games from "./pages/Games";
import Places from "./pages/Places";
import { Banner, Certs, Education, Experience, Hero, Projects, ProofOfWork, QuoteBand, Highlights, Section, Skills, Wins } from "./components/Sections";
import Settings from "./components/Settings";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";
import { animatePage } from "./lib/animate";
import { installRouter, returning, usePath } from "./lib/router";
import { installTapSounds } from "./lib/sound";

/** Matches the CSS --content-width. */
const CONTENT_WIDTH = 720;

/** Flip to true to show the old Wins section again. */
const SHOW_WINS = false;

/** Flip to true to show the Highlights section (achievement cards). */
const SHOW_HIGHLIGHTS = true;

/** Flip to false to hide the "Off the clock" section (games, anime, places, achievements). */
const SHOW_OFF_CLOCK = false;

export default function App() {
  const column = useRef<HTMLElement>(null);
  const PATH = usePath();
  // Re-run the page animations on each page change; coming back home skips the intro.
  useEffect(() => (column.current ? animatePage(column.current, { intro: !(PATH === "/" && returning) }) : undefined), [PATH]);
  useEffect(() => installTapSounds(), []);
  useEffect(() => installRouter(), []);

  return (
    <>
      <Backdrop contentWidth={CONTENT_WIDTH} />

      <main className="column" id="top" ref={column}>
        {PATH === "/games" ? (
          <Games />
        ) : PATH === "/places" ? (
          <Places />
        ) : PATH === "/anime" ? (
          <Anime />
        ) : (
          <>
        <div className="frame frame--profile">
        <Banner />
        <Hero
          tools={
            <>
              <Settings />
              <ThemeToggle />
            </>
          }
        />
        </div>
        <Experience />
        <Projects />
        <ProofOfWork />
        <Skills />
        {/* Old Wins section: kept, not shown. */}
        {SHOW_WINS && <Wins />}
        <Certs />
        <Education />
        {SHOW_OFF_CLOCK && (
          <Section id="off" title="Off the clock">
            <OffClock />
          </Section>
        )}
        {/* Contact section is kept in Sections.tsx but not shown. */}
        {SHOW_HIGHLIGHTS && <Highlights />}
        <QuoteBand />
        {/* Footer (© name · back to top) is kept in Sections.tsx but not shown. */}
        {/* Floating section index (Scroll Island). The old IndexNav is kept in components/ but not used. */}
        <ScrollIsland />
          </>
        )}
      </main>
    </>
  );
}
