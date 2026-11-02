import { Brand } from "@/components/ui/brand";
import Link from "next/link";
import { AccountLink } from "@/features/auth/account-link";
import { Icon } from "@/components/ui/icon";
import { LocationSelector } from "@/features/locations/location-selector";
import type { LocationSelection } from "@/features/locations/catalog";

type Props = {
  location: LocationSelection;
  onCountryChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
};
export function Header({
  location,
  onCountryChange,
  onRegionChange,
  query,
  onQueryChange,
}: Props) {
  return (
    <header className="site-header shell">
      <Link prefetch={true} className="wordmark" href="/" aria-label="ZUNO home">
        <Brand/>
      </Link>
      <LocationSelector location={location} onCountryChange={onCountryChange} onRegionChange={onRegionChange}/>
      <form
        className="search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <Icon name="search" />
        <label className="sr-only" htmlFor="search">
          Search second-hand listings
        </label>
        <input
          id="search"
          type="search"
          maxLength={100}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search for your next local find…"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onQueryChange("")}
          >
            <Icon name="close" />
          </button>
        )}
      </form>
      <Link prefetch={true} className="header-saved" href="/account/saved"><Icon name="heart"/>Saved</Link>
      <Link prefetch={true} className="header-saved" href="/messages"><Icon name="chat"/>Messages</Link>
      <Link prefetch={true} className="button button-primary header-sell" href="/sell">Sell</Link>
      <AccountLink />
    </header>
  );
}
