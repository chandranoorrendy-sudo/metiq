/* Metiq — Kelas 7 (SMP, Fase D). Cakupan mengikuti daftar IXL kelas 7:
 * bilangan bulat dan rasional, pangkat dan akar, perbandingan dan persen, aljabar, persamaan linear,
 * garis dan sudut, lingkaran dan volume, statistika, dan peluang.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, N, P, nz, F, FH, sup, lin, num, pil, opt, lesson } = C.kit;

  const UNITS = [
    {
      id: '7A', grade: 7, name: 'Bilangan bulat', icon: '➖', color: '#4d96ff', ixl: 'A–B', sg: 'Fase D · Bilangan', km: 'Bilangan',
      tip: 'Pakai garis bilangan atau suhu termometer: naik = tambah, turun = kurang.',
      skills: [
        { id: '7A1', name: 'Menjumlah dan mengurangi bilangan bulat', gen() { const a = nz(-20, 20), b = nz(-20, 20), add = Math.random() < 0.5, ans = add ? a + b : a - b; return num(`${N(a)} ${add ? '+' : '−'} ${P(b)} = ?`, ans, 'Mengurangi sama dengan menjumlah lawannya: a − b = a + (−b). Tanda sama dijumlah, tanda beda dikurangi.', [
          ['Ubah ke penjumlahan', add ? `${N(a)} + ${P(b)}` : `${N(a)} − ${P(b)} = ${N(a)} + ${P(-b)}`],
          ['Hitung', `Hasilnya <b>${N(ans)}</b>.`]], { meta: { kind: 'neg' } }); } },
        { id: '7A2', name: 'Mengalikan dan membagi bilangan bulat', gen() { const a = nz(-12, 12), b = nz(-12, 12), mul = Math.random() < 0.5; if (mul) return num(`${N(a)} × ${P(b)} = ?`, a * b, 'Positif × positif dan negatif × negatif hasilnya positif; tanda berbeda hasilnya negatif.', [
          ['Kalikan nilainya', `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a * b)}`], ['Tentukan tanda', `Tanda ${(a < 0) === (b < 0) ? 'sama → positif' : 'berbeda → negatif'}. Hasilnya <b>${N(a * b)}</b>.`]], { meta: { kind: 'neg' } });
          const t = a * b; return num(`${N(t)} : ${P(b)} = ?`, a, 'Aturan tanda pembagian sama dengan perkalian.', [
          ['Bagi nilainya', `${Math.abs(t)} : ${Math.abs(b)} = ${Math.abs(a)}`], ['Tentukan tanda', `Tanda ${(t < 0) === (b < 0) ? 'sama → positif' : 'berbeda → negatif'}. Hasilnya <b>${N(a)}</b>.`]], { meta: { kind: 'neg' } }); } },
        { id: '7A3', name: 'Operasi hitung campuran bilangan bulat', gen() { const a = nz(-9, 9), b = nz(-9, 9), c = nz(-9, 9), ans = a + b * c; return num(`${N(a)} + ${P(b)} × ${P(c)} = ?`, ans, 'Kerjakan perkalian dan pembagian lebih dulu, lalu penjumlahan dan pengurangan.', [
          ['Kali dulu', `${P(b)} × ${P(c)} = ${N(b * c)}`], ['Lalu jumlahkan', `${N(a)} + ${P(b * c)} = <b>${N(ans)}</b>`]], { meta: { kind: 'neg' } }); } },
      ],
    },
    {
      id: '7B', grade: 7, name: 'Bilangan rasional', icon: '½', color: '#ff7a59', ixl: 'C–I', sg: 'Fase D · Bilangan', km: 'Bilangan',
      tip: 'Samakan penyebut dengan KPK sebelum menjumlah pecahan.',
      skills: [
        { id: '7B1', name: 'Menjumlah dan mengurangi pecahan', gen() { const b = r(2, 9), d = pick([2, 3, 4, 5, 6].filter((x) => x !== b)), a = nz(-8, 8), c = r(1, 8), add = Math.random() < 0.5; const n = add ? a * d + c * b : a * d - c * b; return num(`${FH(a, b)} ${add ? '+' : '−'} ${FH(c, d)} = ? (tulis pecahan paling sederhana, mis. 7/12)`, F(n, b * d), 'Samakan penyebut, lalu jumlah atau kurangkan pembilangnya.', [
          ['Samakan penyebut', `${FH(a, b)} = ${a * d}/${b * d} dan ${FH(c, d)} = ${c * b}/${b * d}`], [add ? 'Jumlahkan pembilang' : 'Kurangkan pembilang', `${a * d} ${add ? '+' : '−'} ${c * b} = ${n}, jadi ${n}/${b * d}`], ['Sederhanakan', `<b>${F(n, b * d)}</b>`]]); } },
        { id: '7B2', name: 'Mengalikan dan membagi pecahan', gen() { const a = nz(-6, 6), b = r(2, 9), c = r(1, 6), d = r(2, 9), mul = Math.random() < 0.5; if (mul) return num(`${FH(a, b)} × ${FH(c, d)} = ? (pecahan paling sederhana)`, F(a * c, b * d), 'Kalikan pembilang dengan pembilang dan penyebut dengan penyebut.', [
          ['Kalikan', `(${a} × ${c}) / (${b} × ${d}) = ${a * c}/${b * d}`], ['Sederhanakan', `<b>${F(a * c, b * d)}</b>`]]);
          return num(`${FH(a, b)} : ${FH(c, d)} = ? (pecahan paling sederhana)`, F(a * d, b * c), 'Membagi dengan pecahan sama dengan mengalikan dengan kebalikannya.', [
          ['Balik pecahan pembagi', `${FH(c, d)} → ${FH(d, c)}`], ['Kalikan', `${FH(a, b)} × ${d}/${c} = ${a * d}/${b * c}`], ['Sederhanakan', `<b>${F(a * d, b * c)}</b>`]]); } },
        { id: '7B3', name: 'Mengubah pecahan ke desimal', gen() { const [a, b] = pick([[1, 4], [3, 4], [1, 8], [3, 8], [5, 8], [1, 5], [2, 5], [7, 20], [9, 25], [3, 40], [7, 8], [11, 20]]); return num(`Tulis ${FH(a, b)} sebagai desimal.`, a / b, 'Pecahan berarti pembagian: pembilang dibagi penyebut.', [
          ['Ubah penyebut ke 10, 100, atau 1000 bila bisa', `${a}/${b} = ${a * (1000 / b)}/1000`], ['Tulis desimalnya', `<b>${N(a / b)}</b>`]], { meta: { kind: 'decimal' } }); } },
      ],
    },
    {
      id: '7C', grade: 7, name: 'Pangkat dan akar kuadrat', icon: '²', color: '#9b6dff', ixl: 'J–K', sg: 'Fase D · Bilangan', km: 'Bilangan',
      tip: 'Hafalkan kuadrat 1 sampai 15 untuk menghitung akar dengan cepat.',
      skills: [
        { id: '7C1', name: 'Menghitung nilai pangkat', gen() { const a = nz(-6, 6), n = r(2, a > 3 || a < -3 ? 3 : 4), ans = a ** n, paren = a < 0; return num(`${paren ? `(${N(a)})` : N(a)}${sup(n)} = ?`, ans, `a${sup('n')} berarti a dikalikan dengan dirinya sendiri sebanyak n kali.`, [
          ['Tulis perkaliannya', Array(n).fill(P(a)).join(' × ')], ['Hitung', `Hasilnya <b>${N(ans)}</b>${a < 0 ? ` (pangkat ${n % 2 ? 'ganjil → negatif' : 'genap → positif'})` : ''}.`]], { meta: { kind: 'neg' } }); } },
        { id: '7C2', name: 'Akar kuadrat', gen() { const k = r(2, 20); return num(`√${k * k} = ?`, k, 'Akar kuadrat dari n adalah bilangan positif yang jika dikuadratkan menghasilkan n.', [
          ['Cari bilangan yang dikuadratkan', `${k} × ${k} = ${k * k}`], ['Jawab', `√${k * k} = <b>${k}</b>`]]); } },
        { id: '7C3', name: 'Urutan operasi dengan pangkat', gen() { const a = r(2, 5), b = r(2, 9), c = r(1, 9), ans = a * a + b * c; return num(`${a}${sup(2)} + ${b} × ${c} = ?`, ans, 'Urutan: kurung, pangkat, kali/bagi, lalu tambah/kurang.', [
          ['Pangkat dulu', `${a}${sup(2)} = ${a * a}`], ['Lalu perkalian', `${b} × ${c} = ${b * c}`], ['Terakhir penjumlahan', `${a * a} + ${b * c} = <b>${ans}</b>`]]); } },
      ],
    },
    {
      id: '7D', grade: 7, name: 'Perbandingan dan persen', icon: '%', color: '#1fbf9f', ixl: 'L, N–P', sg: 'Fase D · Bilangan', km: 'Bilangan',
      tip: 'Hitung diskon, pajak, dan bunga tabungan bersama saat belanja.',
      skills: [
        { id: '7D1', name: 'Perbandingan senilai', gen() { const a = r(2, 9), b = r(2, 9), k = r(2, 9); return num(`${a} : ${b} = ${a * k} : x. Berapa x?`, b * k, 'Pada perbandingan senilai, kedua suku dikalikan bilangan yang sama.', [
          ['Cari faktor pengali', `${a * k} : ${a} = ${k}`], ['Kalikan suku kedua', `x = ${b} × ${k} = <b>${b * k}</b>`]]); } },
        { id: '7D2', name: 'Persen dari suatu bilangan', gen() { const p = pick([5, 10, 12, 15, 20, 25, 30, 40, 75]), n = pick([40, 60, 80, 120, 200, 240, 360, 400, 500]); return num(`${p}% dari ${n} = ?`, (p * n) / 100, 'p% dari n = p/100 × n.', [
          ['Tulis sebagai perkalian', `${p}/100 × ${n}`], ['Hitung', `${p * n} : 100 = <b>${N((p * n) / 100)}</b>`]]); } },
        { id: '7D3', name: 'Diskon dan harga akhir', gen() { const h = pick([40000, 60000, 80000, 120000, 150000, 200000]), d = pick([10, 15, 20, 25, 30, 40]), cut = (h * d) / 100; return num(`Harga baju Rp${h.toLocaleString('id-ID')} didiskon ${d}%. Berapa rupiah harga setelah diskon? (angkanya saja)`, h - cut, 'Harga akhir = harga awal − besar diskon.', [
          ['Hitung diskon', `${d}% × ${h.toLocaleString('id-ID')} = ${cut.toLocaleString('id-ID')}`], ['Kurangkan', `${h.toLocaleString('id-ID')} − ${cut.toLocaleString('id-ID')} = <b>${(h - cut).toLocaleString('id-ID')}</b>`]], { unit: 'Rp' }); } },
        { id: '7D4', name: 'Bunga tunggal', gen() { const m = pick([1000000, 2000000, 5000000]), p = pick([4, 5, 6, 8, 10]), t = r(1, 3), b = (m * p * t) / 100; return num(`Tabungan Rp${m.toLocaleString('id-ID')} mendapat bunga tunggal ${p}% per tahun. Berapa bunga setelah ${t} tahun? (angkanya saja)`, b, 'Bunga tunggal = modal × persen bunga × lama (tahun).', [
          ['Bunga satu tahun', `${p}% × ${m.toLocaleString('id-ID')} = ${((m * p) / 100).toLocaleString('id-ID')}`], ['Kalikan lamanya', `${((m * p) / 100).toLocaleString('id-ID')} × ${t} = <b>${b.toLocaleString('id-ID')}</b>`]], { unit: 'Rp' }); } },
      ],
    },
    {
      id: '7E', grade: 7, name: 'Bentuk aljabar', icon: '𝑥', color: '#e84393', ixl: 'R–S', sg: 'Fase D · Aljabar', km: 'Aljabar',
      tip: 'Suku sejenis seperti buah yang sama: 3 apel + 2 apel = 5 apel, tetapi apel dan jeruk tidak bisa digabung.',
      skills: [
        { id: '7E1', name: 'Substitusi nilai variabel', gen() { const a = nz(-5, 6), b = nz(-9, 9), x = nz(-5, 5), ans = a * x + b; return num(`Jika x = ${N(x)}, berapa nilai ${lin(a, b)}?`, ans, 'Ganti setiap x dengan nilainya, lalu hitung.', [
          ['Substitusi', `${N(a)} × ${P(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`], ['Hitung', `${N(a * x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = <b>${N(ans)}</b>`]]); } },
        { id: '7E2', name: 'Menyederhanakan suku sejenis', gen() { const a = nz(-6, 8), b = nz(-6, 8), c = nz(-9, 9), d = nz(-9, 9); const ans = lin(a + b, c + d); return pil(`Sederhanakan: ${lin(a, c)} + (${lin(b, d)})`, opt(ans, [lin(a + b, c - d), lin(a - b, c + d), lin(a + b + 1, c + d), lin(a + b, c + d + 1), lin(a * b, c + d)]), ans, 'Kelompokkan suku yang memuat x dan suku konstanta, lalu jumlahkan koefisiennya.', [
          ['Gabungkan suku x', `${N(a)}x + ${P(b)}x = ${N(a + b)}x`], ['Gabungkan konstanta', `${N(c)} + ${P(d)} = ${N(c + d)}`], ['Hasil', `<b>${ans}</b>`]]); } },
        { id: '7E3', name: 'Sifat distributif', gen() { const k = nz(-6, 7), a = nz(-5, 6), b = nz(-9, 9), ans = lin(k * a, k * b); return pil(`${N(k)}(${lin(a, b)}) = ?`, opt(ans, [lin(k * a, b), lin(a, k * b), lin(k * a, -k * b), lin(k + a, k * b), lin(k * a, k + b)]), ans, 'k(a + b) = ka + kb: kalikan bilangan di luar kurung ke setiap suku di dalam.', [
          ['Kalikan ke suku pertama', `${N(k)} × ${lin(a, 0)} = ${lin(k * a, 0)}`], ['Kalikan ke suku kedua', `${N(k)} × ${P(b)} = ${N(k * b)}`], ['Hasil', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: '7F', grade: 7, name: 'Persamaan dan pertidaksamaan linear', icon: '⚖️', color: '#00b894', ixl: 'T–U', sg: 'Fase D · Aljabar', km: 'Aljabar',
      tip: 'Persamaan seperti timbangan: apa pun yang dilakukan di kiri, lakukan juga di kanan.',
      skills: [
        { id: '7F1', name: 'Menyelesaikan ax + b = c', gen() { const a = nz(-9, 9), x = nz(-10, 10), b = nz(-15, 15), c = a * x + b; return num(`${lin(a, b)} = ${N(c)}. Berapa x?`, x, 'Pindahkan konstanta ke ruas kanan, lalu bagi dengan koefisien x.', [
          ['Kurangi kedua ruas dengan ' + N(b), `${lin(a, 0)} = ${N(c)} − ${P(b)} = ${N(c - b)}`], ['Bagi dengan ' + N(a), `x = ${N(c - b)} : ${P(a)} = <b>${N(x)}</b>`], ['Periksa', `${N(a)} × ${P(x)} + ${P(b)} = ${N(c)} ✓`]]); } },
        { id: '7F2', name: 'Persamaan dengan kurung', gen() { const a = nz(-6, 6), b = nz(-9, 9), x = nz(-8, 8), c = a * (x + b); return num(`${N(a)}(x ${b < 0 ? '−' : '+'} ${Math.abs(b)}) = ${N(c)}. Berapa x?`, x, 'Bagi kedua ruas dengan bilangan di luar kurung, atau lepas kurung dulu.', [
          ['Bagi kedua ruas dengan ' + N(a), `x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${N(c)} : ${P(a)} = ${N(c / a)}`], ['Pindahkan konstanta', `x = ${N(c / a)} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = <b>${N(x)}</b>`]]); } },
        { id: '7F3', name: 'Pertidaksamaan linear', gen() { const a = nz(-6, 6), x0 = nz(-8, 8), b = nz(-9, 9), c = a * x0 + b, s = pick(['<', '>']); const flip = a < 0, rs = flip ? (s === '<' ? '>' : '<') : s; const ans = `x ${rs} ${N(x0)}`, wrong = `x ${rs === '<' ? '>' : '<'} ${N(x0)}`; return pil(`Selesaikan: ${lin(a, b)} ${s} ${N(c)}`, opt(ans, [wrong, `x ${rs} ${N(-x0)}`, `x ${rs === '<' ? '>' : '<'} ${N(-x0)}`, `x ${rs} ${N(x0 + 1)}`]), ans, 'Sama seperti persamaan, tetapi jika kedua ruas dikali atau dibagi bilangan negatif, tanda pertidaksamaan berbalik.', [
          ['Pindahkan konstanta', `${lin(a, 0)} ${s} ${N(c - b)}`], ['Bagi dengan ' + N(a), flip ? `Membagi dengan bilangan negatif → tanda berbalik: x ${rs} ${N(x0)}` : `x ${rs} ${N(x0)}`], ['Jawab', `<b>${ans}</b>`]]); } },
      ],
    },
    {
      id: '7G', grade: 7, name: 'Garis dan sudut', icon: '📐', color: '#fdcb6e', ixl: 'Y–Z', sg: 'Fase D · Geometri', km: 'Geometri',
      tip: 'Busur derajat di rumah bisa dipakai untuk mengukur sudut sudut pintu dan buku.',
      skills: [
        { id: '7G1', name: 'Sudut berpelurus dan berpenyiku', gen() { const lurus = Math.random() < 0.5, t = lurus ? 180 : 90, a = r(15, t - 15); return num(`Dua sudut ${lurus ? 'berpelurus (jumlahnya 180°)' : 'berpenyiku (jumlahnya 90°)'}. Salah satunya ${a}°. Berapa derajat sudut yang lain?`, t - a, `Sudut ${lurus ? 'berpelurus berjumlah 180°' : 'berpenyiku berjumlah 90°'}.`, [
          ['Kurangkan dari jumlahnya', `${t}° − ${a}° = <b>${t - a}°</b>`]], { unit: '°' }); } },
        { id: '7G2', name: 'Jumlah sudut segitiga', gen() { const a = r(20, 100), b = r(20, 160 - a); return num(`Dua sudut segitiga ${a}° dan ${b}°. Berapa derajat sudut ketiga?`, 180 - a - b, 'Jumlah ketiga sudut segitiga selalu 180°.', [
          ['Jumlahkan sudut yang diketahui', `${a}° + ${b}° = ${a + b}°`], ['Kurangkan dari 180°', `180° − ${a + b}° = <b>${180 - a - b}°</b>`]], { unit: '°' }); } },
        { id: '7G3', name: 'Sudut bertolak belakang', gen() { const a = r(20, 160); const want = pick(['bertolak belakang', 'berpelurus']); const ans = want === 'bertolak belakang' ? a : 180 - a; return num(`Dua garis berpotongan membentuk sudut ${a}°. Berapa derajat sudut yang ${want} dengannya?`, ans, 'Sudut bertolak belakang sama besar; sudut yang bersebelahan pada garis lurus berjumlah 180°.', [
          ['Kenali hubungannya', want === 'bertolak belakang' ? 'Sudut bertolak belakang sama besar.' : 'Sudut berpelurus berjumlah 180°.'], ['Jawab', want === 'bertolak belakang' ? `<b>${a}°</b>` : `180° − ${a}° = <b>${180 - a}°</b>`]], { unit: '°' }); } },
      ],
    },
    {
      id: '7H', grade: 7, name: 'Lingkaran, luas, dan volume', icon: '⭕', color: '#00a8cc', ixl: 'BB–CC', sg: 'Fase D · Pengukuran', km: 'Pengukuran',
      tip: 'Ukur keliling gelas dengan benang lalu bagi dengan diameternya: hasilnya mendekati π.',
      skills: [
        { id: '7H1', name: 'Keliling lingkaran', gen() { const rr = pick([7, 14, 21, 28, 35]); return num(`Jari-jari lingkaran ${rr} cm. Berapa cm kelilingnya? (π = 22/7)`, (2 * 22 * rr) / 7, 'Keliling lingkaran K = 2πr.', [
          ['Substitusi', `K = 2 × 22/7 × ${rr}`], ['Hitung', `2 × 22 × ${rr / 7} = <b>${(2 * 22 * rr) / 7}</b> cm`]], { unit: 'cm' }); } },
        { id: '7H2', name: 'Luas lingkaran', gen() { const rr = pick([7, 14, 21]); return num(`Jari-jari lingkaran ${rr} cm. Berapa cm² luasnya? (π = 22/7)`, (22 * rr * rr) / 7, 'Luas lingkaran L = πr².', [
          ['Substitusi', `L = 22/7 × ${rr} × ${rr}`], ['Hitung', `22 × ${rr / 7} × ${rr} = <b>${(22 * rr * rr) / 7}</b> cm²`]], { unit: 'cm²' }); } },
        { id: '7H3', name: 'Volume prisma', gen() { const a = r(3, 12), t = r(3, 12), p = r(2, 15); return num(`Prisma segitiga: alas segitiga ${a} cm dan tinggi segitiga ${t} cm, tinggi prisma ${p} cm. Berapa cm³ volumenya?`, (a * t * p) / 2, 'Volume prisma = luas alas × tinggi prisma.', [
          ['Luas alas segitiga', `½ × ${a} × ${t} = ${N((a * t) / 2)} cm²`], ['Kalikan tinggi prisma', `${N((a * t) / 2)} × ${p} = <b>${N((a * t * p) / 2)}</b> cm³`]], { unit: 'cm³' }); } },
      ],
    },
    {
      id: '7I', grade: 7, name: 'Statistika dan peluang', icon: '🎲', color: '#9b6dff', ixl: 'GG–II', sg: 'Fase D · Analisis Data dan Peluang', km: 'Analisis Data dan Peluang',
      tip: 'Catat nilai ulangan atau tinggi badan keluarga, lalu cari rata-rata, median, dan modusnya.',
      skills: [
        { id: '7I1', name: 'Rata-rata (mean)', gen() { const n = r(4, 6), m = r(5, 20), d = Array.from({ length: n }, () => r(-4, 4)); d[n - 1] = -d.slice(0, -1).reduce((s, x) => s + x, 0); const xs = shuffle(d.map((x) => m + x)); return num(`Berapa rata-rata data ${xs.join(', ')}?`, m, 'Rata-rata = jumlah semua data : banyak data.', [
          ['Jumlahkan', `${xs.join(' + ')} = ${m * n}`], ['Bagi banyak data', `${m * n} : ${n} = <b>${m}</b>`]]); } },
        { id: '7I2', name: 'Median', gen() { const n = pick([5, 7, 6]); const xs = Array.from({ length: n }, () => r(1, 30)); const s = [...xs].sort((a, b) => a - b); const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; return num(`Berapa median data ${xs.join(', ')}?`, med, 'Median adalah nilai tengah setelah data diurutkan; jika banyak data genap, rata-ratakan dua nilai tengah.', [
          ['Urutkan', s.join(', ')], ['Ambil nilai tengah', n % 2 ? `Data ke-${(n + 1) / 2}: <b>${N(med)}</b>` : `(${s[n / 2 - 1]} + ${s[n / 2]}) : 2 = <b>${N(med)}</b>`]]); } },
        { id: '7I3', name: 'Modus', gen() { const m = r(2, 20); let xs = [m, m, m]; while (xs.length < 8) { const v = r(1, 20); if (v !== m && xs.filter((x) => x === v).length < 2) xs.push(v); } xs = shuffle(xs); return num(`Berapa modus data ${xs.join(', ')}?`, m, 'Modus adalah nilai yang paling sering muncul.', [
          ['Hitung kemunculan', `${m} muncul 3 kali, nilai lain paling banyak 2 kali.`], ['Jawab', `Modus = <b>${m}</b>`]]); } },
        { id: '7I4', name: 'Peluang kejadian sederhana', gen() { const m = r(2, 8), k = r(2, 8), h = r(1, 6), tot = m + k + h, [nm, c] = pick([['merah', m], ['kuning', k], ['hijau', h]]); return num(`Dalam kantong ada ${m} kelereng merah, ${k} kuning, dan ${h} hijau. Satu kelereng diambil acak. Berapa peluang terambil ${nm}? (pecahan paling sederhana)`, F(c, tot), 'Peluang = banyak hasil yang diinginkan : banyak semua hasil.', [
          ['Banyak semua kelereng', `${m} + ${k} + ${h} = ${tot}`], ['Banyak kelereng ' + nm, String(c)], ['Peluang', `${c}/${tot} = <b>${F(c, tot)}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: 7, name: 'Kelas 7', short: '7', stage: 'SMP', ixl: 'https://www.ixl.com/math/grade-7', sg: 'Kurikulum Merdeka Fase D (SMP)' });

  lesson('7A', 'Bilangan bulat terdiri atas bilangan negatif, nol, dan bilangan positif.', [
    ['Tambah dan kurang', ['Pada garis bilangan, tambah bilangan positif = bergerak ke kanan.', 'Mengurangi = menambah lawannya: 5 − (−3) = 5 + 3.'], '7A1'],
    ['Kali dan bagi', ['Tanda sama → hasil positif.', 'Tanda berbeda → hasil negatif.'], '7A2'],
  ]);
  lesson('7B', 'Bilangan rasional dapat ditulis sebagai pecahan a/b dengan b ≠ 0.', [
    ['Jumlah dan selisih pecahan', ['Cari KPK penyebut.', 'Ubah setiap pecahan ke penyebut itu, lalu jumlah pembilangnya.', 'Sederhanakan hasilnya.'], '7B1'],
    ['Kali dan bagi pecahan', ['Kali: pembilang × pembilang, penyebut × penyebut.', 'Bagi: kalikan dengan kebalikan pecahan pembagi.'], '7B2'],
  ]);
  lesson('7C', 'Pangkat adalah perkalian berulang; akar kuadrat adalah kebalikan dari kuadrat.', [
    ['Pangkat', ['3⁴ = 3 × 3 × 3 × 3 = 81.', 'Bilangan negatif berpangkat genap hasilnya positif.'], '7C1'],
    ['Urutan operasi', ['Kurung → pangkat → kali/bagi → tambah/kurang.'], '7C3'],
  ]);
  lesson('7D', 'Perbandingan membandingkan dua besaran; persen adalah perbandingan dengan 100.', [
    ['Perbandingan senilai', ['Jika a : b = c : d, maka a × d = b × c.'], '7D1'],
    ['Persen', ['p% dari n = p × n : 100.', 'Harga setelah diskon = harga awal − diskon.'], '7D3'],
  ]);
  lesson('7E', 'Bentuk aljabar memakai huruf (variabel) untuk bilangan yang belum diketahui.', [
    ['Suku sejenis', ['Suku sejenis punya variabel dan pangkat yang sama.', 'Jumlahkan koefisiennya: 3x + 5x = 8x.'], '7E2'],
    ['Distributif', ['a(b + c) = ab + ac.'], '7E3'],
  ]);
  lesson('7F', 'Menyelesaikan persamaan berarti mencari nilai variabel yang membuat kedua ruas sama.', [
    ['Persamaan linear', ['Lakukan operasi yang sama di kedua ruas.', 'Sisakan x sendirian di satu ruas.', 'Periksa dengan substitusi.'], '7F1'],
    ['Pertidaksamaan', ['Caranya sama seperti persamaan.', 'Jika mengali atau membagi dengan bilangan negatif, balik tandanya.'], '7F3'],
  ]);
  lesson('7G', 'Sudut dan garis punya hubungan tetap yang bisa dipakai untuk menghitung sudut yang belum diketahui.', [
    ['Pasangan sudut', ['Berpenyiku: jumlah 90°.', 'Berpelurus: jumlah 180°.', 'Bertolak belakang: sama besar.'], '7G1'],
    ['Segitiga', ['Jumlah sudut dalam segitiga = 180°.'], '7G2'],
  ]);
  lesson('7H', 'Lingkaran memakai π ≈ 22/7 ≈ 3,14.', [
    ['Keliling dan luas lingkaran', ['K = 2πr = πd.', 'L = πr².'], '7H2'],
    ['Volume prisma', ['V = luas alas × tinggi.'], '7H3'],
  ]);
  lesson('7I', 'Statistika merangkum data; peluang mengukur seberapa mungkin sesuatu terjadi.', [
    ['Ukuran pemusatan', ['Mean = jumlah data : banyak data.', 'Median = nilai tengah data terurut.', 'Modus = nilai paling sering muncul.'], '7I1'],
    ['Peluang', ['P(A) = banyak hasil A : banyak semua hasil.', 'Nilainya antara 0 dan 1.'], '7I4'],
  ]);
})();
