"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useCountry } from "./country-provider";
import { selectCountry, selectRegion, type LocationSelection } from "./catalog";
const Context = createContext<{
  location: LocationSelection;
  setSelection: (value: LocationSelection) => void;
  changeCountry: (value: string) => void;
  changeRegion: (value: string) => void;
  resetLocation: () => void;
} | null>(null);
export function LocationProvider({children}:{children:ReactNode}) {
  const country=useCountry();
  const [location,setLocation]=useState<LocationSelection>({country:"",region:""});
  const setSelection=useCallback((value:LocationSelection)=>{const selected=selectRegion(selectCountry(value.country),value.region);setLocation(current=>current.country===selected.country&&current.region===selected.region?current:selected);},[]);
  return <Context.Provider value={{location:country&&country!==location.country?{country,region:""}:location,setSelection,changeCountry:value=>setLocation(selectCountry(value)),changeRegion:value=>setLocation(current=>selectRegion(current,value)),resetLocation:()=>setLocation({country:"",region:""})}}>{children}</Context.Provider>;
}
export function useLocation() {
  const context=useContext(Context);
  if(!context) throw new Error("LocationProvider is required");
  return context;
}
