import { useEffect } from "react";
import { site_url } from "./globalvalues";

export const SITE_NAME = "VectoredMatrix";

const upsert = (tag, attr, key, content) => {
  let el = document.head.querySelector(`${tag}[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute(tag === "link" ? "href" : "content", content);
};

// Trims to a search-snippet length at a word boundary.
export const clip = (text, max = 155) => {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-–]+$/, "")}…`;
};

export const personSchema = ({ name, url, jobTitle, description, image, sameAs, knowsAbout }) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name,
  url,
  ...(jobTitle && { jobTitle }),
  ...(description && { description }),
  ...(image && { image }),
  ...(sameAs?.length && { sameAs }),
  ...(knowsAbout?.length && { knowsAbout }),
});

// The page is a single-page app, so the static tags in index.html only describe
// the home page. This updates those same tags per route (no duplicates) so
// crawlers that run JavaScript - Google, Bing - see each portfolio's own
// title, description, canonical URL and structured data.
export const useSeo = ({ enabled = true, title, description, path = "/", noindex = false, jsonLd }) => {
  const ld = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    if (!enabled) return;
    const url = `${site_url}${path}`;
    document.title = title;
    upsert("meta", "name", "description", description);
    upsert("meta", "name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    upsert("link", "rel", "canonical", url);
    upsert("meta", "property", "og:title", title);
    upsert("meta", "property", "og:description", description);
    upsert("meta", "property", "og:url", url);
    upsert("meta", "name", "twitter:title", title);
    upsert("meta", "name", "twitter:description", description);

    let script = document.getElementById("seo-jsonld");
    if (ld) {
      if (!script) {
        script = document.createElement("script");
        script.id = "seo-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = ld;
    } else if (script) {
      script.remove();
    }
  }, [enabled, title, description, path, noindex, ld]);
};
