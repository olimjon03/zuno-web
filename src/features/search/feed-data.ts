import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { mapRow,type Row } from "@/features/listings/server/data";
import type { Listing } from "@/features/listings/sample-listings";
import { decodeFeedCursor,encodeFeedCursor } from "./feed-cursor";
import { feedIssue,type FeedFilters } from "./feed-model";
export type FeedPage={items:Listing[];nextCursor:string|null};
export async function getMarketplacePage(filters:FeedFilters,cursor?:string,signal?:AbortSignal):Promise<FeedPage> {
 const issue=feedIssue(filters);if(issue)throw Error(issue);
 const after=decodeFeedCursor(cursor,filters);
 const query=createPublicClient().rpc("search_listings",{
  p_query:filters.query.trim(),p_category:filters.category==="All items"?null:filters.category,
  p_country:filters.country||null,p_region:filters.region||null,
  p_min_price:filters.minPrice?Number(filters.minPrice):null,p_max_price:filters.maxPrice?Number(filters.maxPrice):null,
  p_available_only:filters.availableOnly,p_sort:filters.sort,p_limit:25,
  p_after_id:after?.id??null,p_after_created:after?.createdAt??null,p_after_price:after?.price??null,
 });
 const {data,error}=await (signal?query.abortSignal(signal):query);
 if(error)throw Error("Listings are temporarily unavailable. Please try again.");
 const rows=(data??[]) as Row[];const page=rows.slice(0,24);
 return {items:page.map(row=>mapRow(row).listing),nextCursor:rows.length>24?encodeFeedCursor(page[23],filters):null};
}
