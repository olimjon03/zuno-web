begin;

-- The server removes physical files through the Storage API before deleting Auth.
create function public.get_account_storage_batch(p_user_id uuid)
returns table(bucket_id text, name text)
language sql stable security definer set search_path = ''
as $$
  select o.bucket_id, o.name
  from storage.objects o
  where o.owner_id = p_user_id::text
     or (
       o.bucket_id in ('zuno-avatars', 'zuno-listing-photos', 'zuno-message-files')
       and pg_catalog.split_part(o.name, '/', 1) = p_user_id::text
     )
  order by o.bucket_id, o.name
  limit 100;
$$;

revoke all on function public.get_account_storage_batch(uuid)
from public, anon, authenticated;
grant execute on function public.get_account_storage_batch(uuid) to service_role;

commit;
