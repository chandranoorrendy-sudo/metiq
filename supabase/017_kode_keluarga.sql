/* 017 — Kode keluarga: satu kode untuk melihat laporan semua kakak-adik.
 *
 * - Kolom students.family_code. Kode keluarga 6 huruf/angka, tidak pernah sama dengan kode orang tua
 *   mana pun, jadi keduanya bisa diketik di kolom yang sama.
 * - parent_bundle menerima kode orang tua (satu anak) ATAU kode keluarga (semua anak di keluarga itu).
 * - log_report_view menerima kode keluarga.
 * - Admin menyatukan beberapa anak menjadi satu keluarga (admin_family_set) atau melepas satu anak (admin_family_remove).
 * - admin_ungrouped ikut mengembalikan familyCode.
 * Jalankan setelah 016.
 */
alter table public.students add column if not exists family_code text;
create index if not exists students_family_code on public.students (family_code);

create or replace function public.parent_bundle(p_code text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare u text := upper(trim(coalesce(p_code, ''))); cids text[]; sids text[];
begin
  select array_agg(s.class_id), array_agg(s.id) into cids, sids
  from students s where s.parent_code = u or s.family_code = u;
  if sids is null then return null; end if;
  return _bundle(cids, sids, ((extract(epoch from now()) - 90 * 86400) * 1000)::bigint, false);
end $$;

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
    if not exists (select 1 from students where id = p_student_id and (parent_code = upper(trim(p_pcode)) or family_code = upper(trim(p_pcode)))) then raise exception 'Siswa tidak ditemukan'; end if;
  else raise exception 'Siswa tidak ditemukan';
  end if;
  if exists (select 1 from report_views where student_id = p_student_id and parent_id is not distinct from pid and via = v and viewed_at > now() - interval '10 minutes') then return; end if;
  insert into report_views (student_id, parent_id, via) values (p_student_id, pid, v);
end $$;

/* Satukan anak-anak menjadi satu keluarga. Jika salah satu sudah punya kode keluarga, kode itu dipakai untuk semua. */
create or replace function public.admin_family_set(p_token text, p_student_ids text[]) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); fc text;
begin
  if not _is_admin(t) then raise exception 'Hanya admin yang bisa membuat kode keluarga'; end if;
  if coalesce(array_length(p_student_ids, 1), 0) < 1 then raise exception 'Pilih anak dulu'; end if;
  if (select count(*) from students where id = any(p_student_ids)) <> array_length(p_student_ids, 1) then raise exception 'Siswa tidak ditemukan'; end if;
  select family_code into fc from students where id = any(p_student_ids) and family_code is not null order by created_at limit 1;
  if fc is null then
    loop fc := _code(6); exit when not exists (select 1 from students where parent_code = fc or family_code = fc or learn_code = fc); end loop;
  end if;
  update students set family_code = fc where id = any(p_student_ids);
  return jsonb_build_object('familyCode', fc, 'count', array_length(p_student_ids, 1));
end $$;

create or replace function public.admin_family_remove(p_token text, p_student_id text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token);
begin
  if not _is_admin(t) then raise exception 'Hanya admin yang bisa mengubah kode keluarga'; end if;
  update students set family_code = null where id = p_student_id;
  if not found then raise exception 'Siswa tidak ditemukan'; end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.admin_ungrouped(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token);
begin
  if not _is_admin(t) then raise exception 'Hanya admin yang bisa melihat daftar ini';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', s.id, 'name', s.name, 'avatar', s.avatar, 'code', s.learn_code, 'parentCode', s.parent_code, 'familyCode', s.family_code,
      'createdAt', (extract(epoch from s.created_at) * 1000)::bigint
    ) order by s.created_at desc)
    from students s where s.class_id is null
  ), '[]'::jsonb);
end $$;

revoke execute on function public.admin_family_set(text, text[]) from public;
revoke execute on function public.admin_family_remove(text, text) from public;
grant execute on function public.admin_family_set(text, text[]), public.admin_family_remove(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
