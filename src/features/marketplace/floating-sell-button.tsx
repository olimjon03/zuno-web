"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useT } from "@/features/language/provider";
import "./floating-sell-button.css";

export function FloatingSellButton() {
  const t = useT();
  const [dismissed,setDismissed] = useState(false);
  const [hovered,setHovered] = useState(false);
  useEffect(()=>{
    if(!hovered)return;
    const onEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setDismissed(true);};
    window.addEventListener("keydown",onEscape);
    return()=>window.removeEventListener("keydown",onEscape);
  },[hovered]);
  return <Link href="/sell" prefetch={true} className="desktop-floating-sell" aria-label={t("Sell an Item")} data-tooltip-dismissed={dismissed}
    onMouseEnter={()=>{setHovered(true);setDismissed(false);}} onMouseLeave={()=>setHovered(false)} onFocus={()=>setDismissed(false)} onKeyDown={event=>{if(event.key==="Escape")setDismissed(true);}}>
    <Icon name="plus"/>
    <span className="floating-sell-tooltip" aria-hidden="true">{t("Sell an Item")}</span>
  </Link>;
}
