/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — latihan berpola untuk SMP dan SMA, tetap satu kartu soal per layar.
 * Sama seperti js/pola.js: satu fokus dikerjakan urut (satu bagian tetap, satu bagian berubah), lalu acak, lalu bentuk lain.
 * Setiap fokus: { label, items, make(item), show(item), forms: [() => soal] }. Hanya keterampilan prosedural; soal cerita dan geometri tetap acak.
 */
(function () {
  const add = (id, fn) => window.METIQ_POLA.addSeries(id, fn);
  const K = () => window.METIQ_CURRICULUM.kit;
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const M = { motion: true };
  const coef = (a, N) => (a === 1 ? '' : a === -1 ? '−' : N(a));

  // Bilangan bulat
  add('7A1', () => { const { N, P, num } = K(); return [3, 5, 8, 4, 7].map((m) => ({
    label: `+ (−${m})`, items: range(-2, 7),
    show: (a) => `${N(a)} + (−${m}) = ${N(a - m)}`,
    make: (a) => num(`${N(a)} + (−${m}) = ?`, a - m, 'Adding a negative number is the same as subtracting.', [['Edit', `${N(a)} − ${m}`], ['Calculate', `<b>${N(a - m)}</b>`]], M),
    forms: [
      () => { const a = R(-4, 9); return num(`? + (−${m}) = ${N(a - m)}`, a, 'Add back the number that was subtracted.', [['Reverse', `${N(a - m)} + ${m}`], ['Result', `<b>${N(a)}</b>`]], M); },
      () => { const a = R(-4, 9); return num(`(−${m}) + ${P(a)} = ?`, a - m, 'The order of addition can be swapped.', [['Swap', `${N(a)} + (−${m})`], ['Calculate', `<b>${N(a - m)}</b>`]], M); },
      () => { const a = R(-4, 9); return num(`${N(a)} − ${m} = ?`, a - m, 'Same as adding (−' + m + ').', [['Calculate', `<b>${N(a - m)}</b>`]], M); },
      () => { const a = R(-4, 9); return num(`${N(a)} − (−${m}) = ?`, a + m, 'Subtracting a negative number is the same as adding.', [['Edit', `${N(a)} + ${m}`], ['Calculate', `<b>${N(a + m)}</b>`]], M); },
    ] })); });

  add('7A2', () => { const { N, P, num } = K(); return [-2, -3, -4, -5, -6].map((n) => ({
    label: `× (${N(n)})`, items: [1, 2, 3, 4, 5, -1, -2, -3, -4, -5],
    show: (k) => `${N(n)} × ${P(k)} = ${N(n * k)}`,
    make: (k) => num(`${N(n)} × ${P(k)} = ?`, n * k, 'Same signs give a positive result; different signs give a negative result.', [['Sign', k < 0 ? 'negative × negative = positive' : 'negative × positive = negative'], ['Calculate', `<b>${N(n * k)}</b>`]], M),
    forms: [
      () => { const k = R(2, 9); return num(`${N(n)} × ? = ${N(n * k)}`, k, 'Divide the result by the known number.', [['Divide', `${N(n * k)} : ${P(n)}`], ['Result', `<b>${k}</b>`]], M); },
      () => { const k = R(2, 9); return num(`${N(n * k)} : ${P(n)} = ?`, k, 'Division is the inverse of multiplication. Negative divided by negative is positive.', [['Remember', `${N(n)} × ${k} = ${N(n * k)}`], ['Result', `<b>${k}</b>`]], M); },
      () => { const k = R(2, 9); return num(`${k} × ${P(n)} = ?`, n * k, 'The order of multiplication can be swapped.', [['Swap', `${N(n)} × ${k}`], ['Calculate', `<b>${N(n * k)}</b>`]], M); },
      () => { const k = R(2, 9); return num(`${N(n)} × ${P(-k)} = ?`, -n * k, 'Negative × negative is positive.', [['Sign', 'positive'], ['Calculate', `<b>${N(-n * k)}</b>`]], M); },
    ] })); });

  // Bentuk aljabar dan persamaan
  add('7E3', () => { const { N, lin, pil, num, opt } = K(); const mk = (k, a, b) => { const ans = lin(k * a, k * b); return pil(`${N(k)}(${lin(a, b)}) = ?`, opt(ans, [lin(k * a, b), lin(a, k * b), lin(k * a, -k * b), lin(k + a, k * b), lin(k * a, k + b)]), ans, 'Multiply the number outside the parentheses by each term inside.', [['x term', `${N(k)} × ${lin(a, 0)} = ${lin(k * a, 0)}`], ['Constant', `${N(k)} × ${N(b)} = ${N(k * b)}`], ['Result', `<b>${ans}</b>`]], M); };
    return [2, 3, 5, -2, -3].map((k) => ({
      label: `${N(k)}( … )`, items: range(1, 6),
      show: (b) => `${N(k)}(${lin(1, b)}) = ${lin(k, k * b)}`,
      make: (b) => mk(k, 1, b),
      forms: [() => mk(k, 2, R(1, 6)), () => mk(k, 1, -R(1, 6)), () => mk(k, 3, -R(1, 6)),
        () => { const b = R(1, 6); return num(`${lin(k, k * b)} = ${N(k)}(x + ?)`, b, 'Divide each term by the number outside the parentheses.', [['Divide the constant', `${N(k * b)} : ${N(k)}`], ['Result', `<b>${b}</b>`]], M); }],
    })); });

  add('7F1', () => { const { N, lin, num } = K(); const mk = (a, b, x) => { const c = a * x + b; return num(`${lin(a, b)} = ${N(c)}. What is x?`, x, 'Move the constant, then divide by the coefficient of x.', [['Move it', `${lin(a, 0)} = ${N(c)} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = ${N(a * x)}`], ['Divide', `x = ${N(a * x)} : ${N(a)} = <b>${N(x)}</b>`]], M); };
    return [[2, 1], [3, 2], [4, -1], [5, 3], [-2, 4]].map(([a, b]) => ({
      label: lin(a, b), items: range(1, 6),
      show: (x) => `${lin(a, b)} = ${N(a * x + b)} → x = ${N(x)}`,
      make: (x) => mk(a, b, x),
      forms: [() => mk(a, b, -R(1, 6)), () => mk(a, b + R(1, 4), R(1, 6)), () => mk(a, -b, R(1, 6)),
        () => { const x = R(2, 6); return num(`If x = ${N(x)}, what is the value of ${lin(a, b)}?`, a * x + b, 'Replace x with its value.', [['Substitution', `${N(a)} × ${N(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`], ['Result', `<b>${N(a * x + b)}</b>`]], M); }],
    })); });

  add('8E1', () => { const { N, P, lin, num } = K(); const mk = (a, b, x) => { const v = a * x + b; return num(`f(x) = ${lin(a, b)}. What is f(${N(x)})?`, v, 'Replace x with its value.', [['Substitution', `${N(a)} × ${P(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`], ['Result', `<b>${N(v)}</b>`]], M); };
    return [[2, 1], [3, -2], [-2, 5], [4, 3], [5, -1]].map(([a, b]) => ({
      label: `f(x) = ${lin(a, b)}`, items: range(0, 6),
      show: (x) => `f(${N(x)}) = ${N(a * x + b)}`,
      make: (x) => mk(a, b, x),
      forms: [() => mk(a, b, -R(1, 6)),
        () => { const x = R(1, 7); return num(`f(x) = ${lin(a, b)}. If f(x) = ${N(a * x + b)}, what is x?`, x, 'Solve the equation.', [['Equations', `${lin(a, b)} = ${N(a * x + b)}`], ['Result', `x = <b>${N(x)}</b>`]], M); },
        () => { const x = R(1, 7); return num(`f(x) = ${lin(a, b)}. What is f(${x + 1}) − f(${x})?`, a, 'When x goes up by 1, the function\'s value changes by the coefficient of x.', [['Calculate', `${N(a * (x + 1) + b)} − ${P(a * x + b)}`], ['Result', `<b>${N(a)}</b>`]], M); },
        () => { const x = R(1, 4); return num(`f(x) = ${lin(a, b)}. What is f(${x}) + f(${x + 1})?`, 2 * a * x + a + 2 * b, 'Calculate each one, then add.', [['Value', `${N(a * x + b)} and ${N(a * (x + 1) + b)}`], ['Result', `<b>${N(2 * a * x + a + 2 * b)}</b>`]], M); }],
    })); });

  // Binomial dan faktorisasi
  add('A1E2', () => { const { N, P, poly, lin, pil, num, opt, sup } = K(); const mk = (a, b) => { const ans = poly([1, a + b, a * b]); return pil(`(${lin(1, a)})(${lin(1, b)}) = ?`, opt(ans, [poly([1, a * b, a + b]), poly([1, a + b, -a * b]), poly([1, a - b, a * b]), poly([1, 0, a * b])]), ans, 'Middle term = sum of the two numbers, constant = their product.', [['Middle term', `${N(a)} + ${P(b)} = ${N(a + b)}`], ['Constant', `${N(a)} × ${P(b)} = ${N(a * b)}`], ['Result', `<b>${ans}</b>`]], M); };
    return [1, 2, 3, 4, 5].map((p) => ({
      label: `(${lin(1, p)})( … )`, items: range(1, 6),
      show: (q) => `(${lin(1, p)})(${lin(1, q)}) = ${poly([1, p + q, p * q])}`,
      make: (q) => mk(p, q),
      forms: [() => mk(-p, R(1, 6)), () => mk(-p, -R(1, 6)), () => mk(p, -R(1, 6)),
        () => { const q = R(1, 6); return num(`(${lin(1, p)})(x + ?) = ${poly([1, p + q, p * q])}`, q, 'Constant = product of the two numbers.', [['Divide', `${p * q} : ${p}`], ['Result', `<b>${q}</b>`]], M); }],
    })); });

  add('A1F1', () => { const { N, poly, lin, pil, num, opt } = K(); const mk = (a, b) => { const ans = `(${lin(1, a)})(${lin(1, b)})`; return pil(`Factor ${poly([1, a + b, a * b])}.`, opt(ans, [`(${lin(1, -a)})(${lin(1, -b)})`, `(${lin(1, a)})(${lin(1, -b)})`, `(${lin(1, -a)})(${lin(1, b)})`, `(${lin(1, a + b)})(${lin(1, 1)})`]), ans, 'Find two numbers: their product is c, their sum is b.', [['Product', N(a * b)], ['Sum', N(a + b)], ['The numbers', `${N(a)} and ${N(b)}`], ['Factors', `<b>${ans}</b>`]], M); };
    return [1, 2, 3, 4, 5].map((p) => ({
      label: `(${lin(1, p)})( … )`, items: range(1, 7).filter((q) => q !== p),
      show: (q) => `${poly([1, p + q, p * q])} = (${lin(1, p)})(${lin(1, q)})`,
      make: (q) => mk(p, q),
      forms: [() => mk(-p, -R(1, 7)), () => mk(-p, R(p + 1, p + 6)),
        () => { const q = R(1, 7); return num(`${poly([1, p + q, p * q])} = (${lin(1, p)})(x + ?)`, q, 'Second number: the constant divided by the first number.', [['Divide', `${p * q} : ${p}`], ['Result', `<b>${q}</b>`]], M); },
        () => { const q = R(1, 7); return num(`${poly([1, -(p + q), p * q])} = (${lin(1, -p)})(x − ?)`, q, 'Negative middle term and positive constant: both numbers are negative.', [['Divide', `${p * q} : ${p}`], ['Result', `<b>${q}</b>`]], M); }],
    })); });

  add('A1F2', () => { const { N, poly, lin, pil, num, opt, sup } = K(); const mk = (a, b) => { const ans = `(${lin(a, b)})(${lin(a, -b)})`; return pil(`Factor ${poly([a * a, 0, -b * b])}.`, opt(ans, [`(${lin(a, b)})${sup(2)}`, `(${lin(a, -b)})${sup(2)}`, `(${lin(a * a, b)})(${lin(1, -b)})`, `(${lin(a, b * b)})(${lin(a, -1)})`]), ans, 'p² − q² = (p + q)(p − q).', [['Identify the squares', `${poly([a * a, 0, 0])} = (${lin(a, 0)})${sup(2)} and ${b * b} = ${b}${sup(2)}`], ['Factors', `<b>${ans}</b>`]], M); };
    return [1, 2, 3].map((a) => ({
      label: `${poly([a * a, 0, 0])} − …`, items: range(1, 8),
      show: (b) => `${poly([a * a, 0, -b * b])} = (${lin(a, b)})(${lin(a, -b)})`,
      make: (b) => mk(a, b),
      forms: [() => mk(a, R(9, 12)),
        () => { const b = R(2, 9); return num(`${poly([a * a, 0, -b * b])} = (${lin(a, b)})(${a === 1 ? '' : a}x − ?)`, b, 'The numbers in both parentheses are the same, with different signs.', [['Square root of the constant', `√${b * b} = ${b}`], ['Result', `<b>${b}</b>`]], M); },
        () => { const b = R(2, 9); return num(`(${lin(a, b)})(${lin(a, -b)}) = ${poly([a * a, 0, 0])} − ?`, b * b, 'The middle terms cancel out.', [['Square', `${b} × ${b}`], ['Result', `<b>${b * b}</b>`]], M); },
        () => { const b = R(2, 9); return num(`What is the value of ${poly([a * a, 0, -b * b])} if x = ${b}?`, (a * a - 1) * b * b, 'Substitute the value of x.', [['Calculate', `${a * a} × ${b * b} − ${b * b}`], ['Result', `<b>${N((a * a - 1) * b * b)}</b>`]], M); }],
    })); });

  // Menyederhanakan pecahan aljabar: mencoret faktor yang sama
  const simp = (p, q) => { const { poly, lin, pil, opt, FR, CX } = K(); const ans = lin(1, q), f = `(${lin(1, p)})`; return pil(`Sederhanakan: ${FR(poly([1, p + q, p * q]), lin(1, p))}`, opt(ans, [lin(1, -q), lin(1, p), lin(1, p + q), lin(1, p * q), lin(1, -p)]), ans, 'Factor the numerator, then cross out the common factor on top and bottom.', [['Factor the numerator', FR(`${f}(${lin(1, q)})`, f)], [`Cross out ${f} on top and bottom`, `${FR(`${CX(f)}(${lin(1, q)})`, CX(f))} = ${ans}`], ['Result', `<b>${ans}</b>`]], M); };
  add('A1F4', () => { const { poly, lin, FR, num, N } = K(); return [1, 2, 3, -1, -2].map((p) => ({
    label: `÷ (${lin(1, p)})`, items: range(1, 6).filter((q) => q !== -p),
    show: (q) => `${FR(poly([1, p + q, p * q]), lin(1, p))} = ${lin(1, q)}`,
    make: (q) => simp(p, q),
    forms: [() => simp(p, -R(1, 6)), () => simp(p, p), () => simp(p, -p),
      () => { const q = R(1, 6), x = R(p > 0 ? 1 : 3, 6); return num(`What is the value of ${FR(poly([1, p + q, p * q]), lin(1, p))} if x = ${x}?`, x + q, 'Simplify first so the calculation is short.', [['Simplify', lin(1, q)], ['Substitution', `${x} + ${q} = <b>${N(x + q)}</b>`]], M); }],
  })); });

  // Pangkat i dan logaritma
  add('A2A1', () => { const { sup, pil } = K(); const mk = (n) => { const m = n % 4, ans = ['1', 'i', '−1', '−i'][m]; return pil(`i${sup(n)} = ?`, ['1', 'i', '−1', '−i'], ans, 'Powers of i repeat every 4: i, −1, −i, 1.', [['Divide the exponent by 4', `${n} = 4 × ${Math.floor(n / 4)} + ${m}`], ['Use the remainder', m ? `i${sup(n)} = i${sup(m)} = <b>${ans}</b>` : `i${sup(n)} = <b>1</b>`]], M); };
    const val = (n) => ['1', 'i', '−1', '−i'][n % 4];
    return [[1, 8], [9, 16], [21, 28]].map(([a, b]) => ({ label: `i${sup(a)}–i${sup(b)}`, items: range(a, b), show: (n) => `i${sup(n)} = ${val(n)}`, make: mk, forms: [() => mk(R(30, 60)), () => mk(R(61, 99)), () => mk(4 * R(10, 25)), () => mk(4 * R(10, 25) + 2)] })); });

  add('A2D1', () => { const { N, sup, num } = K(); const L = (b) => (b === 10 ? 'log' : `<sup>${b}</sup>log`); const mk = (b, k) => { const v = b ** k, vs = k < 0 ? `1/${b ** -k}` : String(v); return num(`${L(b)} ${vs} = ?`, k, 'ᵇlog a = c means bᶜ = a.', [['Write as a power', `${b}${sup('c')} = ${vs}`], ['Find c', `${b}${sup(k)} = ${vs}, so c = <b>${N(k)}</b>`]], M); };
    return [2, 3, 5, 10].map((b) => ({
      label: `${L(b)}`, items: range(0, b === 2 ? 6 : 4),
      show: (k) => `${L(b)} ${b ** k} = ${k}`,
      make: (k) => mk(b, k),
      forms: [() => mk(b, -R(1, 2)),
        () => { const k = R(1, 4); return num(`${L(b)} ? = ${k}`, b ** k, 'Raise the base to the power.', [['Calculate', `${b}${sup(k)}`], ['Result', `<b>${b ** k}</b>`]], M); },
        () => { const k = R(1, 4); return num(`${b}${sup('?')} = ${b ** k}`, k, 'How many times is the base multiplied?', [['Power', `<b>${k}</b>`]], M); },
        () => { const k = R(1, 3), j = R(1, 3); return num(`${L(b)} ${b ** k} + ${L(b)} ${b ** j} = ?`, k + j, 'Evaluate each logarithm.', [['Value', `${k} and ${j}`], ['Result', `<b>${k + j}</b>`]], M); }],
    })); });

  // Limit 0/0: faktor yang sama dicoret
  const limQ = (a, b, k) => { const { N, P, poly, lin, num, LIM, FR, CX } = K(); const f = `(${lin(1, -a)})`, s = k === 1 ? '' : k, v = k * (a - b); return num(`${LIM('x', N(a))} ${FR(poly([k, -k * (a + b), k * a * b]), lin(1, -a))} = ?`, v, 'Substitution gives 0/0: factor, cross out the common factor, then substitute.', [['Factor the numerator', FR(`${s}${f}(${lin(1, -b)})`, f)], [`Cross out ${f} on top and bottom`, `${FR(`${s}${CX(f)}(${lin(1, -b)})`, CX(f))} = ${s}(${lin(1, -b)})`], [`Substitute x = ${N(a)}`, `${k === 1 ? '' : k + ' × '}(${N(a)} − ${P(b)}) = <b>${N(v)}</b>`]], M); };
  const limSeries = (ks) => () => { const { N, poly, lin, FR, LIM, num } = K(); return ks.flatMap((k) => [1, 2, 3, -1, -2].map((a) => ({
    label: `(${lin(1, -a)})`, items: range(1, 7).map((i) => a + i).filter((b) => b !== 0),
    show: (b) => `${LIM('x', N(a))} ${FR(poly([k, -k * (a + b), k * a * b]), lin(1, -a))} = ${N(k * (a - b))}`,
    make: (b) => limQ(a, b, k),
    forms: [() => limQ(a, a - R(1, 5), k), () => limQ(a, a + R(1, 5), k + 1), () => limQ(-a, -a + R(1, 6), k),
      () => { const b = R(1, 6); return num(`${LIM('x', N(a))} (${lin(k, -k * b)}) = ?`, k * (a - b), 'There\'s no 0/0 form, so substitute directly.', [['Substitution', `${k} × (${N(a)} − ${b})`], ['Result', `<b>${N(k * (a - b))}</b>`]], M); }],
  }))); };
  add('PKH2', limSeries([1]));
  add('KA2', limSeries([2, 3]));

  // Turunan dan integral
  const tn = (a, n) => { const { N, sup } = K(); return `${coef(a, N)}x${n === 1 ? '' : sup(n)}`; };
  add('KD1', () => { const { N, P, sup, num } = K(); const mk = (a, n, x) => { const v = a * n * x ** (n - 1); return num(`f(x) = ${tn(a, n)}. What is f'(${N(x)})?`, v, 'The exponent goes down by one, and the old exponent becomes a multiplier.', [['Differentiate', `f'(x) = ${tn(a * n, n - 1)}`], ['Substitution', `${N(a * n)} × ${P(x)}${sup(n - 1)} = <b>${N(v)}</b>`]], M); };
    return [1, 2, 3, -2].map((a) => ({
      label: `${coef(a, N)}xⁿ`, items: range(2, 7),
      show: (n) => `(${tn(a, n)})' = ${tn(a * n, n - 1)}`,
      make: (n) => mk(a, n, 1),
      forms: [() => mk(a, R(2, 5), 2), () => mk(a, R(2, 5), -1),
        () => { const n = R(2, 6), c = R(1, 9); return num(`f(x) = ${tn(a, n)} + ${c}. What is f'(1)?`, a * n, 'The derivative of a constant is 0.', [['Differentiate', `f'(x) = ${tn(a * n, n - 1)}`], ['Result', `<b>${N(a * n)}</b>`]], M); },
        () => { const n = R(2, 6); return num(`(${tn(a, n)})' = ?x${sup(n - 1)}. What is ?`, a * n, 'The multiplier: coefficient × exponent.', [['Multiply', `${N(a)} × ${n}`], ['Result', `<b>${N(a * n)}</b>`]], M); }],
    })); });

  const intQ = (a, n, b) => { const { N, sup, pil, opt, INT } = K(); const c = a * (n + 1), t = b ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x` : '', ans = `${tn(a, n + 1)}${t} + C`; return pil(`${INT()} (${tn(c, n)}${b ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b)}` : ''}) dx = ?`, opt(ans, [`${tn(c, n + 1)}${t} + C`, `${tn(a, n)}${t} + C`, `${tn(c * n, n - 1 || 1)}${t} + C`, `${tn(a + 1, n + 1)}${t} + C`]), ans, 'Inverse of the derivative: raise the exponent by one, then divide by the new exponent.', [['Raise the exponent', `x${sup(n)} → x${sup(n + 1)}`], ['Divide by the new exponent', `${c} : ${n + 1} = ${N(a)}`], ['Result', `<b>${ans}</b>`]], M); };
  add('KH1', () => { const { num, sup, INT, N } = K(); return [1, 2, 3].map((a) => ({
    label: `∫ xⁿ`, items: range(1, 5),
    show: (n) => `∫ ${tn(a * (n + 1), n)} dx = ${tn(a, n + 1)} + C`,
    make: (n) => intQ(a, n, 0),
    forms: [() => intQ(a, R(1, 4), R(1, 6)), () => intQ(a, R(1, 4), -R(1, 6)),
      () => { const n = R(1, 5); return num(`${INT()} x${sup(n)} dx = ${'x'}${sup('?')}/? + C. What's the new exponent?`, n + 1, 'The exponent goes up by one.', [['Add 1', `${n} + 1 = <b>${n + 1}</b>`]], M); },
      () => { const n = R(1, 4); return num(`${INT()} ${tn(a * (n + 1), n)} dx = ?x${sup(n + 1)} + C. What is ?`, a, 'Divide the coefficient by the new exponent.', [['Divide', `${a * (n + 1)} : ${n + 1} = <b>${N(a)}</b>`]], M); }],
  })); });

  add('KH3', () => { const G = window.METIQ_CURRICULUM.SKILLS.KH3; return [1, 2, 3, -1, -2].map((p) => ({
    label: `÷ (x ${p < 0 ? '−' : '+'} ${Math.abs(p)})`, items: range(1, 6).filter((q) => q !== -p),
    show: (q) => G.line(p, q, 1),
    make: (q) => G.make(p, q, 1),
    forms: [() => G.make(p, -R(1, 6), 1), () => G.make(p, R(1, 6), 2), () => G.make(p, R(1, 6), 4), () => G.make(p, -R(1, 6), 2)],
  })); });
})();
