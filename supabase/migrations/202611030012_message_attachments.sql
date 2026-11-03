-- Apply after migration 011. Chat media remains private to conversation participants.
begin;
create table public.message_attachments (
 id uuid primary key,
 message_id bigint not null references public.messages(id) on delete cascade,
 storage_path text not null unique,
 name text not null check(char_length(name) between 1 and 160),
 mime text not null check(mime in ('image/webp','application/pdf','text/plain','text/csv','application/zip','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
 size integer not null check(size between 1 and 3145728),
 sort_order integer not null check(sort_order between 0 and 3),
 unique(message_id,sort_order)
);
alter table public.message_attachments enable row level security;
revoke all on public.message_attachments from public,anon,authenticated;
grant select on public.message_attachments to authenticated;
create policy "Read participating attachments" on public.message_attachments for select to authenticated
 using(exists(select 1 from public.messages m join public.conversations c on c.id=m.conversation_id where m.id=message_id and (select auth.uid()) in(c.buyer_id,c.seller_id)));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('zuno-message-files','zuno-message-files',false,3145728,array['image/webp','application/pdf','text/plain','text/csv','application/zip','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
-- Narrow definer helper: callers can check only their own attachment eligibility.
create function public.can_attach_to_conversation(conversation_text text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.conversations c where c.id::text=conversation_text and auth.uid() in(c.buyer_id,c.seller_id) and not public.users_blocked(c.buyer_id,c.seller_id));
$$;
revoke all on function public.can_attach_to_conversation(text) from public,anon;
grant execute on function public.can_attach_to_conversation(text) to authenticated;
create policy "Upload own conversation attachment" on storage.objects for insert to authenticated with check(
 bucket_id='zuno-message-files' and split_part(name,'/',1)=auth.uid()::text
 and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}$'
 and public.can_attach_to_conversation(split_part(name,'/',2))
);
create policy "Read attached conversation file" on storage.objects for select to authenticated using(
 bucket_id='zuno-message-files' and (
 exists(select 1 from public.message_attachments a where a.storage_path=storage.objects.name)
 or (split_part(name,'/',1)=auth.uid()::text and exists(select 1 from public.conversations c where c.id::text=split_part(storage.objects.name,'/',2) and (select auth.uid()) in(c.buyer_id,c.seller_id)))
 )
);
create policy "Clean own unattached conversation file" on storage.objects for delete to authenticated using(
 bucket_id='zuno-message-files' and split_part(name,'/',1)=auth.uid()::text
 and not exists(select 1 from public.message_attachments a where a.storage_path=storage.objects.name)
);
create function public.send_message_attachments(p_conversation_id uuid,p_client_id uuid,p_body text,p_attachments jsonb) returns bigint
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); result bigint; item jsonb; ordinal integer:=0; total bigint:=0; chosen_body text;
begin
 if actor is null then raise exception 'Authentication required' using errcode='42501';end if;
 perform 1 from public.conversations c where c.id=p_conversation_id and actor in(c.buyer_id,c.seller_id) for update;
 if not found then raise exception 'Conversation unavailable' using errcode='42501';end if;
 if exists(select 1 from public.conversations c where c.id=p_conversation_id and public.users_blocked(c.buyer_id,c.seller_id)) then raise exception 'Messaging unavailable' using errcode='P0002';end if;
 if p_client_id is null or p_body is null or char_length(btrim(p_body))>2000 or jsonb_typeof(p_attachments) is distinct from 'array' or jsonb_array_length(p_attachments) not between 1 and 4 then raise exception 'Invalid attachments' using errcode='22023';end if;
 select id into result from public.messages where conversation_id=p_conversation_id and sender_id=actor and client_id=p_client_id;
 if found then return result;end if;
 for item in select value from jsonb_array_elements(p_attachments) loop
  if item->>'storage_path' is distinct from actor::text||'/'||p_conversation_id::text||'/'||(item->>'id') or char_length(item->>'name') not between 1 and 160 or item->>'name' is null then raise exception 'Invalid attachment path' using errcode='22023';end if;
  if not exists(select 1 from storage.objects o where o.bucket_id='zuno-message-files' and o.name=item->>'storage_path'
    and o.metadata->>'mimetype'=item->>'mime' and o.metadata->>'size'=item->>'size') then raise exception 'Attachment upload missing' using errcode='22023';end if;
  total:=total+(item->>'size')::integer;
 end loop;
 if total>3145728 then raise exception 'Attachments too large' using errcode='22023';end if;
 chosen_body:=btrim(p_body);
 if chosen_body !~ '[^[:space:]]' then chosen_body:=case when p_attachments->0->>'mime'='image/webp' then 'Photo' else left(p_attachments->0->>'name',160) end;end if;
 insert into public.messages(conversation_id,sender_id,client_id,body) values(p_conversation_id,actor,p_client_id,chosen_body) returning id into result;
 for item in select value from jsonb_array_elements(p_attachments) loop
  insert into public.message_attachments(id,message_id,storage_path,name,mime,size,sort_order)
  values((item->>'id')::uuid,result,item->>'storage_path',item->>'name',item->>'mime',(item->>'size')::integer,ordinal);
  ordinal:=ordinal+1;
 end loop;
 update public.conversations set last_message_at=now() where id=p_conversation_id;
 return result;
end $$;
revoke all on function public.send_message_attachments(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.send_message_attachments(uuid,uuid,text,jsonb) to authenticated;
commit;
