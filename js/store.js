/* Metiq — penyimpanan data di perangkat.
 * Mode lokal: semua data hanya di localStorage. Mode server: localStorage menjadi salinan
 * data dari Supabase (lihat cloud.js), disimpan di kunci terpisah agar data contoh tidak tercampur.
 */
(function () {
  const KEYS = { local: 'metiq_v1', cloud: 'metiq_cloud_cache' };
  let KEY = KEYS.local;
  const blank = () => ({ teachers: [], classes: [], students: [], progress: {}, answers: [], assignments: [], done: [], feedback: [], views: [] });
  let db;
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)) || blank(); } catch (e) { db = blank(); }
    Object.keys(blank()).forEach((k) => { if (!db[k]) db[k] = blank()[k]; });
  }
  load();

  let batching = false;
  const save = () => { if (batching) return; try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { console.warn('Metiq: gagal menyimpan', e); } };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const CODE_CH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const makeCode = (n = 6) => { let s; do { s = ''; for (let i = 0; i < n; i++) s += CODE_CH[Math.floor(Math.random() * CODE_CH.length)]; } while (db.classes.some((c) => c.code === s) || db.students.some((x) => x.parentCode === s)); return s; };
  const hash = (s) => { let h = 5381; for (const ch of String(s)) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0; return h.toString(36); };
  const AVATARS = ['🦁', '🐯', '🐼', '🐨', '🐸', '🐵', '🦊', '🐰', '🐻', '🐧', '🦄', '🐙', '🐳', '🦋', '🐞', '🐢'];

  // SmartScore ala IXL: naik cepat di awal, makin sulit mendekati 100; salah menurunkan skor
  function nextScore(s, ok) {
    if (ok) return Math.min(100, s + (s < 50 ? 12 : s < 70 ? 9 : s < 80 ? 7 : s < 90 ? 5 : 3));
    return Math.max(0, s - (s < 50 ? 4 : s < 80 ? 7 : 10));
  }

  const Store = {
    AVATARS,
    nextScore,
    get db() { return db; },
    setMode(cloud) { const k = cloud ? KEYS.cloud : KEYS.local; if (k !== KEY) { KEY = k; load(); } },
    // Ganti salinan lokal dengan data dari server; jawaban yang belum terkirim tetap ditampilkan
    loadBundle(b, pending, sid) {
      db = blank();
      if (b.teacher) db.teachers = [b.teacher];
      if (b.parent) db.parent = b.parent;
      ['classes', 'students', 'answers', 'assignments', 'done', 'feedback', 'views'].forEach((k) => { db[k] = b[k] || []; });
      db.progress = b.progress || {};
      if (pending) {
        const have = new Set(db.answers.map((a) => a.id));
        pending.answers.forEach((a) => { if (!have.has(a.id)) db.answers.push(a); });
        if (sid) {
          const p = db.progress[sid] = db.progress[sid] || {};
          Object.entries(pending.progress).forEach(([k, v]) => { if (!p[k] || v.att >= p[k].att) p[k] = v; });
        }
      }
      save();
    },
    lastAnswer() { return db.answers[db.answers.length - 1]; },

    /* Guru & kelas */
    createTeacher(name, pin) { const t = { id: uid(), name: name.trim(), pin: hash(pin), createdAt: Date.now() }; db.teachers.push(t); save(); return t; },
    loginTeacher(id, pin) { const t = db.teachers.find((x) => x.id === id); return t && t.pin === hash(pin) ? t : null; },
    teacher(id) { return db.teachers.find((t) => t.id === id); },
    createClass(teacherId, name) { const c = { id: uid(), teacherId, name: name.trim(), code: makeCode(5), createdAt: Date.now() }; db.classes.push(c); save(); return c; },
    classesOf(teacherId) { return db.classes.filter((c) => c.teacherId === teacherId); },
    cls(id) { return db.classes.find((c) => c.id === id); },
    classByCode(code) { return db.classes.find((c) => c.code === String(code).trim().toUpperCase()); },
    renameTeacher(id, name) { const t = Store.teacher(id); if (t) { t.name = name.trim(); save(); } },
    renameStudent(id, name) { const k = Store.student(id); if (k) { k.name = name.trim(); save(); } },
    renameClass(id, name) { const c = Store.cls(id); if (c) { c.name = name.trim(); save(); } },

    /* Siswa */
    addStudent(classId, name, avatar) {
      const used = Store.studentsOf(classId).map((s) => s.avatar);
      const s = { id: uid(), classId, name: name.trim(), avatar: avatar || AVATARS.find((a) => !used.includes(a)) || AVATARS[Math.floor(Math.random() * AVATARS.length)], parentCode: makeCode(6), createdAt: Date.now() };
      db.students.push(s); save(); return s;
    },
    removeStudent(id) { db.students = db.students.filter((s) => s.id !== id); delete db.progress[id]; db.answers = db.answers.filter((a) => a.sid !== id); save(); },
    student(id) { return db.students.find((s) => s.id === id); },
    studentsOf(classId) { return db.students.filter((s) => s.classId === classId).sort((a, b) => a.name.localeCompare(b.name)); },
    setStudentAvatar(id, avatar) { const s = Store.student(id); if (s) { s.avatar = avatar; save(); } },
    setTeacherAvatar(id, avatar) { const t = Store.teacher(id); if (t) { t.avatar = avatar; save(); } },
    studentByParentCode(code) { return db.students.find((s) => s.parentCode === String(code).trim().toUpperCase()); },

    /* Kemajuan */
    progress(sid, skillId) { return (db.progress[sid] || {})[skillId] || { score: 0, att: 0, ok: 0, ms: 0, last: 0 }; },
    progressAll(sid) { return db.progress[sid] || {}; },
    answersOf(sid) { return db.answers.filter((a) => a.sid === sid); },
    /* Asesmen: pf 'a' = asesmen awal (pretest), 'b' = asesmen akhir (posttest, dibuka admin).
     * <pf>:diag -> score = kelas × 10 (0 = diulang), att = nomor percobaan (selalu naik), ok = usia, ms = lama, last = waktu
     * <pf>:<keterampilan> -> score 100 benar & cepat, 80 benar tapi lambat, 1 salah sangat cepat, 0 salah; ms = nomor percobaan */
    DIAG: {
      1: ['A1', 'B2', 'C3', 'D3', 'G1'], 2: ['2A1', '2C1', '2D2', '2G3', '2I1'], 3: ['3A1', '3E3', '3F2', '3I3', '3K2'],
      4: ['4C1', '4D2', '4E1', '4H4', '4J3'], 5: ['5D1', '5E1', '5H1', '5J2', '5L2'], 6: ['6A2', '6C1', '6D2', '6G2', '6I2'],
    },
    diagVersion(sid, pf = 'a') { const d = (db.progress[sid] || {})[pf + ':diag']; return d ? d.att : 0; },
    recordDiag(sid, r, pf = 'a') {
      const p = db.progress[sid] = db.progress[sid] || {}, now = r.at || Date.now(), out = {}, v = Store.diagVersion(sid, pf) + 1;
      p[pf + ':diag'] = out[pf + ':diag'] = { score: Math.min(100, r.level * 10), att: v, ok: r.age, ms: Math.min(r.ms, 3600000), last: now };
      r.answers.forEach(([id, ok, fast, guess]) => { const k = pf + ':' + id; p[k] = out[k] = { score: ok ? (fast === 0 ? 80 : 100) : guess ? 1 : 0, att: Math.max(v, ((p[k] || {}).att || 0) + 1), ok: ok ? 1 : 0, ms: v, last: now }; });
      save();
      return out;
    },
    resetDiag(sid, pf = 'a') {
      const p = db.progress[sid] = db.progress[sid] || {};
      p[pf + ':diag'] = { score: 0, att: Store.diagVersion(sid, pf) + 1, ok: 0, ms: 0, last: Date.now() };
      save();
      return { [pf + ':diag']: Object.assign({}, p[pf + ':diag']) };
    },
    diagOf(sid, pf = 'a') {
      const p = db.progress[sid] || {}, d = p[pf + ':diag'];
      if (!d || !d.score) return null;
      // hanya jawaban dari percobaan terakhir (ms menyimpan nomor percobaannya)
      const items = Object.entries(p).filter(([k, v]) => k.startsWith(pf + ':') && k !== pf + ':diag' && k !== pf + ':open' && v.ms === d.att).map(([k, v]) => ({ id: k.slice(2), ok: v.score >= 80, fast: v.score >= 100, guess: v.score === 1 }));
      return { level: Math.round(d.score / 10), age: d.ok, at: d.last, ms: d.ms, items, version: d.att };
    },
    // Asesmen akhir dibuka (score 1) atau dibatalkan (score 0) oleh admin
    openPost(sid, open, at) {
      const p = db.progress[sid] = db.progress[sid] || {}, cur = p['b:open'];
      p['b:open'] = { score: open ? 1 : 0, att: (cur ? cur.att : 0) + 1, ok: 0, ms: 0, last: at || Date.now() };
      save();
      return { 'b:open': Object.assign({}, p['b:open']) };
    },
    postOpenAt(sid) { const o = (db.progress[sid] || {})['b:open']; return o && o.score === 1 ? o.last : 0; },
    postPending(sid) { const o = Store.postOpenAt(sid), d = Store.diagOf(sid, 'b'); return !!o && (!d || d.at < o); },
    recordGame(sid, gameId, points, stars, ms) {
      const p = db.progress[sid] = db.progress[sid] || {}, key = 'g:' + gameId;
      const cur = p[key] || { score: 0, att: 0, ok: 0, ms: 0, last: 0 };
      cur.score = Math.max(cur.score, Math.min(100, points)); cur.att++; cur.ok += stars; cur.ms += Math.min(ms, 600000); cur.last = Date.now();
      p[key] = cur; save();
      return Object.assign({}, cur);
    },
    gameStars(sid) { return Object.entries(db.progress[sid] || {}).filter(([k]) => k.startsWith('g:')).reduce((t, [, v]) => t + (v.ok || 0), 0); },
    record(sid, skillId, ans) {
      const p = db.progress[sid] = db.progress[sid] || {};
      const cur = p[skillId] || { score: 0, att: 0, ok: 0, ms: 0, last: 0 };
      cur.score = nextScore(cur.score, ans.ok);
      cur.att++; if (ans.ok) cur.ok++;
      cur.ms += Math.min(ans.ms || 0, 180000);
      cur.last = ans.ts || Date.now();
      if (cur.score === 100 && !cur.masteredAt) cur.masteredAt = cur.last;
      p[skillId] = cur;
      db.answers.push(Object.assign({ id: uid(), sid, skill: skillId, ts: Date.now() }, ans));
      // batasi riwayat jawaban per siswa agar penyimpanan tidak penuh
      const mine = batching ? [] : db.answers.filter((a) => a.sid === sid);
      if (mine.length > 1500) { const drop = new Set(mine.slice(0, mine.length - 1500).map((a) => a.id)); db.answers = db.answers.filter((a) => !drop.has(a.id)); }
      save();
      return cur;
    },

    /* Tugas */
    assignmentsOf(classId) { return db.assignments.filter((a) => a.classId === classId); },
    // Tugas selesai: { aid, sid, at, by } — by = 'siswa' (otomatis) atau 'ortu' (dilaporkan orang tua)
    isDone(aid, sid) { return db.done.some((d) => d.aid === aid && d.sid === sid); },
    doneFor(aid) { return db.done.filter((d) => d.aid === aid); },
    /* Ulasan tugas, laporan dibuka orang tua, NISN */
    feedbackOf(aid) { return (db.feedback || []).filter((f) => f.aid === aid); },
    myFeedback(aid, sid, by) { return (db.feedback || []).find((f) => f.aid === aid && f.sid === sid && f.by === by); },
    addFeedback(aid, sid, by, rating, comment, at) {
      db.feedback = (db.feedback || []).filter((f) => !(f.aid === aid && f.sid === sid && f.by === by));
      db.feedback.push({ aid, sid, by, rating: +rating, comment: String(comment || '').trim().slice(0, 500) || null, at: at || Date.now() }); save();
    },
    allFeedback() { return db.feedback || []; },
    logView(sid, via, at) {
      db.views = db.views || [];
      const last = db.views.filter((v) => v.sid === sid && v.via === via).pop();
      if (!at && last && Date.now() - last.at < 10 * 60000) return;
      db.views.push({ sid, via, at: at || Date.now() }); save();
    },
    viewsOf(sid) { return (db.views || []).filter((v) => v.sid === sid); },
    setNisn(sid, nisn) { const k = Store.student(sid); if (k) { k.nisn = nisn || null; save(); } },
    markDone(aid, sid, by, at) { if (!Store.isDone(aid, sid)) { db.done.push({ aid, sid, at: at || Date.now(), by: by || 'siswa' }); save(); } },
    // students: daftar id siswa sasaran; kosong = seluruh kelas
    addAssignment(classId, skills, note, due, students) { const a = { id: uid(), classId, skills, note: (note || '').trim(), due: due || '', students: students && students.length ? students : null, createdAt: Date.now() }; db.assignments.push(a); save(); return a; },
    assignmentsFor(sid) { const k = Store.student(sid); return k ? Store.assignmentsOf(k.classId).filter((a) => !a.students || !a.students.length || a.students.includes(sid)) : []; },
    removeAssignment(id) { db.assignments = db.assignments.filter((a) => a.id !== id); save(); },

    /* Ekspor / impor */
    exportJSON() { return JSON.stringify(db); },
    importJSON(text) {
      const inc = JSON.parse(text);
      ['teachers', 'classes', 'students', 'assignments'].forEach((k) => (inc[k] || []).forEach((x) => { if (!db[k].some((y) => y.id === x.id)) db[k].push(x); }));
      (inc.done || []).forEach((d) => { if (!Store.isDone(d.aid, d.sid)) db.done.push(d); });
      const have = new Set(db.answers.map((a) => a.id));
      (inc.answers || []).forEach((a) => { if (!have.has(a.id)) db.answers.push(a); });
      Object.entries(inc.progress || {}).forEach(([sid, skills]) => {
        db.progress[sid] = db.progress[sid] || {};
        Object.entries(skills).forEach(([k, v]) => { const cur = db.progress[sid][k]; if (!cur || v.att > cur.att) db.progress[sid][k] = v; });
      });
      save();
    },

    /* Data contoh untuk mencoba dasbor */
    seedDemo() {
      const C = window.METIQ_CURRICULUM;
      let t = db.teachers.find((x) => x.demo);
      if (t) return t;
      // Guru contoh sekaligus koordinator (admin): melihat semua kelas di sekolah contoh
      t = Store.createTeacher('Bu Guru (Contoh)', '1234'); t.demo = true; t.isAdmin = true;
      const c = Store.createClass(t.id, 'Kelas 1A (Contoh)');
      const now = Date.now();
      batching = true;
      // kemampuan siswa 0–1; null = belum pernah berlatih
      // light = data lebih sedikit per keterampilan (untuk kelas tambahan agar penyimpanan tidak penuh)
      const fill = (cls, grade, kids, light) => {
        const order = C.unitsOf(grade).flatMap((u) => u.skills.map((s) => s.id));
        kids.forEach(([name, skill], ki) => {
        const s = Store.addStudent(cls.id, name);
        if (skill === null) return;
        const reach = Math.floor(order.length * (0.25 + skill * 0.45));
        order.slice(0, reach).forEach((sk, si) => {
          const n = light ? 3 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 7);
          const hard = C.SKILLS[sk].unit === 'K' || sk === 'H4' || sk === 'G2' ? 0.18 : 0;
          for (let i = 0; i < n; i++) {
            const q = C.SKILLS[sk].gen();
            const ok = Math.random() < Math.min(0.97, skill - hard + i * 0.01);
            let given = q.answer;
            if (!ok) {
              if (q.type === 'choice') given = q.options.find((o) => o !== q.answer) || q.answer;
              else { const m = q.meta || {}; given = String(m.op === '-' && Math.random() < 0.4 ? m.a + m.b : Math.max(0, +q.answer + (Math.random() < 0.5 ? -1 : 1))); }
            }
            const ts = now - Math.floor(((reach - si) / reach) * 13 * 864e5) - Math.floor(Math.random() * 864e5 * 0.5) - ki * 3600e3;
            Store.record(s.id, sk, { ok, given, answer: q.answer, text: q.text.replace(/<[^>]+>/g, ''), tag: ok ? null : C.classify(q, given), ms: 6000 + Math.random() * 20000, ts });
            db.answers[db.answers.length - 1].ts = ts;
          }
        });
        });
      };
      fill(c, 1, [['Alya', 0.92], ['Bima', 0.78], ['Citra', 0.85], ['Dafa', 0.6], ['Eka', 0.7], ['Farel', 0.5]]);
      // Kelas lain di sekolah contoh, dengan kondisi berbeda-beda untuk dasbor koordinator
      const others = [
        ['Pak Ahmad (Contoh)', 'Kelas 2A (Contoh)', 2, [['Gita', 0.9], ['Hana', 0.85], ['Iqbal', 0.8], ['Joko', 0.75], ['Kiki', 0.88]]],
        ['Bu Sari (Contoh)', 'Kelas 3A (Contoh)', 3, [['Lala', 0.55], ['Miko', 0.45], ['Nina', 0.6], ['Oki', 0.5], ['Putri', 0.75], ['Raka', null]]],
        ['Bu Rina (Contoh)', 'Kelas 5A (Contoh)', 5, [['Salsa', 0.8], ['Tegar', null], ['Umar', 0.65], ['Vina', null], ['Wawan', 0.6]]],
      ];
      others.forEach(([tn, cn, g, kids]) => { const t2 = Store.createTeacher(tn, '1234'); t2.demo = true; const c2 = Store.createClass(t2.id, cn); fill(c2, g, kids); });
      // Kelas paralel B (5 jenjang × 2 kelas = 10 kelas), dengan guru yang sudah ada dan dua guru baru
      const tOf = (name) => db.teachers.find((x) => x.name.startsWith(name)) || (() => { const x = Store.createTeacher(name + ' (Contoh)', '1234'); x.demo = true; return x; })();
      [
        ['Bu Guru', 'Kelas 1B (Contoh)', 1, [['Ayu', 0.75], ['Bayu', 0.55], ['Cici', 0.65], ['Doni', 0.45]]],
        ['Pak Ahmad', 'Kelas 2B (Contoh)', 2, [['Elsa', 0.6], ['Fajar', 0.5], ['Gina', 0.7], ['Hadi', null]]],
        ['Bu Nur', 'Kelas 3B (Contoh)', 3, [['Intan', 0.8], ['Jaka', 0.75], ['Kirana', 0.85], ['Lutfi', 0.7]]],
        ['Pak Dimas', 'Kelas 4A (Contoh)', 4, [['Maya', 0.7], ['Nanda', 0.6], ['Oscar', 0.5], ['Pita', 0.8]]],
        ['Bu Nur', 'Kelas 4B (Contoh)', 4, [['Qori', 0.55], ['Rani', 0.45], ['Sandi', 0.6], ['Tia', null]]],
        ['Bu Rina', 'Kelas 5B (Contoh)', 5, [['Ulfa', 0.5], ['Vino', 0.45], ['Wulan', 0.55], ['Yusuf', 0.4]]],
      ].forEach(([tn, cn, g, kids]) => fill(Store.createClass(tOf(tn).id, cn), g, kids, true));
      // Contoh asesmen awal (60 hari lalu) dan akhir (hari ini). Siswa lain diminta asesmen awal saat masuk.
      const fake = (L) => [...(L > 1 ? Store.DIAG[L - 1].map((id) => [id, 1, 1, 0]) : []), ...Store.DIAG[L].map((id, i) => [id, i < 2 ? 1 : 0, i === 0 ? 1 : 0, 0])];
      const plan = { Alya: [7, 2, 'buka'], Farel: [7, 1, 2], Bima: [7, 1, 2], Lala: [9, 2, 3], Miko: [9, 1, 2], Nina: [9, 2, 2], Oki: [9, 2], Salsa: [11, 3, 4], Umar: [11, 2, 4], Wawan: [11, 2, 3],
        Ayu: [7, 1, 2], Bayu: [7, 1, 1], Cici: [7, 1, 2], Doni: [7, 1], Gita: [8, 3, 3], Hana: [8, 2, 3], Elsa: [8, 1, 2], Fajar: [8, 1, 2], Gina: [8, 2, 3],
        Intan: [9, 3, 4], Jaka: [9, 3, 3], Kirana: [9, 3, 4], Lutfi: [9, 2, 3], Maya: [10, 3, 4], Nanda: [10, 2, 3], Oscar: [10, 2, 2], Pita: [10, 4, 5],
        Qori: [10, 2, 3], Rani: [10, 1, 2], Sandi: [10, 2, 3], Ulfa: [11, 2, 3], Vino: [11, 1, 2], Wulan: [11, 2, 4], Yusuf: [11, 1, 2] };
      db.students.forEach((k) => {
        const x = plan[k.name]; if (!x) return;
        Store.recordDiag(k.id, { level: x[1], age: x[0], ms: 420000, answers: fake(x[1]), at: now - 60 * 864e5 });
        if (x[2] === 'buka') Store.openPost(k.id, true, now - 864e5);
        else if (x[2]) { Store.openPost(k.id, true, now - 2 * 864e5); Store.recordDiag(k.id, { level: x[2], age: x[0], ms: 380000, answers: fake(x[2]), at: now - 864e5 }, 'b'); }
      });
      // Contoh laporan dibuka orang tua (sebagian orang tua rajin, sebagian belum pernah)
      db.students.forEach((k, i) => { const n = [5, 2, 0, 8, 1, 0, 3][i % 7]; for (let j = 0; j < n; j++) Store.logView(k.id, i % 2 ? 'kode' : 'akun', now - (j * 2 + i % 3) * 864e5); });
      const ahmad = db.classes.find((x) => x.name === 'Kelas 2A (Contoh)');
      Store.addAssignment(ahmad.id, ['2G1', '2G2'], 'Latihan perkalian', '');
      batching = false;
      const a1 = Store.addAssignment(c.id, ['K1', 'K2', 'F2'], 'Latihan membaca jam dan membuat 10', '');
      const a2 = Store.addAssignment(c.id, ['C3', 'D3'], 'Fakta penjumlahan dan pengurangan sampai 10', '');
      // Contoh tugas khusus: Farel mengulang, Alya mendapat materi lanjutan
      const kidsDemo = Store.studentsOf(c.id), farel = kidsDemo.find((k) => k.name === 'Farel'), alya = kidsDemo.find((k) => k.name === 'Alya');
      if (farel) Store.addAssignment(c.id, ['A5', 'C3'], 'Mengulang: membandingkan bilangan dan penjumlahan', '', [farel.id]);
      if (alya) Store.addAssignment(c.id, ['2G1', '2G3'], 'Materi lanjutan: perkalian', '', [alya.id]);
      // Siswa yang sudah mahir di semua keterampilan tugas dianggap sudah menyelesaikannya
      const comments = { siswa: ['Seru! Soalnya pas.', 'Agak susah di soal cerita.', '', 'Aku suka membaca jam!'], ortu: ['Anak semangat mengerjakan, terima kasih Bu.', 'Perlu dibantu membaca soal.', ''] };
      [a1, a2].forEach((a) => Store.studentsOf(c.id).forEach((k, i) => {
        if (!a.skills.every((sk) => Store.progress(k.id, sk).score >= 80)) return;
        const by = i % 3 === 2 ? 'ortu' : 'siswa';
        Store.markDone(a.id, k.id, by, now - (i + 1) * 3600e3);
        Store.addFeedback(a.id, k.id, by, [5, 4, 3, 5, 4][i % 5], comments[by][i % comments[by].length], now - i * 3000e3);
      }));
      return t;
    },
  };

  window.Store = Store;
})();
