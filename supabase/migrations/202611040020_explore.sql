begin;

create table public.explore_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('neighborhood-posts','local-events','meetups','local-jobs','home-services','neighborhood-guide','business-profile')),
  neighborhood_id bigint not null references public.neighborhoods(id),
  title text not null check (char_length(btrim(title)) between 3 and 100),
  body text not null check (char_length(btrim(body)) between 10 and 2000),
  starts_at timestamptz,
  created_at timestamptz not null default now(),
  check ((starts_at is not null) = (kind in ('local-events','meetups')))
);
create index explore_posts_area_idx on public.explore_posts(neighborhood_id,kind,created_at desc);
create index explore_posts_author_idx on public.explore_posts(author_id);
create unique index explore_business_owner_idx on public.explore_posts(author_id) where kind='business-profile';

create table public.explore_preferences (
  user_id uuid primary key default auth.uid() references public.profiles(id) on delete cascade,
  large_text boolean not null default false,
  search_notifications boolean not null default true
);
create table public.explore_search_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  country text not null check(country in ('UZ','KR')),
  query text not null check(char_length(btrim(query)) between 2 and 80),
  created_at timestamptz not null default now(),
  unique(user_id,country,query)
);
create index explore_alerts_country_idx on public.explore_search_alerts(country);
create table public.explore_recent_views (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key(user_id,listing_id)
);
create index explore_recent_user_idx on public.explore_recent_views(user_id,viewed_at desc);
create table public.explore_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check(char_length(btrim(body)) between 10 and 2000),
  created_at timestamptz not null default now()
);
create table public.explore_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check(char_length(btrim(title)) between 3 and 100),
  body text not null check(char_length(btrim(body)) between 10 and 2000),
  created_at timestamptz not null default now()
);
alter table public.explore_announcements enable row level security;
revoke all on public.explore_announcements from public, anon, authenticated;
grant select, delete on public.explore_announcements to authenticated;
grant insert(title,body) on public.explore_announcements to authenticated;
create policy explore_announcements_read on public.explore_announcements for select to authenticated using(true);
create policy explore_announcements_publish on public.explore_announcements for insert to authenticated with check(public.is_moderator());
create policy explore_announcements_delete on public.explore_announcements for delete to authenticated using(public.is_moderator());

