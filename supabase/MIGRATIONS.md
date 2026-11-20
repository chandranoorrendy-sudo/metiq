# Catatan migrasi Supabase

Jalankan berkas di `supabase/` **berurutan** di SQL Editor Supabase. `schema.sql` lebih dulu,
lalu 002 sampai 035. Semua aman dijalankan ulang kecuali yang menghapus data (010, 011, 023).

Sejak 014a, setiap migrasi baru mencatat dirinya di tabel `public.schema_migrations`
(`version`, `name`, `applied_at`). Untuk memeriksa:

```sql
select version, name, applied_at from public.schema_migrations order by version;
```

| Versi | Berkas | Isi singkat |
|---|---|---|
| – | `schema.sql` | Tabel inti, RPC guru/siswa, token |
| 002 | `002_roles.sql` | Admin, akun orang tua, banyak anak |
| 003 | `003_avatars.sql` | Avatar guru dan siswa |
| 004 | `004_assignment_done.sql` | Tugas selesai, notifikasi |
| 005 | `005_targeted_assignments.sql` | Tugas untuk siswa tertentu |
| 006 | `006_research_feedback_bbo.sql` | NISN, ulasan, ringkasan, BBO Digital |
| 007 | `007_trial_usage.sql` | Catatan mode coba |
| 008 | `008_schools_superadmin.sql` | Banyak sekolah, super admin |
| 009 | `009_class_teacher.sql` | Guru sebuah kelas |
| 010 | `010_delete_class.sql` | Hapus kelas |
| 011 | `011_delete_school.sql` | Hapus sekolah |
| 012 | `012_approve_with_class.sql` | Setujui guru + kelas |
| 013 | `013_class_settings.sql` | Pengaturan kelas (iman/adab) |
| 014a | `014a_bintang_dasar.sql` | Kolom putaran jawaban, tabel klaim, tanggal WIB |
| 014b | `014b_bintang_klaim.sql` | Hitung bintang dari klaim putaran |
| 014c | `014c_student_sync.sql` | Sinkronisasi jawaban/progres + bintang server |
| 015 | `015_siswa_tanpa_kelas.sql` | Belajar tanpa kelas |
| 016 | `016_kode_ortu_tanpa_kelas.sql` | Kode orang tua tanpa kelas |
| 017 | `017_kode_keluarga.sql` | Kode keluarga |
| 018 | `018_gabung_kelas.sql` | Gabung kelas, masukan |
| 019 | `019_guru_tambah_kode.sql` | Guru menambah siswa dengan kode |
| 020 | `020_paket_sekolah.sql` | Paket sekolah berbayar |
| 021 | `021_pantau_tanpa_kelas.sql` | Pantau siswa tanpa kelas |
| 022 | `022_angka_beranda.sql` | Angka beranda |
| 023 | `023_hapus_siswa.sql` | Hapus siswa |
| 024 | `024_alamat_metiqmath.sql` | Alamat metiqmath.com |
| 025 | `025_kode_ortu_di_aku.sql` | Kode orang tua di halaman Aku |
| 026 | `026_keamanan.sql` | OWASP: batas tebakan, kode acak |
| 027 | `027_gmail_orang_tua.sql` | Orang tua masuk dengan Google |
| 028 | `028_gmail_perbaikan.sql` | Perbaikan Gmail |
| 029 | `029_sesi_kelas.sql` | Tugas langsung dan ujian |
| 030 | `030_bintang_kelas.sql` | Bintang kelas |
| 031 | `031_jadwal_pertemuan.sql` | Jadwal pertemuan |
| 032 | `032_riset_tanpa_kelas.sql` | Riset tanpa kelas |
| 033 | `033_ujian_fokus.sql` | Mode fokus ujian |
| 034 | `034_perbaikan_sinkron.sql` | Urutan progres: trigger `progress_guard` |
| 035 | `035_ulasan_orang_tua.sql` | Ulasan orang tua dengan sesi/kode orang tua |
| 036 | `036_satu_student_sync.sql` | Hapus `student_sync` 4 argumen (hindari PGRST203) |
| 037 | `037_paket_keluarga.sql` | Paket Metiq Plus dan status pesanan Midtrans |
| 038 | `038_paket_keluarga_manual.sql` | Pembayaran transfer manual dan aktivasi Plus oleh super admin |

## Catatan 014a–014c, 034, dan 035

- Migrasi lama `014_bintang_server.sql` dipecah menjadi 014a, 014b, 014c supaya tiap berkas
  kecil (2–6 KB) dan tidak terpotong SQL Editor Supabase.
- Progres menang berdasarkan urutan `att`, `score`, `ok`, `ms`, `last` (juga di `student_sync`, 014c).
- `x:`/`u:`/`g:` (bintang) tidak diterima dari perangkat; hanya server yang menulis kunci itu.
- Ulasan orang tua wajib `submit_feedback_parent` dengan sesi orang tua atau kode orang tua.
- `js/config.js` memakai `starsServer: true`. Bila 014c belum dijalankan, aplikasi otomatis
  kembali ke fungsi lama sehingga sinkronisasi tetap berjalan; muat ulang halaman setelah migrasi.
- Semua berkas di bawah 10 KB supaya bisa ditempel di SQL Editor Supabase.
- 036 menghapus `student_sync` 4 argumen supaya PostgREST tidak bingung memilih
  (PGRST203). Aplikasi lama tetap dilayani versi 6 argumen dengan nilai bawaan.
