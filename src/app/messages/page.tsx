import { SectionLoading } from "@/components/layout/section-loading";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import { InboxLiveRefresh } from "@/features/messages/inbox-live-refresh";
import { InboxList } from "@/features/messages/inbox-list";
import { getInboxPage } from "@/features/messages/server/page-data";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
export const metadata: Metadata = {
  title: "Messages | ZUNO",
  robots: { index: false, follow: false },
};
async function Inbox() {
  "use cache: private";
  cacheLife({ stale: 30 });

  const {entries,now} = await getInboxPage();
  return (
    <main className="shell inbox-page">
      <InboxLiveRefresh />
      <header className="inbox-header">
        <Link prefetch={true} href="/" className="wordmark">
          <Brand/>
        </Link><BackHomeNav/></header>
      <h1>Messages</h1>
      <InboxList entries={entries} now={now}/>
    </main>
  );
}
export default function Page() {
  return (
    <Suspense
      fallback={
        <SectionLoading message="Loading messages…"/>
      }
    >
      <Inbox />
    </Suspense>
  );
}
