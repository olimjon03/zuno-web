-- Apply after all five previous migrations. Safe to run again.
begin;
do $$
declare target text;
begin
 if not exists(select 1 from pg_publication where pubname='supabase_realtime') then
  create publication supabase_realtime;
 end if;
 foreach target in array array['messages','message_reads'] loop
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=target) then
   execute format('alter publication supabase_realtime add table public.%I',target);
  end if;
 end loop;
end $$;
-- Existing SELECT grants and participant/owner RLS authorize every delivery.
-- No DELETE subscription or full replica identity is needed.
commit;
