-- Disposable database only, after 008. All fixtures roll back.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
('11111111-1111-4111-8111-111111111111','seller@example.invalid','{"display_name":"Seller"}'),
('22222222-2222-4222-8222-222222222222','buyer@example.invalid','{"display_name":"Buyer"}'),
('33333333-3333-4333-8333-333333333333','stranger@example.invalid','{"display_name":"Stranger"}');
update public.profiles set avatar_path='11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp' where id='11111111-1111-4111-8111-111111111111';
insert into public.listings(id,seller_id,title,description,price,condition,category_id,neighborhood_id)values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Camera','A private inbox fixture camera.',100,'good',1,1);
insert into public.listing_images(id,listing_id,storage_path,sort_order)values
('aaaaaaaa-0000-4000-8000-aaaaaaaaaaa1','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','fixture/later.webp',1),
('aaaaaaaa-0000-4000-8000-aaaaaaaaaaa2','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','fixture/first.webp',0);
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select set_config('qa.inbox',public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')::text,true);
select public.send_message(current_setting('qa.inbox')::uuid,'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa','Hello seller');
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.send_message(current_setting('qa.inbox')::uuid,'aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa','Hello buyer');
do $$ declare item record;begin
 select * into item from public.get_inbox();
 if item.other_name<>'Buyer' or item.other_id<>'22222222-2222-4222-8222-222222222222' then raise exception 'Seller sees wrong counterpart';end if;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ declare item record;begin
 select * into item from public.get_inbox();
 if item.other_name<>'Seller' or item.last_message<>'Hello buyer' or item.avatar_path is null then raise exception 'Buyer preview incorrect';end if;
 if item.thumbnail_id<>'aaaaaaaa-0000-4000-8000-aaaaaaaaaaa2' then raise exception 'Wrong first photo';end if;
 if(select count(*) from public.get_inbox())<>1 then raise exception 'Unexpected inbox rows';end if;
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin if exists(select 1 from public.get_inbox())then raise exception 'Stranger sees private preview';end if;end $$;
select set_config('request.jwt.claim.sub','',true);
do $$ begin begin perform * from public.get_inbox();raise exception 'Missing actor accepted';exception when insufficient_privilege then null;end;end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
update public.listings set status='removed' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ declare item record;begin
 select * into item from public.get_inbox();
 if item.thumbnail_id is not null or item.neighborhood is not null then raise exception 'Removed listing preview exposed';end if;
 if item.last_message<>'Hello buyer' or item.listing_title<>'Camera' then raise exception 'Existing chat lost after removal';end if;
end $$;
reset role;
delete from public.listings where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ declare item record;begin select * into item from public.get_inbox();if item.listing_id is not null or item.last_message<>'Hello buyer' then raise exception 'Deleted item broke conversation';end if;end $$;
do $$ declare preview text;begin
 perform public.send_message(current_setting('qa.inbox')::uuid,'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa',repeat('x',500));
 select last_message into preview from public.get_inbox();
 if char_length(preview)<>180 then raise exception 'Preview payload is not bounded';end if;
end $$;
set local role anon;
do $$ begin begin perform * from public.get_inbox();raise exception 'Anonymous preview allowed';exception when insufficient_privilege then null;end;end $$;
reset role;
rollback;
