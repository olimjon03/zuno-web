import { getListingPhoto } from "@/features/listings/server/read-photo";
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return getListingPhoto(request,context);}
