-- Alamat Metiq pindah ke https://metiqmath.com: tautan di laporan tugas selesai (BBO) ikut diganti.
-- Jalankan sekali di Supabase SQL Editor. Pemicu assignment_done_bbo tetap memakai fungsi ini.

-- Dipanggil otomatis setiap ada tugas selesai. Kegagalan pengiriman tidak pernah membatalkan tugas selesai.
create or replace function public._send_bbo() returns trigger
language plpgsql security definer set search_path = public
as $$
declare cfg record; s record; rep jsonb; rid bigint;
begin
  select * into cfg from integrations where name = 'bbo' and enabled;
  if not found then return new; end if;
  begin
    select st.nisn, st.name sname, c.name cname, t.name tname, a.note, a.due, a.created_at acreated, a.student_ids
      into s from students st join classes c on c.id = st.class_id join teachers t on t.id = c.teacher_id
      join assignments a on a.id = new.assignment_id where st.id = new.student_id;
    if s.nisn is null then
      insert into bbo_outbox (assignment_id, student_id, status) values (new.assignment_id, new.student_id, 'tanpa_nisn');
      return new;
    end if;
    rep := jsonb_build_object(
      'id', new.assignment_id || ':' || new.student_id,
      'source', 'metiq',
      'nisn', s.nisn,
      'student_name', s.sname,
      'class_name', s.cname,
      'teacher_name', s.tname,
      'assignment', jsonb_build_object('note', s.note, 'due', s.due, 'created_at', s.acreated, 'targeted', s.student_ids is not null),
      'completed_at', new.done_at,
      'done_by', new.done_by,
      'skills', coalesce(new.summary, '[]'::jsonb),
      'link', 'https://metiqmath.com/');
    rid := net.http_post(
      url := rtrim(cfg.url, '/') || '/rest/v1/rpc/metiq_ingest',
      body := jsonb_build_object('p_secret', cfg.secret, 'p_report', rep),
      headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', cfg.apikey));
    insert into bbo_outbox (assignment_id, student_id, status, request_id) values (new.assignment_id, new.student_id, 'dikirim', rid);
  exception when others then
    insert into bbo_outbox (assignment_id, student_id, status, detail) values (new.assignment_id, new.student_id, 'gagal', left(sqlerrm, 300));
  end;
  return new;
end $$;
