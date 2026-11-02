"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/listings/validation";
import { parseMessage, type Message } from "./validation";
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
    } = await db.auth.getUser();
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
    } = await db.auth.getUser();
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
    } = await db.auth.getUser();
    if (authError || !user)
      return { error: "Please log in again to read messages." };
    const { data: conversation, error: accessError } = await db
      .from("conversations")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (accessError || !conversation)
      return { error: "This conversation is unavailable." };
    let query = db
      .from("messages")
      .select("id,sender_id,body,created_at")
      .eq("conversation_id", id);
    if (cursor !== undefined)
      query = older ? query.lt("id", cursor) : query.gt("id", cursor);
    const ascending = cursor !== undefined && !older;
    const { data, error } = await query.order("id", { ascending }).limit(50);
    if (error)
      return { error: "Messages could not be loaded. Please try again." };
    return {
      messages: ascending ? (data as Message[]) : (data as Message[]).reverse(),
    };
  } catch {
    return { error: "We couldn’t refresh messages. Please try again." };
  }
}
