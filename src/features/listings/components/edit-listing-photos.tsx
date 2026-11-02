"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PhotoPicker, type PhotoChoice } from "./photo-picker";
import { preparePhotos } from "../prepare-photos";
export type ListingPhoto = {id:string;sort_order:number};
export function EditListingPhotos({listingId,initial,onSaved}:{listingId:string;initial:ListingPhoto[];onSaved:()=>void}) {
 const router=useRouter();const busy=useRef(false);
 const [photos,setPhotos]=useState<PhotoChoice[]>(()=>[...initial].sort((a,b)=>a.sort_order-b.sort_order).map(p=>({id:p.id,src:`/listing-photos/${p.id}`})));
 const [pending,setPending]=useState(false);const [error,setError]=useState("");const [message,setMessage]=useState("");
 return <details className="owned-photo-editor"><summary>Edit item photos</summary><form onSubmit={async event=>{
  event.preventDefault();if(busy.current)return;if(!photos.length){setError("Keep at least one photo.");return;}
  busy.current=true;setPending(true);setError("");setMessage("");
  try {
   const form=new FormData();let index=0;
   form.set("order",JSON.stringify(photos.map(photo=>photo.file ? `new:${index++}` : photo.id)));
   form.set("expected",JSON.stringify([...initial].sort((a,b)=>a.sort_order-b.sort_order).map(p=>p.id)));
   const originals=photos.flatMap(photo=>photo.file ? [photo.file] : []);
   for(const file of await preparePhotos(originals))form.append("photos",file);
   const response=await fetch(`/api/listings/${listingId}/photos`,{method:"PATCH",body:form});
   const result=await response.json();if(!response.ok)throw Error(result.error || "Could not save photos.");
   setMessage("Photos saved.");onSaved();router.refresh();
  }catch(issue){setError(issue instanceof Error ? issue.message : "Could not save photos. Please try again.");}
  finally{busy.current=false;setPending(false);}
 }} aria-busy={pending}><fieldset disabled={pending}><legend className="sr-only">Edit listing photos</legend><PhotoPicker id={`photos-${listingId}`} photos={photos} onChange={setPhotos} onError={setError} disabled={pending}/><button className="button button-primary" disabled={pending}>{pending ? "Saving photos…" : "Save photos"}</button></fieldset>{error&&<p role="alert" className="auth-error">{error}</p>}{message&&<p role="status">{message}</p>}</form></details>;
}
