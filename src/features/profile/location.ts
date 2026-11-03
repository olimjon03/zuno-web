import { resolveLocation, type CountryCode } from "../locations/catalog";
import type { ProfileNeighborhood } from "./types";
export function profileAreaCountry(options: ProfileNeighborhood[], id: string): CountryCode | "" {
  const area = options.find(option => String(option.id) === id);
  return area ? resolveLocation(area.name, area.regionCode).countryCode ?? "" : "";
}
export function profileAreasForCountry(options: ProfileNeighborhood[], country: CountryCode | "") {
  return country ? options.filter(option => resolveLocation(option.name,option.regionCode).countryCode === country) : [];
}
