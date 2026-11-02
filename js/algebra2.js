/* Metiq — Aljabar 2 (SMA, Fase F). Cakupan mengikuti IXL Algebra 2:
 * bilangan kompleks, polinomial lanjut, fungsi invers dan komposisi, eksponen dan logaritma,
 * barisan dan deret, trigonometri lingkaran satuan, irisan kerucut, kombinatorika.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, poly, lin, num, pil, opt, lesson, fact, nCr, FR } = C.kit;
  const G = 11;
  const cx = (a, b) => (b === 0 ? N(a) : `${a ? N(a) + ' ' + (b < 0 ? '−' : '+') + ' ' : b < 0 ? '−' : ''}${Math.abs(b) === 1 ? '' : Math.abs(b)}i`);

  const UNITS = [
    {
      id: 'A2A', grade: G, name: 'Bilangan kompleks', icon: '𝑖', color: '#4d96ff', ixl: 'K', sg: 'Fase F · Bilangan', km: 'Bilangan',
      tip: 'i adalah bilangan yang kuadratnya −1; pangkat i berulang setiap 4: i, −1, −i, 1.',
      skills: [
        { id: 'A2A1', name: 'Pangkat bilangan i', gen() { const n = r(5, 60), m = n % 4, ans = ['1', 'i', '−1', '−i'][m]; return pil(`i${sup(n)} = ?`, ['1', 'i', '−1', '−i'], ans, 'Pangkat i berulang setiap 4: i¹ = i, i² = −1, i³ = −i, i⁴ = 1.', [
          ['Bagi pangkat dengan 4', `${n} = 4 × ${Math.floor(n / 4)} + ${m}`], ['Gunakan sisanya', `i${sup(n)} = i${sup(m)} = <b>${ans}</b>`]]); } },
        { id: 'A2A2', name: 'Perkalian bilangan kompleks', gen() { const a = nz(-6, 6), b = nz(-6, 6), c = nz(-6, 6), d = nz(-6, 6), re = a * c - b * d, im = a * d + b * c; return num(`(${cx(a, b)})(${cx(c, d)}) = p + qi. Berapa p?`, re, 'Kalikan seperti binomial, lalu ganti i² dengan −1.', [
          ['Kalikan', `${N(a * c)} + ${P(a * d)}i + ${P(b * c)}i + ${P(b * d)}i²`], ['Ganti i² = −1', `${N(a * c)} − ${P(b * d)} + ${P(im)}i`], ['Bagian real', `p = <b>${N(re)}</b>`]]); } },
        { id: 'A2A3', name: 'Modulus bilangan kompleks', gen() { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]); const sa = pick([1, -1]), sb = pick([1, -1]); return num(`Berapa |${cx(sa * a, sb * b)}|?`, c, '|a + bi| = √(a² + b²).', [
          ['Kuadratkan', `${a}² + ${b}² = ${a * a + b * b}`], ['Akar', `√${c * c} = <b>${c}</b>`]]); } },
      ],
    },
    {
      id: 'A2B', grade: G, name: 'Polinomial lanjut', icon: '🧮', color: '#ff7a59', ixl: 'L–M, Q', sg: 'Fase F · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Teorema sisa: sisa pembagian f(x) oleh (x − a) sama dengan f(a), tanpa perlu membagi panjang.',
      skills: [
        { id: 'A2B1', name: 'Teorema sisa', gen() { const cs = [nz(-3, 3), r(-6, 6), r(-6, 6), r(-9, 9)], a = nz(-3, 3), val = cs.reduce((s, c) => s * a + c, 0); return num(`Berapa sisa pembagian f(x) = ${poly(cs)} oleh (${lin(1, -a)})?`, val, 'Sisa pembagian f(x) oleh (x − a) adalah f(a).', [
          ['Tentukan a', `x ${a < 0 ? '+' : '−'} ${Math.abs(a)} = 0 → x = ${N(a)}`], ['Hitung f(' + N(a) + ')', `${cs.map((c, i) => `${P(c)} × ${P(a)}${sup(3 - i)}`).join(' + ')} = <b>${N(val)}</b>`]]); } },
        { id: 'A2B2', name: 'Faktor polinomial', gen() { const p = nz(-4, 4), q = nz(-4, 4), s = nz(-4, 4); const cs = [1, -(p + q + s), p * q + p * s + q * s, -p * q * s]; const ans = `(${lin(1, -p)})`; return pil(`Manakah faktor dari ${poly(cs)}?`, opt(ans, [`(${lin(1, p)})`, `(${lin(1, p + 1)})`, `(${lin(1, -p - 1)})`, `(${lin(1, p * q)})`].filter((x) => ![p, q, s].some((t) => x === `(${lin(1, -t)})`))), ans, 'Teorema faktor: (x − a) faktor dari f(x) jika f(a) = 0.', [
          ['Uji x = ' + N(p), `f(${N(p)}) = 0`], ['Simpulkan', `<b>${ans}</b> adalah faktor.`]]); } },
        { id: 'A2B3', name: 'Akar-akar polinomial', gen() { const p = nz(-4, 4), q = nz(-4, 4), s = nz(-4, 4); if (new Set([p, q, s]).size < 3) return C.SKILLS.A2B3.gen(); const cs = [1, -(p + q + s), p * q + p * s + q * s, -p * q * s]; return num(`Berapa jumlah semua akar ${poly(cs)} = 0?`, p + q + s, 'Untuk ax³ + bx² + cx + d = 0, jumlah akar = −b/a.', [
          ['Kenali a dan b', `a = 1, b = ${N(cs[1])}`], ['Jumlah akar', `−b/a = <b>${N(p + q + s)}</b>`]]); } },
      ],
    },
    {
      id: 'A2C', grade: G, name: 'Komposisi dan invers fungsi', icon: '🔁', color: '#1fbf9f', ixl: 'U–V', sg: 'Fase F · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Fungsi invers "membatalkan" fungsi asal: jika f mengubah 3 menjadi 7, f⁻¹ mengubah 7 kembali menjadi 3.',
      skills: [
        { id: 'A2C1', name: 'Komposisi fungsi', gen() { const a = nz(-4, 4), b = r(-6, 6), c = nz(-3, 3), d = r(-5, 5), x = r(-4, 4), gx = c * x + d, ans = a * gx + b; return num(`f(x) = ${lin(a, b)} dan g(x) = ${lin(c, d)}. Berapa (f ∘ g)(${N(x)})?`, ans, '(f ∘ g)(x) = f(g(x)): hitung g dulu, lalu masukkan hasilnya ke f.', [
          ['Hitung g(' + N(x) + ')', `${N(c)} × ${P(x)} + ${P(d)} = ${N(gx)}`], ['Hitung f(' + N(gx) + ')', `${N(a)} × ${P(gx)} + ${P(b)} = <b>${N(ans)}</b>`]]); } },
        { id: 'A2C2', name: 'Nilai fungsi invers', gen() { const a = nz(-5, 5), b = r(-9, 9), x = r(-6, 6), y = a * x + b; return num(`f(x) = ${lin(a, b)}. Berapa f${sup('−1')}(${N(y)})?`, x, 'f⁻¹(y) adalah nilai x yang memenuhi f(x) = y.', [
          ['Tulis persamaan', `${lin(a, b)} = ${N(y)}`], ['Selesaikan x', `x = (${N(y)} − ${P(b)}) : ${P(a)} = <b>${N(x)}</b>`]]); } },
        { id: 'A2C3', name: 'Domain fungsi rasional', gen() { const a = nz(-9, 9), k = nz(-5, 5), b = r(-9, 9); return num(`f(x) = ${FR(lin(k, b), lin(1, -a))}. Untuk x berapa f tidak terdefinisi?`, a, 'Pecahan tidak terdefinisi jika penyebutnya nol.', [
          ['Penyebut = 0', `${lin(1, -a)} = 0`], ['Selesaikan', `x = <b>${N(a)}</b>`]]); } },
      ],
    },
    {
      id: 'A2D', grade: G, name: 'Eksponen dan logaritma', icon: '㏒', color: '#e84393', ixl: 'Z–CC', sg: 'Fase F · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Skala Richter dan pH memakai logaritma: naik 1 berarti 10 kali lipat.',
      skills: [
        { id: 'A2D1', name: 'Nilai logaritma', gen() { const b = pick([2, 3, 4, 5, 10]), k = r(-2, 5); const v = b ** k; const vs = k < 0 ? `1/${b ** -k}` : String(v); return num(`${b === 10 ? 'log' : `<sup>${b}</sup>log`} ${vs} = ?`, k, 'ᵇlog a = c artinya bᶜ = a.', [
          ['Tulis sebagai pangkat', `${b}${sup('c')} = ${vs}`], ['Cari c', `${b}${sup(k)} = ${vs}, jadi c = <b>${N(k)}</b>`]]); } },
        { id: 'A2D2', name: 'Sifat logaritma', gen() { const b = pick([2, 3, 10]), x = r(1, 3), y = r(1, 3), kind = pick(['tambah', 'kurang']); const A = b ** (kind === 'tambah' ? x : x + y), B = b ** y, ans = kind === 'tambah' ? x + y : x; const L = b === 10 ? 'log' : `<sup>${b}</sup>log`; return num(`${L} ${A} ${kind === 'tambah' ? '+' : '−'} ${L} ${B} = ?`, ans, kind === 'tambah' ? 'log a + log b = log (a × b).' : 'log a − log b = log (a : b).', [
          ['Gabungkan', `${L} (${A} ${kind === 'tambah' ? '×' : ':'} ${B}) = ${L} ${kind === 'tambah' ? A * B : A / B}`], ['Hitung', `<b>${ans}</b>`]]); } },
        { id: 'A2D3', name: 'Persamaan eksponen', gen() { const b = pick([2, 3, 5]), k = r(2, 6), a = nz(-3, 3), c = r(-4, 4), x = (k - c) / a; if (!Number.isInteger(x)) return C.SKILLS.A2D3.gen(); return num(`${b}${sup(lin(a, c))} = ${b ** k}. Berapa x?`, x, 'Samakan basis, lalu samakan pangkatnya.', [
          ['Tulis ruas kanan dengan basis ' + b, `${b ** k} = ${b}${sup(k)}`], ['Samakan pangkat', `${lin(a, c)} = ${k}`], ['Selesaikan', `x = <b>${N(x)}</b>`]]); } },
      ],
    },
    {
      id: 'A2E', grade: G, name: 'Barisan dan deret', icon: '∑', color: '#00b894', ixl: 'Sequences, series', sg: 'Fase F · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Menabung Rp5.000 lalu menambah Rp1.000 setiap minggu membentuk deret aritmetika.',
      skills: [
        { id: 'A2E1', name: 'Jumlah deret aritmetika', gen() { const a = r(-5, 12), b = nz(-3, 6), n = r(6, 20), un = a + (n - 1) * b, s = (n * (a + un)) / 2; return num(`Berapa jumlah ${n} suku pertama deret ${[0, 1, 2].map((i) => N(a + i * b)).join(' + ')} + ...?`, s, 'Sₙ = n/2 × (a + Uₙ), dengan Uₙ = a + (n − 1)b.', [
          ['Suku ke-' + n, `U${'<sub>' + n + '</sub>'} = ${N(a)} + ${n - 1} × ${P(b)} = ${N(un)}`], ['Jumlah', `${n}/2 × (${N(a)} + ${P(un)}) = <b>${N(s)}</b>`]]); } },
        { id: 'A2E2', name: 'Jumlah deret geometri', gen() { const a = r(1, 5), k = pick([2, 3]), n = r(3, 7), s = (a * (k ** n - 1)) / (k - 1); return num(`Berapa jumlah ${n} suku pertama deret ${[0, 1, 2].map((i) => a * k ** i).join(' + ')} + ...?`, s, 'Sₙ = a(rⁿ − 1)/(r − 1) untuk r > 1.', [
          ['a dan r', `a = ${a}, r = ${k}`], ['Substitusi', `${a}(${k}${sup(n)} − 1)/(${k} − 1) = ${a} × ${k ** n - 1} / ${k - 1} = <b>${s}</b>`]]); } },
        { id: 'A2E3', name: 'Deret geometri tak hingga', gen() { const a = r(1, 12), [p, q] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5]]); return num(`Berapa jumlah deret tak hingga ${a} + ${FH(a * p, q)} + ${FH(a * p * p, q * q)} + ...? (pecahan paling sederhana jika perlu)`, F(a * q, q - p), 'Jika |r| < 1, S∞ = a/(1 − r).', [
          ['Rasio', `r = ${p}/${q}`], ['Substitusi', `${a} / (1 − ${p}/${q}) = ${a} / (${q - p}/${q}) = <b>${F(a * q, q - p)}</b>`]]); } },
      ],
    },
    {
      id: 'A2F', grade: G, name: 'Trigonometri lingkaran satuan', icon: '🔄', color: '#fdcb6e', ixl: 'II–JJ', sg: 'Fase F · Geometri', km: 'Geometri',
      tip: 'Kuadran I semua positif, II hanya sin, III hanya tan, IV hanya cos ("Semua Sindikat Tangan Kosong").',
      skills: [
        { id: 'A2F1', name: 'Derajat dan radian', gen() { const [d, rad] = pick([[30, 'π/6'], [45, 'π/4'], [60, 'π/3'], [90, 'π/2'], [120, '2π/3'], [135, '3π/4'], [150, '5π/6'], [180, 'π'], [210, '7π/6'], [270, '3π/2'], [300, '5π/3'], [360, '2π']]); return pil(`${d}° = ... radian`, opt(rad, ['π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '3π/2', '2π']), rad, '180° = π radian, jadi kalikan derajat dengan π/180.', [
          ['Kalikan', `${d} × π/180 = ${F(d, 180)}π`], ['Sederhanakan', `<b>${rad}</b>`]]); } },
        { id: 'A2F2', name: 'Nilai sin dan cos sudut istimewa', gen() { const T = { 0: ['0', '1'], 30: ['1/2', '½√3'], 45: ['½√2', '½√2'], 60: ['½√3', '1/2'], 90: ['1', '0'], 120: ['½√3', '−1/2'], 135: ['½√2', '−½√2'], 150: ['1/2', '−½√3'], 180: ['0', '−1'], 210: ['−1/2', '−½√3'], 240: ['−½√3', '−1/2'], 270: ['−1', '0'], 300: ['−½√3', '1/2'], 330: ['−1/2', '½√3'] }; const d = +pick(Object.keys(T)), f = pick(['sin', 'cos']), ans = T[d][f === 'sin' ? 0 : 1]; return pil(`${f} ${d}° = ?`, opt(ans, ['0', '1', '−1', '1/2', '−1/2', '½√2', '−½√2', '½√3', '−½√3']), ans, 'Gunakan sudut acuan di kuadran I, lalu tentukan tanda menurut kuadran.', [
          ['Sudut acuan', `${d % 90 === 0 ? 'Sudut pada sumbu' : `acuan ${d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d}°`}`], ['Tanda', `Kuadran ${d <= 90 ? 'I' : d <= 180 ? 'II' : d <= 270 ? 'III' : 'IV'}`], ['Jawab', `<b>${ans}</b>`]]); } },
        { id: 'A2F3', name: 'Tanda fungsi trigonometri per kuadran', gen() { const d = pick([100, 135, 160, 200, 225, 250, 290, 315, 340, 20, 70]), f = pick(['sin', 'cos', 'tan']); const q = d < 90 ? 1 : d < 180 ? 2 : d < 270 ? 3 : 4; const pos = q === 1 || (q === 2 && f === 'sin') || (q === 3 && f === 'tan') || (q === 4 && f === 'cos'); return pil(`Apakah ${f} ${d}° bernilai positif atau negatif?`, ['positif', 'negatif'], pos ? 'positif' : 'negatif', 'Kuadran I: semua positif. II: sin positif. III: tan positif. IV: cos positif.', [
          ['Kuadran', `${d}° ada di kuadran ${['I', 'II', 'III', 'IV'][q - 1]}`], ['Jawab', `<b>${pos ? 'positif' : 'negatif'}</b>`]]); } },
      ],
    },
    {
      id: 'A2G', grade: G, name: 'Irisan kerucut', icon: '🥚', color: '#00a8cc', ixl: 'DD–GG', sg: 'Fase F · Geometri', km: 'Geometri',
      tip: 'Orbit planet berbentuk elips; antena parabola berbentuk parabola.',
      skills: [
        { id: 'A2G1', name: 'Pusat dan jari-jari dari bentuk umum', gen() { const a = r(-6, 6), b = r(-6, 6), rr = r(1, 8), D = -2 * a, E = -2 * b, Fc = a * a + b * b - rr * rr; return num(`x² + y² ${D < 0 ? '−' : '+'} ${Math.abs(D)}x ${E < 0 ? '−' : '+'} ${Math.abs(E)}y ${Fc < 0 ? '−' : '+'} ${Math.abs(Fc)} = 0. Berapa jari-jari lingkaran ini?`, rr, 'Lengkapkan kuadrat: pusat (−D/2, −E/2), r = √(a² + b² − F).', [
          ['Pusat', `(${N(a)}, ${N(b)})`], ['Jari-jari', `√(${a * a} + ${b * b} − ${P(Fc)}) = √${rr * rr} = <b>${rr}</b>`]]); } },
        { id: 'A2G2', name: 'Sumbu elips', gen() { const a = r(3, 9), b = r(2, a - 1), ask = pick(['mayor', 'minor']); return num(`Elips x²/${a * a} + y²/${b * b} = 1. Berapa panjang sumbu ${ask}?`, ask === 'mayor' ? 2 * a : 2 * b, 'Elips x²/a² + y²/b² = 1 (a > b): sumbu mayor 2a, sumbu minor 2b.', [
          ['a dan b', `a = √${a * a} = ${a}, b = √${b * b} = ${b}`], ['Panjang sumbu', `2 × ${ask === 'mayor' ? a : b} = <b>${ask === 'mayor' ? 2 * a : 2 * b}</b>`]]); } },
      ],
    },
    {
      id: 'A2H', grade: G, name: 'Kaidah pencacahan', icon: '🔢', color: '#9b6dff', ixl: 'Counting', sg: 'Fase F · Analisis Data dan Peluang', km: 'Analisis Data dan Peluang',
      tip: 'Berapa cara memilih ketua, sekretaris, dan bendahara dari 10 siswa? Urutan penting → permutasi.',
      skills: [
        { id: 'A2H1', name: 'Faktorial', gen() { const n = r(3, 8), k = r(1, Math.min(3, n - 1)); return num(`${n}! : ${n - k}! = ?`, fact(n) / fact(n - k), 'n! = n × (n − 1) × ... × 1. Pembagian faktorial dapat dicoret.', [
          ['Coret bagian yang sama', `${n}!/${n - k}! = ${Array.from({ length: k }, (_, i) => n - i).join(' × ')}`], ['Hitung', `<b>${fact(n) / fact(n - k)}</b>`]]); } },
        { id: 'A2H2', name: 'Permutasi', gen() { const n = r(5, 10), k = r(2, 3); return num(`Dari ${n} siswa akan dipilih ${k === 2 ? 'ketua dan wakil' : 'ketua, sekretaris, dan bendahara'}. Ada berapa cara?`, fact(n) / fact(n - k), 'Urutan (jabatan) penting → permutasi P(n, k) = n!/(n − k)!.', [
          ['Kenali permutasi', `n = ${n}, k = ${k}`], ['Hitung', `${Array.from({ length: k }, (_, i) => n - i).join(' × ')} = <b>${fact(n) / fact(n - k)}</b>`]]); } },
        { id: 'A2H3', name: 'Kombinasi', gen() { const n = r(5, 12), k = r(2, 4); return num(`Dari ${n} pemain akan dipilih ${k} orang untuk tim (tanpa jabatan). Ada berapa cara?`, nCr(n, k), 'Urutan tidak penting → kombinasi C(n, k) = n!/(k!(n − k)!).', [
          ['Permutasi dulu', `${Array.from({ length: k }, (_, i) => n - i).join(' × ')} = ${fact(n) / fact(n - k)}`], ['Bagi k!', `${fact(n) / fact(n - k)} : ${fact(k)} = <b>${nCr(n, k)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: G, name: 'Aljabar 2', short: 'A2', stage: 'SMA', ixl: 'https://www.ixl.com/math/algebra-2', sg: 'Kurikulum Merdeka Fase F (kelas 11)' });

  lesson('A2A', 'Bilangan kompleks berbentuk a + bi dengan i² = −1.', [['Operasi', ['Jumlahkan bagian real dan imajiner terpisah.', 'Kalikan seperti binomial, ganti i² = −1.'], 'A2A2']]);
  lesson('A2B', 'Teorema sisa dan teorema faktor mempercepat pembagian polinomial.', [['Teorema sisa', ['Sisa f(x) : (x − a) = f(a).'], 'A2B1'], ['Teorema faktor', ['f(a) = 0 ⇔ (x − a) faktor dari f(x).'], 'A2B2']]);
  lesson('A2C', 'Fungsi bisa digabung (komposisi) atau dibalik (invers).', [['Komposisi', ['(f ∘ g)(x) = f(g(x)): kerjakan dari dalam ke luar.'], 'A2C1'], ['Invers', ['Tukar x dan y, lalu selesaikan y.'], 'A2C2']]);
  lesson('A2D', 'Logaritma adalah kebalikan dari eksponen.', [['Definisi', ['ᵇlog a = c ⇔ bᶜ = a.'], 'A2D1'], ['Sifat', ['log ab = log a + log b', 'log a/b = log a − log b', 'log aⁿ = n log a'], 'A2D2']]);
  lesson('A2E', 'Deret adalah jumlah suku-suku barisan.', [['Rumus', ['Aritmetika: Sₙ = n/2 (a + Uₙ).', 'Geometri: Sₙ = a(rⁿ − 1)/(r − 1).', 'Tak hingga: S∞ = a/(1 − r), |r| < 1.'], 'A2E1']]);
  lesson('A2F', 'Lingkaran satuan memperluas trigonometri ke semua sudut.', [['Radian', ['180° = π rad.'], 'A2F1'], ['Kuadran', ['Tentukan sudut acuan, lalu tanda menurut kuadran.'], 'A2F2']]);
  lesson('A2G', 'Irisan kerucut: lingkaran, elips, parabola, hiperbola.', [['Lingkaran', ['x² + y² + Dx + Ey + F = 0: pusat (−D/2, −E/2).'], 'A2G1'], ['Elips', ['x²/a² + y²/b² = 1: sumbu mayor 2a, minor 2b.'], 'A2G2']]);
  lesson('A2H', 'Kaidah pencacahan menghitung banyak susunan tanpa mendaftar semuanya.', [['Permutasi dan kombinasi', ['Urutan penting: P(n, k) = n!/(n − k)!.', 'Urutan tidak penting: C(n, k) = n!/(k!(n − k)!).'], 'A2H3']]);
})();
