import { isOwnerBrowser } from "./components/visitorId";

// Keeps the page blank while the browser's developer tools are open.
//
// This is a deterrent, not a lock: code that runs in a browser can always be
// read by someone determined enough (it is downloaded to their machine), so
// nothing secret may ever be put in this front end - the API checks every
// request itself. What this does is make casual "Inspect" browsing show
// nothing: while developer tools are open the app is taken off the page, and
// it comes back by itself when they are closed.
//
// Detection: a `debugger` statement only stops execution while developer tools
// are open, so if it takes noticeably long to pass, they are. (Window-size
// guesses are avoided on purpose - they misfire on side panels, zoom and
// vertical tabs.) The signed-in owner's browser is exempt.

const CHECK_EVERY_MS = 1000;
const PAUSE_MS = 120;
const OPEN_KEYS = ["I", "J", "C"]; // Ctrl/Cmd + Shift + these
const pause = new Function("debugger");

const toolsAreOpen = () => {
  const start = performance.now();
  pause();
  return performance.now() - start > PAUSE_MS;
};

// `hide` takes the app off the page; `show` brings it back.
export const startDevtoolsGuard = ({ hide, show }) => {
  if (!import.meta.env.PROD || import.meta.env.VITE_DEVTOOLS_GUARD === "off") return;

  const blockShortcuts = (e) => {
    if (isOwnerBrowser()) return;
    const key = e.key?.toUpperCase();
    const chord = e.ctrlKey || e.metaKey;
    if (
      e.key === "F12" ||
      (chord && e.shiftKey && OPEN_KEYS.includes(key)) ||
      (e.metaKey && e.altKey && [...OPEN_KEYS, "U"].includes(key)) ||
      (e.ctrlKey && !e.shiftKey && key === "U")
    ) {
      e.preventDefault();
    }
  };
  window.addEventListener("keydown", blockShortcuts, true);

  let hidden = false;
  const check = () => {
    const open = !isOwnerBrowser() && toolsAreOpen();
    if (open && !hidden) {
      hidden = true;
      hide();
    } else if (!open && hidden) {
      hidden = false;
      show();
    }
  };
  check();
  setInterval(check, CHECK_EVERY_MS);
};
