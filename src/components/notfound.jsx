import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSeo, SITE_NAME } from "./seo";

const NotFound404 = () => {
  const navigate = useNavigate();
  // The server answers every path with the app shell, so mark unknown URLs
  // noindex to keep them out of search results.
  useSeo({
    title: `Page not found | ${SITE_NAME}`,
    description: "This page does not exist.",
    path: window.location.pathname,
    noindex: true,
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-frame_bg border border-frame_border rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
      >
        <p className="bg-gradient-to-r from-text_color to-new_color bg-clip-text text-transparent text-7xl font-extrabold">
          404
        </p>
        <p className="text-fg text-lg mt-4">
          That link doesn't lead anywhere. Check the URL and try again.
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="btn-primary mt-8"
        >
          Go Back Home
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound404;
