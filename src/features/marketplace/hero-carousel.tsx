"use client";
import { HeroMedia } from "./hero-media";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { useT } from "@/features/language/provider";
import { HERO_INTERVAL_MS, heroSlides } from "./hero-slides";
import "./hero-carousel.css";
const motionQuery="(prefers-reduced-motion: reduce)";
function subscribeMotion(callback:()=>void){const query=window.matchMedia(motionQuery);query.addEventListener("change",callback);return()=>query.removeEventListener("change",callback);}
function readMotion(){return window.matchMedia(motionQuery).matches;}
function subscribeVisibility(callback:()=>void){document.addEventListener("visibilitychange",callback);return()=>document.removeEventListener("visibilitychange",callback);}
function readVisibility(){return document.visibilityState==="visible";}
type DataConnection={saveData?:boolean;addEventListener?:(event:string,callback:()=>void)=>void;removeEventListener?:(event:string,callback:()=>void)=>void};
function connection(){return (navigator as Navigator&{connection?:DataConnection}).connection;}
function readSaveData(){return Boolean(connection()?.saveData);}
function subscribeSaveData(callback:()=>void){const net=connection();net?.addEventListener?.("change",callback);return()=>net?.removeEventListener?.("change",callback);}
export function HeroCarousel(){
 const t=useT();
 const [{index,previous,cycle,direction},setSlide]=useState({index:0,previous:-1,cycle:0,direction:"next"});
 const [hovered,setHovered]=useState(false);
 const [keyboardFocus,setKeyboardFocus]=useState(false);
 const [inView,setInView]=useState(true);
 const [manual,setManual]=useState(false);
 const section=useRef<HTMLElement>(null);
 const dots=useRef<HTMLDivElement>(null);
 const saveData=useSyncExternalStore(subscribeSaveData,readSaveData,()=>true);
 const reducedMotion=useSyncExternalStore(subscribeMotion,readMotion,()=>true);
 const visible=useSyncExternalStore(subscribeVisibility,readVisibility,()=>true);
 const rotating=visible&&inView&&!hovered&&!keyboardFocus&&!reducedMotion;
 useEffect(()=>{
  const target=section.current;
  if(!target||!("IntersectionObserver" in window))return;
  const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:0});
  observer.observe(target);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  if(!rotating)return;
  const timer=window.setTimeout(()=>{
   setManual(false);
   setSlide(current=>({index:(current.index+1)%heroSlides.length,previous:current.index,cycle:current.cycle+1,direction:"next"}));
  },HERO_INTERVAL_MS);
  return()=>window.clearTimeout(timer);
 },[index,cycle,rotating]);
 useEffect(()=>{
  const scroller=dots.current;const selected=scroller?.children[index] as HTMLElement|undefined;
  if(!scroller||!selected)return;
  const center=()=>{const offset=selected.offsetLeft-(scroller.clientWidth-selected.offsetWidth)/2;scroller.scrollTo({left:Math.max(0,offset),behavior:reducedMotion?"instant":"smooth"});};
  center();const observer=new ResizeObserver(center);observer.observe(scroller);return()=>observer.disconnect();
 },[index,reducedMotion]);
 function choose(next:number){setManual(true);setSlide(current=>({index:(next+heroSlides.length)%heroSlides.length,previous:current.index,cycle:current.cycle+1,direction:next<current.index?"previous":"next"}));}
 return <div className="hero-band"><section ref={section} className="hero shell zuno-hero-carousel" aria-roledescription={t("carousel")} aria-label={t("How ZUNO works")} data-slide={heroSlides[index].id} data-rotating={rotating} data-direction={direction}
  onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
  onFocusCapture={event=>{if((event.target as HTMLElement).matches(":focus-visible"))setKeyboardFocus(true);}}
  onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setKeyboardFocus(false);}}>
  <div className="hero-copy zuno-hero-copy">
   <h1 id="hero-title" className="zuno-hero-stack">{heroSlides.map((slide,i)=><span key={slide.id} className={`zuno-hero-words ${i===index?"is-active":i===previous?"is-previous":""}`} aria-hidden={i!==index}><span>{t(slide.first)}</span><strong>{t(slide.second)}</strong></span>)}</h1>
   <p className="hero-tagline">{t("Buy · Sell · Connect Locally")}</p>
   <div className="zuno-hero-stack zuno-hero-descriptions">{heroSlides.map((slide,i)=><p key={slide.id} className={`zuno-hero-description ${i===index?"is-active":i===previous?"is-previous":""}`} aria-hidden={i!==index}>{t(slide.description)}</p>)}</div>
   <div className="hero-actions"><Link className="button button-primary" href="/sell">{t("Sell an Item")}<Icon name="arrow"/></Link><a className="button button-outline" href="#marketplace">{t("Explore nearby")}</a></div>
  </div>
  <div className="hero-image zuno-hero-images">{heroSlides.map((slide,i)=><HeroMedia key={slide.id} slide={slide} active={i===index} previous={i===previous} mounted={i===0||i===index||i===previous||i===(index+1)%heroSlides.length} priority={i===0} videoAllowed={!reducedMotion&&!saveData} playing={rotating} />)}</div>
  <div className="zuno-hero-controls">
   <div ref={dots} className="zuno-hero-dots" role="group" aria-label={t("Choose a slide")}>{heroSlides.map((slide,i)=><button key={slide.id} type="button" className={i===index?"is-active":""} aria-label={t("Show slide {number}: {title}",{number:i+1,title:t(slide.first)+" "+t(slide.second)})} aria-pressed={i===index} onClick={()=>choose(i)}><span/></button>)}</div>
   <span className="zuno-hero-counter" aria-hidden="true">{String(index+1).padStart(2,"0")} / {String(heroSlides.length).padStart(2,"0")}</span>
   <div className="zuno-hero-arrows"><button type="button" aria-label={t("Previous slide")} onClick={()=>choose(index-1)}><Icon name="chevron" className="zuno-hero-previous"/></button><button type="button" aria-label={t("Next slide")} onClick={()=>choose(index+1)}><Icon name="chevron"/></button></div>
  </div>
  <p className="sr-only" aria-live="polite" aria-atomic="true">{manual?t("Slide {current} of {total}: {title}",{current:index+1,total:heroSlides.length,title:t(heroSlides[index].first)+" "+t(heroSlides[index].second)}):""}</p>
 </section></div>;
}
