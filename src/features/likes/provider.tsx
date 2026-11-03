"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Text, useT } from "@/features/language/provider";
import { setListingLike } from "./server/actions";

type State = { ids: Set<string>; counts: Record<string, number>; pending: Set<string>; ready: boolean; error: boolean };
const initial = (): State => ({ ids: new Set(), counts: {}, pending: new Set(), ready: false, error: false });
const Context = createContext<(State & { toggle: (id: string, count: number) => void; retry: () => void }) | null>(null);
export function LikesProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [state, setState] = useState<State>(initial);
  const current = useRef(state);
  const generation = useRef(0);
  const identity = useRef<string | null | undefined>(undefined);
  const retry = useRef(() => {});
  const [notice, setNotice] = useState<{ message: string; login?: boolean } | null>(null);
  const update = useCallback((next: State) => { current.current = next; setState(next); }, []);
  const invalidate = useCallback(() => { generation.current++; }, []);
  useEffect(() => {
    let alive = true;
    let loading = false, loadedAt = 0;
    const db = isSupabaseConfigured() ? createClient() : null;
    const sync = (_event: AuthChangeEvent, session: Session | null) => {
      if (!alive) return;
      const user = session?.user.id ?? null;
      const changed = identity.current !== user;
      if (!changed && (loading || current.current.pending.size || Date.now() - loadedAt < 60000)) return;
      identity.current = user;
      const version = ++generation.current;
      if (changed) { update(initial());setNotice(null); }
      else update({ ...current.current, ready: false, error: false });
      loading = true;
      // Defer database reads outside the Auth callback; RLS exposes only this user's likes.
      void Promise.resolve().then(async () => {
        const ids = new Set<string>();
        if (db && user) {
          for (let offset = 0; ; offset += 500) {
            if (!alive || version !== generation.current) return;
            const { data, error } = await db.from("listing_likes").select("listing_id").eq("user_id", user).order("listing_id").range(offset, offset + 499);
            if (error) throw error;
            for (const row of data ?? []) ids.add(row.listing_id);
            if (!data || data.length < 500) break;
          }
        }
        if (!alive || version !== generation.current) return;
        loadedAt = Date.now(); loading = false;
        update({ ...current.current, ids, ready: true, error: false });
      }).catch(() => {
        if (!alive || version !== generation.current) return;
        loading = false;loadedAt = 0;
        update({ ...current.current, ready: false, error: true });
      });
    };
    const reconcile = () => {
      if (!db) { sync("INITIAL_SESSION", null);return; }
      void db.auth.getSession().then(({ data, error }) => { if (alive && !error) sync("INITIAL_SESSION", data.session); }).catch(() => {});
    };
    const subscription = db?.auth.onAuthStateChange(sync).data.subscription;
    if (!db) reconcile();
    retry.current = () => { loadedAt = 0;reconcile(); };
    const visible = () => { if (!document.hidden) reconcile(); };
    window.addEventListener("focus", reconcile);
    window.addEventListener("zuno:auth-route", reconcile);
    document.addEventListener("visibilitychange", visible);
    return () => { alive = false;invalidate();subscription?.unsubscribe();retry.current = () => {};window.removeEventListener("focus", reconcile);window.removeEventListener("zuno:auth-route", reconcile);document.removeEventListener("visibilitychange", visible); };
  }, [update, invalidate]);
  const toggle = useCallback(async (id: string, baseCount: number) => {
    const before = current.current;
    if (!before.ready || before.pending.has(id)) return;
    if (!identity.current) { setNotice({ message: "Log in to like items.", login: true });return; }
    const version = generation.current;
    const liked = before.ids.has(id), count = before.counts[id] ?? baseCount;
    const ids = new Set(before.ids), pending = new Set(before.pending);
    if (liked) ids.delete(id);else ids.add(id);
    pending.add(id);setNotice(null);
    update({ ...before, ids, pending, counts: { ...before.counts, [id]: Math.max(0, count + (liked ? -1 : 1)) } });
    let result: Awaited<ReturnType<typeof setListingLike>>;
    try { result = await setListingLike(id, !liked); }
    catch { result = { error: "We couldn’t update your like. Please try again." }; }
    if (version !== generation.current) return;
    const next = current.current, settled = new Set(next.pending), settledIds = new Set(next.ids);
    settled.delete(id);
    const success = !result.error && typeof result.liked === "boolean" && typeof result.count === "number";
    if (success ? result.liked : liked) settledIds.add(id);else settledIds.delete(id);
    update({ ...next, ids: settledIds, pending: settled, counts: { ...next.counts, [id]: success ? result.count! : count } });
    if (!success) setNotice({ message: result.error ?? "We couldn’t update your like. Please try again.", login: result.login });
  }, [update]);
  return <Context.Provider value={{ ...state, toggle, retry: () => retry.current() }}>{children}
    {notice && <aside className="favorite-notice" aria-label={t("Likes notification")}><p role="status"><Text>{notice.message}</Text></p>{notice.login && <Link href="/login"><Text>{"Log in"}</Text></Link>}<button type="button" aria-label={t("Dismiss notification")} onClick={() => setNotice(null)}>×</button></aside>}
  </Context.Provider>;
}
export function useLikes() {
  const value = useContext(Context);
  if (!value) throw new Error("LikesProvider is required");
  return value;
}
