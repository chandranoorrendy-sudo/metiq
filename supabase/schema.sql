-- Metiq — skema database Supabase.
-- Semua tabel dikunci (RLS aktif tanpa policy). Aplikasi hanya mengakses data lewat
-- fungsi RPC di bawah, yang memeriksa token guru, kode kelas, atau kode orang tua.

create extension if not exists pgcrypto with schema extensions;

create or replace function public._id() returns text language sql volatile
as $$ select replace(gen_random_uuid()::text, '-', '') $$;

create table if not exists public.teachers (
  id text primary key default public._id(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null unique check (char_length(email) between 3 and 200),
  pass_hash text not null,
  failed int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.teacher_sessions (
  token text primary key,
  teacher_id text not null references public.teachers(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.classes (
  id text primary key default public._id(),
  teacher_id text not null references public.teachers(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  code text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.students (
  id text primary key default public._id(),
  class_id text not null references public.classes(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  avatar text not null,
  parent_code text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.progress (
  student_id text not null references public.students(id) on delete cascade,
  skill text not null,
  score int not null default 0,
  att int not null default 0,
  ok int not null default 0,
  ms bigint not null default 0,
  last bigint not null default 0,
  mastered_at bigint,
  primary key (student_id, skill)
);
create table if not exists public.answers (
  id text primary key,
  student_id text not null references public.students(id) on delete cascade,
  skill text not null,
  ok boolean not null,
  given text,
  answer text,
  text text,
  tag text,
  ms int,
  ts bigint not null
);
create index if not exists answers_student_ts on public.answers (student_id, ts desc);
create table if not exists public.assignments (
  id text primary key default public._id(),
  class_id text not null references public.classes(id) on delete cascade,
  skills text[] not null,
  note text,
  due text,
  created_at timestamptz not null default now()
);
create index if not exists classes_teacher on public.classes (teacher_id);
create index if not exists students_class on public.students (class_id);
create index if not exists assignments_class on public.assignments (class_id);
create index if not exists sessions_teacher on public.teacher_sessions (teacher_id);

alter table public.teachers enable row level security;
alter table public.teacher_sessions enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.progress enable row level security;
alter table public.answers enable row level security;
alter table public.assignments enable row level security;
revoke all on all tables in schema public from anon, authenticated;

/* ---------- Pembantu internal ---------- */
create or replace function public._code(n int) returns text language plpgsql volatile
as $$
declare chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; s text := '';
begin
  for i in 1..n loop s := s || substr(chars, 1 + floor(random() * length(chars))::int, 1); end loop;
  return s;
end $$;

create or replace function public._tid(p_token text) returns text
language plpgsql stable security definer set search_path = public
as $$
declare t text;
begin
  select teacher_id into t from teacher_sessions where token = p_token and created_at > now() - interval '60 days';
  if t is null then raise exception 'Sesi berakhir, silakan masuk lagi'; end if;
  return t;
end $$;

create or replace function public._new_class(p_teacher text, p_name text) returns text
language plpgsql volatile security definer set search_path = public
as $$
declare c text; cid text;
begin
  loop c := _code(5); exit when not exists (select 1 from classes where code = c); end loop;
  insert into classes (teacher_id, name, code) values (p_teacher, left(trim(p_name), 80), c) returning id into cid;
  return cid;
end $$;

create or replace function public._bundle(p_class_ids text[], p_student_ids text[], p_since bigint, p_codes boolean)
returns jsonb language sql stable security definer set search_path = public
as $$
select jsonb_build_object(
  'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'teacherId', c.teacher_id, 'name', c.name, 'code', c.code)) from classes c where c.id = any(p_class_ids)), '[]'::jsonb),
  'students', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'classId', s.class_id, 'name', s.name, 'avatar', s.avatar, 'parentCode', case when p_codes then s.parent_code end)) from students s where s.id = any(p_student_ids)), '[]'::jsonb),
  'progress', coalesce((select jsonb_object_agg(x.sid, x.m) from (
      select p.student_id sid, jsonb_object_agg(p.skill, jsonb_build_object('score', p.score, 'att', p.att, 'ok', p.ok, 'ms', p.ms, 'last', p.last, 'masteredAt', p.mastered_at)) m
      from progress p where p.student_id = any(p_student_ids) group by p.student_id) x), '{}'::jsonb),
  'answers', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'sid', a.student_id, 'skill', a.skill, 'ok', a.ok, 'given', a.given, 'answer', a.answer, 'text', a.text, 'tag', a.tag, 'ms', a.ms, 'ts', a.ts) order by a.ts)
      from (select * from answers where student_id = any(p_student_ids) and ts >= p_since order by ts desc limit 30000) a), '[]'::jsonb),
  'assignments', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'classId', g.class_id, 'skills', g.skills, 'note', g.note, 'due', g.due, 'createdAt', (extract(epoch from g.created_at) * 1000)::bigint) order by g.created_at)
      from assignments g where g.class_id = any(p_class_ids)), '[]'::jsonb)
) $$;

