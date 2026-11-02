import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Icon, type IconName } from "@/components/ui/icon";
import { UnreadBadge } from "@/features/messages/unread-provider";
import { LogoutButton } from "@/features/auth/logout-button";
import { ExploreMenu } from "@/features/account/explore-menu";
export const metadata: Metadata = { title: "My ZUNO | ZUNO", robots: { index: false, follow: false } };
const links: { href: string; name: string; icon: IconName; description: string }[] = [
  { href: "/account/listings", name: "Your listings", icon: "list", description: "Manage the items you’re selling." },
  { href: "/account/saved", name: "Saved items", icon: "heart", description: "View the items you’ve saved for later." },
  { href: "/messages", name: "Messages", icon: "chat", description: "Check your conversations with neighbors." },
];
async function Account() {
  await connection();
  if (!isSupabaseConfigured()) redirect("/login?notice=session");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?notice=session");
  const [profileResult, areaResult] = await Promise.all([
    supabase.from("profiles").select("display_name,neighborhood_id").eq("id", user.id).maybeSingle(),
    supabase.from("neighborhoods").select("id,name").order("id"),
  ]);
  if (profileResult.error || !profileResult.data || areaResult.error) throw new Error("Your profile is temporarily unavailable.");
  const profile = profileResult.data;
  const area = areaResult.data?.find(item => Number(item.id) === Number(profile.neighborhood_id))?.name ?? "Choose your neighborhood";
  return <div className="account-dashboard">
    <header className="dashboard-header"><Link href="/" className="wordmark">ZUNO</Link><nav aria-label="Marketplace"><Link href="/">Marketplace</Link><Link href="/account/saved">Saved items</Link><Link href="/messages">Messages <UnreadBadge/></Link></nav><Link href="/account/settings" aria-label="Profile settings"><Icon name="settings"/></Link></header>
    <div className="dashboard-layout"><aside className="dashboard-sidebar"><nav aria-label="Account"><Link href="/account" aria-current="page"><Icon name="user"/>My ZUNO</Link>{links.map(link => <Link key={link.href} href={link.href}><Icon name={link.icon}/>{link.name}</Link>)}<Link href="/account/settings"><Icon name="settings"/>Settings</Link><Link href="/help"><Icon name="help"/>Help center</Link></nav></aside>
    <main className="dashboard-content"><h1>My ZUNO</h1><p className="dashboard-subtitle">Your neighborhood, your little corner.</p>
      <section className="account-card profile-summary" aria-label="Your profile"><span className="profile-avatar">{Array.from(profile.display_name as string)[0]?.toUpperCase() || "N"}</span><div><h2>{profile.display_name}</h2><p><Icon name="pin"/>{area}</p></div><Link className="button button-outline" href="/account/settings">Edit profile</Link></section>
      <nav className="account-shortcuts" aria-label="Quick actions">{links.map((link, index) => <Link className="account-card shortcut" href={link.href} key={link.href}><span className={`shortcut-icon shortcut-${index}`}><Icon name={link.icon}/></span><span><strong>{link.name}{link.href === "/messages" && <UnreadBadge/>}</strong><small>{link.description}</small></span><Icon name="chevron"/></Link>)}</nav>
      <div className="account-highlight"><section className="sell-panel"><h2>Make room for something new.</h2><p>Give your items a new home in your neighborhood.</p><Link className="button" href="/sell">Sell an Item<Icon name="arrow"/></Link></section><section className="account-card neighborhood-panel"><Icon name="pin"/><div><p>Your neighborhood</p><h2>{area}</h2><p>Good things happen close to home.</p><Link href="/account/settings#profile-neighborhood">Change neighborhood <Icon name="arrow"/></Link></div></section></div>
      <ExploreMenu/>
      <section className="account-card help-panel"><h2>Help & more</h2><Link href="/help"><Icon name="help"/>Help center<Icon name="chevron"/></Link><Link href="/help#about"><Icon name="book"/>About ZUNO<Icon name="chevron"/></Link></section>
      <footer className="dashboard-footer"><LogoutButton/><p>Buy · Sell · Connect Locally</p></footer>
    </main></div>
  </div>;
}
export default function AccountPage() { return <Suspense fallback={<main className="shell detail-message" role="status">Loading your account…</main>}><Account/></Suspense>; }
