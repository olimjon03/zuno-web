import "server-only";

import { CommunityLayout, CommunityPost } from "../community-layout";
import { Icon } from "@/components/ui/icon";
import { resolveLocation } from "@/features/locations/catalog";
import Link from "next/link";
import { Text } from "@/features/language/provider";
import { LanguageSelector } from "@/features/language/language-selector";
import { parseNotificationSnapshot } from "@/features/notifications/model";
import { ExploreForm } from "../explore-form";
import { LocalPostFields } from "../explore-fields";
import { localPostKinds } from "../explore-catalog";
import { getExploreSession } from "./explore-session";

type Session = Awaited<ReturnType<typeof getExploreSession>>;
type Listing = { id: string; title: string };
type Post = { id: string; author_id: string; title: string; body: string; starts_at: string | null; created_at: string };

function rows<T>(result: { data: T[] | null; error: unknown }): T[] {
  if (result.error) throw new Error("Explore data could not be loaded");
  return result.data ?? [];
}

function Empty() {
  return <p className="explore-empty"><Text>{"Nothing here yet."}</Text></p>;
}

function ListingLink({ listing }: { listing: { id: string; title: string } }) {
  return <Link href={`/listings/${listing.id}`}>{listing.title}</Link>;
}

function AreaLink() {
  return <Link href="/account/settings"><Text>{"Choose your neighborhood in Profile settings."}</Text></Link>;
}

async function LocalPosts({ session, feature }: { session: Session; feature: string }) {
  const { db, user, profile } = session;
  const channel = feature === "local-events";
  const community = channel || feature === "neighborhood-posts";
  const event = feature === "meetups";
  let query = db.from("explore_posts").select("id,author_id,title,body,starts_at,created_at")
    .eq("kind", channel ? "neighborhood-posts" : feature);
  if (community) query = query.eq("neighborhood_id", profile.neighborhood_id ?? 0);
  const posts = rows<Post>(await query.order("created_at", { ascending: false }).limit(80));
  const area = community && profile.neighborhood_id ? await db.from("neighborhoods").select("name,region_code").eq("id", profile.neighborhood_id).maybeSingle() : null;
  if (community) {
    const authorsResult = posts.length ? await db.rpc("get_community_authors", {p_ids:[...new Set(posts.map(post=>post.author_id))]}) : null;
    const authors = new Map<string,{display_name:string;avatar_path:string|null}>((authorsResult?.data??[]).map((author:{id:string;display_name:string;avatar_path:string|null})=>[author.id,author]));
    const areaName=area?.data?.name??"Choose your neighborhood";
    const timeZone=resolveLocation(areaName,area?.data?.region_code).countryCode==="UZ"?"Asia/Tashkent":"Asia/Seoul";
    return <CommunityLayout channel={channel} area={areaName}>
      {!profile.neighborhood_id ? <AreaLink/> : !channel && <details className="community-composer">
        <summary><Icon name="pencil"/><Text>Create a post</Text></summary>
        <ExploreForm feature={feature} account={user.id} label="Publish"><LocalPostFields event={false}/></ExploreForm>
      </details>}
      {posts.length===0 && <p className="community-empty"><Text>Nothing here yet.</Text></p>}
      {posts.map((post,index)=>{
        const day=new Intl.DateTimeFormat("en-CA",{timeZone}).format(new Date(post.created_at));
        const divider=index===0 || day!==new Intl.DateTimeFormat("en-CA",{timeZone}).format(new Date(posts[index-1].created_at));
        return <div className="community-post-group" key={post.id}>
          {divider&&<div className="community-day"><span>{new Intl.DateTimeFormat("en",{dateStyle:"medium",timeZone}).format(new Date(post.created_at))}</span></div>}
          <CommunityPost post={post} author={authors.get(post.author_id)} area={areaName} timeZone={timeZone}>
            {!channel&&post.author_id===user.id&&<details className="community-manage">
              <summary><Text>Manage post</Text></summary>
              <ExploreForm feature={feature} account={user.id} id={post.id} label="Save changes"><LocalPostFields event={false} post={post}/></ExploreForm>
              <ExploreForm feature={feature} account={user.id} id={post.id} intent="remove" label="Remove post"/>
            </details>}
          </CommunityPost>
        </div>;
      })}
    </CommunityLayout>;
  }
  const ownsProfile = feature === "business-profile" && posts.some(post => post.author_id === user.id);
  return <>
    {channel && area?.data?.name && <h2>{area.data.name}</h2>}
    {channel && <p><Text>Read-only district channel. Neighborhood posts appear here automatically.</Text></p>}
    {!profile.neighborhood_id ? <AreaLink /> : !channel && !ownsProfile && <section className="explore-card">
      <h2><Text>{feature === "business-profile" ? "Create business profile" : "Create a post"}</Text></h2>
      <ExploreForm feature={feature} account={user.id} label="Publish">
        <LocalPostFields event={event} />
      </ExploreForm>
    </section>}
    {posts.length === 0 ? <Empty /> : posts.map(post => <article className="explore-card" key={post.id}>
      <h2>{post.title}</h2>
      {post.starts_at && <time dateTime={post.starts_at}>{new Date(post.starts_at).toISOString().slice(0, 16).replace("T", " ")} UTC</time>}
      <p className="explore-content">{post.body}</p>
      <Link href={`/neighbors/${post.author_id}`}><Text>{"View public profile"}</Text></Link>
      {!channel && post.author_id === user.id && <details>
        <summary><Text>{"Manage post"}</Text></summary>
        <ExploreForm feature={feature} account={user.id} id={post.id} label="Save changes">
          <LocalPostFields event={event} post={post} />
        </ExploreForm>
        <ExploreForm feature={feature} account={user.id} id={post.id} intent="remove" label="Remove post" />
      </details>}
    </article>)}
  </>;
}

