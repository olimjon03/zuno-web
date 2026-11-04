"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid, parseListingInput } from "../validation";

import type { ManageResult } from "../types";
export async function manageListing(
  _previous: ManageResult,
  form: FormData,
): Promise<ManageResult> {
  const id = form.get("id");
  if (typeof id !== "string" || !isUuid(id))
    return { error: "Invalid listing. Reload and try again." };
  const intent = form.get("intent");
  if (!["edit", "sold", "active", "reserved", "remove"].includes(String(intent)))
    return { error: "Choose a valid action." };
  if (intent === "remove" && form.get("confirm") !== "yes")
    return { error: "Confirm removal first." };
  let changes;
  if (intent === "edit") {
    try {
      const input = parseListingInput(form);
      changes = {
        title: input.title,
        description: input.description,
        price: input.price,
        condition: input.condition,
        category_id: input.categoryId,
        neighborhood_id: input.neighborhoodId,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Check the item details.",
      };
    }
  } else changes = { status: intent === "remove" ? "removed" : intent };
  try {
    const db = await createClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser();
    if (authError || !user)
      return { error: "Please log in again to manage your listings." };
    if (intent === "reserved" || intent === "sold") {
      const conversation = form.get("conversation");
      if (conversation !== null && (typeof conversation !== "string" || !isUuid(conversation)))
        return { error: "Choose a valid buyer." };
      const { error } = await db.rpc("set_listing_buyer_status", {
        p_listing_id: id,
        p_conversation_id: conversation,
        p_status: intent,
      });
      if (error) return { error: "We couldn’t save your changes. Please try again." };
      if (conversation) revalidatePath(`/messages/${conversation}`);
    } else {
      // Both the owner filter and database RLS authorize every mutation.
      const { data, error } = await db
        .from("listings")
        .update(changes)
        .eq("id", id)
        .eq("seller_id", user.id)
        .neq("status", "removed")
        .select("id")
        .maybeSingle();
      if (error)
        return { error: "We couldn’t save your changes. Please try again." };
      if (!data)
        return {
          error:
            "This item is unavailable or you don’t own it. Reload your listings.",
        };
    }
  } catch {
    return { error: "We couldn’t connect. Please try again." };
  }
  revalidatePath("/");
  revalidatePath(`/listings/${id}`);
  revalidatePath("/account/listings");
  revalidatePath("/account/saved");
  revalidatePath("/explore/purchase-history");
  return {
    message:
      intent === "remove"
        ? "Item removed from the marketplace."
        : "Changes saved.",
  };
}

export async function getListingBuyerChoices(id: string) {
  if (!isUuid(id)) return { error: "Invalid listing. Reload and try again." };
  try {
    const db = await createClient();
    const { data, error } = await db.rpc("get_listing_buyer_choices", { p_listing_id: id });
    if (error) return { error: "Buyer choices could not be loaded." };
    return { buyers: (data ?? []) as { id: string; buyer_id: string; buyer_name: string; avatar_path: string | null; last_message: string; reserved_buyer: boolean }[] };
  } catch {
    return { error: "Buyer choices could not be loaded." };
  }
}
