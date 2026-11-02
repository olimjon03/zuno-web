"use server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/listings/validation";
export async function getUnreadCounts() {
  try {
    const db = await createClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser();
    if (authError || !user)
      return { counts: {} as Record<string, number>, userId: null };
    const { data, error } = await db.rpc("get_unread_counts");
    if (error)
      return {
        error: "Unread counts are temporarily unavailable.",
        userId: user.id,
      };
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const count = Number(row.unread_count);
      if (
        isUuid(row.conversation_id) &&
        Number.isSafeInteger(count) &&
        count > 0
      )
        counts[row.conversation_id] = count;
    }
    return { counts, userId: user.id };
  } catch {
    return {
      error: "Unread counts are temporarily unavailable.",
      userId: null,
    };
  }
}
export async function markMessagesRead(id: string, messageId: number) {
  if (
    typeof id !== "string" ||
    !isUuid(id) ||
    !Number.isSafeInteger(messageId) ||
    messageId < 1
  )
    return { error: "Invalid conversation cursor." };
  try {
    const db = await createClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser();
    if (authError || !user) return { error: "Please log in again." };
    const { error } = await db.rpc("mark_messages_read", {
      p_conversation_id: id,
      p_message_id: messageId,
    });
    return error ? { error: "Read status could not be saved." } : { ok: true };
  } catch {
    return { error: "Read status could not be saved." };
  }
}
