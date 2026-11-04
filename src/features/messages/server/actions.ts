"use server";
import { getVerifiedUser } from "@/features/auth/server/user";
import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/listings/validation";
import type { MessageAttachment, Message } from "../types";
import { parseMessage } from "../validation";
export async function beginConversation(
  _state: { error?: string },
  form: FormData,
): Promise<{ error?: string }> {
  const id = form.get("listingId");
  if (typeof id !== "string" || !isUuid(id))
    return { error: "Choose a valid listing." };
  let destination: string | null = null;
  try {
    const db = await createClient();
    const {
      data: { user },
      error,
    } = await getVerifiedUser();
    if (!error && user) {
      const { data, error: startError } = await db.rpc("start_conversation", {
        p_listing_id: id,
      });
      if (startError || typeof data !== "string" || !isUuid(data))
        return {
          error:
            startError?.code === "P0002" ? "Messaging is unavailable between you and this user." : startError?.code === "22023"
              ? "This item is unavailable for a new conversation, or it’s your own listing."
              : "Chat is temporarily unavailable. Please try again.",
        };
      destination = `/messages/${data}`;
    }
  } catch {
    return { error: "We couldn’t connect. Please try again." };
  }
  redirect(destination ?? "/login?notice=session");
}
export async function postMessage(
  conversationId: string,
  clientId: string,
  body: string,
) {
  let input;
  try {
    input = parseMessage(conversationId, clientId, body);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Check your message.",
    };
  }
  try {
    const db = await createClient();
    const {
      data: { user },
      error: authError,
    } = await getVerifiedUser();
    if (authError || !user)
      return { error: "Please log in again to send messages." };
    const { error } = await db.rpc("send_message", {
      p_conversation_id: input.conversationId,
      p_client_id: input.clientId,
      p_body: input.body,
    });
    if (error)
      return { error: error.code === "P0002" ? "Messaging is unavailable between you and this user. Your draft has been kept." : "We couldn’t send your message. Please try again." };
    return { ok: true };
  } catch {
    return { error: "We couldn’t connect. Your message has been kept." };
  }
}
export async function readMessages(id: string, cursor?: number, older = false) {
  if (
    typeof id !== "string" ||
    !isUuid(id) ||
    (cursor !== undefined && (!Number.isSafeInteger(cursor) || cursor < 1)) ||
    typeof older !== "boolean"
  )
    return { error: "Invalid conversation." };
  try {
    const db = await createClient();
    const {
      data: { user },
      error: authError,
    } = await getVerifiedUser();
    if (authError || !user)
      return { error: "Please log in again to read messages." };
    const { data: conversation, error: accessError } = await db
      .from("conversations")
      .select("id,buyer_id,seller_id")
      .eq("id", id)
      .maybeSingle();
    if (accessError || !conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id))
      return { error: "This conversation is unavailable." };
    const ascending = cursor !== undefined && !older;
    function load(includeTrade: boolean) {
      const table = db.from("messages");
      let query = (includeTrade
        ? table.select("id,sender_id,body,created_at,trade_status")
        : table.select("id,sender_id,body,created_at")).eq("conversation_id", id);
      if (cursor !== undefined) query = older ? query.lt("id", cursor) : query.gt("id", cursor);
      return query.order("id", { ascending }).limit(50);
    }
    let { data, error } = await load(true);
    if (error && ["42703", "PGRST204"].includes(error.code)) {
      ({ data, error } = await load(false));
    }
    if (error)
      return { error: "Messages could not be loaded. Please try again." };
    const { data: attachments, error: mediaError } = await db.from("message_attachments")
      .select("id,message_id,name,mime,size,sort_order").in("message_id", data?.length ? data.map(row => row.id) : [0]).order("sort_order");
    const missingMedia = mediaError && ["42P01", "PGRST205", "PGRST200"].includes(mediaError.code);
    if (mediaError && !missingMedia) return { error: "Attachments could not be loaded. Please retry." };
    const items = (data ?? []) as Message[];
    for (const message of items) message.attachments = ((attachments ?? []) as MessageAttachment[]).filter(file => file.message_id === message.id);
    return { messages: ascending ? items : items.reverse(), mediaReady: !missingMedia };

  } catch {
    return { error: "We couldn’t refresh messages. Please try again." };
  }
}
