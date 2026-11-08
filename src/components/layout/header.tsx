"use client";
import { useEffect, useRef, useState } from "react";
import { Text, useT } from "@/features/language/provider";
import { HeaderTools } from "./header-tools";
import { ExploreLauncher } from "@/features/account/explore-launcher";
import "./header-icons.css";
import { Brand } from "@/components/ui/brand";
import Link from "next/link";
import { AccountLink } from "@/features/auth/account-link";
import { Icon } from "@/components/ui/icon";
import { LocationSelector } from "@/features/locations/location-selector";
import type { LocationSelection } from "@/features/locations/catalog";

type Props = {
  location: LocationSelection;
  onDistrictChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
};
export function Header({
  location,
  onDistrictChange,
  onRegionChange,
  query,
  onQueryChange,
}: Props) {
  const t = useT();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (mobileSearchOpen) searchInput.current?.focus();
  }, [mobileSearchOpen]);
  function closeMobileSearch() {
    setMobileSearchOpen(false);
    searchToggle.current?.focus();
  }
  return (
    <header className="site-header shell">
      <div className="header-brand-group">
      <ExploreLauncher align="start"/>
      <Link prefetch={true} className="wordmark" href="/" aria-label={t("ZUNO home")}>
        <Brand/>
      </Link>
      </div>
      <LocationSelector location={location} onRegionChange={onRegionChange} onDistrictChange={onDistrictChange}/>
      <form
        id="header-search"
        className={`search${mobileSearchOpen ? " mobile-search-open" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape" && mobileSearchOpen) {
            event.preventDefault();
            closeMobileSearch();
          }
        }}
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <Icon name="search" />
        <label className="sr-only" htmlFor="search">
          <Text>{"Search second-hand listings"}</Text></label>
        <input
          ref={searchInput}
          id="search"
          type="search"
          maxLength={100}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("Search for your next local find…")}
        />
        {query && (
          <button
            type="button"
            aria-label={t("Clear search")}
            onClick={() => onQueryChange("")}
          >
            <Icon name="close" />
          </button>
        )}
        <button
          className="mobile-search-close"
          type="button"
          aria-label={t("Close")}
          onClick={closeMobileSearch}
        >
          <Icon name="close" />
        </button>
      </form>
      <Link prefetch={true} className="header-saved" href="/account/saved"><Icon name="bookmark"/><Text>{"Saved"}</Text></Link>
      <Link prefetch={true} className="header-saved" href="/messages"><Icon name="chat"/><Text>{"Messages"}</Text></Link>
      <HeaderTools/>
      <Link prefetch={true} className="button button-primary header-sell" href="/sell"><Text>{"Sell"}</Text></Link>
      <button
        ref={searchToggle}
        type="button"
        className="header-icon-button mobile-search-toggle"
        aria-label={t("Search second-hand listings")}
        aria-expanded={mobileSearchOpen}
        aria-controls="header-search"
        onClick={() => mobileSearchOpen ? closeMobileSearch() : setMobileSearchOpen(true)}
      >
        <Icon name="search" />
      </button>
      <AccountLink />
    </header>
  );
}
