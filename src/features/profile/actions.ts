"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseProfile } from "./validation";
export type ProfileState = { error?: string; message?: string };
export async function updateProfile(
  _state: ProfileState,
  data: FormData,
): Promise<ProfileState> {
  let input;
  try {
    input = parseProfile(data);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Check your profile details.",
    };
  }
  try {
    const db = await createClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser();
    if (authError || !user)
      return { error: "Please log in again to update your profile." };
    if (input.neighborhoodId !== null) {
      const { data: area, error } = await db
        .from("neighborhoods")
        .select("id")
        .eq("id", input.neighborhoodId)
        .maybeSingle();
      if (error)
        return {
          error: "We couldn’t check the neighborhood. Please try again.",
        };
      if (!area) return { error: "Choose a neighborhood from the list." };
    }
    // Only these two columns can be changed, and identity comes from verified Auth.
    const { data: saved, error } = await db
      .from("profiles")
      .update({
        display_name: input.displayName,
        neighborhood_id: input.neighborhoodId,
      })
      .eq("id", user.id)
      .select("id")
      .maybeSingle();
    if (error || !saved)
      return { error: "We couldn’t save your profile. Please try again." };
  } catch {
    return { error: "We couldn’t connect. Your changes have been kept." };
  }
  revalidatePath("/account");
    revalidatePath("/account/settings");
  return { message: "Profile updated." };
}
