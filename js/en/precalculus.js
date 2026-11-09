/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Prakalkulus (SMA, Fase F / Matematika Tingkat Lanjut). Cakupan mengikuti IXL Precalculus:
 * fungsi dan transformasi, fungsi rasional dan asimtot, eksponen dan logaritma lanjut, identitas trigonometri,
 * matriks, vektor, notasi sigma, dan pengantar limit.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, poly, lin, num, pil, opt, lesson, LIM, FR, CX } = C.kit;
  const G = 12;
  const mat = (m) => `<span class="mmat">${m.map((row) => `<span>${row.map(N).join('</span><span>')}</span>`).join('<br>')}</span>`;
  const vec = (a, b, c) => `(${[a, b, c].filter((x) => x !== undefined).map(N).join(', ')})`;

  const UNITS = [
    {
      id: 'PKA', grade: G, name: 'Functions and transformations', icon: '↔️', color: '#4d96ff', ixl: 'A–C', sg: 'Phase F · Algebra and Functions', km: 'Algebra',
      tip: 'f(x) + k shifts the graph up; f(x − h) shifts it right.',
      skills: [
        { id: 'PKA1', name: 'Shifting graphs', gen() { const h = nz(-6, 6), k = nz(-6, 6); const ans = `${Math.abs(h)} ${h > 0 ? 'right' : 'left'}, ${Math.abs(k)} ${k > 0 ? 'top' : 'bottom'}`; const w = (hh, kk) => `${Math.abs(hh)} ${hh > 0 ? 'right' : 'left'}, ${Math.abs(kk)} ${kk > 0 ? 'top' : 'bottom'}`; return pil(`The graph of y = (x ${h > 0 ? '−' : '+'} ${Math.abs(h)})² ${k > 0 ? '+' : '−'} ${Math.abs(k)} comes from y = x² by shifting ...`, opt(ans, [w(-h, k), w(h, -k), w(-h, -k)]), ans, 'y = f(x − h) + k: shift h right (h > 0) and k up (k > 0).', [
          ['The form inside the parentheses', `x ${h > 0 ? '−' : '+'} ${Math.abs(h)} → h = ${N(h)} → ${Math.abs(h)} ${h > 0 ? 'right' : 'left'}`], ['The constant outside', `${k > 0 ? '+' : '−'}${Math.abs(k)} → ${Math.abs(k)} ${k > 0 ? 'top' : 'bottom'}`]]); } },
        { id: 'PKA2', name: 'Even and odd functions', gen() { const [f, ans] = pick([[poly([1, 0, 0, 0]), 'odd'], [poly([1, 0, 0]), 'even'], [poly([1, 0, -3, 0]), 'odd'], [poly([2, 0, 5]), 'even'], [poly([1, 1, 0]), 'neither'], [poly([1, 0, 0, 1]), 'neither'], ['cos x', 'even'], ['sin x', 'odd'], ['|x|', 'even'], [poly([1, 0, 0, 0, -2, 0]), 'odd']]); return pil(`f(x) = ${f}. This function is ...`, ['even', 'odd', 'neither'], ans, 'Even: f(−x) = f(x), symmetric about the y-axis. Odd: f(−x) = −f(x), symmetric about the origin.', [
          ['Calculate f(−x)', 'Replace x with −x and compare.'], ['Conclude', `<b>${ans}</b>`]]); } },
        { id: 'PKA3', name: 'Composition of quadratic functions', gen() { const a = nz(-3, 3), b = r(-4, 4), x = r(-3, 3), g = x * x + b, ans = a * g; return num(`f(x) = ${lin(a, 0)} and g(x) = ${poly([1, 0, b])}. What is f(g(${N(x)}))?`, ans, 'Work from the inside out.', [
          ['g(' + N(x) + ')', `${P(x)}² + ${P(b)} = ${N(g)}`], ['f(' + N(g) + ')', `${N(a)} × ${P(g)} = <b>${N(ans)}</b>`]]); } },
      ],
    },
    {
      id: 'PKB', grade: G, name: 'Rational functions and asymptotes', icon: '〰️', color: '#ff7a59', ixl: 'G', sg: 'Phase F · Algebra and Functions', km: 'Algebra',
      tip: 'An asymptote is a line the graph approaches but never reaches.',
      skills: [
        { id: 'PKB1', name: 'Vertical asymptotes', gen() { const a = nz(-8, 8), k = nz(-5, 5), b = r(-9, 9); if (k * a + b === 0) return C.SKILLS.PKB1.gen(); return num(`f(x) = ${FR(lin(k, b), lin(1, -a))}. Its vertical asymptote is x = ?`, a, 'A vertical asymptote occurs at the x value that makes the denominator zero (and the numerator nonzero).', [
          ['Denominator = 0', `${lin(1, -a)} = 0 → x = ${N(a)}`], ['Check the numerator', `${N(k)} × ${P(a)} + ${P(b)} = ${N(k * a + b)} ≠ 0`], ['Answer', `x = <b>${N(a)}</b>`]]); } },
        { id: 'PKB2', name: 'Horizontal asymptotes', gen() { const p = nz(-9, 9), q = nz(1, 6), same = Math.random() < 0.7; const ans = same ? F(p, q) : '0'; return num(`f(x) = ${FR(same ? poly([p, r(-5, 5), r(-5, 5)]) : lin(p, r(-5, 5)), poly([q, r(-5, 5), nz(-5, 5)]))}. Its horizontal asymptote is y = ? (simplest fraction if needed)`, ans, 'Compare degrees: same degree → y = ratio of leading coefficients; smaller numerator degree → y = 0.', [
          ['Compare degrees', same ? 'Numerator degree = denominator degree = 2.' : 'Numerator degree (1) < denominator degree (2).'], ['Answer', same ? `y = ${p}/${q} = <b>${ans}</b>` : 'y = <b>0</b>']]); } },
      ],
    },
    {
      id: 'PKC', grade: G, name: 'Advanced exponents and logarithms', icon: '📉', color: '#1fbf9f', ixl: 'H–K', sg: 'Phase F · Algebra and Functions', km: 'Algebra',
      tip: 'Compound interest makes savings grow faster than simple interest.',
      skills: [
        { id: 'PKC1', name: 'Logarithmic equations', gen() { const b = pick([2, 3, 5, 10]), k = r(1, 3), a = nz(1, 4), c = r(-9, 9), x = (b ** k - c) / a; if (!Number.isInteger(x)) return C.SKILLS.PKC1.gen(); const L = b === 10 ? 'log' : `<sup>${b}</sup>log`; return num(`${L} (${lin(a, c)}) = ${k}. What is x?`, x, 'ᵇlog A = k ⇔ A = bᵏ.', [
          ['Change to exponential form', `${lin(a, c)} = ${b}${sup(k)} = ${b ** k}`], ['Solve', `x = <b>${N(x)}</b>`]]); } },
        { id: 'PKC2', name: 'Compound interest', gen() { const m = pick([1000000, 2000000, 5000000]), p = pick([10, 20]), n = r(2, 3), ans = Math.round(m * (1 + p / 100) ** n); return num(`Savings of Rp${m.toLocaleString('en-US')} earn compound interest of ${p}% per year. How many rupiah is the balance after ${n} years? (number only)`, ans, 'Compound interest: Mₙ = M₀ × (1 + i)ⁿ.', [
          ['Growth factor', `1 + ${p}% = ${N(1 + p / 100)}`], ['Raise to the power and multiply', `${m.toLocaleString('en-US')} × ${N(1 + p / 100)}${sup(n)} = <b>${ans.toLocaleString('en-US')}</b>`]], { unit: 'Rp' }); } },
        { id: 'PKC3', name: 'Power property of logarithms', gen() { const b = pick([2, 3]), k = r(2, 4), n = r(2, 5); const L = `<sup>${b}</sup>log`; return num(`${L} (${b ** k})${sup(n)} = ?`, k * n, 'log aⁿ = n × log a.', [
          ['Bring down the exponent', `${n} × ${L} ${b ** k}`], ['Calculate', `${n} × ${k} = <b>${k * n}</b>`]]); } },
      ],
    },
    {
      id: 'PKD', grade: G, name: 'Trigonometric identities and equations', icon: '∿', color: '#e84393', ixl: 'R–T', sg: 'Phase F · Geometry', km: 'Geometry',
      tip: 'sin²x + cos²x = 1 is the Pythagorean theorem on the unit circle.',
      skills: [
        { id: 'PKD1', name: 'Pythagorean identity', gen() { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]); const ask = pick(['cos', 'tan']); return num(`sin x = ${a}/${c} and x is in quadrant I. What is ${ask} x? (fraction)`, ask === 'cos' ? F(b, c) : F(a, b), 'sin²x + cos²x = 1 and tan x = sin x / cos x.', [
          ['cos x', `cos x = √(1 − (${a}/${c})²) = √(${c * c - a * a}/${c * c}) = ${b}/${c}`], ask === 'cos' ? ['Answer', `<b>${F(b, c)}</b>`] : ['tan x', `(${a}/${c}) : (${b}/${c}) = <b>${F(a, b)}</b>`]]); } },
        { id: 'PKD2', name: 'Double angle', gen() { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17]]); const ask = pick(['sin', 'cos']); return num(`sin x = ${a}/${c}, cos x = ${b}/${c}. What is ${ask} 2x? (fraction)`, ask === 'sin' ? F(2 * a * b, c * c) : F(b * b - a * a, c * c), 'sin 2x = 2 sin x cos x; cos 2x = cos²x − sin²x.', ask === 'sin' ? [
          ['Formulas', `2 × ${a}/${c} × ${b}/${c}`], ['Calculate', `${2 * a * b}/${c * c} = <b>${F(2 * a * b, c * c)}</b>`]] : [
          ['Formulas', `(${b}/${c})² − (${a}/${c})²`], ['Calculate', `(${b * b} − ${a * a})/${c * c} = <b>${F(b * b - a * a, c * c)}</b>`]]); } },
        { id: 'PKD3', name: 'Number of solutions of trigonometric equations', gen() { const [eq, sols] = pick([['sin x = 1/2', [30, 150]], ['cos x = 1/2', [60, 300]], ['sin x = −1/2', [210, 330]], ['cos x = 0', [90, 270]], ['tan x = 1', [45, 225]], ['sin x = 1', [90]], ['cos x = −1', [180]], ['sin 2x = 0', [0, 90, 180, 270]]]); return num(`How many solutions does ${eq} have for 0° ≤ x < 360°?`, sols.length, 'Find the reference angle, then all angles in 0°–360° with the right sign.', [
          ['List of solutions', sols.map((x) => x + '°').join(', ')], ['Calculate', `<b>${sols.length}</b> solutions`]]); } },
      ],
    },
    {
      id: 'PKE', grade: G, name: 'Matrices', icon: '▦', color: '#00b894', ixl: 'Q', sg: 'Phase F · Algebra and Functions', km: 'Algebra',
      tip: 'A matrix is like a table: rows and columns. Computer graphics use matrices to rotate images.',
      skills: [
        { id: 'PKE1', name: 'Matrix addition', gen() { const A = [[r(-9, 9), r(-9, 9)], [r(-9, 9), r(-9, 9)]], B = [[r(-9, 9), r(-9, 9)], [r(-9, 9), r(-9, 9)]], i = r(0, 1), j = r(0, 1); return num(`A = ${mat(A)}, B = ${mat(B)}. What is the entry in row ${i + 1}, column ${j + 1} of A + B?`, A[i][j] + B[i][j], 'Add the entries in the same position.', [
          ['Entries being added', `${N(A[i][j])} + ${P(B[i][j])}`], ['Result', `<b>${N(A[i][j] + B[i][j])}</b>`]]); } },
        { id: 'PKE2', name: 'Matrix multiplication', gen() { const A = [[r(-4, 4), r(-4, 4)], [r(-4, 4), r(-4, 4)]], B = [[r(-4, 4), r(-4, 4)], [r(-4, 4), r(-4, 4)]], i = r(0, 1), j = r(0, 1), v = A[i][0] * B[0][j] + A[i][1] * B[1][j]; return num(`A = ${mat(A)}, B = ${mat(B)}. What is the entry in row ${i + 1}, column ${j + 1} of AB?`, v, 'Entry (i, j) of AB = row i of A "dotted" with column j of B.', [
          ['Row ' + (i + 1) + ' × column ' + (j + 1), `${P(A[i][0])} × ${P(B[0][j])} + ${P(A[i][1])} × ${P(B[1][j])}`], ['Result', `<b>${N(v)}</b>`]]); } },
        { id: 'PKE3', name: 'Determinant of a 2 × 2 matrix', gen() { const a = r(-9, 9), b = r(-9, 9), c = r(-9, 9), d = r(-9, 9); return num(`What is the determinant of ${mat([[a, b], [c, d]])}?`, a * d - b * c, 'det [[a, b], [c, d]] = ad − bc.', [
          ['ad', `${P(a)} × ${P(d)} = ${N(a * d)}`], ['bc', `${P(b)} × ${P(c)} = ${N(b * c)}`], ['ad − bc', `<b>${N(a * d - b * c)}</b>`]]); } },
      ],
    },
    {
      id: 'PKF', grade: G, name: 'Vectors', icon: '➡️', color: '#fdcb6e', ixl: 'Y–Z', sg: 'Phase F · Geometry', km: 'Geometry',
      tip: 'A vector has size and direction: a wind speed of 20 km/h to the east is a vector.',
      skills: [
        { id: 'PKF1', name: 'Vector length', gen() { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]); const three = Math.random() < 0.4; if (three) { const [x, y, z, l] = pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9]]); return num(`What is the length of the vector ${vec(x, y, z)}?`, l, '|v| = √(x² + y² + z²).', [['Square', `${x * x} + ${y * y} + ${z * z} = ${l * l}`], ['Root', `<b>${l}</b>`]]); }
          return num(`What is the length of the vector ${vec(pick([1, -1]) * a, pick([1, -1]) * b)}?`, c, '|v| = √(x² + y²).', [['Square', `${a * a} + ${b * b} = ${c * c}`], ['Root', `<b>${c}</b>`]]); } },
        { id: 'PKF2', name: 'Dot product', gen() { const u = [r(-6, 6), r(-6, 6), r(-6, 6)], v = [r(-6, 6), r(-6, 6), r(-6, 6)], d = u[0] * v[0] + u[1] * v[1] + u[2] * v[2]; return num(`u = ${vec(...u)}, v = ${vec(...v)}. What is u · v?`, d, 'u · v = u₁v₁ + u₂v₂ + u₃v₃.', [
          ['Multiply the components', u.map((x, i) => `${P(x)} × ${P(v[i])}`).join(' + ')], ['Add', `<b>${N(d)}</b>`]]); } },
        { id: 'PKF3', name: 'Perpendicular vectors', gen() { const a = nz(-5, 5), b = nz(-5, 5), c = nz(-5, 5), k = nz(-5, 5), q = (-(a * c)) / b; const kk = (-(a * k)) / b; if (!Number.isInteger(kk)) return C.SKILLS.PKF3.gen(); return num(`u = ${vec(a, b)} and v = ${vec(k, 'p')} are perpendicular. What is p?`.replace("'p'", 'p'), kk, 'Two vectors are perpendicular if their dot product is zero.', [
          ['u · v = 0', `${N(a)} × ${P(k)} + ${N(b)} × p = 0`], ['Solve', `p = ${N(-a * k)} : ${P(b)} = <b>${N(kk)}</b>`]]); } },
      ],
    },
    {
      id: 'PKG', grade: G, name: 'Sigma notation and induction', icon: '∑', color: '#00a8cc', ixl: 'AA–BB', sg: 'Phase F · Algebra and Functions', km: 'Algebra',
      tip: 'Young Gauss added 1 to 100 by pairing 1 + 100, 2 + 99, and so on.',
      skills: [
        { id: 'PKG1', name: 'Evaluating sigma notation', gen() { const a = nz(-4, 5), b = r(-5, 5), n = r(4, 10), s = (a * n * (n + 1)) / 2 + b * n; return num(`Evaluate ∑ (${lin(a, b, 'k')}) for k = 1 to ${n}.`, s, '∑(ak + b) = a × ∑k + b × n, and ∑k (1 to n) = n(n + 1)/2.', [
          ['∑k', `${n} × ${n + 1} : 2 = ${(n * (n + 1)) / 2}`], ['Combine', `${N(a)} × ${(n * (n + 1)) / 2} + ${P(b)} × ${n} = <b>${N(s)}</b>`]]); } },
        { id: 'PKG2', name: 'Sum of squares', gen() { const n = r(3, 12), s = (n * (n + 1) * (2 * n + 1)) / 6; return num(`What is 1² + 2² + ... + ${n}²?`, s, '∑k² = n(n + 1)(2n + 1)/6.', [
          ['Substitution', `${n} × ${n + 1} × ${2 * n + 1} : 6`], ['Calculate', `<b>${s}</b>`]]); } },
      ],
    },
    {
      id: 'PKH', grade: G, name: 'Introduction to limits', icon: '→', color: '#9b6dff', ixl: 'HH–JJ', sg: 'Advanced Mathematics · Calculus', km: 'Algebra',
      tip: 'A limit asks: what value does f(x) approach as x gets closer to a?',
      skills: [
        { id: 'PKH1', name: 'Limits by substitution', gen() { const cs = [nz(-3, 3), r(-5, 5), r(-9, 9)], a = r(-4, 4), v = cs.reduce((s, c) => s * a + c, 0); return num(`${LIM('x', N(a))} (${poly(cs)}) = ?`, v, 'For polynomials, the limit at x = a equals f(a).', [
          ['Substitute x = ' + N(a), `${P(cs[0])} × ${P(a)}² + ${P(cs[1])} × ${P(a)} + ${P(cs[2])}`], ['Calculate', `<b>${N(v)}</b>`]]); } },
        { id: 'PKH2', name: '0/0 limits by factoring', gen() { const a = nz(-6, 6), b = nz(-6, 6); if (a === b) return C.SKILLS.PKH2.gen(); return num(`${LIM('x', N(a))} ${FR(poly([1, -(a + b), a * b]), lin(1, -a))} = ?`, a - b, 'If substitution gives 0/0, factor and then cross out the common factor.', [
          ['Factor the numerator', `${LIM('x', N(a))} ${FR(`(${lin(1, -a)})(${lin(1, -b)})`, `(${lin(1, -a)})`)}`],
          [`Cross out (${lin(1, -a)}) on top and bottom`, `${FR(`${CX(`(${lin(1, -a)})`)}(${lin(1, -b)})`, CX(`(${lin(1, -a)})`))} = ${lin(1, -b)}<br><small>It can be crossed out because x approaches ${N(a)} but doesn't equal ${N(a)}, so (${lin(1, -a)}) ≠ 0.</small>`], [`Substitute x = ${N(a)}`, `${N(a)} − ${P(b)} = <b>${N(a - b)}</b>`]]); } },
        { id: 'PKH3', name: 'Limits at infinity', gen() { const p = nz(-9, 9), q = nz(1, 7); return num(`${LIM('x', '∞')} ${FR(poly([p, r(-9, 9), r(-9, 9)]), poly([q, r(-9, 9), nz(-9, 9)]))} = ? (simplest fraction if needed)`, F(p, q), 'Divide the numerator and denominator by the highest power of x; other terms approach 0.', [
          ['Same highest power', 'The result is the ratio of the x² coefficients.'], ['Answer', `${p}/${q} = <b>${F(p, q)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: G, name: 'Precalculus', short: 'PK', stage: 'SMA', ixl: 'https://www.ixl.com/math/precalculus', sg: 'Advanced Mathematics (grades 11–12)' });

  lesson('PKA', 'Transformations shift, reflect, or stretch function graphs.', [['Shifts', ['f(x − h): shift h right.', 'f(x) + k: shift k up.'], 'PKA1'], ['Even and odd', ['Even: f(−x) = f(x).', 'Odd: f(−x) = −f(x).'], 'PKA2']]);
  lesson('PKB', 'A rational function is a division of two polynomials.', [['Asymptotes', ['Vertical: denominator = 0.', 'Horizontal: compare the degrees of the numerator and denominator.'], 'PKB2']]);
  lesson('PKC', 'Logarithms help solve equations with a variable in the exponent.', [['Logarithmic equations', ['ᵇlog A = k ⇔ A = bᵏ.'], 'PKC1'], ['Compound interest', ['M = M₀(1 + i)ⁿ.'], 'PKC2']]);
  lesson('PKD', 'Trigonometric identities hold for all angles.', [['Identity', ['sin²x + cos²x = 1', 'sin 2x = 2 sin x cos x', 'cos 2x = cos²x − sin²x'], 'PKD2']]);
  lesson('PKE', 'A matrix is an arrangement of numbers in rows and columns.', [['Operations', ['Add: entries in the same position.', 'Multiply: row × column.', '2 × 2 determinant: ad − bc.'], 'PKE2']]);
  lesson('PKF', 'Vectors are written in components (x, y) or (x, y, z).', [['Length and dot product', ['|v| = √(x² + y² + z²).', 'u · v = 0 ⇔ perpendicular.'], 'PKF2']]);
  lesson('PKG', 'Sigma notation shortens long sums.', [['Formulas', ['∑k = n(n + 1)/2', '∑k² = n(n + 1)(2n + 1)/6'], 'PKG1']]);
  lesson('PKH', 'Limits are the foundation of calculus.', [['Evaluating limits', ['Try substitution.', 'If 0/0, factor and cross out.', 'At infinity: compare the highest powers.'], 'PKH2']]);
})();
