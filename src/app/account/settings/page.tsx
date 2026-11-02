import { AvatarForm } from "@/features/profile/avatar-form";
import { Avatar } from "@/features/profile/avatar";
import Link from "next/link";
import { UnreadBadge } from "@/features/messages/unread-provider";
import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AuthShell } from "@/features/auth/auth-shell";
import { ProfileForm } from "@/features/profile/profile-form";
import { LogoutButton } from "@/features/auth/logout-button";
export const metadata: Metadata = {
  title: "Profile settings | ZUNO",
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
  const [profileResult, areaResult, avatarResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name,neighborhood_id")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("neighborhoods").select("id,name").order("id"),
    supabase.from("profiles").select("avatar_path").eq("id",user.id).maybeSingle(),
  ]);
  if (profileResult.error || !profileResult.data || areaResult.error)
    throw new Error("Your profile is temporarily unavailable.");
  const profile = profileResult.data;
  const neighborhoods = (areaResult.data ?? []).map((area) => ({
    id: Number(area.id),
    name: area.name as string,
  }));
  return (
    <AuthShell
      title="Profile settings"
      description="Your place in the ZUNO neighborhood."
    >
      <dl className="account-facts">
        <div>
          <dt>Display name</dt>
          <dd>{profile.display_name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
      </dl>
      <Avatar name={profile.display_name} path={avatarResult.data?.avatar_path}/><AvatarForm/>
      <ProfileForm
        displayName={profile.display_name}
        neighborhoodId={
          profile.neighborhood_id === null
            ? null
            : Number(profile.neighborhood_id)
        }
        neighborhoods={neighborhoods}
      />
      <p><Link href={`/neighbors/${user.id}`}>View public profile</Link></p><p><Link href="/account">Back to My ZUNO</Link></p><p className="auth-hint">
        Manage the items you share with your neighborhood.
      </p>
      <nav className="account-nav" aria-label="Account navigation">
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
            Messages <UnreadBadge />
          </Link>
        </p>
        <LogoutButton />
      </nav>
    </AuthShell>
  );
}
export default function AccountSettingsPage() {
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
