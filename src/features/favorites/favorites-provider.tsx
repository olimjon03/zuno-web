"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isUuid } from "@/features/listings/validation";
import { loadFavorites, saveFavorite } from "./actions";
const FavoritesContext = createContext<{
  favorites: string[];
  ready: boolean;
  toggleFavorite: (id: string) => void;
} | null>(null);
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [login, setLogin] = useState(false);
  const generation = useRef(0);
  const loading = useRef(true);
  const pending = useRef(new Set<string>());
  const current = useRef<string[]>([]);
  const demos = useRef<string[]>([]);
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      loading.current = false;
      return;
    }
    const db = createClient();
    let alive = true;
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange(() => {
      const version = ++generation.current;
      current.current = [];
      setFavorites(demos.current);
      setReady(false);
      setNotice("");
      setLogin(false);
      loading.current = true;
      // Defer outside the Supabase auth callback to avoid auth lock contention.
      void Promise.resolve()
        .then(() => loadFavorites())
        .then((result) => {
          if (!alive || version !== generation.current) return;
          current.current = result.ids;
          setFavorites([...result.ids, ...demos.current]);
          setReady(true);
          loading.current = false;
          if (result.error) setNotice(result.error);
        })
        .catch(() => {
          if (!alive || version !== generation.current) return;
          loading.current = false;
          setReady(true);
          setNotice("We couldn’t load saved items. Refresh to try again.");
        });
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [pathname]);
  async function toggleFavorite(id: string) {
    if (!isUuid(id)) {
      demos.current = demos.current.includes(id)
        ? demos.current.filter((value) => value !== id)
        : [...demos.current, id];
      setFavorites([...current.current, ...demos.current]);
      setNotice("Sample items are saved only for this visit.");
      setLogin(false);
      return;
    }
    if (loading.current || pending.current.has(id)) return;
    pending.current.add(id);
    const version = generation.current;
    const saved = !current.current.includes(id);
    setNotice("Updating saved items…");
    setLogin(false);
    try {
      const result = await saveFavorite(id, saved);
      if (version !== generation.current) return;
      if (result.error) {
        setNotice(result.error);
        setLogin(Boolean(result.login));
        return;
      }
      current.current = saved
        ? [...current.current, id]
        : current.current.filter((value) => value !== id);
      setFavorites([...current.current, ...demos.current]);
      setLogin(false);
      setNotice(
        saved
          ? "Item saved to your account."
          : "Item removed from saved items.",
      );
    } catch {
      if (version === generation.current)
        setNotice("We couldn’t save your change. Please try again.");
    } finally {
      pending.current.delete(id);
    }
  }
  return (
    <FavoritesContext.Provider value={{ favorites, ready, toggleFavorite }}>
      {children}
      {notice && (
        <aside
          className="favorite-notice"
          aria-label="Saved items notification"
        >
          <p role="status">{notice}</p>
          {login && <Link href="/login">Log in</Link>}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </aside>
      )}
    </FavoritesContext.Provider>
  );
}
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites requires FavoritesProvider");
  return context;
}
