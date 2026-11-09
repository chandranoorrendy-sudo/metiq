/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Kurikulum Matematika Kelas 1
 * Disusun dari daftar keterampilan IXL dan alur Singapore Math, dipetakan ke Kurikulum Merdeka (kelas 1 di file ini; kelas 2–6 di grade2.js–grade6.js):
 * pendekatan Konkret–Piktorial–Abstrak, pasangan bilangan (number bond), membuat 10,
 * model batang (bar model), dan pengenalan perkalian/pembagian sebagai kelompok sama banyak.
 * Konteks disesuaikan untuk Indonesia (Rupiah, "setengah empat", nama hari/bulan).
 */
(function () {
  const r = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const range = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };
  const rp = (n) => 'Rp' + n.toLocaleString('en-US');

  // Pilihan angka di sekitar jawaban benar
  function numOpts(ans, min = 0, max = ans + 10, count = 4) {
    const s = new Set([ans]);
    const deltas = shuffle([-1, 1, -2, 2, -3, 3, 10, -10]);
    for (const d of deltas) { if (s.size >= count) break; const v = ans + d; if (v >= min && v <= max) s.add(v); }
    let guard = 0;
    while (s.size < count && guard++ < 50) { const v = r(min, Math.max(max, min + count)); s.add(v); }
    return shuffle([...s]).map(String);
  }

  const SATUAN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const PULUHAN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function kata(n) {
    if (n < 20) return SATUAN[n];
    if (n >= 1e6) { const j = Math.floor(n / 1e6), rest = n % 1e6; return kata(j) + ' million' + (rest ? ' ' + kata(rest) : ''); }
    if (n >= 1000) { const k = Math.floor(n / 1000), rest = n % 1000; return kata(k) + ' thousand' + (rest ? ' ' + kata(rest) : ''); }
    if (n >= 100) { const h = Math.floor(n / 100), rest = n % 100; return SATUAN[h] + ' hundred' + (rest ? ' ' + kata(rest) : ''); }
    const t = Math.floor(n / 10), o = n % 10;
    return PULUHAN[t] + (o ? '-' + SATUAN[o] : '');
  }

  const BENDA = [['🍎', 'apples'], ['⭐', 'bintang'], ['🐟', 'fish'], ['🌸', 'flowers'], ['🚗', 'cars'], ['🎈', 'balloons'],
    ['🐤', 'chicks'], ['🍌', 'bananas'], ['⚽', 'balls'], ['🧁', 'cakes'], ['🥭', 'mangoes'], ['🐱', 'cats'], ['✏️', 'pencils'], ['🍬', 'candies']];
  const NAMA = ['Budi', 'Siti', 'Andi', 'Rina', 'Dewi', 'Agus', 'Girls', 'Rizky', 'Nadia', 'Bayu', 'Lina', 'Fajar', 'Ayu', 'Dimas'];
  const HARI = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const BULAN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const two = () => { const s = shuffle(NAMA); return [s[0], s[1]]; };
  // Konteks islami (pengaturan kelas): nama dan benda diganti di tempat, agar semua file kelas yang memakai NAMA/BENDA ikut berubah
  const NAMA_ISLAMI = ['Ahmad', 'Aisyah', 'Umar', 'Fatimah', 'Ali', 'Khadijah', 'Hasan', 'Maryam', 'Husain', 'Zainab', 'Bilal', 'Hafshah', 'Salman', 'Ruqayyah'];
  const BENDA_ISLAMI = [['🌴', 'dates'], ['⭐', 'bintang'], ['🐟', 'fish'], ['🌸', 'flowers'], ['📖', 'books'], ['🕌', 'mosque pictures'],
    ['🐤', 'chicks'], ['🍌', 'bananas'], ['⚽', 'balls'], ['🧁', 'cakes'], ['🥭', 'mangoes'], ['🐱', 'cats'], ['✏️', 'pencils'], ['🍇', 'grapes']];
  const ASLI = { NAMA: NAMA.slice(), BENDA: BENDA.slice() };
  let konteks = 'umum';
  const IMAN_UNITS = [];

  /* ---------- Visual ---------- */
  const V = {
    objects(e, n, crossed = 0) {
      let s = '<div class="objs">';
      for (let i = 0; i < n; i++) s += `<span class="obj${i >= n - crossed ? ' x' : ''}">${e}</span>`;
      return s + '</div>';
    },
    groups(e, a, b, sign = '+') {
      return `<div class="grp-row"><div class="grp">${V.objects(e, a)}</div><div class="sign">${sign}</div><div class="grp">${V.objects(e, b)}</div></div>`;
    },
    labeled(list) { // [[label, emoji, n]]
      return '<div class="grp-row">' + list.map(([l, e, n]) => `<div class="grp"><div class="grp-l">${l}</div>${V.objects(e, n)}</div>`).join('') + '</div>';
    },
    tenFrame(n, frames = 1, color = 'red') {
      let s = '<div class="tf-wrap">';
      for (let f = 0; f < frames; f++) {
        s += '<div class="tf">';
        for (let i = 0; i < 10; i++) s += `<div class="tf-c">${f * 10 + i < n ? `<span class="dot ${color}"></span>` : ''}</div>`;
        s += '</div>';
      }
      return s + '</div>';
    },
    numberLine(min, max, opt = {}) {
      const n = max - min, gap = 32, w = n * gap + 40;
      let s = `<svg class="nl" viewBox="0 0 ${w} 84" preserveAspectRatio="xMidYMid meet"><line x1="8" y1="54" x2="${w - 8}" y2="54" class="ax"/>`;
      for (let i = 0; i <= n; i++) { const x = 20 + i * gap; s += `<line x1="${x}" y1="47" x2="${x}" y2="61" class="tk"/><text x="${x}" y="80">${min + i}</text>`; }
      if (opt.from != null && opt.to != null && opt.from !== opt.to) {
        const st = opt.to > opt.from ? 1 : -1;
        for (let v = opt.from; v !== opt.to; v += st) {
          const x1 = 20 + (v - min) * gap, x2 = x1 + st * gap;
          s += `<path d="M${x1} 46 Q ${(x1 + x2) / 2} 14 ${x2} 46" class="jump"/>`;
        }
        s += `<circle cx="${20 + (opt.from - min) * gap}" cy="54" r="6" class="start"/>`;
      }
      return s + '</svg>';
    },
    bond(whole, a, b) {
      const c = (x, y, v, cls) => `<circle cx="${x}" cy="${y}" r="30" class="bc ${cls}"/><text x="${x}" y="${y + 9}" class="bt">${v}</text>`;
      return `<svg class="bond" viewBox="0 0 240 180"><line x1="120" y1="50" x2="60" y2="130"/><line x1="120" y1="50" x2="180" y2="130"/>${c(120, 45, whole, 'w')}${c(60, 135, a, 'p')}${c(180, 135, b, 'p')}</svg>`;
    },
    blocks(t, o) {
      let s = '<div class="b10">';
      for (let i = 0; i < t; i++) s += '<div class="rod">' + '<i></i>'.repeat(10) + '</div>';
      s += '<div class="ones">';
      for (let i = 0; i < o; i++) s += '<i></i>';
      return s + '</div></div>';
    },
    clock(h, m) {
      const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
      let s = '<svg class="clock" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" class="face"/>';
      for (let i = 1; i <= 12; i++) { const a = (i * 30 - 90) * Math.PI / 180; s += `<text x="${100 + 72 * Math.cos(a)}" y="${108 + 72 * Math.sin(a)}">${i}</text>`; }
      for (let i = 0; i < 60; i++) { const a = (i * 6 - 90) * Math.PI / 180, r1 = i % 5 ? 86 : 82; s += `<line x1="${100 + r1 * Math.cos(a)}" y1="${100 + r1 * Math.sin(a)}" x2="${100 + 90 * Math.cos(a)}" y2="${100 + 90 * Math.sin(a)}" class="mk"/>`; }
      s += `<line x1="100" y1="100" x2="100" y2="52" class="hh" transform="rotate(${ha} 100 100)"/>`;
      s += `<line x1="100" y1="100" x2="100" y2="36" class="mh" transform="rotate(${ma} 100 100)"/><circle cx="100" cy="100" r="6" class="pin"/></svg>`;
      return s;
    },
    money(list) {
      return '<div class="money">' + list.map(V.moneyItem).join('') + '</div>';
    },
    moneyItem(v) {
      const isNote = typeof v === 'string';
      const val = isNote ? parseInt(v.slice(1)) : v;
      if (isNote) return `<span class="note n${val}"><b>${val.toLocaleString('en-US')}</b><small>RUPIAH</small></span>`;
      return `<span class="coin c${val}">${val}</span>`;
    },
    shape(name, color = '#1fbf9f') {
      const P = {
        "triangle": '<polygon points="60,10 112,104 8,104"/>',
        "square": '<rect x="14" y="14" width="92" height="92"/>',
        'persegi panjang': '<rect x="4" y="30" width="112" height="60"/>',
        "circle": '<circle cx="60" cy="60" r="50"/>',
        'belah ketupat': '<polygon points="60,6 106,60 60,114 14,60"/>',
        'segi enam': '<polygon points="32,12 88,12 114,60 88,108 32,108 6,60"/>',
        "trapezoid": '<polygon points="34,24 86,24 114,96 6,96"/>',
      };
      return `<svg class="shape" viewBox="0 0 120 120" style="fill:${color}">${P[name]}</svg>`;
    },
    fraction(kind, parts, shaded, equal = true) {
      let s = '<svg class="frac" viewBox="0 0 160 160">';
      if (kind === 'circle') {
        for (let i = 0; i < parts; i++) {
          const a1 = (i / parts) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
          const x1 = 80 + 70 * Math.cos(a1), y1 = 80 + 70 * Math.sin(a1), x2 = 80 + 70 * Math.cos(a2), y2 = 80 + 70 * Math.sin(a2);
          s += `<path d="M80 80 L${x1} ${y1} A70 70 0 ${parts === 1 ? 1 : 0} 1 ${x2} ${y2} Z" class="${i < shaded ? 'sh' : ''}"/>`;
        }
      } else {
        let widths = Array(parts).fill(140 / parts);
        if (!equal) { widths = parts === 2 ? [45, 95] : parts === 3 ? [30, 50, 60] : [20, 30, 40, 50]; }
        let x = 10;
        widths.forEach((w, i) => { s += `<rect x="${x}" y="30" width="${w}" height="100" class="${i < shaded ? 'sh' : ''}"/>`; x += w; });
      }
      return s + '</svg>';
    },
    bars(list) { // [{label,len,color}]
      return '<div class="bars">' + list.map((b) => `<div class="bar-row"><span class="bar-l">${b.label}</span><span class="bar" style="width:${b.len * 7}%;background:${b.color}"></span></div>`).join('') + '</div>';
    },
    ruler(len, start = 0) {
      const u = 24, w = 13 * u + 20;
      let s = `<svg class="ruler" viewBox="0 0 ${w} 110"><rect x="${10 + start * u}" y="8" width="${len * u}" height="26" rx="6" class="robj"/><polygon points="${10 + (start + len) * u},8 ${10 + (start + len) * u + 14},21 ${10 + (start + len) * u},34" class="rtip"/>`;
      s += `<rect x="4" y="44" width="${w - 8}" height="56" rx="4" class="rbody"/>`;
      for (let i = 0; i <= 12; i++) { const x = 10 + i * u; s += `<line x1="${x}" y1="44" x2="${x}" y2="64"/><text x="${x}" y="88">${i}</text>`; if (i < 12) s += `<line x1="${x + u / 2}" y1="44" x2="${x + u / 2}" y2="56"/>`; }
      return s + '</svg>';
    },
    clips(len) {
      return `<div class="clips"><div class="cobj" style="width:${len * 11}%"></div><div class="crow">${'<span class="clip"></span>'.repeat(len)}</div></div>`;
    },
    pictograph(title, rows, key) { // rows: [[emoji,label,n]]
      return `<div class="pg"><div class="pg-t">${title}</div>${rows.map(([e, l, n]) => `<div class="pg-r"><span class="pg-l">${l}</span><span class="pg-i">${e.repeat(n)}</span></div>`).join('')}${key ? `<div class="pg-k">${key}</div>` : ''}</div>`;
    },
    tally(n) {
      let s = '<div class="tally">';
      for (let g = 0; g < Math.ceil(n / 5); g++) {
        const k = Math.min(5, n - g * 5);
        s += '<svg viewBox="0 0 60 60">';
        for (let i = 0; i < Math.min(4, k); i++) s += `<line x1="${10 + i * 12}" y1="6" x2="${10 + i * 12}" y2="54"/>`;
        if (k === 5) s += '<line x1="2" y1="44" x2="56" y2="14"/>';
        s += '</svg>';
      }
      return s + '</div>';
    },
    barModel(rows, total) { // rows: [[ [value,label], ... ]], total label
      const max = Math.max(...rows.map((row) => row.reduce((a, p) => a + (p[2] || 1), 0)));
      let s = '<div class="bm">';
      if (total != null) s += `<div class="bm-total"><span>${total}</span></div>`;
      rows.forEach((row) => {
        s += '<div class="bm-row">';
        row.forEach(([v, lab, wt]) => { s += `<div class="bm-seg${v === '?' ? ' q' : ''}" style="flex:${wt || 1}">${v}${lab ? `<small>${lab}</small>` : ''}</div>`; });
        const used = row.reduce((a, p) => a + (p[2] || 1), 0);
        if (used < max) s += `<div style="flex:${max - used}"></div>`;
        s += '</div>';
      });
      return s + '</div>';
    },
    scale(left, right, leftHeavy) {
      return `<div class="scale"><div class="beam ${leftHeavy ? 'tl' : 'tr'}"><span class="pan">${left}</span><span class="pan">${right}</span></div><div class="stand"></div></div>`;
    },
    seq(items) { return '<div class="seq">' + items.map((v) => `<span class="${v === '?' ? 'q' : ''}">${v}</span>`).join('') + '</div>'; },
    grid(rows) { return '<div class="hgrid">' + rows.map((row) => row.map((v) => `<span class="${v === '?' ? 'q' : ''}">${v}</span>`).join('')).join('') + '</div>'; },
    big(t) { return `<div class="bigeq">${t}</div>`; },
  };

  /* ---------- Pembantu soal ---------- */
  const add10 = () => { const a = r(0, 10); return [a, r(0, 10 - a)]; };
  const inp = (text, answer, explain, extra = {}) => Object.assign({ type: 'input', text, answer: String(answer), explain }, extra);
  const ch = (text, options, answer, explain, extra = {}) => Object.assign({ type: 'choice', text, options: options.map(String), answer: String(answer), explain }, extra);
  const cmpSym = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const opp = { '<': '>', '>': '<' };

  function compareQ(a, b) {
    const s = cmpSym(a, b);
    const tags = {}; if (opp[s]) tags[opp[s]] = 'simbol-terbalik';
    return ch(`Choose the correct sign.`, ['<', '>', '='], s,
      `${a} is ${s === '<' ? 'less than' : s === '>' ? 'greater than' : 'equal to'} ${b}, so <b>${a} ${s} ${b}</b>. Remember: the crocodile's mouth always opens toward the larger number 🐊.`,
      { vis: V.big(`${a} <span class="q">?</span> ${b}`), optionTags: tags, meta: { kind: 'compare' } });
  }

  /* ---------- Kurikulum ---------- */
  const UNITS = [
    {
      id: 'A', name: 'Numbers to 10', icon: '🔢', color: '#ff7a59', grade: 1, sg: '1A · Numbers to 10', ixl: 'A, B', km: 'Numbers',
      tip: 'Have your child count things at home (spoons, sandals, buttons) while pointing to each one.',
      skills: [
        { id: 'A1', name: 'Counting objects to 10', gen() { const [e, nm] = pick(BENDA), n = r(1, 10); return inp(`How many ${nm} are there?`, n, `Count while pointing to each one: ${range(1, n).join(', ')}. So there are <b>${n}</b> ${nm}.`, { vis: V.objects(e, n), meta: { kind: 'count' } }); } },
        { id: 'A2', name: 'Ten frame', gen() { const n = r(1, 10); return inp('How many dots are in the ten frame?', n, `One full row has 5 dots. ${n > 5 ? `Top row 5, bottom row ${n - 5}. 5 + ${n - 5} = <b>${n}</b>.` : `There are <b>${n}</b> dots.`}`, { vis: V.tenFrame(n), meta: { kind: 'count' } }); } },
        { id: 'A3', name: 'Number symbols and number names', gen() { const n = r(0, 20); if (Math.random() < 0.5) { return ch(`Which number is written "<b>${kata(n)}</b>"?`, numOpts(n, 0, 20), n, `"${kata(n)}" is written <b>${n}</b>.`, { speak: `Which number is written ${kata(n)}?` }); } const o = numOpts(n, 0, 20).map((x) => kata(+x)); return ch(`How do you write ${n} in words?`, o, kata(n), `${n} is read as <b>${kata(n)}</b>.`, { vis: V.big(n) }); } },
        { id: 'A4', name: 'More or fewer', gen() { const s = shuffle(BENDA), a = r(1, 10); let b = r(1, 10); while (b === a) b = r(1, 10); const more = Math.random() < 0.5; const ans = (more ? a > b : a < b) ? s[0][1] : s[1][1]; return ch(`Which group has the ${more ? 'most' : 'fewest'}?`, [s[0][1], s[1][1]], ans, `There are ${a} ${s[0][1]} and ${b} ${s[1][1]}. ${Math.max(a, b)} is more than ${Math.min(a, b)}. The answer is <b>${ans}</b>.`, { vis: V.labeled([[s[0][1], s[0][0], a], [s[1][1], s[1][0], b]]), meta: { kind: 'compare' } }); } },
        { id: 'A5', name: 'Comparing with the signs <, >, =', gen() { return compareQ(r(0, 10), r(0, 10)); } },
        { id: 'A6', name: 'Ordinal numbers (1st, 2nd, ...)', gen() { const an = shuffle(['🐶', '🐱', '🐰', '🐸', '🐵', '🐼', '🦊', '🐯']).slice(0, r(5, 7)); const k = r(1, an.length); const vis = '<div class="ord"><span class="flag">🏁</span>' + an.map((x) => `<span>${x}</span>`).join('') + '</div>'; if (Math.random() < 0.5) { const opts = shuffle([...new Set([k, Math.max(1, k - 1), Math.min(an.length, k + 1), r(1, an.length)])]).slice(0, 4).map((x) => 'ke-' + x); if (!opts.includes('ke-' + k)) opts[0] = 'ke-' + k; return ch(`Counting from the flag, what position is the ${an[k - 1]} in?`, shuffle(opts), 'ke-' + k, `Count from the flag: ${an.slice(0, k).map((x, i) => `${x} ke-${i + 1}`).join(', ')}. The answer is <b>position ${k}</b>.`, { vis }); } return ch(`Counting from the flag, which animal is in position ${k}?`, shuffle([an[k - 1], ...shuffle(an.filter((x) => x !== an[k - 1])).slice(0, 3)]), an[k - 1], `Count from the flag to position ${k}: <b>${an[k - 1]}</b>.`, { vis }); } },
      ],
    },
    {
      id: 'B', name: 'Number bonds', icon: '🔗', color: '#1fbf9f', grade: 1, sg: '1A · Number Bonds', ixl: 'F, G', km: 'Numbers',
      tip: 'Use 10 buttons: split them between two hands, then ask "if the left hand has 3, how many does the right hand have?"',
      skills: [
        { id: 'B1', name: 'Number bonds to 10', gen() { const w = r(2, 10), a = r(1, w - 1), b = w - a; const hide = Math.random() < 0.8 ? (Math.random() < 0.5 ? 'a' : 'b') : 'w'; const ans = hide === 'a' ? a : hide === 'b' ? b : w; return inp('What is the missing number?', ans, `${a} and ${b} make ${w}, because ${a} + ${b} = ${w}. The answer is <b>${ans}</b>.`, { log: `Number bonds: ${hide === 'w' ? '?' : w} is made of ${hide === 'a' ? '?' : a} and ${hide === 'b' ? '?' : b}`, vis: V.bond(hide === 'w' ? '?' : w, hide === 'a' ? '?' : a, hide === 'b' ? '?' : b), meta: hide === 'w' ? { op: '+', a, b } : { op: '-', a: w, b: hide === 'a' ? b : a } }); } },
        { id: 'B2', name: 'Making 10', gen() { const n = r(1, 9); return inp(`${n} + ? = 10`, 10 - n, `The ten frame has ${n} dots. There are ${10 - n} empty boxes. So ${n} + <b>${10 - n}</b> = 10.`, { vis: V.tenFrame(n), meta: { op: '-', a: 10, b: n } }); } },
        { id: 'B3', name: 'Different ways to make a number', gen() { const n = r(4, 10), a = r(1, n - 1); const right = `${a} and ${n - a}`; const wrong = new Set(); let g = 0; while (wrong.size < 3 && g++ < 40) { const x = r(1, n), y = r(1, n); if (x + y !== n && x + y >= n - 2 && x + y <= n + 2) wrong.add(`${x} and ${y}`); } return ch(`Which pair makes <b>${n}</b>?`, shuffle([right, ...wrong]), right, `${a} + ${n - a} = ${n}, so <b>${right}</b> makes ${n}.`); } },
      ],
    },
    {
      id: 'C', name: 'Addition to 10', icon: '➕', color: '#00b894', grade: 1, sg: '1A · Addition', ixl: 'E, F, G, H', km: 'Numbers',
      tip: 'While eating fruit, ask "there are 3 oranges, Dad adds 2, how many now?" Have your child count on from 3: "4, 5".',
      skills: [
        { id: 'C1', name: 'Addition with pictures', gen() { const [e] = pick(BENDA), a = r(1, 6), b = r(1, 10 - a); return inp(`${a} + ${b} = ?`, a + b, `Combine the two groups and count them all: ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
        { id: 'C2', name: 'Counting on with a number line', gen() { const a = r(1, 8), b = r(1, 10 - a); return inp(`Start at ${a} and jump ${b} times to the right. Where do you land?`, a + b, `Start at ${a}, then count on ${b} steps: ${range(a + 1, a + b).join(', ')}. So ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.numberLine(0, 10, { from: a, to: a + b }), meta: { op: '+', a, b } }); } },
        { id: 'C3', name: 'Addition facts to 10', gen() { const [a, b] = add10(); return inp(`${a} + ${b} = ?`, a + b, `${a} + ${b} = <b>${a + b}</b>. Tip: start from the larger number, then count on.`, { vis: V.big(`${a} + ${b} = <span class="q">?</span>`), meta: { op: '+', a, b } }); } },
        { id: 'C4', name: 'Addition word problems to 10', gen() { const [e, nm] = pick(BENDA), a = r(1, 7), b = r(1, 10 - a), [n1, n2] = two(); const t = pick([`${n1} has ${a} ${nm}. Mom gives ${b} more ${nm}. How many ${nm} ${n1} now?`, `${n1} brings ${a} ${nm}. ${n2} brings ${b} ${nm}. How many ${nm} do they have altogether?`, `There are ${a} ${nm} on the table. An older sibling puts ${b} more ${nm} there. How many ${nm} are there now?`]); return inp(t, a + b, `The words "more" or "altogether" mean combine (add). ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
      ],
    },
    {
      id: 'D', name: 'Subtraction to 10', icon: '➖', color: '#0984e3', grade: 1, sg: '1A · Subtraction', ixl: 'I, J, K, L, M, N, O', km: 'Numbers',
      tip: 'Play "store": there are 8 cakes and a customer takes 3. Let your child take real objects and count what\'s left.',
      skills: [
        { id: 'D1', name: 'Subtraction with pictures', gen() { const [e] = pick(BENDA), a = r(2, 10), b = r(1, a); return inp(`${a} − ${b} = ?`, a - b, `There are ${a}, and ${b} are crossed out. Count the ones not crossed out: <b>${a - b}</b>.`, { vis: V.objects(e, a, b), meta: { op: '-', a, b } }); } },
        { id: 'D2', name: 'Counting back with a number line', gen() { const a = r(2, 10), b = r(1, a); return inp(`Start at ${a} and jump ${b} times to the left. Where do you land?`, a - b, `Start at ${a}, count back ${b} steps: ${range(a - b, a - 1).reverse().join(', ')}. So ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.numberLine(0, 10, { from: a, to: a - b }), meta: { op: '-', a, b } }); } },
        { id: 'D3', name: 'Subtraction facts to 10', gen() { const a = r(1, 10), b = r(0, a); return inp(`${a} − ${b} = ?`, a - b, `${a} − ${b} = <b>${a - b}</b>. Tip: think of number bonds, ${b} + ? = ${a}.`, { vis: V.big(`${a} − ${b} = <span class="q">?</span>`), meta: { op: '-', a, b } }); } },
        { id: 'D4', name: 'Subtraction word problems to 10', gen() { const a = r(3, 10), b = r(1, a - 1), [n1] = two(); const [e, t] = pick([['🎈', `${n1} has ${a} balloons. ${b} balloons pop. How many balloons are left?`], ['🐦', `There are ${a} birds in the tree. ${b} birds fly away. How many birds are still in the tree?`], ['🍪', `Mom makes ${a} cakes. ${n1} eats ${b} cakes. How many cakes are left?`], ['🍬', `${n1} has ${a} candies and gives ${b} candies to a little sibling. How many candies does ${n1} have now?`]]); return inp(t, a - b, `The words "left", "away", or "gives" mean subtract. ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.objects(e, a, b), meta: { op: '-', a, b } }); } },
        { id: 'D5', name: 'Number families', gen() { let a = r(1, 5), b = r(a + 1, 9); if (a + b > 10) b = 10 - a; if (b === a) b = a + 1; const c = a + b; const good = pick([`${a} + ${b} = ${c}`, `${b} + ${a} = ${c}`, `${c} − ${a} = ${b}`, `${c} − ${b} = ${a}`]); const bad = shuffle([`${a} − ${b} = ${c}`, `${a} + ${c} = ${b}`, `${b} − ${c} = ${a}`, `${c} + ${b} = ${a}`]).slice(0, 3); return ch(`Which one belongs to the number family <b>${a}, ${b}, ${c}</b>?`, shuffle([good, ...bad]), good, `Family ${a}, ${b}, ${c}: ${a} + ${b} = ${c}, ${b} + ${a} = ${c}, ${c} − ${a} = ${b}, ${c} − ${b} = ${a}. The answer is <b>${good}</b>.`, { vis: V.bond(c, a, b) }); } },
      ],
    },
    {
      id: 'E', name: 'Numbers to 20', icon: '🔟', color: '#e17055', grade: 1, sg: '1A · Numbers to 20', ixl: 'AA (teen numbers)', km: 'Numbers',
      tip: 'Tie 10 straws with a rubber band. Show that 13 = 1 bundle of ten and 3 loose.',
      skills: [
        { id: 'E1', name: 'Tens and ones (11–20)', gen() { const n = r(11, 20); const t = Math.floor(n / 10), o = n % 10; if (Math.random() < 0.6) return inp('What number is shown?', n, `${t} ten-bars = ${t * 10}, plus ${o} unit cubes. ${t * 10} + ${o} = <b>${n}</b>.`, { vis: V.blocks(t, o), meta: { kind: 'place' } }); return inp(`${n} = 10 + ?`, n - 10, `${n} is made of 1 ten and ${n - 10} ones. The answer is <b>${n - 10}</b>.`, { vis: V.blocks(t, o), meta: { op: '-', a: n, b: 10 } }); } },
        { id: 'E2', name: 'Largest and smallest to 20', gen() { const nums = shuffle(range(0, 20)).slice(0, 4); const big = Math.random() < 0.5; const ans = big ? Math.max(...nums) : Math.min(...nums); return ch(`Which number is the ${big ? 'largest' : 'smallest'}?`, nums, ans, `In order: ${nums.slice().sort((a, b) => a - b).join(', ')}. The ${big ? 'largest' : 'smallest'} is <b>${ans}</b>.`); } },
        { id: 'E3', name: 'Number patterns to 20', gen() { const step = pick([1, 1, 2, -1]); const len = 5; let start = step > 0 ? r(0, 20 - step * (len - 1)) : r(len - 1, 20); const seq = range(0, len - 1).map((i) => start + i * step); const k = r(1, len - 1); const ans = seq[k]; const show = seq.map((v, i) => (i === k ? '?' : v)); return inp('What number is missing?', ans, `The pattern ${step > 0 ? 'increases' : 'decreases'} by ${Math.abs(step)} each step. So the missing number is <b>${ans}</b>.`, { log: 'Missing number: ' + show.join(', '), vis: V.seq(show), meta: { kind: 'seq' } }); } },
      ],
    },
    {
      id: 'F', name: 'Addition and subtraction to 20', icon: '🧮', color: '#00cec9', grade: 1, sg: '1A · Addition and Subtraction within 20', ixl: 'P–Z', km: 'Numbers; Algebra (equality)',
      tip: 'Practice "making 10": 8 + 5 → 8 needs 2 to become 10, 3 left, so 10 + 3 = 13.',
      skills: [
        { id: 'F1', name: 'Doubles and near doubles', gen() { const a = r(1, 9); if (Math.random() < 0.55) return inp(`${a} + ${a} = ?`, a * 2, `Double ${a} means ${a} two times: ${a} + ${a} = <b>${a * 2}</b>.`, { vis: V.big(`${a} + ${a} = <span class="q">?</span>`), meta: { op: '+', a, b: a } }); return inp(`${a} + ${a + 1} = ?`, 2 * a + 1, `Use doubles: ${a} + ${a} = ${2 * a}. Since ${a + 1} is one more than ${a}, the answer is ${2 * a} + 1 = <b>${2 * a + 1}</b>.`, { vis: V.big(`${a} + ${a + 1} = <span class="q">?</span>`), meta: { op: '+', a, b: a + 1 } }); } },
        { id: 'F2', name: 'Making 10 to add', gen() { const a = r(6, 9), b = r(11 - a, 9), need = 10 - a, rest = b - need; if (Math.random() < 0.5) return inp(`${a} + ${b} = 10 + ?`, rest, `${a} needs ${need} to become 10. Take ${need} from ${b}, and <b>${rest}</b> is left. So ${a} + ${b} = 10 + ${rest} = ${10 + rest}.`, { vis: V.bond(b, need, '?'), meta: { op: '-', a: b, b: need } }); return inp(`${a} + ${b} = ?`, a + b, `Make 10 first: ${a} + ${need} = 10. What's left of ${b} is ${rest}. 10 + ${rest} = <b>${a + b}</b>.`, { vis: V.tenFrame(a, 2, 'red') + V.objects('🔵', b), meta: { op: '+', a, b } }); } },
        { id: 'F3', name: 'Addition to 20', gen() { const a = r(2, 12), b = r(1, 20 - a); return inp(`${a} + ${b} = ?`, a + b, `${a} + ${b} = <b>${a + b}</b>.${a + b > 10 && a < 10 && b < 10 ? ` Try making 10: ${Math.max(a, b)} + ${10 - Math.max(a, b)} = 10, then add ${a + b - 10}.` : ''}`, { vis: V.big(`${a} + ${b} = <span class="q">?</span>`), meta: { op: '+', a, b } }); } },
        { id: 'F4', name: 'Subtraction to 20', gen() { const a = r(11, 20), b = r(1, a); return inp(`${a} − ${b} = ?`, a - b, `${a} − ${b} = <b>${a - b}</b>.${b < 10 && a - 10 < b ? ` Tip: ${a} = 10 + ${a - 10}. Take ${b} from 10, leaving ${10 - b}, then add ${a - 10}: ${10 - b} + ${a - 10} = ${a - b}.` : ''}`, { vis: V.big(`${a} − ${b} = <span class="q">?</span>`), meta: { op: '-', a, b } }); } },
        { id: 'F5', name: 'Adding three numbers', gen() { const a = r(1, 9), b = r(1, 9), c = r(1, Math.max(1, Math.min(9, 20 - a - b))); const s = a + b + c; let hint = `${a} + ${b} = ${a + b}, then ${a + b} + ${c} = ${s}`; if (a + c === 10) hint = `Find the pair that makes 10 first: ${a} + ${c} = 10, then 10 + ${b} = ${s}`; else if (b + c === 10) hint = `Find the pair that makes 10 first: ${b} + ${c} = 10, then ${a} + 10 = ${s}`; return inp(`${a} + ${b} + ${c} = ?`, s, `${hint}. The answer is <b>${s}</b>.`, { vis: V.big(`${a} + ${b} + ${c} = <span class="q">?</span>`) }); } },
        { id: 'F6', name: 'Word problems with bar models', gen() { const [n1, n2] = two(), [, nm] = pick(BENDA); const kind = pick(['add', 'sub', 'cmp']); if (kind === 'add') { const a = r(3, 12), b = r(2, 20 - a); return inp(`${n1} has ${a} ${nm}. ${n2} has ${b} ${nm}. How many ${nm} do they have altogether?`, a + b, `Bar model: two parts combine into a whole. ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.barModel([[[a, n1, a], [b, n2, b]]], '?'), meta: { op: '+', a, b } }); } if (kind === 'sub') { const a = r(8, 20), b = r(2, a - 2); return inp(`There are ${a} ${nm} in the basket. ${b} ${nm} are taken by ${n1}. How many ${nm} are left?`, a - b, `The whole is ${a} and one part is ${b}. The other part is ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.barModel([[[b, 'taken', b], ['?', 'left', a - b]]], a), meta: { op: '-', a, b } }); } const b = r(2, 10), a = b + r(1, 9); return inp(`${n1} has ${a} ${nm}. ${n2} has ${b} ${nm}. How many more ${n1} does ${nm} have than ${n2}?`, a - b, `Compare the two bars. The difference is ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.barModel([[[a, n1, a]], [[b, n2, b], ['?', 'difference', a - b]]]), meta: { op: '-', a, b } }); } },
        { id: 'F7', name: 'True or false?', gen() { const plus = Math.random() < 0.5; let a, b, c; if (plus) { a = r(1, 10); b = r(1, 20 - a); c = a + b; } else { a = r(5, 20); b = r(1, a); c = a - b; } const truth = Math.random() < 0.5; const shown = truth ? c : c + pick([-2, -1, 1, 2]); const eq = `${a} ${plus ? '+' : '−'} ${b} = ${Math.max(0, shown)}`; const real = Math.max(0, shown) === c; return ch(`Is this sentence true?`, ['Correct', 'False'], real ? 'Correct' : 'False', `${a} ${plus ? '+' : '−'} ${b} = ${c}. ${real ? 'So the sentence is <b>true</b>.' : `It isn't ${Math.max(0, shown)}, so the sentence is <b>false</b>.`}`, { vis: V.big(eq) }); } },
        { id: 'F8', name: 'Complete the number sentence', gen() { const c = r(5, 20), a = r(1, c - 1); if (Math.random() < 0.5) return inp(`${a} + ? = ${c}`, c - a, `What is added to ${a} to make ${c}? Count on from ${a} to ${c}: <b>${c - a}</b> steps.`, { vis: V.big(`${a} + <span class="q">?</span> = ${c}`), meta: { op: '-', a: c, b: a } }); return inp(`${c} − ? = ${a}`, c - a, `${c} minus what leaves ${a}? ${c} − ${c - a} = ${a}. The answer is <b>${c - a}</b>.`, { vis: V.big(`${c} − <span class="q">?</span> = ${a}`), meta: { op: '-', a: c, b: a } }); } },
      ],
    },
    {
      id: 'G', name: 'Numbers to 100', icon: '💯', color: '#fdcb6e', grade: 1, sg: '1B · Numbers to 40, Numbers to 100', ixl: 'A, AA, BB, C', km: 'Numbers',
      tip: 'Use a calendar or a 1–100 chart. Ask "what\'s 10 more than 34?" and point to the number below it.',
      skills: [
        { id: 'G1', name: 'Tens and ones to 100', gen() { const t = r(2, 9), o = r(0, 9), n = t * 10 + o; if (Math.random() < 0.6) return inp('What number is shown?', n, `${t} tens = ${t * 10}, ${o} ones = ${o}. ${t * 10} + ${o} = <b>${n}</b>.`, { vis: V.blocks(t, o), meta: { kind: 'place' } }); return inp(`${t} tens and ${o} ones is what number?`, n, `The tens digit is written first: <b>${n}</b>.`, { meta: { kind: 'place' } }); } },
        { id: 'G2', name: 'Place value', gen() { let t = r(2, 9), o = r(1, 9); while (o === t) o = r(1, 9); const n = t * 10 + o; if (Math.random() < 0.5) { const tags = {}; tags[t] = 'nilai-tempat'; return ch(`In the number <b>${n}</b>, what is the value of the digit ${t}?`, shuffle([t * 10, t, o * 10, o]), t * 10, `The digit ${t} is in the tens place, so its value is ${t} × 10 = <b>${t * 10}</b>.`, { vis: V.blocks(t, o), optionTags: tags }); } return inp(`How many tens are in the number ${n}?`, t, `${n} = ${t} tens and ${o} ones. The answer is <b>${t}</b>.`, { meta: { kind: 'place' } }); } },
        { id: 'G3', name: 'Comparing numbers to 100', gen() { const a = r(10, 99); const b = Math.random() < 0.4 ? Math.floor(a / 10) * 10 + r(0, 9) : r(10, 99); return compareQ(a, b); } },
        { id: 'G4', name: 'Skip counting by 2, 5, and 10', gen() { const step = pick([2, 5, 10]); const max = step === 10 ? 120 : 100; const start = step * r(0, Math.floor((max - step * 4) / step)); const seq = range(0, 4).map((i) => start + i * step); const k = r(1, 4); return inp(`Skip count by ${step}s. What number is missing?`, seq[k], `Each step adds ${step}: ${seq.join(', ')}. The answer is <b>${seq[k]}</b>.`, { log: `Skip by ${step}s: ` + seq.map((v, i) => (i === k ? '?' : v)).join(', '), vis: V.seq(seq.map((v, i) => (i === k ? '?' : v))), meta: { kind: 'seq' } }); } },
        { id: 'G5', name: 'Hundreds chart: 1 and 10 more/less', gen() { let n = r(12, 88); while (n % 10 < 2) n = r(12, 88); const rows = [[n - 11, n - 10, n - 9], [n - 1, n, n + 1], [n + 9, n + 10, n + 11]]; const ri = r(0, 2), ci = r(0, 2); if (ri === 1 && ci === 1) return inp(`What number is 10 more than ${n}?`, n + 10, `10 more means the tens go up by 1: ${n} → <b>${n + 10}</b>. On the hundreds chart, it's directly below.`, { meta: { op: '+', a: n, b: 10 } }); const ans = rows[ri][ci]; const show = rows.map((row, i) => row.map((v, j) => (i === ri && j === ci ? '?' : v))); return inp('What number is missing on the hundreds chart?', ans, `Going right adds 1, going down adds 10. The answer is <b>${ans}</b>.`, { vis: V.grid(show), meta: { kind: 'place' } }); } },
        { id: 'G6', name: 'Ordering numbers', gen() { const nums = shuffle(range(10, 99)).slice(0, 3); const asc = Math.random() < 0.6; const sorted = nums.slice().sort((a, b) => (asc ? a - b : b - a)); const ok = sorted.join(', '); const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map((p) => p.map((i) => sorted[i]).join(', ')); return ch(`Order them starting from the ${asc ? 'smallest' : 'largest'}.`, shuffle([ok, ...shuffle(perms.filter((p) => p !== ok)).slice(0, 3)]), ok, `Compare the tens first, then the ones. The order is <b>${ok}</b>.`, { vis: V.seq(nums) }); } },
      ],
    },
    {
      id: 'H', name: 'Addition and subtraction to 100', icon: '🚀', color: '#66ffdb', grade: 1, sg: '1B · Addition and Subtraction to 100', ixl: 'CC, DD', km: 'Numbers',
      tip: 'Write the problem vertically: ones under ones, tens under tens. Always start with the ones.',
      skills: [
        { id: 'H1', name: 'Adding and subtracting tens', gen() { const a = r(1, 8), b = r(1, 9 - a); if (Math.random() < 0.5) return inp(`${a * 10} + ${b * 10} = ?`, (a + b) * 10, `${a} tens + ${b} tens = ${a + b} tens = <b>${(a + b) * 10}</b>.`, { vis: V.blocks(a, 0) + V.blocks(b, 0), meta: { op: '+', a: a * 10, b: b * 10 } }); const x = a + b; return inp(`${x * 10} − ${b * 10} = ?`, a * 10, `${x} tens − ${b} tens = ${a} tens = <b>${a * 10}</b>.`, { vis: V.big(`${x * 10} − ${b * 10} = <span class="q">?</span>`), meta: { op: '-', a: x * 10, b: b * 10 } }); } },
        { id: 'H2', name: 'Two digits and one digit (no regrouping)', gen() { const t = r(1, 9), o = r(0, 8); const a = t * 10 + o; if (Math.random() < 0.5) { const b = r(1, 9 - o); return inp(`${a} + ${b} = ?`, a + b, `Add the ones: ${o} + ${b} = ${o + b}. The tens stay ${t}. The answer is <b>${a + b}</b>.`, { vis: V.blocks(t, o), meta: { op: '+', a, b } }); } const a2 = t * 10 + r(1, 9), b = r(1, a2 % 10); return inp(`${a2} − ${b} = ?`, a2 - b, `Subtract the ones: ${a2 % 10} − ${b} = ${a2 % 10 - b}. The tens stay ${t}. The answer is <b>${a2 - b}</b>.`, { vis: V.blocks(t, a2 % 10), meta: { op: '-', a: a2, b } }); } },
        { id: 'H3', name: 'Adding two-digit numbers (no regrouping)', gen() { const t1 = r(1, 8), t2 = r(1, 9 - t1), o1 = r(0, 9), o2 = r(0, 9 - o1); const a = t1 * 10 + o1, b = t2 * 10 + o2; return inp(`${a} + ${b} = ?`, a + b, `Ones: ${o1} + ${o2} = ${o1 + o2}. Tens: ${t1} + ${t2} = ${t1 + t2}. The answer is <b>${a + b}</b>.`, { vis: `<div class="stack"><span>${a}</span><span>+ ${b}</span><span class="line">?</span></div>`, meta: { op: '+', a, b } }); } },
        { id: 'H4', name: 'Adding with regrouping', gen() { const t = r(1, 8), o = r(2, 9); const a = t * 10 + o; let b; if (Math.random() < 0.6) b = r(10 - o, 9); else { const o2 = r(10 - o, 9), t2 = r(1, Math.max(1, 8 - t)); b = t2 * 10 + o2; } if (a + b > 100) b = 100 - a; const so = (a % 10) + (b % 10); return inp(`${a} + ${b} = ?`, a + b, `Ones: ${a % 10} + ${b % 10} = ${so}. That's more than 9, so carry 1 ten. Tens: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 = ${Math.floor((a + b) / 10)}. The answer is <b>${a + b}</b>.`, { vis: `<div class="stack"><span>${a}</span><span>+ ${b}</span><span class="line">?</span></div>`, meta: { op: '+', a, b, regroup: so >= 10 } }); } },
        { id: 'H5', name: 'Subtracting two-digit numbers (no regrouping)', gen() { const t1 = r(2, 9), t2 = r(1, t1), o1 = r(0, 9), o2 = r(0, o1); const a = t1 * 10 + o1, b = t2 * 10 + o2; return inp(`${a} − ${b} = ?`, a - b, `Ones: ${o1} − ${o2} = ${o1 - o2}. Tens: ${t1} − ${t2} = ${t1 - t2}. The answer is <b>${a - b}</b>.`, { vis: `<div class="stack"><span>${a}</span><span>− ${b}</span><span class="line">?</span></div>`, meta: { op: '-', a, b } }); } },
        { id: 'H6', name: 'Word problems to 100', gen() { const [n1] = two(); if (Math.random() < 0.5) { const a = r(10, 60), b = r(10, Math.min(39, 99 - a)); return inp(pick([`The library has ${a} storybooks and ${b} textbooks. How many books are there in all?`, `${n1} collects ${a} marbles. An older sibling gives ${b} more marbles. How many marbles does ${n1} have now?`]), a + b, `Combining means adding: ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.barModel([[[a, '', a], [b, '', b]]], '?'), meta: { op: '+', a, b, regroup: (a % 10) + (b % 10) >= 10 } }); } const a = r(30, 99), b = r(10, a - 5); const bb = Math.floor(b / 10) * 10 + Math.min(b % 10, a % 10); return inp(pick([`There are ${a} chairs in the hall. ${bb} chairs are taken. How many chairs are still empty?`, `A farmer picks ${a} mangoes. ${bb} mangoes are sold. How many mangoes are left?`]), a - bb, `Left means subtract: ${a} − ${bb} = <b>${a - bb}</b>.`, { vis: V.barModel([[[bb, '', bb], ['?', '', a - bb]]], a), meta: { op: '-', a, b: bb } }); } },
      ],
    },
    {
      id: 'I', name: 'Introduction to multiplication and division', icon: '🍱', color: '#fd79a8', grade: 1, sg: '1B · Multiplication, Division (introduction)', ixl: '— (not in IXL grade 1)', km: 'Enrichment (CP Phase B)',
      tip: 'When setting the table, ask "there are 3 plates with 2 cakes on each, how many altogether?" Share snacks equally with siblings.',
      skills: [
        { id: 'I1', name: 'Equal groups', gen() { const g = r(2, 5), e = r(2, 5), [em, nm] = pick([['🍪', 'cakes'], ['🍓', 'strawberries'], ['🥚', 'eggs'], ['🍬', 'candies']]); const vis = '<div class="eqg">' + range(1, g).map(() => `<div class="plate">${em.repeat(e)}</div>`).join('') + '</div>'; return inp(`There are ${g} plates. Each plate has ${e} ${nm}. How many ${nm} are there altogether?`, g * e, `${g} groups of ${e}: ${Array(g).fill(e).join(' + ')} = <b>${g * e}</b>.`, { vis, meta: { op: 'x', a: g, b: e } }); } },
        { id: 'I2', name: 'Repeated addition', gen() { const g = r(2, 5), e = r(2, 5); const rep = (x, k) => Array(k).fill(x).join(' + '); const good = rep(e, g); const bad = new Set([rep(e, g + 1), rep(e, Math.max(2, g - 1)), `${g} + ${e}`]); if (g !== e) bad.add(rep(g, e)); bad.delete(good); const vis = '<div class="eqg">' + range(1, g).map(() => `<div class="plate">${'🍎'.repeat(e)}</div>`).join('') + '</div>'; return ch('Which sentence matches the picture?', shuffle([good, ...shuffle([...bad]).slice(0, 3)]), good, `There are ${g} groups with ${e} in each group. So ${e} is added ${g} times: <b>${good}</b>.`, { vis }); } },
        { id: 'I3', name: 'Sharing equally', gen() { const g = r(2, 5), e = r(2, 5), tot = g * e; return inp(`${tot} candies are shared equally among ${g} children. How many candies does each child get?`, e, `Give them out one at a time to ${g} children until they're gone. Each child gets <b>${e}</b>, because ${Array(g).fill(e).join(' + ')} = ${tot}.`, { vis: V.objects('🍬', tot) + '<div class="kids">' + '🧒'.repeat(g) + '</div>', meta: { op: '/', a: tot, b: g } }); } },
      ],
    },
    {
      id: 'J', name: 'Measurement', icon: '📏', color: '#55efc4', grade: 1, sg: '1A/1B · Length, Weight', ixl: 'EE', km: 'Measurement',
      tip: 'Measure a table with hand spans or pencils. Compare the weight of a book and a sandal with two hands.',
      skills: [
        { id: 'J1', name: 'Longer, shorter', gen() { const cols = shuffle([['red', '#ff6b6b'], ['blue', '#4d96ff'], ['green', '#2ecc71'], ['yellow', '#f9c74f']]).slice(0, 3); const lens = shuffle(range(3, 13)).slice(0, 3); const bars = cols.map(([nm, c], i) => ({ label: 'Ribbon ' + nm, len: lens[i], color: c })); const long = Math.random() < 0.5; const idx = lens.indexOf(long ? Math.max(...lens) : Math.min(...lens)); return ch(`Which ribbon is the ${long ? 'longest' : 'shortest'}?`, bars.map((b) => b.label), bars[idx].label, `Compare the right end of each ribbon (all start from the same line). <b>${bars[idx].label}</b> is the ${long ? 'longest' : 'shortest'}.`, { vis: V.bars(bars) }); } },
        { id: 'J2', name: 'Measuring with non-standard units', gen() { const n = r(2, 8); return inp('How many paper clips long is this green ribbon?', n, `Count the clips from the left end to the right end of the ribbon: <b>${n}</b> clips.`, { vis: V.clips(n), meta: { kind: 'count' } }); } },
        { id: 'J3', name: 'Measuring with a ruler (cm)', gen() { const start = Math.random() < 0.7 ? 0 : r(1, 3); const len = r(2, 12 - start); const extra = start ? { optionTags: {} } : {}; const q = inp('How many centimeters long is this pencil?', len, start ? `The pencil starts at ${start} and ends at ${start + len}. Its length is ${start + len} − ${start} = <b>${len}</b> cm.` : `The pencil tip starts at 0 and ends at ${len}. Its length is <b>${len}</b> cm.`, Object.assign({ vis: V.ruler(len, start), meta: { kind: 'ruler', start, end: start + len } }, extra)); return q; } },
        { id: 'J4', name: 'Heavier, lighter', gen() { const items = [['🐘', 'elephant', 9], ['🚗', 'cars', 8], ['🐄', 'cow', 7], ['🐕', 'dog', 5], ['🍉', 'watermelon', 4], ['📚', 'stack of books', 3], ['🍎', 'apples', 2], ['🪶', 'feather', 1], ['🎈', 'balloons', 0]]; const [x, y] = shuffle(items).slice(0, 2); const heavy = Math.random() < 0.5; const leftHeavy = x[2] > y[2]; const ans = heavy ? (leftHeavy ? x[1] : y[1]) : (leftHeavy ? y[1] : x[1]); return ch(`Which group has the ${heavy ? 'heaviest' : 'lightest'}?`, [x[1], y[1]], ans, `The side of the scale that goes down is heavier, and the side that goes up is lighter. The answer is <b>${ans}</b>.`, { vis: V.scale(x[0], y[0], leftHeavy) }); } },
      ],
    },
    {
      id: 'K', name: 'Time', icon: '⏰', color: '#ffeaa7', grade: 1, sg: '1B · Time', ixl: 'FF, GG', km: 'Measurement',
      tip: 'Ask the time during daily routines (waking up, lunch, bedtime). Remember: 6:30 is half past six.',
      skills: [
        { id: 'K1', name: 'Reading the clock (on the hour)', gen() { const h = r(1, 12); const f = (x) => `${x}:00`; const opts = new Set([f(h), f(h % 12 + 1), f(h === 1 ? 12 : h - 1)]); const swapped = `12:${String(h * 5).padStart(2, '0')}`; if (h !== 12) opts.add(swapped); const tags = {}; tags[swapped] = 'jam-tertukar'; return ch('What time is it?', shuffle([...opts]), f(h), `The short hand points to ${h} and the long hand points to 12. So it's <b>${h}:00</b>.`, { vis: V.clock(h, 0), optionTags: tags }); } },
        { id: 'K2', name: 'Reading the clock (half past)', gen() { const h = r(1, 12), nx = h % 12 + 1; if (Math.random() < 0.55) { const tags = {}; tags[`pukul ${nx}.30`] = 'setengah-jam'; return ch('What time is it?', shuffle([...new Set([`${h}:30`, `${nx}:30`, `${h}:00`, `6:${String(h * 5).padStart(2, '0')}`, `${nx}:00`])].slice(0, 4)), `${h}:30`, `The long hand at 6 means 30 minutes. The short hand is between ${h} and ${nx}, so the hour is still ${h}. <b>${h}:30</b> or "half past ${kata(h)}".`, { vis: V.clock(h, 30), optionTags: tags }); } const tags = {}; tags[`half past ${kata(nx)}`] = 'setengah-jam'; return ch(`${h}:30 is also called...`, shuffle([`half past ${kata(nx)}`, `half past ${kata(h)}`, `${kata(h)} o'clock`, `${kata(nx)} o'clock`]), `half past ${kata(h)}`, `${h}:30 is halfway from ${h} o'clock to ${nx} o'clock, so it's called <b>half past ${kata(h)}</b>.`, { vis: V.clock(h, 30), optionTags: tags }); } },
        { id: 'K3', name: 'Days, months, and activities', gen() { const t = r(0, 4); if (t === 0) { const i = r(0, 6); return ch(`What day comes after ${HARI[i]}?`, shuffle([HARI[(i + 1) % 7], HARI[(i + 6) % 7], HARI[(i + 2) % 7], HARI[(i + 3) % 7]]), HARI[(i + 1) % 7], `Order of days: ${HARI.join(', ')}. After ${HARI[i]} comes <b>${HARI[(i + 1) % 7]}</b>.`); } if (t === 1) { const i = r(1, 6); return ch(`What day comes before ${HARI[i]}?`, shuffle([HARI[i - 1], HARI[(i + 1) % 7], HARI[(i + 2) % 7], HARI[(i + 4) % 7]]), HARI[i - 1], `Before ${HARI[i]} comes <b>${HARI[i - 1]}</b>.`); } if (t === 2) { const i = r(0, 10); return ch(`What month comes after ${BULAN[i]}?`, shuffle([BULAN[i + 1], BULAN[(i + 2) % 12], BULAN[(i + 11) % 12], BULAN[(i + 4) % 12]]), BULAN[i + 1], `After ${BULAN[i]} comes <b>${BULAN[i + 1]}</b>.`); } if (t === 3) { const [q, a] = pick([['How many days are in one week?', 7], ['How many months are in one year?', 12]]); return ch(q, shuffle(numOpts(a, 4, 14)), a, `The answer is <b>${a}</b>.`); } const [q, a] = pick([['When do we usually have breakfast?', 'morning'], ['When do we usually sleep soundly and see the moon?', 'night'], ['When is the sun hottest and we eat lunch?', 'midday'], ['When does the sun start to set?', 'late afternoon']]); return ch(q, ['morning', 'midday', 'late afternoon', 'night'], a, `The answer is <b>${a}</b>.`); } },
      ],
    },
    {
      id: 'L', name: 'Money', icon: '💰', color: '#81ecec', grade: 1, sg: '1B · Money (adapted to Rupiah)', ixl: 'HH, OO', km: 'Numbers (money context)',
      tip: 'Play buying and selling with real coins. Let your child pay for snacks and count simple change.',
      skills: [
        { id: 'L1', name: 'Getting to know Rupiah money', gen() { const v = pick([100, 200, 500, 1000, 'n1000', 'n2000', 'n5000', 'n10000', 'n20000']); const val = typeof v === 'string' ? parseInt(v.slice(1)) : v; const pool = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000]; const opts = shuffle([val, ...shuffle(pool.filter((x) => x !== val)).slice(0, 3)]).map(rp); return ch('How much is this money worth?', opts, rp(val), `Look at the number written on it: <b>${rp(val)}</b>.`, { vis: V.money([v]) }); } },
        { id: 'L2', name: 'Counting money', gen() { let items; if (Math.random() < 0.5) { items = Array.from({ length: r(2, 4) }, () => pick([100, 200, 500, 1000])); } else { items = Array.from({ length: r(2, 3) }, () => pick(['n1000', 'n2000', 'n5000'])); } const val = (x) => (typeof x === 'string' ? parseInt(x.slice(1)) : x); items.sort((a, b) => val(b) - val(a)); const tot = items.reduce((s, x) => s + val(x), 0); return inp('How many rupiah is this? (write the number only)', tot, `Add from the largest: ${items.map((x) => rp(val(x))).join(' + ')} = <b>${rp(tot)}</b>.`, { vis: V.money(items), unit: 'Rp', meta: { kind: 'money' } }); } },
        { id: 'L3', name: 'Is there enough money?', gen() { const [e, nm] = pick([['🍞', 'bread'], ['🧃', 'juice'], ['🍦', 'ice cream'], ['📓', 'notebook'], ['🍫', 'chocolate']]); const price = pick([1000, 1500, 2000, 2500, 3000, 4000, 5000]); const items = Array.from({ length: r(2, 3) }, () => pick(['n1000', 'n2000', 500, 1000])); const tot = items.reduce((s, x) => s + (typeof x === 'string' ? parseInt(x.slice(1)) : x), 0); const ok = tot >= price ? 'Yes' : 'No'; return ch(`The price of ${nm} ${e} is <b>${rp(price)}</b>. Is this money enough to buy it?`, ['Yes', 'No'], ok, `The money is ${rp(tot)}. ${rp(tot)} is ${tot >= price ? 'greater than or equal to' : 'less than'} ${rp(price)}, so <b>${ok.toLowerCase()}</b>.`, { vis: V.money(items) }); } },
      ],
    },
    {
      id: 'M', name: 'Data and graphs', icon: '📊', color: '#74b9ff', grade: 1, sg: '1B · Picture Graphs', ixl: 'II, MM', km: 'Data Analysis and Probability',
      tip: 'Make a tally chart together: count the colors of cars passing your house for 5 minutes.',
      skills: [
        { id: 'M1', name: 'Reading pictographs', gen() { const cats = shuffle([['🍎', 'Apple'], ['🍌', 'Banana'], ['🍊', 'Orange'], ['🍇', 'Grape'], ['🥭', 'Mango']]).slice(0, 4); const counts = shuffle(range(1, 8)).slice(0, 4); const rows = cats.map((c, i) => [c[0], c[1], counts[i]]); const vis = V.pictograph('Grade 1 Favorite Fruits', rows, 'Each picture = 1 child'); if (Math.random() < 0.5) { const i = r(0, 3); return inp(`How many children like ${rows[i][1].toLowerCase()}?`, rows[i][2], `Count the pictures in the ${rows[i][1]} row: <b>${rows[i][2]}</b>.`, { vis, meta: { kind: 'count' } }); } const most = Math.random() < 0.5; const v = most ? Math.max(...counts) : Math.min(...counts); const ans = rows.find((x) => x[2] === v)[1]; return ch(`Which fruit is liked by the ${most ? 'most' : 'fewest'} children?`, rows.map((x) => x[1]), ans, `The ${ans} row has ${v} pictures, the ${most ? 'most' : 'fewest'}. The answer is <b>${ans}</b>.`, { vis }); } },
        { id: 'M2', name: 'Tally marks', gen() { const n = r(1, 18); return inp('How many tally marks are there?', n, `Each crossed-out group has 5. ${Math.floor(n / 5)} groups = ${Math.floor(n / 5) * 5}${n % 5 ? `, plus ${n % 5}` : ''}. The answer is <b>${n}</b>.`, { vis: V.tally(n), meta: { kind: 'count' } }); } },
        { id: 'M3', name: 'Comparing data', gen() { const cats = shuffle([['🐱', 'Cat'], ['🐶', 'Dog'], ['🐟', 'Fish'], ['🐦', 'Bird']]).slice(0, 3); const counts = shuffle(range(1, 9)).slice(0, 3); const rows = cats.map((c, i) => [c[0], c[1], counts[i]]); const [x, y] = counts[0] > counts[1] ? [rows[0], rows[1]] : [rows[1], rows[0]]; return inp(`How many more children like ${x[1].toLowerCase()} than ${y[1].toLowerCase()}?`, x[2] - y[2], `${x[1]}: ${x[2]}, ${y[1]}: ${y[2]}. ${x[2]} − ${y[2]} = <b>${x[2] - y[2]}</b>.`, { vis: V.pictograph('Favorite Pets', rows, 'Each picture = 1 child'), meta: { op: '-', a: x[2], b: y[2] } }); } },
      ],
    },
    {
      id: 'N', name: 'Shapes and patterns', icon: '🔷', color: '#e84393', grade: 1, sg: '1A · Shapes and Patterns', ixl: 'JJ, KK, LL', km: 'Geometry; Algebra (patterns)',
      tip: 'Look for shapes at home: wall clock (circle), door (rectangle), milk can (cylinder).',
      skills: [
        { id: 'N1', name: 'Getting to know 2D shapes', gen() { const names = ['triangle', 'square', 'rectangle', 'circle', 'rhombus', 'hexagon']; const n = pick(names); return ch('What is this shape called?', shuffle([n, ...shuffle(names.filter((x) => x !== n)).slice(0, 3)]), n, `This shape is a <b>${n}</b>.`, { vis: V.shape(n, pick(['#ff7a59', '#1fbf9f', '#00b894', '#0984e3', '#e84393'])) }); } },
        { id: 'N2', name: 'Sides and corners', gen() { const data = { "triangle": 3, "square": 4, 'persegi panjang': 4, 'belah ketupat': 4, 'segi enam': 6, "circle": 0, "trapezoid": 4 }; const n = pick(Object.keys(data)); const what = pick(['sides', 'corners']); return inp(`How many ${what} does this ${n} have?`, data[n], n === 'circle' ? 'A circle has no straight sides and no corners. The answer is <b>0</b>.' : `Count the ${what === 'sides' ? 'straight lines' : 'corners'} one by one: <b>${data[n]}</b>.`, { vis: V.shape(n, '#00b894'), meta: { kind: 'count' } }); } },
        { id: 'N3', name: '3D shapes around us', gen() { const m = [['⚽', 'balls'], ['🏀', 'balls'], ['🌍', 'balls'], ['🎲', 'cube'], ['🧊', 'cube'], ['🥫', 'cylinder'], ['🥁', 'cylinder'], ['📦', 'cuboid'], ['🧱', 'cuboid'], ['🍦', 'cone'], ['🎉', 'cone']]; const [e, s] = pick(m); return ch('What shape is this object?', ['balls', 'cube', 'cylinder', 'cuboid', 'cone'], s, `A ${e} is shaped like a <b>${s}</b>.`, { vis: `<div class="bigemoji">${e}</div>` }); } },
        { id: 'N4', name: 'Continuing patterns', gen() { const set = shuffle(['🔴', '🔵', '🟡', '🟢', '⭐', '🌙', '🔺', '🟪']); const pat = pick([[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2], [0, 1, 2, 2]]); const len = pat.length * 2 + r(0, pat.length - 1); const seq = range(0, len - 1).map((i) => set[pat[i % pat.length]]); const ans = set[pat[len % pat.length]]; const opts = shuffle([...new Set([...pat.map((i) => set[i]), set[4], set[5]])]).slice(0, 4); if (!opts.includes(ans)) opts[0] = ans; return ch('What comes next?', shuffle(opts), ans, `The pattern repeats: ${pat.map((i) => set[i]).join(' ')}. Next comes <b>${ans}</b>.`, { vis: V.seq([...seq, '?']) }); } },
      ],
    },
    {
      id: 'O', name: 'Simple fractions', icon: '🍕', color: '#fab1a0', grade: 1, sg: '— (not in 1A/1B)', ixl: 'NN', km: 'Numbers (halves and quarters)',
      tip: 'Cut bread or martabak into 2 and 4 equal parts. Ask "is this a half or a quarter?"',
      skills: [
        { id: 'O1', name: 'Halves and quarters', gen() { const parts = pick([2, 4, 3]); const kind = pick(['circle', 'rect']); const nameOf = { 2: 'one half', 3: 'one third', 4: 'one quarter' }; return ch('What part is shaded?', ['one half', 'one third', 'one quarter'], nameOf[parts], `The shape is divided into ${parts} equal parts and 1 is shaded. That's <b>${nameOf[parts]}</b>.`, { vis: V.fraction(kind, parts, 1) }); } },
        { id: 'O2', name: 'Equal parts', gen() { const eq = Math.random() < 0.5; const parts = pick([2, 3, 4]); return ch('Is this shape divided into equal parts?', ['Yes', 'No'], eq ? 'Yes' : 'No', eq ? 'All parts are the same size. The answer is <b>yes</b>.' : 'Some parts are bigger and some are smaller. The answer is <b>no</b>.', { vis: V.fraction('rect', parts, 0, eq) }); } },
      ],
    },
  ];

  // Pola kesalahan: label, penjelasan untuk orang tua, dan saran latihan di rumah
  const TAGS = {
    'meleset-satu': { label: 'Often off by one', tip: 'When counting, have your child point to and move objects one at a time so nothing is skipped or counted twice.' },
    'tertukar-operasi': { label: 'Mixing up addition and subtraction', tip: 'Before calculating, have your child read the sign or key word aloud: "add/more/altogether" or "subtract/left/away".' },
    'tertukar-digit': { label: 'Mixing up tens and ones', tip: 'Use bundles of 10 straws: the first digit = bundles, the last digit = loose straws.' },
    'simbol-terbalik': { label: 'Mixing up the > and < signs', tip: 'Remind them that the "crocodile\'s mouth" 🐊 always opens toward the larger number.' },
    'menyimpan': { label: 'Forgetting to carry the ten', tip: 'Practice with coins: trade 10 Rp100 coins for 1 Rp1,000 note, just like 10 ones become 1 ten.' },
    'nilai-tempat': { label: 'Doesn\'t understand place value yet', tip: 'Show that the 4 in 47 means 4 tens = 40, not 4.' },
    'jam-tertukar': { label: 'Mixing up the short and long hands', tip: 'Short hand = hours, long hand = minutes. Show a wall clock at each daily routine.' },
    'setengah-jam': { label: 'Confused by "half past" on the clock', tip: 'Half past six means 6:30, halfway to seven o\'clock.' },
    'penggaris': { label: 'Reading a ruler not from 0', tip: 'Teach them to always place the end of the object at 0 on the ruler.' },
    'meminjam': { label: 'Mistakes when borrowing (column subtraction)', tip: 'Children often subtract the smaller digit from the larger in each column (e.g. 52 − 27 answered as 35). Practice with money: trade Rp1,000 for 10 Rp100 coins before taking any.' },
    'pembulatan': { label: 'Confused about rounding direction', tip: 'Use a number line: mark the two nearest tens, then see which is closer. A 5 rounds up.' },
    'konsep': { label: 'Concept not strong yet', tip: 'Repeat with real objects first (concrete), then pictures, then numbers.' },
  };

  const SKILLS = {};
  // Menambahkan bab ke kurikulum; dipakai juga oleh file kelas lain (mis. grade2.js)
  // Bab ber-iman: true hanya masuk UNITS saat konteks islami. Keterampilannya tetap bisa dicari lewat SKILLS[id]
  // (tidak terhitung di Object.keys) agar riwayat jawaban lama tetap terbaca setelah pengaturan dimatikan.
  function register(units) {
    units.forEach((u) => {
      if (u.iman) { if (!IMAN_UNITS.includes(u)) IMAN_UNITS.push(u); } else if (!UNITS.includes(u)) UNITS.push(u);
      u.skills.forEach((s, i) => { s.unit = u.id; s.grade = u.grade; s.code = u.id + '.' + (i + 1); if (u.iman) Object.defineProperty(SKILLS, s.id, { value: s, enumerable: false, configurable: true }); else SKILLS[s.id] = s; });
    });
    if (konteks === 'islami') setKonteks('islami');
  }
  function setKonteks(k) {
    konteks = k === 'islami' ? 'islami' : 'umum';
    const isl = konteks === 'islami';
    NAMA.splice(0, NAMA.length, ...(isl ? NAMA_ISLAMI : ASLI.NAMA));
    BENDA.splice(0, BENDA.length, ...(isl ? BENDA_ISLAMI : ASLI.BENDA));
    IMAN_UNITS.forEach((u) => {
      const i = UNITS.indexOf(u);
      // Bab iman disisipkan setelah bab terakhir kelasnya, supaya tetap dekat dengan bab asalnya
      // (zakat dekat bab Uang, bukan menumpuk di akhir kelas 6).
      if (isl && i < 0) { let at = UNITS.length; UNITS.forEach((x, j) => { if (x.grade === u.grade) at = j + 1; }); UNITS.splice(at, 0, u); }
      if (!isl && i >= 0) UNITS.splice(i, 1);
    });
    return konteks;
  }
  register(UNITS);
  const GRADES = [
    { id: 1, name: 'Grade 1', ixl: 'https://www.ixl.com/math/grade-1/skills', sg: 'Primary Mathematics / Dimensions Math 1A and 1B' },
  ];
  const unitsOf = (g) => UNITS.filter((u) => u.grade === g);

  // Menebak pola kesalahan dari jawaban anak
  function classify(q, given) {
    if (q.optionTags && q.optionTags[given]) return q.optionTags[given];
    const m = q.meta || {};
    const g = parseInt(String(given).replace(/\D/g, ''), 10), c = parseInt(q.answer, 10);
    if (m.kind === 'compare' && opp[q.answer] === given) return 'simbol-terbalik';
    if (m.kind === 'ruler' && g === m.end) return 'penggaris';
    if (!isNaN(g) && !isNaN(c)) {
      if (m.op === '-' && g === m.a + m.b) return 'tertukar-operasi';
      if (m.op === '+' && g === Math.abs(m.a - m.b) && m.a !== m.b) return 'tertukar-operasi';
      if (c >= 10 && g >= 10 && String(g) === String(c).split('').reverse().join('') && g !== c) return 'tertukar-digit';
      if (m.op === '-' && m.regroup) {
        // mengurangi angka kecil dari besar di tiap kolom, tanpa meminjam
        const da = String(m.a).split('').reverse(), db = String(m.b).split('').reverse();
        const naive = +da.map((d, i) => Math.abs(+d - +(db[i] || 0))).reverse().join('');
        if (g === naive) return 'meminjam';
        if (Math.abs(g - c) === 10 || Math.abs(g - c) === 100) return 'meminjam';
      }
      if (m.kind === 'round' && g === m.wrong) return 'pembulatan';
      if (m.regroup && (Math.abs(g - c) === 10 || Math.abs(g - c) === 100)) return 'menyimpan';
      if (Math.abs(g - c) === 1) return 'meleset-satu';
    }
    return 'konsep';
  }

  window.METIQ_CURRICULUM = {
    UNITS, SKILLS, TAGS, GRADES, unitsOf, classify, rp, register, setKonteks, konteks: () => konteks,
    imanUnits: IMAN_UNITS,
    // perangkat pembuat soal untuk file kelas lain
    kit: { r, pick, shuffle, range, rp, numOpts, kata, V, inp, ch, compareQ, BENDA, NAMA, HARI, BULAN, two },
  };
})();
