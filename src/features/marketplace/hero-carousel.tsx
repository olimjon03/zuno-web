"use client";
import Image from "next/image";
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
export function HeroCarousel(){
 const t=useT();
 const [{index,cycle},setSlide]=useState({index:0,cycle:0});
 const [hovered,setHovered]=useState(false);
 const [keyboardFocus,setKeyboardFocus]=useState(false);
 const [inView,setInView]=useState(true);
 const [manual,setManual]=useState(false);
 const section=useRef<HTMLElement>(null);
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
   setSlide(current=>({index:(current.index+1)%heroSlides.length,cycle:current.cycle+1}));
  },HERO_INTERVAL_MS);
  return()=>window.clearTimeout(timer);
 },[index,cycle,rotating]);
 function choose(next:number){setManual(true);setSlide(current=>({index:(next+heroSlides.length)%heroSlides.length,cycle:current.cycle+1}));}
 return <div className="hero-band"><section ref={section} className="hero shell zuno-hero-carousel" aria-roledescription={t("carousel")} aria-label={t("How ZUNO works")} data-slide={heroSlides[index].id} data-rotating={rotating}
  onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
  onFocusCapture={event=>{if((event.target as HTMLElement).matches(":focus-visible"))setKeyboardFocus(true);}}
  onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setKeyboardFocus(false);}}>
  <div className="hero-copy zuno-hero-copy">
   <h1 id="hero-title" className="zuno-hero-stack">{heroSlides.map((slide,i)=><span key={slide.id} className={`zuno-hero-words ${i===index?"is-active":""}`} aria-hidden={i!==index}><span>{t(slide.first)}</span><strong>{t(slide.second)}</strong></span>)}</h1>
   <p className="hero-tagline">{t("Buy · Sell · Connect Locally")}</p>
   <div className="zuno-hero-stack zuno-hero-descriptions">{heroSlides.map((slide,i)=><p key={slide.id} className={`zuno-hero-description ${i===index?"is-active":""}`} aria-hidden={i!==index}>{t(slide.description)}</p>)}</div>
   <div className="hero-actions"><Link className="button button-primary" href="/sell">{t("Sell an Item")}<Icon name="arrow"/></Link><a className="button button-outline" href="#marketplace">{t("Explore nearby")}</a></div>
  </div>
  <div className="hero-image zuno-hero-images">{heroSlides.map((slide,i)=><Image key={slide.id} src={slide.image} alt={i===index?t(slide.alt):""} aria-hidden={i!==index} fill sizes="(max-width: 700px) 100vw, (max-width: 1240px) 50vw, 600px" preload={i===0} loading={i===0?undefined:"lazy"} className={`zuno-hero-photo ${i===index?"is-active":""}`}/>)}</div>
  <div className="zuno-hero-controls">
   <div className="zuno-hero-dots" role="group" aria-label={t("Choose a slide")}>{heroSlides.map((slide,i)=><button key={slide.id} type="button" className={i===index?"is-active":""} aria-label={t("Show slide {number}: {title}",{number:i+1,title:t(slide.first)+" "+t(slide.second)})} aria-pressed={i===index} onClick={()=>choose(i)}><span/></button>)}</div>
   <span className="zuno-hero-counter" aria-hidden="true">{String(index+1).padStart(2,"0")} / {String(heroSlides.length).padStart(2,"0")}</span>
   <div className="zuno-hero-arrows"><button type="button" aria-label={t("Previous slide")} onClick={()=>choose(index-1)}><Icon name="chevron" className="zuno-hero-previous"/></button><button type="button" aria-label={t("Next slide")} onClick={()=>choose(index+1)}><Icon name="chevron"/></button></div>
  </div>
  <p className="sr-only" aria-live="polite" aria-atomic="true">{manual?t("Slide {current} of {total}: {title}",{current:index+1,total:heroSlides.length,title:t(heroSlides[index].first)+" "+t(heroSlides[index].second)}):""}</p>
 </section></div>;
}
