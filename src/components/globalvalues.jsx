export const api_base_url =
  import.meta.env.VITE_API_URL || "https://vectoredmatrix.pythonanywhere.com/api_root";

// Public address of this site, used for canonical URLs, the sitemap and link
// previews. Set VITE_SITE_URL if it moves to a custom domain.
export const site_url = (import.meta.env.VITE_SITE_URL || "https://vectoredmatrix.vercel.app").replace(/\/$/, "");

export const all_profiles_url = `${api_base_url}/profiles/`;

// This site is single-owner: every route resolves to this one profile.
export const owner_username = import.meta.env.VITE_OWNER_USERNAME || "Vector";

// "Continue with Google" (an OAuth client id is public, not a secret). Empty hides the button.
export const google_client_id =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "392357048235-9atth9opmrr253qgn45q12h7et8q4bh2.apps.googleusercontent.com";

// Brand assets - same 4-variant convention (full/icon x light/dark) as the
// VectoredMatrix SaaS project, hosted in that project's Supabase storage.
const BRANDING_BASE = "https://jeuuxtzqlrzaqslthhxx.supabase.co/storage/v1/object/public/branding";
export const logo = {
  fullLight: `${BRANDING_BASE}/logo-full-light.png`,
  fullDark: `${BRANDING_BASE}/logo-full-dark.png`,
  iconLight: `${BRANDING_BASE}/logo-icon-light.png`,
  iconDark: `${BRANDING_BASE}/logo-icon-dark.png`,
};

// Mirrors Portfolio.portfolio_choice in the backend model.
export const portfolio_categories = [
  "WebDev", "DataScience", "AI", "MachineLearning", "ComputerVision", "NLP",
  "Cybersecurity", "UIUX", "ProductManagement", "CloudComputing", "Robotics",
  "IoT", "BigData", "Blockchain", "MobileDev", "QA", "SoftwareEng",
  "DataAnalysis", "DatabaseAdmin", "NetworkEng", "CAD", "Marketing",
  "DigitalMarketing", "SocialMedia", "ContentMarketing", "Sales",
  "PublicRelations", "Advertising", "BrandManagement", "ProductMarketing",
  "AgriMarketing", "HumanResources", "Finance", "Accounting", "Banking",
  "InvestmentBanking", "RealEstate", "Legal", "Education", "Teaching",
  "Research", "Catering", "Hospitality", "EventManagement", "Fashion",
  "Architecture", "InteriorDesign", "Medical", "Pharmacy", "Sports",
  "Entrepreneurship", "Agriculture", "Others",
];
