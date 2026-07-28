import { HiSun, HiMoon } from "react-icons/hi";
import { useTheme } from "./themeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light/dark theme"
      className="text-fg/70 hover:text-text_color text-lg transition-transform hover:scale-110"
    >
      {theme === "dark" ? <HiSun /> : <HiMoon />}
    </button>
  );
};

export default ThemeToggle;
