/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — latihan fakta berpola (belajar dari lembar latihan harian seperti Kumon), tetap satu kartu soal per layar.
 * Untuk keterampilan fakta (+, −, ×, ÷), satu angka fokus dikerjakan dalam tiga tahap:
 *   1. Urut  : 6 × 1, 6 × 2, 6 × 3, … (fakta sebelumnya tampil samar di atas, supaya polanya terlihat)
 *   2. Acak  : fakta yang sama dengan urutan acak
 *   3. Bentuk lain: 6 × ? = 42, pola lompat 6, 12, 18, ?, penjumlahan berulang, sifat tukar, operasi kebalikannya
 * lalu pindah ke angka fokus berikutnya. Posisi tiap siswa per keterampilan disimpan di perangkat.
 *   METIQ_POLA.has('3E1'); METIQ_POLA.next(studentId, '3E1')  // objek soal seperti hasil gen()
 */
(function () {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const Q = '<span class="q">?</span>';
  // ks: nilai pasangan untuk angka fokus n (penjumlahan/pengurangan: bilangan yang ditambah/hasilnya; perkalian/pembagian: 1–10)
  const S = (op, ns, ks) => ns.map((n) => [op, n, ks(n)]);
  const SETS = {
    C3: S('+', [1, 2, 3, 4, 5], (n) => range(1, 10 - n)),
    D3: S('-', [1, 2, 3, 4, 5], (n) => range(1, 10 - n)),
    '2B1': [6, 7, 8, 9].flatMap((n) => [['+', n, range(2, 9)], ['-', n, range(2, 9)]]),
    '2G3': S('x', [2, 5, 10], () => range(1, 10)),
    '2G4': S('x', [3, 4], () => range(1, 10)),
    '3E1': S('x', [6, 7], () => range(1, 10)),
    '3E2': S('x', [8, 9], () => range(1, 10)),
    '3E3': S('x', [11, 12], () => range(1, 12)),
    '2H3': S('/', [2, 5, 10, 3, 4], () => range(1, 10)),
    '3F2': S('/', [6, 7, 8, 9], () => range(1, 10)),
  };
  const SYM = { '+': '+', '-': '−', x: '×', '/': '÷' };
  // fakta dasar: [teks soal tanpa "= ?", jawaban, a, b]
  const fact = (op, n, k) => (op === '+' ? [`${k} + ${n}`, k + n, k, n] : op === '-' ? [`${k + n} − ${n}`, k, k + n, n] : op === 'x' ? [`${n} × ${k}`, n * k, n, k] : [`${n * k} ÷ ${n}`, k, n * k, n]);
  const big = (t, tag, prev) => `${tag ? `<div class="pola-tag">${tag}</div>` : ''}${prev ? `<div class="pola-prev">${prev}</div>` : ''}<div class="bigeq">${t}</div>`;
  const inp = (text, answer, explain, vis, meta, tag) => ({ type: 'input', text, answer: String(answer), explain, vis, meta, pola: tag });

  function build(op, n, ks, step) {
    const f = (k) => fact(op, n, k), o = SYM[op];
    if (step.t === 'u') {
      const [t, ans, a, b] = f(step.k), i = ks.indexOf(step.k);
      const prev = ks.slice(Math.max(0, i - 2), i).map((k) => { const [pt, pa] = f(k); return `${pt} = ${pa}`; }).join('<br>');
      const why = i > 0 ? (op === 'x' ? `The pattern: each step adds ${n}. ${f(ks[i - 1])[1]} + ${n} = <b>${ans}</b>.` : op === '/' ? `The pattern: the number being divided goes up by ${n}, and the result goes up by 1. The answer is <b>${ans}</b>.` : `The pattern: each step adds 1. The answer is <b>${ans}</b>.`) : `${t} = <b>${ans}</b>.`;
      return inp(`${t} = ?`, ans, why, big(`${t} = ${Q}`, `🔢 In order · ${o} ${n} · ${i + 1}/${ks.length}`, prev), { op, a, b });
    }
    if (step.t === 'a') {
      const [t, ans, a, b] = f(step.k);
      return inp(`${t} = ?`, ans, `${t} = <b>${ans}</b>. It's the same as step ${ks.indexOf(step.k) + 1} in the in-order part.`, big(`${t} = ${Q}`, `🔀 Mixed · ${o} ${n}`), { op, a, b });
    }
    // bentuk lain dari fakta yang sama
    const k = step.k, tag = `🧩 Another form · ${o} ${n}`;
    if (op === 'x') {
      if (step.f === 0) return inp(`${n} × ? = ${n * k}`, k, `${n} × ${k} = ${n * k}, so the missing number is <b>${k}</b>.`, big(`${n} × ${Q} = ${n * k}`, tag), { kind: 'missing' });
      if (step.f === 1) { const s = R(1, Math.max(1, ks.length - 4)), row = [0, 1, 2].map((i) => n * (s + i)); return inp(`${row.join(', ')}, ?`, n * (s + 3), `Skip by ${n}s: ${row[2]} + ${n} = <b>${n * (s + 3)}</b>.`, big(`${row.join(', ')}, ${Q}`, tag), { kind: 'pattern' }); }
      if (step.f === 2) { const m = R(2, 4); return inp(`${Array(m).fill(n).join(' + ')} = ?`, n * m, `${n} added ${m} times is the same as ${m} × ${n} = <b>${n * m}</b>.`, big(`${Array(m).fill(n).join(' + ')} = ${Q}`, tag), { op: 'x', a: m, b: n }); }
      return inp(`${k} × ${n} = ?`, n * k, `The order of multiplication can be swapped: ${k} × ${n} = ${n} × ${k} = <b>${n * k}</b>.`, big(`${k} × ${n} = ${Q}`, tag), { op: 'x', a: k, b: n });
    }
    if (op === '/') {
      if (step.f === 0) return inp(`${n} × ? = ${n * k}`, k, `Division is the inverse of multiplication: ${n} × ${k} = ${n * k}, so <b>${k}</b>.`, big(`${n} × ${Q} = ${n * k}`, tag), { kind: 'missing' });
      if (step.f === 1) return inp(`${n * k} ÷ ? = ${k}`, n, `${n * k} divided by ${n} is ${k}, so the divisor is <b>${n}</b>.`, big(`${n * k} ÷ ${Q} = ${k}`, tag), { kind: 'missing' });
      if (step.f === 2) return inp(`${n * k} ÷ ${k} = ?`, n, `From ${n} × ${k} = ${n * k}: ${n * k} ÷ ${k} = <b>${n}</b>.`, big(`${n * k} ÷ ${k} = ${Q}`, tag), { op: '/', a: n * k, b: k });
      return inp(`? ÷ ${n} = ${k}`, n * k, `${n} × ${k} = <b>${n * k}</b>, so ${n * k} ÷ ${n} = ${k}.`, big(`${Q} ÷ ${n} = ${k}`, tag), { kind: 'missing' });
    }
    if (op === '+') {
      if (step.f === 0) return inp(`? + ${n} = ${k + n}`, k, `${k} + ${n} = ${k + n}, so the missing number is <b>${k}</b>.`, big(`${Q} + ${n} = ${k + n}`, tag), { kind: 'missing' });
      if (step.f === 1) return inp(`${n} + ${k} = ?`, n + k, `The order of addition can be swapped: ${n} + ${k} = ${k} + ${n} = <b>${n + k}</b>.`, big(`${n} + ${k} = ${Q}`, tag), { op: '+', a: n, b: k });
      if (step.f === 2) return inp(`${k + n} − ${n} = ?`, k, `Subtraction is the inverse of addition: ${k} + ${n} = ${k + n}, so ${k + n} − ${n} = <b>${k}</b>.`, big(`${k + n} − ${n} = ${Q}`, tag), { op: '-', a: k + n, b: n });
      return inp(`${k} + ? = ${k + n}`, n, `${k} + ${n} = ${k + n}, so the missing number is <b>${n}</b>.`, big(`${k} + ${Q} = ${k + n}`, tag), { kind: 'missing' });
    }
    // pengurangan
    if (step.f === 0) return inp(`? − ${n} = ${k}`, k + n, `${k} + ${n} = <b>${k + n}</b>, so ${k + n} − ${n} = ${k}.`, big(`${Q} − ${n} = ${k}`, tag), { kind: 'missing' });
    if (step.f === 1) return inp(`${k} + ${n} = ?`, k + n, `Addition is the inverse of subtraction: ${k} + ${n} = <b>${k + n}</b>.`, big(`${k} + ${n} = ${Q}`, tag), { op: '+', a: k, b: n });
    if (step.f === 2) return inp(`${k + n} − ${k} = ?`, n, `${k + n} − ${n} = ${k}, so ${k + n} − ${k} = <b>${n}</b>.`, big(`${k + n} − ${k} = ${Q}`, tag), { op: '-', a: k + n, b: k });
    return inp(`${k + n} − ? = ${k}`, n, `${k + n} − ${n} = ${k}, so the missing number is <b>${n}</b>.`, big(`${k + n} − ${Q} = ${k}`, tag), { kind: 'missing' });
  }

  // antrean satu angka fokus: urut, acak (paling banyak 8), bentuk lain (4)
  const mix = (ks) => { const m = shuffle(ks.slice()).slice(0, 8); if (m[0] === ks[ks.length - 1]) m.push(m.shift()); return m; };
  const queue = (ks) => [...ks.map((k) => ({ t: 'u', k })), ...mix(ks).map((k) => ({ t: 'a', k })), ...shuffle([0, 1, 2, 3]).map((f) => ({ t: 'f', f, k: ks[R(0, ks.length - 1)] }))];
  const KEY = 'metiq_pola';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const keep = (all) => { try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* mode privat */ } };

  function next(sid, skill) {
    const sets = SETS[skill]; if (!sets) return null;
    const all = load(), id = sid + ':' + skill;
    let st = all[id];
    if (!st || !st.q || st.i >= st.q.length || st.si >= sets.length) {
      const si = st ? (st.i >= (st.q || []).length ? st.si + 1 : st.si) % sets.length : 0;
      st = { si, i: 0, q: queue(sets[si][2]) };
    }
    const [op, n, ks] = sets[st.si], q = build(op, n, ks, st.q[st.i]);
    st.i++; all[id] = st; keep(all);
    return q;
  }
  /* ---------- Seri SMP–SMA (dari js/pola-hs.js): soalnya dibuat oleh setiap fokus ---------- */
  const SERIES = {};
  const queueS = (f) => { const n = f.items.length, order = shuffle(range(0, n - 1)).slice(0, 6); if (order[0] === n - 1) order.push(order.shift()); return [...range(0, n - 1).map((i) => ({ t: 'u', i })), ...order.map((i) => ({ t: 'a', i })), ...shuffle(range(0, f.forms.length - 1)).map((i) => ({ t: 'f', i }))]; };
  function buildS(f, s) {
    let q, head;
    if (s.t === 'f') { q = f.forms[s.i](); head = `🧩 Another form · ${f.label}`; }
    else { q = f.make(f.items[s.i]); head = s.t === 'u' ? `🔢 In order · ${f.label} · ${s.i + 1}/${f.items.length}` : `🔀 Mixed · ${f.label}`; }
    let prev = '';
    if (s.t === 'u' && s.i > 0) {
      prev = f.items.slice(Math.max(0, s.i - 2), s.i).map(f.show).join('<br>');
      // di penjelasan, baris-baris pola muncul satu per satu sebelum langkahnya
      const rows = f.items.slice(Math.max(0, s.i - 3), s.i + 1), t0 = rows.length * 0.7 + 0.3;
      q.explain = `<div class="pola-rows"><b>See the pattern</b>${rows.map((x, k) => `<div class="${k === rows.length - 1 ? 'now' : ''}" style="--t:${(k * 0.7).toFixed(1)}s">${f.show(x)}</div>`).join('')}</div><div style="--t0:${t0.toFixed(1)}s">${q.explain}</div>`;
    }
    q.vis = `<div class="pola-tag">${head}</div>${prev ? `<div class="pola-prev">${prev}</div>` : ''}${q.vis || ''}`; q.pola = head;
    return q;
  }
  function nextS(sid, skill) {
    const sets = SERIES[skill](), all = load(), id = sid + ':' + skill;
    let st = all[id];
    if (!st || !st.q || st.i >= st.q.length || st.si >= sets.length) { const si = st ? (st.si + 1) % sets.length : 0; st = { si, i: 0, q: queueS(sets[si]) }; }
    const q = buildS(sets[st.si], st.q[st.i]);
    st.i++; all[id] = st; keep(all);
    return q;
  }
  window.METIQ_POLA = { has: (skill) => !!SETS[skill] || !!SERIES[skill], next: (sid, skill) => (SERIES[skill] ? nextS(sid, skill) : next(sid, skill)), addSeries: (id, fn) => { SERIES[id] = fn; } };
})();
