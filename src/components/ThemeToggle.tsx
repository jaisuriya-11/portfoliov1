import { SunMoonIcon } from "./arc/icon-morph/icon-morph";
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
      {/* Arc icon-morph: the sun folds its rays and a shadow carves it into a moon. */}
      <SunMoonIcon state={theme === "dark"} size={16} strokeWidth={1.7} aria-hidden="true" />
    </button>
  );
}
