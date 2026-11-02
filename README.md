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
- `js/grade0.js`: TK A (setara Pre-K IXL, usia 4–5 tahun, 10 bab) dan TK B (setara Kindergarten IXL, usia 5–6 tahun, 12 bab), 52 keterampilan bergambar dengan kalimat pendek. Id kelas −2 dan −1 (`C.GRADES.unshift`) sehingga tampil sebelum Kelas 1 dan selalu terbuka. Pilihan yang isinya hanya emoji ditampilkan besar. Dimuat setelah `js/kit-hs.js`. Ada 5 permainan TK di `js/games.js` (id `tka`–`tke`).
- SMP dan SMA, mengikuti urutan IXL (Kelas 8 langsung ke Aljabar 1): `js/kit-hs.js` (perangkat bersama: minus dan koma desimal, pecahan bertingkat, polinomial, penjelasan bertahap "Ide kunci" lalu langkah bernomor, pelajaran singkat), `js/grade7.js` (Kelas 7, 29 keterampilan), `js/grade8.js` (Kelas 8, 25), `js/algebra1.js` (Aljabar 1, 25), `js/geometry.js` (Geometri, 24), `js/algebra2.js` (Aljabar 2, 23), `js/precalculus.js` (Prakalkulus, 22), `js/calculus.js` (Kalkulus, 32). Jenjang ini memakai id kelas 7–13 dengan nama dan singkatan sendiri (`short`: 7, 8, A1, G, A2, PK, K). Total 524 keterampilan. Setiap jenjang juga punya 3 permainan (Kilat, Balon, Pasangan) di `js/games.js`.
- Kertas coret (tombol ✏️ saat latihan) muncul untuk soal yang perlu dihitung di kertas (bersusun, pecahan, desimal, persen, FPB/KPK, luas/volume, soal cerita) dan selalu tersedia mulai Kelas 7; bisa diatur per bab atau keterampilan dengan `coret: true/false`.
- `js/lessons-a.js` (kelas 1–3) dan `js/lessons-b.js` (kelas 4–6): Pelajaran untuk setiap bab (92 bab, 253 subbab) dengan langkah bernomor, catatan Cara Singapura, dan contoh "Ayo coba!" yang dibuat dari pembuat soal latihan. Rute `#/pelajaran/<bab>`.
- `js/iman.js`: lapisan iman opsional per kelas (Kelola kelas → 🌙 Pengaturan kelas). Konteks islami mengganti nama dan benda di soal (`C.setKonteks`) dan menampilkan bab 2Q Matematika dalam ibadah; mode adab menambah layar doa, pujian islami, dan menyembunyikan papan hadiah serta permainan Kilat. Kartu Hikmah dan teks doa hanya tampil setelah diisi dan diperiksa manusia (`verifiedBy`, `verifiedAt`); teks Al-Qur'an dan hadits tidak pernah dibuat otomatis.
- `js/games.js`: permainan di tab Main (`#/permainan`, `#/main/<id>`). Jenis: Kilat, Balon, Pasangan, Menara Pasangan, Menara Kembar, Garis Bilangan, Juring Pecahan, Jam Ajaib (kelas 1–4, id `1h`–`4h`), dan Ayo Belanja (kelas 1–3, id `1i`–`3i`). Setiap jenis punya label (`TYPES`), cara main bergambar (`HOW`), warna (`LOOK`), dan ilustrasi (`ART`). Permainan terbuka sampai kelas yang sedang dipelajari anak; tuntas satu kelas membuka kelas berikutnya. id permainan tidak boleh diganti karena tersimpan di progres (`g:<id>`).
- `js/mascot.js`: Meti si gurita, maskot utama (SVG dari kode, 8 pose: normal, hello, ask, cheer, happy, think, sad, oops). Fungsi bersama dibuka lewat `METIQ_MASCOT.KIT`; API: `svg(pose, { size, float, enter, cls, who })`, `face(size, pose, who)`, `friends`, `register()`. `js/mascot-friends.js`: teman Meti dengan gaya dan pose yang sama, yaitu Tito si semut (berhitung, pengukuran, uang), Nahla si lebah (geometri, pola, pecahan), dan Lumo si lumba-lumba (waktu, koordinat, data). Permainan memilih teman lewat `METIQ_GAMES.buddy(game)` (peta `BUDDY` per jenis permainan); halaman Pelajaran memilih teman menurut topik bab (`unitBuddy` di `js/app.js`, bisa diatur dengan `buddy` pada bab). Animasinya di `css/duo.css` (kelas `mq-who-<id>`). Pratinjau semua pose: `work in-progress/maskot-pratinjau.html`.
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
- `supabase/011_delete_school.sql`: super admin menghapus sekolah (beserta guru, kelas, siswa), guru, dan akun orang tua, dengan konfirmasi nama. Super admin tidak ikut terhapus. Jalankan setelah 010.
- `supabase/012_approve_with_class.sql`: saat menyetujui pengajuan guru, super admin bisa langsung memberinya kelas yang sudah ada (tanpa kelas baru). Jalankan setelah 011.
- `supabase/013_class_settings.sql` dan `014_bintang_server.sql`: pengaturan kelas (lapisan iman) dan bintang dihitung di server.
- `supabase/015_siswa_tanpa_kelas.sql`: anak bisa mulai belajar tanpa kelas dengan kode belajar pribadi; super admin bisa menyetujui siswa tanpa kelas; tab admin 🧺 Tanpa kelas.
- `supabase/016_kode_ortu_tanpa_kelas.sql`: daftar siswa tanpa kelas ikut menampilkan kode orang tua.
- `supabase/017_kode_keluarga.sql`: kode keluarga, satu kode untuk melihat laporan semua kakak-adik (`#/ortu`); admin menyatukan anak di tab Tanpa kelas.
- `supabase/018_gabung_kelas.sql`: anak bergabung ke kelas dengan kode dari guru (Pengaturan → Metiq untuk Sekolah), riwayat belajarnya ikut terlihat guru; tabel `app_feedback` untuk Kirim masukan.
- `supabase/013_class_settings.sql`: pengaturan per kelas (`classes.settings`: konteks umum/islami, mode adab) yang ikut terkirim di data kelas, dan fungsi `class_set_settings` untuk guru kelas, admin sekolah, atau super admin. Jalankan setelah 012.
- `supabase/014_bintang_server.sql`: bintang dihitung di server dari jawaban yang tersimpan (nomor putaran, batas 30 bintang per hari, hanya selisih di atas rekor untuk ujian bab dan permainan). Jalankan setelah 013, lalu nyalakan `starsServer` di `js/config.js`.

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
