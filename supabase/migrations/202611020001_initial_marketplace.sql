-- Apply once to the new ZUNO project using Supabase SQL Editor or CLI migrations.
-- No exact addresses, email addresses or GPS coordinates are stored in public tables.
begin;

create table public.neighborhoods (
  id bigint generated always as identity primary key,
  name text not null unique check (char_length(name) between 1 and 100),
  region_code text
);
create table public.categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_en text not null,
  name_ko text not null,
  sort_order integer not null default 0
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Neighbor' check (char_length(display_name) between 2 and 40),
  language text not null default 'en' check (language in ('en', 'ko')),
  neighborhood_id bigint references public.neighborhoods(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id bigint not null references public.categories(id),
  neighborhood_id bigint not null references public.neighborhoods(id),
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 5000),
  price bigint not null check (price between 0 and 1000000000000),
  condition text not null check (condition in ('like_new', 'good', 'used')),
  status text not null default 'active' check (status in ('active', 'reserved', 'sold', 'removed')),
  created_at timestamptz not null default now()
);
create index listings_seller_idx on public.listings(seller_id);
create index listings_feed_idx on public.listings(neighborhood_id, category_id, status, created_at desc);

alter table public.neighborhoods enable row level security;
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;

revoke all on public.neighborhoods, public.categories, public.profiles, public.listings from public, anon, authenticated;
grant select on public.neighborhoods, public.categories to anon, authenticated;
grant select, insert, delete on public.profiles to authenticated;
grant update (display_name, language, neighborhood_id) on public.profiles to authenticated;
grant select on public.listings to anon, authenticated;
grant insert, delete on public.listings to authenticated;
grant update (category_id, neighborhood_id, title, description, price, condition, status) on public.listings to authenticated;

create policy "Read neighborhoods" on public.neighborhoods for select to anon, authenticated using (true);
create policy "Read categories" on public.categories for select to anon, authenticated using (true);
create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Create own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- Account/profile deletion is reserved for a future server-controlled workflow.
revoke delete on public.profiles from authenticated;
create policy "Browse visible listings or own listings" on public.listings for select to anon, authenticated using (status in ('active', 'reserved', 'sold') or (select auth.uid()) = seller_id);
create policy "Create own listing" on public.listings for insert to authenticated with check ((select auth.uid()) = seller_id);
create policy "Update own listing" on public.listings for update to authenticated using ((select auth.uid()) = seller_id) with check ((select auth.uid()) = seller_id);
create policy "Delete own listing" on public.listings for delete to authenticated using ((select auth.uid()) = seller_id);

create function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  chosen_name text := pg_catalog.left(pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'display_name', 'Neighbor')), 40);
begin
  if pg_catalog.char_length(chosen_name) < 2 then chosen_name := 'Neighbor'; end if;
  insert into public.profiles (id, display_name) values (new.id, chosen_name);
  return new;
end;
$$;
revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;
create trigger on_zuno_auth_user_created after insert on auth.users for each row execute procedure public.create_profile_for_new_user();

-- Backfill accounts created before this migration without changing existing profiles.
insert into public.profiles (id, display_name)
select id, case when char_length(btrim(coalesce(raw_user_meta_data ->> 'display_name', ''))) >= 2
  then left(btrim(raw_user_meta_data ->> 'display_name'), 40) else 'Neighbor' end
from auth.users on conflict (id) do nothing;

insert into public.categories (slug, name_en, name_ko, sort_order) values
 ('electronics', 'Electronics', '디지털기기', 1),
 ('home-living', 'Home & Living', '가구·생활', 2),
 ('fashion', 'Fashion', '패션', 3),
 ('sports', 'Sports', '스포츠', 4),
 ('books', 'Books', '도서', 5),
 ('other', 'Other', '기타', 6);
-- Initial browsing labels only; selection does not verify a user's location.
insert into public.neighborhoods (name) values ('Seongsu-dong'), ('Songjeong-dong'), ('Seoul Forest'), ('Ttukseom');
commit;
