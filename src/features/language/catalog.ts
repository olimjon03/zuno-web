import type { CountryCode } from "../locations/catalog";
export const languages = [
 {code:"ko",name:"Korean",flag:"🇰🇷"},
 {code:"uz",name:"Uzbek",flag:"🇺🇿"},
 {code:"en",name:"English",flag:"🇬🇧"},
 {code:"ru",name:"Russian",flag:"🇷🇺"},
 {code:"vi",name:"Vietnamese",flag:"🇻🇳"},
] as const;
export type Language=(typeof languages)[number]["code"];
export const LANGUAGE_STORAGE_KEY="zuno.language";
export function isLanguage(value:unknown):value is Language{return languages.some(item=>item.code===value);}
export function countryLanguages(country:CountryCode|"",welcome=false):Language[]{return welcome||!country?["en","uz","ko","ru"]:country==="UZ"?["uz","ru","en"]:["ko","en","uz","vi"];}
