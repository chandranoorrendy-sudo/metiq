/* Metiq — Kelas 8 (SMP, Fase D). Cakupan mengikuti daftar IXL kelas 8:
 * eksponen dan notasi ilmiah, akar dan bilangan irasional, teorema Pythagoras, barisan,
 * fungsi dan gradien, sistem persamaan linear, transformasi, bangun ruang sisi lengkung, statistika dan peluang.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, lin, num, pil, opt, lesson } = C.kit;
  const pt = (x, y) => `(${N(x)}, ${N(y)})`;

  const UNITS = [
    {
      id: '8A', grade: 8, name: 'Eksponen dan notasi ilmiah', icon: '🔟', color: '#4d96ff', ixl: 'C–D', sg: 'Fase D · Bilangan', km: 'Bilangan',
      tip: 'Jarak Bumi–Matahari sekitar 1,5 × 10⁸ km: notasi ilmiah memudahkan menulis bilangan sangat besar.',
      skills: [
        { id: '8A1', name: 'Sifat perkalian dan pembagian pangkat', gen() { const a = r(2, 9), m = r(2, 9), n = r(2, 9), mul = Math.random() < 0.5; const ans = mul ? m + n : m - n; return num(mul ? `${a}${sup(m)} × ${a}${sup(n)} = ${a}${sup('k')}. Berapa k?` : `${a}${sup(m)} : ${a}${sup(n)} = ${a}${sup('k')}. Berapa k?`, ans, mul ? 'Untuk basis sama, a^m × a^n = a^(m+n).' : 'Untuk basis sama, a^m : a^n = a^(m−n).', [
          ['Basisnya sama (' + a + ')', mul ? 'Jumlahkan pangkatnya.' : 'Kurangkan pangkatnya.'], ['Hitung', `k = ${m} ${mul ? '+' : '−'} ${n} = <b>${N(ans)}</b>`]]); } },
        { id: '8A2', name: 'Pangkat nol dan pangkat negatif', gen() { const a = r(2, 6), n = r(0, 3), neg = n > 0; return num(`${a}${sup(neg ? '−' + n : 0)} = ? ${neg ? '(tulis sebagai pecahan, mis. 1/8)' : ''}`, neg ? F(1, a ** n) : 1, 'a⁰ = 1 untuk a ≠ 0, dan a^(−n) = 1/aⁿ.', neg ? [
          ['Ubah ke pecahan', `${a}${sup('−' + n)} = 1/${a}${sup(n)}`], ['Hitung', `1/${a ** n} → <b>${F(1, a ** n)}</b>`]] : [['Gunakan aturan pangkat nol', `Bilangan selain 0 berpangkat 0 hasilnya <b>1</b>.`]]); } },
        { id: '8A3', name: 'Notasi ilmiah', gen() { const m = r(11, 99) / 10, e = r(3, 9), big = Math.round(m * 10) * 10 ** (e - 1); const s = big.toLocaleString('id-ID'); return num(`${s} = ${N(m)} × 10${sup('n')}. Berapa n?`, e, 'Notasi ilmiah: a × 10ⁿ dengan 1 ≤ a < 10. n = banyak tempat koma digeser.', [
          ['Letakkan koma setelah angka pertama', `${N(m)}`], ['Hitung pergeseran koma', `Koma bergeser ${e} tempat ke kiri, jadi n = <b>${e}</b>.`]]); } },
      ],
    },
    {
      id: '8B', grade: 8, name: 'Akar dan bilangan irasional', icon: '√', color: '#9b6dff', ixl: 'E–F', sg: 'Fase D · Bilangan', km: 'Bilangan',
      tip: '√2 tidak bisa ditulis sebagai pecahan: desimalnya tidak berakhir dan tidak berulang.',
      skills: [
        { id: '8B1', name: 'Akar pangkat tiga', gen() { const k = nz(-10, 10); return num(`∛${N(k ** 3)} = ?`, k, 'Akar pangkat tiga dari n adalah bilangan yang jika dipangkatkan tiga menghasilkan n.', [
          ['Cari bilangannya', `${P(k)} × ${P(k)} × ${P(k)} = ${N(k ** 3)}`], ['Jawab', `<b>${N(k)}</b>`]]); } },
        { id: '8B2', name: 'Menyederhanakan bentuk akar', gen() { const m = pick([2, 3, 5, 6, 7]), k = r(2, 9), n = k * k * m, ans = `${k}√${m}`; return pil(`Sederhanakan √${n}.`, opt(ans, [`${m}√${k}`, `${k * k}√${m}`, `${k}√${m * 2}`, `${k + 1}√${m}`, `√${k * m}`]), ans, '√(a × b) = √a × √b. Pisahkan faktor yang merupakan bilangan kuadrat.', [
          ['Faktorkan', `${n} = ${k * k} × ${m}`], ['Ambil akar bilangan kuadrat', `√${k * k} = ${k}`], ['Hasil', `<b>${ans}</b>`]]); } },
        { id: '8B3', name: 'Rasional atau irasional', gen() { const rat = Math.random() < 0.5; const s = rat ? pick([`√${pick([4, 9, 16, 25, 36, 49, 64, 81])}`, `${r(1, 9)}/${r(2, 9)}`, `0,${r(1, 9)}${r(1, 9)}${r(1, 9)}`, `−${r(2, 30)}`, `0,333...`]) : pick([`√${pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 15])}`, 'π', `${r(2, 5)}√2`]); const ans = rat ? 'rasional' : 'irasional'; return pil(`Apakah ${s} bilangan rasional atau irasional?`, ['rasional', 'irasional'], ans, 'Bilangan rasional bisa ditulis sebagai a/b; desimalnya berakhir atau berulang. Akar dari bilangan yang bukan kuadrat sempurna, dan π, adalah irasional.', [
          ['Periksa bentuknya', rat ? `${s} dapat ditulis sebagai pecahan (desimalnya berakhir atau berulang).` : `${s} desimalnya tidak berakhir dan tidak berulang.`], ['Jawab', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: '8C', grade: 8, name: 'Teorema Pythagoras', icon: '📐', color: '#ff7a59', ixl: 'T', sg: 'Fase D · Geometri', km: 'Geometri',
      tip: 'Tukang bangunan memakai 3–4–5 untuk membuat sudut siku-siku yang tepat.',
      skills: [
        { id: '8C1', name: 'Mencari sisi miring', gen() { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 12, 15], [12, 16, 20], [20, 21, 29]]); return num(`Sisi siku-siku segitiga ${a} cm dan ${b} cm. Berapa cm sisi miringnya?`, c, 'Pada segitiga siku-siku: c² = a² + b² (c = sisi miring).', [
          ['Kuadratkan sisi siku-siku', `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}`], ['Ambil akar', `c = √${c * c} = <b>${c}</b> cm`]], { unit: 'cm' }); } },
        { id: '8C2', name: 'Mencari sisi siku-siku', gen() { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 40, 41], [12, 35, 37]]); return num(`Sisi miring segitiga siku-siku ${c} cm dan salah satu sisi siku-sikunya ${a} cm. Berapa cm sisi yang lain?`, b, 'b² = c² − a².', [
          ['Kurangkan kuadratnya', `${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}`], ['Ambil akar', `b = √${b * b} = <b>${b}</b> cm`]], { unit: 'cm' }); } },
        { id: '8C3', name: 'Jarak dua titik', gen() { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [12, 5, 13]]); const x1 = r(-5, 5), y1 = r(-5, 5), sx = pick([1, -1]), sy = pick([1, -1]); return num(`Berapa jarak titik ${pt(x1, y1)} dan ${pt(x1 + sx * a, y1 + sy * b)}?`, c, 'Jarak = √((x₂ − x₁)² + (y₂ − y₁)²), yaitu teorema Pythagoras pada bidang koordinat.', [
          ['Selisih koordinat', `Δx = ${a}, Δy = ${b}`], ['Pythagoras', `√(${a * a} + ${b * b}) = √${c * c} = <b>${c}</b>`]]); } },
      ],
    },
    {
      id: '8D', grade: 8, name: 'Pola dan barisan', icon: '🔢', color: '#1fbf9f', ixl: 'FF', sg: 'Fase D · Aljabar', km: 'Aljabar',
      tip: 'Susun batang korek api menjadi pola segitiga dan hitung batang yang diperlukan untuk pola ke-10.',
      skills: [
        { id: '8D1', name: 'Suku ke-n barisan aritmetika', gen() { const a = r(-10, 15), b = nz(-6, 8), n = r(8, 30), ans = a + (n - 1) * b; return num(`Barisan ${[0, 1, 2, 3].map((i) => N(a + i * b)).join(', ')}, ... Berapa suku ke-${n}?`, ans, 'Barisan aritmetika: Uₙ = a + (n − 1)b, dengan a suku pertama dan b beda.', [
          ['Tentukan a dan b', `a = ${N(a)}, b = ${N(a + b)} − ${P(a)} = ${N(b)}`], ['Substitusi', `U${'<sub>' + n + '</sub>'} = ${N(a)} + ${n - 1} × ${P(b)} = <b>${N(ans)}</b>`]]); } },
        { id: '8D2', name: 'Barisan geometri', gen() { const a = nz(-4, 5), k = pick([2, 3, -2]), n = r(5, 7), ans = a * k ** (n - 1); return num(`Barisan ${[0, 1, 2, 3].map((i) => N(a * k ** i)).join(', ')}, ... Berapa suku ke-${n}?`, ans, 'Barisan geometri: Uₙ = a × r^(n−1), dengan r rasio (pembanding).', [
          ['Tentukan a dan r', `a = ${N(a)}, r = ${N(a * k)} : ${P(a)} = ${N(k)}`], ['Substitusi', `${N(a)} × ${P(k)}${sup(n - 1)} = ${N(a)} × ${N(k ** (n - 1))} = <b>${N(ans)}</b>`]]); } },
      ],
    },
    {
      id: '8E', grade: 8, name: 'Fungsi dan gradien', icon: '📈', color: '#e84393', ixl: 'Z–CC', sg: 'Fase D · Aljabar', km: 'Aljabar',
      tip: 'Gradien seperti kemiringan tanjakan: naik berapa untuk setiap satu langkah ke kanan.',
      skills: [
        { id: '8E1', name: 'Nilai fungsi', gen() { const a = nz(-5, 6), b = nz(-9, 9), x = nz(-6, 6), ans = a * x + b; return num(`f(x) = ${lin(a, b)}. Berapa f(${N(x)})?`, ans, 'f(a) berarti substitusikan x = a ke rumus fungsi.', [
          ['Substitusi', `f(${N(x)}) = ${N(a)} × ${P(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`], ['Hitung', `<b>${N(ans)}</b>`]]); } },
        { id: '8E2', name: 'Gradien garis melalui dua titik', gen() { const x1 = r(-6, 6), y1 = r(-6, 6), dx = nz(-6, 6), dy = nz(-8, 8); return num(`Berapa gradien garis yang melalui ${pt(x1, y1)} dan ${pt(x1 + dx, y1 + dy)}? (pecahan paling sederhana jika perlu)`, F(dy, dx), 'm = (y₂ − y₁) / (x₂ − x₁).', [
          ['Selisih y', `${N(y1 + dy)} − ${P(y1)} = ${N(dy)}`], ['Selisih x', `${N(x1 + dx)} − ${P(x1)} = ${N(dx)}`], ['Bagi', `m = ${N(dy)}/${N(dx)} = <b>${F(dy, dx)}</b>`]]); } },
        { id: '8E3', name: 'Persamaan garis y = mx + c', gen() { const m = nz(-5, 5), x1 = nz(-5, 5), c = r(-9, 9), y1 = m * x1 + c; return num(`Garis bergradien ${N(m)} melalui titik ${pt(x1, y1)}. Persamaannya y = ${N(m)}x + c. Berapa c?`, c, 'Substitusikan titik ke y = mx + c, lalu selesaikan c.', [
          ['Substitusi', `${N(y1)} = ${N(m)} × ${P(x1)} + c = ${N(m * x1)} + c`], ['Selesaikan', `c = ${N(y1)} − ${P(m * x1)} = <b>${N(c)}</b>`]]); } },
      ],
    },
    {
      id: '8F', grade: 8, name: 'Sistem persamaan linear dua variabel', icon: '✖️', color: '#00b894', ixl: 'GG', sg: 'Fase D · Aljabar', km: 'Aljabar',
      tip: 'Harga 2 pensil + 1 buku dan 1 pensil + 1 buku: kurangkan untuk mendapat harga satu pensil.',
      skills: [
        { id: '8F1', name: 'Metode eliminasi', gen() { const x = nz(-6, 8), y = nz(-6, 8), a = nz(1, 4), b = nz(-4, 4), d = nz(-4, 4), c1 = a * x + b * y, c2 = a * x + d * y; if (b === d) return C.SKILLS['8F1'].gen(); return num(`${lin(a, 0)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${N(c1)}<br>${lin(a, 0)} ${d < 0 ? '−' : '+'} ${Math.abs(d) === 1 ? '' : Math.abs(d)}y = ${N(c2)}<br>Berapa y?`, y, 'Kurangkan kedua persamaan agar x hilang (koefisien x sama).', [
          ['Kurangkan persamaan 1 − persamaan 2', `(${N(b)} − ${P(d)})y = ${N(c1)} − ${P(c2)} → ${N(b - d)}y = ${N(c1 - c2)}`], ['Bagi', `y = ${N(c1 - c2)} : ${P(b - d)} = <b>${N(y)}</b>`]]); } },
        { id: '8F2', name: 'Soal cerita sistem persamaan', gen() { const p = pick([2000, 3000, 4000, 5000]), b = pick([6000, 8000, 10000, 12000]), n1 = r(2, 4), n2 = r(1, 3); const t1 = n1 * p + b, t2 = n2 * p + b; if (n1 === n2) return C.SKILLS['8F2'].gen(); const ask = pick(['pensil', 'buku']); return num(`${n1} pensil dan 1 buku harganya Rp${t1.toLocaleString('id-ID')}. ${n2} pensil dan 1 buku harganya Rp${t2.toLocaleString('id-ID')}. Berapa rupiah harga 1 ${ask}? (angkanya saja)`, ask === 'pensil' ? p : b, 'Misalkan harga pensil p dan buku b, lalu eliminasi b.', [
          ['Tulis persamaan', `${n1}p + b = ${t1.toLocaleString('id-ID')} dan ${n2}p + b = ${t2.toLocaleString('id-ID')}`], ['Kurangkan', `${n1 - n2}p = ${(t1 - t2).toLocaleString('id-ID')} → p = ${p.toLocaleString('id-ID')}`], ask === 'pensil' ? ['Jawab', `<b>${p.toLocaleString('id-ID')}</b>`] : ['Substitusi', `b = ${t1.toLocaleString('id-ID')} − ${n1} × ${p.toLocaleString('id-ID')} = <b>${b.toLocaleString('id-ID')}</b>`]], { unit: 'Rp' }); } },
      ],
    },
    {
      id: '8G', grade: 8, name: 'Transformasi geometri', icon: '🔄', color: '#fdcb6e', ixl: 'R–S', sg: 'Fase D · Geometri', km: 'Geometri',
      tip: 'Cermin menunjukkan refleksi; lampu senter yang didekatkan ke dinding menunjukkan dilatasi.',
      skills: [
        { id: '8G1', name: 'Translasi', gen() { const x = r(-6, 6), y = r(-6, 6), a = nz(-5, 5), b = nz(-5, 5), ans = pt(x + a, y + b); return pil(`Titik ${pt(x, y)} digeser ${Math.abs(a)} satuan ke ${a > 0 ? 'kanan' : 'kiri'} dan ${Math.abs(b)} satuan ke ${b > 0 ? 'atas' : 'bawah'}. Di mana bayangannya?`, opt(ans, [pt(x - a, y + b), pt(x + a, y - b), pt(x + b, y + a), pt(x - a, y - b)]), ans, 'Translasi (a, b): (x, y) → (x + a, y + b).', [
          ['Geser x', `${N(x)} + ${P(a)} = ${N(x + a)}`], ['Geser y', `${N(y)} + ${P(b)} = ${N(y + b)}`], ['Bayangan', `<b>${ans}</b>`]]); } },
        { id: '8G2', name: 'Refleksi', gen() { const x = nz(-7, 7), y = nz(-7, 7); const [nm, X, Y] = pick([['sumbu x', x, -y], ['sumbu y', -x, y], ['titik asal O', -x, -y], ['garis y = x', y, x]]); const ans = pt(X, Y); return pil(`Titik ${pt(x, y)} dicerminkan terhadap ${nm}. Di mana bayangannya?`, opt(ans, [pt(x, -y), pt(-x, y), pt(-x, -y), pt(y, x), pt(-y, -x)]), ans, 'Sumbu x: (x, −y). Sumbu y: (−x, y). Titik asal: (−x, −y). Garis y = x: (y, x).', [
          ['Gunakan aturan refleksi terhadap ' + nm, `${pt(x, y)} → <b>${ans}</b>`]]); } },
        { id: '8G3', name: 'Dilatasi', gen() { const k = pick([2, 3, -2, 0.5]), x = nz(-6, 6) * (k === 0.5 ? 2 : 1), y = nz(-6, 6) * (k === 0.5 ? 2 : 1), ans = pt(k * x, k * y); return pil(`Titik ${pt(x, y)} didilatasi dengan pusat O dan faktor skala ${N(k)}. Di mana bayangannya?`, opt(ans, [pt(x + k, y + k), pt(k * x, y), pt(x, k * y), pt(-k * x, -k * y)]), ans, 'Dilatasi pusat O dengan faktor k: (x, y) → (kx, ky).', [
          ['Kalikan setiap koordinat dengan ' + N(k), `(${N(k)} × ${P(x)}, ${N(k)} × ${P(y)})`], ['Bayangan', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: '8H', grade: 8, name: 'Bangun ruang sisi lengkung', icon: '🥫', color: '#00a8cc', ixl: 'W', sg: 'Fase D · Pengukuran', km: 'Pengukuran',
      tip: 'Kaleng susu berbentuk tabung, cone es krim berbentuk kerucut, bola sepak berbentuk bola.',
      skills: [
        { id: '8H1', name: 'Volume tabung', gen() { const rr = pick([7, 14]), t = r(2, 20); return num(`Tabung berjari-jari ${rr} cm dan tinggi ${t} cm. Berapa cm³ volumenya? (π = 22/7)`, (22 * rr * rr * t) / 7, 'Volume tabung = πr²t.', [
          ['Luas alas', `22/7 × ${rr}² = ${(22 * rr * rr) / 7} cm²`], ['Kalikan tinggi', `${(22 * rr * rr) / 7} × ${t} = <b>${N((22 * rr * rr * t) / 7)}</b> cm³`]], { unit: 'cm³' }); } },
        { id: '8H2', name: 'Volume kerucut', gen() { const rr = pick([7, 14]), t = pick([3, 6, 9, 12, 15]); return num(`Kerucut berjari-jari ${rr} cm dan tinggi ${t} cm. Berapa cm³ volumenya? (π = 22/7)`, (22 * rr * rr * t) / 21, 'Volume kerucut = ⅓πr²t.', [
          ['Hitung πr²t', `22/7 × ${rr}² × ${t} = ${(22 * rr * rr * t) / 7}`], ['Bagi 3', `${(22 * rr * rr * t) / 7} : 3 = <b>${N((22 * rr * rr * t) / 21)}</b> cm³`]], { unit: 'cm³' }); } },
        { id: '8H3', name: 'Volume bola', gen() { const rr = pick([3, 6, 9]); return num(`Bola berjari-jari ${rr} cm. Volumenya kπ cm³. Berapa k?`, (4 * rr ** 3) / 3, 'Volume bola = 4/3 πr³.', [
          ['Hitung r³', `${rr}³ = ${rr ** 3}`], ['Kalikan 4/3', `4/3 × ${rr ** 3} = <b>${N((4 * rr ** 3) / 3)}</b>, jadi volumenya ${N((4 * rr ** 3) / 3)}π cm³`]]); } },
      ],
    },
    {
      id: '8I', grade: 8, name: 'Statistika dan peluang', icon: '📊', color: '#9b6dff', ixl: 'HH–KK', sg: 'Fase D · Analisis Data dan Peluang', km: 'Analisis Data dan Peluang',
      tip: 'Lempar dua koin 20 kali dan catat hasilnya; bandingkan dengan peluang teoretisnya.',
      skills: [
        { id: '8I1', name: 'Jangkauan dan kuartil', gen() { const xs = Array.from({ length: 7 }, () => r(10, 60)); const s = [...xs].sort((a, b) => a - b); const kind = pick(['jangkauan', 'Q1', 'Q3']); const ans = kind === 'jangkauan' ? s[6] - s[0] : kind === 'Q1' ? s[1] : s[5]; return num(`Data: ${xs.join(', ')}. Berapa ${kind === 'jangkauan' ? 'jangkauannya' : 'kuartil ' + (kind === 'Q1' ? 'bawah (Q1)' : 'atas (Q3)')}?`, ans, 'Jangkauan = data terbesar − terkecil. Untuk 7 data terurut, Q1 = data ke-2, median = data ke-4, Q3 = data ke-6.', [
          ['Urutkan', s.join(', ')], ['Jawab', kind === 'jangkauan' ? `${s[6]} − ${s[0]} = <b>${ans}</b>` : `${kind} = data ke-${kind === 'Q1' ? 2 : 6} = <b>${ans}</b>`]]); } },
        { id: '8I2', name: 'Rata-rata gabungan', gen() { const n1 = r(10, 30), n2 = r(10, 30), m1 = r(60, 90), m2 = r(60, 90), tot = n1 * m1 + n2 * m2; if (tot % (n1 + n2)) return C.SKILLS['8I2'].gen(); return num(`Rata-rata nilai ${n1} siswa kelas A adalah ${m1}, dan rata-rata ${n2} siswa kelas B adalah ${m2}. Berapa rata-rata gabungannya?`, tot / (n1 + n2), 'Rata-rata gabungan = (jumlah nilai A + jumlah nilai B) : banyak siswa seluruhnya.', [
          ['Jumlah nilai', `${n1} × ${m1} + ${n2} × ${m2} = ${n1 * m1} + ${n2 * m2} = ${tot}`], ['Bagi banyak siswa', `${tot} : ${n1 + n2} = <b>${N(tot / (n1 + n2))}</b>`]]); } },
        { id: '8I3', name: 'Peluang kejadian majemuk', gen() { const k = pick(['dadu', 'koin']); if (k === 'koin') { const n = pick([2, 3]); const h = r(0, n); const ways = C.kit.nCr(n, h), tot = 2 ** n; return num(`${n} koin dilempar bersama. Berapa peluang muncul tepat ${h} gambar? (pecahan paling sederhana)`, F(ways, tot), 'Peluang = banyak hasil yang diinginkan : banyak ruang sampel.', [
          ['Ruang sampel', `2${sup(n)} = ${tot} hasil`], ['Hasil yang diinginkan', `Memilih ${h} gambar dari ${n} koin: ${ways} cara`], ['Peluang', `${ways}/${tot} = <b>${F(ways, tot)}</b>`]]); }
          const s = r(3, 11); const ways = 6 - Math.abs(7 - s); return num(`Dua dadu dilempar. Berapa peluang jumlah mata dadu ${s}? (pecahan paling sederhana)`, F(ways, 36), 'Dua dadu punya 6 × 6 = 36 hasil yang sama mungkin.', [
          ['Daftar pasangan', Array.from({ length: 6 }, (_, i) => i + 1).filter((a) => s - a >= 1 && s - a <= 6).map((a) => `(${a}, ${s - a})`).join(', ')], ['Hitung', `${ways} pasangan dari 36 → <b>${F(ways, 36)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: 8, name: 'Kelas 8', short: '8', stage: 'SMP', ixl: 'https://www.ixl.com/math/grade-8', sg: 'Kurikulum Merdeka Fase D (SMP)' });

  lesson('8A', 'Sifat-sifat pangkat memudahkan menghitung perkalian bilangan berpangkat.', [
    ['Sifat pangkat', ['aᵐ × aⁿ = aᵐ⁺ⁿ', 'aᵐ : aⁿ = aᵐ⁻ⁿ', 'a⁰ = 1 dan a⁻ⁿ = 1/aⁿ'], '8A1'],
    ['Notasi ilmiah', ['Tulis sebagai a × 10ⁿ dengan 1 ≤ a < 10.', 'n = banyak tempat koma digeser.'], '8A3'],
  ]);
  lesson('8B', 'Bilangan real terdiri atas bilangan rasional dan irasional.', [
    ['Bentuk akar', ['Cari faktor kuadrat terbesar: √72 = √36 × √2 = 6√2.'], '8B2'],
    ['Irasional', ['√2, √3, π: desimalnya tidak berakhir dan tidak berulang.'], '8B3'],
  ]);
  lesson('8C', 'Teorema Pythagoras: pada segitiga siku-siku, c² = a² + b².', [
    ['Sisi miring', ['Kuadratkan kedua sisi siku-siku, jumlahkan, lalu ambil akarnya.'], '8C1'],
    ['Sisi siku-siku', ['Kurangkan kuadrat sisi siku-siku yang diketahui dari kuadrat sisi miring.'], '8C2'],
  ]);
  lesson('8D', 'Barisan aritmetika bertambah dengan beda tetap; barisan geometri dikali rasio tetap.', [
    ['Aritmetika', ['Uₙ = a + (n − 1)b'], '8D1'], ['Geometri', ['Uₙ = a × rⁿ⁻¹'], '8D2'],
  ]);
  lesson('8E', 'Fungsi linear berbentuk f(x) = mx + c; m adalah gradien dan c titik potong sumbu y.', [
    ['Gradien', ['m = (y₂ − y₁)/(x₂ − x₁).', 'Gradien positif: garis naik; negatif: garis turun.'], '8E2'],
    ['Persamaan garis', ['Substitusikan satu titik ke y = mx + c untuk mencari c.'], '8E3'],
  ]);
  lesson('8F', 'Sistem persamaan linear dua variabel diselesaikan dengan eliminasi atau substitusi.', [
    ['Eliminasi', ['Samakan koefisien salah satu variabel.', 'Jumlahkan atau kurangkan persamaan.', 'Substitusikan untuk mencari variabel lainnya.'], '8F1'],
  ]);
  lesson('8G', 'Transformasi memindahkan atau mengubah ukuran bangun pada bidang koordinat.', [
    ['Translasi dan refleksi', ['Translasi (a, b): (x + a, y + b).', 'Refleksi sumbu x: (x, −y); sumbu y: (−x, y).'], '8G2'],
    ['Dilatasi', ['Pusat O, faktor k: (kx, ky).'], '8G3'],
  ]);
  lesson('8H', 'Tabung, kerucut, dan bola adalah bangun ruang sisi lengkung.', [
    ['Rumus volume', ['Tabung: πr²t.', 'Kerucut: ⅓πr²t.', 'Bola: 4/3 πr³.'], '8H1'],
  ]);
  lesson('8I', 'Ukuran penyebaran menunjukkan seberapa tersebar data.', [
    ['Jangkauan dan kuartil', ['Jangkauan = maksimum − minimum.', 'Kuartil membagi data terurut menjadi empat bagian sama banyak.'], '8I1'],
    ['Peluang majemuk', ['Daftar semua hasil (ruang sampel), lalu hitung yang diinginkan.'], '8I3'],
  ]);
})();
