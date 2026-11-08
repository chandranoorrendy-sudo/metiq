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
    make: (a) => num(`${N(a)} + (−${m}) = ?`, a - m, 'Menambah bilangan negatif sama dengan mengurangi.', [['Ubah', `${N(a)} − ${m}`], ['Hitung', `<b>${N(a - m)}</b>`]], M),
    forms: [
      () => { const a = R(-4, 9); return num(`? + (−${m}) = ${N(a - m)}`, a, 'Tambahkan kembali bilangan yang dikurangi.', [['Balikkan', `${N(a - m)} + ${m}`], ['Hasil', `<b>${N(a)}</b>`]], M); },
      () => { const a = R(-4, 9); return num(`(−${m}) + ${P(a)} = ?`, a - m, 'Urutan penjumlahan boleh ditukar.', [['Tukar', `${N(a)} + (−${m})`], ['Hitung', `<b>${N(a - m)}</b>`]], M); },
      () => { const a = R(-4, 9); return num(`${N(a)} − ${m} = ?`, a - m, 'Sama dengan menambah (−' + m + ').', [['Hitung', `<b>${N(a - m)}</b>`]], M); },
      () => { const a = R(-4, 9); return num(`${N(a)} − (−${m}) = ?`, a + m, 'Mengurangi bilangan negatif sama dengan menambah.', [['Ubah', `${N(a)} + ${m}`], ['Hitung', `<b>${N(a + m)}</b>`]], M); },
    ] })); });

  add('7A2', () => { const { N, P, num } = K(); return [-2, -3, -4, -5, -6].map((n) => ({
    label: `× (${N(n)})`, items: [1, 2, 3, 4, 5, -1, -2, -3, -4, -5],
    show: (k) => `${N(n)} × ${P(k)} = ${N(n * k)}`,
    make: (k) => num(`${N(n)} × ${P(k)} = ?`, n * k, 'Tanda sama hasilnya positif, tanda beda hasilnya negatif.', [['Tanda', k < 0 ? 'negatif × negatif = positif' : 'negatif × positif = negatif'], ['Hitung', `<b>${N(n * k)}</b>`]], M),
    forms: [
      () => { const k = R(2, 9); return num(`${N(n)} × ? = ${N(n * k)}`, k, 'Bagi hasilnya dengan bilangan yang diketahui.', [['Bagi', `${N(n * k)} : ${P(n)}`], ['Hasil', `<b>${k}</b>`]], M); },
      () => { const k = R(2, 9); return num(`${N(n * k)} : ${P(n)} = ?`, k, 'Pembagian kebalikan perkalian. Negatif dibagi negatif hasilnya positif.', [['Ingat', `${N(n)} × ${k} = ${N(n * k)}`], ['Hasil', `<b>${k}</b>`]], M); },
      () => { const k = R(2, 9); return num(`${k} × ${P(n)} = ?`, n * k, 'Urutan perkalian boleh ditukar.', [['Tukar', `${N(n)} × ${k}`], ['Hitung', `<b>${N(n * k)}</b>`]], M); },
      () => { const k = R(2, 9); return num(`${N(n)} × ${P(-k)} = ?`, -n * k, 'Negatif × negatif hasilnya positif.', [['Tanda', 'positif'], ['Hitung', `<b>${N(-n * k)}</b>`]], M); },
    ] })); });

  // Bentuk aljabar dan persamaan
  add('7E3', () => { const { N, lin, pil, num, opt } = K(); const mk = (k, a, b) => { const ans = lin(k * a, k * b); return pil(`${N(k)}(${lin(a, b)}) = ?`, opt(ans, [lin(k * a, b), lin(a, k * b), lin(k * a, -k * b), lin(k + a, k * b), lin(k * a, k + b)]), ans, 'Kalikan bilangan di luar kurung ke setiap suku di dalam.', [['Suku x', `${N(k)} × ${lin(a, 0)} = ${lin(k * a, 0)}`], ['Konstanta', `${N(k)} × ${N(b)} = ${N(k * b)}`], ['Hasil', `<b>${ans}</b>`]], M); };
    return [2, 3, 5, -2, -3].map((k) => ({
      label: `${N(k)}( … )`, items: range(1, 6),
      show: (b) => `${N(k)}(${lin(1, b)}) = ${lin(k, k * b)}`,
      make: (b) => mk(k, 1, b),
      forms: [() => mk(k, 2, R(1, 6)), () => mk(k, 1, -R(1, 6)), () => mk(k, 3, -R(1, 6)),
        () => { const b = R(1, 6); return num(`${lin(k, k * b)} = ${N(k)}(x + ?)`, b, 'Bagi setiap suku dengan bilangan di luar kurung.', [['Bagi konstanta', `${N(k * b)} : ${N(k)}`], ['Hasil', `<b>${b}</b>`]], M); }],
    })); });

  add('7F1', () => { const { N, lin, num } = K(); const mk = (a, b, x) => { const c = a * x + b; return num(`${lin(a, b)} = ${N(c)}. Berapa x?`, x, 'Pindahkan konstanta, lalu bagi dengan koefisien x.', [['Pindahkan', `${lin(a, 0)} = ${N(c)} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = ${N(a * x)}`], ['Bagi', `x = ${N(a * x)} : ${N(a)} = <b>${N(x)}</b>`]], M); };
    return [[2, 1], [3, 2], [4, -1], [5, 3], [-2, 4]].map(([a, b]) => ({
      label: lin(a, b), items: range(1, 6),
      show: (x) => `${lin(a, b)} = ${N(a * x + b)} → x = ${N(x)}`,
      make: (x) => mk(a, b, x),
      forms: [() => mk(a, b, -R(1, 6)), () => mk(a, b + R(1, 4), R(1, 6)), () => mk(a, -b, R(1, 6)),
        () => { const x = R(2, 6); return num(`Jika x = ${N(x)}, berapa nilai ${lin(a, b)}?`, a * x + b, 'Ganti x dengan nilainya.', [['Substitusi', `${N(a)} × ${N(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`], ['Hasil', `<b>${N(a * x + b)}</b>`]], M); }],
    })); });

  add('8E1', () => { const { N, P, lin, num } = K(); const mk = (a, b, x) => { const v = a * x + b; return num(`f(x) = ${lin(a, b)}. Berapa f(${N(x)})?`, v, 'Ganti x dengan nilainya.', [['Substitusi', `${N(a)} × ${P(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`], ['Hasil', `<b>${N(v)}</b>`]], M); };
    return [[2, 1], [3, -2], [-2, 5], [4, 3], [5, -1]].map(([a, b]) => ({
      label: `f(x) = ${lin(a, b)}`, items: range(0, 6),
      show: (x) => `f(${N(x)}) = ${N(a * x + b)}`,
      make: (x) => mk(a, b, x),
      forms: [() => mk(a, b, -R(1, 6)),
        () => { const x = R(1, 7); return num(`f(x) = ${lin(a, b)}. Jika f(x) = ${N(a * x + b)}, berapa x?`, x, 'Selesaikan persamaannya.', [['Persamaan', `${lin(a, b)} = ${N(a * x + b)}`], ['Hasil', `x = <b>${N(x)}</b>`]], M); },
        () => { const x = R(1, 7); return num(`f(x) = ${lin(a, b)}. Berapa f(${x + 1}) − f(${x})?`, a, 'Saat x naik 1, nilai fungsi berubah sebesar koefisien x.', [['Hitung', `${N(a * (x + 1) + b)} − ${P(a * x + b)}`], ['Hasil', `<b>${N(a)}</b>`]], M); },
        () => { const x = R(1, 4); return num(`f(x) = ${lin(a, b)}. Berapa f(${x}) + f(${x + 1})?`, 2 * a * x + a + 2 * b, 'Hitung satu per satu, lalu jumlahkan.', [['Nilai', `${N(a * x + b)} dan ${N(a * (x + 1) + b)}`], ['Hasil', `<b>${N(2 * a * x + a + 2 * b)}</b>`]], M); }],
    })); });

  // Binomial dan faktorisasi
  add('A1E2', () => { const { N, P, poly, lin, pil, num, opt, sup } = K(); const mk = (a, b) => { const ans = poly([1, a + b, a * b]); return pil(`(${lin(1, a)})(${lin(1, b)}) = ?`, opt(ans, [poly([1, a * b, a + b]), poly([1, a + b, -a * b]), poly([1, a - b, a * b]), poly([1, 0, a * b])]), ans, 'Suku tengah = jumlah kedua bilangan, konstanta = hasil kalinya.', [['Suku tengah', `${N(a)} + ${P(b)} = ${N(a + b)}`], ['Konstanta', `${N(a)} × ${P(b)} = ${N(a * b)}`], ['Hasil', `<b>${ans}</b>`]], M); };
    return [1, 2, 3, 4, 5].map((p) => ({
      label: `(${lin(1, p)})( … )`, items: range(1, 6),
      show: (q) => `(${lin(1, p)})(${lin(1, q)}) = ${poly([1, p + q, p * q])}`,
      make: (q) => mk(p, q),
      forms: [() => mk(-p, R(1, 6)), () => mk(-p, -R(1, 6)), () => mk(p, -R(1, 6)),
        () => { const q = R(1, 6); return num(`(${lin(1, p)})(x + ?) = ${poly([1, p + q, p * q])}`, q, 'Konstanta = hasil kali kedua bilangan.', [['Bagi', `${p * q} : ${p}`], ['Hasil', `<b>${q}</b>`]], M); }],
    })); });

  add('A1F1', () => { const { N, poly, lin, pil, num, opt } = K(); const mk = (a, b) => { const ans = `(${lin(1, a)})(${lin(1, b)})`; return pil(`Faktorkan ${poly([1, a + b, a * b])}.`, opt(ans, [`(${lin(1, -a)})(${lin(1, -b)})`, `(${lin(1, a)})(${lin(1, -b)})`, `(${lin(1, -a)})(${lin(1, b)})`, `(${lin(1, a + b)})(${lin(1, 1)})`]), ans, 'Cari dua bilangan: hasil kalinya c, jumlahnya b.', [['Hasil kali', N(a * b)], ['Jumlah', N(a + b)], ['Bilangannya', `${N(a)} dan ${N(b)}`], ['Faktor', `<b>${ans}</b>`]], M); };
    return [1, 2, 3, 4, 5].map((p) => ({
      label: `(${lin(1, p)})( … )`, items: range(1, 7).filter((q) => q !== p),
      show: (q) => `${poly([1, p + q, p * q])} = (${lin(1, p)})(${lin(1, q)})`,
      make: (q) => mk(p, q),
      forms: [() => mk(-p, -R(1, 7)), () => mk(-p, R(p + 1, p + 6)),
        () => { const q = R(1, 7); return num(`${poly([1, p + q, p * q])} = (${lin(1, p)})(x + ?)`, q, 'Bilangan kedua: konstanta dibagi bilangan pertama.', [['Bagi', `${p * q} : ${p}`], ['Hasil', `<b>${q}</b>`]], M); },
        () => { const q = R(1, 7); return num(`${poly([1, -(p + q), p * q])} = (${lin(1, -p)})(x − ?)`, q, 'Suku tengah negatif dan konstanta positif: kedua bilangan negatif.', [['Bagi', `${p * q} : ${p}`], ['Hasil', `<b>${q}</b>`]], M); }],
    })); });

  add('A1F2', () => { const { N, poly, lin, pil, num, opt, sup } = K(); const mk = (a, b) => { const ans = `(${lin(a, b)})(${lin(a, -b)})`; return pil(`Faktorkan ${poly([a * a, 0, -b * b])}.`, opt(ans, [`(${lin(a, b)})${sup(2)}`, `(${lin(a, -b)})${sup(2)}`, `(${lin(a * a, b)})(${lin(1, -b)})`, `(${lin(a, b * b)})(${lin(a, -1)})`]), ans, 'p² − q² = (p + q)(p − q).', [['Kenali kuadratnya', `${poly([a * a, 0, 0])} = (${lin(a, 0)})${sup(2)} dan ${b * b} = ${b}${sup(2)}`], ['Faktor', `<b>${ans}</b>`]], M); };
    return [1, 2, 3].map((a) => ({
      label: `${poly([a * a, 0, 0])} − …`, items: range(1, 8),
      show: (b) => `${poly([a * a, 0, -b * b])} = (${lin(a, b)})(${lin(a, -b)})`,
      make: (b) => mk(a, b),
      forms: [() => mk(a, R(9, 12)),
        () => { const b = R(2, 9); return num(`${poly([a * a, 0, -b * b])} = (${lin(a, b)})(${a === 1 ? '' : a}x − ?)`, b, 'Bilangan pada kedua kurung sama, tandanya berbeda.', [['Akar konstanta', `√${b * b} = ${b}`], ['Hasil', `<b>${b}</b>`]], M); },
        () => { const b = R(2, 9); return num(`(${lin(a, b)})(${lin(a, -b)}) = ${poly([a * a, 0, 0])} − ?`, b * b, 'Suku tengahnya saling menghapus.', [['Kuadratkan', `${b} × ${b}`], ['Hasil', `<b>${b * b}</b>`]], M); },
        () => { const b = R(2, 9); return num(`Berapa nilai ${poly([a * a, 0, -b * b])} jika x = ${b}?`, (a * a - 1) * b * b, 'Substitusikan nilai x.', [['Hitung', `${a * a} × ${b * b} − ${b * b}`], ['Hasil', `<b>${N((a * a - 1) * b * b)}</b>`]], M); }],
    })); });

  // Menyederhanakan pecahan aljabar: mencoret faktor yang sama
  const simp = (p, q) => { const { poly, lin, pil, opt, FR, CX } = K(); const ans = lin(1, q), f = `(${lin(1, p)})`; return pil(`Sederhanakan: ${FR(poly([1, p + q, p * q]), lin(1, p))}`, opt(ans, [lin(1, -q), lin(1, p), lin(1, p + q), lin(1, p * q), lin(1, -p)]), ans, 'Faktorkan pembilang, lalu coret faktor yang sama di atas dan di bawah.', [['Faktorkan pembilang', FR(`${f}(${lin(1, q)})`, f)], [`Coret ${f} di atas dan di bawah`, `${FR(`${CX(f)}(${lin(1, q)})`, CX(f))} = ${ans}`], ['Hasil', `<b>${ans}</b>`]], M); };
  add('A1F4', () => { const { poly, lin, FR, num, N } = K(); return [1, 2, 3, -1, -2].map((p) => ({
    label: `÷ (${lin(1, p)})`, items: range(1, 6).filter((q) => q !== -p),
    show: (q) => `${FR(poly([1, p + q, p * q]), lin(1, p))} = ${lin(1, q)}`,
    make: (q) => simp(p, q),
    forms: [() => simp(p, -R(1, 6)), () => simp(p, p), () => simp(p, -p),
      () => { const q = R(1, 6), x = R(p > 0 ? 1 : 3, 6); return num(`Berapa nilai ${FR(poly([1, p + q, p * q]), lin(1, p))} jika x = ${x}?`, x + q, 'Sederhanakan dulu supaya hitungannya pendek.', [['Sederhanakan', lin(1, q)], ['Substitusi', `${x} + ${q} = <b>${N(x + q)}</b>`]], M); }],
  })); });

  // Pangkat i dan logaritma
  add('A2A1', () => { const { sup, pil } = K(); const mk = (n) => { const m = n % 4, ans = ['1', 'i', '−1', '−i'][m]; return pil(`i${sup(n)} = ?`, ['1', 'i', '−1', '−i'], ans, 'Pangkat i berulang setiap 4: i, −1, −i, 1.', [['Bagi pangkat dengan 4', `${n} = 4 × ${Math.floor(n / 4)} + ${m}`], ['Gunakan sisanya', m ? `i${sup(n)} = i${sup(m)} = <b>${ans}</b>` : `i${sup(n)} = <b>1</b>`]], M); };
    const val = (n) => ['1', 'i', '−1', '−i'][n % 4];
    return [[1, 8], [9, 16], [21, 28]].map(([a, b]) => ({ label: `i${sup(a)}–i${sup(b)}`, items: range(a, b), show: (n) => `i${sup(n)} = ${val(n)}`, make: mk, forms: [() => mk(R(30, 60)), () => mk(R(61, 99)), () => mk(4 * R(10, 25)), () => mk(4 * R(10, 25) + 2)] })); });

  add('A2D1', () => { const { N, sup, num } = K(); const L = (b) => (b === 10 ? 'log' : `<sup>${b}</sup>log`); const mk = (b, k) => { const v = b ** k, vs = k < 0 ? `1/${b ** -k}` : String(v); return num(`${L(b)} ${vs} = ?`, k, 'ᵇlog a = c artinya bᶜ = a.', [['Tulis sebagai pangkat', `${b}${sup('c')} = ${vs}`], ['Cari c', `${b}${sup(k)} = ${vs}, jadi c = <b>${N(k)}</b>`]], M); };
    return [2, 3, 5, 10].map((b) => ({
      label: `${L(b)}`, items: range(0, b === 2 ? 6 : 4),
      show: (k) => `${L(b)} ${b ** k} = ${k}`,
      make: (k) => mk(b, k),
      forms: [() => mk(b, -R(1, 2)),
        () => { const k = R(1, 4); return num(`${L(b)} ? = ${k}`, b ** k, 'Pangkatkan basisnya.', [['Hitung', `${b}${sup(k)}`], ['Hasil', `<b>${b ** k}</b>`]], M); },
        () => { const k = R(1, 4); return num(`${b}${sup('?')} = ${b ** k}`, k, 'Berapa kali basis dikalikan?', [['Pangkat', `<b>${k}</b>`]], M); },
        () => { const k = R(1, 3), j = R(1, 3); return num(`${L(b)} ${b ** k} + ${L(b)} ${b ** j} = ?`, k + j, 'Hitung masing-masing logaritma.', [['Nilai', `${k} dan ${j}`], ['Hasil', `<b>${k + j}</b>`]], M); }],
    })); });

  // Limit 0/0: faktor yang sama dicoret
  const limQ = (a, b, k) => { const { N, P, poly, lin, num, LIM, FR, CX } = K(); const f = `(${lin(1, -a)})`, s = k === 1 ? '' : k, v = k * (a - b); return num(`${LIM('x', N(a))} ${FR(poly([k, -k * (a + b), k * a * b]), lin(1, -a))} = ?`, v, 'Substitusi menghasilkan 0/0: faktorkan, coret faktor yang sama, lalu substitusi.', [['Faktorkan pembilang', FR(`${s}${f}(${lin(1, -b)})`, f)], [`Coret ${f} di atas dan di bawah`, `${FR(`${s}${CX(f)}(${lin(1, -b)})`, CX(f))} = ${s}(${lin(1, -b)})`], [`Substitusi x = ${N(a)}`, `${k === 1 ? '' : k + ' × '}(${N(a)} − ${P(b)}) = <b>${N(v)}</b>`]], M); };
  const limSeries = (ks) => () => { const { N, poly, lin, FR, LIM, num } = K(); return ks.flatMap((k) => [1, 2, 3, -1, -2].map((a) => ({
    label: `(${lin(1, -a)})`, items: range(1, 7).map((i) => a + i).filter((b) => b !== 0),
    show: (b) => `${LIM('x', N(a))} ${FR(poly([k, -k * (a + b), k * a * b]), lin(1, -a))} = ${N(k * (a - b))}`,
    make: (b) => limQ(a, b, k),
    forms: [() => limQ(a, a - R(1, 5), k), () => limQ(a, a + R(1, 5), k + 1), () => limQ(-a, -a + R(1, 6), k),
      () => { const b = R(1, 6); return num(`${LIM('x', N(a))} (${lin(k, -k * b)}) = ?`, k * (a - b), 'Tidak ada bentuk 0/0, jadi langsung substitusi.', [['Substitusi', `${k} × (${N(a)} − ${b})`], ['Hasil', `<b>${N(k * (a - b))}</b>`]], M); }],
  }))); };
  add('PKH2', limSeries([1]));
  add('KA2', limSeries([2, 3]));

  // Turunan dan integral
  const tn = (a, n) => { const { N, sup } = K(); return `${coef(a, N)}x${n === 1 ? '' : sup(n)}`; };
  add('KD1', () => { const { N, P, sup, num } = K(); const mk = (a, n, x) => { const v = a * n * x ** (n - 1); return num(`f(x) = ${tn(a, n)}. Berapa f'(${N(x)})?`, v, 'Pangkat turun satu, pangkat lama menjadi pengali.', [['Turunkan', `f'(x) = ${tn(a * n, n - 1)}`], ['Substitusi', `${N(a * n)} × ${P(x)}${sup(n - 1)} = <b>${N(v)}</b>`]], M); };
    return [1, 2, 3, -2].map((a) => ({
      label: `${coef(a, N)}xⁿ`, items: range(2, 7),
      show: (n) => `(${tn(a, n)})' = ${tn(a * n, n - 1)}`,
      make: (n) => mk(a, n, 1),
      forms: [() => mk(a, R(2, 5), 2), () => mk(a, R(2, 5), -1),
        () => { const n = R(2, 6), c = R(1, 9); return num(`f(x) = ${tn(a, n)} + ${c}. Berapa f'(1)?`, a * n, 'Turunan konstanta adalah 0.', [['Turunkan', `f'(x) = ${tn(a * n, n - 1)}`], ['Hasil', `<b>${N(a * n)}</b>`]], M); },
        () => { const n = R(2, 6); return num(`(${tn(a, n)})' = ?x${sup(n - 1)}. Berapa ?`, a * n, 'Pengalinya: koefisien × pangkat.', [['Kalikan', `${N(a)} × ${n}`], ['Hasil', `<b>${N(a * n)}</b>`]], M); }],
    })); });

  const intQ = (a, n, b) => { const { N, sup, pil, opt, INT } = K(); const c = a * (n + 1), t = b ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x` : '', ans = `${tn(a, n + 1)}${t} + C`; return pil(`${INT()} (${tn(c, n)}${b ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b)}` : ''}) dx = ?`, opt(ans, [`${tn(c, n + 1)}${t} + C`, `${tn(a, n)}${t} + C`, `${tn(c * n, n - 1 || 1)}${t} + C`, `${tn(a + 1, n + 1)}${t} + C`]), ans, 'Kebalikan turunan: pangkat naik satu, lalu bagi dengan pangkat baru.', [['Naikkan pangkat', `x${sup(n)} → x${sup(n + 1)}`], ['Bagi pangkat baru', `${c} : ${n + 1} = ${N(a)}`], ['Hasil', `<b>${ans}</b>`]], M); };
  add('KH1', () => { const { num, sup, INT, N } = K(); return [1, 2, 3].map((a) => ({
    label: `∫ xⁿ`, items: range(1, 5),
    show: (n) => `∫ ${tn(a * (n + 1), n)} dx = ${tn(a, n + 1)} + C`,
    make: (n) => intQ(a, n, 0),
    forms: [() => intQ(a, R(1, 4), R(1, 6)), () => intQ(a, R(1, 4), -R(1, 6)),
      () => { const n = R(1, 5); return num(`${INT()} x${sup(n)} dx = ${'x'}${sup('?')}/? + C. Berapa pangkat barunya?`, n + 1, 'Pangkat naik satu.', [['Tambah 1', `${n} + 1 = <b>${n + 1}</b>`]], M); },
      () => { const n = R(1, 4); return num(`${INT()} ${tn(a * (n + 1), n)} dx = ?x${sup(n + 1)} + C. Berapa ?`, a, 'Bagi koefisien dengan pangkat baru.', [['Bagi', `${a * (n + 1)} : ${n + 1} = <b>${N(a)}</b>`]], M); }],
  })); });

  add('KH3', () => { const G = window.METIQ_CURRICULUM.SKILLS.KH3; return [1, 2, 3, -1, -2].map((p) => ({
    label: `÷ (x ${p < 0 ? '−' : '+'} ${Math.abs(p)})`, items: range(1, 6).filter((q) => q !== -p),
    show: (q) => G.line(p, q, 1),
    make: (q) => G.make(p, q, 1),
    forms: [() => G.make(p, -R(1, 6), 1), () => G.make(p, R(1, 6), 2), () => G.make(p, R(1, 6), 4), () => G.make(p, -R(1, 6), 2)],
  })); });
})();
