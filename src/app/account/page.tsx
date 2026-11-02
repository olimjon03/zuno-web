import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AuthShell } from "@/features/auth/auth-shell";
import { LogoutButton } from "@/features/auth/logout-button";
export const metadata: Metadata = {
  title: "Your account | ZUNO",
  robots: { index: false, follow: false },
};

async function Account() {
  // Authentication must wait for a real request, never a prefetched/static shell.
  await connection();
  if (!isSupabaseConfigured()) redirect("/login?notice=session");
  const supabase = await createClient();
  // Fetch the current user from Auth; never authorize using a cookie's user object.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?notice=session");
  const name =
    [
      user.user_metadata.display_name,
      user.user_metadata.full_name,
      user.user_metadata.name,
    ].find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    ) ?? "Neighbor";
  return (
    <AuthShell
      title="Your account"
      description="Your place in the ZUNO neighborhood."
    >
      <dl className="account-facts">
        <div>
          <dt>Display name</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
      </dl>
      <p className="auth-hint">
        Manage the items you share with your neighborhood.
      </p>
      <p>
        <Link className="button button-primary" href="/account/listings">
          Your listings
        </Link>
      </p>
      <p>
        <Link className="button button-outline" href="/account/saved">
          Saved items
        </Link>
      </p>
      <p>
        <Link className="button button-outline" href="/messages">
          Messages
        </Link>
      </p>
      <LogoutButton />
    </AuthShell>
  );
}
export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <main className="shell detail-message" role="status">
          Loading your account…
        </main>
      }
    >
      <Account />
    </Suspense>
  );
}