async function Listings({ session, feature }: { session: Session; feature: string }) {
  const { db, user, profile } = session;
  if (feature === "recently-viewed") {
    const views = rows<{ listing_id: string }>(await db.from("explore_recent_views").select("listing_id").eq("user_id", user.id)
      .order("viewed_at", { ascending: false }).limit(80));
    const listings = views.length ? rows<Listing>(await db.from("listings").select("id,title").in("id", views.map(view => view.listing_id)).in("status", ["active", "reserved", "sold"])) : [];
    const byId = new Map(listings.map(item => [item.id, item]));
    return <>
      {views.length > 0 && <ExploreForm feature={feature} account={user.id} intent="clear" label="Clear viewing history" />}
      {listings.length === 0 ? <Empty /> : views.map(({ listing_id }) => {
        const item = byId.get(listing_id);
        return item && <article className="explore-card" key={item.id}><ListingLink listing={item} /></article>;
      })}
    </>;
  }
  const owned = rows<Listing>(await db.from("listings").select("id,title,status,seller_id,neighborhood_id").eq("seller_id", user.id)
    .in("status", feature === "business-insights" ? ["active", "reserved", "sold"] : ["active"])
    .order("created_at", { ascending: false }).limit(80));
  if (feature === "business-insights") return <>
    <Link href="/account/listings"><Text>{"Your listings"}</Text></Link>
    {owned.length === 0 ? <Empty /> : owned.map(item => <article className="explore-card" key={item.id}>
      <h2>{item.title}</h2>
      <Link href={`/account/listings/${item.id}/statistics`}><Text>{"View statistics"}</Text></Link>
    </article>)}
  </>;

  const promotions = rows<{ listing_id: string; user_id: string }>(await db.from("explore_promotions").select("listing_id,user_id")
    .order("created_at", { ascending: false }).limit(80));
  const ids = promotions.map(row => row.listing_id);
  const ownPromotions = owned.length ? rows<{ listing_id: string }>(await db.from("explore_promotions").select("listing_id").eq("user_id", user.id)
    .in("listing_id", owned.map(item => item.id))) : [];
  const featured = ids.length && profile.neighborhood_id ? rows<Listing>(await db.from("listings").select("id,title")
    .in("id", ids).eq("status", "active").eq("neighborhood_id", profile.neighborhood_id)) : [];
  return <>
    <p><Text>{"Promotion is free. Active promoted items appear in this neighborhood showcase."}</Text></p>
    <h2><Text>{"Your listings"}</Text></h2>
    {owned.length === 0 ? <Empty /> : owned.map(item => {
      const promoted = ownPromotions.some(promotion => promotion.listing_id === item.id);
      return <article className="explore-card" key={item.id}>
        <ListingLink listing={item} />
        <ExploreForm feature={feature} account={user.id} id={item.id} intent={promoted ? "remove" : "save"}
          label={promoted ? "Stop promotion" : "Promote a listing"} />
      </article>;
    })}
    <h2><Text>{"Featured nearby"}</Text></h2>
    {featured.length === 0 ? <Empty /> : featured.map(item => <article className="explore-card" key={item.id}><ListingLink listing={item} /></article>)}
  </>;
}

