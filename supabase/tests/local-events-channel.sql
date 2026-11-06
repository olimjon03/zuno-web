begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('a5000000-0000-4000-8000-000000000001','channel-author@example.invalid','{}'),
 ('a5000000-0000-4000-8000-000000000002','channel-reader@example.invalid','{}'),
 ('a5000000-0000-4000-8000-000000000003','channel-other@example.invalid','{}');
update public.profiles set neighborhood_id=(select id from public.neighborhoods where region_code like 'KR-%' and district_code is not null order by id limit 1)
where id in ('a5000000-0000-4000-8000-000000000001','a5000000-0000-4000-8000-000000000002');
update public.profiles set neighborhood_id=(select id from public.neighborhoods where region_code like 'KR-%' and district_code is not null order by id offset 1 limit 1)
where id='a5000000-0000-4000-8000-000000000003';
insert into public.explore_posts(author_id,kind,neighborhood_id,title,body)
select id,'neighborhood-posts',neighborhood_id,'Channel fixture','District isolation fixture.' from public.profiles
where id in ('a5000000-0000-4000-8000-000000000001','a5000000-0000-4000-8000-000000000003');
set local role authenticated;
set local request.jwt.claim.sub='a5000000-0000-4000-8000-000000000002';
do $$ begin
 if (select count(*) from public.explore_posts where title='Channel fixture' and kind='neighborhood-posts')<>1 then raise exception 'District isolation failed'; end if;
 begin
 insert into public.explore_posts(kind,neighborhood_id,title,body,starts_at)
 select 'local-events',neighborhood_id,'Forbidden event','Channel must be read-only.',now() from public.profiles where id=auth.uid();
 raise exception 'Writable Local Events accepted';
 exception when insufficient_privilege then null;
 end;
end $$;
rollback;
