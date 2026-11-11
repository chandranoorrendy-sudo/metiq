-- Metiq — Jadwal pertemuan: guru menyusun jadwal mengajar satu semester (tanggal, kelas, bab), memulai pertemuan, lalu
-- menekan Selesai dengan ringkasan singkat. Admin sekolah (koordinator) membaca laporan semua guru di sekolahnya;
-- super admin membaca semua. Pengingat persiapan (H-2, H-1, hari H) dihitung di aplikasi dari jadwal ini.
-- Guru yang berhalangan (sakit, dinas) menyerahkan satu pertemuan ke rekan di sekolah yang sama (sub_teacher). Rekan itu
-- melihat pertemuannya di jadwal, mendapat pengingat, dan bisa memulai serta menyelesaikannya.
-- Jalankan setelah 030.

create table if not exists public.class_meetings (
  id text primary key default public._id(),
  class_id text not null references public.classes(id) on delete cascade,
  created_by text references public.teachers(id) on delete set null,
  taught_by text references public.teachers(id) on delete set null,
  date date not null,
  units text[] not null default '{}',
  title text,
  note text,
  prep text,
  status text not null default 'rencana' check (status in ('rencana', 'berlangsung', 'selesai', 'batal')),
  started_at timestamptz,
  ended_at timestamptz,
  summary jsonb not null default '{}'::jsonb,
  sub_teacher text references public.teachers(id) on delete set null,
  sub_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists class_meetings_class_date on public.class_meetings (class_id, date);
create index if not exists class_meetings_sub on public.class_meetings (sub_teacher, date) where sub_teacher is not null;
alter table public.class_meetings enable row level security;
revoke all on public.class_meetings from anon, authenticated;

-- Kelas yang boleh dilihat pemanggil: kelasnya sendiri, semua kelas sekolahnya (admin sekolah), atau semua (super admin).
-- Sama dengan aturan teacher_bundle dan _can_class.
create or replace function public._meet_classes(p_tid text) returns text[]
language sql stable security definer set search_path = public
as $$
  select coalesce(array_agg(c.id), '{}') from classes c join teachers owner on owner.id = c.teacher_id, teachers me
  where me.id = p_tid and me.status = 'aktif'
    and (c.teacher_id = p_tid or _is_admin(p_tid) or (me.is_school_admin and me.school_id is not null and owner.school_id = me.school_id))
$$;

create or replace function public._meet_json(m public.class_meetings) returns jsonb language sql stable set search_path = public
as $$ select jsonb_build_object('id', m.id, 'classId', m.class_id, 'date', to_char(m.date, 'YYYY-MM-DD'), 'units', to_jsonb(m.units), 'title', m.title, 'note', m.note, 'prep', m.prep,
  'status', m.status, 'startedAt', _ms(m.started_at), 'endedAt', _ms(m.ended_at), 'summary', m.summary, 'taughtBy', m.taught_by,
  'taughtByName', (select name from teachers where id = m.taught_by), 'createdAt', _ms(m.created_at),
  'subTeacher', m.sub_teacher, 'subTeacherName', (select name from teachers where id = m.sub_teacher), 'subReason', m.sub_reason,
  'className', (select name from classes where id = m.class_id), 'classTeacherName', (select t.name from classes c join teachers t on t.id = c.teacher_id where c.id = m.class_id)) $$;

-- Jadwal dalam rentang tanggal untuk semua kelas yang boleh dilihat (guru: kelasnya; admin sekolah: seluruh sekolah)
create or replace function public.meet_list(p_token text, p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); cls text[] := _meet_classes(t);
begin
  if p_to - p_from > 400 then raise exception 'Rentang tanggal paling panjang 400 hari'; end if;
  return coalesce((select jsonb_agg(_meet_json(m) order by m.date, m.created_at) from (
    select * from class_meetings where (class_id = any(cls) or sub_teacher = t) and date between p_from and p_to order by date limit 8000) m), '[]'::jsonb);
end $$;

-- Menyimpan banyak pertemuan sekaligus (jadwal semester untuk beberapa kelas). Item: {id?, classId, date, units[], title, note, prep}
create or replace function public.meet_save(p_token text, p_items jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); cls text[] := _meet_classes(t); it jsonb; mid text; ids jsonb := '[]'::jsonb; d date;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 600 then raise exception 'Paling banyak 600 pertemuan sekaligus'; end if;
  for it in select * from jsonb_array_elements(p_items) loop
    if not (it->>'classId' = any(cls)) then raise exception 'Kelas tidak ditemukan'; end if;
    d := (it->>'date')::date;
    if d < date '2020-01-01' or d > date '2100-01-01' then raise exception 'Tanggal tidak sah'; end if;
    if coalesce(it->>'id', '') = '' then
      insert into class_meetings (class_id, created_by, date, units, title, note, prep)
      values (it->>'classId', t, d, coalesce(array(select left(x, 10) from jsonb_array_elements_text(coalesce(it->'units', '[]'::jsonb)) x limit 6), '{}'),
              left(it->>'title', 120), left(it->>'note', 1000), left(it->>'prep', 1000))
      returning id into mid;
    else
      update class_meetings set class_id = it->>'classId',
        date = case when status = 'rencana' then d else date end,
        units = coalesce(array(select left(x, 10) from jsonb_array_elements_text(coalesce(it->'units', '[]'::jsonb)) x limit 6), '{}'),
        title = left(it->>'title', 120), note = left(it->>'note', 1000), prep = left(it->>'prep', 1000), updated_at = now()
      where id = it->>'id' and class_id = any(cls) returning id into mid;
      if mid is null then raise exception 'Pertemuan tidak ditemukan'; end if;
    end if;
    ids := ids || to_jsonb(mid);
  end loop;
  return ids;
end $$;

create or replace function public.meet_delete(p_token text, p_ids text[]) returns int
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); n int;
begin
  delete from class_meetings where id = any(p_ids) and class_id = any(_meet_classes(t)) and status in ('rencana', 'batal');
  get diagnostics n = row_count; return n;
