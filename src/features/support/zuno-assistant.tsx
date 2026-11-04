"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Text, useT } from "@/features/language/provider";
import { useNotifications } from "@/features/notifications/provider";
import { askZunoAssistant } from "./zuno-assistant-action";
import { helpTopics, type HelpTopic } from "./zuno-topics";
import "./zuno-assistant.css";

export function ZunoAssistant({ enabled }: { enabled: boolean }) {
  const t = useT();
  const { ready, userId } = useNotifications();
  const [state, ask, pending] = useActionState(askZunoAssistant, {});
  const [selected, setSelected] = useState<HelpTopic | null>(null);
  const topic = selected ?? state.topic;
  const answer = topic ? helpTopics[topic] : null;

  return <section id="zuno-assistant" className="zuno-assistant" aria-labelledby="zuno-assistant-title">
    <header><Icon name="chat" /><h2 id="zuno-assistant-title"><Text>{"ZUNO Assistant"}</Text></h2></header>
    <p><Text>{"Get help with using ZUNO."}</Text></p>
    {enabled && userId ? <form action={ask} onSubmit={() => setSelected(null)} aria-busy={pending}>
      <label htmlFor="zuno-question"><Text>{"Ask about ZUNO"}</Text></label>
      <textarea id="zuno-question" name="question" placeholder={t("How do I sell an item?")} required maxLength={400} rows={2} aria-describedby="zuno-assistant-note" />
      <small id="zuno-assistant-note"><Text>{"Your question is processed by Google Gemini. Avoid sharing passwords or private details."}</Text></small>
      <button className="button button-primary" disabled={pending}><Text>{pending ? "Finding help…" : "Ask ZUNO"}</Text></button>
    </form> : enabled && ready ? <Link href="/login"><Text>{"Sign in to ask the ZUNO assistant."}</Text></Link> : null}
    <div role="status" aria-live="polite">
      {!selected && !pending && state.message && <p><Text>{state.message}</Text></p>}
      {!pending && answer && <article className="zuno-assistant-answer">
        <h3><Text>{answer.title}</Text></h3>
        <p><Text>{answer.answer}</Text></p>
        <Link href={answer.href}><Text>{"Open in ZUNO"}</Text><Icon name="chevron" /></Link>
      </article>}
    </div>
    <div className="zuno-assistant-topics" aria-label={t("Help topics")}>
      {(Object.keys(helpTopics) as HelpTopic[]).map(id => <button type="button" key={id} className="button button-outline"
        aria-pressed={id === topic} disabled={pending} onClick={() => setSelected(id)}><Text>{helpTopics[id].title}</Text></button>)}
    </div>
  </section>;
}
