-- Metiq — data penelitian, ulasan tugas, NISN, dan kirim laporan tugas ke BBO Digital.
-- Jalankan sekali di SQL Editor setelah 005_targeted_assignments.sql. Aman dijalankan ulang.

/* ---------- 1. NISN siswa (opsional, 10 angka) ---------- */
alter table public.students add column if not exists nisn text check (nisn ~ '^[0-9]{10}$');
create unique index if not exists students_nisn on public.students (nisn) where nisn is not null;

create or replace function public.teacher_set_nisn(p_token text, p_student_id text, p_nisn text) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare cid text; n text := nullif(regexp_replace(coalesce(p_nisn, ''), '\D', '', 'g'), '');
begin
  select class_id into cid from students where id = p_student_id;
  if cid is null or not _can_class(_tid(p_token), cid) then raise exception 'Siswa tidak ditemukan'; end if;
  if n is not null and n !~ '^[0-9]{10}$' then raise exception 'NISN harus 10 angka'; end if;
  if n is not null and exists (select 1 from students where nisn = n and id <> p_student_id) then raise exception 'NISN sudah dipakai siswa lain'; end if;
  update students set nisn = n where id = p_student_id;
end $$;

/* ---------- 2. Catatan orang tua membuka laporan ---------- */
create table if not exists public.report_views (
  id bigserial primary key,
  student_id text not null references public.students(id) on delete cascade,
  parent_id text references public.parents(id) on delete set null,
  via text not null check (via in ('akun', 'kode')),
  viewed_at timestamptz not null default now()
);
create index if not exists report_views_student on public.report_views (student_id, viewed_at);
alter table public.report_views enable row level security;

-- Dicatat paling banyak sekali per 10 menit untuk orang tua dan anak yang sama
create or replace function public.log_report_view(p_student_id text, p_token text default null, p_pcode text default null) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare pid text; v text;
begin
  if p_token is not null then
    pid := _pid(p_token); v := 'akun';
    if not exists (select 1 from parent_students where parent_id = pid and student_id = p_student_id) then raise exception 'Siswa tidak ditemukan'; end if;
  elsif p_pcode is not null then
    v := 'kode';
    if not exists (select 1 from students where id = p_student_id and parent_code = upper(trim(p_pcode))) then raise exception 'Siswa tidak ditemukan'; end if;
  else raise exception 'Siswa tidak ditemukan';
  end if;
  if exists (select 1 from report_views where student_id = p_student_id and parent_id is not distinct from pid and via = v and viewed_at > now() - interval '10 minutes') then return; end if;
  insert into report_views (student_id, parent_id, via) values (p_student_id, pid, v);
end $$;

/* ---------- 3. Ulasan (bintang dan komentar) setelah tugas selesai ---------- */
create table if not exists public.feedback (
  id bigserial primary key,
  assignment_id text not null references public.assignments(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  by_role text not null check (by_role in ('siswa', 'ortu')),
  rating int not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  unique (assignment_id, student_id, by_role)
);
alter table public.feedback enable row level security;

create or replace function public.submit_feedback(p_code text, p_student_id text, p_assignment_id text, p_by text, p_rating int, p_comment text) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id); r text := case when p_by = 'ortu' then 'ortu' else 'siswa' end;
begin
  if not exists (select 1 from assignment_done where assignment_id = p_assignment_id and student_id = p_student_id) then
    raise exception 'Tugas belum selesai';
  end if;
  if not exists (select 1 from assignments where id = p_assignment_id and class_id = cid) then raise exception 'Tugas tidak ditemukan'; end if;
  insert into feedback (assignment_id, student_id, by_role, rating, comment)
  values (p_assignment_id, p_student_id, r, greatest(1, least(5, p_rating)), nullif(left(trim(coalesce(p_comment, '')), 500), ''))
  on conflict (assignment_id, student_id, by_role) do update set rating = excluded.rating, comment = excluded.comment, created_at = now();
end $$;

/* ---------- 4. Ringkasan tugas selesai + kirim ke BBO Digital ---------- */
alter table public.assignment_done add column if not exists summary jsonb;

-- Pengaturan integrasi (diisi lewat SQL Editor; tidak bisa dibaca dari aplikasi)
create table if not exists public.integrations (
  name text primary key,
  url text not null,
  apikey text not null,
  secret text not null,
  enabled boolean not null default true
);
alter table public.integrations enable row level security;

