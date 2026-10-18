import { useEffect, useState } from "react";
import { all_profiles_url, site_url } from "./globalvalues";
import { useSeo, personSchema, clip, SITE_NAME } from "./seo";
import { useAuth } from "./authContext";
import Home from "./Sections/home";
import Portfolio from "./Sections/portfolio";
import Contact from "./Sections/contact";
import Resume from "./Sections/resume";
import About from "./Sections/about";
import Notyetloader from "./notyetloaded";
import NotFound404 from "./notfound";
import EditPanel from "./editPanel";
import Logo from "./logo";

const TrackProfile = ({ username, trackSlug, refs }) => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchProfile = () => {
    const url = `${all_profiles_url}?username=${username}`;

    return fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data[0]);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const track = profile?.tracks?.find((t) => t.slug === trackSlug);
  const fullName = profile
    ? `${profile.user.first_name} ${profile.user.last_name}`.trim() || profile.user.username
    : "";
  const pageDescription = track
    ? clip(
        track.about?.description ||
          `${fullName} - ${track.name} portfolio: experience, education, skills and projects.`
      )
    : "";

  useSeo({
    // While loading keep the home-page defaults; an unknown slug is handled
    // (noindex) by the 404 page itself.
    enabled: !!track,
    title: `${track?.name} Portfolio – ${fullName} | ${SITE_NAME}`,
    description: pageDescription,
    path: `/${trackSlug}`,
    jsonLd:
      track &&
      personSchema({
        name: fullName,
        url: `${site_url}/${trackSlug}`,
        jobTitle: track.about?.skill,
        description: pageDescription,
        image: track.display_pic || profile.display_pic,
        sameAs: [track.github, track.linkedin, track.twitter, track.facebook].filter(Boolean),
        knowsAbout: track.about?.proficiency?.map((p) => p.skill_name),
      }),
  });

  if (!profile) return <Notyetloader />;

  if (!track) return <NotFound404 />;

  return (
    <>
      {isAuthenticated && (
        <div className="flex justify-center mt-5">
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className="bg-frame_bg text-text_color px-4 py-2 rounded-lg font-semibold"
          >
            {editMode ? "Done Editing" : "Edit This Portfolio"}
          </button>
        </div>
      )}

      {editMode ? (
        <EditPanel track={track} onSaved={fetchProfile} />
      ) : (
        <>
          <div ref={refs?.home} className="scroll-mt-20">
            <Home
              username={username}
              user={profile.user}
              about={track.about}
              img={track.display_pic || profile.display_pic}
            />
          </div>
          <div ref={refs?.about} className="scroll-mt-20">
            <About username={username} name={fullName} about={track.about} />
          </div>
          <div ref={refs?.resume} className="scroll-mt-20">
            <Resume username={username} trackName={track.name} about={track.about} />
          </div>
          <div ref={refs?.portfolio} className="scroll-mt-20">
            <Portfolio username={username} portfolio={track.items} />
          </div>
          <div ref={refs?.contact} className="scroll-mt-20">
            <Contact username={username} contact={{ ...profile, ...track }} />
          </div>
        </>
      )}

      <div className="mt-5 bg-frame_bg mx-5 sm:mx-10 rounded-2xl border border-frame_border flex justify-center py-6">
        <Logo fullClassName="h-14 sm:h-16" alwaysFull />
      </div>
    </>
  );
};

export default TrackProfile;
