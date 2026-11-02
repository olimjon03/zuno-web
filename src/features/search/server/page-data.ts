import "server-only";
import { getMarketplacePage } from "./data";
import { feedIssue,parseFeedFilters } from "../validation";
import type { FeedPage,MarketplaceHomeData,RawFeedSearchParameters } from "../types";

export async function getMarketplaceHome(raw:RawFeedSearchParameters):Promise<MarketplaceHomeData> {
 const params=new URLSearchParams();
 for(const [key,value] of Object.entries(raw)){
  if(typeof value==="string")params.set(key,value);
  else if(Array.isArray(value)&&value[0])params.set(key,value[0]);
 }
 const filters=parseFeedFilters(params);
 let page:FeedPage={items:[],nextCursor:null};let error:string|undefined;
 if(!feedIssue(filters)){
  try{page=await getMarketplacePage(filters);}
  catch{error="Listings are temporarily unavailable. Please try again.";}
 }
 return {initialSearch:params.toString(),initialPage:page,initialError:error};
}
