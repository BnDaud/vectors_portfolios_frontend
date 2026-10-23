import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiPencil, HiTrash } from "react-icons/hi";
import { FiLogIn, FiLogOut, FiKey } from "react-icons/fi";
import { all_profiles_url, api_base_url, site_url } from "./globalvalues";
import { accountHome, usePageOwner } from "./pageOwner";
import NotFound404 from "./notfound";
import SignInOptions from "./signInOptions";
import AccountsSection from "./accountsSection";
import { useSeo, personSchema, clip, SITE_NAME } from "./seo";
import { useAuth } from "./authContext";
import { useToast } from "./toastContext";
import Notyetloader from "./notyetloaded";
import VisitorsSection from "./visitorsSection";
import { ResumeLauncher } from "./resumeActions";
import { ProjectCopyChoice } from "./projectSharing";
import GoalsSection from "./goalsSection";
import ThemeToggle from "./themeToggle";
import Logo from "./logo";
import Avatar from "./avatar";
import FieldHint from "./fieldHint";
import { PROFILE_FIELDS } from "./fieldDefs";
import { validateField, describeFailure, inputClass } from "./validation";

// The landing page image is the owner profile's display_pic - same rules as
// any other dp (required, full URL, 200 characters).
// The owner's account forms (landing image, password) use pill-shaped, roomier inputs.
const ACCOUNT_INPUT_SHAPE = "rounded-full px-5 py-2.5";

// Mirrors Django's MinimumLengthValidator; the server also rejects common,
// all-numeric and username-like passwords and says why.
const PASSWORD_MIN_LENGTH = 8;

const LANDING_IMAGE_FIELD = PROFILE_FIELDS.find((f) => f.name === "display_pic");

