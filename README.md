# Metiq — Matematika Kelas 1

Latihan matematika kelas 1 dalam bahasa Indonesia, dengan dasbor guru dan laporan orang tua.
Website statis (HTML/CSS/JS, tanpa build), bisa dibuka di browser HP.

## Menjalankan
```bash
python -m http.server 5173
```
Lalu buka http://localhost:5173. Klik **"Isi data contoh"** di beranda untuk mencoba dasbor
(guru contoh, PIN `1234`).

## Struktur
- `js/curriculum.js`: 15 bab dan 63 keterampilan. Setiap keterampilan punya pembuat soal acak, gambar, penjelasan, dan pola kesalahan.
- `js/store.js`: penyimpanan data (saat ini `localStorage` di perangkat), dan SmartScore.
- `js/app.js`: tampilan siswa, guru, orang tua.
- `css/style.css`: tampilan (mobile-first).

## Server (Supabase)
- `js/config.js` berisi URL proyek dan publishable key (aman untuk browser). Kosongkan keduanya untuk mode lokal.
- `supabase/schema.sql`: tabel dan fungsi RPC. Jalankan di SQL Editor Supabase saat membuat proyek baru.
- `js/cloud.js`: memanggil RPC dan mengirim jawaban siswa lewat kotak keluar (tetap aman saat offline).
- Semua tabel dikunci (RLS tanpa policy); akses hanya lewat fungsi yang memeriksa token guru, kode kelas, atau kode orang tua.
- "Isi data contoh" tetap berjalan lokal dan tidak dikirim ke server.
