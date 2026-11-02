import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";
import { readBoundedForm, BodyTooLargeError } from "@/features/listings/server/request-body";
import { processPhoto } from "@/features/listings/server/process-photo";
const bucket = "zuno-avatars";
const reply = (error: string, status: number) => NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== getSiteUrl()) return reply("Submit your photo from ZUNO.",403);
  try {
    const db = await createClient();
    const {data:{user},error:authError} = await db.auth.getUser();
    if (authError || !user) return reply("Please log in again.",401);
    const form = await readBoundedForm(request, 3 * 1024 * 1024 + 16384);
    const file = form.get("photo");
    if (!(file instanceof File) || file.size === 0 || file.size > 3 * 1024 * 1024 || !["image/jpeg","image/png","image/webp"].includes(file.type)) return reply("Choose a JPG, PNG or WebP photo up to 3 MB.",400);
    let photo;
    try { photo = await processPhoto(file, 3 * 1024 * 1024); } catch { return reply("This photo could not be read. Choose a still JPG, PNG or WebP image.",400); }
    const {data:profile,error:lookupError} = await db.from("profiles").select("avatar_path").eq("id",user.id).maybeSingle();
    if (lookupError || !profile) return reply("Profile photos are temporarily unavailable. Please try again later.",503);
    const path = `${user.id}/${randomUUID()}.webp`;
    const {error:uploadError} = await db.storage.from(bucket).upload(path,photo,{contentType:"image/webp",upsert:false});
    if (uploadError) return reply("We couldn’t upload the photo. Please try again.",503);
    let update = db.from("profiles").update({avatar_path:path}).eq("id",user.id);
    update = profile.avatar_path ? update.eq("avatar_path",profile.avatar_path) : update.is("avatar_path",null);
    const {data:saved,error:saveError} = await update.select("id").maybeSingle();
    if (saveError || !saved) {
      await db.storage.from(bucket).remove([path]);
      return reply("Your profile changed while uploading. Please refresh and try again.",409);
    }
    if (profile.avatar_path) await db.storage.from(bucket).remove([profile.avatar_path]);
    revalidatePath("/account");revalidatePath("/account/settings");revalidatePath(`/neighbors/${user.id}`);
    return NextResponse.json({message:"Profile photo updated."},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return reply(error instanceof BodyTooLargeError ? "Choose a photo up to 3 MB." : "We couldn’t connect. Please try again.",error instanceof BodyTooLargeError ? 413 : 503); }
}
