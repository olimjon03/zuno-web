"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { UnreadBadge } from "@/features/messages/unread-provider";
const items: { href: string; label: string; icon: IconName }[] = [{href:"/",label:"Home",icon:"home"},{href:"/account/saved",label:"Saved",icon:"heart"},{href:"/sell",label:"Sell",icon:"plus"},{href:"/messages",label:"Chats",icon:"chat"},{href:"/account",label:"My ZUNO",icon:"user"}];
export function MobileNav() {
 const path = usePathname();
 if (path === "/login" || path === "/signup" || path.startsWith("/auth/") || path.startsWith("/messages/")) return null;
 return <nav className={`mobile-bottom-nav ${path === "/account" ? "nav-dark" : ""}`} aria-label="Main navigation">{items.map(item => {const active = item.href === "/account" ? path === "/account" || path.startsWith("/account/settings") : path === item.href;return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={item.href === "/sell" ? "nav-sell" : undefined}><span><Icon name={item.icon}/>{item.href === "/messages" && <UnreadBadge/>}</span>{item.label}</Link>;})}</nav>;
}
