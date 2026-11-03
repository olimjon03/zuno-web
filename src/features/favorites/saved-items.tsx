"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListingCard } from "@/features/listings/components/listing-card";
import type { Listing } from "@/features/listings/types";
import { useFavorites } from "./favorites-provider";
export function SavedItems({ listings }: { listings: Listing[] }) {
  const { favorites, ready, loadError, retryFavorites, toggleFavorite } = useFavorites();
  const router = useRouter();
  useEffect(() => {
    // Another tab may have saved a listing absent from this server snapshot.
    const refresh = () => { if (!document.hidden) router.refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
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
