-- Run only against a disposable test database after the migration.
-- All test rows roll back. Auth endpoints/email delivery are not invoked.
begin;
insert into auth.users (id, email, raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111', 'zuno-owner@example.invalid', '{"display_name":"Owner"}'),
 ('22222222-2222-4222-8222-222222222222', 'zuno-other@example.invalid', '{"display_name":"Other"}');
insert into public.listings (id, seller_id, category_id, neighborhood_id, title, description, price, condition, status)
select v.id::uuid, '11111111-1111-4111-8111-111111111111'::uuid,
 (select id from public.categories order by id limit 1),
 (select id from public.neighborhoods order by id limit 1),
 'RLS fixture item', 'Only a disposable RLS fixture.', 10000, 'good', v.status
from (values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'active'), ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'removed')) as v(id, status);

set local role anon;
do $$ begin
 if (select count(*) from public.categories) <> 6 then raise exception 'Anonymous category read failed'; end if;
 if (select count(*) from public.listings where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')) <> 1 then raise exception 'Anonymous removed listing exposure'; end if;
 begin
  perform id from public.profiles;
  raise exception 'Anonymous profile access allowed';
 exception when insufficient_privilege then null;
 end;
 begin
  delete from public.listings where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  raise exception 'Anonymous write allowed';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$ begin
 if (select count(*) from public.profiles) <> 1 then raise exception 'Other profile exposure'; end if;
 if (select count(*) from public.listings where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') <> 0 then raise exception 'Other removed listing exposure'; end if;
 update public.listings set title = 'Unauthorized update' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if found then raise exception 'Other-user update allowed'; end if;
 delete from public.listings where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if found then raise exception 'Other-user delete allowed'; end if;
 begin
  insert into public.listings (seller_id, category_id, neighborhood_id, title, description, price, condition)
  select '11111111-1111-4111-8111-111111111111',
   (select id from public.categories order by id limit 1),
   (select id from public.neighborhoods order by id limit 1), 'Forged seller', 'Must not allow forged ownership.', 100, 'good';
  raise exception 'Forged seller insert allowed';
 exception when insufficient_privilege then null;
 end;
 begin
  update public.categories set name_en = 'Untrusted category';
  raise exception 'User category mutation allowed';
 exception when insufficient_privilege then null;
 end;
end $$;

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
do $$ begin
 if (select count(*) from public.listings where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')) <> 2 then raise exception 'Owner cannot read own removed listing'; end if;
 update public.listings set title = 'Owner update' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if not found then raise exception 'Owner update denied'; end if;
 update public.profiles set display_name = 'Owner renamed' where id = auth.uid();
 if not found then raise exception 'Own profile update denied'; end if;
 begin
  update public.listings set seller_id = '22222222-2222-4222-8222-222222222222' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  raise exception 'Ownership transfer allowed';
 exception when insufficient_privilege then null;
 end;
 delete from public.listings where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if not found then raise exception 'Owner delete denied'; end if;
end $$;
reset role;
rollback;
