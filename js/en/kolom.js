/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — animasi penjumlahan dan pengurangan bersusun.
 * Kolom dikerjakan dari satuan ke kiri. Penjumlahan: angka simpanan "1" kecil naik ke atas kolom berikutnya.
 * Pengurangan: angka yang dipinjami dicoret dan diganti angka kecil (5 → 4), angka satuan menjadi 10 lebih besar (1 → 11).
 * Semua gerak memakai CSS dengan jeda per elemen, jadi tanpa pengatur waktu; tombol "Putar lagi" menyalin ulang elemennya.
 *   METIQ_KOLOM.html(51, '-', 18)  // HTML siap tempel
 */
(function () {
  const PLACE = ['ones', 'tens', 'hundreds', 'thousands'], SHORT = ['S', 'P', 'R', 'Th'];
  const digits = (n, w) => String(n).padStart(w, ' ').split('').map((d) => (d === ' ' ? null : +d));
  const STEP = 2.6; // detik per kolom

  function html(a, op, b) {
    const sub = op === '-' || op === '−', res = sub ? a - b : a + b;
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || res < 0 || Math.max(a, b, res) > 9999) return '';
    const w = String(Math.max(a, b, res)).length, A = digits(a, w), B = digits(b, w), R = digits(res, w);
    const notes = [...Array(w)].map(() => []), cross = [...Array(w)].map(() => []); // per kolom: angka kecil di atas, dan coretan
    const resAt = Array(w).fill(null), cap = [], hot = [];
    let t = 0.6;
    if (!sub) {
      let carry = 0;
      for (let c = w - 1; c >= 0; c--) {
        if (A[c] === null && B[c] === null && !carry) break;
        const x = A[c] || 0, y = B[c] || 0, s = x + y + carry;
        hot.push([c, t]);
        resAt[c] = t + 1;
        const p = PLACE[w - 1 - c];
        if (s >= 10 && c > 0) {
          notes[c - 1].push({ v: 1, t: t + 1.5, carry: true });
          cap.push([t, `<b>${cap1(p)}:</b> ${sumTxt(A[c], B[c], carry)} = ${s}. Write <b>${s % 10}</b>, carry <b class="kc-hl">1</b> ${PLACE[w - c]} on top.`]);
        } else {
          cap.push([t, `<b>${cap1(p)}:</b> ${A[c] === null && B[c] === null ? 'only the carried 1 remains, write <b>1</b>.' : `${sumTxt(A[c], B[c], carry)} = <b>${s}</b>.`}`]);
        }
        carry = s >= 10 ? 1 : 0;
        t += STEP;
      }
    } else {
      const cur = A.map((d) => d || 0);
      for (let c = w - 1; c >= 0; c--) {
        if (A[c] === null || (B[c] === null && cur.slice(0, c + 1).every((v) => v === 0))) break;
        hot.push([c, t]);
        const y = B[c] || 0, p = PLACE[w - 1 - c];
        if (cur[c] < y) {
          // cari kolom kiri terdekat yang bukan 0, lalu pinjam berantai ke kanan (0 menjadi 9)
          let k = c - 1; while (k >= 0 && cur[k] === 0) k--;
          const steps = [];
          let tt = t + 0.4;
          for (let j = k; j < c; j++) {
            const nv = j === k ? cur[j] - 1 : 9;
            cross[j].push({ lvl: notes[j].length, t: tt }); notes[j].push({ v: nv, t: tt + 0.35 });
            steps.push(j === k ? `${cur[j]} ${PLACE[w - 1 - j]} is crossed out and becomes <b class="kc-hl">${nv}</b>` : `0 ${PLACE[w - 1 - j]} becomes 10, 1 is borrowed, leaving <b class="kc-hl">9</b>`);
            cur[j] = nv; tt += 0.8;
          }
          const before = cur[c]; cur[c] += 10;
          cross[c].push({ lvl: notes[c].length, t: tt }); notes[c].push({ v: cur[c], t: tt + 0.35 });
          const from = k === c - 1 ? `borrow 1 ${PLACE[w - c]}` : `${PLACE[w - c]} is empty, so borrow from ${PLACE[w - 1 - k]}`;
          cap.push([t, `<b>${cap1(p)}:</b> ${before} is less than ${y}, ${from}. ${cap1(steps.join(', '))}; ${before} ${p} becomes <b class="kc-hl">${cur[c]}</b>. ${cur[c]} − ${y} = <b>${cur[c] - y}</b>.`]);
          resAt[c] = tt + 0.9; t = tt + 0.9 + 1.4;
        } else {
          resAt[c] = t + 1;
          cap.push([t, `<b>${cap1(p)}:</b> ${B[c] === null ? `${cur[c]}, nothing to subtract, write <b>${cur[c]}</b>.` : `${cur[c]} − ${y} = <b>${cur[c] - y}</b>.`}`]);
          t += STEP;
        }
      }
      // angka nol di depan hasil tidak ditulis (mis. 105 − 98 = 7)
      for (let c = 0; c < w - 1 && R[c] === null; c++) resAt[c] = null;
    }
    const end = t + 0.2;
    cap.push([end, `The answer is <b>${res.toLocaleString('en-US')}</b>.`]);
    const lv = Math.max(1, ...notes.map((n) => n.length));
    const d = (s) => `style="animation-delay:${s.toFixed(2)}s"`;
    const col = (c) => `kc-${SHORT[w - 1 - c] === 'Th' ? 'rb' : SHORT[w - 1 - c].toLowerCase()}`;
    const head = `<div class="kc-row kc-head"><span></span>${[...Array(w)].map((_, c) => `<span class="${col(c)}">${SHORT[w - 1 - c]}</span>`).join('')}</div>`;
    const top = `<div class="kc-row kc-top" style="--lv:${lv}"><span></span>${A.map((x, c) => `<span class="kc-d ${col(c)}">${x === null ? '' : x}${cross[c].map((k) => `<i class="kc-x l${k.lvl}" ${d(k.t)}></i>`).join('')}${notes[c].map((n, i) => `<small class="kc-n l${i + 1}${n.carry ? ' carry' : ''}" ${d(n.t)}>${n.v}</small>`).join('')}</span>`).join('')}</div>`;
    const bot = `<div class="kc-row kc-bot"><span class="kc-op">${sub ? '−' : '+'}</span>${B.map((y, c) => `<span class="kc-d ${col(c)}">${y === null ? '' : y}</span>`).join('')}</div>`;
    const out = `<div class="kc-row kc-res"><span></span>${R.map((v, c) => `<span class="kc-d">${v === null || resAt[c] === null ? '' : `<b ${d(resAt[c])}>${v}</b>`}</span>`).join('')}</div>`;
    const hl = hot.map(([c, s]) => `<i class="kc-hot" style="--c:${c + 2};animation-delay:${s.toFixed(2)}s"></i>`).join('');
    return `<div class="kolom" style="--w:${w}"><div class="kc-board">${hl}${head}${top}${bot}<div class="kc-line"></div>${out}</div>
      <ol class="kc-cap">${cap.map(([s, x]) => `<li ${d(s)}>${x}</li>`).join('')}</ol><button class="link small kc-again" data-act="kolomplay">↻ Replay</button></div>`;
  }
  const cap1 = (s) => s[0].toUpperCase() + s.slice(1);
  const sumTxt = (x, y, carry) => [x, y].filter((v) => v !== null).join(' + ') + (carry ? ' + 1 (carried)' : '');

  /* ---------- Pembagian bersusun (porogapit) ----------
   * Pembagi di kiri, tanda ")" lalu bilangan yang dibagi dengan garis di atasnya, hasil bagi ditulis di atas garis.
   * Per langkah: bagi, tulis angka hasil di atas, kalikan, kurangkan, turunkan angka berikutnya (angka oranye).
   * Bila sisa + angka turunan masih lebih kecil dari pembagi, tulis 0 di hasil dan turunkan satu angka lagi.
   *   METIQ_KOLOM.bagi(541386, 9)   // animasi lengkap
   *   METIQ_KOLOM.porogapit(84, 4)  // bingkai soal dengan "?" di tempat hasil */
  const PSTEP = 3.2;
  const cell = (r, c, cls, txt, t, extra = '') => `<span class="pg-c ${cls}" style="grid-row:${r};grid-column:${c};${t != null ? `animation-delay:${t.toFixed(2)}s;` : ''}${extra}">${txt}</span>`;
  function frame(N, D, dw, w) {
    let s = '';
    D.split('').forEach((x, i) => { s += cell(2, i + 1, 'pg-dv', x); });
    s += `<span class="pg-br" style="grid-row:2;grid-column:${dw + 1}"></span>`;
    N.split('').forEach((x, i) => { s += cell(2, dw + 2 + i, 'pg-nd', x); });
    return s;
  }
  function porogapit(n, d) {
    const N = String(n), D = String(d), dw = D.length, w = N.length;
    return `<div class="pgap pg-q" style="--cols:${dw + 1 + w}"><div class="pg-board">${cell(1, dw + 2, 'pg-ask', '?', null, `grid-column:${dw + 2} / span ${w}`)}${frame(N, D, dw, w)}</div></div>`;
  }
  function bagi(n, d) {
    if (!Number.isInteger(n) || !Number.isInteger(d) || n < 1 || d < 2 || n < d || n > 9999999) return '';
    const N = String(n), D = String(d), dw = D.length, w = N.length, dig = N.split('').map(Number);
    const col = (j) => dw + 2 + j; // kolom grid untuk angka ke-j bilangan yang dibagi
    const q = Math.floor(n / d), rest = n % d;
    let body = '', cap = [], row = 3, t = 0.6;
    // ambil angka dari kiri sampai cukup untuk dibagi
    let e = 0, cur = dig[0];
    while (cur < d && e < w - 1) { e++; cur = cur * 10 + dig[e]; }
    body += `<i class="pg-hot" style="grid-row:2;grid-column:${col(0)} / ${col(e) + 1};animation-delay:${t.toFixed(2)}s"></i>`;
    if (e > 0) cap.push([t, `${N.slice(0, e)} is less than ${d}, so take ${e + 1} digits: <b>${N.slice(0, e + 1)}</b>.`]);
    let curTxt = String(cur);
    for (;;) {
      const qd = Math.floor(cur / d), p = qd * d, rem = cur - p, P = String(p);
      body += cell(1, col(e), 'pg-qd', qd, t + 0.5);
      body += cell(row, col(e) - P.length, 'pg-op', '−', t + 1.1);
      P.split('').forEach((x, i) => { body += cell(row, col(e) - P.length + 1 + i, 'pg-pr', x, t + 1.1); });
      const lw = Math.max(P.length, curTxt.length);
      body += `<i class="pg-ln" style="grid-row:${row + 1};grid-column:${col(e) - lw + 1} / ${col(e) + 1};animation-delay:${(t + 1.6).toFixed(2)}s"></i>`;
      let txt = `<b>${cur} ÷ ${d} = ${qd}</b>, write <b class="kc-hl">${qd}</b> on top. ${qd} × ${d} = ${p}, ${cur} − ${p} = <b>${rem}</b>.`;
      row += 2;
      if (e === w - 1) {
        String(rem).split('').forEach((x, i, a) => { body += cell(row, col(e) - a.length + 1 + i, 'pg-rm', x, t + 1.9); });
        cap.push([t, txt]); t += PSTEP; break;
      }
      // turunkan angka berikutnya; tulis 0 di hasil selama masih kurang dari pembagi
      let rt = rem ? String(rem) : '', tt = t + 2.1; const down = [];
      e++; cur = rem * 10 + dig[e]; down.push([e, tt]); rt += dig[e];
      const zeros = [];
      while (cur < d && e < w - 1) { body += cell(1, col(e), 'pg-qd', 0, tt + 0.5); zeros.push(cur); tt += 0.9; e++; cur = cur * 10 + dig[e]; down.push([e, tt]); rt += dig[e]; }
      rt = rt.replace(/^0+(?=\d)/, '');
      down.forEach(([j, s]) => { body += `<i class="pg-hot sm" style="grid-row:2;grid-column:${col(j)};animation-delay:${s.toFixed(2)}s"></i>`; });
      const dl = new Map(down.map(([j, s]) => [j, s]));
      rt.split('').forEach((x, i) => { const j = e - rt.length + 1 + i; body += cell(row, col(j), dl.has(j) ? 'pg-dn' : 'pg-rm', x, dl.has(j) ? dl.get(j) + 0.25 : t + 1.9); });
      txt += ` Bring down <b class="kc-hl">${dig[down[0][0]]}</b>`;
      zeros.forEach((z, i) => { txt += `: ${z} is less than ${d}, write <b class="kc-hl">0</b> on top, bring down <b class="kc-hl">${dig[down[i + 1][0]]}</b>`; });
      if (cur < d) txt += `: ${cur} is less than ${d}, write <b class="kc-hl">0</b> on top`;
      cap.push([t, txt + (cur < d && e === w - 1 ? `. Remainder <b>${cur}</b>.` : `, making <b>${cur}</b>.`)]);
      t = tt + 1.2; row += 1;
      if (cur < d) { body += cell(1, col(e), 'pg-qd', 0, t - 0.6); break; }
      curTxt = rt;
    }
    cap.push([t, `The answer is <b>${q.toLocaleString('en-US')}</b>${rest ? ` remainder <b>${rest}</b>` : ''}. Check: ${q.toLocaleString('en-US')} × ${d}${rest ? ` + ${rest}` : ''} = ${n.toLocaleString('en-US')}.`]);
    const dl = (s) => `style="animation-delay:${s.toFixed(2)}s"`;
    return `<div class="kolom pgap" style="--cols:${dw + 1 + w}"><div class="pg-board">${frame(N, D, dw, w)}${body}</div>
      <ol class="kc-cap">${cap.map(([s, x]) => `<li ${dl(s)}>${x}</li>`).join('')}</ol><button class="link small kc-again" data-act="kolomplay">↻ Replay</button></div>`;
  }

  /* ---------- Perkalian bersusun ----------
   * Pengali satu angka (23 × 9): kalikan setiap angka yang dikali dengan pengali, tulis hasilnya sejajar tempatnya
   * (3 × 9 = 27 sejajar satuan, 2 × 9 = 18 mulai kolom puluhan), lalu jumlahkan dengan angka simpanan: 27 + 180 = 207.
   * Pengali dua angka atau lebih (23 × 45): satu baris per angka pengali, angka yang disimpan ditulis kecil di atas
   * yang dikali (hilang saat baris berikutnya dimulai), baris kedua bergeser satu kolom, lalu dijumlahkan.
   *   METIQ_KOLOM.kali(23, 9) */
  const PL = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions', 'ten millions'];
  function kali(a, b) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 10 || b < 2 || a * b > 99999999) return '';
    const A = String(a), B = String(b), Rs = String(a * b), C = Math.max(Rs.length, A.length, B.length) + 1;
    const col = (k) => C - k, da = A.split('').reverse().map(Number), db = B.split('').reverse().map(Number);
    const hot = (r, c, s, dur) => `<i class="pg-hot sm" style="grid-row:${r};grid-column:${c};animation-delay:${s.toFixed(2)}s${dur ? `;animation-duration:${dur.toFixed(2)}s` : ''}"></i>`;
    let s = '', t = 0.6, row = 6;
    const cap = [], parts = [];
    da.forEach((x, k) => { s += cell(2, col(k), 'km-a', x); });
    db.forEach((x, k) => { s += cell(3, col(k), 'km-a', x); });
    s += cell(3, 1, 'km-op', '×') + `<i class="pg-ln st" style="grid-row:4;grid-column:1 / ${C + 1}"></i>`;
    if (db.length === 1) {
      const m = db[0];
      da.forEach((x, k) => {
        const p = x * m, P = String(p);
        s += hot(2, col(k), t) + hot(3, col(0), t);
        P.split('').forEach((y, i) => { s += cell(row, col(k) - P.length + 1 + i, 'km-p', y, t + 0.6); });
        cap.push([t, `<b>${cap1(PL[k])}:</b> ${x} × ${m} = <b>${p}</b>. Write ${p} in line with the ${PL[k]} being multiplied${P.length > 1 && k ? ` (digit ${P.slice(-1)} in the ${PL[k]} column)` : ''}.`]);
        parts.push([p, k]); row++; t += 2.2;
      });
    } else {
      db.forEach((m, i) => {
        let carry = 0, tt = t; const bits = [];
        const rowEnd = t + da.length * 1.2 + 0.6, last = i === db.length - 1;
        s += hot(3, col(i), t, rowEnd - t);
        da.forEach((x, k) => {
          const v = x * m + carry, cin = carry; carry = Math.floor(v / 10);
          s += hot(2, col(k), tt);
          const lastDigit = k === da.length - 1;
          const out = lastDigit ? String(v) : String(v % 10);
          out.split('').forEach((y, j) => { s += cell(row, col(k + i) - out.length + 1 + j, 'km-p', y, tt + 0.4); });
          if (!lastDigit && carry) s += last ? cell(1, col(k + 1), 'km-cy', carry, tt + 0.5) : cell(1, col(k + 1), 'km-cy blink', carry, tt + 0.5, `animation-duration:${(rowEnd - tt - 0.5).toFixed(2)}s;`);
          bits.push(`${x} × ${m}${cin ? ` + ${cin}` : ''} = ${v}${!lastDigit && carry ? `, write ${v % 10}, carry <b class="kc-hl">${carry}</b>` : ''}`);
          tt += 1.2;
        });
        cap.push([t, `<b>Multiply by the ${PL[i]} digit (${m})${i ? `, starting at the ${PL[i]} column` : ''}:</b> ${bits.join('; ')}. This row: <b>${(a * m).toLocaleString('en-US')}</b>.`]);
        parts.push([a * m, i]); row++; t = rowEnd;
      });
    }
    // jumlahkan baris-baris hasil, angka simpanan ditulis kecil di baris atas
    s += cell(row - 1, 1, 'km-op', '+', t) + `<i class="pg-ln" style="grid-row:${row};grid-column:1 / ${C + 1};animation-delay:${t.toFixed(2)}s"></i>`;
    const res = row + 1, bits = [];
    let c = 0; t += 0.5;
    const t0 = t;
    for (let k = 0; k < Rs.length; k++) {
      const terms = parts.map(([v, sh]) => { const d = String(v).split('').reverse()[k - sh]; return k >= sh && d !== undefined ? +d : null; }).filter((v) => v !== null);
      const sum = terms.reduce((x, y) => x + y, 0) + c, cin = c; c = Math.floor(sum / 10);
      s += cell(res, col(k), 'km-r', sum % 10, t + 0.3);
      if (c && k < Rs.length - 1) s += cell(5, col(k + 1), 'km-cy', c, t + 0.4);
      const expr = [...terms.map(String), ...(cin ? [`${cin} (carry)`] : [])];
      bits.push(`${PL[k]} ${expr.length > 1 || cin ? `${expr.join(' + ')}${expr.length > 1 ? ` = ${sum}` : ''}` : sum}${c && k < Rs.length - 1 ? `, write ${sum % 10}, carry <b class="kc-hl">${c}</b>` : ''}`);
      t += 1;
    }
    cap.push([t0, `<b>Add starting from the ones:</b> ${bits.join('; ')}.`]);
    cap.push([t, `The answer is <b>${(a * b).toLocaleString('en-US')}</b>.`]);
    const dl = (x) => `style="animation-delay:${x.toFixed(2)}s"`;
    return `<div class="kolom pgap kmul" style="--cols:${C}"><div class="pg-board">${s}</div>
      <ol class="kc-cap">${cap.map(([x, y]) => `<li ${dl(x)}>${y}</li>`).join('')}</ol><button class="link small kc-again" data-act="kolomplay">↻ Replay</button></div>`;
  }

  window.METIQ_KOLOM = { html, bagi, porogapit, kali };
})();
