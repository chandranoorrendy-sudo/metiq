/* 026 — Pengamanan sesuai OWASP Top 10. Jalankan setelah 025. Aman dijalankan ulang.
 *
 * 1. Pembatas tebakan (A04, A07): kode kelas, kode orang tua, kode belajar, kode pengajuan, dan login
 *    dibatasi per jaringan (alamat IP). Tebakan yang salah dicatat di tabel auth_hits; jika terlalu banyak
 *    dalam 10 menit, permintaan berikutnya ditolak sampai jendelanya lewat. Pendaftaran dan formulir publik
 *    dibatasi jumlahnya per jam supaya tidak bisa dipakai untuk spam.
 * 2. Kode acak memakai pembangkit acak kriptografis (A02), bukan random().
 * 3. Kata sandi akun baru minimal 8 karakter (A07). Kata sandi lama tetap bisa dipakai masuk.
 * 4. Tabel star_claims dikunci seperti tabel lain (A01).
 *
 * Cara kerja: fungsi publik yang lama diganti nama menjadi _<nama>_impl (isinya tidak berubah), lalu fungsi
 * bernama sama dibuat sebagai pembungkus yang memeriksa batas dulu. Fungsi yang dulu "raise" saat kode salah kini
 * mengembalikan {"error": "..."} supaya catatan tebakan salah tidak ikut dibatalkan; js/cloud.js mengubahnya
 * kembali menjadi error biasa.
 * PENTING: jika suatu hari file SQL lama (mis. 013, 015, 017) dijalankan ulang, pembungkus di sini tertimpa.
 * Jalankan file ini lagi sesudahnya.
 */

-- Catatan percobaan per jaringan
create table if not exists public.auth_hits (
  id bigint generated always as identity primary key,
  kind text not null,
  ip text not null,
  fail boolean not null default false,
  at timestamptz not null default now()
);
create index if not exists auth_hits_lookup on public.auth_hits (kind, ip, fail, at);
alter table public.auth_hits enable row level security;
revoke all on public.auth_hits from anon, authenticated;

-- star_claims (dari 014) belum memakai row level security
do $$ begin
  if to_regclass('public.star_claims') is not null then
    execute 'alter table public.star_claims enable row level security';
    execute 'revoke all on public.star_claims from anon, authenticated';
  end if;
end $$;

-- Alamat IP pemanggil. Urutan: header yang ditulis ulang oleh proksi (tidak bisa dipalsukan pemanggil) lebih dulu;
-- X-Forwarded-For hanya cadangan karena bagian depannya bisa diisi sendiri oleh pemanggil.
create or replace function public._client_ip_src() returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare h json; v text;
begin
  begin h := current_setting('request.headers', true)::json; exception when others then h := null; end;
  v := nullif(trim(h->>'cf-connecting-ip'), ''); if v is not null then return jsonb_build_object('ip', v, 'source', 'cf-connecting-ip'); end if;
  v := nullif(trim(h->>'x-real-ip'), ''); if v is not null then return jsonb_build_object('ip', v, 'source', 'x-real-ip'); end if;
  v := nullif(trim(split_part(coalesce(h->>'x-forwarded-for', ''), ',', 1)), ''); if v is not null then return jsonb_build_object('ip', v, 'source', 'x-forwarded-for'); end if;
  return jsonb_build_object('ip', 'unknown', 'source', 'none');
end $$;

create or replace function public._client_ip() returns text
language sql stable security definer set search_path = public
as $$ select _client_ip_src()->>'ip' $$;

-- Pemeriksaan untuk admin: menunjukkan IP pemanggil sendiri dan header asalnya (tidak menulis apa pun)
create or replace function public.security_check() returns jsonb
language sql stable security definer set search_path = public
as $$ select _client_ip_src() $$;

-- Tolak jika jaringan ini sudah mencapai batas dalam jendela waktu.
-- Jika IP tidak diketahui, pembatas tidak dipakai, supaya semua pengguna tidak terkunci bersama.
create or replace function public._guard(p_kind text, p_max int, p_minutes int, p_fail boolean) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare v_ip text := _client_ip();
begin
  if v_ip = 'unknown' then return; end if;
  if (select count(*) from auth_hits a where a.kind = p_kind and a.ip = v_ip and a.fail = p_fail
      and a.at > now() - make_interval(mins => p_minutes)) >= p_max then
    raise exception 'Terlalu banyak percobaan dari jaringan ini. Coba lagi dalam % menit.', p_minutes;
  end if;
end $$;

-- Catat satu percobaan; sesekali bersihkan catatan lebih dari sehari
create or replace function public._hit(p_kind text, p_fail boolean) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare v_ip text := _client_ip();
begin
  if v_ip = 'unknown' then return; end if;
  insert into auth_hits (kind, ip, fail) values (p_kind, v_ip, p_fail);
  if random() < 0.02 then delete from auth_hits where at < now() - interval '1 day'; end if;
