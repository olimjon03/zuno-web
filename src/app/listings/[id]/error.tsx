"use client";
import Link from "next/link";
export default function ListingError({ reset }: { reset: () => void }) {
  return (
    <main className="shell detail-message">
      <h1>We couldn’t load this find</h1>
      <p>Please try again, or head back to the marketplace.</p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
      <Link className="button button-outline" href="/">
        Back to marketplace
      </Link>
    </main>
  );
}
