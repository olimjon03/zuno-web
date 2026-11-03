import { ListingEngagement } from "./listing-engagement";
import "./listing-engagement.css";
import { resolveLocation } from "@/features/locations/catalog";
import { formatLocationLabel } from "@/features/locations/catalog";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatMoney as formatPrice } from "../currency";
import type { Listing } from "../types";
export function ListingCard({
  listing,
  favorite,
  onToggleFavorite,
}: {
  listing: Listing;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <article className="listing-card">
      <div className="listing-image">
        <Link
          className="image-link"
          href={`/listings/${listing.id}`}
          aria-label={`View ${listing.title}`}
        >
          <Image
            src={listing.image}
            alt={listing.imageAlt}
            fill
            unoptimized={listing.source === "database"}
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 300px"
          />
        </Link>
        <button
          className={`favorite ${favorite ? "is-favorite" : ""}`}
          aria-label={`${favorite ? "Unsave" : "Save"} ${listing.title}`}
          aria-pressed={favorite}
          onClick={onToggleFavorite}
        >
          <Icon name="heart" />
        </button>
      </div>
      <h3>
        <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
      </h3>
      {listing.status && listing.status !== "active" && (
        <p className="listing-status">
          {listing.status === "sold" ? "Sold" : "Reserved"}
        </p>
      )}
      <p className="price">{formatPrice(listing.price, listing.countryCode ?? resolveLocation(listing.neighborhood, listing.regionCode).countryCode)}</p>
      <div className="listing-bottom"><p className="listing-location">
        <Icon name="pin" />
        <span>{formatLocationLabel(listing)}</span>
      </p><ListingEngagement counts={listing.engagement}/></div>
    </article>
  );
}
