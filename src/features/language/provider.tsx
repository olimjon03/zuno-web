"use client";
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useCountry } from "@/features/locations/country-provider";
import { countryLanguages, isLanguage, LANGUAGE_STORAGE_KEY, type Language } from "./catalog";
import { translate, type TranslationValues } from "./translate";
const eventName = "zuno:language";
let current: Language = "en";
let initialized = false;
function read(): Language {
  if (initialized) return current;
  initialized = true;
  try { const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY); if (isLanguage(stored)) current = stored; } catch { /* Keep this tab's selection when storage is unavailable. */ }
  return current;
}
function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === LANGUAGE_STORAGE_KEY || event.key === null) { current = "en"; initialized = false; callback(); } };
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(eventName, callback); window.removeEventListener("storage", onStorage); };
}
const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void }>({ language: "en", setLanguage: () => {} });
export function LanguageProvider({ children, welcome=false }: { children: ReactNode; welcome?:boolean }) {
  const storedLanguage = useSyncExternalStore(subscribe, read, () => "en" as const);
  const country=useCountry();
  const language=countryLanguages(country,welcome).includes(storedLanguage)?storedLanguage:"en";
  const setLanguage = useCallback((value: Language) => {
    if (!isLanguage(value)) return;
    current = value;
    initialized = true;
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, value); } catch { /* Session-only selection still works. */ }
    window.dispatchEvent(new Event(eventName));
  }, []);
  useEffect(() => { document.documentElement.lang = language; return ()=>{if(welcome)document.documentElement.lang=countryLanguages(country).includes(storedLanguage)?storedLanguage:"en";}; }, [language,welcome,country,storedLanguage]);
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}
const englishLocale = { language: "en" as const, setLanguage: () => {} };

export function EnglishLocale({ children }: { children: ReactNode }) {
  return <LanguageContext.Provider value={englishLocale}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }
export function useT() {
  const { language } = useLanguage();
  return useCallback((message: string, values?: TranslationValues) => translate(language, message, values), [language]);
}
/** Only wrap interface copy; user names, listings, messages and file names stay original. */
export function Text({ children, values }: { children: string; values?: TranslationValues }) {
  const t = useT();
  return t(children, values);
}
