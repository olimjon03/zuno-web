-- Run after 009. Moderator membership is assigned only through trusted SQL.
begin;
create table public.moderators(user_id uuid primary key references auth.users(id) on delete cascade);
create table public.user_blocks(
 blocker_id uuid not null references auth.users(id) on delete cascade,
 blocked_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),primary key(blocker_id,blocked_id),check(blocker_id<>blocked_id)
);
create index user_blocks_target_idx on public.user_blocks(blocked_id,blocker_id);
create table public.listing_reports(
 id uuid primary key default gen_random_uuid(),reporter_id uuid not null references auth.users(id) on delete cascade,
 listing_id uuid references public.listings(id) on delete set null,listing_title text not null,
 reason text not null check(reason in ('scam','prohibited','misleading','duplicate','other')),
 details text not null default '' check(char_length(details)<=1000),
 status text not null default 'open' check(status in ('open','dismissed','removed')),
 created_at timestamptz not null default now(),reviewed_at timestamptz,reviewed_by uuid references auth.users(id) on delete set null,
 unique(reporter_id,listing_id)
);
create index listing_reports_queue_idx on public.listing_reports(status,created_at desc);
create index listing_reports_rate_idx on public.listing_reports(reporter_id,created_at desc);
alter table public.moderators enable row level security;
alter table public.user_blocks enable row level security;
alter table public.listing_reports enable row level security;
revoke all on public.moderators,public.user_blocks,public.listing_reports from public,anon,authenticated;
grant select(blocker_id,blocked_id,created_at) on public.user_blocks to authenticated;
grant select(id,reporter_id,listing_id,listing_title,reason,details,status,created_at,reviewed_at) on public.listing_reports to authenticated;
create policy "Read own blocks" on public.user_blocks for select to authenticated using(blocker_id=(select auth.uid()));
create policy "Read own reports" on public.listing_reports for select to authenticated using(reporter_id=(select auth.uid()));
alter table public.listings add column moderated_at timestamptz;
drop policy "Update own listing" on public.listings;
create policy "Update own unmoderated listing" on public.listings for update to authenticated
 using(seller_id=(select auth.uid()) and moderated_at is null) with check(seller_id=(select auth.uid()) and moderated_at is null);

create function public.is_moderator() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.moderators m where m.user_id=auth.uid());
$$;
create function public.users_blocked(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.user_blocks x where (x.blocker_id=a and x.blocked_id=b) or (x.blocker_id=b and x.blocked_id=a));
$$;
revoke all on function public.users_blocked(uuid,uuid) from public,anon,authenticated;
revoke all on function public.is_moderator() from public,anon;
grant execute on function public.is_moderator() to authenticated;

create function public.get_safety_state(p_user_id uuid) returns table(is_self boolean,blocked boolean,can_message boolean)
 language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=auth.uid();begin
 if actor is null then raise exception 'Authentication required' using errcode='42501';end if;
 return query select actor=p_user_id,exists(select 1 from public.user_blocks b where b.blocker_id=actor and b.blocked_id=p_user_id),actor<>p_user_id and not public.users_blocked(actor,p_user_id);
end $$;
create function public.set_user_block(p_user_id uuid,p_block boolean) returns void
 language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();begin
 if actor is null or actor=p_user_id or p_user_id is null or p_block is null or not exists(select 1 from public.profiles p where p.id=p_user_id)
 then raise exception 'Invalid block request' using errcode='42501';end if;
 if p_block then insert into public.user_blocks(blocker_id,blocked_id) values(actor,p_user_id) on conflict do nothing;
 else delete from public.user_blocks where blocker_id=actor and blocked_id=p_user_id;end if;
end $$;
create function public.get_blocked_users() returns table(id uuid,display_name text,created_at timestamptz)
 language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501';end if;
 return query select b.blocked_id,p.display_name,b.created_at from public.user_blocks b join public.profiles p on p.id=b.blocked_id where b.blocker_id=auth.uid() order by b.created_at desc limit 500;
