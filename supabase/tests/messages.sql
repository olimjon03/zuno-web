-- Disposable database only after all four migrations. Rolls back fixtures.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','seller@example.invalid','{}'),
 ('22222222-2222-4222-8222-222222222222','buyer@example.invalid','{}'),
 ('33333333-3333-4333-8333-333333333333','stranger@example.invalid','{}');
insert into public.listings(id,seller_id,title,description,price,condition,category_id,neighborhood_id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Chat fixture','A disposable chat fixture item.',100,'good',1,1);
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 begin perform public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');raise exception 'Self-chat allowed';exception when invalid_parameter_value then null;end;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select set_config('qa.conversation',public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')::text,true);
do $$ begin
 if public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')::text <> current_setting('qa.conversation') then raise exception 'Duplicate conversation';end if;
 perform public.send_message(current_setting('qa.conversation')::uuid,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Hello seller');
 perform public.send_message(current_setting('qa.conversation')::uuid,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Hello seller');
 if(select count(*) from public.messages) <> 1 then raise exception 'Duplicate message';end if;
 begin perform public.send_message(current_setting('qa.conversation')::uuid,'cccccccc-cccc-4ccc-8ccc-cccccccccccc',E'\n\t');raise exception 'Blank message accepted';exception when invalid_parameter_value then null;end;
 begin perform public.send_message(current_setting('qa.conversation')::uuid,'cccccccc-cccc-4ccc-8ccc-cccccccccccc',repeat('a',2001));raise exception 'Oversized message accepted';exception when invalid_parameter_value then null;end;
 begin insert into public.messages(conversation_id,sender_id,client_id,body) values(current_setting('qa.conversation')::uuid,'11111111-1111-4111-8111-111111111111','cccccccc-cccc-4ccc-8ccc-cccccccccccc','Forged');raise exception 'Direct forged insert allowed';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 if(select count(*) from public.messages)<>1 then raise exception 'Seller cannot read buyer message';end if;
 perform public.send_message(current_setting('qa.conversation')::uuid,'cccccccc-cccc-4ccc-8ccc-cccccccccccc','Hello buyer');
 update public.listings set status='removed' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin
 if exists(select 1 from public.conversations) or exists(select 1 from public.messages) then raise exception 'Stranger can read chat';end if;
 begin perform public.send_message(current_setting('qa.conversation')::uuid,'dddddddd-dddd-4ddd-8ddd-dddddddddddd','Intrusion');raise exception 'Stranger can send';exception when insufficient_privilege then null;end;
 begin perform public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');raise exception 'New chat on removed item';exception when invalid_parameter_value then null;end;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 if(select count(*) from public.messages)<>2 then raise exception 'Existing chat lost after removal';end if;
 if exists(select 1 from public.messages where body='Hello buyer' and sender_id<>'11111111-1111-4111-8111-111111111111') then raise exception 'Sender forged';end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin perform * from public.messages;raise exception 'Anonymous reads allowed';exception when insufficient_privilege then null;end;
 begin perform public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');raise exception 'Anonymous start allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
