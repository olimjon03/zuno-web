"use client";
import { Text, useT } from "@/features/language/provider";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "./avatar";
import "./avatar-form.css";
export function AvatarForm({ name, path }: { name: string; path?: string | null }) {
  const t = useT();
  const router = useRouter();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [chosen, setChosen] = useState<File | null>(null);
  const locked = useRef(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function upload(file: File) {
    if (locked.current) return;
    setError("");setMessage("");
    if (!file.size || file.size > 3 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setChosen(null);setError("Choose a JPG, PNG or WebP photo up to 3 MB.");return;
    }
    setChosen(file);locked.current = true;setPending(true);
    try {
      const body = new FormData();body.set("photo", file);
      const response = await fetch("/api/profile/avatar", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) setError(result.error || "Photo upload failed. Please retry.");
      else { setChosen(null);setMessage(result.message || "Profile photo updated.");router.refresh(); }
    } catch { setError("We couldn’t connect. Your photo has been kept for retry."); }
    finally { locked.current = false;setPending(false); }
  }
  return <div className={"profile-photo-control"} aria-busy={pending}>
    <div className={"profile-photo-picture"}><Avatar name={name} path={path}/>
      <button type="button" className={"profile-photo-add"} aria-label={t("Change profile photo")} title={t("Change profile photo")} aria-controls={inputId} aria-describedby={`${inputId}-help`} disabled={pending} onClick={() => input.current?.click()}>{pending ? <span aria-hidden="true">…</span> : <Icon name="plus" width="19" height="19"/>}</button>
    </div>
    <input id={inputId} ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden aria-label={t("Choose a profile photo")} disabled={pending} onChange={event => { const file=event.currentTarget.files?.[0];event.currentTarget.value="";if(file)void upload(file); }}/>
    <p id={`${inputId}-help`} className="sr-only"><Text>{"Choose a public profile photo. JPG, PNG or WebP, up to 3 MB. It uploads after selection."}</Text></p>
    {(pending || error || message) && <div className={"profile-photo-feedback"}>
      <p role={error ? "alert" : "status"}>{pending ? <Text>{"Uploading profile photo…"}</Text> : <Text>{error || message}</Text>}</p>
      {!pending && error && chosen && <button type="button" onClick={() => {if(chosen)void upload(chosen);}}><Text>{"Retry"}</Text></button>}
      {!pending && <button type="button" aria-label={t("Dismiss photo notification")} onClick={()=>{setError("");setMessage("");}}><Icon name="close" width="16" height="16"/></button>}
    </div>}
  </div>;
}
