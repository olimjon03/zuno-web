import { isCountryCode, type CountryCode } from "./catalog";
export const COUNTRY_COOKIE = "zuno.country";
export function parseCountryPreference(value?: string): { userId:string; country:CountryCode } | null {
 const [userId,country,...extra]=(value??"").split(".");
 return !extra.length && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId??"") && isCountryCode(country??"") ? {userId,country:country as CountryCode}:null;
}
