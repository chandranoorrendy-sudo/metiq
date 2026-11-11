-- Metiq — Bintang kelas: siswa yang maju menjawab di layar kelas (Mode Mengajar, Soal ke depan) memilih namanya sendiri,
-- dan mendapat 1 bintang bila benar di percobaan pertama. Bintang ini hanya terlihat oleh guru kelas (tidak ada fungsi siswa
-- atau orang tua yang membacanya) dan terpisah dari bintang latihan pribadi siswa.
-- Jalankan setelah 029.

create table if not exists public.class_stars (
  id text primary key default public._id(),
  class_id text not null references public.classes(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  teacher_id text references public.teachers(id) on delete set null,
  points int not null default 1 check (points between 1 and 5),
  unit text,
  skill text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists class_stars_class on public.class_stars (class_id, created_at desc);
alter table public.class_stars enable row level security;
revoke all on public.class_stars from anon, authenticated;

create or replace function public.class_star_add(p_token text, p_class_id text, p_student_id text, p_points int, p_unit text, p_skill text, p_note text) returns text
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); sid text;
begin
  if not _can_class(t, p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
  if not exists (select 1 from students where id = p_student_id and class_id = p_class_id) then raise exception 'Siswa tidak ditemukan'; end if;
  -- pengaman salah ketuk berulang: paling banyak 60 bintang per siswa per hari
  if (select coalesce(sum(points), 0) from class_stars where student_id = p_student_id and created_at > now() - interval '1 day') >= 60 then
    raise exception 'Bintang hari ini untuk siswa ini sudah banyak sekali';
  end if;
  insert into class_stars (class_id, student_id, teacher_id, points, unit, skill, note)
  values (p_class_id, p_student_id, t, least(greatest(coalesce(p_points, 1), 1), 5), left(p_unit, 10), left(p_skill, 10), left(p_note, 200))
  returning id into sid;
  return sid;
end $$;

-- Membatalkan bintang (salah pilih nama): hanya 24 jam terakhir
create or replace function public.class_star_undo(p_token text, p_id text) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token); c text;
begin
  select class_id into c from class_stars where id = p_id and created_at > now() - interval '1 day';
  if c is null or not _can_class(t, c) then raise exception 'Bintang tidak ditemukan'; end if;
  delete from class_stars where id = p_id;
end $$;

-- Rekap untuk guru: jumlah per siswa (hari ini, pekan ini mulai Senin, bulan ini, semua) dan 30 bintang terakhir
create or replace function public.class_stars_list(p_token text, p_class_id text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token); d0 timestamptz := date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';
begin
  if not _can_class(t, p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
  return jsonb_build_object(
    'totals', coalesce((select jsonb_agg(jsonb_build_object('sid', x.student_id, 'today', x.today, 'week', x.week, 'month', x.month, 'all', x.total)) from (
      select student_id,
        sum(points) filter (where created_at >= d0) as today,
        sum(points) filter (where created_at >= d0 - make_interval(days => (extract(isodow from now() at time zone 'Asia/Jakarta')::int - 1))) as week,
        sum(points) filter (where created_at >= date_trunc('month', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta') as month,
        sum(points) as total
      from class_stars where class_id = p_class_id group by student_id) x), '[]'::jsonb),
    'recent', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'sid', r.student_id, 'points', r.points, 'unit', r.unit, 'skill', r.skill, 'note', r.note, 'ts', _ms(r.created_at)) order by r.created_at desc)
      from (select * from class_stars where class_id = p_class_id order by created_at desc limit 30) r), '[]'::jsonb));
end $$;

grant execute on function public.class_star_add(text, text, text, int, text, text, text), public.class_star_undo(text, text), public.class_stars_list(text, text) to anon, authenticated;
