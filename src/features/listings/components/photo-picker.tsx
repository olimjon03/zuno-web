"use client";
import { Text, useT } from "@/features/language/provider";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { MAX_PHOTOS } from "../constants";
import { validatePhotos } from "../validation";
export type PhotoChoice = {id:string;src:string;file?:never} | {id:string;file:File;src?:never};
function Preview({photo,index}:{photo:PhotoChoice;index:number}) {
  const t = useT();
  const ref=useRef<HTMLImageElement>(null);
  useEffect(()=>{
    const src=photo.file ? URL.createObjectURL(photo.file) : photo.src;
    if(ref.current) ref.current.src=src;
    return ()=>{if(photo.file) URL.revokeObjectURL(src);};
  },[photo]);
  // Local object URLs and same-origin private listing photos.
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} alt={t("Item photo {count}", { count: index+1 })} width={180} height={140} loading="lazy" decoding="async"/>;
}
export function PhotoPicker({id,photos,onChange,onError,disabled=false,compact=false}:{
 id:string;photos:PhotoChoice[];onChange:(photos:PhotoChoice[])=>void;
 onError:(error:string)=>void;disabled?:boolean;compact?:boolean;
}) {
 const t = useT();
 return <div className={`sell-field ${compact ? "compact-photo-picker" : ""}`}>
  <label htmlFor={id}>{t(compact ? "Item photos · {count}/{max}" : "Photos ({count}/{max})", { count: photos.length, max: MAX_PHOTOS })}</label>
  <p id={`${id}-help`} className="auth-hint"><Text>{"Add 1–10 JPG, PNG or WebP photos, up to 3.5 MB each. Photos are optimized before upload. The first photo is the cover."}</Text></p>
  <input id={id} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled}
   className={compact ? "sr-only" : undefined} aria-label={compact ? t("Add item photos") : undefined}
   aria-describedby={`${id}-help`} onChange={event=>{
    const files=Array.from(event.target.files ?? []);event.target.value="";
    if(!files.length)return;
    const issue=validatePhotos(files);
    if(issue || photos.length+files.length>MAX_PHOTOS){onError(issue ?? "Choose up to 10 photos in total.");return;}
    onChange([...photos,...files.map(file=>({id:crypto.randomUUID(),file}))]);onError("");
   }}/>
  <div className={`upload-previews ${compact ? "compact-photo-rail" : ""}`}>
   {photos.map((photo,index)=><div key={photo.id} className="photo-choice">
    <div className="photo-choice-media"><Preview photo={photo} index={index}/>{compact && index===0 && <span className="photo-cover-label"><Text>{"Cover"}</Text></span>}</div>
    {!compact && <span>{index===0 ? <Text>{"Cover photo"}</Text> : t("Photo {count}", { count: index+1 })}</span>}
    <div className="manage-actions">
     <button type="button" disabled={disabled || index===0} onClick={()=>onChange([photo,...photos.filter(p=>p.id!==photo.id)])} aria-label={t("Use photo {count} as cover", { count: index+1 })} title={t(index===0 ? "Current cover" : "Make cover")}>{compact ? <Icon name="check-circle"/> : <Text>{"Make cover"}</Text>}</button>
     <button type="button" disabled={disabled} onClick={()=>onChange(photos.filter(p=>p.id!==photo.id))} aria-label={t("Remove photo {count}", { count: index+1 })} title={t("Remove photo")}>{compact ? <Icon name="trash"/> : <Text>{"Remove"}</Text>}</button>
    </div>
   </div>)}
   {compact && photos.length<MAX_PHOTOS && <label className="photo-add-tile" htmlFor={id} aria-disabled={disabled}><Icon name="plus"/><span><Text>{"Add photos"}</Text></span></label>}
  </div>
 </div>;
}
