import { useState } from "react";
import {
  FaFacebookF,
  FaGithub,
  FaGoogle,
  FaLinkedinIn,
  FaPhone,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

const Contact = ({ username, contact }) => {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("FreeLancing");
  const [message, setMessage] = useState("Hello i will like to hire you");
  return (
    <div className="mt-5 bg-frame_bg mx-5 sm:mx-10">
      <h4 className="text-text_color text-2xl pt-3 pl-5 sm:pl-10 font-semibold">
        Contact Me
      </h4>

      <div className="flex flex-col md:flex-row px-5 sm:px-10 py-5 gap-10">
        {/* Left Section */}
        <div className="md:w-1/2">
          <p className="text-2xl sm:text-4xl text-white font-bold mb-6">
            Realize your dream with us
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={contact?.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF className="text-white text-2xl" />
            </a>
            <a
              href={contact?.whatapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="text-white text-2xl" />
            </a>
            <a href={contact?.github} target="_blank" rel="noopener noreferrer">
              <FaGithub className="text-white text-2xl" />
            </a>
            <a href={`mailto:${contact.email}?subject=Hello&body=Hi there!`}>
              <FaGoogle className="text-white text-2xl" />
            </a>
            <a
              href={contact?.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedinIn className="text-white text-2xl" />
            </a>
            <a
              href={contact?.twitter}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className="text-white text-2xl" />
            </a>
            <a
              href={contact.phone_number}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaPhone className="text-white text-2xl rotate-90" />
            </a>
          </div>
        </div>

        {/* Right Section (Form) */}

        <div className="md:w-1/2">
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <input
              className="w-full sm:w-1/2 border-b-2 border-gray-600 py-1 px-2 text-white focus:border-text_color focus:outline-0"
              placeholder="Your Name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full sm:w-1/2 border-b-2 border-gray-600 py-1 px-2 text-white focus:border-text_color focus:outline-0"
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
            className="w-full h-24 border-b-2 border-gray-600 py-1 px-2 text-white focus:border-text_color focus:outline-0"
            placeholder="Message Body"
          ></textarea>
          <a
            href={`mailto:${contact.email}?subject=${subject}&body=My name is ${name} \n ${message}`}
            className="mt-5 block bg-text_color w-28 text-center py-2 rounded-lg cursor-pointer"
          >
            Send Mail
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
