import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSavedListings } from "@/features/listings/server/data";

export async function getSavedPage() {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login?notice=session");
  return getSavedListings();
}
