/* Metiq — Mode Mengajar: guru mengajar satu bab di layar besar kelas (TV atau papan interaktif).
 * Alur seperti rencana pelajaran: Pembuka (animasi) → Materi (langkah dibuka satu per satu) → Soal ke depan
 * (siswa maju menjawab di layar) → Permainan kelompok (Tarik Tambang, Panjat Pinang) → Tiket keluar.
 * Papan tulis bisa dibuka kapan saja: kertas kosong, atau transparan untuk mencoret langsung di atas soal.
 * Tidak ada yang dicatat ke kemajuan siswa. Rute: #/kelas/<bab>/<langkah>.
 */
(function () {
  const { UNITS, SKILLS, unitsOf } = window.METIQ_CURRICULUM;
  const LES = window.METIQ_LESSONS || {};
  const AN = window.METIQ_ANIM, MQ = window.METIQ_MASCOT;
  const sfx = () => window.SFX || { correct() {}, wrong() {}, step() {} };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const strip = (h) => String(h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const norm = (x) => strip(x).toLowerCase().replace(/[−–]/g, '-').replace(/[.\s]/g, '').replace(/^rp/, '');
  const mascot = (pose, size, who) => (MQ ? MQ.svg(pose, { size, who: who || undefined, enter: false }) : '🐙');

  const STEPS = [['buka', '🎬', 'Pembuka'], ['materi', '📖', 'Materi'], ['maju', '🙋', 'Soal ke depan'], ['main', '🎲', 'Permainan'], ['tugas', '📲', 'Tugas siswa'], ['tiket', '🎟️', 'Tiket keluar']];
  const GROUP = [
    ['tambang', '🪢', 'Tarik Tambang', 'Kelas dibagi dua tim. Satu anak dari setiap tim maju ke layar dan menjawab bergantian. Jawaban benar menarik tali ke arah timnya. 90 detik.'],
    ['pinang', '🧗', 'Panjat Pinang', 'Satu kelas bekerja sama. Anak bergiliran maju menjawab. Benar: Meti naik. Salah: Meti melorot. Tanpa batas waktu.'],
  ];

  /* ---------- Soal dari bab yang dipilih ---------- */
  function gen(sid) {
    const sk = SKILLS[sid]; if (!sk) return null;
    try { const q = sk.gen(); return q && q.text ? Object.assign(q, { sid }) : null; } catch (e) { return null; }
  }
  const unitSkills = (u) => u.skills.map((s) => s.id).filter((id) => SKILLS[id]);
  // Soal pilihan ganda untuk permainan: pakai pilihan bawaan, atau buat pengecoh dari jawaban angka
  function numDistractors(ans) {
    const s = strip(ans).replace(/^Rp\s?/, ''), rp = /^Rp/.test(strip(ans)) ? 'Rp' : '';
    let m;
    if ((m = /^(−|-)?(\d+)\/(\d+)$/.exec(s))) {
      const n = +m[2], d = +m[3], sg = m[1] ? '−' : '';
      return [`${sg}${n + 1}/${d}`, `${sg}${Math.max(1, n - 1)}/${d}`, `${sg}${d}/${n}`, `${sg}${n}/${d + 1}`].filter((x) => x !== `${sg}${n}/${d}`);
    }
    const thou = /^\d{1,3}(\.\d{3})+$/.test(s), dec = /,/.test(s);
    const v = parseFloat(s.replace(/^−/, '-').replace(thou ? /\./g : /(?!)/, '').replace(',', '.'));
    if (!/^(−|-)?[\d.]+(,\d+)?$/.test(s) || !isFinite(v)) return null;
    const places = dec ? s.split(',')[1].length : 0, step = Math.pow(10, -places);
    const fmt = (x) => { const r = Math.round(x / step) * step, t = places ? r.toFixed(places).replace('.', ',') : thou || Math.abs(r) >= 10000 ? Math.round(r).toLocaleString('id-ID') : String(Math.round(r)); return rp + (r < 0 ? '−' + t.replace('-', '') : t); };
    const big = Math.abs(v) >= 100 ? 10 : 1;
    const cand = [v + step, v - step, v + 2 * step, v + big * step * 10, v - big * step * 10, v + 10 * step, v * 2];
    return [...new Set(cand.filter((x) => (v >= 0 ? x >= 0 : true)).map(fmt))].filter((x) => x !== strip(ans));
  }
  function toMC(q) {
    if (!q) return null;
    const ans = q.unit === 'Rp' && !/^Rp/.test(q.answer) ? 'Rp' + q.answer : String(q.answer);
    let opts;
    if (q.options && q.options.length >= 2) {
      const ok = q.options.find((o) => o === q.answer); if (!ok) return null;
      opts = shuffle([ok, ...shuffle(q.options.filter((o) => o !== ok)).slice(0, 3)]);
      return { ask: q.text, text: q.vis || '', answer: ok, options: opts };
    }
    const d = numDistractors(ans); if (!d || d.length < 2) return null;
    opts = shuffle([ans, ...shuffle(d).slice(0, 3)]);
    return { ask: q.text, text: q.vis || '', answer: ans, options: opts };
  }
  function mcNext(u) {
    const ids = unitSkills(u);
    for (let i = 0; i < 25; i++) { const x = toMC(gen(pick(ids))); if (x && strip(x.ask + x.text).length < 260) return x; }
    // bab yang soalnya tidak bisa dijadikan pilihan ganda: memakai soal Kilat kelas itu
    const k = (window.METIQ_GAMES.GAMES || []).find((g) => g.grade === u.grade && g.type === 'kilat');
    return k ? k.next() : { text: '2 + 3', answer: '5', options: ['4', '5', '6'] };
  }

  /* ---------- Daftar bab di dasbor guru ---------- */
  function pickerHTML(grade) {
    const units = unitsOf(grade);
    return `<section class="card kl-intro"><div class="kl-intro-in">${mascot('hello', 84)}<div><h2>📺 Mengajar di layar kelas</h2>
        <p>Buka di TV atau papan interaktif kelas, pilih bab, lalu ikuti urutannya. Tidak perlu persiapan: materi, contoh soal, dan permainan sudah siap.</p>
        <div class="kl-flow">${STEPS.map(([, e, l], i) => `<span><b>${i + 1}</b>${e} ${l}</span>`).join('')}</div>
        <p class="small muted">Tombol ✏️ Papan tulis selalu ada untuk menulis atau mencoret di atas soal. Jawaban di mode ini tidak masuk ke nilai siswa.</p></div></div></section>
      <div class="kl-units">${units.map((u) => {
        const n = unitSkills(u).length, les = LES[u.id];
        return `<a class="card kl-unit" href="#/kelas/${u.id}" style="--c:${u.color || '#2fd9b4'}"><span class="kl-uicon">${u.icon}</span>
          <span class="grow"><small class="muted">Bab ${esc(u.id)}</small><b>${esc(u.name)}</b>
          <span class="kl-tags">${AN && AN.has(u.id) ? '<i>🎬 Animasi</i>' : ''}${les ? `<i>📖 ${les.parts.length} materi</i>` : ''}<i>🙋 ${n} jenis soal</i><i>🎲 Permainan</i></span></span>
          <span class="kl-go">Mulai ▶</span></a>`;
      }).join('') || '<section class="card center"><p class="muted">Belum ada bab di kelas ini.</p></section>'}</div>`;
  }

  /* ---------- Papan tulis ---------- */
  const PENS = [['#16302b', 'Hitam'], ['#e0464b', 'Merah'], ['#2f6fe0', 'Biru'], ['#15a36b', 'Hijau'], ['#f59e0b', 'Kuning']];
  function makeBoard(host) {
    const el = document.createElement('div'); el.className = 'kl-board bg-kotak'; el.hidden = true;
    el.innerHTML = `<canvas></canvas><div class="kl-btools">
        ${PENS.map(([c, n], i) => `<button data-b="pen" data-c="${c}" class="${i ? '' : 'on'}" aria-label="Spidol ${n}"><i style="background:${c}"></i></button>`).join('')}
        <button data-b="erase" aria-label="Penghapus">🧽</button><span class="sep"></span>
        <button data-b="size" aria-label="Ketebalan">〰️<small>Tipis</small></button>
        <button data-b="bg" aria-label="Latar">▦<small>Kotak</small></button>
        <button data-b="over" aria-label="Tulis di atas layar">🪟<small>Di atas soal</small></button><span class="sep"></span>
        <button data-b="undo" aria-label="Urungkan">↶</button><button data-b="clear" aria-label="Hapus semua">🗑️</button>
        <button data-b="close" class="close" aria-label="Tutup papan tulis">✕ Tutup</button></div>`;
    host.appendChild(el);
    const cv = el.querySelector('canvas'), cx = cv.getContext('2d');
    let strokes = [], cur = null, color = PENS[0][0], erase = false, thick = false;
    const BGS = [['kotak', 'Kotak'], ['garis', 'Garis'], ['polos', 'Polos']]; let bgi = 0;
    const draw = (s) => {
      cx.save(); cx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
      cx.strokeStyle = s.c; cx.lineWidth = s.w; cx.lineCap = cx.lineJoin = 'round'; cx.beginPath();
      s.p.forEach(([x, y], i) => (i ? cx.lineTo(x, y) : cx.moveTo(x, y)));
      if (s.p.length === 1) cx.lineTo(s.p[0][0] + 0.1, s.p[0][1]);
      cx.stroke(); cx.restore();
    };
    const fit = () => {
      const r = el.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); strokes.forEach(draw);
    };
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', (e) => {
      cv.setPointerCapture(e.pointerId);
      const pen = e.pointerType === 'pen' ? 1.4 : 1;
      cur = { c: color, erase, w: (erase ? 34 : thick ? 9 : 4.5) * pen, p: [pos(e)] }; strokes.push(cur); draw(cur);
    });
    cv.addEventListener('pointermove', (e) => { if (!cur) return; cur.p.push(pos(e)); const n = cur.p.length; draw({ ...cur, p: cur.p.slice(n - 2) }); });
    const up = () => { cur = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    el.querySelector('.kl-btools').addEventListener('click', (e) => {
      const b = e.target.closest('[data-b]'); if (!b) return;
      const k = b.dataset.b;
      if (k === 'pen' || k === 'erase') { erase = k === 'erase'; if (!erase) color = b.dataset.c; el.querySelectorAll('[data-b=pen],[data-b=erase]').forEach((x) => x.classList.toggle('on', x === b)); }
      if (k === 'size') { thick = !thick; b.querySelector('small').textContent = thick ? 'Tebal' : 'Tipis'; }
      if (k === 'bg') { bgi = (bgi + 1) % BGS.length; el.className = el.className.replace(/bg-\w+/, 'bg-' + BGS[bgi][0]); b.querySelector('small').textContent = BGS[bgi][1]; }
      if (k === 'over') api.open(!el.classList.contains('over'));
      if (k === 'undo') { strokes.pop(); fit(); }
      if (k === 'clear') { if (!strokes.length || confirm('Hapus semua tulisan di papan?')) { strokes = []; fit(); } }
      if (k === 'close') api.close();
    });
    const onResize = () => { if (!el.hidden) fit(); };
    addEventListener('resize', onResize);
    const api = {
      // over: papan transparan di atas layar, untuk mencoret langsung di soal
      open(over) {
        el.hidden = false; el.classList.toggle('over', !!over);
        el.querySelector('[data-b=over] small').textContent = over ? 'Kertas' : 'Di atas soal';
        el.querySelector('[data-b=over]').firstChild.textContent = over ? '📄' : '🪟';
        document.body.classList.add('kl-boarding'); fit();
      },
      close() { el.hidden = true; document.body.classList.remove('kl-boarding'); },
      isOpen: () => !el.hidden,
      wipe() { strokes = []; if (!el.hidden) fit(); },
      // tulisan per soal (kertas coret siswa): simpan lalu muat lagi saat kembali ke soal itu
      save: () => strokes.slice(),
      load(arr) { strokes = (arr || []).slice(); if (!el.hidden) fit(); },
      destroy() { removeEventListener('resize', onResize); document.body.classList.remove('kl-boarding'); el.remove(); },
    };
    return api;
  }

  /* ---------- Layar Mengajar ---------- */
  function mount(root, uid, step, opts = {}) {
    const u = UNITS.find((x) => x.id === uid); if (!u) return null;
    const les = LES[uid], ids = unitSkills(u), kids = opts.kids || [], avHTML = opts.avHTML || (() => '🙂');
    const who = opts.buddy || null, kolomOf = opts.kolomOf || (() => '');
    if (!STEPS.some(([k]) => k === step)) step = 'buka';
    let stopGame = null, alive = true;
    document.body.classList.add('kl-on');
    root.innerHTML = `<div class="kl" style="--c:${u.color || '#2fd9b4'}">
      <header class="kl-top"><a class="kl-x" href="${opts.back || '#/guru/ajar'}" aria-label="Keluar dari mode mengajar">✕</a>
        <div class="kl-title"><small>${opts.meeting ? (opts.meeting.sub ? '🤝 Menggantikan · ' : '📅 Terjadwal · ') + esc(opts.meeting.className || '') : esc(opts.gradeName || '')} · Bab ${esc(u.id)}</small><b>${u.icon} ${esc(u.name)}</b></div>
        <nav class="kl-steps">${STEPS.map(([k, e, l], i) => `<button data-kl="step" data-s="${k}"><i>${i + 1}</i><span class="e">${e}</span><span class="l">${l}</span></button>`).join('')}</nav>
        <div class="kl-tools"><button class="kl-tbtn board" data-kl="board">✏️<span> Papan tulis</span></button><button class="kl-tbtn" data-kl="fs" aria-label="Layar penuh">⛶</button>${window.METIQ_JADWAL && opts.finishCtx ? '<button class="kl-tbtn fin" data-kl="finish">⏹<span> Selesai</span></button>' : ''}</div></header>
      <main class="kl-main" id="klm"></main></div>`;
    const main = root.querySelector('#klm');
    const board = makeBoard(root.querySelector('.kl'));

    // keadaan setiap langkah tetap tersimpan saat guru berpindah langkah
    const M = { p: 0, k: 0, ex: null, exShow: false };
    const Q = { sid: '', q: null, input: '', done: false, shown: false, n: 0, ok: 0, kid: null, used: [], tries: 0, star: null, picking: false };
    const T = { qs: null, show: false };
    const H = { q: null, show: false };

    let stopTask = null;
    // Catatan pertemuan untuk tombol Selesai (js/jadwal.js): langkah yang dipakai, materi, soal ke depan, bintang, permainan
    const LOG = { t0: (opts.meeting && opts.meeting.at) || Date.now(), steps: new Set(), maxPart: 0, front: 0, games: [], stars: 0 };
    const stopAll = () => { if (AN) AN.stop(); if (stopGame) { stopGame(); stopGame = null; } if (stopTask) { stopTask(); stopTask = null; } };
    function go(s) {
      stopAll(); step = s; board.close(); LOG.steps.add(s);
      try { history.replaceState(history.state, '', `#/kelas/${uid}/${s}`); } catch (e) { /* tidak wajib */ }
      root.querySelectorAll('[data-kl=step]').forEach((b) => b.classList.toggle('on', b.dataset.s === s));
      main.className = 'kl-main s-' + s; main.scrollTop = 0;
      ({ buka, materi, maju, main: games, tugas, tiket })[s]();
    }
    const nextBtn = (s, label) => `<button class="kl-btn" data-kl="step" data-s="${s}">${label} ▶</button>`;
    const qBlock = (q, big) => `<div class="kl-qtext ${big ? 'big' : ''}">${q.text}</div>${q.vis ? `<div class="kl-qvis qvis">${q.vis}</div>` : ''}`;
    const ansText = (q) => `${q.unit === 'Rp' && !/^Rp/.test(q.answer) ? 'Rp' : ''}${q.answer}${q.unit && q.unit !== 'Rp' ? ' ' + q.unit : ''}`;
    const solution = (q) => `<div class="kl-sol"><p class="kl-ans">Jawaban: <b>${ansText(q)}</b></p>${q.explain ? `<div class="kl-expl">${q.explain}</div>` : ''}${kolomOf(q, SKILLS[q.sid])}</div>`;

    /* 1. Pembuka: animasi bab dan pertanyaan pemantik */
    function buka() {
      if (!H.q) H.q = gen(ids[0]);
      const anim = AN && AN.has(uid);
      main.innerHTML = `<div class="kl-open ${anim ? '' : 'noanim'}">
        ${anim ? '<section class="kl-panel kl-animbox"><div id="kl-anim"></div></section>' : ''}
        <section class="kl-panel kl-hook"><div class="kl-say">${mascot('hello', 110, who)}<div class="kl-bubble"><p>${les ? les.intro : `Hari ini kita belajar <b>${esc(u.name)}</b>.`}</p></div></div>
          ${H.q ? `<div class="kl-hookq"><h3>🤔 Siapa yang bisa menjawab?</h3>${qBlock(H.q)}${H.q.options ? `<div class="kl-optline">${H.q.options.map((o) => `<span>${o}</span>`).join('')}</div>` : ''}
            ${H.show ? solution(H.q) : '<button class="kl-btn ghost" data-kl="hookshow">Tunjukkan jawaban</button>'}</div>` : ''}
          <div class="kl-row">${nextBtn('materi', 'Mulai materi')}</div></section></div>`;
      if (anim) AN.mount(main.querySelector('#kl-anim'), uid);
    }

    /* 2. Materi: satu subbab per layar, langkahnya dibuka satu per satu */
    function materi() {
      LOG.maxPart = Math.max(LOG.maxPart, M.p);
      if (!les) {
        main.innerHTML = `<section class="kl-panel center"><div class="kl-say">${mascot('think', 110, who)}<div class="kl-bubble"><p>Materi tertulis untuk bab ini belum ada. Ajak siswa langsung mencoba soal di depan kelas.</p></div></div>
          <ul class="kl-sklist">${u.skills.map((s) => `<li><b>${esc(s.code)}</b> ${esc(s.name)}</li>`).join('')}</ul><div class="kl-row">${nextBtn('maju', 'Soal ke depan')}</div></section>`;
        return;
      }
      const P = les.parts[M.p], all = M.k >= P.steps.length;
      if (!M.ex || M.ex.sid !== P.ex) { M.ex = gen(P.ex); M.exShow = false; }
      main.innerHTML = `<div class="kl-slide">
        <div class="kl-shead"><span class="kl-pn">${M.p + 1}<small>/${les.parts.length}</small></span><h2>${P.t}</h2>
          <div class="kl-pdots">${les.parts.map((_, i) => `<button data-kl="part" data-i="${i}" class="${i === M.p ? 'on' : i < M.p ? 'done' : ''}" aria-label="Materi ${i + 1}"></button>`).join('')}</div></div>
        <div class="kl-sbody"><ol class="kl-lsteps">${P.steps.map((st, i) => `<li class="${i < M.k ? 'show' : ''}${i === M.k - 1 ? ' now' : ''}">${st}</li>`).join('')}</ol>
          ${P.sg && all ? `<div class="kl-sg"><span>Cara Singapura</span> ${P.sg}</div>` : ''}
          ${all && M.ex ? `<div class="kl-ex"><h3>Ayo coba bersama!</h3>${qBlock(M.ex)}${M.ex.options ? `<div class="kl-optline">${M.ex.options.map((o) => `<span>${o}</span>`).join('')}</div>` : ''}
            ${M.exShow ? solution(M.ex) : ''}<div class="kl-row left">${M.exShow ? '' : '<button class="kl-btn ghost sm" data-kl="exshow">Tunjukkan cara</button>'}<button class="kl-btn ghost sm" data-kl="exnew">🔄 Contoh lain</button><button class="kl-btn ghost sm" data-kl="exboard">✏️ Coret di soal</button></div></div>` : ''}</div>
        <div class="kl-snav"><button class="kl-btn ghost" data-kl="mprev" ${M.p === 0 && M.k === 0 ? 'disabled' : ''}>◀ Kembali</button>
          <span class="kl-hint">Tombol panah ← → di papan ketik juga bisa</span>
          ${all ? (M.p < les.parts.length - 1 ? '<button class="kl-btn" data-kl="mnext">Materi berikutnya ▶</button>' : nextBtn('maju', 'Soal ke depan')) : `<button class="kl-btn" data-kl="mnext">${M.k === 0 ? 'Mulai' : 'Langkah berikutnya'} ▶</button>`}</div></div>`;
      if (M.k > 0 || all) sfx().step && sfx().step();
    }
    function mStep(d) {
      if (!les) return;
      const P = les.parts[M.p];
      if (d > 0) { if (M.k < P.steps.length) M.k++; else if (M.p < les.parts.length - 1) { M.p++; M.k = 0; } else return go('maju'); }
      else if (M.k > 0) M.k--; else if (M.p > 0) { M.p--; M.k = les.parts[M.p].steps.length; } else return;
      materi();
    }

    /* 3. Soal ke depan: soal besar, siswa maju menjawab di layar */
    function newQ() {
      const pool = Q.sid ? [Q.sid] : ids; let q = null;
      for (let i = 0; i < 6 && !q; i++) q = gen(pick(pool));
      Object.assign(Q, { q, input: '', done: false, shown: false, wrong: [], tries: 0, star: null, counted: false });
      board.wipe();
    }
    function maju() {
      if (!Q.q) newQ();
      const q = Q.q;
      if (!q) { main.innerHTML = '<section class="kl-panel center"><p>Soal untuk bab ini belum tersedia.</p></section>'; return; }
      const choice = q.type === 'choice' && q.options, numeric = /^[−\-\d.,/ ]+$/.test(strip(q.answer));
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ...(q.keys || (/[,]/.test(q.answer) ? [','] : /\//.test(q.answer) ? ['/'] : /[−-]/.test(q.answer) ? ['−'] : [])), '0'];
      main.innerHTML = `<div class="kl-front">
        <div class="kl-fbar"><select data-kl="sksel" aria-label="Jenis soal"><option value="">🎲 Acak dari bab ini</option>${u.skills.filter((s) => SKILLS[s.id]).map((s) => `<option value="${s.id}" ${Q.sid === s.id ? 'selected' : ''}>${esc(s.code)} ${esc(s.name)}</option>`).join('')}</select>
          ${kids.length ? `<button class="kl-btn ${Q.kid ? 'ghost' : ''} sm" data-kl="pick">🙋 ${Q.kid ? 'Ganti siswa' : 'Siapa yang maju?'}</button>` : ''}<span class="kl-who" id="klwho">${Q.kid ? `<span class="av sm">${avHTML(Q.kid.avatar)}</span> <b>${esc(Q.kid.name)}</b>, ayo jawab!` : kids.length && opts.ctx ? '<small class="muted">Pilih namamu dulu supaya dapat bintang ⭐</small>' : ''}</span>
          <span class="grow"></span><span class="kl-tally">Soal ${Q.n + 1} · ✅ ${Q.ok}</span></div>
        <section class="kl-panel kl-qcard ${Q.done ? 'ok' : ''}">
          <div class="kl-qmain">${qBlock(q, true)}
            ${choice ? `<div class="kl-opts ${q.options.every((o) => strip(o).length <= 5) ? 'short' : ''}">${q.options.map((o, i) => `<button class="kl-opt ${Q.done && o === q.answer ? 'right' : ''} ${(Q.wrong || []).includes(i) ? 'wrong' : ''}" data-kl="opt" data-i="${i}">${o}</button>`).join('')}</div>`
    : numeric ? `<div class="kl-inrow"><div class="kl-disp ${Q.done ? 'right' : ''}" id="kldisp">${Q.input || '&nbsp;'}</div>${q.unit ? `<span class="kl-unitlbl">${q.unit}</span>` : ''}</div>
              ${Q.done ? '' : `<div class="kl-keys">${keys.map((k) => `<button data-kl="key" data-k="${k}">${k}</button>`).join('')}<button data-kl="key" data-k="del" aria-label="Hapus">⌫</button><button class="chk" data-kl="check">Periksa</button></div>`}`
      : '<p class="kl-note">Siswa menulis jawabannya di papan tulis, lalu guru menunjukkan jawabannya.</p>'}
            ${Q.done ? `<div class="kl-cheer">${mascot('cheer', 96, who)}<b>Benar! Beri tepuk tangan 👏</b>${starNote()}</div>` : ''}
            ${Q.shown ? solution(q) : ''}</div></section>
        ${Q.picking ? pickerHTML2() : ''}
        <div class="kl-row"><button class="kl-btn ghost" data-kl="qboard">✏️ Coret di soal</button>${Q.shown ? '' : '<button class="kl-btn ghost" data-kl="qshow">Tunjukkan jawaban</button>'}<button class="kl-btn" data-kl="qnext">Soal berikutnya ▶</button></div></div>`;
    }
    // Bintang kelas: siswa yang memilih namanya dan benar di percobaan pertama (sebelum jawaban ditunjukkan) mendapat 1 bintang.
    // Jumlah bintang tidak ditampilkan di layar kelas; guru melihatnya di 📺 Mengajar → ⭐ Bintang kelas.
    const SES = () => window.METIQ_SESI;
    function starNote() {
      const st = Q.star;
      if (!st) return Q.kid && opts.ctx && (Q.tries || Q.shown) ? '<small class="kl-snote">Bintang hanya untuk jawaban benar di percobaan pertama. Coba lagi di soal berikutnya!</small>' : '';
      if (st === 'wait') return '<span class="kl-star">⭐ …</span>';
      if (st.err) return `<small class="kl-snote">${esc(st.err)}</small>`;
      return `<span class="kl-star pop">+1 ⭐ untuk ${esc(st.name)}</span><button class="kl-undo" data-kl="sundo">Batalkan</button>`;
    }
    async function award() {
      if (!Q.kid || !opts.ctx || !SES() || Q.tries || Q.shown || Q.star) return;
      const kid = Q.kid, q = Q.q; Q.star = 'wait';
      try {
        const id = await SES().stars.add(opts.ctx.c.id, kid.id, 1, uid, q.sid, strip(q.text).slice(0, 120));
        if (Q.q !== q) return;
        Q.star = { id, name: kid.name }; LOG.stars++; if (window.SFX && window.SFX.levelUp) window.SFX.levelUp();
      } catch (e) { if (Q.q !== q) return; Q.star = { err: SES().starsMissing(e) }; }
      if (step === 'maju') maju();
    }
    function pickerHTML2() {
      return `<div class="kl-picker" role="dialog" aria-label="Pilih nama siswa"><div class="kl-pkhead"><h3>🙋 Siapa yang maju? Ketuk namamu</h3><button class="kl-btn ghost sm" data-kl="who">🎲 Acak</button><button class="kl-btn ghost sm" data-kl="pclose">Tutup</button></div>
        <div class="kl-pkgrid">${kids.map((k) => `<button data-kl="pkid" data-id="${esc(k.id)}" class="${Q.kid && Q.kid.id === k.id ? 'on' : ''}"><span class="av">${avHTML(k.avatar)}</span><b>${esc(k.name)}</b></button>`).join('')}</div></div>`;
    }
    function judge(given, btn) {
      const q = Q.q; if (!q || Q.done) return;
      if (!Q.counted) { Q.counted = true; LOG.front++; }
      if (norm(given) === norm(q.answer)) {
        Q.done = true; Q.ok++; sfx().correct(); maju(); award();
      } else {
        Q.tries++; sfx().wrong();
        if (btn) { Q.wrong = [...(Q.wrong || []), +btn.dataset.i]; btn.classList.add('wrong'); }
        else { const d = main.querySelector('#kldisp'); if (d) { d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); } }
      }
    }
    function setKid(k) { Q.kid = k; Q.picking = false; if (k && !Q.used.includes(k.id)) Q.used.push(k.id); maju(); if (Q.done) award(); }
    function pickName() {
      if (!kids.length) return;
      if (Q.used.length >= kids.length) Q.used = [];
      const n = pick(kids.filter((k) => !Q.used.includes(k.id)));
      Q.picking = false; maju(); sfx().step && sfx().step();
      const el = main.querySelector('#klwho'); if (!el) return setKid(n);
      // efek undian singkat sebelum nama terpilih muncul
      let t = 0; const iv = setInterval(() => { if (!alive) return clearInterval(iv); el.innerHTML = `🎲 <b>${esc(pick(kids).name)}</b>`; if (++t > 10) { clearInterval(iv); setKid(n); } }, 70);
    }

    /* 4. Permainan kelompok dengan soal dari bab ini */
    function games() {
      main.innerHTML = `<div class="kl-gpick"><h2>Pilih permainan kelompok</h2><p class="muted">Semua soal diambil dari bab <b>${esc(u.name)}</b>. Mainkan di layar besar, siswa maju bergiliran.</p>
        <div class="kl-gcards">${GROUP.map(([k, e, n, d]) => `<button class="kl-gcard g-${k}" data-kl="gstart" data-g="${k}"><span class="kl-gart">${window.METIQ_GAMES.art ? window.METIQ_GAMES.art(k, 160) : e}</span><b>${e} ${n}</b><small>${d}</small><span class="kl-btn">Mulai ▶</span></button>`).join('')}</div>
        <div class="kl-tip">💡 <b>Cara membagi kelas:</b> hitung 1-2-1-2 dari ujung barisan. Nomor 1 Tim Merah, nomor 2 Tim Biru. Teman yang tidak maju boleh membantu dengan berhitung di buku.</div></div>`;
    }
    function startGame(type) {
      const G = window.METIQ_GAMES, look = (G.LOOK || {})[type] || ['#e0464b', '#fff'];
      const g = { id: 'kls' + uid, grade: u.grade, type, name: type === 'tambang' ? 'Tarik Tambang' : 'Panjat Pinang', stars: [3, 5, 7], next: () => mcNext(u) };
      main.innerHTML = `<main class="mq-screen mq-gplay kl-game" id="klg" style="--c:${look[0]};--bg:${look[1]}"></main>`;
      const area = main.querySelector('#klg');
      stopGame = G.start(area, g, ({ winner, title, note }) => {
        stopGame = null; LOG.games.push(`${g.name}${winner ? ': ' + winner : ''}`);
        if (window.SFX && window.SFX.mastered) window.SFX.mastered();
        area.innerHTML = `<div class="mq-gend kl-gend">${mascot('cheer', 160, who)}<h2>${title || (winner === 'Seri' ? '🤝 Seri! Dua tim sama kuat' : winner ? `🏆 ${winner} menang!` : 'Selesai!')}</h2>${note ? `<p class="mq-note">${esc(note)}</p>` : ''}
          <div class="kl-row"><button class="kl-btn" data-kl="gstart" data-g="${type}">Main lagi</button><button class="kl-btn ghost" data-kl="step" data-s="main">Permainan lain</button>${nextBtn('tugas', 'Tugas siswa')}</div></div>`;
      });
    }

    /* 5. Tugas siswa: soal bab ini dikirim ke perangkat siswa, hasilnya tampil langsung di layar kelas (js/sesi.js) */
    function tugas() {
      if (!window.METIQ_SESI || !opts.ctx) { main.innerHTML = `<section class="kl-panel center"><p>${opts.meeting && opts.meeting.sub ? 'Tugas ke perangkat siswa hanya bisa dikirim guru kelas. Sebagai guru pengganti, pakai Soal ke depan, Permainan, atau Tiket keluar.' : 'Masuk sebagai guru kelas untuk mengirim tugas ke siswa.'}</p></section>`; return; }
      main.innerHTML = '<div class="kl-task" id="kltask"></div>';
      stopTask = window.METIQ_SESI.quickTask(main.querySelector('#kltask'), opts.ctx, u);
    }

    /* 6. Tiket keluar: 3 soal pendek dari bagian bab yang berbeda, dikerjakan di buku */
    function tiket() {
      if (!T.qs) { T.qs = shuffle(ids.slice()).slice(0, 3).map(gen).filter(Boolean); T.show = false; }
      main.innerHTML = `<div class="kl-ticket"><div class="kl-thead"><h2>🎟️ Tiket keluar</h2><p>Tulis jawabannya di buku. Tunjukkan ke guru sebelum istirahat.</p></div>
        <ol class="kl-tlist">${T.qs.map((q) => `<li class="kl-panel">${qBlock(q)}${q.options ? `<div class="kl-optline">${q.options.map((o) => `<span>${o}</span>`).join('')}</div>` : ''}${T.show ? `<p class="kl-ans">Jawaban: <b>${ansText(q)}</b></p>` : ''}</li>`).join('')}</ol>
        <div class="kl-row"><button class="kl-btn ghost" data-kl="tnew">🔄 Soal lain</button><button class="kl-btn" data-kl="tshow">${T.show ? 'Sembunyikan jawaban' : 'Tunjukkan jawaban'}</button></div>
        <div class="kl-done">${mascot('happy', 90, who)}<p>Terima kasih sudah belajar bersama! Siswa bisa berlatih lagi di rumah lewat Metiq.</p></div></div>`;
    }

    /* ---------- Interaksi ---------- */
    function onClick(e) {
      const b = e.target.closest('[data-kl]'); if (!b || !root.contains(b)) return;
      const k = b.dataset.kl;
      if (k === 'step') return go(b.dataset.s);
      if (k === 'board') return board.isOpen() ? board.close() : board.open(false);
      if (k === 'finish') {
        const auto = { unit: uid, mins: Math.max(1, Math.round((Date.now() - LOG.t0) / 60000)), steps: STEPS.map(([x]) => x).filter((x) => LOG.steps.has(x)),
          parts: les ? `${Math.min(les.parts.length, LOG.maxPart + 1)}/${les.parts.length}` : '', front: LOG.front ? { n: LOG.front, ok: Q.ok } : null, stars: LOG.stars, games: LOG.games.slice(0, 6) };
        if (stopGame) { stopGame(); stopGame = null; }
        return window.METIQ_JADWAL.finishFromClass(root.querySelector('.kl'), opts.finishCtx, uid, auto, (id) => { location.hash = '#/guru/jadwal/' + id; });
      }
      if (k === 'fs') { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); return; }
      if (k === 'hookshow') { H.show = true; return buka(); }
      if (k === 'mnext') return mStep(1);
      if (k === 'mprev') return mStep(-1);
      if (k === 'part') { M.p = +b.dataset.i; M.k = 0; return materi(); }
      if (k === 'exshow') { M.exShow = true; return materi(); }
      if (k === 'exnew') { M.ex = null; board.wipe(); return materi(); }
      if (k === 'exboard' || k === 'qboard') return board.open(true);
      if (k === 'who') return pickName();
      if (k === 'pick') { Q.picking = !Q.picking; return maju(); }
      if (k === 'pclose') { Q.picking = false; return maju(); }
      if (k === 'pkid') { sfx().step && sfx().step(); return setKid(kids.find((x) => x.id === b.dataset.id) || null); }
      if (k === 'sundo') {
        const st = Q.star; if (!st || !st.id) return;
        Q.star = null; LOG.stars = Math.max(0, LOG.stars - 1); maju();
        return SES().stars.undo(st.id).catch((e) => { Q.star = st; maju(); alert(SES().starsMissing(e)); });
      }
      if (k === 'opt') return judge(Q.q.options[+b.dataset.i], b);
      if (k === 'key') {
        if (Q.done) return;
        Q.input = b.dataset.k === 'del' ? Q.input.slice(0, -1) : (Q.input + b.dataset.k).slice(0, 12);
        const d = main.querySelector('#kldisp'); if (d) { d.innerHTML = Q.input || '&nbsp;'; d.classList.remove('shake'); }
        return;
      }
      if (k === 'check') { if (Q.input) judge(Q.input); return; }
      if (k === 'qshow') { Q.shown = true; return maju(); }
      if (k === 'qnext') { Q.n++; Q.kid = null; Q.picking = false; newQ(); return maju(); }
      if (k === 'gstart') return startGame(b.dataset.g);
      if (k === 'tnew') { T.qs = null; return tiket(); }
      if (k === 'tshow') { T.show = !T.show; return tiket(); }
    }
    function onChange(e) {
      if (e.target.matches('[data-kl=sksel]')) { Q.sid = e.target.value; newQ(); maju(); }
    }
    function onKey(e) {
      if (e.target.closest('input,select,textarea')) return;
      if (e.key === 'Escape' && board.isOpen()) return board.close();
      if (step === 'materi' && (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ')) { e.preventDefault(); return mStep(1); }
      if (step === 'materi' && (e.key === 'ArrowLeft' || e.key === 'PageUp')) { e.preventDefault(); return mStep(-1); }
      if (step === 'maju' && Q.q && !Q.done && main.querySelector('#kldisp')) {
        if (/^[0-9,/]$/.test(e.key) || e.key === '-') { Q.input = (Q.input + (e.key === '-' ? '−' : e.key)).slice(0, 12); main.querySelector('#kldisp').innerHTML = Q.input; }
        else if (e.key === 'Backspace') { Q.input = Q.input.slice(0, -1); main.querySelector('#kldisp').innerHTML = Q.input || '&nbsp;'; }
        else if (e.key === 'Enter' && Q.input) judge(Q.input);
      }
    }
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
    go(step);
    return () => {
      alive = false; stopAll(); board.destroy();
      root.removeEventListener('click', onClick); root.removeEventListener('change', onChange); document.removeEventListener('keydown', onKey);
      document.body.classList.remove('kl-on');
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    };
  }

  window.METIQ_KELAS = { pickerHTML, mount, makeBoard, STEPS, _toMC: toMC, _mcNext: mcNext };
})();
