import { COUNTRY_COOKIE, parseCountryPreference } from "@/features/locations/country-preference";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;
  const { url, key } = getSupabaseConfig();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        for (const { name, value } of values) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of values)
          response.cookies.set(name, value, options);
      },
    },
  });
  // Page/actions still verify the user themselves. Refresh failures never grant access.
  try {
    const { data } = await supabase.auth.getClaims();
    const userId=data?.claims?.sub;
    const preference=parseCountryPreference(request.cookies.get(COUNTRY_COOKIE)?.value);
    const path=request.nextUrl.pathname;
    if(userId && request.method==="GET" && (path==="/" || path.startsWith("/account") || path.startsWith("/messages") || path==="/sell") && (!preference || preference.userId!==userId)){
      const redirect=NextResponse.redirect(new URL("/welcome",request.url));
      for(const cookie of response.cookies.getAll())redirect.cookies.set(cookie);
      return redirect;
    }
  } catch {
    /* The protected page handles unavailable authentication. */
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/",
    "/welcome",
    "/account/:path*",
    "/messages/:path*",
    "/sell",
    "/api/listings",
    "/login",
    "/signup",
    "/auth/:path*",
  ],
};
