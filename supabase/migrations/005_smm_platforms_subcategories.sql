-- SMM catalog taxonomy: platform (social network) → subcategories (followers, likes, …).
-- Icons use `icon_key` matching app SocialPlatformId (react-icons / SocialBrandIcon).

-- ---------------------------------------------------------------------------
-- Platforms (categories: Instagram, TikTok, …)
-- ---------------------------------------------------------------------------
create table if not exists public.smm_platforms (
  id uuid primary key default gen_random_uuid(),
  slug text not null
    constraint smm_platforms_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  label text not null,
  icon_key text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint smm_platforms_slug_unique unique (slug)
);

create index if not exists smm_platforms_active_sort_idx
  on public.smm_platforms (is_active, sort_order);

comment on table public.smm_platforms is 'SMM storefront platform categories (social networks).';

-- ---------------------------------------------------------------------------
-- Subcategories per platform (followers, likes, views, …)
-- ---------------------------------------------------------------------------
create table if not exists public.smm_subcategories (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.smm_platforms (id) on delete cascade,
  slug text not null
    constraint smm_subcategories_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint smm_subcategories_platform_slug_unique unique (platform_id, slug)
);

create index if not exists smm_subcategories_platform_idx on public.smm_subcategories (platform_id);
create index if not exists smm_subcategories_active_idx on public.smm_subcategories (platform_id) where is_active = true;

comment on table public.smm_subcategories is 'Engagement types under each SMM platform.';

-- ---------------------------------------------------------------------------
-- Link products to taxonomy (nullable for gradual migration)
-- ---------------------------------------------------------------------------
alter table public.smm_products
  add column if not exists platform_id uuid references public.smm_platforms (id) on delete set null;

alter table public.smm_products
  add column if not exists subcategory_id uuid references public.smm_subcategories (id) on delete set null;

create index if not exists smm_products_platform_id_idx on public.smm_products (platform_id);
create index if not exists smm_products_subcategory_id_idx on public.smm_products (subcategory_id);

-- ---------------------------------------------------------------------------
-- RLS: public read active rows; writes via service role (admin API)
-- ---------------------------------------------------------------------------
alter table public.smm_platforms enable row level security;
alter table public.smm_subcategories enable row level security;

create policy "smm_platforms_select_active"
  on public.smm_platforms for select
  using (is_active = true);

create policy "smm_subcategories_select_active"
  on public.smm_subcategories for select
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- Seed platforms (matches SocialPlatformId set used in app)
-- ---------------------------------------------------------------------------
insert into public.smm_platforms (slug, label, icon_key, sort_order) values
  ('instagram', 'Instagram', 'instagram', 10),
  ('tiktok', 'TikTok', 'tiktok', 20),
  ('facebook', 'Facebook', 'facebook', 30),
  ('youtube', 'YouTube', 'youtube', 40),
  ('spotify', 'Spotify', 'spotify', 50),
  ('x', 'X (Twitter)', 'x', 60),
  ('linkedin', 'LinkedIn', 'linkedin', 70),
  ('telegram', 'Telegram', 'telegram', 80),
  ('discord', 'Discord', 'discord', 90),
  ('threads', 'Threads', 'threads', 100),
  ('twitch', 'Twitch', 'twitch', 110),
  ('reddit', 'Reddit', 'reddit', 120),
  ('snapchat', 'Snapchat', 'snapchat', 130)
on conflict (slug) do update set
  label = excluded.label,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Subcategories from current smm_products (platform + category pairs)
insert into public.smm_subcategories (platform_id, slug, label, sort_order)
select distinct pl.id,
  p.category as slug,
  initcap(replace(p.category, '-', ' ')) as label,
  0
from public.smm_products p
join public.smm_platforms pl on pl.slug = p.platform
on conflict (platform_id, slug) do nothing;

-- Backfill FKs on products
update public.smm_products p
set platform_id = pl.id
from public.smm_platforms pl
where pl.slug = p.platform and p.platform_id is null;

update public.smm_products p
set subcategory_id = sc.id
from public.smm_subcategories sc
join public.smm_platforms pl on pl.id = sc.platform_id
where pl.slug = p.platform
  and sc.slug = p.category
  and p.subcategory_id is null;
