export const api_base_url =
  import.meta.env.VITE_API_URL || "https://vectoredmatrix.pythonanywhere.com/api_root";

export const all_profiles_url = `${api_base_url}/profiles/`;

// This site is single-owner: every route resolves to this one profile.
export const owner_username = import.meta.env.VITE_OWNER_USERNAME || "Vector";

// Mirrors Portfolio.portfolio_choice in the backend model.
export const portfolio_categories = [
  "WebDev", "DataScience", "AI", "MachineLearning", "ComputerVision", "NLP",
  "Cybersecurity", "UIUX", "ProductManagement", "CloudComputing", "Robotics",
  "IoT", "BigData", "Blockchain", "MobileDev", "QA", "SoftwareEng",
  "DataAnalysis", "DatabaseAdmin", "NetworkEng", "Marketing",
  "DigitalMarketing", "SocialMedia", "ContentMarketing", "Sales",
  "PublicRelations", "Advertising", "BrandManagement", "ProductMarketing",
  "AgriMarketing", "HumanResources", "Finance", "Accounting", "Banking",
  "InvestmentBanking", "RealEstate", "Legal", "Education", "Teaching",
  "Research", "Catering", "Hospitality", "EventManagement", "Fashion",
  "Architecture", "InteriorDesign", "Medical", "Pharmacy", "Sports",
  "Entrepreneurship", "Agriculture", "Others",
];
