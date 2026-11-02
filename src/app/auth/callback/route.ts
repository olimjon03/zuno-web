import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code && code.length <= 2048) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(new URL("/account", getSiteUrl()));
    } catch {
      /* Return a safe error page; never echo codes or provider errors. */
    }
  }
  return NextResponse.redirect(
    new URL(
      "/login?notice=confirmation",
      process.env.NEXT_PUBLIC_SITE_URL ? getSiteUrl() : request.url,
    ),
  );
}
