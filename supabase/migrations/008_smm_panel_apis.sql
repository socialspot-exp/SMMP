-- External SMM reseller / panel API credentials (Perfect Panel–style POST + JSON).
-- Read/write only via service role (admin Next.js API); no public RLS policies.

create table if not exists public.smm_panel_apis (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  api_url text not null,
  api_key text not null,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint smm_panel_apis_api_url_https check (api_url ~* '^https://')
);

create index if not exists smm_panel_apis_active_idx on public.smm_panel_apis (is_active);

comment on table public.smm_panel_apis is 'Reseller panel endpoints (e.g. Perfect Panel api/v2) for fulfilling SMM orders.';

alter table public.smm_panel_apis enable row level security;
