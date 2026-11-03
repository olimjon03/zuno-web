"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";
import type { EmailChangeState } from "../types";
export async function changeEmail(_state: EmailChangeState, form: FormData): Promise<EmailChangeState> {
  const value = form.get("email");
  if (typeof value !== "string" || value.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return { error: "Enter a valid email address." };
  const email = value.trim();
  try {
    const db = await createClient();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return { error: "Please log in again to change your email." };
    if (user.email?.toLowerCase() === email.toLowerCase()) return { message: "This is already your current email.", email: user.email };
    const { data, error } = await db.auth.updateUser({ email }, { emailRedirectTo: `${getSiteUrl()}/auth/callback` });
    if (error) return { error: error.status === 429 ? "Please wait a little before trying again." : "We couldn’t request the email change. Please try again." };
    revalidatePath("/account");revalidatePath("/account/settings");
    return data.user?.email?.toLowerCase() === email.toLowerCase()
      ? { message: "Email updated.", email: data.user.email }
      : { message: "Check your email inboxes to confirm the change. Your current address stays until confirmation." };
  } catch { return { error: "We couldn’t connect. Please try again." }; }
}
