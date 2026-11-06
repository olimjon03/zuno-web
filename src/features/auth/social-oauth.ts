import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, getSupabaseConfig } from "@/lib/supabase/config";

export type SocialProvider = "custom:kakao" | "custom:telegram";
export async function startSocialOAuth(provider: SocialProvider): Promise<{ destination?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${getSiteUrl()}/auth/callback`, skipBrowserRedirect: true },
    });
    if (!error && data.url) {
      const url = new URL(data.url);
      if (url.origin === new URL(getSupabaseConfig().url).origin &&
          url.pathname === "/auth/v1/authorize" && url.searchParams.get("provider") === provider)
        return { destination: url.href };
    }
  } catch {
    // Do not log provider responses, credentials, tokens or authorization URLs.
    console.error("[ZUNO social sign-in] Startup failed", { provider });
  }
  return { error: "We couldn’t start sign-in. Please try again or use email." };
}