const OwnerRoot = () => {
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const { showToast } = useToast();
  const [showNewTrackForm, setShowNewTrackForm] = useState(false);
  const [newTrackName, setNewTrackName] = useState("");
  const [copyFrom, setCopyFrom] = useState("");
  const [projectMode, setProjectMode] = useState("copy");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordServerErrors, setPasswordServerErrors] = useState({});
  const [passwordFormError, setPasswordFormError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [editingLanding, setEditingLanding] = useState(false);
  const [landingUrl, setLandingUrl] = useState("");
  const [landingError, setLandingError] = useState("");
  const [savingLanding, setSavingLanding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, username, authFetch, logout, changePassword, signIn } = useAuth();
  // whose front page this is; only its own signed-in owner gets the editing controls
  const owner = usePageOwner();
  const canEdit = owner.canEdit;
  const owner_username = owner.username;
  const [missing, setMissing] = useState(false);

  const fetchProfile = () => {
    fetch(`${all_profiles_url}?username=${encodeURIComponent(owner_username)}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data[0] || null);
        setMissing(!data[0]);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  };

  const fetchGoals = () => {
    fetch(`${api_base_url}/goals/?username=${owner_username}`)
      .then((res) => res.json())
      .then((data) => setGoals(data))
      .catch((err) => console.error("Error fetching goals:", err));
  };

  useEffect(() => {
    fetchProfile();
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner_username]);

  const ownerName = profile
    ? `${profile.user.first_name} ${profile.user.last_name}`.trim() || profile.user.username
    : "";
  const seoTracks = profile?.tracks || [];
  const landingDescription = clip(
    seoTracks.length
      ? `Portfolio of ${ownerName}: ${seoTracks.map((t) => t.name).join(", ")}. Explore projects, experience, education and skills.`
      : `Portfolio of ${ownerName}. Explore projects, experience, education and skills.`
  );
  useSeo({
    enabled: !!profile,
    title: `${ownerName} – Portfolio | ${SITE_NAME}`,
    description: landingDescription,
    path: owner.home,
    jsonLd:
      profile &&
      personSchema({
        name: ownerName,
        url: `${site_url}${owner.home}`,
        jobTitle: seoTracks[0]?.about?.skill,
        description: landingDescription,
        image: profile.display_pic,
        sameAs: [profile.github, profile.linkedin, profile.twitter, profile.facebook].filter(Boolean),
      }),
  });

  if (missing) return <NotFound404 />;
  if (!profile) return <Notyetloader />;

  const tracks = profile.tracks || [];
  // the site owner has no limit; a signed-up account has one portfolio
  const atLimit = profile.max_portfolios != null && tracks.length >= profile.max_portfolios;

  const handleCreateTrack = (e) => {
    e.preventDefault();
    if (!newTrackName.trim()) return;

    setSubmitting(true);
    setFormError("");

    authFetch(`${api_base_url}/tracks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: owner_username,
        name: newTrackName.trim(),
        copy_from: copyFrom || null,
        copy_portfolio_items: projectMode === "copy",
        share_portfolio_items: projectMode === "share",
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create portfolio");
        return res.json();
      })
      .then(() => {
        setNewTrackName("");
        setCopyFrom("");
        setProjectMode("copy");
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

    authFetch(`${api_base_url}/tracks/${trackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to rename portfolio");
        return res.json();
      })
      .then(() => fetchProfile())
      .catch((err) => showToast(err.message));
  };

  const startLandingEdit = () => {
    setEditingPassword(false);
    setLandingUrl(profile.display_pic || "");
    setLandingError("");
    setEditingLanding(true);
  };

  const saveLandingImage = (e) => {
    e.preventDefault();
    if (validateField(LANDING_IMAGE_FIELD, landingUrl)) return;

    setSavingLanding(true);
    setLandingError("");
    authFetch(`${api_base_url}/profiles/${profile.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_pic: landingUrl.trim() }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await describeFailure("Image not saved", res));
        setEditingLanding(false);
        fetchProfile();
      })
      .catch((err) => setLandingError(err.message))
      .finally(() => setSavingLanding(false));
  };

  const passwordErrors = {
    current: passwords.current ? "" : "Required",
    next:
      passwords.next.length < PASSWORD_MIN_LENGTH
        ? `At least ${PASSWORD_MIN_LENGTH} characters`
        : passwords.next === passwords.current
          ? "Must differ from the current password"
          : "",
    confirm: passwords.confirm === passwords.next ? "" : "Does not match the new password",
  };
  const passwordInvalid = Object.values(passwordErrors).some(Boolean);

  const openPasswordForm = () => {
    setEditingLanding(false);
    setPasswords({ current: "", next: "", confirm: "" });
    setPasswordServerErrors({});
    setPasswordFormError("");
    setEditingPassword(true);
  };

  const savePassword = (e) => {
    e.preventDefault();
    if (passwordInvalid) return;

    setSavingPassword(true);
    setPasswordServerErrors({});
    setPasswordFormError("");
    changePassword(passwords.current, passwords.next)
      .then(() => {
        setEditingPassword(false);
        setPasswords({ current: "", next: "", confirm: "" });
        showToast("Password changed", "success");
      })
      .catch((err) => {
        setPasswordServerErrors(err.fieldErrors || {});
        if (!err.fieldErrors?.current_password && !err.fieldErrors?.new_password) {
          setPasswordFormError(err.message);
        }
      })
      .finally(() => setSavingPassword(false));
  };

  const openDeleteModal = (e, track) => {
    e.stopPropagation();
    setDeleteTarget(track);
    setDeleteConfirmText("");
  };

  const confirmDelete = () => {
    if (!deleteTarget || deleteConfirmText !== deleteTarget.name) return;

    setDeleting(true);
    authFetch(`${api_base_url}/tracks/${deleteTarget.id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete portfolio");
        setDeleteTarget(null);
        setDeleteConfirmText("");
        fetchProfile();
      })
      .catch((err) => showToast(err.message))
      .finally(() => setDeleting(false));
  };

  return (
    <div className="pt-20">
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-5 sm:px-10 backdrop-blur-md bg-frame_bg/60 h-16 shadow-md">
        <Logo />
        <div className="flex items-center gap-3 sm:gap-6">
          <ResumeLauncher tracks={tracks} variant="nav" />
          <ThemeToggle />
          {isAuthenticated && !canEdit && (
            <Link to={accountHome(username)} className="hidden sm:inline-flex text-sm text-text_color font-semibold hover:underline">
              My page
            </Link>
          )}
          {!isAuthenticated && (
            <Link to="/signup" className="hidden sm:inline-flex text-sm text-text_color font-semibold hover:underline">
              Sign up
            </Link>
          )}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-frame_border text-fg/80 hover:text-red-400 hover:border-red-400/40 transition-colors"
            >
              <FiLogOut />
              {username}
            </button>
          ) : (
            <Link to="/login" className="btn-primary flex items-center gap-1.5 text-sm">
              <FiLogIn />
              Login
            </Link>
          )}
        </div>
      </nav>

      <div className="mt-5 mx-5 sm:mx-10 pb-10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-4">
            <Avatar
              src={profile.display_pic}
              label={`${profile.user.first_name} ${profile.user.last_name}`.trim() || profile.user.username}
              className="h-32 w-32"
              priority
            />
            {canEdit && !editingLanding && (
              <button
                type="button"
                onClick={startLandingEdit}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-frame_bg border border-frame_border text-fg/70 hover:text-text_color shadow"
                aria-label="Change landing page image"
              >
                <HiPencil />
              </button>
            )}
          </div>

          {canEdit && editingLanding && (
            <form
              onSubmit={saveLandingImage}
              noValidate
              className="w-full max-w-md mb-4 flex flex-col gap-2 text-left bg-frame_bg border border-frame_border shadow-sm rounded-2xl p-5 sm:p-6"
            >
              <label className="text-fg/60 text-xs">
                Landing page image URL<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                autoFocus
                value={landingUrl}
                onChange={(e) => setLandingUrl(e.target.value)}
                aria-invalid={!!validateField(LANDING_IMAGE_FIELD, landingUrl)}
                className={inputClass(validateField(LANDING_IMAGE_FIELD, landingUrl), ACCOUNT_INPUT_SHAPE)}
              />
              <FieldHint
                field={LANDING_IMAGE_FIELD}
                value={landingUrl}
                error={validateField(LANDING_IMAGE_FIELD, landingUrl)}
              />
              {landingError && <p className="text-red-500 text-xs">{landingError}</p>}
              <div className="flex gap-3 justify-end mt-1">
                <button type="button" className="btn-ghost" onClick={() => setEditingLanding(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLanding || !!validateField(LANDING_IMAGE_FIELD, landingUrl)}
                  className="btn-primary disabled:opacity-50"
                >
                  {savingLanding ? "Saving..." : "Save image"}
                </button>
              </div>
            </form>
          )}
          <h1 className="text-text_color text-3xl font-bold">
            {profile.user.first_name} {profile.user.last_name}
          </h1>
          <p className="text-fg mt-2">Choose a portfolio to view</p>
          <ResumeLauncher tracks={tracks} />
          {canEdit && <SignInOptions />}
          {canEdit && signIn.password && !editingPassword && (
            <button
              type="button"
              onClick={openPasswordForm}
              className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-frame_border text-fg/70 hover:text-text_color hover:border-text_color/40 transition-colors"
            >
              <FiKey />
              Change password
            </button>
          )}

          {canEdit && editingPassword && (
            <form
              onSubmit={savePassword}
              noValidate
              className="w-full max-w-md mt-4 flex flex-col gap-3.5 text-left bg-frame_bg border border-frame_border shadow-sm rounded-2xl p-5 sm:p-6"
            >
              <h2 className="text-text_color font-semibold">Change password</h2>
              {[
                ["current", "Current password", "current-password"],
                ["next", "New password", "new-password"],
                ["confirm", "Confirm new password", "new-password"],
              ].map(([key, label, autoComplete]) => {
                const serverError =
                  key === "current"
                    ? passwordServerErrors.current_password
                    : key === "next"
                      ? passwordServerErrors.new_password
                      : null;
                const error = (passwords[key] || serverError) && passwordErrors[key] ? passwordErrors[key] : "";
                const shown = error || (serverError ? serverError.join(" ") : "");
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-fg/60 text-xs">
                      {label}
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="password"
                      autoComplete={autoComplete}
                      value={passwords[key]}
                      onChange={(e) => {
                        setPasswords((prev) => ({ ...prev, [key]: e.target.value }));
                        setPasswordServerErrors({});
                      }}
                      aria-invalid={!!shown}
                      className={inputClass(shown, ACCOUNT_INPUT_SHAPE)}
                    />
                    {shown && <p className="text-red-500 text-xs">{shown}</p>}
                  </div>
                );
              })}
              {passwordFormError && <p className="text-red-500 text-xs">{passwordFormError}</p>}
              <p className="text-fg/50 text-xs">
                Changing it signs you out everywhere else.
              </p>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-ghost" onClick={() => setEditingPassword(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword || passwordInvalid}
                  className="btn-primary disabled:opacity-50"
                >
                  {savingPassword ? "Saving..." : "Change password"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex flex-wrap gap-6 justify-center">
          {tracks.map((track) => (
            <div
              key={track.id}
              data-track-slug={track.slug}
              role="link"
              tabIndex={0}
              onClick={() => navigate(owner.path(track.slug))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target === e.currentTarget) navigate(owner.path(track.slug));
              }}
              className="group relative w-full sm:w-[24rem] cursor-pointer bg-frame_bg border border-frame_border rounded-xl shadow-lg px-6 py-8 sm:py-5 flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-x-6 sm:text-left outline-none transition-all hover:-translate-y-1 hover:border-text_color/40 hover:shadow-[0_0_24px_-4px_var(--color-text_color)] focus-visible:ring-2 focus-visible:ring-text_color"
            >
              <Avatar
                src={track.display_pic || profile.display_pic}
                label={track.name}
                className="h-24 w-24"
                decorative
              />

              {canEdit && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => startRename(e, track)}
                    className="text-fg/60 hover:text-text_color"
                    aria-label="Rename portfolio"
                  >
                    <HiPencil />
                  </button>
                  {tracks.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => openDeleteModal(e, track)}
                      className="text-fg/60 hover:text-red-500"
                      aria-label="Delete portfolio"
                    >
                      <HiTrash />
                    </button>
                  )}
                </div>
              )}

              <div className={`min-w-0 flex-1 space-y-2 ${canEdit ? "sm:pr-6" : ""}`}>
                <div className="space-y-0.5">
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
                      className="bg-body_bg text-text_color text-lg font-semibold rounded px-2 py-1 w-full outline-none"
                    />
                  ) : (
                    <h2 className="text-text_color text-lg font-semibold truncate">
                      {track.name}
                    </h2>
                  )}
                  <p className="text-fg/60 font-medium line-clamp-2">{track.about?.skill}</p>
                </div>
                <span className="inline-block px-4 py-1 text-sm text-text_color font-semibold rounded-full border border-text_color/40 transition-colors group-hover:bg-text_color group-hover:text-body_bg group-hover:border-transparent">
                  View portfolio
                </span>
              </div>
            </div>
          ))}

          {canEdit && atLimit && (
            <p className="w-full text-center text-fg/60 text-sm">
              Your account can have {profile.max_portfolios} portfolio{profile.max_portfolios === 1 ? "" : "s"}. Delete it to start a different one.
            </p>
          )}
          {canEdit && !atLimit && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowNewTrackForm(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setShowNewTrackForm(true);
              }}
              className="w-full sm:w-[24rem] min-h-36 border-2 border-dashed border-text_color/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer outline-none transition-all hover:-translate-y-1 hover:border-text_color focus-visible:ring-2 focus-visible:ring-text_color"
            >
              <span className="text-text_color text-4xl leading-none">+</span>
              <p className="text-fg text-sm mt-2">New Portfolio</p>
            </div>
          )}
        </div>

        {canEdit && showNewTrackForm && (
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
              className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
              required
            />

            {tracks.length > 0 && (
              <select
                value={copyFrom}
                onChange={(e) => setCopyFrom(e.target.value)}
                className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
              >
                <option value="">Start blank</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    Copy content from "{track.name}"
                  </option>
                ))}
              </select>
            )}

            {copyFrom && <ProjectCopyChoice value={projectMode} onChange={setProjectMode} className="rounded px-3 py-2" />}

            {formError && (
              <p className="text-red-500 text-sm">{formError}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowNewTrackForm(false)}
              >
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
        )}

        {deleteTarget && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-5">
            <div className="bg-frame_bg rounded-xl p-6 max-w-md w-full flex flex-col gap-4">
              <h3 className="text-text_color text-lg font-semibold">
                Delete "{deleteTarget.name}"
              </h3>
              <p className="text-fg text-sm">
                This cannot be undone. Type{" "}
                <span className="font-semibold">{deleteTarget.name}</span> to
                confirm.
              </p>
              <input
                type="text"
                autoFocus
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteConfirmText("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText !== deleteTarget.name || deleting}
                  onClick={confirmDelete}
                  className="bg-red-600 text-fg font-semibold px-4 py-2 rounded disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {canEdit && (
          <GoalsSection
            goals={goals}
            tracks={tracks}
            onChange={() => {
              fetchGoals();
              fetchProfile();
            }}
          />
        )}

        {/* Owner-only: who has visited, never including the owner's own visits */}
        {canEdit && <VisitorsSection />}

        {/* site owner only: the accounts people have made */}
        {canEdit && owner.isSiteOwner && <AccountsSection />}
      </div>
    </div>
  );
};

export default OwnerRoot;
