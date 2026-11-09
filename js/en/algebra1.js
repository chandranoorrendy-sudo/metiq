/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Aljabar 1 (SMA awal, Fase E). Cakupan mengikuti IXL Algebra 1:
 * persamaan dan pertidaksamaan, nilai mutlak, fungsi linear, sistem persamaan, polinomial dan faktorisasi,
 * fungsi dan persamaan kuadrat, fungsi eksponen.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, poly, lin, num, pil, opt, lesson, FR, CX } = C.kit;
  const G = 9;

  const UNITS = [
    {
      id: 'A1A', grade: G, name: 'Advanced linear equations', icon: '⚖️', color: '#4d96ff', ixl: 'C', sg: 'Phase E · Algebra and Functions', km: 'Algebra',
      tip: 'Collect the x terms on one side and numbers on the other, like tidying things into two drawers.',
      skills: [
        { id: 'A1A1', name: 'Variables on both sides', gen() { const x = nz(-9, 9), a = nz(-8, 9), c = nz(-8, 9); if (a === c) return C.SKILLS.A1A1.gen(); const b = r(-15, 15), d = (a - c) * x + b; return num(`${lin(a, b)} = ${lin(c, d)}. What is x?`, x, 'Move all x terms to the left and constants to the right.', [
          ['Subtract from both sides ' + lin(c, 0), `${lin(a - c, b)} = ${N(d)}`], ['Move the constant', `${lin(a - c, 0)} = ${N(d - b)}`], ['Divide', `x = ${N(d - b)} : ${P(a - c)} = <b>${N(x)}</b>`]]); } },
        { id: 'A1A2', name: 'Equations with fractions', gen() { const k = pick([2, 3, 4, 5]), x = nz(-8, 10), b = r(-6, 6), c = (x + b) / k; if (!Number.isInteger(c)) return C.SKILLS.A1A2.gen(); return num(`<span class="mfr"><b>${lin(1, b)}</b><b>${k}</b></span> = ${N(c)}. What is x?`, x, 'Multiply both sides by the denominator to remove the fraction.', [
          ['Multiply both sides by ' + k, `${lin(1, b)} = ${N(c * k)}`], ['Move the constant', `x = ${N(c * k)} − ${P(b)} = <b>${N(x)}</b>`]]); } },
        { id: 'A1A3', name: 'Changing the subject of a formula', gen() { const [f, ask, ans, steps] = pick([
          ['K = 2(p + l)', 'l', 'l = K/2 − p', [['Divide by 2', 'K/2 = p + l'], ['Subtract p', 'l = K/2 − p']]],
          ['V = p × l × t', 't', 't = V/(p × l)', [['Divide both sides by p × l', 't = V/(p × l)']]],
          ['y = mx + c', 'x', 'x = (y − c)/m', [['Subtract c', 'y − c = mx'], ['Divide by m', 'x = (y − c)/m']]],
          ['s = v × t', 'v', 'v = s/t', [['Divide by t', 'v = s/t']]],
          ['F = 9/5 C + 32', 'C', 'C = 5/9 (F − 32)', [['Subtract 32', 'F − 32 = 9/5 C'], ['Multiply by 5/9', 'C = 5/9 (F − 32)']]]]);
          const wrongs = { 'l = K/2 − p': ['l = 2K − p', 'l = K − 2p', 'l = (K − p)/2'], 't = V/(p × l)': ['t = V × p × l', 't = p × l/V', 't = V − p − l'], 'x = (y − c)/m': ['x = y/m − c', 'x = m(y − c)', 'x = (y + c)/m'], 'v = s/t': ['v = s × t', 'v = t/s', 'v = s − t'], 'C = 5/9 (F − 32)': ['C = 9/5 (F − 32)', 'C = 5/9 F − 32', 'C = (F + 32) × 5/9'] };
          return pil(`Rewrite the formula ${f} as ${ask} = ...`, opt(ans, wrongs[ans]), ans, 'Treat the formula like an equation: do inverse operations on both sides until the requested variable is alone.', [...steps, ['Result', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'A1B', grade: G, name: 'Absolute value and inequalities', icon: '| |', color: '#ff7a59', ixl: 'F, H', sg: 'Phase E · Algebra and Functions', km: 'Algebra',
      tip: 'Absolute value is distance from zero: |−5| = 5 because −5 is 5 away from zero.',
      skills: [
        { id: 'A1B1', name: 'Absolute value equations', gen() { const a = r(-9, 9), b = r(1, 9), big = a + b, small = a - b; return num(`|x ${a < 0 ? '+' : '−'} ${Math.abs(a)}| = ${b}. What is the largest solution for x?`, big, '|A| = b means A = b or A = −b.', [
          ['Positive case', `x ${a < 0 ? '+' : '−'} ${Math.abs(a)} = ${b} → x = ${N(big)}`], ['Negative case', `x ${a < 0 ? '+' : '−'} ${Math.abs(a)} = −${b} → x = ${N(small)}`], ['The largest', `<b>${N(big)}</b>`]]); } },
        { id: 'A1B2', name: 'Number of integers in an inequality', gen() { const a = r(-5, 5), b = r(2, 6); return num(`How many integers x satisfy |x ${a < 0 ? '+' : '−'} ${Math.abs(a)}| ≤ ${b}?`, 2 * b + 1, '|A| ≤ b means −b ≤ A ≤ b.', [
          ['Write without absolute value', `−${b} ≤ x ${a < 0 ? '+' : '−'} ${Math.abs(a)} ≤ ${b}`], ['Solve', `${N(a - b)} ≤ x ≤ ${N(a + b)}`], ['Count the integers', `${N(a + b)} − ${P(a - b)} + 1 = <b>${2 * b + 1}</b>`]]); } },
        { id: 'A1B3', name: 'Compound inequalities', gen() { const a = nz(2, 5), lo = r(-6, 2), hi = r(lo + 2, lo + 8), b = r(-6, 6); const ans = `${N(lo)} < x < ${N(hi)}`; return pil(`Solve: ${N(a * lo + b)} < ${lin(a, b)} < ${N(a * hi + b)}`, opt(ans, [`${N(lo - 1)} < x < ${N(hi - 1)}`, `${N(lo)} < x < ${N(hi + 1)}`, `x < ${N(lo)} atau x > ${N(hi)}`, `${N(a * lo)} < x < ${N(a * hi)}`]), ans, 'Do the same operation on all three parts at once.', [
          ['Subtract ' + N(b), `${N(a * lo)} < ${lin(a, 0)} < ${N(a * hi)}`], ['Divide ' + a, `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'A1C', grade: G, name: 'Linear functions', icon: '📈', color: '#1fbf9f', ixl: 'K–N', sg: 'Phase E · Algebra and Functions', km: 'Algebra',
      tip: 'An online motorcycle taxi fare: starting fee (intercept) + fee per km (slope).',
      skills: [
        { id: 'A1C1', name: 'x-intercepts', gen() { const m = nz(-5, 5), x0 = nz(-8, 8), c = -m * x0; if (!c) return C.SKILLS.A1C1.gen(); return num(`The line y = ${lin(m, c)} crosses the x-axis at (a, 0). What is a?`, x0, 'The x-intercept occurs when y = 0.', [
          ['Set y = 0', `0 = ${lin(m, c)}`], ['Solve', `${lin(m, 0)} = ${N(-c)} → x = <b>${N(x0)}</b>`]]); } },
        { id: 'A1C2', name: 'Parallel and perpendicular lines', gen() { const p = nz(-4, 4), q = nz(1, 5), m = F(p, q), tegak = Math.random() < 0.5, ans = tegak ? F(-q, p) : m; return num(`Line g has slope ${m}. What is the slope of a line ${tegak ? 'perpendicular' : 'parallel'} to g? (simplest fraction if needed)`, ans, 'Parallel lines: equal slopes. Perpendicular lines: m₁ × m₂ = −1, so m₂ = −1/m₁.', [
          [tegak ? 'Perpendicular' : 'Parallel', tegak ? `m₂ = −1 : (${m}) = ${F(-q, p)}` : 'The slopes are equal.'], ['Answer', `<b>${ans}</b>`]]); } },
        { id: 'A1C3', name: 'Linear models from word problems', gen() { const awal = pick([5000, 7000, 8000, 10000]), per = pick([2000, 2500, 3000, 3500]), km = r(3, 15), tot = awal + per * km; return num(`Motorcycle taxi fare: starting fee Rp${awal.toLocaleString('en-US')} plus Rp${per.toLocaleString('en-US')} per km. How many km is the trip if the fare is Rp${tot.toLocaleString('en-US')}?`, km, 'Write the model y = starting fee + rate × x, then solve for x.', [
          ['Model', `${tot.toLocaleString('en-US')} = ${awal.toLocaleString('en-US')} + ${per.toLocaleString('en-US')}x`], ['Subtract the starting fee', `${per.toLocaleString('en-US')}x = ${(tot - awal).toLocaleString('en-US')}`], ['Divide', `x = <b>${km}</b> km`]], { unit: 'km' }); } },
      ],
    },
    {
      id: 'A1D', grade: G, name: 'Systems of linear equations', icon: '✖️', color: '#e84393', ixl: 'O–P', sg: 'Phase E · Algebra and Functions', km: 'Algebra',
      tip: 'Two lines meeting at one point = the system has one solution.',
      skills: [
        { id: 'A1D1', name: 'Substitution method', gen() { const x = nz(-6, 6), y = nz(-6, 6), m = nz(-3, 3), c = y - m * x, a = nz(1, 4), b = nz(-4, 4), d = a * x + b * y; if (a + b * m === 0) return C.SKILLS.A1D1.gen(); return num(`y = ${lin(m, c)}<br>${lin(a, 0)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${N(d)}<br>What is x?`, x, 'Replace y in the second equation with the expression from the first.', [
          ['Substitution', `${lin(a, 0)} + ${P(b)}(${lin(m, c)}) = ${N(d)}`], ['Simplify', `${lin(a + b * m, b * c)} = ${N(d)}`], ['Solve', `x = ${N(d - b * c)} : ${P(a + b * m)} = <b>${N(x)}</b>`]]); } },
        { id: 'A1D2', name: 'Sum of solutions x + y', gen() { const x = nz(-7, 7), y = nz(-7, 7), a = nz(1, 5), b = nz(1, 5), c = nz(1, 5), d = nz(-5, -1); if (a * d === b * c) return C.SKILLS.A1D2.gen(); return num(`${lin(a, 0)} + ${b === 1 ? '' : b}y = ${N(a * x + b * y)}<br>${lin(c, 0)} − ${Math.abs(d) === 1 ? '' : Math.abs(d)}y = ${N(c * x + d * y)}<br>What is x + y?`, x + y, 'Solve for x and y by elimination, then add.', [
          ['Elimination', 'Make the coefficients of one variable equal, then add or subtract the equations.'], ['Solution', `x = ${N(x)}, y = ${N(y)}`], ['Add', `x + y = <b>${N(x + y)}</b>`]]); } },
      ],
    },
    {
      id: 'A1E', grade: G, name: 'Polynomials', icon: '🧮', color: '#fdcb6e', ixl: 'W', sg: 'Phase E · Algebra and Functions', km: 'Algebra',
      tip: 'Area model with boxes: (x + 3)(x + 2) is the area of a rectangle divided into four parts.',
      skills: [
        { id: 'A1E1', name: 'Adding and subtracting polynomials', gen() { const p = [nz(-5, 5), r(-9, 9), r(-9, 9)], q = [nz(-5, 5), r(-9, 9), r(-9, 9)], add = Math.random() < 0.5, s = p.map((v, i) => (add ? v + q[i] : v - q[i])); if (!s[0]) return C.SKILLS.A1E1.gen(); const ans = poly(s); return pil(`(${poly(p)}) ${add ? '+' : '−'} (${poly(q)}) = ?`, opt(ans, [poly(p.map((v, i) => (add ? v - q[i] : v + q[i]))), poly([s[0], s[1], -s[2]]), poly([s[0], -s[1], s[2]]), poly([s[0] + 1, s[1], s[2]])]), ans, 'Add or subtract the coefficients of like terms (same exponent).', [
          [add ? 'Remove parentheses' : 'Remove parentheses (the second term\'s sign changes)', add ? 'The signs stay the same.' : `−(${poly(q)}) = ${poly(q.map((v) => -v))}`], ['Combine like terms', `<b>${ans}</b>`]]); } },
        { id: 'A1E2', name: 'Multiplying two binomials', gen() { const a = nz(-9, 9), b = nz(-9, 9), ans = poly([1, a + b, a * b]); return pil(`(${lin(1, a)})(${lin(1, b)}) = ?`, opt(ans, [poly([1, a * b, a + b]), poly([1, a + b, -a * b]), poly([1, a - b, a * b]), poly([1, 0, a * b])]), ans, 'Multiply each term in the first parentheses by each term in the second.', [
          ['x × x', `x${sup(2)}`], ['Outer + inner terms', `${N(b)}x + ${P(a)}x = ${N(a + b)}x`], ['Constant', `${P(a)} × ${P(b)} = ${N(a * b)}`], ['Result', `<b>${ans}</b>`]]); } },
        { id: 'A1E3', name: 'Squaring a binomial', gen() { const a = nz(1, 5), b = nz(-9, 9), ans = poly([a * a, 2 * a * b, b * b]); return pil(`(${lin(a, b)})${sup(2)} = ?`, opt(ans, [poly([a * a, 0, b * b]), poly([a * a, a * b, b * b]), poly([a * a, 2 * a * b, -b * b]), poly([a, 2 * a * b, b * b])]), ans, '(p + q)² = p² + 2pq + q². Don\'t forget the middle term 2pq.', [
          ['p² ', `(${lin(a, 0)})${sup(2)} = ${poly([a * a, 0, 0])}`], ['2pq', `2 × ${lin(a, 0)} × ${P(b)} = ${lin(2 * a * b, 0)}`], ['q²', `${P(b)}${sup(2)} = ${b * b}`], ['Result', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'A1F', grade: G, name: 'Factoring', icon: '🧩', color: '#00b894', ixl: 'X', sg: 'Phase E · Algebra and Functions', km: 'Algebra',
      tip: 'For x² + bx + c, find two numbers whose product is c and whose sum is b.',
      skills: [
        { id: 'A1F1', name: 'Factoring x² + bx + c', gen() { const a = nz(-9, 9), b = nz(-9, 9); if (a === -b) return C.SKILLS.A1F1.gen(); const ans = `(${lin(1, a)})(${lin(1, b)})`; return pil(`Factor ${poly([1, a + b, a * b])}.`, opt(ans, [`(${lin(1, -a)})(${lin(1, -b)})`, `(${lin(1, a)})(${lin(1, -b)})`, `(${lin(1, -a)})(${lin(1, b)})`, `(${lin(1, a + b)})(${lin(1, 1)})`]), ans, 'Find two numbers p and q with p × q = c and p + q = b. Then x² + bx + c = (x + p)(x + q).', [
          ['Product', `p × q = ${N(a * b)}`], ['Sum', `p + q = ${N(a + b)}`], ['The numbers', `${N(a)} and ${N(b)}`], ['Factors', `<b>${ans}</b>`]]); } },
        { id: 'A1F2', name: 'Difference of two squares', gen() { const a = r(1, 4), b = r(1, 12), ans = `(${lin(a, b)})(${lin(a, -b)})`; return pil(`Factor ${poly([a * a, 0, -b * b])}.`, opt(ans, [`(${lin(a, b)})${sup(2)}`, `(${lin(a, -b)})${sup(2)}`, `(${lin(a * a, b)})(${lin(1, -b)})`, `(${lin(a, b * b)})(${lin(a, -1)})`]), ans, 'p² − q² = (p + q)(p − q).', [
          ['Identify the squares', `${poly([a * a, 0, 0])} = (${lin(a, 0)})${sup(2)} and ${b * b} = ${b}${sup(2)}`], ['Factors', `<b>${ans}</b>`]]); } },
        { id: 'A1F4', name: 'Simplifying algebraic fractions', gen() { const p = nz(-6, 6), q = nz(-6, 6), ans = lin(1, q), f = `(${lin(1, p)})`; return pil(`Sederhanakan: ${FR(poly([1, p + q, p * q]), lin(1, p))}`, opt(ans, [lin(1, -q), lin(1, p), lin(1, p + q), lin(1, p * q), lin(1, -p)]), ans, 'Factor the numerator, then cross out the common factor on top and bottom.', [
          ['Factor the numerator', FR(`${f}(${lin(1, q)})`, f)], [`Cross out ${f} on top and bottom`, `${FR(`${CX(f)}(${lin(1, q)})`, CX(f))} = ${ans}<br><small>Holds for x ≠ ${N(-p)}, because the denominator can't be 0.</small>`], ['Result', `<b>${ans}</b>`]]); } },
        { id: 'A1F3', name: 'Greatest common factor', gen() { const k = r(2, 9), a = r(1, 6), b = nz(-9, 9); if (Math.abs(C.kit.gcd(Math.abs(a), Math.abs(b))) !== 1) return C.SKILLS.A1F3.gen(); const ans = `${k}x(${lin(a, b)})`; return pil(`Factor ${poly([k * a, k * b, 0])}.`, opt(ans, [`${k}(${poly([a, b, 0])})`, `x(${lin(k * a, b)})`, `${k}x(${lin(a, k * b)})`, `${k * 2}x(${lin(a, b)})`]), ans, 'Take out the factor found in all terms (coefficient and variable).', [
          ['GCF of the coefficients', `GCF(${Math.abs(k * a)}, ${Math.abs(k * b)}) = ${k}`], ['Shared variable', 'x'], ['Result', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'A1G', grade: G, name: 'Quadratic functions', icon: '⌒', color: '#00a8cc', ixl: 'Y', sg: 'Phase E · Algebra and Functions', km: 'Algebra',
      tip: 'The path of a thrown ball is a parabola: its highest point is the vertex.',
      skills: [
        { id: 'A1G1', name: 'Axis of symmetry', gen() { const a = nz(-3, 3), h = nz(-6, 6), b = -2 * a * h, c = r(-9, 9); return num(`What is the axis of symmetry of the parabola y = ${poly([a, b, c])}? (x = ...)`, h, 'The axis of symmetry of y = ax² + bx + c is x = −b/(2a).', [
          ['Identify a and b', `a = ${N(a)}, b = ${N(b)}`], ['Calculate', `x = −(${N(b)}) / (2 × ${P(a)}) = <b>${N(h)}</b>`]]); } },
        { id: 'A1G2', name: 'Vertex', gen() { const a = nz(-3, 3), h = nz(-5, 5), k = r(-9, 9), b = -2 * a * h, c = a * h * h + k; return num(`The vertex of the parabola y = ${poly([a, b, c])} is (${N(h)}, p). What is p?`, k, 'Substitute the vertex x into the function to get the vertex y.', [
          ['Vertex x', `x = −b/(2a) = ${N(h)}`], ['Substitution', `y = ${N(a)} × ${P(h)}${sup(2)} + ${P(b)} × ${P(h)} + ${P(c)} = <b>${N(k)}</b>`]]); } },
        { id: 'A1G3', name: 'Discriminant and number of roots', gen() { const a = nz(-3, 3), b = r(-8, 8), c = r(-8, 8), D = b * b - 4 * a * c, ans = D > 0 ? '2 real roots' : D === 0 ? '1 real root (repeated)' : 'no real roots'; return pil(`How many real roots does ${poly([a, b, c])} = 0 have?`, ['2 real roots', '1 real root (repeated)', 'no real roots'], ans, 'Discriminant D = b² − 4ac: D > 0 two roots, D = 0 one root, D < 0 no real roots.', [
          ['Calculate D', `${P(b)}${sup(2)} − 4 × ${P(a)} × ${P(c)} = ${N(D)}`], ['Conclude', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'A1H', grade: G, name: 'Quadratic equations', icon: '🎯', color: '#9b6dff', ixl: 'Z', sg: 'Phase E · Algebra and Functions', km: 'Algebra',
      tip: 'Check roots by substituting them back into the equation.',
      skills: [
        { id: 'A1H1', name: 'Roots by factoring', gen() { const p = r(-9, 9), q = r(-9, 9); if (p === q) return C.SKILLS.A1H1.gen(); const big = Math.max(p, q); return num(`${poly([1, -(p + q), p * q])} = 0. What is the largest root?`, big, 'Factor, then use the property: if A × B = 0 then A = 0 or B = 0.', [
          ['Factor', `(${lin(1, -p)})(${lin(1, -q)}) = 0`], ['Roots', `x = ${N(p)} or x = ${N(q)}`], ['The largest', `<b>${N(big)}</b>`]]); } },
        { id: 'A1H2', name: 'Quadratic formula', gen() { const a = pick([1, 2, 3]), p = nz(-6, 6), q = nz(-6, 6), b = -a * (p + q), c = a * p * q, D = b * b - 4 * a * c; if (!D) return C.SKILLS.A1H2.gen(); const small = Math.min(p, q); return num(`Use the quadratic formula for ${poly([a, b, c])} = 0. What is the smallest root?`, small, 'x = (−b ± √(b² − 4ac)) / 2a.', [
          ['Discriminant', `D = ${P(b)}${sup(2)} − 4 × ${a} × ${P(c)} = ${D}, √D = ${Math.sqrt(D)}`], ['Two roots', `x = (${N(-b)} ± ${Math.sqrt(D)}) / ${2 * a} → ${N(Math.max(p, q))} or ${N(small)}`], ['The smallest', `<b>${N(small)}</b>`]]); } },
        { id: 'A1H3', name: 'Sum and product of roots', gen() { const a = nz(1, 4), b = nz(-12, 12), c = nz(-12, 12), sum = Math.random() < 0.5; return num(`The roots of ${poly([a, b, c])} = 0 are x₁ and x₂. What is ${sum ? 'x₁ + x₂' : 'x₁ × x₂'}? (simplest fraction if needed)`, sum ? F(-b, a) : F(c, a), 'Vieta\'s formulas: x₁ + x₂ = −b/a and x₁ × x₂ = c/a.', [
          ['Identify a, b, c', `a = ${a}, b = ${N(b)}, c = ${N(c)}`], ['Use the formula', sum ? `−b/a = ${N(-b)}/${a} = <b>${F(-b, a)}</b>` : `c/a = ${N(c)}/${a} = <b>${F(c, a)}</b>`]]); } },
      ],
    },
    {
      id: 'A1I', grade: G, name: 'Exponential functions', icon: '🚀', color: '#e17055', ixl: 'V', sg: 'Phase E · Algebra and Functions', km: 'Algebra',
      tip: 'Bacteria that split in two every hour grow exponentially: 1, 2, 4, 8, 16, ...',
      skills: [
        { id: 'A1I1', name: 'Values of exponential functions', gen() { const a = r(1, 5), b = pick([2, 3, 4]), x = r(0, 4); return num(`f(x) = ${a === 1 ? '' : a + ' × '}${b}${sup('x')}. What is f(${x})?`, a * b ** x, 'Calculate the power first, then multiply by the coefficient.', [
          ['Power', `${b}${sup(x)} = ${b ** x}`], ['Multiply', `${a} × ${b ** x} = <b>${a * b ** x}</b>`]]); } },
        { id: 'A1I2', name: 'Growth and decay', gen() { const grow = Math.random() < 0.5, a = pick([100, 200, 400, 800, 1600]), n = r(2, 4); const ans = grow ? a * 2 ** n : a / 2 ** n; return num(grow ? `There are ${a} bacteria, doubling every hour. How many are there after ${n} hours?` : `${a} grams of a substance decays by half every 5 years. How many grams remain after ${n * 5} years?`, ans, grow ? 'Growth: A = A₀ × 2ⁿ.' : 'Half-life decay: A = A₀ × (1/2)ⁿ, n = time ÷ half-life.', [
          ['Find n', grow ? `n = ${n}` : `n = ${n * 5} : 5 = ${n}`], ['Calculate', grow ? `${a} × 2${sup(n)} = <b>${N(ans)}</b>` : `${a} × (1/2)${sup(n)} = <b>${N(ans)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: G, name: 'Algebra 1', short: 'A1', stage: 'SMA', ixl: 'https://www.ixl.com/math/algebra-1', sg: 'Kurikulum Merdeka Phase E (grade 10)' });

  lesson('A1A', 'Linear equations are solved with inverse operations on both sides.', [
    ['Variables on both sides', ['Collect the x terms on one side.', 'Collect the constants on the other side.', 'Divide by the coefficient of x.'], 'A1A1'],
    ['Fractions', ['Multiply both sides by the denominator (or the LCM of the denominators).'], 'A1A2'],
  ]);
  lesson('A1B', 'Absolute value |x| is the distance of x from zero.', [
    ['Equations', ['|A| = b → A = b or A = −b (b ≥ 0).'], 'A1B1'], ['Inequalities', ['|A| ≤ b → −b ≤ A ≤ b.', '|A| ≥ b → A ≤ −b or A ≥ b.'], 'A1B2'],
  ]);
  lesson('A1C', 'The linear function y = mx + c has slope m and y-intercept (0, c).', [
    ['Intercepts', ['y-axis: x = 0.', 'x-axis: y = 0.'], 'A1C1'], ['Parallel and perpendicular', ['Parallel: m₁ = m₂.', 'Perpendicular: m₁ × m₂ = −1.'], 'A1C2'],
  ]);
  lesson('A1D', 'Systems of linear equations are solved by substitution, elimination, or graphing.', [
    ['Substitution', ['Express one variable from one equation.', 'Substitute into the other equation.'], 'A1D1'],
  ]);
  lesson('A1E', 'A polynomial is a sum of terms of the form axⁿ.', [
    ['Multiplying binomials', ['(x + a)(x + b) = x² + (a + b)x + ab.'], 'A1E2'], ['Squaring a binomial', ['(p + q)² = p² + 2pq + q².'], 'A1E3'],
  ]);
  lesson('A1F', 'Factoring is the reverse of multiplying.', [
    ['Trinomials', ['Find p, q: p × q = c, p + q = b.'], 'A1F1'], ['Difference of squares', ['p² − q² = (p + q)(p − q).'], 'A1F2'],
  ]);
  lesson('A1G', 'The graph of the quadratic y = ax² + bx + c is a parabola.', [
    ['Vertex and axis of symmetry', ['Vertex x = −b/(2a).', 'Vertex y = f(vertex x).', 'a > 0 opens up, a < 0 opens down.'], 'A1G2'],
    ['Discriminant', ['D = b² − 4ac determines the number of real roots.'], 'A1G3'],
  ]);
  lesson('A1H', 'The quadratic equation ax² + bx + c = 0 has at most two roots.', [
    ['Factoring', ['Factor, then set each factor = 0.'], 'A1H1'], ['Quadratic formula', ['x = (−b ± √(b² − 4ac)) / 2a.'], 'A1H2'],
  ]);
  lesson('A1I', 'The exponential function f(x) = a × bˣ grows (b > 1) or decays (0 < b < 1).', [
    ['Growth and decay', ['Doubling: × 2 each period.', 'Half-life: × 1/2 each period.'], 'A1I2'],
  ]);
})();
