export const api_base_url =
  import.meta.env.VITE_API_URL || "https://vectoredmatrix.pythonanywhere.com/api_root";

export const all_profiles_url = `${api_base_url}/profiles/`;

// This site is single-owner: every route resolves to this one profile.
export const owner_username = import.meta.env.VITE_OWNER_USERNAME || "Vector";
