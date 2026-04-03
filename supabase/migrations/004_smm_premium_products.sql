-- Catalog: SMM and Premium products (storefront SKUs).
-- Public IDs: S### (SMM), P### (Premium). Kept in sync with app seed in src/lib/services-data.ts.

-- ---------------------------------------------------------------------------
-- SMM products
-- ---------------------------------------------------------------------------
create table if not exists public.smm_products (
  id text primary key
    constraint smm_products_id_format check (id ~ '^S[0-9]{3}$'),
  name text not null,
  description text not null,
  platform text not null,
  category text not null,
  price_from numeric(12, 2) not null check (price_from >= 0),
  duration text not null,
  featured boolean not null default false,
  rating numeric(3, 1) not null check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  top_review text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists smm_products_platform_idx on public.smm_products (platform);
create index if not exists smm_products_category_idx on public.smm_products (category);
create index if not exists smm_products_featured_idx on public.smm_products (featured) where featured = true;

comment on table public.smm_products is 'SMM service catalog (social growth SKUs).';

-- ---------------------------------------------------------------------------
-- Premium products
-- ---------------------------------------------------------------------------
create table if not exists public.premium_products (
  id text primary key
    constraint premium_products_id_format check (id ~ '^P[0-9]{3}$'),
  name text not null,
  description text not null,
  category text not null,
  billing text not null,
  brand_id text not null,
  price_from numeric(12, 2) not null check (price_from >= 0),
  featured boolean not null default false,
  rating numeric(3, 1) not null check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  top_review text,
  seats text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists premium_products_category_idx on public.premium_products (category);
create index if not exists premium_products_brand_id_idx on public.premium_products (brand_id);
create index if not exists premium_products_featured_idx on public.premium_products (featured) where featured = true;

comment on table public.premium_products is 'Premium accounts / subscriptions catalog.';

-- ---------------------------------------------------------------------------
-- RLS: public read for storefront; writes via service role / dashboard
-- ---------------------------------------------------------------------------
alter table public.smm_products enable row level security;
alter table public.premium_products enable row level security;

create policy "smm_products_select_public"
  on public.smm_products for select
  using (is_active = true);

create policy "premium_products_select_public"
  on public.premium_products for select
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- Seed (matches src/lib/services-data.ts)
-- ---------------------------------------------------------------------------
insert into public.smm_products (
  id, name, description, platform, category, price_from, duration, featured, rating, review_count, top_review
) values
  ('S001', 'TikTok Followers — Viral tier', 'High-retention followers with gradual delivery. Ideal for new accounts.', 'tiktok', 'followers', 2.99, '24h', true, 4.9, 1842, 'Delivered faster than quoted, zero drops so far.'),
  ('S002', 'Instagram Reels Views + Likes bundle', 'Boost reach with paired views and engagement signals.', 'instagram', 'views', 8.50, 'instant', true, 4.8, 920, 'Saw a clear bump in explore within 48h.'),
  ('S003', 'YouTube Watch Hours pack', 'Organic-style watch time toward monetization thresholds.', 'youtube', 'watch-time', 49.00, '7d', true, 4.7, 612, null),
  ('S004', 'X (Twitter) Followers', 'Profile growth with mixed geo, steady drip delivery.', 'x', 'followers', 3.75, '24h', false, 4.6, 430, null),
  ('S005', 'Facebook Page Likes', 'Page credibility and social proof for brands.', 'facebook', 'likes', 4.20, 'instant', false, 4.5, 305, null),
  ('S006', 'Spotify Monthly Listeners', 'Listener growth for playlist and artist profiles.', 'spotify', 'followers', 6.99, '7d', false, 4.4, 198, null),
  ('S007', 'LinkedIn Connections', 'B2B-focused connection growth with industry targeting.', 'linkedin', 'followers', 12.99, '14d', false, 4.8, 267, null),
  ('S008', 'Telegram Channel Members', 'Member adds with optional premium tier accounts.', 'telegram', 'followers', 5.50, '24h', false, 4.5, 144, null),
  ('S009', 'TikTok Comments (custom)', 'Authentic-style thread engagement for algorithm boost.', 'tiktok', 'comments', 9.99, 'instant', false, 4.6, 88, null),
  ('S010', 'YouTube Subscribers', 'Subscriber growth with refill window on eligible tiers.', 'youtube', 'subscribers', 12.50, '7d', true, 4.9, 1103, 'Clean dashboard + predictable delivery windows.')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  platform = excluded.platform,
  category = excluded.category,
  price_from = excluded.price_from,
  duration = excluded.duration,
  featured = excluded.featured,
  rating = excluded.rating,
  review_count = excluded.review_count,
  top_review = excluded.top_review,
  updated_at = now();

insert into public.premium_products (
  id, name, description, category, billing, brand_id, price_from, featured, rating, review_count, top_review, seats
) values
  ('P001', 'Netflix Premium 4K', 'UHD streaming, multiple screens, private or shared slots.', 'streaming', 'monthly', 'netflix', 4.99, true, 4.9, 2401, 'Instant credentials, worked on all my devices.', '1–4 screens'),
  ('P002', 'Prime Video + Amazon perks', 'Full Prime Video access with regional catalog unlock.', 'streaming', 'yearly', 'prime', 19.99, true, 4.7, 887, null, '1 profile'),
  ('P003', 'Spotify Premium Individual', 'Ad-free music, offline downloads, yearly or monthly.', 'music', 'yearly', 'spotify', 24.99, true, 4.8, 1520, null, null),
  ('P004', 'Discord Nitro (gift / upgrade)', 'HD streaming, larger uploads, profile flair.', 'gaming', 'monthly', 'discord', 3.49, false, 4.6, 412, null, null),
  ('P005', 'Adobe Creative Cloud seat', 'Shared team slot with renewal warranty options.', 'productivity', 'monthly', 'creative', 22.00, false, 4.5, 203, null, null),
  ('P006', 'VPN Premium — multi-region', 'High-speed nodes, streaming-optimized servers.', 'vpn', 'one-time', 'vpn', 8.99, false, 4.4, 156, null, null),
  ('P007', 'HBO Max / Max UHD', 'Premium HBO catalog with 4K where available.', 'streaming', 'monthly', 'hbomax', 5.49, false, 4.6, 334, null, null)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  billing = excluded.billing,
  brand_id = excluded.brand_id,
  price_from = excluded.price_from,
  featured = excluded.featured,
  rating = excluded.rating,
  review_count = excluded.review_count,
  top_review = excluded.top_review,
  seats = excluded.seats,
  updated_at = now();
