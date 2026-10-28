-- Metiq — banyak sekolah, pengajuan akun, dan super admin.
-- Jalankan sekali di SQL Editor setelah 007_trial_usage.sql. Aman dijalankan ulang.
--   • Super admin = email di tabel admins (rendynoorchandra@gmail.com, diana.kholifatul@gmail.com): melihat semua sekolah dan menyetujui pengajuan.
--   • Admin sekolah (koordinator) = guru dengan is_school_admin: melihat semua kelas di sekolahnya.
--   • Pendaftaran guru, keluarga homeschool, dan orang tua menjadi pengajuan yang aktif setelah disetujui super admin.
--   • Data yang sudah ada dimasukkan ke sekolah "Kuttab Imam Al-Ghazali"; Diana menjadi admin sekolahnya.

/* ---------- 1. Sekolah ---------- */
create table if not exists public.schools (
  id text primary key default public._id(),
  name text not null check (char_length(name) between 1 and 100),
  kind text not null default 'sekolah' check (kind in ('sekolah', 'homeschool')),
  city text check (char_length(city) <= 60),
  created_at timestamptz not null default now()
);
alter table public.schools enable row level security;
revoke all on public.schools from anon, authenticated;

alter table public.teachers add column if not exists school_id text references public.schools(id) on delete set null;
alter table public.teachers add column if not exists status text not null default 'aktif' check (status in ('aktif', 'menunggu', 'ditolak'));
alter table public.teachers add column if not exists is_school_admin boolean not null default false;
alter table public.parents add column if not exists status text not null default 'aktif' check (status in ('aktif', 'menunggu', 'ditolak'));

insert into public.schools (id, name, kind) values ('kuttab-iag', 'Kuttab Imam Al-Ghazali', 'sekolah') on conflict (id) do nothing;
insert into public.schools (id, name, kind) values ('sekolah-uji', 'Sekolah Uji (hapus)', 'sekolah') on conflict (id) do nothing;
update public.teachers set school_id = case when name ilike '%(hapus)%' then 'sekolah-uji' else 'kuttab-iag' end where school_id is null;
update public.teachers set is_school_admin = true where email = 'diana.kholifatul@gmail.com';

/* ---------- 2. Pengajuan akun ---------- */
create table if not exists public.requests (
  id text primary key default public._id(),
  code text not null unique,
  kind text not null check (kind in ('guru', 'homeschool', 'ortu', 'siswa')),
  name text not null check (char_length(name) between 1 and 80),
  contact text check (char_length(contact) <= 120),
  school_name text check (char_length(school_name) <= 100),
  details jsonb,
  teacher_id text references public.teachers(id) on delete set null,
  parent_id text references public.parents(id) on delete set null,
  status text not null default 'menunggu' check (status in ('menunggu', 'disetujui', 'ditolak')),
  result jsonb,
  note text check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by text
);
create index if not exists requests_status on public.requests (status, created_at);
alter table public.requests enable row level security;
revoke all on public.requests from anon, authenticated;

