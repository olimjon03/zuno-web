-- Restrict private chat attachments to participants of their conversation.
-- Run after migration 026. Existing objects and messages are not modified.
begin;

drop policy if exists "Read attached conversation file" on storage.objects;

create policy "Read attached conversation file"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'zuno-message-files'
  and exists (
    select 1
    from public.conversations c
    where c.id::text = split_part(storage.objects.name, '/', 2)
      and (select auth.uid()) in (c.buyer_id, c.seller_id)
      and (
        exists (
          select 1
          from public.message_attachments a
          join public.messages m on m.id = a.message_id
          where a.storage_path = storage.objects.name
            and m.conversation_id = c.id
        )
        or (
          split_part(storage.objects.name, '/', 1) = (select auth.uid())::text
          and not exists (
            select 1
            from public.message_attachments a
            where a.storage_path = storage.objects.name
          )
        )
      )
  )
);

commit;
