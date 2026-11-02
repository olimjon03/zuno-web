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
import { getUnreadCounts } from "./unread-actions";
const Context = createContext<{
  counts: Record<string, number>;
  total: number;
  available: boolean;
}>({ counts: {}, total: 0, available: false });
function RouteObserver({ onChange }: { onChange: (path: string) => void }) {
  const path = usePathname();
  useEffect(() => onChange(path), [path, onChange]);
  return null;
}
export function UnreadProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let alive = true,
      busy = false,
      generation = 0;
    async function refresh() {
      if (!alive || busy || document.hidden) return;
      busy = true;
      const version = generation;
      try {
        const result = await getUnreadCounts();
        if (!alive || version !== generation) return;
        setCounts(result.counts ?? {});
        setAvailable(Boolean(result.counts));
      } catch {
        if (alive && version === generation) {
          setCounts({});
          setAvailable(false);
        }
      } finally {
        busy = false;
      }
    }
    const db = createClient();
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange(() => {
      generation++;
      setCounts({});
      setAvailable(false);
      void Promise.resolve().then(refresh);
    });
    const timer = setInterval(() => {
      void refresh();
    }, 10000);
    const changed = () => {
      void refresh();
    };
    document.addEventListener("visibilitychange", changed);
    window.addEventListener("focus", changed);
    window.addEventListener("zuno:messages-read", changed);
    void refresh();
    return () => {
      alive = false;
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
