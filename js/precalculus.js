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
      id: 'PKA', grade: G, name: 'Fungsi dan transformasi', icon: '↔️', color: '#4d96ff', ixl: 'A–C', sg: 'Fase F · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'f(x) + k menggeser grafik ke atas; f(x − h) menggeser ke kanan.',
      skills: [
        { id: 'PKA1', name: 'Pergeseran grafik', gen() { const h = nz(-6, 6), k = nz(-6, 6); const ans = `${Math.abs(h)} ke ${h > 0 ? 'kanan' : 'kiri'}, ${Math.abs(k)} ke ${k > 0 ? 'atas' : 'bawah'}`; const w = (hh, kk) => `${Math.abs(hh)} ke ${hh > 0 ? 'kanan' : 'kiri'}, ${Math.abs(kk)} ke ${kk > 0 ? 'atas' : 'bawah'}`; return pil(`Grafik y = (x ${h > 0 ? '−' : '+'} ${Math.abs(h)})² ${k > 0 ? '+' : '−'} ${Math.abs(k)} diperoleh dari y = x² dengan menggeser ...`, opt(ans, [w(-h, k), w(h, -k), w(-h, -k)]), ans, 'y = f(x − h) + k: geser h ke kanan (h > 0) dan k ke atas (k > 0).', [
          ['Bentuk di dalam kurung', `x ${h > 0 ? '−' : '+'} ${Math.abs(h)} → h = ${N(h)} → ${Math.abs(h)} ke ${h > 0 ? 'kanan' : 'kiri'}`], ['Konstanta di luar', `${k > 0 ? '+' : '−'}${Math.abs(k)} → ${Math.abs(k)} ke ${k > 0 ? 'atas' : 'bawah'}`]]); } },
        { id: 'PKA2', name: 'Fungsi genap dan ganjil', gen() { const [f, ans] = pick([[poly([1, 0, 0, 0]), 'ganjil'], [poly([1, 0, 0]), 'genap'], [poly([1, 0, -3, 0]), 'ganjil'], [poly([2, 0, 5]), 'genap'], [poly([1, 1, 0]), 'bukan keduanya'], [poly([1, 0, 0, 1]), 'bukan keduanya'], ['cos x', 'genap'], ['sin x', 'ganjil'], ['|x|', 'genap'], [poly([1, 0, 0, 0, -2, 0]), 'ganjil']]); return pil(`f(x) = ${f}. Fungsi ini ...`, ['genap', 'ganjil', 'bukan keduanya'], ans, 'Genap: f(−x) = f(x), simetris terhadap sumbu y. Ganjil: f(−x) = −f(x), simetris terhadap titik asal.', [
          ['Hitung f(−x)', 'Ganti x dengan −x dan bandingkan.'], ['Simpulkan', `<b>${ans}</b>`]]); } },
        { id: 'PKA3', name: 'Komposisi fungsi kuadrat', gen() { const a = nz(-3, 3), b = r(-4, 4), x = r(-3, 3), g = x * x + b, ans = a * g; return num(`f(x) = ${lin(a, 0)} dan g(x) = ${poly([1, 0, b])}. Berapa f(g(${N(x)}))?`, ans, 'Kerjakan dari dalam ke luar.', [
          ['g(' + N(x) + ')', `${P(x)}² + ${P(b)} = ${N(g)}`], ['f(' + N(g) + ')', `${N(a)} × ${P(g)} = <b>${N(ans)}</b>`]]); } },
      ],
    },
    {
      id: 'PKB', grade: G, name: 'Fungsi rasional dan asimtot', icon: '〰️', color: '#ff7a59', ixl: 'G', sg: 'Fase F · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Asimtot adalah garis yang didekati grafik tetapi tidak pernah dicapai.',
      skills: [
        { id: 'PKB1', name: 'Asimtot tegak', gen() { const a = nz(-8, 8), k = nz(-5, 5), b = r(-9, 9); if (k * a + b === 0) return C.SKILLS.PKB1.gen(); return num(`f(x) = ${FR(lin(k, b), lin(1, -a))}. Asimtot tegaknya x = ?`, a, 'Asimtot tegak terjadi di nilai x yang membuat penyebut nol (dan pembilang tidak nol).', [
          ['Penyebut = 0', `${lin(1, -a)} = 0 → x = ${N(a)}`], ['Periksa pembilang', `${N(k)} × ${P(a)} + ${P(b)} = ${N(k * a + b)} ≠ 0`], ['Jawab', `x = <b>${N(a)}</b>`]]); } },
        { id: 'PKB2', name: 'Asimtot datar', gen() { const p = nz(-9, 9), q = nz(1, 6), same = Math.random() < 0.7; const ans = same ? F(p, q) : '0'; return num(`f(x) = ${FR(same ? poly([p, r(-5, 5), r(-5, 5)]) : lin(p, r(-5, 5)), poly([q, r(-5, 5), nz(-5, 5)]))}. Asimtot datarnya y = ? (pecahan paling sederhana jika perlu)`, ans, 'Bandingkan derajat: derajat sama → y = rasio koefisien utama; derajat pembilang lebih kecil → y = 0.', [
          ['Bandingkan derajat', same ? 'Derajat pembilang = derajat penyebut = 2.' : 'Derajat pembilang (1) < derajat penyebut (2).'], ['Jawab', same ? `y = ${p}/${q} = <b>${ans}</b>` : 'y = <b>0</b>']]); } },
      ],
    },
    {
      id: 'PKC', grade: G, name: 'Eksponen dan logaritma lanjut', icon: '📉', color: '#1fbf9f', ixl: 'H–K', sg: 'Fase F · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Bunga majemuk membuat tabungan tumbuh lebih cepat daripada bunga tunggal.',
      skills: [
        { id: 'PKC1', name: 'Persamaan logaritma', gen() { const b = pick([2, 3, 5, 10]), k = r(1, 3), a = nz(1, 4), c = r(-9, 9), x = (b ** k - c) / a; if (!Number.isInteger(x)) return C.SKILLS.PKC1.gen(); const L = b === 10 ? 'log' : `<sup>${b}</sup>log`; return num(`${L} (${lin(a, c)}) = ${k}. Berapa x?`, x, 'ᵇlog A = k ⇔ A = bᵏ.', [
          ['Ubah ke bentuk pangkat', `${lin(a, c)} = ${b}${sup(k)} = ${b ** k}`], ['Selesaikan', `x = <b>${N(x)}</b>`]]); } },
        { id: 'PKC2', name: 'Bunga majemuk', gen() { const m = pick([1000000, 2000000, 5000000]), p = pick([10, 20]), n = r(2, 3), ans = Math.round(m * (1 + p / 100) ** n); return num(`Tabungan Rp${m.toLocaleString('id-ID')} dengan bunga majemuk ${p}% per tahun. Berapa rupiah saldo setelah ${n} tahun? (angkanya saja)`, ans, 'Bunga majemuk: Mₙ = M₀ × (1 + i)ⁿ.', [
          ['Faktor pertumbuhan', `1 + ${p}% = ${N(1 + p / 100)}`], ['Pangkatkan dan kalikan', `${m.toLocaleString('id-ID')} × ${N(1 + p / 100)}${sup(n)} = <b>${ans.toLocaleString('id-ID')}</b>`]], { unit: 'Rp' }); } },
        { id: 'PKC3', name: 'Sifat pangkat pada logaritma', gen() { const b = pick([2, 3]), k = r(2, 4), n = r(2, 5); const L = `<sup>${b}</sup>log`; return num(`${L} (${b ** k})${sup(n)} = ?`, k * n, 'log aⁿ = n × log a.', [
          ['Turunkan pangkat', `${n} × ${L} ${b ** k}`], ['Hitung', `${n} × ${k} = <b>${k * n}</b>`]]); } },
      ],
    },
    {
      id: 'PKD', grade: G, name: 'Identitas dan persamaan trigonometri', icon: '∿', color: '#e84393', ixl: 'R–T', sg: 'Fase F · Geometri', km: 'Geometri',
      tip: 'sin²x + cos²x = 1 adalah teorema Pythagoras pada lingkaran satuan.',
      skills: [
        { id: 'PKD1', name: 'Identitas Pythagoras', gen() { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]); const ask = pick(['cos', 'tan']); return num(`sin x = ${a}/${c} dan x di kuadran I. Berapa ${ask} x? (pecahan)`, ask === 'cos' ? F(b, c) : F(a, b), 'sin²x + cos²x = 1 dan tan x = sin x / cos x.', [
          ['cos x', `cos x = √(1 − (${a}/${c})²) = √(${c * c - a * a}/${c * c}) = ${b}/${c}`], ask === 'cos' ? ['Jawab', `<b>${F(b, c)}</b>`] : ['tan x', `(${a}/${c}) : (${b}/${c}) = <b>${F(a, b)}</b>`]]); } },
        { id: 'PKD2', name: 'Sudut rangkap', gen() { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17]]); const ask = pick(['sin', 'cos']); return num(`sin x = ${a}/${c}, cos x = ${b}/${c}. Berapa ${ask} 2x? (pecahan)`, ask === 'sin' ? F(2 * a * b, c * c) : F(b * b - a * a, c * c), 'sin 2x = 2 sin x cos x; cos 2x = cos²x − sin²x.', ask === 'sin' ? [
          ['Rumus', `2 × ${a}/${c} × ${b}/${c}`], ['Hitung', `${2 * a * b}/${c * c} = <b>${F(2 * a * b, c * c)}</b>`]] : [
          ['Rumus', `(${b}/${c})² − (${a}/${c})²`], ['Hitung', `(${b * b} − ${a * a})/${c * c} = <b>${F(b * b - a * a, c * c)}</b>`]]); } },
        { id: 'PKD3', name: 'Banyak penyelesaian persamaan trigonometri', gen() { const [eq, sols] = pick([['sin x = 1/2', [30, 150]], ['cos x = 1/2', [60, 300]], ['sin x = −1/2', [210, 330]], ['cos x = 0', [90, 270]], ['tan x = 1', [45, 225]], ['sin x = 1', [90]], ['cos x = −1', [180]], ['sin 2x = 0', [0, 90, 180, 270]]]); return num(`Berapa banyak penyelesaian ${eq} untuk 0° ≤ x < 360°?`, sols.length, 'Cari sudut acuan, lalu semua sudut di 0°–360° dengan tanda yang sesuai.', [
          ['Daftar penyelesaian', sols.map((x) => x + '°').join(', ')], ['Hitung', `<b>${sols.length}</b> penyelesaian`]]); } },
      ],
    },
    {
      id: 'PKE', grade: G, name: 'Matriks', icon: '▦', color: '#00b894', ixl: 'Q', sg: 'Fase F · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Matriks seperti tabel: baris dan kolom. Grafik komputer memakai matriks untuk memutar gambar.',
      skills: [
        { id: 'PKE1', name: 'Penjumlahan matriks', gen() { const A = [[r(-9, 9), r(-9, 9)], [r(-9, 9), r(-9, 9)]], B = [[r(-9, 9), r(-9, 9)], [r(-9, 9), r(-9, 9)]], i = r(0, 1), j = r(0, 1); return num(`A = ${mat(A)}, B = ${mat(B)}. Berapa entri baris ${i + 1} kolom ${j + 1} dari A + B?`, A[i][j] + B[i][j], 'Jumlahkan entri yang posisinya sama.', [
          ['Entri yang dijumlah', `${N(A[i][j])} + ${P(B[i][j])}`], ['Hasil', `<b>${N(A[i][j] + B[i][j])}</b>`]]); } },
        { id: 'PKE2', name: 'Perkalian matriks', gen() { const A = [[r(-4, 4), r(-4, 4)], [r(-4, 4), r(-4, 4)]], B = [[r(-4, 4), r(-4, 4)], [r(-4, 4), r(-4, 4)]], i = r(0, 1), j = r(0, 1), v = A[i][0] * B[0][j] + A[i][1] * B[1][j]; return num(`A = ${mat(A)}, B = ${mat(B)}. Berapa entri baris ${i + 1} kolom ${j + 1} dari AB?`, v, 'Entri (i, j) dari AB = baris i dari A "dikali-jumlah" dengan kolom j dari B.', [
          ['Baris ' + (i + 1) + ' × kolom ' + (j + 1), `${P(A[i][0])} × ${P(B[0][j])} + ${P(A[i][1])} × ${P(B[1][j])}`], ['Hasil', `<b>${N(v)}</b>`]]); } },
        { id: 'PKE3', name: 'Determinan matriks 2 × 2', gen() { const a = r(-9, 9), b = r(-9, 9), c = r(-9, 9), d = r(-9, 9); return num(`Berapa determinan ${mat([[a, b], [c, d]])}?`, a * d - b * c, 'det [[a, b], [c, d]] = ad − bc.', [
          ['ad', `${P(a)} × ${P(d)} = ${N(a * d)}`], ['bc', `${P(b)} × ${P(c)} = ${N(b * c)}`], ['ad − bc', `<b>${N(a * d - b * c)}</b>`]]); } },
      ],
    },
    {
      id: 'PKF', grade: G, name: 'Vektor', icon: '➡️', color: '#fdcb6e', ixl: 'Y–Z', sg: 'Fase F · Geometri', km: 'Geometri',
      tip: 'Vektor punya besar dan arah: kecepatan angin 20 km/jam ke timur adalah vektor.',
      skills: [
        { id: 'PKF1', name: 'Panjang vektor', gen() { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]); const three = Math.random() < 0.4; if (three) { const [x, y, z, l] = pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9]]); return num(`Berapa panjang vektor ${vec(x, y, z)}?`, l, '|v| = √(x² + y² + z²).', [['Kuadratkan', `${x * x} + ${y * y} + ${z * z} = ${l * l}`], ['Akar', `<b>${l}</b>`]]); }
          return num(`Berapa panjang vektor ${vec(pick([1, -1]) * a, pick([1, -1]) * b)}?`, c, '|v| = √(x² + y²).', [['Kuadratkan', `${a * a} + ${b * b} = ${c * c}`], ['Akar', `<b>${c}</b>`]]); } },
        { id: 'PKF2', name: 'Hasil kali titik', gen() { const u = [r(-6, 6), r(-6, 6), r(-6, 6)], v = [r(-6, 6), r(-6, 6), r(-6, 6)], d = u[0] * v[0] + u[1] * v[1] + u[2] * v[2]; return num(`u = ${vec(...u)}, v = ${vec(...v)}. Berapa u · v?`, d, 'u · v = u₁v₁ + u₂v₂ + u₃v₃.', [
          ['Kalikan komponen', u.map((x, i) => `${P(x)} × ${P(v[i])}`).join(' + ')], ['Jumlahkan', `<b>${N(d)}</b>`]]); } },
        { id: 'PKF3', name: 'Vektor tegak lurus', gen() { const a = nz(-5, 5), b = nz(-5, 5), c = nz(-5, 5), k = nz(-5, 5), q = (-(a * c)) / b; const kk = (-(a * k)) / b; if (!Number.isInteger(kk)) return C.SKILLS.PKF3.gen(); return num(`u = ${vec(a, b)} dan v = ${vec(k, 'p')} saling tegak lurus. Berapa p?`.replace("'p'", 'p'), kk, 'Dua vektor tegak lurus jika hasil kali titiknya nol.', [
          ['u · v = 0', `${N(a)} × ${P(k)} + ${N(b)} × p = 0`], ['Selesaikan', `p = ${N(-a * k)} : ${P(b)} = <b>${N(kk)}</b>`]]); } },
      ],
    },
    {
      id: 'PKG', grade: G, name: 'Notasi sigma dan induksi', icon: '∑', color: '#00a8cc', ixl: 'AA–BB', sg: 'Fase F · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Gauss kecil menjumlah 1 sampai 100 dengan memasangkan 1 + 100, 2 + 99, dan seterusnya.',
      skills: [
        { id: 'PKG1', name: 'Menghitung notasi sigma', gen() { const a = nz(-4, 5), b = r(-5, 5), n = r(4, 10), s = (a * n * (n + 1)) / 2 + b * n; return num(`Hitung ∑ (${lin(a, b, 'k')}) untuk k = 1 sampai ${n}.`, s, '∑(ak + b) = a × ∑k + b × n, dan ∑k (1 sampai n) = n(n + 1)/2.', [
          ['∑k', `${n} × ${n + 1} : 2 = ${(n * (n + 1)) / 2}`], ['Gabungkan', `${N(a)} × ${(n * (n + 1)) / 2} + ${P(b)} × ${n} = <b>${N(s)}</b>`]]); } },
        { id: 'PKG2', name: 'Jumlah kuadrat', gen() { const n = r(3, 12), s = (n * (n + 1) * (2 * n + 1)) / 6; return num(`Berapa 1² + 2² + ... + ${n}²?`, s, '∑k² = n(n + 1)(2n + 1)/6.', [
          ['Substitusi', `${n} × ${n + 1} × ${2 * n + 1} : 6`], ['Hitung', `<b>${s}</b>`]]); } },
      ],
    },
    {
      id: 'PKH', grade: G, name: 'Pengantar limit', icon: '→', color: '#9b6dff', ixl: 'HH–JJ', sg: 'Matematika Tingkat Lanjut · Kalkulus', km: 'Aljabar',
      tip: 'Limit menanyakan: nilai f(x) mendekati berapa ketika x makin dekat ke a?',
      skills: [
        { id: 'PKH1', name: 'Limit dengan substitusi', gen() { const cs = [nz(-3, 3), r(-5, 5), r(-9, 9)], a = r(-4, 4), v = cs.reduce((s, c) => s * a + c, 0); return num(`${LIM('x', N(a))} (${poly(cs)}) = ?`, v, 'Untuk polinomial, limit di x = a sama dengan f(a).', [
          ['Substitusi x = ' + N(a), `${P(cs[0])} × ${P(a)}² + ${P(cs[1])} × ${P(a)} + ${P(cs[2])}`], ['Hitung', `<b>${N(v)}</b>`]]); } },
        { id: 'PKH2', name: 'Limit bentuk 0/0 dengan faktorisasi', gen() { const a = nz(-6, 6), b = nz(-6, 6); if (a === b) return C.SKILLS.PKH2.gen(); return num(`${LIM('x', N(a))} ${FR(poly([1, -(a + b), a * b]), lin(1, -a))} = ?`, a - b, 'Jika substitusi menghasilkan 0/0, faktorkan lalu coret faktor yang sama.', [
          ['Faktorkan pembilang', `${LIM('x', N(a))} ${FR(`(${lin(1, -a)})(${lin(1, -b)})`, `(${lin(1, -a)})`)}`],
          [`Coret (${lin(1, -a)}) di atas dan di bawah`, `${FR(`${CX(`(${lin(1, -a)})`)}(${lin(1, -b)})`, CX(`(${lin(1, -a)})`))} = ${lin(1, -b)}<br><small>Boleh dicoret karena x mendekati ${N(a)} tetapi tidak sama dengan ${N(a)}, jadi (${lin(1, -a)}) ≠ 0.</small>`], [`Substitusi x = ${N(a)}`, `${N(a)} − ${P(b)} = <b>${N(a - b)}</b>`]]); } },
        { id: 'PKH3', name: 'Limit di tak hingga', gen() { const p = nz(-9, 9), q = nz(1, 7); return num(`${LIM('x', '∞')} ${FR(poly([p, r(-9, 9), r(-9, 9)]), poly([q, r(-9, 9), nz(-9, 9)]))} = ? (pecahan paling sederhana jika perlu)`, F(p, q), 'Bagi pembilang dan penyebut dengan pangkat tertinggi x; suku lain mendekati 0.', [
          ['Pangkat tertinggi sama', 'Hasilnya rasio koefisien x².'], ['Jawab', `${p}/${q} = <b>${F(p, q)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: G, name: 'Prakalkulus', short: 'PK', stage: 'SMA', ixl: 'https://www.ixl.com/math/precalculus', sg: 'Matematika Tingkat Lanjut (kelas 11–12)' });

  lesson('PKA', 'Transformasi menggeser, mencerminkan, atau meregangkan grafik fungsi.', [['Pergeseran', ['f(x − h): geser h ke kanan.', 'f(x) + k: geser k ke atas.'], 'PKA1'], ['Genap dan ganjil', ['Genap: f(−x) = f(x).', 'Ganjil: f(−x) = −f(x).'], 'PKA2']]);
  lesson('PKB', 'Fungsi rasional adalah pembagian dua polinomial.', [['Asimtot', ['Tegak: penyebut = 0.', 'Datar: bandingkan derajat pembilang dan penyebut.'], 'PKB2']]);
  lesson('PKC', 'Logaritma membantu menyelesaikan persamaan yang variabelnya ada di pangkat.', [['Persamaan logaritma', ['ᵇlog A = k ⇔ A = bᵏ.'], 'PKC1'], ['Bunga majemuk', ['M = M₀(1 + i)ⁿ.'], 'PKC2']]);
  lesson('PKD', 'Identitas trigonometri berlaku untuk semua sudut.', [['Identitas', ['sin²x + cos²x = 1', 'sin 2x = 2 sin x cos x', 'cos 2x = cos²x − sin²x'], 'PKD2']]);
  lesson('PKE', 'Matriks adalah susunan bilangan dalam baris dan kolom.', [['Operasi', ['Jumlah: entri seposisi.', 'Kali: baris × kolom.', 'Determinan 2 × 2: ad − bc.'], 'PKE2']]);
  lesson('PKF', 'Vektor ditulis dalam komponen (x, y) atau (x, y, z).', [['Panjang dan hasil kali titik', ['|v| = √(x² + y² + z²).', 'u · v = 0 ⇔ tegak lurus.'], 'PKF2']]);
  lesson('PKG', 'Notasi sigma menyingkat penjumlahan panjang.', [['Rumus', ['∑k = n(n + 1)/2', '∑k² = n(n + 1)(2n + 1)/6'], 'PKG1']]);
  lesson('PKH', 'Limit adalah dasar kalkulus.', [['Menghitung limit', ['Coba substitusi.', 'Jika 0/0, faktorkan dan coret.', 'Di tak hingga: bandingkan pangkat tertinggi.'], 'PKH2']]);
})();
