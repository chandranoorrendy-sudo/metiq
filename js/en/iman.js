/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
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
      tema: 'Worship that is orderly and counted',
      dalil: kosong(),
      ajakan: 'Allah created time in an orderly way. Our prayers also have set times and numbers of rakaat, so we learn to count with care.',
      refleksi: 'How many rakaat have you prayed today? Which prayer do you most often do on time?',
      adab: 'Before starting to count, tidy your study place and sit politely.',
      verifiedBy: '',
      verifiedAt: '',
    },
    // Bab 2M: Uang
    '2M': {
      tema: 'Money as a trust',
      dalil: kosong(),
      ajakan: 'The money we have is entrusted to us. We learn to count it honestly and set aside some for charity.',
      refleksi: 'If you had Rp10,000, how much would you save and how much would you give in charity?',
      adab: 'Count money carefully and return money that isn\'t yours.',
      verifiedBy: '',
      verifiedAt: '',
    },
    // Bab 2Z: Zakat dan sedekah (kelas 2)
    '2Z': {
      tema: 'Sharing with honest counting',
      dalil: kosong(),
      ajakan: 'Zakat fitrah is 2.5 kg of rice per person. We learn to calculate and divide it fairly, then weigh it together with family.',
      refleksi: 'Who receives zakat around your home? How is zakat rice divided so no one is missed?',
      adab: 'When giving charity, don\'t mention your gift in front of others.',
      verifiedBy: '',
      verifiedAt: '',
    },
    // Bab 4Q: Bilangan dalam Al-Qur'an (kelas 4)
    '4Q': {
      tema: 'Numbers mentioned in the Qur\'an',
      dalil: kosong(),
      ajakan: 'The Qur\'an mentions 300 years plus 9, 950 years, and 40 nights. We learn to read large numbers carefully.',
      refleksi: 'Which number surprises you most? Try finding its surah in the mushaf with your teacher.',
      adab: 'Before opening the mushaf, wash your hands and sit neatly.',
      verifiedBy: '',
      verifiedAt: '',
    },
    // Bab 5Z: Zakat mal dan persen (kelas 5)
    '5Z': {
      tema: 'Wealth is a trust',
      dalil: kosong(),
      ajakan: 'Zakat mal of 2.5% is paid once wealth reaches the nisab and has been owned for one year. We learn to calculate percents carefully.',
      refleksi: 'If you set aside 2.5% of your savings, how much could be shared?',
      adab: 'Record wealth honestly; don\'t inflate or reduce the numbers.',
      verifiedBy: '',
      verifiedAt: '',
    },
    // Bab 6W: Waris sebagai latihan pecahan (kelas 6)
    '6W': {
      tema: 'Fractions in inheritance',
      dalil: kosong(),
      ajakan: 'Inheritance uses the fractions 1/2, 1/4, 1/8, 1/3, 1/6, and 2/3. We practice the arithmetic; we don\'t determine actual shares.',
      refleksi: 'Why must all the shares add up to exactly 1? What happens if the total is more than 1?',
      adab: 'Inheritance is a family matter. Don\'t discuss it outside the home without your parents\' permission.',
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
      pujian: ['Alhamdulillah, benar!', 'Masya Allah, hebat!', 'Barakallahu fiik!', 'Alhamdulillah, exactly right!', 'Masya Allah, careful work!'],
      doa: {
        judul: 'Praying before learning',
        ajakan: 'Before learning, let\'s pray that Allah makes it easy for us to understand beneficial knowledge.',
        tombol: 'Aamiin, start learning',
        ref: '', ar: '', id: '',
        verifiedBy: '',
        verifiedAt: '',
      },
    },
  });
})();
