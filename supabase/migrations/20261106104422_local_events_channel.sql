begin;
-- Local Events is now a projection of neighborhood posts, not a writable kind.
drop policy explore_posts_insert on public.explore_posts;
create policy explore_posts_insert on public.explore_posts for insert to authenticated with check (
 kind<>'local-events' and author_id=auth.uid() and neighborhood_id=(select neighborhood_id from public.profiles where id=auth.uid())
);
drop policy explore_posts_edit on public.explore_posts;
create policy explore_posts_edit on public.explore_posts for update to authenticated
using(author_id=auth.uid() and kind<>'local-events') with check(author_id=auth.uid() and kind<>'local-events');
drop policy explore_posts_delete on public.explore_posts;
create policy explore_posts_delete on public.explore_posts for delete to authenticated
using(author_id=auth.uid() and kind<>'local-events');
commit;
