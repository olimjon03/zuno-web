-- Disposable fixtures; run after 014, rolled back at the end.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','like-seller@example.invalid','{}'),
 ('22222222-2222-4222-8222-222222222222','like-buyer@example.invalid','{}'),
 ('33333333-3333-4333-8333-333333333333','like-buyer2@example.invalid','{}');
insert into public.listings(id,seller_id,title,description,price,condition,category_id,neighborhood_id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Like fixture','Disposable listing for likes.',100,'good',1,1);
set local role anon;
do $$ begin
 if (select like_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>0 then raise exception 'Bad initial count';end if;
 begin perform * from public.listing_likes;raise exception 'Anonymous liker identities exposed';exception when insufficient_privilege then null;end;
 begin perform public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);raise exception 'Anonymous like allowed';exception when insufficient_privilege then null;end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $$ begin
 if (select like_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>1 then raise exception 'Duplicate inflated likes';end if;
 if (select count(*) from public.listing_likes)<>1 then raise exception 'Own like not readable';end if;
 if exists(select 1 from public.favorites) then raise exception 'Like added a saved bookmark';end if;
 begin insert into public.listing_likes values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','33333333-3333-4333-8333-333333333333',now());raise exception 'Forged identity allowed';exception when insufficient_privilege then null;end;
 begin delete from public.listing_likes;raise exception 'Direct delete allowed';exception when insufficient_privilege then null;end;
 begin perform public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null);raise exception 'Null like accepted';exception when invalid_parameter_value then null;end;
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin if exists(select 1 from public.listing_likes) then raise exception 'Other liker identity exposed';end if;end $$;
select public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $$ begin if (select like_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>2 then raise exception 'Second user not counted';end if;end $$;
select public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
select public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
do $$ begin if (select like_count from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[]))<>1 then raise exception 'Unlike removed others or went negative';end if;end $$;
insert into public.favorites(user_id,listing_id) values('33333333-3333-4333-8333-333333333333','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
do $$ begin if exists(select 1 from public.listing_likes) then raise exception 'Bookmark created a like';end if;end $$;
reset role;
update public.listings set status='reserved' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local role authenticated;
select public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
reset role;
update public.listings set status='sold' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local role authenticated;
select public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
reset role;
update public.listings set status='removed' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local role authenticated;
do $$ begin
 if exists(select 1 from public.get_listing_engagement(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[])) then raise exception 'Removed count exposed';end if;
 if exists(select 1 from public.listing_likes) then raise exception 'Removed likes exposed';end if;
 begin perform public.set_listing_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);raise exception 'Removed listing liked';exception when no_data_found then null;end;
end $$;
reset role;
delete from public.listings where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $$ begin if exists(select 1 from public.listing_likes where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') then raise exception 'Likes did not cascade';end if;end $$;
rollback;
