import type { InboxEntry } from "./types";
export function filterInbox(entries: InboxEntry[], query: string, unreadOnly: boolean, counts: Record<string, number>) {
  const term=query.trim().toLocaleLowerCase();
  return entries.filter(entry=>(!unreadOnly || (counts[entry.id] ?? 0)>0) &&
    `${entry.otherName} ${entry.listingTitle} ${entry.lastMessage ?? ""} ${entry.neighborhood ?? ""}`.toLocaleLowerCase().includes(term));
}
export function inboxTime(value: string, now: number) {
  const time=new Date(value).getTime();
  if(!Number.isFinite(time))return "";
  const minutes=Math.max(0,Math.floor((now-time)/60000));
  if(minutes<1)return "Now";
  if(minutes<60)return `${minutes}m ago`;
  const hours=Math.floor(minutes/60);
  if(hours<24)return `${hours}h ago`;
  const days=Math.floor(hours/24);
  if(days<7)return `${days}d ago`;
  return new Date(time).toLocaleDateString("en-GB",{day:"numeric",month:"short",timeZone:"Asia/Seoul"});
}
