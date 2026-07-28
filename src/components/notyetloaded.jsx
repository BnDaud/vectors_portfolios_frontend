import { motion } from "framer-motion";

const Notyetloader = () => {
  return (
    <div className="flex items-center h-96 justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-frame_border" />
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-text_color"
            style={{ boxShadow: "0 0 12px 3px var(--color-text_color)" }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Notyetloader;
