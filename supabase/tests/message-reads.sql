-- Disposable database only after all five migrations. Rolls back fixtures.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','read-seller@example.invalid','{}'),
 ('22222222-2222-4222-8222-222222222222','read-buyer@example.invalid','{}'),
 ('33333333-3333-4333-8333-333333333333','read-other@example.invalid','{}');
insert into public.listings(id,seller_id,title,description,price,condition,category_id,neighborhood_id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Read fixture','Disposable unread message fixture.',100,'good',1,1);
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select set_config('qa.chat',public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')::text,true);
select set_config('qa.first',public.send_message(current_setting('qa.chat')::uuid,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','First buyer message')::text,true);
do $$ begin
 if exists(select 1 from public.get_unread_counts())then raise exception 'Own message counted unread';end if;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 if(select unread_count from public.get_unread_counts())<>1 then raise exception 'Seller missing unread message';end if;
 perform public.mark_messages_read(current_setting('qa.chat')::uuid,current_setting('qa.first')::bigint);
 if exists(select 1 from public.get_unread_counts())then raise exception 'Read did not clear count';end if;
 begin perform public.mark_messages_read(current_setting('qa.chat')::uuid,9223372036854775807);raise exception 'Future read cursor accepted';exception when invalid_parameter_value then null;end;
 begin insert into public.message_reads(conversation_id,user_id,last_read_message_id) values(current_setting('qa.chat')::uuid,'22222222-2222-4222-8222-222222222222',0);raise exception 'Direct forged read accepted';exception when insufficient_privilege then null;end;
end $$;
select set_config('qa.reply',public.send_message(current_setting('qa.chat')::uuid,'cccccccc-cccc-4ccc-8ccc-cccccccccccc','Seller reply')::text,true);
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 if(select unread_count from public.get_unread_counts())<>1 then raise exception 'Buyer missing reply count';end if;
 if exists(select 1 from public.message_reads)then raise exception 'Other participant cursor exposed';end if;
 perform public.mark_messages_read(current_setting('qa.chat')::uuid,current_setting('qa.reply')::bigint);
 perform public.mark_messages_read(current_setting('qa.chat')::uuid,current_setting('qa.first')::bigint);
 if exists(select 1 from public.get_unread_counts())then raise exception 'Old cursor regressed read state';end if;
end $$;
select public.send_message(current_setting('qa.chat')::uuid,'dddddddd-dddd-4ddd-8ddd-dddddddddddd','Another buyer message');
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 if(select unread_count from public.get_unread_counts())<>1 then raise exception 'New message incorrectly marked read';end if;
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin
 if exists(select 1 from public.get_unread_counts()) or exists(select 1 from public.message_reads)then raise exception 'Stranger sees read data';end if;
 begin perform public.mark_messages_read(current_setting('qa.chat')::uuid,current_setting('qa.reply')::bigint);raise exception 'Stranger changed read cursor';exception when insufficient_privilege then null;end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin perform * from public.get_unread_counts();raise exception 'Anonymous counts allowed';exception when insufficient_privilege then null;end;
 begin perform public.mark_messages_read(current_setting('qa.chat')::uuid,current_setting('qa.first')::bigint);raise exception 'Anonymous read write allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
