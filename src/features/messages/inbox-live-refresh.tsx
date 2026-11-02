"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function InboxLiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (document.hidden) return;
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 150);
    };
    window.addEventListener("zuno:message-change", refresh);
    window.addEventListener("zuno:messages-reconnected", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("zuno:message-change", refresh);
      window.removeEventListener("zuno:messages-reconnected", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  return null;
}
