import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WelcomeForm } from "@/features/onboarding/welcome-form";
import { SectionLoading } from "@/components/layout/section-loading";
import { isCountryCode } from "@/features/locations/catalog";
export const metadata:Metadata={title:"Welcome to ZUNO",robots:{index:false,follow:false}};
async function Welcome(){await connection();const db=await createClient();const {data:{user},error}=await db.auth.getUser();if(error||!user)redirect("/login");const {data}=await db.from("profiles").select("country_code").eq("id",user.id).maybeSingle();return <WelcomeForm initialCountry={data&&isCountryCode(data.country_code)?data.country_code:""}/>;}
export default function Page(){return <Suspense fallback={<SectionLoading message="Welcome to ZUNO"/>}><Welcome/></Suspense>;}
