-- Disposable database only after all three migrations. Fixtures roll back.
begin;
insert into auth.users (id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','save-owner@example.invalid','{}'),
 ('22222222-2222-4222-8222-222222222222','save-other@example.invalid','{}');
insert into public.listings (id,seller_id,title,description,price,condition,category_id,neighborhood_id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Fixture chair','Disposable saved item fixture.',100,'good',1,1);
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
insert into public.favorites(user_id,listing_id) values ('22222222-2222-4222-8222-222222222222','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
insert into public.favorites(user_id,listing_id) values ('22222222-2222-4222-8222-222222222222','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') on conflict do nothing;
do $$ begin
 if (select count(*) from public.favorites) <> 1 then raise exception 'Duplicate favorites'; end if;
 begin
 insert into public.favorites(user_id,listing_id) values ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
 raise exception 'Forged favorite owner allowed';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 if (select count(*) from public.favorites) <> 0 then raise exception 'Another user favorites exposed'; end if;
 delete from public.favorites where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if found then raise exception 'Other user favorite deleted'; end if;
end $$;
update public.listings set status='removed' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 if exists (select 1 from public.favorites f join public.listings l on l.id=f.listing_id) then raise exception 'Removed listing visible to saver'; end if;
 delete from public.favorites where listing_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if not found then raise exception 'Cannot unsave removed item'; end if;
 begin
 insert into public.favorites(user_id,listing_id) values ('22222222-2222-4222-8222-222222222222','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
 raise exception 'Removed item saved';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin perform * from public.favorites; raise exception 'Anonymous reads allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.favorites(user_id,listing_id) values ('22222222-2222-4222-8222-222222222222','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'); raise exception 'Anonymous saves allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
