-- Disposable database only after existing migrations. Fixtures roll back.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','profile-owner@example.invalid','{"display_name":"Owner"}'),
 ('22222222-2222-4222-8222-222222222222','profile-other@example.invalid','{"display_name":"Other"}');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 update public.profiles set display_name='민수 😀',neighborhood_id=1 where id=auth.uid();
 if not found then raise exception 'Own profile update denied';end if;
 if not exists(select 1 from public.profiles where display_name='민수 😀' and neighborhood_id=1)then raise exception 'Profile changes not persisted';end if;
 update public.profiles set display_name='Forged profile' where id='22222222-2222-4222-8222-222222222222';
 if found then raise exception 'Cross-owner profile update allowed';end if;
 if exists(select 1 from public.profiles where id='22222222-2222-4222-8222-222222222222')then raise exception 'Other profile exposed';end if;
 begin update public.profiles set id='33333333-3333-4333-8333-333333333333' where id=auth.uid();raise exception 'Profile identity change allowed';exception when insufficient_privilege then null;end;
 begin update public.profiles set neighborhood_id=9223372036854775807 where id=auth.uid();raise exception 'Unknown neighborhood allowed';exception when foreign_key_violation then null;end;
 update public.profiles set neighborhood_id=null where id=auth.uid();
 if not found then raise exception 'Cannot clear optional neighborhood';end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin perform * from public.profiles;raise exception 'Anonymous profile read allowed';exception when insufficient_privilege then null;end;
 begin update public.profiles set display_name='Anonymous overwrite';raise exception 'Anonymous update allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
