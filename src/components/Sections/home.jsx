import { motion } from "framer-motion";

const Home = ({
  username,
  img,
  user: { first_name, last_name },
  about: { skill },
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden flex flex-col sm:flex-row justify-between items-center sm:items-start mx-5 sm:mx-10 h-auto sm:h-96 bg-frame_bg border border-frame_border rounded-2xl shadow-xl mt-5 p-10 pt-20"
    >
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30"
        style={{ background: "var(--color-text_color)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{ background: "var(--color-new_color)" }}
      />

      <div className="relative">
        <p className="text-fg font-bold uppercase text-xl sm:text-3xl">
          I am {last_name} {first_name}
        </p>
        <p className="text-4xl sm:text-6xl text-text_color font-bold capitalize mt-6 sm:mt-12">
          {skill}
        </p>
      </div>

      {/* Image block for tablet+ screens only */}
      <div className="relative hidden w-full sm:w-1/3 md:flex justify-center sm:justify-end mt-6 sm:mt-0 mr-5 sm:mr-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 30 }}
          animate={{ opacity: 1, scale: 1, rotate: 45 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="w-40 h-40 sm:w-48 sm:h-48 overflow-hidden border-2 border-text_color/40 shadow-lg shadow-black"
        >
          <img
            src={img}
            alt={username}
            className="w-full h-full object-cover -rotate-45 scale-150"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
