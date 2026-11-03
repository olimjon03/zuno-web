"use client";
import { Text, useT } from "@/features/language/provider";

import { countries, regions, resolveLocation, type CountryCode } from "@/features/locations/catalog";
import type { LookupOption } from "../types";
export function optionCountry(option?:LookupOption) { return option ? resolveLocation(option.name,option.regionCode).countryCode : undefined; }
export function ListingLocationFields({id,country,neighborhoodId,options,onCountry,onNeighborhood}:{id:string;country:CountryCode|"";neighborhoodId:string;options:LookupOption[];onCountry:(value:CountryCode|"")=>void;onNeighborhood:(value:string)=>void}) {
 const t = useT();
 const available=options.filter(option=>optionCountry(option)===country);
 return <div className="sell-fields"><div className="sell-field"><label htmlFor={`${id}-country`}><Text>{"Country"}</Text></label><select id={`${id}-country`} value={country} required onChange={event=>{onCountry(event.target.value as CountryCode);onNeighborhood("");}}><option value="" disabled><Text>{"Choose country"}</Text></option>{countries.map(c=><option key={c.code} value={c.code}><Text>{c.name}</Text></option>)}</select></div><div className="sell-field"><label htmlFor={`${id}-location`}><Text>{"Region / neighborhood"}</Text></label><select id={`${id}-location`} name="neighborhoodId" value={neighborhoodId} required onChange={event=>onNeighborhood(event.target.value)}><option value="" disabled><Text>{"Choose your area"}</Text></option>{(country ? regions[country] : []).map(region=>{const items=available.filter(option=>resolveLocation(option.name,option.regionCode).regionCode===region.code);return items.length ? <optgroup key={region.code} label={t(region.name)}>{items.map(option=><option key={option.id} value={option.id}><Text>{option.name}</Text></option>)}</optgroup> : null;})}</select>{country && !available.length && <p role="status"><Text>{"Posting in this country is being prepared."}</Text></p>}</div></div>;
}
