import { MessagesWorkspace } from "@/features/messages/workspace";
import { SectionLoading } from "@/components/layout/section-loading";
import { getInboxPage } from "@/features/messages/server/page-data";
import type { Metadata } from "next";
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
  return <MessagesWorkspace entries={entries} now={now}/>;
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
