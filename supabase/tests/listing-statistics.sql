begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','stats-owner@example.invalid','{}'),
 ('22222222-2222-4222-8222-222222222222','stats-buyer@example.invalid','{}');
insert into public.listings(id,seller_id,title,description,price,condition,category_id,neighborhood_id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Stats fixture','Statistics test fixture.',100,'good',1,1);
set local role anon;
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','cccccccc-cccc-4ccc-8ccc-cccccccccccc');
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','cccccccc-cccc-4ccc-8ccc-cccccccccccc');
do $$ begin
 begin perform public.get_owned_listing_statistics('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',7);raise exception 'Anonymous stats allowed';exception when insufficient_privilege then null;end;
 begin perform * from public.listing_daily_views;raise exception 'Raw history exposed';exception when insufficient_privilege then null;end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
insert into public.favorites(user_id,listing_id) values('22222222-2222-4222-8222-222222222222','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
do $$ begin
 begin perform public.get_owned_listing_statistics('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',7);raise exception 'Other owner stats exposed';exception when no_data_found then null;end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.record_listing_view('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','dddddddd-dddd-4ddd-8ddd-dddddddddddd');
do $$ declare s jsonb;begin
 s:=public.get_owned_listing_statistics('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',7);
 if (s->>'views')::int<>1 or (s->>'likes')::int<>1 or (s->>'saves')::int<>1 or jsonb_array_length(s->'daily')<>1 then raise exception 'Invalid stats/deduplication: %',s;end if;
 if (public.get_owned_listing_statistics('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',0)->>'views')::int<>1 then raise exception 'All-time total incorrect';end if;
 begin perform public.get_owned_listing_statistics('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',90);raise exception 'Invalid period allowed';exception when invalid_parameter_value then null;end;
end $$;
reset role;
update public.listings set status='removed' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local role authenticated;
do $$ begin begin perform public.get_owned_listing_statistics('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',7);raise exception 'Removed stats exposed';exception when no_data_found then null;end;end $$;
rollback;
