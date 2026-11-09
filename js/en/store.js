/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
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
  const save = () => { if (batching) return; try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { console.warn('Metiq: failed to save', e); } };
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
    deleteClass(id) {
      const kids = db.students.filter((k) => k.classId === id).map((k) => k.id), asg = db.assignments.filter((a) => a.classId === id).map((a) => a.id);
      db.classes = db.classes.filter((c) => c.id !== id); db.students = db.students.filter((k) => k.classId !== id);
      db.answers = db.answers.filter((x) => !kids.includes(x.sid)); kids.forEach((k) => { delete db.progress[k]; });
      db.assignments = db.assignments.filter((a) => a.classId !== id); db.done = db.done.filter((d) => !asg.includes(d.aid)); save();
    },
    renameClass(id, name) { const c = Store.cls(id); if (c) { c.name = name.trim(); save(); } },
    setClassSettings(id, st) { const c = Store.cls(id); if (c) { c.settings = { konteks: st.konteks === 'islami' ? 'islami' : 'umum', adab: st.adab === true }; save(); } return c && c.settings; },

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
     * <pf>:diag -> score = kode level (0 = diulang), att = nomor percobaan (selalu naik), ok = usia, ms = lama, last = waktu
     *   kode level: Kelas 1–6 = kelas × 10 (10–60, sama seperti data lama); TK A = 2, TK B = 5; Kelas 7–13 (Kelas 7, Kelas 8,
     *   Aljabar 1, Geometri, Aljabar 2, Prakalkulus, Kalkulus) = 61–67. Server membatasi score 0–100, jadi kelas × 10 tidak muat.
     *   ok: usia saja (data lama, TK, SD), atau jenjang × 100 + usia bila siswa SMP/SMA memilih jenjangnya (mis. 1116 = Aljabar 2, 16 tahun)
     * <pf>:<keterampilan> -> score 100 benar & cepat, 80 benar tapi lambat, 1 salah sangat cepat, 0 salah; ms = nomor percobaan */
    DIAG: {
      // TK: hanya cerita beraudio (stories-tk.js), supaya anak yang belum bisa membaca cukup mendengarkan
      '-2': ['TAK1', 'TAK2', 'TAK3'], '-1': ['TBM1', 'TBM2', 'TBM3', 'TBM4', 'TBM5'],
      1: ['A1', 'B2', 'C3', 'D3', 'G1'], 2: ['2A1', '2C1', '2D2', '2G3', '2I1'], 3: ['3A1', '3E3', '3F2', '3I3', '3K2'],
      4: ['4C1', '4D2', '4E1', '4H4', '4J3'], 5: ['5D1', '5E1', '5H1', '5J2', '5L2'], 6: ['6A2', '6C1', '6D2', '6G2', '6I2'],
      7: ['7A3', '7B1', '7D2', '7F1', '7I1'], 8: ['8A1', '8C1', '8E2', '8F1', '8H1'], 9: ['A1A1', 'A1E2', 'A1F1', 'A1H2', 'A1I1'],
      10: ['GB1', 'GD1', 'GE2', 'GG2', 'GI1'], 11: ['A2B1', 'A2C1', 'A2D1', 'A2E2', 'A2H3'], 12: ['PKA2', 'PKC1', 'PKD1', 'PKE3', 'PKH2'],
      13: ['KA2', 'KD1', 'KD4', 'KF2', 'KI1'],
    },
    diagCode(level) { return level === -2 ? 2 : level === -1 ? 5 : level >= 7 ? Math.min(67, 54 + level) : Math.min(60, level * 10); },
    diagLevel(score) { return score >= 61 && score <= 67 ? score - 54 : score < 10 ? (score <= 3 ? -2 : -1) : Math.round(score / 10); },
    diagVersion(sid, pf = 'a') { const d = (db.progress[sid] || {})[pf + ':diag']; return d ? d.att : 0; },
    recordDiag(sid, r, pf = 'a') {
      const p = db.progress[sid] = db.progress[sid] || {}, now = r.at || Date.now(), out = {}, v = Store.diagVersion(sid, pf) + 1;
      p[pf + ':diag'] = out[pf + ':diag'] = { score: Store.diagCode(r.level), att: v, ok: r.cls ? r.cls * 100 + r.age : r.age, ms: Math.min(r.ms, 3600000), last: now };
      r.answers.forEach(([id, ok, fast, guess]) => { const k = pf + ':' + id; p[k] = out[k] = { score: ok ? (fast === 0 ? 80 : 100) : guess ? 1 : 0, att: Math.max(v, ((p[k] || {}).att || 0) + 1), ok: ok ? 1 : 0, ms: v, last: now }; });
      save();
      return out;
    },
    resetDiag(sid, pf = 'a') {
      const p = db.progress[sid] = db.progress[sid] || {};
      if (pf === 'a') delete p['a:seen'];
      p[pf + ':diag'] = { score: 0, att: Store.diagVersion(sid, pf) + 1, ok: 0, ms: 0, last: Date.now() };
      save();
      return { [pf + ':diag']: Object.assign({}, p[pf + ':diag']) };
    },
    diagOf(sid, pf = 'a') {
      const p = db.progress[sid] || {}, d = p[pf + ':diag'];
      if (!d || !d.score) return null;
      // hanya jawaban dari percobaan terakhir (ms menyimpan nomor percobaannya)
      const items = Object.entries(p).filter(([k, v]) => k.startsWith(pf + ':') && k !== pf + ':diag' && k !== pf + ':open' && v.ms === d.att).map(([k, v]) => ({ id: k.slice(2), ok: v.score >= 80, fast: v.score >= 100, guess: v.score === 1 }));
      // cls = jenjang yang dipilih siswa SMP/SMA (null untuk data lama, TK, dan SD: kelas sesuai usia dihitung dari usia)
      return { level: Store.diagLevel(d.score), age: d.ok % 100, cls: d.ok >= 100 ? Math.floor(d.ok / 100) : null, at: d.last, ms: d.ms, items, version: d.att };
    },
    /* Tanda "sudah pernah melewati asesmen awal". Anak yang menekan "Lewati dulu" juga diingat,
     * supaya pertanyaan usia dan target harian tidak muncul lagi setiap membuka aplikasi.
     * Kunci 'a:seen' pendek, aman untuk kolom skill di server. */
    onboarded(sid) {
      const p = db.progress[sid] || {};
      return !!(p['a:seen'] && p['a:seen'].ok) || !!Store.diagOf(sid);
    },
    markOnboard(sid) {
      const p = db.progress[sid] = db.progress[sid] || {}, cur = p['a:seen'];
      if (cur && cur.ok) return { key: null, entry: null };
      p['a:seen'] = { score: 100, att: (cur ? cur.att : 0) + 1, ok: 1, ms: 0, last: Date.now() };
      save();
      return { key: 'a:seen', entry: Object.assign({}, p['a:seen']) };
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
    // Misi Sehari Bekerja: kunci 'm:<key>', ok = bintang terbaik (1–3), att = berapa kali diselesaikan
    recordMission(sid, key, stars, ms) {
      const p = db.progress[sid] = db.progress[sid] || {}, k = 'm:' + key;
      const cur = p[k] || { score: 0, att: 0, ok: 0, ms: 0, last: 0 };
      cur.score = Math.max(cur.score, Math.round((stars / 3) * 100)); cur.att++; cur.ok = Math.max(cur.ok, stars); cur.ms += Math.min(ms, 1800000); cur.last = Date.now();
      p[k] = cur; save();
      return Object.assign({}, cur);
    },
    gameStars(sid) { return Object.entries(db.progress[sid] || {}).filter(([k]) => k.startsWith('g:')).reduce((t, [, v]) => t + (v.ok || 0), 0); },
    /* Bintang (pengganti XP). Disimpan per hari di kunci 'x:YYYYMMDD' (maks 10 huruf agar muat di server).
     * ok = bintang hari itu, att = berapa kali bertambah (selalu naik, syarat sinkron server). */
    dayKey(ts) { const d = new Date(ts || Date.now()); return 'x:' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); },
    todayKey() { return Store.dayKey().slice(2); },
    starsToday(sid) { const p = (db.progress[sid] || {})[Store.dayKey()]; return p ? p.ok : 0; },
    // cap = batas bintang per hari (hanya untuk latihan). Mengembalikan { given, key, entry } agar bisa dikirim ke server.
    addStars(sid, n, cap) {
      const key = Store.dayKey(), p = db.progress[sid] = db.progress[sid] || {};
      const cur = p[key] || { score: 0, att: 0, ok: 0, ms: 0, last: 0 };
      const give = cap ? Math.max(0, Math.min(n, cap - cur.ok)) : n;
      if (give <= 0) return { given: 0, key, entry: null };
      cur.ok += give; cur.att++; cur.last = Date.now(); p[key] = cur; save();
      return { given: give, key, entry: Object.assign({}, cur) };
    },
    dayOfKey(k) { const m = /^x:(\d{4})(\d{2})(\d{2})$/.exec(k); return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : null; },
    // Terapkan angka resmi dari server (bintang harian, ujian bab, rekor permainan) ke data di perangkat.
    applySync(sid, prog) {
      if (!prog || typeof prog !== 'object') return false;
      const p = db.progress[sid] = db.progress[sid] || {};
      let touched = false;
      Object.keys(prog).forEach((k) => {
        const v = prog[k];
        if (!v || typeof v !== 'object' || !/^(x:|u:|g:)/.test(k)) return;
        const cur = p[k] || {};
        p[k] = {
          score: Math.max(0, Math.min(100, +v.score || 0)),
          att: +v.att || 0,
          ok: +v.ok || 0,
          ms: +v.ms || 0,
          last: +v.last || Date.now(),
        };
        if (cur.masteredAt) p[k].masteredAt = cur.masteredAt;
        touched = true;
      });
      if (touched) save();
      return touched;
    },
    // total bintang; from/to (ms) membatasi periode
    starsOf(sid, from, to) { return Object.entries(db.progress[sid] || {}).reduce((t, [k, v]) => { const d = Store.dayOfKey(k); return d !== null && d >= (from || 0) && d <= (to || Infinity) ? t + (v.ok || 0) : t; }, 0); },
    starDays(sid, from) { return Object.keys(db.progress[sid] || {}).filter((k) => { const d = Store.dayOfKey(k); return d !== null && d >= (from || 0) && (db.progress[sid][k].ok || 0) > 0; }).length; },
    /* Ujian bab (peti harta karun): kunci 'u:<bab>'. score = nilai terbaik (%), ok = bintang terbaik, att = jumlah percobaan. */
    testOf(sid, unitId) { const p = (db.progress[sid] || {})['u:' + unitId]; return p && p.att ? { best: p.score, stars: p.ok, att: p.att, last: p.last } : null; },
    testsOpen(sid) { return Object.entries(db.progress[sid] || {}).filter(([k, v]) => k.startsWith('u:') && v.score >= 60).map(([k]) => k.slice(2)); },
    recordTest(sid, unitId, r) {
      const p = db.progress[sid] = db.progress[sid] || {}, key = 'u:' + unitId;
      const cur = p[key] || { score: 0, att: 0, ok: 0, ms: 0, last: 0 };
      if (r.counted) { cur.score = Math.max(cur.score, r.pct); cur.ok = Math.max(cur.ok, r.stars); }
      cur.att++; cur.ms += Math.min(r.ms || 0, 3600000); cur.last = Date.now(); p[key] = cur; save();
      return { key, entry: Object.assign({}, cur) };
    },
    // Catat jawaban (mis. ujian bab) tanpa mengubah SmartScore keterampilan
    logAnswer(sid, skillId, ans) {
      db.answers.push(Object.assign({ id: uid(), sid, skill: skillId, ts: Date.now() }, ans)); save();
      return Object.assign({}, Store.progress(sid, skillId));
    },
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
      t = Store.createTeacher('Ms. Teacher (Sample)', '1234'); t.demo = true; t.isAdmin = true;
      const c = Store.createClass(t.id, 'Class 1A (Sample)');
      const now = Date.now();
      batching = true;
      // kemampuan siswa 0–1; null = belum pernah berlatih
      // light = lebih sedikit keterampilan (untuk kelas tambahan agar penyimpanan tidak penuh); jawaban per keterampilan tetap cukup untuk skor yang bermakna
      const fill = (cls, grade, kids, light) => {
        const order = C.unitsOf(grade).flatMap((u) => u.skills.map((s) => s.id));
        kids.forEach(([name, skill], ki) => {
        const s = Store.addStudent(cls.id, name);
        if (skill === null) return;
        const reach = Math.floor(order.length * (0.25 + skill * 0.45) * (light ? 0.5 : 1));
        order.slice(0, reach).forEach((sk, si) => {
          const n = light ? 8 + Math.floor(Math.random() * 2) : 8 + Math.floor(Math.random() * 5);
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
      fill(c, 1, [['Alya', 0.95], ['Bima', 0.88], ['Citra', 0.92], ['Dafa', 0.66], ['Eka', 0.85], ['Farel', 0.58]]);
      // Kelas lain di sekolah contoh, dengan kondisi berbeda-beda untuk dasbor koordinator
      const others = [
        ['Mr. Ahmad (Sample)', 'Class 2A (Sample)', 2, [['Gita', 0.95], ['Hana', 0.9], ['Iqbal', 0.88], ['Joko', 0.86], ['Kiki', 0.92]]],
        ['Ms. Sari (Sample)', 'Class 3A (Sample)', 3, [['Lala', 0.85], ['Miko', 0.64], ['Nina', 0.88], ['Oki', 0.9], ['Girls', 0.92], ['Raka', null]]],
        ['Ms. Rina (Sample)', 'Class 5A (Sample)', 5, [['Salsa', 0.92], ['Tegar', null], ['Umar', 0.88], ['Vina', null], ['Wawan', 0.86]]],
      ];
      others.forEach(([tn, cn, g, kids]) => { const t2 = Store.createTeacher(tn, '1234'); t2.demo = true; const c2 = Store.createClass(t2.id, cn); fill(c2, g, kids); });
      // Kelas paralel B (5 jenjang × 2 kelas = 10 kelas), dengan guru yang sudah ada dan dua guru baru
      const tOf = (name) => db.teachers.find((x) => x.name.startsWith(name)) || (() => { const x = Store.createTeacher(name + ' (Sample)', '1234'); x.demo = true; return x; })();
      [
        ['Ms. Teacher', 'Class 1B (Sample)', 1, [['Ayu', 0.92], ['Bayu', 0.85], ['Cici', 0.88], ['Doni', 0.86]]],
        ['Mr. Ahmad', 'Class 2B (Sample)', 2, [['Elsa', 0.88], ['Fajar', 0.86], ['Gina', 0.9], ['Hadi', null]]],
        ['Ms. Nur', 'Class 3B (Sample)', 3, [['Intan', 0.92], ['Jaka', 0.88], ['Kirana', 0.95], ['Lutfi', 0.86]]],
        ['Mr. Dimas', 'Class 4A (Sample)', 4, [['Maya', 0.88], ['Nanda', 0.86], ['Oscar', 0.85], ['Ribbon', 0.92]]],
        ['Ms. Nur', 'Class 4B (Sample)', 4, [['Qori', 0.62], ['Rani', 0.5], ['Sandi', 0.66], ['Tia', null]]],
        ['Ms. Rina', 'Class 5B (Sample)', 5, [['Ulfa', 0.85], ['Vino', 0.62], ['Wulan', 0.88], ['Yusuf', 0.86]]],
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
      const ahmad = db.classes.find((x) => x.name === 'Class 2A (Sample)');
      Store.addAssignment(ahmad.id, ['2G1', '2G2'], 'Multiplication practice', '');
      batching = false;
      const a1 = Store.addAssignment(c.id, ['K1', 'K2', 'F2'], 'Reading clocks and making 10', '');
      const a2 = Store.addAssignment(c.id, ['C3', 'D3'], 'Addition and subtraction facts to 10', '');
      // Contoh tugas khusus: Farel mengulang, Alya mendapat materi lanjutan
      const kidsDemo = Store.studentsOf(c.id), farel = kidsDemo.find((k) => k.name === 'Farel'), alya = kidsDemo.find((k) => k.name === 'Alya');
      if (farel) Store.addAssignment(c.id, ['A5', 'C3'], 'Review: comparing numbers and addition', '', [farel.id]);
      if (alya) Store.addAssignment(c.id, ['2G1', '2G3'], 'Advanced material: multiplication', '', [alya.id]);
      // Siswa yang sudah mahir di semua keterampilan tugas dianggap sudah menyelesaikannya
      const comments = { siswa: ['Fun! The questions were just right.', 'A bit hard on the word problems.', '', 'I like reading clocks!'], ortu: ['My child was eager to do it, thank you.', 'Needs help reading the questions.', ''] };
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
