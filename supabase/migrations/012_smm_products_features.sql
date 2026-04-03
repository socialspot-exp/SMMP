-- Bullet features for SMM product pages (checkmark list + admin CRUD).
alter table public.smm_products
  add column if not exists features jsonb not null default '[]'::jsonb;

comment on column public.smm_products.features is 'Array of short marketing strings shown with checkmarks on the product page.';
