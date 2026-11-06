begin;
-- Display-only metadata: never use these names for authorization or identity linking.
create or replace function public.zuno_initial_display_name(metadata jsonb, fallback_name text)
returns text language plpgsql immutable security invoker set search_path='' as $$
declare key text; candidate text;
begin
 foreach key in array array['display_name','full_name','name','nickname','preferred_username'] loop
  if jsonb_typeof(metadata->key)='string' then
   candidate:=left(btrim(regexp_replace(metadata->>key,'[[:cntrl:]]','','g')),40);
   if char_length(candidate)>=2 and candidate<>'Neighbor' then return candidate; end if;
  end if;
 end loop;
 candidate:=left(btrim(concat_ws(' ',
  case when jsonb_typeof(metadata->'given_name')='string' then metadata->>'given_name' end,
  case when jsonb_typeof(metadata->'family_name')='string' then metadata->>'family_name' end)),40);
 candidate:=btrim(regexp_replace(candidate,'[[:cntrl:]]','','g'));
 if char_length(candidate)>=2 then return candidate; end if;
 return fallback_name;
end $$;
revoke all on function public.zuno_initial_display_name(jsonb,text) from public,anon,authenticated;

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path='' as $$
declare chosen_name text; member_id bigint;
begin
 chosen_name:=public.zuno_initial_display_name(new.raw_user_meta_data,null);
 insert into public.profiles(id,display_name) values(new.id,coalesce(chosen_name,'Neighbor'))
 returning member_number into member_id;
 if chosen_name is null then
  update public.profiles set display_name='ZUNO #'||member_id::text where id=new.id;
 end if;
 return new;
end $$;
revoke all on function public.create_profile_for_new_user() from public,anon,authenticated;

-- Repair only the legacy placeholder, not names users have chosen themselves.
update public.profiles p set display_name=public.zuno_initial_display_name(u.raw_user_meta_data,'ZUNO #'||p.member_number::text)
from auth.users u where u.id=p.id and p.display_name='Neighbor';
-- These older surfaces store a name snapshot; replace only their placeholder names.
update public.listings l set seller_name=p.display_name from public.profiles p where l.seller_id=p.id and l.seller_name='Neighbor';
update public.conversations c set seller_name=p.display_name from public.profiles p where c.seller_id=p.id and c.seller_name='Neighbor';
update public.conversations c set buyer_name=p.display_name from public.profiles p where c.buyer_id=p.id and c.buyer_name='Neighbor';
commit;
