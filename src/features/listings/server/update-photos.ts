import "server-only";
import { MAX_BODY_BYTES,MAX_PHOTO_BYTES } from "../constants";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";
import { isUuid, validatePhotos } from "@/features/listings/validation";
import { BodyTooLargeError, readBoundedForm } from "@/features/listings/server/request-body";
import { processPhoto } from "@/features/listings/server/process-photo";
import { PHOTO_BUCKET } from "@/features/listings/server/constants";
const reply=(error:string,status:number)=>NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}});
export async function updateListingPhotos(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
 if(request.headers.get("origin")!==getSiteUrl())return reply("Please submit from ZUNO.",403);
 const {id}=await params;if(!isUuid(id))return reply("Invalid item.",400);
 const db=await createClient();const {data:{user},error:authError}=await db.auth.getUser();
 if(authError || !user)return reply("Please log in again.",401);
 const {data:listing,error:lookupError}=await db.from("listings").select("id").eq("id",id).eq("seller_id",user.id).neq("status","removed").maybeSingle();
 if(lookupError)return reply("Your item is temporarily unavailable.",503);
 if(!listing)return reply("Item unavailable or not owned by you.",404);
 let form:FormData;
 try {form=await readBoundedForm(request,MAX_BODY_BYTES);}catch(error){return reply(error instanceof BodyTooLargeError ? "Photo upload is too large. Try smaller images." : "Could not read photos.",400);}
 let order:string[],expected:string[];
 try {
  order=JSON.parse(String(form.get("order")));expected=JSON.parse(String(form.get("expected")));
  if(!Array.isArray(order)||order.length<1||order.length>10||new Set(order).size!==order.length||!order.every(v=>typeof v==="string"))throw Error();
  if(!Array.isArray(expected)||expected.length>10||!expected.every(v=>typeof v==="string"&&isUuid(v))||new Set(expected).size!==expected.length)throw Error();
 }catch{return reply("Choose between 1 and 10 unique photos.",400);}
 const entries=form.getAll("photos");const files=entries.filter((v):v is File=>v instanceof File);
 if(files.length!==entries.length || (files.length && validatePhotos(files,true)))return reply("Choose valid JPG, PNG or WebP photos.",400);
 if(order.filter(v=>v.startsWith("new:")).length!==files.length)return reply("Invalid photo order.",400);
 const {data:existing,error:photoError}=await db.from("listing_images").select("id,storage_path,sort_order").eq("listing_id",id).order("sort_order");
 if(photoError)return reply("Could not read existing photos.",503);
 const byId=new Map((existing??[]).map(photo=>[photo.id,photo.storage_path]));
 if(order.some(v=>!v.startsWith("new:")&&!byId.has(v)))return reply("Photos changed. Reload before editing.",409);
 const uploaded:string[]=[];
 let successful=false;
 try {
  for(const file of files){
   const bytes=await processPhoto(file,MAX_PHOTO_BYTES);const path=`${user.id}/${id}/${randomUUID()}.webp`;
   uploaded.push(path);
   const {error}=await db.storage.from(PHOTO_BUCKET).upload(path,bytes,{contentType:"image/webp",upsert:false});if(error)throw Error("Upload failed");
  }
  const paths=order.map(token=>{
   if(!token.startsWith("new:"))return byId.get(token)!;
   if(!/^new:\d+$/.test(token))throw Error("Invalid image index");
   const path=uploaded[Number(token.slice(4))];if(!path)throw Error("Invalid image index");return path;
  });
  const {error}=await db.rpc("replace_listing_photos",{p_id:id,p_expected:expected,p_paths:paths});
  if(error)return reply(error.code==="40001" ? "Photos changed in another tab. Reload before editing." : "Could not save photos. Please try again.",error.code==="40001" ? 409 : 503);
  successful=true;
 }catch{return reply("Could not prepare or upload photos. Your selection has been kept.",503);}
 finally {
  // A lost response can hide a committed transaction. Never delete attached paths.
  const {data:attached,error}=await db.from("listing_images").select("storage_path").eq("listing_id",id);
  if(!error){const referenced=new Set((attached??[]).map(v=>v.storage_path));const unused=[...uploaded,...(successful ? (existing??[]).map(v=>v.storage_path) : [])].filter(path=>!referenced.has(path));if(unused.length)await db.storage.from(PHOTO_BUCKET).remove(unused);}
 }
 revalidatePath("/");revalidatePath(`/listings/${id}`);revalidatePath("/account/listings");revalidatePath("/account/saved");revalidatePath("/messages");
 return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
}
