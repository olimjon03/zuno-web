"use client";
import { useEffect, useRef } from "react";
import { MAX_PHOTOS, validatePhotos } from "../validation";
export type PhotoChoice = {id:string;src:string;file?:never} | {id:string;file:File;src?:never};
function Preview({photo,index}:{photo:PhotoChoice;index:number}) {
  const ref=useRef<HTMLImageElement>(null);
  useEffect(()=>{
    const src=photo.file ? URL.createObjectURL(photo.file) : photo.src;
    if(ref.current) ref.current.src=src;
    return ()=>{if(photo.file) URL.revokeObjectURL(src);};
  },[photo]);
  // Local object URLs and same-origin private listing photos.
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} alt={`Item photo ${index+1}`} width={180} height={140}/>;
}
export function PhotoPicker({id,photos,onChange,onError,disabled=false}:{id:string;photos:PhotoChoice[];onChange:(photos:PhotoChoice[])=>void;onError:(error:string)=>void;disabled?:boolean}) {
 return <div className="sell-field"><label htmlFor={id}>Photos ({photos.length}/{MAX_PHOTOS})</label><p id={`${id}-help`} className="auth-hint">Add 1–10 JPG, PNG or WebP photos, up to 10 MB each. Photos are optimized before upload. The first photo is the cover.</p><input id={id} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled} aria-describedby={`${id}-help`} onChange={event=>{
  const files=Array.from(event.target.files ?? []);event.target.value="";
  if(!files.length)return;
  const issue=validatePhotos(files);
  if(issue || photos.length+files.length>MAX_PHOTOS){onError(issue ?? "Choose up to 10 photos in total.");return;}
  onChange([...photos,...files.map(file=>({id:crypto.randomUUID(),file}))]);onError("");
 }}/><div className="upload-previews">{photos.map((photo,index)=><div key={photo.id}><Preview photo={photo} index={index}/><span>{index===0 ? "Cover photo" : `Photo ${index+1}`}</span><div className="manage-actions"><button type="button" disabled={disabled || index===0} onClick={()=>onChange([photo,...photos.filter(p=>p.id!==photo.id)])} aria-label={`Use photo ${index+1} as cover`}>Make cover</button><button type="button" disabled={disabled} onClick={()=>onChange(photos.filter(p=>p.id!==photo.id))} aria-label={`Remove photo ${index+1}`}>Remove</button></div></div>)}</div></div>;
}
