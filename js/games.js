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
  GAMES.forEach((g) => { if (g.type === 'pasangan') g.stars = [10, 14, 17]; });
  const TYPES = { kilat: 'Cepat tepat · 60 detik', balon: 'Pecahkan balon · 60 detik', pasangan: 'Kartu memori' };
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
