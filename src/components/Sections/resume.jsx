import { IoSchool } from "react-icons/io5";
import { FaBriefcase, FaCode } from "react-icons/fa";
import { useState } from "react";
import { motion } from "framer-motion";

const CertificateThumb = ({ link }) =>
  link ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className="shrink-0">
      <img
        src={link}
        alt="Certificate"
        className="w-10 h-10 rounded object-cover border border-fg/20 hover:scale-110 transition-transform"
      />
    </a>
  ) : null;

const yearOf = (date) => date.split("-")[0];
const dateRange = (start, end) =>
  `${yearOf(start)} - ${yearOf(end) >= new Date().getFullYear() ? "Till Date" : yearOf(end)}`;

const EntryCard = ({ icon, title, subtitle, meta, certificate }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
    className="flex items-start gap-4 bg-body_bg rounded-xl p-4"
  >
    <div className="shrink-0 w-10 h-10 rounded-full bg-text_color text-body_bg flex items-center justify-center">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-fg font-semibold text-lg">{title}</div>
      <div className="text-fg/70 text-sm">{subtitle}</div>
      <div className="text-text_color text-xs mt-1">{meta}</div>
    </div>
    <CertificateThumb link={certificate} />
  </motion.div>
);

const Resume = ({
  username,
  about: { resume, school, proficiency, years_of_experience },
}) => {
  const [tab, setTab] = useState("experience");

  const tabs = [
    { key: "experience", label: "Experience", icon: <FaBriefcase /> },
    { key: "education", label: "Education", icon: <IoSchool /> },
    { key: "skills", label: "Skills", icon: <FaCode /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-5 bg-frame_bg border border-frame_border rounded-2xl shadow-xl mx-5 sm:mx-10 p-6 sm:p-10"
    >
      <h4 className="text-text_color text-center text-2xl font-semibold">
        My Resume
      </h4>

      <div className="flex justify-center gap-3 mt-6 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              tab === t.key
                ? "bg-text_color text-body_bg"
                : "bg-body_bg text-fg hover:text-text_color"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "experience" && (
        <div>
          <p className="text-fg text-xl sm:text-2xl font-bold text-center mb-6">
            More than <span className="text-text_color">{years_of_experience}</span> years
            experience as a <span className="text-text_color">Fullstack</span> developer
          </p>
          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            {resume.map((r) => (
              <EntryCard
                key={r.id}
                icon={<FaBriefcase />}
                title={r.company_name}
                subtitle={r.post}
                meta={dateRange(r.start_year, r.end_year)}
                certificate={r.certificate_link}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "education" && (
        <div>
          <p className="text-fg text-xl sm:text-2xl font-bold text-center mb-6">
            Learning experiences in a few{" "}
            <span className="text-text_color">professional institutions</span>
          </p>
          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            {school.map((s) => (
              <EntryCard
                key={s.id}
                icon={<IoSchool />}
                title={s.school_name}
                subtitle=""
                meta={dateRange(s.start_year, s.end_year)}
                certificate={s.certificate_link}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "skills" && (
        <div>
          <p className="text-fg text-xl sm:text-2xl font-bold text-center mb-6">
            Good <span className="text-text_color">personal and professional</span> skills
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {proficiency.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-body_bg rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FaCode className="text-text_color" />
                  <span className="text-fg font-semibold flex-1">{p.skill_name}</span>
                  <span className="text-fg/60 text-sm">{p.skill_range}%</span>
                  <CertificateThumb link={p.certificate_link} />
                </div>
                <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-new_color to-text_color"
                    initial={{ width: 0 }}
                    animate={{ width: `${p.skill_range}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Resume;
