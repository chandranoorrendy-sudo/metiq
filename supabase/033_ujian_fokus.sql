-- 033_ujian_fokus.sql — Metiq: catatan mode fokus ujian
-- Siswa yang meninggalkan halaman ujian (pindah tab/aplikasi) dihitung; guru melihat ⚠️ n di daftar siswa.
-- Jalankan di SQL Editor Supabase setelah 032.

alter table public.session_answers add column if not exists focus jsonb not null default '{}'::jsonb;

-- baris hasil sesi ikut mengirim jumlah pelanggaran fokus
create or replace function public._sesi_row(a public.session_answers) returns jsonb language sql stable
as $$ select case when a.session_id is null then null else jsonb_build_object('sid', a.student_id, 'answers', a.answers, 'paper', a.paper, 'score', a.score,
  'startedAt', _ms(a.started_at), 'submittedAt', _ms(a.submitted_at), 'focus', coalesce(a.focus, '{}'::jsonb)) end $$;

-- dipanggil perangkat siswa saat kembali ke halaman ujian
create or replace function public.student_sesi_focus(p_code text, p_student_id text, p_session text, p_count int) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id); s class_sessions; n int := greatest(coalesce(p_count, 0), 0);
begin
  select * into s from class_sessions where id = p_session and class_id = cid;
  if not found then return jsonb_build_object('ok', false); end if;
  insert into session_answers (session_id, student_id) values (p_session, p_student_id) on conflict do nothing;
  update session_answers set focus = jsonb_build_object('count', n, 'at', _ms(now()))
   where session_id = p_session and student_id = p_student_id and submitted_at is null;
  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.student_sesi_focus(text, text, text, int) to anon, authenticated;
