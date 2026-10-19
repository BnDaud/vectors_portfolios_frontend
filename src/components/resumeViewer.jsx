import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "./authContext";
import { api_base_url } from "./globalvalues";
import { resumePageUrl } from "./resumeApi";
import { getVisitorId, isOwnerBrowser } from "./visitorId";
import { useSeo, SITE_NAME } from "./seo";
import NotFound404 from "./notfound";
import Notyetloader from "./notyetloaded";
import Logo from "./logo";
import ThemeToggle from "./themeToggle";

// Keys that would copy, save, print or select-all the page.
const BLOCKED_KEYS = ["s", "p", "c", "x", "a"];

// Read-only copy of one portfolio's resume, opened in a new tab. The pages are
// pictures with no text layer, so there is nothing to select or copy, and the
// usual routes to save, drag, print or copy are switched off. This discourages
// casual copying; it cannot stop a screenshot, which no website can.
const ResumeViewer = () => {
  const { trackSlug } = useParams();
  const { ready, isAuthenticated } = useAuth();
  const [info, setInfo] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | missing | busy | failed

  useSeo({ title: `Resume | ${SITE_NAME}`, description: "Read-only resume.", path: `/resume/${trackSlug}`, noindex: true });

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(`${api_base_url}/resume-export/${trackSlug}/pages`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) return setState("missing");
        if (res.status === 429) return setState("busy");
        if (!res.ok) return setState("failed");
        setInfo(await res.json());
        setState("ok");
      })
      .catch(() => !cancelled && setState("failed"));
    return () => {
      cancelled = true;
    };
  }, [trackSlug]);

  // Count this view once the resume has really loaded - but never the owner's own, nor "Do Not Track".
  // Sends only the same random browser id the page-view counter uses, and which portfolio.
  const loaded = state === "ok";
  useEffect(() => {
    if (!loaded || !ready || isAuthenticated || isOwnerBrowser() || navigator.doNotTrack === "1") return;
    const visitorId = getVisitorId();
    if (!visitorId) return;
    fetch(`${api_base_url}/analytics/resume-view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: visitorId, slug: trackSlug }),
      keepalive: true,
      credentials: "include", // lets the server recognise (and skip) a signed-in owner
    }).catch(() => {});
  }, [loaded, ready, isAuthenticated, trackSlug]);

  useEffect(() => {
    const stop = (e) => e.preventDefault();
    const keys = (e) => {
      if ((e.ctrlKey || e.metaKey) && BLOCKED_KEYS.includes(e.key.toLowerCase())) e.preventDefault();
    };
    const events = ["copy", "cut", "contextmenu", "dragstart", "selectstart"];
    events.forEach((name) => document.addEventListener(name, stop));
    document.addEventListener("keydown", keys);
    return () => {
      events.forEach((name) => document.removeEventListener(name, stop));
      document.removeEventListener("keydown", keys);
    };
  }, []);

  if (state === "missing") return <NotFound404 />;
  if (state === "loading") return <Notyetloader />;

  return (
    <div className="min-h-screen select-none [-webkit-touch-callout:none]">
      {/* printing the page prints only this note */}
      <style>{`@media print { .resume-screen { display: none !important; } .resume-print-note { display: block !important; } } .resume-print-note { display: none; }`}</style>
      <p className="resume-print-note p-8 text-center">This resume is a read-only copy and cannot be printed from here.</p>

      <div className="resume-screen">
        <header className="flex items-center justify-between px-5 sm:px-10 h-16 border-b border-frame_border bg-frame_bg/70 backdrop-blur-md">
          <Logo />
          <ThemeToggle />
        </header>

        <main className="mx-auto max-w-[860px] px-4 py-6">
          {state === "ok" ? (
            <>
              <h1 className="text-text_color text-xl font-bold text-center">
                {info.name} <span className="text-fg/60 font-medium">· {info.portfolio} resume</span>
              </h1>
              <p className="text-fg/60 text-xs text-center mt-1 mb-5">Read-only copy</p>
              <div className="flex flex-col gap-4">
                {Array.from({ length: info.pages }, (_, i) => i + 1).map((page) => (
                  <div key={page} className="relative overflow-hidden rounded-lg bg-white shadow-lg">
                    <img
                      src={resumePageUrl(trackSlug, page, info.version)}
                      alt={`Resume page ${page} of ${info.pages}`}
                      draggable={false}
                      className="block w-full h-auto"
                    />
                    {/* sits over the picture so it cannot be dragged or opened on its own */}
                    <div className="absolute inset-0" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-fg/70 py-20">
              {state === "busy"
                ? "Too many views just now - please try again in a few minutes."
                : "The resume could not be loaded. Please try again."}
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResumeViewer;
