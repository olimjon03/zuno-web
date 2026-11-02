import type { NextRequest } from "next/server";
import { searchMarketplace } from "@/features/search/server/http";
export async function GET(request:NextRequest){return searchMarketplace(request);}
