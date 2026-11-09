/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Kurikulum Matematika Kelas 4
 * Dari daftar keterampilan IXL kelas 4 dan Singapore Math 4A/4B: bilangan sampai 1.000.000,
 * faktor dan kelipatan, perkalian 2 angka × 2 angka, pembagian bersisa, urutan operasi,
 * pecahan campuran dan operasi pecahan, desimal, sudut dalam derajat, simetri, dan diagram garis.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, range, rp, kata, V, inp, ch, two, fmt, dec, opts4, gcd, lcm, fs, hasCarry, hasBorrow, stack, U } = C.kit;
  const R = (n, t) => Math.floor(n / t + 0.5) * t;
  const hm = (h, m) => `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
  const cmpBig = (a, b, fa = fmt(a), fb = fmt(b), tags = {}) => { const s = a < b ? '<' : a > b ? '>' : '='; return ch('Choose the correct sign.', ['<', '>', '='], s, `${fa} ${s === '<' ? 'less than' : s === '>' ? 'greater than' : 'equal to'} ${fb}. The answer is <b>${fa} ${s} ${fb}</b>.`, { vis: V.big(`${fa} <span class="q">?</span> ${fb}`), optionTags: tags }); };
  const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const DIR = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
  const JAJAR = '<svg class="shape" viewBox="0 0 120 120" style="fill:#0984e3"><polygon points="6,96 82,96 114,24 38,24"/></svg>';
  const TRAP = '<svg class="shape" viewBox="0 0 120 120" style="fill:#0984e3"><polygon points="30,30 90,30 114,96 6,96"/></svg>';

  const UNITS = [
    {
      id: '4A', grade: 4, name: 'Numbers to 1,000,000', icon: '🔢', color: '#ff7a59',
      sg: '4A · Numbers to 100,000 (extended)', ixl: 'A, B, C', km: 'Numbers (CP Phase B to 10,000; Phase C to 1,000,000)',
      tip: 'Read large numbers from the news (population, motorcycle prices) and ask your child to write them.',
      skills: [
        { id: '4A1', name: 'Digit value to the hundred thousands', gen() { const d = shuffle(range(1, 9)).slice(0, 6), n = +d.join(''), pos = r(0, 5), val = d[pos] * 10 ** (5 - pos); const names = ['hundred thousands', 'ten thousands', 'thousands', 'hundreds', 'tens', 'ones']; return ch(`In the number <b>${fmt(n)}</b>, what is the value of the digit ${d[pos]}?`, opts4(fmt(val), [0, 1, 2, 3, 4, 5].map((p) => fmt(d[pos] * 10 ** p))), fmt(val), `The digit ${d[pos]} is in the ${names[pos]} place, so its value is <b>${fmt(val)}</b>.`, { optionTags: { [String(d[pos])]: 'nilai-tempat' } }); } },
        { id: '4A2', name: 'Reading and writing large numbers', gen() { const n = r(10001, 999999); const cands = [n + 10000, n - 1000, n + 100, Math.floor(n / 10), n * 10].filter((x) => x > 1000 && x < 1e7); if (Math.random() < 0.5) return ch(`Which number is read "<b>${kata(n)}</b>"?`, opts4(fmt(n), cands.map(fmt)), fmt(n), `"${kata(n)}" is written <b>${fmt(n)}</b>. Group three digits from the right with a comma.`); const o = opts4(fmt(n), cands.map(fmt)); return ch(`How do you read ${fmt(n)}?`, o.map((x) => kata(+x.replace(/,/g, ''))), kata(n), `${fmt(n)} is read as <b>${kata(n)}</b>.`); } },
        { id: '4A3', name: 'Rounding large numbers', gen() { const t = pick([1000, 10000, 100000]), n = r(10001, 989999); if (n % t === 0) return C.SKILLS['4A3'].gen(); const lo = Math.floor(n / t) * t, ans = R(n, t); return inp(`Round ${fmt(n)} to the nearest ${{ 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands' }[t]}.`, ans, `${fmt(n)} is between ${fmt(lo)} and ${fmt(lo + t)}. Look at the digit to the right of the rounding place: 5 or more rounds up. The answer is <b>${fmt(ans)}</b>.`, { meta: { kind: 'round', wrong: ans === lo ? lo + t : lo } }); } },
        { id: '4A4', name: 'Comparing large numbers', gen() { const a = r(10000, 999999), b = Math.random() < 0.5 ? Math.floor(a / 10000) * 10000 + r(0, 9999) : r(10000, 999999); return cmpBig(a, b); } },
      ],
    },
    {
      id: '4B', grade: 4, name: 'Adding and subtracting large numbers', icon: '➕', color: '#1fbf9f',
      sg: '4A · Addition and Subtraction', ixl: 'D, E', km: 'Numbers',
      tip: 'Check results by estimating first: 48,920 + 31,150 is about 49,000 + 31,000 = 80,000.',
      skills: [
        { id: '4B1', name: 'Adding five-digit numbers', gen() { const a = r(10000, 60000), b = r(10000, 39999); return inp(`${a} + ${b} = ?`, a + b, `Add vertically from the ones to the ten thousands. The answer is <b>${fmt(a + b)}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } },
        { id: '4B2', name: 'Subtracting five-digit numbers', gen() { let a, b; do { a = r(30000, 99999); b = r(10000, a - 1000); } while (!hasBorrow(a, b)); return inp(`${a} − ${b} = ?`, a - b, `Subtract vertically; borrow from the left column if the top digit is smaller. The answer is <b>${fmt(a - b)}</b>.`, { vis: stack(a, '−', b), meta: { op: '-', a, b, regroup: true } }); } },
        { id: '4B3', name: 'Word problems with large numbers', gen() { if (Math.random() < 0.5) { const a = r(12000, 48000), b = r(9000, 40000); return inp(`Sukamaju Village has ${fmt(a)} people and Sukajadi Village has ${fmt(b)} people. What's the total population of the two villages?`, a + b, `${fmt(a)} + ${fmt(b)} = <b>${fmt(a + b)}</b> people.`, { meta: { op: '+', a, b } }); } const a = r(50000, 98000), b = r(12000, a - 5000); return inp(`A stadium has ${fmt(a)} seats. ${fmt(b)} seats are taken. How many seats are still empty?`, a - b, `${fmt(a)} − ${fmt(b)} = <b>${fmt(a - b)}</b> seats.`, { meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
      ],
    },
    {
      id: '4C', grade: 4, name: 'Factors and multiples', icon: '🧩', color: '#fd79a8',
      sg: '4A · Factors and Multiples', ixl: 'F', km: 'Numbers (factors and multiples; CP Phase B)',
      tip: 'Find factors by arranging objects into rectangles: 12 objects can be 1×12, 2×6, 3×4.',
      skills: [
        { id: '4C1', name: 'Factors of a number', gen() { let n; do { n = r(12, 72); } while (isPrime(n)); const fac = range(2, n - 1).filter((x) => n % x === 0), non = range(2, n - 1).filter((x) => n % x !== 0); const f = pick(fac); return ch(`Which one is a <b>factor</b> of ${n}?`, opts4(f, shuffle(non).slice(0, 5)), f, `${n} ÷ ${f} = ${n / f} with no remainder, so <b>${f}</b> is a factor of ${n}. All factors of ${n}: 1, ${fac.join(', ')}, ${n}.`); } },
        { id: '4C2', name: 'Multiples of a number', gen() { const k = r(3, 9), m = k * r(3, 12); const non = range(m - 8, m + 8).filter((x) => x > 0 && x % k !== 0); return ch(`Which one is a <b>multiple</b> of ${k}?`, opts4(m, shuffle(non).slice(0, 5)), m, `${m} = ${k} × ${m / k}, so <b>${m}</b> is a multiple of ${k}.`); } },
        { id: '4C3', name: 'Prime and composite numbers', gen() { const n = r(2, 60), p = isPrime(n) ? 'prime' : 'composite'; const fac = range(2, n - 1).filter((x) => n % x === 0); return ch(`Is ${n} prime or composite?`, ['prime', 'composite'], p, p === 'prime' ? `${n} has only two factors: 1 and ${n}. So it's <b>prime</b>.` : `${n} has other factors besides 1 and ${n} (e.g. ${fac[0]}). So it's <b>composite</b>.`); } },
        { id: '4C4', name: 'Common factors and multiples', gen() { if (Math.random() < 0.5) { const [a, b] = shuffle(range(2, 10)).slice(0, 2); return inp(`What is the least common multiple of ${a} and ${b}?`, lcm(a, b), `Multiples of ${a}: ${range(1, 6).map((i) => a * i).join(', ')}, … Multiples of ${b}: ${range(1, 6).map((i) => b * i).join(', ')}, … The smallest in common: <b>${lcm(a, b)}</b>.`); } const g = r(2, 6), [x, y] = shuffle([1, 2, 3, 5, 7]).slice(0, 2), a = g * x, b = g * y; return inp(`What is the greatest common factor of ${a} and ${b}?`, gcd(a, b), `Take the largest factor that ${a} and ${b} share: <b>${gcd(a, b)}</b>.`); } },
      ],
    },
    {
      id: '4D', grade: 4, name: 'Multiplication', icon: '✖️', color: '#e17055',
      sg: '4A · Multiplication (by 1-digit and 2-digit)', ixl: 'G, J, K, L', km: 'Numbers',
      tip: 'Multiply by parts: 34 × 26 = 34 × 20 + 34 × 6 = 680 + 204 = 884.',
      skills: [
        { id: '4D1', name: 'Four digits times one digit', gen() { const a = r(1001, 9999), b = r(2, 9); return inp(`${a} × ${b} = ?`, a * b, `Multiply each place by ${b} starting from the ones, adding carries. The answer is <b>${fmt(a * b)}</b>.`, { vis: stack(a, '×', b), meta: { op: 'x', a, b } }); } },
        { id: '4D2', name: 'Two digits times two digits', gen() { const a = r(12, 99), b = r(11, 99), t = Math.floor(b / 10) * 10, o = b % 10; return inp(`${a} × ${b} = ?`, a * b, `${a} × ${b} = ${a} × ${t} + ${a} × ${o} = ${fmt(a * t)} + ${a * o} = <b>${fmt(a * b)}</b>.`, { vis: stack(a, '×', b), meta: { op: 'x', a, b } }); } },
        { id: '4D3', name: 'Multiplying by 10, 100, and 1,000', gen() { const a = r(2, 999), k = pick([10, 100, 1000]); return inp(`${a} × ${fmt(k)} = ?`, a * k, `Multiply by ${fmt(k)}: add ${String(k).length - 1} zeros at the end. The answer is <b>${fmt(a * k)}</b>.`, { meta: { op: 'x', a, b: k, kind: 'unit' } }); } },
        { id: '4D4', name: 'Multiplication word problems', gen() { const [e, t, a, b] = pick([['📦', 'box holds', r(12, 48), r(12, 60)], ['🚌', 'bus carries', r(25, 45), r(11, 30)], ['🧺', 'basket holds', r(15, 36), r(12, 40)]]); return inp(`Each ${t.split(' ')[0]} ${t.split(' ').slice(1).join(' ')} ${a} ${e === '🚌' ? 'passengers' : 'fruit'}. How many ${e === '🚌' ? 'passengers' : 'fruit'} in ${b} ${t.split(' ')[0]}?`, a * b, `${b} × ${a} = <b>${fmt(a * b)}</b>.`, { vis: `<div class="bigemoji sm">${e}</div>`, meta: { op: 'x', a, b } }); } },
      ],
    },
    {
      id: '4E', grade: 4, name: 'Division', icon: '➗', color: '#0984e3',
      sg: '4A · Division (by 1-digit, with remainder)', ixl: 'H, M, N', km: 'Numbers',
      tip: 'Check division with multiplication: 875 ÷ 7 = 125, because 125 × 7 = 875.',
      skills: [
        { id: '4E1', name: 'Long division by one digit', gen() { const d = r(2, 9), q = r(101, Math.floor(9999 / d)), n = d * q; return inp(`${n} ÷ ${d} = ?`, q, `Divide from the largest place: thousands/hundreds, tens, then ones. Check: ${q} × ${d} = ${n}. The answer is <b>${fmt(q)}</b>.`, { vis: window.METIQ_KOLOM.porogapit(n, d), meta: { op: '/', a: n, b: d } }); } },
        { id: '4E2', name: 'Division with remainders', gen() { const d = r(3, 9), q = r(21, 199), s = r(1, d - 1), n = d * q + s; if (Math.random() < 0.5) return inp(`${n} ÷ ${d} = ? remainder ${s}`, q, `${q} × ${d} = ${d * q}; ${n} − ${d * q} = ${s}. The quotient is <b>${q}</b>.`, { vis: window.METIQ_KOLOM.porogapit(n, d), meta: { op: '/', a: n, b: d } }); return inp(`${n} ÷ ${d} = ${q} remainder ?`, s, `${q} × ${d} = ${d * q}. Remainder = ${n} − ${d * q} = <b>${s}</b>.`, { meta: { op: '/', a: n, b: d } }); } },
        { id: '4E3', name: 'Dividing by 10, 100, and 1,000', gen() { const k = pick([10, 100, 1000]), q = r(2, 999), n = q * k; return inp(`${fmt(n)} ÷ ${fmt(k)} = ?`, q, `Divide by ${fmt(k)}: remove ${String(k).length - 1} zeros from the end. The answer is <b>${q}</b>.`, { meta: { op: '/', a: n, b: k, kind: 'unit' } }); } },
        { id: '4E4', name: 'Word problems with remainders', gen() { const d = r(4, 9), q = r(8, 40), s = r(1, d - 1), n = d * q + s; if (Math.random() < 0.5) return inp(`${n} participants will ride rubber boats. Each boat holds ${d} people. How many boats are needed?`, q + 1, `${n} ÷ ${d} = ${q} remainder ${s}. The remaining ${s} people need 1 more boat: <b>${q + 1}</b> boats.`, { meta: { alt: { [String(q)]: 'left' }, op: '/', a: n, b: d } }); return inp(`There are ${n} books to be arranged in stacks of ${d}. How many complete stacks can be made?`, q, `${n} ÷ ${d} = ${q} remainder ${s}. There are <b>${q}</b> complete stacks.`, { meta: { alt: { [String(q + 1)]: 'left' }, op: '/', a: n, b: d } }); } },
      ],
    },
    {
      id: '4F', grade: 4, name: 'Multi-step problems and order of operations', icon: '📘', color: '#00cec9',
      sg: '4A · Word Problems; Order of Operations', ixl: 'I, P', km: 'Algebra; Numbers',
      tip: 'Order of operations: parentheses first, then multiply and divide (left to right), then add and subtract (left to right).',
      skills: [
        { id: '4F1', name: 'Multi-step word problems', gen() { const a = r(3, 6) * 5000 + 5000, na = r(2, 4), b = r(5, 12) * 5000, nb = r(1, 3); const tot = a * na + b * nb, pay = Math.ceil(tot / 50000) * 50000 + (tot % 50000 === 0 ? 50000 : 0); return inp(`Dad buys ${na} shirts at ${rp(a)} each and ${nb} pairs of pants at ${rp(b)} each. Dad pays ${rp(pay)}. How much is the change? (write the number only)`, pay - tot, `Shirts: ${na} × ${rp(a)} = ${rp(a * na)}. Pants: ${nb} × ${rp(b)} = ${rp(b * nb)}. Total ${rp(tot)}. Change ${rp(pay)} − ${rp(tot)} = <b>${rp(pay - tot)}</b>.`, { unit: 'Rp' }); } },
        { id: '4F2', name: 'Order of operations', gen() { const a = r(2, 20), b = r(2, 9), c = r(2, 9); const t = r(0, 2); if (t === 0) { const ans = a + b * c; return inp(`${a} + ${b} × ${c} = ?`, ans, `Do the multiplication first: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = <b>${ans}</b>.`, { vis: V.big(`${a} + ${b} × ${c}`), meta: { alt: { [String((a + b) * c)]: 'urutan-operasi' } } }); } if (t === 1) { const q = b * c, big = r(q + 1, q + 40); return inp(`${big} − ${q} ÷ ${b} = ?`, big - c, `Divide first: ${q} ÷ ${b} = ${c}, then ${big} − ${c} = <b>${big - c}</b>.`, { vis: V.big(`${big} − ${q} ÷ ${b}`), meta: { alt: (big - q) % b === 0 ? { [String((big - q) / b)]: 'urutan-operasi' } : {} } }); } const ans = (a + b) * c; return inp(`(${a} + ${b}) × ${c} = ?`, ans, `Do the parentheses first: ${a} + ${b} = ${a + b}, then × ${c} = <b>${ans}</b>.`, { vis: V.big(`(${a} + ${b}) × ${c}`), meta: { alt: { [String(a + b * c)]: 'urutan-operasi' } } }); } },
      ],
    },
    {
      id: '4G', grade: 4, name: 'Number patterns', icon: '🔁', color: '#66ffdb',
      sg: '4A · Patterns', ixl: 'R, S', km: 'Algebra (number patterns)',
      tip: 'Ask your child to guess the rule of a pattern, then make a pattern for you to guess.',
      skills: [
        { id: '4G1', name: 'Continuing number patterns', gen() { const t = pick(['+', '-', 'x']); let seq; if (t === 'x') { const k = pick([2, 3]), s = r(1, 5); seq = range(0, 4).map((i) => s * k ** i); } else { const k = r(6, 75), s = t === '+' ? r(1, 200) : r(5 * k, 900); seq = range(0, 4).map((i) => s + (t === '+' ? 1 : -1) * i * k); } const j = r(2, 4); return inp('What number is missing?', seq[j], `The rule: ${t === 'x' ? `multiply by ${seq[1] / seq[0]}` : `${t === '+' ? 'add' : 'subtract'} ${Math.abs(seq[1] - seq[0])}`}. The answer is <b>${fmt(seq[j])}</b>.`, { log: 'Pattern: ' + seq.map((v, i) => (i === j ? '?' : v)).join(', '), vis: V.seq(seq.map((v, i) => (i === j ? '?' : v))), meta: { kind: 'seq' } }); } },
        { id: '4G2', name: 'Two-step rules', gen() { const a = r(2, 5), b = r(1, 9); const ins = shuffle(range(1, 10)).slice(0, 4).sort((x, y) => x - y); const out = ins.map((x) => a * x + b); return inp(`Table rule: multiply by ${a}, then add ${b}. What number is missing?`, out[3], `${ins[3]} × ${a} + ${b} = ${ins[3] * a} + ${b} = <b>${out[3]}</b>.`, { vis: U.table(['Log in', ...ins], [['Log out', ...out.slice(0, 3), '?']]) }); } },
        { id: '4G3', name: 'The nth term', gen() { const s = r(1, 12), k = r(2, 9), n = r(8, 20); const seq = range(0, 3).map((i) => s + i * k); return inp(`Pattern: ${seq.join(', ')}, … What is term ${n}?`, s + (n - 1) * k, `Each term goes up by ${k}. Term ${n} = ${s} + (${n} − 1) × ${k} = ${s} + ${(n - 1) * k} = <b>${s + (n - 1) * k}</b>.`); } },
      ],
    },
    {
      id: '4H', grade: 4, name: 'Equivalent fractions and mixed numbers', icon: '🍕', color: '#fab1a0',
      sg: '4A · Fractions (mixed numbers, improper fractions)', ixl: 'T, U, V', km: 'Numbers (equivalent fractions)',
      tip: 'Cut 2 pizzas into 4 pieces each. If there are 7 pieces, that\'s 7/4 = 1 3/4 pizzas.',
      skills: [
        { id: '4H1', name: 'Equivalent fractions', gen() { const d = r(3, 9), n = r(1, d - 1), k = r(2, 6); if (Math.random() < 0.5) return inp(`${n}/${d} = ?/${d * k}`, n * k, `${d} × ${k} = ${d * k}, so ${n} × ${k} = <b>${n * k}</b>.`); return inp(`${n * k}/${d * k} = ${n}/?`, d, `The numerator is divided by ${k} (${n * k} ÷ ${k} = ${n}), and the denominator is divided by ${k} too: ${d * k} ÷ ${k} = <b>${d}</b>.`); } },
        { id: '4H2', name: 'Simplifying fractions', gen() { let d, n; do { d = r(3, 12); n = r(1, d - 1); } while (gcd(n, d) !== 1); const k = r(2, 5); const good = `${n}/${d}`, N = n * k, D = d * k; const partial = gcd(N, D) % 2 === 0 && k % 2 === 0 && k > 2 ? `${N / 2}/${D / 2}` : `${N + 1}/${D}`; return ch(`The simplest form of ${N}/${D} is...`, opts4(good, [partial, `${N}/${D}`, `${n}/${d + 1}`, `${n + 1}/${d}`]), good, `The GCF of ${N} and ${D} is ${gcd(N, D)}. ${N} ÷ ${gcd(N, D)} = ${n}, ${D} ÷ ${gcd(N, D)} = ${d}. The answer is <b>${good}</b>.`); } },
        { id: '4H3', name: 'Mixed numbers and improper fractions', gen() { const d = r(2, 9), w = r(1, 5), n = r(1, d - 1), imp = w * d + n; if (Math.random() < 0.5) return ch(`${imp}/${d} = ?`, opts4(`${w} ${n}/${d}`, [`${w + 1} ${n}/${d}`, `${w} ${d - n}/${d}`, `${n} ${w}/${d}`, `${w} ${n}/${imp}`]), `${w} ${n}/${d}`, `${imp} ÷ ${d} = ${w} remainder ${n}. So ${imp}/${d} = <b>${w} ${n}/${d}</b>.`); return inp(`${w} ${n}/${d} = ?/${d}`, imp, `${w} wholes = ${w * d}/${d}, plus ${n}/${d}: ${w * d} + ${n} = <b>${imp}</b>.`, { meta: { alt: { [String(w * n + d)]: 'pecahan' } } }); } },
        { id: '4H4', name: 'Comparing fractions with different denominators', gen() { let a, b, c, d; do { b = r(2, 9); d = r(2, 9); a = r(1, b - 1); c = r(1, d - 1); } while (b === d || a * d === c * b); const s = a * d < c * b ? '<' : '>'; return ch('Choose the correct sign.', ['<', '>', '='], s, `Make the denominator ${lcm(b, d)}: ${a}/${b} = ${(a * lcm(b, d)) / b}/${lcm(b, d)} and ${c}/${d} = ${(c * lcm(b, d)) / d}/${lcm(b, d)}. So <b>${a}/${b} ${s} ${c}/${d}</b>.`, { vis: V.big(`${a}/${b} <span class="q">?</span> ${c}/${d}`) }); } },
      ],
    },
    {
      id: '4I', grade: 4, name: 'Fraction operations', icon: '🧮', color: '#55efc4',
      sg: '4A · Fractions (add, subtract, fraction of a set)', ixl: 'W, X, Y, Z, AA', km: 'Numbers',
      tip: 'For "2/3 of 12": divide 12 into 3 groups (4), then take 2 groups (8).',
      skills: [
        { id: '4I1', name: 'Adding and subtracting fractions with the same denominator', gen() { const d = r(3, 10), a = r(1, d + 3), b = r(1, d); const plus = Math.random() < 0.6; if (!plus && a <= b) return C.SKILLS['4I1'].gen(); const res = plus ? a + b : a - b, good = fs(res, d); const wrong = plus ? `${a + b}/${2 * d}` : `${a - b}/0`; return ch(`${a}/${d} ${plus ? '+' : '−'} ${b}/${d} = ?`, opts4(good, [plus ? wrong : fs(a + b, d), fs(res + 1, d), `${res}/${d}` === good ? fs(Math.max(1, res - 1), d) : `${res}/${d}`].filter((x) => !x.endsWith('/0'))), good, `Same denominator, ${plus ? 'add' : 'subtract'} the numerators: ${a} ${plus ? '+' : '−'} ${b} = ${res}. ${res}/${d}${good !== `${res}/${d}` ? ` = <b>${good}</b>` : ` → <b>${good}</b>`}.`, { optionTags: plus ? { [wrong]: 'penyebut-dijumlah' } : {} }); } },
        { id: '4I2', name: 'Adding fractions with related denominators', gen() { const d1 = pick([2, 3, 4, 5]), k = pick([2, 3]), d2 = d1 * k, a = r(1, d1 - 1), b = r(1, d2 - 1); const num = a * k + b, good = fs(num, d2); const wrong = `${a + b}/${d1 + d2}`; return ch(`${a}/${d1} + ${b}/${d2} = ?`, opts4(good, [wrong, fs(a + b, d2), fs(num + 1, d2)]), good, `Change ${a}/${d1} to ${a * k}/${d2}. Then ${a * k}/${d2} + ${b}/${d2} = ${num}/${d2}${good !== `${num}/${d2}` ? ` = <b>${good}</b>` : ''}. The answer is <b>${good}</b>.`, { optionTags: { [wrong]: 'penyebut-dijumlah' } }); } },
        { id: '4I3', name: 'Fractions times whole numbers', gen() { const d = r(2, 9), a = r(1, d - 1), n = r(2, 6), good = fs(a * n, d); const wrong = `${a * n}/${d * n}`; return ch(`${n} × ${a}/${d} = ?`, opts4(good, [wrong, fs(a + n, d), fs(a * n + 1, d)]), good, `${n} × ${a}/${d} = ${a} × ${n} / ${d} = ${a * n}/${d}. The answer is <b>${good}</b>. The denominator isn't multiplied.`, { optionTags: { [wrong]: 'pecahan' } }); } },
        { id: '4I4', name: 'Fraction of an amount', gen() { const d = r(2, 8), n = r(1, d - 1), k = r(2, 12), tot = d * k; return inp(`What is ${n}/${d} of ${tot}?`, n * k, `Divide ${tot} into ${d} parts: ${tot} ÷ ${d} = ${k}. Take ${n} parts: ${n} × ${k} = <b>${n * k}</b>.`, { vis: tot <= 40 ? V.objects('🍬', tot) : '' }); } },
      ],
    },
    {
      id: '4J', grade: 4, name: 'Decimals', icon: '🔟', color: '#fdcb6e',
      sg: '4B · Decimals (tenths, hundredths, thousandths)', ixl: 'BB, CC, DD', km: 'Numbers (decimals; CP Phase B)',
      tip: 'Money helps with understanding decimals: Rp1,000 divided by 10 = Rp100 (tenths), divided by 100 = Rp10 (hundredths).',
      skills: [
        { id: '4J1', name: 'Fractions and decimals', gen() { if (Math.random() < 0.5) { const n = r(1, 9), good = dec(n / 10); return ch(`${n}/10 = ?`, opts4(good, [dec(n / 100), String(n), `${n},10`, dec(n / 1000)]), good, `${n} tenths is written <b>${good}</b>.`, { optionTags: { [dec(n / 100)]: 'koma-desimal' } }); } const n = r(1, 99), good = dec(n / 100); return ch('What decimal is the shaded part?', opts4(good, [dec(n / 10 > 9.9 ? n / 1000 : n / 10), String(n), dec(n / 1000), `0,${100 - n}`]), good, `${n} of 100 boxes are shaded = ${n}/100 = <b>${good}</b>.`, { vis: U.decGrid(n) }); } },
        { id: '4J2', name: 'Decimal place value', gen() { const d = shuffle(range(1, 9)).slice(0, 4), x = `${d[0]}${d[1]}.${d[2]}${d[3]}`, pos = r(0, 3); const names = ['tens', 'ones', 'tenths', 'hundredths']; return ch(`In the number <b>${x}</b>, the digit ${d[pos]} is in the...`, names, names[pos], `From the left: ${d[0]} tens, ${d[1]} ones, decimal point, ${d[2]} tenths, ${d[3]} hundredths. The answer is <b>${names[pos]}</b>.`); } },
        { id: '4J3', name: 'Comparing decimals', gen() { let a, b, tags = {}; if (Math.random() < 0.5) { const x = r(1, 9); a = x / 10; b = (x - 1) / 10 + r(1, 9) / 100; if (b > a) { b = a - r(1, 9) / 100; } } else { a = r(1, 99) / 100; b = r(1, 99) / 100; } const s = a < b ? '<' : a > b ? '>' : '='; const sa = dec(a), sb = dec(b); if (s !== '=' && sa.length !== sb.length) { const longer = sa.length > sb.length ? a : b; const naive = longer === a ? '>' : '<'; if (naive !== s) tags[naive] = 'desimal-panjang'; } return ch('Choose the correct sign.', ['<', '>', '='], s, `Match the number of decimal places: ${dec(a).padEnd(4, '0')} and ${dec(b).padEnd(4, '0')}. So <b>${sa} ${s} ${sb}</b>.`, { vis: V.big(`${sa} <span class="q">?</span> ${sb}`), optionTags: tags }); } },
        { id: '4J4', name: 'Adding and subtracting decimals', gen() { const dp = pick([1, 2]), f = 10 ** dp; const a = r(11, 9 * f) / f, b = r(1, Math.min(9 * f, a * f - 1)) / f; const plus = Math.random() < 0.5; const res = plus ? a + b : a - b; return inp(`${dec(a)} ${plus ? '+' : '−'} ${dec(b)} = ?`, dec(res), `Write it vertically with the decimal points lined up, then ${plus ? 'add' : 'subtract'} as usual. The answer is <b>${dec(res)}</b>.`, { keys: ['.'], vis: `<div class="stack"><span>${dec(a)}</span><span>${plus ? '+' : '−'} ${dec(b)}</span><span class="line">?</span></div>`, meta: { kind: 'decimal' } }); } },
      ],
    },
    {
      id: '4K', grade: 4, name: 'Data and statistics', icon: '📊', color: '#74b9ff',
      sg: '4B · Tables and Line Graphs', ixl: 'O, EE', km: 'Data Analysis and Probability',
      tip: 'Record the temperature or a plant\'s height every day, then draw a line graph together.',
      skills: [
        { id: '4K1', name: 'Reading line graphs', gen() { const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']; const v = months.map(() => r(2, 18) * 5); const vis = U.lineGraph('Cake Sales (boxes)', months.map((m, i) => [m, v[i]]), 100, 10); if (Math.random() < 0.6) { const i = r(0, 5); return inp(`How many boxes of cake were sold in ${months[i]}?`, v[i], `Find the point above ${months[i]}, then look at the number on the left axis: <b>${v[i]}</b>.`, { vis }); } const i = r(0, 4); return inp(`How much did sales rise or fall from ${months[i]} to ${months[i + 1]}?`, Math.abs(v[i + 1] - v[i]), `${months[i]}: ${v[i]}, ${months[i + 1]}: ${v[i + 1]}. The difference is <b>${Math.abs(v[i + 1] - v[i])}</b>.`, { vis, meta: { op: '-', a: Math.max(v[i], v[i + 1]), b: Math.min(v[i], v[i + 1]) } }); } },
        { id: '4K2', name: 'Mode, median, and range', gen() { const n = pick([5, 7]); const xs = range(1, n).map(() => r(1, 20)); const t = pick(['median', 'range', 'mode']); const sorted = xs.slice().sort((a, b) => a - b); if (t === 'mode') { const m = xs[0]; xs[1] = m; xs[2] = m; } const s2 = xs.slice().sort((a, b) => a - b); const cnt = {}; xs.forEach((x) => { cnt[x] = (cnt[x] || 0) + 1; }); const top = Math.max(...Object.values(cnt)); const modes = Object.keys(cnt).filter((k) => cnt[k] === top); if (t === 'mode' && modes.length > 1) return C.SKILLS['4K2'].gen(); const ans = t === 'median' ? s2[(n - 1) / 2] : t === 'range' ? s2[n - 1] - s2[0] : +modes[0]; const how = { median: `In order: ${s2.join(', ')}. The middle value is <b>${ans}</b>.`, "range": `Largest − smallest = ${s2[n - 1]} − ${s2[0]} = <b>${ans}</b>.`, "mode": `The most frequent value is <b>${ans}</b> (${top} times).` }[t]; void sorted; return inp(`Data: ${xs.join(', ')}. What is the ${t}?`, ans, how); } },
      ],
    },
    {
      id: '4L', grade: 4, name: 'Time and measures', icon: '⏱️', color: '#ffeaa7',
      sg: '4B · Time (24-hour clock), Measures', ixl: 'FF, HH, II', km: 'Measurement',
      tip: 'Get used to reading train schedules or TV listings that use the 24-hour clock.',
      skills: [
        { id: '4L1', name: '12-hour and 24-hour clocks', gen() { const H = r(13, 23), m = r(0, 11) * 5, h12 = H - 12; const part = H < 15 ? 'midday' : H < 19 ? 'late afternoon' : 'night'; if (Math.random() < 0.5) { const good = hm(H, m); return ch(`${h12}:${String(m).padStart(2, '0')} in the ${part} is written on the 24-hour clock as...`, opts4(good, [hm(h12, m), hm(H + 1, m), hm(H - 2, m)]), good, `After 12:00 noon, add 12: ${h12} + 12 = ${H}. The answer is <b>${good}</b>.`); } const good = `${h12}:${String(m).padStart(2, '0')} in the ${part}`; return ch(`${hm(H, m)} is the same as...`, opts4(good, [`${h12}:${String(m).padStart(2, '0')} in the morning`, `${h12 + 1}:${String(m).padStart(2, '0')} in the ${part}`, `${H - 10}:${String(m).padStart(2, '0')} in the ${part}`]), good, `${H} − 12 = ${h12}, and ${hm(H, m)} falls in the ${part}. The answer is <b>${good}</b>.`); } },
        { id: '4L2', name: 'Elapsed time (hours and minutes)', gen() { const s = r(6, 14) * 60 + r(0, 11) * 5, d = r(13, 60) * 5, e = s + d; return inp(`A trip starts at ${hm(Math.floor(s / 60), s % 60)} and ends at ${hm(Math.floor(e / 60), e % 60)}. How many minutes long is the trip?`, d, `Count full hours, then remaining minutes: ${Math.floor(d / 60)} hours ${d % 60} minutes = <b>${d}</b> minutes.`); } },
        { id: '4L3', name: 'Converting measures', gen() { const [big, small, f] = pick([['km', 'm', 1000], ['kg', 'g', 1000], ['L', 'mL', 1000], ['m', 'cm', 100]]); const t = r(0, 2); if (t === 0) { const n = r(1, 9), p = r(1, f - 1); return inp(`${n} ${big} ${p} ${small} = ? ${small}`, n * f + p, `${n} × ${fmt(f)} + ${p} = <b>${fmt(n * f + p)}</b> ${small}.`, { meta: { kind: 'unit' } }); } if (t === 1) { const n = r(1, 9), h = pick([0.5, 0.25, 0.75, 0.2, 0.4]); const v = Math.round((n + h) * f); return inp(`${dec(n + h)} ${big} = ? ${small}`, v, `1 ${big} = ${fmt(f)} ${small}. ${dec(n + h)} × ${fmt(f)} = <b>${fmt(v)}</b> ${small}.`, { meta: { kind: 'unit' } }); } const tot = r(f + 1, 9 * f); return inp(`${fmt(tot)} ${small} = ${Math.floor(tot / f)} ${big} ? ${small}`, tot % f, `${Math.floor(tot / f)} ${big} = ${fmt(Math.floor(tot / f) * f)} ${small}. Remaining ${fmt(tot)} − ${fmt(Math.floor(tot / f) * f)} = <b>${tot % f}</b> ${small}.`, { meta: { kind: 'unit' } }); } },
        { id: '4L4', name: 'Measurement word problems', gen() { const m = r(3, 6), n = r(3, 8), c = pick([25, 30, 40, 50]); if (n * c >= m * 100) return C.SKILLS['4L4'].gen(); return inp(`A ${m} m ribbon is cut into ${n} pieces of ${c} cm each. How many cm of ribbon are left?`, m * 100 - n * c, `${m} m = ${m * 100} cm. Used ${n} × ${c} = ${n * c} cm. Left ${m * 100} − ${n * c} = <b>${m * 100 - n * c}</b> cm.`, { meta: { kind: 'unit' } }); } },
      ],
    },
    {
      id: '4M', grade: 4, name: 'Area and perimeter', icon: '📐', color: '#00b894',
      sg: '4A · Area and Perimeter (composite figures)', ixl: 'JJ, KK, LL', km: 'Measurement (area and perimeter)',
      tip: 'For L-shaped figures, split them into two rectangles or subtract the missing part from a big rectangle.',
      skills: [
        { id: '4M1', name: 'Area of squares and rectangles', gen() { const w = r(5, 25), h = Math.random() < 0.3 ? w : r(3, 20); return inp(`What is the area of this shape in cm²?`, w * h, `Area = ${w} × ${h} = <b>${w * h}</b> cm².`, { vis: U.rectLabel(w, h), meta: { op: 'x', a: w, b: h, alt: { [String(2 * (w + h))]: 'luas-keliling' } } }); } },
        { id: '4M2', name: 'Area of composite shapes', gen() { const a = r(8, 16), b = r(6, 12), c = r(Math.ceil(a / 3), a - 3), d = r(Math.ceil(b / 3), b - 3); const ans = a * b - c * d; return inp('What is the area of this L-shaped figure in cm²?', ans, `The big rectangle ${a} × ${b} = ${a * b}, minus the missing corner ${c} × ${d} = ${c * d}. ${a * b} − ${c * d} = <b>${ans}</b> cm².`, { vis: U.lshape(a, b, c, d) }); } },
        { id: '4M3', name: 'Finding a side from the area', gen() { if (Math.random() < 0.4) { const s = r(3, 12); return inp(`The area of a square is ${s * s} cm². How long is each side in cm?`, s, `Find the number that times itself = ${s * s}: ${s} × ${s} = ${s * s}. The answer is <b>${s}</b> cm.`); } const w = r(4, 15), h = r(3, 12); return inp(`The area of a rectangle is ${w * h} cm² and its length is ${w} cm. What is its width in cm?`, h, `Width = area ÷ length = ${w * h} ÷ ${w} = <b>${h}</b> cm.`); } },
        { id: '4M4', name: 'Perimeter of composite shapes', gen() { const a = r(8, 16), b = r(6, 12), c = r(Math.ceil(a / 3), a - 3), d = r(Math.ceil(b / 3), b - 3); return inp('What is the perimeter of this L-shaped figure in cm?', 2 * (a + b), `Add all the outer sides. The inward corner sides are the same length as the missing sides, so the perimeter = 2 × (${a} + ${b}) = <b>${2 * (a + b)}</b> cm.`, { vis: U.lshape(a, b, c, d), meta: { alt: { [String(a * b - c * d)]: 'luas-keliling' } } }); } },
      ],
    },
    {
      id: '4N', grade: 4, name: 'Angles and directions', icon: '🧭', color: '#e84393',
      sg: '4B · Angles; 8-point Compass', ixl: 'MM, NN', km: 'Geometry; Measurement (angles)',
      tip: 'Clock hands form angles: 3:00 = 90°, 6:00 = 180°. Practice compass directions in the yard.',
      skills: [
        { id: '4N1', name: 'Types of angles', gen() { const t = pick(['acute', 'right', 'obtuse']); const deg = t === 'acute' ? r(15, 80) : t === 'right' ? 90 : r(100, 170); if (Math.random() < 0.3) { const [q, a] = pick([['An angle of 180° is called a...', 'lurus'], [`An angle of ${r(10, 85)}° is a...`, 'acute'], [`An angle of ${r(95, 175)}° is a...`, 'obtuse']]); return ch(q, ['acute', 'right', 'obtuse', 'lurus'], a, 'Acute < 90°, right = 90°, obtuse between 90° and 180°, straight = 180°. The answer is <b>' + a + '</b>.'); } return ch('This type of angle is...', ['acute', 'right', 'obtuse', 'lurus'], t, `This angle is ${deg === 90 ? 'exactly 90°' : deg < 90 ? 'less than 90°' : 'more than 90°'}, so it's <b>${t}</b>.`, { vis: U.angle(deg) }); } },
        { id: '4N2', name: 'Estimating angle size', gen() { const vals = [30, 45, 60, 90, 120, 135, 150]; const deg = pick(vals); return ch('About how large is this angle?', opts4(`${deg}°`, vals.map((v) => `${v}°`)), `${deg}°`, `Compare it with a right angle (90°). This angle is about <b>${deg}°</b>.`, { vis: U.angle(deg) }); } },
        { id: '4N3', name: 'Finding missing angles', gen() { if (Math.random() < 0.6) { const k = r(20, 160); return inp('The two angles are on a straight line. How many degrees is the angle in question?', 180 - k, `Angles on a straight line add up to 180°. 180 − ${k} = <b>${180 - k}</b>°.`, { vis: U.straight(k, 180) }); } const k = r(15, 75); return inp('The two angles form a right angle. How many degrees is the angle in question?', 90 - k, `Together they add up to 90°. 90 − ${k} = <b>${90 - k}</b>°.`, { vis: U.straight(k, 90) }); } },
        { id: '4N4', name: 'Compass directions and turns', gen() { const s = r(0, 7), turn = pick([45, 90, 135, 180, 270]), cw = Math.random() < 0.6; const e = (s + (cw ? 1 : -1) * (turn / 45) + 8) % 8; return ch(`You're facing ${DIR[s]}, then turn ${turn}° ${cw ? 'clockwise' : 'counterclockwise'}. Now you're facing...`, opts4(DIR[e], [DIR[(e + 4) % 8], DIR[(s + (cw ? -1 : 1) * (turn / 45) + 8) % 8], DIR[(e + 2) % 8], DIR[(e + 1) % 8]]), DIR[e], `Every 45° moves one direction on the compass rose. ${turn}° = ${turn / 45} steps ${cw ? 'clockwise' : 'counterclockwise'} from ${DIR[s]}: <b>${DIR[e]}</b>.`, { vis: U.compass() }); } },
      ],
    },
    {
      id: '4O', grade: 4, name: 'Triangles, quadrilaterals, and symmetry', icon: '🔺', color: '#fab1a0',
      sg: '4B · Rectangle and Square; Symmetry', ixl: 'OO, PP, QQ', km: 'Geometry',
      tip: 'Fold a paper shape. If the two parts match exactly, the fold is a line of symmetry.',
      skills: [
        { id: '4O1', name: 'Types of triangles', gen() { const [nm, clue] = pick([['equilateral triangle', 'all three sides are equal'], ['isosceles triangle', 'two sides are equal'], ['scalene triangle', 'all three sides are different'], ['right triangle', 'one angle is 90°']]); return ch(`A triangle where ${clue} is called...`, ['equilateral triangle', 'isosceles triangle', 'scalene triangle', 'right triangle'], nm, `A triangle where ${clue} is a <b>${nm}</b>.`); } },
        { id: '4O2', name: 'Properties of quadrilaterals', gen() { const [q, a] = pick([['How many pairs of parallel sides does a parallelogram have?', 2], ['How many pairs of parallel sides does a trapezoid have?', 1], ['How many right angles does a rectangle have?', 4], ['How many right angles does a rhombus (not a square) have?', 0], ['How many equal sides does a square have?', 4], ['How many degrees do the four angles of a quadrilateral add up to?', 360]]); const v = q.includes('parallelogram') ? JAJAR : q.includes('trapezoid') ? TRAP : ''; return inp(q, a, `The answer is <b>${a}</b>.`, { vis: v }); } },
        { id: '4O3', name: 'Axis of symmetry', gen() { const [nm, n, vis] = pick([['square', 4, V.shape('square', '#00b894')], ['rectangle', 2, V.shape('rectangle', '#00b894')], ['equilateral triangle', 3, U.poly(3, '#00b894')], ['rhombus', 2, V.shape('rhombus', '#00b894')], ['parallelogram', 0, JAJAR], ['regular hexagon', 6, U.poly(6, '#00b894')], ['regular pentagon', 5, U.poly(5, '#00b894')]]); return inp(`How many lines of symmetry does a ${nm} have?`, n, n ? `A ${nm[0].toUpperCase() + nm.slice(1)} can be folded into two matching parts in <b>${n}</b> ways.` : 'A parallelogram can\'t be folded into two exactly matching parts. The answer is <b>0</b>.', { vis }); } },
      ],
    },
    {
      id: '4P', grade: 4, name: 'Money and financial literacy', icon: '💰', color: '#81ecec',
      sg: '— (Singapore Math context: Money)', ixl: 'Q, RR', km: 'Numbers (money context)',
      tip: 'Have your child compare unit prices at a store: a big package isn\'t always cheaper.',
      skills: [
        { id: '4P1', name: 'Comparing unit prices', gen() { const pa = r(4, 9) * 500, pb = pa + pick([-1, 1]) * r(1, 3) * 100; const na = r(2, 5), nb = r(na + 1, 8); const A = pa * na, B = pb * nb; const good = pa < pb ? 'Package A' : 'Package B'; return ch(`Package A: ${na} books for ${rp(A)}. Package B: ${nb} books for ${rp(B)}. Which is cheaper per book?`, ['Package A', 'Package B'], good, `Price per book: A = ${rp(A)} ÷ ${na} = ${rp(pa)}, B = ${rp(B)} ÷ ${nb} = ${rp(pb)}. The cheaper one is <b>${good}</b>.`); } },
        { id: '4P2', name: 'Saving', gen() { const s = r(2, 10) * 1000, w = r(4, 20), T = s * w; return inp(`${two()[0]} saves ${rp(s)} every week. How many weeks are needed to collect ${rp(T)}?`, w, `${rp(T)} ÷ ${rp(s)} = <b>${w}</b> weeks.`, { meta: { op: '/', a: T, b: s } }); } },
      ],
    },
  ];

  C.register(UNITS);
  C.GRADES.push({ id: 4, name: 'Grade 4', ixl: 'https://www.ixl.com/math/grade-4', sg: 'Primary Mathematics / Dimensions Math 4A and 4B' });
})();
