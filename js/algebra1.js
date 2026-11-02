/* Metiq — Aljabar 1 (SMA awal, Fase E). Cakupan mengikuti IXL Algebra 1:
 * persamaan dan pertidaksamaan, nilai mutlak, fungsi linear, sistem persamaan, polinomial dan faktorisasi,
 * fungsi dan persamaan kuadrat, fungsi eksponen.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, poly, lin, num, pil, opt, lesson } = C.kit;
  const G = 9;

  const UNITS = [
    {
      id: 'A1A', grade: G, name: 'Persamaan linear lanjutan', icon: '⚖️', color: '#4d96ff', ixl: 'C', sg: 'Fase E · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Kumpulkan suku x di satu ruas dan bilangan di ruas lain, seperti merapikan barang ke dua laci.',
      skills: [
        { id: 'A1A1', name: 'Variabel di kedua ruas', gen() { const x = nz(-9, 9), a = nz(-8, 9), c = nz(-8, 9); if (a === c) return C.SKILLS.A1A1.gen(); const b = r(-15, 15), d = (a - c) * x + b; return num(`${lin(a, b)} = ${lin(c, d)}. Berapa x?`, x, 'Pindahkan semua suku x ke kiri dan konstanta ke kanan.', [
          ['Kurangi kedua ruas dengan ' + lin(c, 0), `${lin(a - c, b)} = ${N(d)}`], ['Pindahkan konstanta', `${lin(a - c, 0)} = ${N(d - b)}`], ['Bagi', `x = ${N(d - b)} : ${P(a - c)} = <b>${N(x)}</b>`]]); } },
        { id: 'A1A2', name: 'Persamaan dengan pecahan', gen() { const k = pick([2, 3, 4, 5]), x = nz(-8, 10), b = r(-6, 6), c = (x + b) / k; if (!Number.isInteger(c)) return C.SKILLS.A1A2.gen(); return num(`<span class="mfr"><b>${lin(1, b)}</b><b>${k}</b></span> = ${N(c)}. Berapa x?`, x, 'Kalikan kedua ruas dengan penyebut untuk menghilangkan pecahan.', [
          ['Kalikan kedua ruas dengan ' + k, `${lin(1, b)} = ${N(c * k)}`], ['Pindahkan konstanta', `x = ${N(c * k)} − ${P(b)} = <b>${N(x)}</b>`]]); } },
        { id: 'A1A3', name: 'Mengubah subjek rumus', gen() { const [f, ask, ans, steps] = pick([
          ['K = 2(p + l)', 'l', 'l = K/2 − p', [['Bagi 2', 'K/2 = p + l'], ['Kurangi p', 'l = K/2 − p']]],
          ['V = p × l × t', 't', 't = V/(p × l)', [['Bagi kedua ruas dengan p × l', 't = V/(p × l)']]],
          ['y = mx + c', 'x', 'x = (y − c)/m', [['Kurangi c', 'y − c = mx'], ['Bagi m', 'x = (y − c)/m']]],
          ['s = v × t', 'v', 'v = s/t', [['Bagi t', 'v = s/t']]],
          ['F = 9/5 C + 32', 'C', 'C = 5/9 (F − 32)', [['Kurangi 32', 'F − 32 = 9/5 C'], ['Kali 5/9', 'C = 5/9 (F − 32)']]]]);
          const wrongs = { 'l = K/2 − p': ['l = 2K − p', 'l = K − 2p', 'l = (K − p)/2'], 't = V/(p × l)': ['t = V × p × l', 't = p × l/V', 't = V − p − l'], 'x = (y − c)/m': ['x = y/m − c', 'x = m(y − c)', 'x = (y + c)/m'], 'v = s/t': ['v = s × t', 'v = t/s', 'v = s − t'], 'C = 5/9 (F − 32)': ['C = 9/5 (F − 32)', 'C = 5/9 F − 32', 'C = (F + 32) × 5/9'] };
          return pil(`Ubah rumus ${f} menjadi ${ask} = ...`, opt(ans, wrongs[ans]), ans, 'Perlakukan rumus seperti persamaan: lakukan operasi kebalikan di kedua ruas sampai variabel yang diminta sendirian.', [...steps, ['Hasil', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'A1B', grade: G, name: 'Nilai mutlak dan pertidaksamaan', icon: '| |', color: '#ff7a59', ixl: 'F, H', sg: 'Fase E · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Nilai mutlak adalah jarak dari nol: |−5| = 5 karena −5 berjarak 5 dari nol.',
      skills: [
        { id: 'A1B1', name: 'Persamaan nilai mutlak', gen() { const a = r(-9, 9), b = r(1, 9), big = a + b, small = a - b; return num(`|x ${a < 0 ? '+' : '−'} ${Math.abs(a)}| = ${b}. Berapa penyelesaian x yang terbesar?`, big, '|A| = b berarti A = b atau A = −b.', [
          ['Kasus positif', `x ${a < 0 ? '+' : '−'} ${Math.abs(a)} = ${b} → x = ${N(big)}`], ['Kasus negatif', `x ${a < 0 ? '+' : '−'} ${Math.abs(a)} = −${b} → x = ${N(small)}`], ['Yang terbesar', `<b>${N(big)}</b>`]]); } },
        { id: 'A1B2', name: 'Banyak bilangan bulat pada pertidaksamaan', gen() { const a = r(-5, 5), b = r(2, 6); return num(`Berapa banyak bilangan bulat x yang memenuhi |x ${a < 0 ? '+' : '−'} ${Math.abs(a)}| ≤ ${b}?`, 2 * b + 1, '|A| ≤ b berarti −b ≤ A ≤ b.', [
          ['Tulis tanpa nilai mutlak', `−${b} ≤ x ${a < 0 ? '+' : '−'} ${Math.abs(a)} ≤ ${b}`], ['Selesaikan', `${N(a - b)} ≤ x ≤ ${N(a + b)}`], ['Hitung bilangan bulatnya', `${N(a + b)} − ${P(a - b)} + 1 = <b>${2 * b + 1}</b>`]]); } },
        { id: 'A1B3', name: 'Pertidaksamaan majemuk', gen() { const a = nz(2, 5), lo = r(-6, 2), hi = r(lo + 2, lo + 8), b = r(-6, 6); const ans = `${N(lo)} < x < ${N(hi)}`; return pil(`Selesaikan: ${N(a * lo + b)} < ${lin(a, b)} < ${N(a * hi + b)}`, opt(ans, [`${N(lo - 1)} < x < ${N(hi - 1)}`, `${N(lo)} < x < ${N(hi + 1)}`, `x < ${N(lo)} atau x > ${N(hi)}`, `${N(a * lo)} < x < ${N(a * hi)}`]), ans, 'Kerjakan operasi yang sama pada ketiga bagian sekaligus.', [
          ['Kurangi ' + N(b), `${N(a * lo)} < ${lin(a, 0)} < ${N(a * hi)}`], ['Bagi ' + a, `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'A1C', grade: G, name: 'Fungsi linear', icon: '📈', color: '#1fbf9f', ixl: 'K–N', sg: 'Fase E · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Tarif ojek online: biaya awal (titik potong) + biaya per km (gradien).',
      skills: [
        { id: 'A1C1', name: 'Titik potong sumbu x', gen() { const m = nz(-5, 5), x0 = nz(-8, 8), c = -m * x0; if (!c) return C.SKILLS.A1C1.gen(); return num(`Garis y = ${lin(m, c)} memotong sumbu x di (a, 0). Berapa a?`, x0, 'Titik potong sumbu x terjadi saat y = 0.', [
          ['Jadikan y = 0', `0 = ${lin(m, c)}`], ['Selesaikan', `${lin(m, 0)} = ${N(-c)} → x = <b>${N(x0)}</b>`]]); } },
        { id: 'A1C2', name: 'Garis sejajar dan tegak lurus', gen() { const p = nz(-4, 4), q = nz(1, 5), m = F(p, q), tegak = Math.random() < 0.5, ans = tegak ? F(-q, p) : m; return num(`Garis g bergradien ${m}. Berapa gradien garis yang ${tegak ? 'tegak lurus' : 'sejajar'} dengan g? (pecahan paling sederhana jika perlu)`, ans, 'Garis sejajar: gradien sama. Garis tegak lurus: m₁ × m₂ = −1, jadi m₂ = −1/m₁.', [
          [tegak ? 'Tegak lurus' : 'Sejajar', tegak ? `m₂ = −1 : (${m}) = ${F(-q, p)}` : 'Gradiennya sama.'], ['Jawab', `<b>${ans}</b>`]]); } },
        { id: 'A1C3', name: 'Model linear dari soal cerita', gen() { const awal = pick([5000, 7000, 8000, 10000]), per = pick([2000, 2500, 3000, 3500]), km = r(3, 15), tot = awal + per * km; return num(`Tarif ojek: biaya awal Rp${awal.toLocaleString('id-ID')} ditambah Rp${per.toLocaleString('id-ID')} per km. Berapa km perjalanan jika ongkosnya Rp${tot.toLocaleString('id-ID')}?`, km, 'Tulis model y = biaya awal + tarif × x, lalu selesaikan x.', [
          ['Model', `${tot.toLocaleString('id-ID')} = ${awal.toLocaleString('id-ID')} + ${per.toLocaleString('id-ID')}x`], ['Kurangi biaya awal', `${per.toLocaleString('id-ID')}x = ${(tot - awal).toLocaleString('id-ID')}`], ['Bagi', `x = <b>${km}</b> km`]], { unit: 'km' }); } },
      ],
    },
    {
      id: 'A1D', grade: G, name: 'Sistem persamaan linear', icon: '✖️', color: '#e84393', ixl: 'O–P', sg: 'Fase E · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Dua garis yang berpotongan di satu titik = sistem punya satu penyelesaian.',
      skills: [
        { id: 'A1D1', name: 'Metode substitusi', gen() { const x = nz(-6, 6), y = nz(-6, 6), m = nz(-3, 3), c = y - m * x, a = nz(1, 4), b = nz(-4, 4), d = a * x + b * y; if (a + b * m === 0) return C.SKILLS.A1D1.gen(); return num(`y = ${lin(m, c)}<br>${lin(a, 0)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${N(d)}<br>Berapa x?`, x, 'Ganti y pada persamaan kedua dengan bentuk dari persamaan pertama.', [
          ['Substitusi', `${lin(a, 0)} + ${P(b)}(${lin(m, c)}) = ${N(d)}`], ['Sederhanakan', `${lin(a + b * m, b * c)} = ${N(d)}`], ['Selesaikan', `x = ${N(d - b * c)} : ${P(a + b * m)} = <b>${N(x)}</b>`]]); } },
        { id: 'A1D2', name: 'Jumlah penyelesaian x + y', gen() { const x = nz(-7, 7), y = nz(-7, 7), a = nz(1, 5), b = nz(1, 5), c = nz(1, 5), d = nz(-5, -1); if (a * d === b * c) return C.SKILLS.A1D2.gen(); return num(`${lin(a, 0)} + ${b === 1 ? '' : b}y = ${N(a * x + b * y)}<br>${lin(c, 0)} − ${Math.abs(d) === 1 ? '' : Math.abs(d)}y = ${N(c * x + d * y)}<br>Berapa x + y?`, x + y, 'Selesaikan x dan y dengan eliminasi, lalu jumlahkan.', [
          ['Eliminasi', 'Samakan koefisien salah satu variabel, lalu jumlahkan atau kurangkan persamaan.'], ['Penyelesaian', `x = ${N(x)}, y = ${N(y)}`], ['Jumlahkan', `x + y = <b>${N(x + y)}</b>`]]); } },
      ],
    },
    {
      id: 'A1E', grade: G, name: 'Polinomial', icon: '🧮', color: '#fdcb6e', ixl: 'W', sg: 'Fase E · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Model luas dengan kotak: (x + 3)(x + 2) adalah luas persegi panjang yang dibagi empat bagian.',
      skills: [
        { id: 'A1E1', name: 'Menjumlah dan mengurangi polinomial', gen() { const p = [nz(-5, 5), r(-9, 9), r(-9, 9)], q = [nz(-5, 5), r(-9, 9), r(-9, 9)], add = Math.random() < 0.5, s = p.map((v, i) => (add ? v + q[i] : v - q[i])); if (!s[0]) return C.SKILLS.A1E1.gen(); const ans = poly(s); return pil(`(${poly(p)}) ${add ? '+' : '−'} (${poly(q)}) = ?`, opt(ans, [poly(p.map((v, i) => (add ? v - q[i] : v + q[i]))), poly([s[0], s[1], -s[2]]), poly([s[0], -s[1], s[2]]), poly([s[0] + 1, s[1], s[2]])]), ans, 'Jumlahkan atau kurangkan koefisien suku yang sejenis (pangkat sama).', [
          [add ? 'Lepas kurung' : 'Lepas kurung (tanda suku kedua berubah)', add ? 'Tanda tetap.' : `−(${poly(q)}) = ${poly(q.map((v) => -v))}`], ['Gabungkan suku sejenis', `<b>${ans}</b>`]]); } },
        { id: 'A1E2', name: 'Mengalikan dua binomial', gen() { const a = nz(-9, 9), b = nz(-9, 9), ans = poly([1, a + b, a * b]); return pil(`(${lin(1, a)})(${lin(1, b)}) = ?`, opt(ans, [poly([1, a * b, a + b]), poly([1, a + b, -a * b]), poly([1, a - b, a * b]), poly([1, 0, a * b])]), ans, 'Kalikan setiap suku di kurung pertama dengan setiap suku di kurung kedua.', [
          ['x × x', `x${sup(2)}`], ['Suku luar + suku dalam', `${N(b)}x + ${P(a)}x = ${N(a + b)}x`], ['Konstanta', `${P(a)} × ${P(b)} = ${N(a * b)}`], ['Hasil', `<b>${ans}</b>`]]); } },
        { id: 'A1E3', name: 'Kuadrat binomial', gen() { const a = nz(1, 5), b = nz(-9, 9), ans = poly([a * a, 2 * a * b, b * b]); return pil(`(${lin(a, b)})${sup(2)} = ?`, opt(ans, [poly([a * a, 0, b * b]), poly([a * a, a * b, b * b]), poly([a * a, 2 * a * b, -b * b]), poly([a, 2 * a * b, b * b])]), ans, '(p + q)² = p² + 2pq + q². Jangan lupa suku tengah 2pq.', [
          ['p² ', `(${lin(a, 0)})${sup(2)} = ${poly([a * a, 0, 0])}`], ['2pq', `2 × ${lin(a, 0)} × ${P(b)} = ${lin(2 * a * b, 0)}`], ['q²', `${P(b)}${sup(2)} = ${b * b}`], ['Hasil', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'A1F', grade: G, name: 'Faktorisasi', icon: '🧩', color: '#00b894', ixl: 'X', sg: 'Fase E · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Untuk x² + bx + c, cari dua bilangan yang hasil kalinya c dan jumlahnya b.',
      skills: [
        { id: 'A1F1', name: 'Faktor x² + bx + c', gen() { const a = nz(-9, 9), b = nz(-9, 9); if (a === -b) return C.SKILLS.A1F1.gen(); const ans = `(${lin(1, a)})(${lin(1, b)})`; return pil(`Faktorkan ${poly([1, a + b, a * b])}.`, opt(ans, [`(${lin(1, -a)})(${lin(1, -b)})`, `(${lin(1, a)})(${lin(1, -b)})`, `(${lin(1, -a)})(${lin(1, b)})`, `(${lin(1, a + b)})(${lin(1, 1)})`]), ans, 'Cari dua bilangan p dan q dengan p × q = c dan p + q = b. Maka x² + bx + c = (x + p)(x + q).', [
          ['Hasil kali', `p × q = ${N(a * b)}`], ['Jumlah', `p + q = ${N(a + b)}`], ['Bilangannya', `${N(a)} dan ${N(b)}`], ['Faktor', `<b>${ans}</b>`]]); } },
        { id: 'A1F2', name: 'Selisih dua kuadrat', gen() { const a = r(1, 4), b = r(1, 12), ans = `(${lin(a, b)})(${lin(a, -b)})`; return pil(`Faktorkan ${poly([a * a, 0, -b * b])}.`, opt(ans, [`(${lin(a, b)})${sup(2)}`, `(${lin(a, -b)})${sup(2)}`, `(${lin(a * a, b)})(${lin(1, -b)})`, `(${lin(a, b * b)})(${lin(a, -1)})`]), ans, 'p² − q² = (p + q)(p − q).', [
          ['Kenali kuadratnya', `${poly([a * a, 0, 0])} = (${lin(a, 0)})${sup(2)} dan ${b * b} = ${b}${sup(2)}`], ['Faktor', `<b>${ans}</b>`]]); } },
        { id: 'A1F3', name: 'Faktor persekutuan terbesar', gen() { const k = r(2, 9), a = r(1, 6), b = nz(-9, 9); if (Math.abs(C.kit.gcd(Math.abs(a), Math.abs(b))) !== 1) return C.SKILLS.A1F3.gen(); const ans = `${k}x(${lin(a, b)})`; return pil(`Faktorkan ${poly([k * a, k * b, 0])}.`, opt(ans, [`${k}(${poly([a, b, 0])})`, `x(${lin(k * a, b)})`, `${k}x(${lin(a, k * b)})`, `${k * 2}x(${lin(a, b)})`]), ans, 'Keluarkan faktor yang ada di semua suku (koefisien dan variabel).', [
          ['FPB koefisien', `FPB(${Math.abs(k * a)}, ${Math.abs(k * b)}) = ${k}`], ['Variabel bersama', 'x'], ['Hasil', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'A1G', grade: G, name: 'Fungsi kuadrat', icon: '⌒', color: '#00a8cc', ixl: 'Y', sg: 'Fase E · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Lintasan bola yang dilempar berbentuk parabola: titik tertingginya adalah titik puncak.',
      skills: [
        { id: 'A1G1', name: 'Sumbu simetri', gen() { const a = nz(-3, 3), h = nz(-6, 6), b = -2 * a * h, c = r(-9, 9); return num(`Berapa sumbu simetri parabola y = ${poly([a, b, c])}? (x = ...)`, h, 'Sumbu simetri parabola y = ax² + bx + c adalah x = −b/(2a).', [
          ['Kenali a dan b', `a = ${N(a)}, b = ${N(b)}`], ['Hitung', `x = −(${N(b)}) / (2 × ${P(a)}) = <b>${N(h)}</b>`]]); } },
        { id: 'A1G2', name: 'Titik puncak', gen() { const a = nz(-3, 3), h = nz(-5, 5), k = r(-9, 9), b = -2 * a * h, c = a * h * h + k; return num(`Titik puncak parabola y = ${poly([a, b, c])} adalah (${N(h)}, p). Berapa p?`, k, 'Substitusikan x puncak ke fungsi untuk mendapat y puncak.', [
          ['x puncak', `x = −b/(2a) = ${N(h)}`], ['Substitusi', `y = ${N(a)} × ${P(h)}${sup(2)} + ${P(b)} × ${P(h)} + ${P(c)} = <b>${N(k)}</b>`]]); } },
        { id: 'A1G3', name: 'Diskriminan dan banyak akar', gen() { const a = nz(-3, 3), b = r(-8, 8), c = r(-8, 8), D = b * b - 4 * a * c, ans = D > 0 ? '2 akar real' : D === 0 ? '1 akar real (kembar)' : 'tidak ada akar real'; return pil(`Berapa banyak akar real ${poly([a, b, c])} = 0?`, ['2 akar real', '1 akar real (kembar)', 'tidak ada akar real'], ans, 'Diskriminan D = b² − 4ac: D > 0 dua akar, D = 0 satu akar, D < 0 tidak ada akar real.', [
          ['Hitung D', `${P(b)}${sup(2)} − 4 × ${P(a)} × ${P(c)} = ${N(D)}`], ['Simpulkan', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'A1H', grade: G, name: 'Persamaan kuadrat', icon: '🎯', color: '#9b6dff', ixl: 'Z', sg: 'Fase E · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Periksa akar dengan mensubstitusikannya kembali ke persamaan.',
      skills: [
        { id: 'A1H1', name: 'Akar dengan pemfaktoran', gen() { const p = r(-9, 9), q = r(-9, 9); if (p === q) return C.SKILLS.A1H1.gen(); const big = Math.max(p, q); return num(`${poly([1, -(p + q), p * q])} = 0. Berapa akar yang terbesar?`, big, 'Faktorkan, lalu gunakan sifat: jika A × B = 0 maka A = 0 atau B = 0.', [
          ['Faktorkan', `(${lin(1, -p)})(${lin(1, -q)}) = 0`], ['Akar-akar', `x = ${N(p)} atau x = ${N(q)}`], ['Yang terbesar', `<b>${N(big)}</b>`]]); } },
        { id: 'A1H2', name: 'Rumus kuadrat (ABC)', gen() { const a = pick([1, 2, 3]), p = nz(-6, 6), q = nz(-6, 6), b = -a * (p + q), c = a * p * q, D = b * b - 4 * a * c; if (!D) return C.SKILLS.A1H2.gen(); const small = Math.min(p, q); return num(`Gunakan rumus ABC untuk ${poly([a, b, c])} = 0. Berapa akar yang terkecil?`, small, 'x = (−b ± √(b² − 4ac)) / 2a.', [
          ['Diskriminan', `D = ${P(b)}${sup(2)} − 4 × ${a} × ${P(c)} = ${D}, √D = ${Math.sqrt(D)}`], ['Dua akar', `x = (${N(-b)} ± ${Math.sqrt(D)}) / ${2 * a} → ${N(Math.max(p, q))} atau ${N(small)}`], ['Yang terkecil', `<b>${N(small)}</b>`]]); } },
        { id: 'A1H3', name: 'Jumlah dan hasil kali akar', gen() { const a = nz(1, 4), b = nz(-12, 12), c = nz(-12, 12), sum = Math.random() < 0.5; return num(`Akar-akar ${poly([a, b, c])} = 0 adalah x₁ dan x₂. Berapa ${sum ? 'x₁ + x₂' : 'x₁ × x₂'}? (pecahan paling sederhana jika perlu)`, sum ? F(-b, a) : F(c, a), 'Rumus Vieta: x₁ + x₂ = −b/a dan x₁ × x₂ = c/a.', [
          ['Kenali a, b, c', `a = ${a}, b = ${N(b)}, c = ${N(c)}`], ['Gunakan rumus', sum ? `−b/a = ${N(-b)}/${a} = <b>${F(-b, a)}</b>` : `c/a = ${N(c)}/${a} = <b>${F(c, a)}</b>`]]); } },
      ],
    },
    {
      id: 'A1I', grade: G, name: 'Fungsi eksponen', icon: '🚀', color: '#e17055', ixl: 'V', sg: 'Fase E · Aljabar dan Fungsi', km: 'Aljabar',
      tip: 'Bakteri yang membelah dua setiap jam tumbuh secara eksponen: 1, 2, 4, 8, 16, ...',
      skills: [
        { id: 'A1I1', name: 'Nilai fungsi eksponen', gen() { const a = r(1, 5), b = pick([2, 3, 4]), x = r(0, 4); return num(`f(x) = ${a === 1 ? '' : a + ' × '}${b}${sup('x')}. Berapa f(${x})?`, a * b ** x, 'Hitung pangkatnya dulu, baru kalikan dengan koefisien.', [
          ['Pangkat', `${b}${sup(x)} = ${b ** x}`], ['Kalikan', `${a} × ${b ** x} = <b>${a * b ** x}</b>`]]); } },
        { id: 'A1I2', name: 'Pertumbuhan dan peluruhan', gen() { const grow = Math.random() < 0.5, a = pick([100, 200, 400, 800, 1600]), n = r(2, 4); const ans = grow ? a * 2 ** n : a / 2 ** n; return num(grow ? `Bakteri berjumlah ${a} dan menjadi dua kali lipat setiap jam. Berapa jumlahnya setelah ${n} jam?` : `Zat ${a} gram meluruh menjadi setengahnya setiap 5 tahun. Berapa gram tersisa setelah ${n * 5} tahun?`, ans, grow ? 'Pertumbuhan: A = A₀ × 2ⁿ.' : 'Peluruhan waktu paruh: A = A₀ × (1/2)ⁿ, n = waktu : waktu paruh.', [
          ['Tentukan n', grow ? `n = ${n}` : `n = ${n * 5} : 5 = ${n}`], ['Hitung', grow ? `${a} × 2${sup(n)} = <b>${N(ans)}</b>` : `${a} × (1/2)${sup(n)} = <b>${N(ans)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: G, name: 'Aljabar 1', short: 'A1', stage: 'SMA', ixl: 'https://www.ixl.com/math/algebra-1', sg: 'Kurikulum Merdeka Fase E (kelas 10)' });

  lesson('A1A', 'Persamaan linear diselesaikan dengan operasi kebalikan di kedua ruas.', [
    ['Variabel di kedua ruas', ['Kumpulkan suku x di satu ruas.', 'Kumpulkan konstanta di ruas lain.', 'Bagi dengan koefisien x.'], 'A1A1'],
    ['Pecahan', ['Kalikan kedua ruas dengan penyebut (atau KPK penyebut).'], 'A1A2'],
  ]);
  lesson('A1B', 'Nilai mutlak |x| adalah jarak x dari nol.', [
    ['Persamaan', ['|A| = b → A = b atau A = −b (b ≥ 0).'], 'A1B1'], ['Pertidaksamaan', ['|A| ≤ b → −b ≤ A ≤ b.', '|A| ≥ b → A ≤ −b atau A ≥ b.'], 'A1B2'],
  ]);
  lesson('A1C', 'Fungsi linear y = mx + c punya gradien m dan titik potong sumbu y (0, c).', [
    ['Titik potong', ['Sumbu y: x = 0.', 'Sumbu x: y = 0.'], 'A1C1'], ['Sejajar dan tegak lurus', ['Sejajar: m₁ = m₂.', 'Tegak lurus: m₁ × m₂ = −1.'], 'A1C2'],
  ]);
  lesson('A1D', 'Sistem persamaan linear diselesaikan dengan substitusi, eliminasi, atau grafik.', [
    ['Substitusi', ['Nyatakan satu variabel dari satu persamaan.', 'Masukkan ke persamaan lain.'], 'A1D1'],
  ]);
  lesson('A1E', 'Polinomial adalah jumlah suku-suku berbentuk axⁿ.', [
    ['Perkalian binomial', ['(x + a)(x + b) = x² + (a + b)x + ab.'], 'A1E2'], ['Kuadrat binomial', ['(p + q)² = p² + 2pq + q².'], 'A1E3'],
  ]);
  lesson('A1F', 'Memfaktorkan adalah kebalikan dari mengalikan.', [
    ['Trinomial', ['Cari p, q: p × q = c, p + q = b.'], 'A1F1'], ['Selisih kuadrat', ['p² − q² = (p + q)(p − q).'], 'A1F2'],
  ]);
  lesson('A1G', 'Grafik fungsi kuadrat y = ax² + bx + c berbentuk parabola.', [
    ['Puncak dan sumbu simetri', ['x puncak = −b/(2a).', 'y puncak = f(x puncak).', 'a > 0 terbuka ke atas, a < 0 ke bawah.'], 'A1G2'],
    ['Diskriminan', ['D = b² − 4ac menentukan banyak akar real.'], 'A1G3'],
  ]);
  lesson('A1H', 'Persamaan kuadrat ax² + bx + c = 0 punya paling banyak dua akar.', [
    ['Pemfaktoran', ['Faktorkan, lalu setiap faktor = 0.'], 'A1H1'], ['Rumus ABC', ['x = (−b ± √(b² − 4ac)) / 2a.'], 'A1H2'],
  ]);
  lesson('A1I', 'Fungsi eksponen f(x) = a × bˣ tumbuh (b > 1) atau meluruh (0 < b < 1).', [
    ['Pertumbuhan dan peluruhan', ['Dua kali lipat: × 2 setiap periode.', 'Waktu paruh: × 1/2 setiap periode.'], 'A1I2'],
  ]);
})();
