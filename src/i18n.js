import english from "./locales/en.json" with { type: "json" };
import korean from "./locales/ko.json" with { type: "json" };

export function getLocale() {
  const browserLanguage = globalThis.chrome?.i18n?.getUILanguage?.();
  const previewLanguage = !browserLanguage && globalThis.location
    ? new URLSearchParams(location.search).get("lang")
    : null;
  const language = browserLanguage || previewLanguage || globalThis.navigator?.language || "en";
  return /^ko(?:[-_]|$)/i.test(language) ? "ko" : "en";
}

export function translate(key, substitutions = []) {
  const nativeMessage = globalThis.chrome?.i18n?.getMessage(key, substitutions);
  if (nativeMessage) return nativeMessage;
  const catalog = getLocale() === "ko" ? korean : english;
  const entry = catalog[key] ?? english[key];
  if (!entry) throw new Error(`Missing translation: ${key}`);
  const values = Array.isArray(substitutions) ? substitutions : [substitutions];
  return entry.message.replace(/\$([a-z0-9_]+)\$/gi, (placeholder, name) => {
    const content = entry.placeholders?.[name.toLowerCase()]?.content;
    return content?.replace(/\$(\d+)/g, (_, position) => values[Number(position) - 1] ?? "") ?? placeholder;
  });
}

export function localizeDocument() {
  document.documentElement.lang = getLocale();
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = translate(element.dataset.i18n);
  }
  for (const attribute of ["aria-label", "alt"]) {
    for (const element of document.querySelectorAll(`[data-i18n-${attribute}]`)) {
      element.setAttribute(attribute, translate(element.getAttribute(`data-i18n-${attribute}`)));
    }
  }
}
