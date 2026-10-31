import { translate } from "./i18n.js";
export function readWebsite(input) {
  const value = input.trim();
  if (!value) {
    return { error: translate("enterWebsite"), empty: true };
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return { error: translate("fullUrlRequired") };
  }

  if (!["https:", "http:"].includes(parsed.protocol)) {
    return { error: translate("httpOnly") };
  }
  if (/[\s\u0000-\u001f\u007f]/u.test(value) || !/^https?:\/\//i.test(value)) {
    return { error: translate("invalidUrl") };
  }
  if (new TextEncoder().encode(value).length > 2300) {
    return { error: translate("urlTooLong") };
  }

  return { value, hostname: parsed.hostname, filename: parsed.hostname.replace(/[^a-z0-9.-]/gi, "_") };
}
