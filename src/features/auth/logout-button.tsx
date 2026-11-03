"use client";
import { Text } from "@/features/language/provider";

import { useActionState } from "react";
import { logout, type AuthState } from "./actions";
export function LogoutButton() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    logout,
    {},
  );
  return (
    <form action={action}>
      <button className="button button-outline" disabled={pending}>
        {pending ? <Text>{"Logging out…"}</Text> : <Text>{"Log out"}</Text>}
      </button>
      {state.error && (
        <p role="alert" className="auth-error">
          <Text>{state.error}</Text>
        </p>
      )}
    </form>
  );
}