end $$;

revoke execute on function public._client_ip_src(), public._client_ip(), public._guard(text, int, int, boolean), public._hit(text, boolean) from public, anon, authenticated;
revoke execute on function public.security_check() from public;
grant execute on function public.security_check() to anon, authenticated;

-- Kode acak kriptografis: byte dari gen_random_uuid() (tanpa byte versi/varian), dengan penolakan untuk menghindari bias
create or replace function public._code(n int) returns text
language plpgsql volatile
as $$
declare chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; s text := ''; b bytea; v int; i int;
begin
  while char_length(s) < n loop
    b := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    foreach i in array array[0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 15] loop
      v := get_byte(b, i);
      if v < 248 and char_length(s) < n then s := s || substr(chars, 1 + v % 31, 1); end if;
    end loop;
  end loop;
  return s;
end $$;

-- Ganti nama fungsi lama menjadi _<nama>_impl, sekali saja
do $$
declare f text[]; sigs text[][] := array[
  array['class_roster', 'text'],
  array['parent_bundle', 'text'],
  array['request_status', 'text'],
  array['student_login', 'text'],
  array['student_join_class', 'text, text, text'],
  array['teacher_add_by_code', 'text, text, text'],
  array['parent_link', 'text, text'],
  array['student_start', 'text, text'],
  array['teacher_signup', 'text, text, text, text'],
  array['teacher_register', 'text, text, text, text, text'],
  array['parent_register', 'text, text, text'],
  array['request_submit', 'text, text, text, text, text, text, jsonb'],
  array['school_quote_send', 'text, text, integer, text, text, text'],
  array['app_feedback_send', 'text, text, text, text'],
  array['teacher_login', 'text, text'],
  array['parent_login', 'text, text']];
begin
  foreach f slice 1 in array sigs loop
    if to_regprocedure(format('public._%s_impl(%s)', f[1], f[2])) is null and to_regprocedure(format('public.%s(%s)', f[1], f[2])) is not null then
      execute format('alter function public.%I(%s) rename to %I', f[1], f[2], '_' || f[1] || '_impl');
    end if;
    if to_regprocedure(format('public._%s_impl(%s)', f[1], f[2])) is not null then
      execute format('revoke execute on function public.%I(%s) from public, anon, authenticated', '_' || f[1] || '_impl', f[2]);
    end if;
  end loop;
end $$;

/* ---------- Tebakan kode: 40 tebakan salah per 10 menit per jaringan ---------- */

