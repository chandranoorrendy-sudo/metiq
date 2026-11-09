/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — permainan matematika: Kilat (cepat tepat), Balon (pecahkan yang sesuai aturan), Pasangan (kartu memori),
 * Menara (balok jatuh), Garis Bilangan (geser penunjuk), Juring Pecahan (ketuk bagian), Jam Ajaib (putar jarum jam),
 * Ayo Belanja (bayar pas dan kembalian), Model Batang, Timbangan Seimbang, Harta Karun Koordinat, Bangun Bilangan,
 * Berburu Bangun / Jaring-jaring Kubus, Ukur dan Baca / Tebak Sudut, Baca Grafik, serta Pola dan Barisan.
 * Permainan 10 soal "pilih dulu lalu Periksa" memakai playRound() dan tidak memakai batas waktu.
 * Beberapa permainan untuk setiap kelas. Setiap ronde memberi 1–3 bintang sesuai poin.
 */
(function () {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // angka gaya Indonesia: koma desimal, tanda minus asli
  const f = (n) => { const r = Math.round(n * 1000) / 1000; return (r < 0 ? '−' : '') + String(Math.abs(r)); };
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
    { id: '1a', grade: 1, type: 'kilat', icon: '⚡', name: 'Add & Subtract Blitz', desc: 'Addition and subtraction to 20. Answer as fast as you can!', stars: [8, 14, 20],
      next() { if (Math.random() < 0.5) { const a = R(1, 15), b = R(1, 20 - a); return q(`${a} + ${b}`, a + b, () => a + b + pick([-2, -1, 1, 2, 3])); } const a = R(5, 20), b = R(1, a); return q(`${a} − ${b}`, a - b, () => a - b + pick([-2, -1, 1, 2])); } },
    { id: '1b', grade: 1, type: 'balon', icon: '🎈', name: 'Number Bond Balloons', desc: 'Pop the balloons whose result equals the target number.', stars: [8, 14, 20],
      rule() { const t = R(5, 10); return { label: `Pop the balloons that make <b>${t}</b>`, make(ok) { if (ok) { const a = R(0, t); return `${a} + ${t - a}`; } let a, b; do { a = R(0, 9); b = R(0, 9); } while (a + b === t || Math.abs(a + b - t) > 3); return `${a} + ${b}`; } }; } },
    { id: '1c', grade: 1, type: 'pasangan', icon: '🃏', name: 'Dot Pairs', desc: 'Match each set of dots with its number.',
      pairs() { return shuffle([...Array(10)].map((_, i) => i + 1)).slice(0, 6).map((n) => [`<span class="gdots">${'●'.repeat(Math.min(n, 5))}${n > 5 ? '<br>' + '●'.repeat(n - 5) : ''}</span>`, String(n)]); } },
    // Kelas 2
    { id: '2a', grade: 2, type: 'kilat', icon: '⚡', name: 'Two-Digit Blitz', desc: 'Adding and subtracting two-digit numbers.', stars: [6, 11, 16],
      next() { if (Math.random() < 0.5) { const a = R(10, 79), b = R(10, 99 - a); return q(`${a} + ${b}`, a + b, () => a + b + pick([-10, -1, 1, 10, 2])); } const a = R(30, 99), b = R(10, a - 5); return q(`${a} − ${b}`, a - b, () => a - b + pick([-10, -1, 1, 10, 2])); } },
    { id: '2b', grade: 2, type: 'balon', icon: '🎈', name: 'Even & Odd Balloons', desc: 'Pop even or odd numbers as instructed.', stars: [8, 14, 20],
      rule() { const ev = Math.random() < 0.5; return { label: `Pop the <b>${ev ? 'EVEN' : 'ODD'}</b> numbers`, make(ok) { const n = R(1, 49) * 2 - (ok === ev ? 0 : 1); return String(n); } }; } },
    { id: '2c', grade: 2, type: 'pasangan', icon: '🃏', name: 'Multiplication Pairs 2, 5, 10', desc: 'Match each multiplication with its result.',
      pairs() { const all = []; [2, 5, 10].forEach((a) => { for (let b = 1; b <= 10; b++) all.push([a, b]); }); const seen = new Set(), out = []; shuffle(all).forEach(([a, b]) => { if (out.length < 6 && !seen.has(a * b)) { seen.add(a * b); out.push([`${a} × ${b}`, String(a * b)]); } }); return out; } },
    // Kelas 3
    { id: '3a', grade: 3, type: 'kilat', icon: '⚡', name: 'Multiplication Blitz', desc: 'Multiplication facts up to 10 × 10.', stars: [7, 13, 19],
      next() { const a = R(2, 10), b = R(2, 10); return q(`${a} × ${b}`, a * b, () => pick([(a + 1) * b, (a - 1) * b, a * (b + 1), a * (b - 1), a * b + pick([-2, 2])])); } },
    { id: '3b', grade: 3, type: 'balon', icon: '🎈', name: 'Multiples Balloons', desc: 'Pop the balloons that are multiples of the target number.', stars: [7, 13, 19],
      rule() { const n = R(3, 9); return { label: `Pop the <b>multiples of ${n}</b>`, make(ok) { if (ok) return String(n * R(1, 10)); let v; do { v = R(2, n * 10); } while (v % n === 0); return String(v); } }; } },
    { id: '3c', grade: 3, type: 'pasangan', icon: '🃏', name: 'Division Pairs', desc: 'Match each division with its quotient.',
      pairs() { return shuffle([...Array(9)].map((_, i) => i + 2)).slice(0, 6).map((h) => { const d = R(2, 9); return [`${h * d} : ${d}`, String(h)]; }); } },
    // Kelas 4
    { id: '4a', grade: 4, type: 'kilat', icon: '⚡', name: 'Multiply & Divide Blitz', desc: 'Multiplying and dividing by 10 and 100, and two-digit times one-digit.', stars: [6, 11, 16],
      next() {
        const k = R(0, 2);
        if (k === 0) { const a = R(2, 99), m = pick([10, 100]); return q(`${a} × ${m}`, a * m, () => pick([a * m * 10, a * m / 10, a * m + m, a + m])); }
        if (k === 1) { const a = R(2, 99) * 10; return q(`${a} : 10`, a / 10, () => pick([a / 100, a, a / 10 + 1, a / 10 - 1, a / 10 + 10])); }
        const a = R(12, 49), b = R(2, 9); return q(`${a} × ${b}`, a * b, () => a * b + pick([-b, b, -10, 10, 1]));
      } },
    { id: '4b', grade: 4, type: 'balon', icon: '🎈', name: 'Factors & Primes Balloons', desc: 'Pop the factors of a number, or the prime numbers.', stars: [6, 11, 16],
      rule() {
        if (Math.random() < 0.5) {
          const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47], C = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 25, 27, 33, 35, 39, 45, 49];
          return { label: 'Pop the <b>prime numbers</b>', make: (ok) => String(pick(ok ? P : C)) };
        }
        const n = pick([12, 16, 18, 20, 24, 30, 36]), fs = [...Array(n)].map((_, i) => i + 1).filter((d) => n % d === 0), not = [...Array(n)].map((_, i) => i + 1).filter((d) => n % d && d > 1);
        return { label: `Pop the <b>factors of ${n}</b>`, make: (ok) => String(pick(ok ? fs : not)) };
      } },
    { id: '4c', grade: 4, type: 'pasangan', icon: '🃏', name: 'Equivalent Fraction Pairs', desc: 'Match fractions with the same value.',
      pairs() { return shuffle([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6]]).slice(0, 6).map(([a, b]) => { const k = R(2, 4); return [fr(a, b), fr(a * k, b * k)]; }); } },
    // Kelas 5
    { id: '5a', grade: 5, type: 'kilat', icon: '⚡', name: 'Decimal Blitz', desc: 'Adding and subtracting decimals.', stars: [6, 11, 16],
      next() { const a = R(11, 99) / 10, b = R(11, 99) / 10; if (Math.random() < 0.5) return q(`${f(a)} + ${f(b)}`, a + b, () => a + b + pick([-1, -0.1, 0.1, 1, 0.2])); const [x, y] = a >= b ? [a, b] : [b, a]; return q(`${f(x)} − ${f(y)}`, x - y, () => x - y + pick([-1, -0.1, 0.1, 1, 0.2])); } },
    { id: '5b', grade: 5, type: 'balon', icon: '🎈', name: 'Greater Than Balloons', desc: 'Pop the decimals greater than the target number.', stars: [7, 13, 19],
      rule() { const x = pick([0.5, 1, 1.5, 2, 0.25, 0.75]); return { label: `Pop the numbers <b>greater than ${f(x)}</b>`, make(ok) {
        const d = pick([R(1, 9) / 10, R(1, 9) / 100, R(1, 4) / 10 + R(1, 9) / 100]);
        // pengecoh: lebih kecil, atau tepat sama dengan sasaran (sama besar bukan "lebih besar")
        return f(ok ? x + d : Math.random() < 0.15 ? x : Math.max(0.01, Math.round((x - d) * 100) / 100));
      } }; } },
    { id: '5c', grade: 5, type: 'pasangan', icon: '🃏', name: 'Fraction & Decimal Pairs', desc: 'Match fractions with their decimal forms.',
      pairs() { return shuffle([[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [2, 5, 0.4], [3, 5, 0.6], [4, 5, 0.8], [1, 10, 0.1], [3, 10, 0.3], [7, 10, 0.7], [1, 8, 0.125]]).slice(0, 6).map(([a, b, d]) => [fr(a, b), f(d)]); } },
    // Kelas 6
    { id: '6a', grade: 6, type: 'kilat', icon: '⚡', name: 'Mixed Operations Blitz', desc: 'Multiply and divide before you add and subtract.', stars: [5, 10, 15],
      next() {
        const a = R(2, 9), b = R(2, 9), c = R(2, 9), k = R(0, 2);
        if (k === 0) return q(`${a} + ${b} × ${c}`, a + b * c, () => pick([(a + b) * c, a + b * c + pick([-1, 1, c]), a * b + c]));
        if (k === 1) return q(`(${a} + ${b}) × ${c}`, (a + b) * c, () => pick([a + b * c, (a + b) * c + pick([-c, c, 1])]));
        const d = R(2, Math.min(9, a * b - 1)); // hasil tetap positif
        return q(`${a} × ${b} − ${d}`, a * b - d, () => pick([a * (b - d), a * b - d + pick([-1, 1, 2]), a * b + d]));
      } },
    { id: '6b', grade: 6, type: 'balon', icon: '🎈', name: 'Integer Balloons', desc: 'Pop the integer sums that are negative or positive.', stars: [6, 11, 16],
      rule() { const want = Math.random() < 0.5; return { label: `Pop those whose result is <b>${want ? 'NEGATIVE' : 'POSITIVE'}</b>`, make(ok) { let a, b; do { a = R(-9, 9); b = R(-9, 9); } while (a + b === 0 || (a + b < 0) !== (ok === want)); return `${f(a)} + ${neg(b)}`; } }; } },
    { id: '6c', grade: 6, type: 'pasangan', icon: '🃏', name: 'Percent Pairs', desc: 'Match percents with their fractions.',
      pairs() { return shuffle([[50, 1, 2], [25, 1, 4], [75, 3, 4], [20, 1, 5], [10, 1, 10], [40, 2, 5], [60, 3, 5], [80, 4, 5], [30, 3, 10], [5, 1, 20], [12.5, 1, 8]]).slice(0, 6).map(([p, a, b]) => [`${f(p)}%`, fr(a, b)]); } },
  ];
  // Balok jatuh: "Menara Pasangan" (dua balok bersentuhan yang jumlahnya = sasaran hilang)
  // dan "Menara Kembar" (balok sama bergabung menjadi dua kali lipat). Nilai disimpan sebagai bilangan bulat.
  const range = (a, b, s = 1) => { const r = []; for (let v = a; v <= b; v += s) r.push(v); return r; };
  [
    [1, 10, range(1, 9), (v) => String(v), 'Ten'],
    [2, 20, range(2, 18), (v) => String(v), 'Twenty'],
    [3, 100, [...range(10, 90, 10), 25, 75], (v) => String(v), 'One Hundred'],
    [4, 1000, [...range(100, 900, 100), 250, 750], (v) => v.toLocaleString('en-US'), 'One Thousand'],
    [5, 100, [...range(10, 90, 10), 25, 75, 5, 95], (v) => f(v / 100), 'One'],
    [6, 0, [...range(-9, -1), ...range(1, 9)], (v) => f(v), 'Zero'],
  ].forEach(([grade, target, vals, show, word]) => {
    GAMES.push({ id: grade + 'd', grade, type: 'susun', icon: '🧱', name: `Tower of ${word}`, target, vals, show, stars: [10, 20, 30],
      desc: `Drop blocks onto the tower. Two touching blocks that add up to ${show(target)} disappear. Don't let the tower fill up!` });
    // poin = 10 × (berapa kali 2 dilipatgandakan untuk mencapai balok terbesar): 64 = 50, 128 = 60, 256 = 70
    GAMES.push({ id: grade + 'e', grade, type: 'kembar', icon: '🔢', name: 'Twin Tower', drops: grade <= 2 ? [2, 2, 2, 4, 4, 8] : [2, 2, 4, 4, 8, 16], show: (v) => v.toLocaleString('en-US'),
      stars: grade <= 2 ? [40, 50, 60] : [50, 60, 70],
      desc: `Blocks keep falling. Aim them at matching blocks to merge into double (${grade <= 2 ? '4 + 4 = 8' : '16 + 16 = 32'}). Don't let the tower pass the limit! ⭐⭐⭐ target: ${grade <= 2 ? 128 : 256}.` });
  });
  /* ---------- Garis bilangan: geser penunjuk ke jawaban (mulai dari 0) ---------- */
  // Soal = teks kiri dan kanan kotak jawaban, jawaban, dan garisnya (min, max, langkah, label tiap berapa garis).
  const fmt = (n) => (Math.abs(n) >= 1000 ? (n < 0 ? '−' : '') + Math.abs(n).toLocaleString('en-US') : f(n));
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
  const WARUNG = { umum: [['🍞', 'bread'], ['🥛', 'milk'], ['🍌', 'bananas'], ['📒', 'notebook'], ['✏️', 'pencils'], ['🧃', 'juice'], ['🍪', 'cakes'], ['🥚', 'eggs']],
    islami: [['🌴', 'dates'], ['📒', 'notebook'], ['✏️', 'pencils'], ['🥛', 'milk'], ['🍞', 'bread'], ['📿', 'prayer beads'], ['🍯', 'honey'], ['🍌', 'bananas']] };
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
  const jamTxt = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  const clock = (ask, time, sub, H, m, step, start = 0) => ({ ask, time, sub, ans: ((H % 12) * 60 + m) % 720, step, start, right: jamTxt(H, m) });
  const JAM = {
    1() { const h = R(1, 12); if (Math.random() < 0.5) return clock('Set the clock to', jamTxt(h, 0), '', h, 0, 30);
      return clock('Set the clock to', jamTxt(h, 30), `half past ${h}`, h, 30, 30); },
    2() { const h = R(1, 12), m = R(1, 11) * 5; return clock('Set the clock to', jamTxt(h, m), '', h, m, 5); },
    3() { const h = R(1, 12);
      if (Math.random() < 0.5) { let m = R(1, 59); if (m % 5 === 0) m++; return clock('Set the clock to', jamTxt(h, m), '', h, m, 1); }
      const d = pick([5, 10, 15, 20, 25]), p = h === 1 ? 12 : h - 1; // "10 menit lagi pukul 6" = pukul 5.50
      return clock('Set the clock to', `${d} minutes to ${h}`, '', p, 60 - d, 1); },
    4() { if (Math.random() < 0.4) { const H = R(13, 23), m = R(0, 11) * 5; return { ...clock('Set the clock to', jamTxt(H, m), H < 15 ? 'midday' : H < 18 ? 'late afternoon' : 'night', H, m, 5), right: `${jamTxt(H, m)} (${jamTxt(H - 12, m)})` }; }
      const s = R(6, 15) * 60 + R(0, 11) * 5, d = R(3, 20) * 5, e = s + d, H = Math.floor(e / 60), m = e % 60;
      const lama = d >= 60 ? `${Math.floor(d / 60)} hours${d % 60 ? ` ${d % 60} minutes` : ''}` : `${d} minutes`;
      return { ...clock(`Starts ${jamTxt(Math.floor(s / 60), s % 60)}, lasts ${lama}.`, 'When does it end?', '', H, m, 5, s % 720), right: jamTxt(H, m) }; },
  };
  for (let gr = 1; gr <= 6; gr++) {
    GAMES.push({ id: gr + 'f', grade: gr, type: 'garis', icon: '📏', name: 'Number Line', isNew: true, stars: [6, 8, 10], next: GARIS[gr],
      desc: 'Slide the pointer on the number line to the right answer. 10 questions, no time limit.' });
    if (JURING[gr]) GAMES.push({ id: gr + 'g', grade: gr, type: 'juring', icon: '🍕', name: gr >= 5 ? 'Color the Parts' : 'Fraction Slices', isNew: true, stars: [6, 8, 10], next: JURING[gr],
      desc: gr >= 6 ? 'Tap as many parts as the percent asked. 25% of 8 parts = 2 parts.' : gr === 5 ? 'Tap as many parts as the decimal asked. 0.5 of 10 parts = 5 parts.' : 'Tap as many slices as the fraction asked. ½ of 14 slices = 7 slices.' });
  }
  for (let gr = 1; gr <= 4; gr++) GAMES.push({ id: gr + 'h', grade: gr, type: 'jam', icon: '🕒', name: 'Magic Clock', isNew: true, stars: [6, 8, 10], next: JAM[gr],
    desc: gr === 1 ? 'Turn the long hand until the clock shows the time in the question. On the hour and half past.' : gr === 4 ? 'Turn the clock hands for 24-hour time and when activities end.' : `Turn the long hand until the clock shows the time in the question, by ${gr === 2 ? '5 minutes' : 'minutes'}.` });
  for (let gr = 1; gr <= 3; gr++) GAMES.push({ id: gr + 'i', grade: gr, type: 'uang', icon: '🪙', name: 'Let\'s Go Shopping', isNew: true, stars: [6, 8, 10], next: UANG[gr],
    desc: gr === 3 ? 'Tap money to pay the exact amount, or to give the right change.' : 'Tap coins and notes until the total equals the item\'s price.' });
  /* ---------- SMP dan SMA: Kelas 7, 8, Aljabar 1, Geometri, Aljabar 2, Prakalkulus, Kalkulus ---------- */
  // Kilat: pilihan teks biasa (boleh negatif), pangkat memakai huruf superskrip
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  const sp = (n) => String(n).split('').map((c) => SUP[c] || c).join('');
  const qn = (text, ans, near) => { const set = new Set([ans]); let guard = 0; while (set.size < 4 && guard++ < 80) { const d = Math.round(near() * 1000) / 1000; if (d !== ans) set.add(d); } return { text, answer: f(ans), options: shuffle([...set]).map(f) }; };
  const qs = (text, ans, wrong) => ({ text, answer: ans, options: shuffle([ans, ...shuffle(wrong.filter((w) => w !== ans)).slice(0, 3)]) });
  const nz = (a, b) => { let v; do v = R(a, b); while (!v); return v; };
  const lin = (a, b) => `${a === 1 ? '' : a === -1 ? '−' : f(a)}x${b ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b)}` : ''}`;
  GAMES.push(
    // Kelas 7
    { id: '7a', grade: 7, type: 'kilat', icon: '⚡', name: 'Integer Blitz', desc: 'Add, subtract, and multiply negative integers. Answer as fast as you can!', stars: [6, 11, 16],
      next() { const a = nz(-12, 12), b = nz(-12, 12), k = R(0, 2); if (k === 0) return qn(`${f(a)} + ${neg(b)}`, a + b, () => pick([a - b, -(a + b), a + b + pick([-1, 1, 2])])); if (k === 1) return qn(`${f(a)} − ${neg(b)}`, a - b, () => pick([a + b, b - a, a - b + pick([-1, 1])])); const x = nz(-9, 9), y = nz(-9, 9); return qn(`${f(x)} × ${neg(y)}`, x * y, () => pick([-x * y, x * y + pick([-x, x, y])])); } },
    { id: '7b', grade: 7, type: 'balon', icon: '🎈', name: 'Equation Balloons', desc: 'Pop the equations whose solution matches the target number.', stars: [6, 11, 16],
      rule() { const k = nz(-6, 6); return { label: `Pop the equations with <b>x = ${f(k)}</b>`, make(ok) { const a = nz(-5, 5), b = R(-9, 9); let x = k; if (!ok) do x = nz(-9, 9); while (x === k); return `${lin(a, b)} = ${f(a * x + b)}`; } }; } },
    { id: '7c', grade: 7, type: 'pasangan', icon: '🃏', name: 'Exponent Pairs', desc: 'Match powers with their values.',
      pairs() { return shuffle([[2, 5], [2, 7], [2, 10], [3, 3], [3, 4], [4, 3], [5, 3], [10, 3], [6, 2], [7, 2], [11, 2], [12, 2]]).slice(0, 6).map(([a, n]) => [`${a}${sp(n)}`, (a ** n).toLocaleString('en-US')]); } },
    // Kelas 8
    { id: '8a', grade: 8, type: 'kilat', icon: '⚡', name: 'Roots & Powers Blitz', desc: 'Square roots, cube roots, and squares.', stars: [6, 11, 16],
      next() { const k = R(0, 2); if (k === 0) { const n = R(2, 20); return qn(`√${n * n}`, n, () => n + pick([-2, -1, 1, 2])); } if (k === 1) { const n = R(2, 10); return qn(`∛${n ** 3}`, n, () => n + pick([-2, -1, 1, 2])); } const n = R(11, 25); return qn(`${n}²`, n * n, () => n * n + pick([-10, -1, 1, 10, n])); } },
    { id: '8b', grade: 8, type: 'balon', icon: '🎈', name: 'Pythagoras Balloons', desc: 'Pop the three numbers that can be sides of a right triangle.', stars: [6, 11, 16],
      rule() { return { label: 'Pop the <b>Pythagorean triples</b> (a² + b² = c²)', make(ok) { const T = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]]; const [a, b, c] = pick(T), k = pick([1, 1, 2, 3]); return ok ? `${a * k}, ${b * k}, ${c * k}` : `${a * k}, ${b * k}, ${c * k + pick([-1, 1, 2])}`; } }; } },
    { id: '8c', grade: 8, type: 'pasangan', icon: '🃏', name: 'Scientific Notation Pairs', desc: 'Match numbers with their scientific notation.',
      pairs() { const seen = new Set(), out = []; while (out.length < 6) { const m = R(11, 99) / 10, e = R(2, 6), v = Math.round(m * 10) * 10 ** (e - 1); if (seen.has(v)) continue; seen.add(v); out.push([`${f(m)} × 10${sp(e)}`, v.toLocaleString('en-US')]); } return out; } },
    // Aljabar 1
    { id: '9a', grade: 9, type: 'kilat', icon: '⚡', name: 'Linear Equation Blitz', desc: 'Find x as fast as you can.', stars: [5, 10, 15],
      next() { const a = nz(-6, 6), x = nz(-9, 9), b = R(-12, 12); return qn(`${lin(a, b)} = ${f(a * x + b)} → x`, x, () => pick([-x, x + pick([-2, -1, 1, 2]), x * 2])); } },
    { id: '9b', grade: 9, type: 'balon', icon: '🎈', name: 'Quadratic Roots Balloons', desc: 'Pop the numbers that are roots of the quadratic equation.', stars: [5, 10, 15],
      rule() { let p = nz(-7, 7), q = nz(-7, 7); if (p === q) q = p + 1 || 2; const s = p + q, m = p * q; return { label: `Pop the roots of <b>x² ${s > 0 ? '−' : '+'} ${Math.abs(s) === 1 ? '' : Math.abs(s)}x ${m < 0 ? '−' : '+'} ${Math.abs(m)} = 0</b>`.replace(' + 0x', '').replace(' − 0x', ''), make(ok) { if (ok) return f(pick([p, q])); let v; do v = R(-9, 9); while (v === p || v === q); return f(v); } }; } },
    { id: '9c', grade: 9, type: 'pasangan', icon: '🃏', name: 'Factor Pairs', desc: 'Match quadratic expressions with their factors.',
      pairs() { const seen = new Set(), out = []; while (out.length < 6) { const p = nz(-6, 6), q = nz(-6, 6), key = [p, q].sort().join(); if (seen.has(key) || p + q === 0) continue; seen.add(key); const term = (v) => `(x ${v < 0 ? '−' : '+'} ${Math.abs(v)})`; out.push([`x² ${p + q < 0 ? '−' : '+'} ${Math.abs(p + q) === 1 ? '' : Math.abs(p + q)}x ${p * q < 0 ? '−' : '+'} ${Math.abs(p * q)}`, term(p) + term(q)]); } return out; } },
    // Geometri
    { id: '10a', grade: 10, type: 'kilat', icon: '⚡', name: 'Angle Blitz', desc: 'Supplementary angles, complementary angles, triangles, and polygons.', stars: [6, 11, 16],
      next() { const k = R(0, 3); if (k === 0) { const a = R(10, 170); return qn(`Supplement of ${a}°`, 180 - a, () => pick([90 - a, 180 - a + pick([-10, 10]), a])); } if (k === 1) { const a = R(5, 85); return qn(`Complement of ${a}°`, 90 - a, () => pick([180 - a, 90 - a + pick([-10, 10]), a])); } if (k === 2) { const a = R(20, 90), b = R(20, 160 - a); return qn(`Triangle: ${a}°, ${b}°, ?`, 180 - a - b, () => 180 - a - b + pick([-10, 10, 20])); } const n = R(5, 10); return qn(`Sum of interior angles of a ${n}-gon`, (n - 2) * 180, () => (n - 2 + pick([-1, 1])) * 180); } },
    { id: '10b', grade: 10, type: 'balon', icon: '🎈', name: 'Angle Type Balloons', desc: 'Pop acute, right, or obtuse angles as instructed.', stars: [6, 11, 16],
      rule() { const want = pick(['ACUTE', 'OBTUSE']); return { label: `Pop the <b>${want}</b> angles`, make(ok) { const lancip = (want === 'ACUTE') === ok; return `${lancip ? R(5, 89) : R(91, 179)}°`; } }; } },
    { id: '10c', grade: 10, type: 'pasangan', icon: '🃏', name: 'Trigonometry Pairs', desc: 'Match the sin, cos, and tan values of special angles.',
      pairs() { return shuffle([['sin 30°', '½'], ['cos 60°', '½'], ['sin 90°', '1'], ['cos 0°', '1'], ['tan 45°', '1'], ['sin 45°', '½√2'], ['cos 30°', '½√3'], ['tan 60°', '√3'], ['tan 30°', '⅓√3'], ['cos 90°', '0']]).reduce((acc, p) => (acc.some((x) => x[1] === p[1]) || acc.length >= 6 ? acc : [...acc, p]), []); } },
    // Aljabar 2
    { id: '11a', grade: 11, type: 'kilat', icon: '⚡', name: 'Logarithm Blitz', desc: 'Evaluate logarithms as fast as you can.', stars: [6, 11, 16],
      next() { const b = pick([2, 3, 5, 10]), k = R(0, b === 2 ? 8 : b === 10 ? 5 : 4); return qn(`${b === 10 ? '' : sp(b)}log ${(b ** k).toLocaleString('en-US')}`, k, () => k + pick([-2, -1, 1, 2, b])); } },
    { id: '11b', grade: 11, type: 'balon', icon: '🎈', name: 'Powers of i Balloons', desc: 'Pop the powers of i whose result matches the instruction.', stars: [6, 11, 16],
      rule() { const want = pick(['1', '−1', 'i', '−i']), m = { '1': 0, i: 1, '−1': 2, '−i': 3 }[want]; return { label: `Pop those whose result is <b>${want}</b>`, make(ok) { let n; do n = R(2, 40); while ((n % 4 === m) !== ok); return `i${sp(n)}`; } }; } },
    { id: '11c', grade: 11, type: 'pasangan', icon: '🃏', name: 'Radian Pairs', desc: 'Match degree measures with radians.',
      pairs() { return shuffle([['30°', 'π/6'], ['45°', 'π/4'], ['60°', 'π/3'], ['90°', 'π/2'], ['120°', '2π/3'], ['135°', '3π/4'], ['150°', '5π/6'], ['180°', 'π'], ['270°', '3π/2'], ['360°', '2π']]).slice(0, 6); } },
    // Prakalkulus
    { id: '12a', grade: 12, type: 'kilat', icon: '⚡', name: 'Determinant Blitz', desc: 'Find the determinant of a 2 × 2 matrix: ad − bc.', stars: [5, 10, 15],
      next() { const a = R(-5, 5), b = R(-5, 5), c = R(-5, 5), d = R(-5, 5), v = a * d - b * c; return qn(`|${f(a)} ${f(b)} ; ${f(c)} ${f(d)}|`, v, () => pick([a * d + b * c, b * c - a * d, v + pick([-2, -1, 1, 2])])); } },
    { id: '12b', grade: 12, type: 'balon', icon: '🎈', name: 'Even & Odd Function Balloons', desc: 'Pop even or odd functions as instructed.', stars: [6, 11, 16],
      rule() { const want = pick(['EVEN', 'ODD']); const E = ['x²', 'cos x', '|x|', 'x⁴ − 3x²', '5', 'x² + 1', 'x⁶'], O = ['x³', 'sin x', 'x', 'x³ − 2x', 'x⁵ + x', 'tan x', '−4x']; return { label: `Pop the <b>${want}</b> functions`, make(ok) { return pick((want === 'EVEN') === ok ? E : O); } }; } },
    { id: '12c', grade: 12, type: 'pasangan', icon: '🃏', name: 'Identity Pairs', desc: 'Match trigonometric expressions with their identities.',
      pairs() { return shuffle([['sin²x + cos²x', '1'], ['sin 2x', '2 sin x cos x'], ['cos²x − sin²x', 'cos 2x'], ['sin x / cos x', 'tan x'], ['1 + tan²x', 'sec²x'], ['sin(−x)', '−sin x'], ['cos(−x)', 'cos x'], ['1 / cos x', 'sec x']]).slice(0, 6); } },
    // Kalkulus
    { id: '13a', grade: 13, type: 'kilat', icon: '⚡', name: "Derivative Blitz", desc: "Find f'(a) with the power rule as fast as you can.", stars: [5, 10, 15],
      next() { const a = nz(-4, 5), n = R(2, 5), x = pick([-2, -1, 1, 2]), v = a * n * x ** (n - 1); return qn(`f(x) = ${a === 1 ? '' : a === -1 ? '−' : f(a)}x${sp(n)} → f'(${f(x)})`, v, () => pick([a * x ** n, a * n * x ** n, v + pick([-a, a, n]), -v])); } },
    { id: '13b', grade: 13, type: 'balon', icon: '🎈', name: 'Derivative Balloons', desc: 'Pop the correct derivative of the given function.', stars: [5, 10, 15],
      rule() { const n = R(2, 6), a = R(1, 5); const fx = `${a === 1 ? '' : a}x${sp(n)}`, right = `${a * n}x${n - 1 === 1 ? '' : sp(n - 1)}`; const wrongs = [`${a}x${sp(n - 1)}`, `${a * n}x${sp(n)}`, `${a * (n - 1)}x${sp(n - 1)}`, `${a * n}x${sp(n + 1)}`, `${a + n}x${n - 1 === 1 ? '' : sp(n - 1)}`].filter((w) => w !== right); return { label: `Pop the derivatives of <b>${fx}</b>`, make(ok) { return ok ? right : pick(wrongs); } }; } },
    { id: '13c', grade: 13, type: 'pasangan', icon: '🃏', name: 'Integral Pairs', desc: 'Match integrals with their results.',
      pairs() { return shuffle([['∫ 2x dx', 'x² + C'], ['∫ 3x² dx', 'x³ + C'], ['∫ cos x dx', 'sin x + C'], ['∫ sin x dx', '−cos x + C'], ['∫ eˣ dx', 'eˣ + C'], ['∫ 1/x dx', 'ln|x| + C'], ['∫ 4x³ dx', 'x⁴ + C'], ['∫ 5 dx', '5x + C']]).slice(0, 6); } },
  );
  /* ---------- TK A dan TK B ---------- */
  const DOT = (n) => `<span class="gdots">${'●'.repeat(n)}</span>`;
  GAMES.push(
    { id: 'tka', grade: -2, type: 'pasangan', icon: '🃏', name: 'Little Dot Pairs', desc: 'Match each set of dots with its number (1 to 6).',
      pairs() { return shuffle([1, 2, 3, 4, 5, 6]).map((n) => [DOT(n), String(n)]); } },
    { id: 'tkb', grade: -2, type: 'balon', icon: '🎈', name: 'Shape Balloons', desc: 'Pop the balloons whose shape matches the instruction.', stars: [6, 11, 16],
      rule() { const S = { LINGKARAN: ['⚪', '🔵', '🟢', '🔴', '🟡'], PERSEGI: ['⬜', '🟦', '🟩', '🟥', '🟨'], SEGITIGA: ['🔺', '🔻'] }; const want = pick(Object.keys(S)); return { label: `Pop the <b>${want}</b>`, make(ok) { return pick(ok ? S[want] : Object.keys(S).filter((k) => k !== want).flatMap((k) => S[k])); } }; } },
    { id: 'tkc', grade: -1, type: 'kilat', icon: '⚡', name: 'Add & Subtract Blitz to 10', desc: 'Addition and subtraction to 10.', stars: [7, 13, 19],
      next() { if (Math.random() < 0.5) { const a = R(0, 9), b = R(1, 10 - a); return q(`${a} + ${b}`, a + b, () => a + b + pick([-2, -1, 1, 2])); } const a = R(2, 10), b = R(1, a); return q(`${a} − ${b}`, a - b, () => Math.abs(a - b + pick([-2, -1, 1, 2]))); } },
    { id: 'tkd', grade: -1, type: 'pasangan', icon: '🃏', name: 'Teen Number Pairs', desc: 'Match 10 + ones with the teen number.',
      pairs() { return shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6).map((n) => [`10 + ${n}`, String(10 + n)]); } },
    { id: 'tke', grade: -1, type: 'balon', icon: '🎈', name: 'Greater Than Balloons', desc: 'Pop the numbers greater (or smaller) than the target.', stars: [7, 13, 19],
      rule() { const t = R(5, 15), big = Math.random() < 0.5; return { label: `Pop the numbers <b>${big ? 'GREATER' : 'LESS'}</b> than <b>${t}</b>`, make(ok) { let v; do v = R(0, 20); while (v === t || ((v > t) === big) !== ok); return String(v); } }; } },
  );
  GAMES.forEach((g) => { if (g.type === 'pasangan') g.stars = [10, 14, 17]; });

  /* ---------- Lembar Hafalan: satu kelompok fakta diulang dalam beberapa bentuk (urut, acak, pola), seperti lembar latihan harian ---------- */
  // Satu baris = potongan teks dan kotak jawaban { a: angka }. Bagian A urut, B acak, C bentuk lain dari fakta yang sama.
  const BX = (a) => ({ a });
  function sheet(op, n) {
    const ks = [...Array(10)].map((_, i) => i + 1), O = { '+': '+', '-': '−', x: '×', ':': ':' }[op];
    const fact = (k) => (op === '+' ? [`${k} + ${n} =`, k + n] : op === '-' ? [`${k + n} − ${n} =`, k] : op === 'x' ? [`${n} × ${k} =`, n * k] : [`${n * k} : ${n} =`, k]);
    const line = (k) => { const [t, a] = fact(k); return [t, BX(a)]; };
    const A = ks.map(line), B = shuffle(ks.slice()).map(line);
    let C, ct;
    if (op === '+') { ct = 'Fill in the missing number'; C = shuffle(ks.slice()).slice(0, 6).map((k) => [BX(k), `+ ${n} = ${k + n}`]); }
    else if (op === '-') { ct = 'Fill in the missing number'; C = shuffle(ks.slice()).slice(0, 6).map((k) => [BX(k + n), `− ${n} = ${k}`]); }
    else if (op === 'x') {
      ct = 'Continue the pattern, then add';
      const row = (s0) => [...Array(6)].flatMap((_, i) => { const v = n * (s0 + i); return i < 3 ? [`${v}`, i < 5 ? ',' : ''] : [BX(v), i < 5 ? ',' : '']; }).filter((x) => x !== '');
      C = [row(1), row(3), ...[2, 3, 4].map((m) => [Array(m).fill(n).join(' + ') + ' =', BX(n * m)])];
    } else { ct = 'Fill in the missing factor'; C = shuffle(ks.slice()).slice(0, 6).map((k) => [`${n} ×`, BX(k), `= ${n * k}`]); }
    return { title: `${{ '+': 'Add', '-': 'Subtract', x: 'Multiply', ':': 'Divide' }[op]} ${n}`, op: O, parts: [['A', 'In order: read while writing', A], ['B', 'Mixed', B], ['C', ct, C]] };
  }
  const LEMBAR = [
    { grade: -1, op: '+', ns: [1, 2, 3, 4, 5] },
    { grade: 1, op: '+', ns: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, { grade: 1, op: '-', ns: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { grade: 2, op: '-', ns: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, { grade: 2, op: 'x', ns: [2, 3, 4, 5, 10] },
    { grade: 3, op: 'x', ns: [2, 3, 4, 5, 6, 7, 8, 9] }, { grade: 3, op: ':', ns: [2, 3, 4, 5, 6, 7, 8, 9] },
    { grade: 4, op: ':', ns: [2, 3, 4, 5, 6, 7, 8, 9] },
  ];
  LEMBAR.forEach((L, i) => {
    const name = { '+': 'Addition', '-': 'Subtraction', x: 'Multiplication', ':': 'Division' }[L.op];
    GAMES.push({ id: L.grade + 'l' + i, grade: L.grade, type: 'lembar', icon: '🗒️', name: `Sheet ${name}`, isNew: true, op: L.op, ns: L.ns, stars: [80, 90, 100],
      desc: `Choose a sheet, for example ${{ '+': 'Add 4', '-': 'Subtract 4', x: 'Times 6', ':': 'Divide by 6' }[L.op]}. Part A is in order (read while writing), part B has the same questions shuffled, and part C shows other forms of the same facts. Tap a box, write the answer with the number keys, then Check. Wrong answers get corrected until they're all right. Stars come from the percent correct on the first check: 80%, 90%, and 100%.` });
  });

  /* ---------- Tarik Tambang: dua tim di satu layar (cocok untuk IFP di kelas), soal dari Kilat kelas itu ---------- */
  const dots = (n) => `<span class="gdots">${'●'.repeat(Math.min(n, 5))}${n > 5 ? '<br>' + '●'.repeat(n - 5) : ''}</span>`;
  const TT_TK = () => { const n = R(1, 5), set = new Set([n]); while (set.size < 3) set.add(R(1, 5)); return { text: dots(n), answer: String(n), options: shuffle([...set]).map(String), ask: 'How many?' }; };
  [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach((gr) => {
    const k = GAMES.find((x) => x.grade === gr && x.type === 'kilat');
    GAMES.push({ id: gr + 'tt', grade: gr, type: 'tambang', icon: '🪢', name: 'Tug of War', isNew: true, stars: [3, 5, 7], next: k ? () => k.next() : TT_TK,
      desc: 'A class game for two teams on one screen (great for large classroom touch screens). Red Team is on the left, Blue Team on the right. Each correct answer pulls the rope toward that team. A wrong answer locks that team\'s buttons for a moment. The team that pulls the flag to its line wins, or the team ahead when the 90 seconds run out.' });
  });

  /* ---------- Panjat Pinang: satu kelas bekerja sama di layar besar, dipandu guru, tanpa batas waktu ---------- */
  [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach((gr) => {
    const k = GAMES.find((x) => x.grade === gr && x.type === 'kilat');
    GAMES.push({ id: gr + 'pp', grade: gr, type: 'pinang', icon: '🧗', name: 'Greased Pole', isNew: true, stars: [6, 8, 10], next: k ? () => k.next() : TT_TK,
      desc: 'A whole-class game on a big screen. The question appears large, the children answer together, then one child comes up and taps the answer. A correct answer moves Meti up one level; a wrong answer makes Meti slide down one level because the pole is slippery. No time limit. The class wins by reaching the top and tries to beat its own record: as few slides as possible.' });
  });

  /* ---------- Sudoku: 4 × 4 bergambar untuk TK, 4 × 4 angka, 6 × 6, lalu 9 × 9 untuk SMP–SMA ---------- */
  const SDK = { '-2': [4, 10, 1], '-1': [4, 8, 1], 1: [4, 8], 2: [4, 6], 3: [6, 20], 4: [6, 16], 5: [6, 14], 6: [6, 12], 7: [9, 40], 8: [9, 36], 9: [9, 34], 10: [9, 32], 11: [9, 30], 12: [9, 28], 13: [9, 26] };
  Object.entries(SDK).forEach(([gr, [n, clues, pic]]) => {
    GAMES.push({ id: gr + 'sd', grade: +gr, type: 'sudoku', icon: '🧩', name: `Sudoku ${n} × ${n}`, isNew: true, n, clues, pic: !!pic, stars: [8, 14, 17],
      desc: `Fill each empty box so that every row, column, and thick box has ${pic ? 'all the fruits' : `the numbers 1 to ${n}`} exactly once. Tap a box, then tap the ${pic ? 'fruit' : 'number'}. Answers that don't fit turn red. You start with 20 points and lose 3 for each mistake.` });
  });
  // Sudoku acak: isi penuh dengan runut-balik, lalu kosongkan kotak selama jawabannya tetap tunggal
  function sudoku(n, clues) {
    const [br, bc] = n === 4 ? [2, 2] : n === 6 ? [2, 3] : [3, 3], N = n * n;
    const peers = [...Array(N)].map((_, i) => { const r = Math.floor(i / n), c = i % n, set = new Set(); for (let k = 0; k < n; k++) { set.add(r * n + k); set.add(k * n + c); } const r0 = r - (r % br), c0 = c - (c % bc); for (let a = 0; a < br; a++) for (let b = 0; b < bc; b++) set.add((r0 + a) * n + c0 + b); set.delete(i); return [...set]; });
    const fill = (g) => { const i = g.indexOf(0); if (i < 0) return true; for (const v of shuffle([...Array(n)].map((_, k) => k + 1))) { if (peers[i].every((j) => g[j] !== v)) { g[i] = v; if (fill(g)) return true; g[i] = 0; } } return false; };
    const count = (g, lim) => { let best = -1, opts = null; for (let i = 0; i < N; i++) if (!g[i]) { const o = []; for (let v = 1; v <= n; v++) if (peers[i].every((j) => g[j] !== v)) o.push(v); if (!o.length) return 0; if (best < 0 || o.length < opts.length) { best = i; opts = o; } } if (best < 0) return 1; let t = 0; for (const v of opts) { g[best] = v; t += count(g, lim - t); if (t >= lim) break; } g[best] = 0; return t; };
    const sol = Array(N).fill(0); fill(sol);
    const puz = sol.slice(); let left = N;
    for (const i of shuffle([...Array(N)].map((_, k) => k))) { if (left <= clues) break; const v = puz[i]; puz[i] = 0; if (count(puz.slice(), 2) === 1) left--; else puz[i] = v; }
    return { sol, puz, br, bc };
  }

  /* ========== Delapan permainan 10 soal: Model Batang, Timbangan Seimbang, Harta Karun Koordinat, Bangun Bilangan,
   * Berburu Bangun / Jaring-jaring Kubus, Ukur dan Baca / Tebak Sudut, Baca Grafik, Pola dan Barisan.
   * Semuanya memakai playRound() ("pilih dulu lalu Periksa") dan tanpa batas waktu, jadi aman untuk mode adab. ========== */
  const KIT = () => CUR().kit;
  const dua = () => { const s = shuffle(KIT().NAMA.slice()); return [s[0], s[1]]; };
  const bendaN = (n) => shuffle(KIT().BENDA.slice()).slice(0, n);
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  // pilihan bilangan: jawaban + pengecoh dekat (negatif hanya bila neg), lalu diubah ke teks dengan show
  function num(ans, near, { neg = false, show = fmt } = {}) {
    const set = new Set([ans]); let guard = 0;
    while (set.size < 4 && guard++ < 150) { const d = Math.round(near() * 1000) / 1000; if (d !== ans && Number.isFinite(d) && (neg || d >= 0)) set.add(d); }
    // cadangan bila pengecoh kurang: tetangga terdekat dengan langkah sesuai besar bilangan
    const st = Math.abs(ans) >= 1000 ? 1000 : Math.abs(ans) >= 100 ? 10 : Number.isInteger(ans) ? 1 : 0.1;
    for (let k = 1; set.size < 4 && k < 20; k++) [ans + k * st, ans - k * st].forEach((d) => { d = Math.round(d * 1000) / 1000; if (set.size < 4 && (neg || d >= 0)) set.add(d); });
    return { answer: show(ans), options: shuffle([...set]).map(show) };
  }
  // pilihan teks: jawaban + tiga pengecoh berbeda
  const mc = (answer, wrong) => ({ answer, options: shuffle([answer, ...shuffle([...new Set(wrong)].filter((w) => w !== answer)).slice(0, 3)]) });
  const cm = { show: (v) => `${fmt(v)} cm` };
  const SUB = '₀₁₂₃₄₅₆₇₈₉', sb = (n) => String(n).replace(/\d/g, (d) => SUB[d]);
  const pt = (a, b) => `(${f(a)}, ${f(b)})`;

  /* ---------- Model Batang (Cara Singapura): atur panjang batang sesuai cerita, lalu pilih jawaban ---------- */
  // baris = [nama, banyak kotak, label di atas batang, diatur anak?]; skala tetap 10 kotak agar panjang bisa dibandingkan
  const bm = (story, rows, ans, near, o = {}) => ({ story, rows: rows.map(([name, units, lbl, adj]) => ({ name, units, lbl: lbl === undefined ? '' : String(lbl), adj: !!adj })), unit: o.unit, ...num(ans, () => near() || -1, o) }); // pengecoh 0 tidak dipakai
  const BARANG = [['🎒', 'bags'], ['👟', 'shoes'], ['📚', 'storybooks'], ['🧺', 'baskets'], ['🚲', 'bicycles'], ['⌚', 'wristwatch']];
  const SUKA = ['reading 📖', 'sports ⚽', 'drawing 🎨', 'gardening 🌱'];
  const money = { show: rp };
  const BATANG = {
    2() {
      const [[e, b]] = bendaN(1), [A, B] = dua(), k = R(0, 2);
      if (k === 0) { const u = pick([2, 5, 10]), t = R(4, 8), a = R(1, t - 1);
        return bm(`There are ${t * u} ${b} ${e}. ${a * u} belong to ${A}, and the rest belong to ${B}. How many ${b} belong to ${B}?`, [['All', t, t * u], [A, a, a * u], [B, t - a, '?', 1]], (t - a) * u, () => pick([t * u + a * u, (t - a) * u + pick([-u, u, -1, 1]), a * u]), { unit: u }); }
      if (k === 1) { const u = pick([2, 5, 10]), a = R(1, 5), d = R(1, 4);
        return bm(`${A} has ${a * u} ${b} ${e}. ${B} has ${d * u} more than ${A}. How many ${b} does ${B} have?`, [[A, a, a * u], [B, a + d, '?', 1]], (a + d) * u, () => pick([Math.abs(a - d) * u, (a + d) * u + pick([-u, u, -1, 1]), d * u]), { unit: u }); }
      const x = R(2, 10), m = R(2, 5);
      return bm(`${A} has ${x} ${b} ${e}. ${B} has ${m} times as many ${A} as ${b}. How many ${b} does ${B} have?`, [[A, 1, x], [B, m, '?', 1]], m * x, () => pick([m + x, (m + 1) * x, (m - 1) * x, m * x + pick([-1, 1])]), { unit: x });
    },
    3() {
      const [[e, b]] = bendaN(1), [A, B] = dua(), x = R(2, 12), m = R(2, 6);
      if (Math.random() < 0.5) return bm(`${A} and ${B} have ${(m + 1) * x} ${b} ${e} altogether. The number of ${b} ${B} has is ${m} times the number ${b} ${A} has. How many ${b} does ${A} have?`, [[A, 1, '?'], [B, m, '', 1], ['All', m + 1, (m + 1) * x]], x, () => pick([m * x, (m + 1) * x - m, x + pick([-2, -1, 1, 2]), Math.round(((m + 1) * x) / m)]));
      return bm(`The number of ${b} ${B} has is ${m} times the number ${b} ${A} has. ${B} has ${(m - 1) * x} ${b} more than ${A}. How many ${b} does ${A} have?`, [[A, 1, '?'], [B, m, '', 1], ['Difference', m - 1, (m - 1) * x]], x, () => pick([(m - 1) * x, m * x, x + pick([-2, -1, 1, 2]), (m - 1) * x + m]));
    },
    4() {
      const [[e, b]] = bendaN(1), A = pick(KIT().NAMA), d = pick([3, 4, 5, 6, 8]), a = R(1, d - 1), x = R(2, 9), T = d * x;
      if (Math.random() < 0.35) return bm(`${fr(a, d)} of ${b}'s ${A} is ${a * x}. How many ${b} does ${A} have altogether?`, [[`${fr(a, d)} parts`, a, a * x], ['All', d, '?', 1]], T, () => pick([a * x * a, a * x + d, x * (d - 1), T + pick([-x, x])]));
      const rest = Math.random() < 0.5;
      return bm(`${A} has ${T} ${b} ${e}. ${fr(a, d)} parts are given to a friend. How many ${rest ? `${b} still with ${A}` : 'given away'}?`, [['All', d, T], [rest ? 'Left' : 'Given', rest ? d - a : a, '?', 1]], (rest ? d - a : a) * x, () => pick([a * x, (d - a) * x, x, T - a, T - d]));
    },
    5() {
      const [A, B] = dua(), [[e, b]] = bendaN(1), x = R(2, 12); let p, q;
      do { p = R(1, 4); q = R(p + 1, 6); } while (gcd(p, q) !== 1 || p + q > 10);
      if (Math.random() < 0.5) return bm(`The ratio of ${b} between ${A} and ${B} is ${p} : ${q}. Together they have ${(p + q) * x} ${b}. How many ${b} does ${B} have?`, [[A, p, ''], [B, q, '?', 1], ['Sum', p + q, (p + q) * x]], q * x, () => pick([p * x, (p + q) * x - q, q * x + pick([-x, x]), x * (q + 1)]));
      return bm(`The ratio of ${b} ${e} ${A} and ${B} is ${p} : ${q}. ${B} has ${(q - p) * x} more than ${A}. How many ${b} does ${A} have?`, [[A, p, '?'], [B, q, '', 1], ['Difference', q - p, (q - p) * x]], p * x, () => pick([q * x, (q - p) * x, p * x + pick([-x, x]), (q - p) * x * p + 1]));
    },
    6() {
      if (Math.random() < 0.5) { const [e, b] = pick(BARANG), pc = pick([10, 20, 25, 50]), n = 100 / pc, k = R(1, n - 1), u = pick([1000, 2000, 5000, 10000]);
        return bm(`The price of ${b} ${e} is ${rp(n * u)}. There's a ${k * pc}% discount. What's the price of the ${b} after the discount?`, [['Original price', n, rp(n * u)], ['Paid', n - k, '?', 1]], (n - k) * u, () => pick([k * u, (n - k) * u + pick([-u, u]), n * u - k * 1000, (n - k + 1) * u]), money); }
      const N = pick([20, 30, 40, 50, 60, 80, 100, 120]), pc = pick([10, 20, 25, 50].filter((p) => (N * p) % 100 === 0)), n = 100 / pc, k = R(1, n - 1), [act, em] = pick(SUKA).split(' '), y = (N * k) / n;
      return bm(`There are ${N} children. ${k * pc}% of them like ${act} ${em}. How many children like ${act}?`, [['All', n, N], ['Like ' + act, k, '?', 1]], y, () => pick([k * pc, N - y, y + pick([-N / n, N / n]), N / n]));
    },
    7() {
      const [e, b] = pick(BARANG), u = pick([2000, 5000, 10000, 20000]);
      if (Math.random() < 0.5) { const pc = pick([10, 20, 25]), n = 100 / pc, k = R(1, Math.min(4, n - 1)), y = (n - k) * u;
        return bm(`After a ${k * pc}% discount, the price of ${b} ${e} is ${rp(y)}. What was the price of the ${b} before the discount?`, [['Paid', n - k, rp(y)], ['Original price', n, '?', 1]], n * u, () => pick([Math.round((y * (100 + k * pc)) / 100), n * u + pick([-u, u]), y + k * pc * 1000, (n + 1) * u]), money); }
      const pc = pick([20, 25, 50]), n = 100 / pc, k = R(1, Math.min(n, 10 - n)), y = (n + k) * u;
      return bm(`The price of ${b} ${e} rose ${k * pc}% to ${rp(y)}. What was the price of the ${b} before it rose?`, [['Original price', n, '?'], ['New price', n + k, rp(y), 1]], n * u, () => pick([Math.round((y * (100 - k * pc)) / 100), n * u + pick([-u, u]), (n - 1) * u, y - k * pc * 1000]), money);
    },
  };

  /* ---------- Timbangan Seimbang: ubah nilai □ (atau x) sampai kiri dan kanan sama berat ---------- */
  // keping: BOX (benda misteri) atau { v, t } (berat dan labelnya). live: timbangan langsung bergerak saat nilainya diubah (kelas 1–2).
  const BOX = 'x';
  const kw = (v, t) => ({ v, t: t || fmt(v) });
  const bal = (L, Rt, ans, o = {}) => { const q = { L, R: Rt, ans, min: 0, max: 20, steps: [1], live: false, sym: '□', unit: '', ...o }; if (!o.eq && Math.random() < 0.3) [q.L, q.R] = [q.R, q.L]; return q; };
  const xs = (n) => Array(n).fill(BOX);
  const sideTxt = (s, sym, unit) => { const nx = s.filter((c) => c === BOX).length, w = s.filter((c) => c !== BOX); return [nx ? `${nx > 1 ? nx : ''}${sym}${unit ? ' ' + unit : ''}` : '', ...w.map((c, i) => ((i || nx) && c.v < 0 ? `(${c.t})` : c.t))].filter(Boolean).join(' + '); };
  const TIMBANG = {
    1() { if (Math.random() < 0.6) { const c = R(5, 20), a = R(1, c - 1); return bal(shuffle([BOX, kw(a)]), [kw(c)], c - a, { live: true }); }
      const a = R(2, 10), b = R(1, 10), d = R(1, a + b - 1); return bal([kw(a), kw(b)], shuffle([BOX, kw(d)]), a + b - d, { live: true }); },
    2() { const o = { live: true, max: 100, steps: [1, 10] };
      if (Math.random() < 0.5) { const c = R(20, 100), a = R(5, c - 5); return bal(shuffle([BOX, kw(a)]), [kw(c)], c - a, o); }
      const a = R(10, 50), b = R(10, 49), d = R(5, a + b - 5); return bal([kw(a), kw(b)], shuffle([BOX, kw(d)]), a + b - d, o); },
    3() { const k = R(0, 2);
      if (k === 0) { const a = R(2, 6), v = R(2, 10); return bal(xs(a), [kw(a * v)], v, { eq: `${a} × □ = ${a * v}` }); }
      if (k === 1) { const kg = R(1, 9); return bal([kw(kg * 1000, `${kg} kg`)], [BOX], kg * 1000, { unit: 'g', max: 10000, steps: [100, 1000] }); }
      const a = R(100, 500), v = R(50, 400), b = R(10, a + v - 10); return bal([kw(a), BOX], shuffle([kw(b), kw(a + v - b)]), v, { max: 1000, steps: [1, 10, 100] }); },
    4() { const k = R(0, 2);
      if (k === 0) { const kg = R(1, 5), g = R(1, 19) * 50; return bal([kw(kg * 1000, `${kg} kg`), kw(g, `${g} g`)], [BOX], kg * 1000 + g, { unit: 'g', max: 10000, steps: [10, 100, 1000] }); }
      if (k === 1) { const a = R(2, 9), v = R(2, 12), b = R(1, 20); return bal([...xs(a), kw(b)], [kw(a * v + b)], v, { eq: `${a} × □ + ${b} = ${a * v + b}`, max: 50, steps: [1, 10] }); }
      const kg = R(1, 9); return bal([kw(kg * 1000, `${kg} kg`)], [BOX], kg * 10, { unit: 'ons', k: 100, max: 100, steps: [1, 10] }); },
    5() { const k = R(0, 2);
      if (k === 0) { const kg = R(0, 4) + pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]); return bal([kw(kg * 1000, `${f(kg)} kg`)], [BOX], Math.round(kg * 1000), { unit: 'g', max: 10000, steps: [10, 100, 1000] }); }
      if (k === 1) { const a = R(5, 50) / 10, v = R(5, 50) / 10; return bal(shuffle([BOX, kw(a)]), [kw(Math.round((a + v) * 10) / 10)], v, { max: 10, steps: [0.1, 1] }); }
      const a = pick([2, 4, 5]), v = pick([0.2, 0.4, 0.5, 0.6, 0.8, 1.5, 2.5]); return bal(xs(a), [kw(Math.round(a * v * 10) / 10)], v, { eq: `${a} × □ = ${f(a * v)}`, max: 10, steps: [0.1, 1] }); },
    6() { if (Math.random() < 0.5) { const a = R(3, 6), c = R(1, a - 1), v = R(2, 9), b = R(1, 15); return bal([...xs(a), kw(b)], [...xs(c), kw((a - c) * v + b)], v, { max: 30, steps: [1, 10] }); }
      const b = nz(-9, 9), v = R(-10, 10); return bal([BOX, kw(b)], [kw(v + b)], v, { min: -20, max: 20, steps: [1, 10] }); },
    7() { const v = R(1, 12), o = { sym: 'x', max: 30, steps: [1, 10] };
      if (Math.random() < 0.6) { const a = R(3, 7), c = R(1, a - 1), b = R(1, 20); return bal([...xs(a), kw(b)], [...xs(c), kw((a - c) * v + b)], v, o); }
      const a = R(2, 4), b = R(1, 9); return bal([].concat(...Array(a).fill([BOX, kw(b)])), [kw(a * (v + b))], v, { ...o, eq: `${a}(x + ${b}) = ${a * (v + b)}` }); },
    9() { const v = nz(-8, 15), a = R(4, 9), c = R(1, a - 1), b = R(-15, 25), d = (a - c) * v + b;
      return bal([...xs(a), ...(b ? [kw(b)] : [])], [...xs(c), kw(d)], v, { sym: 'x', min: -20, max: 20, steps: [1, 10] }); },
  };

  /* ---------- Harta Karun Koordinat: ketuk titik pada kisi, atau baca koordinat harta ---------- */
  const PETA = {
    5() { const a = R(0, 7), b = R(0, 7);
      if (Math.random() < 0.6) return { mode: 'tap', min: 0, max: 7, ask: `The treasure is buried at point <b>${pt(a, b)}</b>. Tap the point!`, ans: [a, b] };
      return { mode: 'read', min: 0, max: 7, ask: 'At which point is the treasure 💎?', marks: [{ x: a, y: b, gem: 1 }], ...mc(pt(a, b), [pt(b, a), pt(a + 1, b), pt(a, b + 1), pt(Math.abs(a - 1), b), pt(a, Math.abs(b - 1))]) }; },
    6() { const a = nz(-4, 4), b = nz(-4, 4);
      if (Math.random() < 0.6) return { mode: 'tap', min: -4, max: 4, ask: `The treasure is buried at point <b>${pt(a, b)}</b>. Tap the point!`, ans: [a, b] };
      return { mode: 'read', min: -4, max: 4, ask: 'At which point is the treasure 💎?', marks: [{ x: a, y: b, gem: 1 }], ...mc(pt(a, b), [pt(b, a), pt(-a, b), pt(a, -b), pt(-a, -b), pt(b, -a)]) }; },
    8() { const a = nz(-4, 4), b = nz(-4, 4), k = R(0, 3); let txt, ans;
      if (k === 0) { txt = 'reflected across the x-axis'; ans = [a, -b]; }
      else if (k === 1) { txt = 'reflected across the y-axis'; ans = [-a, b]; }
      else if (k === 2) { txt = 'rotated 180° about the point O(0, 0)'; ans = [-a, -b]; }
      else { let dx, dy; do { dx = nz(-4, 4); dy = nz(-4, 4); } while (Math.abs(a + dx) > 5 || Math.abs(b + dy) > 5);
        txt = `shifted ${Math.abs(dx)} units ${dx > 0 ? 'right' : 'left'} and ${Math.abs(dy)} units ${dy > 0 ? 'top' : 'bottom'}`; ans = [a + dx, b + dy]; }
      return { mode: 'tap', min: -5, max: 5, ask: `Point A${pt(a, b)} is ${txt}. Tap its image, A′.`, marks: [{ x: a, y: b, lbl: 'A' }], ans }; },
    10() { const inR = (p) => p.every((v) => Math.abs(v) <= 5);
      if (Math.random() < 0.5) { let A, B, M; do { A = [R(-5, 5), R(-5, 5)]; M = [R(-4, 4), R(-4, 4)]; B = [2 * M[0] - A[0], 2 * M[1] - A[1]]; } while (!inR(B) || (A[0] === M[0] && A[1] === M[1]));
        return { mode: 'tap', min: -5, max: 5, ask: `Tap the midpoint of segment AB.`, marks: [{ x: A[0], y: A[1], lbl: 'A' }, { x: B[0], y: B[1], lbl: 'B' }], segs: [[A, B]], ans: M }; }
      let A, B, C, D; do { A = [R(-5, 5), R(-5, 5)]; B = [R(-5, 5), R(-5, 5)]; C = [R(-5, 5), R(-5, 5)]; D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]]; } while (!inR(D) || (B[0] - A[0]) * (C[1] - A[1]) === (B[1] - A[1]) * (C[0] - A[0]) || Math.hypot(B[0] - A[0], B[1] - A[1]) < 2 || Math.hypot(C[0] - B[0], C[1] - B[1]) < 2);
      return { mode: 'tap', min: -5, max: 5, ask: 'ABCD is a parallelogram. Tap point D.', marks: [{ x: A[0], y: A[1], lbl: 'A' }, { x: B[0], y: B[1], lbl: 'B' }, { x: C[0], y: C[1], lbl: 'C' }], segs: [[A, B], [B, C]], ans: D }; },
  };

  /* ---------- Bangun Bilangan: ketuk balok ribuan, ratusan, puluhan, satuan sampai menjadi bilangan sasaran ---------- */
  // kinds = [tampilan balok, nilai, nama]; kelas 5: 1 = pelat, 0,1 = batang, 0,01 = kubus kecil (nilai disimpan dalam perseratus)
  const KIND = { k: ['k', 1000, 'Thousands'], r: ['r', 100, 'Hundreds'], p: ['p', 10, 'Tens'], s: ['s', 1, 'Ones'] };
  const nb = (target, ask, keys, o = {}) => ({ target, ask: `Build the number ${ask}`, kinds: keys.split('').map((c) => KIND[c]), show: fmt, total: false, ...o });
  const urai = (n) => String(n).split('').map((d, i, a) => (d === '0' ? null : fmt(+d * 10 ** (a.length - 1 - i)))).filter(Boolean).join(' + ');
  const NILAI = {
    '-1'() { const n = R(11, 20); return nb(n, `<b>${n}</b>`, 'ps', { total: true }); },
    1() { const n = R(10, 99); return nb(n, Math.random() < 0.3 ? `<b>${KIT().kata(n)}</b>` : `<b>${n}</b>`, 'ps', { total: true }); },
    2() { const n = R(100, 999), k = R(0, 2); return nb(n, k === 0 ? `<b>${n}</b>` : k === 1 ? `<b>${KIT().kata(n)}</b>` : `<b>${urai(n)}</b>`, 'rps'); },
    3() { const k = R(0, 2);
      if (k === 2) { const d = pick([10, 100, 1000]), up = Math.random() < 0.5, m = up ? R(1000, 9999 - d) : R(1000 + d, 9999); return nb(up ? m + d : m - d, `that are <b>${fmt(d)} ${up ? 'more than' : 'less than'} ${fmt(m)}</b>`, 'krps'); }
      const n = R(1000, 9999); return nb(n, k ? `<b>${KIT().kata(n)}</b>` : `<b>${fmt(n)}</b>`, 'krps'); },
    4() { const k = R(0, 2);
      if (k === 0) { const n = R(10, 16) * 100 + R(0, 9) * 10 + R(0, 9); return nb(n, `<b>${fmt(n)}</b> without thousands blocks`, 'rps'); }
      if (k === 1) { const n = R(10, 19) * 10 + R(0, 9); return nb(n, `<b>${n}</b> without hundreds blocks`, 'ps'); }
      const n = R(1000, 9999); return nb(n, `<b>${KIT().kata(n)}</b>`, 'krps'); },
    5() { const a = R(0, 9), b = R(0, 9), c = R(1, 9), n = a * 100 + b * 10 + c;
      return { ...nb(n, Math.random() < 0.6 ? `<b>${f(n / 100)}</b>` : `<b>${[a ? a : '', b ? fr(b, 10) : '', fr(c, 100)].filter(Boolean).join(' + ')}</b>`, ''), kinds: [['r', 100, 'Ones'], ['p', 10, 'Tenths'], ['s', 1, 'Hundredths']], show: (v) => f(v / 100) }; },
  };

  /* ---------- Berburu Bangun (ketuk semua bangun yang diminta) dan Jaring-jaring Kubus ---------- */
  const ring = (n, rx = 1, ry = 1, from = 0, to = 360) => [...Array(n)].map((_, i) => { const a = ((from + ((to - from) * i) / (n - (to - from < 360 ? 1 : 0))) * Math.PI) / 180; return [rx * Math.cos(a), ry * Math.sin(a)]; });
  const reg = (n) => ring(n, 1, 1, -90, 270);
  // setiap bangun: titik sudut, banyak sisi, punya sudut siku-siku?
  const SHAPE = {
    "circle": () => [ring(48), 0, false], oval: () => [ring(48, 1, 0.58), 0, false], 'setengah lingkaran': () => [ring(25, 1, 1, 180, 360), 0, false],
    'segitiga sama sisi': () => [reg(3), 3, false], 'segitiga siku-siku': () => [[[0, 0], [1.2, 0], [0, -R(7, 11) / 10]], 3, true],
    'segitiga sama kaki': () => [[[0, 0], [1, 0], [0.5, -1.3]], 3, false], 'segitiga sembarang': () => [[[0, 0], [1, 0], [0.25, -0.8]], 3, false],
    "square": () => [[[0, 0], [1, 0], [1, 1], [0, 1]], 4, true], 'persegi panjang': () => { const r = R(16, 22) / 10; return [[[0, 0], [r, 0], [r, 1], [0, 1]], 4, true]; },
    'segi lima': () => [reg(5), 5, false], 'segi enam': () => [reg(6), 6, false],
    'trapesium sama kaki': () => [[[0, 0], [1.7, 0], [1.25, -0.8], [0.45, -0.8]], 4, false], 'trapesium siku-siku': () => [[[0, 0], [1.6, 0], [1, -0.9], [0, -0.9]], 4, true],
    jajargenjang: () => [[[0, 0], [1.4, 0], [1.95, -0.8], [0.55, -0.8]], 4, false], 'belah ketupat': () => [[[0, -1], [0.62, 0], [0, 1], [-0.62, 0]], 4, false],
    'layang-layang': () => [[[0, -0.7], [0.6, 0], [0, 1.3], [-0.6, 0]], 4, false],
  };
  const SEGI3 = ['equilateral triangle', 'right triangle', 'isosceles triangle', 'scalene triangle'];
  const SEGI4 = ['square', 'rectangle', 'isosceles trapezoid', 'right trapezoid', 'parallelogram', 'rhombus', 'kite'];
  const SH_COL = ['#fb7185', '#38bdf8', '#facc15', '#4ade80', '#a78bfa', '#fb923c', '#2dd4bf'];
  function shapeSVG(kind, turn) {
    const [P] = SHAPE[kind](), a = (turn * Math.PI) / 180, Q = P.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]);
    const xs0 = Q.map((p) => p[0]), ys0 = Q.map((p) => p[1]), w = Math.max(...xs0) - Math.min(...xs0), h = Math.max(...ys0) - Math.min(...ys0), s = 74 / Math.max(w, h, 0.01);
    const cx = (Math.max(...xs0) + Math.min(...xs0)) / 2, cy = (Math.max(...ys0) + Math.min(...ys0)) / 2;
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M${Q.map(([x, y]) => `${(50 + (x - cx) * s).toFixed(1)} ${(50 + (y - cy) * s).toFixed(1)}`).join('L')}Z" fill="${pick(SH_COL)}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`;
  }
  // perintah: [teks, bangun yang benar, bangun pengecoh]
  const KIDS3 = ['circle', 'equilateral triangle', 'square'];
  const BD_ASK = {
    '-2': [['circle', ['circle'], ['equilateral triangle', 'square']], ['triangle', ['equilateral triangle', 'isosceles triangle'], ['circle', 'square']], ['square', ['square'], ['circle', 'equilateral triangle']]],
    '-1': [['circle', ['circle'], ['oval', 'equilateral triangle', 'square']], ['triangle', ['equilateral triangle', 'isosceles triangle', 'right triangle'], ['circle', 'square', 'rectangle']], ['square', ['square'], ['rectangle', 'circle', 'equilateral triangle']], ['rectangle', ['rectangle'], ['circle', 'equilateral triangle', 'oval']]],
    1: [['circle', ['circle'], ['oval', 'semicircle', 'hexagon', 'square']], ['triangle', SEGI3, ['square', 'circle', 'semicircle', 'rhombus']], ['square', ['square'], ['rectangle', 'rhombus', 'circle', 'equilateral triangle']], ['rectangle', ['rectangle'], ['parallelogram', 'oval', 'right triangle', 'circle']]],
    2: [['pentagon', ['pentagon'], ['hexagon', 'square', 'equilateral triangle', 'circle']], ['hexagon', ['hexagon'], ['pentagon', 'circle', 'rectangle', 'isosceles trapezoid']], ['trapezoid', ['isosceles trapezoid', 'right trapezoid'], ['equilateral triangle', 'pentagon', 'circle', 'oval']], ['shapes with 4 sides', ['square', 'rectangle', 'isosceles trapezoid'], ['isosceles triangle', 'pentagon', 'hexagon', 'circle']], ['shapes with 3 sides', SEGI3, ['square', 'pentagon', 'semicircle', 'isosceles trapezoid']]],
    3: [['quadrilateral', SEGI4, [...SEGI3, 'pentagon', 'hexagon', 'circle']], ['triangle', SEGI3, ['square', 'rhombus', 'pentagon', 'semicircle', 'kite']], ['shapes with 5 or more sides', ['pentagon', 'hexagon'], [...SEGI3, 'square', 'isosceles trapezoid', 'circle']]],
    4: [['shapes with a right angle', ['square', 'rectangle', 'right triangle', 'right trapezoid'], ['equilateral triangle', 'isosceles triangle', 'parallelogram', 'rhombus', 'pentagon', 'hexagon', 'isosceles trapezoid', 'circle']],
      ['right triangle', ['right triangle'], ['equilateral triangle', 'isosceles triangle', 'scalene triangle', 'right trapezoid']], ['parallelogram', ['parallelogram'], ['isosceles trapezoid', 'right trapezoid', 'kite', 'scalene triangle']],
      ['rhombus', ['rhombus'], ['kite', 'parallelogram', 'rectangle', 'isosceles trapezoid']], ['kite', ['kite'], ['rhombus', 'parallelogram', 'isosceles trapezoid', 'isosceles triangle']]],
  };
  function bdTap(gr) {
    const [ask, yes, no] = pick(BD_ASK[gr]), k = R(2, 4), turn = gr <= 1 ? () => R(-12, 12) : () => R(0, 359);
    const items = shuffle([...[...Array(k)].map(() => [pick(yes), true]), ...[...Array(9 - k)].map(() => [pick(no), false])]).map(([kind, ok]) => ({ svg: shapeSVG(kind, turn()), ok }));
    return { mode: 'tap', ask: `Tap all the <b>${ask}</b>`, items };
  }
  // Jaring-jaring: enam persegi; kubus digelindingkan di atas jaring, sisi yang menyentuh tiap persegi dicatat.
  // Jaring kubus sah jika keenam sisi berbeda. Sisi berhadapan: 0–1 (bawah–atas), 2–3, 4–5.
  const ROLL = [[1, 0, (o) => ({ ...o, D: o.E, E: o.U, U: o.W, W: o.D })], [-1, 0, (o) => ({ ...o, D: o.W, W: o.U, U: o.E, E: o.D })],
    [0, 1, (o) => ({ ...o, D: o.S, S: o.U, U: o.N, N: o.D })], [0, -1, (o) => ({ ...o, D: o.N, N: o.U, U: o.S, S: o.D })]];
  function fold(cells) {
    const idx = new Map(cells.map((p, i) => [p.join(), i])), face = Array(cells.length).fill(-1), has = (x, y) => idx.has(x + ',' + y);
    if (cells.some(([x, y]) => has(x + 1, y) && has(x, y + 1) && has(x + 1, y + 1))) return null;
    face[0] = 0; const st = [[0, { D: 0, U: 1, N: 2, S: 3, E: 4, W: 5 }]];
    while (st.length) { const [i, o] = st.pop(), [x, y] = cells[i]; ROLL.forEach(([dx, dy, r]) => { const j = idx.get(x + dx + ',' + (y + dy)); if (j === undefined || face[j] >= 0) return; const o2 = r(o); face[j] = o2.D; st.push([j, o2]); }); }
    return new Set(face).size === 6 ? face : null;
  }
  function hexo() {
    const c = [[0, 0]];
    while (c.length < 6) { const [x, y] = pick(c), [dx, dy] = pick(ROLL), p = [x + dx, y + dy]; if (!c.some((q) => q[0] === p[0] && q[1] === p[1])) c.push(p); }
    const mx = Math.min(...c.map((p) => p[0])), my = Math.min(...c.map((p) => p[1]));
    return c.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  }
  const netKey = (c) => c.map((p) => p.join()).join(';');
  const netSVG = (c) => { const w = Math.max(...c.map((p) => p[0])) + 1, h = Math.max(...c.map((p) => p[1])) + 1; return `<svg viewBox="-2 -2 ${w * 20 + 4} ${h * 20 + 4}" aria-hidden="true">${c.map(([x, y]) => `<rect x="${x * 20}" y="${y * 20}" width="20" height="20" rx="2" fill="#fde68a" stroke="#b45309" stroke-width="1.6"/>`).join('')}</svg>`; };
  function bdNets(minOk) {
    const want = R(minOk, 3), seen = new Set(), ok = [], bad = [];
    while (ok.length < want || bad.length < 4 - want) { const c = hexo(), k = netKey(c); if (seen.has(k)) continue; seen.add(k); const v = !!fold(c); if (v && ok.length < want) ok.push(c); else if (!v && bad.length < 4 - want) bad.push(c); }
    return { mode: 'nets', ask: 'Tap all the <b>cube nets</b>', items: shuffle([...ok.map((c) => ({ svg: netSVG(c), ok: true })), ...bad.map((c) => ({ svg: netSVG(c), ok: false }))]) };
  }
  function bdOpp() {
    let c, face; do { c = hexo(); face = fold(c); } while (!face);
    const star = R(0, 5);
    return { mode: 'opp', ask: 'This net folds into a cube. Tap the face <b>opposite</b> the ★', cells: c, star, ans: face.indexOf(face[star] ^ 1) };
  }
  const BANGUN = { '-2': () => bdTap(-2), '-1': () => bdTap(-1), 1: () => bdTap(1), 2: () => bdTap(2), 3: () => bdTap(3), 4: () => bdTap(4),
    5: () => bdNets(1), 6: () => (Math.random() < 0.5 ? bdNets(1) : bdOpp()), 8: () => (Math.random() < 0.35 ? bdNets(1) : bdOpp()) };

  /* ---------- Ukur dan Baca: penggaris, gelas ukur, timbangan jarum, termometer, busur. Tebak Sudut: makin dekat makin banyak poin ---------- */
  const UKUR = {
    1() { const e = R(2, 12); return { kind: 'ruler', N: 12, s: 0, e: e * 10, obj: pick(['pita', 'pencils']), ...num(e, () => e + pick([-2, -1, 1, 2]), cm) }; },
    2() { if (Math.random() < 0.6) { const s = R(1, 5), L = R(2, 9); return { kind: 'ruler', N: 15, s: s * 10, e: (s + L) * 10, obj: pick(['pita', 'pencils']), ...num(L, () => pick([s + L, s, L + pick([-1, 1])]), cm) }; }
      const e = R(5, 15); return { kind: 'ruler', N: 15, s: 0, e: e * 10, obj: 'pencils', ...num(e, () => e + pick([-2, -1, 1, 2]), cm) }; },
    3() { if (Math.random() < 0.6) { const big = Math.random() < 0.5, cap = big ? 1000 : 500, tick = big ? 100 : 50, v = R(1, cap / tick - 1) * tick;
        return { kind: 'cup', cap, tick, lab: tick * 2, v, unit: 'mL', lbl: fmt, ...num(v, () => v + pick([-tick, tick, -2 * tick, 2 * tick, tick / 2]), { show: (n) => `${fmt(n)} mL` }) }; }
      return UKUR[2](); },
    4() { if (Math.random() < 0.5) { let mm; do mm = R(15, 99); while (mm % 10 === 0); const c = Math.floor(mm / 10), m = mm % 10, t = (a, b) => `${a} cm ${b} mm`;
        return { kind: 'ruler', N: 10, mm: true, s: 0, e: mm, obj: pick(['pita', 'pencils']), ...mc(t(c, m), [t(c, m + 1 > 9 ? m - 2 : m + 1), t(c + 1, m), t(c, Math.max(1, m - 1)), m !== c && m ? t(m, c) : t(c - 1 || c + 2, m)]) }; }
      const v = R(1, 19) * 50; return { kind: 'dial', cap: 1000, tick: 50, lab: 100, v, unit: 'g', lbl: fmt, ...num(v, () => v + pick([-50, 50, -100, 100, 25]), { show: (n) => `${fmt(n)} g` }) }; },
    5() { if (Math.random() < 0.5) { let v; do v = R(1, 24) * 2; while (v % 10 === 0); return { kind: 'thermo', min: 0, max: 50, tick: 2, lab: 10, v, ...num(v, () => v + pick([-2, 2, -1, 1, 10]), { show: (n) => `${f(n)} °C` }) }; }
      const v = R(1, 19) * 100; return { kind: 'cup', cap: 2000, tick: 100, lab: 500, v, unit: 'L', lbl: (n) => f(n / 1000), ...num(v, () => v + pick([-100, 100, -200, 200, 50]), { show: (n) => `${f(n / 1000)} L` }) }; },
    6() { if (Math.random() < 0.6) { const a = R(2, 34) * 5; return { kind: 'busur', a, ...num(a, () => pick([180 - a, a + 5, a - 5, a + 10, a - 10]), { show: (n) => `${n}°` }) }; }
      let v; do v = R(-10, 15) * 2; while (!v || v % 10 === 0); return { kind: 'thermo', min: -20, max: 30, tick: 2, lab: 10, v, ...num(v, () => pick([-v, v + 2, v - 2, v + 10]), { neg: true, show: (n) => `${f(n)} °C` }) }; },
    7() { return { kind: 'tebak', a: R(10, 170), base: 0, tol: [5, 15] }; },
    10() { return { kind: 'tebak', a: R(5, 175), base: R(0, 359), tol: [3, 10] }; },
  };

  /* ---------- Baca Grafik: piktogram, diagram batang, diagram garis, diagram lingkaran, statistika, grafik garis lurus ---------- */
  const GF_COL = ['#38bdf8', '#f472b6', '#facc15', '#4ade80', '#a78bfa'];
  function gfQ(cats, st, withSum) {
    const nm = (c) => `${c.e} ${c.n}`, [A, B] = shuffle(cats.slice()), k = pick(['n', 'n', 'd', 'm', ...(withSum ? ['s'] : [])]);
    if (k === 'n') return { q: `How many ${nm(A)}?`, ...num(A.v, () => A.v + pick([-2, -1, 1, 2]) * st) };
    if (k === 'd') { const [P, Q] = A.v > B.v ? [A, B] : [B, A], d = P.v - Q.v; return { q: `How many more ${nm(P)} than ${nm(Q)}?`, ...num(d, () => pick([P.v, P.v + Q.v, d + st, d - st])) }; }
    if (k === 's') return { q: `What's the total of ${nm(A)} and ${nm(B)}?`, ...num(A.v + B.v, () => A.v + B.v + pick([-2, -1, 1, 2]) * st) };
    const big = Math.random() < 0.5, best = cats.reduce((p, c) => ((big ? c.v > p.v : c.v < p.v) ? c : p));
    return { q: `Which one has the ${big ? 'most' : 'fewest'}?`, ...mc(nm(best), cats.map(nm)) };
  }
  const gfCats = (n, vals) => bendaN(n).map(([e, nm], i) => ({ e, n: nm, v: vals[i] }));
  const GRAFIK = {
    2() { const cats = gfCats(4, shuffle(range(1, 9)).slice(0, 4)); return { kind: 'pikto', key: 1, title: `${pick(KIT().NAMA)}'s stickers`, cats, ...gfQ(cats, 1, false) }; },
    3() { const key = pick([2, 5]), cats = gfCats(4, shuffle(range(key, key * 8, key)).slice(0, 4)); return { kind: 'pikto', key, title: `${pick(KIT().NAMA)}'s stickers`, cats, ...gfQ(cats, key, true) }; },
    4() { const sc = pick([2, 5, 10]), st = sc === 5 ? 5 : sc / 2, cats = gfCats(5, shuffle(range(st, sc * 8, st)).slice(0, 5)), top = Math.ceil(Math.max(...cats.map((c) => c.v)) / sc) * sc;
      return { kind: 'batang', title: `${pick(KIT().NAMA)}'s stickers`, cats, top, step: sc, ...gfQ(cats, st, true) }; },
    5() { const xs0 = ['06.00', '08.00', '10.00', '12.00', '14.00', '16.00']; let vs; do { vs = [R(10, 13) * 2]; while (vs.length < 6) vs.push(Math.max(18, Math.min(36, vs[vs.length - 1] + pick([-4, -2, 0, 2, 4])))); } while (new Set(vs).size < 3);
      const top = Math.max(...vs), base = { kind: 'garis', title: 'Today\'s air temperature (°C)', xs: xs0, vs, lo: 16, hi: 38, step: 2 }, k = R(0, 2), deg = { show: (n) => `${f(n)} °C` };
      if (k === 0) { const i = R(0, 5); return { ...base, q: `What's the temperature at ${xs0[i]}?`, ...num(vs[i], () => vs[i] + pick([-2, 2, -1, 1, 4]), deg) }; }
      if (k === 1 && vs.filter((v) => v === top).length === 1) return { ...base, q: 'At what time is the temperature highest?', ...mc(xs0[vs.indexOf(top)], xs0) };
      let i, j; do { i = R(0, 4); j = R(i + 1, 5); } while (vs[i] === vs[j]);
      return { ...base, q: `What's the temperature difference between ${xs0[i]} and ${xs0[j]}?`, ...num(Math.abs(vs[j] - vs[i]), () => pick([vs[i], vs[j], Math.abs(vs[j] - vs[i]) + pick([-2, 2])]), deg) }; },
    6() { const P = pick([[50, 25, 25], [40, 30, 20, 10], [50, 30, 20], [35, 25, 20, 20], [45, 30, 15, 10], [40, 35, 25], [60, 25, 15]]), N = pick([20, 40, 60, 80, 100, 120, 200]);
      const acts = shuffle([['⚽', 'soccer'], ['📖', 'reading'], ['🎨', 'drawing'], ['🌱', 'gardening'], ['🏊', 'swimming']]).slice(0, P.length), cats = acts.map(([e, n], i) => ({ e, n, p: P[i] }));
      const i = R(0, cats.length - 1), c = cats[i], base = { kind: 'circle', title: `Favorite activities of ${N} students`, cats, hide: -1 };
      if (Math.random() < 0.6) return { ...base, q: `How many students like ${c.e} ${c.n}?`, ...num((N * c.p) / 100, () => pick([c.p, (N * c.p) / 100 + pick([-N / 20, N / 20]), N - (N * c.p) / 100, (N * c.p) / 50])) };
      return { ...base, hide: i, q: `What percent of students like ${c.e} ${c.n}?`, ...num(c.p, () => c.p + pick([-10, -5, 5, 10]), { show: (n) => `${n}%` }) }; },
    7() { const names = shuffle(KIT().NAMA.slice()).slice(0, 5), k = R(0, 3); let v;
      if (k === 3) { v = shuffle(range(1, 12)).slice(0, 4); v = shuffle([...v, v[R(0, 3)]]); }
      else { do { v = [...Array(4)].map(() => R(1, 12)); const need = (5 - (v.reduce((a, b) => a + b, 0) % 5)) % 5; v.push(pick([need, need + 5, need + 10].filter((x) => x >= 1 && x <= 12))); } while (v.some((x) => !x)); }
      const cats = names.map((n, i) => ({ e: n, n, v: v[i] })), base = { kind: 'batang', title: 'Number of books read this month', cats, top: 12, step: 2, names: true }, s = v.slice().sort((a, b) => a - b), sum = v.reduce((a, b) => a + b, 0);
      if (k === 0) return { ...base, q: 'What\'s the average number of books read?', ...num(sum / 5, () => pick([s[2], sum / 5 + pick([-1, 1, 2]), sum, s[4] - s[0]])) };
      if (k === 1) return { ...base, q: 'What\'s the median (middle value) of the data?', ...num(s[2], () => pick([v[2], sum / 5, s[1], s[3]])) };
      if (k === 2) return { ...base, q: 'What\'s the range of the data (largest − smallest)?', ...num(s[4] - s[0], () => pick([s[4], s[4] + s[0], s[4] - s[0] + pick([-1, 1])])) };
      const mo = v.find((x, i) => v.indexOf(x) !== i); return { ...base, q: 'What\'s the mode (most frequent value)?', ...num(mo, () => pick([s[2], s[4], Math.round(sum / 5), s[0]])) }; },
    9() { const [a, d] = pick([[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1], [1, 2], [-1, 2], [1, 3], [2, 3], [-2, 3], [3, 2]]); let c; do c = R(-3, 3); while (Math.abs(c + a) > 5 || Math.abs(c - a) > 5);
      const mt = (n, dd) => (dd === 1 ? f(n) : `${n < 0 ? '−' : ''}${fr(Math.abs(n), dd)}`), co = (n, dd) => (dd === 1 && Math.abs(n) === 1 ? (n < 0 ? '−' : '') : mt(n, dd));
      const eq = (n, dd, cc) => `y = ${co(n, dd)}x${cc ? ` ${cc < 0 ? '−' : '+'} ${Math.abs(cc)}` : ''}`, base = { kind: 'lurus', a, d, c, title: 'Straight-line graph' }, k = R(0, 2);
      if (k === 0) return { ...base, q: 'What is the slope of this line?', ...mc(mt(a, d), [mt(-a, d), mt(d * Math.sign(a), Math.abs(a)), mt(c || a + 1, 1), mt(a + Math.sign(a) * d, d)]) };
      if (k === 1) return { ...base, q: 'At which point does the line cross the y-axis?', ...mc(pt(0, c), [pt(c, 0), pt(0, -c), pt(0, c + 1), pt(0, c - 1)]) };
      return { ...base, q: 'The equation of this line is …', ...mc(eq(a, d, c), [eq(-a, d, c), eq(a, d, -c), eq(c || 1, 1, a), eq(d * Math.sign(a), Math.abs(a), c)]) }; },
  };

  /* ---------- Pola dan Barisan: lengkapi bagian yang hilang ---------- */
  const PIC = [['🔴', '🔵', '🟡', '🟢'], ['🍎', '🍌', '🍇', '🍊'], ['⭐', '🌙', '☀️', '☁️'], ['🐱', '🐟', '🐤', '🐰'], ['🟥', '🔺', '⚪', '🔷']];
  function plPic(units) {
    const set = pick(PIC), u = pick(units).split('').map((c) => set[c.charCodeAt(0) - 65]), len = Math.min(10, Math.max(6, u.length * 2 + R(0, u.length)));
    const seq = [...Array(len)].map((_, i) => u[i % u.length]), blank = Math.random() < 0.6 ? len - 1 : R(Math.floor(len / 2), len - 1);
    return { seq: seq.map((v, i) => (i === blank ? null : v)), pic: true, ...mc(seq[blank], set) };
  }
  // barisan bilangan dengan satu kotak kosong (kosong di tengah lebih sulit daripada di akhir)
  function plNum(seq, near, o = {}) { const blank = o.mid ? R(1, seq.length - 2) : Math.random() < 0.5 ? seq.length - 1 : R(1, seq.length - 1); return { seq: seq.map((v, i) => (i === blank ? null : fmt(v))), ...num(seq[blank], near(seq[blank]), o) }; }
  const arit = (a, b, n = 6) => [...Array(n)].map((_, i) => a + i * b), geo = (a, r, n = 6) => [...Array(n)].map((_, i) => a * r ** i);
  const ask = (seq, q, o) => ({ seq: [...seq.map(fmt), '…'], q, ...o });
  const POLA = {
    '-2': () => plPic(['AB', 'AB', 'AAB', 'ABB']),
    '-1': () => (Math.random() < 0.6 ? plPic(['ABC', 'AABB', 'AAB', 'ABB']) : plNum(arit(R(1, 12), 1), (v) => () => v + pick([-1, 1, 2]))),
    1() { const k = R(0, 2); if (k === 0) return plPic(['ABC', 'AABB', 'ABBC', 'AABC']);
      if (k === 1) { const s = pick([2, 5, 10]); return plNum(arit(R(0, 4) * s, s), (v) => () => v + pick([-s, s, 1, -1])); }
      return plNum(arit(R(10, 30), -1), (v) => () => v + pick([-1, 1, 2])); },
    2() { const b = R(2, 10) * pick([1, 1, -1]), a = b > 0 ? R(0, 100) : R(-b * 5, 150); return plNum(arit(a, b), (v) => () => v + pick([-b, b, 1, -1, 10])); },
    3() { const k = R(0, 2);
      if (k === 0) { const b = R(3, 25) * pick([1, -1]), a = b > 0 ? R(0, 200) : R(-b * 5, 300); return plNum(arit(a, b), (v) => () => v + pick([-b, b, 1, -1, 10])); }
      if (k === 1) { const r = pick([2, 3]), a = R(1, r === 2 ? 6 : 3); return plNum(geo(a, r), (v) => () => pick([v + a, v * r, v / r, v + r, v - r])); }
      const p = R(3, 9), m = R(1, p - 1), s = [R(1, 20)]; while (s.length < 7) s.push(s[s.length - 1] + (s.length % 2 ? p : -m));
      return plNum(s, (v) => () => v + pick([p, -m, p - m, -p])); },
    4() { const k = R(0, 2);
      if (k === 0) { const b = pick([25, 50, 100, 125, 250]), a = R(1, 20) * 25; return plNum(arit(a, b), (v) => () => v + pick([-b, b, 25, -25]), { mid: true }); }
      if (k === 1) { const r = pick([2, 3, 4]), a = R(1, 3); return plNum(geo(a, r, 5), (v) => () => pick([v * r, v / r, v + r, v + a * r, v - 1]), { mid: true }); }
      const p = R(4, 12), m = R(1, p - 1), s = [R(5, 40)]; while (s.length < 7) s.push(s[s.length - 1] + (s.length % 2 ? p : -m));
      return plNum(s, (v) => () => v + pick([p, -m, p - m, m - p]), { mid: true }); },
    5() { const k = R(0, 2);
      if (k === 0) { const o = R(1, 5), s = [...Array(6)].map((_, i) => (o + i) ** 2); return plNum(s, (v) => () => pick([v + 1, v - 1, Math.round(Math.sqrt(v)) * 2, v + 2 * Math.round(Math.sqrt(v))])); }
      if (k === 1) { const o = R(1, 4), s = [...Array(6)].map((_, i) => ((o + i) * (o + i + 1)) / 2); return plNum(s, (v) => () => v + pick([-2, -1, 1, 2, 3])); }
      const b = pick([0.1, 0.2, 0.25, 0.5]), a = R(0, 20) / 10; return plNum(arit(a, b).map((v) => Math.round(v * 100) / 100), (v) => () => Math.round((v + pick([-b, b, 0.1, -0.1, 1])) * 100) / 100); },
    6() { const k = R(0, 2), neg = true;
      if (k === 0) { const b = -R(2, 6), a = R(2, 12); return plNum(arit(a, b), (v) => () => pick([-v, v + b, v - b, v + 1]), { neg }); }
      if (k === 1) { const a = pick([3, 5, 7]) * 2 ** R(4, 5); return plNum(geo(a, 0.5, 6), (v) => () => pick([v * 2, v / 2, v + 2, v - 2, v + 1]), { neg }); }
      const a = R(1, 3); return plNum(geo(a, -2, 6), (v) => () => pick([-v, v * 2, -v * 2, v + 2]), { neg }); },
    7() { const a = R(-10, 20), b = nz(-6, 9), n = R(8, 25), u = a + (n - 1) * b;
      return ask(arit(a, b, 4), `Term ${n}, U${sb(n)} = <span class="pl-blank" id="plb">?</span>`, num(u, () => pick([a + n * b, u + b, u - b, n * b, a + (n + 1) * b]), { neg: true })); },
    8() { const k = R(0, 3), n = R(6, 15);
      if (k === 0) return ask([1, 4, 9, 16], `Square number pattern. U${sb(n)} = <span class="pl-blank" id="plb">?</span>`, num(n * n, () => pick([2 * n, n * n + n, (n - 1) ** 2, (n + 1) ** 2])));
      if (k === 1) return ask([2, 6, 12, 20], `Rectangle pattern n(n + 1). U${sb(n)} = <span class="pl-blank" id="plb">?</span>`, num(n * (n + 1), () => pick([n * n, (n + 1) * (n + 2), n * (n - 1), 2 * n + 2])));
      if (k === 2) return ask([1, 3, 6, 10], `Triangular number pattern. U${sb(n)} = <span class="pl-blank" id="plb">?</span>`, num((n * (n + 1)) / 2, () => pick([n * (n + 1), (n * (n - 1)) / 2, ((n + 1) * (n + 2)) / 2, n * n])));
      const fib = [1, 1]; while (fib.length < 9) fib.push(fib[fib.length - 1] + fib[fib.length - 2]); const s = R(0, 2), seq = fib.slice(s, s + 6);
      return plNum(seq, (v) => () => v + pick([-2, -1, 1, 2, 3])); },
    9() { const b = nz(-5, 6), a = R(-8, 12), c = a - b, lin2 = (p, q) => `${p === 1 ? '' : p === -1 ? '−' : f(p)}n${q ? ` ${q < 0 ? '−' : '+'} ${Math.abs(q)}` : ''}`;
      return ask(arit(a, b, 4), `Formula for the nth term: U<sub>n</sub> = <span class="pl-blank" id="plb">?</span>`, mc(lin2(b, c), [lin2(b, a), lin2(a || 2, b), lin2(b, -c || 1), lin2(-b, c + 2 * b), lin2(1, b)])); },
    11() { const k = R(0, 2);
      if (k === 0) { const r = pick([2, 3, -2, -3]), a = nz(-4, 5), n = R(6, 8), u = a * r ** (n - 1); return ask(geo(a, r, 4), `Geometric sequence. U${sb(n)} = <span class="pl-blank" id="plb">?</span>`, num(u, () => pick([a * r ** n, -u, u / r, a * r * (n - 1)]), { neg: true })); }
      if (k === 1) { const a = 64 * R(1, 3), n = R(6, 7), u = a / 2 ** (n - 1); return ask(geo(a, 0.5, 4), `Geometric sequence. U${sb(n)} = <span class="pl-blank" id="plb">?</span>`, num(u, () => pick([u * 2, u / 2, u + 2, a / (2 * n)]))); }
      const r = pick([2, 3]), a = R(1, 5), n = R(4, 6), S = (a * (r ** n - 1)) / (r - 1); return ask(geo(a, r, 4), `Geometric series. Sum of the first ${n} terms, S${sb(n)} = <span class="pl-blank" id="plb">?</span>`, num(S, () => pick([a * r ** (n - 1), a * r ** n, S - a, S + a * r ** n]))); },
  };

  /* ---------- Gambar (SVG) untuk kisi koordinat, grafik, dan alat ukur ---------- */
  function gridSVG(min, max, S = 300) {
    const pad = 26, c = (S - 2 * pad) / (max - min), px = (v) => pad + (v - min) * c, py = (v) => S - pad - (v - min) * c;
    const ax = (v) => v === 0 || (min > 0 && v === min); let g = '';
    for (let v = min; v <= max; v++) g += `<line class="pt-l${ax(v) ? ' ax' : ''}" x1="${px(v)}" y1="${py(min)}" x2="${px(v)}" y2="${py(max)}"/><line class="pt-l${ax(v) ? ' ax' : ''}" x1="${px(min)}" y1="${py(v)}" x2="${px(max)}" y2="${py(v)}"/>`;
    const ox = px(Math.max(min, 0)), oy = py(Math.max(min, 0));
    for (let v = min; v <= max; v++) { if (v !== 0) g += `<text class="pt-n" x="${px(v)}" y="${oy + 16}">${f(v)}</text><text class="pt-n" x="${ox - 9}" y="${py(v) + 4}" text-anchor="end">${f(v)}</text>`; }
    g += `<text class="pt-n" x="${ox - 8}" y="${oy + 16}" text-anchor="end">0</text><text class="pt-ax" x="${px(max) + 2}" y="${oy - 6}">x</text><text class="pt-ax" x="${ox + 6}" y="${py(max) - 4}">y</text>`;
    return { g, px, py, S, inv: (sx, sy) => [Math.max(min, Math.min(max, Math.round((sx - pad) / c) + min)), Math.max(min, Math.min(max, Math.round((S - pad - sy) / c) + min))] };
  }
  function gfSVG(x) {
    if (x.kind === 'pikto') return `<div class="gf-pk">${x.cats.map((c) => `<div class="gf-pr"><span class="gf-pn">${c.n}</span><span class="gf-pi">${c.e.repeat(c.v / x.key)}</span></div>`).join('')}<div class="gf-key">Each picture = ${x.key}</div></div>`;
    if (x.kind === 'circle') {
      const P = (deg, r) => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)].map((v) => v.toFixed(1)); let a0 = -90, g = '';
      x.cats.forEach((c, i) => { const a1 = a0 + c.p * 3.6, [lx, ly] = P((a0 + a1) / 2, 56);
        g += `<path d="M0 0L${P(a0, 92).join(' ')}A92 92 0 ${c.p > 50 ? 1 : 0} 1 ${P(a1, 92).join(' ')}Z" fill="${GF_COL[i]}" stroke="#fff" stroke-width="3"/><text class="gf-pe" x="${lx}" y="${+ly - 2}">${c.e}</text><text class="gf-pp" x="${lx}" y="${+ly + 17}">${i === x.hide ? '?' : c.p + '%'}</text>`; a0 = a1; });
      return `<svg class="gf-svg pie" viewBox="-100 -100 200 200" aria-hidden="true">${g}</svg><div class="gf-leg">${x.cats.map((c, i) => `<span><i style="background:${GF_COL[i]}"></i>${c.e} ${c.n}</span>`).join('')}</div>`;
    }
    if (x.kind === 'lurus') {
      const G = gridSVG(-5, 5), y = (v) => (x.a * v) / x.d + x.c;
      return `<svg class="gf-svg grid" viewBox="0 0 300 300" aria-hidden="true"><defs><clipPath id="gfc"><rect x="26" y="26" width="248" height="248"/></clipPath></defs>${G.g}<line class="gf-ln" clip-path="url(#gfc)" x1="${G.px(-6)}" y1="${G.py(y(-6))}" x2="${G.px(6)}" y2="${G.py(y(6))}"/><circle class="gf-dot" cx="${G.px(0)}" cy="${G.py(x.c)}" r="5"/><circle class="gf-dot" cx="${G.px(x.d)}" cy="${G.py(x.c + x.a)}" r="5"/></svg>`;
    }
    // diagram batang dan garis: sumbu tegak dengan garis bantu setiap step
    const x0 = 40, y0 = 186, w = 270, h = 160, n = (x.cats || x.vs).length, sw = w / n, lo = x.lo || 0, hi = x.hi || x.top, Y = (v) => y0 - ((v - lo) / (hi - lo)) * h;
    let g = '';
    for (let v = lo; v <= hi; v += x.step) g += `<line class="gf-l" x1="${x0}" x2="${x0 + w}" y1="${Y(v)}" y2="${Y(v)}"/><text class="gf-t" x="${x0 - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt(v)}</text>`;
    if (x.kind === 'garis') {
      const P = x.vs.map((v, i) => [x0 + (i + 0.5) * sw, Y(v)]);
      g += `<polyline class="gf-pl" points="${P.map((p) => p.join(',')).join(' ')}"/>${P.map(([a, b]) => `<circle class="gf-dot" cx="${a}" cy="${b}" r="5"/>`).join('')}${x.xs.map((t, i) => `<text class="gf-c sm" x="${x0 + (i + 0.5) * sw}" y="${y0 + 18}">${t}</text>`).join('')}`;
    } else x.cats.forEach((c, i) => { const bx = x0 + i * sw + sw * 0.18; g += `<rect x="${bx}" y="${Y(c.v)}" width="${sw * 0.64}" height="${y0 - Y(c.v)}" rx="4" fill="${GF_COL[i % 5]}"/><text class="gf-c${x.names ? ' sm' : ''}" x="${bx + sw * 0.32}" y="${y0 + (x.names ? 18 : 24)}">${x.names ? c.n.slice(0, 8) : c.e}</text>`; });
    return `<svg class="gf-svg" viewBox="0 0 320 214" aria-hidden="true">${g}<line class="gf-ax" x1="${x0}" x2="${x0 + w}" y1="${y0}" y2="${y0}"/><line class="gf-ax" x1="${x0}" x2="${x0}" y1="${y0}" y2="${y0 - h}"/></svg>${x.kind === 'batang' && !x.names ? `<div class="gf-leg">${x.cats.map((c) => `<span>${c.e} ${c.n}</span>`).join('')}</div>` : ''}`;
  }
  const PD = (deg, r) => [r * Math.cos((deg * Math.PI) / 180), -r * Math.sin((deg * Math.PI) / 180)].map((v) => +v.toFixed(1));
  function ukSVG(x) {
    if (x.kind === 'ruler') {
      const x0 = 16, cmW = 308 / x.N, X = (mm) => x0 + (mm / 10) * cmW; let t = '';
      for (let m = 0; m <= x.N * 10; m += x.mm ? 1 : 5) { const big = m % 10 === 0; t += `<line class="uk-tk" x1="${X(m)}" x2="${X(m)}" y1="70" y2="${70 + (big ? 20 : m % 5 === 0 ? 13 : 7)}"/>${big ? `<text class="uk-n" x="${X(m)}" y="108">${m / 10}</text>` : ''}`; }
      const a = X(x.s), b = X(x.e), tip = Math.min(18, (b - a) * 0.3);
      const obj = x.obj === 'pencils' ? `<rect x="${a}" y="38" width="7" height="22" fill="#f9a8d4"/><rect x="${a + 7}" y="38" width="${b - a - 7 - tip}" height="22" fill="#facc15"/><path d="M${b - tip} 38L${b} 49L${b - tip} 60Z" fill="#f5d0a9"/><path d="M${b - tip / 3} 45.3L${b} 49L${b - tip / 3} 52.7Z" fill="#444"/>` : `<rect x="${a}" y="40" width="${b - a}" height="18" rx="3" fill="#f472b6"/>`;
      return `<svg class="uk-svg" viewBox="0 0 340 124" aria-hidden="true"><rect class="uk-rl" x="4" y="68" width="332" height="50" rx="6"/>${t}<path class="uk-gd" d="M${a} 32V70M${b} 32V70"/>${obj}</svg>`;
    }
    if (x.kind === 'cup') {
      const top = 30, bot = 220, Y = (v) => bot - (v / x.cap) * (bot - top); let t = '';
      for (let v = x.tick; v <= x.cap; v += x.tick) { const big = v % x.lab === 0; t += `<line class="uk-tk" x1="52" x2="${big ? 74 : 64}" y1="${Y(v)}" y2="${Y(v)}"/>${big ? `<text class="uk-n l" x="138" y="${Y(v) + 5}">${x.lbl(v)}</text>` : ''}`; }
      return `<svg class="uk-svg cup" viewBox="0 0 200 236" aria-hidden="true"><rect x="51" y="${Y(x.v)}" width="78" height="${bot - Y(x.v) + 8}" rx="6" fill="#7dd3fc" opacity=".8"/><path class="uk-cup" d="M50 16V222Q50 230 58 230H122Q130 230 130 222V16"/>${t}<text class="uk-u" x="138" y="18">${x.unit}</text></svg>`;
    }
    if (x.kind === 'dial') {
      const P = (v, r) => { const a = (((v / x.cap) * 360 - 90) * Math.PI) / 180; return [+(r * Math.cos(a)).toFixed(1), +(r * Math.sin(a)).toFixed(1)]; }; let t = '';
      for (let v = 0; v < x.cap; v += x.tick) { const big = v % x.lab === 0, [a, b] = P(v, 92), [c, d] = P(v, big ? 78 : 85); t += `<line class="uk-tk" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`; if (big) { const [e, g2] = P(v, 63); t += `<text class="uk-n sm" x="${e}" y="${g2 + 4}">${x.lbl(v)}</text>`; } }
      const [nx, ny] = P(x.v, 80);
      return `<svg class="uk-svg dial" viewBox="-104 -104 208 208" aria-hidden="true"><circle r="100" fill="#fff" stroke="#4f46e5" stroke-width="6"/>${t}<line class="uk-nd" x1="0" y1="0" x2="${nx}" y2="${ny}"/><circle r="7" fill="#e11d48"/><text class="uk-u" x="0" y="40" text-anchor="middle">${x.unit}</text></svg>`;
    }
    if (x.kind === 'thermo') {
      const Y = (v) => 200 - ((v - x.min) / (x.max - x.min)) * 180; let t = '';
      for (let v = x.min; v <= x.max; v += x.tick) { const big = v % x.lab === 0; t += `<line class="uk-tk" x1="86" x2="${big ? 102 : 94}" y1="${Y(v)}" y2="${Y(v)}"/>${big ? `<text class="uk-n l" x="106" y="${Y(v) + 5}">${f(v)}</text>` : ''}`; }
      return `<svg class="uk-svg thermo" viewBox="0 0 160 252" aria-hidden="true"><rect x="64" y="12" width="20" height="206" rx="10" fill="#fff" stroke="#94a3b8" stroke-width="3"/><rect x="69" y="${Y(x.v)}" width="10" height="${224 - Y(x.v)}" fill="#ef4444"/><circle cx="74" cy="230" r="16" fill="#ef4444" stroke="#94a3b8" stroke-width="3"/>${t}<text class="uk-u" x="30" y="24">°C</text></svg>`;
    }
    // busur derajat dan tebak sudut: kaki pertama di 0°, kaki kedua di a° (berlawanan arah jarum jam)
    const ray = (deg, r) => { const [a, b] = PD(deg, r); return `<line class="uk-ray" x1="0" y1="0" x2="${a}" y2="${b}"/>`; };
    const [e1, e2] = PD(x.a, 26), arc = `<path class="uk-arc" d="M26 0A26 26 0 0 0 ${e1} ${e2}"/>`;
    if (x.kind === 'busur') {
      let t = '<path class="uk-pro" d="M-118 0A118 118 0 0 1 118 0Z"/>', n = '';
      for (let d = 0; d <= 180; d += 5) { const [a, b] = PD(d, 118), [c, e] = PD(d, d % 10 ? 110 : 102); t += `<line class="uk-tk" x1="${a}" y1="${b}" x2="${c}" y2="${e}"/>`; if (d % 30 === 0) { const [p, q] = PD(d, 88); n += `<text class="uk-n sm halo" x="${p}" y="${q + (d % 180 ? 4 : -4)}">${d}</text>`; } }
      return `<svg class="uk-svg pro" viewBox="-126 -126 252 140" aria-hidden="true">${t}${ray(0, 122)}${ray(x.a, 122)}${arc}${n}<circle r="4" fill="#1e1b4b"/></svg>`;
    }
    return `<svg class="uk-svg tebak" viewBox="-120 -120 240 240" aria-hidden="true"><g transform="rotate(${-x.base})">${ray(0, 112)}${ray(x.a, 112)}${arc}<circle r="5" fill="#1e1b4b"/></g></svg>`;
  }

  // daftar permainan baru: [jenis, akhiran id, kelas, nama, generator, keterangan]
  const NEW8 = [
    ['batang', 'mb', [2, 3, 4, 5, 6, 7], () => 'Bar Model', BATANG, 'Read the story, set the bar lengths to match it (Singapore method), then choose the answer. 10 questions, no time limit.'],
    ['timbang', 'tb', [1, 2, 3, 4, 5, 6, 7, 9], () => 'Balance Scale', TIMBANG, 'Change the mystery object\'s value with the − and + buttons until the scale balances: left as heavy as right. Grades 1–2: the scale moves right away. 10 questions, no time limit.'],
    ['peta', 'ko', [5, 6, 8, 10], () => 'Coordinate Treasure', PETA, 'Tap the point on the grid for the coordinates, or read the coordinates of the treasure. Advanced grades: reflections, translations, midpoints, and parallelograms. 10 questions, no time limit.'],
    ['nilai', 'bb', [-1, 1, 2, 3, 4, 5], () => 'Number Builder', NILAI, 'Tap thousands, hundreds, tens, and ones blocks to build the target number. Tap a block on the tray to take it back. 10 questions, no time limit.'],
    ['bangun', 'bd', [-2, -1, 1, 2, 3, 4, 5, 6, 8], (gr) => (gr >= 5 ? 'Cube Nets' : 'Shape Hunt'), BANGUN, 'Pre-K to Grade 4: tap all the shapes asked for. Grade 5 and up: tap all the cube nets, or the opposite face when the net is folded. 10 questions, no time limit.'],
    ['ukur', 'uk', [1, 2, 3, 4, 5, 6, 7, 10], (gr) => (gr >= 7 ? 'Guess the Angle' : 'Measure and Read'), UKUR, 'Read a ruler, measuring cup, scale, thermometer, or protractor. Guess the Angle: estimate an angle without a protractor. Small difference 2 points, close enough 1 point. 10 questions, no time limit.'],
    ['grafik', 'gf', [2, 3, 4, 5, 6, 7, 9], () => 'Graph Reading', GRAFIK, 'Read a pictograph, bar chart, line chart, pie chart, or straight-line graph, then answer the question. 10 questions, no time limit.'],
    ['pola', 'pl', [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11], (gr) => (gr <= -1 ? 'Continue the Pattern' : 'Patterns and Sequences'), POLA, 'Find the rule, then complete the missing picture or number. Advanced grades: nth term, term formulas, and geometric sequences. 10 questions, no time limit.'],
  ];
  NEW8.forEach(([type, suf, grades, name, gen, desc]) => grades.forEach((gr) => GAMES.push({ id: gr + suf, grade: gr, type, icon: { batang: '📊', timbang: '⚖️', peta: '🗺️', nilai: '🧱', bangun: '🔺', ukur: '📏', grafik: '📈', pola: '🔁' }[type], name: name(gr), isNew: true, stars: type === 'ukur' && gr >= 7 ? [8, 13, 17] : [6, 8, 10], next: gen[gr], desc })));
  const TYPES = { pinang: 'One class · big screen', lembar: 'Practice sheet · in order, mixed, patterns', tambang: 'Two teams · 90 seconds', sudoku: 'Logic puzzle', kilat: 'Quick and correct · 60 seconds', balon: 'Pop balloons · 60 seconds', pasangan: 'Memory cards', susun: 'Falling blocks · target sum', kembar: 'Falling blocks · merge twins', garis: 'Slide on a line · 10 questions', juring: 'Tap parts · 10 questions', jam: 'Turn the hands · 10 questions', uang: 'Pay exactly · 10 questions',
    batang: 'Bar model · 10 questions', timbang: 'Balance it · 10 questions', peta: 'Coordinates · 10 questions', nilai: 'Place-value blocks · 10 questions', bangun: 'Tap shapes · 10 questions', ukur: 'Read measuring tools · 10 questions', grafik: 'Read graphs · 10 questions', pola: 'Complete patterns · 10 questions' };
  // Cara main dalam gambar: ikon + dua-tiga kata
  const HOW = {
    kilat: () => [['👀', 'See the question'], ['👆', 'Tap the answer'], ['⏱️', '60 seconds']],
    pinang: () => [['🙋', 'Answer together'], ['👆', 'One child taps'], ['🧗', 'Climb to the top']],
    lembar: () => [['🔢', 'In order'], ['🔀', 'Mixed'], ['🧩', 'Pattern'], ['✍️', 'Fix the wrong ones']],
    tambang: () => [['🟥🟦', 'Two teams'], ['✅', 'Correct: the rope pulls'], ['🏁', 'Flag reaches the line: win']],
    sudoku: (g) => [['👆', 'Tap an empty box'], [g.pic ? '🍎' : '🔢', g.pic ? 'Choose the fruit' : 'Choose the number'], ['↔️↕️', 'No duplicates']],
    balon: () => [['📢', 'Read the instruction'], ['🎈', 'Pop the matching ones'], ['💥', 'Wrong: −1']],
    pasangan: () => [['🃏', 'Flip 2 cards'], ['🔗', 'Find the pair'], ['🧠', 'Remember where they are']],
    susun: (g) => [['👆', 'Tap a column to drop'], ['✨', `Sum of ${g.show(g.target)}: disappears`], ['🧱', 'Don\'t let it fill up']],
    kembar: () => [['◀▶', 'Slide the block'], ['🟰', 'Same: they merge'], ['🚧', 'Don\'t pass the limit']],
    garis: () => [['👀', 'See the question'], ['👉', 'Slide the pointer'], ['✅', 'Check']],
    juring: () => [['🍕', 'See the fraction'], ['👆', 'Tap the parts'], ['✅', 'Check']],
    jam: () => [['👀', 'Read the time'], ['🕒', 'Turn the hands'], ['✅', 'Check']],
    uang: (g) => [['🏷️', 'See the price'], ['🪙', g.grade >= 3 ? 'Pay or give change' : 'Tap the money'], ['✅', 'Check']],
    batang: () => [['📖', 'Read the story'], ['📊', 'Set the bars'], ['✅', 'Choose the answer']],
    timbang: () => [['⚖️', 'See the scale'], ['➖➕', 'Change the value'], ['✅', 'Make it balance']],
    peta: () => [['🗺️', 'Read the coordinates'], ['👆', 'Tap the point'], ['💎', 'Find the treasure']],
    nilai: () => [['🎯', 'See the number'], ['🧱', 'Tap the blocks'], ['✅', 'Check']],
    bangun: (g) => (g.grade >= 5 ? [['🧊', 'Imagine the cube'], ['👆', 'Tap your choice'], ['✅', 'Check']] : [['📢', 'Read the instruction'], ['🔺', 'Tap all the shapes'], ['✅', 'Check']]),
    ukur: (g) => (g.grade >= 7 ? [['📐', 'See the angle'], ['🤔', 'Guess its size'], ['🎯', 'The closer, the more points']] : [['📏', 'See the measuring tool'], ['👀', 'Read the scale'], ['✅', 'Choose the answer']]),
    grafik: () => [['📊', 'Read the graph'], ['❓', 'Answer the question'], ['✅', 'Check']],
    pola: () => [['🔁', 'Find the rule'], ['❓', 'Fill in what\'s missing'], ['✅', 'Check']],
  };
  // Contoh bergambar di layar sebelum main, untuk permainan yang aturannya tidak langsung terlihat
  const exBlk = (t, c) => `<i style="background:${c}">${t}</i>`;
  const EX = {
    susun(g) {
      const ok = g.vals.filter((v) => g.vals.includes(g.target - v) && v !== g.target - v), round = ok.filter((v) => v % 5 === 0), a = pick(round.length ? round : ok), b = g.target - a;
      return `<div class="row">${exBlk(g.show(a), '#9fd8ff')}${exBlk(g.show(b), '#ffd1dc')}<span class="op">→</span><span class="poof">✨</span></div><p><b>${g.show(a)} + ${b < 0 ? `(${g.show(b)})` : g.show(b)}</b> = ${g.show(g.target)}. Two blocks side by side or stacked that add up to ${g.show(g.target)} disappear at once.</p>`;
    },
    kembar: () => `<div class="row">${exBlk('4', '#a8f0de')}${exBlk('4', '#a8f0de')}<span class="op">→</span>${exBlk('8', '#7be3c6')}</div><p>Matching blocks that touch merge into double.</p>`,
  };
  // Warna dan ilustrasi tiap jenis permainan (SVG, 120 × 90)
  const LOOK = { pinang: ['#c8541a', '#fff0e0'], lembar: ['#2f7d5b', '#e9f7ef'], tambang: ['#e0464b', '#ffeeee'], sudoku: ['#7c5cd6', '#f1ecff'], kilat: ['#ffb020', '#fff4d6'], balon: ['#ff6b81', '#ffe8ec'], pasangan: ['#8e7cc3', '#efeaff'], susun: ['#1c9be8', '#e3f3ff'], kembar: ['#19b796', '#e6fffa'], garis: ['#58cc02', '#eaffd6'], juring: ['#ff8a00', '#fff0e0'], jam: ['#0ea5e9', '#e0f6ff'], uang: ['#16a34a', '#e7f8ec'],
    batang: ['#c026d3', '#fbe9fd'], timbang: ['#b45309', '#fdf2e3'], peta: ['#0f766e', '#e2f5f2'], nilai: ['#2563eb', '#e8eeff'], bangun: ['#e11d48', '#ffe8ed'], ukur: ['#4f46e5', '#ecebff'], grafik: ['#0891b2', '#e3f7fb'], pola: ['#65a30d', '#f0f9e3'] };
  const blk = (x, y, c, t) => `<rect x="${x}" y="${y}" width="26" height="22" rx="6" fill="${c}" stroke="#fff" stroke-width="2"/><text x="${x + 13}" y="${y + 16}" text-anchor="middle" font-size="13" font-weight="900" fill="#04382e">${t}</text>`;
  const ART = {
    pinang: '<rect x="56" y="10" width="9" height="76" rx="4" fill="#b5763a"/><path d="M56 26h9M56 42h9M56 58h9" stroke="#8a5526" stroke-width="2"/><circle cx="60.5" cy="9" r="7" fill="#ffc800"/><path d="M36 14h49" stroke="#e0464b" stroke-width="3"/><text x="31" y="24" font-size="15">🎁</text><text x="80" y="24" font-size="15">🎒</text><circle cx="49" cy="54" r="9" fill="#35e0bd"/><circle cx="46" cy="52" r="1.6" fill="#04382e"/><circle cx="51" cy="52" r="1.6" fill="#04382e"/><path d="M47 58q2 2 4 0" stroke="#04382e" stroke-width="1.5" fill="none"/>',
    lembar: '<rect x="30" y="6" width="62" height="80" rx="6" fill="#fff" stroke="#2f7d5b" stroke-width="3"/>' + [0, 1, 2, 3, 4].map((i) => `<text x="40" y="${24 + i * 14}" font-size="10" font-weight="900" fill="#16302b">6 × ${i + 1} =</text><rect x="72" y="${15 + i * 14}" width="14" height="11" rx="2" fill="${i < 3 ? '#d4fcef' : '#fff'}" stroke="#2f7d5b" stroke-width="1.5"/>`).join('') + '<path d="M96 70l10-10 6 6-10 10-8 2z" fill="#ffc800" stroke="#e0a800" stroke-width="2"/>',
    tambang: '<path d="M8 52h104" stroke="#c99a5b" stroke-width="5" stroke-linecap="round"/><path d="M8 52h104" stroke="#e8c08a" stroke-width="2" stroke-dasharray="6 5"/><path d="M60 30v44" stroke="#9aa7a4" stroke-width="2" stroke-dasharray="4 4"/><path d="M60 52v-18l14 6-14 6" fill="#ffc800" stroke="#e0a800" stroke-width="2"/><circle cx="18" cy="40" r="11" fill="#ff5a5f"/><circle cx="102" cy="40" r="11" fill="#1f3c88"/><path d="M12 54l-6 22M24 54l4 22M96 54l-4 22M108 54l6 22" stroke="#5c7570" stroke-width="4" stroke-linecap="round"/>',
    sudoku: '<rect x="24" y="8" width="72" height="72" rx="8" fill="#fff" stroke="#7c5cd6" stroke-width="4"/><path d="M60 8v72M24 44h72" stroke="#7c5cd6" stroke-width="3"/><path d="M42 8v72M78 8v72M24 26h72M24 62h72" stroke="#c9b8f5" stroke-width="2"/>' + [[33, 22, '1'], [69, 22, '3'], [51, 40, '4'], [87, 58, '2'], [33, 76, '2'], [69, 76, '4']].map(([x, y, t]) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="14" font-weight="900" fill="#4b2fa6">${t}</text>`).join(''),
    kilat: '<circle cx="60" cy="45" r="34" fill="#ffe08a"/><path d="M68 10 40 50h17l-7 30 32-42H64z" fill="#ffc800" stroke="#e08a00" stroke-width="3" stroke-linejoin="round"/><circle cx="22" cy="20" r="4" fill="#ffb020"/><circle cx="100" cy="70" r="5" fill="#ffb020"/><circle cx="98" cy="18" r="3" fill="#ffb020"/>',
    balon: '<path d="M38 52q-2 14 6 30M62 46q2 16-2 36M86 54q-4 12 0 28" stroke="#9aa7a4" stroke-width="2" fill="none"/><ellipse cx="38" cy="36" rx="16" ry="19" fill="#ff6b81"/><ellipse cx="62" cy="28" rx="16" ry="19" fill="#4d96ff"/><ellipse cx="86" cy="38" rx="16" ry="19" fill="#ffc800"/><ellipse cx="33" cy="29" rx="4" ry="6" fill="#fff" opacity=".5"/><ellipse cx="57" cy="21" rx="4" ry="6" fill="#fff" opacity=".5"/><ellipse cx="81" cy="31" rx="4" ry="6" fill="#fff" opacity=".5"/>',
    pasangan: '<g transform="rotate(-12 44 46)"><rect x="22" y="16" width="42" height="58" rx="9" fill="#8e7cc3"/><text x="43" y="55" text-anchor="middle" font-size="28" font-weight="900" fill="#fff">?</text></g><g transform="rotate(10 78 46)"><rect x="56" y="16" width="42" height="58" rx="9" fill="#fff" stroke="#8e7cc3" stroke-width="3"/><text x="77" y="54" text-anchor="middle" font-size="22" font-weight="900" fill="#8e7cc3">3+4</text></g>',
    susun: blk(34, 62, '#9fd8ff', 3) + blk(60, 62, '#ffd1dc', 7) + blk(60, 38, '#c9f7c1', 5) + blk(86, 62, '#ffe6a6', 2) + '<path d="M47 30v18" stroke="#1c9be8" stroke-width="3" stroke-dasharray="4 4"/>' + blk(34, 6, '#ffe6a6', 5),
    kembar: blk(20, 50, '#a8f0de', 2) + blk(48, 50, '#a8f0de', 2) + '<path d="M78 61h10" stroke="#19b796" stroke-width="4" stroke-linecap="round"/><path d="M85 55l6 6-6 6" stroke="#19b796" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' + '<rect x="92" y="44" width="24" height="34" rx="7" fill="#7be3c6" stroke="#fff" stroke-width="2"/><text x="104" y="67" text-anchor="middle" font-size="15" font-weight="900" fill="#04382e">4</text>',
    garis: '<path d="M10 40h100" stroke="#a5e070" stroke-width="5" stroke-linecap="round"/>' + [10, 35, 60, 85, 110].map((x, i) => `<path d="M${x} 32v16" stroke="#a5e070" stroke-width="4" stroke-linecap="round"/><text x="${x}" y="24" text-anchor="middle" font-size="12" font-weight="900" fill="${i === 2 ? '#3a8c00' : '#8fd45c'}">${i * 3}</text>`).join('') + '<path d="M60 52l12 9v14H48V61z" fill="#58cc02" stroke-linejoin="round"/>',
    juring: '<circle cx="60" cy="45" r="36" fill="#ffe2bf" stroke="#fff" stroke-width="3"/>' + [0, 1, 2].map((i) => { const a0 = (-90 + i * 45) * Math.PI / 180, a1 = (-45 + i * 45) * Math.PI / 180; return `<path d="M60 45L${(60 + 36 * Math.cos(a0)).toFixed(1)} ${(45 + 36 * Math.sin(a0)).toFixed(1)}A36 36 0 0 1 ${(60 + 36 * Math.cos(a1)).toFixed(1)} ${(45 + 36 * Math.sin(a1)).toFixed(1)}Z" fill="#ff8a00" stroke="#fff" stroke-width="3"/>`; }).join('') + [3, 4, 5, 6, 7].map((i) => { const a = (-90 + i * 45) * Math.PI / 180; return `<path d="M60 45L${(60 + 36 * Math.cos(a)).toFixed(1)} ${(45 + 36 * Math.sin(a)).toFixed(1)}" stroke="#fff" stroke-width="3"/>`; }).join(''),
    jam: '<circle cx="60" cy="46" r="38" fill="#fff" stroke="#0ea5e9" stroke-width="6"/>' + [...Array(12)].map((_, i) => { const a = (i * 30) * Math.PI / 180; return `<circle cx="${(60 + 29 * Math.sin(a)).toFixed(1)}" cy="${(46 - 29 * Math.cos(a)).toFixed(1)}" r="${i % 3 ? 2 : 3.2}" fill="#7dd3fc"/>`; }).join('') + '<path d="M60 46V24" stroke="#0369a1" stroke-width="5" stroke-linecap="round"/><path d="M60 46l14 8" stroke="#0ea5e9" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="46" r="5" fill="#ffb020"/><path d="M98 14a44 44 0 0 1 8 18" stroke="#ffb020" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M101 33l5 3 2-6" stroke="#ffb020" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    uang: '<rect x="14" y="20" width="62" height="36" rx="6" fill="#a9d5a2" stroke="#5f9e57" stroke-width="3" transform="rotate(-8 45 38)"/><rect x="24" y="30" width="62" height="36" rx="6" fill="#d9b98a" stroke="#a9824c" stroke-width="3"/><text x="55" y="54" text-anchor="middle" font-size="14" font-weight="900" fill="#5a3d00">5.000</text><circle cx="90" cy="62" r="16" fill="#e8c45a" stroke="#c49a2a" stroke-width="3"/><text x="90" y="67" text-anchor="middle" font-size="11" font-weight="900" fill="#5a3d00">500</text><circle cx="98" cy="30" r="12" fill="#d7dade" stroke="#a6abb1" stroke-width="3"/><text x="98" y="34" text-anchor="middle" font-size="9" font-weight="900" fill="#444">100</text>',
    batang: '<text x="8" y="25" font-size="12" font-weight="900" fill="#86198f">A</text><text x="8" y="51" font-size="12" font-weight="900" fill="#86198f">B</text>' + [0, 1].map((i) => `<rect x="${22 + i * 22}" y="13" width="20" height="16" rx="3" fill="#f0abfc"/>`).join('') + [0, 1, 2, 3].map((i) => `<rect x="${22 + i * 22}" y="39" width="20" height="16" rx="3" fill="#c026d3"/>`).join('') + '<path d="M22 62q0 6 6 6h29l4 6 4-6h29q6 0 6-6" stroke="#c026d3" stroke-width="3" fill="none"/><text x="61" y="88" text-anchor="middle" font-size="13" font-weight="900" fill="#86198f">?</text>',
    timbang: '<path d="M60 30v44M44 80h32" stroke="#92400e" stroke-width="6" stroke-linecap="round"/><g transform="rotate(-8 60 30)"><path d="M16 30h88" stroke="#b45309" stroke-width="6" stroke-linecap="round"/><rect x="18" y="12" width="20" height="18" rx="4" fill="#fbbf24"/><text x="28" y="26" text-anchor="middle" font-size="12" font-weight="900" fill="#78350f">□</text><rect x="40" y="16" width="16" height="14" rx="3" fill="#fde68a"/><rect x="74" y="8" width="26" height="22" rx="4" fill="#fde68a"/><text x="87" y="24" text-anchor="middle" font-size="12" font-weight="900" fill="#78350f">15</text></g><circle cx="60" cy="30" r="5" fill="#78350f"/>',
    peta: '<rect x="10" y="8" width="100" height="74" rx="8" fill="#f5e6c8" stroke="#c9a96b" stroke-width="3"/>' + [30, 50, 70, 90].map((v) => `<path d="M${v} 12v66" stroke="#e2cfa3" stroke-width="2"/>`).join('') + [28, 46, 64].map((v) => `<path d="M14 ${v}h92" stroke="#e2cfa3" stroke-width="2"/>`).join('') + '<path d="M22 72q20-6 28-24t34-22" stroke="#0f766e" stroke-width="3" stroke-dasharray="5 5" fill="none"/><path d="M80 18l12 12M92 18L80 30" stroke="#e11d48" stroke-width="5" stroke-linecap="round"/>',
    nilai: '<rect x="10" y="20" width="48" height="48" fill="#93c5fd" stroke="#1d4ed8" stroke-width="2"/>' + [1, 2, 3].map((i) => `<path d="M${10 + i * 12} 20v48M10 ${20 + i * 12}h48" stroke="#1d4ed8" stroke-width="1"/>`).join('') + [0, 1].map((i) => `<rect x="${66 + i * 14}" y="20" width="10" height="48" fill="#86efac" stroke="#15803d" stroke-width="2"/>`).join('') + [0, 1, 2].map((i) => `<rect x="${96 + (i % 2) * 12}" y="${58 - Math.floor(i / 2) * 12}" width="10" height="10" fill="#fde047" stroke="#a16207" stroke-width="2"/>`).join(''),
    bangun: '<circle cx="34" cy="56" r="20" fill="#38bdf8"/><path d="M60 12l22 38H38z" fill="#fb7185"/><rect x="74" y="46" width="34" height="34" rx="3" fill="#facc15" transform="rotate(10 91 63)"/>',
    ukur: '<rect x="8" y="50" width="104" height="26" rx="4" fill="#fde68a" stroke="#ca8a04" stroke-width="2"/>' + [...Array(11)].map((_, i) => `<path d="M${14 + i * 9.2} 50v${i % 5 ? 7 : 13}" stroke="#854d0e" stroke-width="2"/>`).join('') + '<rect x="14" y="26" width="10" height="16" fill="#f9a8d4"/><rect x="24" y="26" width="58" height="16" fill="#818cf8"/><path d="M82 26l14 8-14 8z" fill="#f5d0a9"/><path d="M14 20v30M96 20v30" stroke="#4f46e5" stroke-width="2" stroke-dasharray="3 3"/>',
    grafik: '<path d="M16 10v68h96" stroke="#155e75" stroke-width="4" fill="none" stroke-linecap="round"/>' + [[26, 40, '#38bdf8'], [48, 22, '#f472b6'], [70, 50, '#facc15'], [92, 32, '#4ade80']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="14" height="${76 - y}" rx="3" fill="${c}"/>`).join(''),
    pola: [[18, '#65a30d', 'c'], [42, '#f59e0b', 's'], [66, '#65a30d', 'c'], [90, '#f59e0b', 's']].map(([x, c, k], i) => (i === 3 ? `<rect x="${x - 11}" y="34" width="22" height="22" rx="5" fill="none" stroke="#65a30d" stroke-width="3" stroke-dasharray="4 3"/><text x="${x}" y="51" text-anchor="middle" font-size="16" font-weight="900" fill="#3f6212">?</text>` : k === 'c' ? `<circle cx="${x}" cy="45" r="11" fill="${c}"/>` : `<rect x="${x - 11}" y="34" width="22" height="22" rx="4" fill="${c}"/>`)).join(''),
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
      foot.className = 'mq-foot'; foot.innerHTML = `<div class="mq-foot-in"><button class="mq-btn" id="grgo" ${on ? '' : 'disabled'}>Check</button></div>`;
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
          <button class="gl-mark" id="glm" role="slider" aria-label="Pointer" aria-valuemin="${x.min}" aria-valuemax="${x.max}"><svg viewBox="0 0 60 64"><path d="M30 4 56 24v32a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V24z"/></svg></button></div></div>
        <div class="gl-nudge"><button data-d="-1" aria-label="Slide left">◀</button><button data-d="1" aria-label="Slide right">▶</button></div>`;
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
      stage.innerHTML = `<div class="gr-q jr-q"><span class="jr-ask">Color</span><span class="jr-frac">${x.lbl}</span></div>
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
        <button class="jm-face" id="jmf" role="slider" aria-label="Clock. Left and right arrows turn the minute hand; up and down turn it one hour" aria-valuemin="0" aria-valuemax="719">
          <svg viewBox="-110 -110 220 220" aria-hidden="true"><circle class="jm-rim" r="104"/>${[...Array(60)].map((_, i) => `<line class="jm-tk ${i % 5 ? '' : 'big'}" x1="0" y1="${i % 5 ? -92 : -88}" x2="0" y2="-98" transform="rotate(${i * 6})"/>`).join('')}
            ${[...Array(12)].map((_, i) => { const a = ((i + 1) * 30 * Math.PI) / 180; return `<text class="jm-n" x="${(74 * Math.sin(a)).toFixed(1)}" y="${(-74 * Math.cos(a) + 8).toFixed(1)}">${i + 1}</text>`; }).join('')}
            <g id="jma"></g><g id="jmh"></g><circle class="jm-pin" r="7"/></svg></button>
        <div class="jm-btns"><button data-d="-60" aria-label="Back one hour">−1 hour</button><button data-d="-${x.step}" aria-label="Back ${x.step} minutes">−${x.step}</button><button data-d="${x.step}" aria-label="Forward ${x.step} minutes">+${x.step}</button><button data-d="60" aria-label="Forward one hour">+1 hour</button></div>`;
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
      ? `<button class="wu-m note n${mval(v)} ${cls}" aria-label="${label} ${rp(mval(v))}"><b>${mval(v).toLocaleString('en-US')}</b><small>RUPIAH</small></button>`
      : `<button class="wu-m coin c${v} ${cls}" aria-label="${label} ${rp(v)}">${v}</button>`);
    const sumBag = () => bag.reduce((t, v) => t + mval(v), 0);
    const drawBag = () => {
      stage.querySelector('#wut').innerHTML = bag.length ? bag.map((v, i) => mHTML(v, '', 'Take back').replace('<button ', `<button data-i="${i}" `)).join('') : '<span class="wu-empty">The tray is still empty</span>';
      stage.querySelector('#wus').textContent = rp(sumBag());
      foot.querySelector('#grgo').disabled = !bag.length;
    };
    const showMoney = () => {
      bag = [];
      const pal = MONEY[g.grade];
      const tag = x.each ? x.items.map((it, i) => `<span class="wu-it"><span class="em">${it[0]}</span>${rp(x.each[i])}</span>`).join('<b class="wu-plus">+</b>')
        : `<span class="wu-it big"><span class="em">${x.items[0][0]}</span>${rp(x.price)}</span>`;
      stage.innerHTML = `<div class="wu-shop"><small>${x.who} buys ${x.items.map((it) => it[1]).join(' and ')}</small><div class="wu-tags">${tag}</div>
          ${x.pay ? `<div class="wu-pay">Paid <b>${rp(x.pay)}</b></div>` : ''}</div>
        <div class="wu-ask">${x.pay ? 'Tap the change' : 'Pay the exact amount'}</div>
        <div class="wu-tray" id="wut" aria-live="polite"></div>
        <div class="wu-sum"><span>Total</span><b id="wus">Rp0</b><button class="wu-del" id="wud" aria-label="Remove last money">⌫</button></div>
        <div class="wu-pal">${pal.map((v, i) => mHTML(v, '', 'Add').replace('<button ', `<button data-p="${i}" `)).join('')}</div>`;
      stage.querySelector('.wu-pal').addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (!b || done || bag.length >= 30) return; bag.push(pal[+b.dataset.p]); drawBag(); });
      stage.querySelector('#wut').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b || done) return; bag.splice(+b.dataset.i, 1); drawBag(); });
      stage.querySelector('#wud').addEventListener('click', () => { if (done) return; bag.pop(); drawBag(); });
      footCheck(false); drawBag();
    };
    // ---- pilihan jawaban bersama (grafik, pola, ukur, peta mode baca, model batang)
    let pk = -1;
    const optsHTML = () => `<div class="gc-opts${x.pic ? ' pic' : x.options.some((o) => String(o).replace(/<[^>]+>/g, '').length > 12) ? ' wide' : ''}" id="gco" role="group" aria-label="Answer choices">${x.options.map((o, i) => `<button class="gc-o" data-o="${i}" aria-pressed="false">${o}</button>`).join('')}</div>`;
    const bindOpts = (onPick) => {
      pk = -1;
      stage.querySelector('#gco').addEventListener('click', (e) => {
        const b = e.target.closest('[data-o]'); if (!b || done || b.disabled) return;
        pk = +b.dataset.o; stage.querySelectorAll('#gco .gc-o').forEach((y) => y.setAttribute('aria-pressed', String(y === b)));
        foot.querySelector('#grgo').disabled = false; if (onPick) onPick();
      });
    };
    const judgeOpts = () => { stage.querySelectorAll('#gco .gc-o').forEach((b, i) => { b.disabled = true; if (x.options[i] === x.answer) b.classList.add('right'); else if (i === pk) b.classList.add('wrong'); }); return x.options[pk] === x.answer; };
    // ---- pengatur bilangan (− / +) untuk timbangan dan tebak sudut
    let sv = 0;
    const stepHTML = (steps, lbl) => `<div class="gs-step" style="--n:${steps.length * 2}"><output class="gs-val" id="gsv" tabindex="0" role="spinbutton" aria-label="${lbl}. Up and down arrows change its value"></output>${steps.slice().reverse().map((s) => `<button data-d="${-s}" aria-label="Decrease ${fmt(s)}">−${fmt(s)}</button>`).join('')}${steps.map((s) => `<button data-d="${s}" aria-label="Increase ${fmt(s)}">+${fmt(s)}</button>`).join('')}</div>`;
    const bindStep = (steps, lo, hi, show, onSet) => {
      const set = (v) => { if (done) return; sv = Math.max(lo, Math.min(hi, Math.round(v * 1000) / 1000)); const o = stage.querySelector('#gsv'); o.innerHTML = show(sv); o.setAttribute('aria-valuenow', sv); o.setAttribute('aria-valuetext', show(sv).replace(/<[^>]+>/g, '')); if (onSet) onSet(); };
      stage.querySelector('.gs-step').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) set(sv + +b.dataset.d); });
      stage.querySelector('#gsv').addEventListener('keydown', (e) => { const s0 = steps[0], s1 = steps[steps.length - 1], d = { ArrowUp: s0, ArrowRight: s0, ArrowDown: -s0, ArrowLeft: -s0, PageUp: s1, PageDown: -s1 }[e.key]; if (d) { e.preventDefault(); set(sv + d); } });
      return set;
    };
    // ---- model batang: batang yang diatur bisa digeser, diketuk, atau diubah dengan − / +
    let bu = 1, mbOk = false;
    const showBars = () => {
      const adj = x.rows.find((r) => r.adj), boxes = (k) => '<i></i>'.repeat(k);
      stage.innerHTML = `<div class="mb-story">${x.story}</div><div class="mb-rows">${x.rows.map((r) => `<div class="mb-row${r.adj ? ' adj' : ''}"><span class="mb-name">${r.name}</span><div class="mb-track"${r.adj ? ' id="mbk"' : ''}>${r.lbl ? `<span class="mb-lbl" style="width:${r.units * 10}%"${r.adj ? ' id="mbl"' : ''}>${r.lbl}</span>` : ''}${r.adj ? `<button class="mb-bar" id="mbb" role="slider" aria-label="Length of bar ${r.name.replace(/<[^>]+>/g, '')}, in boxes" aria-valuemin="1" aria-valuemax="10"></button>` : `<div class="mb-bar" style="width:${r.units * 10}%">${boxes(r.units)}</div>`}</div></div>`).join('')}</div>
        <div class="mb-adj"><button data-d="-1" aria-label="Remove one box">−</button><span id="mbn"></span><button data-d="1" aria-label="Add one box">+</button></div>
        <p class="mb-tip" id="mbt" aria-live="polite"></p>${optsHTML()}`;
      const setBu = (v) => {
        if (done) return; bu = Math.max(1, Math.min(10, v)); mbOk = bu === adj.units;
        const b = stage.querySelector('#mbb'); b.style.width = bu * 10 + '%'; b.innerHTML = boxes(bu); b.setAttribute('aria-valuenow', bu);
        const l = stage.querySelector('#mbl'); if (l) l.style.width = bu * 10 + '%';
        stage.querySelector('#mbn').textContent = `${bu} boxes`;
        stage.querySelector('.mb-row.adj').classList.toggle('ok', mbOk);
        stage.querySelector('#mbt').innerHTML = mbOk ? `✓ The bar matches the story${x.unit ? ` (1 box = ${fmt(x.unit)})` : ''}. Now choose the answer.` : `Set the length of bar <b>${adj.name}</b> to match the story.${x.unit ? ` 1 box = ${fmt(x.unit)}.` : ''}`;
        stage.querySelectorAll('#gco .gc-o').forEach((o) => { o.disabled = !mbOk; });
        foot.querySelector('#grgo').disabled = !(mbOk && pk >= 0);
      };
      const trk = stage.querySelector('#mbk'); let drag = false;
      const at = (e) => { const r = trk.getBoundingClientRect(); setBu(Math.ceil(((e.clientX - r.left) / r.width) * 10)); };
      trk.addEventListener('pointerdown', (e) => { if (done) return; drag = true; trk.setPointerCapture(e.pointerId); at(e); });
      trk.addEventListener('pointermove', (e) => { if (drag) at(e); });
      trk.addEventListener('pointerup', () => { drag = false; }); trk.addEventListener('pointercancel', () => { drag = false; });
      stage.querySelector('#mbb').addEventListener('keydown', (e) => { const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key]; if (d) { e.preventDefault(); setBu(bu + d); } });
      stage.querySelector('.mb-adj').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) setBu(bu + +b.dataset.d); });
      footCheck(false); bindOpts(() => { foot.querySelector('#grgo').disabled = !mbOk; }); setBu(1);
    };
    // ---- timbangan: --t −1 (kiri lebih berat) … 0 (seimbang) … 1 (kanan lebih berat)
    const tbSide = (s) => s.map((c) => (c === BOX ? `<i class="tb-c x">${x.sym}</i>` : `<i class="tb-c${c.v < 0 ? ' neg' : ''}">${c.t}</i>`)).join('');
    const tbSum = (s, v) => s.reduce((t, c) => t + (c === BOX ? v * (x.k || 1) : c.v), 0); // k: gram per satuan □ (ons = 100 g)
    const tbTilt = (v) => { const d = tbSum(x.R, v) - tbSum(x.L, v), ref = Math.max(1, Math.abs(tbSum(x.R, x.ans))); return Math.abs(d) < 1e-9 ? 0 : Math.sign(d) * Math.min(1, 0.35 + Math.abs(d) / ref); };
    const tbShow = (v) => `${x.sym} = <b>${fmt(v)}</b>${x.unit ? ' ' + x.unit : ''}`;
    const showBalance = () => {
      stage.innerHTML = `<div class="gr-q tb-eq">${x.eq || `${sideTxt(x.L, x.sym, x.unit)} = ${sideTxt(x.R, x.sym, x.unit)}`}</div>
        <div class="tb" id="tb" style="--t:0"><div class="tb-pan l">${tbSide(x.L)}</div><div class="tb-pan r">${tbSide(x.R)}</div><div class="tb-beam"></div><div class="tb-post"></div></div>
        <p class="tb-tip">${x.live ? 'Watch the scale move as you change the value.' : 'Calculate first, then check whether the scale balances.'}</p>${stepHTML(x.steps, 'Value ' + x.sym)}`;
      sv = Math.max(x.min, 0);
      bindStep(x.steps, x.min, x.max, tbShow, () => { if (x.live) stage.querySelector('#tb').style.setProperty('--t', tbTilt(sv)); })(sv);
      footCheck(true);
    };
    // ---- koordinat: ketuk/geser untuk menaruh penanda, panah untuk memindahkannya
    let pp = null, ptG = null;
    const ptDraw = (id, p, cls) => { stage.querySelector(id).innerHTML = p ? `<path class="pt-guide ${cls}" d="M${ptG.px(p[0])} ${ptG.py(p[1])}H${ptG.px(Math.max(x.min, 0))}M${ptG.px(p[0])} ${ptG.py(p[1])}V${ptG.py(Math.max(x.min, 0))}"/><circle class="pt-mk ${cls}" cx="${ptG.px(p[0])}" cy="${ptG.py(p[1])}" r="11"/>` : ''; };
    const showMap = () => {
      pp = null; ptG = gridSVG(x.min, x.max);
      const segs = (x.segs || []).map(([a, b]) => `<line class="pt-seg" x1="${ptG.px(a[0])}" y1="${ptG.py(a[1])}" x2="${ptG.px(b[0])}" y2="${ptG.py(b[1])}"/>`).join('');
      const marks = (x.marks || []).map((m) => (m.gem ? `<text class="pt-gem" x="${ptG.px(m.x)}" y="${ptG.py(m.y) + 8}">💎</text>` : `<circle class="pt-p" cx="${ptG.px(m.x)}" cy="${ptG.py(m.y)}" r="6"/><text class="pt-lb" x="${ptG.px(m.x) + 8}" y="${ptG.py(m.y) - 8}">${m.lbl}</text>`)).join('');
      const svg = `<svg viewBox="0 0 ${ptG.S} ${ptG.S}" aria-hidden="true">${ptG.g}${segs}${marks}<g id="pta"></g><g id="ptm"></g></svg>`, tap = x.mode === 'tap';
      stage.innerHTML = `<div class="pt-ask">${x.ask}</div>${tap ? `<button class="pt-grid" id="ptg" aria-label="Coordinate grid. Tap a point, or use the arrow keys to move the marker.">${svg}</button>
        <div class="pt-pad"><button data-m="-1,0" aria-label="Move marker left">◀</button><button data-m="0,1" aria-label="Move marker up">▲</button><button data-m="0,-1" aria-label="Move marker down">▼</button><button data-m="1,0" aria-label="Move marker right">▶</button></div>` : `<div class="pt-grid">${svg}</div>${optsHTML()}`}`;
      if (!tap) { footCheck(false); return bindOpts(); }
      const grid = stage.querySelector('#ptg'), put = (p) => { if (done) return; pp = p; ptDraw('#ptm', pp, ''); grid.setAttribute('aria-valuetext', pt(pp[0], pp[1])); foot.querySelector('#grgo').disabled = false; };
      const at = (e) => { const r = grid.querySelector('svg').getBoundingClientRect(); put(ptG.inv(((e.clientX - r.left) / r.width) * ptG.S, ((e.clientY - r.top) / r.height) * ptG.S)); };
      const move = (dx, dy) => { const o = pp || [Math.max(x.min, 0), Math.max(x.min, 0)]; put([Math.max(x.min, Math.min(x.max, o[0] + (pp ? dx : 0))), Math.max(x.min, Math.min(x.max, o[1] + (pp ? dy : 0)))]); };
      let drag = false;
      grid.addEventListener('pointerdown', (e) => { if (done) return; drag = true; grid.setPointerCapture(e.pointerId); at(e); });
      grid.addEventListener('pointermove', (e) => { if (drag) at(e); });
      grid.addEventListener('pointerup', () => { drag = false; }); grid.addEventListener('pointercancel', () => { drag = false; });
      grid.addEventListener('keydown', (e) => { const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (d) { e.preventDefault(); move(...d); } });
      stage.querySelector('.pt-pad').addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (b) move(...b.dataset.m.split(',').map(Number)); });
      footCheck(false);
    };
    // ---- bangun bilangan: palet balok di bawah, nampan per nilai tempat di atas
    let bc = {};
    const bbSum = () => x.kinds.reduce((t, [v, val]) => t + bc[v] * val, 0);
    const drawBlocks = () => {
      x.kinds.forEach(([v, , nm]) => { const col = stage.querySelector(`.bb-col[data-v="${v}"]`); col.querySelector('.bb-stack').innerHTML = `<i class="bb-b bb-${v}"></i>`.repeat(bc[v]); col.querySelector('small').innerHTML = `<b>${bc[v]}</b> ${nm.toLowerCase()}`; });
      const s = stage.querySelector('#bbs'); if (s) s.textContent = x.show(bbSum());
      foot.querySelector('#grgo').disabled = !bbSum();
    };
    const showBlocks = () => {
      bc = {}; x.kinds.forEach(([v]) => { bc[v] = 0; });
      stage.innerHTML = `<div class="bb-ask">${x.ask}</div><div class="bb-tray" id="bbt">${x.kinds.map(([v, , nm]) => `<button class="bb-col" data-v="${v}" aria-label="Take one ${nm.toLowerCase()} block"><span class="bb-stack"></span><small></small></button>`).join('')}</div>
        ${x.total ? '<div class="bb-sum">Total: <b id="bbs">0</b></div>' : ''}<div class="bb-pal">${x.kinds.map(([v, val, nm]) => `<button data-v="${v}" aria-label="Add one ${nm.toLowerCase()} block, worth ${x.show(val)}"><i class="bb-b bb-${v}"></i><span>+ ${nm}</span></button>`).join('')}</div>`;
      stage.querySelector('.bb-pal').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b || done || bc[b.dataset.v] >= 30) return; bc[b.dataset.v]++; drawBlocks(); });
      stage.querySelector('#bbt').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b || done || !bc[b.dataset.v]) return; bc[b.dataset.v]--; drawBlocks(); });
      footCheck(false); drawBlocks();
    };
    // ---- bangun datar / jaring-jaring: ketuk untuk memilih (mode opp: pilih satu sisi)
    let bsel = new Set();
    const showShapes = () => {
      bsel = new Set();
      if (x.mode === 'opp') {
        const w = Math.max(...x.cells.map((p) => p[0])) + 1, h = Math.max(...x.cells.map((p) => p[1])) + 1;
        stage.innerHTML = `<div class="bd-ask">${x.ask}</div><div class="bd-net" style="--w:${w};--h:${h}">${x.cells.map(([cx, cy], i) => (i === x.star ? `<span class="bd-f star" style="grid-area:${cy + 1}/${cx + 1}" aria-label="Face marked with a star">★</span>` : `<button class="bd-f" data-i="${i}" style="grid-area:${cy + 1}/${cx + 1}" aria-pressed="false" aria-label="Face in row ${cy + 1}, column ${cx + 1}"></button>`)).join('')}</div>`;
        stage.querySelector('.bd-net').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b || done) return; bsel = new Set([+b.dataset.i]); stage.querySelectorAll('.bd-f[data-i]').forEach((y) => y.setAttribute('aria-pressed', String(y === b))); foot.querySelector('#grgo').disabled = false; });
        return footCheck(false);
      }
      stage.innerHTML = `<div class="bd-ask">${x.ask}</div><div class="bd-grid ${x.mode}">${x.items.map((it, i) => `<button class="bd-i" data-i="${i}" aria-pressed="false" aria-label="${x.mode === 'nets' ? 'Net' : 'Shape'} ke-${i + 1}">${it.svg}</button>`).join('')}</div><div class="jr-count"><b id="bdc">0</b> selected</div>`;
      stage.querySelector('.bd-grid').addEventListener('click', (e) => {
        const b = e.target.closest('[data-i]'); if (!b || done) return;
        const i = +b.dataset.i; if (bsel.has(i)) bsel.delete(i); else bsel.add(i);
        b.setAttribute('aria-pressed', String(bsel.has(i))); stage.querySelector('#bdc').textContent = bsel.size; foot.querySelector('#grgo').disabled = !bsel.size;
      });
      footCheck(false);
    };
    // ---- ukur: baca alat ukur lalu pilih jawaban; tebak sudut memakai pengatur bilangan
    const showMeasure = () => {
      if (x.kind === 'tebak') {
        stage.innerHTML = `<div class="uk-ask">Estimate the size of this angle <small>(without a protractor)</small></div><div class="uk-fig">${ukSVG(x)}</div>${stepHTML([5, 10], 'Angle guess')}`;
        sv = 90; bindStep([5, 10], 0, 180, (v) => `<b>${v}°</b>`)(90); return footCheck(true);
      }
      const what = { ruler: 'How long is this object?', cup: 'How much water is in the measuring cup?', dial: 'What weight does the needle show?', thermo: 'What temperature does the thermometer show?', busur: 'What is the size of this angle?' }[x.kind];
      stage.innerHTML = `<div class="uk-ask">${what}</div><div class="uk-fig ${x.kind}">${ukSVG(x)}</div>${optsHTML()}`;
      footCheck(false); bindOpts();
    };
    // ---- grafik
    const showChart = () => {
      stage.innerHTML = `<div class="gf-title">${x.title}</div><div class="gf-fig">${gfSVG(x)}</div><div class="gf-q">${x.q}</div>${optsHTML()}`;
      footCheck(false); bindOpts();
    };
    // ---- pola: pilihan mengisi kotak kosong
    const showPattern = () => {
      stage.innerHTML = `<div class="pl-ask">${x.q ? 'Look at the sequence' : 'Complete the pattern'}</div><div class="pl-seq${x.pic ? ' pic' : ''}">${x.seq.map((v) => (v === null ? '<span class="pl-c pl-blank" id="plb">?</span>' : `<span class="pl-c${v === '…' ? ' dots' : ''}">${v}</span>`)).join('')}</div>${x.q ? `<div class="pl-q">${x.q}</div>` : ''}${optsHTML()}`;
      footCheck(false); bindOpts(() => { const b = stage.querySelector('#plb'); b.innerHTML = x.options[pk]; b.classList.add('on'); });
    };
    const SHOW = { garis: showLine, juring: showShade, jam: showClock, uang: showMoney, batang: showBars, timbang: showBalance, peta: showMap, nilai: showBlocks, bangun: showShapes, ukur: showMeasure, grafik: showChart, pola: showPattern };
    // memeriksa jawaban, memberi warna benar/salah, dan mengembalikan [benar?, teks jawaban yang benar]
    const JUDGE = {
      garis() {
        const ok = idx === ansIdx();
        stage.querySelector('#gl').classList.add(ok ? 'ok' : 'no');
        if (!ok) stage.querySelector('.gl-track').insertAdjacentHTML('beforeend', `<span class="gl-ans" style="left:${pctOf(ansIdx())}%"></span>`);
        stage.querySelector('#grbox').classList.add(ok ? 'ok' : 'no');
        return [ok, fmt(x.ans)];
      },
      juring() { const ok = sel.size === x.need; stage.querySelector('.jr').classList.add(ok ? 'ok' : 'no'); return [ok, `${x.need} of ${x.n} parts`]; },
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
      batang: () => [judgeOpts(), x.answer],
      timbang() {
        const ok = Math.abs(sv - x.ans) < 1e-9, tb = stage.querySelector('#tb');
        tb.style.setProperty('--t', tbTilt(sv)); tb.classList.add(ok ? 'ok' : 'no');
        return [ok, tbShow(x.ans)];
      },
      peta() {
        if (x.mode !== 'tap') return [judgeOpts(), x.answer];
        const ok = pp[0] === x.ans[0] && pp[1] === x.ans[1];
        stage.querySelector('#ptg').classList.add(ok ? 'ok' : 'no'); if (!ok) ptDraw('#pta', x.ans, 'ans');
        return [ok, pt(x.ans[0], x.ans[1])];
      },
      nilai() {
        const ok = bbSum() === x.target; stage.querySelector('#bbt').classList.add(ok ? 'ok' : 'no');
        let left = x.target; const parts = x.kinds.map(([, val, nm]) => { const k = Math.floor(left / val); left -= k * val; return k ? `${k} ${nm.toLowerCase()}` : ''; }).filter(Boolean);
        return [ok, `${x.show(x.target)} = ${parts.join(', ')}`];
      },
      bangun() {
        const els = [...stage.querySelectorAll('[data-i]')];
        if (x.mode === 'opp') { const ok = bsel.has(x.ans); els.forEach((b) => { if (+b.dataset.i === x.ans) b.classList.add('right'); else if (bsel.has(+b.dataset.i)) b.classList.add('wrong'); }); return [ok, 'the green side']; }
        const ok = x.items.every((it, i) => it.ok === bsel.has(i));
        els.forEach((b) => { const i = +b.dataset.i, it = x.items[i]; b.disabled = true; b.classList.add(it.ok ? (bsel.has(i) ? 'right' : 'miss') : bsel.has(i) ? 'wrong' : 'off'); });
        return [ok, `${x.items.filter((it) => it.ok).length} ${x.mode === 'nets' ? 'net' : 'bangun'} (green outline)`];
      },
      ukur() {
        if (x.kind !== 'tebak') return [judgeOpts(), x.answer];
        const d = Math.abs(sv - x.a), gain = d <= x.tol[0] ? 2 : d <= x.tol[1] ? 1 : 0;
        stage.querySelector('.uk-fig').insertAdjacentHTML('beforeend', `<div class="uk-real">Actually <b>${x.a}°</b></div>`);
        return [gain > 0, `${x.a}°`, gain, `Your guess was ${sv}°, the actual angle is ${x.a}°. The difference is ${d}°${gain === 2 ? ', exactly right! +2 points' : gain ? ', close enough. +1 point' : '.'}`];
      },
      grafik: () => [judgeOpts(), x.answer],
      pola: () => [judgeOpts(), x.answer],
    };
    const nextQ = () => {
      if (n >= ROUND) return end();
      done = false; x = g.next();
      SHOW[g.type]();
    };
    function check() {
      if (done) return;
      const [ok, right, gain = 1, note] = JUDGE[g.type]();
      done = true;
      n++; el.querySelector('#grp i').style.width = (n / ROUND) * 100 + '%';
      if (ok) { combo++; setPts(gain); sfx.correct(); } else { combo = 0; sfx.wrong(); }
      el.querySelector('#grp').classList.toggle('combo', combo >= 2);
      el.querySelector('#grc').textContent = combo >= 2 ? `COMBO x${combo}` : '';
      const last = n >= ROUND;
      foot.className = 'mq-foot ' + (ok ? 'ok' : 'no');
      foot.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${ok ? '✓' : '✕'}</span>${ok ? pick(['Great!', 'Smart!', 'Awesome!', 'Cool!']) : 'Not quite'}</div>${note ? `<div class="mq-fbody"><p>${note}</p></div>` : ok ? '' : `<div class="mq-fbody"><p>Answer: <b>${right}</b></p></div>`}<button class="mq-btn ${ok ? '' : 'bad'}" id="grnext">${last ? 'Done' : 'Continue'}</button></div>`;
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
    let winner = null, title = null, note = null;
    const end = () => { if (!alive) return; alive = false; el.classList.remove('tt-wide', 'pp-full'); timers.forEach(clearTimeout); clearInterval(tick); onEnd({ points: pts, ms: Date.now() - t0, winner, title, note }); };
    const hud = (extra) => `<div class="ghud"><div><small>Points</small><b id="gpts">0</b></div>${extra}</div>`;
    let tick = null;
    const clock = () => {
      const bar = el.querySelector('.gtime i'), lbl = el.querySelector('#gsec');
      tick = setInterval(() => { const left = Math.max(0, SEC - (Date.now() - t0) / 1000); if (bar) bar.style.width = (left / SEC) * 100 + '%'; if (lbl) lbl.textContent = Math.ceil(left); if (left <= 0) end(); }, 200);
    };
    const setPts = (d) => { pts = Math.max(0, pts + d); const b = el.querySelector('#gpts'); if (b) { b.textContent = pts; b.className = d > 0 ? 'up' : 'down'; } };

    if (['garis', 'sector', 'jam', 'uang', 'batang', 'timbang', 'peta', 'nilai', 'bangun', 'ukur', 'grafik', 'pola'].includes(g.type)) {
      playRound(el, g, { sfx, setPts, end });
    } else if (g.type === 'kilat') {
      el.innerHTML = hud('<div><small>Combo</small><b id="gcombo">–</b></div><div><small>Seconds</small><b id="gsec">60</b></div>') + '<div class="gtime"><i></i></div><div class="gq" id="gq"></div><div class="gopts" id="gopts"></div>';
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
    } else if (g.type === 'balloons') {
      el.innerHTML = hud('<div><small>Seconds</small><b id="gsec">60</b></div>') + '<div class="gtime"><i></i></div><div class="grule" id="grule"></div><div class="gfield" id="gfield"></div>';
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
        const msg = el.querySelector('#gmsg'); if (msg) msg.textContent = '🚧 The tower passed the limit!';
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
      el.innerHTML = `<div class="ghud"><div><small>Points</small><b id="gpts">0</b></div><div><small>Largest</small><b id="gaux">2</b></div><div><small>Next</small><b id="gnext" class="gnext"></b></div></div>
        <p class="small muted center gtip" id="gmsg">Tap a column to slide the block · tap again to drop</p>
        <div class="gtower gk" id="gtower"></div>
        <div class="gctrl"><button aria-label="Slide left" data-k="l">◀</button><button aria-label="Drop" data-k="d">▼</button><button aria-label="Slide right" data-k="r">▶</button></div>
        <div class="row-btn"><button class="btn sm ghost" id="gquit">Done</button></div>`;
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
      el.innerHTML = `<div class="ghud"><div><small>Points</small><b id="gpts">0</b></div><div><small>${sum ? 'Target sum' : 'Largest'}</small><b id="gaux">${sum ? g.show(g.target) : '–'}</b></div><div><small>Next</small><b id="gnext" class="gnext"></b></div></div>
        <p class="small muted center gtip">${sum ? `Tap a column. Pair blocks that add up to <b>${g.show(g.target)}</b>.` : 'Tap a column to drop a block.'}</p><div class="gtower" id="gtower"></div><div class="row-btn"><button class="btn sm ghost" id="gquit">Done</button></div>`;
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
    } else if (g.type === 'pinang') {
      // Kelas sekaligus satu regu; rekor kelas = paling sedikit melorot, disimpan di perangkat layar kelas itu
      const TOP = 10, MQ = window.METIQ_MASCOT, KEY = 'metiq_pinang_' + g.id, PRIZE = { 4: '🎒', 7: '📚', 10: '🏆' };
      let rung = 0, slips = 0, busy = false, best = null;
      try { const b = localStorage.getItem(KEY); if (b !== null) best = +b; } catch (e) { /* mode privat */ }
      el.classList.add('pp-full');
      const pal = (who, pose, cls) => `<span class="${cls}">${MQ ? MQ.svg(pose, { size: 96, who, enter: false }) : '🐙'}</span>`;
      el.innerHTML = `<div class="pp"><div class="pp-scene"><div class="pp-pole">${[...Array(TOP)].map((_, i) => `<i style="bottom:${(i + 1) * 8.6}%">${PRIZE[i + 1] ? `<b data-r="${i + 1}">${PRIZE[i + 1]}</b>` : ''}</i>`).join('')}</div>
          <div class="pp-climb" id="ppc">${pal(undefined, 'cheer', 'm')}</div><div class="pp-pals" id="ppp">${pal('tito', 'happy', '')}${pal('nahla', 'happy', '')}${pal('lumo', 'happy', '')}</div></div>
        <div class="pp-play"><div class="pp-hud"><div><small>Level</small><b id="pph">0/${TOP}</b></div><div><small>Slides</small><b id="pps">0</b></div><div><small>Class record</small><b>${best === null ? '–' : `${best}× slides`}</b></div><button class="pp-fs" id="ppf" aria-label="Full screen">⛶</button></div>
          <div class="pp-q" id="ppq"></div><div class="pp-opts" id="ppo"></div></div></div>`;
      const fs = el.querySelector('#ppf');
      if (document.documentElement.requestFullscreen) fs.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); }); else fs.hidden = true;
      const climb = el.querySelector('#ppc'), draw = () => { climb.style.setProperty('--r', rung); el.querySelector('#pph').textContent = `${rung}/${TOP}`; el.querySelectorAll('.pp-pole b').forEach((b) => b.classList.toggle('got', rung >= +b.dataset.r)); };
      const ask = () => {
        const x = g.next(), box = el.querySelector('#ppo'); busy = false;
        el.querySelector('#ppq').innerHTML = (x.ask ? `<small>${x.ask}</small>` : '') + `<span>${x.text}${x.ask ? '' : ' = ?'}</span>`;
        box.innerHTML = x.options.map((o, i) => `<button class="pp-opt" data-i="${i}">${o}</button>`).join('');
        box.querySelectorAll('.pp-opt').forEach((b) => b.addEventListener('click', () => {
          if (!alive || busy) return; busy = true;
          if (x.options[+b.dataset.i] === x.answer) {
            sfx.correct(); b.classList.add('right'); rung++; draw();
            const p = el.querySelector('#ppp'); p.classList.remove('yay'); void p.offsetWidth; p.classList.add('yay');
            if (rung >= TOP) {
              pts = Math.max(1, TOP - slips); title = '🎉 Reached the top!';
              note = best === null || slips < best ? `New class record: ${slips}× slides` : `Slid ${slips}×. Class record ${best}×`;
              if (best === null || slips < best) { try { localStorage.setItem(KEY, String(slips)); } catch (e) { /* mode privat */ } }
              return later(end, 1400);
            }
            later(ask, 1100);
          } else {
            sfx.wrong(); b.classList.add('wrong'); box.querySelectorAll('.pp-opt').forEach((y) => { if (x.options[+y.dataset.i] === x.answer) y.classList.add('right'); });
            slips++; el.querySelector('#pps').textContent = slips; if (rung > 0) rung--; draw();
            climb.classList.remove('slip'); void climb.offsetWidth; climb.classList.add('slip');
            later(ask, 2000);
          }
        }));
      };
      draw(); ask();
    } else if (g.type === 'sheets') {
      // pilih lembar, lalu kerjakan; papan angka menulis ke kotak yang dipilih
      const pickSheet = () => {
        el.innerHTML = `<div class="lb-pick"><p>Choose a sheet:</p><div>${g.ns.map((n) => `<button class="lb-n" data-n="${n}">${g.op === 'x' ? '×' : g.op === ':' ? ':' : g.op === '-' ? '−' : '+'} ${n}</button>`).join('')}</div></div>`;
        el.querySelectorAll('.lb-n').forEach((b) => b.addEventListener('click', () => play(+b.dataset.n)));
      };
      const play = (n) => {
        const sh = sheet(g.op, n), boxes = []; let cur = 0, first = null;
        const cell = (x) => (typeof x === 'string' ? `<span>${x}</span>` : `<button class="lb-b" data-i="${boxes.push(x) - 1}"></button>`);
        el.innerHTML = `<div class="ghud"><div><small>Sheet</small><b>${sh.title}</b></div><div><small>Time</small><b id="gsec">0:00</b></div><div><small>Filled</small><b id="lb-fill">0</b></div></div>
          <div class="lb-sheet">${sh.parts.map(([k, t, lines]) => `<section><h4><b>${k}</b> ${t}</h4>${lines.map((ln, j) => `<div class="lb-ln"><small>(${j + 1})</small>${ln.map(cell).join('')}</div>`).join('')}</section>`).join('')}</div>
          <div class="lb-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-k="${d}">${d}</button>`).join('')}<button data-k="del" class="del" aria-label="Delete">⌫</button><button data-k="0">0</button><button data-k="next" class="nx" aria-label="Next box">⏎</button>
            <button data-k="check" class="ck">Check</button></div>`;
        const els = [...el.querySelectorAll('.lb-b')], val = boxes.map(() => '');
        const focus = (i) => { cur = i; els.forEach((b, j) => b.classList.toggle('on', j === i)); if (els[i]) els[i].scrollIntoView({ block: 'center', behavior: 'smooth' }); };
        const nextOpen = (from) => { for (let k = 1; k <= els.length; k++) { const j = (from + k) % els.length; if (!els[j].classList.contains('ok')) return j; } return from; };
        els.forEach((b, i) => b.addEventListener('click', () => { if (!b.classList.contains('ok')) focus(i); }));
        el.querySelectorAll('.lb-pad button').forEach((b) => b.addEventListener('click', () => {
          if (!alive) return;
          const k = b.dataset.k, box = els[cur];
          if (k === 'check') {
            const bad = els.filter((x, i) => String(boxes[i].a) !== val[i]);
            els.forEach((x, i) => { const ok = String(boxes[i].a) === val[i]; x.classList.toggle('ok', ok); x.classList.toggle('bad', !ok && val[i] !== ''); x.classList.toggle('miss', !ok && val[i] === ''); });
            if (first === null) first = Math.round(((els.length - bad.length) / els.length) * 100);
            if (!bad.length) { pts = first; sfx.correct(); return later(end, 900); }
            sfx.wrong(); el.querySelector('.ck').textContent = `Fix ${bad.length}, then Check`;
            return focus(els.indexOf(bad[0]));
          }
          if (!box || box.classList.contains('ok')) return;
          if (k === 'next') return focus(nextOpen(cur));
          val[cur] = k === 'del' ? val[cur].slice(0, -1) : (val[cur] + k).slice(0, 4);
          box.textContent = val[cur]; box.classList.remove('bad', 'miss');
          el.querySelector('#lb-fill').textContent = `${val.filter(Boolean).length}/${els.length}`;
        }));
        el.querySelector('#lb-fill').textContent = `0/${els.length}`;
        focus(0);
        tick = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000), x = el.querySelector('#gsec'); if (x) x.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }, 500);
      };
      pickSheet();
    } else if (g.type === 'tambang') {
      // pos: −5 (Tim Merah menang) … 0 … +5 (Tim Biru menang)
      const GOAL = 5, TT = 90, MQ = window.METIQ_MASCOT;
      el.classList.add('tt-wide'); // di layar besar kelas (IFP) memakai seluruh lebar layar
      let pos = 0; const score = { l: 0, r: 0 }, cur = {}, lock = { l: false, r: false };
      const side = (k) => `<section class="tt-side ${k}"><div class="tt-head"><b>${k === 'l' ? 'Red Team' : 'Blue Team'}</b><span id="tt-s${k}">0</span></div><div class="tt-q" id="tt-q${k}"></div><div class="tt-opts" id="tt-o${k}"></div></section>`;
      el.innerHTML = `<div class="gtime"><i></i></div><div class="tt-rope"><div class="tt-line"></div><div class="tt-mid"></div><div class="tt-goal l"></div><div class="tt-goal r"></div>
          <div class="tt-pull" id="tt-pull"><span class="tt-m l">${MQ ? MQ.svg('cheer', { size: 64, who: 'tito', enter: false }) : '🟥'}</span><span class="tt-cord"></span><span class="tt-flag">🚩</span><span class="tt-cord"></span><span class="tt-m r">${MQ ? MQ.svg('cheer', { size: 64, who: 'lumo', enter: false }) : '🟦'}</span></div>
          <small class="tt-sec"><b id="gsec">${TT}</b> seconds</small></div><div class="tt-sides">${side('l')}${side('r')}</div>`;
      const draw = () => { el.querySelector('#tt-pull').style.setProperty('--p', pos / GOAL); };
      const ask = (k) => {
        const x = g.next(); cur[k] = x;
        el.querySelector('#tt-q' + k).innerHTML = (x.ask ? `<small>${x.ask}</small>` : '') + x.text + (x.ask ? '' : ' = ?');
        const box = el.querySelector('#tt-o' + k);
        box.innerHTML = x.options.map((o, i) => `<button class="gopt" data-i="${i}">${o}</button>`).join('');
        box.querySelectorAll('.gopt').forEach((b) => b.addEventListener('click', () => {
          if (!alive || lock[k]) return;
          if (cur[k].options[+b.dataset.i] === cur[k].answer) {
            sfx.correct(); score[k]++; el.querySelector('#tt-s' + k).textContent = score[k];
            pos += k === 'l' ? -1 : 1; draw(); b.classList.add('right');
            const s = el.querySelector('.tt-side.' + k); s.classList.remove('pull'); void s.offsetWidth; s.classList.add('pull');
            if (Math.abs(pos) >= GOAL) { lock.l = lock.r = true; pts = Math.max(score.l, score.r); winner = pos < 0 ? 'Red Team' : 'Blue Team'; return later(end, 700); }
            later(() => ask(k), 250);
          } else {
            sfx.wrong(); b.classList.add('wrong'); lock[k] = true; el.querySelector('.tt-side.' + k).classList.add('lock');
            later(() => { lock[k] = false; el.querySelector('.tt-side.' + k).classList.remove('lock'); ask(k); }, 1200);
          }
        }));
      };
      ask('l'); ask('r'); draw();
      const bar = el.querySelector('.gtime i');
      tick = setInterval(() => {
        const left = Math.max(0, TT - (Date.now() - t0) / 1000); bar.style.width = (left / TT) * 100 + '%'; el.querySelector('#gsec').textContent = Math.ceil(left);
        if (left <= 0) { pts = Math.max(score.l, score.r); winner = pos < 0 ? 'Red Team' : pos > 0 ? 'Blue Team' : 'Tie'; end(); }
      }, 200);
    } else if (g.type === 'sudoku') {
      const { sol, puz, br, bc } = sudoku(g.n, g.clues), n = g.n, PIC = ['🍎', '🍌', '🍇', '🍊'];
      const sym = (v) => (v ? (g.pic ? PIC[v - 1] : String(v)) : '');
      const val = puz.slice(), given = puz.map((v) => !!v); let sel = given.indexOf(false), miss = 0;
      el.innerHTML = `<div class="ghud"><div><small>Empty boxes</small><b id="sd-left">0</b></div><div><small>Wrong</small><b id="gmiss">0</b></div><div><small>Time</small><b id="gsec">0</b></div></div>
        <div class="sd-grid n${n}${g.pic ? ' pic' : ''}" style="--n:${n}">${val.map((v, i) => { const r = Math.floor(i / n), c = i % n; return `<button class="sd-c${given[i] ? ' giv' : ''}${(c + 1) % bc === 0 && c < n - 1 ? ' br' : ''}${(r + 1) % br === 0 && r < n - 1 ? ' bb' : ''}" data-i="${i}" aria-label="Row ${r + 1}, column ${c + 1}">${sym(v)}</button>`; }).join('')}</div>
        <div class="sd-pad n${n}">${[...Array(n)].map((_, k) => `<button class="sd-k" data-v="${k + 1}">${sym(k + 1)}</button>`).join('')}<button class="sd-k del" data-v="0" aria-label="Delete">⌫</button></div>`;
      const cells = [...el.querySelectorAll('.sd-c')];
      const paint = () => {
        const r0 = Math.floor(sel / n), c0 = sel % n, b0 = Math.floor(r0 / br) * 10 + Math.floor(c0 / bc), sv = val[sel];
        cells.forEach((b, i) => { const r = Math.floor(i / n), c = i % n; b.classList.toggle('sel', i === sel); b.classList.toggle('near', i !== sel && (r === r0 || c === c0 || Math.floor(r / br) * 10 + Math.floor(c / bc) === b0)); b.classList.toggle('same', !!sv && i !== sel && val[i] === sv); });
        el.querySelector('#sd-left').textContent = val.filter((v, i) => v !== sol[i]).length;
      };
      cells.forEach((b) => b.addEventListener('click', () => { sel = +b.dataset.i; paint(); }));
      el.querySelectorAll('.sd-k').forEach((k) => k.addEventListener('click', () => {
        if (!alive || sel < 0 || given[sel]) return;
        const v = +k.dataset.v, b = cells[sel];
        val[sel] = v; b.textContent = sym(v); b.classList.remove('bad', 'ok');
        if (v) { if (v === sol[sel]) { b.classList.add('ok'); sfx.correct(); } else { b.classList.add('bad'); miss++; sfx.wrong(); el.querySelector('#gmiss').textContent = miss; } }
        paint();
        if (val.every((x, i) => x === sol[i])) { pts = Math.max(4, 20 - 3 * miss); cells.forEach((c) => c.classList.add('win')); later(end, 900); }
      }));
      paint();
      tick = setInterval(() => { const s = el.querySelector('#gsec'); if (s) s.textContent = Math.floor((Date.now() - t0) / 1000); }, 500);
    } else {
      const pairs = g.pairs(), cards = shuffle(pairs.flatMap(([a, b], i) => [{ i, html: a, k: 'q' }, { i, html: b, k: 'a' }]));
      let open = [], matched = 0, miss = 0;
      el.innerHTML = '<div class="ghud"><div><small>Pairs</small><b id="gpts">0/' + pairs.length + '</b></div><div><small>Wrong guesses</small><b id="gmiss">0</b></div><div><small>Time</small><b id="gsec">0</b></div></div>'
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
    return () => { alive = false; el.classList.remove('tt-wide', 'pp-full'); timers.forEach(clearTimeout); clearInterval(tick); };
  }

  // Teman Meti yang menemani setiap jenis permainan (bisa diganti per permainan dengan properti buddy)
  const BUDDY = { pinang: 'tito', lembar: 'tito', batang: 'nahla', timbang: 'lumo', sudoku: 'nahla', kilat: 'tito', garis: 'tito', susun: 'tito', kembar: 'tito', uang: 'tito', ukur: 'tito', nilai: 'tito', juring: 'nahla', bangun: 'nahla', pola: 'nahla', pasangan: 'nahla', jam: 'lumo', peta: 'lumo', grafik: 'lumo', balon: 'lumo' };
  const buddy = (x) => (x && (x.buddy || BUDDY[x.type])) || null;
  window.METIQ_GAMES = { GAMES, TYPES, HOW, EX, LOOK, BUDDY, buddy, art, starsFor, start, byId: (id) => GAMES.find((g) => g.id === id) };
})();
