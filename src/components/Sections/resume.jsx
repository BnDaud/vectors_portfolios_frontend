import { IoSchool } from "react-icons/io5";
import { GiSkills } from "react-icons/gi";
import { FaBriefcase } from "react-icons/fa";
import { Fragment, useState } from "react";
import { motion } from "framer-motion";

const Resume = ({
  username,
  about: { resume, school, proficiency, years_of_experience },
}) => {
  const [showexperience, setShowexperience] = useState(true);
  const [showeducation, setShoweducation] = useState(false);
  const [showskill, setShowskills] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-5 bg-frame_bg border border-frame_border rounded-2xl shadow-xl mx-5 sm:mx-10 pb-6"
    >
      <h4 className="text-text_color text-center text-2xl pt-6 font-semibold">
        My Resume
      </h4>
      {/*  show experience */}
      <div className="md:flex block gap-4 px-10  w-full mt-5">
        <div className={`w-1/2 mb-5 ${showexperience ? "block" : "hidden"}`}>
          <p className=" text-text_color text-xl uppercase leading-5 ">
            Experience
          </p>
          <p className="mt-5 sm:text-5xl text-2xl font-bold lowercase text-fg ">
            <span className="uppercase">m</span>ore Than {years_of_experience}{" "}
            years experience as a
          </p>
          <p className="text-text_color capitalize text-5xl  font-bold leading-16">
            {" fullstack"}
          </p>
        </div>

        <ul
          className={`${
            showexperience ? "block" : "hidden"
          }  list-none  min-h-40 mb-5  border-l-2 border-l-fg`}
        >
          {resume.map((r) => {
            return (
              <li key={r.id} className="flex gap-2 mb-2 items-baseline">
                <div className="w-4 h-4 rounded-full bg-fg -ml-2"></div>
                <div className="flex items-center gap-2">
                  <div>
                    {" "}
                    <div className="text-fg font-semibold capitalize text-xl">
                      {r.company_name}
                    </div>{" "}
                    <div className="text-fg font-light">
                      {" "}
                      {`${r.post} (${r.start_year.split("-")[0]} - ${
                        r.end_year.split("-")[0] >= new Date().getFullYear()
                          ? "Till Date"
                          : r.end_year.split("-")[0]
                      })`}
                    </div>
                  </div>
                  <CertificateThumb link={r.certificate_link} />
                </div>
              </li>
            );
          })}
        </ul>
        {/* show Education*/}

        <div className={`w-1/2 mb-5 ${showeducation ? "block" : "hidden"}`}>
          <p className=" text-text_color text-xl uppercase leading-5 ">
            Education
          </p>
          <p className="mt-5 sm:text-5xl text-2xl font-bold lowercase text-fg ">
            <span className="uppercase">l</span>earning experiences in a few
            <span className="text-text_color capitalize text-5xl  font-bold leading-16">
              {" professional institution"}
            </span>
          </p>
        </div>

        <ul
          className={`${
            showeducation ? "block" : "hidden"
          }  list-none  min-h-40 mb-5  border-l-2 border-l-fg`}
        >
          {school.map((s) => {
            return (
              <li key={s.id} className="flex gap-2 mb-2 items-baseline">
                <div className="w-4 h-4 rounded-full bg-fg -ml-2"></div>
                <div className="flex items-center gap-2">
                  <div>
                    {" "}
                    <div className="text-fg font-semibold capitalize text-xl">
                      {s.school_name}
                    </div>{" "}
                    <div className="text-fg font-light">
                      {" "}
                      {` (${s.start_year.split("-")[0]} - ${
                        s.end_year.split("-")[0] >= new Date().getFullYear()
                          ? "Till Date"
                          : s.end_year.split("-")[0]
                      })`}
                    </div>
                  </div>
                  <CertificateThumb link={s.certificate_link} />
                </div>
              </li>
            );
          })}
        </ul>

        {/* show skills*/}

        <div className={`w-1/2 mb-5 ${showskill ? "block" : "hidden"}`}>
          <p className=" text-text_color text-xl uppercase leading-5 ">
            Skills
          </p>
          <p className="mt-5 sm:text-5xl text-2xl font-bold lowercase text-text_color ">
            <span className="text-fg capitalize">W</span>
            <span className="text-fg ">ith good </span> Personnal
          </p>
          <p className="mt-5 sm:text-5xl text-2xl font-bold  text-text_color">
            and Professional{" "}
          </p>
          <p className="mt-5 sm:text-5xl text-2xl font-bold  text-text_color">
            Skills
          </p>
        </div>
        <div
          className={`flex gap-4 items-baseline ${
            showskill ? "block" : "hidden"
          }`}
        >
          <div className="bg-fg h-4 w-4 rounded-full"> </div>
          <div className="text-fg capitalize text-xl font-bold w-full">
            {" "}
            Professional Skill
            {proficiency.map((p) => {
              return (
                <Fragment key={p.id}>
                  <div className="flex items-center gap-2">
                    <p className="text-fg font-light text-sm">
                      {" "}
                      {p.skill_name}
                    </p>
                    <CertificateThumb link={p.certificate_link} />
                  </div>
                  <div className="relative w-full md:w-72 lg:w-96 h-2 my-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-new_color to-text_color"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.skill_range}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-5">
        <button
          type="button"
          aria-label="Show experience"
          className={`p-3 rounded-full transition-colors ${
            showexperience
              ? "bg-text_color text-body_bg"
              : "bg-body_bg text-fg hover:text-text_color"
          }`}
          onClick={() => {
            setShowexperience(true);
            setShoweducation(false);
            setShowskills(false);
          }}
        >
          <FaBriefcase className="text-xl" />
        </button>
        <button
          type="button"
          aria-label="Show education"
          className={`p-3 rounded-full transition-colors ${
            showeducation
              ? "bg-text_color text-body_bg"
              : "bg-body_bg text-fg hover:text-text_color"
          }`}
          onClick={() => {
            setShowexperience(false);
            setShoweducation(true);
            setShowskills(false);
          }}
        >
          <IoSchool className="text-xl" />
        </button>
        <button
          type="button"
          aria-label="Show skills"
          className={`p-3 rounded-full transition-colors ${
            showskill
              ? "bg-text_color text-body_bg"
              : "bg-body_bg text-fg hover:text-text_color"
          }`}
          onClick={() => {
            setShowexperience(false);
            setShoweducation(false);
            setShowskills(true);
          }}
        >
          <GiSkills className="text-xl" />
        </button>
      </div>
    </motion.div>
  );
};

export default Resume;
