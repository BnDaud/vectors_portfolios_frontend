import { useEffect, useState, useRef } from "react";
import { HiMenu, HiX } from "react-icons/hi"; // for hamburger icons
import { useNavigate, useParams, Link } from "react-router-dom";
import TrackProfile from "./trackprofile";
import { owner_username } from "./globalvalues";
import { useAuth } from "./authContext";
import ThemeToggle from "./themeToggle";

const SECTIONS = ["home", "about", "resume", "portfolio", "contact"];

const Template = () => {
  const { trackSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, username, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

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

  // Highlights the nav link for whichever section is currently centered in
  // the viewport - refs attach once TrackProfile's data finishes loading,
  // so this polls briefly until they're available rather than assuming
  // they exist on mount.
  useEffect(() => {
    let observer;
    let interval;

    const trySetup = () => {
      const entries = SECTIONS.map((key) => [key, sectionsref[key]]).filter(
        ([, ref]) => ref.current
      );
      if (entries.length === 0) return false;

      observer = new IntersectionObserver(
        (obsEntries) => {
          obsEntries.forEach((e) => {
            if (e.isIntersecting) {
              const match = entries.find(([, ref]) => ref.current === e.target);
              if (match) setActiveSection(match[0]);
            }
          });
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      entries.forEach(([, ref]) => observer.observe(ref.current));
      return true;
    };

    if (!trySetup()) {
      interval = setInterval(() => {
        if (trySetup()) clearInterval(interval);
      }, 300);
    }

    return () => {
      clearInterval(interval);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navLinkClass = (section) =>
    `text-sm px-3 py-1.5 rounded-full transition-colors hover:cursor-pointer ${
      activeSection === section
        ? "bg-text_color text-body_bg font-semibold"
        : "text-fg hover:text-text_color"
    }`;

  return (
    <div className="pt-20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 sm:px-10 backdrop-blur-md bg-frame_bg/70 h-16 border-b border-frame_border">
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
        <div className="hidden sm:flex gap-2 items-center pr-4">
          {SECTIONS.map((section) => (
            <p
              key={section}
              className={navLinkClass(section)}
              onClick={() => scroll_to_section(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </p>
          ))}
          <div className="w-px h-6 bg-frame_border mx-2" />
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
        <div className="sm:hidden fixed top-16 left-0 w-full bg-frame_bg/95 border-b border-frame_border z-40 py-5 px-6 space-y-2 shadow-md">
          {SECTIONS.map((section) => (
            <p
              key={section}
              className={`${navLinkClass(section)} block text-lg`}
              onClick={() => scroll_to_section(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </p>
          ))}
          {isAuthenticated ? (
            <p className="text-lg hover:cursor-pointer text-fg" onClick={logout}>
              Logout ({username})
            </p>
          ) : (
            <Link to="/login" className="block text-lg text-fg">
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
