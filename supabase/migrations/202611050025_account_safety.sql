begin;
alter table public.profiles add column deleting_at timestamptz;
create table public.account_request_limits (
 user_id uuid not null references public.profiles(id) on delete cascade,
 action text not null,
 window_start timestamptz not null,
 requests integer not null,
 primary key(user_id,action)
);
alter table public.account_request_limits enable row level security;
revoke all on public.account_request_limits from public,anon,authenticated;

-- Shared profile lock orders deletion and writes, including direct Storage API calls.
create function public.guard_account_write() returns trigger
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
revoke all on function public.guard_account_write() from public,anon,authenticated;
create trigger guard_storage_account before insert on storage.objects for each row execute function public.guard_account_write();
create trigger guard_message_account before insert on public.messages for each row execute function public.guard_account_write();
create trigger guard_listing_account before insert on public.listings for each row execute function public.guard_account_write();

create function public.begin_account_deletion(p_user_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 update public.profiles set deleting_at=coalesce(deleting_at,clock_timestamp()) where id=p_user_id;
 if not found then raise exception 'Account unavailable' using errcode='P0002'; end if;
end $$;
revoke all on function public.begin_account_deletion(uuid) from public,anon,authenticated;
grant execute on function public.begin_account_deletion(uuid) to service_role;
commit;
