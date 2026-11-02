"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  Suspense,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createRefreshQueue, subscribeToMessageChanges } from "./realtime";
import { getUnreadCounts } from "./unread-actions";
const Context = createContext<{
  counts: Record<string, number>;
  total: number;
  available: boolean;
  realtime: boolean;
}>({ counts: {}, total: 0, available: false, realtime: false });
function RouteObserver({ onChange }: { onChange: (path: string) => void }) {
  const path = usePathname();
  useEffect(() => onChange(path), [path, onChange]);
  return null;
}
export function UnreadProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [available, setAvailable] = useState(false);
  const [realtime, setRealtime] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let alive = true,
      generation = 0;
    let disconnect: (() => void) | undefined;
    const refresh = createRefreshQueue(
      async () => {
        if (!alive || document.hidden) return;
        const version = generation;
        const result = await getUnreadCounts();
        if (!alive || version !== generation) return;
        setCounts(result.counts ?? {});
        setAvailable(Boolean(result.counts));
      },
      () => {
        if (alive) {
          setCounts({});
          setAvailable(false);
        }
      },
    );
    const db = createClient();
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
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
                setRealtime(status === "SUBSCRIBED");
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
    });
    // Periodic reconciliation also covers missed events and disabled Realtime.
    const timer = setInterval(() => refresh.request(), 10000);
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
      document.removeEventListener("visibilitychange", changed);
      window.removeEventListener("focus", changed);
      window.removeEventListener("zuno:messages-read", changed);
    };
  }, [path]);
  return (
    <Context.Provider
      value={{
        counts,
        total: Object.values(counts).reduce((sum, n) => sum + n, 0),
        available,
        realtime,
      }}
    >
      <Suspense fallback={null}>
        <RouteObserver onChange={setPath} />
      </Suspense>
      {children}
    </Context.Provider>
  );
}
export function useUnread() {
  return useContext(Context);
}
export function UnreadBadge({ conversationId }: { conversationId?: string }) {
  const { counts, total, available } = useUnread();
  const count = conversationId ? (counts[conversationId] ?? 0) : total;
  return available && count > 0 ? (
    <span className="unread-badge" aria-label={`${count} unread messages`}>
      {count > 99 ? "99+" : count}
    </span>
  ) : null;
}
