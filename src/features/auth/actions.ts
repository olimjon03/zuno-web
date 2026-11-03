"use server";

import { clearCountryPreference } from "@/features/onboarding/server/preference";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { readAuthFields, validateCredentials } from "./validation";

export type AuthState = { error?: string; message?: string };
const unavailable = "We couldn’t connect right now. Please try again shortly.";

export async function login(
  _previous: AuthState,
  data: FormData,
): Promise<AuthState> {
  const fields = readAuthFields(data);
  const validation = validateCredentials(fields);
  if (validation) return { error: validation };
  if (!isSupabaseConfigured()) return { error: unavailable };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: fields.email,
      password: fields.password,
    });
    if (error)
      return {
        error:
          error.code === "email_not_confirmed"
            ? "Confirm your email using the link in your inbox, then log in."
            : error.status === 429
              ? "Too many attempts. Please wait before trying again."
              : "Login failed. Check your email and password, or try again shortly.",
      };
  } catch {
    return { error: unavailable };
  }
  revalidatePath("/", "layout");
  await clearCountryPreference();
  redirect("/welcome");
}

export async function signup(
  _previous: AuthState,
  data: FormData,
): Promise<AuthState> {
  const fields = readAuthFields(data);
  const validation = validateCredentials(fields, true);
  if (validation) return { error: validation };
  if (!isSupabaseConfigured()) return { error: unavailable };
  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase.auth.signUp({
      email: fields.email,
      password: fields.password,
      options: {
        data: { display_name: fields.displayName },
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });
    if (error)
      return {
        error:
          error.status === 429
            ? "Please wait a little before trying again."
            : "We couldn’t complete registration. Try again later, or log in if you already have an account.",
      };
    signedIn = Boolean(result.session);
  } catch {
    return { error: unavailable };
  }
  if (signedIn) {
    revalidatePath("/", "layout");
    await clearCountryPreference();
    redirect("/welcome");
  }
  return {
    message:
      "Check your inbox for a confirmation link. If this address already has an account, you can log in instead.",
  };
}

export async function logout(): Promise<AuthState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: "We couldn’t log you out. Please try again." };
  } catch {
    return { error: unavailable };
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
