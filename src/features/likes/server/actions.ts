"use server";
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/listings/validation";
export async function setListingLike(id: string, liked: boolean): Promise<{ liked?: boolean; count?: number; error?: string; login?: boolean }> {
  if (typeof id !== "string" || !isUuid(id) || typeof liked !== "boolean") return { error: "Choose a valid listing." };
  try {
    const db = await createClient();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return { error: "Log in to like items.", login: true };
    const { data, error } = await db.rpc("set_listing_like", { p_listing_id: id, p_liked: liked });
    const row = data?.[0], count = Number(row?.like_count);
    if (error || !row || row.liked !== liked || !Number.isSafeInteger(count) || count < 0) return { error: error?.code === "P0002" ? "This item may no longer be available." : "We couldn’t update your like. Please try again." };
    return { liked: row.liked, count };
  } catch { return { error: "We couldn’t update your like. Please try again." }; }
}
