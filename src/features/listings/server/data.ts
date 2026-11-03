import "server-only";
import { cache } from "react";
import { cacheLife } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isUuid } from "../validation";
import { LISTING_COLUMNS } from "./constants";
import { mapRow } from "./mapper";
import type { ListingRow } from "./types";
export const getLiveListing = cache(async (id: string) => {
  if (!isUuid(id)) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("id", id)
    .in("status", ["active", "reserved", "sold"])
    .maybeSingle<ListingRow>();
  if (error) throw new Error("This listing is temporarily unavailable.");
  return data ? mapRow(data) : null;
});
export async function getListingOptions() {
  "use cache";
  // Public lookup tables only; no session, listing content or owner data.
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  const supabase = createPublicClient();
  const [category, neighborhood, images] = await Promise.all([
    supabase.from("categories").select("id,name_en").order("sort_order"),
    supabase.from("neighborhoods").select("id,name,region_code").order("id"),
    supabase.from("listing_images").select("id").limit(1),
  ]);
  if (category.error || neighborhood.error)
    throw new Error("Posting unavailable");
  return {
    categories: (category.data ?? []).map((row) => ({
      id: Number(row.id),
      name: row.name_en as string,
    })),
    neighborhoods: (neighborhood.data ?? []).map((row) => ({
      id: Number(row.id),
      name: row.name as string,
      regionCode: row.region_code as string | null,
    })),
    ready: !images.error,
  };
}

export async function getSavedListings() {
  const { createClient } = await import("@/lib/supabase/server");
  const db = await createClient();
  const { data, error } = await db
    .from("favorites")
    .select(`listing:listings!inner(${LISTING_COLUMNS})`)
    .in("listing.status", ["active", "reserved", "sold"])
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error("Saved items are temporarily unavailable.");
  return ((data as unknown as { listing: ListingRow }[]) ?? []).map(
    (row) => mapRow(row.listing).listing,
  );
}

export async function getSellerListings(sellerId: string) {
  const {data,error}=await createPublicClient().from("listings").select(LISTING_COLUMNS).eq("seller_id",sellerId).eq("status","active").order("created_at",{ascending:false}).limit(60).returns<ListingRow[]>();
  if(error) throw new Error("This neighbor’s listings are temporarily unavailable.");
  return (data??[]).map(row=>mapRow(row).listing);
}
