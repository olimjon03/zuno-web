"use client";
import { Text, useT } from "@/features/language/provider";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { UnreadBadge } from "@/features/messages/unread-provider";

import { mobileMenuItems, isNavigationActive } from "./navigation";

export function MobileNav() {
  const t = useT();
  const path = usePathname();
  if (path === "/account/settings" || path === "/login" || path === "/signup" || path.startsWith("/auth/") || path.startsWith("/messages/")) return null;

  return (
    <nav className={`mobile-bottom-nav ${path === "/account" ? "nav-dark" : ""}`} aria-label={t("Main navigation")}>
      {mobileMenuItems.map(({ href, label, icon }) => {
        const active = isNavigationActive(path, href, true);
        return (
          <Link prefetch={true} key={href} href={href} aria-current={active ? "page" : undefined} className={href === "/sell" ? "nav-sell" : undefined}>
            <span><Icon name={icon}/>{href === "/messages" && <UnreadBadge/>}</span>
            <Text>{label}</Text>
          </Link>
        );
      })}
    </nav>
  );
}
