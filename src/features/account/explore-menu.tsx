"use client";
import { Text, useT } from "@/features/language/provider";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { LanguageSelector } from "@/features/language/language-selector";
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
  const t = useT();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = groups.map(group => ({ ...group, items: group.items.filter(([name]) => `${t(group.title)} ${t(name)} ${group.title} ${name}`.toLocaleLowerCase().includes(query.trim().toLowerCase())) })).filter(group => group.items.length);
  return <section className="explore-zuno" aria-labelledby="explore-title">
    <h2 id="explore-title"><Text>{"Explore"}</Text>{" "}<span>ZUNO</span></h2>
    <p><Text>{"More ways to connect with your neighborhood."}</Text></p>
    <label className="feature-search"><Icon name="search"/><span className="sr-only"><Text>{"Search ZUNO features"}</Text></span><input type="search" placeholder={t("Search ZUNO features")} value={query} onChange={event => setQuery(event.target.value)}/></label>
    <div className="feature-groups">{filtered.map(group => <section className="account-card feature-group" key={group.title}><header><h3><Text>{group.title}</Text></h3><span className="coming-soon"><Text>{"Coming soon"}</Text></span></header>{group.items.map(([name, description]) => <button className="feature-row" key={name} aria-label={name === "Language & appearance" ? t(name) : t("{feature} — coming soon", { feature: t(name) })} onClick={() => setSelected(name)}><Icon name={featureIcons[name] ?? group.icon}/><span><strong><Text>{name}</Text></strong><small><Text>{description}</Text></small></span><Icon name="chevron"/></button>)}</section>)}</div>
    <p className="sr-only" role="status">{t("{count} planned features found.", { count: filtered.reduce((count,group)=>count+group.items.length,0) })}</p>
    {!filtered.length && <div><p><Text>{"No features found. Try another search."}</Text></p><button className="button button-outline" onClick={()=>setQuery("")}><Text>{"Clear feature search"}</Text></button></div>}
    {selected && <DemoDialog title={selected === "Language & appearance" ? t(selected) : t("{feature} — coming soon", { feature: t(selected) })} onClose={() => setSelected(null)}>{selected === "Language & appearance" ? <><p><Text>{"Choose your interface language. Theme settings are coming soon."}</Text></p><LanguageSelector/></> : <p><Text>{"This feature is planned for ZUNO. It isn’t available yet. You can already browse, sell, save items, and chat with neighbors."}</Text></p>}</DemoDialog>}
  </section>;
}
