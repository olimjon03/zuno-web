-- Private in-app website alerts. Chat alerts reuse the existing unread/inbox RPCs.
begin;
create table public.notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('announcement','listing_removed','report_reviewed')),
 title text not null check(char_length(btrim(title)) between 1 and 120),
 body text not null default '' check(char_length(body)<=1000),
 href text not null default '/account' check(char_length(href) between 2 and 200 and href ~ '^/[^/\\[:space:]]' and href !~ '[\\[:cntrl:]]'),
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index notifications_user_created_idx on public.notifications(user_id,created_at desc,id desc);
create index notifications_user_unread_idx on public.notifications(user_id) where read_at is null;
alter table public.notifications enable row level security;
revoke all on public.notifications from public,anon,authenticated;
grant select on public.notifications to authenticated;
grant select,insert,update,delete on public.notifications to service_role;
create policy "Read own notifications" on public.notifications for select to authenticated using(user_id=(select auth.uid()));
create function public.get_my_notifications() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object(
 'items',coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at desc,n.id desc) from (select id,kind,title,body,href,read_at,created_at from public.notifications where user_id=auth.uid() order by created_at desc,id desc limit 20)n),'[]'::jsonb),
 'unread_count',(select count(*) from public.notifications where user_id=auth.uid() and read_at is null));
$$;
create function public.mark_notification_read(p_id uuid default null,p_expected_user_id uuid default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or p_expected_user_id is distinct from auth.uid() then raise exception 'Authentication required' using errcode='42501';end if;
 update public.notifications set read_at=now() where user_id=auth.uid() and read_at is null and (p_id is null or id=p_id);
end $$;
revoke all on function public.get_my_notifications(),public.mark_notification_read(uuid,uuid) from public,anon;
grant execute on function public.get_my_notifications(),public.mark_notification_read(uuid,uuid) to authenticated;
create function public.notify_listing_moderated() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.moderated_at is not null and old.moderated_at is null then
  insert into public.notifications(user_id,kind,title,body,href) values(new.seller_id,'listing_removed','Your listing was removed',left(new.title,180),'/account/listings');
 end if;
 return new;
end $$;
create trigger listing_moderation_notification after update of moderated_at on public.listings for each row execute function public.notify_listing_moderated();
create function public.notify_report_reviewed() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='open' and new.status in ('dismissed','removed') then
  insert into public.notifications(user_id,kind,title,body,href) values(new.reporter_id,'report_reviewed','Your report was reviewed',left(new.listing_title,180),'/account/safety');
 end if;
 return new;
end $$;
create trigger report_review_notification after update of status on public.listing_reports for each row execute function public.notify_report_reviewed();
revoke all on function public.notify_listing_moderated(),public.notify_report_reviewed() from public,anon,authenticated;
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
  alter publication supabase_realtime add table public.notifications;
 end if;
end $$;
commit;
