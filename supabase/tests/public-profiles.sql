-- Disposable database only. Fixture writes roll back.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
('11111111-1111-4111-8111-111111111111','avatar-owner@example.invalid','{"display_name":"Owner"}'),
('22222222-2222-4222-8222-222222222222','avatar-other@example.invalid','{"display_name":"Other"}');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 update public.profiles set avatar_path='11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp' where id=auth.uid();
 if not found then raise exception 'Owner cannot set avatar';end if;
 begin update public.profiles set avatar_path='22222222-2222-4222-8222-222222222222/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp' where id=auth.uid();raise exception 'Foreign avatar reference allowed';exception when check_violation then null;end;
 update public.profiles set avatar_path=null where id='22222222-2222-4222-8222-222222222222';
 if found then raise exception 'Cross-owner update allowed';end if;
 insert into storage.objects(bucket_id,name)values('zuno-avatars','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp');
 begin insert into storage.objects(bucket_id,name)values('zuno-avatars','22222222-2222-4222-8222-222222222222/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp');raise exception 'Foreign upload allowed';exception when insufficient_privilege then null;end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ declare profile jsonb; begin
 select to_jsonb(p) into profile from public.get_public_profile('11111111-1111-4111-8111-111111111111')p;
 if profile->>'display_name'<>'Owner' or profile->>'avatar_path' is null then raise exception 'Public profile projection failed';end if;
 if profile ? 'email' or profile ? 'language' or profile ? 'created_at' then raise exception 'Private fields exposed';end if;
 if exists(select 1 from public.get_public_profile('99999999-9999-4999-8999-999999999999'))then raise exception 'Missing profile fabricated';end if;
 begin perform * from public.profiles;raise exception 'Base profiles exposed';exception when insufficient_privilege then null;end;
 begin insert into storage.objects(bucket_id,name) values('zuno-avatars','11111111-1111-4111-8111-111111111111/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.webp');raise exception 'Anonymous upload allowed';exception when insufficient_privilege then null;end;
 delete from storage.objects where bucket_id='zuno-avatars';if found then raise exception 'Anonymous delete allowed';end if;
end $$;
reset role;
rollback;
