import "server-only";

import { cache } from "react";
import { ConversationListingActions } from "../conversation-listing-actions";
import { Text } from "@/features/language/provider";
import { ExploreForm } from "@/features/account/explore-form";
import { TradeFeedbackForm } from "@/features/account/trade-feedback-form";
import { createClient } from "@/lib/supabase/server";

const readTrade = cache(async (conversation: string) => {
  const db = await createClient();
  const { data, error } = await db.from("explore_trade_confirmations")
    .select("seller_confirmation").eq("conversation_id", conversation);
  if (error || !data?.some(row => row.seller_confirmation)) return null;
  return { received: data.some(row => !row.seller_confirmation) };
});

export async function ConversationTradeMenu({ conversation, account, seller, listing, status, buyerId, buyerName, canMessage }: {
  conversation: string;
  account: string;
  seller: boolean;
  listing: string | null;
  status?: "active" | "reserved" | "sold";
  buyerId: string;
  buyerName: string;
  canMessage: boolean;
}) {
  if (!seller) {
    const trade = await readTrade(conversation);
    return status === "sold" && trade && !trade.received ? <div className="conversation-trade-menu">
      <ExploreForm feature="purchase-history" account={account} id={conversation} label="Confirm receipt" />
    </div> : null;
  }

  if (!listing || !canMessage || (status !== "active" && status !== "reserved")) return null;
  const db = await createClient();
  const { data, error } = await db.from("messages").select("id").eq("conversation_id", conversation)
    .eq("sender_id", buyerId).limit(1);
  if (error || !data?.length) return null;
  return <ConversationListingActions listing={listing} conversation={conversation} buyer={buyerName} canReserve={status === "active"} />;
}

export async function ConversationTradePanel({ conversation, account, seller }: {
  conversation: string;
  account: string;
  seller: boolean;
}) {
  const trade = await readTrade(conversation);
  if (!trade) return null;
  const { received } = trade;
  const db = await createClient();
  const feedback = received ? await db.from("trade_feedback").select("conversation_id")
    .eq("reviewer_id", account).eq("conversation_id", conversation).maybeSingle() : null;

  return <aside className="conversation-trade-panel" aria-label="Trade status">
    <strong><Text>{received ? "Trade confirmed" : "Waiting for buyer confirmation"}</Text></strong>
    {!received && !seller && <ExploreForm feature="purchase-history" account={account} id={conversation} label="Confirm receipt" />}
    {received && !feedback?.error && (feedback?.data
      ? <p><Text>{"Feedback sent"}</Text></p>
      : <TradeFeedbackForm account={account} conversation={conversation} seller={seller} />)}
  </aside>;
}
