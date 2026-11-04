"use server";

import { revalidatePath } from "next/cache";
import { getExploreFeature, localPostKinds } from "./explore-catalog";
import { getExploreSession } from "./server/explore-session";
import { isUuid } from "@/features/listings/validation";

type State = { message?: string; error?: string };
const failure = "Could not save this change. Please try again.";

export async function saveExploreChange(_: State, form: FormData): Promise<State> {
  const value = (key: string) => String(form.get(key) ?? "").trim();
  const slug = value("feature");
  const action = value("intent");
  const id = value("id");
  if (!getExploreFeature(slug)) return { error: failure };
  const { db, user, profile } = await getExploreSession();
  if (value("account") !== user.id) return { error: failure };
  let result;

  if (localPostKinds.has(slug)) {
    const title = value("title");
    const body = value("body");
    const event = slug === "local-events" || slug === "meetups";
    const startsAt = event ? new Date(value("starts_at") + "Z") : null;
    if (action === "remove" && isUuid(id)) {
      result = await db.from("explore_posts").delete().eq("id", id).eq("kind", slug).eq("author_id", user.id);
    } else if (action === "save" && title.length >= 3 && title.length <= 100 && body.length >= 10 && body.length <= 2000 && (!startsAt || Number.isFinite(startsAt.getTime()))) {
      const fields = { title, body, starts_at: startsAt?.toISOString() ?? null };
      if (isUuid(id)) {
        result = await db.from("explore_posts").update(fields).eq("id", id).eq("kind", slug).eq("author_id", user.id);
      } else if (profile.neighborhood_id) {
        result = await db.from("explore_posts").insert({ ...fields, kind: slug, neighborhood_id: profile.neighborhood_id });
      }
    }
  } else if (slug === "search-alerts") {
    if (action === "remove" && isUuid(id)) {
      result = await db.from("explore_search_alerts").delete().eq("id", id).eq("user_id", user.id);
    } else if (action === "save" && profile.country_code && value("query").length >= 2 && value("query").length <= 80) {
      result = await db.from("explore_search_alerts").insert({ country: profile.country_code, query: value("query").toLowerCase() });
    }
  } else if (slug === "language" || slug === "notifications") {
    if (action === "save") {
      const preference = slug === "language" ? { large_text: value("enabled") === "on" } : { search_notifications: value("enabled") === "on" };
      result = await db.from("explore_preferences").upsert({ user_id: user.id, ...preference }, { defaultToNull: false });
    } else if (action === "read" && slug === "notifications") {
      result = await db.rpc("mark_notification_read", { p_id: isUuid(id) ? id : null, p_expected_user_id: user.id });
    }
  } else if (slug === "recently-viewed" && action === "clear") {
    result = await db.from("explore_recent_views").delete().eq("user_id", user.id);
  } else if (slug === "announcements") {
    if (action === "save" && value("title").length >= 3 && value("title").length <= 100 && value("body").length >= 10 && value("body").length <= 2000) {
      result = await db.from("explore_announcements").insert({ title: value("title"), body: value("body") });
    } else if (action === "remove" && isUuid(id)) {
      result = await db.from("explore_announcements").delete().eq("id", id);
    }
  } else if (slug === "feedback" && action === "save" && value("body").length >= 10 && value("body").length <= 2000) {
    result = await db.from("explore_feedback").insert({ body: value("body") });
  } else if (slug === "promote-listing" && isUuid(id)) {
    if (action === "save") result = await db.from("explore_promotions").insert({ listing_id: id });
    if (action === "remove") result = await db.from("explore_promotions").delete().eq("listing_id", id).eq("user_id", user.id);
  } else if (slug === "purchase-history" && isUuid(id)) {
    if (action === "save") result = await db.from("explore_trade_confirmations").insert({ conversation_id: id });
    if (action === "review" && ["positive", "negative"].includes(value("sentiment"))) {
      result = await db.rpc("submit_trade_feedback", {
        p_conversation_id: id,
        p_positive: value("sentiment") === "positive",
        p_reason: value("reason"),
      });
    }
  } else if (slug === "location-verification") {
    if (action === "save" && profile.neighborhood_id && value("body").length >= 10 && value("body").length <= 500) {
      result = await db.from("explore_location_requests").insert({ neighborhood_id: profile.neighborhood_id, note: value("body") });
    } else if (action === "remove") {
      result = await db.from("explore_location_requests").delete().eq("user_id", user.id);
    } else if (isUuid(id) && (action === "approved" || action === "declined")) {
      result = await db.from("explore_location_requests").update({ status: action }).eq("user_id", id).eq("status", "pending").select("user_id").single();
    }
  }

  if (!result || result.error) return { error: failure };
  revalidatePath(`/explore/${slug}`);
  if (slug === "purchase-history" && isUuid(id)) revalidatePath(`/messages/${id}`);
  return { message: "Changes saved." };
}
