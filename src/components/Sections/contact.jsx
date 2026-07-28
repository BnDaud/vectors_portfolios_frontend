import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaGithub,
  FaGoogle,
  FaLinkedinIn,
  FaPhone,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

const SOCIAL_ICON_CLASS =
  "w-10 h-10 flex items-center justify-center rounded-full bg-body_bg text-fg text-lg hover:text-text_color hover:scale-110 transition-transform";

const Contact = ({ username, contact }) => {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("FreeLancing");
  const [message, setMessage] = useState("Hello i will like to hire you");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-5 bg-frame_bg border border-frame_border rounded-2xl shadow-xl mx-5 sm:mx-10"
    >
      <h4 className="text-text_color text-2xl pt-6 pl-5 sm:pl-10 font-semibold">
        Contact Me
      </h4>

      <div className="flex flex-col md:flex-row px-5 sm:px-10 py-5 gap-10">
        {/* Left Section */}
        <div className="md:w-1/2">
          <p className="text-2xl sm:text-4xl text-fg font-bold mb-6">
            Realize your dream with us
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={contact?.facebook} target="_blank" rel="noopener noreferrer" className={SOCIAL_ICON_CLASS}>
              <FaFacebookF />
            </a>
            <a href={contact?.whatapp} target="_blank" rel="noopener noreferrer" className={SOCIAL_ICON_CLASS}>
              <FaWhatsapp />
            </a>
            <a href={contact?.github} target="_blank" rel="noopener noreferrer" className={SOCIAL_ICON_CLASS}>
              <FaGithub />
            </a>
            <a href={`mailto:${contact.email}?subject=Hello&body=Hi there!`} className={SOCIAL_ICON_CLASS}>
              <FaGoogle />
            </a>
            <a href={contact?.linkedin} target="_blank" rel="noopener noreferrer" className={SOCIAL_ICON_CLASS}>
              <FaLinkedinIn />
            </a>
            <a href={contact?.twitter} target="_blank" rel="noopener noreferrer" className={SOCIAL_ICON_CLASS}>
              <FaTwitter />
            </a>
            <a href={contact.phone_number} target="_blank" rel="noopener noreferrer" className={SOCIAL_ICON_CLASS}>
              <FaPhone className="rotate-90" />
            </a>
          </div>
        </div>

        {/* Right Section (Form) */}

        <div className="md:w-1/2">
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <input
              className="w-full sm:w-1/2 bg-body_bg rounded-lg py-2 px-3 text-fg outline-none focus:ring-1 focus:ring-text_color"
              placeholder="Your Name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full sm:w-1/2 bg-body_bg rounded-lg py-2 px-3 text-fg outline-none focus:ring-1 focus:ring-text_color"
              placeholder="Subject"
              value={subject}
              required
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <textarea
            value={message}
            required
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-24 bg-body_bg rounded-lg py-2 px-3 text-fg outline-none focus:ring-1 focus:ring-text_color"
            placeholder="Message Body"
          ></textarea>
          <a
            href={`mailto:${contact.email}?subject=${subject}&body=My name is ${name} \n ${message}`}
            className="btn-primary mt-5 inline-block text-center"
          >
            Send Mail
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
