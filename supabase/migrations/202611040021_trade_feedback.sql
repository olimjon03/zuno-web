begin;

create table public.listing_reservations (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade
);
alter table public.listing_reservations enable row level security;
revoke all on public.listing_reservations from public,anon,authenticated;

create function public.get_listing_buyer_choices(p_listing_id uuid)
returns table(id uuid, buyer_id uuid, buyer_name text, avatar_path text, last_message text, reserved_buyer boolean)
language sql stable security definer set search_path=''
as $$
  select c.id, c.buyer_id, coalesce(p.display_name,c.buyer_name), p.avatar_path, left(m.body,160), exists(select 1 from public.listing_reservations r where r.listing_id=l.id and r.conversation_id=c.id)
  from public.listings l
  join public.conversations c on c.listing_id=l.id and c.seller_id=l.seller_id
  join public.profiles p on p.id=c.buyer_id
  cross join lateral (
    select msg.body from public.messages msg where msg.conversation_id=c.id and msg.sender_id=c.buyer_id
    order by msg.id desc limit 1
  ) m
  where l.id=p_listing_id and l.seller_id=auth.uid() and l.status in ('active','reserved')
    and not public.users_blocked(c.buyer_id,c.seller_id)
  order by c.last_message_at desc,c.id
  limit 100;
$$;

create function public.set_listing_buyer_status(p_listing_id uuid,p_conversation_id uuid,p_status text)
returns void language plpgsql security definer set search_path=''
as $$
declare item public.listings%rowtype; chat public.conversations%rowtype;
begin
  if auth.uid() is null or p_status is null or p_status not in ('reserved','sold') then
    raise exception 'Invalid trade action' using errcode='42501';
  end if;
  select * into item from public.listings where id=p_listing_id and seller_id=auth.uid()
    and moderated_at is null and status in ('active','reserved') for update;
  if not found or item.status=p_status then raise exception 'Listing status changed' using errcode='22023'; end if;
  select * into chat from public.conversations c
    where c.id=p_conversation_id and c.listing_id=item.id and c.seller_id=auth.uid()
    and not public.users_blocked(c.buyer_id,c.seller_id)
    and exists(select 1 from public.messages m where m.conversation_id=c.id and m.sender_id=c.buyer_id);
  if not found then raise exception 'Choose a buyer from this listing' using errcode='42501'; end if;

  update public.listings set status=p_status where id=item.id;
  if p_status='reserved' then
    insert into public.listing_reservations(listing_id,conversation_id) values(item.id,chat.id);
  else
    insert into public.explore_trade_confirmations(conversation_id,user_id) values(chat.id,auth.uid());
  end if;

  insert into public.notifications(user_id,kind,title,body,href)
  values(chat.buyer_id,'announcement',
    case when p_status='sold' then 'Confirm that you received your item' else 'An item was reserved for you' end,
    left(item.title,120),
    case when p_status='sold' then '/explore/purchase-history' else '/messages/'||chat.id::text end);
end;
$$;

-- Client writes must use the atomic buyer-selection workflow for new reservations and sales.
create function public.guard_listing_buyer_status()
returns trigger language plpgsql set search_path=''
as $$
begin
  if current_user in ('authenticated','anon') and (
    (new.status in ('reserved','sold') and (tg_op='INSERT' or old.status is distinct from new.status))
    or (tg_op='UPDATE' and old.status='sold' and new.status='active')
  ) then
    raise exception 'Choose a buyer through the listing trade action' using errcode='42501';
  end if;
  return new;
end;
$$;
create trigger guard_listing_buyer_status before insert or update of status on public.listings
for each row execute function public.guard_listing_buyer_status();

create function public.clear_listing_reservation()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if old.status='reserved' and new.status<>'reserved' then
    delete from public.listing_reservations where listing_id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function public.clear_listing_reservation() from public,anon,authenticated;
create trigger clear_listing_reservation after update of status on public.listings
for each row execute function public.clear_listing_reservation();

