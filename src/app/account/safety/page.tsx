import { Text } from "@/features/language/provider";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SectionLoading } from "@/components/layout/section-loading";
import { SafetyHeader } from "@/features/moderation/page-header";
import { BlockForm } from "@/features/moderation/safety-controls";
import { reportReasons,type ReportReason } from "@/features/moderation/validation";
export const metadata:Metadata={title:"Safety & privacy | ZUNO",robots:{index:false,follow:false}};
async function SafetyPage(){
  "use cache: private";
  cacheLife({ stale: 30 });
 const db=await createClient();const {data:{user},error}=await db.auth.getUser();if(error||!user)redirect("/login?notice=session");
 const [blocks,reports,moderator]=await Promise.all([db.rpc("get_blocked_users"),db.from("listing_reports").select("id,listing_title,reason,status,created_at").eq("reporter_id",user.id).order("created_at",{ascending:false}).limit(100),db.rpc("is_moderator")]);
 const unavailable=Boolean(blocks.error||reports.error);
 return <main className="shell manage-page safety-page"><SafetyHeader/><h1><Text>{"Safety & privacy"}</Text></h1><p><Text>{"Manage blocked users and follow your listing reports."}</Text></p>{unavailable ? <section className="safety-card"><h2><Text>{"Safety tools unavailable"}</Text></h2><p><Text>{"We couldn’t load your safety settings. Try again shortly."}</Text></p><Link className="button button-outline" href="/account/safety"><Text>{"Retry"}</Text></Link></section> : <><section className="safety-card"><h2><Text>{"Blocked users"}</Text></h2><p><Text>{"Blocking stops new chats and messages in both directions. Previous messages and public listings remain visible."}</Text></p>{!blocks.data?.length ? <p><Text>{"You haven’t blocked anyone."}</Text></p> : <ul className="safety-list">{(blocks.data as {id:string;display_name:string}[]).map(person=><li key={person.id}><h3><Link href={`/neighbors/${person.id}`}>{person.display_name}</Link></h3><BlockForm userId={person.id} name={person.display_name} blocked/></li>)}</ul>}</section><section className="safety-card"><h2><Text>{"Your reports"}</Text></h2><p className="auth-hint"><Text>{"Latest 100 reports. Reporting does not automatically remove an item."}</Text></p>{!reports.data?.length ? <p><Text>{"No reports submitted."}</Text></p> : <ul className="safety-list">{reports.data.map(report=><li key={report.id}><h3>{report.listing_title}</h3><p><Text>{reportReasons[report.reason as ReportReason]??report.reason}</Text> · <strong>{report.status==="open" ? <Text>{"Awaiting review"}</Text> : report.status==="removed" ? <Text>{"Listing hidden"}</Text> : <Text>{"Reviewed — no removal"}</Text>}</strong></p></li>)}</ul>}</section></>}{!moderator.error&&moderator.data===true&&<Link className="button button-outline" href="/moderation"><Text>{"Open moderation queue"}</Text></Link>}<p><Link href="/help"><Text>{"Safety tips & help"}</Text></Link></p></main>;
}
export default function Page(){return <Suspense fallback={<SectionLoading message="Loading safety settings…"/>}><SafetyPage/></Suspense>;}
