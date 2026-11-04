import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { SectionLoading } from "@/components/layout/section-loading";
import { Brand } from "@/components/ui/brand";
import { getExploreFeature } from "@/features/account/explore-catalog";
import { ExploreFeatureContent } from "@/features/account/server/explore-page";
import { Text } from "@/features/language/provider";
import "./explore.css";

export const metadata = { title: "Explore | ZUNO", robots: { index: false, follow: false } };

async function Feature({ params }: { params: Promise<{ feature: string }> }) {
  const { feature } = await params;
  const entry = getExploreFeature(feature);
  if (!entry) notFound();
  return <main className="shell explore-page">
    <header className="detail-header">
      <Link href="/" className="wordmark" aria-label="ZUNO home"><Brand /></Link>
      <BackHomeNav />
    </header>
    <div className="explore-page-content">
      <h1><Text>{entry.title}</Text></h1>
      <p><Text>{entry.description}</Text></p>
      <Suspense fallback={<SectionLoading message="Loading…" />}>
        <ExploreFeatureContent feature={feature} />
      </Suspense>
    </div>
  </main>;
}

export default function Page({ params }: { params: Promise<{ feature: string }> }) {
  return <Suspense fallback={<SectionLoading message="Loading…" />}><Feature params={params} /></Suspense>;
}
