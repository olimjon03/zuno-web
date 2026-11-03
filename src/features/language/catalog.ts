export const languages = [
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "uz", name: "Uzbek", flag: "🇺🇿" },
  { code: "en", name: "English", flag: "🇬🇧" },
] as const;
export type Language = (typeof languages)[number]["code"];
export const LANGUAGE_STORAGE_KEY = "zuno.language";
export function isLanguage(value: unknown): value is Language {
  return languages.some(language => language.code === value);
}
