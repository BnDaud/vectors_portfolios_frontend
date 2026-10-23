import { useEffect, useState } from "react";
import { FiAlertTriangle, FiCopy } from "react-icons/fi";
import { useAuth } from "./authContext";
import { api_base_url, site_url } from "./globalvalues";
import NotFound404 from "./notfound";
import Notyetloader from "./notyetloaded";
import { usePageOwner } from "./pageOwner";
import { useToast } from "./toastContext";

const longDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

// A big, can't-miss warning on an account's OWN pages (never the site owner's, whose account is
// never deleted): if nobody visits its portfolio before the date, the account is deleted.
export const DeletionBanner = () => {
  const { canEdit, home } = usePageOwner();
  const { deletesOn } = useAuth();
  const { showToast } = useToast();
  if (!canEdit || !deletesOn) return null;
  const link = `${site_url}${home}`;
  const days = Math.max(0, Math.ceil((new Date(deletesOn) - Date.now()) / 86400000));
  const copy = () =>
    navigator.clipboard?.writeText(link).then(() => showToast("Link copied", "success"), () => showToast(link));
  return (
    <div role="alert" className="mx-5 sm:mx-10 mt-5 rounded-2xl border-2 border-amber-500 bg-amber-500/15 p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
      <FiAlertTriangle aria-hidden="true" className="shrink-0 text-amber-500 text-4xl" />
      <div className="flex-1">
        <p className="text-fg text-lg sm:text-xl font-bold">
          Your account will be deleted on {longDate(deletesOn)} ({days} day{days === 1 ? "" : "s"}) unless someone visits your portfolio.
        </p>
        <p className="text-fg/80 text-sm mt-1">
          Accounts nobody visits for a year are deleted automatically, with their portfolios. Every visit from someone else
          pushes the date a year further. Your own visits do not count - share your link.
        </p>
      </div>
      <button type="button" onClick={copy} className="btn-primary shrink-0 flex items-center justify-center gap-2 text-sm">
        <FiCopy aria-hidden="true" /> Copy my link
      </button>
    </div>
  );
};

// For an address with no account: say if it belonged to an account that was deleted,
// rather than the plain "not found".
export const MissingAccount = ({ username }) => {
  const [note, setNote] = useState(undefined);
  useEffect(() => {
    let alive = true;
    fetch(`${api_base_url}/auth/account-status?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => alive && setNote(data.deleted ? data : null))
      .catch(() => alive && setNote(null));
    return () => {
      alive = false;
    };
  }, [username]);
  if (note === undefined) return <Notyetloader />;
  if (!note) return <NotFound404 />;
  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-md text-center bg-frame_bg border border-frame_border rounded-2xl p-8">
        <FiAlertTriangle aria-hidden="true" className="mx-auto text-amber-500 text-4xl" />
        <h1 className="text-text_color text-2xl font-bold mt-3">This account was deleted</h1>
        <p className="text-fg/80 mt-3">{note.message}</p>
        <a href="/signup" className="btn-primary inline-block mt-5">Create a new portfolio</a>
      </div>
    </main>
  );
};
