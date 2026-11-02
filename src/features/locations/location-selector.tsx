import { Icon } from "@/components/ui/icon";
import { countries, regions, type LocationSelection } from "./catalog";
export function LocationSelector({location,onCountryChange,onRegionChange}:{location:LocationSelection;onCountryChange:(country:string)=>void;onRegionChange:(region:string)=>void}) {
  const options=location.country ? regions[location.country] : [];
  return <div className="location-control location-cascade">
    <Icon name="pin"/>
    <label className="sr-only" htmlFor="browse-country">Country</label>
    <select id="browse-country" value={location.country} onChange={event=>onCountryChange(event.target.value)}>
      <option value="">All nearby</option>{countries.map(country=><option key={country.code} value={country.code}>{country.name}</option>)}
    </select>
    {location.country && <>
      <span className="location-divider" aria-hidden="true"/>
      <label className="sr-only" htmlFor="browse-region">Region</label>
      <select id="browse-region" value={location.region} onChange={event=>onRegionChange(event.target.value)}>
        <option value="">All regions</option>
        {location.country === "UZ" ? <>
          <optgroup label="Viloyatlar">{options.filter(region=>region.kind==="province").map(region=><option key={region.code} value={region.code}>{region.name}</option>)}</optgroup>
          <optgroup label="Alohida hududlar">{options.filter(region=>region.kind!=="province").map(region=><option key={region.code} value={region.code}>{region.name}</option>)}</optgroup>
        </> : <>
          <optgroup label="Cities">{options.filter(region=>region.kind==="city").map(region=><option key={region.code} value={region.code}>{region.name}</option>)}</optgroup>
          <optgroup label="Provinces">{options.filter(region=>region.kind==="province").map(region=><option key={region.code} value={region.code}>{region.name}</option>)}</optgroup>
        </>}
      </select>
    </>}
  </div>;
}
