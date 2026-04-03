-- SMM orders (created from cart; fulfillment wiring later).

create sequence if not exists public.smm_orders_order_ref_seq;

create table if not exists public.smm_orders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  order_ref text not null unique default ('S-' || nextval('public.smm_orders_order_ref_seq')::text),

  smm_product_id text references public.smm_products(id) on delete set null,
  product_name text not null,
  platform text,

  target_url text not null,
  tier_id text,
  tier_summary text,
  price numeric(12,2) not null default 0,

  status text not null default 'Processing',
  submitted_form jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists smm_orders_user_created_idx
  on public.smm_orders (user_id, created_at desc);

alter table public.smm_orders enable row level security;

comment on table public.smm_orders is 'SMM service orders created from cart; fulfillment integrated later.';

