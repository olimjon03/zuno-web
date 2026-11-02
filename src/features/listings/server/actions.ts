"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid, parseListingInput, parseAvailability } from "../validation";

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
      const status = parseAvailability(form.get("status"));
      changes = {
        title: input.title,
        description: input.description,
        price: input.price,
        condition: input.condition,
        category_id: input.categoryId,
        neighborhood_id: input.neighborhoodId,
        ...(status ? { status } : {}),
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
  } catch {
    return { error: "We couldn’t connect. Please try again." };
  }
  revalidatePath("/");
  revalidatePath(`/listings/${id}`);
  revalidatePath("/account/listings");
  revalidatePath("/account/saved");
  return {
    message:
      intent === "remove"
        ? "Item removed from the marketplace."
        : "Changes saved.",
  };
}
