"use server";
import "server-only";
import { writeCountryPreference } from "@/features/onboarding/server/preference";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolveLocation } from "@/features/locations/catalog";
import { parseProfile, parseNeighborhood } from "../validation";
import type { ProfileState } from "../types";
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
  revalidatePath("/neighbors/[id]", "page");
  revalidatePath("/account");
  revalidatePath("/account/settings");
  return { message: "Profile updated.", profile: input };
}

export async function updateNeighborhood(_state: ProfileState, data: FormData): Promise<ProfileState> {
  let input;
  try { input = parseNeighborhood(data); }
  catch (error) { return { error: error instanceof Error ? error.message : "Choose your neighborhood." }; }
  try {
    const db = await createClient();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return { error: "Please log in again to update your neighborhood." };
    const { data: area, error: areaError } = await db.from("neighborhoods").select("id,name,region_code").eq("id", input.neighborhoodId).maybeSingle();
    if (areaError) return { error: "We couldn’t check the neighborhood. Please try again." };
    if (!area || resolveLocation(area.name, area.region_code).countryCode !== input.country) return { error: "Choose a neighborhood from this country." };
    // Neighborhood changes never write display_name, including forged form fields.
    const { error } = await db.rpc("set_marketplace_country", {p_country:input.country,p_neighborhood_id:input.neighborhoodId});
    if (error) return { error: "We couldn’t save your neighborhood. Please try again." };
    await writeCountryPreference(user.id,input.country);
  } catch { return { error: "We couldn’t connect. Your selection has been kept." }; }
  revalidatePath("/neighbors/[id]", "page");
  revalidatePath("/account");
  revalidatePath("/account/settings");
  return { message: "Neighborhood updated.", neighborhoodId: input.neighborhoodId };
}

export async function updateDisplayName(_state: ProfileState, data: FormData): Promise<ProfileState> {
  const onlyName = new FormData();
  const value = data.get("displayName");
  if (typeof value === "string") onlyName.set("displayName", value);
  onlyName.set("neighborhoodId", "");
  let input;
  try { input = parseProfile(onlyName); }
  catch (error) { return { error: error instanceof Error ? error.message : "Check your display name." }; }
  try {
    const db = await createClient();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return { error: "Please log in again to update your profile." };
    const { data: saved, error } = await db.from("profiles").update({ display_name: input.displayName }).eq("id", user.id).select("id").maybeSingle();
    if (error || !saved) return { error: "We couldn’t save your name. Please try again." };
  } catch { return { error: "We couldn’t connect. Your changes have been kept." }; }
  revalidatePath("/neighbors/[id]", "page");revalidatePath("/account");revalidatePath("/account/settings");
  return { message: "Profile updated.", displayName: input.displayName };
}
