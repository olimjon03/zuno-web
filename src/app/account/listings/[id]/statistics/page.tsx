import { formatMoney } from "@/features/listings/currency";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import { SectionLoading } from "@/components/layout/section-loading";
import { Text } from "@/features/language/provider";
import { ListingStatistics } from "@/features/listings/components/listing-statistics";
import { isUuid } from "@/features/listings/validation";
import "@/features/listings/components/listing-statistics.css";
export const metadata: Metadata = { title: "Listing statistics | ZUNO", robots: { index: false, follow: false } };
async function Content({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 if (!isUuid(id)) notFound();
 const db = await createClient();
 const { data: { user } } = await db.auth.getUser();
 if (!user) redirect("/login?notice=session");
 const { data: item, error } = await db.from("listings").select("id,title,price,status,neighborhood:neighborhoods(region_code),photos:listing_images(id,sort_order)").eq("id",id).eq("seller_id",user.id).neq("status","removed").maybeSingle();
 if (error) throw new Error("Your listings are temporarily unavailable.");
 if (!item) notFound();
 const neighborhood = (Array.isArray(item.neighborhood) ? item.neighborhood[0] : item.neighborhood) as {region_code?:string} | null;
 const photo = [...item.photos].sort((a,b)=>a.sort_order-b.sort_order)[0];
 return <main className="shell listing-statistics-page"><header className="detail-header"><Link className="wordmark" href="/"><Brand/></Link><BackHomeNav/></header>
 <h1><Text>Listing statistics</Text></h1>
 <div className="statistics-product"><div><h2>{item.title}</h2><p className="owned-price">{formatMoney(Number(item.price), neighborhood?.region_code?.startsWith("UZ-") ? "UZ" : "KR")}</p><span className="statistics-status"><Text>{item.status === "sold" ? "Sold" : item.status === "reserved" ? "Reserved" : "Available"}</Text></span></div>{photo && <Image src={`/listing-photos/${photo.id}`} alt={item.title} width={112} height={112} loading="eager" unoptimized/>}</div>
 <ListingStatistics listingId={id}/>
 <Link className="button button-primary statistics-view" href={`/listings/${id}`}><Text>View listing</Text></Link>
 </main>;
}
export default function Page({params}:{params:Promise<{id:string}>}) {return <Suspense fallback={<SectionLoading message="Loading listing statistics…"/>}><Content params={params}/></Suspense>;}
