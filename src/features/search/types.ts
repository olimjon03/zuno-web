import type { CountryCode } from "../locations/catalog";
import type { Category,Listing } from "../listings/types";
export type FeedSort = "newest" | "price-asc" | "price-desc";
export type FeedFilters = {
 query:string; category:Category; country:CountryCode|""; region:string; district?:string;
 minPrice:string; maxPrice:string; availableOnly:boolean; sort:FeedSort;
};
export type FeedPage={items:Listing[];nextCursor:string|null};
export type RawFeedSearchParameters=Record<string,string|string[]|undefined>;
export type MarketplaceHomeData={initialSearch:string;initialPage:FeedPage;initialError?:string};