create table if not exists public.bbo_outbox (
  id bigserial primary key,
  assignment_id text not null,
  student_id text not null,
  status text not null,
  request_id bigint,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists bbo_outbox_pair on public.bbo_outbox (assignment_id, student_id);
alter table public.bbo_outbox enable row level security;

create extension if not exists pg_net;

-- Tugas selesai: p_summary berisi nama dan skor keterampilan dari aplikasi (dipakai untuk laporan ke BBO)
drop function if exists public.complete_assignment(text, text, text, text);
create or replace function public.complete_assignment(p_code text, p_student_id text, p_assignment_id text, p_by text default 'siswa', p_summary jsonb default null) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id);
begin
  if not exists (select 1 from assignments where id = p_assignment_id and class_id = cid
                 and (student_ids is null or p_student_id = any(student_ids))) then
    raise exception 'Tugas tidak ditemukan';
  end if;
  insert into assignment_done (assignment_id, student_id, done_by, summary)
  values (p_assignment_id, p_student_id, case when p_by = 'ortu' then 'ortu' else 'siswa' end,
          case when jsonb_typeof(p_summary) = 'array' and jsonb_array_length(p_summary) <= 100 then p_summary end)
  on conflict (assignment_id, student_id) do nothing;
end $$;

-- Dipanggil otomatis setiap ada tugas selesai. Kegagalan pengiriman tidak pernah membatalkan tugas selesai.
create or replace function public._send_bbo() returns trigger
language plpgsql security definer set search_path = public
as $$
declare cfg record; s record; rep jsonb; rid bigint;
begin
  select * into cfg from integrations where name = 'bbo' and enabled;
  if not found then return new; end if;
  begin
    select st.nisn, st.name sname, c.name cname, t.name tname, a.note, a.due, a.created_at acreated, a.student_ids
      into s from students st join classes c on c.id = st.class_id join teachers t on t.id = c.teacher_id
      join assignments a on a.id = new.assignment_id where st.id = new.student_id;
    if s.nisn is null then
      insert into bbo_outbox (assignment_id, student_id, status) values (new.assignment_id, new.student_id, 'tanpa_nisn');
      return new;
    end if;
    rep := jsonb_build_object(
      'id', new.assignment_id || ':' || new.student_id,
      'source', 'metiq',
      'nisn', s.nisn,
      'student_name', s.sname,
      'class_name', s.cname,
      'teacher_name', s.tname,
      'assignment', jsonb_build_object('note', s.note, 'due', s.due, 'created_at', s.acreated, 'targeted', s.student_ids is not null),
      'completed_at', new.done_at,
      'done_by', new.done_by,
      'skills', coalesce(new.summary, '[]'::jsonb),
      'link', 'https://metiq-math.vercel.app/');
    rid := net.http_post(
      url := rtrim(cfg.url, '/') || '/rest/v1/rpc/metiq_ingest',
      body := jsonb_build_object('p_secret', cfg.secret, 'p_report', rep),
      headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', cfg.apikey));
    insert into bbo_outbox (assignment_id, student_id, status, request_id) values (new.assignment_id, new.student_id, 'dikirim', rid);
  exception when others then
    insert into bbo_outbox (assignment_id, student_id, status, detail) values (new.assignment_id, new.student_id, 'gagal', left(sqlerrm, 300));
  end;
  return new;
end $$;
drop trigger if exists assignment_done_bbo on public.assignment_done;
create trigger assignment_done_bbo after insert on public.assignment_done for each row execute function public._send_bbo();

-- Status pengiriman terakhir untuk satu pasangan tugas–siswa
create or replace function public._bbo_status(p_aid text, p_sid text) returns text
language sql stable security definer set search_path = public, net
as $$
select case
  when o.status <> 'dikirim' then o.status
  when r.id is null then 'dikirim'
  when r.status_code between 200 and 299 then 'diterima'
  else 'gagal' end
from bbo_outbox o left join net._http_response r on r.id = o.request_id
where o.assignment_id = p_aid and o.student_id = p_sid order by o.id desc limit 1
$$;

/* ---------- 5. Data kelas: NISN, laporan dibuka, ulasan, status BBO ---------- */
create or replace function public._bundle(p_class_ids text[], p_student_ids text[], p_since bigint, p_codes boolean)
returns jsonb language sql stable security definer set search_path = public
as $$
select jsonb_build_object(
  'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'teacherId', c.teacher_id, 'teacherName', t.name, 'name', c.name, 'code', c.code) order by c.created_at)
      from classes c join teachers t on t.id = c.teacher_id where c.id = any(p_class_ids)), '[]'::jsonb),
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

revoke execute on function public._send_bbo(), public._bbo_status(text, text) from public, anon, authenticated;
revoke execute on function public.complete_assignment(text, text, text, text, jsonb) from public;
grant execute on function public.teacher_set_nisn(text, text, text), public.log_report_view(text, text, text),
  public.submit_feedback(text, text, text, text, int, text), public.complete_assignment(text, text, text, text, jsonb) to anon, authenticated;
