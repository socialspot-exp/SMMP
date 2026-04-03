-- Payment gateways config + webhook event logs.

create table if not exists public.payment_gateways (
  gateway_key text primary key,
  display_name text not null,
  is_enabled boolean not null default false,
  credentials jsonb not null default '{}'::jsonb,
  webhook_secret text,
  webhook_url text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  gateway_key text not null references public.payment_gateways(gateway_key) on delete cascade,
  event_id text,
  event_type text,
  status text,
  amount numeric(12,2),
  currency text,
  order_ref text,
  payload jsonb not null,
  signature_header text,
  received_at timestamptz not null default now()
);

create index if not exists payment_events_gateway_received_idx
  on public.payment_events(gateway_key, received_at desc);

insert into public.payment_gateways (gateway_key, display_name, is_enabled)
values
  ('paytm', 'Paytm', false),
  ('razorpay', 'Razorpay', false),
  ('cryptomus', 'Cryptomus', false),
  ('cashfree', 'Cashfree', false)
on conflict (gateway_key) do update
set display_name = excluded.display_name;

alter table public.payment_gateways enable row level security;
alter table public.payment_events enable row level security;

comment on table public.payment_gateways is 'Admin-managed gateway settings (credentials + enable/disable).';
comment on table public.payment_events is 'Webhook events from payment providers for reconciliation and status tracking.';

