begin;
alter table public.profiles add column avatar_path text;
alter table public.profiles add constraint profile_avatar_owned check (avatar_path is null or avatar_path ~ ('^' || id::text || '/[0-9a-f-]{36}\.webp$'));
grant update (avatar_path) on public.profiles to authenticated;
-- Public identity is deliberately projected through a function, not profiles SELECT.
create function public.get_public_profile(profile_id uuid)
returns table(id uuid, display_name text, neighborhood text, avatar_path text)
language sql stable security definer set search_path = '' as $$
 select p.id,p.display_name,n.name,p.avatar_path from public.profiles p
 left join public.neighborhoods n on n.id=p.neighborhood_id where p.id=profile_id;
$$;
revoke all on function public.get_public_profile(uuid) from public;
grant execute on function public.get_public_profile(uuid) to anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('zuno-avatars','zuno-avatars',true,3145728,array['image/webp']);
create policy avatar_owner_insert on storage.objects for insert to authenticated
with check(bucket_id='zuno-avatars' and split_part(name,'/',1)=auth.uid()::text and name ~ ('^' || auth.uid()::text || '/[0-9a-f-]{36}\.webp$'));
create policy avatar_owner_select on storage.objects for select to authenticated
using(bucket_id='zuno-avatars' and split_part(name,'/',1)=auth.uid()::text);
create policy avatar_owner_delete on storage.objects for delete to authenticated
using(bucket_id='zuno-avatars' and split_part(name,'/',1)=auth.uid()::text);
commit;
