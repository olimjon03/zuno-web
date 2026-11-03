import "server-only";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "../validation";
const noStore = { "Cache-Control": "private, no-store" };
export async function recordListingView(request: NextRequest, id: string) {
  if (request.headers.get("origin") !== getSiteUrl()) return new NextResponse(null, { status: 403, headers: noStore });
  if (!isUuid(id)) return new NextResponse(null, { status: 400, headers: noStore });
  const existing = request.cookies.get("zuno_listing_viewer")?.value;
  const visitor = existing && isUuid(existing) ? existing : randomUUID();
  try {
    const db = await createClient();
    const { error } = await db.rpc("record_listing_view", { p_listing_id: id, p_visitor_id: visitor });
    if (error) return new NextResponse(null, { status: 503, headers: noStore });
    const response = new NextResponse(null, { status: 204, headers: noStore });
    if (visitor !== existing) response.cookies.set("zuno_listing_viewer", visitor, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 86400 });
    return response;
  } catch { return new NextResponse(null, { status: 503, headers: noStore }); }
}
