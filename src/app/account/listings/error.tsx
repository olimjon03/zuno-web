"use client";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import Link from "next/link";
export default function ListingsError({ reset }: { reset: () => void }) {
  return (
    <main className="shell detail-message"><BackHomeNav/>
      <h1>Your listings are temporarily unavailable</h1>
      <p>Please try again in a moment.</p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
      <Link className="button button-outline" href="/">
        Back to marketplace
      </Link>
    </main>
  );
}
