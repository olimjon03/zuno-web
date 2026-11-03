"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/features/profile/avatar";
import { useHydrated } from "@/lib/use-hydrated";
import { UnreadBadge, useUnread } from "./unread-provider";
import { filterInbox, inboxTime } from "./inbox-model";
import type { InboxEntry } from "./types";
function ProfileImage({name,path}:{name:string;path:string|null}) {
  const [failed,setFailed]=useState(false);
  return <span className="inbox-avatar" onErrorCapture={()=>setFailed(true)}><Avatar name={name} path={failed ? null : path}/></span>;
}
function ItemImage({id,title}:{id:string|null;title:string}) {
  const [failed,setFailed]=useState(false);
  return <span className="inbox-item-image">{id&&!failed ? <Image src={`/listing-photos/${id}`} alt={title} width={56} height={56} unoptimized onError={()=>setFailed(true)}/> : <Icon name="image"/>}</span>;
}
export function InboxList({entries,now}:{entries:InboxEntry[];now:number}) {
  const [query,setQuery]=useState("");
  const [unreadOnly,setUnreadOnly]=useState(false);
  const {counts,available}=useUnread();
  const hydrated=useHydrated();
  const unreadUnavailable=unreadOnly && hydrated && !available;
  const visible=filterInbox(entries,query,unreadOnly,hydrated ? counts : {});
  return <>
    <label className="inbox-search"><Icon name="search"/><span className="sr-only">Search conversations</span><input type="search" placeholder="Search conversations" value={query} onChange={event=>setQuery(event.target.value)}/></label>
    <div className="inbox-filters" role="group" aria-label="Conversation filters"><button aria-pressed={!unreadOnly} onClick={()=>setUnreadOnly(false)}>All</button><button aria-pressed={unreadOnly} disabled={!hydrated||!available} onClick={()=>setUnreadOnly(true)}>Unread</button></div>
    <p role="status" className="sr-only">{visible.length} conversations shown.</p>
    {unreadUnavailable ? <section className="inbox-empty"><h2>Unread status unavailable</h2><p>View all conversations while unread counts reconnect.</p><button className="button button-outline" onClick={()=>setUnreadOnly(false)}>View all conversations</button></section> : visible.length ? <ul className="inbox-list">{visible.map(entry=><li key={entry.id}><Link className={`inbox-card ${hydrated&&(counts[entry.id]??0)>0 ? "has-unread" : ""}`} href={`/messages/${entry.id}`} aria-label={`Chat with ${entry.otherName} about ${entry.listingTitle}`}>
      <ProfileImage key={`${entry.otherId}-${entry.avatarPath}`} name={entry.otherName} path={entry.avatarPath}/>
      <span className="inbox-copy"><span className="inbox-name"><strong>{entry.otherName}</strong><UnreadBadge conversationId={entry.id}/></span><span className="inbox-snippet">{entry.lastMessage || "Open the conversation"}</span><span className="inbox-meta"><span title={entry.listingTitle}>{entry.neighborhood || entry.listingTitle}</span><span aria-hidden="true">·</span><time dateTime={entry.lastMessageAt}>{inboxTime(entry.lastMessageAt,now)}</time></span></span>
      <ItemImage key={entry.thumbnailId} id={entry.thumbnailId} title={entry.listingTitle}/>
    </Link></li>)}</ul> : <section className="inbox-empty"><Icon name="chat"/><h2>{entries.length ? "No matching conversations" : "No conversations yet"}</h2><p>{entries.length ? "Try another search or view all conversations." : "Find an item you like and contact its seller."}</p>{entries.length ? <button className="button button-outline" onClick={()=>{setQuery("");setUnreadOnly(false);}}>Clear filters</button> : <Link className="button button-primary" href="/">Explore marketplace</Link>}</section>}
  </>;
}
