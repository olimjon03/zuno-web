import type { CountryCode } from "../locations/catalog";
import type { categories, conditions } from "./constants";
export type Category = (typeof categories)[number];
export type Listing = {
  engagement?: { views: number; messagers: number; likes?: number };
  id: string;
  title: string;
  price: number;
  neighborhood: string;
  countryCode?: CountryCode;
  regionCode?: string;
  category: Exclude<Category, "All items">;
  image: string;
  imageAlt: string;
  photos?: { src: string; alt: string }[];
  status?: "active" | "reserved" | "sold";
  source?: "sample" | "database";
};
export type ListingDetails = {
  condition: string;
  description: string;
  seller: string;
  sellerId?: string;
  joined: string;
  postedAt?: string;
};
export type ListingInput = {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  neighborhoodId: number;
  condition: (typeof conditions)[number];
};
export type LookupOption = { id:number; name:string; regionCode?:string|null };
export type ListingPhoto = { id:string; sort_order:number };
export type ManageResult = { error?:string; message?:string };
export type OwnedListing = {
  id: string; title: string; description: string; price: number; condition: string;
  category_id: number; neighborhood_id: number; status: string; photos: ListingPhoto[];
};
