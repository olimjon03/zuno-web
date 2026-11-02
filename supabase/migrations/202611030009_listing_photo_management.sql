-- Apply after 008. Region-backed currency and atomic, owner-only photo editing.
begin;
alter table public.listing_images drop constraint listing_images_sort_order_check;
alter table public.listing_images add constraint listing_images_sort_order_check check (sort_order between 0 and 9);
-- Keep normalized storage objects bounded; originals are optimized on the device.
update public.neighborhoods set region_code='KR-11' where region_code is null and name in ('Seongsu-dong','Songjeong-dong','Seoul Forest','Ttukseom');
insert into public.neighborhoods(name,region_code) values
 ('Andijon viloyati', 'UZ-AN'),
 ('Buxoro viloyati', 'UZ-BU'),
 ('Farg‘ona viloyati', 'UZ-FA'),
 ('Jizzax viloyati', 'UZ-JI'),
 ('Namangan viloyati', 'UZ-NG'),
 ('Navoiy viloyati', 'UZ-NW'),
 ('Qashqadaryo viloyati', 'UZ-QA'),
 ('Samarqand viloyati', 'UZ-SA'),
 ('Sirdaryo viloyati', 'UZ-SI'),
 ('Surxondaryo viloyati', 'UZ-SU'),
 ('Toshkent viloyati', 'UZ-TO'),
 ('Xorazm viloyati', 'UZ-XO'),
 ('Qoraqalpog‘iston Respublikasi', 'UZ-QR'),
 ('Toshkent shahri', 'UZ-TK'),
 ('Seoul', 'KR-11'),
 ('Busan', 'KR-26'),
 ('Daegu', 'KR-27'),
 ('Incheon', 'KR-28'),
 ('Gwangju', 'KR-29'),
 ('Daejeon', 'KR-30'),
 ('Ulsan', 'KR-31'),
 ('Sejong', 'KR-50'),
 ('Gyeonggi-do', 'KR-41'),
 ('Gangwon Special Self-Governing Province', 'KR-42'),
 ('Chungcheongbuk-do', 'KR-43'),
 ('Chungcheongnam-do', 'KR-44'),
 ('Jeonbuk Special Self-Governing Province', 'KR-45'),
 ('Jeollanam-do', 'KR-46'),
 ('Gyeongsangbuk-do', 'KR-47'),
 ('Gyeongsangnam-do', 'KR-48'),
 ('Jeju Special Self-Governing Province', 'KR-49')
on conflict(name) do nothing;
create or replace function public.publish_listing(
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
 if p_image_paths is null or cardinality(p_image_paths) not between 1 and 10
 or array_position(p_image_paths, null) is not null
 or (select count(distinct value) from unnest(p_image_paths) value) <> cardinality(p_image_paths)
 then raise exception 'Choose one to ten unique photos'; end if;
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

create function public.replace_listing_photos(p_id uuid,p_expected uuid[],p_paths text[])
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();owner uuid;state text;current_ids uuid[];current_paths text[];path text;kept_ids uuid[];pos integer;
begin
 if actor is null then raise exception 'Authentication required' using errcode='42501';end if;
 select l.seller_id,l.status into owner,state from public.listings l where l.id=p_id for update;
 if owner is distinct from actor or state='removed' then raise exception 'Listing ownership required' using errcode='42501';end if;
 if p_paths is null or cardinality(p_paths) not between 1 and 10 or array_position(p_paths,null) is not null
 or (select count(distinct v) from unnest(p_paths) v)<>cardinality(p_paths) then raise exception 'Choose 1 to 10 unique photos';end if;
 select coalesce(array_agg(i.id order by i.sort_order),'{}'::uuid[]),coalesce(array_agg(i.storage_path order by i.sort_order),'{}'::text[])
 into current_ids,current_paths from public.listing_images i where i.listing_id=p_id;
 -- Retry after a lost response must not overwrite a later edit.
 if current_paths=p_paths then return;end if;
 if p_expected is distinct from current_ids then raise exception 'Photos changed; reload' using errcode='40001';end if;
 foreach path in array p_paths loop
  if path !~ ('^'||actor::text||'/'||p_id::text||'/[0-9a-f-]{36}\.webp$')
   or not exists(select 1 from storage.objects o where o.bucket_id='zuno-listing-photos' and o.name=path and o.owner_id=actor::text)
  then raise exception 'Photo ownership required' using errcode='42501';end if;
 end loop;
 -- Retain IDs of existing photos even when their order changes.
 select array_agg((select i.id from public.listing_images i where i.listing_id=p_id and i.storage_path=v.path) order by v.ordinality)
 into kept_ids from unnest(p_paths) with ordinality v(path,ordinality);
 delete from public.listing_images where listing_id=p_id;
 for pos in 1..cardinality(p_paths) loop
  insert into public.listing_images(id,listing_id,storage_path,sort_order) values(coalesce(kept_ids[pos],gen_random_uuid()),p_id,p_paths[pos],pos-1);
 end loop;
end $$;
revoke all on function public.replace_listing_photos(uuid,uuid[],text[]) from public,anon;
grant execute on function public.replace_listing_photos(uuid,uuid[],text[]) to authenticated;
commit;
