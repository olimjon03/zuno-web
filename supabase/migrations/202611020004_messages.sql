begin;
create table public.conversations (
 id uuid primary key default gen_random_uuid(),
 listing_id uuid references public.listings(id) on delete set null,
 listing_title text not null,
 buyer_id uuid not null references auth.users(id) on delete cascade,
 seller_id uuid not null references auth.users(id) on delete cascade,
 buyer_name text not null,
 seller_name text not null,
 created_at timestamptz not null default now(),
 last_message_at timestamptz not null default now(),
 check (buyer_id <> seller_id),
 unique (listing_id, buyer_id)
);
create index conversations_buyer_idx on public.conversations(buyer_id,last_message_at desc);
create index conversations_seller_idx on public.conversations(seller_id,last_message_at desc);
create table public.messages (
 id bigint generated always as identity primary key,
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 client_id uuid not null,
 body text not null check (char_length(btrim(body)) between 1 and 2000 and body ~ '[^[:space:]]'),
 created_at timestamptz not null default now(),
 unique(conversation_id,sender_id,client_id)
);
create index messages_conversation_idx on public.messages(conversation_id,id desc);
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
revoke all on public.conversations,public.messages from public,anon,authenticated;
grant select on public.conversations,public.messages to authenticated;
create policy "Read participating conversations" on public.conversations for select to authenticated
 using ((select auth.uid()) in (buyer_id,seller_id));
create policy "Read participating messages" on public.messages for select to authenticated
 using (exists(select 1 from public.conversations c where c.id=conversation_id and (select auth.uid()) in (c.buyer_id,c.seller_id)));
create function public.start_conversation(p_listing_id uuid) returns uuid
 language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); item public.listings%rowtype; result uuid; chosen_name text;
begin
 if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select id into result from public.conversations where listing_id=p_listing_id and buyer_id=actor;
 if found then return result; end if;
 select * into item from public.listings where id=p_listing_id and status in ('active','reserved');
 if not found then raise exception 'Listing unavailable' using errcode='22023'; end if;
 if item.seller_id=actor then raise exception 'You cannot message yourself' using errcode='22023'; end if;
 select left(coalesce(nullif(btrim(display_name),''),'Neighbor'),40) into chosen_name from public.profiles where id=actor;
 insert into public.conversations(listing_id,listing_title,buyer_id,seller_id,buyer_name,seller_name)
 values(item.id,item.title,actor,item.seller_id,coalesce(chosen_name,'Neighbor'),item.seller_name)
 on conflict (listing_id,buyer_id) do update set listing_id=excluded.listing_id returning id into result;
 return result;
end $$;
create function public.send_message(p_conversation_id uuid,p_client_id uuid,p_body text) returns bigint
 language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); result bigint;
begin
 if actor is null then raise exception 'Conversation unavailable' using errcode='42501'; end if;
 -- Serialize sends before assigning message IDs so cursor polling cannot skip a later commit.
 perform 1 from public.conversations where id=p_conversation_id and actor in (buyer_id,seller_id) for update;
 if not found then raise exception 'Conversation unavailable' using errcode='42501'; end if;
 if p_client_id is null or p_body is null or char_length(btrim(p_body)) not between 1 and 2000 or p_body !~ '[^[:space:]]'
 then raise exception 'Invalid message' using errcode='22023'; end if;
 insert into public.messages(conversation_id,sender_id,client_id,body)
 values(p_conversation_id,actor,p_client_id,btrim(p_body)) on conflict(conversation_id,sender_id,client_id) do nothing returning id into result;
 if result is null then
 select id into result from public.messages where conversation_id=p_conversation_id and sender_id=actor and client_id=p_client_id;
 else
 update public.conversations set last_message_at=now() where id=p_conversation_id;
 end if;
 return result;
end $$;
revoke all on function public.start_conversation(uuid),public.send_message(uuid,uuid,text) from public,anon;
grant execute on function public.start_conversation(uuid),public.send_message(uuid,uuid,text) to authenticated;
commit;