create table public.explore_promotions (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.explore_trade_confirmations (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_confirmation boolean not null,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(conversation_id,user_id)
);
create unique index explore_one_seller_confirmation on public.explore_trade_confirmations(listing_id) where seller_confirmation;

create function public.prepare_explore_trade_confirmation()
returns trigger language plpgsql security definer set search_path=''
as $$
declare trade record;
begin
  select c.listing_id,c.buyer_id,c.seller_id into trade
  from public.conversations c join public.listings l on l.id=c.listing_id
  where c.id=new.conversation_id and auth.uid() in (c.buyer_id,c.seller_id) and l.status='sold'
  for share of l;
  if not found or new.user_id is distinct from auth.uid() then
    raise exception 'Invalid trade' using errcode='42501';
  end if;
  new.listing_id:=trade.listing_id;
  new.seller_confirmation:=auth.uid()=trade.seller_id;
  if not new.seller_confirmation and not exists(
    select 1 from public.explore_trade_confirmations
    where conversation_id=new.conversation_id and seller_confirmation
  ) then
    raise exception 'Seller confirmation required' using errcode='42501';
  end if;
  return new;
end;
$$;
revoke all on function public.prepare_explore_trade_confirmation() from public,anon,authenticated;
create trigger prepare_explore_trade before insert on public.explore_trade_confirmations
for each row execute function public.prepare_explore_trade_confirmation();

create table public.explore_location_requests (
  user_id uuid primary key default auth.uid() references public.profiles(id) on delete cascade,
  neighborhood_id bigint not null references public.neighborhoods(id),
  note text not null check(char_length(btrim(note)) between 10 and 500),
  status text not null default 'pending' check(status in ('pending','approved','declined')),
  created_at timestamptz not null default now()
);

alter table public.explore_posts enable row level security;
alter table public.explore_preferences enable row level security;
alter table public.explore_search_alerts enable row level security;
alter table public.explore_recent_views enable row level security;
alter table public.explore_feedback enable row level security;
alter table public.explore_promotions enable row level security;
alter table public.explore_trade_confirmations enable row level security;
alter table public.explore_location_requests enable row level security;

revoke all on public.explore_posts, public.explore_preferences, public.explore_search_alerts,
  public.explore_recent_views, public.explore_feedback, public.explore_promotions,
  public.explore_trade_confirmations, public.explore_location_requests from public, anon, authenticated;

grant select, delete on public.explore_posts to authenticated;
grant insert(kind,neighborhood_id,title,body,starts_at) on public.explore_posts to authenticated;
grant update(title,body,starts_at) on public.explore_posts to authenticated;
create policy explore_posts_read on public.explore_posts for select to authenticated using (
  author_id=auth.uid() or (
    neighborhood_id=(select neighborhood_id from public.profiles where id=auth.uid())
    and (select can_message from public.get_safety_state(author_id))
  )
);
create policy explore_posts_insert on public.explore_posts for insert to authenticated with check (
  author_id=auth.uid() and neighborhood_id=(select neighborhood_id from public.profiles where id=auth.uid())
);
create policy explore_posts_edit on public.explore_posts for update to authenticated using(author_id=auth.uid()) with check(author_id=auth.uid());
create policy explore_posts_delete on public.explore_posts for delete to authenticated using(author_id=auth.uid());

grant select, insert, update on public.explore_preferences to authenticated;
create policy explore_preferences_own on public.explore_preferences for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

grant select, delete on public.explore_search_alerts to authenticated;
grant insert(country,query) on public.explore_search_alerts to authenticated;
create policy explore_alerts_read on public.explore_search_alerts for select to authenticated using(user_id=auth.uid());
create policy explore_alerts_insert on public.explore_search_alerts for insert to authenticated with check (
  user_id=auth.uid() and country=(select country_code from public.profiles where id=auth.uid())
);
create policy explore_alerts_delete on public.explore_search_alerts for delete to authenticated using(user_id=auth.uid());

grant select, insert, update, delete on public.explore_recent_views to authenticated;
create policy explore_views_own on public.explore_recent_views for all to authenticated
  using(user_id=auth.uid())
  with check(user_id=auth.uid() and exists(select 1 from public.listings l where l.id=listing_id and l.status in ('active','reserved','sold')));

grant select on public.explore_feedback to authenticated;
grant insert(body) on public.explore_feedback to authenticated;
create policy explore_feedback_read on public.explore_feedback for select to authenticated using(user_id=auth.uid() or public.is_moderator());
create policy explore_feedback_insert on public.explore_feedback for insert to authenticated with check(user_id=auth.uid());

grant select, delete on public.explore_promotions to authenticated;
grant insert(listing_id) on public.explore_promotions to authenticated;
create policy explore_promotions_read on public.explore_promotions for select to authenticated using (
  user_id=auth.uid() or exists(select 1 from public.listings l where l.id=listing_id and l.status='active')
);
create policy explore_promotions_insert on public.explore_promotions for insert to authenticated with check (
  user_id=auth.uid() and exists(select 1 from public.listings l where l.id=listing_id and l.seller_id=auth.uid() and l.status='active')
);
create policy explore_promotions_delete on public.explore_promotions for delete to authenticated using(user_id=auth.uid());

grant select on public.explore_trade_confirmations to authenticated;
grant insert(conversation_id) on public.explore_trade_confirmations to authenticated;
create policy explore_trade_read on public.explore_trade_confirmations for select to authenticated using (
  exists(select 1 from public.conversations c where c.id=conversation_id and auth.uid() in (c.buyer_id,c.seller_id))
);
create policy explore_trade_insert on public.explore_trade_confirmations for insert to authenticated with check (
  user_id=auth.uid() and exists(
    select 1 from public.conversations c join public.listings l on l.id=c.listing_id
    where c.id=conversation_id and auth.uid() in (c.buyer_id,c.seller_id) and l.status='sold'
  )
);

grant select on public.explore_location_requests to authenticated;
grant insert(neighborhood_id,note) on public.explore_location_requests to authenticated;
grant update(status) on public.explore_location_requests to authenticated;
grant delete on public.explore_location_requests to authenticated;
create policy explore_location_read on public.explore_location_requests for select to authenticated using(user_id=auth.uid() or public.is_moderator());
create policy explore_location_insert on public.explore_location_requests for insert to authenticated with check (
  user_id=auth.uid() and neighborhood_id=(select neighborhood_id from public.profiles where id=auth.uid()) and status='pending'
);
create policy explore_location_review on public.explore_location_requests for update to authenticated
  using(public.is_moderator() and status='pending' and user_id<>auth.uid())
  with check(public.is_moderator() and status in ('approved','declined') and user_id<>auth.uid());
create policy explore_location_cancel on public.explore_location_requests for delete to authenticated using(user_id=auth.uid());

create function public.notify_explore_search_matches()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if new.status='active' then
    insert into public.notifications(user_id,kind,title,body,href)
    select distinct a.user_id,'announcement','New listing matches your search',left(new.title,120),'/listings/'||new.id::text
    from public.explore_search_alerts a
    join public.neighborhoods n on n.id=new.neighborhood_id and left(n.region_code,2)=a.country
    left join public.explore_preferences p on p.user_id=a.user_id
    where a.user_id<>new.seller_id and coalesce(p.search_notifications,true)
      and not public.users_blocked(a.user_id,new.seller_id)
      and strpos(lower(new.title),lower(a.query))>0;
  end if;
  return new;
end;
$$;
revoke all on function public.notify_explore_search_matches() from public,anon,authenticated;
create trigger explore_search_matches after insert on public.listings
for each row execute function public.notify_explore_search_matches();

create or replace function public.record_listing_view(p_listing_id uuid,p_visitor_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); owner_id uuid; day_utc date:=(now() at time zone 'UTC')::date; visitor text;
begin
 if p_visitor_id is null then raise exception 'Visitor required' using errcode='22023';end if;
 select seller_id into owner_id from public.listings where id=p_listing_id and status in('active','reserved','sold') for key share;
 if not found or actor=owner_id then return;end if;
 if actor is not null and exists(select 1 from public.profiles where id=actor) then
  insert into public.explore_recent_views(user_id,listing_id,viewed_at) values(actor,p_listing_id,now())
  on conflict(user_id,listing_id) do update set viewed_at=excluded.viewed_at;
  delete from public.explore_recent_views where user_id=actor and viewed_at<now()-interval '90 days';
 end if;
 visitor:=md5(case when actor is null then 'browser:'||p_visitor_id::text else 'user:'||actor::text end);
 insert into public.listing_view_events(listing_id,viewed_on,viewer_key) values(p_listing_id,day_utc,visitor) on conflict do nothing;
 if found then
  insert into public.listing_view_totals(listing_id,view_count) values(p_listing_id,1)
  on conflict(listing_id) do update set view_count=public.listing_view_totals.view_count+1;
 end if;
 -- Totals persist; short-lived keys are needed only for daily deduplication.
 delete from public.listing_view_events where listing_id=p_listing_id and viewed_on<day_utc-2;
end $$;

commit;
