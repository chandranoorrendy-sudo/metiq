/* Metiq — Profesi tambahan dengan masalah nyata: usaha, guru, programmer, olahraga, keuangan keluarga, dan kesehatan.
 * Format sama dengan js/jobs.js, ditambah done: grafik yang menggantikan vis setelah jawaban benar. Jawaban ditulis sebagai hitungan.
 */
(function () {
  const J = window.METIQ_JOBS, V = window.METIQ_JV, { rp, donut, bars, growth, jars, receipt, split, court, code, robot, seats, dose, chips } = V;
  Object.assign(J.INTERESTS, { usaha: '💼 Usaha', orang: '🤝 Membantu orang', olahraga: '🏸 Olahraga', keluarga: '🏠 Keluarga' });
  J.PROFESSIONS.push(
    { id: 'pengusaha', name: 'Pengusaha', people: '👩‍💼👨‍💼', art: '📈💰', color: '#2f6fed', interest: 'usaha', what: 'Pengusaha menjalankan usaha: menentukan harga, membagi anggaran untuk pemasaran, penjualan, karyawan, dan menjaga agar usahanya untung.', math: 'Persen, perbandingan, anggaran, untung rugi, dan titik impas.' },
    { id: 'guru', name: 'Guru', people: '👩‍🏫👨‍🏫', art: '📚✏️', color: '#8e5bd6', interest: 'orang', what: 'Guru merancang pelajaran, membagi kelompok, menghitung nilai, dan membaca data untuk tahu siapa yang perlu dibantu.', math: 'Pembagian, rata-rata, bobot nilai, dan statistika.' },
    { id: 'programmer', name: 'Programmer', people: '👩‍💻👨‍💻', art: '⌨️🤖', color: '#0f9d76', interest: 'teknologi', what: 'Programmer menulis perintah langkah demi langkah agar komputer menyelesaikan masalah.', math: 'Urutan, logika jika-maka, perulangan, bilangan biner, dan kecepatan algoritma.' },
    { id: 'olahraga', name: 'Pemain dan Pelatih', people: '🧑‍🦱🏃', art: '🏸🏆', color: '#e8590c', interest: 'olahraga', what: 'Pemain dan pelatih mengatur latihan, membagi biaya main bersama, dan membaca data pertandingan.', math: 'Pembagian adil, persen, peluang, dan kecepatan.' },
    { id: 'keluarga', name: 'Pengatur Uang Keluarga', people: '👨‍👩‍👧', art: '🏠🪙', color: '#d6336c', interest: 'keluarga', what: 'Setiap keluarga perlu mengatur uang: berapa untuk kebutuhan, ditabung, disedekahkan, dan dikembangkan.', math: 'Persen, anggaran, pertumbuhan berganda, dan zakat.' },
    { id: 'kesehatan', name: 'Perawat dan Dokter', people: '👩‍⚕️👨‍⚕️', art: '🩺💊', color: '#0b9aa8', interest: 'orang', what: 'Perawat dan dokter menghitung dosis obat, kecepatan infus, dan membaca hasil pemeriksaan.', math: 'Perbandingan, satuan, waktu paruh, dan peluang.' }
  );
  const MED = 'Ini latihan matematika. Dosis obat sungguhan selalu ditentukan oleh dokter atau apoteker.';
  const blk = (w, c) => `<span class="jblk" style="width:${w}px;background:${c}"></span>`;
  const row = (a) => chips(a);

  J.MISSIONS.push(
    /* ---------- Pengusaha ---------- */
    { id: 'biz-cake-stall', key: 'bizTK', profession: 'pengusaha', level: 'TK', audio: true, title: 'Menata dagangan kue', scenario: 'Bu Ani berjualan kue di pasar. Kue harus dikelompokkan supaya pembeli mudah memilih.', art: '👩‍🍳🧁', topics: ['bilangan'], units: ['TBH', 'TAA'],
      steps: [
        { type: 'drag', mode: 'sort', question: 'Kelompokkan kuenya.', bins: [{ id: 'a', label: '🍪' }, { id: 'b', label: '🧁' }], items: [{ id: '1', html: '🍪', bin: 'a' }, { id: '2', html: '🧁', bin: 'b' }, { id: '3', html: '🍪', bin: 'a' }, { id: '4', html: '🧁', bin: 'b' }], hint: 'Kue yang sama masuk ke kotak yang sama.', explanation: 'Kue bundar bersama, kue mangkuk bersama. Pembeli jadi mudah memilih.' },
        { type: 'choice', question: 'Ada berapa kue mangkuk?', vis: row(['🧁', '🧁', '🧁', '🧁']), options: ['3', '4', '5'], answer: '4', hint: 'Sentuh kuenya satu per satu sambil berhitung.', explanation: 'Satu, dua, tiga, empat. Ada empat kue.' },
      ], wrapUp: 'Hebat! Dagangan Bu Ani jadi rapi.', nextMath: ['Menghitung uang (SD 1–3)', 'Untung dan modal (SD 4–6)'] },
    { id: 'biz-ice-profit', key: 'biz13', profession: 'pengusaha', level: 'SD 1-3', title: 'Untung jualan es', scenario: 'Dina berjualan es jeruk di bazar sekolah. Satu gelas harganya Rp2.000. Hari ini terjual 12 gelas. Modal bahan Rp15.000.', art: '🧒🍹', topics: ['bilangan'], units: ['2G', '3P', '2D'],
      steps: [
        { type: 'number', question: 'Berapa uang hasil jualan Dina?', unit: 'rupiah', vis: receipt('Jualan hari ini', [['Es jeruk', '12 gelas'], ['Harga satu gelas', rp(2000)]]), answer: 12 * 2000, hint: 'Kalikan banyak gelas dengan harganya.', explanation: '12 × 2.000 = 24.000 rupiah.' },
        { type: 'number', question: 'Modal bahan Rp15.000. Berapa untung Dina?', unit: 'rupiah', vis: bars([['Hasil jualan', 24000, '#1fbf9f'], ['Modal', 15000, '#ff7a59']], { fmt: rp }), done: bars([['Hasil jualan', 24000, '#1fbf9f'], ['Modal', 15000, '#ff7a59'], ['Untung', 9000, '#f5a524']], { fmt: rp }), answer: 24000 - 15000, hint: 'Untung = hasil jualan − modal.', explanation: '24.000 − 15.000 = 9.000 rupiah.' },
        { type: 'number', question: 'Dina membeli buku Rp5.000 dari untungnya. Berapa sisa untungnya?', unit: 'rupiah', answer: 9000 - 5000, hint: 'Kurangkan harga buku dari untung.', explanation: '9.000 − 5.000 = 4.000 rupiah.' },
      ], wrapUp: 'Dina tahu bedanya uang hasil jualan dan untung.', nextMath: ['Persen anggaran (SD 4–6)', 'Titik impas (SMA)'] },
    { id: 'biz-shop-budget', key: 'biz46', profession: 'pengusaha', level: 'SD 4-6', title: 'Membagi anggaran toko', scenario: 'Toko Pak Rudi punya anggaran Rp2.000.000 setiap bulan. 50% untuk membeli barang, 20% untuk pemasaran, dan sisanya untuk gaji karyawan.', art: '👨‍💼🏪', topics: ['bilangan', 'data'], units: ['5J', '4P', '6N'],
      steps: [
        { type: 'number', question: 'Berapa rupiah untuk membeli barang?', unit: 'rupiah', vis: donut([['Barang', 50], ['Pemasaran', 20], ['Gaji', 30]], { c: 'Rp2 jt', c2: 'per bulan' }), answer: 2000000 * 50 / 100, hint: '50% sama dengan setengah.', explanation: '50% × 2.000.000 = 1.000.000 rupiah.' },
        { type: 'number', question: 'Berapa rupiah untuk pemasaran?', unit: 'rupiah', answer: 2000000 * 20 / 100, hint: '10% dari 2.000.000 adalah 200.000. Berapa 20%?', explanation: '20% × 2.000.000 = 400.000 rupiah.' },
        { type: 'number', question: 'Berapa rupiah sisa untuk gaji?', unit: 'rupiah', vis: bars([['Barang', 1000000], ['Pemasaran', 400000]], { fmt: rp, max: 2000000 }), done: bars([['Barang', 1000000], ['Pemasaran', 400000], ['Gaji', 600000]], { fmt: rp, max: 2000000 }), answer: 2000000 - 1000000 - 400000, hint: 'Kurangkan dua anggaran tadi dari Rp2.000.000.', explanation: '2.000.000 − 1.000.000 − 400.000 = 600.000 rupiah.' },
        { type: 'number', question: 'Gaji dibagi rata untuk 2 karyawan. Berapa gaji setiap orang?', unit: 'rupiah', vis: split(rp(600000), 2, '👩‍💼👨‍💼'), done: split(rp(600000), 2, '👩‍💼👨‍💼', rp(300000)), answer: 600000 / 2, hint: 'Bagi 600.000 dengan 2.', explanation: '600.000 : 2 = 300.000 rupiah.' },
      ], wrapUp: 'Setiap rupiah di toko Pak Rudi sekarang punya tugas.', nextMath: ['Perbandingan anggaran (SMP)', 'Titik impas (SMA)'] },
    { id: 'biz-department-budget', key: 'bizSMP', profession: 'pengusaha', level: 'SMP', title: 'Anggaran pemasaran, penjualan, dan SDM', scenario: 'Perusahaan kecil punya anggaran Rp60.000.000 per kuartal. Dibagi untuk Pemasaran : Penjualan : SDM : Operasional = 2 : 3 : 1 : 4.', art: '👩‍💼📊', topics: ['bilangan', 'data'], units: ['7D', '5I'],
      steps: [
        { type: 'number', question: 'Berapa rupiah nilai satu bagian?', unit: 'rupiah', vis: donut([['Pemasaran', 2], ['Penjualan', 3], ['SDM', 1], ['Operasional', 4]], { c: 'Rp60 jt', fmt: (v) => `${v} bagian` }), answer: 60000000 / (2 + 3 + 1 + 4), hint: 'Jumlahkan semua bagian, lalu bagi anggarannya.', explanation: '2 + 3 + 1 + 4 = 10 bagian. 60.000.000 : 10 = 6.000.000 rupiah.' },
        { type: 'number', question: 'Berapa anggaran Pemasaran?', unit: 'rupiah', answer: 2 * 6000000, hint: 'Pemasaran mendapat 2 bagian.', explanation: '2 × 6.000.000 = 12.000.000 rupiah.' },
        { type: 'number', question: 'Anggaran Pemasaran mendatangkan 300 pelanggan. Berapa biaya untuk mendapat satu pelanggan?', unit: 'rupiah', vis: bars([['Anggaran', 12000000, '#2f6fed']], { fmt: rp }), answer: 12000000 / 300, hint: 'Bagi anggaran dengan banyak pelanggan.', explanation: '12.000.000 : 300 = 40.000 rupiah per pelanggan.' },
        { type: 'number', question: 'Setiap pelanggan memberi untung kotor Rp55.000. Berapa sisa untung per pelanggan setelah biaya pemasaran?', unit: 'rupiah', answer: 55000 - 40000, hint: 'Kurangkan biaya mendapat pelanggan.', explanation: '55.000 − 40.000 = 15.000 rupiah.' },
        { type: 'choice', question: 'Pelanggan iklan A berbiaya Rp40.000 dan iklan B Rp70.000, dengan untung kotor sama Rp55.000. Mana yang sebaiknya ditambah?', options: ['Iklan A', 'Iklan B', 'Keduanya sama'], answer: 'Iklan A', hint: 'Iklan mana yang masih menyisakan untung?', explanation: 'Iklan A masih untung Rp15.000 per pelanggan, iklan B justru rugi Rp15.000.' },
      ], wrapUp: 'Kamu membagi anggaran dan menilai apakah pemasaran benar-benar menguntungkan.', nextMath: ['Titik impas dan fungsi linear (SMA)', 'Statistika bisnis'] },
    { id: 'biz-break-even', key: 'bizSMA', profession: 'pengusaha', level: 'SMA', title: 'Titik impas dan harga terbaik', scenario: 'Usaha kopi kemasan punya biaya tetap Rp12.000.000 per bulan. Biaya membuat satu kemasan Rp10.000, dan harga jualnya Rp25.000.', art: '🧑‍💼☕', topics: ['aljabar'], units: ['A1C', '8F'],
      steps: [
        { type: 'number', question: 'Berapa keuntungan dari satu kemasan (sebelum biaya tetap)?', unit: 'rupiah', vis: receipt('Satu kemasan', [['Harga jual', rp(25000)], ['Biaya buat', rp(10000)]]), answer: 25000 - 10000, hint: 'Harga jual − biaya membuat.', explanation: '25.000 − 10.000 = 15.000 rupiah.' },
        { type: 'number', question: 'Berapa kemasan harus terjual agar impas (laba nol)?', unit: 'kemasan', answer: 12000000 / 15000, hint: 'Biaya tetap dibagi keuntungan per kemasan.', explanation: '12.000.000 : 15.000 = 800 kemasan.' },
        { type: 'number', question: 'Agar laba Rp6.000.000, berapa kemasan harus terjual?', unit: 'kemasan', answer: (12000000 + 6000000) / 15000, hint: 'Tambahkan target laba ke biaya tetap.', explanation: '18.000.000 : 15.000 = 1.200 kemasan.' },
        { type: 'number', question: 'Dengan harga Rp25.000, terjual 1.500 kemasan. Berapa labanya?', unit: 'rupiah', answer: 1500 * 15000 - 12000000, hint: 'Banyak × keuntungan per kemasan − biaya tetap.', explanation: '1.500 × 15.000 − 12.000.000 = 10.500.000 rupiah.' },
        { type: 'number', question: 'Jika harga dinaikkan ke Rp28.000, penjualan turun menjadi 1.200 kemasan. Berapa labanya?', unit: 'rupiah', answer: 1200 * (28000 - 10000) - 12000000, hint: 'Keuntungan per kemasan menjadi 28.000 − 10.000.', explanation: '1.200 × 18.000 − 12.000.000 = 9.600.000 rupiah.' },
        { type: 'choice', question: 'Harga mana yang memberi laba lebih besar?', vis: bars([['Rp25.000', 10500000, '#1fbf9f'], ['Rp28.000', 9600000, '#ff7a59']], { fmt: rp }), options: ['Rp25.000', 'Rp28.000', 'Sama saja'], answer: 'Rp25.000', hint: 'Bandingkan dua laba tadi.', explanation: 'Laba Rp10.500.000 lebih besar. Harga lebih tinggi belum tentu lebih menguntungkan.' },
      ], wrapUp: 'Kamu memodelkan laba sebagai fungsi dan mengambil keputusan harga.', nextMath: ['Fungsi kuadrat untuk harga optimal', 'Kalkulus: optimasi'] },

    /* ---------- Guru ---------- */
    { id: 'edu-groups-tk', key: 'eduTK', profession: 'guru', level: 'TK', audio: true, title: 'Membagi kelompok', scenario: 'Bu Guru punya enam anak di kelas. Anak-anak akan bermain dalam dua kelompok yang sama banyak.', art: '👩‍🏫🧒', topics: ['bilangan'], units: ['TAD', 'TBF'],
      steps: [
        { type: 'choice', question: 'Ada enam anak dan dua kelompok. Berapa anak di setiap kelompok?', vis: seats(2, 3), options: ['2', '3', '4'], answer: '3', hint: 'Hitung anak di satu kelompok.', explanation: 'Setiap kelompok ada tiga anak.' },
        { type: 'choice', question: 'Ada tiga anak. Setiap anak butuh satu krayon. Berapa krayon yang diperlukan?', vis: row(['🧒', '🧒', '🧒']), options: ['2', '3', '4'], answer: '3', hint: 'Satu anak, satu krayon.', explanation: 'Tiga anak perlu tiga krayon.' },
      ], wrapUp: 'Terima kasih! Semua anak dapat kelompok dan krayon.', nextMath: ['Pembagian (SD 1–3)', 'Rata-rata (SD 4–6)'] },
    { id: 'edu-class-supplies', key: 'edu13', profession: 'guru', level: 'SD 1-3', title: 'Menyiapkan alat kelas', scenario: 'Di kelas ada 24 murid. Bu Lia membagi mereka menjadi kelompok berisi 4 anak. Setiap kelompok butuh 3 lembar kertas besar.', art: '👩‍🏫📄', topics: ['bilangan'], units: ['2H', '2G'],
      steps: [
        { type: 'number', question: 'Berapa banyak kelompok?', unit: 'kelompok', vis: seats(6, 4), answer: 24 / 4, hint: 'Bagi 24 dengan 4.', explanation: '24 : 4 = 6 kelompok.' },
        { type: 'number', question: 'Berapa lembar kertas yang dibutuhkan semua kelompok?', unit: 'lembar', answer: 6 * 3, hint: 'Ada 6 kelompok, masing-masing 3 lembar.', explanation: '6 × 3 = 18 lembar.' },
        { type: 'number', question: 'Di lemari ada 20 lembar. Berapa lembar yang tersisa?', unit: 'lembar', answer: 20 - 18, hint: 'Kurangkan yang dipakai.', explanation: '20 − 18 = 2 lembar.' },
      ], wrapUp: 'Kelas Bu Lia siap dan tidak ada yang kekurangan kertas.', nextMath: ['Rata-rata nilai (SD 4–6)', 'Bobot nilai (SMP)'] },
    { id: 'edu-average', key: 'edu46', profession: 'guru', level: 'SD 4-6', title: 'Menghitung rata-rata kelas', scenario: 'Pak Bayu memeriksa ulangan lima murid. Nilainya 70, 80, 90, 60, dan 100.', art: '👨‍🏫📝', topics: ['data'], units: ['5N', '4K'],
      steps: [
        { type: 'number', question: 'Berapa rata-rata nilainya?', vis: growth([['Ani', 70], ['Budi', 80], ['Citra', 90], ['Dedi', 60], ['Eka', 100]], { c: '#8e5bd6' }), answer: (70 + 80 + 90 + 60 + 100) / 5, hint: 'Jumlahkan semua nilai, lalu bagi 5.', explanation: '400 : 5 = 80.' },
        { type: 'number', question: 'Berapa selisih nilai tertinggi dan terendah?', answer: 100 - 60, hint: 'Tertinggi − terendah.', explanation: '100 − 60 = 40.' },
        { type: 'number', question: 'Ada murid keenam dengan nilai 86. Berapa rata-rata barunya?', answer: (400 + 86) / 6, hint: 'Jumlah lama 400 ditambah 86, lalu bagi 6.', explanation: '486 : 6 = 81.' },
        { type: 'choice', question: 'Siapa yang paling perlu dibantu Pak Bayu?', options: ['Dedi (60)', 'Citra (90)', 'Eka (100)'], answer: 'Dedi (60)', hint: 'Cari nilai yang jauh di bawah rata-rata.', explanation: 'Dedi 20 poin di bawah rata-rata. Data membantu guru tahu siapa yang perlu dibantu.' },
      ], wrapUp: 'Kamu memakai data untuk membantu murid.', nextMath: ['Bobot nilai (SMP)', 'Simpangan baku (SMA)'] },
    { id: 'edu-weighted-grade', key: 'eduSMP', profession: 'guru', level: 'SMP', title: 'Nilai rapor berbobot', scenario: 'Nilai rapor dihitung dari Tugas 20%, Ujian Tengah 30%, dan Ujian Akhir 50%. Siti mendapat Tugas 80, Ujian Tengah 70, Ujian Akhir 90.', art: '👩‍🏫📊', topics: ['bilangan', 'data'], units: ['7D', '7I'],
      steps: [
        { type: 'number', question: 'Berapa sumbangan nilai Tugas?', vis: donut([['Tugas', 20], ['Ujian Tengah', 30], ['Ujian Akhir', 50]], { c: '100%' }), answer: 80 * 20 / 100, hint: '20% dari 80.', explanation: '20% × 80 = 16.' },
        { type: 'number', question: 'Berapa sumbangan nilai Ujian Tengah?', answer: 70 * 30 / 100, hint: '30% dari 70.', explanation: '30% × 70 = 21.' },
        { type: 'number', question: 'Berapa nilai rapor Siti?', answer: 16 + 21 + 90 * 50 / 100, hint: 'Tambahkan 50% dari 90 ke hasil tadi.', explanation: '16 + 21 + 45 = 82.' },
        { type: 'number', question: 'Andi punya Tugas 90 dan Ujian Tengah 60. Ingin nilai rapor 75. Berapa nilai Ujian Akhir yang dibutuhkan?', answer: (75 - 18 - 18) / 0.5, hint: 'Tulis 18 + 18 + 0,5x = 75.', explanation: '0,5x = 39, jadi x = 78.' },
      ], wrapUp: 'Kamu tahu mengapa ujian berbobot besar lebih menentukan.', nextMath: ['Sebaran nilai (SMA)', 'Persamaan linear'] },
    { id: 'edu-spread', key: 'eduSMA', profession: 'guru', level: 'SMA', title: 'Membaca sebaran nilai', scenario: 'Guru menganalisis nilai lima murid: 60, 70, 80, 90, dan 100. Guru juga ingin membandingkan murid dari kelas yang berbeda secara adil.', art: '👨‍🏫📈', topics: ['data'], units: ['8I', '7I'],
      steps: [
        { type: 'number', question: 'Berapa rata-ratanya?', vis: growth([['A', 60], ['B', 70], ['C', 80], ['D', 90], ['E', 100]], { c: '#8e5bd6' }), answer: (60 + 70 + 80 + 90 + 100) / 5, hint: 'Jumlah dibagi 5.', explanation: '400 : 5 = 80.' },
        { type: 'number', question: 'Berapa variansnya (rata-rata kuadrat selisih dari rata-rata)?', answer: (400 + 100 + 0 + 100 + 400) / 5, hint: 'Selisihnya −20, −10, 0, 10, 20.', explanation: '(400 + 100 + 0 + 100 + 400) : 5 = 200.' },
        { type: 'number', question: 'Kelas A: rata-rata 70, simpangan baku 10. Budi mendapat 85. Berapa nilai z Budi?', answer: (85 - 70) / 10, hint: 'z = (nilai − rata-rata) : simpangan baku.', explanation: '(85 − 70) : 10 = 1,5.' },
        { type: 'number', question: 'Kelas B: rata-rata 80, simpangan baku 5. Cici mendapat 85. Berapa nilai z Cici?', answer: (85 - 80) / 5, hint: 'Pakai rumus yang sama.', explanation: '(85 − 80) : 5 = 1.' },
        { type: 'choice', question: 'Nilai mereka sama-sama 85. Siapa yang lebih unggul di kelasnya?', options: ['Budi', 'Cici', 'Sama'], answer: 'Budi', hint: 'Nilai z mana yang lebih besar?', explanation: 'Budi lebih jauh di atas rata-rata kelasnya. Nilai z membuat perbandingan lebih adil.' },
        { type: 'number', question: 'Rata-rata kelas naik dari 60 menjadi 72 setelah program belajar. Naik berapa persen?', unit: '%', vis: bars([['Sebelum', 60, '#ff7a59'], ['Sesudah', 72, '#1fbf9f']]), answer: (72 - 60) / 60 * 100, hint: 'Kenaikan dibagi nilai awal, kali 100%.', explanation: '12 : 60 × 100% = 20%.', tol: 0.001 },
      ], wrapUp: 'Kamu membaca data pendidikan seperti peneliti.', nextMath: ['Distribusi normal', 'Uji statistik'] },

    /* ---------- Programmer ---------- */
    { id: 'code-sequence-tk', key: 'codTK', profession: 'programmer', level: 'TK', audio: true, title: 'Perintah untuk robot', scenario: 'Robot hanya mengerti perintah yang berurutan. Ayo bantu robot mencuci tangan dan berjalan ke bintang.', art: '🤖⭐', topics: ['bilangan'], units: ['TAE', 'TAF'],
      steps: [
        { type: 'drag', mode: 'order', question: 'Urutkan cara mencuci tangan.', items: [{ id: 'k', html: '🧻' }, { id: 'a', html: '💧' }, { id: 's', html: '🧼' }], answer: ['a', 's', 'k'], hint: 'Basahi tangan, pakai sabun, lalu keringkan.', explanation: 'Air, sabun, lalu lap. Urutan yang benar membuat robot berhasil.' },
        { type: 'choice', question: 'Berapa langkah robot sampai ke bintang?', vis: robot(3), options: ['2', '3', '4'], answer: '3', hint: 'Hitung kotak sampai bintang.', explanation: 'Satu, dua, tiga. Tiga langkah.' },
      ], wrapUp: 'Hebat! Kamu baru saja memberi perintah kepada robot.', nextMath: ['Perulangan (SD 1–3)', 'Variabel (SD 4–6)'] },
    { id: 'code-loops', key: 'cod13', profession: 'programmer', level: 'SD 1-3', title: 'Perintah berulang', scenario: 'Programmer memakai perintah ulangi supaya tidak menulis hal yang sama berkali-kali.', art: '👩‍💻🔁', topics: ['bilangan'], units: ['2G', '2O'],
      steps: [
        { type: 'number', question: 'Berapa langkah robot berjalan?', unit: 'langkah', vis: code(['ulangi 4 kali:', '&nbsp;&nbsp;maju 2 langkah']), answer: 4 * 2, hint: '4 kali maju 2.', explanation: '4 × 2 = 8 langkah.' },
        { type: 'number', question: 'Berapa bintang yang tergambar?', unit: 'bintang', vis: code(['ulangi 3 kali:', '&nbsp;&nbsp;gambar ⭐⭐']), answer: 3 * 2, hint: 'Setiap putaran menggambar 2 bintang.', explanation: '3 × 2 = 6 bintang.' },
        { type: 'choice', question: 'Jika angka = 7, robot berbelok ke mana?', vis: code(['jika angka genap:', '&nbsp;&nbsp;belok kiri 👈', 'selain itu:', '&nbsp;&nbsp;belok kanan 👉'], [['angka', 7]]), options: ['👈 kiri', '👉 kanan'], answer: '👉 kanan', hint: 'Apakah 7 bilangan genap?', explanation: '7 ganjil, jadi bagian selain itu yang dijalankan: belok kanan.' },
      ], wrapUp: 'Kamu memahami perulangan dan keputusan, dua dasar pemrograman.', nextMath: ['Variabel (SD 4–6)', 'Logika dan biner (SMP)'] },
    { id: 'code-variables', key: 'cod46', profession: 'programmer', level: 'SD 4-6', title: 'Melacak variabel', scenario: 'Saat membuat gim, programmer menyimpan skor di dalam variabel. Ikuti programnya baris demi baris.', art: '👨‍💻🎮', topics: ['bilangan', 'aljabar'], units: ['5D', '4G'],
      steps: [
        { type: 'number', question: 'Berapa skor di akhir program?', vis: code(['skor = 0', 'ulangi 5 kali:', '&nbsp;&nbsp;skor = skor + 3']), answer: 5 * 3, hint: 'Setiap putaran skor bertambah 3.', explanation: 'Skor menjadi 3, 6, 9, 12, 15. Akhirnya 15.' },
        { type: 'number', question: 'Berapa nilai x di akhir program?', vis: code(['x = 2', 'ulangi 3 kali:', '&nbsp;&nbsp;x = x × 2']), answer: 2 * 2 * 2 * 2, hint: 'Ikuti: 2, lalu 4, lalu berapa?', explanation: 'x menjadi 4, 8, 16. Akhirnya 16.' },
        { type: 'number', question: 'Berapa total di akhir program?', vis: code(['total = 0', 'untuk i dari 1 sampai 4:', '&nbsp;&nbsp;total = total + i']), answer: 1 + 2 + 3 + 4, hint: 'Hitung 1 + 2 + 3 + 4.', explanation: 'Total menjadi 1, 3, 6, 10. Akhirnya 10.' },
        { type: 'choice', question: 'Apa yang ditampilkan program?', vis: code(['nilai = 70', 'jika nilai ≥ 75:', '&nbsp;&nbsp;tampilkan "Lulus"', 'selain itu:', '&nbsp;&nbsp;tampilkan "Coba lagi"'], [['nilai', 70]]), options: ['Lulus', 'Coba lagi'], answer: 'Coba lagi', hint: 'Apakah 70 lebih dari atau sama dengan 75?', explanation: '70 kurang dari 75, jadi yang tampil "Coba lagi".' },
      ], wrapUp: 'Kamu bisa membaca program seperti komputer.', nextMath: ['Logika dan biner (SMP)', 'Kecepatan algoritma (SMA)'] },
    { id: 'code-logic-binary', key: 'codSMP', profession: 'programmer', level: 'SMP', title: 'Logika dan bilangan biner', scenario: 'Komputer menyimpan data sebagai 0 dan 1, lalu mengambil keputusan dengan logika.', art: '👩‍💻💡', topics: ['bilangan'], units: ['6A', '7E'],
      steps: [
        { type: 'number', question: 'Berapa nilai bilangan biner 1011 dalam desimal?', vis: chips(['1×8', '0×4', '1×2', '1×1']), answer: 8 + 0 + 2 + 1, hint: 'Nilai tempatnya 8, 4, 2, 1.', explanation: '8 + 0 + 2 + 1 = 11.' },
        { type: 'number', question: 'Tulis 12 dalam bilangan biner (empat angka).', answer: 1100, hint: '12 = 8 + 4.', explanation: '12 = 8 + 4, jadi 1100.' },
        { type: 'choice', question: 'x = 12. Apa hasil logika ini?', vis: code(['(x > 3) DAN (x < 10)'], [['x', 12]]), options: ['Benar', 'Salah'], answer: 'Salah', hint: 'DAN hanya benar jika kedua syarat benar.', explanation: '12 > 3 benar, tetapi 12 < 10 salah. Jadi hasilnya salah.' },
        { type: 'number', question: 'Berapa kali "hitung" bertambah?', vis: code(['hitung = 0', 'untuk i dari 1 sampai 20:', '&nbsp;&nbsp;jika i habis dibagi 3:', '&nbsp;&nbsp;&nbsp;&nbsp;hitung = hitung + 1']), answer: Math.floor(20 / 3), hint: 'Kelipatan 3 sampai 20 ada berapa?', explanation: '3, 6, 9, 12, 15, 18. Ada 6 kali.' },
        { type: 'number', question: 'Berapa kali baris "cetak" dijalankan?', vis: code(['untuk i dari 1 sampai 3:', '&nbsp;&nbsp;untuk j dari 1 sampai 4:', '&nbsp;&nbsp;&nbsp;&nbsp;cetak(i, j)']), answer: 3 * 4, hint: 'Setiap i menjalankan seluruh j.', explanation: '3 × 4 = 12 kali.' },
      ], wrapUp: 'Kamu memahami cara komputer menghitung dan berpikir.', nextMath: ['Kompleksitas algoritma (SMA)', 'Logaritma'] },
    { id: 'code-algorithm-speed', key: 'codSMA', profession: 'programmer', level: 'SMA', title: 'Algoritma mana yang lebih cepat?', scenario: 'Aplikasi harus mencari satu nama dari daftar yang sudah urut. Programmer membandingkan banyak langkah setiap algoritma.', art: '👨‍💻⚡', topics: ['aljabar'], units: ['A2D', 'A2E'],
      steps: [
        { type: 'number', question: 'Pencarian satu per satu pada 1.024 nama. Paling banyak berapa langkah?', unit: 'langkah', answer: 1024, hint: 'Paling buruk, nama ada di urutan terakhir.', explanation: 'Paling banyak 1.024 langkah.' },
        { type: 'number', question: 'Pencarian biner membuang setengah daftar setiap langkah. Berapa langkah untuk 1.024 nama?', unit: 'langkah', vis: growth([['1 langkah', 512], ['2', 256], ['3', 128], ['4', 64], ['5', 32]], { c: '#0f9d76' }), answer: Math.log2(1024), hint: '2 pangkat berapa sama dengan 1.024?', explanation: '2¹⁰ = 1.024, jadi 10 langkah.' },
        { type: 'number', question: 'Algoritma n² dijalankan pada n = 1.000. Berapa operasi yang diperlukan?', unit: 'operasi', answer: 1000 * 1000, hint: 'Kuadratkan 1.000.', explanation: '1.000 × 1.000 = 1.000.000 operasi.' },
        { type: 'number', question: 'Program rekursif: f(1) = 1, f(2) = 1, f(n) = f(n − 1) + f(n − 2). Berapa f(6)?', vis: code(['fungsi f(n):', '&nbsp;&nbsp;jika n ≤ 2: kembalikan 1', '&nbsp;&nbsp;kembalikan f(n−1) + f(n−2)']), answer: 8, hint: 'Barisannya 1, 1, 2, 3, ...', explanation: '1, 1, 2, 3, 5, 8. Jadi f(6) = 8.' },
        { type: 'choice', question: 'Daftar berisi 1 juta nama yang sudah urut. Algoritma mana yang dipilih?', options: ['Pencarian biner', 'Satu per satu', 'Sama cepat'], answer: 'Pencarian biner', hint: 'Bandingkan sekitar 20 langkah dengan 1 juta langkah.', explanation: 'Pencarian biner hanya butuh sekitar 20 langkah karena 2²⁰ lebih dari 1 juta.' },
      ], wrapUp: 'Kamu memilih algoritma dengan matematika, bukan tebakan.', nextMath: ['Logaritma dan deret', 'Matematika diskret'] },

    /* ---------- Olahraga ---------- */
    { id: 'sport-balls-tk', key: 'spoTK', profession: 'olahraga', level: 'TK', audio: true, title: 'Merapikan bola', scenario: 'Pak Pelatih merapikan bola setelah latihan. Bola harus masuk ke keranjang yang sama jenisnya.', art: '🧑‍🦱⚽', topics: ['bilangan'], units: ['TBH', 'TAA'],
      steps: [
        { type: 'drag', mode: 'sort', question: 'Masukkan bola ke keranjangnya.', bins: [{ id: 'a', label: '⚽' }, { id: 'b', label: '🏀' }], items: [{ id: '1', html: '⚽', bin: 'a' }, { id: '2', html: '🏀', bin: 'b' }, { id: '3', html: '🏀', bin: 'b' }, { id: '4', html: '⚽', bin: 'a' }], hint: 'Bola yang sama masuk ke keranjang yang sama.', explanation: 'Semua bola sudah masuk ke keranjangnya.' },
        { type: 'choice', question: 'Tim merah mencetak berapa gol?', vis: row(['⚽', '⚽', '⚽']), options: ['2', '3', '4'], answer: '3', hint: 'Hitung bolanya.', explanation: 'Satu, dua, tiga. Tiga gol.' },
      ], wrapUp: 'Terima kasih! Lapangan sudah rapi.', nextMath: ['Skor dan selisih (SD 1–3)', 'Patungan (SD 4–6)'] },
    { id: 'sport-futsal-score', key: 'spo13', profession: 'olahraga', level: 'SD 1-3', title: 'Skor pertandingan futsal', scenario: 'Dua tim bermain futsal. Setiap tim punya 5 pemain. Tim Biru mencetak 4 gol dan Tim Merah 2 gol.', art: '🏃⚽', topics: ['bilangan'], units: ['2D', '2G'],
      steps: [
        { type: 'number', question: 'Berapa selisih golnya?', unit: 'gol', vis: bars([['Tim Biru', 4, '#2f6fed'], ['Tim Merah', 2, '#e0464b']]), answer: 4 - 2, hint: 'Kurangkan gol yang lebih sedikit.', explanation: '4 − 2 = 2 gol.' },
        { type: 'number', question: 'Berapa jumlah semua pemain?', unit: 'pemain', answer: 2 * 5, hint: 'Ada 2 tim, masing-masing 5 pemain.', explanation: '2 × 5 = 10 pemain.' },
        { type: 'number', question: 'Setiap pemain minum 2 botol air. Berapa botol yang harus disiapkan?', unit: 'botol', answer: 10 * 2, hint: '10 pemain, masing-masing 2 botol.', explanation: '10 × 2 = 20 botol.' },
      ], wrapUp: 'Pertandingan berjalan lancar karena perlengkapannya dihitung.', nextMath: ['Patungan (SD 4–6)', 'Persen (SMP)'] },
    { id: 'sport-badminton-split', key: 'spo46', profession: 'olahraga', level: 'SD 4-6', title: 'Patungan main bulu tangkis', scenario: 'Enam teman menyewa lapangan bulu tangkis selama 2 jam, Rp60.000 per jam. Mereka memakai 6 kok. Satu tabung isi 12 kok harganya Rp84.000.', art: '🧑‍🦱🏸', topics: ['bilangan'], units: ['4E', '4F', '4P'],
      steps: [
        { type: 'number', question: 'Berapa biaya sewa lapangan?', unit: 'rupiah', vis: court(), answer: 2 * 60000, hint: '2 jam, setiap jam Rp60.000.', explanation: '2 × 60.000 = 120.000 rupiah.' },
        { type: 'number', question: 'Berapa harga satu kok?', unit: 'rupiah', vis: receipt('Satu tabung kok', [['Isi', '12 kok'], ['Harga', rp(84000)]]), answer: 84000 / 12, hint: 'Bagi harga tabung dengan isinya.', explanation: '84.000 : 12 = 7.000 rupiah.' },
        { type: 'number', question: 'Berapa harga 6 kok yang dipakai?', unit: 'rupiah', answer: 6 * 7000, hint: '6 kali harga satu kok.', explanation: '6 × 7.000 = 42.000 rupiah.' },
        { type: 'number', question: 'Berapa biaya seluruhnya?', unit: 'rupiah', vis: receipt('Biaya main', [['Sewa lapangan', rp(120000)], ['6 kok', rp(42000)]]), done: receipt('Biaya main', [['Sewa lapangan', rp(120000)], ['6 kok', rp(42000)]], rp(162000)), answer: 120000 + 42000, hint: 'Tambahkan sewa lapangan dan harga kok.', explanation: '120.000 + 42.000 = 162.000 rupiah.' },
        { type: 'number', question: 'Biaya dibagi rata 6 orang. Berapa yang dibayar setiap orang?', unit: 'rupiah', vis: split(rp(162000), 6, '🧑🧑‍🦱👩👨👧🧔'), done: split(rp(162000), 6, '🧑🧑‍🦱👩👨👧🧔', rp(27000)), answer: 162000 / 6, hint: 'Bagi biaya seluruhnya dengan 6.', explanation: '162.000 : 6 = 27.000 rupiah per orang.' },
      ], wrapUp: 'Patungannya adil dan tidak ada yang rugi.', nextMath: ['Patungan menurut lama main (SMP)', 'Statistik pertandingan (SMA)'] },
    { id: 'sport-fair-split', key: 'spoSMP', profession: 'olahraga', level: 'SMP', title: 'Patungan adil menurut lama main', scenario: 'Andi, Budi, dan Citra bermain 2 jam. Dedi dan Eka hanya bermain 1 jam. Sewa lapangan Rp160.000. Biaya dibagi menurut lama bermain.', art: '🧑‍🦱🏸', topics: ['bilangan', 'aljabar'], units: ['7D', '5I'],
      steps: [
        { type: 'number', question: 'Berapa total jam main semua orang?', unit: 'jam', vis: bars([['Andi', 2], ['Budi', 2], ['Citra', 2], ['Dedi', 1], ['Eka', 1]], { max: 2 }), answer: 3 * 2 + 2 * 1, hint: 'Tiga orang 2 jam, dua orang 1 jam.', explanation: '3 × 2 + 2 × 1 = 8 jam.' },
        { type: 'number', question: 'Berapa biaya sewa untuk setiap satu jam main?', unit: 'rupiah', answer: 160000 / 8, hint: 'Sewa dibagi total jam main.', explanation: '160.000 : 8 = 20.000 rupiah.' },
        { type: 'number', question: 'Berapa sewa yang dibayar Andi?', unit: 'rupiah', answer: 2 * 20000, hint: 'Andi bermain 2 jam.', explanation: '2 × 20.000 = 40.000 rupiah.' },
        { type: 'number', question: 'Mereka memakai kok senilai Rp64.000 yang juga dibagi menurut lama main. Berapa bagian kok Dedi?', unit: 'rupiah', answer: 64000 / 8 * 1, hint: 'Hitung biaya kok per jam main dulu.', explanation: '64.000 : 8 = 8.000 rupiah untuk 1 jam main Dedi.' },
        { type: 'number', question: 'Berapa total yang dibayar Andi (sewa dan kok)?', unit: 'rupiah', answer: 40000 + 2 * 8000, hint: 'Kok Andi untuk 2 jam main.', explanation: '40.000 + 16.000 = 56.000 rupiah.' },
      ], wrapUp: 'Membagi menurut pemakaian sering lebih adil daripada membagi rata.', nextMath: ['Analisis pertandingan (SMA)', 'Sistem persamaan'] },
    { id: 'sport-analytics', key: 'spoSMA', profession: 'olahraga', level: 'SMA', title: 'Analisis pertandingan', scenario: 'Pelatih bulu tangkis memakai data untuk menyiapkan atlet: ketepatan smes, peluang, kecepatan, dan jadwal turnamen.', art: '🏃📊', topics: ['data', 'aljabar'], units: ['A1G', 'A2H', '8I'],
      steps: [
        { type: 'number', question: 'Dari 24 smes, 18 masuk. Berapa persen ketepatannya?', unit: '%', vis: court(), answer: 18 / 24 * 100, hint: 'Masuk dibagi semua, kali 100%.', explanation: '18 : 24 × 100% = 75%.' },
        { type: 'number', question: 'Peluang menang satu reli 0,6. Berapa peluang menang dua reli berturut-turut?', answer: 0.6 * 0.6, tol: 0.001, hint: 'Kejadian bebas: kalikan peluangnya.', explanation: '0,6 × 0,6 = 0,36.' },
        { type: 'number', question: 'Pelari menempuh 100 m dalam 12,5 detik. Berapa kecepatannya (m/detik)?', unit: 'm/detik', answer: 100 / 12.5, hint: 'Jarak dibagi waktu.', explanation: '100 : 12,5 = 8 m/detik.' },
        { type: 'number', question: 'Tinggi bola h(t) = −5t² + 10t + 2 meter. Berapa tinggi maksimumnya?', unit: 'meter', answer: -5 + 10 + 2, hint: 'Puncak ada di t = −b/(2a) = 1.', explanation: 'Pada t = 1: −5 + 10 + 2 = 7 meter.' },
        { type: 'number', question: 'Delapan tim saling bertanding satu kali. Berapa pertandingan semuanya?', unit: 'pertandingan', answer: 8 * 7 / 2, hint: 'Pilih 2 tim dari 8.', explanation: 'C(8, 2) = 8 × 7 : 2 = 28 pertandingan.' },
      ], wrapUp: 'Kamu memakai matematika seperti analis olahraga.', nextMath: ['Distribusi peluang', 'Kalkulus untuk gerak'] },

    /* ---------- Keuangan keluarga ---------- */
    { id: 'family-piggy-tk', key: 'kelTK', profession: 'keluarga', level: 'TK', audio: true, title: 'Celengan dan kebutuhan', scenario: 'Ayah mengajari Kakak menabung di celengan, dan membedakan barang yang dibutuhkan dengan yang diinginkan.', art: '👨‍👧🐖', topics: ['bilangan'], units: ['TBL', 'TBF'],
      steps: [
        { type: 'choice', question: 'Kakak punya tiga koin, lalu menabung dua koin lagi. Sekarang ada berapa koin?', vis: row(['🪙', '🪙', '🪙', '➕', '🪙', '🪙']), options: ['4', '5', '6'], answer: '5', hint: 'Hitung semua koinnya.', explanation: 'Tiga dan dua menjadi lima koin.' },
        { type: 'drag', mode: 'sort', question: 'Mana yang dibutuhkan dan mana yang diinginkan?', bins: [{ id: 'a', label: '🍚 Butuh' }, { id: 'b', label: '🧸 Ingin' }], items: [{ id: '1', html: '🍚', bin: 'a' }, { id: '2', html: '🧸', bin: 'b' }, { id: '3', html: '💧', bin: 'a' }, { id: '4', html: '🍭', bin: 'b' }], hint: 'Nasi dan air kita perlukan setiap hari.', explanation: 'Nasi dan air dibutuhkan. Boneka dan permen hanya diinginkan.' },
      ], wrapUp: 'Pintar! Kamu tahu mana yang harus didahulukan.', nextMath: ['Uang saku (SD 1–3)', 'Anggaran keluarga (SD 4–6)'] },
    { id: 'family-pocket-money', key: 'kel13', profession: 'keluarga', level: 'SD 1-3', title: 'Uang saku dan tabungan', scenario: 'Rani mendapat uang saku Rp5.000 setiap hari sekolah, 5 hari seminggu. Setiap hari ia menabung Rp2.000. Rani ingin membeli buku seharga Rp30.000.', art: '👧🐖', topics: ['bilangan'], units: ['3P', '2G', '2H'],
      steps: [
        { type: 'number', question: 'Berapa uang saku Rani seminggu?', unit: 'rupiah', answer: 5 * 5000, hint: '5 hari kali Rp5.000.', explanation: '5 × 5.000 = 25.000 rupiah.' },
        { type: 'number', question: 'Berapa tabungan Rani seminggu?', unit: 'rupiah', vis: jars([['Ditabung', 40, '#1fbf9f', '🐖'], ['Dipakai', 60, '#f5a524', '🍱']]), answer: 5 * 2000, hint: '5 hari kali Rp2.000.', explanation: '5 × 2.000 = 10.000 rupiah.' },
        { type: 'number', question: 'Berapa minggu Rani menabung untuk membeli buku?', unit: 'minggu', answer: 30000 / 10000, hint: 'Harga buku dibagi tabungan seminggu.', explanation: '30.000 : 10.000 = 3 minggu.' },
      ], wrapUp: 'Rani bisa membeli buku dari tabungannya sendiri.', nextMath: ['Anggaran persen (SD 4–6)', 'Tujuan menabung (SMP)'] },
    { id: 'family-monthly-budget', key: 'kel46', profession: 'keluarga', level: 'SD 4-6', title: 'Belanja, tabung, dan sedekah', scenario: 'Penghasilan keluarga Rp5.000.000 sebulan. 60% untuk kebutuhan, 20% ditabung, 10% untuk sedekah, dan sisanya untuk hiburan.', art: '👨‍👩‍👧🏠', topics: ['bilangan', 'data'], units: ['5J', '4P', '6N'],
      steps: [
        { type: 'number', question: 'Berapa rupiah untuk kebutuhan?', unit: 'rupiah', vis: jars([['Kebutuhan', 60, '#2f6fed', '🍚'], ['Tabungan', 20, '#1fbf9f', '🐖'], ['Sedekah', 10, '#f5a524', '🤲'], ['Hiburan', 10, '#e0464b', '🎈']]), answer: 5000000 * 60 / 100, hint: '10% dari 5.000.000 adalah 500.000.', explanation: '60% × 5.000.000 = 3.000.000 rupiah.' },
        { type: 'number', question: 'Berapa rupiah yang ditabung?', unit: 'rupiah', answer: 5000000 * 20 / 100, hint: '20% adalah dua kali 10%.', explanation: '20% × 5.000.000 = 1.000.000 rupiah.' },
        { type: 'number', question: 'Berapa rupiah untuk sedekah?', unit: 'rupiah', answer: 5000000 * 10 / 100, hint: 'Hitung 10%.', explanation: '10% × 5.000.000 = 500.000 rupiah.' },
        { type: 'number', question: 'Berapa sisa untuk hiburan?', unit: 'rupiah', answer: 5000000 - 3000000 - 1000000 - 500000, hint: 'Kurangkan tiga bagian tadi.', explanation: '5.000.000 − 3.000.000 − 1.000.000 − 500.000 = 500.000 rupiah.' },
        { type: 'number', question: 'Jika tabungan tetap, berapa tabungan setelah 6 bulan?', unit: 'rupiah', vis: growth([['1', 1], ['2', 2], ['3', 3], ['4', 4], ['5', 5], ['6', 6]], { c: '#1fbf9f', fmt: (v) => `${v} jt` }), answer: 6 * 1000000, hint: 'Rp1.000.000 setiap bulan.', explanation: '6 × 1.000.000 = 6.000.000 rupiah.' },
      ], wrapUp: 'Keluarga yang berencana lebih tenang menghadapi kebutuhan.', nextMath: ['Menabung untuk tujuan (SMP)', 'Pertumbuhan berganda (SMA)'] },
    { id: 'family-goals-zakat', key: 'kelSMP', profession: 'keluarga', level: 'SMP', title: 'Menabung, berkembang, dan zakat', scenario: 'Ayah berpenghasilan Rp8.000.000 sebulan. Keluarga menyisihkan 20% untuk tabungan. Keluarga juga ingin mengembangkan uang dengan cara yang halal.', art: '👨‍👩‍👦🪙', topics: ['bilangan'], units: ['7D', '6N', '6G'],
      steps: [
        { type: 'number', question: 'Berapa tabungan setiap bulan?', unit: 'rupiah', vis: donut([['Tabungan', 20, '#1fbf9f'], ['Lainnya', 80, '#c9d6d2']], { c: 'Rp8 jt' }), answer: 8000000 * 20 / 100, hint: '20% dari 8.000.000.', explanation: '20% × 8.000.000 = 1.600.000 rupiah.' },
        { type: 'number', question: 'Laptop sekolah harganya Rp9.600.000. Berapa bulan menabung?', unit: 'bulan', answer: 9600000 / 1600000, hint: 'Harga dibagi tabungan per bulan.', explanation: '9.600.000 : 1.600.000 = 6 bulan.' },
        { type: 'number', question: 'Tabungan emas Rp10.000.000 naik 8% dalam setahun. Berapa nilainya sekarang?', unit: 'rupiah', vis: growth([['Awal', 10000000], ['Setahun', 10800000]], { c: '#f5a524', fmt: rp }), answer: 10000000 * 1.08, tol: 1, hint: 'Kenaikan 8% dari 10.000.000, lalu tambahkan.', explanation: '10.000.000 + 800.000 = 10.800.000 rupiah.' },
        { type: 'number', question: 'Harta Rp100.000.000 sudah mencapai nisab dan haul. Berapa zakat 2,5%?', unit: 'rupiah', answer: 100000000 * 2.5 / 100, hint: '1% adalah 1.000.000.', explanation: '2,5% × 100.000.000 = 2.500.000 rupiah.' },
      ], wrapUp: 'Menabung, mengembangkan, dan berzakat semuanya memakai persen.', nextMath: ['Pertumbuhan berganda (SMA)', 'Barisan geometri'] },
    { id: 'family-compound', key: 'kelSMA', profession: 'keluarga', level: 'SMA', title: 'Pertumbuhan dan inflasi', scenario: 'Keluarga menanam modal Rp10.000.000 di usaha bagi hasil yang berkembang rata-rata 10% per tahun, dan hasilnya ditanam kembali.', art: '👩‍👦📈', topics: ['aljabar'], units: ['A1I', 'A2E'],
      simplified: 'Angka perkembangan dibuat tetap agar mudah dihitung. Usaha sungguhan bisa naik atau turun.',
      steps: [
        { type: 'number', question: 'Berapa nilainya setelah 2 tahun?', unit: 'rupiah', vis: growth([['Awal', 10000000], ['1 th', 11000000], ['2 th', 12100000], ['3 th', 13310000]], { c: '#d6336c', fmt: (v) => `${(v / 1e6).toFixed(1).replace('.', ',')} jt` }), answer: 10000000 * 1.1 * 1.1, tol: 1, hint: 'Kalikan 1,1 dua kali.', explanation: '10.000.000 × 1,1 × 1,1 = 12.100.000 rupiah.' },
        { type: 'number', question: 'Berapa nilainya setelah 3 tahun?', unit: 'rupiah', answer: 12100000 * 1.1, tol: 1, hint: 'Kalikan hasil tadi dengan 1,1.', explanation: '12.100.000 × 1,1 = 13.310.000 rupiah.' },
        { type: 'number', question: 'Aturan 72: jika tumbuh 8% per tahun, kira-kira berapa tahun uang menjadi dua kali lipat?', unit: 'tahun', answer: 72 / 8, hint: '72 dibagi persen pertumbuhan.', explanation: '72 : 8 = 9 tahun.' },
        { type: 'number', question: 'Inflasi 5%. Harga barang Rp100.000 tahun depan menjadi berapa?', unit: 'rupiah', answer: 100000 * 1.05, tol: 1, hint: 'Kalikan 1,05.', explanation: '100.000 × 1,05 = 105.000 rupiah.' },
        { type: 'number', question: 'Setiap awal tahun selama 3 tahun disetor Rp1.000.000 dengan pertumbuhan 10%. Berapa nilainya di akhir tahun ke-3?', unit: 'rupiah', answer: 1000000 * (1.1 + 1.21 + 1.331), tol: 1, hint: 'Setoran pertama tumbuh 3 kali, kedua 2 kali, ketiga 1 kali.', explanation: '1.331.000 + 1.210.000 + 1.100.000 = 3.641.000 rupiah.' },
      ], wrapUp: 'Kamu melihat kekuatan waktu dalam mengembangkan uang.', nextMath: ['Deret geometri', 'Logaritma untuk menghitung waktu'] },

    /* ---------- Kesehatan ---------- */
    { id: 'health-bandage-tk', key: 'medTK', profession: 'kesehatan', level: 'TK', audio: true, title: 'Membantu perawat', scenario: 'Bu Perawat merapikan perban dari yang paling panjang sampai yang paling pendek, lalu menyiapkan selimut untuk pasien.', art: '👩‍⚕️🩹', topics: ['ukur'], units: ['TAH', 'TAA'],
      steps: [
        { type: 'drag', mode: 'order', question: 'Urutkan dari yang paling panjang ke yang paling pendek.', items: [{ id: 'k', html: blk(30, '#ff7a59') }, { id: 'b', html: blk(66, '#4d96ff') }, { id: 's', html: blk(46, '#1fbf9f') }], answer: ['b', 's', 'k'], hint: 'Cari yang paling panjang dulu.', explanation: 'Panjang, sedang, lalu pendek. Rapi sekali.' },
        { type: 'choice', question: 'Ada tiga pasien. Setiap pasien butuh satu selimut. Berapa selimut yang diperlukan?', vis: row(['🛏️', '🛏️', '🛏️']), options: ['2', '3', '4'], answer: '3', hint: 'Satu pasien, satu selimut.', explanation: 'Tiga pasien perlu tiga selimut.' },
      ], wrapUp: 'Terima kasih sudah membantu Bu Perawat!', nextMath: ['Menghitung obat (SD 1–3)', 'Satuan mililiter (SD 4–6)'] },
    { id: 'health-tablets', key: 'med13', profession: 'kesehatan', level: 'SD 1-3', title: 'Menghitung obat', scenario: 'Pasien minum 3 tablet sehari selama 5 hari. Satu strip obat berisi 10 tablet.', art: '👨‍⚕️💊', topics: ['bilangan'], units: ['2G', '2H'], simplified: MED,
      steps: [
        { type: 'number', question: 'Berapa tablet yang dibutuhkan?', unit: 'tablet', vis: chips(['💊💊💊', '💊💊💊', '💊💊💊', '💊💊💊', '💊💊💊']), answer: 3 * 5, hint: '3 tablet setiap hari, 5 hari.', explanation: '3 × 5 = 15 tablet.' },
        { type: 'number', question: 'Berapa strip yang harus disiapkan?', unit: 'strip', answer: Math.ceil(15 / 10), hint: 'Satu strip tidak cukup untuk 15 tablet.', explanation: 'Perlu 2 strip karena satu strip hanya 10 tablet.' },
        { type: 'number', question: 'Berapa tablet yang tersisa?', unit: 'tablet', answer: 20 - 15, hint: 'Dua strip berisi 20 tablet.', explanation: '20 − 15 = 5 tablet.' },
      ], wrapUp: 'Obat tersedia pas untuk seluruh hari pengobatan.', nextMath: ['Mililiter (SD 4–6)', 'Dosis menurut berat badan (SMP)'] },
    { id: 'health-syrup', key: 'med46', profession: 'kesehatan', level: 'SD 4-6', title: 'Sirup dan suhu badan', scenario: 'Anak diberi sirup 5 ml, 3 kali sehari, selama 4 hari. Botolnya berisi 100 ml. Perawat juga mencatat suhu badan.', art: '👩‍⚕️🌡️', topics: ['ukur', 'data'], units: ['4F', '5N'], simplified: MED,
      steps: [
        { type: 'number', question: 'Berapa ml sirup diminum dalam sehari?', unit: 'ml', vis: dose(5, 20, 'ml', 'sekali minum'), done: dose(15, 20, 'ml', 'sehari'), answer: 5 * 3, hint: '5 ml, 3 kali.', explanation: '5 × 3 = 15 ml.' },
        { type: 'number', question: 'Berapa ml untuk 4 hari?', unit: 'ml', answer: 15 * 4, hint: '15 ml setiap hari.', explanation: '15 × 4 = 60 ml.' },
        { type: 'number', question: 'Berapa ml sirup tersisa di botol?', unit: 'ml', answer: 100 - 60, hint: 'Isi botol dikurangi yang diminum.', explanation: '100 − 60 = 40 ml.' },
        { type: 'number', question: 'Suhu badan pagi 37, siang 38, malam 39 derajat. Berapa rata-ratanya?', unit: '°C', vis: growth([['Pagi', 37], ['Siang', 38], ['Malam', 39]], { c: '#0b9aa8' }), answer: (37 + 38 + 39) / 3, hint: 'Jumlahkan, lalu bagi 3.', explanation: '114 : 3 = 38 derajat.' },
      ], wrapUp: 'Perawat menghitung dengan teliti untuk menjaga pasien.', nextMath: ['Dosis menurut berat badan (SMP)', 'Waktu paruh (SMA)'] },
    { id: 'health-dosage-infusion', key: 'medSMP', profession: 'kesehatan', level: 'SMP', title: 'Dosis dan infus', scenario: 'Anak dengan berat 24 kg memerlukan obat 10 mg per kg berat badan. Sirup obat berisi 120 mg setiap 5 ml.', art: '👨‍⚕️💉', topics: ['bilangan', 'ukur'], units: ['7D', '6F'], simplified: MED,
      steps: [
        { type: 'number', question: 'Berapa mg obat yang diperlukan?', unit: 'mg', answer: 24 * 10, hint: 'Berat badan kali 10 mg.', explanation: '24 × 10 = 240 mg.' },
        { type: 'number', question: 'Berapa ml sirup yang diberikan?', unit: 'ml', vis: dose(10, 20, 'ml'), answer: 240 / 120 * 5, hint: '240 mg itu berapa kali 120 mg?', explanation: '240 : 120 × 5 = 10 ml.' },
        { type: 'number', question: 'Infus 500 ml diberikan dalam 5 jam. Berapa ml per jam?', unit: 'ml/jam', answer: 500 / 5, hint: 'Volume dibagi waktu.', explanation: '500 : 5 = 100 ml/jam.' },
        { type: 'number', question: 'Berapa indeks massa tubuh orang dengan berat 60 kg dan tinggi 1,6 m? (1 desimal)', answer: 60 / (1.6 * 1.6), tol: 0.05, hint: 'Berat dibagi tinggi kuadrat.', explanation: '60 : 2,56 ≈ 23,4.' },
      ], wrapUp: 'Perbandingan yang tepat menjaga keselamatan pasien.', nextMath: ['Waktu paruh (SMA)', 'Peluang tes medis (SMA)'] },
    { id: 'health-halflife-test', key: 'medSMA', profession: 'kesehatan', level: 'SMA', title: 'Waktu paruh dan hasil tes', scenario: 'Obat 400 mg di dalam tubuh berkurang setengahnya setiap 6 jam. Rumah sakit juga menilai seberapa bisa dipercaya sebuah tes.', art: '👩‍⚕️🧪', topics: ['aljabar', 'data'], units: ['A1I', '8I'], simplified: MED,
      steps: [
        { type: 'number', question: 'Berapa mg obat tersisa setelah 12 jam?', unit: 'mg', vis: growth([['0 j', 400], ['6 j', 200], ['12 j', 100], ['18 j', 50], ['24 j', 25]], { c: '#0b9aa8' }), answer: 400 / 2 / 2, hint: '12 jam berarti dua kali waktu paruh.', explanation: '400 → 200 → 100 mg.' },
        { type: 'number', question: 'Berapa mg setelah 24 jam?', unit: 'mg', answer: 400 / 2 ** 4, hint: '24 jam berarti 4 kali waktu paruh.', explanation: '400 : 2⁴ = 25 mg.' },
        { type: 'number', question: 'Dari 1.000 orang, 1% sakit. Berapa orang yang sakit?', unit: 'orang', answer: 1000 * 1 / 100, hint: '1% dari 1.000.', explanation: '1% × 1.000 = 10 orang.' },
        { type: 'number', question: 'Tes mendeteksi 90% orang sakit. Berapa orang sakit yang hasilnya positif?', unit: 'orang', answer: 10 * 90 / 100, hint: '90% dari 10.', explanation: '90% × 10 = 9 orang.' },
        { type: 'number', question: 'Tes salah positif pada 10% orang sehat. Berapa orang sehat yang hasilnya positif?', unit: 'orang', answer: 990 * 10 / 100, hint: 'Orang sehat ada 990.', explanation: '10% × 990 = 99 orang.' },
        { type: 'number', question: 'Berapa persen orang berhasil positif yang benar-benar sakit? (1 desimal)', unit: '%', vis: bars([['Benar sakit', 9, '#e0464b'], ['Sebenarnya sehat', 99, '#0b9aa8']]), answer: 9 / 108 * 100, tol: 0.06, hint: 'Sakit dan positif, dibagi semua yang positif.', explanation: '9 : 108 × 100% ≈ 8,3%. Karena itu dokter sering meminta tes kedua.' },
      ], wrapUp: 'Kamu mengerti mengapa hasil tes perlu dibaca dengan peluang.', nextMath: ['Fungsi eksponen', 'Peluang bersyarat'] }
  );
})();
