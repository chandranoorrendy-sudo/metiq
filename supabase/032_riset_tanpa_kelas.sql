/* 032 — Statistik riset untuk siswa tanpa kelas (tab 🔬 Riset → 🧺 Tanpa kelas, khusus super admin).
 * admin_ungrouped_stats mengirim angka gabungan untuk semua anak yang belum punya kelas dalam periode terpilih:
 * jumlah anak, yang sudah mulai, yang aktif, keterlibatan orang tua, soal per hari dan per jam, keterampilan
 * yang dilatih (beserta salahnya), pola kesalahan, sebaran usaha per anak, dan kelompok anak per minggu daftar.
 * Tidak mengirim nama atau kode. Hanya membaca data, tidak mengubah apa pun. Jalankan setelah 021.
 * p_from, p_to: milidetik (periode); p_off: selisih zona waktu browser dalam milidetik (WIB = 25200000).
 */
create or replace function public.admin_ungrouped_stats(p_token text, p_from bigint, p_to bigint, p_off bigint default 25200000)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  t text := _tid(p_token);
  now_ms bigint := (extract(epoch from now()) * 1000)::bigint;
  wk bigint := now_ms - 7 * 86400000;
  res jsonb;
begin
  if not _is_admin(t) then raise exception 'Hanya admin yang bisa melihat statistik ini'; end if;
  if p_to is null or p_to <= 0 then p_to := now_ms; end if;
  p_from := coalesce(p_from, 0);

  with k as (select id, created_at from students where class_id is null),
  a as (select x.student_id sid, x.skill, x.ok, least(greatest(coalesce(x.ms, 0), 0), 180000) ms, x.ts, x.tag
    from answers x join k on k.id = x.student_id where x.ts between p_from and p_to)
  select jsonb_build_object(
    'kids', (select count(*) from k),
    'started', (select count(distinct p.student_id) from progress p join k k on k.id = p.student_id where p.att > 0),
    'newKids', (select count(*) from k where (extract(epoch from created_at) * 1000)::bigint between p_from and p_to),
    'newStarted', (select count(*) from k k where (extract(epoch from k.created_at) * 1000)::bigint between p_from and p_to
      and exists (select 1 from progress p where p.student_id = k.id and p.att > 0)),
    'active', (select count(distinct sid) from a),
    'active7', (select count(distinct a.student_id) from answers a join k k on k.id = a.student_id where a.ts > wk),
    'parentLinked', (select count(distinct ps.student_id) from parent_students ps join k k on k.id = ps.student_id),
    'parentGmail', (select count(distinct ps.student_id) from parent_students ps join k k on k.id = ps.student_id
      join parents pa on pa.id = ps.parent_id where pa.auth_user_id is not null),
    'reportViews', (select count(*) from report_views v join k k on k.id = v.student_id
      where (extract(epoch from v.viewed_at) * 1000)::bigint between p_from and p_to),
    'reportKids', (select count(distinct v.student_id) from report_views v join k k on k.id = v.student_id
      where (extract(epoch from v.viewed_at) * 1000)::bigint between p_from and p_to),
    'answers', (select count(*) from a),
    'ok', (select count(*) from a where ok),
    'ms', (select coalesce(sum(ms), 0) from a),
    'mastered', (select count(*) from progress p join k k on k.id = p.student_id where position(':' in p.skill) = 0 and p.att > 0 and p.score >= 80),
    'tuntas', (select count(*) from progress p join k k on k.id = p.student_id where position(':' in p.skill) = 0 and p.att > 0 and p.score >= 100),
    -- soal per hari (hari dihitung dengan zona waktu browser): d = nomor hari sejak 1970
    'daily', coalesce((select jsonb_agg(jsonb_build_object('d', d, 'n', n, 'ok', okn, 's', s) order by d) from (
      select (ts + p_off) / 86400000 d, count(*) n, count(*) filter (where ok) okn, count(distinct sid) s from a group by 1) x), '[]'::jsonb),
    -- jam belajar (0–23)
    'hours', coalesce((select jsonb_agg(jsonb_build_object('h', h, 'n', n) order by h) from (
      select ((ts + p_off) % 86400000) / 3600000 h, count(*) n from a group by 1) x), '[]'::jsonb),
    -- keterampilan yang dilatih: soal, benar, banyak anak
    'skills', coalesce((select jsonb_agg(jsonb_build_object('skill', skill, 'n', n, 'ok', okn, 's', s) order by n desc) from (
      select skill, count(*) n, count(*) filter (where ok) okn, count(distinct sid) s from a group by skill order by count(*) desc limit 400) x), '[]'::jsonb),
    -- pola kesalahan
    'tags', coalesce((select jsonb_agg(jsonb_build_object('tag', tag, 'n', n) order by n desc) from (
      select tag, count(*) n from a where not ok and tag is not null and tag <> '' group by tag) x), '[]'::jsonb),
    -- usaha per anak yang aktif dalam periode (tanpa identitas): soal, benar, hari aktif, waktu
    'per', coalesce((select jsonb_agg(jsonb_build_array(n, okn, days, ms)) from (
      select sid, count(*) n, count(*) filter (where ok) okn, count(distinct (ts + p_off) / 86400000) days, sum(ms) ms from a group by sid) x), '[]'::jsonb),
    -- kelompok per minggu daftar (12 minggu terakhir): berapa yang mulai, masih aktif 7 hari terakhir
    'cohorts', coalesce((select jsonb_agg(jsonb_build_object('w', w, 'n', n, 'started', st, 'active7', ac) order by w) from (
      select (extract(epoch from date_trunc('week', k.created_at at time zone 'Asia/Jakarta')) * 1000)::bigint w, count(*) n,
        count(*) filter (where exists (select 1 from progress p where p.student_id = k.id and p.att > 0)) st,
        count(*) filter (where exists (select 1 from answers a where a.student_id = k.id and a.ts > wk)) ac
      from k k where k.created_at > now() - interval '84 days' group by 1) x), '[]'::jsonb)
  ) into res;
  return res;
end $$;

revoke execute on function public.admin_ungrouped_stats(text, bigint, bigint, bigint) from public;
grant execute on function public.admin_ungrouped_stats(text, bigint, bigint, bigint) to anon, authenticated;

notify pgrst, 'reload schema';
