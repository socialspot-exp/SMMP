-- Global site branding & SEO (single row).

create table if not exists public.site_settings (
  id text primary key default 'default' check (id = 'default'),
  site_title text not null default 'Curator Market',
  site_tagline text,
  meta_description text,
  meta_keywords text,
  og_title text,
  og_description text,
  og_image_url text,
  twitter_site text,
  logo_url text,
  favicon_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values ('default')
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- Public read (storefront metadata, /api/site-settings).
create policy "site_settings_select_public"
  on public.site_settings for select
  to anon, authenticated
  using (true);

comment on table public.site_settings is 'Single-row app branding and SEO; updated via admin API (service role).';
