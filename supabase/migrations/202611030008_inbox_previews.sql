-- Apply after public profiles (007). Private inbox projection, no public chat data.
begin;
create or replace function public.get_inbox()
returns table (
 id uuid, listing_id uuid, listing_title text, other_id uuid, other_name text,
 avatar_path text, neighborhood text, last_message text,
 last_message_at timestamptz, thumbnail_id uuid
)
language plpgsql stable security definer set search_path = '' as $$
declare actor uuid := auth.uid();
begin
 if actor is null then raise exception 'Authentication required' using errcode='42501';end if;
 return query
 select c.id,c.listing_id,c.listing_title,
   case when c.buyer_id=actor then c.seller_id else c.buyer_id end,
   coalesce(p.display_name,case when c.buyer_id=actor then c.seller_name else c.buyer_name end),
   p.avatar_path,
   case when l.status in ('active','reserved','sold') then n.name else null end,
   left(latest.body,180),c.last_message_at,photo.id
 from public.conversations c
 left join public.profiles p on p.id=case when c.buyer_id=actor then c.seller_id else c.buyer_id end
 left join public.listings l on l.id=c.listing_id
 left join public.neighborhoods n on n.id=l.neighborhood_id
 left join lateral (
   select m.body from public.messages m where m.conversation_id=c.id order by m.id desc limit 1
 ) latest on true
 left join lateral (
   select i.id from public.listing_images i
   where i.listing_id=l.id and l.status in ('active','reserved','sold')
   order by i.sort_order,i.id limit 1
 ) photo on true
 where actor in (c.buyer_id,c.seller_id)
 order by c.last_message_at desc,c.id desc limit 100;
end $$;
revoke all on function public.get_inbox() from public,anon;
grant execute on function public.get_inbox() to authenticated;
commit;
