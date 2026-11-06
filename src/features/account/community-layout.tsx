import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/ui/brand";
import { Icon } from "@/components/ui/icon";
import { HeaderTools } from "@/components/layout/header-tools";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Avatar } from "@/features/profile/avatar";
import { Text } from "@/features/language/provider";

export function CommunityHeader() {
  return <header className="community-header">
    <Link href="/" className="wordmark" aria-label="ZUNO home"><Brand/></Link>
    <form action="/" role="search" className="community-search"><Icon name="search"/><input name="q" type="search" maxLength={100} aria-label="Search marketplace" placeholder="Search ZUNO…"/></form>
    <div className="community-header-actions"><HeaderTools/><Link href="/account/saved" aria-label="Saved items"><Icon name="bookmark"/></Link><Link href="/messages" aria-label="Messages"><Icon name="chat"/></Link><Link href="/account" aria-label="My ZUNO"><Icon name="user-circle"/></Link><BackHomeNav/></div>
  </header>;
}

function DistrictIllustration() {
  return <svg className="community-map" viewBox="0 0 280 190" fill="none" aria-hidden="true">
    <rect width="280" height="190" rx="16" fill="#edf2ef"/>
    <path d="M0 10h80L40 90H0ZM204 85l76-30v135h-92Z" fill="#c7ecd0"/>
    <path d="m-20 145 320-90M35-20l190 230M130-20 15 210M260-20 85 210M-20 65l320 100" stroke="white" strokeWidth="13"/>
    <path d="M140 55c-20 0-34 14-34 32 0 25 34 50 34 50s34-25 34-50c0-18-14-32-34-32Z" fill="#008f83"/>
    <circle cx="140" cy="86" r="11" fill="white"/>
  </svg>;
}

export function CommunityLayout({channel,area,children}:{channel:boolean;area:string;children:ReactNode}) {
  return <div className="community-layout">
    <nav className="community-sidebar" aria-label="Community">
      <h2><Text>Community</Text></h2>
      <Link href="/explore/neighborhood-posts" aria-current={!channel?"page":undefined}><Icon name="home"/><Text>Neighborhood posts</Text></Link>
      <Link href="/explore/local-events" aria-current={channel?"page":undefined}><Icon name="calendar"/><Text>Local events</Text></Link>
    </nav>
    <main className="community-main">
      <section className="community-hero">
        <p className="community-area"><Icon name="pin"/>{area}</p>
        <div className="community-title"><h1><Text>{channel?"Local events":"Neighborhood posts"}</Text></h1>{channel&&<span className="community-readonly"><Icon name="shield"/><Text>Read-only channel</Text></span>}</div>
        <p><Text>{channel?"Updates from your neighborhood, all in one place.":"Share a little. Connect a little closer."}</Text></p>
      </section>
      {children}
    </main>
    <aside className="community-about">
      <DistrictIllustration/><h2><Text>Your district channel</Text></h2>
      <p><Text>Posts are shared automatically from Neighborhood posts.</Text></p>
      <Link href="/account/settings"><Icon name="pin"/><Text>Change neighborhood</Text><Icon name="chevron"/></Link>
    </aside>
  </div>;
}

export function CommunityPost({post,author,area,timeZone,children}:{post:{id:string;author_id:string;title:string;body:string;created_at:string};author?:{display_name:string;avatar_path:string|null};area:string;timeZone:string;children?:ReactNode}) {
  const name=author?.display_name??"Neighbor";
  return <article className="community-post">
    <header><Link className="community-author" href={`/neighbors/${post.author_id}`}><Avatar name={name} path={author?.avatar_path}/><span><strong>{name}</strong><small>{area}</small></span></Link>
      <time dateTime={post.created_at}>{new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone}).format(new Date(post.created_at))}</time>
    </header>
    <h2>{post.title}</h2><p className="community-body">{post.body}</p>
    {children}
  </article>;
}
