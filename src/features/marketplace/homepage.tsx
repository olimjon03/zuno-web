"use client";
import { priceLabel } from "@/features/listings/currency";
import { useMarketplaceFeed } from "@/features/search/client/use-marketplace-feed";
import type { FeedPage } from "@/features/search/types";
import type { FeedFilters } from "@/features/search/types";
import { parseFeedFilters } from "@/features/search/validation";
import type { CountryCode } from "@/features/locations/catalog";
import { Brand } from "@/components/ui/brand";
import Image from "next/image";
import Link from "next/link";
import { useLocation } from "@/features/locations/location-provider";
import { countries, findRegion } from "@/features/locations/catalog";
import { useEffect } from "react";
import { useFavorites } from "@/features/favorites/favorites-provider";
import { Header } from "@/components/layout/header";
import { Icon } from "@/components/ui/icon";
import { CategoryNav } from "@/features/categories/components/category-nav";
import { ListingCard } from "@/features/listings/components/listing-card";
export function Homepage({initialSearch,initialPage,initialError}:{initialSearch:string;initialPage:FeedPage;initialError?:string}) {
  const {filters,update,items:listings,nextCursor,error,issue,changing,loadingMore,loadMore,retry}=useMarketplaceFeed(initialSearch,initialPage,initialError);
  const {category,query,minPrice,maxPrice,availableOnly}=filters;
  const location={country:filters.country,region:filters.region};
  const {setSelection}=useLocation();
  useEffect(()=>{setSelection({country:filters.country,region:filters.region});},[setSelection,filters.country,filters.region]);
  const {favorites,toggleFavorite}=useFavorites();
  function resetFilters(){update(parseFeedFilters(new URLSearchParams()));}
  return (
    <>
      <a className="skip-link" href="#marketplace">
        Skip to listings
      </a>
      <div className="utility-bar"><div className="shell"><span>Buy · Sell · Connect Locally</span><span>{location.region ? findRegion(location.region)?.regionName : location.country ? countries.find(country=>country.code===location.country)?.name : "Choose your local area"}</span></div></div>
      <Header
        location={location}
        onCountryChange={value=>update({country:value as CountryCode|"",region:"",minPrice:"",maxPrice:"",sort:value?filters.sort:"newest"})}
        onRegionChange={region=>update({region})}
        query={query}
        onQueryChange={query=>update({query},true)}
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
          aria-busy={changing||loadingMore}
        >
          <CategoryNav selected={category} onChange={category=>update({category})} />
          <div className="market-price-filters">
            <label>Min price ({location.country ? priceLabel(location.country) : "local currency"})<input type="number" inputMode="numeric" min="0" max="1000000000000" step="1" value={minPrice} onChange={e=>update({minPrice:e.target.value},true)} disabled={!location.country}/></label>
            <label>Max price ({location.country ? priceLabel(location.country) : "local currency"})<input type="number" inputMode="numeric" min="0" max="1000000000000" step="1" value={maxPrice} onChange={e=>update({maxPrice:e.target.value},true)} disabled={!location.country}/></label>
            <label className="remove-confirm"><input type="checkbox" checked={availableOnly} onChange={e=>update({availableOnly:e.target.checked})}/>Available only</label>
            <label className="feed-sort">Sort by<select aria-label="Sort by" value={filters.sort} onChange={event=>update({sort:event.target.value as FeedFilters["sort"]})}><option value="newest">Newest first</option><option value="price-asc" disabled={!location.country}>Price: low to high</option><option value="price-desc" disabled={!location.country}>Price: high to low</option></select></label>
            <button className="button button-outline" onClick={resetFilters}>Clear filters</button>
          </div>
          {!location.country && <p className="auth-hint">Choose a country to filter and sort prices in its local currency.</p>}
          {issue && <p className="auth-error" role="alert">{issue}</p>}
          <div className="section-heading">
            <h2 id="listings-title">Fresh finds nearby</h2>
            <p role="status" aria-live="polite">
              {changing ? "Updating results…" : issue ? "Check filters" : `${listings.length} ${listings.length === 1 ? "find" : "finds"} shown`}
              {favorites.length > 0 && ` · ${favorites.length} saved`}
            </p>
          </div>
          {changing && <p className="feed-notice" role="status">Updating nearby listings…</p>}
          {error && <div className="feed-error" role="alert"><p>{error}</p><button className="button button-outline" onClick={retry} disabled={changing}>Retry search</button></div>}
          {!issue && listings.length > 0 ? (
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
          ) : !issue && !changing && !error ? (
            <div className="empty-state">
              <Icon name="search" />
              <h3>No finds just yet</h3>
              <p>Try another search, category, price, country, or region.</p>
              <button className="button button-outline" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          ) : null}
          {!issue && nextCursor && <div className="feed-pagination"><button className="button button-primary" onClick={loadMore} disabled={changing||loadingMore}>{loadingMore ? "Loading more…" : "Load more"}</button></div>}
          {!issue && !changing && !error && listings.length>0 && !nextCursor && <p className="feed-end">You’ve reached the end of these results.</p>}
        </section>
      </main>
      <footer className="footer shell">
        <Link href="/" className="wordmark" aria-label="ZUNO home">
          <Brand/>
        </Link>
        <p>A little closer. A little more connected.</p>
        <span>
          Your neighborhood marketplace
        </span>
      </footer>
      <Link className="button button-primary mobile-sell" href="/sell">
        <Icon name="plus" />
        Sell an Item
      </Link>
    </>
  );
}
