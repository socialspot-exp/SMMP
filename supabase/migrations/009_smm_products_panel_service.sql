-- Link storefront SMM SKUs to a reseller panel + external service id for order placement.

alter table public.smm_products
  add column if not exists panel_api_id uuid references public.smm_panel_apis (id) on delete set null;

alter table public.smm_products
  add column if not exists panel_service_id text;

comment on column public.smm_products.panel_api_id is 'Which smm_panel_apis row to call when submitting orders for this SKU.';
comment on column public.smm_products.panel_service_id is 'Panel API service id (e.g. Perfect Panel services[].service) as string.';

create index if not exists smm_products_panel_api_id_idx on public.smm_products (panel_api_id);
