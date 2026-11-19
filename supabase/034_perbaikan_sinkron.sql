/* 034 — Perbaikan sinkronisasi progres (berkas kecil, aman ditempel di SQL Editor).
 *
 * 1) Progres tidak ditimpa saat jumlah percobaan (att) sama. Sebuah trigger membandingkan
 *    att, score, ok, ms, last: rekaman yang lebih besar menang; yang sama/kalah diabaikan.
 *    Ini berlaku untuk semua penulis, termasuk fungsi lama student_sync.
 *
 * 2) Angka bintang x:/u:/g: tidak pernah diterima dari perangkat. Fungsi student_sync lama
 *    diganti nama menjadi _student_sync_v1 dan hanya bisa dipanggil lewat pembungkus baru
 *    student_sync, yang membuang x:/u:/g: dari kiriman perangkat dan selalu memakai mode server.
 *
 * Jalankan setelah 033. Aman dijalankan berulang.
 */

create table if not exists public.schema_migrations (
  version text primary key,
  name text not null,
  applied_at timestamptz not null default now()
);
insert into public.schema_migrations (version, name)
values ('034', 'perbaikan sinkronisasi progres')
on conflict (version) do nothing;

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

drop trigger if exists progress_guard on public.progress;
create trigger progress_guard before update on public.progress
for each row execute function public._progress_guard();

/* Pembungkus student_sync: buang x:/u:/g: dari perangkat, selalu mode server. */
do $$
begin
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                 where n.nspname = 'public' and p.proname = '_student_sync_v1') then
    alter function public.student_sync(text, text, jsonb, jsonb, jsonb, boolean)
      rename to _student_sync_v1;
  end if;
end $$;

create or replace function public.student_sync(
  p_code text,
  p_student_id text,
  p_answers jsonb,
  p_progress jsonb,
  p_claims jsonb default '[]'::jsonb,
  p_server boolean default false
) returns jsonb
language sql volatile security definer set search_path = public
as $$
  select public._student_sync_v1(
    p_code,
    p_student_id,
    p_answers,
    (select coalesce(jsonb_object_agg(e.k, e.v), '{}'::jsonb)
       from jsonb_each(coalesce(p_progress, '{}'::jsonb)) e
      where e.k not like 'x:%' and e.k not like 'u:%' and e.k not like 'g:%'),
    coalesce(p_claims, '[]'::jsonb),
    true
  );
$$;

revoke execute on function public._student_sync_v1(text, text, jsonb, jsonb, jsonb, boolean) from public, anon, authenticated;
revoke execute on function public.student_sync(text, text, jsonb, jsonb, jsonb, boolean) from public;
grant execute on function public.student_sync(text, text, jsonb, jsonb, jsonb, boolean) to anon, authenticated;

notify pgrst, 'reload schema';
