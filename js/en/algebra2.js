/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Aljabar 2 (SMA, Fase F). Cakupan mengikuti IXL Algebra 2:
 * bilangan kompleks, polinomial lanjut, fungsi invers dan komposisi, eksponen dan logaritma,
 * barisan dan deret, trigonometri lingkaran satuan, irisan kerucut, kombinatorika.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, poly, lin, num, pil, opt, lesson, fact, nCr, FR, CX } = C.kit;
  const G = 11;
  const cx = (a, b) => (b === 0 ? N(a) : `${a ? N(a) + ' ' + (b < 0 ? '−' : '+') + ' ' : b < 0 ? '−' : ''}${Math.abs(b) === 1 ? '' : Math.abs(b)}i`);

  const UNITS = [
    {
      id: 'A2A', grade: G, name: 'Complex numbers', icon: '𝑖', color: '#4d96ff', ixl: 'K', sg: 'Phase F · Numbers', km: 'Numbers',
      tip: 'i is the number whose square is −1; powers of i repeat every 4: i, −1, −i, 1.',
      skills: [
        { id: 'A2A1', name: 'Powers of i', gen() { const n = r(5, 60), m = n % 4, ans = ['1', 'i', '−1', '−i'][m]; return pil(`i${sup(n)} = ?`, ['1', 'i', '−1', '−i'], ans, 'Powers of i repeat every 4: i¹ = i, i² = −1, i³ = −i, i⁴ = 1.', [
          ['Divide the exponent by 4', `${n} = 4 × ${Math.floor(n / 4)} + ${m}`], ['Use the remainder', `i${sup(n)} = i${sup(m)} = <b>${ans}</b>`]]); } },
        { id: 'A2A2', name: 'Multiplying complex numbers', gen() { const a = nz(-6, 6), b = nz(-6, 6), c = nz(-6, 6), d = nz(-6, 6), re = a * c - b * d, im = a * d + b * c; return num(`(${cx(a, b)})(${cx(c, d)}) = p + qi. What is p?`, re, 'Multiply like binomials, then replace i² with −1.', [
          ['Multiply', `${N(a * c)} + ${P(a * d)}i + ${P(b * c)}i + ${P(b * d)}i²`], ['Replace i² = −1', `${N(a * c)} − ${P(b * d)} + ${P(im)}i`], ['Real part', `p = <b>${N(re)}</b>`]]); } },
        { id: 'A2A3', name: 'Modulus of a complex number', gen() { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]); const sa = pick([1, -1]), sb = pick([1, -1]); return num(`What is |${cx(sa * a, sb * b)}|?`, c, '|a + bi| = √(a² + b²).', [
          ['Square', `${a}² + ${b}² = ${a * a + b * b}`], ['Root', `√${c * c} = <b>${c}</b>`]]); } },
      ],
    },
    {
      id: 'A2B', grade: G, name: 'Advanced polynomials', icon: '🧮', color: '#ff7a59', ixl: 'L–M, Q', sg: 'Phase F · Algebra and Functions', km: 'Algebra',
      tip: 'Remainder theorem: the remainder of f(x) divided by (x − a) equals f(a), with no long division needed.',
      skills: [
        { id: 'A2B1', name: 'Remainder theorem', gen() { const cs = [nz(-3, 3), r(-6, 6), r(-6, 6), r(-9, 9)], a = nz(-3, 3), val = cs.reduce((s, c) => s * a + c, 0); return num(`What is the remainder when f(x) = ${poly(cs)} is divided by (${lin(1, -a)})?`, val, 'The remainder of f(x) divided by (x − a) is f(a).', [
          ['Find a', `x ${a < 0 ? '+' : '−'} ${Math.abs(a)} = 0 → x = ${N(a)}`], ['Calculate f(' + N(a) + ')', `${cs.map((c, i) => `${P(c)} × ${P(a)}${sup(3 - i)}`).join(' + ')} = <b>${N(val)}</b>`]]); } },
        { id: 'A2B2', name: 'Polynomial factors', gen() { const p = nz(-4, 4), q = nz(-4, 4), s = nz(-4, 4); const cs = [1, -(p + q + s), p * q + p * s + q * s, -p * q * s]; const ans = `(${lin(1, -p)})`; return pil(`Which is a factor of ${poly(cs)}?`, opt(ans, [`(${lin(1, p)})`, `(${lin(1, p + 1)})`, `(${lin(1, -p - 1)})`, `(${lin(1, p * q)})`].filter((x) => ![p, q, s].some((t) => x === `(${lin(1, -t)})`))), ans, 'Factor theorem: (x − a) is a factor of f(x) if f(a) = 0.', [
          ['Test x = ' + N(p), `f(${N(p)}) = 0`], ['Conclude', `<b>${ans}</b> is a factor.`]]); } },
        { id: 'A2B3', name: 'Roots of polynomials', gen() { const p = nz(-4, 4), q = nz(-4, 4), s = nz(-4, 4); if (new Set([p, q, s]).size < 3) return C.SKILLS.A2B3.gen(); const cs = [1, -(p + q + s), p * q + p * s + q * s, -p * q * s]; return num(`What is the sum of all roots of ${poly(cs)} = 0?`, p + q + s, 'For ax³ + bx² + cx + d = 0, the sum of the roots = −b/a.', [
          ['Identify a and b', `a = 1, b = ${N(cs[1])}`], ['Sum of roots', `−b/a = <b>${N(p + q + s)}</b>`]]); } },
      ],
    },
    {
      id: 'A2C', grade: G, name: 'Composition and inverse functions', icon: '🔁', color: '#1fbf9f', ixl: 'U–V', sg: 'Phase F · Algebra and Functions', km: 'Algebra',
      tip: 'An inverse function "undoes" the original: if f changes 3 to 7, f⁻¹ changes 7 back to 3.',
      skills: [
        { id: 'A2C1', name: 'Function composition', gen() { const a = nz(-4, 4), b = r(-6, 6), c = nz(-3, 3), d = r(-5, 5), x = r(-4, 4), gx = c * x + d, ans = a * gx + b; return num(`f(x) = ${lin(a, b)} and g(x) = ${lin(c, d)}. What is (f ∘ g)(${N(x)})?`, ans, '(f ∘ g)(x) = f(g(x)): calculate g first, then put the result into f.', [
          ['Calculate g(' + N(x) + ')', `${N(c)} × ${P(x)} + ${P(d)} = ${N(gx)}`], ['Calculate f(' + N(gx) + ')', `${N(a)} × ${P(gx)} + ${P(b)} = <b>${N(ans)}</b>`]]); } },
        { id: 'A2C2', name: 'Inverse function values', gen() { const a = nz(-5, 5), b = r(-9, 9), x = r(-6, 6), y = a * x + b; return num(`f(x) = ${lin(a, b)}. What is f${sup('−1')}(${N(y)})?`, x, 'f⁻¹(y) is the value of x satisfying f(x) = y.', [
          ['Write the equation', `${lin(a, b)} = ${N(y)}`], ['Solve for x', `x = (${N(y)} − ${P(b)}) : ${P(a)} = <b>${N(x)}</b>`]]); } },
        { id: 'A2C3', name: 'Domain of rational functions', gen() { const a = nz(-9, 9), k = nz(-5, 5), b = r(-9, 9); return num(`f(x) = ${FR(lin(k, b), lin(1, -a))}. For what x is f undefined?`, a, 'A fraction is undefined when its denominator is zero.', [
          ['Denominator = 0', `${lin(1, -a)} = 0`], ['Solve', `x = <b>${N(a)}</b>`]]); } },
      ],
    },
    {
      id: 'A2D', grade: G, name: 'Exponents and logarithms', icon: '㏒', color: '#e84393', ixl: 'Z–CC', sg: 'Phase F · Algebra and Functions', km: 'Algebra',
      tip: 'The Richter scale and pH use logarithms: going up by 1 means 10 times as much.',
      skills: [
        { id: 'A2D1', name: 'Evaluating logarithms', gen() { const b = pick([2, 3, 4, 5, 10]), k = r(-2, 5); const v = b ** k; const vs = k < 0 ? `1/${b ** -k}` : String(v); return num(`${b === 10 ? 'log' : `<sup>${b}</sup>log`} ${vs} = ?`, k, 'ᵇlog a = c means bᶜ = a.', [
          ['Write as a power', `${b}${sup('c')} = ${vs}`], ['Find c', `${b}${sup(k)} = ${vs}, so c = <b>${N(k)}</b>`]]); } },
        { id: 'A2D2', name: 'Properties of logarithms', gen() { const b = pick([2, 3, 10]), x = r(1, 3), y = r(1, 3), kind = pick(['add', 'subtract']); const A = b ** (kind === 'add' ? x : x + y), B = b ** y, ans = kind === 'add' ? x + y : x; const L = b === 10 ? 'log' : `<sup>${b}</sup>log`; return num(`${L} ${A} ${kind === 'add' ? '+' : '−'} ${L} ${B} = ?`, ans, kind === 'add' ? 'log a + log b = log (a × b).' : 'log a − log b = log (a ÷ b).', [
          ['Combine', `${L} (${A} ${kind === 'add' ? '×' : ':'} ${B}) = ${L} ${kind === 'add' ? A * B : A / B}`], ['Calculate', `<b>${ans}</b>`]]); } },
        { id: 'A2D3', name: 'Exponential equations', gen() { const b = pick([2, 3, 5]), k = r(2, 6), a = nz(-3, 3), c = r(-4, 4), x = (k - c) / a; if (!Number.isInteger(x)) return C.SKILLS.A2D3.gen(); return num(`${b}${sup(lin(a, c))} = ${b ** k}. What is x?`, x, 'Make the bases equal, then set the exponents equal.', [
          ['Write the right side with base ' + b, `${b ** k} = ${b}${sup(k)}`], ['Set the exponents equal', `${lin(a, c)} = ${k}`], ['Solve', `x = <b>${N(x)}</b>`]]); } },
      ],
    },
    {
      id: 'A2E', grade: G, name: 'Sequences and series', icon: '∑', color: '#00b894', ixl: 'Sequences, series', sg: 'Phase F · Algebra and Functions', km: 'Algebra',
      tip: 'Saving Rp5,000 and then adding Rp1,000 every week forms an arithmetic series.',
      skills: [
        { id: 'A2E1', name: 'Sum of an arithmetic series', gen() { const a = r(-5, 12), b = nz(-3, 6), n = r(6, 20), un = a + (n - 1) * b, s = (n * (a + un)) / 2; return num(`What is the sum of the first ${n} terms of the series ${[0, 1, 2].map((i) => N(a + i * b)).join(' + ')} + ...?`, s, 'Sₙ = n/2 × (a + Uₙ), with Uₙ = a + (n − 1)b.', [
          ['Term' + n, `U${'<sub>' + n + '</sub>'} = ${N(a)} + ${n - 1} × ${P(b)} = ${N(un)}`], ['Sum', `${n}/2 × (${N(a)} + ${P(un)}) = <b>${N(s)}</b>`]]); } },
        { id: 'A2E2', name: 'Sum of a geometric series', gen() { const a = r(1, 5), k = pick([2, 3]), n = r(3, 7), s = (a * (k ** n - 1)) / (k - 1); return num(`What is the sum of the first ${n} terms of the series ${[0, 1, 2].map((i) => a * k ** i).join(' + ')} + ...?`, s, 'Sₙ = a(rⁿ − 1)/(r − 1) for r > 1.', [
          ['a and r', `a = ${a}, r = ${k}`], ['Substitution', `${a}(${k}${sup(n)} − 1)/(${k} − 1) = ${a} × ${k ** n - 1} / ${k - 1} = <b>${s}</b>`]]); } },
        { id: 'A2E3', name: 'Infinite geometric series', gen() { const a = r(1, 12), [p, q] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5]]); return num(`What is the sum of the infinite series ${a} + ${FH(a * p, q)} + ${FH(a * p * p, q * q)} + ...? (simplest fraction if needed)`, F(a * q, q - p), 'If |r| < 1, S∞ = a/(1 − r).', [
          ['Common ratio', `r = ${p}/${q}`], ['Substitution', `${a} / (1 − ${p}/${q}) = ${a} / (${q - p}/${q}) = <b>${F(a * q, q - p)}</b>`]]); } },
      ],
    },
    {
      id: 'A2F', grade: G, name: 'Unit circle trigonometry', icon: '🔄', color: '#fdcb6e', ixl: 'II–JJ', sg: 'Phase F · Geometry', km: 'Geometry',
      tip: 'Quadrant I all positive, II only sin, III only tan, IV only cos ("All Students Take Calculus").',
      skills: [
        { id: 'A2F1', name: 'Degrees and radians', gen() { const [d, rad] = pick([[30, 'π/6'], [45, 'π/4'], [60, 'π/3'], [90, 'π/2'], [120, '2π/3'], [135, '3π/4'], [150, '5π/6'], [180, 'π'], [210, '7π/6'], [270, '3π/2'], [300, '5π/3'], [360, '2π']]); return pil(`${d}° = ... radians`, opt(rad, ['π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '3π/2', '2π']), rad, '180° = π radians, so multiply degrees by π/180.', [
          ['Multiply', `${d} × π/180 = ${F(d, 180)}π`], ['Simplify', `<b>${rad}</b>`]]); } },
        { id: 'A2F2', name: 'Sin and cos of special angles', gen() { const T = { 0: ['0', '1'], 30: ['1/2', '½√3'], 45: ['½√2', '½√2'], 60: ['½√3', '1/2'], 90: ['1', '0'], 120: ['½√3', '−1/2'], 135: ['½√2', '−½√2'], 150: ['1/2', '−½√3'], 180: ['0', '−1'], 210: ['−1/2', '−½√3'], 240: ['−½√3', '−1/2'], 270: ['−1', '0'], 300: ['−½√3', '1/2'], 330: ['−1/2', '½√3'] }; const d = +pick(Object.keys(T)), f = pick(['sin', 'cos']), ans = T[d][f === 'sin' ? 0 : 1]; return pil(`${f} ${d}° = ?`, opt(ans, ['0', '1', '−1', '1/2', '−1/2', '½√2', '−½√2', '½√3', '−½√3']), ans, 'Use the reference angle in quadrant I, then set the sign by quadrant.', [
          ['Reference angle', `${d % 90 === 0 ? 'Angle on an axis' : `reference ${d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d}°`}`], ['Sign', `Quadrant ${d <= 90 ? 'I' : d <= 180 ? 'II' : d <= 270 ? 'III' : 'IV'}`], ['Answer', `<b>${ans}</b>`]]); } },
        { id: 'A2F3', name: 'Signs of trigonometric functions by quadrant', gen() { const d = pick([100, 135, 160, 200, 225, 250, 290, 315, 340, 20, 70]), f = pick(['sin', 'cos', 'tan']); const q = d < 90 ? 1 : d < 180 ? 2 : d < 270 ? 3 : 4; const pos = q === 1 || (q === 2 && f === 'sin') || (q === 3 && f === 'tan') || (q === 4 && f === 'cos'); return pil(`Is ${f} ${d}° positive or negative?`, ['positive', 'negative'], pos ? 'positive' : 'negative', 'Quadrant I: all positive. II: sin positive. III: tan positive. IV: cos positive.', [
          ['Quadrant', `${d}° is in quadrant ${['I', 'II', 'III', 'IV'][q - 1]}`], ['Answer', `<b>${pos ? 'positive' : 'negative'}</b>`]]); } },
      ],
    },
    {
      id: 'A2G', grade: G, name: 'Conic sections', icon: '🥚', color: '#00a8cc', ixl: 'DD–GG', sg: 'Phase F · Geometry', km: 'Geometry',
      tip: 'Planet orbits are ellipses; satellite dishes are parabolas.',
      skills: [
        { id: 'A2G1', name: 'Center and radius from the general form', gen() { const a = r(-6, 6), b = r(-6, 6), rr = r(1, 8), D = -2 * a, E = -2 * b, Fc = a * a + b * b - rr * rr; return num(`x² + y² ${D < 0 ? '−' : '+'} ${Math.abs(D)}x ${E < 0 ? '−' : '+'} ${Math.abs(E)}y ${Fc < 0 ? '−' : '+'} ${Math.abs(Fc)} = 0. What is the radius of this circle?`, rr, 'Complete the square: center (−D/2, −E/2), r = √(a² + b² − F).', [
          ['Center', `(${N(a)}, ${N(b)})`], ['Radius', `√(${a * a} + ${b * b} − ${P(Fc)}) = √${rr * rr} = <b>${rr}</b>`]]); } },
        { id: 'A2G2', name: 'Axes of an ellipse', gen() { const a = r(3, 9), b = r(2, a - 1), ask = pick(['major', 'minor']); return num(`Ellipse x²/${a * a} + y²/${b * b} = 1. What is the length of the ${ask} axis?`, ask === 'major' ? 2 * a : 2 * b, 'Ellipse x²/a² + y²/b² = 1 (a > b): major axis 2a, minor axis 2b.', [
          ['a and b', `a = √${a * a} = ${a}, b = √${b * b} = ${b}`], ['Axis length', `2 × ${ask === 'major' ? a : b} = <b>${ask === 'major' ? 2 * a : 2 * b}</b>`]]); } },
      ],
    },
    {
      id: 'A2H', grade: G, name: 'Counting principles', icon: '🔢', color: '#9b6dff', ixl: 'Counting', sg: 'Phase F · Data Analysis and Probability', km: 'Data Analysis and Probability',
      tip: 'How many ways can a chair, secretary, and treasurer be chosen from 10 students? Order matters → permutation.',
      skills: [
        { id: 'A2H1', name: 'Factorials', gen() { const n = r(3, 8), k = r(1, Math.min(3, n - 1)); return num(`${n}! : ${n - k}! = ?`, fact(n) / fact(n - k), 'n! = n × (n − 1) × ... × 1. Factorials in a division can be crossed out.', [
          ['Write ' + n + '! until you reach ' + (n - k) + '!', `${FR(`${Array.from({ length: k }, (_, i) => n - i).join(' × ')} × ${n - k}!`, `${n - k}!`)}`],
          [`Cross out ${n - k}! on top and bottom`, `${FR(`${Array.from({ length: k }, (_, i) => n - i).join(' × ')} × ${CX(`${n - k}!`)}`, CX(`${n - k}!`))} = ${Array.from({ length: k }, (_, i) => n - i).join(' × ')}`], ['Calculate', `<b>${fact(n) / fact(n - k)}</b>`]]); } },
        { id: 'A2H2', name: 'Permutations', gen() { const n = r(5, 10), k = r(2, 3); return num(`From ${n} students, ${k === 2 ? 'a chair and vice chair' : 'a chair, secretary, and treasurer'} will be chosen. How many ways?`, fact(n) / fact(n - k), 'Order (position) matters → permutation P(n, k) = n!/(n − k)!.', [
          ['Identify the permutation', `n = ${n}, k = ${k}`],
          ['Write the formula', `P = ${FR(`${n}!`, `${n - k}!`)} = ${FR(`${Array.from({ length: k }, (_, i) => n - i).join(' × ')} × ${n - k}!`, `${n - k}!`)}`],
          [`Cross out ${n - k}! on top and bottom`, FR(`${Array.from({ length: k }, (_, i) => n - i).join(' × ')} × ${CX(`${n - k}!`)}`, CX(`${n - k}!`))],
          ['Calculate', `${Array.from({ length: k }, (_, i) => n - i).join(' × ')} = <b>${fact(n) / fact(n - k)}</b>`]]); } },
        { id: 'A2H3', name: 'Combinations', gen() { const n = r(5, 12), k = r(2, 4); return num(`From ${n} players, ${k} will be chosen for a team (no positions). How many ways?`, nCr(n, k), 'Order doesn\'t matter → combination C(n, k) = n!/(k!(n − k)!).', [
          ['Write the formula', `C = ${FR(`${n}!`, `${k}! × ${n - k}!`)} = ${FR(`${Array.from({ length: k }, (_, i) => n - i).join(' × ')} × ${n - k}!`, `${k}! × ${n - k}!`)}`],
          [`Cross out ${n - k}! on top and bottom`, FR(`${Array.from({ length: k }, (_, i) => n - i).join(' × ')} × ${CX(`${n - k}!`)}`, `${k}! × ${CX(`${n - k}!`)}`)],
          ['Divide by k!', `${fact(n) / fact(n - k)} : ${fact(k)} = <b>${nCr(n, k)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: G, name: 'Algebra 2', short: 'A2', stage: 'SMA', ixl: 'https://www.ixl.com/math/algebra-2', sg: 'Kurikulum Merdeka Phase F (grade 11)' });

  lesson('A2A', 'Complex numbers have the form a + bi with i² = −1.', [['Operations', ['Add the real and imaginary parts separately.', 'Multiply like binomials, replacing i² = −1.'], 'A2A2']]);
  lesson('A2B', 'The remainder and factor theorems speed up polynomial division.', [['Remainder theorem', ['Remainder of f(x) ÷ (x − a) = f(a).'], 'A2B1'], ['Factor theorem', ['f(a) = 0 ⇔ (x − a) is a factor of f(x).'], 'A2B2']]);
  lesson('A2C', 'Functions can be combined (composition) or reversed (inverse).', [['Composition', ['(f ∘ g)(x) = f(g(x)): work from the inside out.'], 'A2C1'], ['Inverse', ['Swap x and y, then solve for y.'], 'A2C2']]);
  lesson('A2D', 'A logarithm is the inverse of an exponent.', [['Definition', ['ᵇlog a = c ⇔ bᶜ = a.'], 'A2D1'], ['Properties', ['log ab = log a + log b', 'log a/b = log a − log b', 'log aⁿ = n log a'], 'A2D2']]);
  lesson('A2E', 'A series is the sum of the terms of a sequence.', [['Formulas', ['Arithmetic: Sₙ = n/2 (a + Uₙ).', 'Geometric: Sₙ = a(rⁿ − 1)/(r − 1).', 'Infinite: S∞ = a/(1 − r), |r| < 1.'], 'A2E1']]);
  lesson('A2F', 'The unit circle extends trigonometry to all angles.', [['Radians', ['180° = π rad.'], 'A2F1'], ['Quadrant', ['Find the reference angle, then the sign by quadrant.'], 'A2F2']]);
  lesson('A2G', 'Conic sections: circle, ellipse, parabola, hyperbola.', [['Circles', ['x² + y² + Dx + Ey + F = 0: center (−D/2, −E/2).'], 'A2G1'], ['Ellipses', ['x²/a² + y²/b² = 1: major axis 2a, minor 2b.'], 'A2G2']]);
  lesson('A2H', 'Counting principles count arrangements without listing them all.', [['Permutations and combinations', ['Order matters: P(n, k) = n!/(n − k)!.', 'Order doesn\'t matter: C(n, k) = n!/(k!(n − k)!).'], 'A2H3']]);
})();
