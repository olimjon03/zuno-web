import "server-only";

import { Text } from "@/features/language/provider";
import { ExploreForm } from "@/features/account/explore-form";
import { TradeFeedbackForm } from "@/features/account/trade-feedback-form";
import { createClient } from "@/lib/supabase/server";

export async function ConversationTradePanel({ conversation, account, seller }: {
  conversation: string;
  account: string;
  seller: boolean;
}) {
  const db = await createClient();
  const { data, error } = await db.from("explore_trade_confirmations")
    .select("user_id,seller_confirmation").eq("conversation_id", conversation);
  if (error || !data?.some(row => row.seller_confirmation)) return null;
  const received = data.some(row => !row.seller_confirmation);
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
