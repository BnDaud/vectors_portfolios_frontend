import { useNavigate } from "react-router-dom";
import { useTheme } from "./themeContext";
import { logo } from "./globalvalues";

const Logo = ({ fullClassName = "h-11", iconClassName = "h-14", alwaysFull = false }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fullSrc = isDark ? logo.fullDark : logo.fullLight;
  const iconSrc = isDark ? logo.iconDark : logo.iconLight;

  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="flex items-center"
      aria-label="Vectored Matrix - go to home"
    >
      <img
        src={fullSrc}
        alt="Vectored Matrix"
        className={`w-auto ${fullClassName} ${alwaysFull ? "block" : "hidden sm:block"}`}
      />
      {!alwaysFull && (
        <img src={iconSrc} alt="Vectored Matrix" className={`sm:hidden w-auto ${iconClassName}`} />
      )}
    </button>
  );
};

export default Logo;
