import { getVerifiedUser } from "@/features/auth/server/user";
import "server-only";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { readSafetyState } from "@/features/moderation/actions";
import { getLiveListing } from "@/features/listings/server/data";
import { getInboxSnapshot } from "./inbox-data";
import { readMessages } from "./actions";
import { isUuid } from "@/features/listings/validation";

export async function getInboxPage() {
  const db = await createClient();
  const { data: { user }, error } = await getVerifiedUser();
  if (error || !user) redirect("/login?notice=session");
  return getInboxSnapshot(db, user.id);
}

export async function getConversationPage(id: string) {
  if (!isUuid(id)) notFound();
  const db = await createClient();
  const { data: { user }, error: authError } = await getVerifiedUser();
  if (authError || !user) redirect("/login?notice=session");
  const { data: c, error } = await db.from("conversations")
    .select("id,listing_id,listing_title,buyer_id,seller_id,buyer_name,seller_name")
    .eq("id", id).maybeSingle();
  if (error) throw new Error("Conversation unavailable.");
  if (!c || (c.buyer_id !== user.id && c.seller_id !== user.id)) notFound();
  const otherId: string | null = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
  const [result, safety, inbox, listing, profiles] = await Promise.all([
    readMessages(id), otherId ? readSafetyState(otherId) : Promise.resolve({state:{isSelf:false,blocked:false,canMessage:false}}), getInboxSnapshot(db, user.id),
    c.listing_id ? getLiveListing(c.listing_id).catch(() => null) : null,
    db.rpc("get_public_profile", { profile_id: user.id }),
  ]);
  const counterpart = inbox.entries.find(entry => entry.id === id);
  let person = { id: otherId, name: counterpart?.otherName ?? (c.buyer_id === user.id ? c.seller_name : c.buyer_name), avatarPath: counterpart?.avatarPath ?? null, neighborhood: counterpart?.neighborhood ?? null };
  if (otherId && !counterpart) {
    const { data } = await db.rpc("get_public_profile", { profile_id: otherId });
    if (data?.[0]) person = { id: otherId, name: data[0].display_name, avatarPath: data[0].avatar_path, neighborhood: data[0].neighborhood };
  }
  const self = { name: profiles.data?.[0]?.display_name ?? "You", avatarPath: profiles.data?.[0]?.avatar_path ?? null };
  if (!result.messages) throw new Error("Messages unavailable.");
  return { c, userId: user.id, otherId, messages: result.messages, mediaReady: result.mediaReady ?? false, inbox, person, self, listing: listing?.listing ?? null, canMessage: Boolean(otherId) && (safety.state?.canMessage ?? false) };
}
