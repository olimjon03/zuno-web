-- Apply after 013. Saved bookmarks and public likes are separate features.
begin;
create table public.listing_likes (
 listing_id uuid not null references public.listings(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key (listing_id,user_id)
);
create index listing_likes_by_user on public.listing_likes(user_id,listing_id);
alter table public.listing_likes enable row level security;
revoke all on public.listing_likes from public,anon,authenticated;
grant select on public.listing_likes to authenticated;
create policy "Read own listing likes" on public.listing_likes for select to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.listings l where l.id=listing_id and l.status in('active','reserved','sold')));
create function public.set_listing_like(p_listing_id uuid,p_liked boolean)
returns table(liked boolean,like_count bigint)
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); item_status text;
begin
 if actor is null then raise exception 'Login required' using errcode='42501';end if;
 if p_listing_id is null or p_liked is null then raise exception 'Invalid like' using errcode='22023';end if;
 -- Serialize like changes for a listing, returning the authoritative count.
 select status into item_status from public.listings where id=p_listing_id for update;
 if not found or item_status not in('active','reserved','sold') then raise exception 'Listing unavailable' using errcode='P0002';end if;
 if p_liked then
  insert into public.listing_likes(listing_id,user_id) values(p_listing_id,actor) on conflict do nothing;
 else
  delete from public.listing_likes where listing_id=p_listing_id and user_id=actor;
 end if;
 return query select p_liked,count(*) from public.listing_likes where listing_id=p_listing_id;
end $$;
revoke all on function public.set_listing_like(uuid,boolean) from public,anon;
grant execute on function public.set_listing_like(uuid,boolean) to authenticated;
-- Recreate to extend the return shape; previous frontend versions ignore the extra column.
drop function public.get_listing_engagement(uuid[]);
create function public.get_listing_engagement(p_listing_ids uuid[])
returns table(listing_id uuid,view_count bigint,messager_count bigint,like_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
 if p_listing_ids is null or cardinality(p_listing_ids)>1000 then raise exception 'Invalid listing batch' using errcode='22023';end if;
 return query select l.id,coalesce(v.view_count,0),
  (select count(distinct c.buyer_id) from public.conversations c where c.listing_id=l.id
   and exists(select 1 from public.messages m where m.conversation_id=c.id and m.sender_id=c.buyer_id)),
  (select count(*) from public.listing_likes k where k.listing_id=l.id)
 from public.listings l left join public.listing_view_totals v on v.listing_id=l.id
 where l.id=any(p_listing_ids) and l.status in('active','reserved','sold');
end $$;
revoke all on function public.get_listing_engagement(uuid[]) from public;
grant execute on function public.get_listing_engagement(uuid[]) to anon,authenticated;
commit;
