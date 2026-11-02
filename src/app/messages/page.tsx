import { SectionLoading } from "@/components/layout/section-loading";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import { InboxLiveRefresh } from "@/features/messages/inbox-live-refresh";
import { InboxList } from "@/features/messages/inbox-list";
import { getInboxSnapshot } from "@/features/messages/inbox-data";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = {
  title: "Messages | ZUNO",
  robots: { index: false, follow: false },
};
async function Inbox() {
  await connection();
  const db = await createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user) redirect("/login?notice=session");
  const {entries,now} = await getInboxSnapshot(db,user.id);
  return (
    <main className="shell inbox-page">
      <InboxLiveRefresh />
      <header className="inbox-header">
        <Link href="/" className="wordmark">
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
