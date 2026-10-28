-- Metiq — pengaturan per kelas (lapisan iman opsional).
-- Jalankan sekali di SQL Editor setelah 012_approve_with_class.sql. Aman dijalankan ulang.
-- classes.settings berisi pilihan kelas, saat ini: konteks ('umum' | 'islami') dan adab (true | false).
-- Kosong ('{}') = perilaku lama; tidak ada yang berubah untuk kelas yang tidak menyalakannya.
-- Tabel tetap terkunci (RLS tanpa policy); akses hanya lewat fungsi di bawah.

alter table public.classes add column if not exists settings jsonb not null default '{}'::jsonb;

-- Semua data kelas (guru, siswa, orang tua) lewat _bundle: salinan dari 008 ditambah 'settings'
-- Data kelas kini menyertakan sekolahnya (salinan _bundle dari 006 ditambah schoolId/schoolName/schoolKind)
create or replace function public._bundle(p_class_ids text[], p_student_ids text[], p_since bigint, p_codes boolean)
returns jsonb language sql stable security definer set search_path = public
as $$
select jsonb_build_object(
  'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'teacherId', c.teacher_id, 'teacherName', t.name, 'name', c.name, 'code', c.code,
      'schoolId', t.school_id, 'schoolName', s.name, 'schoolKind', s.kind, 'settings', coalesce(c.settings, '{}'::jsonb)) order by c.created_at)
      from classes c join teachers t on t.id = c.teacher_id left join schools s on s.id = t.school_id where c.id = any(p_class_ids)), '[]'::jsonb),
  'students', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'classId', s.class_id, 'name', s.name, 'avatar', s.avatar,
      'parentCode', case when p_codes then s.parent_code end,
      'nisn', case when p_codes then s.nisn end,
      'parents', case when p_codes then coalesce((select jsonb_agg(p.email order by p.email) from parent_students ps join parents p on p.id = ps.parent_id where ps.student_id = s.id), '[]'::jsonb) end))
      from students s where s.id = any(p_student_ids)), '[]'::jsonb),
  'progress', coalesce((select jsonb_object_agg(x.sid, x.m) from (
      select p.student_id sid, jsonb_object_agg(p.skill, jsonb_build_object('score', p.score, 'att', p.att, 'ok', p.ok, 'ms', p.ms, 'last', p.last, 'masteredAt', p.mastered_at)) m
      from progress p where p.student_id = any(p_student_ids) group by p.student_id) x), '{}'::jsonb),
  'answers', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'sid', a.student_id, 'skill', a.skill, 'ok', a.ok, 'given', a.given, 'answer', a.answer, 'text', a.text, 'tag', a.tag, 'ms', a.ms, 'ts', a.ts) order by a.ts)
      from (select * from answers where student_id = any(p_student_ids) and ts >= p_since order by ts desc limit 30000) a), '[]'::jsonb),
  'assignments', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'classId', g.class_id, 'skills', g.skills, 'note', g.note, 'due', g.due,
      'students', g.student_ids, 'createdAt', (extract(epoch from g.created_at) * 1000)::bigint) order by g.created_at)
      from assignments g where g.class_id = any(p_class_ids) and (g.student_ids is null or g.student_ids && p_student_ids)), '[]'::jsonb),
  'done', coalesce((select jsonb_agg(jsonb_build_object('aid', d.assignment_id, 'sid', d.student_id, 'at', (extract(epoch from d.done_at) * 1000)::bigint, 'by', d.done_by,
      'bbo', case when p_codes then _bbo_status(d.assignment_id, d.student_id) end) order by d.done_at)
      from assignment_done d where d.student_id = any(p_student_ids)), '[]'::jsonb),
  'feedback', coalesce((select jsonb_agg(jsonb_build_object('aid', f.assignment_id, 'sid', f.student_id, 'by', f.by_role, 'rating', f.rating, 'comment', f.comment, 'at', (extract(epoch from f.created_at) * 1000)::bigint) order by f.created_at)
      from feedback f where f.student_id = any(p_student_ids)), '[]'::jsonb),
  'views', case when p_codes then coalesce((select jsonb_agg(jsonb_build_object('sid', v.student_id, 'via', v.via, 'at', (extract(epoch from v.viewed_at) * 1000)::bigint) order by v.viewed_at)
      from report_views v where v.student_id = any(p_student_ids) and v.viewed_at >= to_timestamp(p_since / 1000.0)), '[]'::jsonb) else '[]'::jsonb end
) $$;

-- Kode kelas siswa: sertakan pengaturan kelas
create or replace function public.class_roster(p_code text) returns jsonb
language sql stable security definer set search_path = public
as $$
select case when c.id is null then null else jsonb_build_object(
  'class', jsonb_build_object('id', c.id, 'name', c.name, 'code', c.code, 'settings', coalesce(c.settings, '{}'::jsonb)),
  'students', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'avatar', s.avatar) order by s.name) from students s where s.class_id = c.id), '[]'::jsonb)) end
from (select 1) one left join classes c on c.code = upper(trim(p_code))
$$;

-- Guru kelas itu, admin sekolahnya, atau super admin mengubah pengaturan kelas.
-- Hanya kunci yang dikenal disimpan; nilai lain ditolak.
create or replace function public.class_set_settings(p_token text, p_class_id text, p_settings jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); k text := coalesce(p_settings ->> 'konteks', 'umum'); a jsonb := coalesce(p_settings -> 'adab', 'false'::jsonb); res jsonb;
begin
  if not exists (select 1 from classes where id = p_class_id) or not _can_class(t, p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
  if k not in ('umum', 'islami') then raise exception 'Konteks tidak dikenal'; end if;
  if jsonb_typeof(a) <> 'boolean' then raise exception 'Nilai adab harus true atau false'; end if;
  res := jsonb_build_object('konteks', k, 'adab', a);
  update classes set settings = res where id = p_class_id;
  return res;
end $$;

grant execute on function public.class_roster(text), public.class_set_settings(text, text, jsonb) to anon, authenticated;
