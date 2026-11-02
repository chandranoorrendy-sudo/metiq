/* Metiq — permainan matematika: Kilat (cepat tepat), Balon (pecahkan yang sesuai aturan), Pasangan (kartu memori),
 * Menara (balok jatuh), Garis Bilangan (geser penunjuk), Juring Pecahan (ketuk bagian), Jam Ajaib (putar jarum jam),
 * dan Ayo Belanja (bayar pas dan kembalian). Permainan 10 soal "pilih dulu lalu Periksa" memakai playRound().
 * Beberapa permainan untuk setiap kelas. Setiap ronde memberi 1–3 bintang sesuai poin.
 */
(function () {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // angka gaya Indonesia: koma desimal, tanda minus asli
  const f = (n) => { const r = Math.round(n * 1000) / 1000; return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ','); };
  const neg = (n) => (n < 0 ? `(${f(n)})` : f(n));
  const fr = (a, b) => `<span class="gfr"><b>${a}</b><b>${b}</b></span>`;
  // pilihan ganda: jawaban benar + pengecoh yang dekat
  function opts(ans, near) {
    const set = new Set([ans]); let guard = 0;
    while (set.size < 4 && guard++ < 80) { const d = Math.round(near() * 1000) / 1000; if (d !== ans && d >= 0) set.add(d); }
    return shuffle([...set]).map(f);
  }
  const q = (text, ans, near) => ({ text, answer: f(ans), options: opts(ans, near) });

  /* ---------- Isi permainan per kelas ---------- */
  const GAMES = [
    // Kelas 1
    { id: '1a', grade: 1, type: 'kilat', icon: '⚡', name: 'Kilat Tambah Kurang', desc: 'Penjumlahan dan pengurangan sampai 20. Jawab secepat mungkin!', stars: [8, 14, 20],
      next() { if (Math.random() < 0.5) { const a = R(1, 15), b = R(1, 20 - a); return q(`${a} + ${b}`, a + b, () => a + b + pick([-2, -1, 1, 2, 3])); } const a = R(5, 20), b = R(1, a); return q(`${a} − ${b}`, a - b, () => a - b + pick([-2, -1, 1, 2])); } },
    { id: '1b', grade: 1, type: 'balon', icon: '🎈', name: 'Balon Pasangan Bilangan', desc: 'Pecahkan balon yang hasilnya sama dengan bilangan sasaran.', stars: [8, 14, 20],
      rule() { const t = R(5, 10); return { label: `Pecahkan balon yang hasilnya <b>${t}</b>`, make(ok) { if (ok) { const a = R(0, t); return `${a} + ${t - a}`; } let a, b; do { a = R(0, 9); b = R(0, 9); } while (a + b === t || Math.abs(a + b - t) > 3); return `${a} + ${b}`; } }; } },
    { id: '1c', grade: 1, type: 'pasangan', icon: '🃏', name: 'Pasangan Titik', desc: 'Cocokkan kumpulan titik dengan bilangannya.',
      pairs() { return shuffle([...Array(10)].map((_, i) => i + 1)).slice(0, 6).map((n) => [`<span class="gdots">${'●'.repeat(Math.min(n, 5))}${n > 5 ? '<br>' + '●'.repeat(n - 5) : ''}</span>`, String(n)]); } },
    // Kelas 2
    { id: '2a', grade: 2, type: 'kilat', icon: '⚡', name: 'Kilat Dua Angka', desc: 'Penjumlahan dan pengurangan bilangan dua angka.', stars: [6, 11, 16],
      next() { if (Math.random() < 0.5) { const a = R(10, 79), b = R(10, 99 - a); return q(`${a} + ${b}`, a + b, () => a + b + pick([-10, -1, 1, 10, 2])); } const a = R(30, 99), b = R(10, a - 5); return q(`${a} − ${b}`, a - b, () => a - b + pick([-10, -1, 1, 10, 2])); } },
    { id: '2b', grade: 2, type: 'balon', icon: '🎈', name: 'Balon Genap Ganjil', desc: 'Pecahkan bilangan genap atau ganjil sesuai perintah.', stars: [8, 14, 20],
      rule() { const ev = Math.random() < 0.5; return { label: `Pecahkan bilangan <b>${ev ? 'GENAP' : 'GANJIL'}</b>`, make(ok) { const n = R(1, 49) * 2 - (ok === ev ? 0 : 1); return String(n); } }; } },
    { id: '2c', grade: 2, type: 'pasangan', icon: '🃏', name: 'Pasangan Perkalian 2, 5, 10', desc: 'Cocokkan perkalian dengan hasilnya.',
      pairs() { const all = []; [2, 5, 10].forEach((a) => { for (let b = 1; b <= 10; b++) all.push([a, b]); }); const seen = new Set(), out = []; shuffle(all).forEach(([a, b]) => { if (out.length < 6 && !seen.has(a * b)) { seen.add(a * b); out.push([`${a} × ${b}`, String(a * b)]); } }); return out; } },
    // Kelas 3
    { id: '3a', grade: 3, type: 'kilat', icon: '⚡', name: 'Kilat Perkalian', desc: 'Fakta perkalian sampai 10 × 10.', stars: [7, 13, 19],
      next() { const a = R(2, 10), b = R(2, 10); return q(`${a} × ${b}`, a * b, () => pick([(a + 1) * b, (a - 1) * b, a * (b + 1), a * (b - 1), a * b + pick([-2, 2])])); } },
    { id: '3b', grade: 3, type: 'balon', icon: '🎈', name: 'Balon Kelipatan', desc: 'Pecahkan balon yang merupakan kelipatan bilangan sasaran.', stars: [7, 13, 19],
      rule() { const n = R(3, 9); return { label: `Pecahkan <b>kelipatan ${n}</b>`, make(ok) { if (ok) return String(n * R(1, 10)); let v; do { v = R(2, n * 10); } while (v % n === 0); return String(v); } }; } },
    { id: '3c', grade: 3, type: 'pasangan', icon: '🃏', name: 'Pasangan Pembagian', desc: 'Cocokkan pembagian dengan hasil baginya.',
      pairs() { return shuffle([...Array(9)].map((_, i) => i + 2)).slice(0, 6).map((h) => { const d = R(2, 9); return [`${h * d} : ${d}`, String(h)]; }); } },
    // Kelas 4
    { id: '4a', grade: 4, type: 'kilat', icon: '⚡', name: 'Kilat Kali Bagi', desc: 'Kali dan bagi 10, 100, serta perkalian dua angka dengan satu angka.', stars: [6, 11, 16],
      next() {
        const k = R(0, 2);
        if (k === 0) { const a = R(2, 99), m = pick([10, 100]); return q(`${a} × ${m}`, a * m, () => pick([a * m * 10, a * m / 10, a * m + m, a + m])); }
        if (k === 1) { const a = R(2, 99) * 10; return q(`${a} : 10`, a / 10, () => pick([a / 100, a, a / 10 + 1, a / 10 - 1, a / 10 + 10])); }
        const a = R(12, 49), b = R(2, 9); return q(`${a} × ${b}`, a * b, () => a * b + pick([-b, b, -10, 10, 1]));
      } },
    { id: '4b', grade: 4, type: 'balon', icon: '🎈', name: 'Balon Faktor dan Prima', desc: 'Pecahkan faktor dari sebuah bilangan, atau bilangan prima.', stars: [6, 11, 16],
      rule() {
        if (Math.random() < 0.5) {
          const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47], C = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 25, 27, 33, 35, 39, 45, 49];
          return { label: 'Pecahkan <b>bilangan prima</b>', make: (ok) => String(pick(ok ? P : C)) };
        }
        const n = pick([12, 16, 18, 20, 24, 30, 36]), fs = [...Array(n)].map((_, i) => i + 1).filter((d) => n % d === 0), not = [...Array(n)].map((_, i) => i + 1).filter((d) => n % d && d > 1);
        return { label: `Pecahkan <b>faktor dari ${n}</b>`, make: (ok) => String(pick(ok ? fs : not)) };
      } },
    { id: '4c', grade: 4, type: 'pasangan', icon: '🃏', name: 'Pasangan Pecahan Senilai', desc: 'Cocokkan pecahan yang nilainya sama.',
      pairs() { return shuffle([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6]]).slice(0, 6).map(([a, b]) => { const k = R(2, 4); return [fr(a, b), fr(a * k, b * k)]; }); } },
    // Kelas 5
    { id: '5a', grade: 5, type: 'kilat', icon: '⚡', name: 'Kilat Desimal', desc: 'Penjumlahan dan pengurangan bilangan desimal.', stars: [6, 11, 16],
      next() { const a = R(11, 99) / 10, b = R(11, 99) / 10; if (Math.random() < 0.5) return q(`${f(a)} + ${f(b)}`, a + b, () => a + b + pick([-1, -0.1, 0.1, 1, 0.2])); const [x, y] = a >= b ? [a, b] : [b, a]; return q(`${f(x)} − ${f(y)}`, x - y, () => x - y + pick([-1, -0.1, 0.1, 1, 0.2])); } },
    { id: '5b', grade: 5, type: 'balon', icon: '🎈', name: 'Balon Lebih Besar', desc: 'Pecahkan desimal yang lebih besar dari bilangan sasaran.', stars: [7, 13, 19],
      rule() { const x = pick([0.5, 1, 1.5, 2, 0.25, 0.75]); return { label: `Pecahkan bilangan <b>lebih besar dari ${f(x)}</b>`, make(ok) {
        const d = pick([R(1, 9) / 10, R(1, 9) / 100, R(1, 4) / 10 + R(1, 9) / 100]);
        // pengecoh: lebih kecil, atau tepat sama dengan sasaran (sama besar bukan "lebih besar")
        return f(ok ? x + d : Math.random() < 0.15 ? x : Math.max(0.01, Math.round((x - d) * 100) / 100));
      } }; } },
    { id: '5c', grade: 5, type: 'pasangan', icon: '🃏', name: 'Pasangan Pecahan Desimal', desc: 'Cocokkan pecahan dengan bentuk desimalnya.',
      pairs() { return shuffle([[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [2, 5, 0.4], [3, 5, 0.6], [4, 5, 0.8], [1, 10, 0.1], [3, 10, 0.3], [7, 10, 0.7], [1, 8, 0.125]]).slice(0, 6).map(([a, b, d]) => [fr(a, b), f(d)]); } },
    // Kelas 6
    { id: '6a', grade: 6, type: 'kilat', icon: '⚡', name: 'Kilat Operasi Campuran', desc: 'Kali dan bagi dikerjakan lebih dulu daripada tambah dan kurang.', stars: [5, 10, 15],
      next() {
        const a = R(2, 9), b = R(2, 9), c = R(2, 9), k = R(0, 2);
        if (k === 0) return q(`${a} + ${b} × ${c}`, a + b * c, () => pick([(a + b) * c, a + b * c + pick([-1, 1, c]), a * b + c]));
        if (k === 1) return q(`(${a} + ${b}) × ${c}`, (a + b) * c, () => pick([a + b * c, (a + b) * c + pick([-c, c, 1])]));
        const d = R(2, Math.min(9, a * b - 1)); // hasil tetap positif
        return q(`${a} × ${b} − ${d}`, a * b - d, () => pick([a * (b - d), a * b - d + pick([-1, 1, 2]), a * b + d]));
      } },
    { id: '6b', grade: 6, type: 'balon', icon: '🎈', name: 'Balon Bilangan Bulat', desc: 'Pecahkan penjumlahan bilangan bulat yang hasilnya negatif atau positif.', stars: [6, 11, 16],
      rule() { const want = Math.random() < 0.5; return { label: `Pecahkan yang hasilnya <b>${want ? 'NEGATIF' : 'POSITIF'}</b>`, make(ok) { let a, b; do { a = R(-9, 9); b = R(-9, 9); } while (a + b === 0 || (a + b < 0) !== (ok === want)); return `${f(a)} + ${neg(b)}`; } }; } },
    { id: '6c', grade: 6, type: 'pasangan', icon: '🃏', name: 'Pasangan Persen', desc: 'Cocokkan persen dengan pecahannya.',
      pairs() { return shuffle([[50, 1, 2], [25, 1, 4], [75, 3, 4], [20, 1, 5], [10, 1, 10], [40, 2, 5], [60, 3, 5], [80, 4, 5], [30, 3, 10], [5, 1, 20], [12.5, 1, 8]]).slice(0, 6).map(([p, a, b]) => [`${f(p)}%`, fr(a, b)]); } },
  ];
  // Balok jatuh: "Menara Pasangan" (dua balok bersentuhan yang jumlahnya = sasaran hilang)
  // dan "Menara Kembar" (balok sama bergabung menjadi dua kali lipat). Nilai disimpan sebagai bilangan bulat.
  const range = (a, b, s = 1) => { const r = []; for (let v = a; v <= b; v += s) r.push(v); return r; };
  [
    [1, 10, range(1, 9), (v) => String(v), 'Sepuluh'],
    [2, 20, range(2, 18), (v) => String(v), 'Dua Puluh'],
    [3, 100, [...range(10, 90, 10), 25, 75], (v) => String(v), 'Seratus'],
    [4, 1000, [...range(100, 900, 100), 250, 750], (v) => v.toLocaleString('id-ID'), 'Seribu'],
    [5, 100, [...range(10, 90, 10), 25, 75, 5, 95], (v) => f(v / 100), 'Satu'],
    [6, 0, [...range(-9, -1), ...range(1, 9)], (v) => f(v), 'Nol'],
  ].forEach(([grade, target, vals, show, word]) => {
    GAMES.push({ id: grade + 'd', grade, type: 'susun', icon: '🧱', name: `Menara Pasangan ${word}`, target, vals, show, stars: [10, 20, 30],
      desc: `Jatuhkan balok ke menara. Dua balok bersentuhan yang jumlahnya ${show(target)} akan hilang. Jangan sampai menara penuh!` });
    // poin = 10 × (berapa kali 2 dilipatgandakan untuk mencapai balok terbesar): 64 = 50, 128 = 60, 256 = 70
    GAMES.push({ id: grade + 'e', grade, type: 'kembar', icon: '🔢', name: 'Menara Kembar', drops: grade <= 2 ? [2, 2, 2, 4, 4, 8] : [2, 2, 4, 4, 8, 16], show: (v) => v.toLocaleString('id-ID'),
      stars: grade <= 2 ? [40, 50, 60] : [50, 60, 70],
      desc: `Balok terus jatuh. Arahkan ke balok yang sama agar menyatu menjadi dua kali lipat (${grade <= 2 ? '4 + 4 = 8' : '16 + 16 = 32'}). Jangan sampai menara melewati batas! Target ⭐⭐⭐: ${grade <= 2 ? 128 : 256}.` });
  });
  /* ---------- Garis bilangan: geser penunjuk ke jawaban (mulai dari 0) ---------- */
  // Soal = teks kiri dan kanan kotak jawaban, jawaban, dan garisnya (min, max, langkah, label tiap berapa garis).
  const fmt = (n) => (Math.abs(n) >= 1000 ? (n < 0 ? '−' : '') + Math.abs(n).toLocaleString('id-ID') : f(n));
  const line = (l, r, ans, min, max, step, lab) => ({ l, r, ans, min, max, step, lab });
  const GARIS = {
    1() { const k = R(0, 2);
      if (k === 0) { const a = R(0, 9), b = R(1, 10 - a); return line(`${a} + ${b} =`, '', a + b, 0, 10, 1, 2); }
      if (k === 1) { const a = R(2, 10), b = R(1, a); return line(`${a} − ${b} =`, '', a - b, 0, 10, 1, 2); }
      const a = R(1, 8), c = R(a + 1, 10); return line(`${a} +`, `= ${c}`, c - a, 0, 10, 1, 2); },
    2() { if (Math.random() < 0.6) { const s = pick([2, 5, 10]), j = R(0, 6); return line(`${[j, j + 1, j + 2].map((x) => x * s).join(', ')},`, '', (j + 3) * s, 0, 10 * s, s, 2); }
      const c = R(8, 20), b = R(2, c - 1); return line('', `+ ${b} = ${c}`, c - b, 0, 20, 1, 5); },
    3() { const a = R(0, 10), b = R(2, 9); return Math.random() < 0.5 ? line('', `× ${b} = ${a * b}`, a, 0, 10, 1, 2) : line(`${a * b} : ${b} =`, '', a, 0, 10, 1, 2); },
    4() { const k = R(0, 2);
      if (k === 0) { const a = R(1, 8), b = R(1, 10 - a); return line(`${a * 100} + ${b * 100} =`, '', (a + b) * 100, 0, 1000, 100, 2); }
      if (k === 1) { const a = R(1, 10); return line(`${a} × 100 =`, '', a * 100, 0, 1000, 100, 2); }
      const b = R(1, 5), c = R(b + 1, 10); return line('', `− ${b * 100} = ${(c - b) * 100}`, c * 100, 0, 1000, 100, 2); },
    5() { const k = R(0, 2);
      if (k === 0) { const a = R(1, 8), b = R(1, 10 - a); return line(`${f(a / 10)} + ${f(b / 10)} =`, '', (a + b) / 10, 0, 1, 0.1, 5); }
      if (k === 1) { const [a, b] = pick([[1, 2], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10]]); return line(`${fr(a, b)} =`, '', a / b, 0, 1, 0.1, 5); }
      const a = R(1, 9); return line(`1 − ${f(a / 10)} =`, '', (10 - a) / 10, 0, 1, 0.1, 5); },
    6() { const k = R(0, 2); let a, b;
      if (k === 0) { do { a = R(-9, 9); b = R(-9, 9); } while (Math.abs(a + b) > 10 || a * b >= 0); return line(`${f(a)} + ${neg(b)} =`, '', a + b, -10, 10, 1, 5); }
      if (k === 1) { do { a = R(-5, 9); b = R(2, 9); } while (Math.abs(a - b) > 10 || a - b >= 0); return line(`${f(a)} − ${b} =`, '', a - b, -10, 10, 1, 5); }
      do { a = R(-10, 10); b = R(-9, 9); } while (!b || Math.abs(a + b) > 10); return line('', `+ ${neg(b)} = ${f(a + b)}`, a, -10, 10, 1, 5); },
  };
  /* ---------- Juring pecahan: ketuk bagian sebanyak pecahan yang diminta (½ dari 14 juring = 7) ---------- */
  const shade = (a, b, k, lbl) => { const n = b * k; return { a, b, n, need: (n * a) / b, shape: n > 16 || Math.random() < 0.35 ? 'bar' : 'pie', lbl: lbl || fr(a, b) }; };
  const DEC = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10]];
  const kIn = (b, lo, hi) => R(Math.max(1, Math.ceil(lo / b)), Math.max(1, Math.floor(hi / b)));
  const JURING = {
    2() { const [a, b] = pick([[1, 2], [1, 2], [1, 4], [3, 4]]); return shade(a, b, kIn(b, 4, 8)); },
    3() { const b = pick([2, 3, 4, 5, 6, 8]), a = R(1, b - 1); return shade(a, b, kIn(b, b, 12)); },
    4() { const b = pick([2, 3, 4, 5, 6, 8]), a = R(1, b - 1); return shade(a, b, kIn(b, Math.max(8, 2 * b), 16)); },
    5() { const [a, b] = pick(DEC); return shade(a, b, kIn(b, 4, 20), f(a / b)); },
    6() { const [a, b] = pick(DEC); return shade(a, b, kIn(b, 4, 20), f((100 * a) / b) + '%'); },
  };
  /* ---------- Ayo Belanja: ketuk uang untuk membayar harga pas (kelas 3: kembalian) ---------- */
  // Nama pembeli dan barang mengikuti konteks kelas (C.setKonteks mengganti NAMA di tempat).
  const CUR = () => window.METIQ_CURRICULUM;
  const rp = (n) => CUR().rp(n);
  const WARUNG = { umum: [['🍞', 'roti'], ['🥛', 'susu'], ['🍌', 'pisang'], ['📒', 'buku tulis'], ['✏️', 'pensil'], ['🧃', 'jus'], ['🍪', 'kue'], ['🥚', 'telur']],
    islami: [['🌴', 'kurma'], ['📒', 'buku tulis'], ['✏️', 'pensil'], ['🥛', 'susu'], ['🍞', 'roti'], ['📿', 'tasbih'], ['🍯', 'madu'], ['🍌', 'pisang']] };
  const MONEY = { 1: [100, 200, 500, 1000, 'n2000', 'n5000'], 2: [500, 'n1000', 'n2000', 'n5000', 'n10000', 'n20000'] };
  MONEY[3] = MONEY[2];
  const shop = (price, pay, items) => {
    const it = items || [pick(WARUNG[CUR().konteks() === 'islami' ? 'islami' : 'umum'])];
    return { who: pick(CUR().kit.NAMA), items: it, price, pay, ans: pay ? pay - price : price };
  };
  const UANG = {
    1() { return shop(pick([300, 500, 700, 800, 1000, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 5000])); },
    2() { return shop(R(3, 60) * 500); },
    3() {
      if (Math.random() < 0.7) { const pay = pick([10000, 20000, 50000]); return shop(R(2, pay / 500 - 1) * 500, pay); }
      const [a, b] = shuffle(WARUNG[CUR().konteks() === 'islami' ? 'islami' : 'umum'].slice()), pa = R(2, 20) * 500, pb = R(2, 20) * 500;
      return { ...shop(pa + pb, 0, [a, b]), each: [pa, pb] };
    },
  };
  /* ---------- Jam Ajaib: putar jarum jam sampai sesuai soal ---------- */
  // Waktu disimpan sebagai menit sejak pukul 12.00 (0–719); jam analog tidak membedakan pagi dan sore.
  const jamTxt = (h, m) => `pukul ${h}.${String(m).padStart(2, '0')}`;
  const clock = (ask, time, sub, H, m, step, start = 0) => ({ ask, time, sub, ans: ((H % 12) * 60 + m) % 720, step, start, right: jamTxt(H, m) });
  const JAM = {
    1() { const h = R(1, 12); if (Math.random() < 0.5) return clock('Atur jam ke', jamTxt(h, 0), '', h, 0, 30);
      return clock('Atur jam ke', jamTxt(h, 30), `setengah ${(h % 12) + 1}`, h, 30, 30); },
    2() { const h = R(1, 12), m = R(1, 11) * 5; return clock('Atur jam ke', jamTxt(h, m), '', h, m, 5); },
    3() { const h = R(1, 12);
      if (Math.random() < 0.5) { let m = R(1, 59); if (m % 5 === 0) m++; return clock('Atur jam ke', jamTxt(h, m), '', h, m, 1); }
      const d = pick([5, 10, 15, 20, 25]), p = h === 1 ? 12 : h - 1; // "10 menit lagi pukul 6" = pukul 5.50
      return clock('Atur jam ke', `${d} menit lagi pukul ${h}`, '', p, 60 - d, 1); },
    4() { if (Math.random() < 0.4) { const H = R(13, 23), m = R(0, 11) * 5; return { ...clock('Atur jam ke', jamTxt(H, m), H < 15 ? 'siang' : H < 18 ? 'sore' : 'malam', H, m, 5), right: `${jamTxt(H, m)} (${jamTxt(H - 12, m)})` }; }
      const s = R(6, 15) * 60 + R(0, 11) * 5, d = R(3, 20) * 5, e = s + d, H = Math.floor(e / 60), m = e % 60;
      const lama = d >= 60 ? `${Math.floor(d / 60)} jam${d % 60 ? ` ${d % 60} menit` : ''}` : `${d} menit`;
      return { ...clock(`Mulai ${jamTxt(Math.floor(s / 60), s % 60)}, lamanya ${lama}.`, 'Kapan selesai?', '', H, m, 5, s % 720), right: jamTxt(H, m) }; },
  };
  for (let gr = 1; gr <= 6; gr++) {
    GAMES.push({ id: gr + 'f', grade: gr, type: 'garis', icon: '📏', name: 'Garis Bilangan', isNew: true, stars: [6, 8, 10], next: GARIS[gr],
      desc: 'Geser penunjuk di garis bilangan ke jawaban yang tepat. 10 soal, tanpa batas waktu.' });
    if (JURING[gr]) GAMES.push({ id: gr + 'g', grade: gr, type: 'juring', icon: '🍕', name: gr >= 5 ? 'Warnai Bagian' : 'Juring Pecahan', isNew: true, stars: [6, 8, 10], next: JURING[gr],
      desc: gr >= 6 ? 'Ketuk bagian sebanyak persen yang diminta. 25% dari 8 bagian = 2 bagian.' : gr === 5 ? 'Ketuk bagian sebanyak desimal yang diminta. 0,5 dari 10 bagian = 5 bagian.' : 'Ketuk juring sebanyak pecahan yang diminta. ½ dari 14 juring = 7 juring.' });
  }
  for (let gr = 1; gr <= 4; gr++) GAMES.push({ id: gr + 'h', grade: gr, type: 'jam', icon: '🕒', name: 'Jam Ajaib', isNew: true, stars: [6, 8, 10], next: JAM[gr],
    desc: gr === 1 ? 'Putar jarum panjang sampai jam menunjukkan waktu di soal. Jam tepat dan setengah.' : gr === 4 ? 'Putar jarum jam untuk waktu 24 jam dan saat kegiatan selesai.' : `Putar jarum panjang sampai jam menunjukkan waktu di soal, per ${gr === 2 ? '5 menit' : 'menit'}.` });
  for (let gr = 1; gr <= 3; gr++) GAMES.push({ id: gr + 'i', grade: gr, type: 'uang', icon: '🪙', name: 'Ayo Belanja', isNew: true, stars: [6, 8, 10], next: UANG[gr],
    desc: gr === 3 ? 'Ketuk uang untuk membayar dengan pas, atau untuk memberi kembalian yang tepat.' : 'Ketuk koin dan uang kertas sampai jumlahnya sama dengan harga barang.' });
  GAMES.forEach((g) => { if (g.type === 'pasangan') g.stars = [10, 14, 17]; });
  const TYPES = { kilat: 'Cepat tepat · 60 detik', balon: 'Pecahkan balon · 60 detik', pasangan: 'Kartu memori', susun: 'Balok jatuh · jumlah sasaran', kembar: 'Balok jatuh · gabung kembar', garis: 'Geser di garis · 10 soal', juring: 'Ketuk bagian · 10 soal', jam: 'Putar jarum · 10 soal', uang: 'Bayar pas · 10 soal' };
  // Cara main dalam gambar: ikon + dua-tiga kata
  const HOW = {
    kilat: () => [['👀', 'Lihat soal'], ['👆', 'Ketuk jawaban'], ['⏱️', '60 detik']],
    balon: () => [['📢', 'Baca perintah'], ['🎈', 'Pecahkan yang cocok'], ['💥', 'Salah: −1']],
    pasangan: () => [['🃏', 'Buka 2 kartu'], ['🔗', 'Cari pasangannya'], ['🧠', 'Ingat letaknya']],
    susun: (g) => [['👆', 'Ketuk kolom'], ['✨', `Jumlah ${g.show(g.target)} hilang`], ['🧱', 'Jangan penuh']],
    kembar: () => [['◀▶', 'Geser balok'], ['🟰', 'Sama: menyatu'], ['🚧', 'Jangan lewati batas']],
    garis: () => [['👀', 'Lihat soal'], ['👉', 'Geser penunjuk'], ['✅', 'Periksa']],
    juring: () => [['🍕', 'Lihat pecahan'], ['👆', 'Ketuk bagian'], ['✅', 'Periksa']],
    jam: () => [['👀', 'Baca waktunya'], ['🕒', 'Putar jarum'], ['✅', 'Periksa']],
    uang: (g) => [['🏷️', 'Lihat harga'], ['🪙', g.grade >= 3 ? 'Bayar atau beri kembalian' : 'Ketuk uangnya'], ['✅', 'Periksa']],
  };
  // Warna dan ilustrasi tiap jenis permainan (SVG, 120 × 90)
  const LOOK = { kilat: ['#ffb020', '#fff4d6'], balon: ['#ff6b81', '#ffe8ec'], pasangan: ['#8e7cc3', '#efeaff'], susun: ['#1c9be8', '#e3f3ff'], kembar: ['#19b796', '#e6fffa'], garis: ['#58cc02', '#eaffd6'], juring: ['#ff8a00', '#fff0e0'], jam: ['#0ea5e9', '#e0f6ff'], uang: ['#16a34a', '#e7f8ec'] };
  const blk = (x, y, c, t) => `<rect x="${x}" y="${y}" width="26" height="22" rx="6" fill="${c}" stroke="#fff" stroke-width="2"/><text x="${x + 13}" y="${y + 16}" text-anchor="middle" font-size="13" font-weight="900" fill="#04382e">${t}</text>`;
  const ART = {
    kilat: '<circle cx="60" cy="45" r="34" fill="#ffe08a"/><path d="M68 10 40 50h17l-7 30 32-42H64z" fill="#ffc800" stroke="#e08a00" stroke-width="3" stroke-linejoin="round"/><circle cx="22" cy="20" r="4" fill="#ffb020"/><circle cx="100" cy="70" r="5" fill="#ffb020"/><circle cx="98" cy="18" r="3" fill="#ffb020"/>',
    balon: '<path d="M38 52q-2 14 6 30M62 46q2 16-2 36M86 54q-4 12 0 28" stroke="#9aa7a4" stroke-width="2" fill="none"/><ellipse cx="38" cy="36" rx="16" ry="19" fill="#ff6b81"/><ellipse cx="62" cy="28" rx="16" ry="19" fill="#4d96ff"/><ellipse cx="86" cy="38" rx="16" ry="19" fill="#ffc800"/><ellipse cx="33" cy="29" rx="4" ry="6" fill="#fff" opacity=".5"/><ellipse cx="57" cy="21" rx="4" ry="6" fill="#fff" opacity=".5"/><ellipse cx="81" cy="31" rx="4" ry="6" fill="#fff" opacity=".5"/>',
    pasangan: '<g transform="rotate(-12 44 46)"><rect x="22" y="16" width="42" height="58" rx="9" fill="#8e7cc3"/><text x="43" y="55" text-anchor="middle" font-size="28" font-weight="900" fill="#fff">?</text></g><g transform="rotate(10 78 46)"><rect x="56" y="16" width="42" height="58" rx="9" fill="#fff" stroke="#8e7cc3" stroke-width="3"/><text x="77" y="54" text-anchor="middle" font-size="22" font-weight="900" fill="#8e7cc3">3+4</text></g>',
    susun: blk(34, 62, '#9fd8ff', 3) + blk(60, 62, '#ffd1dc', 7) + blk(60, 38, '#c9f7c1', 5) + blk(86, 62, '#ffe6a6', 2) + '<path d="M47 30v18" stroke="#1c9be8" stroke-width="3" stroke-dasharray="4 4"/>' + blk(34, 6, '#ffe6a6', 5),
    kembar: blk(20, 50, '#a8f0de', 2) + blk(48, 50, '#a8f0de', 2) + '<path d="M78 61h10" stroke="#19b796" stroke-width="4" stroke-linecap="round"/><path d="M85 55l6 6-6 6" stroke="#19b796" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' + '<rect x="92" y="44" width="24" height="34" rx="7" fill="#7be3c6" stroke="#fff" stroke-width="2"/><text x="104" y="67" text-anchor="middle" font-size="15" font-weight="900" fill="#04382e">4</text>',
    garis: '<path d="M10 40h100" stroke="#a5e070" stroke-width="5" stroke-linecap="round"/>' + [10, 35, 60, 85, 110].map((x, i) => `<path d="M${x} 32v16" stroke="#a5e070" stroke-width="4" stroke-linecap="round"/><text x="${x}" y="24" text-anchor="middle" font-size="12" font-weight="900" fill="${i === 2 ? '#3a8c00' : '#8fd45c'}">${i * 3}</text>`).join('') + '<path d="M60 52l12 9v14H48V61z" fill="#58cc02" stroke-linejoin="round"/>',
    juring: '<circle cx="60" cy="45" r="36" fill="#ffe2bf" stroke="#fff" stroke-width="3"/>' + [0, 1, 2].map((i) => { const a0 = (-90 + i * 45) * Math.PI / 180, a1 = (-45 + i * 45) * Math.PI / 180; return `<path d="M60 45L${(60 + 36 * Math.cos(a0)).toFixed(1)} ${(45 + 36 * Math.sin(a0)).toFixed(1)}A36 36 0 0 1 ${(60 + 36 * Math.cos(a1)).toFixed(1)} ${(45 + 36 * Math.sin(a1)).toFixed(1)}Z" fill="#ff8a00" stroke="#fff" stroke-width="3"/>`; }).join('') + [3, 4, 5, 6, 7].map((i) => { const a = (-90 + i * 45) * Math.PI / 180; return `<path d="M60 45L${(60 + 36 * Math.cos(a)).toFixed(1)} ${(45 + 36 * Math.sin(a)).toFixed(1)}" stroke="#fff" stroke-width="3"/>`; }).join(''),
    jam: '<circle cx="60" cy="46" r="38" fill="#fff" stroke="#0ea5e9" stroke-width="6"/>' + [...Array(12)].map((_, i) => { const a = (i * 30) * Math.PI / 180; return `<circle cx="${(60 + 29 * Math.sin(a)).toFixed(1)}" cy="${(46 - 29 * Math.cos(a)).toFixed(1)}" r="${i % 3 ? 2 : 3.2}" fill="#7dd3fc"/>`; }).join('') + '<path d="M60 46V24" stroke="#0369a1" stroke-width="5" stroke-linecap="round"/><path d="M60 46l14 8" stroke="#0ea5e9" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="46" r="5" fill="#ffb020"/><path d="M98 14a44 44 0 0 1 8 18" stroke="#ffb020" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M101 33l5 3 2-6" stroke="#ffb020" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    uang: '<rect x="14" y="20" width="62" height="36" rx="6" fill="#a9d5a2" stroke="#5f9e57" stroke-width="3" transform="rotate(-8 45 38)"/><rect x="24" y="30" width="62" height="36" rx="6" fill="#d9b98a" stroke="#a9824c" stroke-width="3"/><text x="55" y="54" text-anchor="middle" font-size="14" font-weight="900" fill="#5a3d00">5.000</text><circle cx="90" cy="62" r="16" fill="#e8c45a" stroke="#c49a2a" stroke-width="3"/><text x="90" y="67" text-anchor="middle" font-size="11" font-weight="900" fill="#5a3d00">500</text><circle cx="98" cy="30" r="12" fill="#d7dade" stroke="#a6abb1" stroke-width="3"/><text x="98" y="34" text-anchor="middle" font-size="9" font-weight="900" fill="#444">100</text>',
  };
  const art = (type, size = 120) => `<svg class="gart" viewBox="0 0 120 90" width="${size}" height="${Math.round(size * 0.75)}" aria-hidden="true">${ART[type] || ''}</svg>`;
  const starsFor = (g, pts) => g.stars.filter((t) => pts >= t).length;

  /* ---------- Putaran 10 soal untuk garis bilangan dan juring: pilih dulu, lalu Periksa ---------- */
  const ROUND = 10;
  function playRound(el, g, { sfx, setPts, end }) {
    let n = 0, combo = 0, x = null, idx = 0, cnt = 0, sel = new Set(), done = false;
    el.innerHTML = '<div class="gr-head"><div class="mq-prog" id="grp"><i style="width:0%"></i></div></div><div class="mq-combo" id="grc"></div><div class="gr-stage" id="grs"></div><div class="mq-foot" id="grf"></div>';
    const stage = el.querySelector('#grs'), foot = el.querySelector('#grf');
    const val = (i) => Math.round((x.min + i * x.step) * 1000) / 1000;
    const ansIdx = () => Math.round((x.ans - x.min) / x.step);
    const pctOf = (i) => (i / cnt) * 100;
    const footCheck = (on) => {
      foot.className = 'mq-foot'; foot.innerHTML = `<div class="mq-foot-in"><button class="mq-btn" id="grgo" ${on ? '' : 'disabled'}>Periksa</button></div>`;
      foot.querySelector('#grgo').addEventListener('click', check);
    };
    // ---- garis bilangan
    const setIdx = (i) => {
      if (done) return;
      idx = Math.max(0, Math.min(cnt, i));
      const m = stage.querySelector('#glm'); m.style.left = pctOf(idx) + '%'; m.setAttribute('aria-valuenow', val(idx)); m.setAttribute('aria-valuetext', fmt(val(idx)));
      stage.querySelector('#grbox').textContent = fmt(val(idx));
      stage.querySelectorAll('.gl-t').forEach((t, k) => t.classList.toggle('on', k === idx));
    };
    const showLine = () => {
      cnt = Math.round((x.max - x.min) / x.step);
      stage.innerHTML = `<div class="gr-q">${x.l ? `<span>${x.l}</span>` : ''}<span class="gr-box" id="grbox"></span>${x.r ? `<span>${x.r}</span>` : ''}</div>
        <div class="gl" id="gl"><div class="gl-track">${[...Array(cnt + 1)].map((_, i) => `<i class="gl-t ${i % x.lab === 0 || i === cnt ? 'big' : ''}" style="left:${pctOf(i)}%"><b>${fmt(val(i))}</b></i>`).join('')}
          <button class="gl-mark" id="glm" role="slider" aria-label="Penunjuk" aria-valuemin="${x.min}" aria-valuemax="${x.max}"><svg viewBox="0 0 60 64"><path d="M30 4 56 24v32a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V24z"/></svg></button></div></div>
        <div class="gl-nudge"><button data-d="-1" aria-label="Geser ke kiri">◀</button><button data-d="1" aria-label="Geser ke kanan">▶</button></div>`;
      const gl = stage.querySelector('#gl'), track = gl.querySelector('.gl-track');
      let drag = false;
      const at = (e) => { const r = track.getBoundingClientRect(); setIdx(Math.round(((e.clientX - r.left) / r.width) * cnt)); };
      gl.addEventListener('pointerdown', (e) => { if (done) return; drag = true; gl.setPointerCapture(e.pointerId); at(e); });
      gl.addEventListener('pointermove', (e) => { if (drag) at(e); });
      gl.addEventListener('pointerup', () => { drag = false; });
      gl.addEventListener('pointercancel', () => { drag = false; });
      stage.querySelector('#glm').addEventListener('keydown', (e) => { const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key]; if (d) { e.preventDefault(); setIdx(idx + d); } });
      stage.querySelector('.gl-nudge').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) setIdx(idx + +b.dataset.d); });
      setIdx(x.min <= 0 && x.max >= 0 ? Math.round(-x.min / x.step) : 0); // mulai dari 0
      footCheck(true);
    };
    // ---- juring / bagian
    const showShade = () => {
      sel = new Set();
      let shape;
      if (x.shape === 'pie') {
        const P = (deg) => { const a = (deg * Math.PI) / 180; return `${(92 * Math.cos(a)).toFixed(2)} ${(92 * Math.sin(a)).toFixed(2)}`; };
        shape = `<svg class="jr jr-pie" viewBox="-100 -100 200 200">${[...Array(x.n)].map((_, i) => `<path class="jr-p" data-i="${i}" d="M0 0L${P(-90 + (i * 360) / x.n)}A92 92 0 0 1 ${P(-90 + ((i + 1) * 360) / x.n)}Z"/>`).join('')}</svg>`;
      } else {
        const rows = x.n > 10 && x.n % 2 === 0 ? 2 : 1, cols = x.n / rows, w = 300 / cols;
        shape = `<svg class="jr jr-bar" viewBox="-4 -4 308 ${rows * 64 + 8}">${[...Array(x.n)].map((_, i) => `<rect class="jr-p" data-i="${i}" x="${(i % cols) * w}" y="${Math.floor(i / cols) * 64}" width="${w}" height="64" rx="6"/>`).join('')}</svg>`;
      }
      stage.innerHTML = `<div class="gr-q jr-q"><span class="jr-ask">Warnai</span><span class="jr-frac">${x.lbl}</span></div>
        <div class="jr-wrap">${shape}</div><div class="jr-count"><b id="jrc">0</b> / ${x.n}</div>`;
      stage.querySelector('.jr').addEventListener('click', (e) => {
        const p = e.target.closest('.jr-p'); if (!p || done) return;
        const i = +p.dataset.i; if (sel.has(i)) sel.delete(i); else sel.add(i);
        p.classList.toggle('on', sel.has(i)); stage.querySelector('#jrc').textContent = sel.size;
        foot.querySelector('#grgo').disabled = !sel.size;
      });
      footCheck(false);
    };
    // ---- jam analog: jarum panjang diputar (geser atau tombol), jarum pendek ikut bergerak
    let tm = 0;
    const hands = (t, cls) => `<g class="${cls}"><line class="jm-h" x1="0" y1="0" x2="0" y2="-46" transform="rotate(${(t / 720) * 360})"/><g transform="rotate(${(t % 60) * 6})"><line class="jm-m" x1="0" y1="0" x2="0" y2="-74"/><circle class="jm-knob" cx="0" cy="-74" r="9"/></g></g>`;
    const setTm = (t) => {
      if (done) return;
      tm = ((t % 720) + 720) % 720;
      stage.querySelector('#jmh').innerHTML = hands(tm, 'jm-now');
      const b = stage.querySelector('#jmf'); b.setAttribute('aria-valuenow', tm); b.setAttribute('aria-valuetext', jamTxt(Math.floor(tm / 60) || 12, tm % 60));
    };
    const showClock = () => {
      stage.innerHTML = `<div class="jm-q"><span class="jm-ask">${x.ask}</span><b class="jm-time">${x.time}</b>${x.sub ? `<small>${x.sub}</small>` : ''}</div>
        <button class="jm-face" id="jmf" role="slider" aria-label="Jam. Panah kiri dan kanan memutar jarum menit, atas dan bawah memutar satu jam" aria-valuemin="0" aria-valuemax="719">
          <svg viewBox="-110 -110 220 220" aria-hidden="true"><circle class="jm-rim" r="104"/>${[...Array(60)].map((_, i) => `<line class="jm-tk ${i % 5 ? '' : 'big'}" x1="0" y1="${i % 5 ? -92 : -88}" x2="0" y2="-98" transform="rotate(${i * 6})"/>`).join('')}
            ${[...Array(12)].map((_, i) => { const a = ((i + 1) * 30 * Math.PI) / 180; return `<text class="jm-n" x="${(74 * Math.sin(a)).toFixed(1)}" y="${(-74 * Math.cos(a) + 8).toFixed(1)}">${i + 1}</text>`; }).join('')}
            <g id="jma"></g><g id="jmh"></g><circle class="jm-pin" r="7"/></svg></button>
        <div class="jm-btns"><button data-d="-60" aria-label="Mundur satu jam">−1 jam</button><button data-d="-${x.step}" aria-label="Mundur ${x.step} menit">−${x.step}</button><button data-d="${x.step}" aria-label="Maju ${x.step} menit">+${x.step}</button><button data-d="60" aria-label="Maju satu jam">+1 jam</button></div>`;
      const face = stage.querySelector('#jmf');
      // menit mentah dari posisi jari; jarum melewati angka 12 menambah/mengurangi satu jam
      let drag = false, hr = 0, prev = 0;
      const raw = (e) => { const r = face.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2; return ((Math.atan2(dx, -dy) * 180) / Math.PI / 6 + 60) % 60; };
      const snap = (m) => Math.round(m / x.step) * x.step;
      face.addEventListener('pointerdown', (e) => { if (done) return; drag = true; face.setPointerCapture(e.pointerId); prev = raw(e); hr = Math.round((tm - snap(prev)) / 60); setTm(hr * 60 + snap(prev)); });
      face.addEventListener('pointermove', (e) => { if (!drag) return; const m = raw(e); if (prev > 45 && m < 15) hr++; else if (prev < 15 && m > 45) hr--; prev = m; setTm(hr * 60 + snap(m)); });
      face.addEventListener('pointerup', () => { drag = false; });
      face.addEventListener('pointercancel', () => { drag = false; });
      face.addEventListener('keydown', (e) => { const d = { ArrowLeft: -x.step, ArrowRight: x.step, ArrowDown: -60, ArrowUp: 60 }[e.key]; if (d) { e.preventDefault(); setTm(tm + d); } });
      stage.querySelector('.jm-btns').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) setTm(tm + +b.dataset.d); });
      setTm(x.start);
      footCheck(true);
    };
    // ---- warung: uang yang diketuk masuk ke nampan; ketuk uang di nampan (atau ⌫) untuk mengambilnya lagi
    let bag = [];
    const mval = (v) => (typeof v === 'string' ? +v.slice(1) : v);
    const mHTML = (v, cls, label) => (typeof v === 'string'
      ? `<button class="wu-m note n${mval(v)} ${cls}" aria-label="${label} ${rp(mval(v))}"><b>${mval(v).toLocaleString('id-ID')}</b><small>RUPIAH</small></button>`
      : `<button class="wu-m coin c${v} ${cls}" aria-label="${label} ${rp(v)}">${v}</button>`);
    const sumBag = () => bag.reduce((t, v) => t + mval(v), 0);
    const drawBag = () => {
      stage.querySelector('#wut').innerHTML = bag.length ? bag.map((v, i) => mHTML(v, '', 'Ambil lagi').replace('<button ', `<button data-i="${i}" `)).join('') : '<span class="wu-empty">Nampan masih kosong</span>';
      stage.querySelector('#wus').textContent = rp(sumBag());
      foot.querySelector('#grgo').disabled = !bag.length;
    };
    const showMoney = () => {
      bag = [];
      const pal = MONEY[g.grade];
      const tag = x.each ? x.items.map((it, i) => `<span class="wu-it"><span class="em">${it[0]}</span>${rp(x.each[i])}</span>`).join('<b class="wu-plus">+</b>')
        : `<span class="wu-it big"><span class="em">${x.items[0][0]}</span>${rp(x.price)}</span>`;
      stage.innerHTML = `<div class="wu-shop"><small>${x.who} membeli ${x.items.map((it) => it[1]).join(' dan ')}</small><div class="wu-tags">${tag}</div>
          ${x.pay ? `<div class="wu-pay">Dibayar <b>${rp(x.pay)}</b></div>` : ''}</div>
        <div class="wu-ask">${x.pay ? 'Ketuk uang kembaliannya' : 'Bayar dengan uang pas'}</div>
        <div class="wu-tray" id="wut" aria-live="polite"></div>
        <div class="wu-sum"><span>Jumlah</span><b id="wus">Rp0</b><button class="wu-del" id="wud" aria-label="Hapus uang terakhir">⌫</button></div>
        <div class="wu-pal">${pal.map((v, i) => mHTML(v, '', 'Tambah').replace('<button ', `<button data-p="${i}" `)).join('')}</div>`;
      stage.querySelector('.wu-pal').addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (!b || done || bag.length >= 30) return; bag.push(pal[+b.dataset.p]); drawBag(); });
      stage.querySelector('#wut').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b || done) return; bag.splice(+b.dataset.i, 1); drawBag(); });
      stage.querySelector('#wud').addEventListener('click', () => { if (done) return; bag.pop(); drawBag(); });
      footCheck(false); drawBag();
    };
    const SHOW = { garis: showLine, juring: showShade, jam: showClock, uang: showMoney };
    // memeriksa jawaban, memberi warna benar/salah, dan mengembalikan [benar?, teks jawaban yang benar]
    const JUDGE = {
      garis() {
        const ok = idx === ansIdx();
        stage.querySelector('#gl').classList.add(ok ? 'ok' : 'no');
        if (!ok) stage.querySelector('.gl-track').insertAdjacentHTML('beforeend', `<span class="gl-ans" style="left:${pctOf(ansIdx())}%"></span>`);
        stage.querySelector('#grbox').classList.add(ok ? 'ok' : 'no');
        return [ok, fmt(x.ans)];
      },
      juring() { const ok = sel.size === x.need; stage.querySelector('.jr').classList.add(ok ? 'ok' : 'no'); return [ok, `${x.need} dari ${x.n} bagian`]; },
      jam() {
        const ok = tm === x.ans;
        stage.querySelector('#jmf').classList.add(ok ? 'ok' : 'no');
        if (!ok) stage.querySelector('#jma').innerHTML = hands(x.ans, 'jm-ans');
        return [ok, x.right];
      },
      uang() {
        const ok = sumBag() === x.ans;
        stage.querySelector('#wut').classList.add(ok ? 'ok' : 'no');
        return [ok, x.pay ? `${rp(x.pay)} − ${rp(x.price)} = ${rp(x.ans)}` : x.each ? `${rp(x.each[0])} + ${rp(x.each[1])} = ${rp(x.ans)}` : rp(x.ans)];
      },
    };
    const nextQ = () => {
      if (n >= ROUND) return end();
      done = false; x = g.next();
      SHOW[g.type]();
    };
    function check() {
      if (done) return;
      const [ok, right] = JUDGE[g.type]();
      done = true;
      n++; el.querySelector('#grp i').style.width = (n / ROUND) * 100 + '%';
      if (ok) { combo++; setPts(1); sfx.correct(); } else { combo = 0; sfx.wrong(); }
      el.querySelector('#grp').classList.toggle('combo', combo >= 2);
      el.querySelector('#grc').textContent = combo >= 2 ? `KOMBO x${combo}` : '';
      const last = n >= ROUND;
      foot.className = 'mq-foot ' + (ok ? 'ok' : 'no');
      foot.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${ok ? '✓' : '✕'}</span>${ok ? pick(['Hebat!', 'Pintar!', 'Mantap!', 'Keren!']) : 'Belum tepat'}</div>${ok ? '' : `<div class="mq-fbody"><p>Jawaban: <b>${right}</b></p></div>`}<button class="mq-btn ${ok ? '' : 'bad'}" id="grnext">${last ? 'Selesai' : 'Lanjutkan'}</button></div>`;
      foot.querySelector('#grnext').addEventListener('click', nextQ);
      foot.querySelector('#grnext').focus();
    }
    nextQ();
  }

  /* ---------- Mesin permainan ---------- */
  const SEC = 60;
  function start(el, g, onEnd) {
    const sfx = window.SFX || { correct() {}, wrong() {} };
    let pts = 0, combo = 0, alive = true; const t0 = Date.now(); const timers = [];
    const later = (fn, ms) => { const id = setTimeout(() => { if (alive) fn(); }, ms); timers.push(id); return id; };
    const end = () => { if (!alive) return; alive = false; timers.forEach(clearTimeout); clearInterval(tick); onEnd({ points: pts, ms: Date.now() - t0 }); };
    const hud = (extra) => `<div class="ghud"><div><small>Poin</small><b id="gpts">0</b></div>${extra}</div>`;
    let tick = null;
    const clock = () => {
      const bar = el.querySelector('.gtime i'), lbl = el.querySelector('#gsec');
      tick = setInterval(() => { const left = Math.max(0, SEC - (Date.now() - t0) / 1000); if (bar) bar.style.width = (left / SEC) * 100 + '%'; if (lbl) lbl.textContent = Math.ceil(left); if (left <= 0) end(); }, 200);
    };
    const setPts = (d) => { pts = Math.max(0, pts + d); const b = el.querySelector('#gpts'); if (b) { b.textContent = pts; b.className = d > 0 ? 'up' : 'down'; } };

    if (['garis', 'juring', 'jam', 'uang'].includes(g.type)) {
      playRound(el, g, { sfx, setPts, end });
    } else if (g.type === 'kilat') {
      el.innerHTML = hud('<div><small>Kombo</small><b id="gcombo">–</b></div><div><small>Detik</small><b id="gsec">60</b></div>') + '<div class="gtime"><i></i></div><div class="gq" id="gq"></div><div class="gopts" id="gopts"></div>';
      const show = () => {
        const x = g.next();
        el.querySelector('#gq').innerHTML = x.text + ' = ?';
        const box = el.querySelector('#gopts');
        box.innerHTML = x.options.map((o) => `<button class="gopt">${o}</button>`).join('');
        box.querySelectorAll('.gopt').forEach((b) => b.addEventListener('click', () => {
          if (!alive || box.dataset.lock) return;
          if (b.textContent === x.answer) { combo++; setPts(1); sfx.correct(); b.classList.add('right'); }
          else { combo = 0; sfx.wrong(); b.classList.add('wrong'); box.querySelectorAll('.gopt').forEach((y) => { if (y.textContent === x.answer) y.classList.add('right'); }); }
          el.querySelector('#gcombo').textContent = combo >= 3 ? `🔥${combo}` : combo || '–';
          box.dataset.lock = '1'; later(() => { delete box.dataset.lock; show(); }, b.classList.contains('right') ? 250 : 700);
        }));
      };
      show(); clock();
    } else if (g.type === 'balon') {
      el.innerHTML = hud('<div><small>Detik</small><b id="gsec">60</b></div>') + '<div class="gtime"><i></i></div><div class="grule" id="grule"></div><div class="gfield" id="gfield"></div>';
      const field = el.querySelector('#gfield'), COLORS = ['#ff7a59', '#4d96ff', '#2ecc71', '#f9c74f', '#fd79a8', '#66ffdb', '#a0e7e5'];
      let rule, popped = 0, lastLane = -1;
      const newRule = () => { rule = g.rule(); popped = 0; const r = el.querySelector('#grule'); r.innerHTML = rule.label; r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash'); };
      const spawn = () => {
        if (!alive) return;
        const ok = Math.random() < 0.45, b = document.createElement('button');
        b.className = 'gballoon'; b.innerHTML = `<span>${rule.make(ok)}</span>`; b.dataset.ok = ok ? '1' : '';
        // jalur berbeda dari balon sebelumnya agar tidak bertumpuk
        const lanes = Math.max(2, Math.floor(field.clientWidth / 92)); let ln; do { ln = R(0, lanes - 1); } while (ln === lastLane); lastLane = ln;
        b.style.left = Math.round(ln * (field.clientWidth - 88) / (lanes - 1)) + 'px'; b.style.background = pick(COLORS); b.style.animationDuration = R(55, 80) / 10 + 's';
        b.addEventListener('animationend', () => b.remove());
        b.addEventListener('click', () => {
          if (!alive || b.classList.contains('pop')) return;
          if (b.dataset.ok) { setPts(1); sfx.correct(); b.classList.add('pop'); later(() => b.remove(), 250); if (++popped >= 5) { field.querySelectorAll('.gballoon:not(.pop)').forEach((x) => x.remove()); newRule(); } }
          else { setPts(-1); sfx.wrong(); b.classList.add('shake'); later(() => b.classList.remove('shake'), 400); }
        });
        field.appendChild(b);
        later(spawn, R(650, 1000));
      };
      newRule(); spawn(); clock();
    } else if (g.type === 'kembar') {
      // Balok jatuh terus dan makin cepat; pemain menggeser kolomnya. Balok sama yang bersentuhan menyatu menjadi dua kali lipat.
      // Baris paling atas adalah zona batas: jika tumpukan mencapainya, permainan selesai.
      const COLS = 5, ROWS = 8, LIMIT = ROWS - 1;
      const grid = [...Array(COLS)].map(() => []);
      let cur = null, next = pick(g.drops), top = 2, speed = 800, landed = 0, mark = new Set(), over = false;
      const color = (v) => { const k = Math.round(Math.log2(v)) - 1; return `hsl(${(165 + k * 37) % 360}, 80%, ${Math.max(55, 82 - k * 2)}%)`; };
      const levelPts = () => Math.min(100, 10 * Math.round(Math.log2(top / 2)));
      const spawnNext = () => {
        // kadang memberi angka yang sudah ada di menara agar ada peluang menyatu
        const have = grid.map((col) => col[col.length - 1]).filter((v) => v && v <= 32);
        return have.length && Math.random() < 0.3 ? pick(have) : pick(g.drops);
      };
      const merge = (lc, lr) => {
        for (;;) {
          let done = false;
          const cells = grid.flatMap((col, c) => col.map((v, r) => ({ c, r, v })));
          cells.sort((a, b) => (b.c === lc && b.r === lr) - (a.c === lc && a.r === lr));
          for (const s0 of cells) {
            const seen = new Set([s0.c + ':' + s0.r]), group = [s0], todo = [s0];
            while (todo.length) {
              const x = todo.pop();
              for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const c = x.c + dc, r = x.r + dr, k = c + ':' + r;
                if (!seen.has(k) && grid[c] && grid[c][r] === s0.v) { seen.add(k); const y = { c, r }; group.push(y); todo.push(y); }
              }
            }
            if (group.length < 2) continue;
            const keep = group.reduce((a, b) => (b.r < a.r || (b.r === a.r && b.c === lc) ? b : a));
            group.forEach((x) => { grid[x.c][x.r] = null; });
            grid[keep.c][keep.r] = s0.v * 2 ** (group.length - 1);
            top = Math.max(top, grid[keep.c][keep.r]);
            grid.forEach((col, c) => { grid[c] = col.filter((v) => v !== null); });
            mark = new Set([keep.c + ':' + grid[keep.c].indexOf(s0.v * 2 ** (group.length - 1))]);
            lc = keep.c; lr = grid[keep.c].length - 1; done = true; sfx.correct();
            break;
          }
          if (!done) break;
        }
        const lv = levelPts(); if (lv > pts) setPts(lv - pts);
      };
      const render = () => {
        const ghost = cur ? grid[cur.c].length : -1;
        el.querySelector('#gtower').innerHTML = grid.map((col, c) => `<div class="gcol" data-c="${c}">${[...Array(ROWS)].map((_, r) => {
          const v = col[r], fall = cur && cur.c === c && cur.r === r;
          if (fall) return `<i class="gblk fall" style="background:${color(cur.v)}">${g.show(cur.v)}</i>`;
          if (v !== undefined) return `<i class="gblk ${mark.has(c + ':' + r) ? 'merge' : ''}" style="background:${color(v)}">${g.show(v)}</i>`;
          return `<i class="gslot ${r === LIMIT ? 'glimit' : ''} ${cur && cur.c === c && r === ghost && ghost < cur.r ? 'gghost' : ''}"></i>`;
        }).join('')}</div>`).join('');
        const nx = el.querySelector('#gnext'); nx.textContent = g.show(next); nx.style.background = color(next);
        el.querySelector('#gaux').textContent = g.show(top);
      };
      const lose = () => {
        over = true; cur = null; sfx.wrong(); render();
        const msg = el.querySelector('#gmsg'); if (msg) msg.textContent = '🚧 Menara melewati batas!';
        el.querySelector('#gtower').classList.add('gover');
        later(end, 1200);
      };
      const land = () => {
        const c = cur.c; grid[c].push(cur.v); cur = null; mark = new Set();
        merge(c, grid[c].length - 1);
        // melewati batas: ada balok yang tertinggal di baris paling atas (zona batas)
        if (grid.some((col) => col.length > LIMIT)) return lose();
        landed++; speed = Math.max(260, Math.round(800 * 0.97 ** landed));
        spawn();
      };
      const spawn = () => {
        cur = { c: 2, r: LIMIT, v: next }; next = spawnNext();
        render(); later(fall, speed);
      };
      const fall = () => {
        if (!alive || over || !cur) return;
        if (cur.r - 1 >= grid[cur.c].length) { cur.r--; render(); later(fall, speed); } else land();
      };
      const shift = (d) => { if (!cur || over) return; const c = cur.c + d; if (c < 0 || c >= COLS || grid[c].length > cur.r) return; cur.c = c; render(); };
      const drop = () => { if (!cur || over) return; cur.r = grid[cur.c].length; land(); };
      el.innerHTML = `<div class="ghud"><div><small>Poin</small><b id="gpts">0</b></div><div><small>Terbesar</small><b id="gaux">2</b></div><div><small>Berikutnya</small><b id="gnext" class="gnext"></b></div></div>
        <p class="small muted center gtip" id="gmsg">Ketuk kolom untuk menggeser balok · ketuk lagi untuk menjatuhkan</p>
        <div class="gtower gk" id="gtower"></div>
        <div class="gctrl"><button aria-label="Geser kiri" data-k="l">◀</button><button aria-label="Jatuhkan" data-k="d">▼</button><button aria-label="Geser kanan" data-k="r">▶</button></div>
        <div class="row-btn"><button class="btn sm ghost" id="gquit">Selesai</button></div>`;
      el.querySelector('#gquit').addEventListener('click', end);
      el.querySelector('.gctrl').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (!b) return; ({ l: () => shift(-1), r: () => shift(1), d: drop })[b.dataset.k](); });
      el.querySelector('#gtower').addEventListener('click', (e) => {
        const col = e.target.closest('.gcol'); if (!col || !cur) return;
        const c = +col.dataset.c;
        if (c === cur.c) return drop();
        const d = c > cur.c ? 1 : -1; while (cur && cur.c !== c && grid[cur.c + d].length <= cur.r) cur.c += d;
        render();
      });
      const onKey = (e) => {
        if (!alive || !document.body.contains(el)) return document.removeEventListener('keydown', onKey);
        const k = { ArrowLeft: () => shift(-1), ArrowRight: () => shift(1), ArrowDown: drop, ' ': drop }[e.key];
        if (k) { e.preventDefault(); k(); }
      };
      document.addEventListener('keydown', onKey);
      spawn();
    } else if (g.type === 'susun' || g.type === 'kembar') {
      const COLS = 5, ROWS = 7, sum = g.type === 'susun';
      const grid = [...Array(COLS)].map(() => []); // grid[kolom][baris dari bawah]
      let next, top = 0, chain = 0, mark = new Set();
      const all = () => grid.flatMap((col, c) => col.map((v, r) => ({ c, r, v })));
      const spawn = () => {
        if (sum) {
          // sering memberi pasangan dari balok yang sudah ada agar selalu ada langkah yang bisa dibuat
          const have = all().filter((x) => g.vals.includes(g.target - x.v));
          return have.length && Math.random() < 0.5 ? g.target - pick(have).v : pick(g.vals);
        }
        const small = all().map((x) => x.v).filter((v) => v <= g.base[2] * 2);
        return small.length && Math.random() < 0.2 ? pick(small) : pick([g.base[0], g.base[0], g.base[1], g.base[1], g.base[2]]);
      };
      const color = (v) => {
        if (sum) { const i = g.vals.indexOf(v), n = g.vals.length; return `hsl(${Math.round((i / n) * 330)}, 85%, ${v < 0 ? 72 : 78}%)`; }
        const k = Math.round(Math.log2(v / g.base[0])); return `hsl(${(165 + k * 37) % 360}, 80%, ${Math.max(55, 82 - k * 2)}%)`;
      };
      const gravity = () => grid.forEach((col, c) => { grid[c] = col.filter((v) => v !== null); });
      // satu langkah penyelesaian; true jika ada yang hilang/bergabung
      const step = (lc, lr) => {
        if (sum) {
          for (const { c, r, v } of all()) {
            for (const [dc, dr] of [[1, 0], [0, 1]]) {
              const w = (grid[c + dc] || [])[r + dr];
              if (w !== undefined && w !== null && v + w === g.target) { grid[c][r] = null; grid[c + dc][r + dr] = null; chain++; setPts(chain); return true; }
            }
          }
          return false;
        }
        const cells = all();
        // utamakan kelompok yang memuat balok yang baru jatuh
        cells.sort((a, b) => (b.c === lc && b.r === lr) - (a.c === lc && a.r === lr));
        for (const s0 of cells) {
          const seen = new Set([s0.c + ':' + s0.r]), group = [s0], todo = [s0];
          while (todo.length) {
            const x = todo.pop();
            for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const c = x.c + dc, r = x.r + dr, k = c + ':' + r;
              if (!seen.has(k) && grid[c] && grid[c][r] === s0.v) { seen.add(k); const y = { c, r }; group.push(y); todo.push(y); }
            }
          }
          if (group.length < 2) continue;
          // balok gabungan tinggal di posisi paling bawah dari kelompok
          const keep = group.reduce((a, b) => (b.r < a.r || (b.r === a.r && b.c === s0.c) ? b : a));
          group.forEach((x) => { grid[x.c][x.r] = null; });
          grid[keep.c][keep.r] = s0.v * 2 ** (group.length - 1);
          top = Math.max(top, grid[keep.c][keep.r]); mark = new Set([keep.c + ':' + (keep.r)]);
          const lv = Math.min(100, 10 * Math.round(Math.log2(top / g.base[0]))); if (lv > pts) setPts(lv - pts);
          return true;
        }
        return false;
      };
      const render = (lc) => {
        el.querySelector('#gtower').innerHTML = grid.map((col, c) => `<div class="gcol" data-c="${c}">${[...Array(ROWS)].map((_, r) => {
          const v = col[r];
          return v === undefined ? '<i class="gslot"></i>' : `<i class="gblk ${c === lc && r === col.length - 1 ? 'new' : ''} ${mark.has(c + ':' + r) ? 'merge' : ''}" style="background:${color(v)}">${g.show(v)}</i>`;
        }).join('')}</div>`).join('');
        const nx = el.querySelector('#gnext'); nx.textContent = g.show(next); nx.style.background = color(next);
        if (!sum) el.querySelector('#gaux').textContent = top ? g.show(top) : '–';
      };
      el.innerHTML = `<div class="ghud"><div><small>Poin</small><b id="gpts">0</b></div><div><small>${sum ? 'Jumlah sasaran' : 'Terbesar'}</small><b id="gaux">${sum ? g.show(g.target) : '–'}</b></div><div><small>Berikutnya</small><b id="gnext" class="gnext"></b></div></div>
        <p class="small muted center gtip">Ketuk kolom untuk menjatuhkan balok.</p><div class="gtower" id="gtower"></div><div class="row-btn"><button class="btn sm ghost" id="gquit">Selesai</button></div>`;
      next = spawn(); render(-1);
      el.querySelector('#gquit').addEventListener('click', end);
      el.querySelector('#gtower').addEventListener('click', (e) => {
        const col = e.target.closest('.gcol'); if (!col || !alive) return;
        const c = +col.dataset.c;
        if (grid[c].length >= ROWS) { col.classList.add('full'); later(() => col.classList.remove('full'), 300); sfx.wrong(); return; }
        grid[c].push(next); chain = 0; mark = new Set();
        if (!sum) top = Math.max(top, next);
        const lr = grid[c].length - 1; let changed = false;
        while (step(c, lr)) { gravity(); changed = true; }
        if (changed) sfx.correct();
        next = spawn(); render(changed ? -1 : c);
        if (grid.every((col) => col.length >= ROWS)) later(end, 500);
      });
    } else {
      const pairs = g.pairs(), cards = shuffle(pairs.flatMap(([a, b], i) => [{ i, html: a, k: 'q' }, { i, html: b, k: 'a' }]));
      let open = [], matched = 0, miss = 0;
      el.innerHTML = '<div class="ghud"><div><small>Pasangan</small><b id="gpts">0/' + pairs.length + '</b></div><div><small>Salah tebak</small><b id="gmiss">0</b></div><div><small>Waktu</small><b id="gsec">0</b></div></div>'
        + `<div class="gmem">${cards.map((c, n) => `<button class="gcard ${c.k}" data-n="${n}"><span class="back">?</span><span class="face">${c.html}</span></button>`).join('')}</div>`;
      tick = setInterval(() => { const s = el.querySelector('#gsec'); if (s) s.textContent = Math.floor((Date.now() - t0) / 1000); }, 500);
      el.querySelectorAll('.gcard').forEach((b) => b.addEventListener('click', () => {
        if (!alive || open.length === 2 || b.classList.contains('up')) return;
        b.classList.add('up'); open.push(b);
        if (open.length < 2) return;
        const [x, y] = open, cx = cards[+x.dataset.n], cy = cards[+y.dataset.n];
        if (cx.i === cy.i && cx.k !== cy.k) {
          matched++; sfx.correct(); x.classList.add('done'); y.classList.add('done'); open = [];
          el.querySelector('#gpts').textContent = `${matched}/${pairs.length}`;
          if (matched === pairs.length) { pts = Math.max(6, 18 - miss); later(end, 600); }
        } else {
          miss++; sfx.wrong(); el.querySelector('#gmiss').textContent = miss;
          later(() => { x.classList.remove('up'); y.classList.remove('up'); open = []; }, 800);
        }
      }));
    }
    return () => { alive = false; timers.forEach(clearTimeout); clearInterval(tick); };
  }

  window.METIQ_GAMES = { GAMES, TYPES, HOW, LOOK, art, starsFor, start, byId: (id) => GAMES.find((g) => g.id === id) };
})();
