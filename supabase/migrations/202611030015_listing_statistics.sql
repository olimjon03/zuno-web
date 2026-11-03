-- Apply after 014. Daily history starts on deployment; older totals are retained.
begin;
create table public.listing_daily_views (
 listing_id uuid not null references public.listings(id) on delete cascade,
 viewed_on date not null, view_count bigint not null check(view_count>=0),
 primary key(listing_id,viewed_on)
);
alter table public.listing_daily_views enable row level security;
revoke all on public.listing_daily_views from public,anon,authenticated;
create or replace function public.record_listing_view(p_listing_id uuid,p_visitor_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); owner_id uuid; day_utc date:=(now() at time zone 'UTC')::date; visitor text;
begin
 if p_visitor_id is null then raise exception 'Visitor required' using errcode='22023';end if;
 select seller_id into owner_id from public.listings where id=p_listing_id and status in('active','reserved','sold') for key share;
 if not found or actor=owner_id then return;end if;
 visitor:=md5(case when actor is null then 'browser:'||p_visitor_id::text else 'user:'||actor::text end);
 insert into public.listing_view_events(listing_id,viewed_on,viewer_key) values(p_listing_id,day_utc,visitor) on conflict do nothing;
 if found then
  insert into public.listing_daily_views(listing_id,viewed_on,view_count) values(p_listing_id,day_utc,1) on conflict(listing_id,viewed_on) do update set view_count=public.listing_daily_views.view_count+1;
  insert into public.listing_view_totals(listing_id,view_count) values(p_listing_id,1)
  on conflict(listing_id) do update set view_count=public.listing_view_totals.view_count+1;
 end if;
 -- Totals persist; short-lived keys are needed only for daily deduplication.
 delete from public.listing_view_events where listing_id=p_listing_id and viewed_on<day_utc-2;
end $$;
create function public.get_owned_listing_statistics(p_listing_id uuid,p_days integer default 7)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; start_day date; item public.listings;
begin
 if auth.uid() is null then raise exception 'Login required' using errcode='42501';end if;
 if p_days is null or p_days not in(0,7,30) then raise exception 'Invalid period' using errcode='22023';end if;
 select * into item from public.listings where id=p_listing_id and seller_id=auth.uid() and status<>'removed';
 if not found then raise exception 'Listing unavailable' using errcode='P0002';end if;
 start_day:=case when p_days=0 then (item.created_at at time zone 'UTC')::date else (now() at time zone 'UTC')::date-p_days+1 end;
 select jsonb_build_object(
  'views',case when p_days=0 then coalesce((select view_count from public.listing_view_totals where listing_id=item.id),0) else coalesce((select sum(view_count) from public.listing_daily_views where listing_id=item.id and viewed_on>=start_day),0) end,
  'likes',(select count(*) from public.listing_likes where listing_id=item.id and (p_days=0 or created_at>=start_day::timestamp at time zone 'UTC')),
  'saves',(select count(*) from public.favorites where listing_id=item.id and (p_days=0 or created_at>=start_day::timestamp at time zone 'UTC')),
  'messagers',(select count(distinct c.buyer_id) from public.conversations c where c.listing_id=item.id and exists(select 1 from public.messages m where m.conversation_id=c.id and m.sender_id=c.buyer_id and (p_days=0 or m.created_at>=start_day::timestamp at time zone 'UTC'))),
  'daily',coalesce((select jsonb_agg(jsonb_build_object('date',viewed_on,'views',view_count) order by viewed_on) from public.listing_daily_views where listing_id=item.id and viewed_on>=start_day),'[]'::jsonb),
  'listedAt',item.created_at
 ) into result;
 return result;
end $$;
revoke all on function public.get_owned_listing_statistics(uuid,integer) from public,anon;
grant execute on function public.get_owned_listing_statistics(uuid,integer) to authenticated;
commit;
