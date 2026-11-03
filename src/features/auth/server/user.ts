import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// React cache lives for one server render, never across users or requests.
export const getVerifiedUser = cache(async () => {
  const db = await createClient();
  return db.auth.getUser();
});
