import { Brand } from "@/components/ui/brand";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSavedListings } from "@/features/listings/server/data";
import { SavedItems } from "@/features/favorites/saved-items";
export const metadata: Metadata = {
  title: "Saved items | ZUNO",
  robots: { index: false, follow: false },
};
async function Saved() {
  await connection();
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/login?notice=session");
  const listings = await getSavedListings();
  return (
    <main className="shell manage-page">
      <header className="detail-header">
        <Link href="/" className="wordmark">
          <Brand/>
        </Link>
        <Link href="/account">Your account</Link>
      </header>
      <h1>Saved items</h1>
      <p>Your saved finds, ready when you are. Removed listings are hidden.</p>
      <SavedItems listings={listings} />
    </main>
  );
}
export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="shell detail-message" role="status">
          Loading saved items…
        </main>
      }
    >
      <Saved />
    </Suspense>
  );
}
