begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','country-owner@example.invalid','{}'),
 ('22222222-2222-4222-8222-222222222222','country-other@example.invalid','{}');
set local role anon;
do $$ begin begin perform public.set_marketplace_country('UZ',null);raise exception 'Anonymous country write allowed';exception when insufficient_privilege then null;end;end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.set_marketplace_country('UZ',null);
do $$ declare area bigint;begin
 if (select country_code from public.profiles where id=auth.uid())<>'UZ' then raise exception 'Country not saved';end if;
 select id into area from public.neighborhoods where region_code='UZ-NG' and district_code is not null limit 1;
 perform public.set_marketplace_country('UZ',area);
 if (select neighborhood_id from public.profiles where id=auth.uid())<>area then raise exception 'District not saved';end if;
 perform public.set_marketplace_country('UZ',null);
 if (select neighborhood_id from public.profiles where id=auth.uid())<>area then raise exception 'Same-country confirmation cleared district';end if;
 begin perform public.set_marketplace_country('KR',area);raise exception 'Cross-country district allowed';exception when invalid_parameter_value then null;end;
 begin perform public.set_marketplace_country('US',null);raise exception 'Unknown country allowed';exception when invalid_parameter_value then null;end;
 perform public.set_marketplace_country('KR',null);
 begin update public.profiles set neighborhood_id=area where id=auth.uid();raise exception 'Cross-country profile edit allowed';exception when invalid_parameter_value then null;end;
 if (select neighborhood_id from public.profiles where id=auth.uid()) is not null then raise exception 'Country switch retained old district';end if;

end $$;
reset role;
do $$ begin
 begin insert into public.listings(seller_id,title,description,price,condition,category_id,neighborhood_id) values(auth.uid(),'Country test','A test listing for country validation.',1,'good',1,(select id from public.neighborhoods where region_code='UZ-NG' and district_code is not null limit 1));raise exception 'Cross-country posting allowed';exception when invalid_parameter_value then null;end;
end $$;
do $$ begin if (select country_code from public.profiles where id='22222222-2222-4222-8222-222222222222') is not null then raise exception 'Other profile changed';end if;end $$;
-- Both the district code and its parent region must match the filter.
select * from public.search_listings_in_area(p_country=>'UZ',p_region=>'UZ-NG',p_district=>(select district_code from public.neighborhoods where region_code='UZ-NG' and district_code is not null limit 1));
do $$ begin begin perform * from public.search_listings_in_area(p_country=>'KR',p_region=>'KR-11',p_district=>(select district_code from public.neighborhoods where region_code='UZ-NG' and district_code is not null limit 1));raise exception 'Cross-parent search allowed';exception when invalid_parameter_value then null;end;end $$;
rollback;