async function Purchases({ session }: { session: Session }) {
  const { db, user } = session;
  const chats = rows<{ id: string; listing_id: string; listing_title: string; buyer_id: string; seller_id: string }>(
    await db.from("conversations").select("id,listing_id,listing_title,buyer_id,seller_id")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).not("listing_id", "is", null)
      .order("last_message_at", { ascending: false }).limit(80),
  );
  if (chats.length === 0) return <Empty />;
  const [soldResult, confirmationResult] = await Promise.all([
    db.from("listings").select("id").in("id", chats.map(chat => chat.listing_id)).eq("status", "sold"),
    db.from("explore_trade_confirmations").select("conversation_id,user_id,seller_confirmation").in("conversation_id", chats.map(chat => chat.id)),
  ]);
  const sold = new Set(rows<{ id: string }>(soldResult).map(item => item.id));
  const confirmations = rows<{ conversation_id: string; user_id: string; seller_confirmation: boolean }>(confirmationResult);
  const relevant = chats.filter(chat => sold.has(chat.listing_id) || confirmations.some(row => row.conversation_id === chat.id));
  return <>
    <p><Text>{"Choose the buyer when marking the listing sold. Confirm receipt and leave feedback in Messages."}</Text></p>
    {relevant.length === 0 ? <Empty /> : relevant.map(chat => {
      const confirmed = confirmations.filter(row => row.conversation_id === chat.id);
      const sellerConfirmed = confirmed.some(row => row.seller_confirmation);
      const mine = confirmed.some(row => row.user_id === user.id);
      const seller = chat.seller_id === user.id;
      const selectedAnother = seller && relevant.some(other => other.listing_id === chat.listing_id && other.id !== chat.id &&
        confirmations.some(row => row.conversation_id === other.id && row.seller_confirmation));
      const canConfirm = sold.has(chat.listing_id) && !mine && !selectedAnother && seller;
      return <article className="explore-card" key={chat.id}>
        <h2>{chat.listing_title}</h2>
        <Link href={`/messages/${chat.id}`}><Text>{"Open conversation"}</Text></Link>
        <p><Text>{confirmed.length === 2 ? "Trade confirmed" : selectedAnother ? "Another buyer was confirmed" : sellerConfirmed ? "Waiting for buyer confirmation" : "Waiting for seller confirmation"}</Text></p>
        {canConfirm && <ExploreForm feature="purchase-history" account={user.id} id={chat.id}
          label="Confirm this buyer" />}

      </article>;
    })}
  </>;
}

async function Preferences({ session, feature }: { session: Session; feature: string }) {
  const { db, user, profile } = session;
  if (feature === "search-alerts") {
    const alerts = rows<{ id: string; query: string; country: string }>(await db.from("explore_search_alerts").select("id,query,country")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(80));
    return <>
      <p><Text>{"Get an in-app notification when a new listing title matches your keyword in your selected country."}</Text></p>
      {profile.country_code ? <ExploreForm feature={feature} account={user.id} label="Save search alert">
        <label><Text>{"Keyword"}</Text><input name="query" minLength={2} maxLength={80} required /></label>
      </ExploreForm> : <AreaLink />}
      {alerts.length === 0 ? <Empty /> : alerts.map(alert => <article className="explore-card" key={alert.id}>
        <h2>{alert.query} · {alert.country}</h2>
        <ExploreForm feature={feature} account={user.id} id={alert.id} intent="remove" label="Remove alert" />
      </article>)}
    </>;
  }

  const preference = await db.from("explore_preferences").select("large_text,search_notifications").eq("user_id", user.id).maybeSingle();
  if (preference.error) throw new Error("Preferences could not be loaded");
  if (feature === "language") return <section className="explore-card">
    <LanguageSelector />
    <ExploreForm feature={feature} account={user.id} label="Save changes">
      <label className="explore-check"><input type="checkbox" name="enabled" defaultChecked={preference.data?.large_text ?? false} /><Text>{"Use larger text"}</Text></label>
    </ExploreForm>
  </section>;

  const notifications = await db.rpc("get_my_notifications");
  if (notifications.error) throw new Error("Notifications could not be loaded");
  const snapshot = parseNotificationSnapshot(notifications.data);
  return <>
    <section className="explore-card">
      <ExploreForm feature={feature} account={user.id} label="Save changes">
        <label className="explore-check"><input type="checkbox" name="enabled" defaultChecked={preference.data?.search_notifications ?? true} />
          <Text>{"Show matching search alerts in notifications"}</Text></label>
      </ExploreForm>
    </section>
    <Link href="/messages"><Text>{"Open messages"}</Text></Link>
    {snapshot.unread_count > 0 && <ExploreForm feature={feature} account={user.id} intent="read" label="Mark all as read" />}
    {snapshot.items.length === 0 ? <Empty /> : snapshot.items.map(item => <article className="explore-card" key={item.id}>
      <h2><Link href={item.href}><Text>{item.title}</Text></Link></h2>
      <p className="explore-content">{item.body}</p>
      {!item.read_at && <ExploreForm feature={feature} account={user.id} id={item.id} intent="read" label="Mark as read" />}
    </article>)}
  </>;
}

