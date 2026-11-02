import { SectionLoading } from "@/components/layout/section-loading";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { getOwnedListingData } from "@/features/listings/server/owned-data";
import {
  ManageListing,
} from "@/features/listings/components/manage-listing";
export const metadata: Metadata = {
  title: "Your listings | ZUNO",
  robots: { index: false, follow: false },
};
async function OwnedListings() {
  "use cache: private";
  // Browser/session-only reuse; never a shared production server cache.
  cacheLife({ stale: 30 });
  const { items: data, options } = await getOwnedListingData();
  return (
    <main className="shell manage-page owned-listings-page">
      <header className="detail-header owned-listings-header">
        <Link className="wordmark" href="/">
          <Brand/>
        </Link><BackHomeNav/></header>
      <div className="owned-listings-title-row"><h1>Your listings</h1><Link className="button button-primary" href="/sell">Sell an Item</Link></div>
      {!data?.length ? (
        <p>You have no listings yet.</p>
      ) : (
        <>
          {data.map((item) => (
            <ManageListing key={item.id} item={item} {...options} />
          ))}
          <p className="auth-hint">Showing your latest {data.length} {data.length === 1 ? "listing" : "listings"}.</p>
        </>
      )}
    </main>
  );
}
export default function Page() {
  return (
    <Suspense
      fallback={
        <SectionLoading message="Loading your listings…"/>
      }
    >
      <OwnedListings />
    </Suspense>
  );
}
