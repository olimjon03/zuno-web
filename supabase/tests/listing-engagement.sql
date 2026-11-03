-- Disposable database after migration 013. Fixtures roll back.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','metric-seller@example.invalid','{}'),
 ('22222222-2222-4222-8222-222222222222','metric-buyer@example.invalid','{}'),
 ('33333333-3333-4333-8333-333333333333','metric-buyer2@example.invalid','{}');
insert into public.listings(id,seller_id,title,description,price,condition,category_id,neighborhood_id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Engagement fixture','Disposable count fixture item.',100,'good',1,1);
set local role anon;
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
do $$ begin
 if (select view_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>1 then raise exception 'Reload inflated views';end if;
 begin perform * from public.listing_view_events;raise exception 'Anonymous viewer keys exposed';exception when insufficient_privilege then null;end;
 begin update public.listing_view_totals set view_count=999;raise exception 'Counter forgery allowed';exception when insufficient_privilege then null;end;
 begin perform * from public.get_listing_engagement(array_fill('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,array[1001]));raise exception 'Oversized batch accepted';exception when invalid_parameter_value then null;end;
end $$;
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','cccccccc-cccc-4ccc-8ccc-cccccccccccc');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','dddddddd-dddd-4ddd-8ddd-dddddddddddd');
do $$ begin if (select view_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>2 then raise exception 'Seller inflated views';end if;end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','dddddddd-dddd-4ddd-8ddd-dddddddddddd');
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
select set_config('qa.conversation',public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')::text,true);
do $$ begin
 if (select view_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>3 then raise exception 'Same authenticated viewer counted twice';end if;
 if (select messager_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>0 then raise exception 'Empty conversation counted';end if;
 begin perform * from public.listing_view_events;raise exception 'Authenticated viewer keys exposed';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.send_message(current_setting('qa.conversation')::uuid,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Seller hello');
do $$ begin if (select messager_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>0 then raise exception 'Seller-only messages counted';end if;end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select public.send_message(current_setting('qa.conversation')::uuid,'cccccccc-cccc-4ccc-8ccc-cccccccccccc','Buyer hello');
select public.send_message(current_setting('qa.conversation')::uuid,'dddddddd-dddd-4ddd-8ddd-dddddddddddd','Second buyer message');
do $$ begin if (select messager_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>1 then raise exception 'Count is messages rather than people';end if;end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
select set_config('qa.conversation2',public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')::text,true);
select public.send_message(current_setting('qa.conversation2')::uuid,'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','Another buyer');
do $$ begin if (select messager_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>2 then raise exception 'Second buyer missing';end if;end $$;
reset role;
insert into public.listing_view_events(listing_id,viewed_on,viewer_key) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(now() at time zone 'UTC')::date-4,'expired');
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
reset role;
do $$ begin
 if exists(select 1 from public.listing_view_events where viewer_key='expired') then raise exception 'Expired keys retained';end if;
 if (select view_count from public.listing_view_totals where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>3 then raise exception 'Cleanup changed total';end if;
end $$;
update public.listings set status='removed' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local role anon;
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','ffffffff-ffff-4fff-8fff-ffffffffffff');
do $$ begin if exists(select 1 from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[])) then raise exception 'Removed counts exposed';end if;end $$;
reset role;
do $$ begin if (select view_count from public.listing_view_totals where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>3 then raise exception 'Removed listing view counted';end if;end $$;
rollback;
