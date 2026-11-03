"use client";
import { useId } from "react";
import { languages, isLanguage } from "./catalog";
import { useLanguage, useT } from "./provider";
import "./language-selector.css";
export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const t = useT();
  const id = useId();
  return <div className="zuno-language-selector">
    <label className="sr-only" htmlFor={id}>{t("Language")}</label>
    <span className="zuno-language-flag" aria-hidden="true">{languages.find(item => item.code === language)?.flag}</span>
    <select id={id} value={language} onChange={event => { if (isLanguage(event.target.value)) setLanguage(event.target.value); }} aria-label={t("Language")}>
      {languages.map(item => <option key={item.code} value={item.code} lang={item.code}>{item.flag} {item.name}</option>)}
    </select>
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    <span className="sr-only" role="status" aria-live="polite">{t("Language selected: {language}", { language: languages.find(item => item.code === language)!.name })}</span>
  </div>;
}
