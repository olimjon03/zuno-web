begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','trade-seller@example.invalid','{"display_name":"Seller"}'),
 ('22222222-2222-4222-8222-222222222222','trade-buyer@example.invalid','{"display_name":"Buyer"}'),
 ('33333333-3333-4333-8333-333333333333','trade-other@example.invalid','{"display_name":"Other"}');
insert into public.listings(id,seller_id,category_id,neighborhood_id,title,description,price,condition,status)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',1,1,'Fixture camera','Camera listing for tests.',100,'good','active');
insert into public.conversations(id,listing_id,listing_title,buyer_id,seller_id,buyer_name,seller_name) values
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture camera','22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','Buyer','Seller'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture camera','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Other','Seller');
insert into public.messages(conversation_id,sender_id,client_id,body) values
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','dddddddd-dddd-4ddd-8ddd-dddddddddddd','Is it still available?');

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
  if (select count(*) from public.get_listing_buyer_choices('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'))<>1 then
    raise exception 'Unexpected buyer candidates';
  end if;
  begin
    update public.listings set status='sold' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    raise exception 'Direct status bypass';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.set_listing_buyer_status('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','cccccccc-cccc-4ccc-8ccc-cccccccccccc','reserved');
    raise exception 'Buyer with no message accepted';
  exception when insufficient_privilege then null;
  end;
end $$;

select public.set_listing_buyer_status('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','reserved');
do $$ begin
  if not (select reserved_buyer from public.get_listing_buyer_choices('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')) then
    raise exception 'Reservation buyer was not recorded';
  end if;
end $$;
select public.set_listing_buyer_status('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','sold');
do $$ begin
  begin
    perform public.submit_trade_feedback('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true,'on-time');
    raise exception 'Feedback accepted before receipt';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
  if (select count(*) from public.notifications where user_id=auth.uid() and title in ('Confirm that you received your item','An item was reserved for you'))<>2 then
    raise exception 'Buyer notifications missing';
  end if;
  if exists(select 1 from public.get_listing_buyer_choices('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')) then raise exception 'Buyer candidates leaked'; end if;
end $$;
insert into public.explore_trade_confirmations(conversation_id) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
select public.submit_trade_feedback('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true,'as-described');
do $$ begin
  begin
    perform public.submit_trade_feedback('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true,'on-time');
    raise exception 'Duplicate feedback accepted';
  exception when unique_violation then null;
  end;
end $$;

select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.submit_trade_feedback('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false,'difficult-communication');
do $$ begin
  if (select count(*) from public.notifications where title='Your buyer confirmed receipt')<>1 then raise exception 'Seller not notified'; end if;
end $$;
set local role anon;
do $$ declare result jsonb; begin
  result:=public.get_neighbor_feedback('11111111-1111-4111-8111-111111111111','positive',0);
  if (result->>'positive')::int<>1 or jsonb_array_length(result->'items')<>1 then raise exception 'Feedback not visible'; end if;
  if (result->'items'->0) ?| array['conversation_id','reviewer_id','recipient_id'] then raise exception 'Private identifiers leaked'; end if;
  result:=public.get_neighbor_feedback('22222222-2222-4222-8222-222222222222','negative',0);
  if (result->>'negative')::int<>1 then raise exception 'Negative feedback missing'; end if;
end $$;
rollback;
