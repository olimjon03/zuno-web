import { SectionLoading } from "@/components/layout/section-loading";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Brand } from "@/components/ui/brand";
import { Avatar } from "@/features/profile/avatar";
import { ProfileListings } from "@/features/profile/profile-listings";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSellerListings } from "@/features/listings/server/data";
import { isUuid } from "@/features/listings/validation";
export const metadata={title:"Neighbor profile | ZUNO",robots:{index:false,follow:false}};
async function Neighbor({params}:{params:Promise<{id:string}>}) {
 await connection();const {id}=await params;if(!isUuid(id)||!isSupabaseConfigured())notFound();
 const {data,error}=await createPublicClient().rpc("get_public_profile",{profile_id:id});
 if(error)throw new Error("This profile is temporarily unavailable.");
 const profile=data?.[0];if(!profile)notFound();
 const listings=await getSellerListings(id);
 return <main className="shell neighbor-page"><header className="detail-header"><Link className="wordmark" href="/"><Brand/></Link><BackHomeNav/></header><section className="neighbor-summary"><Avatar name={profile.display_name} path={profile.avatar_path}/><div><h1>{profile.display_name}</h1><p>{profile.neighborhood || "Neighborhood not shared"}</p></div></section><h2>Active listings</h2><ProfileListings listings={listings}/></main>;
}
export default function Page({params}:{params:Promise<{id:string}>}) {return <Suspense fallback={<SectionLoading message="Loading neighbor…"/>}><Neighbor params={params}/></Suspense>;}
