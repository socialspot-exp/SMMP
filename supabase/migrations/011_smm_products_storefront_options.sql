-- Admin-defined package tiers on the product page + custom label for the checkout link field.

alter table public.smm_products
  add column if not exists quantity_options jsonb not null default '[]'::jsonb;

alter table public.smm_products
  add column if not exists checkout_field_label text;

comment on column public.smm_products.quantity_options is
  'JSON array of { "qty": number, "price": number, "badge"?, "subtitle"?, "compareAt"?, "popular"? }. Empty = use category-based defaults on storefront.';
comment on column public.smm_products.checkout_field_label is
  'Overrides the profile/link field label on the product page (e.g. YouTube channel URL). Null = platform default text.';
