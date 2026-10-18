import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw, FiUsers } from "react-icons/fi";
import { useAuth } from "./authContext";
import { api_base_url } from "./globalvalues";

const timeAgo = (iso) => {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return `${n} ${unit}${n > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

const Stat = ({ label, value, hint }) => (
  <div className="bg-body_bg rounded-xl p-4" title={hint}>
    <p className="text-text_color text-3xl font-bold leading-none">{value}</p>
    <p className="text-fg/70 text-xs mt-2">{label}</p>
  </div>
);

// Owner-only report on the landing page: how many different people came, who
// came back, and which portfolios each of them opened. A returning person
// raises their own "visits", never the unique-visitor count.
const VisitorsSection = () => {
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    authFetch(`${api_base_url}/analytics/summary`)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load visitors (${res.status})`);
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pages = data
    ? [{ slug: "", name: "Landing page", ...data.landing }, ...data.portfolios]
    : [];
  const busiest = Math.max(1, ...pages.map((p) => p.visits));

  return (
    <section
      aria-labelledby="visitors-heading"
      className="max-w-3xl mx-auto mt-12 bg-frame_bg border border-frame_border rounded-xl p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="visitors-heading" className="flex items-center gap-2 text-text_color text-xl font-semibold">
            <FiUsers /> Visitors
          </h2>
          <p className="text-fg/60 text-xs mt-1">
            Only you can see this. Your own visits are never counted.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label="Refresh visitors"
          className="p-2 rounded-full text-fg/70 hover:text-text_color disabled:opacity-40"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      {!data && !error && <p className="text-fg/60 text-sm mt-4">Loading...</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <Stat label="Unique visitors" value={data.unique_visitors} hint="Different people, each counted once" />
            <Stat label="Came back" value={data.returning_visitors} hint="Visitors with more than one visit" />
            <Stat label="Total visits" value={data.total_visits} hint="Every visit, including repeats" />
            <Stat label="New this week" value={data.new_last_7_days} hint="First seen in the last 7 days" />
          </div>

          {data.unique_visitors === 0 ? (
            <p className="text-fg/60 text-sm mt-6">No visitors yet.</p>
          ) : (
            <>
              <h3 className="text-fg font-semibold mt-7 mb-3">Which pages</h3>
              <ul className="flex flex-col gap-3">
                {pages.map((page) => (
                  <li key={page.slug || "landing"}>
                    <div className="flex justify-between text-sm text-fg">
                      <span className="truncate">{page.name}</span>
                      <span className="text-fg/60 shrink-0 ml-3">
                        {page.viewers} {page.viewers === 1 ? "person" : "people"} · {page.visits}{" "}
                        {page.visits === 1 ? "visit" : "visits"}
                      </span>
                    </div>
                    <div className="h-1.5 mt-1 rounded-full bg-fg/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-new_color to-text_color"
                        style={{ width: `${(page.visits / busiest) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <h3 className="text-fg font-semibold mt-7 mb-3">Recent visitors</h3>
              <ul className="flex flex-col gap-2">
                {data.recent.map((visitor) => (
                  <li key={visitor.id} className="bg-body_bg rounded-lg px-4 py-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-fg font-semibold text-sm">Visitor #{visitor.id}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          visitor.returning
                            ? "border-text_color/50 text-text_color"
                            : "border-fg/20 text-fg/60"
                        }`}
                      >
                        {visitor.returning ? `Returning · ${visitor.visits} visits` : "New"}
                      </span>
                      <span className="text-fg/50 text-xs ml-auto">{timeAgo(visitor.last_seen)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {visitor.landing_visits > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-fg/10 text-fg/80">Landing page</span>
                      )}
                      {visitor.viewed.map((view) => (
                        <span key={view.slug} className="text-xs px-2 py-0.5 rounded bg-text_color/15 text-text_color">
                          {view.name}
                          {view.visits > 1 ? ` ×${view.visits}` : ""}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
};

export default VisitorsSection;
