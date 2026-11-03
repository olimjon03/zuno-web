"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "./hero-slides";
import { useT } from "@/features/language/provider";

function HeroVideo({src,poster,active,playing}:{src:string;poster:string;active:boolean;playing:boolean}) {
 const ref=useRef<HTMLVideoElement>(null);
 const wasActive=useRef(false);
 const [status,setStatus]=useState<"poster"|"ready"|"blocked">("poster");
 useEffect(()=>{
  const video=ref.current;
  if(!video)return;
  let current=true;
  if(active&&!wasActive.current)video.currentTime=0;
  wasActive.current=active;
  if(playing){
   video.muted=true;
   void video.play().catch(()=>{if(current)setStatus("blocked");});
  }else video.pause();
  return()=>{current=false;video.pause();};
 },[src,active,playing]);
 return <video ref={ref} src={src} poster={poster} muted playsInline loop preload="none" aria-hidden="true" tabIndex={-1} className="zuno-hero-video" data-video-status={status} onPlaying={()=>setStatus("ready")} onError={()=>setStatus("blocked")}/>;
}
export function HeroMedia({slide,active,previous,mounted,videoAllowed,playing,priority}:{slide:HeroSlide;active:boolean;previous:boolean;mounted:boolean;videoAllowed:boolean;playing:boolean;priority:boolean}) {
 const t=useT();
 return <div className={`zuno-hero-frame ${active?"is-active":previous?"is-previous":""}`} aria-hidden={!active}>
 {mounted&&<Image src={slide.image} alt={active?t(slide.alt):""} fill sizes="(max-width: 700px) 100vw, (max-width: 1240px) 50vw, 600px" preload={priority} loading={priority?undefined:"lazy"} className="zuno-hero-poster"/>}
 {slide.video&&videoAllowed&&(active||previous)&&<HeroVideo src={slide.video} poster={slide.image} active={active} playing={active&&playing}/>}
 </div>;
}
