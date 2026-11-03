"use client";
import { countries, regions, resolveLocation, type CountryCode } from "@/features/locations/catalog";
import { profileAreasForCountry } from "./location";
import type { ProfileNeighborhood } from "./types";
export function NeighborhoodFields({country,area,options,required,onCountry,onArea,countryRef}: {
  country: CountryCode | ""; area: string; options: ProfileNeighborhood[]; required: boolean;
  onCountry: (value: CountryCode | "") => void; onArea: (value: string) => void;
  countryRef?: React.Ref<HTMLSelectElement>;
}) {
  const available = profileAreasForCountry(options,country);
  return <>
    <div className="sell-field"><label htmlFor="profile-country">Country</label>
      <select id="profile-country" name="country" ref={countryRef} value={country} required={required} onChange={event => {onCountry(event.target.value as CountryCode | "");onArea("");}}>
        <option value="">Choose country</option>{countries.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
      </select>
    </div>
    <div className="sell-field"><label htmlFor="profile-neighborhood">Region / neighborhood</label>
      <select id="profile-neighborhood" name="neighborhoodId" value={area} required={required} disabled={!country} onChange={event => onArea(event.target.value)} aria-describedby="profile-area-help">
        <option value="">{country ? required ? "Choose your area" : "Not selected" : "Choose country first"}</option>
        {(country ? regions[country] : []).map(region => {
          const items = available.filter(option => resolveLocation(option.name,option.regionCode).regionCode === region.code);
          return items.length ? <optgroup key={region.code} label={region.name}>{items.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</optgroup> : null;
        })}
      </select>
      <p id="profile-area-help" className="auth-hint">Choose your country, then your area. Share your neighborhood, not your exact address.</p>
      {country && !available.length && <p role="status">Neighborhoods for this country are being prepared.</p>}
    </div>
  </>;
}
