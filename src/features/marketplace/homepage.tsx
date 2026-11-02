"use client";
import { priceLabel } from "@/features/listings/currency";
import { filterMarketplace } from "@/features/locations/catalog";
import { Brand } from "@/components/ui/brand";
import Image from "next/image";
import Link from "next/link";
import { useLocation } from "@/features/locations/location-provider";
import { countries, findRegion } from "@/features/locations/catalog";
import { useState } from "react";
import { useFavorites } from "@/features/favorites/favorites-provider";
import { Header } from "@/components/layout/header";
import { Icon } from "@/components/ui/icon";
import { CategoryNav } from "@/features/categories/components/category-nav";
import { ListingCard } from "@/features/listings/components/listing-card";
import {
  sampleListings,
  type Listing,
  type Category,
} from "@/features/listings/sample-listings";

export function Homepage({
  initialListings = sampleListings,
  feedNotice,
  isDemo = true,
}: {
  initialListings?: Listing[];
  feedNotice?: string;
  isDemo?: boolean;
}) {
  const [category, setCategory] = useState<Category>("All items");
  const {location,changeCountry,changeRegion,resetLocation}=useLocation();
  const [query, setQuery] = useState("");
  const { favorites, toggleFavorite } = useFavorites();
  const [minPrice,setMinPrice]=useState("");
  const [maxPrice,setMaxPrice]=useState("");
  const [availableOnly,setAvailableOnly]=useState(false);
  const listings = filterMarketplace(initialListings,{category,location,query,minPrice,maxPrice,availableOnly});
  function resetFilters() {
    setCategory("All items");
    resetLocation();
    setQuery("");
    setMinPrice("");setMaxPrice("");setAvailableOnly(false);
  }
  return (
    <>
      <a className="skip-link" href="#marketplace">
        Skip to listings
      </a>
      <div className="utility-bar"><div className="shell"><span>Buy · Sell · Connect Locally</span><span>{location.region ? findRegion(location.region)?.regionName : location.country ? countries.find(country=>country.code===location.country)?.name : "Choose your local area"}</span></div></div>
      <Header
        location={location}
        onCountryChange={value=>{changeCountry(value);setMinPrice("");setMaxPrice("");}}
        onRegionChange={changeRegion}
        query={query}
        onQueryChange={setQuery}
      />
      <main>
        <div className="hero-band"><section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              Good finds.<br/><span>Great neighbors.</span>
            </h1>
            <p className="hero-tagline">Buy · Sell · Connect Locally</p><p>Give pre-loved things a new beginning, right here in your neighborhood.</p><div className="hero-actions">
            <Link className="button button-primary" href="/sell">
              Sell an Item
              <Icon name="arrow" />
            </Link>
<a className="button button-outline" href="#marketplace">Explore nearby</a></div>
          </div>
          <div className="hero-image">
            <Image
              src="/images/hero-v2.webp"
              alt="A wooden chair, plant, lamp and vintage camera ready for a new home"
              fill
              sizes="(max-width: 639px) 100vw, 55vw"
              preload
            />
          </div>
        </section></div>
        <section
          id="marketplace"
          className="shell marketplace"
          aria-labelledby="listings-title"
        >
          <CategoryNav selected={category} onChange={setCategory} />
          <div className="market-price-filters">
            <label>Min price ({location.country ? priceLabel(location.country) : "local currency"})<input type="number" inputMode="numeric" min="0" max="1000000000000" step="1" value={minPrice} onChange={e=>setMinPrice(e.target.value)} disabled={!location.country}/></label>
            <label>Max price ({location.country ? priceLabel(location.country) : "local currency"})<input type="number" inputMode="numeric" min="0" max="1000000000000" step="1" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} disabled={!location.country}/></label>
            <label className="remove-confirm"><input type="checkbox" checked={availableOnly} onChange={e=>setAvailableOnly(e.target.checked)}/>Available only</label>
            <button className="button button-outline" onClick={resetFilters}>Clear filters</button>
          </div>
          {!location.country && <p className="auth-hint">Choose a country to filter prices in its local currency.</p>}
          {minPrice && maxPrice && Number(minPrice)>Number(maxPrice) && <p role="alert">Minimum price must not exceed maximum price.</p>}
          <div className="section-heading">
            <h2 id="listings-title">Fresh finds nearby</h2>
            <p role="status" aria-live="polite">
              {listings.length} {listings.length === 1 ? "find" : "finds"}
              {favorites.length > 0 && ` · ${favorites.length} saved`}
            </p>
          </div>
          {feedNotice && (
            <p className="feed-notice" role="status">
              {feedNotice}
            </p>
          )}
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
              <p>Try another search, category, country, or region.</p>
              <button className="button button-outline" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>
      <footer className="footer shell">
        <Link href="/" className="wordmark" aria-label="ZUNO home">
          <Brand/>
        </Link>
        <p>A little closer. A little more connected.</p>
        <span>
          {isDemo ? "Sample listings" : "Your neighborhood marketplace"}
        </span>
      </footer>
      <Link className="button button-primary mobile-sell" href="/sell">
        <Icon name="plus" />
        Sell an Item
      </Link>
    </>
  );
}
