/* 023 — Super admin melihat semua siswa dan menghapus akun siswa (misalnya akun uji coba).
 * Nama siswa harus diketik ulang sebagai konfirmasi. Penghapusan tidak bisa dibatalkan:
 * jawaban, skor, tugas selesai, ulasan, bintang, dan tautan orang tua ikut terhapus (on delete cascade).
 * Angka di beranda dihitung ulang setelah penghapusan.
 * Jalankan setelah 022. Aman dijalankan ulang.
 */
create or replace function public.super_students(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare me text := _super(p_token);
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', s.id, 'name', s.name, 'avatar', s.avatar, 'code', s.learn_code, 'parentCode', s.parent_code,
      'classId', s.class_id, 'className', c.name, 'schoolName', sc.name,
      'createdAt', (extract(epoch from s.created_at) * 1000)::bigint,
      'att', coalesce(p.att, 0), 'ok', coalesce(p.ok, 0), 'lastTs', p.last_ts
    ) order by s.created_at desc)
    from students s
    left join classes c on c.id = s.class_id
    left join teachers t on t.id = c.teacher_id
    left join schools sc on sc.id = t.school_id
    left join (select student_id, sum(att) att, sum(ok) ok, max(last) last_ts from progress
      where position(':' in skill) = 0 and att > 0 group by student_id) p on p.student_id = s.id
  ), '[]'::jsonb);
end $$;

create or replace function public.super_student_delete(p_token text, p_student_id text, p_confirm_name text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token); s students;
begin
  select * into s from students where id = p_student_id;
  if s.id is null then raise exception 'Siswa tidak ditemukan'; end if;
  if lower(trim(coalesce(p_confirm_name, ''))) <> lower(trim(s.name)) then raise exception 'Nama siswa yang diketik tidak cocok'; end if;
  delete from bbo_outbox where student_id = s.id;  -- satu-satunya tabel data belajar tanpa on delete cascade
  delete from students where id = s.id;
  delete from site_stats_cache where id = 1;       -- angka beranda dihitung ulang pada kunjungan berikutnya
  return jsonb_build_object('ok', true, 'name', s.name);
end $$;

revoke execute on function public.super_students(text), public.super_student_delete(text, text, text) from public;
grant execute on function public.super_students(text), public.super_student_delete(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
