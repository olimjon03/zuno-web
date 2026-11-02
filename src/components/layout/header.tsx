import Link from "next/link";
import { AccountLink } from "@/features/auth/account-link";
import { Icon } from "@/components/ui/icon";
import {
  neighborhoods,
  type Neighborhood,
} from "@/features/listings/sample-listings";

type Props = {
  neighborhood: Neighborhood;
  onNeighborhoodChange: (value: Neighborhood) => void;
  query: string;
  onQueryChange: (value: string) => void;
};
export function Header({
  neighborhood,
  onNeighborhoodChange,
  query,
  onQueryChange,
}: Props) {
  return (
    <header className="site-header shell">
      <Link className="wordmark" href="/" aria-label="ZUNO home">
        ZUNO<span className="brand-dot">.</span>
      </Link>
      <div className="location-control">
        <Icon name="pin" />
        <label className="sr-only" htmlFor="neighborhood">
          Choose a neighborhood
        </label>
        <select
          id="neighborhood"
          value={neighborhood}
          onChange={(event) =>
            onNeighborhoodChange(event.target.value as Neighborhood)
          }
        >
          {neighborhoods.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
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
      <AccountLink />
    </header>
  );
}
