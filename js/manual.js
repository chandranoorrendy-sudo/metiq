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
          'Buka tab <b>Kelola kelas</b>.',
          'Ketik nama siswa di kolom <b>Tambah siswa</b>. Untuk menambah banyak sekaligus, pisahkan dengan koma: <i>Alya, Bima, Citra</i>.',
          'Setiap siswa otomatis mendapat avatar dan <b>kode orang tua</b> (6 huruf/angka). Ketuk avatar siswa untuk menggantinya.',
          'Kelas punya <b>kode kelas</b> (5 huruf/angka) yang tampil di bagian atas dasbor.',
          'Ketuk <b>Cetak kartu kode</b> untuk mencetak kartu berisi kode kelas dan kode orang tua setiap siswa.',
          'Anda juga bisa mengganti nama kelas atau menambah kelas baru di bagian bawah halaman ini.',
        ] },
        { icon: '📲', t: 'Membagikan akses ke siswa dan orang tua', steps: [
          'Bagikan tautan Metiq yang sama kepada semua siswa dan orang tua.',
          '<b>Siswa:</b> Saya Siswa → masukkan kode kelas → ketuk namanya.',
          '<b>Orang tua:</b> Saya Orang Tua → masukkan kode orang tua anaknya, atau buat akun lalu tambahkan anak dengan kode tersebut.',
          'Kartu kode yang dicetak bisa dibagikan saat rapat orang tua atau difoto dan dikirim lewat WhatsApp.',
        ], tip: 'Kode orang tua bersifat pribadi. Berikan hanya kepada orang tua siswa yang bersangkutan.' },
        { icon: '📌', t: 'Memberi tugas', steps: [
          'Buka tab <b>Tugas</b>.',
          'Tulis catatan untuk siswa (misalnya "Latihan untuk ulangan Jumat") dan pilih tenggat jika perlu.',
          'Pilih <b>Untuk siapa?</b>: <b>Seluruh kelas</b>, atau <b>Siswa tertentu</b> lalu centang siswanya. Tugas khusus hanya terlihat oleh siswa itu dan orang tuanya.',
          'Centang keterampilan yang ingin ditugaskan, dari kelas mana pun, lalu ketuk <b>Simpan tugas</b>.',
          'Tugas muncul di bagian atas halaman belajar siswa, dan lonceng 🔔 orang tua akan menyala.',
          'Dari Ringkasan atau Analitik → Titik masalah, Anda juga bisa langsung menugaskan keterampilan yang sulit ke seluruh kelas dengan tombol <b>Tugaskan</b>.',
        ], tip: 'Untuk siswa yang tertinggal atau yang sudah sangat maju, buka tab Siswa → ketuk namanya → bagian <b>🎯 Tugas khusus</b>. Di sana ada saran <i>Perlu mengulang</i> dan <i>Materi lanjutan</i> dengan tombol Tugaskan.' },
        { icon: '🔔', t: 'Notifikasi tugas selesai', steps: [
          'Tugas dianggap selesai jika semua keterampilan di dalamnya mencapai tingkat <b>Mahir</b> (SmartScore 80 atau lebih), atau jika orang tua menekan <b>Laporkan sudah dikerjakan</b>.',
          'Saat itu lonceng 🔔 di kanan atas dasbor menunjukkan angka. Ketuk untuk melihat siapa yang sudah selesai.',
          'Tab <b>Tugas</b> juga menampilkan jumlah dan nama siswa yang sudah selesai.',
        ] },
        { icon: '📊', t: 'Memantau kemajuan', steps: [
          '<b>Ringkasan:</b> siswa yang perlu perhatian, keterampilan tersulit di kelas, pola kesalahan kelas, dan siswa paling rajin.',
          '<b>Siswa:</b> daftar siswa. Ketuk nama untuk laporan lengkap, semua keterampilan, dan 30 jawaban terakhir.',
          '<b>Analitik:</b> lima laporan dengan filter tanggal: Penggunaan, Titik masalah, Kisi skor, Log soal, dan Kemajuan.',
          '<b>Peta kemajuan:</b> warna rata-rata skor setiap siswa per bab. Pilih kelas 1–6 di atas tabel.',
          '<b>Keterampilan:</b> skor setiap siswa per keterampilan, tautan <i>Coba soal contoh</i>, dan Pelajaran setiap bab.',
        ], tip: 'Pola kesalahan (misalnya "tertukar tanda > dan <") dideteksi otomatis dari jawaban siswa, lengkap dengan saran latihannya.' },
        { icon: '📈', t: 'Memahami SmartScore', steps: [
          'Setiap keterampilan punya skor 0–100. Skor naik cepat di awal dan makin pelan mendekati 100; jawaban salah menurunkannya.',
          '<b>Mulai</b> 1–49 · <b>Berkembang</b> 50–79 · <b>Mahir</b> 80–99 · <b>Tuntas</b> 100 🏆.',
          'Siswa harus menjawab benar secara konsisten untuk tuntas, jadi skor tinggi menunjukkan pemahaman, bukan tebakan.',
        ] },
        { icon: '📚', t: 'Kurikulum, pelajaran, dan referensi', steps: [
          'Metiq memuat 92 bab dan 344 keterampilan untuk kelas 1–6, disusun dari IXL dan Singapore Math dan dipetakan ke Kurikulum Merdeka.',
          'Setiap bab punya <b>Pelajaran</b> berisi langkah, catatan Cara Singapura, dan contoh soal yang bisa diganti.',
          'Tab <b>Referensi</b> menjelaskan sumber kurikulum, metode Singapore Math, peta setiap bab, dan daftar pola kesalahan.',
        ] },
        { icon: '🛡️', t: 'Khusus admin', steps: [
          'Akun admin melihat dan mengelola <b>semua kelas</b> dari semua guru.',
          'Pilih kelas lewat kotak pilihan di bawah nama kelas; nama guru pemilik kelas ikut ditampilkan.',
        ] },
        { icon: '🧭', t: 'Asesmen awal siswa', steps: [
          'Setiap siswa mengerjakan asesmen awal sekali, saat pertama kali masuk: memilih umur, lalu 8–15 soal adaptif dari keterampilan kunci kelas 1–6.',
          'Hasilnya terlihat di tab <b>Siswa</b> → nama siswa → <b>🧭 Asesmen awal</b>: kelas tempat siswa sebaiknya belajar dan keterampilan yang perlu dipelajari.',
          'Waktu menjawab ikut dipakai: semua benar dan cepat → asesmen melompat 2 kelas; benar tapi lambat → ditandai 🐢 perlu kelancaran; salah dalam kurang dari 3 detik → ⚠️ mungkin menebak.',
          'Ketuk <b>↻ Ulangi asesmen</b> jika siswa perlu mengerjakannya lagi, misalnya setelah satu semester. Siswa akan diminta mengerjakan asesmen saat masuk berikutnya.',
        ] },
        { icon: '🪪', t: 'NISN dan BBO Digital', steps: [
          'Buka tab <b>Siswa</b> → ketuk nama siswa → bagian <b>🪪 Data siswa</b>, lalu isi <b>NISN</b> (10 angka) dan ketuk Simpan NISN.',
          'Setiap kali siswa dengan NISN menyelesaikan tugas, laporannya (tugas, keterampilan, dan SmartScore) otomatis dikirim ke <b>BBO Digital</b> untuk siswa tersebut.',
          'Status pengiriman terlihat di bagian yang sama: ✅ Diterima BBO, ⏳ Sedang dikirim, atau ⚠️ Gagal terkirim.',
          'Di bagian itu juga terlihat berapa kali orang tua membuka laporan anak.',
        ] },
        { icon: '🏫', t: 'Dasbor koordinator (admin)', steps: [
          'Tab <b>🏫 Sekolah</b> hanya muncul untuk admin/koordinator. Pilih periode di atas: 7, 30, 90 hari, atau tanggal tertentu.',
          '<b>Per kelas</b>: status setiap kelas (🟢 baik, 🟡 perlu dipantau, 🔴 perlu perhatian), siswa aktif, ketepatan, jumlah siswa yang belum paham, dan tugas selesai. Ketuk baris kelas untuk membuka kelas itu.',
          '<b>Materi sulit</b>: bab yang paling banyak belum dipahami di seluruh sekolah, lalu rincian keterampilan dan nama siswa di tiap kelas.',
          '<b>Per guru</b>: indikator kelas setiap guru, misalnya siswa aktif, pemahaman siswa, tugas yang diberikan, tugas khusus sebagai tindak lanjut, dan tugas terakhir. Gunakan sebagai bahan diskusi dan pendampingan guru.',
          '<b>⭐ Ulasan</b>: rata-rata bintang dan komentar dari siswa dan orang tua setelah menyelesaikan tugas, per kelas.',
          '<b>📥 Data penelitian</b>: unduh data (CSV) dengan nama yang disamarkan: ringkasan per siswa, semua jawaban, tugas & ulasan, dan keterlibatan orang tua. Kunci kode (rahasia) dipakai untuk mencocokkan dengan nilai tes.',
          'Semua guru cukup memakai Metiq di kelasnya masing-masing. Datanya otomatis masuk ke dasbor koordinator, jadi tidak perlu membuat laporan terpisah.',
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
          'Bagian atas berisi ringkasan: jumlah soal, ketepatan, dan waktu belajar 7 hari terakhir.',
          '<b>👍 Yang sudah bagus:</b> keterampilan yang sudah Mahir.',
          '<b>💪 Yang perlu ditingkatkan:</b> keterampilan yang masih sulit, pola kesalahannya, contoh soal yang salah, dan saran latihan di rumah. Ketuk <b>📖 Pelajarannya</b> untuk materi singkat yang bisa dibaca bersama anak.',
          '<b>Kemajuan per bab</b> dan <b>jawaban yang belum tepat</b> ada di bagian bawah.',
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
          '<b>🧱 Menara Pasangan</b>: ketuk kolom untuk menjatuhkan balok; dua balok bersentuhan yang jumlahnya sama dengan sasaran akan hilang. <b>🔢 Menara Kembar</b>: balok yang sama bergabung menjadi dua kali lipat. Jangan sampai semua kolom penuh!',
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
      ['Bagaimana mencoba Metiq tanpa mendaftar?', 'Di beranda, ketuk Coba sebagai siswa, orang tua, atau guru. Atau masukkan kode 1234 di halaman siswa atau orang tua. Mode coba memakai data contoh satu sekolah yang hanya tersimpan di perangkat itu dan tidak terkirim ke server. Ketuk Keluar untuk kembali.'],
      ['Lupa kode kelas atau kode orang tua?', 'Tanyakan kepada guru. Guru bisa melihat semua kode di menu Kelola kelas.'],
      ['Apakah data hilang jika HP diganti?', 'Tidak. Data tersimpan di server. Cukup masuk lagi di HP lain.'],
      ['Bagaimana jika internet putus saat latihan?', 'Jawaban tetap tersimpan di HP dan akan terkirim otomatis saat internet tersambung lagi.'],
      ['Tampilan masih versi lama?', 'Tarik layar ke bawah untuk memuat ulang halaman.'],
      ['Bagaimana memasang Metiq seperti aplikasi?', 'Buka menu browser (⋮), lalu pilih "Tambahkan ke layar utama". Ikon Metiq akan muncul di layar HP.'],
    ],
  };
})();
