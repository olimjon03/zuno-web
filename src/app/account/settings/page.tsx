import { SectionLoading } from "@/components/layout/section-loading";
import { AvatarForm } from "@/features/profile/avatar-form";
import { Avatar } from "@/features/profile/avatar";
import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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
    <div className="profile-settings-page">
      <header className="shell detail-header settings-header"><Link href="/" className="wordmark" aria-label="ZUNO home"><Brand/></Link><BackHomeNav/></header>
      <main className="settings-main settings-soft"><h1>Profile settings</h1><p className="settings-intro">Your place in the ZUNO neighborhood.</p>
      <section className="settings-profile" aria-label="Your profile">
      <div className="settings-identity"><Avatar name={profile.display_name} path={avatarResult.data?.avatar_path}/><div><h2>{profile.display_name}</h2><p>{neighborhoods.find(area=>area.id===Number(profile.neighborhood_id))?.name || "Neighborhood not selected"}</p><Link href={`/neighbors/${user.id}`}>View public profile</Link></div></div>
      <details className="settings-photo"><summary>Change photo</summary><AvatarForm/></details>
      </section>
      <ProfileForm
        displayName={profile.display_name}
        email={user.email ?? ""}
        neighborhoodId={
          profile.neighborhood_id === null
            ? null
            : Number(profile.neighborhood_id)
        }
        neighborhoods={neighborhoods}
      />
      <div className="settings-logout"><LogoutButton/></div>
      <p className="auth-tagline">Buy · Sell · Connect Locally</p>
      </main>
    </div>
  );
}
export default function AccountSettingsPage() {
  return (
    <Suspense
      fallback={
        <SectionLoading message="Loading your account…"/>
      }
    >
      <Account />
    </Suspense>
  );
}
