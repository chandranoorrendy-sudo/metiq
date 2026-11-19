/* 034 — Urutan progres dan catatan migrasi (berkas kecil, aman ditempel).
 *
 * Progres tidak lagi ditimpa saat jumlah percobaan (att) sama. Trigger progress_guard
 * membandingkan (att, score, ok, ms, last): rekaman yang lebih besar menang, yang sama
 * atau lebih kecil diabaikan. Berlaku untuk semua penulis, bukan hanya student_sync.
 *
 * Jalankan setelah 014a, 014b, dan 014c. Aman dijalankan berulang.
 */

/* Hentikan lebih awal dengan pesan jelas bila 014c belum dijalankan. */
do $$
begin
  if to_regprocedure('public.student_sync(text,text,jsonb,jsonb,jsonb,boolean)') is null then
    raise exception 'Jalankan 014a_bintang_dasar.sql, 014b_bintang_klaim.sql, lalu 014c_student_sync.sql dulu, kemudian ulangi 034.';
  end if;
end $$;

create table if not exists public.schema_migrations (
  version text primary key,
  name text not null,
  applied_at timestamptz not null default now()
);
alter table public.schema_migrations enable row level security;
revoke all on table public.schema_migrations from anon, authenticated;

/* Aturan menang: att, score, ok, ms, last. */
create or replace function public._progress_guard() returns trigger
language plpgsql
as $$
begin
  if row(new.att, new.score, new.ok, new.ms, new.last)
     > row(old.att, old.score, old.ok, old.ms, old.last) then
    return new;
  end if;
  if row(new.att, new.score, new.ok, new.ms, new.last)
     = row(old.att, old.score, old.ok, old.ms, old.last)
     and old.mastered_at is null and new.mastered_at is not null then
    return new;
  end if;
  return old;
end $$;

create or replace trigger progress_guard before update on public.progress
for each row execute function public._progress_guard();

insert into public.schema_migrations (version, name)
values ('034', 'urutan progres: att, score, ok, ms, last')
on conflict (version) do nothing;

notify pgrst, 'reload schema';
