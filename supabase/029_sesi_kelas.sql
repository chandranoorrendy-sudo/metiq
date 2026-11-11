-- Metiq — Sesi kelas: tugas langsung dan ujian.
-- Guru menyiapkan soal (dibuat Metiq atau ditulis sendiri), lalu memulai sesi. Siswa di kelas itu melihatnya di
-- laptop, tablet, atau HP, mengerjakan dengan kertas coret, lalu mengumpulkan. Hasilnya langsung terlihat di dasbor guru.
-- Siswa yang mengerjakan di kertas (soal dicetak) dinilai guru per soal di dasbor (kolom paper).
-- Kunci jawaban ujian tidak pernah dikirim ke perangkat siswa selama ujian berlangsung; jawaban dinilai di server.
-- Jalankan setelah 028.

create table if not exists public.class_sessions (
  id text primary key default public._id(),
  class_id text not null references public.classes(id) on delete cascade,
  teacher_id text references public.teachers(id) on delete set null,
  kind text not null check (kind in ('tugas', 'ujian')),
  title text not null check (char_length(title) between 1 and 120),
  questions jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'live', 'closed')),
  reveal boolean not null default false,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz
);
create index if not exists class_sessions_class on public.class_sessions (class_id, status, created_at desc);

create table if not exists public.session_answers (
  session_id text not null references public.class_sessions(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  paper boolean not null default false,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score int not null default 0,
  primary key (session_id, student_id)
);
create index if not exists session_answers_student on public.session_answers (student_id);

alter table public.class_sessions enable row level security;
alter table public.session_answers enable row level security;
revoke all on public.class_sessions, public.session_answers from anon, authenticated;

/* ---------- Pembantu ---------- */
-- Penyamaan jawaban isian, sama dengan norm() di js/sesi.js: tanpa tag, huruf kecil, minus seragam, tanpa titik dan spasi, tanpa awalan Rp
create or replace function public._sesi_norm(x text) returns text language sql immutable
as $$ select regexp_replace(regexp_replace(replace(replace(lower(regexp_replace(coalesce(x, ''), '<[^>]+>', '', 'g')), '−', '-'), '–', '-'), '[.[:space:]]|&nbsp;', '', 'g'), '^rp', '') $$;

-- Soal untuk siswa: saat ujian berjalan, kunci dan penjelasan dibuang
create or replace function public._sesi_qs(q jsonb, hide boolean) returns jsonb language sql immutable
as $$ select coalesce(jsonb_agg(case when hide then x - 'answer' - 'explain' - 'meta' else x end order by o), '[]'::jsonb) from jsonb_array_elements(q) with ordinality t(x, o) $$;

create or replace function public._ms(t timestamptz) returns bigint language sql immutable
as $$ select (extract(epoch from t) * 1000)::bigint $$;

create or replace function public._sesi_json(s public.class_sessions, hide boolean) returns jsonb language sql stable
as $$ select jsonb_build_object('id', s.id, 'classId', s.class_id, 'kind', s.kind, 'title', s.title, 'status', s.status, 'reveal', s.reveal,
  'settings', s.settings, 'questions', _sesi_qs(s.questions, hide), 'createdAt', _ms(s.created_at), 'startedAt', _ms(s.started_at), 'endedAt', _ms(s.ended_at)) $$;

create or replace function public._sesi_row(a public.session_answers) returns jsonb language sql stable
as $$ select case when a.session_id is null then null else jsonb_build_object('sid', a.student_id, 'answers', a.answers, 'paper', a.paper, 'score', a.score,
  'startedAt', _ms(a.started_at), 'submittedAt', _ms(a.submitted_at)) end $$;

create or replace function public._sesi_mine(p_session text) returns public.class_sessions
language plpgsql stable security definer set search_path = public
as $$
declare s class_sessions;
begin
  select * into s from class_sessions where id = p_session;
  if not found then raise exception 'Sesi tidak ditemukan'; end if;
  return s;
end $$;

/* ---------- Guru ---------- */
create or replace function public.sesi_list(p_token text, p_class_id text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token);
begin
  if not _can_class(t, p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
  return coalesce((select jsonb_agg(x.j order by x.c desc) from (
    select s.created_at c, jsonb_build_object('id', s.id, 'kind', s.kind, 'title', s.title, 'status', s.status, 'reveal', s.reveal, 'settings', s.settings,
      'n', jsonb_array_length(s.questions), 'createdAt', _ms(s.created_at), 'startedAt', _ms(s.started_at), 'endedAt', _ms(s.ended_at),
      'joined', (select count(*) from session_answers a where a.session_id = s.id),
      'submitted', (select count(*) from session_answers a where a.session_id = s.id and a.submitted_at is not null),
      'avg', (select round(avg(a.score * 100.0 / greatest(jsonb_array_length(s.questions), 1))) from session_answers a where a.session_id = s.id and a.submitted_at is not null)) j
    from class_sessions s where s.class_id = p_class_id order by s.created_at desc limit 80) x), '[]'::jsonb);
end $$;

create or replace function public.sesi_get(p_token text, p_id text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); s class_sessions := _sesi_mine(p_id);
begin
  if not _can_class(t, s.class_id) then raise exception 'Sesi tidak ditemukan'; end if;
  return jsonb_build_object('session', _sesi_json(s, false), 'now', _ms(now()),
    'rows', coalesce((select jsonb_agg(_sesi_row(a)) from session_answers a where a.session_id = p_id), '[]'::jsonb));
end $$;

create or replace function public.sesi_save(p_token text, p_class_id text, p_id text, p_kind text, p_title text, p_questions jsonb, p_settings jsonb) returns text
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); sid text; n int;
begin
  if not _can_class(t, p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
  if p_kind not in ('tugas', 'ujian') then raise exception 'Jenis sesi tidak dikenal'; end if;
  if jsonb_typeof(p_questions) <> 'array' then raise exception 'Daftar soal tidak sah'; end if;
  n := jsonb_array_length(p_questions);
  if n < 1 or n > 60 then raise exception 'Jumlah soal harus 1 sampai 60'; end if;
  if pg_column_size(p_questions) > 900000 then raise exception 'Soal terlalu besar'; end if;
  if exists (select 1 from jsonb_array_elements(p_questions) q where coalesce(q->>'id', '') = '' or coalesce(q->>'answer', '') = '' or coalesce(q->>'type', '') not in ('choice', 'input')) then
    raise exception 'Setiap soal butuh nomor, jenis, dan kunci jawaban';
  end if;
  if coalesce(p_id, '') = '' then
    insert into class_sessions (class_id, teacher_id, kind, title, questions, settings)
    values (p_class_id, t, p_kind, left(trim(p_title), 120), p_questions, coalesce(p_settings, '{}'::jsonb)) returning id into sid;
  else
    update class_sessions set kind = p_kind, title = left(trim(p_title), 120), questions = p_questions, settings = coalesce(p_settings, '{}'::jsonb)
    where id = p_id and class_id = p_class_id and status = 'draft' returning id into sid;
    if sid is null then raise exception 'Sesi yang sudah dimulai tidak bisa diubah'; end if;
  end if;
  return sid;
end $$;

-- Satu sesi berjalan per kelas: memulai sesi baru menutup sesi lain yang masih berjalan
create or replace function public.sesi_start(p_token text, p_id text) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); s class_sessions := _sesi_mine(p_id);
begin
  if not _can_class(t, s.class_id) then raise exception 'Sesi tidak ditemukan'; end if;
  if s.status <> 'draft' then raise exception 'Sesi ini sudah pernah dimulai'; end if;
  update session_answers set submitted_at = now() where submitted_at is null and session_id in (select id from class_sessions where class_id = s.class_id and status = 'live');
  update class_sessions set status = 'closed', ended_at = now() where class_id = s.class_id and status = 'live';
  update class_sessions set status = 'live', started_at = now() where id = p_id;
end $$;

-- Mengakhiri sesi (jawaban yang belum dikumpulkan ikut terkumpul), atau hanya mengubah apakah nilai ditampilkan ke siswa
create or replace function public.sesi_end(p_token text, p_id text, p_reveal boolean) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); s class_sessions := _sesi_mine(p_id);
begin
  if not _can_class(t, s.class_id) then raise exception 'Sesi tidak ditemukan'; end if;
  update session_answers set submitted_at = now() where session_id = p_id and submitted_at is null and not paper;
  update class_sessions set status = case when status = 'draft' then 'draft' else 'closed' end, ended_at = coalesce(ended_at, now()), reveal = coalesce(p_reveal, false) where id = p_id;
