import { useState } from "react";
import { api_base_url, owner_username } from "./globalvalues";
import { useAuth } from "./authContext";
import { useToast } from "./toastContext";

const ENTRY_TYPE_FIELDS = {
  education: [
    { name: "school_name", label: "School", type: "text" },
    { name: "start_year", label: "Start", type: "date" },
    { name: "end_year", label: "End", type: "date" },
  ],
  experience: [
    { name: "post", label: "Position", type: "text" },
    { name: "company_name", label: "Company", type: "text" },
    { name: "start_year", label: "Start", type: "date" },
    { name: "end_year", label: "End", type: "date" },
  ],
  skill: [
    { name: "skill_name", label: "Skill", type: "text" },
    { name: "skill_range", label: "Level (0-100)", type: "number" },
  ],
};

// Prefills start_year from when the goal was created and end_year from
// today (the day it's marked complete), so the owner isn't forced to
// retype dates that are already implied - still editable if wrong.
const defaultEntryData = (entryType, goal) => {
  const today = new Date().toISOString().slice(0, 10);
  const goalCreated = goal.created_at ? goal.created_at.slice(0, 10) : today;

  return Object.fromEntries(
    ENTRY_TYPE_FIELDS[entryType].map((f) => {
      if (f.name === "start_year") return [f.name, goalCreated];
      if (f.name === "end_year") return [f.name, today];
      return [f.name, f.type === "number" ? 0 : ""];
    })
  );
};

