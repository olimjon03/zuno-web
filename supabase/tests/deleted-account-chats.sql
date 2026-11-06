begin;
insert into auth.users(id,raw_user_meta_data) values
 ('a6000000-0000-4000-8000-000000000001','{"display_name":"Deleting seller"}'),
 ('a6000000-0000-4000-8000-000000000002','{"display_name":"Surviving buyer"}'),
 ('a6000000-0000-4000-8000-000000000003','{"display_name":"Stranger"}');
insert into public.listings(id,seller_id,category_id,neighborhood_id,title,description,price,condition)
values('a6000000-0000-4000-8000-000000000004','a6000000-0000-4000-8000-000000000001',1,1,'Keep chat','Deletion retention fixture',100,'good');
insert into public.conversations(id,listing_id,listing_title,buyer_id,seller_id,buyer_name,seller_name)
values('a6000000-0000-4000-8000-000000000005','a6000000-0000-4000-8000-000000000004','Keep chat','a6000000-0000-4000-8000-000000000002','a6000000-0000-4000-8000-000000000001','Surviving buyer','Deleting seller');
insert into public.messages(conversation_id,sender_id,client_id,body) values
 ('a6000000-0000-4000-8000-000000000005','a6000000-0000-4000-8000-000000000001',gen_random_uuid(),'Keep this message'),
 ('a6000000-0000-4000-8000-000000000005','a6000000-0000-4000-8000-000000000002',gen_random_uuid(),'Keep my reply');
insert into storage.objects(bucket_id,name,owner_id,metadata) values('zuno-message-files','a6000000-0000-4000-8000-000000000001/a6000000-0000-4000-8000-000000000005/a6000000-0000-4000-8000-000000000006','a6000000-0000-4000-8000-000000000001','{"mimetype":"image/webp","size":100}');
insert into public.message_attachments(id,message_id,storage_path,name,mime,size,sort_order)
select 'a6000000-0000-4000-8000-000000000006',id,'a6000000-0000-4000-8000-000000000001/a6000000-0000-4000-8000-000000000005/a6000000-0000-4000-8000-000000000006','Shared photo','image/webp',100,0 from public.messages where body='Keep this message';
-- An earlier failed cleanup may already have removed a file's Storage object.
insert into public.message_attachments(id,message_id,storage_path,name,mime,size,sort_order)
select 'a6000000-0000-4000-8000-000000000007',id,'a6000000-0000-4000-8000-000000000001/a6000000-0000-4000-8000-000000000005/a6000000-0000-4000-8000-000000000007','Previously unavailable photo','image/webp',100,1 from public.messages where body='Keep this message';
set local role authenticated;
set local request.jwt.claim.sub='a6000000-0000-4000-8000-000000000002';
do $$ begin
 begin perform public.prepare_account_deletion('a6000000-0000-4000-8000-000000000001');raise exception 'Prepare public';exception when insufficient_privilege then null;end;
 begin perform public.get_account_chat_archive_batch('a6000000-0000-4000-8000-000000000001');raise exception 'Archive public';exception when insufficient_privilege then null;end;
end $$;
set local role service_role;
do $$ begin
 if public.prepare_account_deletion('a6000000-0000-4000-8000-000000000001')<>'ready' then raise exception 'Prepare failed';end if;
 if (select count(*) from public.get_account_chat_archive_batch('a6000000-0000-4000-8000-000000000001'))<>1 then raise exception 'Missing shared file';end if;
 begin perform public.get_account_storage_batch('a6000000-0000-4000-8000-000000000001');raise exception 'Legacy cleanup discarded shared files';exception when object_not_in_prerequisite_state then null;end;
end $$;
reset role;
do $$ begin
 begin delete from auth.users where id='a6000000-0000-4000-8000-000000000001';raise exception 'Unarchived deletion allowed';exception when object_not_in_prerequisite_state then null;end;
end $$;
-- Simulate a successful Storage API service-role copy. No live blobs are touched.
set local request.jwt.claims='{"role":"service_role"}';
insert into storage.objects(bucket_id,name,owner_id,metadata) values('zuno-message-files','a6000000-0000-4000-8000-000000000002/a6000000-0000-4000-8000-000000000005/retained/a6000000-0000-4000-8000-000000000006',null,'{"mimetype":"image/webp","size":100}');
set local role authenticated;
set local request.jwt.claim.sub='a6000000-0000-4000-8000-000000000002';
set local request.jwt.claims='{"role":"authenticated"}';
delete from storage.objects where bucket_id='zuno-message-files' and name='a6000000-0000-4000-8000-000000000002/a6000000-0000-4000-8000-000000000005/retained/a6000000-0000-4000-8000-000000000006';
do $$ begin
 if not exists(select 1 from storage.objects where name='a6000000-0000-4000-8000-000000000002/a6000000-0000-4000-8000-000000000005/retained/a6000000-0000-4000-8000-000000000006') then raise exception 'Client removed staged archive';end if;
 begin perform public.commit_account_chat_archive('a6000000-0000-4000-8000-000000000001','a6000000-0000-4000-8000-000000000006','x','x');raise exception 'Commit public';exception when insufficient_privilege then null;end;
