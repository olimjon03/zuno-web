begin;
drop policy if exists zuno_admin_reader_profiles on public.profiles;
drop policy if exists zuno_admin_reader_listings on public.listings;
drop policy if exists zuno_admin_reader_reports on public.listing_reports;
do $$
begin
 if exists(select 1 from pg_roles where rolname='zuno_admin_reader') then
  if exists(select 1 from pg_stat_activity where usename='zuno_admin_reader') then
   raise exception 'Reader role is active; stop and investigate';
  end if;
  revoke select(id,display_name,created_at) on public.profiles from zuno_admin_reader;
  revoke select(id,title,status) on public.listings from zuno_admin_reader;
  revoke select(id,listing_id,status) on public.listing_reports from zuno_admin_reader;
  execute format('revoke all privileges on database %I from zuno_admin_reader',current_database());
  revoke all privileges on schema public from zuno_admin_reader;
  revoke zuno_admin_reader from postgres;
  drop role zuno_admin_reader;
 end if;
end $$;
commit;
