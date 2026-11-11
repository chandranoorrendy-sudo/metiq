/* Metiq — Sesi kelas: tugas langsung dan ujian.
 * Guru menyiapkan soal (dibuat Metiq dari bab yang dipilih, atau ditulis sendiri), lalu memulai sesi.
 * Siswa di kelas itu melihat pemberitahuan di laptop, tablet, atau HP, mengerjakan dengan kertas coret, lalu mengumpulkan.
 * Hasil masuk ke dasbor guru beberapa detik kemudian. Perangkat tidak wajib: soal bisa dicetak, lalu guru menandai
 * benar/salah setiap soal dari kertas siswa supaya hasil kelas tetap lengkap.
 * Tugas: setiap soal langsung diperiksa dan dijelaskan. Ujian: tanpa umpan balik, ada batas waktu, kunci jawaban tidak
 * dikirim ke perangkat siswa (dinilai di server), nilai dibagikan saat guru memilihnya.
 * Mode server memakai supabase/029_sesi_kelas.sql. Mode lokal dan mode coba menyimpan di perangkat (metiq_live).
 */
(function () {
  let D = null; // dependensi dari app.js: lihat init()
  const LSK = 'metiq_live';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const strip = (h) => String(h ?? '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  const norm = (x) => strip(x).toLowerCase().replace(/[−–]/g, '-').replace(/[.\s]/g, '').replace(/^rp/, '');
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rid = () => Math.random().toString(36).slice(2, 8);
  const sfx = () => window.SFX || { correct() {}, wrong() {}, step() {} };
  const KIND = { tugas: ['📲', 'Tugas langsung'], ujian: ['📝', 'Ujian'] };
  const fmtDate = (ms) => (ms ? new Date(ms).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
  const isNum = (s) => /^[−\-\d.,/: ]+$/.test(strip(s));

  /* ---------- Data: server (Supabase) atau perangkat ---------- */
  const cloud = () => D.cloudOn();
  const ses = () => D.session.get();
  const local = {
    load() { try { return JSON.parse(localStorage.getItem(LSK)) || { sessions: [], rows: {} }; } catch (e) { return { sessions: [], rows: {} }; } },
    save(db) { try { localStorage.setItem(LSK, JSON.stringify(db)); } catch (e) { /* penuh */ } },
  };
  const scoreOf = (a) => Object.values(a || {}).filter((v) => v.ok).length;
  const pub = (s, hide) => Object.assign({}, s, { questions: hide ? s.questions.map((q) => { const x = Object.assign({}, q); delete x.answer; delete x.explain; delete x.meta; return x; }) : s.questions });
  const grade = (q, given) => (q.type === 'choice' ? String(given) === String(q.answer) : norm(given) === norm(q.answer));
  function kidClass(sid) { const k = D.S.student(sid); return k ? k.classId : null; }

  const Live = {
    async list(classId) {
      if (cloud()) return D.Cloud.rpc('sesi_list', { p_token: ses().token, p_class_id: classId });
      const db = local.load();
      return db.sessions.filter((s) => s.classId === classId).sort((a, b) => b.createdAt - a.createdAt).map((s) => {
        const rows = Object.values(db.rows[s.id] || {}), sub = rows.filter((r) => r.submittedAt);
        return Object.assign({}, s, { n: s.questions.length, joined: rows.length, submitted: sub.length, avg: sub.length ? Math.round(sub.reduce((t, r) => t + (r.score * 100) / s.questions.length, 0) / sub.length) : null });
      });
    },
    async get(id) {
      if (cloud()) return D.Cloud.rpc('sesi_get', { p_token: ses().token, p_id: id });
      const db = local.load(), s = db.sessions.find((x) => x.id === id);
      if (!s) throw Object.assign(new Error('Sesi tidak ditemukan'), { status: 404 });
      return { session: s, rows: Object.values(db.rows[id] || {}), now: Date.now() };
    },
    async save(classId, id, kind, title, questions, settings) {
      if (cloud()) return D.Cloud.rpc('sesi_save', { p_token: ses().token, p_class_id: classId, p_id: id || '', p_kind: kind, p_title: title, p_questions: questions, p_settings: settings });
      const db = local.load(); let s = id && db.sessions.find((x) => x.id === id);
      if (s && s.status !== 'draft') throw new Error('Sesi yang sudah dimulai tidak bisa diubah');
      if (!s) { s = { id: 's' + Date.now().toString(36) + rid(), classId, status: 'draft', reveal: false, createdAt: Date.now() }; db.sessions.push(s); }
      Object.assign(s, { kind, title, questions, settings });
      local.save(db); return s.id;
    },
    async start(id) {
      if (cloud()) return D.Cloud.rpc('sesi_start', { p_token: ses().token, p_id: id });
      const db = local.load(), s = db.sessions.find((x) => x.id === id);
      db.sessions.filter((x) => x.classId === s.classId && x.status === 'live').forEach((x) => { x.status = 'closed'; x.endedAt = Date.now(); Object.values(db.rows[x.id] || {}).forEach((r) => { r.submittedAt = r.submittedAt || Date.now(); }); });
      s.status = 'live'; s.startedAt = Date.now(); local.save(db);
    },
    async end(id, reveal) {
      if (cloud()) return D.Cloud.rpc('sesi_end', { p_token: ses().token, p_id: id, p_reveal: !!reveal });
      const db = local.load(), s = db.sessions.find((x) => x.id === id);
      if (s.status === 'live') s.status = 'closed'; s.endedAt = s.endedAt || Date.now(); s.reveal = !!reveal;
      Object.values(db.rows[id] || {}).forEach((r) => { if (!r.paper) r.submittedAt = r.submittedAt || Date.now(); });
      local.save(db);
    },
    async del(id) {
      if (cloud()) return D.Cloud.rpc('sesi_delete', { p_token: ses().token, p_id: id });
      const db = local.load(); db.sessions = db.sessions.filter((x) => x.id !== id); delete db.rows[id]; local.save(db);
    },
    async paper(id, sid, marks) {
      if (cloud()) return D.Cloud.rpc('sesi_paper', { p_token: ses().token, p_id: id, p_student_id: sid, p_marks: marks });
      const db = local.load(), rows = db.rows[id] = db.rows[id] || {};
      if (!marks || !Object.keys(marks).length) { if (rows[sid] && rows[sid].paper) delete rows[sid]; local.save(db); return; }
      const answers = Object.fromEntries(Object.entries(marks).map(([k, v]) => [k, { ok: !!v, paper: true }]));
      rows[sid] = { sid, answers, paper: true, score: scoreOf(answers), startedAt: (rows[sid] || {}).startedAt || Date.now(), submittedAt: Date.now() };
      local.save(db);
    },
    /* siswa */
    async state() {
      const x = ses();
      if (cloud()) return D.Cloud.rpc('student_sesi', { p_code: x.code, p_student_id: x.id });
      const db = local.load(), cid = kidClass(x.id), live = db.sessions.find((s) => s.classId === cid && s.status === 'live');
      if (live) return { live: pub(live, live.kind === 'ujian'), mine: (db.rows[live.id] || {})[x.id] || null, now: Date.now() };
      const rev = db.sessions.filter((s) => s.classId === cid && s.status === 'closed' && s.reveal && Date.now() - s.endedAt < 864e5 && (db.rows[s.id] || {})[x.id] && !(db.rows[s.id] || {})[x.id].paper).sort((a, b) => b.endedAt - a.endedAt)[0];
      return rev ? { live: null, review: rev, mine: db.rows[rev.id][x.id], now: Date.now() } : { live: null, now: Date.now() };
    },
    async join(sesId) {
      const x = ses();
      if (cloud()) return D.Cloud.rpc('student_sesi_join', { p_code: x.code, p_student_id: x.id, p_session: sesId });
      const db = local.load(), rows = db.rows[sesId] = db.rows[sesId] || {};
      if (!rows[x.id]) rows[x.id] = { sid: x.id, answers: {}, paper: false, score: 0, startedAt: Date.now(), submittedAt: null };
      local.save(db); return rows[x.id];
    },
    async answer(sesId, qid, given, ms) {
      const x = ses();
      if (cloud()) return D.Cloud.rpc('student_sesi_answer', { p_code: x.code, p_student_id: x.id, p_session: sesId, p_qid: qid, p_given: given, p_ms: Math.round(ms || 0) });
      const db = local.load(), s = db.sessions.find((y) => y.id === sesId);
      if (!s || s.status !== 'live') throw Object.assign(new Error('Sesi sudah selesai'), { status: 400 });
      const rows = db.rows[sesId] = db.rows[sesId] || {}, r = rows[x.id] = rows[x.id] || { sid: x.id, answers: {}, paper: false, score: 0, startedAt: Date.now(), submittedAt: null };
      if (r.submittedAt) throw Object.assign(new Error('Jawaban sudah dikumpulkan'), { status: 400 });
      if (s.kind === 'tugas' && r.answers[qid]) return { ok: r.answers[qid].ok };
      const q = s.questions.find((y) => y.id === qid), ok = grade(q, given);
      r.answers[qid] = { given: String(given).slice(0, 80), ok, ms: Math.round(ms || 0), ts: Date.now() }; r.score = scoreOf(r.answers);
      local.save(db); return { ok: s.kind === 'tugas' ? ok : null };
    },
    async submit(sesId) {
      const x = ses();
      if (cloud()) return D.Cloud.rpc('student_sesi_submit', { p_code: x.code, p_student_id: x.id, p_session: sesId });
      const db = local.load(), s = db.sessions.find((y) => y.id === sesId), r = (db.rows[sesId] || {})[x.id];
      if (r) r.submittedAt = r.submittedAt || Date.now(); local.save(db);
      return { score: s.kind === 'tugas' || s.reveal ? (r ? r.score : 0) : null, total: s.questions.length };
    },
  };
  // SQL 029 belum dijalankan di server
  const missing = (e) => e && (e.status === 404 || /could not find the function|schema cache/i.test(e.message || ''));
  const errMsg = (e) => (missing(e) ? 'Fitur sesi kelas belum aktif di server. Jalankan supabase/029_sesi_kelas.sql di Supabase.' : e && e.status ? e.message : 'Tidak bisa terhubung ke server');

  /* ---------- Soal dari pembuat soal Metiq ---------- */
  function freeze(q, sid) {
    const o = { id: 'q' + rid(), type: q.type === 'choice' && q.options ? 'choice' : 'input', text: q.text, answer: String(q.answer), skill: sid };
    if (q.vis) o.vis = q.vis; if (q.options && o.type === 'choice') o.options = q.options.map(String);
    if (q.explain) o.explain = q.explain; if (q.unit) o.unit = q.unit; if (q.keys) o.keys = q.keys; if (q.meta) o.meta = q.meta;
    return o;
  }
  function genOne(sid, avoid) {
    const sk = D.SKILLS[sid]; if (!sk) return null;
    for (let i = 0; i < 6; i++) {
      try { const q = sk.gen(); if (q && q.text && !(avoid && avoid.has(strip(q.text + (q.vis || ''))))) return freeze(q, sid); } catch (e) { /* lewati */ }
    }
    return null;
  }
  // n soal dibagi rata ke keterampilan yang dipilih, tanpa soal yang sama persis
  function genSet(skillIds, n, existing = []) {
    const avoid = new Set(existing.map((q) => strip(q.text + (q.vis || '')))), out = [], ids = skillIds.filter((s) => D.SKILLS[s]);
    if (!ids.length) return out;
    const order = shuffle(ids.slice());
    for (let i = 0; out.length < n && i < n * 3; i++) {
      const q = genOne(order[i % order.length], avoid); if (q) { avoid.add(strip(q.text + (q.vis || ''))); out.push(q); }
    }
    return out;
  }

  /* ---------- Tampilan soal ---------- */
  const ansText = (q) => `${q.unit === 'Rp' && !/^Rp/.test(q.answer) ? 'Rp' : ''}${q.answer}${q.unit && q.unit !== 'Rp' ? ' ' + q.unit : ''}`;
  const LET = 'ABCDEFGH';
  function qPreview(q, i, opt = {}) {
    return `<div class="ss-qp"><span class="ss-qn">${i + 1}</span><div class="grow"><div class="ss-qt">${q.text}</div>${q.vis && !opt.novis ? `<div class="qvis ss-qv">${q.vis}</div>` : ''}
      ${q.options ? `<div class="ss-qo">${q.options.map((o, k) => `<span class="${opt.key && o === q.answer ? 'ok' : ''}">${LET[k]}. ${o}</span>`).join('')}</div>` : ''}
      ${opt.key ? `<p class="ss-qa">Kunci: <b>${q.type === 'choice' ? LET[q.options.indexOf(q.answer)] + '. ' : ''}${ansText(q)}</b>${q.skill && D.SKILLS[q.skill] ? ` <small class="muted">· ${esc(D.SKILLS[q.skill].code)}</small>` : q.custom ? ' <small class="muted">· ✍️ soal guru</small>' : ''}</p>` : ''}</div>${opt.tools || ''}</div>`;
  }

  /* ---------- Guru: daftar sesi ---------- */
  const T = { box: null, timer: null };
  const stopPoll = () => { clearTimeout(T.timer); T.timer = null; };
  function teacherPage(box, ctx, arg) {
    stopPoll(); T.box = box;
    if (!arg) return listPage(box, ctx);
    if (arg === 'baru-tugas' || arg === 'baru-ujian') return builder(box, ctx, { kind: arg.slice(5) });
    if (arg.startsWith('ubah-')) return builder(box, ctx, { id: arg.slice(5) });
    if (arg.startsWith('ulang-')) return builder(box, ctx, { copy: arg.slice(6) });
    if (arg.startsWith('cetak-')) return printPage(box, ctx, arg.slice(6));
    return monitor(box, ctx, arg, {});
  }
  async function listPage(box, ctx) {
    box.innerHTML = `<section class="card ss-hero"><h2>🎯 Tugas dan ujian di kelas</h2>
        <p>Setelah menjelaskan materi, kirim soal ke laptop, tablet, atau HP siswa. Hasilnya muncul di sini beberapa detik setelah siswa menjawab. Tidak ada perangkat? Cetak soalnya, lalu tandai hasil kertas siswa di sini.</p>
        <div class="ss-new"><a class="ss-newbtn t" href="#/guru/sesi/baru-tugas"><b>📲 Tugas langsung</b><small>Siswa langsung tahu benar atau salah, dengan penjelasan. Cocok setelah menjelaskan materi.</small></a>
          <a class="ss-newbtn u" href="#/guru/sesi/baru-ujian"><b>📝 Ujian</b><small>Tanpa umpan balik, bisa diberi batas waktu. Nilai dibagikan saat Ibu/Bapak memilih.</small></a></div>
        <p class="small muted">Siswa membuka Metiq dan masuk dengan kode kelas <b class="code">${esc(ctx.c.code)}</b>. Saat sesi dimulai, pemberitahuan muncul di layar mereka.</p></section>
      <div id="ss-list">${D.loadingHTML}</div>`;
    let rows;
    try { rows = await Live.list(ctx.c.id); } catch (e) { box.querySelector('#ss-list').innerHTML = `<section class="card"><p>${esc(errMsg(e))}</p></section>`; return; }
    if (!box.isConnected) return;
    const live = rows.filter((r) => r.status === 'live'), draft = rows.filter((r) => r.status === 'draft'), past = rows.filter((r) => r.status === 'closed');
    const row = (r) => `<a class="ss-row ${r.status}" href="#/guru/sesi/${r.id}"><span class="ss-ic">${KIND[r.kind][0]}</span><span class="grow"><b>${esc(r.title)}</b>
        <small>${KIND[r.kind][1]} · ${r.n} soal${r.settings && r.settings.minutes ? ` · ${r.settings.minutes} menit` : ''}${r.status === 'draft' ? ' · draf' : ` · ${fmtDate(r.startedAt)}`}</small></span>
        ${r.status === 'live' ? `<span class="pill ss-live">● Berjalan · ${r.submitted}/${r.joined}</span>` : r.status === 'closed' ? `<span class="ss-avg">${r.avg == null ? '–' : r.avg}<small>rata-rata</small></span>` : '<span class="pill">Draf</span>'}</a>`;
    box.querySelector('#ss-list').innerHTML = `${live.length ? `<section class="card"><h2>● Sedang berjalan</h2>${live.map(row).join('')}</section>` : ''}
      ${draft.length ? `<section class="card"><h2>📄 Siap dimulai</h2>${draft.map(row).join('')}</section>` : ''}
      ${past.length ? `<section class="card"><h2>📊 Hasil sebelumnya</h2>${past.map(row).join('')}</section>` : ''}
      ${rows.length ? '' : '<section class="card center"><div class="bigemoji">📋</div><p class="muted">Belum ada tugas atau ujian. Mulai dengan salah satu tombol di atas.</p></section>'}`;
  }

  /* ---------- Guru: menyusun soal ---------- */
  let B = null;
  async function builder(box, ctx, { kind, id, copy }) {
    if (!B || (id && B.id !== id) || (!id && B.id) || (kind && B.kind !== kind) || copy || B.classId !== ctx.c.id) {
      B = { id: '', kind: kind || 'ujian', title: '', qs: [], settings: { minutes: kind === 'ujian' ? 30 : 0, shuffle: false }, grade: D.getGrade(), unit: '', skills: null, count: 10, classId: ctx.c.id, form: { type: 'input' } };
      const src = id || copy;
      if (src) {
        box.innerHTML = D.loadingHTML;
        try {
          const r = await Live.get(src), s = r.session;
          Object.assign(B, { id: id ? s.id : '', kind: s.kind, title: copy ? s.title + ' (ulang)' : s.title, qs: s.questions.map((q) => Object.assign({}, q, copy ? { id: 'q' + rid() } : {})), settings: Object.assign({ minutes: 0, shuffle: false }, s.settings) });
          if (id && s.status !== 'draft') { D.toast('Sesi yang sudah dimulai tidak bisa diubah'); return D.go('#/guru/sesi/' + id); }
        } catch (e) { box.innerHTML = `<section class="card"><p>${esc(errMsg(e))}</p></section>`; return; }
      }
    }
    if (!box.isConnected) return;
    drawBuilder(box, ctx);
    if (!box.dataset.bound) { box.dataset.bound = 1; box.addEventListener('click', (e) => builderClick(e, box, ctx)); box.addEventListener('change', (e) => builderChange(e, box, ctx)); box.addEventListener('input', (e) => builderInput(e)); }
  }
  function drawBuilder(box, ctx) {
    const units = D.unitsOf(B.grade), u = units.find((x) => x.id === B.unit) || units[0];
    if (u) { B.unit = u.id; if (!B.skills || !B.skills.every((s) => u.skills.some((k) => k.id === s))) B.skills = u.skills.map((k) => k.id).filter((s) => D.SKILLS[s]); }
    const f = B.form;
    box.innerHTML = `<button class="back link" data-ss="back">← Daftar tugas dan ujian</button>
      <section class="card ss-b1"><div class="ss-kinds">${Object.entries(KIND).map(([k, [e, l]]) => `<button data-ss="kind" data-k="${k}" class="${B.kind === k ? 'on' : ''}">${e} ${l}</button>`).join('')}</div>
        <label class="ss-lbl">Judul<input data-ss="title" value="${esc(B.title)}" maxlength="120" placeholder="${B.kind === 'ujian' ? 'mis. Ulangan Harian Perkalian' : 'mis. Latihan setelah materi pecahan'}"></label>
        ${B.kind === 'ujian' ? `<div class="ss-sets"><label>Batas waktu <select data-ss="minutes">${[0, 10, 15, 20, 30, 40, 45, 60, 90, 120].map((m) => `<option value="${m}" ${+B.settings.minutes === m ? 'selected' : ''}>${m ? m + ' menit' : 'Tanpa batas'}</option>`).join('')}</select></label>
          <label class="ss-chk"><input type="checkbox" data-ss="shuffle" ${B.settings.shuffle ? 'checked' : ''}> Urutan soal diacak untuk setiap siswa</label></div>` : '<p class="small muted">Setiap jawaban langsung diperiksa, lalu siswa melihat penjelasannya. Satu kesempatan per soal.</p>'}</section>
      <div class="ss-cols"><div>
        <section class="card"><h2>✨ Metiq buatkan soal</h2>
          <div class="ss-gen"><label>Kelas<select data-ss="grade">${D.GRADES.map((g) => `<option value="${g.id}" ${g.id === B.grade ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
            <label>Bab<select data-ss="unit">${units.map((x) => `<option value="${x.id}" ${x.id === B.unit ? 'selected' : ''}>${x.icon} ${esc(x.id)}. ${esc(x.name)}</option>`).join('')}</select></label></div>
          ${u ? `<div class="ss-sks">${u.skills.filter((k) => D.SKILLS[k.id]).map((k) => `<label class="ss-chk"><input type="checkbox" data-ss="skill" value="${k.id}" ${B.skills.includes(k.id) ? 'checked' : ''}> <b>${esc(k.code)}</b> ${esc(k.name)}</label>`).join('')}</div>` : ''}
          <div class="ss-genrow"><select data-ss="count">${[3, 5, 10, 15, 20, 25].map((n) => `<option value="${n}" ${n === B.count ? 'selected' : ''}>${n} soal</option>`).join('')}</select><button class="btn sm" data-ss="gen">➕ Tambahkan soal</button></div></section>
        <section class="card"><h2>✍️ Tulis soal sendiri</h2>
          <label class="ss-lbl">Soal<textarea data-ss="ftext" rows="3" maxlength="600" placeholder="mis. Ibu membeli 3 kantong jeruk. Setiap kantong berisi 12 jeruk. Berapa jeruk semuanya?">${esc(f.text || '')}</textarea></label>
          <div class="ss-kinds sm"><button data-ss="ftype" data-t="input" class="${f.type === 'input' ? 'on' : ''}">🔢 Isian angka</button><button data-ss="ftype" data-t="choice" class="${f.type === 'choice' ? 'on' : ''}">🔘 Pilihan ganda</button></div>
          ${f.type === 'input' ? `<div class="ss-gen"><label>Kunci jawaban<input data-ss="fans" value="${esc(f.ans || '')}" maxlength="40" placeholder="mis. 36 atau 3/4 atau 2,5"></label><label>Satuan (boleh kosong)<input data-ss="funit" value="${esc(f.unit || '')}" maxlength="12" placeholder="mis. cm, kg, Rp"></label></div>`
    : `<div class="ss-mc">${[0, 1, 2, 3].map((k) => `<label><input type="radio" name="ssmc" data-ss="fright" value="${k}" ${+(f.right || 0) === k ? 'checked' : ''} aria-label="Pilihan ${LET[k]} benar"> ${LET[k]}<input data-ss="fopt" data-k="${k}" value="${esc((f.opts || [])[k] || '')}" maxlength="80" placeholder="Pilihan ${LET[k]}"></label>`).join('')}<small class="muted">Tandai bulatan di pilihan yang benar. Pilihan C dan D boleh kosong.</small></div>`}
          <label class="ss-lbl">Penjelasan (boleh kosong, tampil di tugas dan saat nilai dibagikan)<textarea data-ss="fexp" rows="2" maxlength="600">${esc(f.exp || '')}</textarea></label>
          <button class="btn sm" data-ss="fadd">${f.editing ? '💾 Simpan perubahan' : '➕ Tambahkan soal ini'}</button></section>
      </div><div>
        <section class="card ss-qlist"><div class="rhead"><h2>📋 Soal (${B.qs.length})</h2><span class="grow"></span>${B.qs.length ? '<button class="btn ghost sm" data-ss="clear">Kosongkan</button>' : ''}</div>
          ${B.qs.length ? B.qs.map((q, i) => qPreview(q, i, { key: true, tools: `<span class="ss-tools"><button data-ss="up" data-i="${i}" aria-label="Naikkan" ${i ? '' : 'disabled'}>↑</button><button data-ss="down" data-i="${i}" aria-label="Turunkan" ${i < B.qs.length - 1 ? '' : 'disabled'}>↓</button>${q.custom ? `<button data-ss="edit" data-i="${i}" aria-label="Ubah">✏️</button>` : `<button data-ss="regen" data-i="${i}" aria-label="Ganti dengan soal lain">🔄</button>`}<button data-ss="del" data-i="${i}" aria-label="Hapus">🗑️</button></span>` })).join('')
    : '<p class="muted center">Belum ada soal. Tambahkan dari kiri: biarkan Metiq membuatkan, atau tulis sendiri.</p>'}
        </section></div></div>
      <div class="ss-bfoot"><span class="grow">${B.qs.length} soal${B.kind === 'ujian' && B.settings.minutes ? ` · ${B.settings.minutes} menit` : ''}</span>
        <button class="btn ghost" data-ss="bsave" ${B.qs.length ? '' : 'disabled'}>💾 Simpan</button><button class="btn" data-ss="bstart" ${B.qs.length ? '' : 'disabled'}>▶ Simpan dan mulai</button></div>`;
  }
  function builderInput(e) {
    const k = e.target.dataset.ss; if (!B || !k) return;
    if (k === 'title') B.title = e.target.value;
    if (k === 'ftext') B.form.text = e.target.value;
    if (k === 'fans') B.form.ans = e.target.value;
    if (k === 'funit') B.form.unit = e.target.value;
    if (k === 'fexp') B.form.exp = e.target.value;
    if (k === 'fopt') { B.form.opts = B.form.opts || []; B.form.opts[+e.target.dataset.k] = e.target.value; }
  }
  function builderChange(e, box, ctx) {
    const k = e.target.dataset.ss; if (!B || !k) return;
    if (k === 'grade') { B.grade = +e.target.value; B.unit = ''; B.skills = null; return drawBuilder(box, ctx); }
    if (k === 'unit') { B.unit = e.target.value; B.skills = null; return drawBuilder(box, ctx); }
    if (k === 'skill') { B.skills = [...box.querySelectorAll('[data-ss=skill]:checked')].map((x) => x.value); return; }
    if (k === 'count') B.count = +e.target.value;
    if (k === 'minutes') { B.settings.minutes = +e.target.value; return drawBuilder(box, ctx); }
    if (k === 'shuffle') B.settings.shuffle = e.target.checked;
    if (k === 'fright') B.form.right = +e.target.value;
  }
  const textHTML = (s) => esc(s.trim()).replace(/\n/g, '<br>');
  async function builderClick(e, box, ctx) {
    const b = e.target.closest('[data-ss]'); if (!b || !B || b.tagName === 'INPUT' || b.tagName === 'SELECT' || b.tagName === 'TEXTAREA') return;
    const k = b.dataset.ss, i = +b.dataset.i;
    if (k === 'back') return D.go('#/guru/sesi');
    if (k === 'kind') { B.kind = b.dataset.k; if (B.kind === 'ujian' && !B.settings.minutes) B.settings.minutes = 30; return drawBuilder(box, ctx); }
    if (k === 'gen') {
      if (!B.skills.length) return D.toast('Pilih minimal satu keterampilan');
      if (B.qs.length + B.count > 60) return D.toast('Paling banyak 60 soal');
      const add = genSet(B.skills, B.count, B.qs); B.qs.push(...add); D.toast(`${add.length} soal ditambahkan`); return drawBuilder(box, ctx);
    }
    if (k === 'up' || k === 'down') { const j = k === 'up' ? i - 1 : i + 1; [B.qs[i], B.qs[j]] = [B.qs[j], B.qs[i]]; return drawBuilder(box, ctx); }
    if (k === 'del') { B.qs.splice(i, 1); return drawBuilder(box, ctx); }
    if (k === 'regen') { const q = genOne(B.qs[i].skill, new Set(B.qs.map((x) => strip(x.text + (x.vis || ''))))); if (q) B.qs[i] = q; return drawBuilder(box, ctx); }
    if (k === 'clear') { if (confirm('Hapus semua soal di daftar?')) { B.qs = []; drawBuilder(box, ctx); } return; }
    if (k === 'ftype') { B.form.type = b.dataset.t; return drawBuilder(box, ctx); }
    if (k === 'edit') {
      const q = B.qs[i], raw = (h) => strip(String(h).replace(/<br>/g, '\n'));
      B.form = { editing: q.id, type: q.type, text: raw(q.text), ans: q.type === 'input' ? q.answer : '', unit: q.unit || '', exp: raw(q.explain || ''), opts: (q.options || []).map(raw), right: q.options ? q.options.indexOf(q.answer) : 0 };
      drawBuilder(box, ctx); const t = box.querySelector('[data-ss=ftext]'); if (t) { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); t.focus(); } return;
    }
    if (k === 'fadd') {
      const f = B.form, text = (f.text || '').trim();
      if (!text) return D.toast('Tulis soalnya dulu');
      let q;
      if (f.type === 'input') {
        const ans = (f.ans || '').trim().replace(/-/g, '−');
        if (!ans) return D.toast('Tulis kunci jawabannya');
        if (!isNum(ans)) return D.toast('Isian hanya untuk jawaban angka. Untuk jawaban berupa kata, pakai pilihan ganda.');
        q = { type: 'input', text: textHTML(text), answer: ans };
        if ((f.unit || '').trim()) q.unit = f.unit.trim();
      } else {
        const opts = (f.opts || []).map((o) => (o || '').trim()), right = +(f.right || 0);
        const list = opts.map((o, j) => [esc(o), j]).filter(([o]) => o);
        if (list.length < 2) return D.toast('Isi minimal dua pilihan');
        if (!opts[right]) return D.toast('Pilihan yang ditandai benar masih kosong');
        if (new Set(list.map(([o]) => o)).size !== list.length) return D.toast('Ada pilihan yang sama');
        q = { type: 'choice', text: textHTML(text), options: list.map(([o]) => o), answer: esc(opts[right]) };
      }
      if ((f.exp || '').trim()) q.explain = textHTML(f.exp);
      q.custom = true;
      const at = f.editing ? B.qs.findIndex((x) => x.id === f.editing) : -1;
      q.id = f.editing || 'q' + rid();
      if (at >= 0) B.qs[at] = q; else { if (B.qs.length >= 60) return D.toast('Paling banyak 60 soal'); B.qs.push(q); }
      B.form = { type: f.type }; D.toast(at >= 0 ? 'Soal diperbarui ✔' : 'Soal ditambahkan ✔'); return drawBuilder(box, ctx);
    }
    if (k === 'bsave' || k === 'bstart') {
      if (!B.qs.length) return;
      const title = (B.title || '').trim() || `${KIND[B.kind][1]} ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`;
      b.disabled = true;
      try {
        const settings = B.kind === 'ujian' ? { minutes: +B.settings.minutes || 0, shuffle: !!B.settings.shuffle } : {};
        const id = await Live.save(ctx.c.id, B.id, B.kind, title, B.qs, settings);
        if (k === 'bstart') { await Live.start(id); D.toast('Sesi dimulai. Siswa sudah bisa mengerjakan.'); } else D.toast('Tersimpan ✔');
        B = null; D.go('#/guru/sesi/' + id);
      } catch (er) { b.disabled = false; D.toast(esc(errMsg(er))); }
    }
  }

  /* ---------- Guru: hasil kelas (langsung diperbarui) ---------- */
  function summarize(s, rows, kids) {
    const byId = Object.fromEntries(rows.map((r) => [r.sid, r])), n = s.questions.length;
    const sub = rows.filter((r) => r.submittedAt), avg = sub.length ? Math.round(sub.reduce((t, r) => t + (r.score * 100) / n, 0) / sub.length) : null;
    const per = s.questions.map((q) => {
      const got = rows.map((r) => (r.answers || {})[q.id]).filter(Boolean), ok = got.filter((a) => a.ok).length, wrong = {};
      got.filter((a) => !a.ok && a.given != null && a.given !== '').forEach((a) => { const g = strip(a.given); wrong[g] = (wrong[g] || 0) + 1; });
      return { q, n: got.length, ok, pct: got.length ? Math.round((ok * 100) / got.length) : null, wrong: Object.entries(wrong).sort((a, b) => b[1] - a[1]).slice(0, 2) };
    });
    // siswa yang datanya ada tetapi sudah tidak di daftar kelas tetap ditampilkan
    const list = kids.map((k) => ({ k, r: byId[k.id] || null })).concat(rows.filter((r) => !kids.some((k) => k.id === r.sid)).map((r) => ({ k: { id: r.sid, name: 'Siswa lain', avatar: '' }, r })));
    return { n, sub, avg, per, list, joined: rows.filter((r) => !r.paper).length };
  }
  const M = {};
  async function monitor(box, ctx, id, opt) {
    const st = M[id] = M[id] || { hide: false, paper: null, open: -1 };
    const tv = !!opt.tv;
    if (!box.dataset.bound) { box.dataset.bound = 1; box.addEventListener('click', (e) => monitorClick(e, box, ctx, id, opt)); }
    let data;
    try { data = await Live.get(id); } catch (e) { box.innerHTML = `<section class="card"><p>${esc(errMsg(e))}</p>${tv ? '' : '<a class="btn sm ghost" href="#/guru/sesi">← Kembali</a>'}</section>`; return; }
    if (!box.isConnected) return;
    const s = data.session, sm = summarize(s, data.rows || [], ctx.kids), live = s.status === 'live';
    st.s = s; st.rows = data.rows || []; st.off = (data.now || Date.now()) - Date.now();
    const nm = (k, i) => (st.hide ? `Siswa ${i + 1}` : esc(k.name));
    const cell = (r, q) => { const a = r && (r.answers || {})[q.id]; return `<i class="${a ? (a.ok ? 'g' : 'r') : ''}${a && a.paper ? ' p' : ''}" title="${a ? (a.ok ? 'Benar' : 'Salah' + (a.given ? ': ' + esc(strip(a.given)) : '')) : 'Belum dijawab'}"></i>`; };
    const status = (r) => (!r ? '<span class="ss-st n">Belum mulai</span>' : r.paper ? '<span class="ss-st p">📝 Kertas</span>' : r.submittedAt ? '<span class="ss-st d">✅ Selesai</span>' : `<span class="ss-st w">✏️ ${Object.keys(r.answers || {}).length}/${sm.n}</span>`);
    const head = `${tv ? '' : '<button class="back link" data-sm="back">← Daftar tugas dan ujian</button>'}
      <section class="card ss-mhead"><div class="ss-mt"><span class="ss-ic">${KIND[s.kind][0]}</span><div class="grow"><small class="muted">${KIND[s.kind][1]} · ${sm.n} soal${s.settings && s.settings.minutes ? ` · ${s.settings.minutes} menit` : ''}</small><h2>${esc(s.title)}</h2></div>
        ${live ? '<span class="pill ss-live">● Berjalan</span>' : s.status === 'draft' ? '<span class="pill">Draf</span>' : `<span class="pill">Selesai ${fmtDate(s.endedAt)}</span>`}</div>
        ${s.status !== 'draft' ? `<div class="ss-tiles"><div><b>${sm.joined}<small>/${ctx.kids.length}</small></b><span>mengerjakan di perangkat</span></div><div><b>${sm.sub.length}</b><span>sudah selesai</span></div><div><b>${sm.avg == null ? '–' : sm.avg}</b><span>rata-rata nilai</span></div></div>` : ''}
        ${live ? `<p class="small ss-how">Siswa membuka Metiq, masuk dengan kode kelas <b class="code">${esc(ctx.c.code)}</b>, lalu mengetuk pemberitahuan <b>${KIND[s.kind][0]} ${KIND[s.kind][1]}</b>. Halaman ini diperbarui otomatis.</p>` : ''}
        <div class="row-btn left ss-acts">
          ${s.status === 'draft' ? `<button class="btn" data-sm="start">▶ Mulai sekarang</button>${tv ? '' : `<a class="btn ghost sm" href="#/guru/sesi/ubah-${s.id}">✏️ Ubah soal</a>`}` : ''}
          ${live ? (s.kind === 'ujian' ? '<button class="btn" data-sm="end" data-r="1">⏹ Akhiri dan bagikan nilai</button><button class="btn ghost sm" data-sm="end" data-r="0">⏹ Akhiri, nilai belum dibagikan</button>' : '<button class="btn" data-sm="end" data-r="1">⏹ Akhiri tugas</button>') : ''}
          ${s.status === 'closed' && s.kind === 'ujian' ? `<button class="btn ghost sm" data-sm="reveal">${s.reveal ? '🙈 Tarik kembali nilai dari siswa' : '📣 Bagikan nilai ke siswa'}</button>` : ''}
          <button class="btn ghost sm" data-sm="hide">${st.hide ? '👀 Tampilkan nama' : '🙈 Sembunyikan nama'}</button>
          ${tv ? '' : `<a class="btn ghost sm" href="#/guru/sesi/cetak-${s.id}">🖨️ Cetak soal</a>`}
          ${s.status !== 'draft' && !tv ? '<button class="btn ghost sm" data-sm="csv">⬇️ Unduh CSV</button>' : ''}
          ${s.status === 'closed' && !tv ? `<a class="btn ghost sm" href="#/guru/sesi/ulang-${s.id}">🔁 Pakai lagi</a>` : ''}
          ${tv ? '' : '<button class="btn ghost sm danger" data-sm="del">🗑️ Hapus</button>'}</div></section>`;
    if (s.status === 'draft') {
      box.innerHTML = head + `<section class="card"><h2>Soal</h2>${s.questions.map((q, i) => qPreview(q, i, { key: true })).join('')}</section>`;
      return;
    }
    const pq = st.paper && s.questions;
    box.innerHTML = head + `
      <section class="card"><div class="rhead"><h2>🧒 Siswa</h2><span class="grow"></span><span class="small muted">Hijau benar · merah salah · abu-abu belum</span></div>
        <div class="tscroll"><table class="tbl ss-grid"><thead><tr><th>Siswa</th><th>Keadaan</th><th>Nilai</th><th>${s.questions.map((_, i) => `<b>${i + 1}</b>`).join('')}</th>${tv ? '' : '<th></th>'}</tr></thead><tbody>
        ${sm.list.map(({ k, r }, i) => `<tr><td>${st.hide ? '' : `<span class="av sm">${k.avatar ? D.avHTML(k.avatar) : ''}</span> `}${nm(k, i)}</td><td>${status(r)}</td><td><b>${r && (r.submittedAt || r.paper) ? Math.round((r.score * 100) / sm.n) : r ? `<small class="muted">${r.score}/${sm.n}</small>` : '–'}</b></td>
          <td class="ss-cells">${s.questions.map((q) => cell(r, q)).join('')}</td>${tv ? '' : `<td>${!r || r.paper ? `<button class="btn ghost xs" data-sm="paper" data-s="${k.id}">📝 Nilai kertas</button>` : ''}</td>`}</tr>
          ${st.paper === k.id ? `<tr class="ss-paper"><td colspan="5"><b>Hasil kertas ${esc(k.name)}:</b> ketuk setiap soal sampai benar ✓ atau salah ✗.<div class="ss-marks">${pq.map((q, j) => { const v = st.marks[q.id]; return `<button data-sm="mark" data-q="${q.id}" class="${v === true ? 'g' : v === false ? 'r' : ''}">${j + 1}<small>${v === true ? '✓' : v === false ? '✗' : '–'}</small></button>`; }).join('')}</div>
            <div class="row-btn left"><button class="btn ghost xs" data-sm="allok">Semua benar</button><button class="btn sm" data-sm="psave" data-s="${k.id}">💾 Simpan</button><button class="btn ghost xs" data-sm="pclose">Batal</button>${r && r.paper ? `<button class="btn ghost xs danger" data-sm="pdel" data-s="${k.id}">Hapus hasil kertas</button>` : ''}</div></td></tr>` : ''}`).join('')}
        </tbody></table></div></section>
      <section class="card"><h2>📈 Per soal</h2><p class="small muted">Soal dengan sedikit jawaban benar layak dibahas bersama. Ketuk soal untuk melihatnya.</p>
        ${sm.per.map((p, i) => `<div class="ss-pq ${st.open === i ? 'open' : ''}"><button class="ss-pqh" data-sm="open" data-i="${i}"><span class="ss-qn">${i + 1}</span><span class="grow ss-pqt">${strip(p.q.text).slice(0, 90)}</span>
            <span class="ss-bar"><i style="width:${p.pct || 0}%" class="${p.pct == null ? '' : p.pct >= 80 ? 'g' : p.pct >= 50 ? 'y' : 'r'}"></i></span><b class="ss-pct">${p.pct == null ? '–' : p.pct + '%'}</b><small class="muted">${p.ok}/${p.n}</small></button>
          ${st.open === i ? `<div class="ss-pqb">${qPreview(p.q, i, { key: true })}${p.wrong.length ? `<p class="small">Jawaban salah yang sering: ${p.wrong.map(([g, c]) => `<b>${esc(g)}</b> (${c} siswa)`).join(', ')}</p>` : ''}${p.q.explain ? `<div class="explain">${p.q.explain}</div>` : ''}${D.kolomOf(p.q, D.SKILLS[p.q.skill])}</div>` : ''}</div>`).join('')}</section>`;
    if (live) { clearTimeout(T.timer); T.timer = setTimeout(() => { if (box.isConnected && !M[id].paper) monitor(box, ctx, id, opt); else if (box.isConnected) T.timer = setTimeout(() => monitor(box, ctx, id, opt), 4000); }, 4000); }
  }
  async function monitorClick(e, box, ctx, id, opt) {
    const b = e.target.closest('[data-sm]'); if (!b) return;
    const st = M[id], k = b.dataset.sm, redraw = () => monitor(box, ctx, id, opt);
    const run = async (p, msg) => { try { await p; if (msg) D.toast(msg); } catch (er) { D.toast(esc(errMsg(er))); } redraw(); };
    if (k === 'back') return D.go('#/guru/sesi');
    if (k === 'start') return run(Live.start(id), 'Sesi dimulai. Siswa sudah bisa mengerjakan.');
    if (k === 'end') { if (!confirm(st.s.kind === 'ujian' ? 'Akhiri ujian sekarang? Jawaban yang belum dikumpulkan ikut terkumpul.' : 'Akhiri tugas ini?')) return; return run(Live.end(id, b.dataset.r === '1'), 'Sesi diakhiri'); }
    if (k === 'reveal') return run(Live.end(id, !st.s.reveal), st.s.reveal ? 'Nilai disembunyikan dari siswa' : 'Nilai dibagikan ke siswa');
    if (k === 'hide') { st.hide = !st.hide; return redraw(); }
    if (k === 'open') { st.open = st.open === +b.dataset.i ? -1 : +b.dataset.i; return redraw(); }
    if (k === 'del') { if (!confirm(`Hapus "${st.s.title}" beserta semua jawaban siswa? Tidak bisa dibatalkan.`)) return; try { await Live.del(id); D.toast('Dihapus'); D.go('#/guru/sesi'); } catch (er) { D.toast(esc(errMsg(er))); } return; }
    if (k === 'csv') return csv(st, ctx);
    if (k === 'paper') { const r = st.rows.find((x) => x.sid === b.dataset.s); st.paper = b.dataset.s; st.marks = r && r.paper ? Object.fromEntries(Object.entries(r.answers).map(([q, a]) => [q, !!a.ok])) : {}; return redraw(); }
    if (k === 'mark') { const v = st.marks[b.dataset.q]; st.marks[b.dataset.q] = v === undefined ? true : v === true ? false : undefined; if (st.marks[b.dataset.q] === undefined) delete st.marks[b.dataset.q]; return redraw(); }
    if (k === 'allok') { st.s.questions.forEach((q) => { st.marks[q.id] = true; }); return redraw(); }
    if (k === 'pclose') { st.paper = null; return redraw(); }
    if (k === 'psave' || k === 'pdel') { const marks = k === 'pdel' ? {} : st.marks; if (k === 'psave' && !Object.keys(marks).length) return D.toast('Tandai minimal satu soal'); st.paper = null; return run(Live.paper(id, b.dataset.s, marks), k === 'pdel' ? 'Hasil kertas dihapus' : 'Hasil kertas tersimpan ✔'); }
  }
  function csv(st, ctx) {
    const s = st.s, sm = summarize(s, st.rows, ctx.kids);
    const rows = [['nama', 'cara', 'nilai', 'benar', 'jumlah_soal', 'selesai', ...s.questions.map((_, i) => 'soal_' + (i + 1))]];
    sm.list.forEach(({ k, r }) => rows.push([k.name, r ? (r.paper ? 'kertas' : 'perangkat') : '', r ? Math.round((r.score * 100) / sm.n) : '', r ? r.score : '', sm.n, r && r.submittedAt ? new Date(r.submittedAt).toISOString() : '',
      ...s.questions.map((q) => { const a = r && (r.answers || {})[q.id]; return a ? (a.ok ? 'benar' : 'salah' + (a.given ? ': ' + strip(a.given) : '')) : ''; })]));
    const body = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + body], { type: 'text/csv' }));
    a.download = `${s.kind}-${s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.csv`; document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- Guru: cetak soal (lembar siswa dan kunci) ---------- */
  async function printPage(box, ctx, id) {
    box.innerHTML = D.loadingHTML;
    let s; try { s = (await Live.get(id)).session; } catch (e) { box.innerHTML = `<section class="card"><p>${esc(errMsg(e))}</p></section>`; return; }
    if (!box.isConnected) return;
    const draw = (withKey) => {
      box.innerHTML = `<div class="ss-noprint"><button class="back link" data-sp="back">← Kembali</button>
          <section class="card"><h2>🖨️ Cetak: ${esc(s.title)}</h2><p class="small muted">Lembar soal untuk setiap siswa, dengan tempat menulis nama dan jawaban. Kunci jawaban tercetak di halaman terpisah. Setelah dinilai, tandai benar/salah tiap siswa di halaman hasil (📝 Nilai kertas) supaya nilai kelas tetap lengkap.</p>
          <label class="ss-chk"><input type="checkbox" data-sp="key" ${withKey ? 'checked' : ''}> Sertakan kunci jawaban di halaman terakhir</label>
          <div class="row-btn left"><button class="btn" data-sp="print">🖨️ Cetak atau simpan PDF</button></div></section></div>
        <article class="ss-sheet"><header><div><b>${esc(s.title)}</b><small>${KIND[s.kind][1]} · ${esc(ctx.c.name)}${s.settings && s.settings.minutes ? ` · ${s.settings.minutes} menit` : ''}</small></div>
          <div class="ss-id"><span>Nama: ____________________________</span><span>Tanggal: ______________</span><span>Nilai: ______</span></div></header>
          <ol>${s.questions.map((q) => `<li><div class="ss-qt">${q.text}</div>${q.vis ? `<div class="qvis ss-qv">${q.vis}</div>` : ''}
            ${q.options ? `<div class="ss-po">${q.options.map((o, k) => `<span><i>${LET[k]}</i> ${o}</span>`).join('')}</div>` : `<div class="ss-line">Jawaban: ________________ ${q.unit && q.unit !== 'Rp' ? esc(q.unit) : ''}</div>`}</li>`).join('')}</ol></article>
        ${withKey ? `<article class="ss-sheet ss-key"><header><div><b>Kunci jawaban: ${esc(s.title)}</b><small>Untuk guru</small></div></header>
          <ol>${s.questions.map((q) => `<li><b>${q.type === 'choice' ? LET[q.options.indexOf(q.answer)] + '. ' : ''}${ansText(q)}</b>${q.explain ? `<div class="small">${q.explain}</div>` : ''}</li>`).join('')}</ol></article>` : ''}`;
    };
    let withKey = true; draw(withKey);
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sp]'); if (!b) return;
      if (b.dataset.sp === 'back') return D.go('#/guru/sesi/' + id);
      if (b.dataset.sp === 'print') return window.print();
      if (b.dataset.sp === 'key') { withKey = b.checked; draw(withKey); }
    });
    document.body.classList.add('ss-printing');
  }

  /* ---------- Mode Mengajar: kirim tugas dari bab yang sedang diajarkan, hasilnya tampil di layar kelas ---------- */
  function quickTask(box, ctx, unit) {
    const st = { n: 5 };
    const draw = async () => {
      let rows = [];
      try { rows = await Live.list(ctx.c.id); } catch (e) { box.innerHTML = `<section class="kl-panel center"><p>${esc(errMsg(e))}</p></section>`; return; }
      if (!box.isConnected) return;
      const live = rows.find((r) => r.status === 'live');
      if (live) { box.innerHTML = '<div class="ss-tvmon"></div>'; return monitor(box.querySelector('.ss-tvmon'), ctx, live.id, { tv: true }); }
      const last = rows.find((r) => r.status === 'closed' && r.kind === 'tugas' && r.title.includes(unit.name));
      box.innerHTML = `<section class="kl-panel ss-quick"><div class="kl-say">${D.MQ ? D.MQ.svg('ask', { size: 100, enter: false }) : ''}<div class="kl-bubble"><p>Kirim soal <b>${esc(unit.name)}</b> ke laptop, tablet, atau HP siswa. Setiap siswa langsung tahu benar atau salah, dan hasilnya tampil di layar ini.</p></div></div>
        <div class="ss-qn-pick">${[3, 5, 8, 10].map((n) => `<button data-sq="n" data-n="${n}" class="${st.n === n ? 'on' : ''}">${n} soal</button>`).join('')}</div>
        <div class="kl-row"><button class="kl-btn" data-sq="send">📲 Kirim ke perangkat siswa</button></div>
        <p class="kl-hint">Siswa masuk dengan kode kelas <b>${esc(ctx.c.code)}</b>. Tidak ada perangkat? Buat ujian di dasbor (📺 Mengajar → Tugas dan ujian) lalu cetak soalnya.</p>
        ${last ? `<div class="kl-row"><button class="kl-btn ghost sm" data-sq="last" data-id="${last.id}">📊 Lihat hasil tugas sebelumnya</button></div>` : ''}</section>`;
    };
    const onClick = async (e) => {
      const b = e.target.closest('[data-sq]'); if (!b) return;
      if (b.dataset.sq === 'n') { st.n = +b.dataset.n; box.querySelectorAll('[data-sq=n]').forEach((x) => x.classList.toggle('on', x === b)); return; }
      if (b.dataset.sq === 'last') { box.innerHTML = '<div class="ss-tvmon"></div>'; return monitor(box.querySelector('.ss-tvmon'), ctx, b.dataset.id, { tv: true }); }
      if (b.dataset.sq === 'send') {
        b.disabled = true;
        try {
          const qs = genSet(unit.skills.map((k) => k.id), st.n);
          const id = await Live.save(ctx.c.id, '', 'tugas', `Tugas: ${unit.name}`, qs, {}); await Live.start(id);
          D.toast('Terkirim! Siswa bisa mulai mengerjakan.'); draw();
        } catch (er) { b.disabled = false; D.toast(esc(errMsg(er))); }
      }
    };
    box.addEventListener('click', onClick);
    draw();
    return () => { stopPoll(); box.removeEventListener('click', onClick); };
  }

  /* ---------- Siswa: pemberitahuan sesi baru ---------- */
  let W = { t: null, last: null, at: 0 };
  const kidOk = () => { const x = ses(); return x.role === 'siswa' && x.id && (cloud() ? !!x.code : !!kidClass(x.id)); };
  async function peek(force) {
    if (!kidOk() || document.hidden) return null;
    if (!force && W.last && Date.now() - W.at < 8000) return W.last;
    try { W.last = await Live.state(); W.at = Date.now(); } catch (e) { W.last = null; }
    return W.last;
  }
  function banner(st) {
    let el = document.getElementById('ss-banner');
    const onPage = /^#\/sesi/.test(location.hash);
    const live = st && st.live && !(st.mine && st.mine.submittedAt);
    const seenKey = st && st.review ? 'metiq_ss_seen_' + st.review.id : '';
    let seen = false; try { seen = seenKey && localStorage.getItem(seenKey) === '1'; } catch (e) { /* mode privat */ }
    const rev = st && st.review && !seen;
    if (onPage || !kidOk() || (!live && !rev)) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('a'); el.id = 'ss-banner'; el.className = 'ss-banner'; el.href = '#/sesi'; document.body.appendChild(el); }
    el.innerHTML = live ? `<span class="e">${KIND[st.live.kind][0]}</span><span class="grow"><b>${KIND[st.live.kind][1]} dari guru</b><small>${esc(st.live.title)}</small></span><span class="go">${st.mine ? 'Lanjutkan' : 'Mulai'} ▶</span>`
      : `<span class="e">📊</span><span class="grow"><b>Nilai ujian sudah dibagikan</b><small>${esc(st.review.title)}</small></span><span class="go">Lihat ▶</span>`;
  }
  async function tick(force) { const st = await peek(force); banner(st); }
  function startWatch() {
    if (W.t) return;
    W.t = setInterval(() => tick(true), 10000);
    addEventListener('hashchange', () => setTimeout(() => tick(false), 300));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(true); });
    setTimeout(() => tick(true), 1200);
  }

  /* ---------- Siswa: mengerjakan ---------- */
  const R = { stop: null };
  function seeded(arr, seed) {
    let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    const rnd = () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
    const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
  }
  async function studentView(root) {
    if (R.stop) R.stop();
    if (!kidOk()) return D.go('#/');
    const banner0 = document.getElementById('ss-banner'); if (banner0) banner0.remove();
    root.innerHTML = `<div class="ss-run"><div class="ss-top"><a class="mq-ico" href="#/belajar" aria-label="Keluar">✕</a><b class="grow">Tugas dan ujian</b></div><main class="ss-main" id="ssm">${D.loadingHTML}</main></div>`;
    const main = root.querySelector('#ssm');
    let st; try { st = await Live.state(); } catch (e) { main.innerHTML = `<div class="ss-empty"><p>${esc(errMsg(e))}</p></div>`; return; }
    if (!main.isConnected) return;
    W.last = st; W.at = Date.now();
    if (st.live) return runner(root, st);
    if (st.review) { try { localStorage.setItem('metiq_ss_seen_' + st.review.id, '1'); } catch (e) { /* mode privat */ } return review(root, st.review, st.mine); }
    main.innerHTML = `<div class="ss-empty">${D.MQ ? D.MQ.svg('think', { size: 140, enter: false }) : ''}<h2>Belum ada tugas dari guru</h2><p class="muted">Saat Bu/Pak Guru memulai tugas atau ujian, halaman ini terbuka sendiri.</p><a class="mq-btn ghost" href="#/belajar">Kembali belajar</a></div>`;
    const t = setInterval(async () => { if (!main.isConnected) return clearInterval(t); const s2 = await peek(true); if (s2 && s2.live) { clearInterval(t); studentView(root); } }, 6000);
    R.stop = () => clearInterval(t);
  }
  async function runner(root, st) {
    const s = st.live, main = root.querySelector('#ssm'), exam = s.kind === 'ujian', off = (st.now || Date.now()) - Date.now();
    const mine = st.mine;
    if (mine && mine.submittedAt) return done(root, s, mine, null);
    if (!mine) {
      main.innerHTML = `<div class="ss-intro">${D.MQ ? D.MQ.svg('hello', { size: 130, enter: false }) : ''}<span class="pill">${KIND[s.kind][0]} ${KIND[s.kind][1]}</span><h1>${esc(s.title)}</h1>
        <ul class="ss-facts"><li>📋 ${s.questions.length} soal</li>${exam && s.settings.minutes ? `<li>⏱️ ${s.settings.minutes} menit, mulai saat kamu menekan Mulai</li>` : ''}<li>✏️ Ada kertas coret untuk menghitung</li>
          ${exam ? '<li>🤫 Jawabanmu baru dinilai setelah dikumpulkan</li>' : '<li>✅ Setiap jawaban langsung diperiksa</li>'}</ul>
        <button class="mq-btn pulse" id="ssgo">Mulai mengerjakan</button></div>`;
      main.querySelector('#ssgo').addEventListener('click', async (e) => {
        e.target.disabled = true;
        try { const r = await Live.join(s.id); runner(root, Object.assign({}, st, { mine: r || { answers: {}, startedAt: Date.now() } })); } catch (er) { e.target.disabled = false; D.toast(esc(errMsg(er))); }
      });
      return;
    }
    // keadaan pengerjaan
    const qs = exam && s.settings.shuffle ? seeded(s.questions, ses().id + s.id) : s.questions;
    const A = {}, OK = {}; Object.entries(mine.answers || {}).forEach(([q, a]) => { A[q] = a.given; if (a.ok != null && !exam) OK[q] = a.ok; });
    let i = Math.max(0, qs.findIndex((q) => A[q.id] === undefined)); if (i < 0 || (!exam && A[qs[i].id] !== undefined)) i = 0;
    let input = '', t0 = Date.now(), timer = null, alive = true, sending = 0, failed = [];
    const host = root.querySelector('.ss-run');
    const board = window.METIQ_KELAS && window.METIQ_KELAS.makeBoard ? window.METIQ_KELAS.makeBoard(host) : null;
    const strokes = {};
    const endAt = exam && s.settings.minutes ? mine.startedAt + s.settings.minutes * 60000 : 0;
    root.querySelector('.ss-top').innerHTML = `<a class="mq-ico" href="#/belajar" aria-label="Keluar">✕</a><span class="grow ss-tt"><small>${KIND[s.kind][0]} ${KIND[s.kind][1]}</small><b>${esc(s.title)}</b></span>
      ${endAt ? '<span class="ss-clock" id="ssclock">--:--</span>' : ''}<span class="ss-sync" id="sssync" hidden>⏳</span>${board ? '<button class="ss-cbtn" id="sscoret">✏️ <span>Kertas coret</span></button>' : ''}`;
    const cb = root.querySelector('#sscoret');
    if (cb) cb.addEventListener('click', () => { if (board.isOpen()) { strokes[qs[i].id] = board.save(); board.close(); cb.classList.remove('on'); } else { board.open(true); board.load(strokes[qs[i].id] || []); cb.classList.add('on'); } });
    const syncEl = () => { const el = root.querySelector('#sssync'); if (el) { el.hidden = !failed.length && !sending; el.textContent = failed.length ? '⚠️ belum terkirim' : '⏳'; } };
    // jawaban dikirim satu per satu; yang gagal dicoba lagi
    const send = async (qid, given, ms) => {
      sending++; syncEl();
      try { const r = await Live.answer(s.id, qid, given, ms); failed = failed.filter((f) => f.qid !== qid); return r; }
      catch (e) { if (e.status) { if (/selesai|dikumpulkan|habis/.test(e.message)) { alive = false; D.toast(esc(e.message)); studentView(root); } return null; } failed = failed.filter((f) => f.qid !== qid).concat([{ qid, given, ms }]); return null; }
      finally { sending--; syncEl(); }
    };
    const retry = setInterval(() => { if (!alive) return; failed.slice().forEach((f) => send(f.qid, f.given, f.ms)); }, 5000);
    if (endAt) {
      const clk = () => {
        const left = Math.max(0, endAt - (Date.now() + off)), el = root.querySelector('#ssclock');
        if (el) { el.textContent = `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}`; el.classList.toggle('low', left < 60000); }
        if (left <= 0 && alive) { alive = false; D.toast('Waktu habis. Jawabanmu dikumpulkan.'); submit(true); }
      };
      clk(); timer = setInterval(clk, 500);
    }
    // guru mengakhiri sesi: halaman siswa ikut berhenti
    const watch = setInterval(async () => { if (!alive) return; try { const s2 = await Live.state(); if (!s2.live || s2.live.id !== s.id) { alive = false; D.toast('Guru sudah mengakhiri sesi'); studentView(root); } } catch (e) { /* offline */ } }, 12000);
    const goTo = (j) => { if (board && board.isOpen()) strokes[qs[i].id] = board.save(); i = j; input = ''; t0 = Date.now(); draw(); if (board && board.isOpen()) board.load(strokes[qs[i].id] || []); };
    function draw() {
      const q = qs[i], given = A[q.id], locked = !exam && given !== undefined, res = OK[q.id];
      if (!locked && q.type === 'input') input = given !== undefined && !input ? String(given) : input;
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ...(q.keys || [',', '/', '−']).filter((k) => !/^[0-9]$/.test(k)), '0'];
      main.innerHTML = `<div class="ss-q">
        <nav class="ss-dots">${qs.map((x, j) => `<button data-sr="go" data-j="${j}" class="${j === i ? 'on' : ''} ${A[x.id] !== undefined ? (exam ? 'a' : OK[x.id] ? 'g' : OK[x.id] === false ? 'r' : 'a') : ''}" aria-label="Soal ${j + 1}">${j + 1}</button>`).join('')}</nav>
        <section class="ss-card"><small class="muted">Soal ${i + 1} dari ${qs.length}</small><div class="ss-text">${q.text}</div>${q.vis ? `<div class="qvis">${q.vis}</div>` : ''}
          ${q.type === 'choice' ? `<div class="ss-opts ${q.options.every((o) => strip(o).length <= 5) ? 'short' : ''}">${q.options.map((o, k) => `<button data-sr="opt" data-k="${k}" class="${String(given) === String(o) ? 'sel' : ''} ${locked && String(o) === String(q.answer) ? 'right' : ''} ${locked && String(given) === String(o) && !res ? 'wrong' : ''}" ${locked ? 'disabled' : ''}>${o}</button>`).join('')}</div>`
    : `<div class="ss-inrow"><div class="ss-disp ${locked ? (res ? 'right' : 'wrong') : ''}" id="ssdisp">${(locked ? given : input) || '&nbsp;'}</div>${q.unit ? `<b>${esc(q.unit)}</b>` : ''}</div>
            ${locked ? '' : `<div class="ss-keys">${keys.map((k) => `<button data-sr="key" data-k="${k}">${k}</button>`).join('')}<button data-sr="key" data-k="del" aria-label="Hapus">⌫</button></div>`}`}
          ${locked ? `<div class="ss-fb ${res ? 'is-ok' : 'is-no'}"><b>${res ? '✅ Benar!' : `❌ Belum tepat. Jawabannya ${ansText(q)}`}</b>${!res && q.explain ? `<div>${q.explain}</div>${D.kolomOf(q, D.SKILLS[q.skill])}` : ''}</div>` : ''}
        </section>
        <div class="ss-nav">${exam && i > 0 ? '<button class="mq-btn ghost" data-sr="prev">◀ Sebelumnya</button>' : '<span></span>'}
          ${!exam && !locked ? `<button class="mq-btn" data-sr="check" ${q.type === 'choice' || input ? '' : 'disabled'}>Periksa</button>`
    : i < qs.length - 1 ? `<button class="mq-btn" data-sr="next">${exam ? 'Simpan dan lanjut' : 'Lanjut'} ▶</button>` : `<button class="mq-btn" data-sr="submit">📤 Kumpulkan</button>`}</div></div>`;
    }
    const pending = {};
    const saveExam = () => { // ujian: simpan jawaban isian soal ini sebelum pindah
      const q = qs[i]; if (q.type === 'input' && input && input !== A[q.id]) { A[q.id] = input; send(q.id, input, Date.now() - t0); }
    };
    async function check(given) {
      const q = qs[i]; if (!alive || pending[q.id]) return; pending[q.id] = 1;
      A[q.id] = given; OK[q.id] = q.answer !== undefined ? grade(q, given) : null;
      if (OK[q.id]) sfx().correct(); else sfx().wrong();
      draw(); const r = await send(q.id, given, Date.now() - t0);
      if (r && r.ok != null && r.ok !== OK[q.id]) { OK[q.id] = r.ok; draw(); }
      delete pending[q.id];
    }
    async function submit(force) {
      if (exam) saveExam();
      const left = qs.filter((q) => A[q.id] === undefined).length;
      if (!force && !confirm(left ? `Masih ada ${left} soal yang belum dijawab. Kumpulkan sekarang?` : 'Kumpulkan jawabanmu sekarang?')) { if (endAt && !alive) alive = true; return; }
      alive = false;
      main.innerHTML = D.loadingHTML;
      // tunggu jawaban yang masih terkirim
      for (let k = 0; k < 20 && (sending || failed.length); k++) { failed.slice().forEach((f) => send(f.qid, f.given, f.ms)); await new Promise((r) => setTimeout(r, 500)); }
      let r = null; try { r = await Live.submit(s.id); } catch (e) { /* tetap tampilkan */ }
      cleanup();
      done(root, s, null, r);
    }
    function onClick(e) {
      const b = e.target.closest('[data-sr]'); if (!b || !alive) return;
      const k = b.dataset.sr, q = qs[i];
      if (k === 'go') { if (exam) saveExam(); return goTo(+b.dataset.j); }
      if (k === 'prev') { saveExam(); return goTo(i - 1); }
      if (k === 'next') { if (exam) saveExam(); return goTo(i + 1); }
      if (k === 'submit') { if (!exam && A[q.id] === undefined) return; return submit(false); }
      if (k === 'opt') {
        const o = q.options[+b.dataset.k];
        if (exam) { A[q.id] = o; send(q.id, o, Date.now() - t0); sfx().step && sfx().step(); return draw(); }
        A[q.id + ':sel'] = o; main.querySelectorAll('.ss-opts button').forEach((x) => x.classList.toggle('sel', x === b)); return;
      }
      if (k === 'key') { input = b.dataset.k === 'del' ? input.slice(0, -1) : (input + b.dataset.k).slice(0, 14); const d = main.querySelector('#ssdisp'); if (d) d.innerHTML = input || '&nbsp;'; const c = main.querySelector('[data-sr=check]'); if (c) c.disabled = !input; return; }
      if (k === 'check') { if (q.type === 'choice') { const o = A[q.id + ':sel']; if (o === undefined) return D.toast('Pilih jawabannya dulu ya'); delete A[q.id + ':sel']; return check(o); } if (input) return check(input); }
    }
    function onKey(e) {
      if (!alive || !main.isConnected || e.target.closest('input,textarea,select')) return;
      const q = qs[i]; if (q.type !== 'input' || (!exam && A[q.id] !== undefined)) return;
      if (/^[0-9,/:]$/.test(e.key) || e.key === '-') { input = (input + (e.key === '-' ? '−' : e.key)).slice(0, 14); }
      else if (e.key === 'Backspace') input = input.slice(0, -1);
      else if (e.key === 'Enter') { const b = main.querySelector('[data-sr=check],[data-sr=next],[data-sr=submit]'); if (b && !b.disabled) b.click(); return; }
      else return;
      const d = main.querySelector('#ssdisp'); if (d) d.innerHTML = input || '&nbsp;'; const c = main.querySelector('[data-sr=check]'); if (c) c.disabled = !input;
    }
    function cleanup() { clearInterval(timer); clearInterval(watch); clearInterval(retry); main.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); if (board) board.destroy(); }
    main.addEventListener('click', onClick); document.addEventListener('keydown', onKey);
    R.stop = () => { alive = false; cleanup(); };
    draw();
  }
  function done(root, s, mine, r) {
    const main = root.querySelector('#ssm'), n = s.questions.length, sc = r && r.score != null ? r.score : s.kind === 'tugas' && mine ? mine.score : null;
    main.innerHTML = `<div class="ss-empty">${D.MQ ? D.MQ.svg(sc == null || sc >= n * 0.6 ? 'cheer' : 'happy', { size: 150, enter: false }) : ''}<h2>Jawabanmu sudah terkirim ke guru 🎉</h2>
      ${sc != null ? `<div class="ss-score"><b>${sc}</b><small>benar dari ${n} soal</small></div>` : '<p class="muted">Nilai akan muncul setelah Bu/Pak Guru membagikannya.</p>'}
      <a class="mq-btn ghost" href="#/belajar">Kembali belajar</a></div>`;
    W.last = null; tick(true);
  }
  function review(root, s, mine) {
    const main = root.querySelector('#ssm'), n = s.questions.length;
    root.querySelector('.ss-top').innerHTML = `<a class="mq-ico" href="#/belajar" aria-label="Keluar">✕</a><span class="grow ss-tt"><small>📊 Nilai</small><b>${esc(s.title)}</b></span>`;
    main.innerHTML = `<div class="ss-review"><div class="ss-score big"><b>${Math.round(((mine ? mine.score : 0) * 100) / n)}</b><small>${mine ? mine.score : 0} benar dari ${n} soal</small></div>
      ${s.questions.map((q, i) => { const a = mine && mine.answers[q.id]; return `<section class="ss-card ${a && a.ok ? 'is-ok' : 'is-no'}">${qPreview(q, i, { key: false })}
        <p>${a ? (a.ok ? '✅ Benar' : `❌ Jawabanmu: <b>${esc(strip(a.given || '–'))}</b>`) : '⚪ Tidak dijawab'} · Jawaban: <b>${ansText(q)}</b></p>${a && !a.ok && q.explain ? `<div class="explain">${q.explain}</div>` : ''}</section>`; }).join('')}
      <a class="mq-btn ghost" href="#/belajar">Kembali belajar</a></div>`;
  }

  /* ---------- Bintang kelas: siswa yang maju menjawab di layar kelas. Hanya guru yang melihat jumlahnya ---------- */
  // Mode server: supabase/030_bintang_kelas.sql. Mode lokal/coba: metiq_cstars di perangkat guru.
  const CSK = 'metiq_cstars';
  const cs = { load() { try { return JSON.parse(localStorage.getItem(CSK)) || []; } catch (e) { return []; } }, save(a) { try { localStorage.setItem(CSK, JSON.stringify(a.slice(-5000))); } catch (e) { /* penuh */ } } };
  const dayStart = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
  const Stars = {
    async add(classId, sid, points, unit, skill, note) {
      if (cloud()) return D.Cloud.rpc('class_star_add', { p_token: ses().token, p_class_id: classId, p_student_id: sid, p_points: points, p_unit: unit || '', p_skill: skill || '', p_note: (note || '').slice(0, 200) });
      const a = cs.load(), id = 'c' + Date.now().toString(36) + rid();
      a.push({ id, classId, sid, points, unit, skill, note: (note || '').slice(0, 200), ts: Date.now() }); cs.save(a); return id;
    },
    async undo(id) {
      if (cloud()) return D.Cloud.rpc('class_star_undo', { p_token: ses().token, p_id: id });
      cs.save(cs.load().filter((x) => x.id !== id));
    },
    async list(classId) {
      if (cloud()) return D.Cloud.rpc('class_stars_list', { p_token: ses().token, p_class_id: classId });
      const a = cs.load().filter((x) => x.classId === classId), t0 = dayStart(), now = new Date();
      const w0 = t0 - ((now.getDay() + 6) % 7) * 864e5, m0 = new Date(now.getFullYear(), now.getMonth(), 1).getTime(), by = {};
      a.forEach((x) => { const o = by[x.sid] = by[x.sid] || { sid: x.sid, today: 0, week: 0, month: 0, all: 0 }; o.all += x.points; if (x.ts >= m0) o.month += x.points; if (x.ts >= w0) o.week += x.points; if (x.ts >= t0) o.today += x.points; });
      return { totals: Object.values(by), recent: a.slice().sort((p, q) => q.ts - p.ts).slice(0, 30) };
    },
  };
  const starsMissing = (e) => (missing(e) ? 'Bintang kelas belum aktif di server. Jalankan supabase/030_bintang_kelas.sql di Supabase.' : errMsg(e));
  const SP = [['today', 'Hari ini'], ['week', 'Pekan ini'], ['month', 'Bulan ini'], ['all', 'Semua']];
  async function starsPage(box, ctx) {
    let per = 'week';
    try { per = sessionStorage.getItem('metiq_csper') || 'week'; } catch (e) { /* mode privat */ }
    box.innerHTML = D.loadingHTML;
    let data; try { data = await Stars.list(ctx.c.id); } catch (e) { box.innerHTML = `<section class="card"><p>${esc(starsMissing(e))}</p></section>`; return; }
    if (!box.isConnected) return;
    const tot = Object.fromEntries((data.totals || []).map((x) => [x.sid, x])), kid = (id) => ctx.kids.find((k) => k.id === id);
    const draw = () => {
      const rows = ctx.kids.map((k) => ({ k, n: +((tot[k.id] || {})[per] || 0) })).sort((a, b) => b.n - a.n || a.k.name.localeCompare(b.k.name));
      const sum = rows.reduce((t, r) => t + r.n, 0), medal = (i, n) => (n > 0 && i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1);
      box.innerHTML = `<section class="card"><div class="rhead"><h2>⭐ Bintang kelas</h2><span class="grow"></span><span class="pill">🔒 Hanya guru</span></div>
          <p class="small muted">Siswa mendapat 1 bintang saat maju ke layar kelas (📺 Mengajar → Soal ke depan), memilih namanya sendiri, dan menjawab benar di percobaan pertama. Siswa tidak melihat jumlah bintang ini di perangkat mereka.</p>
          <div class="vzpills">${SP.map(([k, l]) => `<button class="${per === k ? 'on' : ''}" data-cs="per" data-v="${k}">${l}</button>`).join('')}</div>
          <p class="small"><b>${sum}</b> bintang · ${rows.filter((r) => r.n).length} dari ${rows.length} siswa sudah mendapat bintang</p>
          <div class="cs-list">${rows.map((r, i) => `<div class="cs-row ${r.n ? '' : 'zero'}"><span class="cs-rank">${medal(i, r.n)}</span><span class="av sm">${D.avHTML(r.k.avatar)}</span><a class="grow" href="#/guru/siswa/${r.k.id}">${esc(r.k.name)}</a><span class="cs-bar"><i style="width:${rows[0].n ? Math.round((r.n * 100) / rows[0].n) : 0}%"></i></span><b>${r.n} ⭐</b></div>`).join('') || '<p class="muted">Belum ada siswa di kelas ini.</p>'}</div></section>
        ${(data.recent || []).length ? `<section class="card"><h2>🕘 Bintang terakhir</h2>${data.recent.map((x) => { const k = kid(x.sid); const fresh = Date.now() - x.ts < 864e5;
          return `<div class="cs-rec"><span class="grow"><b>${k ? esc(k.name) : 'Siswa lain'}</b> +${x.points} ⭐<small>${fmtDate(x.ts)}${x.skill && D.SKILLS[x.skill] ? ' · ' + esc(D.SKILLS[x.skill].code) + ' ' + esc(D.SKILLS[x.skill].name) : ''}${x.note ? ' · ' + esc(x.note) : ''}</small></span>${fresh ? `<button class="btn ghost xs" data-cs="undo" data-id="${x.id}">Batalkan</button>` : ''}</div>`; }).join('')}</section>` : ''}`;
    };
    draw();
    box.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-cs]'); if (!b) return;
      if (b.dataset.cs === 'per') { per = b.dataset.v; try { sessionStorage.setItem('metiq_csper', per); } catch (er) { /* mode privat */ } return draw(); }
      if (b.dataset.cs === 'undo') { if (!confirm('Batalkan bintang ini?')) return; try { await Stars.undo(b.dataset.id); D.toast('Bintang dibatalkan'); starsPage(box, ctx); } catch (er) { D.toast(esc(starsMissing(er))); } }
    });
  }

  function stopAll() { stopPoll(); if (R.stop) { R.stop(); R.stop = null; } document.body.classList.remove('ss-printing'); }
  function init(deps) { D = deps; startWatch(); }
  window.METIQ_SESI = { init, teacherPage, studentView, quickTask, stopAll, stars: Stars, starsPage, starsMissing, refresh: () => tick(true), _genSet: genSet, _Live: Live, _norm: norm };
})();
