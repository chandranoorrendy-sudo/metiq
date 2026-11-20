# Pembayaran Metiq Plus sementara melalui transfer dan WhatsApp

Alur ini tidak menampilkan nomor rekening di halaman publik dan tidak menyimpan foto bukti transfer di server Metiq.

1. Jalankan `037_paket_keluarga.sql`, lalu `038_paket_keluarga_manual.sql` di SQL Editor Supabase.
2. Deploy aplikasi. Pada halaman Harga, orang tua memilih anak dan paket lalu membuka chat WhatsApp admin dengan pesan yang sudah disiapkan.
3. Admin mengirim instruksi transfer BSI secara pribadi. Orang tua mengirim bukti transfer melalui WhatsApp.
4. Admin memeriksa dana masuk melalui mutasi rekening (jangan mengaktifkan paket hanya dari screenshot).
5. Di Metiq, masuk sebagai super admin → **Super admin → Metiq Plus**, pilih paket yang dibayar, tulis tanggal atau referensi transfer, lalu tekan **Aktifkan**.

Akses berlaku per anak. Pembelian baru memperpanjang dari tanggal kedaluwarsa yang ada, jika masih aktif. Tidak ada perpanjangan otomatis.
