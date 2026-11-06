begin;
alter table public.listings add column meeting_lat double precision, add column meeting_lng double precision;
alter table public.listings add constraint listings_meeting_point_valid check (
 (meeting_lat is null and meeting_lng is null) or
 (meeting_lat is not null and meeting_lng is not null and meeting_lat between -90 and 90 and meeting_lng between -180 and 180)
);
create function public.publish_listing_with_location(
 p_id uuid,p_title text,p_description text,p_price bigint,p_condition text,
 p_category_id bigint,p_neighborhood_id bigint,p_image_paths text[],p_seller_name text,
 p_meeting_lat double precision default null,p_meeting_lng double precision default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; existed boolean;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if (p_meeting_lat is null)<>(p_meeting_lng is null)
 or (p_meeting_lat is not null and not(p_meeting_lat between -90 and 90))
 or (p_meeting_lng is not null and not(p_meeting_lng between -180 and 180))
 then raise exception 'Invalid meeting location' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select exists(select 1 from public.listings where id=p_id) into existed;
 result:=public.publish_listing(p_id,p_title,p_description,p_price,p_condition,p_category_id,p_neighborhood_id,p_image_paths,p_seller_name);
 if not existed then
  update public.listings set meeting_lat=p_meeting_lat,meeting_lng=p_meeting_lng where id=result and seller_id=auth.uid();
 end if;
 return result;
end $$;
revoke all on function public.publish_listing_with_location(uuid,text,text,bigint,text,bigint,bigint,text[],text,double precision,double precision) from public,anon;
grant execute on function public.publish_listing_with_location(uuid,text,text,bigint,text,bigint,bigint,text[],text,double precision,double precision) to authenticated;
commit;
