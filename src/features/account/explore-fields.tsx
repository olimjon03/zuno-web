"use client";

import { Text } from "@/features/language/provider";

export function LocalPostFields({ event, post }: {
  event: boolean;
  post?: { title: string; body: string; starts_at: string | null };
}) {
  return <>
    <label><Text>{"Title"}</Text><input name="title" defaultValue={post?.title} minLength={3} maxLength={100} required /></label>
    <label><Text>{"Description"}</Text><textarea name="body" defaultValue={post?.body} minLength={10} maxLength={2000} required /></label>
    {event && <label><Text>{"Start time (UTC)"}</Text>
      <input name="starts_at" type="datetime-local" defaultValue={post?.starts_at ? new Date(post.starts_at).toISOString().slice(0, 16) : undefined}
        required />
    </label>}
  </>;
}
