import { useEffect, useState } from "react";
import { all_profiles_url } from "./globalvalues";
import Home from "./Sections/home";
import Portfolio from "./Sections/portfolio";
import Contact from "./Sections/contact";
import Resume from "./Sections/resume";
import About from "./Sections/about";
import Notyetloader from "./notyetloaded";

const Individualprofile = ({ username, refs }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const url = `${all_profiles_url}?username=${username}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        console.log(data[0].email);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [username]); // Add dependency to prevent unnecessary re-fetching

  // If profile is not loaded yet, show a loading state
  if (!profile) return <Notyetloader />;

  return (
    <>
      <div ref={refs?.home}>
        <Home
          username={username}
          user={profile[0].user}
          about={profile[0].about}
          img={profile[0]?.display_pic}
        />
      </div>
      <div ref={refs?.about}>
        <About username={username} about={profile[0].about} />
      </div>
      <div ref={refs?.resume}>
        <Resume username={username} about={profile[0].about} />
      </div>
      <div ref={refs?.portfolio}>
        <Portfolio username={username} portfolio={profile[0].portfolio} />
      </div>
      <div ref={refs?.contact}>
        <Contact username={username} contact={profile[0]} />
      </div>

      <div className=" mt-5 bg-frame_bg mx-5 sm:mx-10 text-text_color text-center text-3xl font-semibold py-5">
        @Vectored Matrix
      </div>
    </>
  );
};

export default Individualprofile;