end $$;

-- Mulai, selesai (dengan ringkasan), batal (mis. libur), atau kembali ke rencana
create or replace function public.meet_status(p_token text, p_id text, p_status text, p_summary jsonb, p_note text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); m class_meetings;
begin
  select * into m from class_meetings where id = p_id and (class_id = any(_meet_classes(t)) or sub_teacher = t);
  if not found then raise exception 'Pertemuan tidak ditemukan'; end if;
  -- guru pengganti hanya memulai dan menyelesaikan
  if m.sub_teacher = t and not (m.class_id = any(_meet_classes(t))) and p_status not in ('berlangsung', 'selesai') then raise exception 'Hanya guru kelas yang bisa mengubah ini'; end if;
  if p_status not in ('rencana', 'berlangsung', 'selesai', 'batal') then raise exception 'Status tidak dikenal'; end if;
  if pg_column_size(coalesce(p_summary, '{}'::jsonb)) > 20000 then raise exception 'Ringkasan terlalu besar'; end if;
  update class_meetings set status = p_status, taught_by = case when p_status in ('berlangsung', 'selesai') then t else taught_by end,
    started_at = case when p_status = 'berlangsung' then coalesce(started_at, now()) when p_status = 'selesai' then coalesce(started_at, now()) when p_status = 'rencana' then null else started_at end,
    ended_at = case when p_status = 'selesai' then now() when p_status = 'rencana' then null else ended_at end,
    summary = case when p_status = 'selesai' then coalesce(p_summary, '{}'::jsonb) when p_status = 'rencana' then '{}'::jsonb else summary end,
    note = case when p_note is not null then left(p_note, 1000) else note end, updated_at = now()
  where id = p_id returning * into m;
  return _meet_json(m);
end $$;

-- Rekan guru di sekolah yang sama (aktif), untuk dipilih sebagai pengganti
create or replace function public.meet_colleagues(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); sc text;
begin
  select school_id into sc from teachers where id = t;
  if sc is null then return '[]'::jsonb; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name) order by name) from teachers where school_id = sc and status = 'aktif' and id <> t), '[]'::jsonb);
end $$;

-- Menyerahkan satu pertemuan ke rekan di sekolah yang sama; p_teacher_id kosong = batalkan penyerahan
create or replace function public.meet_handover(p_token text, p_id text, p_teacher_id text, p_reason text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); m class_meetings; sc text;
begin
  select * into m from class_meetings where id = p_id and class_id = any(_meet_classes(t));
  if not found then raise exception 'Pertemuan tidak ditemukan'; end if;
  if m.status not in ('rencana', 'berlangsung') then raise exception 'Pertemuan yang sudah selesai atau dibatalkan tidak bisa diserahkan'; end if;
  if coalesce(p_teacher_id, '') <> '' then
    select owner.school_id into sc from classes c join teachers owner on owner.id = c.teacher_id where c.id = m.class_id;
    if not exists (select 1 from teachers where id = p_teacher_id and status = 'aktif' and school_id is not distinct from sc and sc is not null) then raise exception 'Guru pengganti harus dari sekolah yang sama'; end if;
  end if;
  update class_meetings set sub_teacher = nullif(p_teacher_id, ''), sub_reason = case when coalesce(p_teacher_id, '') = '' then null else left(p_reason, 200) end, updated_at = now()
  where id = p_id returning * into m;
  return _meet_json(m);
end $$;

revoke execute on function public._meet_classes(text), public._meet_json(public.class_meetings) from public, anon, authenticated;
grant execute on function public.meet_list(text, date, date), public.meet_save(text, jsonb), public.meet_delete(text, text[]), public.meet_status(text, text, text, jsonb, text),
  public.meet_colleagues(text), public.meet_handover(text, text, text, text) to anon, authenticated;
