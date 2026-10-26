-- Metiq — admin dan akun orang tua.
-- Jalankan sekali di SQL Editor setelah schema.sql. Aman dijalankan ulang.
-- Hasil akhir menampilkan KODE ADMIN untuk setiap email admin: catat dan berikan ke pemiliknya.
-- Kode ini diminta saat admin mendaftar, agar orang lain tidak bisa mendaftar memakai email admin.

/* ---------- Tabel ---------- */
create table if not exists public.admins (
  email text primary key,
  setup_hash text not null
);
create table if not exists public.parents (
  id text primary key default public._id(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null unique check (char_length(email) between 3 and 200),
  pass_hash text not null,
  failed int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.parent_sessions (
  token text primary key,
  parent_id text not null references public.parents(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.parent_students (
  parent_id text not null references public.parents(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);
create index if not exists parent_students_student on public.parent_students (student_id);
create index if not exists parent_sessions_parent on public.parent_sessions (parent_id);

alter table public.admins enable row level security;
alter table public.parents enable row level security;
alter table public.parent_sessions enable row level security;
alter table public.parent_students enable row level security;
revoke all on all tables in schema public from anon, authenticated;

/* ---------- Pembantu ---------- */
create or replace function public._is_admin(p_tid text) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from teachers t join admins a on a.email = t.email where t.id = p_tid) $$;

create or replace function public._can_class(p_tid text, p_class_id text) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from classes where id = p_class_id and (teacher_id = p_tid or _is_admin(p_tid))) $$;

create or replace function public._pid(p_token text) returns text
language plpgsql stable security definer set search_path = public
as $$
declare p text;
begin
  select parent_id into p from parent_sessions where token = p_token and created_at > now() - interval '60 days';
  if p is null then raise exception 'Sesi berakhir, silakan masuk lagi'; end if;
  return p;
end $$;

-- Data kelas kini menyertakan nama guru, dan (untuk guru) email akun orang tua tiap siswa
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
      from assignments g where g.class_id = any(p_class_ids)), '[]'::jsonb)
) $$;

/* ---------- Guru & admin ---------- */
drop function if exists public.teacher_register(text, text, text, text);
create or replace function public.teacher_register(p_name text, p_email text, p_password text, p_class_name text, p_admin_code text default null) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare t text; tok text; e text := lower(trim(p_email)); adm admins;
begin
  if char_length(coalesce(trim(p_name), '')) = 0 then raise exception 'Nama wajib diisi'; end if;
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Format email tidak valid'; end if;
  if char_length(coalesce(p_password, '')) < 6 then raise exception 'Kata sandi minimal 6 karakter'; end if;
  if exists (select 1 from teachers where email = e) then raise exception 'Email sudah terdaftar. Silakan masuk.'; end if;
  select * into adm from admins where email = e;
  if adm.email is not null and (p_admin_code is null or adm.setup_hash <> crypt(upper(trim(p_admin_code)), adm.setup_hash)) then
    raise exception 'Email ini terdaftar sebagai admin. Masukkan kode admin yang benar.';
  end if;
  insert into teachers (name, email, pass_hash) values (left(trim(p_name), 80), e, crypt(p_password, gen_salt('bf'))) returning id into t;
  perform _new_class(t, coalesce(nullif(trim(p_class_name), ''), 'Kelas 1'));
  tok := encode(gen_random_bytes(24), 'hex');
  insert into teacher_sessions (token, teacher_id) values (tok, t);
  return jsonb_build_object('token', tok, 'teacherId', t);
end $$;

create or replace function public.teacher_bundle(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); adm boolean := _is_admin(t); cls text[]; sts text[];
begin
  cls := array(select id from classes where adm or teacher_id = t order by created_at);
  sts := array(select id from students where class_id = any(cls));
  return _bundle(cls, sts, ((extract(epoch from now()) - 90 * 86400) * 1000)::bigint, true)
    || jsonb_build_object('teacher', (select jsonb_build_object('id', id, 'name', name, 'email', email, 'isAdmin', adm) from teachers where id = t));
end $$;

create or replace function public.teacher_rename_class(p_token text, p_class_id text, p_name text) returns void
language plpgsql volatile security definer set search_path = public
as $$ begin if _can_class(_tid(p_token), p_class_id) then update classes set name = left(trim(p_name), 80) where id = p_class_id; end if; end $$;

create or replace function public.teacher_add_students(p_token text, p_class_id text, p_names text[], p_avatars text[]) returns int
language plpgsql volatile security definer set search_path = public
as $$
declare pc text; n int := 0;
begin
  if not _can_class(_tid(p_token), p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
  if coalesce(array_length(p_names, 1), 0) > 60 then raise exception 'Maksimal 60 siswa sekaligus'; end if;
  for i in 1..coalesce(array_length(p_names, 1), 0) loop
    continue when char_length(trim(p_names[i])) = 0;
    loop pc := _code(6); exit when not exists (select 1 from students where parent_code = pc); end loop;
    insert into students (class_id, name, avatar, parent_code) values (p_class_id, left(trim(p_names[i]), 80), coalesce(p_avatars[i], '🦁'), pc);
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function public.teacher_remove_student(p_token text, p_student_id text) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token);
begin delete from students s where s.id = p_student_id and _can_class(t, s.class_id); end $$;

