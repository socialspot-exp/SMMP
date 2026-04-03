-- Force premium order refs to start at P-1432.
-- Safe to run after 019.

-- Ensure sequence exists.
create sequence if not exists public.premium_orders_order_ref_seq;

-- If earlier migration created small refs (P-1, P-2, ...), remap them to P-(1431+rn)
-- based on created_at ordering, but only if the numeric part is < 1432.
with ranked as (
  select
    id,
    row_number() over (order by created_at asc) as rn,
    (regexp_replace(order_ref, '[^0-9]', '', 'g'))::bigint as n
  from public.premium_orders
)
update public.premium_orders p
set order_ref = 'P-' || (1431 + ranked.rn),
    updated_at = now()
from ranked
where p.id = ranked.id
  and ranked.n < 1432;

-- Bump sequence so next default is at least 1432 (or higher if data already exceeds).
select setval(
  'public.premium_orders_order_ref_seq',
  greatest(
    1431,
    coalesce(
      (
        select max((regexp_replace(order_ref, '[^0-9]', '', 'g'))::bigint)
        from public.premium_orders
      ),
      0
    )
  )
);

-- Keep default consistent.
alter table public.premium_orders
  alter column order_ref set default ('P-' || nextval('public.premium_orders_order_ref_seq')::text);

