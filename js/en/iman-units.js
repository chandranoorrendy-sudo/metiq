/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
﻿/* Metiq - tambahan lapisan iman: zakat, waris, shalat, dan bilangan dalam Al-Qur'an.
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
        id: '2Q6', name: 'Rakaat in a day', gen() {
          const SH = [['Fajr', 2], ['Dhuhr', 4], ['Asr', 4], ['Maghrib', 3], ['Isha', 4]];
          const total = SH.reduce((a, b) => a + b[1], 0);
          return inp(`There are five obligatory daily prayers: Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, and Isha 4 rakaat. How many rakaat altogether in a day?`, total,
            `Add them all: ${SH.map((x) => x[1]).join(' + ')} = <b>${total}</b> rakaat.`, { meta: { kind: 'count' } });
        },
      },
      {
        id: '2Q7', name: 'A traveler\'s prayer rakaat', gen() {
          const bisa = ['Dhuhr', 'Asr', 'Isha'];
          const dipakai = shuffle(bisa).slice(0, r(1, 3));
          const total = dipakai.length * 2;
          return inp(`A traveler may shorten four-rakaat prayers to two rakaat. They shorten the ${dipakai.join(' and ')} prayer. How many rakaat altogether?`, total,
            `Each prayer becomes 2 rakaat. ${dipakai.length} prayers: ${dipakai.length} × 2 = <b>${total}</b> rakaat.`, { meta: { op: 'x', a: dipakai.length, b: 2 } });
        },
      },
      {
        id: '2Q8', name: 'One good deed rewarded tenfold', gen() {
          const n = r(3, 9);
          return inp(`In the Qur'an, one good deed is rewarded tenfold (QS Al-An'am 6:160). If you write ${n} good deeds, how many rewards are promised?`, n * 10,
            `Each good deed is rewarded 10: ${n} × 10 = <b>${n * 10}</b>.`, { meta: { op: 'x', a: n, b: 10 } });
        },
      },
      {
        id: '2Q9', name: 'Seven ears of a hundred seeds', gen() {
          return inp(`One planted seed grows into 7 ears, and each ear has 100 seeds (QS Al-Baqarah 2:261). How many seeds altogether?`, 700,
            `7 ears × 100 seeds = <b>700</b> seeds.`, { meta: { op: 'x', a: 7, b: 100 } });
        },
      }
    );
    C.register([duaQ]);
  }

  /* ---------- Kelas 2: zakat dan sedekah (dekat bab Uang) ---------- */
  C.register([{
    id: '2Z', grade: 2, iman: true, name: 'Zakat and charity', icon: '🤲', color: '#0ea5a0',
    sg: '- (local context: multiplication, division, and subtraction)', ixl: '-', km: 'Numbers (zakat context)',
    tip: 'Calculate together with your child: zakat fitrah of 2.5 kg of rice for each person at home, then weigh or divide the rice together.',
    skills: [
      {
        id: '2Z1', name: 'A family\'s zakat fitrah', gen() {
          const n = pick([2, 4, 6]), kg = 2.5 * n;
          return inp(`Zakat fitrah is 2.5 kg of rice per person. ${pick(NAMA)}'s family has ${n} people. How many kg of rice is the family's zakat? (write the number only)`, kg,
            `2.5 kg per person. For ${n} people: 2.5 × ${n} = <b>${kg}</b> kg.`, { meta: { kind: 'count' } });
        },
      },
      {
        id: '2Z2', name: 'Dividing zakat rice', gen() {
          const per = r(2, 4), total = 8 * per;
          return inp(`There are ${total} bags of zakat rice. The rice is shared equally among 8 groups of recipients. How many bags for each group?`, per,
            `Give them out one by one until gone: ${total} ÷ 8 = <b>${per}</b> bags. Check: 8 × ${per} = ${total}.`, { meta: { op: '/', a: total, b: 8 } });
        },
      },
      {
        id: '2Z3', name: 'Charity from pocket money', gen() {
          const have = pick([5000, 10000, 20000]), give = pick([1000, 2000, 5000].filter((x) => x < have));
          return inp(`${pick(NAMA)}'s pocket money is ${rp(have)}. ${rp(give)} is set aside for charity. How many rupiah are left? (write the number only)`, have - give,
            `Starting money minus charity: ${rp(have)} − ${rp(give)} = <b>${rp(have - give)}</b>.`, { unit: 'Rp', meta: { op: '-', a: have, b: give } });
        },
      },
    ],
  }]);

  /* ---------- Kelas 4: bilangan yang disebut dalam Al-Qur'an ---------- */
  C.register([{
    id: '4Q', grade: 4, iman: true, name: "Numbers in the Qur'an", icon: '📖', color: '#0f9b8e',
    sg: '- (local context: large numbers and fractions)', ixl: '-', km: 'Numbers (Qur\'an context)',
    tip: 'Have your child find the surah number in the mushaf, then calculate together. Verse text and interpretation are reviewed by a teacher or ustadz.',
    skills: [
      {
        id: '4Q1', name: 'Three hundred years plus nine', gen() {
          return inp(`The Qur'an says the people of the cave stayed 300 years plus 9 years (QS Al-Kahf 18:25). How many years altogether?`, 309,
            `300 + 9 = <b>309</b> years.`, { meta: { op: '+', a: 300, b: 9 } });
        },
      },
      {
        id: '4Q2', name: 'Nine hundred fifty years', gen() {
          return inp(`Prophet Nuh preached for 950 years (QS Al-Ankabut 29:14). How many more years to reach exactly 1,000 years?`, 50,
            `1,000 − 950 = <b>50</b> years.`, { meta: { op: '-', a: 1000, b: 950 } });
        },
      },
      {
        id: '4Q3', name: 'Forty nights', gen() {
          const done = r(18, 34);
          return inp(`Prophet Musa promised to worship for 40 nights (QS Al-Baqarah 2:51). If ${done} nights have passed, how many nights remain?`, 40 - done,
            `40 − ${done} = <b>${40 - done}</b> nights.`, { meta: { op: '-', a: 40, b: done } });
        },
      },
      {
        id: '4Q4', name: 'Parts of the night', gen() {
          const p = pick([['one half', 2], ['one third', 3], ['one quarter', 4]]);
          return inp(`A night has 24 hours. The Qur'an mentions people who worship for ${p[0]} of the night (QS Al-Muzzammil 73:3–4). How many hours is ${p[0]} of the night?`, 24 / p[1],
            `24 hours divided into ${p[1]} equal parts: 24 ÷ ${p[1]} = <b>${24 / p[1]}</b> hours.`, { meta: { op: '/', a: 24, b: p[1] } });
        },
      },
    ],
  }]);

  /* ---------- Kelas 5: zakat mal dan persen (dekat bab Persen) ---------- */
  C.register([{
    id: '5Z', grade: 5, iman: true, name: 'Zakat mal and percents', icon: '💰', color: '#d99a00',
    sg: '- (local context: percents and differences)', ixl: '-', km: 'Numbers (zakat context)',
    tip: 'Zakat mal of 2.5% is paid once wealth reaches the nisab and has been owned for one year (haul). Have your child calculate 2.5% of their own savings.',
    skills: [
      {
        id: '5Z1', name: 'Zakat of 2.5 percent of wealth', gen() {
          const harta = pick([2000000, 4000000, 6000000, 8000000]), zakat = harta * 0.025;
          return inp(`Zakat mal is 2.5% of wealth. ${pick(NAMA)}'s wealth of ${rp(harta)} has reached the nisab and been held for a full year. How many rupiah is the zakat? (write the number only)`, zakat,
            `2.5% = 2.5/100. ${rp(harta)} ÷ 100 = ${rp(harta / 100)}, then × 2.5 = <b>${rp(zakat)}</b>.`, { unit: 'Rp', meta: { kind: 'percent' } });
        },
      },
      {
        id: '5Z2', name: 'Gold nisab of 85 grams', gen() {
          const punya = pick([60, 70, 95, 120, 150]);
          const lebih = punya - 85;
          return lebih > 0
            ? inp(`The gold nisab is 85 grams. Mrs. ${pick(NAMA)} owns ${punya} grams of gold. How many grams over the nisab is that?`, lebih,
              `${punya} − 85 = <b>${lebih}</b> grams.`, { meta: { op: '-', a: punya, b: 85 } })
            : inp(`The gold nisab is 85 grams. Mrs. ${pick(NAMA)} owns ${punya} grams of gold. How many more grams to reach the nisab?`, 85 - punya,
              `85 − ${punya} = <b>${85 - punya}</b> grams.`, { meta: { op: '-', a: 85, b: punya } });
        },
      },
      {
        id: '5Z3', name: 'One-year haul', gen() {
          const sudah = r(4, 11);
          return inp(`Zakat mal is paid after wealth has been owned for one haul, which is 12 months. The wealth has been owned for ${sudah} months. How many more months?`, 12 - sudah,
            `12 − ${sudah} = <b>${12 - sudah}</b> months.`, { meta: { op: '-', a: 12, b: sudah } });
        },
      },
      {
        id: '5Z4', name: 'Income zakat', gen() {
          const gaji = pick([3000000, 4000000, 5000000]);
          return inp(`A worker sets aside income zakat of 2.5% of ${rp(gaji)}. How many rupiah is the zakat? (write the number only)`, gaji * 0.025,
            `${rp(gaji)} ÷ 100 = ${rp(gaji / 100)}, then × 2.5 = <b>${rp(gaji * 0.025)}</b>.`, { unit: 'Rp', meta: { kind: 'percent' } });
        },
      },
    ],
  }]);

  /* ---------- Kelas 6: waris sebagai latihan pecahan ---------- */
  C.register([{
    id: '6W', grade: 6, iman: true, name: 'Inheritance: fraction practice', icon: '⚖️', color: '#8e7cc3',
    sg: '- (local context: fractions and remainders)', ixl: '-', km: 'Numbers (inheritance context)',
    tip: 'This chapter only practices fraction arithmetic. Actual inheritance division must be done by a faraid expert or ustadz, because some shares can increase (aul) or shift.',
    skills: [
      {
        id: '6W1', name: 'A share of one half', gen() {
          const harta = pick([80000000, 120000000, 160000000]);
          return inp(`An inheritance of ${rp(harta)}. One heir receives a share of 1/2. How many rupiah is the share? (write the number only)`, harta / 2,
            `1/2 means divided into 2 equal parts: ${rp(harta)} ÷ 2 = <b>${rp(harta / 2)}</b>.`, { unit: 'Rp', meta: { kind: 'fraction' } });
        },
      },
      {
        id: '6W2', name: 'Shares of a quarter and an eighth', gen() {
          const harta = pick([80000000, 120000000, 160000000]), d = pick([4, 8]);
          return inp(`An inheritance of ${rp(harta)}. One heir receives a share of 1/${d}. How many rupiah is the share? (write the number only)`, harta / d,
            `1/${d} means divided into ${d} equal parts: ${rp(harta)} ÷ ${d} = <b>${rp(harta / d)}</b>.`, { unit: 'Rp', meta: { kind: 'fraction' } });
        },
      },
      {
        id: '6W3', name: 'The remainder after shares are taken', gen() {
          const harta = pick([120000000, 160000000, 240000000]);
          const sisa = harta / 4;
          return inp(`An inheritance of ${rp(harta)}. Shares of 1/2 and 1/4 are set. How many rupiah is left? (write the number only)`, sisa,
            `1/2 + 1/4 = 3/4. The remainder is 1/4. ${rp(harta)} ÷ 4 = <b>${rp(sisa)}</b>.`, { unit: 'Rp', meta: { kind: 'fraction' } });
        },
      },
      {
        id: '6W4', name: 'Shares must add up to one', gen() {
          const a = pick(['1/4', '1/3', '2/3']);
          const kurang = { '1/4': '3/4', '1/3': '2/3', '2/3': '1/3' };
          const jawab = kurang[a];
          const sisa = shuffle(['1/2', '1/3', '1/4', '2/3', '3/4', '1/6'].filter((x) => x !== jawab)).slice(0, 3);
          return ch(`An inheritance is divided into shares. If one share is ${a}, what other share makes the total exactly 1?`, shuffle([jawab, ...sisa]), jawab,
            `${a} + ${jawab} = 1. All shares must add up to exactly 1.`, { meta: { kind: 'fraction' } });
        },
      },
    ],
  }]);
})();
