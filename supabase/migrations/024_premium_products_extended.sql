-- Premium products: storefront packages, SEO, FAQs, features, icon (SMM-aligned fields).

alter table public.premium_products
  add column if not exists slug text;

alter table public.premium_products
  add column if not exists long_description text;

alter table public.premium_products
  add column if not exists meta_title text;

alter table public.premium_products
  add column if not exists meta_description text;

alter table public.premium_products
  add column if not exists meta_keywords text;

alter table public.premium_products
  add column if not exists og_image_url text;

alter table public.premium_products
  add column if not exists robots text;

alter table public.premium_products
  add column if not exists checkout_field_label text;

alter table public.premium_products
  add column if not exists icon_key text;

alter table public.premium_products
  add column if not exists faqs jsonb not null default '[]'::jsonb;

alter table public.premium_products
  add column if not exists features text[] not null default '{}'::text[];

alter table public.premium_products
  add column if not exists quantity_options jsonb not null default '[]'::jsonb;

create unique index if not exists premium_products_slug_unique
  on public.premium_products (lower(slug))
  where slug is not null and length(trim(slug)) > 0;

comment on column public.premium_products.slug is 'Optional URL slug for SEO; product page still uses id (P###).';
comment on column public.premium_products.quantity_options is 'Custom plan rows for product page; empty = billing-based default plans.';
comment on column public.premium_products.icon_key is 'PremiumCatalogIconKey for storefront mark; falls back to category icon.';
