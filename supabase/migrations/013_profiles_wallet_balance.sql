-- Add wallet_balance to profiles (user wallet funds).

alter table public.profiles add column if not exists wallet_balance numeric(10,2) not null default 0.00;

create index if not exists profiles_wallet_balance_idx on public.profiles (wallet_balance);

comment on column public.profiles.wallet_balance is 'User wallet balance (USD); used for orders and top-ups.';
