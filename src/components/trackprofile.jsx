import { useEffect, useState } from "react";
import { all_profiles_url } from "./globalvalues";
import { useAuth } from "./authContext";
import Home from "./Sections/home";
import Portfolio from "./Sections/portfolio";
import Contact from "./Sections/contact";
import Resume from "./Sections/resume";
import About from "./Sections/about";
import Notyetloader from "./notyetloaded";
import NotFound404 from "./notfound";
import EditPanel from "./editPanel";

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

  if (!profile) return <Notyetloader />;

  const track = profile.tracks?.find((t) => t.slug === trackSlug);

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
        <EditPanel profile={profile} track={track} onSaved={fetchProfile} />
      ) : (
        <>
          <div ref={refs?.home}>
            <Home
              username={username}
              user={profile.user}
              about={track.about}
              img={profile?.display_pic}
            />
          </div>
          <div ref={refs?.about}>
            <About username={username} about={track.about} />
          </div>
          <div ref={refs?.resume}>
            <Resume username={username} about={track.about} />
          </div>
          <div ref={refs?.portfolio}>
            <Portfolio username={username} portfolio={track.items} />
          </div>
          <div ref={refs?.contact}>
            <Contact username={username} contact={profile} />
          </div>
        </>
      )}

      <div className=" mt-5 bg-frame_bg mx-5 sm:mx-10 text-text_color text-center text-3xl font-semibold py-5">
        @Vectored Matrix
      </div>
    </>
  );
};

export default TrackProfile;
