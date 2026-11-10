/* 025 — Anak yang belajar tanpa kelas bisa melihat kode orang tuanya sendiri di halaman Aku,
 * supaya Ayah/Bunda bisa membuka laporan tanpa meminta kode kepada admin.
 * Hanya dengan kode belajar pribadi anak itu (bukan kode kelas, yang dipakai bersama teman sekelas).
 * Jalankan setelah 023. Aman dijalankan ulang.
 */
create or replace function public.student_parent_code(p_code text, p_student_id text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare s students;
begin
  select * into s from students where id = p_student_id and learn_code = upper(trim(coalesce(p_code, '')));
  if s.id is null then raise exception 'Siswa tidak ditemukan'; end if;
  return jsonb_build_object('parentCode', s.parent_code, 'familyCode', s.family_code);
end $$;

revoke execute on function public.student_parent_code(text, text) from public;
grant execute on function public.student_parent_code(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
