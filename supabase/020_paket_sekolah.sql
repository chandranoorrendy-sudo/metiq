/* 020 — Guru gratis tanpa persetujuan, dan paket Sekolah berbayar.
 * Model seperti Khan Academy Kids: aplikasi dan alat kelas gratis untuk guru perorangan dan keluarga.
 * Sekolah membayar Rp15.000 per siswa per tahun untuk lapisan sekolah: dasbor dan laporan sekolah,
 * pengelolaan guru oleh admin sekolah, serta asesmen awal-akhir (pre/post) untuk penelitian.
 * Paket diaktifkan manual oleh super admin setelah pembayaran.
 *
 * Isi:
 *  1. Kolom paket di tabel schools; sekolah yang sudah ada (Kuttab Imam Al-Ghazali) langsung aktif.
 *  2. teacher_signup: siapa pun bisa menjadi guru, langsung aktif, dapat satu kelas pertama.
 *  3. Admin sekolah menambah/melepas guru di sekolahnya lewat email guru (paket Sekolah harus aktif).
 *  4. Super admin mengatur paket sekolah; daftar paket untuk dasbor super admin.
 *  5. teacher_bundle menyertakan status paket sekolah guru.
 *  6. Permintaan penawaran sekolah dari halaman Harga, dibaca super admin.
 * Jalankan setelah 019. Aman dijalankan ulang.
 */

-- 1. Paket sekolah
alter table public.schools add column if not exists plan text not null default 'gratis';
alter table public.schools drop constraint if exists schools_plan_check;
alter table public.schools add constraint schools_plan_check check (plan in ('gratis', 'sekolah'));
alter table public.schools add column if not exists plan_until date;
alter table public.schools add column if not exists plan_students integer;
alter table public.schools add column if not exists plan_note text;
-- Kuttab Imam Al-Ghazali (sekolah penelitian, sudah memakai Metiq sebelum ada paket) tetap mendapat semua fitur.
-- Hanya sekali: jika super admin nanti mengubah paketnya, menjalankan ulang file ini tidak menimpanya.
update public.schools set plan = 'sekolah', plan_until = date '2027-12-31', plan_note = 'Sekolah awal (sebelum ada paket)'
  where name ilike '%al-ghazali%' and plan = 'gratis' and plan_note is null;

create or replace function public._school_active(p_school_id text) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from schools where id = p_school_id and plan = 'sekolah' and (plan_until is null or plan_until >= current_date)) $$;

-- 2. Guru gratis: langsung aktif, tanpa persetujuan
create or replace function public.teacher_signup(p_name text, p_email text, p_password text, p_class_name text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare t text; tok text; e text := lower(trim(coalesce(p_email, ''))); nm text := left(trim(coalesce(p_name, '')), 80);
begin
  if char_length(nm) = 0 then raise exception 'Nama wajib diisi'; end if;
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Format email tidak valid'; end if;
  if char_length(coalesce(p_password, '')) < 6 then raise exception 'Kata sandi minimal 6 karakter'; end if;
  if exists (select 1 from admins where email = e) then raise exception 'Email ini terdaftar sebagai admin. Daftar lewat kolom kode admin.'; end if;
  if exists (select 1 from teachers where email = e) then raise exception 'Email sudah terdaftar. Silakan masuk.'; end if;
  if (select count(*) from teachers where created_at > now() - interval '1 hour') > 100 then raise exception 'Terlalu banyak pendaftaran. Coba lagi nanti.'; end if;
  insert into teachers (name, email, pass_hash, status) values (nm, e, crypt(p_password, gen_salt('bf')), 'aktif') returning id into t;
  perform _new_class(t, coalesce(nullif(trim(p_class_name), ''), 'Kelas saya'));
  tok := encode(gen_random_bytes(24), 'hex');
  insert into teacher_sessions (token, teacher_id) values (tok, t);
  return jsonb_build_object('token', tok, 'teacherId', t);
end $$;

-- 3. Admin sekolah mengelola guru di sekolahnya
create or replace function public._school_admin(p_token text) returns teachers
language plpgsql stable security definer set search_path = public
as $$
declare me teachers;
begin
  select * into me from teachers where id = _tid(p_token);
  if not (me.is_school_admin and me.school_id is not null) then raise exception 'Khusus admin sekolah'; end if;
  if not _is_admin(me.id) and not _school_active(me.school_id) then raise exception 'Paket Sekolah belum aktif. Hubungi Metiq untuk mengaktifkan.'; end if;
  return me;
end $$;

create or replace function public.school_teachers(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare me teachers := _school_admin(p_token);
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'email', t.email, 'isSchoolAdmin', t.is_school_admin,
      'classes', (select count(*) from classes c where c.teacher_id = t.id),
      'students', (select count(*) from students s join classes c on c.id = s.class_id where c.teacher_id = t.id)) order by t.name)
    from teachers t where t.school_id = me.school_id and t.status = 'aktif'), '[]'::jsonb);
end $$;

