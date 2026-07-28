import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiPencil, HiTrash } from "react-icons/hi";
import { all_profiles_url, api_base_url, owner_username } from "./globalvalues";
import Notyetloader from "./notyetloaded";

const OwnerRoot = () => {
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [showNewTrackForm, setShowNewTrackForm] = useState(false);
  const [newTrackName, setNewTrackName] = useState("");
  const [copyFrom, setCopyFrom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const navigate = useNavigate();

  const fetchProfile = () => {
    fetch(`${all_profiles_url}?username=${owner_username}`)
      .then((res) => res.json())
      .then((data) => setProfile(data[0]))
      .catch((err) => console.error("Error fetching profile:", err));
  };

  useEffect(() => {
    fetchProfile();

    fetch(`${api_base_url}/goals/?username=${owner_username}`)
      .then((res) => res.json())
      .then((data) => setGoals(data))
      .catch((err) => console.error("Error fetching goals:", err));
  }, []);

  if (!profile) return <Notyetloader />;

  const tracks = profile.tracks || [];

  const handleCreateTrack = (e) => {
    e.preventDefault();
    if (!newTrackName.trim()) return;

    setSubmitting(true);
    setFormError("");

    fetch(`${api_base_url}/tracks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: owner_username,
        name: newTrackName.trim(),
        copy_from: copyFrom || null,
        copy_portfolio_items: true,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create portfolio");
        return res.json();
      })
      .then(() => {
        setNewTrackName("");
        setCopyFrom("");
        setShowNewTrackForm(false);
        fetchProfile();
      })
      .catch((err) => setFormError(err.message))
      .finally(() => setSubmitting(false));
  };

  const startRename = (e, track) => {
    e.stopPropagation();
    setEditingTrackId(track.id);
    setEditingName(track.name);
  };

  const submitRename = (trackId) => {
    const name = editingName.trim();
    setEditingTrackId(null);
    if (!name) return;

    fetch(`${api_base_url}/tracks/${trackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to rename portfolio");
        return res.json();
      })
      .then(() => fetchProfile())
      .catch((err) => console.error(err));
  };

  const handleDeleteTrack = (e, track) => {
    e.stopPropagation();
    if (tracks.length <= 1) {
      alert("You need at least one portfolio.");
      return;
    }
    if (!window.confirm(`Delete "${track.name}"? This cannot be undone.`)) return;

    fetch(`${api_base_url}/tracks/${track.id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete portfolio");
        fetchProfile();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="pt-20">
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center px-5 sm:px-10 backdrop-blur-md bg-frame_bg/60 h-16 shadow-md">
        <p className="bg-gradient-to-r from-text_color to-new_color bg-clip-text text-transparent text-2xl sm:text-3xl font-bold">
          Vectored Matrix
        </p>
      </nav>

      <div className="mt-5 mx-5 sm:mx-10 pb-10">
        <div className="flex flex-col items-center text-center mb-10">
          <img
            src={profile.display_pic}
            className="w-32 h-32 rounded-full object-cover mb-4"
            alt={profile.user.username}
          />
          <h1 className="text-text_color text-3xl font-bold">
            {profile.user.first_name} {profile.user.last_name}
          </h1>
          <p className="text-white mt-2">Choose a portfolio to view</p>
        </div>

        <div className="flex flex-wrap gap-6 justify-center">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="relative bg-frame_bg rounded-xl p-6 w-64 flex flex-col items-center text-center hover:cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate(`/${track.slug}`)}
            >
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => startRename(e, track)}
                  className="text-white/60 hover:text-text_color"
                  aria-label="Rename portfolio"
                >
                  <HiPencil />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteTrack(e, track)}
                  className="text-white/60 hover:text-red-500"
                  aria-label="Delete portfolio"
                >
                  <HiTrash />
                </button>
              </div>

              {editingTrackId === track.id ? (
                <input
                  type="text"
                  autoFocus
                  value={editingName}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => submitRename(track.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitRename(track.id);
                    if (e.key === "Escape") setEditingTrackId(null);
                  }}
                  className="bg-body_bg text-text_color text-xl font-semibold text-center rounded px-2 py-1 w-full outline-none"
                />
              ) : (
                <h3 className="text-text_color text-xl font-semibold">
                  {track.name}
                </h3>
              )}
              <p className="text-white text-sm mt-2">{track.about?.skill}</p>
            </div>
          ))}

          <div
            className="border-2 border-dashed border-text_color/50 rounded-xl p-6 w-64 flex flex-col items-center justify-center text-center hover:cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setShowNewTrackForm(true)}
          >
            <span className="text-text_color text-4xl leading-none">+</span>
            <p className="text-white text-sm mt-2">New Portfolio</p>
          </div>
        </div>

        {showNewTrackForm && (
          <form
            onSubmit={handleCreateTrack}
            className="bg-frame_bg rounded-xl p-6 max-w-md mx-auto mt-8 flex flex-col gap-4"
          >
            <h3 className="text-text_color text-lg font-semibold">
              New Portfolio
            </h3>

            <input
              type="text"
              placeholder="e.g. Cybersecurity"
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              className="bg-body_bg text-white rounded px-3 py-2 outline-none"
              required
            />

            {tracks.length > 0 && (
              <select
                value={copyFrom}
                onChange={(e) => setCopyFrom(e.target.value)}
                className="bg-body_bg text-white rounded px-3 py-2 outline-none"
              >
                <option value="">Start blank</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    Copy content from "{track.name}"
                  </option>
                ))}
              </select>
            )}

            {formError && (
              <p className="text-red-500 text-sm">{formError}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="text-white px-4 py-2 rounded"
                onClick={() => setShowNewTrackForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-text_color text-body_bg font-semibold px-4 py-2 rounded disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-14">
          <h2 className="text-text_color text-2xl font-semibold text-center mb-5">
            Goals
          </h2>
          {goals.length === 0 ? (
            <p className="text-white text-center">No goals yet.</p>
          ) : (
            <ul className="flex flex-col gap-3 max-w-xl mx-auto">
              {goals.map((goal) => (
                <li
                  key={goal.id}
                  className="bg-frame_bg rounded-lg px-5 py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-semibold">{goal.title}</p>
                    {goal.target_date && (
                      <p className="text-white/60 text-sm">
                        Target: {goal.target_date}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      goal.status === "completed"
                        ? "bg-green-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {goal.status === "completed" ? "Completed" : "In Progress"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerRoot;