-- Membuat pengajuan. Guru/homeschool/orang tua langsung punya akun berstatus "menunggu" (belum bisa masuk).
create or replace function public._request(p_kind text, p_name text, p_email text, p_password text, p_contact text, p_school text, p_details jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare e text := lower(trim(coalesce(p_email, ''))); t text; p text; c text; d jsonb := coalesce(p_details, '{}'::jsonb);
begin
  if p_kind not in ('guru', 'homeschool', 'ortu', 'siswa') then raise exception 'Jenis pengajuan tidak dikenal'; end if;
  if char_length(coalesce(trim(p_name), '')) = 0 then raise exception 'Nama wajib diisi'; end if;
  if char_length((d)::text) > 2000 then raise exception 'Data pengajuan terlalu panjang'; end if;
  if (select count(*) from requests where created_at > now() - interval '1 hour') > 60 then raise exception 'Terlalu banyak pengajuan. Coba lagi nanti.'; end if;
  if p_kind <> 'siswa' then
    if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Format email tidak valid'; end if;
    if char_length(coalesce(p_password, '')) < 6 then raise exception 'Kata sandi minimal 6 karakter'; end if;
  elsif char_length(coalesce(trim(p_contact), '')) < 5 then raise exception 'Isi nomor WhatsApp atau email orang tua';
  end if;
  if p_kind in ('guru', 'homeschool') then
    if exists (select 1 from teachers where email = e) then raise exception 'Email sudah terdaftar. Silakan masuk, atau cek status pengajuan.'; end if;
    insert into teachers (name, email, pass_hash, status) values (left(trim(p_name), 80), e, crypt(p_password, gen_salt('bf')), 'menunggu') returning id into t;
  elsif p_kind = 'ortu' then
    if exists (select 1 from parents where email = e) then raise exception 'Email sudah terdaftar. Silakan masuk, atau cek status pengajuan.'; end if;
    insert into parents (name, email, pass_hash, status) values (left(trim(p_name), 80), e, crypt(p_password, gen_salt('bf')), 'menunggu') returning id into p;
  end if;
  loop c := _code(8); exit when not exists (select 1 from requests where code = c); end loop;
  insert into requests (code, kind, name, contact, school_name, details, teacher_id, parent_id)
  values (c, p_kind, left(trim(p_name), 80), nullif(left(trim(coalesce(p_contact, e)), 120), ''), nullif(left(trim(coalesce(p_school, '')), 100), ''), d, t, p);
  return jsonb_build_object('pending', true, 'code', c, 'kind', p_kind);
end $$;

create or replace function public.request_submit(p_kind text, p_name text, p_email text, p_password text, p_contact text, p_school text, p_details jsonb) returns jsonb
language sql volatile security definer set search_path = public
as $$ select _request(p_kind, p_name, p_email, p_password, p_contact, p_school, p_details) $$;

-- Cek status dengan kode pengajuan (hasil seperti kode kelas hanya muncul setelah disetujui)
create or replace function public.request_status(p_code text) returns jsonb
language sql stable security definer set search_path = public
as $$
select jsonb_build_object('code', r.code, 'kind', r.kind, 'name', r.name, 'status', r.status, 'note', r.note,
  'createdAt', (extract(epoch from r.created_at) * 1000)::bigint, 'decidedAt', (extract(epoch from r.decided_at) * 1000)::bigint,
  'result', case when r.status = 'disetujui' then r.result end)
from requests r where r.code = upper(trim(p_code))
$$;

/* ---------- 3. Pendaftaran lama sekarang menjadi pengajuan ---------- */
create or replace function public.teacher_register(p_name text, p_email text, p_password text, p_class_name text, p_admin_code text default null) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare t text; tok text; e text := lower(trim(p_email)); adm admins;
begin
  select * into adm from admins where email = e;
  -- super admin dengan kode admin yang benar langsung aktif
  if adm.email is not null then
    if p_admin_code is null or adm.setup_hash <> crypt(upper(trim(p_admin_code)), adm.setup_hash) then raise exception 'Email ini terdaftar sebagai admin. Masukkan kode admin yang benar.'; end if;
    if exists (select 1 from teachers where email = e) then raise exception 'Email sudah terdaftar. Silakan masuk.'; end if;
    if char_length(coalesce(p_password, '')) < 6 then raise exception 'Kata sandi minimal 6 karakter'; end if;
    insert into teachers (name, email, pass_hash) values (left(trim(p_name), 80), e, crypt(p_password, gen_salt('bf'))) returning id into t;
    perform _new_class(t, coalesce(nullif(trim(p_class_name), ''), 'Kelas 1'));
    tok := encode(gen_random_bytes(24), 'hex');
    insert into teacher_sessions (token, teacher_id) values (tok, t);
    return jsonb_build_object('token', tok, 'teacherId', t);
  end if;
  return _request('guru', p_name, p_email, p_password, null, null, jsonb_build_object('className', p_class_name));
end $$;

create or replace function public.parent_register(p_name text, p_email text, p_password text) returns jsonb
language sql volatile security definer set search_path = public
as $$ select _request('ortu', p_name, p_email, p_password, null, null, '{}'::jsonb) $$;

-- Masuk: akun yang masih menunggu atau ditolak belum bisa masuk
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
  if r.status = 'menunggu' then return jsonb_build_object('error', 'Akun Anda masih menunggu persetujuan admin Metiq. Cek status dengan kode pengajuan.'); end if;
  if r.status = 'ditolak' then return jsonb_build_object('error', 'Pengajuan akun ini tidak disetujui. Hubungi admin Metiq.'); end if;
  update teachers set failed = 0, locked_until = null where id = r.id;
  delete from teacher_sessions where teacher_id = r.id and created_at < now() - interval '60 days';
  tok := encode(gen_random_bytes(24), 'hex');
  insert into teacher_sessions (token, teacher_id) values (tok, r.id);
  return jsonb_build_object('token', tok, 'teacherId', r.id);
end $$;

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
  if r.status = 'menunggu' then return jsonb_build_object('error', 'Akun Anda masih menunggu persetujuan admin Metiq. Cek status dengan kode pengajuan.'); end if;
  if r.status = 'ditolak' then return jsonb_build_object('error', 'Pengajuan akun ini tidak disetujui. Hubungi admin Metiq.'); end if;
  update parents set failed = 0, locked_until = null where id = r.id;
  delete from parent_sessions where parent_id = r.id and created_at < now() - interval '60 days';
  tok := encode(gen_random_bytes(24), 'hex');
  insert into parent_sessions (token, parent_id) values (tok, r.id);
  return jsonb_build_object('token', tok, 'parentId', r.id);
end $$;

/* ---------- 4. Hak akses: admin sekolah melihat semua kelas di sekolahnya ---------- */
create or replace function public._can_class(p_tid text, p_class_id text) returns boolean
language sql stable security definer set search_path = public
as $$
select exists (
  select 1 from classes c join teachers owner on owner.id = c.teacher_id, teachers me
  where c.id = p_class_id and me.id = p_tid and me.status = 'aktif'
    and (c.teacher_id = p_tid or _is_admin(p_tid) or (me.is_school_admin and me.school_id is not null and owner.school_id = me.school_id)))
$$;

create or replace function public.teacher_bundle(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); me teachers; adm boolean := _is_admin(t); cls text[]; sts text[];
begin
  select * into me from teachers where id = t;
  cls := array(select c.id from classes c join teachers owner on owner.id = c.teacher_id
               where adm or c.teacher_id = t or (me.is_school_admin and me.school_id is not null and owner.school_id = me.school_id) order by c.created_at);
  sts := array(select id from students where class_id = any(cls));
  return _bundle(cls, sts, ((extract(epoch from now()) - 90 * 86400) * 1000)::bigint, true)
    || jsonb_build_object('teacher', jsonb_build_object('id', me.id, 'name', me.name, 'email', me.email, 'avatar', me.avatar, 'isAdmin', adm,
         'isSchoolAdmin', me.is_school_admin, 'schoolId', me.school_id,
         'schoolName', (select name from schools where id = me.school_id), 'schoolKind', (select kind from schools where id = me.school_id)));
end $$;

-- Data kelas kini menyertakan sekolahnya (salinan _bundle dari 006 ditambah schoolId/schoolName/schoolKind)
create or replace function public._bundle(p_class_ids text[], p_student_ids text[], p_since bigint, p_codes boolean)
returns jsonb language sql stable security definer set search_path = public
as $$
select jsonb_build_object(
  'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'teacherId', c.teacher_id, 'teacherName', t.name, 'name', c.name, 'code', c.code,
      'schoolId', t.school_id, 'schoolName', s.name, 'schoolKind', s.kind) order by c.created_at)
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

