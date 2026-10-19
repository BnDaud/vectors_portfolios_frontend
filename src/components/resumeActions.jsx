import { useEffect, useRef, useState } from "react";
import { FiDownload, FiEye, FiFileText } from "react-icons/fi";
import { useAuth } from "./authContext";
import { useToast } from "./toastContext";
import { downloadResume, resumeViewPath } from "./resumeApi";

const PILL =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 min-h-12 md:min-h-0 text-sm font-semibold transition-colors";
const PILL_PRIMARY = `${PILL} bg-text_color text-body_bg hover:brightness-110`;
const PILL_OUTLINE = `${PILL} border border-text_color/50 text-text_color hover:bg-text_color/10`;

// Owner: one tap per format. Pass an optional onDone to react after a download.
const useDownload = (slug, onDone) => {
  const { authFetch } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState("");
  const start = (kind) => {
    setBusy(kind);
    downloadResume(authFetch, slug, kind)
      .then((name) => {
        showToast(`Downloaded ${name}`, "success");
        onDone?.();
      })
      .catch((err) => showToast(err.message))
      .finally(() => setBusy(""));
  };
  return { busy, start };
};

// On a portfolio: the owner downloads THIS portfolio's resume (PDF or Word);
// a visitor opens a read-only copy in a new tab.
export const ResumeButton = ({ slug }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const { busy, start } = useDownload(slug, () => setOpen(false));

  useEffect(() => {
    if (!open) return undefined;
    const outside = (e) => !box.current?.contains(e.target) && setOpen(false);
    const escape = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  if (!isAuthenticated) {
    return (
      <a href={resumeViewPath(slug)} target="_blank" rel="noopener noreferrer" className={PILL_PRIMARY}>
        <FiEye aria-hidden="true" /> View resume
      </a>
    );
  }

  return (
    <div ref={box} className="relative inline-block">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={PILL_PRIMARY}>
        <FiDownload aria-hidden="true" /> Download resume
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-1/2 z-30 mt-2 w-52 -translate-x-1/2 rounded-2xl border border-frame_border bg-frame_bg p-1.5 shadow-lg"
        >
          {[
            ["pdf", "PDF (.pdf)"],
            ["docx", "Word (.docx)"],
          ].map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              role="menuitem"
              disabled={!!busy}
              onClick={() => start(kind)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-fg hover:bg-text_color/10 disabled:opacity-50"
            >
              <FiFileText aria-hidden="true" /> {busy === kind ? "Preparing..." : label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// On the landing page: which portfolio's resume? Then the owner picks a format
// and downloads it; a visitor opens the read-only copy.
const Picker = ({ tracks, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [slug, setSlug] = useState(tracks[0]?.slug);
  const { busy, start } = useDownload(slug, onClose);

  useEffect(() => {
    const escape = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-picker-title"
        className="w-full max-w-md rounded-2xl border border-frame_border bg-frame_bg p-6 sm:p-7 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 id="resume-picker-title" className="text-text_color text-lg font-semibold">
            Which resume?
          </h2>
          <p className="text-fg/60 text-sm mt-1">Each portfolio has its own resume, built from what is on its page.</p>
        </div>

        <div role="radiogroup" aria-labelledby="resume-picker-title" className="flex flex-col gap-2">
          {tracks.map((track) => {
            const on = track.slug === slug;
            return (
              <button
                key={track.id}
                type="button"
                role="radio"
                aria-checked={on}
                autoFocus={on}
                onClick={() => setSlug(track.slug)}
                className={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left transition-colors ${
                  on ? "border-text_color bg-text_color/10" : "border-frame_border hover:border-text_color/40"
                }`}
              >
                <span className={`font-semibold ${on ? "text-text_color" : "text-fg"}`}>{track.name}</span>
                {track.about?.skill && <span className="text-xs text-fg/60">{track.about.skill}</span>}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-end gap-2.5 pt-1">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          {isAuthenticated ? (
            <>
              <button type="button" disabled={!!busy} onClick={() => start("docx")} className={PILL_OUTLINE}>
                <FiFileText aria-hidden="true" /> {busy === "docx" ? "Preparing..." : "Word"}
              </button>
              <button type="button" disabled={!!busy} onClick={() => start("pdf")} className={PILL_PRIMARY}>
                <FiDownload aria-hidden="true" /> {busy === "pdf" ? "Preparing..." : "PDF"}
              </button>
            </>
          ) : (
            <a href={resumeViewPath(slug)} target="_blank" rel="noopener noreferrer" onClick={onClose} className={PILL_PRIMARY}>
              <FiEye aria-hidden="true" /> Open resume
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export const ResumeLauncher = ({ tracks }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  if (!tracks.length) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${PILL_OUTLINE} mt-3`}>
        {isAuthenticated ? <FiDownload aria-hidden="true" /> : <FiEye aria-hidden="true" />}
        {isAuthenticated ? "Download resume" : "View resume"}
      </button>
      {open && <Picker tracks={tracks} onClose={() => setOpen(false)} />}
    </>
  );
};