end $$;

create or replace function public.sesi_delete(p_token text, p_id text) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); s class_sessions := _sesi_mine(p_id);
begin
  if not _can_class(t, s.class_id) then raise exception 'Sesi tidak ditemukan'; end if;
  delete from class_sessions where id = p_id;
end $$;

-- Hasil dari kertas: guru menandai benar/salah setiap soal untuk satu siswa. p_marks = {"q1": true, "q2": false, ...}; kosong = hapus
create or replace function public.sesi_paper(p_token text, p_id text, p_student_id text, p_marks jsonb) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); s class_sessions := _sesi_mine(p_id); a jsonb;
begin
  if not _can_class(t, s.class_id) then raise exception 'Sesi tidak ditemukan'; end if;
  if not exists (select 1 from students where id = p_student_id and class_id = s.class_id) then raise exception 'Siswa tidak ditemukan'; end if;
  if p_marks is null or p_marks = '{}'::jsonb then delete from session_answers where session_id = p_id and student_id = p_student_id and paper; return; end if;
  select coalesce(jsonb_object_agg(q->>'id', jsonb_build_object('ok', (p_marks->>(q->>'id'))::boolean, 'paper', true)), '{}'::jsonb) into a
  from jsonb_array_elements(s.questions) q where jsonb_typeof(p_marks->(q->>'id')) = 'boolean';
  insert into session_answers (session_id, student_id, answers, paper, submitted_at, score)
  values (p_id, p_student_id, a, true, now(), (select count(*) from jsonb_each(a) e(k, v) where (v->>'ok')::boolean))
  on conflict (session_id, student_id) do update set answers = excluded.answers, paper = true, submitted_at = coalesce(session_answers.submitted_at, now()), score = excluded.score;
