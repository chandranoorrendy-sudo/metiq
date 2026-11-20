-- 038 — aktivasi Metiq Plus setelah transfer manual dan konfirmasi admin.
-- Jalankan setelah 037_paket_keluarga.sql.
create table if not exists public.family_manual_payments (
  id bigint generated always as identity primary key,
  parent_id text not null references public.parents(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'annual')),
  amount integer not null check (amount in (39000, 399000)),
  payment_note text not null check (char_length(payment_note) between 1 and 120),
  activated_by text not null references public.teachers(id),
  created_at timestamptz not null default now()
);
create index if not exists family_manual_payments_created on public.family_manual_payments(created_at desc);
alter table public.family_manual_payments enable row level security;
revoke all on public.family_manual_payments from anon, authenticated;

create or replace function public.super_family_subscriptions(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare me text := _super(p_token);
begin
  return coalesce((select jsonb_agg(jsonb_build_object(
    'parentId', p.id, 'parentName', p.name, 'email', p.email,
    'studentId', st.id, 'studentName', st.name,
    'active', coalesce(fs.status = 'active' and fs.current_period_end > now(), false),
    'currentPeriodEnd', fs.current_period_end
  ) order by p.name, st.name)
  from parent_students ps
  join parents p on p.id = ps.parent_id
  join students st on st.id = ps.student_id
  left join family_subscriptions fs on fs.parent_id = p.id and fs.student_id = st.id), '[]'::jsonb);
end $$;

create or replace function public.super_family_activate(p_token text, p_parent_id text, p_student_id text, p_plan text, p_payment_note text)
returns jsonb language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token); s family_subscriptions; v_end timestamptz; v_amount integer;
begin
  if p_plan not in ('monthly', 'annual') then raise exception 'Paket tidak dikenal'; end if;
  if not exists (select 1 from parent_students where parent_id = p_parent_id and student_id = p_student_id) then
    raise exception 'Anak tidak tertaut ke akun orang tua tersebut';
  end if;
  if char_length(trim(coalesce(p_payment_note, ''))) not between 1 and 120 then raise exception 'Catatan pembayaran wajib diisi'; end if;
  v_amount := case when p_plan = 'monthly' then 39000 else 399000 end;
  select * into s from family_subscriptions where parent_id = p_parent_id and student_id = p_student_id for update;
  v_end := greatest(coalesce(s.current_period_end, now()), now()) + case when p_plan = 'monthly' then interval '1 month' else interval '1 year' end;
  insert into family_manual_payments(parent_id, student_id, plan, amount, payment_note, activated_by)
    values (p_parent_id, p_student_id, p_plan, v_amount, left(trim(p_payment_note), 120), me);
  insert into family_subscriptions(parent_id, student_id, plan, status, current_period_end, updated_at)
    values (p_parent_id, p_student_id, p_plan, 'active', v_end, now())
    on conflict (parent_id, student_id) do update set plan = excluded.plan, status = 'active', current_period_end = excluded.current_period_end, updated_at = now();
  return jsonb_build_object('ok', true, 'currentPeriodEnd', v_end);
end $$;

revoke all on function public.super_family_subscriptions(text), public.super_family_activate(text, text, text, text, text) from public;
grant execute on function public.super_family_subscriptions(text), public.super_family_activate(text, text, text, text, text) to anon, authenticated;
notify pgrst, 'reload schema';
