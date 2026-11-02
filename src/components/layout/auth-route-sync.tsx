"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
// Server-side login/logout updates cookies without a browser Auth event.
// Routes only reconcile local session state; providers keep their connections.
export function AuthRouteSync() {
  const path = usePathname();
  useEffect(() => { window.dispatchEvent(new Event("zuno:auth-route")); }, [path]);
  return null;
}
