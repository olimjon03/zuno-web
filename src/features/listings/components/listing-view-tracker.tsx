"use client";
import { useEffect, useRef } from "react";
export function ListingViewTracker({ id }: { id: string }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let visible = false, pending = false, sent = false, active = true;
    async function record() {
      if (!active || !visible || document.hidden || pending || sent) return;
      pending = true;
      try { const response = await fetch(`/api/listings/${id}/view`, { method: "POST", keepalive: true });if (response.ok) sent = true; }
      catch { /* Analytics must never interrupt reading a listing. */ }
      finally { pending = false; }
    }
    const target = marker.current?.parentElement;
    if (!target) return;
    const observer = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting);void record(); });
    observer.observe(target);
    const refresh = () => { void record(); };
    document.addEventListener("visibilitychange", refresh);window.addEventListener("focus", refresh);
    return () => { active = false;observer.disconnect();document.removeEventListener("visibilitychange", refresh);window.removeEventListener("focus", refresh); };
  }, [id]);
  return <span ref={marker} hidden aria-hidden="true"/>;
}
