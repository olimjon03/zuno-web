"use client";
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
        {pending ? "Logging out…" : "Log out"}
      </button>
      {state.error && (
        <p role="alert" className="auth-error">
          {state.error}
        </p>
      )}
    </form>
  );
}
