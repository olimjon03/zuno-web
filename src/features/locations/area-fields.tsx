"use client";
import { useState } from "react";
import { Text, useT, useLanguage } from "@/features/language/provider";
import { countries, regions, resolveLocation, type CountryCode } from "./catalog";
import { findDistrict } from "./districts";
type Area={id:number;name:string;regionCode?:string|null;districtCode?:string|null};
export function AreaFields({id,country,area,options,onCountry,onArea,allowCountry=false,required=true,countryRef}:{id:string;country:CountryCode|"";area:string;options:Area[];onCountry?:(value:CountryCode|"")=>void;onArea:(value:string)=>void;allowCountry?:boolean;required?:boolean;countryRef?:React.Ref<HTMLSelectElement>}){
 const t=useT();const {language}=useLanguage();
 const selected=options.find(item=>String(item.id)===area);
 const [region,setRegion]=useState(selected?resolveLocation(selected.name,selected.regionCode).regionCode??"":"");
 const activeRegion=country&&regions[country].some(item=>item.code===region)?region:"";
 const available=options.filter(item=>(item.districtCode||String(item.id)===area)&&resolveLocation(item.name,item.regionCode).countryCode===country&&resolveLocation(item.name,item.regionCode).regionCode===activeRegion);
 const safeArea=available.some(item=>String(item.id)===area)?area:"";
 return <>
 {allowCountry?<div className="sell-field"><label htmlFor={`${id}-country`}><Text>Country</Text></label><select id={`${id}-country`} ref={countryRef} name="country" required value={country} onChange={e=>{onCountry?.(e.target.value as CountryCode);setRegion("");onArea("");}}><option value=""><Text>Choose country</Text></option>{countries.map(c=><option key={c.code} value={c.code}>{t(c.code==="KR"?"Korea":c.name)}</option>)}</select></div>:<input type="hidden" name="country" value={country}/>}
 <div className="sell-fields"><div className="sell-field"><label htmlFor={`${id}-region`}><Text>Region</Text></label><select id={`${id}-region`} ref={allowCountry?undefined:countryRef} value={activeRegion} required={required} disabled={!country} onChange={e=>{setRegion(e.target.value);onArea("");}}><option value=""><Text>Choose region</Text></option>{(country?regions[country]:[]).map(r=><option key={r.code} value={r.code}>{t(r.name)}</option>)}</select></div>
 <div className="sell-field"><label htmlFor={`${id}-district`}><Text>District / city</Text></label><select id={`${id}-district`} name="neighborhoodId" value={safeArea} required={required} disabled={!activeRegion} onChange={e=>onArea(e.target.value)}><option value=""><Text>Choose your area</Text></option>{available.map(a=>{const district=findDistrict(a.districtCode??"");return <option key={a.id} value={a.id}>{district?(language==="ko"||language==="uz"?district.name:district.english):t(a.name)}</option>;})}</select></div></div>
 {activeRegion&&!available.length&&<p role="status"><Text>Neighborhoods for this country are being prepared.</Text></p>}
 </>;
}
