/* Metiq — animasi penjumlahan dan pengurangan bersusun.
 * Kolom dikerjakan dari satuan ke kiri. Penjumlahan: angka simpanan "1" kecil naik ke atas kolom berikutnya.
 * Pengurangan: angka yang dipinjami dicoret dan diganti angka kecil (5 → 4), angka satuan menjadi 10 lebih besar (1 → 11).
 * Semua gerak memakai CSS dengan jeda per elemen, jadi tanpa pengatur waktu; tombol "Putar lagi" menyalin ulang elemennya.
 *   METIQ_KOLOM.html(51, '-', 18)  // HTML siap tempel
 */
(function () {
  const PLACE = ['satuan', 'puluhan', 'ratusan', 'ribuan'], SHORT = ['S', 'P', 'R', 'Rb'];
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
          cap.push([t, `<b>${cap1(p)}:</b> ${sumTxt(A[c], B[c], carry)} = ${s}. Tulis <b>${s % 10}</b>, simpan <b class="kc-hl">1</b> ${PLACE[w - c]} di atas.`]);
        } else {
          cap.push([t, `<b>${cap1(p)}:</b> ${A[c] === null && B[c] === null ? 'tinggal simpanan 1, tulis <b>1</b>.' : `${sumTxt(A[c], B[c], carry)} = <b>${s}</b>.`}`]);
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
            steps.push(j === k ? `${cur[j]} ${PLACE[w - 1 - j]} dicoret menjadi <b class="kc-hl">${nv}</b>` : `0 ${PLACE[w - 1 - j]} menjadi 10, dipinjam 1, tinggal <b class="kc-hl">9</b>`);
            cur[j] = nv; tt += 0.8;
          }
          const before = cur[c]; cur[c] += 10;
          cross[c].push({ lvl: notes[c].length, t: tt }); notes[c].push({ v: cur[c], t: tt + 0.35 });
          const from = k === c - 1 ? `pinjam 1 ${PLACE[w - c]}` : `${PLACE[w - c]} kosong, jadi pinjam dari ${PLACE[w - 1 - k]}`;
          cap.push([t, `<b>${cap1(p)}:</b> ${before} kurang dari ${y}, ${from}. ${cap1(steps.join(', '))}; ${before} ${p} menjadi <b class="kc-hl">${cur[c]}</b>. ${cur[c]} − ${y} = <b>${cur[c] - y}</b>.`]);
          resAt[c] = tt + 0.9; t = tt + 0.9 + 1.4;
        } else {
          resAt[c] = t + 1;
          cap.push([t, `<b>${cap1(p)}:</b> ${B[c] === null ? `${cur[c]}, tidak ada yang dikurangi, tulis <b>${cur[c]}</b>.` : `${cur[c]} − ${y} = <b>${cur[c] - y}</b>.`}`]);
          t += STEP;
        }
      }
      // angka nol di depan hasil tidak ditulis (mis. 105 − 98 = 7)
      for (let c = 0; c < w - 1 && R[c] === null; c++) resAt[c] = null;
    }
    const end = t + 0.2;
    cap.push([end, `Jawabannya <b>${res.toLocaleString('id-ID')}</b>.`]);
    const lv = Math.max(1, ...notes.map((n) => n.length));
    const d = (s) => `style="animation-delay:${s.toFixed(2)}s"`;
    const col = (c) => `kc-${SHORT[w - 1 - c] === 'Rb' ? 'rb' : SHORT[w - 1 - c].toLowerCase()}`;
    const head = `<div class="kc-row kc-head"><span></span>${[...Array(w)].map((_, c) => `<span class="${col(c)}">${SHORT[w - 1 - c]}</span>`).join('')}</div>`;
    const top = `<div class="kc-row kc-top" style="--lv:${lv}"><span></span>${A.map((x, c) => `<span class="kc-d ${col(c)}">${x === null ? '' : x}${cross[c].map((k) => `<i class="kc-x l${k.lvl}" ${d(k.t)}></i>`).join('')}${notes[c].map((n, i) => `<small class="kc-n l${i + 1}${n.carry ? ' carry' : ''}" ${d(n.t)}>${n.v}</small>`).join('')}</span>`).join('')}</div>`;
    const bot = `<div class="kc-row kc-bot"><span class="kc-op">${sub ? '−' : '+'}</span>${B.map((y, c) => `<span class="kc-d ${col(c)}">${y === null ? '' : y}</span>`).join('')}</div>`;
    const out = `<div class="kc-row kc-res"><span></span>${R.map((v, c) => `<span class="kc-d">${v === null || resAt[c] === null ? '' : `<b ${d(resAt[c])}>${v}</b>`}</span>`).join('')}</div>`;
    const hl = hot.map(([c, s]) => `<i class="kc-hot" style="--c:${c + 2};animation-delay:${s.toFixed(2)}s"></i>`).join('');
    return `<div class="kolom" style="--w:${w}"><div class="kc-board">${hl}${head}${top}${bot}<div class="kc-line"></div>${out}</div>
      <ol class="kc-cap">${cap.map(([s, x]) => `<li ${d(s)}>${x}</li>`).join('')}</ol><button class="link small kc-again" data-act="kolomplay">↻ Putar lagi</button></div>`;
  }
  const cap1 = (s) => s[0].toUpperCase() + s.slice(1);
  const sumTxt = (x, y, carry) => [x, y].filter((v) => v !== null).join(' + ') + (carry ? ' + 1 (simpanan)' : '');

  window.METIQ_KOLOM = { html };
})();
