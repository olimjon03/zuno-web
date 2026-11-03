"use client";
import { AreaFields } from "@/features/locations/area-fields";
import type { CountryCode } from "@/features/locations/catalog";
import type { ProfileNeighborhood } from "./types";
export function NeighborhoodFields({country,area,options,required,onCountry,onArea,allowCountry=true,countryRef}:{country:CountryCode|"";area:string;options:ProfileNeighborhood[];required:boolean;onCountry:(value:CountryCode|"")=>void;onArea:(value:string)=>void;countryRef?:React.Ref<HTMLSelectElement>;allowCountry?:boolean}){
 return <AreaFields key={country} id="profile" country={country} area={area} options={options} required={required} onCountry={onCountry} onArea={onArea} countryRef={countryRef} allowCountry={allowCountry}/>;
}
