/* Metiq — aplikasi utama: rute, tampilan siswa, guru, dan orang tua. */
(function () {
  const { UNITS, SKILLS, TAGS, GRADES, unitsOf, classify } = window.METIQ_CURRICULUM;
  const S = window.Store;
  const app = document.getElementById('app');
  const DAY = 864e5;

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

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const t = strip(text).replace(/−/g, ' kurang ').replace(/\+/g, ' tambah ').replace(/=/g, ' sama dengan ').replace(/\?/g, ' berapa? ').replace(/×/g, ' kali ');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.lang = 'id-ID'; u.rate = 0.9;
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith('id')); if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  const shell = (inner, opts = {}) => `
    <header class="top"><a href="#/" class="logo"><img class="logo-i" src="icons/icon.svg?v=26" alt="">Metiq<span class="alpha">Alpha</span></a>${opts.right || ''}</header>
    <main class="wrap ${opts.cls || ''}">${session.get().demo ? `<div class="demobar">🧪 <span class="grow"><b>Mode coba</b> · data contoh, hanya tersimpan di perangkat ini</span><button class="link" data-act="logout">Keluar</button></div>` : ''}${inner}</main>`;

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
  function viewHome() {
    const ses = session.get();
    const resume = ses.role === 'siswa' && S.student(ses.id) ? `<a class="resume" href="#/belajar">Lanjut belajar sebagai <b>${esc(S.student(ses.id).name)}</b> →</a>`
      : ses.role === 'guru' && S.teacher(ses.id) ? `<a class="resume" href="#/guru">Buka dasbor <b>${esc(S.teacher(ses.id).name)}</b> →</a>` : '';
    app.innerHTML = shell(`
      <section class="hero">
        <h1>Belajar matematika SD kelas 1–6, <span>selangkah demi selangkah.</span></h1>
        <p>Kelas 1 sampai ${GRADES[GRADES.length - 1].name.replace('Kelas ', '')}: ${UNITS.length} bab dan ${Object.keys(SKILLS).length} keterampilan dalam bahasa Indonesia. Soal menyesuaikan kemampuan anak, dengan penjelasan setiap kali jawaban belum tepat.</p>
        ${resume}
      </section>
      <section class="roles">
        <a class="role r1" href="#/siswa"><span class="ri">🧒</span><b>Saya Siswa</b><small>Mulai latihan</small></a>
        <a class="role r2" href="#/guru"><span class="ri">${avHTML('svg:ustadzah')}</span><b>Saya Guru</b><small>Kelola kelas & lihat kemajuan</small></a>
        <a class="role r3" href="#/ortu"><span class="ri">👨‍👩‍👧</span><b>Saya Orang Tua</b><small>Lihat laporan anak</small></a>
      </section>
      <a class="card mlink" href="#/permainan"><span class="micon">🎮</span><span class="grow"><b>Permainan matematika</b><small>${G.GAMES.length} permainan untuk kelas 1–6, termasuk menara balok angka. Kumpulkan bintang ⭐</small></span>→</a>
      <a class="card mlink" href="#/panduan/guru"><span class="micon">📘</span><span class="grow"><b>Panduan pemakaian</b><small>Cara memakai Metiq untuk guru, orang tua, dan siswa</small></span>→</a>
      <section class="card">
        <h2>Isi kurikulum</h2>
        <p class="muted">${UNITS.length} bab dan ${Object.keys(SKILLS).length} keterampilan untuk kelas 1–6. Cakupan keterampilan mengacu pada IXL, cara menjelaskan memakai metode Singapore Math (pasangan bilangan, membuat 10, model batang, model luas), dan setiap bab dipetakan ke Capaian Pembelajaran Kurikulum Merdeka Fase A–C dengan konteks Indonesia.</p>
        <p class="small"><a href="#/kurikulum">Bagaimana kurikulum ini disusun, dan mengapa? →</a></p>
        <div class="grade-sum">${GRADES.map((g) => `<a href="#/kurikulum" data-act="grade" data-g="${g.id}"><b>${g.name}</b><small>${unitsOf(g.id).length} bab · ${unitsOf(g.id).reduce((a, u) => a + u.skills.length, 0)} keterampilan</small></a>`).join('')}</div>
        <a class="btn ghost" href="#/kurikulum">Lihat semua keterampilan</a>
      </section>
      <section class="card trycard"><h2>🧪 Coba Metiq (versi Alpha)</h2>
        <p class="small muted">Tanpa daftar. Memakai data contoh satu sekolah yang hanya tersimpan di perangkat ini, jadi aman untuk dicoba. Atau masukkan kode <b>1234</b> di halaman siswa atau orang tua.</p>
        <div class="trybtns"><button class="btn" data-act="trydemo" data-r="siswa">🧒 Coba sebagai siswa</button><button class="btn ghost" data-act="trydemo" data-r="ortu">👨‍👩‍👧 Coba sebagai orang tua</button><button class="btn ghost" data-act="trydemo" data-r="guru">👩‍🏫 Coba sebagai guru</button></div></section>
    `);
  }

  function viewCurriculum() {
    app.innerHTML = shell(`
      <a class="back" href="#/">← Kembali</a>
      <h1>Kurikulum Matematika SD</h1>
      <p class="muted">Setiap bab mencantumkan rujukan IXL, Singapore Math, dan Kurikulum Merdeka yang setara.</p>
      <details class="card cdesign-wrap"><summary><b>🧭 Bagaimana kurikulum ini disusun, dan mengapa?</b></summary>${curriculumDesignHTML(false)}</details>
      ${gradeTabs()}
      ${curUnits().map((u) => `<section class="card unit" style="--c:${u.color}"><h2><span class="uicon">${u.icon}</span>${u.id}. ${u.name}</h2><p class="muted small">IXL: ${u.ixl} · Singapore Math: ${u.sg} · Kurikulum Merdeka: ${u.km}</p><a class="lessonlink" href="#/pelajaran/${u.id}">📖 Buka pelajaran</a><ol>${u.skills.map((s) => `<li>${s.name}</li>`).join('')}</ol></section>`).join('')}
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
        <p class="small muted trynote">Ingin mencoba dulu? Masukkan kode <b>1234</b>.</p>
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
      <div class="pick">${kids.map((k) => `<button class="kid" data-act="pickkid" data-id="${k.id}" data-code="${c.code}"><span>${avHTML(k.avatar)}</span>${esc(k.name)}</button>`).join('') || '<p class="muted center">Belum ada siswa di kelas ini.</p>'}</div>`);
  }
  function viewStudentHome() {
    const ses = session.get(); const st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    if (sessionStorage.getItem('metiq_diag_skip') !== st.id) {
      if (!S.diagOf(st.id)) return go('#/asesmen');
      if (S.postPending(st.id)) return go('#/asesmen/akhir');
    }
    const c = S.cls(st.classId);
    const prog = S.progressAll(st.id);
    const asg = S.assignmentsFor(st.id);
    asg.forEach((a) => { if (!S.isDone(a.id, st.id) && asgComplete(a, st.id)) markDone(a.id, st.id, 'siswa'); });
    const g = getGrade(), wk = weekStats(st.id), pb = prizeBoard(st.id, g);
    const todo = asg.filter((a) => !S.isDone(a.id, st.id));
    const tab = ss.get('dtab', todo.length ? 'guru' : 'rek');
    const recent = Object.entries(prog).filter(([k, p]) => SKILLS[k] && p.last && p.att).sort((a, b) => b[1].last - a[1].last).slice(0, 6);
    const rec = recommend(st.id, g);
    const open = sessionStorage.getItem('metiq_open') || '';
    const unsent = cloudOn() ? Cloud.pendingCount(st.id) : 0;
    const panel = (id, inner) => `<div class="dpanel" data-p="${id}" ${tab === id ? '' : 'hidden'}>${inner}</div>`;
    const tabBtn = (id, label) => `<button role="tab" class="${tab === id ? 'on' : ''}" data-act="dtab" data-t="${id}">${label}</button>`;
    app.innerHTML = shell(`
      ${unsent ? `<p class="offline">📶 ${unsent} jawaban menunggu internet untuk dikirim ke guru.</p>` : ''}
      <section class="hello"><a class="av avedit" href="#/avatar/saya" aria-label="Ganti avatar">${avHTML(st.avatar)}<i>✏️</i></a><div><h1>Halo, ${esc(st.name)}!</h1><p class="muted">${greet()} · ${esc(c ? c.name : '')} · ⭐ ${S.gameStars(st.id)}</p></div></section>
      <section class="card dwork"><h2>🤔 Mau belajar apa?</h2>
        <div class="dtabs" role="tablist">${tabBtn('guru', `📌 Dari guru${todo.length ? ` <b>${todo.length}</b>` : ''}`)}${tabBtn('baru', '🕘 Terakhir')}${tabBtn('rek', '✨ Saran')}</div>
        ${panel('guru', asg.length ? asg.map((a) => `<div class="asg">${a.students && a.students.length ? '<span class="pill special">🎯 Khusus untukmu</span>' : ''}${S.isDone(a.id, st.id) ? '<span class="pill okp">✅ Selesai</span>' : ''}${a.note ? `<p><b>${esc(a.note)}</b>${a.due ? ` · <span class="muted">sampai ${esc(fdue(a.due))}</span>` : ''}</p>` : ''}<div class="sklist">${a.skills.filter((k) => SKILLS[k]).map((k) => skillLink(k, prog[k])).join('')}</div>${feedbackHTML(a, st.id, 'siswa')}</div>`).join('') : '<p class="muted dempty">Belum ada tugas. Tugas dari Bu/Pak Guru akan muncul di sini.</p>')}
        ${panel('baru', recent.length ? `<div class="sklist">${recent.map(([k, p]) => skillLink(k, p, `Kelas ${SKILLS[k].grade} · ${ago(p.last)}`)).join('')}</div>` : '<p class="muted dempty">Keterampilan yang terakhir kamu latih akan muncul di sini. Ayo mulai!</p>')}
        ${panel('rek', rec.length ? `<p class="small muted">Pilihan untukmu di <b>Kelas ${g}</b>:</p><div class="sklist">${rec.map((r) => skillLink(r.id, prog[r.id], r.why)).join('')}</div>` : `<p class="muted dempty">Hebat! Semua keterampilan Kelas ${g} sudah kamu kuasai. 🏆</p>`)}
      </section>
      <div class="grid2">
        <section class="card howdo"><h2>📈 Bagaimana kemajuanku?</h2><p class="small muted">Minggu ini (${fdate(wk.from)} – hari ini)</p>
          <div class="wkstats"><div><b>${wk.n}</b><small>soal dijawab</small></div><div><b>${fmtTime(wk.ms)}</b><small>waktu belajar</small></div><div><b>${wk.skills}</b><small>keterampilan berkembang</small></div></div>
          ${wk.n ? '' : '<p class="small">Minggu ini belum berlatih. Ayo mulai! 💪</p>'}
          <a class="btn sm ghost" href="#/laporanku">Lihat laporanku →</a></section>
        <a class="card prizecard" href="#/hadiah"><span class="pz-ico">🎁</span><span class="grow"><b>Papan hadiah Kelas ${g}</b><small>${pb.open} dari ${pb.cells.length} hadiah terbuka</small><small>${pb.open < pb.cells.length ? `Hadiah berikutnya: ${nextWin(pb, true)}` : 'Semua hadiah sudah terbuka! 🎉'}</small></span><span class="pz-go">→</span></a>
        <a class="card prizecard" href="#/permainan"><span class="pz-ico">🎮</span><span class="grow"><b>Permainan matematika</b><small>⭐ ${S.gameStars(st.id)} bintang terkumpul</small><small>Kilat, Balon, Pasangan, dan Menara balok untuk Kelas ${g}</small></span><span class="pz-go">→</span></a>
      </div>
      <h2 class="allsk">📚 Semua keterampilan</h2>
      ${gradeTabs()}
      <div class="units">${curUnits().map((u) => {
        const us = unitScore(st.id, u);
        return `<details class="unit card" style="--c:${u.color}" ${open === u.id ? 'open' : ''} data-unit="${u.id}"><summary><span class="uicon">${u.icon}</span><span class="utitle"><b>${u.id}. ${u.name}</b><small>${us.prof} dari ${us.total} keterampilan mahir</small></span><span class="ubar"><i style="width:${us.avg}%"></i></span></summary><a class="lessonlink" href="#/pelajaran/${u.id}">📖 Pelajaran: ${u.name}</a><div class="sklist">${u.skills.map((s) => skillLink(s.id, prog[s.id])).join('')}</div></details>`;
      }).join('')}</div>
    `, { right: `<span class="topr"><a class="help" href="#/panduan/siswa" aria-label="Panduan">❓</a>${ses.back ? '<button class="link" data-act="backparent">← Akun orang tua</button>' : '<button class="link" data-act="logout">Keluar</button>'}</span>` });
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
    const dg = S.diagOf(sid, 'b') || S.diagOf(sid), gaps = dg ? dg.items.filter((x) => !x.ok && SKILLS[x.id] && S.progress(sid, x.id).score < 80).map((x) => ({ id: x.id, why: `Dari asesmen awal · Kelas ${SKILLS[x.id].grade}` })) : [];
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
    1: '🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐦🐤🦆🦉🐴🦄🐝🐛🦋🐌🐞🐢🐍🦖🐙🦀🐠🐬🐳',
    2: '🍎🍐🍊🍋🍌🍉🍇🍓🍈🍒🍑🥭🍍🥥🥝🍅🥑🥦🥕🌽🥔🍠🥐🍞🧀🥚🍳🥞🍕🍔🍟🌭🍿🍩🍪🎂',
    3: '🚗🚕🚙🚌🚎🚓🚑🚒🚐🚚🚛🚜🛵🚲🛴🚂🚆🚇🚊🚝🚄🚁🛸🚀⛵🚤🚠🚡🛺🚃🌍🌙⭐🪐🌟🚘',
    4: '⚽🏀🏈⚾🥎🎾🏐🏉🥏🎱🏓🏸🏒🥍🏏🥅🎯🪁🛹🥊🥋🎽🛷🥌🎿🏆🥇🥈🥉🏅🎻🎸🎺🎷🥁🎹',
    5: '🌵🎄🌲🌳🌴🌱🌿🍀🎍🍁🍂🍃🍄🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝🌛🌈🌊🔥💧🌋🗻🐚🪸🪨🌰🎋',
    6: '🔭🔬💡🔦🧭🧲🧪🧫🧬💎🔑🎁🎈🎀🎨🧩🎲🧸📚📐📏🧮🎓👑🎩🎒🧳⌛⏰📷🎥💻📱🎧🎤🪄',
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
    const prizes = [...PRIZES[g]];
    const cells = boardOrder(g).map((ci, pos) => { const c = CHALLENGES[ci]; return { pos, c, prize: prizes[ci], have: st[c.k], open: st[c.k] >= c.n }; });
    const next = {};
    CHALLENGES.forEach((c) => { if (st[c.k] < c.n && !(c.k in next)) next[c.k] = c.n - st[c.k]; });
    return { st, cells, next, open: cells.filter((x) => x.open).length };
  }
  const nextWin = (pb, short) => { const parts = Object.entries(pb.next).map(([k, n]) => `${n} ${chUnit[k]} lagi`); return short ? parts.slice(0, 2).join(' atau ') : parts.join(', atau '); };
  function viewPrizes() {
    const ses = session.get(); const st = S.student(ses.id);
    if (ses.role !== 'siswa' || !st) return go('#/siswa');
    const g = getGrade(), pb = prizeBoard(st.id, g);
    app.innerHTML = shell(`<a class="back" href="#/belajar">← Kembali</a>
      <h1>🎁 Papan hadiah</h1><p class="muted">Ada apa di balik kotak itu? Setiap kotak punya tantangan. Selesaikan tantangannya untuk membuka hadiah!</p>
      ${gradeTabs()}
      <div class="pzwrap"><div class="pzboard">${pb.cells.map((x) => `<button class="pz ${x.open ? 'open' : ''}" data-act="pz" data-i="${x.pos}" aria-label="${x.open ? 'Hadiah terbuka' : 'Kotak tertutup'}">${x.open ? x.prize : '?'}</button>`).join('')}</div>
        <aside class="card pzside"><h2>Kesibukanmu di Kelas ${g}</h2>
          <div id="pzinfo" class="pzinfo small">👆 Ketuk sebuah kotak untuk melihat tantangannya.</div>
          <div class="lrow"><span class="grow">Soal dijawab</span><b>${pb.st.q}</b></div>
          <div class="lrow"><span class="grow">Waktu berlatih</span><b>${fmtTime(pb.st.t * 60000)}</b></div>
          <div class="lrow"><span class="grow">Keterampilan mahir ⭐</span><b>${pb.st.s}</b></div>
          <div class="lrow"><span class="grow">Keterampilan tuntas 🏆</span><b>${pb.st.m}</b></div>
          <div class="lrow"><span class="grow">Hadiah terbuka 🎁</span><b>${pb.open}/${pb.cells.length}</b></div>
          ${pb.open < pb.cells.length ? `<p class="small"><b>Hadiah berikutnya:</b> ${nextWin(pb)}.</p>` : `<p class="small"><b>Semua hadiah Kelas ${g} sudah terbuka! 🎉</b></p>`}
        </aside></div>
      <div class="row-btn"><a class="btn" href="#/belajar">Ayo berlatih</a></div>`,
    { right: `<span class="topr"><a class="help" href="#/panduan/siswa" aria-label="Panduan">❓</a></span>` });
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
      <header class="ptop" style="--c:${u.color}"><a href="#/belajar" class="pback" aria-label="Kembali">←</a><div class="ptitle"><small>${sk.code} · ${u.name}</small><b>${sk.name}</b></div><button class="pback psound" data-act="sound" aria-label="Suara">${window.SFX.enabled() ? '🔔' : '🔕'}</button><a href="#/pelajaran/${u.id}" class="pback plesson" aria-label="Pelajaran">📖</a></header>
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
             ${q.keys ? `<div class="keypad extra">${q.keys.map((k) => `<button data-act="key" data-k="${k}">${k}</button>`).join('')}</div>` : ''}<div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-act="key" data-k="${n}">${n}</button>`).join('')}<button data-act="key" data-k="del" class="kdel">⌫</button><button data-act="key" data-k="0">0</button><button data-act="submit" class="ksub">Jawab</button></div>`}
        </div>
      </section>
      <div id="fb"></div>`;
  }
  function submit(given) {
    if (P.locked) return;
    const q = P.q;
    if (q.type === 'input' && given === '') return toast('Tulis jawabanmu dulu ya');
    // titik ribuan dan spasi diabaikan; tanda minus dan koma desimal dibakukan
    const norm = (x) => String(x).trim().toLowerCase().replace(/[−–]/g, '-').replace(/[.\s]/g, '');
    const ok = q.type === 'choice' ? given === q.answer : norm(given) === norm(q.answer);
    if (P.diag) return diagAnswer(ok);
    P.locked = true; P.count++;
    const tag = ok ? null : classify(q, given);
    const asgDone = (a) => a.skills.filter((k) => SKILLS[k]).every((k) => S.progress(P.sid, k).score >= 80);
    const myAsg = S.assignmentsFor(P.sid).filter((a) => a.skills.includes(P.sk.id) && !asgDone(a));
    const pzBefore = prizeBoard(P.sid, P.sk.grade).open;
    const res = S.record(P.sid, P.sk.id, { ok, given: strip(given), answer: strip(q.answer), text: strip(q.log || q.text), tag, ms: Date.now() - P.qStart });
    if (cloudOn()) Cloud.queue(P.sid, session.get().code, S.lastAnswer(), Object.assign({}, res));
    const before = P.score; P.score = res.score;
    document.getElementById('pcount').textContent = P.count;
    const sc = document.getElementById('pscore'); sc.textContent = P.score; sc.className = ok ? 'up' : 'down';
    document.getElementById('sbar').style.width = P.score + '%';
    document.querySelectorAll('.opt').forEach((b) => { const v = q.options[+b.dataset.i]; if (v === q.answer) b.classList.add('right'); else if (v === given) b.classList.add('wrong'); b.disabled = true; });
    const fb = document.getElementById('fb');
    const finished = ok ? myAsg.filter(asgDone) : [];
    if (prizeBoard(P.sid, P.sk.grade).open > pzBefore) setTimeout(() => toast('🎁 Hadiah baru terbuka di papan hadiahmu!'), finished.length || (P.score >= 80 && before < 80) ? 1300 : 300);
    finished.forEach((a) => markDone(a.id, P.sid, 'siswa'));
    if (ok) {
      if (P.score >= 100 && before < 100) window.SFX.mastered();
      else if (finished.length) { window.SFX.task(); toast(`📌 Tugas selesai: ${esc(finished[0].note || 'Tugas dari guru')}! 🎉`); }
      else if (P.score >= 80 && before < 80) { window.SFX.levelUp(); toast('⭐ Naik ke tingkat Mahir!'); }
      else window.SFX.correct();
      fb.innerHTML = `<div class="fb ok">${['Hebat!', 'Pintar!', 'Benar sekali!', 'Mantap!', 'Keren!'][Math.floor(Math.random() * 5)]} 🎉</div>`;
      if (P.score >= 100 && before < 100) return setTimeout(() => renderMastered(false), 900);
      setTimeout(nextQ, 1000);
    } else {
      window.SFX.wrong();
      fb.innerHTML = `<div class="fb no"><h3>Belum tepat 🙂</h3>
        <p>Jawabanmu: <b class="strike">${esc(strip(given))}</b> · Jawaban yang benar: <b>${q.answer}</b></p>
        <div class="explain"><b>Cara mengerjakan:</b><p>${q.explain}</p><a class="small" href="#/pelajaran/${P.sk.unit}">📖 Baca pelajaran bab ini</a>${window.METIQ_ANIM.has(P.sk.unit) ? ` · <button class="link small" data-act="anim" data-u="${P.sk.unit}">🎬 Tonton animasi</button>` : ''}<div class="anim-inline"></div></div>
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
      <p class="trynote center small"><button class="link" data-act="trydemo" data-r="guru">🧪 Coba dulu sebagai guru contoh (tanpa daftar) →</button></p>
      <section class="card narrow">
        <div class="bigemoji center">👩‍🏫</div>
        ${reg ? `<h1 class="center">Daftar sebagai guru</h1>
          <form data-form="register" class="form">
            <label>Nama guru<input name="name" required placeholder="mis. Bu Rina" autocomplete="name"></label>
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <label>Kata sandi (min. 6 karakter)<input name="pass" type="password" minlength="6" required autocomplete="new-password"></label>
            <label>Nama kelas<input name="cls" required placeholder="mis. Kelas 1A"></label>
            <label>Kode admin <small class="muted">(khusus admin, kosongkan jika bukan)</small><input name="admin" autocomplete="off" autocapitalize="characters"></label>
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
    // Di mode server, daftar kelas sudah disaring oleh server (admin melihat semua kelas)
    let classes = cloudOn() || t.isAdmin ? S.db.classes.slice() : S.classesOf(t.id);
    if (!cloudOn()) classes = classes.map((c) => Object.assign({ teacherName: (S.teacher(c.teacherId) || {}).name }, c));
    if (!classes.length) { if (cloudOn()) return null; classes = [S.createClass(t.id, 'Kelas 1')]; }
    const c = classes.find((x) => x.id === ses.classId) || classes[0];
    return { t, c, classes, kids: S.studentsOf(c.id) };
  }
  const TABS = [['ringkasan', 'Ringkasan'], ['siswa', 'Siswa'], ['analitik', 'Analitik'], ['peta', 'Peta kemajuan'], ['keterampilan', 'Keterampilan'], ['tugas', 'Tugas'], ['kelola', 'Kelola kelas'], ['referensi', 'Referensi']];
  function teacherShell(ctx, tab, inner) {
    app.innerHTML = shell(`
      <section class="dhead">
        <div class="dh-row"><a class="av avedit" href="#/avatar/guru" aria-label="Ganti avatar">${avHTML(ctx.t.avatar || 'svg:ustadzah')}<i>✏️</i></a>
          <div class="dh-text"><div class="dh-who">${esc(ctx.t.name)}${ctx.t.isAdmin ? ' <span class="pill">Admin</span>' : ''}</div><h1>${esc(ctx.c.name)}</h1>
          <div class="dh-meta">Kode kelas <b class="code">${ctx.c.code}</b>${ctx.c.teacherName && ctx.c.teacherId !== ctx.t.id ? ` · milik ${esc(ctx.c.teacherName)}` : ''}</div></div></div>
        ${ctx.classes.length > 1 ? `<select class="dh-select" data-act="switchclass" aria-label="Pilih kelas">${ctx.classes.map((c) => `<option value="${c.id}" ${c.id === ctx.c.id ? 'selected' : ''}>${esc(c.name)}${ctx.t.isAdmin && c.teacherName ? ` · ${esc(c.teacherName)}` : ''}</option>`).join('')}</select>` : ''}
      </section>
      <nav class="tabs">${(ctx.t.isAdmin ? [['sekolah', '🏫 Sekolah'], ...TABS] : TABS).map(([k, l]) => `<a href="#/guru/${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</nav>
      ${inner}`, { cls: 'wide', right: topRight() });
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
    if (tab === 'referensi') return teacherShell(ctx, tab, referenceHTML());
    if (tab === 'sekolah') return ctx.t.isAdmin ? teacherShell(ctx, tab, schoolHTML(ctx, arg)) : go('#/guru/ringkasan');
    if (tab === 'tugas') return teacherShell(ctx, tab, tasksHTML(ctx));
    if (!kids.length) return teacherShell(ctx, tab, emptyKids(ctx));
    if (tab === 'analitik') return teacherShell(ctx, tab, analyticsHTML(ctx, arg));

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
          <section class="card"><h2>⚠️ Perlu perhatian</h2>${attention.length ? attention.map((x) => `<a class="lrow" href="#/guru/siswa/${x.k.id}"><span class="av sm">${avHTML(x.k.avatar)}</span><span class="grow"><b>${esc(x.k.name)}</b><small>${x.s.answered === 0 ? `Tidak berlatih 7 hari terakhir · terakhir ${ago(x.all.last)}` : `Ketepatan ${x.s.acc}% dari ${x.s.answered} soal`}</small></span>→</a>`).join('') : '<p class="muted">Semua siswa aktif dan ketepatannya baik. 👍</p>'}</section>
          <section class="card"><h2>🧗 Keterampilan tersulit di kelas</h2>${hard.length ? hard.map((h) => `<div class="lrow"><span class="grow"><b>${SKILLS[h.id].code} ${SKILLS[h.id].name}</b><small>Ketepatan ${h.acc}% · ${h.n} siswa mencoba</small></span><button class="btn sm ghost" data-act="assign1" data-id="${h.id}">Tugaskan</button></div>`).join('') : '<p class="muted">Belum cukup data.</p>'}</section>
          <section class="card"><h2>🔍 Pola kesalahan kelas (14 hari)</h2>${tags.length ? tags.map(([t, n]) => `<div class="tagrow"><b>${TAGS[t].label}</b> <span class="pill">${n}×</span><p class="muted small">${TAGS[t].tip}</p></div>`).join('') : '<p class="muted">Belum ada pola kesalahan yang menonjol.</p>'}</section>
          <section class="card"><h2>⭐ Paling rajin minggu ini</h2>${stars.length ? stars.map((x, i) => `<a class="lrow" href="#/guru/siswa/${x.k.id}"><span class="medal">${['🥇', '🥈', '🥉'][i]}</span><span class="av sm">${avHTML(x.k.avatar)}</span><span class="grow"><b>${esc(x.k.name)}</b><small>${x.s.correct} jawaban benar</small></span></a>`).join('') : '<p class="muted">Belum ada aktivitas minggu ini.</p>'}</section>
        </div>`);
    }
    if (tab === 'siswa') {
      return teacherShell(ctx, tab, `<section class="card"><div class="tscroll"><table class="tbl"><thead><tr><th>Siswa</th><th>Soal</th><th>Ketepatan</th><th>Waktu</th><th>Mahir</th><th>🏆</th><th>Terakhir</th><th>Ortu buka laporan</th></tr></thead><tbody>
        ${kids.map((k) => { const s = stats(k.id); return `<tr data-href="#/guru/siswa/${k.id}"><td><span class="av sm">${avHTML(k.avatar)}</span> <a href="#/guru/siswa/${k.id}">${esc(k.name)}</a></td><td>${s.answered}</td><td><span class="accb ${s.acc >= 80 ? 'g' : s.acc >= 60 ? 'y' : 'r'}">${s.answered ? s.acc + '%' : '–'}</span></td><td>${fmtTime(s.ms)}</td><td>${s.proficient}</td><td>${s.mastered}</td><td>${ago(s.last)}</td><td>${S.viewsOf(k.id).length}×</td></tr>`; }).join('')}
        </tbody></table></div></section>`);
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
  function schoolHTML(ctx, sub) {
    sub = ['kelas', 'grafik', 'materi', 'guru', 'asesmen', 'ulasan', 'data'].includes(sub) ? sub : 'kelas';
    const g = getRange();
    const all = ctx.classes.map((c) => classSummary(c, g)).sort((a, b) => b.status - a.status || b.pBehind - a.pBehind);
    const sum = (f) => all.reduce((t, s) => t + s[f], 0);
    const kidsN = sum('n'), answered = all.reduce((t, s) => t + s.answered, 0), correct = all.reduce((t, s) => t + Math.round(s.answered * s.acc / 100), 0);
    const teachers = [...new Set(all.map((s) => s.c.teacherId))];
    const subs = [['kelas', '🏫 Per kelas'], ['grafik', '📊 Grafik'], ['materi', '🧗 Materi sulit'], ['guru', '👩‍🏫 Per guru'], ['asesmen', '🧭 Asesmen awal–akhir'], ['ulasan', '⭐ Ulasan'], ['data', '📥 Data penelitian']];
    let body;
    if (sub === 'kelas') {
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
      body = `<section class="card"><h2>Bab yang paling banyak belum dipahami (seluruh sekolah)</h2>${ul.length ? ul.map((x) => { const u = UNITS.find((y) => y.id === x.u); return `<div class="lrow"><span class="uicon">${u.icon}</span><span class="grow"><b>Kelas ${u.grade} · ${u.name}</b><small>${x.kids.size} siswa di ${x.classes.size} kelas</small></span><a class="btn sm ghost" href="#/pelajaran/${u.id}">📖 Pelajaran</a></div>`; }).join('') : '<p class="muted">Belum ada materi yang menonjol sulit. 👍</p>'}</section>
        ${all.filter((s) => s.n).map((s) => `<section class="card"><div class="lrow"><span class="grow"><b>${esc(s.c.name)}</b> · ${esc(s.c.teacherName || '')}<small>${s.behind} dari ${s.n} siswa belum memahami sebagian materi</small></span>${statusPill(s.status)}</div>
          ${s.hard.length ? s.hard.slice(0, 5).map((h) => `<div class="hardrow"><div class="lrow"><span class="grow"><b>${SKILLS[h.id].code} ${SKILLS[h.id].name}</b><small>Kelas ${SKILLS[h.id].grade} · ketepatan rata-rata ${h.acc}%</small></span><span class="pill">${h.kids.length}/${s.n} siswa</span></div><p class="small muted">${h.kids.map((k) => esc(k.name)).join(', ')}</p></div>`).join('') : '<p class="muted small">Tidak ada materi yang tertinggal.</p>'}
          <div class="row-btn left">${openBtn(s.c)}</div></section>`).join('')}`;
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
      const part = (d) => (d ? [d.age, ageGradeOf(d.age), d.level, d.items.filter((x) => x.ok).length, d.items.length, d.items.filter((x) => x.fast).length, dec(d.ms / 60000), isoDay(d.at)] : ['', '', '', '', '', '', '', '']);
      kids.forEach(({ k, c }) => { const a = S.diagOf(k.id), b = S.diagOf(k.id, 'b'); if (!a && !b) return; rows.push([sc[k.id], cc[c.id], tc[c.teacherId], ...part(a), ...part(b), a && b ? b.level - a.level : '', a ? ageGradeOf(a.age) - a.level : '', b ? ageGradeOf(b.age) - b.level : '']); });
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
  // Lima keterampilan kunci per kelas (bilangan, tambah/kurang, kali/bagi, pecahan/desimal, pengukuran/aljabar) ada di S.DIAG
  const FAST = { 1: 8000, 2: 10000, 3: 12000, 4: 15000, 5: 18000, 6: 20000 }, GUESS = 3000;
  let D = null;
  const diagKid = () => { const ses = session.get(); return ses.role === 'siswa' && S.student(ses.id); };
  const isAdminNow = () => { const x = session.get(), t = x.role === 'guru' && S.teacher(x.id); return !!(t && t.isAdmin); };
  const DMODE = { a: { name: 'Asesmen awal', start: '#/asesmen', result: '#/asesmen/hasil' }, b: { name: 'Asesmen akhir', start: '#/asesmen/akhir', result: '#/asesmen/akhir/hasil' } };
  const ageGradeOf = (age) => Math.max(1, Math.min(6, age - 6));
  function viewDiag(pf = 'a') {
    const st = diagKid(); if (!st) return go('#/siswa');
    if (pf === 'a' && S.diagOf(st.id)) return go(DMODE.a.result);
    if (pf === 'b' && !S.postPending(st.id)) return go(S.diagOf(st.id, 'b') ? DMODE.b.result : '#/belajar');
    const pre = S.diagOf(st.id);
    app.innerHTML = shell(`<section class="card narrow center diag-intro"><div class="bigemoji">${pf === 'a' ? '🧭' : '🏁'}</div><h1>${DMODE[pf].name}</h1>
      ${pf === 'a' ? `<p>Halo, <b>${esc(st.name)}</b>! Sebelum mulai, jawab beberapa soal singkat supaya Metiq tahu dari mana kamu sebaiknya belajar. Ini bukan ujian dan tidak ada nilai, jadi santai saja. 😊</p>`
        : `<p>Halo, <b>${esc(st.name)}</b>! Gurumu ingin melihat kemajuanmu sejak asesmen awal${pre ? ` (${fdate(pre.at)})` : ''}. Caranya sama seperti dulu: jawab semampumu, santai saja. 💪</p>`}
      <h2>Berapa umurmu?</h2>
      <div class="agepick">${[6, 7, 8, 9, 10, 11, 12].map((a) => `<button class="btn ghost" data-act="dage" data-pf="${pf}" data-a="${a}" aria-label="${a} tahun"><b>${a}${a === 12 ? '+' : ''}</b><small>tahun</small></button>`).join('')}</div>
      <p class="small muted">Sekitar 8–15 soal · 5–10 menit</p>
      <p class="small"><button class="link" data-act="dskip">Nanti saja</button></p></section>`,
    { right: `<span class="topr"><a class="help" href="#/panduan/siswa" aria-label="Panduan">❓</a></span>` });
  }
  function diagStart(age, pf) {
    const st = diagKid(); if (!st) return;
    // titik mulai sama untuk asesmen awal dan akhir: satu kelas di bawah kelas sesuai usia (6–7 tahun = kelas 1)
    D = { sid: st.id, pf: pf || 'a', age, bands: {}, n: 0, t0: Date.now(), order: [] };
    diagBand(Math.max(1, ageGradeOf(age) - 1));
  }
  function diagBand(g) {
    const q = S.DIAG[g].filter((id) => SKILLS[id]).sort(() => Math.random() - 0.5);
    D.grade = g; D.bands[g] = { ok: [], bad: [], fast: [], guess: [], queue: q }; D.order.push(g);
    diagNext();
  }
  function diagNext() {
    const b = D.bands[D.grade], id = b.queue.shift();
    if (!id) return diagDecide(true);
    app.innerHTML = `<header class="ptop diag-top"><span class="pback">${D.pf === 'a' ? '🧭' : '🏁'}</span><div class="ptitle"><small>${DMODE[D.pf].name} · bagian ${D.order.length}</small><b>Soal ${D.n + 1}</b></div><button class="pback psound" data-act="sound" aria-label="Suara">${window.SFX.enabled() ? '🔔' : '🔕'}</button></header>
      <div class="sbar"><i style="width:${Math.min(95, (D.n / 15) * 100)}%"></i></div>
      <main class="wrap practice" id="pq"></main>`;
    P = { sid: D.sid, sk: SKILLS[id], diag: true, score: 0, count: 0, start: Date.now(), q: null, input: '', locked: false };
    nextQ();
    const fb = document.getElementById('fb'); if (fb) fb.innerHTML = '<p class="center small muted">Kerjakan semampumu. Jika belum tahu, tebak saja lalu lanjut.</p>';
  }
  function diagAnswer(ok) {
    P.locked = true; window.SFX.step();
    const b = D.bands[D.grade], ms = Date.now() - P.qStart; (ok ? b.ok : b.bad).push(P.sk.id); D.n++;
    if (ok && ms <= FAST[D.grade]) b.fast.push(P.sk.id);
    if (!ok && ms < GUESS) b.guess.push(P.sk.id);
    document.querySelectorAll('.opt, .keypad button').forEach((x) => { x.disabled = true; });
    setTimeout(() => diagDecide(false), 350);
  }
  // lulus = minimal 4 dari 5 (atau 3 benar pertama); belum = 3 salah; selain itu berhenti di kelas ini
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
    if (easy && g + 2 <= 6 && !D.bands[g + 1] && !D.bands[g + 2]) return diagBand(g + 2);
    if (v === 'pass' && g < 6 && !D.bands[g + 1]) return diagBand(g + 1);
    if (v === 'fail' && g > 1 && !D.bands[g - 1]) return diagBand(g - 1);
    // kelas tempat siswa sebaiknya belajar sekarang
    const level = v === 'mid' ? g : v === 'pass' ? Math.min(6, g + (D.bands[g + 1] ? 1 : 0)) : g;
    const answers = Object.keys(D.bands).sort().flatMap((k) => { const x = D.bands[k]; return [...x.ok.map((id) => [id, 1, x.fast.includes(id) ? 1 : 0, 0]), ...x.bad.map((id) => [id, 0, 0, x.guess.includes(id) ? 1 : 0])]; });
    const pf = D.pf, res = S.recordDiag(D.sid, { level, age: D.age, ms: Date.now() - D.t0, answers }, pf);
    if (cloudOn()) Object.entries(res).forEach(([key, v2]) => Cloud.queueProgress(D.sid, session.get().code, key, v2));
    setGrade(level); D = null; P = null;
    window.SFX.levelUp();
    go(DMODE[pf].result);
  }
  function diagSkills(dg, ok) { return dg.items.filter((x) => x.ok === ok && SKILLS[x.id]).sort((a, b) => SKILLS[a.id].grade - SKILLS[b.id].grade); }
  function viewDiagResult(pf = 'a') {
    const st = diagKid(); if (!st) return go('#/siswa');
    const dg = S.diagOf(st.id, pf); if (!dg) return go(DMODE[pf].start);
    const pre = pf === 'b' ? S.diagOf(st.id) : null, gain = pre ? dg.level - pre.level : 0;
    const prog = S.progressAll(st.id), good = diagSkills(dg, true), gaps = diagSkills(dg, false).filter((x) => SKILLS[x.id].grade <= dg.level);
    const slow = good.filter((x) => !x.fast), allFast = good.length >= 3 && !slow.length && !gaps.length;
    const first = unitsOf(dg.level)[0];
    app.innerHTML = shell(`<section class="card center diag-res"><div class="bigemoji">🎉</div><h1>${DMODE[pf].name} selesai!</h1>
        <p>Terima kasih, <b>${esc(st.name)}</b>. Menurut asesmen ini, kamu siap belajar materi</p><div class="diag-level">Kelas ${dg.level}</div>
        <p class="small muted">Usia ${dg.age} tahun · ${dg.items.length} soal · ${fmtTime(dg.ms)}</p>
        ${pre ? `<p class="diag-gain">${gain > 0 ? `📈 Naik <b>${gain} kelas</b> sejak asesmen awal (Kelas ${pre.level})! Hebat!` : gain === 0 ? `Sama dengan asesmen awal (Kelas ${pre.level}). Terus berlatih, kamu pasti bisa naik!` : `Asesmen awal: Kelas ${pre.level}. Tidak apa-apa, ayo berlatih lagi bersama gurumu.`}</p>` : ''}
        ${!pre && dg.level > ageGradeOf(dg.age) ? `<p class="small">⚡ Kamu menjawab cepat dan tepat, jadi Metiq memberimu soal yang lebih sulit. Levelmu di atas kelas untuk usiamu!</p>` : ''}
        ${allFast && dg.level === 6 ? '<p class="small">🚀 Semua soal kunci dijawab cepat dan tepat. Coba juga bab-bab akhir Kelas 6 dan permainan tantangan.</p>' : ''}</section>
      ${good.length ? `<section class="card"><h2>💪 Yang sudah kamu kuasai</h2><div class="diag-chips">${good.map((x) => `<span class="pill okp">${SKILLS[x.id].code} ${SKILLS[x.id].name}</span>`).join(' ')}</div></section>` : ''}
      ${slow.length ? `<section class="card"><h2>🐢 Sudah benar, tapi perlu lebih lancar</h2><p class="small muted">Kamu sudah paham, tetapi masih butuh waktu lama. Latihan sebentar supaya makin cepat.</p><div class="sklist">${slow.map((x) => skillLink(x.id, prog[x.id], `Kelas ${SKILLS[x.id].grade}`)).join('')}</div></section>` : ''}
      <section class="card"><h2>🎯 Yang perlu kamu pelajari</h2>${gaps.length ? `<p class="small muted">Mulailah dari sini. Daftar ini juga muncul di tab ✨ Saran.</p><div class="sklist">${gaps.map((x) => skillLink(x.id, prog[x.id], `Kelas ${SKILLS[x.id].grade}`)).join('')}</div>`
        : `<p>Hebat! Semua soal kunci sudah benar. Lanjutkan ke bab pertama Kelas ${dg.level}.</p><div class="sklist">${first.skills.slice(0, 3).map((x) => skillLink(x.id, prog[x.id])).join('')}</div>`}</section>
      <div class="row-btn"><a class="btn" href="#/belajar">Mulai belajar →</a></div>`,
    { right: `<span class="topr"><a class="help" href="#/panduan/siswa" aria-label="Panduan">❓</a></span>` });
  }
  // Ringkasan asesmen awal (dan akhir bila ada) untuk laporan guru, orang tua, dan siswa
  function diagSummaryHTML(k, audience) {
    const dg = S.diagOf(k.id), post = S.diagOf(k.id, 'b'), pending = S.postPending(k.id), admin = audience === 'guru' && isAdminNow();
    if (!dg) return audience === 'guru' ? `<section class="card diag-sum"><h2>🧭 Asesmen awal</h2><p class="muted small">${esc(k.name)} belum mengerjakan asesmen awal. Asesmen muncul otomatis saat ${esc(k.name)} pertama kali masuk sebagai siswa.</p></section>` : '';
    const gaps = diagSkills(dg, false), good = diagSkills(dg, true), ag = ageGradeOf(dg.age);
    return `<section class="card diag-sum"><h2>🧭 Asesmen ${post || pending ? 'awal dan akhir' : 'awal'}</h2>
      <p>${audience === 'siswa' ? 'Kamu' : esc(k.name)} ditempatkan di <b>materi Kelas ${dg.level}</b> <span class="muted small">(usia ${dg.age} tahun · ${fdate(dg.at)} · ${good.length}/${dg.items.length} soal kunci benar)</span>.${audience !== 'siswa' && dg.level < ag ? ` <span class="warnline small">Tertinggal ${ag - dg.level} kelas dari kelas sesuai usia (Kelas ${ag}).</span>` : ''}</p>
      ${post ? `<p class="diag-gain">🏁 Asesmen akhir (${fdate(post.at)}): <b>Kelas ${post.level}</b> · ${post.level > dg.level ? `📈 naik ${post.level - dg.level} kelas` : post.level === dg.level ? 'belum berubah' : `turun ${dg.level - post.level} kelas`}${audience !== 'siswa' ? (post.level >= ageGradeOf(post.age) ? ' · ✅ sudah sesuai usia' : ` · masih ${ageGradeOf(post.age) - post.level} kelas di bawah usia`) : ''}</p>` : ''}
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
      S.studentsOf(s.c.id).forEach((k) => { const d = S.diagOf(k.id, 'b') || S.diagOf(k.id); if (!d) return cnt[4]++; const gap = ageGradeOf(d.age) - d.level; cnt[gap <= 0 ? 0 : Math.min(3, gap)]++; });
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
      o += `<text x="${L + gi * gw + gw / 2}" y="${base + 28}" text-anchor="middle" font-size="10" font-weight="800" fill="#16302b">Kelas ${g}</text>`;
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
      return `<div class="vzhm"><b class="small">Kelas ${g}</b><svg viewBox="0 0 ${W} ${H}" class="vzsvg" style="max-width:${W * 1.6}px" role="img" aria-label="Penguasaan bab kelas ${g}">${o}</svg></div>`;
    }).join('');
    const scale = [['belum dicoba', VZ.none], ['1–19', VZ.seq[1]], ['20–39', VZ.seq[2]], ['40–59', VZ.seq[3]], ['60–79', VZ.seq[4]], ['80–89', VZ.seq[5]], ['90–100', VZ.seq[6]]];
    weak.sort((a, b) => a[2] - b[2]);
    return `<section class="card vz"><h2>3. Peta penguasaan bab × kelas</h2>
      <p class="small muted">Rata-rata SmartScore setiap bab di setiap kelas (semua siswa kelas dihitung). Kolom = bab jenjang itu; ketuk kotak untuk rinciannya.</p>
      ${legend(scale.map(([l, c]) => [c, l]))}${blocks}
      ${weak.length ? `<p class="small"><b>Bab yang masih lemah (rata-rata &lt; 50):</b> ${weak.slice(0, 6).map(([g, u, m]) => `Kelas ${g} · ${u.name} (${m})`).join(' · ')}</p>` : ''}
      ${vzTable(['Kelas', 'Bab', 'Rata-rata SmartScore'], classes.flatMap((s) => unitsOf(s.g || 1).map((u) => { const kids = S.studentsOf(s.c.id); return [esc(s.c.name), `${u.id} ${u.name}`, Math.round(kids.reduce((t, k) => t + unitScore(k.id, u).avg, 0) / (kids.length || 1))]; })))}</section>`;
  }

  // 4. Asesmen awal → akhir (dumbbell): per kelas, atau per siswa untuk satu kelas
  function dumbbellChart(classes) {
    const sel = ss.get('vizdb', ''), one = classes.find((s) => s.c.id === sel);
    const avg = (xs) => xs.reduce((t, x) => t + x, 0) / xs.length;
    const rows = one
      ? S.studentsOf(one.c.id).map((k) => { const a = S.diagOf(k.id), b = S.diagOf(k.id, 'b'); return a ? { label: k.name, pre: a.level, post: b ? b.level : null, age: ageGradeOf((b || a).age), n: 1 } : null; }).filter(Boolean)
      : classes.map((s) => {
        const both = S.studentsOf(s.c.id).map((k) => [S.diagOf(k.id), S.diagOf(k.id, 'b')]).filter(([a]) => a);
        if (!both.length) return null;
        const paired = both.filter(([, b]) => b);
        return { label: s.short, pre: avg((paired.length ? paired : both).map(([a]) => a.level)), post: paired.length ? avg(paired.map(([, b]) => b.level)) : null, age: avg(both.map(([a, b]) => ageGradeOf((b || a).age))), n: paired.length, total: both.length };
      }).filter(Boolean);
    if (!rows.length) return `<section class="card vz"><h2>4. Asesmen awal → akhir</h2><p class="muted">Belum ada siswa yang mengerjakan asesmen awal.</p></section>`;
    const L = one ? 70 : 44, W = 340, RH = 24, H = rows.length * RH + 30, X = (v) => L + 12 + ((v - 1) / 5) * (W - L - 30);
    let o = [1, 2, 3, 4, 5, 6].map((v) => `<line x1="${X(v)}" x2="${X(v)}" y1="4" y2="${H - 22}" stroke="${VZ.grid}"/><text x="${X(v)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="${VZ.ink2}">Kelas ${v}</text>`).join('');
    rows.forEach((r, i) => {
      const y = 14 + i * RH, f1 = (v) => dec(v);
      o += `<text x="${L - 6}" y="${y + 4}" text-anchor="end" font-size="10" font-weight="800" fill="#16302b">${esc(r.label.length > 9 ? r.label.slice(0, 9) + '…' : r.label)}</text>`;
      o += `<path d="M${X(r.age)} ${y - 8}v16" stroke="${VZ.s2}" stroke-width="3" stroke-linecap="round"/>`;
      if (r.post !== null) o += `<line x1="${X(r.pre)}" x2="${X(r.post)}" y1="${y}" y2="${y}" stroke="${VZ.ord[1]}" stroke-width="3" stroke-linecap="round"/>`;
      o += `<circle cx="${X(r.pre)}" cy="${y}" r="5" fill="#fff" stroke="${VZ.s1}" stroke-width="2.5"/>`;
      if (r.post !== null) o += `<circle cx="${X(r.post)}" cy="${y}" r="5.5" fill="${VZ.s1}" stroke="#fff" stroke-width="2"/>`;
      o += `<rect x="${L}" y="${y - 11}" width="${W - L}" height="22" fill="transparent" class="vzhit" ${tip(one ? r.label : `${r.label} · ${r.n} dari ${r.total} siswa sudah asesmen akhir`, `awal Kelas ${f1(r.pre)}${r.post !== null ? ` → akhir Kelas ${f1(r.post)} (${r.post - r.pre >= 0 ? '+' : ''}${dec(r.post - r.pre)})` : ' · belum asesmen akhir'} · sesuai usia Kelas ${f1(r.age)}`)}/>`;
    });
    const caught = one ? rows.filter((r) => r.post !== null && r.post >= r.age && r.pre < r.age).length : 0;
    return `<section class="card vz"><h2>4. Asesmen awal → akhir</h2>
      <p class="small muted">${one ? `Setiap baris satu siswa ${esc(one.c.name)}.` : 'Rata-rata level per kelas dari siswa yang sudah mengerjakan keduanya (jika belum ada asesmen akhir, hanya titik awal).'} Garis oranye = kelas sesuai usia: semakin dekat titik akhir ke garis itu, semakin terkejar ketertinggalannya.</p>
      <div class="vzpills"><button class="${one ? '' : 'on'}" data-act="vizdb" data-c="">Semua kelas</button>${classes.map((s) => `<button class="${one && one.c.id === s.c.id ? 'on' : ''}" data-act="vizdb" data-c="${s.c.id}">${esc(s.short)}</button>`).join('')}</div>
      ${legend([[VZ.s1, 'Awal', 'ring'], [VZ.s1, 'Akhir', 'dot'], [VZ.s2, 'Kelas sesuai usia', 'tick']])}
      <svg viewBox="0 0 ${W} ${H}" class="vzsvg" role="img" aria-label="Level asesmen awal dan akhir">${o}</svg>
      ${one && caught ? `<p class="small">🎯 ${caught} siswa sudah mengejar kelas sesuai usianya.</p>` : ''}
      ${vzTable([one ? 'Siswa' : 'Kelas', 'Awal', 'Akhir', 'Naik', 'Sesuai usia'], rows.map((r) => [esc(r.label), dec(r.pre), r.post === null ? '–' : dec(r.post), r.post === null ? '–' : dec(r.post - r.pre), dec(r.age)]))}</section>`;
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

  /* ---------- Asesmen awal dan akhir untuk penelitian (khusus admin) ---------- */
  // Simpan progres atas nama siswa memakai kode kelas, seperti saat siswa menyimpan progresnya sendiri
  const syncKid = (k, rec) => (cloudOn() ? Cloud.rpc('student_sync', { p_code: S.cls(k.classId).code, p_student_id: k.id, p_answers: [], p_progress: rec }) : Promise.resolve());
  async function postOpen(kids, open) {
    for (const k of kids) await syncKid(k, S.openPost(k.id, open));
    if (cloudOn()) await ensure(true);
  }
  function prepostRows(kids) {
    return kids.map((k) => {
      const pre = S.diagOf(k.id), post = S.diagOf(k.id, 'b'), age = (post || pre || {}).age, ag = age ? ageGradeOf(age) : null;
      return { k, pre, post, pending: S.postPending(k.id), ag, gain: pre && post ? post.level - pre.level : null };
    });
  }
  function prepostHTML(all) {
    const rows = all.flatMap((s) => prepostRows(S.studentsOf(s.c.id)).map((r) => ({ ...r, c: s.c })));
    const both = rows.filter((r) => r.pre && r.post), mean = (xs) => (xs.length ? dec(xs.reduce((t, x) => t + x, 0) / xs.length) : '–');
    const atAge = (list, key) => list.filter((r) => r[key].level >= ageGradeOf(r[key].age)).length;
    const cell = (d, r) => (d ? `Kelas ${d.level} <small class="muted">${fdate(d.at)}</small>` : '–');
    return `<section class="card"><h2>🧭 Asesmen awal dan akhir</h2>
        <p class="small">Asesmen awal (pretest) dikerjakan otomatis saat siswa pertama kali masuk. Asesmen akhir (posttest) memakai prosedur yang sama dan hanya bisa dibuka oleh admin. Hasil keduanya disimpan terpisah, sehingga hasil awal tidak pernah tertimpa.</p>
        <div class="kpis"><div class="kpi"><small>Sudah asesmen awal</small><b>${rows.filter((r) => r.pre).length}<span>/${rows.length}</span></b></div><div class="kpi"><small>Sudah asesmen akhir</small><b>${both.length}<span> · ${rows.filter((r) => r.pending).length}⏳</span></b></div>
          <div class="kpi"><small>Rata-rata kelas: awal → akhir</small><b class="sm">${mean(both.map((r) => r.pre.level))} → ${mean(both.map((r) => r.post.level))}</b></div><div class="kpi"><small>Sesuai usia: awal → akhir</small><b class="sm">${both.length ? `${atAge(both, 'pre')} → ${atAge(both, 'post')} dari ${both.length}` : '–'}</b></div></div>
        <p class="small muted">Rata-rata dan "sesuai usia" dihitung dari siswa yang sudah mengerjakan keduanya. Kelas sesuai usia: 6–7 tahun = Kelas 1, 8 = Kelas 2, …, 11 = Kelas 5, 12+ = Kelas 6.</p></section>
      ${all.map((s) => { const rs = prepostRows(S.studentsOf(s.c.id)), canOpen = rs.filter((r) => r.pre && !r.pending); return `<section class="card"><div class="lrow"><span class="grow"><b>${esc(s.c.name)}</b><small>${esc(s.c.teacherName || '')} · ${rs.filter((r) => r.pre).length}/${rs.length} sudah asesmen awal</small></span>${canOpen.length ? `<button class="btn sm" data-act="postclass" data-c="${s.c.id}">🏁 Buka asesmen akhir (${canOpen.length})</button>` : ''}</div>
        <div class="tscroll"><table class="tbl"><thead><tr><th>Siswa</th><th>Usia</th><th>Sesuai usia</th><th>Awal</th><th>Akhir</th><th>Naik</th><th>Status</th><th></th></tr></thead><tbody>
        ${rs.map((r) => `<tr><td><a href="#/guru/siswa/${r.k.id}" data-act="openkid" data-id="${s.c.id}" data-s="${r.k.id}">${avHTML(r.k.avatar)} ${esc(r.k.name)}</a></td><td>${(r.post || r.pre || {}).age || '–'}</td><td>${r.ag ? 'Kelas ' + r.ag : '–'}</td><td>${cell(r.pre)}</td><td>${r.pending ? '⏳ dibuka' : cell(r.post)}</td>
          <td>${r.gain === null ? '–' : `<b class="${r.gain > 0 ? 'okc' : ''}">${r.gain > 0 ? '+' : ''}${r.gain}</b>`}</td>
          <td>${!r.pre ? '<span class="muted">belum asesmen</span>' : (() => { const d = r.post || r.pre, gap = ageGradeOf(d.age) - d.level; return gap > 0 ? `<span class="accb ${gap >= 2 ? 'r' : 'y'}">tertinggal ${gap}</span>` : '<span class="accb g">sesuai usia</span>'; })()}</td>
          <td>${r.pre ? (r.pending ? `<button class="link small" data-act="postone" data-s="${r.k.id}" data-o="0">Batalkan</button>` : `<button class="link small" data-act="postone" data-s="${r.k.id}" data-o="1">${r.post ? 'Ulangi' : 'Buka'}</button>`) : ''}</td></tr>`).join('')}
        </tbody></table></div></section>`; }).join('')}`;
  }

  /* ---------- Mode coba (Alpha): data contoh lokal untuk siswa, orang tua, dan guru ---------- */
  const TRY_CODE = '1234';
  function startDemo(role) {
    session.set({ demo: true }); S.setMode(false);
    const t = S.seedDemo(), c = S.classesOf(t.id)[0], kids = S.studentsOf(c.id);
    if (role === 'guru') { session.set({ role: 'guru', id: t.id, demo: true }); toast('Mode coba: Anda masuk sebagai guru contoh'); return go('#/guru/ringkasan'); }
    if (role === 'ortu') { const k = kids.find((x) => x.name === 'Alya') || kids[0]; session.set({ role: 'ortu', id: k.id, demo: true }); toast(`Mode coba: laporan ${k.name}`); return go('#/ortu/laporan'); }
    go('#/siswa/' + c.code);
  }

  /* ---------- Permainan matematika ---------- */
  const G = window.METIQ_GAMES;
  let stopGame = null;
  const gameKid = () => { const ses = session.get(); return ses.role === 'siswa' && S.student(ses.id); };
  const starRow = (n, max = 3) => `<span class="gstars">${'⭐'.repeat(n)}<i>${'⭐'.repeat(max - n)}</i></span>`;
  function viewGames() {
    const kid = gameKid(), g = getGrade();
    const best = (id) => { const p = kid ? S.progress(kid.id, 'g:' + id) : null; return p && p.att ? p : null; };
    app.innerHTML = shell(`<a class="back" href="${kid ? '#/belajar' : '#/'}">← Kembali</a>
      <h1>🎮 Permainan matematika</h1>
      <p class="muted">${kid ? `Kamu punya <b>⭐ ${S.gameStars(kid.id)} bintang</b>. Setiap ronde memberi sampai 3 bintang. Main lagi untuk mengumpulkan lebih banyak!` : 'Masuk sebagai siswa agar bintangmu tersimpan. Tanpa masuk, kamu tetap bisa mencoba.'}</p>
      ${gradeTabs()}
      <div class="glist">${G.GAMES.filter((x) => x.grade === g).map((x) => { const b = best(x.id); return `<a class="card gitem" href="#/main/${x.id}"><span class="gicon g-${x.type}">${x.icon}</span><span class="grow"><b>${x.name}</b><small>${x.desc}</small><small class="gtype">${G.TYPES[x.type]}</small></span><span class="gbest">${b ? `${starRow(G.starsFor(x, b.score))}<small>terbaik ${b.score} poin · ${b.att}× main</small>` : '<small>Belum dimainkan</small>'}</span></a>`; }).join('')}</div>`,
    { right: `<span class="topr"><a class="help" href="#/panduan/siswa" aria-label="Panduan">❓</a></span>` });
  }
  function viewGame(id) {
    const x = G.byId(id); if (!x) return go('#/permainan');
    const kid = gameKid(), how = { kilat: 'Jawab soal sebanyak mungkin dalam 60 detik. Jawaban benar berturut-turut membuat kombo 🔥.', balon: 'Balon terbang ke atas. Ketuk balon yang sesuai perintah di atas. Ketuk balon yang salah, poinmu berkurang 1. Perintah berganti setiap 5 balon.', pasangan: 'Buka dua kartu. Jika soal dan jawabannya cocok, kartu tetap terbuka. Semakin sedikit salah tebak, semakin banyak bintang.', susun: `Ketuk sebuah kolom untuk menjatuhkan balok. Dua balok yang bersentuhan (samping atau atas-bawah) dan jumlahnya ${x.target !== undefined ? x.show(x.target) : ''} akan hilang. Hilang beruntun = poin bonus! Permainan selesai jika semua kolom penuh.`, kembar: `Balok jatuh terus dan makin cepat. Ketuk kolom (atau ◀ ▶) untuk menggeser balok, ketuk lagi kolom yang sama (atau ▼) untuk menjatuhkannya. Balok yang sama dan bersentuhan menyatu menjadi dua kali lipat. Jika tumpukan masuk ke baris merah paling atas, permainan selesai. Poin naik setiap balok terbesarmu berlipat dua (64 = 50 poin, 128 = 60, 256 = 70).` }[x.type];
    app.innerHTML = shell(`<a class="back" href="#/permainan">← Semua permainan</a>
      <section class="card ghead"><span class="gicon g-${x.type}">${x.icon}</span><div class="grow"><small class="muted">Kelas ${x.grade} · ${G.TYPES[x.type]}</small><h1>${x.name}</h1></div></section>
      <div id="garea"><section class="card center gintro"><p>${how}</p><p class="small muted">⭐ ${x.stars[0]} poin · ⭐⭐ ${x.stars[1]} poin · ⭐⭐⭐ ${x.stars[2]} poin</p>${kid ? '' : '<p class="small muted">Kamu belum masuk sebagai siswa, jadi bintang tidak disimpan.</p>'}<button class="btn" data-act="gstart">▶ Mulai</button></section></div>`,
    { right: `<span class="topr"><button class="pback psound" data-act="sound" aria-label="Suara">${window.SFX.enabled() ? '🔔' : '🔕'}</button></span>` });
  }
  function startGame() {
    const x = G.byId(location.hash.split('/')[2]), area = document.getElementById('garea'); if (!x || !area) return;
    if (stopGame) stopGame();
    stopGame = G.start(area, x, ({ points, ms }) => {
      stopGame = null;
      const kid = gameKid(), stars = G.starsFor(x, points);
      const before = kid ? S.progress(kid.id, 'g:' + x.id) : null, prevBest = before && before.att ? before.score : 0;
      if (kid) {
        const res = S.recordGame(kid.id, x.id, points, stars, ms);
        if (cloudOn()) Cloud.queueProgress(kid.id, session.get().code, 'g:' + x.id, res);
      }
      if (stars >= 3) window.SFX.mastered(); else if (stars) window.SFX.levelUp();
      area.innerHTML = `<section class="card center gend"><div class="gbig">${starRow(stars)}</div><h2>${stars >= 3 ? 'Luar biasa!' : stars === 2 ? 'Hebat!' : stars ? 'Bagus!' : 'Ayo coba lagi!'}</h2>
        <p>Kamu mendapat <b>${points} poin</b>${stars ? ` dan <b>${stars} bintang</b>` : ''}.${kid && points > prevBest && before && before.att ? ' 🎉 Rekor baru!' : ''}</p>
        ${kid ? `<p class="small muted">Total bintangmu sekarang ⭐ ${S.gameStars(kid.id)}</p>` : ''}
        ${stars < 3 ? `<p class="small muted">Butuh ${x.stars[stars]} poin untuk ${stars + 1} bintang.</p>` : ''}
        <div class="row-btn"><button class="btn" data-act="gstart">Main lagi</button><a class="btn ghost" href="#/permainan">Permainan lain</a></div></section>`;
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
      return `<details class="card trouble"><summary><span class="grow"><b>${sk.code} ${sk.name}</b><small>Kelas ${sk.grade} · ${t.w.length} salah dari ${t.tot} soal · ${t.sids.length} siswa</small></span><span class="pill warn">${pct(t.w.length, t.tot)}% salah</span></summary>
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
        <div class="pickskills">${UNITS.map((u) => `<fieldset><legend>${u.icon} Kelas ${u.grade} · ${u.id}. ${u.name}</legend>${u.skills.map((x) => `<label class="cb"><input type="checkbox" name="sk" value="${x.id}" ${preSkill === x.id ? 'checked' : ''}> ${x.code} ${x.name}</label>`).join('')}</fieldset>`).join('')}</div>
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
      ${next.length ? `<h3 class="sub">Materi lanjutan</h3>${next.map((id) => row(id, `Kelas ${SKILLS[id].grade} · belum pernah dicoba`)).join('')}` : ''}
      <div class="row-btn left"><button class="btn sm" data-act="asgform" data-s="${k.id}">Buat tugas khusus lainnya</button></div></section>`;
  }
  function manageHTML(ctx) {
    return `<div class="grid2">
      <section class="card"><h2>Tambah siswa</h2><form data-form="addkid" class="form inline"><input name="name" placeholder="Nama siswa" required><button class="btn">Tambah</button></form>
        <p class="muted small">Bisa tambah banyak sekaligus: pisahkan nama dengan koma.</p></section>
      <section class="card"><h2>Cara masuk</h2><p><b>Siswa:</b> buka Metiq → "Saya Siswa" → masukkan kode kelas <b class="code">${ctx.c.code}</b> → ketuk nama.</p><p><b>Orang tua:</b> buka Metiq → "Saya Orang Tua" → masukkan kode orang tua masing-masing anak (lihat daftar di bawah).</p><button class="btn ghost sm" data-act="print">Cetak kartu kode</button></section>
    </div>
    <section class="card"><h2>Daftar siswa (${ctx.kids.length})</h2>${ctx.kids.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>Siswa</th><th>Kode orang tua</th>${cloudOn() ? '<th>Akun orang tua</th>' : ''}<th></th></tr></thead><tbody>${ctx.kids.map((k) => `<tr><td><a class="avpick" href="#/avatar/siswa-${k.id}" title="Ganti avatar">${avHTML(k.avatar)}</a> ${esc(k.name)}</td><td><b class="code">${k.parentCode}</b></td>${cloudOn() ? `<td class="small">${(k.parents || []).map(esc).join('<br>') || '<span class="muted">–</span>'}</td>` : ''}<td class="r"><button class="btn sm ghost danger" data-act="rmkid" data-id="${k.id}">Hapus</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Belum ada siswa.</p>'}</section>
    <div class="grid2">
      <section class="card"><h2>Kelas</h2><form data-form="renameclass" class="form inline"><input name="name" value="${esc(ctx.c.name)}" required><button class="btn ghost">Ganti nama</button></form>
        <form data-form="newclass" class="form inline"><input name="name" placeholder="Nama kelas baru" required><button class="btn ghost">Tambah kelas</button></form></section>
      ${cloudOn() ? `<section class="card"><h2>Data</h2><p class="muted small">Data kelas tersimpan di server dan otomatis tersinkron ke HP siswa, orang tua, dan guru.</p><div class="row-btn"><button class="btn ghost sm" data-act="export">Unduh cadangan</button></div></section>`
      : `<section class="card"><h2>Cadangan data</h2><p class="muted small">Data tersimpan di perangkat ini. Unduh cadangan secara berkala, atau gabungkan data dari perangkat lain.</p><div class="row-btn"><button class="btn ghost sm" data-act="export">Unduh cadangan</button><label class="btn ghost sm">Gabungkan file<input type="file" accept=".json" data-act="import" hidden></label></div></section>`}
    </div>
    <div class="printcards">${ctx.kids.map((k) => `<div class="pcard"><div class="av">${avHTML(k.avatar)}</div><b>${esc(k.name)}</b><div>Kode kelas: <b>${ctx.c.code}</b></div><div>Kode orang tua: <b>${k.parentCode}</b></div><small>metiq · ${esc(ctx.c.name)}</small></div>`).join('')}</div>`;
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
      <section class="card"><h2>Kemajuan per bab</h2>${reportGrades(k.id).map((g, _, all) => (all.length > 1 ? `<p class="small"><b>Kelas ${g}</b></p>` : '') + unitsOf(g).map((u) => { const us = unitScore(k.id, u); return `<div class="uprog"><span>${u.icon} ${u.name}</span><span class="ubar"><i style="width:${us.avg}%;background:${u.color}"></i></span><small>${us.prof}/${us.total}</small></div>`; }).join('')).join('')}</section>
      ${audience === 'ortu' && recentWrong.length ? `<section class="card"><h2>Jawaban yang belum tepat (terbaru)</h2>${recentWrong.map((a) => `<div class="wa"><p>${esc(a.text)}</p><small>Jawaban ${nm}: <b class="strike">${esc(a.given)}</b> · Benar: <b>${esc(a.answer)}</b> · ${ago(a.ts)}</small></div>`).join('')}</section>` : ''}`;
  }

  /* ---------- Orang tua ---------- */
  function viewParentEnter() {
    const ses = session.get();
    if (cloudOn() && ses.role === 'ortu' && ses.ptoken) return go('#/ortu/anak');
    app.innerHTML = shell(`
      <a class="back" href="#/">← Kembali</a>
      ${cloudOn() ? `<section class="card narrow"><div class="bigemoji center">👨‍👩‍👧</div><h1 class="center">Masuk akun orang tua</h1>
        <p class="muted center small">Satu akun untuk semua anak: lihat laporan dan ikut belajar bersama anak.</p>
        <form data-form="plogin" class="form">
          <label>Email<input name="email" type="email" required autocomplete="email"></label>
          <label>Kata sandi<input name="pass" type="password" required autocomplete="current-password"></label>
          <button class="btn">Masuk</button>
        </form><p class="center"><a href="#/ortu/daftar">Belum punya akun? Daftar</a></p></section>` : ''}
      <section class="card narrow center">${cloudOn() ? '<h2>Atau lihat laporan dengan kode</h2>' : '<div class="bigemoji">👨‍👩‍👧</div><h1>Laporan untuk orang tua</h1>'}<p class="muted">Masukkan kode orang tua (6 huruf/angka) dari guru.</p>
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
    const ses = session.get();
    if (!(ses.role === 'ortu' && ses.ptoken)) return go('#/ortu');
    const p = S.db.parent || {};
    const kids = S.db.students;
    app.innerHTML = shell(`
      <section class="dhead"><div><small class="muted">Akun orang tua</small><h1>Halo, ${esc(p.name || '')}</h1></div></section>
      ${kids.map((k) => { const s7 = stats(k.id, 7), all = stats(k.id); const c = S.cls(k.classId) || {};
        return `<section class="card kidcard"><div class="report-head"><span class="av lg">${avHTML(k.avatar)}</span><div class="grow"><h2>${esc(k.name)}</h2><p class="muted small">${esc(c.name || '')}${c.teacherName ? ' · ' + esc(c.teacherName) : ''}</p></div></div>
          <div class="kpis"><div class="kpi"><small>Soal 7 hari</small><b>${s7.answered}</b></div><div class="kpi"><small>Ketepatan</small><b>${all.acc}%</b></div><div class="kpi"><small>Mahir</small><b>${all.proficient}</b></div><div class="kpi"><small>Terakhir</small><b class="sm">${ago(all.last)}</b></div></div>
          <div class="row-btn"><a class="btn" href="#/ortu/laporan/${k.id}">Lihat laporan</a><button class="btn ghost" data-act="askid" data-id="${k.id}">Belajar sebagai ${esc(k.name)}</button></div>
          <p class="center small"><button class="link muted" data-act="punlink" data-id="${k.id}">Lepas dari akun</button></p></section>`; }).join('') || '<section class="card center"><div class="bigemoji">🧒</div><p class="muted">Belum ada anak yang terhubung.</p></section>'}
      <section class="card"><h2>Tambah anak</h2><p class="muted small">Masukkan kode orang tua anak (dari guru).</p>
        <form data-form="plink" class="form inline"><input name="code" class="codein sm" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC123" required><button class="btn">Tambah</button></form></section>
    `, { right: topRight() });
  }
  function viewParentReport(sid) {
    const ses = session.get();
    const k = ses.role === 'ortu' && S.student(sid || ses.id);
    if (!k) return go(ses.ptoken ? '#/ortu/anak' : '#/ortu');
    logParentView(k.id);
    app.innerHTML = shell((ses.ptoken ? '<a class="back" href="#/ortu/anak">← Anak saya</a>' : '') + reportHTML(k, 'ortu') + `<p class="center muted small">SmartScore: 0–49 Mulai · 50–79 Berkembang · 80–99 Mahir · 100 Tuntas 🏆</p>`, { right: topRight() });
  }

  /* ---------- Panduan pemakaian ---------- */
  function viewManual(tab) {
    const M = window.METIQ_MANUAL, ses = session.get();
    if (!M[tab] || tab === 'faq') tab = ses.role === 'siswa' ? 'siswa' : ses.role === 'ortu' ? 'ortu' : 'guru';
    const m = M[tab];
    const tabs = [['guru', `${avHTML('svg:ustadzah')} Guru`], ['ortu', '👨‍👩‍👧 Orang Tua'], ['siswa', '🧒 Siswa']];
    app.innerHTML = shell(`
      <button class="back link noprint" data-act="back">← Kembali</button>
      <div class="gtabs noprint">${tabs.map(([k, l]) => `<a class="${k === tab ? 'on' : ''}" href="#/panduan/${k}">${l}</a>`).join('')}</div>
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
      const kids = x.ptoken ? S.db.students : [S.student(x.id)].filter(Boolean);
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
      body = items.length ? items.map((n) => `<a class="notif ${n.at > seen ? 'new' : ''}" href="#/guru/siswa/${n.k.id}"><span class="av sm">${avHTML(n.k.avatar)}</span><span class="grow"><b>${esc(n.k.name)}</b> menyelesaikan tugas <b>${esc(n.a.note || 'Tugas')}</b><small>${ftime(n.at)} · ${n.d.by === 'ortu' ? 'dilaporkan orang tua' : 'semua keterampilan sudah mahir'}</small></span>${n.at > seen ? '<i class="dot-new"></i>' : ''}</a>`).join('')
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
  function viewLesson(uid) {
    const u = UNITS.find((x) => x.id === uid), les = LESSONS[uid];
    if (!u || !les) return go('#/kurikulum');
    const kid = session.get().role === 'siswa';
    const practice = (id) => (kid ? `#/latihan/${id}` : `#/coba/${id}`);
    const prog = kid ? S.progressAll(session.get().id) : {};
    app.innerHTML = shell(`
      <button class="back link" data-act="back">← Kembali</button>
      <section class="card lhead" style="--c:${u.color}"><span class="uicon">${u.icon}</span><div class="grow"><small class="muted">Pelajaran · Kelas ${u.grade} · Bab ${u.id}</small><h1>${u.name}</h1><p>${les.intro}</p></div><button class="say" data-act="lsay" data-i="-1" aria-label="Bacakan">🔊</button></section>
      ${window.METIQ_ANIM.has(uid) ? `<section class="card anim-card"><h2>🎬 Animasi: ${u.name}</h2><div id="anim-box"></div></section>` : ''}
      ${les.parts.length > 1 ? `<div class="ltoc">${les.parts.map((p, i) => `<button data-act="lgo" data-i="${i}">${i + 1}. ${p.t}</button>`).join('')}</div>` : ''}
      ${les.parts.map((p, i) => `<section class="card lpart" id="lp-${i}">
        <div class="lph"><span class="lnum" style="background:${u.color}">${i + 1}</span><h2>${p.t}</h2><button class="say sm" data-act="lsay" data-i="${i}" aria-label="Bacakan">🔊</button></div>
        <ol class="lsteps">${p.steps.map((st) => `<li>${st}</li>`).join('')}</ol>
        ${p.sg ? `<div class="sgnote"><span class="sgtag">Cara Singapura</span> ${p.sg}</div>` : ''}
        <div class="lex"><h3>Ayo coba!</h3><div id="lex-${i}">${lessonExample(p.ex)}</div>
          <div class="row-btn left"><button class="btn sm ghost" data-act="lexnew" data-i="${i}" data-sk="${p.ex}">🔄 Contoh lain</button><a class="btn sm" href="${practice(p.ex)}">Latihan: ${SKILLS[p.ex].name} →</a></div></div>
      </section>`).join('')}
      <section class="card"><h2>Latihan di bab ini</h2><div class="sklist">${u.skills.map((s) => (kid ? skillLink(s.id, prog[s.id]) : `<a class="sk" href="${practice(s.id)}"><span class="sk-code">${s.code}</span><span class="sk-name">${s.name}</span><span class="chip lv0">→</span></a>`)).join('')}</div></section>
    `);
    window.METIQ_ANIM.mount(document.getElementById('anim-box'), uid);
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
    if (stopGame) { stopGame(); stopGame = null; }
    window.METIQ_ANIM.stop();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const [a, b, c] = parts;
    const seq = ++routeSeq;
    S.setMode(cloudOn());
    const needsData = a === 'belajar' || a === 'asesmen' || a === 'permainan' || a === 'main' || a === 'hadiah' || a === 'laporanku' || a === 'latihan' || (a === 'ortu' && (b === 'laporan' || b === 'anak')) || (a === 'guru' && b && b !== 'masuk' && b !== 'daftar') || a === 'avatar' || a === 'notifikasi';
    if (needsData && !(await ensure())) return;
    if (seq !== routeSeq) return;
    window.scrollTo(0, 0);
    switch (a) {
      case '': case undefined: return viewHome();
      case 'kurikulum': return viewCurriculum();
      case 'siswa': return b ? viewStudentPick(b) : viewStudentEnter();
      case 'belajar': return viewStudentHome();
      case 'asesmen': return b === 'hasil' ? viewDiagResult('a') : b === 'akhir' ? (c === 'hasil' ? viewDiagResult('b') : viewDiag('b')) : viewDiag('a');
      case 'permainan': return viewGames();
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
      case 'ortu': return b === 'laporan' ? viewParentReport(c) : b === 'anak' ? viewParentHome() : b === 'daftar' ? viewParentRegister() : viewParentEnter();
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
    if (act === 'gstart') return startGame();
    if (act === 'dage') return diagStart(+el.dataset.a, el.dataset.pf);
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
    if (act === 'dskip') { sessionStorage.setItem('metiq_diag_skip', session.get().id); return go('#/belajar'); }
    if (act === 'anim') { const box = el.closest('.explain').querySelector('.anim-inline'); el.remove(); return window.METIQ_ANIM.mount(box, el.dataset.u); }
    if (act === 'fbedit') { ss.set('fbedit', el.dataset.k); return route(); }
    if (act === 'export') return exportResearch(el.dataset.t);
    if (act === 'vizm') { ss.set('vizm', el.dataset.m); return route(); }
    if (act === 'vizdb') { ss.set('vizdb', el.dataset.c); return route(); }
    if (act === 'openkid') { e.preventDefault(); const x = session.get(); x.classId = el.dataset.id; session.set(x); return go('#/guru/siswa/' + el.dataset.s); }
    if (act === 'openclass') { const s = session.get(); s.classId = el.dataset.id; session.set(s); return go('#/guru/ringkasan'); }
    if (act === 'dtab') {
      ss.set('dtab', el.dataset.t);
      document.querySelectorAll('.dtabs button').forEach((b) => b.classList.toggle('on', b === el));
      document.querySelectorAll('.dpanel').forEach((p) => { p.hidden = p.dataset.p !== el.dataset.t; });
      return;
    }
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
      document.getElementById('indisp').innerHTML = P.input || '&nbsp;';
    } else if (act === 'submit') submit(P.input);
    else if (act === 'choose') submit(P.q.options[+el.dataset.i]);
    else if (act === 'next') nextQ();
    else if (act === 'again') { P.score = 0; nextQ(); }
    else if (act === 'say') speak(P.q.speak || P.q.text);
    else if (act === 'pickav') saveAvatar(el.dataset.t, el.dataset.a);
    else if (act === 'mgo') { const sec = document.getElementById('ms-' + el.dataset.i); if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (act === 'printmanual') { document.body.classList.add('pm'); window.print(); setTimeout(() => document.body.classList.remove('pm'), 500); }
    else if (act === 'reportdone') { el.disabled = true; markDone(el.dataset.a, el.dataset.s, 'ortu').then(() => { toast('Terkirim ke guru ✔'); return cloudOn() ? ensure(true) : true; }).then(route); }
    else if (act === 'sound') { const on = window.SFX.toggle(); el.textContent = on ? '🔔' : '🔕'; toast(on ? 'Suara dinyalakan' : 'Suara dimatikan'); }
    else if (act === 'lexnew') { const box = document.getElementById('lex-' + el.dataset.i); if (box) box.innerHTML = lessonExample(el.dataset.sk); }
    else if (act === 'lgo') { const sec = document.getElementById('lp-' + el.dataset.i); if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (act === 'back') { if (history.length > 1) history.back(); else go('#/'); }
    else if (act === 'lsay') {
      const les = LESSONS[location.hash.split('/')[2]], i = +el.dataset.i;
      if (les) speak(i < 0 ? les.intro : `${les.parts[i].t}. ${les.parts[i].steps.join(' ')}`);
    }
    else if (act === 'pickkid') { session.set({ role: 'siswa', id: el.dataset.id, code: el.dataset.code, demo: session.get().demo || undefined }); go('#/belajar'); }
    else if (act === 'trydemo') startDemo(el.dataset.r);
    else if (act === 'askid') {
      const ses = session.get(), k = S.student(el.dataset.id), c = k && S.cls(k.classId);
      if (!k || !c) return;
      session.set({ role: 'siswa', id: k.id, code: c.code, back: { role: 'ortu', ptoken: ses.ptoken, pid: ses.pid } });
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
    if (el.dataset.act === 'switchclass') { const s = session.get(); s.classId = el.value; session.set(s); route(); }
    if (el.dataset.act === 'rfrom' || el.dataset.act === 'rto') { const r = ss.get('range', { preset: 'custom' }); r.preset = 'custom'; r[el.dataset.act === 'rfrom' ? 'from' : 'to'] = el.value; if (r.from && r.to && r.from > r.to) [r.from, r.to] = [r.to, r.from]; ss.set('range', r); route(); }
    if (el.dataset.act === 'logf') { const f = ss.get('logf', { sid: '', skill: '', res: '' }); f[el.dataset.k] = el.value; ss.set('logf', f); ss.set('loglim', 50); route(); }
    if (el.dataset.act === 'import' && el.files[0]) { el.files[0].text().then((t) => { try { S.importJSON(t); toast('Data berhasil digabungkan ✔'); route(); } catch (err) { toast('File tidak valid'); } }); }
  });
  document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.unit[data-unit]') && e.target.open) sessionStorage.setItem('metiq_open', e.target.dataset.unit); }, true);
  document.addEventListener('keydown', (e) => {
    if (!P || !document.getElementById('pq') || e.target.tagName === 'INPUT') return;
    if (P.q && P.q.type === 'input' && !P.locked) {
      const extra = { ',': ',', '.': ',', '-': '−', '/': '/' }; if (/^[0-9]$/.test(e.key) && P.input.length < 12) P.input += e.key; else if (extra[e.key] && (P.q.keys || []).includes(extra[e.key])) P.input += extra[e.key]; else if (e.key === 'Backspace') P.input = P.input.slice(0, -1); else if (e.key === 'Enter') return submit(P.input); else return;
      document.getElementById('indisp').innerHTML = P.input || '&nbsp;';
    } else if (e.key === 'Enter' && document.querySelector('[data-act="next"]')) nextQ();
  });
  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, fd = new FormData(f), kind = f.dataset.form;
    // kode coba 1234 membuka data contoh (mode server maupun lokal)
    if ((kind === 'classcode' || kind === 'parentcode') && String(fd.get('code')).trim() === TRY_CODE) return startDemo(kind === 'classcode' ? 'siswa' : 'ortu');
    if (kind === 'fb') {
      const rating = +fd.get('rating'), comment = String(fd.get('comment') || '').trim(), { a, s: sid, by } = f.dataset;
      if (!rating) return toast('Pilih bintangnya dulu ya ⭐');
      const finish = () => { S.addFeedback(a, sid, by, rating, comment); ss.set('fbedit', ''); toast('Terima kasih atas ulasannya! 🙏'); route(); };
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
    if (kind === 'classcode') { const c = S.classByCode(fd.get('code')); if (!c) return toast('Kode kelas tidak ditemukan'); go('#/siswa/' + c.code); }
    if (kind === 'parentcode') { const k = S.studentByParentCode(fd.get('code')); if (!k) return toast('Kode tidak ditemukan. Periksa lagi ya.'); session.set({ role: 'ortu', id: k.id }); go('#/ortu/laporan'); }
    if (kind === 'register') { const t = S.createTeacher(fd.get('name'), fd.get('pin')); const c = S.createClass(t.id, fd.get('cls')); session.set({ role: 'guru', id: t.id, classId: c.id }); go('#/guru/kelola'); }
    if (kind === 'login') { const t = S.loginTeacher(fd.get('id'), fd.get('pin')); if (!t) return toast('PIN salah'); session.set({ role: 'guru', id: t.id }); go('#/guru/ringkasan'); }
    const ctx = teacherCtx();
    if (!ctx) return;
    if (kind === 'addkid') { String(fd.get('name')).split(',').map((x) => x.trim()).filter(Boolean).forEach((n) => S.addStudent(ctx.c.id, n)); route(); }
    if (kind === 'renameclass') { S.renameClass(ctx.c.id, fd.get('name')); route(); }
    if (kind === 'newclass') { const c = S.createClass(ctx.t.id, fd.get('name')); const s = session.get(); s.classId = c.id; session.set(s); route(); }
    if (kind === 'assign') { const sk = fd.getAll('sk'), sids = fd.get('target') === 'some' ? fd.getAll('sid') : []; if (!sk.length) return toast('Pilih minimal satu keterampilan'); if (fd.get('target') === 'some' && !sids.length) return toast('Pilih minimal satu siswa'); S.addAssignment(ctx.c.id, sk, fd.get('note'), fd.get('due'), sids); ss.set('asgFor', ''); ss.set('asgSkill', ''); toast('Tugas disimpan ✔'); route(); }
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
      if (kind === 'plogin' || kind === 'pregister') {
        const r = kind === 'pregister'
          ? await Cloud.rpc('parent_register', { p_name: fd.get('name'), p_email: fd.get('email'), p_password: fd.get('pass') })
          : await Cloud.rpc('parent_login', { p_email: fd.get('email'), p_password: fd.get('pass') });
        if (r.error) { done(); return toast(r.error); }
        session.set({ role: 'ortu', ptoken: r.token, pid: r.parentId });
        return go('#/ortu/anak');
      }
      if (kind === 'plink') {
        const r = await Cloud.rpc('parent_link', { p_token: session.get().ptoken, p_parent_code: String(fd.get('code')).trim().toUpperCase() });
        await ensure(true); toast(`${esc(r.name)} ditambahkan ✔`); return route();
      }
      if (kind === 'register' || kind === 'login') {
        const r = kind === 'register'
          ? await Cloud.rpc('teacher_register', { p_name: fd.get('name'), p_email: fd.get('email'), p_password: fd.get('pass'), p_class_name: fd.get('cls'), p_admin_code: String(fd.get('admin') || '').trim() || null })
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
