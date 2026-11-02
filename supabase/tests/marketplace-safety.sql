begin;
insert into auth.users(id,raw_user_meta_data) values
('11111111-1111-4111-8111-111111111111','{"display_name":"Seller"}'),
('22222222-2222-4222-8222-222222222222','{"display_name":"Buyer"}'),
('33333333-3333-4333-8333-333333333333','{"display_name":"Moderator"}'),
('44444444-4444-4444-8444-444444444444','{"display_name":"Stranger","role":"moderator"}');
insert into public.moderators(user_id) values('33333333-3333-4333-8333-333333333333');
insert into public.listings(id,seller_id,category_id,neighborhood_id,title,description,price,condition) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',1,1,'Test listing','A listing for isolated safety tests',100,'good');
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$declare report uuid;c uuid;begin
 report:=public.report_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','scam','Suspicious details');
 if public.report_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','other','Duplicate')<>report then raise exception 'Duplicate report not idempotent';end if;
 if (select count(*) from public.listing_reports)<>1 then raise exception 'Own report missing';end if;
 c:=public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
 perform public.send_message(c,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Hello seller');
 perform public.set_user_block('11111111-1111-4111-8111-111111111111',true);
 perform public.set_user_block('11111111-1111-4111-8111-111111111111',true);
 if (select count(*) from public.user_blocks)<>1 then raise exception 'Block duplicated';end if;
 if (select count(*) from public.get_blocked_users())<>1 then raise exception 'Blocked user missing';end if;
 if (select can_message from public.get_safety_state('11111111-1111-4111-8111-111111111111')) then raise exception 'Blocked user can message';end if;
 begin perform public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');raise exception 'Blocked start allowed';exception when no_data_found then null;end;
 begin perform public.send_message(c,'cccccccc-cccc-4ccc-8ccc-cccccccccccc','Blocked message');raise exception 'Blocked send allowed';exception when no_data_found then null;end;
 if (select count(*) from public.messages where conversation_id=c)<>1 then raise exception 'Old messages hidden';end if;
 begin perform public.set_user_block('22222222-2222-4222-8222-222222222222',true);raise exception 'Self block accepted';exception when insufficient_privilege then null;end;
 begin perform public.report_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','__proto__','bad');raise exception 'Invalid reason accepted';exception when invalid_parameter_value then null;end;
 begin perform public.report_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','other',repeat('x',1001));raise exception 'Oversized details accepted';exception when invalid_parameter_value then null;end;
 begin insert into public.moderators(user_id) values(auth.uid());raise exception 'Self elevation accepted';exception when insufficient_privilege then null;end;
 begin perform public.get_moderation_queue();raise exception 'Buyer queue access';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$declare c uuid;begin
 if (select count(*) from public.listing_reports)<>0 then raise exception 'Seller sees reporter';end if;
 if (select count(*) from public.user_blocks)<>0 then raise exception 'Seller sees someone else blocks';end if;
 select id into c from public.conversations where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 begin perform public.send_message(c,'dddddddd-dddd-4ddd-8ddd-dddddddddddd','Seller reply');raise exception 'Reverse blocked send allowed';exception when no_data_found then null;end;
 begin perform public.report_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','other','Own item');raise exception 'Own report allowed';exception when invalid_parameter_value then null;end;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$declare c uuid;begin
 perform public.set_user_block('11111111-1111-4111-8111-111111111111',false);
 c:=public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
 perform public.send_message(c,'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','Unblocked message');
end $$;
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
do $$begin
 if public.is_moderator() then raise exception 'Metadata grants moderation';end if;
 if (select count(*) from public.listing_reports)<>0 then raise exception 'Stranger sees report';end if;
 begin perform public.get_moderation_queue();raise exception 'Stranger sees queue';exception when insufficient_privilege then null;end;
 begin perform public.review_listing_report('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','remove');raise exception 'Stranger review allowed';exception when insufficient_privilege then null;end;
 begin perform public.users_blocked('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');raise exception 'Private block helper callable';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$declare r uuid;begin
 if not public.is_moderator() then raise exception 'Moderator missing';end if;
 select id into r from public.get_moderation_queue();
 if r is null then raise exception 'Queue empty';end if;
 perform public.review_listing_report(r,'remove');
 if exists(select 1 from public.get_moderation_queue()) then raise exception 'Reviewed report remains open';end if;
 begin perform public.review_listing_report(r,'dismiss');raise exception 'Double review accepted';exception when invalid_parameter_value then null;end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$begin
 update public.listings set status='active' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if (select status from public.listings where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>'removed' then raise exception 'Owner restored moderated item';end if;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$begin
 if (select status from public.listing_reports limit 1)<>'removed' then raise exception 'Reporter status missing';end if;
end $$;
reset role;
-- Dismissing a separate report leaves the item visible.
insert into public.listings(id,seller_id,category_id,neighborhood_id,title,description,price,condition) values
('cccccccc-cccc-4ccc-8ccc-cccccccccccc','11111111-1111-4111-8111-111111111111',1,1,'Dismiss test','A listing for dismissal tests',100,'good');
set local role authenticated;
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
select public.report_listing('cccccccc-cccc-4ccc-8ccc-cccccccccccc','other','Review me');
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$declare r uuid;begin
 select id into r from public.get_moderation_queue() where listing_id='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 perform public.review_listing_report(r,'dismiss');
 if (select status from public.listings where id='cccccccc-cccc-4ccc-8ccc-cccccccccccc')<>'active' then raise exception 'Dismiss removed the item';end if;
end $$;
reset role;
-- Hourly limit, using separate items without bypassing the authenticated RPC.
insert into public.listings(seller_id,category_id,neighborhood_id,title,description,price,condition)
select '11111111-1111-4111-8111-111111111111',1,1,'Rate test '||i,'A listing for report rate tests',100,'good' from generate_series(1,10) i;
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$declare item uuid;number integer:=0;begin
 for item in select id from public.listings where title like 'Rate test %' order by title loop
  number:=number+1;
  if number<10 then perform public.report_listing(item,'other','Rate check');
  else begin perform public.report_listing(item,'other','Too many');raise exception 'Report limit bypassed';exception when program_limit_exceeded then null;end;end if;
 end loop;
end $$;
reset role;
set local role anon;
do $$begin
 begin perform public.set_user_block('11111111-1111-4111-8111-111111111111',true);raise exception 'Anonymous block';exception when insufficient_privilege then null;end;
 begin perform public.report_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','scam','bad');raise exception 'Anonymous report';exception when insufficient_privilege then null;end;
 begin perform public.get_moderation_queue();raise exception 'Anonymous queue';exception when insufficient_privilege then null;end;
end $$;
rollback;
