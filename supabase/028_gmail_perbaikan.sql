/* 028 — Perbaikan masuk dengan Gmail orang tua (027).
 * Galat "function gen_salt(unknown) does not exist": pgcrypto ada di skema extensions, jadi crypt dan gen_salt
 * dipanggil dengan nama lengkap. Jalankan setelah 027. Aman dijalankan ulang.
 */
create or replace function public._g_parent() returns parents
language plpgsql volatile security definer set search_path = public, extensions
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
      -- kata sandi acak yang tidak diketahui siapa pun: akun Google tidak masuk lewat kata sandi
      insert into parents (name, email, pass_hash, status, auth_user_id)
      values (coalesce(nullif(nm, ''), 'Orang tua'), em, extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')), 'aktif', uid)
      returning * into p;
    end if;
  end if;
  return p;
end $$;

revoke execute on function public._g_parent() from public, anon, authenticated;

-- parent_google_session memakai gen_random_bytes (juga dari pgcrypto)
create or replace function public.parent_google_session() returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare p parents := _g_parent(); tok text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  insert into parent_sessions (token, parent_id) values (tok, p.id);
  return jsonb_build_object('token', tok, 'parentId', p.id, 'name', p.name);
end $$;

revoke execute on function public.parent_google_session() from public, anon;
grant execute on function public.parent_google_session() to authenticated;

notify pgrst, 'reload schema';