end $$;

/* ---------- Siswa (kode kelas + id siswa, seperti student_sync) ---------- */
-- Sesi yang sedang berjalan di kelas siswa, atau ujian yang baru selesai dan nilainya sudah ditampilkan guru (24 jam)
create or replace function public.student_sesi(p_code text, p_student_id text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id); s class_sessions; r session_answers;
begin
  if cid is null then return jsonb_build_object('live', null, 'now', _ms(now())); end if;
  select * into s from class_sessions where class_id = cid and status = 'live' order by started_at desc limit 1;
  if found then
    select * into r from session_answers where session_id = s.id and student_id = p_student_id;
    return jsonb_build_object('live', _sesi_json(s, s.kind = 'ujian'), 'mine', _sesi_row(r), 'now', _ms(now()));
  end if;
  select c.* into s from class_sessions c join session_answers a on a.session_id = c.id and a.student_id = p_student_id and not a.paper
  where c.class_id = cid and c.status = 'closed' and c.reveal and c.ended_at > now() - interval '1 day' order by c.ended_at desc limit 1;
  if found then
    select * into r from session_answers where session_id = s.id and student_id = p_student_id;
    return jsonb_build_object('live', null, 'review', _sesi_json(s, false), 'mine', _sesi_row(r), 'now', _ms(now()));
  end if;
  return jsonb_build_object('live', null, 'now', _ms(now()));
end $$;