create or replace function public.class_roster(p_code text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('kode', 40, 10, true);
  r := _class_roster_impl(p_code);
  if r is null then perform _hit('kode', true); end if;
  return r;
end $$;

create or replace function public.parent_bundle(p_code text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('kode', 40, 10, true);
  r := _parent_bundle_impl(p_code);
  if r is null then perform _hit('kode', true); end if;
  return r;
end $$;

create or replace function public.request_status(p_code text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('kode', 40, 10, true);
  r := _request_status_impl(p_code);
  if r is null then perform _hit('kode', true); end if;
  return r;
end $$;

-- Fungsi yang dulu "raise" saat kode salah: kesalahannya dikembalikan sebagai {"error": "..."}
create or replace function public.student_login(p_code text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
begin
  perform _guard('kode', 40, 10, true);
  begin return _student_login_impl(p_code);
  exception when raise_exception then perform _hit('kode', true); return jsonb_build_object('error', sqlerrm); end;
end $$;

create or replace function public.student_join_class(p_student_id text, p_code text, p_class_code text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
begin
  perform _guard('kode', 40, 10, true);
  begin return _student_join_class_impl(p_student_id, p_code, p_class_code);
  exception when raise_exception then perform _hit('kode', true); return jsonb_build_object('error', sqlerrm); end;
end $$;

create or replace function public.teacher_add_by_code(p_token text, p_class_id text, p_learn_code text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
begin
  perform _guard('kode', 40, 10, true);
  begin return _teacher_add_by_code_impl(p_token, p_class_id, p_learn_code);
  exception when raise_exception then perform _hit('kode', true); return jsonb_build_object('error', sqlerrm); end;
end $$;

create or replace function public.parent_link(p_token text, p_parent_code text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
begin
  perform _guard('kode', 40, 10, true);
  begin return _parent_link_impl(p_token, p_parent_code);
  exception when raise_exception then perform _hit('kode', true); return jsonb_build_object('error', sqlerrm); end;
end $$;

/* ---------- Login: 30 gagal per 10 menit per jaringan (penguncian per akun yang sudah ada tetap berlaku) ---------- */

create or replace function public.teacher_login(p_email text, p_password text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('login', 30, 10, true);
  r := _teacher_login_impl(p_email, p_password);
  if r ? 'error' then perform _hit('login', true); end if;
  return r;
end $$;

create or replace function public.parent_login(p_email text, p_password text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('login', 30, 10, true);
  r := _parent_login_impl(p_email, p_password);
  if r ? 'error' then perform _hit('login', true); end if;
  return r;
end $$;

/* ---------- Pendaftaran dan formulir publik: dibatasi per jam per jaringan ---------- */

create or replace function public._check_password(p text) returns void
language plpgsql immutable
as $$
begin
  if char_length(coalesce(p, '')) < 8 then raise exception 'Kata sandi minimal 8 karakter.'; end if;
  if char_length(p) > 200 then raise exception 'Kata sandi terlalu panjang.'; end if;
end $$;
revoke execute on function public._check_password(text) from public, anon, authenticated;

-- Satu sekolah bisa memulai satu kelas sekaligus dari satu wifi, jadi batasnya longgar
create or replace function public.student_start(p_name text, p_avatar text default null) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('mulai', 80, 60, false);
  r := _student_start_impl(p_name, p_avatar);
  perform _hit('mulai', false);
  return r;
end $$;

create or replace function public.teacher_signup(p_name text, p_email text, p_password text, p_class_name text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('daftar', 10, 60, false);
  perform _check_password(p_password);
  r := _teacher_signup_impl(p_name, p_email, p_password, p_class_name);
  perform _hit('daftar', false);
  return r;
end $$;

create or replace function public.teacher_register(p_name text, p_email text, p_password text, p_class_name text, p_admin_code text default null) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('daftar', 10, 60, false);
  perform _guard('kode', 40, 10, true);
  perform _check_password(p_password);
  begin r := _teacher_register_impl(p_name, p_email, p_password, p_class_name, p_admin_code);
  exception when raise_exception then
    if p_admin_code is not null then perform _hit('kode', true); end if;  -- tebakan kode admin ikut dibatasi
    return jsonb_build_object('error', sqlerrm);
  end;
  perform _hit('daftar', false);
  return r;
end $$;

create or replace function public.parent_register(p_name text, p_email text, p_password text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('daftar', 10, 60, false);
  perform _check_password(p_password);
  r := _parent_register_impl(p_name, p_email, p_password);
  perform _hit('daftar', false);
  return r;
end $$;

create or replace function public.request_submit(p_kind text, p_name text, p_email text, p_password text, p_contact text, p_school text, p_details jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('daftar', 10, 60, false);
  if coalesce(p_password, '') <> '' then perform _check_password(p_password); end if;
  r := _request_submit_impl(p_kind, p_name, p_email, p_password, p_contact, p_school, p_details);
  perform _hit('daftar', false);
  return r;
end $$;

create or replace function public.school_quote_send(p_school text, p_city text, p_students integer, p_contact_name text, p_contact text, p_note text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('penawaran', 5, 60, false);
  r := _school_quote_send_impl(p_school, p_city, p_students, p_contact_name, p_contact, p_note);
  perform _hit('penawaran', false);
  return r;
end $$;

create or replace function public.app_feedback_send(p_text text, p_role text default null, p_student_id text default null, p_page text default null) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare r jsonb;
begin
  perform _guard('masukan', 20, 60, false);
  r := _app_feedback_send_impl(p_text, p_role, p_student_id, p_page);
  perform _hit('masukan', false);
  return r;
end $$;

revoke execute on function public.class_roster(text), public.parent_bundle(text), public.request_status(text), public.student_login(text),
  public.student_join_class(text, text, text), public.teacher_add_by_code(text, text, text), public.parent_link(text, text),
  public.teacher_login(text, text), public.parent_login(text, text), public.student_start(text, text),
  public.teacher_signup(text, text, text, text), public.teacher_register(text, text, text, text, text), public.parent_register(text, text, text),
  public.request_submit(text, text, text, text, text, text, jsonb), public.school_quote_send(text, text, integer, text, text, text),
  public.app_feedback_send(text, text, text, text) from public;
grant execute on function public.class_roster(text), public.parent_bundle(text), public.request_status(text), public.student_login(text),
  public.student_join_class(text, text, text), public.teacher_add_by_code(text, text, text), public.parent_link(text, text),
  public.teacher_login(text, text), public.parent_login(text, text), public.student_start(text, text),
  public.teacher_signup(text, text, text, text), public.teacher_register(text, text, text, text, text), public.parent_register(text, text, text),
  public.request_submit(text, text, text, text, text, text, jsonb), public.school_quote_send(text, text, integer, text, text, text),
  public.app_feedback_send(text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