/* ---------- 5. Super admin ---------- */
create or replace function public._super(p_token text) returns text
language plpgsql stable security definer set search_path = public
as $$ declare t text := _tid(p_token); begin if not _is_admin(t) then raise exception 'Khusus super admin'; end if; return t; end $$;

create or replace function public.super_overview(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare me text := _super(p_token); since bigint := ((extract(epoch from now()) - 7 * 86400) * 1000)::bigint;
begin
  return jsonb_build_object(
    'schools', coalesce((select jsonb_agg(x order by x->>'name') from (
      select jsonb_build_object('id', s.id, 'name', s.name, 'kind', s.kind, 'city', s.city, 'createdAt', (extract(epoch from s.created_at) * 1000)::bigint,
        'teachers', (select count(*) from teachers t where t.school_id = s.id and t.status = 'aktif'),
        'admins', coalesce((select jsonb_agg(t.name order by t.name) from teachers t where t.school_id = s.id and t.is_school_admin), '[]'::jsonb),
        'classes', (select count(*) from classes c join teachers t on t.id = c.teacher_id where t.school_id = s.id),
        'students', (select count(*) from students st join classes c on c.id = st.class_id join teachers t on t.id = c.teacher_id where t.school_id = s.id),
        'active7', (select count(distinct a.student_id) from answers a join students st on st.id = a.student_id join classes c on c.id = st.class_id join teachers t on t.id = c.teacher_id where t.school_id = s.id and a.ts >= since),
        'answers7', (select count(*) from answers a join students st on st.id = a.student_id join classes c on c.id = st.class_id join teachers t on t.id = c.teacher_id where t.school_id = s.id and a.ts >= since),
        'correct7', (select count(*) filter (where a.ok) from answers a join students st on st.id = a.student_id join classes c on c.id = st.class_id join teachers t on t.id = c.teacher_id where t.school_id = s.id and a.ts >= since)) x
      from schools s) y), '[]'::jsonb),
    'teachers', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'email', t.email, 'schoolId', t.school_id, 'isSchoolAdmin', t.is_school_admin, 'isSuper', _is_admin(t.id),
        'classes', (select count(*) from classes c where c.teacher_id = t.id)) order by t.name) from teachers t where t.status = 'aktif'), '[]'::jsonb),
    'parents', (select count(*) from parents where status = 'aktif'),
    'pending', (select count(*) from requests where status = 'menunggu')
  );
