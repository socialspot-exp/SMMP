-- Run in Supabase SQL Editor (Dashboard → SQL → New query)
-- One row per app user; `id` is the Clerk user id (e.g. user_2abc...).

create table if not exists public.profiles (
  id text primary key,
  email text,
  full_name text,
  username text,
  image_url text,
  primary_email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_lower_idx on public.profiles (lower(email));

alter table public.profiles enable row level security;

comment on table public.profiles is 'App users mirrored from Clerk (webhook + /api/profile/sync).';
