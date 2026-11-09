/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq - materi untuk bab lapisan iman (zakat, bilangan dalam Al-Qur'an, waris).
 * Bentuknya sama dengan js/lessons-a.js: pengantar singkat, lalu subbab berisi langkah
 * dan satu keterampilan contoh. Semua bab di sini hanya tampil di kelas berkonteks islami.
 */
(function () {
  const L = (window.METIQ_LESSONS = window.METIQ_LESSONS || {});
  const add = (id, intro, parts) => { L[id] = { intro, parts: parts.map(([t, steps, ex, sg]) => ({ t, steps, ex, sg })) }; };

  /* ---------- Kelas 2: zakat dan sedekah ---------- */
  add('2Z', 'Zakat is the part of our wealth we give to those in need. We practice calculating it with multiplication, division, and subtraction.', [
    ['Zakat fitrah', ['Zakat fitrah is 2.5 kg of rice per person.', 'Multiply 2.5 kg by the number of people at home.', 'Example: 4 people, so 2.5 × 4 = 10 kg.'], '2Z1'],
    ['Dividing equally', ['Give out the bags of rice one at a time to each group until they\'re gone.', 'Check with multiplication: number of groups × each group\'s share = total.'], '2Z2', 'Bar model: one whole bar divided into 8 equal parts.'],
    ['Charity and money left', ['Starting money minus what\'s given in charity = what\'s left.', 'Charity doesn\'t have to be big; what matters is sincerity and using your own money.'], '2Z3'],
  ]);

  /* ---------- Kelas 4: bilangan dalam Al-Qur'an ---------- */
  add('4Q', "The Qur'an mentions many numbers: 300 years plus 9, 950 years, 40 nights, and parts of the night. We practice reading and calculating them. Surah numbers are included so they can be checked with a teacher; verse text and interpretation aren't written here.", [
    ['Three hundred years plus nine', ['The people of the cave stayed 300 years plus 9 years (QS Al-Kahf 18:25).', 'The word "plus" means add: 300 + 9.', 'The result is 309 years.'], '4Q1'],
    ['Comparing with a thousand', ['Prophet Nuh preached for 950 years (QS Al-Ankabut 29:14).', 'To find how far it is to 1,000, subtract: 1,000 − 950.', 'The result is 50 years.'], '4Q2'],
    ['Forty nights', ['Prophet Musa promised to worship for 40 nights (QS Al-Baqarah 2:51).', 'If some nights have passed, subtract from 40.', 'Example: 28 nights have passed, leaving 40 − 28 = 12 nights.'], '4Q3', 'Bar model: a whole bar of 40 divided into "done" and "left".'],
    ['Parts of the night', ['A night has 24 hours.', 'One half = divided by 2, one third = divided by 3, one quarter = divided by 4.', 'Example: one third of the night = 24 ÷ 3 = 8 hours.'], '4Q4', 'Fractions as division: 1/3 of 24 is the same as 24 ÷ 3.'],
  ]);

  /* ---------- Kelas 5: zakat mal dan persen ---------- */
  add('5Z', 'Zakat mal is paid once wealth reaches the nisab and has been owned for one year (haul). It is 2.5%. We practice calculating percents, differences, and units of time.', [
    ['Two point five percent', ['2.5% is the same as 2.5/100.', 'Divide the wealth by 100, then multiply by 2.5.', 'Example: Rp4,000,000 ÷ 100 = Rp40,000, then × 2.5 = Rp100,000.'], '5Z1', 'Percent as a fraction: 2.5% = 25/1000 = 1/40.'],
    ['Gold nisab', ['The gold nisab is 85 grams.', 'If there\'s more than 85 grams of gold, find the excess by subtracting.', 'If there\'s less, find how much is needed to reach 85 grams.'], '5Z2'],
    ['One-year haul', ['Haul is the period of owning wealth for one year, which is 12 months.', 'Find the remaining months by subtracting: 12 − months passed.'], '5Z3'],
    ['Income zakat', ['Income zakat is also 2.5% of income.', 'Divide by 100, then multiply by 2.5.', 'Example: Rp3,000,000 becomes Rp75,000.'], '5Z4'],
  ]);

  /* ---------- Kelas 6: waris sebagai latihan pecahan ---------- */
  add('6W', 'Inheritance uses the fractions 1/2, 1/4, 1/8, 1/3, 1/6, and 2/3. This chapter only practices the fraction arithmetic. Actual inheritance division must be done by a faraid expert or ustadz, because some shares can increase (aul) or shift.', [
    ['A share of one half', ['1/2 means the wealth is divided into 2 equal parts.', 'Example: Rp120,000,000 ÷ 2 = Rp60,000,000.'], '6W1', 'Fractions as division: 1/2 of a number is that number divided by 2.'],
    ['Quarters and eighths', ['1/4 means divided by 4, 1/8 means divided by 8.', 'The more parts, the smaller each part.', 'Example: Rp80,000,000 ÷ 8 = Rp10,000,000.'], '6W2'],
    ['The remainder after shares are taken', ['Add the parts already set.', 'Remainder = 1 minus the sum of those parts.', 'Example: 1/2 + 1/4 = 3/4, so the remainder is 1/4.'], '6W3'],
    ['Shares must add up to one', ['All parts must add up to exactly 1.', 'Find the fraction that completes it: 1 − the known part.', 'Example: 2/3 + 1/3 = 1.'], '6W4', 'Use fraction circles: the filled part plus the empty part always make one full circle.'],
  ]);
})();
