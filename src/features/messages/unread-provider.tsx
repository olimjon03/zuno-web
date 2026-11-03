"use client";
import { useT } from "@/features/language/provider";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createRefreshQueue } from "./refresh-queue";
import { subscribeToMessageChanges } from "./client/realtime";
import { useHydrated } from "@/lib/use-hydrated";
import { isUuid } from "@/features/listings/validation";
const Context = createContext<{
  counts: Record<string, number>;
  total: number;
  available: boolean;
  realtime: boolean;
}>({ counts: {}, total: 0, available: false, realtime: false });
export function UnreadProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [available, setAvailable] = useState(false);
  const [realtime, setRealtime] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let alive = true,
      generation = 0;
    const db = createClient();
    let userId: string | null | undefined;
    let connected = false;
    let disconnect: (() => void) | undefined;
    const refresh = createRefreshQueue(
      async () => {
        if (!alive || document.hidden || !userId) return;
        const version = generation;
        // Read through RLS directly: background badges must not queue Server Actions.
        let response;
        try {
          response = await db.rpc("get_unread_counts");
        } catch {
          if (alive && version === generation) {
            setCounts({});
            setAvailable(false);
          }
          return;
        }
        const { data, error } = response;
        const next: Record<string, number> = {};
        for (const row of data ?? []) {
          const count = Number(row.unread_count);
          if (isUuid(row.conversation_id) && Number.isSafeInteger(count) && count > 0) next[row.conversation_id] = count;
        }
        if (!alive || version !== generation) return;
        setCounts(error ? {} : next);
        setAvailable(!error);
      },
      () => {
        if (alive) {
          setCounts({});
          setAvailable(false);
        }
      },
    );
    const syncSession = (event: AuthChangeEvent, session: Session | null) => {
      const nextUserId = session?.user.id ?? null;
      if (nextUserId === userId) {
        if (event === "TOKEN_REFRESHED" && session) void Promise.resolve().then(() => { if (alive && userId === nextUserId) return db.realtime.setAuth(session.access_token); }).catch(() => {});
        return;
      }
      userId = nextUserId;
      connected = false;
      const version = ++generation;
      disconnect?.();
      disconnect = undefined;
      setCounts({});
      setAvailable(false);
      setRealtime(false);
      // Supabase auth callbacks must not await other auth operations.
      void Promise.resolve()
        .then(async () => {
          if (!alive || version !== generation) return;
          if (session?.user) {
            await db.realtime.setAuth(session.access_token);
            if (!alive || version !== generation) return;
            disconnect = subscribeToMessageChanges(db, session.user.id, {
              message(conversationId) {
                refresh.request();
                window.dispatchEvent(
                  new CustomEvent("zuno:message-change", {
                    detail: { conversationId },
                  }),
                );
              },
              reads() {
                refresh.request();
              },
              status(status) {
                connected = status === "SUBSCRIBED";
                setRealtime(connected);
                if (status === "SUBSCRIBED") {
                  refresh.request();
                  window.dispatchEvent(new Event("zuno:messages-reconnected"));
                }
              },
            });
          }
          refresh.request();
        })
        .catch(() => {
          if (alive && version === generation) {
            setRealtime(false);
            refresh.request();
          }
        });
    };
    const {data:{subscription}} = db.auth.onAuthStateChange(syncSession);
    const reconcileSession = () => {
      void db.auth.getSession().then(({data,error}) => {
        if (alive && !error) syncSession("INITIAL_SESSION", data.session);
      }).catch(() => {});
    };
    window.addEventListener("zuno:auth-route", reconcileSession);
    // Periodic reconciliation also covers missed events and disabled Realtime.
    let lastPoll = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      if (connected && now - lastPoll < 60000) return;
      lastPoll = now;
      refresh.request();
    }, 10000);
    const changed = () => refresh.request();
    document.addEventListener("visibilitychange", changed);
    window.addEventListener("focus", changed);
    window.addEventListener("zuno:messages-read", changed);
    refresh.request();
    return () => {
      alive = false;
      disconnect?.();
      refresh.dispose();
      clearInterval(timer);
      subscription.unsubscribe();
      window.removeEventListener("zuno:auth-route", reconcileSession);
      document.removeEventListener("visibilitychange", changed);
      window.removeEventListener("focus", changed);
      window.removeEventListener("zuno:messages-read", changed);
    };
  }, []);
  return (
    <Context.Provider
      value={{
        counts,
        total: Object.values(counts).reduce((sum, n) => sum + n, 0),
        available,
        realtime,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useUnread() {
  return useContext(Context);
}
export function UnreadBadge({ conversationId }: { conversationId?: string }) {
  const t = useT();
  const hydrated = useHydrated();
  const { counts, total, available } = useUnread();
  const count = conversationId ? (counts[conversationId] ?? 0) : total;
  return hydrated && available && count > 0 ? (
    <span className="unread-badge" aria-label={t("{count} unread messages", { count })}>
      {count > 99 ? "99+" : count}
    </span>
  ) : null;
}
