"use client";
import { useEffect, useRef } from "react";
import { Text, useT } from "@/features/language/provider";
import { categoryCatalog } from "../catalog";
import type { Category } from "@/features/listings/types";
import "./category-nav.css";

export function CategoryNav({selected,onChange}:{selected:Category;onChange:(category:Category)=>void}) {
  const t = useT();
  const rail = useRef<HTMLElement>(null);
  useEffect(() => {
    const element=rail.current;
    const button=element?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if(!button||!element)return;
    // Keep URL-selected categories reachable without moving the whole page.
    const center=()=>element.scrollTo({left:Math.max(0,button.offsetLeft-(element.clientWidth-button.offsetWidth)/2),behavior:"instant"});
    center();
    const observer=new ResizeObserver(center);observer.observe(element);
    return()=>observer.disconnect();
  },[selected]);
  return <nav ref={rail} className="category-nav category-nav-3d" aria-label={t("Marketplace categories")}>
    {categoryCatalog.map(category=><button type="button" key={category.name} aria-pressed={selected===category.name} className={selected===category.name?"selected":""} onClick={()=>onChange(category.name)}>
      <span className="category-art" aria-hidden="true" style={{backgroundImage:`url(/images/categories/${category.atlas}.webp)`,backgroundPosition:`${category.column*50}% ${category.row*100}%`}}/>
      <span className="category-label"><Text>{category.name}</Text></span>
    </button>)}
  </nav>;
}
