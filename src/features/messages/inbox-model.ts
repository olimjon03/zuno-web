import type { InboxEntry } from "./types";
export function filterInbox(entries: InboxEntry[], query: string, unreadOnly: boolean, counts: Record<string, number>) {
  const term=query.trim().toLocaleLowerCase();
  return entries.filter(entry=>(!unreadOnly || (counts[entry.id] ?? 0)>0) &&
    `${entry.otherName} ${entry.listingTitle} ${entry.lastMessage ?? ""} ${entry.neighborhood ?? ""}`.toLocaleLowerCase().includes(term));
}
export function inboxTime(value: string, now: number, language: "en" | "uz" | "ko" = "en") {
  const time=new Date(value).getTime();
  if(!Number.isFinite(time))return "";
  const minutes=Math.max(0,Math.floor((now-time)/60000));
  if(minutes<1)return language === "en" ? "Now" : new Intl.RelativeTimeFormat(language,{numeric:"auto"}).format(0,"second");
  if(minutes<60)return language === "en" ? `${minutes}m ago` : new Intl.RelativeTimeFormat(language,{style:"short"}).format(-minutes,"minute");
  const hours=Math.floor(minutes/60);
  if(hours<24)return language === "en" ? `${hours}h ago` : new Intl.RelativeTimeFormat(language,{style:"short"}).format(-hours,"hour");
  const days=Math.floor(hours/24);
  if(days<7)return language === "en" ? `${days}d ago` : new Intl.RelativeTimeFormat(language,{style:"short"}).format(-days,"day");
  return new Date(time).toLocaleDateString(language === "en" ? "en-GB" : language,{day:"numeric",month:"short",timeZone:"Asia/Seoul"});
}
