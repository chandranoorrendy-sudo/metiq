/* 018 — Gabung kelas (seperti "Join a Classroom") dan tabel masukan aplikasi.
 * Anak yang sudah belajar (dengan kode belajar) memasukkan kode kelas dari guru. Anak tetap orang yang sama,
 * jadi seluruh riwayat belajarnya (progres, jawaban, bintang) langsung terlihat oleh guru kelas itu.
 * Identitas anak diperiksa dengan kode yang sedang dipakainya (kode belajar atau kode kelas lama) lewat _student_in.
 * Jalankan setelah 017.
 */
create or replace function public.student_join_class(p_student_id text, p_code text, p_class_code text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare c classes;
begin
  perform _student_in(p_code, p_student_id);
  select * into c from classes where code = upper(trim(coalesce(p_class_code, '')));
  if c.id is null then raise exception 'Kode kelas tidak ditemukan. Periksa lagi ya.'; end if;
  update students set class_id = c.id where id = p_student_id;
  return jsonb_build_object('classId', c.id, 'className', c.name, 'classCode', c.code);
end $$;

revoke execute on function public.student_join_class(text, text, text) from public;
grant execute on function public.student_join_class(text, text, text) to anon, authenticated;

/* Masukan dari halaman Pengaturan → Kirim masukan. Dibaca admin lewat Table Editor Supabase (tabel app_feedback). */
create table if not exists public.app_feedback (
  id bigint generated always as identity primary key,
  text text not null,
  role text,
  student_id text,
  page text,
  created_at timestamptz not null default now()
);
alter table public.app_feedback enable row level security;

create or replace function public.app_feedback_send(p_text text, p_role text default null, p_student_id text default null, p_page text default null) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare t text := left(trim(coalesce(p_text, '')), 1000);
begin
  if char_length(t) < 2 then raise exception 'Masukan masih kosong'; end if;
  insert into app_feedback (text, role, student_id, page) values (t, left(p_role, 20), left(p_student_id, 40), left(p_page, 40));
  return jsonb_build_object('ok', true);
end $$;

revoke execute on function public.app_feedback_send(text, text, text, text) from public;
grant execute on function public.app_feedback_send(text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
