import { api_base_url } from "./globalvalues";

// Where the read-only copy of a portfolio's resume lives (opened in a new tab).
export const resumeViewPath = (slug) => `/resume/${slug}`;

export const resumePageUrl = (slug, page, version, template) => {
  const query = [template && `template=${template}`, version && `v=${version}`].filter(Boolean).join("&");
  return `${api_base_url}/resume-export/${slug}/pages/${page}.png${query ? `?${query}` : ""}`;
};

// How many pages a design has for this portfolio: {pages, version, template, ...}.
export const fetchResumePages = async (slug, template) => {
  const res = await fetch(`${api_base_url}/resume-export/${slug}/pages?template=${encodeURIComponent(template)}`);
  if (!res.ok) throw new Error(res.status === 429 ? "Too many previews just now - try again in a few minutes." : `Could not load the preview (${res.status}).`);
  return res.json();
};

// A small picture of a design's first page, for the owner's design picker.
export const resumeThumbUrl = (slug, template) =>
  `${api_base_url}/resume-export/${slug}/pages/1.png?template=${template}&thumb=1`;

// The designs on offer: [{key, group: "ats" | "graphic", label, blurb, formats, default}].
export const fetchResumeTemplates = async () => {
  const res = await fetch(`${api_base_url}/resume-export/templates`);
  if (!res.ok) throw new Error(`Could not load the designs (${res.status}).`);
  return res.json();
};

// Owner only: fetches the resume file with the sign-in cookie and saves it,
// under the name the server chose (e.g. Sulaimon_Lawal_Full_Stack_Resume_Bold.pdf).
export const downloadResume = async (authFetch, slug, kind, template) => {
  const query = template ? `?template=${encodeURIComponent(template)}` : "";
  const res = await authFetch(`${api_base_url}/resume-export/${slug}/download/${kind}${query}`);
  if (!res.ok) {
    throw new Error(res.status === 401 || res.status === 403 ? "Sign in again to download the resume." : `Download failed (${res.status}).`);
  }
  const blob = await res.blob();
  const name = /filename="?([^";]+)"?/.exec(res.headers.get("Content-Disposition") || "")?.[1] || `resume.${kind}`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return name;
};
