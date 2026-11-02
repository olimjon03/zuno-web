"use client";
import { ListingCard } from "@/features/listings/components/listing-card";
import type { Listing } from "@/features/listings/types";
import { useFavorites } from "@/features/favorites/favorites-provider";
export function ProfileListings({ listings }: { listings: Listing[] }) {
 const {favorites,toggleFavorite}=useFavorites();
 return listings.length ? <div className="listing-grid">{listings.map(listing=><ListingCard key={listing.id} listing={listing} favorite={favorites.includes(listing.id)} onToggleFavorite={()=>toggleFavorite(listing.id)}/>)}</div> : <p className="empty-state">No active listings right now.</p>;
}
