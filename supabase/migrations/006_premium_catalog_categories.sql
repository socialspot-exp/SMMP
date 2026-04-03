-- Premium catalog: vertical (Streaming, Music, …) → subcategories (billing / offer type: monthly, yearly, …).
-- icon_key = premium catalog icon id (Lucide + brand icons; see app premium-catalog-icons.tsx).

-- ---------------------------------------------------------------------------
-- Top-level premium categories
-- ---------------------------------------------------------------------------
create table if not exists public.premium_catalog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null
    constraint premium_cat_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  label text not null,
  icon_key text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_catalog_categories_slug_unique unique (slug)
);

create index if not exists premium_catalog_categories_active_sort_idx
  on public.premium_catalog_categories (is_active, sort_order);

comment on table public.premium_catalog_categories is 'Premium storefront verticals (streaming, music, …).';

-- ---------------------------------------------------------------------------
-- Subcategories per vertical (e.g. monthly / yearly — aligned with product billing)
-- ---------------------------------------------------------------------------
create table if not exists public.premium_catalog_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.premium_catalog_categories (id) on delete cascade,
  slug text not null
    constraint premium_subcat_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_catalog_subcat_unique unique (category_id, slug)
);

create index if not exists premium_catalog_subcategories_cat_idx
  on public.premium_catalog_subcategories (category_id);

comment on table public.premium_catalog_subcategories is 'Offer types under each premium vertical (often maps to billing).';

-- ---------------------------------------------------------------------------
-- Optional FKs on products
-- ---------------------------------------------------------------------------
alter table public.premium_products
  add column if not exists catalog_category_id uuid references public.premium_catalog_categories (id) on delete set null;

alter table public.premium_products
  add column if not exists catalog_subcategory_id uuid references public.premium_catalog_subcategories (id) on delete set null;

create index if not exists premium_products_catalog_category_id_idx on public.premium_products (catalog_category_id);
create index if not exists premium_products_catalog_subcategory_id_idx on public.premium_products (catalog_subcategory_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.premium_catalog_categories enable row level security;
alter table public.premium_catalog_subcategories enable row level security;

create policy "premium_catalog_categories_select_active"
  on public.premium_catalog_categories for select
  using (is_active = true);

create policy "premium_catalog_subcategories_select_active"
  on public.premium_catalog_subcategories for select
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- Seed categories (matches app PremiumCategory + default Lucide icons)
-- ---------------------------------------------------------------------------
insert into public.premium_catalog_categories (slug, label, icon_key, sort_order) values
  ('streaming', 'Streaming', 'Tv', 10),
  ('music', 'Music', 'Music', 20),
  ('gaming', 'Gaming', 'Gamepad2', 30),
  ('productivity', 'Productivity', 'Briefcase', 40),
  ('vpn', 'VPN & tools', 'Shield', 50)
on conflict (slug) do update set
  label = excluded.label,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Subcategories from distinct (category, billing) on products
insert into public.premium_catalog_subcategories (category_id, slug, label, sort_order)
select distinct c.id,
  p.billing as slug,
  case p.billing
    when 'monthly' then 'Monthly'
    when 'yearly' then 'Yearly'
    when 'one-time' then 'One-time'
    else initcap(replace(p.billing, '-', ' '))
  end as label,
  case p.billing
    when 'monthly' then 10
    when 'yearly' then 20
    when 'one-time' then 30
    else 0
  end as sort_order
from public.premium_products p
join public.premium_catalog_categories c on c.slug = p.category
on conflict (category_id, slug) do nothing;

update public.premium_products p
set catalog_category_id = c.id
from public.premium_catalog_categories c
where c.slug = p.category and p.catalog_category_id is null;

update public.premium_products p
set catalog_subcategory_id = sc.id
from public.premium_catalog_subcategories sc
join public.premium_catalog_categories c on c.id = sc.category_id
where c.slug = p.category
  and sc.slug = p.billing
  and p.catalog_subcategory_id is null;
