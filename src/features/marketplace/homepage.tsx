"use client";
import { useCountry } from "@/features/locations/country-provider";
import { Text, useT } from "@/features/language/provider";

import { priceLabel } from "@/features/listings/currency";
import { useMarketplaceFeed } from "@/features/search/client/use-marketplace-feed";
import type { FeedPage } from "@/features/search/types";
import type { FeedFilters } from "@/features/search/types";
import { parseFeedFilters } from "@/features/search/validation";
import { Brand } from "@/components/ui/brand";
import "./compact-marketplace.css";
import "./soft-mint.css";
import { FloatingSellButton } from "./floating-sell-button";
import { HeroCarousel } from "./hero-carousel";
import Link from "next/link";
import { useLocation } from "@/features/locations/location-provider";
import { countries, findRegion } from "@/features/locations/catalog";
import { useEffect, useState, useId } from "react";
import { useFavorites } from "@/features/favorites/favorites-provider";
import { Header } from "@/components/layout/header";
import { Icon } from "@/components/ui/icon";
import { CategoryNav } from "@/features/categories/components/category-nav";
import { ListingCard } from "@/features/listings/components/listing-card";
export function Homepage({initialSearch,initialPage,initialError}:{initialSearch:string;initialPage:FeedPage;initialError?:string}) {
  const t = useT();
  const [shuffle, setShuffle] = useState(true);
  const [pricesOpen, setPricesOpen] = useState(true);
  const priceId = useId();
  const filterPanelId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const country=useCountry();
  const {filters,update,items,shuffledItems,nextCursor,error,issue,changing,loadingMore,loadMore,retry}=useMarketplaceFeed(initialSearch,initialPage,initialError);
  const sort = filters.sort === "newest" && shuffle ? "shuffle" : filters.sort;
  const listings = sort === "shuffle" ? shuffledItems : items;
  const {category,query,minPrice,maxPrice,availableOnly}=filters;
  const activeFilterCount = Number(Boolean(minPrice)) + Number(Boolean(maxPrice)) + Number(availableOnly) + Number(sort !== "shuffle");
  const location={country:country||filters.country,region:filters.region,district:filters.district};
  const {setSelection}=useLocation();
  useEffect(()=>{if(window.location.pathname==="/"&&country&&filters.country!==country)update({country,region:"",district:undefined,minPrice:"",maxPrice:""},true);},[country,filters.country,update]);
  useEffect(()=>{setSelection({country:filters.country,region:filters.region});},[setSelection,filters.country,filters.region]);
  const {favorites,toggleFavorite}=useFavorites();
  function resetFilters(){setShuffle(true);update({...parseFeedFilters(new URLSearchParams()),country:country||filters.country});}
  return (
    <div className="zuno-homepage">
      <a className="skip-link" href="#marketplace">
        <Text>{"Skip to listings"}</Text></a>
      <div className="utility-bar"><div className="shell"><span><Text>{"Buy · Sell · Connect Locally"}</Text></span><span>{location.region ? t(findRegion(location.region)?.regionName ?? "") : location.country ? t(countries.find(country=>country.code===location.country)?.name ?? "") : <Text>{"Choose your local area"}</Text>}</span></div></div>
      <Header
        location={location}
        onRegionChange={region=>update({region,district:undefined})}
        onDistrictChange={district=>update({district})}
        query={query}
        onQueryChange={query=>update({query},true)}
      />
      <main>
        <HeroCarousel/>
        <section
          id="marketplace"
          className="shell marketplace"
          aria-labelledby="listings-title"
          aria-busy={changing||loadingMore}
        >
          <div className="market-category-toolbar">
            <button type="button" className="desktop-filter-toggle" aria-expanded={filtersOpen} aria-controls={filterPanelId} onClick={()=>setFiltersOpen(value=>!value)}><Icon name="sliders"/><Text>{"Filters"}</Text>{activeFilterCount>0&&<span className="price-filter-count">{activeFilterCount}</span>}</button>
            <CategoryNav selected={category} onChange={category=>update({category})} />
          </div>
          <div id={filterPanelId} role="region" aria-label={t("Filters")} className="market-price-filters compact-market-filters" data-prices-open={pricesOpen} data-desktop-open={filtersOpen}>
            <button type="button" className="price-filter-toggle" aria-expanded={pricesOpen} aria-controls={priceId} onClick={()=>setPricesOpen(value=>!value)}><Icon name="sliders"/><Text>{"Filters"}</Text>{(minPrice||maxPrice)&&<span className="price-filter-count">{Number(Boolean(minPrice))+Number(Boolean(maxPrice))}</span>}</button>
            <div id={priceId} className="compact-price-range">
              <label><span><Text>{"Min price ("}</Text>{location.country ? priceLabel(location.country) : <Text>{"local currency"}</Text>})</span><input type="number" inputMode="numeric" min="0" max="1000000000000" step="1" value={minPrice} onChange={e=>update({minPrice:e.target.value},true)} disabled={!location.country}/></label>
              <span className="price-range-dash" aria-hidden="true">–</span>
              <label><span><Text>{"Max price ("}</Text>{location.country ? priceLabel(location.country) : <Text>{"local currency"}</Text>})</span><input type="number" inputMode="numeric" min="0" max="1000000000000" step="1" value={maxPrice} onChange={e=>update({maxPrice:e.target.value},true)} disabled={!location.country}/></label>
            </div>
            <label className="remove-confirm"><input type="checkbox" checked={availableOnly} onChange={e=>update({availableOnly:e.target.checked})}/><Text>{"Available only"}</Text></label>
            <label className="feed-sort"><span className="sr-only"><Text>{"Sort by"}</Text></span><select aria-label={t("Sort by")} value={sort} onChange={event=>{
              const value=event.target.value;
              setShuffle(value==="shuffle");
              update({sort:value==="shuffle" ? "newest" : value as FeedFilters["sort"]});
            }}><option value="shuffle"><Text>{"Shuffled"}</Text></option><option value="newest"><Text>{"Newest first"}</Text></option><option value="price-asc" disabled={!location.country}><Text>{"Price: low to high"}</Text></option><option value="price-desc" disabled={!location.country}><Text>{"Price: high to low"}</Text></option></select></label>
            <button type="button" className="filter-clear" aria-label={t("Clear filters")} title={t("Clear filters")} onClick={resetFilters}><Icon name="close"/><span><Text>{"Clear filters"}</Text></span></button>
            {!location.country && <p className="auth-hint filter-country-hint"><Text>{"Choose a country to filter and sort prices in its local currency."}</Text></p>}
          </div>
          {issue && <p className="auth-error" role="alert"><Text>{issue}</Text></p>}
          <div className="section-heading">
            <h2 id="listings-title"><Text>{"Fresh finds nearby"}</Text></h2>
            <p role="status" aria-live="polite">
              {changing ? <Text>{"Updating results…"}</Text> : issue ? <Text>{"Check filters"}</Text> : t(listings.length === 1 ? "{count} find shown" : "{count} finds shown", { count: listings.length })}
              {favorites.length > 0 && ` · ${t("{count} saved", { count: favorites.length })}`}
            </p>
          </div>
          {changing && <p className="feed-notice" role="status"><Text>{"Updating nearby listings…"}</Text></p>}
          {error && <div className="feed-error" role="alert"><p><Text>{error}</Text></p><button className="button button-outline" onClick={retry} disabled={changing}><Text>{"Retry search"}</Text></button></div>}
          {!issue && listings.length > 0 ? (
            <div className="listing-grid">
              {listings.filter(listing=>!country||listing.countryCode===country).map((listing) => (
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
              <h3><Text>{"No finds just yet"}</Text></h3>
              <p><Text>{"Try another search, category, price, country, or region."}</Text></p>
              <button className="button button-outline" onClick={resetFilters}>
                <Text>{"Clear filters"}</Text></button>
            </div>
          ) : null}
          {!issue && nextCursor && <div className="feed-pagination"><button className="button button-primary" onClick={loadMore} disabled={changing||loadingMore}>{loadingMore ? <Text>{"Loading more…"}</Text> : <Text>{"Load more"}</Text>}</button></div>}
          {!issue && !changing && !error && listings.length>0 && !nextCursor && <p className="feed-end"><Text>{"You’ve reached the end of these results."}</Text></p>}
        </section>
      </main>
      <footer className="footer shell">
        <Link href="/" className="wordmark" aria-label={t("ZUNO home")}>
          <Brand/>
        </Link>
        <p><Text>{"A little closer. A little more connected."}</Text></p>
        <span>
          <Text>{"Your neighborhood marketplace"}</Text></span>
        <Link href="/help#zuno-assistant"><Text>{"ZUNO Assistant"}</Text></Link>
      </footer>
      <FloatingSellButton/>
      <Link className="button button-primary mobile-sell" href="/sell">
        <Icon name="plus" />
        <Text>{"Sell an Item"}</Text></Link>
    </div>
  );
}
