import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { Icon } from "@/components/ui/icon";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { InboxList } from "./inbox-list";
import { InboxLiveRefresh } from "./inbox-live-refresh";
import type { InboxEntry } from "./types";
export function MessagesWorkspace({ entries, now, activeId, children }: { entries: InboxEntry[]; now: number; activeId?: string; children?: ReactNode }) {
  return <main className={`messages-workspace ${activeId ? "has-conversation" : "inbox-only"}`}>
    <div className="messages-frame">
      <header className="messages-topbar"><Link href="/" prefetch className="wordmark" aria-label="ZUNO home"><Brand/></Link><BackHomeNav/>
        <nav aria-label="Messages navigation"><Link href="/account/saved" prefetch><Icon name="heart"/>Saved</Link><Link href="/messages" prefetch aria-current="page"><Icon name="chat"/>Messages</Link><Link href="/account" prefetch><Icon name="user"/>My ZUNO</Link></nav>
      </header>
      <div className="messages-columns">
        <aside className="messages-sidebar" aria-label="Conversations"><InboxLiveRefresh/><h1>Messages</h1><InboxList entries={entries} now={now} activeId={activeId}/></aside>
        <section className="messages-detail" aria-label={activeId ? "Selected conversation" : "Conversation preview"}>{children || <div className="messages-welcome"><span><Icon name="chat" width="32" height="32"/></span><h2>A little closer, one message at a time.</h2><p>Choose a conversation to share photos, send files and make plans with a neighbor.</p><Link href="/" className="button button-outline">Explore marketplace</Link></div>}</section>
      </div>
    </div>
  </main>;
}
