-- Add role column to profiles: 'user' (default) or 'admin'

alter table public.profiles
  add column if not exists role text not null default 'user';

comment on column public.profiles.role is 'User role: "user" or "admin"';

-- Create index for admin queries
create index if not exists profiles_role_idx on public.profiles (role);
