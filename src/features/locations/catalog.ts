export type CountryCode = "UZ" | "KR";
export type Region = { code: string; name: string; kind: "province" | "city" | "republic" };
export const countries: readonly {code: CountryCode; name: string}[] = [
  {code:"UZ",name:"Uzbekistan"}, {code:"KR",name:"Korea"},
];
// Official regional lists and current Korean special-province names:
// https://my.gov.uz/ru/for-foreigners
// https://govinfo.uz/en/hokimiyats
// https://www.studyinkorea.go.kr/eng/life/regionsIntro.do
export const regions: Record<CountryCode, readonly Region[]> = {
  UZ: [
    {code:"UZ-AN",name:"Andijon viloyati",kind:"province"},
    {code:"UZ-BU",name:"Buxoro viloyati",kind:"province"},
    {code:"UZ-FA",name:"Farg‘ona viloyati",kind:"province"},
    {code:"UZ-JI",name:"Jizzax viloyati",kind:"province"},
    {code:"UZ-NG",name:"Namangan viloyati",kind:"province"},
    {code:"UZ-NW",name:"Navoiy viloyati",kind:"province"},
    {code:"UZ-QA",name:"Qashqadaryo viloyati",kind:"province"},
    {code:"UZ-SA",name:"Samarqand viloyati",kind:"province"},
    {code:"UZ-SI",name:"Sirdaryo viloyati",kind:"province"},
    {code:"UZ-SU",name:"Surxondaryo viloyati",kind:"province"},
    {code:"UZ-TO",name:"Toshkent viloyati",kind:"province"},
    {code:"UZ-XO",name:"Xorazm viloyati",kind:"province"},
    {code:"UZ-QR",name:"Qoraqalpog‘iston Respublikasi",kind:"republic"},
    {code:"UZ-TK",name:"Toshkent shahri",kind:"city"},
  ],
  KR: [
    {code:"KR-11",name:"Seoul",kind:"city"},
    {code:"KR-26",name:"Busan",kind:"city"},
    {code:"KR-27",name:"Daegu",kind:"city"},
    {code:"KR-28",name:"Incheon",kind:"city"},
    {code:"KR-29",name:"Gwangju",kind:"city"},
    {code:"KR-30",name:"Daejeon",kind:"city"},
    {code:"KR-31",name:"Ulsan",kind:"city"},
    {code:"KR-50",name:"Sejong",kind:"city"},
    {code:"KR-41",name:"Gyeonggi-do",kind:"province"},
    {code:"KR-42",name:"Gangwon Special Self-Governing Province",kind:"province"},
    {code:"KR-43",name:"Chungcheongbuk-do",kind:"province"},
    {code:"KR-44",name:"Chungcheongnam-do",kind:"province"},
    {code:"KR-45",name:"Jeonbuk Special Self-Governing Province",kind:"province"},
    {code:"KR-46",name:"Jeollanam-do",kind:"province"},
    {code:"KR-47",name:"Gyeongsangbuk-do",kind:"province"},
    {code:"KR-48",name:"Gyeongsangnam-do",kind:"province"},
    {code:"KR-49",name:"Jeju Special Self-Governing Province",kind:"province"},
  ],
};
export type LocationSelection = { country: CountryCode | ""; region: string; district?:string };
export function isCountryCode(value: string): value is CountryCode { return value === "UZ" || value === "KR"; }
export function selectCountry(country: string): LocationSelection {
  return {country:isCountryCode(country) ? country : "",region:""};
}
export function selectRegion(location: LocationSelection, region: string): LocationSelection {
  return {...location,region:location.country && regions[location.country].some(item=>item.code===region) ? region : ""};
}
export function findRegion(code: string) {
  for (const country of countries) {
    const region=regions[country.code].find(item=>item.code===code);
    if (region) return {countryCode:country.code,regionCode:region.code,regionName:region.name};
  }
  return undefined;
}
const legacySeoulAreas = new Set(["Seongsu-dong","Songjeong-dong","Seoul Forest","Ttukseom"]);
export function resolveLocation(neighborhood: string, regionCode?: string | null): {countryCode?: CountryCode; regionCode?: string} {
  if (regionCode) {
    const region=findRegion(regionCode);
    return region ? {countryCode:region.countryCode,regionCode:region.regionCode} : {};
  }
  // Only the four original seeded Seoul areas have a legacy fallback.
  // Unrecognized places are never silently assigned to a country.
  return legacySeoulAreas.has(neighborhood) ? {countryCode:"KR",regionCode:"KR-11"} : {};
}
export function matchesLocation(listing: {neighborhood:string;countryCode?:CountryCode;regionCode?:string}, selection: LocationSelection) {
  if (!selection.country) return selection.region === "";
  if (selection.region && !regions[selection.country].some(item=>item.code===selection.region)) return false;
  if (listing.countryCode && listing.regionCode) {
    const region = findRegion(listing.regionCode);
    if (!region || region.countryCode !== listing.countryCode) return false;
  }
  const resolved = listing.countryCode ? listing : resolveLocation(listing.neighborhood,listing.regionCode);
  return resolved.countryCode === selection.country && (!selection.region || resolved.regionCode === selection.region);
}
export function formatLocationLabel(listing: {neighborhood:string;countryCode?:CountryCode;regionCode?:string}) {
  const location=listing.countryCode ? listing : resolveLocation(listing.neighborhood,listing.regionCode);
  const region=location.regionCode ? findRegion(location.regionCode) : undefined;
  const prefix=region && region.countryCode===location.countryCode ? region.regionName : countries.find(country=>country.code===location.countryCode)?.name;
  return prefix && prefix !== listing.neighborhood ? `${prefix} · ${listing.neighborhood}` : listing.neighborhood;
}

export type MarketplaceItem = {title:string;category:string;neighborhood:string;countryCode?:"UZ"|"KR";regionCode?:string;price:number;status?:string};
export function filterMarketplace<T extends MarketplaceItem>(items:T[],filter:{category:string;location:LocationSelection;query:string;minPrice:string;maxPrice:string;availableOnly:boolean}) {
 const {category,location,query,minPrice,maxPrice,availableOnly}=filter;
 return items.filter(item=>(category==="All items"||item.category===category)&&matchesLocation(item,location)&&`${item.title} ${item.neighborhood} ${item.category}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())&&(!availableOnly||!item.status||item.status==="active")&&(!location.country||((!minPrice||item.price>=Number(minPrice))&&(!maxPrice||item.price<=Number(maxPrice)))));
}
