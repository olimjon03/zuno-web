import { getConversationPage } from "@/features/messages/server/page-data";
import { SectionLoading } from "@/components/layout/section-loading";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { isUuid } from "@/features/listings/validation";
import { SafetyControls } from "@/features/moderation/safety-controls";
import { Chat } from "@/features/messages/chat";
export const metadata: Metadata = {
  title: "Conversation | ZUNO",
  robots: { index: false, follow: false },
};
async function Conversation({ id }: { id: string }) {
  await connection();
  const {c, userId, otherId, messages, canMessage} = await getConversationPage(id);
  return (
    <main className="shell manage-page">
      <header className="detail-header">
        <Link href="/" className="wordmark">
          <Brand/>
        </Link><BackHomeNav/></header>
      <h1>{c.listing_title}</h1>
      <p>Chat with <Link href={`/neighbors/${c.buyer_id === userId ? c.seller_id : c.buyer_id}`}>{c.buyer_id === userId ? c.seller_name : c.buyer_name} · View profile</Link></p>
      {c.listing_id && (
        <p>
          <Link href={`/listings/${c.listing_id}`}>View item</Link> · The item
          may no longer be available.
        </p>
      )}
      <Chat
        key={`${id}-${userId}`}
        conversationId={id}
        userId={userId}
        initialMessages={messages}
        canMessage={canMessage}
      />
      <SafetyControls userId={otherId} name={c.buyer_id===userId ? c.seller_name : c.buyer_name} listingId={c.listing_id ?? undefined}/>
    </main>
  );
}
async function ConversationRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  return <Conversation id={id} />;
}
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <SectionLoading message="Loading conversation…"/>
      }
    >
      <ConversationRoute params={params} />
    </Suspense>
  );
}
