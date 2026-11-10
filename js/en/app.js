/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — aplikasi utama: rute, tampilan siswa, guru, dan orang tua. */
(function () {
  const { UNITS, SKILLS, TAGS, GRADES, unitsOf, classify } = window.METIQ_CURRICULUM;
  const S = window.Store;
  const app = document.getElementById('app');
  const DAY = 864e5;
  // Bagian orang tua disembunyikan dari tampilan (kode dan data tetap ada). Ubah ke true untuk menampilkannya lagi.
  const PARENTS_ON = false;
  // Laporan orang tua lewat kode (kode orang tua satu anak, atau kode keluarga untuk semua kakak-adik) tetap terbuka walau akun orang tua dimatikan
  const PARENT_CODE_ON = true;
  // Tugas dari guru disembunyikan dulu di tampilan siswa: tahap ini guru belum banyak dilibatkan.
  // Fitur guru (memberi tugas, melihat kemajuan) tetap utuh. Ubah ke true untuk menampilkannya lagi.
  const TASKS_ON = false;
  // Bintang dihitung di server (lihat supabase/014_bintang_server.sql). Menyala lewat js/config.js.
  const STARS_SRV = !!(window.METIQ_CONFIG || {}).starsServer;

  /* ---------- Utilitas ---------- */
  const avHTML = (a) => window.METIQ_AVATARS.html(a);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const strip = (h) => String(h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const fmtTime = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };
  const ago = (ts) => { if (!ts) return 'never'; const d = Math.floor((Date.now() - ts) / DAY); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`; };
  const level = (s) => (s >= 100 ? ['Complete', 'lv4'] : s >= 80 ? ['Proficient', 'lv3'] : s >= 50 ? ['Developing', 'lv2'] : s > 0 ? ['Start', 'lv1'] : ['Not yet', 'lv0']);
  // Kelas yang sedang dipilih (seperti IXL, siswa boleh membuka kelas mana pun)
  const getGrade = () => { let g = 1; try { g = +localStorage.getItem('metiq_grade') || 1; } catch (e) {} return GRADES.some((x) => x.id === g) ? g : 1; };
  const setGrade = (g) => { try { localStorage.setItem('metiq_grade', g); } catch (e) {} };
  const gradeTabs = () => `<div class="gtabs" role="tablist">${GRADES.map((g) => `<button role="tab" class="${g.id === getGrade() ? 'on' : ''}" data-act="grade" data-g="${g.id}">${g.name}</button>`).join('')}</div>`;
  const curUnits = () => unitsOf(getGrade());
  // Nama jenjang untuk label (kelas 9 ke atas memakai nama mata pelajaran SMA, seperti IXL)
  const gname = (g) => (GRADES.find((x) => x.id === g) || {}).name || 'Grade ' + g;
  const gshort = (g) => (GRADES.find((x) => x.id === g) || {}).short || String(g);
  const chip = (s) => { const [l, c] = level(s); return `<span class="chip ${c}" title="${l}">${s >= 100 ? '🏆' : s}</span>`; };
  const session = { get() { try { return JSON.parse(localStorage.getItem('metiq_session')) || {}; } catch (e) { return {}; } }, set(v) { try { localStorage.setItem('metiq_session', JSON.stringify(v)); } catch (e) {} } };
  const go = (h) => { location.hash = h; };
  let timer = null;
  const Cloud = window.Cloud;
  // Mode server aktif jika Supabase dikonfigurasi, kecuali saat mencoba data contoh
  const cloudOn = () => Cloud.enabled && !session.get().demo;
  const loadingHTML = '<div class="loading"><span class="spin"></span>Loading…</div>';
  // Pengaturan kelas (lapisan iman opsional). Kosong = perilaku standar.
  const IMAN = window.METIQ_IMAN || {};
  const MQ = window.METIQ_MASCOT;
  // Teman Meti untuk bab sesuai topiknya: Lumo (waktu, koordinat, data), Nahla (geometri, pola, pecahan), Tito (ukur, uang); bab lain bergiliran
  function unitBuddy(u) {
    if (!u) return null;
    if (u.buddy !== undefined) return u.buddy;
    const t = `${u.name} ${u.km || ''}`;
    if (/waktu|jam|kalender|koordinat|data|diagram|grafik|statistik|peluang/i.test(t)) return 'lumo';
    if (/geometri|bangun|bentuk|pola|pecahan|sudut|simetri/i.test(t)) return 'nahla';
    if (/uang|ukur|panjang|berat|volume|luas|keliling/i.test(t)) return 'tito';
    // bab lain bergiliran Meti, Tito, Nahla, Lumo supaya jalur belajar tidak selalu sama
    const i = UNITS.filter((x) => x.grade === u.grade).indexOf(u);
    return i < 0 ? null : [null, 'tito', 'nahla', 'lumo'][i % 4];
  }
  const buddyName = (who) => (MQ.who(who) || MQ.who()).name;
  function curClass() {
    const ses = session.get();
    if (ses.role === 'siswa' || ses.role === 'ortu') { const k = S.student(ses.id); return k ? S.cls(k.classId) : null; }
    if (ses.role === 'guru') return S.cls(ses.classId) || S.db.classes.find((c) => c.teacherId === ses.id) || S.db.classes[0] || null;
    return null;
  }
  const settingsOf = (c) => { const x = (c && c.settings) || {}; return { konteks: x.konteks === 'islami' ? 'islami' : 'umum', adab: x.adab === true }; };
  const curSettings = () => settingsOf(curClass());
  const adabOn = () => session.get().role === 'siswa' && curSettings().adab;
  let loaded = { key: '', at: 0 };
  async function ensure(force) {
    if (!cloudOn()) return true;
    const ses = session.get();
    let key, fn, args;
    if (ses.role === 'guru' && ses.token) { key = 'g' + ses.token; fn = 'teacher_bundle'; args = { p_token: ses.token }; }
    else if (ses.role === 'siswa' && ses.code) { key = 's' + ses.id; fn = 'student_bundle'; args = { p_code: ses.code, p_student_id: ses.id }; }
    else if (ses.role === 'ortu' && ses.ptoken) { key = 'p' + ses.ptoken; fn = 'parent_home'; args = { p_token: ses.ptoken }; }
    else if (ses.role === 'ortu' && ses.pcode) { key = 'o' + ses.pcode; fn = 'parent_bundle'; args = { p_code: ses.pcode }; }
    else return true;
    if (!force && loaded.key === key && Date.now() - loaded.at < 30000) return true;
    if (loaded.key !== key) app.innerHTML = loadingHTML;
    try {
      const b = await Cloud.rpc(fn, args);
      if (!b) throw Object.assign(new Error('Data not found'), { status: 404 });
      S.loadBundle(b, ses.role === 'siswa' ? Cloud.pending(ses.id) : null, ses.id);
      loaded = { key, at: Date.now() };
      return true;
    } catch (e) {
      if (e.status) { session.set({}); loaded = { key: '', at: 0 }; toast(esc(e.message)); go('#/'); return false; }
      toast('You\'re offline. Showing the latest saved data.');
      return true;
    }
  }
  // Aksi guru di server: kirim, muat ulang data kelas, lalu tampilkan ulang
  async function tAct(fn, args, msg) {
    try { await Cloud.rpc(fn, Object.assign({ p_token: session.get().token }, args)); await ensure(true); if (msg) toast(msg); route(); }
    catch (e) { toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  const toast =(msg) => { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); };

  // Bacakan soal memakai suara bawaan perangkat. Jika perangkat tidak punya suara bahasa Indonesia, peramban akan membaca
  // dengan aksen Inggris, jadi dalam kasus itu tidak ada suara dan tombol speaker disembunyikan (kelas "has-tts" di <html>).
  const TTS_ON = true;
  const idVoice = () => { try { return TTS_ON && 'speechSynthesis' in window ? speechSynthesis.getVoices().find((x) => x.lang && /^en([-_]|$)/i.test(x.lang)) || null : null; } catch (e) { return null; } };
  const syncTTS = () => document.documentElement.classList.toggle('has-tts', !!idVoice());
  if ('speechSynthesis' in window) { syncTTS(); if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', syncTTS); else speechSynthesis.onvoiceschanged = syncTTS; }
  function speak(text) {
    const voice = idVoice(); if (!voice) return;
    const t = strip(text).replace(/−/g, ' minus ').replace(/\+/g, ' plus ').replace(/=/g, ' equals ').replace(/×/g, ' times ');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = 0.9;
    u.voice = voice; u.lang = voice.lang;
    speechSynthesis.speak(u);
  }  // Audio rekaman (cerita TK): diputar berurutan dan tidak bergantung pada suara bawaan perangkat
  let clipEl = null, clipQ = [], clipT = null;
  function stopClips() { clipQ = []; clearTimeout(clipT); if (clipEl) { clipEl.onended = null; clipEl.pause(); clipEl = null; } }
  function playClips(list, delay) {
    stopClips(); if ('speechSynthesis' in window) speechSynthesis.cancel();
    clipQ = (list || []).filter(Boolean);
    const next = () => { const src = clipQ.shift(); if (!src) { clipEl = null; return; } const a = new Audio(src); clipEl = a; a.onended = next; a.onerror = next; const p = a.play(); if (p && p.catch) p.catch(() => { if (clipEl === a) clipEl = null; }); };
    if (delay) clipT = setTimeout(next, delay); else next();
  }


  // Tombol emas di strip mode coba: siswa langsung mulai sungguhan (tanpa persetujuan), guru mengajukan akun guru
  const realBtn = () => { const r = session.get().role; return r === 'siswa' ? '<button class="mq-real" data-act="realstart" aria-label="Start learning for real"><span class="sp">✨</span>Start for real</button>' : r === 'guru' ? '<button class="mq-real" data-act="realsignup" data-k="guru" aria-label="Free teacher sign-up"><span class="sp">✨</span>Free teacher sign-up</button>' : ''; };
  const shell = (inner, opts = {}) => `
    <header class="top"><a href="#/" class="logo"><img class="logo-i" src="icons/icon.svg?v=69" alt="">Metiq<span class="alpha">Beta</span></a>${opts.right || ''}</header>
    <main class="wrap ${opts.cls || ''}">${session.get().demo ? `<div class="demobar">🧪 <span class="grow"><b>Demo mode</b>${tryInfo() && tryInfo().name ? ` · ${esc(tryInfo().name)}` : ''} · sample data on this device</span>${realBtn()}<button class="link" data-act="logout">Log out</button></div>` : ''}${inner}</main>`;

  /* ---------- Analitik (dipakai guru dan orang tua) ---------- */
  function stats(sid, days) {
    const since = days ? Date.now() - days * DAY : 0;
    const ans = S.answersOf(sid).filter((a) => a.ts >= since);
    const prog = S.progressAll(sid);
    const scores = Object.entries(prog).filter(([k]) => SKILLS[k]).map(([, v]) => v);
    const byDay = Array.from({ length: 7 }, (_, i) => { const start = new Date(); start.setHours(0, 0, 0, 0); const d0 = start.getTime() - (6 - i) * DAY; return { d0, n: ans.filter((a) => a.ts >= d0 && a.ts < d0 + DAY).length }; });
    return {
      answered: ans.length,
      correct: ans.filter((a) => a.ok).length,
      acc: pct(ans.filter((a) => a.ok).length, ans.length),
      ms: ans.reduce((s, a) => s + Math.min(a.ms || 0, 180000), 0),
      mastered: scores.filter((p) => p.score >= 100).length,
      proficient: scores.filter((p) => p.score >= 80).length,
      practiced: scores.filter((p) => p.att > 0).length,
      last: Math.max(0, ...ans.map((a) => a.ts)),
      byDay,
    };
  }
  function skillRows(sid) {
    const prog = S.progressAll(sid);
    return Object.entries(prog).filter(([k, p]) => SKILLS[k] && p.att > 0).map(([k, p]) => ({ id: k, skill: SKILLS[k], ...p, acc: pct(p.ok, p.att) }));
  }
  function tagCounts(answers) {
    const m = {};
    answers.filter((a) => !a.ok && a.tag).forEach((a) => { m[a.tag] = (m[a.tag] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }
  function strengths(sid) { return skillRows(sid).filter((r) => r.score >= 80).sort((a, b) => b.score - a.score || b.acc - a.acc); }
  function weaknesses(sid) {
    const ans = S.answersOf(sid);
    // Skor naik bertahap, jadi skor rendah baru berarti setelah 8 soal. Sebelum itu hanya banyaknya jawaban salah yang dihitung.
    return skillRows(sid).filter((r) => r.att >= 4 && r.score < 80 && (r.acc < 70 || (r.att >= 8 && r.score < 60))).sort((a, b) => a.acc - b.acc).map((r) => {
      const wrong = ans.filter((a) => a.skill === r.id && !a.ok).sort((a, b) => b.ts - a.ts);
      const tc = tagCounts(wrong);
      return { ...r, tag: tc[0] && tc[0][0] !== 'konsep' ? tc[0][0] : (tc[1] ? tc[1][0] : (tc[0] || [])[0]), example: wrong[0] };
    });
  }
  // Kelas yang pernah dikerjakan anak (untuk laporan); kelas 1 jika belum ada
  function reportGrades(sid) {
    const gs = [...new Set(skillRows(sid).map((r) => r.skill.grade))].sort();
    return gs.length ? gs : [getGrade()];
  }
  function unitScore(sid, u) {
    const prog = S.progressAll(sid);
    const sc = u.skills.map((s) => (prog[s.id] || {}).score || 0);
    return { avg: Math.round(sc.reduce((a, b) => a + b, 0) / sc.length), prof: sc.filter((x) => x >= 80).length, total: sc.length };
  }

  /* ---------- Beranda ---------- */
  // Elemen Kurikulum Merdeka untuk kartu "Mata pelajaran" dan penyaring di halaman Kurikulum
  const STRANDS = [
    { id: 'bil', name: 'Numbers & Operations', icon: '➗', desc: 'Addition, subtraction, multiplication, division, fractions, decimals, and number patterns.', c: '#ff7a59', bg: '#fff1ec', re: /Bilangan|Aljabar|Pengayaan/ },
    { id: 'geo', name: 'Geometry', icon: '🔺', desc: 'Shapes, 2D and 3D figures, angles, symmetry, and coordinates.', c: '#4d96ff', bg: '#eef4ff', re: /Geometri/ },
    { id: 'ukur', name: 'Measurement', icon: '📏', desc: 'Length, weight, time, money, area, perimeter, and volume.', c: '#1fbf9f', bg: '#e8fbf5', re: /Pengukuran|uang/ },
    { id: 'data', name: 'Data & Probability', icon: '📊', desc: 'Collecting, reading, and interpreting data, plus probability.', c: '#9b6dff', bg: '#f4efff', re: /Data/ },
  ];
  const strandUnits = (st, g) => UNITS.filter((u) => (g ? u.grade === g : true) && st.re.test(u.km || ''));
  function viewHome() {
    const ses = session.get();
    // Guru yang sudah masuk langsung ke dasbornya
    if (ses.role === 'guru' && (cloudOn() ? ses.token : S.teacher(ses.id))) return go('#/guru/ringkasan');
    const kid = ses.role === 'siswa' && S.student(ses.id);
    app.innerHTML = `<div class="mq-land">
      <header class="mq-lhead"><a class="mq-logo" href="#/"><img src="icons/icon.svg?v=69" alt="">Metiq<span class="alpha">Beta</span></a><span class="mq-lright"><a class="mq-tlink" href="#/guru">Teachers</a><button class="mq-lang" data-act="lang" aria-label="Switch language">${window.METIQ_LANG === 'en' ? 'EN' : 'ID'}</button></span></header>
      <section class="mq-hero">
        <div class="mq-stage" aria-label="Meti and friends"><span class="mq-sym a">+</span><span class="mq-sym b">×</span><span class="mq-sym c">=</span><span class="mq-sym d">7</span>
          <div class="st st-meti">${MQ.svg('hello', { size: 190 })}</div>
          <div class="st st-tito"><div class="hop">${MQ.svg('happy', { size: 96, who: 'tito', enter: false })}</div></div>
          <div class="st st-nahla"><div class="fly">${MQ.svg('cheer', { size: 86, who: 'nahla', enter: false })}</div></div>
          <div class="st st-lumo"><div class="jump">${MQ.svg('happy', { size: 92, who: 'lumo', enter: false })}</div><svg class="wave" viewBox="0 0 240 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 15 Q15 3 30 15 T60 15 T90 15 T120 15 T150 15 T180 15 T210 15 T240 15 V30 H0Z"/></svg></div></div>
        <h1>Learning math is <span>fun!</span></h1>
        <p>Short practice, level up, and collect rewards with Meti.</p>
        ${installGuideHTML()}
        ${kid ? `<a class="mq-resume" href="#/belajar"><span class="av">${avHTML(kid.avatar)}</span><span class="grow">${esc(kid.name)}<small style="display:block;font-weight:700;color:#6a7f7a">Continue learning</small></span>›</a>` : ''}
        <div class="mq-cta">${kid
    ? '<a class="mq-btn pulse" href="#/belajar">Keep learning</a><a class="mq-btn ghost" href="#/kode">Learning code</a>'
    : '<a class="mq-btn pulse" href="#/siswa-baru">Start learning</a><a class="mq-btn ghost" href="#/kode">I already have a code</a>'}</div>
        ${kid ? '' : '<p class="mq-land-alt"><a class="mq-link" href="#/mulai/siswa">Try it first with sample data</a></p><p class="mq-land-alt gshow" hidden><button class="mq-link" data-act="gkids">🔑 Continue learning with a parent\'s Gmail</button></p>'} <a class="mq-resume mq-parent" href="#/ortu"><span class="av">👨‍👩‍👧</span><span class="grow">I'm a parent<small>See your child's learning report with a code from the teacher</small></span>›</a>
      </section>
      <section class="mq-feat">
        <div style="--bg:#e6fffa"><span class="em">🎯</span>Questions at your level</div>
        <div style="--bg:#fff3c4"><span class="em">🎬</span>Animated lessons</div>
        <div style="--bg:#ffe3ec"><span class="em">🎁</span>Collect rewards</div>
      </section>
      <p class="mq-gb-t">For Pre-K through High School: Pre-K to Calculus</p>
      <div class="mq-gb">${GRADES.map((g) => `<span title="${g.name}">${g.short || g.id}</span>`).join('')}</div>
      <section class="mq-stats" id="landstats" hidden></section>
      <section class="mq-testi"><h2>What people say</h2>${marquee(TESTI.map(([who, role, text]) => `<figure><blockquote>${esc(text)}</blockquote><figcaption><b>${esc(who)}</b>${esc(role)}</figcaption></figure>`).join(''))}</section>
      <footer class="mq-lfoot"><a href="#/permainan">Games</a><a href="#/profesi">Careers</a><a href="#/olimpiade">Olympiad</a><a href="#/harga">Pricing</a><a href="#/panduan/siswa">Help</a><a href="#/ajukan">Request an account</a><a href="#/ajukan/status">Check status</a><a href="privasi.html">Privacy</a></footer>
    </div>`;
    loadLandingStats(); gReveal();
  }
  // Carousel berjalan tanpa putus: isi diulang 4 kali lalu digeser setengah panjangnya. Salinan disembunyikan dari pembaca layar.
  const marquee = (items, cls = '') => `<div class="mq-marq ${cls}"><div class="mq-marq-t"><div>${items}</div>${'<div aria-hidden="true">' + items + '</div>'}${'<div aria-hidden="true">' + items + '</div>'}${'<div aria-hidden="true">' + items + '</div>'}</div></div>`;
  const TESTI = [
    ['Shelvy', 'Giselle\'s parent', 'So cool... just like Duolingo. She\'s already used to doing it. And the scratch paper feature is really useful, especially since she uses a tablet'],
    ['Bunda Eneng', 'Teacher at TK Fathia, Sukabumi', 'We tried math with the Tug of War game on Metiq, and the kids were so excited!'],
    ['Ario', 'Student\'s parent', 'Really great... I happen to be teaching my child math every day too...'],
  ];
  // Angka nyata dari server (SQL 022), hanya total. Bagian ini tetap tersembunyi jika datanya belum ada.
  async function loadLandingStats() {
    if (!Cloud.enabled) return;
    let d; try { d = await Cloud.rpc('public_stats'); } catch (e) { return; }
    const box = document.getElementById('landstats'); if (!box || !d || !d.answers) return;
    const n = (x) => Number(x).toLocaleString('en-US'), im = d.improve || {};
    const tile = (v, l) => `<div><b>${v}</b><small>${l}</small></div>`;
    const up = im.pairs >= 30 && im.after > im.before ? `<div class="wide"><b>${im.before}% → ${im.after}%</b><small>accuracy rises when a child practices one skill for at least 10 questions (first 5 questions compared with the last 5)</small></div>` : '';
    box.innerHTML = `<h2>Learning on Metiq so far</h2>${marquee(tile(n(d.active30), 'active children in the last 30 days') + tile(n(d.answers), 'questions completed') + tile(d.accuracy + '%', 'answer accuracy') + tile(n(d.mastered), 'skills mastered') + up, 'rev stats')}`;
    box.hidden = false;
  }

  // Panduan memasang Metiq di layar utama HP (disembunyikan bila Metiq sudah dibuka sebagai aplikasi)
  function installGuideHTML() {
    const menu = (items, on) => `<div class="ig-menu">${items.map((x) => `<span class="${x === on ? 'on' : ''}">${x}</span>`).join('')}</div>`;
    const steps = [
      ['Tap the menu icon <b>☰</b> (three lines/dots) at the <b>bottom right</b> of the browser.', '<div class="ig-bar"><span>‹</span><span>›</span><span>⌂</span><span>▢</span><span class="on">☰</span></div>'],
      ['Choose <b>Add page to</b>.', menu(['History', 'Downloads', 'Saved pages', '⊕ Add page to', 'Settings'], '⊕ Add page to')],
      ['Choose <b>Home screen</b>.', menu(['Bookmarks', 'Quick access', 'Home screen', 'Install as web app'], 'Home screen')],
      ['Tap <b>Add</b>. The Metiq icon appears on your phone. Tap it to open Metiq anytime.', '<div class="ig-add"><img src="icons/icon.svg?v=69" alt=""><small>Metiq</small><div><span>Cancel</span><span class="on">Add</span></div></div>'],
    ];
    return `<details class="mq-install"><summary><span class="em">📲</span><span class="grow"><b>Add Metiq to your home screen</b><small>Open Metiq with one tap, just like an app</small></span><span class="chev">›</span></summary>
      <p class="ig-note">Steps for <b>Samsung Internet</b>:</p>
      <ol class="ig-steps">${steps.map(([t, pic], i) => `<li><span class="ig-n">${i + 1}</span><div class="ig-pic">${pic}</div><p>${t}</p></li>`).join('')}</ol>
      <p class="ig-note"><b>Chrome:</b> tap <b>⋮</b> at the top right → <b>Add to Home screen</b> → <b>Add</b>.<br><b>iPhone (Safari):</b> tap the Share button <b>⬆</b> → <b>Add to Home Screen</b> → <b>Add</b>.</p></details>`;
  }

  function viewCurriculum() {
    app.innerHTML = shell(`
      <a class="back" href="#/">← Back</a>
      <h1>Math Curriculum from Pre-K to High School</h1>
      <p class="muted">Each chapter lists the matching IXL, Singapore Math, and Indonesian Kurikulum Merdeka references.</p>
      <details class="card cdesign-wrap"><summary><b>🧭 How is this curriculum built, and why?</b></summary>${curriculumDesignHTML(false)}</details>
      ${gradeTabs()}
      <div class="vzpills strandpick"><button class="${ss.get('strand', '') ? '' : 'on'}" data-act="strand" data-s="">All</button>${STRANDS.map((st) => `<button class="${ss.get('strand', '') === st.id ? 'on' : ''}" data-act="strand" data-s="${st.id}">${st.icon} ${st.name}</button>`).join('')}</div>
      ${(() => { const st = STRANDS.find((x) => x.id === ss.get('strand', '')); const list = st ? strandUnits(st, getGrade()) : curUnits(); return list.length ? '' : `<section class="card center"><p class="muted">There's no ${st ? st.name : ''} chapter in ${GRADES.find((g) => g.id === getGrade()).name} yet. Try another grade.</p></section>`; })()}
      ${(STRANDS.find((x) => x.id === ss.get('strand', '')) ? strandUnits(STRANDS.find((x) => x.id === ss.get('strand', '')), getGrade()) : curUnits()).map((u) => `<section class="card unit" style="--c:${u.color}"><h2><span class="uicon">${u.icon}</span>${u.id}. ${u.name}</h2><p class="muted small">IXL: ${u.ixl} · Singapore Math: ${u.sg} · Kurikulum Merdeka: ${u.km}</p><a class="lessonlink" href="#/pelajaran/${u.id}">📖 Open lesson</a><ol>${u.skills.map((s) => `<li>${s.name}</li>`).join('')}</ol></section>`).join('')}
    `);
  }

  /* ---------- Siswa ---------- */
  /* ---------- Siswa: masuk, peta belajar, tugas, profil (gaya aplikasi belajar, sedikit teks, banyak gambar) ---------- */
  const IC = {
    job: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="12.5" rx="3"/><path d="M9 7.5V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8v1.7M3 13h18M12 12v2"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    spk: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V8a4 4 0 018 0v2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z"/></svg>',
    task: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4h6v3H9zM8.5 12h7M8.5 16h5"/></svg>',
    game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="11" rx="5.5"/><path d="M8 10.5v4M6 12.5h4"/><circle cx="15.5" cy="11.5" r=".8" fill="currentColor"/><circle cx="18" cy="14" r=".8" fill="currentColor"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M3 7h18v3H3zM12 7v13M12 7C9 3 6 5 8 7M12 7c3-4 6-2 4 0"/></svg>',
    me: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg>',
    clam: '<svg viewBox="0 0 100 100"><path d="M10 56c0 24 18 34 40 34s40-10 40-34z" fill="#1db796"/><path d="M10 56C10 30 28 12 50 12s40 18 40 44c-10-8-26-12-40-12S20 48 10 56z" fill="#35e0bd"/><path d="M50 12v30M31 18l8 26M69 18l-8 26" stroke="#1db796" stroke-width="3.5" stroke-linecap="round" fill="none"/><circle cx="50" cy="62" r="14" fill="#fff"/><circle cx="45" cy="57" r="4.5" fill="#e9fffb"/></svg>',
  };
  const todayStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const goalOf = (sid) => +ls.get('metiq_goal_' + sid, 10) || 10;
  const msToday = (sid) => S.answersOf(sid).filter((a) => a.ts >= todayStart()).reduce((t, a) => t + Math.min(a.ms || 0, 180000), 0);
  function streakOf(sid) {
    const days = new Set(S.answersOf(sid).map((a) => { const d = new Date(a.ts); d.setHours(0, 0, 0, 0); return d.getTime(); }));
    let cur = todayStart(), n = 0;
    if (!days.has(cur)) cur -= DAY;
    while (days.has(cur)) { n++; cur -= DAY; }
    return n;
  }
  const studentNow = () => { const ses = session.get(); return ses.role === 'siswa' ? S.student(ses.id) : null; };
  const todoCount = (st) => S.assignmentsFor(st.id).filter((a) => !S.isDone(a.id, st.id)).length;
  function syncTasks(st) { S.assignmentsFor(st.id).forEach((a) => { if (!S.isDone(a.id, st.id) && asgComplete(a, st.id)) markDone(a.id, st.id, 'siswa'); }); }
  // Menu bawah: ikon + nama, selalu terlihat
  function studentNav(active) {
    const st = studentNow(); if (!st) return '';
    const todo = TASKS_ON ? todoCount(st) : 0;
    const items = [['belajar', '#/belajar', 'Learn', IC.home], ...(TASKS_ON ? [['tugas', '#/tugas', 'Tasks', IC.task]] : []), ['main', '#/permainan', 'Play', IC.game], ['profesi', '#/profesi', 'Careers', IC.job], ...(adabOn() ? [] : [['hadiah', '#/hadiah', 'Rewards', IC.gift]]), ['aku', '#/aku', 'Me', IC.me]];
    return `<nav class="mq-nav" aria-label="Menu"><div class="mq-nav-in">${items.map(([k, h, l, ic]) => `<a href="${h}" class="${k === active ? 'on' : ''}">${ic}${l}${k === 'tugas' && todo ? `<span class="dot">${todo}</span>` : ''}</a>`).join('')}</div></nav>`;
  }
  // Dipakai halaman lama (permainan, hadiah) agar menu bawah ikut tampil untuk siswa
  function mqNavAfter(active) {
    if (!studentNow()) return;
    const m = app.querySelector('main.wrap'); if (m) m.classList.add('mq-has-nav');
    app.insertAdjacentHTML('beforeend', studentNav(active));
  }
  const mqPage = (inner, active) => `<div class="mq-page">${inner}</div>${studentNav(active)}`;

  // Layar penuh dengan tombol kembali dan maskot (masuk kelas, pilih nama)
  const mqBack = (href) => `<div class="mq-top"><a class="mq-ico" href="${href}" aria-label="Back">${IC.back}</a></div>`;

  function viewStudentEnter() {
    app.innerHTML = `<form data-form="classcode">${mqBack('#/')}
      <main class="mq-screen"><div class="mq-ob-body">
        <div class="mq-big-say"><div class="mq-bubble"><p>Enter the <b class="hl">class code</b> from your teacher!</p></div>${MQ.svg('ask', { size: 160 })}</div>
        <input class="mq-code" id="mqcode" name="code" maxlength="5" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" inputmode="text" placeholder="•••••" aria-label="Class code" required>
        <div class="mq-steps"><div><span class="n">1</span>Ask your teacher for the class code</div><div><span class="n">2</span>Type the code, then choose your name</div></div>
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn" id="mqgo" disabled>Log in</button><a class="mq-link" style="text-align:center" href="#/mulai/siswa">No code yet? Try it first</a></div></div></form>`;
    setTimeout(() => { const i = document.getElementById('mqcode'); if (i) i.focus(); }, 300);
  }

  // Mulai belajar tanpa kelas: cukup nama, lalu anak mendapat kode belajar pribadi.
  function viewStudentStart() {
    app.innerHTML = `<form data-form="newkid">${mqBack('#/')}
      <main class="mq-screen"><div class="mq-ob-body">
        <div class="mq-big-say"><div class="mq-bubble"><p>Hi! What's <b class="hl">your name</b>?</p></div>${MQ.svg('hello', { size: 170 })}</div>
        <input class="mq-name" name="name" maxlength="40" placeholder="Type your name" aria-label="Your name" autocomplete="off" required>
        <p class="mq-note">You don't need a class code yet. You can start learning now, and your teacher can add you later.</p>
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn pulse">Start learning</button><a class="mq-link" style="text-align:center" href="#/kode">Learned here before? Log in with a code</a></div></div></form>`;
    setTimeout(() => { const i = document.querySelector('input[name=name]'); if (i) i.focus(); }, 280);
  }

  // Masuk lagi memakai kode belajar (misalnya dari HP lain).
  function viewStudentCode() {
    app.innerHTML = `<form data-form="kidcode">${mqBack('#/')}
      <main class="mq-screen"><div class="mq-ob-body">
        <div class="mq-big-say"><div class="mq-bubble"><p>Enter <b class="hl">your learning code</b>.</p></div>${MQ.svg('ask', { size: 160 })}</div>
        <input class="mq-code" name="code" maxlength="6" placeholder="••••••" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" aria-label="Learning code" required>
        <div class="mq-steps"><div><span class="n">1</span>You'll find this code on the <b>Me</b> page</div><div><span class="n">2</span>Have a class code? <a class="mq-inline" href="#/siswa">Log in with a class code</a></div></div>
        <p class="gshow center" hidden><button type="button" class="gbtn" data-act="gkids">${GLOGO}<span>Forgot the code? Sign in with a parent's Gmail</span></button></p>
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn pulse">Log in</button><a class="mq-link" style="text-align:center" href="#/siswa-baru">No code yet? Start learning</a></div></div></form>`;
    setTimeout(() => { const i = document.querySelector('input[name=code]'); if (i) i.focus(); }, 280);
    gReveal();
  }

  async function viewStudentPick(code) {
    let c, kids;
    if (cloudOn()) {
      app.innerHTML = loadingHTML;
      try { const r = await Cloud.rpc('class_roster', { p_code: code }); if (!r) throw Object.assign(new Error('Class code not found'), { status: 404 }); c = r.class; kids = r.students; }
      catch (e) { toast(e.status ? 'Class code not found' : 'Can\'t connect to the server'); return go('#/siswa'); }
    } else {
      c = S.classByCode(code);
      if (!c) { toast('Class code not found'); return go('#/siswa'); }
      kids = S.studentsOf(c.id);
    }
    app.innerHTML = `${mqBack('#/siswa')}<main class="mq-screen"><div class="mq-ob-body" style="justify-content:flex-start">
      <div class="mq-say" style="align-self:stretch">${MQ.svg('hello', { size: 110 })}<div class="mq-bubble"><p>Who are you? <b class="hl">Tap your picture!</b><span class="sub">${esc(c.name)}</span></p></div></div>
      <div class="mq-kids">${kids.map((k) => `<button class="mq-kid" data-act="pickkid" data-id="${k.id}" data-code="${c.code}"><span class="av">${avHTML(k.avatar)}</span>${esc(k.name)}</button>`).join('') || '<p class="muted center">There are no students in this class yet. Ask your teacher to add your name.</p>'}</div>
    </div></main>`;
  }

  /* ----- Peta belajar ----- */
  // Urutan keterampilan satu kelas. Langkah "sekarang" = keterampilan pertama yang belum mahir; setelahnya terkunci
  // (kecuali sudah pernah dicoba atau ditugaskan guru). Kurikulum tetap menjadi dasar urutannya, tapi tidak diperlihatkan sebagai daftar.
  function pathModel(sid, g) {
    const prog = S.progressAll(sid), units = unitsOf(g);
    const tasks = new Set(S.assignmentsFor(sid).filter((a) => !S.isDone(a.id, sid)).flatMap((a) => a.skills));
    const flat = units.flatMap((u) => u.skills.map((s) => s.id));
    let cur = flat.findIndex((id) => ((prog[id] || {}).score || 0) < 80);
    if (cur < 0) cur = flat.length;
    const idx = {}; flat.forEach((id, i) => { idx[id] = i; });
    const st = (id) => {
      const p = prog[id] || {}, sc = p.score || 0;
      const state = sc >= 100 ? 'gold' : sc >= 80 ? 'done' : idx[id] === cur ? 'cur' : (p.att > 0 || tasks.has(id)) ? 'open' : 'locked';
      return { id, sc, att: p.att || 0, state, task: tasks.has(id) };
    };
    return { units, flat, cur, st };
  }
  const XS = [0, 46, 70, 46, 0, -46, -70, -46];
  function nodePop(id, x) {
    const st = studentNow(), sk = SKILLS[id]; if (!st || !sk) return '';
    const s = pathModel(st.id, sk.grade).st(id), ax = `calc(50% + ${x}px)`;
    if (s.state === 'locked') return `<div class="mq-pop lock" style="--ax:${ax}"><b>🔒 Not unlocked yet</b><small>Finish the previous step first</small><button class="mq-btn" data-act="tocur">Go to my step</button></div>`;
    const lvl = s.att ? `${level(s.sc)[0]} · score ${s.sc}` : 'Not tried';
    return `<div class="mq-pop" style="--ax:${ax}"><b>${esc(sk.name)}</b><small>${lvl}</small><a class="mq-btn" href="#/latihan/${id}">${s.sc >= 80 ? 'Practice again' : s.att ? 'Continue' : 'Start'}</a></div>`;
  }
  /* ---------- Sapaan di peta belajar (seperti sapaan pembuka di Claude) ----------
   * 30 kalimat untuk tanggal 1–30 dalam sebulan, ditambah sapaan sesuai jam. Larut malam selalu memakai sapaan larut.
   * Berganti setiap kali anak membuka Metiq (sesi baru), tetapi tetap sama selama satu sesi. {n} = nama depan. */
  const SAPA_HARI = [
    'Ready to go on, {n}?', '{n}, time to learn!', 'Come on, {n}, keep going!', 'What shall we learn today, {n}?', 'Is your brain ready to count, {n}?',
    'One more step, {n}!', '{n}, Meti is waiting for you!', 'Let\'s collect stars, {n}!', 'Going slowly is great too, {n}.', 'Ready to be a math champion, {n}?',
    'Hello again, {n}!', 'Shall we continue the adventure, {n}?', '{n}, the numbers missed you!', 'Try just one question, {n}?', 'Great, you came back, {n}!',
    'Let\'s keep your flame burning, {n}!', '{n}, today is going to be fun!', 'Mistakes are part of learning, {n}.', 'Want to beat your record, {n}?', 'Little by little, {n}!',
    '{n}, let\'s sharpen your brain!', 'Ready for a challenge, {n}?', 'Good to see you again, {n}!', 'You keep getting smarter, {n}!', 'Let\'s start with lots of energy, {n}!',
    '{n}, another chapter is waiting for you!', 'Dare to try a new question, {n}?', 'Time to be a great thinker, {n}!', 'Keep going, {n}!', '{n}, let\'s reach today\'s goal!',
  ];
  const SAPA_JAM = [
    [4, 11, ['Good morning, {n}!', 'What a bright morning, {n}!', 'Morning, {n}! Ready to learn?']],
    [11, 15, ['Good afternoon, {n}!', 'Afternoon, {n}! A little more?']],
    [15, 18, ['Good afternoon, {n}!', 'What a fun afternoon, {n}!']],
    [18, 22, ['Good evening, {n}!', 'A little learning before bed, {n}?']],
  ];
  const SAPA_LARUT = ['Studying at night, {n}?', 'Still going strong, {n}?', 'Don\'t forget to rest, {n}.'];
  function sapaan(name) {
    const n = esc(String(name || '').trim().split(/\s+/)[0] || 'you'), now = new Date(), h = now.getHours(), day = now.getDate();
    let visit = 0;
    try {
      const keep = sessionStorage.getItem('metiq_sapa');
      if (keep) visit = +keep;
      else { visit = (+localStorage.getItem('metiq_sapa_n') || 0) + 1; localStorage.setItem('metiq_sapa_n', visit); sessionStorage.setItem('metiq_sapa', visit); }
    } catch (e) {}
    let t;
    if (h >= 22 || h < 4) t = SAPA_LARUT[(day + visit) % SAPA_LARUT.length];
    else if (visit % 3 === 0) { const j = SAPA_JAM.find(([a, b]) => h >= a && h < b)[2]; t = j[(day + visit) % j.length]; }
    else t = SAPA_HARI[(day - 1 + visit) % SAPA_HARI.length];
    return t.replace('{n}', n);
  }
  // bintang delapan sinar, seperti delapan lengan Meti
  const SAPA_IC = '<svg class="mq-hello-ic" viewBox="0 0 40 40" aria-hidden="true">' + [0, 45, 90, 135].map((a) => `<rect x="17.5" y="2" width="5" height="36" rx="2.5" transform="rotate(${a} 20 20)"/>`).join('') + '</svg>';
  function viewStudentHome() {
    const ses = session.get(); const st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    // Asesmen awal hanya sekali. Sesudah itu, "Lanjutkan belajarmu" langsung masuk ke peta.
    const skipped = sessionStorage.getItem('metiq_diag_skip') === st.id;
    if (!skipped && !S.onboarded(st.id)) return go('#/asesmen');
    if (!skipped && S.postPending(st.id)) return go('#/asesmen/akhir');
    syncTasks(st);
    const g = getGrade(), m = pathModel(st.id, g), goal = goalOf(st.id), mins = msToday(st.id) / 60000;
    const todo = TASKS_ON ? todoCount(st) : 0, unsent = cloudOn() ? Cloud.pendingCount(st.id) : 0, curId = m.flat[m.cur];
    const allDone = m.cur >= m.flat.length, isles = isleStates(m), cur = isles.find((x) => x.state === 'cur');
    const buddy = cur ? unitBuddy(cur.u) : null, sc = curId ? m.st(curId).sc : 0;
    // Kabut terangkat saat bab selesai: bandingkan bab "sekarang" dengan kunjungan sebelumnya
    const seenKey = `metiq_isle_${st.id}_${g}`; let fresh = null;
    try { const was = localStorage.getItem(seenKey), now = cur ? cur.u.id : 'all'; if (was && was !== now) fresh = was; localStorage.setItem(seenKey, now); } catch (e) {}
    const gradeSheet = `<div class="mq-modal" id="gsheet" hidden data-act="gclose"><div class="mq-sheet"><h2>Choose a grade</h2><div class="mq-grades">${GRADES.map((x) => { const sk = unitsOf(x.id).flatMap((u) => u.skills), pr = S.progressAll(st.id), dn = sk.filter((s) => ((pr[s.id] || {}).score || 0) >= 80).length; return `<button class="mq-g ${x.id === g ? 'on' : ''}" data-act="grade" data-g="${x.id}"><small>${x.stage || 'Grade'}</small><b>${x.short || x.id}</b><span class="bar"><i style="width:${pct(dn, sk.length)}%"></i></span></button>`; }).join('')}</div><button class="mq-btn ghost" style="margin-top:16px" data-act="gclose">Close</button></div></div>`;
    app.innerHTML = mqPage(`
      <div class="mq-bar">
        <button class="mq-chip grade" data-act="gsheet" aria-label="Choose a grade">${gname(g)} <small>▾</small></button>
        <button class="mq-chip" data-act="tip" data-t="🔥 ${streakOf(st.id)}-day learning streak" aria-label="Day streak"><span class="em">🔥</span>${streakOf(st.id)}</button>
        <button class="mq-chip star" data-act="tip" data-t="⭐ Your total stars: from practice, chapter tests, and games" aria-label="Stars"><span class="em">⭐</span>${S.starsOf(st.id)}</button>
        <button class="mq-ring ${mins >= goal ? 'done' : ''}" style="--p:${Math.min(100, (mins / goal) * 100)}" data-act="tip" data-t="🎯 Today's goal: ${Math.min(goal, Math.floor(mins))} of ${goal} minutes" aria-label="Daily goal"><span>🎯</span></button>
      </div>
      <section class="isle-hi"><div class="who">${MQ.svg('hello', { size: 76, who: buddy || undefined })}</div>
        <div class="grow"><h1>${sapaan(st.name)}</h1><p>Let's continue our math adventure!</p></div>
        ${allDone ? '' : `<button class="isle-score" data-act="tip" data-t="SmartScore for the step you're working on. Reach 80 to master it." aria-label="SmartScore ${sc}"><small>SmartScore</small><b>${sc}<i>⭐</i></b></button>`}</section>
      ${unsent ? `<div class="mq-demo">📶 ${unsent} answers are waiting for internet to reach your teacher.</div>` : ''}
      ${TASKS_ON && todo ? `<a class="mq-task" href="#/tugas"><span class="em">📌</span><b>${todo} tasks from your teacher</b><span>›</span></a>` : ''}
      ${allDone ? `<div class="mq-all">${MQ.svg('cheer', { size: 120 })}<div>All ${gname(g)} chapters are complete! 🎉</div><button class="mq-btn" style="margin-top:12px" data-act="gsheet">Choose another grade</button></div>` : ''}
      ${isleMapHTML(st, isles, fresh)}
      ${gradeSheet}`, 'belajar');
    // Pulau "sekarang" langsung terlihat di layar pertama
    setTimeout(() => { const c = document.querySelector('.isle.cur') || document.querySelector('.isle.done:last-of-type'); if (c) c.scrollIntoView({ block: 'center' }); }, 60);
  }

  /* ---------- Peta belajar: kepulauan matematika dengan kabut penemuan ----------
   * Satu pulau = satu bab. Keadaan pulau dihitung dari SmartScore siswa (pathModel), bukan gambar tetap:
   * done (berwarna, tanda hijau), cur (menonjol, bercahaya, penanda lokasi), visit (sudah dicoba, belum urutannya),
   * next (kabut tipis, siluet tanpa nama), fog (kabut tebal, siluet samar tanpa tulisan, paling banyak dua). */
  function isleStates(m) {
    const list = m.units.map((u) => {
      const ss = u.skills.map((s) => m.st(s.id)), done = ss.filter((s) => s.state === 'done' || s.state === 'gold').length;
      const started = done > 0 || ss.some((s) => s.state === 'open' || s.att > 0);
      const state = done === ss.length ? 'done' : ss.some((s) => s.state === 'cur') ? 'cur' : started ? 'visit' : 'new';
      return { u, ss, done, total: ss.length, state };
    });
    // Bab yang belum disentuh di antara pulau yang sudah terlihat: kabut tipis tanpa nama.
    // Sesudah pulau terakhir yang terlihat: satu tujuan berikutnya, lalu paling banyak dua siluet di kabut tebal.
    let last = -1; list.forEach((x, i) => { if (x.state !== 'new') last = i; });
    let after = 0;
    list.forEach((x, i) => { if (x.state !== 'new') return; if (i < last) x.state = 'next'; else x.state = after++ === 0 ? 'next' : after <= 3 ? 'fog' : 'gone'; });
    return list.filter((x) => x.state !== 'gone');
  }
  // Dunia setiap maskot. Bab milik maskot itu (unitBuddy) menjadi tempat di dunianya: Meti menjelajah laut,
  // Tito gurun, Nahla pegunungan, Lumo kepulauan. Tempat ke-k milik maskot yang sama memakai gambar ke-k (berputar).
  const WORLDS = {
    meti: { name: 'Meti\'s Sea', icon: '🐙', bg: '#8fd3f0', places: ['Coral Reef', 'Shipwreck', 'Kelp Forest', 'Pearl Clam'] },
    tito: { name: 'Tito\'s Desert', icon: '🐜', bg: '#fbe2b3', places: ['Sand Dunes', 'Oasis', 'Canyon Rock', 'Desert Camp'] },
    nahla: { name: 'Nahla\'s Mountains', icon: '🐝', bg: '#d3eecf', places: ['Mountain Lake', 'Savanna', 'Mountain Peak', 'Flower Meadow'] },
    lumo: { name: 'Lumo\'s Islands', icon: '🐬', bg: '#bdeaf6', places: ['Tropical Island', 'Volcano Island', 'Atoll', 'Lighthouse Island'] },
  };
  const worldOf = (u) => unitBuddy(u) || 'meti';
  const ISLE_TREE = (x, y, s, c) => `<path d="M${x} ${y - 26 * s}l${11 * s} ${22 * s}h${-22 * s}z" fill="${c}"/><path d="M${x} ${y - 16 * s}l${9 * s} ${18 * s}h${-18 * s}z" fill="${c}" opacity=".85"/><rect x="${x - 2 * s}" y="${y - 4 * s}" width="${4 * s}" height="${6 * s}" fill="#8a5a3c"/>`;
  const PALM = (x, y, s) => `<path d="M${x} ${y}q${4 * s} ${-22 * s} ${-2 * s} ${-44 * s}" stroke="#9a6a3f" stroke-width="${5 * s}" fill="none" stroke-linecap="round"/>${[[-26, -8], [24, -10], [-14, -22], [16, -24], [2, -30]].map(([dx, r]) => `<ellipse cx="${x - 2 * s + dx * s * 0.5}" cy="${y - 46 * s}" rx="${15 * s}" ry="${5 * s}" fill="#2fa66a" transform="rotate(${r + (dx > 0 ? 20 : -20)} ${x - 2 * s} ${y - 46 * s})"/>`).join('')}<circle cx="${x - 2 * s}" cy="${y - 43 * s}" r="${3 * s}" fill="#8a5a3c"/>`;
  const FISH = (x, y, c, f) => `<g transform="translate(${x} ${y}) scale(${f ? -1 : 1} 1)"><ellipse rx="9" ry="5.5" fill="${c}"/><path d="M8 0l8-6v12z" fill="${c}"/><circle cx="-4" cy="-1.5" r="1.4" fill="#04382e"/></g>`;
  const BUB = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.6"/>`;
  // Lencana simbol bab (mis. +, ×, ½) supaya setiap tempat tetap menunjukkan babnya
  const SYMB = (u, ring) => { const lg = u && CH_LOGO.find((x) => x[0].test(u.name)); if (!lg) return ''; const t = lg[1]; return `<circle cx="28" cy="30" r="15" fill="#fff" stroke="${ring}" stroke-width="3"/><text x="28" y="${t.length > 2 ? 34 : 36}" text-anchor="middle" font-size="${t.length > 2 ? 11 : t.length > 1 ? 14 : 18}" font-weight="900" fill="${lg[2]}" font-family="Nunito,sans-serif">${esc(t)}</text>`; };
  function placeSVG(who, v, ghost, u) {
    v %= 4;
    let g = '';
    if (who === 'meti') {
      const bed = '<path d="M6 120Q60 96 120 104t114 8q4 22-12 26H18Q2 136 6 120z" fill="#f2d79b"/><path d="M30 126q40-10 80-4t96 0" stroke="#e2c27f" stroke-width="3" fill="none" opacity=".7"/>';
      if (ghost) return `<svg class="isle-svg" viewBox="0 0 240 150" aria-hidden="true"><g fill="#d9e8f0">${bed.replace(/fill="[^"]+"/g, '')}<path d="M90 106c0-30 14-48 30-48s30 18 30 48z"/></g></svg>`;
      const rays = '<path d="M60 0l20 0-40 110h-12zM150 0h14l-6 100h-10z" fill="#fff" opacity=".12"/>';
      const scene = [
        // terumbu karang
        '<path d="M66 112V82M66 94L54 78M66 90l12-14M54 78v-8M78 76v-8" stroke="#ff6f91" stroke-width="7" stroke-linecap="round" fill="none"/><rect x="100" y="78" width="11" height="34" rx="5.5" fill="#ff9f43"/><rect x="113" y="70" width="11" height="42" rx="5.5" fill="#ffb86b"/><rect x="126" y="84" width="11" height="28" rx="5.5" fill="#ff9f43"/><path d="M150 112a24 24 0 0 1 48 0z" fill="#9b6dff"/><path d="M174 112l-16-20M174 112V88M174 112l16-20" stroke="#c7a8ff" stroke-width="2"/><circle cx="94" cy="110" r="7" fill="#ffd166"/>' + FISH(180, 52, '#ffad33') + FISH(96, 44, '#4d96ff', true),
        // kapal karam
        '<g transform="rotate(-9 120 100)"><path d="M58 88h124l-18 28H76z" fill="#8a5a3c"/><rect x="58" y="82" width="124" height="9" rx="2" fill="#6d452c"/><circle cx="86" cy="100" r="4.5" fill="#2b6f8f"/><circle cx="110" cy="100" r="4.5" fill="#2b6f8f"/><circle cx="134" cy="100" r="4.5" fill="#2b6f8f"/><rect x="117" y="34" width="6" height="50" fill="#6d452c"/><path d="M123 38l34 12-9 7 6 11-31-5z" fill="#f4ecd8" opacity=".9"/></g><path d="M192 116q-8-14 0-26t0-24" stroke="#3fae6a" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="36" y="104" width="22" height="14" rx="3" fill="#c8741a"/><rect x="36" y="100" width="22" height="7" rx="3" fill="#e08a2c"/><rect x="45" y="100" width="4" height="18" fill="#ffc800"/>' + FISH(200, 48, '#ff6f91', true),
        // hutan alga
        [44, 76, 108, 140, 172, 204].map((x, i) => `<path d="M${x} 116q${i % 2 ? 10 : -10} -20 0 -40t0 -44" stroke="${i % 2 ? '#3fae6a' : '#5fc77a'}" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="${x + (i % 2 ? 7 : -7)}" cy="${78 - (i % 3) * 8}" rx="7" ry="3.5" fill="#7ad68a" transform="rotate(${i % 2 ? 30 : -30} ${x} 78)"/>`).join('') + FISH(126, 50, '#ffad33') + FISH(88, 66, '#9b6dff', true),
        // kerang mutiara
        '<path d="M86 108q34 14 68 0l-6-16H92z" fill="#f7b2c4"/><path d="M92 92q28-44 56 0z" fill="#ffc9d6"/><path d="M104 92q16-30 32 0M120 50v42" stroke="#f08fa8" stroke-width="2" fill="none"/><circle cx="120" cy="96" r="9" fill="#fff"/><circle cx="117" cy="93" r="3" fill="#e6f7ff"/><path d="M182 110l4-10 4 10 10 1-8 6 3 10-9-6-9 6 3-10-8-6z" fill="#ff8a3d"/><ellipse cx="56" cy="112" rx="16" ry="8" fill="#b9a68a"/><ellipse cx="70" cy="114" rx="10" ry="6" fill="#a8957a"/>' + FISH(60, 54, '#4d96ff'),
      ][v];
      g = rays + bed + scene + BUB(200, 30, 4) + BUB(208, 18, 2.5) + BUB(46, 66, 3) + SYMB(u, '#1c9be8');
    } else if (who === 'tito') {
      const dune = '<path d="M6 118Q60 72 120 92q50-28 114 22 4 16-14 20H20Q2 132 6 118z" fill="#f2c27b"/><path d="M30 112q40-34 90-18" stroke="#f9dcab" stroke-width="4" fill="none"/>';
      if (ghost) return `<svg class="isle-svg" viewBox="0 0 240 150" aria-hidden="true"><g fill="#e9e3d6">${dune.replace(/fill="[^"]+"/g, '').replace(/stroke="[^"]+"/, 'stroke="none"')}<path d="M100 98c0-24 10-40 20-40s20 16 20 40z"/></g></svg>`;
      const sun = '<circle cx="206" cy="28" r="14" fill="#ffd36b"/><circle cx="206" cy="28" r="20" fill="#ffd36b" opacity=".25"/>';
      const cactus = (x, y, s) => `<rect x="${x - 5 * s}" y="${y - 40 * s}" width="${10 * s}" height="${40 * s}" rx="${5 * s}" fill="#3fae6a"/><path d="M${x - 5 * s} ${y - 22 * s}h${-8 * s}v${-12 * s}M${x + 5 * s} ${y - 28 * s}h${8 * s}v${-10 * s}" stroke="#3fae6a" stroke-width="${7 * s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      const scene = [
        '<path d="M120 92q40-34 100 8" fill="#e8ad62"/>' + cactus(70, 104, 1) + cactus(180, 102, 0.7) + '<ellipse cx="128" cy="104" rx="10" ry="4" fill="#d9a35a"/>',
        '<ellipse cx="122" cy="104" rx="46" ry="12" fill="#5cc2e8"/><ellipse cx="114" cy="101" rx="20" ry="4" fill="#bdeaf6" opacity=".7"/>' + PALM(88, 100, 0.9) + PALM(158, 98, 0.75) + '<path d="M70 110l4-12 3 12M176 108l3-10 3 10" stroke="#3fae6a" stroke-width="3" fill="none"/>',
        '<path d="M66 106V62q0-8 8-8h92q8 0 8 8v44z" fill="#d9774a"/><path d="M100 106V86a20 20 0 0 1 40 0v20z" fill="#f2c27b"/><path d="M66 74h108M66 90h34M140 90h34" stroke="#b85f37" stroke-width="3"/>' + cactus(196, 108, 0.6),
        '<path d="M78 108l34-50 34 50z" fill="#ff8a3d"/><path d="M112 58l12 50h-24z" fill="#ffc06b"/><path d="M95 84l17-26 17 26" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/><path d="M112 58V42l14 5-14 5" stroke="#6a7f7a" stroke-width="2" fill="#e8463a"/><path d="M168 106l8-10 8 10" fill="#ff6f3d"/><path d="M170 106l6-6 6 6" fill="#ffc800"/><rect x="162" y="104" width="28" height="4" rx="2" fill="#8a5a3c"/>',
      ][v];
      g = sun + dune + scene + SYMB(u, '#e0a800');
    } else if (who === 'nahla') {
      const hill = '<ellipse cx="120" cy="134" rx="112" ry="13" fill="#9fd7b0" opacity=".6"/><path d="M14 112q8-32 50-38 56-10 112 0 42 8 50 38-4 20-24 22H38q-22-2-24-22z" fill="#7fcd6c"/><path d="M40 92q60-22 160 0" stroke="#a5e48f" stroke-width="6" fill="none" opacity=".7"/>';
      if (ghost) return `<svg class="isle-svg" viewBox="0 0 240 150" aria-hidden="true"><g fill="#dde8e4"><path d="M14 112q8-32 50-38 56-10 112 0 42 8 50 38-4 20-24 22H38q-22-2-24-22z"/><path d="M90 80l30-50 30 50z"/></g></svg>`;
      const mts = '<path d="M30 84l40-56 40 56zM100 84l44-64 46 64z" fill="#9db7c9"/><path d="M60 42l10-14 10 14-10-4zM134 34l10-14 10 14-10-4z" fill="#fff"/>';
      const flower = (x, y, c) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/><circle cx="${x}" cy="${y}" r="1.6" fill="#ffc800"/>`;
      const scene = [
        mts + hill + '<ellipse cx="120" cy="100" rx="44" ry="11" fill="#5cc2e8"/><ellipse cx="110" cy="98" rx="18" ry="3" fill="#bdeaf6" opacity=".8"/>' + ISLE_TREE(46, 106, 1, '#2fa66a') + ISLE_TREE(190, 104, 0.9, '#2fa66a') + ISLE_TREE(176, 112, 0.7, '#2fa66a'),
        '<circle cx="200" cy="26" r="13" fill="#ffd36b"/>' + hill.replace('fill="#7fcd6c"', 'fill="#e2c25a"').replace('stroke="#a5e48f"', 'stroke="#f1d77c"') + '<path d="M120 100V66" stroke="#8a5a3c" stroke-width="6" stroke-linecap="round"/><path d="M120 74l-14-8M120 70l12-10" stroke="#8a5a3c" stroke-width="4" stroke-linecap="round"/><ellipse cx="120" cy="58" rx="40" ry="10" fill="#4f9e4a"/><ellipse cx="112" cy="54" rx="24" ry="5" fill="#6dbb5c"/>' + [56, 66, 168, 182].map((x, i) => `<path d="M${x} 104l3-12 3 12" stroke="#c9a23d" stroke-width="2.5" fill="none"/>`).join(''),
        hill + '<path d="M66 96l54-82 54 82z" fill="#8aa1b5"/><path d="M120 14l18 28-10-4-8 8-8-8-10 4z" fill="#fff"/><path d="M120 14V-2" stroke="#6a7f7a" stroke-width="2"/><path d="M120-2l14 5-14 5z" fill="#e8463a" transform="translate(0 4)"/>' + ISLE_TREE(54, 106, 0.9, '#2fa66a') + ISLE_TREE(186, 106, 0.9, '#2fa66a'),
        hill + '<rect x="108" y="56" width="5" height="44" fill="#8a5a3c"/><g transform="translate(110 50)"><ellipse cy="0" rx="14" ry="8" fill="#ffc63a"/><ellipse cy="10" rx="17" ry="8" fill="#ffb21c"/><ellipse cy="20" rx="14" ry="7" fill="#ffc63a"/><circle cy="14" r="4" fill="#8a5a3c"/></g>' + [[54, 100, '#ff6f91'], [70, 108, '#9b6dff'], [150, 104, '#ff6f91'], [168, 98, '#4d96ff'], [186, 108, '#ff8a3d'], [86, 96, '#fff']].map(([x, y, c]) => flower(x, y, c)).join(''),
      ][v];
      g = scene + SYMB(u, '#19b796');
    } else {
      const sea = '<ellipse cx="120" cy="118" rx="116" ry="28" fill="#7fd8ea" opacity=".55"/>';
      if (ghost) return `<svg class="isle-svg" viewBox="0 0 240 150" aria-hidden="true"><g fill="#dbe8ee"><ellipse cx="120" cy="110" rx="86" ry="22"/><path d="M96 98c0-26 12-42 24-42s24 16 24 42z"/></g></svg>`;
      const beach = (c) => `<ellipse cx="120" cy="110" rx="88" ry="24" fill="#f6e3b4"/><ellipse cx="120" cy="104" rx="70" ry="18" fill="${c}"/>`;
      const scene = [
        beach('#7fd36e') + PALM(84, 104, 1) + PALM(160, 102, 0.8) + '<rect x="110" y="84" width="26" height="18" fill="#c8915a"/><path d="M104 86l19-16 19 16z" fill="#e0a85c"/><rect x="120" y="92" width="7" height="10" fill="#6d452c"/>',
        beach('#9aa4ad') + '<path d="M78 104l30-56h24l30 56z" fill="#7d6a5c"/><path d="M108 48h24l-4 8h-16z" fill="#ff8a3d"/><path d="M112 50l8 16 8-16" fill="#ffc800"/><circle cx="118" cy="34" r="8" fill="#c9d1d6" opacity=".9"/><circle cx="130" cy="24" r="10" fill="#dde3e7" opacity=".85"/><circle cx="142" cy="12" r="12" fill="#eef1f3" opacity=".8"/>',
        '<ellipse cx="120" cy="106" rx="90" ry="28" fill="#f6e3b4"/><ellipse cx="120" cy="104" rx="62" ry="16" fill="#3cc6d6"/><ellipse cx="112" cy="102" rx="28" ry="5" fill="#9eeaf2" opacity=".8"/>' + PALM(52, 106, 0.75) + PALM(194, 108, 0.65) + '<ellipse cx="120" cy="124" rx="14" ry="4" fill="#7fd36e"/>',
        '<ellipse cx="120" cy="108" rx="80" ry="24" fill="#8f9aa3"/><ellipse cx="120" cy="102" rx="62" ry="16" fill="#b2bbc2"/><path d="M110 98l3-58h14l3 58z" fill="#fff"/><path d="M112 82h16M112.6 70h14.8M113 58h14" stroke="#e8463a" stroke-width="7"/><rect x="111" y="32" width="18" height="10" rx="2" fill="#ffd36b"/><path d="M108 32h24l-12-10z" fill="#e8463a"/><path d="M130 37l40-10v20z" fill="#ffd36b" opacity=".35"/>',
      ][v];
      g = sea + scene + '<path d="M20 132q10-5 20 0t20 0M180 136q10-5 20 0t20 0" stroke="#fff" stroke-width="2.5" fill="none" opacity=".8"/>' + SYMB(u, '#1c9be8');
    }
    return `<svg class="isle-svg" viewBox="0 0 240 150" aria-hidden="true">${g}</svg>`;
  }
  // Jejak di antara dua tempat: gelembung di laut, jejak kaki di gurun, batu di gunung, batu loncatan di kepulauan
  const isleLink = (dir, faint, who) => {
    const pts = [0.12, 0.3, 0.5, 0.7, 0.88].map((t) => [dir === 'lr' ? 40 + t * 120 : 160 - t * 120, 6 + t * 44]);
    const mark = {
      meti: ([x, y], i) => `<circle cx="${x}" cy="${y}" r="${4 + (i % 2) * 2}" fill="none" stroke="#fff" stroke-width="2" opacity=".9"/>`,
      tito: ([x, y], i) => `<ellipse cx="${x + (i % 2 ? 5 : -5)}" cy="${y}" rx="3.5" ry="5.5" fill="#d9a35a" opacity=".8"/>`,
      nahla: ([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="#b8c2b9"/><ellipse cx="${x}" cy="${y - 1}" rx="9" ry="4" fill="#d6ddd4"/>`,
      lumo: ([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="5" fill="#f6f1e4"/><ellipse cx="${x}" cy="${y + 2}" rx="11" ry="4" fill="#d9cdb4" opacity=".6"/>`,
    }[who];
    return `<div class="isle-link ${faint ? 'faint' : ''}" aria-hidden="true"><svg viewBox="0 0 200 56" preserveAspectRatio="none">${pts.map(mark).join('')}</svg></div>`;
  };
  // Campuran dua warna hex, untuk perpindahan latar yang halus antardunia
  const mixHex = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t).toString(16).padStart(2, '0')).join('');
  function isleMapHTML(st, isles, fresh) {
    if (!isles.length) return '';
    const seen = {}, rows = isles.map((x) => { const who = worldOf(x.u), k = seen[who] = (seen[who] || 0) + 1; return { ...x, who, v: k - 1 }; });
    const bgOf = (r) => { const c = WORLDS[r.who].bg; return r.state === 'fog' ? mixHex(c, '#e9edf0', 0.9) : r.state === 'next' ? mixHex(c, '#e6ebee', 0.75) : c; }; // belum terbuka: abu-abu berkabut
    let out = '', prevWho = null;
    rows.forEach((x, i) => {
      const { u, state, who, v } = x, s = i % 2 ? 'r' : 'l', W = WORLDS[who], place = W.places[v % 4];
      const bg = bgOf(x), top = i ? mixHex(bgOf(rows[i - 1]), bg, 0.5) : bg, bot = i < rows.length - 1 ? mixHex(bg, bgOf(rows[i + 1]), 0.5) : '#ffffff';
      const reveal = fresh && (state === 'cur' || state === 'next') ? ' reveal' : '', just = fresh === u.id ? ' just' : '';
      let html = i ? isleLink(s === 'r' ? 'lr' : 'rl', state === 'next' || state === 'fog', who) : '';
      if (who !== prevWho && state !== 'fog') html += `<div class="isle-region w-${who}"><span>${W.icon}</span>${W.name}</div>`;
      prevWho = state === 'fog' ? prevWho : who;
      if (state === 'fog') html += `<div class="isle fog ${s}" aria-hidden="true">${placeSVG(who, v, true, u)}<span class="fogl"></span></div>`;
      else if (state === 'next') html += `<button class="isle next ${s}${reveal}" data-act="tip" data-t="🌫️ This place is still covered in fog. Finish your current place to uncover it." aria-label="Next place, still covered in fog">${placeSVG(who, v, false, u)}<span class="fogl"></span><span class="isle-tag"><i>${IC.lock.replace('<svg', '<svg width="16" height="16"')}</i>Next destination</span></button>`;
      else {
        const t = S.testOf(st.id, u.id), stars = t ? '★'.repeat(chestTier(t.stars)) : '';
        const label = state === 'done' ? `<span class="isle-tag ok"><i>${IC.ok}</i><span><b>${esc(u.name)}</b><small>${place} · Completed${stars ? ` <em>${stars}</em>` : ''}</small></span><u>›</u></span>`
          : `<span class="isle-tag"><span><b>${esc(u.name)}</b><small>${place} · ${x.done} / ${x.total} skills</small></span><u>›</u></span>`;
        html += `<a class="isle ${state} ${s}${reveal}${just}" href="#/bab/${u.id}" aria-label="Chapter ${u.id} ${esc(u.name)}, ${place}">${state === 'cur' ? `<span class="isle-pin" aria-hidden="true"></span><span class="isle-glow" aria-hidden="true"></span><span class="isle-buddy" aria-hidden="true">${MQ.svg('happy', { size: 62, who: who === 'meti' ? undefined : who, enter: false })}</span>` : ''}${placeSVG(who, v, false, u)}${reveal ? '<span class="fogl lift"></span>' : ''}${label}${just ? '<span class="isle-spark" aria-hidden="true">✨</span>' : ''}</a>`;
      }
      out += `<div class="isle-row w-${who} ${state}" style="background:linear-gradient(180deg, ${top} 0%, ${bg} 22%, ${bg} 78%, ${bot} 100%)">${html}</div>`;
    });
    return `<section class="isles" aria-label="Learning adventure map">${out}<div class="isle-mist" aria-hidden="true"></div></section>`;
  }
  // Halaman satu tempat (bab), dibuka dengan mengetuk tempat di peta. Bukan jalur bulatan:
  // gambar besar tempat itu bersama maskotnya, lalu daftar misi (keterampilan) berupa kartu, kartu pelajaran, dan peti harta karun.
  function viewChapter(uid) {
    const ses = session.get(), st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const u = UNITS.find((x) => x.id === uid); if (!u) return go('#/belajar');
    const m = pathModel(st.id, u.grade), info = isleStates(m).find((x) => x.u.id === uid);
    if (!info || info.state === 'next' || info.state === 'fog') return go('#/belajar');
    const who = worldOf(u), W = WORLDS[who], v = m.units.slice(0, m.units.indexOf(u)).filter((x) => worldOf(x) === who).length, place = W.places[v % 4];
    const pct0 = Math.round((info.done / info.total) * 100);
    const quest = (s, i) => {
      const sk = SKILLS[s.id], lv = level(s.sc)[0], task = TASKS_ON && s.task ? '<em class="qtask" title="Tasks from your teacher">📌</em>' : '';
      const bar = `<span class="qbar"><i style="width:${Math.min(100, s.sc)}%"></i></span>`;
      if (s.state === 'done' || s.state === 'gold') return `<a class="quest done" href="#/latihan/${s.id}"><i class="qn">${s.state === 'gold' ? '★' : IC.ok}</i><span class="grow"><b>${esc(sk.name)}</b><small>SmartScore ${s.sc} · ${lv}</small></span>${task}<u>Practice again</u></a>`;
      if (s.state === 'cur') return `<a class="quest cur" href="#/latihan/${s.id}"><i class="qn">${i + 1}</i><span class="grow"><small class="qnow">Current mission</small><b>${esc(sk.name)}</b>${bar}<small>${s.att ? `SmartScore ${s.sc} · reach 80` : 'Not tried'}</small></span>${task}<u class="go">${s.att ? 'Next' : 'Start'}</u></a>`;
      if (s.state === 'open') return `<a class="quest open" href="#/latihan/${s.id}"><i class="qn">${i + 1}</i><span class="grow"><b>${esc(sk.name)}</b>${bar}<small>${s.att ? `SmartScore ${s.sc} · ${lv}` : 'Not tried'}</small></span>${task}<u>Open</u></a>`;
      return `<button class="quest lock" data-act="tip" data-t="🔒 Finish the previous mission first"><i class="qn">${IC.lock.replace('<svg', '<svg width="16" height="16"')}</i><span class="grow"><b>${esc(sk.name)}</b><small>Locked</small></span></button>`;
    };
    const cs = chestStateOf(st.id, u), t = S.testOf(st.id, u.id);
    const chest = cs === 'locked' ? `<button class="qchest lock" data-act="tip" data-t="🔒 Finish every mission in this place to open the chest"><span class="cimg">${chestSVG('locked')}</span><span class="grow"><b>Treasure of ${esc(place)}</b><small>Finish every mission to unlock the chapter test</small></span></button>`
      : cs === 'ready' ? `<a class="qchest ready" href="#/ujian/${u.id}"><span class="cimg">${chestSVG('ready')}</span><span class="grow"><b>The treasure chest is ready to open!</b><small>Chapter test · ${TEST_N} questions · score 60 to open</small></span><u class="go">Open</u></a>`
      : `<a class="qchest open" href="#/ujian/${u.id}"><span class="cimg">${chestSVG('open')}</span><span class="grow"><b>Treasure found ${t ? '★'.repeat(chestTier(t.stars)) : ''}</b><small>${t ? `Best score ${t.best}%` : 'Chest already open'} · tap to try again</small></span></a>`;
    app.innerHTML = mqPage(`<div class="isle-top"><a class="mq-ico" href="#/belajar" aria-label="Back to the map">${IC.back}</a><span class="grow"><small>${W.icon} ${W.name} · ${gname(u.grade)}</small><b>${esc(place)}</b></span><span class="isle-prog">${info.done}/${info.total}</span></div>
      <section class="place-hero w-${who}" style="background:linear-gradient(180deg, ${W.bg}, ${mixHex(W.bg, '#ffffff', 0.55)})">
        <div class="pscene">${placeSVG(who, v, false, u)}<span class="pbuddy">${MQ.svg(info.state === 'done' ? 'cheer' : 'hello', { size: 78, who: who === 'meti' ? undefined : who, enter: false })}</span></div>
        <div class="pinfo"><small>Chapter ${u.id}</small><h1>${esc(u.name)}</h1>
          <div class="pprog"><span class="qbar big"><i style="width:${pct0}%"></i></span><b>${info.done} of ${info.total} missions done</b></div></div>
      </section>
      <a class="qlesson" href="#/pelajaran/${u.id}"><span class="em">📖</span><span class="grow"><b>Learn first</b><small>Explanation and examples for ${esc(u.name)}</small></span><u>›</u></a>
      <h2 class="qhead">Missions at ${esc(place)}</h2>
      <ol class="quests">${info.ss.map((s, i) => `<li>${quest(s, i)}</li>`).join('')}</ol>
      ${chest}`, 'belajar');
    setTimeout(() => { const c = document.querySelector('.quest.cur'); if (c && c.getBoundingClientRect().bottom > innerHeight - 110) c.scrollIntoView({ block: 'center' }); }, 80);
  }


  /* ----- Tugas dari guru ----- */
  const skillRow = (id, p) => { const sk = SKILLS[id], sc = p ? p.score : 0; return `<a class="mq-skrow" href="#/latihan/${id}"><span class="em">${unitIcon(sk)}</span><span class="grow">${esc(sk.name)}<small>${p && p.att ? level(sc)[0] : 'Not tried'}</small></span>${chip(sc)}</a>`; };
  function viewTasks() {
    const ses = session.get(), st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    syncTasks(st);
    const prog = S.progressAll(st.id), asg = S.assignmentsFor(st.id), todo = asg.filter((a) => !S.isDone(a.id, st.id)), done = asg.filter((a) => S.isDone(a.id, st.id));
    const card = (a) => `<section class="mq-card">${a.students && a.students.length ? '<span class="pill special">🎯 Just for you</span>' : ''}<h3>📌 ${esc(a.note || 'Tasks from your teacher')}</h3>${a.due ? `<p class="small muted" style="margin:0 0 6px">Until ${esc(fdue(a.due))}</p>` : ''}${a.skills.filter((k) => SKILLS[k]).map((k) => skillRow(k, prog[k])).join('')}${S.isDone(a.id, st.id) ? '<p class="mq-unlock" style="animation:none;margin-top:10px">✅ Done</p>' : submitBar(a, prog)}${feedbackHTML(a, st.id, 'siswa')}</section>`;
    app.innerHTML = mqPage(`<h1 class="mq-h">Tasks from your teacher</h1>
      ${todo.length ? todo.map(card).join('') : `<div class="mq-empty">${MQ.svg('happy', { size: 150 })}<div>${asg.length ? 'All tasks are done. Great job!' : 'No tasks from your teacher yet.'}</div><a class="mq-btn" style="max-width:280px" href="#/permainan">Play a game</a></div>`}
      ${done.length ? `<h2 class="mq-sub" style="margin-top:18px">Finished</h2>${done.map(card).join('')}` : ''}`, 'tugas');
  }

  /* ----- Profil ----- */
  function viewProfile() {
    const ses = session.get(), st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const c = S.cls(st.classId), wk = weekStats(st.id), goal = goalOf(st.id);
    const gold = Object.entries(S.progressAll(st.id)).filter(([k, p]) => SKILLS[k] && p.score >= 100).length;
    const tile = (l, v, col) => `<div class="mq-stat" style="--c:${col}"><small>${l}</small><b>${v}</b></div>`;
    app.innerHTML = mqPage(`
      <section class="mq-me"><a class="mq-gear" href="#/pengaturan" aria-label="Settings">${IC.gear}</a><a class="av" href="#/avatar/saya" aria-label="Change profile picture">${avHTML(st.avatar)}<span class="edit">✏️</span></a><h1>${esc(st.name)}</h1><p>${c ? esc(c.name) : 'Self-study'}</p></section>
      <div class="mq-tiles3">${tile('Streak', `🔥 ${streakOf(st.id)}`, '#ff8a00')}${tile('Stars', `⭐ ${S.starsOf(st.id)}`, '#e0a800')}${tile('Complete', `🏆 ${gold}`, '#19b796')}</div>
      ${!st.classId && ses.code ? `<section class="mq-card"><h3>🔑 Your learning code</h3><p class="mq-bigcode">${esc(ses.code)}</p><p class="mq-hint">Save this code. On another phone, open Metiq and choose <b>I already have a code</b>.</p></section><div id="pcodecard"></div>` : ''}
      <section class="mq-card"><h3>🏅 Chapter badges · ${gname(getGrade())}</h3><div class="mq-badges">${unitsOf(getGrade()).map((u) => { const t = S.testOf(st.id, u.id), on = t && t.best >= 60; return `<button class="mq-bd ${on ? 'on' : ''}" data-act="tip" data-t="${on ? '🏅 Chapter Badge ' + u.id + ' earned!' : '🔒 Pass the chapter test ' + u.id + ' to earn this badge'}" aria-label="Chapter badge ${u.id}"><span>${chLogo(u)}</span></button>`; }).join('')}</div></section>
      ${meCharts(st.id, goal)}
      <div class="mq-list"><a href="#/laporanku"><span class="em">📄</span>My report<span class="go">›</span></a> <a href="#/pengaturan"><span class="em">⚙️</span>Settings<span class="go">›</span></a></div>`, 'aku');
    if (!st.classId && ses.code && cloudOn()) loadKidParentCode(st, ses);
  }
  // Kode orang tua anak tanpa kelas, diambil dengan kode belajar pribadinya (SQL 025); tidak tampil jika gagal atau belum dipasang
  const KID_PC = {};
  async function loadKidParentCode(st, ses) {
    let r = KID_PC[st.id];
    if (!r) { try { r = KID_PC[st.id] = await Cloud.rpc('student_parent_code', { p_code: ses.code, p_student_id: st.id }); } catch (e) { return; } }
    const box = document.getElementById('pcodecard'); if (!box || !r || !r.parentCode) return;
    box.innerHTML = `<section class="mq-card"><h3>👨‍👩‍👧 Code for your parents</h3><p class="mq-bigcode">${esc(r.parentCode)}</p>
      <p class="mq-hint">Your parent opens Metiq, taps <b>I'm a parent</b>, then enters this code to see your learning report.${r.familyCode ? ` For all brothers and sisters at once, use the family code <b>${esc(r.familyCode)}</b>.` : ''}</p>
      <button class="mq-btn ghost" data-act="sharepcode" data-c="${esc(r.familyCode || r.parentCode)}">📤 Send to your parent</button></section>`;
  }

  /* ---------- Grafik untuk siswa di halaman Aku ----------
   * 1) Menit belajar 7 hari terakhir (batang, satu seri) dengan garis target harian.
   * 2) Kemajuan keterampilan di kelas yang sedang dipelajari (satu batang bertumpuk, gradasi satu warna). */
  const MS_CAP = 180000; // sama dengan perhitungan waktu di tempat lain: satu jawaban dihitung paling lama 3 menit
  const HARI3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], HARI7 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  function meCharts(sid, goal) {
    const t0 = todayStart(), ans = S.answersOf(sid);
    const days = [...Array(7)].map((_, k) => {
      const from = t0 - (6 - k) * DAY, list = ans.filter((a) => a.ts >= from && a.ts < from + DAY);
      return { d: new Date(from), min: Math.round(list.reduce((t, a) => t + Math.min(a.ms || 0, MS_CAP), 0) / 60000), n: list.length, today: k === 6 };
    });
    const top = Math.max(goal, ...days.map((x) => x.min), 1), totMin = days.reduce((t, x) => t + x.min, 0), hit = days.filter((x) => x.min >= goal).length;
    const H = 120, y = (v) => Math.round((v / top) * H);
    const bars = days.map((x) => `<button class="mc-col ${x.today ? 'today' : ''}" data-act="tip" data-t="${HARI7[(x.d.getDay() + 6) % 7]}: ${x.min} minutes · ${x.n} questions" aria-label="${HARI7[(x.d.getDay() + 6) % 7]}, ${x.min} minutes, ${x.n} questions">
        <span class="mc-bar" style="height:${Math.max(x.min ? 4 : 0, y(x.min))}px"></span><small>${x.today ? 'Today' : HARI3[x.d.getDay()]}</small></button>`).join('');
    const week = `<section class="mq-card mc"><h3>📈 My last 7 days</h3>
      <p class="mc-key"><i></i>Goal: ${goal} minutes a day</p><div class="mc-hero"><div><b>${totMin}</b><small>minutes</small></div><div><b>${days.reduce((t, x) => t + x.n, 0)}</b><small>questions</small></div><div><b>${hit}/7</b><small>days goal reached</small></div></div>
      <div class="mc-plot" aria-label="Minutes learned over the last 7 days: ${days.map((x) => `${HARI3[x.d.getDay()]} ${x.min}`).join(', ')}. Goal: ${goal} minutes per day.">
        <div class="mc-goal" style="bottom:${y(goal) + 22}px"></div>${bars}</div></section>`;
    // kemajuan keterampilan di kelas yang sedang dipelajari
    const g = getGrade(), prog = S.progressAll(sid), sk = unitsOf(g).flatMap((u) => u.skills);
    const LV = [['Complete', '#0a7d68'], ['Proficient', '#19b796'], ['Developing', '#66e3c4'], ['Start', '#c2f3e6'], ['Not tried', '#e6eae9']];
    const cnt = LV.map(([l]) => sk.filter((s) => { const p = prog[s.id] || {}; return (p.att ? level(p.score || 0)[0] : 'Not tried') === l; }).length);
    const seg = LV.map(([l, c], k) => cnt[k] ? `<button class="mc-seg" style="flex:${cnt[k]};background:${c}" data-act="tip" data-t="${l}: ${cnt[k]} skills" aria-label="${l}: ${cnt[k]} skills"></button>` : '').join('');
    const mastered = cnt[0] + cnt[1];
    const prog2 = `<section class="mq-card mc"><h3>🎯 My progress in ${gname(g)}</h3>
      <p class="mc-big"><b>${mastered}</b> of ${sk.length} skills are Proficient or Complete</p>
      <div class="mc-stack" aria-label="${LV.map(([l], k) => `${l} ${cnt[k]}`).join(', ')}">${seg}</div>
      <div class="mc-legend">${LV.map(([l, c], k) => `<span><i style="background:${c}"></i>${l} <b>${cnt[k]}</b></span>`).join('')}</div></section>`;
    return week + prog2;
  }

  /* ---------- Pengaturan siswa (seperti Settings di Duolingo): Preferensi, Metiq untuk Sekolah, Pusat Bantuan, Masukan ---------- */
  function viewSettings(sub) {
    const ses = session.get(), st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const top = (title, back) => `<div class="mq-top mq-settop"><a class="mq-ico" href="${back}" aria-label="Back">${IC.back}</a><h1>${title}</h1><span class="mq-ico"></span></div>`;
    const c = S.cls(st.classId), real = cloudOn() && !ses.demo;
    if (sub === 'preferensi') {
      const goal = goalOf(st.id);
      app.innerHTML = mqPage(`${top('Preferences', '#/pengaturan')}
        <section class="mq-card"><h3>🎯 Daily learning goal</h3><div class="mq-goalchips">${[[5, 'Relaxed'], [10, 'Regular'], [15, 'Serious'], [20, 'Amazing']].map(([m, l]) => `<button class="${m === goal ? 'on' : ''}" data-act="goal" data-m="${m}">${m} min<small>${l}</small></button>`).join('')}</div></section>
        <div class="mq-list"><button data-act="soundtoggle"><span class="em">${window.SFX.enabled() ? '🔔' : '🔕'}</span><span class="t">${window.SFX.enabled() ? 'Sound effects on' : 'Sound effects off'}</span></button>
          <a href="#/avatar/saya"><span class="em">🖼️</span>Change profile picture<span class="go">›</span></a></div>`, 'aku');
      return;
    }
    if (sub === 'sekolah') {
      app.innerHTML = mqPage(`${top('Metiq for Schools', '#/pengaturan')}
        <section class="mq-school"><span class="a1">${avHTML('👩‍🏫')}</span>${MQ.svg('cheer', { size: 130 })}<span class="a2">${avHTML('🧒')}</span></section>
        <section class="mq-card mq-join">${c ? `<h3>🏫 Your class</h3><p class="mq-classnow"><b>${esc(c.name)}</b>${c.teacherName ? `<small>${esc(c.teacherName)}</small>` : ''}</p><p class="mq-hint">Your teacher can see your learning progress and give you tasks.</p>`
          : `<h3>Join a class</h3><p class="mq-hint">Enter the code from your teacher. Your teacher can see your progress, including everything you've learned so far, and give you tasks.</p>
          ${real ? '<form data-form="joinclass"><input class="mq-code" name="code" maxlength="6" placeholder="••••••" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" aria-label="Class code" required><button class="mq-btn">Join</button></form>'
            : '<p class="mq-hint"><b>This is demo mode.</b> To join a class, start learning for real first.</p><button class="mq-btn" data-act="realstart">✨ Start for real</button>'}`}</section>
        ${!st.classId && ses.code && real ? `<section class="mq-card"><h3>🔑 Your learning code</h3><p class="mq-bigcode">${esc(ses.code)}</p><p class="mq-hint">To log in again on another phone.</p></section>` : ''}`, 'aku');
      return;
    }
    if (sub === 'masukan') {
      app.innerHTML = mqPage(`${top('Send feedback', '#/pengaturan')}
        <form data-form="appfeedback" class="mq-card mq-fbform"><h3>💬 Tell us</h3><p class="mq-hint">Found a wrong question, a confusing game, or have a new idea? Write it here.</p>
          <textarea name="text" maxlength="1000" rows="5" required placeholder="Write your feedback…" aria-label="Feedback"></textarea><button class="mq-btn">Send</button></form>`, 'aku');
      return;
    }
    const row = (href, em, t, note) => `<a href="${href}"><span class="em">${em}</span><span class="t">${t}${note ? `<small>${note}</small>` : ''}</span><span class="go">›</span></a>`;
    app.innerHTML = mqPage(`${top('Settings', '#/aku')}
      <h2 class="mq-sethead">Account</h2><div class="mq-list">${row('#/pengaturan/preferensi', '🎛️', 'Preferences', 'Daily goal, sound, profile picture')}${row(`?lang=${window.METIQ_LANG === 'en' ? 'id' : 'en'}#/pengaturan`, '🌐', 'Language', 'English · switch to Indonesian')}${row('#/pengaturan/sekolah', '🏫', 'Metiq for Schools', c ? esc(c.name) : 'Join a class with a code from your teacher')}</div>
      <h2 class="mq-sethead">Support</h2><div class="mq-list">${row('#/panduan/siswa', '❓', 'Help Center')}${row('#/pengaturan/masukan', '💬', 'Send feedback')}${row(window.METIQ_LANG === 'en' ? 'privasi.html#en' : 'privasi.html', '🔒', 'Privacy Policy')}</div>
      <div class="mq-list"><button class="danger" data-act="logout"><span class="em">🚪</span>Log out</button></div>`, 'aku');
  }

  /* ---------- Dasbor siswa: sapaan, rekomendasi, kemajuan minggu ini, papan hadiah ---------- */
  const greet = () => { const h = new Date().getHours(); return h < 11 ? 'Good morning ☀️' : h < 15 ? 'Good afternoon 🌤️' : h < 18 ? 'Good afternoon 🌇' : 'Good evening 🌙'; };
  // Minggu berjalan, mulai hari Senin
  function weekStats(sid) {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const from = d.getTime() - ((d.getDay() + 6) % 7) * DAY;
    const ans = S.answersOf(sid).filter((a) => a.ts >= from);
    return { from, n: ans.length, ms: ans.reduce((t, a) => t + Math.min(a.ms || 0, 180000), 0), skills: new Set(ans.filter((a) => a.ok).map((a) => a.skill)).size };
  }
  // Rekomendasi: ulangi yang lemah, lanjutkan yang sedang dikerjakan, lalu keterampilan baru setelah yang terakhir dikuasai
  function recommend(sid, g) {
    const dg = S.diagOf(sid, 'b') || S.diagOf(sid), gaps = dg ? dg.items.filter((x) => !x.ok && SKILLS[x.id] && S.progress(sid, x.id).score < 80).map((x) => ({ id: x.id, why: `From the placement test · ${gname(SKILLS[x.id].grade)}` })) : [];
    if (gaps.length) return [...gaps.slice(0, 4), ...recommendBase(sid, g).filter((r) => !gaps.some((x) => x.id === r.id))].slice(0, 6);
    return recommendBase(sid, g);
  }
  function recommendBase(sid, g) {
    const prog = S.progressAll(sid), order = unitsOf(g).flatMap((u) => u.skills.map((x) => x.id));
    let last = -1;
    order.forEach((id, i) => { if ((prog[id] || {}).score >= 80) last = i; });
    const out = weaknesses(sid).filter((w) => w.skill.grade === g).slice(0, 2).map((w) => ({ id: w.id, why: `Do it again · your score ${w.score}` }));
    order.filter((id) => prog[id] && prog[id].att && prog[id].score < 80 && !out.some((o) => o.id === id))
      .sort((a, b) => (prog[b].last || 0) - (prog[a].last || 0)).slice(0, 2)
      .forEach((id) => out.push({ id, why: `Continue · your score ${prog[id].score}` }));
    order.slice(last + 1).filter((id) => !(prog[id] && prog[id].att)).slice(0, Math.max(2, 6 - out.length))
      .forEach((id) => out.push({ id, why: 'New skill' }));
    return out.slice(0, 6);
  }

  // Papan hadiah: 36 kotak per kelas; tiap kotak punya tantangan, dan hadiahnya terbuka saat tantangan tercapai.
  // Dihitung dari SmartScore yang tersimpan permanen (jumlah soal, waktu, keterampilan mahir/tuntas).
  const PRIZES = {
    '-2': '🧸🪀🪁🎈🎀🎁🧩🪆🎨🛶🪇🥁🎺🪗🛝🛼🚂🚁⛵🚲🐣🐥🐞🦋🐝🐌🐢🐠🐳🦄🌈⭐🌙🌞🍭🍬',
    '-1': '🍓🍒🍑🍍🥝🍉🍇🍊🍋🍐🥥🥕🌽🥦🍄🌰🥜🍯🧁🍪🍩🍦🍧🍰🥞🧇🥨🍿🥛🧃🍫🍮🎂🍡🍥🥮',
    1: '🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐦🐤🦆🦉🐴🦄🐝🐛🦋🐌🐞🐢🐍🦖🐙🦀🐠🐬🐳',
    2: '🍎🍐🍊🍋🍌🍉🍇🍓🍈🍒🍑🥭🍍🥥🥝🍅🥑🥦🥕🌽🥔🍠🥐🍞🧀🥚🍳🥞🍕🍔🍟🌭🍿🍩🍪🎂',
    3: '🚗🚕🚙🚌🚎🚓🚑🚒🚐🚚🚛🚜🛵🚲🛴🚂🚆🚇🚊🚝🚄🚁🛸🚀⛵🚤🚠🚡🛺🚃🌍🌙⭐🪐🌟🚘',
    4: '⚽🏀🏈⚾🥎🎾🏐🏉🥏🎱🏓🏸🏒🥍🏏🥅🎯🪁🛹🥊🥋🎽🛷🥌🎿🏆🥇🥈🥉🏅🎻🎸🎺🎷🥁🎹',
    5: '🌵🎄🌲🌳🌴🌱🌿🍀🎍🍁🍂🍃🍄🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝🌛🌈🌊🔥💧🌋🗻🐚🪸🪨🌰🎋',
    6: '🔭🔬💡🔦🧭🧲🧪🧫🧬💎🔑🎁🎈🎀🎨🧩🎲🧸📚📐📏🧮🎓👑🎩🎒🧳⌛⏰📷🎥💻📱🎧🎤🪄',
    7: '🐋🦈🐡🐟🦑🦐🦞🐊🦭🦦🦫🦨🦡🦔🦇🐺🐗🦓🦒🦘🦬🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🐈🐓🦃',
    8: '🍏🥯🥨🥖🧇🥓🥩🍗🍖🌮🌯🥙🧆🥗🥘🍝🍜🍲🍛🍣🍱🥟🍤🍙🍚🍘🍥🥮🍢🍡🍧🍨🍦🥧🍰🫓',
    9: '🔧🔨🪛🪚🔩🧰🧱🪜🧯🛒🪣🧹🧺🧻🧼🪥🧽🪒🧴🔋🔌💰💳🪙💸📦📫📮📁📝📎📌📍🔒🔓🔔',
    10: '🔴🟠🟡🟢🔵🟣🟤⚫⚪🟥🟧🟨🟩🟦🟪🟫⬛⬜🔶🔷🔸🔹🔺🔻💠🔘🔲🔳🎴🃏🀄🎯🧿🪀🪃🪅',
    11: '🎭🎬🎤🎧🎼🎵🎶🪕🪘🎻🪗🪈📯📻📺📸📹🎮👾🎰🎳🎪🎨🧵🧶🪡👓🥽🥼🦺👔👕👖🧣🧤🧥',
    12: '🏠🏡🏢🏣🏤🏥🏦🏨🏩🏪🏫🏬🏭🏯🏰💒🗼🗽⛪🕌🛕🕍🕋⛲⛺🌁🌃🌄🌅🌆🌇🌉🎠🎡🎢🗾',
    13: '🎉🎊🎆🎇🧨✨🎃🎄🎋🎍🎎🎏🎐🎑🧧🎀🎁🎫🏆🥇🥈🥉🏅👑💎💍🔮🪄🧿📿🪩🪅🌠🌌🌈🦄',
  };
  const CHALLENGES = [
    ...[10, 20, 30, 50, 75, 100, 150, 200, 250, 300, 400, 500].map((n) => ({ k: 'q', n })),
    ...[5, 10, 15, 20, 30, 45, 60, 90, 120, 180].map((n) => ({ k: 't', n })),
    ...[1, 2, 3, 4, 6, 8, 10, 12, 15, 20].map((n) => ({ k: 's', n })),
    ...[1, 2, 3, 5].map((n) => ({ k: 'm', n })),
  ];
  const chLabel = (c) => ({ q: `Answer ${c.n} questions`, t: `Practice for ${c.n} minutes`, s: `Reach a score of 80 (Proficient) in ${c.n} skills`, m: `Complete ${c.n} skills (score 100)` }[c.k]);
  const chUnit = { q: 'questions', t: 'minutes', s: 'proficient skills', m: 'completed skills' };
  // Urutan kotak diacak tetap per kelas, agar tantangan mudah dan sulit tersebar di papan
  function boardOrder(g) {
    const idx = CHALLENGES.map((_, i) => i); let x = g * 9301 + 49297;
    for (let i = idx.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; const j = Math.floor((x / 233280) * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return idx;
  }
  function prizeBoard(sid, g) {
    const rows = Object.entries(S.progressAll(sid)).filter(([k]) => SKILLS[k] && SKILLS[k].grade === g).map(([, p]) => p);
    const st = { q: rows.reduce((t, p) => t + (p.att || 0), 0), t: Math.floor(rows.reduce((t, p) => t + (p.ms || 0), 0) / 60000), s: rows.filter((p) => p.score >= 80).length, m: rows.filter((p) => p.score >= 100).length };
    const prizes = [...(PRIZES[g] || PRIZES[6])];
    const cells = boardOrder(g).map((ci, pos) => { const c = CHALLENGES[ci]; return { pos, c, prize: prizes[ci], have: st[c.k], open: st[c.k] >= c.n }; });
    const next = {};
    CHALLENGES.forEach((c) => { if (st[c.k] < c.n && !(c.k in next)) next[c.k] = c.n - st[c.k]; });
    return { st, cells, next, open: cells.filter((x) => x.open).length };
  }
  const nextWin = (pb, short) => { const parts = Object.entries(pb.next).map(([k, n]) => `${n} ${chUnit[k]} to go`); return short ? parts.slice(0, 2).join(' or ') : parts.join(', or '); };
  // Album Nusantara: setiap tantangan papan hadiah (semua kelas) = 1 keping; 9 keping membuka satu gambar.
  const ALB = window.METIQ_ALBUM, PIECES = 9;
  const pieceTotal = (sid) => GRADES.reduce((t, x) => t + prizeBoard(sid, x.id).open, 0);
  // urutan keping per gambar: bagian paling khas (puncak Monas, jam Jam Gadang, kepala komodo) terbuka paling akhir, supaya anak menebak dulu
  const pieceOrder = (i) => { if (ALB[i].order) return ALB[i].order; const o = [...Array(PIECES).keys()]; let x = (i + 3) * 7919; for (let k = o.length - 1; k > 0; k--) { x = (x * 9301 + 49297) % 233280; const j = Math.floor((x / 233280) * (k + 1)); [o[k], o[j]] = [o[j], o[k]]; } return o; };
  const puzzleHTML = (i, have, cls) => {
    const open = new Set(pieceOrder(i).slice(0, have));
    return `<div class="alb-pz ${cls || ''}">${ALB[i].svg}<div class="alb-cover">${[...Array(PIECES).keys()].map((k) => `<i class="${open.has(k) ? 'open' : ''}"></i>`).join('')}</div></div>`;
  };
  function viewPrizes() {
    const ses = session.get(); const st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    if (adabOn()) return go('#/belajar');
    const g = getGrade(), pb = prizeBoard(st.id, g), total = Math.min(pieceTotal(st.id), ALB.length * PIECES);
    const cur = Math.min(Math.floor(total / PIECES), ALB.length - 1), have = total >= ALB.length * PIECES ? PIECES : total % PIECES, a = ALB[cur];
    const done = (i) => i < Math.floor(total / PIECES);
    // tantangan berikutnya di kelas ini, satu per jenis, dengan kemajuannya
    const goals = Object.keys(pb.next).map((k) => { const n = pb.st[k] + pb.next[k]; return { k, n, have: pb.st[k], label: chLabel({ k, n }) }; });
    const goalRow = (x) => `<div class="alb-goal"><span class="em">${{ q: '✏️', t: '⏱️', s: '⭐', m: '🏆' }[x.k]}</span><span class="grow"><b>${x.label}</b><span class="alb-bar"><i style="width:${pct(x.have, x.n)}%"></i></span><small>${x.k === 't' ? fmtTime(x.have * 60000) : x.have} / ${x.k === 't' ? fmtTime(x.n * 60000) : x.n}</small></span></div>`;
    const thumb = (x, i) => done(i) ? `<button class="alb-th done" data-act="album" data-i="${i}" aria-label="${esc(x.name)}">${x.svg}<b>${esc(x.name)}</b></button>`
      : i === cur ? `<button class="alb-th cur" data-act="album" data-i="${i}" aria-label="Mystery picture, ${have} of ${PIECES} pieces">${puzzleHTML(i, have)}<b>❓</b></button>`
        : `<button class="alb-th lock" data-act="tip" data-t="🔒 Finish the previous puzzle first" aria-label="Locked">${x.svg}<span class="lk">${IC.lock}</span><b>?</b></button>`;
    app.innerHTML = mqPage(`
      <div class="alb-head"><div><h1>Nusantara Album</h1><p>Collect pieces and reveal pictures of Indonesia!</p></div><span class="mq-gchip">🧩 ${total}</span></div>
      <section class="alb-main"><small>Puzzle ${cur + 1} of ${ALB.length}</small>${done(cur) ? `<h2>${esc(a.name)}</h2><p class="pl">📍 ${esc(a.place)}</p>` : '<h2>❓ Mystery picture</h2><p class="pl">What place in Indonesia is this? Guess before it\'s revealed!</p>'} ${puzzleHTML(cur, have, 'big')}
        <div class="alb-prog"><i style="width:${(have / PIECES) * 100}%"></i><span>${have}/${PIECES}</span></div>
        <p class="alb-msg">${total >= ALB.length * PIECES ? '🎉 All puzzles are complete. Great job!' : have ? `Just <b>${PIECES - have} pieces</b> left to reveal this picture!` : 'Finish the challenges below to earn your first piece!'}</p></section>
      ${goals.length ? `<section class="mq-card"><h3>🧩 How to earn pieces</h3>${goals.map(goalRow).join('')}<a class="mq-btn" href="#/belajar">Let's learn</a></section>` : ''}
      <h2 class="mq-sethead">My album</h2><div class="alb-grid">${ALB.map(thumb).join('')}</div>
      <div class="mq-modal" id="albsheet" hidden data-act="albclose"><div class="mq-sheet alb-sheet" id="albbox"></div></div>`, 'hadiah');
    // gambar yang baru lengkap langsung dibuka: nama, tempat, dan faktanya baru terlihat sekarang
    const full = Math.floor(total / PIECES), seenKey = 'metiq_albseen_' + st.id; let seen = 0;
    try { seen = +localStorage.getItem(seenKey) || 0; } catch (e) {}
    if (full > seen) { try { localStorage.setItem(seenKey, String(full)); } catch (e) {} setTimeout(() => openAlbum(full - 1, true), 350); }
  }
  function openAlbum(i, fresh) {
    const st = studentNow(); if (!st) return;
    const total = pieceTotal(st.id), a = ALB[i], full = i < Math.floor(total / PIECES);
    const box = document.getElementById('albbox'), sh = document.getElementById('albsheet'); if (!box || !sh) return;
    box.innerHTML = full ? `${fresh ? '<p class="alb-new">🎉 Picture revealed!</p>' : ''}<div class="${fresh ? 'alb-reveal' : ''}">${a.svg}</div><h2>${esc(a.name)}</h2><p class="pl">📍 ${esc(a.place)}</p>
      <p>💡 ${esc(a.fact)}</p><button class="mq-btn" data-act="albclose">${fresh ? 'Hooray!' : 'Close'}</button>`
      : `${puzzleHTML(i, total % PIECES, 'big')}<h2>❓ Mystery picture</h2><p>Can you guess it? The name, place, and fun facts appear once all ${PIECES} pieces are complete.</p><button class="mq-btn" data-act="albclose">Close</button>`;
    sh.hidden = false;
    if (full) window.SFX.levelUp();
  }
  function viewMyReport() {
    const ses = session.get(); const st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    app.innerHTML = shell(`<a class="back" href="#/belajar">← Back</a>${reportHTML(st, 'siswa')}`, { right: `<span class="topr"><a class="help" href="#/panduan/siswa" aria-label="Guide">❓</a></span>` });
  }

  function skillLink(id, p, sub) {
    const s = SKILLS[id]; const sc = p ? p.score : 0;
    return `<a class="sk" href="#/latihan/${id}"><span class="sk-code">${s.code}</span><span class="sk-name">${s.name}${sub ? `<small>${sub}</small>` : ''}</span>${chip(sc)}</a>`;
  }

  /* ---------- Latihan: satu soal per layar, pilih dulu lalu Periksa; benar, hampir benar, atau salah ---------- */
  let P = null;
  const ROUND = 10; // soal per putaran latihan
  const mmss = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const lessonShell = (pct, quit, diag) => `<div class="mq-top"><button class="mq-ico" data-act="${quit}" aria-label="Log out">${IC.x}</button>
      <div class="mq-prog" id="mqprog" ${diag ? 'data-diag="1"' : ''}><i id="sbar" style="width:${pct}%"></i></div>
      <button class="mq-ico mq-coretbtn" id="mqcoret" data-act="coret" aria-label="Scratch paper" hidden>✏️</button><button class="mq-ico psound" data-act="sound" aria-label="Sound">${window.SFX.enabled() ? '🔔' : '🔕'}</button></div>
    <div class="mq-combo" id="mqcombo"></div>
    <main class="mq-screen" id="pq"></main><div class="mq-foot" id="fb"></div>`;
  /* ---------- Kertas coret: kanvas bergaris untuk soal yang perlu dihitung di kertas (bersusun, pecahan, persen, aljabar, kalkulus) ---------- */
  // Bisa diatur per keterampilan atau bab dengan coret: true/false; kelas 7 ke atas selalu menyediakannya
  const CORET_RE = /perkalian|pembagian|\b(di)?kali\b|\b(di)?bagi\b|bersusun|menyimpan|meminjam|sampai 1\.000|pecahan|desimal|persen|FPB|KPK|faktor|kelipatan|campuran|soal cerita|model batang|luas|keliling|volume|rasio|perbandingan|skala|kecepatan|debit|rata-rata|statistik|bilangan bulat|pangkat|akar/i;
  const coretOn = (sk) => {
    if (!sk) return false;
    const u = UNITS.find((x) => x.id === sk.unit) || {};
    if (sk.coret !== undefined) return !!sk.coret;
    if (u.coret !== undefined) return !!u.coret;
    return sk.grade >= 7 || CORET_RE.test(`${sk.name} ${u.name || ''}`);
  };
  // Posisi hasil geser dan ukuran kertas coret diingat antarsoal
  let coretPos = null, coretTall = false;
  function closeCoret(wipe) {
    const pad = document.getElementById('coret'); if (!pad) return;
    if (wipe) pad.remove(); else pad.hidden = true;
    const b = document.getElementById('mqcoret'); if (b) b.classList.remove('on');
    const fb = document.getElementById('fb'); if (fb) fb.classList.remove('cor', 'kshow');
    document.body.classList.remove('coret-side', 'coret-open');
  }
  // Tablet: setelah pensil (Apple Pencil/stylus) terdeteksi, sentuhan jari dan telapak tangan tidak ikut mencoret
  let penSeen = (() => { try { return localStorage.getItem('metiq_pen') === '1'; } catch (e) { return false; } })();
  addEventListener('resize', () => { const pad = document.getElementById('coret'); if (pad && !pad.hidden && pad.place) { pad.place(); if (pad.fit) pad.fit(); } });
  function openCoret() {
    let pad = document.getElementById('coret');
    const b = document.getElementById('mqcoret');
    if (pad && !pad.hidden) return closeCoret(false);
    if (b) b.classList.add('on');
    document.body.classList.add('hours');
    // Papan angka dilipat selama kertas coret terbuka, supaya kertasnya selebar mungkin; tombol 🔢 memunculkannya lagi
    const foot = document.getElementById('fb');
    if (foot) foot.classList.remove('kshow');
    // duduk tepat di atas kaki layar (tombol jawaban dan Periksa tetap bisa diketuk)
    const place = () => {
      if (!pad) return;
      // tablet mendatar: kertas coret menjadi panel penuh di kanan, soal dan tombol tetap di kiri
      const side = innerWidth >= 900 && innerWidth > innerHeight;
      document.body.classList.toggle('coret-side', side); pad.classList.toggle('side', side);
      if (foot && foot.querySelector('.mq-krow')) foot.classList.toggle('cor', !side); // di samping, papan angka tidak perlu dilipat
      Object.assign(pad.style, { top: '', left: '', right: '', width: '', maxWidth: '', margin: '', height: '' });
      if (side) { Object.assign(pad.style, { top: '64px', bottom: '16px', left: '568px', right: '16px', height: 'auto', maxWidth: 'none', margin: '0', animation: 'none' }); return; }
      // tablet tegak: selebar layar, tidak dibatasi 520 px seperti di HP
      if (innerWidth >= 700) Object.assign(pad.style, { left: '16px', right: '16px', maxWidth: 'none', margin: '0' });
      if (coretPos) { const w = Math.min(pad.offsetWidth || 520, innerWidth), h = pad.offsetHeight || 300; Object.assign(pad.style, { left: Math.max(0, Math.min(innerWidth - w, coretPos[0])) + 'px', top: Math.max(0, Math.min(innerHeight - 52, coretPos[1])) + 'px', bottom: 'auto', right: 'auto', margin: '0', width: w + 'px', animation: 'none' }); return; }
      const fh = foot ? foot.offsetHeight : 0, vis = document.querySelector('#pq .mq-vis') || document.querySelector('#pq .mq-say');
      pad.style.bottom = fh + 'px';
      const room = vis ? innerHeight - fh - vis.getBoundingClientRect().bottom - 12 : 0;
      pad.style.height = !coretTall && room >= 170 ? Math.min(room, foot && foot.classList.contains('cor') ? 640 : 360) + 'px' : '';
    };
    if (pad) { pad.hidden = false; pad.place = place; place(); if (pad.fit) pad.fit(); return; }
    const COLORS = [['#0a7d68', 'green'], ['#1c9be8', 'blue'], ['#ff5a5f', 'red']];
    pad = document.createElement('div'); pad.id = 'coret'; pad.className = 'mq-coret';
    pad.innerHTML = `<div class="bar"><b>✏️<span class="lbl"> Scratch paper</span></b><span class="tools">${COLORS.map(([c, n], i) => `<button data-c="${c}" class="${i ? '' : 'on'}" aria-label="${n} pencil"><i style="background:${c}"></i></button>`).join('')}
      <button data-c="erase" aria-label="Eraser">🧽</button><button data-k="finger" class="${penSeen ? '' : 'off'}" aria-label="Allow writing with a finger" title="Pencil detected: finger touches are ignored. Tap to write with a finger.">👆</button><button data-k="clear" aria-label="Clear all marks">🗑️</button><button data-k="size" aria-label="Make the scratch paper bigger or smaller">↕</button><button data-k="close" aria-label="Close scratch paper">✕</button></span></div>${P && P.q ? `<div class="qcopy">${esc(strip(P.q.log || P.q.text))}</div>` : ''}<canvas aria-label="Scratch paper"></canvas>`;
    if (coretTall) pad.classList.add('tall');
    document.body.appendChild(pad); pad.place = place; place();
    const cv = pad.querySelector('canvas'), ctx = cv.getContext('2d');
    let pen = COLORS[0][0];
    // Kursor spidol berwarna sesuai pensil (titik aktif di ujung spidol); penghapus: lingkaran seluas bagian yang dihapus
    const curFor = (c) => {
      const svg = c === 'erase'
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="#ffffff" fill-opacity=".55" stroke="#04382e" stroke-width="2" stroke-dasharray="3 2"/><circle cx="14" cy="14" r="1.6" fill="#04382e"/></svg>'
        : `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g transform="rotate(45 16 16)"><rect x="11.5" y="1.5" width="9" height="18" rx="2.5" fill="${c}" stroke="#04382e" stroke-width="1.5"/><rect x="11.5" y="1.5" width="9" height="5" rx="2.5" fill="#04382e" fill-opacity=".3"/><path d="M11.5 19.5h9l-2.2 6h-4.6z" fill="#f4efe6" stroke="#04382e" stroke-width="1.5" stroke-linejoin="round"/><path d="M13.7 25.5h4.6L16 30.5z" fill="${c}" stroke="#04382e" stroke-width="1.2" stroke-linejoin="round"/></g></svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${c === 'erase' ? '14 14' : '6 26'}, crosshair`;
    };
    const setCur = () => { cv.style.cursor = curFor(pen); };
    setCur();
    const fit = () => {
      const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, old = cv.width ? cv.toDataURL() : null;
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (old) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, r.width, r.height); im.src = old; }
    };
    fit(); pad.fit = fit;
    const at = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    // Setiap jari/pensil punya garisnya sendiri, jadi telapak yang terangkat tidak memutus garis pensil.
    // Sentuhan diabaikan bila: pensil sudah pernah dipakai di perangkat ini, sentuhan kedua (multi-sentuh), atau bidang sentuhnya lebar (telapak).
    const strokes = new Map();
    const palm = (e) => e.pointerType === 'touch' && (penSeen || !e.isPrimary || Math.max(e.width || 0, e.height || 0) > 28);
    const widthOf = (e) => (pen === 'erase' ? 22 : e.pointerType === 'pen' && e.pressure > 0 ? 2.6 + e.pressure * 3 : 3.6);
    const seg = (a, b, w) => {
      ctx.save(); if (pen === 'erase') ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = pen === 'erase' ? '#000' : pen; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
    };
    cv.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'pen' && !penSeen) { penSeen = true; try { localStorage.setItem('metiq_pen', '1'); } catch (err) { /* mode privat */ } const fb2 = pad.querySelector('[data-k="finger"]'); if (fb2) fb2.classList.remove('off'); strokes.forEach((v, id) => { if (v.touch) strokes.delete(id); }); }
      if (palm(e)) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* sentuhan buatan */ }
      const p = at(e); strokes.set(e.pointerId, { p, touch: e.pointerType === 'touch' });
      seg(p, [p[0] + 0.01, p[1]], widthOf(e));
    });
    cv.addEventListener('pointermove', (e) => {
      const st = strokes.get(e.pointerId); if (!st) return;
      e.preventDefault();
      // pensil iPad mengirim titik lebih rapat daripada layar diperbarui; ambil semua titiknya supaya garis tidak putus
      const pts = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      (pts.length ? pts : [e]).forEach((x) => { const p = at(x); seg(st.p, p, widthOf(x)); st.p = p; });
    });
    const stop = (e) => { strokes.delete(e.pointerId); };
    cv.addEventListener('pointerup', stop); cv.addEventListener('pointercancel', stop);
    // tanpa ini Safari iPad memilih teks (layar menjadi biru), menggulir, atau memperbesar saat telapak menempel
    ['touchstart', 'touchmove', 'touchend'].forEach((t) => pad.addEventListener(t, (e) => { if (!e.target.closest('button')) e.preventDefault(); }, { passive: false }));
    const bar = pad.querySelector('.bar');
    let drag = null;
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || pad.classList.contains('side')) return;
      const x0 = pad.offsetLeft, y0 = pad.offsetTop; drag = [e.clientX - x0, e.clientY - y0];
      coretPos = [x0, y0]; pad.style.animation = 'none'; place(); try { bar.setPointerCapture(e.pointerId); } catch (err) { /* sentuhan buatan tanpa pointer aktif */ } pad.classList.add('drag'); e.preventDefault();
    });
    bar.addEventListener('pointermove', (e) => { if (!drag) return; coretPos = [e.clientX - drag[0], e.clientY - drag[1]]; place(); });
    const endDrag = () => { if (drag) { drag = null; pad.classList.remove('drag'); } };
    bar.addEventListener('pointerup', endDrag); bar.addEventListener('pointercancel', endDrag);
    pad.querySelector('.tools').addEventListener('click', (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.k === 'close') return closeCoret(false);
      if (t.dataset.k === 'size') { coretTall = !coretTall; pad.classList.toggle('tall', coretTall); place(); fit(); return; }
      if (t.dataset.k === 'finger') { penSeen = false; try { localStorage.removeItem('metiq_pen'); } catch (err) { /* mode privat */ } t.classList.add('off'); toast('👆 You can now write with a finger'); return; }
      if (t.dataset.k === 'clear') { ctx.clearRect(0, 0, cv.width, cv.height); return; }
      pen = t.dataset.c; setCur(); pad.querySelectorAll('[data-c]').forEach((x) => x.classList.toggle('on', x === t));
    });
  }
  function viewPractice(id, again) {
    const ses = session.get(); const st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const sk = SKILLS[id]; if (!sk) return go('#/belajar');
    if (adabOn() && sessionStorage.getItem('metiq_doa') !== st.id) return viewDoa();
    sessionStorage.setItem('metiq_open', sk.unit);
    const p = S.progress(st.id, id);
    P = { sid: st.id, sk, rid: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), score: p.score, score0: p.score, count: 0, correct: 0, combo: 0, start: Date.now(), msSum: 0, q: null, input: '', sel: -1, locked: false };
    if (P.score >= 100 && !again) return renderMastered(true);
    app.innerHTML = lessonShell(0, 'quit', false);
    nextQ();
  }
  // Mode adab: berdoa sekali per sesi sebelum latihan. Teks doa hanya dari iman.js yang sudah diperiksa.
  function viewDoa() {
    const d = (IMAN._adab || {}).doa || {}, ok = d.verifiedAt && (d.ar || d.id);
    app.innerHTML = `${mqBack('#/belajar')}<main class="mq-screen"><div class="mq-ob-body">
      <div class="mq-big-say"><div class="mq-bubble"><p><b>${esc(d.judul || '')}</b><span class="sub">${esc(d.ajakan || '')}</span></p></div>${MQ.svg('hello', { size: 150 })}</div>
      ${ok ? `${d.ar ? `<p class="doa-ar" dir="rtl" lang="ar">${esc(d.ar)}</p>` : ''}${d.id ? `<p class="doa-id">${esc(d.id)}</p>` : ''}${d.ref ? `<p class="small muted">${esc(d.ref)}</p>` : ''}` : ''}
    </div></main><div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn" data-act="doaok">${esc(d.tombol || 'Start learning')}</button></div></div>`;
  }
  // Tombol Periksa aktif hanya setelah ada jawaban (pilihan atau angka)
  function refreshCheck() {
    const b = document.getElementById('mqcheck'); if (!b || !P || P.locked) return;
    b.disabled = !(P.q.type === 'choice' ? P.sel >= 0 : P.input !== '');
    const d = document.getElementById('indisp'); if (d) d.classList.toggle('has', P.input !== '');
    const d2 = document.getElementById('indisp2'); if (d2) d2.textContent = P.input || '–';
  }
  function nextQ() {
    if (P.test) { if (P.count >= TEST_N) return renderChest(); P.sk = SKILLS[P.test.queue[P.count]]; }
    else if (!P.diag && (P.count >= ROUND || (P.score >= 100 && P.score0 < 100))) return renderRound();
    let q, guard = 0;
    // latihan fakta berpola (urut, acak, bentuk lain); asesmen dan ujian bab tetap acak
    if (!P.test && !P.diag && window.METIQ_POLA && window.METIQ_POLA.has(P.sk.id)) q = window.METIQ_POLA.next(P.sid, P.sk.id);
    else do { q = P.sk.gen(); } while (P.q && strip(q.text + (q.vis || '')) === strip(P.q.text + (P.q.vis || '')) && guard++ < 5);
    P.q = q; P.input = ''; P.sel = -1; P.locked = false; P.qStart = Date.now();
    const canCoret = coretOn(P.sk) || /class="(stack|pgap)/.test(q.vis || '');
    closeCoret(true); { const cb = document.getElementById('mqcoret'); if (cb) cb.hidden = !canCoret; }
    const choice = q.type === 'choice', box = document.getElementById('pq');
    box.innerHTML = `
      <h2 class="mq-title">${choice ? 'Choose the correct answer' : 'Write the answer'}</h2>
      ${P.diag && D && D.n === 0 ? '<p class="mq-hint">It\'s okay if you don\'t know yet. Just take a guess!</p>' : ''}
      <div class="mq-say"><div id="mqm">${MQ.svg('normal', { size: choice ? 92 : 76, enter: false })}</div><div class="mq-bubble"><button class="mq-spk${q.audio ? ' aud' : ''}" data-act="say" aria-label="Listen to the question">${IC.spk}</button><span>${q.text}</span></div></div>
      ${q.vis ? `<div class="mq-vis">${q.vis}</div>` : ''}
      ${canCoret ? '<button class="mq-coretcta" data-act="coret">✏️ Scratch paper</button>' : ''}
      ${choice
    ? `<div class="mq-opts ${q.options.every((o) => strip(o).length <= 4) ? 'short' : ''}">${q.options.map((o, i) => `<button class="mq-opt" data-act="choose" data-i="${i}">${o}</button>`).join('')}</div>`
    : `<div class="mq-ans">${q.unit ? `<span class="u">${q.unit}</span>` : ''}<div class="mq-disp" id="indisp">&nbsp;</div></div>`}`;
    // Papan angka dan tombol Periksa menempel di bawah layar, supaya selalu terjangkau tanpa menggulir
    const keys = choice ? '' : `${q.keys ? `<div class="mq-keys extra">${q.keys.map((k) => `<button class="mq-key" data-act="key" data-k="${k}">${k}</button>`).join('')}</div>` : ''}
       <div class="mq-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="mq-key" data-act="key" data-k="${n}">${n}</button>`).join('')}<button class="mq-key del" data-act="key" data-k="del" aria-label="Delete">⌫</button><button class="mq-key" data-act="key" data-k="0">0</button><span></span></div>`;
    const fb = document.getElementById('fb'); fb.className = 'mq-foot' + (!choice && canCoret ? ' compact' : '');
    const krow = !choice && canCoret ? '<div class="mq-krow"><button class="mq-ktog" data-act="keystog" aria-label="Show or hide the number keys">🔢 <span class="ka">Number keys</span><span class="kb">Hide</span> <i>▲</i></button><span class="mq-mini">Answer: <b id="indisp2">–</b></span></div>' : '';
    fb.innerHTML = `<div class="mq-foot-in">${krow}${keys}<button class="mq-btn" id="mqcheck" data-act="check" disabled>Check</button></div>`;
    box.style.paddingBottom = fb.offsetHeight + 20 + 'px';
    const d = document.getElementById('indisp'); if (d) d.style.scrollMarginBottom = fb.offsetHeight + 12 + 'px';
    // Cerita TK dibacakan otomatis saat soal muncul
    if (q.audio) playClips(q.audio, 350); else stopClips();
  }
  function submit(given) {
    if (P.locked) return;
    const q = P.q;
    if (q.type === 'input' && given === '') return toast('Write your answer first');
    // titik ribuan dan spasi diabaikan; tanda minus dan koma desimal dibakukan
    const norm = (x) => String(x).trim().toLowerCase().replace(/[−–]/g, '-').replace(/[,\s]/g, '');
    const ok = q.type === 'choice' ? given === q.answer : norm(given) === norm(q.answer);
    if (P.diag) return diagAnswer(ok);
    tlog('answer', { s: P.sk.id, ok, ms: Date.now() - P.qStart });
    P.locked = true; P.count++; P.msSum += Date.now() - P.qStart;
    const tag = ok ? null : classify(q, given);
    // "Nyaris": salah tipis (selisih 1 atau angka tertukar). Tetap dicatat salah agar data guru jujur, tapi disambut lembut.
    const near = !ok && (tag === 'meleset-satu' || tag === 'tertukar-digit');
    const asgDone = (a) => a.skills.filter((k) => SKILLS[k]).every((k) => S.progress(P.sid, k).score >= 80);
    const myAsg = P.test ? [] : S.assignmentsFor(P.sid).filter((a) => a.skills.includes(P.sk.id) && !asgDone(a));
    const pzBefore = prizeBoard(P.sid, P.sk.grade).open;
    const info = { ok, given: strip(given), answer: strip(q.answer), text: strip(q.log || q.text), tag, ms: Date.now() - P.qStart, rid: P.rid || null, kind: P.test ? 'test' : 'practice', unit: P.test ? P.test.unit : null };
    const res = P.test ? S.logAnswer(P.sid, P.sk.id, info) : S.record(P.sid, P.sk.id, info);
    if (cloudOn()) Cloud.queue(P.sid, session.get().code, S.lastAnswer(), Object.assign({}, res));
    const before = P.test ? res.score : P.score; P.score = res.score;
    P.combo = ok ? P.combo + 1 : 0; if (ok) P.correct++;
    document.getElementById('sbar').style.width = Math.min(100, (P.count / ROUND) * 100) + '%';
    document.getElementById('mqprog').classList.toggle('combo', P.combo >= 3);
    document.getElementById('mqcombo').textContent = P.combo >= 3 ? `STREAK ×${P.combo}` : '';
    document.querySelectorAll('.mq-opt').forEach((b) => { const v = q.options[+b.dataset.i]; b.classList.remove('sel'); if (v === q.answer) b.classList.add('right'); else if (v === given) b.classList.add('wrong'); b.disabled = true; });
    document.querySelectorAll('.mq-key').forEach((b) => { b.disabled = true; });
    const m = document.getElementById('mqm'); m.innerHTML = MQ.svg(ok ? 'happy' : 'oops', { size: 92, enter: false }); m.firstChild.classList.add('mq-react');
    const finished = ok ? myAsg.filter(asgDone) : [];
    if (!adabOn() && prizeBoard(P.sid, P.sk.grade).open > pzBefore) setTimeout(() => toast('🧩 You got a new puzzle piece!'), 1200);
    finished.forEach((a) => markDone(a.id, P.sid, 'siswa'));
    const fb = document.getElementById('fb'), pq = document.getElementById('pq');
    const how = `<details class="mq-how" open><summary>💡 See how</summary><div class="explain">${q.explain}${kolomOf(q, P.sk)}<p>${LESSONS[P.sk.unit] ? `<button class="link" data-act="lopen" data-u="${P.sk.unit}">📖 Still unsure? Open the lesson</button>` : ''}${window.METIQ_ANIM.has(P.sk.unit) ? ` · <button class="link small" data-act="anim" data-u="${P.sk.unit}">🎬 Watch the animation</button>` : ''}</p><div class="anim-inline"></div></div></details>`;
    if (ok) {
      let note = '';
      if (P.score >= 100 && before < 100) { window.SFX.mastered(); note = '🏆 Complete! Amazing!'; }
      else if (TASKS_ON && finished.length) { window.SFX.task(); note = `📌 Task finished: ${esc(finished[0].note || 'Tasks from your teacher')}`; }
      else if (P.score >= 80 && before < 80) { window.SFX.levelUp(); note = '⭐ You reached Proficient! The next step is unlocked.'; }
      else window.SFX.correct();
      const praise = adabOn() && (IMAN._adab || {}).pujian ? IMAN._adab.pujian : ['Great!', 'Smart!', 'Exactly right!', 'Awesome!', 'Cool!'];
      fb.className = 'mq-foot ok';
      fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${IC.ok}</span>${praise[Math.floor(Math.random() * praise.length)]}</div>${note ? `<div class="mq-fbody"><p>${note}</p></div>` : ''}<button class="mq-btn" data-act="next">Continue</button></div>`;
    } else if (near) {
      window.SFX.wrong();
      fb.className = 'mq-foot near';
      fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">!</span>So close!</div><div class="mq-fbody"><p>${tag === 'meleset-satu' ? 'Almost right, it\'s only off by 1. Count carefully once more.' : 'Almost right, the digits swapped places. Check the tens and ones.'}</p><p>Your answer: <b class="strike">${esc(strip(given))}</b></p><p>The correct answer:</p><div class="mq-corr">${q.answer}</div>${how}</div><button class="mq-btn warn" data-act="next">Continue</button></div>`;
    } else {
      window.SFX.wrong();
      fb.className = 'mq-foot no';
      fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${IC.x}</span>Not quite</div><div class="mq-fbody"><p>Your answer: <b class="strike">${esc(strip(given))}</b></p><p>The correct answer:</p><div class="mq-corr">${q.answer}</div>${how}</div><button class="mq-btn bad" data-act="next">Continue</button></div>`;
    }
    pq.style.paddingBottom = fb.offsetHeight + 24 + 'px';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Cerita TK: pujian saat benar, penjelasan dibacakan saat belum tepat
    if (q.audio) playClips(ok ? [q.audioOk] : q.audioExplain, ok ? 450 : 700);
  }
  /* ---------- Bintang, ujian bab (peti harta karun), dan logo bab ---------- */
  // Aturan bintang (dasar hadiah nyata, jadi dibuat sulit "dikebut"):
  //  - latihan: 1 bintang (tepat 60%), 2 (80%), 3 (100%) per putaran; tidak ada bintang untuk keterampilan yang sudah tuntas,
  //    jawaban rata-rata lebih cepat dari 1,5 detik (asal tebak), dan maksimal STAR_CAP bintang per hari
  //  - ujian bab: 3 / 5 / 8 bintang (nilai 60 / 80 / 95), hanya selisih dari hasil terbaik sebelumnya
  //  - permainan: hanya selisih dari bintang terbaik tiap permainan (maksimal 3 per permainan)
  const TEST_N = 10, MIN_AVG_MS = 1500, STAR_CAP = 30;
  const chestStars = (pctv) => (pctv >= 95 ? 8 : pctv >= 80 ? 5 : pctv >= 60 ? 3 : 0);
  const chestTier = (stars) => (stars >= 8 ? 3 : stars >= 5 ? 2 : 1);
  const shuf = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);

  // Logo tiap bab: lambang operasi untuk bab hitung (+ − × ÷ ½ % ...), gambar untuk bab lain
  const CH_LOGO = [
    [/penjumlahan dan pengurangan|addition and subtraction/i, '+−', '#19b796', 's'], [/penjumlahan|addition/i, '+', '#ff7a45'], [/pengurangan|subtraction/i, '−', '#3b9cff'],
    [/perkalian dan pembagian|multiplication and division/i, '×÷', '#9b6bff', 's'], [/perkalian|mengalikan|multiplication|multiplying/i, '×', '#9b6bff'], [/pembagian|membagi|division|dividing/i, '÷', '#ff5f9a'],
    [/desimal|decimal/i, '0.5', '#00a6a6', 's'], [/pecahan|fraction/i, '½', '#ff9f1c'], [/persen|percent/i, '%', '#ef476f'], [/rasio|ratio/i, '1:2', '#2ec4b6', 's'],
    [/bilangan bulat|integer/i, '−3', '#5c7cfa', 's'], [/pangkat dan akar|powers and roots|exponents and roots/i, '√', '#7048e8'], [/pangkat sepuluh|powers of ten/i, '10ⁿ', '#7048e8', 's'],
    [/aljabar|ekspresi|algebra|expression/i, 'x', '#e8590c'], [/persamaan|kesamaan|equation|equalit/i, '=', '#e8590c'], [/^bilangan|^numbers/i, '123', '#19b796', 's'],
  ];
  function chLogo(u) {
    const r = CH_LOGO.find((x) => x[0].test(u.name));
    return r ? `<b class="mq-glyph ${r[3] || ''}" style="--gc:${r[2]}">${r[1]}</b>` : u.icon;
  }
  const unitIcon = (sk) => { const u = UNITS.find((x) => x.id === sk.unit); return u ? chLogo(u) : '⭐'; };

  // Peti harta karun: terkunci (abu-abu), siap (emas, bergoyang), terbuka (tutup naik, bersinar)
  function chestSVG(state, anim) {
    const g = state === 'locked' ? { body: '#c9cfcd', dark: '#a3acaa', lid: '#dde2e0', gold: '#b4bcba' } : { body: '#c8741a', dark: '#8f5410', lid: '#e08a2c', gold: '#ffc800' };
    const lid = `<path d="M12 52V42a28 28 0 0 1 28-28h20a28 28 0 0 1 28 28v10z" fill="${g.lid}" stroke="${g.dark}" stroke-width="3" stroke-linejoin="round"/><rect x="43" y="13" width="14" height="39" fill="${g.gold}"/><path d="M20 32a22 22 0 0 1 13-13" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>`;
    const body = `<rect x="12" y="50" width="76" height="38" rx="7" fill="${g.body}" stroke="${g.dark}" stroke-width="3"/><rect x="43" y="50" width="14" height="38" fill="${g.gold}"/><path d="M12 63h76" stroke="${g.dark}" stroke-opacity=".25" stroke-width="2"/><rect x="41" y="46" width="18" height="20" rx="4" fill="${g.gold}" stroke="${g.dark}" stroke-width="2.5"/><circle cx="50" cy="54" r="3" fill="${g.dark}"/><rect x="48.8" y="54" width="2.4" height="7" rx="1" fill="${g.dark}"/>`;
    const sp = (dx, dy, d) => `<path class="bs" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${d}s" d="M50 38L53 46L61 49L53 52L50 60L47 52L39 49L47 46Z" fill="#ffc800"/>`;
    if (state === 'open') {
      const burst = `<g class="burst">${sp(-34, -46, 1.2)}${sp(30, -52, 1.3)}${sp(-12, -66, 1.25)}${sp(44, -22, 1.35)}${sp(-46, -18, 1.4)}</g>`;
      return `<svg class="mq-chestsvg ${anim ? 'mq-chestanim' : ''}" viewBox="0 0 100 100"><ellipse class="glow" cx="50" cy="50" rx="36" ry="14" fill="#fff3a0"/>${body}${burst}${anim ? `<g class="lid">${lid}</g>` : `<g transform="rotate(-52 12 52)">${lid}</g>`}</svg>`;
    }
    return `<svg class="mq-chestsvg ${anim === 'rattle' ? 'mq-rattle' : ''}" viewBox="0 0 100 100">${body}<g>${lid}</g></svg>`;
  }
  const chestStateOf = (sid, u) => {
    const done = u.skills.every((s) => S.progress(sid, s.id).score >= 80), t = S.testOf(sid, u.id);
    return !done ? 'locked' : t && t.best >= 60 ? 'open' : 'ready';
  };
  function chestPop(u) {
    const st = studentNow(); if (!st) return '';
    const state = chestStateOf(st.id, u), t = S.testOf(st.id, u.id);
    if (state === 'locked') return '<div class="mq-pop lock" style="--ax:50%"><b>🔒 Chapter test locked</b><small>Finish all the steps in this chapter first</small><button class="mq-btn" data-act="tocur">Go to my step</button></div>';
    if (state === 'open') return `<div class="mq-pop" style="--ax:50%"><b>The chest is open!</b><small>Best score ${t.best}% · ${t.stars} ⭐</small><a class="mq-btn" href="#/ujian/${u.id}">Try again</a></div>`;
    return `<div class="mq-pop" style="--ax:50%"><b>Chapter ${u.id} Test: ${esc(u.name)}</b><small>${TEST_N} questions · score 60 to open the chest</small><a class="mq-btn" href="#/ujian/${u.id}">Start test</a></div>`;
  }

  function viewTest(uid) {
    const ses = session.get(), st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const u = UNITS.find((x) => x.id === uid); if (!u) return go('#/belajar');
    if (chestStateOf(st.id, u) === 'locked') { toast('Finish all the steps in this chapter first'); return go('#/belajar'); }
    let queue = []; while (queue.length < TEST_N) queue = queue.concat(shuf(u.skills.map((s) => s.id)));
    queue = queue.slice(0, TEST_N);
    P = { sid: st.id, sk: SKILLS[queue[0]], rid: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), test: { unit: u.id, queue }, score: 100, score0: 100, count: 0, correct: 0, combo: 0, start: Date.now(), msSum: 0, q: null, input: '', sel: -1, locked: false };
    app.innerHTML = lessonShell(0, 'quit', false);
    nextQ();
  }
  // Hasil ujian bab: peti terbuka (nilai 60+) atau tetap terkunci
  function renderChest() {
    const u = UNITS.find((x) => x.id === P.test.unit), pctv = pct(P.correct, P.count), avg = P.msSum / Math.max(1, P.count);
    const fast = avg < MIN_AVG_MS, pass = pctv >= 60 && !fast;
    const prev = S.testOf(P.sid, u.id), wasOpen = !!(prev && prev.best >= 60), tier = pass ? chestStars(pctv) : 0;
    const gain = Math.max(0, tier - (prev ? prev.stars : 0));
    const rec = S.recordTest(P.sid, u.id, { pct: pctv, stars: tier, ms: P.msSum, counted: pass });
    const sync = [rec]; if (gain) { const r = S.addStars(P.sid, gain); if (r.entry) sync.push(r); }
    if (cloudOn()) sync.forEach((r) => Cloud.queueProgress(P.sid, session.get().code, r.key, r.entry));
    if (STARS_SRV && cloudOn()) Cloud.queueClaim(P.sid, session.get().code, { id: P.rid, kind: 'test', unit: u.id, d: S.todayKey() });
    if (pass) window.SFX.mastered(); else window.SFX.wrong();
    const best = S.testOf(P.sid, u.id), tierNow = best ? chestTier(best.stars) : 1;
    app.innerHTML = `<main class="mq-screen"><div class="mq-result">
        <div class="mq-chestbox">${pass ? chestSVG('open', true) : chestSVG('ready', 'rattle')}</div>
        ${pass ? `<div class="mq-starrow">${[1, 2, 3].map((i) => `<span class="mq-bigstar ${i <= tierNow ? 'on' : ''}" style="--d:${1.5 + i * 0.22}s">★</span>`).join('')}</div>` : ''}
        <h1 class="mq-rtitle ${pass ? 't' : ''}">${pass ? 'The chest is open!' : fast ? 'Too fast!' : 'Almost there!'}</h1>
        <p class="mq-rsub">Chapter ${u.id} Test · ${esc(u.name)}</p>
        <div class="mq-stats3"><div class="mq-stat" style="--c:#e0a800"><small>Score</small><b>${pctv}%</b></div><div class="mq-stat" style="--c:#19b796"><small>Stars</small><b>${gain ? `+${gain}` : '–'}</b></div><div class="mq-stat" style="--c:#1c9be8"><small>Time</small><b>${mmss(Date.now() - P.start)}</b></div></div>
        ${pass && !wasOpen ? `<div class="mq-unlock mq-medal"><span class="mq-medal-i">${chLogo(u)}</span> You earned the Chapter ${u.id} Badge!</div>` : ''}
        ${pass && wasOpen && !gain ? '<div class="mq-unlock">You\'ve already earned this chest\'s stars. Try for a higher score to get bonus stars!</div>' : ''}
        ${!pass ? `<div class="mq-unlock" style="background:#fff3c4;color:#8a5a00">${fast ? 'Read the question slowly, then try again.' : 'You need a score of 60 to open the chest. Practice more and try the test again!'}</div>` : ''}
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in">${pass ? `<a class="mq-btn pulse" href="#/bab/${u.id}">Continue</a>` + '<button class="mq-btn ghost" data-act="testagain" data-u="' + u.id + '">Retake test</button>' : '<button class="mq-btn pulse" data-act="testagain" data-u="' + u.id + '">Try again</button><a class="mq-btn ghost" href="#/belajar">Back to the map</a>'}</div></div>`;
  }

  // Layar akhir satu putaran latihan: bintang, tiga kartu (skor, tepat, waktu), dan satu tombol utama yang menyesuaikan
  function renderRound() {
    clearInterval(timer);
    const sk = P.sk, mastered = P.score >= 100, acc = pct(P.correct, P.count), delta = P.score - P.score0, up = P.score >= 80 && P.score0 < 80;
    const avg = P.msSum / Math.max(1, P.count);
    let want = acc >= 100 ? 3 : acc >= 80 ? 2 : acc >= 60 ? 1 : 0, why = '';
    if (P.score0 >= 100) { want = 0; why = 'You\'ve already completed this, so this practice earns no stars.'; }
    else if (avg < MIN_AVG_MS) { want = 0; why = 'Too fast! Read the question slowly.'; }
    const r = want ? S.addStars(P.sid, want, STAR_CAP) : { given: 0, key: null, entry: null };
    if (want && !r.given) why = `You've reached today's limit of ${STAR_CAP} stars. Come back tomorrow!`;
    if (r.entry && cloudOn()) Cloud.queueProgress(P.sid, session.get().code, r.key, r.entry);
    if (STARS_SRV && cloudOn()) Cloud.queueClaim(P.sid, session.get().code, { id: P.rid, kind: 'practice', s0: P.score0, d: S.todayKey(), n: P.count });
    const needMore = P.score < 80;
    app.innerHTML = `<main class="mq-screen"><div class="mq-result">${MQ.svg(acc >= 60 || mastered ? 'cheer' : 'happy', { size: 150 })}
        <div class="mq-starrow">${[1, 2, 3].map((i) => `<span class="mq-bigstar ${i <= r.given ? 'on' : ''}" style="--d:${0.5 + i * 0.25}s">★</span>`).join('')}</div>
        <h1 class="mq-rtitle">${mastered ? 'Complete! Amazing!' : acc >= 70 ? 'Practice finished!' : 'Keep practicing!'}</h1><p class="mq-rsub">${esc(sk.name)}${r.given ? ` · +${r.given} ⭐` : ''}</p>
        <div class="mq-stats3"><div class="mq-stat" style="--c:#e0a800"><small>Score</small><b>${P.score}${delta ? `<em>${delta > 0 ? '+' : ''}${delta}</em>` : ''}</b></div><div class="mq-stat" style="--c:#19b796"><small>Correct</small><b>${acc}%</b></div><div class="mq-stat" style="--c:#1c9be8"><small>Time</small><b>${mmss(Date.now() - P.start)}</b></div></div>
        ${why ? `<div class="mq-unlock" style="background:#fff3c4;color:#8a5a00">${why}</div>` : ''}
        ${up ? '<div class="mq-unlock">🔓 The next step is unlocked!</div>' : needMore && !why ? '<div class="mq-unlock" style="background:#fff3c4;color:#8a5a00">Reach a score of 80 to become Proficient ⭐</div>' : ''}
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in">${needMore
    ? `<button class="mq-btn pulse" data-act="again">Practice again</button><a class="mq-btn ghost" href="#/bab/${sk.unit}">Back to missions</a>`
    : `<a class="mq-btn pulse" href="#/bab/${sk.unit}">Continue</a><button class="mq-btn ghost" data-act="again">Practice again</button>`}</div></div>`;
  }
  function renderMastered() {
    const u = UNITS.find((x) => x.id === P.sk.unit);
    const nextSk = u && u.skills[u.skills.findIndex((s) => s.id === P.sk.id) + 1];
    app.innerHTML = `<main class="mq-screen"><div class="mq-result">${MQ.svg('cheer', { size: 180 })}<h1 class="mq-rtitle">You've completed it!</h1><p class="mq-rsub">${esc(P.sk.name)}</p></div></main>
      <div class="mq-foot"><div class="mq-foot-in">${nextSk ? `<a class="mq-btn pulse" href="#/latihan/${nextSk.id}">Next: ${esc(nextSk.name)}</a><a class="mq-btn ghost" href="#/bab/${P.sk.unit}">Back to missions</a>` : `<a class="mq-btn pulse" href="#/bab/${P.sk.unit}">Back to missions</a>`}<button class="mq-link" data-act="again">Practice again</button></div></div>`;
  }

  /* ---------- Guru ---------- */
  function viewTeacherAuthCloud(mode) {
    const reg = mode === 'daftar';
    app.innerHTML = shell(`
      <a class="back" href="#/">← Back</a>
      <p class="trynote center small"><button class="link" data-act="trydemo" data-r="guru">🧪 Try it as a sample teacher first (no sign-up) →</button></p>
      <section class="card narrow">
        <div class="bigemoji center">👩‍🏫</div>
        ${reg ? `<h1 class="center">Free teacher sign-up</h1><p class="center muted small">Active right away, with no approval needed. All class tools are free for teachers.</p>
          <form data-form="register" class="form">
            <label>Teacher name<input name="name" required placeholder="e.g. Ms. Rina" autocomplete="name"></label>
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <label>Password (at least 8 characters)<input name="pass" type="password" minlength="8" required autocomplete="new-password"></label>
            <label>First class name<input name="cls" required placeholder="e.g. Class 1A, or Afternoon Math Club"></label>
            <details class="small"><summary>Have a Metiq admin code?</summary><label>Admin code<input name="admin" autocomplete="off" autocapitalize="characters"></label></details>
            <button class="btn">Create free account</button>
          </form><p class="center"><a href="#/guru/masuk">Already have an account? Log in</a></p>
          <p class="center small muted">For schools with many classes: <a href="#/harga">see the School plan</a>. The school admin adds teachers to the school.</p>`
        : `<h1 class="center">Teacher login</h1>
          <form data-form="login" class="form">
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <label>Password<input name="pass" type="password" required autocomplete="current-password"></label>
            <button class="btn">Log in</button>
          </form><p class="center"><a href="#/guru/daftar">No account yet? Sign up free</a> · <a href="#/harga">School plan</a></p>`}
        <p class="muted small center">Class data is stored safely on the server and can be opened from any phone.</p>
      </section>`);
  }
  function viewTeacherAuth(mode) {
    if (cloudOn()) return viewTeacherAuthCloud(mode);
    const ts = S.db.teachers;
    const reg = mode === 'daftar' || !ts.length;
    app.innerHTML = shell(`
      <a class="back" href="#/">← Back</a>
      <section class="card narrow">
        <div class="bigemoji center">👩‍🏫</div>
        ${reg ? `<h1 class="center">Sign up as a teacher</h1>
          <form data-form="register" class="form">
            <label>Teacher name<input name="name" required placeholder="e.g. Ms. Rina"></label>
            <label>Class name<input name="cls" required placeholder="e.g. Class 1A"></label>
            <label>PIN (4–6 digits)<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,6}" required></label>
            <button class="btn">Create account</button>
          </form>${ts.length ? '<p class="center"><a href="#/guru">Already have an account? Log in</a></p>' : ''}`
        : `<h1 class="center">Teacher login</h1>
          <form data-form="login" class="form">
            <label>Teacher name<select name="id">${ts.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label>
            <label>PIN<input name="pin" type="password" inputmode="numeric" required></label>
            <button class="btn">Log in</button>
          </form><p class="center"><a href="#/guru/daftar">Sign up a new teacher</a></p>`}
        <p class="muted small center">Data is stored on this device.</p>
      </section>`);
  }
  function teacherCtx() {
    const ses = session.get(); const t = ses.role === 'guru' && S.teacher(ses.id);
    if (!t) return null;
    // Di mode server, daftar kelas sudah disaring oleh server (admin melihat semua kelas)
    let classes = cloudOn() || t.isAdmin ? S.db.classes.slice() : S.classesOf(t.id);
    if (!cloudOn()) classes = classes.map((c) => Object.assign({ teacherName: (S.teacher(c.teacherId) || {}).name }, c));
    if (!classes.length) { if (cloudOn()) return null; classes = [S.createClass(t.id, 'Grade 1')]; }
    const c = classes.find((x) => x.id === ses.classId) || classes[0];
    return { t, c, classes, kids: S.studentsOf(c.id) };
  }
  // Tiga tab saja untuk guru. Setiap halaman menjawab satu pertanyaan: apa yang perlu dilakukan, bagaimana siswa saya, tugas apa yang diberikan.
  const TAB_GROUPS = [
    ['hari', '🏠 Today', [['ringkasan', 'Today']]],
    ['siswa', '🧒 Students', [['siswa', 'Student']]],
    ['tugas', '📌 Tasks', [['tugas', 'Tasks']]],
  ];
  // Analitik dan data penelitian: hanya akun super admin sungguhan (bukan mode coba, bukan guru, bukan admin sekolah)
  const canResearch = (ctx) => !!(ctx.t.isAdmin && !session.get().demo);
  const RESEARCH_SCHOOL = [['data', '📥 Research data'], ['asesmen', '🧭 Pre- and post-assessment'], ['grafik', '📊 Charts'], ['guru', '👩‍🏫 By teacher'], ['ulasan', '⭐ Reviews'], ['coba', '🧪 Demo mode']];
  const RESEARCH_GROUP = ['riset', '🔬 Research', [['analitik', 'Analytics'], ['semua', 'All progress'], ['peta', 'Progress map'], ['keterampilan', 'Skills'], ['kelompok', 'Level groups'], ['peringkat', 'Leaderboard'], ...RESEARCH_SCHOOL.map(([k, l]) => ['riset/' + k, l])]];
  const RESEARCH_TABS = new Set(['riset', ...RESEARCH_GROUP[2].map(([k]) => k)]);
  const groupOf = (tab) => [...TAB_GROUPS, RESEARCH_GROUP].find((g) => g[2].some(([k]) => k === tab));
  // Angka siswa tanpa kelas untuk admin (disimpan sebentar agar tidak memanggil server setiap pindah tab)
  let ungCount = { n: null, at: 0 };
  async function loadUngCount(ctx) {
    if (!ctx.t.isAdmin || !cloudOn() || session.get().demo) return;
    if (ungCount.n === null || Date.now() - ungCount.at > 60000) {
      try { ungCount = { n: await Cloud.rpc('admin_ungrouped_count', { p_token: session.get().token }), at: Date.now() }; }
      catch (e) { try { ungCount = { n: (await Cloud.rpc('admin_ungrouped', { p_token: session.get().token })).length, at: Date.now() }; } catch (e2) { return; } }
    }
    const n = ungCount.n || 0;
    document.querySelectorAll('[data-ungc]').forEach((el) => { el.textContent = n; el.hidden = !n; });
    const row = document.getElementById('todo-ung');
    if (row && n) row.outerHTML = todoRow('🧺', `${n} students have no class yet`, 'Children who started learning on their own. Add them to the right class.', '<a class="btn sm" href="#/guru/tanpa">Add to a class</a>', 'warn');
  }
  function teacherShell(ctx, tab, inner) {
    const admin = [...(ctx.t.isAdmin && cloudOn() && !session.get().demo ? [['tanpa', '🧺 No class']] : []), ...(ctx.t.isAdmin || ctx.t.isSchoolAdmin ? [['sekolah', '🏫 School']] : []), ...(canResearch(ctx) ? [['analitik', '🔬 Research'], ['super', '🌐 Super admin']] : [])];
    const grp = groupOf(tab);
    app.innerHTML = shell(`
      <section class="dhead">
        <div class="dh-row"><a class="av avedit" href="#/avatar/guru" aria-label="Change avatar">${avHTML(ctx.t.avatar || 'svg:ustadzah')}<i>✏️</i></a>
          <div class="dh-text"><div class="dh-who">${esc(ctx.t.name)}${canResearch(ctx) ? ' <span class="pill">Super admin</span>' : ctx.t.isAdmin || ctx.t.isSchoolAdmin ? ' <span class="pill">School admin</span>' : ''}${ctx.t.schoolName ? ` <span class="muted small">· ${esc(ctx.t.schoolName)}</span>` : ''}</div>
            ${ctx.classes.length > 1 ? `<select class="dh-title" data-act="switchclass" aria-label="Choose a grade">${ctx.classes.map((c) => `<option value="${c.id}" ${c.id === ctx.c.id ? 'selected' : ''}>${esc(c.name)}${(ctx.t.isAdmin || ctx.t.isSchoolAdmin) && c.teacherName ? ` · ${esc(c.teacherName)}` : ''}</option>`).join('')}</select>` : `<h1>${esc(ctx.c.name)}</h1>`}
            ${ctx.c.teacherName && ctx.c.teacherId !== ctx.t.id ? `<div class="dh-meta">Class teacher: ${esc(ctx.c.teacherName)}</div>` : ''}</div>
          <a class="dh-gear ${tab === 'kelola' ? 'on' : ''}" href="#/guru/kelola" aria-label="Class settings">⚙️<small>Class</small></a>
          <button class="dh-code" data-act="shareclass" aria-label="Share class code"><small>Class code</small><b>${ctx.c.code}</b><small>📤 share</small></button></div>
      </section>
      <div class="tabbar"><nav class="tabs tmain">${TAB_GROUPS.map(([id, label, pages]) => `<a href="#/guru/${pages[0][0]}" class="${grp && grp[0] === id ? 'on' : ''}">${label}</a>`).join('')}${admin.length ? `<span class="tsep" aria-hidden="true"></span>${admin.map(([k, l]) => `<a href="#/guru/${k}" class="adm ${k === tab || (k === 'analitik' && grp && grp[0] === 'riset') ? 'on' : ''}">${l}${k === 'tanpa' ? '<span class="tcount" data-ungc hidden></span>' : ''}</a>`).join('')}` : ''}</nav></div>
      ${grp && grp[2].length > 1 ? `<nav class="tsub" aria-label="Section ${grp[1]}">${grp[2].map(([k, l]) => `<a href="#/guru/${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</nav>` : ''}
      ${inner}
      ${session.get().demo && tab === 'ringkasan' ? realTeacherCard() : ''}`, { cls: 'wide', right: topRight() });
    loadUngCount(ctx);
  }

  function emptyKids(ctx) {
    return `<section class="card center"><div class="bigemoji">🧑‍🤝‍🧑</div><h2>There are no students in this class yet</h2><p class="muted">This page fills in once students start learning.</p><a class="btn" href="#/guru/siswa">➕ Add students</a></section>`;
  }
  // Menambah siswa: cara yang paling sering terlihat lebih dulu, cara lain tidak mengganggu
  function addKidsHTML(ctx, open) {
    return `<details class="card addkids" id="addkids" ${open ? 'open' : ''}><summary><b>➕ Add students</b></summary>
      <form data-form="addkid" class="form addname"><label>Type the student names. For several students, separate them with commas.<textarea name="name" rows="2" placeholder="e.g. Aisyah, Umar, Fatimah" required></textarea></label><button class="btn">Save names</button></form>
      <div class="addnext"><span class="grow"><b>Then send the class code to students</b><small>Students open Metiq, tap I'm a Student, enter the code <b class="code">${ctx.c.code}</b>, then choose their name.</small></span><button class="btn ghost sm" data-act="shareclass">📤 Send code</button></div>
      <details class="addalt"><summary>Does the student already have their own Metiq account?</summary><p class="small muted">Ask for the <b>learning code</b> (6 letters) on the Me page on the child's phone. Their learning history comes along.</p>
        <form data-form="addbycode" class="form inline"><input name="code" maxlength="6" placeholder="Learning code" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Child's learning code" required><button class="btn ghost">Add</button></form></details>
    </details>`;
  }
  // Keadaan satu siswa dalam kata sehari-hari. Dipakai di Hari ini, Siswa, dan halaman siswa.
  const KID_ST = { bantu: ['🆘', 'Needs help', 'r'], baru: ['📱', 'Not started', 'y'], diam: ['😴', 'No practice for 7 days', 'y'], baik: ['✅', 'Good', 'g'] };
  function kidState(k) {
    const w = stats(k.id, 7), all = stats(k.id), weak = weaknesses(k.id), tried = skillRows(k.id).length;
    const behind = weak.length >= 2 && weak.length >= tried / 4;
    const st = !all.answered ? 'baru' : !w.answered ? 'diam' : (w.answered >= 10 && w.acc < 65) || behind ? 'bantu' : 'baik';
    const why = st === 'baru' ? 'Has never opened Metiq' : st === 'diam' ? `Last practiced ${ago(all.last)}` : st === 'bantu' ? (weak[0] ? `Still hard: ${weak[0].skill.name}` : `Only ${w.acc}% correct this week`) : `${w.answered} questions this week, ${w.acc}% correct`;
    return { k, w, all, weak, st, why };
  }
  const parentLinked = (k) => (k.parents || []).length > 0 || S.viewsOf(k.id).length > 0;
  const taskOpen = (sid, skill) => S.assignmentsFor(sid).some((a) => a.skills.includes(skill) && !S.isDone(a.id, sid));
  const nameList = (list) => list.slice(0, 3).map((x) => esc((x.k || x).name)).join(', ') + (list.length > 3 ? `, and ${list.length - 3} more` : '');
  const giveBtn = (sid, skill, label) => (taskOpen(sid, skill) ? '<span class="pill okp">Already given</span>' : `<button class="btn sm" data-act="assignkid" data-id="${skill}" data-s="${sid}">${label || 'Give practice'}</button>`);
  // Daftar siswa: dikelompokkan menurut keadaan, yang perlu perhatian di atas
  function rosterHTML(ctx) {
    const rows = ctx.kids.map(kidState);
    const card = (r) => `<div class="kcard ${KID_ST[r.st][2]}" data-href="#/guru/siswa/${r.k.id}"><span class="av">${avHTML(r.k.avatar)}</span><span class="grow"><a href="#/guru/siswa/${r.k.id}"><b>${esc(r.k.name)}</b></a><small>${r.why}</small></span>${parentLinked(r.k) ? '' : `<button class="link small kpar" data-act="shareparent" data-id="${r.k.id}" aria-label="Send parent code for ${esc(r.k.name)}">📤 Parent</button>`}<span class="kgo" aria-hidden="true">›</span></div>`;
    const group = (st) => { const l = rows.filter((r) => r.st === st).sort((a, b) => a.k.name.localeCompare(b.k.name, 'en')); return l.length ? `<h3 class="kgh">${KID_ST[st][0]} ${KID_ST[st][1]} <span class="pill">${l.length}</span></h3><div class="kgrid">${l.map(card).join('')}</div>` : ''; };
    return `<section class="card"><div class="rhead"><h2>Students <span class="pill">${ctx.kids.length}</span></h2><span class="grow"></span><button class="btn ghost sm" data-act="print">🖨️ Print code cards</button></div>
      <p class="small muted">Tap a name to see their progress. 📤 Parent = the parent code has not been sent yet.</p>
      ${group('bantu')}${group('baru')}${group('diam')}${group('baik')}</section>
      <div class="printcards">${ctx.kids.map((k) => `<div class="pcard"><div class="av">${avHTML(k.avatar)}</div><b>${esc(k.name)}</b><div>Class code: <b>${ctx.c.code}</b></div><div>Parent code: <b>${k.parentCode}</b></div><small>metiq · ${esc(ctx.c.name)}</small></div>`).join('')}</div>`;
  }
  // Satu baris "yang perlu dilakukan": ikon, kalimat, keterangan, satu tombol
  const todoRow = (ic, text, sub, btn, tone) => `<div class="todo ${tone || ''}"><span class="tic">${ic}</span><span class="grow"><b>${text}</b>${sub ? `<small>${sub}</small>` : ''}</span>${btn || ''}</div>`;
  // "Hari ini": satu kalimat keadaan kelas, paling banyak tiga hal untuk dikerjakan, lalu siapa dan apa yang perlu dibantu
  function todayHTML(ctx) {
    const kids = ctx.kids, h = new Date().getHours(), hello = h < 11 ? 'Good morning' : h < 15 ? 'Good afternoon' : h < 18 ? 'Good afternoon' : 'Good evening';
    const ung = ctx.t.isAdmin && cloudOn() && !session.get().demo ? '<div id="todo-ung"></div>' : '';
    if (!kids.length) {
      return `${ung}<section class="card thero"><small>${hello}, ${esc(ctx.t.name)}</small><h1>Start in 3 steps</h1>
        <ol class="steps3"><li class="on"><b>Enter student names</b><small>In the box below.</small></li><li><b>Send the class code to students</b><small>Through your WhatsApp group, with one button.</small></li><li><b>Choose the first task</b><small>Metiq prepares suggestions.</small></li></ol></section>${addKidsHTML(ctx, true)}`;
    }
    const st = kids.map(kidState), by = (x) => st.filter((s) => s.st === x);
    const help = by('bantu'), never = by('baru'), idle = by('diam'), active = st.filter((s) => s.w.answered > 0);
    const ids = new Set(kids.map((k) => k.id)), seen = getSeen();
    const fresh = S.db.done.filter((d) => ids.has(d.sid) && d.at > Math.max(seen, Date.now() - 3 * DAY));
    const asgWeek = S.assignmentsOf(ctx.c.id).filter((a) => (a.createdAt || 0) > Date.now() - 7 * DAY);
    const noParent = kids.filter((k) => !parentLinked(k));
    const pA = pct(active.length, kids.length), mood = pA >= 75 ? 'The class is doing well.' : pA >= 40 ? 'Some students need a nudge to practice.' : 'Many students have not practiced this week.';
    const todo = [];
    if (fresh.length) todo.push(todoRow('📥', `${fresh.length} new tasks completed`, 'See who has finished.', '<a class="btn sm" href="#/notifikasi">View</a>', 'good'));
    if (never.length) todo.push(todoRow('📱', `${never.length} students have never logged in`, nameList(never), '<button class="btn sm" data-act="shareclass">Send class code</button>'));
    if (!asgWeek.length) todo.push(todoRow('📌', 'No tasks this week yet', 'Metiq has prepared suggestions that are ready to send.', '<a class="btn sm" href="#/guru/tugas">Choose a task</a>'));
    if (idle.length) todo.push(todoRow('😴', `${idle.length} students haven't practiced in 7 days`, nameList(idle), '<button class="btn sm" data-act="remind">Remind</button>'));
    if (noParent.length) todo.push(todoRow('👨‍👩‍👧', `${noParent.length} parents not connected yet`, 'Send it so parents can see the reports.', '<a class="btn sm" href="#/guru/siswa">Send code</a>'));
    const hardMap = {};
    st.forEach((s) => s.weak.forEach((w) => { (hardMap[w.id] = hardMap[w.id] || []).push(s.k); }));
    const hard = Object.entries(hardMap).filter(([, l]) => l.length >= 2).sort((a, b) => b[1].length - a[1].length)[0];
    const stars3Row = st.filter((s) => s.w.correct > 0).sort((a, b) => b.w.correct - a.w.correct).slice(0, 3);
    const helpRow = (s) => `<div class="lrow"><span class="av sm">${avHTML(s.k.avatar)}</span><span class="grow"><a href="#/guru/siswa/${s.k.id}"><b>${esc(s.k.name)}</b></a><small>${s.why}</small></span>${s.weak[0] ? giveBtn(s.k.id, s.weak[0].id) : ''}</div>`;
    return `<section class="card thero"><small>${hello}, ${esc(ctx.t.name)}</small>
        <h1><b>${active.length} of ${kids.length}</b> students practiced this week</h1><div class="tbar"><i style="width:${pA}%"></i></div><p>${mood}</p></section>
      <section class="card todos"><h2>To do</h2>${ung}${todo.slice(0, 3).join('') || todoRow('✅', 'All clear today', 'Nothing urgent.', '', 'good')}</section>
      <div class="grid2">
        ${help.length ? `<section class="card"><h2>🆘 Students who need help</h2>${help.slice(0, 4).map(helpRow).join('')}${help.length > 4 ? `<p class="small"><a href="#/guru/siswa">See ${help.length - 4} more students</a></p>` : ''}</section>` : ''}
        ${hard ? `<section class="card"><h2>📖 Worth reviewing together</h2><p><b>${SKILLS[hard[0]].name}</b></p><p class="small muted">${hard[1].length} of ${kids.length} students still struggle: ${nameList(hard[1])}.</p>
          <div class="row-btn left">${LESSONS[SKILLS[hard[0]].unit] ? `<a class="btn sm ghost" href="#/pelajaran/${SKILLS[hard[0]].unit}">Open lesson</a>` : ''}<button class="btn sm" data-act="assign1" data-id="${hard[0]}">Assign to class</button></div></section>` : ''}
        ${stars3Row.length ? `<section class="card"><h2>⭐ Stars of the week</h2><p class="small muted">Say their names in class. A little praise means a lot.</p>${stars3Row.map((s, i) => `<div class="lrow"><span class="medal">${['🥇', '🥈', '🥉'][i]}</span><span class="grow"><a href="#/guru/siswa/${s.k.id}"><b>${esc(s.k.name)}</b></a><small>${s.w.correct} correct answers</small></span></div>`).join('')}</section>` : ''}
      </div>`;
  }

  function classSkillAgg(kids) {
    const agg = {};
    kids.forEach((k) => Object.entries(S.progressAll(k.id)).forEach(([sid, p]) => {
      if (!SKILLS[sid]) return; const a = agg[sid] = agg[sid] || { att: 0, ok: 0, n: 0, score: 0, students: [] };
      a.att += p.att; a.ok += p.ok; a.n++; a.score += p.score; a.students.push({ k, p });
    }));
    return agg;
  }
  /* ---------- Peringkat bintang (guru dan admin): dasar pemberian hadiah ---------- */
  const rkFrom = (per) => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    if (per === 'pekan') return d.getTime() - ((d.getDay() + 6) % 7) * DAY;
    if (per === 'bulan') { d.setDate(1); return d.getTime(); }
    return 0;
  };
  function rankRows(ctx) {
    const per = ss.get('rkp', 'pekan'), from = rkFrom(per), wide = (ctx.t.isAdmin || ctx.t.isSchoolAdmin) && ss.get('rks', 'kelas') === 'semua';
    const kids = wide ? S.db.students.slice() : ctx.kids;
    const rows = kids.map((k) => {
      const ans = S.answersOf(k.id).filter((a) => a.ts >= from), ok = ans.filter((a) => a.ok).length, stars = S.starsOf(k.id, from);
      return { k, cls: (S.cls(k.classId) || {}).name || '', stars, n: ans.length, acc: pct(ok, ans.length), ms: ans.reduce((t, a) => t + Math.min(a.ms || 0, 180000), 0), days: S.starDays(k.id, from), chests: S.testsOpen(k.id).length,
        // bintang jauh lebih banyak daripada soal yang dijawab: periksa dulu sebelum memberi hadiah
        sus: stars > ans.length + 95 };
    }).sort((a, b) => b.stars - a.stars || b.n - a.n);
    return { rows, per, wide };
  }
  function rankingHTML(ctx) {
    const { rows, per, wide } = rankRows(ctx), admin = ctx.t.isAdmin || ctx.t.isSchoolAdmin;
    const pill = (act, key, val, label) => `<button class="${ss.get(key, key === 'rkp' ? 'pekan' : 'kelas') === val ? 'on' : ''}" data-act="${act}" data-v="${val}">${label}</button>`;
    return `<section class="card"><h2>🏆 Star leaderboard</h2>
      <p class="small muted">Stars come from practice, chapter tests, and games. Already-completed practice, rushed answers, and more than ${STAR_CAP} stars per day aren't counted.</p>
      <div class="vzpills">${pill('rkp', 'rkp', 'pekan', 'This week')}${pill('rkp', 'rkp', 'bulan', 'This month')}${pill('rkp', 'rkp', 'semua', 'All')}</div>
      ${admin ? `<div class="vzpills">${pill('rks', 'rks', 'kelas', 'This class')}${pill('rks', 'rks', 'semua', 'All classes')}</div>` : ''}
      <div class="tscroll"><table class="tbl"><thead><tr><th>#</th><th>Student</th><th>⭐ Stars</th><th>Questions</th><th>Correct</th><th>Time</th><th>Active days</th><th>🏅 Chapters</th></tr></thead><tbody>
      ${rows.map((r, i) => `<tr><td>${stars3(i, r.stars)}</td><td><span class="av sm">${avHTML(r.k.avatar)}</span> <a href="#/guru/siswa/${r.k.id}">${esc(r.k.name)}</a>${wide ? `<small class="muted"> · ${esc(r.cls)}</small>` : ''}${r.sus ? ' <span class="pill" title="Stars far outnumber the questions answered. Please check first.">⚠️ check</span>' : ''}</td><td><b>${r.stars}</b></td><td>${r.n}</td><td>${r.n ? r.acc + '%' : '–'}</td><td>${fmtTime(r.ms)}</td><td>${r.days}</td><td>${r.chests}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="row-btn left"><button class="btn sm" data-act="rkcsv">Download CSV</button></div></section>
      <section class="card"><h2>Notes for giving prizes</h2><ul class="small">
        <li><b>⚠️ check</b> appears when stars far outnumber the questions answered. Review the student's history before deciding.</li>
        <li>Stars are calculated from data on the student's device. For big prizes such as scholarships, also compare the Questions, Correct, and Time columns.</li>
        <li>Comparing students from different classes isn't quite fair. It's better to choose winners per class or per level.</li></ul></section>`;
  }
  const stars3 = (i, n) => (n > 0 && i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1);
  function exportRanking(ctx) {
    const { rows, per } = rankRows(ctx);
    downloadCSV(`star-leaderboard-${per}-${isoDay(Date.now())}.csv`, [['peringkat', 'nama', 'kelas', 'bintang', 'soal_dijawab', 'tepat_persen', 'menit_belajar', 'hari_aktif', 'bab_selesai', 'periksa'],
      ...rows.map((r, i) => [i + 1, r.k.name, r.cls, r.stars, r.n, r.n ? r.acc : '', Math.round(r.ms / 60000), r.days, r.chests, r.sus ? 'ya' : ''])]);
  }


  // Laporan "Semua kemajuan": baris bab (jumlah keterampilan mahir/total) dan keterampilan (SmartScore), kolom siswa
  function allProgressHTML(ctx) {
    const one = ss.get('apStu', ''), kids = one ? ctx.kids.filter((k) => k.id === one) : ctx.kids, units = curUnits();
    const P = Object.fromEntries(kids.map((k) => [k.id, S.progressAll(k.id)]));
    const cell = (k, sid) => { const p = P[k.id][sid]; return p && p.att ? `<td class="apc ${p.score >= 80 ? 'g' : 'o'}">${p.score}%</td>` : '<td class="apc"></td>'; };
    const unitCell = (k, u) => { const n = u.skills.filter((sk) => (P[k.id][sk.id] || {}).score >= 80).length, tried = u.skills.some((sk) => (P[k.id][sk.id] || {}).att); return `<td class="apu ${tried ? '' : 'muted'}">${n}/${u.skills.length}</td>`; };
    return `<section class="card"><div class="rhead"><h2>All progress</h2><span class="grow"></span>
        <select data-act="apstu" aria-label="Student"><option value="">Students: all</option>${ctx.kids.map((k) => `<option value="${k.id}" ${k.id === one ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select>
        <button class="btn ghost sm" data-act="apcsv">⬇️ Download CSV</button></div>
      ${gradeTabs()}
      <p class="small muted">Chapter rows: how many skills are proficient (SmartScore 80+) out of all skills in that chapter. Skill rows: SmartScore, <span class="apc g">green</span> = proficient, <span class="apc o">orange</span> = learning, blank = not tried.</p>
      <div class="tscroll apwrap"><table class="tbl allprog"><thead><tr><th>${esc(gname(getGrade()))}</th>${kids.map((k) => `<th><a href="#/guru/siswa/${k.id}">${esc(k.name.split(' ')[0])}</a></th>`).join('')}</tr></thead><tbody>
        ${units.map((u) => `<tr class="apunit"><th><a href="${LESSONS[u.id] ? '#/pelajaran/' + u.id : '#/kurikulum'}">${u.icon} ${esc(u.name)}</a></th>${kids.map((k) => unitCell(k, u)).join('')}</tr>
          ${u.skills.map((sk) => `<tr><th class="apsk">${sk.code} ${esc(sk.name)}</th>${kids.map((k) => cell(k, sk.id)).join('')}</tr>`).join('')}`).join('')}
      </tbody></table></div></section>`;
  }
  function exportAllProgress(ctx) {
    const one = ss.get('apStu', ''), kids = one ? ctx.kids.filter((k) => k.id === one) : ctx.kids;
    const rows = [['bab', 'kode', 'keterampilan', ...kids.map((k) => k.name)]];
    curUnits().forEach((u) => u.skills.forEach((sk) => rows.push([u.name, sk.code, sk.name, ...kids.map((k) => { const p = S.progress(k.id, sk.id); return p.att ? p.score : ''; })])));
    downloadCSV(`all-progress-${gname(getGrade()).toLowerCase().replace(/\s+/g, '-')}-${isoDay(Date.now())}.csv`, rows);
  }
  function viewTeacher(tab, arg) {
    const ctx = teacherCtx(); if (!ctx) return go('#/guru/masuk');
    const { kids } = ctx;
    if (RESEARCH_TABS.has(tab) && !canResearch(ctx)) return go('#/guru/ringkasan');
    if (tab === 'riset') { const sub = RESEARCH_SCHOOL.some(([k]) => k === arg) ? arg : 'data'; teacherShell(ctx, 'riset/' + sub, schoolHTML(ctx, sub, true)); if (sub === 'coba') loadTrialStats(); return; }
    if (tab === 'siswa' && arg) return viewTeacherStudent(ctx, arg);
    if (tab === 'kelola') return teacherShell(ctx, tab, manageHTML(ctx));
    if (tab === 'referensi') return teacherShell(ctx, tab, referenceHTML());
    if (tab === 'tanpa') { if (!ctx.t.isAdmin || !cloudOn() || session.get().demo) return go('#/guru/ringkasan'); teacherShell(ctx, tab, `<div id="ung-box">${loadingHTML}</div>`); if (arg) loadStudentReport(ctx, arg); else loadUngrouped(ctx); return; }
    if (tab === 'peringkat') return teacherShell(ctx, tab, rankingHTML(ctx));
    if (tab === 'sekolah') { if (!ctx.t.isAdmin && !ctx.t.isSchoolAdmin) return go('#/guru/ringkasan'); teacherShell(ctx, tab, schoolHTML(ctx, arg)); if (arg === 'kelolaguru') loadSchoolTeachers(); return; }
    if (tab === 'super') { if (!ctx.t.isAdmin || session.get().demo) return go('#/guru/ringkasan'); teacherShell(ctx, tab, `<div id="super-box">${loadingHTML}</div>`); loadSuper(ctx, arg); return; }
    if (tab === 'tugas') return teacherShell(ctx, tab, tasksHTML(ctx));
    if (tab === 'siswa') return teacherShell(ctx, tab, addKidsHTML(ctx, !kids.length) + (kids.length ? rosterHTML(ctx) : ''));
    if (tab === 'ringkasan') return teacherShell(ctx, tab, todayHTML(ctx));
    if (!kids.length) return teacherShell(ctx, tab, emptyKids(ctx));
    if (tab === 'kelompok') return teacherShell(ctx, tab, groupsHTML(ctx));
    if (tab === 'analitik') return teacherShell(ctx, tab, analyticsHTML(ctx, arg));
    if (tab === 'semua') return teacherShell(ctx, tab, allProgressHTML(ctx));

    if (tab === 'peta') {
      return teacherShell(ctx, tab, `${gradeTabs()}<section class="card"><p class="muted small">Average SmartScore per chapter. Tap a name for details.</p><div class="tscroll"><table class="tbl heat"><thead><tr><th>Student</th>${curUnits().map((u) => `<th title="${u.name}">${u.icon}<br>${u.id}</th>`).join('')}</tr></thead><tbody>
        ${kids.map((k) => `<tr><td><a href="#/guru/siswa/${k.id}">${avHTML(k.avatar)} ${esc(k.name)}</a></td>${curUnits().map((u) => { const us = unitScore(k.id, u); return `<td class="hc ${level(us.avg)[1]}" title="${u.name}: ${us.avg}">${us.avg || ''}</td>`; }).join('')}</tr>`).join('')}
        </tbody></table></div><div class="legend">${[['Not yet', 'lv0'], ['Starting <50', 'lv1'], ['Developing 50–79', 'lv2'], ['Proficient 80–99', 'lv3'], ['Complete 100', 'lv4']].map(([l, c]) => `<span><i class="${c}"></i>${l}</span>`).join('')}</div></section>`);
    }
    if (tab === 'keterampilan') {
      const agg = classSkillAgg(kids);
      return teacherShell(ctx, tab, gradeTabs() + curUnits().map((u) => `<section class="card unit" style="--c:${u.color}"><h2><span class="uicon">${u.icon}</span>${u.id}. ${u.name}</h2><a class="lessonlink" href="#/pelajaran/${u.id}">📖 This chapter's lesson</a> ${u.skills.map((s) => { const a = agg[s.id]; const prof = a ? a.students.filter((x) => x.p.score >= 80).length : 0; return `<details class="skd"><summary><span class="sk-code">${s.code}</span><span class="grow">${s.name}</span><span class="muted small">${a ? `${a.n} students · ${pct(a.ok, a.att)}%` : 'not tried'}</span><span class="pill">${prof}/${kids.length} proficient</span></summary>
          ${a ? `<div class="skd-b">${a.students.sort((x, y) => x.p.score - y.p.score).map((x) => `<a class="lrow" href="#/guru/siswa/${x.k.id}"><span class="av sm">${avHTML(x.k.avatar)}</span><span class="grow">${esc(x.k.name)}<small>${x.p.att} questions · ${pct(x.p.ok, x.p.att)}% correct</small></span>${chip(x.p.score)}</a>`).join('')}</div>` : ''}<p class="small"><a href="#/coba/${s.id}">Try a sample question →</a></p></details>`; }).join('')}</section>`).join(''));
    }
    return go('#/guru/ringkasan');
  }
  // Penjelasan cara dan alasan penyusunan kurikulum (dipakai di Referensi guru dan halaman Kurikulum)
  function curriculumDesignHTML(full) {
    const n = (g) => unitsOf(g).reduce((a, u) => a + u.skills.length, 0);
    return `<div class="cdesign">
      <p>Metiq combines three references, each with a different role: <b>IXL</b> determines <i>what</i> is practiced, <b>Singapore Math</b> determines <i>how</i> concepts are explained, and <b>Kurikulum Merdeka</b> ensures everything matches <i>what students are required to reach</i> in Indonesia.</p>
      <h3>How it was built</h3>
      <ol class="csteps">
        <li><b>Coverage from IXL.</b> The IXL math skill lists for grades 1 to 6 were read one by one as a coverage map. IXL breaks material into small skills (one skill = one question type), which suits adaptive practice and tracking which parts haven't been mastered.</li>
        <li><b>Sequence and explanation from Singapore Math.</b> Skills are grouped into chapters and ordered following the Primary Mathematics / Dimensions Math flow: concrete → pictorial → abstract, number bonds, making 10, bar models for word problems, and area models for multiplication. This flow is used in lessons, explanations after wrong answers, and animations.</li>
        <li><b>Alignment with Kurikulum Merdeka.</b> Each chapter is mapped to a Learning Outcomes element (Numbers, Algebra, Measurement, Geometry, Data Analysis and Probability) and its phase: grades 1–2 Phase A, grades 3–4 Phase B, grades 5–6 Phase C. Topics the outcomes place in a later phase are still provided but labeled <b>Enrichment</b>.</li>
        <li><b>Adapted to the Indonesian context.</b> US-specific IXL topics were replaced: dollars became Rupiah, inches and pounds became metric units, and a.m./p.m. became the 24-hour clock. Names and stories reflect everyday life in Indonesia.</li>
        <li><b>Questions, lessons, and feedback were written from scratch.</b> No questions were copied. Each skill has a random question generator so questions are always new, along with step-by-step explanations and error-pattern detection (for example "subtracting the smaller digit from the larger one" when borrowing).</li>
      </ol>
      <p class="small">The result is ${UNITS.length} chapters and ${Object.keys(SKILLS).length} skills: ${GRADES.map((g) => `${g.name} ${unitsOf(g.id).length} chapters / ${n(g.id)} skills`).join(', ')}.</p>
      <h3>Why use all three?</h3>
      <div class="refgrid">
        <div><h3>IXL: detailed and adaptive</h3><p>Its coverage is very complete and broken into small pieces, with a SmartScore that requires students to be consistently correct. Its drawbacks: it's built around an American context, with more "practice" than "explaining why".</p></div>
        <div><h3>Singapore Math: conceptual understanding</h3><p>The method emphasizes understanding over memorization, using the same pictures from grades 1 to 6 (number bonds, bar models). Singapore consistently ranks at the top of the international TIMSS and PISA studies.</p></div>
        <div><h3>Kurikulum Merdeka: what schools use</h3><p>Teachers assess students against the Learning Outcomes. Mapping to them makes Metiq practice directly relevant to class material, assessments, and report cards.</p></div>
      </div>
      ${full ? `<h3>Notes for teachers</h3><ul class="small">
        <li>This curriculum was built by the Metiq developer with help from AI (Claude), not by an official institution. Teachers are encouraged to review the chapters they use and give feedback if any sequence or term needs adjusting for their school.</li>
        <li>The names IXL and Singapore Math are used as references for coverage and method; Metiq is not affiliated with either.</li>
        <li>For research, cite Metiq as a practice medium based on these three references, and attach the chapter map below as the content outline.</li></ul>` : ''}
    </div>`;
  }
  /* Referensi kurikulum dan metode yang dipakai Metiq, untuk guru */
  function referenceHTML() {
    const nSkills = (g) => unitsOf(g).reduce((a, u) => a + u.skills.length, 0);
    const levels = [['Not tried', 'lv0'], ['Starting 1–49', 'lv1'], ['Developing 50–79', 'lv2'], ['Proficient 80–99', 'lv3'], ['Complete 100', 'lv4']];
    return `
      <section class="card ref"><h2>🧭 How the Metiq curriculum is built</h2>${curriculumDesignHTML(true)}</section>
      <section class="card ref"><h2>📚 Curriculum sources</h2>
        <p class="small muted">Metiq built its skill list from the following three sources. All questions, pictures, and explanations in Metiq were written from scratch; no questions were copied from any source.</p>
        <div class="refsrc"><h3>1. IXL Math</h3>
          <p>The per-grade skill lists were used as a reference for coverage and topic order, along with adaptive practice using SmartScore. The lists were read on October 26, 2026.</p>
          <ul>${GRADES.map((g) => `<li>${g.name}: <a href="${g.ixl}" target="_blank" rel="noopener">${g.ixl.replace('https://www.', '')}</a></li>`).join('')}</ul></div>
        <div class="refsrc"><h3>2. Singapore Math</h3>
          <p>The topic flow and method follow the Primary Mathematics / Dimensions Math series (${GRADES.map((g) => g.sg.replace('Primary Mathematics / Dimensions Math ', '')).join('; ')}), based on the Singapore Ministry of Education (MOE) primary math syllabus. References are written as topic names rather than chapter numbers, because the order differs between editions.</p></div>
        <div class="refsrc"><h3>3. Kurikulum Merdeka (Indonesia)</h3>
          <p>Each chapter is mapped to an element of the Math Learning Outcomes (CP): Numbers, Algebra, Measurement, Geometry, and Data Analysis and Probability. Grades 1–2 = <b>Phase A</b>, grades 3–4 = <b>Phase B</b>, grades 5–6 = <b>Phase C</b>. Topics that only appear in a later phase of the CP (e.g. multiplication in grade 2, or negative integers in grade 6, which belong to Phase D/middle school) are marked <b>Enrichment</b>. Please compare with the latest official CP document from the Indonesian Ministry of Education.</p></div>
      </section>
      <section class="card ref"><h2>🇸🇬 The Singapore Math method in Metiq</h2>
        <div class="refgrid">
          <div><h3>Concrete → Pictorial → Abstract</h3><p>Questions begin with pictures of objects, then a number sentence. Home practice tips always start with real objects.</p></div>
          <div><h3>Number bonds</h3><p>A "whole–part" diagram for understanding that 8 = 5 + 3. Used in the Number bonds chapter (grade 1) and number-splitting strategies (grade 2).</p></div>
          <div><h3>Making 10</h3><p>8 + 5 → 8 + 2 + 3 = 10 + 3. Appears in addition to 20 and in explanations of questions whose result is over 10.</p></div>
          <div><h3>Bar model</h3><p>Part–whole bars and comparison bars for word problems, including two-step problems in grade 2.</p></div>
          <div><h3>Mental math</h3><p>Compensation strategies (+9 = +10 − 1), counting up to subtract, and adding 10 or 100.</p></div>
          <div><h3>Multiplication as groups</h3><p>Equal groups, rows and columns, then the 2, 3, 4, 5, and 10 times tables.</p></div>
        </div>
      </section>
      ${GRADES.map((g) => `<section class="card ref"><h2>🗺️ Chapter map ${g.name} <span class="pill">${unitsOf(g.id).length} chapters · ${nSkills(g.id)} skills</span></h2>
        <div class="tscroll"><table class="tbl reftbl"><thead><tr><th>Metiq chapter</th><th>IXL</th><th>Singapore Math</th><th>Kurikulum Merdeka</th></tr></thead><tbody>
        ${unitsOf(g.id).map((u) => `<tr><td><b>${u.icon} ${u.id}. ${u.name}</b><small>${u.skills.length} skills</small></td><td>${u.ixl}</td><td>${u.sg}</td><td>${/Pengayaan/.test(u.km) ? `<span class="pill warn">${u.km}</span>` : u.km}</td></tr>`).join('')}
        </tbody></table></div></section>`).join('')}
      <section class="card ref"><h2>🇮🇩 Adapted for Indonesia</h2><ul>
        <li>Money uses Rupiah coins and banknotes (coins Rp100–Rp1,000, notes Rp1,000–Rp100,000).</li>
        <li>Clock: 6:30 is read as half past six. Grade 2 uses the 24-hour clock (19:00 = 7 in the evening) instead of a.m./p.m.</li>
        <li>Measurement uses metric units only (mm, cm, m, km, g, kg, mL, L). IXL's inches, feet, and pounds aren't used.</li>
        <li>In the English version, decimals use a point (2.5) and thousands use a comma (1,250). The keypad offers decimal and minus keys when needed.</li>
        <li>Names, days, months, and question settings (food stalls, markets, schools) reflect everyday life in Indonesia.</li>
      </ul></section>
      <section class="card ref"><h2>📈 SmartScore and mastery levels</h2>
        <p>Like IXL, the score rises quickly at first, then more slowly near 100, and drops after a wrong answer. Students must answer correctly and consistently to complete a skill.</p>
        <div class="legend">${levels.map(([l, c]) => `<span><i class="${c}"></i>${l}</span>`).join('')}</div>
        <p class="small muted">A student counts as needing help on a skill after at least 4 questions with accuracy below 70%, or at least 8 questions with a score still below 60.</p></section>
      <section class="card ref"><h2>🔍 Detected error patterns</h2>
        <p class="small muted">Every wrong answer is checked for a pattern. These patterns appear on the teacher dashboard and parent reports, along with practice tips.</p>
        ${Object.entries(TAGS).filter(([k]) => k !== 'konsep').map(([, t]) => `<div class="tagrow"><b>${t.label}</b><p class="small">${t.tip}</p></div>`).join('')}
      </section>`;
  }
  /* ---------- Analitik guru (mirip laporan IXL Analytics) ---------- */
  const ss = {
    get(k, d) { try { const v = sessionStorage.getItem('metiq_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { sessionStorage.setItem('metiq_' + k, JSON.stringify(v)); } catch (e) {} },
  };
  const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fdate = (ts) => { const d = new Date(ts); return `${d.getDate()} ${BLN[d.getMonth()]}`; };
  const ftime = (ts) => { const d = new Date(ts); return `${fdate(ts)}, ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`; };
  const dayStart = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const isoDay = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const RANGE_LABEL = { 7: '7 days', 30: '30 days', 90: '90 days', all: 'All' };
  function getRange() {
    const r = ss.get('range', { preset: 30 }), now = Date.now();
    if (r.preset === 'custom' && r.from && r.to) return { from: new Date(r.from + 'T00:00:00').getTime(), to: new Date(r.to + 'T23:59:59').getTime() };
    if (r.preset === 'all') return { from: 0, to: now };
    return { from: dayStart(now) - ((+r.preset || 30) - 1) * DAY, to: now };
  }
  const inRange = (a, g) => a.ts >= g.from && a.ts <= g.to;
  function rangeBar() {
    const r = ss.get('range', { preset: 30 }), g = getRange();
    return `<div class="rangebar">${[7, 30, 90, 'all'].map((p) => `<button class="${String(r.preset) === String(p) ? 'on' : ''}" data-act="range" data-p="${p}">${RANGE_LABEL[p]}</button>`).join('')}<button class="${r.preset === 'custom' ? 'on' : ''}" data-act="range" data-p="custom">Choose dates</button></div>
      ${r.preset === 'custom' ? `<div class="rangecustom"><label>From<input type="date" data-act="rfrom" value="${r.from || isoDay(Date.now() - 29 * DAY)}"></label><label>To<input type="date" data-act="rto" value="${r.to || isoDay(Date.now())}"></label></div>` : ''}
      <p class="muted small">Period: ${g.from ? fdate(g.from) : 'all data'} – ${fdate(g.to)}${cloudOn() ? ' · The server keeps the last 90 days of answer history for the dashboard.' : ''}</p>`;
  }
  /* ---------- Dasbor koordinator (admin): kondisi semua kelas dan semua guru ---------- */
  // Ringkasan satu kelas dalam periode terpilih
  function classSummary(c, g) {
    const kids = S.studentsOf(c.id);
    const per = kids.map((k) => { const ans = S.answersOf(k.id).filter((a) => inRange(a, g)), weak = weaknesses(k.id), tried = skillRows(k.id).length;
      // belum paham: minimal seperempat keterampilan yang sudah dicoba masih lemah
      return { k, ans, weak, behind: weak.length >= 2 && weak.length >= tried / 4 }; });
    const ans = per.flatMap((x) => x.ans);
    const grades = {}; ans.forEach((a) => { const sk = SKILLS[a.skill]; if (sk) grades[sk.grade] = (grades[sk.grade] || 0) + 1; });
    const grade = +(Object.entries(grades).sort((a, b) => b[1] - a[1])[0] || [0])[0] || null;
    const asg = S.assignmentsOf(c.id).filter((a) => (a.createdAt || 0) >= g.from && (a.createdAt || 0) <= g.to);
    let need = 0, done = 0;
    asg.forEach((a) => { const tk = asgKids(a, kids); need += tk.length; done += S.doneFor(a.id).filter((d) => tk.some((k) => k.id === d.sid)).length; });
    // keterampilan yang belum dipahami banyak siswa
    const sk = {};
    per.forEach((x) => x.weak.forEach((w) => { (sk[w.id] = sk[w.id] || { id: w.id, kids: [], acc: 0 }).kids.push(x.k); sk[w.id].acc += w.acc; }));
    const hard = Object.values(sk).map((h) => ({ ...h, acc: Math.round(h.acc / h.kids.length) })).sort((a, b) => b.kids.length - a.kids.length || a.acc - b.acc);
    const n = kids.length, active = per.filter((x) => x.ans.length).length, behind = per.filter((x) => x.behind).length;
    const viewed = kids.filter((k) => S.viewsOf(k.id).some((v) => v.at >= g.from && v.at <= g.to)).length;
    const fb = S.allFeedback().filter((f) => kids.some((k) => k.id === f.sid) && f.at >= g.from && f.at <= g.to);
    const s = {
      c, n, grade, active, behind, hard, viewed, fb, asg: asg.length, special: asg.filter((a) => a.students && a.students.length).length,
      answered: ans.length, acc: pct(ans.filter((a) => a.ok).length, ans.length), ms: ans.reduce((t, a) => t + Math.min(a.ms || 0, 180000), 0),
      pActive: pct(active, n), pBehind: pct(behind, n), perKid: n ? Math.round(ans.length / n) : 0, pDone: need ? pct(done, need) : null,
      last: Math.max(0, ...ans.map((a) => a.ts)), lastAsg: Math.max(0, ...S.assignmentsOf(c.id).map((a) => a.createdAt || 0)),
    };
    // status kelas: merah = perlu perhatian, kuning = perlu dipantau, hijau = baik
    s.status = !n ? 0 : s.pBehind >= 50 || s.pActive < 50 || (s.answered >= 30 && s.acc < 60) ? 3 : s.pBehind >= 25 || s.pActive < 75 || (s.answered >= 30 && s.acc < 75) ? 2 : 1;
    return s;
  }
  const STATUS = { 0: ['⚪', 'No students yet', ''], 1: ['🟢', 'Good', 'g'], 2: ['🟡', 'Keep an eye on', 'y'], 3: ['🔴', 'Needs attention', 'r'] };
  const statusPill = (st) => `<span class="accb ${STATUS[st][2]} nowrap">${STATUS[st][0]} ${STATUS[st][1]}</span>`;
  const accPill = (s) => (s.answered ? `<span class="accb ${s.acc >= 80 ? 'g' : s.acc >= 65 ? 'y' : 'r'}">${s.acc}%</span>` : '–');
  function statusWhy(s) {
    const r = [];
    if (s.pBehind >= 25) r.push(`${s.behind} of ${s.n} students haven't understood some material`);
    if (s.pActive < 75) r.push(`only ${s.active} of ${s.n} students practiced`);
    if (s.answered >= 30 && s.acc < 75) r.push(`accuracy ${s.acc}%`);
    return r.join(' · ');
  }
  const openBtn = (c, label) => `<button class="btn sm ghost" data-act="openclass" data-id="${c.id}">${label || 'Open class'}</button>`;
  // Sekolah-sekolah yang kelasnya terlihat oleh akun ini (super admin: semua; admin sekolah: sekolahnya)
  function schoolsOf(ctx) {
    const m = new Map(); ctx.classes.forEach((c) => { const id = c.schoolId || ''; if (!m.has(id)) m.set(id, { id, name: c.schoolName || 'No school', kind: c.schoolKind }); });
    return [...m.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  }

  // Paket Sekolah belum aktif: jelaskan apa yang didapat dan cara mengaktifkannya
  function schoolUpsellHTML(ctx) {
    return `<section class="card upsell"><h2>🏫 School plan isn't active yet</h2><p>${ctx.t.schoolName ? `<b>${esc(ctx.t.schoolName)}</b> isn't subscribed to the School plan${ctx.t.schoolPlanUntil ? ` (ended ${esc(String(ctx.t.schoolPlanUntil))})` : ''}.` : 'Your school isn\'t subscribed to the School plan yet.'} You can keep using your own classes for free as usual.</p>
      <ul><li>Dashboards and reports across classes and teachers</li><li>School admins manage teachers</li><li>Starting assessment to place each student at the right level</li><li>Training and mentoring</li></ul>
      <div class="row-btn left"><a class="btn" href="#/harga">See plans and request a quote</a></div></section>`;
  }
  // Admin sekolah: daftar guru di sekolahnya, tambah lewat email (guru mendaftar gratis dulu), lepas dari sekolah
  async function loadSchoolTeachers() {
    const box = document.getElementById('sg-box'); if (!box) return;
    if (!cloudOn() || session.get().demo) { box.innerHTML = emptyCard('Available in server mode', 'In demo mode, teacher data is sample data.'); return; }
    try {
      const list = await Cloud.rpc('school_teachers', { p_token: session.get().token });
      if (!document.getElementById('sg-box')) return;
      box.innerHTML = `<section class="card"><h2>➕ Add a teacher to the school</h2><p class="small muted">Teachers first sign up free on Metiq (I'm a teacher → Sign up free), then enter their email here. Their classes and students join the school dashboard.</p>
          <form data-form="sgadd" class="form inline"><input name="email" type="email" required placeholder="teacher's email" aria-label="Teacher's email"><button class="btn">Add</button></form></section>
        <section class="card"><h2>Teachers in this school <span class="pill">${list.length}</span></h2>${list.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>Teacher</th><th>Email</th><th>Grade</th><th>Student</th><th></th></tr></thead><tbody>
          ${list.map((g) => `<tr><td><b>${esc(g.name)}</b>${g.isSchoolAdmin ? ' <span class="pill">School admin</span>' : ''}</td><td>${esc(g.email)}</td><td>${g.classes}</td><td>${g.students}</td><td class="r">${g.isSchoolAdmin ? '' : `<button class="link small danger" data-act="sgdel" data-id="${g.id}" data-n="${esc(g.name)}">Remove from school</button>`}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No teachers yet.</p>'}</section>`;
    } catch (e) {
      box.innerHTML = e.status === 404 ? emptyCard('Needs SQL 020 to be run', 'Run supabase/020_paket_sekolah.sql in the Supabase SQL Editor.') : emptyCard('Can\'t open yet', e.status ? esc(e.message) : 'Can\'t connect to the server');
    }
  }
  function schoolHTML(ctxAll, sub, research) {
    if (cloudOn() && !session.get().demo && !ctxAll.t.isAdmin && ctxAll.t.schoolActive === false) return schoolUpsellHTML(ctxAll);
    const list = schoolsOf(ctxAll), want = ss.get('schoolSel', ctxAll.t.schoolId || (list[0] || {}).id || ''), sel = list.find((x) => x.id === want) || list[0] || { id: '' };
    const ctx = Object.assign({}, ctxAll, { classes: ctxAll.classes.filter((c) => (c.schoolId || '') === sel.id) });
    const picker = list.length > 1 ? `<label class="schoolpick">School <select data-act="schoolsel">${list.map((x) => `<option value="${x.id}" ${x.id === sel.id ? 'selected' : ''}>${esc(x.name)}${x.kind === 'homeschool' ? ' (homeschool)' : ''}</option>`).join('')}</select></label>` : '';
    return picker + schoolBody(ctx, sub, research);
  }
  function schoolBody(ctx, sub, research) {
    const subs = research ? RESEARCH_SCHOOL : [['kelas', '🏫 Class status'], ['materi', '🧗 Hard topics'], ['kelolaguru', '🧑‍🏫 Manage teachers']];
    if (!subs.some(([k]) => k === sub)) sub = subs[0][0];
    // Dasbor sekolah selalu 30 hari terakhir supaya tidak perlu memilih periode; pemilih tanggal hanya untuk riset
    const g = research ? getRange() : { from: dayStart(Date.now()) - 29 * DAY, to: Date.now() };
    const all = ctx.classes.map((c) => classSummary(c, g)).sort((a, b) => b.status - a.status || b.pBehind - a.pBehind);
    const sum = (f) => all.reduce((t, s) => t + s[f], 0);
    const kidsN = sum('n'), answered = all.reduce((t, s) => t + s.answered, 0), correct = all.reduce((t, s) => t + Math.round(s.answered * s.acc / 100), 0);
    const teachers = [...new Set(all.map((s) => s.c.teacherId))];
    let body;
    if (sub === 'kelolaguru') body = `<div id="sg-box">${loadingHTML}</div>`;
    else if (sub === 'kelas') {
      const line = (s) => (s.n ? `${s.active} of ${s.n} students practiced${s.answered ? `, ${s.acc}% correct` : ''}${s.behind ? `, ${s.behind} need help` : ''}` : 'No students yet');
      body = `<section class="card"><h2>Status of each class</h2><p class="muted small">Last 30 days. Classes needing the most attention are on top. Tap a class to open it.</p>
        ${all.map((s) => `<div class="sclass ${STATUS[s.status][2]}" data-act="openclass" data-id="${s.c.id}" role="button" tabindex="0"><span class="grow"><b>${esc(s.c.name)}</b><small>${esc(s.c.teacherName || '')}</small><span class="sline">${line(s)}</span></span>${statusPill(s.status)}</div>`).join('') || '<p class="muted">No classes yet.</p>'}</section>`;
    } else if (sub === 'materi') {
      // Gabungan seluruh sekolah per bab, lalu rincian per kelas
      const units = {};
      all.forEach((s) => s.hard.filter((h) => h.kids.length >= 2).forEach((h) => { const u = SKILLS[h.id].unit; const x = units[u] = units[u] || { u, kids: new Set(), classes: new Set() }; h.kids.forEach((k) => x.kids.add(k.id)); x.classes.add(s.c.id); }));
      const ul = Object.values(units).sort((a, b) => b.kids.size - a.kids.size).slice(0, 8);
      body = `<section class="card"><h2>Chapters least understood (whole school)</h2>${ul.length ? ul.map((x) => { const u = UNITS.find((y) => y.id === x.u); return `<div class="lrow"><span class="uicon">${u.icon}</span><span class="grow"><b>${gname(u.grade)} · ${u.name}</b><small>${x.kids.size} students in ${x.classes.size} classes</small></span><a class="btn sm ghost" href="#/pelajaran/${u.id}">📖 Lesson</a></div>`; }).join('') : '<p class="muted">No material stands out as hard. 👍</p>'}</section>
        ${all.filter((s) => s.n).map((s) => `<section class="card"><div class="lrow"><span class="grow"><b>${esc(s.c.name)}</b> · ${esc(s.c.teacherName || '')}<small>${s.behind} of ${s.n} students haven't understood part of the material</small></span>${statusPill(s.status)}</div>
          ${s.hard.length ? s.hard.slice(0, 5).map((h) => `<div class="hardrow"><div class="lrow"><span class="grow"><b>${SKILLS[h.id].code} ${SKILLS[h.id].name}</b><small>${gname(SKILLS[h.id].grade)} · average accuracy ${h.acc}%</small></span><span class="pill">${h.kids.length}/${s.n} students</span></div><p class="small muted">${h.kids.map((k) => esc(k.name)).join(', ')}</p></div>`).join('') : '<p class="muted small">No material left behind.</p>'}
          <div class="row-btn left">${openBtn(s.c)}</div></section>`).join('')}`;
    } else if (sub === 'coba') {
      body = `<div id="trial-box">${loadingHTML}</div>`;
    } else if (sub === 'grafik') {
      body = chartsHTML(all);
    } else if (sub === 'asesmen') {
      body = prepostHTML(all);
    } else if (sub === 'ulasan') {
      body = reviewsHTML(all, g);
    } else if (sub === 'data') {
      body = researchHTML(all);
    } else {
      const rows = teachers.map((tid) => {
        const cs = all.filter((s) => s.c.teacherId === tid), n = cs.reduce((t, s) => t + s.n, 0);
        const ans = cs.reduce((t, s) => t + s.answered, 0), ok = cs.reduce((t, s) => t + Math.round(s.answered * s.acc / 100), 0);
        const withDone = cs.filter((s) => s.pDone !== null);
        return { name: cs[0].c.teacherName || 'Teacher', cs, n, active: cs.reduce((t, s) => t + s.active, 0), behind: cs.reduce((t, s) => t + s.behind, 0), ans, acc: pct(ok, ans), asg: cs.reduce((t, s) => t + s.asg, 0), special: cs.reduce((t, s) => t + s.special, 0), pDone: withDone.length ? Math.round(withDone.reduce((t, s) => t + s.pDone, 0) / withDone.length) : null, lastAsg: Math.max(...cs.map((s) => s.lastAsg)) };
      });
      body = `<section class="card"><h2>Indicators by teacher</h2>
        <p class="small infonote">ℹ️ These numbers describe <b>student activity and understanding</b> in each teacher's class, and how actively the teacher assigns tasks and follows up with students. Use them for discussion and mentoring, not as the only basis for judging performance.</p>
        <div class="tscroll"><table class="tbl"><thead><tr><th>Teacher</th><th>Grade</th><th>Active students</th><th>Accuracy</th><th>Not understood</th><th>Tasks assigned</th><th>Special tasks</th><th>Tasks finished</th><th>Latest task</th></tr></thead><tbody>
        ${rows.map((r) => `<tr><td><b>${esc(r.name)}</b></td><td class="wrap">${r.cs.map((s) => esc(s.c.name)).join(', ')}</td><td>${r.active}/${r.n} <small class="muted">(${pct(r.active, r.n)}%)</small></td><td>${r.ans ? `<span class="accb ${r.acc >= 80 ? 'g' : r.acc >= 65 ? 'y' : 'r'}">${r.acc}%</span>` : '–'}</td><td>${r.behind}/${r.n}</td><td>${r.asg}</td><td>${r.special}</td><td>${r.pDone === null ? '–' : r.pDone + '%'}</td><td>${r.lastAsg ? ago(r.lastAsg) : 'never'}</td></tr>`).join('')}
        </tbody></table></div></section>
        <section class="card"><h2>How to read this</h2><ul class="small">
          <li><b>Active students</b>: students who practiced at least once in this period.</li>
          <li><b>Not understood</b>: students for whom at least a quarter of the skills they've tried are still weak.</li>
          <li><b>Tasks assigned / special tasks</b>: tasks the teacher made in this period; special tasks show follow-up for specific students.</li>
          <li><b>Tasks finished</b>: average percentage of students finishing tasks.</li>
          <li>Many "not understood" students but no special tasks can be a topic to discuss with the teacher.</li></ul></section>`;
    }
    return `<div class="kpis"><div class="kpi"><small>Classes · teachers</small><b>${all.length}<span> · ${teachers.length}</span></b></div><div class="kpi"><small>Students practicing</small><b>${sum('active')}<span>/${kidsN}</span></b></div><div class="kpi"><small>Correct answers</small><b>${pct(correct, answered)}%</b></div><div class="kpi"><small>Classes needing attention</small><b>${all.filter((s) => s.status === 3).length}</b></div></div>
      ${research ? rangeBar() : ''}
      ${research ? '' : `<nav class="subtabs">${subs.map(([k, l]) => `<a href="#/guru/sekolah/${k}" class="${k === sub ? 'on' : ''}">${l}</a>`).join('')}</nav>`}
      ${body}`;
  }

  /* ---------- Ulasan tugas (bintang dan komentar dari siswa dan orang tua) ---------- */
  const fbAvg = (list) => (list.reduce((t, f) => t + f.rating, 0) / list.length).toFixed(1);
  const stars = (n) => `<span class="stars" aria-label="${n} stars">${'★'.repeat(n)}<i>${'★'.repeat(5 - n)}</i></span>`;
  const fbSummary = (list) => (list.length ? `<p class="small">⭐ <b>${fbAvg(list)}</b> from ${list.length} reviews${list.some((f) => f.comment) ? ` · <span class="muted">“${esc(list.filter((f) => f.comment).pop().comment)}”</span>` : ''}</p>` : '');
  function feedbackHTML(a, sid, by) {
    if (!S.isDone(a.id, sid)) return '';
    const f = S.myFeedback(a.id, sid, by), key = a.id + ':' + sid + ':' + by;
    if (f && ss.get('fbedit', '') !== key) return `<div class="fbdone small">${by === 'siswa' ? 'Your review' : 'Your review'}: ${stars(f.rating)}${f.comment ? ` “${esc(f.comment)}”` : ''} <button class="link" data-act="fbedit" data-k="${key}">Edit</button></div>`;
    return `<form class="fbform" data-form="fb" data-a="${a.id}" data-s="${sid}" data-by="${by}"><p class="small"><b>⭐ ${by === 'siswa' ? 'What did you think of this task?' : 'What do you think of this task?'}</b></p>
      <div class="starpick" role="radiogroup" aria-label="Choose stars">${[5, 4, 3, 2, 1].map((n) => `<label title="${n} stars"><input type="radio" name="rating" value="${n}" ${f && f.rating === n ? 'checked' : ''}><span>★</span></label>`).join('')}</div>
      <textarea name="comment" maxlength="500" rows="2" placeholder="${by === 'siswa' ? 'Tell us what you think (optional)' : 'Comment for the teacher (optional)'}">${f && f.comment ? esc(f.comment) : ''}</textarea>
      <button class="btn sm">Send review</button></form>`;
  }
  function reviewsHTML(all, g) {
    const list = all.flatMap((s) => s.fb.map((f) => ({ ...f, s, k: S.student(f.sid), a: S.db.assignments.find((x) => x.id === f.aid) }))).filter((f) => f.k).sort((a, b) => b.at - a.at);
    if (!list.length) return emptyCard('No reviews yet', 'Reviews appear after students or parents finish a task and give stars and comments.');
    const by = (r) => list.filter((f) => f.by === r);
    const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: list.filter((f) => f.rating === n).length }));
    const mx = Math.max(...dist.map((d) => d.c));
    return `<div class="grid2">
      <section class="card"><h2>Review summary</h2><div class="fbbig"><b>${fbAvg(list)}</b>${stars(Math.round(list.reduce((t, f) => t + f.rating, 0) / list.length))}<small>${list.length} reviews · students ${by('siswa').length ? `⭐ ${fbAvg(by('siswa'))}` : '–'} · parents ${by('ortu').length ? `⭐ ${fbAvg(by('ortu'))}` : '–'}</small></div>
        ${dist.map((d) => `<div class="fbbar"><span>${d.n}★</span><i><b style="width:${mx ? Math.round((d.c / mx) * 100) : 0}%"></b></i><small>${d.c}</small></div>`).join('')}</section>
      <section class="card"><h2>By class</h2>${all.filter((s) => s.fb.length).map((s) => `<div class="lrow"><span class="grow"><b>${esc(s.c.name)}</b><small>${esc(s.c.teacherName || '')} · ${s.fb.length} reviews</small></span>⭐ <b>${fbAvg(s.fb)}</b></div>`).join('')}</section></div>
      <section class="card"><h2>Latest comments</h2>${list.slice(0, 40).map((f) => `<div class="fbitem"><div class="lrow"><span class="av sm">${avHTML(f.k.avatar)}</span><span class="grow"><b>${f.by === 'ortu' ? `Parent of ${esc(f.k.name)}` : esc(f.k.name)}</b><small>${esc(f.s.c.name)} · ${esc((f.a && f.a.note) || 'Tasks')} · ${ftime(f.at)}</small></span>${stars(f.rating)}</div>${f.comment ? `<p>“${esc(f.comment)}”</p>` : ''}</div>`).join('')}</section>`;
  }

  /* ---------- Orang tua membuka laporan (untuk data keterlibatan orang tua) ---------- */
  function logParentView(sid) {
    const ses = session.get();
    if (!cloudOn()) return S.logView(sid, ses.ptoken ? 'akun' : 'kode');
    const key = 'metiq_pv_' + sid;
    if (Date.now() - (+sessionStorage.getItem(key) || 0) < 10 * 60000) return;
    sessionStorage.setItem(key, String(Date.now()));
    Cloud.rpc('log_report_view', ses.ptoken ? { p_student_id: sid, p_token: ses.ptoken } : { p_student_id: sid, p_pcode: ses.pcode }).catch(() => {});
  }

  /* ---------- Halaman siswa (guru): NISN, keterlibatan orang tua, laporan ke BBO Digital ---------- */
  const BBO_LABEL = { diterima: '✅ Accepted by BBO', dikirim: '⏳ Sending', gagal: '⚠️ Failed to send', tanpa_nisn: 'Not sent (no NISN yet)' };
  function studentDataHTML(k, research) {
    const v = S.viewsOf(k.id).slice().sort((a, b) => a.at - b.at), v30 = v.filter((x) => x.at > Date.now() - 30 * DAY).length;
    const done = S.assignmentsFor(k.id).map((a) => ({ a, d: S.db.done.find((x) => x.aid === a.id && x.sid === k.id) })).filter((x) => x.d).sort((a, b) => b.d.at - a.d.at);
    return `<section class="card"><h2>🪪 Student data</h2>
      <form class="form nisnform" data-form="nisn" data-s="${k.id}"><label>NISN <small class="muted">(10 digits, for sending task reports to BBO Digital)</small><input name="nisn" inputmode="numeric" maxlength="10" pattern="[0-9]{10}" value="${esc(k.nisn || '')}" placeholder="e.g. 0123456789"></label><button class="btn sm">Save NISN</button></form>
      ${research ? `<p class="small">👪 Parents opened the report <b>${v30}×</b> in the last 30 days${v.length ? ` · last ${ago(v[v.length - 1].at)}` : ' · never'}.</p>` : ''}
      ${done.length ? `<h3 class="sub">Finished tasks and reports to BBO Digital</h3>${done.map(({ a, d }) => `<div class="lrow"><span class="grow"><b>${esc(a.note || 'Tasks')}</b><small>${ftime(d.at)} · ${d.by === 'ortu' ? 'reported by parent' : 'finished by student'}</small></span><small class="muted">${d.bbo ? BBO_LABEL[d.bbo] || d.bbo : cloudOn() ? 'Not recorded yet' : 'Sample mode'}</small></div>`).join('')}` : ''}
    </section>`;
  }

  /* ---------- Ekspor data penelitian (CSV, nama disamarkan) ---------- */
  // Kode tetap selama daftar kelas dan siswa tidak berubah; unduh kunci kode bersamaan dengan data
  function researchCodes(all) {
    const classes = all.map((s) => s.c).sort((a, b) => a.name.localeCompare(b.name, 'en'));
    const cc = {}, tc = {}, sc = {};
    classes.forEach((c, i) => { cc[c.id] = 'K' + String(i + 1).padStart(2, '0'); });
    [...new Set(classes.map((c) => c.teacherId))].forEach((t, i) => { tc[t] = 'G' + String(i + 1).padStart(2, '0'); });
    let n = 0;
    classes.forEach((c) => S.studentsOf(c.id).slice().sort((a, b) => a.name.localeCompare(b.name, 'en')).forEach((k) => { sc[k.id] = 'S' + String(++n).padStart(3, '0'); }));
    return { classes, cc, tc, sc };
  }
  function downloadCSV(name, rows) {
    const cell = (v) => { const x = v === null || v === undefined ? '' : String(v); return /[";\r\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
    // titik koma dan BOM agar langsung terbuka rapi di Excel berbahasa Indonesia
    const url = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const dec = (x) => String(Math.round(x * 10) / 10);
  const hhmm = (ts) => { const d = new Date(ts); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  function exportResearch(type) {
    const ctx = teacherCtx(); if (!ctx || !canResearch(ctx)) return;
    const g = getRange(), all = ctx.classes.map((c) => classSummary(c, g)), { classes, cc, tc, sc } = researchCodes(all);
    const kids = classes.flatMap((c) => S.studentsOf(c.id).map((k) => ({ k, c })));
    const tag = `${isoDay(g.from || Date.now())}_${isoDay(g.to)}`;
    const avgOf = (l) => (l.length ? dec(l.reduce((t, f) => t + f.rating, 0) / l.length) : '');
    let rows;
    if (type === 'siswa') {
      rows = [['kode_siswa', 'kode_kelas', 'kode_guru', 'materi_kelas', 'soal_dijawab', 'jawaban_benar', 'ketepatan_persen', 'menit_belajar', 'hari_aktif', 'keterampilan_dicoba', 'keterampilan_mahir', 'keterampilan_tuntas', 'rata_smartscore', 'hadiah', 'tugas_diberikan', 'tugas_selesai', 'ortu_buka_laporan', 'ulasan_siswa_rata', 'ulasan_ortu_rata', 'pertama_berlatih', 'terakhir_berlatih']];
      kids.forEach(({ k, c }) => {
        const ans = S.answersOf(k.id).filter((a) => inRange(a, g)), sk = skillRows(k.id), ok = ans.filter((a) => a.ok).length;
        const gr = {}; ans.forEach((a) => { const x = SKILLS[a.skill]; if (x) gr[x.grade] = (gr[x.grade] || 0) + 1; });
        const asg = S.assignmentsFor(k.id), fb = S.allFeedback().filter((f) => f.sid === k.id && f.at >= g.from && f.at <= g.to);
        rows.push([sc[k.id], cc[c.id], tc[c.teacherId], (Object.entries(gr).sort((a, b) => b[1] - a[1])[0] || [''])[0], ans.length, ok, ans.length ? pct(ok, ans.length) : '',
          dec(ans.reduce((t, a) => t + Math.min(a.ms || 0, 180000), 0) / 60000), new Set(ans.map((a) => isoDay(a.ts))).size, sk.length,
          sk.filter((r) => r.score >= 80).length, sk.filter((r) => r.score >= 100).length, sk.length ? dec(sk.reduce((t, r) => t + r.score, 0) / sk.length) : '',
          GRADES.reduce((t, x) => t + prizeBoard(k.id, x.id).open, 0), asg.length, asg.filter((a) => S.isDone(a.id, k.id)).length,
          S.viewsOf(k.id).filter((v) => v.at >= g.from && v.at <= g.to).length, avgOf(fb.filter((f) => f.by === 'siswa')), avgOf(fb.filter((f) => f.by === 'ortu')),
          ans.length ? isoDay(Math.min(...ans.map((a) => a.ts))) : '', ans.length ? isoDay(Math.max(...ans.map((a) => a.ts))) : '']);
      });
    } else if (type === 'jawaban') {
      rows = [['kode_siswa', 'kode_kelas', 'kode_guru', 'tanggal', 'jam', 'materi_kelas', 'bab', 'kode_keterampilan', 'keterampilan', 'benar', 'detik', 'pola_kesalahan']];
      kids.forEach(({ k, c }) => S.answersOf(k.id).filter((a) => inRange(a, g)).sort((a, b) => a.ts - b.ts).forEach((a) => {
        const x = SKILLS[a.skill] || {};
        rows.push([sc[k.id], cc[c.id], tc[c.teacherId], isoDay(a.ts), hhmm(a.ts), x.grade || '', x.unit || '', x.code || a.skill, x.name || '', a.ok ? 1 : 0, Math.round((a.ms || 0) / 1000), a.ok ? '' : a.tag || '']);
      }));
    } else if (type === 'tugas') {
      const ac = {}; let n = 0;
      rows = [['kode_siswa', 'kode_kelas', 'kode_guru', 'kode_tugas', 'tugas_dibuat', 'tugas_khusus', 'jumlah_keterampilan', 'selesai', 'selesai_pada', 'diselesaikan_oleh', 'bintang_siswa', 'komentar_siswa', 'bintang_ortu', 'komentar_ortu']];
      classes.forEach((c) => S.assignmentsOf(c.id).filter((a) => (a.createdAt || 0) >= g.from && (a.createdAt || 0) <= g.to).forEach((a) => {
        ac[a.id] = 'T' + String(++n).padStart(3, '0');
        asgKids(a, S.studentsOf(c.id)).forEach((k) => {
          const d = S.db.done.find((x) => x.aid === a.id && x.sid === k.id), fs = S.myFeedback(a.id, k.id, 'siswa'), fo = S.myFeedback(a.id, k.id, 'ortu');
          rows.push([sc[k.id], cc[c.id], tc[c.teacherId], ac[a.id], isoDay(a.createdAt || 0), a.students && a.students.length ? 1 : 0, a.skills.length, d ? 1 : 0, d ? isoDay(d.at) : '', d ? d.by : '', fs ? fs.rating : '', fs ? fs.comment || '' : '', fo ? fo.rating : '', fo ? fo.comment || '' : '']);
        });
      }));
    } else if (type === 'ortu') {
      rows = [['kode_siswa', 'kode_kelas', 'kode_guru', 'tanggal', 'jam', 'cara_masuk']];
      kids.forEach(({ k, c }) => S.viewsOf(k.id).filter((v) => v.at >= g.from && v.at <= g.to).sort((a, b) => a.at - b.at).forEach((v) => rows.push([sc[k.id], cc[c.id], tc[c.teacherId], isoDay(v.at), hhmm(v.at), v.via === 'akun' ? 'parent account' : 'parent code'])));
    } else if (type === 'asesmen') {
      rows = [['kode_siswa', 'kode_kelas', 'kode_guru', 'usia_awal', 'kelas_sesuai_usia_awal', 'level_awal', 'benar_awal', 'soal_awal', 'cepat_awal', 'menit_awal', 'tanggal_awal', 'usia_akhir', 'kelas_sesuai_usia_akhir', 'level_akhir', 'benar_akhir', 'soal_akhir', 'cepat_akhir', 'menit_akhir', 'tanggal_akhir', 'kenaikan_level', 'selisih_usia_awal', 'selisih_usia_akhir']];
      const part = (d) => (d ? [d.age, ageGradeOf(d), d.level, d.items.filter((x) => x.ok).length, d.items.length, d.items.filter((x) => x.fast).length, dec(d.ms / 60000), isoDay(d.at)] : ['', '', '', '', '', '', '', '']);
      kids.forEach(({ k, c }) => { const a = S.diagOf(k.id), b = S.diagOf(k.id, 'b'); if (!a && !b) return; rows.push([sc[k.id], cc[c.id], tc[c.teacherId], ...part(a), ...part(b), a && b ? lvGap(b.level, a.level) : '', a ? lvGap(ageGradeOf(a), a.level) : '', b ? lvGap(ageGradeOf(b), b.level) : '']); });
    } else if (type === 'kunci') {
      rows = [['kode', 'jenis', 'nama', 'kelas', 'nisn']];
      [...new Set(classes.map((c) => c.teacherId))].forEach((t) => rows.push([tc[t], 'guru', (classes.find((c) => c.teacherId === t) || {}).teacherName || '', '', '']));
      classes.forEach((c) => rows.push([cc[c.id], 'kelas', c.name, '', '']));
      kids.forEach(({ k, c }) => rows.push([sc[k.id], 'siswa', k.name, c.name, k.nisn || '']));
    } else return;
    downloadCSV(`metiq_${type}_${tag}.csv`, rows);
    toast(`File ${type} downloaded (${rows.length - 1} rows)`);
  }
  function researchHTML(all) {
    const files = [
      ['siswa', '👧 Summary per student', 'One row per student: questions, accuracy, learning time, active days, proficient/complete skills, tasks, reports opened by parents, average review. Suitable for combining with pretest–posttest scores.'],
      ['jawaban', '✏️ All answers', 'One row per answer: date, time, skill, right/wrong, time to answer, error pattern. For analyzing the learning process.'],
      ['tugas', '📌 Tasks and reviews', 'One row per student per task: finished or not, by whom, stars and comments from students/parents.'],
      ['ortu', '👪 Parent involvement', 'One row each time a parent opens a child\'s report.'],
      ['asesmen', '🧭 Pre- and post-assessment', 'One row per student: age, age-appropriate grade, level, correct answers, dates of the pretest and posttest, level gain, and gap from the age-appropriate grade.'],
    ];
    return `<section class="card"><h2>📥 Data for research</h2>
      <p class="small">Data follows the <b>period</b> chosen above. Student, class, and teacher names are replaced with codes (S001, K01, G01), so it's safe to use in a thesis. The CSV format (semicolon-separated) opens directly in Excel or imports into SPSS.</p>
      ${files.map(([t, title, desc]) => `<div class="lrow"><span class="grow"><b>${title}</b><small>${desc}</small></span><button class="btn sm" data-act="export" data-t="${t}">Download</button></div>`).join('')}</section>
      <section class="card cwarn r"><h2>🔐 Code key (confidential)</h2><p class="small">A list linking codes to real names and NISN, for matching Metiq data with students' test scores. <b>Don't attach it to a thesis</b> and keep it somewhere safe. Download it together with the other data, because codes change if the student list changes.</p>
        <div class="row-btn left"><button class="btn sm ghost" data-act="export" data-t="kunci">Download code key</button></div></section>
      <section class="card"><h2>Research notes</h2><ul class="small">
        <li>The server keeps detailed answer history for the <b>last 90 days</b> for the dashboard. Download data regularly (for example monthly) so nothing is missed.</li>
        <li>Proficient/complete skills and rewards are calculated from the permanently stored SmartScore.</li>
        <li>To measure impact, use a separate pretest–posttest (not Metiq questions), then combine it with the "Summary per student" file using the student codes.</li>
        <li>Review comments may contain names. Check before quoting them in a thesis.</li></ul></section>`;
  }

  /* ---------- Asesmen awal (sekali di awal): usia, lalu soal adaptif dari keterampilan kunci tiap kelas ---------- */
  // Keterampilan kunci per kelas ada di S.DIAG: lima per kelas SD–SMA, tiga sampai lima cerita beraudio untuk TK.
  // Batas "cepat" TK sudah termasuk waktu mendengarkan rekaman cerita.
  const FAST = { '-2': 20000, '-1': 22000, 1: 8000, 2: 10000, 3: 12000, 4: 15000, 5: 18000, 6: 20000, 7: 25000, 8: 30000, 9: 35000, 10: 40000, 11: 40000, 12: 45000, 13: 50000 }, GUESS = 3000;
  let D = null;
  const diagKid = () => { const ses = session.get(); return ses.role === 'siswa' && S.student(ses.id); };
  const isResearchNow = () => { const x = session.get(), t = x.role === 'guru' && S.teacher(x.id); return !!(t && t.isAdmin && !x.demo); };
  const isAdminNow = () => { const x = session.get(), t = x.role === 'guru' && S.teacher(x.id); return !!(t && (t.isAdmin || t.isSchoolAdmin)); };
  const DMODE = { a: { name: 'Pre-assessment', start: '#/asesmen', result: '#/asesmen/hasil' }, b: { name: 'Post-assessment', start: '#/asesmen/akhir', result: '#/asesmen/akhir/hasil' } };
  // Urutan level: TK A (−2), TK B (−1), Kelas 1–8, lalu Aljabar 1 (9), Geometri, Aljabar 2, Prakalkulus, Kalkulus (13).
  // lvPos merapatkan urutan (TK A = −1, TK B = 0, Kelas n = n) agar selisih dan rata-rata level benar; untuk Kelas 1–6 nilainya = nomor kelas.
  const lvPos = (g) => (g < 0 ? g + 1 : g), lvAt = (p) => (p <= 0 ? p - 1 : p), lvGap = (a, b) => lvPos(a) - lvPos(b);
  const lvStep = (g, k) => { const x = lvAt(lvPos(g) + k); return S.DIAG[x] ? x : null; };
  // Kelas sesuai usia, atau jenjang yang dipilih siswa SMP/SMA (d.cls). Data lama (usia 6–12) hasilnya tetap: 6–7 = Kelas 1, …, 12 = Kelas 6.
  const ageGradeOf = (d) => { if (d && typeof d === 'object') { if (d.cls) return d.cls; d = d.age; } return d <= 4 ? -2 : d === 5 ? -1 : Math.max(1, Math.min(13, d - 6)); };
  // Nama level untuk rata-rata (boleh pecahan): Kelas 1 ke atas tetap "Kelas 2,5"; di bawahnya dibulatkan ke TK terdekat
  const lvLabel = (p) => (Number.isInteger(p) ? gname(lvAt(p)) : p >= 1 ? 'Grade ' + dec(p) : '≈ ' + gname(lvAt(Math.round(p))));
  // Asesmen awal dibuka seperti aplikasi belajar: sapaan Meti, usia, target harian, lalu soal satu per satu.
  let OB = null;
  const GOALS = [[5, 'Relaxed', '🌱'], [10, 'Regular', '🚶'], [15, 'Serious', '🚀'], [20, 'Amazing', '🏆']];
  function viewDiag(pf = 'a') {
    const st = diagKid(); if (!st) return go('#/siswa');
    if (pf === 'a' && S.onboarded(st.id)) return go('#/belajar');
    if (pf === 'b' && !S.postPending(st.id)) return go(S.diagOf(st.id, 'b') ? DMODE.b.result : '#/belajar');
    if (!OB || OB.pf !== pf || OB.sid !== st.id) OB = { pf, sid: st.id, step: 0, age: null, cls: null, goal: goalOf(st.id), steps: pf === 'a' ? ['hello', 'count', 'age', 'goal', 'gain', 'ready'] : ['hello', 'age', 'ready'] };
    obRender();
  }
  function obRender() {
    const st = S.student(OB.sid), key = OB.steps[OB.step], pct0 = Math.round(((OB.step + 1) / (OB.steps.length + 1)) * 100);
    const bigSay = (pose, html, size) => `<div class="mq-big-say"><div class="mq-bubble"><p>${html}</p></div>${MQ.svg(pose, { size: size || 170 })}</div>`;
    const rowSay = (pose, html) => `<div class="mq-say" style="align-self:stretch">${MQ.svg(pose, { size: 104, enter: false })}<div class="mq-bubble"><p>${html}</p></div></div>`;
    const next = (label, on = true, cls = '') => `<button class="mq-btn ${cls}" id="obbtn" data-act="obnext" ${on ? '' : 'disabled'}>${label}</button>`;
    let inner, foot;
    if (key === 'hello') {
      inner = bigSay('hello', OB.pf === 'a' ? `Hi, ${esc(st.name)}!<br>I'm <b class="hl">Meti</b>!` : `Hi again, ${esc(st.name)}!<br>Let's see your progress!`, 190);
      foot = next('Continue') + (OB.pf === 'a' ? '<button class="mq-link" data-act="dskip">Skip for now</button>' : '');
    } else if (key === 'count') {
      inner = bigSay('cheer', 'Just <b class="hl">a few short questions</b> before we start learning!<span class="sub">This isn\'t a test, so relax.</span>', 180);
      foot = next('Continue');
    } else if (key === 'age') {
      inner = `${rowSay('ask', 'How <b class="hl">old are you</b>?')}<div class="mq-ages many">${[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((a) => `<button class="mq-age ${OB.age === a ? 'sel' : ''}" data-act="obage" data-a="${a}"><b>${a}${a === 17 ? '+' : ''}</b><small>years old</small></button>`).join('')}</div>`;
      foot = next('Continue', OB.age !== null);
    } else if (key === 'cls') {
      // usia saja tidak membedakan Aljabar 1, Geometri, Aljabar 2, Prakalkulus, dan Kalkulus
      inner = `${rowSay('ask', '<b class="hl">What material</b> are you learning at school now?')}<div class="mq-choices">${GRADES.filter((x) => x.id >= 7).map((x) => `<button class="mq-choice ${OB.cls === x.id ? 'sel' : ''}" data-act="obcls" data-g="${x.id}"><span class="em">${x.stage === 'SMA' ? '🎓' : '📘'}</span><span class="grow">${x.name}</span><span class="tag">${x.stage || ''}</span></button>`).join('')}</div>`;
      foot = next('Continue', OB.cls !== null);
    } else if (key === 'goal') {
      inner = `${rowSay('ask', 'How many minutes do you want to learn <b class="hl">each day</b>?')}<div class="mq-choices">${GOALS.map(([m, l, e]) => `<button class="mq-choice ${OB.goal === m ? 'sel' : ''}" data-act="obgoal" data-m="${m}"><span class="em">${e}</span><span class="grow">${m} minutes / day</span><span class="tag">${l}</span></button>`).join('')}</div>`;
      foot = next('Continue');
    } else if (key === 'gain') {
      inner = `${rowSay('happy', 'Here\'s what you can <b class="hl">achieve</b>!')}<div class="mq-gain"><div><span class="em">🧮</span><span><b>Great at math</b><small>Questions at your level</small></span></div><div><span class="em">🎬</span><span><b>Understand how</b><small>Animated lessons</small></span></div><div><span class="em">🔥</span><span><b>Learn every day</b><small>Collect rewards</small></span></div></div>`;
      foot = next('Continue');
    } else {
      inner = bigSay('ask', OB.pf === 'a' ? 'Ready? <b class="hl">Let\'s start!</b><span class="sub">If you don\'t know, just guess.</span>' : 'Ready? <b class="hl">Answer as best you can!</b>', 180);
      foot = next('Start', true, 'pulse');
    }
    app.innerHTML = `<div class="mq-top"><button class="mq-ico" data-act="obback" aria-label="Back">${IC.back}</button><div class="mq-prog"><i style="width:${pct0}%"></i></div><span class="mq-ico"></span></div>
      <main class="mq-screen"><div class="mq-ob-body">${inner}</div></main><div class="mq-foot"><div class="mq-foot-in">${foot}</div></div>`;
  }
  function obNext() {
    // usia 13 ke atas: tanyakan juga jenjang yang sedang ditempuh
    if (OB.steps[OB.step] === 'age') {
      const hs = OB.age >= 13, at = OB.steps.indexOf('cls');
      if (hs && at < 0) OB.steps.splice(OB.step + 1, 0, 'cls');
      if (!hs && at >= 0) OB.steps.splice(at, 1);
      OB.cls = hs ? OB.cls || ageGradeOf(OB.age) : null;
    }
    if (OB.step >= OB.steps.length - 1) return diagStart(OB.age || ageDefault(), OB.pf, OB.cls);
    OB.step++; obRender();
  }
  const ageDefault = () => 8;
  function diagStart(age, pf, cls) {
    const st = diagKid(); if (!st) return;
    // titik mulai sama untuk asesmen awal dan akhir: satu level di bawah kelas sesuai usia (6–7 tahun = kelas 1).
    // Rentang level: TK hanya TK A–TK B (anak TK belum mengenal satuan, puluhan, ratusan), SD tetap Kelas 1–6
    // (sama seperti data penelitian lama), SMP/SMA Kelas 1 sampai Kalkulus.
    const ag = ageGradeOf({ age, cls }), lo = ag < 1 ? -2 : 1, hi = ag < 1 ? -1 : ag <= 6 ? 6 : 13;
    D = { sid: st.id, pf: pf || 'a', age, cls: cls || null, lo, hi, bands: {}, n: 0, t0: Date.now(), order: [] };
    OB = null;
    diagBand(lvGap(ag, lo) >= 1 ? lvStep(ag, -1) : lo);
  }
  const diagIn = (g) => g !== null && lvGap(g, D.lo) >= 0 && lvGap(D.hi, g) >= 0;
  function diagBand(g) {
    const q = S.DIAG[g].filter((id) => SKILLS[id]).sort(() => Math.random() - 0.5);
    D.grade = g; D.bands[g] = { ok: [], bad: [], fast: [], guess: [], queue: q }; D.order.push(g);
    diagNext();
  }
  function diagNext() {
    const b = D.bands[D.grade], id = b.queue.shift();
    if (!id) return diagDecide(true);
    const bar = document.getElementById('mqprog'), pct0 = Math.min(95, (D.n / 15) * 100);
    if (!bar || bar.dataset.diag !== '1') app.innerHTML = lessonShell(pct0, 'dquit', true);
    else document.getElementById('sbar').style.width = pct0 + '%';
    P = { sid: D.sid, sk: SKILLS[id], diag: true, score: 0, count: 0, correct: 0, combo: 0, start: Date.now(), q: null, input: '', sel: -1, locked: false };
    nextQ();
  }
  function diagAnswer(ok) {
    P.locked = true; window.SFX.step();
    stopClips();
    const b = D.bands[D.grade], ms = Date.now() - P.qStart; (ok ? b.ok : b.bad).push(P.sk.id); D.n++;
    if (ok && ms <= FAST[D.grade]) b.fast.push(P.sk.id);
    if (!ok && ms < GUESS) b.guess.push(P.sk.id);
    document.querySelectorAll('.mq-opt, .mq-key, #mqcheck').forEach((x) => { x.disabled = true; });
    document.getElementById('sbar').style.width = Math.min(95, (D.n / 15) * 100) + '%';
    setTimeout(() => diagDecide(false), 400);
  }
  // lulus = minimal 4 dari 5 (atau 3 benar pertama); belum = 3 salah; selain itu berhenti di kelas ini (TK A hanya 3 cerita: lulus jika 3 benar)
  function diagDecide(empty) {
    const g = D.grade, b = D.bands[g], done = b.ok.length + b.bad.length;
    let v = null;
    if (b.ok.length >= 4 || (done === 3 && b.ok.length === 3)) v = 'pass';
    else if (b.bad.length >= 3) v = 'fail';
    else if (empty || done >= 5 || D.n >= 20) v = 'mid'; // paling banyak 20 soal
    if (!v) return diagNext();
    b.v = v;
    // semua benar dan cepat: soal kelas ini terlalu mudah, lompat 2 kelas (kelas yang dilewati diperiksa jika nanti gagal)
    const easy = v === 'pass' && !b.bad.length && b.ok.length >= 3 && b.fast.length === b.ok.length;
    const up = lvStep(g, 1), up2 = lvStep(g, 2), down = lvStep(g, -1);
    if (easy && diagIn(up2) && !D.bands[up] && !D.bands[up2]) return diagBand(up2);
    if (v === 'pass' && diagIn(up) && !D.bands[up]) return diagBand(up);
    if (v === 'fail' && diagIn(down) && !D.bands[down]) return diagBand(down);
    // kelas tempat siswa sebaiknya belajar sekarang (lulus di sini tapi kelas di atasnya sudah gagal = belajar di kelas atas itu)
    const level = v === 'pass' && diagIn(up) && D.bands[up] ? up : g;
    const answers = Object.keys(D.bands).sort().flatMap((k) => { const x = D.bands[k]; return [...x.ok.map((id) => [id, 1, x.fast.includes(id) ? 1 : 0, 0]), ...x.bad.map((id) => [id, 0, 0, x.guess.includes(id) ? 1 : 0])]; });
    const pf = D.pf, res = S.recordDiag(D.sid, { level, age: D.age, cls: D.cls, ms: Date.now() - D.t0, answers }, pf);
    tlog('diag', { pf, level, age: D.age, cls: D.cls, n: answers.length });
    if (cloudOn()) Object.entries(res).forEach(([key, v2]) => Cloud.queueProgress(D.sid, session.get().code, key, v2));
    setGrade(level); D = null; P = null;
    window.SFX.levelUp();
    go(DMODE[pf].result);
  }
  function diagSkills(dg, ok) { return dg.items.filter((x) => x.ok === ok && SKILLS[x.id]).sort((a, b) => SKILLS[a.id].grade - SKILLS[b.id].grade); }
  function viewDiagResult(pf = 'a') {
    const st = diagKid(); if (!st) return go('#/siswa');
    const dg = S.diagOf(st.id, pf); if (!dg) return go(DMODE[pf].start);
    const pre = pf === 'b' ? S.diagOf(st.id) : null, gain = pre ? lvGap(dg.level, pre.level) : 0;
    const prog = S.progressAll(st.id), good = diagSkills(dg, true), gaps = diagSkills(dg, false).filter((x) => SKILLS[x.id].grade <= dg.level);
    const slow = good.filter((x) => !x.fast);
    const first = unitsOf(dg.level)[0], acc = pct(good.length, dg.items.length), lg = GRADES.find((x) => x.id === dg.level) || {};
    app.innerHTML = `<main class="mq-screen"><div class="mq-result">${MQ.svg('cheer', { size: 170 })}
        <h1 class="mq-rtitle">${DMODE[pf].name} finished!</h1><p class="mq-rsub">You're ready to learn at${lg.stage ? ` <b>${gname(dg.level)}</b>` : ''}</p>
        <div class="mq-stats3"><div class="mq-stat" style="--c:#e0a800"><small>${lg.stage || 'Grade'}</small><b>${lg.short || dg.level}</b></div><div class="mq-stat" style="--c:#19b796"><small>Correct</small><b>${acc}%</b></div><div class="mq-stat" style="--c:#1c9be8"><small>Time</small><b>${mmss(dg.ms)}</b></div></div>
        ${pre ? `<div class="mq-unlock">${gain > 0 ? `📈 Up ${gain} grades since the pre-assessment!` : gain === 0 ? `Same as the pre-assessment (${gname(pre.level)}). Keep practicing!` : `Pre-assessment: ${gname(pre.level)}. That's okay, let's practice more.`}</div>` : ''}
        ${!pre && lvGap(dg.level, ageGradeOf(dg)) > 0 ? '<div class="mq-unlock">⚡ You answered quickly and correctly, so your level is above the grade for your age!</div>' : ''}
        <details class="mq-more"><summary>See the details ▾</summary>
          ${good.length ? `<section class="card"><h2>💪 What you've mastered</h2><div class="diag-chips">${good.map((x) => `<span class="pill okp">${SKILLS[x.id].code} ${SKILLS[x.id].name}</span>`).join(' ')}</div></section>` : ''}
          ${slow.length ? `<section class="card"><h2>🐢 Correct, but needs more fluency</h2><div class="sklist">${slow.map((x) => skillLink(x.id, prog[x.id], `${gname(SKILLS[x.id].grade)}`)).join('')}</div></section>` : ''}
          <section class="card"><h2>🎯 What you need to learn</h2>${gaps.length ? `<div class="sklist">${gaps.map((x) => skillLink(x.id, prog[x.id], `${gname(SKILLS[x.id].grade)}`)).join('')}</div>` : `<p>Great! All the key questions are correct. Continue to the first ${gname(dg.level)} chapter.</p><div class="sklist">${first.skills.slice(0, 3).map((x) => skillLink(x.id, prog[x.id])).join('')}</div>`}</section>
        </details>
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in"><a class="mq-btn pulse" href="#/belajar">Start learning</a></div></div>`;
  }
  // Ringkasan asesmen awal (dan akhir bila ada) untuk laporan guru, orang tua, dan siswa
  function diagSummaryHTML(k, audience) {
    const dg = S.diagOf(k.id), post = S.diagOf(k.id, 'b'), pending = S.postPending(k.id), admin = audience === 'guru' && isResearchNow();
    if (!dg) return audience === 'guru' ? `<section class="card diag-sum"><h2>🧭 Pre-assessment</h2><p class="muted small">${esc(k.name)} hasn't done the pre-assessment. It appears automatically the first time ${esc(k.name)} logs in as a student.</p></section>` : '';
    const gaps = diagSkills(dg, false), good = diagSkills(dg, true), ag = ageGradeOf(dg), lag = lvGap(ag, dg.level), plag = post ? lvGap(ageGradeOf(post), post.level) : 0, pgain = post ? lvGap(post.level, dg.level) : 0;
    return `<section class="card diag-sum"><h2>🧭 Assessment ${post || pending ? 'pre and post' : 'awal'}</h2>
      <p>${audience === 'siswa' ? 'You' : esc(k.name)} was placed at <b>${gname(dg.level)} material</b> <span class="muted small">(age ${dg.age}${dg.cls ? ` · currently learning ${gname(dg.cls)}` : ''} · ${fdate(dg.at)} · ${good.length}/${dg.items.length} key questions correct)</span>.${audience !== 'siswa' && lag > 0 ? ` <span class="warnline small">Behind ${dg.cls ? 'the level currently being studied' : 'age-appropriate grade'} (${gname(ag)}) by ${lag} grades.</span>` : ''}</p>
      ${post ? `<p class="diag-gain">🏁 Post-assessment (${fdate(post.at)}): <b>${gname(post.level)}</b> · ${pgain > 0 ? `📈 up ${pgain} grades` : pgain === 0 ? 'unchanged' : `down ${-pgain} grades`}${audience !== 'siswa' ? (plag <= 0 ? ' · ✅ matches age' : ` · still ${plag} grades below age`) : ''}</p>` : ''}
      ${pending ? `<p class="small muted">⏳ The post-assessment has been opened by the admin and is waiting for ${esc(k.name)} to do it.</p>` : ''}
      ${gaps.length ? `<p class="small"><b>Needs to learn (pre-assessment):</b> ${gaps.map((x) => `${SKILLS[x.id].code} ${SKILLS[x.id].name}${S.progress(k.id, x.id).score >= 80 ? ' ✅' : ''}`).join(' · ')}</p>` : '<p class="small">All key questions given were answered correctly.</p>'}
      ${good.length ? `<p class="small">⚡ <b>${good.filter((x) => x.fast).length}</b> of ${good.length} correct answers were fast${good.some((x) => !x.fast) ? ` · 🐢 correct but slow (needs fluency): ${good.filter((x) => !x.fast).map((x) => SKILLS[x.id].code).join(', ')}` : ''}.</p>` : ''}
      ${audience !== 'siswa' && dg.items.filter((x) => x.guess).length >= 2 ? `<p class="small warnline">⚠️ ${dg.items.filter((x) => x.guess).length} wrong answers were given very quickly (under 3 seconds). ${esc(k.name)} may be guessing.</p>` : ''}
      ${audience === 'guru' && gaps.length ? '<p class="small muted">✅ = proficient after practice. Use this list to give special tasks.</p>' : ''}
      ${admin ? `<div class="row-btn left">${pending ? `<button class="btn sm ghost" data-act="postone" data-s="${k.id}" data-o="0">Cancel post-assessment</button>` : `<button class="btn sm" data-act="postone" data-s="${k.id}" data-o="1">🏁 ${post ? 'Replay' : 'Open'} post-assessment</button>`}<button class="btn sm ghost" data-act="diagreset" data-s="${k.id}">↻ Redo pre-assessment</button></div>` : ''}</section>`;
  }

  /* ---------- Grafik koordinator (khusus admin) ----------
   * Warna: dua slot kategori (biru, oranye) untuk kelas paralel; tangga biru satu-hue untuk ketertinggalan dan penguasaan.
   * Palet sudah diperiksa dengan validator (CVD & kontras). Setiap grafik punya legenda, label langsung, tooltip, dan tabel. */
  const VZ = { s1: '#2a78d6', s2: '#eb6834', s3: '#1baf7a', ord: ['#86b6ef', '#3987e5', '#256abf', '#104281'], none: '#e3e7e6', seq: ['#e8eef5', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#104281'], ink2: '#52514e', grid: '#e6ebe9' };
  const gradeOfClass = (s) => s.grade || +((s.c.name.match(/\d/) || [])[0]) || null;
  const shortName = (c) => (c.name.match(/\d+\s*[A-Za-z]?/) || [c.name])[0].replace(/\s+/g, '');
  const tip = (title, value) => `data-tip-t="${esc(title)}" data-tip-v="${esc(value)}" tabindex="0"`;
  const vzTable = (head, rows) => `<details class="vztable"><summary>View as table</summary><div class="tscroll"><table class="tbl"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  const legend = (items) => `<div class="vzlegend">${items.map(([c, l, kind]) => `<span><i class="${kind || ''}" style="--c:${c}"></i>${l}</span>`).join('')}</div>`;

  function chartsHTML(all) {
    const classes = all.filter((s) => s.n).map((s) => ({ ...s, g: gradeOfClass(s), short: shortName(s.c) })).sort((a, b) => (a.g || 9) - (b.g || 9) || a.short.localeCompare(b.short));
    if (!classes.length) return emptyCard('No data yet', 'Charts appear once the class has students.');
    return lagChart(classes) + parallelChart(classes) + heatmapChart(classes) + dumbbellChart(classes);
  }

  // 1. Sebaran ketertinggalan per kelas (batang bertumpuk 100%) dari asesmen terbaru tiap siswa
  function lagChart(classes) {
    const cats = [['On level for age', VZ.ord[0]], ['1 grade behind', VZ.ord[1]], ['2 grades behind', VZ.ord[2]], ['≥3 grades behind', VZ.ord[3]], ['Not assessed', VZ.none]];
    const data = classes.map((s) => {
      const cnt = [0, 0, 0, 0, 0];
      S.studentsOf(s.c.id).forEach((k) => { const d = S.diagOf(k.id, 'b') || S.diagOf(k.id); if (!d) return cnt[4]++; const gap = lvGap(ageGradeOf(d), d.level); cnt[gap <= 0 ? 0 : Math.min(3, gap)]++; });
      return { s, cnt, n: cnt.reduce((t, x) => t + x, 0) };
    });
    const L = 64, W = 340, RW = W - L - 8, RH = 26, H = data.length * RH + 6;
    const bars = data.map((d, i) => {
      let x = L; const y = i * RH + 4;
      const segs = d.cnt.map((v, ci) => {
        if (!v) return ''; const w = (v / d.n) * RW, cx = x; x += w;
        const dark = ci === 2 || ci === 3, lbl = w >= 16 ? `<text x="${cx + w / 2}" y="${y + 13}" text-anchor="middle" font-size="10" font-weight="800" fill="${dark ? '#fff' : ci === 4 ? VZ.ink2 : '#16302b'}" pointer-events="none">${v}</text>` : '';
        return `<rect class="vzmark" x="${cx}" y="${y}" width="${Math.max(0, w)}" height="18" rx="${ci === 0 || x >= L + RW - 0.5 ? 4 : 0}" fill="${cats[ci][1]}" stroke="#fff" stroke-width="2" ${tip(`${d.s.c.name} · ${cats[ci][0]}`, `${v} of ${d.n} students (${pct(v, d.n)}%)`)}/>${lbl}`;
      }).join('');
      return `<text x="${L - 6}" y="${y + 13}" text-anchor="end" font-size="11" font-weight="800" fill="#16302b">${esc(d.s.short)}</text>${segs}`;
    }).join('');
    const worst = data.slice().sort((a, b) => (b.cnt[2] + b.cnt[3]) / b.n - (a.cnt[2] + a.cnt[3]) / a.n)[0];
    return `<section class="card vz"><h2>1. Learning gap by class</h2>
      <p class="small muted">From each student's latest assessment (post if available, otherwise pre), compared with the age-appropriate grade. The darker, the further behind.</p>
      ${legend(cats.map(([l, c]) => [c, l]))}
      <svg viewBox="0 0 ${W} ${H}" class="vzsvg" role="img" aria-label="Learning gap by class">${bars}</svg>
      ${worst && worst.cnt[2] + worst.cnt[3] ? `<p class="small">Most in need of intervention: <b>${esc(worst.s.c.name)}</b>, ${worst.cnt[2] + worst.cnt[3]} of ${worst.n} students are 2 or more grades behind.</p>` : ''}
      ${vzTable(['Grade', ...cats.map((c) => c[0])], data.map((d) => [esc(d.s.c.name), ...d.cnt]))}</section>`;
  }

  // 2. Perbandingan kelas paralel per jenjang (batang berkelompok, satu ukuran dipilih)
  function parallelChart(classes) {
    const M = [['aktif', 'Active students', (s) => s.pActive], ['tepat', 'Accuracy', (s) => (s.answered ? s.acc : null)], ['paham', 'Not understood', (s) => s.pBehind], ['tugas', 'Tasks finished', (s) => s.pDone]];
    const mk = ss.get('vizm', 'aktif'), m = M.find((x) => x[0] === mk) || M[0];
    const grades = [...new Set(classes.map((s) => s.g).filter(Boolean))].sort();
    const W = 340, H = 190, top = 18, base = 150, L = 30, gw = (W - L - 6) / grades.length, maxSlots = Math.max(...grades.map((g) => classes.filter((s) => s.g === g).length));
    const bw = Math.min(26, (gw - 14) / maxSlots - 3), Y = (v) => base - (v / 100) * (base - top);
    const slotColor = [VZ.s1, VZ.s2, VZ.s3];
    let o = [0, 50, 100].map((v) => `<line x1="${L}" x2="${W - 4}" y1="${Y(v)}" y2="${Y(v)}" stroke="${VZ.grid}" stroke-width="1"/><text x="${L - 4}" y="${Y(v) + 3}" text-anchor="end" font-size="9" fill="${VZ.ink2}">${v}%</text>`).join('');
    grades.forEach((g, gi) => {
      const cs = classes.filter((s) => s.g === g), x0 = L + gi * gw + (gw - cs.length * (bw + 3)) / 2;
      cs.forEach((s, i) => {
        const v = m[2](s), x = x0 + i * (bw + 3);
        if (v === null || v === undefined) { o += `<text x="${x + bw / 2}" y="${base - 4}" text-anchor="middle" font-size="9" fill="${VZ.ink2}">–</text>`; }
        else o += `<path class="vzmark" d="M${x} ${base}V${Y(v) + 4}q0 -4 4 -4h${bw - 8}q4 0 4 4V${base}Z" fill="${slotColor[i % 3]}" ${tip(`${s.c.name} · ${m[1]}`, `${v}%`)}/><text x="${x + bw / 2}" y="${Y(v) - 4}" text-anchor="middle" font-size="9" font-weight="800" fill="#16302b">${v}</text>`;
        o += `<text x="${x + bw / 2}" y="${base + 12}" text-anchor="middle" font-size="9" font-weight="700" fill="${VZ.ink2}">${esc(s.short)}</text>`;
      });
      o += `<text x="${L + gi * gw + gw / 2}" y="${base + 28}" text-anchor="middle" font-size="10" font-weight="800" fill="#16302b">${gname(g)}</text>`;
    });
    o += `<line x1="${L}" x2="${W - 4}" y1="${base}" y2="${base}" stroke="#16302b" stroke-width="1"/>`;
    const suffix = (i) => { const sx = classes.filter((s) => s.g).map((s) => s.short.replace(/^\d+/, '')).filter(Boolean); const u = [...new Set(sx)].sort(); return u[i] ? `Parallel class ${u[i]}` : `Parallel class no. ${i + 1}`; };
    return `<section class="card vz"><h2>2. Comparing parallel classes</h2>
      <p class="small muted">Classes at the same level study the same material, so the comparison is fair. Follows the period above.</p>
      <div class="vzpills">${M.map(([k, l]) => `<button class="${k === m[0] ? 'on' : ''}" data-act="vizm" data-m="${k}">${l}</button>`).join('')}</div>
      ${legend([...Array(Math.min(3, maxSlots))].map((_, i) => [slotColor[i], suffix(i)]))}
      <svg viewBox="0 0 ${W} ${H}" class="vzsvg" role="img" aria-label="${m[1]} by parallel class">${o}</svg>
      <p class="small muted">${m[0] === 'paham' ? 'Lower is better: the percentage of students with at least a quarter of their skills still weak.' : 'Higher is better.'}</p>
      ${vzTable(['Grade', 'Level', ...M.map((x) => x[1])], classes.map((s) => [esc(s.c.name), s.g || '–', ...M.map((x) => { const v = x[2](s); return v === null || v === undefined ? '–' : v + '%'; })]))}</section>`;
  }

  // 3. Peta penguasaan bab × kelas (per jenjang): rata-rata SmartScore bab di setiap kelas
  function heatmapChart(classes) {
    const bin = (v) => (v <= 0 ? -1 : v < 20 ? 1 : v < 40 ? 2 : v < 60 ? 3 : v < 80 ? 4 : v < 90 ? 5 : 6);
    const grades = [...new Set(classes.map((s) => s.g).filter(Boolean))].sort(), weak = [];
    const blocks = grades.map((g) => {
      const cs = classes.filter((s) => s.g === g), units = unitsOf(g), cw = Math.min(20, 270 / units.length), L = 40, W = L + units.length * cw + 4, H = 16 + cs.length * (cw + 2);
      let o = units.map((u, j) => `<text x="${L + j * cw + cw / 2}" y="11" text-anchor="middle" font-size="8" font-weight="800" fill="${VZ.ink2}">${u.id.replace(/^\d/, '')}</text>`).join('');
      const unitAvg = units.map(() => []);
      cs.forEach((s, i) => {
        const kids = S.studentsOf(s.c.id), y = 16 + i * (cw + 2);
        o += `<text x="${L - 5}" y="${y + cw / 2 + 4}" text-anchor="end" font-size="10" font-weight="800" fill="#16302b">${esc(s.short)}</text>`;
        units.forEach((u, j) => {
          const sc = kids.map((k) => unitScore(k.id, u)), avg = Math.round(sc.reduce((t, x) => t + x.avg, 0) / (sc.length || 1)), mahir = kids.filter((k) => unitScore(k.id, u).avg >= 80).length, b = bin(avg);
          unitAvg[j].push(avg);
          o += `<rect class="vzmark" x="${L + j * cw + 1}" y="${y}" width="${cw - 2}" height="${cw}" rx="3" fill="${b < 0 ? VZ.none : VZ.seq[b]}" ${tip(`${s.c.name} · Chapter ${u.id} ${u.name}`, b < 0 ? 'not tried' : `average ${avg} · ${mahir}/${kids.length} students averaging ≥ 80`)}/>`;
        });
      });
      units.forEach((u, j) => { const a = unitAvg[j], m = Math.round(a.reduce((t, x) => t + x, 0) / a.length); if (m > 0 && m < 50) weak.push([g, u, m]); });
      return `<div class="vzhm"><b class="small">${gname(g)}</b><svg viewBox="0 0 ${W} ${H}" class="vzsvg" style="max-width:${W * 1.6}px" role="img" aria-label="Chapter mastery in class ${g}">${o}</svg></div>`;
    }).join('');
    const scale = [['not tried', VZ.none], ['1–19', VZ.seq[1]], ['20–39', VZ.seq[2]], ['40–59', VZ.seq[3]], ['60–79', VZ.seq[4]], ['80–89', VZ.seq[5]], ['90–100', VZ.seq[6]]];
    weak.sort((a, b) => a[2] - b[2]);
    return `<section class="card vz"><h2>3. Chapter × class mastery map</h2>
      <p class="small muted">Average SmartScore of each chapter in each class (all students counted). Columns = chapters at that level; tap a box for details.</p>
      ${legend(scale.map(([l, c]) => [c, l]))}${blocks}
      ${weak.length ? `<p class="small"><b>Chapters still weak (average &lt; 50):</b> ${weak.slice(0, 6).map(([g, u, m]) => `${gname(g)} · ${u.name} (${m})`).join(' · ')}</p>` : ''}
      ${vzTable(['Grade', 'Chapter', 'Average SmartScore'], classes.flatMap((s) => unitsOf(s.g || 1).map((u) => { const kids = S.studentsOf(s.c.id); return [esc(s.c.name), `${u.id} ${u.name}`, Math.round(kids.reduce((t, k) => t + unitScore(k.id, u).avg, 0) / (kids.length || 1))]; })))}</section>`;
  }

  // 4. Asesmen awal → akhir (dumbbell): per kelas, atau per siswa untuk satu kelas
  function dumbbellChart(classes) {
    const sel = ss.get('vizdb', ''), one = classes.find((s) => s.c.id === sel);
    const avg = (xs) => xs.reduce((t, x) => t + x, 0) / xs.length;
    const rows = one
      ? S.studentsOf(one.c.id).map((k) => { const a = S.diagOf(k.id), b = S.diagOf(k.id, 'b'); return a ? { label: k.name, pre: lvPos(a.level), post: b ? lvPos(b.level) : null, age: lvPos(ageGradeOf(b || a)), n: 1 } : null; }).filter(Boolean)
      : classes.map((s) => {
        const both = S.studentsOf(s.c.id).map((k) => [S.diagOf(k.id), S.diagOf(k.id, 'b')]).filter(([a]) => a);
        if (!both.length) return null;
        const paired = both.filter(([, b]) => b);
        return { label: s.short, pre: avg((paired.length ? paired : both).map(([a]) => lvPos(a.level))), post: paired.length ? avg(paired.map(([, b]) => lvPos(b.level))) : null, age: avg(both.map(([a, b]) => lvPos(ageGradeOf(b || a)))), n: paired.length, total: both.length };
      }).filter(Boolean);
    if (!rows.length) return `<section class="card vz"><h2>4. Pre-assessment → post-assessment</h2><p class="muted">No students have done the pre-assessment yet.</p></section>`;
    // sumbu tetap Kelas 1–6 untuk data SD; melebar ke TK atau SMP/SMA hanya jika ada siswa di sana (posisi lvPos: TK A = −1, TK B = 0)
    const vals = rows.flatMap((r) => [r.pre, r.post, r.age]).filter((v) => v !== null), lo = Math.min(1, Math.floor(Math.min(...vals))), hi = Math.max(6, Math.ceil(Math.max(...vals)));
    const ticks = [...Array(hi - lo + 1)].map((_, i) => lo + i), wide = ticks.length > 6;
    const L = one ? 70 : 44, W = 340, RH = 24, H = rows.length * RH + 30, X = (v) => L + 12 + ((v - lo) / (hi - lo)) * (W - L - 30);
    let o = ticks.map((v) => `<line x1="${X(v)}" x2="${X(v)}" y1="4" y2="${H - 22}" stroke="${VZ.grid}"/><text x="${X(v)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="${VZ.ink2}">${wide ? gshort(lvAt(v)) : 'Grade ' + v}</text>`).join('');
    rows.forEach((r, i) => {
      const y = 14 + i * RH, f1 = lvLabel;
      o += `<text x="${L - 6}" y="${y + 4}" text-anchor="end" font-size="10" font-weight="800" fill="#16302b">${esc(r.label.length > 9 ? r.label.slice(0, 9) + '…' : r.label)}</text>`;
      o += `<path d="M${X(r.age)} ${y - 8}v16" stroke="${VZ.s2}" stroke-width="3" stroke-linecap="round"/>`;
      if (r.post !== null) o += `<line x1="${X(r.pre)}" x2="${X(r.post)}" y1="${y}" y2="${y}" stroke="${VZ.ord[1]}" stroke-width="3" stroke-linecap="round"/>`;
      o += `<circle cx="${X(r.pre)}" cy="${y}" r="5" fill="#fff" stroke="${VZ.s1}" stroke-width="2.5"/>`;
      if (r.post !== null) o += `<circle cx="${X(r.post)}" cy="${y}" r="5.5" fill="${VZ.s1}" stroke="#fff" stroke-width="2"/>`;
      o += `<rect x="${L}" y="${y - 11}" width="${W - L}" height="22" fill="transparent" class="vzhit" ${tip(one ? r.label : `${r.label} · ${r.n} of ${r.total} students have done the post-assessment`, `pre ${f1(r.pre)}${r.post !== null ? ` → post ${f1(r.post)} (${r.post - r.pre >= 0 ? '+' : ''}${dec(r.post - r.pre)})` : ' · no post-assessment yet'} · age-appropriate ${f1(r.age)}`)}/>`;
    });
    const caught = one ? rows.filter((r) => r.post !== null && r.post >= r.age && r.pre < r.age).length : 0;
    return `<section class="card vz"><h2>4. Pre-assessment → post-assessment</h2>
      <p class="small muted">${one ? `Each row is one student ${esc(one.c.name)}.` : 'Average level per class from students who did both (if there\'s no post-assessment yet, only the starting point).'} Orange line = age-appropriate grade: the closer the end point is to that line, the more the gap has closed.</p>
      <div class="vzpills"><button class="${one ? '' : 'on'}" data-act="vizdb" data-c="">All classes</button>${classes.map((s) => `<button class="${one && one.c.id === s.c.id ? 'on' : ''}" data-act="vizdb" data-c="${s.c.id}">${esc(s.short)}</button>`).join('')}</div>
      ${legend([[VZ.s1, 'Pre', 'ring'], [VZ.s1, 'Post', 'dot'], [VZ.s2, 'Age-appropriate grade', 'tick']])}
      <svg viewBox="0 0 ${W} ${H}" class="vzsvg" role="img" aria-label="Pre- and post-assessment level">${o}</svg>
      ${one && caught ? `<p class="small">🎯 ${caught} students have caught up to their age-appropriate grade.</p>` : ''}
      ${vzTable([one ? 'Student' : 'Grade', 'Pre', 'Post', 'Up', 'On level for age'], rows.map((r) => [esc(r.label), wide ? lvLabel(r.pre) : dec(r.pre), r.post === null ? '–' : wide ? lvLabel(r.post) : dec(r.post), r.post === null ? '–' : dec(r.post - r.pre), wide ? lvLabel(r.age) : dec(r.age)]))}</section>`;
  }

  // Tooltip bersama untuk semua grafik (teks disisipkan sebagai textContent)
  (function vizTooltip() {
    let box = null;
    const show = (el, x, y) => {
      if (!box) { box = document.createElement('div'); box.className = 'vztip'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
      box.replaceChildren(); const v = document.createElement('b'), t = document.createElement('small');
      v.textContent = el.dataset.tipV; t.textContent = el.dataset.tipT; box.append(v, t);
      box.style.display = 'block';
      const r = box.getBoundingClientRect();
      box.style.left = Math.max(8, Math.min(window.innerWidth - r.width - 8, x - r.width / 2)) + 'px';
      box.style.top = Math.max(8, y - r.height - 12) + 'px';
    };
    const hide = () => { if (box) box.style.display = 'none'; };
    document.addEventListener('pointermove', (e) => { const el = e.target.closest && e.target.closest('[data-tip-v]'); if (el) show(el, e.clientX, e.clientY); else hide(); });
    document.addEventListener('focusin', (e) => { const el = e.target.closest && e.target.closest('[data-tip-v]'); if (el) { const r = el.getBoundingClientRect(); show(el, r.left + r.width / 2, r.top); } });
    document.addEventListener('focusout', hide); window.addEventListener('scroll', hide, { passive: true });
  })();

  /* ---------- Alur kelas: langkah memulai, tombol cepat, tugas dikumpulkan, berbagi kode ---------- */
  function shareText(text) {
    if (navigator.share) return navigator.share({ text }).catch(() => {});
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }
  // Kartu "Mulai kelas ini": muncul selama masih ada langkah yang belum selesai
  // Hasil pengerjaan tugas untuk notifikasi dan ringkasan
  function doneText(n) {
    const sk = n.a.skills.filter((k) => SKILLS[k]), sc = sk.map((k) => S.progress(n.k.id, k).score), prof = sc.filter((v) => v >= 80).length;
    return `${n.d.by === 'ortu' ? 'reported by parent' : prof === sk.length ? 'all skills proficient' : 'turned in by student'} · ${prof}/${sk.length} proficient${sk.length ? ` (score ${sc.join(', ')})` : ''}`;
  }
  // Siswa: kemajuan tugas dan tombol Kumpulkan (setelah mencoba setiap keterampilan minimal 5 soal, atau sudah mahir)
  function submitBar(a, prog) {
    const sk = a.skills.filter((k) => SKILLS[k]), p = (k) => prog[k] || {}, prof = sk.filter((k) => p(k).score >= 80).length;
    const ready = sk.every((k) => (p(k).att || 0) >= 5 || p(k).score >= 80), left = sk.filter((k) => !((p(k).att || 0) >= 5 || p(k).score >= 80));
    return `<div class="asgfoot"><span class="grow"><b>${prof}/${sk.length}</b> skills proficient${ready ? '' : `<small class="muted">Do at least 5 questions in ${left.map((k) => SKILLS[k].code).join(', ')} to be able to turn it in</small>`}</span> ${ready ? `<button class="btn sm" data-act="submitasg" data-a="${a.id}">✅ Turn in</button>` : ''}</div>`;
  }

  /* ---------- Kelompok belajar: siswa dikelompokkan menurut level asesmen terbaru ---------- */
  function groupsHTML(ctx) {
    const rows = ctx.kids.map((k) => { const d = S.diagOf(k.id, 'b') || S.diagOf(k.id); return { k, d, level: d ? d.level : null, age: d ? ageGradeOf(d) : null, lag: d ? lvGap(ageGradeOf(d), d.level) : 0 }; });
    const levels = [...new Set(rows.filter((r) => r.level).map((r) => r.level))].sort((a, b) => a - b);
    const groups = levels.map((lv) => ({ lv, kids: rows.filter((r) => r.level === lv) }));
    const none = rows.filter((r) => !r.level);
    // saran: keterampilan kunci dan celah asesmen anggota yang belum mahir, diurutkan dari yang paling banyak dibutuhkan
    const suggest = (g) => {
      const cand = new Set(S.DIAG[g.lv] || []);
      g.kids.forEach((r) => r.d.items.forEach((x) => { if (!x.ok && SKILLS[x.id] && SKILLS[x.id].grade <= g.lv) cand.add(x.id); }));
      unitsOf(g.lv).slice(0, 3).forEach((u) => u.skills.slice(0, 2).forEach((x) => cand.add(x.id)));
      return [...cand].filter((id) => SKILLS[id]).map((id) => ({ id, need: g.kids.filter((r) => S.progress(r.k.id, id).score < 80).length }))
        .filter((x) => x.need > 0).sort((a, b) => b.need - a.need || SKILLS[a.id].grade - SKILLS[b.id].grade).slice(0, 5);
    };
    const kidChips = (list) => `<div class="gkids">${list.map((r) => `<a class="kidchip" href="#/guru/siswa/${r.k.id}">${avHTML(r.k.avatar)} ${esc(r.k.name)}${r.lag > 0 ? ` <small class="muted">−${r.lag}</small>` : ''}</a>`).join('')}</div>`;
    const card = (g) => {
      const sug = suggest(g), behind = g.kids.filter((r) => r.lag > 0).length;
      const head = `Group for ${gname(g.lv)} material`;
      return `<section class="card grp"><div class="lrow"><span class="gicon g-pasangan">${gshort(g.lv)}</span><span class="grow"><b>${head}</b><small>${g.kids.length} students${behind ? ` · ${behind} below their age-appropriate grade` : ''}</small></span></div>
        ${kidChips(g.kids)}
        ${sug.length ? `<form data-form="grouptask" data-sids="${g.kids.map((r) => r.k.id).join(',')}" class="form">
          <p class="small"><b>Suggested tasks for this group</b> <span class="muted">(number = members not yet proficient)</span></p>
          ${sug.map((x, i) => `<label class="cb"><input type="checkbox" name="sk" value="${x.id}" ${i < 3 ? 'checked' : ''}> ${SKILLS[x.id].code} ${SKILLS[x.id].name} <span class="pill">${x.need}/${g.kids.length}</span></label>`).join('')}
          <div class="grow2"><label>Note<input name="note" maxlength="120" value="${esc(head)}: practice together"></label><label>Due date (optional)<input name="due" type="date"></label></div>
          <button class="btn sm">📌 Assign a task to these ${g.kids.length} students</button></form>`
        : '<p class="small muted">All members are proficient in this level\'s key skills. Consider the next grade\'s material.</p>'}</section>`;
    };
    return `<section class="card"><h2>👥 Learning groups</h2>
        <p class="small muted">Students are grouped by level from their latest assessment (post-assessment if available, otherwise pre-assessment). Group tasks are visible only to group members, so each child practices at their level. −1, −2 beside a name = how many grades below their age-appropriate grade.</p>
        <div class="kpis">${groups.map((g) => `<div class="kpi"><small>${gname(g.lv)} material</small><b>${g.kids.length}<span> students</span></b></div>`).join('')}${none.length ? `<div class="kpi"><small>Not assessed</small><b>${none.length}</b></div>` : ''}</div></section>
      ${groups.map(card).join('') || emptyCard('No assessment results yet', 'Groups appear after students do the pre-assessment. It shows up automatically the first time a student logs in.')}
      ${none.length ? `<section class="card grp"><div class="lrow"><span class="gicon g-pasangan">?</span><span class="grow"><b>Assessment not done</b><small>${none.length} students. The pre-assessment appears automatically next time they log in.</small></span></div>${kidChips(none)}</section>` : ''}`;
  }

  /* ---------- Asesmen awal dan akhir untuk penelitian (khusus admin) ---------- */
  // Simpan progres atas nama siswa memakai kode kelas, seperti saat siswa menyimpan progresnya sendiri
  const syncKid = (k, rec) => (cloudOn() ? Cloud.rpc('student_sync', { p_code: S.cls(k.classId).code, p_student_id: k.id, p_answers: [], p_progress: rec }) : Promise.resolve());
  async function postOpen(kids, open) {
    for (const k of kids) await syncKid(k, S.openPost(k.id, open));
    if (cloudOn()) await ensure(true);
  }
  function prepostRows(kids) {
    return kids.map((k) => {
      const pre = S.diagOf(k.id), post = S.diagOf(k.id, 'b'), ag = pre || post ? ageGradeOf(post || pre) : null;
      return { k, pre, post, pending: S.postPending(k.id), ag, gain: pre && post ? lvGap(post.level, pre.level) : null };
    });
  }
  function prepostHTML(all) {
    const rows = all.flatMap((s) => prepostRows(S.studentsOf(s.c.id)).map((r) => ({ ...r, c: s.c })));
    const both = rows.filter((r) => r.pre && r.post), mean = (xs) => (xs.length ? lvLabel(xs.reduce((t, x) => t + x, 0) / xs.length).replace(/^Kelas /, '') : '–');
    const atAge = (list, key) => list.filter((r) => lvGap(r[key].level, ageGradeOf(r[key])) >= 0).length;
    const cell = (d, r) => (d ? `${gname(d.level)} <small class="muted">${fdate(d.at)}</small>` : '–');
    return `<section class="card"><h2>🧭 Pre- and post-assessment</h2>
        <p class="small">The pre-assessment (pretest) runs automatically the first time a student logs in. The post-assessment (posttest) uses the same procedure and can only be opened by an admin. Results are stored separately, so the pre-assessment result is never overwritten.</p>
        <div class="kpis"><div class="kpi"><small>Did pre-assessment</small><b>${rows.filter((r) => r.pre).length}<span>/${rows.length}</span></b></div><div class="kpi"><small>Did post-assessment</small><b>${both.length}<span> · ${rows.filter((r) => r.pending).length}⏳</span></b></div>
          <div class="kpi"><small>Class average: pre → post</small><b class="sm">${mean(both.map((r) => lvPos(r.pre.level)))} → ${mean(both.map((r) => lvPos(r.post.level)))}</b></div><div class="kpi"><small>On level for age: pre → post</small><b class="sm">${both.length ? `${atAge(both, 'pre')} → ${atAge(both, 'post')} of ${both.length}` : '–'}</b></div></div>
        <p class="small muted">Averages and "on level for age" are calculated from students who did both. Age-appropriate grade: age 4 = Pre-K, 5 = Kindergarten, 6–7 = Grade 1, 8 = Grade 2, …, 11 = Grade 5, 12 = Grade 6. Students 13 and older choose the level they're studying (Grade 7 through Calculus). Gains and gaps are counted in the order Pre-K, Kindergarten, Grade 1, …, Grade 8, Algebra 1, Geometry, Algebra 2, Precalculus, Calculus.</p></section>
      ${all.map((s) => { const rs = prepostRows(S.studentsOf(s.c.id)), canOpen = rs.filter((r) => r.pre && !r.pending); return `<section class="card"><div class="lrow"><span class="grow"><b>${esc(s.c.name)}</b><small>${esc(s.c.teacherName || '')} · ${rs.filter((r) => r.pre).length}/${rs.length} did the pre-assessment</small></span>${canOpen.length ? `<button class="btn sm" data-act="postclass" data-c="${s.c.id}">🏁 Open post-assessment (${canOpen.length})</button>` : ''}</div>
        <div class="tscroll"><table class="tbl"><thead><tr><th>Student</th><th>Age</th><th>On level for age</th><th>Pre</th><th>Post</th><th>Up</th><th>Status</th><th></th></tr></thead><tbody>
        ${rs.map((r) => `<tr><td><a href="#/guru/siswa/${r.k.id}" data-act="openkid" data-id="${s.c.id}" data-s="${r.k.id}">${avHTML(r.k.avatar)} ${esc(r.k.name)}</a></td><td>${(r.post || r.pre || {}).age || '–'}</td><td>${r.ag ? gname(r.ag) : '–'}</td><td>${cell(r.pre)}</td><td>${r.pending ? '⏳ opened' : cell(r.post)}</td>
          <td>${r.gain === null ? '–' : `<b class="${r.gain > 0 ? 'okc' : ''}">${r.gain > 0 ? '+' : ''}${r.gain}</b>`}</td>
          <td>${!r.pre ? '<span class="muted">not assessed</span>' : (() => { const d = r.post || r.pre, gap = lvGap(ageGradeOf(d), d.level); return gap > 0 ? `<span class="accb ${gap >= 2 ? 'r' : 'y'}">behind ${gap}</span>` : '<span class="accb g">on level for age</span>'; })()}</td>
          <td>${r.pre ? (r.pending ? `<button class="link small" data-act="postone" data-s="${r.k.id}" data-o="0">Cancel</button>` : `<button class="link small" data-act="postone" data-s="${r.k.id}" data-o="1">${r.post ? 'Replay' : 'Open'}</button>`) : ''}</td></tr>`).join('')}
        </tbody></table></div></section>`; }).join('')}`;
  }

  /* ---------- Mode coba (versi Beta): data contoh lokal untuk siswa, orang tua, dan guru ---------- */
  const TRY_CODE = '1234';
  // Formulir nama sebelum masuk mode coba (siswa, orang tua, guru)
  function viewTryStart(role) {
    if (!['siswa', 'ortu', 'guru'].includes(role) || (role === 'ortu' && !PARENTS_ON)) return go('#/');
    if (role === 'siswa') {
      const kids = deviceKids(), t0 = tryInfo() || {};
      app.innerHTML = `<form data-form="trystart" data-r="siswa">${mqBack('#/')}<main class="mq-screen"><div class="mq-ob-body">
        <div class="mq-big-say"><div class="mq-bubble"><p>Hi! What's <b class="hl">your name</b>?</p></div>${MQ.svg('hello', { size: 160 })}</div>
        ${kids.length ? `<div class="mq-choices">${kids.map((d) => `<button type="button" class="mq-choice" data-act="trykid" data-s="${d.sid}"><span class="em">▶</span><span class="grow">Continue as ${esc(d.name)}</span></button>`).join('')}</div><p class="mq-hint">or start with a new name:</p>` : ''}
        <input class="mq-code" style="letter-spacing:0;text-indent:0;text-transform:none;font-size:1.5rem" name="name" required maxlength="40" placeholder="Type your name" autocomplete="off" value="${kids.length ? '' : esc(t0.role === 'siswa' ? t0.name || '' : '')}" aria-label="Your name">
        <p class="small muted" style="margin:6px 0 0">Demo mode uses sample data and is saved only on this phone. Your name and trial activity are recorded to help develop Metiq.</p>
      </div></main><div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn pulse">Start</button></div></div></form>`;
      return;
    }
    const t = tryInfo() || {}, same = t.role === role, nm = same ? t.name || '' : '';
    const title = { siswa: '🧒 Try as a student', ortu: '👨‍👩‍👧 Try as a parent', guru: '👩‍🏫 Try as a teacher' }[role];
    app.innerHTML = shell(`<a class="back" href="#/">← Back</a>
      <section class="card narrow"><h1 class="center">${title}</h1>
        <p class="muted center small">Demo mode uses sample data from one school. Write your name so Metiq feels like your own.</p>
        ${role === 'siswa' && deviceKids().length ? `<div class="trykids"><p class="small"><b>Tried it on this phone before?</b></p>${deviceKids().map((d) => `<button class="btn ghost" data-act="trykid" data-s="${d.sid}">▶ Continue as ${esc(d.name)}</button>`).join('')}<p class="small muted">Or another child (a sibling) can start with their own name:</p></div>` : ''}
        <form data-form="trystart" data-r="${role}" class="form">
          <label>${role === 'siswa' ? (deviceKids().length ? 'New child\'s name' : 'Your name') : 'Your name'}<input name="name" required maxlength="40" value="${role === 'siswa' && deviceKids().length ? '' : esc(nm)}" placeholder="${role === 'siswa' ? 'e.g. Raka' : role === 'ortu' ? 'e.g. Ms. Sinta' : 'e.g. Ms. Rina'}" autocomplete="off"></label>
          ${role === 'ortu' && deviceKids().length ? `<fieldset class="trylink"><legend>🔗 Children who tried it on this device</legend>${deviceKids().map((d) => `<label class="cb"><input type="checkbox" name="link" value="${d.sid}" checked><span>See <b>${esc(d.name)}</b>'s results</span></label>`).join('')}</fieldset>` : ''}
          ${role === 'ortu' ? `<label>Child's name <small class="muted">(${deviceKids().length ? 'if nothing is checked, ' : ''}for the sample report)</small><input name="child" maxlength="40" value="${esc(same ? t.child || '' : '')}" placeholder="e.g. Alya" autocomplete="off"></label>` : ''}
          <button class="btn">Start trying →</button>
        </form>
        <p class="small muted trynote">To help develop Metiq, the name you write and your demo activity (pages opened, questions, games) are recorded. No other personal data is requested.</p></section>`);
  }
  // Akun coba siswa yang dibuat di perangkat ini (dipakai lagi oleh siswa, dan bisa dilihat orang tua di perangkat yang sama)
  // Anak-anak yang pernah mencoba sebagai siswa di perangkat ini (kakak-adik di satu HP).
  // Di luar mode coba data contoh lokal tidak dimuat, jadi nama disimpan bersama penandanya.
  const deviceKids = () => {
    const old = ls.get('metiq_try_kid', null), list = ls.get('metiq_try_kids', old ? [old] : []);
    if (!session.get().demo) return list.filter((d) => d.name);
    return list.filter((d) => S.student(d.sid)).map((d) => ({ sid: d.sid, name: S.student(d.sid).name }));
  };
  const saveDeviceKid = (sid, name) => { const list = ls.get('metiq_try_kids', []).filter((d) => d.sid !== sid); list.push({ sid, name }); ls.set('metiq_try_kids', list.slice(-8)); };
  function startDemo(role, name, child, links, sid) {
    session.set({ demo: true }); S.setMode(false);
    const t = S.seedDemo(), c = S.classesOf(t.id)[0], kids = S.studentsOf(c.id);
    name = String(name || '').trim().slice(0, 40); child = String(child || '').trim().slice(0, 40);
    setTry({ role, name, child });
    tlog('start', { role });
    if (role === 'guru') { if (name) S.renameTeacher(t.id, name); session.set({ role: 'guru', id: t.id, demo: true }); toast(`Welcome, ${esc(name || 'Teacher')}!`); return go('#/guru/ringkasan'); }
    if (role === 'ortu') {
      const mine = deviceKids().filter((d) => (links || []).includes(d.sid));
      if (mine.length) {
        setTry({ role, name, child: mine.map((d) => d.name).join(', ') });
        session.set({ role: 'ortu', id: mine[0].sid, kids: mine.map((d) => d.sid), demo: true });
        toast(`Welcome, ${esc(name || 'Parent')}!`);
        return go(mine.length > 1 ? '#/ortu/anak' : '#/ortu/laporan');
      }
      const k = kids.find((x) => x.name === 'Alya') || kids[0];
      if (child) S.renameStudent(k.id, child);
      session.set({ role: 'ortu', id: k.id, demo: true }); toast(`Welcome, ${esc(name || 'Parent')}!`); return go('#/ortu/laporan');
    }
    // siswa: akun siswa contoh baru dengan namanya sendiri (mulai dari asesmen awal)
    // lanjut sebagai anak yang sudah ada, atau anak baru (anak dengan nama sama di perangkat ini dipakai lagi)
    const again = sid ? deviceKids().find((d) => d.sid === sid) : deviceKids().find((d) => d.name.toLowerCase() === name.toLowerCase());
    const k = again ? S.student(again.sid) : S.addStudent(c.id, name || 'Student');
    saveDeviceKid(k.id, k.name);
    setTry({ role, name: k.name, child, sid: k.id });
    session.set({ role: 'siswa', id: k.id, code: c.code, demo: true });
    go('#/belajar');
  }

  function realTeacherCard() {
    return `<details class="card realcard"><summary><b>🚀 Ready to use with real students?</b> <span class="muted small">Tap for the steps</span></summary>
      <p class="small">Demo mode only contains a sample class on this device. For real students and parents, sign up as a teacher. It's <b>free</b> and takes about 2 minutes:</p>
      <ol class="small"><li>Tap <b>Free teacher sign-up</b>, then fill in your name, email, password, and class name.</li>
        <li>Add student names in the <b>Students</b> tab, then share the <b>class code</b> (5 letters) with them. Students sign in through <i>I'm a Student</i> and choose their name.</li>
        <li>Each student has a <b>parent code</b> (6 letters/digits) on their own page. Share it with parents so they can see reports and task notifications.</li></ol>
      <p class="small muted">All real class data is stored on the server and connected across devices. Demo data doesn't carry over.</p>
      <div class="row-btn left"><button class="btn" data-act="realsignup" data-k="guru">Free teacher sign-up →</button><button class="btn ghost" data-act="realsignup" data-k="homeschool">Homeschool families →</button></div></details>`;
  }
  function realParentCard(k) {
    const linked = deviceKids().some((d) => d.sid === k.id);
    return `<section class="card realcard"><h2>👨‍👩‍👧 ${linked ? `These are ${esc(k.name)}'s results on this device` : 'This is a sample report'}</h2>
      <p class="small">${linked ? `This report contains the assessment, practice, and games ${esc(k.name)} did while trying as a student on this device.` : 'This report uses sample data.'} If your child already uses Metiq at school, ask the teacher for the <b>parent code</b> (6 letters/digits), then tap <b>Log out</b> and enter that code under <i>I'm a parent</i>. The real report will connect on any phone.</p>
      <div class="row-btn left"><button class="btn sm" data-act="realsignup" data-k="ortu">Request a parent account →</button><button class="btn sm ghost" data-act="logout">Exit demo mode</button></div></section>`;
  }

  /* ---------- Pengajuan akun sungguhan (disetujui super admin) ---------- */
  const REQ = {
    guru: { icon: '👩‍🏫', title: 'Teacher', desc: 'Free and active right away, with no approval needed. For school teachers, tutors, or anyone who teaches math.' },
    homeschool: { icon: '🏡', title: 'Homeschool families', desc: 'Free: sign up as a teacher, then add your children in the Students tab.' },
    ortu: { icon: '👨‍👩‍👧', title: 'Parent', desc: 'Your child is already learning with a teacher on Metiq. One account to see all your children\'s reports.' },
    siswa: { icon: '🧒', title: 'Student', desc: 'No class code from a teacher yet. The Metiq admin will place you in a suitable class.' },
  };
  const myRequests = () => ls.get('metiq_requests', []);
  function saveRequest(r, name) { const list = myRequests().filter((x) => x.code !== r.code); list.unshift({ code: r.code, kind: r.kind, name: name || '', at: Date.now() }); ls.set('metiq_requests', list.slice(0, 10)); }
  function viewRequestChooser() {
    app.innerHTML = shell(`<a class="back" href="#/">← Back</a><h1>✋ Request a Metiq account</h1>
      <p class="muted">Real accounts save data on the server and can be opened from any phone. Each request is reviewed by a Metiq admin, usually within 1–2 days.</p>
      <div class="glist">${Object.entries(REQ).filter(([k]) => (PARENTS_ON || k !== 'ortu') && k !== 'siswa').map(([k, r]) => `<a class="card gitem" href="${k === 'guru' || k === 'homeschool' ? '#/guru/daftar' : '#/ajukan/' + k}"><span class="gicon g-pasangan">${r.icon}</span><span class="grow"><b>${r.title}</b><small>${r.desc}</small></span>→</a>`).join('')}</div>
      <a class="card gitem" href="#/harga"><span class="gicon g-garis">🏫</span><span class="grow"><b>School (many classes)</b><small>School plan: school dashboards and reports, admins manage teachers, pre- and post-assessments.</small></span>→</a> <a class="card gitem" href="#/siswa-baru"><span class="gicon g-garis">🧒</span><span class="grow"><b>Student</b><small>No request needed. Start learning right away with a name, then join a class with a code from your teacher.</small></span>→</a>
      <p class="center small"><a href="#/ajukan/status">Already requested? Check status →</a></p>`);
  }
  function viewRequestForm(kind) {
    if ((kind === 'guru' || kind === 'homeschool') && cloudOn()) return go('#/guru/daftar');
    if (kind === 'ortu' && !PARENTS_ON) return go('#/ajukan');
    if (kind === 'siswa') return go('#/siswa-baru');
    const r = REQ[kind]; if (!r) return go('#/ajukan');
    const t = tryInfo() || {}, nm = t.name || '';
    const acct = `<label>Email<input name="email" type="email" required autocomplete="email"></label>
      <label>Password for logging in later (at least 8 characters)<input name="pass" type="password" minlength="8" required autocomplete="new-password"></label>
      <label>WhatsApp number <small class="muted">(optional, so the admin can contact you)</small><input name="contact" inputmode="tel" maxlength="20" placeholder="08…"></label>`;
    const fields = {
      guru: `<div class="kindwarn"><b>👨‍👩‍👧 Are you a parent?</b> Teacher accounts are only for those teaching a class at a school or kuttab. Choose what fits:
          <ul><li>Your child already learns with a teacher on Metiq → <a href="#/ajukan/ortu">Parent</a> (or just ask the teacher for a <b>parent code</b>)</li>
          <li>Your child doesn't have a class yet → <a href="#/ajukan/siswa">Student</a></li>
          <li>Teaching your own children at home → <a href="#/ajukan/homeschool">Homeschool families</a></li></ul></div>
        <label>Teacher name<input name="name" required maxlength="80" value="${esc(nm)}" placeholder="e.g. Ms. Rina"></label>${acct}
        <label>School / kuttab name<input name="school" required maxlength="100" placeholder="e.g. Harapan Bangsa Elementary"></label>
        <label>First class name<input name="className" maxlength="60" placeholder="e.g. Class 3A"></label>`,
      homeschool: `<label>Parent's name<input name="name" required maxlength="80" value="${esc(nm)}" placeholder="e.g. Ms. Sinta"></label>${acct}
        <label>Family name<input name="school" required maxlength="100" placeholder="e.g. Rahman Family"></label>
        <label>Children's names <small class="muted">(one name per line; student accounts are created automatically)</small><textarea name="children" rows="3" maxlength="400" placeholder="Raka&#10;Nadia">${esc((deviceKids() || []).map((d) => d.name).join('\n'))}</textarea></label>`,
      ortu: `<label>Parent's name<input name="name" required maxlength="80" value="${esc(nm)}" placeholder="e.g. Bima's father"></label>${acct}
        <label>Child's name and school <small class="muted">(optional)</small><input name="school" maxlength="100" placeholder="e.g. Bima, Grade 2 Kuttab Al-Ghazali"></label>
        <p class="small muted">After approval, add your child with the <b>parent code</b> from the teacher. If your child has no teacher on Metiq yet, choose the Student or Homeschool family request.</p>`,
      siswa: `<label>Student name<input name="name" required maxlength="80" value="${esc(deviceKids().length ? deviceKids()[0].name : nm)}" placeholder="e.g. Raka"></label>
        <label>Age<select name="age">${[6, 7, 8, 9, 10, 11, 12].map((a) => `<option value="${a}">${a}${a === 12 ? '+' : ''} years old</option>`).join('')}</select></label>
        <label>Current school / kuttab <small class="muted">(optional)</small><input name="school" maxlength="100" placeholder="e.g. MI Al-Ikhlas"></label>
        <label>Parent's WhatsApp number or email<input name="contact" required maxlength="120" placeholder="08… or email"></label>`,
    }[kind];
    app.innerHTML = shell(`<a class="back" href="#/ajukan">← Choose account type</a>
      <section class="card narrow"><div class="bigemoji center">${r.icon}</div><h1 class="center">Request an account: ${r.title}</h1><p class="muted small center">${r.desc}</p>
        <form data-form="request" data-k="${kind}" class="form">${fields}
          <label>Note for the admin <small class="muted">(optional)</small><textarea name="note" rows="2" maxlength="300"></textarea></label>
          ${kind === 'guru' ? '<label class="cb"><input type="checkbox" name="isteacher" required> <span>I\'m a teacher who teaches a class at a school or kuttab (not a student\'s parent).</span></label>' : ''}
          ${kind === 'guru' ? '<details class="small"><summary>Have a Metiq admin code?</summary><label>Admin code<input name="admin" autocomplete="off" autocapitalize="characters"></label></details>' : ''}
          <button class="btn">Send request</button></form>
        <p class="small muted center">Demo data doesn't carry over. After sending, you'll get a <b>request code</b> to check the status.</p></section>`);
  }
  async function submitRequest(f, fd) {
    if (!Cloud.enabled) return toast('Requests need a connection to the Metiq server');
    const kind = f.dataset.k, btn = f.querySelector('button.btn'); if (btn) btn.disabled = true;
    const fail = (e) => { if (btn) btn.disabled = false; toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); };
    const name = String(fd.get('name') || '').trim();
    try {
      let r;
      if (kind === 'guru' && String(fd.get('admin') || '').trim()) {
        r = await Cloud.rpc('teacher_register', { p_name: name, p_email: fd.get('email'), p_password: fd.get('pass'), p_class_name: fd.get('className') || 'Grade 1', p_admin_code: String(fd.get('admin')).trim() });
        if (r.token) { session.set({ role: 'guru', id: r.teacherId, token: r.token }); return go('#/guru/kelola'); }
      } else {
        const details = { note: fd.get('note') || '' };
        if (kind === 'guru') details.className = fd.get('className') || '';
        if (kind === 'homeschool') { details.children = String(fd.get('children') || '').split(/[\n,]/).map((x) => x.trim()).filter(Boolean).slice(0, 10); details.className = 'Grade ' + String(fd.get('school') || name).trim(); }
        if (kind === 'siswa') details.age = +fd.get('age');
        if (kind !== 'siswa' && tryInfo()) details.trial = (tryInfo() || {}).vid;
        r = await Cloud.rpc('request_submit', { p_kind: kind, p_name: name, p_email: kind === 'siswa' ? null : fd.get('email'), p_password: kind === 'siswa' ? null : fd.get('pass'), p_contact: fd.get('contact') || null, p_school: fd.get('school') || null, p_details: details });
      }
      saveRequest(r, name); session.set({}); toast('Request sent ✔'); go('#/ajukan/status/' + r.code);
    } catch (e) {
      // server belum menjalankan SQL 008: guru dan orang tua tetap bisa mendaftar dengan cara lama (langsung aktif)
      if (e.status === 404 && (kind === 'guru' || kind === 'ortu')) {
        try {
          if (kind === 'guru') { const r = await Cloud.rpc('teacher_register', { p_name: name, p_email: fd.get('email'), p_password: fd.get('pass'), p_class_name: fd.get('className') || 'Grade 1' }); session.set({ role: 'guru', id: r.teacherId, token: r.token }); return go('#/guru/kelola'); }
          const r = await Cloud.rpc('parent_register', { p_name: name, p_email: fd.get('email'), p_password: fd.get('pass') }); session.set({ role: 'ortu', ptoken: r.token, pid: r.parentId }); return go('#/ortu/anak');
        } catch (e2) { return fail(e2); }
      }
      if (e.status === 404) { if (btn) btn.disabled = false; return toast('The server can\'t accept this request yet. Try again later or contact the Metiq admin.'); }
      fail(e);
    }
  }
  async function viewRequestStatus(code) {
    const codes = [...new Set([code, ...myRequests().map((x) => x.code)].filter(Boolean))];
    app.innerHTML = shell(`<a class="back" href="#/ajukan">← Request an account</a><h1>📨 Request status</h1><div id="reqlist">${codes.length ? loadingHTML : ''}</div>
      <section class="card"><h2>Check with a request code</h2><form data-form="reqcheck" class="form inline"><input name="code" class="codein sm" maxlength="8" autocapitalize="characters" placeholder="ABCD2345" required><button class="btn">Check</button></form></section>`);
    if (!codes.length) return;
    const rows = await Promise.all(codes.map((c) => Cloud.rpc('request_status', { p_code: c }).catch(() => null)));
    const box = document.getElementById('reqlist'); if (!box) return;
    box.innerHTML = rows.map((r, i) => {
      if (!r) return `<section class="card"><p>Code <b class="code">${esc(codes[i])}</b> not found.</p></section>`;
      const k = REQ[r.kind] || {}, res = r.result || {}, badge = { menunggu: '⏳ Waiting for approval', disetujui: '✅ Approved', ditolak: '❌ Not approved' }[r.status];
      let next = '';
      if (r.status === 'menunggu') next = '<p class="small muted">The Metiq admin will review your request. Open this page again later; your request code is saved on this device.</p>';
      if (r.status === 'disetujui' && (r.kind === 'guru' || r.kind === 'homeschool')) next = `<p>Please log in with the email and password you created. Your class: <b>${esc(res.className || '')}</b> · class code <b class="code">${esc(res.classCode || '')}</b>${res.schoolName ? ` · ${esc(res.schoolName)}` : ''}.</p>${(res.children || []).length ? `<p class="small">Child's account: ${res.children.map((c) => `${esc(c.name)} (parent code <b class="code">${esc(c.parentCode)}</b>)`).join(' · ')}</p>` : ''}<div class="row-btn left"><a class="btn" href="#/guru/masuk">Log in as a teacher →</a></div>`;
      if (r.status === 'disetujui' && r.kind === 'ortu') next = '<p>Please log in with the email and password you created, then add your child with the parent code from the teacher.</p><div class="row-btn left"><a class="btn" href="#/ortu">Log in as a parent →</a></div>';
      if (r.status === 'disetujui' && r.kind === 'siswa') next = `<p>${res.classCode ? `Your class: <b>${esc(res.className || '')}</b>.` : 'You can start learning right away; no class needed yet.'} Save this code:</p><div class="kpis"><div class="kpi"><small>${res.classCode ? 'Class code (for students)' : 'Learning code (for students)'}</small><b class="code">${esc(res.classCode || res.learnCode || '')}</b></div><div class="kpi"><small>Parent code</small><b class="code">${esc(res.parentCode || '')}</b></div></div><div class="row-btn left"><button class="btn" data-act="reqlogin" data-r="${esc(JSON.stringify({ studentId: res.studentId, classCode: res.classCode || res.learnCode }))}">Log in as ${esc(res.studentName || r.name)} →</button></div>`;
      if (r.status === 'ditolak') next = `<p class="small">${r.note ? 'Admin\'s note: ' + esc(r.note) : 'Contact the Metiq admin if you have questions.'}</p>`;
      return `<section class="card reqcard ${r.status}"><div class="lrow"><span class="gicon g-pasangan">${k.icon || '✋'}</span><span class="grow"><b>${esc(r.name)}</b><small>${k.title || r.kind} · code <b class="code">${esc(r.code)}</b> · ${ftime(r.createdAt)}</small></span></div><p><b>${badge}</b></p>${next}</section>`;
    }).join('');
  }

  /* ---------- Super admin: pengajuan, sekolah, dan guru di semua sekolah ---------- */
  let SUP = null;
  async function loadSuper(ctx, sub) {
    const box = document.getElementById('super-box'); if (!box) return;
    try {
      const tok = session.get().token;
      const [ov, rq, parents, plans, quotes, students] = await Promise.all([Cloud.rpc('super_overview', { p_token: tok }), Cloud.rpc('super_requests', { p_token: tok }), Cloud.rpc('super_parents', { p_token: tok }).catch(() => []), Cloud.rpc('super_school_plans', { p_token: tok }).catch(() => null), Cloud.rpc('super_quotes', { p_token: tok }).catch(() => null), Cloud.rpc('super_students', { p_token: tok }).catch(() => null)]);
      SUP = { ov, rq, ctx, parents, plans, quotes, students };
      if (document.getElementById('super-box')) { box.innerHTML = superHTML(sub); renderSupStudents(); }
    } catch (e) {
      box.innerHTML = e.status === 404 ? emptyCard('Needs SQL 008 to be run', 'Run supabase/006_research_feedback_bbo.sql, then 008_schools_superadmin.sql in the Supabase SQL Editor.') : emptyCard('Failed to load', e.status ? esc(e.message) : 'Can\'t connect to the server.');
    }
  }
  function waLink(contact, text) {
    const d = String(contact || '').replace(/\D/g, ''); if (d.length < 9) return '';
    return `https://wa.me/${d.startsWith('0') ? '62' + d.slice(1) : d}?text=${encodeURIComponent(text)}`;
  }

  // Super admin: status paket setiap sekolah
  const planOf = (id) => (SUP && SUP.plans ? SUP.plans[id] : null);
  const planPill = (id) => { const p = planOf(id); if (!p) return '<span class="muted small">–</span>'; return p.active ? `<span class="pill ok">School${p.until ? ` · s.d. ${esc(String(p.until))}` : ''}</span>` : `<span class="pill">${p.plan === 'sekolah' ? 'Expired' : 'Free'}</span>`; };
  function planCardHTML(schools) {
    if (!SUP.plans) return '<section class="card"><h2>💳 School plan</h2><p class="muted small">Run supabase/020_paket_sekolah.sql to manage plans.</p></section>';
    const list = schools.filter((s) => s.kind === 'sekolah');
    return `<section class="card"><h2>💳 School plan</h2><p class="small muted">Activate the School plan after payment is received (${rp(PRICE)} per student per year). The plan opens the school dashboard, Manage teachers, and pre- and post-assessments for school admins.</p>
      ${list.map((s) => { const p = planOf(s.id) || {}; return `<form data-form="schoolplan" data-id="${s.id}" class="form planrow"><b>${esc(s.name)}</b><small class="muted">${s.students} students${p.students ? ` · paid ${p.students}` : ''}</small>
        <select name="plan" aria-label="${esc(s.name)} plan"><option value="gratis" ${p.plan !== 'sekolah' ? 'selected' : ''}>Free</option><option value="sekolah" ${p.plan === 'sekolah' ? 'selected' : ''}>School</option></select>
        <label>To<input name="until" type="date" value="${p.until || ''}"></label><label>Paid students<input name="students" type="number" min="0" value="${p.students || ''}" inputmode="numeric"></label>
        <input name="note" maxlength="200" placeholder="Note (e.g. paid Nov 3)" value="${esc(p.note || '')}"><button class="btn sm">Save</button></form>`; }).join('')}</section>`;
  }
  function superHTML(sub) {
    sub = ['pengajuan', 'sekolah', 'kelas', 'siswa', 'guru', 'ortu', 'penawaran'].includes(sub) ? sub : 'pengajuan';
    const { ov, rq } = SUP, pend = rq.filter((r) => r.status === 'menunggu'), schools = ov.schools || [];
    const kpi = (l, v) => `<div class="kpi"><small>${l}</small><b>${v}</b></div>`;
    const sum = (k) => schools.reduce((t, s) => t + (s[k] || 0), 0);
    const subs = [['pengajuan', `✋ Requests${pend.length ? ` (${pend.length})` : ''}`], ['sekolah', '🏫 Schools & families'], ['kelas', '📚 Classes'], ['siswa', '🧒 Students'], ['guru', '👩‍🏫 Teachers'], ['ortu', '👨‍👩‍👧 Parents'], ['penawaran', `📨 Quotes${(SUP.quotes || []).filter((q) => q.status === 'baru').length ? ` (${(SUP.quotes || []).filter((q) => q.status === 'baru').length})` : ''}`]];
    let body = '';
    if (sub === 'pengajuan') {
      const schoolOpts = (want) => `<option value="">➕ New school (name below)</option>${schools.filter((s) => s.kind === 'sekolah').map((s) => `<option value="${s.id}" ${want && s.name.toLowerCase() === want.toLowerCase() ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}`;
      const classOpts = SUP.ctx.classes.slice().sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || '') || a.name.localeCompare(b.name)).map((c) => `<option value="${c.id}">${esc(c.schoolName || 'No school')} · ${esc(c.name)}</option>`).join('');
      const card = (r) => {
        const k = REQ[r.kind] || {}, d = r.details || {};
        const info = [r.email && `📧 ${esc(r.email)}`, r.contact && r.contact !== r.email && `📱 ${esc(r.contact)}`, r.schoolName && `🏫 ${esc(r.schoolName)}`, d.className && `Class: ${esc(d.className)}`, d.age && `Age ${esc(d.age)}`, (d.children || []).length && `Child: ${d.children.map(esc).join(', ')}`, d.note && `“${esc(d.note)}”`].filter(Boolean);
        if (r.status !== 'menunggu') {
          const res = r.result || {}, msg = r.status === 'disetujui' ? `Assalamu'alaikum ${r.name}, your Metiq account request has been approved. ${res.classCode ? `Class code: ${res.classCode}. ` : ''}${res.parentCode ? `Parent code: ${res.parentCode}. ` : ''}Open https://metiqmath.com — request code: ${r.code}` : '';
          return `<div class="reqrow"><span class="grow"><b>${k.icon || ''} ${esc(r.name)}</b> <small class="muted">${k.title || r.kind} · ${r.status === 'disetujui' ? '✅ approved' : '❌ rejected'} ${ago(r.decidedAt)}${r.decidedBy ? ` by ${esc(r.decidedBy)}` : ''}</small>
            ${res.classCode ? `<small>Class code <b class="code">${esc(res.classCode)}</b>${res.parentCode ? ` · parent code <b class="code">${esc(res.parentCode)}</b>` : ''}${(res.children || []).length ? ` · child: ${res.children.map((c) => `${esc(c.name)} <b class="code">${esc(c.parentCode)}</b>`).join(', ')}` : ''}</small>` : ''}</span>
            ${msg && waLink(r.contact, msg) ? `<a class="btn sm ghost" href="${waLink(r.contact, msg)}" target="_blank" rel="noopener">Send via WhatsApp</a>` : ''}</div>`;
        }
        const extra = r.kind === 'guru' ? `<label>School<select name="school">${schoolOpts(r.schoolName)}</select></label><label>New school name<input name="schoolName" maxlength="100" value="${esc(r.schoolName || '')}"></label>
            <label>Class for this teacher<select name="classId"><option value="">➕ Create new class: ${esc(d.className || 'Grade 1')}</option>${classOpts}</select></label><label class="cb"><input type="checkbox" name="admin" value="1"> Make school admin (coordinator)</label>`
          : r.kind === 'homeschool' ? `<p class="small muted">Will be created: homeschool "${esc(r.schoolName || 'Homeschool ' + r.name)}", a family class, and student accounts for ${(d.children || []).length || 0} children.</p>`
          : r.kind === 'siswa' ? `<label>Place in class<select name="classId"><option value="">🧺 No class yet (self-study)</option>${classOpts}</select></label><p class="small muted">No class: the child gets a personal learning code and can start right away. A class can be set later in the 🧺 No class tab.</p>` : '';
        return `<section class="card reqcard menunggu"><div class="lrow"><span class="gicon g-pasangan">${k.icon || '✋'}</span><span class="grow"><b>${esc(r.name)}</b><small>${k.title || r.kind} · ${ftime(r.createdAt)} · code ${esc(r.code)}</small></span></div>
          <p class="small">${info.join(' · ')}</p>
          <form data-form="decide" data-id="${r.id}" data-kind="${r.kind}" class="form">${extra}<label>Note <small class="muted">(optional, visible to the requester)</small><input name="note" maxlength="300"></label>
            <div class="row-btn left"><button class="btn" name="go" value="1">✅ Approve</button><button class="btn ghost" name="go" value="0">Reject</button></div></form></section>`;
      };
      body = `${pend.length ? pend.map(card).join('') : '<section class="card center"><p class="muted">No requests waiting. 🎉</p></section>'}
        ${rq.length > pend.length ? `<section class="card"><h2>History</h2>${rq.filter((r) => r.status !== 'menunggu').slice(0, 60).map(card).join('')}</section>` : ''}`;
    } else if (sub === 'sekolah') {
      const max = Math.max(1, ...schools.map((s) => s.students));
      body = `<section class="card"><h2>All schools and homeschool families</h2><div class="tscroll"><table class="tbl"><thead><tr><th>Name</th><th>Type</th><th>Admin</th><th>Teacher</th><th>Grade</th><th>Student</th><th>Active 7 days</th><th>Questions 7 days</th><th>Accuracy</th><th>Plan</th><th></th></tr></thead><tbody>
        ${schools.map((s) => `<tr><td><b>${esc(s.name)}</b>${s.city ? `<small class="muted"> · ${esc(s.city)}</small>` : ''}</td><td>${s.kind === 'homeschool' ? '🏡 Homeschool' : '🏫 School'}</td><td class="wrap">${(s.admins || []).map(esc).join(', ') || '–'}</td><td>${s.teachers}</td><td>${s.classes}</td><td>${s.students}</td><td>${s.active7}/${s.students}</td><td>${fmtNum(s.answers7)}</td><td>${s.answers7 ? pct(s.correct7, s.answers7) + '%' : '–'}</td>
          <td>${planPill(s.id)}</td><td class="nowrap"><button class="link small" data-act="schooledit" data-id="${s.id}" data-n="${esc(s.name)}">Rename</button> · <button class="link small" data-act="schoolview" data-id="${s.id}">Dashboard</button> · <button class="link small danger" data-act="superdel" data-what="school" data-id="${s.id}">Delete</button></td></tr>`).join('')}
        </tbody></table></div></section>
        <section class="card vz"><h2>Students per school</h2><p class="small muted">Bar length = number of students; number = students active in the last 7 days.</p>
          ${schools.filter((s) => s.students).sort((a, b) => b.students - a.students).map((s) => `<div class="fbar"><span>${s.kind === 'homeschool' ? '🏡' : '🏫'} ${esc(s.name)}</span><i><b style="width:${Math.round((s.students / max) * 100)}%"></b></i><small>${s.active7} active / ${s.students}</small></div>`).join('') || '<p class="muted">No students yet.</p>'}</section>
        ${planCardHTML(schools)}
        <section class="card"><h2>Add school</h2><form data-form="newschool" class="form inline newschool"><input name="name" required maxlength="100" placeholder="School or homeschool family name"><select name="kind"><option value="sekolah">School</option><option value="homeschool">Homeschool</option></select><button class="btn">Add</button></form></section>`;
    } else if (sub === 'penawaran') {
      const qs = SUP.quotes;
      body = qs === null ? emptyCard('Needs SQL 020 to be run', 'Run supabase/020_paket_sekolah.sql in the Supabase SQL Editor.') : !qs.length ? emptyCard('No requests yet', 'Requests from the Pricing page appear here.')
        : qs.map((q) => { const wa = waLink(q.contact, `Assalamu'alaikum ${q.contactName}, thank you for your interest in the Metiq School plan for ${q.school}.`); return `<section class="card reqcard"><div class="lrow"><span class="grow"><b>${esc(q.school)}</b>${q.city ? ` · ${esc(q.city)}` : ''}<small>${esc(q.contactName)} · ${esc(q.contact)} · ${fdate(q.createdAt)}</small></span><span class="pill">${esc(q.status)}</span></div>
          <p class="small">${q.students ? `${q.students} students · estimated ${rp(q.students * PRICE)} per year` : ''}${q.note ? `<br>${esc(q.note)}` : ''}</p>
          <div class="row-btn left">${wa ? `<a class="btn sm" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ''}${['baru', 'dihubungi', 'selesai'].filter((x) => x !== q.status).map((x) => `<button class="btn sm ghost" data-act="quotest" data-id="${q.id}" data-s="${x}">Mark ${x}</button>`).join('')}</div></section>`; }).join('');
    } else if (sub === 'ortu') {
      const ps = SUP.parents || [];
      body = `<section class="card"><h2>Parent accounts</h2><p class="small muted">Deleting a parent account only removes the account and its link; the child's learning data remains.</p>
        ${ps.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Children</th><th>Created</th><th></th></tr></thead><tbody>
        ${ps.map((x) => `<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.email)}</td><td>${{ aktif: '✅ active', menunggu: '⏳ waiting', ditolak: '❌ rejected' }[x.status] || esc(x.status)}</td><td class="wrap">${(x.kids || []).map(esc).join(', ') || '–'}</td><td>${fdate(x.createdAt)}</td><td><button class="link small danger" data-act="superdel" data-what="parent" data-id="${x.id}">Delete</button></td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">No parent accounts yet.</p>'}</section>`;
    } else if (sub === 'siswa') {
      body = SUP.students === null ? emptyCard('SQL 023 needs to be run', 'Run supabase/023_hapus_siswa.sql in the Supabase SQL Editor.')
        : `<section class="card"><h2>All students <small class="muted">(${SUP.students.length})</small></h2>
          <p class="small muted">Find test accounts or accounts created by mistake, then delete them. Before anything is deleted, you will be asked to retype the student's name.</p>
          <div class="ungtools"><label class="ungq"><span aria-hidden="true">🔍</span><input id="sup-q" type="search" placeholder="Search by name, class, school, or code…" value="${esc(ss.get('supq', ''))}" autocomplete="off" aria-label="Search students"></label></div></section><div id="sup-list"></div>`;
    } else if (sub === 'kelas') {
      // semua kelas di semua sekolah, dengan pilihan guru kelasnya
      const sname = (id) => (schools.find((x) => x.id === id) || {}).name || 'No school';
      const teachers = (ov.teachers || []).slice().sort((a, b) => sname(a.schoolId).localeCompare(sname(b.schoolId)) || a.name.localeCompare(b.name));
      const classes = SUP.ctx.classes.slice().sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || '') || a.name.localeCompare(b.name, 'id', { numeric: true }));
      const tOpts = (sel) => teachers.map((t) => `<option value="${t.id}" ${t.id === sel ? 'selected' : ''}>${esc(t.name)} · ${esc(sname(t.schoolId))}</option>`).join('');
      body = `<section class="card"><h2>Teacher of each class</h2>
        <p class="small muted">Choose a teacher for a class. That teacher can immediately open the class, its students, and its tasks. The class's school follows the teacher's school. New teachers must have an active account first (through a request or added in the 👩‍🏫 Teachers tab).</p>
        <div class="tscroll"><table class="tbl"><thead><tr><th>School</th><th>Grade</th><th>Code</th><th>Student</th><th>Teacher</th><th></th></tr></thead><tbody>
        ${classes.map((c) => `<tr><td>${esc(c.schoolName || 'No school')}</td><td><b>${esc(c.name)}</b></td><td><b class="code">${esc(c.code)}</b></td><td>${S.studentsOf(c.id).length}</td>
          <td><select data-act="classteacher" data-c="${c.id}" data-was="${c.teacherId}" aria-label="Teacher ${esc(c.name)}">${tOpts(c.teacherId)}</select></td><td><button class="link small danger" data-act="delclass" data-id="${c.id}">Delete</button></td></tr>`).join('')}
        </tbody></table></div></section>`;
    } else {
      const opts = (sel) => `<option value="">— no school —</option>${schools.map((s) => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}`;
      body = `<section class="card"><h2>Teachers across all schools</h2><p class="small muted">Move a teacher to another school or make them a school admin (coordinator). School admins see all classes in their school.</p><div class="tscroll"><table class="tbl"><thead><tr><th>Name</th><th>Email</th><th>Grade</th><th>School</th><th>School admin</th><th></th></tr></thead><tbody>
        ${(ov.teachers || []).map((t) => `<tr><td><b>${esc(t.name)}</b>${t.isSuper ? ' <span class="pill">Super admin</span>' : ''}</td><td>${esc(t.email)}</td><td>${t.classes}</td><td><select data-act="teacherset" data-id="${t.id}" data-f="school">${opts(t.schoolId)}</select></td><td><label class="cb"><input type="checkbox" data-act="teacherset" data-id="${t.id}" data-f="admin" ${t.isSchoolAdmin ? 'checked' : ''}> admin</label></td><td>${t.isSuper ? '' : `<button class="link small danger" data-act="superdel" data-what="teacher" data-id="${t.id}">Delete</button>`}</td></tr>`).join('')}
        </tbody></table></div></section>`;
    }
    return `<div class="kpis">${kpi('Schools · homeschool', `${schools.filter((s) => s.kind === 'sekolah').length}<span> · ${schools.filter((s) => s.kind === 'homeschool').length}</span>`)}${kpi('Teachers · classes', `${(ov.teachers || []).length}<span> · ${sum('classes')}</span>`)}${kpi('Students · active 7 days', `${sum('students')}<span> · ${sum('active7')}</span>`)}${kpi('Parents · requests', `${ov.parents}<span> · ${ov.pending}⏳</span>`)}</div>
      <nav class="subtabs">${subs.map(([k, l]) => `<a href="#/guru/super/${k}" class="${k === sub ? 'on' : ''}">${l}</a>`).join('')}</nav>${body}`;
  }
  // Hanya tabel yang digambar ulang saat mengetik, agar kotak pencarian tidak kehilangan kursor
  const SUP_MAX = 50;
  function renderSupStudents() {
    const box = document.getElementById('sup-list'); if (!box || !SUP || !SUP.students) return;
    const q = fold(ss.get('supq', '').trim());
    const list = SUP.students.filter((k) => !q || [k.name, k.className, k.schoolName, k.code, k.parentCode].some((v) => fold(v).includes(q)));
    const row = (k) => `<tr><td class="ungname"><div class="ungn"><span class="av">${avHTML(k.avatar || '🦁')}</span><span><b>${esc(k.name)}</b><small>Started ${ftime(k.createdAt)}</small></span></div></td>
      <td class="wrap">${esc(studentPlace(k))}</td><td><b class="code">${esc(k.code || '–')}</b></td><td><b class="code">${esc(k.parentCode || '–')}</b></td><td class="num">${k.att}</td><td class="num">${k.att ? pct(k.ok, k.att) + '%' : '–'}</td><td>${ago(k.lastTs)}</td>
      <td><button class="link small danger" data-act="superdel" data-what="student" data-id="${k.id}">Delete</button></td></tr>`;
    box.innerHTML = !list.length ? emptyCard('Not found', q ? `No student matches "<b>${esc(ss.get('supq', '').trim())}</b>".` : 'No students yet.')
      : `<section class="card"><p class="small muted">Showing ${Math.min(SUP_MAX, list.length)} of ${list.length} students, newest first.${list.length > SUP_MAX ? ' Type in the search box to narrow it down.' : ''}</p>
        <div class="tscroll"><table class="tbl ungtbl"><thead><tr><th>Student</th><th>Place</th><th>Learning code</th><th>Parent code</th><th>Total questions</th><th>Accuracy</th><th>Last active</th><th></th></tr></thead>
        <tbody>${list.slice(0, SUP_MAX).map(row).join('')}</tbody></table></div></section>`;
  }
  const studentPlace = (k) => (k.className ? (k.schoolName ? k.schoolName + ' · ' : '') + k.className : 'No class');
  async function superDecide(f, fd, btn) {
    const approve = !btn || btn.value !== '0';
    const kind = f.dataset.kind;
    if (!approve && !confirm('Reject this request?')) return;
    f.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    try {
      const r = await Cloud.rpc('super_decide', { p_token: session.get().token, p_request_id: f.dataset.id, p_approve: approve, p_school_id: fd.get('school') || null, p_school_name: fd.get('schoolName') || null, p_make_admin: fd.get('admin') === '1', p_class_id: fd.get('classId') || null, p_note: fd.get('note') || null });
      toast(approve ? `Approved ✔${r.classCode ? ` · class code ${esc(r.classCode)}` : r.learnCode ? ` · learning code ${esc(r.learnCode)}` : ''}${r.parentCode ? ` · parent code ${esc(r.parentCode)}` : ''}` : 'Request rejected');
      await ensure(true); route();
    } catch (e) { f.querySelectorAll('button').forEach((b) => { b.disabled = false; }); toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  // Admin: siswa yang belum punya kelas (mulai sendiri atau disetujui tanpa kelas), beserta kodenya
  let UNG = null;
  async function loadUngrouped(ctx) {
    const box = document.getElementById('ung-box'); if (!box) return;
    try {
      UNG = await Cloud.rpc('admin_ungrouped', { p_token: session.get().token });
      if (!document.getElementById('ung-box')) return;
      renderUngrouped(ctx);
    } catch (e) { box.innerHTML = emptyCard('Can\'t load', e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  // Keadaan anak tanpa kelas menurut aktivitasnya
  const ungState = (k) => (!k.att ? 'belum' : k.lastTs && Date.now() - k.lastTs > 14 * DAY ? 'diam' : k.week ? 'aktif' : 'jeda');
  const UNG_F = [['semua', 'All'], ['aktif', '🟢 Active this week'], ['jeda', '🟡 Paused 7–14 days'], ['diam', '🔴 Inactive >14 days'], ['belum', '⚪ Not started']];
  const UNG_PER = 15, UNG_SEL = new Set(); // anak per halaman; anak yang dicentang tetap tercentang antarhalaman
  const skillWhere = (id) => { const sk = SKILLS[id]; if (!sk) return ''; const u = UNITS.find((x) => x.id === sk.unit); return `${gname(sk.grade)} · ${u ? u.icon + ' ' + u.name : sk.unit}`; };
  const ungGrade = (k) => (SKILLS[k.lastSkill] ? String(SKILLS[k.lastSkill].grade) : 'none');
  const UNG_SORT = [['aktif', 'Most recently active'], ['aktiflama', 'Longest inactive'], ['baru', 'Newest sign-ups'], ['lama', 'Oldest sign-ups'], ['nama', 'Name A–Z'], ['minggu', 'Most questions this week'], ['total', 'Most questions overall'], ['tepat', 'Lowest accuracy']];
  const UNG_CMP = {
    aktif: (a, b) => (b.lastTs || 0) - (a.lastTs || 0) || b.createdAt - a.createdAt,
    aktiflama: (a, b) => (a.lastTs || 0) - (b.lastTs || 0) || a.createdAt - b.createdAt,
    lama: (a, b) => a.createdAt - b.createdAt,
    nama: (a, b) => a.name.localeCompare(b.name, 'en'),
    minggu: (a, b) => (b.week || 0) - (a.week || 0),
    total: (a, b) => (b.att || 0) - (a.att || 0),
    tepat: (a, b) => (a.att ? a.ok / a.att : 2) - (b.att ? b.ok / b.att : 2),
    baru: (a, b) => b.createdAt - a.createdAt,
  };
  // huruf kecil tanpa tanda baca/aksen, agar "Haeqal" cocok dengan "haeq" dan kode cocok tanpa memedulikan huruf besar
  const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function renderUngrouped(ctx) {
    const box = document.getElementById('ung-box'); if (!box || !UNG) return;
    const all = UNG, f = ss.get('ungf', 'semua'), cnt = (st) => all.filter((k) => ungState(k) === st).length;
    const g = ss.get('ungg', ''), sort = ss.get('ungs', 'aktif');
    const grades = [...new Set(all.map(ungGrade))].sort((a, b) => (a === 'none') - (b === 'none') || +a - +b);
    box.innerHTML = `<section class="card"><h2>🧺 Students without a class <small class="muted">(${all.length})</small></h2>
        <div class="kpis ungsum"><div class="kpi"><small>Active this week</small><b>${cnt('aktif')}</b></div><div class="kpi"><small>Paused 7–14 days</small><b>${cnt('jeda')}</b></div><div class="kpi"><small>Inactive >14 days</small><b>${cnt('diam')}</b></div><div class="kpi"><small>Not started</small><b>${cnt('belum')}</b></div><div class="kpi"><small>Questions this week</small><b>${all.reduce((n, k) => n + (k.week || 0), 0)}</b></div></div>
        <div class="tsub ungf">${UNG_F.map(([v, l]) => `<button class="${f === v ? 'on' : ''}" data-act="ungf" data-v="${v}">${l}${v === 'semua' ? '' : ` (${cnt(v)})`}</button>`).join('')}</div>
        <div class="ungtools"><label class="ungq"><span aria-hidden="true">🔍</span><input id="ung-q" type="search" placeholder="Search name, learning code, parent code…" value="${esc(ss.get('ungq', ''))}" autocomplete="off" aria-label="Search students"></label>
          <select data-act="ungsel" data-k="ungg" aria-label="Filter by level"><option value="">All levels</option>${grades.map((x) => `<option value="${x}" ${x === g ? 'selected' : ''}>${x === 'none' ? 'No questions done yet' : esc(gname(+x))} (${all.filter((k) => ungGrade(k) === x).length})</option>`).join('')}</select>
          <select data-act="ungsel" data-k="ungs" aria-label="Sort">${UNG_SORT.map(([v, l]) => `<option value="${v}" ${v === sort ? 'selected' : ''}>Sort: ${l}</option>`).join('')}</select></div>
        <p class="small muted">Children who started on their own or were approved without a class. Students log in with a learning code ("I already have a code" menu); parents see reports at <b>#/ortu</b> with a parent code or family code.</p>
        <p class="small"><b>👨‍👩‍👧 Siblings?</b> Check the children, then create one family code for the parent.</p><button class="btn sm" data-act="famset">Create a family code for those checked</button></section><div id="ung-list"></div>`;
    renderUngList(ctx);
  }
  // Hanya tabel yang digambar ulang saat mengetik, agar kotak pencarian tidak kehilangan kursor
  function renderUngList(ctx) {
    const box = document.getElementById('ung-list'); if (!box || !UNG) return;
    const all = UNG, f = ss.get('ungf', 'semua'), g = ss.get('ungg', ''), q = fold(ss.get('ungq', '').trim()), sort = UNG_CMP[ss.get('ungs', 'aktif')] || UNG_CMP.aktif;
    const hit = (k) => !q || [k.name, k.code, k.parentCode, k.familyCode].some((v) => fold(v).includes(q));
    const list = all.filter((k) => (f === 'semua' || ungState(k) === f) && (!g || ungGrade(k) === g) && hit(k)).sort(sort);
    {
      const opts = ctx.classes.slice().sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || '') || a.name.localeCompare(b.name)).map((c) => `<option value="${c.id}">${c.schoolName ? esc(c.schoolName) + ' · ' : ''}${esc(c.name)}</option>`).join('');
      // satu baris tabel per anak; tabel bisa digeser ke samping, kolom nama tetap terlihat
      const row = (k) => `<tr><td class="ungname"><div class="ungn"><label class="famchk" title="Select for family code"><input type="checkbox" data-fam="${k.id}" ${UNG_SEL.has(k.id) ? 'checked' : ''} aria-label="Select ${esc(k.name)} for family code"></label><span class="av">${avHTML(k.avatar || '🦁')}</span><span><a href="#/guru/tanpa/${k.id}" title="View report"><b>${esc(k.name)}</b></a><small>Started ${ftime(k.createdAt)}</small></span></div></td>
        <td><span class="pill ung-${ungState(k)}">${{ aktif: 'Active', jeda: 'Pause', diam: 'Inactive', belum: 'Not started' }[ungState(k)]}</span></td><td>${ago(k.lastTs)}</td><td class="num">${k.week || 0}</td><td class="num">${k.att || 0}</td><td class="num">${k.att ? pct(k.ok, k.att) + '%' : '–'}</td><td class="num">${k.mastered || 0}</td>
        <td class="wrap small">${k.lastSkill ? esc(skillWhere(k.lastSkill)) : '<span class="muted">–</span>'}</td>
        <td><b class="code">${esc(k.code || '–')}</b></td><td><b class="code">${esc(k.parentCode || '–')}</b></td><td>${k.familyCode ? `<b class="code">${esc(k.familyCode)}</b> <button class="link small" data-act="famdel" data-id="${k.id}">Unlink</button>` : '<span class="muted">–</span>'}</td>
        <td><form data-form="assignkid" data-id="${k.id}" class="form inline"><select name="classId" required aria-label="Class for ${esc(k.name)}"><option value="">— choose a class —</option>${opts}</select><button class="btn sm">Add</button></form></td>
        <td><button class="link small danger" data-act="superdel" data-what="student" data-id="${k.id}">Delete</button></td></tr>`;
      const pages = Math.max(1, Math.ceil(list.length / UNG_PER)), p = Math.min(Math.max(1, ss.get('ungp', 1)), pages), from = (p - 1) * UNG_PER;
      const nums = [...Array(pages)].map((_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - p) <= 2);
      const pager = pages < 2 ? '' : `<nav class="pager" aria-label="Page"><button class="btn sm ghost" data-act="ungp" data-p="${p - 1}" ${p === 1 ? 'disabled' : ''}>← Previous</button>${nums.map((n, i) => `${i && n - nums[i - 1] > 1 ? '<span class="muted">…</span>' : ''}<button class="btn sm ${n === p ? '' : 'ghost'}" data-act="ungp" data-p="${n}" ${n === p ? 'aria-current="page"' : ''}>${n}</button>`).join('')}<button class="btn sm ghost" data-act="ungp" data-p="${p + 1}" ${p === pages ? 'disabled' : ''}>Next →</button></nav>`;
      const table = `<section class="card"><p class="small muted">Showing ${from + 1}–${Math.min(from + UNG_PER, list.length)} of ${list.length} children · scroll the table sideways to see codes and classes · click a name for the report.</p>
        <div class="tscroll"><table class="tbl ungtbl"><thead><tr><th>Student</th><th>Status</th><th>Last active</th><th>Questions this week</th><th>Total questions</th><th>Accuracy</th><th>Proficient</th><th>Currently at</th><th>Learning code</th><th>Parent code</th><th>Family code</th><th>Add to class</th><th></th></tr></thead>
        <tbody>${list.slice(from, from + UNG_PER).map(row).join('')}</tbody></table></div>${pager}</section>`;
      const filtered = f !== 'semua' || g || q;
      box.innerHTML = list.length ? table : !all.length ? emptyCard('None yet', 'All students already have a class.')
        : emptyCard('Not found', `${q ? `No children match "<b>${esc(ss.get('ungq', '').trim())}</b>"` : 'No children'}${filtered ? ' with this filter' : ''}. <button class="link" data-act="ungreset">Clear search and filters</button>`);
    }
  }
  // Laporan satu siswa tanpa kelas untuk admin: kemajuan per bab dan jawaban terakhir
  async function loadStudentReport(ctx, sid) {
    const box = document.getElementById('ung-box'); if (!box) return;
    try {
      const r = await Cloud.rpc('admin_student_report', { p_token: session.get().token, p_student_id: sid });
      if (!document.getElementById('ung-box')) return;
      box.innerHTML = studentReportHTML(ctx, r);
    } catch (e) { box.innerHTML = e.status === 404 ? emptyCard('Needs SQL 021 to be run', 'Run supabase/021_pantau_tanpa_kelas.sql in the Supabase SQL Editor.') : emptyCard('Can\'t load', e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  function studentReportHTML(ctx, r) {
    const k = r.student, P = r.progress.filter((p) => SKILLS[p.skill]), A = r.answers, att = P.reduce((n, p) => n + p.att, 0), ok = P.reduce((n, p) => n + p.ok, 0), lastTs = Math.max(0, ...P.map((p) => p.last), ...A.map((a) => a.ts));
    const byGrade = {};
    P.forEach((p) => { const sk = SKILLS[p.skill], g = (byGrade[sk.grade] = byGrade[sk.grade] || {}); (g[sk.unit] = g[sk.unit] || []).push(p); });
    const grades = Object.keys(byGrade).map(Number).sort((a, b) => a - b), last = P[0];
    const opts = ctx.classes.slice().sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || '') || a.name.localeCompare(b.name)).map((c) => `<option value="${c.id}">${c.schoolName ? esc(c.schoolName) + ' · ' : ''}${esc(c.name)}</option>`).join('');
    const unitCard = (uid, ps) => { const u = UNITS.find((x) => x.id === uid) || { name: uid, icon: '📘', skills: [] };
      return `<details class="skd"><summary class="lrow"><span class="grow"><b>${u.icon} ${esc(u.name)}</b><small>${ps.filter((p) => p.score >= 80).length}/${u.skills.length || ps.length} proficient · ${ps.reduce((n, p) => n + p.att, 0)} questions</small></span></summary>
        ${ps.sort((a, b) => SKILLS[a.skill].code.localeCompare(SKILLS[b.skill].code, undefined, { numeric: true })).map((p) => `<div class="lrow"><span class="grow">${SKILLS[p.skill].code} ${esc(SKILLS[p.skill].name)}<small>${p.att} questions · ${pct(p.ok, p.att)}% correct · ${ago(p.last)}</small></span>${chip(p.score)}</div>`).join('')}</details>`; };
    return `<p><a href="#/guru/tanpa">← All students without a class</a></p>
      <section class="card"><div class="lrow"><span class="av">${avHTML(k.avatar || '🦁')}</span><span class="grow"><b class="big">${esc(k.name)}</b><small>Started ${ftime(k.createdAt)} · learning code <b>${esc(k.code || '–')}</b> · parent code <b>${esc(k.parentCode || '–')}</b></small></span></div>
        <div class="kpis ungsum"><div class="kpi"><small>Last active</small><b>${ago(lastTs)}</b></div><div class="kpi"><small>Total questions</small><b>${att}</b></div><div class="kpi"><small>Accuracy</small><b>${att ? pct(ok, att) + '%' : '–'}</b></div><div class="kpi"><small>Proficient skills</small><b>${P.filter((p) => p.score >= 80).length}</b></div><div class="kpi"><small>Skills tried</small><b>${P.length}</b></div></div>
        ${last ? `<p class="small">Last worked on <b>${SKILLS[last.skill].code} ${esc(SKILLS[last.skill].name)}</b> (${esc(skillWhere(last.skill))}).</p>` : '<p class="muted small">No questions done yet.</p>'}
        ${k.classId ? '<p class="small muted">This child now has a class.</p>' : `<form data-form="assignkid" data-id="${k.id}" class="form inline"><select name="classId" required aria-label="Class for ${esc(k.name)}"><option value="">— choose a class —</option>${opts}</select><button class="btn">Add to class</button></form>`}</section>
      ${grades.map((g) => `<section class="card"><h2>${esc(gname(g))}</h2>${Object.entries(byGrade[g]).map(([uid, ps]) => unitCard(uid, ps)).join('')}</section>`).join('')}
      <section class="card"><h2>📝 Last ${A.length} answers</h2>${A.length ? A.map((a) => `<div class="lrow"><span>${a.ok ? '✅' : '❌'}</span><span class="grow">${SKILLS[a.skill] ? `<b>${SKILLS[a.skill].code}</b> ` : ''}${esc(String(a.text || '').replace(/<[^>]*>/g, ' ').slice(0, 90))}<small>${a.ok ? '' : `Answered ${esc(a.given || '–')}, should be ${esc(a.answer || '–')} · `}${ftime(a.ts)}${a.ms ? ` · ${Math.round(a.ms / 1000)} sec` : ''}</small></span></div>`).join('') : '<p class="muted">No answers yet.</p>'}</section>`;
  }
  async function famSet() {
    const ids = [...UNG_SEL];
    if (ids.length < 2) return toast('Check at least 2 children from one family');
    try { const r = await Cloud.rpc('admin_family_set', { p_token: session.get().token, p_student_ids: ids }); toast(`Family code ${esc(r.familyCode)} for ${r.count} children ✔`); UNG_SEL.clear(); route(); }
    catch (e) { toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  async function famDel(id) {
    if (!confirm('Remove this child from the family code?')) return;
    try { await Cloud.rpc('admin_family_remove', { p_token: session.get().token, p_student_id: id }); toast('Removed from family ✔'); route(); }
    catch (e) { toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  async function assignKid(f, fd) {
    const b = f.querySelector('button'); if (b) b.disabled = true;
    try {
      await Cloud.rpc('admin_assign_student', { p_token: session.get().token, p_student_id: f.dataset.id, p_class_id: fd.get('classId') });
      toast('Student added to class ✔'); await ensure(true); route();
    } catch (e) { if (b) b.disabled = false; toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  async function sendQuote(f, fd) {
    const b = f.querySelector('button'); b.disabled = true;
    try {
      await Cloud.rpc('school_quote_send', { p_school: fd.get('school'), p_city: fd.get('city'), p_students: +fd.get('students') || null, p_contact_name: fd.get('name'), p_contact: fd.get('contact'), p_note: fd.get('note') });
      f.outerHTML = '<p class="ok-note">✔ Thank you! Your request was sent. The Metiq team will contact you using the details you wrote.</p>';
    } catch (e) { b.disabled = false; toast(e.status === 404 ? 'The form isn\'t active yet. Please contact Metiq directly.' : e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  async function superNewSchool(f, fd) {
    try { await Cloud.rpc('super_school_save', { p_token: session.get().token, p_id: null, p_name: fd.get('name'), p_kind: fd.get('kind'), p_city: null }); toast('School added ✔'); route(); }
    catch (e) { toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  async function superEditSchool(id, name) {
    const s = (SUP && SUP.ov.schools || []).find((x) => x.id === id) || {};
    const n = prompt('School name', name || ''); if (!n || !n.trim()) return;
    try { await Cloud.rpc('super_school_save', { p_token: session.get().token, p_id: id, p_name: n.trim(), p_kind: s.kind || 'sekolah', p_city: s.city || null }); toast('Name saved ✔'); await ensure(true); route(); }
    catch (e) { toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  // Hapus kelas: nama kelas diketik ulang sebagai konfirmasi; siswa dan datanya ikut terhapus
  async function deleteClass(id) {
    const c = S.cls(id); if (!c) return;
    const n = S.studentsOf(id).length;
    const typed = prompt(`Delete class "${c.name}"${n ? ` along with ${n} students and all their data (answers, scores, tasks, reports)` : ''}? This can't be undone. Type the class name to confirm: ${c.name}`);
    if (typed === null) return;
    if (typed.trim().toLowerCase() !== c.name.trim().toLowerCase()) return toast('Class name doesn\'t match. The class was not deleted.');
    const after = () => { const x = session.get(); if (x.classId === id) { delete x.classId; session.set(x); } toast(`"${esc(c.name)}" deleted`); };
    if (!cloudOn()) {
      if (S.classesOf(c.teacherId).length <= 1) return toast('This is that teacher\'s only class. Create another class first.');
      S.deleteClass(id); after(); return route();
    }
    try { await Cloud.rpc('teacher_delete_class', { p_token: session.get().token, p_class_id: id, p_confirm_name: typed }); after(); await ensure(true); route(); }
    catch (e) { toast(e.status === 404 ? 'Run supabase/010_delete_class.sql in Supabase first' : e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  // Hapus sekolah, guru, atau akun orang tua (super admin); nama diketik ulang sebagai konfirmasi
  async function superDelete(what, id) {
    const list = what === 'student' ? [...((SUP && SUP.students) || []), ...(UNG || [])] : what === 'school' ? SUP.ov.schools : what === 'teacher' ? SUP.ov.teachers : SUP.parents;
    const x = (list || []).find((v) => v.id === id);
    if (!x) return;
    const warn = what === 'school' ? `School "${x.name}" will be deleted along with ${x.teachers} teachers, ${x.classes} classes, and ${x.students} students and all their data. Super admin accounts are not deleted.`
      : what === 'teacher' ? `Teacher account "${x.name}" will be deleted along with ${x.classes} classes and all students in them.`
      : what === 'student' ? `Student "${x.name}" (${studentPlace(x)}, learning code ${x.code || '–'}, ${x.att || 0} questions answered) will be deleted along with all their answers, scores, assignments, and reports.`
      : `Parent account "${x.name}" will be deleted. The child's learning data remains.`;
    const typed = prompt(`${warn} This can't be undone. Type the name to confirm: ${x.name}`);
    if (typed === null) return;
    if (typed.trim().toLowerCase() !== x.name.trim().toLowerCase()) return toast('Name doesn\'t match. Nothing was deleted.');
    const fn = { school: ['super_school_delete', 'p_school_id'], teacher: ['super_teacher_delete', 'p_teacher_id'], parent: ['super_parent_delete', 'p_parent_id'], student: ['super_student_delete', 'p_student_id'] }[what];
    try {
      await Cloud.rpc(fn[0], { p_token: session.get().token, [fn[1]]: id, p_confirm_name: typed });
      if (what === 'school' && ss.get('schoolSel', '') === id) ss.set('schoolSel', '');
      if (what === 'student') ungCount = { n: null, at: 0 };
      toast(`"${esc(x.name)}" deleted`); await ensure(true); route();
    } catch (e) { toast(e.status === 404 ? `Run supabase/${what === 'student' ? '023_hapus_siswa' : '011_delete_school'}.sql in Supabase first` : e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  async function superClassTeacher(el) {
    const c = S.cls(el.dataset.c), t = (SUP && SUP.ov.teachers || []).find((x) => x.id === el.value); if (!c || !t) return;
    const other = (SUP.ov.schools || []).find((x) => x.id === t.schoolId), moving = (t.schoolId || '') !== (c.schoolId || '');
    if (!confirm(`Make ${t.name} the teacher of ${c.name}?${moving ? `\n\nThis class will move to the school ${other ? other.name : 'no school'}, following its teacher's school.` : ''}`)) { el.value = el.dataset.was; return; }
    el.disabled = true;
    try {
      await Cloud.rpc('super_class_set_teacher', { p_token: session.get().token, p_class_id: c.id, p_teacher_id: t.id });
      toast(`${esc(t.name)} is now the teacher of ${esc(c.name)} ✔`); await ensure(true); route();
    } catch (e) {
      el.disabled = false; el.value = el.dataset.was;
      toast(e.status === 404 ? 'Run supabase/009_class_teacher.sql in Supabase first' : e.status ? esc(e.message) : 'Can\'t connect to the server');
    }
  }
  async function superTeacherSet(el) {
    const t = (SUP && SUP.ov.teachers || []).find((x) => x.id === el.dataset.id); if (!t) return;
    const school = el.dataset.f === 'school' ? el.value : t.schoolId || '', admin = el.dataset.f === 'admin' ? el.checked : t.isSchoolAdmin;
    try { await Cloud.rpc('super_teacher_set', { p_token: session.get().token, p_teacher_id: t.id, p_school_id: school, p_is_admin: admin }); t.schoolId = school; t.isSchoolAdmin = admin; toast('Saved ✔'); await ensure(true); }
    catch (e) { toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); route(); }
  }

  /* ---------- Catatan penggunaan mode coba (dikirim ke server untuk dasbor admin) ---------- */
  const TRY_KEY = 'metiq_try', TRYQ_KEY = 'metiq_try_q';
  const ls = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const tryInfo = () => ls.get(TRY_KEY, null);
  function setTry(x) {
    let vid = ls.get('metiq_vid', ''); if (!vid) { vid = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); ls.set('metiq_vid', vid); }
    ls.set(TRY_KEY, Object.assign({}, tryInfo() && tryInfo().role === x.role ? tryInfo() : {}, x, { vid }));
  }
  let tflushTimer = null, lastView = '';
  function tlog(e, d) {
    const t = tryInfo(); if (!t || !session.get().demo) return;
    if (e === 'view') { const k = JSON.stringify(d); if (k === lastView) return; lastView = k; }
    const q = ls.get(TRYQ_KEY, []); q.push({ e, d, ts: Date.now() }); ls.set(TRYQ_KEY, q.slice(-500));
    clearTimeout(tflushTimer); tflushTimer = setTimeout(tflush, 8000);
  }
  let tflushing = false;
  async function tflush() {
    const t = tryInfo(), q = ls.get(TRYQ_KEY, []);
    if (tflushing || !t || !q.length || !Cloud.enabled) return;
    tflushing = true;
    const batch = q.slice(0, 100);
    try {
      await Cloud.rpc('trial_log', { p_visitor: t.vid, p_role: t.role, p_name: t.name || null, p_child: t.child || null, p_events: batch });
      ls.set(TRYQ_KEY, ls.get(TRYQ_KEY, []).slice(batch.length));
    } catch (e) {
      // server belum siap (SQL 007 belum dijalankan) atau offline: coba lagi nanti, antrean dibatasi 500
    } finally { tflushing = false; }
    if (ls.get(TRYQ_KEY, []).length) { clearTimeout(tflushTimer); tflushTimer = setTimeout(tflush, 30000); }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') tflush(); });
  setTimeout(tflush, 4000);

  // Dasbor admin: penggunaan mode coba
  const FEATURE = {
    'view:belajar': '🏠 Student home', 'view:latihan': '✏️ Practice page', 'view:pelajaran': '📖 Lessons', 'view:permainan': '🎮 Game list', 'view:main': '🎮 Game page',
    'view:hadiah': '🎁 Rewards board', 'view:asesmen': '🧭 Assessment', 'view:laporanku': '📄 My report', 'view:ortu': '👨‍👩‍👧 Parent report', 'view:notifikasi': '🔔 Notifications',
    'view:guru/ringkasan': '👩‍🏫 Teacher summary', 'view:guru/siswa': '👩‍🏫 Student list & pages', 'view:guru/analitik': '📈 Teacher analytics', 'view:guru/tugas': '📌 Tasks', 'view:guru/sekolah': '🏫 School dashboard',
    'view:guru/peta': '🗺️ Progress map', 'view:guru/keterampilan': '🧩 Skills', 'view:guru/kelola': '⚙️ Manage class', 'view:guru/referensi': '📚 References', 'view:panduan': '❓ Guide',
    answer: '✅ Questions answered', game: '🏁 Game rounds finished', diag: '🧭 Assessments finished', feedback: '⭐ Reviews sent', start: '🧪 Started demo mode',
  };
  const ROLE_LABEL = { siswa: 'Student', ortu: 'Parent', guru: 'Teacher' };
  async function loadTrialStats() {
    const box = document.getElementById('trial-box'); if (!box) return;
    const ses = session.get();
    if (!cloudOn() || !ses.token) { box.innerHTML = emptyCard('Only on a real admin account', 'Demo statistics come from the server, so they\'re visible only when logged in with a real admin account (not demo mode).'); return; }
    const days = ss.get('tdays', 14);
    try {
      const r = await Cloud.rpc('admin_trial_stats', { p_token: ses.token, p_days: days });
      if (document.getElementById('trial-box')) box.innerHTML = trialHTML(r, days);
    } catch (e) {
      box.innerHTML = e.status === 404 ? emptyCard('Needs SQL 007 to be run', 'Run supabase/007_trial_usage.sql in the Supabase SQL Editor so demo usage is recorded and shown here.')
        : emptyCard('Failed to load', e.status ? esc(e.message) : 'Can\'t connect to the server.');
    }
  }
  function trialHTML(r, days) {
    const vs = r.visitors || [], byRole = (x) => vs.filter((v) => v.role === x).length, ans = vs.reduce((t, v) => t + v.answers, 0), ok = vs.reduce((t, v) => t + v.correct, 0);
    const pills = `<div class="vzpills">${[7, 14, 30].map((d) => `<button class="${d === days ? 'on' : ''}" data-act="tdays" data-d="${d}">${d} days</button>`).join('')}</div>`;
    if (!vs.length) return pills + emptyCard('No usage yet', `No one has used demo mode in the last ${days} days. Share the link metiqmath.com and ask testers to tap "Try as …" on the home page.`);
    // grafik harian: pengunjung unik per peran (batang bertumpuk, warna kategori tetap per peran)
    const dayList = [...Array(days)].map((_, i) => isoDay(Date.now() - (days - 1 - i) * DAY)), roles = ['siswa', 'ortu', 'guru'], col = { siswa: VZ.s1, ortu: VZ.s2, guru: VZ.s3 };
    const val = (d, rl) => ((r.daily || []).find((x) => x.day === d && x.role === rl) || {}).visitors || 0;
    const max = Math.max(1, ...dayList.map((d) => roles.reduce((t, rl) => t + val(d, rl), 0)));
    const W = 340, H = 160, L = 22, base = 128, bw = Math.max(4, (W - L - 6) / days - 3), Y = (v) => (v / max) * (base - 14);
    let svg = `<line x1="${L}" x2="${W - 4}" y1="${base}" y2="${base}" stroke="#16302b"/><text x="${L - 4}" y="${base - Y(max) + 3}" text-anchor="end" font-size="9" fill="${VZ.ink2}">${max}</text>`;
    dayList.forEach((d, i) => {
      const x = L + i * ((W - L - 6) / days) + 1.5; let y = base;
      roles.forEach((rl) => { const v = val(d, rl); if (!v) return; const h = Y(v); y -= h; svg += `<rect class="vzmark" x="${x}" y="${y}" width="${bw}" height="${Math.max(1, h - 1)}" rx="2" fill="${col[rl]}" ${tip(`${fdate(new Date(d + 'T12:00:00').getTime())} · ${ROLE_LABEL[rl]}`, `${v} visitors`)}/>`; });
      const tot = roles.reduce((t, rl) => t + val(d, rl), 0);
      if (tot) svg += `<text x="${x + bw / 2}" y="${y - 3}" text-anchor="middle" font-size="8" font-weight="800" fill="#16302b">${tot}</text>`;
      if (days <= 14 || i % 3 === 0) svg += `<text x="${x + bw / 2}" y="${base + 11}" text-anchor="middle" font-size="8" fill="${VZ.ink2}">${new Date(d + 'T12:00:00').getDate()}</text>`;
    });
    const feats = (r.features || []).filter((f) => FEATURE[f.k]).slice(0, 12), fmax = Math.max(1, ...feats.map((f) => f.v));
    return `${pills}
      <div class="kpis"><div class="kpi"><small>Demo visitors</small><b>${vs.length}</b></div><div class="kpi"><small>Students · parents · teachers</small><b class="sm">${byRole('siswa')} · ${byRole('ortu')} · ${byRole('guru')}</b></div>
        <div class="kpi"><small>Questions answered</small><b>${fmtNum(ans)}<span> · ${ans ? pct(ok, ans) + '%' : '–'}</span></b></div><div class="kpi"><small>Came back on another day</small><b>${vs.filter((v) => v.days > 1).length}<span>/${vs.length}</span></b></div></div>
      <section class="card vz"><h2>Visitors per day</h2><p class="small muted">Number of different people using demo mode each day (WIB).</p>
        ${legend(roles.map((rl) => [col[rl], ROLE_LABEL[rl]]))}<svg viewBox="0 0 ${W} ${H}" class="vzsvg" role="img" aria-label="Demo visitors per day">${svg}</svg>
        ${vzTable(['Date', ...roles.map((rl) => ROLE_LABEL[rl])], dayList.filter((d) => roles.some((rl) => val(d, rl))).map((d) => [d, ...roles.map((rl) => val(d, rl))]))}</section>
      <section class="card vz"><h2>Most used features</h2><p class="small muted">Number of visitors who opened or used each feature.</p>
        ${feats.map((f) => `<div class="fbar"><span>${FEATURE[f.k]}</span><i><b style="width:${Math.round((f.v / fmax) * 100)}%"></b></i><small>${f.v} people · ${fmtNum(f.n)}×</small></div>`).join('')}</section>
      <section class="card"><h2>Who tried it</h2><div class="tscroll"><table class="tbl"><thead><tr><th>Name</th><th>Role</th><th>First</th><th>Last</th><th>Active days</th><th>Questions</th><th>Games</th><th>Assessment</th></tr></thead><tbody>
        ${vs.map((v) => `<tr><td><b>${esc(v.name || '(no name)')}</b>${v.child ? `<small class="muted"> · child: ${esc(v.child)}</small>` : ''}</td><td>${ROLE_LABEL[v.role] || v.role}</td><td>${ftime(v.first)}</td><td>${ago(v.last)}</td><td>${v.days}</td><td>${v.answers ? `${v.answers} <small class="muted">(${pct(v.correct, v.answers)}%)</small>` : '–'}</td><td>${v.games || '–'}</td><td>${v.diag ? esc(gname(+v.diag)) : '–'}</td></tr>`).join('')}
      </tbody></table></div><p class="small muted">Names are what testers typed themselves. One row = one device.</p></section>`;
  }

  /* ---------- Permainan matematika ---------- */
  const G = window.METIQ_GAMES;
  let stopGame = null;
  const gameKid = () => { const ses = session.get(); return ses.role === 'siswa' && S.student(ses.id); };
  const gStar = (on) => `<svg class="gst ${on ? 'on' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/></svg>`;
  // Permainan mengikuti belajar: terbuka sampai kelas yang sedang dipelajari anak
  // (hasil asesmen, atau kelas tertinggi yang sudah punya keterampilan Mahir); tuntas satu kelas membuka kelas berikutnya.
  const skillOk = (pr) => (s) => ((pr[s.id] || {}).score || 0) >= 80;
  function gameGradeMax(sid) {
    const ok = skillOk(S.progressAll(sid)), last = GRADES[GRADES.length - 1].id;
    let top = Math.max(1, ...['a', 'b'].map((pf) => (S.diagOf(sid, pf) || {}).level || 1));
    GRADES.forEach((x) => { if (unitsOf(x.id).some((u) => u.skills.some(ok))) top = Math.max(top, x.id); });
    while (top < last && unitsOf(top).every((u) => u.skills.every(ok))) top++;
    return Math.min(top, last);
  }
  // Kelas yang dilihat di Main disimpan terpisah dari kelas di peta belajar
  const gameGrade = (max) => { const g = +sessionStorage.getItem('metiq_ggrade') || Math.min(getGrade(), max); return GRADES.some((x) => x.id === g) ? g : 1; };
  function viewGames() {
    const kid = gameKid(), max = kid ? gameGradeMax(kid.id) : GRADES[GRADES.length - 1].id, g = gameGrade(max);
    const best = (id) => { const p = kid ? S.progress(kid.id, 'g:' + id) : null; return p && p.att ? p : null; };
    const pill = (x) => { const lock = x.id > max; return `<button class="mq-gg ${x.id === g ? 'on' : ''} ${lock ? 'lock' : ''}" data-act="ggrade" data-g="${x.id}" aria-label="${gname(x.id)}${lock ? ' (locked)' : ''}"><b>${x.short || x.id}</b>${lock ? `<i>${IC.lock}</i>` : ''}</button>`; };
    const tile = (x) => {
      const b = best(x.id), st = b ? G.starsFor(x, b.score) : 0, [c, bg] = G.LOOK[x.type];
      return `<a class="mq-gt" href="#/main/${x.id}" style="--c:${c};--bg:${bg}" aria-label="${esc(x.name)}, ${st} stars">${x.isNew && !b ? '<span class="new">New</span>' : ''}<span class="art">${G.art(x.type)}</span><b>${x.name}</b><span class="st">${[0, 1, 2].map((i) => gStar(i < st)).join('')}</span></a>`;
    };
    let body;
    if (g > max) {
      const sk = unitsOf(max).flatMap((u) => u.skills), dn = sk.filter(skillOk(S.progressAll(kid.id))).length;
      body = `<div class="mq-glock">${MQ.svg('think', { size: 130 })}<div class="lk">${IC.lock}</div>
        <h2>${gname(g)}</h2><p>Finish learning <b>${gname(max)}</b> first</p>
        <div class="mq-glbar" role="img" aria-label="${dn} of ${sk.length} skills Proficient"><i style="width:${pct(dn, sk.length)}%"></i></div><small>${dn} / ${sk.length} ✓</small> <a class="mq-btn" href="#/belajar">Let's learn</a></div>`;
    } else {
      body = `<div class="mq-ggrid">${G.GAMES.filter((x) => x.grade === g && !(adabOn() && x.type === 'kilat')).map(tile).join('')}</div>`;
    }
    app.innerHTML = mqPage(`
      <div class="mq-ghead">${kid ? '' : `<a class="mq-ico" href="#/" aria-label="Back">${IC.back}</a>`}
        <div class="mq-gsay">${MQ.svg('happy', { size: 74 })}<div class="mq-bubble"><p>Let's play!</p></div></div>
        ${kid ? `<button class="mq-gchip" data-act="tip" data-t="⭐ Stars from the best score in each game (up to 3)">${gStar(true)}${S.starsOf(kid.id)}</button>` : ''}</div>
      <a class="ol-cta" href="#/olimpiade"><span>🏅</span><span class="grow"><b>Olympiad</b><small>Competition practice for elementary, middle, and high school</small></span>›</a>
      <div class="mq-ggs" role="tablist" aria-label="Grade">${GRADES.map(pill).join('')}</div>
      ${body}`, 'main');
  }
  function viewGame(id) {
    const x = G.byId(id); if (!x || (adabOn() && x.type === 'kilat')) return go('#/permainan');
    const kid = gameKid();
    if (kid && x.grade > gameGradeMax(kid.id)) { toast('🔒 Finish your learning first'); return go('#/permainan'); }
    const [c, bg] = G.LOOK[x.type];
    app.innerHTML = `<div class="mq-top"><a class="mq-ico" href="#/permainan" aria-label="Log out">${IC.x}</a><span class="mq-gtitle">${x.name}</span>
        <button class="mq-ico psound" data-act="sound" aria-label="Sound">${window.SFX.enabled() ? '🔔' : '🔕'}</button></div>
      <main class="mq-screen mq-gplay" id="garea" style="--c:${c};--bg:${bg}">
        <div class="mq-gintro">${G.buddy(x) ? `<div class="mq-gsay gbuddy">${MQ.svg('hello', { size: 84, who: G.buddy(x) })}<div class="mq-bubble"><p>Let's play with <b>${buddyName(G.buddy(x))}</b>!</p></div></div>` : ''}<div class="mq-gart">${G.art(x.type, 210)}</div>
          <div class="mq-ghow">${G.HOW[x.type](x).map(([e, t]) => `<div><span class="e">${e}</span>${t}</div>`).join('')}</div>
          ${G.EX[x.type] ? `<div class="mq-gex"><small>Example</small>${G.EX[x.type](x)}</div>` : ''}
          <div class="mq-goal">${x.stars.map((p, i) => `<div><span>${gStar(true).repeat(i + 1)}</span><b>${p}</b></div>`).join('')}</div>
          ${kid ? '' : '<p class="mq-note">Log in as a student so your stars are saved.</p>'}
          <details class="mq-gmore"><summary>Full rules</summary><p>${x.desc}</p></details></div></main>
      <div class="mq-foot" id="gfoot"><div class="mq-foot-in"><button class="mq-btn pulse" data-act="gstart">Start</button></div></div>`;
  }
  function startGame() {
    const x = G.byId(location.hash.split('/')[2]), area = document.getElementById('garea'); if (!x || !area) return;
    if (stopGame) stopGame();
    const foot = document.getElementById('gfoot'); if (foot) foot.hidden = true;
    stopGame = G.start(area, x, ({ points, ms, winner, title, note }) => {
      stopGame = null;
      const kid = gameKid(), stars = G.starsFor(x, points);
      const before = kid ? S.progress(kid.id, 'g:' + x.id) : null, prevBest = before && before.att ? before.score : 0;
      if (kid) {
        const res = S.recordGame(kid.id, x.id, points, stars, ms);
        const gainStars = Math.max(0, stars - (prevBest ? G.starsFor(x, prevBest) : 0));
        if (gainStars) { const sr = S.addStars(kid.id, gainStars); if (cloudOn() && sr.entry) Cloud.queueProgress(kid.id, session.get().code, sr.key, sr.entry); }
        tlog('game', { g: x.id, p: points, st: stars });
        if (cloudOn()) Cloud.queueProgress(kid.id, session.get().code, 'g:' + x.id, res);
        if (STARS_SRV && cloudOn()) Cloud.queueClaim(kid.id, session.get().code, { id: 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: 'game', game: x.id, points, stars, d: S.todayKey() });
      }
      if (stars >= 3) window.SFX.mastered(); else if (stars) window.SFX.levelUp();
      area.innerHTML = `<div class="mq-gend">${MQ.svg(stars ? 'cheer' : 'think', { size: 150, who: G.buddy(x) || undefined })}
        <div class="mq-gstars">${[0, 1, 2].map((i) => gStar(i < stars)).join('')}</div>
        <h2>${title || (winner ? (winner === 'Tie' ? '🤝 It\'s a tie!' : `🏆 ${winner} wins!`) : stars >= 3 ? 'Amazing!' : stars === 2 ? 'Great!' : stars ? 'Good job!' : 'Let\'s try again!')}</h2>${note ? `<p class="mq-note">${esc(note)}</p>` : ''}
        <div class="mq-gpts"><b>${points}${x.type === 'sheets' ? '%' : ''}</b><small>${x.type === 'sheets' ? 'correct on the first check' : 'points'}</small>${kid && points > prevBest && before && before.att ? '<span class="rec">🎉 New record!</span>' : ''}</div>
        ${stars < 3 ? `<p class="mq-note">Need ${x.stars[stars]}${x.type === 'sheets' ? '%' : ' points'} for ${'⭐'.repeat(stars + 1)}</p>` : ''}</div>`;
      if (foot) { foot.hidden = false; foot.innerHTML = '<div class="mq-foot-in"><button class="mq-btn" data-act="gstart">Play again</button><a class="mq-btn ghost" href="#/permainan">Other games</a></div>'; }
    });
  }

  const emptyCard = (title, text) => `<section class="card center"><div class="bigemoji">🔎</div><h2>${title}</h2><p class="muted">${text}</p></section>`;
  const ASUB = [['penggunaan', 'Usage'], ['masalah', 'Problem spots'], ['kisi', 'Score grid'], ['log', 'Question log'], ['kemajuan', 'Progress']];
  function analyticsHTML(ctx, sub) {
    if (!ASUB.some((x) => x[0] === sub)) sub = 'penggunaan';
    const g = getRange();
    const ans = ctx.kids.flatMap((k) => S.answersOf(k.id).filter((a) => inRange(a, g)));
    const nav = `<nav class="subtabs">${ASUB.map(([k, l]) => `<a href="#/guru/analitik/${k}" class="${k === sub ? 'on' : ''}">${l}</a>`).join('')}</nav>`;
    const view = { penggunaan: usageHTML, masalah: troubleHTML, kisi: gridHTML, log: logHTML, kemajuan: progressHTML }[sub];
    return nav + (sub === 'kisi' ? '' : rangeBar()) + view(ctx, ans, g);
  }

  // Penggunaan: berapa banyak dan seberapa sering siswa berlatih
  function usageHTML(ctx, ans, g) {
    const ms = ans.reduce((s, a) => s + Math.min(a.ms || 0, 180000), 0);
    const active = new Set(ans.map((a) => a.sid)).size;
    const from = dayStart(g.from || (ans.length ? Math.min(...ans.map((a) => a.ts)) : Date.now()));
    const days = Math.round((dayStart(g.to) - from) / DAY) + 1, step = days > 45 ? 7 : 1;
    const buckets = [];
    for (let t = from; t <= g.to; t += step * DAY) buckets.push({ t, n: 0 });
    ans.forEach((a) => { const b = buckets[Math.floor((dayStart(a.ts) - from) / (step * DAY))]; if (b) b.n++; });
    const max = Math.max(1, ...buckets.map((b) => b.n));
    const rows = ctx.kids.map((k) => {
      const my = ans.filter((a) => a.sid === k.id);
      return { k, n: my.length, ok: my.filter((a) => a.ok).length, ms: my.reduce((s, a) => s + Math.min(a.ms || 0, 180000), 0), sk: new Set(my.map((a) => a.skill)).size, days: new Set(my.map((a) => dayStart(a.ts))).size, last: Math.max(0, ...my.map((a) => a.ts)) };
    }).sort((a, b) => b.n - a.n);
    return `<div class="kpis"><div class="kpi"><small>Questions answered</small><b>${fmtNum(ans.length)}</b></div><div class="kpi"><small>Learning time</small><b class="sm">${fmtTime(ms)}</b></div><div class="kpi"><small>Active students</small><b>${active}<span>/${ctx.kids.length}</span></b></div><div class="kpi"><small>Skills practiced</small><b>${new Set(ans.map((a) => a.skill)).size}</b></div></div>
      <section class="card"><h2>Questions answered per ${step === 7 ? 'minggu' : 'hari'}</h2>${ans.length ? `<div class="ubars">${buckets.map((b) => `<div class="ub" title="${fdate(b.t)}: ${b.n} questions"><span class="ubv">${b.n && buckets.length <= 31 ? b.n : ''}</span><i style="height:${Math.round((b.n / max) * 100)}%"></i></div>`).join('')}</div><div class="ublab"><span>${fdate(buckets[0].t)}</span><span>${fdate(buckets[buckets.length - 1].t)}</span></div>` : '<p class="muted">No practice in this period.</p>'}</section>
      <section class="card"><h2>Usage per student</h2><div class="tscroll"><table class="tbl"><thead><tr><th>Student</th><th>Questions</th><th>Accuracy</th><th>Time</th><th>Skills</th><th>Active days</th><th>Last</th></tr></thead><tbody>
      ${rows.map((x) => `<tr data-href="#/guru/siswa/${x.k.id}"><td><span class="av sm">${avHTML(x.k.avatar)}</span> ${esc(x.k.name)}</td><td>${x.n}</td><td>${x.n ? `<span class="accb ${pct(x.ok, x.n) >= 80 ? 'g' : pct(x.ok, x.n) >= 60 ? 'y' : 'r'}">${pct(x.ok, x.n)}%</span>` : '–'}</td><td>${fmtTime(x.ms)}</td><td>${x.sk}</td><td>${x.days}</td><td>${x.last ? ago(x.last) : '–'}</td></tr>`).join('')}
      </tbody></table></div></section>`;
  }

  // Titik masalah: keterampilan dengan jawaban salah terbanyak, siapa yang salah, dan soal apa
  function troubleHTML(ctx, ans) {
    const wrong = {};
    ans.filter((a) => !a.ok && SKILLS[a.skill]).forEach((a) => { (wrong[a.skill] = wrong[a.skill] || []).push(a); });
    const list = Object.entries(wrong).filter(([, w]) => w.length >= 3)
      .map(([id, w]) => ({ id, w, tot: ans.filter((a) => a.skill === id).length, sids: [...new Set(w.map((a) => a.sid))] }))
      .sort((a, b) => b.w.length - a.w.length);
    if (!list.length) return emptyCard('No problem spots yet', 'Problem spots appear when a skill has at least 3 wrong answers in this period.');
    const lim = ss.get('troublelim', 15);
    return `<p class="muted small">${list.length} skills have 3 or more wrong answers. Sorted from most wrong; tap to see students and questions.</p>` + list.slice(0, lim).map((t) => {
      const sk = SKILLS[t.id];
      const per = t.sids.map((sid) => ({ k: S.student(sid), n: t.w.filter((a) => a.sid === sid).length })).filter((x) => x.k).sort((a, b) => b.n - a.n);
      const tags = tagCounts(t.w).filter(([x]) => x !== 'konsep' && TAGS[x]).slice(0, 2);
      const recent = t.w.slice().sort((a, b) => b.ts - a.ts).slice(0, 6);
      return `<details class="card trouble"><summary><span class="grow"><b>${sk.code} ${sk.name}</b><small>${gname(sk.grade)} · ${t.w.length} wrong of ${t.tot} questions · ${t.sids.length} students</small></span><span class="pill warn">${pct(t.w.length, t.tot)}% wrong</span></summary>
        <div class="kidchips">${per.map((x) => `<a href="#/guru/siswa/${x.k.id}" class="kchip">${avHTML(x.k.avatar)} ${esc(x.k.name)} <b>${x.n}×</b></a>`).join('')}</div>
        ${tags.length ? `<p class="small"><b>Error pattern:</b> ${tags.map(([x, n]) => `${TAGS[x].label} (${n}×)`).join('; ')}</p>` : ''}
        <div class="tscroll"><table class="tbl"><thead><tr><th>Student</th><th>Questions</th><th>Answer</th><th>Correct</th></tr></thead><tbody>${recent.map((a) => { const k = S.student(a.sid); return `<tr><td>${k ? `${avHTML(k.avatar)} ${esc(k.name)}` : ''}</td><td class="wrap">${esc(a.text)}</td><td class="strike">${esc(a.given)}</td><td><b>${esc(a.answer)}</b></td></tr>`; }).join('')}</tbody></table></div>
        <div class="row-btn left"><button class="btn sm ghost" data-act="assign1" data-id="${t.id}">Assign to class</button><a class="btn sm ghost" href="#/coba/${t.id}">See a sample question</a></div></details>`;
    }).join('') + (list.length > lim ? `<div class="row-btn"><button class="btn ghost sm" data-act="troublemore">Show 15 more (${list.length - lim} left)</button></div>` : '');
  }

  // Kisi skor: SmartScore setiap siswa untuk setiap keterampilan dalam satu bab
  function gridHTML(ctx) {
    const units = curUnits();
    let uid = ss.get('gridUnit', null);
    if (!units.some((u) => u.id === uid)) uid = (units.find((u) => ctx.kids.some((k) => u.skills.some((s) => S.progress(k.id, s.id).att))) || units[0]).id;
    const u = units.find((x) => x.id === uid);
    return gradeTabs() + `<div class="unitchips">${units.map((x) => `<button class="${x.id === uid ? 'on' : ''}" data-act="gridunit" data-u="${x.id}" title="${esc(x.name)}">${x.icon} ${x.id}</button>`).join('')}</div>
      <section class="card"><h2><span class="uicon" style="--c:${u.color}">${u.icon}</span>${u.id}. ${u.name}</h2><p class="muted small">Current SmartScore. Blank cell = not tried.</p>
      <div class="tscroll"><table class="tbl heat"><thead><tr><th>Student</th>${u.skills.map((s) => `<th title="${esc(s.name)}">${s.code}</th>`).join('')}</tr></thead><tbody>
      ${ctx.kids.map((k) => `<tr><td><a href="#/guru/siswa/${k.id}">${avHTML(k.avatar)} ${esc(k.name)}</a></td>${u.skills.map((s) => { const p = S.progress(k.id, s.id); return `<td class="hc ${p.att ? level(p.score)[1] : 'lv0'}" title="${esc(s.name)}: ${p.att ? `${p.score} (${p.att} questions)` : 'not tried'}">${p.att ? (p.score >= 100 ? '🏆' : p.score) : ''}</td>`; }).join('')}</tr>`).join('')}
      </tbody></table></div>
      <ol class="skl small">${u.skills.map((s) => `<li><b>${s.code}</b> ${s.name}</li>`).join('')}</ol>
      <div class="legend">${[['Starting <50', 'lv1'], ['Developing 50–79', 'lv2'], ['Proficient 80–99', 'lv3'], ['Complete 100', 'lv4']].map(([l, c]) => `<span><i class="${c}"></i>${l}</span>`).join('')}</div></section>`;
  }

  // Log soal: setiap soal yang dijawab, dengan filter siswa, keterampilan, dan hasil
  function logHTML(ctx, ans) {
    const f = ss.get('logf', { sid: '', skill: '', res: '' }), lim = ss.get('loglim', 50);
    const used = [...new Set(ans.map((a) => a.skill))].filter((id) => SKILLS[id]).sort((a, b) => SKILLS[a].code.localeCompare(SKILLS[b].code, undefined, { numeric: true }));
    const all = ans.filter((a) => (!f.sid || a.sid === f.sid) && (!f.skill || a.skill === f.skill) && (!f.res || (f.res === 'ok') === !!a.ok)).sort((a, b) => b.ts - a.ts);
    const rows = all.slice(0, lim);
    return `<div class="filters"><select data-act="logf" data-k="sid"><option value="">All students</option>${ctx.kids.map((k) => `<option value="${k.id}" ${f.sid === k.id ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select>
      <select data-act="logf" data-k="skill"><option value="">All skills</option>${used.map((id) => `<option value="${id}" ${f.skill === id ? 'selected' : ''}>${SKILLS[id].code} ${esc(SKILLS[id].name)}</option>`).join('')}</select>
      <select data-act="logf" data-k="res"><option value="">Right and wrong</option><option value="ok" ${f.res === 'ok' ? 'selected' : ''}>Right only</option><option value="no" ${f.res === 'no' ? 'selected' : ''}>Wrong only</option></select></div>
      <p class="muted small">${fmtNum(all.length)} questions${all.length > rows.length ? `, showing the latest ${rows.length}` : ''}.</p>
      <section class="card"><div class="tscroll"><table class="tbl log"><thead><tr><th>Time</th><th>Student</th><th>Code</th><th>Questions</th><th>Answer</th><th>Correct</th><th>Duration</th></tr></thead><tbody>
      ${rows.map((a) => { const k = S.student(a.sid), sk = SKILLS[a.skill]; return `<tr class="${a.ok ? '' : 'bad'}"><td>${ftime(a.ts)}</td><td>${k ? `${avHTML(k.avatar)} ${esc(k.name)}` : ''}</td><td title="${sk ? esc(sk.name) : ''}">${sk ? sk.code : esc(a.skill)}</td><td class="wrap">${esc(a.text)}</td><td>${a.ok ? '✅' : '❌'} ${esc(a.given)}</td><td>${esc(a.answer)}</td><td>${Math.round((a.ms || 0) / 1000)} sec</td></tr>`; }).join('') || '<tr><td colspan="7" class="muted">No matching questions.</td></tr>'}
      </tbody></table></div>${all.length > rows.length ? '<div class="row-btn"><button class="btn ghost sm" data-act="logmore">Show 50 more</button></div>' : ''}</section>`;
  }

  // SmartScore pada waktu tertentu dihitung ulang dari riwayat jawaban
  function scoreTimeline(sid) {
    const out = {};
    S.answersOf(sid).slice().sort((a, b) => a.ts - b.ts).forEach((a) => {
      const t = out[a.skill] = out[a.skill] || [];
      t.push({ ts: a.ts, s: S.nextScore(t.length ? t[t.length - 1].s : 0, a.ok) });
    });
    // Jika riwayat terpotong (mis. lebih lama dari 90 hari), geser agar skor akhir sama dengan skor tersimpan
    Object.entries(out).forEach(([k, t]) => { const off = S.progress(sid, k).score - t[t.length - 1].s; if (off) t.forEach((x) => { x.s = Math.max(0, Math.min(100, x.s + off)); }); });
    return out;
  }
  const scoreAt = (t, ts) => { let s = null; for (const x of t) { if (x.ts <= ts) s = x.s; else break; } return s; };

  // Kemajuan: kenaikan SmartScore per keterampilan antara awal dan akhir periode
  function progressHTML(ctx, ans, g) {
    const rows = ctx.kids.map((k) => {
      const tl = scoreTimeline(k.id);
      const ids = [...new Set(ans.filter((a) => a.sid === k.id).map((a) => a.skill))].filter((id) => SKILLS[id] && tl[id]);
      const items = ids.map((id) => { const start = scoreAt(tl[id], g.from - 1) || 0, end = scoreAt(tl[id], g.to) ?? start; return { id, start, end, gain: end - start, n: ans.filter((a) => a.sid === k.id && a.skill === id).length }; }).sort((a, b) => b.gain - a.gain);
      return { k, items, gain: items.reduce((s, x) => s + Math.max(0, x.gain), 0), prof: items.filter((x) => x.end >= 80 && x.start < 80).length, mast: items.filter((x) => x.end >= 100 && x.start < 100).length };
    }).sort((a, b) => b.gain - a.gain);
    const sum = (f) => rows.reduce((s, x) => s + f(x), 0);
    const skillsTouched = sum((x) => x.items.length);
    if (!skillsTouched) return emptyCard('No progress yet', 'Progress is calculated from skills practiced in this period.');
    const arrow = (x) => `<span class="sc lv-${x.start >= 100 ? 4 : x.start >= 80 ? 3 : x.start >= 50 ? 2 : x.start > 0 ? 1 : 0}">${x.start}</span> → <span class="sc lv-${x.end >= 100 ? 4 : x.end >= 80 ? 3 : x.end >= 50 ? 2 : x.end > 0 ? 1 : 0}">${x.end}</span>`;
    return `<div class="kpis"><div class="kpi"><small>SmartScore gain</small><b>+${fmtNum(sum((x) => x.gain))}</b></div><div class="kpi"><small>Became proficient (≥80)</small><b>${sum((x) => x.prof)}</b></div><div class="kpi"><small>Became complete (100)</small><b>${sum((x) => x.mast)}</b></div><div class="kpi"><small>Average gain</small><b>+${Math.round(sum((x) => x.gain) / skillsTouched)}<span> per skill</span></b></div></div>
      <p class="muted small">Starting score = SmartScore before the period began; ending score = SmartScore at the end of the period. Tap a student's name for details.</p>
      ${rows.map((x) => `<details class="card prog"><summary><span class="av sm">${avHTML(x.k.avatar)}</span><span class="grow"><b>${esc(x.k.name)}</b><small>${x.items.length} skills practiced · ${x.prof} became proficient · ${x.mast} complete</small></span><span class="pill ${x.gain ? '' : 'warn'}">+${x.gain}</span></summary>
        ${x.items.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>Skills</th><th>Score</th><th>Up</th><th>Questions</th></tr></thead><tbody>${x.items.map((it) => `<tr><td class="wrap"><b>${SKILLS[it.id].code}</b> ${SKILLS[it.id].name}</td><td>${arrow(it)}</td><td class="${it.gain > 0 ? 'up' : it.gain < 0 ? 'down' : ''}">${it.gain > 0 ? '+' : ''}${it.gain}</td><td>${it.n}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">No practice in this period.</p>'}</details>`).join('')}`;
  }
  const fmtNum = (n) => Number(n).toLocaleString('en-US');
  // Tenggat dari kolom tanggal (yyyy-mm-dd) ditulis seperti "30 Okt"
  const fdue = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? fdate(new Date(d + 'T00:00:00').getTime()) : d);

  // Siswa sasaran tugas (kosong = seluruh kelas)
  const asgKids = (a, kids) => (a.students && a.students.length ? kids.filter((k) => a.students.includes(k.id)) : kids);
  // Kelas (jenjang materi) yang paling banyak dikerjakan siswa di kelas ini
  function classGrade(ctx) {
    const c = {};
    ctx.kids.forEach((k) => Object.keys(S.progressAll(k.id)).forEach((id) => { if (SKILLS[id]) c[SKILLS[id].grade] = (c[SKILLS[id].grade] || 0) + 1; }));
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return top ? +top[0] : getGrade();
  }
  // Saran tugas yang tinggal dikirim: materi yang masih sulit, kelompok level, atau materi berikutnya
  function taskSuggestions(ctx) {
    const recent = new Set(S.assignmentsOf(ctx.c.id).filter((a) => (a.createdAt || 0) > Date.now() - 14 * DAY).flatMap((a) => a.skills));
    const out = [], used = new Set();
    const add = (id, kids, why) => { used.add(id); out.push({ id, kids, why }); };
    const hard = {};
    ctx.kids.forEach((k) => weaknesses(k.id).forEach((w) => { (hard[w.id] = hard[w.id] || []).push(k); }));
    Object.entries(hard).filter(([id, l]) => l.length >= 2 && !recent.has(id)).sort((a, b) => b[1].length - a[1].length).slice(0, 2).forEach(([id, l]) => add(id, l, `${l.length} students still struggle: ${nameList(l)}`));
    const need = (id, kids) => kids.filter((k) => S.progress(k.id, id).score < 80).length;
    const pick = (ids, kids) => ids.filter((x) => SKILLS[x] && !recent.has(x) && !used.has(x)).map((x) => ({ x, n: need(x, kids) })).filter((o) => o.n > 0).sort((a, b) => b.n - a.n)[0];
    const groups = {};
    ctx.kids.forEach((k) => { const d = S.diagOf(k.id, 'b') || S.diagOf(k.id); if (d) (groups[d.level] = groups[d.level] || []).push(k); });
    const levels = Object.keys(groups).map(Number).sort((a, b) => a - b);
    if (levels.length >= 2) levels.forEach((lv) => { const p = pick([...(S.DIAG[lv] || []), ...unitsOf(lv).flatMap((u) => u.skills.map((x) => x.id))], groups[lv]); if (p) add(p.x, groups[lv], `For the ${gname(lv)} topic group: ${nameList(groups[lv])}`); });
    if (!out.length) { const p = pick(unitsOf(classGrade(ctx)).flatMap((u) => u.skills.map((x) => x.id)), ctx.kids); if (p) add(p.x, ctx.kids, 'Next topic for the whole class'); }
    return out.slice(0, 4);
  }
  function tasksHTML(ctx) {
    if (!ctx.kids.length) return `<section class="card center"><div class="bigemoji">📌</div><h2>Add students first</h2><p class="muted">Tasks can be given once the class has students.</p><a class="btn" href="#/guru/siswa">➕ Add students</a></section>`;
    const asg = S.assignmentsOf(ctx.c.id).slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const pre = ss.get('asgFor', ''), preSkill = ss.get('asgSkill', ''), g0 = preSkill && SKILLS[preSkill] ? SKILLS[preSkill].grade : classGrade(ctx);
    const prog = (a) => { const kids = asgKids(a, ctx.kids), d = S.doneFor(a.id).map((x) => x.sid).filter((id) => kids.some((k) => k.id === id)); return { kids, d, left: kids.filter((k) => !d.includes(k.id)) }; };
    const card = (a) => {
      const { kids, d, left } = prog(a), special = a.students && a.students.length;
      return `<div class="taskc"><div class="grow"><b>${esc(a.note || 'Tasks')}</b>${a.due ? ` <span class="muted small">· until ${esc(fdue(a.due))}</span>` : ''}
        <small>${special ? `For ${nameList(kids) || 'removed students'}` : 'For the whole class'} · ${a.skills.filter((k) => SKILLS[k]).map((k) => SKILLS[k].name).join(', ')}</small>
        <div class="tbar sm"><i style="width:${pct(d.length, kids.length)}%"></i></div>
        <small><b>${d.length} of ${kids.length}</b> done${left.length && left.length <= 6 ? `. Not yet: ${left.map((k) => esc(k.name)).join(', ')}` : ''}</small></div>
        <button class="link small danger" data-act="rmasg" data-id="${a.id}">Delete</button></div>`;
    };
    const running = asg.filter((a) => prog(a).left.length), finished = asg.filter((a) => !prog(a).left.length);
    const sug = taskSuggestions(ctx);
    const grades = GRADES.filter((x) => unitsOf(x.id).length);
    return `${sug.length ? `<section class="card"><h2>💡 Metiq suggestions</h2><p class="small muted">Built from student answers. Tap Send and the task goes straight to students and their parents.</p>
        ${sug.map((x) => `<form data-form="grouptask" data-sids="${x.kids.map((k) => k.id).join(',')}" class="sugrow"><input type="hidden" name="sk" value="${x.id}"><input type="hidden" name="note" value="Latihan: ${esc(SKILLS[x.id].name)}"><input type="hidden" name="due" value=""><span class="grow"><b>${SKILLS[x.id].name}</b><small>${x.why}</small></span><button class="btn sm">Send to ${x.kids.length} students</button></form>`).join('')}</section>` : ''}
      <details class="card newtask" id="newasg" ${pre || preSkill ? 'open' : ''}><summary><b>➕ Create your own task</b></summary>
        <form data-form="assign" class="form">
          <h3 class="stepn"><i>1</i> Which topic?</h3>
          <div class="skfind"><input id="skq" type="search" placeholder="Search topics, e.g. fractions" aria-label="Search topics" autocomplete="off"><select id="skg" aria-label="Choose a grade">${grades.map((x) => `<option value="${x.id}" ${x.id === g0 ? 'selected' : ''}>${x.name}</option>`).join('')}</select></div>
          <div class="pickskills skbox" id="skbox">${UNITS.map((u) => `<fieldset data-g="${u.grade}" ${u.grade === g0 ? '' : 'hidden'}><legend>${u.icon} ${u.name}</legend>${u.skills.map((x) => `<label class="cb" data-q="${esc(x.name.toLowerCase())}"><input type="checkbox" name="sk" value="${x.id}" ${preSkill === x.id ? 'checked' : ''}> ${x.name}</label>`).join('')}</fieldset>`).join('')}</div>
          <h3 class="stepn"><i>2</i> For whom?</h3>
          <fieldset class="target">
            <label class="cb"><input type="radio" name="target" value="all" ${pre ? '' : 'checked'}> 👥 Whole class (${ctx.kids.length} students)</label>
            <label class="cb"><input type="radio" name="target" value="some" ${pre ? 'checked' : ''}> 🎯 Specific students</label>
            <div class="kidpick">${ctx.kids.map((k) => `<label class="cb"><input type="checkbox" name="sid" value="${k.id}" ${pre === k.id ? 'checked' : ''}> ${avHTML(k.avatar)} ${esc(k.name)}</label>`).join('')}</div>
          </fieldset>
          <h3 class="stepn"><i>3</i> Message and due date <small class="muted">(optional)</small></h3>
          <div class="grow2"><label>Message for students<input name="note" maxlength="120" placeholder="e.g. Practice for Friday's quiz"></label><label>Due date<input name="due" type="date"></label></div>
          <button class="btn" id="asgsend">📌 Send task</button></form></details>
      <section class="card"><h2>Tasks in progress <span class="pill">${running.length}</span></h2>${running.map(card).join('') || '<p class="muted">No tasks in progress.</p>'}</section>
      ${finished.length ? `<details class="card"><summary><b>✅ Completed tasks (${finished.length})</b></summary>${finished.map(card).join('')}</details>` : ''}`;
  }
  function settingsCard(ctx) {
    const st = settingsOf(ctx.c);
    return `<section class="card"><h2>🌙 Class settings</h2><form data-form="classset" class="form">
        <label>Question context<select name="konteks"><option value="umum" ${st.konteks === 'umum' ? 'selected' : ''}>General (standard)</option><option value="islami" ${st.konteks === 'islami' ? 'selected' : ''}>Islamic: Islamic names and objects, Math in Worship chapter</option></select></label>
        <label class="cb"><input type="checkbox" name="adab" value="1" ${st.adab ? 'checked' : ''}> <span>Adab mode: prayer before practice, Islamic praise, no rewards board or Kilat game</span></label>
        <button class="btn ghost sm">Save settings</button></form>
      <p class="small muted">Applies to this class only. If both are off, Metiq looks as usual.</p></section>`;
  }
  function manageHTML(ctx) {
    return `<p class="small muted kelnote">Adding students and parent codes are in the <a href="#/guru/siswa">🧒 Students</a> tab. How topics were chosen is in the <a href="#/guru/referensi">📚 Curriculum reference</a>.</p>
    <div class="grid2">
      <section class="card"><h2>Grade</h2><form data-form="renameclass" class="form inline"><input name="name" value="${esc(ctx.c.name)}" required><button class="btn ghost">Rename</button></form>
        <form data-form="newclass" class="form inline"><input name="name" placeholder="New class name" required><button class="btn ghost">Add class</button></form>
        <p class="small"><button class="link danger" data-act="delclass" data-id="${ctx.c.id}">🗑️ Delete "${esc(ctx.c.name)}"</button></p></section>
      ${settingsCard(ctx)}
      ${cloudOn() ? `<section class="card"><h2>Data</h2><p class="muted small">Class data is stored on the server and syncs automatically to student, parent, and teacher phones.</p><div class="row-btn"><button class="btn ghost sm" data-act="export">Download backup</button></div></section>`
      : `<section class="card"><h2>Data backup</h2><p class="muted small">Data is stored on this device. Download a backup regularly, or merge data from another device.</p><div class="row-btn"><button class="btn ghost sm" data-act="export">Download backup</button><label class="btn ghost sm">Merge file<input type="file" accept=".json" data-act="import" hidden></label></div></section>`}
    </div>`;
  }

  function viewTeacherStudent(ctx, sid) {
    const k = S.student(sid); if (!k || k.classId !== ctx.c.id) return go('#/guru/siswa');
    const x = kidState(k), good = strengths(k.id), prog = S.progressAll(k.id), order = UNITS.flatMap((u) => u.skills.map((s) => s.id));
    let last = -1;
    order.forEach((id, i) => { if ((prog[id] || {}).score >= 80) last = i; });
    const next = x.all.answered ? order.slice(last + 1).filter((id) => !(prog[id] && prog[id].att)).slice(0, 2) : [];
    const tasks = S.assignmentsFor(k.id).slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);
    const nm = esc(k.name), research = canResearch(ctx);
    const story = x.st === 'baru' ? `${nm} has never signed in. Send the class code so they can start.` : x.w.answered ? `In the last 7 days, ${nm} answered <b>${x.w.answered} questions</b> with <b>${x.w.acc}%</b> correct and has mastered <b>${good.length} topics</b>.` : `${nm} has not practiced in the last 7 days and has mastered <b>${good.length} topics</b>.`;
    const ans = research ? S.answersOf(sid).sort((a, b) => b.ts - a.ts).slice(0, 30) : [];
    teacherShell(ctx, 'siswa', `<a class="back" href="#/guru/siswa">← All students</a>
      <section class="card khead ${KID_ST[x.st][2]}"><span class="av lg">${avHTML(k.avatar)}</span><div class="grow"><h1>${nm}</h1><span class="accb ${KID_ST[x.st][2]} nowrap">${KID_ST[x.st][0]} ${KID_ST[x.st][1]}</span><p>${story}</p></div></section>
      <div class="grid2">
        <section class="card"><h2>🆘 Needs help</h2>${x.weak.length ? x.weak.slice(0, 4).map((w) => `<div class="wrow"><div class="lrow"><span class="grow"><b>${w.skill.name}</b>${w.tag && w.tag !== 'konsep' ? `<small>${TAGS[w.tag].label}</small>` : ''}</span>${giveBtn(k.id, w.id)}</div>${w.example ? `<p class="small ex">"${esc(w.example.text)}" answered <b class="strike">${esc(w.example.given)}</b>, should be <b>${esc(w.example.answer)}</b>.</p>` : ''}</div>`).join('') : '<p class="muted">No topics are falling behind. 👍</p>'}</section>
        <section class="card"><h2>✅ Can already do</h2>${good.length ? good.slice(0, 5).map((g) => `<div class="lrow"><span class="grow">${g.skill.name}</span></div>`).join('') + (good.length > 5 ? `<p class="small muted">and ${good.length - 5} more topics</p>` : '') : '<p class="muted">No topics mastered yet.</p>'}</section>
      </div>
      ${next.length ? `<section class="card"><h2>🚀 Ready for next</h2>${next.map((id) => `<div class="lrow"><span class="grow"><b>${SKILLS[id].name}</b><small>${gname(SKILLS[id].grade)}</small></span>${giveBtn(k.id, id, 'Assign a task')}</div>`).join('')}</section>` : ''}
      <section class="card"><div class="rhead"><h2>📌 Tasks for ${nm}</h2><span class="grow"></span><button class="btn ghost sm" data-act="asgform" data-s="${k.id}">➕ Another task</button></div>${tasks.length ? tasks.map((a) => `<div class="lrow"><span class="grow"><b>${esc(a.note || 'Tasks')}</b>${a.due ? `<small>due ${esc(fdue(a.due))}</small>` : ''}</span>${S.isDone(a.id, k.id) ? '<span class="pill okp">Done</span>' : '<span class="pill">Not yet</span>'}</div>`).join('') : '<p class="muted">No tasks yet.</p>'}</section>
      <section class="card"><h2>👨‍👩‍👧 Parents</h2><div class="lrow"><span class="grow"><b>Parent code: <span class="code">${k.parentCode || '–'}</span></b><small>${parentLinked(k) ? 'Connected' : 'Not connected'}</small></span><button class="btn sm ${parentLinked(k) ? 'ghost' : ''}" data-act="shareparent" data-id="${k.id}">📤 Send code</button></div></section>
      <details class="card"><summary><b>More</b> <span class="muted small">Assessment results, NISN, remove student</span></summary>
        ${diagSummaryHTML(k, 'guru')}${studentDataHTML(k, research)}<p><button class="link danger small" data-act="rmkid" data-id="${k.id}">Remove ${nm} from class</button></p></details>
      ${research ? `<details class="card"><summary><b>🔬 Research details</b> <span class="muted small">Visible only to super admins</span></summary>${reportHTML(k, 'guru')}
        <section class="card"><h2>All skills tried</h2><div class="tscroll"><table class="tbl"><thead><tr><th>Skills</th><th>Score</th><th>Questions</th><th>Correct</th><th>Time</th><th>Last</th></tr></thead><tbody>
        ${skillRows(sid).sort((a, b) => a.skill.code.localeCompare(b.skill.code, undefined, { numeric: true })).map((r) => `<tr><td>${r.skill.code} ${r.skill.name}</td><td>${chip(r.score)}</td><td>${r.att}</td><td>${r.acc}%</td><td>${fmtTime(r.ms)}</td><td>${ago(r.last)}</td></tr>`).join('')}</tbody></table></div></section>
        <section class="card"><h2>Last 30 answers</h2><div class="tscroll"><table class="tbl"><thead><tr><th></th><th>Questions</th><th>Answer</th><th>Correct</th><th>Skills</th></tr></thead><tbody>
        ${ans.map((a) => `<tr><td>${a.ok ? '✅' : '❌'}</td><td>${esc(a.text)}</td><td>${esc(a.given)}</td><td>${esc(a.answer)}</td><td class="small">${SKILLS[a.skill] ? SKILLS[a.skill].code : ''}</td></tr>`).join('')}</tbody></table></div></section></details>` : ''}`);
  }

  /* ---------- Laporan (orang tua & guru) ---------- */
  function reportHTML(k, audience) {
    const s7 = stats(k.id, 7), sAll = stats(k.id);
    const good = strengths(k.id), weak = weaknesses(k.id);
    const tags = tagCounts(S.answersOf(k.id).filter((a) => a.ts > Date.now() - 30 * DAY)).filter(([t]) => t !== 'konsep').slice(0, 3);
    const recentWrong = S.answersOf(k.id).filter((a) => !a.ok).sort((a, b) => b.ts - a.ts).slice(0, 6);
    const nm = esc(k.name);
    const maxDay = Math.max(1, ...s7.byDay.map((d) => d.n));
    const hariPendek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let story;
    if (!sAll.answered) story = `${nm} hasn't started practicing. Encourage ${nm} to open Metiq and try the first skill, "Counting objects to 10".`;
    else {
      story = s7.answered ? `In the last 7 days, ${nm} answered <b>${s7.answered} questions</b> with <b>${s7.acc}%</b> accuracy over ${fmtTime(s7.ms)}.` : `${nm} didn't practice in the last 7 days (last active ${ago(sAll.last)}).`;
      if (good[0]) story += ` ${nm} is already strong in <b>${good.slice(0, 2).map((g) => g.skill.name.toLowerCase()).join('</b> and <b>')}</b>.`;
      if (weak[0]) story += ` Most in need of practice: <b>${weak[0].skill.name.toLowerCase()}</b>${weak[0].tag && weak[0].tag !== 'konsep' ? ` — ${nm} ${TAGS[weak[0].tag].label.toLowerCase()}` : ''}.`;
    }
    return `
      <section class="card report-head"><span class="av lg">${avHTML(k.avatar)}</span><div><h1>${audience === 'ortu' ? 'Learning report ' : audience === 'siswa' ? 'My learning report: ' : ''}${nm}</h1><p class="muted">${esc((S.cls(k.classId) || {}).name || '')} · 🎁 ${GRADES.reduce((t, g) => t + prizeBoard(k.id, g.id).open, 0)} rewards · ⭐ ${S.gameStars(k.id)} game stars</p></div></section>
      <section class="card story"><p>${story}</p></section>
      ${diagSummaryHTML(k, audience)}
      <div class="kpis"><div class="kpi"><small>Total questions</small><b>${sAll.answered}</b></div><div class="kpi"><small>Accuracy</small><b>${sAll.acc}%</b></div><div class="kpi"><small>Learning time</small><b>${fmtTime(sAll.ms)}</b></div><div class="kpi"><small>Proficient skills</small><b>${sAll.proficient}<span> · ${sAll.mastered}🏆</span></b></div></div>
      <section class="card"><h2>Activity in the last 7 days</h2><div class="week">${s7.byDay.map((d) => `<div class="wd"><span class="wv">${d.n || ''}</span><i style="height:${Math.round((d.n / maxDay) * 100)}%"></i><small>${hariPendek[new Date(d.d0).getDay()]}</small></div>`).join('')}</div></section>
      <div class="grid2">
        <section class="card good"><h2>👍 Going well</h2>${good.length ? good.slice(0, 6).map((g) => `<div class="lrow"><span class="grow"><b>${g.skill.name}</b><small>${g.att} questions · ${g.acc}% correct</small></span>${chip(g.score)}</div>`).join('') : `<p class="muted">No skills have reached the proficient level (score 80) yet. Keep practicing!</p>`}</section>
        <section class="card improve"><h2>💪 Needs improvement</h2>${weak.length ? weak.slice(0, 5).map((w) => `<div class="wrow"><div class="lrow"><span class="grow"><b>${w.skill.name}</b><small>${w.att} questions · ${w.acc}% correct</small></span>${chip(w.score)}</div>
          ${w.tag ? `<p class="small"><b>Pattern:</b> ${TAGS[w.tag].label}.</p>` : ''}${w.example ? `<p class="small ex">Example: "${esc(w.example.text)}" — answered <b class="strike">${esc(w.example.given)}</b>, should be <b>${esc(w.example.answer)}</b>.</p>` : ''}
          <p class="small tip">💡 ${w.tag && w.tag !== 'konsep' ? TAGS[w.tag].tip : UNITS.find((u) => u.id === w.skill.unit).tip} <a href="#/pelajaran/${w.skill.unit}">📖 The lesson</a></p></div>`).join('') : `<p class="muted">No skills left behind. Awesome!</p>`}</section>
      </div>
      ${tags.length ? `<section class="card"><h2>🔍 Error patterns from ${nm}'s answers (30 days)</h2>${tags.map(([t, n]) => `<div class="tagrow"><b>${TAGS[t].label}</b> <span class="pill">${n}×</span><p class="small">${audience === 'ortu' ? 'At home: ' : 'Suggestion: '}${TAGS[t].tip}</p></div>`).join('')}</section>` : ''}
      <section class="card"><h2>Progress by chapter</h2>${reportGrades(k.id).map((g, _, all) => (all.length > 1 ? `<p class="small"><b>${gname(g)}</b></p>` : '') + unitsOf(g).map((u) => { const us = unitScore(k.id, u); return `<div class="uprog"><span>${u.icon} ${u.name}</span><span class="ubar"><i style="width:${us.avg}%;background:${u.color}"></i></span><small>${us.prof}/${us.total}</small></div>`; }).join('')).join('')}</section>
      ${audience === 'ortu' && recentWrong.length ? `<section class="card"><h2>Recent answers that weren't correct</h2>${recentWrong.map((a) => `<div class="wa"><p>${esc(a.text)}</p><small>${nm}'s answer: <b class="strike">${esc(a.given)}</b> · Correct: <b>${esc(a.answer)}</b> · ${ago(a.ts)}</small></div>`).join('')}</section>` : ''}`;
  }

  /* ---------- Orang tua ---------- */
  function viewParentEnter() {
    const ses = session.get();
    if (cloudOn() && ses.role === 'ortu' && (ses.ptoken || (ses.pcode && ses.kids))) return go('#/ortu/anak');
    app.innerHTML = shell(`
      <a class="back" href="#/">← Back</a> ${cloudOn() && PARENTS_ON ? `<section class="card narrow"><div class="bigemoji center">👨‍👩‍👧</div><h1 class="center">Parent account login</h1>
        <p class="muted center small">One account for all your children: see reports and learn together with them.</p>
        <form data-form="plogin" class="form">
          <label>Email<input name="email" type="email" required autocomplete="email"></label>
          <label>Password<input name="pass" type="password" required autocomplete="current-password"></label>
          <button class="btn">Log in</button>
        </form><p class="center"><a href="#/ajukan/ortu">No account yet? Request a parent account</a> · <a href="#/ajukan/status">Check status</a></p></section>` : ''}
      <section class="card narrow center gshow" hidden><div class="bigemoji">👨‍👩‍👧</div><h1>Sign in with Google</h1><p class="muted">See the reports of every child linked to your Gmail account.</p><div class="gsi" data-gi="report"></div></section>
      <section class="card narrow center">${cloudOn() && PARENTS_ON ? '<h2>Or see a report with a code</h2>' : '<div class="bigemoji">👨‍👩‍👧</div><h1>Reports for parents</h1>'}<p class="muted">Enter the <b>family code</b> (all children at once) or one child's parent code. Codes have 6 letters/digits and come from the admin or teacher.</p>
        <form data-form="parentcode"><input name="code" class="codein" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC123" required><button class="btn ghost">View report</button></form>
        <p class="small muted trynote">Want to try first? Enter the code <b>1234</b> to see a sample child's report.</p></section>`);
    gReveal();
  }
  function viewParentRegister() {
    app.innerHTML = shell(`
      <a class="back" href="#/ortu">← Back</a>
      <section class="card narrow"><div class="bigemoji center">👨‍👩‍👧</div><h1 class="center">Sign up for a parent account</h1>
        <form data-form="pregister" class="form">
          <label>Name<input name="name" required placeholder="e.g. Bima's father" autocomplete="name"></label>
          <label>Email<input name="email" type="email" required autocomplete="email"></label>
          <label>Password (at least 8 characters)<input name="pass" type="password" minlength="8" required autocomplete="new-password"></label>
          <button class="btn">Create account</button>
        </form><p class="muted small center">After logging in, add your child with the parent code from the teacher.</p></section>`);
  }
  // Satu kesimpulan untuk orang tua, ditulis sebagai kalimat sehari-hari
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function parentVerdict(k) {
    const s7 = stats(k.id, 7), all = stats(k.id), days = s7.byDay.filter((d) => d.n).length, nm = esc(k.name);
    const facts = `This week: practiced <b>${days} days</b>, answered <b>${s7.answered} questions</b>, <b>${s7.acc}%</b> correct.`;
    let v;
    if (!all.answered) v = ['🌱', 'y', `${nm} has not started practicing`, 'Try 10 minutes today. Metiq adjusts the questions to your child\'s ability.'];
    else if (!s7.answered) v = ['😴', 'y', `${nm} has not practiced this week`, `Last practiced ${ago(all.last)}. Try again, 10 minutes is enough.`];
    else if ((s7.answered >= 10 && s7.acc < 60) || kidState(k).st === 'bantu') v = ['💪', 'y', `${nm} is working hard, some topics need help`, `${facts} See Help at home.`];
    else if (days >= 3 && s7.acc >= 70) v = ['🌟', 'g', `${nm} is diligent and understands`, facts];
    else if (days >= 3) v = ['👍', 'g', `${nm} is practicing diligently`, facts];
    else v = ['🙂', 'y', `${nm} has practiced, could do a bit more`, `${facts} Aim for 3 days a week.`];
    return { s7, all, days, icon: v[0], tone: v[1], title: v[2], text: v[3] };
  }
  const weekDots = (s7) => `<div class="wkdots" aria-label="Days practiced this week">${s7.byDay.map((d) => `<span class="${d.n ? 'on' : ''}"><i>${d.n ? '✓' : ''}</i><small>${DOW[new Date(d.d0).getDay()]}</small></span>`).join('')}</div>`;
  const parentTasks = (k) => S.assignmentsFor(k.id).filter((a) => !S.isDone(a.id, k.id) && !asgComplete(a, k.id));
  function parentReportHTML(k) {
    const v = parentVerdict(k), good = strengths(k.id), weak = weaknesses(k.id), nm = esc(k.name), c = S.cls(k.classId) || {}, tasks = parentTasks(k), dg = S.diagOf(k.id, 'b') || S.diagOf(k.id);
    const wrong = S.answersOf(k.id).filter((a) => !a.ok).sort((a, b) => b.ts - a.ts).slice(0, 6);
    return `<section class="card phead ${v.tone}"><div class="phead-top"><span class="av lg">${avHTML(k.avatar)}</span><div class="grow"><small>${esc(c.name || 'Learning report')}</small><h1><span aria-hidden="true">${v.icon}</span> ${v.title}</h1></div></div><p>${v.text}</p>${v.all.answered ? weekDots(v.s7) : ''}</section>
      ${tasks.length ? `<section class="card"><div class="rhead"><h2>📌 Tasks from the teacher <span class="pill">${tasks.length}</span></h2><span class="grow"></span><a class="btn sm" href="#/notifikasi">See tasks</a></div>${tasks.slice(0, 3).map((a) => `<div class="lrow"><span class="grow"><b>${esc(a.note || 'Tasks from your teacher')}</b>${a.due ? `<small>due ${esc(fdue(a.due))}</small>` : ''}</span></div>`).join('')}</section>` : ''}
      ${weak.length ? `<section class="card phome"><h2>🏠 Help at home</h2>${weak.slice(0, 2).map((w) => `<div class="phelp"><b>${w.skill.name}</b>${w.example ? `<p class="small ex">"${esc(w.example.text)}" answered <b class="strike">${esc(w.example.given)}</b>, should be <b>${esc(w.example.answer)}</b>.</p>` : ''}<p class="small tip">💡 ${w.tag && w.tag !== 'konsep' ? TAGS[w.tag].tip : UNITS.find((u) => u.id === w.skill.unit).tip}</p>${LESSONS[w.skill.unit] ? `<a class="btn sm ghost" href="#/pelajaran/${w.skill.unit}">📖 Learn together</a>` : ''}</div>`).join('')}</section>` : ''}
      <section class="card good"><h2>✅ Can already do <span class="pill">${good.length} topics</span></h2>${good.length ? good.slice(0, 3).map((g) => `<div class="lrow"><span class="grow">${g.skill.name}</span></div>`).join('') + (good.length > 3 ? `<p class="small muted">and ${good.length - 3} more topics</p>` : '') : `<p class="muted">No topics mastered yet. Keep practicing!</p>`}</section>
      ${dg ? `<p class="small muted center">Right now ${nm} is learning <b>${gname(dg.level)} material</b>, based on the assessment.</p>` : ''}
      ${v.all.answered ? `<details class="card pmore"><summary><b>See details</b> <span class="muted small">Progress by chapter and incorrect answers</span></summary>
        <div class="kpis"><div class="kpi"><small>Total questions</small><b>${v.all.answered}</b></div><div class="kpi"><small>Correct answers</small><b>${v.all.acc}%</b></div><div class="kpi"><small>Time learning</small><b class="sm">${fmtTime(v.all.ms)}</b></div></div>
        <h3 class="sub">Progress by chapter</h3>${reportGrades(k.id).map((g, _, all) => (all.length > 1 ? `<p class="small"><b>${gname(g)}</b></p>` : '') + unitsOf(g).map((u) => { const us = unitScore(k.id, u); return `<div class="uprog"><span>${u.icon} ${u.name}</span><span class="ubar"><i style="width:${us.avg}%;background:${u.color}"></i></span><small>${us.prof}/${us.total}</small></div>`; }).join('')).join('')}
        ${wrong.length ? `<h3 class="sub">Incorrect answers</h3>${wrong.map((a) => `<div class="wa"><p>${esc(a.text)}</p><small>${nm}'s answer: <b class="strike">${esc(a.given)}</b> · Correct: <b>${esc(a.answer)}</b> · ${ago(a.ts)}</small></div>`).join('')}` : ''}</details>` : ''}`;
  }
  function viewParentHome() {
    const ses = session.get(), demoKids = ses.role === 'ortu' && ses.demo && ses.kids, codeKids = ses.role === 'ortu' && !ses.demo && ses.pcode && ses.kids;
    if (!(ses.role === 'ortu' && (ses.ptoken || demoKids || codeKids))) return go('#/ortu');
    const p = demoKids ? { name: (tryInfo() || {}).name } : codeKids ? { name: 'Parent' } : S.db.parent || {};
    const kids = demoKids || codeKids ? ses.kids.map((id) => S.student(id)).filter(Boolean) : S.db.students;
    app.innerHTML = shell(`
      <section class="dhead"><div><small class="muted">${codeKids ? `Family code ${esc(ses.pcode)}` : 'Parent accounts'}</small><h1>Hello, ${esc(p.name || 'Parent')}</h1></div></section>
      ${kids.map((k) => { const v = parentVerdict(k), c = S.cls(k.classId) || {}, t = parentTasks(k);
        return `<section class="card phead ${v.tone}"><div class="phead-top"><span class="av lg">${avHTML(k.avatar)}</span><div class="grow"><small>${esc(c.name || '')}${c.teacherName ? ' · ' + esc(c.teacherName) : ''}</small><h2><span aria-hidden="true">${v.icon}</span> ${v.title}</h2></div></div>${v.all.answered ? weekDots(v.s7) : `<p>${v.text}</p>`}
          ${t.length ? `<p class="small"><a href="#/notifikasi">📌 ${t.length} tasks from the teacher not finished</a></p>` : ''}
          <div class="row-btn left"><a class="btn" href="#/ortu/laporan/${k.id}">View report</a>${codeKids ? '' : `<button class="btn ghost" data-act="askid" data-id="${k.id}">Learn as ${esc(k.name)}</button>`}</div>
          ${demoKids || codeKids ? '' : `<p class="small kunlink"><button class="link muted" data-act="punlink" data-id="${k.id}">Unlink from account</button></p>`}</section>`; }).join('') || '<section class="card center"><div class="bigemoji">🧒</div><p class="muted">No children connected yet. Enter the code from the teacher below.</p></section>'}
      ${codeKids ? '' : demoKids ? `<section class="card"><h2>Add a child</h2><p class="muted small">In demo mode, add another child by trying as a student on this device (Log out → Try as a student → child's name), then log in again as a parent.</p></section>${realParentCard(kids[0] || {})}`
        : `<section class="card"><h2>Add a child</h2><p class="muted small">Enter the parent code from the teacher.</p>
        <form data-form="plink" class="form inline"><input name="code" class="codein sm" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC123" required><button class="btn">Add</button></form></section>`}
    `, { right: topRight() });
  }
  function viewParentReport(sid) {
    const ses = session.get();
    const k = ses.role === 'ortu' && S.student(sid || ses.id) && (!ses.kids || ses.kids.includes(sid || ses.id)) && S.student(sid || ses.id);
    if (!k) return go(ses.ptoken ? '#/ortu/anak' : '#/ortu');
    logParentView(k.id);
    app.innerHTML = shell((ses.ptoken || (ses.kids && ses.kids.length > 1) ? '<a class="back" href="#/ortu/anak">← My children</a>' : '') + parentReportHTML(k) + (ses.demo ? realParentCard(k) : ''), { right: topRight() });
  }

  /* ---------- Panduan pemakaian ---------- */
  function viewManual(tab) {
    const M = window.METIQ_MANUAL, ses = session.get();
    if (!M[tab] || tab === 'faq') tab = ses.role === 'siswa' ? 'siswa' : ses.role === 'ortu' ? 'ortu' : 'guru';
    if (tab === 'ortu' && !PARENTS_ON) tab = 'siswa';
    const m = M[tab];
    const tabs = [['guru', `${avHTML('svg:ustadzah')} Teacher`], ['ortu', '👨‍👩‍👧 Parent'], ['siswa', '🧒 Students']];
    app.innerHTML = shell(`
      <button class="back link noprint" data-act="back">← Back</button>
      <div class="gtabs noprint">${tabs.filter(([k]) => PARENTS_ON || k !== 'ortu').map(([k, l]) => `<a class="${k === tab ? 'on' : ''}" href="#/panduan/${k}">${l}</a>`).join('')}</div>
      <div class="mprint">
        <section class="card mhead"><h1>📘 ${m.title}</h1><p>${m.intro}</p><p class="muted small">Metiq · ${esc(location.origin + location.pathname)}</p><button class="btn sm ghost noprint" data-act="printmanual">🖨️ Print / save PDF</button></section>
        <div class="ltoc noprint">${m.sections.map((x, i) => `<button data-act="mgo" data-i="${i}">${x.icon} ${x.t}</button>`).join('')}</div>
        ${m.sections.map((x, i) => `<section class="card msec" id="ms-${i}"><h2><span class="micon">${x.icon}</span>${i + 1}. ${x.t}</h2><ol class="lsteps">${x.steps.map((st) => `<li>${st}</li>`).join('')}</ol>${x.tip ? `<div class="mtip">💡 ${x.tip}</div>` : ''}</section>`).join('')}
        <section class="card msec"><h2><span class="micon">❓</span>Frequently asked questions</h2>${M.faq.map(([q, a]) => `<details class="faq" open><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>
      </div>`);
  }

  /* ---------- Notifikasi tugas ---------- */
  // Waktu terakhir halaman notifikasi dibuka, disimpan per akun di perangkat ini
  const seenKey = () => { const x = session.get(); return 'metiq_seen_' + (x.role === 'guru' ? 'g' + x.id : x.ptoken ? 'p' + (x.pid || x.ptoken.slice(0, 10)) : 'o' + (x.pcode || x.id)); };
  const getSeen = () => { try { return +localStorage.getItem(seenKey()) || 0; } catch (e) { return 0; } };
  const setSeen = () => { try { localStorage.setItem(seenKey(), String(Date.now())); } catch (e) {} };
  const asgComplete = (a, sid) => a.skills.filter((k) => SKILLS[k]).every((k) => S.progress(sid, k).score >= 80);
  // Catat tugas selesai di perangkat dan (jika memakai server) kirim ke guru
  function markDone(aid, sid, by) {
    if (S.isDone(aid, sid)) return Promise.resolve();
    S.markDone(aid, sid, by);
    if (!cloudOn()) return Promise.resolve();
    const k = S.student(sid), c = k && S.cls(k.classId), code = session.get().code || (c && c.code);
    if (!code) return Promise.resolve();
    const a = S.assignmentsOf(k.classId).find((x) => x.id === aid);
    const summary = a ? a.skills.filter((x) => SKILLS[x]).map((x) => { const p = S.progress(sid, x); return { id: x, code: SKILLS[x].code, name: SKILLS[x].name, grade: SKILLS[x].grade, score: p.score || 0, attempts: p.att || 0, correct: p.ok || 0 }; }) : null;
    const args = { p_code: code, p_student_id: sid, p_assignment_id: aid, p_by: by };
    // tanpa ringkasan jika server belum menjalankan 006_research_feedback_bbo.sql
    return Cloud.rpc('complete_assignment', Object.assign({ p_summary: summary }, args)).catch((e) => (e.status === 404 ? Cloud.rpc('complete_assignment', args) : null)).catch(() => {});
  }
  // Guru: siswa yang menyelesaikan tugas. Orang tua: tugas baru untuk anaknya.
  function notifItems() {
    const x = session.get();
    if (x.role === 'guru') {
      return S.db.done.map((d) => ({ d, a: S.db.assignments.find((g) => g.id === d.aid), k: S.student(d.sid) }))
        .filter((n) => n.a && n.k).map((n) => Object.assign(n, { at: n.d.at })).sort((p, q) => q.at - p.at);
    }
    if (x.role === 'ortu') {
      const kids = x.ptoken ? S.db.students : (x.kids || [x.id]).map((id) => S.student(id)).filter(Boolean);
      return kids.flatMap((k) => S.assignmentsFor(k.id).map((a) => ({ at: a.createdAt || 0, a, k }))).sort((p, q) => q.at - p.at);
    }
    return [];
  }
  const bellHTML = () => { const seen = getSeen(), n = notifItems().filter((i) => i.at > seen).length; return `<a class="bell" href="#/notifikasi" aria-label="Notifications${n ? `, ${n} new` : ''}">🔔${n ? `<b>${n > 9 ? '9+' : n}</b>` : ''}</a>`; };
  const topRight = () => `<span class="topr"><a class="help" href="#/panduan" aria-label="Guide">❓</a>${bellHTML()}<button class="link" data-act="logout">Log out</button></span>`;

  function viewNotifications() {
    const x = session.get();
    if (x.role !== 'guru' && x.role !== 'ortu') return go('#/');
    const seen = getSeen(), items = notifItems();
    let body;
    if (x.role === 'guru') {
      body = items.length ? items.map((n) => `<a class="notif ${n.at > seen ? 'new' : ''}" href="#/guru/siswa/${n.k.id}"><span class="av sm">${avHTML(n.k.avatar)}</span><span class="grow"><b>${esc(n.k.name)}</b> finished the task <b>${esc(n.a.note || 'Tasks')}</b><small>${ftime(n.at)} · ${doneText(n)}</small></span>${n.at > seen ? '<i class="dot-new"></i>' : ''}</a>`).join('')
        : emptyCard('No notifications yet', 'Notifications appear when students finish tasks you assigned.');
    } else {
      body = items.length ? items.map((n) => {
        const sk = n.a.skills.filter((k) => SKILLS[k]), prof = sk.filter((k) => S.progress(n.k.id, k).score >= 80).length;
        const reported = S.isDone(n.a.id, n.k.id), done = reported || prof === sk.length, c = S.cls(n.k.classId) || {};
        return `<section class="card notif-card ${n.at > seen ? 'new' : ''}"><div class="lrow"><span class="av sm">${avHTML(n.k.avatar)}</span><span class="grow"><b>📌 ${n.a.students && n.a.students.length ? 'Special tasks' : 'New task'} for ${esc(n.k.name)}</b><small>${esc(c.teacherName || 'Teacher')}${n.at ? ` · ${ftime(n.at)}` : ''}${n.a.due ? ` · due ${esc(fdue(n.a.due))}` : ''}</small></span>${n.at > seen ? '<i class="dot-new"></i>' : ''}</div>
          <p><b>${esc(n.a.note || 'Tasks from your teacher')}</b></p>
          <div class="small">${sk.map((k) => `<span class="pill ${S.progress(n.k.id, k).score >= 80 ? 'okp' : ''}">${SKILLS[k].code} ${SKILLS[k].name}${S.progress(n.k.id, k).score >= 80 ? ' ✅' : ''}</span>`).join(' ')}</div>
          <p class="small ${done ? 'okc' : 'muted'}">${done ? `✅ Already finished${reported ? ' and sent to the teacher' : ''}` : `${prof} of ${sk.length} skills are proficient`}</p>
          <div class="row-btn left">${x.ptoken && !done ? `<button class="btn sm" data-act="askid" data-id="${n.k.id}">Do it as ${esc(n.k.name)}</button>` : ''}${reported ? '' : `<button class="btn sm ghost" data-act="reportdone" data-a="${n.a.id}" data-s="${n.k.id}">Report as done</button>`}</div>${feedbackHTML(n.a, n.k.id, 'ortu')}</section>`;
      }).join('') : emptyCard('No tasks yet', 'Notifications appear when the teacher gives your child a new task.');
    }
    const back = x.role === 'guru' ? '#/guru/ringkasan' : x.ptoken ? '#/ortu/anak' : '#/ortu/laporan';
    setSeen();
    app.innerHTML = shell(`<a class="back" href="${back}">← Back</a><h1>🔔 Notifications</h1><p class="muted small">${x.role === 'guru' ? 'Students who have finished tasks, newest first.' : 'Tasks from the teacher for your child, newest first.'}</p>${body}`, { right: topRight() });
  }

  /* ---------- Pemilih avatar ---------- */
  function avatarTarget(target) {
    const ses = session.get();
    if (target === 'saya' && ses.role === 'siswa') { const k = S.student(ses.id); return k && { who: k.name, cur: k.avatar, back: '#/belajar' }; }
    if (target === 'guru' && ses.role === 'guru') { const t = S.teacher(ses.id); return t && { who: t.name, cur: t.avatar || 'svg:ustadzah', back: '#/guru/ringkasan' }; }
    if (target.startsWith('siswa-') && ses.role === 'guru') { const k = S.student(target.slice(6)); return k && { who: k.name, cur: k.avatar, back: '#/guru/kelola' }; }
    return null;
  }
  function viewAvatar(target) {
    const t = avatarTarget(target || '');
    if (!t) return go('#/');
    app.innerHTML = shell(`
      <a class="back" href="${t.back}">← Back</a>
      <section class="card center"><div class="av lg avnow">${avHTML(t.cur)}</div><h1>Choose avatar ${esc(t.who)}</h1></section>
      ${window.METIQ_AVATARS.CATALOG.map(([cat, list]) => `<section class="card"><h2>${cat}</h2><div class="avgrid">${list.map((a) => `<button class="avopt ${a === t.cur ? 'on' : ''}" data-act="pickav" data-t="${target}" data-a="${esc(a)}" title="${esc(window.METIQ_AVATARS.NAMES[a] || '')}">${avHTML(a)}</button>`).join('')}</div></section>`).join('')}`);
  }
  async function saveAvatar(target, a) {
    const ses = session.get(), t = avatarTarget(target);
    if (!t) return;
    try {
      if (target === 'saya') { if (cloudOn()) await Cloud.rpc('student_set_avatar', { p_code: ses.code, p_student_id: ses.id, p_avatar: a }); S.setStudentAvatar(ses.id, a); }
      else if (target === 'guru') { if (cloudOn()) await Cloud.rpc('teacher_set_avatar', { p_token: ses.token, p_avatar: a }); S.setTeacherAvatar(ses.id, a); }
      else { const sid = target.slice(6); if (cloudOn()) await Cloud.rpc('teacher_set_student_avatar', { p_token: ses.token, p_student_id: sid, p_avatar: a }); S.setStudentAvatar(sid, a); }
      toast('Avatar changed ✔'); go(t.back);
    } catch (e) { toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }

  /* ---------- Pelajaran: materi singkat + contoh "Ayo coba!" per bab ---------- */
  const LESSONS = window.METIQ_LESSONS || {};
  // Soal +/− bersusun SD (bilangan bulat, ada angka puluhan): penjelasan diberi animasi menyimpan dan meminjam per kolom
  const kolomOf = (q, sk) => {
    const m = q && q.meta, K = window.METIQ_KOLOM;
    if (!K || !m || !sk || sk.grade < 1 || !Number.isInteger(m.a) || !Number.isInteger(m.b)) return '';
    // pembagian bersusun (Kelas 3-5): porogapit langkah demi langkah (bagi, kali, kurang, turunkan)
    if (m.op === '/') return sk.grade <= 5 && K.bagi && m.a >= 10 && (/class="pgap/.test(q.vis || '') || /bersusun|bersisa|dua angka/i.test(sk.name)) ? K.bagi(m.a, m.b) : '';
    // perkalian bersusun (Kelas 3-5): kalikan per angka, tulis sejajar tempatnya, jumlahkan dengan angka simpanan
    if (m.op === 'x') return sk.grade <= 5 && K.kali && m.kind !== 'unit' && /class="stack/.test(q.vis || '') ? K.kali(m.a, m.b) : '';
    if (sk.grade > 4 || (m.op !== '+' && m.op !== '-')) return '';
    if (!/class="stack/.test(q.vis || '') && !/menyimpan|meminjam|bersusun/i.test(sk.name)) return '';
    return Math.max(m.a, m.b) >= 10 ? K.html(m.a, m.op, m.b) : '';
  };
  function lessonExample(skillId) {
    const q = SKILLS[skillId].gen();
    return `<p class="qtext">${q.text}</p>${q.vis ? `<div class="qvis">${q.vis}</div>` : ''}${q.options ? `<div class="lopts">${q.options.map((o) => `<span>${o}</span>`).join('')}</div>` : ''}
      <details class="lsol"><summary>See how to solve it</summary><p class="lans">Answer: <b>${q.unit === 'Rp' ? 'Rp' : ''}${q.answer}</b></p><p>${q.explain}</p>${kolomOf(q, SKILLS[skillId])}</details>`;
  }
  // Isi pelajaran dipakai di halaman Pelajaran dan sebagai lembar di atas soal (inPractice), supaya soal tidak hilang saat anak membuka materi
  function lessonInner(uid, inPractice) {
    const u = UNITS.find((x) => x.id === uid), les = LESSONS[uid];
    const kid = session.get().role === 'siswa';
    const practice = (id) => (kid ? `#/latihan/${id}` : `#/coba/${id}`);
    const prog = kid ? S.progressAll(session.get().id) : {};
    return `
      ${inPractice ? '' : '<button class="back link" data-act="back">← Back</button>'}
      <section class="card lhead" style="--c:${u.color}"><span class="uicon">${u.icon}</span><div class="grow"><small class="muted">Lesson · ${gname(u.grade)} · Chapter ${u.id}</small><h1>${u.name}</h1><p>${les.intro}</p></div><button class="say" data-act="lsay" data-u="${uid}" data-i="-1" aria-label="Read aloud">🔊</button></section>
      ${(() => { const b = unitBuddy(u); return b ? `<div class="mq-say lbuddy">${MQ.svg('hello', { size: 76, who: b, enter: !inPractice })}<div class="mq-bubble"><p>Let's learn together with <b>${buddyName(b)}</b>!</p></div></div>` : ''; })()}
      ${(window.METIQ_JOBS || { MISSIONS: [] }).MISSIONS.some((m) => m.units.includes(uid)) ? `<a class="jwhere" href="#/profesi/topik/${uid}">🧑‍🔧 What jobs use this?</a>` : ''}
      ${hikmahHTML(uid)}
      ${window.METIQ_ANIM.has(uid) ? `<section class="card anim-card"><h2>🎬 Animation: ${u.name}</h2><div id="anim-box"></div></section>` : ''}
      ${les.parts.length > 1 ? `<div class="ltoc">${les.parts.map((p, i) => `<button data-act="lgo" data-i="${i}">${i + 1}. ${p.t}</button>`).join('')}</div>` : ''}
      ${les.parts.map((p, i) => `<section class="card lpart" id="lp-${i}">
        <div class="lph"><span class="lnum" style="background:${u.color}">${i + 1}</span><h2>${p.t}</h2><button class="say sm" data-act="lsay" data-u="${uid}" data-i="${i}" aria-label="Read aloud">🔊</button></div>
        <ol class="lsteps">${p.steps.map((st) => `<li>${st}</li>`).join('')}</ol>
        ${p.sg ? `<div class="sgnote"><span class="sgtag">Singapore method</span> ${p.sg}</div>` : ''}
        <div class="lex"><h3>Let's try!</h3><div id="lex-${i}">${lessonExample(p.ex)}</div>
          <div class="row-btn left"><button class="btn sm ghost" data-act="lexnew" data-i="${i}" data-sk="${p.ex}">🔄 Another example</button>${inPractice ? '' : `<a class="btn sm" href="${practice(p.ex)}">Practice: ${SKILLS[p.ex].name} →</a>`}</div></div>
      </section>`).join('')}
      ${inPractice ? '' : `<section class="card"><h2>Practice in this chapter</h2><div class="sklist">${u.skills.map((s) => (kid ? skillLink(s.id, prog[s.id]) : `<a class="sk" href="${practice(s.id)}"><span class="sk-code">${s.code}</span><span class="sk-name">${s.name}</span><span class="chip lv0">→</span></a>`)).join('')}</div></section>`}`;
  }
  function viewLesson(uid) {
    const u = UNITS.find((x) => x.id === uid), les = LESSONS[uid];
    if (!u || !les) return go('#/kurikulum');
    app.innerHTML = shell(lessonInner(uid, false));
    window.METIQ_ANIM.mount(document.getElementById('anim-box'), uid);
  }
  // Materi dibuka di atas soal tanpa pindah halaman: soal, jawaban, dan penjelasan tetap utuh di belakangnya
  function openLessonOver(uid) {
    if (!UNITS.find((x) => x.id === uid) || !LESSONS[uid]) return toast('This chapter\'s material isn\'t available yet');
    if (document.getElementById('mqover')) return;
    const el = document.createElement('div'); el.id = 'mqover'; el.className = 'mq-over';
    el.innerHTML = `<div class="mq-over-top"><button class="mq-btn sm" data-act="lclose">← Back to the question</button></div>
      <div class="mq-over-body">${lessonInner(uid, true)}</div>
      <div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn pulse" data-act="lclose">Back to the question</button></div></div>`;
    document.body.appendChild(el); document.body.classList.add('mq-noscroll');
    // tombol kembali di HP menutup materi dulu, bukan keluar dari latihan
    try { history.pushState({ mqover: 1 }, ''); } catch (e) { /* tidak wajib */ }
    window.METIQ_ANIM.mount(document.getElementById('anim-box'), uid);
  }
  function closeLessonOver(fromPop) {
    const el = document.getElementById('mqover');
    if (el) { window.METIQ_ANIM.stop(); if ('speechSynthesis' in window) speechSynthesis.cancel(); el.remove(); document.body.classList.remove('mq-noscroll'); }
    if (!fromPop && history.state && history.state.mqover) history.back();
  }
  window.addEventListener('popstate', () => { if (document.getElementById('mqover')) closeLessonOver(true); });

  function hikmahHTML(uid) {
    const h = IMAN[uid];
    if (!h || curSettings().konteks !== 'islami') return '';
    const d = h.dalil || {};
    // Teks ayat/hadits hanya tampil setelah diperiksa ustadz/ustadzah. Ajakan, refleksi, dan adab
    // adalah tulisan sendiri, jadi tetap tampil walau dalil belum diperiksa.
    const adaLah = !!(d.ar || d.id);
    return `<section class="card hikmah"><h2>🌙 Wisdom: ${esc(h.tema || '')}</h2>
      ${adaLah ? `<blockquote>${d.ar ? `<p class="doa-ar" dir="rtl" lang="ar">${esc(d.ar)}</p>` : ''}${d.id ? `<p>${esc(d.id)}</p>` : ''}${d.ref ? `<cite>${esc(d.ref)}</cite>` : ''}</blockquote>` : ''}
      ${h.ajakan ? `<p>${esc(h.ajakan)}</p>` : ''}${h.refleksi ? `<p><b>Reflect:</b> ${esc(h.refleksi)}</p>` : ''}${h.adab ? `<p><b>Adab:</b> ${esc(h.adab)}</p>` : ''}
      ${h.verifiedAt ? `<p class="small muted">Reviewed by ${esc(h.verifiedBy || '-')} · ${esc(h.verifiedAt)}</p>` : `<p class="small muted">Verses and hadith are being reviewed by an ustadz/ustadzah, so they aren't shown here yet.</p>`}</section>`;
  }

  /* Pratinjau soal untuk guru (tidak disimpan) */
  function viewPreview(id) {
    const sk = SKILLS[id]; if (!sk) return go('#/guru');
    const qs = Array.from({ length: 3 }, () => sk.gen());
    app.innerHTML = shell(`<button class="back link" data-act="back">← Back</button><h1>${sk.code} ${sk.name}</h1><p class="muted">Random sample question (not recorded).</p>
      ${qs.map((q) => `<section class="qcard"><p class="qtext">${q.text}</p>${q.vis ? `<div class="qvis">${q.vis}</div>` : ''}${q.options ? `<p class="small">Options: ${q.options.join(' · ')}</p>` : ''}<div class="explain"><b>Answer: ${q.answer}</b><p>${q.explain}</p></div></section>`).join('')}
      <button class="btn" data-act="reload">Another question</button>`);
  }

  /* ---------- Sehari Bekerja (A Day in This Job): misi matematika dari profesi nyata. Pola layar mengikuti Permainan ---------- */
  const J = window.METIQ_JOBS || { BANDS: [], PROFESSIONS: [], MISSIONS: [], INTERESTS: {}, TOPICS: {}, byId: () => null, prof: () => null };
  const bandOfGrade = (g) => (J.BANDS.find((b) => b.grades.includes(g)) || J.BANDS[1] || {}).id;
  const bandIdx = (id) => J.BANDS.findIndex((b) => b.id === id);
  // Jenjang: pilihan siswa sendiri, lalu kelas yang sedang dipelajari; tamu memilih saat pertama masuk
  function jobBand() {
    const sel = ls.get('metiq_jband', '');
    if (sel && bandIdx(sel) >= 0) return sel;
    return gameKid() ? bandOfGrade(getGrade()) : '';
  }
  const missionDone = (kid, m) => !!kid && (S.progress(kid.id, 'm:' + m.key).att || 0) > 0;
  const missionStars = (kid, m) => (kid ? S.progress(kid.id, 'm:' + m.key).ok || 0 : 0);
  const unitLink = (uid) => { const u = UNITS.find((x) => x.id === uid); return u ? `<a class="jtopic" href="${LESSONS[uid] ? '#/pelajaran/' + uid : '#/kurikulum'}">${u.icon} ${esc(u.name)}</a>` : ''; };
  const bandPills = (band) => `<div class="jbands" role="tablist" aria-label="Level">${J.BANDS.map((b) => `<button class="${b.id === band ? 'on' : ''}" data-act="jband" data-b="${b.id}" role="tab" aria-selected="${b.id === band}">${b.name}</button>`).join('')}</div>`;

  function viewJobs() {
    const kid = gameKid(), band = jobBand();
    if (!band) {
      app.innerHTML = mqPage(`<div class="mq-ghead"><a class="mq-ico" href="#/" aria-label="Back">${IC.back}</a><div class="mq-gsay">${MQ.svg('ask', { size: 74 })}<div class="mq-bubble"><p>What level are you at?</p></div></div></div>
        <div class="jpick">${J.BANDS.map((b) => `<button class="mq-btn ghost" data-act="jband" data-b="${b.id}"><b>${b.name}</b><small>${b.style}</small></button>`).join('')}</div>`, 'profesi');
      return;
    }
    const f = ls.get('metiq_jfilter', {}), inBand = J.MISSIONS.filter((m) => m.level === band);
    const profs = J.PROFESSIONS.filter((p) => (!f.i || p.interest === f.i) && inBand.some((m) => m.profession === p.id && (!f.t || m.topics.includes(f.t))));
    const chip = (k, v, label) => `<button class="${(f[k] || '') === v ? 'on' : ''}" data-act="jfilter" data-k="${k}" data-v="${v}">${label}</button>`;
    const tile = (p) => {
      const m = inBand.find((x) => x.profession === p.id), done = m && missionDone(kid, m), st = m ? missionStars(kid, m) : 0;
      return `<a class="mq-gt jtile" href="#/profesi/${p.id}" style="--c:${p.color};--bg:${JV.light(p.color, 0.88)}" aria-label="${esc(p.name)}${done ? ', done' : ''}">${done ? '<span class="new jdone">✓</span>' : ''}<span class="art">${JV.icon(p.id, p.color) || `<span class="jpeople">${p.people}</span>`}</span><b>${esc(p.name)}</b><small>${m ? esc(m.title) : ''}</small>${done ? `<span class="st">${[0, 1, 2].map((i) => gStar(i < st)).join('')}</span>` : ''}</a>`;
    };
    app.innerHTML = mqPage(`
      <div class="mq-ghead">${kid ? '' : `<a class="mq-ico" href="#/" aria-label="Back">${IC.back}</a>`}
        <div class="mq-gsay">${MQ.svg('happy', { size: 74 })}<div class="mq-bubble"><p>What will you be for a day today?</p></div></div></div>
      ${bandPills(band)}
      <div class="jfilters"><div>${chip('i', '', 'All interests')}${Object.entries(J.INTERESTS).map(([k, v]) => chip('i', k, v)).join('')}</div>
        <div>${chip('t', '', 'All topics')}${Object.entries(J.TOPICS).map(([k, v]) => chip('t', k, v)).join('')}</div></div>
      ${profs.length ? `<div class="mq-ggrid">${profs.map(tile).join('')}</div>` : `<p class="mq-note">No missions for this choice yet. Try another interest or topic.</p>`}
      <p class="mq-note">${kid ? `Missions finished: <b>${J.MISSIONS.filter((m) => missionDone(kid, m)).length}</b> of ${J.MISSIONS.length}` : 'Log in as a student so your missions are saved.'}</p>`, 'profesi');
  }

  function viewProfession(pid) {
    const p = J.prof(pid); if (!p) return go('#/profesi');
    const kid = gameKid(), band = jobBand();
    const list = J.MISSIONS.filter((m) => m.profession === pid).sort((a, b) => bandIdx(a.level) - bandIdx(b.level));
    app.innerHTML = mqPage(`
      <div class="mq-ghead"><a class="mq-ico" href="#/profesi" aria-label="Back">${IC.back}</a><span class="mq-gtitle">${esc(p.name)}</span></div>
      <section class="jhero" style="--c:${p.color}">${JV.stage(p.people, p.art, p.color)}
        <h2>What do they do?</h2><p>${esc(p.what)}</p><h2>The math they use</h2><p>${esc(p.math)}</p></section>
      <h2 class="jsub">Missions</h2>
      <div class="jmissions">${list.map((m) => { const done = missionDone(kid, m), st = missionStars(kid, m); return `<a class="jmis ${m.level === band ? 'mine' : ''}" href="#/misi/${m.id}" style="--c:${p.color}"><span class="lv">${(J.BANDS.find((b) => b.id === m.level) || {}).name}</span><span class="grow"><b>${esc(m.title)}</b><small>${m.topics.map((t) => J.TOPICS[t]).join(' · ')}${m.audio ? ' · 🎧 read aloud' : ''}</small></span>${done ? `<span class="st">${[0, 1, 2].map((i) => gStar(i < st)).join('')}</span>` : '<span class="go">›</span>'}</a>`; }).join('')}</div>`, 'profesi');
  }

  // Tempat misi dipakai: dari halaman pelajaran ("Dipakai di pekerjaan apa?")
  function viewJobTopic(uid) {
    const u = UNITS.find((x) => x.id === uid), list = J.MISSIONS.filter((m) => m.units.includes(uid));
    if (!u || !list.length) return go('#/profesi');
    app.innerHTML = mqPage(`
      <div class="mq-ghead"><button class="mq-ico" data-act="back" aria-label="Back">${IC.back}</button><span class="mq-gtitle">What jobs use this?</span></div>
      <p class="jlead">${u.icon} <b>${esc(u.name)}</b> is used in this job:</p>
      <div class="jmissions">${list.map((m) => { const p = J.prof(m.profession); return `<a class="jmis" href="#/misi/${m.id}" style="--c:${p.color}"><span class="jpeople">${p.people}</span><span class="grow"><b>${esc(p.name)}</b><small>${esc(m.title)} · ${(J.BANDS.find((b) => b.id === m.level) || {}).name}</small></span><span class="go">›</span></a>`; }).join('')}</div>`, 'profesi');
  }

  /* Pemutar misi: satu soal per layar; salah → petunjuk dan coba lagi (setelah 3 kali, jawaban ditunjukkan) */
  let JM = null;
  const JV = window.METIQ_JV;
  // Jejak perjalanan misi: Meti berjalan dari satu langkah ke langkah berikutnya sampai bendera
  const jTrail = (at) => { const t = document.getElementById('jtrail'); if (!t) return; t.style.setProperty('--at', at); t.querySelectorAll('i').forEach((d, k) => { d.classList.toggle('done', k < at); d.classList.toggle('now', k === at); }); };
  // Pergantian layar: isi lama bergeser keluar, isi baru masuk dari kanan
  function jSwap(fn) { const box = document.getElementById('pq'); if (!box || JM.busy) return; JM.busy = true; box.classList.remove('jt-in'); box.classList.add('jt-out'); setTimeout(() => { if (!JM) return; JM.busy = false; box.classList.remove('jt-out'); fn(); void box.offsetWidth; box.classList.add('jt-in'); }, 230); }
  const jAudio = (part) => (JM && JM.m.audio ? [`audio/en/kerja/${JM.m.key}-${part}.mp3`] : null);
  const jPlay = (part, delay) => { const a = jAudio(part); if (a) playClips(a, delay); };
  const jnum = (s) => {
    s = String(s).trim().replace(/[−–]/g, '-').replace(/,/g, '');
    if (/^-?\d+(\.\d+)?\/\d+(\.\d+)?$/.test(s)) { const [a, b] = s.split('/').map(Number); return b ? a / b : NaN; }
    return s === '' || s === '-' ? NaN : Number(s);
  };
  const jFmt = (v) => (Math.round(v * 1e4) / 1e4).toLocaleString('en-US', { maximumFractionDigits: 4 });
  function viewMission(id) {
    const m = J.byId(id); if (!m) return go('#/profesi');
    const p = J.prof(m.profession);
    JM = { m, p, i: -1, tries: 0, first: 0, input: '', sel: -1, place: {}, pick: null, t0: Date.now(), log: [] };
    app.innerHTML = `<div class="mq-top"><a class="mq-ico" href="#/profesi/${p.id}" aria-label="Log out">${IC.x}</a><div class="mq-prog"><i id="sbar" style="width:0%"></i></div>
        <button class="mq-ico mq-coretbtn" id="mqcoret" data-act="coret" aria-label="Scratch paper" hidden>✏️</button>${m.audio ? `<button class="mq-ico" data-act="jsay" aria-label="Listen">🔊</button>` : `<button class="mq-ico psound" data-act="sound" aria-label="Sound">${window.SFX.enabled() ? '🔔' : '🔕'}</button>`}</div>
      <div class="jtrail" id="jtrail" style="--n:${m.steps.length};--c:${p.color}"><u></u>${m.steps.map((_, k) => `<i style="left:${(k / m.steps.length) * 100}%"></i>`).join('')}<em>🏁</em><span>${MQ.svg('happy', { size: 40, enter: false })}</span></div>
      <main class="mq-screen jt-in" id="pq"></main><div class="mq-foot" id="fb"></div>`;
    jScene();
  }
  function jScene() {
    const { m, p } = JM, box = document.getElementById('pq'), fb = document.getElementById('fb');
    box.innerHTML = `<div class="jscene" style="--c:${p.color}">${JV.stage(p.people, m.art, p.color, true)}<small class="jlv">${esc(p.name)} · ${(J.BANDS.find((b) => b.id === m.level) || {}).name}</small><h1>${esc(m.title)}</h1>
      <div class="mq-say"><div>${MQ.svg('hello', { size: 76 })}</div><div class="mq-bubble"><span>${esc(m.scenario)}</span></div></div>
      ${m.simplified ? `<p class="jnote">ℹ️ ${esc(m.simplified)}</p>` : ''}</div>`;
    fb.className = 'mq-foot'; fb.innerHTML = `<div class="mq-foot-in"><button class="mq-btn pulse" data-act="jnext">Start mission</button></div>`;
    jPlay('s', 350);
  }
  function jStep() {
    const { m } = JM, st = m.steps[JM.i], box = document.getElementById('pq'), fb = document.getElementById('fb');
    JM.tries = 0; JM.input = ''; JM.sel = -1; JM.place = {}; JM.pick = null;
    // Kertas coret untuk langkah hitungan di atas jenjang TK; setiap langkah mulai dari kertas bersih
    const canCoret = m.level !== 'TK' && st.type !== 'drag';
    closeCoret(true); document.getElementById('mqcoret').hidden = !canCoret;
    document.getElementById('sbar').style.width = (JM.i / m.steps.length) * 100 + '%'; jTrail(JM.i);
    // Cerita misi (berisi datanya) dan jawaban langkah sebelumnya tetap terlihat di setiap langkah
    const found = JM.log.map((x, k) => `<li><small>Step ${k + 1}: ${esc(x.q)}</small><b>${x.a}</b></li>`).join('');
    const ctx = `<details class="jctx" ${m.level === 'TK' ? '' : 'open'}><summary>📋 Mission data</summary><p>${esc(m.scenario)}</p>${found ? `<ul class="jfound">${found}</ul>` : ''}</details>`;
    box.innerHTML = `<h2 class="mq-title jstept">Step ${JM.i + 1} of ${m.steps.length}</h2>${ctx}
      <div class="mq-say jq"><div id="mqm">${MQ.svg('normal', { size: 76, enter: false })}</div><div class="mq-bubble">${m.audio ? '<button class="mq-spk aud" data-act="jsay" aria-label="Listen to the question">' + IC.spk + '</button>' : ''}<span>${esc(st.question)}</span>${st.hint ? `<span class="jhintw"><button class="mq-link" data-act="jhint">💡 Need a hint?</button></span><span class="jhint" id="jhint" hidden>💡 ${esc(st.hint)}</span>` : ''}</div></div>
      ${st.vis ? `<div class="mq-vis">${st.vis}</div>` : st.type === 'drag' ? '' : `<div class="jmini" aria-hidden="true">${m.art}</div>`}${canCoret ? '<button class="mq-coretcta" data-act="coret">✏️ Scratch paper</button>' : ''}<div id="jbody"></div>`;
    jBody(); jFit();
    jPlay('q' + (JM.i + 1), 300);
  }
  // Grafik dan kotak jawaban harus terlihat di atas papan angka; di layar pendek kartu Data dilipat lebih dulu, baru halaman digeser
  function jFit() {
    window.scrollTo(0, 0);
    const foot = document.getElementById('fb'), ctx = document.querySelector('#pq .jctx'), tgt = document.querySelector('#pq .mq-ans') || document.querySelector('#pq .mq-vis');
    if (!foot || !tgt) return;
    const over = () => tgt.getBoundingClientRect().bottom + 8 - foot.getBoundingClientRect().top;
    if (ctx && ctx.open && over() > 0) ctx.open = false;
    if (over() > 0) window.scrollBy(0, over());
  }
  // Isi langkah sesuai jenisnya; dipanggil ulang setiap kali jawaban berubah
  function jBody() {
    const st = JM.m.steps[JM.i], body = document.getElementById('jbody'), fb = document.getElementById('fb');
    let ready = false, keys = '';
    if (st.type === 'choice') {
      body.innerHTML = `<div class="mq-opts ${st.options.every((o) => strip(o).length <= 4) ? 'short' : ''}">${st.options.map((o, i) => `<button class="mq-opt ${i === JM.sel ? 'sel' : ''} ${strip(o).length <= 3 ? 'jbig' : ''}" data-act="jopt" data-i="${i}">${o}</button>`).join('')}</div>`;
      ready = JM.sel >= 0;
    } else if (st.type === 'number') {
      body.innerHTML = `<div class="mq-ans">${st.unit ? `<span class="u">${esc(st.unit)}</span>` : ''}<div class="mq-disp" id="indisp">${esc(JM.input) || '&nbsp;'}</div></div>`;
      keys = `${Number.isInteger(st.answer) && st.answer >= 0 ? '' : `<div class="mq-keys extra">${['−', '.', '/'].map((k) => `<button class="mq-key" data-act="jkey" data-k="${k}">${k}</button>`).join('')}</div>`}
        <div class="mq-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="mq-key" data-act="jkey" data-k="${n}">${n}</button>`).join('')}<button class="mq-key del" data-act="jkey" data-k="del" aria-label="Delete">⌫</button><button class="mq-key" data-act="jkey" data-k="0">0</button></div>`;
      ready = JM.input !== '';
    } else if (st.type === 'drag') {
      const placed = new Set(Object.values(JM.place).flat());
      const item = (it) => `<button class="jitem ${JM.pick === it.id ? 'pick' : ''}" data-act="jitem" data-id="${it.id}" aria-label="Item">${it.html}</button>`;
      const pool = st.items.filter((it) => !placed.has(it.id));
      if (st.mode === 'order') {
        const seq = JM.place.seq || [];
        body.innerHTML = `<p class="jhow">Tap or drag to the numbered boxes, in order.</p><div class="jslots">${st.items.map((_, k) => { const id = seq[k], it = st.items.find((x) => x.id === id); return `<div class="jslot" data-slot="${k}"><small>${k + 1}</small>${it ? item(it) : ''}</div>`; }).join('')}</div>
          <div class="jpool">${pool.map(item).join('') || '<small>All placed. Tap an item in a box to take it back.</small>'}</div>`;
        ready = seq.length === st.items.length;
      } else {
        body.innerHTML = `<p class="jhow">Tap an item, then tap its box, or drag it to the box.</p><div class="jbins">${st.bins.map((b) => `<div class="jbin" data-bin="${b.id}" data-act="jbin"><b>${b.label}</b><div>${(JM.place[b.id] || []).map((id) => item(st.items.find((x) => x.id === id))).join('')}</div></div>`).join('')}</div>
          <div class="jpool">${pool.map(item).join('') || '<small>All sorted.</small>'}</div>`;
        ready = pool.length === 0;
      }
    }
    // Baris tombol angka muncul saat kertas coret terbuka; keadaan terlipat atau terbuka tidak boleh hilang saat jawaban diketik
    const krow = keys && JM.m.level !== 'TK' ? '<div class="mq-krow"><button class="mq-ktog" data-act="keystog" aria-label="Show or hide the number keys">🔢 <span class="ka">Number keys</span><span class="kb">Hide</span> <i>▲</i></button><span class="mq-mini">Answer: <b id="indisp2">–</b></span></div>' : '';
    const kept = ['cor', 'kshow'].filter((c) => fb.classList.contains(c));
    fb.className = ['mq-foot', ...(keys && JM.m.level !== 'TK' ? ['compact'] : []), ...kept].join(' ');
    fb.innerHTML = `<div class="mq-foot-in">${krow}${keys}<button class="mq-btn" id="mqcheck" data-act="jcheck" ${ready ? '' : 'disabled'}>Check</button></div>`;
    { const d2 = document.getElementById('indisp2'); if (d2) d2.textContent = JM.input || '–'; }
    document.getElementById('pq').style.paddingBottom = fb.offsetHeight + 20 + 'px';
  }
  function jCorrect(st) {
    if (st.type === 'choice') return st.options[JM.sel] === st.answer;
    if (st.type === 'number') { const v = jnum(JM.input); return !isNaN(v) && Math.abs(v - st.answer) <= (st.tol ?? 1e-6); }
    if (st.mode === 'order') return (JM.place.seq || []).join() === st.answer.join();
    return st.items.every((it) => (JM.place[it.bin] || []).includes(it.id));
  }
  const jAnswerText = (st) => (st.type === 'number' ? `${jFmt(st.answer)}${st.unit ? ' ' + st.unit : ''}` : st.type === 'choice' ? st.answer : st.mode === 'order' ? st.answer.map((id) => st.items.find((x) => x.id === id).html).join(' ') : st.bins.map((b) => `${b.label}: ${st.items.filter((x) => x.bin === b.id).map((x) => x.html).join(' ')}`).join(' · '));
  function jCheck() {
    const st = JM.m.steps[JM.i], ok = jCorrect(st), fb = document.getElementById('fb'), m = document.getElementById('mqm');
    // Umpan balik butuh ruang; kertas coret disimpan dengan isinya dan kembali saat "Coba lagi"
    { const pad = document.getElementById('coret'); JM.padBack = !!(pad && !pad.hidden); closeCoret(false); }
    if (m) { m.innerHTML = MQ.svg(ok ? 'happy' : 'oops', { size: 76, enter: false }); m.firstChild.classList.add('mq-react'); }
    if (ok) {
      if (!JM.tries) JM.first++;
      { const v = document.querySelector('#pq .mq-vis'); if (st.done && v) v.innerHTML = st.done; const b = document.createElement('div'); b.innerHTML = JV.burst(); const host = document.querySelector('#pq .mq-say'); if (host) { host.style.position = 'relative'; host.appendChild(b.firstChild); } }
      JM.log.push({ q: st.question, a: jAnswerText(st), ex: st.explanation, first: !JM.tries });
      window.SFX.correct();
      fb.className = 'mq-foot ok';
      fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${IC.ok}</span>${['Correct!', 'Exactly right!', 'Great!'][JM.i % 3]}</div><div class="mq-fbody"><p>${esc(st.explanation)}</p></div><button class="mq-btn" data-act="jnext">Next</button></div>`;
      jPlay('e' + (JM.i + 1), 300);
    } else {
      JM.tries++;
      window.SFX.wrong();
      if (JM.tries >= 3) {
        JM.log.push({ q: st.question, a: jAnswerText(st), ex: st.explanation, first: false });
        fb.className = 'mq-foot no';
        fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${IC.x}</span>Let's see how</div><div class="mq-fbody"><p>The answer: <b>${jAnswerText(st)}</b></p><p>${esc(st.explanation)}</p></div><button class="mq-btn" data-act="jnext">Next</button></div>`;
        jPlay('e' + (JM.i + 1), 300);
      } else {
        fb.className = 'mq-foot near';
        fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">!</span>Not quite</div><div class="mq-fbody"><p>💡 ${esc(st.hint)}</p></div><button class="mq-btn" data-act="jretry">Try again</button></div>`;
        jPlay('h' + (JM.i + 1), 300);
      }
    }
    document.getElementById('pq').style.paddingBottom = fb.offsetHeight + 20 + 'px';
  }
  function jFinish() {
    const { m, p } = JM, kid = gameKid(), n = m.steps.length, stars = JM.first === n ? 3 : JM.first >= n / 2 ? 2 : 1;
    closeCoret(true); document.getElementById('mqcoret').hidden = true;
    document.getElementById('sbar').style.width = '100%'; jTrail(n);
    if (kid) {
      const before = missionStars(kid, m), res = S.recordMission(kid.id, m.key, stars, Date.now() - JM.t0);
      if (cloudOn()) Cloud.queueProgress(kid.id, session.get().code, 'm:' + m.key, res);
      const gain = Math.max(0, stars - before);
      if (gain) { const sr = S.addStars(kid.id, gain); if (cloudOn() && sr.entry) Cloud.queueProgress(kid.id, session.get().code, sr.key, sr.entry); }
    }
    tlog('mission', { m: m.key, st: stars });
    if (stars >= 3) window.SFX.mastered(); else window.SFX.levelUp();
    const higher = J.MISSIONS.filter((x) => x.profession === m.profession && bandIdx(x.level) > bandIdx(m.level));
    const others = J.MISSIONS.filter((x) => x.level === m.level && x.profession !== m.profession && !missionDone(kid, x));
    const nextM = others[0] || J.MISSIONS.find((x) => x.level === m.level && x.id !== m.id);
    document.getElementById('pq').innerHTML = `<div class="jresult" style="--c:${p.color}"><div class="jmedal" aria-hidden="true"><span>${m.art}</span></div>${MQ.svg(stars >= 2 ? 'cheer' : 'happy', { size: 110 })}<p class="jbadge">A day as a <b>${esc(p.name)}</b></p>
        <div class="mq-gstars">${[0, 1, 2].map((i) => gStar(i < stars)).join('')}</div><h1>Mission complete!</h1><p class="jwrap">${esc(m.wrapUp)}</p>
        <section class="jcard"><h2>✅ Answers and explanations</h2><ol>${JM.log.map((x) => `<li><small>${esc(x.q)}</small><b>${x.a}</b> ${x.first ? '⭐' : ''}<p>${esc(x.ex)}</p></li>`).join('')}</ol></section>
        <section class="jcard"><h2>🧮 The math you used</h2><div class="jtopics">${m.units.map(unitLink).join('')}</div></section>
        <section class="jcard"><h2>🚀 What's next?</h2><p>At higher levels, ${esc(p.name.toLowerCase())} uses: <b>${m.nextMath.map(esc).join(', ')}</b>.</p>
          ${higher.length ? `<div class="jmissions">${higher.map((x) => `<a class="jmis" href="#/misi/${x.id}" style="--c:${p.color}"><span class="lv">${(J.BANDS.find((b) => b.id === x.level) || {}).name}</span><span class="grow"><b>${esc(x.title)}</b></span><span class="go">›</span></a>`).join('')}</div>` : ''}</section></div>`;
    const fb = document.getElementById('fb'); fb.className = 'mq-foot';
    fb.innerHTML = `<div class="mq-foot-in jfoot">${nextM ? `<a class="mq-btn" href="#/misi/${nextM.id}">Another mission: ${esc(J.prof(nextM.profession).name)}</a>` : ''}<a class="mq-btn ghost" href="#/profesi/${p.id}">Back to ${esc(p.name)}</a></div>`;
    document.getElementById('pq').style.paddingBottom = fb.offsetHeight + 20 + 'px';
    jPlay('w', 500);
  }
  function jAct(act, el) {
    if (!JM) return;
    if ((act === 'jitem' || act === 'jbin') && Date.now() - jDragJustEnded < 400) return;
    const st = JM.i >= 0 ? JM.m.steps[JM.i] : null;
    if (act === 'jnext') { stopClips(); return jSwap(() => { JM.i++; return JM.i < JM.m.steps.length ? jStep() : jFinish(); }); }
    if (act === 'jretry') { const m = document.getElementById('mqm'); if (m) m.innerHTML = MQ.svg('normal', { size: 76, enter: false }); if (st.type === 'number') JM.input = ''; jBody(); if (JM.padBack) openCoret(); return; }
    if (act === 'jsay') return jPlay(JM.i < 0 ? 's' : 'q' + (JM.i + 1));
    if (act === 'jopt') { JM.sel = +el.dataset.i; window.SFX.step(); return jBody(); }
    if (act === 'jkey') {
      const k = el.dataset.k;
      if (k === 'del') JM.input = JM.input.slice(0, -1);
      else if (k === '−') JM.input = JM.input.startsWith('−') ? JM.input.slice(1) : '−' + JM.input;
      else if (JM.input.length < 12) JM.input += k;
      return jBody();
    }
    if (act === 'jcheck') return jCheck();
    if (act === 'jitem' && st && st.type === 'drag') {
      const id = el.dataset.id, inPool = !Object.values(JM.place).flat().includes(id);
      if (!inPool) { Object.keys(JM.place).forEach((k) => { JM.place[k] = JM.place[k].filter((x) => x !== id); }); JM.pick = null; return jBody(); }
      if (st.mode === 'order') { JM.place.seq = [...(JM.place.seq || []), id]; return jBody(); }
      JM.pick = JM.pick === id ? null : id; return jBody();
    }
    if (act === 'jbin' && st && JM.pick) { JM.place[el.dataset.bin] = [...(JM.place[el.dataset.bin] || []), JM.pick]; JM.pick = null; return jBody(); }
  }
  // Seret-dan-taruh dengan jari atau mouse (benda di kolam ke kotak bernomor atau kotak kelompok)
  let jDrag = null;
  document.addEventListener('pointerdown', (e) => {
    const it = e.target.closest('.jpool .jitem'); if (!it || !JM) return;
    const r = it.getBoundingClientRect(), g = it.cloneNode(true); g.classList.add('jghost'); g.style.left = r.left + 'px'; g.style.top = r.top + 'px'; g.style.width = r.width + 'px';
    jDrag = { id: it.dataset.id, g, dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, moved: false };
  });
  document.addEventListener('pointermove', (e) => {
    if (!jDrag) return;
    if (!jDrag.moved && Math.hypot(e.clientX - jDrag.x0, e.clientY - jDrag.y0) < 8) return;
    if (!jDrag.moved) { jDrag.moved = true; document.body.appendChild(jDrag.g); }
    jDrag.g.style.left = e.clientX - jDrag.dx + 'px'; jDrag.g.style.top = e.clientY - jDrag.dy + 'px'; e.preventDefault();
  }, { passive: false });
  document.addEventListener('pointerup', (e) => {
    if (!jDrag) return;
    const d = jDrag; jDrag = null;
    if (!d.moved) return;
    d.g.remove();
    const st = JM && JM.m.steps[JM.i]; if (!st) return;
    const at = document.elementFromPoint(e.clientX, e.clientY), slot = at && at.closest('.jslot'), bin = at && at.closest('.jbin');
    if (st.mode === 'order' && slot) { const seq = (JM.place.seq || []).filter((x) => x !== d.id), k = Math.min(+slot.dataset.slot, seq.length); seq.splice(k, 0, d.id); JM.place.seq = seq; jBody(); }
    else if (st.mode === 'sort' && bin) { JM.place[bin.dataset.bin] = [...(JM.place[bin.dataset.bin] || []), d.id]; JM.pick = null; jBody(); }
    // klik yang menyusul setelah seret tidak boleh ikut memilih benda
    jDragJustEnded = Date.now();
  });
  let jDragJustEnded = 0;


  /* ---------- Harga: gratis untuk siswa dan guru; harga sekolah belum ditetapkan, jadi tidak ditampilkan. PRICE hanya untuk panel super admin ---------- */
  const PRICE = 15000, rp = (n) => 'Rp' + Number(n).toLocaleString('en-US');
  function viewPricing() {
    const yes = '<span class="pyes" aria-label="Included">✓</span>', no = '<span class="pno" aria-label="Not included">–</span>';
    const rows = [
      ['All practice from Pre-K to Calculus, lessons, games, A Day at Work', yes, yes, yes],
      ['Learning path adapts to each child\'s ability', yes, yes, yes],
      ['No ads', yes, yes, yes],
      ['Reports for parents', yes, yes, yes],
      ['Classes with a class code; add students with a learning code', no, yes, yes],
      ['Assign tasks to a class, group, or single student', no, yes, yes],
      ['Class dashboard: who needs help, hard topics, task suggestions', no, yes, yes],
      ['School dashboards and reports across classes and teachers', no, no, yes],
      ['School admins manage teachers and classes', no, no, yes],
      ['Starting assessment to place each student at the right level', yes, yes, yes],
      ['Teacher training and mentoring', no, no, yes],
    ];
    const faq = [
      ['Is Metiq free for teachers?', 'Yes. Anyone who teaches math can sign up free and be active right away: create classes, add students, assign tasks, and see class reports.'],
      ['What\'s in the School plan?', 'A school layer on top of the free app: cross-class dashboards and reports, school admins managing teachers, plus training and support.'],
      ['How much does it cost?', 'The School plan price hasn\'t been set yet. Fill out the form below and the Metiq team will contact you.'],
      ['How do teachers join a school?', 'Teachers first sign up free. The school admin then adds them using their email in the 🏫 School tab → Manage teachers.'],
      ['How do we get started?', 'Fill out the form below. The Metiq team will contact you to discuss your school\'s needs.'],
      ['How is student data protected?', 'Metiq shows no ads and doesn\'t sell data. Other teachers can\'t see the names of students outside their class; teachers can only add students with a learning code from the child or parent.'],
    ];
    app.innerHTML = shell(`<a class="back" href="#/">← Back</a>
      <section class="phero"><h1>One app, three ways to use it</h1><p>Metiq is free for students and math teachers. Schools with many classes can request a quote for the school dashboard, teacher management, and support.</p></section>
      <div class="plans">
        <section class="plan"><small>At home</small><h2>Families</h2><b class="price">Free</b><p>Children learn on their own at their level, and parents see their progress.</p><a class="btn ghost" href="#/siswa-baru">Start learning</a></section>
        <section class="plan hl"><small>One class</small><h2>Teacher</h2><b class="price">Free</b><p>Complete class tools for assigning tasks and monitoring progress. Active right away.</p><a class="btn" href="#/guru/daftar">Free teacher sign-up</a></section>
        <section class="plan"><small>Many classes</small><h2>School</h2><b class="price">Contact us</b><p>School dashboard, admins manage teachers, training.</p><a class="btn ghost" href="#quote" data-act="quotego">Request a quote</a></section>
      </div>
      <section class="card"><h2>Compare</h2><div class="tscroll"><table class="tbl pcompare"><thead><tr><th></th><th>Families</th><th>Teacher</th><th>School</th></tr></thead><tbody>
        ${rows.map(([t, a, b, c]) => `<tr><td>${t}</td><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="card"><h2>When does a school need this plan?</h2><p>Practice, lessons, and class tools are currently free for students and math teachers. The School plan adds the layer needed when Metiq is used in many classes: cross-class reports, teacher management, assessments to measure improvement, training, and direct support.</p></section>
      <section class="card" id="quote"><h2>📨 Request a quote for your school</h2>
        ${cloudOn() ? `<form data-form="quote" class="form"><label>School name<input name="school" required minlength="2" maxlength="120"></label><label>City<input name="city" maxlength="80"></label>
          <label>Estimated number of students<input name="students" type="number" min="1" max="100000" required inputmode="numeric"></label><label>Your name<input name="name" required minlength="2" maxlength="80"></label>
          <label>WhatsApp number or email<input name="contact" required minlength="5" maxlength="120"></label><label>Note <small class="muted">(optional)</small><textarea name="note" rows="2" maxlength="500"></textarea></label>
          <button class="btn">Send request</button></form><p class="small muted">The Metiq team will contact you to discuss your school's needs.</p>` : '<p class="muted">The quote form needs a connection to the Metiq server.</p>'}</section>
      <section class="card"><h2>Frequently asked questions</h2>${faq.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>`);
  }

  /* ---------- Olimpiade: latihan soal kompetisi (paling nyaman di tablet atau komputer karena butuh kertas coret besar) ---------- */
  const OLM = window.METIQ_OLIM, OL_SIM_N = 15, OL_SIM_MIN = 60;
  let OL = null;
  const olLevel = () => ss.get('olLevel', 'SMP');
  const olPool = (level, field, tier) => OLM.P.filter((p) => p.level === level && (!field || p.field === field) && (!tier || p.tier === tier));
  const olKey = (level, field) => 'o' + level + field;
  const olStat = (kid, level, field) => { const p = kid ? S.progress(kid.id, 'g:' + olKey(level, field)) : null; return p && p.att ? p.score : 0; };
  function viewOlimpiade() {
    if (innerWidth < 700 && !ss.get('olPhone', false)) {
      app.innerHTML = mqPage(`<div class="mq-ghead"><a class="mq-ico" href="#/permainan" aria-label="Back">${IC.back}</a></div>
        <section class="ol-gate"><div class="bigemoji">🏅</div><h1>Olympiad</h1><p>Olympiad problems need lots of working out. This section is most comfortable on a <b>tablet or computer</b>, with large scratch paper next to the problem.</p><button class="mq-btn ghost" data-act="olphone">Open on this phone anyway</button></section>`, 'main');
      return;
    }
    const kid = gameKid(), L = olLevel(), tier = ss.get('olTier', 1);
    const card = ([k, [name, em]]) => { const n = olStat(kid, L, k), has = olPool(L, k, tier).length; return `<a class="ol-card ${has ? '' : 'off'}" href="${has ? `#/olimpiade/latih/${L}-${k}-${tier}` : '#/olimpiade'}"><span class="em">${em}</span><b>${name}</b><small>${n ? `${n} problems solved` : `${olPool(L, k).length} question types`}</small></a>`; };
    app.innerHTML = mqPage(`<div class="mq-ghead"><a class="mq-ico" href="#/permainan" aria-label="Back">${IC.back}</a><div class="mq-gsay">${MQ.svg('think', { size: 74 })}<div class="mq-bubble"><p>Challenge yourself!</p></div></div></div>
      <div class="ol-wrap"><h1>🏅 Olympiad</h1><p class="ol-lead">Non-routine problems to prepare for OSN and math competitions. Compare with your own record.</p>
      <div class="ol-seg" role="tablist" aria-label="Level">${Object.keys(OLM.LEVELS).map((x) => `<button class="${x === L ? 'on' : ''}" data-act="ollevel" data-v="${x}">${x}</button>`).join('')}</div>
      <h2>Practice by field</h2>
      <div class="ol-seg small" role="tablist" aria-label="Level">${[1, 2, 3].map((t) => `<button class="${t === tier ? 'on' : ''}" data-act="oltier" data-v="${t}">Level ${t}</button>`).join('')}</div>
      <div class="ol-grid">${Object.entries(OLM.FIELDS).map(card).join('')}</div>
      <h2>Simulation</h2>
      <a class="ol-sim" href="#/olimpiade/simulasi/${L}"><b>⏱️ Simulation: ${OL_SIM_N} problems, ${OL_SIM_MIN} minutes</b><small>All fields, from easy to hard. Solutions appear at the end.</small></a>
      <details class="ol-info"><summary>How are olympiad problems made?</summary>
        <p>Olympiad problems are <b>non-routine</b>: the material isn't far from school, but you have to discover the method yourself. Competitions divide them into four fields: algebra, number theory, geometry, and combinatorics.</p>
        <p>At the IMO, each country proposes problems, a committee narrows them to a shortlist of about 30, and the jury picks 6. In Indonesia's OSN, problems step up from the district level to the national level.</p>
        <p>Metiq's problems are written from scratch in the same style with changing numbers, not copies of contest problems. The final stages of competitions use essay and proof problems that can't be graded automatically, so that practice still needs a teacher's guidance.</p></details></div>`, 'main');
  }
  const olFoot = () => `<div class="mq-foot-in"><div class="mq-krow"><button class="mq-ktog" data-act="keystog" aria-label="Show or hide the number keys">🔢 <span class="ka">Number keys</span><span class="kb">Hide</span> <i>▲</i></button><span class="mq-mini">Answer: <b id="indisp2">–</b></span></div>
    <div class="mq-keys extra">${['−', '/'].map((k) => `<button class="mq-key" data-act="olkey" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="mq-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="mq-key" data-act="olkey" data-k="${n}">${n}</button>`).join('')}<button class="mq-key del" data-act="olkey" data-k="del" aria-label="Delete">⌫</button><button class="mq-key" data-act="olkey" data-k="0">0</button></div>
    <button class="mq-btn" id="olcheck" data-act="olcheck" disabled>${OL && OL.sim ? (OL.i < OL.items.length - 1 ? 'Save, next' : 'Save') : 'Check'}</button></div>`;
  const olVal = (s) => { s = String(s).replace(/−/g, '-'); if (!/^-?\d+(\/\d+)?$/.test(s)) return NaN; const [a, b] = s.split('/').map(Number); return b === undefined ? a : b ? a / b : NaN; };
  const olRight = (q, input) => Math.abs(olVal(input) - OLM.value(q.ans)) < 1e-9;
  const olAns = (q) => (Array.isArray(q.ans) ? OLM.show(q.ans[0], q.ans[1]) : OLM.show(q.ans, 1));
  const olSol = (t, q) => window.METIQ_CURRICULUM.kit.tahap(`<b>Strategy: ${esc(t.strat)}.</b> ${q.hint}`, q.steps.map(([a, b]) => [a, String(b)]), true);
  function olPaint() {
    const q = OL.cur.q, tag = `${OLM.FIELDS[OL.cur.t.field][1]} ${OLM.FIELDS[OL.cur.t.field][0]} · Level ${OL.cur.t.tier}`, box = document.getElementById('pq'), fb = document.getElementById('fb');
    closeCoret(true);
    P = null; // soal sudah terlihat di atas kertas coret
    box.innerHTML = `<div class="ol-tag">${OL.sim ? `Problem ${OL.i + 1} of ${OL.items.length} · ` : ''}${tag}</div><div class="mq-say"><div class="mq-bubble ol-q" id="olq"><span>${q.text}</span></div></div>
      <div class="mq-ans"><div class="mq-disp" id="indisp">${esc(OL.input) || '&nbsp;'}</div></div>
      ${OL.sim ? `<div class="ol-dots">${OL.items.map((x, i) => `<button class="${i === OL.i ? 'on' : ''} ${x.input ? 'done' : ''}" data-act="olgo" data-i="${i}">${i + 1}</button>`).join('')}</div><button class="link small" data-act="olend">Finish and see results</button>`
    : `<p class="ol-hintw"><button class="mq-link" data-act="olhint">💡 Hint</button><button class="mq-link" data-act="olshow">See solution</button></p><p class="jhint" id="olh" hidden>💡 ${q.hint}</p>`}`;
    fb.className = 'mq-foot compact'; fb.innerHTML = olFoot(); olSync();
    box.style.paddingBottom = fb.offsetHeight + 20 + 'px';
    if (innerWidth >= 700) openCoret();
  }
  const olSync = () => { const d = document.getElementById('indisp'), m = document.getElementById('indisp2'), b = document.getElementById('olcheck'); if (d) { d.innerHTML = esc(OL.input) || '&nbsp;'; d.classList.toggle('has', OL.input !== ''); } if (m) m.textContent = OL.input || '–'; if (b && !OL.locked) b.disabled = OL.sim ? false : isNaN(olVal(OL.input)); };
  const olNew = (pool) => { let t, g = 0; do t = pool[Math.floor(Math.random() * pool.length)]; while (OL && OL.cur && t === OL.cur.t && pool.length > 1 && g++ < 5); return { t, q: t.gen() }; };
  function viewOlLatih(arg) {
    const [level, field, tier] = String(arg || '').split('-');
    let pool = olPool(level, field, +tier); if (!pool.length) return go('#/olimpiade');
    OL = { sim: false, level, field, pool, input: '', tries: 0, hint: false, seen: false, locked: false, solved: 0, t0: Date.now() };
    OL.cur = olNew(pool);
    app.innerHTML = `<div class="mq-top"><a class="mq-ico" href="#/olimpiade" aria-label="Log out">${IC.x}</a><span class="mq-gtitle">${OLM.FIELDS[field][0]} ${level}</span><span class="ol-count" id="olcount">✓ 0</span></div><main class="mq-screen" id="pq"></main><div class="mq-foot compact" id="fb"></div>`;
    olPaint();
  }
  function olFeedback(ok) {
    const fb = document.getElementById('fb'), { t, q } = OL.cur; OL.locked = true;
    fb.className = 'mq-foot ' + (ok ? 'ok' : 'no');
    fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${ok ? IC.ok : IC.x}</span>${ok ? 'Correct!' : 'Solution'}</div><div class="mq-fbody">${ok ? '' : `<p>The answer: <b>${olAns(q)}</b></p>`}${olSol(t, q)}</div><button class="mq-btn" data-act="olnext">Next problem</button></div>`;
  }
  function olCheck() {
    if (!OL || OL.locked) return;
    if (OL.sim) { OL.items[OL.i].input = OL.input; if (OL.i < OL.items.length - 1) return olGo(OL.i + 1); return olEnd(); }
    if (isNaN(olVal(OL.input))) return;
    if (olRight(OL.cur.q, OL.input)) {
      window.SFX.correct(); OL.solved++; const c = document.getElementById('olcount'); if (c) c.textContent = '✓ ' + OL.solved;
      const kid = gameKid();
      if (kid && !OL.seen) { const k = olKey(OL.level, OL.field), res = S.recordGame(kid.id, k, olStat(kid, OL.level, OL.field) + 1, 0, Date.now() - OL.t0); OL.t0 = Date.now(); if (cloudOn()) Cloud.queueProgress(kid.id, session.get().code, 'g:' + k, res); }
      return olFeedback(true);
    }
    window.SFX.wrong(); OL.tries++; OL.input = ''; olSync();
    const h = document.getElementById('olh'); if (h) h.hidden = false;
    toast('Not quite. Try again, or see the hint.');
  }
  function viewOlSim(level) {
    if (!OLM.LEVELS[level]) return go('#/olimpiade');
    const all = olPool(level), byF = Object.keys(OLM.FIELDS).map((f) => all.filter((p) => p.field === f).sort(() => Math.random() - 0.5)), pick2 = [];
    for (let i = 0; pick2.length < OL_SIM_N; i++) byF.forEach((a) => { if (pick2.length < OL_SIM_N) pick2.push(a[i % a.length]); });
    OL = { sim: true, level, items: pick2.sort((a, b) => a.tier - b.tier).map((t) => ({ t, q: t.gen(), input: '' })), i: 0, input: '', locked: false, end: Date.now() + OL_SIM_MIN * 60000 };
    OL.cur = OL.items[0];
    app.innerHTML = `<div class="mq-top"><a class="mq-ico" href="#/olimpiade" aria-label="Log out">${IC.x}</a><span class="mq-gtitle">Simulation ${level}</span><span class="ol-count" id="oltime"></span></div><main class="mq-screen" id="pq"></main><div class="mq-foot compact" id="fb"></div>`;
    olPaint();
    const tick = () => { const left = Math.max(0, OL.end - Date.now()), el = document.getElementById('oltime'); if (!el) return clearInterval(timer); el.textContent = `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`; if (!left) olEnd(); };
    clearInterval(timer); timer = setInterval(tick, 500); tick();
  }
  function olGo(i) { OL.items[OL.i].input = OL.input; OL.i = i; OL.cur = OL.items[i]; OL.input = OL.cur.input; olPaint(); }
  function olEnd() {
    clearInterval(timer); closeCoret(true); OL.items[OL.i].input = OL.input;
    const right = OL.items.filter((x) => olRight(x.q, x.input)).length, pct0 = Math.round((right / OL.items.length) * 100), kid = gameKid(), k = 'oS' + OL.level, before = kid ? S.progress(kid.id, 'g:' + k) : null, best = before && before.att ? before.score : null, used = OL_SIM_MIN * 60000 - Math.max(0, OL.end - Date.now());
    if (kid) { const res = S.recordGame(kid.id, k, pct0, 0, used); if (cloudOn()) Cloud.queueProgress(kid.id, session.get().code, 'g:' + k, res); }
    const per = Object.entries(OLM.FIELDS).map(([f, [n, e]]) => { const a = OL.items.filter((x) => x.t.field === f); return `<div><span>${e} ${n}</span><b>${a.filter((x) => olRight(x.q, x.input)).length}/${a.length}</b></div>`; }).join('');
    document.getElementById('fb').hidden = true; document.getElementById('fb').className = 'mq-foot';
    document.getElementById('pq').innerHTML = `<div class="ol-end"><h1>${right} of ${OL.items.length} correct</h1><p>${pct0}%${best !== null ? (pct0 > best ? ` · 🎉 Your new record (previously ${best}%)` : ` · Your record ${best}%`) : ''} · time ${Math.ceil(used / 60000)} minutes</p><div class="ol-per">${per}</div></div>
      ${OL.items.map((x, i) => { const ok = olRight(x.q, x.input); return `<details class="ol-rev ${ok ? 'ok' : 'no'}"><summary><span>${ok ? '✅' : '❌'} Problem ${i + 1}</span></summary><p>${x.q.text}</p><p>Your answer: <b>${esc(x.input) || 'blank'}</b> · Answer: <b>${olAns(x.q)}</b></p>${olSol(x.t, x.q)}</details>`; }).join('')}
      <div class="row-btn left" style="margin:16px 0"><a class="mq-btn" href="#/olimpiade">Back to Olympiad</a></div>`;
    document.getElementById('pq').style.paddingBottom = '40px';
    OL = null; P = null;
  }

  /* ---------- Rute ---------- */
  let routeSeq = 0;
  /* ---------- Masuk dengan Gmail orang tua (SQL 027) ----------
   * Anak tanpa kelas wajib memanggil Ayah/Bunda untuk masuk dengan Google sekali di setiap HP. Akun orang tua dibuat otomatis
   * dari nama dan email Google, lalu ditautkan ke anak. Di HP baru, orang tua masuk dengan Gmail dan anak langsung melanjutkan.
   * Gerbang ini hanya aktif bila login Google sudah dinyalakan di Supabase dan SQL 027 sudah dijalankan. */
  const GLOGO = '<svg class="glogo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>';
  const pok = (sid) => { try { return !!localStorage.getItem('metiq_pok_' + sid); } catch (e) { return true; } };
  // 'off' (tidak perlu), 'check' (belum tahu apakah fitur aktif), atau 'on' (anak harus memanggil orang tua)
  function gateState() {
    const ses = session.get();
    if (ses.role !== 'siswa' || ses.demo || !cloudOn() || !ses.code || pok(ses.id)) return 'off';
    const st = S.student(ses.id); if (!st || st.classId) return 'off';
    try { return sessionStorage.getItem('metiq_gate') || 'check'; } catch (e) { return 'off'; }
  }
  async function gateProbe() {
    let on = false;
    try { on = (await Cloud.google.enabled()) && (await Cloud.google.ready()); } catch (e) {}
    try { sessionStorage.setItem('metiq_gate', on ? 'on' : 'off'); } catch (e) {}
  }
  // Tombol Google hanya muncul bila fiturnya sudah aktif
  function gReveal() {
    if (!Cloud.enabled || !Cloud.google) return;
    Cloud.google.enabled().then((on) => on && Cloud.google.ready()).then((ok) => { if (ok) { document.querySelectorAll('.gshow').forEach((e) => { e.hidden = false; }); gMount(); } }).catch(() => {});
  }
  function viewParentGate() {
    const ses = session.get(), st = S.student(ses.id), nm = st ? esc(String(st.name).trim().split(/\s+/)[0]) : 'you';
    app.innerHTML = `<main class="mq-screen gate"><div class="gate-in">${MQ.svg('hello', { size: 150 })}
      <h1>Call your mom or dad!</h1>
      <p>To keep ${nm}'s learning progress safe and visible to parents, a parent needs to sign in with a Google account (Gmail) <b>just once</b> on this phone. After that, ${nm} can keep learning right where they left off.</p>
      <div class="gsi" data-gi="link"></div>
      <p class="gate-note">Metiq only saves the parent's name and email for learning reports. Metiq never sees the Google password.</p>
      <button class="mq-link" data-act="logout">Not ${nm}? Log out</button></div></main>`;
    gMount();
  }
  // Daftar anak yang tertaut ke Gmail orang tua (HP baru)
  function viewGKids() {
    let d = null; try { d = JSON.parse(sessionStorage.getItem('metiq_gkids')); } catch (e) {}
    if (!d) return go('#/');
    const kids = d.kids || [];
    app.innerHTML = `${mqBack('#/')}<main class="mq-screen"><div class="mq-ob-body gkids">
      <div class="mq-big-say"><div class="mq-bubble"><p>Hello, <b class="hl">${esc(d.parentName || 'Parent')}</b>! ${kids.length ? 'Who wants to learn?' : 'No child is linked to this account yet.'}</p></div>${MQ.svg(kids.length ? 'happy' : 'ask', { size: 140 })}</div>
      ${kids.length ? `<div class="mq-list">${kids.map((k) => `<button data-act="gpick" data-id="${esc(k.id)}"><span class="em">${avHTML(k.avatar)}</span><span class="grow">${esc(k.name)}${k.className ? `<small>${esc(k.className)}</small>` : ''}</span><span class="go">›</span></button>`).join('')}</div>`
        : '<div class="mq-list"><a href="#/siswa-baru"><span class="em">🌱</span>Start learning as a new child<span class="go">›</span></a><a href="#/kode"><span class="em">🔑</span>I have a learning code<span class="go">›</span></a></div><p class="mq-hint center">Children who start learning and then ask a parent to sign in with Gmail will appear here.</p>'}
    </div></main>`;
  }
  function gUseKid(k) {
    session.set({ role: 'siswa', id: k.id, code: k.code });
    try { localStorage.setItem('metiq_pok_' + k.id, '1'); sessionStorage.removeItem('metiq_gkids'); } catch (e) {}
    loaded = { key: '', at: 0 };
  }
  // Tombol Google resmi dipasang di setiap kotak .gsi[data-gi]; maksudnya: link (anak di HP ini), kids (HP baru), report (laporan)
  function gMount() {
    if (!Cloud.google) return;
    document.querySelectorAll('.gsi[data-gi]').forEach((el) => {
      if (el.dataset.on) return; el.dataset.on = '1';
      el.innerHTML = `<span class="gsi-wait">${loadingHTML}</span>`;
      Cloud.google.mount(el, (tok) => gDo(el.dataset.gi, tok), (e) => toast(e.status ? esc(e.message) : 'Signing in with Google failed. Please try again.'))
        .catch(() => { el.innerHTML = '<p class="gate-note">Couldn\'t open Google. Please check the internet connection.</p>'; delete el.dataset.on; });
    });
  }
  // Sesudah orang tua masuk: jalankan maksudnya dengan token sesi sekali pakai, lalu token itu dibuang
  async function gDo(kind, token) {
    try {
      if (kind === 'link') {
        const x = session.get(), out = await Cloud.rpc('parent_google_link', { p_code: x.code, p_student_id: x.id }, token);
        try { localStorage.setItem('metiq_pok_' + x.id, out.parentName || '1'); } catch (e) {}
        toast(`✔ Connected to ${esc(out.parentName || 'Parent')}'s account. Let's keep learning!`); return route();
      }
      if (kind === 'kids') {
        const out = await Cloud.rpc('parent_google_kids', {}, token);
        if ((out.kids || []).length === 1) { gUseKid(out.kids[0]); toast(`Hello, ${esc(out.kids[0].name)}! Let's keep learning.`); return go('#/belajar'); }
        try { sessionStorage.setItem('metiq_gkids', JSON.stringify(out)); } catch (e) {}
        return go('#/gmail/anak');
      }
      if (kind === 'report') {
        const out = await Cloud.rpc('parent_google_session', {}, token);
        session.set({ role: 'ortu', ptoken: out.token, pid: out.parentId }); loaded = { key: '', at: 0 };
        return go('#/ortu/anak');
      }
    } catch (e) { toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); }
  }
  // HP baru: orang tua masuk dengan Gmail untuk melanjutkan belajar anaknya
  function viewGmailStart() {
    app.innerHTML = `${mqBack('#/')}<main class="mq-screen"><div class="mq-ob-body gate-in">
      <div class="mq-big-say"><div class="mq-bubble"><p>Mom or Dad, sign in with <b class="hl">Gmail</b> to continue your child's learning.</p></div>${MQ.svg('hello', { size: 140 })}</div>
      <div class="gsi" data-gi="kids"></div>
      <p class="gate-note">Use the Gmail you used when your child started learning. Metiq only saves the parent's name and email for learning reports.</p></div></main>`;
    gMount();
  }

  const GATED = new Set(['belajar', 'bab', 'latihan', 'ujian', 'asesmen', 'tugas', 'aku', 'hadiah', 'laporanku', 'permainan', 'main', 'profesi', 'misi', 'olimpiade', 'pelajaran']);
  async function route() {
    clearInterval(timer);
    { const ov = document.getElementById('mqover'); if (ov) { ov.remove(); document.body.classList.remove('mq-noscroll'); } }
    if (stopGame) { stopGame(); stopGame = null; }
    closeCoret(true);
    window.METIQ_ANIM.stop();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    stopClips();
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const [a, b, c] = parts;
    const seq = ++routeSeq;
    S.setMode(cloudOn());
    if (session.get().demo) tlog('view', { p: a === 'guru' ? 'guru/' + (b || '') : a || 'beranda', ...(a === 'latihan' || a === 'main' || a === 'pelajaran' ? { s: b } : {}) });
    const needsData = a === 'belajar' || a === 'asesmen' || a === 'permainan' || a === 'main' || a === 'hadiah' || a === 'laporanku' || a === 'latihan' || (a === 'ortu' && (b === 'laporan' || b === 'anak')) || (a === 'guru' && b && b !== 'masuk' && b !== 'daftar') || a === 'avatar' || a === 'notifikasi' || a === 'tugas' || a === 'aku' || a === 'ujian' || a === 'profesi' || a === 'misi';
    if (needsData && !(await ensure())) return;
    if (seq !== routeSeq) return;
    // Anak tanpa kelas: Ayah/Bunda masuk dengan Gmail sekali di HP ini sebelum lanjut belajar
    if (GATED.has(a)) {
      if (gateState() === 'check') { app.innerHTML = loadingHTML; await gateProbe(); if (seq !== routeSeq) return; }
      if (gateState() === 'on') return viewParentGate();
    }
    window.METIQ_CURRICULUM.setKonteks(curSettings().konteks);
    window.scrollTo(0, 0);
    document.body.classList.toggle('mq-body', ['', undefined, 'siswa', 'siswa-baru', 'kode', 'mulai', 'belajar', 'asesmen', 'latihan', 'tugas', 'aku', 'ujian', 'permainan', 'main', 'pengaturan', 'hadiah'].includes(a));
    switch (a) {
      case '': case undefined: return viewHome();
      case 'kurikulum': return viewCurriculum();
      case 'siswa': return b ? viewStudentPick(b) : viewStudentEnter();
      case 'siswa-baru': return viewStudentStart();
      case 'kode': return viewStudentCode();
      case 'mulai': return viewTryStart(b);
      case 'ajukan': return b === 'status' ? viewRequestStatus(c) : b ? viewRequestForm(b) : viewRequestChooser();
      case 'belajar': return viewStudentHome();
      case 'bab': return viewChapter(b);
      case 'gmail': return b === 'anak' ? viewGKids() : viewGmailStart();
      case 'asesmen': return b === 'hasil' ? viewDiagResult('a') : b === 'akhir' ? (c === 'hasil' ? viewDiagResult('b') : viewDiag('b')) : viewDiag('a');
      case 'permainan': return viewGames();
      case 'harga': return viewPricing();
      case 'olimpiade': return b === 'latih' ? viewOlLatih(c) : b === 'simulasi' ? viewOlSim(c) : viewOlimpiade();
      case 'profesi': return b === 'topik' ? viewJobTopic(c) : b ? viewProfession(b) : viewJobs();
      case 'misi': return viewMission(b);
      case 'tugas': return TASKS_ON ? viewTasks() : go('#/belajar');
      case 'ujian': return viewTest(b);
      case 'aku': return viewProfile();
      case 'pengaturan': return viewSettings(b);
      case 'main': return viewGame(b);
      case 'hadiah': return viewPrizes();
      case 'laporanku': return viewMyReport();
      case 'latihan': return viewPractice(b);
      case 'guru': if (b === 'masuk' || b === 'daftar') return viewTeacherAuth(b); if (!b) { const ses = session.get(); return ses.role === 'guru' && (cloudOn() ? ses.token : S.teacher(ses.id)) ? go('#/guru/ringkasan') : viewTeacherAuth(); } return viewTeacher(b, c);
      case 'coba': return viewPreview(b);
      case 'pelajaran': return viewLesson(b);
      case 'avatar': return viewAvatar(b);
      case 'notifikasi': return viewNotifications();
      case 'panduan': return viewManual(b);
      case 'ortu': if (!PARENTS_ON && !(PARENT_CODE_ON && b !== 'daftar')) return go('#/'); return b === 'laporan' ? viewParentReport(c) : b === 'anak' ? viewParentHome() : b === 'daftar' ? (cloudOn() ? go('#/ajukan/ortu') : viewParentRegister()) : viewParentEnter();
      default: return viewHome();
    }
  }

  /* ---------- Interaksi ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    const row = e.target.closest('[data-href]');
    if (!el && row && !e.target.closest('a')) return go(row.dataset.href);
    if (!el) return;
    const act = el.dataset.act;
    if (['jnext', 'jretry', 'jsay', 'jopt', 'jkey', 'jcheck', 'jitem', 'jbin'].includes(act)) return jAct(act, el);
    if (act === 'lang') { location.href = location.pathname + '?lang=' + (window.METIQ_LANG === 'en' ? 'id' : 'en') + location.hash; return; }  // ?lang berbeda selalu memuat ulang halaman; index.html menyimpan pilihannya
    if (act === 'jband') { ls.set('metiq_jband', el.dataset.b); return route(); }
    if (act === 'jfilter') { const f = ls.get('metiq_jfilter', {}); f[el.dataset.k] = el.dataset.v; ls.set('metiq_jfilter', f); return route(); }
    if (act === 'apstu') return;
    if (act === 'ungp') { ss.set('ungp', +el.dataset.p); const ctx = teacherCtx(); if (ctx) renderUngrouped(ctx); const t = document.querySelector('.ungtbl'); if (t) t.closest('.card').scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
    if (act === 'ungreset') { ['ungq', 'ungg'].forEach((k) => ss.set(k, '')); ss.set('ungf', 'semua'); ss.set('ungp', 1); const ctx = teacherCtx(); if (ctx) renderUngrouped(ctx); return; }
    if (act === 'ungf') { ss.set('ungf', el.dataset.v); ss.set('ungp', 1); const ctx = teacherCtx(); if (ctx) renderUngrouped(ctx); return; }
    if (act === 'apcsv') { const ctx = teacherCtx(); if (ctx) exportAllProgress(ctx); return; }
    if (act === 'quotego') { e.preventDefault(); const q = document.getElementById('quote'); if (q) q.scrollIntoView({ behavior: 'smooth' }); return; }
    if (act === 'sgdel') { if (!confirm(`Remove ${el.dataset.n} from the school? Their classes and students stay with that teacher but no longer appear on the school dashboard.`)) return; Cloud.rpc('school_teacher_remove', { p_token: session.get().token, p_teacher_id: el.dataset.id }).then(() => { toast('Teacher removed from school ✔'); loadSchoolTeachers(); }).catch((er) => toast(er.status ? esc(er.message) : 'Can\'t connect to the server')); return; }
    if (act === 'quotest') { Cloud.rpc('super_quote_status', { p_token: session.get().token, p_id: +el.dataset.id, p_status: el.dataset.s }).then(() => { toast('Status updated ✔'); route(); }).catch((er) => toast(er.status ? esc(er.message) : 'Can\'t connect to the server')); return; }
    if (act === 'gstart') return startGame();
    if (act === 'coret') return openCoret();
    if (act === 'album') return openAlbum(+el.dataset.i);
    if (act === 'albclose') { if (e.target === el || el.tagName === 'BUTTON') { const sh = document.getElementById('albsheet'); if (sh) sh.hidden = true; } return; }
    if (act === 'ggrade') { sessionStorage.setItem('metiq_ggrade', el.dataset.g); return route(); }
    if (act === 'obcls') { OB.cls = +el.dataset.g; document.querySelectorAll('.mq-choice').forEach((b) => b.classList.toggle('sel', b === el)); document.getElementById('obbtn').disabled = false; window.SFX.step(); return; }
    if (act === 'obage') { OB.age = +el.dataset.a; document.querySelectorAll('.mq-age').forEach((b) => b.classList.toggle('sel', b === el)); document.getElementById('obbtn').disabled = false; window.SFX.step(); return; }
    if (act === 'obgoal') { OB.goal = +el.dataset.m; ls.set('metiq_goal_' + OB.sid, OB.goal); document.querySelectorAll('.mq-choice').forEach((b) => b.classList.toggle('sel', b === el)); window.SFX.step(); return; }
    if (act === 'obnext') return obNext();
    if (act === 'obback') { if (OB && OB.step > 0) { OB.step--; return obRender(); } OB = null; return go('#/siswa'); }
    if (act === 'quit') return go(P && P.sk && session.get().role === 'siswa' ? '#/bab/' + P.sk.unit : '#/belajar');
    if (act === 'dquit') { if (confirm('Stop for now? The assessment will restart from the beginning.')) { D = null; P = null; go('#/'); } return; }
    if (act === 'gsheet') { const m = document.getElementById('gsheet'); if (m) m.hidden = false; return; }
    if (act === 'gclose') { if (e.target === el) { const m = document.getElementById('gsheet'); if (m) m.hidden = true; } return; }
    if (act === 'tip') return toast(el.dataset.t);
    if (act === 'lopen') return openLessonOver(el.dataset.u);
    if (act === 'lclose') return closeLessonOver();
    if (act === 'chest') {
      const u = UNITS.find((x) => x.id === el.dataset.u), slot = document.getElementById('pop-ch-' + el.dataset.u); if (!u || !slot) return;
      const had = slot.firstChild; document.querySelectorAll('.mq-pop-slot').forEach((x) => { x.innerHTML = ''; });
      if (!had) { slot.innerHTML = chestPop(u); slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      return;
    }
    if (act === 'testagain') return viewTest(el.dataset.u);
    if (act === 'rkp' || act === 'rks') { ss.set(act, el.dataset.v); return route(); }
    if (act === 'rkcsv') { const ctx = teacherCtx(); if (ctx) exportRanking(ctx); return; }
    if (act === 'tocur') {
      document.querySelectorAll('.mq-pop-slot').forEach((x) => { x.innerHTML = ''; });
      const c = document.querySelector('.mq-n.cur'); if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      // langkah sekarang ada di pulau lain
      const st = studentNow(), m = st && pathModel(st.id, getGrade()), sk = m && SKILLS[m.flat[m.cur]];
      return go(sk ? '#/bab/' + sk.unit : '#/belajar');
    }
    if (act === 'node') {
      const slot = document.getElementById('pop-' + el.dataset.id); if (!slot) return;
      const had = slot.firstChild; document.querySelectorAll('.mq-pop-slot').forEach((x) => { x.innerHTML = ''; });
      if (!had) { slot.innerHTML = nodePop(el.dataset.id, +el.dataset.x); slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      return;
    }
    if (act === 'goal') { ls.set('metiq_goal_' + session.get().id, +el.dataset.m); return route(); }
    if (act === 'soundtoggle') { const on = window.SFX.toggle(); el.querySelector('.em').textContent = on ? 'ðŸ””' : 'ðŸ”•'; el.querySelector('.t').textContent = on ? 'Sound on' : 'Sound off'; return; }
    // Mengulang asesmen awal atau membuka asesmen akhir: khusus admin (peneliti) agar data pretest terjaga
    const adminDo = (msg, work) => { if (!isResearchNow()) return toast('Super admins only'); el.disabled = true; return work().then(() => { toast(msg); route(); }).catch((e) => { el.disabled = false; toast(e.status ? esc(e.message) : 'Can\'t connect to the server'); }); };
    if (act === 'diagreset') {
      const k = S.student(el.dataset.s);
      if (!k || !confirm(`Redo the pre-assessment for ${k.name}? The old pre-assessment result will no longer be used (including for research data), and ${k.name} will be asked to do it at next login.`)) return;
      return adminDo('The pre-assessment will be redone ✔', () => syncKid(k, S.resetDiag(k.id)).then(() => cloudOn() && ensure(true)));
    }
    if (act === 'postone') {
      const k = S.student(el.dataset.s), open = el.dataset.o === '1'; if (!k) return;
      if (open && !confirm(`Open the post-assessment for ${k.name}? ${k.name} will be asked to do it at next login.`)) return;
      return adminDo(open ? 'Post-assessment opened ✔' : 'Post-assessment canceled', () => postOpen([k], open));
    }
    if (act === 'postclass') {
      const c = S.cls(el.dataset.c), kids = S.studentsOf(el.dataset.c).filter((k) => S.diagOf(k.id) && !S.postPending(k.id));
      if (!c || !kids.length || !confirm(`Open the post-assessment for ${kids.length} students in ${c.name}? They'll be asked to do it at next login.`)) return;
      return adminDo(`Post-assessment opened for ${kids.length} students ✔`, () => postOpen(kids, true));
    }
    if (act === 'dskip') {
      const sid = session.get().id, r = S.markOnboard(sid);
      sessionStorage.setItem('metiq_diag_skip', sid);
      if (r.entry && cloudOn()) Cloud.queueProgress(sid, session.get().code, r.key, r.entry);
      return go('#/belajar');
    }
    if (act === 'olphone') { ss.set('olPhone', true); return route(); }
    if (act === 'ollevel') { ss.set('olLevel', el.dataset.v); return route(); }
    if (act === 'oltier') { ss.set('olTier', +el.dataset.v); return route(); }
    if (act === 'olkey') { if (!OL || OL.locked) return; const k = el.dataset.k; OL.input = k === 'del' ? OL.input.slice(0, -1) : (OL.input + k).slice(0, 12); return olSync(); }
    if (act === 'olcheck') return olCheck();
    if (act === 'olhint') { const h = document.getElementById('olh'); if (h) h.hidden = false; el.hidden = true; return; }
    if (act === 'olshow') { if (OL) { OL.seen = true; olFeedback(false); } return; }
    if (act === 'olnext') { OL.input = ''; OL.tries = 0; OL.seen = false; OL.locked = false; OL.cur = olNew(OL.pool); return olPaint(); }
    if (act === 'olgo') return olGo(+el.dataset.i);
    if (act === 'olend') return olEnd();
    if (act === 'kolomplay') { const k = el.closest('.kolom, .lk'); if (k) k.replaceWith(k.cloneNode(true)); return; }
    if (act === 'anim') { const box = el.closest('.explain').querySelector('.anim-inline'); el.remove(); return window.METIQ_ANIM.mount(box, el.dataset.u); }
    if (act === 'fbedit') { ss.set('fbedit', el.dataset.k); return route(); }
    if (act === 'export') return exportResearch(el.dataset.t);
    if (act === 'vizm') { ss.set('vizm', el.dataset.m); return route(); }
    if (act === 'vizdb') { ss.set('vizdb', el.dataset.c); return route(); }
    if (act === 'openkid') { e.preventDefault(); const x = session.get(); x.classId = el.dataset.id; session.set(x); return go('#/guru/siswa/' + el.dataset.s); }
    if (act === 'openclass') { const s = session.get(); s.classId = el.dataset.id; session.set(s); return go('#/guru/ringkasan'); }
    if (act === 'strand') { ss.set('strand', el.dataset.s); if (location.hash !== '#/kurikulum') { go('#/kurikulum'); return; } return route(); }
    if (act === 'dtab') {
      ss.set('dtab', el.dataset.t);
      document.querySelectorAll('.dtabs button').forEach((b) => b.classList.toggle('on', b === el));
      document.querySelectorAll('.dpanel').forEach((p) => { p.hidden = p.dataset.p !== el.dataset.t; });
      return;
    }
    if (act === 'doaok') { sessionStorage.setItem('metiq_doa', session.get().id); return route(); }
    if (act === 'pz') {
      const pb = prizeBoard(session.get().id, getGrade()), x = pb.cells[+el.dataset.i], box = document.getElementById('pzinfo');
      document.querySelectorAll('.pz.sel').forEach((b) => b.classList.remove('sel')); el.classList.add('sel');
      if (box) box.innerHTML = x.open ? `<span class="pzbig">${x.prize}</span> You got this reward because: <b>${chLabel(x.c)}</b>. Great job!`
        : `🔒 To open this box: <b>${chLabel(x.c)}</b>.<br>You now have ${x.have} ${chUnit[x.c.k]}, <b>${x.c.n - x.have}</b> more to go.`;
      return;
    }
    if (act === 'grade') { setGrade(+el.dataset.g); sessionStorage.removeItem('metiq_open'); return route(); }
    if (act === 'range') {
      const p = el.dataset.p, cur = ss.get('range', { preset: 30 });
      ss.set('range', p === 'custom' ? { preset: 'custom', from: cur.from || isoDay(Date.now() - 29 * DAY), to: cur.to || isoDay(Date.now()) } : { preset: p === 'all' ? 'all' : +p });
      ss.set('loglim', 50); ss.set('troublelim', 15); return route();
    }
    if (act === 'gridunit') { ss.set('gridUnit', el.dataset.u); return route(); }
    if (act === 'troublemore') { ss.set('troublelim', ss.get('troublelim', 15) + 15); return route(); }
    if (act === 'logmore') { ss.set('loglim', ss.get('loglim', 50) + 50); return route(); }
    if (act === 'key') {
      if (!P || P.locked) return;
      if (el.dataset.k === 'del') P.input = P.input.slice(0, -1); else if (P.input.length < 12) P.input += el.dataset.k;
      document.getElementById('indisp').innerHTML = P.input || '&nbsp;'; refreshCheck();
      if (!document.querySelector('#fb.cor')) document.getElementById('indisp').scrollIntoView({ block: 'nearest' });
    } else if (act === 'jhint') { const h = document.getElementById('jhint'); if (h) { h.hidden = false; el.parentElement.hidden = true; } }
    else if (act === 'keystog') { const fb = document.getElementById('fb'); if (fb) fb.classList.toggle('kshow'); }
    else if (act === 'check') { if (P && !P.locked) submit(P.q.type === 'choice' ? P.q.options[P.sel] : P.input); }
    else if (act === 'choose') { if (!P || P.locked) return; P.sel = +el.dataset.i; if (P.q.optAudio) playClips([P.q.optAudio[P.sel]]); document.querySelectorAll('.mq-opt').forEach((b) => b.classList.toggle('sel', b === el)); window.SFX.step(); refreshCheck(); }
    else if (act === 'next') nextQ();
    else if (act === 'again') viewPractice(P.sk.id, true);
    else if (act === 'say') { if (P.q.audio) playClips(P.q.audio); else speak(P.q.speak || P.q.text.replace(/<table class="mtbl mv">[\s\S]*?<\/table>/g, '')); }  // tabel tegak (versi HP) tidak ikut dibacakan
    else if (act === 'pickav') saveAvatar(el.dataset.t, el.dataset.a);
    else if (act === 'mgo') { const sec = document.getElementById('ms-' + el.dataset.i); if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (act === 'printmanual') { document.body.classList.add('pm'); window.print(); setTimeout(() => document.body.classList.remove('pm'), 500); }
    else if (act === 'reportdone') { el.disabled = true; markDone(el.dataset.a, el.dataset.s, 'ortu').then(() => { toast('Sent to the teacher ✔'); return cloudOn() ? ensure(true) : true; }).then(route); }
    else if (act === 'sound') { const on = window.SFX.toggle(); el.textContent = on ? '🔔' : '🔕'; toast(on ? 'Sound turned on' : 'Sound turned off'); }
    else if (act === 'lexnew') { const box = document.getElementById('lex-' + el.dataset.i); if (box) box.innerHTML = lessonExample(el.dataset.sk); }
    else if (act === 'lgo') { const sec = document.getElementById('lp-' + el.dataset.i); if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (act === 'back') { if (history.length > 1) history.back(); else go('#/'); }
    else if (act === 'lsay') {
      const les = LESSONS[el.dataset.u || location.hash.split('/')[2]], i = +el.dataset.i;
      if (les) speak(i < 0 ? les.intro : `${les.parts[i].t}. ${les.parts[i].steps.join(' ')}`);
    }
    else if (act === 'pickkid') { session.set({ role: 'siswa', id: el.dataset.id, code: el.dataset.code, demo: session.get().demo || undefined }); go('#/belajar'); }
    else if (act === 'trydemo') go('#/mulai/' + el.dataset.r);
    else if (act === 'trykid') startDemo('siswa', '', '', [], el.dataset.s);
    else if (act === 'realstart') { tlog('view', { p: 'mulai' }); tflush(); session.set({}); S.setMode(cloudOn()); go('#/siswa-baru'); }
    else if (act === 'realsignup') { tlog('view', { p: 'daftar' }); tflush(); session.set({}); S.setMode(cloudOn()); go('#/ajukan/' + (el.dataset.k || '')); }
    else if (act === 'reqlogin') { const r = JSON.parse(el.dataset.r); session.set({ role: 'siswa', id: r.studentId, code: r.classCode }); go('#/belajar'); }
    else if (act === 'schooledit') superEditSchool(el.dataset.id, el.dataset.n);
    else if (act === 'delclass') deleteClass(el.dataset.id);
    else if (act === 'shareclass') { const ctx = teacherCtx(); if (ctx) shareText(`Assalamu'alaikum. ${ctx.c.name} math practice is now on Metiq (free, works on phones):\n1. Open https://metiqmath.com\n2. Tap "I'm a student"\n3. Enter the class code: ${ctx.c.code}\n4. Choose your name`); }
    else if (act === 'sharepcode') { const st = S.student(session.get().id); shareText(`Assalamu'alaikum. ${st ? st.name : ''}'s math learning report can be seen on Metiq:\n1. Open https://metiqmath.com\n2. Tap \"I'm a parent\"\n3. Enter the code: ${el.dataset.c}`); }
    else if (act === 'shareparent') { const k = S.student(el.dataset.id), c = k && S.cls(k.classId); if (k) shareText(`Assalamu'alaikum, parent of ${k.name}. ${k.name}'s (${c ? c.name : ''}) math learning report can be seen on Metiq:\n1. Open https://metiqmath.com\n2. Tap "I'm a parent"\n3. Enter the parent code: ${k.parentCode}\nYou'll also be notified whenever the teacher gives a task.`); }
    else if (act === 'submitasg') { el.disabled = true; markDone(el.dataset.a, session.get().id, 'siswa').then(() => { window.SFX.task(); toast('Task turned in! Your teacher was notified 📨'); route(); }); }
    else if (act === 'superdel') superDelete(el.dataset.what, el.dataset.id);
    else if (act === 'schoolview') { ss.set('schoolSel', el.dataset.id); go('#/guru/sekolah'); }
    else if (act === 'tdays') { ss.set('tdays', +el.dataset.d); return route(); }
    else if (act === 'famset') famSet();
    else if (act === 'famdel') famDel(el.dataset.id);
    else if (act === 'askid') {
      const ses = session.get(), k = S.student(el.dataset.id), c = k && S.cls(k.classId);
      if (!k || !c) return;
      session.set({ role: 'siswa', id: k.id, code: c.code, demo: ses.demo || undefined, back: ses.demo ? { role: 'ortu', id: ses.id, kids: ses.kids, demo: true } : { role: 'ortu', ptoken: ses.ptoken, pid: ses.pid } });
      go('#/belajar');
    } else if (act === 'backparent') {
      const ses = session.get(); if (ses.back) session.set(ses.back); go('#/ortu/anak');
    } else if (act === 'punlink') {
      const k = S.student(el.dataset.id);
      if (!k || !confirm(`Unlink ${k.name} from this account? ${k.name}'s learning data won't be deleted.`)) return;
      Cloud.rpc('parent_unlink', { p_token: session.get().ptoken, p_student_id: k.id }).then(() => ensure(true)).then(route).catch((e) => toast(esc(e.message)));
    }
    else if (act === 'gkids') go('#/gmail');
    else if (act === 'gpick') { let d = null; try { d = JSON.parse(sessionStorage.getItem('metiq_gkids')); } catch (e) {} const k = d && (d.kids || []).find((x) => x.id === el.dataset.id); if (k) { gUseKid(k); go('#/belajar'); } }
    else if (act === 'logout') {
      const ses = session.get();
      if (cloudOn() && ses.role === 'guru' && ses.token) Cloud.rpc('teacher_logout', { p_token: ses.token }).catch(() => {});
      if (cloudOn() && ses.role === 'ortu' && ses.ptoken) Cloud.rpc('parent_logout', { p_token: ses.ptoken }).catch(() => {});
      session.set({}); loaded = { key: '', at: 0 }; go('#/');
    }
    else if (act === 'demo') { session.set({ demo: true }); S.setMode(false); const t = S.seedDemo(); session.set({ role: 'guru', id: t.id, demo: true }); toast('Sample data is ready. Logged in as a sample teacher.'); go('#/guru/ringkasan'); }
    else if (act === 'rmkid') {
      const k = S.student(el.dataset.id);
      if (!k || !confirm(`Delete ${k.name} and all their data?`)) return;
      if (cloudOn()) return tAct('teacher_remove_student', { p_student_id: k.id }, 'Student deleted');
      S.removeStudent(k.id); route();
    } else if (act === 'rmasg') {
      if (cloudOn()) return tAct('teacher_remove_assignment', { p_id: el.dataset.id });
      S.removeAssignment(el.dataset.id); route();
    } else if (act === 'assignkid') {
      const ctx = teacherCtx(), id = el.dataset.id, sid = el.dataset.s, note = 'Special task: ' + SKILLS[id].name;
      if (cloudOn()) return tAct('teacher_add_assignment', { p_class_id: ctx.c.id, p_skills: [id], p_note: note, p_due: '', p_student_ids: [sid] }, 'Special task created ✔');
      S.addAssignment(ctx.c.id, [id], note, '', [sid]); toast('Special task created ✔'); route();
    } else if (act === 'asgform') {
      ss.set('asgFor', el.dataset.s); go('#/guru/tugas');
      setTimeout(() => { const f = document.getElementById('newasg'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
    } else if (act === 'assign1') {
      const ctx = teacherCtx(), note = 'Extra practice: ' + SKILLS[el.dataset.id].name;
      if (cloudOn()) return tAct('teacher_add_assignment', { p_class_id: ctx.c.id, p_skills: [el.dataset.id], p_note: note, p_due: '' }, 'Task created ✔');
      S.addAssignment(ctx.c.id, [el.dataset.id], note, ''); toast('Task created ✔'); route();
    }
    else if (act === 'remind') { const ctx = teacherCtx(); if (ctx) shareText(`Assalamu'alaikum. Let's practice math on Metiq for 10 minutes today.\nOpen https://metiqmath.com and tap "I'm a Student". Class code: ${ctx.c.code}`); }
    else if (act === 'print') window.print();
    else if (act === 'reload') route();
    else if (act === 'export') {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const aEl = document.createElement('a'); aEl.href = URL.createObjectURL(blob); aEl.download = `metiq-backup-${new Date().toISOString().slice(0, 10)}.json`; aEl.click();
    }
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.fam) { if (el.checked) UNG_SEL.add(el.dataset.fam); else UNG_SEL.delete(el.dataset.fam); return; }
    if (el.dataset.act === 'ungsel') { ss.set(el.dataset.k, el.value); ss.set('ungp', 1); const ctx = teacherCtx(); if (ctx) renderUngList(ctx); return; }
    if (el.dataset.act === 'teacherset') return superTeacherSet(el);
    if (el.dataset.act === 'classteacher') return superClassTeacher(el);
    if (el.dataset.act === 'apstu') { ss.set('apStu', el.value); return route(); }
    if (el.dataset.act === 'schoolsel') { ss.set('schoolSel', el.value); return route(); }
    if (el.dataset.act === 'switchclass') { const s = session.get(); s.classId = el.value; session.set(s); route(); }
    if (el.dataset.act === 'rfrom' || el.dataset.act === 'rto') { const r = ss.get('range', { preset: 'custom' }); r.preset = 'custom'; r[el.dataset.act === 'rfrom' ? 'from' : 'to'] = el.value; if (r.from && r.to && r.from > r.to) [r.from, r.to] = [r.to, r.from]; ss.set('range', r); route(); }
    if (el.dataset.act === 'logf') { const f = ss.get('logf', { sid: '', skill: '', res: '' }); f[el.dataset.k] = el.value; ss.set('logf', f); ss.set('loglim', 50); route(); }
    if (el.dataset.act === 'import' && el.files[0]) { el.files[0].text().then((t) => { try { S.importJSON(t); toast('Data merged successfully ✔'); route(); } catch (err) { toast('Invalid file'); } }); }
  });
  document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.unit[data-unit]') && e.target.open) sessionStorage.setItem('metiq_open', e.target.dataset.unit); }, true);
  document.addEventListener('keydown', (e) => {
    if (OL && !OL.locked && document.getElementById('olq') && e.target.tagName !== 'INPUT') {
      if (/^[0-9]$/.test(e.key) || e.key === '/') OL.input = (OL.input + e.key).slice(0, 12); else if (e.key === '-') OL.input = (OL.input + '−').slice(0, 12); else if (e.key === 'Backspace') OL.input = OL.input.slice(0, -1); else if (e.key === 'Enter') { const b = document.getElementById('olcheck'); if (b && !b.disabled) olCheck(); return; } else return;
      return olSync();
    }
    if (!P || !document.getElementById('pq') || e.target.tagName === 'INPUT') return;
    if (document.getElementById('mqover')) return;
    if (e.key === 'Enter') {
      const nx = document.querySelector('#fb [data-act="next"]'); if (nx) return nx.click();
      const ck = document.getElementById('mqcheck'); if (ck && !ck.disabled) return ck.click();
      return;
    }
    if (P.q && P.q.type === 'input' && !P.locked) {
      const extra = { ',': '.', '.': '.', '-': 'âˆ’', '/': '/' };
      if (/^[0-9]$/.test(e.key) && P.input.length < 12) P.input += e.key; else if (extra[e.key] && (P.q.keys || []).includes(extra[e.key])) P.input += extra[e.key]; else if (e.key === 'Backspace') P.input = P.input.slice(0, -1); else return;
      document.getElementById('indisp').innerHTML = P.input || '&nbsp;'; refreshCheck();
    }
  });
  // Kode kelas: huruf besar otomatis, tombol Masuk aktif setelah 4 huruf, dan langsung masuk saat 5 huruf
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el && el.id === 'sup-q') { ss.set('supq', el.value); renderSupStudents(); return; }
    if (el && el.id === 'ung-q') { ss.set('ungq', el.value); ss.set('ungp', 1); const ctx = teacherCtx(); if (ctx) renderUngList(ctx); return; }
    if (!el || el.id !== 'mqcode') return;
    el.value = el.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); el.classList.remove('bad');
    const b = document.getElementById('mqgo'); if (b) b.disabled = el.value.length < 4;
    if (el.value.length === 5 && el.form && el.form.requestSubmit) el.form.requestSubmit();
  });
  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, fd = new FormData(f), kind = f.dataset.form;
    // kode coba 1234 membuka data contoh (mode server maupun lokal)
    if ((kind === 'classcode' || kind === 'parentcode') && String(fd.get('code')).trim() === TRY_CODE) return go('#/mulai/' + (kind === 'classcode' ? 'siswa' : 'ortu'));
    if (kind === 'request') return submitRequest(f, fd);
    if (kind === 'reqcheck') { const code = String(fd.get('code') || '').trim().toUpperCase(); return code ? go('#/ajukan/status/' + code) : null; }
    if (kind === 'decide') return superDecide(f, fd, e.submitter);
    if (kind === 'assignkid') return assignKid(f, fd);
    if (kind === 'newschool') return superNewSchool(f, fd);
    if (kind === 'quote') return sendQuote(f, fd);
    if (kind === 'sgadd') return Cloud.rpc('school_teacher_add', { p_token: session.get().token, p_email: fd.get('email') }).then((r) => { toast(`${esc(r.name)} joined the school ✔`); loadSchoolTeachers(); }).catch((er) => toast(er.status ? esc(er.message) : 'Can\'t connect to the server'));
    if (kind === 'schoolplan') return Cloud.rpc('super_school_plan', { p_token: session.get().token, p_school_id: f.dataset.id, p_plan: fd.get('plan'), p_until: fd.get('until') || null, p_students: +fd.get('students') || null, p_note: String(fd.get('note') || '').trim() || null }).then(() => { toast('Plan saved ✔'); route(); }).catch((er) => toast(er.status ? esc(er.message) : 'Can\'t connect to the server'));
    if (kind === 'trystart') return startDemo(f.dataset.r, fd.get('name'), fd.get('child'), fd.getAll('link'));
    if (kind === 'fb') {
      const rating = +fd.get('rating'), comment = String(fd.get('comment') || '').trim(), { a, s: sid, by } = f.dataset;
      if (!rating) return toast('Choose the stars first ⭐');
      const finish = () => { tlog('feedback', { r: rating }); S.addFeedback(a, sid, by, rating, comment); ss.set('fbedit', ''); toast('Thank you for the review! 🙏'); route(); };
      if (!cloudOn()) return finish();
      const k = S.student(sid), c = k && S.cls(k.classId), code = session.get().code || (c && c.code);
      const btn = f.querySelector('button'); if (btn) btn.disabled = true;
      return Cloud.rpc('submit_feedback', { p_code: code, p_student_id: sid, p_assignment_id: a, p_by: by, p_rating: rating, p_comment: comment })
        .then(finish).catch((err) => { if (btn) btn.disabled = false; toast(err.status ? esc(err.message) : 'Can\'t connect to the server'); });
    }
    if (kind === 'nisn') {
      const sid = f.dataset.s, n = String(fd.get('nisn') || '').replace(/\D/g, '');
      if (n && n.length !== 10) return toast('NISN must be 10 digits');
      if (cloudOn()) return tAct('teacher_set_nisn', { p_student_id: sid, p_nisn: n }, 'NISN saved ✔');
      if (n && S.db.students.some((k) => k.nisn === n && k.id !== sid)) return toast('NISN is already used by another student');
      S.setNisn(sid, n); toast('NISN saved ✔'); return route();
    }
    if (cloudOn()) return cloudSubmit(f, fd, kind);
    if (kind === 'newkid') return startDemo('siswa', fd.get('name'));
    if (kind === 'kidcode') return toast('Learning codes need internet. Try again when online.');
    if (kind === 'joinclass') return toast('Joining a class needs internet. Try again when online.');
    if (kind === 'appfeedback') { tlog('feedback', { t: String(fd.get('text') || '').slice(0, 1000) }); toast('Thanks for your feedback 💚'); return go('#/pengaturan'); }
    if (kind === 'classcode') { const c = S.classByCode(fd.get('code')); if (!c) return toast('Class code not found'); go('#/siswa/' + c.code); }
    if (kind === 'parentcode') { const k = S.studentByParentCode(fd.get('code')); if (!k) return toast('Code not found. Please check it again.'); session.set({ role: 'ortu', id: k.id }); go('#/ortu/laporan'); }
    if (kind === 'register') { const t = S.createTeacher(fd.get('name'), fd.get('pin')); const c = S.createClass(t.id, fd.get('cls')); session.set({ role: 'guru', id: t.id, classId: c.id }); go('#/guru/kelola'); }
    if (kind === 'login') { const t = S.loginTeacher(fd.get('id'), fd.get('pin')); if (!t) return toast('Wrong PIN'); session.set({ role: 'guru', id: t.id }); go('#/guru/ringkasan'); }
    const ctx = teacherCtx();
    if (!ctx) return;
    if (kind === 'addbycode') return toast('In try-it mode, add students by typing their names.');
    if (kind === 'addkid') { String(fd.get('name')).split(/[,\n]/).map((x) => x.trim()).filter(Boolean).forEach((n) => S.addStudent(ctx.c.id, n)); route(); }
    if (kind === 'renameclass') { S.renameClass(ctx.c.id, fd.get('name')); route(); }
    if (kind === 'classset') { S.setClassSettings(ctx.c.id, { konteks: fd.get('konteks'), adab: fd.get('adab') === '1' }); toast('Class settings saved ✔'); return route(); }
    if (kind === 'newclass') { const c = S.createClass(ctx.t.id, fd.get('name')); const s = session.get(); s.classId = c.id; session.set(s); route(); }
    if (kind === 'grouptask') { const sk = fd.getAll('sk'), sids = f.dataset.sids.split(','); if (!sk.length) return toast('Choose at least one skill'); S.addAssignment(ctx.c.id, sk, fd.get('note'), fd.get('due'), sids); toast(`Task sent to ${sids.length} students ✔`); return route(); }
    if (kind === 'assign') { const sk = fd.getAll('sk'), sids = fd.get('target') === 'some' ? fd.getAll('sid') : []; if (!sk.length) return toast('Choose at least one skill'); if (fd.get('target') === 'some' && !sids.length) return toast('Choose at least one student'); S.addAssignment(ctx.c.id, sk, fd.get('note') || 'Practice: ' + SKILLS[sk[0]].name, fd.get('due'), sids); ss.set('asgFor', ''); ss.set('asgSkill', ''); toast('Task saved ✔'); route(); }
  });

  async function cloudSubmit(f, fd, kind) {
    const btn = f.querySelector('button'); if (btn) btn.disabled = true;
    const done = () => { if (btn) btn.disabled = false; };
    const fail = (err) => { done(); toast(err.status ? esc(err.message) : 'Can\'t connect to the server'); };
    try {
      if (kind === 'newkid') {
        const r = await Cloud.rpc('student_start', { p_name: String(fd.get('name') || '').trim() });
        session.set({ role: 'siswa', id: r.id, code: r.code });
        loaded = { key: '', at: 0 };
        return go('#/asesmen');
      }
      if (kind === 'appfeedback') {
        const ses = session.get();
        await Cloud.rpc('app_feedback_send', { p_text: String(fd.get('text') || '').trim(), p_role: ses.role || null, p_student_id: ses.role === 'siswa' ? ses.id : null, p_page: 'pengaturan' });
        toast('Thanks for your feedback 💚'); return go('#/pengaturan');
      }
      if (kind === 'joinclass') {
        const ses = session.get(), r = await Cloud.rpc('student_join_class', { p_student_id: ses.id, p_code: ses.code, p_class_code: String(fd.get('code') || '').trim().toUpperCase() });
        loaded = { key: '', at: 0 }; await ensure(true);
        toast(`🎉 You joined ${esc(r.className)}`); return go('#/belajar');
      }
      if (kind === 'kidcode') {
        const code = String(fd.get('code') || '').trim().toUpperCase();
        if (!code) return done();
        const r = await Cloud.rpc('student_login', { p_code: code });
        session.set({ role: 'siswa', id: r.id, code: r.code || code });
        loaded = { key: '', at: 0 };
        return go('#/belajar');
      }
      if (kind === 'classcode') return go('#/siswa/' + String(fd.get('code')).trim().toUpperCase());
      if (kind === 'parentcode') {
        const code = String(fd.get('code')).trim().toUpperCase();
        const b = await Cloud.rpc('parent_bundle', { p_code: code });
        if (!b || !b.students.length) { done(); return toast('Code not found. Please check it again.'); }
        const many = b.students.length > 1;
        session.set({ role: 'ortu', id: b.students[0].id, pcode: code, ...(many ? { kids: b.students.map((k) => k.id) } : {}) });
        S.loadBundle(b); loaded = { key: 'o' + code, at: Date.now() };
        return go(many ? '#/ortu/anak' : '#/ortu/laporan');
      }
      if (kind === 'plogin' || kind === 'pregister') {
        const r = kind === 'pregister'
          ? await Cloud.rpc('parent_register', { p_name: fd.get('name'), p_email: fd.get('email'), p_password: fd.get('pass') })
          : await Cloud.rpc('parent_login', { p_email: fd.get('email'), p_password: fd.get('pass') });
        if (r.error) { done(); return toast(esc(r.error)); }
        if (r.pending) { saveRequest(r, fd.get('name')); return go('#/ajukan/status/' + r.code); }
        session.set({ role: 'ortu', ptoken: r.token, pid: r.parentId });
        return go('#/ortu/anak');
      }
      if (kind === 'plink') {
        const r = await Cloud.rpc('parent_link', { p_token: session.get().ptoken, p_parent_code: String(fd.get('code')).trim().toUpperCase() });
        await ensure(true); toast(`${esc(r.name)} added ✔`); return route();
      }
      if (kind === 'register' || kind === 'login') {
        // Guru biasa: daftar gratis langsung aktif (SQL 020). Kode admin, atau server lama tanpa SQL 020: alur lama.
        const adminCode = String(fd.get('admin') || '').trim();
        const oldReg = () => Cloud.rpc('teacher_register', { p_name: fd.get('name'), p_email: fd.get('email'), p_password: fd.get('pass'), p_class_name: fd.get('cls'), p_admin_code: adminCode || null });
        const r = kind === 'register'
          ? (adminCode ? await oldReg() : await Cloud.rpc('teacher_signup', { p_name: fd.get('name'), p_email: fd.get('email'), p_password: fd.get('pass'), p_class_name: fd.get('cls') }).catch((e) => { if (e.status === 404) return oldReg(); throw e; }))
          : await Cloud.rpc('teacher_login', { p_email: fd.get('email'), p_password: fd.get('pass') });
        if (r.error) { done(); return toast(esc(r.error)); }
        if (r.pending) { saveRequest(r, fd.get('name')); return go('#/ajukan/status/' + r.code); }
        session.set({ role: 'guru', id: r.teacherId, token: r.token });
        return go('#/guru/ringkasan');
      }
      const ctx = teacherCtx();
      if (!ctx) return done();
      if (kind === 'addbycode') {
        try { const r = await Cloud.rpc('teacher_add_by_code', { p_token: session.get().token, p_class_id: ctx.c.id, p_learn_code: fd.get('code') }); await ensure(true); toast(`${esc(r.name)} joined this class ✔`); return route(); }
        catch (e) { done(); return toast(e.status === 404 ? 'This feature needs a server update (SQL 019).' : e.status ? esc(e.message) : 'Can\'t connect to the server'); }
      }
      if (kind === 'addkid') {
        const names = String(fd.get('name')).split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
        const used = ctx.kids.map((k) => k.avatar);
        const free = S.AVATARS.filter((a) => !used.includes(a));
        const avatars = names.map((_, i) => free[i] || S.AVATARS[Math.floor(Math.random() * S.AVATARS.length)]);
        return tAct('teacher_add_students', { p_class_id: ctx.c.id, p_names: names, p_avatars: avatars }, `${names.length} students added ✔`);
      }
      if (kind === 'classset') return tAct('class_set_settings', { p_class_id: ctx.c.id, p_settings: { konteks: fd.get('konteks') === 'islami' ? 'islami' : 'umum', adab: fd.get('adab') === '1' } }, 'Class settings saved ✔');
      if (kind === 'renameclass') return tAct('teacher_rename_class', { p_class_id: ctx.c.id, p_name: fd.get('name') }, 'Class name changed ✔');
      if (kind === 'newclass') {
        const id = await Cloud.rpc('teacher_create_class', { p_token: session.get().token, p_name: fd.get('name') });
        const s = session.get(); s.classId = id; session.set(s);
        await ensure(true); toast('New class created ✔'); return route();
      }
      if (kind === 'grouptask') {
        const sk = fd.getAll('sk'), sids = f.dataset.sids.split(',');
        if (!sk.length) { done(); return toast('Choose at least one skill'); }
        return tAct('teacher_add_assignment', { p_class_id: ctx.c.id, p_skills: sk, p_note: fd.get('note'), p_due: fd.get('due'), p_student_ids: sids }, `Task sent to ${sids.length} students ✔`);
      }
      if (kind === 'assign') {
        const sk = fd.getAll('sk'), sids = fd.get('target') === 'some' ? fd.getAll('sid') : [];
        if (!sk.length) { done(); return toast('Choose at least one skill'); }
        if (fd.get('target') === 'some' && !sids.length) { done(); return toast('Choose at least one student'); }
        ss.set('asgFor', ''); ss.set('asgSkill', '');
        // daftar siswa hanya dikirim untuk tugas khusus, agar tugas seluruh kelas tetap memakai fungsi lama
        return tAct('teacher_add_assignment', Object.assign({ p_class_id: ctx.c.id, p_skills: sk, p_note: fd.get('note') || 'Practice: ' + SKILLS[sk[0]].name, p_due: fd.get('due') }, sids.length ? { p_student_ids: sids } : {}), 'Task saved ✔');
      }
    } catch (err) { fail(err); }
  }

  // Tugas baru: cari materi, pilih kelas, dan jumlah materi yang dipilih di tombol kirim
  function filterSkills() {
    const box = document.getElementById('skbox'); if (!box) return;
    const q = document.getElementById('skq').value.trim().toLowerCase(), g = document.getElementById('skg').value;
    box.querySelectorAll('fieldset').forEach((fs) => {
      let any = false;
      fs.querySelectorAll('label').forEach((l) => { const hit = q ? (' ' + l.dataset.q).includes(' ' + q) : fs.dataset.g === g; l.hidden = !hit; if (hit) any = true; });
      fs.hidden = !any;
    });
  }
  document.addEventListener('input', (e) => {
    if (e.target.id === 'skq' || e.target.id === 'skg') filterSkills();
    if (e.target.name === 'sk' && e.target.closest('#skbox')) { const n = document.querySelectorAll('#skbox input:checked').length, b = document.getElementById('asgsend'); if (b) b.textContent = n ? `📌 Send task (${n} topics)` : '📌 Send task'; }
  });

  setInterval(async () => {
    const x = session.get();
    if (!cloudOn() || document.hidden || !document.querySelector('.bell')) return;
    const call = x.role === 'guru' && x.token ? ['teacher_bundle', { p_token: x.token }] : x.role === 'ortu' && x.ptoken ? ['parent_home', { p_token: x.ptoken }] : x.role === 'ortu' && x.pcode ? ['parent_bundle', { p_code: x.pcode }] : null;
    if (!call) return;
    try { const b = await Cloud.rpc(call[0], call[1]); if (b) { S.loadBundle(b); loaded.at = Date.now(); const bell = document.querySelector('.bell'); if (bell) bell.outerHTML = bellHTML(); } } catch (e) { /* coba lagi menit berikutnya */ }
  }, 60000);

  window.addEventListener('hashchange', route);
  route();
})();
