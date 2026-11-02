import { Suspense } from "react";
import { connection } from "next/server";
import { Homepage } from "@/features/marketplace/homepage";
import { getLiveListings } from "@/features/listings/server/data";

async function MarketplaceFeed() {
  await connection();
  let listings: Awaited<ReturnType<typeof getLiveListings>> = [];
  let unavailable = false;
  try {
    listings = await getLiveListings();
  } catch {
    unavailable = true;
  }
  return listings?.length ? (
    <Homepage initialListings={listings} isDemo={false} />
  ) : (
    <Homepage
      feedNotice={
        unavailable
          ? "Live listings are temporarily unavailable. Showing sample items."
          : "Sample items to explore. Be the first to post a local find."
      }
    />
  );
}
export default function Home() {
  return (
    <Suspense
      fallback={
        <Homepage feedNotice="Loading nearby listings… Sample items are shown below." />
      }
    >
      <MarketplaceFeed />
    </Suspense>
  );
}
