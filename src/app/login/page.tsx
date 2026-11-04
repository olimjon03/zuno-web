import { EnglishLocale, Text } from "@/features/language/provider";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Brand } from "@/components/ui/brand";
import Link from "next/link";
import "./login.css";
import { AuthForm } from "@/features/auth/auth-form";
export const metadata: Metadata = { title: "Log in | ZUNO" };
async function LoginNotice({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { notice } = await searchParams;
  return notice === "signin" ? (
    <p role="alert" className="auth-error">
      <Text>{"We couldn’t complete sign-in. Please try again with Google or use your email and password."}</Text></p>
  ) : notice === "confirmation" ? (
    <p role="alert" className="auth-error">
      <Text>{"That confirmation link is invalid or expired. Try logging in, or request a new confirmation email from registration."}</Text></p>
  ) : notice === "session" ? (
    <p role="status" className="auth-hint">
      <Text>{"Please log in to access your account."}</Text></p>
  ) : null;
}
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <EnglishLocale>
      <main className="motion-login" lang="en">
        <div className="motion-login-background" aria-hidden="true" />
        <div className="motion-login-layout">
          <div className="motion-login-story">
            <Link href="/" className="wordmark" aria-label="ZUNO home"><Brand /></Link>
            <p className="motion-login-tagline">Buy · Sell · Connect Locally</p>
            <p className="motion-login-headline">Good things.<br />Closer to home.</p>
            <p className="motion-login-description">
              Find something you love, pass on what you don’t need, and meet the neighbors in between.
            </p>
          </div>
          <section className="auth-panel motion-login-card" aria-labelledby="login-title">
            <h1 id="login-title">Welcome back</h1>
            <p className="auth-intro">Sign in to your ZUNO neighborhood.</p>
            <Suspense fallback={null}>
              <LoginNotice searchParams={searchParams} />
            </Suspense>
            <AuthForm mode="login" />
          </section>
        </div>
      </main>
    </EnglishLocale>
  );
}
