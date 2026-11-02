"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useFavorites } from "@/features/favorites/favorites-provider";
import { Header } from "@/components/layout/header";
import { Icon } from "@/components/ui/icon";
import { DemoDialog } from "@/components/ui/demo-dialog";
import { CategoryNav } from "@/features/categories/components/category-nav";
import { ListingCard } from "@/features/listings/components/listing-card";
import {
  sampleListings,
  type Category,
  type Neighborhood,
} from "@/features/listings/sample-listings";

export function Homepage() {
  const [category, setCategory] = useState<Category>("All items");
  const [neighborhood, setNeighborhood] = useState<Neighborhood>("All nearby");
  const [query, setQuery] = useState("");
  const { favorites, toggleFavorite } = useFavorites();
  const [dialog, setDialog] = useState<"login" | "sell" | null>(null);
  const listings = sampleListings.filter(
    (listing) =>
      (category === "All items" || listing.category === category) &&
      (neighborhood === "All nearby" ||
        listing.neighborhood === neighborhood) &&
      `${listing.title} ${listing.neighborhood} ${listing.category}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  );
  function resetFilters() {
    setCategory("All items");
    setNeighborhood("All nearby");
    setQuery("");
  }
  return (
    <>
      <a className="skip-link" href="#marketplace">
        Skip to listings
      </a>
      <Header
        neighborhood={neighborhood}
        onNeighborhoodChange={setNeighborhood}
        query={query}
        onQueryChange={setQuery}
        onLogin={() => setDialog("login")}
      />
      <main>
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              Buy · Sell · Connect <br />
              Locally
            </h1>
            <p>Good finds. Great neighbors.</p>
            <button
              className="button button-primary"
              onClick={() => setDialog("sell")}
            >
              Sell an Item
              <Icon name="arrow" />
            </button>
          </div>
          <div className="hero-image">
            <Image
              src="/images/hero.webp"
              alt="A wooden chair, plant, lamp and vintage camera ready for a new home"
              fill
              sizes="(max-width: 639px) 100vw, 55vw"
              preload
            />
          </div>
        </section>
        <section
          id="marketplace"
          className="shell marketplace"
          aria-labelledby="listings-title"
        >
          <CategoryNav selected={category} onChange={setCategory} />
          <div className="section-heading">
            <h2 id="listings-title">Fresh finds nearby</h2>
            <p role="status" aria-live="polite">
              {listings.length} {listings.length === 1 ? "find" : "finds"}
              {favorites.length > 0 && ` · ${favorites.length} saved`}
            </p>
          </div>
          {listings.length > 0 ? (
            <div className="listing-grid">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  favorite={favorites.includes(listing.id)}
                  onToggleFavorite={() => toggleFavorite(listing.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="search" />
              <h3>No finds just yet</h3>
              <p>Try another search, category, or neighborhood.</p>
              <button className="button button-outline" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>
      <footer className="footer shell">
        <Link href="/" className="wordmark" aria-label="ZUNO home">
          ZUNO.
        </Link>
        <p>A little closer. A little more connected.</p>
        <span>Sample listings · Demo marketplace</span>
      </footer>
      <button
        className="button button-primary mobile-sell"
        onClick={() => setDialog("sell")}
      >
        <Icon name="plus" />
        Sell an Item
      </button>
      {dialog && (
        <DemoDialog
          title={
            dialog === "sell" ? "Your next sale starts here" : "Welcome to ZUNO"
          }
          onClose={() => setDialog(null)}
        >
          <p>
            {dialog === "sell"
              ? "Listing an item is coming soon. This sample marketplace lets you explore local finds; no items or personal information are submitted."
              : "Login is coming soon. For now, explore the sample listings and save your favorites during this visit. No account is needed."}
          </p>
        </DemoDialog>
      )}
    </>
  );
}
