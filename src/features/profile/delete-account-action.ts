"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

import { cleanupAccount, AccountCleanupError } from "./server/account-cleanup";

type DeleteState = { error?: string };

export async function deleteAccount(_: DeleteState, form: FormData): Promise<DeleteState> {
  if (form.get("confirmation") !== "DELETE") {
    return { error: "Type DELETE to confirm." };
  }

  const key = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) return { error: "Account deletion is temporarily unavailable." };

  let client: Awaited<ReturnType<typeof createClient>>;
  try {
    client = await createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user || user.id !== form.get("account")) {
      return { error: "Please log in again to delete your account." };
    }

    const admin = createAdminClient(getSupabaseConfig().url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const result = await cleanupAccount(admin, user.id);
    if (result === "admin_account") return { error: "Admin accounts must have their admin membership removed before account deletion." };
    if (result === "pending") return { error: "Account deletion is in progress. Try again to continue cleanup." };
  } catch (error) {
    const detail = error instanceof AccountCleanupError ? error : null;
    console.error("[zuno-account-deletion] Failed", {
      stage: detail?.stage ?? "setup",
      code: detail?.detail?.code?.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 60),
      status: detail?.detail?.status,
    });
    return { error: "We couldn’t finish deleting your account. Please try again." };
  }

  await client.auth.signOut({ scope: "local" }).catch(() => {});
  revalidatePath("/", "layout");
  redirect("/login");
}
