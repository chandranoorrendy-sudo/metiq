/* 036 — Satu student_sync saja.
 *
 * Setelah 014c ada dua versi student_sync: 4 argumen (aplikasi lama) dan 6 argumen
 * (p_claims dan p_server punya nilai bawaan). PostgREST lalu tidak bisa memilih untuk
 * panggilan 4 argumen dan menjawab PGRST203 "Multiple Choices".
 *
 * Versi 4 argumen dihapus. Aplikasi lama otomatis memakai versi 6 argumen dengan nilai
 * bawaan, jadi tetap berjalan — dan bintang dari perangkat tetap dibuang.
 *
 * Jalankan setelah 014c. Hanya menghapus satu fungsi; tidak menyentuh data.
 */

drop function if exists public.student_sync(text, text, jsonb, jsonb);

insert into public.schema_migrations (version, name)
values ('036', 'satu student_sync: versi 4 argumen dihapus')
on conflict (version) do nothing;

notify pgrst, 'reload schema';
