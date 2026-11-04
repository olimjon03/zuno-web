"use client";

import { useState } from "react";
import { Text } from "@/features/language/provider";
import { feedbackReasons } from "@/features/profile/trade-feedback";
import { ExploreForm } from "./explore-form";

export function TradeFeedbackForm({ account, conversation, seller }: { account: string; conversation: string; seller: boolean }) {
  const [open, setOpen] = useState(false);
  const [sentiment, setSentiment] = useState<"positive" | "negative">("positive");
  const reasons = sentiment === "positive"
    ? ["on-time", "good-communication", seller ? "kept-agreement" : "as-described"] as const
    : ["no-show", "difficult-communication", seller ? "broke-agreement" : "not-as-described"] as const;

  if (!open) return <button type="button" className="button button-outline" onClick={() => setOpen(true)}>
    <Text>{"Leave feedback (optional)"}</Text>
  </button>;

  return <ExploreForm feature="purchase-history" account={account} id={conversation} intent="review" label="Send feedback">
    <label><Text>{seller ? "Feedback for the buyer" : "Feedback for the seller"}</Text>
      <select name="sentiment" value={sentiment} onChange={event => setSentiment(event.target.value === "negative" ? "negative" : "positive")}>
        <option value="positive"><Text>{"Positive"}</Text></option>
        <option value="negative"><Text>{"Negative"}</Text></option>
      </select>
    </label>
    <label><Text>{"Choose a reason"}</Text>
      <select name="reason" key={sentiment} required defaultValue="">
        <option value="" disabled><Text>{"Choose a reason"}</Text></option>
        {reasons.map(reason => <option key={reason} value={reason}><Text>{feedbackReasons[reason]}</Text></option>)}
      </select>
    </label>
    <button type="button" className="button button-outline" onClick={() => setOpen(false)}><Text>{"Skip for now"}</Text></button>
  </ExploreForm>;
}
