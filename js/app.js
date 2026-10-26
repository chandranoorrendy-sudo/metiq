/* Metiq — aplikasi utama: rute, tampilan siswa, guru, dan orang tua. */
(function () {
  const { UNITS, SKILLS, TAGS, classify } = window.METIQ_CURRICULUM;
  const S = window.Store;
  const app = document.getElementById('app');
  const DAY = 864e5;

  /* ---------- Utilitas ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const strip = (h) => String(h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const fmtTime = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? `${m} mnt` : `${Math.floor(m / 60)} jam ${m % 60} mnt`; };
  const ago = (ts) => { if (!ts) return 'belum pernah'; const d = Math.floor((Date.now() - ts) / DAY); return d <= 0 ? 'hari ini' : d === 1 ? 'kemarin' : `${d} hari lalu`; };
  const level = (s) => (s >= 100 ? ['Tuntas', 'lv4'] : s >= 80 ? ['Mahir', 'lv3'] : s >= 50 ? ['Berkembang', 'lv2'] : s > 0 ? ['Mulai', 'lv1'] : ['Belum', 'lv0']);
  const chip = (s) => { const [l, c] = level(s); return `<span class="chip ${c}" title="${l}">${s >= 100 ? '🏆' : s}</span>`; };
  const session = { get() { try { return JSON.parse(localStorage.getItem('metiq_session')) || {}; } catch (e) { return {}; } }, set(v) { try { localStorage.setItem('metiq_session', JSON.stringify(v)); } catch (e) {} } };
  const go = (h) => { location.hash = h; };
  let timer = null;
  const Cloud = window.Cloud;
  // Mode server aktif jika Supabase dikonfigurasi, kecuali saat mencoba data contoh
  const cloudOn = () => Cloud.enabled && !session.get().demo;
  const loadingHTML = '<div class="loading"><span class="spin"></span>Memuat…</div>';
  let loaded = { key: '', at: 0 };
  async function ensure(force) {
    if (!cloudOn()) return true;
    const ses = session.get();
    let key, fn, args;
    if (ses.role === 'guru' && ses.token) { key = 'g' + ses.token; fn = 'teacher_bundle'; args = { p_token: ses.token }; }
    else if (ses.role === 'siswa' && ses.code) { key = 's' + ses.id; fn = 'student_bundle'; args = { p_code: ses.code, p_student_id: ses.id }; }
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

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const t = strip(text).replace(/−/g, ' kurang ').replace(/\+/g, ' tambah ').replace(/=/g, ' sama dengan ').replace(/\?/g, ' berapa? ').replace(/×/g, ' kali ');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.lang = 'id-ID'; u.rate = 0.9;
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith('id')); if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  const shell = (inner, opts = {}) => `
    <header class="top"><a href="#/" class="logo"><span class="logo-m">M</span>etiq</a>${opts.right || ''}</header>
    <main class="wrap ${opts.cls || ''}">${inner}</main>`;

  /* ---------- Analitik (dipakai guru dan orang tua) ---------- */
  function stats(sid, days) {
    const since = days ? Date.now() - days * DAY : 0;
    const ans = S.answersOf(sid).filter((a) => a.ts >= since);
    const prog = S.progressAll(sid);
    const scores = Object.values(prog);
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
  function unitScore(sid, u) {
    const prog = S.progressAll(sid);
    const sc = u.skills.map((s) => (prog[s.id] || {}).score || 0);
    return { avg: Math.round(sc.reduce((a, b) => a + b, 0) / sc.length), prof: sc.filter((x) => x >= 80).length, total: sc.length };
  }

  /* ---------- Beranda ---------- */
  function viewHome() {
    const ses = session.get();
    const resume = ses.role === 'siswa' && S.student(ses.id) ? `<a class="resume" href="#/belajar">Lanjut belajar sebagai <b>${esc(S.student(ses.id).name)}</b> →</a>`
      : ses.role === 'guru' && S.teacher(ses.id) ? `<a class="resume" href="#/guru">Buka dasbor <b>${esc(S.teacher(ses.id).name)}</b> →</a>` : '';
    app.innerHTML = shell(`
      <section class="hero">
        <h1>Belajar matematika kelas 1, <span>selangkah demi selangkah.</span></h1>
        <p>${UNITS.length} bab dan ${Object.keys(SKILLS).length} keterampilan dalam bahasa Indonesia. Soal menyesuaikan kemampuan anak, dengan penjelasan setiap kali jawaban belum tepat.</p>
        ${resume}
      </section>
      <section class="roles">
        <a class="role r1" href="#/siswa"><span class="ri">🧒</span><b>Saya Siswa</b><small>Mulai latihan</small></a>
        <a class="role r2" href="#/guru"><span class="ri">👩‍🏫</span><b>Saya Guru</b><small>Kelola kelas & lihat kemajuan</small></a>
        <a class="role r3" href="#/ortu"><span class="ri">👨‍👩‍👧</span><b>Saya Orang Tua</b><small>Lihat laporan anak</small></a>
      </section>
      <section class="card">
        <h2>Isi kurikulum</h2>
        <p class="muted">Gabungan daftar keterampilan IXL kelas 1 dan alur Singapore Math (pasangan bilangan, membuat 10, model batang), disesuaikan dengan konteks Indonesia.</p>
        <div class="unit-mini">${UNITS.map((u) => `<span style="--c:${u.color}">${u.icon} ${u.name}</span>`).join('')}</div>
        <a class="btn ghost" href="#/kurikulum">Lihat semua keterampilan</a>
      </section>
      <p class="center muted small">Baru mencoba? <button class="link" data-act="demo">Isi data contoh</button> lalu masuk sebagai guru dengan PIN <b>1234</b>.</p>
    `);
  }

  function viewCurriculum() {
    app.innerHTML = shell(`
      <a class="back" href="#/">← Kembali</a>
      <h1>Kurikulum Matematika Kelas 1</h1>
      <p class="muted">Setiap bab mencantumkan rujukan bab Singapore Math yang setara.</p>
      ${UNITS.map((u) => `<section class="card unit" style="--c:${u.color}"><h2><span class="uicon">${u.icon}</span>${u.id}. ${u.name}</h2><p class="muted small">Singapore Math: ${u.sg}</p><ol>${u.skills.map((s) => `<li>${s.name}</li>`).join('')}</ol></section>`).join('')}
    `);
  }

  /* ---------- Siswa ---------- */
  function viewStudentEnter() {
    app.innerHTML = shell(`
      <a class="back" href="#/">← Kembali</a>
      <section class="card narrow center">
        <div class="bigemoji">🧒</div>
        <h1>Halo! Masukkan kode kelas</h1>
        <p class="muted">Minta kode kelas kepada Bu/Pak Guru.</p>
        <form data-form="classcode"><input name="code" class="codein" maxlength="5" autocomplete="off" autocapitalize="characters" placeholder="ABCDE" required><button class="btn">Masuk</button></form>
      </section>`);
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
    app.innerHTML = shell(`
      <a class="back" href="#/siswa">← Ganti kelas</a>
      <h1 class="center">${esc(c.name)}</h1><p class="center muted">Ketuk namamu</p>
      <div class="pick">${kids.map((k) => `<button class="kid" data-act="pickkid" data-id="${k.id}" data-code="${c.code}"><span>${k.avatar}</span>${esc(k.name)}</button>`).join('') || '<p class="muted center">Belum ada siswa di kelas ini.</p>'}</div>`);
  }
  function viewStudentHome() {
    const ses = session.get(); const st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const c = S.cls(st.classId);
    const prog = S.progressAll(st.id);
    const asg = S.assignmentsOf(st.classId);
    const st7 = stats(st.id, 7);
    const open = sessionStorage.getItem('metiq_open') || '';
    const unsent = cloudOn() ? Cloud.pendingCount(st.id) : 0;
    app.innerHTML = shell(`
      ${unsent ? `<p class="offline">📶 ${unsent} jawaban menunggu internet untuk dikirim ke guru.</p>` : ''}
      <section class="hello"><span class="av">${st.avatar}</span><div><h1>Halo, ${esc(st.name)}!</h1><p class="muted">${esc(c ? c.name : '')} · ${st7.answered} soal minggu ini · ${Object.values(prog).filter((p) => p.score >= 100).length} 🏆</p></div></section>
      ${asg.length ? `<section class="card tugas"><h2>📌 Tugas dari guru</h2>${asg.map((a) => `<div class="asg">${a.note ? `<p><b>${esc(a.note)}</b>${a.due ? ` · <span class="muted">sampai ${esc(a.due)}</span>` : ''}</p>` : ''}<div class="sklist">${a.skills.filter((k) => SKILLS[k]).map((k) => skillLink(k, prog[k])).join('')}</div></div>`).join('')}</section>` : ''}
      <div class="units">${UNITS.map((u) => {
        const us = unitScore(st.id, u);
        return `<details class="unit card" style="--c:${u.color}" ${open === u.id ? 'open' : ''} data-unit="${u.id}"><summary><span class="uicon">${u.icon}</span><span class="utitle"><b>${u.id}. ${u.name}</b><small>${us.prof} dari ${us.total} keterampilan mahir</small></span><span class="ubar"><i style="width:${us.avg}%"></i></span></summary><div class="sklist">${u.skills.map((s) => skillLink(s.id, prog[s.id])).join('')}</div></details>`;
      }).join('')}</div>
    `, { right: `<button class="link" data-act="logout">Keluar</button>` });
  }
  function skillLink(id, p) {
    const s = SKILLS[id]; const sc = p ? p.score : 0;
    return `<a class="sk" href="#/latihan/${id}"><span class="sk-code">${s.code}</span><span class="sk-name">${s.name}</span>${chip(sc)}</a>`;
  }

  /* ---------- Latihan ---------- */
  let P = null;
  function viewPractice(id) {
    const ses = session.get(); const st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const sk = SKILLS[id]; if (!sk) return go('#/belajar');
    sessionStorage.setItem('metiq_open', sk.unit);
    const p = S.progress(st.id, id);
    P = { sid: st.id, sk, score: p.score, count: 0, start: Date.now(), q: null, input: '', locked: false };
    const u = UNITS.find((x) => x.id === sk.unit);
    app.innerHTML = `
      <header class="ptop" style="--c:${u.color}"><a href="#/belajar" class="pback" aria-label="Kembali">←</a><div class="ptitle"><small>${sk.code} · ${u.name}</small><b>${sk.name}</b></div></header>
      <div class="pstats"><div><small>Soal dijawab</small><b id="pcount">0</b></div><div><small>Waktu</small><b id="ptime">00:00</b></div><div class="ss"><small>SmartScore</small><b id="pscore">${P.score}</b></div></div>
      <div class="sbar"><i id="sbar" style="width:${P.score}%"></i></div>
      <main class="wrap practice" id="pq"></main>`;
    clearInterval(timer);
    timer = setInterval(() => { const el = document.getElementById('ptime'); if (!el) return clearInterval(timer); const s = Math.floor((Date.now() - P.start) / 1000); el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
    if (P.score >= 100) return renderMastered(true);
    nextQ();
  }
  function nextQ() {
    let q, guard = 0;
    do { q = P.sk.gen(); } while (P.q && strip(q.text + (q.vis || '')) === strip(P.q.text + (P.q.vis || '')) && guard++ < 5);
    P.q = q; P.input = ''; P.locked = false; P.qStart = Date.now();
    const box = document.getElementById('pq');
    box.innerHTML = `
      <section class="qcard">
        <div class="qhead"><button class="say" data-act="say" aria-label="Bacakan soal">🔊</button><p class="qtext">${q.text}</p></div>
        ${q.vis ? `<div class="qvis">${q.vis}</div>` : ''}
        <div class="qans">${q.type === 'choice'
          ? `<div class="opts ${q.options.every((o) => strip(o).length <= 4) ? 'short' : ''}">${q.options.map((o, i) => `<button class="opt" data-act="choose" data-i="${i}">${o}</button>`).join('')}</div>`
          : `<div class="inrow">${q.unit ? `<span class="unit-l">${q.unit}</span>` : ''}<div class="indisp" id="indisp">&nbsp;</div></div>
             <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-act="key" data-k="${n}">${n}</button>`).join('')}<button data-act="key" data-k="del" class="kdel">⌫</button><button data-act="key" data-k="0">0</button><button data-act="submit" class="ksub">Jawab</button></div>`}
        </div>
      </section>
      <div id="fb"></div>`;
  }
  function submit(given) {
    if (P.locked) return;
    const q = P.q;
    if (q.type === 'input' && given === '') return toast('Tulis jawabanmu dulu ya');
    const norm = (x) => String(x).trim().toLowerCase().replace(/[.\s]/g, '');
    const ok = q.type === 'choice' ? given === q.answer : norm(given) === norm(q.answer);
    P.locked = true; P.count++;
    const tag = ok ? null : classify(q, given);
    const res = S.record(P.sid, P.sk.id, { ok, given: strip(given), answer: strip(q.answer), text: strip(q.log || q.text), tag, ms: Date.now() - P.qStart });
    if (cloudOn()) Cloud.queue(P.sid, session.get().code, S.lastAnswer(), Object.assign({}, res));
    const before = P.score; P.score = res.score;
    document.getElementById('pcount').textContent = P.count;
    const sc = document.getElementById('pscore'); sc.textContent = P.score; sc.className = ok ? 'up' : 'down';
    document.getElementById('sbar').style.width = P.score + '%';
    document.querySelectorAll('.opt').forEach((b) => { const v = q.options[+b.dataset.i]; if (v === q.answer) b.classList.add('right'); else if (v === given) b.classList.add('wrong'); b.disabled = true; });
    const fb = document.getElementById('fb');
    if (ok) {
      fb.innerHTML = `<div class="fb ok">${['Hebat!', 'Pintar!', 'Benar sekali!', 'Mantap!', 'Keren!'][Math.floor(Math.random() * 5)]} 🎉</div>`;
      if (P.score >= 100 && before < 100) return setTimeout(() => renderMastered(false), 900);
      setTimeout(nextQ, 1000);
    } else {
      fb.innerHTML = `<div class="fb no"><h3>Belum tepat 🙂</h3>
        <p>Jawabanmu: <b class="strike">${esc(strip(given))}</b> · Jawaban yang benar: <b>${q.answer}</b></p>
        <div class="explain"><b>Cara mengerjakan:</b><p>${q.explain}</p></div>
        <button class="btn" data-act="next">Lanjut →</button></div>`;
      fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  function renderMastered(already) {
    clearInterval(timer);
    const u = UNITS.find((x) => x.id === P.sk.unit);
    const nextSk = u.skills[u.skills.findIndex((s) => s.id === P.sk.id) + 1];
    document.getElementById('pq').innerHTML = `<section class="qcard center mastered"><div class="bigemoji">🏆</div><h1>${already ? 'Kamu sudah tuntas!' : 'Tuntas! Luar biasa!'}</h1><p>Kamu sudah menguasai <b>${P.sk.name}</b>.</p>
      <div class="row-btn">${nextSk ? `<a class="btn" href="#/latihan/${nextSk.id}">Lanjut: ${nextSk.name}</a>` : ''}<a class="btn ghost" href="#/belajar">Pilih keterampilan lain</a>${already ? `<button class="btn ghost" data-act="again">Latihan lagi</button>` : ''}</div></section>`;
  }

  /* ---------- Guru ---------- */
  function viewTeacherAuthCloud(mode) {
    const reg = mode === 'daftar';
    app.innerHTML = shell(`
      <a class="back" href="#/">← Kembali</a>
      <section class="card narrow">
        <div class="bigemoji center">👩‍🏫</div>
        ${reg ? `<h1 class="center">Daftar sebagai guru</h1>
          <form data-form="register" class="form">
            <label>Nama guru<input name="name" required placeholder="mis. Bu Rina" autocomplete="name"></label>
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <label>Kata sandi (min. 6 karakter)<input name="pass" type="password" minlength="6" required autocomplete="new-password"></label>
            <label>Nama kelas<input name="cls" required placeholder="mis. Kelas 1A"></label>
            <button class="btn">Buat akun</button>
          </form><p class="center"><a href="#/guru/masuk">Sudah punya akun? Masuk</a></p>`
        : `<h1 class="center">Masuk guru</h1>
          <form data-form="login" class="form">
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <label>Kata sandi<input name="pass" type="password" required autocomplete="current-password"></label>
            <button class="btn">Masuk</button>
          </form><p class="center"><a href="#/guru/daftar">Belum punya akun? Daftar</a></p>`}
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
    let classes = S.classesOf(t.id);
    if (!classes.length) { if (cloudOn()) return null; classes = [S.createClass(t.id, 'Kelas 1')]; }
    const c = classes.find((x) => x.id === ses.classId) || classes[0];
    return { t, c, classes, kids: S.studentsOf(c.id) };
  }
  const TABS = [['ringkasan', 'Ringkasan'], ['siswa', 'Siswa'], ['peta', 'Peta kemajuan'], ['keterampilan', 'Keterampilan'], ['tugas', 'Tugas'], ['kelola', 'Kelola kelas']];
  function teacherShell(ctx, tab, inner) {
    app.innerHTML = shell(`
      <section class="dhead"><div><small class="muted">${esc(ctx.t.name)}</small><h1>${esc(ctx.c.name)}</h1></div>
        ${ctx.classes.length > 1 ? `<select data-act="switchclass">${ctx.classes.map((c) => `<option value="${c.id}" ${c.id === ctx.c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>` : ''}
        <div class="codebox">Kode kelas <b>${ctx.c.code}</b></div></section>
      <nav class="tabs">${TABS.map(([k, l]) => `<a href="#/guru/${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</nav>
      ${inner}`, { cls: 'wide', right: `<button class="link" data-act="logout">Keluar</button>` });
  }
  function emptyKids(ctx) {
    return `<section class="card center"><div class="bigemoji">🧑‍🤝‍🧑</div><h2>Belum ada siswa</h2><p class="muted">Tambahkan siswa di menu <a href="#/guru/kelola">Kelola kelas</a>. Siswa masuk dengan kode kelas <b>${ctx.c.code}</b>.</p></section>`;
  }
  function classSkillAgg(kids) {
    const agg = {};
    kids.forEach((k) => Object.entries(S.progressAll(k.id)).forEach(([sid, p]) => {
      if (!SKILLS[sid]) return; const a = agg[sid] = agg[sid] || { att: 0, ok: 0, n: 0, score: 0, students: [] };
      a.att += p.att; a.ok += p.ok; a.n++; a.score += p.score; a.students.push({ k, p });
    }));
    return agg;
  }
  function viewTeacher(tab, arg) {
    const ctx = teacherCtx(); if (!ctx) return go('#/guru/masuk');
    const { kids } = ctx;
    if (tab === 'siswa' && arg) return viewTeacherStudent(ctx, arg);
    if (tab === 'kelola') return teacherShell(ctx, tab, manageHTML(ctx));
    if (tab === 'tugas') return teacherShell(ctx, tab, tasksHTML(ctx));
    if (!kids.length) return teacherShell(ctx, tab, emptyKids(ctx));

    if (tab === 'ringkasan') {
      const all = kids.map((k) => ({ k, s: stats(k.id, 7), all: stats(k.id) }));
      const answered = all.reduce((a, x) => a + x.s.answered, 0), correct = all.reduce((a, x) => a + x.s.correct, 0);
      const active = all.filter((x) => x.s.answered > 0).length;
      const attention = all.filter((x) => (x.s.answered >= 10 && x.s.acc < 65) || x.s.answered === 0);
      const agg = classSkillAgg(kids);
      const hard = Object.entries(agg).filter(([, a]) => a.att >= 15).map(([id, a]) => ({ id, acc: pct(a.ok, a.att), n: a.n })).sort((a, b) => a.acc - b.acc).slice(0, 5);
      const tags = tagCounts(kids.flatMap((k) => S.answersOf(k.id).filter((a) => a.ts > Date.now() - 14 * DAY))).filter(([t]) => t !== 'konsep').slice(0, 4);
      const stars = all.slice().sort((a, b) => b.s.correct - a.s.correct).slice(0, 3).filter((x) => x.s.correct > 0);
      return teacherShell(ctx, tab, `
        <div class="kpis"><div class="kpi"><small>Siswa aktif (7 hari)</small><b>${active}<span>/${kids.length}</span></b></div><div class="kpi"><small>Soal dijawab (7 hari)</small><b>${answered}</b></div><div class="kpi"><small>Ketepatan (7 hari)</small><b>${pct(correct, answered)}%</b></div><div class="kpi"><small>Keterampilan tuntas</small><b>${all.reduce((a, x) => a + x.all.mastered, 0)}</b></div></div>
        <div class="grid2">
          <section class="card"><h2>⚠️ Perlu perhatian</h2>${attention.length ? attention.map((x) => `<a class="lrow" href="#/guru/siswa/${x.k.id}"><span class="av sm">${x.k.avatar}</span><span class="grow"><b>${esc(x.k.name)}</b><small>${x.s.answered === 0 ? `Tidak berlatih 7 hari terakhir · terakhir ${ago(x.all.last)}` : `Ketepatan ${x.s.acc}% dari ${x.s.answered} soal`}</small></span>→</a>`).join('') : '<p class="muted">Semua siswa aktif dan ketepatannya baik. 👍</p>'}</section>
          <section class="card"><h2>🧗 Keterampilan tersulit di kelas</h2>${hard.length ? hard.map((h) => `<div class="lrow"><span class="grow"><b>${SKILLS[h.id].code} ${SKILLS[h.id].name}</b><small>Ketepatan ${h.acc}% · ${h.n} siswa mencoba</small></span><button class="btn sm ghost" data-act="assign1" data-id="${h.id}">Tugaskan</button></div>`).join('') : '<p class="muted">Belum cukup data.</p>'}</section>
          <section class="card"><h2>🔍 Pola kesalahan kelas (14 hari)</h2>${tags.length ? tags.map(([t, n]) => `<div class="tagrow"><b>${TAGS[t].label}</b> <span class="pill">${n}×</span><p class="muted small">${TAGS[t].tip}</p></div>`).join('') : '<p class="muted">Belum ada pola kesalahan yang menonjol.</p>'}</section>
          <section class="card"><h2>⭐ Paling rajin minggu ini</h2>${stars.length ? stars.map((x, i) => `<a class="lrow" href="#/guru/siswa/${x.k.id}"><span class="medal">${['🥇', '🥈', '🥉'][i]}</span><span class="av sm">${x.k.avatar}</span><span class="grow"><b>${esc(x.k.name)}</b><small>${x.s.correct} jawaban benar</small></span></a>`).join('') : '<p class="muted">Belum ada aktivitas minggu ini.</p>'}</section>
        </div>`);
    }
    if (tab === 'siswa') {
      return teacherShell(ctx, tab, `<section class="card"><div class="tscroll"><table class="tbl"><thead><tr><th>Siswa</th><th>Soal</th><th>Ketepatan</th><th>Waktu</th><th>Mahir</th><th>🏆</th><th>Terakhir</th></tr></thead><tbody>
        ${kids.map((k) => { const s = stats(k.id); return `<tr data-href="#/guru/siswa/${k.id}"><td><span class="av sm">${k.avatar}</span> <a href="#/guru/siswa/${k.id}">${esc(k.name)}</a></td><td>${s.answered}</td><td><span class="accb ${s.acc >= 80 ? 'g' : s.acc >= 60 ? 'y' : 'r'}">${s.answered ? s.acc + '%' : '–'}</span></td><td>${fmtTime(s.ms)}</td><td>${s.proficient}</td><td>${s.mastered}</td><td>${ago(s.last)}</td></tr>`; }).join('')}
        </tbody></table></div></section>`);
    }
    if (tab === 'peta') {
      return teacherShell(ctx, tab, `<section class="card"><p class="muted small">Rata-rata SmartScore per bab. Ketuk nama untuk detail.</p><div class="tscroll"><table class="tbl heat"><thead><tr><th>Siswa</th>${UNITS.map((u) => `<th title="${u.name}">${u.icon}<br>${u.id}</th>`).join('')}</tr></thead><tbody>
        ${kids.map((k) => `<tr><td><a href="#/guru/siswa/${k.id}">${k.avatar} ${esc(k.name)}</a></td>${UNITS.map((u) => { const us = unitScore(k.id, u); return `<td class="hc ${level(us.avg)[1]}" title="${u.name}: ${us.avg}">${us.avg || ''}</td>`; }).join('')}</tr>`).join('')}
        </tbody></table></div><div class="legend">${[['Belum', 'lv0'], ['Mulai <50', 'lv1'], ['Berkembang 50–79', 'lv2'], ['Mahir 80–99', 'lv3'], ['Tuntas 100', 'lv4']].map(([l, c]) => `<span><i class="${c}"></i>${l}</span>`).join('')}</div></section>`);
    }
    if (tab === 'keterampilan') {
      const agg = classSkillAgg(kids);
      return teacherShell(ctx, tab, UNITS.map((u) => `<section class="card unit" style="--c:${u.color}"><h2><span class="uicon">${u.icon}</span>${u.id}. ${u.name}</h2>
        ${u.skills.map((s) => { const a = agg[s.id]; const prof = a ? a.students.filter((x) => x.p.score >= 80).length : 0; return `<details class="skd"><summary><span class="sk-code">${s.code}</span><span class="grow">${s.name}</span><span class="muted small">${a ? `${a.n} siswa · ${pct(a.ok, a.att)}%` : 'belum dicoba'}</span><span class="pill">${prof}/${kids.length} mahir</span></summary>
          ${a ? `<div class="skd-b">${a.students.sort((x, y) => x.p.score - y.p.score).map((x) => `<a class="lrow" href="#/guru/siswa/${x.k.id}"><span class="av sm">${x.k.avatar}</span><span class="grow">${esc(x.k.name)}<small>${x.p.att} soal · ${pct(x.p.ok, x.p.att)}% benar</small></span>${chip(x.p.score)}</a>`).join('')}</div>` : ''}<p class="small"><a href="#/coba/${s.id}">Coba soal contoh →</a></p></details>`; }).join('')}</section>`).join(''));
    }
    return go('#/guru/ringkasan');
  }
  function tasksHTML(ctx) {
    const asg = S.assignmentsOf(ctx.c.id);
    return `<section class="card"><h2>Tugas aktif</h2>${asg.length ? asg.map((a) => `<div class="asg-t"><div class="grow"><b>${esc(a.note || 'Tugas')}</b>${a.due ? ` <span class="muted small">· sampai ${esc(a.due)}</span>` : ''}<div class="small">${a.skills.filter((k) => SKILLS[k]).map((k) => { const done = ctx.kids.filter((kid) => S.progress(kid.id, k).score >= 80).length; return `<span class="pill">${SKILLS[k].code} ${SKILLS[k].name} · ${done}/${ctx.kids.length} mahir</span>`; }).join(' ')}</div></div><button class="btn sm ghost" data-act="rmasg" data-id="${a.id}">Hapus</button></div>`).join('') : '<p class="muted">Belum ada tugas. Siswa akan melihat tugas di bagian atas halaman belajar mereka.</p>'}</section>
      <section class="card"><h2>Buat tugas baru</h2><form data-form="assign" class="form">
        <label>Catatan untuk siswa<input name="note" placeholder="mis. Latihan untuk ulangan Jumat"></label>
        <label>Tenggat (opsional)<input name="due" type="date"></label>
        <div class="pickskills">${UNITS.map((u) => `<fieldset><legend>${u.icon} ${u.id}. ${u.name}</legend>${u.skills.map((s) => `<label class="cb"><input type="checkbox" name="sk" value="${s.id}"> ${s.code} ${s.name}</label>`).join('')}</fieldset>`).join('')}</div>
        <button class="btn">Simpan tugas</button></form></section>`;
  }
  function manageHTML(ctx) {
    return `<div class="grid2">
      <section class="card"><h2>Tambah siswa</h2><form data-form="addkid" class="form inline"><input name="name" placeholder="Nama siswa" required><button class="btn">Tambah</button></form>
        <p class="muted small">Bisa tambah banyak sekaligus: pisahkan nama dengan koma.</p></section>
      <section class="card"><h2>Cara masuk</h2><p><b>Siswa:</b> buka Metiq → "Saya Siswa" → masukkan kode kelas <b class="code">${ctx.c.code}</b> → ketuk nama.</p><p><b>Orang tua:</b> buka Metiq → "Saya Orang Tua" → masukkan kode orang tua masing-masing anak (lihat daftar di bawah).</p><button class="btn ghost sm" data-act="print">Cetak kartu kode</button></section>
    </div>
    <section class="card"><h2>Daftar siswa (${ctx.kids.length})</h2>${ctx.kids.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>Siswa</th><th>Kode orang tua</th><th></th></tr></thead><tbody>${ctx.kids.map((k) => `<tr><td>${k.avatar} ${esc(k.name)}</td><td><b class="code">${k.parentCode}</b></td><td class="r"><button class="btn sm ghost danger" data-act="rmkid" data-id="${k.id}">Hapus</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Belum ada siswa.</p>'}</section>
    <div class="grid2">
      <section class="card"><h2>Kelas</h2><form data-form="renameclass" class="form inline"><input name="name" value="${esc(ctx.c.name)}" required><button class="btn ghost">Ganti nama</button></form>
        <form data-form="newclass" class="form inline"><input name="name" placeholder="Nama kelas baru" required><button class="btn ghost">Tambah kelas</button></form></section>
      ${cloudOn() ? `<section class="card"><h2>Data</h2><p class="muted small">Data kelas tersimpan di server dan otomatis tersinkron ke HP siswa, orang tua, dan guru.</p><div class="row-btn"><button class="btn ghost sm" data-act="export">Unduh cadangan</button></div></section>`
      : `<section class="card"><h2>Cadangan data</h2><p class="muted small">Data tersimpan di perangkat ini. Unduh cadangan secara berkala, atau gabungkan data dari perangkat lain.</p><div class="row-btn"><button class="btn ghost sm" data-act="export">Unduh cadangan</button><label class="btn ghost sm">Gabungkan file<input type="file" accept=".json" data-act="import" hidden></label></div></section>`}
    </div>
    <div class="printcards">${ctx.kids.map((k) => `<div class="pcard"><div class="av">${k.avatar}</div><b>${esc(k.name)}</b><div>Kode kelas: <b>${ctx.c.code}</b></div><div>Kode orang tua: <b>${k.parentCode}</b></div><small>metiq · ${esc(ctx.c.name)}</small></div>`).join('')}</div>`;
  }
  function viewTeacherStudent(ctx, sid) {
    const k = S.student(sid); if (!k || k.classId !== ctx.c.id) return go('#/guru/siswa');
    const ans = S.answersOf(sid).sort((a, b) => b.ts - a.ts).slice(0, 30);
    teacherShell(ctx, 'siswa', `<a class="back" href="#/guru/siswa">← Semua siswa</a>${reportHTML(k, 'guru')}
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
      <section class="card report-head"><span class="av lg">${k.avatar}</span><div><h1>${audience === 'ortu' ? 'Laporan belajar ' : ''}${nm}</h1><p class="muted">${esc((S.cls(k.classId) || {}).name || '')}</p></div></section>
      <section class="card story"><p>${story}</p></section>
      <div class="kpis"><div class="kpi"><small>Total soal</small><b>${sAll.answered}</b></div><div class="kpi"><small>Ketepatan</small><b>${sAll.acc}%</b></div><div class="kpi"><small>Waktu belajar</small><b>${fmtTime(sAll.ms)}</b></div><div class="kpi"><small>Keterampilan mahir</small><b>${sAll.proficient}<span> · ${sAll.mastered}🏆</span></b></div></div>
      <section class="card"><h2>Aktivitas 7 hari terakhir</h2><div class="week">${s7.byDay.map((d) => `<div class="wd"><span class="wv">${d.n || ''}</span><i style="height:${Math.round((d.n / maxDay) * 100)}%"></i><small>${hariPendek[new Date(d.d0).getDay()]}</small></div>`).join('')}</div></section>
      <div class="grid2">
        <section class="card good"><h2>👍 Yang sudah bagus</h2>${good.length ? good.slice(0, 6).map((g) => `<div class="lrow"><span class="grow"><b>${g.skill.name}</b><small>${g.att} soal · ${g.acc}% benar</small></span>${chip(g.score)}</div>`).join('') : `<p class="muted">Belum ada keterampilan yang mencapai tingkat mahir (skor 80). Terus berlatih ya!</p>`}</section>
        <section class="card improve"><h2>💪 Yang perlu ditingkatkan</h2>${weak.length ? weak.slice(0, 5).map((w) => `<div class="wrow"><div class="lrow"><span class="grow"><b>${w.skill.name}</b><small>${w.att} soal · ${w.acc}% benar</small></span>${chip(w.score)}</div>
          ${w.tag ? `<p class="small"><b>Pola:</b> ${TAGS[w.tag].label}.</p>` : ''}${w.example ? `<p class="small ex">Contoh: "${esc(w.example.text)}" — dijawab <b class="strike">${esc(w.example.given)}</b>, seharusnya <b>${esc(w.example.answer)}</b>.</p>` : ''}
          <p class="small tip">💡 ${w.tag && w.tag !== 'konsep' ? TAGS[w.tag].tip : UNITS.find((u) => u.id === w.skill.unit).tip}</p></div>`).join('') : `<p class="muted">Tidak ada keterampilan yang tertinggal. Mantap!</p>`}</section>
      </div>
      ${tags.length ? `<section class="card"><h2>🔍 Pola kesalahan dari jawaban ${nm} (30 hari)</h2>${tags.map(([t, n]) => `<div class="tagrow"><b>${TAGS[t].label}</b> <span class="pill">${n}×</span><p class="small">${audience === 'ortu' ? 'Di rumah: ' : 'Saran: '}${TAGS[t].tip}</p></div>`).join('')}</section>` : ''}
      <section class="card"><h2>Kemajuan per bab</h2>${UNITS.map((u) => { const us = unitScore(k.id, u); return `<div class="uprog"><span>${u.icon} ${u.name}</span><span class="ubar"><i style="width:${us.avg}%;background:${u.color}"></i></span><small>${us.prof}/${us.total}</small></div>`; }).join('')}</section>
      ${audience === 'ortu' && recentWrong.length ? `<section class="card"><h2>Jawaban yang belum tepat (terbaru)</h2>${recentWrong.map((a) => `<div class="wa"><p>${esc(a.text)}</p><small>Jawaban ${nm}: <b class="strike">${esc(a.given)}</b> · Benar: <b>${esc(a.answer)}</b> · ${ago(a.ts)}</small></div>`).join('')}</section>` : ''}`;
  }

  /* ---------- Orang tua ---------- */
  function viewParentEnter() {
    app.innerHTML = shell(`
      <a class="back" href="#/">← Kembali</a>
      <section class="card narrow center"><div class="bigemoji">👨‍👩‍👧</div><h1>Laporan untuk orang tua</h1><p class="muted">Masukkan kode orang tua (6 huruf/angka) dari guru.</p>
        <form data-form="parentcode"><input name="code" class="codein" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC123" required><button class="btn">Lihat laporan</button></form></section>`);
  }
  function viewParentReport() {
    const ses = session.get(); const k = ses.role === 'ortu' && S.student(ses.id);
    if (!k) return go('#/ortu');
    app.innerHTML = shell(reportHTML(k, 'ortu') + `<p class="center muted small">SmartScore: 0–49 Mulai · 50–79 Berkembang · 80–99 Mahir · 100 Tuntas 🏆</p>`, { right: `<button class="link" data-act="logout">Keluar</button>` });
  }

  /* Pratinjau soal untuk guru (tidak disimpan) */
  function viewPreview(id) {
    const sk = SKILLS[id]; if (!sk) return go('#/guru');
    const qs = Array.from({ length: 3 }, () => sk.gen());
    app.innerHTML = shell(`<a class="back" href="#/guru/keterampilan">← Kembali</a><h1>${sk.code} ${sk.name}</h1><p class="muted">Contoh soal acak (tidak dicatat).</p>
      ${qs.map((q) => `<section class="qcard"><p class="qtext">${q.text}</p>${q.vis ? `<div class="qvis">${q.vis}</div>` : ''}${q.options ? `<p class="small">Pilihan: ${q.options.join(' · ')}</p>` : ''}<div class="explain"><b>Jawaban: ${q.answer}</b><p>${q.explain}</p></div></section>`).join('')}
      <button class="btn" data-act="reload">Soal lain</button>`);
  }

  /* ---------- Rute ---------- */
  let routeSeq = 0;
  async function route() {
    clearInterval(timer);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const [a, b, c] = parts;
    const seq = ++routeSeq;
    S.setMode(cloudOn());
    const needsData = a === 'belajar' || a === 'latihan' || (a === 'ortu' && b === 'laporan') || (a === 'guru' && b && b !== 'masuk' && b !== 'daftar');
    if (needsData && !(await ensure())) return;
    if (seq !== routeSeq) return;
    window.scrollTo(0, 0);
    switch (a) {
      case '': case undefined: return viewHome();
      case 'kurikulum': return viewCurriculum();
      case 'siswa': return b ? viewStudentPick(b) : viewStudentEnter();
      case 'belajar': return viewStudentHome();
      case 'latihan': return viewPractice(b);
      case 'guru': if (b === 'masuk' || b === 'daftar') return viewTeacherAuth(b); if (!b) { const ses = session.get(); return ses.role === 'guru' && (cloudOn() ? ses.token : S.teacher(ses.id)) ? go('#/guru/ringkasan') : viewTeacherAuth(); } return viewTeacher(b, c);
      case 'coba': return viewPreview(b);
      case 'ortu': return b === 'laporan' ? viewParentReport() : viewParentEnter();
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
    if (act === 'key') {
      if (!P || P.locked) return;
      if (el.dataset.k === 'del') P.input = P.input.slice(0, -1); else if (P.input.length < 6) P.input += el.dataset.k;
      document.getElementById('indisp').innerHTML = P.input || '&nbsp;';
    } else if (act === 'submit') submit(P.input);
    else if (act === 'choose') submit(P.q.options[+el.dataset.i]);
    else if (act === 'next') nextQ();
    else if (act === 'again') { P.score = 0; nextQ(); }
    else if (act === 'say') speak(P.q.speak || P.q.text);
    else if (act === 'pickkid') { session.set({ role: 'siswa', id: el.dataset.id, code: el.dataset.code }); go('#/belajar'); }
    else if (act === 'logout') {
      const ses = session.get();
      if (cloudOn() && ses.role === 'guru' && ses.token) Cloud.rpc('teacher_logout', { p_token: ses.token }).catch(() => {});
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
    if (el.dataset.act === 'switchclass') { const s = session.get(); s.classId = el.value; session.set(s); route(); }
    if (el.dataset.act === 'import' && el.files[0]) { el.files[0].text().then((t) => { try { S.importJSON(t); toast('Data berhasil digabungkan ✔'); route(); } catch (err) { toast('File tidak valid'); } }); }
  });
  document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.unit[data-unit]') && e.target.open) sessionStorage.setItem('metiq_open', e.target.dataset.unit); }, true);
  document.addEventListener('keydown', (e) => {
    if (!P || !document.getElementById('pq') || e.target.tagName === 'INPUT') return;
    if (P.q && P.q.type === 'input' && !P.locked) {
      if (/^[0-9]$/.test(e.key) && P.input.length < 6) P.input += e.key; else if (e.key === 'Backspace') P.input = P.input.slice(0, -1); else if (e.key === 'Enter') return submit(P.input); else return;
      document.getElementById('indisp').innerHTML = P.input || '&nbsp;';
    } else if (e.key === 'Enter' && document.querySelector('[data-act="next"]')) nextQ();
  });
  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, fd = new FormData(f), kind = f.dataset.form;
    if (cloudOn()) return cloudSubmit(f, fd, kind);
    if (kind === 'classcode') { const c = S.classByCode(fd.get('code')); if (!c) return toast('Kode kelas tidak ditemukan'); go('#/siswa/' + c.code); }
    if (kind === 'parentcode') { const k = S.studentByParentCode(fd.get('code')); if (!k) return toast('Kode tidak ditemukan. Periksa lagi ya.'); session.set({ role: 'ortu', id: k.id }); go('#/ortu/laporan'); }
    if (kind === 'register') { const t = S.createTeacher(fd.get('name'), fd.get('pin')); const c = S.createClass(t.id, fd.get('cls')); session.set({ role: 'guru', id: t.id, classId: c.id }); go('#/guru/kelola'); }
    if (kind === 'login') { const t = S.loginTeacher(fd.get('id'), fd.get('pin')); if (!t) return toast('PIN salah'); session.set({ role: 'guru', id: t.id }); go('#/guru/ringkasan'); }
    const ctx = teacherCtx();
    if (!ctx) return;
    if (kind === 'addkid') { String(fd.get('name')).split(',').map((x) => x.trim()).filter(Boolean).forEach((n) => S.addStudent(ctx.c.id, n)); route(); }
    if (kind === 'renameclass') { S.renameClass(ctx.c.id, fd.get('name')); route(); }
    if (kind === 'newclass') { const c = S.createClass(ctx.t.id, fd.get('name')); const s = session.get(); s.classId = c.id; session.set(s); route(); }
    if (kind === 'assign') { const sk = fd.getAll('sk'); if (!sk.length) return toast('Pilih minimal satu keterampilan'); S.addAssignment(ctx.c.id, sk, fd.get('note'), fd.get('due')); toast('Tugas disimpan ✔'); route(); }
  });

  async function cloudSubmit(f, fd, kind) {
    const btn = f.querySelector('button'); if (btn) btn.disabled = true;
    const done = () => { if (btn) btn.disabled = false; };
    const fail = (err) => { done(); toast(err.status ? err.message : 'Tidak bisa terhubung ke server'); };
    try {
      if (kind === 'classcode') return go('#/siswa/' + String(fd.get('code')).trim().toUpperCase());
      if (kind === 'parentcode') {
        const code = String(fd.get('code')).trim().toUpperCase();
        const b = await Cloud.rpc('parent_bundle', { p_code: code });
        if (!b || !b.students.length) { done(); return toast('Kode tidak ditemukan. Periksa lagi ya.'); }
        session.set({ role: 'ortu', id: b.students[0].id, pcode: code });
        S.loadBundle(b); loaded = { key: 'o' + code, at: Date.now() };
        return go('#/ortu/laporan');
      }
      if (kind === 'register' || kind === 'login') {
        const r = kind === 'register'
          ? await Cloud.rpc('teacher_register', { p_name: fd.get('name'), p_email: fd.get('email'), p_password: fd.get('pass'), p_class_name: fd.get('cls') })
          : await Cloud.rpc('teacher_login', { p_email: fd.get('email'), p_password: fd.get('pass') });
        if (r.error) { done(); return toast(r.error); }
        session.set({ role: 'guru', id: r.teacherId, token: r.token });
        return go(kind === 'register' ? '#/guru/kelola' : '#/guru/ringkasan');
      }
      const ctx = teacherCtx();
      if (!ctx) return done();
      if (kind === 'addkid') {
        const names = String(fd.get('name')).split(',').map((x) => x.trim()).filter(Boolean);
        const used = ctx.kids.map((k) => k.avatar);
        const free = S.AVATARS.filter((a) => !used.includes(a));
        const avatars = names.map((_, i) => free[i] || S.AVATARS[Math.floor(Math.random() * S.AVATARS.length)]);
        return tAct('teacher_add_students', { p_class_id: ctx.c.id, p_names: names, p_avatars: avatars }, `${names.length} siswa ditambahkan ✔`);
      }
      if (kind === 'renameclass') return tAct('teacher_rename_class', { p_class_id: ctx.c.id, p_name: fd.get('name') }, 'Nama kelas diganti ✔');
      if (kind === 'newclass') {
        const id = await Cloud.rpc('teacher_create_class', { p_token: session.get().token, p_name: fd.get('name') });
        const s = session.get(); s.classId = id; session.set(s);
        await ensure(true); toast('Kelas baru dibuat ✔'); return route();
      }
      if (kind === 'assign') {
        const sk = fd.getAll('sk'); if (!sk.length) { done(); return toast('Pilih minimal satu keterampilan'); }
        return tAct('teacher_add_assignment', { p_class_id: ctx.c.id, p_skills: sk, p_note: fd.get('note'), p_due: fd.get('due') }, 'Tugas disimpan ✔');
      }
    } catch (err) { fail(err); }
  }

  window.addEventListener('hashchange', route);
  route();
})();
