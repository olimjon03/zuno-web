"use client";
import { Text } from "@/features/language/provider";

import { UnreadBadge } from "@/features/messages/unread-provider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AccountLink() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    // onAuthStateChange emits INITIAL_SESSION; this only changes navigation labels.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSignedIn(Boolean(session)),
    );
    let alive = true;
    const reconcile = () => {
      void supabase.auth.getSession().then(({data,error}) => {
        if (alive && !error) setSignedIn(Boolean(data.session));
      }).catch(() => {});
    };
    window.addEventListener("zuno:auth-route", reconcile);
    return () => {
      alive = false;
      subscription.unsubscribe();
      window.removeEventListener("zuno:auth-route", reconcile);
    };
  }, []);
  return (
    <Link
      className="button button-outline login"
      href={signedIn ? "/account" : "/login"}
    >
      {signedIn ? <Text>{"Account"}</Text> : <Text>{"Log in"}</Text>}
      {signedIn && <UnreadBadge />}
    </Link>
  );
}
