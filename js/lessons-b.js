/* Metiq — Pelajaran kelas 4–6, dengan metode Singapore Math (model batang, metode satuan, hitung mental). */
(function () {
  const L = (window.METIQ_LESSONS = window.METIQ_LESSONS || {});
  // Elemen ke-4 (opsional) adalah catatan metode Singapore Math untuk subbab itu
  const add = (id, intro, parts) => { L[id] = { intro, parts: parts.map(([t, steps, ex, sg]) => ({ t, steps, ex, sg })) }; };

  /* ---------- Kelas 4 ---------- */
  add('4A', 'Bilangan besar dibaca per kelompok tiga angka dari kanan: satuan, ribuan, lalu jutaan.', [
    ['Nilai angka', ['Tentukan tempat angka: satuan, puluhan, ratusan, ribuan, puluh ribuan, ratus ribuan.', 'Nilai = angka × nilai tempatnya. Angka 7 di tempat puluh ribuan bernilai 70.000.'], '4A1'],
    ['Membaca bilangan besar', ['Pisahkan dengan titik setiap tiga angka dari kanan: 305.420.', 'Baca kelompok depan lalu sebut "ribu": tiga ratus lima ribu empat ratus dua puluh.'], '4A2'],
    ['Membulatkan', ['Lihat angka tepat di kanan tempat pembulatan.', '5 atau lebih → naikkan angka di tempat pembulatan; kurang dari 5 → tetap. Angka di kanannya menjadi 0.'], '4A3'],
  ]);
  add('4B', 'Penjumlahan dan pengurangan bilangan lima angka tetap dikerjakan bersusun dari kanan.', [
    ['Menjumlah bilangan besar', ['Luruskan semua kolom.', 'Jumlahkan dari satuan, simpan 1 jika hasil kolom 10 atau lebih.', 'Perkirakan dulu agar mudah memeriksa jawaban.'], '4B1'],
    ['Mengurangi bilangan besar', ['Kurangi dari kanan, pinjam jika perlu.', 'Periksa: hasil + pengurang harus sama dengan bilangan awal.'], '4B2'],
    ['Soal cerita', ['Tentukan apakah digabung (tambah) atau dicari sisanya/selisihnya (kurang).'], '4B3', 'Gambar model batang lebih dulu, walaupun bilangannya besar. Bentuk batangnya sama seperti soal kecil.'],
  ]);
  add('4C', 'Faktor adalah bilangan yang membagi habis. Kelipatan adalah hasil kali sebuah bilangan.', [
    ['Faktor', ['Cari pasangan perkalian yang hasilnya bilangan itu: 12 = 1 × 12 = 2 × 6 = 3 × 4.', 'Faktor 12 adalah 1, 2, 3, 4, 6, 12.'], '4C1'],
    ['Kelipatan', ['Kelipatan 4: 4, 8, 12, 16, … (lompat hitung 4-an).'], '4C2'],
    ['Bilangan prima', ['Bilangan prima hanya punya dua faktor: 1 dan dirinya sendiri (2, 3, 5, 7, 11, …).', 'Bilangan komposit punya lebih dari dua faktor.'], '4C3'],
    ['Faktor dan kelipatan persekutuan', ['Tulis faktor (atau kelipatan) kedua bilangan.', 'Lingkari yang sama. Ambil yang terbesar (FPB) atau terkecil (KPK).'], '4C4'],
  ]);
  add('4D', 'Perkalian bilangan besar dikerjakan per tempat, lalu hasilnya dijumlahkan.', [
    ['Empat angka × satu angka', ['Kalikan satuan, puluhan, ratusan, ribuan berturut-turut.', 'Tambahkan simpanan ke kolom berikutnya.'], '4D1'],
    ['Dua angka × dua angka', ['Pecah bilangan kedua: 34 × 26 = 34 × 20 + 34 × 6.', '680 + 204 = 884.'], '4D2', 'Singapore Math memakai metode bersusun panjang: dua baris hasil kali sebagian, lalu dijumlah.'],
    ['× 10, 100, 1.000', ['Tambahkan nol di belakang sebanyak nol pada pengali.'], '4D3'],
  ]);
  add('4E', 'Pembagian bersusun membagi dari tempat terbesar ke tempat terkecil.', [
    ['Pembagian bersusun', ['Bagi angka paling kiri (atau dua angka paling kiri) dengan pembagi.', 'Kalikan, kurangkan, turunkan angka berikutnya. Ulangi.', 'Periksa: hasil × pembagi (+ sisa) = bilangan awal.'], '4E1'],
    ['Pembagian bersisa', ['Sisa adalah yang tersisa setelah pembagian terakhir.', 'Sisa harus lebih kecil dari pembagi.'], '4E2'],
    ['Menafsirkan sisa', ['Jika semua harus mendapat tempat → tambah 1.', 'Jika hanya yang lengkap → abaikan sisa.'], '4E4'],
  ]);
  add('4F', 'Soal multi-langkah dan urutan operasi hitung memerlukan aturan yang jelas.', [
    ['Urutan operasi', ['Kerjakan yang di dalam kurung lebih dulu.', 'Lalu kali dan bagi, dari kiri ke kanan.', 'Terakhir tambah dan kurang, dari kiri ke kanan.'], '4F2'],
    ['Soal multi-langkah', ['Tulis apa yang diketahui dan ditanya.', 'Hitung setiap langkah dan beri keterangan.', 'Periksa apakah jawaban masuk akal.'], '4F1', 'Model batang bisa ditumpuk untuk soal multi-langkah: setiap langkah satu batang.'],
  ]);
  add('4G', 'Pola bilangan mengikuti aturan tertentu, misalnya ditambah atau dikali bilangan yang sama.', [
    ['Mencari aturan', ['Bandingkan dua bilangan berurutan: bertambah, berkurang, atau dikali?', 'Uji aturan itu pada bilangan berikutnya.'], '4G1'],
    ['Suku ke-n', ['Suku ke-n = suku pertama + (n − 1) × beda.', 'Contoh: 4, 7, 10, … suku ke-10 = 4 + 9 × 3 = 31.'], '4G3'],
  ]);
  add('4H', 'Pecahan campuran terdiri dari bilangan bulat dan pecahan, misalnya 2 1/3.', [
    ['Pecahan senilai', ['Kalikan atau bagi pembilang dan penyebut dengan bilangan yang sama.'], '4H1'],
    ['Menyederhanakan', ['Cari FPB pembilang dan penyebut.', 'Bagi keduanya dengan FPB itu.'], '4H2'],
    ['Pecahan campuran dan pecahan biasa', ['7/3: 7 ÷ 3 = 2 sisa 1 → 2 1/3.', '2 1/3: 2 × 3 + 1 = 7 → 7/3.'], '4H3'],
    ['Membandingkan pecahan', ['Samakan penyebut lebih dulu.', 'Lalu bandingkan pembilangnya.'], '4H4'],
  ]);
  add('4I', 'Pecahan bisa dijumlah, dikurangi, dan dikali bilangan bulat.', [
    ['Penyebut berkaitan', ['Ubah pecahan agar penyebutnya sama: 1/2 + 1/4 → 2/4 + 1/4.', 'Jumlahkan pembilangnya: 3/4.'], '4I2'],
    ['Pecahan × bilangan bulat', ['Kalikan pembilangnya saja: 3 × 2/5 = 6/5 = 1 1/5.', 'Penyebut tidak ikut dikali.'], '4I3'],
    ['Pecahan dari suatu jumlah', ['2/3 dari 12: bagi 12 menjadi 3 bagian sama (4).', 'Ambil 2 bagian: 2 × 4 = 8.'], '4I4', 'Metode satuan: gambar batang 12 dibagi 3 satuan. 1 satuan = 4, jadi 2 satuan = 8.'],
  ]);
  add('4J', 'Desimal adalah cara lain menulis pecahan berpenyebut 10, 100, atau 1.000. Di Indonesia ditulis dengan koma.', [
    ['Pecahan dan desimal', ['3/10 = 0,3 (tiga persepuluh).', '47/100 = 0,47 (empat puluh tujuh perseratus).'], '4J1'],
    ['Nilai tempat desimal', ['Setelah koma: persepuluhan, perseratusan, perseribuan.'], '4J2'],
    ['Membandingkan desimal', ['Samakan banyak angka di belakang koma dengan menambah nol: 0,5 = 0,50.', 'Bandingkan seperti bilangan biasa: 0,50 > 0,45.'], '4J3'],
    ['Menjumlah dan mengurangi desimal', ['Luruskan koma ke bawah.', 'Tambahkan nol agar sama panjang, lalu hitung seperti biasa.'], '4J4'],
  ]);
  add('4K', 'Diagram garis menunjukkan perubahan dari waktu ke waktu. Statistik meringkas sekumpulan data.', [
    ['Diagram garis', ['Cari titik di atas waktu yang ditanya.', 'Baca nilainya di sumbu kiri.', 'Naik atau turun = selisih dua titik.'], '4K1'],
    ['Modus, median, jangkauan', ['Modus = nilai yang paling sering muncul.', 'Median = nilai tengah setelah data diurutkan.', 'Jangkauan = nilai terbesar − nilai terkecil.'], '4K2'],
  ]);
  add('4L', 'Jam 24 dan satuan ukur dipakai dalam kehidupan sehari-hari: jadwal, resep, dan jarak.', [
    ['Jam 24', ['Pukul 1 siang = 13.00. Tambahkan 12 untuk waktu setelah tengah hari.', 'Sebaliknya, kurangi 12 untuk mengubah ke jam 12.'], '4L1'],
    ['Lama waktu', ['Hitung dari waktu mulai ke jam penuh, lalu ke waktu selesai.', 'Jumlahkan jam dan menitnya.'], '4L2'],
    ['Mengubah satuan', ['Satuan besar ke kecil: kalikan (1,5 kg = 1.500 g).', 'Satuan kecil ke besar: bagi.'], '4L3'],
  ]);
  add('4M', 'Bangun gabungan bisa dipecah menjadi persegi panjang yang lebih sederhana.', [
    ['Luas persegi dan persegi panjang', ['Luas = panjang × lebar.', 'Persegi: sisi × sisi.'], '4M1'],
    ['Luas bangun gabungan', ['Cara 1: pecah menjadi dua persegi panjang, lalu jumlahkan.', 'Cara 2: hitung persegi panjang besar, lalu kurangi bagian yang hilang.'], '4M2'],
    ['Keliling bangun gabungan', ['Jumlahkan semua sisi luar.', 'Pada bentuk L, kelilingnya sama dengan persegi panjang besar yang mengelilinginya.'], '4M4'],
  ]);
  add('4N', 'Sudut diukur dalam derajat (°). Satu putaran penuh = 360°.', [
    ['Jenis sudut', ['Lancip: kurang dari 90°. Siku-siku: tepat 90°.', 'Tumpul: antara 90° dan 180°. Lurus: 180°.'], '4N1'],
    ['Sudut yang hilang', ['Sudut pada garis lurus berjumlah 180°.', 'Dua sudut yang membentuk siku-siku berjumlah 90°.'], '4N3'],
    ['Arah dan putaran', ['Mawar angin 8 arah: utara, timur laut, timur, tenggara, selatan, barat daya, barat, barat laut.', 'Setiap 45° berpindah satu arah; 90° = seperempat putaran.'], '4N4', 'Singapore Math 4B memakai 8 arah mata angin dan putaran 1/4, 1/2, 3/4.'],
  ]);
  add('4O', 'Segitiga dan segi empat dikenali dari sisi dan sudutnya. Simetri lipat membagi bangun menjadi dua bagian sama.', [
    ['Jenis segitiga', ['Sama sisi: ketiga sisi sama. Sama kaki: dua sisi sama.', 'Sembarang: semua sisi berbeda. Siku-siku: satu sudut 90°.'], '4O1'],
    ['Sumbu simetri', ['Bayangkan melipat bangun.', 'Jika kedua bagian tepat menutup, lipatan itu sumbu simetri. Hitung semua cara melipat.'], '4O3'],
  ]);
  add('4P', 'Menghitung harga dan menabung adalah bagian dari literasi keuangan.', [
    ['Harga satuan', ['Harga per barang = harga paket ÷ banyak barang.', 'Bandingkan harga per barang untuk mencari yang lebih murah.'], '4P1'],
    ['Menabung', ['Banyak minggu = target ÷ tabungan per minggu.'], '4P2'],
  ]);

  /* ---------- Kelas 5 ---------- */
  add('5A', 'Bilangan sampai jutaan dan pangkat sepuluh memudahkan menulis bilangan besar.', [
    ['Nilai angka sampai jutaan', ['Tempat dari kanan: satuan, puluhan, ratusan, ribuan, puluh ribuan, ratus ribuan, jutaan.'], '5A1'],
    ['Pangkat sepuluh', ['10² = 100, 10³ = 1.000: angka pangkat = banyak nol.', '5 × 10³ = 5.000.'], '5A3'],
  ]);
  add('5B', 'Perkalian dan pembagian dengan bilangan dua angka memakai perkiraan untuk memeriksa jawaban.', [
    ['Tiga angka × dua angka', ['Pecah pengali menjadi puluhan dan satuan.', 'Kalikan masing-masing, lalu jumlahkan.'], '5B1'],
    ['Membagi dengan dua angka', ['Perkirakan berapa kali pembagi masuk ke bilangan.', 'Kalikan, kurangkan, turunkan angka berikutnya.', 'Periksa dengan perkalian.'], '5B2'],
  ]);
  add('5C', 'FPB dan KPK membantu menyelesaikan soal pembagian sama rata dan kejadian berulang.', [
    ['FPB', ['Tulis faktor kedua bilangan (atau faktorisasi prima).', 'Ambil faktor sama yang terbesar.'], '5C1'],
    ['KPK', ['Tulis kelipatan kedua bilangan.', 'Ambil kelipatan sama yang terkecil.'], '5C2'],
    ['Soal cerita', ['"Bertemu lagi", "bersamaan lagi" → KPK.', '"Dibagi sama banyak sebanyak-banyaknya" → FPB.'], '5C3'],
  ]);
  add('5D', 'Ekspresi adalah kalimat matematika. Urutan operasi menentukan bagian mana yang dihitung dulu.', [
    ['Urutan operasi dengan kurung', ['Kurung → kali/bagi (kiri ke kanan) → tambah/kurang (kiri ke kanan).'], '5D1'],
    ['Menulis ekspresi', ['Bagian yang dikerjakan lebih dulu diberi kurung.', '"Kurangi 4 dari 9, lalu kali 3" → (9 − 4) × 3.'], '5D2'],
    ['Ekspresi dengan variabel', ['Variabel seperti n mewakili suatu bilangan.', '3n berarti 3 × n. Ganti n dengan angkanya, lalu hitung.'], '5D3', 'Singapore Math 5A memperkenalkan aljabar sebagai "bilangan yang belum diketahui", sering digambar sebagai satu batang.'],
  ]);
  add('5E', 'Untuk menjumlah atau mengurangi pecahan berbeda penyebut, samakan penyebutnya lebih dulu.', [
    ['Berbeda penyebut', ['Cari KPK kedua penyebut.', 'Ubah setiap pecahan menjadi pecahan senilai dengan penyebut itu.', 'Jumlahkan atau kurangi pembilangnya, lalu sederhanakan.'], '5E1'],
    ['Pecahan campuran', ['Ubah ke pecahan biasa, atau hitung bilangan bulat dan pecahannya terpisah.', 'Sederhanakan dan ubah kembali ke pecahan campuran.'], '5E3'],
    ['Soal cerita pecahan', ['Tentukan operasinya, lalu samakan penyebut.'], '5E4', 'Gambar model batang dengan potongan pecahan agar terlihat bagian mana yang digabung atau dikurangi.'],
  ]);
  add('5F', 'Mengalikan pecahan berarti mengambil bagian dari bagian. Pecahan juga bisa berarti pembagian.', [
    ['Pecahan × pecahan', ['Kalikan pembilang dengan pembilang, penyebut dengan penyebut.', 'Sederhanakan hasilnya.'], '5F1'],
    ['Membagi dengan pecahan satuan', ['5 ÷ 1/2: ada berapa setengah dalam 5? Ada 10.', 'Membagi dengan 1/n sama dengan mengali n.'], '5F3'],
    ['Pecahan sebagai pembagian', ['3 ÷ 4 = 3/4: 3 benda dibagi 4 orang, tiap orang dapat 3/4.'], '5F4'],
  ]);
  add('5G', 'Desimal sampai perseribuan: tiga angka di belakang koma.', [
    ['Nilai tempat desimal', ['Persepuluhan, perseratusan, perseribuan.', '3,425: 4 persepuluhan, 2 perseratusan, 5 perseribuan.'], '5G1'],
    ['Membulatkan desimal', ['Lihat angka tepat sesudah tempat pembulatan.', '5 atau lebih → naikkan; kurang dari 5 → tetap.'], '5G3'],
    ['Desimal dan pecahan', ['Ubah penyebut menjadi 10, 100, atau 1.000: 3/4 = 75/100 = 0,75.'], '5G4'],
  ]);
  add('5H', 'Operasi desimal sama seperti bilangan bulat; yang penting letak komanya.', [
    ['Menjumlah dan mengurangi', ['Luruskan koma, tambahkan nol, lalu hitung.'], '5H1'],
    ['Mengali dengan bilangan bulat', ['Kalikan tanpa koma.', 'Letakkan koma sebanyak angka di belakang koma pada soal.'], '5H2'],
    ['Mengali dan membagi dengan 10, 100, 1.000', ['Mengali: koma bergeser ke kanan 1, 2, atau 3 tempat.', 'Membagi: koma bergeser ke kiri.'], '5H3'],
  ]);
  add('5I', 'Rasio membandingkan dua jumlah, misalnya 2 : 3.', [
    ['Menulis rasio', ['Tulis sesuai urutan di soal: "apel terhadap pisang" → apel : pisang.', 'Sederhanakan dengan membagi keduanya dengan FPB.'], '5I1'],
    ['Soal cerita rasio', ['Gambar batang untuk setiap bagian rasio, semua satuan sama besar.', 'Cari nilai 1 satuan: total ÷ banyak satuan.', 'Kalikan untuk mencari yang ditanya.'], '5I3', 'Metode satuan (unitary method) dan model batang adalah cara utama Singapore Math menyelesaikan soal rasio.'],
  ]);
  add('5J', 'Persen berarti "per seratus". 25% = 25/100.', [
    ['Persen, pecahan, desimal', ['50% = 1/2 = 0,5. 25% = 1/4 = 0,25. 10% = 1/10 = 0,1.'], '5J1'],
    ['Persen dari bilangan', ['Cari 10% dulu (bagi 10), lalu kalikan.', '30% dari 80: 10% = 8, jadi 30% = 24.'], '5J2', 'Model batang 100% dibagi 10 bagian: setiap bagian 10%. Ini cara Singapura menghitung persen tanpa rumus.'],
    ['Diskon', ['Hitung besar diskon (persen × harga).', 'Harga bayar = harga − diskon.'], '5J3'],
  ]);
  add('5K', 'Bidang koordinat memakai dua sumbu: x mendatar dan y tegak. Titik ditulis (x, y).', [
    ['Membaca koordinat', ['Mulai dari (0, 0).', 'Jalan mendatar dulu (x), baru naik (y).', 'Tulis (x, y) — urutannya tidak boleh tertukar.'], '5K1'],
  ]);
  add('5L', 'Volume adalah banyak kubus satuan yang mengisi sebuah bangun ruang.', [
    ['Volume dengan kubus satuan', ['Hitung kubus pada satu lapis: panjang × lebar.', 'Kalikan dengan banyak lapis (tinggi).'], '5L1'],
    ['Volume balok', ['Volume = panjang × lebar × tinggi.', 'Kubus: rusuk × rusuk × rusuk.'], '5L2'],
    ['Liter dan cm³', ['1 liter = 1.000 cm³.', 'Hitung volume dalam cm³, lalu bagi 1.000 untuk mendapat liter.'], '5L4'],
  ]);
  add('5M', 'Luas segitiga adalah setengah dari persegi panjang dengan alas dan tinggi yang sama.', [
    ['Luas segitiga', ['Luas = alas × tinggi ÷ 2.', 'Tinggi selalu tegak lurus dengan alas.'], '5M1'],
    ['Sudut dalam segitiga', ['Jumlah ketiga sudut segitiga = 180°.', 'Sudut ketiga = 180° − dua sudut yang diketahui.'], '5M2'],
    ['Sudut di sekitar titik', ['Sudut di sekitar satu titik berjumlah 360°.', 'Sudut pada garis lurus berjumlah 180°.'], '5M3'],
  ]);
  add('5N', 'Rata-rata adalah jumlah semua data dibagi banyaknya data.', [
    ['Menghitung rata-rata', ['Jumlahkan semua data.', 'Bagi dengan banyak data.'], '5N1'],
    ['Jumlah dari rata-rata', ['Jumlah = rata-rata × banyak data.', 'Gunakan ini untuk mencari data yang hilang.'], '5N2', 'Singapore Math 5B memakai model batang: semua batang diratakan sama tinggi untuk menunjukkan rata-rata.'],
  ]);
  add('5O', 'Satuan desimal, laju, dan waktu sering muncul dalam soal sehari-hari.', [
    ['Satuan dengan desimal', ['1,25 kg = 1,25 × 1.000 g = 1.250 g.', '750 mL = 750 ÷ 1.000 L = 0,75 L.'], '5O1'],
    ['Laju', ['Cari nilai untuk 1 satuan lebih dulu (harga 1 kg).', 'Kalikan dengan banyak satuan yang ditanya.'], '5O2', 'Ini metode satuan: dari "banyak" ke "satu", lalu dari "satu" ke "banyak".'],
  ]);

  /* ---------- Kelas 6 ---------- */
  add('6A', 'Pangkat adalah perkalian berulang. Akar adalah kebalikannya.', [
    ['Bilangan berpangkat', ['2⁵ = 2 × 2 × 2 × 2 × 2 = 32.', 'Jangan tertukar: 2⁵ bukan 2 × 5.'], '6A1'],
    ['Kuadrat dan akar kuadrat', ['7² = 7 × 7 = 49.', '√49 = 7, karena 7 × 7 = 49.'], '6A2'],
    ['Urutan operasi dengan pangkat', ['Kurung → pangkat → kali/bagi → tambah/kurang.'], '6A4'],
  ]);
  add('6B', 'Setiap bilangan komposit bisa ditulis sebagai perkalian bilangan prima.', [
    ['Faktorisasi prima', ['Buat pohon faktor: bagi terus dengan bilangan prima terkecil.', 'Tulis semua faktor prima: 60 = 2 × 2 × 3 × 5.'], '6B1'],
    ['FPB dan KPK tiga bilangan', ['FPB: ambil faktor prima yang ada di semua bilangan, pangkat terkecil.', 'KPK: ambil semua faktor prima, pangkat terbesar.'], '6B2'],
  ]);
  add('6C', 'Membagi pecahan berarti mengali dengan kebalikannya.', [
    ['Membagi pecahan', ['Balik pecahan pembagi: 1/2 menjadi 2/1.', 'Kalikan: 3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 1 1/2.'], '6C1', 'Singapore Math 6A menjelaskannya dengan model: ada berapa 1/2 di dalam 3/4?'],
    ['Mengali desimal', ['Kalikan tanpa koma.', 'Banyak angka di belakang koma hasil = jumlah angka di belakang koma kedua bilangan.'], '6C3'],
    ['Membagi desimal dengan desimal', ['Geser koma kedua bilangan ke kanan sampai pembaginya bilangan bulat.', 'Lalu bagi seperti biasa.'], '6C4'],
  ]);
  add('6D', 'Bilangan bulat termasuk bilangan negatif, seperti suhu di bawah nol.', [
    ['Membandingkan', ['Pada garis bilangan, yang lebih kanan lebih besar.', '−2 lebih besar dari −5.'], '6D1'],
    ['Menjumlah', ['Tambah bilangan positif → bergerak ke kanan.', 'Tambah bilangan negatif → bergerak ke kiri.'], '6D2'],
    ['Mengurangi', ['Mengurangi = menambah lawannya: 3 − (−4) = 3 + 4 = 7.'], '6D3'],
    ['Mengali dan membagi', ['Tanda sama → hasil positif.', 'Tanda berbeda → hasil negatif.'], '6D4'],
  ]);
  add('6E', 'Bidang koordinat empat kuadran memakai bilangan negatif juga.', [
    ['Koordinat empat kuadran', ['x positif → kanan, x negatif → kiri.', 'y positif → atas, y negatif → bawah.', 'Tulis (x, y).'], '6E1'],
    ['Jarak dua titik', ['Jika x sama, jarak = selisih y. Jika y sama, jarak = selisih x.', 'Dari −2 ke 3 jaraknya 5, bukan 1.'], '6E2'],
  ]);
  add('6F', 'Rasio, laju, dan kecepatan dihitung dengan metode satuan.', [
    ['Tabel rasio', ['Setiap kolom adalah kelipatan dari kolom pertama.', 'Kalikan kedua baris dengan bilangan yang sama.'], '6F1'],
    ['Kecepatan, jarak, waktu', ['Jarak = kecepatan × waktu.', 'Kecepatan = jarak ÷ waktu. Waktu = jarak ÷ kecepatan.'], '6F3', 'Singapore Math 6B membahas kecepatan sebagai laju: jarak yang ditempuh dalam 1 satuan waktu.'],
    ['Perbandingan senilai', ['Cari nilai untuk 1 satuan.', 'Kalikan dengan banyak satuan yang ditanya.'], '6F4'],
  ]);
  add('6G', 'Persen dipakai untuk diskon, pajak, dan perbandingan bagian dari keseluruhan.', [
    ['Mencari persen', ['Bagian ÷ keseluruhan × 100%.', '12 dari 48 = 12/48 × 100% = 25%.'], '6G1'],
    ['Diskon dan pajak', ['Diskon mengurangi harga; pajak menambah harga.', 'Harga akhir = harga ± (persen × harga).'], '6G3'],
    ['Mencari keseluruhan', ['Jika 20% = 15, maka 10% = 7,5, dan 100% = 75.'], '6G4', 'Model batang 100%: jika satu bagian diketahui, kalikan untuk mendapat keseluruhan.'],
  ]);
  add('6H', 'Ekspresi aljabar memakai huruf untuk bilangan yang belum diketahui.', [
    ['Nilai ekspresi', ['Ganti setiap huruf dengan bilangannya.', 'Hitung dengan urutan operasi.'], '6H1'],
    ['Suku sejenis', ['Suku sejenis punya huruf yang sama: 3x dan 5x.', 'Jumlahkan angkanya saja: 3x + 5x = 8x.'], '6H3'],
    ['Sifat distributif', ['3(x + 4) = 3 × x + 3 × 4 = 3x + 12.'], '6H4'],
  ]);
  add('6I', 'Persamaan seperti timbangan seimbang: apa yang dilakukan di satu sisi, lakukan juga di sisi lain.', [
    ['Persamaan satu langkah', ['x + 7 = 15 → kurangi 7 di kedua sisi → x = 8.', '3x = 21 → bagi 3 → x = 7.'], '6I1'],
    ['Persamaan dua langkah', ['Hilangkan tambah/kurang dulu, lalu kali/bagi.', '3x + 4 = 19 → 3x = 15 → x = 5.'], '6I2', 'Gambar model batang: 3 batang x ditambah 4 sama dengan 19, lalu cari nilai 1 batang.'],
    ['Pertidaksamaan', ['x > 5: x lebih dari 5 (5 tidak termasuk).', 'x ≥ 5: x lebih dari atau sama dengan 5 (5 termasuk).'], '6I3'],
  ]);
  add('6J', 'Lingkaran punya jari-jari (r) dan diameter (d = 2r). π kira-kira 22/7 atau 3,14.', [
    ['Pasangan sudut', ['Berpelurus = 180°. Berpenyiku = 90°.', 'Sudut bertolak belakang sama besar.'], '6J1'],
    ['Keliling lingkaran', ['Keliling = 2 × π × r = π × d.', 'Pakai π = 22/7 jika r kelipatan 7.'], '6J3'],
    ['Luas lingkaran', ['Luas = π × r × r.', 'Jangan tertukar dengan keliling: luas memakai r × r.'], '6J4'],
  ]);
  add('6K', 'Luas permukaan adalah jumlah luas semua sisi bangun ruang.', [
    ['Jajargenjang dan trapesium', ['Jajargenjang: alas × tinggi.', 'Trapesium: (jumlah sisi sejajar) × tinggi ÷ 2.'], '6K1'],
    ['Luas permukaan', ['Kubus: 6 × sisi × sisi.', 'Balok: 2 × (p×l + p×t + l×t).'], '6K2', 'Bayangkan jaring-jaringnya: buka kotak menjadi 6 persegi panjang, lalu jumlahkan luasnya.'],
  ]);
  add('6L', 'Mean, median, dan modus meringkas data. Diagram lingkaran menunjukkan bagian dari keseluruhan.', [
    ['Mean (rata-rata)', ['Jumlah semua data ÷ banyak data.'], '6L1'],
    ['Median', ['Urutkan data. Ambil nilai tengah.', 'Jika banyak data genap, rata-ratakan dua nilai tengah.'], '6L2'],
    ['Diagram lingkaran', ['Setiap potongan menunjukkan persen dari keseluruhan.', 'Banyak = persen × total.'], '6L4'],
  ]);
  add('6M', 'Peluang menunjukkan seberapa mungkin suatu kejadian terjadi, dari 0 (mustahil) sampai 1 (pasti).', [
    ['Pasti, mungkin, mustahil', ['Pasti: selalu terjadi. Mustahil: tidak mungkin terjadi.', 'Mungkin: bisa terjadi, bisa tidak.'], '6M1'],
    ['Peluang sebagai pecahan', ['Peluang = banyak hasil yang diinginkan ÷ banyak semua hasil.', 'Sederhanakan pecahannya.'], '6M2'],
  ]);
  add('6N', 'Literasi keuangan: bunga, untung-rugi, dan memilih harga terbaik.', [
    ['Bunga tabungan', ['Bunga per tahun = persen bunga × tabungan.', 'Bunga tunggal selama t tahun = t × bunga per tahun.'], '6N1'],
    ['Untung dan rugi', ['Untung = harga jual − harga beli (jika jual lebih tinggi).', 'Rugi = harga beli − harga jual.'], '6N2'],
  ]);
})();
