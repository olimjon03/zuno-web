"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, getSupabaseConfig } from "@/lib/supabase/config";
import type { AuthState } from "./actions";

export async function loginWithApple(): Promise<AuthState> {
  let destination: string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });
    if (error || !data.url)
      return {
        error:
          "Apple sign-in is unavailable right now. Please try again or use email.",
      };
    const url = new URL(data.url);
    // Only hand the browser to the configured Supabase authorization endpoint.
    if (
      url.origin !== new URL(getSupabaseConfig().url).origin ||
      url.pathname !== "/auth/v1/authorize" ||
      url.searchParams.get("provider") !== "apple"
    ) {
      return { error: "We couldn’t start Apple sign-in. Please try again." };
    }
    destination = url.href;
  } catch {
    // Configuration names only: never log keys, OAuth codes or session cookies.
    console.error("[ZUNO Apple sign-in] Startup failed", {
      supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      publishableKeyConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      ),
      siteUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      vercelDeployment: process.env.VERCEL === "1",
    });
    return {
      error: "We couldn’t start Apple sign-in. Please try again or use email.",
    };
  }
  // Next.js redirect throws internally and must stay outside the error handler.
  redirect(destination);
}
