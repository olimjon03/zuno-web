import { Icon } from "@/components/ui/icon";
import type { Listing } from "../types";
export function ListingEngagement({ counts }: { counts: Listing["engagement"] }) {
  if (!counts) return null;
  const format = (value: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return <span className="listing-engagement" aria-label="Listing activity">
    <span aria-label={`${counts.views} views`} title={`${counts.views.toLocaleString("en")} views`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>{format(counts.views)}</span>
    <span aria-label={`${counts.messagers} people messaged`} title={`${counts.messagers.toLocaleString("en")} people sent a message`}><Icon name="chat" width="14" height="14"/>{format(counts.messagers)}</span>
  </span>;
}
