"use client";
import { useActionState } from "react";
import { beginConversation } from "./server/actions";
export function ContactSeller({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState(beginConversation, {});
  return (
    <form action={action}>
      <input type="hidden" name="listingId" value={listingId} />
      <button className="button button-primary" disabled={pending}>
        {pending ? "Opening chat…" : "Contact seller"}
      </button>
      {state.error && (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
