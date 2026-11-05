do $$
begin
 if exists (
  select 1 from pg_constraint c
  where c.contype='f' and c.connamespace='public'::regnamespace
  and not exists (
   select 1 from pg_index i where i.indrelid=c.conrelid
    and i.indisvalid and i.indpred is null
    and (i.indkey::smallint[])[0:cardinality(c.conkey)-1] @> c.conkey
  )
 ) then raise exception 'Public foreign key lacks a covering index'; end if;
end $$;
