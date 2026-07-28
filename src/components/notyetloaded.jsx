import { motion } from "framer-motion";

const Notyetloader = () => {
  return (
    <div className="flex items-center h-96 justify-center">
      <div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, var(--color-text_color), var(--color-new_color), transparent)",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full bg-gradient-to-br from-text_color to-new_color"
          animate={{ scale: [0.85, 1, 0.85], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default Notyetloader;
