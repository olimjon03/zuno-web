-- Disposable database only after the sixth migration. No live rows are written.
begin;
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages')
 or not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='message_reads')
 then raise exception 'Realtime publication tables missing';end if;
 if not (select relrowsecurity from pg_class where oid='public.messages'::regclass)
 or not (select relrowsecurity from pg_class where oid='public.message_reads'::regclass)
 then raise exception 'Realtime tables must retain RLS';end if;
 if has_table_privilege('anon','public.messages','SELECT') or has_table_privilege('anon','public.message_reads','SELECT')
 then raise exception 'Realtime publication must not grant anonymous reads';end if;
end $$;
rollback;
