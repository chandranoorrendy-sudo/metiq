-- Metiq — catatan tugas selesai untuk notifikasi guru dan orang tua.
-- Jalankan sekali di SQL Editor setelah 003_avatars.sql. Aman dijalankan ulang.

create table if not exists public.assignment_done (
  assignment_id text not null references public.assignments(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  done_at timestamptz not null default now(),
  done_by text not null default 'siswa' check (done_by in ('siswa', 'ortu')),
  primary key (assignment_id, student_id)
);
create index if not exists assignment_done_student on public.assignment_done (student_id);
alter table public.assignment_done enable row level security;
revoke all on public.assignment_done from anon, authenticated;

-- Menandai tugas selesai: otomatis dari aplikasi siswa, atau dilaporkan orang tua.
-- Memakai kode kelas seperti saat siswa berlatih; tugas harus milik kelas siswa itu.
create or replace function public.complete_assignment(p_code text, p_student_id text, p_assignment_id text, p_by text default 'siswa') returns void
language plpgsql volatile security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id);
begin
  if not exists (select 1 from assignments where id = p_assignment_id and class_id = cid) then raise exception 'Tugas tidak ditemukan'; end if;
  insert into assignment_done (assignment_id, student_id, done_by)
  values (p_assignment_id, p_student_id, case when p_by = 'ortu' then 'ortu' else 'siswa' end)
  on conflict (assignment_id, student_id) do nothing;
end $$;

-- Data kelas kini juga memuat daftar tugas yang sudah selesai ('done')
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
  'assignments', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'classId', g.class_id, 'skills', g.skills, 'note', g.note, 'due', g.due, 'createdAt', (extract(epoch from g.created_at) * 1000)::bigint) order by g.created_at)
      from assignments g where g.class_id = any(p_class_ids)), '[]'::jsonb),
  'done', coalesce((select jsonb_agg(jsonb_build_object('aid', d.assignment_id, 'sid', d.student_id, 'at', (extract(epoch from d.done_at) * 1000)::bigint, 'by', d.done_by) order by d.done_at)
      from assignment_done d where d.student_id = any(p_student_ids)), '[]'::jsonb)
) $$;

revoke execute on function public.complete_assignment(text, text, text, text) from public;
grant execute on function public.complete_assignment(text, text, text, text) to anon, authenticated;
