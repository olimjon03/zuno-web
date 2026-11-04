-- Disposable PostgreSQL test database only. All fixture rows roll back.
begin;
insert into auth.users(id,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','{"display_name":"Seller"}'),
 ('22222222-2222-4222-8222-222222222222','{"display_name":"Reporter"}'),
 ('33333333-3333-4333-8333-333333333333','{"display_name":"Moderator"}');
insert into public.notifications(id,user_id,kind,title,body,href) values
 ('a0000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','announcement','Welcome','A private alert','/help'),
 ('a0000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','announcement','Update','','/account'),
 ('b0000000-0000-4000-8000-000000000001','22222222-2222-4222-8222-222222222222','announcement','Other account','','/help');
do $$begin
 begin insert into public.notifications(user_id,kind,title,href) values('11111111-1111-4111-8111-111111111111','announcement','Bad link','//evil.example');raise exception 'External URL accepted';exception when check_violation then null;end;
end $$;
set local role anon;
do $$begin
 begin perform public.get_my_notifications();raise exception 'Anonymous RPC accepted';exception when insufficient_privilege then null;end;
 begin perform id from public.notifications;raise exception 'Anonymous table read accepted';exception when insufficient_privilege then null;end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$declare data jsonb;begin
 data:=public.get_my_notifications();
 if (data->>'unread_count')::int<>2 or jsonb_array_length(data->'items')<>2 then raise exception 'Wrong own snapshot';end if;
 if (select count(*) from public.notifications)<>2 then raise exception 'Cross-account rows visible';end if;
 begin insert into public.notifications(user_id,kind,title) values(auth.uid(),'announcement','Forged');raise exception 'User can forge alert';exception when insufficient_privilege then null;end;
 begin update public.notifications set title='Forged';raise exception 'User can edit alert';exception when insufficient_privilege then null;end;
 begin delete from public.notifications;raise exception 'User can delete alert';exception when insufficient_privilege then null;end;
 begin perform public.mark_notification_read(null,'22222222-2222-4222-8222-222222222222');raise exception 'Stale identity accepted';exception when insufficient_privilege then null;end;
 perform public.mark_notification_read('b0000000-0000-4000-8000-000000000001',auth.uid());
 if (public.get_my_notifications()->>'unread_count')::int<>2 then raise exception 'Forged ID affected own count';end if;
 perform public.mark_notification_read('a0000000-0000-4000-8000-000000000001',auth.uid());
 perform public.mark_notification_read('a0000000-0000-4000-8000-000000000001',auth.uid());
 if (public.get_my_notifications()->>'unread_count')::int<>1 then raise exception 'Single read not idempotent';end if;
 perform public.mark_notification_read(null,auth.uid());
 if (public.get_my_notifications()->>'unread_count')::int<>0 then raise exception 'Mark all failed';end if;
end $$;
reset role;
do $$begin
 if (select read_at from public.notifications where id='b0000000-0000-4000-8000-000000000001') is not null then raise exception 'Cross-account alert marked read';end if;
end $$;
insert into public.moderators(user_id) values('33333333-3333-4333-8333-333333333333');
insert into public.listings(id,seller_id,category_id,neighborhood_id,title,description,price,condition)
values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',1,1,'A fixture item','Notification trigger fixture',100,'good');
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select public.report_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','other','Test report');
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$declare report uuid;begin
 select id into report from public.get_moderation_queue();perform public.review_listing_report(report,'remove');
 if (public.get_my_notifications()->>'unread_count')::int<>0 then raise exception 'Alert sent to wrong moderator';end if;
end $$;
reset role;
do $$begin
 if (select count(*) from public.notifications where user_id='11111111-1111-4111-8111-111111111111' and kind='listing_removed')<>1 then raise exception 'Seller alert missing';end if;
 if (select count(*) from public.notifications where user_id='22222222-2222-4222-8222-222222222222' and kind='report_reviewed')<>1 then raise exception 'Reporter alert missing';end if;
end $$;
update public.listings set moderated_at=moderated_at where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
update public.listing_reports set status=status;
do $$begin
 if (select count(*) from public.notifications where kind in ('listing_removed','report_reviewed'))<>2 then raise exception 'Repeated trigger duplicated alerts';end if;
end $$;
insert into public.notifications(user_id,kind,title,href) select '11111111-1111-4111-8111-111111111111','announcement','Notice '||n,'/help' from generate_series(1,25)n;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$declare data jsonb;begin
 data:=public.get_my_notifications();
 if jsonb_array_length(data->'items')<>20 or (data->>'unread_count')::int<>26 then raise exception 'Bounded page or full unread count failed';end if;
 perform public.mark_notification_read(null,auth.uid());
 if (public.get_my_notifications()->>'unread_count')::int<>0 then raise exception 'Mark all missed alerts beyond first page';end if;
end $$;
reset role;
rollback;
