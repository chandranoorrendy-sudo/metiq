/* Metiq — Kurikulum Matematika Kelas 5
 * Dari daftar keterampilan IXL kelas 5 dan Singapore Math 5A/5B: bilangan sampai jutaan, pangkat
 * sepuluh, FPB dan KPK, urutan operasi dan ekspresi, operasi pecahan berbeda penyebut,
 * desimal sampai perseribuan, rasio, persen, koordinat, volume, luas segitiga, dan rata-rata.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, range, rp, V, inp, ch, two, fmt, dec, opts4, gcd, lcm, simp, fs, stack, U } = C.kit;
  const R = (n, t) => Math.floor(n / t + 0.5) * t;
  const ratio = (a, b) => { const [x, y] = simp(a, b); return `${x} : ${y}`; };
  const pt = (x, y) => `(${x}, ${y})`;

  Object.assign(C.TAGS, {
    'koordinat-tertukar': { label: 'Tertukar urutan koordinat (x, y)', tip: 'Ingat "jalan dulu, baru naik": angka pertama mendatar (x), angka kedua tegak (y).' },
    'rasio-terbalik': { label: 'Membalik urutan rasio', tip: 'Rasio A : B ditulis sesuai urutan yang disebut di soal. "Apel terhadap jeruk" berarti apel dulu.' },
  });

  const UNITS = [
    {
      id: '5A', grade: 5, name: 'Bilangan besar dan pangkat sepuluh', icon: '🔢', color: '#ff7a59',
      sg: '5A · Whole Numbers (to 10 million)', ixl: 'A, B, C', km: 'Bilangan (CP Fase C: bilangan cacah sampai 1.000.000)',
      tip: 'Cari angka besar di koran (anggaran, jumlah penduduk) dan baca bersama tempat setiap angkanya.',
      skills: [
        { id: '5A1', name: 'Nilai angka sampai jutaan', gen() { const d = shuffle(range(1, 9)).slice(0, 7), n = +d.join(''), pos = r(0, 6), val = d[pos] * 10 ** (6 - pos); const names = ['jutaan', 'ratus ribuan', 'puluh ribuan', 'ribuan', 'ratusan', 'puluhan', 'satuan']; return ch(`Pada bilangan <b>${fmt(n)}</b>, angka ${d[pos]} bernilai berapa?`, opts4(fmt(val), range(0, 6).map((p) => fmt(d[pos] * 10 ** p))), fmt(val), `Angka ${d[pos]} ada di tempat ${names[pos]}, nilainya <b>${fmt(val)}</b>.`); } },
        { id: '5A2', name: 'Membulatkan bilangan sampai jutaan', gen() { const t = pick([1000, 10000, 100000, 1000000]), n = r(1000001, 9899999); const ans = R(n, t), lo = Math.floor(n / t) * t; return inp(`Bulatkan ${fmt(n)} ke ${{ 1000: 'ribuan', 10000: 'puluh ribuan', 100000: 'ratus ribuan', 1000000: 'jutaan' }[t]} terdekat.`, ans, `Lihat angka tepat di kanan tempat pembulatan: 5 atau lebih dibulatkan ke atas. Jawabannya <b>${fmt(ans)}</b>.`, { meta: { kind: 'round', wrong: ans === lo ? lo + t : lo } }); } },
        { id: '5A3', name: 'Pangkat sepuluh', gen() { const t = r(0, 2); if (t === 0) { const k = r(2, 6); return inp(`10<sup>${k}</sup> = ?`, 10 ** k, `10<sup>${k}</sup> artinya 10 dikali dirinya ${k} kali = 1 diikuti ${k} nol: <b>${fmt(10 ** k)}</b>.`, { log: `10^${k} = ?` }); } if (t === 1) { const a = r(2, 9), k = r(2, 5); return inp(`${a} × 10<sup>${k}</sup> = ?`, a * 10 ** k, `${a} × ${fmt(10 ** k)} = <b>${fmt(a * 10 ** k)}</b>.`, { log: `${a} × 10^${k} = ?`, meta: { kind: 'unit' } }); } const n = r(11, 999), k = pick([10, 100, 1000]); return inp(`${n} × ${fmt(k)} = ?`, n * k, `Tambahkan ${String(k).length - 1} nol: <b>${fmt(n * k)}</b>.`, { meta: { kind: 'unit' } }); } },
      ],
    },
    {
      id: '5B', grade: 5, name: 'Perkalian dan pembagian', icon: '✖️', color: '#7c5cff',
      sg: '5A · Four Operations (multiply and divide by 2-digit)', ixl: 'D, E, G', km: 'Bilangan',
      tip: 'Perkirakan dulu: 312 × 48 kira-kira 300 × 50 = 15.000. Jika jawabanmu jauh dari itu, periksa lagi.',
      skills: [
        { id: '5B1', name: 'Tiga angka dikali dua angka', gen() { const a = r(102, 999), b = r(11, 99); return inp(`${a} × ${b} = ?`, a * b, `${a} × ${b} = ${a} × ${Math.floor(b / 10) * 10} + ${a} × ${b % 10} = ${fmt(a * Math.floor(b / 10) * 10)} + ${fmt(a * (b % 10))} = <b>${fmt(a * b)}</b>.`, { vis: stack(a, '×', b), meta: { op: 'x', a, b } }); } },
        { id: '5B2', name: 'Membagi dengan bilangan dua angka', gen() { const d = r(11, 48), q = r(12, 99), n = d * q; return inp(`${fmt(n)} ÷ ${d} = ?`, q, `Perkirakan: ${d} × ${Math.floor(q / 10) * 10} = ${fmt(d * Math.floor(q / 10) * 10)}. Sisanya ${fmt(n - d * Math.floor(q / 10) * 10)} ÷ ${d} = ${q % 10}. Jawabannya <b>${q}</b>.`, { vis: V.big(`${fmt(n)} ÷ ${d} = <span class="q">?</span>`), meta: { op: '/', a: n, b: d } }); } },
        { id: '5B3', name: 'Soal cerita perkalian dan pembagian', gen() { if (Math.random() < 0.5) { const a = r(12, 48), b = r(105, 480); return inp(`Sebuah pabrik membuat ${b} botol setiap jam. Berapa botol yang dibuat dalam ${a} jam?`, a * b, `${b} × ${a} = <b>${fmt(a * b)}</b> botol.`, { meta: { op: 'x', a, b } }); } const d = r(12, 36), q = r(15, 80); return inp(`${fmt(d * q)} kursi disusun menjadi ${d} baris sama banyak. Berapa kursi di setiap baris?`, q, `${fmt(d * q)} ÷ ${d} = <b>${q}</b> kursi.`, { meta: { op: '/', a: d * q, b: d } }); } },
      ],
    },
    {
      id: '5C', grade: 5, name: 'FPB dan KPK', icon: '🧩', color: '#fd79a8',
      sg: '5A · Factors and Multiples (HCF, LCM)', ixl: 'F', km: 'Bilangan (KPK dan FPB; CP Fase C)',
      tip: 'Soal "bertemu lagi" atau "berbunyi bersama" biasanya KPK. Soal "dibagi sama banyak sebanyak-banyaknya" biasanya FPB.',
      skills: [
        { id: '5C1', name: 'Faktor persekutuan terbesar (FPB)', gen() { const g = r(2, 12), [x, y] = shuffle([2, 3, 5, 7, 4, 9]).slice(0, 2), a = g * x, b = g * y; if (gcd(x, y) !== 1) return C.SKILLS['5C1'].gen(); return inp(`Berapa FPB dari ${a} dan ${b}?`, g, `Faktor yang sama dari ${a} dan ${b}, ambil yang terbesar. ${a} = ${g} × ${x}, ${b} = ${g} × ${y}. FPB = <b>${g}</b>.`, { meta: { alt: { [String(lcm(a, b))]: 'konsep' } } }); } },
        { id: '5C2', name: 'Kelipatan persekutuan terkecil (KPK)', gen() { const [a, b] = shuffle([4, 6, 8, 9, 10, 12, 15]).slice(0, 2); return inp(`Berapa KPK dari ${a} dan ${b}?`, lcm(a, b), `Kelipatan ${a}: ${range(1, 5).map((i) => a * i).join(', ')}, …  Kelipatan ${b}: ${range(1, 5).map((i) => b * i).join(', ')}, …  Yang sama paling kecil: <b>${lcm(a, b)}</b>.`); } },
        { id: '5C3', name: 'Soal cerita FPB dan KPK', gen() { if (Math.random() < 0.5) { const [a, b] = shuffle([2, 3, 4, 5, 6]).slice(0, 2); return inp(`Lampu merah berkedip setiap ${a} detik dan lampu biru setiap ${b} detik. Jika keduanya berkedip bersamaan sekarang, berapa detik lagi mereka berkedip bersama?`, lcm(a, b), `Cari KPK dari ${a} dan ${b}: <b>${lcm(a, b)}</b> detik.`); } const g = r(3, 9), x = r(2, 6), y = r(x + 1, 9), A = g * x, B = g * y; if (gcd(x, y) !== 1) return C.SKILLS['5C3'].gen(); return inp(`Ada ${A} apel dan ${B} jeruk yang akan dibagi ke dalam kantong, masing-masing berisi apel dan jeruk sama banyak. Berapa kantong paling banyak yang bisa dibuat?`, g, `Cari FPB dari ${A} dan ${B}: <b>${g}</b> kantong (tiap kantong ${x} apel dan ${y} jeruk).`); } },
      ],
    },
    {
      id: '5D', grade: 5, name: 'Ekspresi dan urutan operasi', icon: '🔣', color: '#e17055',
      sg: '5A · Order of Operations; Algebra (simple expressions)', ixl: 'H, MM', km: 'Aljabar',
      tip: 'Tulis kalimat soal menjadi kalimat matematika dulu sebelum menghitung.',
      skills: [
        { id: '5D1', name: 'Urutan operasi dengan kurung', gen() { const a = r(2, 9), b = r(2, 9), c = r(2, 9), d = r(1, 20); const t = r(0, 2); if (t === 0) { const ans = a * (b + c) - d; if (ans < 0) return C.SKILLS['5D1'].gen(); return inp(`${a} × (${b} + ${c}) − ${d} = ?`, ans, `Kurung: ${b} + ${c} = ${b + c}. Kali: ${a} × ${b + c} = ${a * (b + c)}. Kurang: ${a * (b + c)} − ${d} = <b>${ans}</b>.`, { vis: V.big(`${a} × (${b} + ${c}) − ${d}`), meta: { alt: { [String(a * b + c - d)]: 'urutan-operasi' } } }); } if (t === 1) { const q = b * c, ans = d + q / b * a; return inp(`${d} + ${q} ÷ ${b} × ${a} = ?`, ans, `Kali dan bagi dari kiri: ${q} ÷ ${b} = ${c}, ${c} × ${a} = ${c * a}. Lalu ${d} + ${c * a} = <b>${ans}</b>.`, { vis: V.big(`${d} + ${q} ÷ ${b} × ${a}`) }); } const ans = (a + b) * c - a * b; if (ans < 0) return C.SKILLS['5D1'].gen(); return inp(`(${a} + ${b}) × ${c} − ${a} × ${b} = ?`, ans, `(${a + b}) × ${c} = ${(a + b) * c}; ${a} × ${b} = ${a * b}. ${(a + b) * c} − ${a * b} = <b>${ans}</b>.`, { vis: V.big(`(${a} + ${b}) × ${c} − ${a} × ${b}`) }); } },
        { id: '5D2', name: 'Menulis ekspresi dari kalimat', gen() { const a = r(5, 20), b = r(2, a - 1), c = r(2, 9); const [txt, good, bad] = pick([[`Kurangi ${b} dari ${a}, lalu kalikan hasilnya dengan ${c}.`, `(${a} − ${b}) × ${c}`, [`${a} − ${b} × ${c}`, `(${b} − ${a}) × ${c}`, `${c} × ${a} − ${b}`]], [`Jumlahkan ${a} dan ${b}, lalu bagi dengan ${c}.`, `(${a} + ${b}) ÷ ${c}`, [`${a} + ${b} ÷ ${c}`, `${c} ÷ (${a} + ${b})`, `${a} + ${b} × ${c}`]], [`Kalikan ${c} dengan ${b}, lalu tambahkan ${a}.`, `${c} × ${b} + ${a}`, [`${c} × (${b} + ${a})`, `${c} + ${b} × ${a}`, `(${c} + ${b}) × ${a}`]]]); return ch(txt + ' Ekspresi mana yang sesuai?', opts4(good, bad), good, `Bagian yang dikerjakan lebih dulu diberi kurung jika perlu. Jawabannya <b>${good}</b>.`); } },
        { id: '5D3', name: 'Nilai ekspresi dengan variabel', gen() { const n = r(2, 12), a = r(2, 9), b = r(1, 20); const t = r(0, 2); if (t === 0) return inp(`Jika n = ${n}, berapa nilai ${a}n + ${b}?`, a * n + b, `${a}n artinya ${a} × n = ${a} × ${n} = ${a * n}. Ditambah ${b}: <b>${a * n + b}</b>.`, { meta: { alt: { [String(Number(`${a}${n}`) + b)]: 'konsep' } } }); if (t === 1) return inp(`Jika n = ${n}, berapa nilai ${a} × (n + ${b})?`, a * (n + b), `${n} + ${b} = ${n + b}, lalu × ${a} = <b>${a * (n + b)}</b>.`); const m = a * n; return inp(`Jika n = ${m}, berapa nilai n ÷ ${a} + ${b}?`, n + b, `${m} ÷ ${a} = ${n}, lalu + ${b} = <b>${n + b}</b>.`); } },
      ],
    },
    {
      id: '5E', grade: 5, name: 'Menjumlah dan mengurangi pecahan', icon: '🍕', color: '#fab1a0',
      sg: '5A · Fractions (unlike denominators, mixed numbers)', ixl: 'J, K, L, M', km: 'Bilangan (operasi pecahan; CP Fase C)',
      tip: 'Samakan penyebut dengan KPK: 2/3 + 1/4 → penyebut 12 → 8/12 + 3/12 = 11/12.',
      skills: [
        { id: '5E1', name: 'Menjumlah pecahan berbeda penyebut', gen() { let b, d; do { b = r(2, 8); d = r(2, 9); } while (b === d); const a = r(1, b - 1), c = r(1, d - 1), L = lcm(b, d), N = a * (L / b) + c * (L / d); const good = fs(N, L), wrong = `${a + c}/${b + d}`; return ch(`${a}/${b} + ${c}/${d} = ?`, opts4(good, [wrong, fs(N + 1, L), fs(a * c, b * d), fs(a + c, L)]), good, `KPK ${b} dan ${d} = ${L}. ${a}/${b} = ${a * (L / b)}/${L}, ${c}/${d} = ${c * (L / d)}/${L}. Jumlahnya ${N}/${L} = <b>${good}</b>.`, { optionTags: { [wrong]: 'penyebut-dijumlah' } }); } },
        { id: '5E2', name: 'Mengurangi pecahan berbeda penyebut', gen() { let a, b, c, d; do { b = r(2, 8); d = r(2, 9); a = r(1, b - 1); c = r(1, d - 1); } while (b === d || a * d <= c * b); const L = lcm(b, d), N = a * (L / b) - c * (L / d), good = fs(N, L); const wrong = a > c && b !== d ? `${a - c}/${Math.abs(b - d) || 1}` : `${N + 1}/${L}`; return ch(`${a}/${b} − ${c}/${d} = ?`, opts4(good, [wrong, fs(N + 1, L), fs(Math.max(1, N - 1), L), `${a}/${d}`]), good, `Samakan penyebut menjadi ${L}: ${a * (L / b)}/${L} − ${c * (L / d)}/${L} = ${N}/${L} = <b>${good}</b>.`, { optionTags: { [wrong]: 'penyebut-dijumlah' } }); } },
        { id: '5E3', name: 'Menjumlah dan mengurangi pecahan campuran', gen() { const d = r(3, 9), w1 = r(1, 5), w2 = r(1, 4), a = r(1, d - 1), b = r(1, d - 1); const plus = Math.random() < 0.6; const A = w1 * d + a, B = w2 * d + b; if (!plus && A <= B) return C.SKILLS['5E3'].gen(); const res = plus ? A + B : A - B, good = fs(res, d); return ch(`${w1} ${a}/${d} ${plus ? '+' : '−'} ${w2} ${b}/${d} = ?`, opts4(good, [fs(res + d, d), fs(res - 1 > 0 ? res - 1 : res + 2, d), `${plus ? w1 + w2 : w1 - w2} ${plus ? a + b : Math.abs(a - b)}/${d}`]), good, `Ubah ke pecahan biasa: ${A}/${d} ${plus ? '+' : '−'} ${B}/${d} = ${res}/${d} = <b>${good}</b>.`); } },
        { id: '5E4', name: 'Soal cerita pecahan', gen() { const [b, d] = pick([[2, 4], [3, 6], [4, 8], [2, 3], [3, 4], [2, 5]]), a = r(1, b - 1), c = r(1, d - 1), L = lcm(b, d), N = a * (L / b) + c * (L / d), good = fs(N, L); return ch(`Ibu memakai ${a}/${b} kg tepung untuk kue dan ${c}/${d} kg untuk roti. Berapa kg tepung yang dipakai seluruhnya?`, opts4(good, [`${a + c}/${b + d}`, fs(N + 1, L), fs(Math.abs(a * (L / b) - c * (L / d)) || 1, L)]), good, `${a}/${b} + ${c}/${d} = ${a * (L / b)}/${L} + ${c * (L / d)}/${L} = ${N}/${L} = <b>${good}</b> kg.`, { optionTags: { [`${a + c}/${b + d}`]: 'penyebut-dijumlah' } }); } },
      ],
    },
    {
      id: '5F', grade: 5, name: 'Mengalikan dan membagi pecahan', icon: '✂️', color: '#55efc4',
      sg: '5A · Fractions (multiply; fraction and division)', ixl: 'N–V', km: 'Bilangan (CP Fase C: perkalian dan pembagian pecahan dengan bilangan asli)',
      tip: '1/2 × 1/3: ambil setengah dari sepertiga kue = 1/6. Membagi dengan 1/2 sama dengan mengali 2.',
      skills: [
        { id: '5F1', name: 'Pecahan dikali pecahan', gen() { const b = r(2, 9), d = r(2, 9), a = r(1, b - 1), c = r(1, d - 1), good = fs(a * c, b * d); return ch(`${a}/${b} × ${c}/${d} = ?`, opts4(good, [fs(a * d, b * c), `${a + c}/${b + d}`, fs(a * c, b + d), fs(a * c + 1, b * d)]), good, `Kalikan pembilang dengan pembilang, penyebut dengan penyebut: ${a * c}/${b * d} = <b>${good}</b>.`); } },
        { id: '5F2', name: 'Pecahan campuran dikali bilangan bulat', gen() { const d = r(2, 6), w = r(1, 4), a = r(1, d - 1), n = r(2, 6), imp = w * d + a, good = fs(imp * n, d); return ch(`${w} ${a}/${d} × ${n} = ?`, opts4(good, [`${w * n} ${a}/${d}`, fs(imp * n + 1, d), fs(imp * n, d * n)]), good, `${w} ${a}/${d} = ${imp}/${d}. ${imp}/${d} × ${n} = ${imp * n}/${d} = <b>${good}</b>.`); } },
        { id: '5F3', name: 'Membagi dengan pecahan satuan', gen() { const d = r(2, 8), n = r(2, 9); if (Math.random() < 0.5) return inp(`${n} ÷ 1/${d} = ?`, n * d, `Ada berapa 1/${d} dalam ${n}? Setiap 1 utuh berisi ${d} bagian, jadi ${n} × ${d} = <b>${n * d}</b>.`, { meta: { alt: { [String(Math.round(n / d))]: 'pecahan' } } }); const good = `1/${d * n}`; return ch(`1/${d} ÷ ${n} = ?`, opts4(good, [`${n}/${d}`, `1/${d + n}`, `${d}/${n}`]), good, `Membagi 1/${d} menjadi ${n} bagian sama: 1/${d} × 1/${n} = <b>${good}</b>.`); } },
        { id: '5F4', name: 'Pecahan sebagai pembagian', gen() { let a, b; do { a = r(1, 9); b = r(2, 9); } while (a % b === 0); const good = fs(a, b); return ch(`${a} pizza dibagi rata untuk ${b} anak. Berapa bagian pizza untuk setiap anak?`, opts4(good, [`${b}/${a}`, fs(a + 1, b), `1/${a * b}`]), good, `${a} ÷ ${b} = ${a}/${b}${good !== `${a}/${b}` ? ` = ${good}` : ''}. Setiap anak mendapat <b>${good}</b> pizza.`, { optionTags: { [`${b}/${a}`]: 'pecahan' } }); } },
      ],
    },
    {
      id: '5G', grade: 5, name: 'Memahami desimal', icon: '🔟', color: '#fdcb6e',
      sg: '5A · Decimals (to 3 decimal places)', ixl: 'W, X, Y, Z', km: 'Bilangan (desimal; CP Fase C)',
      tip: 'Baca 3,425 sebagai "tiga koma empat dua lima" dan sebutkan nilai tiap angkanya.',
      skills: [
        { id: '5G1', name: 'Nilai tempat sampai perseribuan', gen() { const d = shuffle(range(1, 9)).slice(0, 4), x = `${d[0]},${d[1]}${d[2]}${d[3]}`, pos = r(1, 3); const names = ['satuan', 'persepuluhan', 'perseratusan', 'perseribuan']; return ch(`Pada bilangan <b>${x}</b>, angka ${d[pos]} ada di tempat...`, names, names[pos], `Setelah koma: persepuluhan, perseratusan, perseribuan. Angka ${d[pos]} ada di tempat <b>${names[pos]}</b>.`); } },
        { id: '5G2', name: 'Membandingkan dan mengurutkan desimal', gen() { const a = r(1, 999) / 1000, k = pick([10, 100]), b = Math.round(a * 1000 / k) / (1000 / k) + pick([0, 1, -1]) / (1000 / k); const B = Math.max(0.001, Math.min(0.999, Math.round(b * 1000) / 1000)); const s = a < B ? '<' : a > B ? '>' : '='; const sa = dec(a), sb = dec(B); const tags = {}; if (s !== '=' && sa.length !== sb.length) { const naive = sa.length > sb.length ? '>' : '<'; if (naive !== s) tags[naive] = 'desimal-panjang'; } return ch('Pilih tanda yang tepat.', ['<', '>', '='], s, `Samakan banyak angka di belakang koma: ${sa.padEnd(5, '0')} dan ${sb.padEnd(5, '0')}. Jadi <b>${sa} ${s} ${sb}</b>.`, { vis: V.big(`${sa} <span class="q">?</span> ${sb}`), optionTags: tags }); } },
        { id: '5G3', name: 'Membulatkan desimal', gen() { const x = r(1001, 99999) / 1000, t = pick([0, 1, 2]); const ans = Math.round(x * 10 ** t) / 10 ** t; const name = ['bilangan bulat terdekat', 'satu tempat desimal (persepuluhan)', 'dua tempat desimal (perseratusan)'][t]; return inp(`Bulatkan ${dec(x)} ke ${name}.`, dec(ans, t), `Lihat angka sesudah tempat pembulatan: 5 atau lebih dibulatkan ke atas. Jawabannya <b>${dec(ans, t)}</b>.`, { keys: [','], meta: { kind: 'decimal' } }); } },
        { id: '5G4', name: 'Desimal dan pecahan', gen() { const [f, d] = pick([['1/2', '0,5'], ['1/4', '0,25'], ['3/4', '0,75'], ['1/5', '0,2'], ['2/5', '0,4'], ['3/5', '0,6'], ['4/5', '0,8'], ['1/8', '0,125'], ['3/8', '0,375'], ['1/10', '0,1'], ['7/10', '0,7'], ['9/20', '0,45'], ['1/20', '0,05']]); const all = ['0,5', '0,25', '0,75', '0,2', '0,4', '0,125', '0,05', '0,45', '1,2', '0,12', '0,15']; if (Math.random() < 0.5) return ch(`${f} = ?`, opts4(d, all), d, `Ubah penyebut menjadi 10, 100, atau 1.000, lalu tulis desimalnya. ${f} = <b>${d}</b>.`); const fr = ['1/2', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/8', '3/8', '1/10', '7/10', '9/20', '1/20']; return ch(`${d} = ?`, opts4(f, fr), f, `${d} = <b>${f}</b>.`); } },
      ],
    },
    {
      id: '5H', grade: 5, name: 'Operasi desimal', icon: '🧮', color: '#00cec9',
      sg: '5A · Decimals (four operations)', ixl: 'AA–GG', km: 'Bilangan',
      tip: 'Saat mengali desimal dengan 10, 100, 1.000, koma bergeser ke kanan 1, 2, 3 tempat.',
      skills: [
        { id: '5H1', name: 'Menjumlah dan mengurangi desimal', gen() { const A = r(1100, 49999), B = r(100, A - 50), dpA = pick([1, 2, 3]), dpB = pick([1, 2, 3]); const a = Math.round(A / 10 ** (3 - dpA)) / 10 ** dpA, b = Math.round(B / 10 ** (3 - dpB)) / 10 ** dpB; const plus = Math.random() < 0.5 || b >= a; const res = plus ? a + b : a - b; return inp(`${dec(a)} ${plus ? '+' : '−'} ${dec(b)} = ?`, dec(res), `Luruskan koma, tambah nol agar sama panjang, lalu ${plus ? 'jumlahkan' : 'kurangi'}. Jawabannya <b>${dec(res)}</b>.`, { keys: [','], vis: `<div class="stack"><span>${dec(a)}</span><span>${plus ? '+' : '−'} ${dec(b)}</span><span class="line">?</span></div>`, meta: { kind: 'decimal' } }); } },
        { id: '5H2', name: 'Desimal dikali bilangan bulat', gen() { const a = r(11, 999) / 100, n = r(2, 9); return inp(`${dec(a)} × ${n} = ?`, dec(a * n), `Kalikan seperti bilangan bulat (${Math.round(a * 100)} × ${n} = ${Math.round(a * 100) * n}), lalu letakkan koma dua tempat dari kanan: <b>${dec(a * n)}</b>.`, { keys: [','], meta: { kind: 'decimal' } }); } },
        { id: '5H3', name: 'Mengali dan membagi desimal dengan 10, 100, 1.000', gen() { const a = r(11, 9999) / 100, k = pick([10, 100, 1000]), mul = Math.random() < 0.5; const res = mul ? a * k : a / k; return inp(`${dec(a)} ${mul ? '×' : '÷'} ${fmt(k)} = ?`, dec(res, 5), `${mul ? 'Mengali' : 'Membagi'} dengan ${fmt(k)}: koma bergeser ${String(k).length - 1} tempat ke ${mul ? 'kanan' : 'kiri'}. Jawabannya <b>${dec(res, 5)}</b>.`, { keys: [','], meta: { kind: 'decimal' } }); } },
        { id: '5H4', name: 'Desimal dibagi bilangan bulat', gen() { const n = r(2, 9), q = r(11, 999) / 100; return inp(`${dec(q * n)} ÷ ${n} = ?`, dec(q), `Bagi seperti biasa; koma pada hasil lurus dengan koma pada bilangan yang dibagi. Jawabannya <b>${dec(q)}</b>.`, { keys: [','], meta: { kind: 'decimal' } }); } },
      ],
    },
    {
      id: '5I', grade: 5, name: 'Rasio', icon: '⚖️', color: '#a29bfe',
      sg: '5B · Ratio', ixl: '— (IXL membahas rasio di kelas 6)', km: 'Bilangan (perbandingan)',
      tip: 'Saat memasak, rasio 2 gelas beras : 3 gelas air. Jika berasnya 4 gelas, airnya berapa?',
      skills: [
        { id: '5I1', name: 'Menulis rasio', gen() { const a = r(2, 9), b = r(2, 9); if (a === b) return C.SKILLS['5I1'].gen(); const good = ratio(a, b), rev = ratio(b, a); return ch('Berapa rasio apel terhadap pisang? (bentuk paling sederhana)', opts4(good, [rev, `${a} : ${a + b}`, `${b} : ${a + b}`]), good, `Apel ${a}, pisang ${b}. Rasio ${a} : ${b}${good !== `${a} : ${b}` ? ` = ${good}` : ''}. Jawabannya <b>${good}</b>.`, { vis: `<div class="objs">${'🍎'.repeat(a)}${'🍌'.repeat(b)}</div>`, optionTags: { [rev]: 'rasio-terbalik' } }); } },
        { id: '5I2', name: 'Menyederhanakan rasio', gen() { let x, y; do { x = r(1, 9); y = r(1, 9); } while (gcd(x, y) !== 1 || x === y); const k = r(2, 8), good = `${x} : ${y}`; return ch(`Bentuk paling sederhana dari ${x * k} : ${y * k} adalah...`, opts4(good, [`${y} : ${x}`, `${x * 2} : ${y * 2}`, `${x + 1} : ${y}`, `${x} : ${y + 1}`]), good, `Bagi kedua bilangan dengan FPB-nya (${k}): <b>${good}</b>.`); } },
        { id: '5I3', name: 'Soal cerita rasio', gen() { const [n1, n2] = two(), a = r(1, 5), b = r(1, 6), k = r(2, 9); if (a === b) return C.SKILLS['5I3'].gen(); const tot = (a + b) * k; if (Math.random() < 0.5) return inp(`Rasio kelereng ${n1} dan ${n2} adalah ${a} : ${b}. Jumlah kelereng mereka ${tot}. Berapa kelereng ${n2}?`, b * k, `Ada ${a} + ${b} = ${a + b} bagian. 1 bagian = ${tot} ÷ ${a + b} = ${k}. Kelereng ${n2} = ${b} × ${k} = <b>${b * k}</b>.`, { vis: V.barModel([[...range(1, a).map(() => [k, '', 1])], [...range(1, b).map(() => ['?', '', 1])]]), meta: { alt: { [String(a * k)]: 'rasio-terbalik' } } }); return inp(`Rasio gula dan tepung dalam resep adalah ${a} : ${b}. Jika memakai ${a * k} sendok gula, berapa sendok tepung?`, b * k, `${a * k} ÷ ${a} = ${k}, jadi tepung = ${b} × ${k} = <b>${b * k}</b> sendok.`); } },
      ],
    },
    {
      id: '5J', grade: 5, name: 'Persen', icon: '💯', color: '#e84393',
      sg: '5B · Percentage', ixl: '— (IXL membahas persen di kelas 6)', km: 'Bilangan (persen; CP Fase C)',
      tip: 'Cari label diskon di toko. Diskon 20% dari Rp50.000: 10% = Rp5.000, jadi 20% = Rp10.000.',
      skills: [
        { id: '5J1', name: 'Persen, pecahan, dan desimal', gen() { const [p, f, d] = pick([['50%', '1/2', '0,5'], ['25%', '1/4', '0,25'], ['75%', '3/4', '0,75'], ['20%', '1/5', '0,2'], ['10%', '1/10', '0,1'], ['40%', '2/5', '0,4'], ['5%', '1/20', '0,05'], ['60%', '3/5', '0,6']]); const fr = ['1/2', '1/4', '3/4', '1/5', '1/10', '2/5', '1/20', '3/5', '1/25']; const ds = ['0,5', '0,25', '0,75', '0,2', '0,1', '0,4', '0,05', '0,6', '2,5']; if (Math.random() < 0.5) return ch(`${p} = ? (pecahan paling sederhana)`, opts4(f, fr), f, `${p} = ${parseInt(p)}/100 = <b>${f}</b>.`); return ch(`${p} = ? (desimal)`, opts4(d, ds), d, `${p} = ${parseInt(p)}/100 = <b>${d}</b>.`, { optionTags: { [dec(parseInt(p) / 10)]: 'koma-desimal' } }); } },
        { id: '5J2', name: 'Persen dari suatu bilangan', gen() { const p = pick([10, 20, 25, 50, 75, 5, 30, 40]), base = (p === 25 || p === 75 ? 4 : p === 5 ? 20 : 10) * r(2, 30); const ans = (p * base) / 100; return inp(`Berapa ${p}% dari ${fmt(base)}?`, ans, `${p}% dari ${fmt(base)} = ${p}/100 × ${fmt(base)} = <b>${fmt(ans)}</b>.`, { meta: { alt: { [String(base - ans)]: 'persen' } } }); } },
        { id: '5J3', name: 'Diskon', gen() { const p = pick([10, 20, 25, 30, 50]), price = r(4, 40) * 5000, disc = (p * price) / 100; return inp(`Harga sepatu ${rp(price)}, diskon ${p}%. Berapa harga yang dibayar? (tulis angkanya saja)`, price - disc, `Diskon = ${p}% × ${rp(price)} = ${rp(disc)}. Harga bayar = ${rp(price)} − ${rp(disc)} = <b>${rp(price - disc)}</b>.`, { unit: 'Rp', meta: { alt: { [String(disc)]: 'persen' } } }); } },
      ],
    },
    {
      id: '5K', grade: 5, name: 'Bidang koordinat', icon: '📍', color: '#74b9ff',
      sg: '— (Singapore Math: Coordinates di sekolah menengah)', ixl: 'LL', km: 'Geometri (koordinat; CP Fase C)',
      tip: 'Main "kapal selam" di kertas berpetak: sebutkan titik (x, y) untuk menebak letak kapal lawan.',
      skills: [
        { id: '5K1', name: 'Membaca koordinat titik', gen() { const x = r(1, 7), y = r(1, 7); if (x === y) return C.SKILLS['5K1'].gen(); const good = pt(x, y), sw = pt(y, x); return ch('Berapa koordinat titik A?', opts4(good, [sw, pt(x + 1, y), pt(x, y - 1 || y + 1)]), good, `Dari titik 0, jalan ke kanan ${x} (x), lalu naik ${y} (y). Koordinatnya <b>${good}</b>.`, { vis: U.coord([{ l: 'A', x, y }]), optionTags: { [sw]: 'koordinat-tertukar' } }); } },
        { id: '5K2', name: 'Menemukan titik dari koordinat', gen() { const pts = []; const L = ['A', 'B', 'C', 'D']; while (pts.length < 4) { const x = r(0, 7), y = r(0, 7); if (!pts.some((p) => (p.x === x && p.y === y) || (p.x === y && p.y === x))) pts.push({ l: L[pts.length], x, y }); } const tg = pick(pts); return ch(`Titik mana yang berada di ${pt(tg.x, tg.y)}?`, L, tg.l, `Jalan ke kanan ${tg.x}, lalu naik ${tg.y}: titik <b>${tg.l}</b>.`, { vis: U.coord(pts) }); } },
      ],
    },
    {
      id: '5L', grade: 5, name: 'Volume kubus dan balok', icon: '🧊', color: '#81ecec',
      sg: '5A · Volume of Cube and Cuboid', ixl: 'UU', km: 'Pengukuran (volume; CP Fase C)',
      tip: 'Hitung isi kotak susu: panjang × lebar × tinggi. 1 liter = 1.000 cm³.',
      skills: [
        { id: '5L1', name: 'Volume dengan kubus satuan', gen() { const l = r(2, 5), w = r(2, 4), h = r(2, 4); return inp('Balok ini tersusun dari kubus satuan. Berapa banyak kubus satuan?', l * w * h, `${l} × ${w} = ${l * w} kubus di satu lapis, dan ada ${h} lapis: ${l * w} × ${h} = <b>${l * w * h}</b>.`, { vis: U.cuboid(l, w, h, true) }); } },
        { id: '5L2', name: 'Volume balok', gen() { const l = r(3, 15), w = r(2, 10), h = r(2, 12); return inp('Berapa cm³ volume balok ini?', l * w * h, `Volume = panjang × lebar × tinggi = ${l} × ${w} × ${h} = <b>${fmt(l * w * h)}</b> cm³.`, { vis: U.cuboid(l, w, h) }); } },
        { id: '5L3', name: 'Mencari sisi dari volume', gen() { if (Math.random() < 0.4) { const s = r(2, 10); return inp(`Volume sebuah kubus ${fmt(s ** 3)} cm³. Berapa cm panjang rusuknya?`, s, `Cari bilangan yang dikali tiga kali = ${s ** 3}: ${s} × ${s} × ${s} = ${s ** 3}. Jawabannya <b>${s}</b> cm.`); } const l = r(3, 12), w = r(2, 9), h = r(2, 10); return inp(`Volume balok ${fmt(l * w * h)} cm³, panjang ${l} cm, lebar ${w} cm. Berapa cm tingginya?`, h, `Tinggi = ${fmt(l * w * h)} ÷ (${l} × ${w}) = ${fmt(l * w * h)} ÷ ${l * w} = <b>${h}</b> cm.`); } },
        { id: '5L4', name: 'Liter dan sentimeter kubik', gen() { if (Math.random() < 0.5) { const l = r(2, 9); return inp(`${l} liter = ? cm³`, l * 1000, `1 liter = 1.000 cm³. ${l} × 1.000 = <b>${fmt(l * 1000)}</b> cm³.`, { meta: { kind: 'unit' } }); } const l = r(10, 30), w = r(10, 20), h = 10 * r(1, 3); return inp(`Akuarium berukuran ${l} cm × ${w} cm × ${h} cm. Berapa liter air yang dapat ditampung? (bulatkan ke bawah)`, Math.floor((l * w * h) / 1000), `Volume ${l} × ${w} × ${h} = ${fmt(l * w * h)} cm³ = ${dec((l * w * h) / 1000)} liter. Dibulatkan ke bawah: <b>${Math.floor((l * w * h) / 1000)}</b> liter.`, { meta: { kind: 'unit' } }); } },
      ],
    },
    {
      id: '5M', grade: 5, name: 'Segitiga dan sudut', icon: '🔺', color: '#ffeaa7',
      sg: '5B · Area of Triangle; Angles; Properties of Triangles', ixl: 'PP, QQ, RR, SS, TT', km: 'Pengukuran; Geometri',
      tip: 'Gunting persegi panjang secara diagonal: dua segitiga sama besar. Itu sebabnya luas segitiga = alas × tinggi ÷ 2.',
      skills: [
        { id: '5M1', name: 'Luas segitiga', gen() { const a = r(2, 12) * 2, t = r(3, 15); return inp('Berapa cm² luas segitiga ini?', (a * t) / 2, `Luas = alas × tinggi ÷ 2 = ${a} × ${t} ÷ 2 = <b>${(a * t) / 2}</b> cm².`, { vis: U.triangle(a, t), meta: { alt: { [String(a * t)]: 'rumus-segitiga' } } }); } },
        { id: '5M2', name: 'Sudut dalam segitiga', gen() { const a = r(25, 90), b = r(20, 150 - a); return inp(`Dua sudut sebuah segitiga adalah ${a}° dan ${b}°. Berapa derajat sudut ketiga?`, 180 - a - b, `Jumlah sudut segitiga = 180°. 180 − ${a} − ${b} = <b>${180 - a - b}</b>°.`, { meta: { alt: { [String(360 - a - b)]: 'konsep' } } }); } },
        { id: '5M3', name: 'Sudut di sekitar titik dan pada garis lurus', gen() { if (Math.random() < 0.5) { const a = r(60, 150), b = r(40, 300 - a - 20); return inp(`Tiga sudut mengelilingi satu titik. Dua di antaranya ${a}° dan ${b}°. Berapa derajat sudut ketiga?`, 360 - a - b, `Sudut di sekitar titik berjumlah 360°. 360 − ${a} − ${b} = <b>${360 - a - b}</b>°.`); } const k = r(20, 160); return inp('Kedua sudut berada pada garis lurus. Berapa derajat sudut yang ditanya?', 180 - k, `Jumlahnya 180°: 180 − ${k} = <b>${180 - k}</b>°.`, { vis: U.straight(k, 180) }); } },
      ],
    },
    {
      id: '5N', grade: 5, name: 'Rata-rata dan diagram', icon: '📊', color: '#00b894',
      sg: '5B · Average; Line Graphs', ixl: 'NN, OO', km: 'Analisis Data dan Peluang',
      tip: 'Hitung rata-rata uang saku seminggu: jumlahkan semuanya, lalu bagi 7.',
      skills: [
        { id: '5N1', name: 'Menghitung rata-rata', gen() { const n = r(3, 6), avg = r(5, 90); let xs = range(1, n).map(() => avg + r(-10, 10)); const diff = avg * n - xs.reduce((a, b) => a + b, 0); xs[0] += diff; if (xs.some((x) => x < 0)) return C.SKILLS['5N1'].gen(); return inp(`Berapa rata-rata dari ${xs.join(', ')}?`, avg, `Jumlah = ${xs.join(' + ')} = ${avg * n}. Rata-rata = ${avg * n} ÷ ${n} = <b>${avg}</b>.`, { meta: { alt: { [String(avg * n)]: 'konsep' } } }); } },
        { id: '5N2', name: 'Jumlah dari rata-rata', gen() { const n = r(3, 8), avg = r(60, 95); const [n1] = two(); if (Math.random() < 0.5) return inp(`Rata-rata nilai ${n} ulangan ${n1} adalah ${avg}. Berapa jumlah semua nilainya?`, n * avg, `Jumlah = rata-rata × banyak data = ${avg} × ${n} = <b>${n * avg}</b>.`); const last = r(50, 100), tot = avg * n; const prev = tot - last; if (prev % (n - 1) !== 0) return C.SKILLS['5N2'].gen(); return inp(`Rata-rata ${n - 1} ulangan ${n1} adalah ${prev / (n - 1)}. Setelah ulangan berikutnya, rata-ratanya menjadi ${avg}. Berapa nilai ulangan terakhir?`, last, `Jumlah lama = ${prev / (n - 1)} × ${n - 1} = ${prev}. Jumlah baru = ${avg} × ${n} = ${tot}. Nilai terakhir = ${tot} − ${prev} = <b>${last}</b>.`); } },
        { id: '5N3', name: 'Membaca diagram garis', gen() { const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum']; const v = days.map(() => r(20, 38)); const i = r(0, 3); return inp(`Berapa derajat Celsius kenaikan atau penurunan suhu dari hari ${days[i]} ke ${days[i + 1]}?`, Math.abs(v[i + 1] - v[i]), `${days[i]}: ${v[i]}°C, ${days[i + 1]}: ${v[i + 1]}°C. Selisihnya <b>${Math.abs(v[i + 1] - v[i])}</b>°C.`, { vis: U.lineGraph('Suhu Siang Hari (°C)', days.map((d, k) => [d, v[k]]), 40, 5) }); } },
      ],
    },
    {
      id: '5O', grade: 5, name: 'Satuan, waktu, dan uang', icon: '⏱️', color: '#fab1a0',
      sg: '5A/5B · Measures (decimals), Rate', ixl: 'HH, II, JJ, VV', km: 'Pengukuran',
      tip: 'Latih konversi dengan belanja: 1,5 kg bawang = 1.500 g; 750 mL minyak = 0,75 L.',
      skills: [
        { id: '5O1', name: 'Mengubah satuan dengan desimal', gen() { const [big, small, f] = pick([['kg', 'g', 1000], ['km', 'm', 1000], ['L', 'mL', 1000], ['m', 'cm', 100]]); if (Math.random() < 0.5) { const x = r(11, 999) / 100; return inp(`${dec(x)} ${big} = ? ${small}`, Math.round(x * f), `1 ${big} = ${fmt(f)} ${small}. ${dec(x)} × ${fmt(f)} = <b>${fmt(Math.round(x * f))}</b> ${small}.`, { meta: { kind: 'unit' } }); } const n = r(1, f * 9); return inp(`${fmt(n)} ${small} = ? ${big}`, dec(n / f), `Bagi dengan ${fmt(f)}: ${fmt(n)} ÷ ${fmt(f)} = <b>${dec(n / f)}</b> ${big}.`, { keys: [','], meta: { kind: 'unit' } }); } },
        { id: '5O2', name: 'Laju: harga dan jumlah per satuan', gen() { const p = r(3, 20) * 1000, n = r(3, 12), m = r(2, 15); return inp(`${n} kg beras harganya ${rp(p * n)}. Berapa harga ${m} kg beras? (tulis angkanya saja)`, p * m, `Harga 1 kg = ${rp(p * n)} ÷ ${n} = ${rp(p)}. Harga ${m} kg = ${m} × ${rp(p)} = <b>${rp(p * m)}</b>.`, { unit: 'Rp' }); } },
        { id: '5O3', name: 'Hari, jam, dan menit', gen() { if (Math.random() < 0.5) { const d = r(1, 5), h = r(1, 23); return inp(`${d} hari ${h} jam = ? jam`, d * 24 + h, `1 hari = 24 jam: ${d} × 24 + ${h} = <b>${d * 24 + h}</b> jam.`, { meta: { kind: 'unit' } }); } const s = r(7, 15) * 60 + r(0, 11) * 5, d = r(25, 300), e = s + d; return inp(`Pukul ${String(Math.floor(s / 60)).padStart(2, '0')}.${String(s % 60).padStart(2, '0')} ditambah ${d} menit. Pukul berapa? (tulis jamnya saja, jam 24)`, Math.floor(e / 60), `${d} menit = ${Math.floor(d / 60)} jam ${d % 60} menit. Hasilnya pukul ${String(Math.floor(e / 60)).padStart(2, '0')}.${String(e % 60).padStart(2, '0')}, jadi jamnya <b>${Math.floor(e / 60)}</b>.`); } },
      ],
    },
  ];

  C.register(UNITS);
  C.GRADES.push({ id: 5, name: 'Kelas 5', ixl: 'https://www.ixl.com/math/grade-5', sg: 'Primary Mathematics / Dimensions Math 5A dan 5B' });
})();
