begin;
do $$ begin
 if (select display_name from public.profiles where id='a5100000-0000-4000-8000-000000000001')<>'Legacy Google' then raise exception 'Placeholder backfill failed';end if;
 if (select display_name from public.profiles where id='a5100000-0000-4000-8000-000000000002')<>'My chosen name' then raise exception 'Backfill replaced chosen name';end if;
 if not exists(select 1 from public.conversations where id='a5100000-0000-4000-8000-000000000003' and seller_name='Legacy Google' and buyer_name='My chosen name') then raise exception 'Conversation name repair failed';end if;
end $$;
insert into auth.users(id,raw_user_meta_data) values
 ('a5000000-0000-4000-8000-000000000001','{"full_name":"Google Neighbor"}'),
 ('a5000000-0000-4000-8000-000000000002','{"name":"Telegram Neighbor"}'),
 ('a5000000-0000-4000-8000-000000000003','{"nickname":"카카오 이름"}'),
 ('a5000000-0000-4000-8000-000000000004','{"display_name":"Chosen name","full_name":"Provider name"}'),
 ('a5000000-0000-4000-8000-000000000005','{}'),
 ('a5000000-0000-4000-8000-000000000006','{"name":{"role":"admin"},"full_name":" ","given_name":"Ali","family_name":"Valiyev"}');
do $$ begin
 if (select display_name from public.profiles where id='a5000000-0000-4000-8000-000000000001')<>'Google Neighbor' then raise exception 'Google name missing';end if;
 if (select display_name from public.profiles where id='a5000000-0000-4000-8000-000000000002')<>'Telegram Neighbor' then raise exception 'Telegram name missing';end if;
 if (select display_name from public.profiles where id='a5000000-0000-4000-8000-000000000003')<>'카카오 이름' then raise exception 'Kakao nickname missing';end if;
 if (select display_name from public.profiles where id='a5000000-0000-4000-8000-000000000004')<>'Chosen name' then raise exception 'Chosen name replaced';end if;
 if not exists(select 1 from public.profiles where id='a5000000-0000-4000-8000-000000000005' and display_name='ZUNO #'||member_number::text) then raise exception 'ZUNO ID fallback missing';end if;
 if (select display_name from public.profiles where id='a5000000-0000-4000-8000-000000000006')<>'Ali Valiyev' then raise exception 'Invalid metadata/name composition';end if;
 if public.zuno_initial_display_name(jsonb_build_object('full_name',repeat('글',100)),'fallback')<>repeat('글',40) then raise exception 'Name length limit failed';end if;
end $$;
update public.profiles set display_name='Edited name' where id='a5000000-0000-4000-8000-000000000001';
update auth.users set raw_user_meta_data='{"full_name":"Changed provider name"}' where id='a5000000-0000-4000-8000-000000000001';
do $$ begin
 if (select display_name from public.profiles where id='a5000000-0000-4000-8000-000000000001')<>'Edited name' then raise exception 'Edited name replaced';end if;
end $$;
set local role authenticated;
set local request.jwt.claim.sub='a5000000-0000-4000-8000-000000000001';
do $$ begin
 begin perform public.zuno_initial_display_name('{}','x');raise exception 'Internal helper exposed';exception when insufficient_privilege then null;end;
 begin perform public.create_profile_for_new_user();raise exception 'Trigger callable';exception when insufficient_privilege then null;end;
end $$;
rollback;