end $$;
set local role service_role;
do $$ begin
 begin perform public.commit_account_chat_archive('a6000000-0000-4000-8000-000000000001','a6000000-0000-4000-8000-000000000006','a6000000-0000-4000-8000-000000000001/a6000000-0000-4000-8000-000000000005/a6000000-0000-4000-8000-000000000006','wrong-path');raise exception 'Forged destination accepted';exception when invalid_parameter_value then null;end;
end $$;
set local role service_role;
select public.commit_account_chat_archive('a6000000-0000-4000-8000-000000000001','a6000000-0000-4000-8000-000000000006','a6000000-0000-4000-8000-000000000001/a6000000-0000-4000-8000-000000000005/a6000000-0000-4000-8000-000000000006','a6000000-0000-4000-8000-000000000002/a6000000-0000-4000-8000-000000000005/retained/a6000000-0000-4000-8000-000000000006');
reset role;
delete from storage.objects where owner_id='a6000000-0000-4000-8000-000000000001';
delete from auth.users where id='a6000000-0000-4000-8000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub='a6000000-0000-4000-8000-000000000002';
do $$ begin
 if (select count(*) from public.messages where conversation_id='a6000000-0000-4000-8000-000000000005')<>2 then raise exception 'History removed';end if;
 if not exists(select 1 from public.messages where body='Keep this message' and sender_id is null) then raise exception 'Sender not anonymized';end if;
 if not exists(select 1 from public.get_inbox() where id='a6000000-0000-4000-8000-000000000005' and other_id is null and other_name='Deleted account' and avatar_path is null and neighborhood is null) then raise exception 'Deleted identity leaked';end if;
 if not exists(select 1 from public.get_unread_counts() where conversation_id='a6000000-0000-4000-8000-000000000005' and unread_count=1) then raise exception 'Deleted sender unread count missing';end if;
 if (select count(*) from storage.objects where bucket_id='zuno-message-files' and name like '%/retained/%')<>1 then raise exception 'Shared file inaccessible';end if;
 if public.can_attach_to_conversation('a6000000-0000-4000-8000-000000000005') then raise exception 'Closed attachment allowed';end if;
 begin perform public.send_message('a6000000-0000-4000-8000-000000000005',gen_random_uuid(),'New message');raise exception 'Closed send allowed';exception when no_data_found then null;end;
end $$;
set local request.jwt.claim.sub='a6000000-0000-4000-8000-000000000003';
do $$ begin
 if exists(select 1 from public.messages where conversation_id='a6000000-0000-4000-8000-000000000005') then raise exception 'Stranger read history';end if;
 if exists(select 1 from storage.objects where name like '%/retained/%') then raise exception 'Stranger read retained file';end if;
end $$;
set local role service_role;
select public.prepare_account_deletion('a6000000-0000-4000-8000-000000000002');
do $$ begin
 if not exists(select 1 from public.get_account_storage_batch('a6000000-0000-4000-8000-000000000002') where name like '%/retained/%') then raise exception 'Final retained file cleanup missed';end if;
end $$;
reset role;
delete from storage.objects where split_part(name,'/',1)='a6000000-0000-4000-8000-000000000002';
delete from auth.users where id='a6000000-0000-4000-8000-000000000002';
do $$ begin
 if exists(select 1 from public.conversations where id='a6000000-0000-4000-8000-000000000005') then raise exception 'Empty tombstone conversation leaked';end if;
end $$;
-- Optional admin RESTRICT is detected before any new cleanup state.
create schema if not exists zuno_admin;
create table zuno_admin.staff_memberships(user_id uuid references auth.users(id) on delete restrict);
insert into zuno_admin.staff_memberships values('a6000000-0000-4000-8000-000000000003');
set local role service_role;
do $$ begin
 if public.prepare_account_deletion('a6000000-0000-4000-8000-000000000003')<>'admin_account' then raise exception 'Admin preflight missed';end if;
end $$;
reset role;
do $$ begin
 if exists(select 1 from public.profiles where id='a6000000-0000-4000-8000-000000000003' and deleting_at is not null) then raise exception 'Admin marked deleting';end if;
end $$;
rollback;
