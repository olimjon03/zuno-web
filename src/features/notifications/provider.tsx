"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createRefreshQueue } from "@/features/messages/refresh-queue";
import { parseNotificationSnapshot, type NotificationSnapshot } from "./model";
const empty:NotificationSnapshot={items:[],unread_count:0};
type NotificationsContext={snapshot:NotificationSnapshot;ready:boolean;userId:string|null;loading:boolean;error:boolean;readError:boolean;refresh:()=>void;markRead:(id?:string)=>Promise<boolean>};
const Context=createContext<NotificationsContext>({snapshot:empty,ready:false,userId:null,loading:false,error:false,readError:false,refresh:()=>{},markRead:async()=>false});
export function NotificationsProvider({children}:{children:ReactNode}){
 const [snapshot,setSnapshot]=useState(empty),[ready,setReady]=useState(!isSupabaseConfigured()),[userId,setUserId]=useState<string|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(false),[readError,setReadError]=useState(false);
 const session=useRef<{id:string|null;generation:number;refresh:()=>void}>({id:null,generation:0,refresh:()=>{}});
 useEffect(()=>{
  if(!isSupabaseConfigured())return;
  const db=createClient();const lifecycle=session.current;let alive=true;let recipient:string|null|undefined;let connected=false;let disconnect:(()=>void)|undefined;
  const refresh=createRefreshQueue(async()=>{
   const id=recipient,version=session.current.generation;
   if(!alive||!id||document.hidden)return;
   try{
    const response=await db.rpc("get_my_notifications");
    if(response.error)throw response.error;
    const next=parseNotificationSnapshot(response.data);
    if(alive&&version===session.current.generation){setSnapshot(next);setError(false);setLoading(false);}
   }catch{if(alive&&version===session.current.generation){setSnapshot(empty);setError(true);setLoading(false);}}
  },()=>{if(alive){setError(true);setLoading(false);}});
  session.current.refresh=()=>refresh.request();
  const sync=(_event:string,auth:Session|null)=>{
   const next=auth?.user.id??null;if(next===recipient)return;
   recipient=next;const version=++session.current.generation;session.current.id=next;setUserId(next);setReady(true);setSnapshot(empty);setError(false);setReadError(false);setLoading(Boolean(next));connected=false;disconnect?.();disconnect=undefined;
   if(!next)return;
   void Promise.resolve().then(async()=>{
    if(!alive||version!==session.current.generation)return;
    await db.realtime.setAuth(auth!.access_token);
    if(!alive||version!==session.current.generation)return;
    const channel=db.channel(`zuno-notifications-${next}-${crypto.randomUUID()}`).on("postgres_changes",{event:"*",schema:"public",table:"notifications",filter:`user_id=eq.${next}`},()=>refresh.request()).subscribe(status=>{if(alive&&version===session.current.generation){connected=status==="SUBSCRIBED";if(connected)refresh.request();}});
    disconnect=()=>{void db.removeChannel(channel);};refresh.request();
   }).catch(()=>{if(alive&&version===session.current.generation)refresh.request();});
  };
  const {data:{subscription}}=db.auth.onAuthStateChange(sync);
  const reconcile=()=>{void db.auth.getSession().then(({data,error})=>{if(alive&&!error)sync("INITIAL_SESSION",data.session);}).catch(()=>{});};
  const changed=()=>{if(!document.hidden)refresh.request();};
  let lastPoll=Date.now();
  const timer=setInterval(()=>{const now=Date.now();if(!connected||now-lastPoll>=60000){lastPoll=now;refresh.request();}},30000);
  window.addEventListener("zuno:auth-route",reconcile);window.addEventListener("focus",changed);document.addEventListener("visibilitychange",changed);
  return()=>{alive=false;++lifecycle.generation;lifecycle.id=null;lifecycle.refresh=()=>{};disconnect?.();subscription.unsubscribe();refresh.dispose();clearInterval(timer);window.removeEventListener("zuno:auth-route",reconcile);window.removeEventListener("focus",changed);document.removeEventListener("visibilitychange",changed);};
 },[]);
 const refresh=useCallback(()=>session.current.refresh(),[]);
 const markRead=useCallback(async(id?:string)=>{
  const version=session.current.generation,expectedUser=session.current.id;if(!expectedUser)return false;
  try{
   const result=await createClient().rpc("mark_notification_read",{p_id:id??null,p_expected_user_id:expectedUser});
   if(version!==session.current.generation)return false;
   if(result.error)throw result.error;
   setReadError(false);setSnapshot(current=>({items:current.items.map(item=>!id||item.id===id?{...item,read_at:item.read_at??new Date().toISOString()}:item),unread_count:id?Math.max(0,current.unread_count-Number(current.items.some(item=>item.id===id&&!item.read_at))):0}));session.current.refresh();return true;
  }catch{if(version===session.current.generation)setReadError(true);return false;}
 },[]);
 return <Context.Provider value={{snapshot,ready,userId,loading,error,readError,refresh,markRead}}>{children}</Context.Provider>;
}
export function useNotifications(){return useContext(Context);}
