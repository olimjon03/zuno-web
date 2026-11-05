-- Run on a disposable local database with all migrations applied.
-- Regression: linked private chat objects must never be readable by strangers.
begin;

insert into auth.users (id,email,raw_user_meta_data) values
 ('a1111111-1111-4111-8111-111111111111','storage-owner@example.invalid','{}'),
 ('a2222222-2222-4222-8222-222222222222','storage-buyer@example.invalid','{}'),
 ('a3333333-3333-4333-8333-333333333333','storage-stranger@example.invalid','{}');

insert into public.listings
 (id,seller_id,title,description,price,condition,category_id,neighborhood_id)
values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa27',
  'a1111111-1111-4111-8111-111111111111',
  'Storage RLS fixture','Disposable conversation attachment fixture.',
  100,'good',1,1);

set local role authenticated;
select set_config('request.jwt.claim.sub','a2222222-2222-4222-8222-222222222222',true);
select set_config(
 'qa.chat_storage_conversation',
 public.start_conversation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa27')::text,
 true
);
reset role;

-- Insert fixture objects as database owner; do not rely on client upload flows.
insert into storage.objects(bucket_id,name,metadata) values
 ('zuno-message-files',
  'a2222222-2222-4222-8222-222222222222/'||current_setting('qa.chat_storage_conversation')||'/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb27',
  '{"mimetype":"image/webp","size":100}'),
 ('zuno-message-files',
  'a2222222-2222-4222-8222-222222222222/'||current_setting('qa.chat_storage_conversation')||'/cccccccc-cccc-4ccc-8ccc-cccccccccc27',
  '{"mimetype":"image/webp","size":100}');

insert into public.messages(conversation_id,sender_id,client_id,body)
values (current_setting('qa.chat_storage_conversation')::uuid,
 'a2222222-2222-4222-8222-222222222222',
 'dddddddd-dddd-4ddd-8ddd-dddddddddd27','Photo');

insert into public.message_attachments(id,message_id,storage_path,name,mime,size,sort_order)
select 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',m.id,
 'a2222222-2222-4222-8222-222222222222/'||current_setting('qa.chat_storage_conversation')||'/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb27',
 'fixture.webp','image/webp',100,0
from public.messages m
where m.client_id='dddddddd-dddd-4ddd-8ddd-dddddddddd27';

set local role authenticated;

-- Uploader can read both attached and not-yet-attached objects.
select set_config('request.jwt.claim.sub','a2222222-2222-4222-8222-222222222222',true);
do $$
begin
 if (select count(*) from storage.objects where bucket_id='zuno-message-files'
     and name like '%/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb27')<>1
 then raise exception 'Buyer cannot read attached object'; end if;
 if (select count(*) from storage.objects where bucket_id='zuno-message-files'
     and name like '%/cccccccc-cccc-4ccc-8ccc-cccccccccc27')<>1
 then raise exception 'Uploader cannot read staged object'; end if;
end $$;

-- Seller can read attached object, but not buyer's staged upload.
select set_config('request.jwt.claim.sub','a1111111-1111-4111-8111-111111111111',true);
do $$
begin
 if (select count(*) from storage.objects where bucket_id='zuno-message-files'
     and name like '%/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb27')<>1
 then raise exception 'Seller cannot read attached object'; end if;
 if exists(select 1 from storage.objects where bucket_id='zuno-message-files'
     and name like '%/cccccccc-cccc-4ccc-8ccc-cccccccccc27')
 then raise exception 'Seller can read another user staged object'; end if;
end $$;

-- Regression: stranger knows the full path but cannot read either object.
select set_config('request.jwt.claim.sub','a3333333-3333-4333-8333-333333333333',true);
do $$
begin
 if exists(select 1 from storage.objects where bucket_id='zuno-message-files'
     and name like '%/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb27')
 then raise exception 'SECURITY: stranger can read attached object'; end if;
 if exists(select 1 from storage.objects where bucket_id='zuno-message-files'
     and name like '%/cccccccc-cccc-4ccc-8ccc-cccccccccc27')
 then raise exception 'SECURITY: stranger can read staged object'; end if;
end $$;

reset role;
set local role anon;
do $$
begin
 if exists(select 1 from storage.objects where bucket_id='zuno-message-files'
     and name like '%/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb27')
 then raise exception 'SECURITY: anonymous can read attached object'; end if;
end $$;

rollback;
