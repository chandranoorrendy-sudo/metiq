/* 022 — Angka untuk beranda Metiq: hanya total, tanpa nama atau data siswa perorangan.
 * Hasilnya disimpan sampai 1 jam supaya halaman publik tidak menghitung ulang setiap kali dibuka.
 * improve: pasangan siswa + keterampilan dengan minimal 10 jawaban; ketepatan 5 jawaban pertama dibanding 5 jawaban terakhir.
 * Jalankan setelah 021. Aman dijalankan ulang.
 */
create table if not exists public.site_stats_cache (
  id integer primary key default 1 check (id = 1),
  data jsonb not null,
  at timestamptz not null default now()
);
alter table public.site_stats_cache enable row level security;
revoke all on public.site_stats_cache from anon, authenticated;

create or replace function public.public_stats() returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare c site_stats_cache; d jsonb; since bigint := ((extract(epoch from now()) - 30 * 86400) * 1000)::bigint;
begin
  select * into c from site_stats_cache where id = 1;
  if c.id is not null and c.at > now() - interval '1 hour' then return c.data; end if;
  with a as (select student_id, skill, ok, ts from answers where position(':' in skill) = 0),
  r as (select student_id, skill, ok, row_number() over (partition by student_id, skill order by ts) rn, count(*) over (partition by student_id, skill) n from a),
  p as (select avg(ok::int) filter (where rn <= 5) b, avg(ok::int) filter (where rn > n - 5) e from r where n >= 10 group by student_id, skill)
  select jsonb_build_object(
    'active30', (select count(distinct student_id) from a where ts > since),
    'learners', (select count(distinct student_id) from a),
    'answers', (select count(*) from a),
    'accuracy', (select round(100 * avg(ok::int)) from a),
    'mastered', (select count(*) from progress where position(':' in skill) = 0 and score >= 80),
    'improve', (select jsonb_build_object('pairs', count(*), 'before', round(100 * avg(b)), 'after', round(100 * avg(e)), 'up', round(100.0 * count(*) filter (where e > b) / nullif(count(*), 0))) from p)
  ) into d;
  insert into site_stats_cache (id, data, at) values (1, d, now()) on conflict (id) do update set data = excluded.data, at = excluded.at;
  return d;
end $$;

revoke execute on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;

notify pgrst, 'reload schema';
