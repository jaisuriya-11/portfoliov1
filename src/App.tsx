import Backdrop from "./components/Backdrop";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";

/** Matches the CSS --content-width. */
const CONTENT_WIDTH = 800;

export default function App() {
  return (
    <>
      <Backdrop contentWidth={CONTENT_WIDTH} />

      <header class="nav-wrap">
        <div class="nav">
          <ThemeToggle />
        </div>
      </header>

      <main class="column" id="top" />
    </>
  );
}
