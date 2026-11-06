"use client";
import { useActionState } from "react";
import { Text } from "@/features/language/provider";
import { loginWithTelegram, loginWithKakao } from "./social-actions";
import type { AuthState } from "./actions";
import "./social-buttons.css";

function SocialButton({provider}: {provider: "telegram" | "kakao"}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    provider === "telegram" ? loginWithTelegram : loginWithKakao, {},
  );
  const label = provider === "telegram"
    ? (pending ? "Connecting to Telegram…" : "Continue with Telegram")
    : (pending ? "Connecting to Kakao…" : "Continue with Kakao");
  return <form action={action} className={`social-signin social-${provider}`} aria-busy={pending}>
    <button type="submit" className="button social-auth-button" disabled={pending}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
        {provider === "telegram"
          ? <path d="M21.9 4.6 18.6 20c-.25 1.1-.9 1.36-1.82.84l-5.03-3.7-2.43 2.34c-.27.27-.49.49-1 .49l.36-5.1 9.29-8.4c.4-.36-.09-.56-.62-.2L5.87 13.5.95 11.96c-1.07-.34-1.09-1.07.23-1.59L20.4 2.96c.89-.32 1.67.2 1.5 1.64Z"/>
          : <path d="M12 3C5.92 3 1 6.86 1 11.63c0 3.07 2.04 5.77 5.12 7.3l-1.3 4.14c-.1.32.24.58.51.4l4.78-3.17c.62.09 1.25.14 1.89.14 6.08 0 11-3.94 11-8.81C23 6.86 18.08 3 12 3Z"/>}
      </svg>
      <Text>{label}</Text>
    </button>
    {state.error && <p role="alert" className="auth-error"><Text>{state.error}</Text></p>}
  </form>;
}
export function SocialButtons() { return <><SocialButton provider="telegram"/><SocialButton provider="kakao"/></>; }
