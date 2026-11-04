"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { Text } from "@/features/language/provider";
import { saveExploreChange } from "./explore-action";

export function ExploreForm({ feature, account, intent = "save", id, label, children }: {
  feature: string;
  account: string;
  intent?: string;
  id?: string;
  label: string;
  children?: ReactNode;
}) {
  const [state, action, pending] = useActionState(saveExploreChange, {});
  useEffect(() => {
    if (feature === "language" && state.message) window.dispatchEvent(new Event("zuno:appearance"));
  }, [feature, state]);
  return (
    <form action={action} className="explore-form" aria-busy={pending}>
      <input type="hidden" name="feature" value={feature} />
      <input type="hidden" name="account" value={account} />
      <input type="hidden" name="intent" value={intent} />
      {id && <input type="hidden" name="id" value={id} />}
      {children}
      <button className="button button-outline" disabled={pending}>
        <Text>{pending ? "Please wait…" : label}</Text>
      </button>
      {state.error && <p className="auth-error" role="alert"><Text>{state.error}</Text></p>}
      {state.message && <p role="status"><Text>{state.message}</Text></p>}
    </form>
  );
}
