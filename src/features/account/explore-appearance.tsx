"use client";

import { useEffect } from "react";
import { useNotifications } from "@/features/notifications/provider";
import { createClient } from "@/lib/supabase/client";

export function ExploreAppearance() {
  const { userId } = useNotifications();
  useEffect(() => {
    const root = document.documentElement;
    if (!userId) return;
    let active = true;
    let request = 0;
    async function sync() {
      const version = ++request;
      const result = await createClient().from("explore_preferences").select("large_text").eq("user_id", userId).maybeSingle();
      if (active && version === request && !result.error) root.classList.toggle("zuno-large-text", result.data?.large_text === true);
    }
    function refresh() { void sync().catch(() => {}); }
    refresh();
    window.addEventListener("zuno:appearance", refresh);
    return () => {
      active = false;
      root.classList.remove("zuno-large-text");
      window.removeEventListener("zuno:appearance", refresh);
    };
  }, [userId]);
  return null;
}
