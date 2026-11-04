"use client";

import { useActionState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { Text, useT } from "@/features/language/provider";
import { manageListing } from "@/features/listings/server/actions";

export function ConversationListingActions({ listing, conversation, buyer, canReserve }: {
  listing: string;
  conversation: string;
  buyer: string;
  canReserve: boolean;
}) {
  const t = useT();
  const [state, action, pending] = useActionState(manageListing, {});
  function confirm(event: FormEvent<HTMLFormElement>) {
    const button = (event.nativeEvent as SubmitEvent).submitter;
    const sold = button instanceof HTMLButtonElement && button.value === "sold";
    const prompt = sold ? "Mark this item sold to {buyer}?" : "Reserve this item for {buyer}?";
    if (!window.confirm(t(prompt, { buyer }))) event.preventDefault();
  }

  return <form className="conversation-trade-menu" action={action} onSubmit={confirm} aria-busy={pending}>
    <input type="hidden" name="id" value={listing} />
    <input type="hidden" name="conversation" value={conversation} />
    {canReserve && <button type="submit" name="intent" value="reserved" className="button button-outline" disabled={pending}>
      <Icon name="clock" /><Text>{"Mark reserved"}</Text>
    </button>}
    <button type="submit" name="intent" value="sold" className="button button-outline" disabled={pending}>
      <Icon name="bag-check" /><Text>{"Mark sold"}</Text>
    </button>
    {state.error && <p role="alert" className="auth-error"><Text>{state.error}</Text></p>}
  </form>;
}
