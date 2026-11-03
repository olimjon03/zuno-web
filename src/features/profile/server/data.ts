import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AccountProfile } from "../types";

export async function getAccountProfile(): Promise<AccountProfile> {
  if (!isSupabaseConfigured()) redirect("/login?notice=session");
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login?notice=session");
  const [profileResult, areaResult, avatarResult] = await Promise.all([
    db.from("profiles").select("display_name,neighborhood_id").eq("id", user.id).maybeSingle(),
    db.from("neighborhoods").select("id,name").order("id"),
    db.from("profiles").select("avatar_path").eq("id", user.id).maybeSingle(),
  ]);
  if (profileResult.error || !profileResult.data || areaResult.error)
    throw new Error("Your profile is temporarily unavailable.");
  return {
    user: { id: user.id, email: user.email ?? "" },
    profile: { display_name: profileResult.data.display_name, neighborhood_id: profileResult.data.neighborhood_id === null ? null : Number(profileResult.data.neighborhood_id) },
    neighborhoods: (areaResult.data ?? []).map(area => ({ id: Number(area.id), name: area.name as string })),
    avatarPath: avatarResult.data?.avatar_path ?? null,
  };
}
