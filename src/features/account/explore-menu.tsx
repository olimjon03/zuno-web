"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Text, useT } from "@/features/language/provider";
import { Icon } from "@/components/ui/icon";
import { exploreGroups } from "./explore-catalog";

export function ExploreMenu({ onNavigate }: { onNavigate?: () => void }) {
  const t = useT();
  const titleId = useId();
  const [query, setQuery] = useState("");
  const term = query.trim().toLocaleLowerCase();
  const groups = exploreGroups.map(group => ({
    ...group,
    entries: group.entries.filter(({ title }) =>
      [group.title, t(group.title), title, t(title)].some(label => label.toLocaleLowerCase().includes(term)),
    ),
  })).filter(group => group.entries.length);
  return (
    <section className="explore-zuno" aria-labelledby={titleId}>
      <h2 id={titleId}><Text>{"Explore"}</Text>{" "}<span>ZUNO</span></h2>
      <p><Text>{"More ways to connect with your neighborhood."}</Text></p>
      <label className="feature-search">
        <Icon name="search" />
        <span className="sr-only"><Text>{"Search ZUNO features"}</Text></span>
        <input type="search" placeholder={t("Search ZUNO features")} value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <div className="feature-groups">
        {groups.map(group => <section className="account-card feature-group" key={group.title}>
          <header><h3><Text>{group.title}</Text></h3></header>
          {group.entries.map(entry => <Link className="feature-row" key={entry.slug} href={`/explore/${entry.slug}`} onClick={onNavigate}>
            <Icon name={entry.icon} />
            <span><strong><Text>{entry.title}</Text></strong><small><Text>{entry.description}</Text></small></span>
            <Icon name="chevron" />
          </Link>)}
        </section>)}
      </div>
      {!groups.length && <div>
        <p role="status"><Text>{"No features found. Try another search."}</Text></p>
        <button className="button button-outline" type="button" onClick={() => setQuery("")}><Text>{"Clear feature search"}</Text></button>
      </div>}
    </section>
  );
}
