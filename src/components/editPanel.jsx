import { useState } from "react";
import { api_base_url, portfolio_categories } from "./globalvalues";
import { useAuth } from "./authContext";
import EntryListEditor from "./entryListEditor";

const PROFILE_FIELDS = [
  { name: "display_pic", label: "Display picture URL" },
  { name: "github", label: "GitHub" },
  { name: "linkedin", label: "LinkedIn" },
  { name: "whatapp", label: "WhatsApp" },
  { name: "facebook", label: "Facebook" },
  { name: "twitter", label: "Twitter" },
  { name: "email", label: "Email" },
  { name: "phone_number", label: "Phone number" },
];

const RESUME_FIELDS = [
  { name: "post", label: "Position", type: "text" },
  { name: "company_name", label: "Company", type: "text" },
  { name: "start_year", label: "Start", type: "date" },
  { name: "end_year", label: "End", type: "date" },
  { name: "certificate_link", label: "Certificate link (optional)", type: "text" },
];

const SCHOOL_FIELDS = [
  { name: "school_name", label: "School", type: "text" },
  { name: "start_year", label: "Start", type: "date" },
  { name: "end_year", label: "End", type: "date" },
  { name: "certificate_link", label: "Certificate link (optional)", type: "text" },
];

const PROFICIENCY_FIELDS = [
  { name: "skill_name", label: "Skill", type: "text" },
  { name: "skill_range", label: "Level (0-100)", type: "number", min: 0, max: 100 },
  { name: "certificate_link", label: "Certificate link (optional)", type: "text" },
];

const PORTFOLIO_FIELDS = [
  { name: "category", label: "Category", type: "select", options: portfolio_categories },
  { name: "name", label: "Name", type: "text" },
  { name: "thumbnail", label: "Thumbnail URL", type: "text" },
  { name: "project_link", label: "Project link", type: "text" },
];

const ProfileAboutForm = ({ profile, about, onSaved }) => {
  const { authFetch } = useAuth();
  const [profileData, setProfileData] = useState(
    Object.fromEntries(PROFILE_FIELDS.map((f) => [f.name, profile[f.name] ?? ""]))
  );
  const [aboutData, setAboutData] = useState({
    skill: about.skill ?? "",
    experience_since: about.experience_since ?? "",
    description: about.description ?? "",
    image_link: about.image_link ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    Promise.all([
      authFetch(`${api_base_url}/profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      }),
      authFetch(`${api_base_url}/about/${about.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aboutData),
      }),
    ])
      .then(([profileRes, aboutRes]) => {
        if (!profileRes.ok || !aboutRes.ok) throw new Error("Save failed");
        onSaved();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-frame_bg rounded-xl p-6 mx-5 sm:mx-10 mt-5 flex flex-col gap-4"
    >
      <h3 className="text-text_color text-xl font-semibold">Profile & About</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        {PROFILE_FIELDS.map((f) => (
          <div key={f.name} className="flex flex-col gap-1">
            <label className="text-fg/60 text-xs">{f.label}</label>
            <input
              type="text"
              value={profileData[f.name]}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, [f.name]: e.target.value }))
              }
              className="bg-body_bg text-fg rounded px-2 py-1 outline-none"
            />
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-fg/60 text-xs">Skill / headline</label>
          <input
            type="text"
            value={aboutData.skill}
            onChange={(e) => setAboutData((prev) => ({ ...prev, skill: e.target.value }))}
            className="bg-body_bg text-fg rounded px-2 py-1 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-fg/60 text-xs">
            Experience since (years of experience auto-updates from this every year)
          </label>
          <input
            type="date"
            value={aboutData.experience_since}
            onChange={(e) =>
              setAboutData((prev) => ({ ...prev, experience_since: e.target.value }))
            }
            className="bg-body_bg text-fg rounded px-2 py-1 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-fg/60 text-xs">About image URL</label>
          <input
            type="text"
            value={aboutData.image_link}
            onChange={(e) => setAboutData((prev) => ({ ...prev, image_link: e.target.value }))}
            className="bg-body_bg text-fg rounded px-2 py-1 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-fg/60 text-xs">Description</label>
          <textarea
            rows={4}
            value={aboutData.description}
            onChange={(e) => setAboutData((prev) => ({ ...prev, description: e.target.value }))}
            className="bg-body_bg text-fg rounded px-2 py-1 outline-none"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary self-start disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Profile & About"}
      </button>
    </form>
  );
};

const EditPanel = ({ profile, track, onSaved }) => {
  const about = track.about;

  return (
    <div className="pb-10">
      <ProfileAboutForm profile={profile} about={about} onSaved={onSaved} />

      <EntryListEditor
        title="Resume"
        entries={about.resume}
        fields={RESUME_FIELDS}
        endpoint={`${api_base_url}/resume/`}
        parentField="about"
        parentId={about.id}
        onChange={onSaved}
      />

      <EntryListEditor
        title="Education"
        entries={about.school}
        fields={SCHOOL_FIELDS}
        endpoint={`${api_base_url}/school/`}
        parentField="about"
        parentId={about.id}
        onChange={onSaved}
      />

      <EntryListEditor
        title="Skills"
        entries={about.proficiency}
        fields={PROFICIENCY_FIELDS}
        endpoint={`${api_base_url}/proficiency/`}
        parentField="about"
        parentId={about.id}
        onChange={onSaved}
      />

      <EntryListEditor
        title="Portfolio Projects"
        entries={track.items}
        fields={PORTFOLIO_FIELDS}
        endpoint={`${api_base_url}/portfolio/`}
        parentField="track"
        parentId={track.id}
        onChange={onSaved}
      />
    </div>
  );
};

export default EditPanel;
