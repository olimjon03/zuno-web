import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { feedbackReasons } from "../trade-feedback";

export type FeedbackFilter = "all" | "positive" | "negative";
export type Feedback = {
  positive: boolean;
  reason: keyof typeof feedbackReasons;
  reviewer_role: "buyer" | "seller";
  created_at: string;
};

export async function getNeighborFeedback(id: string, filter: FeedbackFilter = "all", page = 1) {
  const { data, error } = await createPublicClient().rpc("get_neighbor_feedback", {
    p_profile_id: id,
    p_filter: filter,
    p_offset: (page - 1) * 20,
  });
  if (error || !data) return null;
  return {
    positive: Number(data.positive),
    negative: Number(data.negative),
    items: (data.items ?? []) as Feedback[],
  };
}
