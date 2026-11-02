"use client";
import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { DemoDialog } from "@/components/ui/demo-dialog";
const groups: { title: string; icon: IconName; items: [string, string][] }[] = [
  { title: "Community", icon: "people", items: [["Neighborhood posts", "See what’s happening nearby."], ["Local events", "Find events in your area."], ["Meetups", "Connect with neighbors."]] },
  { title: "Local services", icon: "briefcase", items: [["Local jobs", "Discover opportunities nearby."], ["Home services", "Find help in your area."], ["Neighborhood guide", "Explore useful places nearby."]] },
  { title: "For business", icon: "store", items: [["Business profile", "Showcase your business locally."], ["Promote a listing", "Reach more neighbors."], ["Business insights", "Learn about your audience."]] },
  { title: "Buying & selling", icon: "list", items: [["Purchase history", "View your past transactions."], ["Recently viewed", "See items you looked at."], ["Search alerts", "Get notified about new listings."]] },
  { title: "Preferences", icon: "settings", items: [["Notifications", "Choose what you want to hear about."], ["Language & appearance", "Set your language and theme."], ["Location verification", "Help keep ZUNO safe and local."]] },
  { title: "Support", icon: "shield", items: [["Announcements", "Get the latest updates from ZUNO."], ["Feedback", "Share your ideas with us."], ["Account & privacy", "Manage your account and data."]] },
];
const featureIcons: Record<string, IconName> = { "Neighborhood posts":"chat", "Local events":"calendar", "Meetups":"people", "Local jobs":"briefcase", "Home services":"settings", "Neighborhood guide":"pin", "Business profile":"store", "Promote a listing":"arrow", "Business insights":"chart", "Purchase history":"list", "Recently viewed":"search", "Search alerts":"bell", "Notifications":"bell", "Language & appearance":"settings", "Location verification":"pin", "Announcements":"bell", "Feedback":"chat", "Account & privacy":"shield" };
export function ExploreMenu() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = groups.map(group => ({ ...group, items: group.items.filter(([name]) => `${group.title} ${name}`.toLowerCase().includes(query.trim().toLowerCase())) })).filter(group => group.items.length);
  return <section className="explore-zuno" aria-labelledby="explore-title">
    <h2 id="explore-title">Explore <span>ZUNO</span></h2>
    <p>More ways to connect with your neighborhood.</p>
    <label className="feature-search"><Icon name="search"/><span className="sr-only">Search ZUNO features</span><input type="search" placeholder="Search ZUNO features" value={query} onChange={event => setQuery(event.target.value)}/></label>
    <div className="feature-groups">{filtered.map(group => <section className="account-card feature-group" key={group.title}><header><h3>{group.title}</h3><span className="coming-soon">Coming soon</span></header>{group.items.map(([name, description]) => <button className="feature-row" key={name} onClick={() => setSelected(name)}><Icon name={featureIcons[name] ?? group.icon}/><span><strong>{name}</strong><small>{description}</small></span><Icon name="chevron"/></button>)}</section>)}</div>
    {!filtered.length && <p role="status">No features found. Try another search.</p>}
    {selected && <DemoDialog title={`${selected} — coming soon`} onClose={() => setSelected(null)}><p>This feature is planned for ZUNO. It isn’t available yet. You can already browse, sell, save items, and chat with neighbors.</p></DemoDialog>}
  </section>;
}
