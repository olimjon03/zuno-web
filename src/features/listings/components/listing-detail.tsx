"use client";
import { resolveLocation } from "@/features/locations/catalog";
import { formatLocationLabel } from "@/features/locations/catalog";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SafetyControls } from "@/features/moderation/safety-controls";
import { ContactSeller } from "@/features/messages/contact-seller";
import { DemoDialog } from "@/components/ui/demo-dialog";
import { Icon } from "@/components/ui/icon";
import { useFavorites } from "@/features/favorites/favorites-provider";
import { formatMoney as formatPrice } from "../currency";
import type { Listing } from "../types";
import type { ListingDetails } from "../types";

export function ListingDetail({
  listing,
  details,
}: {
  listing: Listing;
  details: ListingDetails;
}) {
  const [dialog, setDialog] = useState<"photo" | "contact" | null>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const saved = favorites.includes(listing.id);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const photos = listing.photos?.length
    ? listing.photos
    : [{ src: listing.image, alt: listing.imageAlt }];
  const photo = photos[selectedPhoto] ?? photos[0];
  const real = listing.source === "database";
  return (
    <>
      <a className="skip-link" href="#listing-detail">
        Skip to listing
      </a>
      <header className="shell detail-header">
        <Link href="/" className="wordmark" aria-label="ZUNO home">
          <Brand/>
        </Link><BackHomeNav/></header>
      <main id="listing-detail" className="shell detail-page">
        <nav aria-label="Breadcrumb" className="detail-breadcrumb">
          <Link href="/">Marketplace</Link>
          <span aria-hidden="true">/</span>
          <span>{listing.category}</span>
        </nav>
        {listing.status && listing.status !== "active" && (
          <p className="listing-status" role="status">
            {listing.status === "sold"
              ? "This item has been sold."
              : "This item is reserved."}
          </p>
        )}
        <p className="detail-demo">
          {real
            ? "Local pickup · Inspect the item before exchanging."
            : "Sample listing · Explore the demo. No purchases or messages are sent."}
        </p>
        <div className="detail-grid">
          <section aria-label="Listing photos" className="detail-gallery">
            <button
              className="detail-photo"
              aria-label={`Enlarge photo of ${listing.title}`}
              onClick={() => setDialog("photo")}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                unoptimized={real}
                sizes="(max-width: 767px) 100vw, 60vw"
                loading="eager"
                fetchPriority="high"
              />
            </button>
            <div className="photo-caption">
              <span>
                {photos.length} {photos.length === 1 ? "photo" : "photos"}
              </span>
              <button onClick={() => setDialog("photo")}>View larger ↗</button>
            </div>
            {photos.length > 1 && (
              <div className="photo-thumbnails">
                {photos.map((item, index) => (
                  <button
                    key={item.src}
                    aria-label={`Show photo ${index + 1}`}
                    aria-pressed={selectedPhoto === index}
                    onClick={() => setSelectedPhoto(index)}
                  >
                    <Image
                      src={item.src}
                      alt=""
                      width={90}
                      height={70}
                      unoptimized={real}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
          <section className="detail-summary" aria-labelledby="listing-title">
            <p className="listing-location">
              <Icon name="pin" />
              {formatLocationLabel(listing)}
            </p>
            <h1 id="listing-title">{listing.title}</h1>
            <p className="detail-price">{formatPrice(listing.price, listing.countryCode ?? resolveLocation(listing.neighborhood, listing.regionCode).countryCode)}</p>
            <dl className="detail-facts">
              <div>
                <dt>Condition</dt>
                <dd>{details.condition}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{listing.category}</dd>
              </div>
              <div>
                <dt>Exchange</dt>
                <dd>Local pickup</dd>
              </div>
            </dl>
            <div className="detail-actions">
              {real ? (
                <ContactSeller listingId={listing.id} />
              ) : (
                <button
                  className="button button-primary"
                  onClick={() => setDialog("contact")}
                >
                  Contact seller
                  <Icon name="arrow" />
                </button>
              )}
              <button
                className={`button button-outline ${saved ? "detail-saved" : ""}`}
                aria-pressed={saved}
                onClick={() => toggleFavorite(listing.id)}
              >
                <Icon name="heart" />
                {saved ? "Saved" : "Save item"}
              </button>
            </div>
            <p role="status" className="detail-save-status">
              {saved
                ? real
                  ? "Saved to your account."
                  : "Sample saved for this visit."
                : real
                  ? "Save this find to your account."
                  : "Save a sample for this visit."}
            </p>
            <div className="detail-seller">
              <span className="seller-avatar" aria-hidden="true">
                {details.seller.charAt(0)}
              </span>
              <div>
                <h2>{details.sellerId ? <Link href={`/neighbors/${details.sellerId}`}>{details.seller} · View profile</Link> : details.seller}</h2>
                <p>
                  {real
                    ? "Local seller"
                    : `Sample seller · Joined ${details.joined}`}
                </p>
              </div>
            </div>
          </section>
        </div>
        <section
          className="detail-description"
          aria-labelledby="description-title"
        >
          <h2 id="description-title">About this item</h2>
          <p>{details.description}</p>
          <h2>Meet nearby</h2>
          <p>
            Pickup in {formatLocationLabel(listing)}. Agree on a public meeting
            place and inspect the item before exchanging. Exact addresses are
            not displayed.
          </p>
        </section>
        {real && details.sellerId && <SafetyControls userId={details.sellerId} name={details.seller} listingId={listing.id}/>}
      </main>
      <footer className="shell footer">
        <Link href="/" className="wordmark" aria-label="ZUNO home">
          <Brand/>
        </Link>
        <p>Buy · Sell · Connect Locally</p>
        <span>
          {real
            ? "Your neighborhood marketplace"
            : "Sample listings · Demo marketplace"}
        </span>
      </footer>
      {dialog && (
        <DemoDialog
          title={
            dialog === "photo" ? listing.title : `Contact ${details.sellerId ? <Link href={`/neighbors/${details.sellerId}`}>{details.seller} · View profile</Link> : details.seller}`
          }
          onClose={() => setDialog(null)}
        >
          {dialog === "photo" ? (
            <Image
              className="detail-enlarged"
              src={photo.src}
              alt={photo.alt}
              width={1000}
              height={800}
              unoptimized={real}
              sizes="(max-width: 639px) 90vw, 440px"
            />
          ) : (
            <p>
              {real
                ? "Messaging is coming soon. No message has been sent. You can save this item for now."
                : "Messaging is coming soon. This is a sample seller and no message will be sent."}
            </p>
          )}
        </DemoDialog>
      )}
    </>
  );
}
