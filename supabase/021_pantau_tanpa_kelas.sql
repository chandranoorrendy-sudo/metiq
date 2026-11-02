/* 021 — Super admin memantau aktivitas siswa tanpa kelas.
 * admin_ungrouped kini juga mengirim ringkasan aktivitas setiap anak: terakhir aktif, soal minggu ini,
 * total soal dan jawaban benar, keterampilan mahir, dan keterampilan yang terakhir dikerjakan.
 * admin_student_report: laporan satu siswa (kemajuan per keterampilan dan 40 jawaban terakhir).
 * Hanya membaca data, tidak mengubah apa pun. Khusus admin. Jalankan setelah 020.
 */
create or replace function public.admin_ungrouped(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); wk bigint := ((extract(epoch from now()) - 7 * 86400) * 1000)::bigint;
begin
  if not _is_admin(t) then raise exception 'Hanya admin yang bisa melihat daftar ini'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', s.id, 'name', s.name, 'avatar', s.avatar, 'code', s.learn_code, 'parentCode', s.parent_code, 'familyCode', s.family_code,
      'createdAt', (extract(epoch from s.created_at) * 1000)::bigint,
      'lastTs', nullif(greatest(coalesce(a.last_ts, 0), coalesce(p.last_ts, 0)), 0),
      'week', coalesce(a.week, 0), 'att', coalesce(p.att, 0), 'ok', coalesce(p.ok, 0), 'mastered', coalesce(p.mastered, 0), 'lastSkill', p.last_skill
    ) order by s.created_at desc)
    from students s
    left join lateral (select max(ts) last_ts, count(*) filter (where ts > wk) week from answers where student_id = s.id) a on true
    left join lateral (select max(last) last_ts, sum(att) att, sum(ok) ok, count(*) filter (where score >= 80) mastered,
        (array_agg(skill order by last desc))[1] last_skill
      from progress where student_id = s.id and position(':' in skill) = 0 and att > 0) p on true
    where s.class_id is null
  ), '[]'::jsonb);
end $$;

create or replace function public.admin_student_report(p_token text, p_student_id text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); s students;
begin
  if not _is_admin(t) then raise exception 'Hanya admin yang bisa melihat laporan ini'; end if;
  select * into s from students where id = p_student_id;
  if s.id is null then raise exception 'Siswa tidak ditemukan'; end if;
  return jsonb_build_object(
    'student', jsonb_build_object('id', s.id, 'name', s.name, 'avatar', s.avatar, 'code', s.learn_code, 'parentCode', s.parent_code, 'classId', s.class_id,
      'createdAt', (extract(epoch from s.created_at) * 1000)::bigint),
    'progress', coalesce((select jsonb_agg(jsonb_build_object('skill', skill, 'score', score, 'att', att, 'ok', ok, 'last', last) order by last desc)
      from progress where student_id = s.id and position(':' in skill) = 0 and att > 0), '[]'::jsonb),
    'answers', coalesce((select jsonb_agg(jsonb_build_object('skill', skill, 'ok', ok, 'given', given, 'answer', answer, 'text', text, 'tag', tag, 'ms', ms, 'ts', ts) order by ts desc)
      from (select * from answers where student_id = s.id order by ts desc limit 40) x), '[]'::jsonb));
end $$;

revoke execute on function public.admin_ungrouped(text), public.admin_student_report(text, text) from public;
grant execute on function public.admin_ungrouped(text), public.admin_student_report(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
