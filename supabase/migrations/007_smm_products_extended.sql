-- SMM products: URL slug, long copy, and SEO fields for admin + storefront.

alter table public.smm_products
  add column if not exists slug text;

-- Backfill stable slugs from legacy id (S001 -> s001) before NOT NULL.
update public.smm_products
set slug = lower(id)
where slug is null or trim(slug) = '';

alter table public.smm_products
  alter column slug set not null;

alter table public.smm_products
  add constraint smm_products_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{0,100}$');

create unique index if not exists smm_products_slug_unique on public.smm_products (slug);

alter table public.smm_products
  add column if not exists long_description text;

alter table public.smm_products
  add column if not exists meta_title text;

alter table public.smm_products
  add column if not exists meta_description text;

alter table public.smm_products
  add column if not exists meta_keywords text;

alter table public.smm_products
  add column if not exists og_image_url text;

alter table public.smm_products
  add column if not exists robots text;

comment on column public.smm_products.slug is 'URL-safe slug; unique. Resolve /services/smm/[key] by id or slug.';
comment on column public.smm_products.long_description is 'Optional extended body HTML-safe plain text for product page.';
comment on column public.smm_products.meta_title is 'Override <title> / og:title when set.';
comment on column public.smm_products.meta_description is 'Meta description + og:description when set.';
comment on column public.smm_products.meta_keywords is 'Comma-separated keywords for meta keywords tag.';
comment on column public.smm_products.og_image_url is 'Open Graph / hero image URL when set.';
comment on column public.smm_products.robots is 'e.g. index,follow or noindex,nofollow; optional.';
