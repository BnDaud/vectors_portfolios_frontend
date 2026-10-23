import { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi"; // for hamburger icons
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { useParams, Link } from "react-router-dom";
import TrackProfile from "./trackprofile";
import { usePageOwner } from "./pageOwner";
import { useAuth } from "./authContext";
import ThemeToggle from "./themeToggle";
import Logo from "./logo";
import { ResumeButton, ResumeMenuItems } from "./resumeActions";

const SECTIONS = ["home", "about", "resume", "portfolio", "contact"];
const NAV_HEIGHT = 64; // the fixed bar
const label = (section) => section.charAt(0).toUpperCase() + section.slice(1);

const Template = () => {
  const { trackSlug } = useParams();
  const { isAuthenticated, username, logout } = useAuth();
  const owner = usePageOwner();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // One stable ref per section, handed to TrackProfile to attach to each
  // section's wrapper. (Creating these inside the render, as before, made a new
  // set every time.)
  const sectionsref = useMemo(() => Object.fromEntries(SECTIONS.map((key) => [key, createRef()])), []);
  // While a nav click is scrolling the page, the highlight stays on the clicked
  // section instead of flickering through the ones it passes.
  const lock = useRef({ section: null, timer: 0 });

  // Which section the reader is in, from where the sections sit right now.
  // Reading the live elements each time (rather than watching elements captured
  // once) keeps it right after sections are swapped, e.g. by Edit / Done
  // Editing, and the top and bottom of the page are handled explicitly: Home
  // at the very top, Contact at the very bottom (it is too short to ever reach
  // the middle of the screen).
  const sectionInView = useCallback(() => {
    const present = SECTIONS.filter((key) => sectionsref[key].current);
    if (!present.length) return null;
    if (window.scrollY < 8) return present[0];
    const doc = document.documentElement;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) return present[present.length - 1];
    const probe = NAV_HEIGHT + (window.innerHeight - NAV_HEIGHT) * 0.3; // a line 30% down the visible page
    let current = present[0];
    present.forEach((key) => {
      if (sectionsref[key].current.getBoundingClientRect().top <= probe) current = key;
    });
    return current;
  }, [sectionsref]);

  useEffect(() => {
    const state = lock.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = state.section ? null : sectionInView();
      if (next) setActiveSection(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onScroll = () => {
      if (state.section) {
        // still moving from a nav click: let go once the scrolling has stopped
        clearTimeout(state.timer);
        state.timer = setTimeout(() => {
          state.section = null;
          schedule();
        }, 140);
        return;
      }
      schedule();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    // The sections appear once the data has loaded and change height when
    // editing starts or stops - re-check whenever the page's height changes.
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(state.timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
    };
  }, [sectionInView]);

  const scroll_to_section = (section) => {
    setIsMobileMenuOpen(false); // close menu after clicking
    const el = sectionsref[section]?.current;
    if (!el) return;
    setActiveSection(section);
    lock.current.section = section;
    clearTimeout(lock.current.timer);
    // if the page is already there nothing scrolls, so don't stay locked
    lock.current.timer = setTimeout(() => {
      lock.current.section = null;
    }, 600);
    el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinkClass = (section) =>
    `text-sm px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
      activeSection === section
        ? "bg-text_color text-body_bg font-semibold"
        : "text-fg hover:text-text_color"
    }`;

  const navLink = (section, extraClass = "") => (
    <button
      key={section}
      type="button"
      className={`${navLinkClass(section)} ${extraClass}`}
      aria-current={activeSection === section ? "true" : undefined}
      onClick={() => scroll_to_section(section)}
    >
      {label(section)}
    </button>
  );

  return (
    <div className="pt-20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 sm:px-10 backdrop-blur-md bg-frame_bg/70 h-16 border-b border-frame_border">
        <Logo />

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden flex items-center gap-4">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="text-fg text-3xl"
          >
            {isMobileMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        {/* Nav Links - Desktop */}
        <div className="hidden sm:flex gap-3 items-center pr-4">
          {SECTIONS.map((section) => navLink(section))}
          <div className="w-px h-6 bg-frame_border mx-2" />
          <ResumeButton slug={trackSlug} variant="nav" />
          <ThemeToggle />
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed top-16 left-0 w-full bg-frame_bg/95 border-b border-frame_border z-40 py-5 px-6 space-y-2 shadow-md">
          {SECTIONS.map((section) => navLink(section, "block w-full text-left text-lg"))}
          <div className="pt-2 border-t border-frame_border">
            <p className="text-fg/60 text-xs mb-1">Resume for this portfolio</p>
            <ResumeMenuItems slug={trackSlug} onDone={() => setIsMobileMenuOpen(false)} />
          </div>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 text-lg text-fg hover:text-red-400"
            >
              <FiLogOut />
              {username}
            </button>
          ) : (
            <Link to="/login" className="btn-primary flex items-center gap-2 w-fit text-lg">
              <FiLogIn />
              Login
            </Link>
          )}
        </div>
      )}

      {/* Page Content */}
      <div>
        <TrackProfile
          username={owner.username}
          trackSlug={trackSlug}
          refs={sectionsref}
        />
      </div>
    </div>
  );
};

export default Template;
