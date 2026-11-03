"use client";
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { COUNTRY_COOKIE, parseCountryPreference } from "./country-preference";
import type { CountryCode } from "./catalog";
const event="zuno:country";
function read(){const value=document.cookie.split("; ").find(part=>part.startsWith(`${COUNTRY_COOKIE}=`))?.slice(COUNTRY_COOKIE.length+1);return parseCountryPreference(value)?.country??"";}
function subscribe(callback:()=>void){window.addEventListener(event,callback);window.addEventListener("focus",callback);return()=>{window.removeEventListener(event,callback);window.removeEventListener("focus",callback);};}
const Context=createContext<CountryCode|"">("");
export function CountryProvider({children}:{children:ReactNode}){const country=useSyncExternalStore(subscribe,read,()=>"" as const);return <Context.Provider value={country}>{children}</Context.Provider>;}
export function useCountry(){return useContext(Context);}
export function notifyCountryChange(){window.dispatchEvent(new Event(event));}
