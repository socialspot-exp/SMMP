-- If you already ran the old 001 without username/image_url/primary_email_verified, run this once.

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists image_url text;
alter table public.profiles add column if not exists primary_email_verified boolean not null default false;

create index if not exists profiles_email_lower_idx on public.profiles (lower(email));
