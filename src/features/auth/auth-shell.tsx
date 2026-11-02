import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import Link from "next/link";
import type { ReactNode } from "react";
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="shell detail-header">
        <Link href="/" className="wordmark" aria-label="ZUNO home">
          <Brand/>
        </Link><BackHomeNav/></header>
      <main className="auth-page">
        <section className="auth-panel" aria-labelledby="auth-title">
          <h1 id="auth-title">{title}</h1>
          <p className="auth-intro">{description}</p>
          {children}
        </section>
        <p className="auth-tagline">Buy · Sell · Connect Locally</p>
      </main>
    </>
  );
}
