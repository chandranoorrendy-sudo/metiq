/* Metiq — Kurikulum Matematika Kelas 4
 * Dari daftar keterampilan IXL kelas 4 dan Singapore Math 4A/4B: bilangan sampai 1.000.000,
 * faktor dan kelipatan, perkalian 2 angka × 2 angka, pembagian bersisa, urutan operasi,
 * pecahan campuran dan operasi pecahan, desimal, sudut dalam derajat, simetri, dan diagram garis.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, range, rp, kata, V, inp, ch, two, fmt, dec, opts4, gcd, lcm, fs, hasCarry, hasBorrow, stack, U } = C.kit;
  const R = (n, t) => Math.floor(n / t + 0.5) * t;
  const hm = (h, m) => `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
  const cmpBig = (a, b, fa = fmt(a), fb = fmt(b), tags = {}) => { const s = a < b ? '<' : a > b ? '>' : '='; return ch('Pilih tanda yang tepat.', ['<', '>', '='], s, `${fa} ${s === '<' ? 'lebih kecil dari' : s === '>' ? 'lebih besar dari' : 'sama dengan'} ${fb}. Jawabannya <b>${fa} ${s} ${fb}</b>.`, { vis: V.big(`${fa} <span class="q">?</span> ${fb}`), optionTags: tags }); };
  const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const DIR = ['utara', 'timur laut', 'timur', 'tenggara', 'selatan', 'barat daya', 'barat', 'barat laut'];
  const JAJAR = '<svg class="shape" viewBox="0 0 120 120" style="fill:#0984e3"><polygon points="6,96 82,96 114,24 38,24"/></svg>';
  const TRAP = '<svg class="shape" viewBox="0 0 120 120" style="fill:#0984e3"><polygon points="30,30 90,30 114,96 6,96"/></svg>';

  const UNITS = [
    {
      id: '4A', grade: 4, name: 'Bilangan sampai 1.000.000', icon: '🔢', color: '#ff7a59',
      sg: '4A · Numbers to 100,000 (diperluas)', ixl: 'A, B, C', km: 'Bilangan (CP Fase B sampai 10.000; Fase C sampai 1.000.000)',
      tip: 'Bacakan angka besar dari berita (jumlah penduduk, harga motor) dan minta anak menuliskannya.',
      skills: [
        { id: '4A1', name: 'Nilai angka sampai ratus ribuan', gen() { const d = shuffle(range(1, 9)).slice(0, 6), n = +d.join(''), pos = r(0, 5), val = d[pos] * 10 ** (5 - pos); const names = ['ratus ribuan', 'puluh ribuan', 'ribuan', 'ratusan', 'puluhan', 'satuan']; return ch(`Pada bilangan <b>${fmt(n)}</b>, angka ${d[pos]} bernilai berapa?`, opts4(fmt(val), [0, 1, 2, 3, 4, 5].map((p) => fmt(d[pos] * 10 ** p))), fmt(val), `Angka ${d[pos]} ada di tempat ${names[pos]}, nilainya <b>${fmt(val)}</b>.`, { optionTags: { [String(d[pos])]: 'nilai-tempat' } }); } },
        { id: '4A2', name: 'Membaca dan menulis bilangan besar', gen() { const n = r(10001, 999999); const cands = [n + 10000, n - 1000, n + 100, Math.floor(n / 10), n * 10].filter((x) => x > 1000 && x < 1e7); if (Math.random() < 0.5) return ch(`Bilangan mana yang dibaca "<b>${kata(n)}</b>"?`, opts4(fmt(n), cands.map(fmt)), fmt(n), `"${kata(n)}" ditulis <b>${fmt(n)}</b>. Kelompokkan tiga angka dari kanan dengan titik.`); const o = opts4(fmt(n), cands.map(fmt)); return ch(`Bagaimana membaca ${fmt(n)}?`, o.map((x) => kata(+x.replace(/\./g, ''))), kata(n), `${fmt(n)} dibaca <b>${kata(n)}</b>.`); } },
        { id: '4A3', name: 'Membulatkan bilangan besar', gen() { const t = pick([1000, 10000, 100000]), n = r(10001, 989999); if (n % t === 0) return C.SKILLS['4A3'].gen(); const lo = Math.floor(n / t) * t, ans = R(n, t); return inp(`Bulatkan ${fmt(n)} ke ${{ 1000: 'ribuan', 10000: 'puluh ribuan', 100000: 'ratus ribuan' }[t]} terdekat.`, ans, `${fmt(n)} ada di antara ${fmt(lo)} dan ${fmt(lo + t)}. Lihat angka di sebelah kanan tempat pembulatan: 5 atau lebih ke atas. Jawabannya <b>${fmt(ans)}</b>.`, { meta: { kind: 'round', wrong: ans === lo ? lo + t : lo } }); } },
        { id: '4A4', name: 'Membandingkan bilangan besar', gen() { const a = r(10000, 999999), b = Math.random() < 0.5 ? Math.floor(a / 10000) * 10000 + r(0, 9999) : r(10000, 999999); return cmpBig(a, b); } },
      ],
    },
    {
      id: '4B', grade: 4, name: 'Penjumlahan dan pengurangan bilangan besar', icon: '➕', color: '#1fbf9f',
      sg: '4A · Addition and Subtraction', ixl: 'D, E', km: 'Bilangan',
      tip: 'Periksa hasil dengan memperkirakan dulu: 48.920 + 31.150 kira-kira 49.000 + 31.000 = 80.000.',
      skills: [
        { id: '4B1', name: 'Menjumlah bilangan lima angka', gen() { const a = r(10000, 60000), b = r(10000, 39999); return inp(`${a} + ${b} = ?`, a + b, `Jumlahkan bersusun dari satuan sampai puluh ribuan. Jawabannya <b>${fmt(a + b)}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } },
        { id: '4B2', name: 'Mengurangi bilangan lima angka', gen() { let a, b; do { a = r(30000, 99999); b = r(10000, a - 1000); } while (!hasBorrow(a, b)); return inp(`${a} − ${b} = ?`, a - b, `Kurangi bersusun; pinjam dari kolom kiri jika angka atas lebih kecil. Jawabannya <b>${fmt(a - b)}</b>.`, { vis: stack(a, '−', b), meta: { op: '-', a, b, regroup: true } }); } },
        { id: '4B3', name: 'Soal cerita bilangan besar', gen() { if (Math.random() < 0.5) { const a = r(12000, 48000), b = r(9000, 40000); return inp(`Desa Sukamaju berpenduduk ${fmt(a)} jiwa dan Desa Sukajadi ${fmt(b)} jiwa. Berapa jumlah penduduk kedua desa?`, a + b, `${fmt(a)} + ${fmt(b)} = <b>${fmt(a + b)}</b> jiwa.`, { meta: { op: '+', a, b } }); } const a = r(50000, 98000), b = r(12000, a - 5000); return inp(`Sebuah stadion memiliki ${fmt(a)} kursi. Sebanyak ${fmt(b)} kursi sudah terisi. Berapa kursi yang masih kosong?`, a - b, `${fmt(a)} − ${fmt(b)} = <b>${fmt(a - b)}</b> kursi.`, { meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
      ],
    },
    {
      id: '4C', grade: 4, name: 'Faktor dan kelipatan', icon: '🧩', color: '#fd79a8',
      sg: '4A · Factors and Multiples', ixl: 'F', km: 'Bilangan (faktor dan kelipatan; CP Fase B)',
      tip: 'Cari faktor dengan menyusun benda menjadi persegi panjang: 12 benda bisa 1×12, 2×6, 3×4.',
      skills: [
        { id: '4C1', name: 'Faktor sebuah bilangan', gen() { let n; do { n = r(12, 72); } while (isPrime(n)); const fac = range(2, n - 1).filter((x) => n % x === 0), non = range(2, n - 1).filter((x) => n % x !== 0); const f = pick(fac); return ch(`Mana yang merupakan <b>faktor</b> dari ${n}?`, opts4(f, shuffle(non).slice(0, 5)), f, `${n} ÷ ${f} = ${n / f} tanpa sisa, jadi <b>${f}</b> adalah faktor ${n}. Semua faktor ${n}: 1, ${fac.join(', ')}, ${n}.`); } },
        { id: '4C2', name: 'Kelipatan sebuah bilangan', gen() { const k = r(3, 9), m = k * r(3, 12); const non = range(m - 8, m + 8).filter((x) => x > 0 && x % k !== 0); return ch(`Mana yang merupakan <b>kelipatan</b> ${k}?`, opts4(m, shuffle(non).slice(0, 5)), m, `${m} = ${k} × ${m / k}, jadi <b>${m}</b> kelipatan ${k}.`); } },
        { id: '4C3', name: 'Bilangan prima dan komposit', gen() { const n = r(2, 60), p = isPrime(n) ? 'prima' : 'komposit'; const fac = range(2, n - 1).filter((x) => n % x === 0); return ch(`Apakah ${n} bilangan prima atau komposit?`, ['prima', 'komposit'], p, p === 'prima' ? `${n} hanya punya dua faktor: 1 dan ${n}. Jadi <b>prima</b>.` : `${n} punya faktor lain selain 1 dan ${n} (mis. ${fac[0]}). Jadi <b>komposit</b>.`); } },
        { id: '4C4', name: 'Faktor dan kelipatan persekutuan', gen() { if (Math.random() < 0.5) { const [a, b] = shuffle(range(2, 10)).slice(0, 2); return inp(`Berapa kelipatan persekutuan terkecil dari ${a} dan ${b}?`, lcm(a, b), `Kelipatan ${a}: ${range(1, 6).map((i) => a * i).join(', ')}, …  Kelipatan ${b}: ${range(1, 6).map((i) => b * i).join(', ')}, …  Yang sama paling kecil: <b>${lcm(a, b)}</b>.`); } const g = r(2, 6), [x, y] = shuffle([1, 2, 3, 5, 7]).slice(0, 2), a = g * x, b = g * y; return inp(`Berapa faktor persekutuan terbesar dari ${a} dan ${b}?`, gcd(a, b), `Faktor ${a} dan ${b} yang sama, ambil yang terbesar: <b>${gcd(a, b)}</b>.`); } },
      ],
    },
    {
      id: '4D', grade: 4, name: 'Perkalian', icon: '✖️', color: '#e17055',
      sg: '4A · Multiplication (by 1-digit and 2-digit)', ixl: 'G, J, K, L', km: 'Bilangan',
      tip: 'Kalikan per bagian: 34 × 26 = 34 × 20 + 34 × 6 = 680 + 204 = 884.',
      skills: [
        { id: '4D1', name: 'Empat angka dikali satu angka', gen() { const a = r(1001, 9999), b = r(2, 9); return inp(`${a} × ${b} = ?`, a * b, `Kalikan setiap tempat dengan ${b} mulai dari satuan, tambahkan simpanan. Jawabannya <b>${fmt(a * b)}</b>.`, { vis: stack(a, '×', b), meta: { op: 'x', a, b } }); } },
        { id: '4D2', name: 'Dua angka dikali dua angka', gen() { const a = r(12, 99), b = r(11, 99), t = Math.floor(b / 10) * 10, o = b % 10; return inp(`${a} × ${b} = ?`, a * b, `${a} × ${b} = ${a} × ${t} + ${a} × ${o} = ${fmt(a * t)} + ${a * o} = <b>${fmt(a * b)}</b>.`, { vis: stack(a, '×', b), meta: { op: 'x', a, b } }); } },
        { id: '4D3', name: 'Mengalikan dengan 10, 100, dan 1.000', gen() { const a = r(2, 999), k = pick([10, 100, 1000]); return inp(`${a} × ${fmt(k)} = ?`, a * k, `Kalikan dengan ${fmt(k)}: tambahkan ${String(k).length - 1} nol di belakang. Jawabannya <b>${fmt(a * k)}</b>.`, { meta: { op: 'x', a, b: k, kind: 'unit' } }); } },
        { id: '4D4', name: 'Soal cerita perkalian', gen() { const [e, t, a, b] = pick([['📦', 'kardus berisi', r(12, 48), r(12, 60)], ['🚌', 'bus membawa', r(25, 45), r(11, 30)], ['🧺', 'keranjang berisi', r(15, 36), r(12, 40)]]); return inp(`Setiap ${t.split(' ')[0]} ${t.split(' ').slice(1).join(' ')} ${a} ${e === '🚌' ? 'penumpang' : 'buah'}. Berapa ${e === '🚌' ? 'penumpang' : 'buah'} dalam ${b} ${t.split(' ')[0]}?`, a * b, `${b} × ${a} = <b>${fmt(a * b)}</b>.`, { vis: `<div class="bigemoji sm">${e}</div>`, meta: { op: 'x', a, b } }); } },
      ],
    },
    {
      id: '4E', grade: 4, name: 'Pembagian', icon: '➗', color: '#0984e3',
      sg: '4A · Division (by 1-digit, with remainder)', ixl: 'H, M, N', km: 'Bilangan',
      tip: 'Periksa pembagian dengan perkalian: 875 ÷ 7 = 125, karena 125 × 7 = 875.',
      skills: [
        { id: '4E1', name: 'Pembagian bersusun oleh satu angka', gen() { const d = r(2, 9), q = r(101, Math.floor(9999 / d)), n = d * q; return inp(`${n} ÷ ${d} = ?`, q, `Bagi dari tempat terbesar: ribuan/ratusan, puluhan, lalu satuan. Periksa: ${q} × ${d} = ${n}. Jawabannya <b>${fmt(q)}</b>.`, { vis: V.big(`${fmt(n)} ÷ ${d} = <span class="q">?</span>`), meta: { op: '/', a: n, b: d } }); } },
        { id: '4E2', name: 'Pembagian bersisa', gen() { const d = r(3, 9), q = r(21, 199), s = r(1, d - 1), n = d * q + s; if (Math.random() < 0.5) return inp(`${n} ÷ ${d} = ? sisa ${s}`, q, `${q} × ${d} = ${d * q}; ${n} − ${d * q} = ${s}. Hasil baginya <b>${q}</b>.`); return inp(`${n} ÷ ${d} = ${q} sisa ?`, s, `${q} × ${d} = ${d * q}. Sisa = ${n} − ${d * q} = <b>${s}</b>.`); } },
        { id: '4E3', name: 'Membagi dengan 10, 100, dan 1.000', gen() { const k = pick([10, 100, 1000]), q = r(2, 999), n = q * k; return inp(`${fmt(n)} ÷ ${fmt(k)} = ?`, q, `Membagi dengan ${fmt(k)}: hapus ${String(k).length - 1} nol di belakang. Jawabannya <b>${q}</b>.`, { meta: { op: '/', a: n, b: k, kind: 'unit' } }); } },
        { id: '4E4', name: 'Soal cerita pembagian bersisa', gen() { const d = r(4, 9), q = r(8, 40), s = r(1, d - 1), n = d * q + s; if (Math.random() < 0.5) return inp(`${n} peserta akan naik perahu karet. Setiap perahu muat ${d} orang. Berapa perahu yang dibutuhkan?`, q + 1, `${n} ÷ ${d} = ${q} sisa ${s}. Sisa ${s} orang butuh 1 perahu lagi: <b>${q + 1}</b> perahu.`, { meta: { alt: { [String(q)]: 'sisa' } } }); return inp(`Ada ${n} buku yang akan disusun ${d} buku per tumpukan. Berapa tumpukan lengkap yang bisa dibuat?`, q, `${n} ÷ ${d} = ${q} sisa ${s}. Tumpukan lengkap ada <b>${q}</b>.`, { meta: { alt: { [String(q + 1)]: 'sisa' } } }); } },
      ],
    },
    {
      id: '4F', grade: 4, name: 'Soal multi-langkah dan urutan operasi', icon: '📘', color: '#00cec9',
      sg: '4A · Word Problems; Order of Operations', ixl: 'I, P', km: 'Aljabar; Bilangan',
      tip: 'Urutan operasi: kurung dulu, lalu kali dan bagi (dari kiri), baru tambah dan kurang (dari kiri).',
      skills: [
        { id: '4F1', name: 'Soal cerita multi-langkah', gen() { const a = r(3, 6) * 5000 + 5000, na = r(2, 4), b = r(5, 12) * 5000, nb = r(1, 3); const tot = a * na + b * nb, pay = Math.ceil(tot / 50000) * 50000 + (tot % 50000 === 0 ? 50000 : 0); return inp(`Ayah membeli ${na} kaos seharga ${rp(a)} per kaos dan ${nb} celana seharga ${rp(b)} per celana. Ayah membayar ${rp(pay)}. Berapa kembaliannya? (tulis angkanya saja)`, pay - tot, `Kaos: ${na} × ${rp(a)} = ${rp(a * na)}. Celana: ${nb} × ${rp(b)} = ${rp(b * nb)}. Total ${rp(tot)}. Kembalian ${rp(pay)} − ${rp(tot)} = <b>${rp(pay - tot)}</b>.`, { unit: 'Rp' }); } },
        { id: '4F2', name: 'Urutan operasi hitung', gen() { const a = r(2, 20), b = r(2, 9), c = r(2, 9); const t = r(0, 2); if (t === 0) { const ans = a + b * c; return inp(`${a} + ${b} × ${c} = ?`, ans, `Kerjakan perkalian dulu: ${b} × ${c} = ${b * c}, lalu ${a} + ${b * c} = <b>${ans}</b>.`, { vis: V.big(`${a} + ${b} × ${c}`), meta: { alt: { [String((a + b) * c)]: 'urutan-operasi' } } }); } if (t === 1) { const q = b * c, big = r(q + 1, q + 40); return inp(`${big} − ${q} ÷ ${b} = ?`, big - c, `Bagi dulu: ${q} ÷ ${b} = ${c}, lalu ${big} − ${c} = <b>${big - c}</b>.`, { vis: V.big(`${big} − ${q} ÷ ${b}`), meta: { alt: (big - q) % b === 0 ? { [String((big - q) / b)]: 'urutan-operasi' } : {} } }); } const ans = (a + b) * c; return inp(`(${a} + ${b}) × ${c} = ?`, ans, `Kerjakan dalam kurung dulu: ${a} + ${b} = ${a + b}, lalu × ${c} = <b>${ans}</b>.`, { vis: V.big(`(${a} + ${b}) × ${c}`), meta: { alt: { [String(a + b * c)]: 'urutan-operasi' } } }); } },
      ],
    },
    {
      id: '4G', grade: 4, name: 'Pola bilangan', icon: '🔁', color: '#66ffdb',
      sg: '4A · Patterns', ixl: 'R, S', km: 'Aljabar (pola bilangan)',
      tip: 'Minta anak menebak aturan pola, lalu membuat pola sendiri untuk ditebak orang tua.',
      skills: [
        { id: '4G1', name: 'Melanjutkan pola bilangan', gen() { const t = pick(['+', '-', 'x']); let seq; if (t === 'x') { const k = pick([2, 3]), s = r(1, 5); seq = range(0, 4).map((i) => s * k ** i); } else { const k = r(6, 75), s = t === '+' ? r(1, 200) : r(5 * k, 900); seq = range(0, 4).map((i) => s + (t === '+' ? 1 : -1) * i * k); } const j = r(2, 4); return inp('Bilangan berapa yang hilang?', seq[j], `Aturannya: ${t === 'x' ? `dikali ${seq[1] / seq[0]}` : `${t === '+' ? 'ditambah' : 'dikurangi'} ${Math.abs(seq[1] - seq[0])}`}. Jawabannya <b>${fmt(seq[j])}</b>.`, { log: 'Pola: ' + seq.map((v, i) => (i === j ? '?' : v)).join(', '), vis: V.seq(seq.map((v, i) => (i === j ? '?' : v))), meta: { kind: 'seq' } }); } },
        { id: '4G2', name: 'Aturan dua langkah', gen() { const a = r(2, 5), b = r(1, 9); const ins = shuffle(range(1, 10)).slice(0, 4).sort((x, y) => x - y); const out = ins.map((x) => a * x + b); return inp(`Aturan tabel: kalikan ${a}, lalu tambah ${b}. Berapa bilangan yang hilang?`, out[3], `${ins[3]} × ${a} + ${b} = ${ins[3] * a} + ${b} = <b>${out[3]}</b>.`, { vis: U.table(['Masuk', ...ins], [['Keluar', ...out.slice(0, 3), '?']]) }); } },
        { id: '4G3', name: 'Suku ke-n', gen() { const s = r(1, 12), k = r(2, 9), n = r(8, 20); const seq = range(0, 3).map((i) => s + i * k); return inp(`Pola: ${seq.join(', ')}, … Berapa suku ke-${n}?`, s + (n - 1) * k, `Setiap suku bertambah ${k}. Suku ke-${n} = ${s} + (${n} − 1) × ${k} = ${s} + ${(n - 1) * k} = <b>${s + (n - 1) * k}</b>.`); } },
      ],
    },
    {
      id: '4H', grade: 4, name: 'Pecahan senilai dan pecahan campuran', icon: '🍕', color: '#fab1a0',
      sg: '4A · Fractions (mixed numbers, improper fractions)', ixl: 'T, U, V', km: 'Bilangan (pecahan senilai)',
      tip: 'Potong 2 pizza masing-masing jadi 4. Jika ada 7 potong, itu 7/4 = 1 3/4 pizza.',
      skills: [
        { id: '4H1', name: 'Pecahan senilai', gen() { const d = r(3, 9), n = r(1, d - 1), k = r(2, 6); if (Math.random() < 0.5) return inp(`${n}/${d} = ?/${d * k}`, n * k, `${d} × ${k} = ${d * k}, maka ${n} × ${k} = <b>${n * k}</b>.`); return inp(`${n * k}/${d * k} = ${n}/?`, d, `Pembilang dibagi ${k} (${n * k} ÷ ${k} = ${n}), penyebut juga dibagi ${k}: ${d * k} ÷ ${k} = <b>${d}</b>.`); } },
        { id: '4H2', name: 'Menyederhanakan pecahan', gen() { let d, n; do { d = r(3, 12); n = r(1, d - 1); } while (gcd(n, d) !== 1); const k = r(2, 5); const good = `${n}/${d}`, N = n * k, D = d * k; const partial = gcd(N, D) % 2 === 0 && k % 2 === 0 && k > 2 ? `${N / 2}/${D / 2}` : `${N + 1}/${D}`; return ch(`Bentuk paling sederhana dari ${N}/${D} adalah...`, opts4(good, [partial, `${N}/${D}`, `${n}/${d + 1}`, `${n + 1}/${d}`]), good, `FPB dari ${N} dan ${D} adalah ${gcd(N, D)}. ${N} ÷ ${gcd(N, D)} = ${n}, ${D} ÷ ${gcd(N, D)} = ${d}. Jawabannya <b>${good}</b>.`); } },
        { id: '4H3', name: 'Pecahan campuran dan pecahan biasa', gen() { const d = r(2, 9), w = r(1, 5), n = r(1, d - 1), imp = w * d + n; if (Math.random() < 0.5) return ch(`${imp}/${d} = ?`, opts4(`${w} ${n}/${d}`, [`${w + 1} ${n}/${d}`, `${w} ${d - n}/${d}`, `${n} ${w}/${d}`, `${w} ${n}/${imp}`]), `${w} ${n}/${d}`, `${imp} ÷ ${d} = ${w} sisa ${n}. Jadi ${imp}/${d} = <b>${w} ${n}/${d}</b>.`); return inp(`${w} ${n}/${d} = ?/${d}`, imp, `${w} utuh = ${w * d}/${d}, ditambah ${n}/${d}: ${w * d} + ${n} = <b>${imp}</b>.`, { meta: { alt: { [String(w * n + d)]: 'pecahan' } } }); } },
        { id: '4H4', name: 'Membandingkan pecahan berbeda penyebut', gen() { let a, b, c, d; do { b = r(2, 9); d = r(2, 9); a = r(1, b - 1); c = r(1, d - 1); } while (b === d || a * d === c * b); const s = a * d < c * b ? '<' : '>'; return ch('Pilih tanda yang tepat.', ['<', '>', '='], s, `Samakan penyebut menjadi ${lcm(b, d)}: ${a}/${b} = ${(a * lcm(b, d)) / b}/${lcm(b, d)} dan ${c}/${d} = ${(c * lcm(b, d)) / d}/${lcm(b, d)}. Jadi <b>${a}/${b} ${s} ${c}/${d}</b>.`, { vis: V.big(`${a}/${b} <span class="q">?</span> ${c}/${d}`) }); } },
      ],
    },
    {
      id: '4I', grade: 4, name: 'Operasi pecahan', icon: '🧮', color: '#55efc4',
      sg: '4A · Fractions (add, subtract, fraction of a set)', ixl: 'W, X, Y, Z, AA', km: 'Bilangan',
      tip: 'Untuk "2/3 dari 12": bagi 12 menjadi 3 kelompok (4), lalu ambil 2 kelompok (8).',
      skills: [
        { id: '4I1', name: 'Menjumlah dan mengurangi pecahan berpenyebut sama', gen() { const d = r(3, 10), a = r(1, d + 3), b = r(1, d); const plus = Math.random() < 0.6; if (!plus && a <= b) return C.SKILLS['4I1'].gen(); const res = plus ? a + b : a - b, good = fs(res, d); const wrong = plus ? `${a + b}/${2 * d}` : `${a - b}/0`; return ch(`${a}/${d} ${plus ? '+' : '−'} ${b}/${d} = ?`, opts4(good, [plus ? wrong : fs(a + b, d), fs(res + 1, d), `${res}/${d}` === good ? fs(Math.max(1, res - 1), d) : `${res}/${d}`].filter((x) => !x.endsWith('/0'))), good, `Penyebut sama, ${plus ? 'jumlahkan' : 'kurangi'} pembilang: ${a} ${plus ? '+' : '−'} ${b} = ${res}. ${res}/${d}${good !== `${res}/${d}` ? ` = <b>${good}</b>` : ` → <b>${good}</b>`}.`, { optionTags: plus ? { [wrong]: 'penyebut-dijumlah' } : {} }); } },
        { id: '4I2', name: 'Menjumlah pecahan berpenyebut berkaitan', gen() { const d1 = pick([2, 3, 4, 5]), k = pick([2, 3]), d2 = d1 * k, a = r(1, d1 - 1), b = r(1, d2 - 1); const num = a * k + b, good = fs(num, d2); const wrong = `${a + b}/${d1 + d2}`; return ch(`${a}/${d1} + ${b}/${d2} = ?`, opts4(good, [wrong, fs(a + b, d2), fs(num + 1, d2)]), good, `Ubah ${a}/${d1} menjadi ${a * k}/${d2}. Lalu ${a * k}/${d2} + ${b}/${d2} = ${num}/${d2}${good !== `${num}/${d2}` ? ` = <b>${good}</b>` : ''}. Jawabannya <b>${good}</b>.`, { optionTags: { [wrong]: 'penyebut-dijumlah' } }); } },
        { id: '4I3', name: 'Pecahan dikali bilangan bulat', gen() { const d = r(2, 9), a = r(1, d - 1), n = r(2, 6), good = fs(a * n, d); const wrong = `${a * n}/${d * n}`; return ch(`${n} × ${a}/${d} = ?`, opts4(good, [wrong, fs(a + n, d), fs(a * n + 1, d)]), good, `${n} × ${a}/${d} = ${a} × ${n} / ${d} = ${a * n}/${d}. Jawabannya <b>${good}</b>. Penyebut tidak ikut dikali.`, { optionTags: { [wrong]: 'pecahan' } }); } },
        { id: '4I4', name: 'Pecahan dari suatu jumlah', gen() { const d = r(2, 8), n = r(1, d - 1), k = r(2, 12), tot = d * k; return inp(`Berapa ${n}/${d} dari ${tot}?`, n * k, `Bagi ${tot} menjadi ${d} bagian: ${tot} ÷ ${d} = ${k}. Ambil ${n} bagian: ${n} × ${k} = <b>${n * k}</b>.`, { vis: tot <= 40 ? V.objects('🍬', tot) : '' }); } },
      ],
    },
    {
      id: '4J', grade: 4, name: 'Desimal', icon: '🔟', color: '#fdcb6e',
      sg: '4B · Decimals (tenths, hundredths, thousandths)', ixl: 'BB, CC, DD', km: 'Bilangan (desimal; CP Fase B)',
      tip: 'Uang membantu memahami desimal: Rp1.000 dibagi 10 = Rp100 (persepuluhan), dibagi 100 = Rp10 (perseratusan).',
      skills: [
        { id: '4J1', name: 'Pecahan dan desimal', gen() { if (Math.random() < 0.5) { const n = r(1, 9), good = dec(n / 10); return ch(`${n}/10 = ?`, opts4(good, [dec(n / 100), String(n), `${n},10`, dec(n / 1000)]), good, `${n} persepuluh ditulis <b>${good}</b>.`, { optionTags: { [dec(n / 100)]: 'koma-desimal' } }); } const n = r(1, 99), good = dec(n / 100); return ch('Berapa desimal dari bagian yang diwarnai?', opts4(good, [dec(n / 10 > 9.9 ? n / 1000 : n / 10), String(n), dec(n / 1000), `0,${100 - n}`]), good, `${n} dari 100 kotak diwarnai = ${n}/100 = <b>${good}</b>.`, { vis: U.decGrid(n) }); } },
        { id: '4J2', name: 'Nilai tempat desimal', gen() { const d = shuffle(range(1, 9)).slice(0, 4), x = `${d[0]}${d[1]},${d[2]}${d[3]}`, pos = r(0, 3); const names = ['puluhan', 'satuan', 'persepuluhan', 'perseratusan']; return ch(`Pada bilangan <b>${x}</b>, angka ${d[pos]} ada di tempat...`, names, names[pos], `Dari kiri: ${d[0]} puluhan, ${d[1]} satuan, koma, ${d[2]} persepuluhan, ${d[3]} perseratusan. Jawabannya <b>${names[pos]}</b>.`); } },
        { id: '4J3', name: 'Membandingkan desimal', gen() { let a, b, tags = {}; if (Math.random() < 0.5) { const x = r(1, 9); a = x / 10; b = (x - 1) / 10 + r(1, 9) / 100; if (b > a) { b = a - r(1, 9) / 100; } } else { a = r(1, 99) / 100; b = r(1, 99) / 100; } const s = a < b ? '<' : a > b ? '>' : '='; const sa = dec(a), sb = dec(b); if (s !== '=' && sa.length !== sb.length) { const longer = sa.length > sb.length ? a : b; const naive = longer === a ? '>' : '<'; if (naive !== s) tags[naive] = 'desimal-panjang'; } return ch('Pilih tanda yang tepat.', ['<', '>', '='], s, `Samakan banyak angka di belakang koma: ${dec(a).padEnd(4, '0')} dan ${dec(b).padEnd(4, '0')}. Jadi <b>${sa} ${s} ${sb}</b>.`, { vis: V.big(`${sa} <span class="q">?</span> ${sb}`), optionTags: tags }); } },
        { id: '4J4', name: 'Menjumlah dan mengurangi desimal', gen() { const dp = pick([1, 2]), f = 10 ** dp; const a = r(11, 9 * f) / f, b = r(1, Math.min(9 * f, a * f - 1)) / f; const plus = Math.random() < 0.5; const res = plus ? a + b : a - b; return inp(`${dec(a)} ${plus ? '+' : '−'} ${dec(b)} = ?`, dec(res), `Tulis bersusun dengan koma lurus ke bawah, lalu ${plus ? 'jumlahkan' : 'kurangi'} seperti biasa. Jawabannya <b>${dec(res)}</b>.`, { keys: [','], vis: `<div class="stack"><span>${dec(a)}</span><span>${plus ? '+' : '−'} ${dec(b)}</span><span class="line">?</span></div>`, meta: { kind: 'decimal' } }); } },
      ],
    },
    {
      id: '4K', grade: 4, name: 'Data dan statistik', icon: '📊', color: '#74b9ff',
      sg: '4B · Tables and Line Graphs', ixl: 'O, EE', km: 'Analisis Data dan Peluang',
      tip: 'Catat suhu atau tinggi tanaman setiap hari, lalu gambar diagram garisnya bersama.',
      skills: [
        { id: '4K1', name: 'Membaca diagram garis', gen() { const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun']; const v = months.map(() => r(2, 18) * 5); const vis = U.lineGraph('Penjualan Kue (kotak)', months.map((m, i) => [m, v[i]]), 100, 10); if (Math.random() < 0.6) { const i = r(0, 5); return inp(`Berapa kotak kue terjual pada bulan ${months[i]}?`, v[i], `Cari titik di atas ${months[i]}, lalu lihat angka di sumbu kiri: <b>${v[i]}</b>.`, { vis }); } const i = r(0, 4); return inp(`Berapa kenaikan atau penurunan penjualan dari ${months[i]} ke ${months[i + 1]}?`, Math.abs(v[i + 1] - v[i]), `${months[i]}: ${v[i]}, ${months[i + 1]}: ${v[i + 1]}. Selisihnya <b>${Math.abs(v[i + 1] - v[i])}</b>.`, { vis, meta: { op: '-', a: Math.max(v[i], v[i + 1]), b: Math.min(v[i], v[i + 1]) } }); } },
        { id: '4K2', name: 'Modus, median, dan jangkauan', gen() { const n = pick([5, 7]); const xs = range(1, n).map(() => r(1, 20)); const t = pick(['median', 'jangkauan', 'modus']); const sorted = xs.slice().sort((a, b) => a - b); if (t === 'modus') { const m = xs[0]; xs[1] = m; xs[2] = m; } const s2 = xs.slice().sort((a, b) => a - b); const cnt = {}; xs.forEach((x) => { cnt[x] = (cnt[x] || 0) + 1; }); const top = Math.max(...Object.values(cnt)); const modes = Object.keys(cnt).filter((k) => cnt[k] === top); if (t === 'modus' && modes.length > 1) return C.SKILLS['4K2'].gen(); const ans = t === 'median' ? s2[(n - 1) / 2] : t === 'jangkauan' ? s2[n - 1] - s2[0] : +modes[0]; const how = { median: `Urutkan: ${s2.join(', ')}. Nilai tengahnya <b>${ans}</b>.`, jangkauan: `Terbesar − terkecil = ${s2[n - 1]} − ${s2[0]} = <b>${ans}</b>.`, modus: `Nilai yang paling sering muncul adalah <b>${ans}</b> (${top} kali).` }[t]; void sorted; return inp(`Data: ${xs.join(', ')}. Berapa ${t}nya?`, ans, how); } },
      ],
    },
    {
      id: '4L', grade: 4, name: 'Waktu dan satuan ukur', icon: '⏱️', color: '#ffeaa7',
      sg: '4B · Time (24-hour clock), Measures', ixl: 'FF, HH, II', km: 'Pengukuran',
      tip: 'Biasakan membaca jadwal kereta atau acara TV yang memakai jam 24.',
      skills: [
        { id: '4L1', name: 'Jam 12 dan jam 24', gen() { const H = r(13, 23), m = r(0, 11) * 5, h12 = H - 12; const part = H < 15 ? 'siang' : H < 19 ? 'sore' : 'malam'; if (Math.random() < 0.5) { const good = hm(H, m); return ch(`Pukul ${h12}.${String(m).padStart(2, '0')} ${part} ditulis dalam jam 24 sebagai...`, opts4(good, [hm(h12, m), hm(H + 1, m), hm(H - 2, m)]), good, `Setelah pukul 12.00 siang, tambahkan 12: ${h12} + 12 = ${H}. Jawabannya <b>${good}</b>.`); } const good = `pukul ${h12}.${String(m).padStart(2, '0')} ${part}`; return ch(`Pukul ${hm(H, m)} sama dengan...`, opts4(good, [`pukul ${h12}.${String(m).padStart(2, '0')} pagi`, `pukul ${h12 + 1}.${String(m).padStart(2, '0')} ${part}`, `pukul ${H - 10}.${String(m).padStart(2, '0')} ${part}`]), good, `${H} − 12 = ${h12}, dan pukul ${hm(H, m)} termasuk ${part}. Jawabannya <b>${good}</b>.`); } },
        { id: '4L2', name: 'Lama waktu (jam dan menit)', gen() { const s = r(6, 14) * 60 + r(0, 11) * 5, d = r(13, 60) * 5, e = s + d; return inp(`Perjalanan dimulai pukul ${hm(Math.floor(s / 60), s % 60)} dan berakhir pukul ${hm(Math.floor(e / 60), e % 60)}. Berapa menit lama perjalanan?`, d, `Hitung jam penuh lalu sisa menit: ${Math.floor(d / 60)} jam ${d % 60} menit = <b>${d}</b> menit.`); } },
        { id: '4L3', name: 'Mengubah satuan ukur', gen() { const [big, small, f] = pick([['km', 'm', 1000], ['kg', 'g', 1000], ['L', 'mL', 1000], ['m', 'cm', 100]]); const t = r(0, 2); if (t === 0) { const n = r(1, 9), p = r(1, f - 1); return inp(`${n} ${big} ${p} ${small} = ? ${small}`, n * f + p, `${n} × ${fmt(f)} + ${p} = <b>${fmt(n * f + p)}</b> ${small}.`, { meta: { kind: 'unit' } }); } if (t === 1) { const n = r(1, 9), h = pick([0.5, 0.25, 0.75, 0.2, 0.4]); const v = Math.round((n + h) * f); return inp(`${dec(n + h)} ${big} = ? ${small}`, v, `1 ${big} = ${fmt(f)} ${small}. ${dec(n + h)} × ${fmt(f)} = <b>${fmt(v)}</b> ${small}.`, { meta: { kind: 'unit' } }); } const tot = r(f + 1, 9 * f); return inp(`${fmt(tot)} ${small} = ${Math.floor(tot / f)} ${big} ? ${small}`, tot % f, `${Math.floor(tot / f)} ${big} = ${fmt(Math.floor(tot / f) * f)} ${small}. Sisa ${fmt(tot)} − ${fmt(Math.floor(tot / f) * f)} = <b>${tot % f}</b> ${small}.`, { meta: { kind: 'unit' } }); } },
        { id: '4L4', name: 'Soal cerita satuan ukur', gen() { const m = r(3, 6), n = r(3, 8), c = pick([25, 30, 40, 50]); if (n * c >= m * 100) return C.SKILLS['4L4'].gen(); return inp(`Pita sepanjang ${m} m dipotong menjadi ${n} potong, masing-masing ${c} cm. Berapa cm sisa pitanya?`, m * 100 - n * c, `${m} m = ${m * 100} cm. Terpakai ${n} × ${c} = ${n * c} cm. Sisa ${m * 100} − ${n * c} = <b>${m * 100 - n * c}</b> cm.`, { meta: { kind: 'unit' } }); } },
      ],
    },
    {
      id: '4M', grade: 4, name: 'Luas dan keliling', icon: '📐', color: '#00b894',
      sg: '4A · Area and Perimeter (composite figures)', ixl: 'JJ, KK, LL', km: 'Pengukuran (luas dan keliling)',
      tip: 'Untuk bangun berbentuk L, pecah menjadi dua persegi panjang atau hitung persegi panjang besar dikurangi yang hilang.',
      skills: [
        { id: '4M1', name: 'Luas persegi dan persegi panjang', gen() { const w = r(5, 25), h = Math.random() < 0.3 ? w : r(3, 20); return inp(`Berapa cm² luas bangun ini?`, w * h, `Luas = ${w} × ${h} = <b>${w * h}</b> cm².`, { vis: U.rectLabel(w, h), meta: { op: 'x', a: w, b: h, alt: { [String(2 * (w + h))]: 'luas-keliling' } } }); } },
        { id: '4M2', name: 'Luas bangun gabungan', gen() { const a = r(8, 16), b = r(6, 12), c = r(Math.ceil(a / 3), a - 3), d = r(Math.ceil(b / 3), b - 3); const ans = a * b - c * d; return inp('Berapa cm² luas bangun berbentuk L ini?', ans, `Persegi panjang besar ${a} × ${b} = ${a * b}, dikurangi pojok yang hilang ${c} × ${d} = ${c * d}. ${a * b} − ${c * d} = <b>${ans}</b> cm².`, { vis: U.lshape(a, b, c, d) }); } },
        { id: '4M3', name: 'Mencari sisi dari luas', gen() { if (Math.random() < 0.4) { const s = r(3, 12); return inp(`Luas sebuah persegi ${s * s} cm². Berapa cm panjang sisinya?`, s, `Cari bilangan yang dikali dirinya sendiri = ${s * s}: ${s} × ${s} = ${s * s}. Jawabannya <b>${s}</b> cm.`); } const w = r(4, 15), h = r(3, 12); return inp(`Luas persegi panjang ${w * h} cm² dan panjangnya ${w} cm. Berapa cm lebarnya?`, h, `Lebar = luas ÷ panjang = ${w * h} ÷ ${w} = <b>${h}</b> cm.`); } },
        { id: '4M4', name: 'Keliling bangun gabungan', gen() { const a = r(8, 16), b = r(6, 12), c = r(Math.ceil(a / 3), a - 3), d = r(Math.ceil(b / 3), b - 3); return inp('Berapa cm keliling bangun berbentuk L ini?', 2 * (a + b), `Jumlahkan semua sisi luar. Sisi-sisi pojok yang masuk ke dalam panjangnya sama dengan sisi yang hilang, jadi kelilingnya = 2 × (${a} + ${b}) = <b>${2 * (a + b)}</b> cm.`, { vis: U.lshape(a, b, c, d), meta: { alt: { [String(a * b - c * d)]: 'luas-keliling' } } }); } },
      ],
    },
    {
      id: '4N', grade: 4, name: 'Sudut dan arah', icon: '🧭', color: '#e84393',
      sg: '4B · Angles; 8-point Compass', ixl: 'MM, NN', km: 'Geometri; Pengukuran (sudut)',
      tip: 'Jarum jam membentuk sudut: pukul 3.00 = 90°, pukul 6.00 = 180°. Latih arah mata angin di halaman rumah.',
      skills: [
        { id: '4N1', name: 'Jenis sudut', gen() { const t = pick(['lancip', 'siku-siku', 'tumpul']); const deg = t === 'lancip' ? r(15, 80) : t === 'siku-siku' ? 90 : r(100, 170); if (Math.random() < 0.3) { const [q, a] = pick([['Sudut yang besarnya 180° disebut sudut...', 'lurus'], [`Sudut ${r(10, 85)}° termasuk sudut...`, 'lancip'], [`Sudut ${r(95, 175)}° termasuk sudut...`, 'tumpul']]); return ch(q, ['lancip', 'siku-siku', 'tumpul', 'lurus'], a, 'Lancip < 90°, siku-siku = 90°, tumpul antara 90° dan 180°, lurus = 180°. Jawabannya <b>' + a + '</b>.'); } return ch('Jenis sudut ini adalah...', ['lancip', 'siku-siku', 'tumpul', 'lurus'], t, `Sudut ini ${deg === 90 ? 'tepat 90°' : deg < 90 ? 'kurang dari 90°' : 'lebih dari 90°'}, jadi <b>${t}</b>.`, { vis: U.angle(deg) }); } },
        { id: '4N2', name: 'Memperkirakan besar sudut', gen() { const vals = [30, 45, 60, 90, 120, 135, 150]; const deg = pick(vals); return ch('Kira-kira berapa besar sudut ini?', opts4(`${deg}°`, vals.map((v) => `${v}°`)), `${deg}°`, `Bandingkan dengan sudut siku-siku (90°). Sudut ini kira-kira <b>${deg}°</b>.`, { vis: U.angle(deg) }); } },
        { id: '4N3', name: 'Mencari sudut yang hilang', gen() { if (Math.random() < 0.6) { const k = r(20, 160); return inp('Kedua sudut berada pada garis lurus. Berapa derajat sudut yang ditanya?', 180 - k, `Sudut pada garis lurus berjumlah 180°. 180 − ${k} = <b>${180 - k}</b>°.`, { vis: U.straight(k, 180) }); } const k = r(15, 75); return inp('Kedua sudut membentuk sudut siku-siku. Berapa derajat sudut yang ditanya?', 90 - k, `Jumlah keduanya 90°. 90 − ${k} = <b>${90 - k}</b>°.`, { vis: U.straight(k, 90) }); } },
        { id: '4N4', name: 'Arah mata angin dan putaran', gen() { const s = r(0, 7), turn = pick([45, 90, 135, 180, 270]), cw = Math.random() < 0.6; const e = (s + (cw ? 1 : -1) * (turn / 45) + 8) % 8; return ch(`Kamu menghadap ke ${DIR[s]}, lalu berputar ${turn}° ${cw ? 'searah' : 'berlawanan arah'} jarum jam. Sekarang kamu menghadap ke...`, opts4(DIR[e], [DIR[(e + 4) % 8], DIR[(s + (cw ? -1 : 1) * (turn / 45) + 8) % 8], DIR[(e + 2) % 8], DIR[(e + 1) % 8]]), DIR[e], `Setiap 45° berpindah satu arah pada mawar angin. ${turn}° = ${turn / 45} langkah ${cw ? 'searah' : 'berlawanan arah'} jarum jam dari ${DIR[s]}: <b>${DIR[e]}</b>.`, { vis: U.compass() }); } },
      ],
    },
    {
      id: '4O', grade: 4, name: 'Segitiga, segi empat, dan simetri', icon: '🔺', color: '#fab1a0',
      sg: '4B · Rectangle and Square; Symmetry', ixl: 'OO, PP, QQ', km: 'Geometri',
      tip: 'Lipat kertas berbentuk bangun datar. Jika kedua bagian tepat menutup, lipatan itu sumbu simetri.',
      skills: [
        { id: '4O1', name: 'Jenis segitiga', gen() { const [nm, clue] = pick([['segitiga sama sisi', 'ketiga sisinya sama panjang'], ['segitiga sama kaki', 'dua sisinya sama panjang'], ['segitiga sembarang', 'ketiga sisinya berbeda panjang'], ['segitiga siku-siku', 'salah satu sudutnya 90°']]); return ch(`Segitiga yang ${clue} disebut...`, ['segitiga sama sisi', 'segitiga sama kaki', 'segitiga sembarang', 'segitiga siku-siku'], nm, `Segitiga yang ${clue} adalah <b>${nm}</b>.`); } },
        { id: '4O2', name: 'Sifat segi empat', gen() { const [q, a] = pick([['Berapa pasang sisi sejajar pada jajargenjang?', 2], ['Berapa pasang sisi sejajar pada trapesium?', 1], ['Berapa sudut siku-siku pada persegi panjang?', 4], ['Berapa sudut siku-siku pada belah ketupat (yang bukan persegi)?', 0], ['Berapa sisi yang sama panjang pada persegi?', 4], ['Berapa derajat jumlah keempat sudut segi empat?', 360]]); const v = q.includes('jajargenjang') ? JAJAR : q.includes('trapesium') ? TRAP : ''; return inp(q, a, `Jawabannya <b>${a}</b>.`, { vis: v }); } },
        { id: '4O3', name: 'Sumbu simetri', gen() { const [nm, n, vis] = pick([['persegi', 4, V.shape('persegi', '#00b894')], ['persegi panjang', 2, V.shape('persegi panjang', '#00b894')], ['segitiga sama sisi', 3, U.poly(3, '#00b894')], ['belah ketupat', 2, V.shape('belah ketupat', '#00b894')], ['jajargenjang', 0, JAJAR], ['segi enam beraturan', 6, U.poly(6, '#00b894')], ['segi lima beraturan', 5, U.poly(5, '#00b894')]]); return inp(`Berapa banyak sumbu simetri pada ${nm}?`, n, n ? `${nm[0].toUpperCase() + nm.slice(1)} bisa dilipat menjadi dua bagian yang sama dengan <b>${n}</b> cara.` : 'Jajargenjang tidak bisa dilipat menjadi dua bagian yang tepat sama. Jawabannya <b>0</b>.', { vis }); } },
      ],
    },
    {
      id: '4P', grade: 4, name: 'Uang dan literasi keuangan', icon: '💰', color: '#81ecec',
      sg: '— (konteks Singapore Math: Money)', ixl: 'Q, RR', km: 'Bilangan (konteks uang)',
      tip: 'Ajak anak membandingkan harga per satuan di toko: kemasan besar belum tentu lebih murah.',
      skills: [
        { id: '4P1', name: 'Membandingkan harga satuan', gen() { const pa = r(4, 9) * 500, pb = pa + pick([-1, 1]) * r(1, 3) * 100; const na = r(2, 5), nb = r(na + 1, 8); const A = pa * na, B = pb * nb; const good = pa < pb ? 'Paket A' : 'Paket B'; return ch(`Paket A: ${na} buku seharga ${rp(A)}. Paket B: ${nb} buku seharga ${rp(B)}. Mana yang lebih murah per buku?`, ['Paket A', 'Paket B'], good, `Harga per buku: A = ${rp(A)} ÷ ${na} = ${rp(pa)}, B = ${rp(B)} ÷ ${nb} = ${rp(pb)}. Yang lebih murah <b>${good}</b>.`); } },
        { id: '4P2', name: 'Menabung', gen() { const s = r(2, 10) * 1000, w = r(4, 20), T = s * w; return inp(`${two()[0]} menabung ${rp(s)} setiap minggu. Berapa minggu ia harus menabung untuk mengumpulkan ${rp(T)}?`, w, `${rp(T)} ÷ ${rp(s)} = <b>${w}</b> minggu.`, { meta: { op: '/', a: T, b: s } }); } },
      ],
    },
  ];

  C.register(UNITS);
  C.GRADES.push({ id: 4, name: 'Kelas 4', ixl: 'https://www.ixl.com/math/grade-4', sg: 'Primary Mathematics / Dimensions Math 4A dan 4B' });
})();
