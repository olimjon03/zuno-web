-- Apply after 012. Raw viewer keys and conversation records never become public.
begin;
create table public.listing_view_totals (
 listing_id uuid primary key references public.listings(id) on delete cascade,
 view_count bigint not null default 0 check(view_count>=0)
);
create table public.listing_view_events (
 listing_id uuid not null references public.listings(id) on delete cascade,
 viewed_on date not null,
 viewer_key text not null,
 primary key(listing_id,viewed_on,viewer_key)
);
alter table public.listing_view_totals enable row level security;
alter table public.listing_view_events enable row level security;
revoke all on public.listing_view_totals,public.listing_view_events from public,anon,authenticated;
create function public.record_listing_view(p_listing_id uuid,p_visitor_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); owner_id uuid; day_utc date:=(now() at time zone 'UTC')::date; visitor text;
begin
 if p_visitor_id is null then raise exception 'Visitor required' using errcode='22023';end if;
 select seller_id into owner_id from public.listings where id=p_listing_id and status in('active','reserved','sold') for key share;
 if not found or actor=owner_id then return;end if;
 visitor:=md5(case when actor is null then 'browser:'||p_visitor_id::text else 'user:'||actor::text end);
 insert into public.listing_view_events(listing_id,viewed_on,viewer_key) values(p_listing_id,day_utc,visitor) on conflict do nothing;
 if found then
  insert into public.listing_view_totals(listing_id,view_count) values(p_listing_id,1)
  on conflict(listing_id) do update set view_count=public.listing_view_totals.view_count+1;
 end if;
 -- Totals persist; short-lived keys are needed only for daily deduplication.
 delete from public.listing_view_events where listing_id=p_listing_id and viewed_on<day_utc-2;
end $$;
create function public.get_listing_engagement(p_listing_ids uuid[]) returns table(listing_id uuid,view_count bigint,messager_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
 if p_listing_ids is null or cardinality(p_listing_ids)>1000 then raise exception 'Invalid listing batch' using errcode='22023';end if;
 return query select l.id,coalesce(v.view_count,0),
  (select count(distinct c.buyer_id) from public.conversations c where c.listing_id=l.id
   and exists(select 1 from public.messages m where m.conversation_id=c.id and m.sender_id=c.buyer_id))
 from public.listings l left join public.listing_view_totals v on v.listing_id=l.id
 where l.id=any(p_listing_ids) and l.status in('active','reserved','sold');
end $$;
revoke all on function public.record_listing_view(uuid,uuid),public.get_listing_engagement(uuid[]) from public;
grant execute on function public.record_listing_view(uuid,uuid),public.get_listing_engagement(uuid[]) to anon,authenticated;
commit;