async function Support({ session, feature }: { session: Session; feature: string }) {
  const { db, user, profile } = session;
  const moderator = await db.rpc("is_moderator");
  if (moderator.error) throw new Error("Moderator role could not be loaded");
  const canReview = moderator.data === true;

  if (feature === "announcements") {
    const announcements = rows<{ id: string; title: string; body: string }>(await db.from("explore_announcements")
      .select("id,title,body").order("created_at", { ascending: false }).limit(80));
    return <>
      {canReview && <ExploreForm feature={feature} account={user.id} label="Publish announcement"><LocalPostFields event={false} /></ExploreForm>}
      {announcements.length === 0 ? <Empty /> : announcements.map(item => <article className="explore-card" key={item.id}>
        <h2>{item.title}</h2>
        <p className="explore-content">{item.body}</p>
        {canReview && <ExploreForm feature={feature} account={user.id} id={item.id} intent="remove" label="Remove announcement" />}
      </article>)}
    </>;
  }
  if (feature === "feedback") {
    const feedback = rows<{ id: string; body: string; user_id: string }>(await db.from("explore_feedback")
      .select("id,body,user_id").order("created_at", { ascending: false }).limit(80));
    return <>
      <ExploreForm feature={feature} account={user.id} label="Send feedback">
        <label><Text>{"Feedback"}</Text><textarea name="body" minLength={10} maxLength={2000} required /></label>
      </ExploreForm>
      <h2><Text>{canReview ? "Feedback inbox" : "Your feedback"}</Text></h2>
      {feedback.length === 0 ? <Empty /> : feedback.map(item => <article className="explore-card" key={item.id}>
        <p className="explore-content">{item.body}</p>
        {canReview && <Link href={`/neighbors/${item.user_id}`}><Text>{"View public profile"}</Text></Link>}
      </article>)}
    </>;
  }
  const own = rows<{ neighborhood_id: number; status: string }>(await db.from("explore_location_requests")
    .select("neighborhood_id,status").eq("user_id", user.id).limit(1))[0];
  const queue = canReview ? rows<{ user_id: string; neighborhood_id: number; note: string }>(await db.from("explore_location_requests")
    .select("user_id,neighborhood_id,note").eq("status", "pending").neq("user_id", user.id)
    .order("created_at").limit(80)) : [];
  const neighborhoodIds = [...new Set(queue.map(item => item.neighborhood_id))];
  const areas = neighborhoodIds.length ? rows<{ id: number; name: string }>(await db.from("neighborhoods").select("id,name").in("id", neighborhoodIds)) : [];
  return <>
    <p><Text>{"Request manual review of your selected neighborhood. Do not include your exact address or identity documents."}</Text></p>
    {own ? <article className="explore-card">
      <h2><Text>{Number(own.neighborhood_id) !== Number(profile.neighborhood_id) ? "Neighborhood changed" : own.status === "approved" ? "Approved" : own.status === "declined" ? "Declined" : "Awaiting review"}</Text></h2>
      <ExploreForm feature={feature} account={user.id} intent="remove" label="Remove verification request" />
    </article> : profile.neighborhood_id ? <ExploreForm feature={feature} account={user.id} label="Request review">
      <label><Text>{"Why are you connected to this neighborhood?"}</Text><textarea name="body" minLength={10} maxLength={500} required /></label>
    </ExploreForm> : <AreaLink />}
    {canReview && <>
      <h2><Text>{"Verification queue"}</Text></h2>
      {queue.length === 0 ? <Empty /> : queue.map(item => <article className="explore-card" key={item.user_id}>
        <h2>{areas.find(area => Number(area.id) === Number(item.neighborhood_id))?.name}</h2>
        <p className="explore-content">{item.note}</p>
        <Link href={`/neighbors/${item.user_id}`}><Text>{"View public profile"}</Text></Link>
        <div className="explore-actions">
          <ExploreForm feature={feature} account={user.id} id={item.user_id} intent="approved" label="Approve" />
          <ExploreForm feature={feature} account={user.id} id={item.user_id} intent="declined" label="Decline" />
        </div>
      </article>)}
    </>}
  </>;
}

export async function ExploreFeatureContent({ feature }: { feature: string }) {
  const session = await getExploreSession();
  if (localPostKinds.has(feature)) return <LocalPosts session={session} feature={feature} />;
  switch (feature) {
    case "recently-viewed":
    case "business-insights":
    case "promote-listing":
      return <Listings session={session} feature={feature} />;
    case "purchase-history":
      return <Purchases session={session} />;
    case "search-alerts":
    case "language":
    case "notifications":
      return <Preferences session={session} feature={feature} />;
    case "feedback":
    case "announcements":
    case "location-verification":
      return <Support session={session} feature={feature} />;
    case "privacy":
      return <div className="explore-card explore-actions">
        <Link href="/account/settings"><Text>{"Profile settings"}</Text></Link>
        <Link href="/account/safety"><Text>{"Safety & privacy"}</Text></Link>
        <Link href="/help"><Text>{"Help"}</Text></Link>
      </div>;
    default:
      return null;
  }
}
