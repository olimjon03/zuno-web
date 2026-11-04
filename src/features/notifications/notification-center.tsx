"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useIconPopover } from "@/components/ui/use-icon-popover";
import { useLanguage, useT } from "@/features/language/provider";
import { useUnread } from "@/features/messages/unread-provider";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { parseMessageAlerts, type MessageAlert } from "./model";
import { useNotifications } from "./provider";
import "./notification-center.css";
export function NotificationCenter(){
 const t=useT(),{language}=useLanguage(),unread=useUnread(),notifications=useNotifications();
 const {root,trigger,panel,open,position,toggle,close,id}=useIconPopover(370,500);
 const [version,setVersion]=useState(0),[pending,setPending]=useState(false);
 const [chat,setChat]=useState<{key:string;items:MessageAlert[];error:boolean}>({key:"",items:[],error:false});
 const {userId,snapshot,ready,loading,error,readError,refresh,markRead}=notifications;
 const key=`${userId}:${JSON.stringify(unread.counts)}`;
 useEffect(()=>{if(open){refresh();panel.current?.querySelector<HTMLButtonElement>('[data-notification-close]')?.focus();}},[open,panel,refresh]);
 useEffect(()=>{
  if(!open||!userId||!unread.total)return;
  let active=true;
  void Promise.resolve(createClient().rpc("get_inbox")).then(({data,error})=>{if(active)setChat({key,items:error?[]:parseMessageAlerts(data,unread.counts),error:Boolean(error)});}).catch(()=>{if(active)setChat({key,items:[],error:true});});
  return()=>{active=false;};
 },[open,userId,unread.total,unread.counts,key,version]);
 const count=userId?snapshot.unread_count+(unread.available?unread.total:0):0;
 const messages=chat.key===key&&unread.total>0?chat.items:[];
 const chatLoading=Boolean(userId&&unread.total>0&&chat.key!==key);
 const retry=()=>{refresh();window.dispatchEvent(new Event("zuno:messages-read"));setVersion(value=>value+1);};
 return <div ref={root} className="notification-center">
  <button ref={trigger} type="button" className="header-icon-button notification-trigger" aria-label={count?t("Notifications, {count} unread",{count}):t("Notifications")} title={t("Notifications")} aria-expanded={open} aria-haspopup="dialog" aria-controls={id} onClick={toggle}><Icon name="bell"/>{count>0&&<span className="notification-count" aria-hidden="true">{count>99?"99+":count}</span>}</button>
  {open&&<div ref={panel} id={id} style={position} className="notification-panel icon-popover" role="dialog" aria-label={t("Notifications")}>
   <header className="notification-panel-heading"><h2>{t("Notifications")}</h2><button data-notification-close type="button" aria-label={t("Close")} onClick={()=>close(true)}><Icon name="close"/></button></header>
   {!isSupabaseConfigured()?<p className="notification-note">{t("Notifications are temporarily unavailable.")}</p>:!ready?<p className="notification-note" role="status">{t("Loading notifications…")}</p>:!userId?<div className="notification-empty"><Icon name="bell"/><p>{t("Sign in to see your notifications.")}</p><Link href="/login" className="button button-primary" onClick={()=>close()}>{t("Log in")}</Link></div>:<>
    {(error||!unread.available||(chat.key===key&&chat.error))&&<div className="notification-error" role="alert"><p>{t("Some notifications could not be loaded.")}</p><button type="button" onClick={retry}>{t("Try again")}</button></div>}
    {readError&&<p className="notification-error" role="alert">{t("Could not mark notifications as read. Please try again.")}</p>}
    <section aria-label={t("Messages")} className="notification-section"><h3>{t("Messages")}</h3>
     {!unread.available||(chat.key===key&&chat.error)?<p className="notification-note">{t("Some notifications could not be loaded.")}</p>:chatLoading?<p className="notification-note" role="status">{t("Loading notifications…")}</p>:messages.length?messages.map(item=><Link key={item.id} className="notification-row is-unread" href={`/messages/${item.id}`} onClick={()=>close()}><span className="notification-row-icon"><Icon name="chat"/></span><span className="notification-copy"><strong>{item.name}</strong><small>{item.preview||t("New message")}</small></span><span className="notification-count inline-count">{item.count>99?"99+":item.count}</span></Link>):<p className="notification-note">{t("No unread messages.")}</p>}
     <Link className="notification-view-messages" href="/messages" onClick={()=>close()}>{t("Open messages")}<Icon name="chevron"/></Link>
    </section>
    <section aria-label={t("From ZUNO")} className="notification-section"><div className="notification-section-heading"><h3>{t("From ZUNO")}</h3>{snapshot.unread_count>0&&<button type="button" disabled={pending} onClick={async()=>{setPending(true);await markRead();setPending(false);}}>{t("Mark all as read")}</button>}</div>
     {loading?<p className="notification-note" role="status">{t("Loading notifications…")}</p>:snapshot.items.length?snapshot.items.map(item=><Link key={item.id} className={`notification-row ${item.read_at?"":"is-unread"}`} href={item.href} onClick={()=>{if(!item.read_at)void markRead(item.id);close();}}><span className="notification-row-icon"><Icon name={item.kind==="announcement"?"bell":"shield"}/></span><span className="notification-copy"><strong>{t(item.title)}</strong>{item.body&&<small>{item.body}</small>}<time dateTime={item.created_at}>{new Intl.DateTimeFormat(language,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(item.created_at))}</time></span>{!item.read_at&&<span className="notification-unread-dot" aria-label={t("Unread")}/>}</Link>):!error&&<p className="notification-note">{t("No website notifications yet.")}</p>}
    </section>
   </>}
  </div>}
 </div>;
}
