import { useState } from "react";
import { api_base_url } from "./globalvalues";
import { useAuth } from "./authContext";
import EntryListEditor from "./entryListEditor";
import FieldHint from "./fieldHint";
import { validateField, validateAll, describeFailure, inputClass } from "./validation";
import {
  PROFILE_FIELDS,
  ABOUT_FIELDS,
  RESUME_FIELDS,
  SCHOOL_FIELDS,
  PROFICIENCY_FIELDS,
  PORTFOLIO_FIELDS,
} from "./fieldDefs";

const LabeledField = ({ field, value, onChange }) => {
  const error = validateField(field, value);
  const Control = field.type === "textarea" ? "textarea" : "input";

  return (
    <div className={`flex flex-col gap-1 ${field.span ? "sm:col-span-2" : ""}`}>
      <label className="text-fg/60 text-xs">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      <Control
        type={field.type === "textarea" ? undefined : field.type === "date" ? "date" : "text"}
        rows={field.type === "textarea" ? 4 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={inputClass(error)}
      />
      <FieldHint field={field} value={value} error={error} />
    </div>
  );
};

const ProfileAboutForm = ({ profile, about, onSaved }) => {
  const { authFetch } = useAuth();
  const [profileData, setProfileData] = useState(
    Object.fromEntries(PROFILE_FIELDS.map((f) => [f.name, profile[f.name] ?? ""]))
  );
  const [aboutData, setAboutData] = useState(
    Object.fromEntries(ABOUT_FIELDS.map((f) => [f.name, about[f.name] ?? ""]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const errorCount =
    Object.keys(validateAll(PROFILE_FIELDS, profileData)).length +
    Object.keys(validateAll(ABOUT_FIELDS, aboutData)).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (errorCount > 0) return;
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
        // The date column is nullable but rejects "" - send null when cleared.
        body: JSON.stringify({
          ...aboutData,
          experience_since: aboutData.experience_since || null,
        }),
      }),
    ])
      .then(async ([profileRes, aboutRes]) => {
        const failures = [];
        if (!profileRes.ok) failures.push(await describeFailure("Profile not saved", profileRes));
        if (!aboutRes.ok) failures.push(await describeFailure("About not saved", aboutRes));
        // One request may have succeeded while the other failed - refresh so
        // the form reflects what is actually stored.
        onSaved();
        if (failures.length) throw new Error(failures.join(" | "));
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-frame_bg rounded-xl p-6 mx-5 sm:mx-10 mt-5 flex flex-col gap-4"
    >
      <h3 className="text-text_color text-xl font-semibold">Profile & About</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        {PROFILE_FIELDS.map((f) => (
          <LabeledField
            key={f.name}
            field={f}
            value={profileData[f.name]}
            onChange={(v) => setProfileData((prev) => ({ ...prev, [f.name]: v }))}
          />
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {ABOUT_FIELDS.map((f) => (
          <LabeledField
            key={f.name}
            field={f}
            value={aboutData[f.name]}
            onChange={(v) => setAboutData((prev) => ({ ...prev, [f.name]: v }))}
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || errorCount > 0}
          className="btn-primary self-start disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile & About"}
        </button>
        {errorCount > 0 && (
          <span className="text-red-500 text-sm">
            Fix {errorCount} highlighted field{errorCount > 1 ? "s" : ""} to save
          </span>
        )}
      </div>
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