end $$;

create or replace function public.super_requests(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare me text := _super(p_token);
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'code', r.code, 'kind', r.kind, 'name', r.name, 'contact', r.contact, 'schoolName', r.school_name,
      'details', r.details, 'status', r.status, 'result', r.result, 'note', r.note,
      'email', coalesce((select email from teachers where id = r.teacher_id), (select email from parents where id = r.parent_id)),
      'createdAt', (extract(epoch from r.created_at) * 1000)::bigint, 'decidedAt', (extract(epoch from r.decided_at) * 1000)::bigint,
      'decidedBy', (select name from teachers where id = r.decided_by)) order by (r.status = 'menunggu') desc, r.created_at desc)
    from (select * from requests order by created_at desc limit 300) r), '[]'::jsonb);
end $$;

-- Setujui atau tolak pengajuan
create or replace function public.super_decide(p_token text, p_request_id text, p_approve boolean, p_school_id text default null, p_school_name text default null,
  p_make_admin boolean default false, p_class_id text default null, p_note text default null) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token); r requests; sid text; cid text; pc text; kid text; res jsonb := '{}'::jsonb; kids jsonb := '[]'::jsonb; nm text;
begin
  select * into r from requests where id = p_request_id for update;
  if r.id is null then raise exception 'Pengajuan tidak ditemukan'; end if;
  if r.status <> 'menunggu' then raise exception 'Pengajuan ini sudah diputuskan'; end if;
  if not p_approve then
    update requests set status = 'ditolak', note = left(p_note, 300), decided_at = now(), decided_by = me where id = r.id;
    update teachers set status = 'ditolak' where id = r.teacher_id;
    update parents set status = 'ditolak' where id = r.parent_id;
    return jsonb_build_object('ok', true, 'status', 'ditolak');
  end if;
  if r.kind in ('guru', 'homeschool') then
    sid := nullif(trim(coalesce(p_school_id, '')), '');
    if sid is not null and not exists (select 1 from schools where id = sid) then raise exception 'Sekolah tidak ditemukan'; end if;
    if sid is null then
      insert into schools (name, kind) values (left(coalesce(nullif(trim(p_school_name), ''), r.school_name, case when r.kind = 'homeschool' then 'Homeschool ' || r.name else 'Sekolah ' || r.name end), 100),
        case when r.kind = 'homeschool' then 'homeschool' else 'sekolah' end) returning id into sid;
    end if;
    update teachers set status = 'aktif', school_id = sid, is_school_admin = (r.kind = 'homeschool' or coalesce(p_make_admin, false)) where id = r.teacher_id;
    cid := _new_class(r.teacher_id, coalesce(nullif(trim(r.details->>'className'), ''), case when r.kind = 'homeschool' then 'Kelas ' || r.name else 'Kelas 1' end));
    -- keluarga homeschool: anak-anak langsung dibuatkan akun siswa di kelas keluarga
    if r.kind = 'homeschool' and jsonb_typeof(r.details->'children') = 'array' then
      for nm in select trim(value) from jsonb_array_elements_text(r.details->'children') where char_length(trim(value)) > 0 limit 10 loop
        loop pc := _code(6); exit when not exists (select 1 from students where parent_code = pc); end loop;
        insert into students (class_id, name, avatar, parent_code) values (cid, left(nm, 80), '🦁', pc) returning id into kid;
        kids := kids || jsonb_build_object('name', left(nm, 80), 'parentCode', pc);
      end loop;
    end if;
    res := jsonb_build_object('classCode', (select code from classes where id = cid), 'className', (select name from classes where id = cid),
      'schoolName', (select name from schools where id = sid), 'children', kids);
  elsif r.kind = 'ortu' then
    update parents set status = 'aktif' where id = r.parent_id;
  else
    if p_class_id is null or not exists (select 1 from classes where id = p_class_id) then raise exception 'Pilih kelas untuk siswa ini'; end if;
    loop pc := _code(6); exit when not exists (select 1 from students where parent_code = pc); end loop;
    insert into students (class_id, name, avatar, parent_code) values (p_class_id, left(r.name, 80), '🦁', pc) returning id into kid;
    res := jsonb_build_object('studentName', r.name, 'studentId', kid, 'classCode', (select code from classes where id = p_class_id),
      'className', (select name from classes where id = p_class_id), 'parentCode', pc);
  end if;
  update requests set status = 'disetujui', result = res, note = left(p_note, 300), decided_at = now(), decided_by = me where id = r.id;
  return res || jsonb_build_object('ok', true, 'status', 'disetujui');
