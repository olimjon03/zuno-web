"use client";
import { Text, useT } from "@/features/language/provider";
import { Icon } from "@/components/ui/icon";
import { countries, regions, type LocationSelection } from "./catalog";
export function LocationSelector({location,onCountryChange,onRegionChange}:{location:LocationSelection;onCountryChange:(country:string)=>void;onRegionChange:(region:string)=>void}) {
  const t = useT();
  const options=location.country ? regions[location.country] : [];
  return <div className="location-control location-cascade">
    <Icon name="pin"/>
    <label className="sr-only" htmlFor="browse-country"><Text>{"Country"}</Text></label>
    <select id="browse-country" value={location.country} onChange={event=>onCountryChange(event.target.value)}>
      <option value=""><Text>{"All nearby"}</Text></option>{countries.map(country=><option key={country.code} value={country.code}><Text>{country.name}</Text></option>)}
    </select>
    {location.country && <>
      <span className="location-divider" aria-hidden="true"/>
      <label className="sr-only" htmlFor="browse-region"><Text>{"Region"}</Text></label>
      <select id="browse-region" value={location.region} onChange={event=>onRegionChange(event.target.value)}>
        <option value=""><Text>{"All regions"}</Text></option>
        {location.country === "UZ" ? <>
          <optgroup label={t("Viloyatlar")}>{options.filter(region=>region.kind==="province").map(region=><option key={region.code} value={region.code}>{t(region.name)}</option>)}</optgroup>
          <optgroup label={t("Alohida hududlar")}>{options.filter(region=>region.kind!=="province").map(region=><option key={region.code} value={region.code}>{t(region.name)}</option>)}</optgroup>
        </> : <>
          <optgroup label={t("Cities")}>{options.filter(region=>region.kind==="city").map(region=><option key={region.code} value={region.code}>{t(region.name)}</option>)}</optgroup>
          <optgroup label={t("Provinces")}>{options.filter(region=>region.kind==="province").map(region=><option key={region.code} value={region.code}>{t(region.name)}</option>)}</optgroup>
        </>}
      </select>
    </>}
  </div>;
}
