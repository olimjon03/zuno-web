import "client-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export function subscribeToMessageChanges(
  db: SupabaseClient,
  userId: string,
  callbacks: {
    message: (conversationId: string) => void;
    reads: () => void;
    status: (status: string) => void;
  },
) {
  let active = true;
  const channel = db
    .channel(`zuno-messages-${userId}-${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        if (active && typeof payload.new.conversation_id === "string")
          callbacks.message(payload.new.conversation_id);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "message_reads",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        if (active) callbacks.reads();
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "message_reads",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        if (active) callbacks.reads();
      },
    )
    .subscribe((status) => {
      if (active) callbacks.status(status);
    });
  return () => {
    active = false;
    void db.removeChannel(channel);
  };
}
