/* Metiq — lapisan iman (opsional, per kelas).
 * Hanya dipakai jika pengaturan kelas menyalakannya (konteks islami dan/atau adab).
 * Kunci = id bab. Kartu Hikmah di halaman Pelajaran hanya tampil jika verifiedAt terisi.
 *
 * ATURAN: teks Al-Qur'an dan hadits (dalil.ar, dalil.id) TIDAK BOLEH dibuat oleh mesin.
 * Kolom itu sengaja dikosongkan; isi hanya oleh pemeriksa (ustadz/ustadzah) dari sumber
 * yang terpercaya, lalu isi verifiedBy (nama) dan verifiedAt (tanggal, mis. '2026-11-01').
 */
(function () {
  const kosong = () => ({ ref: '', ar: '', id: '' });

  window.METIQ_IMAN = {
    // Bab 2Q: Matematika dalam ibadah
    '2Q': {
      tema: 'Ibadah yang teratur dan terhitung',
      dalil: kosong(),
      ajakan: 'Allah menciptakan waktu dengan teratur. Shalat kita pun punya waktu dan jumlah rakaat yang tetap, jadi kita belajar berhitung dengan tertib.',
      refleksi: 'Berapa rakaat shalat yang sudah kamu kerjakan hari ini? Shalat mana yang paling sering kamu lakukan tepat waktu?',
      adab: 'Sebelum mulai berhitung, rapikan tempat belajar dan duduk dengan sopan.',
      verifiedBy: '',
      verifiedAt: '',
    },
    // Bab 2M: Uang
    '2M': {
      tema: 'Uang sebagai amanah',
      dalil: kosong(),
      ajakan: 'Uang yang kita punya adalah titipan. Kita belajar menghitungnya dengan jujur dan menyisihkan sebagian untuk sedekah.',
      refleksi: 'Jika kamu punya Rp10.000, berapa yang ingin kamu tabung dan berapa yang ingin kamu sedekahkan?',
      adab: 'Hitung uang dengan teliti dan kembalikan uang yang bukan milikmu.',
      verifiedBy: '',
      verifiedAt: '',
    },
    // Bab 2Z: Zakat dan sedekah (kelas 2)
    '2Z': {
      tema: 'Berbagi dengan hitungan yang jujur',
      dalil: kosong(),
      ajakan: 'Zakat fitrah 2,5 kg beras untuk setiap orang. Kita belajar menghitung dan membaginya dengan adil, lalu menimbangnya bersama keluarga.',
      refleksi: 'Siapa saja yang menerima zakat di sekitar rumahmu? Bagaimana beras zakat dibagi agar tidak ada yang terlewat?',
      adab: 'Saat membagikan sedekah, jangan menyebut-nyebut pemberian itu di depan orang lain.',
      verifiedBy: '',
      verifiedAt: '',
    },
    // Bab 4Q: Bilangan dalam Al-Qur'an (kelas 4)
    '4Q': {
      tema: 'Bilangan yang disebut dalam Al-Qur\'an',
      dalil: kosong(),
      ajakan: 'Al-Qur\'an menyebut 300 tahun ditambah 9, 950 tahun, dan 40 malam. Kita belajar membaca bilangan besar dengan teliti.',
      refleksi: 'Bilangan mana yang paling mengejutkan bagimu? Coba cari surahnya di mushaf bersama gurumu.',
      adab: 'Sebelum membuka mushaf, cuci tangan dan duduk dengan rapi.',
      verifiedBy: '',
      verifiedAt: '',
    },
    // Bab 5Z: Zakat mal dan persen (kelas 5)
    '5Z': {
      tema: 'Harta adalah amanah',
      dalil: kosong(),
      ajakan: 'Zakat mal 2,5% dikeluarkan setelah harta mencapai nisab dan dimiliki satu tahun. Kita belajar menghitung persen dengan cermat.',
      refleksi: 'Jika kamu menyisihkan 2,5% dari uang tabunganmu, berapa yang bisa dibagikan?',
      adab: 'Catat harta dengan jujur; jangan melebihkan atau mengurangi angka.',
      verifiedBy: '',
      verifiedAt: '',
    },
    // Bab 6W: Waris sebagai latihan pecahan (kelas 6)
    '6W': {
      tema: 'Pecahan dalam pembagian waris',
      dalil: kosong(),
      ajakan: 'Pembagian waris memakai pecahan 1/2, 1/4, 1/8, 1/3, 1/6, dan 2/3. Kita berlatih hitungannya, bukan menetapkan pembagian yang sebenarnya.',
      refleksi: 'Mengapa semua bagian harus berjumlah tepat 1? Apa yang terjadi jika jumlahnya lebih dari 1?',
      adab: 'Pembagian waris adalah urusan keluarga. Jangan membicarakannya di luar rumah tanpa izin orang tua.',
      verifiedBy: '',
      verifiedAt: '',
    },
  };

  // Mode adab: pujian saat benar dan layar doa sebelum latihan.
  // Kalimat pujian ini ungkapan sehari-hari, bukan kutipan ayat atau hadits.
  // Teks doa (ar/id) wajib diisi pemeriksa; selama kosong, layar doa hanya menampilkan ajakan.
  Object.defineProperty(window.METIQ_IMAN, '_adab', {
    enumerable: false,
    value: {
      pujian: ['Alhamdulillah, benar!', 'Masya Allah, hebat!', 'Barakallahu fiik!', 'Alhamdulillah, tepat sekali!', 'Masya Allah, teliti!'],
      doa: {
        judul: 'Berdoa sebelum belajar',
        ajakan: 'Sebelum belajar, mari berdoa agar Allah memudahkan kita memahami ilmu yang bermanfaat.',
        tombol: 'Aamiin, mulai belajar',
        ref: '', ar: '', id: '',
        verifiedBy: '',
        verifiedAt: '',
      },
    },
  });
})();
