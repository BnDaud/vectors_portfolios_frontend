import { useState, useContext, useRef, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi"; // for hamburger icons
import Allprofiles from "./allprofiles";
import Individualprofile from "./individualprofile";
import { Globalcontext } from "../App"; // Import the context
import { useSearchParams } from "react-router-dom";

const Template = () => {
  const { username, currentpage, setCurrentpage, setUsername } =
    useContext(Globalcontext);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use useSearchParams to get the username from the query string
  const [searchParams] = useSearchParams();
  const urlUsername = searchParams.get("username"); // Get the "username" query parameter

  useEffect(() => {
    if (urlUsername) {
      setUsername(urlUsername); // Update the context with the username
      // Log the username to verify
      setCurrentpage("");
    }
  }, [urlUsername, setUsername, setCurrentpage]); // Add dependencies for better effect handling

  const sectionsref = {
    home: useRef(null),
    about: useRef(null),
    resume: useRef(null),
    portfolio: useRef(null),
    contact: useRef(null),
  };

  const scroll_to_section = (section) => {
    sectionsref[section.toLowerCase()]?.current?.scrollIntoView({
      behavior: "smooth",
    });
    setIsMobileMenuOpen(false); // close menu after clicking
  };

  return (
    <div className="pt-20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 sm:px-10 backdrop-blur-md bg-frame_bg/60 h-16 shadow-md">
        <p
          className="hover:cursor-pointer bg-gradient-to-r from-text_color to-new_color bg-clip-text text-transparent text-2xl sm:text-3xl font-bold"
          onClick={() => {
            setCurrentpage("all_profiles");
            setIsMobileMenuOpen(false);
          }}
        >
          Vectored Matrix
        </p>

        {/* Mobile Menu Toggle */}
        {currentpage !== "all_profiles" && (
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white text-3xl"
            >
              {isMobileMenuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        )}

        {/* Nav Links - Desktop */}
        {currentpage !== "all_profiles" && (
          <div className="hidden sm:flex gap-6 text-white pr-4">
            {["home", "about", "resume", "portfolio", "contact"].map(
              (section) => (
                <p
                  key={section}
                  className="text-md hover:cursor-pointer"
                  onClick={() => scroll_to_section(section)}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </p>
              )
            )}
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && currentpage !== "all_profiles" && (
        <div className="sm:hidden fixed top-16 left-0 w-full bg-frame_bg/90 z-40 py-5 px-6 space-y-4 text-white shadow-md">
          {["home", "about", "resume", "portfolio", "contact"].map(
            (section) => (
              <p
                key={section}
                className="text-lg hover:cursor-pointer"
                onClick={() => scroll_to_section(section)}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </p>
            )
          )}
        </div>
      )}

      {/* Page Content */}
      <div>
        {currentpage === "all_profiles" ? (
          <Allprofiles />
        ) : (
          <Individualprofile username={username} refs={sectionsref} />
        )}
      </div>
    </div>
  );
};

export default Template;
