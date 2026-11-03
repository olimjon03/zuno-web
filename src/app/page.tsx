import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { SectionLoading } from "@/components/layout/section-loading";
import { Homepage } from "@/features/marketplace/homepage";
import { getMarketplaceHome } from "@/features/search/server/page-data";
import type { RawFeedSearchParameters } from "@/features/search/types";
type SearchParams=Promise<RawFeedSearchParameters>;
async function MarketplaceFeed({searchParams}:{searchParams:SearchParams}) {
  "use cache: private";
  cacheLife({ stale: 30 });

 return <Homepage {...await getMarketplaceHome(await searchParams)}/>;
}
export default function Home({searchParams}:{searchParams:SearchParams}) {
 return <Suspense fallback={<SectionLoading message="Loading nearby listings…"/>}><MarketplaceFeed searchParams={searchParams}/></Suspense>;
}
