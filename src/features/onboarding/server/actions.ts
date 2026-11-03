"use server";
import { createClient } from "@/lib/supabase/server";
import { isCountryCode } from "@/features/locations/catalog";
import { writeCountryPreference } from "./preference";
import { revalidatePath } from "next/cache";
export type CountryResult={error?:string;country?:"UZ"|"KR"};
export async function confirmCountry(_state:CountryResult,form:FormData):Promise<CountryResult>{
 const country=form.get("country");
 if(typeof country!=="string"||!isCountryCode(country))return {error:"Choose your country to continue."};
 try{
  const db=await createClient();const {data:{user},error}=await db.auth.getUser();
  if(error||!user)return {error:"Please log in again to choose your country."};
  const result=await db.rpc("set_marketplace_country",{p_country:country,p_neighborhood_id:null});
  if(result.error)return {error:"We couldn’t save your country. Please try again."};
  await writeCountryPreference(user.id,country);
 }catch{return {error:"We couldn’t save your country. Please try again."};}
 revalidatePath("/","layout");return {country};
}
