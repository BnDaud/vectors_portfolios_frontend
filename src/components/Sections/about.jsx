import { motion } from "framer-motion";

const About = ({ username, about: { skill, description, image_link } }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex justify-between mx-5 sm:mx-10 mt-5 min-h-96 bg-frame_bg border border-frame_border rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-10 md:w-1/2 w-full">
        <p className="capitalize text-center md:text-left text-text_color text-2xl font-semibold">
          about Me
        </p>
        <p className="text-fg text-5xl font-bold mt-10 text-center md:text-left">
          I am a <span className="capitalize">{skill}</span>
        </p>
        <p className="mt-8 text-fg/80 text-center md:text-left leading-relaxed">
          {description}
        </p>
      </div>
      <div className="hidden md:flex items-stretch">
        <img
          src={image_link}
          alt={username}
          className="w-96 h-full object-cover"
        />
      </div>
    </motion.div>
  );
};

export default About;
