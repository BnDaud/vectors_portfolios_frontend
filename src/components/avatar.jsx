import { useState } from "react";
import { useTheme } from "./themeContext";
import { logo } from "./globalvalues";

// Round picture backed by the brand icon (same one as the favicon). The icon
// shows while the picture is loading and stays if the URL is empty or fails
// to load, so there is never a blank circle.
const Avatar = ({ src, label, className = "h-24 w-24" }) => {
  const { theme } = useTheme();
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [failedSrc, setFailedSrc] = useState(null);

  // Tracked per src, so changing the URL starts a fresh load and retry.
  const showPicture = !!src && failedSrc !== src;
  const loaded = showPicture && loadedSrc === src;

  return (
    <div
      className={`${className} relative shrink-0 rounded-full overflow-hidden bg-body_bg border border-frame_border flex items-center justify-center`}
    >
      <img
        src={theme === "dark" ? logo.iconDark : logo.iconLight}
        alt={showPicture ? "" : label}
        aria-hidden={showPicture}
        className={`h-3/5 w-3/5 object-contain transition-opacity duration-300 ${
          loaded ? "opacity-0" : "opacity-80"
        }`}
      />
      {showPicture && (
        <img
          src={src}
          alt={label}
          loading="lazy"
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
