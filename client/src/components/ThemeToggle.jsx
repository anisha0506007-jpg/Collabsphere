import { useTheme } from "../context/ThemeContext";
import AppIcon from "./AppIcon";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="global-theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <AppIcon
        className="global-theme-icon"
        name={isDark ? "sun" : "moon"}
        size={18}
      />

      <span>
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}