end $$;
create function public.report_listing(p_listing_id uuid,p_reason text,p_details text) returns uuid
 language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();item public.listings%rowtype;result uuid;begin
 if actor is null then raise exception 'Authentication required' using errcode='42501';end if;
 if p_reason is null or p_reason not in ('scam','prohibited','misleading','duplicate','other') or p_details is null or char_length(p_details)>1000
 then raise exception 'Invalid report' using errcode='22023';end if;
 select * into item from public.listings where id=p_listing_id and status in ('active','reserved','sold');
 if not found or item.seller_id=actor then raise exception 'Choose another visible item' using errcode='22023';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text,10));
 select id into result from public.listing_reports where reporter_id=actor and listing_id=p_listing_id;
 if found then return result;end if;
 if (select count(*) from public.listing_reports where reporter_id=actor and created_at>now()-interval '1 hour')>=10
 then raise exception 'Report limit reached' using errcode='54000';end if;
 insert into public.listing_reports(reporter_id,listing_id,listing_title,reason,details) values(actor,item.id,item.title,p_reason,btrim(p_details)) returning id into result;
 return result;
end $$;
create function public.get_moderation_queue() returns table(id uuid,listing_id uuid,listing_title text,reason text,details text,status text,created_at timestamptz,reporter_name text)
 language plpgsql stable security definer set search_path='' as $$
begin
 if not public.is_moderator() then raise exception 'Moderator access required' using errcode='42501';end if;
 return query select r.id,r.listing_id,r.listing_title,r.reason,r.details,r.status,r.created_at,p.display_name from public.listing_reports r join public.profiles p on p.id=r.reporter_id
 where r.status='open' order by r.created_at asc limit 100;
end $$;
create function public.review_listing_report(p_report_id uuid,p_action text) returns void
 language plpgsql security definer set search_path='' as $$
declare report public.listing_reports%rowtype;begin
 if not public.is_moderator() then raise exception 'Moderator access required' using errcode='42501';end if;
 if p_action is null or p_action not in ('dismiss','remove') then raise exception 'Invalid review' using errcode='22023';end if;
 select * into report from public.listing_reports where id=p_report_id for update;
 if not found or report.status<>'open' then raise exception 'Report already reviewed or unavailable' using errcode='22023';end if;
 if p_action='remove' then
  update public.listings set status='removed',moderated_at=now() where id=report.listing_id;
 end if;
 update public.listing_reports set status=case when p_action='remove' then 'removed' else 'dismissed' end,reviewed_at=now(),reviewed_by=auth.uid() where id=p_report_id;
end $$;
revoke all on function public.get_safety_state(uuid),public.set_user_block(uuid,boolean),public.get_blocked_users(),public.report_listing(uuid,text,text),public.get_moderation_queue(),public.review_listing_report(uuid,text) from public,anon;
grant execute on function public.get_safety_state(uuid),public.set_user_block(uuid,boolean),public.get_blocked_users(),public.report_listing(uuid,text,text),public.get_moderation_queue(),public.review_listing_report(uuid,text) to authenticated;

create or replace function public.start_conversation(p_listing_id uuid) returns uuid
 language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); item public.listings%rowtype; result uuid; chosen_name text;
begin
 if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if exists(select 1 from public.conversations c where c.listing_id=p_listing_id and c.buyer_id=actor and public.users_blocked(c.buyer_id,c.seller_id))
 or exists(select 1 from public.listings l where l.id=p_listing_id and public.users_blocked(actor,l.seller_id))
 then raise exception 'Messaging unavailable for this user' using errcode='P0002';end if;
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
create or replace function public.send_message(p_conversation_id uuid,p_client_id uuid,p_body text) returns bigint
 language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); result bigint;
begin
 if actor is null then raise exception 'Conversation unavailable' using errcode='42501'; end if;
 -- Serialize sends before assigning message IDs so cursor polling cannot skip a later commit.
 perform 1 from public.conversations where id=p_conversation_id and actor in (buyer_id,seller_id) for update;
 if not found then raise exception 'Conversation unavailable' using errcode='42501'; end if;
 if exists(select 1 from public.conversations c where c.id=p_conversation_id and public.users_blocked(c.buyer_id,c.seller_id)) then raise exception 'Messaging unavailable for this user' using errcode='P0002';end if;
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

commit;
