begin;
insert into auth.users(id,email,raw_user_meta_data) values('a1000000-0000-4000-8000-000000000001','safety@example.invalid','{}');
do $$
declare i integer;
begin
 for i in 1..30 loop
  insert into storage.objects(bucket_id,name,owner_id)
  values('zuno-avatars','a1000000-0000-4000-8000-000000000001/'||gen_random_uuid()||'.webp','a1000000-0000-4000-8000-000000000001');
 end loop;
 begin
  insert into storage.objects(bucket_id,name,owner_id)
  values('zuno-avatars','a1000000-0000-4000-8000-000000000001/'||gen_random_uuid()||'.webp','a1000000-0000-4000-8000-000000000001');
  raise exception 'Expected rate limit';
 exception when sqlstate '54000' then null;
 end;
end $$;
select public.begin_account_deletion('a1000000-0000-4000-8000-000000000001');
select public.begin_account_deletion('a1000000-0000-4000-8000-000000000001');
do $$ begin
 if has_function_privilege('authenticated','public.begin_account_deletion(uuid)','execute') then raise exception 'Deletion RPC exposed'; end if;
 begin
  insert into storage.objects(bucket_id,name,owner_id)
  values('zuno-avatars','a1000000-0000-4000-8000-000000000001/'||gen_random_uuid()||'.webp','a1000000-0000-4000-8000-000000000001');
  raise exception 'Expected deletion guard';
 exception when insufficient_privilege then null;
 end;
end $$;
rollback;
