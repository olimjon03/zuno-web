begin;

-- Only trusted trade functions write this field. Ordinary messages keep it null.
alter table public.messages add column trade_status text
  check(trade_status in ('reserved','sold','received'));

create or replace function public.set_listing_buyer_status(p_listing_id uuid,p_conversation_id uuid,p_status text)
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
  if p_conversation_id is null then
    update public.listings set status=p_status where id=item.id;
    return;
  end if;

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

  insert into public.messages(conversation_id,sender_id,client_id,body,trade_status)
  values(chat.id,auth.uid(),gen_random_uuid(),
    case when p_status='sold' then 'Item marked sold. Confirm receipt in this conversation.' else 'This item was reserved for you.' end,
    p_status);
  update public.conversations set last_message_at=now() where id=chat.id;

  insert into public.notifications(user_id,kind,title,body,href)
  values(chat.buyer_id,'announcement',
    case when p_status='sold' then 'Confirm that you received your item' else 'An item was reserved for you' end,
    left(item.title,120),
    '/messages/'||chat.id::text);
end;
$$;

create or replace function public.notify_trade_received()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if not new.seller_confirmation then
    insert into public.messages(conversation_id,sender_id,client_id,body,trade_status)
    values(new.conversation_id,new.user_id,gen_random_uuid(),'Buyer confirmed receipt. Feedback is now available.','received');
    update public.conversations set last_message_at=now() where id=new.conversation_id;
    insert into public.notifications(user_id,kind,title,body,href)
    select c.seller_id,'announcement','Your buyer confirmed receipt',left(c.listing_title,120),'/messages/'||c.id::text
    from public.conversations c where c.id=new.conversation_id;
  end if;
  return new;
end;
$$;

commit;
