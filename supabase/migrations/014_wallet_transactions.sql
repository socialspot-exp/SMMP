-- Wallet transaction ledger (credits/debits/adjustments). Balances live on `profiles.wallet_balance`.
-- Source of truth for history: every admin adjustment and future top-ups/charges should insert a row here.

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null, -- signed: +credit, -debit
  reason text not null,
  actor_id text, -- clerk id of admin/user/system initiating, optional
  balance_before numeric(10,2) not null,
  balance_after numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists wallet_transactions_user_id_created_at_idx
  on public.wallet_transactions (user_id, created_at desc);

create index if not exists wallet_transactions_created_at_idx
  on public.wallet_transactions (created_at desc);

comment on table public.wallet_transactions is 'Immutable wallet ledger rows; signed amount, reason, and balance snapshots.';
