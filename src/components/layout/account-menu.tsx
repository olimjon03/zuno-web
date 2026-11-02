import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { UnreadBadge } from "@/features/messages/unread-provider";

import { accountMenuItems, isNavigationActive } from "./navigation";

export function AccountMenu({ current }: { current: string }) {
  return (
    <aside className="dashboard-sidebar">
      <nav aria-label="Account">
        {accountMenuItems.map(({ href, label, icon }) => (
          <Link prefetch={true} key={href} href={href} aria-current={isNavigationActive(current, href) ? "page" : undefined}>
            <Icon name={icon} />
            <span>{label}</span>
            {href === "/messages" && <UnreadBadge />}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
