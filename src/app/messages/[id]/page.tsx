import { Text } from "@/features/language/provider";
import Image from "next/image";
import { MessagesWorkspace } from "@/features/messages/workspace";
import { PersonAvatar } from "@/features/messages/person-avatar";
import { MessageIcon } from "@/features/messages/message-icon";
import { Icon } from "@/components/ui/icon";
import { formatMoney } from "@/features/listings/currency";
import { getConversationPage } from "@/features/messages/server/page-data";
import { SectionLoading } from "@/components/layout/section-loading";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { isUuid } from "@/features/listings/validation";
import { SafetyControls } from "@/features/moderation/safety-controls";
import { ConversationTradePanel } from "@/features/messages/server/trade-panel";
import { Chat } from "@/features/messages/chat";
export const metadata: Metadata = {
  title: "Conversation | ZUNO",
  robots: { index: false, follow: false },
};
async function Conversation({ id }: { id: string }) {
  await connection();
  const data = await getConversationPage(id);
  return <MessagesWorkspace entries={data.inbox.entries} now={data.inbox.now} activeId={id}>
    <header className="conversation-heading">
      <Link href="/messages" className="conversation-back message-icon-button" aria-label="Back to messages"><Icon name="arrow"/></Link>
      <Link href={`/neighbors/${data.person.id}`} className="conversation-person"><PersonAvatar name={data.person.name} path={data.person.avatarPath}/><span><h2>{data.person.name}</h2><small><Icon name="pin"/>{data.person.neighborhood || <Text>{"Your ZUNO neighbor"}</Text>}</small></span></Link>
      <Link href="/" prefetch className="conversation-home message-icon-button" aria-label="Go to homepage"><Icon name="home"/></Link>
      <details className="conversation-options"><summary aria-label="Conversation options"><MessageIcon name="more"/></summary><div><SafetyControls userId={data.otherId} name={data.person.name} listingId={data.c.listing_id ?? undefined}/></div></details>
    </header>
    <div className="conversation-item">
      <span className="conversation-thumbnail">{data.listing ? <Image src={data.listing.image} alt={data.c.listing_title} width={56} height={56} unoptimized/> : <Icon name="image"/>}</span>
      <span><strong>{data.c.listing_title}</strong>{data.listing ? <b>{formatMoney(data.listing.price, data.listing.countryCode)}</b> : <small><Text>{"This item may no longer be available."}</Text></small>}</span>
      {data.listing && <Link href={`/listings/${data.listing.id}`} prefetch><Text>{"View item"}</Text><Icon name="chevron"/></Link>}
    </div>
    <Suspense fallback={null}>
      <ConversationTradePanel conversation={id} account={data.userId} seller={data.c.seller_id === data.userId} />
    </Suspense>
    <Chat key={`${id}-${data.userId}`} conversationId={id} userId={data.userId} initialMessages={data.messages} canMessage={data.canMessage} mediaReady={data.mediaReady} person={data.person} self={data.self}/>
  </MessagesWorkspace>;
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