/* ---------- Guru ---------- */
create or replace function public.teacher_register(p_name text, p_email text, p_password text, p_class_name text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare t text; tok text; e text := lower(trim(p_email));
begin
  if char_length(coalesce(trim(p_name), '')) = 0 then raise exception 'Nama wajib diisi'; end if;
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Format email tidak valid'; end if;
  if char_length(coalesce(p_password, '')) < 6 then raise exception 'Kata sandi minimal 6 karakter'; end if;
  if exists (select 1 from teachers where email = e) then raise exception 'Email sudah terdaftar. Silakan masuk.'; end if;
  insert into teachers (name, email, pass_hash) values (left(trim(p_name), 80), e, crypt(p_password, gen_salt('bf'))) returning id into t;
  perform _new_class(t, coalesce(nullif(trim(p_class_name), ''), 'Kelas 1'));
  tok := encode(gen_random_bytes(24), 'hex');
  insert into teacher_sessions (token, teacher_id) values (tok, t);
  return jsonb_build_object('token', tok, 'teacherId', t);
end $$;

-- Login tidak memakai raise agar penghitung gagal tetap tersimpan
create or replace function public.teacher_login(p_email text, p_password text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare r teachers; tok text;
begin
  select * into r from teachers where email = lower(trim(p_email));
  if r.id is null then return jsonb_build_object('error', 'Email atau kata sandi salah'); end if;
  if r.locked_until is not null and r.locked_until > now() then return jsonb_build_object('error', 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.'); end if;
  if r.pass_hash <> crypt(p_password, r.pass_hash) then
    update teachers set failed = case when failed + 1 >= 5 then 0 else failed + 1 end,
      locked_until = case when failed + 1 >= 5 then now() + interval '15 minutes' else locked_until end where id = r.id;
    return jsonb_build_object('error', 'Email atau kata sandi salah');
  end if;
  update teachers set failed = 0, locked_until = null where id = r.id;
  delete from teacher_sessions where teacher_id = r.id and created_at < now() - interval '60 days';
  tok := encode(gen_random_bytes(24), 'hex');
  insert into teacher_sessions (token, teacher_id) values (tok, r.id);
  return jsonb_build_object('token', tok, 'teacherId', r.id);
end $$;

create or replace function public.teacher_logout(p_token text) returns void
language sql volatile security definer set search_path = public
as $$ delete from teacher_sessions where token = p_token $$;

create or replace function public.teacher_bundle(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); cls text[]; sts text[];
begin
  cls := array(select id from classes where teacher_id = t order by created_at);
  sts := array(select id from students where class_id = any(cls));
  return _bundle(cls, sts, ((extract(epoch from now()) - 90 * 86400) * 1000)::bigint, true)
    || jsonb_build_object('teacher', (select jsonb_build_object('id', id, 'name', name, 'email', email) from teachers where id = t));
end $$;

create or replace function public.teacher_create_class(p_token text, p_name text) returns text
language plpgsql volatile security definer set search_path = public
as $$ begin return _new_class(_tid(p_token), p_name); end $$;

create or replace function public.teacher_rename_class(p_token text, p_class_id text, p_name text) returns void
language plpgsql volatile security definer set search_path = public
as $$ begin update classes set name = left(trim(p_name), 80) where id = p_class_id and teacher_id = _tid(p_token); end $$;

create or replace function public.teacher_add_students(p_token text, p_class_id text, p_names text[], p_avatars text[]) returns int
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); pc text; n int := 0;
begin
  if not exists (select 1 from classes where id = p_class_id and teacher_id = t) then raise exception 'Kelas tidak ditemukan'; end if;
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
as $$ begin delete from students s using classes c where s.id = p_student_id and s.class_id = c.id and c.teacher_id = _tid(p_token); end $$;

create or replace function public.teacher_add_assignment(p_token text, p_class_id text, p_skills text[], p_note text, p_due text) returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not exists (select 1 from classes where id = p_class_id and teacher_id = _tid(p_token)) then raise exception 'Kelas tidak ditemukan'; end if;
  insert into assignments (class_id, skills, note, due) values (p_class_id, p_skills[1:100], left(p_note, 200), left(p_due, 20));
end $$;

create or replace function public.teacher_remove_assignment(p_token text, p_id text) returns void
language plpgsql volatile security definer set search_path = public
as $$ begin delete from assignments g using classes c where g.id = p_id and g.class_id = c.id and c.teacher_id = _tid(p_token); end $$;

/* ---------- Siswa ---------- */
create or replace function public.class_roster(p_code text) returns jsonb
language sql stable security definer set search_path = public
as $$
select case when c.id is null then null else jsonb_build_object(
  'class', jsonb_build_object('id', c.id, 'name', c.name, 'code', c.code),
  'students', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'avatar', s.avatar) order by s.name) from students s where s.class_id = c.id), '[]'::jsonb)) end
