/* 035 — Ulasan orang tua wajib memakai akun/kode orang tua.
 *
 * submit_feedback lama hanya untuk siswa. Ulasan orang tua memakai submit_feedback_parent,
 * yang memeriksa sesi orang tua (p_ptoken) yang tertaut ke siswa, atau kode orang tua siswa.
 *
 * Jalankan setelah 034. Aman dijalankan berulang.
 */

create or replace function public.submit_feedback(
  p_code text, p_student_id text, p_assignment_id text, p_by text, p_rating int, p_comment text
) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id);
begin
  if coalesce(p_by, '') = 'ortu' then
    raise exception 'Ulasan orang tua harus dikirim lewat akun orang tua';
  end if;
  if not exists (select 1 from assignment_done where assignment_id = p_assignment_id and student_id = p_student_id) then
    raise exception 'Tugas belum selesai';
  end if;
  if not exists (select 1 from assignments where id = p_assignment_id and class_id = cid) then
    raise exception 'Tugas tidak ditemukan';
  end if;
  insert into feedback (assignment_id, student_id, by_role, rating, comment)
  values (p_assignment_id, p_student_id, 'siswa', greatest(1, least(5, p_rating)),
          nullif(left(trim(coalesce(p_comment, '')), 500), ''))
  on conflict (assignment_id, student_id, by_role) do update
    set rating = excluded.rating, comment = excluded.comment, created_at = now();
end $$;

create or replace function public.submit_feedback_parent(
  p_ptoken text, p_pcode text, p_code text, p_student_id text, p_assignment_id text, p_rating int, p_comment text
) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare pid text; cid text := _student_in(p_code, p_student_id); ok boolean;
begin
  if coalesce(p_ptoken, '') <> '' then
    pid := _pid(p_ptoken);
    select exists (select 1 from parent_students where parent_id = pid and student_id = p_student_id) into ok;
    if not ok then raise exception 'Akun orang tua tidak tertaut ke siswa ini'; end if;
  else
    select exists (select 1 from students where id = p_student_id and parent_code = upper(trim(coalesce(p_pcode, '')))) into ok;
    if not ok then raise exception 'Kode orang tua tidak cocok'; end if;
  end if;

  if not exists (select 1 from assignment_done where assignment_id = p_assignment_id and student_id = p_student_id) then
    raise exception 'Tugas belum selesai';
  end if;
  if not exists (select 1 from assignments where id = p_assignment_id and class_id = cid) then
    raise exception 'Tugas tidak ditemukan';
  end if;
  insert into feedback (assignment_id, student_id, by_role, rating, comment)
  values (p_assignment_id, p_student_id, 'ortu', greatest(1, least(5, p_rating)),
          nullif(left(trim(coalesce(p_comment, '')), 500), ''))
  on conflict (assignment_id, student_id, by_role) do update
    set rating = excluded.rating, comment = excluded.comment, created_at = now();
end $$;

revoke execute on function public.submit_feedback(text, text, text, text, int, text) from public;
grant execute on function public.submit_feedback(text, text, text, text, int, text) to anon, authenticated;
revoke execute on function public.submit_feedback_parent(text, text, text, text, text, int, text) from public;
grant execute on function public.submit_feedback_parent(text, text, text, text, text, int, text) to anon, authenticated;

create table if not exists public.schema_migrations (
  version text primary key,
  name text not null,
  applied_at timestamptz not null default now()
);
insert into public.schema_migrations (version, name)
values ('035', 'ulasan orang tua')
on conflict (version) do nothing;

notify pgrst, 'reload schema';
