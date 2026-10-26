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
- Setiap bab mencatat rujukan IXL, Singapore Math, dan Kurikulum Merdeka (`ixl`, `sg`, `km`), yang tampil di tab Referensi pada dasbor guru.
- `js/store.js`: penyimpanan data (saat ini `localStorage` di perangkat), dan SmartScore.
- `js/app.js`: tampilan siswa, guru, orang tua. Tab Analitik guru berisi Penggunaan, Titik masalah, Kisi skor, Log soal, dan Kemajuan, dengan filter tanggal. Kemajuan menghitung ulang SmartScore dari riwayat jawaban (`Store.nextScore`).
- `css/style.css`: tampilan (mobile-first).

## Server (Supabase)
- `js/config.js` berisi URL proyek dan publishable key (aman untuk browser). Kosongkan keduanya untuk mode lokal.
- `supabase/schema.sql`: tabel dan fungsi RPC. Jalankan di SQL Editor Supabase saat membuat proyek baru.
- `supabase/002_roles.sql`: admin (melihat semua kelas) dan akun orang tua (banyak anak, belajar sebagai anak). Jalankan setelah schema.sql; hasilnya menampilkan kode admin.
- `js/cloud.js`: memanggil RPC dan mengirim jawaban siswa lewat kotak keluar (tetap aman saat offline).
- Semua tabel dikunci (RLS tanpa policy); akses hanya lewat fungsi yang memeriksa token guru, kode kelas, atau kode orang tua.
- "Isi data contoh" tetap berjalan lokal dan tidak dikirim ke server.
