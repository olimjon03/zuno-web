"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/listings/validation";
export async function loadFavorites() {
  try {
    const db = await createClient();
    const {
      data: { user },
      error,
    } = await db.auth.getUser();
    if (error || !user) return { ids: [], userId: null };
    const { data, error: readError } = await db
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (readError)
      return {
        ids: [],
        userId: user.id,
        error: "Saved items are temporarily unavailable. Please try again.",
      };
    return {
      ids: (data ?? []).map((row) => row.listing_id as string),
      userId: user.id,
    };
  } catch {
    return {
      ids: [],
      userId: null,
      error: "We couldn’t load saved items. Please try again.",
    };
  }
}
export async function saveFavorite(id: string, saved: boolean) {
  if (typeof id !== "string" || !isUuid(id) || typeof saved !== "boolean")
    return { error: "Choose a valid listing." };
  try {
    const db = await createClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser();
    if (authError || !user)
      return { error: "Log in to save items to your account.", login: true };
    // Own user ID is always derived from verified Auth, never from the client.
    const { error } = saved
      ? await db
          .from("favorites")
          .upsert(
            { user_id: user.id, listing_id: id },
            { onConflict: "user_id,listing_id", ignoreDuplicates: true },
          )
      : await db
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id);
    if (error)
      return { error: "We couldn’t update saved items. Please try again." };
    revalidatePath("/account/saved");
    return { userId: user.id };
  } catch {
    return { error: "We couldn’t connect. Please try again." };
  }
}
