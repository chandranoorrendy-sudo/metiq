/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Kelas 7 (SMP, Fase D). Cakupan mengikuti daftar IXL kelas 7:
 * bilangan bulat dan rasional, pangkat dan akar, perbandingan dan persen, aljabar, persamaan linear,
 * garis dan sudut, lingkaran dan volume, statistika, dan peluang.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, lin, num, pil, opt, lesson, FR, CX, gcd } = C.kit;
  // Coret silang saat mengalikan pecahan: pembilang dan penyebut yang punya faktor sama dicoret, angka barunya ditulis kecil.
  // Pecahan sudah dalam bentuk seperti yang tampil di soal (paling sederhana). null bila tidak ada yang bisa dicoret.
  function crossSteps(a, b, c, d) {
    const g1 = gcd(Math.abs(a), d) || 1, g2 = gcd(Math.abs(c), b) || 1; if ((g1 === 1 && g2 === 1) || b === 1 || d === 1) return null;
    const x = (v, g) => (g > 1 ? `${CX(Math.abs(v))}<small class="mnew">${Math.abs(v) / g}</small>` : Math.abs(v)), sign = a * c < 0 ? '−' : '', ra = Math.abs(a) / g1, rc = Math.abs(c) / g2, rb = b / g2, rd = d / g1;
    return [['Cross out', `${sign}${FR(x(a, g1), x(b, g2))} × ${FR(x(c, g2), x(d, g1))}`], ['Multiply what\'s left', `${sign}(${ra} × ${rc}) / (${rb} × ${rd}) = ${sign}${ra * rc}/${rb * rd}`], ['Result', `<b>${F(a * c, b * d)}</b>`]];
  }
  const low = (n, d) => { const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };

  const UNITS = [
    {
      id: '7A', grade: 7, name: 'Integers', icon: '➖', color: '#4d96ff', ixl: 'A–B', sg: 'Phase D · Numbers', km: 'Numbers',
      tip: 'Use a number line or thermometer: up = add, down = subtract.',
      skills: [
        { id: '7A1', name: 'Adding and subtracting integers', gen() { const a = nz(-20, 20), b = nz(-20, 20), add = Math.random() < 0.5, ans = add ? a + b : a - b; return num(`${N(a)} ${add ? '+' : '−'} ${P(b)} = ?`, ans, 'Subtracting is the same as adding the opposite: a − b = a + (−b). Same signs add, different signs subtract.', [
          ['Change to addition', add ? `${N(a)} + ${P(b)}` : `${N(a)} − ${P(b)} = ${N(a)} + ${P(-b)}`],
          ['Calculate', `The result is <b>${N(ans)}</b>.`]], { meta: { kind: 'neg' } }); } },
        { id: '7A2', name: 'Multiplying and dividing integers', gen() { const a = nz(-12, 12), b = nz(-12, 12), mul = Math.random() < 0.5; if (mul) return num(`${N(a)} × ${P(b)} = ?`, a * b, 'Positive × positive and negative × negative give a positive result; different signs give a negative result.', [
          ['Multiply the values', `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a * b)}`], ['Determine the sign', `The signs are ${(a < 0) === (b < 0) ? 'same → positive' : 'different → negative'}. The result is <b>${N(a * b)}</b>.`]], { meta: { kind: 'neg' } });
          const t = a * b; return num(`${N(t)} : ${P(b)} = ?`, a, 'The sign rules for division are the same as for multiplication.', [
          ['Divide the values', `${Math.abs(t)} : ${Math.abs(b)} = ${Math.abs(a)}`], ['Determine the sign', `The signs are ${(t < 0) === (b < 0) ? 'same → positive' : 'different → negative'}. The result is <b>${N(a)}</b>.`]], { meta: { kind: 'neg' } }); } },
        { id: '7A3', name: 'Mixed integer operations', gen() { const a = nz(-9, 9), b = nz(-9, 9), c = nz(-9, 9), ans = a + b * c; return num(`${N(a)} + ${P(b)} × ${P(c)} = ?`, ans, 'Do multiplication and division first, then addition and subtraction.', [
          ['Multiply first', `${P(b)} × ${P(c)} = ${N(b * c)}`], ['Then add', `${N(a)} + ${P(b * c)} = <b>${N(ans)}</b>`]], { meta: { kind: 'neg' } }); } },
      ],
    },
    {
      id: '7B', grade: 7, name: 'Rational numbers', icon: '½', color: '#ff7a59', ixl: 'C–I', sg: 'Phase D · Numbers', km: 'Numbers',
      tip: 'Make denominators equal using the LCM before adding fractions.',
      skills: [
        { id: '7B1', name: 'Adding and subtracting fractions', gen() { const b = r(2, 9), d = pick([2, 3, 4, 5, 6].filter((x) => x !== b)), a = nz(-8, 8), c = r(1, 8), add = Math.random() < 0.5; const n = add ? a * d + c * b : a * d - c * b; return num(`${FH(a, b)} ${add ? '+' : '−'} ${FH(c, d)} = ? (write the simplest fraction, e.g. 7/12)`, F(n, b * d), 'Make the denominators equal, then add or subtract the numerators.', [
          ['Make denominators equal', `${FH(a, b)} = ${a * d}/${b * d} and ${FH(c, d)} = ${c * b}/${b * d}`], [add ? 'Add the numerators' : 'Subtract the numerators', `${a * d} ${add ? '+' : '−'} ${c * b} = ${n}, so ${n}/${b * d}`], ['Simplify', `<b>${F(n, b * d)}</b>`]]); } },
        { id: '7B2', name: 'Multiplying and dividing fractions', gen() { const a = nz(-6, 6), b = r(2, 9), c = r(1, 6), d = r(2, 9), mul = Math.random() < 0.5; if (mul) return num(`${FH(a, b)} × ${FH(c, d)} = ? (simplest fraction)`, F(a * c, b * d), 'Multiply numerator by numerator and denominator by denominator.', [
          ...[crossSteps(...low(a, b), ...low(c, d)) || [['Multiply', `(${a} × ${c}) / (${b} × ${d}) = ${a * c}/${b * d}`], ['Simplify', `<b>${F(a * c, b * d)}</b>`]]][0]]);
          return num(`${FH(a, b)} ÷ ${FH(c, d)} = ? (simplest fraction)`, F(a * d, b * c), 'Dividing by a fraction is the same as multiplying by its reciprocal.', [
          ['Flip the divisor fraction', `${FH(c, d)} → ${FH(d, c)}`], ...(crossSteps(...low(a, b), ...low(d, c)) || [['Multiply', `${FH(a, b)} × ${d}/${c} = ${a * d}/${b * c}`], ['Simplify', `<b>${F(a * d, b * c)}</b>`]])]); } },
        { id: '7B3', name: 'Converting fractions to decimals', gen() { const [a, b] = pick([[1, 4], [3, 4], [1, 8], [3, 8], [5, 8], [1, 5], [2, 5], [7, 20], [9, 25], [3, 40], [7, 8], [11, 20]]); return num(`Write ${FH(a, b)} as a decimal.`, a / b, 'A fraction means division: the numerator divided by the denominator.', [
          ['Change the denominator to 10, 100, or 1000 if possible', `${a}/${b} = ${a * (1000 / b)}/1000`], ['Write the decimal', `<b>${N(a / b)}</b>`]], { meta: { kind: 'decimal' } }); } },
      ],
    },
    {
      id: '7C', grade: 7, name: 'Powers and square roots', icon: '²', color: '#9b6dff', ixl: 'J–K', sg: 'Phase D · Numbers', km: 'Numbers',
      tip: 'Memorize the squares of 1 to 15 to find roots quickly.',
      skills: [
        { id: '7C1', name: 'Evaluating powers', gen() { const a = nz(-6, 6), n = r(2, a > 3 || a < -3 ? 3 : 4), ans = a ** n, paren = a < 0; return num(`${paren ? `(${N(a)})` : N(a)}${sup(n)} = ?`, ans, `a${sup('n')} means a multiplied by itself n times.`, [
          ['Write the multiplication', Array(n).fill(P(a)).join(' × ')], ['Calculate', `The result is <b>${N(ans)}</b>${a < 0 ? ` (exponent ${n % 2 ? 'odd → negative' : 'even → positive'})` : ''}.`]], { meta: { kind: 'neg' } }); } },
        { id: '7C2', name: 'Square roots', gen() { const k = r(2, 20); return num(`√${k * k} = ?`, k, 'The square root of n is the positive number that gives n when squared.', [
          ['Find the number to square', `${k} × ${k} = ${k * k}`], ['Answer', `√${k * k} = <b>${k}</b>`]]); } },
        { id: '7C3', name: 'Order of operations with powers', gen() { const a = r(2, 5), b = r(2, 9), c = r(1, 9), ans = a * a + b * c; return num(`${a}${sup(2)} + ${b} × ${c} = ?`, ans, 'Order: parentheses, powers, multiply/divide, then add/subtract.', [
          ['Powers first', `${a}${sup(2)} = ${a * a}`], ['Then multiplication', `${b} × ${c} = ${b * c}`], ['Finally addition', `${a * a} + ${b * c} = <b>${ans}</b>`]]); } },
      ],
    },
    {
      id: '7D', grade: 7, name: 'Ratios and percents', icon: '%', color: '#1fbf9f', ixl: 'L, N–P', sg: 'Phase D · Numbers', km: 'Numbers',
      tip: 'Calculate discounts, tax, and savings interest together while shopping.',
      skills: [
        { id: '7D1', name: 'Proportions', gen() { const a = r(2, 9), b = r(2, 9), k = r(2, 9); return num(`${a} : ${b} = ${a * k} : x. What is x?`, b * k, 'In a proportion, both terms are multiplied by the same number.', [
          ['Find the scale factor', `${a * k} : ${a} = ${k}`], ['Multiply the second term', `x = ${b} × ${k} = <b>${b * k}</b>`]]); } },
        { id: '7D2', name: 'Percent of a number', gen() { const p = pick([5, 10, 12, 15, 20, 25, 30, 40, 75]), n = pick([40, 60, 80, 120, 200, 240, 360, 400, 500]); return num(`${p}% of ${n} = ?`, (p * n) / 100, 'p% of n = p/100 × n.', [
          ['Write as a multiplication', `${p}/100 × ${n}`], ['Calculate', `${p * n} : 100 = <b>${N((p * n) / 100)}</b>`]]); } },
        { id: '7D3', name: 'Discounts and final price', gen() { const h = pick([40000, 60000, 80000, 120000, 150000, 200000]), d = pick([10, 15, 20, 25, 30, 40]), cut = (h * d) / 100; return num(`A shirt costing Rp${h.toLocaleString('en-US')} is discounted ${d}%. How many rupiah is the price after the discount? (number only)`, h - cut, 'Final price = original price − discount.', [
          ['Calculate the discount', `${d}% × ${h.toLocaleString('en-US')} = ${cut.toLocaleString('en-US')}`], ['Subtract', `${h.toLocaleString('en-US')} − ${cut.toLocaleString('en-US')} = <b>${(h - cut).toLocaleString('en-US')}</b>`]], { unit: 'Rp' }); } },
        { id: '7D4', name: 'Simple interest', gen() { const m = pick([1000000, 2000000, 5000000]), p = pick([4, 5, 6, 8, 10]), t = r(1, 3), b = (m * p * t) / 100; return num(`Savings of Rp${m.toLocaleString('en-US')} earn simple interest of ${p}% per year. What is the interest after ${t} years? (number only)`, b, 'Simple interest = principal × interest rate × time (years).', [
          ['One year\'s interest', `${p}% × ${m.toLocaleString('en-US')} = ${((m * p) / 100).toLocaleString('en-US')}`], ['Multiply by the time', `${((m * p) / 100).toLocaleString('en-US')} × ${t} = <b>${b.toLocaleString('en-US')}</b>`]], { unit: 'Rp' }); } },
      ],
    },
    {
      id: '7E', grade: 7, name: 'Algebraic expressions', icon: '𝑥', color: '#e84393', ixl: 'R–S', sg: 'Phase D · Algebra', km: 'Algebra',
      tip: 'Like terms are like the same fruit: 3 apples + 2 apples = 5 apples, but apples and oranges can\'t be combined.',
      skills: [
        { id: '7E1', name: 'Substituting variable values', gen() { const a = nz(-5, 6), b = nz(-9, 9), x = nz(-5, 5), ans = a * x + b; return num(`If x = ${N(x)}, what is the value of ${lin(a, b)}?`, ans, 'Replace every x with its value, then calculate.', [
          ['Substitution', `${N(a)} × ${P(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`], ['Calculate', `${N(a * x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = <b>${N(ans)}</b>`]]); } },
        { id: '7E2', name: 'Simplifying like terms', gen() { const a = nz(-6, 8), b = nz(-6, 8), c = nz(-9, 9), d = nz(-9, 9); const ans = lin(a + b, c + d); return pil(`Simplify: ${lin(a, c)} + (${lin(b, d)})`, opt(ans, [lin(a + b, c - d), lin(a - b, c + d), lin(a + b + 1, c + d), lin(a + b, c + d + 1), lin(a * b, c + d)]), ans, 'Group the terms with x and the constant terms, then add their coefficients.', [
          ['Combine the x terms', `${N(a)}x + ${P(b)}x = ${N(a + b)}x`], ['Combine the constants', `${N(c)} + ${P(d)} = ${N(c + d)}`], ['Result', `<b>${ans}</b>`]]); } },
        { id: '7E3', name: 'Distributive property', gen() { const k = nz(-6, 7), a = nz(-5, 6), b = nz(-9, 9), ans = lin(k * a, k * b); return pil(`${N(k)}(${lin(a, b)}) = ?`, opt(ans, [lin(k * a, b), lin(a, k * b), lin(k * a, -k * b), lin(k + a, k * b), lin(k * a, k + b)]), ans, 'k(a + b) = ka + kb: multiply the number outside the parentheses by each term inside.', [
          ['Multiply the first term', `${N(k)} × ${lin(a, 0)} = ${lin(k * a, 0)}`], ['Multiply the second term', `${N(k)} × ${P(b)} = ${N(k * b)}`], ['Result', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: '7F', grade: 7, name: 'Linear equations and inequalities', icon: '⚖️', color: '#00b894', ixl: 'T–U', sg: 'Phase D · Algebra', km: 'Algebra',
      tip: 'An equation is like a balance: whatever you do on the left, do on the right too.',
      skills: [
        { id: '7F1', name: 'Solving ax + b = c', gen() { const a = nz(-9, 9), x = nz(-10, 10), b = nz(-15, 15), c = a * x + b; return num(`${lin(a, b)} = ${N(c)}. What is x?`, x, 'Move the constant to the right side, then divide by the coefficient of x.', [
          ['Subtract from both sides ' + N(b), `${lin(a, 0)} = ${N(c)} − ${P(b)} = ${N(c - b)}`], ['Divide by ' + N(a), `x = ${N(c - b)} : ${P(a)} = <b>${N(x)}</b>`], ['Check', `${N(a)} × ${P(x)} + ${P(b)} = ${N(c)} ✓`]]); } },
        { id: '7F2', name: 'Equations with parentheses', gen() { const a = nz(-6, 6), b = nz(-9, 9), x = nz(-8, 8), c = a * (x + b); return num(`${N(a)}(x ${b < 0 ? '−' : '+'} ${Math.abs(b)}) = ${N(c)}. What is x?`, x, 'Divide both sides by the number outside the parentheses, or remove the parentheses first.', [
          ['Divide both sides by ' + N(a), `x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${N(c)} : ${P(a)} = ${N(c / a)}`], ['Move the constant', `x = ${N(c / a)} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = <b>${N(x)}</b>`]]); } },
        { id: '7F3', name: 'Linear inequalities', gen() { const a = nz(-6, 6), x0 = nz(-8, 8), b = nz(-9, 9), c = a * x0 + b, s = pick(['<', '>']); const flip = a < 0, rs = flip ? (s === '<' ? '>' : '<') : s; const ans = `x ${rs} ${N(x0)}`, wrong = `x ${rs === '<' ? '>' : '<'} ${N(x0)}`; return pil(`Selesaikan: ${lin(a, b)} ${s} ${N(c)}`, opt(ans, [wrong, `x ${rs} ${N(-x0)}`, `x ${rs === '<' ? '>' : '<'} ${N(-x0)}`, `x ${rs} ${N(x0 + 1)}`]), ans, 'Same as equations, but if both sides are multiplied or divided by a negative number, the inequality sign flips.', [
          ['Move the constant', `${lin(a, 0)} ${s} ${N(c - b)}`], ['Divide by ' + N(a), flip ? `Dividing by a negative number → the sign flips: x ${rs} ${N(x0)}` : `x ${rs} ${N(x0)}`], ['Answer', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: '7G', grade: 7, name: 'Lines and angles', icon: '📐', color: '#fdcb6e', ixl: 'Y–Z', sg: 'Phase D · Geometry', km: 'Geometry',
      tip: 'A protractor at home can be used to measure the angles of doors and books.',
      skills: [
        { id: '7G1', name: 'Supplementary and complementary angles', gen() { const lurus = Math.random() < 0.5, t = lurus ? 180 : 90, a = r(15, t - 15); return num(`Two angles are ${lurus ? 'supplementary (they add up to 180°)' : 'complementary (they add up to 90°)'}. One is ${a}°. How many degrees is the other?`, t - a, `${lurus ? 'supplementary, adding up to 180°' : 'complementary, adding up to 90°'} angles.`, [
          ['Subtract from their sum', `${t}° − ${a}° = <b>${t - a}°</b>`]], { unit: '°' }); } },
        { id: '7G2', name: 'Sum of angles in a triangle', gen() { const a = r(20, 100), b = r(20, 160 - a); return num(`Two angles of a triangle are ${a}° and ${b}°. How many degrees is the third?`, 180 - a - b, 'The three angles of a triangle always add up to 180°.', [
          ['Add the known angles', `${a}° + ${b}° = ${a + b}°`], ['Subtract from 180°', `180° − ${a + b}° = <b>${180 - a - b}°</b>`]], { unit: '°' }); } },
        { id: '7G3', name: 'Vertical angles', gen() { const a = r(20, 160); const want = pick(['vertical', 'supplementary']); const ans = want === 'vertical' ? a : 180 - a; return num(`Two intersecting lines form an angle of ${a}°. How many degrees is the angle ${want} to it?`, ans, 'Vertical angles are equal; adjacent angles on a straight line add up to 180°.', [
          ['Identify the relationship', want === 'vertical' ? 'Vertical angles are equal.' : 'Supplementary angles add up to 180°.'], ['Answer', want === 'vertical' ? `<b>${a}°</b>` : `180° − ${a}° = <b>${180 - a}°</b>`]], { unit: '°' }); } },
      ],
    },
    {
      id: '7H', grade: 7, name: 'Circles, area, and volume', icon: '⭕', color: '#00a8cc', ixl: 'BB–CC', sg: 'Phase D · Measurement', km: 'Measurement',
      tip: 'Measure the circumference of a glass with thread and divide by its diameter: the result is close to π.',
      skills: [
        { id: '7H1', name: 'Circumference of a circle', gen() { const rr = pick([7, 14, 21, 28, 35]); return num(`The radius of a circle is ${rr} cm. What is its circumference in cm? (π = 22/7)`, (2 * 22 * rr) / 7, 'Circumference C = 2πr.', [
          ['Substitution', `K = 2 × 22/7 × ${rr}`], ['Calculate', `2 × 22 × ${rr / 7} = <b>${(2 * 22 * rr) / 7}</b> cm`]], { unit: 'cm' }); } },
        { id: '7H2', name: 'Area of a circle', gen() { const rr = pick([7, 14, 21]); return num(`The radius of a circle is ${rr} cm. What is its area in cm²? (π = 22/7)`, (22 * rr * rr) / 7, 'Area A = πr².', [
          ['Substitution', `L = 22/7 × ${rr} × ${rr}`], ['Calculate', `22 × ${rr / 7} × ${rr} = <b>${(22 * rr * rr) / 7}</b> cm²`]], { unit: 'cm²' }); } },
        { id: '7H3', name: 'Volume of prisms', gen() { const a = r(3, 12), t = r(3, 12), p = r(2, 15); return num(`Triangular prism: triangle base ${a} cm and triangle height ${t} cm, prism height ${p} cm. What is its volume in cm³?`, (a * t * p) / 2, 'Volume of a prism = base area × prism height.', [
          ['Area of the triangular base', `½ × ${a} × ${t} = ${N((a * t) / 2)} cm²`], ['Multiply by the prism height', `${N((a * t) / 2)} × ${p} = <b>${N((a * t * p) / 2)}</b> cm³`]], { unit: 'cm³' }); } },
      ],
    },
    {
      id: '7I', grade: 7, name: 'Statistics and probability', icon: '🎲', color: '#9b6dff', ixl: 'GG–II', sg: 'Phase D · Data Analysis and Probability', km: 'Data Analysis and Probability',
      tip: 'Record test scores or family heights, then find the mean, median, and mode.',
      skills: [
        { id: '7I1', name: 'Mean', gen() { const n = r(4, 6), m = r(5, 20), d = Array.from({ length: n }, () => r(-4, 4)); d[n - 1] = -d.slice(0, -1).reduce((s, x) => s + x, 0); const xs = shuffle(d.map((x) => m + x)); return num(`What is the mean of the data ${xs.join(', ')}?`, m, 'Mean = sum of all data ÷ number of data points.', [
          ['Add', `${xs.join(' + ')} = ${m * n}`], ['Divide by the number of data points', `${m * n} : ${n} = <b>${m}</b>`]]); } },
        { id: '7I2', name: 'Median', gen() { const n = pick([5, 7, 6]); const xs = Array.from({ length: n }, () => r(1, 30)); const s = [...xs].sort((a, b) => a - b); const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; return num(`What is the median of the data ${xs.join(', ')}?`, med, 'The median is the middle value after ordering; with an even number of data points, average the two middle values.', [
          ['Sort', s.join(', ')], ['Take the middle value', n % 2 ? `Data point ${(n + 1) / 2}: <b>${N(med)}</b>` : `(${s[n / 2 - 1]} + ${s[n / 2]}) : 2 = <b>${N(med)}</b>`]]); } },
        { id: '7I3', name: 'Mode', gen() { const m = r(2, 20); let xs = [m, m, m]; while (xs.length < 8) { const v = r(1, 20); if (v !== m && xs.filter((x) => x === v).length < 2) xs.push(v); } xs = shuffle(xs); return num(`What is the mode of the data ${xs.join(', ')}?`, m, 'The mode is the most frequent value.', [
          ['Count occurrences', `${m} appears 3 times, other values at most 2 times.`], ['Answer', `Mode = <b>${m}</b>`]]); } },
        { id: '7I4', name: 'Probability of simple events', gen() { const m = r(2, 8), k = r(2, 8), h = r(1, 6), tot = m + k + h, [nm, c] = pick([['red', m], ['yellow', k], ['green', h]]); return num(`A bag has ${m} red marbles, ${k} yellow, and ${h} green. One marble is drawn at random. What's the probability of drawing ${nm}? (simplest fraction)`, F(c, tot), 'Probability = number of desired outcomes ÷ number of all outcomes.', [
          ['Number of all marbles', `${m} + ${k} + ${h} = ${tot}`], ['Number of marbles ' + nm, String(c)], ['Probability', `${c}/${tot} = <b>${F(c, tot)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: 7, name: 'Grade 7', short: '7', stage: 'SMP', ixl: 'https://www.ixl.com/math/grade-7', sg: 'Kurikulum Merdeka Phase D (middle school)' });

  lesson('7A', 'Integers consist of negative numbers, zero, and positive numbers.', [
    ['Add and subtract', ['On a number line, adding a positive number = moving right.', 'Subtracting = adding the opposite: 5 − (−3) = 5 + 3.'], '7A1'],
    ['Multiply and divide', ['Same signs → positive result.', 'Different signs → negative result.'], '7A2'],
  ]);
  lesson('7B', 'Rational numbers can be written as a fraction a/b with b ≠ 0.', [
    ['Sums and differences of fractions', ['Find the LCM of the denominators.', 'Change each fraction to that denominator, then add the numerators.', 'Simplify the result.'], '7B1'],
    ['Multiplying and dividing fractions', ['Multiply: numerator × numerator, denominator × denominator.', 'Divide: multiply by the reciprocal of the divisor.'], '7B2'],
  ]);
  lesson('7C', 'A power is repeated multiplication; a square root is the inverse of a square.', [
    ['Power', ['3⁴ = 3 × 3 × 3 × 3 = 81.', 'A negative number raised to an even power is positive.'], '7C1'],
    ['Order of operations', ['Parentheses → powers → multiply/divide → add/subtract.'], '7C3'],
  ]);
  lesson('7D', 'A ratio compares two quantities; a percent is a ratio with 100.', [
    ['Proportions', ['If a : b = c : d, then a × d = b × c.'], '7D1'],
    ['Percent', ['p% of n = p × n ÷ 100.', 'Price after discount = original price − discount.'], '7D3'],
  ]);
  lesson('7E', 'Algebraic expressions use letters (variables) for unknown numbers.', [
    ['Like terms', ['Like terms have the same variable and exponent.', 'Add the coefficients: 3x + 5x = 8x.'], '7E2'],
    ['Distributive', ['a(b + c) = ab + ac.'], '7E3'],
  ]);
  lesson('7F', 'Solving an equation means finding the variable value that makes both sides equal.', [
    ['Linear equations', ['Do the same operation on both sides.', 'Leave x alone on one side.', 'Check by substituting.'], '7F1'],
    ['Inequalities', ['The method is the same as for equations.', 'When multiplying or dividing by a negative number, flip the sign.'], '7F3'],
  ]);
  lesson('7G', 'Angles and lines have fixed relationships that can be used to find unknown angles.', [
    ['Angle pairs', ['Complementary: add up to 90°.', 'Supplementary: add up to 180°.', 'Vertical: equal.'], '7G1'],
    ['Triangles', ['Sum of angles in a triangle = 180°.'], '7G2'],
  ]);
  lesson('7H', 'Circles use π ≈ 22/7 ≈ 3.14.', [
    ['Circumference and area of circles', ['K = 2πr = πd.', 'L = πr².'], '7H2'],
    ['Volume of prisms', ['V = base area × height.'], '7H3'],
  ]);
  lesson('7I', 'Statistics summarizes data; probability measures how likely something is to happen.', [
    ['Measures of center', ['Mean = sum of data ÷ number of data points.', 'Median = middle value of ordered data.', 'Mode = most frequent value.'], '7I1'],
    ['Probability', ['P(A) = number of A outcomes ÷ number of all outcomes.', 'The value is between 0 and 1.'], '7I4'],
  ]);
})();
