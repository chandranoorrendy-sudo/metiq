/* Metiq — Panduan pemakaian untuk guru, orang tua, dan siswa.
 * Setiap bagian: judul, ikon, langkah-langkah, dan catatan tips (opsional).
 */
(function () {
  window.METIQ_MANUAL = {
    guru: {
      title: 'Panduan untuk Guru',
      intro: 'Metiq membantu Anda memberi latihan matematika kelas 1–6, memberi tugas, dan memantau kemajuan setiap siswa dari HP.',
      sections: [
        { icon: '🔑', t: 'Mendaftar dan masuk', steps: [
          'Buka Metiq, lalu ketuk <b>Saya Guru</b>.',
          'Pertama kali: ketuk <b>Belum punya akun? Daftar</b>. Isi nama (misalnya "Ustadzah Diana"), email, kata sandi (minimal 6 karakter), dan nama kelas.',
          'Admin sekolah mengisi juga kolom <b>Kode admin</b> yang diberikan pengelola Metiq. Guru biasa mengosongkannya.',
          'Berikutnya cukup masuk dengan email dan kata sandi.',
        ], tip: 'Lima kali salah kata sandi akan mengunci akun selama 15 menit demi keamanan.' },
        { icon: '🏫', t: 'Menyiapkan kelas dan siswa', steps: [
          'Buka tab <b>🧒 Siswa</b>, ketuk <b>➕ Tambah siswa</b>, lalu ketik nama siswa. Untuk banyak siswa, pisahkan dengan koma.',
          'Ketuk <b>📤 Kirim kode</b> untuk membagikan kode kelas ke grup WhatsApp. Siswa membuka Metiq, ketuk <b>Saya Siswa</b>, masukkan kode, lalu pilih namanya.',
          'Siswa yang sudah punya akun Metiq sendiri ditambahkan dengan <b>kode belajar</b> (ada di bagian bawah kotak Tambah siswa).',
          'Setiap siswa punya <b>kode orang tua</b>. Kirim lewat tombol <b>📤 Orang tua</b> di daftar siswa, atau ketuk <b>🖨️ Cetak kartu kode</b>.',
          'Nama kelas, kelas baru, dan pengaturan kelas ada di tombol <b>⚙️ Kelas</b>.',
        ], tip: 'Mulailah dari tab 🏠 Hari ini: Metiq menuliskan langkah berikutnya beserta tombolnya.' },
        { icon: '📲', t: 'Membagikan akses ke siswa dan orang tua', steps: [
          'Bagikan tautan Metiq yang sama kepada semua siswa dan orang tua.',
          '<b>Siswa:</b> Saya Siswa → masukkan kode kelas → ketuk namanya.',
          '<b>Orang tua:</b> Saya Orang Tua → masukkan kode orang tua anaknya, atau buat akun lalu tambahkan anak dengan kode tersebut.',
          'Kartu kode yang dicetak bisa dibagikan saat rapat orang tua atau difoto dan dikirim lewat WhatsApp.',
        ], tip: 'Kode orang tua bersifat pribadi. Berikan hanya kepada orang tua siswa yang bersangkutan.' },
        { icon: '📌', t: 'Memberi tugas', steps: [
          'Buka tab <b>📌 Tugas</b>. <b>💡 Saran Metiq</b> berisi materi yang paling dibutuhkan siswa. Ketuk <b>Kirim</b>, selesai.',
          'Ingin memilih sendiri? Ketuk <b>➕ Buat tugas sendiri</b>, lalu ikuti 3 langkah: pilih materi, pilih untuk siapa, tulis pesan jika perlu.',
          'Tugas muncul di halaman belajar siswa, dan lonceng 🔔 orang tua akan menyala.',
          'Di bagian <b>Tugas berjalan</b> terlihat berapa siswa yang sudah selesai dan siapa yang belum.',
        ], tip: 'Untuk satu siswa: di 🏠 Hari ini ketuk <b>Beri latihan</b> di samping namanya. Siswa itu langsung mendapat latihan untuk materi yang masih sulit baginya.' },
        { icon: '🔔', t: 'Notifikasi tugas selesai', steps: [
          'Tugas dianggap selesai jika semua keterampilan di dalamnya mencapai tingkat <b>Mahir</b> (SmartScore 80 atau lebih), atau jika orang tua menekan <b>Laporkan sudah dikerjakan</b>.',
          'Saat itu lonceng 🔔 di kanan atas dasbor menunjukkan angka. Ketuk untuk melihat siapa yang sudah selesai.',
          'Tab <b>Tugas</b> juga menampilkan jumlah siswa yang sudah selesai dan nama yang belum.',
        ] },
        { icon: '📊', t: 'Memantau kemajuan', steps: [
          '<b>🏠 Hari ini:</b> berapa siswa yang berlatih, paling banyak tiga hal yang perlu dilakukan, siswa yang perlu dibantu, materi yang layak diulang bersama, dan bintang minggu ini.',
          '<b>🧒 Siswa:</b> siswa dikelompokkan menjadi Perlu dibantu, Belum mulai, Tidak berlatih, dan Baik. Ketuk nama untuk melihat apa yang sudah bisa dan apa yang perlu dibantu.',
          '<b>📌 Tugas:</b> saran tugas dan siapa yang sudah menyelesaikannya.',
        ], tip: 'Contoh soal yang salah dan pola kesalahannya tampil otomatis di halaman setiap siswa.' },
        { icon: '📈', t: 'Memahami SmartScore', steps: [
          'Setiap keterampilan punya skor 0–100. Skor naik cepat di awal dan makin pelan mendekati 100; jawaban salah menurunkannya.',
          '<b>Mulai</b> 1–49 · <b>Berkembang</b> 50–79 · <b>Mahir</b> 80–99 · <b>Tuntas</b> 100 🏆.',
          'Siswa harus menjawab benar secara konsisten untuk tuntas, jadi skor tinggi menunjukkan pemahaman, bukan tebakan.',
        ] },
        { icon: '📚', t: 'Kurikulum, pelajaran, dan referensi', steps: [
          'Metiq memuat 92 bab dan 344 keterampilan untuk kelas 1–6, disusun dari IXL dan Singapore Math dan dipetakan ke Kurikulum Merdeka.',
          'Setiap bab punya <b>Pelajaran</b> berisi langkah, catatan Cara Singapura, dan contoh soal yang bisa diganti.',
          '<b>⚙️ Kelas → 📚 Referensi kurikulum</b> menjelaskan sumber kurikulum, metode Singapore Math, peta setiap bab, dan daftar pola kesalahan.',
        ] },
        { icon: '🌐', t: 'Super admin dan admin sekolah', steps: [
          '<b>Guru mendaftar gratis</b> (Saya Guru → Daftar gratis) dan langsung aktif dengan kelas pertamanya. Tidak perlu persetujuan.',
          '<b>Admin sekolah</b> memasukkan guru ke sekolahnya di <b>🏫 Sekolah → 🧑‍🏫 Kelola guru</b> dengan email guru. Kelas dan siswa guru itu ikut tampil di dasbor sekolah. Fitur ini dan dasbor sekolah termasuk <b>paket Sekolah</b> (lihat halaman Harga).',
          '<b>Super admin</b> (pengelola Metiq) melihat semua sekolah dan keluarga homeschool di tab <b>🌐 Super admin</b>, mengaktifkan paket Sekolah setelah pembayaran (🏫 Sekolah → 💳 Paket sekolah), membaca permintaan penawaran di <b>📨 Penawaran</b>, dan menyetujui pengajuan orang tua atau siswa.',
          'Di <b>✋ Pengajuan</b>: periksa data pemohon, pilih sekolahnya (atau buat sekolah baru) untuk guru, pilih kelas untuk siswa, lalu ketuk <b>Setujui</b> atau <b>Tolak</b>. Kode kelas dan kode orang tua muncul di riwayat, dan bisa dikirim lewat WhatsApp.',
          'Di <b>📚 Kelas</b>, super admin memilih guru untuk setiap kelas (misalnya kelas Awal 2B diajar Ustadz A). Guru itu harus sudah punya akun aktif.',
          'Siswa yang mulai belajar sendiri muncul di tab <b>🧺 Tanpa kelas</b> (angkanya tampil di tab), lengkap dengan aktivitasnya: terakhir aktif, soal minggu ini, ketepatan, dan bab yang sedang dikerjakan. Saring dengan pil <b>Aktif</b>, <b>Jeda</b>, <b>Tidak aktif</b>, atau <b>Belum mulai</b>, ketuk <b>Lihat laporan</b> untuk kemajuan per bab dan jawaban terakhir, lalu masukkan anak ke kelas yang sesuai.',
          'Nama kelas diganti di <b>⚙️ Kelas → Ganti nama</b>. Kelas dihapus lewat tombol <b>🗑️ Hapus</b> di ⚙️ Kelas atau di 📚 Kelas; ketik nama kelasnya untuk konfirmasi. Siswa dan semua datanya ikut terhapus.',
          'Tab <b>🔬 Riset</b> berisi analitik, asesmen awal–akhir, dan data penelitian. Tab ini hanya terlihat oleh super admin.',
          '<b>Admin sekolah</b> (koordinator) melihat semua kelas di sekolahnya di tab <b>🏫 Sekolah</b>. Super admin bisa menjadikan guru sebagai admin sekolah di <b>👩‍🏫 Guru</b>.',
        ] },
        { icon: '🛡️', t: 'Khusus admin', steps: [
          'Akun admin melihat dan mengelola <b>semua kelas</b> dari semua guru.',
          'Pilih kelas lewat kotak pilihan di bawah nama kelas; nama guru pemilik kelas ikut ditampilkan.',
        ] },
        { icon: '🧭', t: 'Asesmen awal siswa', steps: [
          'Setiap siswa mengerjakan asesmen awal sekali, saat pertama kali masuk: memilih umur, lalu 8–15 soal adaptif dari keterampilan kunci kelas 1–6.',
          'Hasilnya terlihat di tab <b>Siswa</b> → nama siswa → <b>Lainnya</b>: kelas tempat siswa sebaiknya belajar dan keterampilan yang perlu dipelajari.',
          'Waktu menjawab ikut dipakai: semua benar dan cepat → asesmen melompat 2 kelas; benar tapi lambat → ditandai 🐢 perlu kelancaran; salah dalam kurang dari 3 detik → ⚠️ mungkin menebak.',
          'Asesmen akhir dan mengulang asesmen awal hanya bisa dilakukan super admin, agar data awal tidak tertimpa.',
        ] },
        { icon: '🪪', t: 'NISN dan BBO Digital', steps: [
          'Buka tab <b>Siswa</b> → ketuk nama siswa → <b>Lainnya</b> → <b>🪪 Data siswa</b>, lalu isi <b>NISN</b> (10 angka) dan ketuk Simpan NISN.',
          'Setiap kali siswa dengan NISN menyelesaikan tugas, laporannya (tugas, keterampilan, dan SmartScore) otomatis dikirim ke <b>BBO Digital</b> untuk siswa tersebut.',
          'Status pengiriman terlihat di bagian yang sama: ✅ Diterima BBO, ⏳ Sedang dikirim, atau ⚠️ Gagal terkirim.',
        ] },
        { icon: '🏫', t: 'Dasbor sekolah (admin sekolah)', steps: [
          'Tab <b>🏫 Sekolah</b> hanya muncul untuk admin sekolah dan menampilkan 30 hari terakhir.',
          '<b>Kondisi kelas:</b> setiap kelas diberi tanda 🟢 baik, 🟡 perlu dipantau, atau 🔴 perlu perhatian, disertai jumlah siswa yang berlatih dan yang perlu dibantu. Ketuk kelas untuk membukanya.',
          '<b>Materi sulit:</b> bab yang paling banyak belum dipahami di seluruh sekolah, lalu rinciannya per kelas.',
          '<b>Kelola guru:</b> tambahkan guru dengan emailnya.',
          'Guru cukup memakai Metiq di kelasnya masing-masing. Datanya otomatis masuk ke dasbor sekolah, jadi tidak perlu membuat laporan terpisah.',
        ] },
      ],
    },
    ortu: {
      title: 'Panduan untuk Orang Tua',
      intro: 'Dengan Metiq, Anda bisa melihat kemajuan belajar matematika anak, mengetahui bagian yang perlu dilatih, dan menerima kabar tugas dari guru.',
      sections: [
        { icon: '🔑', t: 'Dua cara masuk', steps: [
          '<b>Dengan kode orang tua</b> (cepat): Saya Orang Tua → masukkan kode 6 huruf/angka dari guru → laporan anak langsung tampil.',
          '<b>Dengan akun</b> (disarankan): Saya Orang Tua → <b>Daftar</b> → isi nama, email, dan kata sandi. Akun bisa memuat beberapa anak, menerima notifikasi tugas, dan dipakai untuk belajar bersama anak.',
        ] },
        { icon: '👨‍👩‍👧', t: 'Menambahkan anak ke akun', steps: [
          'Setelah masuk, buka bagian <b>Tambah anak</b>.',
          'Masukkan kode orang tua anak dari guru, lalu ketuk <b>Tambah</b>.',
          'Ulangi untuk setiap anak. Setiap anak tampil sebagai kartu dengan ringkasan belajarnya.',
        ] },
        { icon: '📄', t: 'Membaca laporan anak', steps: [
          'Ketuk <b>Lihat laporan</b> pada kartu anak.',
          'Bagian paling atas adalah <b>kesimpulan minggu ini</b> dalam satu kalimat, dan tanda ✓ untuk setiap hari anak berlatih.',
          '<b>📌 Tugas dari guru:</b> tugas yang belum selesai.',
          '<b>🏠 Bantu di rumah:</b> materi yang masih sulit, contoh soal yang salah, dan saran latihan. Ketuk <b>📖 Pelajari bersama</b> untuk materi singkat yang bisa dibaca bersama anak.',
          '<b>✅ Sudah bisa:</b> materi yang sudah dikuasai. Ketuk <b>Lihat rincian</b> untuk kemajuan per bab dan jawaban yang belum tepat.',
        ] },
        { icon: '🔔', t: 'Notifikasi tugas dari guru', steps: [
          'Saat guru memberi tugas, lonceng 🔔 di kanan atas menunjukkan angka.',
          'Ketuk lonceng untuk melihat tugasnya, tenggatnya, dan keterampilan mana yang sudah dikuasai anak (✅).',
          'Ketuk <b>Kerjakan sebagai [nama anak]</b> untuk langsung membuka latihan anak di HP Anda.',
          'Setelah anak mengerjakan, ketuk <b>Laporkan sudah dikerjakan</b>. Guru akan menerima notifikasi.',
          'Setelah tugas selesai, beri <b>bintang ⭐ dan komentar</b> tentang tugas itu. Ulasan Anda membantu sekolah memperbaiki tugas.',
        ], tip: 'Tugas juga tercatat selesai secara otomatis jika anak sudah Mahir di semua keterampilan tugas.' },
        { icon: '🧒', t: 'Belajar bersama anak', steps: [
          'Di kartu anak, ketuk <b>Belajar sebagai [nama anak]</b>. Hasil latihan tercatat atas nama anak.',
          'Ketuk <b>← Akun orang tua</b> di kanan atas untuk kembali ke akun Anda.',
        ] },
        { icon: '💡', t: 'Tips mendampingi anak', steps: [
          'Cukup <b>10–15 menit sehari</b>; rutin lebih baik daripada lama.',
          'Biarkan anak mencoba dulu. Jika salah, baca bersama bagian <b>Cara mengerjakan</b> yang muncul.',
          'Untuk anak kelas rendah, ketuk 🔊 agar soal dibacakan.',
          'Gunakan benda nyata di rumah (kancing, uang koin, sendok) sesuai saran di laporan.',
          'Puji usaha anak, bukan hanya nilainya. Skor yang turun sedikit setelah salah itu wajar.',
        ] },
      ],
    },
    siswa: {
      title: 'Panduan untuk Siswa',
      intro: 'Halo! Ini cara belajar matematika dengan Metiq. Ayo mulai! 🚀',
      sections: [
        { icon: '👋', t: 'Masuk', steps: [
          'Ketuk <b>Saya Siswa</b>.',
          'Ketik <b>kode kelas</b> dari Bu/Pak Guru, lalu ketuk <b>Masuk</b>.',
          'Ketuk <b>namamu</b>.',
        ] },
        { icon: '📚', t: 'Memilih latihan', steps: [
          'Pilih kelasmu di atas: <b>Kelas 1, Kelas 2, …</b>',
          'Ketuk sebuah bab, lalu ketuk keterampilan yang ingin kamu latih.',
          'Jika ada <b>📌 Tugas dari guru</b>, kerjakan itu dulu ya!',
          'Setelah mengerjakan minimal 5 soal di setiap keterampilan tugas, ketuk <b>✅ Kumpulkan</b>. Gurumu langsung mendapat notifikasi beserta skormu.',
        ] },
        { icon: '🧭', t: 'Asesmen awal', steps: [
          'Saat pertama kali masuk, kamu diminta mengerjakan <b>asesmen awal</b>. Cukup sekali saja.',
          'Pilih umurmu, lalu jawab sekitar 8–15 soal. Soal menjadi lebih mudah atau lebih sulit sesuai jawabanmu. Jika semuanya benar dan cepat, soal langsung melompat lebih tinggi. Jika belum tahu, tebak saja.',
          'Hasilnya menunjukkan kamu sebaiknya belajar materi kelas berapa dan keterampilan apa yang perlu dipelajari. Daftar itu muncul di tab <b>✨ Saran</b>.',
        ] },
        { icon: '🤔', t: 'Mau belajar apa?', steps: [
          '<b>📌 Dari guru</b>: tugas dari Bu/Pak Guru. Angka merah = tugas yang belum selesai.',
          '<b>🕘 Terakhir</b>: keterampilan yang terakhir kamu latih, supaya mudah dilanjutkan.',
          '<b>✨ Saran</b>: rekomendasi untukmu: mengulang yang masih sulit, melanjutkan, atau keterampilan baru.',
          '<b>📈 Bagaimana kemajuanku?</b> menunjukkan jumlah soal, waktu belajar, dan keterampilan yang berkembang minggu ini. Ketuk <b>Lihat laporanku</b> untuk laporan lengkap.',
        ] },
        { icon: '⭐', t: 'Memberi ulasan tugas', steps: [
          'Setelah tugas dari guru selesai (✅ Selesai), muncul pertanyaan <b>"Bagaimana tugas ini menurutmu?"</b>.',
          'Ketuk bintang (1 sampai 5), tulis pendapatmu jika mau, lalu ketuk <b>Kirim ulasan</b>.',
        ] },
        { icon: '🎮', t: 'Permainan dan bintang', steps: [
          'Ketuk <b>🎮 Permainan matematika</b> di beranda. Pilih kelasmu, lalu pilih permainan.',
          '<b>⚡ Kilat</b>: jawab sebanyak mungkin dalam 60 detik. <b>🎈 Balon</b>: ketuk balon yang sesuai perintah. <b>🃏 Pasangan</b>: cocokkan kartu soal dengan jawabannya.',
          '<b>🧱 Menara Pasangan</b>: ketuk kolom untuk menjatuhkan balok; dua balok bersentuhan yang jumlahnya sama dengan sasaran akan hilang. <b>🔢 Menara Kembar</b>: balok 2, 4, 8 … jatuh terus dan makin cepat. Geser ke balok yang sama (ketuk kolom atau ◀ ▶, lalu ▼ untuk menjatuhkan) agar menyatu menjadi dua kali lipat. Jika tumpukan masuk ke baris merah paling atas, permainan selesai!',
          '<b>🪢 Tarik Tambang</b> (permainan kelas, cocok untuk layar sentuh besar): Tim Merah di kiri dan Tim Biru di kanan menjawab soal bersamaan. Jawaban benar menarik tali ke arah tim itu; jawaban salah mengunci tombol tim itu sebentar. Tim yang menarik bendera sampai garisnya menang, atau yang unggul saat 90 detik habis.',
          'Latihan fakta (penjumlahan dan pengurangan sampai 20, perkalian, pembagian) datang berpola: satu angka dulu secara <b>🔢 urut</b> (6 × 1, 6 × 2, …), lalu <b>🔀 acak</b>, lalu <b>🧩 bentuk lain</b> seperti 6 × ? = 42 atau 6, 12, 18, ?. Setelah itu pindah ke angka berikutnya. Di SMP–SMA polanya sama untuk latihan prosedural: memfaktorkan, limit, turunan, integral, dan lainnya.',
          '<b>🏅 Olimpiade</b> (dari halaman Main): latihan soal non-rutin untuk SD, SMP, dan SMA, dibagi Aljabar, Teori Bilangan, Geometri, dan Kombinatorika, tingkat 1 sampai 3. Ada Petunjuk dan Pembahasan di setiap soal, serta Simulasi 15 soal 60 menit. Paling nyaman di tablet atau komputer karena kertas coretnya besar.',
          '<b>🗒️ Lembar Hafalan</b> (TK B sampai Kelas 4): pilih satu lembar, misalnya Kurang 4 atau Kali 6. Bagian A berurutan (6 × 1, 6 × 2, … baca sambil menulis), bagian B soal yang sama diacak, bagian C bentuk lain dari fakta yang sama (pola lompat, penjumlahan berulang, atau angka yang hilang). Tekan Periksa, perbaiki yang merah sampai semua benar. Bintang dari persen benar di pemeriksaan pertama.',
          '<b>🧗 Panjat Pinang</b> (permainan satu kelas di layar besar): soal tampil besar, anak-anak menjawab bersama, lalu satu anak maju mengetuk jawabannya. Benar naik satu tingkat, salah melorot satu tingkat. Tanpa batas waktu; kelas berusaha mengalahkan rekornya sendiri. Tombol ⛶ membuat permainan memenuhi layar.',
          '<b>💼 Profesi</b> (menu bawah): misi matematika dari pekerjaan dan kehidupan nyata, kini 12 bidang. Contohnya membagi anggaran usaha, patungan sewa lapangan bulu tangkis, mengatur uang keluarga, dan logika pemrograman. Anak mengikuti jalur langkah sampai bendera finis, dan grafiknya bergerak sesuai soal. Soal dosis hanya latihan berhitung, bukan panduan medis.',
          '<b>🧩 Sudoku</b>: isi kotak kosong supaya setiap baris, kolom, dan kotak tebal berisi semua angka tepat satu kali. TK memakai gambar buah (4 × 4), Kelas 1–2 angka 4 × 4, Kelas 3–6 6 × 6, SMP–SMA 9 × 9. Isian yang salah berwarna merah.',
          '<b>📊 Model Batang</b>: baca cerita, atur panjang batang dengan − dan + sampai sesuai cerita, lalu pilih jawabannya. <b>⚖️ Timbangan Seimbang</b>: ubah nilai □ atau x sampai kiri sama berat dengan kanan. <b>🗺️ Harta Karun Koordinat</b>: ketuk titik sesuai koordinat, atau baca koordinat harta karun.',
          '<b>🧱 Bangun Bilangan</b>: ketuk balok ribuan, ratusan, puluhan, dan satuan sampai menjadi bilangan sasaran. <b>🔺 Berburu Bangun</b>: ketuk semua bangun yang diminta; mulai Kelas 5 menjadi <b>Jaring-jaring Kubus</b>. <b>📏 Ukur dan Baca</b>: baca penggaris, gelas ukur, timbangan, termometer, atau busur. <b>Tebak Sudut</b> (SMP–SMA): makin dekat tebakanmu, makin banyak poinnya.',
          '<b>📈 Baca Grafik</b>: baca piktogram, diagram batang, garis, atau lingkaran, lalu jawab pertanyaannya. <b>🔁 Pola dan Barisan</b>: temukan aturannya, lalu isi bagian yang hilang. Semua permainan ini 10 soal dan tanpa batas waktu.',
          'Setiap ronde memberi sampai <b>3 bintang ⭐</b>. Bintangmu tersimpan dan terlihat oleh guru dan orang tua.',
        ] },
        { icon: '🎁', t: 'Papan hadiah', steps: [
          'Setiap kelas punya papan dengan 36 kotak. Di balik setiap kotak ada hadiah!',
          'Ketuk sebuah kotak untuk melihat tantangannya, misalnya "Jawab 50 soal" atau "Capai skor 80 di 3 keterampilan".',
          'Saat tantangan tercapai, kotaknya terbuka sendiri. Berapa banyak hadiah yang bisa kamu kumpulkan?',
        ] },
        { icon: '✏️', t: 'Menjawab soal', steps: [
          'Baca soalnya. Ketuk 🔊 jika ingin soal dibacakan.',
          'Ketuk jawaban yang benar, atau ketik angka dengan tombol angka, lalu ketuk <b>Jawab</b>.',
          'Benar? Hebat! 🎉 Soal berikutnya muncul sendiri.',
          'Belum tepat? Tidak apa-apa. Baca <b>Cara mengerjakan</b>, lalu ketuk <b>Lanjut</b>.',
        ] },
        { icon: '⭐', t: 'SmartScore', steps: [
          'Angka di atas adalah <b>SmartScore</b>-mu, dari 0 sampai 100.',
          'Skor <b>80</b>: kamu <b>Mahir</b> ⭐.',
          'Skor <b>100</b>: kamu <b>Tuntas</b> 🏆. Hebat sekali!',
        ] },
        { icon: '📖', t: 'Pelajaran', steps: [
          'Ketuk 📖 untuk membaca pelajaran bab itu.',
          'Ada langkah-langkah dan contoh soal. Ketuk <b>Lihat cara mengerjakan</b> untuk melihat jawabannya.',
          'Di atas pelajaran ada <b>🎬 Animasi</b> singkat yang berputar sendiri. Ketuk ⏸ untuk berhenti, ↻ untuk mengulang, atau titik-titik di bawahnya untuk memilih langkah.',
          'Jika jawabanmu belum tepat saat latihan, ketuk <b>🎬 Tonton animasi</b> di bagian Cara mengerjakan.',
        ] },
        { icon: '🎨', t: 'Avatar dan suara', steps: [
          'Ketuk avatarmu (ada ✏️) untuk memilih avatar baru: hewan, tumbuhan, bentuk, dan lainnya.',
          'Ketuk 🔔 di layar latihan untuk mematikan atau menyalakan suara.',
        ] },
      ],
    },
    faq: [
      ['Bagaimana mendapatkan akun Metiq?', 'Guru dan keluarga homeschooling: ketuk Saya Guru → Daftar gratis, akun langsung aktif. Sekolah dengan banyak kelas: buka halaman Harga dan isi formulir penawaran paket Sekolah.'],
      ['Apa beda paket Guru (gratis) dan Sekolah?', 'Guru mendapat semua latihan dan alat kelas secara gratis: kelas, tugas, dan dasbor kelas. Paket Sekolah menambah dasbor sekolah, admin sekolah yang mengelola guru, serta pelatihan.'],
      ['Bagaimana mencoba Metiq tanpa mendaftar?', 'Di beranda, ketuk Coba sebagai siswa, orang tua, atau guru (atau masukkan kode 1234 di halaman siswa atau orang tua), lalu tulis nama. Mode coba memakai data contoh satu sekolah di perangkat itu. Beberapa anak (kakak-adik) bisa mencoba di HP yang sama dengan namanya masing-masing, lalu orang tua di HP itu bisa melihat hasil semua anaknya di halaman Anak saya. Ketuk Keluar untuk kembali.'],
      ['Bagaimana memakai Metiq dengan murid sungguhan?', 'Guru mendaftar gratis (Saya Guru → Daftar guru baru), menambahkan murid di tab Siswa (dengan kode belajar atau nama), lalu membagikan kode kelas ke murid dan kode orang tua ke wali murid. Data kelas sungguhan tersimpan di server dan terhubung di HP mana pun.'],
      ['Lupa kode kelas atau kode orang tua?', 'Tanyakan kepada guru. Guru bisa melihat semua kode di tab Siswa.'],
      ['Apakah data hilang jika HP diganti?', 'Tidak. Data tersimpan di server. Cukup masuk lagi di HP lain.'],
      ['Bagaimana jika internet putus saat latihan?', 'Jawaban tetap tersimpan di HP dan akan terkirim otomatis saat internet tersambung lagi.'],
      ['Tampilan masih versi lama?', 'Tarik layar ke bawah untuk memuat ulang halaman.'],
      ['Bagaimana memasang Metiq seperti aplikasi?', 'Samsung Internet: ketuk ikon menu ☰ di pojok kanan bawah → Add page to (Tambahkan halaman ke) → Home screen (Layar utama) → Add. Chrome: ketuk ⋮ di pojok kanan atas → Tambahkan ke layar utama. iPhone: ketuk Bagikan ⬆ → Tambahkan ke Layar Utama. Ikon Metiq akan muncul di layar HP. Panduan bergambar ada di beranda Metiq (📲 Pasang Metiq di layar HP).'],
    ],
  };
})();
