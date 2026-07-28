import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const Portfolio = ({ username, portfolio }) => {
  const [display, setDisplay] = useState("All");

  const categories = useMemo(
    () => [...new Set(portfolio.map((p) => p.category))],
    [portfolio]
  );

  const visible =
    display === "All" ? portfolio : portfolio.filter((p) => p.category === display);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-5 bg-frame_bg border border-frame_border rounded-2xl shadow-xl mx-5 sm:mx-10 pb-6"
    >
      <h4 className="text-text_color text-center text-2xl pt-6 font-semibold">
        My Portfolio
      </h4>
      <div className="mt-5">
        <div className="flex flex-wrap gap-2 justify-center px-2">
          <button
            type="button"
            className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
              display === "All"
                ? "bg-text_color text-body_bg"
                : "bg-body_bg text-fg hover:text-text_color"
            }`}
            onClick={() => setDisplay("All")}
          >
            {categories.length === 0 ? "No Portfolio" : "All"}
          </button>
          {categories.map((p) => (
            <button
              key={p}
              type="button"
              className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                display === p
                  ? "bg-text_color text-body_bg"
                  : "bg-body_bg text-fg hover:text-text_color"
              }`}
              onClick={() => setDisplay(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 px-4 justify-center mt-5">
        {visible.map((p, i) => (
          <motion.a
            key={p.id}
            href={p.project_link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group block relative w-72 h-72 overflow-hidden rounded-xl border border-frame_border shadow-lg"
          >
            <div
              className="absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: `url(${p.thumbnail})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute left-4 bottom-4 right-4 text-white">
              <div className="text-xs uppercase tracking-wide text-text_color">
                {p.category}
              </div>
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="text-xs mt-1 underline opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};

export default Portfolio;
