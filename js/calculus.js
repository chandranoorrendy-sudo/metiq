/* Metiq — Kalkulus (SMA akhir / Matematika Tingkat Lanjut). Cakupan mengikuti IXL Calculus:
 * limit dan kontinuitas, turunan dan aturannya, turunan fungsi trigonometri/eksponen/logaritma,
 * aplikasi turunan, turunan kedua dan L'Hôpital, integral tak tentu dan tentu, teknik dan aplikasi integral.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, poly, lin, num, pil, opt, lesson } = C.kit;
  const G = 13;
  const ev = (cs, x) => cs.reduce((s, c) => s * x + c, 0);
  const der = (cs) => { const n = cs.length - 1; return cs.slice(0, -1).map((c, i) => c * (n - i)); };
  const tbl = (head, rows) => `<table class="mtbl"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((row) => `<tr>${row.map((v) => `<td>${N(v)}</td>`).join('')}</tr>`).join('')}</table>`;

  const UNITS = [
    {
      id: 'KA', grade: G, name: 'Limit', icon: '→', color: '#4d96ff', ixl: 'A–D', sg: 'Kalkulus · Limit', km: 'Aljabar',
      tip: 'Bayangkan berjalan mendekati pintu: limit adalah tempat yang kamu tuju, walau belum sampai.',
      skills: [
        { id: 'KA1', name: 'Limit dari tabel', gen() { const L = r(-9, 9), a = r(-3, 5), d = [0.1, 0.01, 0.001]; const vals = (s) => d.map((h, i) => Math.round((L + s * (3 - i) * 0.1 * (i === 2 ? 0.1 : 1)) * 1000) / 1000); const left = vals(-1), right = vals(1); return num(`Tabel nilai f(x) di sekitar x = ${N(a)}:<br>${tbl(['x', ...d.map((h) => N(a - h)), ...d.slice().reverse().map((h) => N(a + h))], [['f(x)', ...left, ...right.slice().reverse()]])}Berapa lim(x → ${N(a)}) f(x)?`, L, 'Lihat nilai f(x) ketika x makin dekat ke a dari kiri dan kanan.', [
          ['Dari kiri', `f(x) mendekati ${N(L)}`], ['Dari kanan', `f(x) mendekati ${N(L)}`], ['Kedua sisi sama', `limitnya <b>${N(L)}</b>`]]); } },
        { id: 'KA2', name: 'Limit bentuk 0/0', gen() { const a = nz(-5, 5), b = nz(-5, 5), k = nz(1, 3); if (a === b) return C.SKILLS.KA2.gen(); return num(`lim(x → ${N(a)}) (${poly([k, -k * (a + b), k * a * b])}) / (${lin(1, -a)}) = ?`, k * (a - b), 'Substitusi menghasilkan 0/0: faktorkan, coret faktor (x − a), lalu substitusi.', [
          ['Faktorkan', `${k === 1 ? '' : k}(${lin(1, -a)})(${lin(1, -b)})`], ['Coret', `${k === 1 ? '' : k + '('}${lin(1, -b)}${k === 1 ? '' : ')'}`], ['Substitusi', `${k === 1 ? '' : k + ' × '}(${N(a)} − ${P(b)}) = <b>${N(k * (a - b))}</b>`]]); } },
        { id: 'KA3', name: 'Limit trigonometri', gen() { const a = nz(1, 9), b = nz(1, 9); return num(`lim(x → 0) sin(${a}x) / (${b}x) = ? (pecahan paling sederhana jika perlu)`, F(a, b), 'lim(x → 0) sin(ax)/(bx) = a/b, karena lim sin u / u = 1.', [
          ['Tulis ulang', `(${a}/${b}) × sin(${a}x)/(${a}x)`], ['Gunakan lim sin u/u = 1', `${a}/${b} × 1 = <b>${F(a, b)}</b>`]]); } },
        { id: 'KA4', name: 'Limit di tak hingga', gen() { const deg = pick(['sama', 'atas', 'bawah']), p = nz(-6, 6), q = nz(1, 6); const ans = deg === 'sama' ? F(p, q) : deg === 'bawah' ? '0' : null; if (deg === 'atas') return pil(`lim(x → ∞) (${poly([p, 0, 0, 1])}) / (${poly([q, 0, 1])}) = ?`, ['∞', '−∞', '0', F(p, q)], p > 0 ? '∞' : '−∞', 'Jika derajat pembilang lebih besar, limitnya tak hingga (tandanya mengikuti koefisien utama).', [
          ['Bandingkan derajat', 'pembilang 3 > penyebut 2'], ['Tanda', `koefisien ${p > 0 ? 'positif → ∞' : 'negatif → −∞'}`]]);
          return num(`lim(x → ∞) (${deg === 'sama' ? poly([p, 3, 0]) : lin(p, 3)}) / (${poly([q, 0, 1])}) = ? (pecahan paling sederhana jika perlu)`, ans, 'Bandingkan derajat pembilang dan penyebut.', [
          ['Bandingkan derajat', deg === 'sama' ? 'sama (2) → rasio koefisien utama' : 'pembilang lebih kecil → 0'], ['Jawab', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'KB', grade: G, name: 'Kontinuitas', icon: '〰', color: '#ff7a59', ixl: 'E', sg: 'Kalkulus · Limit', km: 'Aljabar',
      tip: 'Fungsi kontinu bisa digambar tanpa mengangkat pensil.',
      skills: [
        { id: 'KB1', name: 'Membuat fungsi sepotong kontinu', gen() { const a = r(-3, 4), m = nz(-4, 4), c = r(-6, 6), n = nz(-3, 3), left = m * a + c, k = left - n * a; return num(`f(x) = ${lin(m, c)} untuk x < ${N(a)}, dan f(x) = ${lin(n, 0)} + k untuk x ≥ ${N(a)}. Agar f kontinu di x = ${N(a)}, berapa k?`, k, 'Kontinu di a berarti limit kiri = limit kanan = f(a).', [
          ['Limit kiri', `${N(m)} × ${P(a)} + ${P(c)} = ${N(left)}`], ['Limit kanan', `${N(n)} × ${P(a)} + k = ${N(n * a)} + k`], ['Samakan', `k = ${N(left)} − ${P(n * a)} = <b>${N(k)}</b>`]]); } },
        { id: 'KB2', name: 'Jenis diskontinuitas', gen() { const [f, ans] = pick([['(x² − 4)/(x − 2) di x = 2', 'dapat dihapus (lubang)'], ['1/(x − 3) di x = 3', 'tak hingga (asimtot tegak)'], ['⌊x⌋ (bilangan bulat terbesar) di x = 1', 'loncatan'], ['(x² − 9)/(x + 3) di x = −3', 'dapat dihapus (lubang)'], ['|x|/x di x = 0', 'loncatan'], ['1/x² di x = 0', 'tak hingga (asimtot tegak)']]); return pil(`Jenis diskontinuitas f(x) = ${f} adalah ...`, ['dapat dihapus (lubang)', 'loncatan', 'tak hingga (asimtot tegak)'], ans, 'Lubang: limit ada tetapi f(a) tidak ada/berbeda. Loncatan: limit kiri ≠ kanan. Tak hingga: f(x) membesar tanpa batas.', [
          ['Periksa limit kiri dan kanan', 'Bandingkan, lalu periksa apakah nilainya hingga.'], ['Simpulkan', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'KC', grade: G, name: 'Pengantar turunan', icon: '📐', color: '#1fbf9f', ixl: 'F', sg: 'Kalkulus · Turunan', km: 'Aljabar',
      tip: 'Speedometer motor menunjukkan turunan jarak terhadap waktu: kecepatan sesaat.',
      skills: [
        { id: 'KC1', name: 'Laju perubahan rata-rata', gen() { const cs = [nz(-3, 3), r(-5, 5), r(-5, 5)], a = r(-3, 2), b = a + r(1, 4), v = (ev(cs, b) - ev(cs, a)) / (b - a); return num(`f(x) = ${poly(cs)}. Berapa laju perubahan rata-rata f dari x = ${N(a)} sampai x = ${N(b)}?`, v, 'Laju perubahan rata-rata = (f(b) − f(a)) / (b − a), yaitu gradien garis potong.', [
          ['f(' + N(a) + ') dan f(' + N(b) + ')', `${N(ev(cs, a))} dan ${N(ev(cs, b))}`], ['Bagi', `(${N(ev(cs, b))} − ${P(ev(cs, a))}) / ${b - a} = <b>${N(v)}</b>`]]); } },
        { id: 'KC2', name: 'Turunan dengan definisi limit', gen() { const a = nz(-3, 3), b = r(-6, 6), x = r(-4, 4), v = 2 * a * x + b; return num(`f(x) = ${poly([a, b, 0])}. Dengan f'(x) = lim(h → 0) [f(x + h) − f(x)]/h, berapa f'(${N(x)})?`, v, "f'(x) = lim(h → 0) [f(x + h) − f(x)] / h.", [
          ['Selisih', `f(x + h) − f(x) = ${N(2 * a)}xh + ${P(a)}h² + ${P(b)}h`], ['Bagi h lalu h → 0', `f'(x) = ${lin(2 * a, b)}`], ['Substitusi', `f'(${N(x)}) = <b>${N(v)}</b>`]]); } },
        { id: 'KC3', name: 'Gradien garis singgung', gen() { const cs = [nz(-2, 2), r(-4, 4), r(-4, 4), r(-5, 5)], x = r(-2, 2), v = ev(der(cs), x); return num(`Berapa gradien garis singgung kurva y = ${poly(cs)} di x = ${N(x)}?`, v, "Gradien garis singgung di x = a adalah f'(a).", [
          ['Turunkan', `y' = ${poly(der(cs))}`], ['Substitusi', `y'(${N(x)}) = <b>${N(v)}</b>`]]); } },
      ],
    },
    {
      id: 'KD', grade: G, name: 'Aturan turunan', icon: "f'", color: '#e84393', ixl: 'G–I', sg: 'Kalkulus · Turunan', km: 'Aljabar',
      tip: 'Aturan rantai: turunkan "luar" dulu, lalu kalikan dengan turunan "dalam".',
      skills: [
        { id: 'KD1', name: 'Aturan pangkat', gen() { const a = nz(-5, 6), n = r(2, 7), x = pick([-2, -1, 1, 2]); const v = a * n * x ** (n - 1); return num(`f(x) = ${a === 1 ? '' : a === -1 ? '−' : N(a)}x${sup(n)}. Berapa f'(${N(x)})?`, v, "Aturan pangkat: (axⁿ)' = a × n × xⁿ⁻¹.", [
          ['Turunkan', `f'(x) = ${N(a * n)}x${sup(n - 1)}`], ['Substitusi', `${N(a * n)} × ${P(x)}${sup(n - 1)} = <b>${N(v)}</b>`]]); } },
        { id: 'KD2', name: 'Aturan perkalian', gen() { const a = nz(-4, 4), b = r(-5, 5), c = nz(-4, 4), d = r(-5, 5), x = r(-3, 3); const u = a * x + b, w = c * x * x + d, v = a * w + u * 2 * c * x; return num(`f(x) = (${lin(a, b)})(${poly([c, 0, d])}). Berapa f'(${N(x)})?`, v, "(uv)' = u'v + uv'.", [
          ['u, v dan turunannya', `u = ${lin(a, b)}, u' = ${N(a)}; v = ${poly([c, 0, d])}, v' = ${lin(2 * c, 0)}`], ['Nilai di x = ' + N(x), `u = ${N(u)}, u' = ${N(a)}, v = ${N(w)}, v' = ${N(2 * c * x)}`], ["u'v + uv'", `${N(a)} × ${P(w)} + ${P(u)} × ${P(2 * c * x)} = <b>${N(v)}</b>`]]); } },
        { id: 'KD3', name: 'Aturan pembagian', gen() { const a = nz(-4, 4), b = r(-5, 5), c = nz(1, 3), d = r(-5, 5), x = r(-3, 3), den = c * x + d; if (!den || a * d === b * c) return C.SKILLS.KD3.gen(); const num1 = a * den - (a * x + b) * c; return num(`f(x) = (${lin(a, b)}) / (${lin(c, d)}). Berapa f'(${N(x)})? (pecahan paling sederhana jika perlu)`, F(num1, den * den), "(u/v)' = (u'v − uv') / v².", [
          ['Nilai di x = ' + N(x), `u = ${N(a * x + b)}, u' = ${N(a)}, v = ${N(den)}, v' = ${N(c)}`], ['Substitusi', `(${N(a)} × ${P(den)} − ${P(a * x + b)} × ${c}) / ${P(den)}² = ${N(num1)}/${den * den}`], ['Sederhanakan', `<b>${F(num1, den * den)}</b>`]]); } },
        { id: 'KD4', name: 'Aturan rantai', gen() { const a = nz(-3, 3), b = r(-4, 4), n = r(2, 4), x = r(-2, 2), inner = a * x + b, v = n * inner ** (n - 1) * a; return num(`f(x) = (${lin(a, b)})${sup(n)}. Berapa f'(${N(x)})?`, v, "Aturan rantai: [g(h(x))]' = g'(h(x)) × h'(x).", [
          ['Turunan luar', `${n}(${lin(a, b)})${sup(n - 1)}`], ['Kalikan turunan dalam', `× ${N(a)}`], ['Substitusi', `${n} × ${P(inner)}${sup(n - 1)} × ${P(a)} = <b>${N(v)}</b>`]]); } },
        { id: 'KD5', name: 'Aturan rantai dari tabel', gen() { const xs = shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, 3).sort((p, q) => p - q); const f = xs.map(() => r(-9, 9)), fp = xs.map(() => nz(-9, 9)), g = xs.map(() => pick(xs)), gp = xs.map(() => nz(-9, 9)); const i = r(0, 2), gi = g[i], j = xs.indexOf(gi), v = fp[j] * gp[i]; return num(`Nilai f, g, dan turunannya:<br>${tbl(['x', 'f(x)', "f'(x)", 'g(x)', "g'(x)"], xs.map((x, k) => [x, f[k], fp[k], g[k], gp[k]]))}Berapa (f ∘ g)'(${N(xs[i])})?`, v, "(f ∘ g)'(a) = f'(g(a)) × g'(a).", [
          ['Cari g(' + N(xs[i]) + ')', `dari tabel, g(${N(xs[i])}) = ${N(gi)}`], ["Cari f'(g(" + N(xs[i]) + '))', `f'(${N(gi)}) = ${N(fp[j])}`], ["Cari g'(" + N(xs[i]) + ')', `g'(${N(xs[i])}) = ${N(gp[i])}`], ['Kalikan', `${N(fp[j])} × ${P(gp[i])} = <b>${N(v)}</b>`]]); } },
      ],
    },
    {
      id: 'KE', grade: G, name: 'Turunan fungsi transenden', icon: 'eˣ', color: '#00b894', ixl: 'H', sg: 'Kalkulus · Turunan', km: 'Aljabar',
      tip: 'eˣ adalah satu-satunya fungsi (selain kelipatannya) yang turunannya dirinya sendiri.',
      skills: [
        { id: 'KE1', name: 'Turunan sin dan cos', gen() { const a = nz(-5, 5), k = nz(1, 4), kind = pick(['sin', 'cos']); const v = kind === 'sin' ? a * k : 0; return num(`f(x) = ${a === 1 ? '' : a === -1 ? '−' : N(a)} ${kind} (${k === 1 ? '' : k}x). Berapa f'(0)?`, v, "(sin kx)' = k cos kx; (cos kx)' = −k sin kx. cos 0 = 1, sin 0 = 0.", [
          ['Turunkan', kind === 'sin' ? `f'(x) = ${N(a * k)} cos(${k === 1 ? '' : k}x)` : `f'(x) = ${N(-a * k)} sin(${k === 1 ? '' : k}x)`], ['Substitusi x = 0', kind === 'sin' ? `${N(a * k)} × cos 0 = <b>${N(v)}</b>` : `${N(-a * k)} × sin 0 = <b>0</b>`]]); } },
        { id: 'KE2', name: 'Turunan eksponen', gen() { const a = nz(-5, 5), k = nz(-4, 4); return num(`f(x) = ${a === 1 ? '' : a === -1 ? '−' : N(a)}e${sup((k === 1 ? '' : k === -1 ? '−' : N(k)) + 'x')}. Berapa f'(0)?`, a * k, "(e^(kx))' = k e^(kx), dan e⁰ = 1.", [
          ['Turunkan', `f'(x) = ${N(a * k)}e${sup((k === 1 ? '' : k === -1 ? '−' : N(k)) + 'x')}`], ['Substitusi x = 0', `${N(a * k)} × 1 = <b>${N(a * k)}</b>`]]); } },
        { id: 'KE3', name: 'Turunan logaritma natural', gen() { const a = nz(1, 6), b = r(1, 9), x = r(0, 4), den = a * x + b; return num(`f(x) = ln(${lin(a, b)}). Berapa f'(${x})? (pecahan paling sederhana)`, F(a, den), "(ln u)' = u'/u.", [
          ['Turunkan', `f'(x) = ${a}/(${lin(a, b)})`], ['Substitusi', `${a}/${den} = <b>${F(a, den)}</b>`]]); } },
      ],
    },
    {
      id: 'KF', grade: G, name: 'Aplikasi turunan', icon: '🏔️', color: '#fdcb6e', ixl: 'K, M, O', sg: 'Kalkulus · Turunan', km: 'Aljabar',
      tip: 'Di puncak bukit, jalan tidak naik dan tidak turun: turunannya nol.',
      skills: [
        { id: 'KF1', name: 'Kecepatan dan percepatan', gen() { const a = nz(-2, 3), b = r(-6, 6), c = r(-5, 5), d = r(0, 9), t = r(1, 4), acc = Math.random() < 0.4; const v = 3 * a * t * t + 2 * b * t + c, w = 6 * a * t + 2 * b; return num(`Posisi benda s(t) = ${poly([a, b, c, d], 't')} meter. Berapa ${acc ? 'percepatan (m/s²)' : 'kecepatan (m/s)'} pada t = ${t}?`, acc ? w : v, "Kecepatan v = s'(t), percepatan a = v'(t) = s''(t).", acc ? [
          ["s'(t)", `${poly([3 * a, 2 * b, c], 't')}`], ["s''(t)", `${lin(6 * a, 2 * b, 't')}`], ['Substitusi', `<b>${N(w)}</b> m/s²`]] : [["v = s'(t)", `${poly([3 * a, 2 * b, c], 't')}`], ['Substitusi', `<b>${N(v)}</b> m/s`]]); } },
        { id: 'KF2', name: 'Titik stasioner', gen() { const a = nz(-3, 3), h = nz(-5, 5), c = r(-9, 9); return num(`Di x berapa f(x) = ${poly([a, -2 * a * h, c])} mencapai titik stasioner?`, h, "Titik stasioner terjadi saat f'(x) = 0.", [
          ["f'(x)", `${lin(2 * a, -2 * a * h)}`], ["f'(x) = 0", `x = <b>${N(h)}</b>`]]); } },
        { id: 'KF3', name: 'Nilai maksimum dan minimum', gen() { const p = r(-3, 0), q = r(1, 4), cs = [1, -1.5 * (p + q), 3 * p * q, r(-5, 5)].map((x) => x * 2), kind = pick(['maksimum lokal', 'minimum lokal']); const x = kind === 'maksimum lokal' ? p : q, v = ev(cs, x); if (p === q) return C.SKILLS.KF3.gen(); return num(`f(x) = ${poly(cs)}. Berapa nilai ${kind} f?`, v, "Cari x dengan f'(x) = 0, lalu gunakan uji turunan kedua: f'' < 0 maksimum, f'' > 0 minimum.", [
          ["f'(x) = 0", `${poly(der(cs))} = 0 → x = ${N(p)} atau x = ${N(q)}`], ["Uji f''", `x = ${N(p)}: maksimum, x = ${N(q)}: minimum`], ['Nilai', `f(${N(x)}) = <b>${N(v)}</b>`]]); } },
        { id: 'KF4', name: 'Optimasi', gen() { const k = pick([20, 24, 30, 36, 40, 60, 80, 100]); return num(`Pagar sepanjang ${k * 2} m dipakai mengelilingi kebun persegi panjang. Berapa m² luas terbesar yang bisa dibuat?`, (k / 2) ** 2, "Tulis luas sebagai fungsi satu variabel, lalu cari L'(x) = 0.", [
          ['Model', `p + l = ${k} → L(x) = x(${k} − x) = ${k}x − x²`], ["L'(x) = 0", `${k} − 2x = 0 → x = ${k / 2}`], ['Luas maksimum', `${k / 2} × ${k / 2} = <b>${(k / 2) ** 2}</b> m²`]], { unit: 'm²' }); } },
      ],
    },
    {
      id: 'KG', grade: G, name: "Turunan kedua dan L'Hôpital", icon: "f''", color: '#00a8cc', ixl: 'J, L, N', sg: 'Kalkulus · Turunan', km: 'Aljabar',
      tip: 'Turunan kedua menunjukkan kecekungan: cekung ke atas seperti mangkuk, ke bawah seperti topi.',
      skills: [
        { id: 'KG1', name: 'Turunan kedua', gen() { const cs = [nz(-2, 2), r(-4, 4), r(-4, 4), r(-4, 4), r(-4, 4)], x = r(-2, 2), v = ev(der(der(cs)), x); return num(`f(x) = ${poly(cs)}. Berapa f''(${N(x)})?`, v, 'Turunkan dua kali.', [
          ["f'(x)", poly(der(cs))], ["f''(x)", poly(der(der(cs)))], ['Substitusi', `<b>${N(v)}</b>`]]); } },
        { id: 'KG2', name: 'Titik belok', gen() { const a = nz(-2, 2), h = nz(-4, 4), cs = [a, -3 * a * h, r(-5, 5), r(-5, 5)]; return num(`Di x berapa f(x) = ${poly(cs)} punya titik belok?`, h, "Titik belok terjadi saat f''(x) = 0 dan tanda f'' berubah.", [
          ["f''(x)", lin(6 * a, -6 * a * h)], ["f''(x) = 0", `x = <b>${N(h)}</b>`]]); } },
        { id: 'KG3', name: "Aturan L'Hôpital", gen() { const a = nz(1, 6), b = nz(1, 6), kind = pick(['exp', 'sin']); return num(kind === 'exp' ? `lim(x → 0) (e${sup(a + 'x')} − 1) / (${b}x) = ? (pecahan paling sederhana jika perlu)` : `lim(x → 0) (${b}x) / sin(${a}x) = ? (pecahan paling sederhana jika perlu)`, kind === 'exp' ? F(a, b) : F(b, a), "Untuk bentuk 0/0, lim f/g = lim f'/g'.", [
          ['Periksa bentuk', '0/0'], ['Turunkan pembilang dan penyebut', kind === 'exp' ? `${a}e${sup(a + 'x')} / ${b}` : `${b} / (${a} cos ${a}x)`], ['Substitusi x = 0', `<b>${kind === 'exp' ? F(a, b) : F(b, a)}</b>`]]); } },
      ],
    },
    {
      id: 'KH', grade: G, name: 'Integral tak tentu', icon: '∫', color: '#9b6dff', ixl: 'Q, S', sg: 'Kalkulus · Integral', km: 'Aljabar',
      tip: 'Integral adalah kebalikan turunan: jika turunan F adalah f, maka ∫f dx = F + C.',
      skills: [
        { id: 'KH1', name: 'Antiturunan polinomial', gen() { const a = nz(1, 4), n = r(1, 4), b = nz(-6, 6), c1 = a * (n + 1); const tail = `${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x + C`; const up = (k) => poly([k, ...Array(n + 1).fill(0)]); const ans = `${up(a)} ${tail}`; return pil(`∫ (${poly([c1, ...Array(n).fill(0)])} ${b < 0 ? '−' : '+'} ${Math.abs(b)}) dx = ?`, opt(ans, [`${poly([a, ...Array(n).fill(0)])} ${tail}`, `${up(c1)} ${tail}`, `${poly([c1 * n, ...Array(n - 1).fill(0)])} + C`, `${up(a)} + C`]), ans, '∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C. Jangan lupa + C.', [
          ['Naikkan pangkat, bagi dengan pangkat baru', `${c1}x${sup(n)} → ${c1}/${n + 1} x${sup(n + 1)} = ${up(a)}`], ['Integral konstanta', `${N(b)} → ${N(b)}x`], ['Hasil', `<b>${ans}</b>`]]); } },
        { id: 'KH2', name: 'Masalah nilai awal', gen() { const a = nz(-3, 3), b = r(-5, 5), x0 = r(-2, 2), y0 = r(-9, 9), c = y0 - (a * x0 * x0 + b * x0); return num(`F'(x) = ${lin(2 * a, b)} dan F(${N(x0)}) = ${N(y0)}. Berapa konstanta C pada F(x) = ${poly([a, b, 0])} + C?`, c, 'Integralkan, lalu substitusikan syarat awal untuk mencari C.', [
          ['Antiturunan', `F(x) = ${poly([a, b, 0])} + C`], ['Substitusi', `${N(y0)} = ${N(a * x0 * x0 + b * x0)} + C`], ['C', `<b>${N(c)}</b>`]]); } },
      ],
    },
    {
      id: 'KI', grade: G, name: 'Integral tentu', icon: '▭', color: '#e17055', ixl: 'R, T', sg: 'Kalkulus · Integral', km: 'Aljabar',
      tip: 'Integral tentu menghitung luas di bawah kurva, seperti menjumlah banyak persegi panjang tipis.',
      skills: [
        { id: 'KI1', name: 'Menghitung integral tentu', gen() { const a = nz(-2, 2) * 3, b = nz(-3, 3) * 2, c = r(-4, 4), lo = r(-2, 1), hi = lo + r(1, 3); const Fx = (x) => (a / 3) * x ** 3 + (b / 2) * x * x + c * x, v = Fx(hi) - Fx(lo); return num(`∫ dari ${N(lo)} sampai ${N(hi)} (${poly([a, b, c])}) dx = ?`, v, 'Teorema Dasar Kalkulus: ∫ₐᵇ f(x) dx = F(b) − F(a).', [
          ['Antiturunan', `F(x) = ${poly([a / 3, b / 2, c, 0])}`], ['F(' + N(hi) + ') − F(' + N(lo) + ')', `${N(Fx(hi))} − ${P(Fx(lo))} = <b>${N(v)}</b>`]]); } },
        { id: 'KI2', name: 'Luas daerah di bawah kurva', gen() { const k = r(1, 4), hi = r(1, 3) * 3; return num(`Berapa luas daerah antara y = ${k === 1 ? '' : k}x² dan sumbu x dari x = 0 sampai x = ${hi}?`, (k * hi ** 3) / 3, 'Luas = ∫ f(x) dx bila f(x) ≥ 0 pada selangnya.', [
          ['Integral', `∫₀^${hi} ${k === 1 ? '' : k}x² dx = ${k === 1 ? '' : k + '/'}${k === 1 ? '1/3' : '3'} x³`], ['Hitung', `${k} × ${hi ** 3} / 3 = <b>${N((k * hi ** 3) / 3)}</b>`]]); } },
        { id: 'KI3', name: 'Teorema Dasar Kalkulus bagian 1', gen() { const a = nz(-4, 4), b = r(-6, 6), x = r(-3, 3); return num(`G(x) = ∫ dari 0 sampai x (${lin(a, b, 't')}) dt. Berapa G'(${N(x)})?`, a * x + b, "d/dx ∫ₐˣ f(t) dt = f(x).", [
          ['Gunakan TDK 1', `G'(x) = ${lin(a, b)}`], ['Substitusi', `<b>${N(a * x + b)}</b>`]]); } },
      ],
    },
    {
      id: 'KJ', grade: G, name: 'Teknik dan aplikasi integral', icon: '🌀', color: '#16a085', ixl: 'U–W', sg: 'Kalkulus · Integral', km: 'Aljabar',
      tip: 'Volume vas bunga bisa dihitung dengan memutar kurva tepinya mengelilingi sumbu.',
      skills: [
        { id: 'KJ1', name: 'Integral substitusi', gen() { const n = r(1, 3), a = nz(1, 3), b = r(0, 3), lo = 0, hi = 1; const U = (x) => (a * x + b) ** (n + 1) / (a * (n + 1)), v = U(hi) - U(lo); if (Math.abs(v * 12 - Math.round(v * 12)) > 1e-9) return C.SKILLS.KJ1.gen(); return num(`∫ dari 0 sampai 1 (${lin(a, b)})${sup(n)} dx = ? (pecahan paling sederhana jika perlu)`, F(Math.round(v * 12 * (n + 1) * a), 12 * (n + 1) * a), 'Substitusi u = ax + b, du = a dx.', [
          ['Substitusi', `u = ${lin(a, b)}, dx = du/${a}`], ['Antiturunan', `(${lin(a, b)})${sup(n + 1)} / ${a * (n + 1)}`], ['Batas', `[${(a + b) ** (n + 1)} − ${b ** (n + 1)}] / ${a * (n + 1)} = <b>${F(Math.round(v * 12 * (n + 1) * a), 12 * (n + 1) * a)}</b>`]]); } },
        { id: 'KJ2', name: 'Volume benda putar', gen() { const k = r(1, 3), hi = r(1, 3); const v = (k * k * hi ** 3) / 3; return num(`Daerah di bawah y = ${k === 1 ? '' : k}x dari x = 0 sampai ${hi} diputar mengelilingi sumbu x. Volumenya mπ. Berapa m? (pecahan paling sederhana jika perlu)`, F(k * k * hi ** 3, 3), 'Metode cakram: V = π ∫ [f(x)]² dx.', [
          ['Kuadratkan f', `(${k === 1 ? '' : k}x)² = ${k * k === 1 ? '' : k * k}x²`], ['Integral', `π ∫₀^${hi} ${k * k === 1 ? '' : k * k}x² dx = π × ${k * k} × ${hi ** 3}/3`], ['m', `<b>${F(k * k * hi ** 3, 3)}</b>`]]); } },
        { id: 'KJ3', name: 'Persamaan diferensial pertumbuhan', gen() { const y0 = pick([100, 200, 500, 1000]), ln2 = pick([1, 2, 3]), t = ln2 * r(1, 3); return num(`dy/dt = ky dengan y(0) = ${y0}, dan nilai y menjadi dua kali lipat setiap ${ln2} jam. Berapa y saat t = ${t} jam?`, y0 * 2 ** (t / ln2), 'Penyelesaian dy/dt = ky adalah y = y₀eᵏᵗ; dengan waktu ganda T: y = y₀ × 2^(t/T).', [
          ['Bentuk penyelesaian', `y = ${y0} × 2${sup('t/' + ln2)}`], ['Substitusi', `${y0} × 2${sup(t / ln2)} = <b>${y0 * 2 ** (t / ln2)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: G, name: 'Kalkulus', short: 'K', stage: 'SMA', ixl: 'https://www.ixl.com/math/calculus', sg: 'Matematika Tingkat Lanjut · Kalkulus' });

  lesson('KA', 'Limit menyatakan nilai yang didekati f(x) ketika x mendekati a.', [['Strategi', ['Substitusi langsung.', 'Jika 0/0: faktorkan atau rasionalkan.', 'lim(x → 0) sin x / x = 1.'], 'KA2']]);
  lesson('KB', 'f kontinu di a jika lim f(x) = f(a).', [['Tiga syarat', ['f(a) ada.', 'Limit di a ada.', 'Keduanya sama.'], 'KB1']]);
  lesson('KC', "Turunan f'(a) adalah gradien garis singgung di x = a.", [['Definisi', ["f'(x) = lim(h → 0) [f(x + h) − f(x)]/h"], 'KC2'], ['Garis singgung', ["gradien = f'(a)"], 'KC3']]);
  lesson('KD', 'Aturan turunan mempercepat perhitungan tanpa definisi limit.', [['Aturan', ["(xⁿ)' = nxⁿ⁻¹", "(uv)' = u'v + uv'", "(u/v)' = (u'v − uv')/v²", "(f(g(x)))' = f'(g(x)) g'(x)"], 'KD4']]);
  lesson('KE', 'Turunan fungsi trigonometri, eksponen, dan logaritma.', [['Rumus', ["(sin x)' = cos x, (cos x)' = −sin x", "(eˣ)' = eˣ", "(ln x)' = 1/x"], 'KE2']]);
  lesson('KF', 'Turunan dipakai untuk mencari kecepatan, titik puncak, dan nilai optimum.', [['Optimasi', ['Tulis besaran sebagai fungsi satu variabel.', "Cari f'(x) = 0.", 'Periksa maksimum atau minimum.'], 'KF4']]);
  lesson('KG', "Turunan kedua menunjukkan kecekungan; L'Hôpital menyelesaikan limit 0/0.", [["L'Hôpital", ["lim f/g = lim f'/g' untuk bentuk 0/0 atau ∞/∞."], 'KG3']]);
  lesson('KH', 'Integral tak tentu adalah antiturunan.', [['Aturan pangkat', ['∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C, n ≠ −1.'], 'KH1']]);
  lesson('KI', 'Integral tentu menghitung luas bertanda di bawah kurva.', [['Teorema Dasar Kalkulus', ['∫ₐᵇ f(x) dx = F(b) − F(a).', 'd/dx ∫ₐˣ f(t) dt = f(x).'], 'KI1']]);
  lesson('KJ', 'Teknik substitusi dan aplikasi volume.', [['Substitusi', ['Pilih u = bagian dalam, ganti dx = du/u\'.'], 'KJ1'], ['Volume', ['Cakram: V = π∫ f(x)² dx.'], 'KJ2']]);
})();
