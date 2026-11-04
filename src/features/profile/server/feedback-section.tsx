import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/features/language/provider";
import { getNeighborFeedback, type Feedback } from "./feedback-data";
import { feedbackLevel, feedbackReasons } from "../trade-feedback";
import "../feedback-section.css";

export function FeedbackItems({ items }: { items: Feedback[] }) {
  if (!items.length) return <p><Text>{"No feedback yet."}</Text></p>;
  return <ul className="neighbor-feedback-list">
    {items.map((item, index) => <li key={`${item.created_at}:${index}`}>
      <span className={item.positive ? "feedback-positive" : "feedback-negative"}>
        <Text>{item.positive ? "Positive" : "Negative"}</Text>
      </span>
      <strong><Text>{feedbackReasons[item.reason]}</Text></strong>
      <small><Text>{item.reviewer_role === "buyer" ? "From a buyer" : "From a seller"}</Text></small>
    </li>)}
  </ul>;
}

type FeedbackSummary = Awaited<ReturnType<typeof getNeighborFeedback>>;

export function ProfileLevelBadge({ feedback }: { feedback: FeedbackSummary }) {
  if (!feedback) return null;
  const level = feedbackLevel(feedback.positive, feedback.negative);
  const icons = { 1: "pin", 2: "shield", 3: "check-circle" } as const;
  return <span className={`profile-level-badge profile-level-${level.number}`}>
    <Icon name={icons[level.number]} />
    <span><Text values={{ level: level.number }}>{"Level {level}"}</Text><span className="sr-only"> · <Text>{level.name}</Text></span></span>
  </span>;
}

export function FeedbackSection({ id, feedback }: { id: string; feedback: FeedbackSummary }) {
  if (!feedback) return <p><Text>{"Feedback could not be loaded."}</Text></p>;
  return <section className="neighbor-feedback" aria-label="Feedback">
    <h2><Text>{"Feedback"}</Text></h2>
    <p className="neighbor-feedback-counts">
      <span className="feedback-positive">+{feedback.positive} <Text>{"Positive"}</Text></span>
      <span className="feedback-negative">−{feedback.negative} <Text>{"Negative"}</Text></span>
    </p>
    <FeedbackItems items={feedback.items.slice(0, 3)} />
    <Link className="button button-outline" href={`/neighbors/${id}/feedback`}><Text>{"All feedback"}</Text><Icon name="chevron" /></Link>
  </section>;
}
