"use client";
import { Text } from "@/features/language/provider";

import { BackHomeNav } from "@/components/layout/back-home-nav";
import Link from "next/link";
export default function ListingError({ reset }: { reset: () => void }) {
  return (
    <main className="shell detail-message"><BackHomeNav/>
      <h1><Text>{"We couldn’t load this find"}</Text></h1>
      <p><Text>{"Please try again, or head back to the marketplace."}</Text></p>
      <button className="button button-primary" onClick={reset}>
        <Text>{"Try again"}</Text></button>
      <Link className="button button-outline" href="/">
        <Text>{"Back to marketplace"}</Text></Link>
    </main>
  );
}
