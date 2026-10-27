/* Metiq — animasi singkat (seperti GIF) untuk setiap bab. Tanpa suara.
 * Setiap animasi terdiri dari beberapa adegan SVG yang bergerak dengan CSS, diberi keterangan di bawahnya, lalu berulang.
 */
(function () {
  const C = { t: '#2fd9b4', tl: '#66ffdb', d: '#00806b', r: '#ff7a59', y: '#f9c74f', b: '#4d96ff', p: '#fd79a8', g: '#2ecc71', ink: '#16302b', l: '#cfe3de', w: '#fff' };
  const f = (n) => { const r = Math.round(n * 1000) / 1000; return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ','); };
  const big = (n) => Number(n).toLocaleString('id-ID');
  // jeda animasi per elemen; maxD dipakai untuk menentukan lama adegan
  let maxD = 0;
  const dl = (s, extra = '') => { maxD = Math.max(maxD, s); return `style="animation-delay:${s.toFixed(2)}s;${extra}"`; };
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.fs || 15}" fill="${o.c || C.ink}" font-weight="${o.w || 800}" class="${o.cls || 'a-fade'}" ${dl(o.d || 0)}>${s}</text>`;
  const circ = (x, y, r, fill, d, cls = 'a-pop', stroke = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${stroke} class="${cls}" ${dl(d)}/>`;
  const emo = (x, y, e, d, fs = 22) => `<text x="${x}" y="${y + fs * 0.35}" text-anchor="middle" font-size="${fs}" class="a-pop" ${dl(d)}>${e}</text>`;

  /* ---------- Primitif gambar (kanvas 320 × 200) ---------- */
  // kumpulan benda: n buah, a buah pertama berwarna merah; cross = berapa yang dicoret di akhir
  function dots({ n, a = n, cols = Math.min(n, 10), x, y = 70, e, cross = 0, count, d0 = 0.2, gap = 28, c1 = C.r, c2 = C.y }) {
    const rows = Math.ceil(n / cols), w = (Math.min(n, cols) - 1) * gap, x0 = x === undefined ? 160 - w / 2 : x;
    let s = '';
    for (let i = 0; i < n; i++) {
      const cx = x0 + (i % cols) * gap, cy = y + Math.floor(i / cols) * gap, d = d0 + i * 0.22;
      s += e ? emo(cx, cy, e, d) : circ(cx, cy, 11, i < a ? c1 : c2, d);
      if (count) s += T(cx, cy - 18, i + 1, { fs: 11, c: C.d, d });
    }
    for (let i = n - cross; i < n; i++) {
      const cx = x0 + (i % cols) * gap, cy = y + Math.floor(i / cols) * gap, d = d0 + n * 0.22 + 0.4 + (i - n + cross) * 0.3;
      s += `<path d="M${cx - 12} ${cy - 12}L${cx + 12} ${cy + 12}" stroke="${C.ink}" stroke-width="4" pathLength="1" class="a-draw" ${dl(d)}/>`;
    }
    return s;
  }
  // bingkai sepuluh: a merah lalu b kuning
  function frame({ a = 0, b = 0, x = 60, y = 50, s = 40, d0 = 0.2 }) {
    let o = '';
    for (let i = 0; i < 10; i++) o += `<rect x="${x + (i % 5) * s}" y="${y + Math.floor(i / 5) * s}" width="${s}" height="${s}" fill="#fff" stroke="${C.ink}" stroke-width="2"/>`;
    for (let i = 0; i < a + b; i++) o += circ(x + (i % 5) * s + s / 2, y + Math.floor(i / 5) * s + s / 2, s * 0.34, i < a ? C.r : C.y, d0 + i * 0.22 + (i >= a ? 0.5 : 0));
    return o;
  }
  // garis bilangan dengan lompatan; den = penyebut untuk pecahan; dec = tampilkan desimal
  function line({ from, to, step = 1, lab = 1, start, hops = [], mark = [], y = 120, den, d0 = 0.3 }) {
    const X = (v) => 20 + ((v - from) / (to - from)) * 280;
    const show = (v) => (den ? (Math.abs(v - Math.round(v)) < 1e-9 ? f(Math.round(v)) : `${Math.round(v * den)}/${den}`) : f(v));
    let o = `<line x1="12" y1="${y}" x2="308" y2="${y}" stroke="${C.ink}" stroke-width="3"/>`;
    const n = Math.round((to - from) / step);
    for (let i = 0; i <= n; i++) {
      const v = from + i * step, labeled = i % lab === 0;
      o += `<line x1="${X(v)}" y1="${y - (labeled ? 8 : 5)}" x2="${X(v)}" y2="${y + (labeled ? 8 : 5)}" stroke="${C.ink}" stroke-width="2"/>`;
      if (labeled) o += `<text x="${X(v)}" y="${y + 26}" text-anchor="middle" font-size="${n > 12 ? 10 : 12}" font-weight="700" fill="${C.ink}">${show(v)}</text>`;
    }
    let cur = start, d = d0;
    if (start !== undefined) o += circ(X(start), y, 7, C.d, d);
    hops.forEach((h) => {
      d += 0.7; const x1 = X(cur), x2 = X(cur + h), up = Math.max(18, Math.min(60, Math.abs(x2 - x1) * 0.6));
      o += `<path d="M${x1} ${y - 4} Q${(x1 + x2) / 2} ${y - up * 1.6} ${x2} ${y - 4}" fill="none" stroke="${h < 0 ? C.r : C.d}" stroke-width="3" pathLength="1" class="a-draw" ${dl(d)}/>`;
      o += T((x1 + x2) / 2, y - up * 0.85 - 6, (h > 0 ? '+' : '−') + f(Math.abs(h)), { fs: 12, c: h < 0 ? C.r : C.d, d: d + 0.3 });
      cur += h; o += circ(X(cur), y, 7, h < 0 ? C.r : C.d, d + 0.5);
    });
    mark.forEach((m, i) => { o += circ(X(m), y, 8, C.r, d0 + 0.4 + i * 0.5) + T(X(m), y - 18, show(m), { c: C.r, d: d0 + 0.5 + i * 0.5 }); });
    return o;
  }
  // pasangan bilangan: keseluruhan di atas, dua bagian di bawah ("?" untuk yang dicari)
  function bond({ w, a, b, d0 = 0.2 }) {
    const node = (x, y, v, d, c) => circ(x, y, 26, c, d, 'a-pop', `stroke="${C.ink}" stroke-width="2.5"`) + T(x, y + 7, v, { fs: 20, d: d + 0.1 });
    return `<path d="M160 64L95 128M160 64L225 128" stroke="${C.ink}" stroke-width="3" pathLength="1" class="a-draw" ${dl(d0 + 0.5)}/>`
      + node(160, 45, w, d0, C.tl) + node(95, 150, a, d0 + 1.1, '#fff') + node(225, 150, b, d0 + 1.6, '#fff');
  }
  // model batang: rows = [{ l, s: [[nilai, label, warna]] }], total = label kurung kurawal di atas baris terakhir
  function bar({ rows, unit, total, x = 70, d0 = 0.2 }) {
    const max = Math.max(...rows.map((r) => r.s.reduce((t, s) => t + s[0], 0))), u = unit || 230 / max;
    let o = '', d = d0;
    rows.forEach((r, i) => {
      const y = 40 + i * 62 + (rows.length === 1 ? 40 : 0); let cx = x;
      o += T(x - 8, y + 21, r.l, { a: 'end', fs: 13, d });
      r.s.forEach(([v, lbl, c]) => {
        o += `<rect x="${cx}" y="${y}" width="${v * u}" height="30" rx="4" fill="${c || C.tl}" stroke="${C.ink}" stroke-width="2" class="a-growx" ${dl(d)}/>` + T(cx + (v * u) / 2, y + 21, lbl, { fs: 14, d: d + 0.3 });
        cx += v * u; d += 0.6;
      });
      // label total: di kanan batang jika muat, jika tidak di atas ujung kanan
      if (total && i === rows.length - 1 && rows.length > 1) o += cx + 14 + total.length * 9 < 316 ? T(cx + 10, y + 21, total, { a: 'start', c: C.d, d: d + 0.2 }) : T(cx, y - 7, total, { a: 'end', c: C.d, d: d + 0.2 });
      else if (total && i === rows.length - 1) o += `<path d="M${x} ${y - 6}Q${x} ${y - 16} ${x + 10} ${y - 16}H${cx - 10}Q${cx} ${y - 16} ${cx} ${y - 6}" fill="none" stroke="${C.d}" stroke-width="2.5" pathLength="1" class="a-draw" ${dl(d)}/>` + T((x + cx) / 2, y - 22, total, { c: C.d, d: d + 0.3 });
    });
    return o;
  }
  // susunan baris dan kolom; split = jumlah baris berwarna pertama (sifat distributif)
  function array({ r, c, e, split = r, s = 22, y = 30, label, d0 = 0.2 }) {
    const x0 = 160 - ((c - 1) * s) / 2; let o = '';
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) {
      const d = d0 + i * 0.45 + j * 0.05;
      o += e ? emo(x0 + j * s, y + i * s, e, d, s * 0.8) : circ(x0 + j * s, y + i * s, s * 0.38, i < split ? C.r : C.b, d);
    }
    if (label) o += T(160, Math.min(192, y + r * s + 12), label, { fs: 17, c: C.d, d: d0 + r * 0.45 + 0.3 });
    return o;
  }
  // membagi rata: n benda bergerak dari tumpukan ke k kelompok (sisa tetap di tumpukan)
  function groups({ n, k, e = '🍪', d0 = 0.3 }) {
    const per = Math.floor(n / k), gx = (g) => 160 + (g - (k - 1) / 2) * (300 / k); let o = '';
    for (let g = 0; g < k; g++) o += `<ellipse cx="${gx(g)}" cy="150" rx="${Math.min(46, 140 / k)}" ry="34" fill="#f2fdf9" stroke="${C.d}" stroke-width="2" class="a-fade" ${dl(d0)}/>`;
    for (let i = 0; i < n; i++) {
      const sx = 160 + ((i % 8) - 3.5) * 22, sy = 30 + Math.floor(i / 8) * 22;
      if (i >= per * k) { o += emo(sx, sy, e, d0 + 0.2, 18); continue; }
      const g = i % k, slot = Math.floor(i / k), tx = gx(g) + ((slot % 3) - 1) * 18, ty = 140 + Math.floor(slot / 3) * 18 - (per > 3 ? 8 : 0);
      o += `<text x="${tx}" y="${ty + 6}" text-anchor="middle" font-size="18" class="a-move" ${dl(d0 + 0.5 + i * 0.25, `--dx:${sx - tx}px;--dy:${sy - ty}px`)}>${e}</text>`;
    }
    return o;
  }
  // blok nilai tempat: ratusan, puluhan, satuan
  function place({ h = 0, t = 0, o = 0, x = 20, y = 30, d0 = 0.2 }) {
    let s = '', cx = x, d = d0;
    for (let i = 0; i < h; i++) { s += `<rect x="${cx}" y="${y}" width="60" height="60" fill="${C.b}" stroke="${C.ink}" stroke-width="1.5" class="a-pop" ${dl(d)}/><path d="${[...Array(9)].map((_, k) => `M${cx + 6 * (k + 1)} ${y}v60M${cx} ${y + 6 * (k + 1)}h60`).join('')}" stroke="#fff" stroke-opacity=".5" class="a-pop" ${dl(d)}/>`; cx += 66; d += 0.4; }
    for (let i = 0; i < t; i++) { s += `<rect x="${cx}" y="${y}" width="10" height="60" fill="${C.g}" stroke="${C.ink}" stroke-width="1.5" class="a-pop" ${dl(d)}/><path d="${[...Array(9)].map((_, k) => `M${cx} ${y + 6 * (k + 1)}h10`).join('')}" stroke="#fff" stroke-opacity=".6" class="a-pop" ${dl(d)}/>`; cx += 14; d += 0.3; }
    cx += 4;
    for (let i = 0; i < o; i++) { s += `<rect x="${cx + (i % 5) * 12}" y="${y + 48 - Math.floor(i / 5) * 12}" width="10" height="10" fill="${C.y}" stroke="${C.ink}" stroke-width="1.5" class="a-pop" ${dl(d)}/>`; d += 0.2; }
    return s;
  }
  // jam analog: jarum berputar dari pukul 12.00
  function clock({ h, m, x = 160, y = 100, r = 70, d0 = 0.3 }) {
    let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="4"/>`;
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2; s += `<text x="${x + Math.sin(a) * (r - 15)}" y="${y - Math.cos(a) * (r - 15) + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="${C.ink}">${i}</text>`; }
    const hd = ((h % 12) + m / 60) * 30, md = m * 6;
    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - r * 0.5}" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" class="a-rot" ${dl(d0, `--r:${hd}deg;transform-origin:${x}px ${y}px`)}/>`;
    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - r * 0.78}" stroke="${C.d}" stroke-width="4" stroke-linecap="round" class="a-rot" ${dl(d0, `--r:${md}deg;transform-origin:${x}px ${y}px`)}/>`;
    return s + `<circle cx="${x}" cy="${y}" r="5" fill="${C.ink}"/>`;
  }
  // pecahan: lingkaran atau batang dibagi n, k bagian diarsir
  function frac({ n, k, shape = 'circle', x = 160, y = 95, r = 55, w = 220, label, c = C.t, d0 = 0.2 }) {
    let s = '';
    if (shape === 'circle') {
      for (let i = 0; i < n; i++) {
        const a1 = (i / n) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
        const p = n === 1 ? `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0` : `M${x} ${y}L${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)}A${r} ${r} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${x + r * Math.cos(a2)} ${y + r * Math.sin(a2)}Z`;
        s += `<path d="${p}" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>`;
        if (i < k) s += `<path d="${p}" fill="${c}" stroke="${C.ink}" stroke-width="2.5" class="a-fade" ${dl(d0 + 0.4 + i * 0.35)}/>`;
      }
    } else {
      const x0 = x - w / 2, sw = w / n;
      for (let i = 0; i < n; i++) {
        s += `<rect x="${x0 + i * sw}" y="${y - 18}" width="${sw}" height="36" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>`;
        if (i < k) s += `<rect x="${x0 + i * sw}" y="${y - 18}" width="${sw}" height="36" fill="${c}" stroke="${C.ink}" stroke-width="2.5" class="a-fade" ${dl(d0 + 0.4 + i * 0.3)}/>`;
      }
    }
    if (label) s += T(x, shape === 'circle' ? y + r + 24 : y + 42, label, { fs: 17, c: C.d, d: d0 + 0.6 + k * 0.35 });
    return s;
  }
  // petak satuan: luas (diisi satu per satu), keliling (tepi digambar), color(x, y) untuk arsiran khusus
  function grid({ w, h, mode = 'area', s, color, skip, label, d0 = 0.2 }) {
    s = s || Math.min(26, 150 / h, 280 / w); const x0 = 160 - (w * s) / 2, y0 = 92 - (h * s) / 2; let o = '', n = 0;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (skip && skip(i, j)) continue;
      const fill = color ? color(i, j) : mode === 'area' ? C.tl : '#fff', d = d0 + n * Math.min(0.12, 3 / (w * h)); n++;
      o += `<rect x="${x0 + i * s}" y="${y0 + j * s}" width="${s}" height="${s}" fill="#fff" stroke="${C.l}" stroke-width="1.5"/>`;
      if (fill !== '#fff') o += `<rect x="${x0 + i * s}" y="${y0 + j * s}" width="${s}" height="${s}" fill="${fill}" stroke="${C.ink}" stroke-width="1" class="a-pop" ${dl(mode === 'area' || color ? d : 0)}/>`;
    }
    if (mode === 'perim') o += `<rect x="${x0}" y="${y0}" width="${w * s}" height="${h * s}" fill="none" stroke="${C.r}" stroke-width="4" pathLength="1" class="a-draw" ${dl(d0 + 0.3)}/>` + T(160, y0 - 8, `${w}`, { c: C.r, d: d0 + 1 }) + T(x0 - 12, y0 + (h * s) / 2 + 5, `${h}`, { c: C.r, d: d0 + 1.2 });
    if (label) o += T(160, Math.min(194, y0 + h * s + 22), label, { fs: 16, c: C.d, d: maxD + 0.4 });
    return o;
  }
  // model luas untuk perkalian: (a1 + a2) × (b1 + b2)
  function areaModel({ a, b, d0 = 0.2 }) {
    const W = 230, H = 120, x0 = 70, y0 = 40, wa = a.map((v) => (v / a.reduce((t, x) => t + x, 0)) * W), hb = b.map((v) => (v / b.reduce((t, x) => t + x, 0)) * H);
    let o = '', d = d0, cy = y0;
    b.forEach((bv, j) => {
      let cx = x0;
      a.forEach((av, i) => { o += `<rect x="${cx}" y="${cy}" width="${wa[i]}" height="${hb[j]}" fill="${[C.tl, C.y, C.p, C.b][(i + j * 2) % 4]}" stroke="${C.ink}" stroke-width="2" class="a-pop" ${dl(d)}/>` + T(cx + wa[i] / 2, cy + hb[j] / 2 + 5, big(av * bv), { fs: 14, d: d + 0.3 }); cx += wa[i]; d += 0.6; });
      o += T(x0 - 10, cy + hb[j] / 2 + 5, big(bv), { a: 'end', c: C.d, d: d0 }); cy += hb[j];
    });
    let cx = x0; a.forEach((av, i) => { o += T(cx + wa[i] / 2, y0 - 10, big(av), { c: C.d, d: d0 }); cx += wa[i]; });
    return o;
  }
  // baris-baris tulisan yang muncul berurutan; {teks} = warna utama, [teks] = merah
  function eq({ lines, fs = 18, y0, gap, d0 = 0.2, step = 0.9 }) {
    gap = gap || Math.min(36, 170 / lines.length); y0 = y0 || 100 - ((lines.length - 1) * gap) / 2 + fs / 3;
    const mk = (s) => s.replace(/\{([^}]*)\}/g, `<tspan fill="${C.d}">$1</tspan>`).replace(/\[([^\]]*)\]/g, `<tspan fill="${C.r}">$1</tspan>`);
    return lines.map((l, i) => `<text x="160" y="${y0 + i * gap}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="${C.ink}" class="a-up" ${dl(d0 + i * step)}>${mk(l)}</text>`).join('');
  }
  // diagram batang atau garis
  function chart({ bars, max, kind = 'bar', unit = '', d0 = 0.2 }) {
    max = max || Math.max(...bars.map((b) => b[1])); const bw = Math.min(50, 240 / bars.length), gap = 260 / bars.length, base = 165, Y = (v) => base - (v / max) * 125;
    let o = `<line x1="30" y1="${base}" x2="300" y2="${base}" stroke="${C.ink}" stroke-width="2"/><line x1="30" y1="${base}" x2="30" y2="25" stroke="${C.ink}" stroke-width="2"/>`, pts = [];
    bars.forEach(([l, v], i) => {
      const cx = 45 + gap * i + gap / 2, d = d0 + i * 0.45; pts.push(`${cx},${Y(v)}`);
      o += `<text x="${cx}" y="${base + 20}" text-anchor="middle" font-size="${l.length > 3 ? 11 : 16}" font-weight="700">${l}</text>`;
      if (kind === 'bar') o += `<rect x="${cx - bw / 2}" y="${Y(v)}" width="${bw}" height="${base - Y(v)}" rx="4" fill="${[C.t, C.y, C.r, C.b, C.p][i % 5]}" class="a-growy" ${dl(d)}/>`;
      else o += circ(cx, Y(v), 5, C.r, d + 0.6);
      o += T(cx, Y(v) - 8, f(v) + unit, { fs: 13, d: d + 0.4 });
    });
    if (kind === 'line') o += `<polyline points="${pts.join(' ')}" fill="none" stroke="${C.d}" stroke-width="3" pathLength="1" class="a-draw" ${dl(d0 + 0.3)}/>`;
    return o;
  }
  // uang: lembaran dan koin muncul berurutan, lalu totalnya
  function money({ items, total = true, d0 = 0.2 }) {
    let o = '', d = d0; const x0 = 160 - (items.length * 64) / 2 + 32;
    items.forEach((v, i) => {
      const x = x0 + i * 64;
      o += v >= 1000 ? `<rect x="${x - 29}" y="55" width="58" height="34" rx="5" fill="${{ 1000: '#b8e0c4', 2000: '#b7d2ef', 5000: '#e9c99b', 10000: '#d7b3e6', 20000: '#a6dbb0', 50000: '#9ec7ea', 100000: '#f3a8a8' }[v] || '#ddd'}" stroke="${C.ink}" stroke-width="2" class="a-pop" ${dl(d)}/>` : circ(x, 72, 20, v >= 500 ? '#f3d27a' : '#d9d9d9', d, 'a-pop', `stroke="${C.ink}" stroke-width="2"`);
      o += T(x, 77, big(v), { fs: v >= 10000 ? 11 : 12, d: d + 0.1 }); d += 0.5;
    });
    if (total) o += T(160, 140, `Rp${big(items.reduce((t, v) => t + v, 0))}`, { fs: 24, c: C.d, d: d + 0.3 });
    return o;
  }
  // bangun datar beraturan dengan titik sudut bernomor
  function shape({ n, r = 62, y = 92, label, pts, d0 = 0.2 }) {
    pts = pts || [...Array(n)].map((_, i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2 + (n % 2 ? 0 : Math.PI / n); return [160 + r * Math.cos(a), y + r * Math.sin(a)]; });
    let o = `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${C.tl}" fill-opacity=".45" stroke="${C.ink}" stroke-width="3" pathLength="1" class="a-draw" ${dl(d0)}/>`;
    pts.forEach(([x, yy], i) => { o += circ(x, yy, 6, C.r, d0 + 1 + i * 0.35) + T(x + (x - 160) * 0.25, yy + (yy - y) * 0.25 + 5, i + 1, { fs: 12, c: C.r, d: d0 + 1 + i * 0.35 }); });
    if (label) o += T(160, 192, label, { fs: 16, c: C.d, d: d0 + 1.2 + pts.length * 0.35 });
    return o;
  }
  // sudut: satu kaki berputar dari 0° ke deg
  function angle({ deg, label, x = 120, y = 150, L = 110, d0 = 0.3 }) {
    const a = (deg * Math.PI) / 180, R = 34;
    return `<line x1="${x}" y1="${y}" x2="${x + L}" y2="${y}" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`
      + `<line x1="${x}" y1="${y}" x2="${x + L}" y2="${y}" stroke="${C.d}" stroke-width="4" stroke-linecap="round" class="a-rot" ${dl(d0, `--r:${-deg}deg;transform-origin:${x}px ${y}px`)}/>`
      + (deg === 90 ? `<path d="M${x + 18} ${y}V${y - 18}H${x}" fill="none" stroke="${C.r}" stroke-width="3" class="a-fade" ${dl(d0 + 1.3)}/>`
        : `<path d="M${x + R} ${y}A${R} ${R} 0 ${deg > 180 ? 1 : 0} 0 ${x + R * Math.cos(a)} ${y - R * Math.sin(a)}" fill="none" stroke="${C.r}" stroke-width="3" pathLength="1" class="a-draw" ${dl(d0 + 1.3)}/>`)
      + T(x + 58 * Math.cos(a / 2), y - 58 * Math.sin(a / 2) + 5, `${deg}°`, { c: C.r, d: d0 + 1.6 }) + (label ? T(240, 40, label, { fs: 16, c: C.d, d: d0 + 2 }) : '');
  }
  // bidang koordinat; four = empat kuadran
  function coord({ pts, four, d0 = 0.3 }) {
    const lo = four ? -5 : 0, hi = four ? 5 : 8, s = 160 / (hi - lo), ox = four ? 160 : 60, oy = four ? 100 : 175, X = (v) => ox + v * s * (four ? 1 : 1.3), Y = (v) => oy - v * s * (four ? 1 : 0.95);
    let o = '';
    for (let v = lo; v <= hi; v++) o += `<line x1="${X(v)}" y1="${Y(lo)}" x2="${X(v)}" y2="${Y(hi)}" stroke="${C.l}"/><line x1="${X(lo)}" y1="${Y(v)}" x2="${X(hi)}" y2="${Y(v)}" stroke="${C.l}"/>` + (v ? `<text x="${X(v)}" y="${oy + 13}" text-anchor="middle" font-size="9">${f(v)}</text><text x="${ox - 6}" y="${Y(v) + 3}" text-anchor="end" font-size="9">${f(v)}</text>` : '');
    o += `<line x1="${X(lo)}" y1="${oy}" x2="${X(hi)}" y2="${oy}" stroke="${C.ink}" stroke-width="2"/><line x1="${ox}" y1="${Y(lo)}" x2="${ox}" y2="${Y(hi)}" stroke="${C.ink}" stroke-width="2"/>`;
    pts.forEach(([x, y, c], i) => {
      const d = d0 + i * 2.2;
      o += `<path d="M${ox} ${oy}H${X(x)}" stroke="${C.b}" stroke-width="3" stroke-dasharray="1" pathLength="1" class="a-draw" ${dl(d)}/><path d="M${X(x)} ${oy}V${Y(y)}" stroke="${C.r}" stroke-width="3" pathLength="1" class="a-draw" ${dl(d + 0.8)}/>`
        + circ(X(x), Y(y), 6, c || C.d, d + 1.5) + T(X(x) + (x < 0 ? -26 : 26), Y(y) - 6, `(${f(x)}, ${f(y)})`, { fs: 12, d: d + 1.6 });
    });
    return o;
  }
  // kubus satuan isometrik, lapis demi lapis
  function cubes({ l, w, h, label, d0 = 0.2 }) {
    const s = Math.min(22, 120 / (l + w + h) * 1.4), ox = 160 + (l - w) * s * 0.43, oy = 172 - (l + w) * s * 0.5;
    const P = (i, j, k) => [ox + (i - j) * s * 0.87, oy + (i + j) * s * 0.5 - k * s];
    let o = '';
    for (let k = 0; k < h; k++) for (let j = w - 1; j >= 0; j--) for (let i = l - 1; i >= 0; i--) {
      const d = d0 + k * 0.8 + (w - 1 - j + l - 1 - i) * 0.05, a = P(i, j, k), b = P(i + 1, j, k), c = P(i + 1, j + 1, k), e = P(i, j + 1, k), up = (p) => [p[0], p[1] - s];
      const poly = (ps, fill) => `<polygon points="${ps.map((p) => p.join(',')).join(' ')}" fill="${fill}" stroke="${C.ink}" stroke-width="1"/>`;
      o += `<g class="a-pop" ${dl(d)}>${poly([up(a), up(b), up(c), up(e)], C.tl)}${poly([e, c, up(c), up(e)], C.t)}${poly([b, c, up(c), up(b)], '#1fbf9f')}</g>`;
    }
    if (label) o += T(160, 195, label, { fs: 16, c: C.d, d: maxD + 0.4 });
    return o;
  }
  // timbangan: tilt -1 kiri turun, 1 kanan turun, 0 seimbang
  function balance({ l, r, tilt = 0, d0 = 0.3 }) {
    const a = tilt * 10;
    return `<path d="M160 175L140 195H180Z" fill="${C.ink}"/><line x1="160" y1="80" x2="160" y2="178" stroke="${C.ink}" stroke-width="5"/>`
      + `<g class="a-rot" ${dl(d0, `--r:${a}deg;transform-origin:160px 80px`)}><line x1="50" y1="80" x2="270" y2="80" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="M50 80l-28 45h56zM270 80l-28 45h56z" fill="none" stroke="${C.ink}" stroke-width="1.5"/><rect x="12" y="125" width="76" height="10" rx="4" fill="${C.d}"/><rect x="232" y="125" width="76" height="10" rx="4" fill="${C.d}"/>`
      + `<text x="50" y="115" text-anchor="middle" font-size="${l.length > 6 ? 14 : 22}" font-weight="800">${l}</text><text x="270" y="115" text-anchor="middle" font-size="${r.length > 6 ? 14 : 22}" font-weight="800">${r}</text></g>`;
  }
  // diagram lingkaran: parts = [[nilai, label, warna]]
  function pie({ parts, d0 = 0.2 }) {
    const tot = parts.reduce((t, p) => t + p[0], 0); let acc = 0, o = '';
    parts.forEach(([v, lbl, c], i) => {
      const a1 = (acc / tot) * 2 * Math.PI - Math.PI / 2; acc += v; const a2 = (acc / tot) * 2 * Math.PI - Math.PI / 2, m = (a1 + a2) / 2;
      o += `<path d="M95 100L${95 + 70 * Math.cos(a1)} ${100 + 70 * Math.sin(a1)}A70 70 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${95 + 70 * Math.cos(a2)} ${100 + 70 * Math.sin(a2)}Z" fill="${c || [C.t, C.y, C.r, C.b, C.p][i % 5]}" stroke="#fff" stroke-width="2" class="a-pop" ${dl(d0 + i * 0.6)}/>`;
      o += `<rect x="190" y="${40 + i * 26}" width="14" height="14" rx="3" fill="${c || [C.t, C.y, C.r, C.b, C.p][i % 5]}" class="a-fade" ${dl(d0 + i * 0.6)}/>` + T(209, 52 + i * 26, lbl, { a: 'start', fs: 12, d: d0 + i * 0.6 });
    });
    return o;
  }
  // penggaris dengan pita yang memanjang
  function measure({ len, max = 10, e = '✏️', d0 = 0.3 }) {
    const u = 270 / max; let o = `<rect x="20" y="110" width="${max * u + 10}" height="44" rx="4" fill="#fff3c4" stroke="${C.ink}" stroke-width="2"/>`;
    for (let i = 0; i <= max * 2; i++) o += `<line x1="${25 + (i / 2) * u}" y1="110" x2="${25 + (i / 2) * u}" y2="${110 + (i % 2 ? 9 : 16)}" stroke="${C.ink}" stroke-width="1.5"/>` + (i % 2 ? '' : `<text x="${25 + (i / 2) * u}" y="140" text-anchor="middle" font-size="11" font-weight="700">${i / 2}</text>`);
    return o + `<rect x="25" y="72" width="${len * u}" height="22" rx="11" fill="${C.r}" class="a-growx" ${dl(d0)}/>` + emo(25 + len * u + 14, 83, e, d0 + 1.2) + `<line x1="${25 + len * u}" y1="94" x2="${25 + len * u}" y2="112" stroke="${C.r}" stroke-width="2" stroke-dasharray="3 3" class="a-fade" ${dl(d0 + 1)}/>` + T(160, 185, `${len} cm`, { fs: 20, c: C.d, d: d0 + 1.4 });
  }

  /* ---------- Naskah animasi per bab: [gambar, keterangan] ---------- */
  const S = (v, say) => ({ v, say });
  const A = {
    // Kelas 1
    A: [S(() => dots({ n: 7, e: '🍎', count: true }), 'Hitung satu per satu: satu, dua, tiga, … tujuh. Ada 7 apel.'),
      S(() => frame({ a: 7 }), 'Di bingkai sepuluh, 7 kotak terisi dan 3 kotak kosong. 7 dan 3 membuat 10.'),
      S(() => dots({ n: 7, y: 55 }) + dots({ n: 5, y: 115, c1: C.b, d0: 1.8 }) + T(160, 170, '7 > 5', { fs: 24, c: C.d, d: 3.2 }), 'Baris atas lebih banyak. 7 lebih dari 5, ditulis 7 > 5.')],
    B: [S(() => bond({ w: 7, a: 3, b: 4 }), '7 bisa dipecah menjadi 3 dan 4.'),
      S(() => bond({ w: 7, a: 5, b: 2 }), '7 juga bisa dipecah menjadi 5 dan 2. Ada banyak pasangan untuk 7!'),
      S(() => frame({ a: 6, b: 4 }) + T(160, 160, '6 + 4 = 10', { fs: 22, c: C.d, d: 2.8 }), 'Membuat 10: 6 dan 4 adalah pasangan 10.')],
    C: [S(() => dots({ n: 5, a: 3 }) + eq({ lines: ['3 + 2 = {5}'], y0: 150, d0: 1.6 }), '3 bola merah dan 2 bola kuning. Gabungkan lalu hitung semuanya: 5.'),
      S(() => line({ from: 0, to: 10, start: 4, hops: [1, 1, 1] }), '4 + 3: mulai di 4, lompat 3 kali ke kanan. Sampai di 7.'),
      S(() => bond({ w: '?', a: 4, b: 3 }) + T(160, 196, '4 + 3 = 7', { c: C.d, d: 2.4 }), 'Dua bagian 4 dan 3. Keseluruhannya 4 + 3 = 7.')],
    D: [S(() => dots({ n: 8, e: '🐦', cross: 3 }) + eq({ lines: ['8 − 3 = {5}'], y0: 150, d0: 3.4 }), '8 burung, 3 terbang. Coret 3, sisa 5. Jadi 8 − 3 = 5.'),
      S(() => line({ from: 0, to: 10, start: 9, hops: [-1, -1, -1, -1] }), '9 − 4: mulai di 9, lompat mundur 4 kali. Sampai di 5.'),
      S(() => bond({ w: 8, a: 3, b: '?' }) + T(160, 196, '8 − 3 = 5', { c: C.d, d: 2.4 }), 'Keseluruhan 8 dan satu bagian 3. Bagian lainnya 8 − 3 = 5.')],
    E: [S(() => frame({ a: 10, x: 20, s: 28 }) + frame({ a: 4, x: 165, s: 28, d0: 2.6 }) + T(160, 150, '14 = 1 puluhan + 4 satuan', { c: C.d, d: 3.8 }), 'Satu bingkai penuh = 1 puluhan. Ditambah 4 satuan menjadi 14.'),
      S(() => line({ from: 10, to: 20, mark: [17] }), 'Pada garis bilangan, 17 berada di antara 16 dan 18.'),
      S(() => line({ from: 10, to: 20, start: 12, hops: [2, 2, 2, 2] }), 'Pola: 12, 14, 16, 18, 20. Setiap kali bertambah 2.')],
    F: [S(() => frame({ a: 8, b: 2 }) + dots({ n: 3, y: 160, c1: C.y, d0: 2.8 }), '8 + 5: ambil 2 dari 5 untuk membuat 10. Sisa 3.'),
      S(() => eq({ lines: ['8 + 5', '= 8 + {2} + {3}', '= 10 + 3', '= {13}'] }), 'Membuat 10 dulu: 8 + 2 = 10, lalu 10 + 3 = 13.'),
      S(() => dots({ n: 6, y: 60 }) + dots({ n: 6, y: 100, c1: C.b, d0: 1.5 }) + eq({ lines: ['6 + 6 = 12, jadi 6 + 7 = {13}'], y0: 160, d0: 3, fs: 16 }), 'Dobel dan hampir dobel: 6 + 6 = 12, maka 6 + 7 satu lebih banyak, yaitu 13.'),
      S(() => line({ from: 5, to: 15, start: 14, hops: [-4, -2] }), '14 − 6: mundur 4 sampai 10, lalu mundur 2 lagi. Hasilnya 8.')],
    G: [S(() => place({ t: 3, o: 5, x: 100 }) + T(160, 130, '35 = 3 puluhan + 5 satuan', { c: C.d, d: 2.6 }), '35 terdiri dari 3 puluhan dan 5 satuan.'),
      S(() => line({ from: 0, to: 50, step: 10, start: 0, hops: [10, 10, 10, 10] }), 'Lompat hitung sepuluh-sepuluh: 10, 20, 30, 40.'),
      S(() => eq({ lines: ['47 dan 52', 'Bandingkan puluhan dulu:', '4 puluhan < 5 puluhan', 'Jadi {47 < 52}'] }), 'Membandingkan bilangan dua angka: lihat angka puluhan lebih dulu.')],
    H: [S(() => place({ t: 2, o: 4, x: 30 }) + place({ t: 3, o: 3, x: 175, d0: 1.6 }) + eq({ lines: ['24 + 33 = {57}'], y0: 160, d0: 3.4 }), '24 + 33: puluhan 2 + 3 = 5, satuan 4 + 3 = 7. Hasilnya 57.'),
      S(() => eq({ lines: ['38 + 5', 'satuan: 8 + 5 = 13', '13 = {1 puluhan} + 3', '30 + 10 + 3 = {43}'] }), '38 + 5: satuan menjadi 13, yaitu 1 puluhan dan 3 satuan. Hasilnya 43.')],
    I: [S(() => array({ r: 3, c: 4, e: '🍓', s: 34, y: 45, label: '4 + 4 + 4 = 12' }), '3 kelompok, masing-masing 4 stroberi. 4 + 4 + 4 = 12.'),
      S(() => groups({ n: 12, k: 3 }), '12 kue dibagi rata ke 3 piring. Setiap piring mendapat 4 kue.')],
    J: [S(() => measure({ len: 7 }), 'Pensil ini panjangnya 7 cm. Mulai mengukur dari angka 0.'),
      S(() => bar({ rows: [{ l: 'Merah', s: [[8, '', C.r]] }, { l: 'Biru', s: [[5, '', C.b]] }] }) + T(160, 180, 'Pita merah lebih panjang', { c: C.d, d: 2 }), 'Bandingkan dari ujung yang sama. Pita merah lebih panjang dari pita biru.'),
      S(() => balance({ l: '🍉', r: '🍎', tilt: -1 }), 'Semangka lebih berat, jadi timbangan turun di sisi semangka.')],
    K: [S(() => clock({ h: 3, m: 0 }), 'Jarum pendek di 3 dan jarum panjang di 12: pukul 3.00.'),
      S(() => clock({ h: 7, m: 30 }), 'Jarum panjang di 6 berarti setengah jam. Pukul 7.30 atau setengah delapan.')],
    L: [S(() => money({ items: [5000, 2000, 1000] }), 'Rp5.000 + Rp2.000 + Rp1.000 = Rp8.000.'),
      S(() => eq({ lines: ['Harga: Rp7.000', 'Uang: Rp10.000', 'Rp10.000 > Rp7.000 → {cukup}', 'Kembali: {Rp3.000}'] }), 'Apakah uangnya cukup? Bandingkan uang dengan harga, lalu hitung kembaliannya.')],
    M: [S(() => chart({ bars: [['🍎', 5], ['🍌', 3], ['🍊', 6]] }), 'Diagram: apel 5, pisang 3, jeruk 6. Jeruk paling banyak.'),
      S(() => eq({ lines: ['Jeruk 6, pisang 3', '6 − 3 = {3}', 'Jeruk 3 lebih banyak'] }), 'Membandingkan data: jeruk 3 lebih banyak dari pisang.')],
    N: [S(() => shape({ n: 3, label: 'Segitiga: 3 sisi, 3 sudut' }), 'Segitiga punya 3 sisi dan 3 sudut.'),
      S(() => shape({ n: 4, label: 'Segi empat: 4 sisi, 4 sudut' }), 'Segi empat punya 4 sisi dan 4 sudut.'),
      S(() => eq({ lines: ['🔺 🟦 🔺 🟦 🔺 [?]', 'Berikutnya: {🟦}'], fs: 22 }), 'Pola berulang: segitiga, persegi, segitiga, persegi … berikutnya persegi.')],
    O: [S(() => frac({ n: 2, k: 1, label: 'setengah = 1/2' }), 'Dibagi menjadi 2 bagian sama besar. Satu bagian disebut setengah (1/2).'),
      S(() => frac({ n: 4, k: 1, label: 'seperempat = 1/4' }), 'Dibagi menjadi 4 bagian sama besar. Satu bagian disebut seperempat (1/4).')],
    // Kelas 2
    '2A': [S(() => place({ h: 2, t: 4, o: 7, x: 40 }) + T(160, 130, '2 ratusan + 4 puluhan + 7 satuan', { fs: 14, c: C.d, d: 3.6 }), '247 terdiri dari 2 ratusan, 4 puluhan, dan 7 satuan.'),
      S(() => eq({ lines: ['247', '= 200 + 40 + 7', 'dua ratus empat puluh tujuh'], fs: 17 }), 'Bentuk panjang: 247 = 200 + 40 + 7.')],
    '2B': [S(() => balance({ l: '8 + 5', r: '10 + ?' }), 'Tanda sama dengan berarti kedua sisi sama berat (seimbang).'),
      S(() => eq({ lines: ['8 + 5 = 13', '10 + {3} = 13', 'Jadi ? = {3}'] }), '8 + 5 = 13, maka 10 + 3 juga harus 13.'),
      S(() => eq({ lines: ['Masuk 3 → +5 → {8}', 'Masuk 6 → +5 → {11}', 'Masuk 9 → +5 → {14}'], fs: 17 }), 'Tabel masukan dan keluaran: setiap bilangan ditambah 5.')],
    '2C': [S(() => eq({ lines: ['47 + 35', 'satuan: 7 + 5 = 12 → tulis 2, simpan [1]', 'puluhan: [1] + 4 + 3 = 8', '= {82}'], fs: 16 }), 'Menjumlah dengan menyimpan: satuan 12, tulis 2 dan simpan 1 ke puluhan.'),
      S(() => eq({ lines: ['36 + 9', '= 36 + {10} − [1]', '= 46 − 1 = {45}'] }), 'Strategi +9: tambah 10 lalu kurangi 1.')],
    '2D': [S(() => eq({ lines: ['52 − 27', '2 − 7? pinjam 1 puluhan', '12 − 7 = 5', '4 − 2 = 2', '= {25}'], fs: 16 }), 'Mengurangi dengan meminjam: 52 menjadi 4 puluhan dan 12 satuan.'),
      S(() => line({ from: 20, to: 60, step: 5, lab: 2, start: 27, hops: [3, 20, 2] }), 'Hitung maju dari 27: +3 ke 30, +20 ke 50, +2 ke 52. Selisihnya 3 + 20 + 2 = 25.')],
    '2E': [S(() => place({ h: 3, t: 2, o: 4, x: 30 }) + place({ h: 1, x: 250, d0: 2.6 }) + eq({ lines: ['324 + 100 = {424}'], y0: 160, d0: 3.4 }), '324 + 100: cukup tambah 1 ratusan. Hasilnya 424.'),
      S(() => eq({ lines: ['356 + 278', 'satuan 6 + 8 = 14 → simpan 1', 'puluhan 1 + 5 + 7 = 13 → simpan 1', 'ratusan 1 + 3 + 2 = 6', '= {634}'], fs: 15 }), 'Menjumlah tiga angka: kerjakan satuan, puluhan, lalu ratusan.')],
    '2F': [S(() => bar({ rows: [{ l: 'Ani', s: [[35, '35']] }, { l: 'Budi', s: [[35, '35'], [18, '18', C.y]] }], total: '?' }), 'Model batang: Budi punya 18 kelereng lebih banyak dari Ani. Budi = 35 + 18 = 53.'),
      S(() => bar({ rows: [{ l: 'Total', s: [[24, '24'], [36, '?', C.y]] }], total: '60' }), 'Keseluruhan 60, satu bagian 24. Bagian lain = 60 − 24 = 36.')],
    '2G': [S(() => array({ r: 3, c: 4, label: '3 × 4 = 12', s: 30, y: 45 }), '3 baris, masing-masing 4. Ditulis 3 × 4 = 12.'),
      S(() => eq({ lines: ['4 + 4 + 4', '= 3 × 4', '= {12}'] }), 'Penjumlahan berulang yang sama bisa ditulis sebagai perkalian.')],
    '2H': [S(() => groups({ n: 15, k: 3 }), '15 dibagi rata ke 3 kelompok. Setiap kelompok 5. Jadi 15 : 3 = 5.'),
      S(() => eq({ lines: ['3 × 5 = 15', '5 × 3 = 15', '15 : 3 = 5', '15 : 5 = 3'] }), 'Keluarga perkalian dan pembagian: empat kalimat dari 3, 5, dan 15.')],
    '2I': [S(() => frac({ n: 3, k: 1, x: 60, r: 40, label: '1/3' }) + frac({ n: 4, k: 1, x: 160, r: 40, label: '1/4', d0: 1 }) + frac({ n: 8, k: 1, x: 260, r: 40, label: '1/8', d0: 2 }), 'Semakin banyak bagiannya, semakin kecil setiap bagian: 1/3 > 1/4 > 1/8.'),
      S(() => frac({ n: 4, k: 4, shape: 'bar', label: '4/4 = 1 utuh' }), 'Empat perempat membuat satu utuh: 4/4 = 1.')],
    '2J': [S(() => measure({ len: 8, e: '🖍️' }), 'Krayon ini panjangnya 8 cm. Untuk benda kecil kita pakai cm.'),
      S(() => eq({ lines: ['100 cm = {1 m}', 'Pensil → cm', 'Panjang kelas → m'] }), '100 cm sama dengan 1 meter. Benda panjang diukur dengan meter.')],
    '2K': [S(() => balance({ l: '🎒', r: '1 kg' }), 'Tas ini seimbang dengan anak timbangan 1 kg, jadi beratnya 1 kg.'),
      S(() => eq({ lines: ['1 kg = {1.000 g}', 'Gula, beras → kg', 'Permen, kertas → g'] }), 'Benda berat memakai kg, benda ringan memakai gram.')],
    '2L': [S(() => clock({ h: 4, m: 25 }), 'Jarum panjang di angka 5: 5 × 5 = 25 menit. Pukul 4.25.'),
      S(() => eq({ lines: ['Pukul 2 siang', '= 12 + 2', '= pukul {14.00}'] }), 'Waktu 24 jam: setelah pukul 12 siang, tambahkan 12.')],
    '2M': [S(() => money({ items: [20000, 10000, 5000] }), 'Rp20.000 + Rp10.000 + Rp5.000 = Rp35.000.'),
      S(() => eq({ lines: ['Bayar Rp50.000', 'Harga Rp35.000', 'Kembalian:', 'Rp50.000 − Rp35.000 = {Rp15.000}'], fs: 16 }), 'Kembalian = uang yang dibayar dikurangi harga.')],
    '2N': [S(() => chart({ bars: [['Sen', 8], ['Sel', 4], ['Rab', 6], ['Kam', 10]] }), 'Diagram batang: Kamis paling banyak (10), Selasa paling sedikit (4).'),
      S(() => eq({ lines: ['Setiap 🙂 = 2 anak', '🙂🙂🙂 = {6 anak}'] }), 'Piktogram dengan skala: setiap gambar mewakili 2.')],
    '2O': [S(() => shape({ n: 5, label: 'Segi lima: 5 sisi, 5 titik sudut' }), 'Segi lima punya 5 sisi dan 5 titik sudut.'),
      S(() => grid({ w: 4, h: 3, label: 'Luas = 12 persegi satuan' }), 'Luas dihitung dengan persegi satuan: 12 persegi.')],
    '2P': [S(() => line({ from: 40, to: 50, start: 47, hops: [3] }), '47 lebih dekat ke 50 daripada ke 40. Dibulatkan menjadi 50.'),
      S(() => eq({ lines: ['312 + 489', '≈ 300 + 500', '= {800}'] }), 'Perkiraan: bulatkan dulu ke ratusan terdekat, lalu jumlahkan.')],
    // Kelas 3
    '3A': [S(() => eq({ lines: ['4.352', '= 4.000 + 300 + 50 + 2', '4 ribuan, 3 ratusan, 5 puluhan, 2 satuan'], fs: 15 }), 'Nilai angka pada 4.352: angka 4 bernilai 4.000.'),
      S(() => eq({ lines: ['4.352 dan 4.325', 'ribuan sama, ratusan sama', 'puluhan: 5 > 2', 'Jadi {4.352 > 4.325}'], fs: 16 }), 'Membandingkan: mulai dari tempat yang paling besar.')],
    '3B': [S(() => line({ from: 360, to: 370, start: 368, hops: [2] }), '368 dibulatkan ke puluhan terdekat menjadi 370.'),
      S(() => line({ from: 300, to: 400, step: 10, lab: 5, mark: [368] }) + T(160, 60, '368 → 400 (ratusan terdekat)', { c: C.d, d: 1.6 }), 'Ke ratusan terdekat: 368 lebih dekat ke 400 daripada ke 300.')],
    '3C': [S(() => eq({ lines: ['2.468 + 1.375', '8 + 5 = 13 → simpan 1', '1 + 6 + 7 = 14 → simpan 1', '1 + 4 + 3 = 8, lalu 2 + 1 = 3', '= {3.843}'], fs: 15 }), 'Menjumlah bersusun: dari satuan ke ribuan, simpan jika lebih dari 9.')],
    '3D': [S(() => array({ r: 4, c: 3, s: 28, y: 35, label: '4 × 3 = 12' }), '4 baris berisi 3: 4 × 3 = 12.'),
      S(() => array({ r: 3, c: 4, s: 28, y: 35, label: '3 × 4 = 12' }), 'Diputar menjadi 3 baris berisi 4: hasilnya tetap 12. Urutan perkalian boleh ditukar.'),
      S(() => array({ r: 7, c: 6, s: 18, y: 25, split: 5, label: '5 × 6 + 2 × 6 = 30 + 12 = 42' }), 'Memecah perkalian: 7 × 6 = 5 × 6 + 2 × 6 = 42.')],
    '3E': [S(() => array({ r: 6, c: 7, s: 19, y: 30, label: '6 × 7 = 42' }), '6 baris berisi 7 sama dengan 42.'),
      S(() => eq({ lines: ['? × 8 = 56', 'Pikirkan: 56 : 8', '= {7}'] }), 'Faktor yang hilang dicari dengan pembagian.')],
    '3F': [S(() => groups({ n: 14, k: 4 }), '14 dibagi rata ke 4 kelompok: masing-masing 3, sisa 2. 14 : 4 = 3 sisa 2.'),
      S(() => eq({ lines: ['14 : 4', '4 × 3 = 12', '14 − 12 = [2]', '= 3 sisa [2]'] }), 'Sisa selalu lebih kecil dari pembagi.')],
    '3G': [S(() => areaModel({ a: [20, 3], b: [3] }) + T(185, 180, '60 + 9 = 69', { c: C.d, d: 2 }), '23 × 3 = (20 × 3) + (3 × 3) = 60 + 9 = 69.'),
      S(() => eq({ lines: ['84 : 4', '8 puluhan : 4 = 2 puluhan', '4 satuan : 4 = 1', '= {21}'] }), 'Pembagian bersusun: bagi puluhan dulu, lalu satuan.')],
    '3H': [S(() => bar({ rows: [{ l: 'Adi', s: [[1, '12']] }, { l: 'Bayu', s: [[1, '12'], [1, '12'], [1, '12']] }], unit: 60 }) + T(160, 175, '3 × 12 = 36', { fs: 20, c: C.d, d: 2.8 }), 'Bayu punya 3 kali kelereng Adi. Satu unit = 12, jadi 3 unit = 36.'),
      S(() => eq({ lines: ['? + 245 = 600', '? = 600 − 245', '= {355}'] }), 'Bilangan yang hilang: gunakan operasi kebalikannya.')],
    '3I': [S(() => frac({ n: 4, k: 3, shape: 'bar', label: '3/4' }), 'Dibagi 4 bagian sama, 3 bagian diarsir: tiga perempat (3/4).'),
      S(() => line({ from: 0, to: 1, step: 0.25, den: 4, start: 0, hops: [0.25, 0.25, 0.25] }), 'Pada garis bilangan, 0 sampai 1 dibagi 4. Tiga lompatan seperempat sampai di 3/4.'),
      S(() => frac({ n: 2, k: 1, shape: 'bar', y: 60, label: '' }) + frac({ n: 4, k: 2, shape: 'bar', y: 120, d0: 1 }) + T(160, 175, '1/2 = 2/4', { fs: 20, c: C.d, d: 2 }), 'Pecahan senilai: 1/2 dan 2/4 menutupi bagian yang sama.')],
    '3J': [S(() => frac({ n: 5, k: 2, shape: 'bar', y: 60 }) + frac({ n: 5, k: 3, shape: 'bar', y: 120, d0: 1, c: C.y }) + T(160, 175, '2/5 < 3/5', { fs: 20, c: C.d, d: 2.4 }), 'Penyebut sama: bandingkan pembilangnya. 2/5 < 3/5.'),
      S(() => eq({ lines: ['2/5 + 1/5', '= (2 + 1)/5', '= {3/5}'] }), 'Menjumlah pecahan berpenyebut sama: jumlahkan pembilangnya saja.')],
    '3K': [S(() => grid({ w: 5, h: 3, label: 'Luas = 5 × 3 = 15 persegi satuan' }), 'Luas persegi panjang = panjang × lebar = 15 persegi satuan.'),
      S(() => grid({ w: 5, h: 3, mode: 'perim', label: 'Keliling = 5 + 3 + 5 + 3 = 16' }), 'Keliling adalah panjang tepi di sekelilingnya: 16 satuan.')],
    '3L': [S(() => angle({ deg: 90, label: 'Sudut siku-siku' }), 'Sudut siku-siku seperti pojok buku: tepat 90°.'),
      S(() => shape({ pts: [[80, 50], [240, 50], [240, 140], [80, 140]], label: 'Persegi panjang: sisi berhadapan sejajar' }), 'Persegi panjang punya 4 sudut siku-siku dan sisi berhadapan yang sejajar.')],
    '3M': [S(() => clock({ h: 9, m: 47 }), 'Jarum panjang 2 garis setelah angka 9: 45 + 2 = 47 menit. Pukul 9.47.'),
      S(() => eq({ lines: ['1 jam = {60 menit}', '1 menit = {60 detik}', '2 jam = 120 menit'] }), 'Hubungan satuan waktu.')],
    '3N': [S(() => eq({ lines: ['1 km = 1.000 m', '1 m = 100 cm', '2 kg 300 g = {2.300 g}'] }), 'Mengubah satuan: ubah ke satuan yang lebih kecil lalu jumlahkan.')],
    '3O': [S(() => chart({ bars: [['A', 20], ['B', 35], ['C', 15], ['D', 30]] }), 'Diagram batang dengan skala 5: baca puncak batang pada sumbu.'),
      S(() => eq({ lines: ['B − C', '= 35 − 15', '= {20}'] }), 'Selisih dua batang = nilai besar dikurangi nilai kecil.')],
    '3P': [S(() => money({ items: [10000, 5000, 2000, 500] }), 'Total uang: Rp17.500.'),
      S(() => eq({ lines: ['3 buku × Rp4.500', '= {Rp13.500}', 'Kembalian dari Rp20.000', '= {Rp6.500}'], fs: 16 }), 'Harga beberapa barang lalu hitung kembaliannya.')],
    // Kelas 4
    '4A': [S(() => eq({ lines: ['352.418', '3 ratus ribuan, 5 puluh ribuan,', '2 ribuan, 4 ratusan, 1 puluhan, 8 satuan'], fs: 15 }), 'Nilai tempat bilangan besar dibaca per tiga angka.'),
      S(() => line({ from: 350000, to: 360000, step: 1000, lab: 5, mark: [352418] }) + T(160, 60, '352.418 ≈ 350.000', { c: C.d, d: 1.6 }), 'Dibulatkan ke puluh ribuan terdekat: 350.000.')],
    '4B': [S(() => eq({ lines: ['45.678 + 23.456', 'satuan → puluhan → ratusan', '→ ribuan → puluh ribuan', '= {69.134}'], fs: 16 }), 'Menjumlah bilangan lima angka dengan cara bersusun.')],
    '4C': [S(() => array({ r: 3, c: 4, s: 22, y: 40, label: '3 × 4' }), 'Persegi panjang dari 12 benda: 3 × 4 …'),
      S(() => array({ r: 2, c: 6, s: 22, y: 50, label: '2 × 6 dan 1 × 12' }), '… juga 2 × 6 dan 1 × 12. Faktor 12: 1, 2, 3, 4, 6, 12.'),
      S(() => line({ from: 0, to: 24, step: 4, start: 0, hops: [4, 4, 4, 4, 4, 4] }), 'Kelipatan 4: 4, 8, 12, 16, 20, 24 …')],
    '4D': [S(() => areaModel({ a: [20, 3], b: [10, 4] }) + T(185, 190, '200 + 30 + 80 + 12 = 322', { fs: 14, c: C.d, d: 3 }), 'Model luas: 23 × 14 = 200 + 30 + 80 + 12 = 322.'),
      S(() => eq({ lines: ['45 × 10 = 450', '45 × 100 = 4.500', '45 × 1.000 = {45.000}'] }), 'Kali 10, 100, 1.000: tambahkan nol sebanyak nol pengalinya.')],
    '4E': [S(() => eq({ lines: ['157 : 4', '15 : 4 = 3, sisa 3', '37 : 4 = 9, sisa 1', '= {39 sisa 1}'] }), 'Pembagian bersusun: bagi, kalikan, kurangi, turunkan.')],
    '4F': [S(() => eq({ lines: ['8 + 6 × 2', '= 8 + {12}', '= 20'] }), 'Urutan operasi: kali dan bagi dikerjakan lebih dulu.'),
      S(() => eq({ lines: ['(8 + 6) × 2', '= {14} × 2', '= 28'] }), 'Yang di dalam kurung dikerjakan paling dulu.')],
    '4G': [S(() => line({ from: 0, to: 20, start: 3, hops: [4, 4, 4], lab: 2 }), 'Pola: 3, 7, 11, 15 … setiap suku bertambah 4.'),
      S(() => eq({ lines: ['suku ke-1 = 3', 'suku ke-n = 4 × n − 1', 'suku ke-10 = {39}'] }), 'Aturan pola membantu mencari suku yang jauh.')],
    '4H': [S(() => frac({ n: 3, k: 2, shape: 'bar', y: 60 }) + frac({ n: 6, k: 4, shape: 'bar', y: 120, d0: 1 }) + T(160, 175, '2/3 = 4/6', { fs: 20, c: C.d, d: 2.6 }), 'Pecahan senilai: kalikan pembilang dan penyebut dengan bilangan yang sama.'),
      S(() => frac({ n: 4, k: 4, x: 90, r: 45 }) + frac({ n: 4, k: 3, x: 220, r: 45, d0: 1.6 }) + T(160, 180, '7/4 = 1 3/4', { fs: 20, c: C.d, d: 3.2 }), 'Tujuh perempat = satu utuh dan tiga perempat.')],
    '4I': [S(() => groups({ n: 12, k: 4, e: '🍬' }) + T(160, 196, '3/4 dari 12 = 9', { c: C.d, d: 4 }), '12 permen dibagi 4 kelompok (3 per kelompok). 3 kelompok = 9.'),
      S(() => eq({ lines: ['1/4 + 3/8', '= 2/8 + 3/8', '= {5/8}'] }), 'Samakan penyebut dulu, lalu jumlahkan pembilangnya.')],
    '4J': [S(() => grid({ w: 10, h: 10, s: 14, color: (i, j) => (j < 3 || (j === 3 && i < 5) ? C.t : '#fff'), label: '35 dari 100 = 0,35' }), '35 kotak dari 100 diarsir: 35/100 = 0,35.'),
      S(() => eq({ lines: ['0,35', '= 3 persepuluhan + 5 perseratusan', '= {35/100}'], fs: 16 }), 'Nilai tempat desimal: persepuluhan dan perseratusan.')],
    '4K': [S(() => chart({ bars: [['Jan', 20], ['Feb', 28], ['Mar', 24], ['Apr', 32]], kind: 'line' }), 'Diagram garis menunjukkan perubahan dari waktu ke waktu.'),
      S(() => eq({ lines: ['3, 5, {7}, 8, 9', 'median = nilai tengah = {7}', 'jangkauan = 9 − 3 = 6'] }), 'Urutkan data dulu; median adalah nilai di tengah.')],
    '4L': [S(() => clock({ h: 2, m: 30 }) + T(160, 196, 'pukul 2.30 siang = 14.30', { c: C.d, d: 1.8 }), 'Pukul 2.30 siang dalam format 24 jam adalah 14.30.'),
      S(() => eq({ lines: ['3 m 25 cm', '= 300 cm + 25 cm', '= {325 cm}'] }), 'Mengubah satuan panjang ke satuan yang lebih kecil.')],
    '4M': [S(() => grid({ w: 6, h: 4, skip: (i, j) => i >= 3 && j < 2, label: 'Luas = 12 + 6 = 18' }), 'Bangun gabungan: pecah menjadi dua persegi panjang, lalu jumlahkan luasnya.'),
      S(() => eq({ lines: ['Luas = 36 cm²', 'sisi = ?', '6 × 6 = 36 → sisi = {6 cm}'] }), 'Mencari sisi dari luas persegi.')],
    '4N': [S(() => angle({ deg: 45, label: 'Lancip (< 90°)' }), 'Sudut lancip lebih kecil dari 90°.'),
      S(() => angle({ deg: 130, label: 'Tumpul (> 90°)' }), 'Sudut tumpul lebih besar dari 90° tetapi kurang dari 180°.')],
    '4O': [S(() => shape({ pts: [[160, 30], [90, 150], [230, 150]], label: 'Segitiga sama kaki: dua sisi sama' }), 'Segitiga sama kaki punya dua sisi yang sama panjang.'),
      S(() => shape({ n: 4, r: 60 }) + `<line x1="160" y1="20" x2="160" y2="165" stroke="${C.r}" stroke-width="3" stroke-dasharray="6 5" pathLength="1" class="a-draw" ${dl(2.6)}/>` + T(160, 192, 'Sumbu simetri', { c: C.r, d: 3 }), 'Sumbu simetri membagi bangun menjadi dua bagian yang sama persis.')],
    '4P': [S(() => eq({ lines: ['3 buah Rp12.000 → 1 buah Rp4.000', '5 buah Rp18.000 → 1 buah {Rp3.600}', 'Yang kedua lebih murah'], fs: 15 }), 'Harga satuan: bagi harga dengan banyaknya barang lalu bandingkan.')],
    // Kelas 5
    '5A': [S(() => eq({ lines: ['10³ = 10 × 10 × 10', '= {1.000}', '10⁶ = 1.000.000'] }), 'Pangkat sepuluh: banyaknya nol sama dengan pangkatnya.')],
    '5B': [S(() => areaModel({ a: [100, 20, 4], b: [20, 3] }) + T(185, 190, '124 × 23 = 2.852', { c: C.d, d: 4.2 }), '124 × 23 dipecah menjadi bagian-bagian kecil, lalu dijumlahkan.')],
    '5C': [S(() => eq({ lines: ['Faktor 12: 1, 2, 3, 4, {6}, 12', 'Faktor 18: 1, 2, 3, {6}, 9, 18', 'FPB = {6}'], fs: 16 }), 'FPB: faktor yang sama dan paling besar.'),
      S(() => eq({ lines: ['Kelipatan 4: 4, 8, {12}, 16 …', 'Kelipatan 6: 6, {12}, 18 …', 'KPK = {12}'], fs: 16 }), 'KPK: kelipatan yang sama dan paling kecil.')],
    '5D': [S(() => eq({ lines: ['(6 + 4) × 3 − 5', '= {10} × 3 − 5', '= {30} − 5', '= 25'] }), 'Kurung dulu, lalu kali/bagi, terakhir tambah/kurang.'),
      S(() => eq({ lines: ['n = 4', '3n + 2', '= 3 × 4 + 2 = {14}'] }), 'Nilai ekspresi: ganti huruf dengan bilangannya.')],
    '5E': [S(() => frac({ n: 2, k: 1, shape: 'bar', y: 45, w: 180 }) + frac({ n: 3, k: 1, shape: 'bar', y: 95, w: 180, c: C.y, d0: 0.8 }) + frac({ n: 6, k: 5, shape: 'bar', y: 150, w: 180, d0: 1.8 }), '1/2 + 1/3: ubah menjadi perenam. 3/6 + 2/6 = 5/6.'),
      S(() => eq({ lines: ['1/2 + 1/3', '= {3/6} + {2/6}', '= 5/6'] }), 'Samakan penyebut dengan KPK dari 2 dan 3, yaitu 6.')],
    '5F': [S(() => grid({ w: 4, h: 3, s: 34, color: (i, j) => (i < 3 && j < 2 ? C.p : i < 3 ? C.y : j < 2 ? C.b : '#fff'), label: '2/3 × 3/4 = 6/12 = 1/2' }), 'Model luas: 3/4 kolom dan 2/3 baris. Bagian yang bertumpuk = 6/12 = 1/2.'),
      S(() => eq({ lines: ['3 : 1/4', '= ada berapa 1/4 dalam 3?', '= 3 × 4 = {12}'] }), 'Membagi dengan pecahan satuan: berapa banyak potongan kecil dalam bilangan itu?')],
    '5G': [S(() => eq({ lines: ['3,452', '3 satuan, 4 persepuluhan,', '5 perseratusan, 2 perseribuan'], fs: 16 }), 'Nilai tempat desimal sampai perseribuan.'),
      S(() => line({ from: 0.2, to: 0.3, step: 0.01, lab: 5, mark: [0.25] }), '0,25 berada tepat di tengah antara 0,2 dan 0,3.')],
    '5H': [S(() => eq({ lines: ['2,75 + 1,6', '= 2,75 + {1,60}', '= {4,35}'] }), 'Menjumlah desimal: sejajarkan tanda komanya.'),
      S(() => eq({ lines: ['3,14 × 10 = 31,4', '3,14 × 100 = 314', 'koma bergeser ke kanan'], fs: 17 }), 'Kali 10 menggeser koma satu tempat ke kanan; kali 100 dua tempat.')],
    '5I': [S(() => bar({ rows: [{ l: 'Putra', s: [[1, ''], [1, ''], [1, '']] }, { l: 'Putri', s: [[1, '', C.y], [1, '', C.y]] }], unit: 60 }) + T(160, 180, 'Rasio 3 : 2', { fs: 20, c: C.d, d: 3.2 }), 'Rasio putra dan putri 3 : 2 digambar sebagai 3 unit dan 2 unit.'),
      S(() => eq({ lines: ['5 unit = 30 anak', '1 unit = 6', 'Putra = 3 × 6 = {18}'] }), 'Cari nilai satu unit, lalu kalikan.')],
    '5J': [S(() => grid({ w: 10, h: 10, s: 14, color: (i, j) => (j < 2 || (j === 2 && i < 5) ? C.r : '#fff'), label: '25% = 25/100 = 1/4' }), '25 dari 100 kotak: 25 persen, sama dengan seperempat.'),
      S(() => eq({ lines: ['Diskon 20% dari Rp50.000', '20/100 × 50.000 = Rp10.000', 'Bayar {Rp40.000}'], fs: 16 }), 'Diskon: hitung potongannya, lalu kurangkan dari harga.')],
    '5K': [S(() => coord({ pts: [[3, 4]] }), 'Titik (3, 4): bergerak 3 ke kanan, lalu 4 ke atas.')],
    '5L': [S(() => cubes({ l: 3, w: 2, h: 2, label: '3 × 2 × 2 = 12 kubus satuan' }), 'Volume balok: satu lapis 3 × 2 = 6 kubus, ada 2 lapis. Jadi 12 kubus satuan.')],
    '5M': [S(() => shape({ pts: [[70, 160], [250, 160], [180, 40]] }) + eq({ lines: ['a + b + c = {180°}'], y0: 196, d0: 2.6, fs: 16 }), 'Jumlah ketiga sudut dalam segitiga selalu 180°.'),
      S(() => grid({ w: 6, h: 4, s: 28, color: (i, j) => (j >= (4 * i) / 6 ? C.t : '#fff'), label: 'Luas segitiga = 1/2 × 6 × 4 = 12' }), 'Luas segitiga adalah setengah dari luas persegi panjangnya.')],
    '5N': [S(() => chart({ bars: [['A', 4], ['B', 6], ['C', 8]] }), 'Data 4, 6, dan 8.'),
      S(() => chart({ bars: [['A', 6], ['B', 6], ['C', 6]], max: 8 }) + T(185, 30, 'rata-rata = (4 + 6 + 8) : 3 = 6', { fs: 13, c: C.d, d: 1.6 }), 'Rata-rata: jika semua dibuat sama tinggi, setiap batang menjadi 6.')],
    '5O': [S(() => eq({ lines: ['1,5 km = {1.500 m}', '2,4 kg = {2.400 g}', '3 liter = 3.000 ml'] }), 'Mengubah satuan dengan desimal: kalikan 1.000.'),
      S(() => eq({ lines: ['4 kg Rp60.000', '1 kg = 60.000 : 4', '= {Rp15.000}'] }), 'Laju: harga per satu satuan.')],
    // Kelas 6
    '6A': [S(() => grid({ w: 4, h: 4, s: 30, label: '4² = 4 × 4 = 16' }), '4 kuadrat: persegi berisi 4 × 4 = 16 kotak. Akar 16 adalah 4.'),
      S(() => cubes({ l: 2, w: 2, h: 2, label: '2³ = 2 × 2 × 2 = 8' }), '2 pangkat tiga: kubus 2 × 2 × 2 = 8.')],
    '6B': [S(() => eq({ lines: ['60', '= 2 × 30', '= 2 × 2 × 15', '= 2 × 2 × 3 × 5', '= {2² × 3 × 5}'], fs: 17 }), 'Faktorisasi prima: terus bagi dengan bilangan prima sampai semuanya prima.')],
    '6C': [S(() => frac({ n: 8, k: 6, shape: 'bar', label: 'ada 6 bagian 1/8' }), 'Berapa banyak 1/8 dalam 3/4? 3/4 = 6/8, jadi ada 6.'),
      S(() => eq({ lines: ['3/4 : 1/8', '= 3/4 × {8/1}', '= 24/4 = {6}'] }), 'Membagi pecahan: kalikan dengan kebalikannya.')],
    '6D': [S(() => line({ from: -6, to: 6, start: 2, hops: [-5] }), '2 + (−5): mulai di 2, mundur 5. Hasilnya −3.'),
      S(() => eq({ lines: ['(−3) × 4 = {−12}', '(−3) × (−4) = {12}', 'tanda sama → positif'] }), 'Perkalian bilangan bulat: tanda sama hasilnya positif, berbeda hasilnya negatif.')],
    '6E': [S(() => coord({ pts: [[-3, 2, C.r], [4, -1, C.b]], four: true }), 'Empat kuadran: (−3, 2) ke kiri 3 lalu naik 2; (4, −1) ke kanan 4 lalu turun 1.')],
    '6F': [S(() => eq({ lines: ['2 buku → Rp10.000', '4 buku → Rp20.000', '6 buku → {Rp30.000}'] }), 'Tabel rasio senilai: jika jumlah dikali 2, harganya juga dikali 2.'),
      S(() => eq({ lines: ['jarak = kecepatan × waktu', '60 km/jam × 2 jam', '= {120 km}'] }), 'Kecepatan, jarak, dan waktu.')],
    '6G': [S(() => eq({ lines: ['15 dari 60 = ? %', '15/60 = 1/4', '= {25%}'] }), 'Mencari persen: ubah menjadi pecahan, lalu ke perseratus.'),
      S(() => eq({ lines: ['Harga Rp200.000', 'Pajak 10% = Rp20.000', 'Total {Rp220.000}'] }), 'Pajak menambah harga; diskon mengurangi harga.')],
    '6H': [S(() => eq({ lines: ['{a} + {a} + {a} + b + b', '= {3a} + 2b'] }), 'Menggabungkan suku sejenis: a dengan a, b dengan b.'),
      S(() => eq({ lines: ['3(x + 2)', '= 3 × x + 3 × 2', '= {3x + 6}'] }), 'Sifat distributif: kalikan setiap suku di dalam kurung.')],
    '6I': [S(() => balance({ l: 'x + 3', r: '8' }), 'Persamaan seperti timbangan seimbang: x + 3 = 8.'),
      S(() => eq({ lines: ['x + 3 = 8', 'x + 3 [− 3] = 8 [− 3]', 'x = {5}'] }), 'Kurangi 3 di kedua sisi agar tetap seimbang. x = 5.')],
    '6J': [S(() => angle({ deg: 130, label: '130° + 50° = 180°' }), 'Dua sudut pada garis lurus jumlahnya 180°.'),
      S(() => eq({ lines: ['Keliling = 2 × π × r', 'Luas = π × r × r', 'r = 7 → luas = 22/7 × 49 = {154}'], fs: 16 }), 'Rumus keliling dan luas lingkaran.')],
    '6K': [S(() => shape({ pts: [[70, 150], [210, 150], [250, 60], [110, 60]], label: 'Luas jajargenjang = alas × tinggi' }), 'Jajargenjang bisa dipotong dan dipindah menjadi persegi panjang.'),
      S(() => cubes({ l: 2, w: 2, h: 2, label: 'Luas permukaan kubus = 6 × sisi²' }), 'Kubus punya 6 sisi berbentuk persegi.')],
    '6L': [S(() => pie({ parts: [[50, 'Sepak bola 50%'], [25, 'Renang 25%'], [25, 'Bulu tangkis 25%']] }), 'Diagram lingkaran: setengah lingkaran berarti 50%.'),
      S(() => eq({ lines: ['2, 4, 4, 5, 10', 'mean = 25 : 5 = {5}', 'median = {4}, modus = {4}'], fs: 16 }), 'Mean, median, dan modus dari data yang sama.')],
    '6M': [S(() => frac({ n: 6, k: 1, label: 'Peluang 6 pada dadu = 1/6' }), 'Dadu punya 6 sisi yang sama mungkin. Peluang muncul angka 6 adalah 1/6.'),
      S(() => eq({ lines: ['Pasti: matahari terbit', 'Mungkin: hujan besok', 'Mustahil: dadu muncul 7'], fs: 16 }), 'Peluang dari mustahil (0) sampai pasti (1).')],
    '6N': [S(() => eq({ lines: ['Tabungan Rp1.000.000', 'Bunga 6% per tahun', '= {Rp60.000} setahun'], fs: 17 }), 'Bunga tabungan: persen dari uang yang ditabung.'),
      S(() => eq({ lines: ['Modal Rp40.000', 'Jual Rp50.000', 'Untung = {Rp10.000}'] }), 'Untung = harga jual − modal.')],
  };

  /* ---------- Pemutar ---------- */
  // Satu pemutar aktif dalam satu waktu; mengembalikan fungsi untuk menghentikannya
  let active = null;
  function mount(el, unitId) {
    const scenes = A[unitId]; if (!el || !scenes) return null;
    if (active) active();
    let i = 0, timer = null, playing = true;
    el.innerHTML = `<div class="an-stage"><svg viewBox="0 0 320 200" class="an-svg" role="img" aria-label="Animasi"></svg></div><p class="an-say"></p>
      <div class="an-ctrl"><button class="an-btn" data-an="toggle" aria-label="Jeda">⏸</button><div class="an-dots">${scenes.map((_, k) => `<button data-an="go" data-k="${k}" aria-label="Langkah ${k + 1}"></button>`).join('')}</div><button class="an-btn" data-an="replay" aria-label="Ulangi">↻</button></div>`;
    const svg = el.querySelector('svg'), say = el.querySelector('.an-say'), tbtn = el.querySelector('[data-an=toggle]');
    const show = (k) => {
      clearTimeout(timer); i = k; maxD = 0;
      svg.innerHTML = scenes[i].v(); say.textContent = scenes[i].say;
      svg.classList.toggle('paused', !playing);
      el.querySelectorAll('.an-dots button').forEach((b, n) => b.classList.toggle('on', n === i));
      if (playing && window.SFX && window.SFX.step) window.SFX.step();
      const dur = Math.max(3.5, maxD + 2.6 + scenes[i].say.length / 60);
      if (playing) timer = setTimeout(() => show((i + 1) % scenes.length), dur * 1000 + (i === scenes.length - 1 ? 1200 : 0));
    };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-an]'); if (!b) return;
      if (b.dataset.an === 'toggle') { playing = !playing; tbtn.textContent = playing ? '⏸' : '▶'; tbtn.setAttribute('aria-label', playing ? 'Jeda' : 'Putar'); if (playing) show(i); else { clearTimeout(timer); svg.classList.add('paused'); } }
      if (b.dataset.an === 'replay') { playing = true; tbtn.textContent = '⏸'; show(0); }
      if (b.dataset.an === 'go') show(+b.dataset.k);
    });
    show(0);
    const stop = () => { clearTimeout(timer); if (active === stop) active = null; };
    active = stop;
    return stop;
  }
  window.METIQ_ANIM = { has: (id) => !!A[id], mount, stop: () => active && active(), _scripts: A };
})();
