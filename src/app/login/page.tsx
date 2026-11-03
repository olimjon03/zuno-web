import { Text } from "@/features/language/provider";
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
