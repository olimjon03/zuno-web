import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function getExploreSession() {
  await connection();
  if (!isSupabaseConfigured()) redirect("/login?notice=session");
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login?notice=session");
  const profile = await db.from("profiles").select("neighborhood_id,country_code").eq("id", user.id).maybeSingle();
  if (profile.error || !profile.data) throw new Error("Profile could not be loaded");
  return { db, user, profile: profile.data };
}
