// Bagian yang tidak bisa diterjemahkan kata per kata: format angka dan bilangan dalam kata.
module.exports = {
  all: [[/'id-ID'/g, "'en-US'"], [/localeCompare\(([^,()]+(?:\.[^,()]+)*), 'id'\)/g, "localeCompare($1, 'en')"], [/\.replace\('\.', ','\)/g, ''], [/keys: \[','\]/g, "keys: ['.']"], [/'(\d+),(\d+)'/g, "'$1.$2'"], [/\.replace\(\/\\.\/g, ''\)\.replace\(',', '\.'\)/g, ".replace(/,/g, '')"], [/\.replace\(',', '\.'\)/g, '']],
  exact: [
    ['olimpiade.js', "'N', 1, 'KPK', ()", "'N', 1, 'LCM', ()"],
    ['games.js', "'GENAP'", "'EVEN'"], ['games.js', "'GANJIL'", "'ODD'"], ['games.js', "'LANCIP'", "'ACUTE'"], ['games.js', "'TUMPUL'", "'OBTUSE'"],
    ['kit-hs.js', "'∫ dari $2 sampai $1 '", "'∫ from $2 to $1 '"], ['kit-hs.js', "' pangkat $1'", "' to the power of $1'"],
    ['app.js', ': latihan bersama"', ': practice together"'],
    ['curriculum.js', 'tags[`pukul ${nx}.30`]', 'tags[`${nx}:30`]'],
    ['jobs-real.js', "['SDM', 1]", "['HR', 1]"],
    ['lessons-b.js', "['FPB', [", "['GCF', ["], ['lessons-b.js', "['KPK', [", "['LCM', ["],
    ['jobs.js', "style: 'Bantu pekerja dengan gambar dan suara'", "style: 'Help workers with pictures and sound'"],
    ['jobs.js', "style: 'Satu tugas singkat'", "style: 'One short task'"],
    ['jobs.js', "style: 'Tugas dua atau tiga langkah'", "style: 'Tasks with two or three steps'"],
    ['jobs.js', "style: 'Keputusan nyata di tempat kerja'", "style: 'Real decisions at work'"],
    ['jobs.js', "style: 'Masalah nyata kecil, beberapa langkah'", "style: 'Small real problems, several steps'"],
    ['grade4.js', String.raw`kata(+x.replace(/\./g, ''))`, "kata(+x.replace(/,/g, ''))"],
    ['grade4.js', 'x = `${d[0]}${d[1]},${d[2]}${d[3]}`', 'x = `${d[0]}${d[1]}.${d[2]}${d[3]}`'],
    ['app.js', String.raw`.replace(/[.\s]/g, '');`, String.raw`.replace(/[,\s]/g, '');`],
    ['app.js', "{ ',': ',', '.': ','", "{ ',': '.', '.': '.'"],
    ['app.js', "['−', ',', '/'].map((k) => `<button class=\"mq-key\" data-act=\"jkey\"", "['−', '.', '/'].map((k) => `<button class=\"mq-key\" data-act=\"jkey\""],
    ['app.js', "/^id([-_]|$)/i.test(x.lang)", "/^en([-_]|$)/i.test(x.lang)"],
    ['app.js', String.raw`.replace(/−/g, ' kurang ').replace(/\+/g, ' tambah ').replace(/=/g, ' sama dengan ').replace(/\?/g, ' berapa? ').replace(/×/g, ' kali ')`, String.raw`.replace(/−/g, ' minus ').replace(/\+/g, ' plus ').replace(/=/g, ' equals ').replace(/×/g, ' times ')`],
    ['app.js', "`audio/kerja/${JM.m.key}-${part}.mp3`", "`audio/en/kerja/${JM.m.key}-${part}.mp3`"],
    ['stories-tk.js', "const A = (p) => `audio/${p}.mp3`;", "const A = (p) => `audio/en/${p}.mp3`;"],
    ['games.js', "big ? 'BESAR' : 'KECIL'", "big ? 'GREATER' : 'LESS'"],
    ['curriculum.js', 'Jarum pendek ada di antara ${h} dan ${nx}, jadi masih jam ${h}. <b>Pukul ${h}.30</b> atau "setengah ${kata(nx)}".`', 'The short hand is between ${h} and ${nx}, so the hour is still ${h}. <b>${h}:30</b> or "half past ${kata(h)}".`'],
    ['curriculum.js', "tags[`setengah ${kata(h)}`] = 'setengah-jam'; return ch(`Pukul ${h}.30 disebut juga...`, shuffle([`setengah ${kata(nx)}`, `setengah ${kata(h)}`, `${kata(h)} tepat`, `${kata(nx)} tepat`]), `setengah ${kata(nx)}`, `Pukul ${h}.30 adalah setengah jalan menuju pukul ${nx}, jadi disebut <b>setengah ${kata(nx)}</b>.`", "tags[`half past ${kata(nx)}`] = 'setengah-jam'; return ch(`${h}:30 is also called...`, shuffle([`half past ${kata(nx)}`, `half past ${kata(h)}`, `${kata(h)} o'clock`, `${kata(nx)} o'clock`]), `half past ${kata(h)}`, `${h}:30 is halfway from ${h} o'clock to ${nx} o'clock, so it's called <b>half past ${kata(h)}</b>.`"],
    ['games.js', '`setengah ${(h % 12) + 1}`', '`half past ${h}`'],
    ['curriculum.js', `  const SATUAN = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  function kata(n) {
    if (n < 10) return SATUAN[n];
    if (n === 10) return 'sepuluh';
    if (n === 11) return 'sebelas';
    if (n < 20) return SATUAN[n - 10] + ' belas';
    if (n >= 1e6) { const j = Math.floor(n / 1e6), rest = n % 1e6; return kata(j) + ' juta' + (rest ? ' ' + kata(rest) : ''); }
    if (n >= 1000) { const k = Math.floor(n / 1000), rest = n % 1000; return (k === 1 ? 'seribu' : kata(k) + ' ribu') + (rest ? ' ' + kata(rest) : ''); }
    if (n >= 100) { const h = Math.floor(n / 100), rest = n % 100; return (h === 1 ? 'seratus' : SATUAN[h] + ' ratus') + (rest ? ' ' + kata(rest) : ''); }
    const t = Math.floor(n / 10), o = n % 10;
    return SATUAN[t] + ' puluh' + (o ? ' ' + SATUAN[o] : '');
  }`, `  const SATUAN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const PULUHAN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function kata(n) {
    if (n < 20) return SATUAN[n];
    if (n >= 1e6) { const j = Math.floor(n / 1e6), rest = n % 1e6; return kata(j) + ' million' + (rest ? ' ' + kata(rest) : ''); }
    if (n >= 1000) { const k = Math.floor(n / 1000), rest = n % 1000; return kata(k) + ' thousand' + (rest ? ' ' + kata(rest) : ''); }
    if (n >= 100) { const h = Math.floor(n / 100), rest = n % 100; return SATUAN[h] + ' hundred' + (rest ? ' ' + kata(rest) : ''); }
    const t = Math.floor(n / 10), o = n % 10;
    return PULUHAN[t] + (o ? '-' + SATUAN[o] : '');
  }`],
  ],
};
