# Menyiapkan pembayaran Metiq Plus

Integrasi memakai Midtrans Snap dan Vercel Functions. Mode default adalah sandbox. Server Key tidak pernah dikirim ke browser.

## 1. Siapkan database

Jalankan `037_paket_keluarga.sql` di Supabase SQL Editor setelah skema akun orang tua (`002_roles.sql`) terpasang. Tabel pesanan dan langganan memakai RLS tanpa akses langsung dari browser; hanya fungsi server dengan service role yang dapat menulisnya.

## 2. Tambahkan environment variables di Vercel

Atur variabel berikut untuk Preview terlebih dahulu:

- `SUPABASE_URL` — URL proyek Supabase yang sama dengan `js/config.js`.
- `SUPABASE_SERVICE_ROLE_KEY` — service role key Supabase. Simpan sebagai Secret di Vercel; jangan masukkan ke Git atau browser.
- `MIDTRANS_SERVER_KEY` — Server Key sandbox dari Midtrans.
- `MIDTRANS_CLIENT_KEY` — Client Key sandbox dari Midtrans.
- `MIDTRANS_IS_PRODUCTION` — `false` untuk sandbox; gunakan `true` hanya setelah uji sandbox dan aktivasi produksi.

Setelah variabel diubah, buat deployment Preview baru. Jika variabel belum tersedia, halaman Harga tetap menampilkan paket, sedangkan tombol checkout memberi tahu bahwa pembayaran belum aktif.

## 3. Atur notifikasi Midtrans

Di Midtrans Sandbox, isi Payment Notification URL dengan:

`https://metiqmath.com/api/family/webhook`

Endpoint memeriksa signature notifikasi, meminta status transaksi langsung ke API Midtrans, mencocokkan nominal pesanan, lalu mengaktifkan periode berlangganan secara idempoten. Snap token dibuat di backend dan Snap.js hanya menerima Client Key.

## 4. Uji sebelum produksi

Uji minimal transaksi berhasil, pending, dibatalkan, kedaluwarsa, pengulangan webhook, dan ketidakcocokan nominal. Pastikan paket aktif baru muncul setelah notifikasi yang terverifikasi. Untuk produksi, ganti Client/Server Key dengan kunci produksi, ubah `MIDTRANS_IS_PRODUCTION=true`, periksa URL notifikasi produksi, lalu buat deployment baru.

Paket yang disiapkan: Rp39.000/bulan dan Rp399.000/tahun. Harga yang dikirim ke Midtrans ditentukan di backend (`api/family/create-checkout.js`) agar jumlah pembayaran tidak dapat diubah dari browser.
