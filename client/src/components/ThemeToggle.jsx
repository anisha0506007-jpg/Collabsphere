import { useTheme } from "../context/ThemeContext";

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
      <span className="global-theme-icon" aria-hidden="true">
        {isDark ? "☀" : "☾"}
      </span>

      <span>
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}