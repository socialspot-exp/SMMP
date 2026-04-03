-- Numeric app user number (1, 2, 3, …). `id` stays Clerk user id for auth joins.
-- Username: unique, derived from email local-part in app sync (e.g. xyz@gmail.com → xyz).

create sequence if not exists public.profiles_user_no_seq;

alter table public.profiles add column if not exists user_no bigint;

update public.profiles
set user_no = nextval('public.profiles_user_no_seq')
where user_no is null;

alter table public.profiles
  alter column user_no set default nextval('public.profiles_user_no_seq');

alter table public.profiles
  alter column user_no set not null;

create unique index if not exists profiles_user_no_uidx on public.profiles (user_no);

alter sequence public.profiles_user_no_seq owned by public.profiles.user_no;

select setval(
  'public.profiles_user_no_seq',
  coalesce((select max(user_no) from public.profiles), 0)
);

-- Case-insensitive username uniqueness (stored lowercase from app).
create unique index if not exists profiles_username_lower_uidx
  on public.profiles (lower(username))
  where username is not null;
