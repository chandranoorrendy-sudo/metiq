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
  const fmtTime = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? `${m} mnt` : `${Math.floor(m / 60)} jam ${m % 60} mnt`; };
  const ago = (ts) => { if (!ts) return 'belum pernah'; const d = Math.floor((Date.now() - ts) / DAY); return d <= 0 ? 'hari ini' : d === 1 ? 'kemarin' : `${d} hari lalu`; };
  const level = (s) => (s >= 100 ? ['Tuntas', 'lv4'] : s >= 80 ? ['Mahir', 'lv3'] : s >= 50 ? ['Berkembang', 'lv2'] : s > 0 ? ['Mulai', 'lv1'] : ['Belum', 'lv0']);
  // Kelas yang sedang dipilih (seperti IXL, siswa boleh membuka kelas mana pun)
  const getGrade = () => { let g = 1; try { g = +localStorage.getItem('metiq_grade') || 1; } catch (e) {} return GRADES.some((x) => x.id === g) ? g : 1; };
  const setGrade = (g) => { try { localStorage.setItem('metiq_grade', g); } catch (e) {} };
  const gradeTabs = () => `<div class="gtabs" role="tablist">${GRADES.map((g) => `<button role="tab" class="${g.id === getGrade() ? 'on' : ''}" data-act="grade" data-g="${g.id}">${g.name}</button>`).join('')}</div>`;
  const curUnits = () => unitsOf(getGrade());
  // Nama jenjang untuk label (kelas 9 ke atas memakai nama mata pelajaran SMA, seperti IXL)
  const gname = (g) => (GRADES.find((x) => x.id === g) || {}).name || 'Kelas ' + g;
  const gshort = (g) => (GRADES.find((x) => x.id === g) || {}).short || String(g);
  const chip = (s) => { const [l, c] = level(s); return `<span class="chip ${c}" title="${l}">${s >= 100 ? '🏆' : s}</span>`; };
  const session = { get() { try { return JSON.parse(localStorage.getItem('metiq_session')) || {}; } catch (e) { return {}; } }, set(v) { try { localStorage.setItem('metiq_session', JSON.stringify(v)); } catch (e) {} } };
  const go = (h) => { location.hash = h; };
  let timer = null;
  const Cloud = window.Cloud;
  // Mode server aktif jika Supabase dikonfigurasi, kecuali saat mencoba data contoh
  const cloudOn = () => Cloud.enabled && !session.get().demo;
  const loadingHTML = '<div class="loading"><span class="spin"></span>Memuat…</div>';
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
      if (!b) throw Object.assign(new Error('Data tidak ditemukan'), { status: 404 });
      S.loadBundle(b, ses.role === 'siswa' ? Cloud.pending(ses.id) : null, ses.id);
      loaded = { key, at: Date.now() };
      return true;
    } catch (e) {
      if (e.status) { session.set({}); loaded = { key: '', at: 0 }; toast(e.message); go('#/'); return false; }
      toast('Sedang offline. Menampilkan data terakhir.');
      return true;
    }
  }
  // Aksi guru di server: kirim, muat ulang data kelas, lalu tampilkan ulang
  async function tAct(fn, args, msg) {
    try { await Cloud.rpc(fn, Object.assign({ p_token: session.get().token }, args)); await ensure(true); if (msg) toast(msg); route(); }
    catch (e) { toast(e.status ? e.message : 'Tidak bisa terhubung ke server'); }
  }
  const toast =(msg) => { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); };

  // Bacakan soal memakai suara bawaan perangkat. Jika perangkat tidak punya suara bahasa Indonesia, peramban akan membaca
  // dengan aksen Inggris, jadi dalam kasus itu tidak ada suara dan tombol speaker disembunyikan (kelas "has-tts" di <html>).
  const TTS_ON = true;
  const idVoice = () => { try { return TTS_ON && 'speechSynthesis' in window ? speechSynthesis.getVoices().find((x) => x.lang && /^id([-_]|$)/i.test(x.lang)) || null : null; } catch (e) { return null; } };
  const syncTTS = () => document.documentElement.classList.toggle('has-tts', !!idVoice());
  if ('speechSynthesis' in window) { syncTTS(); if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', syncTTS); else speechSynthesis.onvoiceschanged = syncTTS; }
  function speak(text) {
    const voice = idVoice(); if (!voice) return;
    const t = strip(text).replace(/−/g, ' kurang ').replace(/\+/g, ' tambah ').replace(/=/g, ' sama dengan ').replace(/\?/g, ' berapa? ').replace(/×/g, ' kali ');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.lang = 'id-ID'; u.rate = 0.9;
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
  const realBtn = () => { const r = session.get().role; return r === 'siswa' ? '<button class="mq-real" data-act="realstart" aria-label="Mulai belajar sungguhan"><span class="sp">✨</span>Mulai sungguhan</button>' : r === 'guru' ? '<button class="mq-real" data-act="realsignup" data-k="guru" aria-label="Daftar guru gratis"><span class="sp">✨</span>Daftar guru gratis</button>' : ''; };
  const shell = (inner, opts = {}) => `
    <header class="top"><a href="#/" class="logo"><img class="logo-i" src="icons/icon.svg?v=69" alt="">Metiq<span class="alpha">Beta</span></a>${opts.right || ''}</header>
    <main class="wrap ${opts.cls || ''}">${session.get().demo ? `<div class="demobar">🧪 <span class="grow"><b>Mode coba</b>${tryInfo() && tryInfo().name ? ` · ${esc(tryInfo().name)}` : ''} · data contoh di perangkat ini</span>${realBtn()}<button class="link" data-act="logout">Keluar</button></div>` : ''}${inner}</main>`;

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
    return skillRows(sid).filter((r) => r.att >= 4 && r.score < 80 && (r.score < 60 || r.acc < 70)).sort((a, b) => a.acc - b.acc).map((r) => {
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
    { id: 'bil', name: 'Bilangan & Operasi Hitung', icon: '➗', desc: 'Penjumlahan, pengurangan, perkalian, pembagian, pecahan, desimal, dan pola bilangan.', c: '#ff7a59', bg: '#fff1ec', re: /Bilangan|Aljabar|Pengayaan/ },
    { id: 'geo', name: 'Geometri', icon: '🔺', desc: 'Bentuk, bangun datar dan ruang, sudut, simetri, dan koordinat.', c: '#4d96ff', bg: '#eef4ff', re: /Geometri/ },
    { id: 'ukur', name: 'Pengukuran', icon: '📏', desc: 'Panjang, berat, waktu, uang, luas, keliling, dan volume.', c: '#1fbf9f', bg: '#e8fbf5', re: /Pengukuran|uang/ },
    { id: 'data', name: 'Data & Peluang', icon: '📊', desc: 'Mengumpulkan, membaca, dan menafsirkan data, serta peluang.', c: '#9b6dff', bg: '#f4efff', re: /Data/ },
  ];
  const strandUnits = (st, g) => UNITS.filter((u) => (g ? u.grade === g : true) && st.re.test(u.km || ''));
  function viewHome() {
    const ses = session.get();
    // Guru yang sudah masuk langsung ke dasbornya
    if (ses.role === 'guru' && (cloudOn() ? ses.token : S.teacher(ses.id))) return go('#/guru/ringkasan');
    const kid = ses.role === 'siswa' && S.student(ses.id);
    app.innerHTML = `<div class="mq-land">
      <header class="mq-lhead"><a class="mq-logo" href="#/"><img src="icons/icon.svg?v=69" alt="">Metiq<span class="alpha">Beta</span></a><a class="mq-tlink" href="#/guru">Saya guru</a></header>
      <section class="mq-hero">
        <div class="mq-stage" aria-label="Meti dan teman-temannya"><span class="mq-sym a">+</span><span class="mq-sym b">×</span><span class="mq-sym c">=</span><span class="mq-sym d">7</span>
          <div class="st st-meti">${MQ.svg('hello', { size: 190 })}</div>
          <div class="st st-tito"><div class="hop">${MQ.svg('happy', { size: 96, who: 'tito', enter: false })}</div></div>
          <div class="st st-nahla"><div class="fly">${MQ.svg('cheer', { size: 86, who: 'nahla', enter: false })}</div></div>
          <div class="st st-lumo"><div class="jump">${MQ.svg('happy', { size: 92, who: 'lumo', enter: false })}</div><svg class="wave" viewBox="0 0 240 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 15 Q15 3 30 15 T60 15 T90 15 T120 15 T150 15 T180 15 T210 15 T240 15 V30 H0Z"/></svg></div></div>
        <h1>Belajar matematika jadi <span>seru!</span></h1>
        <p>Latihan singkat, naik level, dan kumpulkan hadiah bersama Meti.</p>
        ${kid ? `<a class="mq-resume" href="#/belajar"><span class="av">${avHTML(kid.avatar)}</span><span class="grow">${esc(kid.name)}<small style="display:block;font-weight:700;color:#6a7f7a">Lanjutkan belajarmu</small></span>›</a>` : ''}
        <div class="mq-cta">${kid
    ? '<a class="mq-btn pulse" href="#/belajar">Lanjut belajar</a><a class="mq-btn ghost" href="#/kode">Kode belajar</a>'
    : '<a class="mq-btn pulse" href="#/siswa-baru">Mulai belajar</a><a class="mq-btn ghost" href="#/kode">Saya sudah punya kode</a>'}</div>
        ${kid ? '' : '<p class="mq-land-alt"><a class="mq-link" href="#/mulai/siswa">Coba dulu dengan data contoh</a></p>'}
      </section>
      <section class="mq-feat">
        <div style="--bg:#e6fffa"><span class="em">🎯</span>Soal pas dengan levelmu</div>
        <div style="--bg:#fff3c4"><span class="em">🎬</span>Pelajaran beranimasi</div>
        <div style="--bg:#ffe3ec"><span class="em">🎁</span>Kumpulkan hadiah</div>
      </section>
      <p class="mq-gb-t">Untuk TK, SD, SMP, dan SMA: TK A sampai Kalkulus</p>
      <div class="mq-gb">${GRADES.map((g) => `<span title="${g.name}">${g.short || g.id}</span>`).join('')}</div>
      ${installGuideHTML()}
      <footer class="mq-lfoot"><a href="#/permainan">Permainan</a><a href="#/profesi">Profesi</a><a href="#/harga">Harga</a><a href="#/panduan/siswa">Bantuan</a><a href="#/ajukan">Ajukan akun</a><a href="#/ajukan/status">Cek status</a></footer>
    </div>`;
  }

  // Panduan memasang Metiq di layar utama HP (disembunyikan bila Metiq sudah dibuka sebagai aplikasi)
  function installGuideHTML() {
    const menu = (items, on) => `<div class="ig-menu">${items.map((x) => `<span class="${x === on ? 'on' : ''}">${x}</span>`).join('')}</div>`;
    const steps = [
      ['Ketuk ikon menu <b>☰</b> (tiga garis/titik) di <b>pojok kanan bawah</b> browser.', '<div class="ig-bar"><span>‹</span><span>›</span><span>⌂</span><span>▢</span><span class="on">☰</span></div>'],
      ['Pilih <b>Add page to</b> (Tambahkan halaman ke).', menu(['History', 'Downloads', 'Saved pages', '⊕ Add page to', 'Settings'], '⊕ Add page to')],
      ['Pilih <b>Home screen</b> (Layar utama).', menu(['Bookmarks', 'Quick access', 'Home screen', 'Install as web app'], 'Home screen')],
      ['Ketuk <b>Add</b> (Tambahkan). Ikon Metiq muncul di layar HP. Ketuk ikon itu untuk membuka Metiq kapan saja.', '<div class="ig-add"><img src="icons/icon.svg?v=69" alt=""><small>Metiq</small><div><span>Cancel</span><span class="on">Add</span></div></div>'],
    ];
    return `<details class="mq-install"><summary><span class="em">📲</span><span class="grow"><b>Pasang Metiq di layar HP</b><small>Buka Metiq dengan satu ketukan, seperti aplikasi</small></span><span class="chev">›</span></summary>
      <p class="ig-note">Langkah untuk <b>Samsung Internet</b>:</p>
      <ol class="ig-steps">${steps.map(([t, pic], i) => `<li><span class="ig-n">${i + 1}</span><div class="ig-pic">${pic}</div><p>${t}</p></li>`).join('')}</ol>
      <p class="ig-note"><b>Chrome:</b> ketuk <b>⋮</b> di pojok kanan atas → <b>Tambahkan ke layar utama</b> → <b>Tambahkan</b>.<br><b>iPhone (Safari):</b> ketuk tombol Bagikan <b>⬆</b> → <b>Tambahkan ke Layar Utama</b> → <b>Tambah</b>.</p></details>`;
  }

  function viewCurriculum() {
    app.innerHTML = shell(`
      <a class="back" href="#/">← Kembali</a>
      <h1>Kurikulum Matematika TK sampai SMA</h1>
      <p class="muted">Setiap bab mencantumkan rujukan IXL, Singapore Math, dan Kurikulum Merdeka yang setara.</p>
      <details class="card cdesign-wrap"><summary><b>🧭 Bagaimana kurikulum ini disusun, dan mengapa?</b></summary>${curriculumDesignHTML(false)}</details>
      ${gradeTabs()}
      <div class="vzpills strandpick"><button class="${ss.get('strand', '') ? '' : 'on'}" data-act="strand" data-s="">Semua</button>${STRANDS.map((st) => `<button class="${ss.get('strand', '') === st.id ? 'on' : ''}" data-act="strand" data-s="${st.id}">${st.icon} ${st.name}</button>`).join('')}</div>
      ${(() => { const st = STRANDS.find((x) => x.id === ss.get('strand', '')); const list = st ? strandUnits(st, getGrade()) : curUnits(); return list.length ? '' : `<section class="card center"><p class="muted">Belum ada bab ${st ? st.name : ''} di ${GRADES.find((g) => g.id === getGrade()).name}. Coba kelas lain.</p></section>`; })()}
      ${(STRANDS.find((x) => x.id === ss.get('strand', '')) ? strandUnits(STRANDS.find((x) => x.id === ss.get('strand', '')), getGrade()) : curUnits()).map((u) => `<section class="card unit" style="--c:${u.color}"><h2><span class="uicon">${u.icon}</span>${u.id}. ${u.name}</h2><p class="muted small">IXL: ${u.ixl} · Singapore Math: ${u.sg} · Kurikulum Merdeka: ${u.km}</p><a class="lessonlink" href="#/pelajaran/${u.id}">📖 Buka pelajaran</a><ol>${u.skills.map((s) => `<li>${s.name}</li>`).join('')}</ol></section>`).join('')}
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
    const items = [['belajar', '#/belajar', 'Belajar', IC.home], ...(TASKS_ON ? [['tugas', '#/tugas', 'Tugas', IC.task]] : []), ['main', '#/permainan', 'Main', IC.game], ['profesi', '#/profesi', 'Profesi', IC.job], ...(adabOn() ? [] : [['hadiah', '#/hadiah', 'Hadiah', IC.gift]]), ['aku', '#/aku', 'Aku', IC.me]];
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
  const mqBack = (href) => `<div class="mq-top"><a class="mq-ico" href="${href}" aria-label="Kembali">${IC.back}</a></div>`;

  function viewStudentEnter() {
    app.innerHTML = `<form data-form="classcode">${mqBack('#/')}
      <main class="mq-screen"><div class="mq-ob-body">
        <div class="mq-big-say"><div class="mq-bubble"><p>Masukkan <b class="hl">kode kelas</b> dari gurumu ya!</p></div>${MQ.svg('ask', { size: 160 })}</div>
        <input class="mq-code" id="mqcode" name="code" maxlength="5" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" inputmode="text" placeholder="•••••" aria-label="Kode kelas" required>
        <div class="mq-steps"><div><span class="n">1</span>Minta kode kelas ke Bu/Pak Guru</div><div><span class="n">2</span>Ketik kodenya, lalu pilih namamu</div></div>
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn" id="mqgo" disabled>Masuk</button><a class="mq-link" style="text-align:center" href="#/mulai/siswa">Belum punya kode? Coba dulu</a></div></div></form>`;
    setTimeout(() => { const i = document.getElementById('mqcode'); if (i) i.focus(); }, 300);
  }

  // Mulai belajar tanpa kelas: cukup nama, lalu anak mendapat kode belajar pribadi.
  function viewStudentStart() {
    app.innerHTML = `<form data-form="newkid">${mqBack('#/')}
      <main class="mq-screen"><div class="mq-ob-body">
        <div class="mq-big-say"><div class="mq-bubble"><p>Hai! Siapa <b class="hl">namamu</b>?</p></div>${MQ.svg('hello', { size: 170 })}</div>
        <input class="mq-name" name="name" maxlength="40" placeholder="Ketik namamu" aria-label="Namamu" autocomplete="off" required>
        <p class="mq-note">Belum perlu kode kelas. Kamu bisa langsung belajar, dan gurumu bisa memasukkannya nanti.</p>
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn pulse">Mulai belajar</button><a class="mq-link" style="text-align:center" href="#/kode">Sudah pernah belajar? Masuk dengan kode</a></div></div></form>`;
    setTimeout(() => { const i = document.querySelector('input[name=name]'); if (i) i.focus(); }, 280);
  }

  // Masuk lagi memakai kode belajar (misalnya dari HP lain).
  function viewStudentCode() {
    app.innerHTML = `<form data-form="kidcode">${mqBack('#/')}
      <main class="mq-screen"><div class="mq-ob-body">
        <div class="mq-big-say"><div class="mq-bubble"><p>Masukkan <b class="hl">kode belajarmu</b>.</p></div>${MQ.svg('ask', { size: 160 })}</div>
        <input class="mq-code" name="code" maxlength="6" placeholder="••••••" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" aria-label="Kode belajar" required>
        <div class="mq-steps"><div><span class="n">1</span>Kode ini ada di halaman <b>Aku</b></div><div><span class="n">2</span>Punya kode kelas? <a class="mq-inline" href="#/siswa">Masuk lewat kode kelas</a></div></div>
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn pulse">Masuk</button><a class="mq-link" style="text-align:center" href="#/siswa-baru">Belum punya kode? Mulai belajar</a></div></div></form>`;
    setTimeout(() => { const i = document.querySelector('input[name=code]'); if (i) i.focus(); }, 280);
  }

  async function viewStudentPick(code) {
    let c, kids;
    if (cloudOn()) {
      app.innerHTML = loadingHTML;
      try { const r = await Cloud.rpc('class_roster', { p_code: code }); if (!r) throw Object.assign(new Error('Kode kelas tidak ditemukan'), { status: 404 }); c = r.class; kids = r.students; }
      catch (e) { toast(e.status ? 'Kode kelas tidak ditemukan' : 'Tidak bisa terhubung ke server'); return go('#/siswa'); }
    } else {
      c = S.classByCode(code);
      if (!c) { toast('Kode kelas tidak ditemukan'); return go('#/siswa'); }
      kids = S.studentsOf(c.id);
    }
    app.innerHTML = `${mqBack('#/siswa')}<main class="mq-screen"><div class="mq-ob-body" style="justify-content:flex-start">
      <div class="mq-say" style="align-self:stretch">${MQ.svg('hello', { size: 110 })}<div class="mq-bubble"><p>Siapa kamu? <b class="hl">Ketuk fotomu!</b><span class="sub">${esc(c.name)}</span></p></div></div>
      <div class="mq-kids">${kids.map((k) => `<button class="mq-kid" data-act="pickkid" data-id="${k.id}" data-code="${c.code}"><span class="av">${avHTML(k.avatar)}</span>${esc(k.name)}</button>`).join('') || '<p class="muted center">Belum ada siswa di kelas ini. Minta gurumu menambahkan namamu.</p>'}</div>
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
    if (s.state === 'locked') return `<div class="mq-pop lock" style="--ax:${ax}"><b>🔒 Belum terbuka</b><small>Selesaikan langkah sebelumnya dulu ya</small><button class="mq-btn" data-act="tocur">Ke langkahku</button></div>`;
    const lvl = s.att ? `${level(s.sc)[0]} · skor ${s.sc}` : 'Belum dicoba';
    return `<div class="mq-pop" style="--ax:${ax}"><b>${esc(sk.name)}</b><small>${lvl}</small><a class="mq-btn" href="#/latihan/${id}">${s.sc >= 80 ? 'Latih lagi' : s.att ? 'Lanjutkan' : 'Mulai'}</a></div>`;
  }
  /* ---------- Sapaan di peta belajar (seperti sapaan pembuka di Claude) ----------
   * 30 kalimat untuk tanggal 1–30 dalam sebulan, ditambah sapaan sesuai jam. Larut malam selalu memakai sapaan larut.
   * Berganti setiap kali anak membuka Metiq (sesi baru), tetapi tetap sama selama satu sesi. {n} = nama depan. */
  const SAPA_HARI = [
    'Sudah siap lanjut, {n}?', '{n}, saatnya belajar!', 'Ayo, {n}, lanjutkan!', 'Hari ini mau belajar apa, {n}?', 'Otakmu siap berhitung, {n}?',
    'Satu langkah lagi, {n}!', '{n}, Meti sudah menunggumu!', 'Yuk kumpulkan bintang, {n}!', 'Pelan-pelan juga hebat, {n}.', 'Siap jadi juara hitung, {n}?',
    'Halo lagi, {n}!', 'Kita lanjutkan petualangannya, {n}?', '{n}, angka-angka rindu kamu!', 'Coba satu soal dulu, {n}?', 'Hebat, kamu datang lagi, {n}!',
    'Ayo jaga apimu tetap menyala, {n}!', '{n}, hari ini pasti seru!', 'Salah itu bagian dari belajar, {n}.', 'Mau pecahkan rekormu, {n}?', 'Sedikit demi sedikit, {n}!',
    '{n}, ayo asah otakmu!', 'Siap menjawab tantangan, {n}?', 'Senang bertemu lagi, {n}!', 'Kamu makin pintar, {n}!', 'Ayo mulai dengan semangat, {n}!',
    '{n}, satu bab lagi menantimu!', 'Berani coba soal baru, {n}?', 'Waktunya jadi pemikir hebat, {n}!', 'Teruskan langkahmu, {n}!', '{n}, ayo capai target hari ini!',
  ];
  const SAPA_JAM = [
    [4, 11, ['Selamat pagi, {n}!', 'Pagi yang cerah, {n}!', 'Pagi, {n}! Siap belajar?']],
    [11, 15, ['Selamat siang, {n}!', 'Siang, {n}! Lanjut sebentar?']],
    [15, 18, ['Selamat sore, {n}!', 'Sore yang seru, {n}!']],
    [18, 22, ['Selamat malam, {n}!', 'Belajar sebentar sebelum tidur, {n}?']],
  ];
  const SAPA_LARUT = ['Belajar malam-malam, {n}?', 'Masih semangat, {n}?', 'Jangan lupa istirahat, {n}.'];
  function sapaan(name) {
    const n = esc(String(name || '').trim().split(/\s+/)[0] || 'kamu'), now = new Date(), h = now.getHours(), day = now.getDate();
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
    let n = 0;
    const node = (s, u, withBuddy) => {
      const x = XS[n++ % XS.length], sk = SKILLS[s.id], done = s.state === 'done' || s.state === 'gold';
      const badge = done ? `<span class="mq-badge">${s.state === 'gold' ? '★' : IC.ok}</span>` : s.state === 'locked' ? `<span class="mq-badge">${IC.lock}</span>` : '';
      return `<div class="mq-row"><div class="mq-n ${s.state} ${s.state === 'cur' ? 'cur' : ''}" style="--x:${x}px">
        ${s.state === 'cur' ? `<a class="mq-label" href="#/latihan/${s.id}">Mulai</a>` : ''}
        <button class="mq-bub-node" style="--p:${s.state === 'locked' ? 0 : Math.min(100, s.sc)}" data-act="node" data-id="${s.id}" data-x="${x}" aria-label="${esc(sk.name)}"><i><span>${chLogo(u)}</span></i></button>${badge}${TASKS_ON && s.task ? '<span class="mq-badge task" title="Tugas dari guru">📌</span>' : ''}
        ${withBuddy ? `<div class="mq-buddy ${x > 0 ? 'l' : 'r'}">${MQ.svg('hello', { size: 104, who: unitBuddy(u) })}</div>` : ''}</div></div><div class="mq-pop-slot" id="pop-${s.id}"></div>`;
    };
    const banner = (u, cls, extra) => `<div class="mq-unit ${cls}"><span class="em">${chLogo(u)}</span><span class="grow"><small>Bab ${u.id}</small><b>${u.name}</b></span>${extra || `<a class="les" href="#/pelajaran/${u.id}"><span class="em2">📖</span>Belajar</a>`}</div>`;
    const chestRow = (u) => {
      const state = chestStateOf(st.id, u), t = S.testOf(st.id, u.id);
      return `<div class="mq-row"><div class="mq-n chest ${state}">${state === 'ready' ? `<a class="mq-label" href="#/ujian/${u.id}">Ujian!</a>` : ''}<button class="mq-chest ${state}" data-act="chest" data-u="${u.id}" aria-label="Peti ujian bab ${u.id}">${chestSVG(state)}</button>${state === 'open' && t ? `<span class="mq-cstars">${'★'.repeat(chestTier(t.stars))}</span>` : ''}</div></div><div class="mq-pop-slot" id="pop-ch-${u.id}"></div>`;
    };
    // Seperti peta Duolingo: hanya bab yang sudah/sedang dipelajari yang tampil, ditambah satu bab berikutnya berwarna abu.
    // Bab sesudahnya disembunyikan supaya layar tidak penuh gembok.
    let teaser = false;
    const blocks = m.units.map((u) => {
      const ss = u.skills.map((s) => m.st(s.id)), started = ss.some((s) => s.state === 'cur' || s.state === 'done' || s.state === 'gold' || s.att > 0);
      if (!started) {
        if (teaser) return '';
        teaser = true;
        return `<div class="mq-next"><span class="tag">Berikutnya</span><span class="em">${chLogo(u)}</span><b>${u.name}</b><small>Bab ${u.id} · ${u.skills.length} langkah</small><button class="mq-btn ghost sm" data-act="tip" data-t="🔒 Selesaikan bab sebelumnya dulu ya">${IC.lock.replace('<svg', '<svg width="18" height="18"')} Terkunci</button></div>`;
      }
      const all = ss.every((s) => s.state === 'done' || s.state === 'gold'), hasCur = ss.some((s) => s.state === 'cur'), hasOpen = ss.some((s) => s.state === 'open');
      const reward = chestRow(u);
      const th = unitBuddy(u) ? ' th-' + unitBuddy(u) : '';
      if (all) return `<details class="mq-ud${th}"><summary>${banner(u, 'done', '<span class="chev">⌄</span>')}</summary><div class="mq-path">${ss.map((s) => node(s, u, false)).join('')}${reward}</div></details>`;
      if (hasCur) return `<section class="mq-sec${th}">${banner(u, '')}<div class="mq-path">${ss.map((s) => node(s, u, s.state === 'cur')).join('')}${reward}</div></section>`;
      if (hasOpen) return `<details class="mq-ud${th}"><summary>${banner(u, 'lock', '<span class="chev">⌄</span>')}</summary><div class="mq-path">${ss.map((s) => node(s, u, false)).join('')}</div></details>`;
      return `<button class="mq-unit lock" data-act="tip" data-t="🔒 Selesaikan bab sebelumnya dulu ya"><span class="em">${chLogo(u)}</span><span class="grow"><small>Bab ${u.id}</small><b>${u.name}</b></span><span>${IC.lock.replace('<svg', '<svg width="24" height="24"')}</span></button>`;
    }).join('');
    const allDone = m.cur >= m.flat.length;
    const gradeSheet = `<div class="mq-modal" id="gsheet" hidden data-act="gclose"><div class="mq-sheet"><h2>Pilih kelas</h2><div class="mq-grades">${GRADES.map((x) => { const sk = unitsOf(x.id).flatMap((u) => u.skills), pr = S.progressAll(st.id), dn = sk.filter((s) => ((pr[s.id] || {}).score || 0) >= 80).length; return `<button class="mq-g ${x.id === g ? 'on' : ''}" data-act="grade" data-g="${x.id}"><small>${x.stage || 'Kelas'}</small><b>${x.short || x.id}</b><span class="bar"><i style="width:${pct(dn, sk.length)}%"></i></span></button>`; }).join('')}</div><button class="mq-btn ghost" style="margin-top:16px" data-act="gclose">Tutup</button></div></div>`;
    app.innerHTML = mqPage(`
      <div class="mq-bar">
        <button class="mq-chip grade" data-act="gsheet" aria-label="Pilih kelas">${gname(g)} <small>▾</small></button>
        <button class="mq-chip" data-act="tip" data-t="🔥 ${streakOf(st.id)} hari belajar berturut-turut" aria-label="Hari beruntun"><span class="em">🔥</span>${streakOf(st.id)}</button>
        <button class="mq-chip star" data-act="tip" data-t="⭐ Total bintangmu: dari latihan, ujian bab, dan permainan" aria-label="Bintang"><span class="em">⭐</span>${S.starsOf(st.id)}</button>
        <button class="mq-ring ${mins >= goal ? 'done' : ''}" style="--p:${Math.min(100, (mins / goal) * 100)}" data-act="tip" data-t="🎯 Target hari ini: ${Math.min(goal, Math.floor(mins))} dari ${goal} menit" aria-label="Target harian"><span>🎯</span></button>
      </div>
      <h1 class="mq-hello">${SAPA_IC}<span>${sapaan(st.name)}</span></h1>
      ${unsent ? `<div class="mq-demo">📶 ${unsent} jawaban menunggu internet untuk dikirim ke guru.</div>` : ''}
      ${TASKS_ON && todo ? `<a class="mq-task" href="#/tugas"><span class="em">📌</span><b>${todo} tugas dari gurumu</b><span>›</span></a>` : ''}
      ${allDone ? `<div class="mq-all">${MQ.svg('cheer', { size: 120 })}<div>Semua bab ${gname(g)} sudah tuntas! 🎉</div><button class="mq-btn" style="margin-top:12px" data-act="gsheet">Pilih kelas lain</button></div>` : ''}
      ${blocks}
      ${gradeSheet}`, 'belajar');
    setTimeout(() => { const c = document.querySelector('.mq-n.cur'); if (c && c.getBoundingClientRect().bottom > innerHeight - 110) c.scrollIntoView({ block: 'center' }); }, 80);
    void curId;
  }

  /* ----- Tugas dari guru ----- */
  const skillRow = (id, p) => { const sk = SKILLS[id], sc = p ? p.score : 0; return `<a class="mq-skrow" href="#/latihan/${id}"><span class="em">${unitIcon(sk)}</span><span class="grow">${esc(sk.name)}<small>${p && p.att ? level(sc)[0] : 'Belum dicoba'}</small></span>${chip(sc)}</a>`; };
  function viewTasks() {
    const ses = session.get(), st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    syncTasks(st);
    const prog = S.progressAll(st.id), asg = S.assignmentsFor(st.id), todo = asg.filter((a) => !S.isDone(a.id, st.id)), done = asg.filter((a) => S.isDone(a.id, st.id));
    const card = (a) => `<section class="mq-card">${a.students && a.students.length ? '<span class="pill special">🎯 Khusus untukmu</span>' : ''}<h3>📌 ${esc(a.note || 'Tugas dari guru')}</h3>${a.due ? `<p class="small muted" style="margin:0 0 6px">Sampai ${esc(fdue(a.due))}</p>` : ''}${a.skills.filter((k) => SKILLS[k]).map((k) => skillRow(k, prog[k])).join('')}${S.isDone(a.id, st.id) ? '<p class="mq-unlock" style="animation:none;margin-top:10px">✅ Selesai</p>' : submitBar(a, prog)}${feedbackHTML(a, st.id, 'siswa')}</section>`;
    app.innerHTML = mqPage(`<h1 class="mq-h">Tugas dari guru</h1>
      ${todo.length ? todo.map(card).join('') : `<div class="mq-empty">${MQ.svg('happy', { size: 150 })}<div>${asg.length ? 'Semua tugas sudah selesai. Hebat!' : 'Belum ada tugas dari gurumu.'}</div><a class="mq-btn" style="max-width:280px" href="#/permainan">Main permainan</a></div>`}
      ${done.length ? `<h2 class="mq-sub" style="margin-top:18px">Sudah selesai</h2>${done.map(card).join('')}` : ''}`, 'tugas');
  }

  /* ----- Profil ----- */
  function viewProfile() {
    const ses = session.get(), st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const c = S.cls(st.classId), wk = weekStats(st.id), goal = goalOf(st.id);
    const gold = Object.entries(S.progressAll(st.id)).filter(([k, p]) => SKILLS[k] && p.score >= 100).length;
    const tile = (l, v, col) => `<div class="mq-stat" style="--c:${col}"><small>${l}</small><b>${v}</b></div>`;
    app.innerHTML = mqPage(`
      <section class="mq-me"><a class="mq-gear" href="#/pengaturan" aria-label="Pengaturan">${IC.gear}</a><a class="av" href="#/avatar/saya" aria-label="Ganti gambar profil">${avHTML(st.avatar)}<span class="edit">✏️</span></a><h1>${esc(st.name)}</h1><p>${c ? esc(c.name) : 'Belajar sendiri'}</p></section>
      <div class="mq-tiles3">${tile('Beruntun', `🔥 ${streakOf(st.id)}`, '#ff8a00')}${tile('Bintang', `⭐ ${S.starsOf(st.id)}`, '#e0a800')}${tile('Tuntas', `🏆 ${gold}`, '#19b796')}</div>
      ${!st.classId && ses.code ? `<section class="mq-card"><h3>🔑 Kode belajarmu</h3><p class="mq-bigcode">${esc(ses.code)}</p><p class="mq-hint">Simpan kode ini. Di HP lain, buka Metiq lalu pilih <b>Saya sudah punya kode</b>.</p></section>` : ''}
      <section class="mq-card"><h3>🏅 Lencana bab · ${gname(getGrade())}</h3><div class="mq-badges">${unitsOf(getGrade()).map((u) => { const t = S.testOf(st.id, u.id), on = t && t.best >= 60; return `<button class="mq-bd ${on ? 'on' : ''}" data-act="tip" data-t="${on ? '🏅 Lencana Bab ' + u.id + ' didapat!' : '🔒 Lulus ujian bab ' + u.id + ' untuk mendapatkan lencana ini'}" aria-label="Lencana bab ${u.id}"><span>${chLogo(u)}</span></button>`; }).join('')}</div></section>
      ${meCharts(st.id, goal)}
      <div class="mq-list"><a href="#/laporanku"><span class="em">📄</span>Laporanku<span class="go">›</span></a>
        <a href="#/pengaturan"><span class="em">⚙️</span>Pengaturan<span class="go">›</span></a></div>`, 'aku');
  }

  /* ---------- Grafik untuk siswa di halaman Aku ----------
   * 1) Menit belajar 7 hari terakhir (batang, satu seri) dengan garis target harian.
   * 2) Kemajuan keterampilan di kelas yang sedang dipelajari (satu batang bertumpuk, gradasi satu warna). */
  const MS_CAP = 180000; // sama dengan perhitungan waktu di tempat lain: satu jawaban dihitung paling lama 3 menit
  const HARI3 = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'], HARI7 = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  function meCharts(sid, goal) {
    const t0 = todayStart(), ans = S.answersOf(sid);
    const days = [...Array(7)].map((_, k) => {
      const from = t0 - (6 - k) * DAY, list = ans.filter((a) => a.ts >= from && a.ts < from + DAY);
      return { d: new Date(from), min: Math.round(list.reduce((t, a) => t + Math.min(a.ms || 0, MS_CAP), 0) / 60000), n: list.length, today: k === 6 };
    });
    const top = Math.max(goal, ...days.map((x) => x.min), 1), totMin = days.reduce((t, x) => t + x.min, 0), hit = days.filter((x) => x.min >= goal).length;
    const H = 120, y = (v) => Math.round((v / top) * H);
    const bars = days.map((x) => `<button class="mc-col ${x.today ? 'today' : ''}" data-act="tip" data-t="${HARI7[(x.d.getDay() + 6) % 7]}: ${x.min} menit · ${x.n} soal" aria-label="${HARI7[(x.d.getDay() + 6) % 7]}, ${x.min} menit, ${x.n} soal">
        <span class="mc-bar" style="height:${Math.max(x.min ? 4 : 0, y(x.min))}px"></span><small>${x.today ? 'Hari ini' : HARI3[x.d.getDay()]}</small></button>`).join('');
    const week = `<section class="mq-card mc"><h3>📈 Belajarku 7 hari</h3>
      <p class="mc-key"><i></i>Target ${goal} menit sehari</p><div class="mc-hero"><div><b>${totMin}</b><small>menit</small></div><div><b>${days.reduce((t, x) => t + x.n, 0)}</b><small>soal</small></div><div><b>${hit}/7</b><small>hari capai target</small></div></div>
      <div class="mc-plot" aria-label="Menit belajar 7 hari terakhir: ${days.map((x) => `${HARI3[x.d.getDay()]} ${x.min}`).join(', ')}. Target ${goal} menit per hari.">
        <div class="mc-goal" style="bottom:${y(goal) + 22}px"></div>${bars}</div></section>`;
    // kemajuan keterampilan di kelas yang sedang dipelajari
    const g = getGrade(), prog = S.progressAll(sid), sk = unitsOf(g).flatMap((u) => u.skills);
    const LV = [['Tuntas', '#0a7d68'], ['Mahir', '#19b796'], ['Berkembang', '#66e3c4'], ['Mulai', '#c2f3e6'], ['Belum dicoba', '#e6eae9']];
    const cnt = LV.map(([l]) => sk.filter((s) => { const p = prog[s.id] || {}; return (p.att ? level(p.score || 0)[0] : 'Belum dicoba') === l; }).length);
    const seg = LV.map(([l, c], k) => cnt[k] ? `<button class="mc-seg" style="flex:${cnt[k]};background:${c}" data-act="tip" data-t="${l}: ${cnt[k]} keterampilan" aria-label="${l}: ${cnt[k]} keterampilan"></button>` : '').join('');
    const mastered = cnt[0] + cnt[1];
    const prog2 = `<section class="mq-card mc"><h3>🎯 Kemajuanku di ${gname(g)}</h3>
      <p class="mc-big"><b>${mastered}</b> dari ${sk.length} keterampilan sudah Mahir atau Tuntas</p>
      <div class="mc-stack" aria-label="${LV.map(([l], k) => `${l} ${cnt[k]}`).join(', ')}">${seg}</div>
      <div class="mc-legend">${LV.map(([l, c], k) => `<span><i style="background:${c}"></i>${l} <b>${cnt[k]}</b></span>`).join('')}</div></section>`;
    return week + prog2;
  }

  /* ---------- Pengaturan siswa (seperti Settings di Duolingo): Preferensi, Metiq untuk Sekolah, Pusat Bantuan, Masukan ---------- */
  function viewSettings(sub) {
    const ses = session.get(), st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const top = (title, back) => `<div class="mq-top mq-settop"><a class="mq-ico" href="${back}" aria-label="Kembali">${IC.back}</a><h1>${title}</h1><span class="mq-ico"></span></div>`;
    const c = S.cls(st.classId), real = cloudOn() && !ses.demo;
    if (sub === 'preferensi') {
      const goal = goalOf(st.id);
      app.innerHTML = mqPage(`${top('Preferensi', '#/pengaturan')}
        <section class="mq-card"><h3>🎯 Target belajar tiap hari</h3><div class="mq-goalchips">${[[5, 'Santai'], [10, 'Biasa'], [15, 'Serius'], [20, 'Hebat']].map(([m, l]) => `<button class="${m === goal ? 'on' : ''}" data-act="goal" data-m="${m}">${m} mnt<small>${l}</small></button>`).join('')}</div></section>
        <div class="mq-list"><button data-act="soundtoggle"><span class="em">${window.SFX.enabled() ? '🔔' : '🔕'}</span><span class="t">${window.SFX.enabled() ? 'Efek suara menyala' : 'Efek suara mati'}</span></button>
          <a href="#/avatar/saya"><span class="em">🖼️</span>Ganti gambar profil<span class="go">›</span></a></div>`, 'aku');
      return;
    }
    if (sub === 'sekolah') {
      app.innerHTML = mqPage(`${top('Metiq untuk Sekolah', '#/pengaturan')}
        <section class="mq-school"><span class="a1">${avHTML('👩‍🏫')}</span>${MQ.svg('cheer', { size: 130 })}<span class="a2">${avHTML('🧒')}</span></section>
        <section class="mq-card mq-join">${c ? `<h3>🏫 Kelasmu</h3><p class="mq-classnow"><b>${esc(c.name)}</b>${c.teacherName ? `<small>${esc(c.teacherName)}</small>` : ''}</p><p class="mq-hint">Gurumu bisa melihat kemajuan belajarmu dan memberi tugas.</p>`
          : `<h3>Gabung kelas</h3><p class="mq-hint">Masukkan kode dari gurumu. Gurumu bisa melihat kemajuanmu, termasuk semua yang sudah kamu pelajari sebelumnya, dan memberi tugas.</p>
          ${real ? '<form data-form="joinclass"><input class="mq-code" name="code" maxlength="6" placeholder="••••••" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" aria-label="Kode kelas" required><button class="mq-btn">Gabung</button></form>'
            : '<p class="mq-hint"><b>Ini mode coba.</b> Untuk gabung kelas, mulai belajar sungguhan dulu.</p><button class="mq-btn" data-act="realstart">✨ Mulai sungguhan</button>'}`}</section>
        ${!st.classId && ses.code && real ? `<section class="mq-card"><h3>🔑 Kode belajarmu</h3><p class="mq-bigcode">${esc(ses.code)}</p><p class="mq-hint">Untuk masuk lagi di HP lain.</p></section>` : ''}`, 'aku');
      return;
    }
    if (sub === 'masukan') {
      app.innerHTML = mqPage(`${top('Kirim masukan', '#/pengaturan')}
        <form data-form="appfeedback" class="mq-card mq-fbform"><h3>💬 Ceritakan pada kami</h3><p class="mq-hint">Ada soal yang salah, permainan yang membingungkan, atau ide baru? Tulis di sini.</p>
          <textarea name="text" maxlength="1000" rows="5" required placeholder="Tulis masukanmu…" aria-label="Masukan"></textarea><button class="mq-btn">Kirim</button></form>`, 'aku');
      return;
    }
    const row = (href, em, t, note) => `<a href="${href}"><span class="em">${em}</span><span class="t">${t}${note ? `<small>${note}</small>` : ''}</span><span class="go">›</span></a>`;
    app.innerHTML = mqPage(`${top('Pengaturan', '#/aku')}
      <h2 class="mq-sethead">Akun</h2><div class="mq-list">${row('#/pengaturan/preferensi', '🎛️', 'Preferensi', 'Target harian, suara, gambar profil')}${row('#/pengaturan/sekolah', '🏫', 'Metiq untuk Sekolah', c ? esc(c.name) : 'Gabung kelas dengan kode dari guru')}</div>
      <h2 class="mq-sethead">Dukungan</h2><div class="mq-list">${row('#/panduan/siswa', '❓', 'Pusat Bantuan')}${row('#/pengaturan/masukan', '💬', 'Kirim masukan')}</div>
      <div class="mq-list"><button class="danger" data-act="logout"><span class="em">🚪</span>Keluar</button></div>`, 'aku');
  }

  /* ---------- Dasbor siswa: sapaan, rekomendasi, kemajuan minggu ini, papan hadiah ---------- */
  const greet = () => { const h = new Date().getHours(); return h < 11 ? 'Selamat pagi ☀️' : h < 15 ? 'Selamat siang 🌤️' : h < 18 ? 'Selamat sore 🌇' : 'Selamat malam 🌙'; };
  // Minggu berjalan, mulai hari Senin
  function weekStats(sid) {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const from = d.getTime() - ((d.getDay() + 6) % 7) * DAY;
    const ans = S.answersOf(sid).filter((a) => a.ts >= from);
    return { from, n: ans.length, ms: ans.reduce((t, a) => t + Math.min(a.ms || 0, 180000), 0), skills: new Set(ans.filter((a) => a.ok).map((a) => a.skill)).size };
  }
  // Rekomendasi: ulangi yang lemah, lanjutkan yang sedang dikerjakan, lalu keterampilan baru setelah yang terakhir dikuasai
  function recommend(sid, g) {
    const dg = S.diagOf(sid, 'b') || S.diagOf(sid), gaps = dg ? dg.items.filter((x) => !x.ok && SKILLS[x.id] && S.progress(sid, x.id).score < 80).map((x) => ({ id: x.id, why: `Dari asesmen awal · ${gname(SKILLS[x.id].grade)}` })) : [];
    if (gaps.length) return [...gaps.slice(0, 4), ...recommendBase(sid, g).filter((r) => !gaps.some((x) => x.id === r.id))].slice(0, 6);
    return recommendBase(sid, g);
  }
  function recommendBase(sid, g) {
    const prog = S.progressAll(sid), order = unitsOf(g).flatMap((u) => u.skills.map((x) => x.id));
    let last = -1;
    order.forEach((id, i) => { if ((prog[id] || {}).score >= 80) last = i; });
    const out = weaknesses(sid).filter((w) => w.skill.grade === g).slice(0, 2).map((w) => ({ id: w.id, why: `Ulangi lagi · skormu ${w.score}` }));
    order.filter((id) => prog[id] && prog[id].att && prog[id].score < 80 && !out.some((o) => o.id === id))
      .sort((a, b) => (prog[b].last || 0) - (prog[a].last || 0)).slice(0, 2)
      .forEach((id) => out.push({ id, why: `Lanjutkan · skormu ${prog[id].score}` }));
    order.slice(last + 1).filter((id) => !(prog[id] && prog[id].att)).slice(0, Math.max(2, 6 - out.length))
      .forEach((id) => out.push({ id, why: 'Keterampilan baru' }));
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
  const chLabel = (c) => ({ q: `Jawab ${c.n} soal`, t: `Berlatih selama ${c.n} menit`, s: `Capai skor 80 (Mahir) di ${c.n} keterampilan`, m: `Tuntaskan ${c.n} keterampilan (skor 100)` }[c.k]);
  const chUnit = { q: 'soal', t: 'menit', s: 'keterampilan mahir', m: 'keterampilan tuntas' };
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
  const nextWin = (pb, short) => { const parts = Object.entries(pb.next).map(([k, n]) => `${n} ${chUnit[k]} lagi`); return short ? parts.slice(0, 2).join(' atau ') : parts.join(', atau '); };
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
      : i === cur ? `<button class="alb-th cur" data-act="album" data-i="${i}" aria-label="Gambar misteri, ${have} dari ${PIECES} keping">${puzzleHTML(i, have)}<b>❓</b></button>`
        : `<button class="alb-th lock" data-act="tip" data-t="🔒 Lengkapi puzzle sebelumnya dulu ya" aria-label="Terkunci">${x.svg}<span class="lk">${IC.lock}</span><b>?</b></button>`;
    app.innerHTML = mqPage(`
      <div class="alb-head"><div><h1>Album Nusantara</h1><p>Kumpulkan keping, buka gambar Indonesia!</p></div><span class="mq-gchip">🧩 ${total}</span></div>
      <section class="alb-main"><small>Puzzle ${cur + 1} dari ${ALB.length}</small>${done(cur) ? `<h2>${esc(a.name)}</h2><p class="pl">📍 ${esc(a.place)}</p>` : '<h2>❓ Gambar misteri</h2><p class="pl">Tempat apa di Indonesia ini? Tebak sebelum terbuka!</p>'}
        ${puzzleHTML(cur, have, 'big')}
        <div class="alb-prog"><i style="width:${(have / PIECES) * 100}%"></i><span>${have}/${PIECES}</span></div>
        <p class="alb-msg">${total >= ALB.length * PIECES ? '🎉 Semua puzzle sudah lengkap. Hebat!' : have ? `Tinggal <b>${PIECES - have} keping</b> lagi untuk membuka gambar ini!` : 'Selesaikan tantangan di bawah untuk mendapat keping pertama!'}</p></section>
      ${goals.length ? `<section class="mq-card"><h3>🧩 Cara dapat keping</h3>${goals.map(goalRow).join('')}<a class="mq-btn" href="#/belajar">Ayo belajar</a></section>` : ''}
      <h2 class="mq-sethead">Albumku</h2><div class="alb-grid">${ALB.map(thumb).join('')}</div>
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
    box.innerHTML = full ? `${fresh ? '<p class="alb-new">🎉 Gambar terbuka!</p>' : ''}<div class="${fresh ? 'alb-reveal' : ''}">${a.svg}</div><h2>${esc(a.name)}</h2><p class="pl">📍 ${esc(a.place)}</p>
      <p>💡 ${esc(a.fact)}</p><button class="mq-btn" data-act="albclose">${fresh ? 'Hore!' : 'Tutup'}</button>`
      : `${puzzleHTML(i, total % PIECES, 'big')}<h2>❓ Gambar misteri</h2><p>Sudah bisa menebak? Nama, tempat, dan fakta serunya terbuka setelah ${PIECES} keping lengkap.</p><button class="mq-btn" data-act="albclose">Tutup</button>`;
    sh.hidden = false;
    if (full) window.SFX.levelUp();
  }
  function viewMyReport() {
    const ses = session.get(); const st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    app.innerHTML = shell(`<a class="back" href="#/belajar">← Kembali</a>${reportHTML(st, 'siswa')}`, { right: `<span class="topr"><a class="help" href="#/panduan/siswa" aria-label="Panduan">❓</a></span>` });
  }

  function skillLink(id, p, sub) {
    const s = SKILLS[id]; const sc = p ? p.score : 0;
    return `<a class="sk" href="#/latihan/${id}"><span class="sk-code">${s.code}</span><span class="sk-name">${s.name}${sub ? `<small>${sub}</small>` : ''}</span>${chip(sc)}</a>`;
  }

  /* ---------- Latihan: satu soal per layar, pilih dulu lalu Periksa; benar, hampir benar, atau salah ---------- */
  let P = null;
  const ROUND = 10; // soal per putaran latihan
  const mmss = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const lessonShell = (pct, quit, diag) => `<div class="mq-top"><button class="mq-ico" data-act="${quit}" aria-label="Keluar">${IC.x}</button>
      <div class="mq-prog" id="mqprog" ${diag ? 'data-diag="1"' : ''}><i id="sbar" style="width:${pct}%"></i></div>
      <button class="mq-ico mq-coretbtn" id="mqcoret" data-act="coret" aria-label="Kertas coret" hidden>✏️</button><button class="mq-ico psound" data-act="sound" aria-label="Suara">${window.SFX.enabled() ? '🔔' : '🔕'}</button></div>
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
  }
  function openCoret() {
    let pad = document.getElementById('coret');
    const b = document.getElementById('mqcoret');
    if (pad && !pad.hidden) return closeCoret(false);
    if (b) b.classList.add('on');
    // Papan angka dilipat selama kertas coret terbuka, supaya kertasnya selebar mungkin; tombol 🔢 memunculkannya lagi
    const foot = document.getElementById('fb');
    if (foot && foot.querySelector('.mq-krow')) { foot.classList.add('cor'); foot.classList.remove('kshow'); }
    // duduk tepat di atas kaki layar (tombol jawaban dan Periksa tetap bisa diketuk)
    const place = () => {
      if (!pad) return;
      if (coretPos) { const w = Math.min(pad.offsetWidth || 520, innerWidth), h = pad.offsetHeight || 300; Object.assign(pad.style, { left: Math.max(0, Math.min(innerWidth - w, coretPos[0])) + 'px', top: Math.max(0, Math.min(innerHeight - 52, coretPos[1])) + 'px', bottom: 'auto', right: 'auto', margin: '0', width: w + 'px', animation: 'none' }); return; }
      const fh = foot ? foot.offsetHeight : 0, vis = document.querySelector('#pq .mq-vis') || document.querySelector('#pq .mq-say');
      pad.style.bottom = fh + 'px';
      const room = vis ? innerHeight - fh - vis.getBoundingClientRect().bottom - 12 : 0;
      pad.style.height = !coretTall && room >= 170 ? Math.min(room, foot && foot.classList.contains('cor') ? 640 : 360) + 'px' : '';
    };
    if (pad) { pad.hidden = false; place(); if (pad.fit) pad.fit(); return; }
    const COLORS = [['#0a7d68', 'hijau'], ['#1c9be8', 'biru'], ['#ff5a5f', 'merah']];
    pad = document.createElement('div'); pad.id = 'coret'; pad.className = 'mq-coret';
    pad.innerHTML = `<div class="bar"><b>✏️<span class="lbl"> Kertas coret</span></b><span class="tools">${COLORS.map(([c, n], i) => `<button data-c="${c}" class="${i ? '' : 'on'}" aria-label="Pensil ${n}"><i style="background:${c}"></i></button>`).join('')}
      <button data-c="erase" aria-label="Penghapus">🧽</button><button data-k="clear" aria-label="Hapus semua coretan">🗑️</button><button data-k="size" aria-label="Perbesar atau perkecil kertas coret">↕</button><button data-k="close" aria-label="Tutup kertas coret">✕</button></span></div>${P && P.q ? `<div class="qcopy">${esc(strip(P.q.log || P.q.text))}</div>` : ''}<canvas aria-label="Kertas coret"></canvas>`;
    if (coretTall) pad.classList.add('tall');
    document.body.appendChild(pad); place();
    const cv = pad.querySelector('canvas'), ctx = cv.getContext('2d');
    let pen = COLORS[0][0], last = null;
    const fit = () => {
      const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, old = cv.width ? cv.toDataURL() : null;
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (old) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, r.width, r.height); im.src = old; }
    };
    fit(); pad.fit = fit;
    const at = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); last = at(e); ctx.beginPath(); ctx.arc(last[0], last[1], pen === 'erase' ? 11 : 1.8, 0, Math.PI * 2); if (pen === 'erase') { ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fill(); ctx.restore(); } else { ctx.fillStyle = pen; ctx.fill(); } });
    cv.addEventListener('pointermove', (e) => {
      if (!last) return; const p = at(e);
      ctx.save(); if (pen === 'erase') ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = pen === 'erase' ? '#000' : pen; ctx.lineWidth = pen === 'erase' ? 22 : 3.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); ctx.restore(); last = p;
    });
    const stop = () => { last = null; };
    cv.addEventListener('pointerup', stop); cv.addEventListener('pointercancel', stop); cv.addEventListener('pointerleave', stop);
    const bar = pad.querySelector('.bar');
    let drag = null;
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
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
      if (t.dataset.k === 'clear') { ctx.clearRect(0, 0, cv.width, cv.height); return; }
      pen = t.dataset.c; pad.querySelectorAll('[data-c]').forEach((x) => x.classList.toggle('on', x === t));
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
    </div></main><div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn" data-act="doaok">${esc(d.tombol || 'Mulai belajar')}</button></div></div>`;
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
    do { q = P.sk.gen(); } while (P.q && strip(q.text + (q.vis || '')) === strip(P.q.text + (P.q.vis || '')) && guard++ < 5);
    P.q = q; P.input = ''; P.sel = -1; P.locked = false; P.qStart = Date.now();
    const canCoret = coretOn(P.sk) || /class="stack/.test(q.vis || '');
    closeCoret(true); { const cb = document.getElementById('mqcoret'); if (cb) cb.hidden = !canCoret; }
    const choice = q.type === 'choice', box = document.getElementById('pq');
    box.innerHTML = `
      <h2 class="mq-title">${choice ? 'Pilih jawaban yang benar' : 'Tulis jawabannya'}</h2>
      ${P.diag && D && D.n === 0 ? '<p class="mq-hint">Tidak apa-apa kalau belum tahu. Tebak saja ya!</p>' : ''}
      <div class="mq-say"><div id="mqm">${MQ.svg('normal', { size: choice ? 92 : 76, enter: false })}</div><div class="mq-bubble"><button class="mq-spk${q.audio ? ' aud' : ''}" data-act="say" aria-label="Dengarkan soal">${IC.spk}</button><span>${q.text}</span></div></div>
      ${q.vis ? `<div class="mq-vis">${q.vis}</div>` : ''}
      ${canCoret ? '<button class="mq-coretcta" data-act="coret">✏️ Kertas coret</button>' : ''}
      ${choice
    ? `<div class="mq-opts ${q.options.every((o) => strip(o).length <= 4) ? 'short' : ''}">${q.options.map((o, i) => `<button class="mq-opt" data-act="choose" data-i="${i}">${o}</button>`).join('')}</div>`
    : `<div class="mq-ans">${q.unit ? `<span class="u">${q.unit}</span>` : ''}<div class="mq-disp" id="indisp">&nbsp;</div></div>`}`;
    // Papan angka dan tombol Periksa menempel di bawah layar, supaya selalu terjangkau tanpa menggulir
    const keys = choice ? '' : `${q.keys ? `<div class="mq-keys extra">${q.keys.map((k) => `<button class="mq-key" data-act="key" data-k="${k}">${k}</button>`).join('')}</div>` : ''}
       <div class="mq-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="mq-key" data-act="key" data-k="${n}">${n}</button>`).join('')}<button class="mq-key del" data-act="key" data-k="del" aria-label="Hapus">⌫</button><button class="mq-key" data-act="key" data-k="0">0</button><span></span></div>`;
    const fb = document.getElementById('fb'); fb.className = 'mq-foot' + (!choice && canCoret ? ' compact' : '');
    const krow = !choice && canCoret ? '<div class="mq-krow"><button class="mq-ktog" data-act="keystog" aria-label="Tampilkan atau sembunyikan tombol angka">🔢 <span class="ka">Tombol angka</span><span class="kb">Sembunyikan</span> <i>▲</i></button><span class="mq-mini">Jawaban: <b id="indisp2">–</b></span></div>' : '';
    fb.innerHTML = `<div class="mq-foot-in">${krow}${keys}<button class="mq-btn" id="mqcheck" data-act="check" disabled>Periksa</button></div>`;
    box.style.paddingBottom = fb.offsetHeight + 20 + 'px';
    const d = document.getElementById('indisp'); if (d) d.style.scrollMarginBottom = fb.offsetHeight + 12 + 'px';
    // Cerita TK dibacakan otomatis saat soal muncul
    if (q.audio) playClips(q.audio, 350); else stopClips();
  }
  function submit(given) {
    if (P.locked) return;
    const q = P.q;
    if (q.type === 'input' && given === '') return toast('Tulis jawabanmu dulu ya');
    // titik ribuan dan spasi diabaikan; tanda minus dan koma desimal dibakukan
    const norm = (x) => String(x).trim().toLowerCase().replace(/[−–]/g, '-').replace(/[.\s]/g, '');
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
    document.getElementById('mqcombo').textContent = P.combo >= 3 ? `BERUNTUN ×${P.combo}` : '';
    document.querySelectorAll('.mq-opt').forEach((b) => { const v = q.options[+b.dataset.i]; b.classList.remove('sel'); if (v === q.answer) b.classList.add('right'); else if (v === given) b.classList.add('wrong'); b.disabled = true; });
    document.querySelectorAll('.mq-key').forEach((b) => { b.disabled = true; });
    const m = document.getElementById('mqm'); m.innerHTML = MQ.svg(ok ? 'happy' : 'oops', { size: 92, enter: false }); m.firstChild.classList.add('mq-react');
    const finished = ok ? myAsg.filter(asgDone) : [];
    if (!adabOn() && prizeBoard(P.sid, P.sk.grade).open > pzBefore) setTimeout(() => toast('🧩 Dapat keping puzzle baru!'), 1200);
    finished.forEach((a) => markDone(a.id, P.sid, 'siswa'));
    const fb = document.getElementById('fb'), pq = document.getElementById('pq');
    const how = `<details class="mq-how" open><summary>💡 Lihat caranya</summary><div class="explain">${q.explain}<p>${LESSONS[P.sk.unit] ? `<button class="link" data-act="lopen" data-u="${P.sk.unit}">📖 Belum paham? Buka materi</button>` : ''}${window.METIQ_ANIM.has(P.sk.unit) ? ` · <button class="link small" data-act="anim" data-u="${P.sk.unit}">🎬 Tonton animasi</button>` : ''}</p><div class="anim-inline"></div></div></details>`;
    if (ok) {
      let note = '';
      if (P.score >= 100 && before < 100) { window.SFX.mastered(); note = '🏆 Tuntas! Luar biasa!'; }
      else if (TASKS_ON && finished.length) { window.SFX.task(); note = `📌 Tugas selesai: ${esc(finished[0].note || 'Tugas dari guru')}`; }
      else if (P.score >= 80 && before < 80) { window.SFX.levelUp(); note = '⭐ Naik ke tingkat Mahir! Langkah berikutnya terbuka.'; }
      else window.SFX.correct();
      const praise = adabOn() && (IMAN._adab || {}).pujian ? IMAN._adab.pujian : ['Hebat!', 'Pintar!', 'Benar sekali!', 'Mantap!', 'Keren!'];
      fb.className = 'mq-foot ok';
      fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${IC.ok}</span>${praise[Math.floor(Math.random() * praise.length)]}</div>${note ? `<div class="mq-fbody"><p>${note}</p></div>` : ''}<button class="mq-btn" data-act="next">Lanjutkan</button></div>`;
    } else if (near) {
      window.SFX.wrong();
      fb.className = 'mq-foot near';
      fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">!</span>Nyaris!</div><div class="mq-fbody"><p>${tag === 'meleset-satu' ? 'Hampir benar, selisihnya cuma 1. Hitung sekali lagi dengan teliti ya.' : 'Hampir benar, angkanya tertukar tempat. Cek puluhan dan satuannya.'}</p><p>Jawabanmu: <b class="strike">${esc(strip(given))}</b></p><p>Jawaban yang benar:</p><div class="mq-corr">${q.answer}</div>${how}</div><button class="mq-btn warn" data-act="next">Lanjutkan</button></div>`;
    } else {
      window.SFX.wrong();
      fb.className = 'mq-foot no';
      fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${IC.x}</span>Belum tepat</div><div class="mq-fbody"><p>Jawabanmu: <b class="strike">${esc(strip(given))}</b></p><p>Jawaban yang benar:</p><div class="mq-corr">${q.answer}</div>${how}</div><button class="mq-btn bad" data-act="next">Lanjutkan</button></div>`;
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
    [/penjumlahan dan pengurangan/i, '+−', '#19b796', 's'], [/penjumlahan/i, '+', '#ff7a45'], [/pengurangan/i, '−', '#3b9cff'],
    [/perkalian dan pembagian/i, '×÷', '#9b6bff', 's'], [/perkalian|mengalikan/i, '×', '#9b6bff'], [/pembagian|membagi/i, '÷', '#ff5f9a'],
    [/desimal/i, '0,5', '#00a6a6', 's'], [/pecahan/i, '½', '#ff9f1c'], [/persen/i, '%', '#ef476f'], [/rasio/i, '1:2', '#2ec4b6', 's'],
    [/bilangan bulat/i, '−3', '#5c7cfa', 's'], [/pangkat dan akar/i, '√', '#7048e8'], [/pangkat sepuluh/i, '10ⁿ', '#7048e8', 's'],
    [/aljabar|ekspresi/i, 'x', '#e8590c'], [/persamaan|kesamaan/i, '=', '#e8590c'], [/^bilangan/i, '123', '#19b796', 's'],
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
    if (state === 'locked') return '<div class="mq-pop lock" style="--ax:50%"><b>🔒 Ujian bab terkunci</b><small>Selesaikan semua langkah di bab ini dulu</small><button class="mq-btn" data-act="tocur">Ke langkahku</button></div>';
    if (state === 'open') return `<div class="mq-pop" style="--ax:50%"><b>Peti sudah terbuka!</b><small>Nilai terbaik ${t.best}% · ${t.stars} ⭐</small><a class="mq-btn" href="#/ujian/${u.id}">Coba lagi</a></div>`;
    return `<div class="mq-pop" style="--ax:50%"><b>Ujian Bab ${u.id}: ${esc(u.name)}</b><small>${TEST_N} soal · nilai 60 untuk membuka peti</small><a class="mq-btn" href="#/ujian/${u.id}">Mulai ujian</a></div>`;
  }

  function viewTest(uid) {
    const ses = session.get(), st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const u = UNITS.find((x) => x.id === uid); if (!u) return go('#/belajar');
    if (chestStateOf(st.id, u) === 'locked') { toast('Selesaikan semua langkah di bab ini dulu ya'); return go('#/belajar'); }
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
        <h1 class="mq-rtitle ${pass ? 't' : ''}">${pass ? 'Peti terbuka!' : fast ? 'Terlalu cepat!' : 'Hampir berhasil!'}</h1>
        <p class="mq-rsub">Ujian Bab ${u.id} · ${esc(u.name)}</p>
        <div class="mq-stats3"><div class="mq-stat" style="--c:#e0a800"><small>Nilai</small><b>${pctv}%</b></div><div class="mq-stat" style="--c:#19b796"><small>Bintang</small><b>${gain ? `+${gain}` : '–'}</b></div><div class="mq-stat" style="--c:#1c9be8"><small>Waktu</small><b>${mmss(Date.now() - P.start)}</b></div></div>
        ${pass && !wasOpen ? `<div class="mq-unlock mq-medal"><span class="mq-medal-i">${chLogo(u)}</span> Lencana Bab ${u.id} kamu dapatkan!</div>` : ''}
        ${pass && wasOpen && !gain ? '<div class="mq-unlock">Bintang peti ini sudah kamu dapat. Coba nilai lebih tinggi untuk bintang tambahan!</div>' : ''}
        ${!pass ? `<div class="mq-unlock" style="background:#fff3c4;color:#8a5a00">${fast ? 'Baca soalnya pelan-pelan, lalu coba lagi.' : 'Butuh nilai 60 untuk membuka peti. Latih lagi lalu coba ujian lagi!'}</div>` : ''}
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in">${pass ? '<a class="mq-btn pulse" href="#/belajar">Lanjutkan</a><button class="mq-btn ghost" data-act="testagain" data-u="' + u.id + '">Ulangi ujian</button>' : '<button class="mq-btn pulse" data-act="testagain" data-u="' + u.id + '">Coba lagi</button><a class="mq-btn ghost" href="#/belajar">Kembali ke peta</a>'}</div></div>`;
  }

  // Layar akhir satu putaran latihan: bintang, tiga kartu (skor, tepat, waktu), dan satu tombol utama yang menyesuaikan
  function renderRound() {
    clearInterval(timer);
    const sk = P.sk, mastered = P.score >= 100, acc = pct(P.correct, P.count), delta = P.score - P.score0, up = P.score >= 80 && P.score0 < 80;
    const avg = P.msSum / Math.max(1, P.count);
    let want = acc >= 100 ? 3 : acc >= 80 ? 2 : acc >= 60 ? 1 : 0, why = '';
    if (P.score0 >= 100) { want = 0; why = 'Sudah tuntas, jadi latihan ini tanpa bintang.'; }
    else if (avg < MIN_AVG_MS) { want = 0; why = 'Terlalu cepat! Baca soalnya pelan-pelan ya.'; }
    const r = want ? S.addStars(P.sid, want, STAR_CAP) : { given: 0, key: null, entry: null };
    if (want && !r.given) why = `Batas ${STAR_CAP} bintang hari ini sudah tercapai. Lanjut lagi besok ya!`;
    if (r.entry && cloudOn()) Cloud.queueProgress(P.sid, session.get().code, r.key, r.entry);
    if (STARS_SRV && cloudOn()) Cloud.queueClaim(P.sid, session.get().code, { id: P.rid, kind: 'practice', s0: P.score0, d: S.todayKey(), n: P.count });
    const needMore = P.score < 80;
    app.innerHTML = `<main class="mq-screen"><div class="mq-result">${MQ.svg(acc >= 60 || mastered ? 'cheer' : 'happy', { size: 150 })}
        <div class="mq-starrow">${[1, 2, 3].map((i) => `<span class="mq-bigstar ${i <= r.given ? 'on' : ''}" style="--d:${0.5 + i * 0.25}s">★</span>`).join('')}</div>
        <h1 class="mq-rtitle">${mastered ? 'Tuntas! Luar biasa!' : acc >= 70 ? 'Latihan selesai!' : 'Terus berlatih ya!'}</h1><p class="mq-rsub">${esc(sk.name)}${r.given ? ` · +${r.given} ⭐` : ''}</p>
        <div class="mq-stats3"><div class="mq-stat" style="--c:#e0a800"><small>Skor</small><b>${P.score}${delta ? `<em>${delta > 0 ? '+' : ''}${delta}</em>` : ''}</b></div><div class="mq-stat" style="--c:#19b796"><small>Tepat</small><b>${acc}%</b></div><div class="mq-stat" style="--c:#1c9be8"><small>Waktu</small><b>${mmss(Date.now() - P.start)}</b></div></div>
        ${why ? `<div class="mq-unlock" style="background:#fff3c4;color:#8a5a00">${why}</div>` : ''}
        ${up ? '<div class="mq-unlock">🔓 Langkah berikutnya terbuka!</div>' : needMore && !why ? '<div class="mq-unlock" style="background:#fff3c4;color:#8a5a00">Capai skor 80 untuk naik ke Mahir ⭐</div>' : ''}
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in">${needMore
    ? '<button class="mq-btn pulse" data-act="again">Latihan lagi</button><a class="mq-btn ghost" href="#/belajar">Kembali ke peta</a>'
    : '<a class="mq-btn pulse" href="#/belajar">Lanjutkan</a><button class="mq-btn ghost" data-act="again">Latihan lagi</button>'}</div></div>`;
  }
  function renderMastered() {
    const u = UNITS.find((x) => x.id === P.sk.unit);
    const nextSk = u && u.skills[u.skills.findIndex((s) => s.id === P.sk.id) + 1];
    app.innerHTML = `<main class="mq-screen"><div class="mq-result">${MQ.svg('cheer', { size: 180 })}<h1 class="mq-rtitle">Kamu sudah tuntas!</h1><p class="mq-rsub">${esc(P.sk.name)}</p></div></main>
      <div class="mq-foot"><div class="mq-foot-in">${nextSk ? `<a class="mq-btn pulse" href="#/latihan/${nextSk.id}">Lanjut: ${esc(nextSk.name)}</a><a class="mq-btn ghost" href="#/belajar">Kembali ke peta</a>` : '<a class="mq-btn pulse" href="#/belajar">Kembali ke peta</a>'}<button class="mq-link" data-act="again">Latihan lagi</button></div></div>`;
  }

  /* ---------- Guru ---------- */
  function viewTeacherAuthCloud(mode) {
    const reg = mode === 'daftar';
    app.innerHTML = shell(`
      <a class="back" href="#/">← Kembali</a>
      <p class="trynote center small"><button class="link" data-act="trydemo" data-r="guru">🧪 Coba dulu sebagai guru contoh (tanpa daftar) →</button></p>
      <section class="card narrow">
        <div class="bigemoji center">👩‍🏫</div>
        ${reg ? `<h1 class="center">Daftar guru gratis</h1><p class="center muted small">Langsung aktif, tanpa menunggu persetujuan. Semua alat kelas gratis untuk guru.</p>
          <form data-form="register" class="form">
            <label>Nama guru<input name="name" required placeholder="mis. Bu Rina" autocomplete="name"></label>
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <label>Kata sandi (min. 6 karakter)<input name="pass" type="password" minlength="6" required autocomplete="new-password"></label>
            <label>Nama kelas pertama<input name="cls" required placeholder="mis. Kelas 1A, atau Les Matematika Sore"></label>
            <details class="small"><summary>Punya kode admin Metiq?</summary><label>Kode admin<input name="admin" autocomplete="off" autocapitalize="characters"></label></details>
            <button class="btn">Buat akun gratis</button>
          </form><p class="center"><a href="#/guru/masuk">Sudah punya akun? Masuk</a></p>
          <p class="center small muted">Untuk sekolah dengan banyak kelas: <a href="#/harga">lihat paket Sekolah</a>. Admin sekolah yang memasukkan guru ke sekolahnya.</p>`
        : `<h1 class="center">Masuk guru</h1>
          <form data-form="login" class="form">
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <label>Kata sandi<input name="pass" type="password" required autocomplete="current-password"></label>
            <button class="btn">Masuk</button>
          </form><p class="center"><a href="#/guru/daftar">Belum punya akun? Daftar gratis</a> · <a href="#/harga">Paket Sekolah</a></p>`}
        <p class="muted small center">Data kelas tersimpan aman di server dan bisa dibuka dari HP mana pun.</p>
      </section>`);
  }
  function viewTeacherAuth(mode) {
    if (cloudOn()) return viewTeacherAuthCloud(mode);
    const ts = S.db.teachers;
    const reg = mode === 'daftar' || !ts.length;
    app.innerHTML = shell(`
      <a class="back" href="#/">← Kembali</a>
      <section class="card narrow">
        <div class="bigemoji center">👩‍🏫</div>
        ${reg ? `<h1 class="center">Daftar sebagai guru</h1>
          <form data-form="register" class="form">
            <label>Nama guru<input name="name" required placeholder="mis. Bu Rina"></label>
            <label>Nama kelas<input name="cls" required placeholder="mis. Kelas 1A"></label>
            <label>PIN (4–6 angka)<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,6}" required></label>
            <button class="btn">Buat akun</button>
          </form>${ts.length ? '<p class="center"><a href="#/guru">Sudah punya akun? Masuk</a></p>' : ''}`
        : `<h1 class="center">Masuk guru</h1>
          <form data-form="login" class="form">
            <label>Nama guru<select name="id">${ts.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label>
            <label>PIN<input name="pin" type="password" inputmode="numeric" required></label>
            <button class="btn">Masuk</button>
          </form><p class="center"><a href="#/guru/daftar">Daftar guru baru</a></p>`}
        <p class="muted small center">Data tersimpan di perangkat ini.</p>
      </section>`);
  }
  function teacherCtx() {
    const ses = session.get(); const t = ses.role === 'guru' && S.teacher(ses.id);
    if (!t) return null;
    // Di mode server, daftar kelas sudah disaring oleh server (admin melihat semua kelas)
    let classes = cloudOn() || t.isAdmin ? S.db.classes.slice() : S.classesOf(t.id);
    if (!cloudOn()) classes = classes.map((c) => Object.assign({ teacherName: (S.teacher(c.teacherId) || {}).name }, c));
    if (!classes.length) { if (cloudOn()) return null; classes = [S.createClass(t.id, 'Kelas 1')]; }
    const c = classes.find((x) => x.id === ses.classId) || classes[0];
    return { t, c, classes, kids: S.studentsOf(c.id) };
  }
  // Empat tab utama berbahasa sehari-hari. Halaman lain menjadi pil di dalam tab induknya, jadi semua halaman
  // terjangkau dalam dua ketukan tanpa menu tersembunyi. Pengaturan kelas ada di tombol ⚙️ di kepala halaman.
  const TAB_GROUPS = [
    ['hari', '🏠 Hari ini', [['ringkasan', 'Hari ini']]],
    ['siswa', '🧒 Siswa', [['siswa', 'Daftar siswa'], ['kelompok', 'Kelompok level'], ['peta', 'Peta kemajuan']]],
    ['tugas', '📌 Tugas', [['tugas', 'Tugas']]],
    ['laporan', '📈 Laporan', [['semua', 'Semua kemajuan'], ['analitik', 'Analitik'], ['keterampilan', 'Keterampilan'], ['peringkat', 'Peringkat'], ['referensi', 'Referensi']]],
  ];
  const groupOf = (tab) => TAB_GROUPS.find((g) => g[2].some(([k]) => k === tab));
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
    if (row && n) row.outerHTML = todoRow('🧺', `${n} siswa belum punya kelas`, 'Anak yang mulai belajar sendiri. Masukkan ke kelas yang sesuai.', '<a class="btn sm" href="#/guru/tanpa">Masukkan ke kelas</a>', 'warn');
  }
  function teacherShell(ctx, tab, inner) {
    const admin = [...(ctx.t.isAdmin && cloudOn() && !session.get().demo ? [['tanpa', '🧺 Tanpa kelas']] : []), ...(ctx.t.isAdmin || ctx.t.isSchoolAdmin ? [['sekolah', '🏫 Sekolah']] : []), ...(ctx.t.isAdmin && !session.get().demo ? [['super', '🌐 Super admin']] : [])];
    const grp = groupOf(tab);
    app.innerHTML = shell(`
      <section class="dhead">
        <div class="dh-row"><a class="av avedit" href="#/avatar/guru" aria-label="Ganti avatar">${avHTML(ctx.t.avatar || 'svg:ustadzah')}<i>✏️</i></a>
          <div class="dh-text"><div class="dh-who">${esc(ctx.t.name)}${ctx.t.isAdmin ? ' <span class="pill">Super admin</span>' : ctx.t.isSchoolAdmin ? ' <span class="pill">Admin sekolah</span>' : ''}${ctx.t.schoolName ? ` <span class="muted small">· ${esc(ctx.t.schoolName)}</span>` : ''}</div>
            ${ctx.classes.length > 1 ? `<select class="dh-title" data-act="switchclass" aria-label="Pilih kelas">${ctx.classes.map((c) => `<option value="${c.id}" ${c.id === ctx.c.id ? 'selected' : ''}>${esc(c.name)}${(ctx.t.isAdmin || ctx.t.isSchoolAdmin) && c.teacherName ? ` · ${esc(c.teacherName)}` : ''}</option>`).join('')}</select>` : `<h1>${esc(ctx.c.name)}</h1>`}
            ${ctx.c.teacherName && ctx.c.teacherId !== ctx.t.id ? `<div class="dh-meta">Guru kelas: ${esc(ctx.c.teacherName)}</div>` : ''}</div>
          <a class="dh-gear ${tab === 'kelola' ? 'on' : ''}" href="#/guru/kelola" aria-label="Pengaturan kelas">⚙️<small>Kelas</small></a>
          <button class="dh-code" data-act="shareclass" aria-label="Bagikan kode kelas"><small>Kode kelas</small><b>${ctx.c.code}</b><small>📤 bagikan</small></button></div>
      </section>
      <div class="tabbar"><nav class="tabs tmain">${TAB_GROUPS.map(([id, label, pages]) => `<a href="#/guru/${pages[0][0]}" class="${grp && grp[0] === id ? 'on' : ''}">${label}</a>`).join('')}${admin.length ? `<span class="tsep" aria-hidden="true"></span>${admin.map(([k, l]) => `<a href="#/guru/${k}" class="adm ${k === tab ? 'on' : ''}">${l}${k === 'tanpa' ? '<span class="tcount" data-ungc hidden></span>' : ''}</a>`).join('')}` : ''}</nav></div>
      ${grp && grp[2].length > 1 ? `<nav class="tsub" aria-label="Bagian ${grp[1]}">${grp[2].map(([k, l]) => `<a href="#/guru/${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</nav>` : ''}
      ${session.get().demo && tab === 'ringkasan' ? realTeacherCard() : ''}
      ${inner}`, { cls: 'wide', right: topRight() });
    loadUngCount(ctx);
  }

  function emptyKids(ctx) {
    return `<section class="card center"><div class="bigemoji">🧑‍🤝‍🧑</div><h2>Belum ada siswa di kelas ini</h2><p class="muted">Halaman ini terisi setelah ada siswa yang belajar.</p><a class="btn" href="#/guru/siswa">➕ Tambah siswa</a></section>`;
  }
  // Satu baris "yang perlu dilakukan": ikon, kalimat, keterangan, satu tombol
  const todoRow = (ic, text, sub, btn, tone) => `<div class="todo ${tone || ''}"><span class="tic">${ic}</span><span class="grow"><b>${text}</b>${sub ? `<small>${sub}</small>` : ''}</span>${btn || ''}</div>`;
  // Tiga cara menambah siswa, dari yang paling sering: anak yang sudah belajar sendiri (mayoritas) memakai kode belajarnya
  function addKidsHTML(ctx, open) {
    return `<details class="card addkids" id="addkids" ${open ? 'open' : ''}><summary><b>➕ Tambah siswa</b><small>Pilih salah satu dari 3 cara</small></summary>
      <div class="addways">
        <section class="way"><span class="wn">1</span><h3>Anak sudah belajar di Metiq?</h3><p>Minta <b>kode belajar</b> (6 huruf) dari anak atau orang tuanya. Kodenya ada di halaman <b>Aku</b> di HP anak. Riwayat belajarnya ikut masuk.</p>
          <form data-form="addbycode" class="form inline"><input name="code" maxlength="6" placeholder="Kode belajar" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Kode belajar anak" required><button class="btn">Tambahkan</button></form></section>
        <section class="way"><span class="wn">2</span><h3>Anak belum punya akun?</h3><p>Ketik namanya. Untuk banyak anak, pisahkan dengan koma.</p>
          <form data-form="addkid" class="form inline"><input name="name" placeholder="mis. Aisyah, Umar" aria-label="Nama siswa" required><button class="btn">Tambah</button></form></section>
        <section class="way"><span class="wn">3</span><h3>Biar anak bergabung sendiri</h3><p>Kirim kode kelas <b class="code">${ctx.c.code}</b> ke grup WhatsApp. Anak membuka Metiq → <b>Aku → Pengaturan → Metiq untuk Sekolah → Gabung kelas</b>.</p>
          <button class="btn sm" data-act="shareclass">📤 Kirim kode kelas</button></section>
      </div></details>`;
  }
  // Daftar siswa: status jelas dalam kata-kata, kode orang tua bisa langsung dikirim
  function rosterHTML(ctx) {
    const rows = ctx.kids.map((k) => ({ k, s: stats(k.id), w: stats(k.id, 7) })).map((r) => Object.assign(r, { need: (r.w.answered >= 10 && r.w.acc < 65) || (r.s.answered > 0 && r.w.answered === 0) || r.s.answered === 0 }))
      .sort((a, b) => b.need - a.need || a.k.name.localeCompare(b.k.name));
    const status = (r) => (r.s.answered === 0 ? '<span class="st0">Belum mulai</span>' : r.w.answered === 0 ? '<span class="st1">Tidak aktif 7 hari</span>' : r.w.answered >= 10 && r.w.acc < 65 ? '<span class="st1">Perlu bantuan</span>' : '<span class="st2">Aktif</span>');
    return `<section class="card"><div class="rhead"><h2>Daftar siswa <span class="pill">${ctx.kids.length}</span></h2><span class="grow"></span><button class="btn ghost sm" data-act="print">🖨️ Cetak kartu kode</button></div>
      <p class="small muted">Yang perlu perhatian ada di atas. Ketuk nama untuk melihat laporan dan memberi tugas khusus.</p>
      <div class="tscroll"><table class="tbl roster"><thead><tr><th>Siswa</th><th>Keadaan</th><th>Soal (7 hari)</th><th>Ketepatan</th><th>Mahir</th><th>Kode orang tua</th><th></th></tr></thead><tbody>
      ${rows.map((r) => `<tr data-href="#/guru/siswa/${r.k.id}"><td><span class="av sm">${avHTML(r.k.avatar)}</span> <a href="#/guru/siswa/${r.k.id}">${esc(r.k.name)}</a></td><td>${status(r)}</td><td>${r.w.answered}</td><td><span class="accb ${r.w.acc >= 80 ? 'g' : r.w.acc >= 60 ? 'y' : 'r'}">${r.w.answered ? r.w.acc + '%' : '–'}</span></td><td>${r.s.proficient}</td>
        <td class="nowrap"><b class="code">${r.k.parentCode || '–'}</b> <button class="link small" data-act="shareparent" data-id="${r.k.id}" aria-label="Kirim kode orang tua ${esc(r.k.name)}">📤</button>${(r.k.parents || []).length || S.viewsOf(r.k.id).length ? ' <span title="Orang tua sudah terhubung">✅</span>' : ''}</td>
        <td class="r"><button class="link small danger" data-act="rmkid" data-id="${r.k.id}" aria-label="Keluarkan ${esc(r.k.name)}">Keluarkan</button></td></tr>`).join('')}
      </tbody></table></div></section>
      <div class="printcards">${ctx.kids.map((k) => `<div class="pcard"><div class="av">${avHTML(k.avatar)}</div><b>${esc(k.name)}</b><div>Kode kelas: <b>${ctx.c.code}</b></div><div>Kode orang tua: <b>${k.parentCode}</b></div><small>metiq · ${esc(ctx.c.name)}</small></div>`).join('')}</div>`;
  }
  // "Hari ini": daftar hal yang perlu dilakukan guru, urut dari yang paling penting; satu tombol per baris
  function todayHTML(ctx) {
    const kids = ctx.kids, rows = [];
    if (ctx.t.isAdmin && cloudOn() && !session.get().demo) rows.push('<div id="todo-ung"></div>');
    if (!kids.length) {
      rows.push(todoRow('🧒', 'Kelas ini belum punya siswa', 'Tambahkan dengan kode belajar anak, nama, atau minta anak bergabung sendiri.', '<a class="btn sm" href="#/guru/siswa">Tambah siswa</a>', 'warn'));
      return `<section class="card todos"><h2>Yang perlu dilakukan</h2>${rows.join('')}</section>${addKidsHTML(ctx, true)}`;
    }
    const ids = new Set(kids.map((k) => k.id));
    const fresh = S.db.done.filter((d) => ids.has(d.sid) && d.at > Date.now() - 3 * DAY);
    const week = kids.map((k) => ({ k, w: stats(k.id, 7), all: stats(k.id) }));
    const never = week.filter((x) => x.all.answered === 0), idle = week.filter((x) => x.all.answered > 0 && x.w.answered === 0), weak = week.filter((x) => x.w.answered >= 10 && x.w.acc < 65);
    const asgWeek = S.assignmentsOf(ctx.c.id).filter((a) => (a.createdAt || 0) > Date.now() - 7 * DAY);
    const noParent = kids.filter((k) => !(k.parents || []).length && !S.viewsOf(k.id).length);
    const names = (list) => list.slice(0, 3).map((x) => esc((x.k || x).name)).join(', ') + (list.length > 3 ? `, dan ${list.length - 3} lainnya` : '');
    if (fresh.length) rows.push(todoRow('📥', `${fresh.length} tugas baru dikumpulkan`, 'Lihat hasilnya dan beri tanggapan.', '<a class="btn sm" href="#/notifikasi">Lihat</a>', 'good'));
    if (weak.length) rows.push(todoRow('🆘', `${weak.length} siswa perlu bantuan`, `Ketepatan di bawah 65% minggu ini: ${names(weak)}.`, '<a class="btn sm" href="#/guru/siswa">Lihat siswa</a>', 'warn'));
    if (never.length) rows.push(todoRow('📱', `${never.length} siswa belum pernah masuk`, names(never), '<button class="btn sm" data-act="shareclass">Kirim kode kelas</button>'));
    if (idle.length) rows.push(todoRow('😴', `${idle.length} siswa tidak berlatih 7 hari`, names(idle), '<a class="btn sm ghost" href="#/guru/siswa">Lihat siswa</a>'));
    if (!asgWeek.length) rows.push(todoRow('📌', 'Belum ada tugas minggu ini', 'Pilih keterampilan, Metiq menyarankan sesuai level setiap kelompok.', '<button class="btn sm" data-act="gotoform">Beri tugas</button>'));
    if (noParent.length) rows.push(todoRow('👨‍👩‍👧', `${noParent.length} orang tua belum terhubung`, 'Kirim kode orang tua lewat tombol 📤 di daftar siswa.', '<a class="btn sm ghost" href="#/guru/siswa">Kirim kode</a>'));
    if (rows.length <= 1) rows.push(todoRow('✅', 'Semua beres hari ini', 'Tidak ada yang mendesak. Lihat Laporan untuk detail kelas.', '<a class="btn sm ghost" href="#/guru/analitik">Laporan</a>', 'good'));
    return `<section class="card todos"><h2>Yang perlu dilakukan</h2>${rows.join('')}</section>`;
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
    return `<section class="card"><h2>🏆 Peringkat bintang</h2>
      <p class="small muted">Bintang didapat dari latihan, ujian bab, dan permainan. Latihan yang sudah tuntas, jawaban asal cepat, dan lebih dari ${STAR_CAP} bintang per hari tidak dihitung.</p>
      <div class="vzpills">${pill('rkp', 'rkp', 'pekan', 'Pekan ini')}${pill('rkp', 'rkp', 'bulan', 'Bulan ini')}${pill('rkp', 'rkp', 'semua', 'Semua')}</div>
      ${admin ? `<div class="vzpills">${pill('rks', 'rks', 'kelas', 'Kelas ini')}${pill('rks', 'rks', 'semua', 'Semua kelas')}</div>` : ''}
      <div class="tscroll"><table class="tbl"><thead><tr><th>#</th><th>Siswa</th><th>⭐ Bintang</th><th>Soal</th><th>Tepat</th><th>Waktu</th><th>Hari aktif</th><th>🏅 Bab</th></tr></thead><tbody>
      ${rows.map((r, i) => `<tr><td>${stars3(i, r.stars)}</td><td><span class="av sm">${avHTML(r.k.avatar)}</span> <a href="#/guru/siswa/${r.k.id}">${esc(r.k.name)}</a>${wide ? `<small class="muted"> · ${esc(r.cls)}</small>` : ''}${r.sus ? ' <span class="pill" title="Bintang jauh lebih banyak daripada soal yang dijawab. Periksa dulu.">⚠️ periksa</span>' : ''}</td><td><b>${r.stars}</b></td><td>${r.n}</td><td>${r.n ? r.acc + '%' : '–'}</td><td>${fmtTime(r.ms)}</td><td>${r.days}</td><td>${r.chests}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="row-btn left"><button class="btn sm" data-act="rkcsv">Unduh CSV</button></div></section>
      <section class="card"><h2>Catatan untuk pemberian hadiah</h2><ul class="small">
        <li><b>⚠️ periksa</b> muncul jika bintang jauh lebih banyak daripada soal yang dijawab. Lihat dulu riwayat siswa sebelum memutuskan.</li>
        <li>Bintang dihitung dari data di perangkat siswa. Untuk hadiah besar seperti beasiswa, cocokkan juga dengan kolom Soal, Tepat, dan Waktu.</li>
        <li>Membandingkan siswa yang berbeda kelas kurang adil. Sebaiknya tentukan pemenang per kelas, atau per jenjang.</li></ul></section>`;
  }
  const stars3 = (i, n) => (n > 0 && i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1);
  function exportRanking(ctx) {
    const { rows, per } = rankRows(ctx);
    downloadCSV(`peringkat-bintang-${per}-${isoDay(Date.now())}.csv`, [['peringkat', 'nama', 'kelas', 'bintang', 'soal_dijawab', 'tepat_persen', 'menit_belajar', 'hari_aktif', 'bab_selesai', 'periksa'],
      ...rows.map((r, i) => [i + 1, r.k.name, r.cls, r.stars, r.n, r.n ? r.acc : '', Math.round(r.ms / 60000), r.days, r.chests, r.sus ? 'ya' : ''])]);
  }


  // Laporan "Semua kemajuan": baris bab (jumlah keterampilan mahir/total) dan keterampilan (SmartScore), kolom siswa
  function allProgressHTML(ctx) {
    const one = ss.get('apStu', ''), kids = one ? ctx.kids.filter((k) => k.id === one) : ctx.kids, units = curUnits();
    const P = Object.fromEntries(kids.map((k) => [k.id, S.progressAll(k.id)]));
    const cell = (k, sid) => { const p = P[k.id][sid]; return p && p.att ? `<td class="apc ${p.score >= 80 ? 'g' : 'o'}">${p.score}%</td>` : '<td class="apc"></td>'; };
    const unitCell = (k, u) => { const n = u.skills.filter((sk) => (P[k.id][sk.id] || {}).score >= 80).length, tried = u.skills.some((sk) => (P[k.id][sk.id] || {}).att); return `<td class="apu ${tried ? '' : 'muted'}">${n}/${u.skills.length}</td>`; };
    return `<section class="card"><div class="rhead"><h2>Semua kemajuan</h2><span class="grow"></span>
        <select data-act="apstu" aria-label="Siswa"><option value="">Siswa: semua</option>${ctx.kids.map((k) => `<option value="${k.id}" ${k.id === one ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select>
        <button class="btn ghost sm" data-act="apcsv">⬇️ Unduh CSV</button></div>
      ${gradeTabs()}
      <p class="small muted">Baris bab: banyak keterampilan yang sudah mahir (SmartScore 80+) dari seluruh keterampilan bab itu. Baris keterampilan: SmartScore, <span class="apc g">hijau</span> = mahir, <span class="apc o">jingga</span> = sedang belajar, kosong = belum dicoba.</p>
      <div class="tscroll apwrap"><table class="tbl allprog"><thead><tr><th>${esc(gname(getGrade()))}</th>${kids.map((k) => `<th><a href="#/guru/siswa/${k.id}">${esc(k.name.split(' ')[0])}</a></th>`).join('')}</tr></thead><tbody>
        ${units.map((u) => `<tr class="apunit"><th><a href="${LESSONS[u.id] ? '#/pelajaran/' + u.id : '#/kurikulum'}">${u.icon} ${esc(u.name)}</a></th>${kids.map((k) => unitCell(k, u)).join('')}</tr>
          ${u.skills.map((sk) => `<tr><th class="apsk">${sk.code} ${esc(sk.name)}</th>${kids.map((k) => cell(k, sk.id)).join('')}</tr>`).join('')}`).join('')}
      </tbody></table></div></section>`;
  }
  function exportAllProgress(ctx) {
    const one = ss.get('apStu', ''), kids = one ? ctx.kids.filter((k) => k.id === one) : ctx.kids;
    const rows = [['bab', 'kode', 'keterampilan', ...kids.map((k) => k.name)]];
    curUnits().forEach((u) => u.skills.forEach((sk) => rows.push([u.name, sk.code, sk.name, ...kids.map((k) => { const p = S.progress(k.id, sk.id); return p.att ? p.score : ''; })])));
    downloadCSV(`semua-kemajuan-${gname(getGrade()).toLowerCase().replace(/\s+/g, '-')}-${isoDay(Date.now())}.csv`, rows);
  }
  function viewTeacher(tab, arg) {
    const ctx = teacherCtx(); if (!ctx) return go('#/guru/masuk');
    const { kids } = ctx;
    if (tab === 'siswa' && arg) return viewTeacherStudent(ctx, arg);
    if (tab === 'kelola') return teacherShell(ctx, tab, manageHTML(ctx));
    if (tab === 'referensi') return teacherShell(ctx, tab, referenceHTML());
    if (tab === 'tanpa') { if (!ctx.t.isAdmin || !cloudOn() || session.get().demo) return go('#/guru/ringkasan'); teacherShell(ctx, tab, `<div id="ung-box">${loadingHTML}</div>`); if (arg) loadStudentReport(ctx, arg); else loadUngrouped(ctx); return; }
    if (tab === 'peringkat') return teacherShell(ctx, tab, rankingHTML(ctx));
    if (tab === 'sekolah') { if (!ctx.t.isAdmin && !ctx.t.isSchoolAdmin) return go('#/guru/ringkasan'); teacherShell(ctx, tab, schoolHTML(ctx, arg)); if (arg === 'coba') loadTrialStats(); if (arg === 'kelolaguru') loadSchoolTeachers(); return; }
    if (tab === 'super') { if (!ctx.t.isAdmin || session.get().demo) return go('#/guru/ringkasan'); teacherShell(ctx, tab, `<div id="super-box">${loadingHTML}</div>`); loadSuper(ctx, arg); return; }
    if (tab === 'tugas') return teacherShell(ctx, tab, tasksHTML(ctx));
    if (tab === 'siswa') return teacherShell(ctx, tab, addKidsHTML(ctx, !kids.length) + (kids.length ? rosterHTML(ctx) : ''));
    if (tab === 'ringkasan' && !kids.length) return teacherShell(ctx, tab, todayHTML(ctx));
    if (!kids.length) return teacherShell(ctx, tab, emptyKids(ctx));
    if (tab === 'kelompok') return teacherShell(ctx, tab, groupsHTML(ctx));
    if (tab === 'analitik') return teacherShell(ctx, tab, analyticsHTML(ctx, arg));
    if (tab === 'semua') return teacherShell(ctx, tab, allProgressHTML(ctx));

    if (tab === 'ringkasan') {
      const all = kids.map((k) => ({ k, s: stats(k.id, 7), all: stats(k.id) }));
      const answered = all.reduce((a, x) => a + x.s.answered, 0), correct = all.reduce((a, x) => a + x.s.correct, 0);
      const active = all.filter((x) => x.s.answered > 0).length;
      const attention = all.filter((x) => (x.s.answered >= 10 && x.s.acc < 65) || x.s.answered === 0);
      const agg = classSkillAgg(kids);
      const hard = Object.entries(agg).filter(([, a]) => a.att >= 15).map(([id, a]) => ({ id, acc: pct(a.ok, a.att), n: a.n })).sort((a, b) => a.acc - b.acc).slice(0, 5);
      const tags = tagCounts(kids.flatMap((k) => S.answersOf(k.id).filter((a) => a.ts > Date.now() - 14 * DAY))).filter(([t]) => t !== 'konsep').slice(0, 4);
      const stars = all.slice().sort((a, b) => b.s.correct - a.s.correct).slice(0, 3).filter((x) => x.s.correct > 0);
      return teacherShell(ctx, tab, `${todayHTML(ctx)}
        <div class="kpis"><div class="kpi"><small>Siswa aktif (7 hari)</small><b>${active}<span>/${kids.length}</span></b></div><div class="kpi"><small>Soal dijawab (7 hari)</small><b>${answered}</b></div><div class="kpi"><small>Ketepatan (7 hari)</small><b>${pct(correct, answered)}%</b></div><div class="kpi"><small>Keterampilan tuntas</small><b>${all.reduce((a, x) => a + x.all.mastered, 0)}</b></div></div>
        <details class="card insights"><summary><b>🔎 Wawasan kelas</b><small>Keterampilan tersulit, pola kesalahan, dan siswa paling rajin</small></summary><div class="grid2">
          <section class="card"><h2>⚠️ Perlu perhatian</h2>${attention.length ? attention.map((x) => `<a class="lrow" href="#/guru/siswa/${x.k.id}"><span class="av sm">${avHTML(x.k.avatar)}</span><span class="grow"><b>${esc(x.k.name)}</b><small>${x.s.answered === 0 ? `Tidak berlatih 7 hari terakhir · terakhir ${ago(x.all.last)}` : `Ketepatan ${x.s.acc}% dari ${x.s.answered} soal`}</small></span>→</a>`).join('') : '<p class="muted">Semua siswa aktif dan ketepatannya baik. 👍</p>'}</section>
          <section class="card"><h2>🧗 Keterampilan tersulit di kelas</h2>${hard.length ? hard.map((h) => `<div class="lrow"><span class="grow"><b>${SKILLS[h.id].code} ${SKILLS[h.id].name}</b><small>Ketepatan ${h.acc}% · ${h.n} siswa mencoba</small></span><button class="btn sm ghost" data-act="assign1" data-id="${h.id}">Tugaskan</button></div>`).join('') : '<p class="muted">Belum cukup data.</p>'}</section>
          <section class="card"><h2>🔍 Pola kesalahan kelas (14 hari)</h2>${tags.length ? tags.map(([t, n]) => `<div class="tagrow"><b>${TAGS[t].label}</b> <span class="pill">${n}×</span><p class="muted small">${TAGS[t].tip}</p></div>`).join('') : '<p class="muted">Belum ada pola kesalahan yang menonjol.</p>'}</section>
          <section class="card"><h2>⭐ Paling rajin minggu ini</h2>${stars.length ? stars.map((x, i) => `<a class="lrow" href="#/guru/siswa/${x.k.id}"><span class="medal">${['🥇', '🥈', '🥉'][i]}</span><span class="av sm">${avHTML(x.k.avatar)}</span><span class="grow"><b>${esc(x.k.name)}</b><small>${x.s.correct} jawaban benar</small></span></a>`).join('') : '<p class="muted">Belum ada aktivitas minggu ini.</p>'}</section>
        </div></details>`);
    }
    if (tab === 'peta') {
      return teacherShell(ctx, tab, `${gradeTabs()}<section class="card"><p class="muted small">Rata-rata SmartScore per bab. Ketuk nama untuk detail.</p><div class="tscroll"><table class="tbl heat"><thead><tr><th>Siswa</th>${curUnits().map((u) => `<th title="${u.name}">${u.icon}<br>${u.id}</th>`).join('')}</tr></thead><tbody>
        ${kids.map((k) => `<tr><td><a href="#/guru/siswa/${k.id}">${avHTML(k.avatar)} ${esc(k.name)}</a></td>${curUnits().map((u) => { const us = unitScore(k.id, u); return `<td class="hc ${level(us.avg)[1]}" title="${u.name}: ${us.avg}">${us.avg || ''}</td>`; }).join('')}</tr>`).join('')}
        </tbody></table></div><div class="legend">${[['Belum', 'lv0'], ['Mulai <50', 'lv1'], ['Berkembang 50–79', 'lv2'], ['Mahir 80–99', 'lv3'], ['Tuntas 100', 'lv4']].map(([l, c]) => `<span><i class="${c}"></i>${l}</span>`).join('')}</div></section>`);
    }
    if (tab === 'keterampilan') {
      const agg = classSkillAgg(kids);
      return teacherShell(ctx, tab, gradeTabs() + curUnits().map((u) => `<section class="card unit" style="--c:${u.color}"><h2><span class="uicon">${u.icon}</span>${u.id}. ${u.name}</h2><a class="lessonlink" href="#/pelajaran/${u.id}">📖 Pelajaran bab ini</a>
        ${u.skills.map((s) => { const a = agg[s.id]; const prof = a ? a.students.filter((x) => x.p.score >= 80).length : 0; return `<details class="skd"><summary><span class="sk-code">${s.code}</span><span class="grow">${s.name}</span><span class="muted small">${a ? `${a.n} siswa · ${pct(a.ok, a.att)}%` : 'belum dicoba'}</span><span class="pill">${prof}/${kids.length} mahir</span></summary>
          ${a ? `<div class="skd-b">${a.students.sort((x, y) => x.p.score - y.p.score).map((x) => `<a class="lrow" href="#/guru/siswa/${x.k.id}"><span class="av sm">${avHTML(x.k.avatar)}</span><span class="grow">${esc(x.k.name)}<small>${x.p.att} soal · ${pct(x.p.ok, x.p.att)}% benar</small></span>${chip(x.p.score)}</a>`).join('')}</div>` : ''}<p class="small"><a href="#/coba/${s.id}">Coba soal contoh →</a></p></details>`; }).join('')}</section>`).join(''));
    }
    return go('#/guru/ringkasan');
  }
  // Penjelasan cara dan alasan penyusunan kurikulum (dipakai di Referensi guru dan halaman Kurikulum)
  function curriculumDesignHTML(full) {
    const n = (g) => unitsOf(g).reduce((a, u) => a + u.skills.length, 0);
    return `<div class="cdesign">
      <p>Metiq memadukan tiga rujukan, masing-masing untuk peran yang berbeda: <b>IXL</b> menentukan <i>apa</i> yang dilatih, <b>Singapore Math</b> menentukan <i>bagaimana</i> konsep dijelaskan, dan <b>Kurikulum Merdeka</b> memastikan semuanya sesuai dengan <i>yang wajib dicapai</i> siswa di Indonesia.</p>
      <h3>Langkah penyusunan</h3>
      <ol class="csteps">
        <li><b>Cakupan dari IXL.</b> Daftar keterampilan matematika IXL kelas 1 sampai 6 dibaca satu per satu sebagai peta cakupan. IXL memecah materi menjadi keterampilan kecil (satu keterampilan = satu jenis soal), sehingga cocok untuk latihan adaptif dan untuk melacak bagian mana yang belum dikuasai.</li>
        <li><b>Urutan dan cara menjelaskan dari Singapore Math.</b> Keterampilan dikelompokkan menjadi bab dan diurutkan mengikuti alur Primary Mathematics / Dimensions Math: konkret → gambar → abstrak, pasangan bilangan, membuat 10, model batang untuk soal cerita, dan model luas untuk perkalian. Alur ini dipakai di pelajaran, penjelasan saat jawaban salah, dan animasi.</li>
        <li><b>Penyelarasan dengan Kurikulum Merdeka.</b> Setiap bab dipetakan ke elemen Capaian Pembelajaran (Bilangan, Aljabar, Pengukuran, Geometri, Analisis Data dan Peluang) dan fasenya: kelas 1–2 Fase A, kelas 3–4 Fase B, kelas 5–6 Fase C. Topik yang menurut CP baru diajarkan di fase berikutnya tetap disediakan tetapi diberi label <b>Pengayaan</b>.</li>
        <li><b>Penyesuaian konteks Indonesia.</b> Topik IXL yang khas Amerika diganti: dolar menjadi Rupiah, inci dan pon menjadi satuan metrik, a.m./p.m. menjadi jam 24, titik desimal menjadi koma. Nama dan cerita soal memakai kehidupan sehari-hari di Indonesia.</li>
        <li><b>Soal, pelajaran, dan umpan balik ditulis sendiri.</b> Tidak ada soal yang disalin. Setiap keterampilan punya pembuat soal acak sehingga soalnya selalu baru, beserta penjelasan langkah demi langkah dan deteksi pola kesalahan (misalnya "mengurangi angka kecil dari angka besar" saat meminjam).</li>
      </ol>
      <p class="small">Hasilnya ${UNITS.length} bab dan ${Object.keys(SKILLS).length} keterampilan: ${GRADES.map((g) => `${g.name} ${unitsOf(g.id).length} bab / ${n(g.id)} keterampilan`).join(', ')}.</p>
      <h3>Mengapa memakai ketiganya?</h3>
      <div class="refgrid">
        <div><h3>IXL: rinci dan adaptif</h3><p>Cakupannya sangat lengkap dan terpecah kecil, dengan SmartScore yang menuntut siswa benar secara konsisten. Kekurangannya: berbahasa Inggris, konteks Amerika, dan lebih banyak "latihan" daripada "penjelasan mengapa".</p></div>
        <div><h3>Singapore Math: pemahaman konsep</h3><p>Metodenya menekankan pemahaman, bukan hafalan, dengan gambar yang sama dipakai dari kelas 1 sampai 6 (pasangan bilangan, model batang). Singapura secara konsisten berada di peringkat teratas studi internasional TIMSS dan PISA.</p></div>
        <div><h3>Kurikulum Merdeka: yang berlaku di sekolah</h3><p>Guru menilai siswa berdasarkan Capaian Pembelajaran. Pemetaan ke CP membuat latihan di Metiq langsung relevan dengan materi kelas, asesmen, dan rapor.</p></div>
      </div>
      ${full ? `<h3>Catatan untuk guru</h3><ul class="small">
        <li>Kurikulum ini disusun oleh pengembang Metiq dengan bantuan AI (Claude), bukan oleh lembaga resmi. Guru dianjurkan meninjau bab yang dipakai dan memberi masukan jika ada urutan atau istilah yang perlu disesuaikan dengan sekolah.</li>
        <li>Nama IXL dan Singapore Math dipakai sebagai rujukan cakupan dan metode; Metiq tidak berafiliasi dengan keduanya.</li>
        <li>Untuk penelitian, sebutkan Metiq sebagai media latihan yang mengacu pada tiga rujukan ini, dan lampirkan peta bab di bawah sebagai kisi-kisi materi.</li></ul>` : ''}
    </div>`;
  }
  /* Referensi kurikulum dan metode yang dipakai Metiq, untuk guru */
  function referenceHTML() {
    const nSkills = (g) => unitsOf(g).reduce((a, u) => a + u.skills.length, 0);
    const levels = [['Belum dicoba', 'lv0'], ['Mulai 1–49', 'lv1'], ['Berkembang 50–79', 'lv2'], ['Mahir 80–99', 'lv3'], ['Tuntas 100', 'lv4']];
    return `
      <section class="card ref"><h2>🧭 Cara kurikulum Metiq disusun</h2>${curriculumDesignHTML(true)}</section>
      <section class="card ref"><h2>📚 Sumber kurikulum</h2>
        <p class="small muted">Metiq menyusun daftar keterampilan dari tiga sumber berikut. Semua soal, gambar, dan penjelasan di Metiq ditulis sendiri dalam bahasa Indonesia; tidak ada soal yang disalin dari sumber mana pun.</p>
        <div class="refsrc"><h3>1. IXL Math</h3>
          <p>Daftar keterampilan per kelas dipakai sebagai acuan cakupan dan urutan topik, serta cara latihan adaptif dengan SmartScore. Daftar dibaca pada 26 Oktober 2026.</p>
          <ul>${GRADES.map((g) => `<li>${g.name}: <a href="${g.ixl}" target="_blank" rel="noopener">${g.ixl.replace('https://www.', '')}</a></li>`).join('')}</ul></div>
        <div class="refsrc"><h3>2. Singapore Math</h3>
          <p>Alur topik dan metode mengikuti seri Primary Mathematics / Dimensions Math (${GRADES.map((g) => g.sg.replace('Primary Mathematics / Dimensions Math ', '')).join('; ')}), yang disusun berdasarkan silabus matematika sekolah dasar Kementerian Pendidikan Singapura (MOE). Rujukan ditulis sebagai nama topik, bukan nomor bab, karena setiap edisi buku berbeda urutannya.</p></div>
        <div class="refsrc"><h3>3. Kurikulum Merdeka (Indonesia)</h3>
          <p>Setiap bab dipetakan ke elemen Capaian Pembelajaran (CP) Matematika: Bilangan, Aljabar, Pengukuran, Geometri, serta Analisis Data dan Peluang. Kelas 1–2 = <b>Fase A</b>, kelas 3–4 = <b>Fase B</b>, kelas 5–6 = <b>Fase C</b>. Topik yang di CP baru muncul di fase berikutnya (mis. perkalian di kelas 2, atau bilangan bulat negatif di kelas 6 yang termasuk Fase D/SMP) ditandai <b>Pengayaan</b>. Silakan cocokkan dengan dokumen CP resmi terbaru dari Kemendikbudristek.</p></div>
      </section>
      <section class="card ref"><h2>🇸🇬 Metode Singapore Math di Metiq</h2>
        <div class="refgrid">
          <div><h3>Konkret → Piktorial → Abstrak</h3><p>Soal dimulai dengan gambar benda, lalu kalimat matematika. Saran latihan di rumah selalu dimulai dengan benda nyata.</p></div>
          <div><h3>Pasangan bilangan</h3><p>Diagram "keseluruhan–bagian" untuk memahami bahwa 8 = 5 + 3. Dipakai di bab Pasangan bilangan (kelas 1) dan strategi mengurai bilangan (kelas 2).</p></div>
          <div><h3>Membuat 10</h3><p>8 + 5 → 8 + 2 + 3 = 10 + 3. Muncul di penjumlahan sampai 20 dan di penjelasan soal yang hasilnya lebih dari 10.</p></div>
          <div><h3>Model batang</h3><p>Batang bagian–keseluruhan dan batang perbandingan untuk soal cerita, termasuk soal dua langkah di kelas 2.</p></div>
          <div><h3>Hitung mental</h3><p>Strategi kompensasi (+9 = +10 − 1), menghitung maju untuk mengurangi, serta menambah 10 atau 100.</p></div>
          <div><h3>Perkalian sebagai kelompok</h3><p>Kelompok sama banyak, susunan baris–kolom, lalu tabel perkalian 2, 3, 4, 5, dan 10.</p></div>
        </div>
      </section>
      ${GRADES.map((g) => `<section class="card ref"><h2>🗺️ Peta bab ${g.name} <span class="pill">${unitsOf(g.id).length} bab · ${nSkills(g.id)} keterampilan</span></h2>
        <div class="tscroll"><table class="tbl reftbl"><thead><tr><th>Bab Metiq</th><th>IXL</th><th>Singapore Math</th><th>Kurikulum Merdeka</th></tr></thead><tbody>
        ${unitsOf(g.id).map((u) => `<tr><td><b>${u.icon} ${u.id}. ${u.name}</b><small>${u.skills.length} keterampilan</small></td><td>${u.ixl}</td><td>${u.sg}</td><td>${/Pengayaan/.test(u.km) ? `<span class="pill warn">${u.km}</span>` : u.km}</td></tr>`).join('')}
        </tbody></table></div></section>`).join('')}
      <section class="card ref"><h2>🇮🇩 Penyesuaian untuk Indonesia</h2><ul>
        <li>Uang memakai koin dan uang kertas Rupiah (koin Rp100–Rp1.000, uang kertas Rp1.000–Rp100.000).</li>
        <li>Jam: "setengah tujuh" berarti pukul 06.30. Kelas 2 memakai jam 24 (pukul 19.00 = 7 malam) sebagai pengganti a.m./p.m.</li>
        <li>Pengukuran hanya memakai satuan metrik (mm, cm, m, km, g, kg, mL, L). Satuan inci, kaki, dan pon dari IXL tidak dipakai.</li>
        <li>Desimal ditulis dengan koma (2,5) dan ribuan dengan titik (1.250), sesuai kebiasaan di Indonesia. Keypad menyediakan tombol koma dan minus bila diperlukan.</li>
        <li>Nama orang, hari, bulan, dan konteks soal (warung, pasar, sekolah) disesuaikan dengan kehidupan sehari-hari di Indonesia.</li>
      </ul></section>
      <section class="card ref"><h2>📈 SmartScore dan tingkat penguasaan</h2>
        <p>Seperti IXL, skor naik cepat di awal lalu makin pelan mendekati 100, dan turun jika jawaban salah. Siswa harus menjawab benar secara konsisten untuk tuntas.</p>
        <div class="legend">${levels.map(([l, c]) => `<span><i class="${c}"></i>${l}</span>`).join('')}</div>
        <p class="small muted">Laporan orang tua memasukkan keterampilan ke "Perlu ditingkatkan" jika sudah dicoba minimal 4 soal dan skornya di bawah 60, atau ketepatannya di bawah 70%.</p></section>
      <section class="card ref"><h2>🔍 Pola kesalahan yang dideteksi</h2>
        <p class="small muted">Setiap jawaban salah diperiksa untuk mencari polanya. Pola ini muncul di dasbor guru dan laporan orang tua, bersama saran latihan.</p>
        ${Object.entries(TAGS).filter(([k]) => k !== 'konsep').map(([, t]) => `<div class="tagrow"><b>${t.label}</b><p class="small">${t.tip}</p></div>`).join('')}
      </section>`;
  }
  /* ---------- Analitik guru (mirip laporan IXL Analytics) ---------- */
  const ss = {
    get(k, d) { try { const v = sessionStorage.getItem('metiq_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { sessionStorage.setItem('metiq_' + k, JSON.stringify(v)); } catch (e) {} },
  };
  const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const fdate = (ts) => { const d = new Date(ts); return `${d.getDate()} ${BLN[d.getMonth()]}`; };
  const ftime = (ts) => { const d = new Date(ts); return `${fdate(ts)}, ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`; };
  const dayStart = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const isoDay = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const RANGE_LABEL = { 7: '7 hari', 30: '30 hari', 90: '90 hari', all: 'Semua' };
  function getRange() {
    const r = ss.get('range', { preset: 30 }), now = Date.now();
    if (r.preset === 'custom' && r.from && r.to) return { from: new Date(r.from + 'T00:00:00').getTime(), to: new Date(r.to + 'T23:59:59').getTime() };
    if (r.preset === 'all') return { from: 0, to: now };
    return { from: dayStart(now) - ((+r.preset || 30) - 1) * DAY, to: now };
  }
  const inRange = (a, g) => a.ts >= g.from && a.ts <= g.to;
  function rangeBar() {
    const r = ss.get('range', { preset: 30 }), g = getRange();
    return `<div class="rangebar">${[7, 30, 90, 'all'].map((p) => `<button class="${String(r.preset) === String(p) ? 'on' : ''}" data-act="range" data-p="${p}">${RANGE_LABEL[p]}</button>`).join('')}<button class="${r.preset === 'custom' ? 'on' : ''}" data-act="range" data-p="custom">Pilih tanggal</button></div>
      ${r.preset === 'custom' ? `<div class="rangecustom"><label>Dari<input type="date" data-act="rfrom" value="${r.from || isoDay(Date.now() - 29 * DAY)}"></label><label>Sampai<input type="date" data-act="rto" value="${r.to || isoDay(Date.now())}"></label></div>` : ''}
      <p class="muted small">Periode: ${g.from ? fdate(g.from) : 'semua data'} – ${fdate(g.to)}${cloudOn() ? ' · Server menyimpan riwayat jawaban 90 hari terakhir untuk dasbor.' : ''}</p>`;
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
  const STATUS = { 0: ['⚪', 'Belum ada siswa', ''], 1: ['🟢', 'Baik', 'g'], 2: ['🟡', 'Perlu dipantau', 'y'], 3: ['🔴', 'Perlu perhatian', 'r'] };
  const statusPill = (st) => `<span class="accb ${STATUS[st][2]} nowrap">${STATUS[st][0]} ${STATUS[st][1]}</span>`;
  const accPill = (s) => (s.answered ? `<span class="accb ${s.acc >= 80 ? 'g' : s.acc >= 65 ? 'y' : 'r'}">${s.acc}%</span>` : '–');
  function statusWhy(s) {
    const r = [];
    if (s.pBehind >= 25) r.push(`${s.behind} dari ${s.n} siswa belum memahami beberapa materi`);
    if (s.pActive < 75) r.push(`hanya ${s.active} dari ${s.n} siswa berlatih`);
    if (s.answered >= 30 && s.acc < 75) r.push(`ketepatan ${s.acc}%`);
    return r.join(' · ');
  }
  const openBtn = (c, label) => `<button class="btn sm ghost" data-act="openclass" data-id="${c.id}">${label || 'Buka kelas'}</button>`;
  // Sekolah-sekolah yang kelasnya terlihat oleh akun ini (super admin: semua; admin sekolah: sekolahnya)
  function schoolsOf(ctx) {
    const m = new Map(); ctx.classes.forEach((c) => { const id = c.schoolId || ''; if (!m.has(id)) m.set(id, { id, name: c.schoolName || 'Tanpa sekolah', kind: c.schoolKind }); });
    return [...m.values()].sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }

  // Paket Sekolah belum aktif: jelaskan apa yang didapat dan cara mengaktifkannya
  function schoolUpsellHTML(ctx) {
    return `<section class="card upsell"><h2>🏫 Paket Sekolah belum aktif</h2><p>${ctx.t.schoolName ? `<b>${esc(ctx.t.schoolName)}</b> belum berlangganan paket Sekolah${ctx.t.schoolPlanUntil ? ` (berakhir ${esc(String(ctx.t.schoolPlanUntil))})` : ''}.` : 'Sekolah Anda belum berlangganan paket Sekolah.'} Kelas Anda sendiri tetap bisa dipakai gratis seperti biasa.</p>
      <ul><li>Dasbor dan laporan lintas kelas dan guru</li><li>Admin sekolah mengelola guru</li><li>Asesmen awal–akhir dan data penelitian</li><li>Pelatihan dan pendampingan</li></ul>
      <p><b>${rp(PRICE)} per siswa per tahun.</b></p><div class="row-btn left"><a class="btn" href="#/harga">Lihat paket dan minta penawaran</a></div></section>`;
  }
  // Admin sekolah: daftar guru di sekolahnya, tambah lewat email (guru mendaftar gratis dulu), lepas dari sekolah
  async function loadSchoolTeachers() {
    const box = document.getElementById('sg-box'); if (!box) return;
    if (!cloudOn() || session.get().demo) { box.innerHTML = emptyCard('Tersedia di mode server', 'Di mode coba, data guru adalah contoh.'); return; }
    try {
      const list = await Cloud.rpc('school_teachers', { p_token: session.get().token });
      if (!document.getElementById('sg-box')) return;
      box.innerHTML = `<section class="card"><h2>➕ Tambah guru ke sekolah</h2><p class="small muted">Guru mendaftar gratis dulu di Metiq (Saya Guru → Daftar gratis), lalu masukkan emailnya di sini. Kelas dan siswanya ikut masuk ke dasbor sekolah.</p>
          <form data-form="sgadd" class="form inline"><input name="email" type="email" required placeholder="email guru" aria-label="Email guru"><button class="btn">Tambahkan</button></form></section>
        <section class="card"><h2>Guru di sekolah ini <span class="pill">${list.length}</span></h2>${list.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>Guru</th><th>Email</th><th>Kelas</th><th>Siswa</th><th></th></tr></thead><tbody>
          ${list.map((g) => `<tr><td><b>${esc(g.name)}</b>${g.isSchoolAdmin ? ' <span class="pill">Admin sekolah</span>' : ''}</td><td>${esc(g.email)}</td><td>${g.classes}</td><td>${g.students}</td><td class="r">${g.isSchoolAdmin ? '' : `<button class="link small danger" data-act="sgdel" data-id="${g.id}" data-n="${esc(g.name)}">Lepas dari sekolah</button>`}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Belum ada guru.</p>'}</section>`;
    } catch (e) {
      box.innerHTML = e.status === 404 ? emptyCard('Perlu menjalankan SQL 020', 'Jalankan supabase/020_paket_sekolah.sql di SQL Editor Supabase.') : emptyCard('Belum bisa dibuka', e.status ? esc(e.message) : 'Tidak bisa terhubung ke server');
    }
  }
  function schoolHTML(ctxAll, sub) {
    if (cloudOn() && !session.get().demo && !ctxAll.t.isAdmin && ctxAll.t.schoolActive === false) return schoolUpsellHTML(ctxAll);
    const list = schoolsOf(ctxAll), want = ss.get('schoolSel', ctxAll.t.schoolId || (list[0] || {}).id || ''), sel = list.find((x) => x.id === want) || list[0] || { id: '' };
    const ctx = Object.assign({}, ctxAll, { classes: ctxAll.classes.filter((c) => (c.schoolId || '') === sel.id) });
    const picker = list.length > 1 ? `<label class="schoolpick">Sekolah <select data-act="schoolsel">${list.map((x) => `<option value="${x.id}" ${x.id === sel.id ? 'selected' : ''}>${esc(x.name)}${x.kind === 'homeschool' ? ' (homeschool)' : ''}</option>`).join('')}</select></label>` : '';
    return picker + schoolBody(ctx, sub);
  }
  function schoolBody(ctx, sub) {
    sub = ['kelas', 'grafik', 'materi', 'guru', 'kelolaguru', 'asesmen', 'ulasan', 'data', 'coba'].includes(sub) ? sub : 'kelas';
    const g = getRange();
    const all = ctx.classes.map((c) => classSummary(c, g)).sort((a, b) => b.status - a.status || b.pBehind - a.pBehind);
    const sum = (f) => all.reduce((t, s) => t + s[f], 0);
    const kidsN = sum('n'), answered = all.reduce((t, s) => t + s.answered, 0), correct = all.reduce((t, s) => t + Math.round(s.answered * s.acc / 100), 0);
    const teachers = [...new Set(all.map((s) => s.c.teacherId))];
    const subs = [['kelas', '🏫 Per kelas'], ['grafik', '📊 Grafik'], ['materi', '🧗 Materi sulit'], ['guru', '👩‍🏫 Per guru'], ['kelolaguru', '🧑‍🏫 Kelola guru'], ['asesmen', '🧭 Asesmen awal–akhir'], ['ulasan', '⭐ Ulasan'], ['data', '📥 Data penelitian'], ['coba', '🧪 Mode coba']];
    let body;
    if (sub === 'kelolaguru') body = `<div id="sg-box">${loadingHTML}</div>`;
    else if (sub === 'kelas') {
      body = `<section class="card"><h2>Kondisi tiap kelas</h2><p class="muted small">Diurutkan dari yang paling perlu perhatian. "Belum paham" = siswa yang minimal seperempat keterampilan yang sudah dicobanya masih lemah (skor di bawah 80 dengan banyak jawaban salah).</p>
        <div class="tscroll"><table class="tbl"><thead><tr><th>Kelas</th><th>Guru</th><th>Status</th><th>Siswa</th><th>Aktif</th><th>Soal/siswa</th><th>Ketepatan</th><th>Belum paham</th><th>Tugas selesai</th><th>Ortu buka laporan</th><th>Ulasan</th></tr></thead><tbody>
        ${all.map((s) => `<tr data-act="openclass" data-id="${s.c.id}"><td><b>${esc(s.c.name)}</b>${s.grade ? `<small class="muted"> · materi kelas ${s.grade}</small>` : ''}</td><td>${esc(s.c.teacherName || '')}</td><td>${statusPill(s.status)}</td><td>${s.n}</td><td>${s.active}/${s.n}</td><td>${s.perKid}</td><td>${accPill(s)}</td><td><span class="accb ${s.pBehind >= 50 ? 'r' : s.pBehind >= 25 ? 'y' : 'g'}">${s.behind}/${s.n}</span></td><td>${s.pDone === null ? '<span class="muted">–</span>' : s.pDone + '%'}</td><td>${s.viewed}/${s.n}</td><td>${s.fb.length ? `⭐ ${fbAvg(s.fb)} <small class="muted">(${s.fb.length})</small>` : '–'}</td></tr>`).join('')}
        </tbody></table></div><p class="muted small">Ketuk baris kelas untuk membuka dasbor kelas itu.</p></section>
        ${all.filter((s) => s.status >= 2).map((s) => `<section class="card cwarn ${STATUS[s.status][2]}"><div class="lrow"><span class="grow"><b>${STATUS[s.status][0]} ${esc(s.c.name)}</b> · ${esc(s.c.teacherName || '')}<small>${statusWhy(s)}</small></span>${openBtn(s.c)}</div>
          ${s.hard.some((h) => h.kids.length >= 2) ? `<p class="small"><b>Materi yang belum dipahami banyak siswa:</b> ${s.hard.filter((h) => h.kids.length >= 2).slice(0, 3).map((h) => `${SKILLS[h.id].code} ${SKILLS[h.id].name} (${h.kids.length} siswa)`).join(' · ')}</p>` : ''}</section>`).join('')}`;
    } else if (sub === 'materi') {
      // Gabungan seluruh sekolah per bab, lalu rincian per kelas
      const units = {};
      all.forEach((s) => s.hard.filter((h) => h.kids.length >= 2).forEach((h) => { const u = SKILLS[h.id].unit; const x = units[u] = units[u] || { u, kids: new Set(), classes: new Set() }; h.kids.forEach((k) => x.kids.add(k.id)); x.classes.add(s.c.id); }));
      const ul = Object.values(units).sort((a, b) => b.kids.size - a.kids.size).slice(0, 8);
      body = `<section class="card"><h2>Bab yang paling banyak belum dipahami (seluruh sekolah)</h2>${ul.length ? ul.map((x) => { const u = UNITS.find((y) => y.id === x.u); return `<div class="lrow"><span class="uicon">${u.icon}</span><span class="grow"><b>${gname(u.grade)} · ${u.name}</b><small>${x.kids.size} siswa di ${x.classes.size} kelas</small></span><a class="btn sm ghost" href="#/pelajaran/${u.id}">📖 Pelajaran</a></div>`; }).join('') : '<p class="muted">Belum ada materi yang menonjol sulit. 👍</p>'}</section>
        ${all.filter((s) => s.n).map((s) => `<section class="card"><div class="lrow"><span class="grow"><b>${esc(s.c.name)}</b> · ${esc(s.c.teacherName || '')}<small>${s.behind} dari ${s.n} siswa belum memahami sebagian materi</small></span>${statusPill(s.status)}</div>
          ${s.hard.length ? s.hard.slice(0, 5).map((h) => `<div class="hardrow"><div class="lrow"><span class="grow"><b>${SKILLS[h.id].code} ${SKILLS[h.id].name}</b><small>${gname(SKILLS[h.id].grade)} · ketepatan rata-rata ${h.acc}%</small></span><span class="pill">${h.kids.length}/${s.n} siswa</span></div><p class="small muted">${h.kids.map((k) => esc(k.name)).join(', ')}</p></div>`).join('') : '<p class="muted small">Tidak ada materi yang tertinggal.</p>'}
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
        return { name: cs[0].c.teacherName || 'Guru', cs, n, active: cs.reduce((t, s) => t + s.active, 0), behind: cs.reduce((t, s) => t + s.behind, 0), ans, acc: pct(ok, ans), asg: cs.reduce((t, s) => t + s.asg, 0), special: cs.reduce((t, s) => t + s.special, 0), pDone: withDone.length ? Math.round(withDone.reduce((t, s) => t + s.pDone, 0) / withDone.length) : null, lastAsg: Math.max(...cs.map((s) => s.lastAsg)) };
      });
      body = `<section class="card"><h2>Indikator per guru</h2>
        <p class="small infonote">ℹ️ Angka ini menggambarkan <b>aktivitas dan pemahaman siswa</b> di kelas setiap guru, serta seberapa aktif guru memberi tugas dan menindaklanjuti siswa. Gunakan sebagai bahan diskusi dan pendampingan, bukan satu-satunya dasar penilaian kinerja.</p>
        <div class="tscroll"><table class="tbl"><thead><tr><th>Guru</th><th>Kelas</th><th>Siswa aktif</th><th>Ketepatan</th><th>Belum paham</th><th>Tugas diberikan</th><th>Tugas khusus</th><th>Tugas selesai</th><th>Tugas terakhir</th></tr></thead><tbody>
        ${rows.map((r) => `<tr><td><b>${esc(r.name)}</b></td><td class="wrap">${r.cs.map((s) => esc(s.c.name)).join(', ')}</td><td>${r.active}/${r.n} <small class="muted">(${pct(r.active, r.n)}%)</small></td><td>${r.ans ? `<span class="accb ${r.acc >= 80 ? 'g' : r.acc >= 65 ? 'y' : 'r'}">${r.acc}%</span>` : '–'}</td><td>${r.behind}/${r.n}</td><td>${r.asg}</td><td>${r.special}</td><td>${r.pDone === null ? '–' : r.pDone + '%'}</td><td>${r.lastAsg ? ago(r.lastAsg) : 'belum pernah'}</td></tr>`).join('')}
        </tbody></table></div></section>
        <section class="card"><h2>Cara membaca</h2><ul class="small">
          <li><b>Siswa aktif</b>: siswa yang berlatih minimal sekali dalam periode ini.</li>
          <li><b>Belum paham</b>: siswa yang minimal seperempat keterampilan yang sudah dicobanya masih lemah.</li>
          <li><b>Tugas diberikan / tugas khusus</b>: tugas yang dibuat guru dalam periode ini; tugas khusus menunjukkan tindak lanjut untuk siswa tertentu.</li>
          <li><b>Tugas selesai</b>: rata-rata persentase siswa yang menyelesaikan tugas.</li>
          <li>Siswa yang banyak "belum paham" tapi tanpa tugas khusus bisa menjadi bahan diskusi dengan gurunya.</li></ul></section>`;
    }
    return `<div class="kpis"><div class="kpi"><small>Kelas · guru</small><b>${all.length}<span> · ${teachers.length}</span></b></div><div class="kpi"><small>Siswa aktif</small><b>${sum('active')}<span>/${kidsN}</span></b></div><div class="kpi"><small>Ketepatan sekolah</small><b>${pct(correct, answered)}%</b></div><div class="kpi"><small>Kelas perlu perhatian</small><b>${all.filter((s) => s.status === 3).length}<span> · ${all.filter((s) => s.status === 2).length}🟡</span></b></div></div>
      ${rangeBar()}
      <nav class="subtabs">${subs.map(([k, l]) => `<a href="#/guru/sekolah/${k}" class="${k === sub ? 'on' : ''}">${l}</a>`).join('')}</nav>
      ${body}`;
  }

  /* ---------- Ulasan tugas (bintang dan komentar dari siswa dan orang tua) ---------- */
  const fbAvg = (list) => (list.reduce((t, f) => t + f.rating, 0) / list.length).toFixed(1).replace('.', ',');
  const stars = (n) => `<span class="stars" aria-label="${n} bintang">${'★'.repeat(n)}<i>${'★'.repeat(5 - n)}</i></span>`;
  const fbSummary = (list) => (list.length ? `<p class="small">⭐ <b>${fbAvg(list)}</b> dari ${list.length} ulasan${list.some((f) => f.comment) ? ` · <span class="muted">“${esc(list.filter((f) => f.comment).pop().comment)}”</span>` : ''}</p>` : '');
  function feedbackHTML(a, sid, by) {
    if (!S.isDone(a.id, sid)) return '';
    const f = S.myFeedback(a.id, sid, by), key = a.id + ':' + sid + ':' + by;
    if (f && ss.get('fbedit', '') !== key) return `<div class="fbdone small">${by === 'siswa' ? 'Ulasanmu' : 'Ulasan Anda'}: ${stars(f.rating)}${f.comment ? ` “${esc(f.comment)}”` : ''} <button class="link" data-act="fbedit" data-k="${key}">Ubah</button></div>`;
    return `<form class="fbform" data-form="fb" data-a="${a.id}" data-s="${sid}" data-by="${by}"><p class="small"><b>⭐ ${by === 'siswa' ? 'Bagaimana tugas ini menurutmu?' : 'Bagaimana tugas ini menurut Ayah/Bunda?'}</b></p>
      <div class="starpick" role="radiogroup" aria-label="Pilih bintang">${[5, 4, 3, 2, 1].map((n) => `<label title="${n} bintang"><input type="radio" name="rating" value="${n}" ${f && f.rating === n ? 'checked' : ''}><span>★</span></label>`).join('')}</div>
      <textarea name="comment" maxlength="500" rows="2" placeholder="${by === 'siswa' ? 'Ceritakan pendapatmu (boleh dikosongkan)' : 'Komentar untuk guru (opsional)'}">${f && f.comment ? esc(f.comment) : ''}</textarea>
      <button class="btn sm">Kirim ulasan</button></form>`;
  }
  function reviewsHTML(all, g) {
    const list = all.flatMap((s) => s.fb.map((f) => ({ ...f, s, k: S.student(f.sid), a: S.db.assignments.find((x) => x.id === f.aid) }))).filter((f) => f.k).sort((a, b) => b.at - a.at);
    if (!list.length) return emptyCard('Belum ada ulasan', 'Ulasan muncul setelah siswa atau orang tua menyelesaikan tugas lalu memberi bintang dan komentar.');
    const by = (r) => list.filter((f) => f.by === r);
    const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: list.filter((f) => f.rating === n).length }));
    const mx = Math.max(...dist.map((d) => d.c));
    return `<div class="grid2">
      <section class="card"><h2>Ringkasan ulasan</h2><div class="fbbig"><b>${fbAvg(list)}</b>${stars(Math.round(list.reduce((t, f) => t + f.rating, 0) / list.length))}<small>${list.length} ulasan · siswa ${by('siswa').length ? `⭐ ${fbAvg(by('siswa'))}` : '–'} · orang tua ${by('ortu').length ? `⭐ ${fbAvg(by('ortu'))}` : '–'}</small></div>
        ${dist.map((d) => `<div class="fbbar"><span>${d.n}★</span><i><b style="width:${mx ? Math.round((d.c / mx) * 100) : 0}%"></b></i><small>${d.c}</small></div>`).join('')}</section>
      <section class="card"><h2>Per kelas</h2>${all.filter((s) => s.fb.length).map((s) => `<div class="lrow"><span class="grow"><b>${esc(s.c.name)}</b><small>${esc(s.c.teacherName || '')} · ${s.fb.length} ulasan</small></span>⭐ <b>${fbAvg(s.fb)}</b></div>`).join('')}</section></div>
      <section class="card"><h2>Komentar terbaru</h2>${list.slice(0, 40).map((f) => `<div class="fbitem"><div class="lrow"><span class="av sm">${avHTML(f.k.avatar)}</span><span class="grow"><b>${f.by === 'ortu' ? `Orang tua ${esc(f.k.name)}` : esc(f.k.name)}</b><small>${esc(f.s.c.name)} · ${esc((f.a && f.a.note) || 'Tugas')} · ${ftime(f.at)}</small></span>${stars(f.rating)}</div>${f.comment ? `<p>“${esc(f.comment)}”</p>` : ''}</div>`).join('')}</section>`;
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
  const BBO_LABEL = { diterima: '✅ Diterima BBO', dikirim: '⏳ Sedang dikirim', gagal: '⚠️ Gagal terkirim', tanpa_nisn: 'Tidak dikirim (belum ada NISN)' };
  function studentDataHTML(k) {
    const v = S.viewsOf(k.id).slice().sort((a, b) => a.at - b.at), v30 = v.filter((x) => x.at > Date.now() - 30 * DAY).length;
    const done = S.assignmentsFor(k.id).map((a) => ({ a, d: S.db.done.find((x) => x.aid === a.id && x.sid === k.id) })).filter((x) => x.d).sort((a, b) => b.d.at - a.d.at);
    return `<section class="card"><h2>🪪 Data siswa</h2>
      <form class="form nisnform" data-form="nisn" data-s="${k.id}"><label>NISN <small class="muted">(10 angka, untuk mengirim laporan tugas ke BBO Digital)</small><input name="nisn" inputmode="numeric" maxlength="10" pattern="[0-9]{10}" value="${esc(k.nisn || '')}" placeholder="mis. 0123456789"></label><button class="btn sm">Simpan NISN</button></form>
      <p class="small">👪 Orang tua membuka laporan <b>${v30}×</b> dalam 30 hari terakhir${v.length ? ` · terakhir ${ago(v[v.length - 1].at)}` : ' · belum pernah'}.</p>
      ${done.length ? `<h3 class="sub">Tugas selesai dan laporan ke BBO Digital</h3>${done.map(({ a, d }) => `<div class="lrow"><span class="grow"><b>${esc(a.note || 'Tugas')}</b><small>${ftime(d.at)} · ${d.by === 'ortu' ? 'dilaporkan orang tua' : 'diselesaikan siswa'}</small></span><small class="muted">${d.bbo ? BBO_LABEL[d.bbo] || d.bbo : cloudOn() ? 'Belum tercatat' : 'Mode contoh'}</small></div>`).join('')}` : ''}
    </section>`;
  }

  /* ---------- Ekspor data penelitian (CSV, nama disamarkan) ---------- */
  // Kode tetap selama daftar kelas dan siswa tidak berubah; unduh kunci kode bersamaan dengan data
  function researchCodes(all) {
    const classes = all.map((s) => s.c).sort((a, b) => a.name.localeCompare(b.name, 'id'));
    const cc = {}, tc = {}, sc = {};
    classes.forEach((c, i) => { cc[c.id] = 'K' + String(i + 1).padStart(2, '0'); });
    [...new Set(classes.map((c) => c.teacherId))].forEach((t, i) => { tc[t] = 'G' + String(i + 1).padStart(2, '0'); });
    let n = 0;
    classes.forEach((c) => S.studentsOf(c.id).slice().sort((a, b) => a.name.localeCompare(b.name, 'id')).forEach((k) => { sc[k.id] = 'S' + String(++n).padStart(3, '0'); }));
    return { classes, cc, tc, sc };
  }
  function downloadCSV(name, rows) {
    const cell = (v) => { const x = v === null || v === undefined ? '' : String(v); return /[";\r\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
    // titik koma dan BOM agar langsung terbuka rapi di Excel berbahasa Indonesia
    const url = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const dec = (x) => String(Math.round(x * 10) / 10).replace('.', ',');
  const hhmm = (ts) => { const d = new Date(ts); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  function exportResearch(type) {
    const ctx = teacherCtx(); if (!ctx || !ctx.t.isAdmin) return;
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
      kids.forEach(({ k, c }) => S.viewsOf(k.id).filter((v) => v.at >= g.from && v.at <= g.to).sort((a, b) => a.at - b.at).forEach((v) => rows.push([sc[k.id], cc[c.id], tc[c.teacherId], isoDay(v.at), hhmm(v.at), v.via === 'akun' ? 'akun orang tua' : 'kode orang tua'])));
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
    toast(`File ${type} diunduh (${rows.length - 1} baris)`);
  }
  function researchHTML(all) {
    const files = [
      ['siswa', '👧 Ringkasan per siswa', 'Satu baris per siswa: soal, ketepatan, waktu belajar, hari aktif, keterampilan mahir/tuntas, tugas, laporan dibuka orang tua, rata-rata ulasan. Cocok untuk digabung dengan nilai pretest–posttest.'],
      ['jawaban', '✏️ Semua jawaban', 'Satu baris per jawaban: tanggal, jam, keterampilan, benar/salah, lama menjawab, pola kesalahan. Untuk analisis proses belajar.'],
      ['tugas', '📌 Tugas dan ulasan', 'Satu baris per siswa per tugas: selesai atau belum, oleh siapa, bintang dan komentar siswa/orang tua.'],
      ['ortu', '👪 Keterlibatan orang tua', 'Satu baris setiap kali orang tua membuka laporan anak.'],
      ['asesmen', '🧭 Asesmen awal dan akhir', 'Satu baris per siswa: usia, kelas sesuai usia, level, jawaban benar, dan tanggal asesmen awal (pretest) dan akhir (posttest), kenaikan level, serta selisih dari kelas sesuai usia.'],
    ];
    return `<section class="card"><h2>📥 Data untuk penelitian</h2>
      <p class="small">Data mengikuti <b>periode</b> yang dipilih di atas. Nama siswa, kelas, dan guru diganti kode (S001, K01, G01) sehingga aman dipakai di tesis. Format CSV (pemisah titik koma) dapat dibuka langsung di Excel atau diimpor ke SPSS.</p>
      ${files.map(([t, title, desc]) => `<div class="lrow"><span class="grow"><b>${title}</b><small>${desc}</small></span><button class="btn sm" data-act="export" data-t="${t}">Unduh</button></div>`).join('')}</section>
      <section class="card cwarn r"><h2>🔐 Kunci kode (rahasia)</h2><p class="small">Daftar yang menghubungkan kode dengan nama asli dan NISN, untuk mencocokkan data Metiq dengan nilai tes siswa. <b>Jangan dilampirkan di tesis</b> dan simpan di tempat aman. Unduh bersamaan dengan data lain, karena kode berubah jika daftar siswa berubah.</p>
        <div class="row-btn left"><button class="btn sm ghost" data-act="export" data-t="kunci">Unduh kunci kode</button></div></section>
      <section class="card"><h2>Catatan untuk penelitian</h2><ul class="small">
        <li>Server menyimpan riwayat jawaban rinci <b>90 hari terakhir</b> untuk dasbor. Unduh data secara berkala (misalnya setiap bulan) agar tidak ada yang terlewat.</li>
        <li>Keterampilan mahir/tuntas dan hadiah dihitung dari SmartScore yang tersimpan permanen.</li>
        <li>Untuk mengukur dampak, gunakan tes pretest–posttest tersendiri (bukan soal Metiq), lalu gabungkan dengan file "Ringkasan per siswa" memakai kode siswa.</li>
        <li>Komentar ulasan bisa memuat nama. Periksa sebelum dikutip di tesis.</li></ul></section>`;
  }

  /* ---------- Asesmen awal (sekali di awal): usia, lalu soal adaptif dari keterampilan kunci tiap kelas ---------- */
  // Keterampilan kunci per kelas ada di S.DIAG: lima per kelas SD–SMA, tiga sampai lima cerita beraudio untuk TK.
  // Batas "cepat" TK sudah termasuk waktu mendengarkan rekaman cerita.
  const FAST = { '-2': 20000, '-1': 22000, 1: 8000, 2: 10000, 3: 12000, 4: 15000, 5: 18000, 6: 20000, 7: 25000, 8: 30000, 9: 35000, 10: 40000, 11: 40000, 12: 45000, 13: 50000 }, GUESS = 3000;
  let D = null;
  const diagKid = () => { const ses = session.get(); return ses.role === 'siswa' && S.student(ses.id); };
  const isAdminNow = () => { const x = session.get(), t = x.role === 'guru' && S.teacher(x.id); return !!(t && (t.isAdmin || t.isSchoolAdmin)); };
  const DMODE = { a: { name: 'Asesmen awal', start: '#/asesmen', result: '#/asesmen/hasil' }, b: { name: 'Asesmen akhir', start: '#/asesmen/akhir', result: '#/asesmen/akhir/hasil' } };
  // Urutan level: TK A (−2), TK B (−1), Kelas 1–8, lalu Aljabar 1 (9), Geometri, Aljabar 2, Prakalkulus, Kalkulus (13).
  // lvPos merapatkan urutan (TK A = −1, TK B = 0, Kelas n = n) agar selisih dan rata-rata level benar; untuk Kelas 1–6 nilainya = nomor kelas.
  const lvPos = (g) => (g < 0 ? g + 1 : g), lvAt = (p) => (p <= 0 ? p - 1 : p), lvGap = (a, b) => lvPos(a) - lvPos(b);
  const lvStep = (g, k) => { const x = lvAt(lvPos(g) + k); return S.DIAG[x] ? x : null; };
  // Kelas sesuai usia, atau jenjang yang dipilih siswa SMP/SMA (d.cls). Data lama (usia 6–12) hasilnya tetap: 6–7 = Kelas 1, …, 12 = Kelas 6.
  const ageGradeOf = (d) => { if (d && typeof d === 'object') { if (d.cls) return d.cls; d = d.age; } return d <= 4 ? -2 : d === 5 ? -1 : Math.max(1, Math.min(13, d - 6)); };
  // Nama level untuk rata-rata (boleh pecahan): Kelas 1 ke atas tetap "Kelas 2,5"; di bawahnya dibulatkan ke TK terdekat
  const lvLabel = (p) => (Number.isInteger(p) ? gname(lvAt(p)) : p >= 1 ? 'Kelas ' + dec(p) : '≈ ' + gname(lvAt(Math.round(p))));
  // Asesmen awal dibuka seperti aplikasi belajar: sapaan Meti, usia, target harian, lalu soal satu per satu.
  let OB = null;
  const GOALS = [[5, 'Santai', '🌱'], [10, 'Biasa', '🚶'], [15, 'Serius', '🚀'], [20, 'Hebat', '🏆']];
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
      inner = bigSay('hello', OB.pf === 'a' ? `Hai, ${esc(st.name)}!<br>Aku <b class="hl">Meti</b>!` : `Hai lagi, ${esc(st.name)}!<br>Yuk lihat kemajuanmu!`, 190);
      foot = next('Lanjutkan') + (OB.pf === 'a' ? '<button class="mq-link" data-act="dskip">Lewati dulu</button>' : '');
    } else if (key === 'count') {
      inner = bigSay('cheer', 'Hanya <b class="hl">beberapa soal</b> singkat sebelum kita mulai belajar!<span class="sub">Ini bukan ujian, santai saja.</span>', 180);
      foot = next('Lanjutkan');
    } else if (key === 'age') {
      inner = `${rowSay('ask', 'Berapa <b class="hl">umurmu</b>?')}<div class="mq-ages many">${[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((a) => `<button class="mq-age ${OB.age === a ? 'sel' : ''}" data-act="obage" data-a="${a}"><b>${a}${a === 17 ? '+' : ''}</b><small>tahun</small></button>`).join('')}</div>`;
      foot = next('Lanjutkan', OB.age !== null);
    } else if (key === 'cls') {
      // usia saja tidak membedakan Aljabar 1, Geometri, Aljabar 2, Prakalkulus, dan Kalkulus
      inner = `${rowSay('ask', 'Sekarang kamu belajar <b class="hl">materi apa</b> di sekolah?')}<div class="mq-choices">${GRADES.filter((x) => x.id >= 7).map((x) => `<button class="mq-choice ${OB.cls === x.id ? 'sel' : ''}" data-act="obcls" data-g="${x.id}"><span class="em">${x.stage === 'SMA' ? '🎓' : '📘'}</span><span class="grow">${x.name}</span><span class="tag">${x.stage || ''}</span></button>`).join('')}</div>`;
      foot = next('Lanjutkan', OB.cls !== null);
    } else if (key === 'goal') {
      inner = `${rowSay('ask', 'Berapa menit kamu mau belajar <b class="hl">tiap hari</b>?')}<div class="mq-choices">${GOALS.map(([m, l, e]) => `<button class="mq-choice ${OB.goal === m ? 'sel' : ''}" data-act="obgoal" data-m="${m}"><span class="em">${e}</span><span class="grow">${m} menit / hari</span><span class="tag">${l}</span></button>`).join('')}</div>`;
      foot = next('Lanjutkan');
    } else if (key === 'gain') {
      inner = `${rowSay('happy', 'Ini yang bisa kamu <b class="hl">raih</b>!')}<div class="mq-gain"><div><span class="em">🧮</span><span><b>Jago berhitung</b><small>Soal pas dengan levelmu</small></span></div><div><span class="em">🎬</span><span><b>Paham caranya</b><small>Pelajaran beranimasi</small></span></div><div><span class="em">🔥</span><span><b>Rajin tiap hari</b><small>Kumpulkan hadiah</small></span></div></div>`;
      foot = next('Lanjutkan');
    } else {
      inner = bigSay('ask', OB.pf === 'a' ? 'Siap? <b class="hl">Ayo kita mulai!</b><span class="sub">Kalau belum tahu, tebak saja ya.</span>' : 'Siap? <b class="hl">Jawab semampumu ya!</b>', 180);
      foot = next('Mulai', true, 'pulse');
    }
    app.innerHTML = `<div class="mq-top"><button class="mq-ico" data-act="obback" aria-label="Kembali">${IC.back}</button><div class="mq-prog"><i style="width:${pct0}%"></i></div><span class="mq-ico"></span></div>
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
        <h1 class="mq-rtitle">${DMODE[pf].name} selesai!</h1><p class="mq-rsub">Kamu siap belajar di${lg.stage ? ` <b>${gname(dg.level)}</b>` : ''}</p>
        <div class="mq-stats3"><div class="mq-stat" style="--c:#e0a800"><small>${lg.stage || 'Kelas'}</small><b>${lg.short || dg.level}</b></div><div class="mq-stat" style="--c:#19b796"><small>Tepat</small><b>${acc}%</b></div><div class="mq-stat" style="--c:#1c9be8"><small>Waktu</small><b>${mmss(dg.ms)}</b></div></div>
        ${pre ? `<div class="mq-unlock">${gain > 0 ? `📈 Naik ${gain} kelas sejak asesmen awal!` : gain === 0 ? `Sama dengan asesmen awal (${gname(pre.level)}). Terus berlatih!` : `Asesmen awal: ${gname(pre.level)}. Tidak apa-apa, ayo berlatih lagi.`}</div>` : ''}
        ${!pre && lvGap(dg.level, ageGradeOf(dg)) > 0 ? '<div class="mq-unlock">⚡ Kamu menjawab cepat dan tepat, jadi levelmu di atas kelas untuk usiamu!</div>' : ''}
        <details class="mq-more"><summary>Lihat rinciannya ▾</summary>
          ${good.length ? `<section class="card"><h2>💪 Yang sudah kamu kuasai</h2><div class="diag-chips">${good.map((x) => `<span class="pill okp">${SKILLS[x.id].code} ${SKILLS[x.id].name}</span>`).join(' ')}</div></section>` : ''}
          ${slow.length ? `<section class="card"><h2>🐢 Benar, tapi perlu lebih lancar</h2><div class="sklist">${slow.map((x) => skillLink(x.id, prog[x.id], `${gname(SKILLS[x.id].grade)}`)).join('')}</div></section>` : ''}
          <section class="card"><h2>🎯 Yang perlu kamu pelajari</h2>${gaps.length ? `<div class="sklist">${gaps.map((x) => skillLink(x.id, prog[x.id], `${gname(SKILLS[x.id].grade)}`)).join('')}</div>` : `<p>Hebat! Semua soal kunci sudah benar. Lanjutkan ke bab pertama ${gname(dg.level)}.</p><div class="sklist">${first.skills.slice(0, 3).map((x) => skillLink(x.id, prog[x.id])).join('')}</div>`}</section>
        </details>
      </div></main>
      <div class="mq-foot"><div class="mq-foot-in"><a class="mq-btn pulse" href="#/belajar">Mulai belajar</a></div></div>`;
  }
  // Ringkasan asesmen awal (dan akhir bila ada) untuk laporan guru, orang tua, dan siswa
  function diagSummaryHTML(k, audience) {
    const dg = S.diagOf(k.id), post = S.diagOf(k.id, 'b'), pending = S.postPending(k.id), admin = audience === 'guru' && isAdminNow();
    if (!dg) return audience === 'guru' ? `<section class="card diag-sum"><h2>🧭 Asesmen awal</h2><p class="muted small">${esc(k.name)} belum mengerjakan asesmen awal. Asesmen muncul otomatis saat ${esc(k.name)} pertama kali masuk sebagai siswa.</p></section>` : '';
    const gaps = diagSkills(dg, false), good = diagSkills(dg, true), ag = ageGradeOf(dg), lag = lvGap(ag, dg.level), plag = post ? lvGap(ageGradeOf(post), post.level) : 0, pgain = post ? lvGap(post.level, dg.level) : 0;
    return `<section class="card diag-sum"><h2>🧭 Asesmen ${post || pending ? 'awal dan akhir' : 'awal'}</h2>
      <p>${audience === 'siswa' ? 'Kamu' : esc(k.name)} ditempatkan di <b>materi ${gname(dg.level)}</b> <span class="muted small">(usia ${dg.age} tahun${dg.cls ? ` · sedang belajar ${gname(dg.cls)}` : ''} · ${fdate(dg.at)} · ${good.length}/${dg.items.length} soal kunci benar)</span>.${audience !== 'siswa' && lag > 0 ? ` <span class="warnline small">Tertinggal ${lag} kelas dari ${dg.cls ? 'jenjang yang sedang ditempuh' : 'kelas sesuai usia'} (${gname(ag)}).</span>` : ''}</p>
      ${post ? `<p class="diag-gain">🏁 Asesmen akhir (${fdate(post.at)}): <b>${gname(post.level)}</b> · ${pgain > 0 ? `📈 naik ${pgain} kelas` : pgain === 0 ? 'belum berubah' : `turun ${-pgain} kelas`}${audience !== 'siswa' ? (plag <= 0 ? ' · ✅ sudah sesuai usia' : ` · masih ${plag} kelas di bawah usia`) : ''}</p>` : ''}
      ${pending ? `<p class="small muted">⏳ Asesmen akhir sudah dibuka admin dan menunggu ${esc(k.name)} mengerjakannya.</p>` : ''}
      ${gaps.length ? `<p class="small"><b>Perlu dipelajari (asesmen awal):</b> ${gaps.map((x) => `${SKILLS[x.id].code} ${SKILLS[x.id].name}${S.progress(k.id, x.id).score >= 80 ? ' ✅' : ''}`).join(' · ')}</p>` : '<p class="small">Semua soal kunci yang diberikan sudah dijawab benar.</p>'}
      ${good.length ? `<p class="small">⚡ <b>${good.filter((x) => x.fast).length}</b> dari ${good.length} jawaban benar dijawab cepat${good.some((x) => !x.fast) ? ` · 🐢 benar tapi lambat (perlu kelancaran): ${good.filter((x) => !x.fast).map((x) => SKILLS[x.id].code).join(', ')}` : ''}.</p>` : ''}
      ${audience !== 'siswa' && dg.items.filter((x) => x.guess).length >= 2 ? `<p class="small warnline">⚠️ ${dg.items.filter((x) => x.guess).length} jawaban salah diberikan sangat cepat (di bawah 3 detik). ${esc(k.name)} mungkin menebak.</p>` : ''}
      ${audience === 'guru' && gaps.length ? '<p class="small muted">✅ = sudah mahir setelah berlatih. Gunakan daftar ini untuk memberi tugas khusus.</p>' : ''}
      ${admin ? `<div class="row-btn left">${pending ? `<button class="btn sm ghost" data-act="postone" data-s="${k.id}" data-o="0">Batalkan asesmen akhir</button>` : `<button class="btn sm" data-act="postone" data-s="${k.id}" data-o="1">🏁 ${post ? 'Ulangi' : 'Buka'} asesmen akhir</button>`}<button class="btn sm ghost" data-act="diagreset" data-s="${k.id}">↻ Ulangi asesmen awal</button></div>` : ''}</section>`;
  }

  /* ---------- Grafik koordinator (khusus admin) ----------
   * Warna: dua slot kategori (biru, oranye) untuk kelas paralel; tangga biru satu-hue untuk ketertinggalan dan penguasaan.
   * Palet sudah diperiksa dengan validator (CVD & kontras). Setiap grafik punya legenda, label langsung, tooltip, dan tabel. */
  const VZ = { s1: '#2a78d6', s2: '#eb6834', s3: '#1baf7a', ord: ['#86b6ef', '#3987e5', '#256abf', '#104281'], none: '#e3e7e6', seq: ['#e8eef5', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#104281'], ink2: '#52514e', grid: '#e6ebe9' };
  const gradeOfClass = (s) => s.grade || +((s.c.name.match(/\d/) || [])[0]) || null;
  const shortName = (c) => (c.name.match(/\d+\s*[A-Za-z]?/) || [c.name])[0].replace(/\s+/g, '');
  const tip = (title, value) => `data-tip-t="${esc(title)}" data-tip-v="${esc(value)}" tabindex="0"`;
  const vzTable = (head, rows) => `<details class="vztable"><summary>Lihat sebagai tabel</summary><div class="tscroll"><table class="tbl"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  const legend = (items) => `<div class="vzlegend">${items.map(([c, l, kind]) => `<span><i class="${kind || ''}" style="--c:${c}"></i>${l}</span>`).join('')}</div>`;

  function chartsHTML(all) {
    const classes = all.filter((s) => s.n).map((s) => ({ ...s, g: gradeOfClass(s), short: shortName(s.c) })).sort((a, b) => (a.g || 9) - (b.g || 9) || a.short.localeCompare(b.short));
    if (!classes.length) return emptyCard('Belum ada data', 'Grafik muncul setelah kelas memiliki siswa.');
    return lagChart(classes) + parallelChart(classes) + heatmapChart(classes) + dumbbellChart(classes);
  }

  // 1. Sebaran ketertinggalan per kelas (batang bertumpuk 100%) dari asesmen terbaru tiap siswa
  function lagChart(classes) {
    const cats = [['Sesuai usia', VZ.ord[0]], ['Tertinggal 1 kelas', VZ.ord[1]], ['Tertinggal 2 kelas', VZ.ord[2]], ['Tertinggal ≥3 kelas', VZ.ord[3]], ['Belum asesmen', VZ.none]];
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
        return `<rect class="vzmark" x="${cx}" y="${y}" width="${Math.max(0, w)}" height="18" rx="${ci === 0 || x >= L + RW - 0.5 ? 4 : 0}" fill="${cats[ci][1]}" stroke="#fff" stroke-width="2" ${tip(`${d.s.c.name} · ${cats[ci][0]}`, `${v} dari ${d.n} siswa (${pct(v, d.n)}%)`)}/>${lbl}`;
      }).join('');
      return `<text x="${L - 6}" y="${y + 13}" text-anchor="end" font-size="11" font-weight="800" fill="#16302b">${esc(d.s.short)}</text>${segs}`;
    }).join('');
    const worst = data.slice().sort((a, b) => (b.cnt[2] + b.cnt[3]) / b.n - (a.cnt[2] + a.cnt[3]) / a.n)[0];
    return `<section class="card vz"><h2>1. Sebaran ketertinggalan per kelas</h2>
      <p class="small muted">Dari asesmen terbaru setiap siswa (akhir jika ada, jika tidak awal), dibandingkan dengan kelas sesuai usia. Semakin gelap, semakin jauh tertinggal.</p>
      ${legend(cats.map(([l, c]) => [c, l]))}
      <svg viewBox="0 0 ${W} ${H}" class="vzsvg" role="img" aria-label="Sebaran ketertinggalan per kelas">${bars}</svg>
      ${worst && worst.cnt[2] + worst.cnt[3] ? `<p class="small">Paling perlu intervensi: <b>${esc(worst.s.c.name)}</b>, ${worst.cnt[2] + worst.cnt[3]} dari ${worst.n} siswa tertinggal 2 kelas atau lebih.</p>` : ''}
      ${vzTable(['Kelas', ...cats.map((c) => c[0])], data.map((d) => [esc(d.s.c.name), ...d.cnt]))}</section>`;
  }

  // 2. Perbandingan kelas paralel per jenjang (batang berkelompok, satu ukuran dipilih)
  function parallelChart(classes) {
    const M = [['aktif', 'Siswa aktif', (s) => s.pActive], ['tepat', 'Ketepatan', (s) => (s.answered ? s.acc : null)], ['paham', 'Belum paham', (s) => s.pBehind], ['tugas', 'Tugas selesai', (s) => s.pDone]];
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
    const suffix = (i) => { const sx = classes.filter((s) => s.g).map((s) => s.short.replace(/^\d+/, '')).filter(Boolean); const u = [...new Set(sx)].sort(); return u[i] ? `Kelas paralel ${u[i]}` : `Kelas paralel ke-${i + 1}`; };
    return `<section class="card vz"><h2>2. Perbandingan kelas paralel</h2>
      <p class="small muted">Kelas pada jenjang yang sama mempelajari materi yang sama, jadi perbandingannya adil. Mengikuti periode di atas.</p>
      <div class="vzpills">${M.map(([k, l]) => `<button class="${k === m[0] ? 'on' : ''}" data-act="vizm" data-m="${k}">${l}</button>`).join('')}</div>
      ${legend([...Array(Math.min(3, maxSlots))].map((_, i) => [slotColor[i], suffix(i)]))}
      <svg viewBox="0 0 ${W} ${H}" class="vzsvg" role="img" aria-label="${m[1]} per kelas paralel">${o}</svg>
      <p class="small muted">${m[0] === 'paham' ? 'Lebih rendah lebih baik: persentase siswa yang minimal seperempat keterampilannya masih lemah.' : 'Lebih tinggi lebih baik.'}</p>
      ${vzTable(['Kelas', 'Jenjang', ...M.map((x) => x[1])], classes.map((s) => [esc(s.c.name), s.g || '–', ...M.map((x) => { const v = x[2](s); return v === null || v === undefined ? '–' : v + '%'; })]))}</section>`;
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
          o += `<rect class="vzmark" x="${L + j * cw + 1}" y="${y}" width="${cw - 2}" height="${cw}" rx="3" fill="${b < 0 ? VZ.none : VZ.seq[b]}" ${tip(`${s.c.name} · Bab ${u.id} ${u.name}`, b < 0 ? 'belum dicoba' : `rata-rata ${avg} · ${mahir}/${kids.length} siswa rata-rata ≥ 80`)}/>`;
        });
      });
      units.forEach((u, j) => { const a = unitAvg[j], m = Math.round(a.reduce((t, x) => t + x, 0) / a.length); if (m > 0 && m < 50) weak.push([g, u, m]); });
      return `<div class="vzhm"><b class="small">${gname(g)}</b><svg viewBox="0 0 ${W} ${H}" class="vzsvg" style="max-width:${W * 1.6}px" role="img" aria-label="Penguasaan bab kelas ${g}">${o}</svg></div>`;
    }).join('');
    const scale = [['belum dicoba', VZ.none], ['1–19', VZ.seq[1]], ['20–39', VZ.seq[2]], ['40–59', VZ.seq[3]], ['60–79', VZ.seq[4]], ['80–89', VZ.seq[5]], ['90–100', VZ.seq[6]]];
    weak.sort((a, b) => a[2] - b[2]);
    return `<section class="card vz"><h2>3. Peta penguasaan bab × kelas</h2>
      <p class="small muted">Rata-rata SmartScore setiap bab di setiap kelas (semua siswa kelas dihitung). Kolom = bab jenjang itu; ketuk kotak untuk rinciannya.</p>
      ${legend(scale.map(([l, c]) => [c, l]))}${blocks}
      ${weak.length ? `<p class="small"><b>Bab yang masih lemah (rata-rata &lt; 50):</b> ${weak.slice(0, 6).map(([g, u, m]) => `${gname(g)} · ${u.name} (${m})`).join(' · ')}</p>` : ''}
      ${vzTable(['Kelas', 'Bab', 'Rata-rata SmartScore'], classes.flatMap((s) => unitsOf(s.g || 1).map((u) => { const kids = S.studentsOf(s.c.id); return [esc(s.c.name), `${u.id} ${u.name}`, Math.round(kids.reduce((t, k) => t + unitScore(k.id, u).avg, 0) / (kids.length || 1))]; })))}</section>`;
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
    if (!rows.length) return `<section class="card vz"><h2>4. Asesmen awal → akhir</h2><p class="muted">Belum ada siswa yang mengerjakan asesmen awal.</p></section>`;
    // sumbu tetap Kelas 1–6 untuk data SD; melebar ke TK atau SMP/SMA hanya jika ada siswa di sana (posisi lvPos: TK A = −1, TK B = 0)
    const vals = rows.flatMap((r) => [r.pre, r.post, r.age]).filter((v) => v !== null), lo = Math.min(1, Math.floor(Math.min(...vals))), hi = Math.max(6, Math.ceil(Math.max(...vals)));
    const ticks = [...Array(hi - lo + 1)].map((_, i) => lo + i), wide = ticks.length > 6;
    const L = one ? 70 : 44, W = 340, RH = 24, H = rows.length * RH + 30, X = (v) => L + 12 + ((v - lo) / (hi - lo)) * (W - L - 30);
    let o = ticks.map((v) => `<line x1="${X(v)}" x2="${X(v)}" y1="4" y2="${H - 22}" stroke="${VZ.grid}"/><text x="${X(v)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="${VZ.ink2}">${wide ? gshort(lvAt(v)) : 'Kelas ' + v}</text>`).join('');
    rows.forEach((r, i) => {
      const y = 14 + i * RH, f1 = lvLabel;
      o += `<text x="${L - 6}" y="${y + 4}" text-anchor="end" font-size="10" font-weight="800" fill="#16302b">${esc(r.label.length > 9 ? r.label.slice(0, 9) + '…' : r.label)}</text>`;
      o += `<path d="M${X(r.age)} ${y - 8}v16" stroke="${VZ.s2}" stroke-width="3" stroke-linecap="round"/>`;
      if (r.post !== null) o += `<line x1="${X(r.pre)}" x2="${X(r.post)}" y1="${y}" y2="${y}" stroke="${VZ.ord[1]}" stroke-width="3" stroke-linecap="round"/>`;
      o += `<circle cx="${X(r.pre)}" cy="${y}" r="5" fill="#fff" stroke="${VZ.s1}" stroke-width="2.5"/>`;
      if (r.post !== null) o += `<circle cx="${X(r.post)}" cy="${y}" r="5.5" fill="${VZ.s1}" stroke="#fff" stroke-width="2"/>`;
      o += `<rect x="${L}" y="${y - 11}" width="${W - L}" height="22" fill="transparent" class="vzhit" ${tip(one ? r.label : `${r.label} · ${r.n} dari ${r.total} siswa sudah asesmen akhir`, `awal ${f1(r.pre)}${r.post !== null ? ` → akhir ${f1(r.post)} (${r.post - r.pre >= 0 ? '+' : ''}${dec(r.post - r.pre)})` : ' · belum asesmen akhir'} · sesuai usia ${f1(r.age)}`)}/>`;
    });
    const caught = one ? rows.filter((r) => r.post !== null && r.post >= r.age && r.pre < r.age).length : 0;
    return `<section class="card vz"><h2>4. Asesmen awal → akhir</h2>
      <p class="small muted">${one ? `Setiap baris satu siswa ${esc(one.c.name)}.` : 'Rata-rata level per kelas dari siswa yang sudah mengerjakan keduanya (jika belum ada asesmen akhir, hanya titik awal).'} Garis oranye = kelas sesuai usia: semakin dekat titik akhir ke garis itu, semakin terkejar ketertinggalannya.</p>
      <div class="vzpills"><button class="${one ? '' : 'on'}" data-act="vizdb" data-c="">Semua kelas</button>${classes.map((s) => `<button class="${one && one.c.id === s.c.id ? 'on' : ''}" data-act="vizdb" data-c="${s.c.id}">${esc(s.short)}</button>`).join('')}</div>
      ${legend([[VZ.s1, 'Awal', 'ring'], [VZ.s1, 'Akhir', 'dot'], [VZ.s2, 'Kelas sesuai usia', 'tick']])}
      <svg viewBox="0 0 ${W} ${H}" class="vzsvg" role="img" aria-label="Level asesmen awal dan akhir">${o}</svg>
      ${one && caught ? `<p class="small">🎯 ${caught} siswa sudah mengejar kelas sesuai usianya.</p>` : ''}
      ${vzTable([one ? 'Siswa' : 'Kelas', 'Awal', 'Akhir', 'Naik', 'Sesuai usia'], rows.map((r) => [esc(r.label), wide ? lvLabel(r.pre) : dec(r.pre), r.post === null ? '–' : wide ? lvLabel(r.post) : dec(r.post), r.post === null ? '–' : dec(r.post - r.pre), wide ? lvLabel(r.age) : dec(r.age)]))}</section>`;
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
    return `${n.d.by === 'ortu' ? 'dilaporkan orang tua' : prof === sk.length ? 'semua keterampilan mahir' : 'dikumpulkan siswa'} · ${prof}/${sk.length} mahir${sk.length ? ` (skor ${sc.join(', ')})` : ''}`;
  }
  // Siswa: kemajuan tugas dan tombol Kumpulkan (setelah mencoba setiap keterampilan minimal 5 soal, atau sudah mahir)
  function submitBar(a, prog) {
    const sk = a.skills.filter((k) => SKILLS[k]), p = (k) => prog[k] || {}, prof = sk.filter((k) => p(k).score >= 80).length;
    const ready = sk.every((k) => (p(k).att || 0) >= 5 || p(k).score >= 80), left = sk.filter((k) => !((p(k).att || 0) >= 5 || p(k).score >= 80));
    return `<div class="asgfoot"><span class="grow"><b>${prof}/${sk.length}</b> keterampilan mahir${ready ? '' : `<small class="muted">Kerjakan minimal 5 soal di ${left.map((k) => SKILLS[k].code).join(', ')} untuk bisa mengumpulkan</small>`}</span>
      ${ready ? `<button class="btn sm" data-act="submitasg" data-a="${a.id}">✅ Kumpulkan</button>` : ''}</div>`;
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
      const head = `Kelompok materi ${gname(g.lv)}`;
      return `<section class="card grp"><div class="lrow"><span class="gicon g-pasangan">${gshort(g.lv)}</span><span class="grow"><b>${head}</b><small>${g.kids.length} siswa${behind ? ` · ${behind} di bawah kelas sesuai usianya` : ''}</small></span></div>
        ${kidChips(g.kids)}
        ${sug.length ? `<form data-form="grouptask" data-sids="${g.kids.map((r) => r.k.id).join(',')}" class="form">
          <p class="small"><b>Saran tugas untuk kelompok ini</b> <span class="muted">(angka = banyak anggota yang belum mahir)</span></p>
          ${sug.map((x, i) => `<label class="cb"><input type="checkbox" name="sk" value="${x.id}" ${i < 3 ? 'checked' : ''}> ${SKILLS[x.id].code} ${SKILLS[x.id].name} <span class="pill">${x.need}/${g.kids.length}</span></label>`).join('')}
          <div class="grow2"><label>Catatan<input name="note" maxlength="120" value="${esc(head)}: latihan bersama"></label><label>Tenggat (opsional)<input name="due" type="date"></label></div>
          <button class="btn sm">📌 Beri tugas untuk ${g.kids.length} siswa ini</button></form>`
        : '<p class="small muted">Semua anggota sudah mahir di keterampilan kunci level ini. Pertimbangkan materi kelas berikutnya.</p>'}</section>`;
    };
    return `<section class="card"><h2>👥 Kelompok belajar</h2>
        <p class="small muted">Siswa dikelompokkan menurut level dari asesmen terbaru (asesmen akhir jika ada, jika tidak asesmen awal). Tugas kelompok hanya terlihat oleh anggota kelompok, sehingga setiap anak berlatih sesuai levelnya. Angka −1, −2 di samping nama = berapa kelas di bawah kelas sesuai usianya.</p>
        <div class="kpis">${groups.map((g) => `<div class="kpi"><small>Materi ${gname(g.lv)}</small><b>${g.kids.length}<span> siswa</span></b></div>`).join('')}${none.length ? `<div class="kpi"><small>Belum asesmen</small><b>${none.length}</b></div>` : ''}</div></section>
      ${groups.map(card).join('') || emptyCard('Belum ada hasil asesmen', 'Kelompok muncul setelah siswa mengerjakan asesmen awal. Asesmen muncul otomatis saat siswa pertama kali masuk.')}
      ${none.length ? `<section class="card grp"><div class="lrow"><span class="gicon g-pasangan">?</span><span class="grow"><b>Belum mengerjakan asesmen</b><small>${none.length} siswa. Asesmen awal muncul otomatis saat mereka masuk berikutnya.</small></span></div>${kidChips(none)}</section>` : ''}`;
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
    return `<section class="card"><h2>🧭 Asesmen awal dan akhir</h2>
        <p class="small">Asesmen awal (pretest) dikerjakan otomatis saat siswa pertama kali masuk. Asesmen akhir (posttest) memakai prosedur yang sama dan hanya bisa dibuka oleh admin. Hasil keduanya disimpan terpisah, sehingga hasil awal tidak pernah tertimpa.</p>
        <div class="kpis"><div class="kpi"><small>Sudah asesmen awal</small><b>${rows.filter((r) => r.pre).length}<span>/${rows.length}</span></b></div><div class="kpi"><small>Sudah asesmen akhir</small><b>${both.length}<span> · ${rows.filter((r) => r.pending).length}⏳</span></b></div>
          <div class="kpi"><small>Rata-rata kelas: awal → akhir</small><b class="sm">${mean(both.map((r) => lvPos(r.pre.level)))} → ${mean(both.map((r) => lvPos(r.post.level)))}</b></div><div class="kpi"><small>Sesuai usia: awal → akhir</small><b class="sm">${both.length ? `${atAge(both, 'pre')} → ${atAge(both, 'post')} dari ${both.length}` : '–'}</b></div></div>
        <p class="small muted">Rata-rata dan "sesuai usia" dihitung dari siswa yang sudah mengerjakan keduanya. Kelas sesuai usia: 4 tahun = TK A, 5 = TK B, 6–7 tahun = Kelas 1, 8 = Kelas 2, …, 11 = Kelas 5, 12 = Kelas 6. Siswa 13 tahun ke atas memilih sendiri jenjang yang sedang ditempuh (Kelas 7 sampai Kalkulus). Naik dan tertinggal dihitung menurut urutan TK A, TK B, Kelas 1, …, Kelas 8, Aljabar 1, Geometri, Aljabar 2, Prakalkulus, Kalkulus.</p></section>
      ${all.map((s) => { const rs = prepostRows(S.studentsOf(s.c.id)), canOpen = rs.filter((r) => r.pre && !r.pending); return `<section class="card"><div class="lrow"><span class="grow"><b>${esc(s.c.name)}</b><small>${esc(s.c.teacherName || '')} · ${rs.filter((r) => r.pre).length}/${rs.length} sudah asesmen awal</small></span>${canOpen.length ? `<button class="btn sm" data-act="postclass" data-c="${s.c.id}">🏁 Buka asesmen akhir (${canOpen.length})</button>` : ''}</div>
        <div class="tscroll"><table class="tbl"><thead><tr><th>Siswa</th><th>Usia</th><th>Sesuai usia</th><th>Awal</th><th>Akhir</th><th>Naik</th><th>Status</th><th></th></tr></thead><tbody>
        ${rs.map((r) => `<tr><td><a href="#/guru/siswa/${r.k.id}" data-act="openkid" data-id="${s.c.id}" data-s="${r.k.id}">${avHTML(r.k.avatar)} ${esc(r.k.name)}</a></td><td>${(r.post || r.pre || {}).age || '–'}</td><td>${r.ag ? gname(r.ag) : '–'}</td><td>${cell(r.pre)}</td><td>${r.pending ? '⏳ dibuka' : cell(r.post)}</td>
          <td>${r.gain === null ? '–' : `<b class="${r.gain > 0 ? 'okc' : ''}">${r.gain > 0 ? '+' : ''}${r.gain}</b>`}</td>
          <td>${!r.pre ? '<span class="muted">belum asesmen</span>' : (() => { const d = r.post || r.pre, gap = lvGap(ageGradeOf(d), d.level); return gap > 0 ? `<span class="accb ${gap >= 2 ? 'r' : 'y'}">tertinggal ${gap}</span>` : '<span class="accb g">sesuai usia</span>'; })()}</td>
          <td>${r.pre ? (r.pending ? `<button class="link small" data-act="postone" data-s="${r.k.id}" data-o="0">Batalkan</button>` : `<button class="link small" data-act="postone" data-s="${r.k.id}" data-o="1">${r.post ? 'Ulangi' : 'Buka'}</button>`) : ''}</td></tr>`).join('')}
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
        <div class="mq-big-say"><div class="mq-bubble"><p>Hai! Siapa <b class="hl">namamu</b>?</p></div>${MQ.svg('hello', { size: 160 })}</div>
        ${kids.length ? `<div class="mq-choices">${kids.map((d) => `<button type="button" class="mq-choice" data-act="trykid" data-s="${d.sid}"><span class="em">▶</span><span class="grow">Lanjut sebagai ${esc(d.name)}</span></button>`).join('')}</div><p class="mq-hint">atau mulai dengan nama baru:</p>` : ''}
        <input class="mq-code" style="letter-spacing:0;text-indent:0;text-transform:none;font-size:1.5rem" name="name" required maxlength="40" placeholder="Ketik namamu" autocomplete="off" value="${kids.length ? '' : esc(t0.role === 'siswa' ? t0.name || '' : '')}" aria-label="Namamu">
        <p class="small muted" style="margin:6px 0 0">Mode coba memakai data contoh dan hanya tersimpan di HP ini. Namamu dan aktivitas mencoba dicatat untuk pengembangan Metiq.</p>
      </div></main><div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn pulse">Mulai</button></div></div></form>`;
      return;
    }
    const t = tryInfo() || {}, same = t.role === role, nm = same ? t.name || '' : '';
    const title = { siswa: '🧒 Coba sebagai siswa', ortu: '👨‍👩‍👧 Coba sebagai orang tua', guru: '👩‍🏫 Coba sebagai guru' }[role];
    app.innerHTML = shell(`<a class="back" href="#/">← Kembali</a>
      <section class="card narrow"><h1 class="center">${title}</h1>
        <p class="muted center small">Mode coba memakai data contoh satu sekolah. Tulis namamu supaya Metiq terasa milikmu sendiri.</p>
        ${role === 'siswa' && deviceKids().length ? `<div class="trykids"><p class="small"><b>Sudah pernah mencoba di HP ini?</b></p>${deviceKids().map((d) => `<button class="btn ghost" data-act="trykid" data-s="${d.sid}">▶ Lanjut sebagai ${esc(d.name)}</button>`).join('')}<p class="small muted">Atau anak lain (kakak/adik) mulai dengan namanya sendiri:</p></div>` : ''}
        <form data-form="trystart" data-r="${role}" class="form">
          <label>${role === 'siswa' ? (deviceKids().length ? 'Nama anak baru' : 'Namamu') : 'Nama Anda'}<input name="name" required maxlength="40" value="${role === 'siswa' && deviceKids().length ? '' : esc(nm)}" placeholder="${role === 'siswa' ? 'mis. Raka' : role === 'ortu' ? 'mis. Bu Sinta' : 'mis. Bu Rina'}" autocomplete="off"></label>
          ${role === 'ortu' && deviceKids().length ? `<fieldset class="trylink"><legend>🔗 Anak yang sudah mencoba di perangkat ini</legend>${deviceKids().map((d) => `<label class="cb"><input type="checkbox" name="link" value="${d.sid}" checked><span>Lihat hasil <b>${esc(d.name)}</b></span></label>`).join('')}</fieldset>` : ''}
          ${role === 'ortu' ? `<label>Nama anak <small class="muted">(${deviceKids().length ? 'jika tidak ada yang dicentang, ' : ''}untuk laporan contoh)</small><input name="child" maxlength="40" value="${esc(same ? t.child || '' : '')}" placeholder="mis. Alya" autocomplete="off"></label>` : ''}
          <button class="btn">Mulai mencoba →</button>
        </form>
        <p class="small muted trynote">Untuk membantu pengembangan Metiq, nama yang kamu tulis dan aktivitas di mode coba (halaman yang dibuka, soal, permainan) dicatat. Tidak ada data pribadi lain yang diminta.</p></section>`);
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
    if (role === 'guru') { if (name) S.renameTeacher(t.id, name); session.set({ role: 'guru', id: t.id, demo: true }); toast(`Selamat datang, ${esc(name || 'Bu/Pak Guru')}!`); return go('#/guru/ringkasan'); }
    if (role === 'ortu') {
      const mine = deviceKids().filter((d) => (links || []).includes(d.sid));
      if (mine.length) {
        setTry({ role, name, child: mine.map((d) => d.name).join(', ') });
        session.set({ role: 'ortu', id: mine[0].sid, kids: mine.map((d) => d.sid), demo: true });
        toast(`Selamat datang, ${esc(name || 'Ayah/Bunda')}!`);
        return go(mine.length > 1 ? '#/ortu/anak' : '#/ortu/laporan');
      }
      const k = kids.find((x) => x.name === 'Alya') || kids[0];
      if (child) S.renameStudent(k.id, child);
      session.set({ role: 'ortu', id: k.id, demo: true }); toast(`Selamat datang, ${esc(name || 'Ayah/Bunda')}!`); return go('#/ortu/laporan');
    }
    // siswa: akun siswa contoh baru dengan namanya sendiri (mulai dari asesmen awal)
    // lanjut sebagai anak yang sudah ada, atau anak baru (anak dengan nama sama di perangkat ini dipakai lagi)
    const again = sid ? deviceKids().find((d) => d.sid === sid) : deviceKids().find((d) => d.name.toLowerCase() === name.toLowerCase());
    const k = again ? S.student(again.sid) : S.addStudent(c.id, name || 'Siswa');
    saveDeviceKid(k.id, k.name);
    setTry({ role, name: k.name, child, sid: k.id });
    session.set({ role: 'siswa', id: k.id, code: c.code, demo: true });
    go('#/belajar');
  }

  function realTeacherCard() {
    return `<details class="card realcard"><summary><b>🚀 Siap dipakai dengan murid sungguhan?</b> <span class="muted small">Ketuk untuk langkahnya</span></summary>
      <p class="small">Mode coba hanya berisi kelas contoh di perangkat ini. Untuk murid dan orang tua sungguhan, daftar sebagai guru, <b>gratis</b> dan sekitar 2 menit:</p>
      <ol class="small"><li>Ketuk <b>Daftar guru gratis</b>, isi nama, email, kata sandi, dan nama kelas.</li>
        <li>Tambahkan nama murid di <b>Kelola kelas</b>, lalu bagikan <b>kode kelas</b> (5 huruf) ke murid. Murid masuk lewat <i>Saya Siswa</i> dan memilih namanya.</li>
        <li>Setiap murid punya <b>kode orang tua</b> (6 huruf/angka) di Kelola kelas. Bagikan ke wali murid agar mereka bisa melihat laporan dan notifikasi tugas.</li></ol>
      <p class="small muted">Semua data kelas sungguhan tersimpan di server dan terhubung antar perangkat. Data mode coba tidak ikut pindah.</p>
      <div class="row-btn left"><button class="btn" data-act="realsignup" data-k="guru">Daftar guru gratis →</button><button class="btn ghost" data-act="realsignup" data-k="homeschool">Keluarga homeschool →</button></div></details>`;
  }
  function realParentCard(k) {
    const linked = deviceKids().some((d) => d.sid === k.id);
    return `<section class="card realcard"><h2>👨‍👩‍👧 ${linked ? `Ini hasil ${esc(k.name)} di perangkat ini` : 'Ini laporan contoh'}</h2>
      <p class="small">${linked ? `Laporan ini berisi asesmen, latihan, dan permainan yang dikerjakan ${esc(k.name)} saat mencoba sebagai siswa di perangkat ini.` : 'Laporan ini memakai data contoh.'}
        Jika anak Anda sudah memakai Metiq di sekolah, minta <b>kode orang tua</b> (6 huruf/angka) kepada gurunya, lalu ketuk <b>Keluar</b> dan masukkan kode itu di <i>Saya Orang Tua</i>. Laporan sungguhan akan terhubung di HP mana pun.</p>
      <div class="row-btn left"><button class="btn sm" data-act="realsignup" data-k="ortu">Ajukan akun orang tua →</button><button class="btn sm ghost" data-act="logout">Keluar dari mode coba</button></div></section>`;
  }

  /* ---------- Pengajuan akun sungguhan (disetujui super admin) ---------- */
  const REQ = {
    guru: { icon: '👩‍🏫', title: 'Guru', desc: 'Gratis dan langsung aktif, tanpa menunggu persetujuan. Untuk guru sekolah, guru les, atau siapa pun yang mengajar matematika.' },
    homeschool: { icon: '🏡', title: 'Keluarga homeschooling', desc: 'Gratis: daftar sebagai guru, lalu tambahkan anak-anak Anda di tab Siswa.' },
    ortu: { icon: '👨‍👩‍👧', title: 'Orang tua', desc: 'Anak sudah belajar dengan guru di Metiq. Satu akun untuk melihat laporan semua anak.' },
    siswa: { icon: '🧒', title: 'Siswa', desc: 'Belum punya kode kelas dari guru. Admin Metiq akan menempatkanmu di kelas yang sesuai.' },
  };
  const myRequests = () => ls.get('metiq_requests', []);
  function saveRequest(r, name) { const list = myRequests().filter((x) => x.code !== r.code); list.unshift({ code: r.code, kind: r.kind, name: name || '', at: Date.now() }); ls.set('metiq_requests', list.slice(0, 10)); }
  function viewRequestChooser() {
    app.innerHTML = shell(`<a class="back" href="#/">← Kembali</a><h1>✋ Ajukan akun Metiq</h1>
      <p class="muted">Akun sungguhan menyimpan data di server dan bisa dibuka dari HP mana pun. Setiap pengajuan diperiksa admin Metiq, biasanya dalam 1–2 hari.</p>
      <div class="glist">${Object.entries(REQ).filter(([k]) => (PARENTS_ON || k !== 'ortu') && k !== 'siswa').map(([k, r]) => `<a class="card gitem" href="${k === 'guru' || k === 'homeschool' ? '#/guru/daftar' : '#/ajukan/' + k}"><span class="gicon g-pasangan">${r.icon}</span><span class="grow"><b>${r.title}</b><small>${r.desc}</small></span>→</a>`).join('')}</div>
      <a class="card gitem" href="#/harga"><span class="gicon g-garis">🏫</span><span class="grow"><b>Sekolah (banyak kelas)</b><small>Paket Sekolah: dasbor dan laporan sekolah, admin mengelola guru, asesmen awal–akhir. Rp15.000 per siswa per tahun.</small></span>→</a>
      <a class="card gitem" href="#/siswa-baru"><span class="gicon g-garis">🧒</span><span class="grow"><b>Siswa</b><small>Tidak perlu mengajukan. Langsung mulai belajar dengan nama, lalu gabung kelas dengan kode dari guru.</small></span>→</a>
      <p class="center small"><a href="#/ajukan/status">Sudah mengajukan? Cek status →</a></p>`);
  }
  function viewRequestForm(kind) {
    if ((kind === 'guru' || kind === 'homeschool') && cloudOn()) return go('#/guru/daftar');
    if (kind === 'ortu' && !PARENTS_ON) return go('#/ajukan');
    if (kind === 'siswa') return go('#/siswa-baru');
    const r = REQ[kind]; if (!r) return go('#/ajukan');
    const t = tryInfo() || {}, nm = t.name || '';
    const acct = `<label>Email<input name="email" type="email" required autocomplete="email"></label>
      <label>Kata sandi untuk masuk nanti (min. 6 karakter)<input name="pass" type="password" minlength="6" required autocomplete="new-password"></label>
      <label>No. WhatsApp <small class="muted">(opsional, untuk dihubungi admin)</small><input name="contact" inputmode="tel" maxlength="20" placeholder="08…"></label>`;
    const fields = {
      guru: `<div class="kindwarn"><b>👨‍👩‍👧 Anda orang tua?</b> Akun guru hanya untuk yang mengajar kelas di sekolah atau kuttab. Pilih yang sesuai:
          <ul><li>Anak sudah belajar dengan guru di Metiq → <a href="#/ajukan/ortu">Orang tua</a> (atau cukup minta <b>kode orang tua</b> ke gurunya)</li>
          <li>Anak belum punya kelas → <a href="#/ajukan/siswa">Siswa</a></li>
          <li>Mengajar anak sendiri di rumah → <a href="#/ajukan/homeschool">Keluarga homeschooling</a></li></ul></div>
        <label>Nama guru<input name="name" required maxlength="80" value="${esc(nm)}" placeholder="mis. Bu Rina"></label>${acct}
        <label>Nama sekolah / kuttab<input name="school" required maxlength="100" placeholder="mis. SD Harapan Bangsa"></label>
        <label>Nama kelas pertama<input name="className" maxlength="60" placeholder="mis. Kelas 3A"></label>`,
      homeschool: `<label>Nama orang tua<input name="name" required maxlength="80" value="${esc(nm)}" placeholder="mis. Bu Sinta"></label>${acct}
        <label>Nama keluarga<input name="school" required maxlength="100" placeholder="mis. Keluarga Rahman"></label>
        <label>Nama anak-anak <small class="muted">(satu nama per baris, akun siswa dibuatkan otomatis)</small><textarea name="children" rows="3" maxlength="400" placeholder="Raka&#10;Nadia">${esc((deviceKids() || []).map((d) => d.name).join('\n'))}</textarea></label>`,
      ortu: `<label>Nama orang tua<input name="name" required maxlength="80" value="${esc(nm)}" placeholder="mis. Ayah Bima"></label>${acct}
        <label>Nama anak dan sekolahnya <small class="muted">(opsional)</small><input name="school" maxlength="100" placeholder="mis. Bima, Kelas 2 Kuttab Al-Ghazali"></label>
        <p class="small muted">Setelah disetujui, tambahkan anak dengan <b>kode orang tua</b> dari gurunya. Jika anak belum punya guru di Metiq, pilih pengajuan Siswa atau Keluarga homeschooling.</p>`,
      siswa: `<label>Nama siswa<input name="name" required maxlength="80" value="${esc(deviceKids().length ? deviceKids()[0].name : nm)}" placeholder="mis. Raka"></label>
        <label>Usia<select name="age">${[6, 7, 8, 9, 10, 11, 12].map((a) => `<option value="${a}">${a}${a === 12 ? '+' : ''} tahun</option>`).join('')}</select></label>
        <label>Sekolah / kuttab sekarang <small class="muted">(opsional)</small><input name="school" maxlength="100" placeholder="mis. MI Al-Ikhlas"></label>
        <label>No. WhatsApp atau email orang tua<input name="contact" required maxlength="120" placeholder="08… atau email"></label>`,
    }[kind];
    app.innerHTML = shell(`<a class="back" href="#/ajukan">← Pilih jenis akun</a>
      <section class="card narrow"><div class="bigemoji center">${r.icon}</div><h1 class="center">Ajukan akun: ${r.title}</h1><p class="muted small center">${r.desc}</p>
        <form data-form="request" data-k="${kind}" class="form">${fields}
          <label>Catatan untuk admin <small class="muted">(opsional)</small><textarea name="note" rows="2" maxlength="300"></textarea></label>
          ${kind === 'guru' ? '<label class="cb"><input type="checkbox" name="isteacher" required> <span>Saya guru yang mengajar kelas di sekolah atau kuttab (bukan orang tua murid).</span></label>' : ''}
          ${kind === 'guru' ? '<details class="small"><summary>Punya kode admin Metiq?</summary><label>Kode admin<input name="admin" autocomplete="off" autocapitalize="characters"></label></details>' : ''}
          <button class="btn">Kirim pengajuan</button></form>
        <p class="small muted center">Data mode coba tidak ikut pindah. Setelah dikirim, kamu mendapat <b>kode pengajuan</b> untuk mengecek statusnya.</p></section>`);
  }
  async function submitRequest(f, fd) {
    if (!Cloud.enabled) return toast('Pengajuan perlu koneksi ke server Metiq');
    const kind = f.dataset.k, btn = f.querySelector('button.btn'); if (btn) btn.disabled = true;
    const fail = (e) => { if (btn) btn.disabled = false; toast(e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); };
    const name = String(fd.get('name') || '').trim();
    try {
      let r;
      if (kind === 'guru' && String(fd.get('admin') || '').trim()) {
        r = await Cloud.rpc('teacher_register', { p_name: name, p_email: fd.get('email'), p_password: fd.get('pass'), p_class_name: fd.get('className') || 'Kelas 1', p_admin_code: String(fd.get('admin')).trim() });
        if (r.token) { session.set({ role: 'guru', id: r.teacherId, token: r.token }); return go('#/guru/kelola'); }
      } else {
        const details = { note: fd.get('note') || '' };
        if (kind === 'guru') details.className = fd.get('className') || '';
        if (kind === 'homeschool') { details.children = String(fd.get('children') || '').split(/[\n,]/).map((x) => x.trim()).filter(Boolean).slice(0, 10); details.className = 'Kelas ' + String(fd.get('school') || name).trim(); }
        if (kind === 'siswa') details.age = +fd.get('age');
        if (kind !== 'siswa' && tryInfo()) details.trial = (tryInfo() || {}).vid;
        r = await Cloud.rpc('request_submit', { p_kind: kind, p_name: name, p_email: kind === 'siswa' ? null : fd.get('email'), p_password: kind === 'siswa' ? null : fd.get('pass'), p_contact: fd.get('contact') || null, p_school: fd.get('school') || null, p_details: details });
      }
      saveRequest(r, name); session.set({}); toast('Pengajuan terkirim ✔'); go('#/ajukan/status/' + r.code);
    } catch (e) {
      // server belum menjalankan SQL 008: guru dan orang tua tetap bisa mendaftar dengan cara lama (langsung aktif)
      if (e.status === 404 && (kind === 'guru' || kind === 'ortu')) {
        try {
          if (kind === 'guru') { const r = await Cloud.rpc('teacher_register', { p_name: name, p_email: fd.get('email'), p_password: fd.get('pass'), p_class_name: fd.get('className') || 'Kelas 1' }); session.set({ role: 'guru', id: r.teacherId, token: r.token }); return go('#/guru/kelola'); }
          const r = await Cloud.rpc('parent_register', { p_name: name, p_email: fd.get('email'), p_password: fd.get('pass') }); session.set({ role: 'ortu', ptoken: r.token, pid: r.parentId }); return go('#/ortu/anak');
        } catch (e2) { return fail(e2); }
      }
      if (e.status === 404) { if (btn) btn.disabled = false; return toast('Pengajuan ini belum bisa diterima server. Coba lagi nanti atau hubungi admin Metiq.'); }
      fail(e);
    }
  }
  async function viewRequestStatus(code) {
    const codes = [...new Set([code, ...myRequests().map((x) => x.code)].filter(Boolean))];
    app.innerHTML = shell(`<a class="back" href="#/ajukan">← Ajukan akun</a><h1>📨 Status pengajuan</h1><div id="reqlist">${codes.length ? loadingHTML : ''}</div>
      <section class="card"><h2>Cek dengan kode pengajuan</h2><form data-form="reqcheck" class="form inline"><input name="code" class="codein sm" maxlength="8" autocapitalize="characters" placeholder="ABCD2345" required><button class="btn">Cek</button></form></section>`);
    if (!codes.length) return;
    const rows = await Promise.all(codes.map((c) => Cloud.rpc('request_status', { p_code: c }).catch(() => null)));
    const box = document.getElementById('reqlist'); if (!box) return;
    box.innerHTML = rows.map((r, i) => {
      if (!r) return `<section class="card"><p>Kode <b class="code">${esc(codes[i])}</b> tidak ditemukan.</p></section>`;
      const k = REQ[r.kind] || {}, res = r.result || {}, badge = { menunggu: '⏳ Menunggu persetujuan', disetujui: '✅ Disetujui', ditolak: '❌ Tidak disetujui' }[r.status];
      let next = '';
      if (r.status === 'menunggu') next = '<p class="small muted">Admin Metiq akan memeriksa pengajuanmu. Buka halaman ini lagi nanti; kode pengajuanmu tersimpan di perangkat ini.</p>';
      if (r.status === 'disetujui' && (r.kind === 'guru' || r.kind === 'homeschool')) next = `<p>Silakan masuk dengan email dan kata sandi yang kamu buat. Kelasmu: <b>${esc(res.className || '')}</b> · kode kelas <b class="code">${esc(res.classCode || '')}</b>${res.schoolName ? ` · ${esc(res.schoolName)}` : ''}.</p>${(res.children || []).length ? `<p class="small">Akun anak: ${res.children.map((c) => `${esc(c.name)} (kode orang tua <b class="code">${esc(c.parentCode)}</b>)`).join(' · ')}</p>` : ''}<div class="row-btn left"><a class="btn" href="#/guru/masuk">Masuk sebagai guru →</a></div>`;
      if (r.status === 'disetujui' && r.kind === 'ortu') next = '<p>Silakan masuk dengan email dan kata sandi yang kamu buat, lalu tambahkan anak dengan kode orang tua dari gurunya.</p><div class="row-btn left"><a class="btn" href="#/ortu">Masuk sebagai orang tua →</a></div>';
      if (r.status === 'disetujui' && r.kind === 'siswa') next = `<p>${res.classCode ? `Kelasmu: <b>${esc(res.className || '')}</b>.` : 'Kamu bisa langsung belajar, belum perlu kelas.'} Simpan kode ini:</p><div class="kpis"><div class="kpi"><small>${res.classCode ? 'Kode kelas (untuk siswa)' : 'Kode belajar (untuk siswa)'}</small><b class="code">${esc(res.classCode || res.learnCode || '')}</b></div><div class="kpi"><small>Kode orang tua</small><b class="code">${esc(res.parentCode || '')}</b></div></div><div class="row-btn left"><button class="btn" data-act="reqlogin" data-r="${esc(JSON.stringify({ studentId: res.studentId, classCode: res.classCode || res.learnCode }))}">Masuk sebagai ${esc(res.studentName || r.name)} →</button></div>`;
      if (r.status === 'ditolak') next = `<p class="small">${r.note ? 'Catatan admin: ' + esc(r.note) : 'Hubungi admin Metiq jika ada pertanyaan.'}</p>`;
      return `<section class="card reqcard ${r.status}"><div class="lrow"><span class="gicon g-pasangan">${k.icon || '✋'}</span><span class="grow"><b>${esc(r.name)}</b><small>${k.title || r.kind} · kode <b class="code">${esc(r.code)}</b> · ${ftime(r.createdAt)}</small></span></div><p><b>${badge}</b></p>${next}</section>`;
    }).join('');
  }

  /* ---------- Super admin: pengajuan, sekolah, dan guru di semua sekolah ---------- */
  let SUP = null;
  async function loadSuper(ctx, sub) {
    const box = document.getElementById('super-box'); if (!box) return;
    try {
      const tok = session.get().token;
      const [ov, rq, parents, plans, quotes] = await Promise.all([Cloud.rpc('super_overview', { p_token: tok }), Cloud.rpc('super_requests', { p_token: tok }), Cloud.rpc('super_parents', { p_token: tok }).catch(() => []), Cloud.rpc('super_school_plans', { p_token: tok }).catch(() => null), Cloud.rpc('super_quotes', { p_token: tok }).catch(() => null)]);
      SUP = { ov, rq, ctx, parents, plans, quotes };
      if (document.getElementById('super-box')) box.innerHTML = superHTML(sub);
    } catch (e) {
      box.innerHTML = e.status === 404 ? emptyCard('Perlu menjalankan SQL 008', 'Jalankan supabase/006_research_feedback_bbo.sql lalu 008_schools_superadmin.sql di SQL Editor Supabase.') : emptyCard('Gagal memuat', e.status ? esc(e.message) : 'Tidak bisa terhubung ke server.');
    }
  }
  function waLink(contact, text) {
    const d = String(contact || '').replace(/\D/g, ''); if (d.length < 9) return '';
    return `https://wa.me/${d.startsWith('0') ? '62' + d.slice(1) : d}?text=${encodeURIComponent(text)}`;
  }

  // Super admin: status paket setiap sekolah
  const planOf = (id) => (SUP && SUP.plans ? SUP.plans[id] : null);
  const planPill = (id) => { const p = planOf(id); if (!p) return '<span class="muted small">–</span>'; return p.active ? `<span class="pill ok">Sekolah${p.until ? ` · s.d. ${esc(String(p.until))}` : ''}</span>` : `<span class="pill">${p.plan === 'sekolah' ? 'Kedaluwarsa' : 'Gratis'}</span>`; };
  function planCardHTML(schools) {
    if (!SUP.plans) return '<section class="card"><h2>💳 Paket sekolah</h2><p class="muted small">Jalankan supabase/020_paket_sekolah.sql untuk mengatur paket.</p></section>';
    const list = schools.filter((s) => s.kind === 'sekolah');
    return `<section class="card"><h2>💳 Paket sekolah</h2><p class="small muted">Aktifkan paket Sekolah setelah pembayaran diterima (${rp(PRICE)} per siswa per tahun). Paket membuka dasbor sekolah, Kelola guru, dan asesmen awal–akhir untuk admin sekolah.</p>
      ${list.map((s) => { const p = planOf(s.id) || {}; return `<form data-form="schoolplan" data-id="${s.id}" class="form planrow"><b>${esc(s.name)}</b><small class="muted">${s.students} siswa${p.students ? ` · dibayar ${p.students}` : ''}</small>
        <select name="plan" aria-label="Paket ${esc(s.name)}"><option value="gratis" ${p.plan !== 'sekolah' ? 'selected' : ''}>Gratis</option><option value="sekolah" ${p.plan === 'sekolah' ? 'selected' : ''}>Sekolah</option></select>
        <label>Sampai<input name="until" type="date" value="${p.until || ''}"></label><label>Siswa dibayar<input name="students" type="number" min="0" value="${p.students || ''}" inputmode="numeric"></label>
        <input name="note" maxlength="200" placeholder="Catatan (mis. lunas 3 Nov)" value="${esc(p.note || '')}"><button class="btn sm">Simpan</button></form>`; }).join('')}</section>`;
  }
  function superHTML(sub) {
    sub = ['pengajuan', 'sekolah', 'kelas', 'guru', 'ortu', 'penawaran'].includes(sub) ? sub : 'pengajuan';
    const { ov, rq } = SUP, pend = rq.filter((r) => r.status === 'menunggu'), schools = ov.schools || [];
    const kpi = (l, v) => `<div class="kpi"><small>${l}</small><b>${v}</b></div>`;
    const sum = (k) => schools.reduce((t, s) => t + (s[k] || 0), 0);
    const subs = [['pengajuan', `✋ Pengajuan${pend.length ? ` (${pend.length})` : ''}`], ['sekolah', '🏫 Sekolah & keluarga'], ['kelas', '📚 Kelas'], ['guru', '👩‍🏫 Guru'], ['ortu', '👨‍👩‍👧 Orang tua'], ['penawaran', `📨 Penawaran${(SUP.quotes || []).filter((q) => q.status === 'baru').length ? ` (${(SUP.quotes || []).filter((q) => q.status === 'baru').length})` : ''}`]];
    let body = '';
    if (sub === 'pengajuan') {
      const schoolOpts = (want) => `<option value="">➕ Sekolah baru (nama di bawah)</option>${schools.filter((s) => s.kind === 'sekolah').map((s) => `<option value="${s.id}" ${want && s.name.toLowerCase() === want.toLowerCase() ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}`;
      const classOpts = SUP.ctx.classes.slice().sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || '') || a.name.localeCompare(b.name)).map((c) => `<option value="${c.id}">${esc(c.schoolName || 'Tanpa sekolah')} · ${esc(c.name)}</option>`).join('');
      const card = (r) => {
        const k = REQ[r.kind] || {}, d = r.details || {};
        const info = [r.email && `📧 ${esc(r.email)}`, r.contact && r.contact !== r.email && `📱 ${esc(r.contact)}`, r.schoolName && `🏫 ${esc(r.schoolName)}`, d.className && `Kelas: ${esc(d.className)}`, d.age && `Usia ${esc(d.age)}`, (d.children || []).length && `Anak: ${d.children.map(esc).join(', ')}`, d.note && `“${esc(d.note)}”`].filter(Boolean);
        if (r.status !== 'menunggu') {
          const res = r.result || {}, msg = r.status === 'disetujui' ? `Assalamu'alaikum ${r.name}, pengajuan akun Metiq Anda sudah disetujui. ${res.classCode ? `Kode kelas: ${res.classCode}. ` : ''}${res.parentCode ? `Kode orang tua: ${res.parentCode}. ` : ''}Buka https://metiq-math.vercel.app — kode pengajuan: ${r.code}` : '';
          return `<div class="reqrow"><span class="grow"><b>${k.icon || ''} ${esc(r.name)}</b> <small class="muted">${k.title || r.kind} · ${r.status === 'disetujui' ? '✅ disetujui' : '❌ ditolak'} ${ago(r.decidedAt)}${r.decidedBy ? ` oleh ${esc(r.decidedBy)}` : ''}</small>
            ${res.classCode ? `<small>Kode kelas <b class="code">${esc(res.classCode)}</b>${res.parentCode ? ` · kode orang tua <b class="code">${esc(res.parentCode)}</b>` : ''}${(res.children || []).length ? ` · anak: ${res.children.map((c) => `${esc(c.name)} <b class="code">${esc(c.parentCode)}</b>`).join(', ')}` : ''}</small>` : ''}</span>
            ${msg && waLink(r.contact, msg) ? `<a class="btn sm ghost" href="${waLink(r.contact, msg)}" target="_blank" rel="noopener">Kirim via WA</a>` : ''}</div>`;
        }
        const extra = r.kind === 'guru' ? `<label>Sekolah<select name="school">${schoolOpts(r.schoolName)}</select></label><label>Nama sekolah baru<input name="schoolName" maxlength="100" value="${esc(r.schoolName || '')}"></label>
            <label>Kelas untuk guru ini<select name="classId"><option value="">➕ Buat kelas baru: ${esc(d.className || 'Kelas 1')}</option>${classOpts}</select></label><label class="cb"><input type="checkbox" name="admin" value="1"> Jadikan admin sekolah (koordinator)</label>`
          : r.kind === 'homeschool' ? `<p class="small muted">Akan dibuat: sekolah homeschool "${esc(r.schoolName || 'Homeschool ' + r.name)}", kelas keluarga, dan akun siswa untuk ${(d.children || []).length || 0} anak.</p>`
          : r.kind === 'siswa' ? `<label>Tempatkan di kelas<select name="classId"><option value="">🧺 Tanpa kelas dulu (belajar sendiri)</option>${classOpts}</select></label><p class="small muted">Tanpa kelas: anak mendapat kode belajar pribadi dan bisa langsung belajar. Kelas bisa diatur nanti di tab 🧺 Tanpa kelas.</p>` : '';
        return `<section class="card reqcard menunggu"><div class="lrow"><span class="gicon g-pasangan">${k.icon || '✋'}</span><span class="grow"><b>${esc(r.name)}</b><small>${k.title || r.kind} · ${ftime(r.createdAt)} · kode ${esc(r.code)}</small></span></div>
          <p class="small">${info.join(' · ')}</p>
          <form data-form="decide" data-id="${r.id}" data-kind="${r.kind}" class="form">${extra}<label>Catatan <small class="muted">(opsional, terlihat oleh pemohon)</small><input name="note" maxlength="300"></label>
            <div class="row-btn left"><button class="btn" name="go" value="1">✅ Setujui</button><button class="btn ghost" name="go" value="0">Tolak</button></div></form></section>`;
      };
      body = `${pend.length ? pend.map(card).join('') : '<section class="card center"><p class="muted">Tidak ada pengajuan yang menunggu. 🎉</p></section>'}
        ${rq.length > pend.length ? `<section class="card"><h2>Riwayat</h2>${rq.filter((r) => r.status !== 'menunggu').slice(0, 60).map(card).join('')}</section>` : ''}`;
    } else if (sub === 'sekolah') {
      const max = Math.max(1, ...schools.map((s) => s.students));
      body = `<section class="card"><h2>Semua sekolah dan keluarga homeschool</h2><div class="tscroll"><table class="tbl"><thead><tr><th>Nama</th><th>Jenis</th><th>Admin</th><th>Guru</th><th>Kelas</th><th>Siswa</th><th>Aktif 7 hari</th><th>Soal 7 hari</th><th>Ketepatan</th><th>Paket</th><th></th></tr></thead><tbody>
        ${schools.map((s) => `<tr><td><b>${esc(s.name)}</b>${s.city ? `<small class="muted"> · ${esc(s.city)}</small>` : ''}</td><td>${s.kind === 'homeschool' ? '🏡 Homeschool' : '🏫 Sekolah'}</td><td class="wrap">${(s.admins || []).map(esc).join(', ') || '–'}</td><td>${s.teachers}</td><td>${s.classes}</td><td>${s.students}</td><td>${s.active7}/${s.students}</td><td>${fmtNum(s.answers7)}</td><td>${s.answers7 ? pct(s.correct7, s.answers7) + '%' : '–'}</td>
          <td>${planPill(s.id)}</td><td class="nowrap"><button class="link small" data-act="schooledit" data-id="${s.id}" data-n="${esc(s.name)}">Ubah nama</button> · <button class="link small" data-act="schoolview" data-id="${s.id}">Dasbor</button> · <button class="link small danger" data-act="superdel" data-what="school" data-id="${s.id}">Hapus</button></td></tr>`).join('')}
        </tbody></table></div></section>
        <section class="card vz"><h2>Siswa per sekolah</h2><p class="small muted">Panjang batang = jumlah siswa; angka = siswa yang aktif 7 hari terakhir.</p>
          ${schools.filter((s) => s.students).sort((a, b) => b.students - a.students).map((s) => `<div class="fbar"><span>${s.kind === 'homeschool' ? '🏡' : '🏫'} ${esc(s.name)}</span><i><b style="width:${Math.round((s.students / max) * 100)}%"></b></i><small>${s.active7} aktif / ${s.students}</small></div>`).join('') || '<p class="muted">Belum ada siswa.</p>'}</section>
        ${planCardHTML(schools)}
        <section class="card"><h2>Tambah sekolah</h2><form data-form="newschool" class="form inline newschool"><input name="name" required maxlength="100" placeholder="Nama sekolah atau keluarga homeschool"><select name="kind"><option value="sekolah">Sekolah</option><option value="homeschool">Homeschool</option></select><button class="btn">Tambah</button></form></section>`;
    } else if (sub === 'penawaran') {
      const qs = SUP.quotes;
      body = qs === null ? emptyCard('Perlu menjalankan SQL 020', 'Jalankan supabase/020_paket_sekolah.sql di SQL Editor Supabase.') : !qs.length ? emptyCard('Belum ada permintaan', 'Permintaan dari halaman Harga muncul di sini.')
        : qs.map((q) => { const wa = waLink(q.contact, `Assalamu'alaikum ${q.contactName}, terima kasih sudah tertarik dengan paket Sekolah Metiq untuk ${q.school}.`); return `<section class="card reqcard"><div class="lrow"><span class="grow"><b>${esc(q.school)}</b>${q.city ? ` · ${esc(q.city)}` : ''}<small>${esc(q.contactName)} · ${esc(q.contact)} · ${fdate(q.createdAt)}</small></span><span class="pill">${esc(q.status)}</span></div>
          <p class="small">${q.students ? `${q.students} siswa · perkiraan ${rp(q.students * PRICE)} per tahun` : ''}${q.note ? `<br>${esc(q.note)}` : ''}</p>
          <div class="row-btn left">${wa ? `<a class="btn sm" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ''}${['baru', 'dihubungi', 'selesai'].filter((x) => x !== q.status).map((x) => `<button class="btn sm ghost" data-act="quotest" data-id="${q.id}" data-s="${x}">Tandai ${x}</button>`).join('')}</div></section>`; }).join('');
    } else if (sub === 'ortu') {
      const ps = SUP.parents || [];
      body = `<section class="card"><h2>Akun orang tua</h2><p class="small muted">Menghapus akun orang tua hanya menghapus akun dan tautannya; data belajar anak tetap ada.</p>
        ${ps.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>Nama</th><th>Email</th><th>Status</th><th>Anak</th><th>Dibuat</th><th></th></tr></thead><tbody>
        ${ps.map((x) => `<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.email)}</td><td>${{ aktif: '✅ aktif', menunggu: '⏳ menunggu', ditolak: '❌ ditolak' }[x.status] || esc(x.status)}</td><td class="wrap">${(x.kids || []).map(esc).join(', ') || '–'}</td><td>${fdate(x.createdAt)}</td><td><button class="link small danger" data-act="superdel" data-what="parent" data-id="${x.id}">Hapus</button></td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">Belum ada akun orang tua.</p>'}</section>`;
    } else if (sub === 'kelas') {
      // semua kelas di semua sekolah, dengan pilihan guru kelasnya
      const sname = (id) => (schools.find((x) => x.id === id) || {}).name || 'Tanpa sekolah';
      const teachers = (ov.teachers || []).slice().sort((a, b) => sname(a.schoolId).localeCompare(sname(b.schoolId)) || a.name.localeCompare(b.name));
      const classes = SUP.ctx.classes.slice().sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || '') || a.name.localeCompare(b.name, 'id', { numeric: true }));
      const tOpts = (sel) => teachers.map((t) => `<option value="${t.id}" ${t.id === sel ? 'selected' : ''}>${esc(t.name)} · ${esc(sname(t.schoolId))}</option>`).join('');
      body = `<section class="card"><h2>Guru setiap kelas</h2>
        <p class="small muted">Pilih guru untuk sebuah kelas. Guru itu langsung bisa membuka kelas, siswanya, dan tugasnya. Sekolah kelas mengikuti sekolah gurunya. Guru baru harus punya akun aktif dulu (lewat pengajuan atau ditambahkan di tab 👩‍🏫 Guru).</p>
        <div class="tscroll"><table class="tbl"><thead><tr><th>Sekolah</th><th>Kelas</th><th>Kode</th><th>Siswa</th><th>Guru</th><th></th></tr></thead><tbody>
        ${classes.map((c) => `<tr><td>${esc(c.schoolName || 'Tanpa sekolah')}</td><td><b>${esc(c.name)}</b></td><td><b class="code">${esc(c.code)}</b></td><td>${S.studentsOf(c.id).length}</td>
          <td><select data-act="classteacher" data-c="${c.id}" data-was="${c.teacherId}" aria-label="Guru ${esc(c.name)}">${tOpts(c.teacherId)}</select></td><td><button class="link small danger" data-act="delclass" data-id="${c.id}">Hapus</button></td></tr>`).join('')}
        </tbody></table></div></section>`;
    } else {
      const opts = (sel) => `<option value="">— tanpa sekolah —</option>${schools.map((s) => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}`;
      body = `<section class="card"><h2>Guru di semua sekolah</h2><p class="small muted">Pindahkan guru ke sekolah lain atau jadikan admin sekolah (koordinator). Admin sekolah melihat semua kelas di sekolahnya.</p><div class="tscroll"><table class="tbl"><thead><tr><th>Nama</th><th>Email</th><th>Kelas</th><th>Sekolah</th><th>Admin sekolah</th><th></th></tr></thead><tbody>
        ${(ov.teachers || []).map((t) => `<tr><td><b>${esc(t.name)}</b>${t.isSuper ? ' <span class="pill">Super admin</span>' : ''}</td><td>${esc(t.email)}</td><td>${t.classes}</td><td><select data-act="teacherset" data-id="${t.id}" data-f="school">${opts(t.schoolId)}</select></td><td><label class="cb"><input type="checkbox" data-act="teacherset" data-id="${t.id}" data-f="admin" ${t.isSchoolAdmin ? 'checked' : ''}> admin</label></td><td>${t.isSuper ? '' : `<button class="link small danger" data-act="superdel" data-what="teacher" data-id="${t.id}">Hapus</button>`}</td></tr>`).join('')}
        </tbody></table></div></section>`;
    }
    return `<div class="kpis">${kpi('Sekolah · homeschool', `${schools.filter((s) => s.kind === 'sekolah').length}<span> · ${schools.filter((s) => s.kind === 'homeschool').length}</span>`)}${kpi('Guru · kelas', `${(ov.teachers || []).length}<span> · ${sum('classes')}</span>`)}${kpi('Siswa · aktif 7 hari', `${sum('students')}<span> · ${sum('active7')}</span>`)}${kpi('Orang tua · pengajuan', `${ov.parents}<span> · ${ov.pending}⏳</span>`)}</div>
      <nav class="subtabs">${subs.map(([k, l]) => `<a href="#/guru/super/${k}" class="${k === sub ? 'on' : ''}">${l}</a>`).join('')}</nav>${body}`;
  }
  async function superDecide(f, fd, btn) {
    const approve = !btn || btn.value !== '0';
    const kind = f.dataset.kind;
    if (!approve && !confirm('Tolak pengajuan ini?')) return;
    f.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    try {
      const r = await Cloud.rpc('super_decide', { p_token: session.get().token, p_request_id: f.dataset.id, p_approve: approve, p_school_id: fd.get('school') || null, p_school_name: fd.get('schoolName') || null, p_make_admin: fd.get('admin') === '1', p_class_id: fd.get('classId') || null, p_note: fd.get('note') || null });
      toast(approve ? `Disetujui ✔${r.classCode ? ` · kode kelas ${esc(r.classCode)}` : r.learnCode ? ` · kode belajar ${esc(r.learnCode)}` : ''}${r.parentCode ? ` · kode orang tua ${esc(r.parentCode)}` : ''}` : 'Pengajuan ditolak');
      await ensure(true); route();
    } catch (e) { f.querySelectorAll('button').forEach((b) => { b.disabled = false; }); toast(e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  // Admin: siswa yang belum punya kelas (mulai sendiri atau disetujui tanpa kelas), beserta kodenya
  let UNG = null;
  async function loadUngrouped(ctx) {
    const box = document.getElementById('ung-box'); if (!box) return;
    try {
      UNG = await Cloud.rpc('admin_ungrouped', { p_token: session.get().token });
      if (!document.getElementById('ung-box')) return;
      renderUngrouped(ctx);
    } catch (e) { box.innerHTML = emptyCard('Tidak bisa memuat', e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  // Keadaan anak tanpa kelas menurut aktivitasnya
  const ungState = (k) => (!k.att ? 'belum' : k.lastTs && Date.now() - k.lastTs > 14 * DAY ? 'diam' : k.week ? 'aktif' : 'jeda');
  const UNG_F = [['semua', 'Semua'], ['aktif', '🟢 Aktif minggu ini'], ['jeda', '🟡 Jeda 7–14 hari'], ['diam', '🔴 Tidak aktif >14 hari'], ['belum', '⚪ Belum mulai']];
  const UNG_PER = 15, UNG_SEL = new Set(); // anak per halaman; anak yang dicentang tetap tercentang antarhalaman
  const skillWhere = (id) => { const sk = SKILLS[id]; if (!sk) return ''; const u = UNITS.find((x) => x.id === sk.unit); return `${gname(sk.grade)} · ${u ? u.icon + ' ' + u.name : sk.unit}`; };
  function renderUngrouped(ctx) {
    const box = document.getElementById('ung-box'); if (!box || !UNG) return;
    const all = UNG, f = ss.get('ungf', 'semua'), cnt = (st) => all.filter((k) => ungState(k) === st).length;
    const list = all.filter((k) => f === 'semua' || ungState(k) === f).sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0) || b.createdAt - a.createdAt);
    {
      const opts = ctx.classes.slice().sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || '') || a.name.localeCompare(b.name)).map((c) => `<option value="${c.id}">${c.schoolName ? esc(c.schoolName) + ' · ' : ''}${esc(c.name)}</option>`).join('');
      // satu baris tabel per anak; tabel bisa digeser ke samping, kolom nama tetap terlihat
      const row = (k) => `<tr><td class="ungname"><div class="ungn"><label class="famchk" title="Pilih untuk kode keluarga"><input type="checkbox" data-fam="${k.id}" ${UNG_SEL.has(k.id) ? 'checked' : ''} aria-label="Pilih ${esc(k.name)} untuk kode keluarga"></label><span class="av">${avHTML(k.avatar || '🦁')}</span><span><a href="#/guru/tanpa/${k.id}" title="Lihat laporan"><b>${esc(k.name)}</b></a><small>Mulai ${ftime(k.createdAt)}</small></span></div></td>
        <td><span class="pill ung-${ungState(k)}">${{ aktif: 'Aktif', jeda: 'Jeda', diam: 'Tidak aktif', belum: 'Belum mulai' }[ungState(k)]}</span></td><td>${ago(k.lastTs)}</td><td class="num">${k.week || 0}</td><td class="num">${k.att || 0}</td><td class="num">${k.att ? pct(k.ok, k.att) + '%' : '–'}</td><td class="num">${k.mastered || 0}</td>
        <td class="wrap small">${k.lastSkill ? esc(skillWhere(k.lastSkill)) : '<span class="muted">–</span>'}</td>
        <td><b class="code">${esc(k.code || '–')}</b></td><td><b class="code">${esc(k.parentCode || '–')}</b></td><td>${k.familyCode ? `<b class="code">${esc(k.familyCode)}</b> <button class="link small" data-act="famdel" data-id="${k.id}">Lepas</button>` : '<span class="muted">–</span>'}</td>
        <td><form data-form="assignkid" data-id="${k.id}" class="form inline"><select name="classId" required aria-label="Kelas untuk ${esc(k.name)}"><option value="">— pilih kelas —</option>${opts}</select><button class="btn sm">Masukkan</button></form></td></tr>`;
      const pages = Math.max(1, Math.ceil(list.length / UNG_PER)), p = Math.min(Math.max(1, ss.get('ungp', 1)), pages), from = (p - 1) * UNG_PER;
      const nums = [...Array(pages)].map((_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - p) <= 2);
      const pager = pages < 2 ? '' : `<nav class="pager" aria-label="Halaman"><button class="btn sm ghost" data-act="ungp" data-p="${p - 1}" ${p === 1 ? 'disabled' : ''}>← Sebelumnya</button>${nums.map((n, i) => `${i && n - nums[i - 1] > 1 ? '<span class="muted">…</span>' : ''}<button class="btn sm ${n === p ? '' : 'ghost'}" data-act="ungp" data-p="${n}" ${n === p ? 'aria-current="page"' : ''}>${n}</button>`).join('')}<button class="btn sm ghost" data-act="ungp" data-p="${p + 1}" ${p === pages ? 'disabled' : ''}>Berikutnya →</button></nav>`;
      const table = `<section class="card"><p class="small muted">Menampilkan ${from + 1}–${Math.min(from + UNG_PER, list.length)} dari ${list.length} anak · geser tabel ke samping untuk melihat kode dan kelas · klik nama untuk laporan.</p>
        <div class="tscroll"><table class="tbl ungtbl"><thead><tr><th>Siswa</th><th>Keadaan</th><th>Terakhir aktif</th><th>Soal minggu ini</th><th>Total soal</th><th>Ketepatan</th><th>Mahir</th><th>Sedang di</th><th>Kode belajar</th><th>Kode orang tua</th><th>Kode keluarga</th><th>Masukkan ke kelas</th></tr></thead>
        <tbody>${list.slice(from, from + UNG_PER).map(row).join('')}</tbody></table></div>${pager}</section>`;
      box.innerHTML = `<section class="card"><h2>🧺 Siswa tanpa kelas <small class="muted">(${all.length})</small></h2>
        <div class="kpis ungsum"><div class="kpi"><small>Aktif minggu ini</small><b>${cnt('aktif')}</b></div><div class="kpi"><small>Jeda 7–14 hari</small><b>${cnt('jeda')}</b></div><div class="kpi"><small>Tidak aktif >14 hari</small><b>${cnt('diam')}</b></div><div class="kpi"><small>Belum mulai</small><b>${cnt('belum')}</b></div><div class="kpi"><small>Soal minggu ini</small><b>${all.reduce((n, k) => n + (k.week || 0), 0)}</b></div></div>
        <div class="tsub ungf">${UNG_F.map(([v, l]) => `<button class="${f === v ? 'on' : ''}" data-act="ungf" data-v="${v}">${l}${v === 'semua' ? '' : ` (${cnt(v)})`}</button>`).join('')}</div><p class="small muted">Anak yang mulai belajar sendiri atau disetujui tanpa kelas. Siswa masuk dengan kode belajar (menu "Saya sudah punya kode"); orang tua melihat laporan di <b>#/ortu</b> dengan kode orang tua atau kode keluarga.</p>
        <p class="small"><b>👨‍👩‍👧 Kakak-adik?</b> Centang anak-anaknya, lalu buat satu kode keluarga untuk orang tua.</p><button class="btn sm" data-act="famset">Buat kode keluarga untuk yang dicentang</button></section>`
        + (list.length ? table : all.length ? emptyCard('Tidak ada', 'Tidak ada anak dengan keadaan ini.') : emptyCard('Belum ada', 'Semua siswa sudah punya kelas.'));
    }
  }
  // Laporan satu siswa tanpa kelas untuk admin: kemajuan per bab dan jawaban terakhir
  async function loadStudentReport(ctx, sid) {
    const box = document.getElementById('ung-box'); if (!box) return;
    try {
      const r = await Cloud.rpc('admin_student_report', { p_token: session.get().token, p_student_id: sid });
      if (!document.getElementById('ung-box')) return;
      box.innerHTML = studentReportHTML(ctx, r);
    } catch (e) { box.innerHTML = e.status === 404 ? emptyCard('Perlu menjalankan SQL 021', 'Jalankan supabase/021_pantau_tanpa_kelas.sql di SQL Editor Supabase.') : emptyCard('Tidak bisa memuat', e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  function studentReportHTML(ctx, r) {
    const k = r.student, P = r.progress.filter((p) => SKILLS[p.skill]), A = r.answers, att = P.reduce((n, p) => n + p.att, 0), ok = P.reduce((n, p) => n + p.ok, 0), lastTs = Math.max(0, ...P.map((p) => p.last), ...A.map((a) => a.ts));
    const byGrade = {};
    P.forEach((p) => { const sk = SKILLS[p.skill], g = (byGrade[sk.grade] = byGrade[sk.grade] || {}); (g[sk.unit] = g[sk.unit] || []).push(p); });
    const grades = Object.keys(byGrade).map(Number).sort((a, b) => a - b), last = P[0];
    const opts = ctx.classes.slice().sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || '') || a.name.localeCompare(b.name)).map((c) => `<option value="${c.id}">${c.schoolName ? esc(c.schoolName) + ' · ' : ''}${esc(c.name)}</option>`).join('');
    const unitCard = (uid, ps) => { const u = UNITS.find((x) => x.id === uid) || { name: uid, icon: '📘', skills: [] };
      return `<details class="skd"><summary class="lrow"><span class="grow"><b>${u.icon} ${esc(u.name)}</b><small>${ps.filter((p) => p.score >= 80).length}/${u.skills.length || ps.length} mahir · ${ps.reduce((n, p) => n + p.att, 0)} soal</small></span></summary>
        ${ps.sort((a, b) => SKILLS[a.skill].code.localeCompare(SKILLS[b.skill].code, undefined, { numeric: true })).map((p) => `<div class="lrow"><span class="grow">${SKILLS[p.skill].code} ${esc(SKILLS[p.skill].name)}<small>${p.att} soal · ${pct(p.ok, p.att)}% benar · ${ago(p.last)}</small></span>${chip(p.score)}</div>`).join('')}</details>`; };
    return `<p><a href="#/guru/tanpa">← Semua siswa tanpa kelas</a></p>
      <section class="card"><div class="lrow"><span class="av">${avHTML(k.avatar || '🦁')}</span><span class="grow"><b class="big">${esc(k.name)}</b><small>Mulai ${ftime(k.createdAt)} · kode belajar <b>${esc(k.code || '–')}</b> · kode orang tua <b>${esc(k.parentCode || '–')}</b></small></span></div>
        <div class="kpis ungsum"><div class="kpi"><small>Terakhir aktif</small><b>${ago(lastTs)}</b></div><div class="kpi"><small>Total soal</small><b>${att}</b></div><div class="kpi"><small>Ketepatan</small><b>${att ? pct(ok, att) + '%' : '–'}</b></div><div class="kpi"><small>Keterampilan mahir</small><b>${P.filter((p) => p.score >= 80).length}</b></div><div class="kpi"><small>Keterampilan dicoba</small><b>${P.length}</b></div></div>
        ${last ? `<p class="small">Terakhir mengerjakan <b>${SKILLS[last.skill].code} ${esc(SKILLS[last.skill].name)}</b> (${esc(skillWhere(last.skill))}).</p>` : '<p class="muted small">Belum mengerjakan soal.</p>'}
        ${k.classId ? '<p class="small muted">Anak ini sekarang sudah punya kelas.</p>' : `<form data-form="assignkid" data-id="${k.id}" class="form inline"><select name="classId" required aria-label="Kelas untuk ${esc(k.name)}"><option value="">— pilih kelas —</option>${opts}</select><button class="btn">Masukkan ke kelas</button></form>`}</section>
      ${grades.map((g) => `<section class="card"><h2>${esc(gname(g))}</h2>${Object.entries(byGrade[g]).map(([uid, ps]) => unitCard(uid, ps)).join('')}</section>`).join('')}
      <section class="card"><h2>📝 ${A.length} jawaban terakhir</h2>${A.length ? A.map((a) => `<div class="lrow"><span>${a.ok ? '✅' : '❌'}</span><span class="grow">${SKILLS[a.skill] ? `<b>${SKILLS[a.skill].code}</b> ` : ''}${esc(String(a.text || '').replace(/<[^>]*>/g, ' ').slice(0, 90))}<small>${a.ok ? '' : `Menjawab ${esc(a.given || '–')}, seharusnya ${esc(a.answer || '–')} · `}${ftime(a.ts)}${a.ms ? ` · ${Math.round(a.ms / 1000)} dtk` : ''}</small></span></div>`).join('') : '<p class="muted">Belum ada jawaban.</p>'}</section>`;
  }
  async function famSet() {
    const ids = [...UNG_SEL];
    if (ids.length < 2) return toast('Centang minimal 2 anak dari satu keluarga');
    try { const r = await Cloud.rpc('admin_family_set', { p_token: session.get().token, p_student_ids: ids }); toast(`Kode keluarga ${esc(r.familyCode)} untuk ${r.count} anak ✔`); UNG_SEL.clear(); route(); }
    catch (e) { toast(e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  async function famDel(id) {
    if (!confirm('Lepas anak ini dari kode keluarga?')) return;
    try { await Cloud.rpc('admin_family_remove', { p_token: session.get().token, p_student_id: id }); toast('Dilepas dari keluarga ✔'); route(); }
    catch (e) { toast(e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  async function assignKid(f, fd) {
    const b = f.querySelector('button'); if (b) b.disabled = true;
    try {
      await Cloud.rpc('admin_assign_student', { p_token: session.get().token, p_student_id: f.dataset.id, p_class_id: fd.get('classId') });
      toast('Siswa dimasukkan ke kelas ✔'); await ensure(true); route();
    } catch (e) { if (b) b.disabled = false; toast(e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  async function sendQuote(f, fd) {
    const b = f.querySelector('button'); b.disabled = true;
    try {
      await Cloud.rpc('school_quote_send', { p_school: fd.get('school'), p_city: fd.get('city'), p_students: +fd.get('students') || null, p_contact_name: fd.get('name'), p_contact: fd.get('contact'), p_note: fd.get('note') });
      f.outerHTML = '<p class="ok-note">✔ Terima kasih! Permintaan terkirim. Tim Metiq akan menghubungi Anda lewat kontak yang Anda tulis.</p>';
    } catch (e) { b.disabled = false; toast(e.status === 404 ? 'Formulir belum aktif. Silakan hubungi Metiq langsung.' : e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  async function superNewSchool(f, fd) {
    try { await Cloud.rpc('super_school_save', { p_token: session.get().token, p_id: null, p_name: fd.get('name'), p_kind: fd.get('kind'), p_city: null }); toast('Sekolah ditambahkan ✔'); route(); }
    catch (e) { toast(e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  async function superEditSchool(id, name) {
    const s = (SUP && SUP.ov.schools || []).find((x) => x.id === id) || {};
    const n = prompt('Nama sekolah', name || ''); if (!n || !n.trim()) return;
    try { await Cloud.rpc('super_school_save', { p_token: session.get().token, p_id: id, p_name: n.trim(), p_kind: s.kind || 'sekolah', p_city: s.city || null }); toast('Nama disimpan ✔'); await ensure(true); route(); }
    catch (e) { toast(e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  // Hapus kelas: nama kelas diketik ulang sebagai konfirmasi; siswa dan datanya ikut terhapus
  async function deleteClass(id) {
    const c = S.cls(id); if (!c) return;
    const n = S.studentsOf(id).length;
    const typed = prompt(`Hapus kelas "${c.name}"${n ? ` beserta ${n} siswa dan semua datanya (jawaban, skor, tugas, laporan)` : ''}?
Tindakan ini tidak bisa dibatalkan.

Ketik nama kelas untuk konfirmasi: ${c.name}`);
    if (typed === null) return;
    if (typed.trim().toLowerCase() !== c.name.trim().toLowerCase()) return toast('Nama kelas tidak cocok. Kelas tidak dihapus.');
    const after = () => { const x = session.get(); if (x.classId === id) { delete x.classId; session.set(x); } toast(`"${esc(c.name)}" dihapus`); };
    if (!cloudOn()) {
      if (S.classesOf(c.teacherId).length <= 1) return toast('Ini satu-satunya kelas guru tersebut. Buat kelas lain dulu.');
      S.deleteClass(id); after(); return route();
    }
    try { await Cloud.rpc('teacher_delete_class', { p_token: session.get().token, p_class_id: id, p_confirm_name: typed }); after(); await ensure(true); route(); }
    catch (e) { toast(e.status === 404 ? 'Jalankan supabase/010_delete_class.sql dulu di Supabase' : e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  // Hapus sekolah, guru, atau akun orang tua (super admin); nama diketik ulang sebagai konfirmasi
  async function superDelete(what, id) {
    const ov = SUP.ov, x = what === 'school' ? (ov.schools || []).find((v) => v.id === id) : what === 'teacher' ? (ov.teachers || []).find((v) => v.id === id) : (SUP.parents || []).find((v) => v.id === id);
    if (!x) return;
    const warn = what === 'school' ? `Sekolah "${x.name}" akan dihapus beserta ${x.teachers} guru, ${x.classes} kelas, dan ${x.students} siswa dengan semua datanya. Akun super admin tidak ikut terhapus.`
      : what === 'teacher' ? `Akun guru "${x.name}" akan dihapus beserta ${x.classes} kelasnya dan semua siswa di kelas itu.` : `Akun orang tua "${x.name}" akan dihapus. Data belajar anak tetap ada.`;
    const typed = prompt(`${warn}
Tindakan ini tidak bisa dibatalkan.

Ketik nama untuk konfirmasi: ${x.name}`);
    if (typed === null) return;
    if (typed.trim().toLowerCase() !== x.name.trim().toLowerCase()) return toast('Nama tidak cocok. Tidak ada yang dihapus.');
    const fn = { school: ['super_school_delete', 'p_school_id'], teacher: ['super_teacher_delete', 'p_teacher_id'], parent: ['super_parent_delete', 'p_parent_id'] }[what];
    try {
      await Cloud.rpc(fn[0], { p_token: session.get().token, [fn[1]]: id, p_confirm_name: typed });
      if (what === 'school' && ss.get('schoolSel', '') === id) ss.set('schoolSel', '');
      toast(`"${esc(x.name)}" dihapus`); await ensure(true); route();
    } catch (e) { toast(e.status === 404 ? 'Jalankan supabase/011_delete_school.sql dulu di Supabase' : e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
  }
  async function superClassTeacher(el) {
    const c = S.cls(el.dataset.c), t = (SUP && SUP.ov.teachers || []).find((x) => x.id === el.value); if (!c || !t) return;
    const other = (SUP.ov.schools || []).find((x) => x.id === t.schoolId), moving = (t.schoolId || '') !== (c.schoolId || '');
    if (!confirm(`Jadikan ${t.name} guru ${c.name}?${moving ? `\n\nKelas ini akan pindah ke sekolah ${other ? other.name : 'tanpa sekolah'}, mengikuti sekolah gurunya.` : ''}`)) { el.value = el.dataset.was; return; }
    el.disabled = true;
    try {
      await Cloud.rpc('super_class_set_teacher', { p_token: session.get().token, p_class_id: c.id, p_teacher_id: t.id });
      toast(`${esc(t.name)} sekarang guru ${esc(c.name)} ✔`); await ensure(true); route();
    } catch (e) {
      el.disabled = false; el.value = el.dataset.was;
      toast(e.status === 404 ? 'Jalankan supabase/009_class_teacher.sql dulu di Supabase' : e.status ? esc(e.message) : 'Tidak bisa terhubung ke server');
    }
  }
  async function superTeacherSet(el) {
    const t = (SUP && SUP.ov.teachers || []).find((x) => x.id === el.dataset.id); if (!t) return;
    const school = el.dataset.f === 'school' ? el.value : t.schoolId || '', admin = el.dataset.f === 'admin' ? el.checked : t.isSchoolAdmin;
    try { await Cloud.rpc('super_teacher_set', { p_token: session.get().token, p_teacher_id: t.id, p_school_id: school, p_is_admin: admin }); t.schoolId = school; t.isSchoolAdmin = admin; toast('Disimpan ✔'); await ensure(true); }
    catch (e) { toast(e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); route(); }
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
    'view:belajar': '🏠 Beranda siswa', 'view:latihan': '✏️ Halaman latihan', 'view:pelajaran': '📖 Pelajaran', 'view:permainan': '🎮 Daftar permainan', 'view:main': '🎮 Halaman permainan',
    'view:hadiah': '🎁 Papan hadiah', 'view:asesmen': '🧭 Asesmen', 'view:laporanku': '📄 Laporanku', 'view:ortu': '👨‍👩‍👧 Laporan orang tua', 'view:notifikasi': '🔔 Notifikasi',
    'view:guru/ringkasan': '👩‍🏫 Ringkasan guru', 'view:guru/siswa': '👩‍🏫 Daftar & halaman siswa', 'view:guru/analitik': '📈 Analitik guru', 'view:guru/tugas': '📌 Tugas', 'view:guru/sekolah': '🏫 Dasbor sekolah',
    'view:guru/peta': '🗺️ Peta kemajuan', 'view:guru/keterampilan': '🧩 Keterampilan', 'view:guru/kelola': '⚙️ Kelola kelas', 'view:guru/referensi': '📚 Referensi', 'view:panduan': '❓ Panduan',
    answer: '✅ Soal dijawab', game: '🏁 Ronde permainan selesai', diag: '🧭 Asesmen selesai', feedback: '⭐ Ulasan dikirim', start: '🧪 Mulai mode coba',
  };
  const ROLE_LABEL = { siswa: 'Siswa', ortu: 'Orang tua', guru: 'Guru' };
  async function loadTrialStats() {
    const box = document.getElementById('trial-box'); if (!box) return;
    const ses = session.get();
    if (!cloudOn() || !ses.token) { box.innerHTML = emptyCard('Hanya di akun admin asli', 'Statistik mode coba diambil dari server, jadi hanya terlihat saat masuk dengan akun admin sungguhan (bukan mode coba).'); return; }
    const days = ss.get('tdays', 14);
    try {
      const r = await Cloud.rpc('admin_trial_stats', { p_token: ses.token, p_days: days });
      if (document.getElementById('trial-box')) box.innerHTML = trialHTML(r, days);
    } catch (e) {
      box.innerHTML = e.status === 404 ? emptyCard('Perlu menjalankan SQL 007', 'Jalankan supabase/007_trial_usage.sql di SQL Editor Supabase agar penggunaan mode coba tercatat dan tampil di sini.')
        : emptyCard('Gagal memuat', e.status ? esc(e.message) : 'Tidak bisa terhubung ke server.');
    }
  }
  function trialHTML(r, days) {
    const vs = r.visitors || [], byRole = (x) => vs.filter((v) => v.role === x).length, ans = vs.reduce((t, v) => t + v.answers, 0), ok = vs.reduce((t, v) => t + v.correct, 0);
    const pills = `<div class="vzpills">${[7, 14, 30].map((d) => `<button class="${d === days ? 'on' : ''}" data-act="tdays" data-d="${d}">${d} hari</button>`).join('')}</div>`;
    if (!vs.length) return pills + emptyCard('Belum ada penggunaan', `Belum ada yang memakai mode coba dalam ${days} hari terakhir. Bagikan tautan metiq-math.vercel.app dan minta penguji mengetuk "Coba sebagai …" di beranda.`);
    // grafik harian: pengunjung unik per peran (batang bertumpuk, warna kategori tetap per peran)
    const dayList = [...Array(days)].map((_, i) => isoDay(Date.now() - (days - 1 - i) * DAY)), roles = ['siswa', 'ortu', 'guru'], col = { siswa: VZ.s1, ortu: VZ.s2, guru: VZ.s3 };
    const val = (d, rl) => ((r.daily || []).find((x) => x.day === d && x.role === rl) || {}).visitors || 0;
    const max = Math.max(1, ...dayList.map((d) => roles.reduce((t, rl) => t + val(d, rl), 0)));
    const W = 340, H = 160, L = 22, base = 128, bw = Math.max(4, (W - L - 6) / days - 3), Y = (v) => (v / max) * (base - 14);
    let svg = `<line x1="${L}" x2="${W - 4}" y1="${base}" y2="${base}" stroke="#16302b"/><text x="${L - 4}" y="${base - Y(max) + 3}" text-anchor="end" font-size="9" fill="${VZ.ink2}">${max}</text>`;
    dayList.forEach((d, i) => {
      const x = L + i * ((W - L - 6) / days) + 1.5; let y = base;
      roles.forEach((rl) => { const v = val(d, rl); if (!v) return; const h = Y(v); y -= h; svg += `<rect class="vzmark" x="${x}" y="${y}" width="${bw}" height="${Math.max(1, h - 1)}" rx="2" fill="${col[rl]}" ${tip(`${fdate(new Date(d + 'T12:00:00').getTime())} · ${ROLE_LABEL[rl]}`, `${v} pengunjung`)}/>`; });
      const tot = roles.reduce((t, rl) => t + val(d, rl), 0);
      if (tot) svg += `<text x="${x + bw / 2}" y="${y - 3}" text-anchor="middle" font-size="8" font-weight="800" fill="#16302b">${tot}</text>`;
      if (days <= 14 || i % 3 === 0) svg += `<text x="${x + bw / 2}" y="${base + 11}" text-anchor="middle" font-size="8" fill="${VZ.ink2}">${new Date(d + 'T12:00:00').getDate()}</text>`;
    });
    const feats = (r.features || []).filter((f) => FEATURE[f.k]).slice(0, 12), fmax = Math.max(1, ...feats.map((f) => f.v));
    return `${pills}
      <div class="kpis"><div class="kpi"><small>Pengunjung mode coba</small><b>${vs.length}</b></div><div class="kpi"><small>Siswa · ortu · guru</small><b class="sm">${byRole('siswa')} · ${byRole('ortu')} · ${byRole('guru')}</b></div>
        <div class="kpi"><small>Soal dijawab</small><b>${fmtNum(ans)}<span> · ${ans ? pct(ok, ans) + '%' : '–'}</span></b></div><div class="kpi"><small>Kembali di hari lain</small><b>${vs.filter((v) => v.days > 1).length}<span>/${vs.length}</span></b></div></div>
      <section class="card vz"><h2>Pengunjung per hari</h2><p class="small muted">Jumlah orang berbeda yang memakai mode coba setiap hari (WIB).</p>
        ${legend(roles.map((rl) => [col[rl], ROLE_LABEL[rl]]))}<svg viewBox="0 0 ${W} ${H}" class="vzsvg" role="img" aria-label="Pengunjung mode coba per hari">${svg}</svg>
        ${vzTable(['Tanggal', ...roles.map((rl) => ROLE_LABEL[rl])], dayList.filter((d) => roles.some((rl) => val(d, rl))).map((d) => [d, ...roles.map((rl) => val(d, rl))]))}</section>
      <section class="card vz"><h2>Fitur yang paling banyak dipakai</h2><p class="small muted">Banyaknya pengunjung yang membuka atau memakai setiap fitur.</p>
        ${feats.map((f) => `<div class="fbar"><span>${FEATURE[f.k]}</span><i><b style="width:${Math.round((f.v / fmax) * 100)}%"></b></i><small>${f.v} orang · ${fmtNum(f.n)}×</small></div>`).join('')}</section>
      <section class="card"><h2>Siapa saja yang mencoba</h2><div class="tscroll"><table class="tbl"><thead><tr><th>Nama</th><th>Peran</th><th>Pertama</th><th>Terakhir</th><th>Hari aktif</th><th>Soal</th><th>Permainan</th><th>Asesmen</th></tr></thead><tbody>
        ${vs.map((v) => `<tr><td><b>${esc(v.name || '(tanpa nama)')}</b>${v.child ? `<small class="muted"> · anak: ${esc(v.child)}</small>` : ''}</td><td>${ROLE_LABEL[v.role] || v.role}</td><td>${ftime(v.first)}</td><td>${ago(v.last)}</td><td>${v.days}</td><td>${v.answers ? `${v.answers} <small class="muted">(${pct(v.correct, v.answers)}%)</small>` : '–'}</td><td>${v.games || '–'}</td><td>${v.diag ? esc(gname(+v.diag)) : '–'}</td></tr>`).join('')}
      </tbody></table></div><p class="small muted">Nama adalah yang diketik sendiri oleh penguji. Satu baris = satu perangkat.</p></section>`;
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
    const pill = (x) => { const lock = x.id > max; return `<button class="mq-gg ${x.id === g ? 'on' : ''} ${lock ? 'lock' : ''}" data-act="ggrade" data-g="${x.id}" aria-label="${gname(x.id)}${lock ? ' (terkunci)' : ''}"><b>${x.short || x.id}</b>${lock ? `<i>${IC.lock}</i>` : ''}</button>`; };
    const tile = (x) => {
      const b = best(x.id), st = b ? G.starsFor(x, b.score) : 0, [c, bg] = G.LOOK[x.type];
      return `<a class="mq-gt" href="#/main/${x.id}" style="--c:${c};--bg:${bg}" aria-label="${esc(x.name)}, ${st} bintang">${x.isNew && !b ? '<span class="new">Baru</span>' : ''}<span class="art">${G.art(x.type)}</span><b>${x.name}</b><span class="st">${[0, 1, 2].map((i) => gStar(i < st)).join('')}</span></a>`;
    };
    let body;
    if (g > max) {
      const sk = unitsOf(max).flatMap((u) => u.skills), dn = sk.filter(skillOk(S.progressAll(kid.id))).length;
      body = `<div class="mq-glock">${MQ.svg('think', { size: 130 })}<div class="lk">${IC.lock}</div>
        <h2>${gname(g)}</h2><p>Tuntaskan belajar <b>${gname(max)}</b> dulu</p>
        <div class="mq-glbar" role="img" aria-label="${dn} dari ${sk.length} keterampilan Mahir"><i style="width:${pct(dn, sk.length)}%"></i></div><small>${dn} / ${sk.length} ✓</small>
        <a class="mq-btn" href="#/belajar">Ayo belajar</a></div>`;
    } else {
      body = `<div class="mq-ggrid">${G.GAMES.filter((x) => x.grade === g && !(adabOn() && x.type === 'kilat')).map(tile).join('')}</div>`;
    }
    app.innerHTML = mqPage(`
      <div class="mq-ghead">${kid ? '' : `<a class="mq-ico" href="#/" aria-label="Kembali">${IC.back}</a>`}
        <div class="mq-gsay">${MQ.svg('happy', { size: 74 })}<div class="mq-bubble"><p>Ayo main!</p></div></div>
        ${kid ? `<button class="mq-gchip" data-act="tip" data-t="⭐ Bintang dari skor terbaik tiap permainan (maksimal 3)">${gStar(true)}${S.starsOf(kid.id)}</button>` : ''}</div>
      <div class="mq-ggs" role="tablist" aria-label="Kelas">${GRADES.map(pill).join('')}</div>
      ${body}`, 'main');
  }
  function viewGame(id) {
    const x = G.byId(id); if (!x || (adabOn() && x.type === 'kilat')) return go('#/permainan');
    const kid = gameKid();
    if (kid && x.grade > gameGradeMax(kid.id)) { toast('🔒 Tuntaskan belajarmu dulu ya'); return go('#/permainan'); }
    const [c, bg] = G.LOOK[x.type];
    app.innerHTML = `<div class="mq-top"><a class="mq-ico" href="#/permainan" aria-label="Keluar">${IC.x}</a><span class="mq-gtitle">${x.name}</span>
        <button class="mq-ico psound" data-act="sound" aria-label="Suara">${window.SFX.enabled() ? '🔔' : '🔕'}</button></div>
      <main class="mq-screen mq-gplay" id="garea" style="--c:${c};--bg:${bg}">
        <div class="mq-gintro">${G.buddy(x) ? `<div class="mq-gsay gbuddy">${MQ.svg('hello', { size: 84, who: G.buddy(x) })}<div class="mq-bubble"><p>Main bersama <b>${buddyName(G.buddy(x))}</b>, yuk!</p></div></div>` : ''}<div class="mq-gart">${G.art(x.type, 210)}</div>
          <div class="mq-ghow">${G.HOW[x.type](x).map(([e, t]) => `<div><span class="e">${e}</span>${t}</div>`).join('')}</div>
          ${G.EX[x.type] ? `<div class="mq-gex"><small>Contoh</small>${G.EX[x.type](x)}</div>` : ''}
          <div class="mq-goal">${x.stars.map((p, i) => `<div><span>${gStar(true).repeat(i + 1)}</span><b>${p}</b></div>`).join('')}</div>
          ${kid ? '' : '<p class="mq-note">Masuk sebagai siswa agar bintangmu tersimpan.</p>'}
          <details class="mq-gmore"><summary>Cara main lengkap</summary><p>${x.desc}</p></details></div></main>
      <div class="mq-foot" id="gfoot"><div class="mq-foot-in"><button class="mq-btn pulse" data-act="gstart">Mulai</button></div></div>`;
  }
  function startGame() {
    const x = G.byId(location.hash.split('/')[2]), area = document.getElementById('garea'); if (!x || !area) return;
    if (stopGame) stopGame();
    const foot = document.getElementById('gfoot'); if (foot) foot.hidden = true;
    stopGame = G.start(area, x, ({ points, ms, winner }) => {
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
        <h2>${winner ? (winner === 'Seri' ? '🤝 Seri!' : `🏆 ${winner} menang!`) : stars >= 3 ? 'Luar biasa!' : stars === 2 ? 'Hebat!' : stars ? 'Bagus!' : 'Ayo coba lagi!'}</h2>
        <div class="mq-gpts"><b>${points}</b><small>poin</small>${kid && points > prevBest && before && before.att ? '<span class="rec">🎉 Rekor baru!</span>' : ''}</div>
        ${stars < 3 ? `<p class="mq-note">Butuh ${x.stars[stars]} poin untuk ${'⭐'.repeat(stars + 1)}</p>` : ''}</div>`;
      if (foot) { foot.hidden = false; foot.innerHTML = '<div class="mq-foot-in"><button class="mq-btn" data-act="gstart">Main lagi</button><a class="mq-btn ghost" href="#/permainan">Permainan lain</a></div>'; }
    });
  }

  const emptyCard = (title, text) => `<section class="card center"><div class="bigemoji">🔎</div><h2>${title}</h2><p class="muted">${text}</p></section>`;
  const ASUB = [['penggunaan', 'Penggunaan'], ['masalah', 'Titik masalah'], ['kisi', 'Kisi skor'], ['log', 'Log soal'], ['kemajuan', 'Kemajuan']];
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
    return `<div class="kpis"><div class="kpi"><small>Soal dijawab</small><b>${fmtNum(ans.length)}</b></div><div class="kpi"><small>Waktu belajar</small><b class="sm">${fmtTime(ms)}</b></div><div class="kpi"><small>Siswa aktif</small><b>${active}<span>/${ctx.kids.length}</span></b></div><div class="kpi"><small>Keterampilan dilatih</small><b>${new Set(ans.map((a) => a.skill)).size}</b></div></div>
      <section class="card"><h2>Soal dijawab per ${step === 7 ? 'minggu' : 'hari'}</h2>${ans.length ? `<div class="ubars">${buckets.map((b) => `<div class="ub" title="${fdate(b.t)}: ${b.n} soal"><span class="ubv">${b.n && buckets.length <= 31 ? b.n : ''}</span><i style="height:${Math.round((b.n / max) * 100)}%"></i></div>`).join('')}</div><div class="ublab"><span>${fdate(buckets[0].t)}</span><span>${fdate(buckets[buckets.length - 1].t)}</span></div>` : '<p class="muted">Belum ada latihan pada periode ini.</p>'}</section>
      <section class="card"><h2>Penggunaan per siswa</h2><div class="tscroll"><table class="tbl"><thead><tr><th>Siswa</th><th>Soal</th><th>Ketepatan</th><th>Waktu</th><th>Keterampilan</th><th>Hari aktif</th><th>Terakhir</th></tr></thead><tbody>
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
    if (!list.length) return emptyCard('Belum ada titik masalah', 'Titik masalah muncul jika sebuah keterampilan punya minimal 3 jawaban salah pada periode ini.');
    const lim = ss.get('troublelim', 15);
    return `<p class="muted small">${list.length} keterampilan punya 3 jawaban salah atau lebih. Diurutkan dari yang paling banyak salah; ketuk untuk melihat siswa dan soalnya.</p>` + list.slice(0, lim).map((t) => {
      const sk = SKILLS[t.id];
      const per = t.sids.map((sid) => ({ k: S.student(sid), n: t.w.filter((a) => a.sid === sid).length })).filter((x) => x.k).sort((a, b) => b.n - a.n);
      const tags = tagCounts(t.w).filter(([x]) => x !== 'konsep' && TAGS[x]).slice(0, 2);
      const recent = t.w.slice().sort((a, b) => b.ts - a.ts).slice(0, 6);
      return `<details class="card trouble"><summary><span class="grow"><b>${sk.code} ${sk.name}</b><small>${gname(sk.grade)} · ${t.w.length} salah dari ${t.tot} soal · ${t.sids.length} siswa</small></span><span class="pill warn">${pct(t.w.length, t.tot)}% salah</span></summary>
        <div class="kidchips">${per.map((x) => `<a href="#/guru/siswa/${x.k.id}" class="kchip">${avHTML(x.k.avatar)} ${esc(x.k.name)} <b>${x.n}×</b></a>`).join('')}</div>
        ${tags.length ? `<p class="small"><b>Pola kesalahan:</b> ${tags.map(([x, n]) => `${TAGS[x].label} (${n}×)`).join('; ')}</p>` : ''}
        <div class="tscroll"><table class="tbl"><thead><tr><th>Siswa</th><th>Soal</th><th>Jawaban</th><th>Benar</th></tr></thead><tbody>${recent.map((a) => { const k = S.student(a.sid); return `<tr><td>${k ? `${avHTML(k.avatar)} ${esc(k.name)}` : ''}</td><td class="wrap">${esc(a.text)}</td><td class="strike">${esc(a.given)}</td><td><b>${esc(a.answer)}</b></td></tr>`; }).join('')}</tbody></table></div>
        <div class="row-btn left"><button class="btn sm ghost" data-act="assign1" data-id="${t.id}">Tugaskan ke kelas</button><a class="btn sm ghost" href="#/coba/${t.id}">Lihat soal contoh</a></div></details>`;
    }).join('') + (list.length > lim ? `<div class="row-btn"><button class="btn ghost sm" data-act="troublemore">Tampilkan 15 lagi (${list.length - lim} tersisa)</button></div>` : '');
  }

  // Kisi skor: SmartScore setiap siswa untuk setiap keterampilan dalam satu bab
  function gridHTML(ctx) {
    const units = curUnits();
    let uid = ss.get('gridUnit', null);
    if (!units.some((u) => u.id === uid)) uid = (units.find((u) => ctx.kids.some((k) => u.skills.some((s) => S.progress(k.id, s.id).att))) || units[0]).id;
    const u = units.find((x) => x.id === uid);
    return gradeTabs() + `<div class="unitchips">${units.map((x) => `<button class="${x.id === uid ? 'on' : ''}" data-act="gridunit" data-u="${x.id}" title="${esc(x.name)}">${x.icon} ${x.id}</button>`).join('')}</div>
      <section class="card"><h2><span class="uicon" style="--c:${u.color}">${u.icon}</span>${u.id}. ${u.name}</h2><p class="muted small">SmartScore saat ini. Sel kosong = belum dicoba.</p>
      <div class="tscroll"><table class="tbl heat"><thead><tr><th>Siswa</th>${u.skills.map((s) => `<th title="${esc(s.name)}">${s.code}</th>`).join('')}</tr></thead><tbody>
      ${ctx.kids.map((k) => `<tr><td><a href="#/guru/siswa/${k.id}">${avHTML(k.avatar)} ${esc(k.name)}</a></td>${u.skills.map((s) => { const p = S.progress(k.id, s.id); return `<td class="hc ${p.att ? level(p.score)[1] : 'lv0'}" title="${esc(s.name)}: ${p.att ? `${p.score} (${p.att} soal)` : 'belum dicoba'}">${p.att ? (p.score >= 100 ? '🏆' : p.score) : ''}</td>`; }).join('')}</tr>`).join('')}
      </tbody></table></div>
      <ol class="skl small">${u.skills.map((s) => `<li><b>${s.code}</b> ${s.name}</li>`).join('')}</ol>
      <div class="legend">${[['Mulai <50', 'lv1'], ['Berkembang 50–79', 'lv2'], ['Mahir 80–99', 'lv3'], ['Tuntas 100', 'lv4']].map(([l, c]) => `<span><i class="${c}"></i>${l}</span>`).join('')}</div></section>`;
  }

  // Log soal: setiap soal yang dijawab, dengan filter siswa, keterampilan, dan hasil
  function logHTML(ctx, ans) {
    const f = ss.get('logf', { sid: '', skill: '', res: '' }), lim = ss.get('loglim', 50);
    const used = [...new Set(ans.map((a) => a.skill))].filter((id) => SKILLS[id]).sort((a, b) => SKILLS[a].code.localeCompare(SKILLS[b].code, undefined, { numeric: true }));
    const all = ans.filter((a) => (!f.sid || a.sid === f.sid) && (!f.skill || a.skill === f.skill) && (!f.res || (f.res === 'ok') === !!a.ok)).sort((a, b) => b.ts - a.ts);
    const rows = all.slice(0, lim);
    return `<div class="filters"><select data-act="logf" data-k="sid"><option value="">Semua siswa</option>${ctx.kids.map((k) => `<option value="${k.id}" ${f.sid === k.id ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select>
      <select data-act="logf" data-k="skill"><option value="">Semua keterampilan</option>${used.map((id) => `<option value="${id}" ${f.skill === id ? 'selected' : ''}>${SKILLS[id].code} ${esc(SKILLS[id].name)}</option>`).join('')}</select>
      <select data-act="logf" data-k="res"><option value="">Benar dan salah</option><option value="ok" ${f.res === 'ok' ? 'selected' : ''}>Hanya benar</option><option value="no" ${f.res === 'no' ? 'selected' : ''}>Hanya salah</option></select></div>
      <p class="muted small">${fmtNum(all.length)} soal${all.length > rows.length ? `, menampilkan ${rows.length} terbaru` : ''}.</p>
      <section class="card"><div class="tscroll"><table class="tbl log"><thead><tr><th>Waktu</th><th>Siswa</th><th>Kode</th><th>Soal</th><th>Jawaban</th><th>Benar</th><th>Lama</th></tr></thead><tbody>
      ${rows.map((a) => { const k = S.student(a.sid), sk = SKILLS[a.skill]; return `<tr class="${a.ok ? '' : 'bad'}"><td>${ftime(a.ts)}</td><td>${k ? `${avHTML(k.avatar)} ${esc(k.name)}` : ''}</td><td title="${sk ? esc(sk.name) : ''}">${sk ? sk.code : esc(a.skill)}</td><td class="wrap">${esc(a.text)}</td><td>${a.ok ? '✅' : '❌'} ${esc(a.given)}</td><td>${esc(a.answer)}</td><td>${Math.round((a.ms || 0) / 1000)} dtk</td></tr>`; }).join('') || '<tr><td colspan="7" class="muted">Tidak ada soal yang cocok.</td></tr>'}
      </tbody></table></div>${all.length > rows.length ? '<div class="row-btn"><button class="btn ghost sm" data-act="logmore">Tampilkan 50 lagi</button></div>' : ''}</section>`;
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
    if (!skillsTouched) return emptyCard('Belum ada kemajuan', 'Kemajuan dihitung dari keterampilan yang dilatih pada periode ini.');
    const arrow = (x) => `<span class="sc lv-${x.start >= 100 ? 4 : x.start >= 80 ? 3 : x.start >= 50 ? 2 : x.start > 0 ? 1 : 0}">${x.start}</span> → <span class="sc lv-${x.end >= 100 ? 4 : x.end >= 80 ? 3 : x.end >= 50 ? 2 : x.end > 0 ? 1 : 0}">${x.end}</span>`;
    return `<div class="kpis"><div class="kpi"><small>Kenaikan SmartScore</small><b>+${fmtNum(sum((x) => x.gain))}</b></div><div class="kpi"><small>Menjadi mahir (≥80)</small><b>${sum((x) => x.prof)}</b></div><div class="kpi"><small>Menjadi tuntas (100)</small><b>${sum((x) => x.mast)}</b></div><div class="kpi"><small>Rata-rata kenaikan</small><b>+${Math.round(sum((x) => x.gain) / skillsTouched)}<span> per keterampilan</span></b></div></div>
      <p class="muted small">Skor awal = SmartScore sebelum periode dimulai, skor akhir = SmartScore di akhir periode. Ketuk nama siswa untuk rinciannya.</p>
      ${rows.map((x) => `<details class="card prog"><summary><span class="av sm">${avHTML(x.k.avatar)}</span><span class="grow"><b>${esc(x.k.name)}</b><small>${x.items.length} keterampilan dilatih · ${x.prof} jadi mahir · ${x.mast} tuntas</small></span><span class="pill ${x.gain ? '' : 'warn'}">+${x.gain}</span></summary>
        ${x.items.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>Keterampilan</th><th>Skor</th><th>Naik</th><th>Soal</th></tr></thead><tbody>${x.items.map((it) => `<tr><td class="wrap"><b>${SKILLS[it.id].code}</b> ${SKILLS[it.id].name}</td><td>${arrow(it)}</td><td class="${it.gain > 0 ? 'up' : it.gain < 0 ? 'down' : ''}">${it.gain > 0 ? '+' : ''}${it.gain}</td><td>${it.n}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">Tidak berlatih pada periode ini.</p>'}</details>`).join('')}`;
  }
  const fmtNum = (n) => Number(n).toLocaleString('id-ID');
  // Tenggat dari kolom tanggal (yyyy-mm-dd) ditulis seperti "30 Okt"
  const fdue = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? fdate(new Date(d + 'T00:00:00').getTime()) : d);

  // Siswa sasaran tugas (kosong = seluruh kelas)
  const asgKids = (a, kids) => (a.students && a.students.length ? kids.filter((k) => a.students.includes(k.id)) : kids);
  function tasksHTML(ctx) {
    const asg = S.assignmentsOf(ctx.c.id).slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const pre = ss.get('asgFor', ''), preSkill = ss.get('asgSkill', '');
    const card = (a) => {
      const kids = asgKids(a, ctx.kids), whole = !(a.students && a.students.length);
      const d = S.doneFor(a.id).map((x) => S.student(x.sid)).filter((k) => k && kids.some((y) => y.id === k.id));
      return `<div class="asg-t"><div class="grow"><b>${esc(a.note || 'Tugas')}</b>${a.due ? ` <span class="muted small">· sampai ${esc(fdue(a.due))}</span>` : ''}
        <p class="small asg-for">${whole ? '👥 Untuk seluruh kelas' : `🎯 Khusus: ${kids.map((k) => `${avHTML(k.avatar)} ${esc(k.name)}`).join(', ') || '<span class="muted">(siswa sudah dihapus)</span>'}`}</p>
        <div class="small">${a.skills.filter((k) => SKILLS[k]).map((k) => `<span class="pill">${SKILLS[k].code} ${SKILLS[k].name} · ${kids.filter((kid) => S.progress(kid.id, k).score >= 80).length}/${kids.length} mahir</span>`).join(' ')}</div>
        <p class="small asg-done">✅ Selesai: <b>${d.length}/${kids.length}</b> siswa${d.length ? ` — ${d.map((k) => esc(k.name)).join(', ')}` : ''}</p>${fbSummary(S.feedbackOf(a.id))}</div>
        <button class="btn sm ghost" data-act="rmasg" data-id="${a.id}">Hapus</button></div>`;
    };
    const whole = asg.filter((a) => !(a.students && a.students.length)), special = asg.filter((a) => a.students && a.students.length);
    return `<section class="card"><h2>👥 Tugas seluruh kelas</h2>${whole.length ? whole.map(card).join('') : '<p class="muted">Belum ada tugas untuk seluruh kelas.</p>'}</section>
      <section class="card"><h2>🎯 Tugas khusus siswa</h2>${special.length ? special.map(card).join('') : '<p class="muted">Belum ada. Beri tugas khusus untuk siswa yang perlu mengulang materi, atau yang sudah siap materi lanjutan.</p>'}</section>
      <section class="card" id="newasg"><h2>Buat tugas baru</h2><form data-form="assign" class="form">
        <fieldset class="target"><legend>Untuk siapa?</legend>
          <label class="cb"><input type="radio" name="target" value="all" ${pre ? '' : 'checked'}> 👥 Seluruh kelas (${ctx.kids.length} siswa)</label>
          <label class="cb"><input type="radio" name="target" value="some" ${pre ? 'checked' : ''}> 🎯 Siswa tertentu</label>
          <div class="kidpick">${ctx.kids.map((k) => `<label class="cb"><input type="checkbox" name="sid" value="${k.id}" ${pre === k.id ? 'checked' : ''}> ${avHTML(k.avatar)} ${esc(k.name)}</label>`).join('')}</div>
        </fieldset>
        <label>Catatan untuk siswa<input name="note" placeholder="mis. Latihan untuk ulangan Jumat"></label>
        <label>Tenggat (opsional)<input name="due" type="date"></label>
        <div class="pickskills">${UNITS.map((u) => `<fieldset><legend>${u.icon} ${gname(u.grade)} · ${u.id}. ${u.name}</legend>${u.skills.map((x) => `<label class="cb"><input type="checkbox" name="sk" value="${x.id}" ${preSkill === x.id ? 'checked' : ''}> ${x.code} ${x.name}</label>`).join('')}</fieldset>`).join('')}</div>
        <button class="btn">Simpan tugas</button></form></section>`;
  }
  // Halaman siswa: saran tugas khusus (mengulang yang lemah, atau materi lanjutan)
  function specialAssignHTML(k) {
    const prog = S.progressAll(k.id), order = UNITS.flatMap((u) => u.skills.map((x) => x.id));
    let last = -1;
    order.forEach((id, i) => { if ((prog[id] || {}).score >= 80) last = i; });
    const next = order.slice(last + 1).filter((id) => !(prog[id] && prog[id].att)).slice(0, 3);
    const weak = weaknesses(k.id).slice(0, 4);
    const mine = S.assignmentsFor(k.id).filter((a) => a.students && a.students.includes(k.id));
    const row = (id, why) => `<div class="lrow"><span class="grow"><b>${SKILLS[id].code} ${SKILLS[id].name}</b><small>${why}</small></span><button class="btn sm ghost" data-act="assignkid" data-id="${id}" data-s="${k.id}">Tugaskan</button></div>`;
    return `<section class="card"><h2>🎯 Tugas khusus untuk ${esc(k.name)}</h2>
      ${mine.length ? `<p class="small">Tugas khusus aktif: ${mine.map((a) => `<span class="pill special">${esc(a.note || 'Tugas')}${S.isDone(a.id, k.id) ? ' ✅' : ''}</span>`).join(' ')}</p>` : ''}
      ${weak.length ? `<h3 class="sub">Perlu mengulang</h3>${weak.map((w) => row(w.id, `${w.att} soal · ${w.acc}% benar · skor ${w.score}`)).join('')}` : ''}
      ${next.length ? `<h3 class="sub">Materi lanjutan</h3>${next.map((id) => row(id, `${gname(SKILLS[id].grade)} · belum pernah dicoba`)).join('')}` : ''}
      <div class="row-btn left"><button class="btn sm" data-act="asgform" data-s="${k.id}">Buat tugas khusus lainnya</button></div></section>`;
  }
  function settingsCard(ctx) {
    const st = settingsOf(ctx.c);
    return `<section class="card"><h2>🌙 Pengaturan kelas</h2><form data-form="classset" class="form">
        <label>Konteks soal<select name="konteks"><option value="umum" ${st.konteks === 'umum' ? 'selected' : ''}>Umum (standar)</option><option value="islami" ${st.konteks === 'islami' ? 'selected' : ''}>Islami: nama dan benda islami, bab Matematika dalam ibadah</option></select></label>
        <label class="cb"><input type="checkbox" name="adab" value="1" ${st.adab ? 'checked' : ''}> <span>Mode adab: doa sebelum latihan, pujian islami, tanpa papan hadiah dan permainan Kilat</span></label>
        <button class="btn ghost sm">Simpan pengaturan</button></form>
      <p class="small muted">Hanya berlaku untuk kelas ini. Jika keduanya mati, Metiq tampil seperti biasa.</p></section>`;
  }
  function manageHTML(ctx) {
    return `<p class="small muted kelnote">⚙️ Nama kelas, kelas baru, dan pengaturan. Menambah siswa dan kode orang tua ada di tab <a href="#/guru/siswa">🧒 Siswa</a>.</p>
    <div class="grid2">
      <section class="card"><h2>Kelas</h2><form data-form="renameclass" class="form inline"><input name="name" value="${esc(ctx.c.name)}" required><button class="btn ghost">Ganti nama</button></form>
        <form data-form="newclass" class="form inline"><input name="name" placeholder="Nama kelas baru" required><button class="btn ghost">Tambah kelas</button></form>
        <p class="small"><button class="link danger" data-act="delclass" data-id="${ctx.c.id}">🗑️ Hapus "${esc(ctx.c.name)}"</button></p></section>
      ${settingsCard(ctx)}
      ${cloudOn() ? `<section class="card"><h2>Data</h2><p class="muted small">Data kelas tersimpan di server dan otomatis tersinkron ke HP siswa, orang tua, dan guru.</p><div class="row-btn"><button class="btn ghost sm" data-act="export">Unduh cadangan</button></div></section>`
      : `<section class="card"><h2>Cadangan data</h2><p class="muted small">Data tersimpan di perangkat ini. Unduh cadangan secara berkala, atau gabungkan data dari perangkat lain.</p><div class="row-btn"><button class="btn ghost sm" data-act="export">Unduh cadangan</button><label class="btn ghost sm">Gabungkan file<input type="file" accept=".json" data-act="import" hidden></label></div></section>`}
    </div>`;
  }

  function viewTeacherStudent(ctx, sid) {
    const k = S.student(sid); if (!k || k.classId !== ctx.c.id) return go('#/guru/siswa');
    const ans = S.answersOf(sid).sort((a, b) => b.ts - a.ts).slice(0, 30);
    teacherShell(ctx, 'siswa', `<a class="back" href="#/guru/siswa">← Semua siswa</a>${reportHTML(k, 'guru')}${specialAssignHTML(k)}${studentDataHTML(k)}
      <section class="card"><h2>Semua keterampilan yang dicoba</h2><div class="tscroll"><table class="tbl"><thead><tr><th>Keterampilan</th><th>Skor</th><th>Soal</th><th>Benar</th><th>Waktu</th><th>Terakhir</th></tr></thead><tbody>
      ${skillRows(sid).sort((a, b) => a.skill.code.localeCompare(b.skill.code, undefined, { numeric: true })).map((r) => `<tr><td>${r.skill.code} ${r.skill.name}</td><td>${chip(r.score)}</td><td>${r.att}</td><td>${r.acc}%</td><td>${fmtTime(r.ms)}</td><td>${ago(r.last)}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="card"><h2>30 jawaban terakhir</h2><div class="tscroll"><table class="tbl"><thead><tr><th></th><th>Soal</th><th>Jawaban</th><th>Benar</th><th>Keterampilan</th></tr></thead><tbody>
      ${ans.map((a) => `<tr><td>${a.ok ? '✅' : '❌'}</td><td>${esc(a.text)}</td><td>${esc(a.given)}</td><td>${esc(a.answer)}</td><td class="small">${SKILLS[a.skill] ? SKILLS[a.skill].code : ''}</td></tr>`).join('')}</tbody></table></div></section>`);
  }

  /* ---------- Laporan (orang tua & guru) ---------- */
  function reportHTML(k, audience) {
    const s7 = stats(k.id, 7), sAll = stats(k.id);
    const good = strengths(k.id), weak = weaknesses(k.id);
    const tags = tagCounts(S.answersOf(k.id).filter((a) => a.ts > Date.now() - 30 * DAY)).filter(([t]) => t !== 'konsep').slice(0, 3);
    const recentWrong = S.answersOf(k.id).filter((a) => !a.ok).sort((a, b) => b.ts - a.ts).slice(0, 6);
    const nm = esc(k.name);
    const maxDay = Math.max(1, ...s7.byDay.map((d) => d.n));
    const hariPendek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let story;
    if (!sAll.answered) story = `${nm} belum mulai berlatih. Ajak ${nm} membuka Metiq dan mencoba keterampilan pertama, "Membilang benda sampai 10".`;
    else {
      story = s7.answered ? `Dalam 7 hari terakhir, ${nm} menjawab <b>${s7.answered} soal</b> dengan ketepatan <b>${s7.acc}%</b> selama ${fmtTime(s7.ms)}.` : `${nm} tidak berlatih dalam 7 hari terakhir (terakhir ${ago(sAll.last)}).`;
      if (good[0]) story += ` ${nm} sudah kuat di <b>${good.slice(0, 2).map((g) => g.skill.name.toLowerCase()).join('</b> dan <b>')}</b>.`;
      if (weak[0]) story += ` Yang paling perlu dilatih: <b>${weak[0].skill.name.toLowerCase()}</b>${weak[0].tag && weak[0].tag !== 'konsep' ? ` — ${nm} ${TAGS[weak[0].tag].label.toLowerCase()}` : ''}.`;
    }
    return `
      <section class="card report-head"><span class="av lg">${avHTML(k.avatar)}</span><div><h1>${audience === 'ortu' ? 'Laporan belajar ' : audience === 'siswa' ? 'Laporan belajarku: ' : ''}${nm}</h1><p class="muted">${esc((S.cls(k.classId) || {}).name || '')} · 🎁 ${GRADES.reduce((t, g) => t + prizeBoard(k.id, g.id).open, 0)} hadiah · ⭐ ${S.gameStars(k.id)} bintang permainan</p></div></section>
      <section class="card story"><p>${story}</p></section>
      ${diagSummaryHTML(k, audience)}
      <div class="kpis"><div class="kpi"><small>Total soal</small><b>${sAll.answered}</b></div><div class="kpi"><small>Ketepatan</small><b>${sAll.acc}%</b></div><div class="kpi"><small>Waktu belajar</small><b>${fmtTime(sAll.ms)}</b></div><div class="kpi"><small>Keterampilan mahir</small><b>${sAll.proficient}<span> · ${sAll.mastered}🏆</span></b></div></div>
      <section class="card"><h2>Aktivitas 7 hari terakhir</h2><div class="week">${s7.byDay.map((d) => `<div class="wd"><span class="wv">${d.n || ''}</span><i style="height:${Math.round((d.n / maxDay) * 100)}%"></i><small>${hariPendek[new Date(d.d0).getDay()]}</small></div>`).join('')}</div></section>
      <div class="grid2">
        <section class="card good"><h2>👍 Yang sudah bagus</h2>${good.length ? good.slice(0, 6).map((g) => `<div class="lrow"><span class="grow"><b>${g.skill.name}</b><small>${g.att} soal · ${g.acc}% benar</small></span>${chip(g.score)}</div>`).join('') : `<p class="muted">Belum ada keterampilan yang mencapai tingkat mahir (skor 80). Terus berlatih ya!</p>`}</section>
        <section class="card improve"><h2>💪 Yang perlu ditingkatkan</h2>${weak.length ? weak.slice(0, 5).map((w) => `<div class="wrow"><div class="lrow"><span class="grow"><b>${w.skill.name}</b><small>${w.att} soal · ${w.acc}% benar</small></span>${chip(w.score)}</div>
          ${w.tag ? `<p class="small"><b>Pola:</b> ${TAGS[w.tag].label}.</p>` : ''}${w.example ? `<p class="small ex">Contoh: "${esc(w.example.text)}" — dijawab <b class="strike">${esc(w.example.given)}</b>, seharusnya <b>${esc(w.example.answer)}</b>.</p>` : ''}
          <p class="small tip">💡 ${w.tag && w.tag !== 'konsep' ? TAGS[w.tag].tip : UNITS.find((u) => u.id === w.skill.unit).tip} <a href="#/pelajaran/${w.skill.unit}">📖 Pelajarannya</a></p></div>`).join('') : `<p class="muted">Tidak ada keterampilan yang tertinggal. Mantap!</p>`}</section>
      </div>
      ${tags.length ? `<section class="card"><h2>🔍 Pola kesalahan dari jawaban ${nm} (30 hari)</h2>${tags.map(([t, n]) => `<div class="tagrow"><b>${TAGS[t].label}</b> <span class="pill">${n}×</span><p class="small">${audience === 'ortu' ? 'Di rumah: ' : 'Saran: '}${TAGS[t].tip}</p></div>`).join('')}</section>` : ''}
      <section class="card"><h2>Kemajuan per bab</h2>${reportGrades(k.id).map((g, _, all) => (all.length > 1 ? `<p class="small"><b>${gname(g)}</b></p>` : '') + unitsOf(g).map((u) => { const us = unitScore(k.id, u); return `<div class="uprog"><span>${u.icon} ${u.name}</span><span class="ubar"><i style="width:${us.avg}%;background:${u.color}"></i></span><small>${us.prof}/${us.total}</small></div>`; }).join('')).join('')}</section>
      ${audience === 'ortu' && recentWrong.length ? `<section class="card"><h2>Jawaban yang belum tepat (terbaru)</h2>${recentWrong.map((a) => `<div class="wa"><p>${esc(a.text)}</p><small>Jawaban ${nm}: <b class="strike">${esc(a.given)}</b> · Benar: <b>${esc(a.answer)}</b> · ${ago(a.ts)}</small></div>`).join('')}</section>` : ''}`;
  }

  /* ---------- Orang tua ---------- */
  function viewParentEnter() {
    const ses = session.get();
    if (cloudOn() && ses.role === 'ortu' && (ses.ptoken || (ses.pcode && ses.kids))) return go('#/ortu/anak');
    app.innerHTML = shell(`
      <a class="back" href="#/">← Kembali</a>
      ${cloudOn() && PARENTS_ON ? `<section class="card narrow"><div class="bigemoji center">👨‍👩‍👧</div><h1 class="center">Masuk akun orang tua</h1>
        <p class="muted center small">Satu akun untuk semua anak: lihat laporan dan ikut belajar bersama anak.</p>
        <form data-form="plogin" class="form">
          <label>Email<input name="email" type="email" required autocomplete="email"></label>
          <label>Kata sandi<input name="pass" type="password" required autocomplete="current-password"></label>
          <button class="btn">Masuk</button>
        </form><p class="center"><a href="#/ajukan/ortu">Belum punya akun? Ajukan akun orang tua</a> · <a href="#/ajukan/status">Cek status</a></p></section>` : ''}
      <section class="card narrow center">${cloudOn() && PARENTS_ON ? '<h2>Atau lihat laporan dengan kode</h2>' : '<div class="bigemoji">👨‍👩‍👧</div><h1>Laporan untuk orang tua</h1>'}<p class="muted">Masukkan <b>kode keluarga</b> (semua anak sekaligus) atau kode orang tua satu anak. Kode berisi 6 huruf/angka dari admin atau guru.</p>
        <form data-form="parentcode"><input name="code" class="codein" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC123" required><button class="btn ghost">Lihat laporan</button></form>
        <p class="small muted trynote">Ingin mencoba dulu? Masukkan kode <b>1234</b> untuk melihat laporan anak contoh.</p></section>`);
  }
  function viewParentRegister() {
    app.innerHTML = shell(`
      <a class="back" href="#/ortu">← Kembali</a>
      <section class="card narrow"><div class="bigemoji center">👨‍👩‍👧</div><h1 class="center">Daftar akun orang tua</h1>
        <form data-form="pregister" class="form">
          <label>Nama<input name="name" required placeholder="mis. Ayah Bima" autocomplete="name"></label>
          <label>Email<input name="email" type="email" required autocomplete="email"></label>
          <label>Kata sandi (min. 6 karakter)<input name="pass" type="password" minlength="6" required autocomplete="new-password"></label>
          <button class="btn">Buat akun</button>
        </form><p class="muted small center">Setelah masuk, tambahkan anak dengan kode orang tua dari guru.</p></section>`);
  }
  function viewParentHome() {
    const ses = session.get(), demoKids = ses.role === 'ortu' && ses.demo && ses.kids, codeKids = ses.role === 'ortu' && !ses.demo && ses.pcode && ses.kids;
    if (!(ses.role === 'ortu' && (ses.ptoken || demoKids || codeKids))) return go('#/ortu');
    const p = demoKids ? { name: (tryInfo() || {}).name } : codeKids ? { name: 'Ayah/Bunda' } : S.db.parent || {};
    const kids = demoKids || codeKids ? ses.kids.map((id) => S.student(id)).filter(Boolean) : S.db.students;
    app.innerHTML = shell(`
      <section class="dhead"><div><small class="muted">${codeKids ? `Kode keluarga ${esc(ses.pcode)} · ${kids.length} anak` : 'Akun orang tua'}</small><h1>Halo, ${esc(p.name || '')}</h1></div></section>
      ${kids.map((k) => { const s7 = stats(k.id, 7), all = stats(k.id); const c = S.cls(k.classId) || {};
        return `<section class="card kidcard"><div class="report-head"><span class="av lg">${avHTML(k.avatar)}</span><div class="grow"><h2>${esc(k.name)}</h2><p class="muted small">${esc(c.name || '')}${c.teacherName ? ' · ' + esc(c.teacherName) : ''}</p></div></div>
          <div class="kpis"><div class="kpi"><small>Soal 7 hari</small><b>${s7.answered}</b></div><div class="kpi"><small>Ketepatan</small><b>${all.acc}%</b></div><div class="kpi"><small>Mahir</small><b>${all.proficient}</b></div><div class="kpi"><small>Terakhir</small><b class="sm">${ago(all.last)}</b></div></div>
          <div class="row-btn"><a class="btn" href="#/ortu/laporan/${k.id}">Lihat laporan</a>${codeKids ? '' : `<button class="btn ghost" data-act="askid" data-id="${k.id}">Belajar sebagai ${esc(k.name)}</button>`}</div>
          ${demoKids || codeKids ? '' : `<p class="center small"><button class="link muted" data-act="punlink" data-id="${k.id}">Lepas dari akun</button></p>`}</section>`; }).join('') || '<section class="card center"><div class="bigemoji">🧒</div><p class="muted">Belum ada anak yang terhubung.</p></section>'}
      ${codeKids ? '' : demoKids ? `<section class="card"><h2>Tambah anak</h2><p class="muted small">Di mode coba, anak lain ditambahkan dengan mencoba sebagai siswa di perangkat ini (Keluar → Coba sebagai siswa → nama anak), lalu masuk lagi sebagai orang tua.</p></section>${realParentCard(kids[0] || {})}`
        : `<section class="card"><h2>Tambah anak</h2><p class="muted small">Masukkan kode orang tua anak (dari guru).</p>
        <form data-form="plink" class="form inline"><input name="code" class="codein sm" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC123" required><button class="btn">Tambah</button></form></section>`}
    `, { right: topRight() });
  }
  function viewParentReport(sid) {
    const ses = session.get();
    const k = ses.role === 'ortu' && S.student(sid || ses.id) && (!ses.kids || ses.kids.includes(sid || ses.id)) && S.student(sid || ses.id);
    if (!k) return go(ses.ptoken ? '#/ortu/anak' : '#/ortu');
    logParentView(k.id);
    app.innerHTML = shell((ses.ptoken || (ses.kids && ses.kids.length > 1) ? '<a class="back" href="#/ortu/anak">← Anak saya</a>' : '') + reportHTML(k, 'ortu') + `<p class="center muted small">SmartScore: 0–49 Mulai · 50–79 Berkembang · 80–99 Mahir · 100 Tuntas 🏆</p>` + (ses.demo ? realParentCard(k) : ''), { right: topRight() });
  }

  /* ---------- Panduan pemakaian ---------- */
  function viewManual(tab) {
    const M = window.METIQ_MANUAL, ses = session.get();
    if (!M[tab] || tab === 'faq') tab = ses.role === 'siswa' ? 'siswa' : ses.role === 'ortu' ? 'ortu' : 'guru';
    if (tab === 'ortu' && !PARENTS_ON) tab = 'siswa';
    const m = M[tab];
    const tabs = [['guru', `${avHTML('svg:ustadzah')} Guru`], ['ortu', '👨‍👩‍👧 Orang Tua'], ['siswa', '🧒 Siswa']];
    app.innerHTML = shell(`
      <button class="back link noprint" data-act="back">← Kembali</button>
      <div class="gtabs noprint">${tabs.filter(([k]) => PARENTS_ON || k !== 'ortu').map(([k, l]) => `<a class="${k === tab ? 'on' : ''}" href="#/panduan/${k}">${l}</a>`).join('')}</div>
      <div class="mprint">
        <section class="card mhead"><h1>📘 ${m.title}</h1><p>${m.intro}</p><p class="muted small">Metiq · ${esc(location.origin + location.pathname)}</p><button class="btn sm ghost noprint" data-act="printmanual">🖨️ Cetak / simpan PDF</button></section>
        <div class="ltoc noprint">${m.sections.map((x, i) => `<button data-act="mgo" data-i="${i}">${x.icon} ${x.t}</button>`).join('')}</div>
        ${m.sections.map((x, i) => `<section class="card msec" id="ms-${i}"><h2><span class="micon">${x.icon}</span>${i + 1}. ${x.t}</h2><ol class="lsteps">${x.steps.map((st) => `<li>${st}</li>`).join('')}</ol>${x.tip ? `<div class="mtip">💡 ${x.tip}</div>` : ''}</section>`).join('')}
        <section class="card msec"><h2><span class="micon">❓</span>Pertanyaan umum</h2>${M.faq.map(([q, a]) => `<details class="faq" open><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>
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
  const bellHTML = () => { const seen = getSeen(), n = notifItems().filter((i) => i.at > seen).length; return `<a class="bell" href="#/notifikasi" aria-label="Notifikasi${n ? `, ${n} baru` : ''}">🔔${n ? `<b>${n > 9 ? '9+' : n}</b>` : ''}</a>`; };
  const topRight = () => `<span class="topr"><a class="help" href="#/panduan" aria-label="Panduan">❓</a>${bellHTML()}<button class="link" data-act="logout">Keluar</button></span>`;

  function viewNotifications() {
    const x = session.get();
    if (x.role !== 'guru' && x.role !== 'ortu') return go('#/');
    const seen = getSeen(), items = notifItems();
    let body;
    if (x.role === 'guru') {
      body = items.length ? items.map((n) => `<a class="notif ${n.at > seen ? 'new' : ''}" href="#/guru/siswa/${n.k.id}"><span class="av sm">${avHTML(n.k.avatar)}</span><span class="grow"><b>${esc(n.k.name)}</b> menyelesaikan tugas <b>${esc(n.a.note || 'Tugas')}</b><small>${ftime(n.at)} · ${doneText(n)}</small></span>${n.at > seen ? '<i class="dot-new"></i>' : ''}</a>`).join('')
        : emptyCard('Belum ada notifikasi', 'Notifikasi muncul saat siswa menyelesaikan tugas yang Anda berikan.');
    } else {
      body = items.length ? items.map((n) => {
        const sk = n.a.skills.filter((k) => SKILLS[k]), prof = sk.filter((k) => S.progress(n.k.id, k).score >= 80).length;
        const reported = S.isDone(n.a.id, n.k.id), done = reported || prof === sk.length, c = S.cls(n.k.classId) || {};
        return `<section class="card notif-card ${n.at > seen ? 'new' : ''}"><div class="lrow"><span class="av sm">${avHTML(n.k.avatar)}</span><span class="grow"><b>📌 ${n.a.students && n.a.students.length ? 'Tugas khusus' : 'Tugas baru'} untuk ${esc(n.k.name)}</b><small>${esc(c.teacherName || 'Guru')}${n.at ? ` · ${ftime(n.at)}` : ''}${n.a.due ? ` · tenggat ${esc(fdue(n.a.due))}` : ''}</small></span>${n.at > seen ? '<i class="dot-new"></i>' : ''}</div>
          <p><b>${esc(n.a.note || 'Tugas dari guru')}</b></p>
          <div class="small">${sk.map((k) => `<span class="pill ${S.progress(n.k.id, k).score >= 80 ? 'okp' : ''}">${SKILLS[k].code} ${SKILLS[k].name}${S.progress(n.k.id, k).score >= 80 ? ' ✅' : ''}</span>`).join(' ')}</div>
          <p class="small ${done ? 'okc' : 'muted'}">${done ? `✅ Sudah selesai${reported ? ' dan terkirim ke guru' : ''}` : `${prof} dari ${sk.length} keterampilan sudah mahir`}</p>
          <div class="row-btn left">${x.ptoken && !done ? `<button class="btn sm" data-act="askid" data-id="${n.k.id}">Kerjakan sebagai ${esc(n.k.name)}</button>` : ''}${reported ? '' : `<button class="btn sm ghost" data-act="reportdone" data-a="${n.a.id}" data-s="${n.k.id}">Laporkan sudah dikerjakan</button>`}</div>${feedbackHTML(n.a, n.k.id, 'ortu')}</section>`;
      }).join('') : emptyCard('Belum ada tugas', 'Notifikasi muncul saat guru memberikan tugas baru untuk anak Anda.');
    }
    const back = x.role === 'guru' ? '#/guru/ringkasan' : x.ptoken ? '#/ortu/anak' : '#/ortu/laporan';
    setSeen();
    app.innerHTML = shell(`<a class="back" href="${back}">← Kembali</a><h1>🔔 Notifikasi</h1><p class="muted small">${x.role === 'guru' ? 'Siswa yang sudah menyelesaikan tugas, terbaru di atas.' : 'Tugas dari guru untuk anak Anda, terbaru di atas.'}</p>${body}`, { right: topRight() });
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
      <a class="back" href="${t.back}">← Kembali</a>
      <section class="card center"><div class="av lg avnow">${avHTML(t.cur)}</div><h1>Pilih avatar ${esc(t.who)}</h1></section>
      ${window.METIQ_AVATARS.CATALOG.map(([cat, list]) => `<section class="card"><h2>${cat}</h2><div class="avgrid">${list.map((a) => `<button class="avopt ${a === t.cur ? 'on' : ''}" data-act="pickav" data-t="${target}" data-a="${esc(a)}" title="${esc(window.METIQ_AVATARS.NAMES[a] || '')}">${avHTML(a)}</button>`).join('')}</div></section>`).join('')}`);
  }
  async function saveAvatar(target, a) {
    const ses = session.get(), t = avatarTarget(target);
    if (!t) return;
    try {
      if (target === 'saya') { if (cloudOn()) await Cloud.rpc('student_set_avatar', { p_code: ses.code, p_student_id: ses.id, p_avatar: a }); S.setStudentAvatar(ses.id, a); }
      else if (target === 'guru') { if (cloudOn()) await Cloud.rpc('teacher_set_avatar', { p_token: ses.token, p_avatar: a }); S.setTeacherAvatar(ses.id, a); }
      else { const sid = target.slice(6); if (cloudOn()) await Cloud.rpc('teacher_set_student_avatar', { p_token: ses.token, p_student_id: sid, p_avatar: a }); S.setStudentAvatar(sid, a); }
      toast('Avatar diganti ✔'); go(t.back);
    } catch (e) { toast(e.status ? e.message : 'Tidak bisa terhubung ke server'); }
  }

  /* ---------- Pelajaran: materi singkat + contoh "Ayo coba!" per bab ---------- */
  const LESSONS = window.METIQ_LESSONS || {};
  function lessonExample(skillId) {
    const q = SKILLS[skillId].gen();
    return `<p class="qtext">${q.text}</p>${q.vis ? `<div class="qvis">${q.vis}</div>` : ''}${q.options ? `<div class="lopts">${q.options.map((o) => `<span>${o}</span>`).join('')}</div>` : ''}
      <details class="lsol"><summary>Lihat cara mengerjakan</summary><p class="lans">Jawaban: <b>${q.unit === 'Rp' ? 'Rp' : ''}${q.answer}</b></p><p>${q.explain}</p></details>`;
  }
  // Isi pelajaran dipakai di halaman Pelajaran dan sebagai lembar di atas soal (inPractice), supaya soal tidak hilang saat anak membuka materi
  function lessonInner(uid, inPractice) {
    const u = UNITS.find((x) => x.id === uid), les = LESSONS[uid];
    const kid = session.get().role === 'siswa';
    const practice = (id) => (kid ? `#/latihan/${id}` : `#/coba/${id}`);
    const prog = kid ? S.progressAll(session.get().id) : {};
    return `
      ${inPractice ? '' : '<button class="back link" data-act="back">← Kembali</button>'}
      <section class="card lhead" style="--c:${u.color}"><span class="uicon">${u.icon}</span><div class="grow"><small class="muted">Pelajaran · ${gname(u.grade)} · Bab ${u.id}</small><h1>${u.name}</h1><p>${les.intro}</p></div><button class="say" data-act="lsay" data-u="${uid}" data-i="-1" aria-label="Bacakan">🔊</button></section>
      ${(() => { const b = unitBuddy(u); return b ? `<div class="mq-say lbuddy">${MQ.svg('hello', { size: 76, who: b, enter: !inPractice })}<div class="mq-bubble"><p>Ayo belajar bersama <b>${buddyName(b)}</b>!</p></div></div>` : ''; })()}
      ${(window.METIQ_JOBS || { MISSIONS: [] }).MISSIONS.some((m) => m.units.includes(uid)) ? `<a class="jwhere" href="#/profesi/topik/${uid}">🧑‍🔧 Dipakai di pekerjaan apa?</a>` : ''}
      ${hikmahHTML(uid)}
      ${window.METIQ_ANIM.has(uid) ? `<section class="card anim-card"><h2>🎬 Animasi: ${u.name}</h2><div id="anim-box"></div></section>` : ''}
      ${les.parts.length > 1 ? `<div class="ltoc">${les.parts.map((p, i) => `<button data-act="lgo" data-i="${i}">${i + 1}. ${p.t}</button>`).join('')}</div>` : ''}
      ${les.parts.map((p, i) => `<section class="card lpart" id="lp-${i}">
        <div class="lph"><span class="lnum" style="background:${u.color}">${i + 1}</span><h2>${p.t}</h2><button class="say sm" data-act="lsay" data-u="${uid}" data-i="${i}" aria-label="Bacakan">🔊</button></div>
        <ol class="lsteps">${p.steps.map((st) => `<li>${st}</li>`).join('')}</ol>
        ${p.sg ? `<div class="sgnote"><span class="sgtag">Cara Singapura</span> ${p.sg}</div>` : ''}
        <div class="lex"><h3>Ayo coba!</h3><div id="lex-${i}">${lessonExample(p.ex)}</div>
          <div class="row-btn left"><button class="btn sm ghost" data-act="lexnew" data-i="${i}" data-sk="${p.ex}">🔄 Contoh lain</button>${inPractice ? '' : `<a class="btn sm" href="${practice(p.ex)}">Latihan: ${SKILLS[p.ex].name} →</a>`}</div></div>
      </section>`).join('')}
      ${inPractice ? '' : `<section class="card"><h2>Latihan di bab ini</h2><div class="sklist">${u.skills.map((s) => (kid ? skillLink(s.id, prog[s.id]) : `<a class="sk" href="${practice(s.id)}"><span class="sk-code">${s.code}</span><span class="sk-name">${s.name}</span><span class="chip lv0">→</span></a>`)).join('')}</div></section>`}`;
  }
  function viewLesson(uid) {
    const u = UNITS.find((x) => x.id === uid), les = LESSONS[uid];
    if (!u || !les) return go('#/kurikulum');
    app.innerHTML = shell(lessonInner(uid, false));
    window.METIQ_ANIM.mount(document.getElementById('anim-box'), uid);
  }
  // Materi dibuka di atas soal tanpa pindah halaman: soal, jawaban, dan penjelasan tetap utuh di belakangnya
  function openLessonOver(uid) {
    if (!UNITS.find((x) => x.id === uid) || !LESSONS[uid]) return toast('Materi bab ini belum tersedia');
    if (document.getElementById('mqover')) return;
    const el = document.createElement('div'); el.id = 'mqover'; el.className = 'mq-over';
    el.innerHTML = `<div class="mq-over-top"><button class="mq-btn sm" data-act="lclose">← Kembali ke soal</button></div>
      <div class="mq-over-body">${lessonInner(uid, true)}</div>
      <div class="mq-foot"><div class="mq-foot-in"><button class="mq-btn pulse" data-act="lclose">Kembali ke soal</button></div></div>`;
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
    return `<section class="card hikmah"><h2>🌙 Hikmah: ${esc(h.tema || '')}</h2>
      ${adaLah ? `<blockquote>${d.ar ? `<p class="doa-ar" dir="rtl" lang="ar">${esc(d.ar)}</p>` : ''}${d.id ? `<p>${esc(d.id)}</p>` : ''}${d.ref ? `<cite>${esc(d.ref)}</cite>` : ''}</blockquote>` : ''}
      ${h.ajakan ? `<p>${esc(h.ajakan)}</p>` : ''}${h.refleksi ? `<p><b>Renungkan:</b> ${esc(h.refleksi)}</p>` : ''}${h.adab ? `<p><b>Adab:</b> ${esc(h.adab)}</p>` : ''}
      ${h.verifiedAt ? `<p class="small muted">Diperiksa oleh ${esc(h.verifiedBy || '-')} · ${esc(h.verifiedAt)}</p>` : `<p class="small muted">Dalil ayat dan hadits sedang diperiksa ustadz/ustadzah, jadi belum ditampilkan di sini.</p>`}</section>`;
  }

  /* Pratinjau soal untuk guru (tidak disimpan) */
  function viewPreview(id) {
    const sk = SKILLS[id]; if (!sk) return go('#/guru');
    const qs = Array.from({ length: 3 }, () => sk.gen());
    app.innerHTML = shell(`<a class="back" href="#/guru/keterampilan">← Kembali</a><h1>${sk.code} ${sk.name}</h1><p class="muted">Contoh soal acak (tidak dicatat).</p>
      ${qs.map((q) => `<section class="qcard"><p class="qtext">${q.text}</p>${q.vis ? `<div class="qvis">${q.vis}</div>` : ''}${q.options ? `<p class="small">Pilihan: ${q.options.join(' · ')}</p>` : ''}<div class="explain"><b>Jawaban: ${q.answer}</b><p>${q.explain}</p></div></section>`).join('')}
      <button class="btn" data-act="reload">Soal lain</button>`);
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
  const bandPills = (band) => `<div class="jbands" role="tablist" aria-label="Jenjang">${J.BANDS.map((b) => `<button class="${b.id === band ? 'on' : ''}" data-act="jband" data-b="${b.id}" role="tab" aria-selected="${b.id === band}">${b.name}</button>`).join('')}</div>`;

  function viewJobs() {
    const kid = gameKid(), band = jobBand();
    if (!band) {
      app.innerHTML = mqPage(`<div class="mq-ghead"><a class="mq-ico" href="#/" aria-label="Kembali">${IC.back}</a><div class="mq-gsay">${MQ.svg('ask', { size: 74 })}<div class="mq-bubble"><p>Kamu di jenjang apa?</p></div></div></div>
        <div class="jpick">${J.BANDS.map((b) => `<button class="mq-btn ghost" data-act="jband" data-b="${b.id}"><b>${b.name}</b><small>${b.style}</small></button>`).join('')}</div>`, 'profesi');
      return;
    }
    const f = ls.get('metiq_jfilter', {}), inBand = J.MISSIONS.filter((m) => m.level === band);
    const profs = J.PROFESSIONS.filter((p) => (!f.i || p.interest === f.i) && inBand.some((m) => m.profession === p.id && (!f.t || m.topics.includes(f.t))));
    const chip = (k, v, label) => `<button class="${(f[k] || '') === v ? 'on' : ''}" data-act="jfilter" data-k="${k}" data-v="${v}">${label}</button>`;
    const tile = (p) => {
      const m = inBand.find((x) => x.profession === p.id), done = m && missionDone(kid, m), st = m ? missionStars(kid, m) : 0;
      return `<a class="mq-gt jtile" href="#/profesi/${p.id}" style="--c:${p.color};--bg:#fff" aria-label="${esc(p.name)}${done ? ', selesai' : ''}">${done ? '<span class="new jdone">✓</span>' : ''}<span class="art"><span class="jpeople">${p.people}</span></span><b>${esc(p.name)}</b><small>${m ? esc(m.title) : ''}</small>${done ? `<span class="st">${[0, 1, 2].map((i) => gStar(i < st)).join('')}</span>` : ''}</a>`;
    };
    app.innerHTML = mqPage(`
      <div class="mq-ghead">${kid ? '' : `<a class="mq-ico" href="#/" aria-label="Kembali">${IC.back}</a>`}
        <div class="mq-gsay">${MQ.svg('happy', { size: 74 })}<div class="mq-bubble"><p>Sehari jadi apa hari ini?</p></div></div></div>
      ${bandPills(band)}
      <div class="jfilters"><div>${chip('i', '', 'Semua minat')}${Object.entries(J.INTERESTS).map(([k, v]) => chip('i', k, v)).join('')}</div>
        <div>${chip('t', '', 'Semua topik')}${Object.entries(J.TOPICS).map(([k, v]) => chip('t', k, v)).join('')}</div></div>
      ${profs.length ? `<div class="mq-ggrid">${profs.map(tile).join('')}</div>` : `<p class="mq-note">Belum ada misi untuk pilihan ini. Coba minat atau topik lain.</p>`}
      <p class="mq-note">${kid ? `Misi selesai: <b>${J.MISSIONS.filter((m) => missionDone(kid, m)).length}</b> dari ${J.MISSIONS.length}` : 'Masuk sebagai siswa agar misimu tersimpan.'}</p>`, 'profesi');
  }

  function viewProfession(pid) {
    const p = J.prof(pid); if (!p) return go('#/profesi');
    const kid = gameKid(), band = jobBand();
    const list = J.MISSIONS.filter((m) => m.profession === pid).sort((a, b) => bandIdx(a.level) - bandIdx(b.level));
    app.innerHTML = mqPage(`
      <div class="mq-ghead"><a class="mq-ico" href="#/profesi" aria-label="Kembali">${IC.back}</a><span class="mq-gtitle">${esc(p.name)}</span></div>
      <section class="jhero" style="--c:${p.color}"><div class="jpeople big">${p.people}</div><div class="jart">${p.art}</div>
        <h2>Apa yang dikerjakan?</h2><p>${esc(p.what)}</p><h2>Matematika yang dipakai</h2><p>${esc(p.math)}</p></section>
      <h2 class="jsub">Misi</h2>
      <div class="jmissions">${list.map((m) => { const done = missionDone(kid, m), st = missionStars(kid, m); return `<a class="jmis ${m.level === band ? 'mine' : ''}" href="#/misi/${m.id}" style="--c:${p.color}"><span class="lv">${(J.BANDS.find((b) => b.id === m.level) || {}).name}</span><span class="grow"><b>${esc(m.title)}</b><small>${m.topics.map((t) => J.TOPICS[t]).join(' · ')}${m.audio ? ' · 🎧 dibacakan' : ''}</small></span>${done ? `<span class="st">${[0, 1, 2].map((i) => gStar(i < st)).join('')}</span>` : '<span class="go">›</span>'}</a>`; }).join('')}</div>`, 'profesi');
  }

  // Tempat misi dipakai: dari halaman pelajaran ("Dipakai di pekerjaan apa?")
  function viewJobTopic(uid) {
    const u = UNITS.find((x) => x.id === uid), list = J.MISSIONS.filter((m) => m.units.includes(uid));
    if (!u || !list.length) return go('#/profesi');
    app.innerHTML = mqPage(`
      <div class="mq-ghead"><button class="mq-ico" data-act="back" aria-label="Kembali">${IC.back}</button><span class="mq-gtitle">Dipakai di pekerjaan apa?</span></div>
      <p class="jlead">${u.icon} <b>${esc(u.name)}</b> dipakai dalam pekerjaan ini:</p>
      <div class="jmissions">${list.map((m) => { const p = J.prof(m.profession); return `<a class="jmis" href="#/misi/${m.id}" style="--c:${p.color}"><span class="jpeople">${p.people}</span><span class="grow"><b>${esc(p.name)}</b><small>${esc(m.title)} · ${(J.BANDS.find((b) => b.id === m.level) || {}).name}</small></span><span class="go">›</span></a>`; }).join('')}</div>`, 'profesi');
  }

  /* Pemutar misi: satu soal per layar; salah → petunjuk dan coba lagi (setelah 3 kali, jawaban ditunjukkan) */
  let JM = null;
  const jAudio = (part) => (JM && JM.m.audio ? [`audio/kerja/${JM.m.key}-${part}.mp3`] : null);
  const jPlay = (part, delay) => { const a = jAudio(part); if (a) playClips(a, delay); };
  const jnum = (s) => {
    s = String(s).trim().replace(/[−–]/g, '-').replace(/\./g, '').replace(',', '.');
    if (/^-?\d+(\.\d+)?\/\d+(\.\d+)?$/.test(s)) { const [a, b] = s.split('/').map(Number); return b ? a / b : NaN; }
    return s === '' || s === '-' ? NaN : Number(s);
  };
  const jFmt = (v) => (Math.round(v * 1e4) / 1e4).toLocaleString('id-ID', { maximumFractionDigits: 4 });
  function viewMission(id) {
    const m = J.byId(id); if (!m) return go('#/profesi');
    const p = J.prof(m.profession);
    JM = { m, p, i: -1, tries: 0, first: 0, input: '', sel: -1, place: {}, pick: null, t0: Date.now(), log: [] };
    app.innerHTML = `<div class="mq-top"><a class="mq-ico" href="#/profesi/${p.id}" aria-label="Keluar">${IC.x}</a><div class="mq-prog"><i id="sbar" style="width:0%"></i></div>
        ${m.audio ? `<button class="mq-ico" data-act="jsay" aria-label="Dengarkan">🔊</button>` : `<button class="mq-ico psound" data-act="sound" aria-label="Suara">${window.SFX.enabled() ? '🔔' : '🔕'}</button>`}</div>
      <main class="mq-screen" id="pq"></main><div class="mq-foot" id="fb"></div>`;
    jScene();
  }
  function jScene() {
    const { m, p } = JM, box = document.getElementById('pq'), fb = document.getElementById('fb');
    box.innerHTML = `<div class="jscene" style="--c:${p.color}"><div class="jart big">${m.art}</div><small class="jlv">${esc(p.name)} · ${(J.BANDS.find((b) => b.id === m.level) || {}).name}</small><h1>${esc(m.title)}</h1>
      <div class="mq-say"><div>${MQ.svg('hello', { size: 76 })}</div><div class="mq-bubble"><span>${esc(m.scenario)}</span></div></div>
      ${m.simplified ? `<p class="jnote">ℹ️ ${esc(m.simplified)}</p>` : ''}</div>`;
    fb.className = 'mq-foot'; fb.innerHTML = `<div class="mq-foot-in"><button class="mq-btn pulse" data-act="jnext">Mulai misi</button></div>`;
    jPlay('s', 350);
  }
  function jStep() {
    const { m } = JM, st = m.steps[JM.i], box = document.getElementById('pq'), fb = document.getElementById('fb');
    JM.tries = 0; JM.input = ''; JM.sel = -1; JM.place = {}; JM.pick = null;
    document.getElementById('sbar').style.width = (JM.i / m.steps.length) * 100 + '%';
    // Cerita misi (berisi datanya) dan jawaban langkah sebelumnya tetap terlihat di setiap langkah
    const found = JM.log.map((x, k) => `<li><small>Langkah ${k + 1}: ${esc(x.q)}</small><b>${x.a}</b></li>`).join('');
    const ctx = `<details class="jctx" ${m.level === 'TK' ? '' : 'open'}><summary>📋 Data misi</summary><p>${esc(m.scenario)}</p>${found ? `<ul class="jfound">${found}</ul>` : ''}</details>`;
    box.innerHTML = `<h2 class="mq-title">Langkah ${JM.i + 1} dari ${m.steps.length}</h2>${ctx}
      <div class="mq-say"><div id="mqm">${MQ.svg('normal', { size: 76, enter: false })}</div><div class="mq-bubble">${m.audio ? '<button class="mq-spk aud" data-act="jsay" aria-label="Dengarkan soal">' + IC.spk + '</button>' : ''}<span>${esc(st.question)}</span>${st.hint ? `<span class="jhintw"><button class="mq-link" data-act="jhint">💡 Butuh petunjuk?</button></span><span class="jhint" id="jhint" hidden>💡 ${esc(st.hint)}</span>` : ''}</div></div>
      ${st.vis ? `<div class="mq-vis">${st.vis}</div>` : ''}<div id="jbody"></div>`;
    jBody();
    jPlay('q' + (JM.i + 1), 300);
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
      keys = `<div class="mq-keys extra">${['−', ',', '/'].map((k) => `<button class="mq-key" data-act="jkey" data-k="${k}">${k}</button>`).join('')}</div>
        <div class="mq-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="mq-key" data-act="jkey" data-k="${n}">${n}</button>`).join('')}<button class="mq-key del" data-act="jkey" data-k="del" aria-label="Hapus">⌫</button><button class="mq-key" data-act="jkey" data-k="0">0</button></div>`;
      ready = JM.input !== '';
    } else if (st.type === 'drag') {
      const placed = new Set(Object.values(JM.place).flat());
      const item = (it) => `<button class="jitem ${JM.pick === it.id ? 'pick' : ''}" data-act="jitem" data-id="${it.id}" aria-label="Benda">${it.html}</button>`;
      const pool = st.items.filter((it) => !placed.has(it.id));
      if (st.mode === 'order') {
        const seq = JM.place.seq || [];
        body.innerHTML = `<p class="jhow">Ketuk atau seret ke kotak bernomor, sesuai urutan.</p><div class="jslots">${st.items.map((_, k) => { const id = seq[k], it = st.items.find((x) => x.id === id); return `<div class="jslot" data-slot="${k}"><small>${k + 1}</small>${it ? item(it) : ''}</div>`; }).join('')}</div>
          <div class="jpool">${pool.map(item).join('') || '<small>Semua sudah ditaruh. Ketuk benda di kotak untuk mengembalikannya.</small>'}</div>`;
        ready = seq.length === st.items.length;
      } else {
        body.innerHTML = `<p class="jhow">Ketuk benda lalu ketuk kotaknya, atau seret ke kotak.</p><div class="jbins">${st.bins.map((b) => `<div class="jbin" data-bin="${b.id}" data-act="jbin"><b>${b.label}</b><div>${(JM.place[b.id] || []).map((id) => item(st.items.find((x) => x.id === id))).join('')}</div></div>`).join('')}</div>
          <div class="jpool">${pool.map(item).join('') || '<small>Semua sudah dikelompokkan.</small>'}</div>`;
        ready = pool.length === 0;
      }
    }
    fb.className = 'mq-foot';
    fb.innerHTML = `<div class="mq-foot-in">${keys}<button class="mq-btn" id="mqcheck" data-act="jcheck" ${ready ? '' : 'disabled'}>Periksa</button></div>`;
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
    if (m) { m.innerHTML = MQ.svg(ok ? 'happy' : 'oops', { size: 76, enter: false }); m.firstChild.classList.add('mq-react'); }
    if (ok) {
      if (!JM.tries) JM.first++;
      JM.log.push({ q: st.question, a: jAnswerText(st), ex: st.explanation, first: !JM.tries });
      window.SFX.correct();
      fb.className = 'mq-foot ok';
      fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${IC.ok}</span>${['Benar!', 'Tepat sekali!', 'Hebat!'][JM.i % 3]}</div><div class="mq-fbody"><p>${esc(st.explanation)}</p></div><button class="mq-btn" data-act="jnext">Lanjut</button></div>`;
      jPlay('e' + (JM.i + 1), 300);
    } else {
      JM.tries++;
      window.SFX.wrong();
      if (JM.tries >= 3) {
        JM.log.push({ q: st.question, a: jAnswerText(st), ex: st.explanation, first: false });
        fb.className = 'mq-foot no';
        fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">${IC.x}</span>Ayo lihat caranya</div><div class="mq-fbody"><p>Jawabannya: <b>${jAnswerText(st)}</b></p><p>${esc(st.explanation)}</p></div><button class="mq-btn" data-act="jnext">Lanjut</button></div>`;
        jPlay('e' + (JM.i + 1), 300);
      } else {
        fb.className = 'mq-foot near';
        fb.innerHTML = `<div class="mq-foot-in"><div class="mq-fbh"><span class="ic">!</span>Belum tepat</div><div class="mq-fbody"><p>💡 ${esc(st.hint)}</p></div><button class="mq-btn" data-act="jretry">Coba lagi</button></div>`;
        jPlay('h' + (JM.i + 1), 300);
      }
    }
    document.getElementById('pq').style.paddingBottom = fb.offsetHeight + 20 + 'px';
  }
  function jFinish() {
    const { m, p } = JM, kid = gameKid(), n = m.steps.length, stars = JM.first === n ? 3 : JM.first >= n / 2 ? 2 : 1;
    document.getElementById('sbar').style.width = '100%';
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
    document.getElementById('pq').innerHTML = `<div class="jresult" style="--c:${p.color}">${MQ.svg(stars >= 2 ? 'cheer' : 'happy', { size: 130 })}
        <div class="mq-gstars">${[0, 1, 2].map((i) => gStar(i < stars)).join('')}</div><h1>Misi selesai!</h1><p class="jwrap">${esc(m.wrapUp)}</p>
        <section class="jcard"><h2>✅ Jawaban dan penjelasan</h2><ol>${JM.log.map((x) => `<li><small>${esc(x.q)}</small><b>${x.a}</b> ${x.first ? '⭐' : ''}<p>${esc(x.ex)}</p></li>`).join('')}</ol></section>
        <section class="jcard"><h2>🧮 Matematika yang kamu pakai</h2><div class="jtopics">${m.units.map(unitLink).join('')}</div></section>
        <section class="jcard"><h2>🚀 Apa selanjutnya?</h2><p>Di jenjang yang lebih tinggi, ${esc(p.name.toLowerCase())} memakai: <b>${m.nextMath.map(esc).join(', ')}</b>.</p>
          ${higher.length ? `<div class="jmissions">${higher.map((x) => `<a class="jmis" href="#/misi/${x.id}" style="--c:${p.color}"><span class="lv">${(J.BANDS.find((b) => b.id === x.level) || {}).name}</span><span class="grow"><b>${esc(x.title)}</b></span><span class="go">›</span></a>`).join('')}</div>` : ''}</section></div>`;
    const fb = document.getElementById('fb'); fb.className = 'mq-foot';
    fb.innerHTML = `<div class="mq-foot-in jfoot">${nextM ? `<a class="mq-btn" href="#/misi/${nextM.id}">Misi lain: ${esc(J.prof(nextM.profession).name)}</a>` : ''}<a class="mq-btn ghost" href="#/profesi/${p.id}">Kembali ke ${esc(p.name)}</a></div>`;
    document.getElementById('pq').style.paddingBottom = fb.offsetHeight + 20 + 'px';
    jPlay('w', 500);
  }
  function jAct(act, el) {
    if (!JM) return;
    if ((act === 'jitem' || act === 'jbin') && Date.now() - jDragJustEnded < 400) return;
    const st = JM.i >= 0 ? JM.m.steps[JM.i] : null;
    if (act === 'jnext') { stopClips(); JM.i++; return JM.i < JM.m.steps.length ? jStep() : jFinish(); }
    if (act === 'jretry') { const m = document.getElementById('mqm'); if (m) m.innerHTML = MQ.svg('normal', { size: 76, enter: false }); if (st.type === 'number') JM.input = ''; return jBody(); }
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


  /* ---------- Harga: gratis untuk keluarga dan guru, berbayar untuk sekolah (model Khan Academy Kids) ---------- */
  const PRICE = 15000, rp = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
  function viewPricing() {
    const yes = '<span class="pyes" aria-label="Termasuk">✓</span>', no = '<span class="pno" aria-label="Tidak termasuk">–</span>';
    const rows = [
      ['Semua latihan TK sampai Kalkulus, pelajaran, permainan, Sehari Bekerja', yes, yes, yes],
      ['Jalur belajar menyesuaikan kemampuan anak', yes, yes, yes],
      ['Tanpa iklan', yes, yes, yes],
      ['Laporan untuk orang tua', yes, yes, yes],
      ['Kelas dengan kode kelas, tambah siswa dengan kode belajar', no, yes, yes],
      ['Memberi tugas untuk kelas, kelompok, atau satu siswa', no, yes, yes],
      ['Laporan kelas: Semua kemajuan, analitik, peringkat', no, yes, yes],
      ['Dasbor dan laporan sekolah lintas kelas dan guru', no, no, yes],
      ['Admin sekolah mengelola guru dan kelas', no, no, yes],
      ['Asesmen awal–akhir (pre/post) dan data penelitian', no, no, yes],
      ['Pelatihan guru dan pendampingan', no, no, yes],
    ];
    const faq = [
      ['Apakah Metiq gratis untuk guru?', 'Ya. Siapa pun yang mengajar matematika bisa mendaftar gratis dan langsung aktif: membuat kelas, menambah siswa, memberi tugas, dan melihat laporan kelas. Tidak ada paket berbayar untuk satu kelas.'],
      ['Apa yang dibayar sekolah?', 'Lapisan sekolah di atas aplikasi gratis: dasbor dan laporan lintas kelas, admin sekolah yang mengelola guru, asesmen awal–akhir untuk mengukur peningkatan, serta pelatihan dan pendampingan.'],
      ['Berapa biayanya?', `${rp(PRICE)} per siswa per tahun. Contoh: sekolah dengan 200 siswa membayar ${rp(PRICE * 200)} per tahun.`],
      ['Bagaimana guru masuk ke sekolah?', 'Guru mendaftar gratis dulu. Admin sekolah lalu menambahkan guru ke sekolahnya lewat email guru di tab 🏫 Sekolah → Kelola guru.'],
      ['Bagaimana cara membayar?', 'Isi formulir penawaran di bawah. Tim Metiq menghubungi Anda, mengirim rincian biaya, lalu mengaktifkan paket Sekolah setelah pembayaran.'],
      ['Bagaimana data siswa dijaga?', 'Metiq tidak menampilkan iklan dan tidak menjual data. Guru lain tidak bisa melihat nama siswa yang belum masuk kelasnya; guru hanya bisa menambah siswa dengan kode belajar dari anak atau orang tuanya.'],
    ];
    app.innerHTML = shell(`<a class="back" href="#/">← Kembali</a>
      <section class="phero"><h1>Satu aplikasi, tiga cara memakainya</h1><p>Metiq gratis untuk keluarga dan guru. Sekolah membayar <b>${rp(PRICE)} per siswa per tahun</b> untuk dasbor sekolah, pengelolaan guru, asesmen awal–akhir, dan pendampingan.</p></section>
      <div class="plans">
        <section class="plan"><small>Di rumah</small><h2>Keluarga</h2><b class="price">Gratis</b><p>Anak belajar sendiri sesuai levelnya, orang tua melihat kemajuannya.</p><a class="btn ghost" href="#/siswa-baru">Mulai belajar</a></section>
        <section class="plan hl"><small>Satu kelas</small><h2>Guru</h2><b class="price">Gratis</b><p>Alat kelas lengkap untuk memberi tugas dan memantau kemajuan. Langsung aktif.</p><a class="btn" href="#/guru/daftar">Daftar guru gratis</a></section>
        <section class="plan"><small>Banyak kelas</small><h2>Sekolah</h2><b class="price">${rp(PRICE)}<span>/siswa/tahun</span></b><p>Dasbor sekolah, admin mengelola guru, asesmen awal–akhir, pelatihan.</p><a class="btn ghost" href="#quote" data-act="quotego">Minta penawaran</a></section>
      </div>
      <section class="card"><h2>Bandingkan</h2><div class="tscroll"><table class="tbl pcompare"><thead><tr><th></th><th>Keluarga</th><th>Guru</th><th>Sekolah</th></tr></thead><tbody>
        ${rows.map(([t, a, b, c]) => `<tr><td>${t}</td><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="card"><h2>🧮 Hitung biaya sekolah</h2><label class="pcalc">Jumlah siswa <input type="number" min="1" max="100000" value="200" data-act="pcalc" inputmode="numeric"></label><p class="pcalc-out">Biaya per tahun: <b id="pcalc-v">${rp(PRICE * 200)}</b></p></section>
      <section class="card"><h2>Mengapa sekolah membayar?</h2><p>Latihan, pelajaran, dan alat kelas tetap gratis untuk guru dan keluarga. Biaya sekolah membiayai lapisan yang dibutuhkan saat Metiq dipakai di banyak kelas: laporan lintas kelas, pengelolaan guru, asesmen untuk mengukur peningkatan, pelatihan, dan dukungan langsung.</p></section>
      <section class="card" id="quote"><h2>📨 Minta penawaran untuk sekolah</h2>
        ${cloudOn() ? `<form data-form="quote" class="form"><label>Nama sekolah<input name="school" required minlength="2" maxlength="120"></label><label>Kota<input name="city" maxlength="80"></label>
          <label>Perkiraan jumlah siswa<input name="students" type="number" min="1" max="100000" required inputmode="numeric"></label><label>Nama Anda<input name="name" required minlength="2" maxlength="80"></label>
          <label>No. WhatsApp atau email<input name="contact" required minlength="5" maxlength="120"></label><label>Catatan <small class="muted">(opsional)</small><textarea name="note" rows="2" maxlength="500"></textarea></label>
          <button class="btn">Kirim permintaan</button></form><p class="small muted">Tim Metiq akan menghubungi Anda untuk rincian biaya dan aktivasi.</p>` : '<p class="muted">Formulir penawaran butuh koneksi ke server Metiq.</p>'}</section>
      <section class="card"><h2>Pertanyaan yang sering diajukan</h2>${faq.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>`);
  }

  /* ---------- Rute ---------- */
  let routeSeq = 0;
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
      case 'asesmen': return b === 'hasil' ? viewDiagResult('a') : b === 'akhir' ? (c === 'hasil' ? viewDiagResult('b') : viewDiag('b')) : viewDiag('a');
      case 'permainan': return viewGames();
      case 'harga': return viewPricing();
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
    const row = e.target.closest('tr[data-href]');
    if (!el && row && !e.target.closest('a')) return go(row.dataset.href);
    if (!el) return;
    const act = el.dataset.act;
    if (['jnext', 'jretry', 'jsay', 'jopt', 'jkey', 'jcheck', 'jitem', 'jbin'].includes(act)) return jAct(act, el);
    if (act === 'jband') { ls.set('metiq_jband', el.dataset.b); return route(); }
    if (act === 'jfilter') { const f = ls.get('metiq_jfilter', {}); f[el.dataset.k] = el.dataset.v; ls.set('metiq_jfilter', f); return route(); }
    if (act === 'apstu') return;
    if (act === 'ungp') { ss.set('ungp', +el.dataset.p); const ctx = teacherCtx(); if (ctx) renderUngrouped(ctx); const t = document.querySelector('.ungtbl'); if (t) t.closest('.card').scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
    if (act === 'ungf') { ss.set('ungf', el.dataset.v); ss.set('ungp', 1); const ctx = teacherCtx(); if (ctx) renderUngrouped(ctx); return; }
    if (act === 'apcsv') { const ctx = teacherCtx(); if (ctx) exportAllProgress(ctx); return; }
    if (act === 'quotego') { e.preventDefault(); const q = document.getElementById('quote'); if (q) q.scrollIntoView({ behavior: 'smooth' }); return; }
    if (act === 'sgdel') { if (!confirm(`Lepas ${el.dataset.n} dari sekolah? Kelas dan siswanya tetap milik guru itu, tetapi tidak lagi tampil di dasbor sekolah.`)) return; Cloud.rpc('school_teacher_remove', { p_token: session.get().token, p_teacher_id: el.dataset.id }).then(() => { toast('Guru dilepas dari sekolah ✔'); loadSchoolTeachers(); }).catch((er) => toast(er.status ? esc(er.message) : 'Tidak bisa terhubung ke server')); return; }
    if (act === 'quotest') { Cloud.rpc('super_quote_status', { p_token: session.get().token, p_id: +el.dataset.id, p_status: el.dataset.s }).then(() => { toast('Status diperbarui ✔'); route(); }).catch((er) => toast(er.status ? esc(er.message) : 'Tidak bisa terhubung ke server')); return; }
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
    if (act === 'quit') return go('#/belajar');
    if (act === 'dquit') { if (confirm('Berhenti dulu? Asesmen akan diulang dari awal.')) { D = null; P = null; go('#/'); } return; }
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
    if (act === 'tocur') { document.querySelectorAll('.mq-pop-slot').forEach((x) => { x.innerHTML = ''; }); const c = document.querySelector('.mq-n.cur'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (act === 'node') {
      const slot = document.getElementById('pop-' + el.dataset.id); if (!slot) return;
      const had = slot.firstChild; document.querySelectorAll('.mq-pop-slot').forEach((x) => { x.innerHTML = ''; });
      if (!had) { slot.innerHTML = nodePop(el.dataset.id, +el.dataset.x); slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      return;
    }
    if (act === 'goal') { ls.set('metiq_goal_' + session.get().id, +el.dataset.m); return route(); }
    if (act === 'soundtoggle') { const on = window.SFX.toggle(); el.querySelector('.em').textContent = on ? 'ðŸ””' : 'ðŸ”•'; el.querySelector('.t').textContent = on ? 'Suara menyala' : 'Suara mati'; return; }
    // Mengulang asesmen awal atau membuka asesmen akhir: khusus admin (peneliti) agar data pretest terjaga
    const adminDo = (msg, work) => { if (!isAdminNow()) return toast('Khusus admin'); el.disabled = true; return work().then(() => { toast(msg); route(); }).catch((e) => { el.disabled = false; toast(e.status ? e.message : 'Tidak bisa terhubung ke server'); }); };
    if (act === 'diagreset') {
      const k = S.student(el.dataset.s);
      if (!k || !confirm(`Ulangi asesmen awal untuk ${k.name}? Hasil asesmen awal yang lama tidak dipakai lagi (termasuk untuk data penelitian), dan ${k.name} akan diminta mengerjakannya saat masuk berikutnya.`)) return;
      return adminDo('Asesmen awal akan diulang ✔', () => syncKid(k, S.resetDiag(k.id)).then(() => cloudOn() && ensure(true)));
    }
    if (act === 'postone') {
      const k = S.student(el.dataset.s), open = el.dataset.o === '1'; if (!k) return;
      if (open && !confirm(`Buka asesmen akhir untuk ${k.name}? ${k.name} akan diminta mengerjakannya saat masuk berikutnya.`)) return;
      return adminDo(open ? 'Asesmen akhir dibuka ✔' : 'Asesmen akhir dibatalkan', () => postOpen([k], open));
    }
    if (act === 'postclass') {
      const c = S.cls(el.dataset.c), kids = S.studentsOf(el.dataset.c).filter((k) => S.diagOf(k.id) && !S.postPending(k.id));
      if (!c || !kids.length || !confirm(`Buka asesmen akhir untuk ${kids.length} siswa di ${c.name}? Mereka akan diminta mengerjakannya saat masuk berikutnya.`)) return;
      return adminDo(`Asesmen akhir dibuka untuk ${kids.length} siswa ✔`, () => postOpen(kids, true));
    }
    if (act === 'dskip') {
      const sid = session.get().id, r = S.markOnboard(sid);
      sessionStorage.setItem('metiq_diag_skip', sid);
      if (r.entry && cloudOn()) Cloud.queueProgress(sid, session.get().code, r.key, r.entry);
      return go('#/belajar');
    }
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
      if (box) box.innerHTML = x.open ? `<span class="pzbig">${x.prize}</span> Hadiah ini kamu dapat karena: <b>${chLabel(x.c)}</b>. Hebat!`
        : `🔒 Untuk membuka kotak ini: <b>${chLabel(x.c)}</b>.<br>Sekarang kamu punya ${x.have} ${chUnit[x.c.k]}, kurang <b>${x.c.n - x.have}</b> lagi.`;
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
    else if (act === 'reportdone') { el.disabled = true; markDone(el.dataset.a, el.dataset.s, 'ortu').then(() => { toast('Terkirim ke guru ✔'); return cloudOn() ? ensure(true) : true; }).then(route); }
    else if (act === 'sound') { const on = window.SFX.toggle(); el.textContent = on ? '🔔' : '🔕'; toast(on ? 'Suara dinyalakan' : 'Suara dimatikan'); }
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
    else if (act === 'shareclass') { const ctx = teacherCtx(); if (ctx) shareText(`Assalamu'alaikum. Latihan matematika ${ctx.c.name} sekarang di Metiq (gratis, bisa di HP):\n1. Buka https://metiq-math.vercel.app\n2. Ketuk "Saya Siswa"\n3. Masukkan kode kelas: ${ctx.c.code}\n4. Pilih nama kamu`); }
    else if (act === 'shareparent') { const k = S.student(el.dataset.id), c = k && S.cls(k.classId); if (k) shareText(`Assalamu'alaikum Ayah/Bunda ${k.name}. Laporan belajar matematika ${k.name} (${c ? c.name : ''}) bisa dilihat di Metiq:\n1. Buka https://metiq-math.vercel.app\n2. Ketuk "Saya Orang Tua"\n3. Masukkan kode orang tua: ${k.parentCode}\nAyah/Bunda juga akan mendapat kabar setiap ada tugas dari guru.`); }
    else if (act === 'submitasg') { el.disabled = true; markDone(el.dataset.a, session.get().id, 'siswa').then(() => { window.SFX.task(); toast('Tugas dikumpulkan! Gurumu mendapat notifikasi 📨'); route(); }); }
    else if (act === 'gotoform') { go('#/guru/tugas'); setTimeout(() => { const f = document.getElementById('newasg'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 350); }
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
      if (!k || !confirm(`Lepas ${k.name} dari akun ini? Data belajar ${k.name} tidak terhapus.`)) return;
      Cloud.rpc('parent_unlink', { p_token: session.get().ptoken, p_student_id: k.id }).then(() => ensure(true)).then(route).catch((e) => toast(e.message));
    }
    else if (act === 'logout') {
      const ses = session.get();
      if (cloudOn() && ses.role === 'guru' && ses.token) Cloud.rpc('teacher_logout', { p_token: ses.token }).catch(() => {});
      if (cloudOn() && ses.role === 'ortu' && ses.ptoken) Cloud.rpc('parent_logout', { p_token: ses.ptoken }).catch(() => {});
      session.set({}); loaded = { key: '', at: 0 }; go('#/');
    }
    else if (act === 'demo') { session.set({ demo: true }); S.setMode(false); const t = S.seedDemo(); session.set({ role: 'guru', id: t.id, demo: true }); toast('Data contoh siap. Masuk sebagai guru contoh.'); go('#/guru/ringkasan'); }
    else if (act === 'rmkid') {
      const k = S.student(el.dataset.id);
      if (!k || !confirm(`Hapus ${k.name} beserta semua datanya?`)) return;
      if (cloudOn()) return tAct('teacher_remove_student', { p_student_id: k.id }, 'Siswa dihapus');
      S.removeStudent(k.id); route();
    } else if (act === 'rmasg') {
      if (cloudOn()) return tAct('teacher_remove_assignment', { p_id: el.dataset.id });
      S.removeAssignment(el.dataset.id); route();
    } else if (act === 'assignkid') {
      const ctx = teacherCtx(), id = el.dataset.id, sid = el.dataset.s, note = 'Tugas khusus: ' + SKILLS[id].name;
      if (cloudOn()) return tAct('teacher_add_assignment', { p_class_id: ctx.c.id, p_skills: [id], p_note: note, p_due: '', p_student_ids: [sid] }, 'Tugas khusus dibuat ✔');
      S.addAssignment(ctx.c.id, [id], note, '', [sid]); toast('Tugas khusus dibuat ✔'); route();
    } else if (act === 'asgform') {
      ss.set('asgFor', el.dataset.s); go('#/guru/tugas');
      setTimeout(() => { const f = document.getElementById('newasg'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
    } else if (act === 'assign1') {
      const ctx = teacherCtx(), note = 'Latihan tambahan: ' + SKILLS[el.dataset.id].name;
      if (cloudOn()) return tAct('teacher_add_assignment', { p_class_id: ctx.c.id, p_skills: [el.dataset.id], p_note: note, p_due: '' }, 'Tugas dibuat ✔');
      S.addAssignment(ctx.c.id, [el.dataset.id], note, ''); toast('Tugas dibuat ✔');
    }
    else if (act === 'print') window.print();
    else if (act === 'reload') route();
    else if (act === 'export') {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const aEl = document.createElement('a'); aEl.href = URL.createObjectURL(blob); aEl.download = `metiq-cadangan-${new Date().toISOString().slice(0, 10)}.json`; aEl.click();
    }
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.fam) { if (el.checked) UNG_SEL.add(el.dataset.fam); else UNG_SEL.delete(el.dataset.fam); return; }
    if (el.dataset.act === 'teacherset') return superTeacherSet(el);
    if (el.dataset.act === 'classteacher') return superClassTeacher(el);
    if (el.dataset.act === 'apstu') { ss.set('apStu', el.value); return route(); }
    if (el.dataset.act === 'schoolsel') { ss.set('schoolSel', el.value); return route(); }
    if (el.dataset.act === 'switchclass') { const s = session.get(); s.classId = el.value; session.set(s); route(); }
    if (el.dataset.act === 'rfrom' || el.dataset.act === 'rto') { const r = ss.get('range', { preset: 'custom' }); r.preset = 'custom'; r[el.dataset.act === 'rfrom' ? 'from' : 'to'] = el.value; if (r.from && r.to && r.from > r.to) [r.from, r.to] = [r.to, r.from]; ss.set('range', r); route(); }
    if (el.dataset.act === 'logf') { const f = ss.get('logf', { sid: '', skill: '', res: '' }); f[el.dataset.k] = el.value; ss.set('logf', f); ss.set('loglim', 50); route(); }
    if (el.dataset.act === 'import' && el.files[0]) { el.files[0].text().then((t) => { try { S.importJSON(t); toast('Data berhasil digabungkan ✔'); route(); } catch (err) { toast('File tidak valid'); } }); }
  });
  document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.unit[data-unit]') && e.target.open) sessionStorage.setItem('metiq_open', e.target.dataset.unit); }, true);
  document.addEventListener('keydown', (e) => {
    if (!P || !document.getElementById('pq') || e.target.tagName === 'INPUT') return;
    if (document.getElementById('mqover')) return;
    if (e.key === 'Enter') {
      const nx = document.querySelector('#fb [data-act="next"]'); if (nx) return nx.click();
      const ck = document.getElementById('mqcheck'); if (ck && !ck.disabled) return ck.click();
      return;
    }
    if (P.q && P.q.type === 'input' && !P.locked) {
      const extra = { ',': ',', '.': ',', '-': 'âˆ’', '/': '/' };
      if (/^[0-9]$/.test(e.key) && P.input.length < 12) P.input += e.key; else if (extra[e.key] && (P.q.keys || []).includes(extra[e.key])) P.input += extra[e.key]; else if (e.key === 'Backspace') P.input = P.input.slice(0, -1); else return;
      document.getElementById('indisp').innerHTML = P.input || '&nbsp;'; refreshCheck();
    }
  });
  // Kode kelas: huruf besar otomatis, tombol Masuk aktif setelah 4 huruf, dan langsung masuk saat 5 huruf
  document.addEventListener('input', (e) => {
    const el = e.target; if (el && el.dataset && el.dataset.act === 'pcalc') { const o = document.getElementById('pcalc-v'); if (o) o.textContent = rp(Math.max(0, Math.round(+el.value || 0)) * PRICE); return; }
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
    if (kind === 'sgadd') return Cloud.rpc('school_teacher_add', { p_token: session.get().token, p_email: fd.get('email') }).then((r) => { toast(`${esc(r.name)} masuk ke sekolah ✔`); loadSchoolTeachers(); }).catch((er) => toast(er.status ? esc(er.message) : 'Tidak bisa terhubung ke server'));
    if (kind === 'schoolplan') return Cloud.rpc('super_school_plan', { p_token: session.get().token, p_school_id: f.dataset.id, p_plan: fd.get('plan'), p_until: fd.get('until') || null, p_students: +fd.get('students') || null, p_note: String(fd.get('note') || '').trim() || null }).then(() => { toast('Paket disimpan ✔'); route(); }).catch((er) => toast(er.status ? esc(er.message) : 'Tidak bisa terhubung ke server'));
    if (kind === 'trystart') return startDemo(f.dataset.r, fd.get('name'), fd.get('child'), fd.getAll('link'));
    if (kind === 'fb') {
      const rating = +fd.get('rating'), comment = String(fd.get('comment') || '').trim(), { a, s: sid, by } = f.dataset;
      if (!rating) return toast('Pilih bintangnya dulu ya ⭐');
      const finish = () => { tlog('feedback', { r: rating }); S.addFeedback(a, sid, by, rating, comment); ss.set('fbedit', ''); toast('Terima kasih atas ulasannya! 🙏'); route(); };
      if (!cloudOn()) return finish();
      const k = S.student(sid), c = k && S.cls(k.classId), code = session.get().code || (c && c.code);
      const btn = f.querySelector('button'); if (btn) btn.disabled = true;
      return Cloud.rpc('submit_feedback', { p_code: code, p_student_id: sid, p_assignment_id: a, p_by: by, p_rating: rating, p_comment: comment })
        .then(finish).catch((err) => { if (btn) btn.disabled = false; toast(err.status ? err.message : 'Tidak bisa terhubung ke server'); });
    }
    if (kind === 'nisn') {
      const sid = f.dataset.s, n = String(fd.get('nisn') || '').replace(/\D/g, '');
      if (n && n.length !== 10) return toast('NISN harus 10 angka');
      if (cloudOn()) return tAct('teacher_set_nisn', { p_student_id: sid, p_nisn: n }, 'NISN disimpan ✔');
      if (n && S.db.students.some((k) => k.nisn === n && k.id !== sid)) return toast('NISN sudah dipakai siswa lain');
      S.setNisn(sid, n); toast('NISN disimpan ✔'); return route();
    }
    if (cloudOn()) return cloudSubmit(f, fd, kind);
    if (kind === 'newkid') return startDemo('siswa', fd.get('name'));
    if (kind === 'kidcode') return toast('Kode belajar butuh internet. Coba lagi saat online ya.');
    if (kind === 'joinclass') return toast('Gabung kelas butuh internet. Coba lagi saat online ya.');
    if (kind === 'appfeedback') { tlog('feedback', { t: String(fd.get('text') || '').slice(0, 1000) }); toast('Terima kasih atas masukanmu 💚'); return go('#/pengaturan'); }
    if (kind === 'classcode') { const c = S.classByCode(fd.get('code')); if (!c) return toast('Kode kelas tidak ditemukan'); go('#/siswa/' + c.code); }
    if (kind === 'parentcode') { const k = S.studentByParentCode(fd.get('code')); if (!k) return toast('Kode tidak ditemukan. Periksa lagi ya.'); session.set({ role: 'ortu', id: k.id }); go('#/ortu/laporan'); }
    if (kind === 'register') { const t = S.createTeacher(fd.get('name'), fd.get('pin')); const c = S.createClass(t.id, fd.get('cls')); session.set({ role: 'guru', id: t.id, classId: c.id }); go('#/guru/kelola'); }
    if (kind === 'login') { const t = S.loginTeacher(fd.get('id'), fd.get('pin')); if (!t) return toast('PIN salah'); session.set({ role: 'guru', id: t.id }); go('#/guru/ringkasan'); }
    const ctx = teacherCtx();
    if (!ctx) return;
    if (kind === 'addbycode') return toast('Di mode coba, tambahkan siswa dengan nama (cara 2).');
    if (kind === 'addkid') { String(fd.get('name')).split(',').map((x) => x.trim()).filter(Boolean).forEach((n) => S.addStudent(ctx.c.id, n)); route(); }
    if (kind === 'renameclass') { S.renameClass(ctx.c.id, fd.get('name')); route(); }
    if (kind === 'classset') { S.setClassSettings(ctx.c.id, { konteks: fd.get('konteks'), adab: fd.get('adab') === '1' }); toast('Pengaturan kelas disimpan ✔'); return route(); }
    if (kind === 'newclass') { const c = S.createClass(ctx.t.id, fd.get('name')); const s = session.get(); s.classId = c.id; session.set(s); route(); }
    if (kind === 'grouptask') { const sk = fd.getAll('sk'), sids = f.dataset.sids.split(','); if (!sk.length) return toast('Pilih minimal satu keterampilan'); S.addAssignment(ctx.c.id, sk, fd.get('note'), fd.get('due'), sids); toast(`Tugas dikirim ke ${sids.length} siswa ✔`); return route(); }
    if (kind === 'assign') { const sk = fd.getAll('sk'), sids = fd.get('target') === 'some' ? fd.getAll('sid') : []; if (!sk.length) return toast('Pilih minimal satu keterampilan'); if (fd.get('target') === 'some' && !sids.length) return toast('Pilih minimal satu siswa'); S.addAssignment(ctx.c.id, sk, fd.get('note'), fd.get('due'), sids); ss.set('asgFor', ''); ss.set('asgSkill', ''); toast('Tugas disimpan ✔'); route(); }
  });

  async function cloudSubmit(f, fd, kind) {
    const btn = f.querySelector('button'); if (btn) btn.disabled = true;
    const done = () => { if (btn) btn.disabled = false; };
    const fail = (err) => { done(); toast(err.status ? err.message : 'Tidak bisa terhubung ke server'); };
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
        toast('Terima kasih atas masukanmu 💚'); return go('#/pengaturan');
      }
      if (kind === 'joinclass') {
        const ses = session.get(), r = await Cloud.rpc('student_join_class', { p_student_id: ses.id, p_code: ses.code, p_class_code: String(fd.get('code') || '').trim().toUpperCase() });
        loaded = { key: '', at: 0 }; await ensure(true);
        toast(`🎉 Kamu bergabung dengan ${esc(r.className)}`); return go('#/belajar');
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
        if (!b || !b.students.length) { done(); return toast('Kode tidak ditemukan. Periksa lagi ya.'); }
        const many = b.students.length > 1;
        session.set({ role: 'ortu', id: b.students[0].id, pcode: code, ...(many ? { kids: b.students.map((k) => k.id) } : {}) });
        S.loadBundle(b); loaded = { key: 'o' + code, at: Date.now() };
        return go(many ? '#/ortu/anak' : '#/ortu/laporan');
      }
      if (kind === 'plogin' || kind === 'pregister') {
        const r = kind === 'pregister'
          ? await Cloud.rpc('parent_register', { p_name: fd.get('name'), p_email: fd.get('email'), p_password: fd.get('pass') })
          : await Cloud.rpc('parent_login', { p_email: fd.get('email'), p_password: fd.get('pass') });
        if (r.error) { done(); return toast(r.error); }
        if (r.pending) { saveRequest(r, fd.get('name')); return go('#/ajukan/status/' + r.code); }
        session.set({ role: 'ortu', ptoken: r.token, pid: r.parentId });
        return go('#/ortu/anak');
      }
      if (kind === 'plink') {
        const r = await Cloud.rpc('parent_link', { p_token: session.get().ptoken, p_parent_code: String(fd.get('code')).trim().toUpperCase() });
        await ensure(true); toast(`${esc(r.name)} ditambahkan ✔`); return route();
      }
      if (kind === 'register' || kind === 'login') {
        // Guru biasa: daftar gratis langsung aktif (SQL 020). Kode admin, atau server lama tanpa SQL 020: alur lama.
        const adminCode = String(fd.get('admin') || '').trim();
        const oldReg = () => Cloud.rpc('teacher_register', { p_name: fd.get('name'), p_email: fd.get('email'), p_password: fd.get('pass'), p_class_name: fd.get('cls'), p_admin_code: adminCode || null });
        const r = kind === 'register'
          ? (adminCode ? await oldReg() : await Cloud.rpc('teacher_signup', { p_name: fd.get('name'), p_email: fd.get('email'), p_password: fd.get('pass'), p_class_name: fd.get('cls') }).catch((e) => { if (e.status === 404) return oldReg(); throw e; }))
          : await Cloud.rpc('teacher_login', { p_email: fd.get('email'), p_password: fd.get('pass') });
        if (r.error) { done(); return toast(r.error); }
        if (r.pending) { saveRequest(r, fd.get('name')); return go('#/ajukan/status/' + r.code); }
        session.set({ role: 'guru', id: r.teacherId, token: r.token });
        return go('#/guru/ringkasan');
      }
      const ctx = teacherCtx();
      if (!ctx) return done();
      if (kind === 'addbycode') {
        try { const r = await Cloud.rpc('teacher_add_by_code', { p_token: session.get().token, p_class_id: ctx.c.id, p_learn_code: fd.get('code') }); await ensure(true); toast(`${esc(r.name)} masuk ke kelas ini ✔`); return route(); }
        catch (e) { done(); return toast(e.status === 404 ? 'Fitur ini butuh pembaruan server (SQL 019).' : e.status ? esc(e.message) : 'Tidak bisa terhubung ke server'); }
      }
      if (kind === 'addkid') {
        const names = String(fd.get('name')).split(',').map((x) => x.trim()).filter(Boolean);
        const used = ctx.kids.map((k) => k.avatar);
        const free = S.AVATARS.filter((a) => !used.includes(a));
        const avatars = names.map((_, i) => free[i] || S.AVATARS[Math.floor(Math.random() * S.AVATARS.length)]);
        return tAct('teacher_add_students', { p_class_id: ctx.c.id, p_names: names, p_avatars: avatars }, `${names.length} siswa ditambahkan ✔`);
      }
      if (kind === 'classset') return tAct('class_set_settings', { p_class_id: ctx.c.id, p_settings: { konteks: fd.get('konteks') === 'islami' ? 'islami' : 'umum', adab: fd.get('adab') === '1' } }, 'Pengaturan kelas disimpan ✔');
      if (kind === 'renameclass') return tAct('teacher_rename_class', { p_class_id: ctx.c.id, p_name: fd.get('name') }, 'Nama kelas diganti ✔');
      if (kind === 'newclass') {
        const id = await Cloud.rpc('teacher_create_class', { p_token: session.get().token, p_name: fd.get('name') });
        const s = session.get(); s.classId = id; session.set(s);
        await ensure(true); toast('Kelas baru dibuat ✔'); return route();
      }
      if (kind === 'grouptask') {
        const sk = fd.getAll('sk'), sids = f.dataset.sids.split(',');
        if (!sk.length) { done(); return toast('Pilih minimal satu keterampilan'); }
        return tAct('teacher_add_assignment', { p_class_id: ctx.c.id, p_skills: sk, p_note: fd.get('note'), p_due: fd.get('due'), p_student_ids: sids }, `Tugas dikirim ke ${sids.length} siswa ✔`);
      }
      if (kind === 'assign') {
        const sk = fd.getAll('sk'), sids = fd.get('target') === 'some' ? fd.getAll('sid') : [];
        if (!sk.length) { done(); return toast('Pilih minimal satu keterampilan'); }
        if (fd.get('target') === 'some' && !sids.length) { done(); return toast('Pilih minimal satu siswa'); }
        ss.set('asgFor', ''); ss.set('asgSkill', '');
        // daftar siswa hanya dikirim untuk tugas khusus, agar tugas seluruh kelas tetap memakai fungsi lama
        return tAct('teacher_add_assignment', Object.assign({ p_class_id: ctx.c.id, p_skills: sk, p_note: fd.get('note'), p_due: fd.get('due') }, sids.length ? { p_student_ids: sids } : {}), 'Tugas disimpan ✔');
      }
    } catch (err) { fail(err); }
  }

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
