"use client";
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
    return () => subscription.unsubscribe();
  }, []);
  return (
    <Link
      className="button button-outline login"
      href={signedIn ? "/account" : "/login"}
    >
      {signedIn ? "Account" : "Log in"}
    </Link>
  );
}
