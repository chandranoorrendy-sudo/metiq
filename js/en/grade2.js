/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Kurikulum Matematika Kelas 2
 * Disusun dari daftar keterampilan IXL kelas 2 dan alur Singapore Math (Primary 2A/2B):
 * bilangan sampai 1.000, penjumlahan/pengurangan bersusun dengan menyimpan dan meminjam,
 * perkalian dan pembagian 2, 3, 4, 5, 10, model batang untuk soal cerita dua langkah,
 * pecahan, pengukuran metrik (cm, m, kg, g, liter), waktu, uang Rupiah, dan piktogram berskala.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, range, rp, numOpts, kata, V, inp, ch, compareQ, NAMA, BULAN, two } = C.kit;
  const fmt = (n) => n.toLocaleString('en-US');
  const uniq = (arr) => [...new Set(arr.map(String))];
  const opts4 = (ans, cands) => shuffle(uniq([ans, ...shuffle(cands.filter((x) => String(x) !== String(ans)))]).slice(0, 4));
  const stack = (a, op, b) => `<div class="stack"><span>${a}</span><span>${op} ${b}</span><span class="line">?</span></div>`;

  Object.assign(C.TAGS, {
    'tanda-sama-dengan': { label: 'Thinking "=" means "the answer is"', tip: 'The = sign means both sides have the same value, like a balanced scale. Work out the left side first, then find the number that makes the right side equal.' },
    'kali-jumlah': { label: 'Adding when you should multiply', tip: '3 × 4 means 3 groups of 4, not 3 + 4. Draw the groups or use repeated addition: 4 + 4 + 4.' },
    'jam-menit': { label: 'Reading clock numbers as minutes', tip: 'The long hand at 4 means 20 minutes (4 × 5). Practice skip counting by 5s while pointing at the clock numbers.' },
    'pecahan': { label: 'Confused writing fractions', tip: 'The bottom number (denominator) = total parts. The top number (numerator) = shaded parts.' },
    'pecahan-satuan': { label: 'Thinking a big denominator means a big fraction', tip: 'Cut a cake into 2, then into 4: the more pieces, the smaller each one. So 1/2 is larger than 1/4.' },
    'skala': { label: 'Forgetting the pictograph scale', tip: 'Read the pictograph key (e.g. each picture = 2 children). Count the pictures, then multiply by the value of one picture.' },
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
    io(pairs) { return `<table class="io"><tr><th>Log in</th>${pairs.map((p) => `<td>${p[0]}</td>`).join('')}</tr><tr><th>Log out</th>${pairs.map((p) => `<td class="${p[1] === '?' ? 'q' : ''}">${p[1]}</td>`).join('')}</tr></table>`; },
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
  const FR = { 2: 'one half', 3: 'one third', 4: 'one quarter', 6: 'one sixth', 8: 'one eighth' };
  const hasBorrow = (a, b) => { const da = String(a).split('').reverse(), db = String(b).split('').reverse(); return db.some((d, i) => +d > +da[i]); };
  const hasCarry = (a, b) => { const da = String(a).split('').reverse(), db = String(b).split('').reverse(); return da.some((d, i) => +d + +(db[i] || 0) >= 10); };

  const UNITS = [
    {
      id: '2A', grade: 2, name: 'Numbers to 1,000', icon: '🔢', color: '#ff7a59',
      sg: '2A · Numbers to 1,000', ixl: 'A, B, C, D, E, L', km: 'Numbers (CP Phase A to 100; to 1,000 is an extension)',
      tip: 'Use play money Rp100, Rp10, and Rp1 (or number cards) to show hundreds, tens, and ones.',
      skills: [
        { id: '2A1', name: 'Hundreds, tens, and ones', gen() { const h = r(1, 9), t = r(0, 9), o = r(0, 9), n = h * 100 + t * 10 + o; return inp('What number is shown?', n, `${h} hundreds = ${h * 100}, ${t} tens = ${t * 10}, ${o} ones = ${o}. The total is <b>${n}</b>.`, { vis: W.blocks3(h, t, o), meta: { kind: 'place' } }); } },
        { id: '2A2', name: 'Digit value', gen() { const d = shuffle(range(1, 9)).slice(0, 3), n = d[0] * 100 + d[1] * 10 + d[2]; const pos = r(0, 2), dig = d[pos], val = dig * [100, 10, 1][pos]; const tags = {}; if (pos < 2) tags[dig] = 'nilai-tempat'; return ch(`In the number <b>${n}</b>, what is the value of the digit ${dig}?`, opts4(val, [dig, dig * 10, dig * 100]), val, `The digit ${dig} is in the ${['hundreds', 'tens', 'ones'][pos]} place, so its value is <b>${val}</b>.`, { optionTags: tags }); } },
        { id: '2A3', name: 'Expanded form', gen() { const h = r(1, 9), t = r(0, 9), o = r(0, 9), n = h * 100 + t * 10 + o; if (Math.random() < 0.5) return inp(`${h * 100} + ${t * 10} + ${o} = ?`, n, `${h * 100} + ${t * 10} + ${o} = <b>${n}</b>. Write the hundreds digit, the tens, then the ones.`, { meta: { kind: 'place' } }); return inp(`${n} = ${h * 100} + ? + ${o}`, t * 10, `${n} is made of ${h} hundreds, ${t} tens, ${o} ones. ${t} tens = <b>${t * 10}</b>.`, { optionTags: {}, meta: { kind: 'place' } }); } },
        { id: '2A4', name: 'Number names to 1,000', gen() { const n = r(100, 999); const cand = [n + 10, n - 10, n + 100 <= 999 ? n + 100 : n - 100, n + 1, Number(String(n).split('').reverse().join(''))].filter((x) => x >= 100 && x <= 999); if (Math.random() < 0.5) return ch(`Which number is read "<b>${kata(n)}</b>"?`, opts4(n, cand), n, `"${kata(n)}" is written <b>${n}</b>.`, { speak: `Which number is read ${kata(n)}?` }); const o = opts4(n, cand); return ch(`How do you read ${n}?`, o.map((x) => kata(+x)), kata(n), `${n} is read as <b>${kata(n)}</b>.`, { vis: V.big(n) }); } },
        { id: '2A5', name: 'Comparing numbers to 1,000', gen() { const a = r(100, 999); const b = Math.random() < 0.5 ? Math.floor(a / 100) * 100 + r(0, 99) : r(100, 999); return compareQ(a, b); } },
        { id: '2A6', name: 'Ordering numbers to 1,000', gen() { const base = r(1, 8) * 100; const nums = uniq([base + r(0, 99), base + r(0, 99), r(100, 999)]).map(Number); while (nums.length < 3) nums.push(r(100, 999)); const asc = Math.random() < 0.6; const sorted = nums.slice().sort((a, b) => (asc ? a - b : b - a)); const ok = sorted.join(', '); const perms = [[0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map((p) => p.map((i) => sorted[i]).join(', ')); return ch(`Order them starting from the ${asc ? 'smallest' : 'largest'}.`, opts4(ok, perms), ok, `Compare the hundreds first, then the tens, then the ones. The order is <b>${ok}</b>.`, { vis: V.seq(nums) }); } },
        { id: '2A7', name: 'Skip counting by 5, 10, and 100', gen() { const step = pick([5, 10, 100, -10, -100, 5]); const len = 5; let start; if (step > 0) start = Math.abs(step) * r(0, Math.floor((1000 - step * (len - 1)) / step)); else start = Math.abs(step) * r(len - 1, Math.floor(1000 / -step)); if (Math.abs(step) === 10 && Math.random() < 0.5) start += r(1, 9); const seq = range(0, len - 1).map((i) => start + i * step); if (seq.some((x) => x < 0 || x > 1000)) return C.SKILLS['2A7'].gen(); const k = r(1, len - 1); return inp(`Skip count by ${Math.abs(step)}s ${step > 0 ? 'forward' : 'backward'}. What number is missing?`, seq[k], `Each step ${step > 0 ? 'increases' : 'decreases'} ${Math.abs(step)}: ${seq.join(', ')}. The answer is <b>${seq[k]}</b>.`, { log: seq.map((v, i) => (i === k ? '?' : v)).join(', '), vis: V.seq(seq.map((v, i) => (i === k ? '?' : v))), meta: { kind: 'seq' } }); } },
        { id: '2A8', name: 'Even and odd', gen() { if (Math.random() < 0.35) { const n = r(2, 16); const ev = n % 2 === 0 ? 'even' : 'odd'; return ch('Is the number of stars even or odd?', ['even', 'odd'], ev, `Pair the stars in twos. ${ev === 'even' ? 'Every star has a partner' : 'One star has no partner'}, so ${n} is an <b>${ev}</b> number.`, { vis: `<div class="pairs">${'<span>⭐⭐</span>'.repeat(Math.floor(n / 2))}${n % 2 ? '<span>⭐</span>' : ''}</div>` }); } const n = r(1, 999); const ev = n % 2 === 0 ? 'even' : 'odd'; return ch(`Is <b>${n}</b> even or odd?`, ['even', 'odd'], ev, `Look at the ones digit: ${n % 10}. Ones digits 0, 2, 4, 6, 8 mean even; 1, 3, 5, 7, 9 mean odd. So ${n} is <b>${ev}</b>.`, { vis: V.big(n) }); } },
        { id: '2A9', name: 'Number lines to 1,000', gen() { if (Math.random() < 0.5) { const m = r(1, 9) * 100; return inp('What number does the arrow point to?', m, `Each mark adds 100. The arrow points to <b>${m}</b>.`, { vis: W.nl(0, 1000, 100, m), meta: { kind: 'seq' } }); } const base = r(1, 9) * 100, m = base + r(1, 9) * 10; return inp('What number does the arrow point to?', m, `The number line starts at ${base} and each mark adds 10. The arrow points to <b>${m}</b>.`, { vis: W.nl(base, base + 100, 10, m), meta: { kind: 'seq' } }); } },
      ],
    },
    {
      id: '2B', grade: 2, name: 'Number facts and equality', icon: '⚖️', color: '#1fbf9f',
      sg: '2A · Mental Calculation (Addition and Subtraction)', ixl: 'F, G, H, I, J, Y', km: 'Numbers; Algebra (equality of two number sentences)',
      tip: 'Play "quick cards" for 5 minutes a day: show 7 + 8, and your child answers before the count of 3.',
      skills: [
        { id: '2B1', name: 'Addition and subtraction facts to 20', gen() { if (Math.random() < 0.5) { const a = r(2, 9), b = r(2, 9); return inp(`${a} + ${b} = ?`, a + b, `${a} + ${b} = <b>${a + b}</b>.${a + b > 10 ? ` Make 10 first: ${Math.max(a, b)} + ${10 - Math.max(a, b)} = 10, with ${a + b - 10} left over.` : ''}`, { vis: V.big(`${a} + ${b} = <span class="q">?</span>`), meta: { op: '+', a, b } }); } const a = r(11, 18), b = r(a - 9, 9); return inp(`${a} − ${b} = ?`, a - b, `Think addition: ${b} + ? = ${a}. The answer is <b>${a - b}</b>.`, { vis: V.big(`${a} − ${b} = <span class="q">?</span>`), meta: { op: '-', a, b } }); } },
        { id: '2B2', name: 'Balancing equations', gen() { const a = r(3, 12), b = r(2, 9), tot = a + b; let c = r(1, tot - 1); if (c === a || c === b) c = Math.max(1, c - 1); const ans = tot - c; if (Math.random() < 0.6) return inp(`${a} + ${b} = ? + ${c}`, ans, `Work out the left side: ${a} + ${b} = ${tot}. The right side must be ${tot} too: ? + ${c} = ${tot}, so ? = <b>${ans}</b>.`, { vis: V.big(`${a} + ${b} = <span class="q">?</span> + ${c}`), meta: { kind: 'balance', total: tot } }); const x = r(12, 20), y = r(2, 9), d = x - y; const k = r(1, d - 1 || 1); return inp(`${x} − ${y} = ${k} + ?`, d - k, `Left side: ${x} − ${y} = ${d}. So ${k} + ? = ${d}, ? = <b>${d - k}</b>.`, { vis: V.big(`${x} − ${y} = ${k} + <span class="q">?</span>`), meta: { kind: 'balance', total: d } }); } },
        { id: '2B3', name: 'Input and output tables', gen() { const k = r(2, 9), plus = Math.random() < 0.6; const ins = shuffle(range(plus ? 1 : k + 1, plus ? 12 : 20)).slice(0, 4).sort((a, b) => a - b); const outs = ins.map((x) => (plus ? x + k : x - k)); const rule = (plus ? '+' : '−') + ' ' + k; if (Math.random() < 0.5) { const cands = [`+ ${k}`, `− ${k}`, `+ ${k + 1}`, `− ${k - 1 || k + 2}`, `+ ${k - 1 || k + 2}`]; return ch('What is the rule of this table?', opts4(rule, cands), rule, `${ins[0]} becomes ${outs[0]}: ${plus ? 'increases' : 'decreases'} ${k}. The rule is <b>${rule}</b>.`, { vis: W.io(ins.map((x, i) => [x, outs[i]])) }); } const j = r(1, 3); return inp('What is the missing number?', outs[j], `The rule is ${rule}: ${ins[0]} → ${outs[0]}. So ${ins[j]} ${rule} = <b>${outs[j]}</b>.`, { vis: W.io(ins.map((x, i) => [x, i === j ? '?' : outs[i]])), meta: { op: plus ? '+' : '-', a: ins[j], b: k } }); } },
        { id: '2B4', name: 'Adding three or four numbers', gen() { const n = pick([3, 4]); const xs = range(1, n).map(() => r(1, 9)); const s = xs.reduce((a, b) => a + b, 0); return inp(`${xs.join(' + ')} = ?`, s, `Find pairs of 10 or doubles first, then add the rest. ${xs.join(' + ')} = <b>${s}</b>.`, { vis: V.big(`${xs.join(' + ')} = <span class="q">?</span>`) }); } },
      ],
    },
    {
      id: '2C', grade: 2, name: 'Addition to 200', icon: '➕', color: '#00b894',
      sg: '2A · Addition (with renaming)', ixl: 'M, N', km: 'Numbers',
      tip: 'When adding vertically, start with the ones. If the ones add up to 10 or more, write the ones and carry 1 to the tens column.',
      skills: [
        { id: '2C1', name: 'Adding two-digit numbers with regrouping', gen() { const o1 = r(1, 9), o2 = r(10 - o1, 9), t1 = r(1, 7), t2 = r(1, 8 - t1); const a = t1 * 10 + o1, b = t2 * 10 + o2; return inp(`${a} + ${b} = ?`, a + b, `Ones: ${o1} + ${o2} = ${o1 + o2}, write ${(o1 + o2) % 10} and carry 1. Tens: ${t1} + ${t2} + 1 = ${t1 + t2 + 1}. The answer is <b>${a + b}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: true } }); } },
        { id: '2C2', name: 'Breaking numbers apart to add', gen() { const a = r(21, 69), t = r(1, 2), o = r(1, 9), b = t * 10 + o; if (Math.random() < 0.5) return inp(`${a} + ${b} = ${a} + ? + ${o}`, t * 10, `${b} breaks into ${t * 10} and ${o}. The answer is <b>${t * 10}</b>.`, { vis: V.bond(b, '?', o), meta: { kind: 'place' } }); return inp(`${a} + ${b} = ?`, a + b, `Break ${b} into ${t * 10} + ${o}. ${a} + ${t * 10} = ${a + t * 10}, then ${a + t * 10} + ${o} = <b>${a + b}</b>.`, { vis: V.bond(b, t * 10, o), meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } },
        { id: '2C3', name: 'Compensation strategy (+9, +19)', gen() { const a = r(21, 79), k = pick([9, 19, 29, 8, 18]); const up = Math.ceil(k / 10) * 10, diff = up - k; if (a + k > 100) return C.SKILLS['2C3'].gen(); if (Math.random() < 0.5) return inp(`${a} + ${k} = ${a} + ${up} − ?`, diff, `${k} = ${up} − ${diff}. Add ${up} first, then subtract ${diff}. The answer is <b>${diff}</b>.`, { vis: V.big(`${a} + ${k} = ${a} + ${up} − <span class="q">?</span>`) }); return inp(`${a} + ${k} = ?`, a + k, `Easier: ${a} + ${up} = ${a + up}, then subtract ${diff}: ${a + up} − ${diff} = <b>${a + k}</b>.`, { vis: V.big(`${a} + ${k} = <span class="q">?</span>`), meta: { op: '+', a, b: k, regroup: hasCarry(a, k) } }); } },
        { id: '2C4', name: 'Adding three two-digit numbers', gen() { const xs = [r(10, 49), r(10, 49), r(10, 40)]; const s = xs.reduce((a, b) => a + b, 0); return inp(`${xs.join(' + ')} = ?`, s, `Add the ones: ${xs.map((x) => x % 10).join(' + ')} = ${xs.reduce((a, x) => a + (x % 10), 0)}. Then the tens. The answer is <b>${s}</b>.`, { vis: `<div class="stack"><span>${xs[0]}</span><span>${xs[1]}</span><span>+ ${xs[2]}</span><span class="line">?</span></div>` }); } },
        { id: '2C5', name: 'Adding to 200', gen() { const a = r(45, 99), b = r(Math.max(10, 101 - a), 99); return inp(`${a} + ${b} = ?`, a + b, `Ones: ${a % 10} + ${b % 10}. Tens: ${Math.floor(a / 10)} + ${Math.floor(b / 10)}${hasCarry(a, b) ? ' + carried' : ''}. The result is more than 100: <b>${a + b}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } },
      ],
    },
    {
      id: '2D', grade: 2, name: 'Subtraction to 100', icon: '➖', color: '#0984e3',
      sg: '2A · Subtraction (with renaming)', ixl: 'O, P, Q', km: 'Numbers',
      tip: 'When the top ones digit is smaller, "borrow" 1 ten: 52 − 27 → 4 tens and 12 ones, then 12 − 7 = 5.',
      skills: [
        { id: '2D1', name: 'Two digits minus one digit (borrowing)', gen() { const t = r(2, 9), o = r(0, 8), a = t * 10 + o, b = r(o + 1, 9); return inp(`${a} − ${b} = ?`, a - b, `${o} is smaller than ${b}, so borrow 1 ten: ${o + 10} − ${b} = ${o + 10 - b}. The tens are now ${t - 1}. The answer is <b>${a - b}</b>.`, { vis: W.blocks3(0, t, o), meta: { op: '-', a, b, regroup: true } }); } },
        { id: '2D2', name: 'Subtracting two-digit numbers with borrowing', gen() { const t1 = r(3, 9), t2 = r(1, t1 - 1), o1 = r(0, 8), o2 = r(o1 + 1, 9); const a = t1 * 10 + o1, b = t2 * 10 + o2; return inp(`${a} − ${b} = ?`, a - b, `Ones: ${o1} < ${o2}, borrow 1 ten → ${o1 + 10} − ${o2} = ${o1 + 10 - o2}. Tens: ${t1 - 1} − ${t2} = ${t1 - 1 - t2}. The answer is <b>${a - b}</b>.`, { vis: stack(a, '−', b), meta: { op: '-', a, b, regroup: true } }); } },
        { id: '2D3', name: 'Counting up to subtract', gen() { const b = r(21, 68), a = r(b + 12, 95); const toTen = Math.ceil(b / 10) * 10; return inp(`${a} − ${b} = ?`, a - b, `Count up from ${b}: getting to ${toTen} takes ${toTen - b}, from ${toTen} to ${a} takes ${a - toTen}. ${toTen - b} + ${a - toTen} = <b>${a - b}</b>.`, { vis: W.nl(Math.floor(b / 10) * 10, Math.ceil(a / 10) * 10, 10), meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
        { id: '2D4', name: 'Relating addition and subtraction', gen() { const a = r(15, 60), b = r(11, 39), c = a + b; return inp(`If ${a} + ${b} = ${c}, then ${c} − ${b} = ?`, a, `Addition and subtraction are opposites. ${c} − ${b} = <b>${a}</b>.`, { vis: V.bond(c, a, b), meta: { op: '-', a: c, b } }); } },
      ],
    },
    {
      id: '2E', grade: 2, name: 'Addition and subtraction to 1,000', icon: '🚀', color: '#66ffdb',
      sg: '2A · Addition and Subtraction within 1,000', ixl: 'S, T, U, V, W', km: 'Enrichment (CP Phase B)',
      tip: 'Write problems neatly in hundreds, tens, and ones columns. Grid paper helps.',
      skills: [
        { id: '2E1', name: 'Adding and subtracting 10 or 100', gen() { const n = r(110, 889), k = pick([10, 100]), plus = Math.random() < 0.5; const ans = plus ? n + k : n - k; return inp(`${n} ${plus ? '+' : '−'} ${k} = ?`, ans, `${k === 10 ? 'The tens digit' : 'The hundreds digit'} ${plus ? 'increases' : 'decreases'} 1, the other digits stay the same: <b>${ans}</b>.`, { vis: V.big(`${n} ${plus ? '+' : '−'} ${k} = <span class="q">?</span>`), meta: { op: plus ? '+' : '-', a: n, b: k } }); } },
        { id: '2E2', name: 'Adding and subtracting hundreds or tens', gen() { const n = r(120, 699); if (Math.random() < 0.5) { const k = r(1, Math.floor((999 - n) / 100)) * 100; return inp(`${n} + ${k} = ?`, n + k, `${k / 100} hundreds are added to ${Math.floor(n / 100)} hundreds. The answer is <b>${n + k}</b>.`, { meta: { op: '+', a: n, b: k } }); } const t = Math.floor((n % 100) / 10); const k = (t > 0 ? r(1, t) : 0) * 10 || 100; return inp(`${n} − ${k} = ?`, n - k, `Subtract ${k} from ${n}: <b>${n - k}</b>.`, { meta: { op: '-', a: n, b: k } }); } },
        { id: '2E3', name: 'Adding three-digit numbers (regrouping)', gen() { let a, b; do { a = r(105, 789); b = r(102, 999 - a); } while (!hasCarry(a, b) || a + b > 999); return inp(`${a} + ${b} = ?`, a + b, `Add the ones, the tens, then the hundreds. If a column adds up to 10 or more, carry 1 to the next column. The answer is <b>${a + b}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: true } }); } },
        { id: '2E4', name: 'Subtracting three-digit numbers (borrowing)', gen() { let a, b; do { a = r(300, 999); b = r(101, a - 50); } while (!hasBorrow(a, b) || a % 100 === 0); return inp(`${a} − ${b} = ?`, a - b, `Start with the ones. If the top digit is smaller, borrow 1 from the column to its left. The answer is <b>${a - b}</b>.`, { vis: stack(a, '−', b), meta: { op: '-', a, b, regroup: true } }); } },
        { id: '2E5', name: 'Subtracting across zero', gen() { const h = r(2, 9), a = h * 100 + pick([0, 0, r(1, 9)]), b = r(101, a - 11); if (!hasBorrow(a, b)) return C.SKILLS['2E5'].gen(); return inp(`${a} − ${b} = ?`, a - b, `The tens digit of ${a} is 0, so borrow from the hundreds: ${h} hundreds → ${h - 1} hundreds and 10 tens, then borrow 1 ten for the ones. The answer is <b>${a - b}</b>.`, { vis: stack(a, '−', b), meta: { op: '-', a, b, regroup: true } }); } },
      ],
    },
    {
      id: '2F', grade: 2, name: 'Word problems with bar models', icon: '📘', color: '#00cec9',
      sg: '2A/2B · Word Problems (bar model, 1–2 steps)', ixl: 'K, R, W', km: 'Numbers',
      tip: 'Ask your child to draw a bar for each word problem: which is the whole, and which are the parts.',
      skills: [
        { id: '2F1', name: 'One-step word problems', gen() { const [n1] = two(); if (Math.random() < 0.5) { const a = r(120, 560), b = r(105, 999 - a); return inp(pick([`A school collects ${a} books on Monday and ${b} books on Tuesday. How many books altogether?`, `${n1} walks ${a} steps to school and ${b} steps to the park. How many steps altogether?`]), a + b, `Combine the two parts: ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.barModel([[[a, '', a], [b, '', b]]], '?'), meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } const a = r(300, 950), b = r(110, a - 60); return inp(pick([`A store has ${a} eggs. ${b} eggs are sold. How many eggs are left?`, `A library has ${a} books. ${b} books are borrowed. How many books are on the shelf?`]), a - b, `The whole minus the known part: ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.barModel([[[b, '', b], ['?', '', Math.max(a - b, 60)]]], a), meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
        { id: '2F2', name: 'Two-step word problems', gen() { const [n1] = two(); const a = r(40, 90), b = r(10, a - 15), c = r(10, 40); const ans = a - b + c; return inp(pick([`There are ${a} chairs in the hall. ${b} chairs are moved to a classroom, then ${c} new chairs arrive. How many chairs are in the hall now?`, `${n1} has ${a} marbles, gives ${b} to a little sibling, then buys ${c} more. How many marbles does ${n1} have now?`]), ans, `Step 1: ${a} − ${b} = ${a - b}. Step 2: ${a - b} + ${c} = <b>${ans}</b>.`); } },
        { id: '2F3', name: 'Comparison word problems', gen() { const [n1, n2] = two(); const a = r(150, 600), d = r(25, 140); if (Math.random() < 0.5) return inp(`${n1} collects ${a} stamps. ${n2} collects ${d} fewer stamps. How many stamps does ${n2} have?`, a - d, `${n2}'s bar is shorter by ${d}. ${a} − ${d} = <b>${a - d}</b>.`, { vis: V.barModel([[[a, n1, 3]], [['?', n2, 2], [d, 'subtract', 1]]]), meta: { op: '-', a, b: d, regroup: hasBorrow(a, d) } }); const b = a + d; return inp(`${n1} has ${a} points. ${n2} has ${b} points. How many more points does ${n2} have?`, d, `Difference = larger − smaller: ${b} − ${a} = <b>${d}</b>.`, { vis: V.barModel([[[a, n1, 3]], [[a, n2, 3], ['?', 'difference', 1]]]), meta: { op: '-', a: b, b: a, regroup: hasBorrow(b, a) } }); } },
      ],
    },
    {
      id: '2G', grade: 2, name: 'Multiplication', icon: '✖️', color: '#fd79a8',
      sg: '2A/2B · Multiplication Tables of 2, 3, 4, 5 and 10', ixl: 'X (repeated addition)', km: 'Enrichment (CP Phase B)',
      tip: 'Memorize the 2, 5, and 10 times tables by skip counting while clapping. Use arrays of buttons or eggs in a carton.',
      skills: [
        { id: '2G1', name: 'Rows and columns', gen() { const rows = r(2, 5), cols = r(2, 6); if (Math.random() < 0.5) return inp(`There are ${rows} rows with ${cols} balls in each row. How many balls altogether?`, rows * cols, `${rows} rows × ${cols} = ${Array(rows).fill(cols).join(' + ')} = <b>${rows * cols}</b>.`, { vis: W.array(rows, cols), meta: { op: 'x', a: rows, b: cols } }); const good = `${rows} × ${cols}`; const cands = [`${rows} + ${cols}`, `${rows} × ${cols + 1}`, `${rows + 1} × ${cols}`, `${rows} × ${cols - 1 || cols + 2}`]; return ch(`There are ${rows} rows with ${cols} balls in each row. Which multiplication sentence matches?`, opts4(good, cands), good, `${rows} rows of ${cols} is written <b>${good}</b> = ${rows * cols}.`, { vis: W.array(rows, cols) }); } },
        { id: '2G2', name: 'From repeated addition to multiplication', gen() { const e = r(2, 10), k = r(2, 5); return inp(`${Array(k).fill(e).join(' + ')} = ? × ${e}`, k, `${e} is added ${k} times, so it's the same as <b>${k}</b> × ${e} = ${k * e}.`, { meta: { kind: 'count' } }); } },
        { id: '2G3', name: 'Multiplying by 2, 5, and 10', gen() { const a = pick([2, 5, 10]), b = r(1, 10); const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]; return inp(`${x} × ${y} = ?`, x * y, `Skip count by ${a}s ${b} times: ${range(1, b).map((i) => i * a).join(', ')}. The answer is <b>${x * y}</b>.`, { vis: V.big(`${x} × ${y} = <span class="q">?</span>`), meta: { op: 'x', a: x, b: y } }); } },
        { id: '2G4', name: 'Multiplying by 3 and 4', gen() { const a = pick([3, 4]), b = r(1, 10); const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]; return inp(`${x} × ${y} = ?`, x * y, `Skip count by ${a}s: ${range(1, b).map((i) => i * a).join(', ')}. The answer is <b>${x * y}</b>.${a === 4 ? ` Tip: 4 × ${b} = double of 2 × ${b} = ${2 * b}.` : ''}`, { vis: V.big(`${x} × ${y} = <span class="q">?</span>`), meta: { op: 'x', a: x, b: y } }); } },
        { id: '2G5', name: 'Multiplication word problems', gen() { const g = r(2, 10), e = pick([2, 3, 4, 5, 10]); const [em, t] = pick([['📦', `There are ${g} boxes. Each box has ${e} cakes. How many cakes altogether?`], ['🚲', `There are ${g} bicycles. Each bicycle has ${e === 2 ? 2 : e} wheels. How many wheels altogether?`], ['🧺', `Mom buys ${g} bags of oranges. Each bag has ${e} oranges. How many oranges altogether?`]]); return inp(t, g * e, `${g} groups of ${e}: ${g} × ${e} = <b>${g * e}</b>.`, { vis: `<div class="bigemoji sm">${em.repeat(Math.min(g, 6))}${g > 6 ? '…' : ''}</div>`, meta: { op: 'x', a: g, b: e } }); } },
      ],
    },
    {
      id: '2H', grade: 2, name: 'Division', icon: '➗', color: '#e17055',
      sg: '2A/2B · Division (sharing and grouping)', ixl: '— (IXL starts in grade 3)', km: 'Enrichment (CP Phase B)',
      tip: 'Share snacks equally: "12 biscuits for 3 children, how many does each get?" Then connect it to 3 × 4 = 12.',
      skills: [
        { id: '2H1', name: 'Sharing equally', gen() { const g = r(2, 5), e = r(2, 6), t = g * e; return inp(`${t} ÷ ${g} = ? (${t} candies shared equally among ${g} children)`, e, `Give them out one by one to ${g} children until they're gone. Each child gets <b>${e}</b>, because ${g} × ${e} = ${t}.`, { vis: V.objects('🍬', t) + '<div class="kids">' + '🧒'.repeat(g) + '</div>', meta: { op: '/', a: t, b: g } }); } },
        { id: '2H2', name: 'Making groups', gen() { const e = pick([2, 3, 4, 5, 10]), g = r(2, 6), t = e * g; return inp(`There are ${t} apples. Each bag holds ${e} apples. How many bags are needed?`, g, `Group them in ${e}s: ${range(1, g).map((i) => i * e).join(', ')}${e}. There are <b>${g}</b> bags. ${t} ÷ ${e} = ${g}.`, { vis: V.objects('🍎', t), meta: { op: '/', a: t, b: e } }); } },
        { id: '2H3', name: 'Division from multiplication tables', gen() { const d = pick([2, 3, 4, 5, 10]), q = r(1, 10), t = d * q; return inp(`${t} ÷ ${d} = ?`, q, `Think multiplication: ${d} × ? = ${t}. Since ${d} × ${q} = ${t}, the answer is <b>${q}</b>.`, { vis: V.big(`${t} ÷ ${d} = <span class="q">?</span>`), meta: { op: '/', a: t, b: d } }); } },
        { id: '2H4', name: 'Multiplication and division families', gen() { const a = pick([2, 3, 4, 5, 10]), b = r(2, 10), c = a * b; if (Math.random() < 0.5) return inp(`If ${a} × ${b} = ${c}, then ${c} ÷ ${a} = ?`, b, `Multiplication and division are opposites: ${c} ÷ ${a} = <b>${b}</b>.`, { meta: { op: '/', a: c, b: a } }); const good = `${c} ÷ ${b} = ${a}`; const cands = [`${c} ÷ ${a} = ${a}`, `${a} ÷ ${b} = ${c}`, `${c} × ${a} = ${b}`, `${b} ÷ ${c} = ${a}`]; return ch(`Which one belongs to the number family <b>${a}, ${b}, ${c}</b>?`, opts4(good, cands), good, `${a} × ${b} = ${c}, ${b} × ${a} = ${c}, ${c} ÷ ${a} = ${b}, ${c} ÷ ${b} = ${a}. The answer is <b>${good}</b>.`); } },
      ],
    },
    {
      id: '2I', grade: 2, name: 'Fractions', icon: '🍕', color: '#fab1a0',
      sg: '2B · Fractions', ixl: 'LL', km: 'Numbers (fractions; halves and quarters are in CP Phase A)',
      tip: 'Cut bread or paper into equal parts. Write the fraction: "3 of 4 parts = 3/4".',
      skills: [
        { id: '2I1', name: 'Getting to know 1/2, 1/3, 1/4, and 1/8', gen() { const n = pick([2, 3, 4, 8]); const kind = pick(['rect', 'circle']); return ch('What part is shaded?', ['1/2', '1/3', '1/4', '1/8'], `1/${n}`, `The shape is divided into ${n} equal parts and 1 is shaded: <b>1/${n}</b> (${FR[n]}).`, { vis: V.fraction(kind, n, 1) }); } },
        { id: '2I2', name: 'Writing fractions from pictures', gen() { const n = pick([3, 4, 5, 6, 8]), k = r(1, n - 1); const good = `${k}/${n}`; const tags = {}; const alt = [`${n - k}/${n}`, `${k}/${n - k}`, `${n}/${k}`]; alt.forEach((a) => { tags[a] = 'pecahan'; }); return ch('What part is shaded?', opts4(good, alt), good, `There are ${n} equal parts (denominator ${n}) and ${k} are shaded (numerator ${k}). The answer is <b>${good}</b>.`, { vis: V.fraction(n <= 4 && Math.random() < 0.5 ? 'circle' : 'rect', n, k), optionTags: tags }); } },
        { id: '2I3', name: 'Comparing unit fractions', gen() { const [a, b] = shuffle([2, 3, 4, 8]).slice(0, 2); const big = Math.random() < 0.6; const ans = big ? `1/${Math.min(a, b)}` : `1/${Math.max(a, b)}`; const wrong = big ? `1/${Math.max(a, b)}` : `1/${Math.min(a, b)}`; const tags = {}; tags[wrong] = 'pecahan-satuan'; return ch(`Which group has the ${big ? 'largest' : 'smallest'}?`, [`1/${a}`, `1/${b}`], ans, `The more parts, the smaller each part. 1/${Math.min(a, b)} is larger than 1/${Math.max(a, b)}. The answer is <b>${ans}</b>.`, { vis: `<div class="grp-row"><div class="grp"><div class="grp-l">1/${a}</div>${V.fraction('rect', a, 1)}</div><div class="grp"><div class="grp-l">1/${b}</div>${V.fraction('rect', b, 1)}</div></div>`, optionTags: tags }); } },
        { id: '2I4', name: 'Making one whole', gen() { const n = pick([2, 3, 4, 6, 8]), k = r(1, n - 1); return inp(`${k}/${n} is already shaded. How many more parts make 1 whole?`, n - k, `1 whole = ${n}/${n}. ${n} − ${k} = <b>${n - k}</b> more parts.`, { vis: V.fraction('rect', n, k), meta: { op: '-', a: n, b: k } }); } },
      ],
    },
    {
      id: '2J', grade: 2, name: 'Length (cm and m)', icon: '📏', color: '#55efc4',
      sg: '2A · Length (m, cm)', ixl: 'HH (metric units; the inch units in GG aren\'t used)', km: 'Measurement',
      tip: 'Measure things at home with a ruler and tape measure. Guess first, then measure.',
      skills: [
        { id: '2J1', name: 'Measuring with a ruler', gen() { const start = r(1, 4), len = r(2, 12 - start); return inp('How many centimeters long is this pencil?', len, `The pencil starts at ${start} and ends at ${start + len}. Its length is ${start + len} − ${start} = <b>${len}</b> cm.`, { vis: V.ruler(len, start), meta: { kind: 'ruler', start, end: start + len } }); } },
        { id: '2J2', name: 'Choosing units: cm or m', gen() { const [it, u] = pick([['pencils', 'cm'], ['eraser', 'cm'], ['notebook', 'cm'], ['spoon', 'cm'], ['hand span', 'cm'], ['classroom door', 'm'], ['soccer field', 'm'], ['swimming pool', 'm'], ['flagpole', 'm'], ['school bus', 'm']]); return ch(`The length of a <b>${it}</b> is best measured in...`, ['cm', 'm'], u, `Small objects are measured in centimeters (cm), and large or distant ones in meters (m). ${it} → <b>${u}</b>.`); } },
        { id: '2J3', name: 'Comparing lengths', gen() { const a = r(15, 90), b = r(10, a - 3); return inp(`A red ribbon is ${a} cm long. A blue ribbon is ${b} cm long. How many cm longer is the red ribbon?`, a - b, `Difference: ${a} − ${b} = <b>${a - b}</b> cm.`, { vis: V.bars([{ label: `Red ${a} cm`, len: Math.round(a / 8), color: '#ff6b6b' }, { label: `Blue ${b} cm`, len: Math.round(b / 8), color: '#4d96ff' }]), meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
        { id: '2J4', name: 'Length word problems', gen() { const [n1] = two(); if (Math.random() < 0.5) { const a = r(20, 60), b = r(10, 39); return inp(`${n1} joins a ${a} m rope and a ${b} m rope. How many meters long is the rope now?`, a + b, `${a} + ${b} = <b>${a + b}</b> m.`, { meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } const a = r(50, 99), b = r(12, a - 10); return inp(`A ${a} cm ribbon has ${b} cm cut off for decoration. How many cm of ribbon are left?`, a - b, `${a} − ${b} = <b>${a - b}</b> cm.`, { meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
      ],
    },
    {
      id: '2K', grade: 2, name: 'Weight and volume', icon: '⚖️', color: '#81ecec',
      sg: '2A/2B · Mass (kg, g), Volume (ℓ)', ixl: '— (from Singapore Math)', km: 'Measurement',
      tip: 'Have your child read weights on packages (rice 5 kg, biscuits 200 g) and bottle volumes (1.5 liters).',
      skills: [
        { id: '2K1', name: 'Choosing units: kg or g', gen() { const [it, u] = pick([['sack of rice', 'kg'], ['watermelon', 'kg'], ['goat', 'kg'], ['your body', 'kg'], ['candies', 'g'], ['pencils', 'g'], ['spoon', 'g'], ['an egg', 'g'], ['a pack of biscuits', 'g'], ['bicycles', 'kg']]); return ch(`The weight of <b>${it}</b> is best measured in...`, ['kg', 'g'], u, `Light objects use grams (g), heavy objects use kilograms (kg). ${it} → <b>${u}</b>.`); } },
        { id: '2K2', name: 'Finding weight with scale weights', gen() { const [e] = pick([['🍍'], ['🍉'], ['🥥'], ['🍞'], ['🧀']]); const list = shuffle([500, 200, 200, 100, 100, 50, 50, 20, 10]).slice(0, r(2, 4)).sort((a, b) => b - a); const t = list.reduce((a, b) => a + b, 0); return inp('The scale is balanced. How many grams does this fruit weigh?', t, `Add all the weights: ${list.map((g) => g + ' g').join(' + ')} = <b>${t}</b> g.`, { vis: W.weights(list, e), unit: 'g' }); } },
        { id: '2K3', name: 'Volume in liters', gen() { if (Math.random() < 0.5) { const a = r(5, 20), b = r(1, a - 1); return inp(`A bucket holds ${a} liters of water. Mom uses ${b} liters to water the plants. How many liters are left?`, a - b, `${a} − ${b} = <b>${a - b}</b> liters.`, { vis: '<div class="bigemoji">🪣</div>', meta: { op: '-', a, b } }); } const g = r(2, 5), e = r(2, 4); return inp(`One bottle holds ${e} liters. How many liters do ${g} bottles hold?`, g * e, `${g} × ${e} = <b>${g * e}</b> liters.`, { vis: `<div class="bigemoji sm">${'🍶'.repeat(g)}</div>`, meta: { op: 'x', a: g, b: e } }); } },
      ],
    },
    {
      id: '2L', grade: 2, name: 'Time and calendar', icon: '⏰', color: '#ffeaa7',
      sg: '2B · Time (5 minutes, a.m./p.m.)', ixl: 'DD, EE', km: 'Measurement (time duration)',
      tip: 'Say the time during activities: "It\'s 7:25 now." Also get used to the 24-hour clock as on TV: 19:00 = 7 in the evening.',
      skills: [
        { id: '2L1', name: 'Reading the clock by 5 minutes', gen() { const h = r(1, 12), m = r(1, 11) * 5, mm = String(m).padStart(2, '0'); const good = `${h}:${mm}`; const tags = {}; const wrongMin = `${h}:${String(m / 5).padStart(2, '0')}`; tags[wrongMin] = 'jam-menit'; const nx = h % 12 + 1; const wrongHour = `${nx}:${mm}`; tags[wrongHour] = 'jam-tertukar'; return ch('What time is it?', opts4(good, [wrongMin, wrongHour, `${h}:${String((m + 5) % 60).padStart(2, '0')}`]), good, `The short hand has passed ${h}. The long hand is at ${m / 5}, meaning ${m / 5} × 5 = ${m} minutes. So it's <b>${good}</b>.`, { vis: V.clock(h, m), optionTags: tags }); } },
        { id: '2L2', name: 'Morning, midday, afternoon, night (24-hour clock)', gen() { const H = r(0, 23); const part = H >= 4 && H < 11 ? 'morning' : H >= 11 && H < 15 ? 'midday' : H >= 15 && H < 19 ? 'late afternoon' : 'night'; const h12 = H % 12 === 0 ? 12 : H % 12; if (Math.random() < 0.5 && H >= 13) return inp(`${h12} in the ${part} is what hour on the 24-hour clock? (write the hour only)`, H, `After 12 noon, add 12: ${h12} + 12 = <b>${H}</b>. So it's ${String(H).padStart(2, '0')}:00.`, { meta: { op: '+', a: h12, b: 12 } }); return ch(`${String(H).padStart(2, '0')}:00 is in the...`, ['morning', 'midday', 'late afternoon', 'night'], part, `${String(H).padStart(2, '0')}:00 is ${h12} o'clock in the <b>${part}</b>.`); } },
        { id: '2L3', name: 'Relating units of time', gen() { const [q, a] = pick([['1 hour = ? minutes', 60], ['half an hour = ? minutes', 30], ['2 hours = ? minutes', 120], ['1 day = ? hours', 24], ['1 week = ? days', 7], ['2 weeks = ? days', 14], ['1 year = ? months', 12], ['a quarter of an hour = ? minutes', 15]]); return inp(q, a, `Remember: 1 hour = 60 minutes, 1 day = 24 hours, 1 week = 7 days, 1 year = 12 months. The answer is <b>${a}</b>.`); } },
        { id: '2L4', name: 'Elapsed time', gen() { const s = r(6, 14), d = r(1, 5); if (Math.random() < 0.5) return inp(`A lesson starts at ${String(s).padStart(2, '0')}:00 and ends at ${String(s + d).padStart(2, '0')}:00. How many hours long is it?`, d, `Count up from ${s} to ${s + d}: <b>${d}</b> hours.`, { meta: { op: '-', a: s + d, b: s } }); const good = `${String(s + d).padStart(2, '0')}:00`; return ch(`It's ${String(s).padStart(2, '0')}:00 now. What time will it be in ${d} hours?`, opts4(good, [`${String(s + d + 1).padStart(2, '0')}:00`, `${String(s + d - 1).padStart(2, '0')}:00`, `${String(s - d).padStart(2, '0')}:00`]), good, `${s} + ${d} = ${s + d}. So it's <b>${good}</b>.`); } },
        { id: '2L5', name: 'Days in a month', gen() { const i = r(0, 11); const days = [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i]; const ans = days === -1 ? '28 or 29' : String(days); return ch(`How many days are in <b>${BULAN[i]}</b>?`, ['28 or 29', '30', '31'], ans, `${BULAN[i]} has <b>${ans}</b> days. Tip: count on your knuckles — months on a knuckle have 31 days.`); } },
      ],
    },
    {
      id: '2M', grade: 2, name: 'Money', icon: '💰', color: '#74b9ff',
      sg: '2B · Money (in Rupiah)', ixl: 'AA, BB, CC', km: 'Numbers (money context)',
      tip: 'Let your child pay at a shop and count the change.',
      skills: [
        { id: '2M1', name: 'Counting money to Rp100,000', gen() { const notes = Array.from({ length: r(2, 4) }, () => pick(['n2000', 'n5000', 'n10000', 'n20000', 'n50000'])); const val = (x) => parseInt(x.slice(1)); notes.sort((a, b) => val(b) - val(a)); let t = notes.reduce((s, x) => s + val(x), 0); if (t > 100000) return C.SKILLS['2M1'].gen(); return inp('How many rupiah is this? (write the number only)', t, `Add from the largest: ${notes.map((x) => rp(val(x))).join(' + ')} = <b>${rp(t)}</b>.`, { vis: V.money(notes), unit: 'Rp', meta: { kind: 'money' } }); } },
        { id: '2M2', name: 'Calculating change', gen() { const pay = pick([5000, 10000, 20000, 50000]); const price = r(2, pay / 500 - 1) * 500; const [e, nm] = pick([['📒', 'books'], ['🖍️', 'crayons'], ['🧃', 'juice'], ['🍩', 'donut'], ['🎒', 'small bag']]); return inp(`The price of ${nm} ${e} is ${rp(price)}. It's paid with ${rp(pay)}. How much is the change? (write the number only)`, pay - price, `Change = money paid − price: ${rp(pay)} − ${rp(price)} = <b>${rp(pay - price)}</b>.`, { vis: V.money(['n' + pay]), unit: 'Rp', meta: { op: '-', a: pay, b: price } }); } },
        { id: '2M3', name: 'Adding shopping prices', gen() { const items = shuffle([['🍞', 'bread', r(4, 12) * 500], ['🥛', 'milk', r(6, 14) * 500], ['🍌', 'bananas', r(2, 8) * 1000], ['🥚', 'eggs', r(3, 10) * 1000], ['🍫', 'chocolate', r(3, 9) * 1000]]).slice(0, 2); const t = items[0][2] + items[1][2]; return inp(`Mom buys ${items[0][1]} ${items[0][0]} for ${rp(items[0][2])} and ${items[1][1]} ${items[1][0]} for ${rp(items[1][2])}. What's the total price? (write the number only)`, t, `${rp(items[0][2])} + ${rp(items[1][2])} = <b>${rp(t)}</b>.`, { unit: 'Rp', meta: { op: '+', a: items[0][2], b: items[1][2] } }); } },
        { id: '2M4', name: 'How much short?', gen() { const have = r(4, 30) * 1000, need = have + r(1, 10) * 1000; const [e, nm] = pick([['⚽', 'balls'], ['🪁', 'kite'], ['🧸', 'doll'], ['🎨', 'watercolors']]); return inp(`${two()[0]} has ${rp(have)}. The price of ${nm} ${e} is ${rp(need)}. How many more rupiah are needed? (write the number only)`, need - have, `${rp(need)} − ${rp(have)} = <b>${rp(need - have)}</b>.`, { unit: 'Rp', meta: { op: '-', a: need, b: have } }); } },
      ],
    },
    {
      id: '2N', grade: 2, name: 'Data and charts', icon: '📊', color: '#e84393',
      sg: '2B · Picture Graphs (with a scale)', ixl: 'FF', km: 'Data Analysis and Probability',
      tip: 'Make a bar chart together from family data: favorite fruit, favorite color, or the number of passing vehicles.',
      skills: [
        { id: '2N1', name: 'Pictographs with a scale', gen() { const sc = pick([2, 5]); const cats = shuffle([['🍎', 'Apple'], ['🍌', 'Banana'], ['🍊', 'Orange'], ['🍇', 'Grape']]).slice(0, 3); const icons = shuffle(range(1, 6)).slice(0, 3); const rows = cats.map((c, i) => [c[0], c[1], icons[i]]); const i = r(0, 2); return inp(`How many children like ${rows[i][1].toLowerCase()}?`, rows[i][2] * sc, `There are ${rows[i][2]} pictures, and each picture = ${sc} children. ${rows[i][2]} × ${sc} = <b>${rows[i][2] * sc}</b>.`, { vis: V.pictograph('Grade 2 Favorite Fruits', rows, `Each picture = ${sc} children`), meta: { kind: 'scale', icons: rows[i][2] } }); } },
        { id: '2N2', name: 'Reading bar charts', gen() { const cats = shuffle(['Red', 'Blue', 'Green', 'Yellow']).slice(0, 4); const vals = cats.map(() => r(1, 9) * 2); const COL = { "Red": '#ff6b6b', "Blue": '#4d96ff', "Green": '#2ecc71', "Yellow": '#f9c74f' }; const rows = cats.map((c, i) => [c, vals[i], COL[c]]); const vis = W.barGraph('Favorite Colors', rows, 20, 2); if (Math.random() < 0.6) { const i = r(0, 3); return inp(`How many children chose the color ${cats[i].toLowerCase()}?`, vals[i], `Find the top of the ${cats[i]} bar and draw a line to the number on the left: <b>${vals[i]}</b>.`, { vis }); } const mx = Math.max(...vals); if (vals.filter((v) => v === mx).length > 1) return C.SKILLS['2N2'].gen(); const ans = cats[vals.indexOf(mx)]; return ch('Which color was chosen most?', cats, ans, `The tallest bar is <b>${ans}</b> (${mx} children).`, { vis }); } },
        { id: '2N3', name: 'Answering questions from charts', gen() { const cats = shuffle(['Monday', 'Tuesday', 'Wednesday', 'Thursday']).slice(0, 4); const vals = cats.map(() => r(1, 10) * 2); const rows = cats.map((c, i) => [c.slice(0, 3), vals[i]]); const [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2); if (Math.random() < 0.5) { const [x, y] = vals[i] >= vals[j] ? [i, j] : [j, i]; return inp(`How many more books were borrowed on ${cats[x]} than on ${cats[y]}?`, vals[x] - vals[y], `${cats[x]}: ${vals[x]}, ${cats[y]}: ${vals[y]}. ${vals[x]} − ${vals[y]} = <b>${vals[x] - vals[y]}</b>.`, { vis: W.barGraph('Books Borrowed', rows, 20, 2), meta: { op: '-', a: vals[x], b: vals[y] } }); } return inp(`How many books were borrowed on ${cats[i]} and ${cats[j]} combined?`, vals[i] + vals[j], `${vals[i]} + ${vals[j]} = <b>${vals[i] + vals[j]}</b>.`, { vis: W.barGraph('Books Borrowed', rows, 20, 2), meta: { op: '+', a: vals[i], b: vals[j] } }); } },
      ],
    },
    {
      id: '2O', grade: 2, name: 'Shapes, area, and patterns', icon: '🔷', color: '#fdcb6e',
      sg: '2B · Shapes and Patterns', ixl: 'II, JJ, KK', km: 'Geometry; Algebra (number patterns)',
      tip: 'Count the sides and corners of things at home: tiles, milk boxes, a Rubik\'s cube. Arrange small tiles to make a rectangle.',
      skills: [
        { id: '2O1', name: 'Names of polygons', gen() { const n = pick([3, 4, 5, 6, 8]); const nm = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 8: 'octagon' }; return ch('What is this shape called?', opts4(nm[n], Object.values(nm)), nm[n], `Count the sides: ${n} sides, so its name is <b>${nm[n]}</b>.`, { vis: W.poly(n, pick(['#ff7a59', '#1fbf9f', '#00b894', '#0984e3'])) }); } },
        { id: '2O2', name: 'Sides and vertices', gen() { const n = pick([3, 4, 5, 6, 8]); const what = pick(['sides', 'vertices']); return inp(`How many ${what} does this shape have?`, n, `Count the ${what === 'sides' ? 'straight lines' : 'corners'} one by one. A polygon always has number of sides = number of vertices = <b>${n}</b>.`, { vis: W.poly(n, '#00b894'), meta: { kind: 'count' } }); } },
        { id: '2O3', name: 'Faces, edges, and vertices of solids', gen() { const [nm, e, f, ed, v] = pick([['cube', '🎲', 6, 12, 8], ['cuboid', '📦', 6, 12, 8], ['triangular prism', '🧀', 5, 9, 6]]); const [what, val] = pick([['sides', f], ['edges', ed], ['vertices', v]]); return inp(`How many ${what} does a ${nm} have?`, val, `A ${nm[0].toUpperCase() + nm.slice(1)} has ${f} faces, ${ed} edges, and ${v} vertices. The answer is <b>${val}</b>.`, { vis: `<div class="bigemoji">${e}</div>`, meta: { kind: 'count' } }); } },
        { id: '2O4', name: 'Area with unit squares', gen() { const rows = r(2, 5), cols = r(2, 7); return inp('How many small squares are inside this rectangle?', rows * cols, `${rows} rows with ${cols} squares each: ${rows} × ${cols} = <b>${rows * cols}</b>.`, { vis: W.rect(rows, cols), meta: { op: 'x', a: rows, b: cols } }); } },
        { id: '2O5', name: 'Perimeter of a rectangle', gen() { const rows = r(2, 4), cols = r(2, 7); const k = 2 * (rows + cols); return inp('What is the perimeter of this rectangle in cm? (each small square has 1 cm sides)', k, `Perimeter = sum of all outer sides: ${cols} + ${rows} + ${cols} + ${rows} = <b>${k}</b> cm.`, { vis: W.rect(rows, cols, true) }); } },
        { id: '2O6', name: 'Number patterns', gen() { const k = r(2, 25), up = Math.random() < 0.65; let start = up ? r(0, 60) : r(k * 4 + 1, 150); const seq = range(0, 4).map((i) => start + (up ? i : -i) * k); const j = r(1, 4); return inp('What number is missing?', seq[j], `The pattern ${up ? 'increases' : 'decreases'} by ${k} each step: ${seq.join(', ')}. The answer is <b>${seq[j]}</b>.`, { log: 'Pattern: ' + seq.map((v, i) => (i === j ? '?' : v)).join(', '), vis: V.seq(seq.map((v, i) => (i === j ? '?' : v))), meta: { kind: 'seq' } }); } },
      ],
    },
    {
      id: '2P', grade: 2, name: 'Rounding and estimating', icon: '🎯', color: '#00b894',
      sg: '— (Singapore Math covers this from grade 3)', ixl: 'Z', km: 'Enrichment',
      tip: 'While shopping, have your child estimate: "Rp4,800 is about Rp5,000."',
      skills: [
        { id: '2P1', name: 'Rounding to the nearest ten', gen() { let n = r(11, 99); if (n % 10 === 0) n++; const lo = Math.floor(n / 10) * 10, hi = lo + 10, ans = n % 10 >= 5 ? hi : lo, wrong = ans === hi ? lo : hi; return inp(`Round ${n} to the nearest ten.`, ans, `${n} is between ${lo} and ${hi}. Its ones digit is ${n % 10}, ${n % 10 >= 5 ? '5 or more → round up' : 'less than 5 → round down'}: <b>${ans}</b>.`, { vis: W.nl(lo, hi, 1, n), meta: { kind: 'round', wrong } }); } },
        { id: '2P2', name: 'Rounding to the nearest hundred', gen() { let n = r(101, 989); if (n % 100 === 0) n += 7; const lo = Math.floor(n / 100) * 100, hi = lo + 100, ans = n % 100 >= 50 ? hi : lo, wrong = ans === hi ? lo : hi; return inp(`Round ${n} to the nearest hundred.`, ans, `${n} is between ${lo} and ${hi}. Look at its tens digit: ${Math.floor((n % 100) / 10)}. ${n % 100 >= 50 ? '5 or more → up' : 'less than 5 → down'}: <b>${ans}</b>.`, { vis: W.nl(lo, hi, 10), log: `Round ${n} to the nearest hundred`, meta: { kind: 'round', wrong } }); } },
        { id: '2P3', name: 'Estimating sums', gen() { const rnd = (x) => Math.round(x / 10) * 10; let a = r(12, 88), b = r(12, 88); if (a % 10 === 5) a++; if (b % 10 === 5) b++; const ans = rnd(a) + rnd(b); return inp(`Estimate ${a} + ${b} by rounding to the nearest ten.`, ans, `${a} ≈ ${rnd(a)} and ${b} ≈ ${rnd(b)}. ${rnd(a)} + ${rnd(b)} = <b>${ans}</b>. (The exact result is ${a + b}.)`, { meta: { kind: 'estimate' } }); } },
      ],
    },
    {
      // Hanya tampil di kelas yang konteksnya islami (pengaturan kelas); lihat C.setKonteks
      id: '2Q', grade: 2, iman: true, name: 'Math in worship', icon: '🕌', color: '#16a085',
      sg: '— (local context: applying addition, subtraction, division, and order)', ixl: '—', km: 'Numbers (worship context)',
      tip: 'Count together the prayer units (rakaat) today, the days of fasting completed, or money set aside for charity.',
      skills: [
        { id: '2Q1', name: 'Adding prayer units (rakaat)', gen() { const SH = [['Fajr', 2], ['Dhuhr', 4], ['Asr', 4], ['Maghrib', 3], ['Isha', 4]]; const [x, y] = shuffle(SH).slice(0, 2); return inp(`${x[0]} prayer has ${x[1]} rakaat and ${y[0]} prayer has ${y[1]} rakaat. How many rakaat altogether?`, x[1] + y[1], `Add the rakaat: ${x[1]} + ${y[1]} = <b>${x[1] + y[1]}</b> rakaat.`, { vis: V.groups('🟢', x[1], y[1]), meta: { op: '+', a: x[1], b: y[1] } }); } },
        { id: '2Q2', name: 'Order of prayer times', gen() { const W5 = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']; const after = Math.random() < 0.5; const i = after ? r(0, 3) : r(1, 4); const ref = W5[i], ans = W5[after ? i + 1 : i - 1]; return ch(`Which prayer comes ${after ? 'after' : 'before'} ${ref}?`, shuffle(W5.filter((w) => w !== ref)), ans, `Order of daily prayers: ${W5.join(' → ')}. ${after ? 'After' : 'Before'} ${ref} is <b>${ans}</b>.`, { vis: V.seq(W5.map((w) => (w === ans ? '?' : w))) }); } },
        { id: '2Q3', name: 'Counting fasting days', gen() { const total = pick([29, 30]), done = r(5, total - 3); return inp(`If Ramadan this year is ${total} days and you've fasted ${done} days, how many days of fasting are left?`, total - done, `The whole is ${total} days, and ${done} days are done. The rest is ${total} − ${done} = <b>${total - done}</b> days.`, { vis: V.barModel([[[done, 'done', done], ['?', 'left', total - done]]], total), meta: { op: '-', a: total, b: done } }); } },
        { id: '2Q4', name: 'Charity and money left', gen() { const have = pick([5000, 10000, 20000]), give = pick([1000, 2000, 5000].filter((x) => x < have)); return inp(`${pick(NAMA)} has ${rp(have)} and gives ${rp(give)} to charity. How many rupiah are left? (write the number only)`, have - give, `Starting money minus charity: ${rp(have)} − ${rp(give)} = <b>${rp(have - give)}</b>.`, { unit: 'Rp', meta: { op: '-', a: have, b: give } }); } },
        { id: '2Q5', name: 'Sharing iftar snacks equally', gen() { const g = r(2, 5), e = r(2, 5), t = g * e; return inp(`There are ${t} dates for breaking the fast. They're shared equally among ${g} children. How many dates does each child get?`, e, `Give them out one by one to ${g} children until they're gone. Each child gets <b>${e}</b> dates, because ${g} × ${e} = ${t}.`, { vis: V.objects('🌴', t) + '<div class="kids">' + '🧒'.repeat(g) + '</div>', meta: { op: '/', a: t, b: g } }); } },
      ],
    },
  ];

  C.register(UNITS);
  C.GRADES.push({ id: 2, name: 'Grade 2', ixl: 'https://www.ixl.com/math/grade-2/skills', sg: 'Primary Mathematics / Dimensions Math 2A and 2B' });
})();
