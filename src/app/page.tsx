import { Suspense } from "react";
import { connection } from "next/server";
import { SectionLoading } from "@/components/layout/section-loading";
import { Homepage } from "@/features/marketplace/homepage";
import { getMarketplacePage,type FeedPage } from "@/features/search/feed-data";
import { feedIssue,parseFeedFilters } from "@/features/search/feed-model";
type SearchParams=Promise<Record<string,string|string[]|undefined>>;
async function MarketplaceFeed({searchParams}:{searchParams:SearchParams}) {
 await connection();const raw=await searchParams;const params=new URLSearchParams();
 for(const [key,value] of Object.entries(raw)){if(typeof value==="string")params.set(key,value);else if(Array.isArray(value)&&value[0])params.set(key,value[0]);}
 const filters=parseFeedFilters(params);let page:FeedPage={items:[],nextCursor:null};let error:string|undefined;
 if(!feedIssue(filters)){try{page=await getMarketplacePage(filters);}catch{error="Listings are temporarily unavailable. Please try again.";}}
 return <Homepage initialSearch={params.toString()} initialPage={page} initialError={error}/>;
}
export default function Home({searchParams}:{searchParams:SearchParams}) {
 return <Suspense fallback={<SectionLoading message="Loading nearby listings…"/>}><MarketplaceFeed searchParams={searchParams}/></Suspense>;
}
