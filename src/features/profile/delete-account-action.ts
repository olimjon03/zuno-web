"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type DeleteState = { error?: string };
type StorageObject = { bucket_id: string; name: string };

export async function deleteAccount(_: DeleteState, form: FormData): Promise<DeleteState> {
  if (form.get("confirmation") !== "DELETE") {
    return { error: "Type DELETE to confirm." };
  }

  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return { error: "Account deletion is temporarily unavailable." };

  const client = await createClient();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user || user.id !== form.get("account")) {
    return { error: "Please log in again to delete your account." };
  }

  try {
    const admin = createAdminClient(getSupabaseConfig().url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    let previousBatch = "";
    while (true) {
      const { data, error } = await admin.rpc("get_account_storage_batch", { p_user_id: user.id });
      if (error || !Array.isArray(data)) throw new Error("Storage lookup failed");
      if (data.length === 0) break;

      const fingerprint = JSON.stringify(data);
      if (fingerprint === previousBatch) throw new Error("Storage cleanup stalled");
      previousBatch = fingerprint;

      const buckets = new Map<string, string[]>();
      for (const { bucket_id, name } of data as StorageObject[]) {
        const paths = buckets.get(bucket_id) ?? [];
        paths.push(name);
        buckets.set(bucket_id, paths);
      }
      for (const [bucket, paths] of buckets) {
        const { error: removalError } = await admin.storage.from(bucket).remove(paths);
        if (removalError) throw removalError;
      }
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error && error.code !== "user_not_found") throw error;
  } catch {
    return { error: "We couldn’t finish deleting your account. Please try again." };
  }

  await client.auth.signOut({ scope: "local" }).catch(() => {});
  revalidatePath("/", "layout");
  redirect("/login");
}
