import type { ListingInput } from "../types";
export type ListingRow = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: ListingInput["condition"];
  seller_name: string;
  seller_id: string;
  created_at: string;
  status: string;
  category: { name_en: string } | null;
  neighborhood: { name: string; region_code?: string | null } | null;
  photos: { id: string; sort_order: number }[];
};
