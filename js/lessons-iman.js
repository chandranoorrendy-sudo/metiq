/* Metiq - materi untuk bab lapisan iman (zakat, bilangan dalam Al-Qur'an, waris).
 * Bentuknya sama dengan js/lessons-a.js: pengantar singkat, lalu subbab berisi langkah
 * dan satu keterampilan contoh. Semua bab di sini hanya tampil di kelas berkonteks islami.
 */
(function () {
  const L = (window.METIQ_LESSONS = window.METIQ_LESSONS || {});
  const add = (id, intro, parts) => { L[id] = { intro, parts: parts.map(([t, steps, ex, sg]) => ({ t, steps, ex, sg })) }; };

  /* ---------- Kelas 2: zakat dan sedekah ---------- */
  add('2Z', 'Zakat adalah bagian harta yang kita keluarkan untuk orang yang membutuhkan. Kita berlatih menghitungnya dengan perkalian, pembagian, dan pengurangan.', [
    ['Zakat fitrah', ['Zakat fitrah besarnya 2,5 kg beras untuk setiap orang.', 'Kalikan 2,5 kg dengan jumlah orang di rumah.', 'Contoh: 4 orang, jadi 2,5 × 4 = 10 kg.'], '2Z1'],
    ['Membagi sama rata', ['Bagikan kantong beras satu per satu ke setiap golongan sampai habis.', 'Periksa dengan perkalian: banyak golongan × isi tiap golongan = semuanya.'], '2Z2', 'Model batang: satu batang keseluruhan dibagi menjadi 8 bagian yang sama besar.'],
    ['Sedekah dan sisa uang', ['Uang awal dikurangi yang disedekahkan = sisa.', 'Sedekah tidak harus besar; yang penting ikhlas dan dari uang sendiri.'], '2Z3'],
  ]);

  /* ---------- Kelas 4: bilangan dalam Al-Qur'an ---------- */
  add('4Q', "Al-Qur'an menyebut banyak bilangan: 300 tahun ditambah 9, 950 tahun, 40 malam, dan bagian malam. Kita berlatih membaca dan menghitungnya. Nomor surah dicantumkan agar bisa diperiksa bersama guru; teks dan tafsir ayat tidak ditulis di sini.", [
    ['Tiga ratus tahun ditambah sembilan', ['Penghuni gua tinggal 300 tahun ditambah 9 tahun (QS Al-Kahfi 18:25).', 'Kata "ditambah" berarti jumlahkan: 300 + 9.', 'Hasilnya 309 tahun.'], '4Q1'],
    ['Membandingkan dengan seribu', ['Nabi Nuh berdakwah 950 tahun (QS Al-Ankabut 29:14).', 'Untuk mencari kekurangan menuju 1.000, kurangkan: 1.000 − 950.', 'Hasilnya 50 tahun.'], '4Q2'],
    ['Empat puluh malam', ['Nabi Musa berjanji beribadah 40 malam (QS Al-Baqarah 2:51).', 'Jika sebagian malam sudah dilalui, kurangkan dari 40.', 'Contoh: 28 malam sudah dilalui, sisanya 40 − 28 = 12 malam.'], '4Q3', 'Model batang: batang keseluruhan 40 dibagi menjadi bagian "sudah" dan "sisa".'],
    ['Bagian malam', ['Satu malam ada 24 jam.', 'Seperdua = dibagi 2, sepertiga = dibagi 3, seperempat = dibagi 4.', 'Contoh: sepertiga malam = 24 ÷ 3 = 8 jam.'], '4Q4', 'Pecahan sebagai pembagian: 1/3 dari 24 sama dengan 24 ÷ 3.'],
  ]);

  /* ---------- Kelas 5: zakat mal dan persen ---------- */
  add('5Z', 'Zakat mal dikeluarkan jika harta sudah mencapai nisab dan dimiliki selama satu tahun (haul). Besarnya 2,5%. Kita berlatih menghitung persen, selisih, dan satuan waktu.', [
    ['Dua koma lima persen', ['2,5% sama dengan 2,5/100.', 'Bagi harta dengan 100, lalu kalikan 2,5.', 'Contoh: Rp4.000.000 ÷ 100 = Rp40.000, lalu × 2,5 = Rp100.000.'], '5Z1', 'Persen sebagai pecahan: 2,5% = 25/1000 = 1/40.'],
    ['Nisab emas', ['Nisab emas adalah 85 gram.', 'Jika emas lebih dari 85 gram, hitung kelebihannya dengan pengurangan.', 'Jika kurang, hitung kekurangannya sampai 85 gram.'], '5Z2'],
    ['Haul satu tahun', ['Haul adalah masa memiliki harta selama satu tahun, yaitu 12 bulan.', 'Hitung sisa bulan dengan pengurangan: 12 − bulan yang sudah berjalan.'], '5Z3'],
    ['Zakat penghasilan', ['Zakat penghasilan juga 2,5% dari penghasilan.', 'Bagi dengan 100 lalu kalikan 2,5.', 'Contoh: Rp3.000.000 menjadi Rp75.000.'], '5Z4'],
  ]);

  /* ---------- Kelas 6: waris sebagai latihan pecahan ---------- */
  add('6W', 'Pembagian waris memakai pecahan: 1/2, 1/4, 1/8, 1/3, 1/6, dan 2/3. Bab ini hanya melatih hitungan pecahannya. Pembagian waris yang sebenarnya harus dilakukan ahli faraid atau ustadz, karena ada bagian yang bisa bertambah (aul) atau bergeser.', [
    ['Bagian seperdua', ['1/2 berarti harta dibagi 2 sama besar.', 'Contoh: Rp120.000.000 ÷ 2 = Rp60.000.000.'], '6W1', 'Pecahan sebagai pembagian: 1/2 dari suatu bilangan sama dengan bilangan itu dibagi 2.'],
    ['Seperempat dan seperdelapan', ['1/4 berarti dibagi 4, 1/8 berarti dibagi 8.', 'Semakin banyak bagian, semakin kecil isi tiap bagian.', 'Contoh: Rp80.000.000 ÷ 8 = Rp10.000.000.'], '6W2'],
    ['Sisa setelah bagian diambil', ['Jumlahkan bagian yang sudah ditetapkan.', 'Sisa = 1 dikurangi jumlah bagian itu.', 'Contoh: 1/2 + 1/4 = 3/4, jadi sisanya 1/4.'], '6W3'],
    ['Jumlah bagian harus satu', ['Semua bagian harus berjumlah tepat 1.', 'Cari pecahan yang melengkapi: 1 − bagian yang diketahui.', 'Contoh: 2/3 + 1/3 = 1.'], '6W4', 'Gunakan lingkaran pecahan: bagian yang terisi ditambah bagian kosong selalu satu lingkaran penuh.'],
  ]);
})();
