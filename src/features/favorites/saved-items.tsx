"use client";
import { ListingCard } from "@/features/listings/components/listing-card";
import type { Listing } from "@/features/listings/types";
import { useFavorites } from "./favorites-provider";
export function SavedItems({ listings }: { listings: Listing[] }) {
  const { favorites, ready, loadError, retryFavorites, toggleFavorite } = useFavorites();
  if (loadError) return <div className="empty-state"><p role="alert">{loadError}</p><button className="button button-primary" onClick={retryFavorites}>Retry saved items</button></div>;
  if (!ready) return <p role="status">Loading saved items…</p>;
  const items = listings.filter((item) => favorites.includes(item.id));
  return items.length ? (
    <div className="listing-grid">
      {items.map((item) => (
        <ListingCard
          key={item.id}
          listing={item}
          favorite
          onToggleFavorite={() => toggleFavorite(item.id)}
        />
      ))}
    </div>
  ) : (
    <p>
      You have no saved items. Tap the heart on a marketplace listing to save
      it.
    </p>
  );
}
