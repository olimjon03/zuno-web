import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AccountProfile } from "../types";

export async function getAccountProfile(): Promise<AccountProfile> {
  if (!isSupabaseConfigured()) redirect("/login?notice=session");
  const db = await createClient();
  const [auth, areaResult] = await Promise.all([
    db.auth.getUser(),
    db.from("neighborhoods").select("id,name,region_code,district_code").order("id"),
  ]);
  const { data: { user }, error } = auth;
  if (error || !user) redirect("/login?notice=session");
  let { data: profile, error: profileError } = await db.from("profiles")
    .select("display_name,neighborhood_id,avatar_path").eq("id", user.id).maybeSingle();
  // Keep profile settings usable on installations awaiting the avatar migration.
  if (profileError?.code === "42703" || profileError?.code === "PGRST204") {
    const fallback = await db.from("profiles").select("display_name,neighborhood_id").eq("id", user.id).maybeSingle();
    profile = fallback.data ? { ...fallback.data, avatar_path: null } : null;
    profileError = fallback.error;
  }
  if (profileError || !profile || areaResult.error)
    throw new Error("Your profile is temporarily unavailable.");
  return {
    user: { id: user.id, email: user.email ?? "" },
    profile: { display_name: profile.display_name, neighborhood_id: profile.neighborhood_id === null ? null : Number(profile.neighborhood_id) },
    neighborhoods: (areaResult.data ?? []).map(area => ({ id: Number(area.id), name: area.name as string, districtCode: area.district_code as string | null, regionCode: area.region_code as string | null })),
    avatarPath: profile.avatar_path ?? null,
  };
}
