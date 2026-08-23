import { motion } from "framer-motion";
import { HiSun, HiMoon } from "react-icons/hi";
import { useTheme } from "./themeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light/dark theme"
      className="relative w-14 h-8 rounded-full shrink-0 transition-colors duration-300"
      style={{
        background: isDark
          ? "linear-gradient(145deg, #1c1c22, #0a0a0d)"
          : "linear-gradient(145deg, #e2e2e7, #ffffff)",
        boxShadow: isDark
          ? "inset 0 2px 4px rgba(0,0,0,0.7), inset 0 -1px 1px rgba(255,255,255,0.06)"
          : "inset 0 2px 4px rgba(0,0,0,0.18), inset 0 -1px 1px rgba(255,255,255,0.9)",
      }}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-7 h-7 rounded-full flex items-center justify-center"
        style={{
          background: isDark
            ? "linear-gradient(145deg, #3c3c46, #1a1a20)"
            : "linear-gradient(145deg, #ffffff, #d6d6da)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.45), 0 1px 1px rgba(255,255,255,0.4) inset",
        }}
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        {isDark ? (
          <HiMoon className="text-text_color text-sm" />
        ) : (
          <HiSun className="text-orange-500 text-sm" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
