-- Store premium order credentials in an ordered list (preserves admin input order).

alter table public.premium_order_credentials
  add column if not exists credentials_items jsonb not null default '[]'::jsonb;

comment on column public.premium_order_credentials.credentials_items is
  'Ordered credential pairs: [{key,value}] in the exact sequence admin entered.';

