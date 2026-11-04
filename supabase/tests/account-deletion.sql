-- Disposable PostgreSQL only. Auth removal is simulated by deleting the fixture row.
begin;
insert into auth.users(id, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', '{"display_name":"Deleting seller"}'),
  ('22222222-2222-4222-8222-222222222222', '{"display_name":"Other seller"}');

insert into public.listings(id, seller_id, category_id, neighborhood_id, title, description, price, condition)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 1, 1, 'Fixture item', 'Account deletion fixture', 100, 'good');

insert into storage.objects(bucket_id, name, owner_id) values
  ('zuno-avatars', '11111111-1111-4111-8111-111111111111/avatar.webp', null),
  ('zuno-listing-photos', 'legacy.webp', '11111111-1111-4111-8111-111111111111'),
  ('zuno-avatars', '22222222-2222-4222-8222-222222222222/avatar.webp', '22222222-2222-4222-8222-222222222222');

set local role authenticated;
do $$ begin
  begin
    perform public.get_account_storage_batch('11111111-1111-4111-8111-111111111111');
    raise exception 'Authenticated role accessed the service-only function';
  exception when insufficient_privilege then null;
  end;
end $$;

set local role service_role;
do $$ begin
  if (select array_agg(name order by name) from public.get_account_storage_batch('11111111-1111-4111-8111-111111111111'))
    is distinct from array['11111111-1111-4111-8111-111111111111/avatar.webp', 'legacy.webp'] then
    raise exception 'Storage manifest missed owned files or included another user';
  end if;
end $$;
reset role;

delete from auth.users where id = '11111111-1111-4111-8111-111111111111';
do $$ begin
  if exists(select 1 from public.profiles where id = '11111111-1111-4111-8111-111111111111')
     or exists(select 1 from public.listings where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
     or not exists(select 1 from public.profiles where id = '22222222-2222-4222-8222-222222222222') then
    raise exception 'Account cascade did not isolate the deleted account';
  end if;
end $$;
rollback;
