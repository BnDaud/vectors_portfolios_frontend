import { portfolio_categories } from "./globalvalues";

// Field definitions for the edit forms. The validation props (required,
// maxLength, url, min/max) mirror the backend rules - see validation.js.
// "required" means the backend rejects a blank value (blank=False).
const URL_RULES = { url: true, maxLength: 200 };

export const PROFILE_FIELDS = [
  { name: "display_pic", label: "Display picture URL", required: true, ...URL_RULES },
  { name: "github", label: "GitHub", ...URL_RULES },
  { name: "linkedin", label: "LinkedIn", ...URL_RULES },
  { name: "whatapp", label: "WhatsApp", ...URL_RULES },
  { name: "facebook", label: "Facebook", ...URL_RULES },
  { name: "twitter", label: "Twitter", ...URL_RULES },
  { name: "email", label: "Email", maxLength: 50 },
  { name: "phone_number", label: "Phone number", maxLength: 50 },
];

export const ABOUT_FIELDS = [
  { name: "skill", label: "Skill / headline", required: true, maxLength: 100 },
  {
    name: "experience_since",
    label: "Experience since (years of experience auto-updates from this every year)",
    type: "date",
  },
  { name: "image_link", label: "About image URL", span: true, ...URL_RULES },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    span: true,
    required: true,
    maxLength: 1000,
  },
];

export const RESUME_FIELDS = [
  { name: "post", label: "Position", type: "text", required: true, maxLength: 100 },
  { name: "company_name", label: "Company", type: "text", required: true, maxLength: 50 },
  { name: "start_year", label: "Start", type: "date", required: true },
  { name: "end_year", label: "End", type: "date", required: true },
  { name: "certificate_link", label: "Certificate link (optional)", type: "text", ...URL_RULES },
];

export const SCHOOL_FIELDS = [
  { name: "school_name", label: "School", type: "text", required: true, maxLength: 50 },
  { name: "start_year", label: "Start", type: "date", required: true },
  { name: "end_year", label: "End", type: "date", required: true },
  { name: "certificate_link", label: "Certificate link (optional)", type: "text", ...URL_RULES },
];

export const PROFICIENCY_FIELDS = [
  { name: "skill_name", label: "Skill", type: "text", required: true, maxLength: 50 },
  { name: "skill_range", label: "Level (0-100)", type: "number", min: 0, max: 100 },
  { name: "certificate_link", label: "Certificate link (optional)", type: "text", ...URL_RULES },
];

export const PORTFOLIO_FIELDS = [
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    options: portfolio_categories,
  },
  { name: "name", label: "Name", type: "text", required: true, maxLength: 50 },
  { name: "thumbnail", label: "Thumbnail URL", type: "text", required: true, ...URL_RULES },
  { name: "project_link", label: "Project link", type: "text", required: true, ...URL_RULES },
];
