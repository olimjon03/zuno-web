begin;
create index listings_public_newest_idx on public.listings(created_at desc,id desc) where status in ('active','reserved','sold');
create index listings_public_price_idx on public.listings(price,created_at desc,id desc) where status in ('active','reserved','sold');
create function public.search_listings(
 p_query text default '',p_category text default null,p_country text default null,p_region text default null,
 p_min_price bigint default null,p_max_price bigint default null,p_available_only boolean default false,
 p_sort text default 'newest',p_limit integer default 25,
 p_after_id uuid default null,p_after_created timestamptz default null,p_after_price bigint default null
) returns table(
 id uuid,seller_id uuid,title text,description text,price bigint,condition text,seller_name text,
 created_at timestamptz,status text,category jsonb,neighborhood jsonb,photos jsonb
) language plpgsql stable security invoker set search_path='' as $$
begin
 if p_query is null or char_length(p_query)>100 or char_length(p_category)>60 or char_length(p_region)>8 or p_sort is null or p_sort not in ('newest','price-asc','price-desc')
 or p_limit is null or p_limit not between 1 and 25 or p_available_only is null
 or (p_country is not null and p_country not in ('UZ','KR'))
 or (p_country is null and (p_region is not null or p_min_price is not null or p_max_price is not null or p_sort<>'newest'))
 or (p_region is not null and left(p_region,3)<>p_country||'-')
 or (p_min_price is not null and p_min_price not between 0 and 1000000000000)
 or (p_max_price is not null and p_max_price not between 0 and 1000000000000)
 or (p_min_price is not null and p_max_price is not null and p_min_price>p_max_price)
 or (num_nonnulls(p_after_id,p_after_created,p_after_price) not in (0,3))
 or (p_after_price is not null and p_after_price not between 0 and 1000000000000)
 then raise exception 'Invalid marketplace filters' using errcode='22023';end if;
 return query
 select l.id,l.seller_id,l.title,l.description,l.price,l.condition,l.seller_name,l.created_at,l.status,
 jsonb_build_object('name_en',c.name_en),jsonb_build_object('name',n.name,'region_code',area.code),
 coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'sort_order',i.sort_order) order by i.sort_order) from public.listing_images i where i.listing_id=l.id),'[]'::jsonb)
 from public.listings l join public.categories c on c.id=l.category_id join public.neighborhoods n on n.id=l.neighborhood_id
 cross join lateral(select case when n.region_code is null and n.name in ('Seongsu-dong','Songjeong-dong','Seoul Forest','Ttukseom') then 'KR-11' else n.region_code end as code) area
 where l.status in ('active','reserved','sold')
 and (not p_available_only or l.status='active')
 and (p_category is null or c.name_en=p_category)
 and (p_country is null or left(area.code,3)=p_country||'-')
 and (p_region is null or area.code=p_region)
 and (p_min_price is null or l.price>=p_min_price)
 and (p_max_price is null or l.price<=p_max_price)
 -- Literal substring search: %, _, quotes and Unicode are text, never SQL syntax.
 and (p_query='' or strpos(lower(l.title||' '||l.description||' '||n.name||' '||c.name_en),lower(p_query))>0)
 and (p_after_id is null
  or (p_sort='newest' and (l.created_at,l.id)<(p_after_created,p_after_id))
  or (p_sort='price-asc' and (l.price>p_after_price or (l.price=p_after_price and (l.created_at,l.id)<(p_after_created,p_after_id))))
  or (p_sort='price-desc' and (l.price<p_after_price or (l.price=p_after_price and (l.created_at,l.id)<(p_after_created,p_after_id)))))
 order by case when p_sort='price-asc' then l.price end asc,
 case when p_sort='price-desc' then l.price end desc,l.created_at desc,l.id desc limit p_limit;
end $$;
revoke all on function public.search_listings(text,text,text,text,bigint,bigint,boolean,text,integer,uuid,timestamptz,bigint) from public;
grant execute on function public.search_listings(text,text,text,text,bigint,bigint,boolean,text,integer,uuid,timestamptz,bigint) to anon,authenticated;
commit;
