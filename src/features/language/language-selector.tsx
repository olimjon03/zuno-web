"use client";
import { useEffect, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { useIconPopover } from "@/components/ui/use-icon-popover";
import { useCountry } from "@/features/locations/country-provider";
import { languages, countryLanguages } from "./catalog";
import { useLanguage, useT } from "./provider";
import "./language-selector.css";
export function LanguageSelector({welcome=false}:{welcome?:boolean}) {
 const country=useCountry(),available=countryLanguages(country,welcome);
 const {language,setLanguage}=useLanguage();const t=useT();
 const {root,trigger,panel,open,position,toggle,close,id}=useIconPopover(200,available.length*44+18);
 useEffect(()=>{if(open)panel.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();},[open,panel]);
 function navigate(event:KeyboardEvent<HTMLDivElement>){
  const buttons=Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')??[]);
  const current=buttons.indexOf(document.activeElement as HTMLButtonElement);let next=current;
  if(event.key==="ArrowDown")next=(current+1)%buttons.length;else if(event.key==="ArrowUp")next=(current-1+buttons.length)%buttons.length;else if(event.key==="Home")next=0;else if(event.key==="End")next=buttons.length-1;else return;
  event.preventDefault();buttons[next]?.focus();
 }
 return <div ref={root} className="zuno-language-selector">
  <button ref={trigger} className="header-icon-button language-trigger" type="button" aria-label={t("Language")} title={t("Language")} aria-expanded={open} aria-haspopup="menu" aria-controls={id} onClick={toggle}><Icon name="globe"/></button>
  {open&&<div ref={panel} id={id} style={position} className="language-menu icon-popover" role="menu" aria-label={t("Language")} onKeyDown={navigate}>
   {available.map(code=>languages.find(item=>item.code===code)!).map(item=><button key={item.code} type="button" role="menuitemradio" aria-checked={language===item.code} tabIndex={language===item.code?0:-1} lang={item.code} onClick={()=>{setLanguage(item.code);close(true);}}><span aria-hidden="true">{item.flag}</span><span>{item.name}</span>{language===item.code&&<Icon name="check-circle"/>}</button>)}
  </div>}
  <span className="sr-only" role="status" aria-live="polite">{t("Language selected: {language}",{language:languages.find(item=>item.code===language)!.name})}</span>
 </div>;
}
