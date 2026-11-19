/* 014a — Dasar bintang server (berkas kecil, aman ditempel di SQL Editor).
 *
 * Menyiapkan kolom dan tabel yang dipakai 014b:
 *  - answers.round_id / kind / unit: nomor putaran tiap jawaban,
 *  - star_claims: satu klaim putaran hanya dihitung sekali,
 *  - _day_jkt: tanggal menurut Waktu Indonesia Barat.
 *
 * Jalankan setelah 013, lalu 014b. Aman dijalankan berulang.
 */

alter table public.answers add column if not exists round_id text;
alter table public.answers add column if not exists kind text;
alter table public.answers add column if not exists unit text;

create index if not exists answers_round on public.answers (student_id, round_id);

create table if not exists public.star_claims (
  student_id text not null references public.students(id) on delete cascade,
  claim_id text not null,
  kind text not null,
  stars int not null default 0,
  at bigint not null,
  primary key (student_id, claim_id)
);

/* Hanya fungsi server yang boleh membaca/menulis tabel ini. */
alter table public.star_claims enable row level security;
revoke all on table public.star_claims from anon, authenticated;

/* Tanggal WIB, supaya batas 30 bintang per hari tidak ikut jam server (UTC). */
create or replace function public._day_jkt(p_ts bigint) returns text
language sql immutable
as $$
  select to_char(to_timestamp((coalesce(p_ts, 0)::double precision) / 1000.0) at time zone 'Asia/Jakarta', 'YYYYMMDD');
$$;

revoke execute on function public._day_jkt(bigint) from public;

/* Catatan migrasi (dibuat juga oleh 034 bila belum ada). */
create table if not exists public.schema_migrations (
  version text primary key,
  name text not null,
  applied_at timestamptz not null default now()
);
alter table public.schema_migrations enable row level security;
revoke all on table public.schema_migrations from anon, authenticated;
insert into public.schema_migrations (version, name)
values ('014a', 'bintang server: kolom jawaban, klaim, tanggal WIB')
on conflict (version) do nothing;

notify pgrst, 'reload schema';