create or replace function public.teacher_add_assignment(p_token text, p_class_id text, p_skills text[], p_note text, p_due text) returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not _can_class(_tid(p_token), p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
  insert into assignments (class_id, skills, note, due) values (p_class_id, p_skills[1:100], left(p_note, 200), left(p_due, 20));
end $$;

create or replace function public.teacher_remove_assignment(p_token text, p_id text) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token);
begin delete from assignments g where g.id = p_id and _can_class(t, g.class_id); end $$;

/* ---------- Akun orang tua ---------- */
create or replace function public.parent_register(p_name text, p_email text, p_password text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare p text; tok text; e text := lower(trim(p_email));
begin
  if char_length(coalesce(trim(p_name), '')) = 0 then raise exception 'Nama wajib diisi'; end if;
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Format email tidak valid'; end if;
  if char_length(coalesce(p_password, '')) < 6 then raise exception 'Kata sandi minimal 6 karakter'; end if;
  if exists (select 1 from parents where email = e) then raise exception 'Email sudah terdaftar. Silakan masuk.'; end if;
  insert into parents (name, email, pass_hash) values (left(trim(p_name), 80), e, crypt(p_password, gen_salt('bf'))) returning id into p;
  tok := encode(gen_random_bytes(24), 'hex');
  insert into parent_sessions (token, parent_id) values (tok, p);
  return jsonb_build_object('token', tok, 'parentId', p);
end $$;

-- Login tidak memakai raise agar penghitung gagal tetap tersimpan
create or replace function public.parent_login(p_email text, p_password text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare r parents; tok text;
begin
  select * into r from parents where email = lower(trim(p_email));
  if r.id is null then return jsonb_build_object('error', 'Email atau kata sandi salah'); end if;
  if r.locked_until is not null and r.locked_until > now() then return jsonb_build_object('error', 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.'); end if;
  if r.pass_hash <> crypt(p_password, r.pass_hash) then
    update parents set failed = case when failed + 1 >= 5 then 0 else failed + 1 end,
      locked_until = case when failed + 1 >= 5 then now() + interval '15 minutes' else locked_until end where id = r.id;
    return jsonb_build_object('error', 'Email atau kata sandi salah');
  end if;
  update parents set failed = 0, locked_until = null where id = r.id;
  delete from parent_sessions where parent_id = r.id and created_at < now() - interval '60 days';
  tok := encode(gen_random_bytes(24), 'hex');
  insert into parent_sessions (token, parent_id) values (tok, r.id);
  return jsonb_build_object('token', tok, 'parentId', r.id);
end $$;

create or replace function public.parent_logout(p_token text) returns void
language sql volatile security definer set search_path = public
as $$ delete from parent_sessions where token = p_token $$;

-- Semua anak yang terhubung, termasuk kode kelasnya agar orang tua bisa belajar sebagai anak
create or replace function public.parent_home(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare p text := _pid(p_token); sts text[]; cls text[];
begin
  sts := array(select student_id from parent_students where parent_id = p);
  cls := array(select distinct class_id from students where id = any(sts));
  return _bundle(cls, sts, ((extract(epoch from now()) - 90 * 86400) * 1000)::bigint, false)
    || jsonb_build_object('parent', (select jsonb_build_object('id', id, 'name', name, 'email', email) from parents where id = p));
end $$;

-- Menghubungkan anak memakai kode orang tua dari guru
create or replace function public.parent_link(p_token text, p_parent_code text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare p text := _pid(p_token); s students;
begin
  select * into s from students where parent_code = upper(trim(p_parent_code));
  if s.id is null then raise exception 'Kode orang tua tidak ditemukan'; end if;
  insert into parent_students (parent_id, student_id) values (p, s.id) on conflict do nothing;
  return jsonb_build_object('id', s.id, 'name', s.name);
end $$;

create or replace function public.parent_unlink(p_token text, p_student_id text) returns void
language sql volatile security definer set search_path = public
as $$ delete from parent_students where parent_id = _pid(p_token) and student_id = p_student_id $$;

/* ---------- Hak akses ---------- */
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.teacher_register(text, text, text, text, text), public.teacher_login(text, text), public.teacher_logout(text),
  public.teacher_bundle(text), public.teacher_create_class(text, text), public.teacher_rename_class(text, text, text),
  public.teacher_add_students(text, text, text[], text[]), public.teacher_remove_student(text, text),
  public.teacher_add_assignment(text, text, text[], text, text), public.teacher_remove_assignment(text, text),
  public.class_roster(text), public.student_bundle(text, text), public.student_sync(text, text, jsonb, jsonb),
  public.parent_bundle(text), public.parent_register(text, text, text), public.parent_login(text, text),
  public.parent_logout(text), public.parent_home(text), public.parent_link(text, text), public.parent_unlink(text, text)
  to anon, authenticated;

/* ---------- Daftar admin & kode admin ---------- */
with c as materialized (
  select e as email, upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 8)) as code
  from unnest(array['rendynoorchandra@gmail.com', 'diana.kholifatul@gmail.com']) e
), ins as (
  insert into public.admins (email, setup_hash)
  select email, extensions.crypt(code, extensions.gen_salt('bf')) from c
  on conflict (email) do update set setup_hash = excluded.setup_hash
  returning email
)
select c.email, c.code as kode_admin,
  case when exists (select 1 from public.teachers t where t.email = c.email) then 'Sudah punya akun guru: langsung jadi admin saat masuk' else 'Daftar sebagai guru dengan kode ini' end as keterangan
from c join ins using (email);
