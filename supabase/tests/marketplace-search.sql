begin;
insert into auth.users(id,raw_user_meta_data) values('11111111-1111-4111-8111-111111111111','{"display_name":"Search seller"}');
insert into public.listings(id,seller_id,category_id,neighborhood_id,title,description,price,condition,status,created_at)
select (lpad(i::text,8,'0')||'-1111-4111-8111-111111111111')::uuid,'11111111-1111-4111-8111-111111111111',1,(select id from public.neighborhoods where region_code='UZ-TK' limit 1),
'Search test '||lpad(i::text,3,'0'),'Unique searchable description', (i%5)*100,'good',case when i%10=0 then 'reserved' else 'active' end,'2026-01-01T12:00:00.123456Z'::timestamptz
from generate_series(1,80) i;
insert into public.listings(seller_id,category_id,neighborhood_id,title,description,price,condition,status) values
('11111111-1111-4111-8111-111111111111',1,1,'카메라 Korea','A Korean camera for testing',100,'good','active'),
('11111111-1111-4111-8111-111111111111',2,1,'Discount 50% _ literal','Public special character listing',0,'good','sold'),
('11111111-1111-4111-8111-111111111111',1,1,'Private removed secret','Must not appear in search results',100,'good','removed');
set local role anon;
do $$declare s text;row record;ids uuid[];after_id uuid;after_created timestamptz;after_price bigint;batch integer;previous_price bigint;begin
 if (select count(*) from public.search_listings(p_query=>'Search test 001'))<>1 then raise exception 'Search misses items beyond first 60';end if;
 if (select count(*) from public.search_listings(p_query=>'카메라',p_country=>'KR'))<>1 then raise exception 'Unicode search failed';end if;
 if (select count(*) from public.search_listings(p_query=>'%'))<>1 then raise exception 'Percent treated as wildcard';end if;
 if (select count(*) from public.search_listings(p_query=>'_'))<>1 then raise exception 'Underscore treated as wildcard';end if;
 if exists(select 1 from public.search_listings(p_query=>$needle$' OR 1=1--$needle$)) then raise exception 'Search syntax escaped incorrectly';end if;
 if exists(select 1 from public.search_listings(p_query=>'Private removed')) then raise exception 'Removed item leaked';end if;
 if (select count(*) from public.search_listings(p_query=>'Search test',p_country=>'UZ',p_region=>'UZ-TK',p_category=>'Electronics',p_min_price=>100,p_max_price=>300,p_available_only=>true))<>25 then raise exception 'Combined filter first page incorrect';end if;
 if exists(select 1 from public.search_listings(p_query=>'Search test',p_category=>'Home & Living')) then raise exception 'Category filtering failed';end if;
 if exists(select 1 from public.search_listings(p_query=>'Search test',p_country=>'UZ',p_region=>'UZ-SA')) then raise exception 'Region filtering failed';end if;
 if exists(select 1 from public.search_listings(p_query=>'Search test',p_available_only=>true) where status<>'active') then raise exception 'Availability filtering failed';end if;
 if exists(select 1 from public.search_listings(p_query=>'Search test',p_country=>'KR')) then raise exception 'Country filtering failed';end if;
 foreach s in array array['newest','price-asc','price-desc'] loop
  ids:='{}';after_id:=null;after_created:=null;after_price:=null;previous_price:=null;
  loop
   batch:=0;
   for row in select * from public.search_listings(p_query=>'Search test',p_country=>'UZ',p_sort=>s,p_limit=>24,p_after_id=>after_id,p_after_created=>after_created,p_after_price=>after_price) loop
    if row.id=any(ids) then raise exception 'Duplicate page item';end if;
    if previous_price is not null and ((s='price-asc' and row.price<previous_price) or (s='price-desc' and row.price>previous_price)) then raise exception 'Price sort incorrect';end if;
    ids:=array_append(ids,row.id);batch:=batch+1;after_id:=row.id;after_created:=row.created_at;after_price:=row.price;previous_price:=row.price;
   end loop;
   exit when batch<24;
   if cardinality(ids)>100 then raise exception 'Cursor did not advance';end if;
  end loop;
  if cardinality(ids)<>80 then raise exception 'Missing items across tied pages: % %',s,cardinality(ids);end if;
 end loop;
 begin perform public.search_listings(p_sort=>'price-asc');raise exception 'Mixed currency price sort allowed';exception when invalid_parameter_value then null;end;
 begin perform public.search_listings(p_limit=>26);raise exception 'Unbounded page allowed';exception when invalid_parameter_value then null;end;
 begin perform public.search_listings(p_after_id=>'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');raise exception 'Incomplete cursor allowed';exception when invalid_parameter_value then null;end;
 begin perform public.search_listings(p_query=>repeat('x',101));raise exception 'Long search allowed';exception when invalid_parameter_value then null;end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$begin
 if exists(select 1 from public.search_listings(p_query=>'Private removed')) then raise exception 'Owner feed leaks removed item';end if;
end $$;
rollback;
