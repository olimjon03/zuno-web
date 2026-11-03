"use client";
import { Icon } from "@/components/ui/icon";
import { useT } from "@/features/language/provider";
import { useLikes } from "./provider";
export function LikeButton({ id, count, title }: { id: string; count: number; title: string }) {
  const t = useT();
  const likes = useLikes();
  const liked = likes.ids.has(id), total = likes.counts[id] ?? count;
  return <button type="button" className={`listing-like ${liked ? "is-liked" : ""}`} aria-pressed={liked}
    aria-label={likes.error ? t("Retry likes") : t(liked ? "Unlike {title}" : "Like {title}", { title })}
    title={likes.error ? t("Likes are temporarily unavailable. Click to retry.") : t("{count} likes", { count: total })}
    disabled={likes.pending.has(id) || (!likes.ready && !likes.error)} aria-busy={likes.pending.has(id)}
    onClick={() => { if (likes.error) likes.retry();else void likes.toggle(id, count); }}>
    <Icon name="heart"/><span aria-hidden="true">{new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(total)}</span>
    <span className="sr-only">{t("{count} likes", { count: total })}</span>
  </button>;
}
