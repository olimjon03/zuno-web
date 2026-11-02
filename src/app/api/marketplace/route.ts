import { NextRequest,NextResponse } from "next/server";
import { getMarketplacePage } from "@/features/search/feed-data";
import { feedIssue,parseFeedFilters } from "@/features/search/feed-model";
import { InvalidFeedCursor } from "@/features/search/feed-cursor";
export async function GET(request:NextRequest) {
 const headers={"Cache-Control":"no-store"};
 if(request.nextUrl.search.length>4096)return NextResponse.json({error:"Search is too long."},{status:400,headers});
 const filters=parseFeedFilters(request.nextUrl.searchParams);const issue=feedIssue(filters);
 if(issue)return NextResponse.json({error:issue},{status:400,headers});
 try{return NextResponse.json(await getMarketplacePage(filters,request.nextUrl.searchParams.get("cursor")??undefined,request.signal),{headers});}
 catch(error){return NextResponse.json({error:error instanceof InvalidFeedCursor?error.message:"Listings are temporarily unavailable. Please try again."},{status:error instanceof InvalidFeedCursor?400:503,headers});}
}
