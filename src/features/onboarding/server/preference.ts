import "server-only";
import { cookies } from "next/headers";
import { COUNTRY_COOKIE, parseCountryPreference } from "@/features/locations/country-preference";
import type { CountryCode } from "@/features/locations/catalog";
export async function writeCountryPreference(userId:string,country:CountryCode){(await cookies()).set(COUNTRY_COOKIE,`${userId}.${country}`,{path:"/",maxAge:31536000,sameSite:"lax",secure:process.env.NODE_ENV==="production"});}
export async function readCountryPreference(){return parseCountryPreference((await cookies()).get(COUNTRY_COOKIE)?.value);}

export async function clearCountryPreference(){(await cookies()).delete(COUNTRY_COOKIE);}
