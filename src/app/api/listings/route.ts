import type { NextRequest } from "next/server";
import { createListing } from "@/features/listings/server/create-listing";
export async function POST(request:NextRequest){return createListing(request);}
