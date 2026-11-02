"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DemoDialog } from "@/components/ui/demo-dialog";
import { Icon } from "@/components/ui/icon";
import { useFavorites } from "@/features/favorites/favorites-provider";
import { formatPrice, type Listing } from "../sample-listings";
import type { ListingDetails } from "../sample-details";

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
  return (
    <>
      <a className="skip-link" href="#listing-detail">
        Skip to listing
      </a>
      <header className="shell detail-header">
        <Link href="/" className="wordmark" aria-label="ZUNO home">
          ZUNO
        </Link>
        <Link href="/" className="detail-back">
          ← Back to marketplace
        </Link>
      </header>
      <main id="listing-detail" className="shell detail-page">
        <nav aria-label="Breadcrumb" className="detail-breadcrumb">
          <Link href="/">Marketplace</Link>
          <span aria-hidden="true">/</span>
          <span>{listing.category}</span>
        </nav>
        <p className="detail-demo">
          Sample listing · Explore the demo. No purchases or messages are sent.
        </p>
        <div className="detail-grid">
          <section aria-label="Listing photos" className="detail-gallery">
            <button
              className="detail-photo"
              aria-label={`Enlarge photo of ${listing.title}`}
              onClick={() => setDialog("photo")}
            >
              <Image
                src={listing.image}
                alt={listing.imageAlt}
                fill
                sizes="(max-width: 767px) 100vw, 60vw"
                loading="eager"
                fetchPriority="high"
              />
            </button>
            <div className="photo-caption">
              <span>1 photo</span>
              <button onClick={() => setDialog("photo")}>View larger ↗</button>
            </div>
          </section>
          <section className="detail-summary" aria-labelledby="listing-title">
            <p className="listing-location">
              <Icon name="pin" />
              Seoul · {listing.neighborhood}
            </p>
            <h1 id="listing-title">{listing.title}</h1>
            <p className="detail-price">{formatPrice(listing.price)}</p>
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
              <button
                className="button button-primary"
                onClick={() => setDialog("contact")}
              >
                Contact seller
                <Icon name="arrow" />
              </button>
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
                ? "Saved for this visit."
                : "Save a find to come back to it during this visit."}
            </p>
            <div className="detail-seller">
              <span className="seller-avatar" aria-hidden="true">
                {details.seller.charAt(0)}
              </span>
              <div>
                <h2>{details.seller}</h2>
                <p>Sample seller · Joined {details.joined}</p>
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
            Pickup in {listing.neighborhood}, Seoul. Agree on a public meeting
            place and inspect the item before exchanging. Exact addresses are
            not displayed.
          </p>
        </section>
      </main>
      <footer className="shell footer">
        <Link href="/" className="wordmark" aria-label="ZUNO home">
          ZUNO.
        </Link>
        <p>Buy · Sell · Connect Locally</p>
        <span>Sample listings · Demo marketplace</span>
      </footer>
      {dialog && (
        <DemoDialog
          title={
            dialog === "photo" ? listing.title : `Contact ${details.seller}`
          }
          onClose={() => setDialog(null)}
        >
          {dialog === "photo" ? (
            <Image
              className="detail-enlarged"
              src={listing.image}
              alt={listing.imageAlt}
              width={1000}
              height={800}
              sizes="(max-width: 639px) 90vw, 440px"
            />
          ) : (
            <p>
              Messaging is coming soon. This is a sample seller and no message
              will be sent. You can browse and save finds while we build the
              next stage.
            </p>
          )}
        </DemoDialog>
      )}
    </>
  );
}
