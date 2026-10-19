import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./authContext";
import { api_base_url } from "./globalvalues";

const VISITOR_KEY = "vm_visitor_id";
const OWNER_KEY = "vm_owner_browser";
const SKIP_PATHS = ["/login", "/addprofile"];
// Matches the server's visit window: opening the same page again after this
// long in one tab is a new visit; sooner than that it is the same one.
const RESEND_AFTER_MS = 30 * 60 * 1000;

// Storage can be blocked (private mode, strict settings) - then we simply don't count.
const attempt = (fn) => {
  try {
    return fn();
  } catch {
    return null;
  }
};

const getVisitorId = () =>
  attempt(() => {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  });

// Silent page-view counter. Sends only a random id this browser made up for
// itself and the page opened - no personal data. It never counts:
//  - the signed-in owner, nor any browser the owner has signed in on,
//  - visitors who send "Do Not Track",
//  - the login and placeholder pages.
const VisitTracker = () => {
  const { pathname } = useLocation();
  const { ready, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!ready) return; // don't know yet whether this is the owner

    if (isAuthenticated) {
      attempt(() => localStorage.setItem(OWNER_KEY, "1"));
      return;
    }
    if (attempt(() => localStorage.getItem(OWNER_KEY)) === "1") return;
    if (navigator.doNotTrack === "1" || SKIP_PATHS.includes(pathname) || pathname.startsWith("/resume/")) return;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    const seenKey = `vm_seen:${pathname}`;
    const lastSent = Number(attempt(() => sessionStorage.getItem(seenKey)) || 0);
    if (Date.now() - lastSent < RESEND_AFTER_MS) return;
    attempt(() => sessionStorage.setItem(seenKey, String(Date.now())));

    fetch(`${api_base_url}/analytics/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: visitorId, path: pathname }),
      keepalive: true,
      // lets the server recognise (and skip) a signed-in owner
      credentials: "include",
    }).catch(() => {});
  }, [ready, isAuthenticated, pathname]);

  return null;
};

export default VisitTracker;
