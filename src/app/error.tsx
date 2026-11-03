"use client";
import { Text } from "@/features/language/provider";

import { BackHomeNav } from "@/components/layout/back-home-nav";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="shell detail-message"><BackHomeNav/><h1><Text>{"We couldn’t load this page"}</Text></h1><p><Text>{"Please try again shortly."}</Text></p><button className="button button-primary" onClick={reset}><Text>{"Try again"}</Text></button></main>;
}
