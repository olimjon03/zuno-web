begin;
alter table public.conversations alter column buyer_id drop not null, alter column seller_id drop not null;
alter table public.conversations drop constraint conversations_buyer_id_fkey, drop constraint conversations_seller_id_fkey;
alter table public.conversations add constraint conversations_buyer_id_fkey foreign key(buyer_id) references auth.users(id) on delete set null,
 add constraint conversations_seller_id_fkey foreign key(seller_id) references auth.users(id) on delete set null;
alter table public.messages alter column sender_id drop not null;
alter table public.messages drop constraint messages_sender_id_fkey;
alter table public.messages add constraint messages_sender_id_fkey foreign key(sender_id) references auth.users(id) on delete set null;

create function public.get_account_chat_archive_batch(p_user_id uuid)
returns table(attachment_id uuid,source_path text,destination_path text)
language sql stable security definer set search_path='' as $$
 select a.id,a.storage_path,recipient.id::text||'/'||c.id::text||'/retained/'||a.id::text
 from public.message_attachments a join public.messages m on m.id=a.message_id
 join storage.objects source on source.bucket_id='zuno-message-files' and source.name=a.storage_path
 join public.conversations c on c.id=m.conversation_id
 join public.profiles deleting on deleting.id=p_user_id and deleting.deleting_at is not null
 join public.profiles recipient on recipient.id=case when c.buyer_id=p_user_id then c.seller_id else c.buyer_id end
  and recipient.deleting_at is null
 where m.sender_id=p_user_id and p_user_id in(c.buyer_id,c.seller_id)
 and split_part(a.storage_path,'/',1)=p_user_id::text
 order by a.id limit 10;
$$;
create function public.commit_account_chat_archive(p_user_id uuid,p_attachment_id uuid,p_source_path text,p_destination_path text)
returns void language plpgsql security definer set search_path='' as $$
declare destination text; recipient_id uuid;
begin
 select recipient.id into recipient_id from public.message_attachments a
 join public.messages m on m.id=a.message_id join public.conversations c on c.id=m.conversation_id
 join public.profiles recipient on recipient.id=case when c.buyer_id=p_user_id then c.seller_id else c.buyer_id end
 where a.id=p_attachment_id and m.sender_id=p_user_id and p_user_id in(c.buyer_id,c.seller_id);
 perform 1 from public.profiles where id=recipient_id and deleting_at is null for update;
 if not found then raise exception 'Recipient unavailable; retry cleanup' using errcode='P0002';end if;
 select recipient_id::text||'/'||c.id::text||'/retained/'||a.id::text into destination
 from public.message_attachments a join public.messages m on m.id=a.message_id
 join public.conversations c on c.id=m.conversation_id
 join public.profiles p on p.id=p_user_id and p.deleting_at is not null
 where a.id=p_attachment_id and m.sender_id=p_user_id and p_user_id in(c.buyer_id,c.seller_id)
 and a.storage_path=p_source_path and split_part(p_source_path,'/',1)=p_user_id::text for update of a;
 if destination is null or destination is distinct from p_destination_path then raise exception 'Invalid archive' using errcode='22023';end if;
 if not exists(select 1 from storage.objects o join public.message_attachments a on a.id=p_attachment_id
  where o.bucket_id='zuno-message-files' and o.name=destination and o.owner_id is null
  and o.metadata->>'mimetype'=a.mime and (o.metadata->>'size')::bigint=a.size) then
  raise exception 'Archive copy missing or invalid' using errcode='22023';end if;
 update public.message_attachments set storage_path=destination where id=p_attachment_id;
