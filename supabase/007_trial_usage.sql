-- Metiq — catatan penggunaan Mode Coba (versi Alpha) untuk dasbor admin.
-- Jalankan sekali di SQL Editor setelah 006_research_feedback_bbo.sql. Aman dijalankan ulang.
-- Yang dicatat: kode pengunjung acak (per perangkat), peran, nama yang diketik pengguna sendiri, dan aktivitas di mode coba.
-- Tidak ada email, kata sandi, atau data kelas sungguhan.

create table if not exists public.trial_events (
  id bigserial primary key,
  visitor text not null check (char_length(visitor) between 8 and 40),
  role text not null check (role in ('siswa', 'ortu', 'guru')),
  name text check (char_length(name) <= 60),
  child text check (char_length(child) <= 60),
  event text not null,
  detail jsonb,
  ts timestamptz not null default now()
);
create index if not exists trial_events_ts on public.trial_events (ts);
create index if not exists trial_events_visitor on public.trial_events (visitor, ts);
alter table public.trial_events enable row level security;
revoke all on public.trial_events from anon, authenticated;

-- Dikirim dari aplikasi dalam kelompok kecil. Paling banyak 100 kejadian per kiriman dan 3.000 per pengunjung per hari.
create or replace function public.trial_log(p_visitor text, p_role text, p_name text, p_child text, p_events jsonb) returns int
language plpgsql volatile security definer set search_path = public
as $$
declare n int;
begin
  if p_role not in ('siswa', 'ortu', 'guru') or char_length(coalesce(p_visitor, '')) not between 8 and 40 then raise exception 'Data tidak valid'; end if;
  if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) > 100 then raise exception 'Terlalu banyak data sekaligus'; end if;
  if (select count(*) from trial_events where visitor = p_visitor and ts > now() - interval '1 day') > 3000 then return 0; end if;
  insert into trial_events (visitor, role, name, child, event, detail, ts)
  select p_visitor, p_role, nullif(left(trim(coalesce(p_name, '')), 60), ''), nullif(left(trim(coalesce(p_child, '')), 60), ''),
         e->>'e', case when char_length((e->'d')::text) <= 400 then e->'d' end,
         -- waktu dari perangkat dipakai bila masuk akal (2 hari terakhir), selain itu waktu server
         case when (e->>'ts') ~ '^[0-9]{12,14}$' and to_timestamp((e->>'ts')::bigint / 1000.0) between now() - interval '2 days' and now() + interval '5 minutes'
              then to_timestamp((e->>'ts')::bigint / 1000.0) else now() end
  from jsonb_array_elements(p_events) e
  where e->>'e' in ('start', 'view', 'answer', 'game', 'diag', 'lesson', 'anim', 'feedback');
  get diagnostics n = row_count;
  return n;
end $$;

-- Ringkasan untuk admin: pengunjung, aktivitas harian per peran, dan fitur yang dipakai
create or replace function public.admin_trial_stats(p_token text, p_days int default 14) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); since timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 14), 90)));
begin
  if not _is_admin(t) then raise exception 'Khusus admin'; end if;
  return jsonb_build_object(
    'visitors', coalesce((select jsonb_agg(v order by (v->>'last')::numeric desc) from (
      select jsonb_build_object(
        'id', visitor,
        'role', (array_agg(role order by ts desc))[1],
        'name', (array_agg(name order by ts desc) filter (where name is not null))[1],
        'child', (array_agg(child order by ts desc) filter (where child is not null))[1],
        'first', (extract(epoch from min(ts)) * 1000)::bigint,
        'last', (extract(epoch from max(ts)) * 1000)::bigint,
        'days', count(distinct (ts at time zone 'Asia/Jakarta')::date),
        'events', count(*),
        'answers', count(*) filter (where event = 'answer'),
        'correct', count(*) filter (where event = 'answer' and detail->>'ok' = 'true'),
        'games', count(*) filter (where event = 'game'),
        'diag', (array_agg(detail->>'level' order by ts desc) filter (where event = 'diag'))[1]) v
      from trial_events where ts >= since group by visitor) x), '[]'::jsonb),
    'daily', coalesce((select jsonb_agg(d order by d->>'day', d->>'role') from (
      select jsonb_build_object('day', day, 'role', role, 'visitors', count(distinct visitor), 'events', count(*)) d
      from (select (ts at time zone 'Asia/Jakarta')::date::text as day, role, visitor from trial_events where ts >= since) z
      group by day, role) y), '[]'::jsonb),
    'features', coalesce((select jsonb_agg(f order by (f->>'n')::int desc) from (
      select jsonb_build_object('k', k, 'n', count(*), 'v', count(distinct visitor)) f
      from (select visitor, case when event = 'view' then 'view:' || coalesce(detail->>'p', '') else event end as k from trial_events where ts >= since) z
      group by k) y), '[]'::jsonb)
  );
end $$;

revoke execute on function public.trial_log(text, text, text, text, jsonb), public.admin_trial_stats(text, int) from public;
grant execute on function public.trial_log(text, text, text, text, jsonb), public.admin_trial_stats(text, int) to anon, authenticated;
