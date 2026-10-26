/* Metiq — Pelajaran kelas 1–3.
 * Setiap bab: pengantar singkat dan beberapa subbab. Setiap subbab berisi langkah bernomor
 * dan satu keterampilan contoh; contoh soalnya dibuat dari pembuat soal latihan yang sama.
 */
(function () {
  const L = (window.METIQ_LESSONS = window.METIQ_LESSONS || {});
  // Elemen ke-4 (opsional) adalah catatan metode Singapore Math untuk subbab itu
  const add = (id, intro, parts) => { L[id] = { intro, parts: parts.map(([t, steps, ex, sg]) => ({ t, steps, ex, sg })) }; };

  /* ---------- Kelas 1 ---------- */
  add('A', 'Membilang berarti menghitung banyak benda satu per satu. Bilangan terakhir yang kamu sebut adalah banyaknya benda.', [
    ['Membilang benda', ['Tunjuk benda pertama dan sebut "satu".', 'Geser atau tandai benda yang sudah dihitung agar tidak terhitung dua kali.', 'Lanjutkan sampai benda terakhir.', 'Bilangan terakhir yang kamu sebut adalah jawabannya.'], 'A1'],
    ['Bingkai sepuluh', ['Bingkai sepuluh punya 2 baris, setiap baris 5 kotak.', 'Jika baris atas penuh, mulai dari 5.', 'Hitung lanjut titik di baris bawah: 6, 7, 8, …'], 'A2'],
    ['Membandingkan bilangan', ['Bilangan yang disebut lebih akhir saat membilang adalah yang lebih besar.', 'Tanda <b>&gt;</b> berarti "lebih besar dari", <b>&lt;</b> berarti "lebih kecil dari", <b>=</b> berarti "sama dengan".', 'Bayangkan mulut buaya 🐊: mulutnya selalu membuka ke bilangan yang lebih besar.'], 'A5'],
    ['Bilangan urutan', ['Mulai menghitung dari titik awal (misalnya bendera 🏁).', 'Benda pertama adalah ke-1, berikutnya ke-2, dan seterusnya.'], 'A6'],
  ]);
  add('B', 'Pasangan bilangan menunjukkan bahwa satu bilangan bisa dipecah menjadi dua bagian. Ini kunci untuk menjumlah dan mengurangi.', [
    ['Keseluruhan dan bagian', ['Lingkaran atas adalah <b>keseluruhan</b>, dua lingkaran bawah adalah <b>bagian</b>.', 'Bagian + bagian = keseluruhan.', 'Jika satu bagian hilang, hitung keseluruhan dikurangi bagian yang diketahui.'], 'B1', 'Pasangan bilangan (number bond) dipakai di semua kelas Singapore Math. Latih dengan benda nyata dulu (konkret), lalu gambar lingkaran (piktorial), baru angka (abstrak).'],
    ['Membuat 10', ['Hitung titik pada bingkai sepuluh.', 'Hitung kotak yang masih kosong: itulah bilangan yang dibutuhkan untuk membuat 10.', 'Hafalkan pasangan 10: 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5.'], 'B2', 'Pasangan 10 adalah dasar strategi "membuat 10" untuk menjumlah dan mengurangi sampai 20.'],
  ]);
  add('C', 'Menjumlah berarti menggabungkan dua kelompok lalu menghitung semuanya.', [
    ['Menggabungkan dua kelompok', ['Hitung kelompok pertama.', 'Lanjutkan menghitung benda di kelompok kedua.', 'Bilangan terakhir adalah hasil penjumlahan.'], 'C1'],
    ['Menghitung maju', ['Mulai dari bilangan yang lebih besar.', 'Lompat ke kanan sebanyak bilangan yang lain.', 'Angka tempat kamu berhenti adalah jawabannya.'], 'C2'],
    ['Soal cerita penjumlahan', ['Baca soalnya pelan-pelan.', 'Cari kata kunci: "lagi", "semuanya", "digabung", "ditambah".', 'Tulis kalimat matematikanya, lalu hitung.'], 'C4'],
  ]);
  add('D', 'Mengurangi berarti mengambil sebagian dari sekumpulan benda, lalu menghitung sisanya.', [
    ['Mencoret yang diambil', ['Mulai dari semua benda.', 'Coret sebanyak yang diambil.', 'Hitung benda yang tidak dicoret: itulah sisanya.'], 'D1'],
    ['Menghitung mundur', ['Mulai dari bilangan pertama pada garis bilangan.', 'Lompat ke kiri sebanyak bilangan yang dikurangkan.', 'Angka tempat kamu berhenti adalah jawabannya.'], 'D2'],
    ['Keluarga bilangan', ['Tiga bilangan seperti 3, 5, 8 membentuk satu keluarga.', 'Ada dua penjumlahan: 3 + 5 = 8 dan 5 + 3 = 8.', 'Ada dua pengurangan: 8 − 3 = 5 dan 8 − 5 = 3.'], 'D5'],
    ['Soal cerita pengurangan', ['Cari kata kunci: "sisa", "pergi", "dimakan", "diberikan", "meletus".', 'Mulai dari banyak benda awal, lalu kurangi.'], 'D4'],
  ]);
  add('E', 'Bilangan 11 sampai 20 terdiri dari satu puluhan (10) dan beberapa satuan.', [
    ['Sepuluh dan satuan', ['Satu batang = 10 kubus.', 'Hitung kubus lepas (satuan).', 'Gabungkan: 10 + satuan. Misalnya 10 + 3 = 13.'], 'E1'],
    ['Pola bilangan', ['Lihat dua bilangan yang berdampingan.', 'Cari selisihnya: bertambah atau berkurang berapa?', 'Gunakan aturan yang sama untuk mengisi bilangan yang hilang.'], 'E3'],
  ]);
  add('F', 'Untuk menjumlah dan mengurangi sampai 20, gunakan strategi: dobel, membuat 10, dan model batang.', [
    ['Dobel dan hampir dobel', ['Dobel artinya bilangan yang sama dijumlah: 6 + 6 = 12.', 'Hampir dobel: 6 + 7 = 6 + 6 + 1 = 13.'], 'F1'],
    ['Membuat 10 untuk menjumlah', ['Pilih bilangan yang dekat dengan 10, misalnya 8 pada 8 + 5.', '8 butuh 2 untuk menjadi 10. Pecah 5 menjadi 2 dan 3.', '8 + 2 = 10, lalu 10 + 3 = 13.'], 'F2', 'Strategi "make 10": pecah bilangan kedua dengan pasangan bilangan agar bilangan pertama genap 10.'],
    ['Mengurangi dengan bantuan 10', ['Pecah bilangan pertama: 14 = 10 + 4.', 'Kurangi dari 10 dulu: 10 − 6 = 4.', 'Tambahkan sisa satuan: 4 + 4 = 8.'], 'F4', 'Strategi "subtract from 10": pecah bilangan pertama menjadi 10 dan sisanya, lalu kurangi dari 10.'],
    ['Model batang', ['Batang panjang adalah keseluruhan, potongannya adalah bagian.', 'Jika keseluruhan ditanya: jumlahkan bagian-bagiannya.', 'Jika satu bagian ditanya: keseluruhan dikurangi bagian yang diketahui.', 'Untuk membandingkan: selisih = yang besar − yang kecil.'], 'F6', 'Model batang (bar model) adalah ciri utama Singapore Math untuk soal cerita, dari kelas 1 sampai kelas 6.'],
  ]);
  add('G', 'Bilangan sampai 100 dibentuk dari puluhan dan satuan.', [
    ['Puluhan dan satuan', ['Hitung batang puluhan: setiap batang bernilai 10.', 'Hitung kubus satuan.', 'Tulis angka puluhan di depan, satuan di belakang.'], 'G1'],
    ['Nilai tempat', ['Pada 47, angka 4 ada di tempat puluhan, nilainya 40.', 'Angka 7 ada di tempat satuan, nilainya 7.'], 'G2'],
    ['Membandingkan bilangan', ['Bandingkan angka puluhan dulu.', 'Jika puluhannya sama, bandingkan satuannya.'], 'G3'],
    ['Tabel ratusan', ['Ke kanan bertambah 1, ke kiri berkurang 1.', 'Ke bawah bertambah 10, ke atas berkurang 10.'], 'G5'],
  ]);
  add('H', 'Menjumlah dan mengurangi bilangan dua angka dilakukan per tempat: satuan dengan satuan, puluhan dengan puluhan.', [
    ['Menjumlah dan mengurangi puluhan', ['30 + 20 sama dengan 3 puluh + 2 puluh = 5 puluh.', 'Jadi 30 + 20 = 50.'], 'H1'],
    ['Bersusun tanpa menyimpan', ['Tulis satuan di bawah satuan, puluhan di bawah puluhan.', 'Hitung satuan lebih dulu.', 'Lalu hitung puluhan.'], 'H3'],
    ['Menyimpan', ['Jumlahkan satuan. Jika hasilnya 10 atau lebih, tulis angka satuannya saja.', 'Simpan 1 di kolom puluhan.', 'Jumlahkan puluhan termasuk simpanan 1.'], 'H4'],
  ]);
  add('I', 'Perkalian adalah menjumlah kelompok yang sama banyak. Pembagian adalah berbagi sama rata.', [
    ['Kelompok sama banyak', ['Hitung banyak kelompok.', 'Hitung isi satu kelompok.', 'Jumlahkan isinya berulang: 3 kelompok berisi 4 → 4 + 4 + 4 = 12.'], 'I1', 'Singapore Math memperkenalkan perkalian sebagai "kelompok sama banyak" sebelum menghafal tabel.'],
    ['Berbagi sama rata', ['Bagikan benda satu per satu ke setiap anak.', 'Ulangi sampai benda habis.', 'Hitung benda yang diterima satu anak.'], 'I3'],
  ]);
  add('J', 'Mengukur berarti membandingkan panjang atau berat benda.', [
    ['Membandingkan panjang', ['Pastikan semua benda mulai dari garis yang sama.', 'Lihat ujung yang paling jauh: itulah yang paling panjang.'], 'J1'],
    ['Mengukur dengan penggaris', ['Letakkan ujung benda di angka 0.', 'Baca angka di ujung lainnya.', 'Jika tidak mulai dari 0, kurangkan angka akhir dengan angka awal.'], 'J3'],
    ['Berat dan ringan', ['Pada timbangan, sisi yang turun lebih berat.', 'Sisi yang naik lebih ringan.'], 'J4'],
  ]);
  add('K', 'Jam punya dua jarum: jarum pendek menunjuk jam, jarum panjang menunjuk menit.', [
    ['Jam tepat', ['Lihat jarum panjang: jika di angka 12, waktunya tepat.', 'Lihat jarum pendek: angka yang ditunjuk adalah jamnya.', 'Contoh: jarum pendek di 3, jarum panjang di 12 → pukul 3.00.'], 'K1'],
    ['Setengah jam', ['Jarum panjang di angka 6 berarti 30 menit.', 'Jarum pendek ada di antara dua angka; pakai angka yang lebih kecil.', 'Pukul 6.30 disebut juga "setengah tujuh", karena setengah jalan menuju pukul 7.'], 'K2'],
    ['Hari dan bulan', ['Urutan hari: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu.', 'Satu minggu ada 7 hari, satu tahun ada 12 bulan.'], 'K3'],
  ]);
  add('L', 'Uang Rupiah ada yang berbentuk koin dan kertas. Nilainya tertulis pada uang.', [
    ['Mengenal uang', ['Lihat angka yang tertulis pada koin atau uang kertas.', 'Itulah nilai uangnya, misalnya Rp500 atau Rp2.000.'], 'L1'],
    ['Menghitung uang', ['Urutkan uang dari nilai terbesar.', 'Mulai dari yang terbesar, lalu tambahkan satu per satu.'], 'L2'],
    ['Apakah uangnya cukup?', ['Hitung jumlah semua uang.', 'Bandingkan dengan harga barang.', 'Jika uangnya sama atau lebih banyak, berarti cukup.'], 'L3'],
  ]);
  add('M', 'Data bisa ditampilkan dengan piktogram (gambar) atau turus (garis).', [
    ['Membaca piktogram', ['Baca judul dan keterangan: setiap gambar bernilai 1.', 'Hitung gambar pada baris yang ditanya.'], 'M1'],
    ['Turus', ['Satu kelompok turus berisi 5: empat garis tegak dan satu garis miring.', 'Hitung 5-an untuk setiap kelompok, lalu tambahkan garis yang tersisa.'], 'M2'],
    ['Membandingkan data', ['Cari kedua nilai yang dibandingkan.', 'Lebih banyak berapa = yang besar − yang kecil.'], 'M3'],
  ]);
  add('N', 'Bangun datar punya sisi dan sudut. Pola adalah urutan yang berulang.', [
    ['Bangun datar', ['Hitung garis lurus (sisi) dan pojoknya (sudut).', 'Segitiga punya 3 sisi, persegi dan persegi panjang 4 sisi, lingkaran tidak punya sisi lurus.'], 'N2'],
    ['Bangun ruang', ['Bola: bulat seperti ⚽. Kubus: semua sisinya persegi seperti 🎲.', 'Tabung: seperti kaleng 🥫. Balok: seperti kardus 📦. Kerucut: seperti cone es krim 🍦.'], 'N3'],
    ['Melanjutkan pola', ['Cari bagian yang berulang, misalnya 🔴🔵 🔴🔵.', 'Lanjutkan dengan bagian yang sama.'], 'N4'],
  ]);
  add('O', 'Pecahan menunjukkan bagian dari satu benda utuh yang dibagi sama besar.', [
    ['Bagian sama besar', ['Lihat semua bagiannya.', 'Jika semua bagian sama besar, bangun itu dibagi sama rata.'], 'O2'],
    ['Setengah, sepertiga, seperempat', ['Dibagi 2 bagian sama besar → satu bagian adalah <b>setengah</b>.', 'Dibagi 3 → <b>sepertiga</b>. Dibagi 4 → <b>seperempat</b>.'], 'O1'],
  ]);

  /* ---------- Kelas 2 ---------- */
  add('2A', 'Bilangan sampai 1.000 terdiri dari ratusan, puluhan, dan satuan.', [
    ['Ratusan, puluhan, satuan', ['Satu lempeng = 100, satu batang = 10, satu kubus = 1.', 'Hitung masing-masing, lalu tulis berurutan: ratusan, puluhan, satuan.'], '2A1'],
    ['Bentuk panjang', ['Pecah bilangan menurut nilai tempatnya.', 'Contoh: 645 = 600 + 40 + 5.'], '2A3'],
    ['Membandingkan', ['Bandingkan ratusan dulu.', 'Jika sama, bandingkan puluhan, lalu satuan.'], '2A5'],
    ['Genap dan ganjil', ['Lihat angka satuannya saja.', 'Angka satuan 0, 2, 4, 6, 8 → genap. Angka satuan 1, 3, 5, 7, 9 → ganjil.'], '2A8'],
  ]);
  add('2B', 'Tanda sama dengan (=) berarti nilai kedua sisi sama, seperti timbangan yang seimbang.', [
    ['Menyeimbangkan persamaan', ['Hitung sisi yang lengkap lebih dulu, misalnya 8 + 5 = 13.', 'Sisi lainnya juga harus bernilai 13.', 'Cari bilangan yang hilang: ? + 6 = 13, jadi ? = 7.'], '2B2'],
    ['Tabel masukan dan keluaran', ['Lihat pasangan pertama: dari berapa menjadi berapa?', 'Tebak aturannya (misalnya + 3), lalu cek ke pasangan lain.', 'Gunakan aturan itu untuk mengisi yang hilang.'], '2B3'],
  ]);
  add('2C', 'Menjumlah bilangan dua angka bisa dengan cara bersusun atau dengan strategi hitung mental.', [
    ['Menyimpan', ['Tulis bersusun: satuan di bawah satuan.', 'Jumlahkan satuan. Jika 10 atau lebih, tulis satuannya dan simpan 1.', 'Jumlahkan puluhan ditambah simpanan.'], '2C1'],
    ['Mengurai bilangan', ['Pecah bilangan kedua menjadi puluhan dan satuan: 25 = 20 + 5.', 'Tambahkan puluhannya dulu, lalu satuannya: 47 + 20 = 67, 67 + 5 = 72.'], '2C2', 'Hitung mental ala Singapura: urai bilangan menjadi puluhan dan satuan, lalu tambahkan satu per satu.'],
    ['Kompensasi', ['Untuk +9, tambah 10 lalu kurangi 1.', 'Untuk +19, tambah 20 lalu kurangi 1.'], '2C3', 'Strategi kompensasi termasuk "mental calculation" di Singapore Math 2A.'],
  ]);
  add('2D', 'Saat mengurangi bersusun, jika angka atas lebih kecil, pinjam dari kolom kirinya.', [
    ['Meminjam', ['Lihat satuan: misalnya 52 − 27, angka 2 lebih kecil dari 7.', 'Pinjam 1 puluhan: 5 puluhan menjadi 4, satuan 2 menjadi 12.', '12 − 7 = 5, lalu 4 − 2 = 2. Jawabannya 25.'], '2D2'],
    ['Menghitung maju untuk mengurangi', ['Mulai dari bilangan yang kecil.', 'Hitung lompatan ke puluhan terdekat, lalu ke bilangan yang besar.', 'Jumlahkan semua lompatan.'], '2D3'],
  ]);
  add('2E', 'Penjumlahan dan pengurangan bilangan tiga angka memakai cara yang sama: kerjakan per kolom dari kanan.', [
    ['Menambah atau mengurangi 10 dan 100', ['Menambah 10: angka puluhan bertambah 1.', 'Menambah 100: angka ratusan bertambah 1. Angka lain tetap.'], '2E1'],
    ['Menjumlah tiga angka', ['Jumlahkan satuan, lalu puluhan, lalu ratusan.', 'Setiap kolom yang berjumlah 10 atau lebih menyimpan 1 ke kolom kirinya.'], '2E3'],
    ['Meminjam melewati nol', ['Contoh 400 − 167: puluhan dan satuannya 0.', 'Pinjam dari ratusan: 4 ratusan → 3 ratusan dan 10 puluhan.', 'Pinjam 1 puluhan untuk satuan: 9 puluhan dan 10 satuan. Lalu kurangi per kolom.'], '2E5'],
  ]);
  add('2F', 'Model batang membantu memahami soal cerita: gambar batang untuk setiap jumlah di soal.', [
    ['Bagian dan keseluruhan', ['Gambar satu batang panjang untuk keseluruhan.', 'Bagi menjadi bagian-bagian yang diketahui.', 'Yang ditanya diberi tanda "?".'], '2F1', 'Model batang bagian–keseluruhan: keseluruhan = bagian + bagian; bagian = keseluruhan − bagian.'],
    ['Soal dua langkah', ['Kerjakan langkah pertama dan tulis hasilnya.', 'Gunakan hasil itu untuk langkah kedua.'], '2F2'],
    ['Perbandingan', ['Gambar dua batang, satu untuk setiap orang.', 'Bagian yang lebih panjang adalah selisihnya.'], '2F3', 'Model batang perbandingan: dua batang ditumpuk, selisihnya terlihat sebagai potongan tambahan.'],
  ]);
  add('2G', 'Perkalian adalah penjumlahan berulang. 3 × 4 artinya 3 kelompok berisi 4.', [
    ['Susunan baris dan kolom', ['Hitung banyak baris dan isi setiap baris.', 'Banyak baris × isi setiap baris = semuanya.'], '2G1'],
    ['Penjumlahan berulang', ['4 + 4 + 4 adalah 4 yang dijumlahkan 3 kali.', 'Ditulis 3 × 4 = 12.'], '2G2'],
    ['Perkalian 2, 5, dan 10', ['Lompat hitung 2-an, 5-an, atau 10-an.', 'Hitung berapa kali kamu melompat.'], '2G3'],
  ]);
  add('2H', 'Pembagian adalah membagi sama rata atau membuat kelompok sama besar.', [
    ['Berbagi sama rata', ['12 ÷ 3 artinya 12 benda dibagi untuk 3 anak.', 'Bagikan satu per satu sampai habis; hitung bagian satu anak.'], '2H1'],
    ['Membuat kelompok', ['15 ÷ 5 bisa berarti: berapa kelompok berisi 5 dari 15 benda?', 'Kelompokkan 5-5, lalu hitung kelompoknya.'], '2H2'],
    ['Pembagian dari perkalian', ['Untuk 20 ÷ 5, pikirkan: 5 × ? = 20.', 'Karena 5 × 4 = 20, jawabannya 4.'], '2H3'],
  ]);
  add('2I', 'Pecahan ditulis dengan dua angka: pembilang di atas, penyebut di bawah.', [
    ['Menulis pecahan', ['Hitung semua bagian yang sama besar: itu <b>penyebut</b>.', 'Hitung bagian yang diwarnai: itu <b>pembilang</b>.', 'Tulis pembilang/penyebut, misalnya 3/4.'], '2I2'],
    ['Membandingkan pecahan satuan', ['Pecahan satuan punya pembilang 1, misalnya 1/2 dan 1/4.', 'Semakin besar penyebutnya, semakin kecil setiap bagian.', 'Jadi 1/2 lebih besar dari 1/4.'], '2I3'],
    ['Membuat satu utuh', ['Satu utuh = semua bagian, misalnya 4/4.', 'Bagian yang kurang = penyebut − pembilang.'], '2I4'],
  ]);
  add('2J', 'Panjang diukur dengan sentimeter (cm) untuk benda kecil dan meter (m) untuk benda besar.', [
    ['Mengukur dengan penggaris', ['Lihat angka di ujung kiri dan ujung kanan benda.', 'Panjang = angka kanan − angka kiri.'], '2J1'],
    ['Memilih satuan', ['Benda yang bisa dipegang (pensil, buku) → cm.', 'Benda besar atau jarak (pintu, lapangan) → m.'], '2J2'],
  ]);
  add('2K', 'Berat diukur dalam gram (g) dan kilogram (kg). Isi cairan diukur dalam liter.', [
    ['Memilih satuan berat', ['Benda ringan (permen, pensil) → gram.', 'Benda berat (beras sekarung, semangka) → kilogram.'], '2K1'],
    ['Anak timbangan', ['Jika timbangan seimbang, berat benda sama dengan berat semua anak timbangan.', 'Jumlahkan semua anak timbangan.'], '2K2'],
    ['Liter', ['Liter dipakai untuk mengukur isi cairan, misalnya air dalam ember.', 'Gunakan tambah, kurang, atau kali seperti soal biasa.'], '2K3'],
  ]);
  add('2L', 'Jarum panjang menunjuk menit. Setiap angka pada jam bernilai 5 menit.', [
    ['Membaca jam per 5 menit', ['Lihat jarum pendek: angka yang sudah dilewati adalah jamnya.', 'Lihat jarum panjang: kalikan angkanya dengan 5. Angka 4 berarti 20 menit.'], '2L1'],
    ['Jam 24', ['Setelah pukul 12 siang, tambahkan 12.', 'Pukul 3 sore = pukul 15.00, pukul 7 malam = pukul 19.00.'], '2L2'],
    ['Lama waktu', ['Hitung maju dari waktu mulai ke waktu selesai.', 'Hitung jam penuh lebih dulu.'], '2L4'],
  ]);
  add('2M', 'Menghitung uang sama seperti menjumlah bilangan, hanya diberi tanda Rp.', [
    ['Menghitung uang', ['Urutkan dari nilai terbesar.', 'Jumlahkan satu per satu.'], '2M1'],
    ['Kembalian', ['Kembalian = uang yang dibayar − harga barang.'], '2M2'],
  ]);
  add('2N', 'Piktogram dan diagram batang menampilkan data. Selalu baca keterangannya dulu.', [
    ['Piktogram dengan skala', ['Baca keterangannya, misalnya "setiap gambar = 2 anak".', 'Hitung gambarnya, lalu kalikan dengan nilai satu gambar.'], '2N1'],
    ['Diagram batang', ['Cari batang yang ditanya.', 'Tarik garis dari ujung batang ke angka di sebelah kiri.'], '2N2'],
  ]);
  add('2O', 'Bangun datar dan bangun ruang punya ciri yang bisa dihitung. Luas adalah banyak petak di dalam bangun.', [
    ['Sisi dan titik sudut', ['Hitung garis lurus: itu sisi.', 'Hitung pojok: itu titik sudut. Pada segi banyak, jumlahnya sama.'], '2O2'],
    ['Bangun ruang', ['Sisi = permukaan datar, rusuk = garis tempat dua sisi bertemu, titik sudut = pojok.', 'Kubus dan balok: 6 sisi, 12 rusuk, 8 titik sudut.'], '2O3'],
    ['Luas dengan petak', ['Hitung banyak baris dan banyak petak di setiap baris.', 'Baris × petak per baris = luas.'], '2O4'],
    ['Keliling', ['Keliling adalah panjang semua sisi luar.', 'Jumlahkan keempat sisi persegi panjang.'], '2O5'],
  ]);
  add('2P', 'Membulatkan membantu memperkirakan hasil hitungan dengan cepat.', [
    ['Membulatkan ke puluhan', ['Cari dua puluhan terdekat, misalnya 47 ada di antara 40 dan 50.', 'Lihat satuannya: 5 atau lebih dibulatkan ke atas, kurang dari 5 ke bawah.'], '2P1'],
    ['Memperkirakan', ['Bulatkan setiap bilangan dulu.', 'Jumlahkan bilangan yang sudah dibulatkan.'], '2P3'],
  ]);

  /* ---------- Kelas 3 ---------- */
  add('3A', 'Bilangan sampai 10.000 punya empat tempat: ribuan, ratusan, puluhan, dan satuan.', [
    ['Nilai angka', ['Tentukan tempat angka itu dari kanan: satuan, puluhan, ratusan, ribuan.', 'Kalikan angkanya dengan nilai tempat: 4 di tempat ribuan = 4.000.'], '3A1'],
    ['Bentuk panjang', ['Pecah menurut nilai tempat: 4.325 = 4.000 + 300 + 20 + 5.'], '3A2'],
    ['Bilangan terbesar dan terkecil', ['Terbesar: letakkan angka terbesar di depan, lalu urut mengecil.', 'Terkecil: angka terkecil di depan, tetapi bukan 0.'], '3A4'],
  ]);
  add('3B', 'Membulatkan membuat bilangan lebih mudah dihitung untuk perkiraan.', [
    ['Membulatkan', ['Tentukan tempat pembulatan (puluhan atau ratusan).', 'Lihat angka tepat di sebelah kanannya.', '5 atau lebih → bulatkan ke atas. Kurang dari 5 → ke bawah.'], '3B1'],
    ['Memperkirakan hasil', ['Bulatkan setiap bilangan ke ratusan terdekat.', 'Hitung dengan bilangan yang sudah dibulatkan.'], '3B2'],
  ]);
  add('3C', 'Penjumlahan dan pengurangan bilangan besar dikerjakan bersusun dari kolom satuan.', [
    ['Menjumlah bersusun', ['Luruskan kolom: satuan, puluhan, ratusan, ribuan.', 'Jumlahkan dari kanan dan simpan 1 jika hasil kolom 10 atau lebih.'], '3C2'],
    ['Mengurangi bersusun', ['Kurangi dari kanan.', 'Jika angka atas lebih kecil, pinjam 1 dari kolom kirinya.', 'Periksa dengan penjumlahan: hasil + pengurang = bilangan awal.'], '3C3'],
  ]);
  add('3D', 'Perkalian punya sifat-sifat yang membuat hitungan lebih mudah.', [
    ['Kalimat perkalian', ['Banyak kelompok × isi tiap kelompok.', '4 piring berisi 6 kue → 4 × 6.'], '3D1'],
    ['Sifat perkalian', ['Dikali 0 hasilnya 0; dikali 1 hasilnya bilangan itu sendiri.', 'Urutan boleh ditukar: 3 × 7 = 7 × 3.'], '3D2'],
    ['Memecah perkalian', ['Pecah salah satu bilangan: 7 × 8 = 7 × 5 + 7 × 3.', '35 + 21 = 56.'], '3D3', 'Memecah perkalian dengan pasangan bilangan (7 × 8 = 7 × 5 + 7 × 3) adalah cara Singapura menghafal tabel 6–9.'],
  ]);
  add('3E', 'Hafal tabel perkalian membuat berhitung jauh lebih cepat.', [
    ['Perkalian 6 dan 7', ['Gunakan 5 sebagai patokan: 6 × 7 = 5 × 7 + 1 × 7 = 35 + 7 = 42.'], '3E1'],
    ['Perkalian 8 dan 9', ['× 9 = × 10 lalu kurangi sekali: 9 × 7 = 70 − 7 = 63.', '× 8 = dobel dari × 4: 8 × 6 = 2 × 24 = 48.'], '3E2'],
    ['Faktor yang hilang', ['Untuk ? × 7 = 56, pikirkan pembagian: 56 ÷ 7 = 8.'], '3E4'],
  ]);
  add('3F', 'Pembagian kadang tidak habis. Bagian yang tersisa disebut sisa.', [
    ['Fakta pembagian', ['Untuk 42 ÷ 6, pikirkan perkalian: 6 × ? = 42.'], '3F2'],
    ['Pembagian bersisa', ['Cari perkalian terbesar yang tidak melebihi bilangan: 23 ÷ 4 → 4 × 5 = 20.', 'Sisa = 23 − 20 = 3. Jadi 23 ÷ 4 = 5 sisa 3.', 'Sisa selalu lebih kecil dari pembagi.'], '3F3'],
    ['Soal cerita bersisa', ['Baca pertanyaannya: jika semua harus terangkut, tambah 1 untuk sisanya.', 'Jika yang ditanya hanya yang penuh, abaikan sisanya.'], '3F4'],
  ]);
  add('3G', 'Perkalian bersusun mengalikan setiap tempat satu per satu.', [
    ['Dua angka × satu angka', ['Pecah menurut tempat: 46 × 3 = 40 × 3 + 6 × 3.', '120 + 18 = 138.'], '3G1'],
    ['Mengali puluhan dan ratusan', ['Kalikan angka depannya: 40 × 6 → 4 × 6 = 24.', 'Tambahkan nol sebanyak nol pada bilangan semula: 240.'], '3G4'],
  ]);
  add('3H', 'Soal cerita bisa punya dua langkah. Model batang membantu soal "kali lebih banyak".', [
    ['Dua langkah', ['Tentukan apa yang harus dicari lebih dulu.', 'Hitung langkah 1, lalu gunakan hasilnya untuk langkah 2.'], '3H1'],
    ['Bilangan yang hilang', ['Gunakan operasi kebalikan: tambah ↔ kurang, kali ↔ bagi.', '? + 245 = 600 → ? = 600 − 245.'], '3H2'],
    ['Kali lebih banyak', ['Gambar 1 batang untuk yang kecil.', '"3 kali lebih banyak" = 3 batang sama panjang.'], '3H3', 'Model batang "satuan" (unit): jika 1 satuan diketahui, semua satuan lain bisa dihitung.'],
  ]);
  add('3I', 'Pecahan senilai adalah pecahan yang berbeda tulisannya tetapi sama besarnya.', [
    ['Pecahan pada garis bilangan', ['Hitung banyak bagian antara 0 dan 1: itu penyebut.', 'Hitung bagian dari 0 sampai titik: itu pembilang.'], '3I2'],
    ['Pecahan senilai', ['Kalikan pembilang dan penyebut dengan bilangan yang sama.', '1/2 = 2/4 = 4/8.'], '3I3', 'Gambarkan dua pita sama panjang untuk melihat bahwa 1/2 dan 2/4 sama besar.'],
    ['Pecahan sama dengan bilangan bulat', ['Jika pembilang sama dengan penyebut, hasilnya 1: 4/4 = 1.', 'Bagi pembilang dengan penyebut: 6/3 = 2.'], '3I4'],
  ]);
  add('3J', 'Membandingkan dan menjumlah pecahan lebih mudah jika penyebut atau pembilangnya sama.', [
    ['Penyebut sama', ['Bandingkan pembilangnya: 5/8 lebih besar dari 3/8.'], '3J1'],
    ['Pembilang sama', ['Bandingkan penyebutnya: semakin besar penyebut, semakin kecil pecahannya.'], '3J2'],
    ['Menjumlah penyebut sama', ['Penyebut tetap.', 'Jumlahkan atau kurangi pembilangnya saja: 2/7 + 3/7 = 5/7.'], '3J4'],
  ]);
  add('3K', 'Luas adalah banyak petak di dalam bangun. Keliling adalah panjang semua sisi luar.', [
    ['Luas persegi panjang', ['Luas = panjang × lebar.', 'Satuan luas memakai kuadrat, misalnya cm².'], '3K2'],
    ['Keliling', ['Jumlahkan semua sisi.', 'Persegi panjang: panjang + lebar + panjang + lebar.'], '3K3'],
    ['Mencari sisi dari keliling', ['Persegi: keliling ÷ 4.', 'Persegi panjang: keliling ÷ 2, lalu kurangi sisi yang diketahui.'], '3K4'],
  ]);
  add('3L', 'Sudut siku-siku seperti pojok kertas. Garis bisa sejajar, tegak lurus, atau berpotongan.', [
    ['Sudut siku-siku', ['Bandingkan sudut dengan pojok kertas.', 'Lebih sempit = lebih kecil dari siku-siku; lebih lebar = lebih besar.'], '3L2'],
    ['Garis', ['Sejajar: tidak pernah bertemu.', 'Tegak lurus: bertemu membentuk sudut siku-siku.'], '3L3'],
    ['Jenis segi empat', ['Persegi: 4 sisi sama, 4 sudut siku-siku.', 'Jajargenjang: sisi berhadapan sejajar. Trapesium: hanya satu pasang sisi sejajar.'], '3L1'],
  ]);
  add('3M', 'Jam bisa dibaca sampai menit. Lama waktu dihitung dari mulai sampai selesai.', [
    ['Membaca menit', ['Hitung 5-an sampai angka terakhir yang dilewati jarum panjang.', 'Tambahkan garis-garis kecil sesudahnya (1 menit tiap garis).'], '3M1'],
    ['Lama waktu', ['Hitung maju ke jam penuh berikutnya.', 'Tambahkan jam dan menit sisanya.'], '3M2'],
    ['Satuan waktu', ['1 jam = 60 menit, 1 menit = 60 detik.'], '3M3'],
  ]);
  add('3N', 'Satuan metrik saling berhubungan dengan 10, 100, atau 1.000.', [
    ['Mengubah satuan', ['1 m = 100 cm, 1 km = 1.000 m, 1 kg = 1.000 g, 1 L = 1.000 mL.', 'Dari satuan besar ke kecil: kalikan.'], '3N1'],
    ['Memilih satuan', ['Pilih satuan yang sesuai ukuran benda: jarak kota → km, isi gelas → mL.'], '3N2'],
  ]);
  add('3O', 'Diagram batang dan piktogram sering memakai skala, misalnya setiap garis bernilai 5.', [
    ['Diagram batang berskala', ['Lihat nilai setiap garis pada sumbu.', 'Baca ujung batang; jika di tengah dua garis, nilainya di tengah-tengah.'], '3O1'],
    ['Piktogram berskala', ['Baca keterangan: setiap gambar = berapa?', 'Banyak gambar × nilai satu gambar.'], '3O2'],
  ]);
  add('3P', 'Soal uang memakai tambah, kurang, dan kali seperti bilangan biasa.', [
    ['Total dan kembalian', ['Jumlahkan semua harga.', 'Kembalian = uang dibayar − total harga.'], '3P1'],
    ['Harga beberapa barang', ['Harga semua = harga satu × banyak barang.'], '3P2'],
  ]);
})();
