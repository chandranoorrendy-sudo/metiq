/* Metiq — penyimpanan data di perangkat.
 * Mode lokal: semua data hanya di localStorage. Mode server: localStorage menjadi salinan
 * data dari Supabase (lihat cloud.js), disimpan di kunci terpisah agar data contoh tidak tercampur.
 */
(function () {
  const KEYS = { local: 'metiq_v1', cloud: 'metiq_cloud_cache' };
  let KEY = KEYS.local;
  const blank = () => ({ teachers: [], classes: [], students: [], progress: {}, answers: [], assignments: [], done: [] });
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
      ['classes', 'students', 'answers', 'assignments', 'done'].forEach((k) => { db[k] = b[k] || []; });
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
      t = Store.createTeacher('Bu Guru (Contoh)', '1234'); t.demo = true;
      const c = Store.createClass(t.id, 'Kelas 1A (Contoh)');
      const kids = [['Alya', 0.92], ['Bima', 0.78], ['Citra', 0.85], ['Dafa', 0.6], ['Eka', 0.7], ['Farel', 0.5]];
      const order = C.UNITS.flatMap((u) => u.skills.map((s) => s.id));
      const now = Date.now();
      batching = true;
      kids.forEach(([name, skill], ki) => {
        const s = Store.addStudent(c.id, name);
        const reach = Math.floor(order.length * (0.25 + skill * 0.45));
        order.slice(0, reach).forEach((sk, si) => {
          const n = 6 + Math.floor(Math.random() * 14);
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
      batching = false;
      const a1 = Store.addAssignment(c.id, ['K1', 'K2', 'F2'], 'Latihan membaca jam dan membuat 10', '');
      const a2 = Store.addAssignment(c.id, ['C3', 'D3'], 'Fakta penjumlahan dan pengurangan sampai 10', '');
      // Contoh tugas khusus: Farel mengulang, Alya mendapat materi lanjutan
      const kidsDemo = Store.studentsOf(c.id), farel = kidsDemo.find((k) => k.name === 'Farel'), alya = kidsDemo.find((k) => k.name === 'Alya');
      if (farel) Store.addAssignment(c.id, ['A5', 'C3'], 'Mengulang: membandingkan bilangan dan penjumlahan', '', [farel.id]);
      if (alya) Store.addAssignment(c.id, ['2G1', '2G3'], 'Materi lanjutan: perkalian', '', [alya.id]);
      // Siswa yang sudah mahir di semua keterampilan tugas dianggap sudah menyelesaikannya
      [a1, a2].forEach((a) => Store.studentsOf(c.id).forEach((k, i) => {
        if (a.skills.every((sk) => Store.progress(k.id, sk).score >= 80)) Store.markDone(a.id, k.id, i % 3 === 2 ? 'ortu' : 'siswa', now - (i + 1) * 3600e3);
      }));
      return t;
    },
  };

  window.Store = Store;
})();
