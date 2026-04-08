-- SMM orders: start order_ref sequence at S-2320

-- Rewrite existing order_ref to sequential starting at S-2320
with ranked as (
  select
    id,
    row_number() over (order by created_at, id) as rn
  from public.smm_orders
)
update public.smm_orders
set order_ref = 'S-' || (2319 + ranked.rn)
from ranked
where public.smm_orders.id = ranked.id;

-- Sync sequence to current max order_ref numeric part
select setval(
  'public.smm_orders_order_ref_seq',
  coalesce(
    (
      select max((regexp_replace(order_ref, '[^0-9]', '', 'g'))::bigint)
      from public.smm_orders
    ),
    2319
  )
);
