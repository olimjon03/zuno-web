"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window { turnstile?: TurnstileApi }
}

export function Turnstile({ siteKey, onToken }: { siteKey: string; onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const api = window.turnstile;
    if (!ready || !api || !container.current) return;
    const invalidate = () => { onToken(""); setFailed(true); };
    const id = api.render(container.current, {
      sitekey: siteKey,
      size: "flexible",
      "response-field": false,
      callback: (token: string) => { onToken(token); setFailed(false); },
      "expired-callback": invalidate,
      "error-callback": invalidate,
      "timeout-callback": invalidate,
    });
    return () => api.remove(id);
  }, [ready, siteKey, onToken, attempt]);

  return <div style={{ width: "100%", minWidth: 0 }}>
    <Script id="zuno-turnstile" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      onReady={() => setReady(true)} onError={() => setFailed(true)} />
    <div ref={container} />
    {failed && <p role="alert">Verification expired or unavailable. <button type="button"
      onClick={() => { onToken(""); setFailed(false); if (window.turnstile) { setReady(true); setAttempt(value => value + 1); } else { window.location.reload(); } }}>
      Retry verification
    </button></p>}
  </div>;
}
