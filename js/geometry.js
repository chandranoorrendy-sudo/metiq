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
      id: 'GA', grade: G, name: 'Garis sejajar dan sudut', icon: '∥', color: '#4d96ff', ixl: 'C–D', sg: 'Fase E · Geometri', km: 'Geometri',
      tip: 'Rel kereta api adalah contoh garis sejajar; bantalan rel adalah garis transversal.',
      skills: [
        { id: 'GA1', name: 'Sudut sehadap dan berseberangan', gen() { const a = r(25, 155); const [nm, same] = pick([['sehadap', true], ['dalam berseberangan', true], ['luar berseberangan', true], ['dalam sepihak', false]]); const ans = same ? a : 180 - a; return num(`Dua garis sejajar dipotong garis transversal. Sebuah sudut besarnya ${a}°. Berapa derajat sudut yang ${nm} dengannya?`, ans, 'Pada garis sejajar: sudut sehadap dan sudut berseberangan sama besar; sudut sepihak berjumlah 180°.', [
          ['Kenali pasangan sudut', same ? `Sudut ${nm} sama besar.` : `Sudut ${nm} berjumlah 180°.`], ['Jawab', same ? `<b>${a}°</b>` : `180° − ${a}° = <b>${180 - a}°</b>`]], { unit: '°' }); } },
        { id: 'GA2', name: 'Menyelesaikan sudut berbentuk aljabar', gen() { const x = r(5, 25), a = r(2, 5), b = r(-10, 20), c = r(1, 4); if (a === c) return C.SKILLS.GA2.gen(); const d = (a - c) * x + b; if (a * x + b <= 0 || a * x + b >= 180) return C.SKILLS.GA2.gen(); return num(`Dua sudut sehadap besarnya (${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)})° dan (${c}x ${d < 0 ? '−' : '+'} ${Math.abs(d)})°. Berapa x?`, x, 'Sudut sehadap sama besar, jadi buat persamaan dan selesaikan.', [
          ['Persamaan', `${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c}x ${d < 0 ? '−' : '+'} ${Math.abs(d)}`], ['Selesaikan', `${a - c}x = ${N(d - b)} → x = <b>${x}</b>`]]); } },
      ],
    },
    {
      id: 'GB', grade: G, name: 'Sifat segitiga', icon: '🔺', color: '#ff7a59', ixl: 'F, N', sg: 'Fase E · Geometri', km: 'Geometri',
      tip: 'Coba susun tiga lidi 2 cm, 3 cm, dan 6 cm: tidak bisa menjadi segitiga!',
      skills: [
        { id: 'GB1', name: 'Sudut luar segitiga', gen() { const a = r(20, 80), b = r(20, 80); return num(`Dua sudut dalam segitiga ${a}° dan ${b}°. Berapa derajat sudut luar pada sudut ketiga?`, a + b, 'Sudut luar segitiga = jumlah dua sudut dalam yang tidak bersebelahan dengannya.', [
          ['Gunakan teorema sudut luar', `${a}° + ${b}° = <b>${a + b}°</b>`]], { unit: '°' }); } },
        { id: 'GB2', name: 'Ketaksamaan segitiga', gen() { const a = r(3, 12), b = r(3, 12), c = pick([a + b + r(0, 3), Math.abs(a - b) + r(1, Math.max(1, Math.min(a, b) * 2 - 1))]); const ok = a + b > c && a + c > b && b + c > a; return pil(`Bisakah ${a} cm, ${b} cm, dan ${c} cm menjadi sisi-sisi segitiga?`, ['Bisa', 'Tidak bisa'], ok ? 'Bisa' : 'Tidak bisa', 'Jumlah dua sisi mana pun harus lebih besar dari sisi ketiga.', [
          ['Periksa sisi terpanjang', `Jumlah dua sisi terpendek: ${[a, b, c].sort((x, y) => x - y).slice(0, 2).join(' + ')} = ${[a, b, c].sort((x, y) => x - y).slice(0, 2).reduce((s, x) => s + x, 0)}, sisi terpanjang ${Math.max(a, b, c)}`], ['Simpulkan', `<b>${ok ? 'Bisa' : 'Tidak bisa'}</b>`]]); } },
        { id: 'GB3', name: 'Jenis segitiga menurut sisi dan sudut', gen() { const [a, b, c] = pick([[3, 4, 5], [5, 5, 5], [5, 5, 8], [4, 5, 6], [6, 8, 10], [7, 7, 7], [2, 3, 4], [5, 12, 13], [6, 6, 10], [4, 6, 9]]); const big = Math.max(a, b, c), s2 = a * a + b * b + c * c - big * big; const ans = s2 === big * big ? 'siku-siku' : s2 > big * big ? 'lancip' : 'tumpul'; return pil(`Segitiga dengan sisi ${a}, ${b}, dan ${c} termasuk segitiga ...`, ['lancip', 'siku-siku', 'tumpul'], ans, 'Bandingkan kuadrat sisi terpanjang (c²) dengan jumlah kuadrat dua sisi lain (a² + b²): sama → siku-siku, lebih kecil → lancip, lebih besar → tumpul.', [
          ['Kuadrat sisi terpanjang', `${big}² = ${big * big}`], ['Jumlah kuadrat sisi lain', String(s2)], ['Bandingkan', `${s2} ${s2 === big * big ? '=' : s2 > big * big ? '>' : '<'} ${big * big} → <b>${ans}</b>`]]); } },
      ],
    },
    {
      id: 'GC', grade: G, name: 'Kesebangunan dan kekongruenan', icon: '🔍', color: '#1fbf9f', ixl: 'K–M', sg: 'Fase E · Geometri', km: 'Geometri',
      tip: 'Foto yang diperbesar tetap sebangun dengan aslinya: semua ukuran dikali faktor yang sama.',
      skills: [
        { id: 'GC1', name: 'Panjang sisi pada bangun sebangun', gen() { const a = r(2, 9), b = r(2, 12), k = pick([2, 3, 4, 1.5]); return num(`Segitiga ABC sebangun dengan PQR. AB = ${a} cm, BC = ${b} cm, PQ = ${N(a * k)} cm. Berapa cm QR?`, b * k, 'Pada bangun sebangun, perbandingan sisi yang bersesuaian sama.', [
          ['Faktor skala', `PQ : AB = ${N(a * k)} : ${a} = ${N(k)}`], ['Kalikan', `QR = ${b} × ${N(k)} = <b>${N(b * k)}</b> cm`]], { unit: 'cm' }); } },
        { id: 'GC2', name: 'Faktor skala luas dan volume', gen() { const k = r(2, 5), vol = Math.random() < 0.5, base = r(2, 12); return num(`Dua bangun sebangun dengan perbandingan sisi 1 : ${k}. ${vol ? 'Volume' : 'Luas'} bangun kecil ${base}. Berapa ${vol ? 'volume' : 'luas'} bangun besar?`, base * k ** (vol ? 3 : 2), 'Jika sisi dikali k, luas dikali k² dan volume dikali k³.', [
          ['Faktor', `${vol ? 'k³' : 'k²'} = ${k}${sup(vol ? 3 : 2)} = ${k ** (vol ? 3 : 2)}`], ['Kalikan', `${base} × ${k ** (vol ? 3 : 2)} = <b>${base * k ** (vol ? 3 : 2)}</b>`]]); } },
      ],
    },
    {
      id: 'GD', grade: G, name: 'Segi banyak', icon: '⬡', color: '#e84393', ixl: 'G, O', sg: 'Fase E · Geometri', km: 'Geometri',
      tip: 'Sarang lebah berbentuk segi enam beraturan: setiap sudut dalamnya 120°.',
      skills: [
        { id: 'GD1', name: 'Jumlah sudut dalam segi banyak', gen() { const n = r(5, 12); return num(`Berapa derajat jumlah sudut dalam segi-${n}?`, (n - 2) * 180, 'Segi-n dapat dibagi menjadi (n − 2) segitiga, jadi jumlah sudut dalamnya (n − 2) × 180°.', [
          ['Banyak segitiga', `${n} − 2 = ${n - 2}`], ['Kalikan 180°', `${n - 2} × 180° = <b>${(n - 2) * 180}°</b>`]], { unit: '°' }); } },
        { id: 'GD2', name: 'Sudut segi banyak beraturan', gen() { const n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), luar = Math.random() < 0.5; return num(`Berapa derajat setiap sudut ${luar ? 'luar' : 'dalam'} segi-${n} beraturan?`, luar ? 360 / n : 180 - 360 / n, 'Jumlah sudut luar segi banyak selalu 360°. Sudut dalam = 180° − sudut luar.', [
          ['Sudut luar', `360° : ${n} = ${N(360 / n)}°`], luar ? ['Jawab', `<b>${N(360 / n)}°</b>`] : ['Sudut dalam', `180° − ${N(360 / n)}° = <b>${N(180 - 360 / n)}°</b>`]], { unit: '°' }); } },
        { id: 'GD3', name: 'Banyak diagonal', gen() { const n = r(4, 15); return num(`Berapa banyak diagonal segi-${n}?`, (n * (n - 3)) / 2, 'Dari setiap titik sudut ditarik n − 3 diagonal, dan setiap diagonal terhitung dua kali.', [
          ['Rumus', `n(n − 3)/2`], ['Hitung', `${n} × ${n - 3} : 2 = <b>${(n * (n - 3)) / 2}</b>`]]); } },
      ],
    },
    {
      id: 'GE', grade: G, name: 'Trigonometri segitiga siku-siku', icon: '📐', color: '#00b894', ixl: 'Q', sg: 'Fase E · Geometri', km: 'Geometri',
      tip: 'SinDeMi CosSaMi TanDeSa: sin = depan/miring, cos = samping/miring, tan = depan/samping.',
      skills: [
        { id: 'GE1', name: 'Perbandingan sin, cos, tan', gen() { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]); const f = pick(['sin', 'cos', 'tan']); const ans = f === 'sin' ? F(a, c) : f === 'cos' ? F(b, c) : F(a, b); return num(`Segitiga siku-siku: sisi depan sudut θ = ${a}, sisi samping = ${b}, sisi miring = ${c}. Berapa ${f} θ? (pecahan)`, ans, 'sin = depan/miring, cos = samping/miring, tan = depan/samping.', [
          ['Pilih sisi', f === 'sin' ? `depan = ${a}, miring = ${c}` : f === 'cos' ? `samping = ${b}, miring = ${c}` : `depan = ${a}, samping = ${b}`], ['Jawab', `${f} θ = <b>${ans}</b>`]]); } },
        { id: 'GE2', name: 'Sisi dengan sudut istimewa', gen() { const k = r(2, 12), kind = pick(['30', '60', '45']); if (kind === '45') return num(`Segitiga siku-siku sama kaki, sisi siku-sikunya ${k} cm. Sisi miringnya a√2 cm. Berapa a?`, k, 'Segitiga 45°-45°-90°: perbandingan sisi 1 : 1 : √2.', [
          ['Perbandingan', `siku : miring = 1 : √2`], ['Sisi miring', `${k}√2, jadi a = <b>${k}</b>`]]);
          return num(`Segitiga siku-siku dengan sudut ${kind}°, sisi miringnya ${2 * k} cm. Berapa cm sisi di depan sudut 30°?`, k, 'Segitiga 30°-60°-90°: perbandingan sisi 1 : √3 : 2 (depan 30° : depan 60° : miring).', [
          ['Perbandingan', 'depan 30° = ½ × sisi miring'], ['Hitung', `½ × ${2 * k} = <b>${k}</b> cm`]], { unit: 'cm' }); } },
        { id: 'GE3', name: 'Mencari sisi dengan trigonometri', gen() { const [deg, sv] = pick([[30, 0.5], [60, 0.866], [45, 0.7071], [53, 0.8], [37, 0.6]]); const c = pick([10, 20, 50, 100]); return num(`Tangga ${c} m bersandar ke dinding membentuk sudut ${deg}° dengan tanah. Berapa m tinggi ujung tangga? (sin ${deg}° ≈ ${N(sv)}, bulatkan 1 desimal)`, Math.round(c * sv * 10) / 10, 'Tinggi adalah sisi di depan sudut, tangga adalah sisi miring: tinggi = miring × sin θ.', [
          ['Rumus', `tinggi = ${c} × sin ${deg}°`], ['Hitung', `${c} × ${N(sv)} = ${N(c * sv)} ≈ <b>${N(Math.round(c * sv * 10) / 10)}</b> m`]], { unit: 'm' }); } },
      ],
    },
    {
      id: 'GF', grade: G, name: 'Aturan sinus dan cosinus', icon: '△', color: '#fdcb6e', ixl: 'R', sg: 'Fase F · Geometri', km: 'Geometri',
      tip: 'Aturan cosinus adalah perluasan teorema Pythagoras untuk segitiga sembarang.',
      skills: [
        { id: 'GF1', name: 'Aturan cosinus', gen() { const [a, b, deg, cs] = pick([[5, 8, 60, 0.5], [3, 5, 120, -0.5], [8, 3, 60, 0.5], [5, 3, 120, -0.5], [8, 15, 60, 0.5], [7, 8, 120, -0.5], [5, 16, 120, -0.5]]); const c2 = a * a + b * b - 2 * a * b * cs, c = Math.sqrt(c2); return num(`Pada segitiga ABC, b = ${a}, c = ${b}, dan sudut A = ${deg}°. Berapa panjang a?`, c, 'a² = b² + c² − 2bc cos A.', [
          ['Substitusi', `a² = ${a}² + ${b}² − 2 × ${a} × ${b} × cos ${deg}° = ${a * a} + ${b * b} − ${2 * a * b} × (${N(cs)})`], ['Hitung', `a² = ${c2} → a = <b>${N(c)}</b>`]]); } },
        { id: 'GF2', name: 'Aturan sinus', gen() { const a = pick([4, 6, 8, 10, 12]); return num(`Pada segitiga ABC, sudut A = 30°, sudut B = 90°, dan a = ${a}. Berapa panjang b?`, 2 * a, 'a/sin A = b/sin B.', [
          ['Tulis aturan sinus', `${a}/sin 30° = b/sin 90°`], ['Substitusi', `${a}/0,5 = b/1`], ['Hitung', `b = <b>${2 * a}</b>`]]); } },
        { id: 'GF3', name: 'Luas segitiga dengan sinus', gen() { const a = r(2, 12) * 2, b = r(2, 12), [deg, sv] = pick([[30, 0.5], [150, 0.5], [90, 1]]); return num(`Dua sisi segitiga ${a} cm dan ${b} cm mengapit sudut ${deg}°. Berapa cm² luasnya?`, 0.5 * a * b * sv, 'Luas = ½ × a × b × sin C (C sudut yang diapit a dan b).', [
          ['Substitusi', `½ × ${a} × ${b} × sin ${deg}° = ½ × ${a} × ${b} × ${N(sv)}`], ['Hitung', `<b>${N(0.5 * a * b * sv)}</b> cm²`]], { unit: 'cm²' }); } },
      ],
    },
    {
      id: 'GG', grade: G, name: 'Lingkaran', icon: '◯', color: '#00a8cc', ixl: 'W, Y', sg: 'Fase F · Geometri', km: 'Geometri',
      tip: 'Potong pizza menjadi juring: panjang tepi tiap potong adalah panjang busur.',
      skills: [
        { id: 'GG1', name: 'Sudut pusat dan sudut keliling', gen() { const even = r(10, 85) * 2, ask = pick(['keliling', 'pusat']); return ask === 'keliling' ? num(`Sudut pusat menghadap busur AB besarnya ${even}°. Berapa derajat sudut keliling yang menghadap busur yang sama?`, even / 2, 'Sudut keliling = ½ × sudut pusat yang menghadap busur yang sama.', [['Bagi dua', `${even}° : 2 = <b>${even / 2}°</b>`]], { unit: '°' })
          : num(`Sudut keliling menghadap busur AB besarnya ${even / 2}°. Berapa derajat sudut pusat yang menghadap busur yang sama?`, even, 'Sudut pusat = 2 × sudut keliling yang menghadap busur yang sama.', [['Kali dua', `2 × ${even / 2}° = <b>${even}°</b>`]], { unit: '°' }); } },
        { id: 'GG2', name: 'Panjang busur dan luas juring', gen() { const rr = pick([7, 14, 21]), deg = pick([30, 45, 60, 90, 120, 180]), luas = Math.random() < 0.5; const ans = luas ? (deg / 360) * (22 / 7) * rr * rr : (deg / 360) * 2 * (22 / 7) * rr; if (Math.abs(ans * 100 - Math.round(ans * 100)) > 1e-9) return C.SKILLS.GG2.gen(); return num(`Jari-jari ${rr} cm, sudut pusat ${deg}°. Berapa ${luas ? 'cm² luas juring' : 'cm panjang busur'}? (π = 22/7)`, Math.round(ans * 100) / 100, `${luas ? 'Luas juring = (θ/360°) × πr²' : 'Panjang busur = (θ/360°) × 2πr'}.`, [
          ['Bagian lingkaran', `${deg}/360 = ${F(deg, 360)}`], ['Kalikan', luas ? `${F(deg, 360)} × 22/7 × ${rr}² = <b>${N(Math.round(ans * 100) / 100)}</b>` : `${F(deg, 360)} × 2 × 22/7 × ${rr} = <b>${N(Math.round(ans * 100) / 100)}</b>`]], { unit: luas ? 'cm²' : 'cm' }); } },
        { id: 'GG3', name: 'Persamaan lingkaran', gen() { const a = r(-6, 6), b = r(-6, 6), rr = r(1, 9), ask = pick(['jari-jari', 'x pusat', 'y pusat']); const t = `(x ${a < 0 ? '+' : '−'} ${Math.abs(a)})² + (y ${b < 0 ? '+' : '−'} ${Math.abs(b)})² = ${rr * rr}`; const ans = ask === 'jari-jari' ? rr : ask === 'x pusat' ? a : b; return num(`Lingkaran ${t}. Berapa ${ask === 'jari-jari' ? 'jari-jarinya' : (ask === 'x pusat' ? 'absis (x)' : 'ordinat (y)') + ' titik pusatnya'}?`, ans, 'Lingkaran (x − a)² + (y − b)² = r² berpusat di (a, b) dengan jari-jari r.', [
          ['Bandingkan dengan bentuk umum', `pusat ${pt(a, b)}, r² = ${rr * rr}`], ['Jawab', `<b>${N(ans)}</b>`]]); } },
      ],
    },
    {
      id: 'GH', grade: G, name: 'Luas permukaan dan volume', icon: '🧊', color: '#9b6dff', ixl: 'S–U', sg: 'Fase E · Pengukuran', km: 'Pengukuran',
      tip: 'Buka kardus menjadi jaring-jaring untuk melihat luas permukaannya.',
      skills: [
        { id: 'GH1', name: 'Luas trapesium', gen() { const a = r(3, 15), b = r(3, 15), t = r(2, 12); return num(`Trapesium dengan sisi sejajar ${a} cm dan ${b} cm, tinggi ${t} cm. Berapa cm² luasnya?`, ((a + b) * t) / 2, 'Luas trapesium = ½ × (jumlah sisi sejajar) × tinggi.', [
          ['Jumlah sisi sejajar', `${a} + ${b} = ${a + b}`], ['Kalikan tinggi, bagi 2', `${a + b} × ${t} : 2 = <b>${N(((a + b) * t) / 2)}</b> cm²`]], { unit: 'cm²' }); } },
        { id: 'GH2', name: 'Luas permukaan balok', gen() { const p = r(2, 12), l = r(2, 10), t = r(2, 10); return num(`Balok berukuran ${p} cm × ${l} cm × ${t} cm. Berapa cm² luas permukaannya?`, 2 * (p * l + p * t + l * t), 'Luas permukaan balok = 2(pl + pt + lt).', [
          ['Luas tiga pasang sisi', `pl = ${p * l}, pt = ${p * t}, lt = ${l * t}`], ['Jumlah lalu kali 2', `2 × ${p * l + p * t + l * t} = <b>${2 * (p * l + p * t + l * t)}</b> cm²`]], { unit: 'cm²' }); } },
        { id: 'GH3', name: 'Volume limas', gen() { const s = r(2, 12), t = pick([3, 6, 9, 12]); return num(`Limas persegi dengan sisi alas ${s} cm dan tinggi ${t} cm. Berapa cm³ volumenya?`, (s * s * t) / 3, 'Volume limas = ⅓ × luas alas × tinggi.', [
          ['Luas alas', `${s}² = ${s * s}`], ['Hitung', `⅓ × ${s * s} × ${t} = <b>${N((s * s * t) / 3)}</b> cm³`]], { unit: 'cm³' }); } },
      ],
    },
    {
      id: 'GI', grade: G, name: 'Geometri koordinat', icon: '🗺️', color: '#e17055', ixl: 'E, Y', sg: 'Fase E · Geometri', km: 'Geometri',
      tip: 'Titik tengah dua kota di peta = rata-rata koordinatnya.',
      skills: [
        { id: 'GI1', name: 'Titik tengah ruas garis', gen() { const x1 = r(-9, 9), y1 = r(-9, 9), x2 = x1 + 2 * nz(-5, 5), y2 = y1 + 2 * nz(-5, 5), ans = pt((x1 + x2) / 2, (y1 + y2) / 2); return pil(`Titik tengah ruas garis ${pt(x1, y1)} dan ${pt(x2, y2)} adalah ...`, opt(ans, [pt((x2 - x1) / 2, (y2 - y1) / 2), pt(x1 + x2, y1 + y2), pt((x1 + y1) / 2, (x2 + y2) / 2), pt((x1 + x2) / 2, (y1 - y2) / 2)]), ans, 'Titik tengah = ((x₁ + x₂)/2, (y₁ + y₂)/2).', [
          ['Rata-rata x', `(${N(x1)} + ${P(x2)}) : 2 = ${N((x1 + x2) / 2)}`], ['Rata-rata y', `(${N(y1)} + ${P(y2)}) : 2 = ${N((y1 + y2) / 2)}`], ['Titik tengah', `<b>${ans}</b>`]]); } },
        { id: 'GI2', name: 'Titik ujung dari titik tengah', gen() { const mx = r(-6, 6), my = r(-6, 6), x1 = r(-9, 9), y1 = r(-9, 9), ans = pt(2 * mx - x1, 2 * my - y1); return pil(`M${pt(mx, my)} adalah titik tengah AB dengan A${pt(x1, y1)}. Di mana B?`, opt(ans, [pt(mx + x1, my + y1), pt((mx + x1) / 2, (my + y1) / 2), pt(2 * x1 - mx, 2 * y1 - my), pt(mx - x1, my - y1)]), ans, 'B = (2xₘ − x_A, 2yₘ − y_A).', [
          ['x B', `2 × ${P(mx)} − ${P(x1)} = ${N(2 * mx - x1)}`], ['y B', `2 × ${P(my)} − ${P(y1)} = ${N(2 * my - y1)}`], ['B', `<b>${ans}</b>`]]); } },
      ],
    },
  ];
  C.register(UNITS);
  C.GRADES.push({ id: G, name: 'Geometri', short: 'G', stage: 'SMA', ixl: 'https://www.ixl.com/math/geometry', sg: 'Kurikulum Merdeka Fase E–F' });

  lesson('GA', 'Garis transversal yang memotong dua garis sejajar membentuk pasangan sudut istimewa.', [
    ['Pasangan sudut', ['Sehadap, dalam berseberangan, luar berseberangan: sama besar.', 'Dalam sepihak dan luar sepihak: berjumlah 180°.'], 'GA1'],
  ]);
  lesson('GB', 'Segitiga punya sifat sudut dan sisi yang tetap.', [
    ['Sudut luar', ['Sudut luar = jumlah dua sudut dalam yang tidak bersebelahan.'], 'GB1'], ['Ketaksamaan segitiga', ['a + b > c untuk setiap pasangan sisi.'], 'GB2'],
  ]);
  lesson('GC', 'Bangun sebangun punya sudut yang sama dan sisi yang sebanding.', [
    ['Faktor skala', ['Sisi × k, luas × k², volume × k³.'], 'GC2'],
  ]);
  lesson('GD', 'Segi banyak beraturan punya semua sisi dan sudut sama besar.', [
    ['Sudut', ['Jumlah sudut dalam = (n − 2) × 180°.', 'Jumlah sudut luar = 360°.'], 'GD2'],
  ]);
  lesson('GE', 'Trigonometri menghubungkan sudut dengan perbandingan sisi segitiga siku-siku.', [
    ['SinDeMi CosSaMi TanDeSa', ['sin θ = depan/miring', 'cos θ = samping/miring', 'tan θ = depan/samping'], 'GE1'],
    ['Sudut istimewa', ['30°-60°-90°: 1 : √3 : 2', '45°-45°-90°: 1 : 1 : √2'], 'GE2'],
  ]);
  lesson('GF', 'Aturan sinus dan cosinus berlaku untuk segitiga sembarang.', [
    ['Aturan cosinus', ['a² = b² + c² − 2bc cos A'], 'GF1'], ['Aturan sinus', ['a/sin A = b/sin B = c/sin C'], 'GF2'],
  ]);
  lesson('GG', 'Lingkaran punya hubungan antara sudut pusat, sudut keliling, busur, dan juring.', [
    ['Sudut', ['Sudut keliling = ½ sudut pusat.'], 'GG1'], ['Persamaan lingkaran', ['(x − a)² + (y − b)² = r²'], 'GG3'],
  ]);
  lesson('GH', 'Luas permukaan adalah jumlah luas semua sisi; volume adalah isi ruang.', [
    ['Rumus', ['Balok: L = 2(pl + pt + lt).', 'Limas: V = ⅓ × alas × tinggi.'], 'GH2'],
  ]);
  lesson('GI', 'Geometri koordinat memakai rumus aljabar untuk titik dan garis.', [
    ['Titik tengah', ['((x₁ + x₂)/2, (y₁ + y₂)/2)'], 'GI1'],
  ]);
})();
