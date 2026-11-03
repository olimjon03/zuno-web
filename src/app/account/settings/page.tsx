import { getAccountProfile } from "@/features/profile/server/data";
import { SectionLoading } from "@/components/layout/section-loading";
import { AvatarForm } from "@/features/profile/avatar-form";
import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { ProfileForm } from "@/features/profile/profile-form";
import { LogoutButton } from "@/features/auth/logout-button";
export const metadata: Metadata = {
  title: "Profile settings | ZUNO",
  robots: { index: false, follow: false },
};

async function Account() {
  "use cache: private";
  // Browser/session-only reuse; never a shared production server cache.
  cacheLife({ stale: 30 });
  const {user, profile, neighborhoods, avatarPath} = await getAccountProfile();
  return (
    <div className="profile-settings-page">
      <header className="shell detail-header settings-header"><Link prefetch={true} href="/" className="wordmark" aria-label="ZUNO home"><Brand/></Link><BackHomeNav/></header>
      <main className="settings-main settings-soft"><h1>Profile settings</h1><p className="settings-intro">Your place in the ZUNO neighborhood.</p>
      <section className="settings-profile" aria-label="Your profile">
      <div className="settings-identity"><AvatarForm name={profile.display_name} path={avatarPath}/><div><h2>{profile.display_name}</h2><p>{neighborhoods.find(area=>area.id===Number(profile.neighborhood_id))?.name || "Neighborhood not selected"}</p><Link prefetch={true} href={`/neighbors/${user.id}`}>View public profile</Link></div></div>
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
