import { IoSchool } from "react-icons/io5";
import { FaBriefcase, FaCode } from "react-icons/fa";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Wheel from "../resumeWheel";

const yearOf = (date) => date.split("-")[0];
const dateRange = (start, end) =>
  `${yearOf(start)} - ${yearOf(end) >= new Date().getFullYear() ? "Till Date" : yearOf(end)}`;

const CertificateThumb = ({ link }) =>
  link ? (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0"
      aria-label="Open certificate"
    >
      <img
        src={link}
        alt="Certificate"
        className="w-14 h-14 rounded-lg object-cover border border-fg/20 hover:scale-105 transition-transform"
      />
    </a>
  ) : null;

// The entry resting in the wheel's middle, shown big on the right-hand board.
const Board = ({ entry }) => (
  <motion.div
    key={entry.key}
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -16 }}
    transition={{ duration: 0.25 }}
    className="flex flex-col gap-4"
  >
    <div className="flex items-start gap-4">
      <div className="shrink-0 w-12 h-12 rounded-full bg-text_color text-body_bg flex items-center justify-center text-xl">
        {entry.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-fg text-2xl sm:text-3xl font-bold break-words">{entry.title}</h3>
        {entry.subtitle && <p className="text-text_color text-lg font-semibold break-words">{entry.subtitle}</p>}
        <p className="text-fg/60 text-sm mt-1.5">{entry.meta}</p>
      </div>
      <CertificateThumb link={entry.certificate} />
    </div>

    {entry.level != null && (
      <div>
        <div className="flex justify-between text-sm text-fg/70 mb-1">
          <span>Proficiency</span>
          <span>{entry.level}%</span>
        </div>
        <div className="relative w-full h-2 bg-fg/15 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-new_color to-text_color"
            initial={{ width: 0 }}
            animate={{ width: `${entry.level}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    )}

    {entry.description && (
      <p className="text-fg/80 text-base leading-relaxed break-words line-clamp-6">{entry.description}</p>
    )}
  </motion.div>
);

const Resume = ({
  trackName,
  about: { resume, school, proficiency, years_of_experience },
}) => {
  const [tab, setTab] = useState("experience");
  const [focus, setFocus] = useState(0);

  const tabs = [
    { key: "experience", label: "Experience", icon: <FaBriefcase /> },
    { key: "education", label: "Education", icon: <IoSchool /> },
    { key: "skills", label: "Skills", icon: <FaCode /> },
  ];

  // Normalise the three kinds of entry into one shape the wheel and board share.
  const entries = useMemo(() => {
    if (tab === "experience") {
      return resume.map((r) => ({
        key: `r${r.id}`,
        label: r.company_name,
        sub: r.post,
        title: r.post,
        subtitle: r.company_name,
        meta: dateRange(r.start_year, r.end_year),
        description: r.description,
        certificate: r.certificate_link,
        icon: <FaBriefcase />,
      }));
    }
    if (tab === "education") {
      return school.map((s) => ({
        key: `s${s.id}`,
        label: s.school_name,
        sub: dateRange(s.start_year, s.end_year),
        title: s.school_name,
        subtitle: "",
        meta: dateRange(s.start_year, s.end_year),
        description: s.description,
        certificate: s.certificate_link,
        icon: <IoSchool />,
      }));
    }
    return proficiency.map((p) => ({
      key: `p${p.id}`,
      label: p.skill_name,
      sub: `${p.skill_range}%`,
      title: p.skill_name,
      subtitle: "",
      meta: "",
      level: p.skill_range,
      description: p.description,
      certificate: p.certificate_link,
      icon: <FaCode />,
    }));
  }, [tab, resume, school, proficiency]);

  const headline =
    tab === "experience" ? (
      <>
        {years_of_experience < 1 ? (
          "Less than a year"
        ) : (
          <>
            More than <span className="text-text_color">{years_of_experience}</span>{" "}
            {years_of_experience === 1 ? "year" : "years"}
          </>
        )}{" "}
        of <span className="text-text_color">{trackName}</span> experience
      </>
    ) : tab === "education" ? (
      <>
        Learning experiences in a few{" "}
        <span className="text-text_color">professional institutions</span>
      </>
    ) : (
      <>
        Good <span className="text-text_color">personal and professional</span> skills
      </>
    );

  const current = entries[Math.min(focus, entries.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-5 bg-frame_bg border border-frame_border rounded-2xl shadow-xl mx-5 sm:mx-10 p-6 sm:p-10"
    >
      <h2 className="text-text_color text-center text-2xl font-semibold">My Resume</h2>
      <p className="text-fg text-xl sm:text-2xl font-bold text-center mt-4">{headline}</p>

      <div className="mt-8 mx-auto max-w-5xl grid gap-5 md:grid-cols-5 md:items-stretch">
        {/* Picker (2/5): what to look at, with the wheel directly beneath */}
        <div className="md:col-span-2 min-w-0 rounded-2xl bg-body_bg border border-frame_border p-5 flex flex-col items-center gap-4">
          <div
            role="tablist"
            className="w-full grid grid-cols-3 gap-1 p-1 rounded-full bg-frame_bg border border-frame_border"
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => {
                  setTab(t.key);
                  setFocus(0);
                }}
                className={`flex items-center justify-center gap-1.5 px-2 py-2 min-h-12 md:min-h-0 rounded-full font-semibold text-xs whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? "bg-text_color text-body_bg"
                    : "text-fg hover:text-text_color"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {entries.length > 0 && (
            <div className="w-full max-w-sm">
              <Wheel key={tab} items={entries} label={`${tab} entries`} onFocusChange={setFocus} />
            </div>
          )}
        </div>

        {/* Board (3/5): the focused entry in full */}
        <div
          role="region"
          aria-live="polite"
          aria-label="Selected entry"
          className="md:col-span-3 min-w-0 rounded-2xl bg-body_bg border border-frame_border p-6 sm:p-8 min-h-64 flex flex-col justify-center"
        >
          {current ? (
            <AnimatePresence mode="wait">
              <Board key={current.key} entry={current} />
            </AnimatePresence>
          ) : (
            <p className="text-fg/60">Nothing added here yet.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Resume;
