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
    .replace(/<span class="mint">∫<span class="mlims"><sup>(.*?)<\/sup><sub>(.*?)<\/sub><\/span><\/span>/g, '∫ dari $2 sampai $1 ')
    .replace(/<span class="mfr"><b>(.*?)<\/b><b>(.*?)<\/b><\/span>/g, '($1)/($2)')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const MATH = /class="m(lim|fr|int)"/;
  const plainExtra = (text, extra) => (MATH.test(text) ? Object.assign({ log: plain(text), speak: plain(text).replace(/\^(\w+)/g, ' pangkat $1') }, extra) : extra);
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
    if (!motion && !steps.some(([, d]) => /class="mcx"/.test(d))) return `${head}<ol class="tahap">${steps.map(([t, d]) => `<li><b>${t}</b><div>${d}</div></li>`).join('')}</ol>`;
    let at = 0.3;
    const li = steps.map(([t, d]) => { const s = `<li style="--t:${at.toFixed(2)}s"><b>${t}</b><div>${d}</div></li>`; at += /class="mcx"/.test(d) ? 2.4 : 1.5; return s; }).join('');
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
  // Pelajaran singkat untuk bab-bab baru
  const L = (window.METIQ_LESSONS = window.METIQ_LESSONS || {});
  const lesson = (id, intro, parts) => { L[id] = { intro, parts: parts.map(([t, steps, ex]) => ({ t, steps, ex })) }; };

  Object.assign(C.kit, { LIM, FR, CX, INT, plain, N, P, nz, sgn, F, FH, sup, poly, lin, tahap, KEYS, num, pil, opt, fact, nCr, lesson });
})();
