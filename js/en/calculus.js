/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Kalkulus (SMA akhir / Matematika Tingkat Lanjut). Cakupan mengikuti IXL Calculus:
 * limit dan kontinuitas, turunan dan aturannya, turunan fungsi trigonometri/eksponen/logaritma,
 * aplikasi turunan, turunan kedua dan L'Hôpital, integral tak tentu dan tentu, teknik dan aplikasi integral.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, poly, lin, num, pil, opt, lesson, LIM, FR, CX, INT } = C.kit;
  const G = 13;
  const ev = (cs, x) => cs.reduce((s, c) => s * x + c, 0);
  const der = (cs) => { const n = cs.length - 1; return cs.slice(0, -1).map((c, i) => c * (n - i)); };
  // Tabel nilai mendatar; di layar HP tabel lebar ditampilkan tegak (kolom menjadi baris) agar tidak perlu digeser
  const tbl = (head, rows) => {
    const flat = `<table class="mtbl${head.length > 5 ? ' mh' : ''}"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((row) => `<tr>${row.map((v) => `<td>${N(v)}</td>`).join('')}</tr>`).join('')}</table>`;
    if (head.length <= 5) return flat;
    return flat + `<table class="mtbl mv"><tr><th>${head[0]}</th>${rows.map((row) => `<th>${row[0]}</th>`).join('')}</tr>${head.slice(1).map((h, i) => `<tr><td>${h}</td>${rows.map((row) => `<td>${N(row[i + 1])}</td>`).join('')}</tr>`).join('')}</table>`;
  };

  const UNITS = [
    {
      id: 'KA', grade: G, name: 'Limits', icon: '→', color: '#4d96ff', ixl: 'A–D', sg: 'Calculus · Limits', km: 'Algebra',
      tip: 'Imagine walking toward a door: the limit is where you\'re heading, even if you haven\'t arrived.',
      skills: [
        { id: 'KA1', name: 'Limits from tables', gen() { const L = r(-9, 9), a = r(-3, 5), d = [0.1, 0.01, 0.001]; const vals = (s) => d.map((h, i) => Math.round((L + s * (3 - i) * 0.1 * (i === 2 ? 0.1 : 1)) * 1000) / 1000); const left = vals(-1), right = vals(1); return num(`Table of f(x) values around x = ${N(a)}:<br>${tbl(['x', ...d.map((h) => N(a - h)), ...d.slice().reverse().map((h) => N(a + h))], [['f(x)', ...left, ...right.slice().reverse()]])}What is lim(x → ${N(a)}) f(x)?`, L, 'Look at f(x) as x gets closer to a from the left and right.', [
          ['From the left', `f(x) approaches ${N(L)}`], ['From the right', `f(x) approaches ${N(L)}`], ['Both sides match', `the limit is <b>${N(L)}</b>`]]); } },
        { id: 'KA2', name: '0/0 limits', gen() { const a = nz(-5, 5), b = nz(-5, 5), k = nz(1, 3); if (a === b) return C.SKILLS.KA2.gen(); return num(`${LIM('x', N(a))} ${FR(poly([k, -k * (a + b), k * a * b]), lin(1, -a))} = ?`, k * (a - b), 'Substitution gives 0/0: factor, cross out the factor (x − a), then substitute.', [
          ['Factor the numerator', `${LIM('x', N(a))} ${FR(`${k === 1 ? '' : k}(${lin(1, -a)})(${lin(1, -b)})`, `(${lin(1, -a)})`)}`],
          [`Cross out (${lin(1, -a)}) on top and bottom`, `${FR(`${k === 1 ? '' : k}${CX(`(${lin(1, -a)})`)}(${lin(1, -b)})`, CX(`(${lin(1, -a)})`))} = ${k === 1 ? '' : k}(${lin(1, -b)})<br><small>It can be crossed out because x approaches ${N(a)} but doesn't equal ${N(a)}, so (${lin(1, -a)}) ≠ 0.</small>`],
          [`Substitute x = ${N(a)}`, `${k === 1 ? '' : k + ' × '}(${N(a)} − ${P(b)}) = <b>${N(k * (a - b))}</b>`]]); } },
        { id: 'KA3', name: 'Trigonometric limits', gen() { const a = nz(1, 9), b = nz(1, 9); return num(`${LIM('x', 0)} ${FR(`sin ${a}x`, `${b}x`)} = ? (simplest fraction if needed)`, F(a, b), 'lim(x → 0) sin(ax)/(bx) = a/b, because lim sin u / u = 1.', [
          ['Rewrite', `(${a}/${b}) × sin(${a}x)/(${a}x)`], ['Use lim sin u/u = 1', `${a}/${b} × 1 = <b>${F(a, b)}</b>`]]); } },
        { id: 'KA4', name: 'Limits at infinity', gen() { const deg = pick(['same', 'top', 'bottom']), p = nz(-6, 6), q = nz(1, 6); const ans = deg === 'same' ? F(p, q) : deg === 'bottom' ? '0' : null; if (deg === 'top') return pil(`${LIM('x', '∞')} ${FR(poly([p, 0, 0, 1]), poly([q, 0, 1]))} = ?`, ['∞', '−∞', '0', F(p, q)], p > 0 ? '∞' : '−∞', 'If the numerator\'s degree is larger, the limit is infinite (its sign follows the leading coefficient).', [
          ['Compare degrees', 'numerator 3 > denominator 2'], ['Sign', `coefficient ${p > 0 ? 'positive → ∞' : 'negative → −∞'}`]]);
          return num(`${LIM('x', '∞')} ${FR(deg === 'same' ? poly([p, 3, 0]) : lin(p, 3), poly([q, 0, 1]))} = ? (simplest fraction if needed)`, ans, 'Compare the degrees of the numerator and denominator.', [
          ['Compare degrees', deg === 'same' ? 'same (2) → ratio of leading coefficients' : 'smaller numerator → 0'], ['Answer', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'KB', grade: G, name: 'Continuity', icon: '〰', color: '#ff7a59', ixl: 'E', sg: 'Calculus · Limits', km: 'Algebra',
      tip: 'A continuous function can be drawn without lifting your pencil.',
      skills: [
        { id: 'KB1', name: 'Making piecewise functions continuous', gen() { const a = r(-3, 4), m = nz(-4, 4), c = r(-6, 6), n = nz(-3, 3), left = m * a + c, k = left - n * a; return num(`f(x) = ${lin(m, c)} for x < ${N(a)}, and f(x) = ${lin(n, 0)} + k for x ≥ ${N(a)}. For f to be continuous at x = ${N(a)}, what is k?`, k, 'Continuous at a means left limit = right limit = f(a).', [
          ['Left limit', `${N(m)} × ${P(a)} + ${P(c)} = ${N(left)}`], ['Right limit', `${N(n)} × ${P(a)} + k = ${N(n * a)} + k`], ['Set them equal', `k = ${N(left)} − ${P(n * a)} = <b>${N(k)}</b>`]]); } },
        { id: 'KB2', name: 'Types of discontinuity', gen() { const [f, ans] = pick([['(x² − 4)/(x − 2) at x = 2', 'removable (hole)'], ['1/(x − 3) at x = 3', 'infinite (vertical asymptote)'], ['⌊x⌋ (greatest integer) at x = 1', 'jump'], ['(x² − 9)/(x + 3) at x = −3', 'removable (hole)'], ['|x|/x at x = 0', 'jump'], ['1/x² at x = 0', 'infinite (vertical asymptote)']]); return pil(`The type of discontinuity of f(x) = ${f} is ...`, ['removable (hole)', 'jump', 'infinite (vertical asymptote)'], ans, 'Hole: the limit exists but f(a) doesn\'t exist/differs. Jump: left limit ≠ right. Infinite: f(x) grows without bound.', [
          ['Check the left and right limits', 'Compare, then check whether the value is finite.'], ['Conclude', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'KC', grade: G, name: 'Introduction to derivatives', icon: '📐', color: '#1fbf9f', ixl: 'F', sg: 'Calculus · Derivatives', km: 'Algebra',
      tip: 'A motorcycle speedometer shows the derivative of distance with respect to time: instantaneous speed.',
      skills: [
        { id: 'KC1', name: 'Average rate of change', gen() { const cs = [nz(-3, 3), r(-5, 5), r(-5, 5)], a = r(-3, 2), b = a + r(1, 4), v = (ev(cs, b) - ev(cs, a)) / (b - a); return num(`f(x) = ${poly(cs)}. What is the average rate of change of f from x = ${N(a)} to x = ${N(b)}?`, v, 'Average rate of change = (f(b) − f(a)) / (b − a), the slope of the secant line.', [
          ['f(' + N(a) + ') and f(' + N(b) + ')', `${N(ev(cs, a))} and ${N(ev(cs, b))}`], ['Divide', `(${N(ev(cs, b))} − ${P(ev(cs, a))}) / ${b - a} = <b>${N(v)}</b>`]]); } },
        { id: 'KC2', name: 'Derivatives by the limit definition', gen() { const a = nz(-3, 3), b = r(-6, 6), x = r(-4, 4), v = 2 * a * x + b; return num(`f(x) = ${poly([a, b, 0])}. With f'(x) = ${LIM('h', 0)} ${FR('f(x + h) − f(x)', 'h')}, what is f'(${N(x)})?`, v, "f'(x) = lim(h → 0) [f(x + h) − f(x)] / h.", [
          ['Difference', `f(x + h) − f(x) = ${N(2 * a)}xh + ${P(a)}h² + ${P(b)}h`],
          ['Take out h', FR(`h(${lin(2 * a, b)} ${a < 0 ? '−' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}h)`, 'h')],
          ['Cross out h on top and bottom', `${FR(`${CX('h')}(${lin(2 * a, b)} ${a < 0 ? '−' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}h)`, CX('h'))} = ${lin(2 * a, b)} ${a < 0 ? '−' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}h`],
          ['h → 0', `f'(x) = ${lin(2 * a, b)}`], ['Substitution', `f'(${N(x)}) = <b>${N(v)}</b>`]]); } },
        { id: 'KC3', name: 'Slope of the tangent line', gen() { const cs = [nz(-2, 2), r(-4, 4), r(-4, 4), r(-5, 5)], x = r(-2, 2), v = ev(der(cs), x); return num(`What is the slope of the tangent to the curve y = ${poly(cs)} at x = ${N(x)}?`, v, "The slope of the tangent at x = a is f'(a).", [
          ['Differentiate', `y' = ${poly(der(cs))}`], ['Substitution', `y'(${N(x)}) = <b>${N(v)}</b>`]]); } },
      ],
    },
    {
      id: 'KD', grade: G, name: 'Derivative rules', icon: "f'", color: '#e84393', ixl: 'G–I', sg: 'Calculus · Derivatives', km: 'Algebra',
      tip: 'Chain rule: differentiate the "outside" first, then multiply by the derivative of the "inside".',
      skills: [
        { id: 'KD1', name: 'Power rule', gen() { const a = nz(-5, 6), n = r(2, 7), x = pick([-2, -1, 1, 2]); const v = a * n * x ** (n - 1); return num(`f(x) = ${a === 1 ? '' : a === -1 ? '−' : N(a)}x${sup(n)}. What is f'(${N(x)})?`, v, "Power rule: (axⁿ)' = a × n × xⁿ⁻¹.", [
          ['Differentiate', `f'(x) = ${N(a * n)}x${sup(n - 1)}`], ['Substitution', `${N(a * n)} × ${P(x)}${sup(n - 1)} = <b>${N(v)}</b>`]]); } },
        { id: 'KD2', name: 'Product rule', gen() { const a = nz(-4, 4), b = r(-5, 5), c = nz(-4, 4), d = r(-5, 5), x = r(-3, 3); const u = a * x + b, w = c * x * x + d, v = a * w + u * 2 * c * x; return num(`f(x) = (${lin(a, b)})(${poly([c, 0, d])}). What is f'(${N(x)})?`, v, "(uv)' = u'v + uv'.", [
          ['u, v and their derivatives', `u = ${lin(a, b)}, u' = ${N(a)}; v = ${poly([c, 0, d])}, v' = ${lin(2 * c, 0)}`], ['Value at x = ' + N(x), `u = ${N(u)}, u' = ${N(a)}, v = ${N(w)}, v' = ${N(2 * c * x)}`], ["u'v + uv'", `${N(a)} × ${P(w)} + ${P(u)} × ${P(2 * c * x)} = <b>${N(v)}</b>`]]); } },
        { id: 'KD3', name: 'Quotient rule', gen() { const a = nz(-4, 4), b = r(-5, 5), c = nz(1, 3), d = r(-5, 5), x = r(-3, 3), den = c * x + d; if (!den || a * d === b * c) return C.SKILLS.KD3.gen(); const num1 = a * den - (a * x + b) * c; return num(`f(x) = ${FR(lin(a, b), lin(c, d))}. What is f'(${N(x)})? (simplest fraction if needed)`, F(num1, den * den), "(u/v)' = (u'v − uv') / v².", [
          ['Value at x = ' + N(x), `u = ${N(a * x + b)}, u' = ${N(a)}, v = ${N(den)}, v' = ${N(c)}`], ['Substitution', `(${N(a)} × ${P(den)} − ${P(a * x + b)} × ${c}) / ${P(den)}² = ${N(num1)}/${den * den}`], ['Simplify', `<b>${F(num1, den * den)}</b>`]]); } },
        { id: 'KD4', name: 'Chain rule', gen() { const a = nz(-3, 3), b = r(-4, 4), n = r(2, 4), x = r(-2, 2), inner = a * x + b, v = n * inner ** (n - 1) * a; return num(`f(x) = (${lin(a, b)})${sup(n)}. What is f'(${N(x)})?`, v, "Chain rule: [g(h(x))]' = g'(h(x)) × h'(x).", [
          ['Outer derivative', `${n}(${lin(a, b)})${sup(n - 1)}`], ['Multiply by the inner derivative', `× ${N(a)}`], ['Substitution', `${n} × ${P(inner)}${sup(n - 1)} × ${P(a)} = <b>${N(v)}</b>`]]); } },
        { id: 'KD5', name: 'Chain rule from a table', gen() { const xs = shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, 3).sort((p, q) => p - q); const f = xs.map(() => r(-9, 9)), fp = xs.map(() => nz(-9, 9)), g = xs.map(() => pick(xs)), gp = xs.map(() => nz(-9, 9)); const i = r(0, 2), gi = g[i], j = xs.indexOf(gi), v = fp[j] * gp[i]; return num(`Values of f, g, and their derivatives:<br>${tbl(['x', 'f(x)', "f'(x)", 'g(x)', "g'(x)"], xs.map((x, k) => [x, f[k], fp[k], g[k], gp[k]]))}What is (f ∘ g)'(${N(xs[i])})?`, v, "(f ∘ g)'(a) = f'(g(a)) × g'(a).", [
          ['Find g(' + N(xs[i]) + ')', `from the table, g(${N(xs[i])}) = ${N(gi)}`], ["Find f'(g(" + N(xs[i]) + '))', `f'(${N(gi)}) = ${N(fp[j])}`], ["Find g'(" + N(xs[i]) + ')', `g'(${N(xs[i])}) = ${N(gp[i])}`], ['Multiply', `${N(fp[j])} × ${P(gp[i])} = <b>${N(v)}</b>`]]); } },
      ],
    },
    {
      id: 'KE', grade: G, name: 'Derivatives of transcendental functions', icon: 'eˣ', color: '#00b894', ixl: 'H', sg: 'Calculus · Derivatives', km: 'Algebra',
      tip: 'eˣ is the only function (besides its multiples) whose derivative is itself.',
      skills: [
        { id: 'KE1', name: 'Derivatives of sin and cos', gen() { const a = nz(-5, 5), k = nz(1, 4), kind = pick(['sin', 'cos']); const v = kind === 'sin' ? a * k : 0; return num(`f(x) = ${a === 1 ? '' : a === -1 ? '−' : N(a)} ${kind} (${k === 1 ? '' : k}x). What is f'(0)?`, v, "(sin kx)' = k cos kx; (cos kx)' = −k sin kx. cos 0 = 1, sin 0 = 0.", [
          ['Differentiate', kind === 'sin' ? `f'(x) = ${N(a * k)} cos(${k === 1 ? '' : k}x)` : `f'(x) = ${N(-a * k)} sin(${k === 1 ? '' : k}x)`], ['Substitute x = 0', kind === 'sin' ? `${N(a * k)} × cos 0 = <b>${N(v)}</b>` : `${N(-a * k)} × sin 0 = <b>0</b>`]]); } },
        { id: 'KE2', name: 'Exponential derivatives', gen() { const a = nz(-5, 5), k = nz(-4, 4); return num(`f(x) = ${a === 1 ? '' : a === -1 ? '−' : N(a)}e${sup((k === 1 ? '' : k === -1 ? '−' : N(k)) + 'x')}. What is f'(0)?`, a * k, "(e^(kx))' = k e^(kx), and e⁰ = 1.", [
          ['Differentiate', `f'(x) = ${N(a * k)}e${sup((k === 1 ? '' : k === -1 ? '−' : N(k)) + 'x')}`], ['Substitute x = 0', `${N(a * k)} × 1 = <b>${N(a * k)}</b>`]]); } },
        { id: 'KE3', name: 'Derivative of the natural logarithm', gen() { const a = nz(1, 6), b = r(1, 9), x = r(0, 4), den = a * x + b; return num(`f(x) = ln(${lin(a, b)}). What is f'(${x})? (simplest fraction)`, F(a, den), "(ln u)' = u'/u.", [
          ['Differentiate', `f'(x) = ${a}/(${lin(a, b)})`], ['Substitution', `${a}/${den} = <b>${F(a, den)}</b>`]]); } },
      ],
    },
    {
      id: 'KF', grade: G, name: 'Applications of derivatives', icon: '🏔️', color: '#fdcb6e', ixl: 'K, M, O', sg: 'Calculus · Derivatives', km: 'Algebra',
      tip: 'At the top of a hill, the road neither rises nor falls: its derivative is zero.',
      skills: [
        { id: 'KF1', name: 'Velocity and acceleration', gen() { const a = nz(-2, 3), b = r(-6, 6), c = r(-5, 5), d = r(0, 9), t = r(1, 4), acc = Math.random() < 0.4; const v = 3 * a * t * t + 2 * b * t + c, w = 6 * a * t + 2 * b; return num(`The position of an object is s(t) = ${poly([a, b, c, d], 't')} meters. What is the ${acc ? 'acceleration (m/s²)' : 'velocity (m/s)'} at t = ${t}?`, acc ? w : v, "Velocity v = s'(t), acceleration a = v'(t) = s''(t).", acc ? [
          ["s'(t)", `${poly([3 * a, 2 * b, c], 't')}`], ["s''(t)", `${lin(6 * a, 2 * b, 't')}`], ['Substitution', `<b>${N(w)}</b> m/s²`]] : [["v = s'(t)", `${poly([3 * a, 2 * b, c], 't')}`], ['Substitution', `<b>${N(v)}</b> m/s`]]); } },
        { id: 'KF2', name: 'Stationary points', gen() { const a = nz(-3, 3), h = nz(-5, 5), c = r(-9, 9); return num(`At what x does f(x) = ${poly([a, -2 * a * h, c])} reach a stationary point?`, h, "A stationary point occurs when f'(x) = 0.", [
          ["f'(x)", `${lin(2 * a, -2 * a * h)}`], ["f'(x) = 0", `x = <b>${N(h)}</b>`]]); } },
        { id: 'KF3', name: 'Maximum and minimum values', gen() { const p = r(-3, 0), q = r(1, 4), cs = [1, -1.5 * (p + q), 3 * p * q, r(-5, 5)].map((x) => x * 2), kind = pick(['local maximum', 'local minimum']); const x = kind === 'local maximum' ? p : q, v = ev(cs, x); if (p === q) return C.SKILLS.KF3.gen(); return num(`f(x) = ${poly(cs)}. What is the ${kind} of f?`, v, "Find x with f'(x) = 0, then use the second derivative test: f'' < 0 maximum, f'' > 0 minimum.", [
          ["f'(x) = 0", `${poly(der(cs))} = 0 → x = ${N(p)} or x = ${N(q)}`], ["Test f''", `x = ${N(p)}: maximum, x = ${N(q)}: minimum`], ['Value', `f(${N(x)}) = <b>${N(v)}</b>`]]); } },
        { id: 'KF4', name: 'Optimization', gen() { const k = pick([20, 24, 30, 36, 40, 60, 80, 100]); return num(`A ${k * 2} m fence is used to surround a rectangular garden. What is the largest area in m² that can be made?`, (k / 2) ** 2, "Write the area as a function of one variable, then find A'(x) = 0.", [
          ['Model', `p + l = ${k} → L(x) = x(${k} − x) = ${k}x − x²`], ["L'(x) = 0", `${k} − 2x = 0 → x = ${k / 2}`], ['Maximum area', `${k / 2} × ${k / 2} = <b>${(k / 2) ** 2}</b> m²`]], { unit: 'm²' }); } },
      ],
    },
    {
      id: 'KG', grade: G, name: "Second derivatives and L'Hôpital", icon: "f''", color: '#00a8cc', ixl: 'J, L, N', sg: 'Calculus · Derivatives', km: 'Algebra',
      tip: 'The second derivative shows concavity: concave up like a bowl, concave down like a hat.',
      skills: [
        { id: 'KG1', name: 'Second derivatives', gen() { const cs = [nz(-2, 2), r(-4, 4), r(-4, 4), r(-4, 4), r(-4, 4)], x = r(-2, 2), v = ev(der(der(cs)), x); return num(`f(x) = ${poly(cs)}. What is f''(${N(x)})?`, v, 'Differentiate twice.', [
          ["f'(x)", poly(der(cs))], ["f''(x)", poly(der(der(cs)))], ['Substitution', `<b>${N(v)}</b>`]]); } },
        { id: 'KG2', name: 'Inflection points', gen() { const a = nz(-2, 2), h = nz(-4, 4), cs = [a, -3 * a * h, r(-5, 5), r(-5, 5)]; return num(`At what x does f(x) = ${poly(cs)} have an inflection point?`, h, "An inflection point occurs when f''(x) = 0 and the sign of f'' changes.", [
          ["f''(x)", lin(6 * a, -6 * a * h)], ["f''(x) = 0", `x = <b>${N(h)}</b>`]]); } },
        { id: 'KG3', name: "L'Hôpital's rule", gen() { const a = nz(1, 6), b = nz(1, 6), kind = pick(['exp', 'sin']); return num(kind === 'exp' ? `${LIM('x', 0)} ${FR(`e${sup(a + 'x')} − 1`, `${b}x`)} = ? (simplest fraction if needed)` : `${LIM('x', 0)} ${FR(`${b}x`, `sin ${a}x`)} = ? (simplest fraction if needed)`, kind === 'exp' ? F(a, b) : F(b, a), "For the form 0/0, lim f/g = lim f'/g'.", [
          ['Check the form', '0/0'], ['Differentiate the numerator and denominator', kind === 'exp' ? `${a}e${sup(a + 'x')} / ${b}` : `${b} / (${a} cos ${a}x)`], ['Substitute x = 0', `<b>${kind === 'exp' ? F(a, b) : F(b, a)}</b>`]]); } },
      ],
    },
    {
      id: 'KH', grade: G, name: 'Indefinite integrals', icon: '∫', color: '#9b6dff', ixl: 'Q, S', sg: 'Calculus · Integrals', km: 'Algebra',
      tip: 'An integral is the reverse of a derivative: if the derivative of F is f, then ∫f dx = F + C.',
      skills: [
        { id: 'KH1', name: 'Antiderivatives of polynomials', gen() { const a = nz(1, 4), n = r(1, 4), b = nz(-6, 6), c1 = a * (n + 1); const tail = `${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x + C`; const up = (k) => poly([k, ...Array(n + 1).fill(0)]); const ans = `${up(a)} ${tail}`; return pil(`${INT()} (${poly([c1, ...Array(n).fill(0)])} ${b < 0 ? '−' : '+'} ${Math.abs(b)}) dx = ?`, opt(ans, [`${poly([a, ...Array(n).fill(0)])} ${tail}`, `${up(c1)} ${tail}`, `${poly([c1 * n, ...Array(n - 1).fill(0)])} + C`, `${up(a)} + C`]), ans, '∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C. Don\'t forget + C.', [
          ['Raise the exponent, divide by the new exponent', `${c1}x${sup(n)} → ${c1}/${n + 1} x${sup(n + 1)} = ${up(a)}`], ['Integral of a constant', `${N(b)} → ${N(b)}x`], ['Result', `<b>${ans}</b>`]]); } },
        { id: 'KH3', name: 'Simplify first, then integrate',
          // hasil: (k/2)x² + kq x + C
          res(q, k) { const t = k * q; return `${k === 1 ? `x${sup(2)}/2` : k === 2 ? `x${sup(2)}` : `${k / 2}x${sup(2)}`} ${t < 0 ? '−' : '+'} ${Math.abs(t) === 1 ? '' : Math.abs(t)}x + C`; },
          top(p, q, k) { return poly([k, k * (p + q), k * p * q]); },
          line(p, q, k) { return `∫ ${FR(this.top(p, q, k), lin(1, p))} dx = ${this.res(q, k)}`; },
          make(p, q, k) { const f = `(${lin(1, p)})`, s = k === 1 ? '' : k, ans = this.res(q, k), inner = k === 1 ? lin(1, q) : `${k}(${lin(1, q)})`; return pil(`${INT()} ${FR(this.top(p, q, k), lin(1, p))} dx = ?`, opt(ans, [this.res(-q, k), this.res(p, k), `${k === 1 ? 'x' : `${k}x`} ${q < 0 ? '−' : '+'} ${Math.abs(q)} + C`, this.res(q, k * 2)]), ans, 'Fraction integrals feel hard. Factor first, cross out common factors, then integrate.', [['Factor the numerator', FR(`${s}${f}(${lin(1, q)})`, f)], [`Cross out ${f} on top and bottom`, `${FR(`${s}${CX(f)}(${lin(1, q)})`, CX(f))} = ${inner}`], ['Integrate', `<b>${ans}</b>`]], { motion: true }); },
          gen() { const p = nz(-5, 5), q = nz(-6, 6); return C.SKILLS.KH3.make(p, q, pick([1, 2, 4])); } },
        { id: 'KH2', name: 'Initial value problems', gen() { const a = nz(-3, 3), b = r(-5, 5), x0 = r(-2, 2), y0 = r(-9, 9), c = y0 - (a * x0 * x0 + b * x0); return num(`F'(x) = ${lin(2 * a, b)} and F(${N(x0)}) = ${N(y0)}. What is the constant C in F(x) = ${poly([a, b, 0])} + C?`, c, 'Integrate, then substitute the initial condition to find C.', [
          ['Antiderivative', `F(x) = ${poly([a, b, 0])} + C`], ['Substitution', `${N(y0)} = ${N(a * x0 * x0 + b * x0)} + C`], ['C', `<b>${N(c)}</b>`]]); } },
      ],
    },
    {
      id: 'KI', grade: G, name: 'Definite integrals', icon: '▭', color: '#e17055', ixl: 'R, T', sg: 'Calculus · Integrals', km: 'Algebra',
      tip: 'A definite integral finds the area under a curve, like adding many thin rectangles.',
      skills: [
        { id: 'KI1', name: 'Evaluating definite integrals', gen() { const a = nz(-2, 2) * 3, b = nz(-3, 3) * 2, c = r(-4, 4), lo = r(-2, 1), hi = lo + r(1, 3); const Fx = (x) => (a / 3) * x ** 3 + (b / 2) * x * x + c * x, v = Fx(hi) - Fx(lo); return num(`${INT(N(lo), N(hi))} (${poly([a, b, c])}) dx = ?`, v, 'Fundamental Theorem of Calculus: ∫ₐᵇ f(x) dx = F(b) − F(a).', [
          ['Antiderivative', `F(x) = ${poly([a / 3, b / 2, c, 0])}`], ['F(' + N(hi) + ') − F(' + N(lo) + ')', `${N(Fx(hi))} − ${P(Fx(lo))} = <b>${N(v)}</b>`]]); } },
        { id: 'KI2', name: 'Area under a curve', gen() { const k = r(1, 4), hi = r(1, 3) * 3; return num(`What is the area between y = ${k === 1 ? '' : k}x² and the x-axis from x = 0 to x = ${hi}?`, (k * hi ** 3) / 3, 'Area = ∫ f(x) dx when f(x) ≥ 0 on the interval.', [
          ['Integral', `∫₀^${hi} ${k === 1 ? '' : k}x² dx = ${k === 1 ? '' : k + '/'}${k === 1 ? '1/3' : '3'} x³`], ['Calculate', `${k} × ${hi ** 3} / 3 = <b>${N((k * hi ** 3) / 3)}</b>`]]); } },
        { id: 'KI3', name: 'Fundamental Theorem of Calculus part 1', gen() { const a = nz(-4, 4), b = r(-6, 6), x = r(-3, 3); return num(`G(x) = ${INT(0, 'x')} (${lin(a, b, 't')}) dt. What is G'(${N(x)})?`, a * x + b, "d/dx ∫ₐˣ f(t) dt = f(x).", [
          ['Use FTC 1', `G'(x) = ${lin(a, b)}`], ['Substitution', `<b>${N(a * x + b)}</b>`]]); } },
      ],
    },
    {
      id: 'KJ', grade: G, name: 'Integration techniques and applications', icon: '🌀', color: '#16a085', ixl: 'U–W', sg: 'Calculus · Integrals', km: 'Algebra',
      tip: 'The volume of a flower vase can be found by rotating its edge curve around an axis.',
      skills: [
        { id: 'KJ1', name: 'Substitution integrals', gen() { const n = r(2, 3), a = nz(1, 3), b = r(0, 3), lo = 0, hi = 1; const U = (x) => (a * x + b) ** (n + 1) / (a * (n + 1)), v = U(hi) - U(lo); if (Math.abs(v * 12 - Math.round(v * 12)) > 1e-9) return C.SKILLS.KJ1.gen(); return num(`${INT(0, 1)} ${a === 1 && !b ? 'x' : `(${lin(a, b)})`}${sup(n)} dx = ? (simplest fraction if needed)`, F(Math.round(v * 12 * (n + 1) * a), 12 * (n + 1) * a), 'Substitution u = ax + b, du = a dx.', [
          ['Substitution', `u = ${lin(a, b)}, dx = du/${a}`], ['Antiderivative', `(${lin(a, b)})${sup(n + 1)} / ${a * (n + 1)}`], ['Limits of integration', `[${(a + b) ** (n + 1)} − ${b ** (n + 1)}] / ${a * (n + 1)} = <b>${F(Math.round(v * 12 * (n + 1) * a), 12 * (n + 1) * a)}</b>`]]); } },
        { id: 'KJ2', name: 'Volumes of revolution', gen() { const k = r(1, 3), hi = r(1, 3); const v = (k * k * hi ** 3) / 3; return num(`The region under y = ${k === 1 ? '' : k}x from x = 0 to ${hi} is rotated around the x-axis. Its volume is mπ. What is m? (simplest fraction if needed)`, F(k * k * hi ** 3, 3), 'Disk method: V = π ∫ [f(x)]² dx.', [
          ['Square f', `(${k === 1 ? '' : k}x)² = ${k * k === 1 ? '' : k * k}x²`], ['Integral', `π ∫₀^${hi} ${k * k === 1 ? '' : k * k}x² dx = π × ${k * k} × ${hi ** 3}/3`], ['m', `<b>${F(k * k * hi ** 3, 3)}</b>`]]); } },
        { id: 'KJ3', name: 'Growth differential equations', gen() { const y0 = pick([100, 200, 500, 1000]), ln2 = pick([1, 2, 3]), t = ln2 * r(1, 3); return num(`dy/dt = ky with y(0) = ${y0}, and y doubles every ${ln2} hours. What is y at t = ${t} hours?`, y0 * 2 ** (t / ln2), 'The solution of dy/dt = ky is y = y₀eᵏᵗ; with doubling time T: y = y₀ × 2^(t/T).', [
          ['Form of the solution', `y = ${y0} × 2${sup('t/' + ln2)}`], ['Substitution', `${y0} × 2${sup(t / ln2)} = <b>${y0 * 2 ** (t / ln2)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: G, name: 'Calculus', short: 'K', stage: 'SMA', ixl: 'https://www.ixl.com/math/calculus', sg: 'Advanced Mathematics · Calculus' });

  lesson('KA', 'A limit states the value f(x) approaches as x approaches a.', [['Strategy', ['Substitute directly.', 'If 0/0: factor or rationalize.', 'lim(x → 0) sin x / x = 1.'], 'KA2']]);
  lesson('KB', 'f is continuous at a if lim f(x) = f(a).', [['Three conditions', ['f(a) exists.', 'The limit at a exists.', 'The two are equal.'], 'KB1']]);
  lesson('KC', "The derivative f'(a) is the slope of the tangent line at x = a.", [['Definition', ["f'(x) = lim(h → 0) [f(x + h) − f(x)]/h"], 'KC2'], ['Tangent line', ["slope = f'(a)"], 'KC3']]);
  lesson('KD', 'Derivative rules speed up calculation without the limit definition.', [['Rules', ["(xⁿ)' = nxⁿ⁻¹", "(uv)' = u'v + uv'", "(u/v)' = (u'v − uv')/v²", "(f(g(x)))' = f'(g(x)) g'(x)"], 'KD4']]);
  lesson('KE', 'Derivatives of trigonometric, exponential, and logarithmic functions.', [['Formulas', ["(sin x)' = cos x, (cos x)' = −sin x", "(eˣ)' = eˣ", "(ln x)' = 1/x"], 'KE2']]);
  lesson('KF', 'Derivatives are used to find velocity, peaks, and optimal values.', [['Optimization', ['Write the quantity as a function of one variable.', "Find f'(x) = 0.", 'Check for a maximum or minimum.'], 'KF4']]);
  lesson('KG', "The second derivative shows concavity; L'Hôpital solves 0/0 limits.", [["L'Hôpital", ["lim f/g = lim f'/g' for the forms 0/0 or ∞/∞."], 'KG3']]);
  lesson('KH', 'An indefinite integral is an antiderivative.', [['Power rule', ['∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C, n ≠ −1.'], 'KH1']]);
  lesson('KI', 'A definite integral finds the signed area under a curve.', [['Fundamental Theorem of Calculus', ['∫ₐᵇ f(x) dx = F(b) − F(a).', 'd/dx ∫ₐˣ f(t) dt = f(x).'], 'KI1']]);
  lesson('KJ', 'Substitution technique and volume applications.', [['Substitution', ['Choose u = the inner part, replace dx = du/u\'.'], 'KJ1'], ['Volume', ['Disk: V = π∫ f(x)² dx.'], 'KJ2']]);
})();
