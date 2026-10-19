import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiDownload, FiEye, FiFileText } from "react-icons/fi";
import { useAuth } from "./authContext";
import { useToast } from "./toastContext";
import { downloadResume, fetchResumePages, fetchResumeTemplates, resumePageUrl, resumeThumbUrl, resumeViewPath } from "./resumeApi";
import { attempt } from "./visitorId";

const PILL =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 min-h-12 md:min-h-0 text-sm font-semibold transition-colors";
const PILL_PRIMARY = `${PILL} bg-text_color text-body_bg hover:brightness-110 disabled:opacity-50`;
const PILL_OUTLINE = `${PILL} border border-text_color/50 text-text_color hover:bg-text_color/10`;
// the nav bar's version: same height as the login / logout button next to it
const NAV_PILL =
  "inline-flex items-center gap-1.5 rounded-full border border-text_color/50 px-3 py-1.5 text-sm font-semibold text-text_color transition-colors hover:bg-text_color/10";

const PICK_KEY = "vm_resume_pick";

// A centred dialog over a dimmed page. Escape or a click outside closes it, the
// page behind stops scrolling, and focus goes back to what opened it.
const Modal = ({ titleId, onClose, wide = false, children }) => {
  // the caller's onClose is a new function every render; the effect must not re-run (and move focus) for that
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement;
    const escape = (e) => e.key === "Escape" && closeRef.current();
    const scroll = document.body.style.overflow;
    document.addEventListener("keydown", escape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", escape);
      document.body.style.overflow = scroll;
      opener?.focus?.();
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-3 sm:px-5" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[92vh] overflow-y-auto rounded-2xl border border-frame_border bg-frame_bg p-5 sm:p-7 flex flex-col gap-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

const GROUPS = [
  { key: "ats", title: "ATS-safe", hint: "Plain text in one column - what job portals and recruiter software read best. PDF or Word." },
  { key: "graphic", title: "Graphic", hint: "Designed pages with your photo, for people rather than software. PDF only." },
];

const DesignCard = ({ design, slug, selected, onSelect }) => {
  const [broken, setBroken] = useState(false);
  return (
    <label
      className={`flex flex-col gap-2 rounded-xl border p-2 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-text_color ${
        selected ? "border-text_color bg-text_color/10" : "border-frame_border hover:border-text_color/40"
      }`}
    >
      <input type="radio" name="resume-design" value={design.key} checked={selected} onChange={() => onSelect(design.key)} className="sr-only" />
      <span className="block aspect-[1/1.414] w-full overflow-hidden rounded-md bg-white">
        {!broken && (
          <img
            src={resumeThumbUrl(slug, design.key)}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setBroken(true)}
            className="block h-full w-full object-cover object-top"
          />
        )}
      </span>
      <span className={`text-sm font-semibold ${selected ? "text-text_color" : "text-fg"}`}>{design.label}</span>
      <span className="text-xs leading-snug text-fg/60">{design.blurb}</span>
    </label>
  );
};

// The chosen design, page by page and full size, so it can be looked over before it is downloaded.
// It is always the PDF layout; the Word file carries the same content in the same order.
const PreviewPane = ({ slug, design, kind }) => {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setInfo(null);
    setError("");
    fetchResumePages(slug, design.key)
      .then((result) => !cancelled && setInfo(result))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [slug, design.key]);

  return (
    <div className="flex flex-col gap-3">
      {kind === "docx" && (
        <p className="text-fg/60 text-xs">The preview shows the PDF layout. The Word file has the same content, in the same order.</p>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!info && !error && <p role="status" className="text-fg/60 text-sm py-10 text-center">Preparing the preview...</p>}
      {info &&
        Array.from({ length: info.pages }, (_, i) => i + 1).map((page) => (
          <img
            key={page}
            src={resumePageUrl(slug, page, info.version, design.key)}
            alt={`${design.label} design, page ${page} of ${info.pages}`}
            draggable={false}
            className="block w-full h-auto rounded-lg bg-white shadow-lg"
          />
        ))}
    </div>
  );
};

const readPick = () => {
  const raw = attempt(() => JSON.parse(localStorage.getItem(PICK_KEY) || "null"));
  return raw && typeof raw === "object" ? raw : {};
};

// Owner: choose a design and a format, then download. With `tracks` (landing page)
// the portfolio is chosen here too; otherwise `slug` is the one being viewed.
const DownloadDialog = ({ slug: fixedSlug, tracks, onClose }) => {
  const { authFetch } = useAuth();
  const { showToast } = useToast();
  const [slug, setSlug] = useState(fixedSlug || tracks?.[0]?.slug);
  const [designs, setDesigns] = useState(null);
  const [failed, setFailed] = useState("");
  const [template, setTemplate] = useState("");
  const [kind, setKind] = useState("pdf");
  const [busy, setBusy] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  // switching between the designs and a preview starts the dialog from its top
  useEffect(() => {
    document.querySelector('[role="dialog"][aria-labelledby="resume-download-title"]')?.scrollTo?.({ top: 0 });
  }, [previewing]);

  useEffect(() => {
    let cancelled = false;
    fetchResumeTemplates()
      .then((list) => {
        if (cancelled) return;
        const saved = readPick();
        const start = list.find((d) => d.key === saved.template) || list.find((d) => d.default) || list[0];
        setDesigns(list);
        setTemplate(start.key);
        setKind(saved.kind === "docx" && start.formats.includes("docx") ? "docx" : "pdf");
      })
      .catch((err) => !cancelled && setFailed(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const current = designs?.find((d) => d.key === template);
  const canWord = !!current?.formats.includes("docx");

  const choose = (key) => {
    setTemplate(key);
    // Word cannot hold the drawn layouts - fall back to PDF rather than leave an impossible choice
    if (!designs.find((d) => d.key === key).formats.includes(kind)) setKind("pdf");
  };

  const download = () => {
    setBusy(true);
    downloadResume(authFetch, slug, kind, template)
      .then((name) => {
        attempt(() => localStorage.setItem(PICK_KEY, JSON.stringify({ template, kind })));
        showToast(`Downloaded ${name}`, "success");
        onClose();
      })
      .catch((err) => {
        showToast(err.message);
        setBusy(false);
      });
  };

  return (
    // Escape steps back out of a preview first, and only then closes the dialog
    <Modal titleId="resume-download-title" onClose={previewing ? () => setPreviewing(false) : onClose} wide>
      <div>
        <h2 id="resume-download-title" className="text-text_color text-lg font-semibold">
          {previewing && current ? `Preview: ${current.label}` : "Download resume"}
        </h2>
        <p className="text-fg/60 text-sm mt-1">
          {previewing
            ? "This is exactly what you will get."
            : "Pick the design that fits where it is going. Everything comes from the portfolio page; the five most recent projects are included."}
        </p>
      </div>

      {previewing && current && <PreviewPane slug={slug} design={current} kind={kind} />}

      {!previewing && tracks?.length > 1 && (
        <label className="flex flex-col gap-1 text-sm text-fg/80">
          Portfolio
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="rounded-lg border border-fg/25 bg-body_bg px-3 py-2.5 text-fg outline-none focus:border-text_color"
          >
            {tracks.map((track) => (
              <option key={track.id} value={track.slug}>
                {track.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {failed && <p className="text-red-500 text-sm">{failed}</p>}
      {!designs && !failed && <p className="text-fg/60 text-sm">Loading designs...</p>}

      {designs &&
        !previewing &&
        GROUPS.map((group) => (
          <fieldset key={group.key} className="min-w-0">
            <legend className="text-fg font-semibold">{group.title}</legend>
            <p className="text-fg/60 text-xs mt-0.5 mb-2.5">{group.hint}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {designs
                .filter((d) => d.group === group.key)
                .map((design) => (
                  <DesignCard key={`${slug}:${design.key}`} design={design} slug={slug} selected={design.key === template} onSelect={choose} />
                ))}
            </div>
          </fieldset>
        ))}

      <div className="sticky bottom-0 -mx-5 sm:-mx-7 -mb-5 sm:-mb-7 flex flex-wrap items-center justify-between gap-3 border-t border-frame_border bg-frame_bg px-5 sm:px-7 py-4">
        <div role="radiogroup" aria-label="File type" className="flex items-center gap-1 rounded-full border border-frame_border p-1">
          {[
            ["pdf", "PDF"],
            ["docx", "Word"],
          ].map(([key, label]) => {
            const off = key === "docx" && !canWord;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={kind === key}
                disabled={off || !designs}
                title={off ? "Graphic designs are PDF only" : undefined}
                onClick={() => setKind(key)}
                className={`rounded-full px-4 py-1.5 min-h-12 md:min-h-0 text-sm font-semibold transition-colors disabled:opacity-40 ${
                  kind === key ? "bg-text_color text-body_bg" : "text-fg hover:text-text_color"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-end gap-2.5">
          {previewing ? (
            <button type="button" className="btn-ghost" onClick={() => setPreviewing(false)}>
              Back to designs
            </button>
          ) : (
            <>
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="button" disabled={!current} onClick={() => setPreviewing(true)} className={PILL_OUTLINE}>
                <FiEye aria-hidden="true" /> Preview
              </button>
            </>
          )}
          <button type="button" disabled={busy || !current} onClick={download} className={PILL_PRIMARY}>
            <FiDownload aria-hidden="true" /> {busy ? "Preparing..." : `Download ${kind === "pdf" ? "PDF" : "Word"}`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// THIS portfolio's resume. The signed-in owner picks a design and downloads it; a
// visitor gets a link to the read-only copy, opened in a new tab. It appears in
// the nav bar ("nav", both audiences) and, for visitors only, again in the
// Resume section ("body") in case the first one is missed - the owner's
// downloads live in the nav bar alone.
export const ResumeButton = ({ slug, variant = "body" }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = variant === "nav";
  if (!nav && isAuthenticated) return null;
  if (!isAuthenticated) {
    return (
      <a href={resumeViewPath(slug)} target="_blank" rel="noopener noreferrer" className={nav ? NAV_PILL : PILL_PRIMARY}>
        <FiEye aria-hidden="true" /> View resume
      </a>
    );
  }
  return (
    <>
      <button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} aria-label="Download resume" className={NAV_PILL}>
        {/* in the nav bar a "Resume" label would sit right beside the Resume section link */}
        <FiDownload aria-hidden="true" /> Download
      </button>
      {open && <DownloadDialog slug={slug} onClose={() => setOpen(false)} />}
    </>
  );
};

// Visitor, on the landing page: which portfolio's resume? Then open the read-only copy.
const Picker = ({ tracks, onClose }) => {
  const [slug, setSlug] = useState(tracks[0]?.slug);
  return (
    <Modal titleId="resume-picker-title" onClose={onClose}>
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
        <a href={resumeViewPath(slug)} target="_blank" rel="noopener noreferrer" onClick={onClose} className={PILL_PRIMARY}>
          <FiEye aria-hidden="true" /> Open resume
        </a>
      </div>
    </Modal>
  );
};

// Landing page: "which resume?". In the nav bar ("nav") for everyone - the owner
// downloads, a visitor views - and, for visitors only, once more in the page ("body").
export const ResumeLauncher = ({ tracks, variant = "body" }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = variant === "nav";
  if (!tracks.length || (!nav && isAuthenticated)) return null;
  const word = isAuthenticated ? "Download resume" : "View resume";
  return (
    <>
      {nav ? (
        // icon-only (a proper tap target) on a phone, with the words from tablet width up
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={word}
          className={`${NAV_PILL} size-12 justify-center px-0 py-0 sm:size-auto sm:px-3 sm:py-1.5`}
        >
          {isAuthenticated ? <FiDownload aria-hidden="true" /> : <FiEye aria-hidden="true" />}{" "}
          <span className="hidden sm:inline">{word}</span>
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={`${PILL_OUTLINE} mt-3`}>
          <FiEye aria-hidden="true" /> View resume
        </button>
      )}
      {open && (isAuthenticated ? <DownloadDialog tracks={tracks} onClose={() => setOpen(false)} /> : <Picker tracks={tracks} onClose={() => setOpen(false)} />)}
    </>
  );
};

// Phone menu: the owner's download dialog for the portfolio being viewed, or a
// visitor's link to the read-only copy.
export const ResumeMenuItems = ({ slug, onDone }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onDone?.();
  };
  if (!isAuthenticated) {
    return (
      <a href={resumeViewPath(slug)} target="_blank" rel="noopener noreferrer" onClick={onDone} className={`${NAV_PILL} min-h-12`}>
        <FiEye aria-hidden="true" /> View resume
      </a>
    );
  }
  return (
    <>
      <button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} className={`${NAV_PILL} min-h-12`}>
        <FiFileText aria-hidden="true" /> Download resume
      </button>
      {open && <DownloadDialog slug={slug} onClose={close} />}
    </>
  );
};
