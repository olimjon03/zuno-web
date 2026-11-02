import { SectionLoading } from "@/components/layout/section-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { sampleListings } from "@/features/listings/sample-listings";
import { sampleDetails } from "@/features/listings/sample-details";
import { ListingDetail } from "@/features/listings/components/listing-detail";
import { getLiveListing } from "@/features/listings/server/data";
import { isUuid } from "@/features/listings/validation";

export function generateStaticParams() {
  return sampleListings.map(({ id }) => ({ id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sample = sampleListings.find((item) => item.id === id);
  if (sample)
    return {
      title: `${sample.title} | ZUNO`,
      description: `Sample listing in ${sample.neighborhood}, Seoul.`,
    };
  return {
    title: "Local find | ZUNO",
    description: "Discover a local second-hand find on ZUNO.",
  };
}
async function LiveListing({ id }: { id: string }) {
  await connection();
  const result = await getLiveListing(id);
  if (!result) notFound();
  return <ListingDetail {...result} />;
}
export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = sampleListings.find((item) => item.id === id);
  if (listing && sampleDetails[id])
    return <ListingDetail listing={listing} details={sampleDetails[id]} />;
  if (!isUuid(id)) notFound();
  return (
    <Suspense
      fallback={
        <SectionLoading message="Loading this local find…"/>
      }
    >
      <LiveListing id={id} />
    </Suspense>
  );
}
