"use client";
import Image from "next/image";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/ui/brand";
import { Icon } from "@/components/ui/icon";
import { LanguageSelector } from "@/features/language/language-selector";
import { LanguageProvider, Text } from "@/features/language/provider";
import { notifyCountryChange } from "@/features/locations/country-provider";
import { confirmCountry, type CountryResult } from "./server/actions";
import { CountryLandmark } from "./country-landmark";
import type { CountryCode } from "@/features/locations/catalog";
import "./welcome.css";
function WelcomeFormContent({initialCountry}:{initialCountry:CountryCode|""}) {
 const [country,setCountry]=useState<CountryCode|"">(initialCountry);
 const router=useRouter();
 const [state,action,pending]=useActionState(async(previous:CountryResult,form:FormData)=>{
  form.set("country",country);
  const result=await confirmCountry(previous,form);
  if(result.country){notifyCountryChange();router.replace(`/?country=${result.country}`);router.refresh();}
  return result;
 },{});
 return <div className="welcome-page"><header className="welcome-header"><div className="welcome-brand" aria-label="ZUNO"><Brand/></div><LanguageSelector welcome/></header>
 <main className="welcome-main"><Image className="welcome-illustration" src="/images/welcome-neighborhood.webp" alt="" width={550} height={184} priority/>
 <h1><Text>Welcome to ZUNO</Text></h1><p className="welcome-subtitle"><Text>Choose your country to find great things nearby.</Text></p>
 <form action={action} aria-busy={pending} onReset={event=>event.preventDefault()}><fieldset className="welcome-countries" disabled={pending}><legend className="sr-only"><Text>Choose your country</Text></legend>{(["UZ","KR"] as const).map(code=><label key={code} className={`welcome-country ${country===code?"is-selected":""}`}><input type="radio" name="country" value={code} checked={country===code} onChange={()=>setCountry(code)} required/><span className="welcome-country-name"><span aria-hidden="true">{code==="UZ"?"🇺🇿":"🇰🇷"}</span><Text>{code==="UZ"?"Uzbekistan":"Korea"}</Text></span><CountryLandmark country={code}/></label>)}</fieldset>
 {state.error&&<p className="auth-error" role="alert"><Text>{state.error}</Text></p>}
 <button type="submit" className="welcome-confirm" disabled={!country||pending}><Text>{pending?"Saving…":"Confirm & continue"}</Text><Icon name="arrow"/></button>
 <p className="welcome-help"><Text>You can change your country later in Change neighborhood.</Text></p></form>
 <footer className="welcome-footer"><span/><Text>Buy · Sell · Connect Locally</Text><span/></footer>
 </main></div>;
}

export function WelcomeForm(props:{initialCountry:CountryCode|""}){return <LanguageProvider welcome><WelcomeFormContent {...props}/></LanguageProvider>;}
