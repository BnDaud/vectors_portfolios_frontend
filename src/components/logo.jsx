import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./themeContext";
import { logo } from "./globalvalues";
import { usePageOwner } from "./pageOwner";

const Logo = ({ fullClassName = "h-11", iconClassName = "h-14", alwaysFull = false }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  // home of whoever's pages these are: the site's landing for the owner, /u/<name> for anyone else
  const { home } = usePageOwner();
  const isDark = theme === "dark";
  const fullSrc = isDark ? logo.fullDark : logo.fullLight;
  const iconSrc = isDark ? logo.iconDark : logo.iconLight;

  return (
    <button
      type="button"
      onClick={() => navigate(home)}
      className="flex items-center"
      aria-label="Vectored Matrix - go to home"
    >
      <img
        src={fullSrc}
        alt="Vectored Matrix"
        loading="lazy"
        className={`w-auto ${fullClassName} ${alwaysFull ? "block" : "hidden sm:block"}`}
      />
      {!alwaysFull && (
        <img
          src={iconSrc}
          alt="Vectored Matrix"
          loading="lazy"
          className={`sm:hidden w-auto ${iconClassName}`}
        />
      )}
    </button>
  );
};

// A faint, fixed copy of the nav-bar logo over every page, big and slanted in the middle of the
// screen as a watermark is. It lies over the page, not behind it, because the portfolio tiles and
// cards are solid and would hide it. The read-only resume page leaves it out: the resume pictures
// carry their own mark. It is the full "Vectored Matrix" wordmark on every screen (it fits a
// phone's width; the icon alone is only the {M} mark). Purely decorative: hidden from screen
// readers and never catches a click or tap; the nav bar and dialogs stay above it.
export const LogoWatermark = () => {
  const { theme } = useTheme();
  const { pathname } = useLocation();
  if (pathname.startsWith("/resume/")) return null;
  return (
    <div aria-hidden="true" data-watermark className="pointer-events-none fixed inset-0 z-[5] flex items-center justify-center overflow-hidden">
      <img
        src={theme === "dark" ? logo.fullDark : logo.fullLight}
        alt=""
        draggable={false}
        decoding="async"
        fetchPriority="low"
        className="w-[min(105vw,900px)] max-w-none h-auto -rotate-[14deg] select-none opacity-[0.06]"
      />
    </div>
  );
};

export default Logo;
