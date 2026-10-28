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