create or replace function public.school_teacher_add(p_token text, p_email text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me teachers := _school_admin(p_token); g teachers;
begin
  select * into g from teachers where email = lower(trim(coalesce(p_email, '')));
  if g.id is null then raise exception 'Belum ada guru dengan email itu. Minta gurunya mendaftar gratis dulu di Metiq.'; end if;
  if g.status <> 'aktif' then raise exception 'Akun guru itu belum aktif.'; end if;
  if g.school_id = me.school_id then raise exception '% sudah ada di sekolah ini.', g.name; end if;
  if g.school_id is not null then raise exception '% sudah terdaftar di sekolah lain.', g.name; end if;
  update teachers set school_id = me.school_id where id = g.id;
  return jsonb_build_object('id', g.id, 'name', g.name);
end $$;

create or replace function public.school_teacher_remove(p_token text, p_teacher_id text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me teachers := _school_admin(p_token); g teachers;
begin
  select * into g from teachers where id = p_teacher_id and school_id = me.school_id;
  if g.id is null then raise exception 'Guru tidak ditemukan di sekolah ini'; end if;
  if g.id = me.id then raise exception 'Anda tidak bisa melepas akun sendiri'; end if;
  update teachers set school_id = null, is_school_admin = false where id = g.id;  -- kelas dan siswanya tetap milik guru itu
  return jsonb_build_object('id', g.id, 'name', g.name);
end $$;

-- 4. Super admin mengatur paket
create or replace function public.super_school_plan(p_token text, p_school_id text, p_plan text, p_until date, p_students integer, p_note text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token);
begin
  if p_plan not in ('gratis', 'sekolah') then raise exception 'Paket tidak dikenal'; end if;
  update schools set plan = p_plan, plan_until = p_until, plan_students = p_students, plan_note = left(p_note, 200) where id = p_school_id;
  if not found then raise exception 'Sekolah tidak ditemukan'; end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.super_school_plans(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare me text := _super(p_token);
begin
  return coalesce((select jsonb_object_agg(id, jsonb_build_object('plan', plan, 'until', plan_until, 'students', plan_students, 'note', plan_note, 'active', _school_active(id))) from schools), '{}'::jsonb);
end $$;

-- 5. Data guru menyertakan paket sekolahnya (salinan teacher_bundle dari 008 ditambah schoolPlan, schoolPlanUntil, schoolActive)
create or replace function public.teacher_bundle(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); me teachers; adm boolean := _is_admin(t); cls text[]; sts text[]; sc schools;
begin
  select * into me from teachers where id = t;
  select * into sc from schools where id = me.school_id;
  cls := array(select c.id from classes c join teachers owner on owner.id = c.teacher_id
               where adm or c.teacher_id = t or (me.is_school_admin and me.school_id is not null and owner.school_id = me.school_id) order by c.created_at);
  sts := array(select id from students where class_id = any(cls));
  return _bundle(cls, sts, ((extract(epoch from now()) - 90 * 86400) * 1000)::bigint, true)
    || jsonb_build_object('teacher', jsonb_build_object('id', me.id, 'name', me.name, 'email', me.email, 'avatar', me.avatar, 'isAdmin', adm,
         'isSchoolAdmin', me.is_school_admin, 'schoolId', me.school_id, 'schoolName', sc.name, 'schoolKind', sc.kind,
         'schoolPlan', sc.plan, 'schoolPlanUntil', sc.plan_until, 'schoolActive', coalesce(_school_active(me.school_id), false)));
end $$;

-- 6. Permintaan penawaran dari halaman Harga
create table if not exists public.school_quotes (
  id bigint generated always as identity primary key,
  school text not null check (char_length(school) between 2 and 120),
  city text check (char_length(city) <= 80),
  students integer check (students between 1 and 100000),
  contact_name text not null check (char_length(contact_name) between 2 and 80),
  contact text not null check (char_length(contact) between 5 and 120),
  note text check (char_length(note) <= 500),
  status text not null default 'baru' check (status in ('baru', 'dihubungi', 'selesai')),
  created_at timestamptz not null default now()
);
alter table public.school_quotes enable row level security;
revoke all on public.school_quotes from anon, authenticated;

create or replace function public.school_quote_send(p_school text, p_city text, p_students integer, p_contact_name text, p_contact text, p_note text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
begin
  if (select count(*) from school_quotes where created_at > now() - interval '1 hour') > 30 then raise exception 'Terlalu banyak permintaan. Coba lagi nanti.'; end if;
  insert into school_quotes (school, city, students, contact_name, contact, note)
  values (trim(p_school), nullif(trim(coalesce(p_city, '')), ''), p_students, trim(p_contact_name), trim(p_contact), nullif(trim(coalesce(p_note, '')), ''));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.super_quotes(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare me text := _super(p_token);
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', id, 'school', school, 'city', city, 'students', students, 'contactName', contact_name, 'contact', contact, 'note', note, 'status', status,
    'createdAt', (extract(epoch from created_at) * 1000)::bigint) order by created_at desc) from (select * from school_quotes order by created_at desc limit 200) q), '[]'::jsonb);
end $$;

create or replace function public.super_quote_status(p_token text, p_id bigint, p_status text) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token);
begin
  if p_status not in ('baru', 'dihubungi', 'selesai') then raise exception 'Status tidak dikenal'; end if;
  update school_quotes set status = p_status where id = p_id;
end $$;

revoke execute on function public._school_admin(text), public._school_active(text) from public, anon, authenticated;
grant execute on function public.teacher_signup(text, text, text, text), public.school_teachers(text), public.school_teacher_add(text, text), public.school_teacher_remove(text, text),
  public.super_school_plan(text, text, text, date, integer, text), public.super_school_plans(text), public.teacher_bundle(text),
  public.school_quote_send(text, text, integer, text, text, text), public.super_quotes(text), public.super_quote_status(text, bigint, text) to anon, authenticated;

notify pgrst, 'reload schema';
