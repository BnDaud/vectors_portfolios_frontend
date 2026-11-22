import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./authContext";
import { api_base_url } from "./globalvalues";
import { useToast } from "./toastContext";

const SWITCHES = [
  {
    key: "recruit",
    label: "Let Vectored Matrix recruiters see my CV",
    hint: "Recruiters at Vectored Matrix and its companies (MatLearn and more) can read it to hire. Read-only.",
  },
  { key: "contact", label: "Include my email and phone", hint: "Only with the CV, so recruiters can reach you.", needs: "recruit" },
  { key: "show_on_matlearn", label: "Show on my MatLearn profile", hint: "Learners and schools on MatLearn see this portfolio." },
];

const COMPANY_NAMES = { matlearn: "MatLearn", vectoredmatrix: "Vectored Matrix" };
const companyName = (key) => COMPANY_NAMES[key] || key;

const when = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// The owner's choice, portfolio by portfolio, of what the Vectored Matrix group may see: recruiters
// at any of its companies, and their profile on MatLearn. Nothing is shared until switched on here,
// and only with Vectored Matrix connected.
const Sharing = () => {
  const { authFetch, signIn } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(null);

  const load = useCallback(
    () =>
      authFetch(`${api_base_url}/sharing`)
        .then((res) => (res.ok ? res.json() : null))
        .then((body) => body && setData(body))
        .catch(() => {}),
    // authFetch is a new function every render; reload only when the Vectored Matrix link changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signIn.vmatrix]
  );

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (portfolio, key) => {
    setSaving(`${portfolio.id}-${key}`);
    try {
      const res = await authFetch(`${api_base_url}/sharing/${portfolio.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !portfolio[key] }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail || "That did not save.");
      setData((d) => ({ ...d, portfolios: d.portfolios.map((p) => (p.id === body.id ? body : p)) }));
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(null);
    }
  };

  if (!data || data.portfolios.length === 0) return null;

  return (
    <section aria-labelledby="vm-sharing" className="mt-6 w-full max-w-md rounded-xl border border-frame_border bg-frame_bg p-5 text-left">
      <h2 id="vm-sharing" className="text-text_color font-semibold">Share with Vectored Matrix</h2>
      <p className="text-fg/60 text-xs mt-1">
        Get found for jobs at Vectored Matrix and its companies. You choose what they may see, portfolio by portfolio. Nothing is
        shared until you switch it on.
      </p>

      {!data.linked ? (
        <p className="mt-4 text-sm text-fg/80">Connect Vectored Matrix in Sign-in options first, so the companies know these portfolios are yours.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {data.portfolios.map((p) => (
            <li key={p.id} className="rounded-lg border border-frame_border p-3">
              <p className="text-sm font-semibold text-fg">{p.name}</p>
              <div className="mt-2 flex flex-col gap-2">
                {SWITCHES.map((s) => {
                  const blocked = s.needs && !p[s.needs];
                  const id = `share-${p.id}-${s.key}`;
                  return (
                    <label key={s.key} htmlFor={id} className={`flex items-start gap-2 text-sm ${blocked ? "opacity-50" : ""}`}>
                      <input
                        id={id}
                        type="checkbox"
                        className="mt-1"
                        checked={p[s.key]}
                        disabled={blocked || saving === `${p.id}-${s.key}`}
                        onChange={() => toggle(p, s.key)}
                      />
                      <span>
                        <span className="text-fg">{s.label}</span>
                        <span className="block text-fg/60 text-xs">{s.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {p.recruit && (
                <p className="mt-2 text-xs text-fg/60">
                  {p.views === 0
                    ? "No recruiter has opened this CV yet."
                    : `Opened by recruiters ${p.views} time${p.views === 1 ? "" : "s"} (${Object.entries(p.views_by_company)
                        .map(([company, n]) => `${companyName(company)} ${n}`)
                        .join(", ")}), last on ${when(p.last_viewed)}.`}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Sharing;
