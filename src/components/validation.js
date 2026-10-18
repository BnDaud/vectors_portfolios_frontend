// Client-side mirror of the backend's field rules (portfolio/models.py and
// portfolio/serial.py), so a bad value is flagged while typing instead of
// after a rejected save. The backend stays the authority: if the two ever
// drift, describeFailure() still surfaces the server's own message.

const URL_PROTOCOLS = ["http:", "https:", "ftp:", "ftps:"];

// Django's URLValidator: known scheme, no whitespace, and a real host - a
// domain with an alphabetic TLD of 2+ characters, localhost, or an IP.
const DOMAIN_LABEL = /^[a-z0-9\u00a1-\uffff]([a-z0-9\u00a1-\uffff-]{0,61}[a-z0-9\u00a1-\uffff])?$/i;
const TLD = /^([a-z\u00a1-\uffff]{2,63}|xn--[a-z0-9]{1,59})$/i;
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

const isValidHost = (hostname) => {
  if (hostname === "localhost" || hostname.startsWith("[") || IPV4.test(hostname)) return true;
  const labels = hostname.replace(/\.$/, "").split(".");
  if (labels.length < 2) return false;
  return labels.slice(0, -1).every((label) => DOMAIN_LABEL.test(label)) && TLD.test(labels.at(-1));
};

const isValidUrl = (value) => {
  if (/\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return URL_PROTOCOLS.includes(url.protocol) && isValidHost(url.hostname);
  } catch {
    return false;
  }
};

const isValidDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
};

// Returns an error message, or "" when the value is acceptable. Text is
// trimmed first because DRF trims it before checking blank/max_length.
export const validateField = (field, value) => {
  if (field.type === "number") {
    if (!Number.isInteger(value)) return "Enter a whole number";
    if (field.min !== undefined && value < field.min) return `Must be at least ${field.min}`;
    if (field.max !== undefined && value > field.max) return `Must be at most ${field.max}`;
    return "";
  }

  const text = String(value ?? "").trim();
  if (!text) return field.required ? "Required" : "";

  if (field.type === "select") {
    return field.options.includes(text) ? "" : "Pick one of the listed options";
  }
  if (field.type === "date") {
    return isValidDate(text) ? "" : "Enter a valid date";
  }
  if (field.maxLength && text.length > field.maxLength) {
    return `${text.length - field.maxLength} over the ${field.maxLength} character limit`;
  }
  if (field.url && !isValidUrl(text)) {
    return "Enter a full link starting with https://";
  }
  return "";
};

// {fieldName: message} for every invalid field; empty object means all good.
export const validateAll = (fields, values) =>
  Object.fromEntries(
    fields
      .map((field) => [field.name, validateField(field, values[field.name])])
      .filter(([, message]) => message)
  );

// DRF returns validation errors as {field: ["msg", ...]}; surface them instead
// of a generic "Save failed" so the user can see which field was rejected.
export const describeFailure = async (label, res) => {
  const body = await res.json().catch(() => null);
  if (body && typeof body === "object") {
    const detail = Object.entries(body)
      .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(" ")}`)
      .join("; ");
    return `${label} (${res.status}) - ${detail}`;
  }
  return `${label} (${res.status})`;
};

// Input styling shared by every form field; a red ring marks an invalid value.
export const inputClass = (error) =>
  `bg-body_bg text-fg rounded px-2 py-1 outline-none ${error ? "ring-1 ring-red-500" : ""}`;
