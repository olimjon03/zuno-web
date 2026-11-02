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
    typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : "Neighbor";
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
        You’re signed in. Marketplace listings are still samples; posting and
        messaging are coming next.
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
