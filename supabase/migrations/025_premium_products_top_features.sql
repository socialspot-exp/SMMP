-- Premium products: Top Features (icon + title + description)

alter table public.premium_products
  add column if not exists top_features jsonb not null default '[]'::jsonb;

comment on column public.premium_products.top_features is
  'Admin-defined “Top Features” displayed on the premium product page. JSON array of { icon_key, title, description }.';

