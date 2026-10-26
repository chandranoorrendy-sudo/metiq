/* Metiq — perangkat pembuat soal untuk kelas 3–6.
 * Pembantu angka (desimal berkoma ala Indonesia, pecahan, FPB/KPK), gambar soal
 * (garis bilangan pecahan, petak desimal, sudut, koordinat, balok, diagram), dan pola kesalahan.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, range } = C.kit;

  /* ---------- Angka ---------- */
  const fmt = (n) => Number(n).toLocaleString('id-ID');
  // Desimal ditulis dengan koma: 2,5 (tanpa nol di belakang)
  const dec = (x, dp = 3) => { const v = Math.round(x * 10 ** dp) / 10 ** dp; return String(v).replace('.', ','); };
  const decT = (x, dp = 3) => { const s = dec(Math.abs(x), dp); const [i, f] = s.split(','); return (x < 0 ? '−' : '') + fmt(+i) + (f ? ',' + f : ''); };
  const neg = (n) => (n < 0 ? '−' + Math.abs(n) : String(n));
  const uniq = (arr) => [...new Set(arr.map(String))];
  const opts4 = (ans, cands) => shuffle(uniq([ans, ...shuffle(cands.filter((x) => String(x) !== String(ans)))]).slice(0, 4));
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const simp = (n, d) => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
  const fr = (n, d) => `${n}/${d}`;
  // Pecahan disederhanakan; bilangan campuran bila lebih dari 1 (mis. "2 1/3")
  const fs = (n, d, mixed = true) => { const [a, b] = simp(n, d); if (b === 1) return String(a); if (mixed && a > b) return `${Math.floor(a / b)} ${a % b}/${b}`; return `${a}/${b}`; };
  const hasCarry = (a, b) => { const da = String(a).split('').reverse(), db = String(b).split('').reverse(); return da.some((d, i) => +d + +(db[i] || 0) >= 10); };
  const hasBorrow = (a, b) => { const da = String(a).split('').reverse(), db = String(b).split('').reverse(); return db.some((d, i) => +d > +da[i]); };
  const stack = (a, op, b) => `<div class="stack"><span>${a}</span><span>${op} ${b}</span><span class="line">?</span></div>`;

  /* ---------- Gambar ---------- */
  const U = {
    nl(min, max, step, mark, label = fmt) {
      const n = Math.round((max - min) / step), gap = Math.min(34, 340 / n), w = n * gap + 44;
      let s = `<svg class="nl" viewBox="0 0 ${w} 92"><line x1="8" y1="60" x2="${w - 8}" y2="60" class="ax"/>`;
      for (let i = 0; i <= n; i++) { const x = 22 + i * gap; s += `<line x1="${x}" y1="53" x2="${x}" y2="67" class="tk"/><text x="${x}" y="86">${label(min + i * step)}</text>`; }
      if (mark != null) { const x = 22 + ((mark - min) / step) * gap; s += `<text x="${x}" y="22" class="qm">?</text><path d="M${x} 28 L${x} 50 M${x - 6} 42 L${x} 50 L${x + 6} 42" class="arrow"/>`; }
      return s + '</svg>';
    },
    // Garis bilangan pecahan 0..wholes, garis setiap 1/den, panah di num/den
    fracNL(den, wholes, num) {
      const n = den * wholes, gap = Math.min(40, 320 / n), w = n * gap + 44;
      let s = `<svg class="nl" viewBox="0 0 ${w} 92"><line x1="8" y1="60" x2="${w - 8}" y2="60" class="ax"/>`;
      for (let i = 0; i <= n; i++) { const x = 22 + i * gap, whole = i % den === 0; s += `<line x1="${x}" y1="${whole ? 50 : 54}" x2="${x}" y2="${whole ? 70 : 66}" class="tk"/>`; if (whole) s += `<text x="${x}" y="88">${i / den}</text>`; }
      if (num != null) { const x = 22 + num * gap; s += `<text x="${x}" y="22" class="qm">?</text><path d="M${x} 28 L${x} 48 M${x - 6} 40 L${x} 48 L${x + 6} 40" class="arrow"/>`; }
      return s + '</svg>';
    },
    decGrid(h) { return `<div class="dgrid">${range(0, 99).map((i) => `<i class="${i < h ? 'on' : ''}"></i>`).join('')}</div>`; },
    angle(deg, label) {
      const a = (deg * Math.PI) / 180, L = 95, cx = 40, cy = 120;
      const x2 = cx + L * Math.cos(a), y2 = cy - L * Math.sin(a), ra = 26;
      const ax = cx + ra * Math.cos(a), ay = cy - ra * Math.sin(a);
      const arc = deg === 90 ? `<path d="M${cx + 18} ${cy} L${cx + 18} ${cy - 18} L${cx} ${cy - 18}" class="arc"/>` : `<path d="M${cx + ra} ${cy} A${ra} ${ra} 0 ${deg > 180 ? 1 : 0} 0 ${ax} ${ay}" class="arc"/>`;
      return `<svg class="ang" viewBox="0 0 ${deg > 90 ? 180 : 150} 140"><g transform="translate(${deg > 90 ? 40 : 0},0)"><line x1="${cx}" y1="${cy}" x2="${cx + L}" y2="${cy}"/><line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}"/>${arc}<circle cx="${cx}" cy="${cy}" r="4"/>${label ? `<text x="${cx + 34 * Math.cos(a / 2)}" y="${cy - 34 * Math.sin(a / 2) + 4}">${label}</text>` : ''}</g></svg>`;
    },
    // Dua sudut berdampingan pada garis lurus (atau di sekitar titik siku)
    straight(known, total = 180) {
      const a = (known * Math.PI) / 180, cx = 110, cy = 100, L = 90;
      const x2 = cx + L * Math.cos(a), y2 = cy - L * Math.sin(a);
      const base = total === 180 ? `<line x1="${cx - L}" y1="${cy}" x2="${cx + L}" y2="${cy}"/>` : `<line x1="${cx}" y1="${cy}" x2="${cx + L}" y2="${cy}"/><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - L}"/><path d="M${cx + 14} ${cy} L${cx + 14} ${cy - 14} L${cx} ${cy - 14}" class="arc"/>`;
      const t1 = known / 2, t2 = (known + total) / 2;
      const p = (deg, rr) => [cx + rr * Math.cos((deg * Math.PI) / 180), cy - rr * Math.sin((deg * Math.PI) / 180)];
      const [l1x, l1y] = p(t1, 40), [l2x, l2y] = p(t2, 40);
      return `<svg class="ang" viewBox="0 0 220 120">${base}<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}"/><circle cx="${cx}" cy="${cy}" r="4"/><text x="${l1x}" y="${l1y + 4}">${known}°</text><text x="${l2x}" y="${l2y + 4}" class="qt">?</text></svg>`;
    },
    lines(kind) {
      const L = { sejajar: '<line x1="20" y1="40" x2="200" y2="40"/><line x1="20" y1="90" x2="200" y2="90"/>', 'tegak lurus': '<line x1="20" y1="65" x2="200" y2="65"/><line x1="110" y1="10" x2="110" y2="120"/><path d="M110 51 L124 51 L124 65" class="arc"/>', berpotongan: '<line x1="20" y1="20" x2="200" y2="110"/><line x1="20" y1="100" x2="200" y2="30"/>' };
      return `<svg class="ang" viewBox="0 0 220 130">${L[kind]}</svg>`;
    },
    coord(points, size = 8, quad4 = false) {
      const g = 26, min = quad4 ? -size / 2 : 0, max = quad4 ? size / 2 : size, n = max - min, W = n * g + 40, ox = 24 + (0 - min) * g, oy = 16 + max * g;
      let s = `<svg class="coord" viewBox="0 0 ${W} ${n * g + 40}">`;
      for (let i = 0; i <= n; i++) { const x = 24 + i * g, y = 16 + i * g; s += `<line x1="${x}" y1="16" x2="${x}" y2="${16 + n * g}" class="gl"/><line x1="24" y1="${y}" x2="${24 + n * g}" y2="${y}" class="gl"/>`; }
      s += `<line x1="24" y1="${oy}" x2="${24 + n * g}" y2="${oy}" class="axis"/><line x1="${ox}" y1="16" x2="${ox}" y2="${16 + n * g}" class="axis"/>`;
      for (let v = min; v <= max; v++) { if (v === 0 && quad4) continue; s += `<text x="${ox + v * g}" y="${oy + 14}" class="tl">${neg(v)}</text>`; if (v !== 0) s += `<text x="${ox - 8}" y="${oy - v * g + 4}" class="tl r">${neg(v)}</text>`; }
      points.forEach((p) => { s += `<circle cx="${ox + p.x * g}" cy="${oy - p.y * g}" r="5" class="pt"/><text x="${ox + p.x * g + 7}" y="${oy - p.y * g - 6}" class="pl">${p.l}</text>`; });
      return s + '</svg>';
    },
    rectLabel(w, h, unit = 'cm') {
      return `<svg class="shp" viewBox="0 0 240 150"><rect x="40" y="20" width="${Math.min(180, 40 + w * 10)}" height="${Math.min(100, 30 + h * 8)}" class="fillp"/><text x="${40 + Math.min(180, 40 + w * 10) / 2}" y="14" class="dl">${w} ${unit}</text><text x="34" y="${20 + Math.min(100, 30 + h * 8) / 2 + 4}" class="dl r">${h} ${unit}</text></svg>`;
    },
    // Bentuk L: persegi panjang besar a×b dikurangi pojok c×d (kanan atas)
    lshape(a, b, c, d, unit = 'cm') {
      const k = Math.min(160 / a, 110 / b), A = a * k, B = b * k, Cc = c * k, D = d * k, x = 40, y = 20;
      const pts = `${x},${y} ${x + A - Cc},${y} ${x + A - Cc},${y + D} ${x + A},${y + D} ${x + A},${y + B} ${x},${y + B}`;
      return `<svg class="shp" viewBox="0 0 240 ${B + 50}"><polygon points="${pts}" class="fillp"/><text x="${x + A / 2}" y="${y + B + 18}" class="dl">${a} ${unit}</text><text x="${x - 6}" y="${y + B / 2}" class="dl r">${b} ${unit}</text><text x="${x + A - Cc / 2}" y="${y + D / 2 + 4}" class="dl">${c} ${unit}</text><text x="${x + A - Cc - 4}" y="${y + D / 2 + 4}" class="dl r">${d} ${unit}</text></svg>`;
    },
    triangle(base, height, unit = 'cm') {
      const off = r(10, 60);
      return `<svg class="shp" viewBox="0 0 240 160"><polygon points="30,130 210,130 ${30 + off + 50},20" class="fillp"/><line x1="${30 + off + 50}" y1="20" x2="${30 + off + 50}" y2="130" class="dash"/><text x="120" y="150" class="dl">alas ${base} ${unit}</text><text x="${30 + off + 56}" y="80" class="dl l">tinggi ${height} ${unit}</text></svg>`;
    },
    para(base, height, unit = 'cm') {
      return `<svg class="shp" viewBox="0 0 240 150"><polygon points="30,120 170,120 210,30 70,30" class="fillp"/><line x1="70" y1="30" x2="70" y2="120" class="dash"/><text x="100" y="140" class="dl">alas ${base} ${unit}</text><text x="76" y="80" class="dl l">tinggi ${height} ${unit}</text></svg>`;
    },
    cuboid(l, w, h, grid) {
      const k = Math.min(18, 150 / (l + w * 0.6), 100 / (h + w * 0.5)), L = l * k, H = h * k, dx = w * k * 0.6, dy = w * k * 0.5, x = 56, y = 20 + dy;
      let s = `<svg class="shp" viewBox="0 0 ${L + dx + 110} ${H + dy + 60}"><polygon points="${x},${y} ${x + L},${y} ${x + L},${y + H} ${x},${y + H}" class="f1"/><polygon points="${x},${y} ${x + dx},${y - dy} ${x + L + dx},${y - dy} ${x + L},${y}" class="f2"/><polygon points="${x + L},${y} ${x + L + dx},${y - dy} ${x + L + dx},${y + H - dy} ${x + L},${y + H}" class="f3"/>`;
      if (grid) {
        for (let i = 1; i < l; i++) s += `<line x1="${x + i * k}" y1="${y}" x2="${x + i * k}" y2="${y + H}" class="cg"/><line x1="${x + i * k}" y1="${y}" x2="${x + i * k + dx}" y2="${y - dy}" class="cg"/>`;
        for (let i = 1; i < h; i++) s += `<line x1="${x}" y1="${y + i * k}" x2="${x + L}" y2="${y + i * k}" class="cg"/><line x1="${x + L}" y1="${y + i * k}" x2="${x + L + dx}" y2="${y + i * k - dy}" class="cg"/>`;
        for (let i = 1; i < w; i++) { const fx = (i / w) * dx, fy = (i / w) * dy; s += `<line x1="${x + fx}" y1="${y - fy}" x2="${x + L + fx}" y2="${y - fy}" class="cg"/><line x1="${x + L + fx}" y1="${y - fy}" x2="${x + L + fx}" y2="${y + H - fy}" class="cg"/>`; }
      } else {
        s += `<text x="${x + L / 2}" y="${y + H + 18}" class="dl">${l} cm</text><text x="${x - 6}" y="${y + H / 2 + 4}" class="dl r">${h} cm</text><text x="${x + L + dx / 2 + 8}" y="${y + H - dy / 2 + 16}" class="dl l">${w} cm</text>`;
      }
      return s + '</svg>';
    },
    // Jari-jari digambar dari pusat; diameter (label diawali "d") digambar melintasi lingkaran
    circle(rad, label = 'r') { const dia = /^d/.test(label); return `<svg class="shp" viewBox="0 0 200 160"><circle cx="100" cy="80" r="66" class="fillp"/><line x1="${dia ? 34 : 100}" y1="80" x2="166" y2="80" class="dash"/><circle cx="100" cy="80" r="3"/><text x="${dia ? 100 : 133}" y="72" class="dl">${label}</text></svg>`; },
    barGraph(title, rows, max, step) {
      const w = 320, h = 230, x0 = 38, y0 = 186, ph = 150, bw = (w - x0 - 8) / rows.length;
      let s = `<svg class="bgraph" viewBox="0 0 ${w} ${h}"><text x="${w / 2}" y="14" class="t">${title}</text>`;
      for (let v = 0; v <= max; v += step) { const y = y0 - (v / max) * ph; s += `<line x1="${x0}" x2="${w - 4}" y1="${y}" y2="${y}" class="g"/><text x="${x0 - 6}" y="${y + 4}" class="yl">${v}</text>`; }
      rows.forEach(([l, n, c], i) => { const x = x0 + i * bw + bw * 0.18, bh = (n / max) * ph; s += `<rect x="${x}" y="${y0 - bh}" width="${bw * 0.64}" height="${bh}" rx="3" class="b b${i % 4}"${c ? ` style="fill:${c}"` : ''}/><text x="${x + bw * 0.32}" y="${y0 + 18}" class="xl">${l}</text>`; });
      return s + '</svg>';
    },
    lineGraph(title, pts, max, step) {
      const w = 320, h = 230, x0 = 38, y0 = 186, ph = 150, bw = (w - x0 - 20) / (pts.length - 1);
      let s = `<svg class="bgraph" viewBox="0 0 ${w} ${h}"><text x="${w / 2}" y="14" class="t">${title}</text>`;
      for (let v = 0; v <= max; v += step) { const y = y0 - (v / max) * ph; s += `<line x1="${x0}" x2="${w - 4}" y1="${y}" y2="${y}" class="g"/><text x="${x0 - 6}" y="${y + 4}" class="yl">${v}</text>`; }
      const P = pts.map(([, v], i) => [x0 + 10 + i * bw, y0 - (v / max) * ph]);
      s += `<polyline points="${P.map((p) => p.join(',')).join(' ')}" class="ln"/>`;
      pts.forEach(([l], i) => { s += `<circle cx="${P[i][0]}" cy="${P[i][1]}" r="4" class="lp"/><text x="${P[i][0]}" y="${y0 + 18}" class="xl">${l}</text>`; });
      return s + '</svg>';
    },
    pie(slices) {
      const cols = ['#ff7a59', '#4d96ff', '#2ecc71', '#f9c74f', '#a29bfe'];
      let s = '<div class="piewrap"><svg class="pie" viewBox="0 0 160 160">', a0 = -Math.PI / 2;
      slices.forEach(([, p], i) => { const a1 = a0 + (p / 100) * 2 * Math.PI; s += `<path d="M80 80 L${80 + 70 * Math.cos(a0)} ${80 + 70 * Math.sin(a0)} A70 70 0 ${p > 50 ? 1 : 0} 1 ${80 + 70 * Math.cos(a1)} ${80 + 70 * Math.sin(a1)} Z" style="fill:${cols[i]}"/>`; a0 = a1; });
      s += '</svg><div class="pielg">' + slices.map(([l, p], i) => `<span><i style="background:${cols[i]}"></i>${l} ${p}%</span>`).join('') + '</div></div>';
      return s;
    },
    compass() {
      const d = [['U', 0], ['TL', 45], ['T', 90], ['TG', 135], ['S', 180], ['BD', 225], ['B', 270], ['BL', 315]];
      return `<svg class="ang" viewBox="0 0 160 160"><circle cx="80" cy="80" r="56" class="cring"/>${d.map(([l, a]) => { const t = ((a - 90) * Math.PI) / 180; return `<line x1="80" y1="80" x2="${80 + 50 * Math.cos(t)}" y2="${80 + 50 * Math.sin(t)}" class="${l.length === 1 ? '' : 'thin'}"/><text x="${80 + 68 * Math.cos(t)}" y="${84 + 68 * Math.sin(t)}" class="cl">${l}</text>`; }).join('')}</svg>`;
    },
    poly(n, color = '#7c5cff') {
      const pts = range(0, n - 1).map((i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; return `${60 + 52 * Math.cos(a)},${62 + 52 * Math.sin(a)}`; }).join(' ');
      return `<svg class="shape" viewBox="0 0 120 120" style="fill:${color}"><polygon points="${pts}"/></svg>`;
    },
    table(head, rows) { return `<table class="io">${`<tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>`}${rows.map((row) => `<tr>${row.map((c) => `<td class="${c === '?' ? 'q' : ''}">${c}</td>`).join('')}</tr>`).join('')}</table>`; },
    bag(items) { return `<div class="bag">${items.map(([e, n]) => e.repeat(n)).join('')}</div>`; },
  };

  Object.assign(C.TAGS, {
    'urutan-operasi': { label: 'Mengerjakan dari kiri ke kanan tanpa aturan urutan', tip: 'Ingat urutannya: kurung dulu, lalu × dan ÷, baru + dan −. Lingkari bagian yang dikerjakan lebih dulu.' },
    'penyebut-dijumlah': { label: 'Menjumlahkan penyebut pecahan', tip: '1/2 + 1/3 bukan 2/5. Samakan penyebutnya dulu (1/2 = 3/6, 1/3 = 2/6), lalu jumlahkan pembilangnya saja.' },
    'koma-desimal': { label: 'Salah meletakkan koma desimal', tip: 'Tulis bersusun dengan koma lurus ke bawah. Tambahkan nol di belakang agar banyak angka di belakang koma sama (2,5 = 2,50).' },
    'desimal-panjang': { label: 'Mengira desimal yang lebih panjang pasti lebih besar', tip: '0,5 lebih besar dari 0,45. Samakan banyak angka di belakang koma: 0,50 dan 0,45, lalu bandingkan.' },
    'bilangan-bulat': { label: 'Bingung tanda bilangan negatif', tip: 'Gunakan garis bilangan atau termometer: menambah bilangan negatif berarti bergerak ke kiri (ke bawah).' },
    'satuan': { label: 'Salah mengubah satuan', tip: 'Ingat: 1 m = 100 cm, 1 km = 1.000 m, 1 kg = 1.000 g, 1 L = 1.000 mL. Satuan besar ke kecil dikali, kecil ke besar dibagi.' },
    'sisa': { label: 'Salah menafsirkan sisa pembagian', tip: 'Baca soalnya lagi: jika sisa masih perlu tempat (mis. murid yang belum dapat mobil), tambahkan 1 pada hasil bagi.' },
    'luas-keliling': { label: 'Tertukar luas dan keliling', tip: 'Keliling = panjang pagar di sekeliling (dijumlah). Luas = banyak petak di dalam (panjang × lebar).' },
    'persen': { label: 'Salah menghitung persen', tip: 'Persen artinya "per seratus": 25% dari 80 = 25/100 × 80 = 20. Mulai dari 10% (bagi 10), lalu kalikan.' },
    'rumus-segitiga': { label: 'Lupa membagi dua pada luas segitiga', tip: 'Luas segitiga = alas × tinggi ÷ 2, karena segitiga adalah setengah dari persegi panjang.' },
  });

  // Klasifikasi tambahan untuk kelas 3–6
  const baseClassify = C.classify;
  C.classify = function (q, given) {
    const m = q.meta || {};
    const gs = String(given).replace('−', '-').replace(/\s/g, '');
    const g = Number(gs.replace(/\./g, '').replace(',', '.'));
    if (m.alt && m.alt[gs] !== undefined) return m.alt[gs];
    if (m.kind === 'neg' && !isNaN(g) && g === -Number(String(q.answer).replace('−', '-'))) return 'bilangan-bulat';
    if (m.kind === 'decimal' && !isNaN(g)) { const c = Number(String(q.answer).replace(',', '.')); if (g !== c && [10, 100, 0.1, 0.01].some((f) => Math.abs(g - c * f) < 1e-9)) return 'koma-desimal'; }
    if (m.kind === 'unit' && !isNaN(g)) { const c = Number(String(q.answer).replace(',', '.')); if (g !== c && [10, 100, 1000, 0.1, 0.01, 0.001].some((f) => Math.abs(g - c * f) < 1e-9)) return 'satuan'; }
    return baseClassify(q, given);
  };

  Object.assign(C.kit, { fmt, dec, decT, neg, uniq, opts4, gcd, lcm, simp, fr, fs, hasCarry, hasBorrow, stack, U });
})();
