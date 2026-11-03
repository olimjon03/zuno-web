"use client";
import { Text, useT } from "@/features/language/provider";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useHydrated } from "@/lib/use-hydrated";
import { isUuid } from "@/features/listings/validation";
import { saveFavorite } from "./server/actions";
const FavoritesContext = createContext<{
  favorites: string[];
  ready: boolean;
  loadError: string;
  retryFavorites: () => void;
  toggleFavorite: (id: string) => void;
} | null>(null);
export function FavoritesProvider({ children }: { children: ReactNode }) {
 const t = useT();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const retryLoad = useRef<() => void>(() => {});
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
    let userId: string | null | undefined;
    let loadedAt = 0;
    const syncSession = (_event: AuthChangeEvent, session: Session | null) => {
      const nextUserId = session?.user.id ?? null;
      if (nextUserId === userId && (Date.now() - loadedAt < 60000 || pending.current.size > 0)) return;
      const identityChanged = nextUserId !== userId;
      userId = nextUserId;
      loadedAt = Date.now();
      const version = ++generation.current;
      if (identityChanged) {
        pending.current = new Set();
        current.current = [];
        setFavorites(demos.current);
      }
      setLoadError("");
      setReady(false);
      setNotice("");
      setLogin(false);
      loading.current = true;
      // Defer outside the Supabase auth callback to avoid auth lock contention.
      void Promise.resolve()
        .then(async () => {
          if (!nextUserId) return {ids: [] as string[], error: undefined};
          const {data,error} = await db.from("favorites").select("listing_id").eq("user_id",nextUserId).order("created_at",{ascending:false}).limit(1000);
          return {ids:(data ?? []).map(row=>row.listing_id as string),error:error ? "Saved items are temporarily unavailable. Please try again." : undefined};
        })
        .then((result) => {
          if (!alive || version !== generation.current) return;
          if (result.error) {
            setLoadError(result.error);
            loadedAt = 0;
          } else {
            current.current = result.ids;
            setFavorites([...result.ids, ...demos.current]);
          }
          setReady(true);
          loading.current = false;

        })
        .catch(() => {
          if (!alive || version !== generation.current) return;
          loading.current = false;
          setReady(true);
          setLoadError("We couldn’t load saved items. Please try again.");
          loadedAt = 0;
        });
    };
    const {data:{subscription}} = db.auth.onAuthStateChange(syncSession);
    const reconcileSession = () => {
      void db.auth.getSession().then(({data,error}) => {
        if (alive && !error) syncSession("INITIAL_SESSION", data.session);
      }).catch(() => {});
    };
    retryLoad.current = () => { if (loading.current) return; loadedAt = 0; reconcileSession(); };
    const refreshVisible = () => {
      if (document.hidden || pending.current.size || loading.current) return;
      loadedAt = 0;
      reconcileSession();
    };
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    window.addEventListener("zuno:auth-route", reconcileSession);
    return () => {
      alive = false;
      retryLoad.current = () => {};
      subscription.unsubscribe();
      window.removeEventListener("zuno:auth-route", reconcileSession);
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, []);
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
    if (loadError) {
      setNotice("We couldn’t check your saved items. Retry loading them first.");
      return;
    }
    const pendingItems = pending.current;
    pendingItems.add(id);
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
      pendingItems.delete(id);
    }
  }
  return (
    <FavoritesContext.Provider value={{ favorites, ready, loadError, retryFavorites: () => retryLoad.current(), toggleFavorite }}>
      {children}
      {notice && (
        <aside
          className="favorite-notice"
          aria-label={t("Saved items notification")}
        >
          <p role="status"><Text>{notice}</Text></p>
          {login && <Link href="/login"><Text>{"Log in"}</Text></Link>}
          <button
            type="button"
            aria-label={t("Dismiss notification")}
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
  const hydrated = useHydrated();
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites requires FavoritesProvider");
  return {...context, favorites: hydrated ? context.favorites : [], ready: hydrated && context.ready};
}
