import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getListingOptions } from "@/features/listings/server/data";
import { CreateListingForm } from "@/features/listings/components/create-listing-form";
export const metadata: Metadata = {
  title: "Sell an Item | ZUNO",
  robots: { index: false },
};
async function Sell() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?notice=session");
  const options = await getListingOptions();
  return (
    <>
      <header className="shell detail-header">
        <Link href="/" className="wordmark">
          <Brand/>
        </Link><BackHomeNav/></header>
      <main className="sell-page shell">
        <h1>Find it a new home</h1>
        <p className="auth-intro">Share a few details with your neighbors.</p>
        <CreateListingForm {...options} />
      </main>
    </>
  );
}
export default function SellPage() {
  return (
    <Suspense
      fallback={
        <main className="shell detail-message" role="status">
          Getting your listing form ready…
        </main>
      }
    >
      <Sell />
    </Suspense>
  );
}
