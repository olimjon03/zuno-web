import { resolveLocation } from "@/features/locations/catalog";
import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { categories, type Listing, type Category } from "../sample-listings";
import { conditionLabels, isUuid } from "../validation";
import type { ListingDetails } from "../sample-details";

export const PHOTO_BUCKET = "zuno-listing-photos";
export type LookupOption = { id: number; name: string };
const columns =
  "id,seller_id,title,description,price,condition,seller_name,created_at,status,category:categories(name_en),neighborhood:neighborhoods(name,region_code),photos:listing_images(id,sort_order)";
type Row = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: keyof typeof conditionLabels;
  seller_name: string;
  seller_id: string;
  created_at: string;
  status: string;
  category: { name_en: string } | null;
  neighborhood: { name: string; region_code?: string | null } | null;
  photos: { id: string; sort_order: number }[];
};
function mapRow(row: Row): { listing: Listing; details: ListingDetails } {
  const photos = [...row.photos]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((photo, index) => ({
      src: `/listing-photos/${photo.id}`,
      alt: `${row.title} — photo ${index + 1}`,
    }));
  return {
    listing: {
      id: row.id,
      title: row.title,
      price: Number(row.price),
      category: categories.includes(row.category?.name_en as Category)
        ? (row.category!.name_en as Exclude<Category, "All items">)
        : "Other",
      neighborhood: row.neighborhood?.name ?? "Nearby",
      ...resolveLocation(row.neighborhood?.name ?? "",row.neighborhood?.region_code),
      image: photos[0]?.src ?? "/file.svg",
      imageAlt: photos[0]?.alt ?? row.title,
      photos,
      source: "database",
      status: row.status as "active" | "reserved" | "sold",
    },
    details: {
      condition: conditionLabels[row.condition] ?? "Used",
      description: row.description,
      seller: row.seller_name,
      sellerId: row.seller_id,
      joined: "",
      postedAt: row.created_at,
    },
  };
}
export async function getLiveListings() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("listings")
    .select(columns)
    .in("status", ["active", "reserved", "sold"])
    .order("created_at", { ascending: false })
    .limit(60)
    .returns<Row[]>();
  if (error) throw new Error("Listings unavailable");
  return (data ?? []).map((row) => mapRow(row).listing);
}
export const getLiveListing = cache(async (id: string) => {
  if (!isUuid(id)) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("listings")
    .select(columns)
    .eq("id", id)
    .in("status", ["active", "reserved", "sold"])
    .maybeSingle<Row>();
  if (error) throw new Error("This listing is temporarily unavailable.");
  return data ? mapRow(data) : null;
});
export async function getListingOptions() {
  const supabase = createPublicClient();
  const [category, neighborhood, images] = await Promise.all([
    supabase.from("categories").select("id,name_en").order("sort_order"),
    supabase.from("neighborhoods").select("id,name").order("id"),
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
    })),
    ready: !images.error,
  };
}

export async function getSavedListings() {
  const { createClient } = await import("@/lib/supabase/server");
  const db = await createClient();
  const { data, error } = await db
    .from("favorites")
    .select(`listing:listings!inner(${columns})`)
    .in("listing.status", ["active", "reserved", "sold"])
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error("Saved items are temporarily unavailable.");
  return ((data as unknown as { listing: Row }[]) ?? []).map(
    (row) => mapRow(row.listing).listing,
  );
}

export async function getSellerListings(sellerId: string) {
  const {data,error}=await createPublicClient().from("listings").select(columns).eq("seller_id",sellerId).eq("status","active").order("created_at",{ascending:false}).limit(60).returns<Row[]>();
  if(error) throw new Error("This neighbor’s listings are temporarily unavailable.");
  return (data??[]).map(row=>mapRow(row).listing);
}