end $$;
revoke all on function public.get_account_chat_archive_batch(uuid),public.commit_account_chat_archive(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.get_account_chat_archive_batch(uuid),public.commit_account_chat_archive(uuid,uuid,text,text) to service_role;

create function public.anonymize_deleted_account_chats() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 -- Fail closed if account deletion did not preserve committed outgoing attachments first.
 if exists(select 1 from public.message_attachments a join public.messages m on m.id=a.message_id
  join storage.objects source on source.bucket_id='zuno-message-files' and source.name=a.storage_path
  join public.conversations c on c.id=m.conversation_id
  join public.profiles recipient on recipient.id=case when c.buyer_id=old.id then c.seller_id else c.buyer_id end
   and recipient.deleting_at is null
  where m.sender_id=old.id and old.id in(c.buyer_id,c.seller_id) and split_part(a.storage_path,'/',1)=old.id::text) then
  raise exception 'Archive shared chat files before account deletion' using errcode='55000';end if;
 update public.conversations set buyer_id=null,buyer_name='Deleted account' where buyer_id=old.id;
 update public.conversations set seller_id=null,seller_name='Deleted account' where seller_id=old.id;
 delete from public.conversations where buyer_id is null and seller_id is null;
 return old;
end $$;
revoke all on function public.anonymize_deleted_account_chats() from public,anon,authenticated;
create trigger anonymize_zuno_chats before delete on auth.users for each row execute function public.anonymize_deleted_account_chats();

create function public.guard_live_conversation_message() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.conversations c join public.profiles b on b.id=c.buyer_id and b.deleting_at is null
 join public.profiles s on s.id=c.seller_id and s.deleting_at is null
 where c.id=new.conversation_id for share of b,s;
 if not found then raise exception 'Conversation is read-only' using errcode='P0002';end if;
 return new;
end $$;
revoke all on function public.guard_live_conversation_message() from public,anon,authenticated;
create trigger guard_live_conversation before insert on public.messages for each row execute function public.guard_live_conversation_message();
create or replace function public.can_attach_to_conversation(conversation_text text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.conversations c
 join public.profiles b on b.id=c.buyer_id and b.deleting_at is null
 join public.profiles s on s.id=c.seller_id and s.deleting_at is null
 where c.id::text=conversation_text and auth.uid() in(c.buyer_id,c.seller_id) and not public.users_blocked(c.buyer_id,c.seller_id));
$$;
create or replace function public.get_unread_counts() returns table(conversation_id uuid,unread_count bigint)
language sql stable security invoker set search_path='' as $$
 select c.id,count(m.id) from public.conversations c
 left join public.message_reads r on r.conversation_id=c.id and r.user_id=auth.uid()
 join public.messages m on m.conversation_id=c.id and m.sender_id is distinct from auth.uid() and m.id>coalesce(r.last_read_message_id,0)
 where auth.uid() in(c.buyer_id,c.seller_id) group by c.id;
$$;
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
   case when (case when c.buyer_id=actor then c.seller_id else c.buyer_id end) is null then 'Deleted account' else coalesce(p.display_name,case when c.buyer_id=actor then c.seller_name else c.buyer_name end) end,
   p.avatar_path,
   case when p.id is not null and l.status in ('active','reserved','sold') then n.name else null end,
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
create or replace function public.guard_account_write() returns trigger
language plpgsql security definer set search_path='' as $$
declare actor uuid; deleting timestamptz; action_name text; cap integer; accepted integer;
begin
 if TG_TABLE_SCHEMA='storage' then
  if new.bucket_id not in ('zuno-avatars','zuno-listing-photos','zuno-message-files') then return new; end if;
  actor:=split_part(new.name,'/',1)::uuid;
  action_name:='upload'; cap:=30;
 elsif TG_TABLE_NAME='messages' then
  actor:=new.sender_id;
  action_name:='message'; cap:=30;
  -- A retried client ID is handled by the existing unique constraint/RPC.
  if exists(select 1 from public.messages where conversation_id=new.conversation_id and sender_id=actor and client_id=new.client_id) then return new; end if;
 else
  actor:=new.seller_id;
  action_name:='listing'; cap:=10;
 end if;
 select deleting_at into deleting from public.profiles where id=actor for update;
 if not found or deleting is not null then
  raise exception 'Account deletion in progress' using errcode='42501';
 end if;
 if TG_TABLE_SCHEMA='storage' then
  if new.bucket_id='zuno-message-files' and split_part(new.name,'/',3)='retained'
   and (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'role')='service_role' then return new;end if;
 end if;
 insert into public.account_request_limits(user_id,action,window_start,requests)
 values(actor,action_name,date_trunc('minute',clock_timestamp()),1)
 on conflict(user_id,action) do update set
 requests=case when account_request_limits.window_start=excluded.window_start then account_request_limits.requests+1 else 1 end,
 window_start=excluded.window_start
 where account_request_limits.window_start<>excluded.window_start or account_request_limits.requests<cap
 returning requests into accepted;
 if accepted is null then raise exception 'Request limit reached. Try again shortly.' using errcode='54000'; end if;
 return new;
end $$;
-- Only service-role archival may manage reserved retained paths, even while staged.
drop policy "Clean own unattached conversation file" on storage.objects;
create policy "Clean own unattached conversation file" on storage.objects for delete to authenticated using(
 bucket_id='zuno-message-files' and split_part(name,'/',1)=auth.uid()::text
 and split_part(name,'/',3)<>'retained'
 and not exists(select 1 from public.message_attachments a where a.storage_path=storage.objects.name)
);
create function public.prepare_account_deletion(p_user_id uuid) returns text
language plpgsql security definer set search_path='' as $$
declare staff_account boolean:=false;
begin
 -- Preserve the existing admin schema's RESTRICT rule; fail before destroying files.
 if to_regclass('zuno_admin.staff_memberships') is not null then
  execute 'select exists(select 1 from zuno_admin.staff_memberships where user_id=$1)' into staff_account using p_user_id;
 end if;
 if staff_account then return 'admin_account';end if;
 perform public.begin_account_deletion(p_user_id);
 return 'ready';
end $$;
revoke all on function public.prepare_account_deletion(uuid) from public,anon,authenticated;
grant execute on function public.prepare_account_deletion(uuid) to service_role;
-- Also guard older deployed deletion actions during the migration/code rollout gap.
create or replace function public.get_account_storage_batch(p_user_id uuid)
returns table(bucket_id text,name text)
language plpgsql stable security definer set search_path='' as $$
declare staff_account boolean:=false;
begin
 if not exists(select 1 from public.profiles p where p.id=p_user_id and p.deleting_at is not null) then
  raise exception 'Deletion must be prepared' using errcode='55000';end if;
 if to_regclass('zuno_admin.staff_memberships') is not null then
  execute 'select exists(select 1 from zuno_admin.staff_memberships where user_id=$1)' into staff_account using p_user_id;
 end if;
 if staff_account then raise exception 'Remove admin membership before deletion' using errcode='55000';end if;
 if exists(select 1 from public.get_account_chat_archive_batch(p_user_id)) then
  raise exception 'Archive shared chat files before cleanup' using errcode='55000';end if;
 return query select o.bucket_id,o.name from storage.objects o
 where o.owner_id=p_user_id::text or (o.bucket_id in('zuno-avatars','zuno-listing-photos','zuno-message-files') and split_part(o.name,'/',1)=p_user_id::text)
 order by o.bucket_id,o.name limit 100;
end $$;
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='conversations') then
  alter publication supabase_realtime add table public.conversations;
 end if;
end $$;
commit;
