"use client";
import { useT } from "@/features/language/provider";

import { UnreadBadge } from "@/features/messages/unread-provider";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AccountLink() {
  const t = useT();
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
      className="button button-outline login account-icon-link"
      aria-label={t(signedIn ? "Account" : "Log in")}
      title={t(signedIn ? "Account" : "Log in")}
      href={signedIn ? "/account" : "/login"}
    >
      <Icon name="user-circle"/>
      {signedIn && <UnreadBadge />}
    </Link>
  );
}
