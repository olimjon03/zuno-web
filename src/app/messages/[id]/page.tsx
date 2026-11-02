import { SectionLoading } from "@/components/layout/section-loading";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/listings/validation";
import { readMessages } from "@/features/messages/actions";
import { SafetyControls } from "@/features/moderation/safety-controls";
import { readSafetyState } from "@/features/moderation/actions";
import { Chat } from "@/features/messages/chat";
export const metadata: Metadata = {
  title: "Conversation | ZUNO",
  robots: { index: false, follow: false },
};
async function Conversation({ id }: { id: string }) {
  await connection();
  const db = await createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user) redirect("/login?notice=session");
  const { data: c, error } = await db
    .from("conversations")
    .select("id,listing_id,listing_title,buyer_id,seller_id,buyer_name,seller_name")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Conversation unavailable.");
  if (!c) notFound();
  const otherId=c.buyer_id===user.id ? c.seller_id : c.buyer_id;
  const [result,safety]=await Promise.all([readMessages(id),readSafetyState(otherId)]);
  if (!result.messages) throw new Error("Messages unavailable.");
  return (
    <main className="shell manage-page">
      <header className="detail-header">
        <Link href="/" className="wordmark">
          <Brand/>
        </Link><BackHomeNav/></header>
      <h1>{c.listing_title}</h1>
      <p>Chat with <Link href={`/neighbors/${c.buyer_id === user.id ? c.seller_id : c.buyer_id}`}>{c.buyer_id === user.id ? c.seller_name : c.buyer_name} · View profile</Link></p>
      {c.listing_id && (
        <p>
          <Link href={`/listings/${c.listing_id}`}>View item</Link> · The item
          may no longer be available.
        </p>
      )}
      <Chat
        key={`${id}-${user.id}`}
        conversationId={id}
        userId={user.id}
        initialMessages={result.messages}
        canMessage={safety.state?.canMessage ?? true}
      />
      <SafetyControls userId={otherId} name={c.buyer_id===user.id ? c.seller_name : c.buyer_name} listingId={c.listing_id ?? undefined}/>
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
