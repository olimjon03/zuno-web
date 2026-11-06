begin;
insert into auth.users(id,email,raw_user_meta_data)
values('a4000000-0000-4000-8000-000000000001','map@example.invalid','{}');
set local role authenticated;
set local request.jwt.claim.sub='a4000000-0000-4000-8000-000000000001';
insert into storage.objects(bucket_id,name,owner_id) values('zuno-listing-photos',
'a4000000-0000-4000-8000-000000000001/a4000000-0000-4000-8000-000000000002/a4000000-0000-4000-8000-000000000003.webp',
'a4000000-0000-4000-8000-000000000001');
do $$ declare category bigint; area bigint; paths text[]:=array['a4000000-0000-4000-8000-000000000001/a4000000-0000-4000-8000-000000000002/a4000000-0000-4000-8000-000000000003.webp']; begin
 select id into category from public.categories order by id limit 1;
 select id into area from public.neighborhoods where region_code like 'KR-%' order by id limit 1;
 begin
 perform public.publish_listing_with_location('a4000000-0000-4000-8000-000000000002','Map fixture','Map fixture description',1000,'good',category,area,paths,'Map seller',91,127);
 raise exception 'Invalid latitude accepted';
 exception when sqlstate '22023' then null;
 end;
 perform public.publish_listing_with_location('a4000000-0000-4000-8000-000000000002','Map fixture','Map fixture description',1000,'good',category,area,paths,'Map seller',37.5,127);
 perform public.publish_listing_with_location('a4000000-0000-4000-8000-000000000002','Map fixture','Map fixture description',1000,'good',category,area,paths,'Map seller',38,128);
 if not exists(select 1 from public.listings where id='a4000000-0000-4000-8000-000000000002' and meeting_lat=37.5 and meeting_lng=127) then raise exception 'Pin persistence or retry failed'; end if;
end $$;
set local role anon;
do $$ begin
 if has_function_privilege('anon','public.publish_listing_with_location(uuid,text,text,bigint,text,bigint,bigint,text[],text,double precision,double precision)','execute') then raise exception 'Anonymous publish'; end if;
end $$;
rollback;
