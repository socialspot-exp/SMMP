-- Add API order id + quantity + panel linkage for SMM orders.

alter table public.smm_orders
  add column if not exists quantity integer not null default 1;

alter table public.smm_orders
  add column if not exists api_order_id text;

alter table public.smm_orders
  add column if not exists panel_api_id uuid references public.smm_panel_apis(id) on delete set null;

alter table public.smm_orders
  add column if not exists panel_service_id text;

alter table public.smm_orders
  add column if not exists api_status_payload jsonb not null default '{}'::jsonb;

create index if not exists smm_orders_api_order_id_idx on public.smm_orders (api_order_id);

comment on column public.smm_orders.api_order_id is 'External panel order id returned by action=add.';
comment on column public.smm_orders.api_status_payload is 'Last raw payload returned by panel action=status.';

