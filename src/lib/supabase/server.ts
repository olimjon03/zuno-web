import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cache } from "react";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

export const createClient = cache(async () => {
  const store = await cookies();
  const { url, key } = getSupabaseConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try {
          for (const { name, value, options } of values)
            store.set(name, value, options);
        } catch {
          // Server Components cannot write cookies. Proxy refreshes them before rendering.
        }
      },
    },
  });
});
