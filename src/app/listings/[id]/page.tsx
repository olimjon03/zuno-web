import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sampleListings } from "@/features/listings/sample-listings";
import { sampleDetails } from "@/features/listings/sample-details";
import { ListingDetail } from "@/features/listings/components/listing-detail";

export function generateStaticParams() {
  return sampleListings.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = sampleListings.find((item) => item.id === id);
  return {
    title: listing ? `${listing.title} | ZUNO` : "Listing not found | ZUNO",
    description: listing
      ? `Sample listing in ${listing.neighborhood}, Seoul. ${listing.title} on ZUNO.`
      : "This listing could not be found.",
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = sampleListings.find((item) => item.id === id);
  if (!listing || !sampleDetails[id]) notFound();
  return <ListingDetail listing={listing} details={sampleDetails[id]} />;
}
