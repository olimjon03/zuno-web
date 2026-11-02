import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatPrice, type Listing } from "../sample-listings";
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
      <p className="price">{formatPrice(listing.price)}</p>
      <p className="listing-location">
        <Icon name="pin" />
        Seoul · {listing.neighborhood}
      </p>
    </article>
  );
}
