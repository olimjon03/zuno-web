import "server-only";
import { NextRequest,NextResponse } from "next/server";
import { getMarketplacePage } from "@/features/search/server/data";
import { feedIssue,parseFeedFilters } from "@/features/search/validation";
import { InvalidFeedCursor } from "@/features/search/server/cursor";
export async function searchMarketplace(request:NextRequest) {
 const headers={"Cache-Control":"no-store"};
 if(request.nextUrl.search.length>4096)return NextResponse.json({error:"Search is too long."},{status:400,headers});
 const filters=parseFeedFilters(request.nextUrl.searchParams);const issue=feedIssue(filters);
 if(issue)return NextResponse.json({error:issue},{status:400,headers});
 try{return NextResponse.json(await getMarketplacePage(filters,request.nextUrl.searchParams.get("cursor")??undefined,request.signal),{headers});}
 catch(error){return NextResponse.json({error:error instanceof InvalidFeedCursor?error.message:"Listings are temporarily unavailable. Please try again."},{status:error instanceof InvalidFeedCursor?400:503,headers});}
}
