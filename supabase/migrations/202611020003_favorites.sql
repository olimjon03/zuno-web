-- Apply after the first two marketplace migrations.
begin;
create table public.favorites (
 user_id uuid not null references auth.users(id) on delete cascade,
 listing_id uuid not null references public.listings(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key (user_id, listing_id)
);
alter table public.favorites enable row level security;
revoke all on public.favorites from public, anon, authenticated;
grant select, insert, delete on public.favorites to authenticated;
create policy "Read own favorites" on public.favorites for select to authenticated using ((select auth.uid()) = user_id);
create policy "Save visible listings" on public.favorites for insert to authenticated with check (
 (select auth.uid()) = user_id and exists (
 select 1 from public.listings l where l.id = listing_id and l.status in ('active','reserved','sold')
 ));
create policy "Remove own favorites" on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);
commit;
