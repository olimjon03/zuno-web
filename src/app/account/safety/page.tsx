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
 return <main className="shell manage-page safety-page"><SafetyHeader/><h1>Safety & privacy</h1><p>Manage blocked users and follow your listing reports.</p>{unavailable ? <section className="safety-card"><h2>Safety tools unavailable</h2><p>We couldn’t load your safety settings. Try again shortly.</p><Link className="button button-outline" href="/account/safety">Retry</Link></section> : <><section className="safety-card"><h2>Blocked users</h2><p>Blocking stops new chats and messages in both directions. Previous messages and public listings remain visible.</p>{!blocks.data?.length ? <p>You haven’t blocked anyone.</p> : <ul className="safety-list">{(blocks.data as {id:string;display_name:string}[]).map(person=><li key={person.id}><h3><Link href={`/neighbors/${person.id}`}>{person.display_name}</Link></h3><BlockForm userId={person.id} name={person.display_name} blocked/></li>)}</ul>}</section><section className="safety-card"><h2>Your reports</h2><p className="auth-hint">Latest 100 reports. Reporting does not automatically remove an item.</p>{!reports.data?.length ? <p>No reports submitted.</p> : <ul className="safety-list">{reports.data.map(report=><li key={report.id}><h3>{report.listing_title}</h3><p>{reportReasons[report.reason as ReportReason]??report.reason} · <strong>{report.status==="open" ? "Awaiting review" : report.status==="removed" ? "Listing hidden" : "Reviewed — no removal"}</strong></p></li>)}</ul>}</section></>}{!moderator.error&&moderator.data===true&&<Link className="button button-outline" href="/moderation">Open moderation queue</Link>}<p><Link href="/help">Safety tips & help</Link></p></main>;
}
export default function Page(){return <Suspense fallback={<SectionLoading message="Loading safety settings…"/>}><SafetyPage/></Suspense>;}
