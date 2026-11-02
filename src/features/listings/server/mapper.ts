import "server-only";
import { resolveLocation } from "@/features/locations/catalog";
import { categories,conditionLabels } from "../constants";
import type { Listing,ListingDetails,Category } from "../types";
import type { ListingRow } from "./types";
export function mapRow(row: ListingRow): { listing: Listing; details: ListingDetails } {
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
