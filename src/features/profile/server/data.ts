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
    .select("display_name,neighborhood_id,avatar_path,member_number").eq("id", user.id).maybeSingle();
  // Keep profile settings usable on installations awaiting the profile migrations.
  if (profileError?.code === "42703" || profileError?.code === "PGRST204") {
    const fallback = await db.from("profiles").select("display_name,neighborhood_id,avatar_path").eq("id", user.id).maybeSingle();
    if (fallback.error?.code === "42703" || fallback.error?.code === "PGRST204") {
      const legacy = await db.from("profiles").select("display_name,neighborhood_id").eq("id", user.id).maybeSingle();
      profile = legacy.data ? { ...legacy.data, avatar_path: null, member_number: null } : null;
      profileError = legacy.error;
    } else {
      profile = fallback.data ? { ...fallback.data, member_number: null } : null;
      profileError = fallback.error;
    }
  }
  if (profileError || !profile || areaResult.error)
    throw new Error("Your profile is temporarily unavailable.");
  return {
    user: { id: user.id, email: user.email ?? "" },
    profile: { display_name: profile.display_name, neighborhood_id: profile.neighborhood_id === null ? null : Number(profile.neighborhood_id) },
    neighborhoods: (areaResult.data ?? []).map(area => ({ id: Number(area.id), name: area.name as string, districtCode: area.district_code as string | null, regionCode: area.region_code as string | null })),
    memberNumber: profile.member_number == null ? null : String(profile.member_number),
    avatarPath: profile.avatar_path ?? null,
  };
}
