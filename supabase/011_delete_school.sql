-- Metiq — super admin menghapus sekolah, guru, dan akun orang tua (misalnya data uji coba).
-- Jalankan sekali di SQL Editor setelah 010_delete_class.sql. Aman dijalankan ulang.
-- Semua penghapusan memerlukan nama yang diketik ulang dan tidak bisa dibatalkan.
-- Akun super admin tidak pernah ikut terhapus: jika ada di sekolah yang dihapus, ia hanya dilepas dari sekolah itu.

-- Hapus sekolah beserta guru-gurunya; kelas, siswa, dan semua datanya ikut terhapus
create or replace function public.super_school_delete(p_token text, p_school_id text, p_confirm_name text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token); s schools; nt int; nc int; ns int;
begin
  select * into s from schools where id = p_school_id;
  if s.id is null then raise exception 'Sekolah tidak ditemukan'; end if;
  if lower(trim(coalesce(p_confirm_name, ''))) <> lower(trim(s.name)) then raise exception 'Nama sekolah yang diketik tidak cocok'; end if;
  select count(*) into nt from teachers t where t.school_id = s.id and not _is_admin(t.id);
  select count(*) into nc from classes c join teachers t on t.id = c.teacher_id where t.school_id = s.id and not _is_admin(t.id);
  select count(*) into ns from students st join classes c on c.id = st.class_id join teachers t on t.id = c.teacher_id where t.school_id = s.id and not _is_admin(t.id);
  update teachers t set school_id = null, is_school_admin = false where t.school_id = s.id and _is_admin(t.id);
  delete from teachers t where t.school_id = s.id;      -- kelas, siswa, sesi, dan data terkait ikut terhapus
  delete from schools where id = s.id;
  return jsonb_build_object('ok', true, 'name', s.name, 'teachers', nt, 'classes', nc, 'students', ns);
end $$;

-- Hapus satu guru beserta kelas-kelasnya
create or replace function public.super_teacher_delete(p_token text, p_teacher_id text, p_confirm_name text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token); t teachers; nc int; ns int;
begin
  select * into t from teachers where id = p_teacher_id;
  if t.id is null then raise exception 'Guru tidak ditemukan'; end if;
  if _is_admin(t.id) then raise exception 'Akun super admin tidak bisa dihapus'; end if;
  if lower(trim(coalesce(p_confirm_name, ''))) <> lower(trim(t.name)) then raise exception 'Nama guru yang diketik tidak cocok'; end if;
  select count(*) into nc from classes where teacher_id = t.id;
  select count(*) into ns from students st join classes c on c.id = st.class_id where c.teacher_id = t.id;
  delete from teachers where id = t.id;
  return jsonb_build_object('ok', true, 'name', t.name, 'classes', nc, 'students', ns);
end $$;

-- Daftar dan hapus akun orang tua (data anak tidak ikut terhapus, hanya tautannya)
create or replace function public.super_parents(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare me text := _super(p_token);
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'email', p.email, 'status', p.status,
      'createdAt', (extract(epoch from p.created_at) * 1000)::bigint,
      'kids', coalesce((select jsonb_agg(st.name order by st.name) from parent_students ps join students st on st.id = ps.student_id where ps.parent_id = p.id), '[]'::jsonb)) order by p.created_at desc)
    from parents p), '[]'::jsonb);
end $$;

create or replace function public.super_parent_delete(p_token text, p_parent_id text, p_confirm_name text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token); p parents;
begin
  select * into p from parents where id = p_parent_id;
  if p.id is null then raise exception 'Akun orang tua tidak ditemukan'; end if;
  if lower(trim(coalesce(p_confirm_name, ''))) <> lower(trim(p.name)) then raise exception 'Nama yang diketik tidak cocok'; end if;
  delete from parents where id = p.id;  -- sesi dan tautan ke anak ikut terhapus; data anak tetap ada
  return jsonb_build_object('ok', true, 'name', p.name);
end $$;

grant execute on function public.super_school_delete(text, text, text), public.super_teacher_delete(text, text, text),
  public.super_parents(text), public.super_parent_delete(text, text, text) to anon, authenticated;