create function public.notify_trade_received()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if not new.seller_confirmation then
    insert into public.notifications(user_id,kind,title,body,href)
    select c.seller_id,'announcement','Your buyer confirmed receipt',left(c.listing_title,120),'/explore/purchase-history'
    from public.conversations c where c.id=new.conversation_id;
  end if;
  return new;
end;
$$;
revoke all on function public.notify_trade_received() from public,anon,authenticated;
create trigger notify_trade_received after insert on public.explore_trade_confirmations
for each row execute function public.notify_trade_received();

create table public.trade_feedback (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  reviewer_role text not null check(reviewer_role in ('buyer','seller')),
  positive boolean not null,
  reason text not null,
  created_at timestamptz not null default now(),
  primary key(conversation_id,reviewer_id)
);
create index trade_feedback_recipient_idx on public.trade_feedback(recipient_id,created_at desc,conversation_id);
alter table public.trade_feedback enable row level security;
revoke all on public.trade_feedback from public,anon,authenticated;
grant select on public.trade_feedback to authenticated;
create policy trade_feedback_own_read on public.trade_feedback for select to authenticated using(reviewer_id=auth.uid());

create function public.submit_trade_feedback(p_conversation_id uuid,p_positive boolean,p_reason text)
returns void language plpgsql security definer set search_path=''
as $$
declare chat public.conversations%rowtype; actor uuid:=auth.uid(); seller boolean;
begin
  select * into chat from public.conversations c where c.id=p_conversation_id and actor in (c.seller_id,c.buyer_id);
  if not found or p_positive is null or p_reason is null or
    (select count(*) from public.explore_trade_confirmations t
      where t.conversation_id=chat.id and t.user_id in (chat.buyer_id,chat.seller_id))<>2 then
    raise exception 'A completed trade is required' using errcode='42501';
  end if;
  seller:=actor=chat.seller_id;
  if not (
    (p_positive and (p_reason in ('on-time','good-communication') or (seller and p_reason='kept-agreement') or (not seller and p_reason='as-described')))
    or (not p_positive and (p_reason in ('no-show','difficult-communication') or (seller and p_reason='broke-agreement') or (not seller and p_reason='not-as-described')))
  ) then raise exception 'Choose a valid feedback reason' using errcode='22023'; end if;
  insert into public.trade_feedback(conversation_id,reviewer_id,recipient_id,reviewer_role,positive,reason)
  values(chat.id,actor,case when seller then chat.buyer_id else chat.seller_id end,
    case when seller then 'seller' else 'buyer' end,p_positive,p_reason);
end;
$$;

create function public.get_neighbor_feedback(p_profile_id uuid,p_filter text default 'all',p_offset integer default 0)
returns jsonb language sql stable security definer set search_path=''
as $$
  select jsonb_build_object(
    'positive',count(*) filter(where f.positive),
    'negative',count(*) filter(where not f.positive),
    'items',coalesce((
      select jsonb_agg(to_jsonb(page) - 'conversation_id' order by page.created_at desc,page.conversation_id)
      from (
        select x.positive,x.reason,x.reviewer_role,x.created_at,x.conversation_id
        from public.trade_feedback x where x.recipient_id=p_profile_id
          and (p_filter='all' or (p_filter='positive' and x.positive) or (p_filter='negative' and not x.positive))
        order by x.created_at desc,x.conversation_id limit 21 offset greatest(0,coalesce(p_offset,0))
      ) page
    ),'[]'::jsonb)
  )
  from public.trade_feedback f where f.recipient_id=p_profile_id;
$$;

revoke all on function public.get_listing_buyer_choices(uuid),public.set_listing_buyer_status(uuid,uuid,text),
  public.submit_trade_feedback(uuid,boolean,text),public.get_neighbor_feedback(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.get_listing_buyer_choices(uuid),public.set_listing_buyer_status(uuid,uuid,text),
  public.submit_trade_feedback(uuid,boolean,text) to authenticated;
grant execute on function public.get_neighbor_feedback(uuid,text,integer) to anon,authenticated;

commit;
