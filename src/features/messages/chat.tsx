"use client";
import { Text, useT } from "@/features/language/provider";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { PersonAvatar } from "./person-avatar";
import { MessageIcon } from "./message-icon";
import { prepareAttachments } from "./client/prepare-attachments";
import { formatFileSize, validateAttachmentSelection } from "./attachments";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createRefreshQueue } from "./refresh-queue";
import { useUnread } from "./unread-provider";
import { markMessagesRead } from "./server/unread-actions";
import { postMessage, readMessages } from "./server/actions";
import { mergeMessages } from "./message-model";
import type { Message } from "./types";
export function Chat({
  conversationId,
  userId,
  initialMessages,
  canMessage = true,
  mediaReady = false,
  person,
  self,
}: {
  conversationId: string;
  userId: string;
  initialMessages: Message[];
  canMessage?: boolean;
  mediaReady?: boolean;
  person: { name: string; avatarPath: string | null };
  self: { name: string; avatarPath: string | null };
}) {
  const t = useT();
  const router = useRouter();
  const { realtime } = useUnread();
  const [messages, setMessages] = useState(initialMessages);
  const latestTrade = messages.reduce<number | undefined>((id, message) => message.trade_status ? message.id : id, undefined);
  const seenTrade = useRef(latestTrade);
  useEffect(() => {
    if (latestTrade !== undefined && (seenTrade.current === undefined || latestTrade > seenTrade.current)) {
      seenTrade.current = latestTrade;
      router.refresh();
    }
  }, [latestTrade, router]);
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [attachmentMenu, setAttachmentMenu] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!attachmentMenu) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Element && !event.target.closest(".message-attach-control")) setAttachmentMenu(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setAttachmentMenu(false); };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [attachmentMenu]);
  const scroller = useRef<HTMLDivElement>(null);
  function selectFiles(selected: FileList | null) {
    if (!selected) return;
    const next = [...files, ...Array.from(selected)];
    try { validateAttachmentSelection(next); setFiles(next); setError(""); }
    catch (error) { setError(error instanceof Error ? error.message : "Choose valid files."); }
    setAttachmentMenu(false);
    if (photoInput.current) photoInput.current.value = "";
    if (fileInput.current) fileInput.current.value = "";
  }
  const [refreshError, setRefreshError] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [more, setMore] = useState(initialMessages.length === 50);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const ids = useRef({
    first: initialMessages[0]?.id,
    last: initialMessages.at(-1)?.id,
  });
  const retry = useRef<{ id: string; body: string; files: File[] } | null>(null);
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
  useEffect(() => {
    const frame = requestAnimationFrame(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; });
    return () => cancelAnimationFrame(frame);
  }, []);
  function merge(items: Message[]) {
    const follow = scroller.current && scroller.current.scrollHeight - scroller.current.scrollTop - scroller.current.clientHeight < 140;
    setMessages((current) => {
      const next = mergeMessages(current, items);
      ids.current = { first: next[0]?.id, last: next.at(-1)?.id };
      return next;
    });
    if (follow) requestAnimationFrame(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; });
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
            setRefreshError(result.error ?? "Messages could not be loaded.");
            return;
          }
          setRefreshError("");
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
          setRefreshError("We couldn’t refresh messages. Please try again.");
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
    if (!canMessage) return;
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setError("");
    retry.current =
      retry.current?.body === draft && retry.current.files === files
        ? retry.current
        : { id: crypto.randomUUID(), body: draft, files };
    try {
      let result: { error?: string };
      if (files.length) {
        const prepared = await prepareAttachments(files);
        const form = new FormData();
        form.set("conversationId", conversationId); form.set("clientId", retry.current.id); form.set("body", draft);
        for (const file of prepared) form.append("files", file);
        const response = await fetch("/api/messages/attachments", { method: "POST", body: form });
        result = await response.json();
        if (!response.ok && !result.error) result.error = "Files could not be sent. Please retry.";
      } else result = await postMessage(conversationId, retry.current.id, draft);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDraft("");
      setFiles([]);
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
    <section aria-label={t("Conversation messages")} className="media-chat">
      <p className="sr-only" role="status">{realtime ? <Text>{"Live messages connected."}</Text> : <Text>{"Connecting to live messages. Updates are also checked automatically."}</Text>}</p>
      {refreshError && <p role="status" className="message-feedback"><Text>{refreshError}</Text> <Text>{"Updates will retry automatically."}</Text></p>}
      {readError && <p role="status" className="message-feedback"><Text>{readError}</Text></p>}
      <div className="message-scroll" ref={scroller}>
        {more && <button className="message-load-older" onClick={older} disabled={loadingOlder}>{loadingOlder ? <Text>{"Loading…"}</Text> : <Text>{"Load older messages"}</Text>}</button>}
        <p className="sr-only" role="status">{t("{count} messages loaded.", { count: messages.length })}</p>
        <ol className="message-history" aria-label={t("Message history")}>
          {messages.map(message => {
            const own = message.sender_id === userId;
            const author = own ? self : person;
            const attachments = message.attachments ?? [];
            const autoBody = attachments.length && (message.body === "Photo" || message.body === attachments[0].name);
            return <li key={message.id} className={`message-row ${own ? "own" : ""}`}>
              <PersonAvatar name={author.name} path={author.avatarPath}/>
              <div className="message-content"><span className="sr-only">{own ? <Text>{"You"}</Text> : author.name}</span>
                {!autoBody && message.body && <p className={`message-bubble${message.trade_status ? " message-trade-update" : ""}`}>{message.trade_status ? <Text>{
                  message.trade_status === "reserved" ? "This item was reserved for you."
                    : message.trade_status === "sold" ? "Item marked sold. Confirm receipt in this conversation."
                    : "Buyer confirmed receipt. Feedback is now available."
                }</Text> : message.body}</p>}
                {attachments.some(file => file.mime === "image/webp") && <div className="message-photos">{attachments.filter(file => file.mime === "image/webp").map(file => <a key={file.id} href={`/api/messages/attachments/${file.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Open photo ${file.name}`}><Image src={`/api/messages/attachments/${file.id}`} alt={file.name} width={400} height={300} unoptimized/></a>)}</div>}
                {attachments.filter(file => file.mime !== "image/webp").map(file => <a key={file.id} className="message-file" href={`/api/messages/attachments/${file.id}?download=1`} download={file.name} aria-label={t("Download {name}", { name: file.name })}><span className="message-file-icon"><MessageIcon name="file"/></span><span><strong>{file.name}</strong><small>{file.name.split(".").at(-1)?.toUpperCase()} · {formatFileSize(file.size)}</small></span><span className="message-file-download"><MessageIcon name="download"/></span></a>)}
                <div className="message-time"><time dateTime={message.created_at}>{new Date(message.created_at).toLocaleTimeString("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" })}</time>{own && <span aria-label={t("Sent")}><Icon name="check-circle" width="14" height="14"/></span>}</div>
              </div>
            </li>;
          })}
        </ol>
        {!messages.length && <div className="conversation-empty"><Icon name="chat"/><p><Text>{"Say hello to your neighbor."}</Text></p></div>}
        <div ref={end}/>
      </div>
      {!canMessage && <p role="status" className="message-feedback"><Text>{"Messaging is unavailable between you and this user. You can still read previous messages."}</Text></p>}
      <form className="message-compose" onSubmit={submit} aria-busy={pending}>
        {files.length > 0 && <ul className="message-selected" aria-label={t("Selected attachments")}>{files.map((file, index) => <li key={index}><MessageIcon name="file"/><span>{file.name}<small>{formatFileSize(file.size)}</small></span><button type="button" aria-label={t("Remove {name}", { name: file.name })} disabled={pending} onClick={() => setFiles(files.filter((_, i) => i !== index))}><Icon name="close"/></button></li>)}</ul>}
        <div className="message-compose-row">
          <div className="message-attach-control">
            <button type="button" className="message-icon-button" aria-label={t("Attach photos or files")} aria-expanded={attachmentMenu} disabled={pending || !canMessage || !mediaReady} onClick={() => setAttachmentMenu(!attachmentMenu)}><MessageIcon name="attach"/></button>
            {attachmentMenu && canMessage && <div className="message-attach-menu"><button type="button" onClick={() => photoInput.current?.click()}><Icon name="image"/><Text>{"Photo"}</Text></button><button type="button" onClick={() => fileInput.current?.click()}><MessageIcon name="file"/><Text>{"File"}</Text></button></div>}
          </div>
          <button type="button" className="message-icon-button message-gallery" aria-label={t("Choose photos")} disabled={pending || !canMessage || !mediaReady} onClick={() => photoInput.current?.click()}><Icon name="image"/></button>
          <input className="sr-only" ref={photoInput} type="file" multiple disabled={pending || !canMessage || !mediaReady} accept="image/jpeg,image/png,image/webp" aria-label={t("Choose chat photos")} tabIndex={-1} onChange={event => selectFiles(event.target.files)}/>
          <input className="sr-only" ref={fileInput} type="file" multiple disabled={pending || !canMessage || !mediaReady} accept=".pdf,.txt,.csv,.zip,.docx,.xlsx" aria-label={t("Choose chat files")} tabIndex={-1} onChange={event => selectFiles(event.target.files)}/>
          <label className="sr-only" htmlFor="message-body"><Text>{"Your message"}</Text></label>
          <textarea id="message-body" value={draft} onChange={event => setDraft(event.target.value)} placeholder={t("Write a message…")} maxLength={2000} disabled={pending || !canMessage} rows={1} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && !pending && canMessage && (draft.trim() || files.length)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }}/>
          <button className="message-send" aria-label={t(pending ? "Sending message" : "Send message")} disabled={pending || !canMessage || (!draft.trim() && !files.length)}><MessageIcon name="send"/></button>
        </div>
        {canMessage && <p className="message-compose-hint">{pending ? <Text>{"Sending your message…"}</Text> : files.length ? <Text>{"Up to 4 attachments · 3 MB total after photo preparation"}</Text> : !mediaReady ? <Text>{"Photo and file sharing is being prepared. Text messages still work."}</Text> : <Text>{"Photos up to 10 MB · Files up to 3 MB"}</Text>}<span>{Array.from(draft).length}/2,000</span></p>}
        {error && <p role="alert" className="message-feedback message-error"><Text>{error}</Text></p>}
      </form>
    </section>
  );
}
