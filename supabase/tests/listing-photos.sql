-- Disposable database only, after both migrations. All fixtures roll back.
begin;
insert into auth.users (id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','listing-owner@example.invalid','{"display_name":"Owner"}'),
 ('22222222-2222-4222-8222-222222222222','listing-other@example.invalid','{"display_name":"Other"}');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
insert into storage.objects (bucket_id,name,owner_id) values
 ('zuno-listing-photos','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee.webp','11111111-1111-4111-8111-111111111111'),
 ('zuno-listing-photos','11111111-1111-4111-8111-111111111111/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/ffffffff-ffff-4fff-8fff-ffffffffffff.webp','11111111-1111-4111-8111-111111111111');
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if (select count(*) from storage.objects where bucket_id='zuno-listing-photos') <> 0 then raise exception 'Unattached images publicly readable'; end if;
 begin
  perform public.publish_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture chair','A disposable fixture description.',100,'good',1,1,array['x'],'Owner');
  raise exception 'Anonymous publish allowed';
 exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.publish_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture chair','A disposable fixture description.',100,'good',1,1,
 array['11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee.webp'],'Owner');
-- Retrying a successful submission returns the same ID and creates no duplicate.
select public.publish_listing('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture chair','A disposable fixture description.',100,'good',1,1,
 array['11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee.webp'],'Owner');
do $$ begin
 if (select count(*) from public.listing_images) <> 1 then raise exception 'Photo duplicate on retry'; end if;
 delete from storage.objects where bucket_id='zuno-listing-photos' and name like '%/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/%';
 if found then raise exception 'Attached photo deleted'; end if;
 delete from storage.objects where bucket_id='zuno-listing-photos' and name like '%/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/%';
 if not found then raise exception 'Unattached cleanup denied'; end if;
 begin
  perform public.publish_listing('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Invalid chair','A disposable fixture description.',100,'good',1,1,array[]::text[],'Owner');
  raise exception 'Photo-less listing allowed';
 exception when raise_exception then if sqlerrm='Photo-less listing allowed' then raise; end if; end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if (select count(*) from public.listing_images) <> 1 then raise exception 'Published metadata unreadable'; end if;
 if (select count(*) from storage.objects where bucket_id='zuno-listing-photos') <> 1 then raise exception 'Published image unreadable'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 begin
  insert into storage.objects (bucket_id,name,owner_id) values ('zuno-listing-photos','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/ffffffff-ffff-4fff-8fff-ffffffffffff.webp','22222222-2222-4222-8222-222222222222');
  raise exception 'Other prefix upload allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform public.publish_listing('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Stolen chair','A disposable fixture description.',100,'good',1,1,
   array['11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee.webp'],'Other');
  raise exception 'Other image publish allowed';
 exception when insufficient_privilege then null; end;
end $$;
-- Another authenticated user cannot edit, mark sold or remove an owner's item.
do $$ begin
 update public.listings set title='Forged title', price=0 where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if found then raise exception 'Cross-owner edit allowed'; end if;
 update public.listings set status='sold' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if found then raise exception 'Cross-owner sold allowed'; end if;
 update public.listings set status='removed' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if found then raise exception 'Cross-owner removal allowed'; end if;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 update public.listings set title='Updated chair',price=200,status='sold' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if not found then raise exception 'Owner edit denied'; end if;
 if not exists (select 1 from public.listings where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and title='Updated chair' and price=200 and status='sold') then raise exception 'Owner changes not persisted'; end if;
 update public.listings set status='active' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if not found then raise exception 'Owner relist denied'; end if;
end $$;
update public.listings set status='removed' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if (select count(*) from public.listing_images) <> 0 then raise exception 'Removed image metadata exposed'; end if;
 if (select count(*) from storage.objects where bucket_id='zuno-listing-photos') <> 0 then raise exception 'Removed images exposed'; end if;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.listings where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') <> 0 then raise exception 'Failed RPC left a row'; end if;
end $$;
rollback;
