"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { selectCountry, selectRegion, type LocationSelection } from "./catalog";
const Context = createContext<{
  location: LocationSelection;
  changeCountry: (value: string) => void;
  changeRegion: (value: string) => void;
  resetLocation: () => void;
} | null>(null);
export function LocationProvider({children}:{children:ReactNode}) {
  const [location,setLocation]=useState<LocationSelection>({country:"",region:""});
  return <Context.Provider value={{location,changeCountry:value=>setLocation(selectCountry(value)),changeRegion:value=>setLocation(current=>selectRegion(current,value)),resetLocation:()=>setLocation({country:"",region:""})}}>{children}</Context.Provider>;
}
export function useLocation() {
  const context=useContext(Context);
  if(!context) throw new Error("LocationProvider is required");
  return context;
}
