import { Text } from "@/features/language/provider";
import { SectionLoading } from "@/components/layout/section-loading";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { getOwnedListingData } from "@/features/listings/server/owned-data";
import { OwnedListingsGrid } from "@/features/listings/components/owned-listings";
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
      <div className="owned-listings-title-row"><h1><Text>{"Your listings"}</Text></h1><Link className="button button-primary" href="/sell"><Text>{"Sell an Item"}</Text></Link></div>
      {!data?.length ? (
        <p><Text>{"You have no listings yet."}</Text></p>
      ) : (
        <>
          <OwnedListingsGrid items={data} {...options}/>
          <p className="auth-hint"><Text>{"Showing your latest"}</Text>{data.length} {data.length === 1 ? <Text>{"listing"}</Text> : <Text>{"listings"}</Text>}.</p>
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
