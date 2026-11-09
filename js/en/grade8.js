/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Kelas 8 (SMP, Fase D). Cakupan mengikuti daftar IXL kelas 8:
 * eksponen dan notasi ilmiah, akar dan bilangan irasional, teorema Pythagoras, barisan,
 * fungsi dan gradien, sistem persamaan linear, transformasi, bangun ruang sisi lengkung, statistika dan peluang.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, lin, num, pil, opt, lesson } = C.kit;
  const pt = (x, y) => `(${N(x)}, ${N(y)})`;

  const UNITS = [
    {
      id: '8A', grade: 8, name: 'Exponents and scientific notation', icon: '🔟', color: '#4d96ff', ixl: 'C–D', sg: 'Phase D · Numbers', km: 'Numbers',
      tip: 'The Earth–Sun distance is about 1.5 × 10⁸ km: scientific notation makes very large numbers easy to write.',
      skills: [
        { id: '8A1', name: 'Properties of multiplying and dividing powers', gen() { const a = r(2, 9), m = r(2, 9), n = r(2, 9), mul = Math.random() < 0.5; const ans = mul ? m + n : m - n; return num(mul ? `${a}${sup(m)} × ${a}${sup(n)} = ${a}${sup('k')}. What is k?` : `${a}${sup(m)} ÷ ${a}${sup(n)} = ${a}${sup('k')}. What is k?`, ans, mul ? 'For the same base, a^m × a^n = a^(m+n).' : 'For the same base, a^m ÷ a^n = a^(m−n).', [
          ['The bases are the same (' + a + ')', mul ? 'Add the exponents.' : 'Subtract the exponents.'], ['Calculate', `k = ${m} ${mul ? '+' : '−'} ${n} = <b>${N(ans)}</b>`]]); } },
        { id: '8A2', name: 'Zero and negative exponents', gen() { const a = r(2, 6), n = r(0, 3), neg = n > 0; return num(`${a}${sup(neg ? '−' + n : 0)} = ? ${neg ? '(write as a fraction, e.g. 1/8)' : ''}`, neg ? F(1, a ** n) : 1, 'a⁰ = 1 for a ≠ 0, and a^(−n) = 1/aⁿ.', neg ? [
          ['Change to a fraction', `${a}${sup('−' + n)} = 1/${a}${sup(n)}`], ['Calculate', `1/${a ** n} → <b>${F(1, a ** n)}</b>`]] : [['Use the zero exponent rule', `Any number except 0 raised to the power 0 is <b>1</b>.`]]); } },
        { id: '8A3', name: 'Scientific notation', gen() { const m = r(11, 99) / 10, e = r(3, 9), big = Math.round(m * 10) * 10 ** (e - 1); const s = big.toLocaleString('en-US'); return num(`${s} = ${N(m)} × 10${sup('n')}. What is n?`, e, 'Scientific notation: a × 10ⁿ with 1 ≤ a < 10. n = the number of places the decimal point moves.', [
          ['Place the decimal point after the first digit', `${N(m)}`], ['Count how far the point moves', `The point moves ${e} places left, so n = <b>${e}</b>.`]]); } },
      ],
    },
    {
      id: '8B', grade: 8, name: 'Roots and irrational numbers', icon: '√', color: '#9b6dff', ixl: 'E–F', sg: 'Phase D · Numbers', km: 'Numbers',
      tip: '√2 can\'t be written as a fraction: its decimal neither ends nor repeats.',
      skills: [
        { id: '8B1', name: 'Cube roots', gen() { const k = nz(-10, 10); return num(`∛${N(k ** 3)} = ?`, k, 'The cube root of n is the number that gives n when cubed.', [
          ['Find the number', `${P(k)} × ${P(k)} × ${P(k)} = ${N(k ** 3)}`], ['Answer', `<b>${N(k)}</b>`]]); } },
        { id: '8B2', name: 'Simplifying radicals', gen() { const m = pick([2, 3, 5, 6, 7]), k = r(2, 9), n = k * k * m, ans = `${k}√${m}`; return pil(`Simplify √${n}.`, opt(ans, [`${m}√${k}`, `${k * k}√${m}`, `${k}√${m * 2}`, `${k + 1}√${m}`, `√${k * m}`]), ans, '√(a × b) = √a × √b. Separate the factor that is a perfect square.', [
          ['Factor', `${n} = ${k * k} × ${m}`], ['Take the root of the perfect square', `√${k * k} = ${k}`], ['Result', `<b>${ans}</b>`]]); } },
        { id: '8B3', name: 'Rational or irrational', gen() { const rat = Math.random() < 0.5; const s = rat ? pick([`√${pick([4, 9, 16, 25, 36, 49, 64, 81])}`, `${r(1, 9)}/${r(2, 9)}`, `0,${r(1, 9)}${r(1, 9)}${r(1, 9)}`, `−${r(2, 30)}`, `0,333...`]) : pick([`√${pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 15])}`, 'π', `${r(2, 5)}√2`]); const ans = rat ? 'rational' : 'irrational'; return pil(`Is ${s} rational or irrational?`, ['rational', 'irrational'], ans, 'Rational numbers can be written as a/b; their decimals end or repeat. Roots of non-perfect squares, and π, are irrational.', [
          ['Check its form', rat ? `${s} can be written as a fraction (its decimal ends or repeats).` : `${s} has a decimal that neither ends nor repeats.`], ['Answer', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: '8C', grade: 8, name: 'The Pythagorean theorem', icon: '📐', color: '#ff7a59', ixl: 'T', sg: 'Phase D · Geometry', km: 'Geometry',
      tip: 'Builders use 3–4–5 to make exact right angles.',
      skills: [
        { id: '8C1', name: 'Finding the hypotenuse', gen() { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 12, 15], [12, 16, 20], [20, 21, 29]]); return num(`The legs of a triangle are ${a} cm and ${b} cm. What is the hypotenuse in cm?`, c, 'In a right triangle: c² = a² + b² (c = hypotenuse).', [
          ['Square the legs', `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}`], ['Take the root', `c = √${c * c} = <b>${c}</b> cm`]], { unit: 'cm' }); } },
        { id: '8C2', name: 'Finding a leg', gen() { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 40, 41], [12, 35, 37]]); return num(`The hypotenuse of a right triangle is ${c} cm and one leg is ${a} cm. How long is the other leg in cm?`, b, 'b² = c² − a².', [
          ['Subtract the squares', `${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}`], ['Take the root', `b = √${b * b} = <b>${b}</b> cm`]], { unit: 'cm' }); } },
        { id: '8C3', name: 'Distance between two points', gen() { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [12, 5, 13]]); const x1 = r(-5, 5), y1 = r(-5, 5), sx = pick([1, -1]), sy = pick([1, -1]); return num(`What is the distance between points ${pt(x1, y1)} and ${pt(x1 + sx * a, y1 + sy * b)}?`, c, 'Distance = √((x₂ − x₁)² + (y₂ − y₁)²), the Pythagorean theorem on the coordinate plane.', [
          ['Differences of coordinates', `Δx = ${a}, Δy = ${b}`], ['Pythagoras', `√(${a * a} + ${b * b}) = √${c * c} = <b>${c}</b>`]]); } },
      ],
    },
    {
      id: '8D', grade: 8, name: 'Patterns and sequences', icon: '🔢', color: '#1fbf9f', ixl: 'FF', sg: 'Phase D · Algebra', km: 'Algebra',
      tip: 'Arrange matchsticks into a triangle pattern and count the sticks needed for pattern 10.',
      skills: [
        { id: '8D1', name: 'nth term of an arithmetic sequence', gen() { const a = r(-10, 15), b = nz(-6, 8), n = r(8, 30), ans = a + (n - 1) * b; return num(`Sequence ${[0, 1, 2, 3].map((i) => N(a + i * b)).join(', ')}, ... What is term ${n}?`, ans, 'Arithmetic sequence: Uₙ = a + (n − 1)b, with first term a and common difference b.', [
          ['Find a and b', `a = ${N(a)}, b = ${N(a + b)} − ${P(a)} = ${N(b)}`], ['Substitution', `U${'<sub>' + n + '</sub>'} = ${N(a)} + ${n - 1} × ${P(b)} = <b>${N(ans)}</b>`]]); } },
        { id: '8D2', name: 'Geometric sequences', gen() { const a = nz(-4, 5), k = pick([2, 3, -2]), n = r(5, 7), ans = a * k ** (n - 1); return num(`Sequence ${[0, 1, 2, 3].map((i) => N(a * k ** i)).join(', ')}, ... What is term ${n}?`, ans, 'Geometric sequence: Uₙ = a × r^(n−1), with common ratio r.', [
          ['Find a and r', `a = ${N(a)}, r = ${N(a * k)} : ${P(a)} = ${N(k)}`], ['Substitution', `${N(a)} × ${P(k)}${sup(n - 1)} = ${N(a)} × ${N(k ** (n - 1))} = <b>${N(ans)}</b>`]]); } },
      ],
    },
    {
      id: '8E', grade: 8, name: 'Functions and slope', icon: '📈', color: '#e84393', ixl: 'Z–CC', sg: 'Phase D · Algebra', km: 'Algebra',
      tip: 'Slope is like the steepness of a ramp: how much it rises for each step to the right.',
      skills: [
        { id: '8E1', name: 'Function values', gen() { const a = nz(-5, 6), b = nz(-9, 9), x = nz(-6, 6), ans = a * x + b; return num(`f(x) = ${lin(a, b)}. What is f(${N(x)})?`, ans, 'f(a) means substitute x = a into the function\'s formula.', [
          ['Substitution', `f(${N(x)}) = ${N(a)} × ${P(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`], ['Calculate', `<b>${N(ans)}</b>`]]); } },
        { id: '8E2', name: 'Slope of a line through two points', gen() { const x1 = r(-6, 6), y1 = r(-6, 6), dx = nz(-6, 6), dy = nz(-8, 8); return num(`What is the slope of the line through ${pt(x1, y1)} and ${pt(x1 + dx, y1 + dy)}? (simplest fraction if needed)`, F(dy, dx), 'm = (y₂ − y₁) / (x₂ − x₁).', [
          ['Difference in y', `${N(y1 + dy)} − ${P(y1)} = ${N(dy)}`], ['Difference in x', `${N(x1 + dx)} − ${P(x1)} = ${N(dx)}`], ['Divide', `m = ${N(dy)}/${N(dx)} = <b>${F(dy, dx)}</b>`]]); } },
        { id: '8E3', name: 'Line equation y = mx + c', gen() { const m = nz(-5, 5), x1 = nz(-5, 5), c = r(-9, 9), y1 = m * x1 + c; return num(`A line with slope ${N(m)} passes through the point ${pt(x1, y1)}. Its equation is y = ${N(m)}x + c. What is c?`, c, 'Substitute the point into y = mx + c, then solve for c.', [
          ['Substitution', `${N(y1)} = ${N(m)} × ${P(x1)} + c = ${N(m * x1)} + c`], ['Solve', `c = ${N(y1)} − ${P(m * x1)} = <b>${N(c)}</b>`]]); } },
      ],
    },
    {
      id: '8F', grade: 8, name: 'Systems of linear equations in two variables', icon: '✖️', color: '#00b894', ixl: 'GG', sg: 'Phase D · Algebra', km: 'Algebra',
      tip: 'Prices of 2 pencils + 1 book and 1 pencil + 1 book: subtract to get the price of one pencil.',
      skills: [
        { id: '8F1', name: 'Elimination method', gen() { const x = nz(-6, 8), y = nz(-6, 8), a = nz(1, 4), b = nz(-4, 4), d = nz(-4, 4), c1 = a * x + b * y, c2 = a * x + d * y; if (b === d) return C.SKILLS['8F1'].gen(); return num(`${lin(a, 0)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${N(c1)}<br>${lin(a, 0)} ${d < 0 ? '−' : '+'} ${Math.abs(d) === 1 ? '' : Math.abs(d)}y = ${N(c2)}<br>What is y?`, y, 'Subtract the two equations to remove x (the x coefficients are equal).', [
          ['Subtract equation 1 − equation 2', `(${N(b)} − ${P(d)})y = ${N(c1)} − ${P(c2)} → ${N(b - d)}y = ${N(c1 - c2)}`], ['Divide', `y = ${N(c1 - c2)} : ${P(b - d)} = <b>${N(y)}</b>`]]); } },
        { id: '8F2', name: 'System of equations word problems', gen() { const p = pick([2000, 3000, 4000, 5000]), b = pick([6000, 8000, 10000, 12000]), n1 = r(2, 4), n2 = r(1, 3); const t1 = n1 * p + b, t2 = n2 * p + b; if (n1 === n2) return C.SKILLS['8F2'].gen(); const ask = pick(['pencils', 'books']); return num(`${n1} pencils and 1 book cost Rp${t1.toLocaleString('en-US')}. ${n2} pencils and 1 book cost Rp${t2.toLocaleString('en-US')}. How many rupiah is 1 ${ask}? (number only)`, ask === 'pencils' ? p : b, 'Let the pencil price be p and the book price be b, then eliminate b.', [
          ['Write the equation', `${n1}p + b = ${t1.toLocaleString('en-US')} and ${n2}p + b = ${t2.toLocaleString('en-US')}`], ['Subtract', `${n1 - n2}p = ${(t1 - t2).toLocaleString('en-US')} → p = ${p.toLocaleString('en-US')}`], ask === 'pencils' ? ['Answer', `<b>${p.toLocaleString('en-US')}</b>`] : ['Substitution', `b = ${t1.toLocaleString('en-US')} − ${n1} × ${p.toLocaleString('en-US')} = <b>${b.toLocaleString('en-US')}</b>`]], { unit: 'Rp' }); } },
      ],
    },
    {
      id: '8G', grade: 8, name: 'Geometric transformations', icon: '🔄', color: '#fdcb6e', ixl: 'R–S', sg: 'Phase D · Geometry', km: 'Geometry',
      tip: 'A mirror shows reflection; a flashlight moved toward a wall shows dilation.',
      skills: [
        { id: '8G1', name: 'Translation', gen() { const x = r(-6, 6), y = r(-6, 6), a = nz(-5, 5), b = nz(-5, 5), ans = pt(x + a, y + b); return pil(`Point ${pt(x, y)} is shifted ${Math.abs(a)} units ${a > 0 ? 'right' : 'left'} and ${Math.abs(b)} units ${b > 0 ? 'top' : 'bottom'}. Where is its image?`, opt(ans, [pt(x - a, y + b), pt(x + a, y - b), pt(x + b, y + a), pt(x - a, y - b)]), ans, 'Translation (a, b): (x, y) → (x + a, y + b).', [
          ['Shift x', `${N(x)} + ${P(a)} = ${N(x + a)}`], ['Shift y', `${N(y)} + ${P(b)} = ${N(y + b)}`], ['Image', `<b>${ans}</b>`]]); } },
        { id: '8G2', name: 'Reflection', gen() { const x = nz(-7, 7), y = nz(-7, 7); const [nm, X, Y] = pick([['the x-axis', x, -y], ['the y-axis', -x, y], ['the origin O', -x, -y], ['the line y = x', y, x]]); const ans = pt(X, Y); return pil(`Point ${pt(x, y)} is reflected across ${nm}. Where is its image?`, opt(ans, [pt(x, -y), pt(-x, y), pt(-x, -y), pt(y, x), pt(-y, -x)]), ans, 'x-axis: (x, −y). y-axis: (−x, y). Origin: (−x, −y). Line y = x: (y, x).', [
          ['Use the reflection rule across ' + nm, `${pt(x, y)} → <b>${ans}</b>`]]); } },
        { id: '8G3', name: 'Dilation', gen() { const k = pick([2, 3, -2, 0.5]), x = nz(-6, 6) * (k === 0.5 ? 2 : 1), y = nz(-6, 6) * (k === 0.5 ? 2 : 1), ans = pt(k * x, k * y); return pil(`Point ${pt(x, y)} is dilated with center O and scale factor ${N(k)}. Where is its image?`, opt(ans, [pt(x + k, y + k), pt(k * x, y), pt(x, k * y), pt(-k * x, -k * y)]), ans, 'Dilation about O with factor k: (x, y) → (kx, ky).', [
          ['Multiply each coordinate by ' + N(k), `(${N(k)} × ${P(x)}, ${N(k)} × ${P(y)})`], ['Image', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: '8H', grade: 8, name: 'Curved solids', icon: '🥫', color: '#00a8cc', ixl: 'W', sg: 'Phase D · Measurement', km: 'Measurement',
      tip: 'A milk can is a cylinder, an ice cream cone is a cone, and a soccer ball is a sphere.',
      skills: [
        { id: '8H1', name: 'Volume of a cylinder', gen() { const rr = pick([7, 14]), t = r(2, 20); return num(`A cylinder has radius ${rr} cm and height ${t} cm. What is its volume in cm³? (π = 22/7)`, (22 * rr * rr * t) / 7, 'Volume of a cylinder = πr²h.', [
          ['Base area', `22/7 × ${rr}² = ${(22 * rr * rr) / 7} cm²`], ['Multiply by the height', `${(22 * rr * rr) / 7} × ${t} = <b>${N((22 * rr * rr * t) / 7)}</b> cm³`]], { unit: 'cm³' }); } },
        { id: '8H2', name: 'Volume of a cone', gen() { const rr = pick([7, 14]), t = pick([3, 6, 9, 12, 15]); return num(`A cone has radius ${rr} cm and height ${t} cm. What is its volume in cm³? (π = 22/7)`, (22 * rr * rr * t) / 21, 'Volume of a cone = ⅓πr²h.', [
          ['Calculate πr²h', `22/7 × ${rr}² × ${t} = ${(22 * rr * rr * t) / 7}`], ['Divide by 3', `${(22 * rr * rr * t) / 7} ÷ 3 = <b>${N((22 * rr * rr * t) / 21)}</b> cm³`]], { unit: 'cm³' }); } },
        { id: '8H3', name: 'Volume of a sphere', gen() { const rr = pick([3, 6, 9]); return num(`A sphere has radius ${rr} cm. Its volume is kπ cm³. What is k?`, (4 * rr ** 3) / 3, 'Volume of a sphere = 4/3 πr³.', [
          ['Calculate r³', `${rr}³ = ${rr ** 3}`], ['Multiply by 4/3', `4/3 × ${rr ** 3} = <b>${N((4 * rr ** 3) / 3)}</b>, so its volume is ${N((4 * rr ** 3) / 3)}π cm³`]]); } },
      ],
    },
    {
      id: '8I', grade: 8, name: 'Statistics and probability', icon: '📊', color: '#9b6dff', ixl: 'HH–KK', sg: 'Phase D · Data Analysis and Probability', km: 'Data Analysis and Probability',
      tip: 'Toss two coins 20 times and record the results; compare with the theoretical probability.',
      skills: [
        { id: '8I1', name: 'Range and quartiles', gen() { const xs = Array.from({ length: 7 }, () => r(10, 60)); const s = [...xs].sort((a, b) => a - b); const kind = pick(['range', 'Q1', 'Q3']); const ans = kind === 'range' ? s[6] - s[0] : kind === 'Q1' ? s[1] : s[5]; return num(`Data: ${xs.join(', ')}. What is the ${kind === 'range' ? 'the range' : 'quartile ' + (kind === 'Q1' ? 'lower (Q1)' : 'upper (Q3)')}?`, ans, 'Range = largest − smallest. For 7 ordered data points, Q1 = point 2, median = point 4, Q3 = point 6.', [
          ['Sort', s.join(', ')], ['Answer', kind === 'range' ? `${s[6]} − ${s[0]} = <b>${ans}</b>` : `${kind} = data point ${kind === 'Q1' ? 2 : 6} = <b>${ans}</b>`]]); } },
        { id: '8I2', name: 'Combined average', gen() { const n1 = r(10, 30), n2 = r(10, 30), m1 = r(60, 90), m2 = r(60, 90), tot = n1 * m1 + n2 * m2; if (tot % (n1 + n2)) return C.SKILLS['8I2'].gen(); return num(`The average score of ${n1} students in class A is ${m1}, and the average of ${n2} students in class B is ${m2}. What is the combined average?`, tot / (n1 + n2), 'Combined average = (total of A + total of B) ÷ total number of students.', [
          ['Total scores', `${n1} × ${m1} + ${n2} × ${m2} = ${n1 * m1} + ${n2 * m2} = ${tot}`], ['Divide by the number of students', `${tot} : ${n1 + n2} = <b>${N(tot / (n1 + n2))}</b>`]]); } },
        { id: '8I3', name: 'Probability of compound events', gen() { const k = pick(['dadu', 'koin']); if (k === 'koin') { const n = pick([2, 3]); const h = r(0, n); const ways = C.kit.nCr(n, h), tot = 2 ** n; return num(`${n} coins are tossed together. What's the probability of getting exactly ${h} tails? (simplest fraction)`, F(ways, tot), 'Probability = number of desired outcomes ÷ size of the sample space.', [
          ['Sample space', `2${sup(n)} = ${tot} outcomes`], ['Desired outcomes', `Choosing ${h} tails from ${n} coins: ${ways} ways`], ['Probability', `${ways}/${tot} = <b>${F(ways, tot)}</b>`]]); }
          const s = r(3, 11); const ways = 6 - Math.abs(7 - s); return num(`Two dice are rolled. What's the probability the sum is ${s}? (simplest fraction)`, F(ways, 36), 'Two dice have 6 × 6 = 36 equally likely outcomes.', [
          ['List of pairs', Array.from({ length: 6 }, (_, i) => i + 1).filter((a) => s - a >= 1 && s - a <= 6).map((a) => `(${a}, ${s - a})`).join(', ')], ['Calculate', `${ways} pairs out of 36 → <b>${F(ways, 36)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: 8, name: 'Grade 8', short: '8', stage: 'SMP', ixl: 'https://www.ixl.com/math/grade-8', sg: 'Kurikulum Merdeka Phase D (middle school)' });

  lesson('8A', 'Properties of exponents make it easy to multiply powers.', [
    ['Properties of exponents', ['aᵐ × aⁿ = aᵐ⁺ⁿ', 'aᵐ : aⁿ = aᵐ⁻ⁿ', 'a⁰ = 1 and a⁻ⁿ = 1/aⁿ'], '8A1'],
    ['Scientific notation', ['Write as a × 10ⁿ with 1 ≤ a < 10.', 'n = the number of places the point moves.'], '8A3'],
  ]);
  lesson('8B', 'Real numbers consist of rational and irrational numbers.', [
    ['Radicals', ['Find the largest square factor: √72 = √36 × √2 = 6√2.'], '8B2'],
    ['Irrational', ['√2, √3, π: their decimals neither end nor repeat.'], '8B3'],
  ]);
  lesson('8C', 'Pythagorean theorem: in a right triangle, c² = a² + b².', [
    ['Hypotenuse', ['Square both legs, add, then take the root.'], '8C1'],
    ['Legs', ['Subtract the square of the known leg from the square of the hypotenuse.'], '8C2'],
  ]);
  lesson('8D', 'Arithmetic sequences add a fixed difference; geometric sequences multiply by a fixed ratio.', [
    ['Arithmetic', ['Uₙ = a + (n − 1)b'], '8D1'], ['Geometry', ['Uₙ = a × rⁿ⁻¹'], '8D2'],
  ]);
  lesson('8E', 'Linear functions have the form f(x) = mx + c; m is the slope and c is the y-intercept.', [
    ['Slope', ['m = (y₂ − y₁)/(x₂ − x₁).', 'Positive slope: the line rises; negative: the line falls.'], '8E2'],
    ['Line equation', ['Substitute a point into y = mx + c to find c.'], '8E3'],
  ]);
  lesson('8F', 'Systems of two linear equations are solved by elimination or substitution.', [
    ['Elimination', ['Make the coefficients of one variable equal.', 'Add or subtract the equations.', 'Substitute to find the other variable.'], '8F1'],
  ]);
  lesson('8G', 'Transformations move or resize shapes on the coordinate plane.', [
    ['Translation and reflection', ['Translation (a, b): (x + a, y + b).', 'Reflection across the x-axis: (x, −y); y-axis: (−x, y).'], '8G2'],
    ['Dilation', ['Center O, factor k: (kx, ky).'], '8G3'],
  ]);
  lesson('8H', 'Cylinders, cones, and spheres are curved solids.', [
    ['Volume formulas', ['Cylinder: πr²h.', 'Cone: ⅓πr²h.', 'Sphere: 4/3 πr³.'], '8H1'],
  ]);
  lesson('8I', 'Measures of spread show how spread out data is.', [
    ['Range and quartiles', ['Range = maximum − minimum.', 'Quartiles divide ordered data into four equal parts.'], '8I1'],
    ['Compound probability', ['List all outcomes (the sample space), then count the desired ones.'], '8I3'],
  ]);
})();
