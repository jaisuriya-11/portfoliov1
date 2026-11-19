import { Moon, Sun } from "../lib/animated-icons";
import { toggleTheme, useTheme } from "../lib/theme";

export default function ThemeToggle() {
  const theme = useTheme();
  return (
    <button
      type="button"
      className="tool-btn"
      data-theme-toggle
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
    >
      {/* Animated sun in light, moon in dark (animateicons.in); each plays on hover. */}
      {theme === "dark" ? <Moon key="moon" size={16} /> : <Sun key="sun" size={16} />}
    </button>
  );
}
