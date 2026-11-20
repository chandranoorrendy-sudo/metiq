-- 037 — Paket keluarga berbayar Metiq Plus (Midtrans Snap).
-- Jalankan setelah supabase/schema.sql dan supabase/002_roles.sql.
create table if not exists public.family_orders (
  order_id text primary key,
  parent_id text not null references public.parents(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'annual')),
  gross_amount integer not null check (gross_amount > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  snap_token text,
  transaction_id text,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists family_orders_parent_created on public.family_orders(parent_id, created_at desc);

create table if not exists public.family_subscriptions (
  parent_id text not null references public.parents(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'annual')),
  status text not null default 'active' check (status in ('active', 'expired', 'canceled')),
  current_period_end timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

alter table public.family_orders enable row level security;
alter table public.family_subscriptions enable row level security;
revoke all on public.family_orders, public.family_subscriptions from anon, authenticated;

create or replace function public.family_apply_payment(p_order_id text, p_status text, p_transaction_id text default null)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare o family_orders; s family_subscriptions; v_end timestamptz;
begin
  if p_status not in ('pending', 'paid', 'failed', 'expired') then raise exception 'Status pembayaran tidak dikenal'; end if;
  select * into o from family_orders where order_id = p_order_id for update;
  if o.order_id is null then raise exception 'Transaksi tidak ditemukan'; end if;
  if p_status = 'paid' then
    update family_orders set status = 'paid', transaction_id = coalesce(p_transaction_id, transaction_id), updated_at = now()
      where order_id = p_order_id;
    if o.activated_at is null then
  select * into s from family_subscriptions where parent_id = o.parent_id and student_id = o.student_id for update;
      v_end := greatest(coalesce(s.current_period_end, now()), now()) + case when o.plan = 'monthly' then interval '1 month' else interval '1 year' end;
      insert into family_subscriptions(parent_id, student_id, plan, status, current_period_end, updated_at)
        values (o.parent_id, o.student_id, o.plan, 'active', v_end, now())
        on conflict (parent_id, student_id) do update set plan = excluded.plan, status = 'active', current_period_end = excluded.current_period_end, updated_at = now();
      update family_orders set activated_at = now() where order_id = p_order_id;
    end if;
  elsif o.status <> 'paid' then
    update family_orders set status = p_status, transaction_id = coalesce(p_transaction_id, transaction_id), updated_at = now()
      where order_id = p_order_id;
  end if;
  return jsonb_build_object('ok', true, 'activated', p_status = 'paid');
end;
$$;
revoke all on function public.family_apply_payment(text, text, text) from public, anon, authenticated;
grant execute on function public.family_apply_payment(text, text, text) to service_role;
notify pgrst, 'reload schema';
