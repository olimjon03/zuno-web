import type { Language } from "./catalog";
import { messages } from "./messages";
export type TranslationValues = Record<string, string | number>;
export function translate(language: Language, message: string, values?: TranslationValues): string {
  const translated = language === "en" ? message : messages[message]?.[language] ?? message;
  return translated.replace(/\{(\w+)\}/g, (match, key: string) => values?.[key] === undefined ? match : String(values[key]));
}
