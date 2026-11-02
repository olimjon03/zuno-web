import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { AuthForm } from "@/features/auth/auth-form";
export const metadata: Metadata = { title: "Create account | ZUNO" };
export default function SignupPage() {
  return (
    <AuthShell
      title="Meet your neighborhood"
      description="Create a ZUNO account with your email."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
