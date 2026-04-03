-- Premium account orders + admin-provided credentials + per-order notifications.

-- One row per premium purchase/order.
create table if not exists public.premium_orders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  order_ref text not null unique, -- human readable (e.g. P-2201)

  -- Premium products are keyed by `text` SKUs (P###), not UUIDs.
  premium_product_id text references public.premium_products(id) on delete set null,
  product_name text not null,

  delivery_email text not null,
  vip boolean not null default false,
  price text,

  status text not null default 'Provisioning',
  detail text,

  credentials_state text not null default 'pending'
    check (credentials_state in ('pending', 'sent', 'failed')),
  credentials_provided_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists premium_orders_user_id_created_at_idx
  on public.premium_orders (user_id, created_at desc);

-- Admin-provided credential payload (structured key/value map).
-- We keep one "current" credentials record per order (edit = update row).
create table if not exists public.premium_order_credentials (
  order_id uuid primary key references public.premium_orders(id) on delete cascade,
  credentials jsonb not null default '{}'::jsonb,
  provided_by_id text, -- clerk id of the admin who provided it
  provided_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- In-app notifications for orders (e.g. "credentials are ready").
create table if not exists public.premium_order_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.premium_orders(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,

  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists premium_order_notifications_user_unread_idx
  on public.premium_order_notifications (user_id, type, is_read, created_at desc);

create index if not exists premium_order_notifications_order_idx
  on public.premium_order_notifications (order_id, created_at desc);

alter table public.premium_orders enable row level security;
alter table public.premium_order_credentials enable row level security;
alter table public.premium_order_notifications enable row level security;

comment on table public.premium_orders is 'Premium account orders; admin provides credentials.';
comment on table public.premium_order_credentials is 'Admin-provided credentials payload per premium order.';
comment on table public.premium_order_notifications is 'Per-order notifications (credentials ready, etc.).';

