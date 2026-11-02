import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/auth-shell";
import { AuthForm } from "@/features/auth/auth-form";
export const metadata: Metadata = { title: "Log in | ZUNO" };
async function LoginNotice({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { notice } = await searchParams;
  return notice === "confirmation" ? (
    <p role="alert" className="auth-error">
      That confirmation link is invalid or expired. Try logging in, or request a
      new confirmation email from registration.
    </p>
  ) : notice === "session" ? (
    <p role="status" className="auth-hint">
      Please log in to access your account.
    </p>
  ) : null;
}
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <AuthShell
      title="Welcome back"
      description="Log in to your ZUNO neighborhood."
    >
      <Suspense fallback={null}>
        <LoginNotice searchParams={searchParams} />
      </Suspense>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
