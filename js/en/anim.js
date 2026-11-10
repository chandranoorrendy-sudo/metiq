/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — animasi singkat (seperti GIF) untuk setiap bab. Tanpa suara.
 * Setiap animasi terdiri dari beberapa adegan SVG yang bergerak dengan CSS, diberi keterangan di bawahnya, lalu berulang.
 */
(function () {
  const C = { t: '#2fd9b4', tl: '#66ffdb', d: '#00806b', r: '#ff7a59', y: '#f9c74f', b: '#4d96ff', p: '#fd79a8', g: '#2ecc71', ink: '#16302b', l: '#cfe3de', w: '#fff' };
  const f = (n) => { const r = Math.round(n * 1000) / 1000; return (r < 0 ? '−' : '') + String(Math.abs(r)); };
  const big = (n) => Number(n).toLocaleString('en-US');
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
  // Penjumlahan bersusun, dikerjakan dari satuan ke kiri: kolom yang sedang dihitung disorot, catatan langkahnya muncul
  // di samping (mis. "8 + 5 = 13 / tulis 3, simpan 1"), angka simpanan muncul di atas kolom berikutnya,
  // dan angka hasil muncul satu per satu dari kanan.
  function stack({ a, b, d0 = 0.5, step = 2 }) {
    const A = String(a), B = String(b), R = String(a + b), n = R.length, cw = 28, xr = 150, X = (k) => xr - k * cw;
    const dig = (s, k) => s[s.length - 1 - k];
    const yC = 42, yA = 78, yB = 112, yL = 124, yR = 158, fs = 26, xn = 196;
    const note = (y, s, t, c = C.ink) => `<text x="${xn}" y="${y}" font-size="13" font-weight="800" fill="${c}" class="a-note" ${dl(t, `animation-duration:${step}s`)}>${s}</text>`;
    let bg = '', o = '', carry = 0;
    for (let k = 0; k < A.length; k++) o += T(X(k), yA, dig(A, k), { fs, d: d0 });
    for (let k = 0; k < B.length; k++) o += T(X(k), yB, dig(B, k), { fs, d: d0 + 0.2 });
    o += T(X(n - 1) - cw * 0.9, yB, '+', { fs, d: d0 + 0.2 });
    o += `<path d="M${Math.max(6, X(n - 1) - cw * 1.4)} ${yL}H${xr + cw * 0.6}" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" pathLength="1" class="a-draw" ${dl(d0 + 0.4)}/>`;
    for (let k = 0; k < n; k++) {
      const t = d0 + 1.2 + k * step, ha = dig(A, k) !== undefined, hb = dig(B, k) !== undefined, s = (ha ? +dig(A, k) : 0) + (hb ? +dig(B, k) : 0) + carry;
      const parts = [carry ? '1' : null, ha ? dig(A, k) : null, hb ? dig(B, k) : null].filter((x) => x !== null);
      bg += `<rect x="${X(k) - cw / 2 + 1}" y="${yC - 18}" width="${cw - 2}" height="${yR - yC + 28}" rx="9" fill="${C.tl}" class="a-flash" ${dl(t, `animation-duration:${step}s`)}/>`;
      if (parts.length > 1) o += note(yA, `${parts.join(' + ')} = ${s}`, t);
      o += note(yA + 22, s >= 10 ? `write ${s % 10}, carry 1` : `write ${s}`, t, C.d);
      if (s >= 10) o += T(X(k + 1), yC, '1', { fs: 16, c: C.r, cls: 'a-pop', d: t + 0.7 });
      o += T(X(k), yR, s % 10, { fs, c: C.d, cls: 'a-pop', d: t + 0.9 });
      carry = s >= 10 ? 1 : 0;
    }
    o += T(xn, yR, '= ' + big(a + b), { a: 'start', fs: 18, c: C.d, cls: 'a-pop', d: d0 + 1.4 + n * step });
    return bg + o;
  }
  // Pengurangan bersusun dengan meminjam, dari satuan ke kiri. Jika angka atas lebih kecil, angka di kolom kiri dicoret
  // dan angka barunya ditulis merah di atasnya (kolom 0 yang dilewati menjadi 9), kolom ini menjadi 10 lebih besar,
  // catatan langkah muncul di samping, lalu angka hasil muncul satu per satu dari kanan.
  function stackSub({ a, b, d0 = 0.5, step = 2.3 }) {
    const A = String(a), B = String(b), R = String(a - b), n = A.length, cw = 28, xr = 150, X = (k) => xr - k * cw;
    const top = [...A].reverse().map(Number), bot = [...B].reverse().map(Number);
    const yA = 86, yB = 120, yL = 132, yR = 164, fs = 26, xn = 196, times = Array(n).fill(0);
    const note = (y, s, t, c = C.ink, dur = step) => `<text x="${xn}" y="${y}" font-size="13" font-weight="800" fill="${c}" class="a-note" ${dl(t, `animation-duration:${dur}s`)}>${s}</text>`;
    const strike = (x, y, h, t) => `<path d="M${x - h * 0.45} ${y + 2}L${x + h * 0.45} ${y - h * 0.75}" stroke="${C.r}" stroke-width="3" stroke-linecap="round" pathLength="1" class="a-draw" ${dl(t)}/>`;
    let bg = '', o = '';
    // angka atas kolom k diganti v: angka lama dicoret, angka baru ditulis merah di atasnya
    const change = (k, v, t) => {
      const y = yA - 30 - times[k] * 18;
      o += times[k] ? strike(X(k), y + 18, 15, t) : strike(X(k), yA, fs, t);
      o += T(X(k), y, v, { fs: 15, c: C.r, cls: 'a-pop', d: t + 0.25 });
      times[k]++;
    };
    for (let k = 0; k < n; k++) o += T(X(k), yA, top[k], { fs, d: d0 });
    for (let k = 0; k < bot.length; k++) o += T(X(k), yB, bot[k], { fs, d: d0 + 0.2 });
    o += T(X(n - 1) - cw * 0.9, yB, '−', { fs, d: d0 + 0.2 });
    o += `<path d="M${Math.max(6, X(n - 1) - cw * 1.4)} ${yL}H${xr + cw * 0.6}" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" pathLength="1" class="a-draw" ${dl(d0 + 0.4)}/>`;
    for (let k = 0; k < n; k++) {
      const t = d0 + 1.2 + k * step, hb = k < bot.length, v = hb ? bot[k] : 0;
      bg += `<rect x="${X(k) - cw / 2 + 1}" y="${yA - 66}" width="${cw - 2}" height="${yR - yA + 76}" rx="9" fill="${C.tl}" class="a-flash" ${dl(t, `animation-duration:${step}s`)}/>`;
      if (top[k] < v) {
        let j = k + 1; while (top[j] === 0) j++;
        const was = top[k];
        change(j, top[j] - 1, t + 0.3); top[j] -= 1;
        for (let m = j - 1; m > k; m--) { change(m, 9, t + 0.6); top[m] = 9; }
        top[k] += 10; change(k, top[k], t + 0.9);
        o += note(yA - 10, `${was} − ${v}? borrow 1`, t) + note(yA + 12, `${top[k]} − ${v} = ${top[k] - v}`, t + 0.9, C.d, step - 0.9);
      } else {
        if (hb) o += note(yA - 10, `${top[k]} − ${v} = ${top[k] - v}`, t);
        o += note(yA + 12, `write ${top[k] - v}`, t, C.d);
      }
      if (k < R.length) o += T(X(k), yR, top[k] - v, { fs, c: C.d, cls: 'a-pop', d: t + 1.3 });
    }
    o += T(xn, yR, '= ' + big(a - b), { a: 'start', fs: 18, c: C.d, cls: 'a-pop', d: d0 + 1.4 + n * step });
    return bg + o;
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
    A: [S(() => dots({ n: 7, e: '🍎', count: true }), 'Count one by one: one, two, three, … seven. There are 7 apples.'),
      S(() => frame({ a: 7 }), 'On the ten frame, 7 boxes are filled and 3 are empty. 7 and 3 make 10.'),
      S(() => dots({ n: 7, y: 55 }) + dots({ n: 5, y: 115, c1: C.b, d0: 1.8 }) + T(160, 170, '7 > 5', { fs: 24, c: C.d, d: 3.2 }), 'The top row has more. 7 is greater than 5, written 7 > 5.')],
    B: [S(() => bond({ w: 7, a: 3, b: 4 }), '7 can be split into 3 and 4.'),
      S(() => bond({ w: 7, a: 5, b: 2 }), '7 can also be split into 5 and 2. There are many pairs for 7!'),
      S(() => frame({ a: 6, b: 4 }) + T(160, 160, '6 + 4 = 10', { fs: 22, c: C.d, d: 2.8 }), 'Making 10: 6 and 4 are a pair of 10.')],
    C: [S(() => dots({ n: 5, a: 3 }) + eq({ lines: ['3 + 2 = {5}'], y0: 150, d0: 1.6 }), '3 red balls and 2 yellow balls. Combine them and count them all: 5.'),
      S(() => line({ from: 0, to: 10, start: 4, hops: [1, 1, 1] }), '4 + 3: start at 4, jump 3 times to the right. You land on 7.'),
      S(() => bond({ w: '?', a: 4, b: 3 }) + T(160, 196, '4 + 3 = 7', { c: C.d, d: 2.4 }), 'Two parts, 4 and 3. The whole is 4 + 3 = 7.')],
    D: [S(() => dots({ n: 8, e: '🐦', cross: 3 }) + eq({ lines: ['8 − 3 = {5}'], y0: 150, d0: 3.4 }), '8 birds, 3 fly away. Cross out 3, leaving 5. So 8 − 3 = 5.'),
      S(() => line({ from: 0, to: 10, start: 9, hops: [-1, -1, -1, -1] }), '9 − 4: start at 9, jump back 4 times. You land on 5.'),
      S(() => bond({ w: 8, a: 3, b: '?' }) + T(160, 196, '8 − 3 = 5', { c: C.d, d: 2.4 }), 'The whole is 8 and one part is 3. The other part is 8 − 3 = 5.')],
    E: [S(() => frame({ a: 10, x: 20, s: 28 }) + frame({ a: 4, x: 165, s: 28, d0: 2.6 }) + T(160, 150, '14 = 1 ten + 4 ones', { c: C.d, d: 3.8 }), 'One full frame = 1 ten. Plus 4 ones makes 14.'),
      S(() => line({ from: 10, to: 20, mark: [17] }), 'On the number line, 17 is between 16 and 18.'),
      S(() => line({ from: 10, to: 20, start: 12, hops: [2, 2, 2, 2] }), 'Pattern: 12, 14, 16, 18, 20. It goes up by 2 each time.')],
    F: [S(() => frame({ a: 8, b: 2 }) + dots({ n: 3, y: 160, c1: C.y, d0: 2.8 }), '8 + 5: take 2 from 5 to make 10. 3 is left.'),
      S(() => eq({ lines: ['8 + 5', '= 8 + {2} + {3}', '= 10 + 3', '= {13}'] }), 'Make 10 first: 8 + 2 = 10, then 10 + 3 = 13.'),
      S(() => dots({ n: 6, y: 60 }) + dots({ n: 6, y: 100, c1: C.b, d0: 1.5 }) + eq({ lines: ['6 + 6 = 12, so 6 + 7 = {13}'], y0: 160, d0: 3, fs: 16 }), 'Doubles and near doubles: 6 + 6 = 12, so 6 + 7 is one more, which is 13.'),
      S(() => line({ from: 5, to: 15, start: 14, hops: [-4, -2] }), '14 − 6: back 4 to 10, then back 2 more. The result is 8.')],
    G: [S(() => place({ t: 3, o: 5, x: 100 }) + T(160, 130, '35 = 3 tens + 5 ones', { c: C.d, d: 2.6 }), '35 is made of 3 tens and 5 ones.'),
      S(() => line({ from: 0, to: 50, step: 10, start: 0, hops: [10, 10, 10, 10] }), 'Skip count by tens: 10, 20, 30, 40.'),
      S(() => eq({ lines: ['47 and 52', 'Compare the tens first:', '4 tens < 5 tens', 'So {47 < 52}'] }), 'Comparing two-digit numbers: look at the tens digit first.')],
    H: [S(() => place({ t: 2, o: 4, x: 30 }) + place({ t: 3, o: 3, x: 175, d0: 1.6 }) + eq({ lines: ['24 + 33 = {57}'], y0: 160, d0: 3.4 }), '24 + 33: tens 2 + 3 = 5, ones 4 + 3 = 7. The result is 57.'),
      S(() => eq({ lines: ['38 + 5', 'ones: 8 + 5 = 13', '13 = {1 ten} + 3', '30 + 10 + 3 = {43}'] }), '38 + 5: the ones become 13, which is 1 ten and 3 ones. The result is 43.')],
    I: [S(() => array({ r: 3, c: 4, e: '🍓', s: 34, y: 45, label: '4 + 4 + 4 = 12' }), '3 groups of 4 strawberries. 4 + 4 + 4 = 12.'),
      S(() => groups({ n: 12, k: 3 }), '12 cakes are shared equally on 3 plates. Each plate gets 4 cakes.')],
    J: [S(() => measure({ len: 7 }), 'This pencil is 7 cm long. Start measuring from 0.'),
      S(() => bar({ rows: [{ l: 'Red', s: [[8, '', C.r]] }, { l: 'Blue', s: [[5, '', C.b]] }] }) + T(160, 180, 'The red ribbon is longer', { c: C.d, d: 2 }), 'Compare from the same end. The red ribbon is longer than the blue ribbon.'),
      S(() => balance({ l: '🍉', r: '🍎', tilt: -1 }), 'The watermelon is heavier, so the scale goes down on its side.')],
    K: [S(() => clock({ h: 3, m: 0 }), 'Short hand at 3 and long hand at 12: 3:00.'),
      S(() => clock({ h: 7, m: 30 }), 'The long hand at 6 means half an hour. 7:30 or half past seven.')],
    L: [S(() => money({ items: [5000, 2000, 1000] }), 'Rp5,000 + Rp2,000 + Rp1,000 = Rp8,000.'),
      S(() => eq({ lines: ['Price: Rp7,000', 'Money: Rp10,000', 'Rp10,000 > Rp7,000 → {enough}', 'Change: {Rp3,000}'] }), 'Is the money enough? Compare the money with the price, then calculate the change.')],
    M: [S(() => chart({ bars: [['🍎', 5], ['🍌', 3], ['🍊', 6]] }), 'Chart: apples 5, bananas 3, oranges 6. Oranges are the most.'),
      S(() => eq({ lines: ['Oranges 6, bananas 3', '6 − 3 = {3}', '3 more oranges'] }), 'Comparing data: there are 3 more oranges than bananas.')],
    N: [S(() => shape({ n: 3, label: 'Triangle: 3 sides, 3 corners' }), 'A triangle has 3 sides and 3 corners.'),
      S(() => shape({ n: 4, label: 'Quadrilateral: 4 sides, 4 corners' }), 'A quadrilateral has 4 sides and 4 corners.'),
      S(() => eq({ lines: ['🔺 🟦 🔺 🟦 🔺 [?]', 'Next: {🟦}'], fs: 22 }), 'A repeating pattern: triangle, square, triangle, square … next is square.')],
    O: [S(() => frac({ n: 2, k: 1, label: 'one half = 1/2' }), 'Divided into 2 equal parts. One part is called one half (1/2).'),
      S(() => frac({ n: 4, k: 1, label: 'one quarter = 1/4' }), 'Divided into 4 equal parts. One part is called one quarter (1/4).')],
    // Kelas 2
    '2A': [S(() => place({ h: 2, t: 4, o: 7, x: 40 }) + T(160, 130, '2 hundreds + 4 tens + 7 ones', { fs: 14, c: C.d, d: 3.6 }), '247 is made of 2 hundreds, 4 tens, and 7 ones.'),
      S(() => eq({ lines: ['247', '= 200 + 40 + 7', 'two hundred forty-seven'], fs: 17 }), 'Expanded form: 247 = 200 + 40 + 7.')],
    '2B': [S(() => balance({ l: '8 + 5', r: '10 + ?' }), 'The equal sign means both sides are balanced.'),
      S(() => eq({ lines: ['8 + 5 = 13', '10 + {3} = 13', 'So ? = {3}'] }), '8 + 5 = 13, so 10 + 3 must also be 13.'),
      S(() => eq({ lines: ['In 3 → +5 → {8}', 'In 6 → +5 → {11}', 'In 9 → +5 → {14}'], fs: 17 }), 'Input and output table: each number has 5 added.')],
    '2C': [S(() => stack({ a: 47, b: 35 }), 'Adding with regrouping: the ones make 12, so write 2 and carry 1 to the tens.'),
      S(() => eq({ lines: ['36 + 9', '= 36 + {10} − [1]', '= 46 − 1 = {45}'] }), 'The +9 strategy: add 10, then subtract 1.')],
    '2D': [S(() => stackSub({ a: 52, b: 27 }), 'Subtracting with borrowing: 52 becomes 4 tens and 12 ones.'),
      S(() => line({ from: 20, to: 60, step: 5, lab: 2, start: 27, hops: [3, 20, 2] }), 'Count up from 27: +3 to 30, +20 to 50, +2 to 52. The difference is 3 + 20 + 2 = 25.')],
    '2E': [S(() => place({ h: 3, t: 2, o: 4, x: 30 }) + place({ h: 1, x: 250, d0: 2.6 }) + eq({ lines: ['324 + 100 = {424}'], y0: 160, d0: 3.4 }), '324 + 100: just add 1 hundred. The result is 424.'),
      S(() => stack({ a: 356, b: 278 }), 'Adding three digits: do the ones, then the tens, then the hundreds.'),
      S(() => stackSub({ a: 523, b: 175 }), 'Subtracting three digits: borrow from the tens, then from the hundreds, when the top digit is smaller.')],
    '2F': [S(() => bar({ rows: [{ l: 'Ani', s: [[35, '35']] }, { l: 'Budi', s: [[35, '35'], [18, '18', C.y]] }], total: '?' }), 'Bar model: Budi has 18 more marbles than Ani. Budi = 35 + 18 = 53.'),
      S(() => bar({ rows: [{ l: 'Total', s: [[24, '24'], [36, '?', C.y]] }], total: '60' }), 'The whole is 60 and one part is 24. The other part = 60 − 24 = 36.')],
    '2G': [S(() => array({ r: 3, c: 4, label: '3 × 4 = 12', s: 30, y: 45 }), '3 rows of 4. Written 3 × 4 = 12.'),
      S(() => eq({ lines: ['4 + 4 + 4', '= 3 × 4', '= {12}'] }), 'The same repeated addition can be written as multiplication.')],
    '2H': [S(() => groups({ n: 15, k: 3 }), '15 is shared equally into 3 groups. Each group has 5. So 15 ÷ 3 = 5.'),
      S(() => eq({ lines: ['3 × 5 = 15', '5 × 3 = 15', '15 : 3 = 5', '15 : 5 = 3'] }), 'Multiplication and division family: four sentences from 3, 5, and 15.')],
    '2I': [S(() => frac({ n: 3, k: 1, x: 60, r: 40, label: '1/3' }) + frac({ n: 4, k: 1, x: 160, r: 40, label: '1/4', d0: 1 }) + frac({ n: 8, k: 1, x: 260, r: 40, label: '1/8', d0: 2 }), 'The more parts, the smaller each part: 1/3 > 1/4 > 1/8.'),
      S(() => frac({ n: 4, k: 4, shape: 'bar', label: '4/4 = 1 whole' }), 'Four quarters make one whole: 4/4 = 1.')],
    '2J': [S(() => measure({ len: 8, e: '🖍️' }), 'This crayon is 8 cm long. We use cm for small things.'),
      S(() => eq({ lines: ['100 cm = {1 m}', 'Pencil → cm', 'Classroom length → m'] }), '100 cm equals 1 meter. Long things are measured in meters.')],
    '2K': [S(() => balance({ l: '🎒', r: '1 kg' }), 'This bag balances the 1 kg weight, so it weighs 1 kg.'),
      S(() => eq({ lines: ['1 kg = {1,000 g}', 'Sugar, rice → kg', 'Candy, paper → g'] }), 'Heavy things use kg, light things use grams.')],
    '2L': [S(() => clock({ h: 4, m: 25 }), 'The long hand at 5: 5 × 5 = 25 minutes. It\'s 4:25.'),
      S(() => eq({ lines: ['2 in the afternoon', '= 12 + 2', '= {14:00}'] }), '24-hour time: after 12 noon, add 12.')],
    '2M': [S(() => money({ items: [20000, 10000, 5000] }), 'Rp20,000 + Rp10,000 + Rp5,000 = Rp35,000.'),
      S(() => eq({ lines: ['Paid Rp50,000', 'Price Rp35,000', 'Change:', 'Rp50,000 − Rp35,000 = {Rp15,000}'], fs: 16 }), 'Change = money paid minus price.')],
    '2N': [S(() => chart({ bars: [['Mon', 8], ['Tue', 4], ['Wed', 6], ['Thu', 10]] }), 'Bar chart: Thursday has the most (10), Tuesday the fewest (4).'),
      S(() => eq({ lines: ['Each 🙂 = 2 children', '🙂🙂🙂 = {6 children}'] }), 'Pictograph with a scale: each picture stands for 2.')],
    '2O': [S(() => shape({ n: 5, label: 'Pentagon: 5 sides, 5 vertices' }), 'A pentagon has 5 sides and 5 vertices.'),
      S(() => grid({ w: 4, h: 3, label: 'Area = 12 unit squares' }), 'Area is counted in unit squares: 12 squares.')],
    '2P': [S(() => line({ from: 40, to: 50, start: 47, hops: [3] }), '47 is closer to 50 than to 40. It rounds to 50.'),
      S(() => eq({ lines: ['312 + 489', '≈ 300 + 500', '= {800}'] }), 'Estimating: round to the nearest hundred first, then add.')],
    // Kelas 3
    '3A': [S(() => eq({ lines: ['4.352', '= 4.000 + 300 + 50 + 2', '4 thousands, 3 hundreds, 5 tens, 2 ones'], fs: 15 }), 'Digit value in 4,352: the digit 4 is worth 4,000.'),
      S(() => eq({ lines: ['4,352 and 4,325', 'same thousands, same hundreds', 'tens: 5 > 2', 'So {4,352 > 4,325}'], fs: 16 }), 'Comparing: start from the largest place.')],
    '3B': [S(() => line({ from: 360, to: 370, start: 368, hops: [2] }), '368 rounded to the nearest ten is 370.'),
      S(() => line({ from: 300, to: 400, step: 10, lab: 5, mark: [368] }) + T(160, 60, '368 → 400 (nearest hundred)', { c: C.d, d: 1.6 }), 'To the nearest hundred: 368 is closer to 400 than to 300.')],
    '3C': [S(() => stack({ a: 2468, b: 1375 }), 'Column addition: from the ones to the thousands, carrying when more than 9.'),
      S(() => stackSub({ a: 5302, b: 1758 }), 'Borrowing across a 0: borrow from the hundreds first, the 0 tens become 9, and the ones become 12.')],
    '3D': [S(() => array({ r: 4, c: 3, s: 28, y: 35, label: '4 × 3 = 12' }), '4 rows of 3: 4 × 3 = 12.'),
      S(() => array({ r: 3, c: 4, s: 28, y: 35, label: '3 × 4 = 12' }), 'Rotated to 3 rows of 4: still 12. The order of multiplication can be swapped.'),
      S(() => array({ r: 7, c: 6, s: 18, y: 25, split: 5, label: '5 × 6 + 2 × 6 = 30 + 12 = 42' }), 'Breaking apart multiplication: 7 × 6 = 5 × 6 + 2 × 6 = 42.')],
    '3E': [S(() => array({ r: 6, c: 7, s: 19, y: 30, label: '6 × 7 = 42' }), '6 rows of 7 is 42.'),
      S(() => eq({ lines: ['? × 8 = 56', 'Think: 56 ÷ 8', '= {7}'] }), 'A missing factor is found with division.')],
    '3F': [S(() => groups({ n: 14, k: 4 }), '14 shared into 4 groups: 3 each, with 2 left. 14 ÷ 4 = 3 remainder 2.'),
      S(() => eq({ lines: ['14 : 4', '4 × 3 = 12', '14 − 12 = [2]', '= 3 remainder [2]'] }), 'A remainder is always smaller than the divisor.')],
    '3G': [S(() => areaModel({ a: [20, 3], b: [3] }) + T(185, 180, '60 + 9 = 69', { c: C.d, d: 2 }), '23 × 3 = (20 × 3) + (3 × 3) = 60 + 9 = 69.'),
      S(() => eq({ lines: ['84 : 4', '8 tens ÷ 4 = 2 tens', '4 ones ÷ 4 = 1', '= {21}'] }), 'Long division: divide the tens first, then the ones.')],
    '3H': [S(() => bar({ rows: [{ l: 'Adi', s: [[1, '12']] }, { l: 'Bayu', s: [[1, '12'], [1, '12'], [1, '12']] }], unit: 60 }) + T(160, 175, '3 × 12 = 36', { fs: 20, c: C.d, d: 2.8 }), 'Bayu has 3 times as many marbles as Adi. One unit = 12, so 3 units = 36.'),
      S(() => eq({ lines: ['? + 245 = 600', '? = 600 − 245', '= {355}'] }), 'Missing numbers: use the inverse operation.')],
    '3I': [S(() => frac({ n: 4, k: 3, shape: 'bar', label: '3/4' }), 'Divided into 4 equal parts, 3 shaded: three quarters (3/4).'),
      S(() => line({ from: 0, to: 1, step: 0.25, den: 4, start: 0, hops: [0.25, 0.25, 0.25] }), 'On the number line, 0 to 1 is divided into 4. Three quarter-jumps land on 3/4.'),
      S(() => frac({ n: 2, k: 1, shape: 'bar', y: 60, label: '' }) + frac({ n: 4, k: 2, shape: 'bar', y: 120, d0: 1 }) + T(160, 175, '1/2 = 2/4', { fs: 20, c: C.d, d: 2 }), 'Equivalent fractions: 1/2 and 2/4 cover the same part.')],
    '3J': [S(() => frac({ n: 5, k: 2, shape: 'bar', y: 60 }) + frac({ n: 5, k: 3, shape: 'bar', y: 120, d0: 1, c: C.y }) + T(160, 175, '2/5 < 3/5', { fs: 20, c: C.d, d: 2.4 }), 'Same denominators: compare the numerators. 2/5 < 3/5.'),
      S(() => eq({ lines: ['2/5 + 1/5', '= (2 + 1)/5', '= {3/5}'] }), 'Adding fractions with the same denominator: add only the numerators.')],
    '3K': [S(() => grid({ w: 5, h: 3, label: 'Area = 5 × 3 = 15 unit squares' }), 'Area of a rectangle = length × width = 15 unit squares.'),
      S(() => grid({ w: 5, h: 3, mode: 'perim', label: 'Perimeter = 5 + 3 + 5 + 3 = 16' }), 'Perimeter is the length of the edge around it: 16 units.')],
    '3L': [S(() => angle({ deg: 90, label: 'Right angle' }), 'A right angle is like the corner of a book: exactly 90°.'),
      S(() => shape({ pts: [[80, 50], [240, 50], [240, 140], [80, 140]], label: 'Rectangle: opposite sides are parallel' }), 'A rectangle has 4 right angles and parallel opposite sides.')],
    '3M': [S(() => clock({ h: 9, m: 47 }), 'The long hand 2 marks past the 9: 45 + 2 = 47 minutes. It\'s 9:47.'),
      S(() => eq({ lines: ['1 hour = {60 minutes}', '1 minute = {60 seconds}', '2 hours = 120 minutes'] }), 'Relating units of time.')],
    '3N': [S(() => eq({ lines: ['1 km = 1,000 m', '1 m = 100 cm', '2 kg 300 g = {2,300 g}'] }), 'Converting units: change to the smaller unit, then add.')],
    '3O': [S(() => chart({ bars: [['A', 20], ['B', 35], ['C', 15], ['D', 30]] }), 'Bar chart with a scale of 5: read the top of the bar on the axis.'),
      S(() => eq({ lines: ['B − C', '= 35 − 15', '= {20}'] }), 'Difference of two bars = larger value minus smaller value.')],
    '3P': [S(() => money({ items: [10000, 5000, 2000, 500] }), 'Total money: Rp17,500.'),
      S(() => eq({ lines: ['3 books × Rp4,500', '= {Rp13,500}', 'Change from Rp20,000', '= {Rp6,500}'], fs: 16 }), 'The price of several items, then the change.')],
    // Kelas 4
    '4A': [S(() => eq({ lines: ['352.418', '3 hundred thousands, 5 ten thousands,', '2 thousands, 4 hundreds, 1 ten, 8 ones'], fs: 15 }), 'Place values of large numbers are read in groups of three digits.'),
      S(() => line({ from: 350000, to: 360000, step: 1000, lab: 5, mark: [352418] }) + T(160, 60, '352.418 ≈ 350.000', { c: C.d, d: 1.6 }), 'Rounded to the nearest ten thousand: 350,000.')],
    '4B': [S(() => stack({ a: 45678, b: 23456, step: 1.7 }), 'Adding five-digit numbers in columns.')],
    '4C': [S(() => array({ r: 3, c: 4, s: 22, y: 40, label: '3 × 4' }), 'Rectangles from 12 objects: 3 × 4 …'),
      S(() => array({ r: 2, c: 6, s: 22, y: 50, label: '2 × 6 and 1 × 12' }), '… also 2 × 6 and 1 × 12. Factors of 12: 1, 2, 3, 4, 6, 12.'),
      S(() => line({ from: 0, to: 24, step: 4, start: 0, hops: [4, 4, 4, 4, 4, 4] }), 'Multiples of 4: 4, 8, 12, 16, 20, 24 …')],
    '4D': [S(() => areaModel({ a: [20, 3], b: [10, 4] }) + T(185, 190, '200 + 30 + 80 + 12 = 322', { fs: 14, c: C.d, d: 3 }), 'Area model: 23 × 14 = 200 + 30 + 80 + 12 = 322.'),
      S(() => eq({ lines: ['45 × 10 = 450', '45 × 100 = 4.500', '45 × 1.000 = {45.000}'] }), 'Times 10, 100, 1,000: add as many zeros as the multiplier has.')],
    '4E': [S(() => eq({ lines: ['157 : 4', '15 ÷ 4 = 3, remainder 3', '37 ÷ 4 = 9, remainder 1', '= {39 remainder 1}'] }), 'Long division: divide, multiply, subtract, bring down.')],
    '4F': [S(() => eq({ lines: ['8 + 6 × 2', '= 8 + {12}', '= 20'] }), 'Order of operations: multiplication and division come first.'),
      S(() => eq({ lines: ['(8 + 6) × 2', '= {14} × 2', '= 28'] }), 'What\'s inside parentheses comes first of all.')],
    '4G': [S(() => line({ from: 0, to: 20, start: 3, hops: [4, 4, 4], lab: 2 }), 'Pattern: 3, 7, 11, 15 … each term goes up by 4.'),
      S(() => eq({ lines: ['term 1 = 3', 'term n = 4 × n − 1', 'term 10 = {39}'] }), 'A pattern\'s rule helps find far-off terms.')],
    '4H': [S(() => frac({ n: 3, k: 2, shape: 'bar', y: 60 }) + frac({ n: 6, k: 4, shape: 'bar', y: 120, d0: 1 }) + T(160, 175, '2/3 = 4/6', { fs: 20, c: C.d, d: 2.6 }), 'Equivalent fractions: multiply the numerator and denominator by the same number.'),
      S(() => frac({ n: 4, k: 4, x: 90, r: 45 }) + frac({ n: 4, k: 3, x: 220, r: 45, d0: 1.6 }) + T(160, 180, '7/4 = 1 3/4', { fs: 20, c: C.d, d: 3.2 }), 'Seven quarters = one whole and three quarters.')],
    '4I': [S(() => groups({ n: 12, k: 4, e: '🍬' }) + T(160, 196, '3/4 of 12 = 9', { c: C.d, d: 4 }), '12 candies divided into 4 groups (3 per group). 3 groups = 9.'),
      S(() => eq({ lines: ['1/4 + 3/8', '= 2/8 + 3/8', '= {5/8}'] }), 'Make the denominators equal first, then add the numerators.')],
    '4J': [S(() => grid({ w: 10, h: 10, s: 14, color: (i, j) => (j < 3 || (j === 3 && i < 5) ? C.t : '#fff'), label: '35 of 100 = 0.35' }), '35 of 100 boxes are shaded: 35/100 = 0.35.'),
      S(() => eq({ lines: ['0.35', '= 3 tenths + 5 hundredths', '= {35/100}'], fs: 16 }), 'Decimal place values: tenths and hundredths.')],
    '4K': [S(() => chart({ bars: [['Jan', 20], ['Feb', 28], ['Mar', 24], ['Apr', 32]], kind: 'line' }), 'A line graph shows change over time.'),
      S(() => eq({ lines: ['3, 5, {7}, 8, 9', 'median = middle value = {7}', 'range = 9 − 3 = 6'] }), 'Order the data first; the median is the value in the middle.')],
    '4L': [S(() => clock({ h: 2, m: 30 }) + T(160, 196, '2:30 in the afternoon = 14:30', { c: C.d, d: 1.8 }), '2:30 in the afternoon in 24-hour format is 14:30.'),
      S(() => eq({ lines: ['3 m 25 cm', '= 300 cm + 25 cm', '= {325 cm}'] }), 'Converting length units to a smaller unit.')],
    '4M': [S(() => grid({ w: 6, h: 4, skip: (i, j) => i >= 3 && j < 2, label: 'Area = 12 + 6 = 18' }), 'Composite shapes: split into two rectangles, then add their areas.'),
      S(() => eq({ lines: ['Area = 36 cm²', 'side = ?', '6 × 6 = 36 → side = {6 cm}'] }), 'Finding the side from a square\'s area.')],
    '4N': [S(() => angle({ deg: 45, label: 'Acute (< 90°)' }), 'An acute angle is smaller than 90°.'),
      S(() => angle({ deg: 130, label: 'Obtuse (> 90°)' }), 'An obtuse angle is larger than 90° but less than 180°.')],
    '4O': [S(() => shape({ pts: [[160, 30], [90, 150], [230, 150]], label: 'Isosceles triangle: two equal sides' }), 'An isosceles triangle has two equal sides.'),
      S(() => shape({ n: 4, r: 60 }) + `<line x1="160" y1="20" x2="160" y2="165" stroke="${C.r}" stroke-width="3" stroke-dasharray="6 5" pathLength="1" class="a-draw" ${dl(2.6)}/>` + T(160, 192, 'Axis of symmetry', { c: C.r, d: 3 }), 'A line of symmetry divides a shape into two exactly matching parts.')],
    '4P': [S(() => eq({ lines: ['3 items Rp12,000 → 1 item Rp4,000', '5 items Rp18,000 → 1 item {Rp3,600}', 'The second is cheaper'], fs: 15 }), 'Unit price: divide the price by the number of items, then compare.')],
    // Kelas 5
    '5A': [S(() => eq({ lines: ['10³ = 10 × 10 × 10', '= {1.000}', '10⁶ = 1.000.000'] }), 'Powers of ten: the number of zeros equals the exponent.')],
    '5B': [S(() => areaModel({ a: [100, 20, 4], b: [20, 3] }) + T(185, 190, '124 × 23 = 2.852', { c: C.d, d: 4.2 }), '124 × 23 is split into small parts, then added.')],
    '5C': [S(() => eq({ lines: ['Factors of 12: 1, 2, 3, 4, {6}, 12', 'Factors of 18: 1, 2, 3, {6}, 9, 18', 'GCF = {6}'], fs: 16 }), 'GCF: the largest factor in common.'),
      S(() => eq({ lines: ['Multiples of 4: 4, 8, {12}, 16 …', 'Multiples of 6: 6, {12}, 18 …', 'LCM = {12}'], fs: 16 }), 'LCM: the smallest multiple in common.')],
    '5D': [S(() => eq({ lines: ['(6 + 4) × 3 − 5', '= {10} × 3 − 5', '= {30} − 5', '= 25'] }), 'Parentheses first, then multiply/divide, finally add/subtract.'),
      S(() => eq({ lines: ['n = 4', '3n + 2', '= 3 × 4 + 2 = {14}'] }), 'Value of an expression: replace letters with their numbers.')],
    '5E': [S(() => frac({ n: 2, k: 1, shape: 'bar', y: 45, w: 180 }) + frac({ n: 3, k: 1, shape: 'bar', y: 95, w: 180, c: C.y, d0: 0.8 }) + frac({ n: 6, k: 5, shape: 'bar', y: 150, w: 180, d0: 1.8 }), '1/2 + 1/3: change to sixths. 3/6 + 2/6 = 5/6.'),
      S(() => eq({ lines: ['1/2 + 1/3', '= {3/6} + {2/6}', '= 5/6'] }), 'Make the denominators equal with the LCM of 2 and 3, which is 6.')],
    '5F': [S(() => grid({ w: 4, h: 3, s: 34, color: (i, j) => (i < 3 && j < 2 ? C.p : i < 3 ? C.y : j < 2 ? C.b : '#fff'), label: '2/3 × 3/4 = 6/12 = 1/2' }), 'Area model: 3/4 of the columns and 2/3 of the rows. The overlap = 6/12 = 1/2.'),
      S(() => eq({ lines: ['3 : 1/4', '= how many 1/4s are in 3?', '= 3 × 4 = {12}'] }), 'Dividing by a unit fraction: how many small pieces are in the number?')],
    '5G': [S(() => eq({ lines: ['3.452', '3 ones, 4 tenths,', '5 hundredths, 2 thousandths'], fs: 16 }), 'Decimal place values to the thousandths.'),
      S(() => line({ from: 0.2, to: 0.3, step: 0.01, lab: 5, mark: [0.25] }), '0.25 is exactly halfway between 0.2 and 0.3.')],
    '5H': [S(() => eq({ lines: ['2,75 + 1,6', '= 2,75 + {1,60}', '= {4,35}'] }), 'Adding decimals: line up the decimal points.'),
      S(() => eq({ lines: ['3,14 × 10 = 31,4', '3,14 × 100 = 314', 'the point moves right'], fs: 17 }), 'Times 10 moves the point one place right; times 100 moves it two places.')],
    '5I': [S(() => bar({ rows: [{ l: 'Boys', s: [[1, ''], [1, ''], [1, '']] }, { l: 'Girls', s: [[1, '', C.y], [1, '', C.y]] }], unit: 60 }) + T(160, 180, 'Ratio 3 : 2', { fs: 20, c: C.d, d: 3.2 }), 'The ratio of boys to girls 3 : 2 is drawn as 3 units and 2 units.'),
      S(() => eq({ lines: ['5 units = 30 children', '1 unit = 6', 'Boys = 3 × 6 = {18}'] }), 'Find the value of one unit, then multiply.')],
    '5J': [S(() => grid({ w: 10, h: 10, s: 14, color: (i, j) => (j < 2 || (j === 2 && i < 5) ? C.r : '#fff'), label: '25% = 25/100 = 1/4' }), '25 of 100 boxes: 25 percent, the same as one quarter.'),
      S(() => eq({ lines: ['20% off Rp50,000', '20/100 × 50,000 = Rp10,000', 'Pay {Rp40,000}'], fs: 16 }), 'Discount: find the amount off, then subtract it from the price.')],
    '5K': [S(() => coord({ pts: [[3, 4]] }), 'Point (3, 4): move 3 right, then 4 up.')],
    '5L': [S(() => cubes({ l: 3, w: 2, h: 2, label: '3 × 2 × 2 = 12 unit cubes' }), 'Volume of a cuboid: one layer of 3 × 2 = 6 cubes, and there are 2 layers. So 12 unit cubes.')],
    '5M': [S(() => shape({ pts: [[70, 160], [250, 160], [180, 40]] }) + eq({ lines: ['a + b + c = {180°}'], y0: 196, d0: 2.6, fs: 16 }), 'The three angles of a triangle always add up to 180°.'),
      S(() => grid({ w: 6, h: 4, s: 28, color: (i, j) => (j >= (4 * i) / 6 ? C.t : '#fff'), label: 'Triangle area = 1/2 × 6 × 4 = 12' }), 'The area of a triangle is half the area of its rectangle.')],
    '5N': [S(() => chart({ bars: [['A', 4], ['B', 6], ['C', 8]] }), 'Data 4, 6, and 8.'),
      S(() => chart({ bars: [['A', 6], ['B', 6], ['C', 6]], max: 8 }) + T(185, 30, 'mean = (4 + 6 + 8) ÷ 3 = 6', { fs: 13, c: C.d, d: 1.6 }), 'Average: if all are made the same height, each bar becomes 6.')],
    '5O': [S(() => eq({ lines: ['1.5 km = {1,500 m}', '2.4 kg = {2,400 g}', '3 liters = 3,000 ml'] }), 'Converting units with decimals: multiply by 1,000.'),
      S(() => eq({ lines: ['4 kg Rp60,000', '1 kg = 60,000 ÷ 4', '= {Rp15,000}'] }), 'Rate: price per unit.')],
    // Kelas 6
    '6A': [S(() => grid({ w: 4, h: 4, s: 30, label: '4² = 4 × 4 = 16' }), '4 squared: a square of 4 × 4 = 16 boxes. The root of 16 is 4.'),
      S(() => cubes({ l: 2, w: 2, h: 2, label: '2³ = 2 × 2 × 2 = 8' }), '2 cubed: a cube of 2 × 2 × 2 = 8.')],
    '6B': [S(() => eq({ lines: ['60', '= 2 × 30', '= 2 × 2 × 15', '= 2 × 2 × 3 × 5', '= {2² × 3 × 5}'], fs: 17 }), 'Prime factorization: keep dividing by primes until everything is prime.')],
    '6C': [S(() => frac({ n: 8, k: 6, shape: 'bar', label: 'there are 6 parts of 1/8' }), 'How many 1/8s are in 3/4? 3/4 = 6/8, so there are 6.'),
      S(() => eq({ lines: ['3/4 : 1/8', '= 3/4 × {8/1}', '= 24/4 = {6}'] }), 'Dividing fractions: multiply by the reciprocal.')],
    '6D': [S(() => line({ from: -6, to: 6, start: 2, hops: [-5] }), '2 + (−5): start at 2, go back 5. The result is −3.'),
      S(() => eq({ lines: ['(−3) × 4 = {−12}', '(−3) × (−4) = {12}', 'same signs → positive'] }), 'Multiplying integers: same signs give a positive result, different signs a negative one.')],
    '6E': [S(() => coord({ pts: [[-3, 2, C.r], [4, -1, C.b]], four: true }), 'Four quadrants: (−3, 2) left 3 then up 2; (4, −1) right 4 then down 1.')],
    '6F': [S(() => eq({ lines: ['2 books → Rp10,000', '4 books → Rp20,000', '6 books → {Rp30,000}'] }), 'Equivalent ratio table: if the amount is multiplied by 2, the price is too.'),
      S(() => eq({ lines: ['distance = speed × time', '60 km/h × 2 hours', '= {120 km}'] }), 'Speed, distance, and time.')],
    '6G': [S(() => eq({ lines: ['15 of 60 = ? %', '15/60 = 1/4', '= {25%}'] }), 'Finding a percent: change to a fraction, then to hundredths.'),
      S(() => eq({ lines: ['Price Rp200,000', '10% tax = Rp20,000', 'Total {Rp220,000}'] }), 'Tax adds to the price; a discount reduces it.')],
    '6H': [S(() => eq({ lines: ['{a} + {a} + {a} + b + b', '= {3a} + 2b'] }), 'Combining like terms: a with a, b with b.'),
      S(() => eq({ lines: ['3(x + 2)', '= 3 × x + 3 × 2', '= {3x + 6}'] }), 'Distributive property: multiply each term inside the parentheses.')],
    '6I': [S(() => balance({ l: 'x + 3', r: '8' }), 'An equation is like a balanced scale: x + 3 = 8.'),
      S(() => eq({ lines: ['x + 3 = 8', 'x + 3 [− 3] = 8 [− 3]', 'x = {5}'] }), 'Subtract 3 from both sides to keep it balanced. x = 5.')],
    '6J': [S(() => angle({ deg: 130, label: '130° + 50° = 180°' }), 'Two angles on a straight line add up to 180°.'),
      S(() => eq({ lines: ['Circumference = 2 × π × r', 'Area = π × r × r', 'r = 7 → area = 22/7 × 49 = {154}'], fs: 16 }), 'Formulas for the circumference and area of a circle.')],
    '6K': [S(() => shape({ pts: [[70, 150], [210, 150], [250, 60], [110, 60]], label: 'Parallelogram area = base × height' }), 'A parallelogram can be cut and rearranged into a rectangle.'),
      S(() => cubes({ l: 2, w: 2, h: 2, label: 'Surface area of a cube = 6 × side²' }), 'A cube has 6 square faces.')],
    '6L': [S(() => pie({ parts: [[50, 'Soccer 50%'], [25, 'Swimming 25%'], [25, 'Badminton 25%']] }), 'Pie chart: half a circle means 50%.'),
      S(() => eq({ lines: ['2, 4, 4, 5, 10', 'mean = 25 ÷ 5 = {5}', 'median = {4}, mode = {4}'], fs: 16 }), 'Mean, median, and mode of the same data.')],
    '6M': [S(() => frac({ n: 6, k: 1, label: 'Probability of a 6 on a die = 1/6' }), 'A die has 6 equally likely sides. The probability of a 6 is 1/6.'),
      S(() => eq({ lines: ['Certain: the sun rises', 'Possible: rain tomorrow', 'Impossible: rolling a 7'], fs: 16 }), 'Probability ranges from impossible (0) to certain (1).')],
    '6N': [S(() => eq({ lines: ['Savings Rp1,000,000', '6% interest per year', '= {Rp60,000} a year'], fs: 17 }), 'Savings interest: a percent of the money saved.'),
      S(() => eq({ lines: ['Cost Rp40,000', 'Sold for Rp50,000', 'Profit = {Rp10,000}'] }), 'Profit = selling price − cost.')],
  };

  /* ---------- Pemutar ---------- */
  // Satu pemutar aktif dalam satu waktu; mengembalikan fungsi untuk menghentikannya.
  // Animasi diputar sekali sampai adegan terakhir lalu berhenti (tombol ↻ atau ▶ memutar ulang).
  // Saat animasi tidak terlihat di layar atau tab disembunyikan, animasi dan bunyinya dijeda.
  let active = null;
  function mount(el, unitId) {
    const scenes = A[unitId]; if (!el || !scenes) return null;
    if (active) active();
    let i = 0, timer = null, playing = true, done = false, running = false, seen = !('IntersectionObserver' in window);
    el.innerHTML = `<div class="an-stage"><svg viewBox="0 0 320 200" class="an-svg" role="img" aria-label="Animation"></svg></div><p class="an-say"></p>
      <div class="an-ctrl"><button class="an-btn" data-an="toggle" aria-label="Pause">⏸</button><div class="an-dots">${scenes.map((_, k) => `<button data-an="go" data-k="${k}" aria-label="Step ${k + 1}"></button>`).join('')}</div><button class="an-btn" data-an="replay" aria-label="Replay">↻</button></div>`;
    const svg = el.querySelector('svg'), say = el.querySelector('.an-say'), tbtn = el.querySelector('[data-an=toggle]');
    const visible = () => seen && !document.hidden;
    const setBtn = () => { const on = playing && !done; tbtn.textContent = on ? '⏸' : '▶'; tbtn.setAttribute('aria-label', on ? 'Pause' : 'Play'); };
    const finish = () => { clearTimeout(timer); running = false; done = true; playing = false; setBtn(); };
    // gambar adegan k; bunyi dan pergantian adegan hanya saat animasi terlihat dan sedang diputar
    const show = (k) => {
      clearTimeout(timer); i = k; maxD = 0;
      svg.innerHTML = scenes[i].v(); say.textContent = scenes[i].say;
      const run = playing && visible();
      svg.classList.toggle('paused', !run);
      el.querySelectorAll('.an-dots button').forEach((b, n) => b.classList.toggle('on', n === i));
      running = run;
      if (!run) return;
      if (window.SFX && window.SFX.step) window.SFX.step();
      const dur = Math.max(3.5, maxD + 2.6 + scenes[i].say.length / 60) * 1000;
      timer = setTimeout(() => (i < scenes.length - 1 ? show(i + 1) : finish()), dur);
    };
    const hold = () => { clearTimeout(timer); running = false; svg.classList.add('paused'); };
    // keluar layar: jeda; kembali terlihat: lanjutkan adegan yang sama (sekali saja, walau pengamat terpicu beberapa kali)
    const onSeen = () => { if (!visible()) { if (running) hold(); } else if (playing && !done && !running) show(i); };
    let io = null;
    if (!seen) { io = new IntersectionObserver((es) => { const e = es[es.length - 1]; seen = e.isIntersecting && e.intersectionRatio >= 0.35; onSeen(); }, { threshold: [0, 0.35, 0.7] }); io.observe(el); }
    document.addEventListener('visibilitychange', onSeen);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-an]'); if (!b) return;
      if (b.dataset.an === 'toggle') {
        if (done) { done = false; playing = true; setBtn(); show(0); return; }
        playing = !playing; setBtn(); if (playing) show(i); else hold();
      }
      if (b.dataset.an === 'replay') { done = false; playing = true; setBtn(); show(0); }
      if (b.dataset.an === 'go') { done = false; playing = true; setBtn(); show(+b.dataset.k); }
    });
    show(0); // adegan pertama tergambar; baru diputar (dengan bunyi) saat terlihat di layar
    const stop = () => { clearTimeout(timer); if (io) io.disconnect(); document.removeEventListener('visibilitychange', onSeen); if (active === stop) active = null; };
    active = stop;
    return stop;
  }
  /* ---------- SMP–SMA: bagian atas pecahan, garis, bagian bawah, lalu faktor yang sama dicoret merah ---------- */
  // top: [[teks, dicoret?], ...]; bot: teks penyebut (dicoret); res: hasil
  function cancel({ top, bot, res, d0 = 0.3, fs = 22, intro }) {
    const w = 300 / top.length, x = (i) => 160 - (w * (top.length - 1)) / 2 + i * w, half = (s) => Math.min(s.length * fs * 0.27, 62), sd = d0 + 1.4;
    let o = intro ? T(160, 34, intro, { fs: 15, c: C.d, d: 0 }) : '';
    top.forEach(([s], i) => { o += T(x(i), 82, s, { fs, d: d0 + i * 0.2 }); });
    o += `<path d="M40 96H280" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" pathLength="1" class="a-draw" ${dl(d0 + 0.4)}/>` + T(160, 126, bot, { fs, d: d0 + 0.6 });
    const line = (cx, cy, h, d) => `<path d="M${cx - h} ${cy + 11}L${cx + h} ${cy - 11}" stroke="${C.r}" stroke-width="5" stroke-linecap="round" pathLength="1" class="a-draw" ${dl(d)}/>`;
    top.forEach(([s, c], i) => { if (c) o += line(x(i), 75, half(s), sd); });
    o += line(160, 119, half(bot), sd + 0.5);
    return o + T(160, 172, res, { fs: fs + 2, c: C.d, cls: 'a-pop', d: sd + 1.4 });
  }
  // baris pola: bagian yang tetap hitam, yang berubah oranye, muncul satu per satu
  const pattern = (lines, fs = 18) => eq({ lines, fs, step: 1.05 });
  Object.assign(A, {
    '7A': [S(() => pattern(['3 + (−5) = {−2}', '4 + (−5) = {−1}', '5 + (−5) = {0}', '[up 1, result up 1]']), 'Adding a negative number is the same as subtracting. The pattern is easy to see.'),
      S(() => pattern(['−3 × 2 = {−6}', '−3 × 1 = {−3}', '−3 × (−1) = {3}', '−3 × (−2) = {6}']), 'A negative times a negative is positive.')],
    '7B': [S(() => cancel({ top: [['3', true], ['×', false], ['4', true]], bot: '8 × 9', res: 'cross out: 1/2 × 1/3', intro: '3/8 × 4/9' }), 'When multiplying fractions, common factors can be crossed out first. The result is 1/6.')],
    '7E': [S(() => pattern(['3(x + 1) = 3x + {3}', '3(x + 2) = 3x + {6}', '3(x + 3) = 3x + {9}', '[outside number times every term]']), 'Distributive property: the number outside the parentheses multiplies each term.')],
    '7F': [S(() => eq({ lines: ['2x + 3 = 11', '2x = 11 [− 3]', '2x = 8', 'x = 8 [: 2]', 'x = {4}'], fs: 18 }), 'Move the constant, then divide by the coefficient of x.')],
    '8E': [S(() => pattern(['f(x) = 2x + 1', 'f(1) = {3}', 'f(2) = {5}', 'f(3) = {7}', '[x up 1, value up 2]']), 'In a linear function, the value changes by a fixed amount each time x goes up 1. That\'s its slope.')],
    A1E: [S(() => pattern(['(x + 2)(x + 1) = x² + {3}x + [2]', '(x + 2)(x + 2) = x² + {4}x + [4]', '(x + 2)(x + 3) = x² + {5}x + [6]'], 15), 'The middle term is the sum of the two numbers, and the constant is their product.')],
    A1F: [S(() => eq({ lines: ['x² + 5x + 6', 'product [6], sum {5}', '2 × 3 = [6]   2 + 3 = {5}', '(x + 2)(x + 3)'], fs: 18 }), 'Find two numbers: their product is the constant, their sum is the coefficient of x.'),
      S(() => cancel({ top: [['(x + 2)', true], ['(x + 3)', false]], bot: '(x + 2)', res: '= x + 3', intro: 'Common factors on top and bottom' }), 'Common factors in the numerator and denominator can be crossed out.')],
    A2A: [S(() => pattern(['i¹ = {i}', 'i² = {−1}', 'i³ = {−i}', 'i⁴ = {1}', '[then repeats every 4]']), 'Powers of i repeat every 4.')],
    A2D: [S(() => pattern(['²log 2 = {1}', '²log 4 = {2}', '²log 8 = {3}', '²log 16 = {4}', '[how many times is 2 multiplied?]']), 'A logarithm answers: the base is raised to what power?')],
    A2H: [S(() => cancel({ top: [['8 × 7 ×', false], ['6!', true]], bot: '6!', res: '= 8 × 7 = 56', intro: '8! : 6!' }), 'The same factorial on top and bottom can be crossed out.')],
    PKH: [S(() => cancel({ top: [['(x − 1)', true], ['(x + 3)', false]], bot: '(x − 1)', res: 'lim = 1 + 3 = 4', intro: 'x → 1 gives 0/0' }), 'When substitution gives 0/0, factor, cross out the common factor, then substitute.')],
    KA: [S(() => cancel({ top: [['(x − 2)', true], ['(x + 5)', false]], bot: '(x − 2)', res: 'lim = 2 + 5 = 7', intro: 'x → 2 gives 0/0' }), 'The factor (x − 2) is crossed out because x approaches 2 but doesn\'t equal 2.')],
    KC: [S(() => cancel({ top: [['h', true], ['(2x + h)', false]], bot: 'h', res: 'h → 0, the result is 2x', intro: 'Derivative of x² using limits' }), 'From the limit definition, h is crossed out, then h approaches 0.')],
    KD: [S(() => pattern(["(x²)' = {2}x", "(x³)' = {3}x²", "(x⁴)' = {4}x³", '[the exponent comes down as a multiplier]']), 'Power rule: the old exponent becomes a multiplier, and the exponent goes down by one.')],
    KH: [S(() => pattern(['∫ 2x dx = x² + C', '∫ 3x² dx = x³ + C', '∫ 4x³ dx = x⁴ + C', '[the reverse of a derivative]']), 'An integral is the reverse of a derivative: raise the exponent by one, then divide by the new exponent.'),
      S(() => cancel({ top: [['(x − 1)', true], ['(x + 2)', false]], bot: '(x − 1)', res: '∫ (x + 2) dx', intro: 'Simplify first' }), 'A fraction integral becomes easy once common factors are crossed out.')],
  });
  window.METIQ_ANIM = { has: (id) => !!A[id], mount, stop: () => active && active(), _scripts: A };
})();
