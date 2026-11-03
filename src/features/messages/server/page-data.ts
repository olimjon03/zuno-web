import "server-only";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { readSafetyState } from "@/features/moderation/actions";
import { getInboxSnapshot } from "./inbox-data";
import { readMessages } from "./actions";
import { isUuid } from "@/features/listings/validation";

export async function getInboxPage() {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login?notice=session");
  return getInboxSnapshot(db, user.id);
}

export async function getConversationPage(id: string) {
  if (!isUuid(id)) notFound();
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) redirect("/login?notice=session");
  const { data: c, error } = await db.from("conversations")
    .select("id,listing_id,listing_title,buyer_id,seller_id,buyer_name,seller_name")
    .eq("id", id).maybeSingle();
  if (error) throw new Error("Conversation unavailable.");
  if (!c || (c.buyer_id !== user.id && c.seller_id !== user.id)) notFound();
  const otherId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
  const [result, safety] = await Promise.all([readMessages(id), readSafetyState(otherId)]);
  if (!result.messages) throw new Error("Messages unavailable.");
  return { c, userId: user.id, otherId, messages: result.messages, canMessage: safety.state?.canMessage ?? true };
}
