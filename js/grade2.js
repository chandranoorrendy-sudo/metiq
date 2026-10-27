/* Metiq — Kurikulum Matematika Kelas 2
 * Disusun dari daftar keterampilan IXL kelas 2 dan alur Singapore Math (Primary 2A/2B):
 * bilangan sampai 1.000, penjumlahan/pengurangan bersusun dengan menyimpan dan meminjam,
 * perkalian dan pembagian 2, 3, 4, 5, 10, model batang untuk soal cerita dua langkah,
 * pecahan, pengukuran metrik (cm, m, kg, g, liter), waktu, uang Rupiah, dan piktogram berskala.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, range, rp, numOpts, kata, V, inp, ch, compareQ, NAMA, BULAN, two } = C.kit;
  const fmt = (n) => n.toLocaleString('id-ID');
  const uniq = (arr) => [...new Set(arr.map(String))];
  const opts4 = (ans, cands) => shuffle(uniq([ans, ...shuffle(cands.filter((x) => String(x) !== String(ans)))]).slice(0, 4));
  const stack = (a, op, b) => `<div class="stack"><span>${a}</span><span>${op} ${b}</span><span class="line">?</span></div>`;

  Object.assign(C.TAGS, {
    'tanda-sama-dengan': { label: 'Mengira tanda "=" berarti "hasilnya"', tip: 'Tanda = artinya kedua sisi sama nilainya, seperti timbangan yang seimbang. Hitung sisi kiri dulu, lalu cari angka agar sisi kanan sama.' },
    'kali-jumlah': { label: 'Menjumlah padahal seharusnya mengali', tip: '3 × 4 artinya 3 kelompok berisi 4, bukan 3 + 4. Gambarkan kelompoknya atau gunakan penjumlahan berulang: 4 + 4 + 4.' },
    'jam-menit': { label: 'Membaca angka pada jam sebagai menit', tip: 'Jarum panjang di angka 4 berarti 20 menit (4 × 5). Latih menghitung lompat 5-an sambil menunjuk angka jam.' },
    'pecahan': { label: 'Bingung menulis pecahan', tip: 'Angka bawah (penyebut) = banyak bagian seluruhnya. Angka atas (pembilang) = banyak bagian yang diwarnai.' },
    'pecahan-satuan': { label: 'Mengira penyebut besar berarti pecahan besar', tip: 'Potong kue menjadi 2 lalu menjadi 4: semakin banyak potongan, semakin kecil tiap potongnya. Jadi 1/2 lebih besar dari 1/4.' },
    'skala': { label: 'Lupa skala pada piktogram', tip: 'Lihat keterangan piktogram (mis. setiap gambar = 2 anak). Hitung gambarnya, lalu kalikan dengan nilai satu gambar.' },
  });

  // Klasifikasi tambahan khusus kelas 2
  const baseClassify = C.classify;
  C.classify = function (q, given) {
    const m = q.meta || {};
    const g = parseInt(String(given).replace(/\D/g, ''), 10);
    if (m.op === 'x' && g === m.a + m.b && m.a * m.b !== m.a + m.b) return 'kali-jumlah';
    if (m.kind === 'balance' && g === m.total) return 'tanda-sama-dengan';
    if (m.kind === 'scale' && g === m.icons) return 'skala';
    return baseClassify(q, given);
  };

  /* ---------- Visual tambahan ---------- */
  const W = {
    blocks3(h, t, o) {
      let s = '<div class="b10 stackrows">';
      if (h) s += '<div class="b10">' + ('<div class="flat">' + '<i></i>'.repeat(100) + '</div>').repeat(h) + '</div>';
      s += '<div class="b10">';
      for (let i = 0; i < t; i++) s += '<div class="rod">' + '<i></i>'.repeat(10) + '</div>';
      s += '<div class="ones">' + '<i></i>'.repeat(o) + '</div>';
      return s + '</div></div>';
    },
    array(rows, cols, e = '🔵') { return `<div class="arr" style="grid-template-columns:repeat(${cols},auto)">${`<span>${e}</span>`.repeat(rows * cols)}</div>`; },
    nl(min, max, step, mark) {
      const n = (max - min) / step, gap = 34, w = n * gap + 44;
      let s = `<svg class="nl" viewBox="0 0 ${w} 92"><line x1="8" y1="60" x2="${w - 8}" y2="60" class="ax"/>`;
      for (let i = 0; i <= n; i++) { const x = 22 + i * gap; s += `<line x1="${x}" y1="53" x2="${x}" y2="67" class="tk"/><text x="${x}" y="86">${fmt(min + i * step)}</text>`; }
      if (mark != null) { const x = 22 + ((mark - min) / step) * gap; s += `<text x="${x}" y="22" class="qm">?</text><path d="M${x} 28 L${x} 50 M${x - 6} 42 L${x} 50 L${x + 6} 42" class="arrow"/>`; }
      return s + '</svg>';
    },
    barGraph(title, rows, max, step) {
      const w = 320, h = 230, x0 = 34, y0 = 186, ph = 150, bw = (w - x0 - 8) / rows.length;
      let s = `<svg class="bgraph" viewBox="0 0 ${w} ${h}"><text x="${w / 2}" y="14" class="t">${title}</text>`;
      for (let v = 0; v <= max; v += step) { const y = y0 - (v / max) * ph; s += `<line x1="${x0}" x2="${w - 4}" y1="${y}" y2="${y}" class="g"/><text x="${x0 - 6}" y="${y + 4}" class="yl">${v}</text>`; }
      rows.forEach(([l, n], i) => { const x = x0 + i * bw + bw * 0.18, bh = (n / max) * ph; s += `<rect x="${x}" y="${y0 - bh}" width="${bw * 0.64}" height="${bh}" rx="3" class="b b${i}"${rows[i][2] ? ` style="fill:${rows[i][2]}"` : ''}/><text x="${x + bw * 0.32}" y="${y0 + 18}" class="xl">${l}</text>`; });
      return s + '</svg>';
    },
    io(pairs) { return `<table class="io"><tr><th>Masuk</th>${pairs.map((p) => `<td>${p[0]}</td>`).join('')}</tr><tr><th>Keluar</th>${pairs.map((p) => `<td class="${p[1] === '?' ? 'q' : ''}">${p[1]}</td>`).join('')}</tr></table>`; },
    rect(rows, cols, labels) {
      return `<div class="rgrid-wrap">${labels ? `<span class="rl-top">${cols} cm</span>` : ''}<div class="rgrid-row">${labels ? `<span class="rl-side">${rows} cm</span>` : ''}<div class="rgrid" style="grid-template-columns:repeat(${cols},24px)">${'<i></i>'.repeat(rows * cols)}</div></div></div>`;
    },
    poly(n, color = '#1fbf9f') {
      const pts = range(0, n - 1).map((i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; return `${60 + 52 * Math.cos(a)},${62 + 52 * Math.sin(a)}`; }).join(' ');
      return `<svg class="shape" viewBox="0 0 120 120" style="fill:${color}"><polygon points="${pts}"/></svg>`;
    },
    weights(list, item) { return `<div class="scale-wrap"><span class="bigemoji sm">${item}</span><span class="eq">=</span><div class="wts">${list.map((g) => `<span class="wt">${g >= 1000 ? g / 1000 + ' kg' : g + ' g'}</span>`).join('')}</div></div>`; },
  };

  // Pecahan ditulis "1/4"; nama dalam kata
  const FR = { 2: 'setengah', 3: 'sepertiga', 4: 'seperempat', 6: 'seperenam', 8: 'seperdelapan' };
  const hasBorrow = (a, b) => { const da = String(a).split('').reverse(), db = String(b).split('').reverse(); return db.some((d, i) => +d > +da[i]); };
  const hasCarry = (a, b) => { const da = String(a).split('').reverse(), db = String(b).split('').reverse(); return da.some((d, i) => +d + +(db[i] || 0) >= 10); };

  const UNITS = [
    {
      id: '2A', grade: 2, name: 'Bilangan sampai 1.000', icon: '🔢', color: '#ff7a59',
      sg: '2A · Numbers to 1,000', ixl: 'A, B, C, D, E, L', km: 'Bilangan (CP Fase A sampai 100; sampai 1.000 adalah perluasan)',
      tip: 'Pakai uang mainan Rp100, Rp10, dan Rp1 (atau kartu bertuliskan angka) untuk menunjukkan ratusan, puluhan, dan satuan.',
      skills: [
        { id: '2A1', name: 'Ratusan, puluhan, dan satuan', gen() { const h = r(1, 9), t = r(0, 9), o = r(0, 9), n = h * 100 + t * 10 + o; return inp('Bilangan berapa yang ditunjukkan?', n, `${h} ratusan = ${h * 100}, ${t} puluhan = ${t * 10}, ${o} satuan = ${o}. Jumlahnya <b>${n}</b>.`, { vis: W.blocks3(h, t, o), meta: { kind: 'place' } }); } },
        { id: '2A2', name: 'Nilai angka', gen() { const d = shuffle(range(1, 9)).slice(0, 3), n = d[0] * 100 + d[1] * 10 + d[2]; const pos = r(0, 2), dig = d[pos], val = dig * [100, 10, 1][pos]; const tags = {}; if (pos < 2) tags[dig] = 'nilai-tempat'; return ch(`Pada bilangan <b>${n}</b>, angka ${dig} bernilai berapa?`, opts4(val, [dig, dig * 10, dig * 100]), val, `Angka ${dig} ada di tempat ${['ratusan', 'puluhan', 'satuan'][pos]}, jadi nilainya <b>${val}</b>.`, { optionTags: tags }); } },
        { id: '2A3', name: 'Bentuk panjang', gen() { const h = r(1, 9), t = r(0, 9), o = r(0, 9), n = h * 100 + t * 10 + o; if (Math.random() < 0.5) return inp(`${h * 100} + ${t * 10} + ${o} = ?`, n, `${h * 100} + ${t * 10} + ${o} = <b>${n}</b>. Tulis angka ratusan, puluhan, lalu satuan.`, { meta: { kind: 'place' } }); return inp(`${n} = ${h * 100} + ? + ${o}`, t * 10, `${n} terdiri dari ${h} ratusan, ${t} puluhan, ${o} satuan. ${t} puluhan = <b>${t * 10}</b>.`, { optionTags: {}, meta: { kind: 'place' } }); } },
        { id: '2A4', name: 'Nama bilangan sampai 1.000', gen() { const n = r(100, 999); const cand = [n + 10, n - 10, n + 100 <= 999 ? n + 100 : n - 100, n + 1, Number(String(n).split('').reverse().join(''))].filter((x) => x >= 100 && x <= 999); if (Math.random() < 0.5) return ch(`Bilangan mana yang dibaca "<b>${kata(n)}</b>"?`, opts4(n, cand), n, `"${kata(n)}" ditulis <b>${n}</b>.`, { speak: `Bilangan mana yang dibaca ${kata(n)}?` }); const o = opts4(n, cand); return ch(`Bagaimana membaca ${n}?`, o.map((x) => kata(+x)), kata(n), `${n} dibaca <b>${kata(n)}</b>.`, { vis: V.big(n) }); } },
        { id: '2A5', name: 'Membandingkan bilangan sampai 1.000', gen() { const a = r(100, 999); const b = Math.random() < 0.5 ? Math.floor(a / 100) * 100 + r(0, 99) : r(100, 999); return compareQ(a, b); } },
        { id: '2A6', name: 'Mengurutkan bilangan sampai 1.000', gen() { const base = r(1, 8) * 100; const nums = uniq([base + r(0, 99), base + r(0, 99), r(100, 999)]).map(Number); while (nums.length < 3) nums.push(r(100, 999)); const asc = Math.random() < 0.6; const sorted = nums.slice().sort((a, b) => (asc ? a - b : b - a)); const ok = sorted.join(', '); const perms = [[0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map((p) => p.map((i) => sorted[i]).join(', ')); return ch(`Urutkan dari yang paling ${asc ? 'kecil' : 'besar'}.`, opts4(ok, perms), ok, `Bandingkan ratusan dulu, lalu puluhan, lalu satuan. Urutannya <b>${ok}</b>.`, { vis: V.seq(nums) }); } },
        { id: '2A7', name: 'Lompat hitung 5, 10, dan 100', gen() { const step = pick([5, 10, 100, -10, -100, 5]); const len = 5; let start; if (step > 0) start = Math.abs(step) * r(0, Math.floor((1000 - step * (len - 1)) / step)); else start = Math.abs(step) * r(len - 1, Math.floor(1000 / -step)); if (Math.abs(step) === 10 && Math.random() < 0.5) start += r(1, 9); const seq = range(0, len - 1).map((i) => start + i * step); if (seq.some((x) => x < 0 || x > 1000)) return C.SKILLS['2A7'].gen(); const k = r(1, len - 1); return inp(`Lompat hitung ${step > 0 ? 'maju' : 'mundur'} ${Math.abs(step)}-an. Bilangan berapa yang hilang?`, seq[k], `Setiap langkah ${step > 0 ? 'bertambah' : 'berkurang'} ${Math.abs(step)}: ${seq.join(', ')}. Jawabannya <b>${seq[k]}</b>.`, { log: seq.map((v, i) => (i === k ? '?' : v)).join(', '), vis: V.seq(seq.map((v, i) => (i === k ? '?' : v))), meta: { kind: 'seq' } }); } },
        { id: '2A8', name: 'Genap dan ganjil', gen() { if (Math.random() < 0.35) { const n = r(2, 16); const ev = n % 2 === 0 ? 'genap' : 'ganjil'; return ch('Apakah banyak bintang ini genap atau ganjil?', ['genap', 'ganjil'], ev, `Pasangkan bintang dua-dua. ${ev === 'genap' ? 'Semua mendapat pasangan' : 'Ada satu yang tidak punya pasangan'}, jadi ${n} adalah bilangan <b>${ev}</b>.`, { vis: `<div class="pairs">${'<span>⭐⭐</span>'.repeat(Math.floor(n / 2))}${n % 2 ? '<span>⭐</span>' : ''}</div>` }); } const n = r(1, 999); const ev = n % 2 === 0 ? 'genap' : 'ganjil'; return ch(`Apakah <b>${n}</b> bilangan genap atau ganjil?`, ['genap', 'ganjil'], ev, `Lihat angka satuannya: ${n % 10}. Angka satuan 0, 2, 4, 6, 8 berarti genap; 1, 3, 5, 7, 9 berarti ganjil. Jadi ${n} <b>${ev}</b>.`, { vis: V.big(n) }); } },
        { id: '2A9', name: 'Garis bilangan sampai 1.000', gen() { if (Math.random() < 0.5) { const m = r(1, 9) * 100; return inp('Bilangan berapa yang ditunjuk panah?', m, `Setiap garis bertambah 100. Panah menunjuk <b>${m}</b>.`, { vis: W.nl(0, 1000, 100, m), meta: { kind: 'seq' } }); } const base = r(1, 9) * 100, m = base + r(1, 9) * 10; return inp('Bilangan berapa yang ditunjuk panah?', m, `Garis bilangan mulai dari ${base} dan setiap garis bertambah 10. Panah menunjuk <b>${m}</b>.`, { vis: W.nl(base, base + 100, 10, m), meta: { kind: 'seq' } }); } },
      ],
    },
    {
      id: '2B', grade: 2, name: 'Fakta bilangan dan kesamaan', icon: '⚖️', color: '#1fbf9f',
      sg: '2A · Mental Calculation (Addition and Subtraction)', ixl: 'F, G, H, I, J, Y', km: 'Bilangan; Aljabar (kesamaan dua kalimat matematika)',
      tip: 'Main "kartu cepat" 5 menit sehari: tunjukkan 7 + 8, anak menjawab sebelum hitungan ke-3.',
      skills: [
        { id: '2B1', name: 'Fakta penjumlahan dan pengurangan sampai 20', gen() { if (Math.random() < 0.5) { const a = r(2, 9), b = r(2, 9); return inp(`${a} + ${b} = ?`, a + b, `${a} + ${b} = <b>${a + b}</b>.${a + b > 10 ? ` Buat 10 dulu: ${Math.max(a, b)} + ${10 - Math.max(a, b)} = 10, sisa ${a + b - 10}.` : ''}`, { vis: V.big(`${a} + ${b} = <span class="q">?</span>`), meta: { op: '+', a, b } }); } const a = r(11, 18), b = r(a - 9, 9); return inp(`${a} − ${b} = ?`, a - b, `Pikirkan penjumlahan: ${b} + ? = ${a}. Jawabannya <b>${a - b}</b>.`, { vis: V.big(`${a} − ${b} = <span class="q">?</span>`), meta: { op: '-', a, b } }); } },
        { id: '2B2', name: 'Menyeimbangkan persamaan', gen() { const a = r(3, 12), b = r(2, 9), tot = a + b; let c = r(1, tot - 1); if (c === a || c === b) c = Math.max(1, c - 1); const ans = tot - c; if (Math.random() < 0.6) return inp(`${a} + ${b} = ? + ${c}`, ans, `Hitung sisi kiri: ${a} + ${b} = ${tot}. Sisi kanan harus ${tot} juga: ? + ${c} = ${tot}, jadi ? = <b>${ans}</b>.`, { vis: V.big(`${a} + ${b} = <span class="q">?</span> + ${c}`), meta: { kind: 'balance', total: tot } }); const x = r(12, 20), y = r(2, 9), d = x - y; const k = r(1, d - 1 || 1); return inp(`${x} − ${y} = ${k} + ?`, d - k, `Sisi kiri: ${x} − ${y} = ${d}. Jadi ${k} + ? = ${d}, ? = <b>${d - k}</b>.`, { vis: V.big(`${x} − ${y} = ${k} + <span class="q">?</span>`), meta: { kind: 'balance', total: d } }); } },
        { id: '2B3', name: 'Tabel masukan dan keluaran', gen() { const k = r(2, 9), plus = Math.random() < 0.6; const ins = shuffle(range(plus ? 1 : k + 1, plus ? 12 : 20)).slice(0, 4).sort((a, b) => a - b); const outs = ins.map((x) => (plus ? x + k : x - k)); const rule = (plus ? '+' : '−') + ' ' + k; if (Math.random() < 0.5) { const cands = [`+ ${k}`, `− ${k}`, `+ ${k + 1}`, `− ${k - 1 || k + 2}`, `+ ${k - 1 || k + 2}`]; return ch('Apa aturan tabel ini?', opts4(rule, cands), rule, `${ins[0]} menjadi ${outs[0]}: ${plus ? 'bertambah' : 'berkurang'} ${k}. Aturannya <b>${rule}</b>.`, { vis: W.io(ins.map((x, i) => [x, outs[i]])) }); } const j = r(1, 3); return inp('Berapa bilangan yang hilang?', outs[j], `Aturannya ${rule}: ${ins[0]} → ${outs[0]}. Jadi ${ins[j]} ${rule} = <b>${outs[j]}</b>.`, { vis: W.io(ins.map((x, i) => [x, i === j ? '?' : outs[i]])), meta: { op: plus ? '+' : '-', a: ins[j], b: k } }); } },
        { id: '2B4', name: 'Menjumlah tiga atau empat bilangan', gen() { const n = pick([3, 4]); const xs = range(1, n).map(() => r(1, 9)); const s = xs.reduce((a, b) => a + b, 0); return inp(`${xs.join(' + ')} = ?`, s, `Cari pasangan 10 atau dobel lebih dulu, lalu jumlahkan sisanya. ${xs.join(' + ')} = <b>${s}</b>.`, { vis: V.big(`${xs.join(' + ')} = <span class="q">?</span>`) }); } },
      ],
    },
    {
      id: '2C', grade: 2, name: 'Penjumlahan sampai 200', icon: '➕', color: '#00b894',
      sg: '2A · Addition (with renaming)', ixl: 'M, N', km: 'Bilangan',
      tip: 'Saat menjumlah bersusun, mulai dari satuan. Jika satuan 10 atau lebih, tulis satuannya dan simpan 1 di kolom puluhan.',
      skills: [
        { id: '2C1', name: 'Menjumlah dua angka dengan menyimpan', gen() { const o1 = r(1, 9), o2 = r(10 - o1, 9), t1 = r(1, 7), t2 = r(1, 8 - t1); const a = t1 * 10 + o1, b = t2 * 10 + o2; return inp(`${a} + ${b} = ?`, a + b, `Satuan: ${o1} + ${o2} = ${o1 + o2}, tulis ${(o1 + o2) % 10} simpan 1. Puluhan: ${t1} + ${t2} + 1 = ${t1 + t2 + 1}. Jawabannya <b>${a + b}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: true } }); } },
        { id: '2C2', name: 'Mengurai bilangan untuk menjumlah', gen() { const a = r(21, 69), t = r(1, 2), o = r(1, 9), b = t * 10 + o; if (Math.random() < 0.5) return inp(`${a} + ${b} = ${a} + ? + ${o}`, t * 10, `${b} diurai menjadi ${t * 10} dan ${o}. Jawabannya <b>${t * 10}</b>.`, { vis: V.bond(b, '?', o), meta: { kind: 'place' } }); return inp(`${a} + ${b} = ?`, a + b, `Urai ${b} menjadi ${t * 10} + ${o}. ${a} + ${t * 10} = ${a + t * 10}, lalu ${a + t * 10} + ${o} = <b>${a + b}</b>.`, { vis: V.bond(b, t * 10, o), meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } },
        { id: '2C3', name: 'Strategi kompensasi (+9, +19)', gen() { const a = r(21, 79), k = pick([9, 19, 29, 8, 18]); const up = Math.ceil(k / 10) * 10, diff = up - k; if (a + k > 100) return C.SKILLS['2C3'].gen(); if (Math.random() < 0.5) return inp(`${a} + ${k} = ${a} + ${up} − ?`, diff, `${k} = ${up} − ${diff}. Tambah ${up} dulu, lalu kurangi ${diff}. Jawabannya <b>${diff}</b>.`, { vis: V.big(`${a} + ${k} = ${a} + ${up} − <span class="q">?</span>`) }); return inp(`${a} + ${k} = ?`, a + k, `Lebih mudah: ${a} + ${up} = ${a + up}, lalu kurangi ${diff}: ${a + up} − ${diff} = <b>${a + k}</b>.`, { vis: V.big(`${a} + ${k} = <span class="q">?</span>`), meta: { op: '+', a, b: k, regroup: hasCarry(a, k) } }); } },
        { id: '2C4', name: 'Menjumlah tiga bilangan dua angka', gen() { const xs = [r(10, 49), r(10, 49), r(10, 40)]; const s = xs.reduce((a, b) => a + b, 0); return inp(`${xs.join(' + ')} = ?`, s, `Jumlahkan satuan: ${xs.map((x) => x % 10).join(' + ')} = ${xs.reduce((a, x) => a + (x % 10), 0)}. Lalu puluhan. Jawabannya <b>${s}</b>.`, { vis: `<div class="stack"><span>${xs[0]}</span><span>${xs[1]}</span><span>+ ${xs[2]}</span><span class="line">?</span></div>` }); } },
        { id: '2C5', name: 'Menjumlah sampai 200', gen() { const a = r(45, 99), b = r(Math.max(10, 101 - a), 99); return inp(`${a} + ${b} = ?`, a + b, `Satuan: ${a % 10} + ${b % 10}. Puluhan: ${Math.floor(a / 10)} + ${Math.floor(b / 10)}${hasCarry(a, b) ? ' + simpanan' : ''}. Hasilnya lebih dari 100: <b>${a + b}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } },
      ],
    },
    {
      id: '2D', grade: 2, name: 'Pengurangan sampai 100', icon: '➖', color: '#0984e3',
      sg: '2A · Subtraction (with renaming)', ixl: 'O, P, Q', km: 'Bilangan',
      tip: 'Saat satuan atas lebih kecil, "pinjam" 1 puluhan: 52 − 27 → 4 puluhan dan 12 satuan, lalu 12 − 7 = 5.',
      skills: [
        { id: '2D1', name: 'Dua angka dikurangi satu angka (meminjam)', gen() { const t = r(2, 9), o = r(0, 8), a = t * 10 + o, b = r(o + 1, 9); return inp(`${a} − ${b} = ?`, a - b, `${o} lebih kecil dari ${b}, jadi pinjam 1 puluhan: ${o + 10} − ${b} = ${o + 10 - b}. Puluhan tinggal ${t - 1}. Jawabannya <b>${a - b}</b>.`, { vis: W.blocks3(0, t, o), meta: { op: '-', a, b, regroup: true } }); } },
        { id: '2D2', name: 'Mengurangi dua angka dengan meminjam', gen() { const t1 = r(3, 9), t2 = r(1, t1 - 1), o1 = r(0, 8), o2 = r(o1 + 1, 9); const a = t1 * 10 + o1, b = t2 * 10 + o2; return inp(`${a} − ${b} = ?`, a - b, `Satuan: ${o1} < ${o2}, pinjam 1 puluhan → ${o1 + 10} − ${o2} = ${o1 + 10 - o2}. Puluhan: ${t1 - 1} − ${t2} = ${t1 - 1 - t2}. Jawabannya <b>${a - b}</b>.`, { vis: stack(a, '−', b), meta: { op: '-', a, b, regroup: true } }); } },
        { id: '2D3', name: 'Menghitung maju untuk mengurangi', gen() { const b = r(21, 68), a = r(b + 12, 95); const toTen = Math.ceil(b / 10) * 10; return inp(`${a} − ${b} = ?`, a - b, `Hitung maju dari ${b}: ke ${toTen} butuh ${toTen - b}, dari ${toTen} ke ${a} butuh ${a - toTen}. ${toTen - b} + ${a - toTen} = <b>${a - b}</b>.`, { vis: W.nl(Math.floor(b / 10) * 10, Math.ceil(a / 10) * 10, 10), meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
        { id: '2D4', name: 'Hubungan penjumlahan dan pengurangan', gen() { const a = r(15, 60), b = r(11, 39), c = a + b; return inp(`Jika ${a} + ${b} = ${c}, maka ${c} − ${b} = ?`, a, `Penjumlahan dan pengurangan saling berkebalikan. ${c} − ${b} = <b>${a}</b>.`, { vis: V.bond(c, a, b), meta: { op: '-', a: c, b } }); } },
      ],
    },
    {
      id: '2E', grade: 2, name: 'Penjumlahan dan pengurangan sampai 1.000', icon: '🚀', color: '#66ffdb',
      sg: '2A · Addition and Subtraction within 1,000', ixl: 'S, T, U, V, W', km: 'Pengayaan (CP Fase B)',
      tip: 'Tulis bersusun rapi dengan kolom ratusan, puluhan, satuan. Kotak-kotak buku matematika membantu.',
      skills: [
        { id: '2E1', name: 'Menambah dan mengurangi 10 atau 100', gen() { const n = r(110, 889), k = pick([10, 100]), plus = Math.random() < 0.5; const ans = plus ? n + k : n - k; return inp(`${n} ${plus ? '+' : '−'} ${k} = ?`, ans, `${k === 10 ? 'Angka puluhan' : 'Angka ratusan'} ${plus ? 'bertambah' : 'berkurang'} 1, angka lain tetap: <b>${ans}</b>.`, { vis: V.big(`${n} ${plus ? '+' : '−'} ${k} = <span class="q">?</span>`), meta: { op: plus ? '+' : '-', a: n, b: k } }); } },
        { id: '2E2', name: 'Menambah dan mengurangi ratusan atau puluhan', gen() { const n = r(120, 699); if (Math.random() < 0.5) { const k = r(1, Math.floor((999 - n) / 100)) * 100; return inp(`${n} + ${k} = ?`, n + k, `${k / 100} ratusan ditambahkan ke ${Math.floor(n / 100)} ratusan. Jawabannya <b>${n + k}</b>.`, { meta: { op: '+', a: n, b: k } }); } const t = Math.floor((n % 100) / 10); const k = (t > 0 ? r(1, t) : 0) * 10 || 100; return inp(`${n} − ${k} = ?`, n - k, `Kurangi ${k} dari ${n}: <b>${n - k}</b>.`, { meta: { op: '-', a: n, b: k } }); } },
        { id: '2E3', name: 'Menjumlah tiga angka (menyimpan)', gen() { let a, b; do { a = r(105, 789); b = r(102, 999 - a); } while (!hasCarry(a, b) || a + b > 999); return inp(`${a} + ${b} = ?`, a + b, `Jumlahkan dari satuan, puluhan, lalu ratusan. Jika kolom berjumlah 10 atau lebih, simpan 1 ke kolom berikutnya. Jawabannya <b>${a + b}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: true } }); } },
        { id: '2E4', name: 'Mengurangi tiga angka (meminjam)', gen() { let a, b; do { a = r(300, 999); b = r(101, a - 50); } while (!hasBorrow(a, b) || a % 100 === 0); return inp(`${a} − ${b} = ?`, a - b, `Mulai dari satuan. Jika angka atas lebih kecil, pinjam 1 dari kolom di kirinya. Jawabannya <b>${a - b}</b>.`, { vis: stack(a, '−', b), meta: { op: '-', a, b, regroup: true } }); } },
        { id: '2E5', name: 'Mengurangi melewati nol', gen() { const h = r(2, 9), a = h * 100 + pick([0, 0, r(1, 9)]), b = r(101, a - 11); if (!hasBorrow(a, b)) return C.SKILLS['2E5'].gen(); return inp(`${a} − ${b} = ?`, a - b, `Puluhan ${a} adalah 0, jadi pinjam dari ratusan: ${h} ratusan → ${h - 1} ratusan dan 10 puluhan, lalu pinjam 1 puluhan untuk satuan. Jawabannya <b>${a - b}</b>.`, { vis: stack(a, '−', b), meta: { op: '-', a, b, regroup: true } }); } },
      ],
    },
    {
      id: '2F', grade: 2, name: 'Soal cerita dengan model batang', icon: '📘', color: '#00cec9',
      sg: '2A/2B · Word Problems (bar model, 1–2 langkah)', ixl: 'K, R, W', km: 'Bilangan',
      tip: 'Minta anak menggambar batang untuk setiap soal cerita: mana yang keseluruhan, mana bagiannya.',
      skills: [
        { id: '2F1', name: 'Soal cerita satu langkah', gen() { const [n1] = two(); if (Math.random() < 0.5) { const a = r(120, 560), b = r(105, 999 - a); return inp(pick([`Sekolah mengumpulkan ${a} buku pada hari Senin dan ${b} buku pada hari Selasa. Berapa buku semuanya?`, `${n1} menempuh ${a} langkah ke sekolah dan ${b} langkah ke taman. Berapa langkah semuanya?`]), a + b, `Gabungkan dua bagian: ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.barModel([[[a, '', a], [b, '', b]]], '?'), meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } const a = r(300, 950), b = r(110, a - 60); return inp(pick([`Toko punya ${a} telur. ${b} telur terjual. Berapa telur yang tersisa?`, `Perpustakaan punya ${a} buku. ${b} buku sedang dipinjam. Berapa buku yang ada di rak?`]), a - b, `Keseluruhan dikurangi bagian yang diketahui: ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.barModel([[[b, '', b], ['?', '', Math.max(a - b, 60)]]], a), meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
        { id: '2F2', name: 'Soal cerita dua langkah', gen() { const [n1] = two(); const a = r(40, 90), b = r(10, a - 15), c = r(10, 40); const ans = a - b + c; return inp(pick([`Ada ${a} kursi di aula. ${b} kursi dipindahkan ke kelas, lalu ${c} kursi baru datang. Berapa kursi di aula sekarang?`, `${n1} punya ${a} kelereng. Ia memberi ${b} kepada adik, lalu membeli ${c} lagi. Berapa kelereng ${n1} sekarang?`]), ans, `Langkah 1: ${a} − ${b} = ${a - b}. Langkah 2: ${a - b} + ${c} = <b>${ans}</b>.`); } },
        { id: '2F3', name: 'Soal cerita perbandingan', gen() { const [n1, n2] = two(); const a = r(150, 600), d = r(25, 140); if (Math.random() < 0.5) return inp(`${n1} mengumpulkan ${a} prangko. ${n2} mengumpulkan ${d} prangko lebih sedikit. Berapa prangko ${n2}?`, a - d, `Batang ${n2} lebih pendek ${d}. ${a} − ${d} = <b>${a - d}</b>.`, { vis: V.barModel([[[a, n1, 3]], [['?', n2, 2], [d, 'kurang', 1]]]), meta: { op: '-', a, b: d, regroup: hasBorrow(a, d) } }); const b = a + d; return inp(`${n1} punya ${a} poin. ${n2} punya ${b} poin. Berapa poin lebih banyak yang dimiliki ${n2}?`, d, `Selisih = yang besar − yang kecil: ${b} − ${a} = <b>${d}</b>.`, { vis: V.barModel([[[a, n1, 3]], [[a, n2, 3], ['?', 'selisih', 1]]]), meta: { op: '-', a: b, b: a, regroup: hasBorrow(b, a) } }); } },
      ],
    },
    {
      id: '2G', grade: 2, name: 'Perkalian', icon: '✖️', color: '#fd79a8',
      sg: '2A/2B · Multiplication Tables of 2, 3, 4, 5 and 10', ixl: 'X (penjumlahan berulang)', km: 'Pengayaan (CP Fase B)',
      tip: 'Hafalkan perkalian 2, 5, 10 dengan lompat hitung sambil bertepuk tangan. Gunakan susunan kancing atau telur di wadahnya.',
      skills: [
        { id: '2G1', name: 'Susunan baris dan kolom', gen() { const rows = r(2, 5), cols = r(2, 6); if (Math.random() < 0.5) return inp(`Ada ${rows} baris, setiap baris ${cols} bola. Berapa bola semuanya?`, rows * cols, `${rows} baris × ${cols} = ${Array(rows).fill(cols).join(' + ')} = <b>${rows * cols}</b>.`, { vis: W.array(rows, cols), meta: { op: 'x', a: rows, b: cols } }); const good = `${rows} × ${cols}`; const cands = [`${rows} + ${cols}`, `${rows} × ${cols + 1}`, `${rows + 1} × ${cols}`, `${rows} × ${cols - 1 || cols + 2}`]; return ch(`Ada ${rows} baris, setiap baris ${cols} bola. Kalimat perkalian mana yang sesuai?`, opts4(good, cands), good, `${rows} baris berisi ${cols} ditulis <b>${good}</b> = ${rows * cols}.`, { vis: W.array(rows, cols) }); } },
        { id: '2G2', name: 'Dari penjumlahan berulang ke perkalian', gen() { const e = r(2, 10), k = r(2, 5); return inp(`${Array(k).fill(e).join(' + ')} = ? × ${e}`, k, `${e} dijumlahkan ${k} kali, jadi sama dengan <b>${k}</b> × ${e} = ${k * e}.`, { meta: { kind: 'count' } }); } },
        { id: '2G3', name: 'Perkalian 2, 5, dan 10', gen() { const a = pick([2, 5, 10]), b = r(1, 10); const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]; return inp(`${x} × ${y} = ?`, x * y, `Lompat hitung ${a}-an sebanyak ${b} kali: ${range(1, b).map((i) => i * a).join(', ')}. Jawabannya <b>${x * y}</b>.`, { vis: V.big(`${x} × ${y} = <span class="q">?</span>`), meta: { op: 'x', a: x, b: y } }); } },
        { id: '2G4', name: 'Perkalian 3 dan 4', gen() { const a = pick([3, 4]), b = r(1, 10); const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]; return inp(`${x} × ${y} = ?`, x * y, `Lompat hitung ${a}-an: ${range(1, b).map((i) => i * a).join(', ')}. Jawabannya <b>${x * y}</b>.${a === 4 ? ` Tips: 4 × ${b} = dobel dari 2 × ${b} = ${2 * b}.` : ''}`, { vis: V.big(`${x} × ${y} = <span class="q">?</span>`), meta: { op: 'x', a: x, b: y } }); } },
        { id: '2G5', name: 'Soal cerita perkalian', gen() { const g = r(2, 10), e = pick([2, 3, 4, 5, 10]); const [em, t] = pick([['📦', `Ada ${g} kotak. Setiap kotak berisi ${e} kue. Berapa kue semuanya?`], ['🚲', `Ada ${g} sepeda. Setiap sepeda punya ${e === 2 ? 2 : e} roda. Berapa roda semuanya?`], ['🧺', `Ibu membeli ${g} kantong jeruk. Setiap kantong berisi ${e} jeruk. Berapa jeruk semuanya?`]]); return inp(t, g * e, `${g} kelompok berisi ${e}: ${g} × ${e} = <b>${g * e}</b>.`, { vis: `<div class="bigemoji sm">${em.repeat(Math.min(g, 6))}${g > 6 ? '…' : ''}</div>`, meta: { op: 'x', a: g, b: e } }); } },
      ],
    },
    {
      id: '2H', grade: 2, name: 'Pembagian', icon: '➗', color: '#e17055',
      sg: '2A/2B · Division (sharing and grouping)', ixl: '— (IXL mulai kelas 3)', km: 'Pengayaan (CP Fase B)',
      tip: 'Bagikan camilan sama rata: "12 biskuit untuk 3 anak, tiap anak dapat berapa?" Lalu kaitkan dengan 3 × 4 = 12.',
      skills: [
        { id: '2H1', name: 'Berbagi sama rata', gen() { const g = r(2, 5), e = r(2, 6), t = g * e; return inp(`${t} ÷ ${g} = ? (${t} permen dibagi rata untuk ${g} anak)`, e, `Bagikan satu per satu ke ${g} anak sampai habis. Tiap anak mendapat <b>${e}</b>, karena ${g} × ${e} = ${t}.`, { vis: V.objects('🍬', t) + '<div class="kids">' + '🧒'.repeat(g) + '</div>', meta: { op: '/', a: t, b: g } }); } },
        { id: '2H2', name: 'Membuat kelompok', gen() { const e = pick([2, 3, 4, 5, 10]), g = r(2, 6), t = e * g; return inp(`Ada ${t} apel. Setiap kantong diisi ${e} apel. Berapa kantong yang dibutuhkan?`, g, `Kelompokkan ${e}-${e}: ${range(1, g).map((i) => i * e).join(', ')}. Ada <b>${g}</b> kantong. ${t} ÷ ${e} = ${g}.`, { vis: V.objects('🍎', t), meta: { op: '/', a: t, b: e } }); } },
        { id: '2H3', name: 'Pembagian dari tabel perkalian', gen() { const d = pick([2, 3, 4, 5, 10]), q = r(1, 10), t = d * q; return inp(`${t} ÷ ${d} = ?`, q, `Pikirkan perkalian: ${d} × ? = ${t}. Karena ${d} × ${q} = ${t}, jawabannya <b>${q}</b>.`, { vis: V.big(`${t} ÷ ${d} = <span class="q">?</span>`), meta: { op: '/', a: t, b: d } }); } },
        { id: '2H4', name: 'Keluarga perkalian dan pembagian', gen() { const a = pick([2, 3, 4, 5, 10]), b = r(2, 10), c = a * b; if (Math.random() < 0.5) return inp(`Jika ${a} × ${b} = ${c}, maka ${c} ÷ ${a} = ?`, b, `Perkalian dan pembagian saling berkebalikan: ${c} ÷ ${a} = <b>${b}</b>.`, { meta: { op: '/', a: c, b: a } }); const good = `${c} ÷ ${b} = ${a}`; const cands = [`${c} ÷ ${a} = ${a}`, `${a} ÷ ${b} = ${c}`, `${c} × ${a} = ${b}`, `${b} ÷ ${c} = ${a}`]; return ch(`Mana yang termasuk keluarga bilangan <b>${a}, ${b}, ${c}</b>?`, opts4(good, cands), good, `${a} × ${b} = ${c}, ${b} × ${a} = ${c}, ${c} ÷ ${a} = ${b}, ${c} ÷ ${b} = ${a}. Jawabannya <b>${good}</b>.`); } },
      ],
    },
    {
      id: '2I', grade: 2, name: 'Pecahan', icon: '🍕', color: '#fab1a0',
      sg: '2B · Fractions', ixl: 'LL', km: 'Bilangan (pecahan; setengah dan seperempat ada di CP Fase A)',
      tip: 'Potong roti atau kertas menjadi bagian sama besar. Tuliskan pecahannya: "3 dari 4 bagian = 3/4".',
      skills: [
        { id: '2I1', name: 'Mengenal 1/2, 1/3, 1/4, dan 1/8', gen() { const n = pick([2, 3, 4, 8]); const kind = pick(['rect', 'circle']); return ch('Berapa bagian yang diwarnai?', ['1/2', '1/3', '1/4', '1/8'], `1/${n}`, `Bangun dibagi menjadi ${n} bagian sama besar dan 1 diwarnai: <b>1/${n}</b> (${FR[n]}).`, { vis: V.fraction(kind, n, 1) }); } },
        { id: '2I2', name: 'Menulis pecahan dari gambar', gen() { const n = pick([3, 4, 5, 6, 8]), k = r(1, n - 1); const good = `${k}/${n}`; const tags = {}; const alt = [`${n - k}/${n}`, `${k}/${n - k}`, `${n}/${k}`]; alt.forEach((a) => { tags[a] = 'pecahan'; }); return ch('Berapa bagian yang diwarnai?', opts4(good, alt), good, `Ada ${n} bagian sama besar (penyebut ${n}) dan ${k} diwarnai (pembilang ${k}). Jawabannya <b>${good}</b>.`, { vis: V.fraction(n <= 4 && Math.random() < 0.5 ? 'circle' : 'rect', n, k), optionTags: tags }); } },
        { id: '2I3', name: 'Membandingkan pecahan satuan', gen() { const [a, b] = shuffle([2, 3, 4, 8]).slice(0, 2); const big = Math.random() < 0.6; const ans = big ? `1/${Math.min(a, b)}` : `1/${Math.max(a, b)}`; const wrong = big ? `1/${Math.max(a, b)}` : `1/${Math.min(a, b)}`; const tags = {}; tags[wrong] = 'pecahan-satuan'; return ch(`Mana yang lebih ${big ? 'besar' : 'kecil'}?`, [`1/${a}`, `1/${b}`], ans, `Semakin banyak bagian, semakin kecil setiap bagiannya. 1/${Math.min(a, b)} lebih besar dari 1/${Math.max(a, b)}. Jawabannya <b>${ans}</b>.`, { vis: `<div class="grp-row"><div class="grp"><div class="grp-l">1/${a}</div>${V.fraction('rect', a, 1)}</div><div class="grp"><div class="grp-l">1/${b}</div>${V.fraction('rect', b, 1)}</div></div>`, optionTags: tags }); } },
        { id: '2I4', name: 'Membuat satu utuh', gen() { const n = pick([2, 3, 4, 6, 8]), k = r(1, n - 1); return inp(`Sudah diwarnai ${k}/${n}. Berapa bagian lagi agar menjadi 1 utuh?`, n - k, `1 utuh = ${n}/${n}. ${n} − ${k} = <b>${n - k}</b> bagian lagi.`, { vis: V.fraction('rect', n, k), meta: { op: '-', a: n, b: k } }); } },
      ],
    },
    {
      id: '2J', grade: 2, name: 'Panjang (cm dan m)', icon: '📏', color: '#55efc4',
      sg: '2A · Length (m, cm)', ixl: 'HH (satuan metrik; satuan inci di GG tidak dipakai)', km: 'Pengukuran',
      tip: 'Ukur benda di rumah dengan penggaris dan meteran jahit. Tebak dulu, baru ukur.',
      skills: [
        { id: '2J1', name: 'Mengukur dengan penggaris', gen() { const start = r(1, 4), len = r(2, 12 - start); return inp('Berapa sentimeter panjang pensil ini?', len, `Pensil mulai di ${start} dan berakhir di ${start + len}. Panjangnya ${start + len} − ${start} = <b>${len}</b> cm.`, { vis: V.ruler(len, start), meta: { kind: 'ruler', start, end: start + len } }); } },
        { id: '2J2', name: 'Memilih satuan: cm atau m', gen() { const [it, u] = pick([['pensil', 'cm'], ['penghapus', 'cm'], ['buku tulis', 'cm'], ['sendok', 'cm'], ['jari tangan', 'cm'], ['pintu kelas', 'm'], ['lapangan sepak bola', 'm'], ['kolam renang', 'm'], ['tiang bendera', 'm'], ['bus sekolah', 'm']]); return ch(`Panjang <b>${it}</b> paling tepat diukur dengan...`, ['cm', 'm'], u, `Benda kecil diukur dengan sentimeter (cm), benda besar atau jauh dengan meter (m). ${it} → <b>${u}</b>.`); } },
        { id: '2J3', name: 'Membandingkan panjang', gen() { const a = r(15, 90), b = r(10, a - 3); return inp(`Pita merah panjangnya ${a} cm. Pita biru ${b} cm. Berapa cm pita merah lebih panjang?`, a - b, `Selisih: ${a} − ${b} = <b>${a - b}</b> cm.`, { vis: V.bars([{ label: `Merah ${a} cm`, len: Math.round(a / 8), color: '#ff6b6b' }, { label: `Biru ${b} cm`, len: Math.round(b / 8), color: '#4d96ff' }]), meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
        { id: '2J4', name: 'Soal cerita panjang', gen() { const [n1] = two(); if (Math.random() < 0.5) { const a = r(20, 60), b = r(10, 39); return inp(`${n1} menyambung tali ${a} m dan tali ${b} m. Berapa meter panjang tali sekarang?`, a + b, `${a} + ${b} = <b>${a + b}</b> m.`, { meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } const a = r(50, 99), b = r(12, a - 10); return inp(`Pita ${a} cm dipotong ${b} cm untuk hiasan. Berapa cm sisa pitanya?`, a - b, `${a} − ${b} = <b>${a - b}</b> cm.`, { meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
      ],
    },
    {
      id: '2K', grade: 2, name: 'Berat dan volume', icon: '⚖️', color: '#81ecec',
      sg: '2A/2B · Mass (kg, g), Volume (ℓ)', ixl: '— (dari Singapore Math)', km: 'Pengukuran',
      tip: 'Ajak anak membaca berat di kemasan (beras 5 kg, biskuit 200 g) dan volume botol (1,5 liter).',
      skills: [
        { id: '2K1', name: 'Memilih satuan: kg atau g', gen() { const [it, u] = pick([['karung beras', 'kg'], ['semangka', 'kg'], ['kambing', 'kg'], ['tubuhmu', 'kg'], ['permen', 'g'], ['pensil', 'g'], ['sendok', 'g'], ['sebutir telur', 'g'], ['sebungkus biskuit', 'g'], ['sepeda', 'kg']]); return ch(`Berat <b>${it}</b> paling tepat diukur dengan...`, ['kg', 'g'], u, `Benda ringan memakai gram (g), benda berat memakai kilogram (kg). ${it} → <b>${u}</b>.`); } },
        { id: '2K2', name: 'Menghitung berat dengan anak timbangan', gen() { const [e] = pick([['🍍'], ['🍉'], ['🥥'], ['🍞'], ['🧀']]); const list = shuffle([500, 200, 200, 100, 100, 50, 50, 20, 10]).slice(0, r(2, 4)).sort((a, b) => b - a); const t = list.reduce((a, b) => a + b, 0); return inp('Timbangan seimbang. Berapa gram berat buah ini?', t, `Jumlahkan semua anak timbangan: ${list.map((g) => g + ' g').join(' + ')} = <b>${t}</b> g.`, { vis: W.weights(list, e), unit: 'g' }); } },
        { id: '2K3', name: 'Volume dalam liter', gen() { if (Math.random() < 0.5) { const a = r(5, 20), b = r(1, a - 1); return inp(`Ember berisi ${a} liter air. Ibu memakai ${b} liter untuk menyiram tanaman. Berapa liter air yang tersisa?`, a - b, `${a} − ${b} = <b>${a - b}</b> liter.`, { vis: '<div class="bigemoji">🪣</div>', meta: { op: '-', a, b } }); } const g = r(2, 5), e = r(2, 4); return inp(`Satu botol berisi ${e} liter. Berapa liter isi ${g} botol?`, g * e, `${g} × ${e} = <b>${g * e}</b> liter.`, { vis: `<div class="bigemoji sm">${'🍶'.repeat(g)}</div>`, meta: { op: 'x', a: g, b: e } }); } },
      ],
    },
    {
      id: '2L', grade: 2, name: 'Waktu dan kalender', icon: '⏰', color: '#ffeaa7',
      sg: '2B · Time (5 menit, a.m./p.m.)', ixl: 'DD, EE', km: 'Pengukuran (durasi waktu)',
      tip: 'Sebutkan jam saat kegiatan: "Sekarang pukul 07.25." Biasakan juga jam 24 seperti di TV: pukul 19.00 = 7 malam.',
      skills: [
        { id: '2L1', name: 'Membaca jam per 5 menit', gen() { const h = r(1, 12), m = r(1, 11) * 5, mm = String(m).padStart(2, '0'); const good = `pukul ${h}.${mm}`; const tags = {}; const wrongMin = `pukul ${h}.${String(m / 5).padStart(2, '0')}`; tags[wrongMin] = 'jam-menit'; const nx = h % 12 + 1; const wrongHour = `pukul ${nx}.${mm}`; tags[wrongHour] = 'jam-tertukar'; return ch('Pukul berapa sekarang?', opts4(good, [wrongMin, wrongHour, `pukul ${h}.${String((m + 5) % 60).padStart(2, '0')}`]), good, `Jarum pendek melewati angka ${h}. Jarum panjang di angka ${m / 5}, artinya ${m / 5} × 5 = ${m} menit. Jadi <b>${good}</b>.`, { vis: V.clock(h, m), optionTags: tags }); } },
        { id: '2L2', name: 'Pagi, siang, sore, malam (jam 24)', gen() { const H = r(0, 23); const part = H >= 4 && H < 11 ? 'pagi' : H >= 11 && H < 15 ? 'siang' : H >= 15 && H < 19 ? 'sore' : 'malam'; const h12 = H % 12 === 0 ? 12 : H % 12; if (Math.random() < 0.5 && H >= 13) return inp(`Pukul ${h12} ${part} sama dengan pukul berapa dalam jam 24? (tulis jamnya saja)`, H, `Setelah pukul 12 siang, tambahkan 12: ${h12} + 12 = <b>${H}</b>. Jadi pukul ${String(H).padStart(2, '0')}.00.`, { meta: { op: '+', a: h12, b: 12 } }); return ch(`Pukul ${String(H).padStart(2, '0')}.00 termasuk...`, ['pagi', 'siang', 'sore', 'malam'], part, `Pukul ${String(H).padStart(2, '0')}.00 adalah pukul ${h12} <b>${part}</b>.`); } },
        { id: '2L3', name: 'Hubungan satuan waktu', gen() { const [q, a] = pick([['1 jam = ? menit', 60], ['setengah jam = ? menit', 30], ['2 jam = ? menit', 120], ['1 hari = ? jam', 24], ['1 minggu = ? hari', 7], ['2 minggu = ? hari', 14], ['1 tahun = ? bulan', 12], ['seperempat jam = ? menit', 15]]); return inp(q, a, `Ingat: 1 jam = 60 menit, 1 hari = 24 jam, 1 minggu = 7 hari, 1 tahun = 12 bulan. Jawabannya <b>${a}</b>.`); } },
        { id: '2L4', name: 'Lama waktu', gen() { const s = r(6, 14), d = r(1, 5); if (Math.random() < 0.5) return inp(`Les mulai pukul ${String(s).padStart(2, '0')}.00 dan selesai pukul ${String(s + d).padStart(2, '0')}.00. Berapa jam lamanya?`, d, `Hitung maju dari ${s} sampai ${s + d}: <b>${d}</b> jam.`, { meta: { op: '-', a: s + d, b: s } }); const good = `pukul ${String(s + d).padStart(2, '0')}.00`; return ch(`Sekarang pukul ${String(s).padStart(2, '0')}.00. ${d} jam lagi pukul berapa?`, opts4(good, [`pukul ${String(s + d + 1).padStart(2, '0')}.00`, `pukul ${String(s + d - 1).padStart(2, '0')}.00`, `pukul ${String(s - d).padStart(2, '0')}.00`]), good, `${s} + ${d} = ${s + d}. Jadi <b>${good}</b>.`); } },
        { id: '2L5', name: 'Banyak hari dalam sebulan', gen() { const i = r(0, 11); const days = [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i]; const ans = days === -1 ? '28 atau 29' : String(days); return ch(`Ada berapa hari di bulan <b>${BULAN[i]}</b>?`, ['28 atau 29', '30', '31'], ans, `${BULAN[i]} punya <b>${ans}</b> hari. Tips: hitung dengan buku jari — bulan di tonjolan buku jari punya 31 hari.`); } },
      ],
    },
    {
      id: '2M', grade: 2, name: 'Uang', icon: '💰', color: '#74b9ff',
      sg: '2B · Money (dalam Rupiah)', ixl: 'AA, BB, CC', km: 'Bilangan (konteks uang)',
      tip: 'Biarkan anak membayar sendiri di warung dan menghitung kembaliannya.',
      skills: [
        { id: '2M1', name: 'Menghitung uang sampai Rp100.000', gen() { const notes = Array.from({ length: r(2, 4) }, () => pick(['n2000', 'n5000', 'n10000', 'n20000', 'n50000'])); const val = (x) => parseInt(x.slice(1)); notes.sort((a, b) => val(b) - val(a)); let t = notes.reduce((s, x) => s + val(x), 0); if (t > 100000) return C.SKILLS['2M1'].gen(); return inp('Berapa rupiah jumlah uang ini? (tulis angkanya saja)', t, `Jumlahkan dari yang terbesar: ${notes.map((x) => rp(val(x))).join(' + ')} = <b>${rp(t)}</b>.`, { vis: V.money(notes), unit: 'Rp', meta: { kind: 'money' } }); } },
        { id: '2M2', name: 'Menghitung kembalian', gen() { const pay = pick([5000, 10000, 20000, 50000]); const price = r(2, pay / 500 - 1) * 500; const [e, nm] = pick([['📒', 'buku'], ['🖍️', 'krayon'], ['🧃', 'jus'], ['🍩', 'donat'], ['🎒', 'tas kecil']]); return inp(`Harga ${nm} ${e} ${rp(price)}. Dibayar dengan ${rp(pay)}. Berapa kembaliannya? (tulis angkanya saja)`, pay - price, `Kembalian = uang dibayar − harga: ${rp(pay)} − ${rp(price)} = <b>${rp(pay - price)}</b>.`, { vis: V.money(['n' + pay]), unit: 'Rp', meta: { op: '-', a: pay, b: price } }); } },
        { id: '2M3', name: 'Menjumlah harga belanja', gen() { const items = shuffle([['🍞', 'roti', r(4, 12) * 500], ['🥛', 'susu', r(6, 14) * 500], ['🍌', 'pisang', r(2, 8) * 1000], ['🥚', 'telur', r(3, 10) * 1000], ['🍫', 'cokelat', r(3, 9) * 1000]]).slice(0, 2); const t = items[0][2] + items[1][2]; return inp(`Ibu membeli ${items[0][1]} ${items[0][0]} seharga ${rp(items[0][2])} dan ${items[1][1]} ${items[1][0]} seharga ${rp(items[1][2])}. Berapa total harganya? (tulis angkanya saja)`, t, `${rp(items[0][2])} + ${rp(items[1][2])} = <b>${rp(t)}</b>.`, { unit: 'Rp', meta: { op: '+', a: items[0][2], b: items[1][2] } }); } },
        { id: '2M4', name: 'Berapa kekurangannya?', gen() { const have = r(4, 30) * 1000, need = have + r(1, 10) * 1000; const [e, nm] = pick([['⚽', 'bola'], ['🪁', 'layang-layang'], ['🧸', 'boneka'], ['🎨', 'cat air']]); return inp(`${two()[0]} punya ${rp(have)}. Harga ${nm} ${e} ${rp(need)}. Berapa rupiah lagi yang dibutuhkan? (tulis angkanya saja)`, need - have, `${rp(need)} − ${rp(have)} = <b>${rp(need - have)}</b>.`, { unit: 'Rp', meta: { op: '-', a: need, b: have } }); } },
      ],
    },
    {
      id: '2N', grade: 2, name: 'Data dan diagram', icon: '📊', color: '#e84393',
      sg: '2B · Picture Graphs (dengan skala)', ixl: 'FF', km: 'Analisis Data dan Peluang',
      tip: 'Buat diagram batang bersama dari data keluarga: buah kesukaan, warna favorit, atau jumlah kendaraan yang lewat.',
      skills: [
        { id: '2N1', name: 'Piktogram dengan skala', gen() { const sc = pick([2, 5]); const cats = shuffle([['🍎', 'Apel'], ['🍌', 'Pisang'], ['🍊', 'Jeruk'], ['🍇', 'Anggur']]).slice(0, 3); const icons = shuffle(range(1, 6)).slice(0, 3); const rows = cats.map((c, i) => [c[0], c[1], icons[i]]); const i = r(0, 2); return inp(`Berapa anak yang suka ${rows[i][1].toLowerCase()}?`, rows[i][2] * sc, `Ada ${rows[i][2]} gambar, dan setiap gambar = ${sc} anak. ${rows[i][2]} × ${sc} = <b>${rows[i][2] * sc}</b>.`, { vis: V.pictograph('Buah Kesukaan Kelas 2', rows, `Setiap gambar = ${sc} anak`), meta: { kind: 'scale', icons: rows[i][2] } }); } },
        { id: '2N2', name: 'Membaca diagram batang', gen() { const cats = shuffle(['Merah', 'Biru', 'Hijau', 'Kuning']).slice(0, 4); const vals = cats.map(() => r(1, 9) * 2); const COL = { Merah: '#ff6b6b', Biru: '#4d96ff', Hijau: '#2ecc71', Kuning: '#f9c74f' }; const rows = cats.map((c, i) => [c, vals[i], COL[c]]); const vis = W.barGraph('Warna Kesukaan', rows, 20, 2); if (Math.random() < 0.6) { const i = r(0, 3); return inp(`Berapa anak yang memilih warna ${cats[i].toLowerCase()}?`, vals[i], `Lihat ujung batang ${cats[i]} lalu tarik garis ke angka di kiri: <b>${vals[i]}</b>.`, { vis }); } const mx = Math.max(...vals); if (vals.filter((v) => v === mx).length > 1) return C.SKILLS['2N2'].gen(); const ans = cats[vals.indexOf(mx)]; return ch('Warna apa yang paling banyak dipilih?', cats, ans, `Batang paling tinggi adalah <b>${ans}</b> (${mx} anak).`, { vis }); } },
        { id: '2N3', name: 'Menjawab soal dari diagram', gen() { const cats = shuffle(['Senin', 'Selasa', 'Rabu', 'Kamis']).slice(0, 4); const vals = cats.map(() => r(1, 10) * 2); const rows = cats.map((c, i) => [c.slice(0, 3), vals[i]]); const [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2); if (Math.random() < 0.5) { const [x, y] = vals[i] >= vals[j] ? [i, j] : [j, i]; return inp(`Berapa lebih banyak buku yang dipinjam hari ${cats[x]} daripada hari ${cats[y]}?`, vals[x] - vals[y], `${cats[x]}: ${vals[x]}, ${cats[y]}: ${vals[y]}. ${vals[x]} − ${vals[y]} = <b>${vals[x] - vals[y]}</b>.`, { vis: W.barGraph('Buku Dipinjam', rows, 20, 2), meta: { op: '-', a: vals[x], b: vals[y] } }); } return inp(`Berapa buku yang dipinjam hari ${cats[i]} dan ${cats[j]} jika digabung?`, vals[i] + vals[j], `${vals[i]} + ${vals[j]} = <b>${vals[i] + vals[j]}</b>.`, { vis: W.barGraph('Buku Dipinjam', rows, 20, 2), meta: { op: '+', a: vals[i], b: vals[j] } }); } },
      ],
    },
    {
      id: '2O', grade: 2, name: 'Bangun, luas, dan pola', icon: '🔷', color: '#fdcb6e',
      sg: '2B · Shapes and Patterns', ixl: 'II, JJ, KK', km: 'Geometri; Aljabar (pola bilangan)',
      tip: 'Hitung sisi dan pojok benda di rumah: ubin, kotak susu, rubik. Susun ubin kecil untuk membuat persegi panjang.',
      skills: [
        { id: '2O1', name: 'Nama segi banyak', gen() { const n = pick([3, 4, 5, 6, 8]); const nm = { 3: 'segitiga', 4: 'segi empat', 5: 'segi lima', 6: 'segi enam', 8: 'segi delapan' }; return ch('Apa nama bangun ini?', opts4(nm[n], Object.values(nm)), nm[n], `Hitung sisinya: ${n} sisi, jadi namanya <b>${nm[n]}</b>.`, { vis: W.poly(n, pick(['#ff7a59', '#1fbf9f', '#00b894', '#0984e3'])) }); } },
        { id: '2O2', name: 'Sisi dan titik sudut', gen() { const n = pick([3, 4, 5, 6, 8]); const what = pick(['sisi', 'titik sudut']); return inp(`Berapa banyak ${what} bangun ini?`, n, `Hitung ${what === 'sisi' ? 'garis lurusnya' : 'pojoknya'} satu per satu. Segi banyak selalu punya jumlah sisi = jumlah titik sudut = <b>${n}</b>.`, { vis: W.poly(n, '#00b894'), meta: { kind: 'count' } }); } },
        { id: '2O3', name: 'Sisi, rusuk, dan titik sudut bangun ruang', gen() { const [nm, e, f, ed, v] = pick([['kubus', '🎲', 6, 12, 8], ['balok', '📦', 6, 12, 8], ['prisma segitiga', '🧀', 5, 9, 6]]); const [what, val] = pick([['sisi', f], ['rusuk', ed], ['titik sudut', v]]); return inp(`Berapa banyak ${what} pada ${nm}?`, val, `${nm[0].toUpperCase() + nm.slice(1)} punya ${f} sisi, ${ed} rusuk, dan ${v} titik sudut. Jawabannya <b>${val}</b>.`, { vis: `<div class="bigemoji">${e}</div>`, meta: { kind: 'count' } }); } },
        { id: '2O4', name: 'Luas dengan persegi satuan', gen() { const rows = r(2, 5), cols = r(2, 7); return inp('Ada berapa persegi kecil di dalam persegi panjang ini?', rows * cols, `${rows} baris, setiap baris ${cols} persegi: ${rows} × ${cols} = <b>${rows * cols}</b>.`, { vis: W.rect(rows, cols), meta: { op: 'x', a: rows, b: cols } }); } },
        { id: '2O5', name: 'Keliling persegi panjang', gen() { const rows = r(2, 4), cols = r(2, 7); const k = 2 * (rows + cols); return inp('Berapa cm keliling persegi panjang ini? (setiap persegi kecil sisinya 1 cm)', k, `Keliling = jumlah semua sisi luar: ${cols} + ${rows} + ${cols} + ${rows} = <b>${k}</b> cm.`, { vis: W.rect(rows, cols, true) }); } },
        { id: '2O6', name: 'Pola bilangan', gen() { const k = r(2, 25), up = Math.random() < 0.65; let start = up ? r(0, 60) : r(k * 4 + 1, 150); const seq = range(0, 4).map((i) => start + (up ? i : -i) * k); const j = r(1, 4); return inp('Bilangan berapa yang hilang?', seq[j], `Polanya ${up ? 'bertambah' : 'berkurang'} ${k} setiap langkah: ${seq.join(', ')}. Jawabannya <b>${seq[j]}</b>.`, { log: 'Pola: ' + seq.map((v, i) => (i === j ? '?' : v)).join(', '), vis: V.seq(seq.map((v, i) => (i === j ? '?' : v))), meta: { kind: 'seq' } }); } },
      ],
    },
    {
      id: '2P', grade: 2, name: 'Pembulatan dan perkiraan', icon: '🎯', color: '#00b894',
      sg: '— (Singapore Math membahasnya mulai kelas 3)', ixl: 'Z', km: 'Pengayaan',
      tip: 'Saat belanja, ajak anak memperkirakan: "Rp4.800 kira-kira Rp5.000."',
      skills: [
        { id: '2P1', name: 'Membulatkan ke puluhan terdekat', gen() { let n = r(11, 99); if (n % 10 === 0) n++; const lo = Math.floor(n / 10) * 10, hi = lo + 10, ans = n % 10 >= 5 ? hi : lo, wrong = ans === hi ? lo : hi; return inp(`Bulatkan ${n} ke puluhan terdekat.`, ans, `${n} ada di antara ${lo} dan ${hi}. Angka satuannya ${n % 10}, ${n % 10 >= 5 ? '5 atau lebih → bulatkan ke atas' : 'kurang dari 5 → bulatkan ke bawah'}: <b>${ans}</b>.`, { vis: W.nl(lo, hi, 1, n), meta: { kind: 'round', wrong } }); } },
        { id: '2P2', name: 'Membulatkan ke ratusan terdekat', gen() { let n = r(101, 989); if (n % 100 === 0) n += 7; const lo = Math.floor(n / 100) * 100, hi = lo + 100, ans = n % 100 >= 50 ? hi : lo, wrong = ans === hi ? lo : hi; return inp(`Bulatkan ${n} ke ratusan terdekat.`, ans, `${n} ada di antara ${lo} dan ${hi}. Lihat angka puluhannya: ${Math.floor((n % 100) / 10)}. ${n % 100 >= 50 ? '5 atau lebih → ke atas' : 'kurang dari 5 → ke bawah'}: <b>${ans}</b>.`, { vis: W.nl(lo, hi, 10), log: `Bulatkan ${n} ke ratusan terdekat`, meta: { kind: 'round', wrong } }); } },
        { id: '2P3', name: 'Memperkirakan hasil penjumlahan', gen() { const rnd = (x) => Math.round(x / 10) * 10; let a = r(12, 88), b = r(12, 88); if (a % 10 === 5) a++; if (b % 10 === 5) b++; const ans = rnd(a) + rnd(b); return inp(`Perkirakan ${a} + ${b} dengan membulatkan ke puluhan terdekat.`, ans, `${a} ≈ ${rnd(a)} dan ${b} ≈ ${rnd(b)}. ${rnd(a)} + ${rnd(b)} = <b>${ans}</b>. (Hasil sebenarnya ${a + b}.)`, { meta: { kind: 'estimate' } }); } },
      ],
    },
  ];

  C.register(UNITS);
  C.GRADES.push({ id: 2, name: 'Kelas 2', ixl: 'https://www.ixl.com/math/grade-2/skills', sg: 'Primary Mathematics / Dimensions Math 2A dan 2B' });
})();
