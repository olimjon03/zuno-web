import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Listing } from "../types";
import { isUuid } from "../validation";
export async function withListingEngagement(listings: Listing[], signal?: AbortSignal): Promise<Listing[]> {
  const ids = [...new Set(listings.map(item => item.id).filter(isUuid))];
  if (!ids.length) return listings;
  try {
    const request = createPublicClient().rpc("get_listing_engagement", { p_listing_ids: ids });
    const { data, error } = await (signal ? request.abortSignal(signal) : request);
    if (error) return listings; // Existing cards still work while migration 013 is pending.
    const counts = new Map<string, { views: number; messagers: number; likes?: number }>();
    for (const row of data ?? []) {
      const views = Number(row.view_count), messagers = Number(row.messager_count);
      if (isUuid(row.listing_id) && Number.isSafeInteger(views) && views >= 0 && Number.isSafeInteger(messagers) && messagers >= 0) {
        const likes = Number(row.like_count);
        counts.set(row.listing_id, { views, messagers, ...(row.like_count != null && Number.isSafeInteger(likes) && likes >= 0 ? { likes } : {}) });
      }
    }
    return listings.map(item => counts.has(item.id) ? { ...item, engagement: counts.get(item.id) } : item);
  } catch { return listings; }
}
