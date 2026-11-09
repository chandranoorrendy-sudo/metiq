/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Kurikulum Matematika Kelas 5
 * Dari daftar keterampilan IXL kelas 5 dan Singapore Math 5A/5B: bilangan sampai jutaan, pangkat
 * sepuluh, FPB dan KPK, urutan operasi dan ekspresi, operasi pecahan berbeda penyebut,
 * desimal sampai perseribuan, rasio, persen, koordinat, volume, luas segitiga, dan rata-rata.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, range, rp, V, inp, ch, two, fmt, dec, opts4, gcd, lcm, simp, fs, stack, U } = C.kit;
  const R = (n, t) => Math.floor(n / t + 0.5) * t;
  const ratio = (a, b) => { const [x, y] = simp(a, b); return `${x} : ${y}`; };
  const pt = (x, y) => `(${x}, ${y})`;

  Object.assign(C.TAGS, {
    'koordinat-tertukar': { label: 'Mixing up coordinate order (x, y)', tip: 'Remember "walk first, then climb": the first number is horizontal (x), the second is vertical (y).' },
    'rasio-terbalik': { label: 'Reversing the order of a ratio', tip: 'Write ratio A : B in the order named in the problem. "Apples to oranges" means apples first.' },
  });

  const UNITS = [
    {
      id: '5A', grade: 5, name: 'Large numbers and powers of ten', icon: '🔢', color: '#ff7a59',
      sg: '5A · Whole Numbers (to 10 million)', ixl: 'A, B, C', km: 'Numbers (CP Phase C: whole numbers to 1,000,000)',
      tip: 'Find large numbers in a newspaper (budgets, population) and read the place of each digit together.',
      skills: [
        { id: '5A1', name: 'Digit value to the millions', gen() { const d = shuffle(range(1, 9)).slice(0, 7), n = +d.join(''), pos = r(0, 6), val = d[pos] * 10 ** (6 - pos); const names = ['millions', 'hundred thousands', 'ten thousands', 'thousands', 'hundreds', 'tens', 'ones']; return ch(`In the number <b>${fmt(n)}</b>, what is the value of the digit ${d[pos]}?`, opts4(fmt(val), range(0, 6).map((p) => fmt(d[pos] * 10 ** p))), fmt(val), `The digit ${d[pos]} is in the ${names[pos]} place, so its value is <b>${fmt(val)}</b>.`); } },
        { id: '5A2', name: 'Rounding numbers to the millions', gen() { const t = pick([1000, 10000, 100000, 1000000]), n = r(1000001, 9899999); const ans = R(n, t), lo = Math.floor(n / t) * t; return inp(`Round ${fmt(n)} to the nearest ${{ 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands', 1000000: 'millions' }[t]}.`, ans, `Look at the digit just right of the rounding place: 5 or more rounds up. The answer is <b>${fmt(ans)}</b>.`, { meta: { kind: 'round', wrong: ans === lo ? lo + t : lo } }); } },
        { id: '5A3', name: 'Powers of ten', gen() { const t = r(0, 2); if (t === 0) { const k = r(2, 6); return inp(`10<sup>${k}</sup> = ?`, 10 ** k, `10<sup>${k}</sup> means 10 multiplied by itself ${k} times = 1 followed by ${k} zeros: <b>${fmt(10 ** k)}</b>.`, { log: `10^${k} = ?` }); } if (t === 1) { const a = r(2, 9), k = r(2, 5); return inp(`${a} × 10<sup>${k}</sup> = ?`, a * 10 ** k, `${a} × ${fmt(10 ** k)} = <b>${fmt(a * 10 ** k)}</b>.`, { log: `${a} × 10^${k} = ?`, meta: { kind: 'unit' } }); } const n = r(11, 999), k = pick([10, 100, 1000]); return inp(`${n} × ${fmt(k)} = ?`, n * k, `Add ${String(k).length - 1} zeros: <b>${fmt(n * k)}</b>.`, { meta: { kind: 'unit' } }); } },
      ],
    },
    {
      id: '5B', grade: 5, name: 'Multiplication and division', icon: '✖️', color: '#1fbf9f',
      sg: '5A · Four Operations (multiply and divide by 2-digit)', ixl: 'D, E, G', km: 'Numbers',
      tip: 'Estimate first: 312 × 48 is about 300 × 50 = 15,000. If your answer is far from that, check again.',
      skills: [
        { id: '5B1', name: 'Three digits times two digits', gen() { const a = r(102, 999), b = r(11, 99); return inp(`${a} × ${b} = ?`, a * b, `${a} × ${b} = ${a} × ${Math.floor(b / 10) * 10} + ${a} × ${b % 10} = ${fmt(a * Math.floor(b / 10) * 10)} + ${fmt(a * (b % 10))} = <b>${fmt(a * b)}</b>.`, { vis: stack(a, '×', b), meta: { op: 'x', a, b } }); } },
        { id: '5B2', name: 'Dividing by two-digit numbers', gen() { const d = r(11, 48), q = r(12, 99), n = d * q; return inp(`${fmt(n)} ÷ ${d} = ?`, q, `Estimate: ${d} × ${Math.floor(q / 10) * 10} = ${fmt(d * Math.floor(q / 10) * 10)}. The rest is ${fmt(n - d * Math.floor(q / 10) * 10)} ÷ ${d} = ${q % 10}. The answer is <b>${q}</b>.`, { vis: window.METIQ_KOLOM.porogapit(n, d), meta: { op: '/', a: n, b: d } }); } },
        { id: '5B3', name: 'Multiplication and division word problems', gen() { if (Math.random() < 0.5) { const a = r(12, 48), b = r(105, 480); return inp(`A factory makes ${b} bottles every hour. How many bottles are made in ${a} hours?`, a * b, `${b} × ${a} = <b>${fmt(a * b)}</b> bottles.`, { meta: { op: 'x', a, b } }); } const d = r(12, 36), q = r(15, 80); return inp(`${fmt(d * q)} chairs are arranged in ${d} equal rows. How many chairs are in each row?`, q, `${fmt(d * q)} ÷ ${d} = <b>${q}</b> chairs.`, { meta: { op: '/', a: d * q, b: d } }); } },
      ],
    },
    {
      id: '5C', grade: 5, name: 'GCF and LCM', icon: '🧩', color: '#fd79a8',
      sg: '5A · Factors and Multiples (HCF, LCM)', ixl: 'F', km: 'Numbers (LCM and GCF; CP Phase C)',
      tip: '"Meet again" or "ring together" problems are usually LCM. "Divide equally into as many as possible" problems are usually GCF.',
      skills: [
        { id: '5C1', name: 'Greatest common factor (GCF)', gen() { const g = r(2, 12), [x, y] = shuffle([2, 3, 5, 7, 4, 9]).slice(0, 2), a = g * x, b = g * y; if (gcd(x, y) !== 1) return C.SKILLS['5C1'].gen(); return inp(`What is the GCF of ${a} and ${b}?`, g, `Take the largest factor that ${a} and ${b} share. ${a} = ${g} × ${x}, ${b} = ${g} × ${y}. GCF = <b>${g}</b>.`, { meta: { alt: { [String(lcm(a, b))]: 'konsep' } } }); } },
        { id: '5C2', name: 'Least common multiple (LCM)', gen() { const [a, b] = shuffle([4, 6, 8, 9, 10, 12, 15]).slice(0, 2); return inp(`What is the LCM of ${a} and ${b}?`, lcm(a, b), `Multiples of ${a}: ${range(1, 5).map((i) => a * i).join(', ')}, … Multiples of ${b}: ${range(1, 5).map((i) => b * i).join(', ')}, … The smallest in common: <b>${lcm(a, b)}</b>.`); } },
        { id: '5C3', name: 'GCF and LCM word problems', gen() { if (Math.random() < 0.5) { const [a, b] = shuffle([2, 3, 4, 5, 6]).slice(0, 2); return inp(`A red light blinks every ${a} seconds and a blue light every ${b} seconds. If both blink together now, in how many seconds will they blink together again?`, lcm(a, b), `Find the LCM of ${a} and ${b}: <b>${lcm(a, b)}</b> seconds.`); } const g = r(3, 9), x = r(2, 6), y = r(x + 1, 9), A = g * x, B = g * y; if (gcd(x, y) !== 1) return C.SKILLS['5C3'].gen(); return inp(`${A} apples and ${B} oranges are to be put into bags, each with the same number of apples and oranges. What is the greatest number of bags that can be made?`, g, `Find the GCF of ${A} and ${B}: <b>${g}</b> bags (each with ${x} apples and ${y} oranges).`); } },
      ],
    },
    {
      id: '5D', grade: 5, name: 'Expressions and order of operations', icon: '🔣', color: '#e17055',
      sg: '5A · Order of Operations; Algebra (simple expressions)', ixl: 'H, MM', km: 'Algebra',
      tip: 'Write the words as a number sentence before calculating.',
      skills: [
        { id: '5D1', name: 'Order of operations with parentheses', gen() { const a = r(2, 9), b = r(2, 9), c = r(2, 9), d = r(1, 20); const t = r(0, 2); if (t === 0) { const ans = a * (b + c) - d; if (ans < 0) return C.SKILLS['5D1'].gen(); return inp(`${a} × (${b} + ${c}) − ${d} = ?`, ans, `Parentheses: ${b} + ${c} = ${b + c}. Multiply: ${a} × ${b + c} = ${a * (b + c)}. Subtract: ${a * (b + c)} − ${d} = <b>${ans}</b>.`, { vis: V.big(`${a} × (${b} + ${c}) − ${d}`), meta: { alt: { [String(a * b + c - d)]: 'urutan-operasi' } } }); } if (t === 1) { const q = b * c, ans = d + q / b * a; return inp(`${d} + ${q} ÷ ${b} × ${a} = ?`, ans, `Multiply and divide from the left: ${q} ÷ ${b} = ${c}, ${c} × ${a} = ${c * a}. Then ${d} + ${c * a} = <b>${ans}</b>.`, { vis: V.big(`${d} + ${q} ÷ ${b} × ${a}`) }); } const ans = (a + b) * c - a * b; if (ans < 0) return C.SKILLS['5D1'].gen(); return inp(`(${a} + ${b}) × ${c} − ${a} × ${b} = ?`, ans, `(${a + b}) × ${c} = ${(a + b) * c}; ${a} × ${b} = ${a * b}. ${(a + b) * c} − ${a * b} = <b>${ans}</b>.`, { vis: V.big(`(${a} + ${b}) × ${c} − ${a} × ${b}`) }); } },
        { id: '5D2', name: 'Writing expressions from words', gen() { const a = r(5, 20), b = r(2, a - 1), c = r(2, 9); const [txt, good, bad] = pick([[`Subtract ${b} from ${a}, then multiply the result by ${c}.`, `(${a} − ${b}) × ${c}`, [`${a} − ${b} × ${c}`, `(${b} − ${a}) × ${c}`, `${c} × ${a} − ${b}`]], [`Add ${a} and ${b}, then divide by ${c}.`, `(${a} + ${b}) ÷ ${c}`, [`${a} + ${b} ÷ ${c}`, `${c} ÷ (${a} + ${b})`, `${a} + ${b} × ${c}`]], [`Multiply ${c} by ${b}, then add ${a}.`, `${c} × ${b} + ${a}`, [`${c} × (${b} + ${a})`, `${c} + ${b} × ${a}`, `(${c} + ${b}) × ${a}`]]]); return ch(txt + ' Which expression matches?', opts4(good, bad), good, `The part done first gets parentheses if needed. The answer is <b>${good}</b>.`); } },
        { id: '5D3', name: 'Evaluating expressions with variables', gen() { const n = r(2, 12), a = r(2, 9), b = r(1, 20); const t = r(0, 2); if (t === 0) return inp(`If n = ${n}, what is the value of ${a}n + ${b}?`, a * n + b, `${a}n means ${a} × n = ${a} × ${n} = ${a * n}. Plus ${b}: <b>${a * n + b}</b>.`, { meta: { alt: { [String(Number(`${a}${n}`) + b)]: 'konsep' } } }); if (t === 1) return inp(`If n = ${n}, what is the value of ${a} × (n + ${b})?`, a * (n + b), `${n} + ${b} = ${n + b}, then × ${a} = <b>${a * (n + b)}</b>.`); const m = a * n; return inp(`If n = ${m}, what is the value of n ÷ ${a} + ${b}?`, n + b, `${m} ÷ ${a} = ${n}, then + ${b} = <b>${n + b}</b>.`); } },
      ],
    },
    {
      id: '5E', grade: 5, name: 'Adding and subtracting fractions', icon: '🍕', color: '#fab1a0',
      sg: '5A · Fractions (unlike denominators, mixed numbers)', ixl: 'J, K, L, M', km: 'Numbers (fraction operations; CP Phase C)',
      tip: 'Make denominators equal with the LCM: 2/3 + 1/4 → denominator 12 → 8/12 + 3/12 = 11/12.',
      skills: [
        { id: '5E1', name: 'Adding fractions with different denominators', gen() { let b, d; do { b = r(2, 8); d = r(2, 9); } while (b === d); const a = r(1, b - 1), c = r(1, d - 1), L = lcm(b, d), N = a * (L / b) + c * (L / d); const good = fs(N, L), wrong = `${a + c}/${b + d}`; return ch(`${a}/${b} + ${c}/${d} = ?`, opts4(good, [wrong, fs(N + 1, L), fs(a * c, b * d), fs(a + c, L)]), good, `LCM of ${b} and ${d} = ${L}. ${a}/${b} = ${a * (L / b)}/${L}, ${c}/${d} = ${c * (L / d)}/${L}. The sum is ${N}/${L} = <b>${good}</b>.`, { optionTags: { [wrong]: 'penyebut-dijumlah' } }); } },
        { id: '5E2', name: 'Subtracting fractions with different denominators', gen() { let a, b, c, d; do { b = r(2, 8); d = r(2, 9); a = r(1, b - 1); c = r(1, d - 1); } while (b === d || a * d <= c * b); const L = lcm(b, d), N = a * (L / b) - c * (L / d), good = fs(N, L); const wrong = a > c && b !== d ? `${a - c}/${Math.abs(b - d) || 1}` : `${N + 1}/${L}`; return ch(`${a}/${b} − ${c}/${d} = ?`, opts4(good, [wrong, fs(N + 1, L), fs(Math.max(1, N - 1), L), `${a}/${d}`]), good, `Make the denominator ${L}: ${a * (L / b)}/${L} − ${c * (L / d)}/${L} = ${N}/${L} = <b>${good}</b>.`, { optionTags: { [wrong]: 'penyebut-dijumlah' } }); } },
        { id: '5E3', name: 'Adding and subtracting mixed numbers', gen() { const d = r(3, 9), w1 = r(1, 5), w2 = r(1, 4), a = r(1, d - 1), b = r(1, d - 1); const plus = Math.random() < 0.6; const A = w1 * d + a, B = w2 * d + b; if (!plus && A <= B) return C.SKILLS['5E3'].gen(); const res = plus ? A + B : A - B, good = fs(res, d); return ch(`${w1} ${a}/${d} ${plus ? '+' : '−'} ${w2} ${b}/${d} = ?`, opts4(good, [fs(res + d, d), fs(res - 1 > 0 ? res - 1 : res + 2, d), `${plus ? w1 + w2 : w1 - w2} ${plus ? a + b : Math.abs(a - b)}/${d}`]), good, `Change to improper fractions: ${A}/${d} ${plus ? '+' : '−'} ${B}/${d} = ${res}/${d} = <b>${good}</b>.`); } },
        { id: '5E4', name: 'Fraction word problems', gen() { const [b, d] = pick([[2, 4], [3, 6], [4, 8], [2, 3], [3, 4], [2, 5]]), a = r(1, b - 1), c = r(1, d - 1), L = lcm(b, d), N = a * (L / b) + c * (L / d), good = fs(N, L); return ch(`Mom uses ${a}/${b} kg of flour for cake and ${c}/${d} kg for bread. How many kg of flour are used in all?`, opts4(good, [`${a + c}/${b + d}`, fs(N + 1, L), fs(Math.abs(a * (L / b) - c * (L / d)) || 1, L)]), good, `${a}/${b} + ${c}/${d} = ${a * (L / b)}/${L} + ${c * (L / d)}/${L} = ${N}/${L} = <b>${good}</b> kg.`, { optionTags: { [`${a + c}/${b + d}`]: 'penyebut-dijumlah' } }); } },
      ],
    },
    {
      id: '5F', grade: 5, name: 'Multiplying and dividing fractions', icon: '✂️', color: '#55efc4',
      sg: '5A · Fractions (multiply; fraction and division)', ixl: 'N–V', km: 'Numbers (CP Phase C: multiplying and dividing fractions by whole numbers)',
      tip: '1/2 × 1/3: take half of a third of a cake = 1/6. Dividing by 1/2 is the same as multiplying by 2.',
      skills: [
        { id: '5F1', name: 'Fractions times fractions', gen() { const b = r(2, 9), d = r(2, 9), a = r(1, b - 1), c = r(1, d - 1), good = fs(a * c, b * d); return ch(`${a}/${b} × ${c}/${d} = ?`, opts4(good, [fs(a * d, b * c), `${a + c}/${b + d}`, fs(a * c, b + d), fs(a * c + 1, b * d)]), good, `Multiply numerator by numerator and denominator by denominator: ${a * c}/${b * d} = <b>${good}</b>.`); } },
        { id: '5F2', name: 'Mixed numbers times whole numbers', gen() { const d = r(2, 6), w = r(1, 4), a = r(1, d - 1), n = r(2, 6), imp = w * d + a, good = fs(imp * n, d); return ch(`${w} ${a}/${d} × ${n} = ?`, opts4(good, [`${w * n} ${a}/${d}`, fs(imp * n + 1, d), fs(imp * n, d * n)]), good, `${w} ${a}/${d} = ${imp}/${d}. ${imp}/${d} × ${n} = ${imp * n}/${d} = <b>${good}</b>.`); } },
        { id: '5F3', name: 'Dividing by unit fractions', gen() { const d = r(2, 8), n = r(2, 9); if (Math.random() < 0.5) return inp(`${n} ÷ 1/${d} = ?`, n * d, `How many 1/${d} are in ${n}? Each 1 whole has ${d} parts, so ${n} × ${d} = <b>${n * d}</b>.`, { meta: { alt: { [String(Math.round(n / d))]: 'pecahan' } } }); const good = `1/${d * n}`; return ch(`1/${d} ÷ ${n} = ?`, opts4(good, [`${n}/${d}`, `1/${d + n}`, `${d}/${n}`]), good, `Divide 1/${d} into ${n} equal parts: 1/${d} × 1/${n} = <b>${good}</b>.`); } },
        { id: '5F4', name: 'Fractions as division', gen() { let a, b; do { a = r(1, 9); b = r(2, 9); } while (a % b === 0); const good = fs(a, b); return ch(`${a} pizzas are shared equally among ${b} children. How much pizza does each child get?`, opts4(good, [`${b}/${a}`, fs(a + 1, b), `1/${a * b}`]), good, `${a} ÷ ${b} = ${a}/${b}${good !== `${a}/${b}` ? ` = ${good}` : ''}. Each child gets <b>${good}</b> pizza.`, { optionTags: { [`${b}/${a}`]: 'pecahan' } }); } },
      ],
    },
    {
      id: '5G', grade: 5, name: 'Understanding decimals', icon: '🔟', color: '#fdcb6e',
      sg: '5A · Decimals (to 3 decimal places)', ixl: 'W, X, Y, Z', km: 'Numbers (decimals; CP Phase C)',
      tip: 'Read 3.425 as "three point four two five" and name the value of each digit.',
      skills: [
        { id: '5G1', name: 'Place value to the thousandths', gen() { const d = shuffle(range(1, 9)).slice(0, 4), x = `${d[0]},${d[1]}${d[2]}${d[3]}`, pos = r(1, 3); const names = ['ones', 'tenths', 'hundredths', 'thousandths']; return ch(`In the number <b>${x}</b>, the digit ${d[pos]} is in the...`, names, names[pos], `After the decimal point: tenths, hundredths, thousandths. The digit ${d[pos]} is in the <b>${names[pos]}</b> place.`); } },
        { id: '5G2', name: 'Comparing and ordering decimals', gen() { const a = r(1, 999) / 1000, k = pick([10, 100]), b = Math.round(a * 1000 / k) / (1000 / k) + pick([0, 1, -1]) / (1000 / k); const B = Math.max(0.001, Math.min(0.999, Math.round(b * 1000) / 1000)); const s = a < B ? '<' : a > B ? '>' : '='; const sa = dec(a), sb = dec(B); const tags = {}; if (s !== '=' && sa.length !== sb.length) { const naive = sa.length > sb.length ? '>' : '<'; if (naive !== s) tags[naive] = 'desimal-panjang'; } return ch('Choose the correct sign.', ['<', '>', '='], s, `Match the number of decimal places: ${sa.padEnd(5, '0')} and ${sb.padEnd(5, '0')}. So <b>${sa} ${s} ${sb}</b>.`, { vis: V.big(`${sa} <span class="q">?</span> ${sb}`), optionTags: tags }); } },
        { id: '5G3', name: 'Rounding decimals', gen() { const x = r(1001, 99999) / 1000, t = pick([0, 1, 2]); const ans = Math.round(x * 10 ** t) / 10 ** t; const name = ['the nearest whole number', 'one decimal place (tenths)', 'two decimal places (hundredths)'][t]; return inp(`Round ${dec(x)} to ${name}.`, dec(ans, t), `Look at the digit after the rounding place: 5 or more rounds up. The answer is <b>${dec(ans, t)}</b>.`, { keys: ['.'], meta: { kind: 'decimal' } }); } },
        { id: '5G4', name: 'Decimals and fractions', gen() { const [f, d] = pick([['1/2', '0.5'], ['1/4', '0.25'], ['3/4', '0.75'], ['1/5', '0.2'], ['2/5', '0.4'], ['3/5', '0.6'], ['4/5', '0.8'], ['1/8', '0.125'], ['3/8', '0.375'], ['1/10', '0.1'], ['7/10', '0.7'], ['9/20', '0.45'], ['1/20', '0.05']]); const all = ['0.5', '0.25', '0.75', '0.2', '0.4', '0.125', '0.05', '0.45', '1.2', '0.12', '0.15']; if (Math.random() < 0.5) return ch(`${f} = ?`, opts4(d, all), d, `Change the denominator to 10, 100, or 1,000, then write the decimal. ${f} = <b>${d}</b>.`); const fr = ['1/2', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/8', '3/8', '1/10', '7/10', '9/20', '1/20']; return ch(`${d} = ?`, opts4(f, fr), f, `${d} = <b>${f}</b>.`); } },
      ],
    },
    {
      id: '5H', grade: 5, name: 'Decimal operations', icon: '🧮', color: '#00cec9',
      sg: '5A · Decimals (four operations)', ixl: 'AA–GG', km: 'Numbers',
      tip: 'When multiplying a decimal by 10, 100, 1,000, the point moves right 1, 2, 3 places.',
      skills: [
        { id: '5H1', name: 'Adding and subtracting decimals', gen() { const A = r(1100, 49999), B = r(100, A - 50), dpA = pick([1, 2, 3]), dpB = pick([1, 2, 3]); const a = Math.round(A / 10 ** (3 - dpA)) / 10 ** dpA, b = Math.round(B / 10 ** (3 - dpB)) / 10 ** dpB; const plus = Math.random() < 0.5 || b >= a; const res = plus ? a + b : a - b; return inp(`${dec(a)} ${plus ? '+' : '−'} ${dec(b)} = ?`, dec(res), `Line up the decimal points, add zeros to match the length, then ${plus ? 'add' : 'subtract'}. The answer is <b>${dec(res)}</b>.`, { keys: ['.'], vis: `<div class="stack"><span>${dec(a)}</span><span>${plus ? '+' : '−'} ${dec(b)}</span><span class="line">?</span></div>`, meta: { kind: 'decimal' } }); } },
        { id: '5H2', name: 'Decimals times whole numbers', gen() { const a = r(11, 999) / 100, n = r(2, 9); return inp(`${dec(a)} × ${n} = ?`, dec(a * n), `Multiply as whole numbers (${Math.round(a * 100)} × ${n} = ${Math.round(a * 100) * n}), then place the point two places from the right: <b>${dec(a * n)}</b>.`, { keys: ['.'], meta: { kind: 'decimal' } }); } },
        { id: '5H3', name: 'Multiplying and dividing decimals by 10, 100, 1,000', gen() { const a = r(11, 9999) / 100, k = pick([10, 100, 1000]), mul = Math.random() < 0.5; const res = mul ? a * k : a / k; return inp(`${dec(a)} ${mul ? '×' : '÷'} ${fmt(k)} = ?`, dec(res, 5), `${mul ? 'Multiplying' : 'Dividing'} by ${fmt(k)}: the point moves ${String(k).length - 1} places to the ${mul ? 'right' : 'left'}. The answer is <b>${dec(res, 5)}</b>.`, { keys: ['.'], meta: { kind: 'decimal' } }); } },
        { id: '5H4', name: 'Decimals divided by whole numbers', gen() { const n = r(2, 9), q = r(11, 999) / 100; return inp(`${dec(q * n)} ÷ ${n} = ?`, dec(q), `Divide as usual; the point in the result lines up with the point in the number being divided. The answer is <b>${dec(q)}</b>.`, { keys: ['.'], meta: { kind: 'decimal' } }); } },
      ],
    },
    {
      id: '5I', grade: 5, name: 'Common ratio', icon: '⚖️', color: '#66ffdb',
      sg: '5B · Ratio', ixl: '— (IXL covers ratios in grade 6)', km: 'Numbers (ratios)',
      tip: 'When cooking, the ratio is 2 cups of rice : 3 cups of water. If there are 4 cups of rice, how much water?',
      skills: [
        { id: '5I1', name: 'Writing ratios', gen() { const a = r(2, 9), b = r(2, 9); if (a === b) return C.SKILLS['5I1'].gen(); const good = ratio(a, b), rev = ratio(b, a); return ch('What is the ratio of apples to bananas? (simplest form)', opts4(good, [rev, `${a} : ${a + b}`, `${b} : ${a + b}`]), good, `Apples ${a}, bananas ${b}. Ratio ${a} : ${b}${good !== `${a} : ${b}` ? ` = ${good}` : ''}. The answer is <b>${good}</b>.`, { vis: `<div class="objs">${'🍎'.repeat(a)}${'🍌'.repeat(b)}</div>`, optionTags: { [rev]: 'rasio-terbalik' } }); } },
        { id: '5I2', name: 'Simplifying ratios', gen() { let x, y; do { x = r(1, 9); y = r(1, 9); } while (gcd(x, y) !== 1 || x === y); const k = r(2, 8), good = `${x} : ${y}`; return ch(`The simplest form of ${x * k} : ${y * k} is...`, opts4(good, [`${y} : ${x}`, `${x * 2} : ${y * 2}`, `${x + 1} : ${y}`, `${x} : ${y + 1}`]), good, `Divide both numbers by their GCF (${k}): <b>${good}</b>.`); } },
        { id: '5I3', name: 'Ratio word problems', gen() { const [n1, n2] = two(), a = r(1, 5), b = r(1, 6), k = r(2, 9); if (a === b) return C.SKILLS['5I3'].gen(); const tot = (a + b) * k; if (Math.random() < 0.5) return inp(`The ratio of ${n1}'s marbles to ${n2}'s is ${a} : ${b}. Together they have ${tot} marbles. How many marbles does ${n2} have?`, b * k, `There are ${a} + ${b} = ${a + b} parts. 1 part = ${tot} ÷ ${a + b} = ${k}. ${n2}'s marbles = ${b} × ${k} = <b>${b * k}</b>.`, { vis: V.barModel([[...range(1, a).map(() => [k, '', 1])], [...range(1, b).map(() => ['?', '', 1])]]), meta: { alt: { [String(a * k)]: 'rasio-terbalik' } } }); return inp(`The ratio of sugar to flour in a recipe is ${a} : ${b}. If you use ${a * k} spoons of sugar, how many spoons of flour?`, b * k, `${a * k} ÷ ${a} = ${k}, so flour = ${b} × ${k} = <b>${b * k}</b> spoons.`); } },
      ],
    },
    {
      id: '5J', grade: 5, name: 'Percent', icon: '💯', color: '#e84393',
      sg: '5B · Percentage', ixl: '— (IXL covers percents in grade 6)', km: 'Numbers (percents; CP Phase C)',
      tip: 'Look for discount labels in stores. 20% off Rp50,000: 10% = Rp5,000, so 20% = Rp10,000.',
      skills: [
        { id: '5J1', name: 'Percents, fractions, and decimals', gen() { const [p, f, d] = pick([['50%', '1/2', '0.5'], ['25%', '1/4', '0.25'], ['75%', '3/4', '0.75'], ['20%', '1/5', '0.2'], ['10%', '1/10', '0.1'], ['40%', '2/5', '0.4'], ['5%', '1/20', '0.05'], ['60%', '3/5', '0.6']]); const fr = ['1/2', '1/4', '3/4', '1/5', '1/10', '2/5', '1/20', '3/5', '1/25']; const ds = ['0.5', '0.25', '0.75', '0.2', '0.1', '0.4', '0.05', '0.6', '2.5']; if (Math.random() < 0.5) return ch(`${p} = ? (simplest fraction)`, opts4(f, fr), f, `${p} = ${parseInt(p)}/100 = <b>${f}</b>.`); return ch(`${p} = ? (decimal)`, opts4(d, ds), d, `${p} = ${parseInt(p)}/100 = <b>${d}</b>.`, { optionTags: { [dec(parseInt(p) / 10)]: 'koma-desimal' } }); } },
        { id: '5J2', name: 'Percent of a number', gen() { const p = pick([10, 20, 25, 50, 75, 5, 30, 40]), base = (p === 25 || p === 75 ? 4 : p === 5 ? 20 : 10) * r(2, 30); const ans = (p * base) / 100; return inp(`What is ${p}% of ${fmt(base)}?`, ans, `${p}% of ${fmt(base)} = ${p}/100 × ${fmt(base)} = <b>${fmt(ans)}</b>.`, { meta: { alt: { [String(base - ans)]: 'persen' } } }); } },
        { id: '5J3', name: 'Discount', gen() { const p = pick([10, 20, 25, 30, 50]), price = r(4, 40) * 5000, disc = (p * price) / 100; return inp(`Shoes cost ${rp(price)} with a ${p}% discount. What's the price paid? (write the number only)`, price - disc, `Discount = ${p}% × ${rp(price)} = ${rp(disc)}. Price paid = ${rp(price)} − ${rp(disc)} = <b>${rp(price - disc)}</b>.`, { unit: 'Rp', meta: { alt: { [String(disc)]: 'persen' } } }); } },
      ],
    },
    {
      id: '5K', grade: 5, name: 'The coordinate plane', icon: '📍', color: '#74b9ff',
      sg: '— (Singapore Math: Coordinates in secondary school)', ixl: 'LL', km: 'Geometry (coordinates; CP Phase C)',
      tip: 'Play "battleship" on grid paper: name points (x, y) to guess where the other player\'s ship is.',
      skills: [
        { id: '5K1', name: 'Reading point coordinates', gen() { const x = r(1, 7), y = r(1, 7); if (x === y) return C.SKILLS['5K1'].gen(); const good = pt(x, y), sw = pt(y, x); return ch('What are the coordinates of point A?', opts4(good, [sw, pt(x + 1, y), pt(x, y - 1 || y + 1)]), good, `From 0, go right ${x} (x), then up ${y} (y). The coordinates are <b>${good}</b>.`, { vis: U.coord([{ l: 'A', x, y }]), optionTags: { [sw]: 'koordinat-tertukar' } }); } },
        { id: '5K2', name: 'Finding points from coordinates', gen() { const pts = []; const L = ['A', 'B', 'C', 'D']; while (pts.length < 4) { const x = r(0, 7), y = r(0, 7); if (!pts.some((p) => (p.x === x && p.y === y) || (p.x === y && p.y === x))) pts.push({ l: L[pts.length], x, y }); } const tg = pick(pts); return ch(`Which point is at ${pt(tg.x, tg.y)}?`, L, tg.l, `Go right ${tg.x}, then up ${tg.y}: point <b>${tg.l}</b>.`, { vis: U.coord(pts) }); } },
      ],
    },
    {
      id: '5L', grade: 5, name: 'Volume of cubes and cuboids', icon: '🧊', color: '#81ecec',
      sg: '5A · Volume of Cube and Cuboid', ixl: 'UU', km: 'Measurement (volume; CP Phase C)',
      tip: 'Calculate the volume of a milk carton: length × width × height. 1 liter = 1,000 cm³.',
      skills: [
        { id: '5L1', name: 'Volume with unit cubes', gen() { const l = r(2, 5), w = r(2, 4), h = r(2, 4); return inp('This cuboid is made of unit cubes. How many unit cubes are there?', l * w * h, `${l} × ${w} = ${l * w} cubes in one layer, and there are ${h} layers: ${l * w} × ${h} = <b>${l * w * h}</b>.`, { vis: U.cuboid(l, w, h, true) }); } },
        { id: '5L2', name: 'Volume of a cuboid', gen() { const l = r(3, 15), w = r(2, 10), h = r(2, 12); return inp('What is the volume of this cuboid in cm³?', l * w * h, `Volume = length × width × height = ${l} × ${w} × ${h} = <b>${fmt(l * w * h)}</b> cm³.`, { vis: U.cuboid(l, w, h) }); } },
        { id: '5L3', name: 'Finding a side from the volume', gen() { if (Math.random() < 0.4) { const s = r(2, 10); return inp(`The volume of a cube is ${fmt(s ** 3)} cm³. How long is its edge in cm?`, s, `Find the number multiplied three times = ${s ** 3}: ${s} × ${s} × ${s} = ${s ** 3}. The answer is <b>${s}</b> cm.`); } const l = r(3, 12), w = r(2, 9), h = r(2, 10); return inp(`The volume of a cuboid is ${fmt(l * w * h)} cm³, its length ${l} cm, its width ${w} cm. What is its height in cm?`, h, `Height = ${fmt(l * w * h)} ÷ (${l} × ${w}) = ${fmt(l * w * h)} ÷ ${l * w} = <b>${h}</b> cm.`); } },
        { id: '5L4', name: 'Liters and cubic centimeters', gen() { if (Math.random() < 0.5) { const l = r(2, 9); return inp(`${l} liters = ? cm³`, l * 1000, `1 liter = 1,000 cm³. ${l} × 1,000 = <b>${fmt(l * 1000)}</b> cm³.`, { meta: { kind: 'unit' } }); } const l = r(10, 30), w = r(10, 20), h = 10 * r(1, 3); return inp(`An aquarium measures ${l} cm × ${w} cm × ${h} cm. How many liters of water can it hold? (round down)`, Math.floor((l * w * h) / 1000), `Volume ${l} × ${w} × ${h} = ${fmt(l * w * h)} cm³ = ${dec((l * w * h) / 1000)} liters. Rounded down: <b>${Math.floor((l * w * h) / 1000)}</b> liters.`, { meta: { kind: 'unit' } }); } },
      ],
    },
    {
      id: '5M', grade: 5, name: 'Triangles and angles', icon: '🔺', color: '#ffeaa7',
      sg: '5B · Area of Triangle; Angles; Properties of Triangles', ixl: 'PP, QQ, RR, SS, TT', km: 'Measurement; Geometry',
      tip: 'Cut a rectangle along its diagonal: two equal triangles. That\'s why triangle area = base × height ÷ 2.',
      skills: [
        { id: '5M1', name: 'Area of a triangle', gen() { const a = r(2, 12) * 2, t = r(3, 15); return inp('What is the area of this triangle in cm²?', (a * t) / 2, `Area = base × height ÷ 2 = ${a} × ${t} ÷ 2 = <b>${(a * t) / 2}</b> cm².`, { vis: U.triangle(a, t), meta: { alt: { [String(a * t)]: 'rumus-segitiga' } } }); } },
        { id: '5M2', name: 'Angles in a triangle', gen() { const a = r(25, 90), b = r(20, 150 - a); return inp(`Two angles of a triangle are ${a}° and ${b}°. How many degrees is the third angle?`, 180 - a - b, `Angles in a triangle add up to 180°. 180 − ${a} − ${b} = <b>${180 - a - b}</b>°.`, { meta: { alt: { [String(360 - a - b)]: 'konsep' } } }); } },
        { id: '5M3', name: 'Angles around a point and on a straight line', gen() { if (Math.random() < 0.5) { const a = r(60, 150), b = r(40, 300 - a - 20); return inp(`Three angles surround a point. Two of them are ${a}° and ${b}°. How many degrees is the third angle?`, 360 - a - b, `Angles around a point add up to 360°. 360 − ${a} − ${b} = <b>${360 - a - b}</b>°.`); } const k = r(20, 160); return inp('The two angles are on a straight line. How many degrees is the angle in question?', 180 - k, `They add up to 180°: 180 − ${k} = <b>${180 - k}</b>°.`, { vis: U.straight(k, 180) }); } },
      ],
    },
    {
      id: '5N', grade: 5, name: 'Averages and charts', icon: '📊', color: '#00b894',
      sg: '5B · Average; Line Graphs', ixl: 'NN, OO', km: 'Data Analysis and Probability',
      tip: 'Calculate the average weekly pocket money: add it all up, then divide by 7.',
      skills: [
        { id: '5N1', name: 'Calculating averages', gen() { const n = r(3, 6), avg = r(5, 90); let xs = range(1, n).map(() => avg + r(-10, 10)); const diff = avg * n - xs.reduce((a, b) => a + b, 0); xs[0] += diff; if (xs.some((x) => x < 0)) return C.SKILLS['5N1'].gen(); return inp(`What is the average of ${xs.join(', ')}?`, avg, `Sum = ${xs.join(' + ')} = ${avg * n}. Average = ${avg * n} ÷ ${n} = <b>${avg}</b>.`, { meta: { alt: { [String(avg * n)]: 'konsep' } } }); } },
        { id: '5N2', name: 'Total from an average', gen() { const n = r(3, 8), avg = r(60, 95); const [n1] = two(); if (Math.random() < 0.5) return inp(`The average of ${n}'s test scores over ${n1} tests is ${avg}. What is the total of all the scores?`, n * avg, `Total = average × number of data points = ${avg} × ${n} = <b>${n * avg}</b>.`); const last = r(50, 100), tot = avg * n; const prev = tot - last; if (prev % (n - 1) !== 0) return C.SKILLS['5N2'].gen(); return inp(`The average of ${n - 1} of ${n1}'s tests is ${prev / (n - 1)}. After the next test, the average becomes ${avg}. What was the score on the last test?`, last, `Old total = ${prev / (n - 1)} × ${n - 1} = ${prev}. New total = ${avg} × ${n} = ${tot}. Last score = ${tot} − ${prev} = <b>${last}</b>.`); } },
        { id: '5N3', name: 'Reading line graphs', gen() { const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; const v = days.map(() => r(20, 38)); const i = r(0, 3); return inp(`How many degrees Celsius did the temperature rise or fall from ${days[i]} to ${days[i + 1]}?`, Math.abs(v[i + 1] - v[i]), `${days[i]}: ${v[i]}°C, ${days[i + 1]}: ${v[i + 1]}°C. The difference is <b>${Math.abs(v[i + 1] - v[i])}</b>°C.`, { vis: U.lineGraph('Midday Temperature (°C)', days.map((d, k) => [d, v[k]]), 40, 5) }); } },
      ],
    },
    {
      id: '5O', grade: 5, name: 'Units, time, and money', icon: '⏱️', color: '#fab1a0',
      sg: '5A/5B · Measures (decimals), Rate', ixl: 'HH, II, JJ, VV', km: 'Measurement',
      tip: 'Practice conversions while shopping: 1.5 kg of onions = 1,500 g; 750 mL of oil = 0.75 L.',
      skills: [
        { id: '5O1', name: 'Converting units with decimals', gen() { const [big, small, f] = pick([['kg', 'g', 1000], ['km', 'm', 1000], ['L', 'mL', 1000], ['m', 'cm', 100]]); if (Math.random() < 0.5) { const x = r(11, 999) / 100; return inp(`${dec(x)} ${big} = ? ${small}`, Math.round(x * f), `1 ${big} = ${fmt(f)} ${small}. ${dec(x)} × ${fmt(f)} = <b>${fmt(Math.round(x * f))}</b> ${small}.`, { meta: { kind: 'unit' } }); } const n = r(1, f * 9); return inp(`${fmt(n)} ${small} = ? ${big}`, dec(n / f), `Divide by ${fmt(f)}: ${fmt(n)} ÷ ${fmt(f)} = <b>${dec(n / f)}</b> ${big}.`, { keys: ['.'], meta: { kind: 'unit' } }); } },
        { id: '5O2', name: 'Rates: price and amount per unit', gen() { const p = r(3, 20) * 1000, n = r(3, 12), m = r(2, 15); return inp(`${n} kg of rice costs ${rp(p * n)}. What's the price of ${m} kg of rice? (write the number only)`, p * m, `Price of 1 kg = ${rp(p * n)} ÷ ${n} = ${rp(p)}. Price of ${m} kg = ${m} × ${rp(p)} = <b>${rp(p * m)}</b>.`, { unit: 'Rp' }); } },
        { id: '5O3', name: 'Days, hours, and minutes', gen() { if (Math.random() < 0.5) { const d = r(1, 5), h = r(1, 23); return inp(`${d} days ${h} hours = ? hours`, d * 24 + h, `1 day = 24 hours: ${d} × 24 + ${h} = <b>${d * 24 + h}</b> hours.`, { meta: { kind: 'unit' } }); } const s = r(7, 15) * 60 + r(0, 11) * 5, d = r(25, 300), e = s + d; return inp(`${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} plus ${d} minutes. What hour is it? (write the hour only, 24-hour clock)`, Math.floor(e / 60), `${d} minutes = ${Math.floor(d / 60)} hours ${d % 60} minutes. The result is ${String(Math.floor(e / 60)).padStart(2, '0')}:${String(e % 60).padStart(2, '0')}, so the hour is <b>${Math.floor(e / 60)}</b>.`); } },
      ],
    },
  ];

  C.register(UNITS);
  C.GRADES.push({ id: 5, name: 'Grade 5', ixl: 'https://www.ixl.com/math/grade-5', sg: 'Primary Mathematics / Dimensions Math 5A and 5B' });
})();
