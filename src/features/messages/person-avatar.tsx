"use client";
import { useState } from "react";
import { Avatar } from "@/features/profile/avatar";
export function PersonAvatar({ name, path }: { name: string; path?: string | null }) {
  const [failed, setFailed] = useState<string | null>(null);
  return <span className="message-person-avatar" onErrorCapture={() => setFailed(path ?? null)}><Avatar name={name} path={path && failed !== path ? path : null}/></span>;
}
