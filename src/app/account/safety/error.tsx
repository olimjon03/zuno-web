"use client";
import { Text } from "@/features/language/provider";

import { BackHomeNav } from "@/components/layout/back-home-nav";
import Link from "next/link";
export default function AccountError({ reset }: { reset: () => void }) {
  return (
    <main className="shell detail-message"><BackHomeNav/>
      <h1><Text>{"This page is temporarily unavailable"}</Text></h1>
      <p><Text>{"Please try again in a moment."}</Text></p>
      <button className="button button-primary" onClick={reset}>
        <Text>{"Try again"}</Text></button>
      <Link className="button button-outline" href="/">
        <Text>{"Back to marketplace"}</Text></Link>
    </main>
  );
}
