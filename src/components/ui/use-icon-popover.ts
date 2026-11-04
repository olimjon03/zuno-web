"use client";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";

export function useIconPopover(width:number,height:number) {
 const id=useId();
 const root=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const panel=useRef<HTMLDivElement>(null);
 const [open,setOpen]=useState(false);
 const [position,setPosition]=useState<CSSProperties>({});
 const place=useCallback(()=>{
  const rect=trigger.current?.getBoundingClientRect();if(!rect)return;
  const w=Math.min(width,window.innerWidth-24),h=Math.min(height,window.innerHeight-24);
  const top=rect.bottom+8+h<=window.innerHeight-12?rect.bottom+8:Math.max(12,rect.top-h-8);
  setPosition({position:"fixed",left:Math.max(12,Math.min(rect.right-w,window.innerWidth-w-12)),top,width:w,maxHeight:window.innerHeight-top-12});
 },[width,height]);
 const close=useCallback((restoreFocus=false)=>{setOpen(false);if(restoreFocus)trigger.current?.focus();},[]);
 const toggle=()=>{if(open)close();else{place();setOpen(true);}};
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))close();};
  const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();event.stopPropagation();close(true);}};
  document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);
  window.addEventListener("resize",place);window.addEventListener("scroll",place,true);
  return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);window.removeEventListener("resize",place);window.removeEventListener("scroll",place,true);};
 },[open,close,place]);
 return {id,root,trigger,panel,open,position,toggle,close};
}
