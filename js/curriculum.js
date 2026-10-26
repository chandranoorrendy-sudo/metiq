/* Metiq — Kurikulum Matematika Kelas 1
 * Disusun dari daftar keterampilan IXL kelas 1 dan alur Singapore Math (Primary 1A/1B):
 * pendekatan Konkret–Piktorial–Abstrak, pasangan bilangan (number bond), membuat 10,
 * model batang (bar model), dan pengenalan perkalian/pembagian sebagai kelompok sama banyak.
 * Konteks disesuaikan untuk Indonesia (Rupiah, "setengah empat", nama hari/bulan).
 */
(function () {
  const r = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const range = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };
  const rp = (n) => 'Rp' + n.toLocaleString('id-ID');

  // Pilihan angka di sekitar jawaban benar
  function numOpts(ans, min = 0, max = ans + 10, count = 4) {
    const s = new Set([ans]);
    const deltas = shuffle([-1, 1, -2, 2, -3, 3, 10, -10]);
    for (const d of deltas) { if (s.size >= count) break; const v = ans + d; if (v >= min && v <= max) s.add(v); }
    let guard = 0;
    while (s.size < count && guard++ < 50) { const v = r(min, Math.max(max, min + count)); s.add(v); }
    return shuffle([...s]).map(String);
  }

  const SATUAN = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  function kata(n) {
    if (n < 10) return SATUAN[n];
    if (n === 10) return 'sepuluh';
    if (n === 11) return 'sebelas';
    if (n < 20) return SATUAN[n - 10] + ' belas';
    if (n === 100) return 'seratus';
    const t = Math.floor(n / 10), o = n % 10;
    return SATUAN[t] + ' puluh' + (o ? ' ' + SATUAN[o] : '');
  }

  const BENDA = [['🍎', 'apel'], ['⭐', 'bintang'], ['🐟', 'ikan'], ['🌸', 'bunga'], ['🚗', 'mobil'], ['🎈', 'balon'],
    ['🐤', 'anak ayam'], ['🍌', 'pisang'], ['⚽', 'bola'], ['🧁', 'kue'], ['🥭', 'mangga'], ['🐱', 'kucing'], ['✏️', 'pensil'], ['🍬', 'permen']];
  const NAMA = ['Budi', 'Siti', 'Andi', 'Rina', 'Dewi', 'Agus', 'Putri', 'Rizky', 'Nadia', 'Bayu', 'Lina', 'Fajar', 'Ayu', 'Dimas'];
  const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const two = () => { const s = shuffle(NAMA); return [s[0], s[1]]; };

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
      if (isNote) return `<span class="note n${val}"><b>${val.toLocaleString('id-ID')}</b><small>RUPIAH</small></span>`;
      return `<span class="coin c${val}">${val}</span>`;
    },
    shape(name, color = '#7c5cff') {
      const P = {
        segitiga: '<polygon points="60,10 112,104 8,104"/>',
        persegi: '<rect x="14" y="14" width="92" height="92"/>',
        'persegi panjang': '<rect x="4" y="30" width="112" height="60"/>',
        lingkaran: '<circle cx="60" cy="60" r="50"/>',
        'belah ketupat': '<polygon points="60,6 106,60 60,114 14,60"/>',
        'segi enam': '<polygon points="32,12 88,12 114,60 88,108 32,108 6,60"/>',
        trapesium: '<polygon points="34,24 86,24 114,96 6,96"/>',
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
        row.forEach(([v, lab, wt]) => { s += `<div class="bm-seg${v === '?' ? ' q' : ''}" style="flex:${(wt || 1)}">${v}${lab ? `<small>${lab}</small>` : ''}</div>`; });
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
    return ch(`Pilih tanda yang tepat.`, ['<', '>', '='], s,
      `${a} ${s === '<' ? 'lebih kecil dari' : s === '>' ? 'lebih besar dari' : 'sama dengan'} ${b}, jadi <b>${a} ${s} ${b}</b>. Ingat: mulut buaya selalu membuka ke bilangan yang lebih besar 🐊.`,
      { vis: V.big(`${a} <span class="q">?</span> ${b}`), optionTags: tags, meta: { kind: 'compare' } });
  }

  /* ---------- Kurikulum ---------- */
  const UNITS = [
    {
      id: 'A', name: 'Bilangan sampai 10', icon: '🔢', color: '#ff7a59', sg: 'Primary 1A Bab 1',
      tip: 'Ajak anak menghitung benda di rumah (sendok, sandal, kancing) sambil menunjuk satu per satu.',
      skills: [
        { id: 'A1', name: 'Membilang benda sampai 10', gen() { const [e, nm] = pick(BENDA), n = r(1, 10); return inp(`Ada berapa ${nm}?`, n, `Hitung sambil menunjuk satu per satu: ${range(1, n).join(', ')}. Jadi ada <b>${n}</b> ${nm}.`, { vis: V.objects(e, n), meta: { kind: 'count' } }); } },
        { id: 'A2', name: 'Bingkai sepuluh', gen() { const n = r(1, 10); return inp('Ada berapa titik di bingkai sepuluh?', n, `Satu baris penuh berisi 5 titik. ${n > 5 ? `Baris atas 5, baris bawah ${n - 5}. 5 + ${n - 5} = <b>${n}</b>.` : `Ada <b>${n}</b> titik.`}`, { vis: V.tenFrame(n), meta: { kind: 'count' } }); } },
        { id: 'A3', name: 'Lambang bilangan dan nama bilangan', gen() { const n = r(0, 20); if (Math.random() < 0.5) { return ch(`Bilangan mana yang ditulis "<b>${kata(n)}</b>"?`, numOpts(n, 0, 20), n, `"${kata(n)}" ditulis <b>${n}</b>.`, { speak: `Bilangan mana yang ditulis ${kata(n)}?` }); } const o = numOpts(n, 0, 20).map((x) => kata(+x)); return ch(`Bagaimana cara menulis ${n} dengan kata?`, o, kata(n), `${n} dibaca <b>${kata(n)}</b>.`, { vis: V.big(n) }); } },
        { id: 'A4', name: 'Lebih banyak atau lebih sedikit', gen() { const s = shuffle(BENDA), a = r(1, 10); let b = r(1, 10); while (b === a) b = r(1, 10); const more = Math.random() < 0.5; const ans = (more ? a > b : a < b) ? s[0][1] : s[1][1]; return ch(`Mana yang lebih ${more ? 'banyak' : 'sedikit'}?`, [s[0][1], s[1][1]], ans, `Ada ${a} ${s[0][1]} dan ${b} ${s[1][1]}. ${Math.max(a, b)} lebih banyak dari ${Math.min(a, b)}. Jawabannya <b>${ans}</b>.`, { vis: V.labeled([[s[0][1], s[0][0], a], [s[1][1], s[1][0], b]]), meta: { kind: 'compare' } }); } },
        { id: 'A5', name: 'Membandingkan dengan tanda <, >, =', gen() { return compareQ(r(0, 10), r(0, 10)); } },
        { id: 'A6', name: 'Bilangan urutan (ke-1, ke-2, ...)', gen() { const an = shuffle(['🐶', '🐱', '🐰', '🐸', '🐵', '🐼', '🦊', '🐯']).slice(0, r(5, 7)); const k = r(1, an.length); const vis = '<div class="ord"><span class="flag">🏁</span>' + an.map((x) => `<span>${x}</span>`).join('') + '</div>'; if (Math.random() < 0.5) { const opts = shuffle([...new Set([k, Math.max(1, k - 1), Math.min(an.length, k + 1), r(1, an.length)])]).slice(0, 4).map((x) => 'ke-' + x); if (!opts.includes('ke-' + k)) opts[0] = 'ke-' + k; return ch(`Dari bendera, ${an[k - 1]} berada di urutan ke berapa?`, shuffle(opts), 'ke-' + k, `Hitung dari bendera: ${an.slice(0, k).map((x, i) => `${x} ke-${i + 1}`).join(', ')}. Jawabannya <b>ke-${k}</b>.`, { vis }); } return ch(`Dari bendera, hewan mana yang ke-${k}?`, shuffle([an[k - 1], ...shuffle(an.filter((x) => x !== an[k - 1])).slice(0, 3)]), an[k - 1], `Hitung dari bendera sampai ke-${k}: <b>${an[k - 1]}</b>.`, { vis }); } },
      ],
    },
    {
      id: 'B', name: 'Pasangan bilangan', icon: '🔗', color: '#7c5cff', sg: 'Primary 1A Bab 2 (Number Bonds)',
      tip: 'Gunakan 10 kancing: pisahkan ke dua tangan, lalu tanya "kalau tangan kiri 3, tangan kanan berapa?"',
      skills: [
        { id: 'B1', name: 'Pasangan bilangan sampai 10', gen() { const w = r(2, 10), a = r(1, w - 1), b = w - a; const hide = Math.random() < 0.8 ? (Math.random() < 0.5 ? 'a' : 'b') : 'w'; const ans = hide === 'a' ? a : hide === 'b' ? b : w; return inp('Berapa bilangan yang hilang?', ans, `${a} dan ${b} membentuk ${w}, karena ${a} + ${b} = ${w}. Jawabannya <b>${ans}</b>.`, { log: `Pasangan bilangan: ${hide === 'w' ? '?' : w} terdiri dari ${hide === 'a' ? '?' : a} dan ${hide === 'b' ? '?' : b}`, vis: V.bond(hide === 'w' ? '?' : w, hide === 'a' ? '?' : a, hide === 'b' ? '?' : b), meta: hide === 'w' ? { op: '+', a, b } : { op: '-', a: w, b: hide === 'a' ? b : a } }); } },
        { id: 'B2', name: 'Membuat 10', gen() { const n = r(1, 9); return inp(`${n} + ? = 10`, 10 - n, `Bingkai sepuluh berisi ${n} titik. Kotak yang kosong ada ${10 - n}. Jadi ${n} + <b>${10 - n}</b> = 10.`, { vis: V.tenFrame(n), meta: { op: '-', a: 10, b: n } }); } },
        { id: 'B3', name: 'Berbagai cara membentuk bilangan', gen() { const n = r(4, 10), a = r(1, n - 1); const right = `${a} dan ${n - a}`; const wrong = new Set(); let g = 0; while (wrong.size < 3 && g++ < 40) { const x = r(1, n), y = r(1, n); if (x + y !== n && x + y >= n - 2 && x + y <= n + 2) wrong.add(`${x} dan ${y}`); } return ch(`Pasangan mana yang membentuk <b>${n}</b>?`, shuffle([right, ...wrong]), right, `${a} + ${n - a} = ${n}, jadi <b>${right}</b> membentuk ${n}.`); } },
      ],
    },
    {
      id: 'C', name: 'Penjumlahan sampai 10', icon: '➕', color: '#00b894', sg: 'Primary 1A Bab 3',
      tip: 'Saat makan buah, tanya "ada 3 jeruk, ayah tambah 2, jadi berapa?" Minta anak menghitung lanjut dari 3: "4, 5".',
      skills: [
        { id: 'C1', name: 'Penjumlahan dengan gambar', gen() { const [e] = pick(BENDA), a = r(1, 6), b = r(1, 10 - a); return inp(`${a} + ${b} = ?`, a + b, `Gabungkan kedua kelompok lalu hitung semuanya: ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
        { id: 'C2', name: 'Menghitung maju dengan garis bilangan', gen() { const a = r(1, 8), b = r(1, 10 - a); return inp(`Mulai dari ${a}, lompat ${b} kali ke kanan. Sampai di angka berapa?`, a + b, `Mulai di ${a}, lalu hitung maju ${b} langkah: ${range(a + 1, a + b).join(', ')}. Jadi ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.numberLine(0, 10, { from: a, to: a + b }), meta: { op: '+', a, b } }); } },
        { id: 'C3', name: 'Fakta penjumlahan sampai 10', gen() { const [a, b] = add10(); return inp(`${a} + ${b} = ?`, a + b, `${a} + ${b} = <b>${a + b}</b>. Tips: mulai dari bilangan yang lebih besar, lalu hitung maju.`, { vis: V.big(`${a} + ${b} = <span class="q">?</span>`), meta: { op: '+', a, b } }); } },
        { id: 'C4', name: 'Soal cerita penjumlahan sampai 10', gen() { const [e, nm] = pick(BENDA), a = r(1, 7), b = r(1, 10 - a), [n1, n2] = two(); const t = pick([`${n1} punya ${a} ${nm}. Ibu memberi ${b} ${nm} lagi. Berapa ${nm} ${n1} sekarang?`, `${n1} membawa ${a} ${nm}. ${n2} membawa ${b} ${nm}. Berapa ${nm} mereka semuanya?`, `Di meja ada ${a} ${nm}. Kakak menaruh ${b} ${nm} lagi. Sekarang ada berapa ${nm}?`]); return inp(t, a + b, `Kata "lagi" atau "semuanya" berarti digabung (tambah). ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
      ],
    },
    {
      id: 'D', name: 'Pengurangan sampai 10', icon: '➖', color: '#0984e3', sg: 'Primary 1A Bab 4',
      tip: 'Main "toko-tokoan": ada 8 kue, pembeli mengambil 3. Biarkan anak mengambil benda sungguhan lalu menghitung sisanya.',
      skills: [
        { id: 'D1', name: 'Pengurangan dengan gambar', gen() { const [e] = pick(BENDA), a = r(2, 10), b = r(1, a); return inp(`${a} − ${b} = ?`, a - b, `Ada ${a}, dicoret ${b}. Hitung yang tidak dicoret: <b>${a - b}</b>.`, { vis: V.objects(e, a, b), meta: { op: '-', a, b } }); } },
        { id: 'D2', name: 'Menghitung mundur dengan garis bilangan', gen() { const a = r(2, 10), b = r(1, a); return inp(`Mulai dari ${a}, lompat ${b} kali ke kiri. Sampai di angka berapa?`, a - b, `Mulai di ${a}, hitung mundur ${b} langkah: ${range(a - b, a - 1).reverse().join(', ')}. Jadi ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.numberLine(0, 10, { from: a, to: a - b }), meta: { op: '-', a, b } }); } },
        { id: 'D3', name: 'Fakta pengurangan sampai 10', gen() { const a = r(1, 10), b = r(0, a); return inp(`${a} − ${b} = ?`, a - b, `${a} − ${b} = <b>${a - b}</b>. Tips: pikirkan pasangan bilangan, ${b} + ? = ${a}.`, { vis: V.big(`${a} − ${b} = <span class="q">?</span>`), meta: { op: '-', a, b } }); } },
        { id: 'D4', name: 'Soal cerita pengurangan sampai 10', gen() { const a = r(3, 10), b = r(1, a - 1), [n1] = two(); const [e, t] = pick([['🎈', `${n1} punya ${a} balon. ${b} balon meletus. Berapa balon yang tersisa?`], ['🐦', `Ada ${a} burung di pohon. ${b} burung terbang pergi. Berapa burung yang masih di pohon?`], ['🍪', `Ibu membuat ${a} kue. ${n1} makan ${b} kue. Berapa kue yang tersisa?`], ['🍬', `${n1} punya ${a} permen. Ia memberi ${b} permen kepada adik. Berapa permen ${n1} sekarang?`]]); return inp(t, a - b, `Kata "tersisa", "pergi", atau "memberi" berarti dikurangi. ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.objects(e, a, b), meta: { op: '-', a, b } }); } },
        { id: 'D5', name: 'Keluarga bilangan', gen() { let a = r(1, 5), b = r(a + 1, 9); if (a + b > 10) b = 10 - a; if (b === a) b = a + 1; const c = a + b; const good = pick([`${a} + ${b} = ${c}`, `${b} + ${a} = ${c}`, `${c} − ${a} = ${b}`, `${c} − ${b} = ${a}`]); const bad = shuffle([`${a} − ${b} = ${c}`, `${a} + ${c} = ${b}`, `${b} − ${c} = ${a}`, `${c} + ${b} = ${a}`]).slice(0, 3); return ch(`Mana yang termasuk keluarga bilangan <b>${a}, ${b}, ${c}</b>?`, shuffle([good, ...bad]), good, `Keluarga ${a}, ${b}, ${c}: ${a} + ${b} = ${c}, ${b} + ${a} = ${c}, ${c} − ${a} = ${b}, ${c} − ${b} = ${a}. Jawabannya <b>${good}</b>.`, { vis: V.bond(c, a, b) }); } },
      ],
    },
    {
      id: 'E', name: 'Bilangan sampai 20', icon: '🔟', color: '#e17055', sg: 'Primary 1A Bab 6',
      tip: 'Ikat 10 sedotan dengan karet. Tunjukkan bahwa 13 = 1 ikat sepuluh dan 3 lepas.',
      skills: [
        { id: 'E1', name: 'Sepuluh dan satuan (11–20)', gen() { const n = r(11, 20); const t = Math.floor(n / 10), o = n % 10; if (Math.random() < 0.6) return inp('Bilangan berapa yang ditunjukkan?', n, `${t} batang sepuluh = ${t * 10}, ditambah ${o} kubus satuan. ${t * 10} + ${o} = <b>${n}</b>.`, { vis: V.blocks(t, o), meta: { kind: 'place' } }); return inp(`${n} = 10 + ?`, n - 10, `${n} terdiri dari 1 sepuluh dan ${n - 10} satuan. Jawabannya <b>${n - 10}</b>.`, { vis: V.blocks(t, o), meta: { op: '-', a: n, b: 10 } }); } },
        { id: 'E2', name: 'Terbesar dan terkecil sampai 20', gen() { const nums = shuffle(range(0, 20)).slice(0, 4); const big = Math.random() < 0.5; const ans = big ? Math.max(...nums) : Math.min(...nums); return ch(`Bilangan mana yang paling ${big ? 'besar' : 'kecil'}?`, nums, ans, `Urutkan: ${nums.slice().sort((a, b) => a - b).join(', ')}. Yang paling ${big ? 'besar' : 'kecil'} adalah <b>${ans}</b>.`); } },
        { id: 'E3', name: 'Pola bilangan sampai 20', gen() { const step = pick([1, 1, 2, -1]); const len = 5; let start = step > 0 ? r(0, 20 - step * (len - 1)) : r(len - 1, 20); const seq = range(0, len - 1).map((i) => start + i * step); const k = r(1, len - 1); const ans = seq[k]; const show = seq.map((v, i) => (i === k ? '?' : v)); return inp('Bilangan berapa yang hilang?', ans, `Polanya ${step > 0 ? 'bertambah' : 'berkurang'} ${Math.abs(step)} setiap langkah. Jadi bilangan yang hilang adalah <b>${ans}</b>.`, { log: 'Bilangan yang hilang: ' + show.join(', '), vis: V.seq(show), meta: { kind: 'seq' } }); } },
      ],
    },
    {
      id: 'F', name: 'Penjumlahan dan pengurangan sampai 20', icon: '🧮', color: '#00cec9', sg: 'Primary 1A Bab 7 (Make 10, Doubles)',
      tip: 'Latih "membuat 10": 8 + 5 → 8 butuh 2 untuk jadi 10, sisa 3, jadi 10 + 3 = 13.',
      skills: [
        { id: 'F1', name: 'Penjumlahan dobel dan hampir dobel', gen() { const a = r(1, 9); if (Math.random() < 0.55) return inp(`${a} + ${a} = ?`, a * 2, `Dobel ${a} artinya ${a} dua kali: ${a} + ${a} = <b>${a * 2}</b>.`, { vis: V.big(`${a} + ${a} = <span class="q">?</span>`), meta: { op: '+', a, b: a } }); return inp(`${a} + ${a + 1} = ?`, 2 * a + 1, `Gunakan dobel: ${a} + ${a} = ${2 * a}. Karena ${a + 1} satu lebih dari ${a}, jawabannya ${2 * a} + 1 = <b>${2 * a + 1}</b>.`, { vis: V.big(`${a} + ${a + 1} = <span class="q">?</span>`), meta: { op: '+', a, b: a + 1 } }); } },
        { id: 'F2', name: 'Membuat 10 untuk menjumlah', gen() { const a = r(6, 9), b = r(11 - a, 9), need = 10 - a, rest = b - need; if (Math.random() < 0.5) return inp(`${a} + ${b} = 10 + ?`, rest, `${a} butuh ${need} untuk menjadi 10. Ambil ${need} dari ${b}, sisanya <b>${rest}</b>. Jadi ${a} + ${b} = 10 + ${rest} = ${10 + rest}.`, { vis: V.bond(b, need, '?'), meta: { op: '-', a: b, b: need } }); return inp(`${a} + ${b} = ?`, a + b, `Buat 10 dulu: ${a} + ${need} = 10. Sisa dari ${b} adalah ${rest}. 10 + ${rest} = <b>${a + b}</b>.`, { vis: V.tenFrame(a, 2, 'red') + V.objects('🔵', b), meta: { op: '+', a, b } }); } },
        { id: 'F3', name: 'Penjumlahan sampai 20', gen() { const a = r(2, 12), b = r(1, 20 - a); return inp(`${a} + ${b} = ?`, a + b, `${a} + ${b} = <b>${a + b}</b>.${a + b > 10 && a < 10 && b < 10 ? ` Coba buat 10: ${Math.max(a, b)} + ${10 - Math.max(a, b)} = 10, lalu tambah ${a + b - 10}.` : ''}`, { vis: V.big(`${a} + ${b} = <span class="q">?</span>`), meta: { op: '+', a, b } }); } },
        { id: 'F4', name: 'Pengurangan sampai 20', gen() { const a = r(11, 20), b = r(1, a); return inp(`${a} − ${b} = ?`, a - b, `${a} − ${b} = <b>${a - b}</b>.${b < 10 && a - 10 < b ? ` Tips: ${a} = 10 + ${a - 10}. Ambil ${b} dari 10 sisa ${10 - b}, lalu tambah ${a - 10}: ${10 - b} + ${a - 10} = ${a - b}.` : ''}`, { vis: V.big(`${a} − ${b} = <span class="q">?</span>`), meta: { op: '-', a, b } }); } },
        { id: 'F5', name: 'Menjumlah tiga bilangan', gen() { const a = r(1, 9), b = r(1, 9), c = r(1, Math.max(1, Math.min(9, 20 - a - b))); const s = a + b + c; let hint = `${a} + ${b} = ${a + b}, lalu ${a + b} + ${c} = ${s}`; if (a + c === 10) hint = `Cari pasangan 10 dulu: ${a} + ${c} = 10, lalu 10 + ${b} = ${s}`; else if (b + c === 10) hint = `Cari pasangan 10 dulu: ${b} + ${c} = 10, lalu ${a} + 10 = ${s}`; return inp(`${a} + ${b} + ${c} = ?`, s, `${hint}. Jawabannya <b>${s}</b>.`, { vis: V.big(`${a} + ${b} + ${c} = <span class="q">?</span>`) }); } },
        { id: 'F6', name: 'Soal cerita dengan model batang', gen() { const [n1, n2] = two(), [, nm] = pick(BENDA); const kind = pick(['add', 'sub', 'cmp']); if (kind === 'add') { const a = r(3, 12), b = r(2, 20 - a); return inp(`${n1} punya ${a} ${nm}. ${n2} punya ${b} ${nm}. Berapa ${nm} mereka semuanya?`, a + b, `Model batang: dua bagian digabung menjadi keseluruhan. ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.barModel([[[a, n1, a], [b, n2, b]]], '?'), meta: { op: '+', a, b } }); } if (kind === 'sub') { const a = r(8, 20), b = r(2, a - 2); return inp(`Ada ${a} ${nm} di keranjang. ${b} ${nm} diambil ${n1}. Berapa ${nm} yang tersisa?`, a - b, `Keseluruhan ${a}, satu bagian ${b}. Bagian lainnya ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.barModel([[[b, 'diambil', b], ['?', 'sisa', a - b]]], a), meta: { op: '-', a, b } }); } const b = r(2, 10), a = b + r(1, 9); return inp(`${n1} punya ${a} ${nm}. ${n2} punya ${b} ${nm}. Berapa lebih banyak ${nm} ${n1} daripada ${n2}?`, a - b, `Bandingkan dua batang. Selisihnya ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.barModel([[[a, n1, a]], [[b, n2, b], ['?', 'selisih', a - b]]]), meta: { op: '-', a, b } }); } },
        { id: 'F7', name: 'Benar atau salah?', gen() { const plus = Math.random() < 0.5; let a, b, c; if (plus) { a = r(1, 10); b = r(1, 20 - a); c = a + b; } else { a = r(5, 20); b = r(1, a); c = a - b; } const truth = Math.random() < 0.5; const shown = truth ? c : c + pick([-2, -1, 1, 2]); const eq = `${a} ${plus ? '+' : '−'} ${b} = ${Math.max(0, shown)}`; const real = Math.max(0, shown) === c; return ch(`Apakah kalimat ini benar?`, ['Benar', 'Salah'], real ? 'Benar' : 'Salah', `${a} ${plus ? '+' : '−'} ${b} = ${c}. ${real ? 'Jadi kalimat itu <b>benar</b>.' : `Bukan ${Math.max(0, shown)}, jadi kalimat itu <b>salah</b>.`}`, { vis: V.big(eq) }); } },
        { id: 'F8', name: 'Lengkapi kalimat matematika', gen() { const c = r(5, 20), a = r(1, c - 1); if (Math.random() < 0.5) return inp(`${a} + ? = ${c}`, c - a, `Berapa yang ditambahkan ke ${a} agar menjadi ${c}? Hitung maju dari ${a} sampai ${c}: <b>${c - a}</b> langkah.`, { vis: V.big(`${a} + <span class="q">?</span> = ${c}`), meta: { op: '-', a: c, b: a } }); return inp(`${c} − ? = ${a}`, c - a, `${c} dikurangi berapa agar tinggal ${a}? ${c} − ${c - a} = ${a}. Jawabannya <b>${c - a}</b>.`, { vis: V.big(`${c} − <span class="q">?</span> = ${a}`), meta: { op: '-', a: c, b: a } }); } },
      ],
    },
    {
      id: 'G', name: 'Bilangan sampai 100', icon: '💯', color: '#fdcb6e', sg: 'Primary 1B Bab 10 & 16',
      tip: 'Gunakan kalender atau tabel 1–100. Tanya "10 lebih banyak dari 34 berapa?" dan tunjuk angka di bawahnya.',
      skills: [
        { id: 'G1', name: 'Puluhan dan satuan sampai 100', gen() { const t = r(2, 9), o = r(0, 9), n = t * 10 + o; if (Math.random() < 0.6) return inp('Bilangan berapa yang ditunjukkan?', n, `${t} puluhan = ${t * 10}, ${o} satuan = ${o}. ${t * 10} + ${o} = <b>${n}</b>.`, { vis: V.blocks(t, o), meta: { kind: 'place' } }); return inp(`${t} puluhan dan ${o} satuan adalah bilangan berapa?`, n, `Angka puluhan ditulis di depan: <b>${n}</b>.`, { meta: { kind: 'place' } }); } },
        { id: 'G2', name: 'Nilai tempat', gen() { let t = r(2, 9), o = r(1, 9); while (o === t) o = r(1, 9); const n = t * 10 + o; if (Math.random() < 0.5) { const tags = {}; tags[t] = 'nilai-tempat'; return ch(`Pada bilangan <b>${n}</b>, angka ${t} bernilai berapa?`, shuffle([t * 10, t, o * 10, o]), t * 10, `Angka ${t} ada di tempat puluhan, jadi nilainya ${t} × 10 = <b>${t * 10}</b>.`, { vis: V.blocks(t, o), optionTags: tags }); } return inp(`Ada berapa puluhan pada bilangan ${n}?`, t, `${n} = ${t} puluhan dan ${o} satuan. Jawabannya <b>${t}</b>.`, { meta: { kind: 'place' } }); } },
        { id: 'G3', name: 'Membandingkan bilangan sampai 100', gen() { const a = r(10, 99); const b = Math.random() < 0.4 ? Math.floor(a / 10) * 10 + r(0, 9) : r(10, 99); return compareQ(a, b); } },
        { id: 'G4', name: 'Lompat hitung 2, 5, dan 10', gen() { const step = pick([2, 5, 10]); const max = step === 10 ? 120 : 100; const start = step * r(0, Math.floor((max - step * 4) / step)); const seq = range(0, 4).map((i) => start + i * step); const k = r(1, 4); return inp(`Lompat hitung ${step}-an. Bilangan berapa yang hilang?`, seq[k], `Setiap langkah bertambah ${step}: ${seq.join(', ')}. Jawabannya <b>${seq[k]}</b>.`, { log: `Lompat ${step}-an: ` + seq.map((v, i) => (i === k ? '?' : v)).join(', '), vis: V.seq(seq.map((v, i) => (i === k ? '?' : v))), meta: { kind: 'seq' } }); } },
        { id: 'G5', name: 'Tabel ratusan: 1 dan 10 lebih/kurang', gen() { let n = r(12, 88); while (n % 10 < 2) n = r(12, 88); const rows = [[n - 11, n - 10, n - 9], [n - 1, n, n + 1], [n + 9, n + 10, n + 11]]; const ri = r(0, 2), ci = r(0, 2); if (ri === 1 && ci === 1) return inp(`Berapa bilangan yang 10 lebih banyak dari ${n}?`, n + 10, `10 lebih banyak berarti puluhan bertambah 1: ${n} → <b>${n + 10}</b>. Di tabel ratusan, letaknya tepat di bawah.`, { meta: { op: '+', a: n, b: 10 } }); const ans = rows[ri][ci]; const show = rows.map((row, i) => row.map((v, j) => (i === ri && j === ci ? '?' : v))); return inp('Bilangan berapa yang hilang di tabel ratusan?', ans, `Ke kanan bertambah 1, ke bawah bertambah 10. Jawabannya <b>${ans}</b>.`, { vis: V.grid(show), meta: { kind: 'place' } }); } },
        { id: 'G6', name: 'Mengurutkan bilangan', gen() { const nums = shuffle(range(10, 99)).slice(0, 3); const asc = Math.random() < 0.6; const sorted = nums.slice().sort((a, b) => (asc ? a - b : b - a)); const ok = sorted.join(', '); const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map((p) => p.map((i) => sorted[i]).join(', ')); return ch(`Urutkan dari yang paling ${asc ? 'kecil' : 'besar'}.`, shuffle([ok, ...shuffle(perms.filter((p) => p !== ok)).slice(0, 3)]), ok, `Bandingkan puluhan dulu, lalu satuan. Urutannya <b>${ok}</b>.`, { vis: V.seq(nums) }); } },
      ],
    },
    {
      id: 'H', name: 'Penjumlahan dan pengurangan sampai 100', icon: '🚀', color: '#a29bfe', sg: 'Primary 1B Bab 13 & 17',
      tip: 'Tulis soal bersusun: satuan di bawah satuan, puluhan di bawah puluhan. Selalu mulai dari satuan.',
      skills: [
        { id: 'H1', name: 'Menjumlah dan mengurangi puluhan', gen() { const a = r(1, 8), b = r(1, 9 - a); if (Math.random() < 0.5) return inp(`${a * 10} + ${b * 10} = ?`, (a + b) * 10, `${a} puluh + ${b} puluh = ${a + b} puluh = <b>${(a + b) * 10}</b>.`, { vis: V.blocks(a, 0) + V.blocks(b, 0), meta: { op: '+', a: a * 10, b: b * 10 } }); const x = a + b; return inp(`${x * 10} − ${b * 10} = ?`, a * 10, `${x} puluh − ${b} puluh = ${a} puluh = <b>${a * 10}</b>.`, { vis: V.big(`${x * 10} − ${b * 10} = <span class="q">?</span>`), meta: { op: '-', a: x * 10, b: b * 10 } }); } },
        { id: 'H2', name: 'Dua angka dan satu angka (tanpa menyimpan)', gen() { const t = r(1, 9), o = r(0, 8); const a = t * 10 + o; if (Math.random() < 0.5) { const b = r(1, 9 - o); return inp(`${a} + ${b} = ?`, a + b, `Jumlahkan satuan: ${o} + ${b} = ${o + b}. Puluhan tetap ${t}. Jawabannya <b>${a + b}</b>.`, { vis: V.blocks(t, o), meta: { op: '+', a, b } }); } const a2 = t * 10 + r(1, 9), b = r(1, a2 % 10); return inp(`${a2} − ${b} = ?`, a2 - b, `Kurangi satuan: ${a2 % 10} − ${b} = ${a2 % 10 - b}. Puluhan tetap ${t}. Jawabannya <b>${a2 - b}</b>.`, { vis: V.blocks(t, a2 % 10), meta: { op: '-', a: a2, b } }); } },
        { id: 'H3', name: 'Menjumlah dua angka (tanpa menyimpan)', gen() { const t1 = r(1, 8), t2 = r(1, 9 - t1), o1 = r(0, 9), o2 = r(0, 9 - o1); const a = t1 * 10 + o1, b = t2 * 10 + o2; return inp(`${a} + ${b} = ?`, a + b, `Satuan: ${o1} + ${o2} = ${o1 + o2}. Puluhan: ${t1} + ${t2} = ${t1 + t2}. Jawabannya <b>${a + b}</b>.`, { vis: `<div class="stack"><span>${a}</span><span>+ ${b}</span><span class="line">?</span></div>`, meta: { op: '+', a, b } }); } },
        { id: 'H4', name: 'Menjumlah dengan menyimpan', gen() { const t = r(1, 8), o = r(2, 9); const a = t * 10 + o; let b; if (Math.random() < 0.6) b = r(10 - o, 9); else { const o2 = r(10 - o, 9), t2 = r(1, Math.max(1, 8 - t)); b = t2 * 10 + o2; } if (a + b > 100) b = 100 - a; const so = (a % 10) + (b % 10); return inp(`${a} + ${b} = ?`, a + b, `Satuan: ${a % 10} + ${b % 10} = ${so}. Itu lebih dari 9, jadi simpan 1 puluhan. Puluhan: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 = ${Math.floor((a + b) / 10)}. Jawabannya <b>${a + b}</b>.`, { vis: `<div class="stack"><span>${a}</span><span>+ ${b}</span><span class="line">?</span></div>`, meta: { op: '+', a, b, regroup: so >= 10 } }); } },
        { id: 'H5', name: 'Mengurangi dua angka (tanpa meminjam)', gen() { const t1 = r(2, 9), t2 = r(1, t1), o1 = r(0, 9), o2 = r(0, o1); const a = t1 * 10 + o1, b = t2 * 10 + o2; return inp(`${a} − ${b} = ?`, a - b, `Satuan: ${o1} − ${o2} = ${o1 - o2}. Puluhan: ${t1} − ${t2} = ${t1 - t2}. Jawabannya <b>${a - b}</b>.`, { vis: `<div class="stack"><span>${a}</span><span>− ${b}</span><span class="line">?</span></div>`, meta: { op: '-', a, b } }); } },
        { id: 'H6', name: 'Soal cerita sampai 100', gen() { const [n1] = two(); if (Math.random() < 0.5) { const a = r(10, 60), b = r(10, Math.min(39, 99 - a)); return inp(pick([`Perpustakaan punya ${a} buku cerita dan ${b} buku pelajaran. Berapa semua bukunya?`, `${n1} mengumpulkan ${a} kelereng. Kakak memberi ${b} kelereng lagi. Berapa kelereng ${n1} sekarang?`]), a + b, `Digabung berarti tambah: ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.barModel([[[a, '', a], [b, '', b]]], '?'), meta: { op: '+', a, b, regroup: (a % 10) + (b % 10) >= 10 } }); } const a = r(30, 99), b = r(10, a - 5); const bb = Math.floor(b / 10) * 10 + Math.min(b % 10, a % 10); return inp(pick([`Ada ${a} kursi di aula. ${bb} kursi sudah diduduki. Berapa kursi yang masih kosong?`, `Pak tani memetik ${a} mangga. ${bb} mangga dijual. Berapa mangga yang tersisa?`]), a - bb, `Sisa berarti kurang: ${a} − ${bb} = <b>${a - bb}</b>.`, { vis: V.barModel([[[bb, '', bb], ['?', '', a - bb]]], a), meta: { op: '-', a, b: bb } }); } },
      ],
    },
    {
      id: 'I', name: 'Perkalian dan pembagian awal', icon: '🍱', color: '#fd79a8', sg: 'Primary 1B Bab 18 & 19',
      tip: 'Saat menata piring, tanya "ada 3 piring, tiap piring 2 kue, semuanya berapa?" Bagikan camilan sama rata ke saudara.',
      skills: [
        { id: 'I1', name: 'Kelompok sama banyak', gen() { const g = r(2, 5), e = r(2, 5), [em, nm] = pick([['🍪', 'kue'], ['🍓', 'stroberi'], ['🥚', 'telur'], ['🍬', 'permen']]); const vis = '<div class="eqg">' + range(1, g).map(() => `<div class="plate">${em.repeat(e)}</div>`).join('') + '</div>'; return inp(`Ada ${g} piring. Tiap piring berisi ${e} ${nm}. Berapa ${nm} semuanya?`, g * e, `${g} kelompok berisi ${e}: ${Array(g).fill(e).join(' + ')} = <b>${g * e}</b>.`, { vis, meta: { op: 'x', a: g, b: e } }); } },
        { id: 'I2', name: 'Penjumlahan berulang', gen() { const g = r(2, 5), e = r(2, 5); const rep = (x, k) => Array(k).fill(x).join(' + '); const good = rep(e, g); const bad = new Set([rep(e, g + 1), rep(e, Math.max(2, g - 1)), `${g} + ${e}`]); if (g !== e) bad.add(rep(g, e)); bad.delete(good); const vis = '<div class="eqg">' + range(1, g).map(() => `<div class="plate">${'🍎'.repeat(e)}</div>`).join('') + '</div>'; return ch('Kalimat mana yang sesuai dengan gambar?', shuffle([good, ...shuffle([...bad]).slice(0, 3)]), good, `Ada ${g} kelompok, tiap kelompok ${e}. Jadi ${e} dijumlahkan ${g} kali: <b>${good}</b>.`, { vis }); } },
        { id: 'I3', name: 'Berbagi sama rata', gen() { const g = r(2, 5), e = r(2, 5), tot = g * e; return inp(`${tot} permen dibagi sama rata kepada ${g} anak. Tiap anak mendapat berapa permen?`, e, `Bagikan satu per satu ke ${g} anak sampai habis. Tiap anak mendapat <b>${e}</b>, karena ${Array(g).fill(e).join(' + ')} = ${tot}.`, { vis: V.objects('🍬', tot) + '<div class="kids">' + '🧒'.repeat(g) + '</div>', meta: { op: '/', a: tot, b: g } }); } },
      ],
    },
    {
      id: 'J', name: 'Pengukuran', icon: '📏', color: '#55efc4', sg: 'Primary 1A Bab 9 & 1B Bab 15',
      tip: 'Ukur meja dengan jengkal atau pensil. Bandingkan berat buku dan sandal dengan dua tangan.',
      skills: [
        { id: 'J1', name: 'Lebih panjang, lebih pendek', gen() { const cols = shuffle([['merah', '#ff6b6b'], ['biru', '#4d96ff'], ['hijau', '#2ecc71'], ['kuning', '#f9c74f']]).slice(0, 3); const lens = shuffle(range(3, 13)).slice(0, 3); const bars = cols.map(([nm, c], i) => ({ label: 'Pita ' + nm, len: lens[i], color: c })); const long = Math.random() < 0.5; const idx = lens.indexOf(long ? Math.max(...lens) : Math.min(...lens)); return ch(`Pita mana yang paling ${long ? 'panjang' : 'pendek'}?`, bars.map((b) => b.label), bars[idx].label, `Bandingkan ujung kanan setiap pita (semua mulai dari garis yang sama). <b>${bars[idx].label}</b> paling ${long ? 'panjang' : 'pendek'}.`, { vis: V.bars(bars) }); } },
        { id: 'J2', name: 'Mengukur dengan satuan tak baku', gen() { const n = r(2, 8); return inp('Berapa klip panjang pita hijau ini?', n, `Hitung klip dari ujung kiri sampai ujung kanan pita: <b>${n}</b> klip.`, { vis: V.clips(n), meta: { kind: 'count' } }); } },
        { id: 'J3', name: 'Mengukur dengan penggaris (cm)', gen() { const start = Math.random() < 0.7 ? 0 : r(1, 3); const len = r(2, 12 - start); const extra = start ? { optionTags: {} } : {}; const q = inp('Berapa sentimeter panjang pensil ini?', len, start ? `Pensil mulai di ${start}, berakhir di ${start + len}. Panjangnya ${start + len} − ${start} = <b>${len}</b> cm.` : `Ujung pensil mulai di 0 dan berakhir di ${len}. Panjangnya <b>${len}</b> cm.`, Object.assign({ vis: V.ruler(len, start), meta: { kind: 'ruler', start, end: start + len } }, extra)); return q; } },
        { id: 'J4', name: 'Lebih berat, lebih ringan', gen() { const items = [['🐘', 'gajah', 9], ['🚗', 'mobil', 8], ['🐄', 'sapi', 7], ['🐕', 'anjing', 5], ['🍉', 'semangka', 4], ['📚', 'tumpukan buku', 3], ['🍎', 'apel', 2], ['🪶', 'bulu', 1], ['🎈', 'balon', 0]]; const [x, y] = shuffle(items).slice(0, 2); const heavy = Math.random() < 0.5; const leftHeavy = x[2] > y[2]; const ans = heavy ? (leftHeavy ? x[1] : y[1]) : (leftHeavy ? y[1] : x[1]); return ch(`Mana yang lebih ${heavy ? 'berat' : 'ringan'}?`, [x[1], y[1]], ans, `Sisi timbangan yang turun lebih berat, sisi yang naik lebih ringan. Jawabannya <b>${ans}</b>.`, { vis: V.scale(x[0], y[0], leftHeavy) }); } },
      ],
    },
    {
      id: 'K', name: 'Waktu', icon: '⏰', color: '#ffeaa7', sg: 'Primary 1B Bab 14',
      tip: 'Tanyakan jam saat kegiatan rutin (bangun, makan siang, tidur). Ingat: "setengah tujuh" = pukul 06.30.',
      skills: [
        { id: 'K1', name: 'Membaca jam (tepat)', gen() { const h = r(1, 12); const f = (x) => `pukul ${x}.00`; const opts = new Set([f(h), f(h % 12 + 1), f(h === 1 ? 12 : h - 1)]); const swapped = `pukul 12.${String(h * 5).padStart(2, '0')}`; if (h !== 12) opts.add(swapped); const tags = {}; tags[swapped] = 'jam-tertukar'; return ch('Pukul berapa sekarang?', shuffle([...opts]), f(h), `Jarum pendek menunjuk angka ${h}, jarum panjang menunjuk angka 12. Jadi <b>pukul ${h}.00</b>.`, { vis: V.clock(h, 0), optionTags: tags }); } },
        { id: 'K2', name: 'Membaca jam (setengah)', gen() { const h = r(1, 12), nx = h % 12 + 1; if (Math.random() < 0.55) { const tags = {}; tags[`pukul ${nx}.30`] = 'setengah-jam'; return ch('Pukul berapa sekarang?', shuffle([...new Set([`pukul ${h}.30`, `pukul ${nx}.30`, `pukul ${h}.00`, `pukul 6.${String(h * 5).padStart(2, '0')}`, `pukul ${nx}.00`])].slice(0, 4)), `pukul ${h}.30`, `Jarum panjang di angka 6 berarti 30 menit. Jarum pendek ada di antara ${h} dan ${nx}, jadi masih jam ${h}. <b>Pukul ${h}.30</b> atau "setengah ${kata(nx)}".`, { vis: V.clock(h, 30), optionTags: tags }); } const tags = {}; tags[`setengah ${kata(h)}`] = 'setengah-jam'; return ch(`Pukul ${h}.30 disebut juga...`, shuffle([`setengah ${kata(nx)}`, `setengah ${kata(h)}`, `${kata(h)} tepat`, `${kata(nx)} tepat`]), `setengah ${kata(nx)}`, `Pukul ${h}.30 adalah setengah jalan menuju pukul ${nx}, jadi disebut <b>setengah ${kata(nx)}</b>.`, { vis: V.clock(h, 30), optionTags: tags }); } },
        { id: 'K3', name: 'Hari, bulan, dan kegiatan', gen() { const t = r(0, 4); if (t === 0) { const i = r(0, 6); return ch(`Hari apa sesudah hari ${HARI[i]}?`, shuffle([HARI[(i + 1) % 7], HARI[(i + 6) % 7], HARI[(i + 2) % 7], HARI[(i + 3) % 7]]), HARI[(i + 1) % 7], `Urutan hari: ${HARI.join(', ')}. Sesudah ${HARI[i]} adalah <b>${HARI[(i + 1) % 7]}</b>.`); } if (t === 1) { const i = r(1, 6); return ch(`Hari apa sebelum hari ${HARI[i]}?`, shuffle([HARI[i - 1], HARI[(i + 1) % 7], HARI[(i + 2) % 7], HARI[(i + 4) % 7]]), HARI[i - 1], `Sebelum ${HARI[i]} adalah <b>${HARI[i - 1]}</b>.`); } if (t === 2) { const i = r(0, 10); return ch(`Bulan apa sesudah ${BULAN[i]}?`, shuffle([BULAN[i + 1], BULAN[(i + 2) % 12], BULAN[(i + 11) % 12], BULAN[(i + 4) % 12]]), BULAN[i + 1], `Sesudah ${BULAN[i]} adalah <b>${BULAN[i + 1]}</b>.`); } if (t === 3) { const [q, a] = pick([['Ada berapa hari dalam satu minggu?', 7], ['Ada berapa bulan dalam satu tahun?', 12]]); return ch(q, shuffle(numOpts(a, 4, 14)), a, `Jawabannya <b>${a}</b>.`); } const [q, a] = pick([['Kapan biasanya kita sarapan?', 'pagi'], ['Kapan biasanya kita tidur nyenyak dan melihat bulan?', 'malam'], ['Kapan matahari paling terik dan kita makan siang?', 'siang'], ['Kapan matahari mulai terbenam?', 'sore']]); return ch(q, ['pagi', 'siang', 'sore', 'malam'], a, `Jawabannya <b>${a}</b>.`); } },
      ],
    },
    {
      id: 'L', name: 'Uang', icon: '💰', color: '#81ecec', sg: 'Primary 1B Bab 20 (dalam Rupiah)',
      tip: 'Main jual-beli dengan uang koin sungguhan. Biarkan anak membayar jajan dan menghitung kembalian sederhana.',
      skills: [
        { id: 'L1', name: 'Mengenal uang Rupiah', gen() { const v = pick([100, 200, 500, 1000, 'n1000', 'n2000', 'n5000', 'n10000', 'n20000']); const val = typeof v === 'string' ? parseInt(v.slice(1)) : v; const pool = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000]; const opts = shuffle([val, ...shuffle(pool.filter((x) => x !== val)).slice(0, 3)]).map(rp); return ch('Berapa nilai uang ini?', opts, rp(val), `Lihat angka yang tertulis: <b>${rp(val)}</b>.`, { vis: V.money([v]) }); } },
        { id: 'L2', name: 'Menghitung uang', gen() { let items; if (Math.random() < 0.5) { items = Array.from({ length: r(2, 4) }, () => pick([100, 200, 500, 1000])); } else { items = Array.from({ length: r(2, 3) }, () => pick(['n1000', 'n2000', 'n5000'])); } const val = (x) => (typeof x === 'string' ? parseInt(x.slice(1)) : x); items.sort((a, b) => val(b) - val(a)); const tot = items.reduce((s, x) => s + val(x), 0); return inp('Berapa rupiah jumlah uang ini? (tulis angkanya saja)', tot, `Jumlahkan dari yang terbesar: ${items.map((x) => rp(val(x))).join(' + ')} = <b>${rp(tot)}</b>.`, { vis: V.money(items), unit: 'Rp', meta: { kind: 'money' } }); } },
        { id: 'L3', name: 'Apakah uangnya cukup?', gen() { const [e, nm] = pick([['🍞', 'roti'], ['🧃', 'jus'], ['🍦', 'es krim'], ['📓', 'buku tulis'], ['🍫', 'cokelat']]); const price = pick([1000, 1500, 2000, 2500, 3000, 4000, 5000]); const items = Array.from({ length: r(2, 3) }, () => pick(['n1000', 'n2000', 500, 1000])); const tot = items.reduce((s, x) => s + (typeof x === 'string' ? parseInt(x.slice(1)) : x), 0); const ok = tot >= price ? 'Ya' : 'Tidak'; return ch(`Harga ${nm} ${e} adalah <b>${rp(price)}</b>. Apakah uang ini cukup untuk membelinya?`, ['Ya', 'Tidak'], ok, `Uangnya ${rp(tot)}. ${rp(tot)} ${tot >= price ? 'lebih dari atau sama dengan' : 'kurang dari'} ${rp(price)}, jadi <b>${ok.toLowerCase()}</b>.`, { vis: V.money(items) }); } },
      ],
    },
    {
      id: 'M', name: 'Data dan grafik', icon: '📊', color: '#74b9ff', sg: 'Primary 1B Bab 21 (Picture Graphs)',
      tip: 'Buat tabel turus bersama: hitung warna mobil yang lewat depan rumah selama 5 menit.',
      skills: [
        { id: 'M1', name: 'Membaca piktogram', gen() { const cats = shuffle([['🍎', 'Apel'], ['🍌', 'Pisang'], ['🍊', 'Jeruk'], ['🍇', 'Anggur'], ['🥭', 'Mangga']]).slice(0, 4); const counts = shuffle(range(1, 8)).slice(0, 4); const rows = cats.map((c, i) => [c[0], c[1], counts[i]]); const vis = V.pictograph('Buah Kesukaan Kelas 1', rows, 'Setiap gambar = 1 anak'); if (Math.random() < 0.5) { const i = r(0, 3); return inp(`Berapa anak yang suka ${rows[i][1].toLowerCase()}?`, rows[i][2], `Hitung gambar pada baris ${rows[i][1]}: <b>${rows[i][2]}</b>.`, { vis, meta: { kind: 'count' } }); } const most = Math.random() < 0.5; const v = most ? Math.max(...counts) : Math.min(...counts); const ans = rows.find((x) => x[2] === v)[1]; return ch(`Buah apa yang paling ${most ? 'banyak' : 'sedikit'} disukai?`, rows.map((x) => x[1]), ans, `Baris ${ans} punya ${v} gambar, paling ${most ? 'banyak' : 'sedikit'}. Jawabannya <b>${ans}</b>.`, { vis }); } },
        { id: 'M2', name: 'Turus', gen() { const n = r(1, 18); return inp('Berapa banyak turus ini?', n, `Setiap kelompok yang dicoret berisi 5. ${Math.floor(n / 5)} kelompok = ${Math.floor(n / 5) * 5}${n % 5 ? `, ditambah ${n % 5}` : ''}. Jawabannya <b>${n}</b>.`, { vis: V.tally(n), meta: { kind: 'count' } }); } },
        { id: 'M3', name: 'Membandingkan data', gen() { const cats = shuffle([['🐱', 'Kucing'], ['🐶', 'Anjing'], ['🐟', 'Ikan'], ['🐦', 'Burung']]).slice(0, 3); const counts = shuffle(range(1, 9)).slice(0, 3); const rows = cats.map((c, i) => [c[0], c[1], counts[i]]); const [x, y] = counts[0] > counts[1] ? [rows[0], rows[1]] : [rows[1], rows[0]]; return inp(`Berapa lebih banyak anak yang suka ${x[1].toLowerCase()} daripada ${y[1].toLowerCase()}?`, x[2] - y[2], `${x[1]}: ${x[2]}, ${y[1]}: ${y[2]}. ${x[2]} − ${y[2]} = <b>${x[2] - y[2]}</b>.`, { vis: V.pictograph('Hewan Peliharaan Kesukaan', rows, 'Setiap gambar = 1 anak'), meta: { op: '-', a: x[2], b: y[2] } }); } },
      ],
    },
    {
      id: 'N', name: 'Bangun dan pola', icon: '🔷', color: '#e84393', sg: 'Primary 1A Bab 5 (Shapes & Patterns)',
      tip: 'Cari bentuk di rumah: jam dinding (lingkaran), pintu (persegi panjang), kaleng susu (tabung).',
      skills: [
        { id: 'N1', name: 'Mengenal bangun datar', gen() { const names = ['segitiga', 'persegi', 'persegi panjang', 'lingkaran', 'belah ketupat', 'segi enam']; const n = pick(names); return ch('Apa nama bangun ini?', shuffle([n, ...shuffle(names.filter((x) => x !== n)).slice(0, 3)]), n, `Bangun ini adalah <b>${n}</b>.`, { vis: V.shape(n, pick(['#ff7a59', '#7c5cff', '#00b894', '#0984e3', '#e84393'])) }); } },
        { id: 'N2', name: 'Sisi dan sudut', gen() { const data = { segitiga: 3, persegi: 4, 'persegi panjang': 4, 'belah ketupat': 4, 'segi enam': 6, lingkaran: 0, trapesium: 4 }; const n = pick(Object.keys(data)); const what = pick(['sisi', 'sudut']); return inp(`Berapa banyak ${what} ${n} ini?`, data[n], n === 'lingkaran' ? 'Lingkaran tidak punya sisi lurus dan tidak punya sudut. Jawabannya <b>0</b>.' : `Hitung ${what === 'sisi' ? 'garis lurusnya' : 'pojoknya'} satu per satu: <b>${data[n]}</b>.`, { vis: V.shape(n, '#00b894'), meta: { kind: 'count' } }); } },
        { id: 'N3', name: 'Bangun ruang di sekitar kita', gen() { const m = [['⚽', 'bola'], ['🏀', 'bola'], ['🌍', 'bola'], ['🎲', 'kubus'], ['🧊', 'kubus'], ['🥫', 'tabung'], ['🥁', 'tabung'], ['📦', 'balok'], ['🧱', 'balok'], ['🍦', 'kerucut'], ['🎉', 'kerucut']]; const [e, s] = pick(m); return ch('Benda ini berbentuk apa?', ['bola', 'kubus', 'tabung', 'balok', 'kerucut'], s, `${e} berbentuk <b>${s}</b>.`, { vis: `<div class="bigemoji">${e}</div>` }); } },
        { id: 'N4', name: 'Melanjutkan pola', gen() { const set = shuffle(['🔴', '🔵', '🟡', '🟢', '⭐', '🌙', '🔺', '🟪']); const pat = pick([[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2], [0, 1, 2, 2]]); const len = pat.length * 2 + r(0, pat.length - 1); const seq = range(0, len - 1).map((i) => set[pat[i % pat.length]]); const ans = set[pat[len % pat.length]]; const opts = shuffle([...new Set([...pat.map((i) => set[i]), set[4], set[5]])]).slice(0, 4); if (!opts.includes(ans)) opts[0] = ans; return ch('Apa yang muncul berikutnya?', shuffle(opts), ans, `Polanya berulang: ${pat.map((i) => set[i]).join(' ')}. Berikutnya adalah <b>${ans}</b>.`, { vis: V.seq([...seq, '?']) }); } },
      ],
    },
    {
      id: 'O', name: 'Pecahan sederhana', icon: '🍕', color: '#fab1a0', sg: 'Pengayaan (IXL Kelas 1)',
      tip: 'Potong roti atau martabak menjadi 2 dan 4 bagian sama besar. Tanyakan "ini setengah atau seperempat?"',
      skills: [
        { id: 'O1', name: 'Setengah dan seperempat', gen() { const parts = pick([2, 4, 3]); const kind = pick(['circle', 'rect']); const nameOf = { 2: 'setengah', 3: 'sepertiga', 4: 'seperempat' }; return ch('Berapa bagian yang diwarnai?', ['setengah', 'sepertiga', 'seperempat'], nameOf[parts], `Bangun dibagi menjadi ${parts} bagian sama besar dan 1 diwarnai. Itu <b>${nameOf[parts]}</b>.`, { vis: V.fraction(kind, parts, 1) }); } },
        { id: 'O2', name: 'Bagian sama besar', gen() { const eq = Math.random() < 0.5; const parts = pick([2, 3, 4]); return ch('Apakah bangun ini dibagi menjadi bagian yang sama besar?', ['Ya', 'Tidak'], eq ? 'Ya' : 'Tidak', eq ? 'Semua bagian ukurannya sama. Jawabannya <b>ya</b>.' : 'Ada bagian yang lebih besar dan lebih kecil. Jawabannya <b>tidak</b>.', { vis: V.fraction('rect', parts, 0, eq) }); } },
      ],
    },
  ];

  // Pola kesalahan: label, penjelasan untuk orang tua, dan saran latihan di rumah
  const TAGS = {
    'meleset-satu': { label: 'Sering meleset satu angka', tip: 'Saat menghitung, minta anak menunjuk dan menggeser benda satu per satu agar tidak ada yang terlewat atau terhitung dua kali.' },
    'tertukar-operasi': { label: 'Tertukar menjumlah dan mengurangi', tip: 'Sebelum menghitung, minta anak membaca tanda atau kata kuncinya keras-keras: "tambah/lagi/semua" atau "kurang/sisa/pergi".' },
    'tertukar-digit': { label: 'Tertukar puluhan dan satuan', tip: 'Gunakan ikatan 10 sedotan: angka depan = jumlah ikatan, angka belakang = sedotan lepas.' },
    'simbol-terbalik': { label: 'Tertukar tanda > dan <', tip: 'Ingatkan "mulut buaya" 🐊 selalu membuka ke bilangan yang lebih besar.' },
    'menyimpan': { label: 'Lupa menyimpan puluhan', tip: 'Latih dengan koin: 10 koin Rp100 ditukar menjadi 1 lembar Rp1.000, sama seperti 10 satuan menjadi 1 puluhan.' },
    'nilai-tempat': { label: 'Belum paham nilai tempat', tip: 'Tunjukkan bahwa angka 4 pada 47 berarti 4 puluhan = 40, bukan 4.' },
    'jam-tertukar': { label: 'Tertukar jarum pendek dan panjang', tip: 'Jarum pendek = jam, jarum panjang = menit. Tunjukkan jam dinding setiap kegiatan rutin.' },
    'setengah-jam': { label: 'Bingung "setengah" pada jam', tip: '"Setengah tujuh" artinya pukul 06.30 — setengah jalan menuju jam tujuh, bukan 07.30.' },
    'penggaris': { label: 'Membaca penggaris tidak dari 0', tip: 'Ajarkan selalu meletakkan ujung benda di angka 0 pada penggaris.' },
    'konsep': { label: 'Konsep belum kuat', tip: 'Ulangi dengan benda nyata dulu (konkret), lalu gambar, baru angka.' },
  };

  const SKILLS = {};
  UNITS.forEach((u) => u.skills.forEach((s, i) => { s.unit = u.id; s.code = u.id + '.' + (i + 1); SKILLS[s.id] = s; }));

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
      if (m.regroup && Math.abs(g - c) === 10) return 'menyimpan';
      if (Math.abs(g - c) === 1) return 'meleset-satu';
    }
    return 'konsep';
  }

  window.METIQ_CURRICULUM = { UNITS, SKILLS, TAGS, classify, rp };
})();
