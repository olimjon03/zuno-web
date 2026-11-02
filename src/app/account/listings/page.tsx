import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
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
  await connection();
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
        "id,title,description,price,condition,category_id,neighborhood_id,status",
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
          ZUNO
        </Link>
        <Link href="/account">Your account</Link>
      </header>
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
        <main className="shell detail-message" role="status">
          Loading your listings…
        </main>
      }
    >
      <OwnedListings />
    </Suspense>
  );
}
