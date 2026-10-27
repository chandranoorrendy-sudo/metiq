-- Metiq — tugas untuk siswa tertentu (selain tugas untuk seluruh kelas).
-- Jalankan sekali di SQL Editor setelah 004_assignment_done.sql. Aman dijalankan ulang.
-- student_ids kosong (null) = tugas untuk seluruh kelas.

alter table public.assignments add column if not exists student_ids text[];

-- Membuat tugas: p_student_ids kosong = seluruh kelas; berisi id siswa = hanya siswa itu
drop function if exists public.teacher_add_assignment(text, text, text[], text, text);
create or replace function public.teacher_add_assignment(p_token text, p_class_id text, p_skills text[], p_note text, p_due text, p_student_ids text[] default null) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare ids text[];
begin
  if not _can_class(_tid(p_token), p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
  -- hanya siswa dari kelas ini yang boleh menjadi sasaran
  ids := case when coalesce(array_length(p_student_ids, 1), 0) = 0 then null
              else array(select id from students where class_id = p_class_id and id = any(p_student_ids)) end;
  if p_student_ids is not null and array_length(p_student_ids, 1) > 0 and coalesce(array_length(ids, 1), 0) = 0 then
    raise exception 'Siswa tidak ditemukan di kelas ini';
  end if;
  insert into assignments (class_id, skills, note, due, student_ids) values (p_class_id, p_skills[1:100], left(p_note, 200), left(p_due, 20), ids);
end $$;

-- Tugas selesai hanya untuk siswa yang menjadi sasaran tugas
create or replace function public.complete_assignment(p_code text, p_student_id text, p_assignment_id text, p_by text default 'siswa') returns void
language plpgsql volatile security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id);
begin
  if not exists (select 1 from assignments where id = p_assignment_id and class_id = cid
                 and (student_ids is null or p_student_id = any(student_ids))) then
    raise exception 'Tugas tidak ditemukan';
  end if;
  insert into assignment_done (assignment_id, student_id, done_by)
  values (p_assignment_id, p_student_id, case when p_by = 'ortu' then 'ortu' else 'siswa' end)
  on conflict (assignment_id, student_id) do nothing;
end $$;

-- Data kelas: tugas khusus hanya terlihat oleh siswa sasarannya (dan orang tuanya); guru melihat semua
create or replace function public._bundle(p_class_ids text[], p_student_ids text[], p_since bigint, p_codes boolean)
returns jsonb language sql stable security definer set search_path = public
as $$
select jsonb_build_object(
  'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'teacherId', c.teacher_id, 'teacherName', t.name, 'name', c.name, 'code', c.code) order by c.created_at)
      from classes c join teachers t on t.id = c.teacher_id where c.id = any(p_class_ids)), '[]'::jsonb),
  'students', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'classId', s.class_id, 'name', s.name, 'avatar', s.avatar,
      'parentCode', case when p_codes then s.parent_code end,
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
  'done', coalesce((select jsonb_agg(jsonb_build_object('aid', d.assignment_id, 'sid', d.student_id, 'at', (extract(epoch from d.done_at) * 1000)::bigint, 'by', d.done_by) order by d.done_at)
      from assignment_done d where d.student_id = any(p_student_ids)), '[]'::jsonb)
) $$;

revoke execute on function public.teacher_add_assignment(text, text, text[], text, text, text[]) from public;
grant execute on function public.teacher_add_assignment(text, text, text[], text, text, text[]), public.complete_assignment(text, text, text, text) to anon, authenticated;
