/* 019 — Guru menambahkan siswa tanpa kelas ke kelasnya dengan kode belajar anak.
 * Kode belajar didapat dari anak atau orang tuanya, jadi guru tidak perlu (dan tidak bisa) melihat daftar
 * siswa tanpa kelas. Hanya siswa yang belum punya kelas yang bisa ditambahkan; siswa yang sudah di kelas lain
 * dipindahkan oleh admin atau guru kelasnya. Seluruh riwayat belajar anak ikut terbawa.
 * Juga: admin_ungrouped_count untuk angka "siswa tanpa kelas" di dasbor admin.
 * Jalankan setelah 018.
 */
create or replace function public.teacher_add_by_code(p_token text, p_class_id text, p_learn_code text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); s students;
begin
  if not _can_class(t, p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
  select * into s from students where learn_code = upper(trim(coalesce(p_learn_code, '')));
  if s.id is null then raise exception 'Kode belajar tidak ditemukan. Periksa lagi ya.'; end if;
  if s.class_id = p_class_id then raise exception '% sudah ada di kelas ini.', s.name; end if;
  if s.class_id is not null then raise exception '% sudah terdaftar di kelas lain. Minta admin atau guru kelasnya untuk memindahkan.', s.name; end if;
  update students set class_id = p_class_id where id = s.id;
  return jsonb_build_object('id', s.id, 'name', s.name);
end $$;

create or replace function public.admin_ungrouped_count(p_token text) returns integer
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token);
begin
  if not _is_admin(t) then raise exception 'Hanya admin yang bisa melihat angka ini'; end if;
  return (select count(*) from students where class_id is null);
end $$;

revoke execute on function public.teacher_add_by_code(text, text, text), public.admin_ungrouped_count(text) from public;
grant execute on function public.teacher_add_by_code(text, text, text), public.admin_ungrouped_count(text) to anon, authenticated;

notify pgrst, 'reload schema';
