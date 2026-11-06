"use client";
import { useActionState } from "react";
import { Text } from "@/features/language/provider";
import { loginWithApple } from "./apple-action";
import type { AuthState } from "./actions";
import "./apple-button.css";

export function AppleButton() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginWithApple, {});
  return <form action={action} className="apple-signin" aria-busy={pending}>
    <button type="submit" className="button apple-button" disabled={pending}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
        <path d="M17.05 12.54c.02 3.01 2.64 4.01 2.67 4.02-.02.07-.42 1.44-1.38 2.86-.83 1.22-1.69 2.44-3.05 2.47-1.33.03-1.76-.8-3.28-.8-1.52 0-1.99.77-3.25.83-1.31.05-2.31-1.32-3.15-2.54-1.71-2.47-3.02-6.98-1.26-10.03a4.89 4.89 0 0 1 4.15-2.51c1.3-.02 2.52.88 3.31.88.79 0 2.27-1.09 3.82-.93.65.03 2.47.26 3.64 1.98-.1.06-2.18 1.27-2.15 3.77ZM14.54 5.15c.69-.84 1.15-2.01 1.02-3.18-.99.04-2.19.66-2.9 1.5-.64.74-1.2 1.93-1.05 3.07 1.1.08 2.23-.57 2.93-1.39Z"/>
      </svg>
      <Text>{pending ? "Connecting to Apple…" : "Continue with Apple"}</Text>
    </button>
    {state.error && <p role="alert" className="auth-error"><Text>{state.error}</Text></p>}
  </form>;
}
