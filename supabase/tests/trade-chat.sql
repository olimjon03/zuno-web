begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','chat-seller@example.invalid','{"display_name":"Seller"}'),
 ('22222222-2222-4222-8222-222222222222','chat-buyer@example.invalid','{"display_name":"Buyer"}'),
 ('33333333-3333-4333-8333-333333333333','chat-other@example.invalid','{"display_name":"Other"}');

insert into public.listings(id,seller_id,category_id,neighborhood_id,title,description,price,condition,status) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',1,1,'No buyer listing','Listing without a buyer.',100,'good','active'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','11111111-1111-4111-8111-111111111111',1,1,'Buyer listing','Listing with a buyer.',100,'good','active');

insert into public.conversations(id,listing_id,listing_title,buyer_id,seller_id,buyer_name,seller_name) values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Buyer listing','22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','Buyer','Seller'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Buyer listing','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Other','Seller');
insert into public.messages(conversation_id,sender_id,client_id,body) values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','22222222-2222-4222-8222-222222222222','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','I would like this item.'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','33333333-3333-4333-8333-333333333333','ffffffff-ffff-4fff-8fff-ffffffffffff','Is this available?');

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.set_listing_buyer_status('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null,'reserved');
select public.set_listing_buyer_status('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null,'sold');
do $$ begin
  if (select status from public.listings where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>'sold'
     or exists(select 1 from public.messages where trade_status is not null)
     or exists(select 1 from public.explore_trade_confirmations) then raise exception 'Buyerless status change incorrect'; end if;
end $$;
select public.set_listing_buyer_status('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','cccccccc-cccc-4ccc-8ccc-cccccccccccc','reserved');
select public.set_listing_buyer_status('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','cccccccc-cccc-4ccc-8ccc-cccccccccccc','sold');

select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin
  if exists(select 1 from public.messages where trade_status is not null) then raise exception 'Other conversation received a trade message'; end if;
  begin
    insert into public.explore_trade_confirmations(conversation_id) values('dddddddd-dddd-4ddd-8ddd-dddddddddddd');
    raise exception 'Unselected buyer could confirm receipt';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
  if (select array_agg(trade_status order by id) from public.messages where trade_status is not null) is distinct from array['reserved','sold'] then
    raise exception 'Selected buyer trade messages missing';
  end if;
  if (select count(*) from public.notifications where href='/messages/cccccccc-cccc-4ccc-8ccc-cccccccccccc')<>2 then
    raise exception 'Buyer notifications do not link to chat';
  end if;
end $$;
insert into public.explore_trade_confirmations(conversation_id) values('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
select public.submit_trade_feedback('cccccccc-cccc-4ccc-8ccc-cccccccccccc',true,'as-described');
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
  if (select count(*) from public.messages where trade_status='received')<>1 then raise exception 'Receipt message missing'; end if;
end $$;
select public.submit_trade_feedback('cccccccc-cccc-4ccc-8ccc-cccccccccccc',true,'kept-agreement');
rollback;
