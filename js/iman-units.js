/* Metiq - tambahan lapisan iman: zakat, waris, shalat, dan bilangan dalam Al-Qur'an.
 *
 * Semua bab di bawah ini hanya muncul jika kelas memakai konteks islami (lihat C.setKonteks).
 * Isinya soal matematika biasa dengan konteks ibadah. Tidak ada teks ayat atau hadits yang
 * ditulis mesin: nomor surah hanya rujukan, teks dan tafsirnya diisi pemeriksa di js/iman.js.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, inp, ch, V, rp, numOpts, NAMA } = C.kit;

  /* ---------- 2Q: tambahan soal shalat dan hitungan dalam Al-Qur'an ---------- */
  const duaQ = C.imanUnits.find((u) => u.id === '2Q');
  if (duaQ) {
    duaQ.skills.push(
      {
        id: '2Q6', name: 'Jumlah rakaat sehari', gen() {
          const SH = [['Subuh', 2], ['Zuhur', 4], ['Asar', 4], ['Magrib', 3], ['Isya', 4]];
          const total = SH.reduce((a, b) => a + b[1], 0);
          return inp(`Shalat wajib sehari ada lima: Subuh 2, Zuhur 4, Asar 4, Magrib 3, dan Isya 4 rakaat. Berapa rakaat seluruhnya dalam sehari?`, total,
            `Jumlahkan semuanya: ${SH.map((x) => x[1]).join(' + ')} = <b>${total}</b> rakaat.`, { meta: { kind: 'count' } });
        },
      },
      {
        id: '2Q7', name: 'Rakaat shalat musafir', gen() {
          const bisa = ['Zuhur', 'Asar', 'Isya'];
          const dipakai = shuffle(bisa).slice(0, r(1, 3));
          const total = dipakai.length * 2;
          return inp(`Musafir boleh mengqashar shalat empat rakaat menjadi dua rakaat. Ia mengqashar shalat ${dipakai.join(' dan ')}. Berapa rakaat seluruhnya?`, total,
            `Setiap shalat menjadi 2 rakaat. ${dipakai.length} shalat: ${dipakai.length} × 2 = <b>${total}</b> rakaat.`, { meta: { op: 'x', a: dipakai.length, b: 2 } });
        },
      },
      {
        id: '2Q8', name: 'Satu kebaikan dibalas sepuluh', gen() {
          const n = r(3, 9);
          return inp(`Dalam Al-Qur'an, satu kebaikan dibalas sepuluh kali lipat (QS Al-An'am 6:160). Jika kamu menulis ${n} kebaikan, berapa balasan yang dijanjikan?`, n * 10,
            `Setiap kebaikan dibalas 10: ${n} × 10 = <b>${n * 10}</b>.`, { meta: { op: 'x', a: n, b: 10 } });
        },
      },
      {
        id: '2Q9', name: 'Tujuh tangkai seratus biji', gen() {
          return inp(`Satu biji yang ditanam tumbuh menjadi 7 tangkai, dan setiap tangkai berisi 100 biji (QS Al-Baqarah 2:261). Berapa biji seluruhnya?`, 700,
            `7 tangkai × 100 biji = <b>700</b> biji.`, { meta: { op: 'x', a: 7, b: 100 } });
        },
      }
    );
    C.register([duaQ]);
  }

  /* ---------- Kelas 2: zakat dan sedekah (dekat bab Uang) ---------- */
  C.register([{
    id: '2Z', grade: 2, iman: true, name: 'Zakat dan sedekah', icon: '🤲', color: '#0ea5a0',
    sg: '- (konteks lokal: perkalian, pembagian, dan pengurangan)', ixl: '-', km: 'Bilangan (konteks zakat)',
    tip: 'Hitung bersama anak: zakat fitrah 2,5 kg beras untuk setiap orang di rumah, lalu timbang atau bagi berasnya bersama-sama.',
    skills: [
      {
        id: '2Z1', name: 'Zakat fitrah satu keluarga', gen() {
          const n = pick([2, 4, 6]), kg = 2.5 * n;
          return inp(`Zakat fitrah besarnya 2,5 kg beras untuk setiap orang. Keluarga ${pick(NAMA)} berjumlah ${n} orang. Berapa kg beras zakat keluarganya? (tulis angkanya saja)`, kg,
            `2,5 kg untuk tiap orang. Untuk ${n} orang: 2,5 × ${n} = <b>${kg}</b> kg.`, { meta: { kind: 'count' } });
        },
      },
      {
        id: '2Z2', name: 'Membagi beras zakat', gen() {
          const per = r(2, 4), total = 8 * per;
          return inp(`Ada ${total} kantong beras zakat. Beras dibagikan sama rata kepada 8 golongan penerima zakat. Berapa kantong untuk setiap golongan?`, per,
            `Bagikan satu per satu sampai habis: ${total} ÷ 8 = <b>${per}</b> kantong. Periksa: 8 × ${per} = ${total}.`, { meta: { op: '/', a: total, b: 8 } });
        },
      },
      {
        id: '2Z3', name: 'Sedekah dari uang jajan', gen() {
          const have = pick([5000, 10000, 20000]), give = pick([1000, 2000, 5000].filter((x) => x < have));
          return inp(`Uang jajan ${pick(NAMA)} ${rp(have)}. Ia menyisihkan ${rp(give)} untuk sedekah. Berapa rupiah sisa uangnya? (tulis angkanya saja)`, have - give,
            `Uang awal dikurangi sedekah: ${rp(have)} − ${rp(give)} = <b>${rp(have - give)}</b>.`, { unit: 'Rp', meta: { op: '-', a: have, b: give } });
        },
      },
    ],
  }]);

  /* ---------- Kelas 4: bilangan yang disebut dalam Al-Qur'an ---------- */
  C.register([{
    id: '4Q', grade: 4, iman: true, name: "Bilangan dalam Al-Qur'an", icon: '📖', color: '#0f9b8e',
    sg: '- (konteks lokal: bilangan besar dan pecahan)', ixl: '-', km: 'Bilangan (konteks Al-Qur\'an)',
    tip: 'Ajak anak mencari nomor surahnya di mushaf, lalu hitung bersama. Teks dan tafsir ayat diperiksa guru atau ustadz.',
    skills: [
      {
        id: '4Q1', name: 'Tiga ratus tahun ditambah sembilan', gen() {
          return inp(`Al-Qur'an menyebut penghuni gua tinggal 300 tahun ditambah 9 tahun (QS Al-Kahfi 18:25). Berapa tahun seluruhnya?`, 309,
            `300 + 9 = <b>309</b> tahun.`, { meta: { op: '+', a: 300, b: 9 } });
        },
      },
      {
        id: '4Q2', name: 'Sembilan ratus lima puluh tahun', gen() {
          return inp(`Nabi Nuh berdakwah selama 950 tahun (QS Al-Ankabut 29:14). Berapa tahun lagi agar genap 1.000 tahun?`, 50,
            `1.000 − 950 = <b>50</b> tahun.`, { meta: { op: '-', a: 1000, b: 950 } });
        },
      },
      {
        id: '4Q3', name: 'Empat puluh malam', gen() {
          const done = r(18, 34);
          return inp(`Nabi Musa berjanji beribadah 40 malam (QS Al-Baqarah 2:51). Jika ${done} malam sudah dilalui, berapa malam lagi?`, 40 - done,
            `40 − ${done} = <b>${40 - done}</b> malam.`, { meta: { op: '-', a: 40, b: done } });
        },
      },
      {
        id: '4Q4', name: 'Bagian malam', gen() {
          const p = pick([['seperdua', 2], ['sepertiga', 3], ['seperempat', 4]]);
          return inp(`Satu malam ada 24 jam. Al-Qur'an menyebut orang yang beribadah ${p[0]} malam (QS Al-Muzzammil 73:3–4). Berapa jam ${p[0]} malam?`, 24 / p[1],
            `24 jam dibagi ${p[1]} bagian sama besar: 24 ÷ ${p[1]} = <b>${24 / p[1]}</b> jam.`, { meta: { op: '/', a: 24, b: p[1] } });
        },
      },
    ],
  }]);

  /* ---------- Kelas 5: zakat mal dan persen (dekat bab Persen) ---------- */
  C.register([{
    id: '5Z', grade: 5, iman: true, name: 'Zakat mal dan persen', icon: '💰', color: '#d99a00',
    sg: '- (konteks lokal: persen dan selisih)', ixl: '-', km: 'Bilangan (konteks zakat)',
    tip: 'Zakat mal 2,5% dikeluarkan setelah harta mencapai nisab dan dimiliki satu tahun (haul). Ajak anak menghitung 2,5% dari uang tabungannya sendiri.',
    skills: [
      {
        id: '5Z1', name: 'Zakat 2,5 persen dari harta', gen() {
          const harta = pick([2000000, 4000000, 6000000, 8000000]), zakat = harta * 0.025;
          return inp(`Zakat mal besarnya 2,5% dari harta. Harta ${pick(NAMA)} ${rp(harta)} sudah mencapai nisab dan cukup satu tahun. Berapa rupiah zakatnya? (tulis angkanya saja)`, zakat,
            `2,5% = 2,5/100. ${rp(harta)} ÷ 100 = ${rp(harta / 100)}, lalu × 2,5 = <b>${rp(zakat)}</b>.`, { unit: 'Rp', meta: { kind: 'percent' } });
        },
      },
      {
        id: '5Z2', name: 'Nisab emas 85 gram', gen() {
          const punya = pick([60, 70, 95, 120, 150]);
          const lebih = punya - 85;
          return lebih > 0
            ? inp(`Nisab emas adalah 85 gram. Ibu ${pick(NAMA)} memiliki emas ${punya} gram. Berapa gram kelebihan dari nisab?`, lebih,
              `${punya} − 85 = <b>${lebih}</b> gram.`, { meta: { op: '-', a: punya, b: 85 } })
            : inp(`Nisab emas adalah 85 gram. Ibu ${pick(NAMA)} memiliki emas ${punya} gram. Berapa gram lagi agar mencapai nisab?`, 85 - punya,
              `85 − ${punya} = <b>${85 - punya}</b> gram.`, { meta: { op: '-', a: 85, b: punya } });
        },
      },
      {
        id: '5Z3', name: 'Haul satu tahun', gen() {
          const sudah = r(4, 11);
          return inp(`Zakat mal dikeluarkan setelah harta dimiliki selama satu haul, yaitu 12 bulan. Harta sudah dimiliki ${sudah} bulan. Berapa bulan lagi?`, 12 - sudah,
            `12 − ${sudah} = <b>${12 - sudah}</b> bulan.`, { meta: { op: '-', a: 12, b: sudah } });
        },
      },
      {
        id: '5Z4', name: 'Zakat penghasilan', gen() {
          const gaji = pick([3000000, 4000000, 5000000]);
          return inp(`Seorang pekerja menyisihkan zakat penghasilan 2,5% dari ${rp(gaji)}. Berapa rupiah zakatnya? (tulis angkanya saja)`, gaji * 0.025,
            `${rp(gaji)} ÷ 100 = ${rp(gaji / 100)}, lalu × 2,5 = <b>${rp(gaji * 0.025)}</b>.`, { unit: 'Rp', meta: { kind: 'percent' } });
        },
      },
    ],
  }]);

  /* ---------- Kelas 6: waris sebagai latihan pecahan ---------- */
  C.register([{
    id: '6W', grade: 6, iman: true, name: 'Waris: latihan pecahan', icon: '⚖️', color: '#8e7cc3',
    sg: '- (konteks lokal: pecahan dan sisa)', ixl: '-', km: 'Bilangan (konteks waris)',
    tip: 'Bab ini hanya melatih hitungan pecahan. Pembagian waris yang sebenarnya harus dilakukan ahli faraid atau ustadz, karena ada bagian yang bisa bertambah (aul) atau bergeser.',
    skills: [
      {
        id: '6W1', name: 'Bagian seperdua', gen() {
          const harta = pick([80000000, 120000000, 160000000]);
          return inp(`Harta warisan ${rp(harta)}. Salah satu ahli waris mendapat bagian 1/2. Berapa rupiah bagiannya? (tulis angkanya saja)`, harta / 2,
            `1/2 berarti dibagi 2 sama besar: ${rp(harta)} ÷ 2 = <b>${rp(harta / 2)}</b>.`, { unit: 'Rp', meta: { kind: 'fraction' } });
        },
      },
      {
        id: '6W2', name: 'Bagian seperempat dan seperdelapan', gen() {
          const harta = pick([80000000, 120000000, 160000000]), d = pick([4, 8]);
          return inp(`Harta warisan ${rp(harta)}. Salah satu ahli waris mendapat bagian 1/${d}. Berapa rupiah bagiannya? (tulis angkanya saja)`, harta / d,
            `1/${d} berarti dibagi ${d} sama besar: ${rp(harta)} ÷ ${d} = <b>${rp(harta / d)}</b>.`, { unit: 'Rp', meta: { kind: 'fraction' } });
        },
      },
      {
        id: '6W3', name: 'Sisa setelah bagian diambil', gen() {
          const harta = pick([120000000, 160000000, 240000000]);
          const sisa = harta / 4;
          return inp(`Harta warisan ${rp(harta)}. Bagian 1/2 dan 1/4 sudah ditetapkan. Berapa rupiah sisanya? (tulis angkanya saja)`, sisa,
            `1/2 + 1/4 = 3/4. Sisanya 1/4. ${rp(harta)} ÷ 4 = <b>${rp(sisa)}</b>.`, { unit: 'Rp', meta: { kind: 'fraction' } });
        },
      },
      {
        id: '6W4', name: 'Jumlah bagian harus satu', gen() {
          const a = pick(['1/4', '1/3', '2/3']);
          const kurang = { '1/4': '3/4', '1/3': '2/3', '2/3': '1/3' };
          const jawab = kurang[a];
          const sisa = shuffle(['1/2', '1/3', '1/4', '2/3', '3/4', '1/6'].filter((x) => x !== jawab)).slice(0, 3);
          return ch(`Harta warisan dibagi menjadi bagian-bagian. Jika satu bagian sudah ${a}, berapa bagian lagi agar jumlahnya tepat 1?`, shuffle([jawab, ...sisa]), jawab,
            `${a} + ${jawab} = 1. Jumlah semua bagian harus tepat 1.`, { meta: { kind: 'fraction' } });
        },
      },
    ],
  }]);
})();