create or replace function public.student_sesi_join(p_code text, p_student_id text, p_session text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id); r session_answers;
begin
  if not exists (select 1 from class_sessions where id = p_session and class_id = cid and status = 'live') then raise exception 'Sesi sudah selesai'; end if;
  insert into session_answers (session_id, student_id) values (p_session, p_student_id) on conflict do nothing;
  select * into r from session_answers where session_id = p_session and student_id = p_student_id;
  return _sesi_row(r);
end $$;

-- Satu jawaban, langsung tersimpan supaya guru melihat kemajuan. Tugas: dijawab sekali dan hasilnya dikembalikan.
-- Ujian: boleh diganti sampai dikumpulkan, hasilnya tidak dikembalikan.
create or replace function public.student_sesi_answer(p_code text, p_student_id text, p_session text, p_qid text, p_given text, p_ms int) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id); s class_sessions; q jsonb; r session_answers; ok boolean; a jsonb; lim int;
begin
  select * into s from class_sessions where id = p_session and class_id = cid and status = 'live';
  if not found then raise exception 'Sesi sudah selesai'; end if;
  select x into q from jsonb_array_elements(s.questions) x where x->>'id' = p_qid limit 1;
  if q is null then raise exception 'Soal tidak ditemukan'; end if;
  insert into session_answers (session_id, student_id) values (p_session, p_student_id) on conflict do nothing;
  select * into r from session_answers where session_id = p_session and student_id = p_student_id for update;
  if r.submitted_at is not null then raise exception 'Jawaban sudah dikumpulkan'; end if;
  if s.kind = 'tugas' and r.answers ? p_qid then return jsonb_build_object('ok', (r.answers->p_qid->>'ok')::boolean); end if;
  lim := coalesce((s.settings->>'minutes')::int, 0);
  if s.kind = 'ujian' and lim > 0 and now() > r.started_at + make_interval(mins => lim + 1) then raise exception 'Waktu ujian sudah habis'; end if;
  ok := case when q->>'type' = 'choice' then left(coalesce(p_given, ''), 300) = q->>'answer' else _sesi_norm(p_given) = _sesi_norm(q->>'answer') end;
  a := r.answers || jsonb_build_object(p_qid, jsonb_build_object('given', left(coalesce(p_given, ''), 80), 'ok', ok, 'ms', least(greatest(coalesce(p_ms, 0), 0), 3600000), 'ts', _ms(now())));
  update session_answers set answers = a, score = (select count(*) from jsonb_each(a) e(k, v) where (v->>'ok')::boolean)
  where session_id = p_session and student_id = p_student_id;
  return jsonb_build_object('ok', case when s.kind = 'tugas' then ok end);
end $$;

create or replace function public.student_sesi_submit(p_code text, p_student_id text, p_session text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id); s class_sessions; r session_answers;
begin
  select * into s from class_sessions where id = p_session and class_id = cid;
  if not found then raise exception 'Sesi tidak ditemukan'; end if;
  update session_answers set submitted_at = coalesce(submitted_at, now()) where session_id = p_session and student_id = p_student_id;
  select * into r from session_answers where session_id = p_session and student_id = p_student_id;
  return jsonb_build_object('score', case when s.kind = 'tugas' or s.reveal then r.score end, 'total', jsonb_array_length(s.questions));
end $$;

revoke execute on function public._sesi_norm(text), public._sesi_qs(jsonb, boolean), public._ms(timestamptz), public._sesi_json(public.class_sessions, boolean),
  public._sesi_row(public.session_answers), public._sesi_mine(text) from public, anon, authenticated;
grant execute on function public.sesi_list(text, text), public.sesi_get(text, text), public.sesi_save(text, text, text, text, text, jsonb, jsonb),
  public.sesi_start(text, text), public.sesi_end(text, text, boolean), public.sesi_delete(text, text), public.sesi_paper(text, text, text, jsonb),
  public.student_sesi(text, text), public.student_sesi_join(text, text, text), public.student_sesi_answer(text, text, text, text, text, int),
  public.student_sesi_submit(text, text, text) to anon, authenticated;
