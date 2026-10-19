import { api_base_url } from "./globalvalues";

// Where the read-only copy of a portfolio's resume lives (opened in a new tab).
export const resumeViewPath = (slug) => `/resume/${slug}`;

export const resumePageUrl = (slug, page, version) =>
  `${api_base_url}/resume-export/${slug}/pages/${page}.png${version ? `?v=${version}` : ""}`;

// Owner only: fetches the resume file with the sign-in cookie and saves it,
// under the name the server chose (e.g. Sulaimon_Lawal_Full_Stack_Resume.pdf).
export const downloadResume = async (authFetch, slug, kind) => {
  const res = await authFetch(`${api_base_url}/resume-export/${slug}/download/${kind}`);
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
