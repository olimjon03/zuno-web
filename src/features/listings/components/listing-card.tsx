import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { formatPrice, type Listing } from "../sample-listings";
export function ListingCard({
  listing,
  favorite,
  onToggleFavorite,
  onOpen,
}: {
  listing: Listing;
  favorite: boolean;
  onToggleFavorite: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="listing-card">
      <div className="listing-image">
        <button
          className="image-link"
          onClick={onOpen}
          aria-label={`View ${listing.title}`}
        >
          <Image
            src={listing.image}
            alt={listing.imageAlt}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 300px"
          />
        </button>
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
        <button onClick={onOpen}>{listing.title}</button>
      </h3>
      <p className="price">{formatPrice(listing.price)}</p>
      <p className="listing-location">
        <Icon name="pin" />
        Seoul · {listing.neighborhood}
      </p>
    </article>
  );
}
