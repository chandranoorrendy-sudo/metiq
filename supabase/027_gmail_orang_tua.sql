/* 027 — Orang tua masuk dengan Google (Gmail).
 * Anak tanpa kelas memanggil Ayah/Bunda untuk masuk dengan Gmail sekali di setiap HP. Akun orang tua dibuat otomatis
 * dari nama dan email Google, lalu ditautkan ke anak itu. Di HP baru, orang tua cukup masuk dengan Gmail dan memilih anaknya;
 * anak langsung melanjutkan dari terakhir ia belajar. Orang tua juga bisa membuka laporan anak dengan Gmail yang sama.
 *
 * Fungsi di sini hanya bisa dipakai dengan sesi Google dari Supabase Auth (peran "authenticated"); nama dan email
 * diambil dari token Google, bukan dari isian pengguna. Token Google tidak disimpan di HP anak: aplikasi memakainya sekali
 * lalu membuangnya.
 * Perlu: Authentication → Providers → Google diaktifkan di dasbor Supabase. Jalankan setelah 026. Aman dijalankan ulang.
 */
alter table public.parents add column if not exists auth_user_id uuid;
create unique index if not exists parents_auth_user on public.parents (auth_user_id) where auth_user_id is not null;

-- Akun orang tua dari sesi Google: cari menurut akun Google, lalu menurut email; jika belum ada, buat baru
create or replace function public._g_parent() returns parents
language plpgsql volatile security definer set search_path = public
as $$
declare uid uuid := auth.uid(); em text := lower(trim(coalesce(auth.jwt()->>'email', '')));
  nm text := left(coalesce(nullif(trim(auth.jwt()->'user_metadata'->>'full_name'), ''), nullif(trim(auth.jwt()->'user_metadata'->>'name'), ''), split_part(em, '@', 1)), 80);
  p parents;
begin
  if uid is null or em = '' then raise exception 'Masuk dengan Google dulu.'; end if;
  select * into p from parents where auth_user_id = uid;
  if p.id is null then
    select * into p from parents where lower(email) = em;
    if p.id is not null then
      update parents set auth_user_id = uid, status = 'aktif' where id = p.id returning * into p;
    else
      insert into parents (name, email, pass_hash, status, auth_user_id)
      values (coalesce(nullif(nm, ''), 'Orang tua'), em, crypt(gen_random_uuid()::text, gen_salt('bf')), 'aktif', uid)
      returning * into p;
    end if;
  end if;
  return p;
end $$;

-- Tautkan orang tua ke anak di HP ini (dibuktikan dengan kode belajar anak)
create or replace function public.parent_google_link(p_code text, p_student_id text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare p parents := _g_parent(); s students;
begin
  select * into s from students where id = p_student_id and learn_code = upper(trim(coalesce(p_code, '')));
  if s.id is null then raise exception 'Siswa tidak ditemukan'; end if;
  insert into parent_students (parent_id, student_id) values (p.id, s.id) on conflict do nothing;
  return jsonb_build_object('parentName', p.name, 'studentName', s.name);
end $$;

-- Anak-anak yang tertaut ke akun Google ini, untuk melanjutkan belajar di HP baru
create or replace function public.parent_google_kids() returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare p parents := _g_parent();
begin
  return jsonb_build_object('parentName', p.name, 'kids', coalesce((
    select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'avatar', s.avatar, 'code', s.learn_code, 'className', c.name) order by s.name)
    from parent_students ps join students s on s.id = ps.student_id left join classes c on c.id = s.class_id
    where ps.parent_id = p.id and s.learn_code is not null), '[]'::jsonb));
end $$;

-- Sesi laporan orang tua (sama seperti masuk dengan email dan kata sandi), dari sesi Google
create or replace function public.parent_google_session() returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare p parents := _g_parent(); tok text := encode(gen_random_bytes(24), 'hex');
begin
  insert into parent_sessions (token, parent_id) values (tok, p.id);
  return jsonb_build_object('token', tok, 'parentId', p.id, 'name', p.name);
end $$;

revoke execute on function public._g_parent() from public, anon, authenticated;
revoke execute on function public.parent_google_link(text, text), public.parent_google_kids(), public.parent_google_session() from public, anon;
grant execute on function public.parent_google_link(text, text), public.parent_google_kids(), public.parent_google_session() to authenticated;

notify pgrst, 'reload schema';
