-- Metiq — super admin menentukan guru sebuah kelas.
-- Jalankan sekali di SQL Editor setelah 008_schools_superadmin.sql. Aman dijalankan ulang.
-- Sekolah sebuah kelas mengikuti sekolah gurunya, jadi memindahkan kelas ke guru di sekolah lain juga memindahkan kelasnya.

create or replace function public.super_class_set_teacher(p_token text, p_class_id text, p_teacher_id text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token); t teachers;
begin
  select * into t from teachers where id = p_teacher_id;
  if t.id is null or t.status <> 'aktif' then raise exception 'Guru tidak ditemukan atau akunnya belum aktif'; end if;
  update classes set teacher_id = t.id where id = p_class_id;
  if not found then raise exception 'Kelas tidak ditemukan'; end if;
  return jsonb_build_object('teacherName', t.name, 'schoolName', (select name from schools where id = t.school_id));
end $$;

grant execute on function public.super_class_set_teacher(text, text, text) to anon, authenticated;
