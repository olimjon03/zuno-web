import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function checkUploadQuota(db: SupabaseClient) {
  try {
    const { data, error } = await db.rpc("take_upload_request_quota");
    if (error) return { message: "Uploads are temporarily unavailable.", status: 503 };
    if (data !== true) return { message: "Upload limit reached or account unavailable. Try again shortly.", status: 429 };
    return null;
  } catch {
    return { message: "Uploads are temporarily unavailable.", status: 503 };
  }
}
