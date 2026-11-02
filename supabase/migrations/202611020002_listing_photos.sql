-- Run after 202611020001_initial_marketplace.sql.
begin;
alter table public.listings add column seller_name text not null default 'Neighbor' check (char_length(seller_name) between 2 and 40);
create table public.listing_images (
 id uuid primary key default gen_random_uuid(),
 listing_id uuid not null references public.listings(id) on delete cascade,
 storage_path text not null unique,
 sort_order integer not null check (sort_order between 0 and 2),
 unique (listing_id, sort_order)
);
create index listing_images_listing_idx on public.listing_images(listing_id);
alter table public.listing_images enable row level security;
revoke all on public.listing_images from public, anon, authenticated;
grant select on public.listing_images to anon, authenticated;
create policy "Read visible listing photos" on public.listing_images for select to anon, authenticated
 using (exists (select 1 from public.listings l where l.id = listing_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
 values ('zuno-listing-photos', 'zuno-listing-photos', false, 2097152, array['image/webp'])
 on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Upload own listing photos" on storage.objects for insert to authenticated with check (
 bucket_id = 'zuno-listing-photos' and owner_id = (select auth.uid()::text)
 and name ~ ('^' || (select auth.uid()::text) || '/[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$')
);
create policy "Read own uploaded photos" on storage.objects for select to authenticated using (
 bucket_id = 'zuno-listing-photos' and owner_id = (select auth.uid()::text)
 and split_part(name, '/', 1) = (select auth.uid()::text)
);
create policy "Read published listing photos" on storage.objects for select to anon, authenticated using (
 bucket_id = 'zuno-listing-photos' and exists (
  select 1 from public.listing_images i join public.listings l on l.id = i.listing_id
  where i.storage_path = name and l.status in ('active', 'reserved', 'sold')
 )
);
create policy "Clean own unattached photos" on storage.objects for delete to authenticated using (
 bucket_id = 'zuno-listing-photos' and owner_id = (select auth.uid()::text)
 and split_part(name, '/', 1) = (select auth.uid()::text)
 and not exists (select 1 from public.listing_images i where i.storage_path = name)
);

-- Publishing is atomic and accepts only uploaded, owned photos for this listing.
-- Direct client inserts are replaced by this tightly scoped RPC.
revoke insert on public.listings from authenticated;
create function public.publish_listing(
 p_id uuid, p_title text, p_description text, p_price bigint, p_condition text,
 p_category_id bigint, p_neighborhood_id bigint, p_image_paths text[], p_seller_name text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
 actor uuid := auth.uid();
 path text;
 position integer := 0;
 existing_owner uuid;
begin
 if actor is null then raise exception 'Authentication required' using errcode = '42501'; end if;
 select seller_id into existing_owner from public.listings where id = p_id;
 if found then
  if existing_owner = actor then return p_id; end if;
  raise exception 'Listing ID unavailable' using errcode = '42501';
 end if;
 if p_image_paths is null or cardinality(p_image_paths) not between 1 and 3
 or array_position(p_image_paths, null) is not null
 or (select count(distinct value) from unnest(p_image_paths) value) <> cardinality(p_image_paths)
 then raise exception 'Choose one to three unique photos'; end if;
 foreach path in array p_image_paths loop
  if path !~ ('^' || actor::text || '/' || p_id::text || '/[0-9a-f-]{36}\.webp$')
   or not exists (select 1 from storage.objects o where o.bucket_id = 'zuno-listing-photos' and o.name = path and o.owner_id = actor::text)
  then raise exception 'Photo ownership required' using errcode = '42501'; end if;
 end loop;
 insert into public.listings (id, seller_id, title, description, price, condition, category_id, neighborhood_id, seller_name)
 values (p_id, actor, btrim(p_title), btrim(p_description), p_price, p_condition, p_category_id, p_neighborhood_id, coalesce(nullif(left(btrim(p_seller_name), 40), ''), 'Neighbor'));
 foreach path in array p_image_paths loop
  insert into public.listing_images (listing_id, storage_path, sort_order) values (p_id, path, position);
  position := position + 1;
 end loop;
 return p_id;
end;
$$;
revoke all on function public.publish_listing(uuid,text,text,bigint,text,bigint,bigint,text[],text) from public, anon;
grant execute on function public.publish_listing(uuid,text,text,bigint,text,bigint,bigint,text[],text) to authenticated;
commit;
