import { useState, useRef } from "react";
import { HiMenu, HiX } from "react-icons/hi"; // for hamburger icons
import { useNavigate, useParams, Link } from "react-router-dom";
import TrackProfile from "./trackprofile";
import { owner_username } from "./globalvalues";
import { useAuth } from "./authContext";
import ThemeToggle from "./themeToggle";

const Template = () => {
  const { trackSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, username, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          onClick={() => navigate("/")}
        >
          Vectored Matrix
        </p>

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-fg text-3xl"
          >
            {isMobileMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        {/* Nav Links - Desktop */}
        <div className="hidden sm:flex gap-6 items-center text-fg pr-4">
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
          <ThemeToggle />
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="text-fg/70 hover:text-text_color text-sm"
            >
              Logout ({username})
            </button>
          ) : (
            <Link to="/login" className="text-fg/70 hover:text-text_color text-sm">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed top-16 left-0 w-full bg-frame_bg/90 z-40 py-5 px-6 space-y-4 text-fg shadow-md">
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
          {isAuthenticated ? (
            <p className="text-lg hover:cursor-pointer" onClick={logout}>
              Logout ({username})
            </p>
          ) : (
            <Link to="/login" className="block text-lg">
              Login
            </Link>
          )}
        </div>
      )}

      {/* Page Content */}
      <div>
        <TrackProfile
          username={owner_username}
          trackSlug={trackSlug}
          refs={sectionsref}
        />
      </div>
    </div>
  );
};

export default Template;
