"use client";
import { Text, useT, useLanguage } from "@/features/language/provider";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { PersonAvatar } from "./person-avatar";
import { useHydrated } from "@/lib/use-hydrated";
import { UnreadBadge, useUnread } from "./unread-provider";
import { filterInbox, inboxTime } from "./inbox-model";
import type { InboxEntry } from "./types";
function ItemImage({id,title}:{id:string|null;title:string}) {
  const [failed,setFailed]=useState(false);
  return <span className="inbox-item-image">{id&&!failed ? <Image src={`/listing-photos/${id}`} alt={title} width={56} height={56} unoptimized onError={()=>setFailed(true)}/> : <Icon name="image"/>}</span>;
}
export function InboxList({entries,now,activeId}:{entries:InboxEntry[];now:number;activeId?:string}) {
  const t = useT();
  const { language } = useLanguage();
  const [query,setQuery]=useState("");
  const [unreadOnly,setUnreadOnly]=useState(false);
  const {counts,available}=useUnread();
  const hydrated=useHydrated();
  const unreadUnavailable=unreadOnly && hydrated && !available;
  const visible=filterInbox(entries,query,unreadOnly,hydrated ? counts : {});
  return <>
    <label className="inbox-search"><Icon name="search"/><span className="sr-only"><Text>{"Search conversations"}</Text></span><input type="search" placeholder={t("Search conversations")} value={query} onChange={event=>setQuery(event.target.value)}/></label>
    <div className="inbox-filters" role="group" aria-label={t("Conversation filters")}><button aria-pressed={!unreadOnly} onClick={()=>setUnreadOnly(false)}><Text>{"All"}</Text></button><button aria-pressed={unreadOnly} disabled={!hydrated||!available} onClick={()=>setUnreadOnly(true)}><Text>{"Unread"}</Text></button></div>
    <p role="status" className="sr-only">{t("{count} conversations shown.", { count: visible.length })}</p>
    {unreadUnavailable ? <section className="inbox-empty"><h2><Text>{"Unread status unavailable"}</Text></h2><p><Text>{"View all conversations while unread counts reconnect."}</Text></p><button className="button button-outline" onClick={()=>setUnreadOnly(false)}><Text>{"View all conversations"}</Text></button></section> : visible.length ? <ul className="inbox-list">{visible.map(entry=><li key={entry.id}><Link prefetch={true} aria-current={entry.id === activeId ? "page" : undefined} className={`inbox-card ${hydrated&&(counts[entry.id]??0)>0 ? "has-unread" : ""}`} href={`/messages/${entry.id}`} aria-label={t("Chat with {name} about {title}", { name: entry.otherName, title: entry.listingTitle })}>
      <PersonAvatar key={`${entry.otherId}-${entry.avatarPath}`} name={entry.otherName} path={entry.avatarPath}/>
      <span className="inbox-copy"><span className="inbox-name"><strong>{entry.otherName}</strong><UnreadBadge conversationId={entry.id}/></span><span className="inbox-snippet">{entry.lastMessage || <Text>{"Open the conversation"}</Text>}</span><span className="inbox-meta"><span title={entry.listingTitle}>{entry.neighborhood || entry.listingTitle}</span><span aria-hidden="true">·</span><time dateTime={entry.lastMessageAt}>{inboxTime(entry.lastMessageAt,now,language)}</time></span></span>
      <ItemImage key={entry.thumbnailId} id={entry.thumbnailId} title={entry.listingTitle}/>
    </Link></li>)}</ul> : <section className="inbox-empty"><Icon name="chat"/><h2>{entries.length ? <Text>{"No matching conversations"}</Text> : <Text>{"No conversations yet"}</Text>}</h2><p>{entries.length ? <Text>{"Try another search or view all conversations."}</Text> : <Text>{"Find an item you like and contact its seller."}</Text>}</p>{entries.length ? <button className="button button-outline" onClick={()=>{setQuery("");setUnreadOnly(false);}}><Text>{"Clear filters"}</Text></button> : <Link className="button button-primary" href="/"><Text>{"Explore marketplace"}</Text></Link>}</section>}
  </>;
}
