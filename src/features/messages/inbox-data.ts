import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InboxEntry } from "./inbox-model";
type InboxRow = {
  id:string;listing_id:string|null;listing_title:string;other_id:string;other_name:string;
  avatar_path:string|null;neighborhood:string|null;last_message:string|null;last_message_at:string;thumbnail_id:string|null;
};
export async function getInbox(db: SupabaseClient, userId: string): Promise<InboxEntry[]> {
  const {data,error}=await db.rpc("get_inbox");
  if(!error)return ((data ?? []) as InboxRow[]).map(row=>({id:row.id,listingId:row.listing_id,listingTitle:row.listing_title,otherId:row.other_id,otherName:row.other_name,avatarPath:row.avatar_path,neighborhood:row.neighborhood,lastMessage:row.last_message,lastMessageAt:row.last_message_at,thumbnailId:row.thumbnail_id}));
  // Keep existing chats usable until migration 008 is applied. Do not mask
  // network/authorization failures or fetch another participant's private rows.
  if(error.code!=="PGRST202" && error.code!=="42883")throw new Error("Messages are temporarily unavailable.");
  const {data:conversations,error:readError}=await db.from("conversations").select("id,listing_id,listing_title,buyer_id,seller_id,buyer_name,seller_name,last_message_at").order("last_message_at",{ascending:false}).limit(100);
  if(readError)throw new Error("Messages are temporarily unavailable.");
  const listingIds=[...new Set((conversations ?? []).map(row=>row.listing_id).filter((id):id is string=>Boolean(id)))];
  const {data:listings}=listingIds.length ? await db.from("listings").select("id,neighborhood:neighborhoods(name),photos:listing_images(id,sort_order)").in("id",listingIds).in("status",["active","reserved","sold"]) : {data:[]};
  type Preview = {id:string;neighborhood:{name:string}|null;photos:{id:string;sort_order:number}[]};
  const previews=new Map(((listings ?? []) as unknown as Preview[]).map(row=>[row.id,row]));
  return (conversations ?? []).map(row=>{
    const preview=previews.get(row.listing_id);
    return {id:row.id,listingId:row.listing_id,listingTitle:row.listing_title,otherId:row.buyer_id===userId ? row.seller_id : row.buyer_id,otherName:row.buyer_id===userId ? row.seller_name : row.buyer_name,avatarPath:null,neighborhood:preview?.neighborhood?.name ?? null,lastMessage:null,lastMessageAt:row.last_message_at,thumbnailId:preview?.photos?.slice().sort((a,b)=>a.sort_order-b.sort_order)[0]?.id ?? null};
  });
}
export async function getInboxSnapshot(db: SupabaseClient, userId: string) {
  const entries=await getInbox(db,userId);
  return {entries,now:Date.now()};
}
