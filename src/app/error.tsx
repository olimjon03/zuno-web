"use client";
import { BackHomeNav } from "@/components/layout/back-home-nav";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="shell detail-message"><BackHomeNav/><h1>We couldn’t load this page</h1><p>Please try again shortly.</p><button className="button button-primary" onClick={reset}>Try again</button></main>;
}
