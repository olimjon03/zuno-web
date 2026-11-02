import type { NextRequest } from "next/server";
import { updateListingPhotos } from "@/features/listings/server/update-photos";
export async function PATCH(request:NextRequest,context:{params:Promise<{id:string}>}){return updateListingPhotos(request,context);}
