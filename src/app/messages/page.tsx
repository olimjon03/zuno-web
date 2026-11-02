import { SectionLoading } from "@/components/layout/section-loading";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import { InboxLiveRefresh } from "@/features/messages/inbox-live-refresh";
import { UnreadBadge } from "@/features/messages/unread-provider";
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
  const { data, error } = await db
    .from("conversations")
    .select("id,listing_title,buyer_id,buyer_name,seller_name,last_message_at")
    .order("last_message_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Messages are temporarily unavailable.");
  return (
    <main className="shell manage-page">
      <InboxLiveRefresh />
      <header className="detail-header">
        <Link href="/" className="wordmark">
          <Brand/>
        </Link><BackHomeNav/></header>
      <h1>Messages</h1>
      <p>
        Your latest 100 conversations. Open a conversation to see new messages.
      </p>
      {!data?.length ? (
        <p>No conversations yet. Contact a seller from an item page.</p>
      ) : (
        <ul className="conversation-list">
          {data.map((c) => (
            <li key={c.id}>
              <Link href={`/messages/${c.id}`}>
                <strong>
                  {c.listing_title} <UnreadBadge conversationId={c.id} />
                </strong>
                <span>
                  {c.buyer_id === user.id ? c.seller_name : c.buyer_name}
                </span>
                <time dateTime={c.last_message_at}>
                  {new Date(c.last_message_at).toLocaleDateString("en-GB", {
                    timeZone: "Asia/Seoul",
                  })}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
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
