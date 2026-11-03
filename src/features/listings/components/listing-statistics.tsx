"use client";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Text, useT } from "@/features/language/provider";
import { createClient } from "@/lib/supabase/client";
type Stats = {views:number;likes:number;saves:number;messagers:number;daily:{date:string;views:number}[];listedAt:string};
function valid(value:unknown):value is Stats {
 if(!value || typeof value!=="object") return false;
 const s=value as Stats;
 return [s.views,s.likes,s.saves,s.messagers].every(n=>Number.isSafeInteger(n)&&n>=0)&&Array.isArray(s.daily)&&s.daily.every(d=>/^\d{4}-\d{2}-\d{2}$/.test(d.date)&&Number.isSafeInteger(d.views)&&d.views>=0)&&typeof s.listedAt==="string"&&Number.isFinite(Date.parse(s.listedAt));
}
export function ListingStatistics({listingId}:{listingId:string}) {
 const t=useT();
 const [days,setDays]=useState(7), [retry,setRetry]=useState(0);
 const [state,setState]=useState<{days:number;data?:Stats;error?:boolean}>({days:7});
 useEffect(()=>{
  let current=true;const abort=new AbortController();
  async function load(){
   try {
    const {data,error}=await createClient().rpc("get_owned_listing_statistics",{p_listing_id:listingId,p_days:days}).abortSignal(abort.signal);
    if(current)setState(error||!valid(data)?{days,error:true}:{days,data});
   }catch{if(current)setState({days,error:true});}
  }
  void load();return ()=>{current=false;abort.abort();};
 },[listingId,days,retry]);
 const stats=state.days===days?state.data:undefined;
 const metrics:{key:"views"|"likes"|"messagers"|"saves";label:string;icon:IconName}[]=[{key:"views",label:"Views",icon:"eye"},{key:"likes",label:"Likes",icon:"heart"},{key:"messagers",label:"People messaged",icon:"chat"},{key:"saves",label:"Saves",icon:"bookmark"}];
 const end=stats ? new Date() : new Date(0);end.setUTCHours(0,0,0,0);
 const start=days===0&&stats?new Date(stats.listedAt):new Date(end.getTime()-(days-1)*86400000);start.setUTCHours(0,0,0,0);
 // Aggregate long histories into at most 30 consecutive buckets; never invent missing historical totals.
 const totalDays=Math.max(1,Math.round((end.getTime()-start.getTime())/86400000)+1);
 const bucketSize=Math.ceil(totalDays/30);
 const bars=Array.from({length:Math.ceil(totalDays/bucketSize)},(_,i)=>{const from=new Date(start.getTime()+i*bucketSize*86400000).toISOString().slice(0,10);const to=new Date(Math.min(end.getTime(),start.getTime()+((i+1)*bucketSize-1)*86400000)).toISOString().slice(0,10);return {date:from,views:stats?.daily.filter(d=>d.date>=from&&d.date<=to).reduce((n,d)=>n+d.views,0)??0};});
 const max=Math.max(1,...bars.map(b=>b.views));
 return <section className="statistics-content" aria-label={t("Listing statistics")}>
 <div className="statistics-period" role="group" aria-label={t("Time period")}>{[[7,"7 days"],[30,"30 days"],[0,"All time"]].map(([n,label])=><button key={n} aria-pressed={days===n} onClick={()=>{setState({days:Number(n)});setDays(Number(n));setRetry(r=>r+1);}}><Text>{String(label)}</Text></button>)}</div>
 {state.days===days&&state.error?<div className="statistics-error" role="alert"><p><Text>Statistics are temporarily unavailable. Please try again.</Text></p><button className="button button-outline" onClick={()=>{setState({days});setRetry(r=>r+1);}}><Text>Try again</Text></button></div>:!stats?<p role="status" className="statistics-loading"><Text>Loading listing statistics…</Text></p>:<>
 <div className="statistics-metrics">{metrics.map(m=><div key={m.key} className={`statistics-metric statistics-${m.key}`}><Icon name={m.icon}/><div><strong>{stats[m.key].toLocaleString("en-US")}</strong><span><Text>{m.label}</Text></span></div></div>)}</div>
 <div className="statistics-chart"><h2><Text>Views over time</Text></h2><div className="statistics-bars" role="img" aria-label={t("Views over time")}>{bars.map(b=><div key={b.date} title={`${b.date}: ${b.views}`}><span>{b.views}</span><i style={{height:`${Math.max(2,b.views/max*140)}px`}}/><small>{b.date.slice(5)}</small></div>)}</div><p className="auth-hint"><Text>Daily view history starts when statistics tracking is enabled. Dates use UTC.</Text></p><details><summary><Text>View data table</Text></summary><table><thead><tr><th><Text>Date</Text></th><th><Text>Views</Text></th></tr></thead><tbody>{bars.map(b=><tr key={b.date}><td>{b.date}</td><td>{b.views}</td></tr>)}</tbody></table></details></div>
 <p className="statistics-explanation"><Text>Likes and saves count people who still have this item liked or saved in the selected period. Messages count distinct buyers who sent a message.</Text></p>
 <div className="statistics-listed"><Text>Listed on</Text><strong>{stats.listedAt.slice(0,10)}</strong></div>
 </>}
 </section>;
}
