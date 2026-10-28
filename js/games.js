/* Metiq — permainan matematika: Kilat (cepat tepat), Balon (pecahkan yang sesuai aturan), Pasangan (kartu memori).
 * Tiga permainan untuk setiap kelas. Setiap ronde memberi 1–3 bintang sesuai poin.
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
  GAMES.forEach((g) => { if (g.type === 'pasangan') g.stars = [10, 14, 17]; });
  const TYPES = { kilat: 'Cepat tepat · 60 detik', balon: 'Pecahkan balon · 60 detik', pasangan: 'Kartu memori', susun: 'Balok jatuh · jumlah sasaran', kembar: 'Balok jatuh · gabung kembar' };
  const starsFor = (g, pts) => g.stars.filter((t) => pts >= t).length;

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

    if (g.type === 'kilat') {
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

  window.METIQ_GAMES = { GAMES, TYPES, starsFor, start, byId: (id) => GAMES.find((g) => g.id === id) };
})();
