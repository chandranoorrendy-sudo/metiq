/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Geometri (SMA, Fase E–F). Cakupan mengikuti IXL Geometry:
 * garis sejajar dan sudut, segitiga, kesebangunan, segi banyak, trigonometri segitiga siku-siku,
 * aturan sinus dan cosinus, lingkaran, luas dan volume, geometri koordinat.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, num, pil, opt, lesson } = C.kit;
  const G = 10;
  const pt = (x, y) => `(${N(x)}, ${N(y)})`;

  const UNITS = [
    {
      id: 'GA', grade: G, name: 'Parallel lines and angles', icon: '∥', color: '#4d96ff', ixl: 'C–D', sg: 'Phase E · Geometry', km: 'Geometry',
      tip: 'Railroad rails are an example of parallel lines; the ties are transversals.',
      skills: [
        { id: 'GA1', name: 'Corresponding and alternate angles', gen() { const a = r(25, 155); const [nm, same] = pick([['corresponding', true], ['alternate interior', true], ['alternate exterior', true], ['same-side interior', false]]); const ans = same ? a : 180 - a; return num(`Two parallel lines are cut by a transversal. One angle is ${a}°. How many degrees is the angle ${nm} to it?`, ans, 'With parallel lines: corresponding and alternate angles are equal; same-side angles add up to 180°.', [
          ['Identify the angle pair', same ? `${nm} angles are equal.` : `${nm} angles add up to 180°.`], ['Answer', same ? `<b>${a}°</b>` : `180° − ${a}° = <b>${180 - a}°</b>`]], { unit: '°' }); } },
        { id: 'GA2', name: 'Solving algebraic angles', gen() { const x = r(5, 25), a = r(2, 5), b = r(-10, 20), c = r(1, 4); if (a === c) return C.SKILLS.GA2.gen(); const d = (a - c) * x + b; if (a * x + b <= 0 || a * x + b >= 180) return C.SKILLS.GA2.gen(); return num(`Two corresponding angles are (${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)})° and (${c}x ${d < 0 ? '−' : '+'} ${Math.abs(d)})°. What is x?`, x, 'Corresponding angles are equal, so make an equation and solve.', [
          ['Equations', `${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c}x ${d < 0 ? '−' : '+'} ${Math.abs(d)}`], ['Solve', `${a - c}x = ${N(d - b)} → x = <b>${x}</b>`]]); } },
      ],
    },
    {
      id: 'GB', grade: G, name: 'Triangle properties', icon: '🔺', color: '#ff7a59', ixl: 'F, N', sg: 'Phase E · Geometry', km: 'Geometry',
      tip: 'Try arranging three sticks of 2 cm, 3 cm, and 6 cm: they can\'t make a triangle!',
      skills: [
        { id: 'GB1', name: 'Exterior angles of a triangle', gen() { const a = r(20, 80), b = r(20, 80); return num(`Two interior angles of a triangle are ${a}° and ${b}°. How many degrees is the exterior angle at the third?`, a + b, 'An exterior angle = the sum of the two interior angles not adjacent to it.', [
          ['Use the exterior angle theorem', `${a}° + ${b}° = <b>${a + b}°</b>`]], { unit: '°' }); } },
        { id: 'GB2', name: 'Triangle inequality', gen() { const a = r(3, 12), b = r(3, 12), c = pick([a + b + r(0, 3), Math.abs(a - b) + r(1, Math.max(1, Math.min(a, b) * 2 - 1))]); const ok = a + b > c && a + c > b && b + c > a; return pil(`Can ${a} cm, ${b} cm, and ${c} cm be the sides of a triangle?`, ['Yes, it can', 'No, it can\'t'], ok ? 'Yes, it can' : 'No, it can\'t', 'The sum of any two sides must be greater than the third side.', [
          ['Check the longest side', `Sum of the two shortest sides: ${[a, b, c].sort((x, y) => x - y).slice(0, 2).join(' + ')} = ${[a, b, c].sort((x, y) => x - y).slice(0, 2).reduce((s, x) => s + x, 0)}, longest side ${Math.max(a, b, c)}`], ['Conclude', `<b>${ok ? 'Yes, it can' : 'No, it can\'t'}</b>`]]); } },
        { id: 'GB3', name: 'Types of triangles by sides and angles', gen() { const [a, b, c] = pick([[3, 4, 5], [5, 5, 5], [5, 5, 8], [4, 5, 6], [6, 8, 10], [7, 7, 7], [2, 3, 4], [5, 12, 13], [6, 6, 10], [4, 6, 9]]); const big = Math.max(a, b, c), s2 = a * a + b * b + c * c - big * big; const ans = s2 === big * big ? 'right' : s2 > big * big ? 'acute' : 'obtuse'; return pil(`A triangle with sides ${a}, ${b}, and ${c} is a ... triangle`, ['acute', 'right', 'obtuse'], ans, 'Compare the square of the longest side (c²) with the sum of the squares of the other two (a² + b²): equal → right, smaller → acute, larger → obtuse.', [
          ['Square of the longest side', `${big}² = ${big * big}`], ['Sum of the squares of the other sides', String(s2)], ['Compare', `${s2} ${s2 === big * big ? '=' : s2 > big * big ? '>' : '<'} ${big * big} → <b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'GC', grade: G, name: 'Similarity and congruence', icon: '🔍', color: '#1fbf9f', ixl: 'K–M', sg: 'Phase E · Geometry', km: 'Geometry',
      tip: 'An enlarged photo stays similar to the original: all measurements are multiplied by the same factor.',
      skills: [
        { id: 'GC1', name: 'Side lengths in similar shapes', gen() { const a = r(2, 9), b = r(2, 12), k = pick([2, 3, 4, 1.5]); return num(`Triangle ABC is similar to PQR. AB = ${a} cm, BC = ${b} cm, PQ = ${N(a * k)} cm. How many cm is QR?`, b * k, 'In similar shapes, the ratios of corresponding sides are equal.', [
          ['Scale factor', `PQ ÷ AB = ${N(a * k)} ÷ ${a} = ${N(k)}`], ['Multiply', `QR = ${b} × ${N(k)} = <b>${N(b * k)}</b> cm`]], { unit: 'cm' }); } },
        { id: 'GC2', name: 'Scale factors for area and volume', gen() { const k = r(2, 5), vol = Math.random() < 0.5, base = r(2, 12); return num(`Two similar shapes have a side ratio of 1 : ${k}. ${vol ? 'Volume' : 'Area'} of the small shape is ${base}. What is ${vol ? 'volume' : 'area'} of the large shape?`, base * k ** (vol ? 3 : 2), 'If sides are multiplied by k, area is multiplied by k² and volume by k³.', [
          ['Factors', `${vol ? 'k³' : 'k²'} = ${k}${sup(vol ? 3 : 2)} = ${k ** (vol ? 3 : 2)}`], ['Multiply', `${base} × ${k ** (vol ? 3 : 2)} = <b>${base * k ** (vol ? 3 : 2)}</b>`]]); } },
      ],
    },
    {
      id: 'GD', grade: G, name: 'Polygons', icon: '⬡', color: '#e84393', ixl: 'G, O', sg: 'Phase E · Geometry', km: 'Geometry',
      tip: 'Honeycomb cells are regular hexagons: each interior angle is 120°.',
      skills: [
        { id: 'GD1', name: 'Sum of interior angles of a polygon', gen() { const n = r(5, 12); return num(`How many degrees is the sum of the interior angles of a ${n}-gon?`, (n - 2) * 180, 'An n-gon can be divided into (n − 2) triangles, so its interior angles add up to (n − 2) × 180°.', [
          ['Number of triangles', `${n} − 2 = ${n - 2}`], ['Multiply by 180°', `${n - 2} × 180° = <b>${(n - 2) * 180}°</b>`]], { unit: '°' }); } },
        { id: 'GD2', name: 'Angles of regular polygons', gen() { const n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), luar = Math.random() < 0.5; return num(`How many degrees is each ${luar ? 'exterior' : 'interior'} angle of a regular ${n}-gon?`, luar ? 360 / n : 180 - 360 / n, 'The exterior angles of a polygon always add up to 360°. Interior angle = 180° − exterior angle.', [
          ['Exterior angle', `360° : ${n} = ${N(360 / n)}°`], luar ? ['Answer', `<b>${N(360 / n)}°</b>`] : ['Interior angle', `180° − ${N(360 / n)}° = <b>${N(180 - 360 / n)}°</b>`]], { unit: '°' }); } },
        { id: 'GD3', name: 'Number of diagonals', gen() { const n = r(4, 15); return num(`How many diagonals does a ${n}-gon have?`, (n * (n - 3)) / 2, 'From each vertex, n − 3 diagonals are drawn, and each diagonal is counted twice.', [
          ['Formulas', `n(n − 3)/2`], ['Calculate', `${n} × ${n - 3} : 2 = <b>${(n * (n - 3)) / 2}</b>`]]); } },
      ],
    },
    {
      id: 'GE', grade: G, name: 'Right triangle trigonometry', icon: '📐', color: '#00b894', ixl: 'Q', sg: 'Phase E · Geometry', km: 'Geometry',
      tip: 'SOH CAH TOA: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.',
      skills: [
        { id: 'GE1', name: 'Sin, cos, and tan ratios', gen() { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]); const f = pick(['sin', 'cos', 'tan']); const ans = f === 'sin' ? F(a, c) : f === 'cos' ? F(b, c) : F(a, b); return num(`Right triangle: opposite side of θ = ${a}, adjacent side = ${b}, hypotenuse = ${c}. What is ${f} θ? (fraction)`, ans, 'sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.', [
          ['Choose the sides', f === 'sin' ? `opposite = ${a}, hypotenuse = ${c}` : f === 'cos' ? `adjacent = ${b}, hypotenuse = ${c}` : `opposite = ${a}, adjacent = ${b}`], ['Answer', `${f} θ = <b>${ans}</b>`]]); } },
        { id: 'GE2', name: 'Sides with special angles', gen() { const k = r(2, 12), kind = pick(['30', '60', '45']); if (kind === '45') return num(`An isosceles right triangle has legs of ${k} cm. Its hypotenuse is a√2 cm. What is a?`, k, '45°-45°-90° triangle: side ratio 1 : 1 : √2.', [
          ['Ratio', `leg : hypotenuse = 1 : √2`], ['Hypotenuse', `${k}√2, so a = <b>${k}</b>`]]);
          return num(`A right triangle with a ${kind}° angle has a hypotenuse of ${2 * k} cm. How many cm is the side opposite the 30° angle?`, k, '30°-60°-90° triangle: side ratio 1 : √3 : 2 (opposite 30° : opposite 60° : hypotenuse).', [
          ['Ratio', 'opposite 30° = ½ × hypotenuse'], ['Calculate', `½ × ${2 * k} = <b>${k}</b> cm`]], { unit: 'cm' }); } },
        { id: 'GE3', name: 'Finding sides with trigonometry', gen() { const [deg, sv] = pick([[30, 0.5], [60, 0.866], [45, 0.7071], [53, 0.8], [37, 0.6]]); const c = pick([10, 20, 50, 100]); return num(`A ${c} m ladder leans against a wall, making a ${deg}° angle with the ground. How many meters high is its top? (sin ${deg}° ≈ ${N(sv)}, round to 1 decimal)`, Math.round(c * sv * 10) / 10, 'The height is opposite the angle and the ladder is the hypotenuse: height = hypotenuse × sin θ.', [
          ['Formulas', `height = ${c} × sin ${deg}°`], ['Calculate', `${c} × ${N(sv)} = ${N(c * sv)} ≈ <b>${N(Math.round(c * sv * 10) / 10)}</b> m`]], { unit: 'm' }); } },
      ],
    },
    {
      id: 'GF', grade: G, name: 'Sine and cosine rules', icon: '△', color: '#fdcb6e', ixl: 'R', sg: 'Phase F · Geometry', km: 'Geometry',
      tip: 'The cosine rule extends the Pythagorean theorem to any triangle.',
      skills: [
        { id: 'GF1', name: 'Cosine rule', gen() { const [a, b, deg, cs] = pick([[5, 8, 60, 0.5], [3, 5, 120, -0.5], [8, 3, 60, 0.5], [5, 3, 120, -0.5], [8, 15, 60, 0.5], [7, 8, 120, -0.5], [5, 16, 120, -0.5]]); const c2 = a * a + b * b - 2 * a * b * cs, c = Math.sqrt(c2); return num(`In triangle ABC, b = ${a}, c = ${b}, and angle A = ${deg}°. What is the length of a?`, c, 'a² = b² + c² − 2bc cos A.', [
          ['Substitution', `a² = ${a}² + ${b}² − 2 × ${a} × ${b} × cos ${deg}° = ${a * a} + ${b * b} − ${2 * a * b} × (${N(cs)})`], ['Calculate', `a² = ${c2} → a = <b>${N(c)}</b>`]]); } },
        { id: 'GF2', name: 'Sine rule', gen() { const a = pick([4, 6, 8, 10, 12]); return num(`In triangle ABC, angle A = 30°, angle B = 90°, and a = ${a}. What is the length of b?`, 2 * a, 'a/sin A = b/sin B.', [
          ['Write the sine rule', `${a}/sin 30° = b/sin 90°`], ['Substitution', `${a}/0,5 = b/1`], ['Calculate', `b = <b>${2 * a}</b>`]]); } },
        { id: 'GF3', name: 'Triangle area with sine', gen() { const a = r(2, 12) * 2, b = r(2, 12), [deg, sv] = pick([[30, 0.5], [150, 0.5], [90, 1]]); return num(`Two sides of a triangle, ${a} cm and ${b} cm, enclose an angle of ${deg}°. What is the area in cm²?`, 0.5 * a * b * sv, 'Area = ½ × a × b × sin C (C is the angle between a and b).', [
          ['Substitution', `½ × ${a} × ${b} × sin ${deg}° = ½ × ${a} × ${b} × ${N(sv)}`], ['Calculate', `<b>${N(0.5 * a * b * sv)}</b> cm²`]], { unit: 'cm²' }); } },
      ],
    },
    {
      id: 'GG', grade: G, name: 'Circles', icon: '◯', color: '#00a8cc', ixl: 'W, Y', sg: 'Phase F · Geometry', km: 'Geometry',
      tip: 'Cut a pizza into sectors: the outer edge of each slice is the arc length.',
      skills: [
        { id: 'GG1', name: 'Central and inscribed angles', gen() { const even = r(10, 85) * 2, ask = pick(['inscribed', 'central']); return ask === 'inscribed' ? num(`A central angle on arc AB is ${even}°. How many degrees is an inscribed angle on the same arc?`, even / 2, 'Inscribed angle = ½ × the central angle on the same arc.', [['Halve it', `${even}° : 2 = <b>${even / 2}°</b>`]], { unit: '°' })
          : num(`An inscribed angle on arc AB is ${even / 2}°. How many degrees is the central angle on the same arc?`, even, 'Central angle = 2 × the inscribed angle on the same arc.', [['Double it', `2 × ${even / 2}° = <b>${even}°</b>`]], { unit: '°' }); } },
        { id: 'GG2', name: 'Arc length and sector area', gen() { const rr = pick([7, 14, 21]), deg = pick([30, 45, 60, 90, 120, 180]), luas = Math.random() < 0.5; const ans = luas ? (deg / 360) * (22 / 7) * rr * rr : (deg / 360) * 2 * (22 / 7) * rr; if (Math.abs(ans * 100 - Math.round(ans * 100)) > 1e-9) return C.SKILLS.GG2.gen(); return num(`Radius ${rr} cm, central angle ${deg}°. What is the ${luas ? 'sector area in cm²' : 'arc length in cm'}? (π = 22/7)`, Math.round(ans * 100) / 100, `${luas ? 'Sector area = (θ/360°) × πr²' : 'Arc length = (θ/360°) × 2πr'}.`, [
          ['Part of the circle', `${deg}/360 = ${F(deg, 360)}`], ['Multiply', luas ? `${F(deg, 360)} × 22/7 × ${rr}² = <b>${N(Math.round(ans * 100) / 100)}</b>` : `${F(deg, 360)} × 2 × 22/7 × ${rr} = <b>${N(Math.round(ans * 100) / 100)}</b>`]], { unit: luas ? 'cm²' : 'cm' }); } },
        { id: 'GG3', name: 'Equation of a circle', gen() { const a = r(-6, 6), b = r(-6, 6), rr = r(1, 9), ask = pick(['radius', 'center x', 'center y']); const t = `(x ${a < 0 ? '+' : '−'} ${Math.abs(a)})² + (y ${b < 0 ? '+' : '−'} ${Math.abs(b)})² = ${rr * rr}`; const ans = ask === 'radius' ? rr : ask === 'center x' ? a : b; return num(`Circle ${t}. What is ${ask === 'radius' ? 'its radius' : (ask === 'center x' ? 'abscissa (x)' : 'ordinate (y)') + ' its center'}?`, ans, 'The circle (x − a)² + (y − b)² = r² has center (a, b) and radius r.', [
          ['Compare with the general form', `center ${pt(a, b)}, r² = ${rr * rr}`], ['Answer', `<b>${N(ans)}</b>`]]); } },
      ],
    },
    {
      id: 'GH', grade: G, name: 'Surface area and volume', icon: '🧊', color: '#9b6dff', ixl: 'S–U', sg: 'Phase E · Measurement', km: 'Measurement',
      tip: 'Open up a cardboard box into a net to see its surface area.',
      skills: [
        { id: 'GH1', name: 'Area of a trapezoid', gen() { const a = r(3, 15), b = r(3, 15), t = r(2, 12); return num(`A trapezoid has parallel sides of ${a} cm and ${b} cm, and height ${t} cm. What is its area in cm²?`, ((a + b) * t) / 2, 'Trapezoid area = ½ × (sum of parallel sides) × height.', [
          ['Sum of the parallel sides', `${a} + ${b} = ${a + b}`], ['Multiply by the height, divide by 2', `${a + b} × ${t} ÷ 2 = <b>${N(((a + b) * t) / 2)}</b> cm²`]], { unit: 'cm²' }); } },
        { id: 'GH2', name: 'Surface area of a cuboid', gen() { const p = r(2, 12), l = r(2, 10), t = r(2, 10); return num(`A cuboid measures ${p} cm × ${l} cm × ${t} cm. What is its surface area in cm²?`, 2 * (p * l + p * t + l * t), 'Surface area of a cuboid = 2(lw + lh + wh).', [
          ['Areas of three pairs of faces', `lw = ${p * l}, lh = ${p * t}, wh = ${l * t}`], ['Add, then multiply by 2', `2 × ${p * l + p * t + l * t} = <b>${2 * (p * l + p * t + l * t)}</b> cm²`]], { unit: 'cm²' }); } },
        { id: 'GH3', name: 'Volume of a pyramid', gen() { const s = r(2, 12), t = pick([3, 6, 9, 12]); return num(`A square pyramid has base side ${s} cm and height ${t} cm. What is its volume in cm³?`, (s * s * t) / 3, 'Volume of a pyramid = ⅓ × base area × height.', [
          ['Base area', `${s}² = ${s * s}`], ['Calculate', `⅓ × ${s * s} × ${t} = <b>${N((s * s * t) / 3)}</b> cm³`]], { unit: 'cm³' }); } },
      ],
    },
    {
      id: 'GI', grade: G, name: 'Coordinate geometry', icon: '🗺️', color: '#e17055', ixl: 'E, Y', sg: 'Phase E · Geometry', km: 'Geometry',
      tip: 'The midpoint of two cities on a map = the average of their coordinates.',
      skills: [
        { id: 'GI1', name: 'Midpoint of a segment', gen() { const x1 = r(-9, 9), y1 = r(-9, 9), x2 = x1 + 2 * nz(-5, 5), y2 = y1 + 2 * nz(-5, 5), ans = pt((x1 + x2) / 2, (y1 + y2) / 2); return pil(`The midpoint of the segment from ${pt(x1, y1)} to ${pt(x2, y2)} is ...`, opt(ans, [pt((x2 - x1) / 2, (y2 - y1) / 2), pt(x1 + x2, y1 + y2), pt((x1 + y1) / 2, (x2 + y2) / 2), pt((x1 + x2) / 2, (y1 - y2) / 2)]), ans, 'Midpoint = ((x₁ + x₂)/2, (y₁ + y₂)/2).', [
          ['Average of x', `(${N(x1)} + ${P(x2)}) : 2 = ${N((x1 + x2) / 2)}`], ['Average of y', `(${N(y1)} + ${P(y2)}) : 2 = ${N((y1 + y2) / 2)}`], ['Midpoint', `<b>${ans}</b>`]]); } },
        { id: 'GI2', name: 'Endpoint from midpoint', gen() { const mx = r(-6, 6), my = r(-6, 6), x1 = r(-9, 9), y1 = r(-9, 9), ans = pt(2 * mx - x1, 2 * my - y1); return pil(`M${pt(mx, my)} is the midpoint of AB with A${pt(x1, y1)}. Where is B?`, opt(ans, [pt(mx + x1, my + y1), pt((mx + x1) / 2, (my + y1) / 2), pt(2 * x1 - mx, 2 * y1 - my), pt(mx - x1, my - y1)]), ans, 'B = (2xₘ − x_A, 2yₘ − y_A).', [
          ['x B', `2 × ${P(mx)} − ${P(x1)} = ${N(2 * mx - x1)}`], ['y B', `2 × ${P(my)} − ${P(y1)} = ${N(2 * my - y1)}`], ['B', `<b>${ans}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: G, name: 'Geometry', short: 'G', stage: 'SMA', ixl: 'https://www.ixl.com/math/geometry', sg: 'Kurikulum Merdeka Phase E–F' });

  lesson('GA', 'A transversal crossing two parallel lines forms special angle pairs.', [
    ['Angle pairs', ['Corresponding, alternate interior, alternate exterior: equal.', 'Same-side interior and same-side exterior: add up to 180°.'], 'GA1'],
  ]);
  lesson('GB', 'Triangles have fixed angle and side properties.', [
    ['Exterior angle', ['Exterior angle = sum of the two non-adjacent interior angles.'], 'GB1'], ['Triangle inequality', ['a + b > c for every pair of sides.'], 'GB2'],
  ]);
  lesson('GC', 'Similar shapes have equal angles and proportional sides.', [
    ['Scale factor', ['Sides × k, area × k², volume × k³.'], 'GC2'],
  ]);
  lesson('GD', 'Regular polygons have all sides and angles equal.', [
    ['Angles', ['Sum of interior angles = (n − 2) × 180°.', 'Sum of exterior angles = 360°.'], 'GD2'],
  ]);
  lesson('GE', 'Trigonometry connects angles with side ratios in right triangles.', [
    ['SOH CAH TOA', ['sin θ = opposite/hypotenuse', 'cos θ = adjacent/hypotenuse', 'tan θ = opposite/adjacent'], 'GE1'],
    ['Special angles', ['30°-60°-90°: 1 : √3 : 2', '45°-45°-90°: 1 : 1 : √2'], 'GE2'],
  ]);
  lesson('GF', 'The sine and cosine rules work for any triangle.', [
    ['Cosine rule', ['a² = b² + c² − 2bc cos A'], 'GF1'], ['Sine rule', ['a/sin A = b/sin B = c/sin C'], 'GF2'],
  ]);
  lesson('GG', 'Circles relate central angles, inscribed angles, arcs, and sectors.', [
    ['Angles', ['Inscribed angle = ½ central angle.'], 'GG1'], ['Equation of a circle', ['(x − a)² + (y − b)² = r²'], 'GG3'],
  ]);
  lesson('GH', 'Surface area is the sum of all face areas; volume is the space inside.', [
    ['Formulas', ['Cuboid: A = 2(lw + lh + wh).', 'Pyramid: V = ⅓ × base × height.'], 'GH2'],
  ]);
  lesson('GI', 'Coordinate geometry uses algebra formulas for points and lines.', [
    ['Midpoint', ['((x₁ + x₂)/2, (y₁ + y₂)/2)'], 'GI1'],
  ]);
})();
