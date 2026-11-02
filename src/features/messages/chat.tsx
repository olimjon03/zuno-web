"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createRefreshQueue } from "./realtime";
import { useUnread } from "./unread-provider";
import { markMessagesRead } from "./unread-actions";
import { postMessage, readMessages } from "./actions";
import type { Message } from "./validation";
export function Chat({
  conversationId,
  userId,
  initialMessages,
}: {
  conversationId: string;
  userId: string;
  initialMessages: Message[];
}) {
  const { realtime } = useUnread();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [more, setMore] = useState(initialMessages.length === 50);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const ids = useRef({
    first: initialMessages[0]?.id,
    last: initialMessages.at(-1)?.id,
  });
  const retry = useRef<{ id: string; body: string } | null>(null);
  const locked = useRef(false);
  const alive = useRef(true);
  const end = useRef<HTMLDivElement>(null);
  const [readError, setReadError] = useState("");
  const newest = messages.at(-1)?.id;
  useEffect(() => {
    let active = true,
      busy = false,
      acknowledged = false;
    async function acknowledge() {
      if (document.hidden || !newest || busy || acknowledged) return;
      busy = true;
      try {
        const result = await markMessagesRead(conversationId, newest);
        if (!active) return;
        if (result.error)
          setReadError(
            "Read status could not be saved. It will retry shortly.",
          );
        else {
          acknowledged = true;
          setReadError("");
          window.dispatchEvent(new Event("zuno:messages-read"));
        }
      } catch {
        if (active)
          setReadError(
            "Read status could not be saved. It will retry shortly.",
          );
      } finally {
        busy = false;
      }
    }
    void acknowledge();
    const timer = setInterval(() => {
      void acknowledge();
    }, 15000);
    const visible = () => {
      void acknowledge();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [conversationId, newest]);
  function merge(items: Message[]) {
    setMessages((current) => {
      const map = new Map(current.map((m) => [m.id, m]));
      for (const item of items) map.set(item.id, item);
      const next = [...map.values()].sort((a, b) => a.id - b.id);
      ids.current = { first: next[0]?.id, last: next.at(-1)?.id };
      return next;
    });
  }
  useEffect(() => {
    alive.current = true;
    const refresh = createRefreshQueue(
      async () => {
        if (document.hidden) return;
        // Drain bounded batches when reconnecting after a backlog.
        let after = ids.current.last;
        for (let batch = 0; batch < 10; batch++) {
          const result = await readMessages(conversationId, after);
          if (!alive.current) return;
          if (!result.messages) {
            setError(result.error ?? "Messages could not be loaded.");
            return;
          }
          merge(result.messages);
          if (
            result.messages.length < 50 ||
            result.messages.at(-1)?.id === after
          )
            return;
          after = result.messages.at(-1)?.id;
        }
      },
      () => {
        if (alive.current)
          setError("We couldn’t refresh messages. Please try again.");
      },
    );
    const changed = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        event.detail?.conversationId !== conversationId
      )
        return;
      refresh.request();
    };
    const timer = setInterval(() => refresh.request(), 5000);
    window.addEventListener("zuno:message-change", changed);
    window.addEventListener("zuno:messages-reconnected", changed);
    window.addEventListener("focus", changed);
    document.addEventListener("visibilitychange", changed);
    refresh.request();
    return () => {
      alive.current = false;
      refresh.dispose();
      clearInterval(timer);
      window.removeEventListener("zuno:message-change", changed);
      window.removeEventListener("zuno:messages-reconnected", changed);
      window.removeEventListener("focus", changed);
      document.removeEventListener("visibilitychange", changed);
    };
  }, [conversationId]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setError("");
    retry.current =
      retry.current?.body === draft
        ? retry.current
        : { id: crypto.randomUUID(), body: draft };
    try {
      const result = await postMessage(conversationId, retry.current.id, draft);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDraft("");
      retry.current = null;
      const refreshed = await readMessages(conversationId, ids.current.last);
      if (refreshed.messages) merge(refreshed.messages);
      else setError("Message sent. Refresh to see the latest messages.");
      setTimeout(
        () =>
          end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        50,
      );
    } catch {
      setError(
        "We couldn’t confirm delivery. Retry to send safely; your draft has been kept.",
      );
    } finally {
      locked.current = false;
      setPending(false);
    }
  }
  async function older() {
    if (loadingOlder) return;
    setLoadingOlder(true);
    try {
      const result = await readMessages(
        conversationId,
        ids.current.first,
        true,
      );
      if (result.messages) {
        merge(result.messages);
        setMore(result.messages.length === 50);
      } else setError(result.error ?? "Could not load older messages.");
    } catch {
      setError("Could not load older messages. Please try again.");
    } finally {
      setLoadingOlder(false);
    }
  }
  return (
    <section aria-label="Conversation messages" className="chat-panel">
      <p className="auth-hint">
        {realtime
          ? "Live messages connected."
          : "Connecting to live messages. Updates are also checked automatically."}
      </p>
      {more && (
        <button
          className="button button-outline"
          onClick={older}
          disabled={loadingOlder}
        >
          {loadingOlder ? "Loading…" : "Load older messages"}
        </button>
      )}
      {readError && (
        <p role="status" className="auth-hint">
          {readError}
        </p>
      )}
      <p className="sr-only" role="status">
        {messages.length} messages loaded.
      </p>
      <ol className="chat-history" aria-label="Message history">
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.sender_id === userId ? "chat-message own" : "chat-message"
            }
          >
            <span className="chat-author">
              {message.sender_id === userId ? "You" : "Neighbor"}
            </span>
            <p>{message.body}</p>
            <time dateTime={message.created_at}>
              {new Date(message.created_at).toLocaleString("en-GB", {
                timeZone: "Asia/Seoul",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              KST
            </time>
          </li>
        ))}
      </ol>
      {!messages.length && (
        <p>No messages yet. Say hello and ask about this item.</p>
      )}
      <div ref={end} />
      <form className="sell-form sell-field chat-compose" onSubmit={submit}>
        <label htmlFor="message-body">Your message</label>
        <textarea
          id="message-body"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={2000}
          required
          disabled={pending}
          rows={3}
        />
        <p className="auth-hint">{Array.from(draft).length}/2,000 characters</p>
        <button
          className="button button-primary"
          disabled={pending || !draft.trim()}
        >
          {pending ? "Sending…" : "Send message"}
        </button>
        {pending && <p role="status">Sending your message…</p>}
        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
