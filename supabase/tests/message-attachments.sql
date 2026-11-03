-- Disposable database after migration 012 only. Test fixtures roll back.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','media-seller@example.invalid','{}'),
 ('22222222-2222-4222-8222-222222222222','media-buyer@example.invalid','{}'),
 ('33333333-3333-4333-8333-333333333333','media-stranger@example.invalid','{}');
insert into public.listings(id,seller_id,title,description,price,condition,category_id,neighborhood_id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Media fixture','Disposable media fixture.',100,'good',1,1);
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select set_config('qa.conversation',public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')::text,true);
insert into storage.objects(bucket_id,name,metadata) values('zuno-message-files','22222222-2222-4222-8222-222222222222/'||current_setting('qa.conversation')||'/dddddddd-dddd-4ddd-8ddd-dddddddddddd','{"mimetype":"image/webp","size":100}');
select set_config('qa.files',jsonb_build_array(jsonb_build_object('id','dddddddd-dddd-4ddd-8ddd-dddddddddddd','storage_path','22222222-2222-4222-8222-222222222222/'||current_setting('qa.conversation')||'/dddddddd-dddd-4ddd-8ddd-dddddddddddd','name','chair.webp','mime','image/webp','size',100))::text,true);
do $$ declare mid bigint;begin
 mid:=public.send_message_attachments(current_setting('qa.conversation')::uuid,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','',current_setting('qa.files')::jsonb);
 if public.send_message_attachments(current_setting('qa.conversation')::uuid,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','',current_setting('qa.files')::jsonb)<>mid then raise exception 'Retry created duplicate message';end if;
 if (select count(*) from public.message_attachments)<>1 or (select count(*) from public.messages)<>1 then raise exception 'Duplicate media';end if;
 if not exists(select 1 from public.messages where body='Photo') then raise exception 'Media-only message missing';end if;
 if (select count(*) from storage.objects where bucket_id='zuno-message-files')<>1 then raise exception 'Owner cannot read linked object';end if;
 delete from storage.objects where bucket_id='zuno-message-files';
 if not exists(select 1 from storage.objects where bucket_id='zuno-message-files') then raise exception 'Attached object deletion allowed';end if;
 begin insert into public.message_attachments(id,message_id,storage_path,name,mime,size,sort_order) values('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',mid,'forged','bad.txt','text/plain',10,0);raise exception 'Direct metadata insert allowed';exception when insufficient_privilege then null;end;
 begin perform public.send_message_attachments(current_setting('qa.conversation')::uuid,'cccccccc-cccc-4ccc-8ccc-cccccccccccc','',jsonb_set(current_setting('qa.files')::jsonb,'{0,storage_path}','"forged"'));raise exception 'Forged path accepted';exception when invalid_parameter_value then null;end;
 begin perform public.send_message_attachments(current_setting('qa.conversation')::uuid,'cccccccc-cccc-4ccc-8ccc-cccccccccccc','',jsonb_set(current_setting('qa.files')::jsonb,'{0,size}','99'));raise exception 'Forged size accepted';exception when invalid_parameter_value then null;end;
 begin perform public.send_message_attachments(current_setting('qa.conversation')::uuid,'cccccccc-cccc-4ccc-8ccc-cccccccccccc','',jsonb_set(current_setting('qa.files')::jsonb,'{0,mime}','"text/html"'));raise exception 'Forged mime accepted';exception when invalid_parameter_value then null;end;
 begin perform public.send_message_attachments(current_setting('qa.conversation')::uuid,'cccccccc-cccc-4ccc-8ccc-cccccccccccc','','[]');raise exception 'Empty media accepted';exception when invalid_parameter_value then null;end;
end $$;
insert into storage.objects(bucket_id,name,metadata) values('zuno-message-files','22222222-2222-4222-8222-222222222222/'||current_setting('qa.conversation')||'/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','{"mimetype":"application/pdf","size":50}');
select public.send_message_attachments(current_setting('qa.conversation')::uuid,'cccccccc-cccc-4ccc-8ccc-cccccccccccc','Here is the document',jsonb_build_array(jsonb_build_object('id','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','storage_path','22222222-2222-4222-8222-222222222222/'||current_setting('qa.conversation')||'/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','name','details.pdf','mime','application/pdf','size',50)));
insert into storage.objects(bucket_id,name,metadata) values('zuno-message-files','22222222-2222-4222-8222-222222222222/'||current_setting('qa.conversation')||'/ffffffff-ffff-4fff-8fff-ffffffffffff','{"mimetype":"image/webp","size":20}');
do $$ begin
 if (select count(*) from storage.objects where bucket_id='zuno-message-files')<>3 then raise exception 'Owner cannot access staged upload';end if;
 delete from storage.objects where bucket_id='zuno-message-files' and name like '%/ffffffff-ffff-4fff-8fff-ffffffffffff';
 if (select count(*) from storage.objects where bucket_id='zuno-message-files')<>2 then raise exception 'Cannot clean unused upload';end if;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 if (select count(*) from public.message_attachments)<>2 then raise exception 'Recipient cannot read files';end if;
 if (select count(*) from storage.objects where bucket_id='zuno-message-files')<>2 then raise exception 'Recipient cannot download files';end if;
 if (select unread_count from public.get_unread_counts() limit 1)<>2 then raise exception 'Media unread count wrong';end if;
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin
 if exists(select 1 from public.message_attachments) or exists(select 1 from storage.objects where bucket_id='zuno-message-files') then raise exception 'Stranger can read media';end if;
 begin perform public.send_message_attachments(current_setting('qa.conversation')::uuid,'ffffffff-ffff-4fff-8fff-ffffffffffff','',current_setting('qa.files')::jsonb);raise exception 'Stranger can send media';exception when insufficient_privilege then null;end;
 begin insert into storage.objects(bucket_id,name) values('zuno-message-files','33333333-3333-4333-8333-333333333333/'||current_setting('qa.conversation')||'/ffffffff-ffff-4fff-8fff-ffffffffffff');raise exception 'Stranger can upload media';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.set_user_block('22222222-2222-4222-8222-222222222222',true);
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 begin perform public.send_message_attachments(current_setting('qa.conversation')::uuid,'ffffffff-ffff-4fff-8fff-ffffffffffff','',current_setting('qa.files')::jsonb);raise exception 'Blocked sender accepted';exception when sqlstate 'P0002' then null;end;
 if (select count(*) from public.message_attachments)<>2 then raise exception 'History lost after blocking';end if;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform * from public.message_attachments;raise exception 'Anonymous metadata allowed';exception when insufficient_privilege then null;end;
 if exists(select 1 from storage.objects where bucket_id='zuno-message-files') then raise exception 'Anonymous download allowed';end if;
end $$;
rollback;
