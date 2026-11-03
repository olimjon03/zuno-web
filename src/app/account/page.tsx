import { getAccountProfile } from "@/features/profile/server/data";
import { SectionLoading } from "@/components/layout/section-loading";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Avatar } from "@/features/profile/avatar";
import { Brand } from "@/components/ui/brand";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { Icon, type IconName } from "@/components/ui/icon";
import { UnreadBadge } from "@/features/messages/unread-provider";
import { LogoutButton } from "@/features/auth/logout-button";
import { AccountMenu } from "@/components/layout/account-menu";
import { ExploreMenu } from "@/features/account/explore-menu";
export const metadata: Metadata = { title: "My ZUNO | ZUNO", robots: { index: false, follow: false } };
const links: { href: string; name: string; icon: IconName; description: string }[] = [
  { href: "/account/listings", name: "Your listings", icon: "list", description: "Manage the items you’re selling." },
  { href: "/account/saved", name: "Saved items", icon: "heart", description: "View the items you’ve saved for later." },
  { href: "/messages", name: "Messages", icon: "chat", description: "Check your conversations with neighbors." },
];
async function Account() {
  "use cache: private";
  // Browser/session-only reuse; never a shared production server cache.
  cacheLife({ stale: 30 });
  const {user, profile, neighborhoods, avatarPath} = await getAccountProfile();
  const area = neighborhoods.find(item => item.id === profile.neighborhood_id)?.name ?? "Choose your neighborhood";
  return <div className="account-dashboard">
    <header className="dashboard-header"><Link prefetch={true} href="/" className="wordmark"><Brand/></Link><nav aria-label="Marketplace"><Link prefetch={true} href="/account/saved">Saved</Link><Link prefetch={true} href="/messages">Messages <UnreadBadge/></Link><Link prefetch={true} className="button button-primary" href="/sell">Sell</Link></nav><Link prefetch={true} href="/account/settings" aria-label="Profile settings"><Icon name="settings"/></Link><BackHomeNav/></header>
    <div className="dashboard-layout"><AccountMenu current="/account"/>
    <main className="dashboard-content"><h1>My ZUNO</h1><p className="dashboard-subtitle">Your neighborhood, your little corner.</p>
      <section className="account-card profile-summary" aria-label="Your profile"><Avatar name={profile.display_name} path={avatarPath}/><div><h2><Link prefetch={true} href={`/neighbors/${user.id}`}>{profile.display_name}</Link></h2><p><Icon name="pin"/>{area}</p></div><Link prefetch={true} className="button button-outline" href="/account/settings">Edit profile</Link></section>
      <nav className="account-shortcuts" aria-label="Quick actions">{links.map((link, index) => <Link prefetch={true} className="account-card shortcut" href={link.href} key={link.href}><span className={`shortcut-icon shortcut-${index}`}><Icon name={link.icon}/></span><span><strong>{link.name}{link.href === "/messages" && <UnreadBadge/>}</strong><small>{link.description}</small></span><Icon name="chevron"/></Link>)}</nav>
      <div className="account-highlight"><section className="sell-panel"><h2>Make room for something new.</h2><p>Give your items a new home in your neighborhood.</p><Link prefetch={true} className="button" href="/sell">Sell an Item<Icon name="arrow"/></Link></section><section className="account-card neighborhood-panel"><Icon name="pin"/><div><p>Your neighborhood</p><h2>{area}</h2><p>Good things happen close to home.</p><Link prefetch={true} href="/account/settings#profile-neighborhood">Change neighborhood <Icon name="arrow"/></Link></div></section></div>
      <ExploreMenu/>
      <section className="account-card help-panel"><h2>Help & more</h2><Link prefetch={true} href="/account/safety"><Icon name="shield"/>Safety & privacy<Icon name="chevron"/></Link><Link prefetch={true} href="/account/settings"><Icon name="settings"/>Profile settings<Icon name="chevron"/></Link><Link prefetch={true} href={`/neighbors/${user.id}`}><Icon name="user"/>Public profile<Icon name="chevron"/></Link><Link prefetch={true} href="/help"><Icon name="help"/>Help center<Icon name="chevron"/></Link><Link prefetch={true} href="/help#about"><Icon name="book"/>About ZUNO<Icon name="chevron"/></Link></section>
      <footer className="dashboard-footer"><LogoutButton/><p>Buy · Sell · Connect Locally</p></footer>
    </main></div>
  </div>;
}
export default function AccountPage() { return <Suspense fallback={<SectionLoading message="Loading your account…"/>}><Account/></Suspense>; }
