-- Make premium order IDs short/sequential (P-2321 style) + store submitted form data.

-- We already have `order_ref` as the human-friendly unique ID.
-- This migration:
-- 1) rewrites existing order_ref values to `P-<sequential>` (based on created_at)
-- 2) adds `submitted_form` jsonb so we can show what the user submitted on the product page
-- 3) sets a default for future inserts so new order_ref values stay short + sequential

create sequence if not exists public.premium_orders_order_ref_seq;

alter table public.premium_orders
  add column if not exists submitted_form jsonb not null default '{}'::jsonb;

-- Rewrite existing order refs to sequential short IDs.
with ranked as (
  select
    id,
    row_number() over (order by created_at asc) as rn
  from public.premium_orders
)
update public.premium_orders p
set order_ref = 'P-' || ranked.rn,
    updated_at = now()
from ranked
where p.id = ranked.id;

-- Sync sequence with current max `order_ref` numeric part.
select setval(
  'public.premium_orders_order_ref_seq',
  coalesce(
    (
      select max((regexp_replace(order_ref, '[^0-9]', '', 'g'))::bigint)
      from public.premium_orders
    ),
    0
  )
);

-- Future inserts: if API doesn't provide `order_ref`, it will be generated as short sequential.
alter table public.premium_orders
  alter column order_ref set default ('P-' || nextval('public.premium_orders_order_ref_seq')::text);

