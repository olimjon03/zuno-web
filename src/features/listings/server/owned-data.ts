import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingOptions } from "./data";
import type { OwnedListing } from "../types";

export async function getOwnedListingData() {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) redirect("/login?notice=session");
  const [{ data, error }, options] = await Promise.all([
    db.from("listings")
      .select("id,title,description,price,condition,category_id,neighborhood_id,status,photos:listing_images(id,sort_order)")
      .eq("seller_id", user.id)
      .neq("status", "removed")
      .order("created_at", { ascending: false })
      .limit(100),
    getListingOptions(),
  ]);
  if (error) throw new Error("Your listings are temporarily unavailable.");
  return { items: (data ?? []) as OwnedListing[], options };
}