const NewGoalForm = ({ onCreated }) => {
  const { authFetch } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    authFetch(`${api_base_url}/goals/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: owner_username,
        title,
        description,
        target_date: targetDate || null,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create goal");
        setTitle("");
        setDescription("");
        setTargetDate("");
        setOpen(false);
        onCreated();
      })
      .catch((err) => showToast(err.message))
      .finally(() => setSubmitting(false));
  };

  if (!open) {
    return (
      <div className="flex justify-center mb-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-frame_bg text-text_color px-4 py-2 rounded-lg font-semibold"
        >
          + New Goal
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-frame_bg rounded-xl p-6 max-w-xl mx-auto mb-8 flex flex-col gap-3"
    >
      <input
        type="text"
        placeholder="Goal title (e.g. AWS Diploma)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
        required
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
      />
      <div className="flex flex-col gap-1">
        <label className="text-fg/60 text-xs">
          Target date (when you plan to complete this, not a start date)
        </label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

const CompleteGoalModal = ({ goal, tracks, onClose, onCompleted }) => {
  const { authFetch } = useAuth();
  const [entryType, setEntryType] = useState("skill");
  const [entryData, setEntryData] = useState(defaultEntryData("skill", goal));
  const [certificateLink, setCertificateLink] = useState("");
  const [selectedTrackIds, setSelectedTrackIds] = useState([]);
  const [allTracks, setAllTracks] = useState(true);
  const [newTrackMode, setNewTrackMode] = useState(false);
  const [newTrackName, setNewTrackName] = useState("");
  const [copyFrom, setCopyFrom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const changeEntryType = (type) => {
    setEntryType(type);
    setEntryData(defaultEntryData(type, goal));
  };

  const toggleTrack = (id) => {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const submit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const body = {
      entry_type: entryType,
      entry_data: { ...entryData, certificate_link: certificateLink },
      track_ids: newTrackMode ? [] : allTracks ? tracks.map((t) => t.id) : selectedTrackIds,
    };
    if (newTrackMode) {
      body.new_track = {
        name: newTrackName,
        copy_from: copyFrom || null,
        copy_portfolio_items: true,
      };
    }

    authFetch(`${api_base_url}/goals/${goal.id}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to complete goal");
        onCompleted();
        onClose();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-5">
      <form
        onSubmit={submit}
        className="bg-frame_bg rounded-xl p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-text_color text-lg font-semibold">
          Complete "{goal.title}"
        </h3>

        <div className="flex flex-col gap-1">
          <label className="text-fg/60 text-xs">What did this achieve?</label>
          <select
            value={entryType}
            onChange={(e) => changeEntryType(e.target.value)}
            className="bg-body_bg text-fg rounded px-2 py-1 outline-none"
          >
            <option value="education">Education</option>
            <option value="experience">Experience</option>
            <option value="skill">Skill</option>
          </select>
        </div>

        {ENTRY_TYPE_FIELDS[entryType].map((f) => (
          <div key={f.name} className="flex flex-col gap-1">
            <label className="text-fg/60 text-xs">{f.label}</label>
            <input
              type={f.type}
              value={entryData[f.name]}
              onChange={(e) =>
                setEntryData((prev) => ({
                  ...prev,
                  [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value,
                }))
              }
              className="bg-body_bg text-fg rounded px-2 py-1 outline-none"
            />
          </div>
        ))}

        <div className="flex flex-col gap-1">
          <label className="text-fg/60 text-xs">Certificate link (optional)</label>
          <input
            type="text"
            value={certificateLink}
            onChange={(e) => setCertificateLink(e.target.value)}
            className="bg-body_bg text-fg rounded px-2 py-1 outline-none"
          />
        </div>

        <div className="border-t border-fg/10 pt-3">
          <label className="flex items-center gap-2 text-fg text-sm mb-2">
            <input
              type="checkbox"
              checked={newTrackMode}
              onChange={(e) => setNewTrackMode(e.target.checked)}
            />
            Start a new portfolio instead of updating existing ones
          </label>

          {newTrackMode ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="New portfolio name (e.g. Cybersecurity)"
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                className="bg-body_bg text-fg rounded px-2 py-1 outline-none"
                required={newTrackMode}
              />
              <select
                value={copyFrom}
                onChange={(e) => setCopyFrom(e.target.value)}
                className="bg-body_bg text-fg rounded px-2 py-1 outline-none"
              >
                <option value="">Start blank</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    Copy content from "{t.name}"
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-fg text-sm">
                <input
                  type="checkbox"
                  checked={allTracks}
                  onChange={(e) => setAllTracks(e.target.checked)}
                />
                Apply to all portfolios
              </label>
              {!allTracks && (
                <div className="flex flex-col gap-1 pl-5">
                  {tracks.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-fg text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTrackIds.includes(t.id)}
                        onChange={() => toggleTrack(t.id)}
                      />
                      {t.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              submitting ||
              (newTrackMode && !newTrackName.trim()) ||
              (!newTrackMode && !allTracks && selectedTrackIds.length === 0)
            }
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? "Completing..." : "Complete Goal"}
          </button>
        </div>
      </form>
    </div>
  );
};

const GoalsSection = ({ goals, tracks, onChange }) => {
  const { isAuthenticated } = useAuth();
  const [completingGoal, setCompletingGoal] = useState(null);

  return (
    <div className="mt-14">
      <h2 className="text-text_color text-2xl font-semibold text-center mb-5">Goals</h2>

      {isAuthenticated && <NewGoalForm onCreated={onChange} />}

      {goals.length === 0 ? (
        <p className="text-fg text-center">No goals yet.</p>
      ) : (
        <ul className="flex flex-col gap-3 max-w-xl mx-auto">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className="bg-frame_bg rounded-lg px-5 py-3 flex justify-between items-center gap-3"
            >
              <div>
                <p className="text-fg font-semibold">{goal.title}</p>
                {goal.target_date && (
                  <p className="text-fg/60 text-sm">Target: {goal.target_date}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    goal.status === "completed"
                      ? "bg-green-600 text-fg"
                      : "bg-yellow-600 text-fg"
                  }`}
                >
                  {goal.status === "completed" ? "Completed" : "In Progress"}
                </span>
                {isAuthenticated && goal.status !== "completed" && (
                  <button
                    type="button"
                    onClick={() => setCompletingGoal(goal)}
                    className="text-text_color text-xs underline"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {completingGoal && (
        <CompleteGoalModal
          goal={completingGoal}
          tracks={tracks}
          onClose={() => setCompletingGoal(null)}
          onCompleted={onChange}
        />
      )}
    </div>
  );
};

export default GoalsSection;
