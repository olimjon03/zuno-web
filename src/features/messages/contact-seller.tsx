"use client";
import { Text } from "@/features/language/provider";

import { useActionState } from "react";
import { beginConversation } from "./server/actions";
export function ContactSeller({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState(beginConversation, {});
  return (
    <form action={action}>
      <input type="hidden" name="listingId" value={listingId} />
      <button className="button button-primary" disabled={pending}>
        {pending ? <Text>{"Opening chat…"}</Text> : <Text>{"Contact seller"}</Text>}
      </button>
      {state.error && (
        <p className="auth-error" role="alert">
          <Text>{state.error}</Text>
        </p>
      )}
    </form>
  );
}
