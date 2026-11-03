import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if ((type === "email" || type === "email_change") && token_hash && token_hash.length <= 2048) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      if (!error) {
        revalidatePath("/", "layout");
        return NextResponse.redirect(new URL(type === "email_change" ? "/account/settings" : "/", getSiteUrl()));
      }
    } catch {
      /* Show only a generic failure. Redirect targets are fixed. */
    }
  }
  return NextResponse.redirect(
    new URL(
      "/login?notice=confirmation",
      process.env.NEXT_PUBLIC_SITE_URL ? getSiteUrl() : request.url,
    ),
  );
}
