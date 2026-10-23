import { useCallback, useEffect, useState } from "react";
import { HiTrash } from "react-icons/hi";
import { FiRefreshCw, FiUserCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "./authContext";
import { api_base_url } from "./globalvalues";
import { accountHome } from "./pageOwner";
import { useToast } from "./toastContext";

const day = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "never");

// Site owner only: how many accounts there are and enough to tell them apart - no personal
// details. Any account but the owner's can be deleted (with its portfolios), after typing its name.
const AccountsSection = () => {
  const { authFetch } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [target, setTarget] = useState(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError("");
    authFetch(`${api_base_url}/accounts/`)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load the accounts (${res.status})`);
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = () => {
    setBusy(true);
    authFetch(`${api_base_url}/accounts/${target.id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error(`Delete failed (${res.status})`);
        showToast(`Deleted ${target.username}`, "success");
        setTarget(null);
        setTyped("");
        load();
      })
      .catch((err) => showToast(err.message))
      .finally(() => setBusy(false));
  };

  return (
    <section aria-labelledby="accounts-heading" className="max-w-3xl mx-auto mt-12 bg-frame_bg border border-frame_border rounded-xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="accounts-heading" className="flex items-center gap-2 text-text_color text-xl font-semibold">
            <FiUserCheck /> Accounts {data && <span className="text-fg/60 text-base font-normal">({data.count})</span>}
          </h2>
          <p className="text-fg/60 text-xs mt-1">Only you can see this. People who signed up, newest first - no personal details.</p>
        </div>
        <button type="button" onClick={load} aria-label="Refresh accounts" className="p-2 rounded-full text-fg/70 hover:text-text_color">
          <FiRefreshCw />
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      {data && (
        <ul className="mt-4 flex flex-col gap-2">
          {data.accounts.map((a) => (
            <li key={a.id} className="bg-body_bg rounded-lg px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <Link to={accountHome(a.username)} className="text-fg font-semibold hover:text-text_color">
                {a.username}
              </Link>
              {a.is_you && <span className="text-xs text-text_color">(you)</span>}
              {a.protected && !a.is_you && <span className="text-xs text-fg/50">(admin)</span>}
              <span className="text-fg/60 text-xs">joined {day(a.joined)}</span>
              <span className="text-fg/60 text-xs">
                {a.portfolios} portfolio{a.portfolios === 1 ? "" : "s"}
              </span>
              <span className="text-fg/60 text-xs">signs in with {[a.password && "password", a.google && "Google"].filter(Boolean).join(" + ") || "nothing yet"}</span>
              {!a.protected && (
                <button
                  type="button"
                  onClick={() => {
                    setTarget(a);
                    setTyped("");
                  }}
                  aria-label={`Delete account ${a.username}`}
                  className="ml-auto text-fg/60 hover:text-red-500 p-1"
                >
                  <HiTrash />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {target && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-5" onClick={() => setTarget(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" onClick={(e) => e.stopPropagation()}
               className="bg-frame_bg rounded-xl p-6 max-w-md w-full flex flex-col gap-4 border border-fg/10">
            <h3 id="delete-account-title" className="text-text_color text-lg font-semibold">Delete account {target.username}</h3>
            <p className="text-fg text-sm">
              This deletes the account, its {target.portfolios} portfolio{target.portfolios === 1 ? "" : "s"} and everything in them. It cannot be undone.
              Type <span className="font-semibold">{target.username}</span> to confirm.
            </p>
            <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Type the username to confirm" className="bg-body_bg text-fg rounded px-3 py-2 outline-none" />
            <div className="flex gap-3 justify-end">
              <button type="button" className="btn-ghost" onClick={() => setTarget(null)}>Cancel</button>
              <button type="button" disabled={typed !== target.username || busy} onClick={remove}
                      className="bg-red-600 text-fg font-semibold px-4 py-2 rounded disabled:opacity-50">
                {busy ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccountsSection;
