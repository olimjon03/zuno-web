"use client";
import Link from "next/link";
import { useLanguage, useT } from "@/features/language/provider";
import { Icon } from "@/components/ui/icon";
import { regions, type LocationSelection } from "./catalog";
import { districts } from "./districts";
export function LocationSelector({location,onRegionChange,onDistrictChange}:{location:LocationSelection;onRegionChange:(region:string)=>void;onDistrictChange:(district:string)=>void}) {
 const t=useT();const {language}=useLanguage();
 return <div className="location-control location-cascade"><Icon name="pin"/>
 {location.country?<>
 <label className="sr-only" htmlFor="browse-region">{t("Region")}</label><select id="browse-region" value={location.region} onChange={e=>onRegionChange(e.target.value)}><option value="">{t("All nearby")}</option>{regions[location.country].map(r=><option key={r.code} value={r.code}>{t(r.name)}</option>)}</select>
 {location.region&&<><span className="location-divider" aria-hidden="true"/><label className="sr-only" htmlFor="browse-district">{t("District / city")}</label><select id="browse-district" value={location.district??""} onChange={e=>onDistrictChange(e.target.value)}><option value="">{t("All districts")}</option>{districts.filter(d=>d.regionCode===location.region).map(d=><option key={d.code} value={d.code}>{language==="ko"||language==="uz"?d.name:d.english}</option>)}</select></>}
 </>:<Link href="/welcome">{t("Choose your country")}</Link>}
 </div>;
}
