-- Apply after 202611020004_messages.sql.
begin;
create table public.message_reads (
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 last_read_message_id bigint not null default 0 check(last_read_message_id >= 0),
 primary key(conversation_id,user_id)
);
alter table public.message_reads enable row level security;
revoke all on public.message_reads from public,anon,authenticated;
grant select on public.message_reads to authenticated;
create policy "Read own message cursor" on public.message_reads for select to authenticated
 using(user_id=(select auth.uid()) and exists(select 1 from public.conversations c where c.id=conversation_id and (select auth.uid()) in(c.buyer_id,c.seller_id)));
create function public.mark_messages_read(p_conversation_id uuid,p_message_id bigint) returns void
 language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'Authentication required' using errcode='42501';end if;
 perform 1 from public.conversations where id=p_conversation_id and actor in(buyer_id,seller_id) for update;
 if not found then raise exception 'Conversation unavailable' using errcode='42501';end if;
 if not exists(select 1 from public.messages where conversation_id=p_conversation_id and id=p_message_id)
 then raise exception 'Invalid message cursor' using errcode='22023';end if;
 insert into public.message_reads(conversation_id,user_id,last_read_message_id) values(p_conversation_id,actor,p_message_id)
 on conflict(conversation_id,user_id) do update set last_read_message_id=greatest(public.message_reads.last_read_message_id,excluded.last_read_message_id);
end $$;
create function public.get_unread_counts() returns table(conversation_id uuid,unread_count bigint)
 language sql stable security invoker set search_path='' as $$
 select c.id,count(m.id) from public.conversations c
 left join public.message_reads r on r.conversation_id=c.id and r.user_id=(select auth.uid())
 join public.messages m on m.conversation_id=c.id and m.sender_id<>(select auth.uid()) and m.id>coalesce(r.last_read_message_id,0)
 where (select auth.uid()) in(c.buyer_id,c.seller_id) group by c.id;
$$;
revoke all on function public.mark_messages_read(uuid,bigint),public.get_unread_counts() from public,anon;
grant execute on function public.mark_messages_read(uuid,bigint),public.get_unread_counts() to authenticated;
commit;
