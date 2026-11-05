begin;

alter table public.profiles
  add column member_number bigint generated always as identity (start with 100001),
  add constraint profiles_member_number_unique unique (member_number);

commit;
