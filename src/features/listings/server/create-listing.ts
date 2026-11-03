import "server-only";
import { MAX_BODY_BYTES,MAX_PHOTO_BYTES } from "../constants";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";
import {
  parseListingInput,
  validatePhotos,
} from "@/features/listings/validation";
import {
  BodyTooLargeError,
  readBoundedForm,
} from "@/features/listings/server/request-body";
import { processPhoto } from "@/features/listings/server/process-photo";
import { PHOTO_BUCKET } from "@/features/listings/server/constants";
const reply = (message: string, status: number) =>
  NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
export async function createListing(request: NextRequest) {
  // Cookie-authenticated uploads accept only this app's browser origin.
  if (request.headers.get("origin") !== getSiteUrl())
    return reply("Please submit the form from ZUNO.", 403);
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return reply("Please log in before posting an item.", 401);
  let form: FormData;
  try {
    form = await readBoundedForm(request, MAX_BODY_BYTES);
  } catch (error) {
    return reply(
      error instanceof BodyTooLargeError
        ? "The upload is too large. Keep photos below 3.5 MB combined."
        : "We couldn’t read the form. Please try again.",
      error instanceof BodyTooLargeError ? 413 : 400,
    );
  }
  let input;
  try {
    input = parseListingInput(form);
  } catch (error) {
    return reply(
      error instanceof Error ? error.message : "Check the form.",
      400,
    );
  }
  const entries = form.getAll("photos");
  const files = entries.filter((entry): entry is File => entry instanceof File);
  const photoError = validatePhotos(files, true);
  if (photoError || files.length !== entries.length)
    return reply(photoError ?? "Choose valid photos.", 400);
  const { data: existing, error: lookupError } = await supabase
    .from("listings")
    .select("id")
    .eq("id", input.id)
    .eq("seller_id", user.id)
    .maybeSingle();
  if (lookupError)
    return reply(
      "Posting is temporarily unavailable. Please try again later.",
      503,
    );
  // A retry after a lost response returns the already-created listing.
  if (existing)
    return NextResponse.json(
      { id: existing.id },
      { headers: { "Cache-Control": "no-store" } },
    );
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name,country_code")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || !profile)
    return reply(
      "Your profile is temporarily unavailable. Please try again.",
      503,
    );
  const {data:area,error:areaError}=await supabase.from("neighborhoods").select("region_code").eq("id",input.neighborhoodId).maybeSingle();
  if(areaError||!profile.country_code||!area||!area.region_code?.startsWith(profile.country_code+"-"))return reply("Choose a neighborhood from this country.",400);
  let processed: Buffer[];
  try {
    processed = [];
    for (const file of files) processed.push(await processPhoto(file, MAX_PHOTO_BYTES));
  } catch {
    return reply(
      "One of the photos could not be read. Choose still JPG, PNG or WebP images.",
      400,
    );
  }
  const paths: string[] = [];
  let committed = false;
  try {
    for (const bytes of processed) {
      const path = `${user.id}/${input.id}/${randomUUID()}.webp`;
      paths.push(path);
      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, bytes, { contentType: "image/webp", upsert: false });
      if (error) throw new Error("Upload failed");
    }
    const name = profile.display_name;
    const { error } = await supabase.rpc("publish_listing", {
      p_id: input.id,
      p_title: input.title,
      p_description: input.description,
      p_price: input.price,
      p_condition: input.condition,
      p_category_id: input.categoryId,
      p_neighborhood_id: input.neighborhoodId,
      p_image_paths: paths,
      p_seller_name:
        Array.from(String(name).trim()).length < 2
          ? "Neighbor"
          : Array.from(String(name).trim()).slice(0, 40).join(""),
    });
    if (error) throw new Error("Publish failed");
    committed = true;
  } catch {
    // The transaction may have succeeded even if the network response was lost.
    const { data: published } = await supabase
      .from("listings")
      .select("id")
      .eq("id", input.id)
      .eq("seller_id", user.id)
      .maybeSingle();
    committed = Boolean(published);
    let unused = paths;
    if (published) {
      const { data: attached, error } = await supabase
        .from("listing_images")
        .select("storage_path")
        .eq("listing_id", input.id);
      // Never remove a referenced photo, including when a concurrent retry succeeded.
      unused = error
        ? []
        : paths.filter(
            (path) => !attached?.some((image) => image.storage_path === path),
          );
    }
    if (unused.length) {
      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .remove(unused);
      if (error)
        console.error(
          "[ZUNO listing] Unattached photo cleanup requires retry.",
        );
    }
    if (!committed)
      return reply(
        "We couldn’t publish your item. Please try again; your form has been kept.",
        503,
      );
  }
  revalidatePath("/");
  revalidatePath("/account/listings");
  revalidatePath(`/listings/${input.id}`);
  return NextResponse.json(
    { id: input.id },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
