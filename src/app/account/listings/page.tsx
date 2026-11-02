import { SectionLoading } from "@/components/layout/section-loading";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingOptions } from "@/features/listings/server/data";
import {
  ManageListing,
  type OwnedListing,
} from "@/features/listings/components/manage-listing";
export const metadata: Metadata = {
  title: "Your listings | ZUNO",
  robots: { index: false, follow: false },
};
async function OwnedListings() {
  "use cache: private";
  // Browser/session-only reuse; never a shared production server cache.
  cacheLife({ stale: 30 });
  const db = await createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user) redirect("/login?notice=session");
  const [{ data, error }, options] = await Promise.all([
    db
      .from("listings")
      .select(
        "id,title,description,price,condition,category_id,neighborhood_id,status,photos:listing_images(id,sort_order)",
      )
      .eq("seller_id", user.id)
      .neq("status", "removed")
      .order("created_at", { ascending: false })
      .limit(100),
    getListingOptions(),
  ]);
  if (error) throw new Error("Your listings are temporarily unavailable.");
  return (
    <main className="shell manage-page">
      <header className="detail-header">
        <Link className="wordmark" href="/">
          <Brand/>
        </Link><BackHomeNav/></header>
      <h1>Your listings</h1>
      <p>
        Edit your items, mark them sold or remove them from the marketplace.
      </p>
      <p>
        <Link className="button button-primary" href="/sell">
          Sell an Item
        </Link>
      </p>
      {!data?.length ? (
        <p>You have no listings yet.</p>
      ) : (
        <>
          <p className="auth-hint">
            Showing your latest {data.length} listings.
          </p>
          {(data as OwnedListing[]).map((item) => (
            <ManageListing key={item.id} item={item} {...options} />
          ))}
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
