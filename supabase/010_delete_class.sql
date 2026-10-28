-- Metiq — menghapus kelas.
-- Jalankan sekali di SQL Editor setelah 009_class_teacher.sql. Aman dijalankan ulang.
-- Boleh dilakukan guru kelas itu, admin sekolahnya, atau super admin. Nama kelas harus diketik ulang sebagai konfirmasi.
-- Siswa, jawaban, progres, tugas, dan ulasan di kelas itu ikut terhapus (tidak bisa dibatalkan).
-- Kelas terakhir seorang guru tidak bisa dihapus, agar akunnya tetap punya kelas.

create or replace function public.teacher_delete_class(p_token text, p_class_id text, p_confirm_name text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); c classes; n int;
begin
  select * into c from classes where id = p_class_id;
  if c.id is null or not _can_class(t, c.id) then raise exception 'Kelas tidak ditemukan'; end if;
  if lower(trim(coalesce(p_confirm_name, ''))) <> lower(trim(c.name)) then raise exception 'Nama kelas yang diketik tidak cocok'; end if;
  if (select count(*) from classes where teacher_id = c.teacher_id) <= 1 then
    raise exception 'Ini satu-satunya kelas guru tersebut. Buat kelas lain atau pindahkan kelas ke guru lain dulu.';
  end if;
  select count(*) into n from students where class_id = c.id;
  delete from classes where id = c.id;  -- siswa, tugas, dan data terkait ikut terhapus (on delete cascade)
  return jsonb_build_object('ok', true, 'name', c.name, 'students', n);
end $$;

grant execute on function public.teacher_delete_class(text, text, text) to anon, authenticated;
