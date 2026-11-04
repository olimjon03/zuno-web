begin;

create table public.zuno_assistant_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  used_on date not null,
  request_count integer not null check (request_count between 1 and 20)
);
alter table public.zuno_assistant_usage enable row level security;
revoke all on public.zuno_assistant_usage from public, anon, authenticated;

create function public.take_zuno_assistant_quota()
returns boolean
language plpgsql security definer set search_path=''
as $$
declare
  actor uuid := auth.uid();
  utc_day date := (now() at time zone 'UTC')::date;
begin
  if actor is null then return false; end if;
  insert into public.zuno_assistant_usage(user_id, used_on, request_count)
  values(actor, utc_day, 1)
  on conflict (user_id) do update
    set used_on = excluded.used_on,
        request_count = case when zuno_assistant_usage.used_on = excluded.used_on
          then zuno_assistant_usage.request_count + 1 else 1 end
    where zuno_assistant_usage.used_on <> excluded.used_on
       or zuno_assistant_usage.request_count < 20;
  return found;
end;
$$;

revoke all on function public.take_zuno_assistant_quota() from public, anon, authenticated;
grant execute on function public.take_zuno_assistant_quota() to authenticated;

commit;
