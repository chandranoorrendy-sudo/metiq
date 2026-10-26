-- Metiq — avatar guru dan penggantian avatar siswa.
-- Jalankan sekali di SQL Editor setelah 002_roles.sql. Aman dijalankan ulang.

alter table public.teachers add column if not exists avatar text;

-- Siswa mengganti avatarnya sendiri (memakai kode kelas, sama seperti saat berlatih)
create or replace function public.student_set_avatar(p_code text, p_student_id text, p_avatar text) returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  perform _student_in(p_code, p_student_id);
  update students set avatar = left(coalesce(nullif(trim(p_avatar), ''), '🙂'), 40) where id = p_student_id;
end $$;

-- Guru (atau admin) mengganti avatar siswa di kelasnya
create or replace function public.teacher_set_student_avatar(p_token text, p_student_id text, p_avatar text) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token);
begin
  update students s set avatar = left(coalesce(nullif(trim(p_avatar), ''), '🙂'), 40)
  where s.id = p_student_id and _can_class(t, s.class_id);
end $$;

-- Guru mengganti avatarnya sendiri
create or replace function public.teacher_set_avatar(p_token text, p_avatar text) returns void
language plpgsql volatile security definer set search_path = public
as $$ begin update teachers set avatar = left(nullif(trim(p_avatar), ''), 40) where id = _tid(p_token); end $$;

-- Data guru kini menyertakan avatarnya
create or replace function public.teacher_bundle(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); adm boolean := _is_admin(t); cls text[]; sts text[];
begin
  cls := array(select id from classes where adm or teacher_id = t order by created_at);
  sts := array(select id from students where class_id = any(cls));
  return _bundle(cls, sts, ((extract(epoch from now()) - 90 * 86400) * 1000)::bigint, true)
    || jsonb_build_object('teacher', (select jsonb_build_object('id', id, 'name', name, 'email', email, 'isAdmin', adm, 'avatar', avatar) from teachers where id = t));
end $$;

revoke execute on function public.student_set_avatar(text, text, text), public.teacher_set_student_avatar(text, text, text), public.teacher_set_avatar(text, text) from public;
grant execute on function public.student_set_avatar(text, text, text), public.teacher_set_student_avatar(text, text, text), public.teacher_set_avatar(text, text), public.teacher_bundle(text) to anon, authenticated;
