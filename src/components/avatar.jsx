import { useState } from "react";
import { useTheme } from "./themeContext";
import { logo } from "./globalvalues";

// imgur serves resized copies by adding a letter to the image id; "m" is a
// 320px-wide version (aspect ratio kept) - plenty for an avatar even on a 2x
// screen, and a fraction of the size of the original upload.
const IMGUR = /^https:\/\/i\.imgur\.com\/([A-Za-z0-9]{5,8})\.(jpe?g|png|webp)$/i;
const avatarSized = (src) => {
  const match = IMGUR.exec(src || "");
  return match ? `https://i.imgur.com/${match[1]}m.${match[2]}` : src;
};

// Round picture backed by the brand icon (same one as the favicon). The icon
// shows while the picture is loading and stays if the URL is empty or fails
// to load, so there is never a blank circle.
//   priority   - the main image on the page: load it immediately, not lazily
//   decorative - the name is printed next to it, so screen readers skip it
const Avatar = ({ src, label, className = "h-24 w-24", priority = false, decorative = false }) => {
  const { theme } = useTheme();
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [failedSrc, setFailedSrc] = useState(null);
  const [thumbFailedFor, setThumbFailedFor] = useState(null);

  // Tracked per src, so changing the URL starts a fresh load and retry.
  const shown = thumbFailedFor === src ? src : avatarSized(src);
  const showPicture = !!src && failedSrc !== src;
  const loaded = showPicture && loadedUrl === shown;

  const onError = () => {
    // The resized copy missing is not fatal: fall back to the original first.
    if (shown !== src) setThumbFailedFor(src);
    else setFailedSrc(src);
  };

  return (
    <div
      className={`${className} relative shrink-0 rounded-full overflow-hidden bg-body_bg border border-frame_border flex items-center justify-center`}
    >
      <img
        src={theme === "dark" ? logo.iconDark : logo.iconLight}
        alt={showPicture || decorative ? "" : label}
        aria-hidden={showPicture || decorative}
        className={`h-3/5 w-3/5 object-contain transition-opacity duration-300 ${
          loaded ? "opacity-0" : "opacity-80"
        }`}
      />
      {showPicture && (
        <img
          src={shown}
          alt={decorative ? "" : label}
          aria-hidden={decorative}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => setLoadedUrl(shown)}
          onError={onError}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
