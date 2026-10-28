# Metiq — Matematika SD (Kelas 1–6)

Latihan matematika SD kelas 1–6 dalam bahasa Indonesia, dengan dasbor guru dan laporan orang tua.
Website statis (HTML/CSS/JS, tanpa build), bisa dibuka di browser HP.

## Menjalankan
```bash
python -m http.server 5173
```
Lalu buka http://localhost:5173. Klik **"Isi data contoh"** di beranda untuk mencoba dasbor
(guru contoh, PIN `1234`).

## Struktur
- `js/curriculum.js`: kelas 1 (15 bab, 63 keterampilan) dan perangkat pembuat soal. Setiap keterampilan punya pembuat soal acak, gambar, penjelasan, dan pola kesalahan.
- `js/grade2.js`: kelas 2 (16 bab, 71 keterampilan). Kelas berikutnya ditambahkan sebagai file baru dengan pola yang sama (`C.register(...)` dan `C.GRADES.push(...)`).
- `js/kit-upper.js`: perangkat bersama kelas 3–6 (desimal berkoma, pecahan, FPB/KPK, gambar sudut, koordinat, balok, diagram, pola kesalahan tambahan).
- `js/grade3.js` … `js/grade6.js`: kelas 3 (55 keterampilan), 4 (55), 5 (49), 6 (51). Total 344 keterampilan.
- `js/lessons-a.js` (kelas 1–3) dan `js/lessons-b.js` (kelas 4–6): Pelajaran untuk setiap bab (92 bab, 253 subbab) dengan langkah bernomor, catatan Cara Singapura, dan contoh "Ayo coba!" yang dibuat dari pembuat soal latihan. Rute `#/pelajaran/<bab>`.
- `js/avatars.js`: katalog avatar (anak, guru, hewan, tumbuhan, bentuk, ikon) dan ilustrasi SVG Ustadz, Ustadzah, anak berhijab, anak berpeci. `js/sound.js`: efek suara Web Audio (benar, salah, Mahir, Tuntas, tugas selesai).
- `js/manual.js`: isi Panduan pemakaian untuk guru, orang tua, dan siswa (rute `#/panduan/<guru|ortu|siswa>`, bisa dicetak atau disimpan sebagai PDF).
- `icons/` dan `manifest.webmanifest`: ikon aplikasi untuk browser dan layar utama HP.
- Setiap bab mencatat rujukan IXL, Singapore Math, dan Kurikulum Merdeka (`ixl`, `sg`, `km`), yang tampil di tab Referensi pada dasbor guru.
- `js/store.js`: penyimpanan data (saat ini `localStorage` di perangkat), dan SmartScore.
- `js/app.js`: tampilan siswa, guru, orang tua. Tab Analitik guru berisi Penggunaan, Titik masalah, Kisi skor, Log soal, dan Kemajuan, dengan filter tanggal. Kemajuan menghitung ulang SmartScore dari riwayat jawaban (`Store.nextScore`).
- `css/style.css`: tampilan (mobile-first).

## Server (Supabase)
- `js/config.js` berisi URL proyek dan publishable key (aman untuk browser). Kosongkan keduanya untuk mode lokal.
- `supabase/schema.sql`: tabel dan fungsi RPC. Jalankan di SQL Editor Supabase saat membuat proyek baru.
- `supabase/005_targeted_assignments.sql`: tugas untuk siswa tertentu (kolom `student_ids`; kosong = seluruh kelas). Jalankan setelah 004.
- `supabase/006_research_feedback_bbo.sql`: NISN siswa, catatan orang tua membuka laporan, ulasan tugas (bintang + komentar), ringkasan tugas selesai, dan pengiriman laporan tugas ke BBO Digital (pg_net). Jalankan setelah 005.
- `supabase/007_trial_usage.sql`: catatan penggunaan Mode Coba (nama yang diketik penguji, peran, halaman, soal, permainan, asesmen) dan ringkasannya untuk admin (tab 🏫 Sekolah → 🧪 Mode coba). Jalankan setelah 006.
- `supabase/008_schools_superadmin.sql`: banyak sekolah (termasuk keluarga homeschool), pengajuan akun guru/homeschool/orang tua/siswa yang disetujui super admin, admin sekolah, dan dasbor super admin. Butuh 006 sudah dijalankan. Data lama masuk ke sekolah "Kuttab Imam Al-Ghazali".
- `supabase/009_class_teacher.sql`: super admin menentukan guru sebuah kelas (tab 🌐 Super admin → 📚 Kelas). Jalankan setelah 008.
- `supabase/010_delete_class.sql`: menghapus kelas beserta siswanya (guru kelas, admin sekolah, atau super admin; nama kelas diketik ulang sebagai konfirmasi). Jalankan setelah 009.

### Menghubungkan ke BBO Digital

Setelah BBO Digital punya fungsi `metiq_ingest(p_secret text, p_report jsonb)`, isi pengaturan di SQL Editor Metiq:

```sql
insert into public.integrations (name, url, apikey, secret)
values ('bbo', 'https://<proyek-bbo>.supabase.co', '<publishable key BBO>', '<rahasia bersama>')
on conflict (name) do update set url = excluded.url, apikey = excluded.apikey, secret = excluded.secret, enabled = true;
```

Setiap tugas yang selesai oleh siswa ber-NISN dikirim otomatis; statusnya terlihat di halaman siswa (guru) dan di tabel `bbo_outbox`.
- `supabase/004_assignment_done.sql`: catatan tugas selesai untuk notifikasi guru (siswa menyelesaikan tugas) dan orang tua (tugas baru). Jalankan setelah 003.
- `supabase/003_avatars.sql`: avatar guru dan fungsi mengganti avatar siswa/guru. Jalankan setelah 002.
- `supabase/002_roles.sql`: admin (melihat semua kelas) dan akun orang tua (banyak anak, belajar sebagai anak). Jalankan setelah schema.sql; hasilnya menampilkan kode admin.
- `js/cloud.js`: memanggil RPC dan mengirim jawaban siswa lewat kotak keluar (tetap aman saat offline).
- Semua tabel dikunci (RLS tanpa policy); akses hanya lewat fungsi yang memeriksa token guru, kode kelas, atau kode orang tua.
- "Isi data contoh" tetap berjalan lokal dan tidak dikirim ke server.
