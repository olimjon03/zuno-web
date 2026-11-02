import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound,redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SectionLoading } from "@/components/layout/section-loading";
import { SafetyHeader } from "@/features/moderation/page-header";
import { ReviewForm } from "@/features/moderation/review-form";
import { reportReasons,type ReportReason } from "@/features/moderation/validation";
export const metadata:Metadata={title:"Moderation | ZUNO",robots:{index:false,follow:false}};
type Report={id:string;listing_id:string|null;listing_title:string;reason:ReportReason;details:string;reporter_name:string;created_at:string};
async function Queue(){
 await connection();const db=await createClient();const {data:{user},error}=await db.auth.getUser();if(error||!user)redirect("/login?notice=session");
 const role=await db.rpc("is_moderator");if(role.error)throw Error("Moderation is temporarily unavailable.");if(role.data!==true)notFound();
 const {data,error:queueError}=await db.rpc("get_moderation_queue");if(queueError)throw Error("Reports could not be loaded.");
 return <main className="shell manage-page safety-page"><SafetyHeader/><h1>Moderation queue</h1><p>Oldest 100 open reports. Review the concern before deciding; hiding an item prevents its owner from restoring it.</p>{!data?.length ? <p>No reports awaiting review.</p> : (data as Report[]).map(report=><article className="safety-card" key={report.id}><h2>{report.listing_title}</h2>{report.listing_id&&<Link href={`/listings/${report.listing_id}`}>View listing</Link>}<p><strong>{reportReasons[report.reason]}</strong> · Reported by {report.reporter_name}</p><p className="report-details">{report.details||"No additional details."}</p><time dateTime={report.created_at}>{new Date(report.created_at).toISOString().slice(0,10)}</time><ReviewForm reportId={report.id}/></article>)}<Link href="/account/safety">Safety & privacy</Link></main>;
}
export default function Page(){return <Suspense fallback={<SectionLoading message="Loading moderation queue…"/>}><Queue/></Suspense>;}
