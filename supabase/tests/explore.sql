begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','explore-seller@example.invalid','{"display_name":"Seller"}'),
 ('22222222-2222-4222-8222-222222222222','explore-buyer@example.invalid','{"display_name":"Buyer"}'),
 ('33333333-3333-4333-8333-333333333333','explore-other@example.invalid','{"display_name":"Other"}');

update public.profiles set country_code='UZ',neighborhood_id=(select id from public.neighborhoods where region_code='UZ-NG' and district_code is not null limit 1)
where id in ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');
insert into public.moderators(user_id) values('33333333-3333-4333-8333-333333333333');

set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
insert into public.explore_search_alerts(country,query) values('UZ','fixture camera');
insert into public.explore_location_requests(neighborhood_id,note)
select neighborhood_id,'I live in this neighborhood.' from public.profiles where id=auth.uid();

do $$ begin
  begin
    insert into public.explore_announcements(title,body) values('Fake news','A non-moderator cannot publish.');
    raise exception 'Non-moderator announcement accepted';
  exception when insufficient_privilege then null;
  end;
  update public.explore_location_requests set status='approved' where user_id=auth.uid();
  if found then raise exception 'Self approval accepted'; end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
insert into public.listings(id,seller_id,category_id,neighborhood_id,title,description,price,condition,status)
select 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',id,1,neighborhood_id,'Fixture camera for sale','A test camera listing.',100,'good','active'
from public.profiles where id=auth.uid();
insert into public.conversations(id,listing_id,listing_title,buyer_id,seller_id,buyer_name,seller_name) values
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture camera for sale','22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','Buyer','Seller'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture camera for sale','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Other','Seller');

set local role authenticated;
insert into public.explore_posts(kind,neighborhood_id,title,body)
select 'neighborhood-posts',neighborhood_id,'Local post','Test neighborhood content.' from public.profiles where id=auth.uid();
insert into public.explore_promotions(listing_id) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
update public.listings set status='sold' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
  perform public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','44444444-4444-4444-8444-444444444444');
  if (select count(*) from public.explore_recent_views)<>1 then raise exception 'Recent listing view missing'; end if;
  if (select count(*) from public.explore_posts)<>1 then raise exception 'Neighbor post hidden'; end if;
  if (select count(*) from public.notifications where title='New listing matches your search')<>1 then
    raise exception 'Search match notification missing';
  end if;
  begin
    insert into public.explore_trade_confirmations(conversation_id) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    raise exception 'Buyer bypassed seller confirmation';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
insert into public.explore_trade_confirmations(conversation_id) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
do $$ begin
  begin
    insert into public.explore_trade_confirmations(conversation_id) values('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
    raise exception 'Seller confirmed a second buyer';
  exception when unique_violation then null;
  end;
end $$;

select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
insert into public.explore_trade_confirmations(conversation_id) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
do $$ begin
  if (select count(*) from public.explore_trade_confirmations)<>2 then raise exception 'Missing receipt confirmations'; end if;
end $$;

select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin
  if exists(select 1 from public.explore_posts) or exists(select 1 from public.explore_search_alerts)
     or exists(select 1 from public.explore_trade_confirmations) then raise exception 'Other user data leaked'; end if;
end $$;
update public.explore_location_requests set status='approved' where user_id='22222222-2222-4222-8222-222222222222';
insert into public.explore_announcements(title,body) values('Real news','A moderator can publish an announcement.');
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
  if (select status from public.explore_location_requests where user_id=auth.uid())<>'approved' then raise exception 'Moderator review failed'; end if;
  if not exists(select 1 from public.explore_announcements) then raise exception 'Announcement not visible'; end if;
end $$;
rollback;
