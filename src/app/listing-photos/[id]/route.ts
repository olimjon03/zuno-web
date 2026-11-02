import { createPublicClient } from "@/lib/supabase/public";
import { PHOTO_BUCKET } from "@/features/listings/server/data";
import { isUuid } from "@/features/listings/validation";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isUuid(id)) return new Response(null, { status: 404 });
  const supabase = createPublicClient();
  const { data: image, error } = await supabase
    .from("listing_images")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (error || !image)
    return new Response(null, {
      status: error ? 503 : 404,
      headers: { "Cache-Control": "no-store" },
    });
  const { data, error: downloadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .download(image.storage_path);
  if (downloadError || !data)
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  return new Response(data, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
