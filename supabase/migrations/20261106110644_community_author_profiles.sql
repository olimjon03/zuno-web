begin;
create function public.get_community_authors(p_ids uuid[])
returns table(id uuid,display_name text,avatar_path text)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 if p_ids is null or cardinality(p_ids)>80 then raise exception 'Invalid author batch' using errcode='22023'; end if;
 return query select p.id,p.display_name,p.avatar_path from public.profiles p
 where p.id=any(p_ids) and (
 p.id=auth.uid() or (
  not public.users_blocked(auth.uid(),p.id) and exists(
   select 1 from public.explore_posts post
   where post.author_id=p.id and post.kind='neighborhood-posts'
   and post.neighborhood_id=(select current_profile.neighborhood_id from public.profiles current_profile where current_profile.id=auth.uid())
  )
 ));
end $$;
revoke all on function public.get_community_authors(uuid[]) from public,anon;
grant execute on function public.get_community_authors(uuid[]) to authenticated;
commit;
