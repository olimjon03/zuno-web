begin;
create function public.take_upload_request_quota() returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); deleting timestamptz; accepted integer;
begin
 if actor is null then return false; end if;
 select deleting_at into deleting from public.profiles where id=actor for update;
 if not found or deleting is not null then return false; end if;
 insert into public.account_request_limits(user_id,action,window_start,requests)
 values(actor,'upload_request',date_trunc('minute',clock_timestamp()),1)
 on conflict(user_id,action) do update set
 requests=case when account_request_limits.window_start=excluded.window_start then account_request_limits.requests+1 else 1 end,
 window_start=excluded.window_start
 where account_request_limits.window_start<>excluded.window_start or account_request_limits.requests<10
 returning requests into accepted;
 return accepted is not null;
end $$;
revoke all on function public.take_upload_request_quota() from public,anon;
grant execute on function public.take_upload_request_quota() to authenticated;
commit;
