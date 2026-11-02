begin;
insert into auth.users(id,raw_user_meta_data) values('11111111-1111-4111-8111-111111111111','{"display_name":"Seller"}'),('22222222-2222-4222-8222-222222222222','{"display_name":"Stranger"}');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ declare paths text[];ids uuid[];reordered text[];kept uuid;begin
 select array_agg('11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/'||lpad(i::text,8,'0')||'-1111-4111-8111-111111111111.webp' order by i) into paths from generate_series(1,11) i;
 for i in 1..11 loop
 insert into storage.objects(bucket_id,name,owner_id) values('zuno-listing-photos',paths[i],'11111111-1111-4111-8111-111111111111');
 end loop;
 perform public.publish_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','UZ item','A good useful second hand item',100000,'good',1,(select id from public.neighborhoods where region_code='UZ-TK' limit 1),paths[1:10],'Seller');
 if (select count(*) from public.listing_images where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>10 then raise exception 'Ten images not published';end if;
 select array_agg(id order by sort_order) into ids from public.listing_images where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 kept:=ids[10];reordered:=array[paths[10],paths[2],paths[11]];
 perform public.replace_listing_photos('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ids,reordered);
 if (select id from public.listing_images where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and sort_order=0)<>kept then raise exception 'Existing ID changed';end if;
 -- Repeat the same write after a lost response.
 perform public.replace_listing_photos('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ids,reordered);
 begin
  perform public.replace_listing_photos('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ids,paths[1:2]);raise exception 'Stale overwrite accepted';
 exception when serialization_failure then null;end;
 select array_agg(id order by sort_order) into ids from public.listing_images where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 begin
  perform public.replace_listing_photos('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ids,array[paths[1], '22222222-2222-4222-8222-222222222222/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/11111111-1111-4111-8111-111111111111.webp']);raise exception 'Foreign photo accepted';
 exception when insufficient_privilege then null;end;
 if (select count(*) from public.listing_images where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>3 then raise exception 'Failed transaction lost photos';end if;
 begin
  perform public.replace_listing_photos('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ids,paths);raise exception 'Eleven photos accepted';
 exception when raise_exception then if sqlerrm='Eleven photos accepted' then raise;end if;end;
 begin
  perform public.replace_listing_photos('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ids,'{}'::text[]);raise exception 'Zero photos accepted';
 exception when raise_exception then if sqlerrm='Zero photos accepted' then raise;end if;end;
 if (select count(distinct region_code) from public.neighborhoods where region_code like 'UZ-%')<>14 then raise exception 'Missing UZ regions';end if;
 if (select count(distinct region_code) from public.neighborhoods where region_code like 'KR-%')<>17 then raise exception 'Missing KR regions';end if;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$begin
 begin
 perform public.replace_listing_photos('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','{}'::uuid[],array['forged']);raise exception 'Stranger edit accepted';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role anon;
do $$begin
 begin
 perform public.replace_listing_photos('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','{}'::uuid[],array['forged']);raise exception 'Anonymous edit accepted';
 exception when insufficient_privilege then null;end;
end $$;
rollback;
