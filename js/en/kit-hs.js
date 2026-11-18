/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — perangkat bersama SMP dan SMA (Kelas 7 sampai Kalkulus).
 * Penjelasan mengikuti pola bertahap: "Ide kunci" lalu langkah bernama, masing-masing dengan hitungannya.
 * Jawaban isian memakai minus (−), koma desimal, dan garis miring pecahan; papan angka menyediakan tombolnya.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, inp, ch, gcd, uniq } = C.kit;

  // Angka gaya Indonesia: minus asli dan koma desimal (maksimal 4 angka di belakang koma)
  const N = (x) => { if (typeof x === 'string') return x; const v = Math.round(x * 1e4) / 1e4; return (v < 0 ? '−' : '') + String(Math.abs(v)); };
  const P = (x) => (x < 0 ? `(${N(x)})` : N(x));
  const nz = (a, b) => { let v; do v = r(a, b); while (!v); return v; };
  const sgn = (x) => (x < 0 ? '−' : '+');
  // Pecahan paling sederhana sebagai teks jawaban (−3/4, 5, 7/2)
  const F = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1, a = n / g, b = d / g; return b === 1 ? N(a) : `${a < 0 ? '−' : ''}${Math.abs(a)}/${b}`; };
  // Pecahan bertingkat untuk tampilan soal
  const FH = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1, a = n / g, b = d / g; return b === 1 ? N(a) : `${a < 0 ? '−' : ''}<span class="mfr"><b>${Math.abs(a)}</b><b>${b}</b></span>`; };
  const sup = (e) => `<sup>${e}</sup>`;
  // Notasi bertingkat: limit (x → a di bawah lim), pecahan dua baris, integral dengan batas atas dan bawah
  const LIM = (v, a) => `<span class="mlim"><span>lim</span><small>${v} → ${a}</small></span>`;
  const FR = (num, den) => `<span class="mfr"><b>${num}</b><b>${den}</b></span>`;
  // Faktor yang dicoret di pembilang dan penyebut (garis merah), dipakai di langkah penjelasan
  const CX = (t) => `<s class="mcx">${t}</s>`;
  const INT = (a, b) => (a === undefined ? '<span class="mint">∫</span>' : `<span class="mint">∫<span class="mlims"><sup>${b}</sup><sub>${a}</sub></span></span>`);
  // Versi teks satu baris untuk catatan guru dan suara
  const plain = (h) => String(h)
    .replace(/<span class="mlim"><span>lim<\/span><small>(.*?)<\/small><\/span>/g, 'lim($1) ')
    .replace(/<span class="mint">∫<span class="mlims"><sup>(.*?)<\/sup><sub>(.*?)<\/sub><\/span><\/span>/g, '∫ from $2 to $1 ')
    .replace(/<span class="mfr"><b>(.*?)<\/b><b>(.*?)<\/b><\/span>/g, '($1)/($2)')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const MATH = /class="m(lim|fr|int)"/;
  const plainExtra = (text, extra) => (MATH.test(text) ? Object.assign({ log: plain(text), speak: plain(text).replace(/\^(\w+)/g, ' to the power of $1') }, extra) : extra);
  // Polinomial dari koefisien (pangkat tertinggi dulu): poly([2, -3, 1]) = 2x² − 3x + 1
  function poly(cs, v = 'x') {
    const n = cs.length - 1, out = [];
    cs.forEach((c, i) => {
      if (!c) return;
      const p = n - i, a = Math.abs(c);
      const coef = p === 0 ? N(a) : a === 1 ? '' : N(a);
      const term = coef + (p === 0 ? '' : p === 1 ? v : v + sup(p));
      out.push(out.length ? ` ${c < 0 ? '−' : '+'} ${term}` : (c < 0 ? '−' : '') + term);
    });
    return out.join('') || '0';
  }
  // Bentuk linear ax + b (atau ax − b) sebagai teks
  const lin = (a, b, v = 'x') => poly([a, b], v);
  // Penjelasan bertahap
  // Langkah beranimasi (ada coretan atau latihan berpola): muncul satu per satu, garis merah tergambar sesudah langkahnya tampil
  const tahap = (kunci, steps, motion) => {
    const head = kunci ? `<div class="kunci"><b>Key idea</b><p>${kunci}</p></div>` : '';
    let at = 0.18;
    const li = steps.map(([t, d]) => { const s = `<li style="--t:${at.toFixed(2)}s"><b>${t}</b><div>${d}</div></li>`; at += /class="mcx"/.test(d) ? 2.4 : 0.95; return s; }).join('');
    return `${head}<div class="lk"><ol class="tahap lk-steps">${li}</ol><button class="link small kc-again" data-act="kolomplay">↻ Replay</button></div>`;
  };
  const KEYS = ['−', ',', '/'];
  // Soal isian dan pilihan ganda dengan penjelasan bertahap
  const num = (text, ans, kunci, steps, extra = {}) => inp(text, N(ans), tahap(kunci, steps, extra.motion), Object.assign({ keys: KEYS }, plainExtra(text, extra)));
  const pil = (text, options, ans, kunci, steps, extra = {}) => ch(text, options, ans, tahap(kunci, steps, extra.motion), plainExtra(text, extra));
  // Pilihan: jawaban benar + 3 pengecoh berbeda
  const opt = (ans, cands) => { const a = String(ans); const rest = uniq(cands.map(String)).filter((x) => x !== a); return shuffle([a, ...shuffle(rest).slice(0, 3)]); };
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  const nCr = (n, k) => fact(n) / (fact(k) * fact(n - k));

  /* ---------- Diagram untuk soal SMP dan SMA (SVG, tanpa pustaka) ---------- */
  const VH = {};
  const CL = { ink: '#17323a', soft: '#8a9a96', line: '#cfe0da', brand: '#1db796', gold: '#e0a800', orange: '#e08a00', blue: '#4d96ff', fill: '#e8f8f3', red: '#d63c42' };
  const sv = (w, h, body) => `<svg class="vh" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${body}</svg>`;
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-size="${o.size || 11}" font-weight="${o.weight || 700}" fill="${o.color || CL.ink}">${s}</text>`;
  const ln = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.color || CL.ink}" stroke-width="${o.w || 2}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round"/>`;
  // Garis bilangan dengan lompatan (untuk bilangan bulat kelas 7)
  VH.numLine = ({ min, max, from, to, label }) => {
    const w = 320, h = 76, pad = 16, span = max - min || 1, X = (v) => pad + ((v - min) / span) * (w - 2 * pad);
    let s = ln(pad, 44, w - pad, 44, { w: 2 });
    for (let v = min; v <= max; v++) s += ln(X(v), 39, X(v), 49, { w: v === 0 ? 2 : 1, color: v === 0 ? CL.ink : CL.soft }) + txt(X(v), 66, v, { size: 9, color: CL.soft });
    if (from != null) s += `<circle cx="${X(from)}" cy="44" r="4.5" fill="${CL.brand}"/>`;
    if (from != null && to != null) {
      const x1 = X(from), x2 = X(to), mid = (x1 + x2) / 2;
      s += `<path d="M${x1} 32 Q${mid} 2 ${x2} 32" fill="none" stroke="${CL.orange}" stroke-width="2"/>`;
      s += `<path d="M${x2} 32 l-5 -2 l2 6 z" fill="${CL.orange}"/>`;
      if (label) s += txt(mid, 12, label, { size: 11, color: CL.orange });
    }
    return sv(w, h, s);
  };
  // Sudut tunggal dengan busur dan besar derajat
  VH.angle = (deg, o = {}) => {
    const w = 170, h = 130, cx = 24, cy = 108, R = 132, a = (Math.min(deg, 359) * Math.PI) / 180;
    const x2 = cx + R * Math.cos(a), y2 = cy - R * Math.sin(a), r = 34;
    let s = ln(cx, cy, cx + R, cy) + ln(cx, cy, x2, y2);
    s += `<path d="M${cx + r} ${cy} A${r} ${r} 0 0 0 ${cx + r * Math.cos(a)} ${cy - r * Math.sin(a)}" fill="none" stroke="${CL.brand}" stroke-width="2"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="3" fill="${CL.ink}"/>`;
    if (o.label !== false) {
      const lx = cx + (r + 16) * Math.cos(a / 2), ly = cy - (r + 16) * Math.sin(a / 2);
      s += txt(lx, ly + 4, `${deg}°`, { size: 11, color: CL.brand });
    }
    return sv(w, h, s);
  };
  // Dua garis sejajar dipotong garis lain (sudut sehadap / berseberangan)
  VH.parallel = (deg, o = {}) => {
    const w = 240, h = 150, y1 = 44, y2 = 108;
    const rad = (Math.min(Math.max(deg, 5), 355) * Math.PI) / 180, ux = Math.cos(rad), uy = -Math.sin(rad);
    const t2 = (y2 - y1) / uy, dx = (y2 - y1) * (ux / uy);
    const lo = 16 - Math.min(0, dx), hi = w - 16 - Math.max(0, dx), x = Math.max(lo, Math.min(w / 2, hi));
    const p = (t) => [x + t * ux, y1 + t * uy], top = p(46), bottom = p(t2 - 14), r = 26;
    let s = ln(12, y1, w - 12, y1) + ln(12, y2, w - 12, y2);
    s += ln(top[0], top[1], bottom[0], bottom[1], { color: CL.blue });
    s += `<path d="M${x + r} ${y1} A${r} ${r} 0 ${deg > 180 ? 1 : 0} 0 ${x + r * Math.cos(rad)} ${y1 - r * Math.sin(rad)}" fill="none" stroke="${CL.brand}" stroke-width="2"/>`;
    s += txt(x + 44, y1 - 10, `${deg}°`, { size: 11, color: CL.brand });
    return sv(w, h, s);
  };
  // Segitiga siku-siku dengan panjang kaki a dan b
  VH.rightTri = (a, b, o = {}) => {
    const w = 220, h = 160, pad = 30, maxw = w - 2 * pad, maxh = h - 2 * pad, k = Math.min(maxw / a, maxh / b);
    const A = a * k, B = b * k, x0 = pad, y0 = h - pad;
    let s = `<path d="M${x0} ${y0} L${x0 + A} ${y0} L${x0} ${y0 - B} Z" fill="${CL.fill}" stroke="${CL.ink}" stroke-width="2"/>`;
    s += `<path d="M${x0 + 12} ${y0} L${x0 + 12} ${y0 - 12} L${x0} ${y0 - 12}" fill="none" stroke="${CL.brand}" stroke-width="2"/>`;
    s += txt(x0 + A / 2, y0 + 18, `${o.labelA || a}${o.unit || ''}`);
    s += txt(x0 - 12, y0 - B / 2 + 4, `${o.labelB || b}${o.unit || ''}`, { anchor: 'end' });
    if (o.hyp) s += txt(x0 + A * 0.62, y0 - B * 0.62, o.hyp, { color: CL.orange });
    if (o.angle) s += `<path d="M${x0 + A - 30} ${y0} A30 30 0 0 0 ${x0 + A - 30 * Math.cos((o.angle * Math.PI) / 180)} ${y0 - 30 * Math.sin((o.angle * Math.PI) / 180)}" fill="none" stroke="${CL.gold}" stroke-width="2"/>`;
    return sv(w, h, s);
  };
  // Segitiga umum dengan tiga sudut (untuk sudut luar / jenis segitiga)
  VH.triAngles = (A, B, o = {}) => {
    const w = 240, h = 150, pad = 22, C = 180 - A - B, rad = (d) => (d * Math.PI) / 180;
    const ratio = (Math.sin(rad(A)) * Math.sin(rad(B))) / Math.sin(rad(C));
    const baseW = Math.min(w - 2 * pad, (h - 2 * pad - 12) / Math.max(ratio, 0.2));
    const left = (baseW * Math.sin(rad(B))) / Math.sin(rad(C)), x0 = (w - baseW) / 2, y0 = h - pad;
    const px = x0 + left * Math.cos(rad(A)), py = y0 - left * Math.sin(rad(A));
    let s = `<path d="M${x0} ${y0} L${x0 + baseW} ${y0} L${px} ${py} Z" fill="${CL.fill}" stroke="${CL.ink}" stroke-width="2"/>`;
    s += txt(x0 + 22, y0 - 8, `${A}°`, { size: 10, color: CL.brand });
    s += txt(x0 + baseW - 22, y0 - 8, `${B}°`, { size: 10, color: CL.brand });
    s += txt(px, py + 16, `${o.showC === false ? '?' : C + '°'}`, { size: 10, color: CL.brand });
    if (o.ext) s += ln(x0 + baseW, y0, x0 + baseW + 34, y0, { color: CL.orange }) + `<path d="M${x0 + baseW + 4} ${y0} A26 26 0 0 1 ${x0 + baseW - 20} ${y0 - 16}" fill="none" stroke="${CL.orange}" stroke-width="2"/>` + txt(x0 + baseW + 20, y0 - 22, `${o.ext}°`, { size: 10, color: CL.orange });
    return sv(w, h, s);
  };
  // Bangun datar: persegi panjang, trapesium, jajar genjang, segitiga
  VH.flat = (kind, dims, unit = ' cm') => {
    const w = 240, h = 160, pad = 26;
    let s = '';
    if (kind === 'trap') {
      const [a, b, t] = dims, k = Math.min((w - 2 * pad) / b, (h - 2 * pad - 14) / t), A = a * k, B = b * k, T = t * k, x0 = pad + (B - A) / 2, y0 = h - pad;
      s = `<path d="M${x0} ${y0 - T} L${x0 + A} ${y0 - T} L${pad + B} ${y0} L${pad} ${y0} Z" fill="${CL.fill}" stroke="${CL.ink}" stroke-width="2"/>`;
      s += txt(x0 + A / 2, y0 - T - 8, `${a}${unit}`) + txt(pad + B / 2, y0 + 18, `${b}${unit}`);
      s += ln(pad + B / 2 - 16, y0, pad + B / 2 - 16, y0 - T, { color: CL.orange, dash: '4 3' }) + txt(pad + B / 2 - 8, y0 - T / 2 + 4, `${t}${unit}`, { anchor: 'start', color: CL.orange, size: 10 });
    } else if (kind === 'rect') {
      const [p, l] = dims, k = Math.min((w - 2 * pad) / p, (h - 2 * pad - 12) / l), P = p * k, L = l * k, x0 = (w - P) / 2, y0 = (h - L) / 2;
      s = `<rect x="${x0}" y="${y0}" width="${P}" height="${L}" rx="2" fill="${CL.fill}" stroke="${CL.ink}" stroke-width="2"/>`;
      s += txt(x0 + P / 2, y0 + L + 16, `${p}${unit}`) + txt(x0 + 10, y0 + L / 2 + 4, `${l}${unit}`, { anchor: 'start' });
    } else if (kind === 'para') {
      const [a, t, sk = 0] = dims, k = Math.min((w - 2 * pad - 34) / (a + sk), (h - 2 * pad - 12) / t), A = a * k, T = t * k, S = sk * k, y0 = h - pad, x0 = pad;
      s = `<path d="M${x0 + S} ${y0 - T} L${x0 + S + A} ${y0 - T} L${x0 + A} ${y0} L${x0} ${y0} Z" fill="${CL.fill}" stroke="${CL.ink}" stroke-width="2"/>`;
      s += txt(x0 + A / 2 + S / 2, y0 + 18, `${a}${unit}`) + ln(x0 + S + A, y0 - T, x0 + S + A, y0, { color: CL.orange, dash: '4 3' }) + txt(x0 + S + A + 8, y0 - T / 2 + 4, `${t}${unit}`, { anchor: 'start', color: CL.orange, size: 10 });
    }
    return sv(w, h, s);
  };
  // Lingkaran: jari-jari, busur, atau juring dengan sudut
  VH.circle = (r, deg, o = {}) => {
    const w = 200, h = 180, cx = 100, cy = 92, R = 66;
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${o.sector ? CL.fill : '#fff'}" stroke="${CL.ink}" stroke-width="2"/>`;
    if (deg) {
      const a = (deg * Math.PI) / 180, x2 = cx + R * Math.cos(-Math.PI / 2 + a), y2 = cy + R * Math.sin(-Math.PI / 2 + a);
      s = `<path d="M${cx} ${cy} L${cx} ${cy - R} A${R} ${R} 0 ${deg > 180 ? 1 : 0} 1 ${x2} ${y2} Z" fill="${CL.fill}" stroke="${CL.ink}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="2.5" fill="${CL.ink}"/>`;
      s += txt(cx + 26, cy - 18, `${deg}°`, { size: 10, color: CL.brand });
    } else if (o.radius !== false) {
      s += ln(cx, cy, cx + R, cy, { color: CL.orange }) + `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${CL.ink}"/>` + txt(cx + R / 2, cy - 6, `r = ${r}`, { size: 10, color: CL.orange });
    }
    return sv(w, h, s);
  };
  VH.circleEq = (h, k, r) => {
    const cx = 100, cy = 70, R = 38;
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="${CL.ink}" stroke-width="2"/>`;
    s += ln(cx, cy, cx + 27, cy - 27, { color: CL.orange, w: 2.5 }) + `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${CL.brand}"/>`;
    s += txt(cx, 18, `Center C(${N(h)}, ${N(k)})`, { size: 11, color: CL.ink });
    s += txt(cx + 24, cy - 8, `r = ${N(r)}`, { size: 9, color: CL.orange }) + txt(cx, 132, `r² = ${N(r * r)}`, { size: 10, color: CL.brand });
    return sv(200, 146, s);
  };
  VH.remainder = (a) => {
    const divisor = lin(1, -a), cards = [['Divisor', divisor], ['Set to 0', `${divisor} = 0`], ['Solve for x', `x = ${N(a)}`], ['Remainder', `f(${N(a)})`]];
    let s = '';
    cards.forEach(([label, value], i) => {
      const x = 5 + i * 78;
      s += `<rect x="${x}" y="20" width="70" height="60" rx="11" fill="${i === 3 ? '#e1f7f0' : '#f3fbf8'}" stroke="${i === 3 ? CL.brand : CL.line}" stroke-width="1.5"/>`;
      s += txt(x + 35, 42, label, { size: 8, color: CL.soft }) + txt(x + 35, 62, value, { size: 10, color: CL.ink });
      if (i < cards.length - 1) s += txt(x + 75, 55, '›', { size: 18, color: CL.brand });
    });
    return sv(320, 100, s);
  };
  // Bangun ruang sederhana: balok, tabung, kerucut, bola, limas
  VH.solid = (kind, dims, unit = ' cm') => {
    const w = 220, h = 180, cx = 110;
    let s = '';
    if (kind === 'box') {
      const [p, l, t] = dims, k = 52 / Math.max(p, l, t), P = p * k, T = t * k, dx = 26, dy = 16, x0 = 52, y0 = 128;
      s = `<path d="M${x0} ${y0 - T} L${x0 + dx} ${y0 - T - dy} L${x0 + P + dx} ${y0 - T - dy} L${x0 + P} ${y0 - T} Z" fill="#d9f3ec" stroke="${CL.ink}" stroke-width="2"/>`;
      s += `<rect x="${x0}" y="${y0 - T}" width="${P}" height="${T}" fill="${CL.fill}" stroke="${CL.ink}" stroke-width="2"/>`;
      s += `<path d="M${x0 + P} ${y0 - T} L${x0 + P + dx} ${y0 - T - dy} L${x0 + P + dx} ${y0 - dy} L${x0 + P} ${y0} Z" fill="#eef9f5" stroke="${CL.ink}" stroke-width="2"/>`;
      s += txt(x0 + P / 2, y0 + 16, `${p}${unit}`) + txt(x0 - 7, y0 - T / 2 + 4, `${t}${unit}`, { anchor: 'end', size: 10 }) + txt(x0 + P + dx + 6, y0 - T - dy / 2, `${l}${unit}`, { anchor: 'start', size: 10 });
    } else if (kind === 'cyl' || kind === 'cone') {
      const [r, t] = dims, R = 46, H = 92, cx2 = 110, top = 52;
      if (kind === 'cyl') {
        s = `<ellipse cx="${cx2}" cy="${top}" rx="${R}" ry="14" fill="#d9f3ec" stroke="${CL.ink}" stroke-width="2"/><path d="M${cx2 - R} ${top} L${cx2 - R} ${top + H} A${R} 14 0 0 0 ${cx2 + R} ${top + H} L${cx2 + R} ${top}" fill="${CL.fill}" stroke="${CL.ink}" stroke-width="2"/>`;
        s += ln(cx2, top, cx2 + R, top, { color: CL.orange, dash: '3 3' }) + txt(cx2 + R / 2, top - 12, `r = ${r}`, { size: 10, color: CL.orange });
        s += ln(cx2 + R + 12, top, cx2 + R + 12, top + H, { color: CL.gold, dash: '3 3' }) + txt(cx2 + R + 18, top + H / 2, `t = ${t}`, { anchor: 'start', size: 10, color: CL.gold });
      } else {
        s = `<path d="M${cx2} ${top - 10} L${cx2 - R} ${top + H} A${R} 14 0 0 0 ${cx2 + R} ${top + H} Z" fill="${CL.fill}" stroke="${CL.ink}" stroke-width="2"/>`;
        s += ln(cx2, top + 8, cx2 + R, top + H, { color: CL.orange, dash: '3 3' }) + txt(cx2 + R + 8, top + H / 2, `r = ${r}`, { anchor: 'start', size: 10, color: CL.orange });
        s += ln(cx2 - R - 12, top + 8, cx2 - R - 12, top + H, { color: CL.gold, dash: '3 3' }) + txt(cx2 - R - 18, top + H / 2, `t = ${t}`, { anchor: 'end', size: 10, color: CL.gold });
      }
    } else if (kind === 'sphere') {
      const [r] = dims;
      s = `<circle cx="${cx}" cy="92" r="58" fill="${CL.fill}" stroke="${CL.ink}" stroke-width="2"/><ellipse cx="${cx}" cy="92" rx="58" ry="18" fill="none" stroke="${CL.soft}" stroke-width="1.4" stroke-dasharray="4 3"/>`;
      s += ln(cx, 92, cx + 58, 92, { color: CL.orange }) + txt(cx + 30, 106, `r = ${r}`, { size: 10, color: CL.orange });
    } else if (kind === 'pyramid') {
      const [a, t] = dims, B = 84, H = 84, x0 = 68, y0 = 148;
      s = `<path d="M${x0} ${y0} L${x0 + B} ${y0} L${x0 + B + 22} ${y0 - 18} L${x0 + 22} ${y0 - 18} Z" fill="#d9f3ec" stroke="${CL.ink}" stroke-width="2"/>`;
      s += `<path d="M${x0 + 22} ${y0 - 18} L${x0 + B / 2 + 11} ${y0 - 18 - H} L${x0 + B} ${y0} M${x0 + 22} ${y0 - 18} L${x0} ${y0}" fill="none" stroke="${CL.ink}" stroke-width="2"/>`;
      s += ln(x0 + B / 2 + 11, y0 - 18, x0 + B / 2 + 11, y0 - 18 - H, { color: CL.gold, dash: '3 3' }) + txt(x0 + B / 2 + 18, y0 - 18 - H / 2, `t = ${t}`, { anchor: 'start', size: 10, color: CL.gold });
      s += txt(x0 + B / 2, y0 + 14, `s = ${a}`, { size: 10 });
    }
    return sv(w, h, s);
  };
  // Bidang koordinat dengan titik/garis
  VH.plane = ({ min = -5, max = 5, points = [], seg = [], line = null, curve = null, w = 240, h = 240 } = {}) => {
    const pad = 22, span = max - min, X = (x) => pad + ((x - min) / span) * (w - 2 * pad), Y = (y) => h - pad - ((y - min) / span) * (h - 2 * pad);
    let s = '';
    for (let v = min; v <= max; v++) {
      if (v === 0) continue;
      s += ln(X(v), pad, X(v), h - pad, { color: '#e9f1ee', w: 1 }) + ln(pad, Y(v), w - pad, Y(v), { color: '#e9f1ee', w: 1 });
    }
    s += ln(pad, Y(0), w - pad, Y(0), { w: 2 }) + ln(X(0), pad, X(0), h - pad, { w: 2 });
    s += txt(w - pad + 2, Y(0) + 4, 'x', { anchor: 'end', size: 10 }) + txt(X(0) + 6, pad - 4, 'y', { anchor: 'start', size: 10 });
    const lbl = span > 8 ? 2 : 1;
    for (let v = min; v <= max; v++) if (v && v % lbl === 0) s += txt(X(v), Y(0) + 12, v, { size: 8, color: CL.soft }) + txt(X(0) - 5, Y(v) + 3, v, { anchor: 'end', size: 8, color: CL.soft });    if (line) {
      const { m, c } = line;
      s += ln(X(min), Y(m * min + c), X(max), Y(m * max + c), { color: CL.blue, w: 2.2 });
    }
    if (curve) {
      let d = '';
      for (let i = 0; i <= 80; i++) {
        const x = min + (i / 80) * span, y = curve(x);
        if (!Number.isFinite(y) || y < min - 1 || y > max + 1) { d += ''; continue; }
        d += (d ? ' L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1);
      }
      s += `<path d="${d}" fill="none" stroke="${CL.blue}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
    seg.forEach(([x1, y1, x2, y2]) => { s += ln(X(x1), Y(y1), X(x2), Y(y2), { color: CL.orange, w: 2 }); });
    points.forEach(([x, y, name, color]) => {
      s += `<circle cx="${X(x)}" cy="${Y(y)}" r="4" fill="${color || CL.brand}"/>`;
      if (name) s += txt(X(x) + 7, Y(y) - 6, name, { anchor: 'start', size: 10, color: color || CL.brand });
    });
    return sv(w, h, s);
  };
  // Diagram batang sederhana untuk statistika
  VH.bars = (values, labels) => {
    const w = 260, h = 150, pad = 26, max = Math.max(...values, 1), bw = Math.min(26, (w - 2 * pad) / values.length - 6);
    let s = ln(pad, h - pad, w - pad, h - pad, { w: 2 });
    values.forEach((v, i) => {
      const x = pad + 8 + i * ((w - 2 * pad) / values.length), bh = ((h - 2 * pad) * v) / max;
      s += `<rect x="${x}" y="${h - pad - bh}" width="${bw}" height="${bh}" rx="3" fill="${CL.brand}" opacity="${0.55 + (i % 3) * 0.15}"/>`;
      s += txt(x + bw / 2, h - pad + 13, labels ? labels[i] : v, { size: 9, color: CL.soft });
    });
    return sv(w, h, s);
  };

  // Pelajaran singkat untuk bab-bab baru
  const L = (window.METIQ_LESSONS = window.METIQ_LESSONS || {});
  const lesson = (id, intro, parts) => { L[id] = { intro, parts: parts.map(([t, steps, ex]) => ({ t, steps, ex })) }; };

  Object.assign(C.kit, { LIM, FR, CX, INT, plain, N, P, nz, sgn, F, FH, sup, poly, lin, tahap, KEYS, num, pil, opt, fact, nCr, lesson, VH });
})();
