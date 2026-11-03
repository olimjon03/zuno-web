"use client";
import { AreaFields } from "@/features/locations/area-fields";
import { resolveLocation, type CountryCode } from "@/features/locations/catalog";
import type { LookupOption } from "../types";
export function optionCountry(option?:LookupOption){return option?resolveLocation(option.name,option.regionCode).countryCode:undefined;}
export function ListingLocationFields({id,country,neighborhoodId,options,onNeighborhood}:{id:string;country:CountryCode|"";neighborhoodId:string;options:LookupOption[];onNeighborhood:(value:string)=>void}){
 return <AreaFields key={country} id={id} country={country} area={neighborhoodId} options={options} onArea={onNeighborhood}/>;
}
