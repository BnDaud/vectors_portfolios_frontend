import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// SEO build steps: fills the site URL into index.html, and emits robots.txt
// plus a sitemap.xml listing the home page and every portfolio, read from the
// API at build time (a new portfolio shows up in the sitemap on the next
// deploy). If the API can't be reached the sitemap still lists the home page.
const seoPlugin = (env) => {
  const siteUrl = (env.VITE_SITE_URL || "https://vectoredmatrix.vercel.app").replace(/\/$/, "");
  // Same fallback the app itself uses (src/components/globalvalues.jsx).
  const apiUrl = env.VITE_API_URL || "https://vectoredmatrix.pythonanywhere.com/api_root";
  const owner = env.VITE_OWNER_USERNAME || "Vector";

  return {
    name: "seo",

    transformIndexHtml: (html) =>
      html.replaceAll("__SITE_URL__", siteUrl).replaceAll("__API_ORIGIN__", new URL(apiUrl).origin),

    async generateBundle() {
      let slugs = [];
      try {
        // The API may be on a free tier that sleeps - allow it time to wake.
        const res = await fetch(`${apiUrl}/tracks/?username=${encodeURIComponent(owner)}`, {
          signal: AbortSignal.timeout(70000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        slugs = (await res.json()).map((track) => track.slug).filter(Boolean);
      } catch (error) {
        this.warn(`sitemap: could not read portfolios from ${apiUrl} (${error.message}); listing the home page only`);
      }

      const urls = ["/", ...slugs.map((slug) => `/${slug}`)];
      const sitemap =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls
          .map(
            (path, i) =>
              `  <url>\n    <loc>${siteUrl}${path}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${i === 0 ? "1.0" : "0.8"}</priority>\n  </url>`
          )
          .join("\n") +
        `\n</urlset>\n`;

      const robots =
        `User-agent: *\nAllow: /\nDisallow: /login\nDisallow: /addprofile\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
    },
  };
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [react(), tailwindcss(), seoPlugin(env)],
    server: { port: 3000 },
  };
});