from (select 1) one left join classes c on c.code = upper(trim(p_code))
$$;

create or replace function public._student_in(p_code text, p_sid text) returns text
language plpgsql stable security definer set search_path = public
as $$
declare cid text;
begin
  select s.class_id into cid from students s join classes c on c.id = s.class_id where s.id = p_sid and c.code = upper(trim(p_code));
  if cid is null then raise exception 'Siswa tidak ditemukan'; end if;
  return cid;
end $$;

create or replace function public.student_bundle(p_code text, p_student_id text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id);
begin
  return _bundle(array[cid], array[p_student_id], ((extract(epoch from now()) - 30 * 86400) * 1000)::bigint, false);
end $$;

create or replace function public.student_sync(p_code text, p_student_id text, p_answers jsonb, p_progress jsonb) returns int
language plpgsql volatile security definer set search_path = public
as $$
declare n int;
begin
  perform _student_in(p_code, p_student_id);
  if jsonb_array_length(coalesce(p_answers, '[]'::jsonb)) > 500 then raise exception 'Terlalu banyak data sekaligus'; end if;
  insert into answers (id, student_id, skill, ok, given, answer, text, tag, ms, ts)
  select left(a->>'id', 40), p_student_id, left(a->>'skill', 10), coalesce((a->>'ok')::boolean, false), left(a->>'given', 60), left(a->>'answer', 60),
         left(a->>'text', 300), left(a->>'tag', 30), least(coalesce((a->>'ms')::numeric, 0), 600000)::int, coalesce((a->>'ts')::bigint, 0)
  from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) a
  where a ? 'id'
  on conflict (id) do nothing;
  get diagnostics n = row_count;
  insert into progress (student_id, skill, score, att, ok, ms, last, mastered_at)
  select p_student_id, left(k, 10), least(greatest((v->>'score')::int, 0), 100), (v->>'att')::int, (v->>'ok')::int,
         coalesce((v->>'ms')::numeric, 0)::bigint, coalesce((v->>'last')::bigint, 0), (v->>'masteredAt')::bigint
  from jsonb_each(coalesce(p_progress, '{}'::jsonb)) as e(k, v)
  on conflict (student_id, skill) do update set score = excluded.score, att = excluded.att, ok = excluded.ok, ms = excluded.ms,
    last = excluded.last, mastered_at = coalesce(progress.mastered_at, excluded.mastered_at)
  where excluded.att >= progress.att;
  return n;
end $$;

/* ---------- Orang tua ---------- */
create or replace function public.parent_bundle(p_code text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare s students;
begin
  select * into s from students where parent_code = upper(trim(p_code));
  if s.id is null then return null; end if;
  return _bundle(array[s.class_id], array[s.id], ((extract(epoch from now()) - 90 * 86400) * 1000)::bigint, false);
end $$;

/* ---------- Hak akses ---------- */
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.teacher_register(text, text, text, text), public.teacher_login(text, text), public.teacher_logout(text),
  public.teacher_bundle(text), public.teacher_create_class(text, text), public.teacher_rename_class(text, text, text),
  public.teacher_add_students(text, text, text[], text[]), public.teacher_remove_student(text, text),
  public.teacher_add_assignment(text, text, text[], text, text), public.teacher_remove_assignment(text, text),
  public.class_roster(text), public.student_bundle(text, text), public.student_sync(text, text, jsonb, jsonb),
  public.parent_bundle(text) to anon, authenticated;
