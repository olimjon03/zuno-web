import { findRegion,isCountryCode } from "../locations/catalog";
import { categories } from "../listings/constants";
import type { Category } from "../listings/types";
import type { FeedFilters } from "./types";
export const feedSorts = ["newest","price-asc","price-desc"] as const;
export function parseFeedFilters(params:URLSearchParams):FeedFilters {
 const candidate=params.get("country")??"";
 const country=isCountryCode(candidate)?candidate:"";
 const region=params.get("region")??"";
 const category=params.get("category")??"All items";
 const sort=params.get("sort")??"newest";
 return {
  query:Array.from(params.get("q")??"").slice(0,100).join(""),
  category:categories.includes(category as Category)?category as Category:"All items",
  country,region:country&&findRegion(region)?.countryCode===country?region:"",
  minPrice:country?(params.get("min")??"").slice(0,32):"",
  maxPrice:country?(params.get("max")??"").slice(0,32):"",
  availableOnly:params.get("available")==="1",
  sort:country&&feedSorts.includes(sort as FeedFilters["sort"])?sort as FeedFilters["sort"]:"newest",
 };
}
export function feedParams(filters:FeedFilters) {
 const params=new URLSearchParams();
 if(filters.query.trim())params.set("q",filters.query);
 if(filters.country)params.set("country",filters.country);
 if(filters.region)params.set("region",filters.region);
 if(filters.category!=="All items")params.set("category",filters.category);
 if(filters.country&&filters.minPrice)params.set("min",filters.minPrice);
 if(filters.country&&filters.maxPrice)params.set("max",filters.maxPrice);
 if(filters.availableOnly)params.set("available","1");
 if(filters.country&&filters.sort!=="newest")params.set("sort",filters.sort);
 return params;
}
export function feedIssue(filters:FeedFilters) {
 for(const price of [filters.minPrice,filters.maxPrice]) {
  if(price&&(!/^\d+$/.test(price)||!Number.isSafeInteger(Number(price))||Number(price)>1000000000000))return "Enter whole prices between 0 and 1,000,000,000,000.";
 }
 if(filters.minPrice&&filters.maxPrice&&Number(filters.minPrice)>Number(filters.maxPrice))return "Minimum price must not exceed maximum price.";
 return null;
}
