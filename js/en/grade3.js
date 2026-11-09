/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Kurikulum Matematika Kelas 3
 * Dari daftar keterampilan IXL kelas 3 dan Singapore Math 3A/3B: bilangan sampai 10.000,
 * tabel perkalian sampai 12, pembagian bersisa, perkalian bersusun, pecahan senilai,
 * luas dan keliling, sudut siku-siku, waktu sampai menit, serta satuan metrik.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, range, rp, V, inp, ch, compareQ, two, fmt, opts4, hasCarry, hasBorrow, stack, U } = C.kit;
  const hm = (h, m) => `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
  const grid = (rows, cols) => `<div class="rgrid" style="grid-template-columns:repeat(${cols},22px)">${'<i></i>'.repeat(rows * cols)}</div>`;
  const R = (n, t) => Math.floor(n / t + 0.5) * t;
  const cmpFrac = (a, b, va, vb, tags = {}) => { const s = va < vb ? '<' : va > vb ? '>' : '='; return ch('Choose the correct sign.', ['<', '>', '='], s, '', { vis: V.big(`${a} <span class="q">?</span> ${b}`), optionTags: tags }); };
  const JAJAR = '<svg class="shape" viewBox="0 0 120 120" style="fill:#0984e3"><polygon points="6,96 82,96 114,24 38,24"/></svg>';

  const UNITS = [
    {
      id: '3A', grade: 3, name: 'Numbers to 10,000', icon: '🔢', color: '#ff7a59',
      sg: '3A · Numbers to 10,000', ixl: 'A, B, M', km: 'Numbers (CP Phase B: whole numbers to 10,000)',
      tip: 'Write a house number, price, or year on paper, then ask the value of each digit.',
      skills: [
        { id: '3A1', name: 'Digit value to the thousands', gen() { const d = shuffle(range(1, 9)).slice(0, 4), n = +d.join(''), pos = r(0, 3), val = d[pos] * 10 ** (3 - pos); const tags = {}; if (pos < 3) tags[String(d[pos])] = 'nilai-tempat'; return ch(`In the number <b>${fmt(n)}</b>, what is the value of the digit ${d[pos]}?`, opts4(fmt(val), [d[pos], d[pos] * 10, d[pos] * 100, d[pos] * 1000].map(fmt)), fmt(val), `The digit ${d[pos]} is in the ${['thousands', 'hundreds', 'tens', 'ones'][pos]} place, so its value is <b>${fmt(val)}</b>.`, { optionTags: tags }); } },
        { id: '3A2', name: 'Expanded form', gen() { const n = r(1001, 9999), [a, b, c, d] = String(n).split('').map(Number); if (Math.random() < 0.5) return inp(`${a * 1000} + ${b * 100} + ${c * 10} + ${d} = ?`, n, `Combine the thousands, hundreds, tens, and ones: <b>${fmt(n)}</b>.`, { meta: { kind: 'place' } }); return inp(`${fmt(n)} = ${fmt(a * 1000)} + ? + ${c * 10} + ${d}`, b * 100, `${b} is in the hundreds place, so its value is <b>${b * 100}</b>.`, { meta: { kind: 'place', alt: { [String(b)]: 'nilai-tempat' } } }); } },
        { id: '3A3', name: 'Comparing numbers to 10,000', gen() { const a = r(1000, 9999); const b = Math.random() < 0.5 ? Math.floor(a / 1000) * 1000 + r(0, 999) : r(1000, 9999); return compareQ(a, b); } },
        { id: '3A4', name: 'Largest and smallest numbers from digit cards', gen() { const d = shuffle(range(0, 9)).slice(0, 4); const big = Math.random() < 0.5; let s = d.slice().sort((x, y) => (big ? y - x : x - y)); if (!big && s[0] === 0) { const i = s.findIndex((x) => x > 0); [s[0], s[i]] = [s[i], s[0]]; } const n = +s.join(''); return inp(`Arrange the four cards into the ${big ? 'largest' : 'smallest'} number.`, n, big ? `Put the largest digit in the thousands place, then go in decreasing order: <b>${fmt(n)}</b>.` : `Put the smallest digit (not 0) first, then go in increasing order: <b>${fmt(n)}</b>.`, { vis: V.seq(d), meta: { kind: 'place' } }); } },
      ],
    },
    {
      id: '3B', grade: 3, name: 'Rounding and estimating', icon: '🎯', color: '#1fbf9f',
      sg: '3A · Estimation (rounding)', ixl: 'C, D, E, F', km: 'Numbers',
      tip: 'While shopping, ask your child to estimate the total by rounding prices to the nearest thousand.',
      skills: [
        { id: '3B1', name: 'Rounding to the nearest ten or hundred', gen() { const t = pick([10, 100]), n = r(t === 10 ? 101 : 1001, 9999); if (n % t === 0) return C.SKILLS['3B1'].gen(); const lo = Math.floor(n / t) * t, ans = R(n, t), wrong = ans === lo ? lo + t : lo; return inp(`Round ${fmt(n)} to the nearest ${t === 10 ? 'tens' : 'hundreds'}.`, ans, `${fmt(n)} is between ${fmt(lo)} and ${fmt(lo + t)}. Look at its ${t === 10 ? 'ones' : 'tens'} digit: 5 or more rounds up. The answer is <b>${fmt(ans)}</b>.`, { meta: { kind: 'round', wrong } }); } },
        { id: '3B2', name: 'Estimating sums', gen() { const a = r(110, 890), b = r(110, 890), ans = R(a, 100) + R(b, 100); return inp(`Estimate ${a} + ${b} by rounding to the nearest hundred.`, ans, `${a} ≈ ${R(a, 100)} and ${b} ≈ ${R(b, 100)}. ${R(a, 100)} + ${R(b, 100)} = <b>${fmt(ans)}</b> (the exact result is ${fmt(a + b)}).`, { meta: { kind: 'estimate' } }); } },
        { id: '3B3', name: 'Estimating differences', gen() { const a = r(500, 990), b = r(110, a - 150), ans = R(a, 100) - R(b, 100); return inp(`Estimate ${a} − ${b} by rounding to the nearest hundred.`, ans, `${a} ≈ ${R(a, 100)} and ${b} ≈ ${R(b, 100)}. ${R(a, 100)} − ${R(b, 100)} = <b>${ans}</b> (the exact result is ${a - b}).`, { meta: { kind: 'estimate' } }); } },
      ],
    },
    {
      id: '3C', grade: 3, name: 'Addition and subtraction to 10,000', icon: '➕', color: '#00b894',
      sg: '3A · Addition and Subtraction within 10,000', ixl: 'G, H, I, J, K, L', km: 'Numbers',
      tip: 'Check subtraction with addition: 5,230 − 1,875 = 3,355, because 3,355 + 1,875 = 5,230.',
      skills: [
        { id: '3C1', name: 'Adding three-digit numbers', gen() { let a, b; do { a = r(150, 750); b = r(120, 999 - a); } while (!hasCarry(a, b)); return inp(`${a} + ${b} = ?`, a + b, `Add from the ones. A column adding up to 10 or more carries 1 to the next column. The answer is <b>${a + b}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: true } }); } },
        { id: '3C2', name: 'Adding four-digit numbers', gen() { let a, b; do { a = r(1200, 7800); b = r(1100, 9999 - a); } while (!hasCarry(a, b)); return inp(`${a} + ${b} = ?`, a + b, `Add vertically from the ones to the thousands, and don't forget to carry. The answer is <b>${fmt(a + b)}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: true } }); } },
        { id: '3C3', name: 'Subtracting four-digit numbers', gen() { let a, b; do { a = r(3000, 9999); b = r(1001, a - 200); } while (!hasBorrow(a, b)); return inp(`${a} − ${b} = ?`, a - b, `Subtract vertically from the ones. If the top digit is smaller, borrow 1 from the column to its left. The answer is <b>${fmt(a - b)}</b>.`, { vis: stack(a, '−', b), meta: { op: '-', a, b, regroup: true } }); } },
        { id: '3C4', name: 'Word problems to 10,000', gen() { const [n1] = two(); if (Math.random() < 0.5) { const a = r(1200, 5000), b = r(800, 4000); return inp(pick([`A school has ${fmt(a)} books in the library and ${fmt(b)} books in classrooms. How many books altogether?`, `On Saturday there are ${fmt(a)} visitors to the zoo, and on Sunday ${fmt(b)}. How many visitors over the two days?`]), a + b, `${fmt(a)} + ${fmt(b)} = <b>${fmt(a + b)}</b>.`, { vis: V.barModel([[[fmt(a), '', a], [fmt(b), '', b]]], '?'), meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } const a = r(3000, 9500), b = r(900, a - 500); return inp(`${n1} is saving for a bicycle costing Rp${fmt(a)},000 and already has Rp${fmt(b)},000. How many thousand rupiah are still needed?`, a - b, `${fmt(a)} − ${fmt(b)} = <b>${fmt(a - b)}</b> thousand rupiah.`, { vis: V.barModel([[[fmt(b), 'done', b], ['?', 'subtract', a - b]]], fmt(a)), meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
      ],
    },
    {
      id: '3D', grade: 3, name: 'Meaning and properties of multiplication', icon: '🧩', color: '#fd79a8',
      sg: '3A · Multiplication (properties)', ixl: 'N, S', km: 'Numbers (multiplication; CP Phase B)',
      tip: 'Arrange buttons or bottle caps in rows and columns. Rotate the array: 3 × 4 is the same amount as 4 × 3.',
      skills: [
        { id: '3D1', name: 'Equal groups and multiplication sentences', gen() { const g = r(2, 6), e = r(2, 9); const good = `${g} × ${e}`; return ch(`There are ${g} plates with ${e} cakes on each plate. Which multiplication sentence matches?`, opts4(good, [`${g} + ${e}`, `${g} × ${e + 1}`, `${g + 1} × ${e}`, `${g} × ${Math.max(1, e - 1)}`]), good, `${g} groups of ${e} is written <b>${good}</b> = ${g * e}.`, { vis: '<div class="eqg">' + range(1, g).map(() => `<div class="plate">${'🍪'.repeat(e)}</div>`).join('') + '</div>' }); } },
        { id: '3D2', name: 'Properties of multiplication', gen() { const a = r(2, 12), b = r(2, 9), c = r(2, 5); const t = r(0, 3); if (t === 0) return inp(`${a} × 0 = ?`, 0, 'Any number times 0 is <b>0</b>: 0 groups means nothing at all.'); if (t === 1) return inp(`1 × ${a} = ?`, a, `A number times 1 is the number itself: <b>${a}</b>.`); if (t === 2) return inp(`${a} × ${b} = ${b} × ?`, a, `The order of multiplication can be swapped (commutative property). The answer is <b>${a}</b>.`); return inp(`(${b} × ${c}) × 2 = ${b} × (${c} × ?)`, 2, 'The grouping in multiplication can change (associative property). The answer is <b>2</b>.'); } },
        { id: '3D3', name: 'Distributive property (breaking apart multiplication)', gen() { const a = r(3, 9), b = r(6, 9), p = 5; return inp(`${a} × ${b} = ${a} × ${p} + ${a} × ?`, b - p, `Break ${b} into ${p} + ${b - p}. So ${a} × ${b} = ${a} × ${p} + ${a} × <b>${b - p}</b> = ${a * p} + ${a * (b - p)} = ${a * b}.`, { vis: V.bond(b, p, '?') }); } },
      ],
    },
    {
      id: '3E', grade: 3, name: 'Multiplication tables to 12', icon: '✖️', color: '#e17055',
      sg: '3A · Multiplication Tables of 6, 7, 8 and 9', ixl: 'O, P, Q, R', km: 'Numbers',
      tip: 'Practice 5 minutes a day. A trick for times 9: 9 × 7 = 63, the tens digit is 1 less than 7, and 6 + 3 = 9.',
      skills: [
        { id: '3E1', name: 'Multiplying by 6 and 7', gen() { const a = pick([6, 7]), b = r(1, 10), [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]; return inp(`${x} × ${y} = ?`, x * y, `${a} × ${b} = ${a} × 5 + ${a} × ${b - 5 >= 0 ? b - 5 : 0}${b < 5 ? ' (or skip count)' : ''}. The answer is <b>${x * y}</b>.`, { vis: V.big(`${x} × ${y} = <span class="q">?</span>`), meta: { op: 'x', a: x, b: y } }); } },
        { id: '3E2', name: 'Multiplying by 8 and 9', gen() { const a = pick([8, 9]), b = r(1, 10), [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]; return inp(`${x} × ${y} = ?`, x * y, a === 9 ? `9 × ${b} = 10 × ${b} − ${b} = ${10 * b} − ${b} = <b>${9 * b}</b>.` : `8 × ${b} = double of 4 × ${b} = 2 × ${4 * b} = <b>${8 * b}</b>.`, { vis: V.big(`${x} × ${y} = <span class="q">?</span>`), meta: { op: 'x', a: x, b: y } }); } },
        { id: '3E3', name: 'Mixed multiplication to 12 × 12', gen() { const a = r(2, 12), b = r(2, 12); return inp(`${a} × ${b} = ?`, a * b, `${a} × ${b} = <b>${a * b}</b>.${a > 10 || b > 10 ? ` Tip: ${Math.max(a, b)} × ${Math.min(a, b)} = 10 × ${Math.min(a, b)} + ${Math.max(a, b) - 10} × ${Math.min(a, b)}.` : ''}`, { vis: V.big(`${a} × ${b} = <span class="q">?</span>`), meta: { op: 'x', a, b } }); } },
        { id: '3E4', name: 'Missing factors', gen() { const a = r(2, 10), b = r(2, 10); return inp(`? × ${b} = ${a * b}`, a, `Find the number that times ${b} makes ${a * b}: ${a} × ${b} = ${a * b}. The answer is <b>${a}</b>.`, { vis: V.big(`<span class="q">?</span> × ${b} = ${a * b}`) }); } },
      ],
    },
    {
      id: '3F', grade: 3, name: 'Division', icon: '➗', color: '#0984e3',
      sg: '3A · Division (with remainder)', ixl: 'V, W, X, Y, Z, AA', km: 'Numbers',
      tip: 'Deal cards to several people. If any are left over, that\'s the "remainder".',
      skills: [
        { id: '3F1', name: 'Meaning of division', gen() { const g = r(2, 6), e = r(2, 6), t = g * e; if (Math.random() < 0.5) return inp(`${t} candies are shared equally among ${g} children. How many does each child get? (${t} ÷ ${g})`, e, `Give them out one by one until they're gone: each child gets <b>${e}</b>, because ${g} × ${e} = ${t}.`, { vis: V.objects('🍬', t) + '<div class="kids">' + '🧒'.repeat(g) + '</div>', meta: { op: '/', a: t, b: g } }); return inp(`${t} marbles are put in bags with ${e} marbles in each bag. How many bags? (${t} ÷ ${e})`, g, `Group them in ${e}s (${e}): there are <b>${g}</b> bags.`, { vis: V.objects('🔵', t), meta: { op: '/', a: t, b: e } }); } },
        { id: '3F2', name: 'Division facts to 100', gen() { const d = r(2, 10), q = r(1, 10); return inp(`${d * q} ÷ ${d} = ?`, q, `Think multiplication: ${d} × ? = ${d * q}. Since ${d} × ${q} = ${d * q}, the answer is <b>${q}</b>.`, { vis: V.big(`${d * q} ÷ ${d} = <span class="q">?</span>`), meta: { op: '/', a: d * q, b: d } }); } },
        { id: '3F3', name: 'Division with remainders', gen() { const d = r(2, 9), q = r(2, 9), s = r(1, d - 1), n = d * q + s; if (Math.random() < 0.5) return inp(`${n} ÷ ${d} = ? remainder ${s}`, q, `${d} × ${q} = ${d * q}, and ${n} − ${d * q} = ${s}. So the quotient is <b>${q}</b> remainder ${s}.`, { vis: V.objects('🍓', n) }); return inp(`${n} ÷ ${d} = ${q} remainder ?`, s, `${d} × ${q} = ${d * q}. The remainder is ${n} − ${d * q} = <b>${s}</b>. A remainder is always smaller than the divisor (${d}).`, { vis: V.objects('🍓', n), meta: { op: '-', a: n, b: d * q } }); } },
        { id: '3F4', name: 'Division word problems', gen() { const d = r(3, 9), q = r(3, 9), s = r(1, d - 1), n = d * q + s; if (Math.random() < 0.5) return inp(`${n} students are riding in cars. Each car holds ${d} students. How many cars are needed for all the students?`, q + 1, `${n} ÷ ${d} = ${q} remainder ${s}. The remaining ${s} students still need 1 more car, so <b>${q + 1}</b> cars.`, { meta: { alt: { [String(q)]: 'left' } } }); return inp(`Mom has ${n} cakes and puts ${d} cakes in each box. How many boxes are completely full?`, q, `${n} ÷ ${d} = ${q} remainder ${s}. There are <b>${q}</b> full boxes, and the remaining ${s} cakes aren't enough for another box.`, { meta: { alt: { [String(q + 1)]: 'left' } } }); } },
      ],
    },
    {
      id: '3G', grade: 3, name: 'Column multiplication and division', icon: '🧮', color: '#00cec9',
      sg: '3A · Multiplication and Division (2- and 3-digit by 1-digit)', ixl: 'U', km: 'Numbers',
      tip: 'Multiply by place: 46 × 3 = 40 × 3 + 6 × 3 = 120 + 18 = 138.',
      skills: [
        { id: '3G1', name: 'Two digits times one digit', gen() { const a = r(12, 99), b = r(2, 9), t = Math.floor(a / 10) * 10, o = a % 10; return inp(`${a} × ${b} = ?`, a * b, `${a} × ${b} = ${t} × ${b} + ${o} × ${b} = ${t * b} + ${o * b} = <b>${a * b}</b>.`, { vis: stack(a, '×', b), meta: { op: 'x', a, b } }); } },
        { id: '3G2', name: 'Three digits times one digit', gen() { const a = r(101, 999), b = r(2, 9); return inp(`${a} × ${b} = ?`, a * b, `Multiply the ones, tens, then hundreds by ${b}, and don't forget to carry. The answer is <b>${fmt(a * b)}</b>.`, { vis: stack(a, '×', b), meta: { op: 'x', a, b } }); } },
        { id: '3G3', name: 'Long division (no remainder)', gen() { const d = r(2, 6), q = r(11, Math.floor(99 / d)), n = d * q; return inp(`${n} ÷ ${d} = ?`, q, `Divide the tens first, then the ones. Check: ${d} × ${q} = ${n}. The answer is <b>${q}</b>.`, { vis: window.METIQ_KOLOM.porogapit(n, d), meta: { op: '/', a: n, b: d } }); } },
        { id: '3G4', name: 'Multiplying by tens and hundreds', gen() { const a = r(2, 9), k = pick([10, 100]), b = r(2, 9); return inp(`${a * k} × ${b} = ?`, a * k * b, `${a} × ${b} = ${a * b}, then add ${k === 10 ? 'satu' : 'dua'} zeros: <b>${fmt(a * k * b)}</b>.`, { vis: V.big(`${a * k} × ${b} = <span class="q">?</span>`), meta: { op: 'x', a: a * k, b } }); } },
      ],
    },
    {
      id: '3H', grade: 3, name: 'Word problems and missing numbers', icon: '📘', color: '#66ffdb',
      sg: '3A/3B · Word Problems (bar model, multiplication)', ixl: 'CC, DD, EE, T', km: 'Algebra (number sentences with an unknown value)',
      tip: 'For "3 times as many", draw 1 bar for the small amount and 3 equal bars for the large amount.',
      skills: [
        { id: '3H1', name: 'Two-step word problems', gen() { const g = r(3, 8), e = r(4, 12), x = r(2, Math.min(9, g * e - 1)); const t = pick([[`Mom buys ${g} cartons of eggs with ${e} eggs each. ${x} eggs break. How many eggs are still whole?`, g * e - x, `${g} × ${e} = ${g * e}, then ${g * e} − ${x}`], [`There are ${g} shelves with ${e} books on each. Then ${x} new books are put on the table. How many books altogether?`, g * e + x, `${g} × ${e} = ${g * e}, then ${g * e} + ${x}`]]); return inp(t[0], t[1], `Steps 1 and 2: ${t[2]} = <b>${t[1]}</b>.`); } },
        { id: '3H2', name: 'Finding missing numbers', gen() { const t = r(0, 3); if (t === 0) { const b = r(120, 480), c = r(b + 50, 999); return inp(`? + ${b} = ${c}`, c - b, `? = ${c} − ${b} = <b>${c - b}</b>.`, { vis: V.big(`<span class="q">?</span> + ${b} = ${c}`), meta: { op: '-', a: c, b } }); } if (t === 1) { const b = r(110, 400), c = r(100, 500); return inp(`? − ${b} = ${c}`, b + c, `The inverse of subtracting is adding: ? = ${c} + ${b} = <b>${b + c}</b>.`, { vis: V.big(`<span class="q">?</span> − ${b} = ${c}`), meta: { op: '+', a: c, b } }); } if (t === 2) { const d = r(2, 9), q = r(2, 9); return inp(`${d * q} ÷ ? = ${q}`, d, `${d * q} divided by what gives ${q}? ${d * q} ÷ ${d} = ${q}. The answer is <b>${d}</b>.`, { vis: V.big(`${d * q} ÷ <span class="q">?</span> = ${q}`) }); } const a = r(3, 9), b = r(3, 9); return inp(`${a} × ? = ${a * b}`, b, `${a * b} ÷ ${a} = <b>${b}</b>.`, { vis: V.big(`${a} × <span class="q">?</span> = ${a * b}`) }); } },
        { id: '3H3', name: '"Times as many" problems with bar models', gen() { const [n1, n2] = two(), a = r(4, 15), k = r(2, 5); const segs = range(1, k).map(() => [a, '', 1]); if (Math.random() < 0.5) return inp(`${n1} has ${a} marbles. ${n2} has ${k} times as many. How many marbles does ${n2} have?`, a * k, `${n2}'s bar = ${k} of ${n1}'s bars: ${k} × ${a} = <b>${a * k}</b>.`, { vis: V.barModel([[[a, n1, 1]], segs]), meta: { op: 'x', a: k, b: a } }); return inp(`${n1} has ${a} marbles. ${n2} has ${k} times as many. How many marbles do they have together?`, a * (k + 1), `There are ${k} + 1 = ${k + 1} equal bars: ${k + 1} × ${a} = <b>${a * (k + 1)}</b>.`, { vis: V.barModel([[[a, n1, 1]], segs], '?') }); } },
      ],
    },
    {
      id: '3I', grade: 3, name: 'Understanding fractions', icon: '🍕', color: '#fab1a0',
      sg: '3B · Fractions (equivalent fractions)', ixl: 'FF, GG, HH, II, JJ', km: 'Numbers (equivalent fractions; CP Phase B)',
      tip: 'Fold paper into 2, then 4, then 8. Show that 1/2 = 2/4 = 4/8 by shading.',
      skills: [
        { id: '3I1', name: 'Fractions from pictures and sets of objects', gen() { const n = r(3, 9), k = r(1, n - 1), good = `${k}/${n}`; const tags = {}; [`${n - k}/${n}`, `${k}/${n - k}`, `${n}/${k}`].forEach((a) => { tags[a] = 'pecahan'; }); if (Math.random() < 0.5) return ch('What fraction of the balls are red?', opts4(good, Object.keys(tags)), good, `There are ${n} balls (denominator ${n}), and ${k} are red (numerator ${k}). The answer is <b>${good}</b>.`, { vis: `<div class="objs">${'🔴'.repeat(k)}${'⚪'.repeat(n - k)}</div>`, optionTags: tags }); return ch('What part is shaded?', opts4(good, Object.keys(tags)), good, `${n} equal parts, ${k} shaded: <b>${good}</b>.`, { vis: V.fraction('rect', n, k), optionTags: tags }); } },
        { id: '3I2', name: 'Fractions on a number line', gen() { const den = pick([2, 3, 4, 5, 6, 8]), w = pick([1, 1, 2]); let num = r(1, den * w - 1); if (num % den === 0) num++; const good = `${num}/${den}`; return ch('What fraction does the arrow point to?', opts4(good, [`${num + 1}/${den}`, `${Math.max(1, num - 1)}/${den}`, `${num}/${den + 1}`, `1/${num}`]), good, `Each unit is divided into ${den} equal parts. The arrow is on mark ${num}, so <b>${good}</b>.`, { vis: U.fracNL(den, w, num) }); } },
        { id: '3I3', name: 'Equivalent fractions', gen() { const d = r(2, 6), n = r(1, d - 1), k = r(2, 4); if (Math.random() < 0.5) return inp(`${n}/${d} = ?/${d * k}`, n * k, `The denominator is multiplied by ${k} (${d} × ${k} = ${d * k}), so the numerator is multiplied by ${k} too: ${n} × ${k} = <b>${n * k}</b>.`, { vis: `<div class="fstack">${V.fraction('rect', d, n)}${V.fraction('rect', d * k, n * k)}</div>` }); return inp(`${n}/${d} = ${n * k}/?`, d * k, `The numerator is multiplied by ${k}, so the denominator is multiplied by ${k} too: ${d} × ${k} = <b>${d * k}</b>.`); } },
        { id: '3I4', name: 'Fractions equal to whole numbers', gen() { const d = r(2, 8), w = r(1, 4); if (Math.random() < 0.6) return inp(`${d * w}/${d} = ?`, w, `${d * w} parts, and every ${d} parts = 1 whole. ${d * w} ÷ ${d} = <b>${w}</b>.`, { vis: range(1, w).map(() => V.fraction('rect', d, d)).join('') }); return inp(`?/${d} = ${w}`, d * w, `${w} wholes = ${w} × ${d} = <b>${d * w}</b> parts out of ${d}.`); } },
      ],
    },
    {
      id: '3J', grade: 3, name: 'Comparing and adding fractions', icon: '⚖️', color: '#55efc4',
      sg: '3B · Fractions (compare, add and subtract like fractions)', ixl: 'KK, LL, MM, NN', km: 'Numbers',
      tip: 'Same denominators: compare the numerators. Same numerators: the smaller denominator is actually larger.',
      skills: [
        { id: '3J1', name: 'Comparing fractions with the same denominator', gen() { const d = r(3, 12), a = r(1, d - 1), b = r(1, d - 1); const q = cmpFrac(`${a}/${d}`, `${b}/${d}`, a, b); q.explain = `The denominators are the same (${d}), so compare the numerators: ${a} ${q.answer} ${b}. The answer is <b>${a}/${d} ${q.answer} ${b}/${d}</b>.`; return q; } },
        { id: '3J2', name: 'Comparing fractions with the same numerator', gen() { const n = r(1, 3), [d1, d2] = shuffle(range(n + 1, 12)).slice(0, 2); const s = d1 < d2 ? '>' : '<'; const tags = { [s === '>' ? '<' : '>']: 'pecahan-satuan' }; const q = cmpFrac(`${n}/${d1}`, `${n}/${d2}`, 1 / d1, 1 / d2, tags); q.explain = `The numerators are the same. The larger the denominator, the smaller the part. So <b>${n}/${d1} ${s} ${n}/${d2}</b>.`; return q; } },
        { id: '3J3', name: 'Ordering fractions', gen() { const d = r(5, 12); const ns = shuffle(range(1, d - 1)).slice(0, 3); const asc = Math.random() < 0.5; const sorted = ns.slice().sort((a, b) => (asc ? a - b : b - a)).map((n) => `${n}/${d}`); const ok = sorted.join(', '); const perms = [[0, 2, 1], [1, 0, 2], [2, 1, 0], [2, 0, 1]].map((p) => p.map((i) => sorted[i]).join(', ')); return ch(`Order them starting from the ${asc ? 'smallest' : 'largest'}.`, opts4(ok, perms), ok, `The denominators are the same, so order the numerators. The answer is <b>${ok}</b>.`, { vis: V.seq(ns.map((n) => `${n}/${d}`)) }); } },
        { id: '3J4', name: 'Adding and subtracting fractions with the same denominator', gen() { const d = r(4, 12), a = r(1, d - 2), b = r(1, d - a); const plus = Math.random() < 0.6 || a === b; if (plus) { const good = `${a + b}/${d}`; return ch(`${a}/${d} + ${b}/${d} = ?`, opts4(good, [`${a + b}/${d * 2}`, `${a * b}/${d}`, `${Math.abs(a - b) || 1}/${d}`]), good, `The denominator stays ${d}; add only the numerators: ${a} + ${b} = ${a + b}. The answer is <b>${good}</b>.`, { optionTags: { [`${a + b}/${d * 2}`]: 'penyebut-dijumlah' } }); } const [x, y] = a > b ? [a, b] : [b, a]; const good = `${x - y}/${d}`; return ch(`${x}/${d} − ${y}/${d} = ?`, opts4(good, [`${x + y}/${d}`, `${x - y}/${d * 2}`, `${x - y + 1}/${d}`]), good, `The denominator stays ${d}; subtract the numerators: ${x} − ${y} = ${x - y}. The answer is <b>${good}</b>.`); } },
      ],
    },
    {
      id: '3K', grade: 3, name: 'Area and perimeter', icon: '📐', color: '#fdcb6e',
      sg: '3B · Area and Perimeter', ixl: 'OO, PP, QQ', km: 'Measurement (area and perimeter)',
      tip: 'Measure the perimeter of a table with a tape measure (the sum of all sides), and count the area of bedroom floor tiles (number of tiles).',
      skills: [
        { id: '3K1', name: 'Area by counting squares', gen() { const rows = r(2, 6), cols = r(2, 8); return inp('What is the area of this shape in square units?', rows * cols, `Count the squares: ${rows} rows × ${cols} columns = <b>${rows * cols}</b> square units.`, { vis: grid(rows, cols), meta: { op: 'x', a: rows, b: cols } }); } },
        { id: '3K2', name: 'Area of a rectangle', gen() { const w = r(3, 15), h = r(2, 10); return inp(`What is the area of this rectangle in cm²?`, w * h, `Area = length × width = ${w} × ${h} = <b>${w * h}</b> cm².`, { vis: U.rectLabel(w, h), meta: { op: 'x', a: w, b: h, alt: { [String(2 * (w + h))]: 'luas-keliling' } } }); } },
        { id: '3K3', name: 'Perimeter', gen() { if (Math.random() < 0.5) { const s = r(2, 15); return inp(`What is the perimeter in cm of a square with side ${s} cm?`, 4 * s, `A square has 4 equal sides: 4 × ${s} = <b>${4 * s}</b> cm.`, { vis: U.rectLabel(s, s), meta: { alt: { [String(s * s)]: 'luas-keliling' } } }); } const w = r(3, 15), h = r(2, 10); return inp('What is the perimeter of this rectangle in cm?', 2 * (w + h), `Perimeter = ${w} + ${h} + ${w} + ${h} = <b>${2 * (w + h)}</b> cm.`, { vis: U.rectLabel(w, h), meta: { alt: { [String(w * h)]: 'luas-keliling' } } }); } },
        { id: '3K4', name: 'Finding a side from the perimeter', gen() { if (Math.random() < 0.5) { const s = r(3, 15); return inp(`The perimeter of a square is ${4 * s} cm. How long is each side in cm?`, s, `4 equal sides: ${4 * s} ÷ 4 = <b>${s}</b> cm.`); } const w = r(5, 15), h = r(2, w - 1); return inp(`The perimeter of a rectangle is ${2 * (w + h)} cm and its length is ${w} cm. What is its width in cm?`, h, `Length + width = ${2 * (w + h)} ÷ 2 = ${w + h}. Width = ${w + h} − ${w} = <b>${h}</b> cm.`); } },
      ],
    },
    {
      id: '3L', grade: 3, name: 'Lines, angles, and quadrilaterals', icon: '🔷', color: '#e84393',
      sg: '3B · Angles, Perpendicular and Parallel Lines', ixl: 'RR, SS, TT', km: 'Geometry (properties of triangles and quadrilaterals)',
      tip: 'Use the corner of a sheet of paper as a "right-angle checker" to find right angles at home.',
      skills: [
        { id: '3L1', name: 'Types of quadrilaterals', gen() { const Q = [['square', '4 equal sides and 4 right angles'], ['rectangle', 'opposite sides equal and 4 right angles, but not all sides equal'], ['rhombus', '4 equal sides, but the angles aren\'t right angles'], ['parallelogram', 'two pairs of opposite sides parallel and equal, with no right angles'], ['trapezoid', 'only one pair of parallel sides']]; const [nm, clue] = pick(Q); const names = Q.map((x) => x[0]); if (Math.random() < 0.5) return ch(`Which shape has ${clue}?`, opts4(nm, names), nm, `The shape with ${clue} is a <b>${nm}</b>.`); return ch('What is this quadrilateral called?', opts4(nm, names), nm, `This is a <b>${nm}</b>: ${clue}.`, { vis: nm === 'parallelogram' ? JAJAR : V.shape(nm, '#0984e3') }); } },
        { id: '3L2', name: 'Right angle', gen() { const t = pick([0, 1, 2]); const deg = t === 1 ? 90 : t === 0 ? r(20, 70) : r(110, 160); const opts = ['smaller than a right angle', 'a right angle', 'larger than a right angle']; return ch('This angle is...', opts, opts[t], `Compare it with the corner of a sheet of paper (90°). This angle is <b>${opts[t]}</b>.`, { vis: U.angle(deg) }); } },
        { id: '3L3', name: 'Parallel and perpendicular lines', gen() { const k = pick(['parallel', 'perpendicular', 'intersecting']); return ch('These two lines are...', ['parallel', 'perpendicular', 'intersecting'], k, { "parallel": 'Parallel lines never meet, even when extended.', 'tegak lurus': 'Perpendicular lines cross to form a right angle.', "intersecting": 'These lines meet at one point but don\'t form a right angle.' }[k] + ` The answer is <b>${k}</b>.`, { vis: U.lines(k) }); } },
      ],
    },
    {
      id: '3M', grade: 3, name: 'Time', icon: '⏰', color: '#ffeaa7',
      sg: '3B · Time (minutes, duration)', ixl: 'UU, VV', km: 'Measurement (time duration)',
      tip: 'During a trip, ask: "We left at 7:40 and arrived at 8:15. How many minutes was the trip?"',
      skills: [
        { id: '3M1', name: 'Reading the clock to the minute', gen() { const h = r(1, 12); let m = r(1, 59); if (m % 5 === 0) m++; const t = (hh, mm) => `${hh}:${String(mm).padStart(2, '0')}`; const good = t(h, m); return ch('What time is it?', opts4(good, [t(h, (m + 5) % 60), t(h % 12 + 1, m), t(h, Math.max(1, m - 2)), t(h, Math.floor(m / 5))]), good, `The short hand has passed ${h}. Long hand: count by 5s up to the number before the hand (${Math.floor(m / 5) * 5}), then add ${m % 5} small marks = ${m} minutes. So it's <b>${good}</b>.`, { vis: V.clock(h, m), optionTags: { [t(h, Math.floor(m / 5))]: 'jam-menit', [t(h % 12 + 1, m)]: 'jam-tertukar' } }); } },
        { id: '3M2', name: 'Elapsed time in minutes', gen() { const h = r(6, 15), m = r(0, 11) * 5, d = r(3, 30) * 5; const e = h * 60 + m + d; if (Math.random() < 0.5) return inp(`Starts at ${hm(h, m)}, ends at ${hm(Math.floor(e / 60), e % 60)}. How many minutes long is it?`, d, `Count from ${hm(h, m)} to ${hm(Math.floor(e / 60), e % 60)}: <b>${d}</b> minutes${d >= 60 ? ` (${Math.floor(d / 60)} hours ${d % 60} minutes)` : ''}.`); const good = `${hm(Math.floor(e / 60), e % 60)} o'clock`; const alt = (x) => `${hm(Math.floor(x / 60), x % 60)} o'clock`; return ch(`A movie starts at ${hm(h, m)} and runs for ${d} minutes. What time does it end?`, opts4(good, [alt(e + 10), alt(e - 10), alt(h * 60 + m + (d % 60) + 100), alt(e + 60)]), good, `${hm(h, m)} + ${d} minutes = <b>${good.slice(6)}</b>.`); } },
        { id: '3M3', name: 'Hours, minutes, and seconds', gen() { const t = r(0, 3); if (t === 0) { const h = r(2, 5); return inp(`${h} hours = ? minutes`, h * 60, `1 hour = 60 minutes, so ${h} × 60 = <b>${h * 60}</b> minutes.`, { meta: { kind: 'unit' } }); } if (t === 1) { const m = r(2, 5); return inp(`${m} minutes = ? seconds`, m * 60, `1 minute = 60 seconds: ${m} × 60 = <b>${m * 60}</b> seconds.`, { meta: { kind: 'unit' } }); } if (t === 2) { const h = r(1, 3), m = r(5, 55); return inp(`${h} hours ${m} minutes = ? minutes`, h * 60 + m, `${h} × 60 + ${m} = <b>${h * 60 + m}</b> minutes.`); } const tot = r(70, 230); return inp(`${tot} minutes = ${Math.floor(tot / 60)} hours ? minutes`, tot % 60, `${Math.floor(tot / 60)} hours = ${Math.floor(tot / 60) * 60} minutes. ${tot} − ${Math.floor(tot / 60) * 60} = <b>${tot % 60}</b> minutes.`); } },
      ],
    },
    {
      id: '3N', grade: 3, name: 'Length, weight, and volume', icon: '📏', color: '#81ecec',
      sg: '3A/3B · Length (km, m, cm), Mass (kg, g), Volume (ℓ, mℓ)', ixl: 'XX (metric; the US units in WW aren\'t used)', km: 'Measurement (standard units)',
      tip: 'Read package labels together: milk 250 mL, oil 2 L, sugar 1 kg. Ask: "How many mL in 2 L?"',
      skills: [
        { id: '3N1', name: 'Converting units', gen() { const [big, small, f] = pick([['m', 'cm', 100], ['km', 'm', 1000], ['kg', 'g', 1000], ['L', 'mL', 1000], ['cm', 'mm', 10]]); if (Math.random() < 0.5) { const n = r(2, 9); return inp(`${n} ${big} = ? ${small}`, n * f, `1 ${big} = ${fmt(f)} ${small}, so ${n} × ${fmt(f)} = <b>${fmt(n * f)}</b> ${small}.`, { meta: { kind: 'unit' } }); } const n = r(1, 5), p = r(1, f - 1); return inp(`${n} ${big} ${p} ${small} = ? ${small}`, n * f + p, `${n} ${big} = ${fmt(n * f)} ${small}, plus ${p}: <b>${fmt(n * f + p)}</b> ${small}.`, { meta: { kind: 'unit' } }); } },
        { id: '3N2', name: 'Choosing the right unit', gen() { const [q, u, all] = pick([['A teaspoon of medicine', 'mL', ['mL', 'L']], ['A full bathtub', 'L', ['mL', 'L']], ['A glass of water', 'mL', ['mL', 'L']], ['The weight of a cat', 'kg', ['g', 'kg']], ['The weight of a button', 'g', ['g', 'kg']], ['The distance from Jakarta to Bandung', 'km', ['cm', 'm', 'km']], ['The length of a classroom', 'm', ['cm', 'm', 'km']], ['The length of a pencil', 'cm', ['cm', 'm', 'km']]]); return ch(`${q} is best measured in...`, all, u, `Choose the unit that fits the size of the object. The answer is <b>${u}</b>.`); } },
        { id: '3N3', name: 'Measurement word problems', gen() { const t = r(0, 2); if (t === 0) { const used = r(1, 9) * 50 + 50; return inp(`A bottle holds 1 L of water. ${two()[0]} has drunk ${used} mL. How many mL are left?`, 1000 - used, `1 L = 1,000 mL. 1,000 − ${used} = <b>${1000 - used}</b> mL.`, { meta: { kind: 'unit', op: '-', a: 1000, b: used } }); } if (t === 1) { const kg = r(1, 4), g = r(1, 9) * 100; return inp(`A bag holds books weighing ${kg} kg and a lunch box of ${g} g. How many grams in all?`, kg * 1000 + g, `${kg} kg = ${fmt(kg * 1000)} g. ${fmt(kg * 1000)} + ${g} = <b>${fmt(kg * 1000 + g)}</b> g.`, { meta: { kind: 'unit' } }); } const a = r(120, 480), b = r(120, 480); return inp(`${two()[0]} runs ${a} m, then walks ${b} m. How many meters in all?`, a + b, `${a} + ${b} = <b>${a + b}</b> m.`, { meta: { op: '+', a, b } }); } },
      ],
    },
    {
      id: '3O', grade: 3, name: 'Data and charts', icon: '📊', color: '#74b9ff',
      sg: '3B · Bar Graphs', ixl: 'YY', km: 'Data Analysis and Probability (bar charts)',
      tip: 'Collect simple data (colors of cars on the street) and make a bar chart with a scale of 5.',
      skills: [
        { id: '3O1', name: 'Bar charts with a scale', gen() { const cats = shuffle(['Soccer', 'Badminton', 'Swimming', 'Basketball']).slice(0, 4); const vals = cats.map(() => r(1, 10) * 5); const rows = cats.map((c, i) => [c.split(' ')[0], vals[i]]); const vis = U.barGraph('Favorite Sports', rows, 50, 5); if (Math.random() < 0.6) { const i = r(0, 3); return inp(`How many students like ${cats[i].toLowerCase()}?`, vals[i], `Each line is worth 5. The top of the ${cats[i]} bar is at <b>${vals[i]}</b>.`, { vis }); } const [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2); const [x, y] = vals[i] >= vals[j] ? [i, j] : [j, i]; return inp(`How many more students like ${cats[x].toLowerCase()} than ${cats[y].toLowerCase()}?`, vals[x] - vals[y], `${vals[x]} − ${vals[y]} = <b>${vals[x] - vals[y]}</b>.`, { vis, meta: { op: '-', a: vals[x], b: vals[y] } }); } },
        { id: '3O2', name: 'Pictographs with a scale', gen() { const sc = pick([3, 4, 10]); const cats = shuffle([['🚌', 'Bus'], ['🚗', 'Car'], ['🛵', 'Motorcycle'], ['🚲', 'Bicycle']]).slice(0, 3); const icons = shuffle(range(1, 6)).slice(0, 3); const rows = cats.map((c, i) => [c[0], c[1], icons[i]]); const i = r(0, 2); return inp(`How many students come by ${rows[i][1].toLowerCase()}?`, icons[i] * sc, `${icons[i]} pictures × ${sc} = <b>${icons[i] * sc}</b> students.`, { vis: V.pictograph('Vehicles to School', rows, `Each picture = ${sc} students`), meta: { kind: 'scale', icons: icons[i] } }); } },
        { id: '3O3', name: 'Reading tables', gen() { const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']; const v = days.map(() => r(12, 60)); const i = r(0, 4), j = (i + r(1, 4)) % 5; const vis = U.table(['Day', 'Bottles collected'], days.map((d, k) => [d, v[k]])); if (Math.random() < 0.5) return inp(`How many bottles were collected on ${days[i]} and ${days[j]}?`, v[i] + v[j], `${v[i]} + ${v[j]} = <b>${v[i] + v[j]}</b>.`, { vis, meta: { op: '+', a: v[i], b: v[j] } }); const tot = v.reduce((a, b) => a + b, 0); return inp('How many bottles were collected over the five days?', tot, `${v.join(' + ')} = <b>${tot}</b>.`, { vis }); } },
      ],
    },
    {
      id: '3P', grade: 3, name: 'Money', icon: '💰', color: '#00b894',
      sg: '3A · Money', ixl: 'ZZ', km: 'Numbers (money context)',
      tip: 'Give your child a budget (e.g. Rp20,000) to buy a few items and count what\'s left.',
      skills: [
        { id: '3P1', name: 'Shopping totals and change', gen() { const items = shuffle([['🍞', 'bread', r(5, 16) * 500], ['🥛', 'milk', r(8, 20) * 500], ['📒', 'books', r(3, 9) * 1000], ['🖊️', 'pens', r(4, 10) * 500], ['🍎', 'apples', r(4, 14) * 1000]]).slice(0, 2); const tot = items[0][2] + items[1][2], pay = tot < 20000 ? pick([20000, 50000]) : pick([50000, 100000]); return inp(`Mom buys ${items[0][1]} ${items[0][0]} ${rp(items[0][2])} and ${items[1][1]} ${items[1][0]} ${rp(items[1][2])}. Mom pays ${rp(pay)}. How much is the change? (write the number only)`, pay - tot, `Total ${rp(items[0][2])} + ${rp(items[1][2])} = ${rp(tot)}. Change ${rp(pay)} − ${rp(tot)} = <b>${rp(pay - tot)}</b>.`, { unit: 'Rp', meta: { op: '-', a: pay, b: tot } }); } },
        { id: '3P2', name: 'Price of several items', gen() { const [e, nm] = pick([['✏️', 'pencils'], ['🧃', 'boxed juice'], ['🍫', 'chocolate'], ['📏', 'penggaris']]), p = r(3, 12) * 500, n = r(2, 9); return inp(`The price of one ${nm} is ${e} ${rp(p)}. What's the price of ${n} ${nm}? (write the number only)`, p * n, `${n} × ${rp(p)} = <b>${rp(p * n)}</b>.`, { unit: 'Rp', meta: { op: 'x', a: n, b: p } }); } },
      ],
    },
  ];

  C.register(UNITS);
  C.GRADES.push({ id: 3, name: 'Grade 3', ixl: 'https://www.ixl.com/math/grade-3', sg: 'Primary Mathematics / Dimensions Math 3A and 3B' });
})();
