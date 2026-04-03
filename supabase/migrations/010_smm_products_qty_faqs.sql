-- Per-SKU order quantity bounds (e.g. panel min/max) and product-page FAQs.

alter table public.smm_products
  add column if not exists order_qty_min integer;

alter table public.smm_products
  add column if not exists order_qty_max integer;

alter table public.smm_products
  add column if not exists faqs jsonb not null default '[]'::jsonb;

comment on column public.smm_products.order_qty_min is 'Minimum order quantity for this SKU (e.g. panel service min); optional.';
comment on column public.smm_products.order_qty_max is 'Maximum order quantity for this SKU (e.g. panel service max); optional.';
comment on column public.smm_products.faqs is 'JSON array of { "q": string, "a": string } for the product page; empty = use defaults.';

-- Idempotent: re-run safe if columns/constraints already applied.
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public'
      and t.relname = 'smm_products'
      and c.conname = 'smm_products_order_qty_range'
  ) then
    alter table public.smm_products
      add constraint smm_products_order_qty_range check (
        order_qty_min is null
        or order_qty_max is null
        or order_qty_min <= order_qty_max
      );
  end if;
end $$;