end $$;

-- Kelola sekolah dan guru
create or replace function public.super_school_save(p_token text, p_id text, p_name text, p_kind text default 'sekolah', p_city text default null) returns text
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token); sid text := nullif(trim(coalesce(p_id, '')), '');
begin
  if char_length(coalesce(trim(p_name), '')) = 0 then raise exception 'Nama sekolah wajib diisi'; end if;
  if sid is null then
    insert into schools (name, kind, city) values (left(trim(p_name), 100), case when p_kind = 'homeschool' then 'homeschool' else 'sekolah' end, nullif(left(trim(coalesce(p_city, '')), 60), '')) returning id into sid;
  else
    update schools set name = left(trim(p_name), 100), kind = case when p_kind = 'homeschool' then 'homeschool' else 'sekolah' end, city = nullif(left(trim(coalesce(p_city, '')), 60), '') where id = sid;
  end if;
  return sid;
end $$;

create or replace function public.super_teacher_set(p_token text, p_teacher_id text, p_school_id text, p_is_admin boolean) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token);
begin
  if p_school_id is not null and p_school_id <> '' and not exists (select 1 from schools where id = p_school_id) then raise exception 'Sekolah tidak ditemukan'; end if;
  update teachers set school_id = nullif(p_school_id, ''), is_school_admin = coalesce(p_is_admin, false) where id = p_teacher_id;
end $$;

revoke execute on function public._request(text, text, text, text, text, text, jsonb), public._super(text) from public, anon, authenticated;
grant execute on function public.request_submit(text, text, text, text, text, text, jsonb), public.request_status(text),
  public.super_overview(text), public.super_requests(text), public.super_decide(text, text, boolean, text, text, boolean, text, text),
  public.super_school_save(text, text, text, text, text), public.super_teacher_set(text, text, text, boolean) to anon, authenticated;
