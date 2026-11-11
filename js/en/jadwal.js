/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Jadwal pertemuan dan laporan koordinator.
 * Guru menyusun jadwal satu semester (kelas, hari mengajar, bab berurutan), lalu setiap pertemuan dimulai dari jadwal
 * (membuka Mode Mengajar) dan diakhiri dengan Selesai beserta ringkasan singkat. Dua hari sebelumnya Metiq mengingatkan
 * guru (lonceng, kartu di Hari ini) dengan daftar persiapan. Admin sekolah melihat laporan semua guru (🏫 Sekolah → 📅 Pertemuan guru).
 * Mode server: supabase/031_jadwal_pertemuan.sql. Mode lokal/coba: metiq_meet di perangkat.
 */
(function () {
  let D = null;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DAY = 864e5, HARI = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => iso(new Date());
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const diffDays = (a, b) => Math.round((parse(a) - parse(b)) / DAY);
  const fmtD = (s, long) => parse(s).toLocaleDateString('en-US', { weekday: long ? 'long' : 'short', day: 'numeric', month: long ? 'long' : 'short', year: long ? 'numeric' : undefined });
  const ses = () => D.session.get();
  const cloud = () => D.cloudOn();
  const rid = () => Math.random().toString(36).slice(2, 8);
  const unitOf = (id) => D.UNITS.find((u) => u.id === id);
  const LES = () => window.METIQ_LESSONS || {};
  const ST = { rencana: ['📅', 'Rencana', ''], berlangsung: ['▶', 'Berlangsung', 'live'], selesai: ['✅', 'Done', 'done'], batal: ['🚫', 'Dibatalkan', 'off'] };
  const TUNTAS = [['tuntas', '✅ Tuntas'], ['sebagian', '🟡 Sebagian'], ['belum', '🔴 Belum']];
  const errMsg = (e) => (e && (e.status === 404 || /could not find the function|schema cache/i.test(e.message || '')) ? 'Jadwal belum aktif di server. Jalankan supabase/031_jadwal_pertemuan.sql di Supabase.' : e && e.status ? e.message : 'Can\'t connect to the server');

  /* ---------- Data ---------- */
  const LK = 'metiq_meet';
  const local = { load() { try { return JSON.parse(localStorage.getItem(LK)) || []; } catch (e) { return []; } }, save(a) { try { localStorage.setItem(LK, JSON.stringify(a)); } catch (e) { /* penuh */ } } };
  const Meet = {
    async list(from, to) {
      if (cloud()) return D.Cloud.rpc('meet_list', { p_token: ses().token, p_from: from, p_to: to });
      return local.load().filter((m) => m.date >= from && m.date <= to).map((m) => { const c = D.S.cls(m.classId) || {}; return Object.assign({}, m, { className: c.name || '', classTeacherName: (D.S.teacher(c.teacherId) || {}).name || '' }); }).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt));
    },
    async save(items) {
      if (cloud()) return D.Cloud.rpc('meet_save', { p_token: ses().token, p_items: items });
      const a = local.load(), ids = [];
      items.forEach((it) => {
        let m = it.id && a.find((x) => x.id === it.id);
        if (!m) { m = { id: 'm' + Date.now().toString(36) + rid(), status: 'rencana', summary: {}, createdAt: Date.now() }; a.push(m); }
        Object.assign(m, { classId: it.classId, units: it.units || [], title: it.title || '', note: it.note || '', prep: it.prep || '' });
        if (m.status === 'rencana' || !m.date) m.date = it.date;
        ids.push(m.id);
      });
      local.save(a); return ids;
    },
    async del(ids) {
      if (cloud()) return D.Cloud.rpc('meet_delete', { p_token: ses().token, p_ids: ids });
      local.save(local.load().filter((m) => !(ids.includes(m.id) && (m.status === 'rencana' || m.status === 'batal'))));
    },
    async status(id, status, summary, note) {
      if (cloud()) return D.Cloud.rpc('meet_status', { p_token: ses().token, p_id: id, p_status: status, p_summary: summary || null, p_note: note == null ? null : note });
      const a = local.load(), m = a.find((x) => x.id === id); if (!m) throw new Error('Pertemuan tidak ditemukan');
      const t = D.S.teacher(ses().id);
      m.status = status;
      if (status === 'berlangsung' || status === 'selesai') { m.taughtBy = ses().id; m.taughtByName = t ? t.name : ''; m.startedAt = m.startedAt || Date.now(); }
      if (status === 'selesai') { m.endedAt = Date.now(); m.summary = summary || {}; }
      if (status === 'rencana') { m.startedAt = null; m.endedAt = null; m.summary = {}; }
      if (note != null) m.note = note;
      local.save(a); return m;
    },
    async colleagues() {
      if (cloud()) return D.Cloud.rpc('meet_colleagues', { p_token: ses().token });
      return D.S.db.teachers.filter((t) => t.id !== ses().id).map((t) => ({ id: t.id, name: t.name })).sort((a, b) => a.name.localeCompare(b.name, 'en'));
    },
    async handover(id, tid, reason) {
      if (cloud()) return D.Cloud.rpc('meet_handover', { p_token: ses().token, p_id: id, p_teacher_id: tid || '', p_reason: reason || '' });
      const a = local.load(), m = a.find((x) => x.id === id); if (!m) throw new Error('Pertemuan tidak ditemukan');
      m.subTeacher = tid || null; m.subTeacherName = tid ? (D.S.teacher(tid) || {}).name || '' : ''; m.subReason = tid ? reason : null;
      local.save(a); return m;
    },
  };
  // pertemuan yang diserahkan ke saya sebagai guru pengganti (bukan kelas saya)
  const isSub = (ctx, m) => m.subTeacher === ctx.t.id && !ctx.classes.some((c) => c.id === m.classId && c.teacherId === ctx.t.id);
  const REASONS = ['Sakit', 'Dinas atau tugas sekolah lain', 'Urusan keluarga', 'Pelatihan guru', 'Other'];

  /* ---------- Pengingat: H-2, H-1, hari H ---------- */
  const CK = () => 'metiq_meet_cache_' + (ses().id || '');
  const cacheGet = () => { try { return JSON.parse(localStorage.getItem(CK())) || null; } catch (e) { return null; } };
  let refreshing = null;
  const mine = (ctx, m) => { if (m.subTeacher === ctx.t.id) return true; if (m.subTeacher) return false; const c = ctx.classes.find((x) => x.id === m.classId); return c && (c.teacherId === ctx.t.id || !ctx.classes.some((x) => x.teacherId === ctx.t.id)); };
  async function refresh(ctx, force) {
    if (!ctx) return;
    const c = cacheGet();
    if (!force && c && Date.now() - c.at < 180000 && c.day === today()) return c.items;
    if (refreshing) return refreshing;
    refreshing = (async () => {
      try {
        const items = (await Meet.list(addDays(today(), -1), addDays(today(), 14))).filter((m) => mine(ctx, m))
          .map((m) => ({ id: m.id, classId: m.classId, className: (ctx.classes.find((x) => x.id === m.classId) || {}).name || m.className || '', date: m.date, units: m.units || [], title: m.title || '', status: m.status, createdAt: m.createdAt || 0,
            sub: isSub(ctx, m), classTeacherName: m.classTeacherName || '', subReason: m.subReason || '' }));
        const before = JSON.stringify((c || {}).items || []);
        try { localStorage.setItem(CK(), JSON.stringify({ at: Date.now(), day: today(), items })); } catch (e) { /* penuh */ }
        if (before !== JSON.stringify(items) && D.onRemind) D.onRemind();
        return items;
      } catch (e) { return (c || {}).items || []; } finally { refreshing = null; }
    })();
    return refreshing;
  }
  // Untuk lonceng notifikasi (sinkron, dari salinan terakhir)
  function reminders() {
    const c = cacheGet(); if (!c) return [];
    const t = today();
    // pertemuan sendiri: H-2 sampai hari H; menggantikan rekan: begitu diserahkan (sampai 14 hari sebelumnya)
    return (c.items || []).filter((m) => (m.status === 'rencana' || m.status === 'berlangsung') && m.date >= t && diffDays(m.date, t) <= (m.sub ? 14 : 2))
      .map((m) => Object.assign({}, m, { left: diffDays(m.date, t), at: m.sub ? Math.min(m.createdAt || 0, Date.now()) + 1 : Math.max(parse(m.date).getTime() - 2 * DAY, Math.min(m.createdAt || 0, Date.now())) }));
  }
  const whenTxt = (n) => (n <= 0 ? 'Today' : n === 1 ? 'Besok' : n === 2 ? 'Lusa' : n + ' hari lagi');
  const unitTxt = (m) => (m.units || []).map(unitOf).filter(Boolean).map((u) => `${u.icon} ${esc(u.name)}`).join(', ') || esc(m.title || 'Pengulangan');
  async function remindCard(el, ctx) {
    if (!el) return;
    await refresh(ctx);
    if (!el.isConnected) return;
    const list = reminders();
    el.innerHTML = list.length ? `<section class="card jd-remind"><h2>🔔 Persiapan mengajar</h2>${list.map((m) => `<a class="jd-rrow" href="#/guru/jadwal/${m.id}"><span class="jd-when ${m.left <= 0 ? 'now' : ''}">${whenTxt(m.left)}</span><span class="grow"><b>${esc(m.className)}</b> · ${unitTxt(m)}<small>${fmtD(m.date, true)}${m.sub ? ` · 🤝 menggantikan ${esc(m.classTeacherName)}${m.subReason ? ' (' + esc(m.subReason) + ')' : ''}` : ''}</small></span><span class="jd-go">Lihat persiapan ▶</span></a>`).join('')}</section>` : '';
  }

  /* ---------- Halaman guru ---------- */
  function teacherPage(box, ctx, arg) {
    if (!arg) return listPage(box, ctx);
    if (arg === 'buat') return wizard(box, ctx);
    if (arg === 'baru') return detail(box, ctx, null);
    return detail(box, ctx, arg);
  }
  const myClasses = (ctx) => { const own = ctx.classes.filter((c) => c.teacherId === ctx.t.id); return own.length ? own : [ctx.c]; };
  const statPill = (m) => { const s = ST[m.status] || ST.rencana; const late = m.status === 'rencana' && m.date < today(); return `<span class="jd-st ${late ? 'late' : s[2]}">${late ? '⚠️ Terlewat' : `${s[0]} ${s[1]}`}</span>`; };
  function stats(list) {
    const t = today(), due = list.filter((m) => m.date <= t && m.status !== 'batal');
    const done = list.filter((m) => m.status === 'selesai'), missed = list.filter((m) => m.status === 'rencana' && m.date < t);
    return { due: due.length, done: done.length, missed: missed.length, off: list.filter((m) => m.status === 'batal').length, next: list.filter((m) => m.date > t && m.date <= addDays(t, 7) && m.status === 'rencana').length,
      pct: due.length ? Math.round((done.filter((m) => m.date <= t).length * 100) / due.length) : null, tuntas: done.filter((m) => (m.summary || {}).tuntas === 'tuntas').length };
  }
  const LV = { cls: '', view: 'next' };
  async function listPage(box, ctx) {
    box.innerHTML = D.loadingHTML;
    const cls = myClasses(ctx), ids = cls.map((c) => c.id);
    let all; try { all = (await Meet.list(addDays(today(), -200), addDays(today(), 200))).filter((m) => ids.includes(m.classId) || isSub(ctx, m)); } catch (e) { box.innerHTML = `<section class="card"><p>${esc(errMsg(e))}</p></section>`; return; }
    if (!box.isConnected) return;
    refresh(ctx, true);
    const cname = (id) => (cls.find((c) => c.id === id) || all.find((m) => m.classId === id) || {}).name || (all.find((m) => m.classId === id) || {}).className || '';
    const draw = () => {
      const t = today(), list = all.filter((m) => !LV.cls || m.classId === LV.cls), st = stats(list);
      const now = list.filter((m) => m.date === t || m.status === 'berlangsung');
      const shown = LV.view === 'next' ? list.filter((m) => m.date >= t || m.status === 'berlangsung' || (m.status === 'rencana' && m.date < t)) : list.filter((m) => m.date < t).reverse();
      const months = {}; shown.forEach((m) => { const k = m.date.slice(0, 7); (months[k] = months[k] || []).push(m); });
      const row = (m) => `<a class="jd-row ${m.date === t ? 'today' : ''}" href="#/guru/jadwal/${m.id}"><span class="jd-date"><b>${parse(m.date).getDate()}</b><small>${HARI[parse(m.date).getDay()].slice(0, 3)}</small></span>
        <span class="grow"><b>${unitTxt(m)}</b><small>${esc(cname(m.classId))}${isSub(ctx, m) ? ` · <span class="jd-sub">🤝 menggantikan ${esc(m.classTeacherName || '')}</span>` : m.subTeacher ? ` · <span class="jd-sub">🤝 diserahkan ke ${esc(m.subTeacherName || '')}</span>` : ''}${m.title && (m.units || []).length ? ' · ' + esc(m.title) : ''}${m.status === 'selesai' && m.summary && m.summary.tuntas ? ' · ' + (TUNTAS.find((x) => x[0] === m.summary.tuntas) || ['', ''])[1] : ''}</small></span>${statPill(m)}</a>`;
      box.innerHTML = `<div id="jd-remind"></div>
        ${now.length ? `<section class="card jd-today"><h2>📍 Hari ini</h2>${now.map((m) => `<div class="jd-trow"><span class="grow"><b>${esc(cname(m.classId))}</b> · ${unitTxt(m)}<small>${fmtD(m.date, true)}</small></span>${statPill(m)}
          ${m.status === 'rencana' || m.status === 'berlangsung' ? `<button class="btn sm" data-jd="start" data-id="${m.id}">${m.status === 'berlangsung' ? '▶ Lanjutkan' : '▶ Mulai'}</button>` : ''}<a class="btn ghost sm" href="#/guru/jadwal/${m.id}">Detail</a></div>`).join('')}</section>` : ''}
        <section class="card"><div class="rhead"><h2>📅 Jadwal mengajar</h2><span class="grow"></span><a class="btn sm" href="#/guru/jadwal/buat">➕ Buat jadwal semester</a><a class="btn ghost sm" href="#/guru/jadwal/baru">➕ Satu pertemuan</a></div>
          ${all.length ? `<div class="jd-stats"><div><b>${st.done}<small>/${st.due}</small></b><span>terlaksana sampai hari ini</span></div><div class="${st.missed ? 'warn' : ''}"><b>${st.missed}</b><span>terlewat, belum ditandai</span></div><div><b>${st.next}</b><span>7 hari ke depan</span></div><div><b>${st.off}</b><span>dibatalkan</span></div></div>` : ''}
          ${cls.length > 1 ? `<div class="vzpills"><button class="${LV.cls ? '' : 'on'}" data-jd="cls" data-v="">All classes</button>${cls.map((c) => `<button class="${LV.cls === c.id ? 'on' : ''}" data-jd="cls" data-v="${c.id}">${esc(c.name)}</button>`).join('')}</div>` : ''}
          <div class="vzpills"><button class="${LV.view === 'next' ? 'on' : ''}" data-jd="view" data-v="next">Mendatang</button><button class="${LV.view === 'past' ? 'on' : ''}" data-jd="view" data-v="past">Sudah lewat</button></div>
          ${Object.keys(months).length ? Object.entries(months).map(([k, ms]) => `<h3 class="jd-month">${parse(k + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>${ms.map(row).join('')}`).join('')
    : `<div class="center jd-empty"><div class="bigemoji">🗓️</div><p class="muted">${all.length ? 'Tidak ada pertemuan di sini.' : 'Belum ada jadwal. Susun jadwal satu semester sekaligus: pilih kelas, hari mengajar, dan bab. Metiq membaginya ke tanggal-tanggal mengajar.'}</p>${all.length ? '' : '<a class="btn" href="#/guru/jadwal/buat">➕ Buat jadwal semester</a>'}</div>`}</section>`;
      remindCard(box.querySelector('#jd-remind'), ctx);
    };
    draw();
    box.onclick = async (e) => {
      const b = e.target.closest('[data-jd]'); if (!b) return;
      if (b.dataset.jd === 'cls') { LV.cls = b.dataset.v; return draw(); }
      if (b.dataset.jd === 'view') { LV.view = b.dataset.v; return draw(); }
      if (b.dataset.jd === 'start') { const m = all.find((x) => x.id === b.dataset.id); return startMeeting(m, ctx); }
    };
  }

  /* ---------- Mulai dan selesai ---------- */
  const AK = 'metiq_meet_active';
  const active = () => { try { return JSON.parse(sessionStorage.getItem(AK)) || null; } catch (e) { return null; } };
  const setActive = (v) => { try { if (v) sessionStorage.setItem(AK, JSON.stringify(v)); else sessionStorage.removeItem(AK); } catch (e) { /* mode privat */ } };
  async function startMeeting(m, ctx) {
    if (!m) return;
    try { if (m.status !== 'berlangsung') await Meet.status(m.id, 'berlangsung'); } catch (e) { return D.toast(esc(errMsg(e))); }
    const uid = (m.units || [])[0];
    setActive({ id: m.id, classId: m.classId, uid: uid || '', at: Date.now(), sub: !!(ctx && isSub(ctx, m)), className: m.className || '' });
    const s = ses(); if (s.classId !== m.classId && (!ctx || ctx.classes.some((c) => c.id === m.classId))) { s.classId = m.classId; D.session.set(s); }
    D.go(uid ? `#/kelas/${uid}/buka` : `#/guru/jadwal/${m.id}`);
  }
  // Formulir Selesai: dipakai di Mode Mengajar (dengan ringkasan otomatis) dan di halaman pertemuan (ditandai manual)
  function finishHTML(auto, note) {
    const chips = auto ? autoChips(auto) : '';
    return `<div class="jd-finish"><h3>⏹ Selesaikan pertemuan</h3>${chips ? `<div class="jd-chips">${chips}</div>` : ''}
      <p class="jd-q">Materi hari ini:</p><div class="jd-tuntas">${TUNTAS.map(([k, l], i) => `<label><input type="radio" name="jdt" value="${k}" ${i === 0 ? 'checked' : ''}> ${l}</label>`).join('')}</div>
      <label class="jd-lbl">Catatan untuk koordinator (boleh kosong)<textarea name="jdnote" rows="3" maxlength="1000" placeholder="mis. 4 siswa belum paham meminjam, diulang pertemuan berikutnya">${esc(note || '')}</textarea></label></div>`;
  }
  const STEPN = { buka: '🎬 Pembuka', materi: '📖 Materi', maju: '🙋 Soal ke depan', main: '🎲 Permainan', tugas: '📲 Tugas siswa', tiket: '🎟️ Tiket keluar' };
  function autoChips(a) {
    const out = [];
    if (a.mins) out.push(`⏱️ ${a.mins} menit`);
    (a.steps || []).forEach((s) => STEPN[s] && out.push(STEPN[s]));
    if (a.parts) out.push(`📖 materi ${a.parts}`);
    if (a.front) out.push(`🙋 ${a.front.n} soal di depan, ${a.front.ok} benar`);
    if (a.stars) out.push(`⭐ ${a.stars} bintang`);
    (a.games || []).forEach((g) => out.push(`🎲 ${g}`));
    return out.map((x) => `<span>${esc(x)}</span>`).join('');
  }
  const readFinish = (root) => ({ tuntas: (root.querySelector('input[name=jdt]:checked') || {}).value || 'tuntas', note: (root.querySelector('textarea[name=jdnote]') || {}).value || '' });
  // Dari Mode Mengajar. Tanpa jadwal aktif: memakai pertemuan rencana hari ini untuk kelas dan bab itu, atau membuat catatan baru.
  async function finishFromClass(host, ctx, uid, auto, done) {
    const act = active();
    const ov = document.createElement('div'); ov.className = 'jd-over';
    ov.innerHTML = `<div class="jd-sheet">${finishHTML(auto, '')}<p class="small muted">${act && act.id ? 'Pertemuan ini tercatat di jadwal Anda dan laporan koordinator.' : `Belum ada jadwal untuk pertemuan ini. Metiq mencatatnya sebagai pertemuan ${esc(ctx.c.name)} hari ini.`}</p>
      <div class="row-btn"><button class="btn ghost" data-jf="cancel">Kembali mengajar</button><button class="btn" data-jf="save">💾 Simpan dan selesai</button></div></div>`;
    host.appendChild(ov);
    ov.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-jf]'); if (!b) return;
      if (b.dataset.jf === 'cancel') return ov.remove();
      b.disabled = true;
      const f = readFinish(ov), summary = Object.assign({}, auto, { tuntas: f.tuntas, via: 'layar' });
      try {
        let id = act && act.id;
        if (!id) {
          const t = today(), cand = (await Meet.list(t, t)).find((m) => m.classId === ctx.c.id && m.status !== 'selesai' && m.status !== 'batal' && (!(m.units || []).length || m.units.includes(uid)));
          id = cand ? cand.id : (await Meet.save([{ classId: ctx.c.id, date: t, units: [uid], title: '' }]))[0];
        }
        await Meet.status(id, 'selesai', summary, f.note);
        setActive(null); ov.remove(); D.toast('Pertemuan tercatat selesai ✔'); refresh(ctx, true);
        done(id);
      } catch (er) { b.disabled = false; D.toast(esc(errMsg(er))); }
    });
  }

  /* ---------- Satu pertemuan: ubah, persiapan, mulai, selesai ---------- */
  async function detail(box, ctx, id) {
    const cls = myClasses(ctx);
    let m = null;
    if (id) {
      box.innerHTML = D.loadingHTML;
      try { m = (await Meet.list(addDays(today(), -400), addDays(today(), 400))).find((x) => x.id === id); } catch (e) { box.innerHTML = `<section class="card"><p>${esc(errMsg(e))}</p></section>`; return; }
      if (!box.isConnected) return;
      if (!m) { box.innerHTML = '<section class="card"><p>Pertemuan tidak ditemukan.</p><a class="btn ghost sm" href="#/guru/jadwal">← Jadwal</a></section>'; return; }
    }
    const f = m ? Object.assign({}, m) : { classId: ctx.c.id, date: today(), units: [], title: '', note: '', prep: '', status: 'rencana' };
    let grade = (unitOf(f.units[0]) || {}).grade || D.getGrade();
    const sub = !!(m && isSub(ctx, m));
    let allCls = m && !cls.some((c) => c.id === m.classId) ? cls.concat(ctx.classes.filter((c) => c.id === m.classId)) : cls;
    if (m && !allCls.some((c) => c.id === m.classId)) allCls = allCls.concat([{ id: m.classId, name: m.className || 'Grade' }]);
    let hand = null; // formulir serah ke rekan: null | 'loading' | [rekan]
    const draw = () => {
      const t = today(), u = unitOf(f.units[0]), left = diffDays(f.date, t), locked = f.status !== 'rencana';
      const prepKey = 'metiq_prep_' + (m ? m.id : 'baru'); let ticks = {}; try { ticks = JSON.parse(localStorage.getItem(prepKey)) || {}; } catch (e) { /* mode privat */ }
      const les = u && LES()[u.id], anim = u && window.METIQ_ANIM && window.METIQ_ANIM.has(u.id);
      const prep = u ? [
        ['materi', `Baca materi ${esc(u.name)}${les ? `: ${les.parts.map((p) => esc(p.t)).join(', ')}` : ''}`, les ? `<a href="#/pelajaran/${u.id}">Buka materi</a>` : ''],
        ...(anim ? [['anim', 'Tonton animasi pembuka bab ini sekali, supaya siap menjelaskannya', `<a href="#/kelas/${u.id}/buka">Pratinjau di layar</a>`]] : []),
        ['questions', `Coba beberapa soal ke depan (${u.skills.length} jenis soal di bab ini)`, `<a href="#/kelas/${u.id}/maju">Pratinjau soal</a>`],
        ['tim', 'Rencanakan pembagian dua tim untuk Tarik Tambang atau Panjat Pinang', ''],
        ['alat', 'Pastikan TV atau proyektor menyala dan Metiq terbuka di sana', ''],
        ['tugas', 'Tugas setelah materi: siswa membawa perangkat, atau siapkan lembar cetak', '<a href="#/guru/sesi/baru-tugas">Siapkan tugas</a>'],
      ] : [];
      box.innerHTML = `<button class="back link" data-jd="back">← Jadwal</button>
        <section class="card jd-head"><div class="rhead"><h2>${m ? `${u ? u.icon + ' ' + esc(u.name) : esc(f.title || 'Pertemuan')}` : '➕ Pertemuan baru'}</h2><span class="grow"></span>${m ? statPill(f) : ''}</div>
          ${m ? `<p class="muted">${fmtD(f.date, true)} · ${esc((allCls.find((c) => c.id === f.classId) || {}).name || '')}${f.status === 'rencana' && left >= 0 ? ` · <b>${left === 0 ? 'today' : left === 1 ? 'besok' : left + ' hari lagi'}</b>` : ''}${f.taughtByName ? ` · diajar ${esc(f.taughtByName)}` : ''}</p>` : ''}
          ${sub ? `<p class="jd-subnote">🤝 Anda menggantikan <b>${esc(f.classTeacherName || 'guru kelas')}</b>${f.subReason ? ` (${esc(f.subReason)})` : ''}. Materi, soal ke depan, dan permainan bisa dipakai seperti biasa. Bintang kelas dan tugas ke perangkat siswa tetap milik guru kelas.</p>`
    : f.subTeacher ? `<p class="jd-subnote">🤝 Diserahkan ke <b>${esc(f.subTeacherName || '')}</b>${f.subReason ? ` (${esc(f.subReason)})` : ''}. Pertemuan ini muncul di jadwal dan pengingat rekan Anda. <button class="link" data-jd="unhand">Batalkan penyerahan</button></p>` : ''}
          <div class="row-btn left">${m && (f.status === 'rencana' || f.status === 'berlangsung') ? `<button class="btn" data-jd="start">▶ ${f.status === 'berlangsung' ? 'Lanjutkan di layar' : 'Mulai pertemuan'}</button>` : ''}
            ${m && (f.status === 'berlangsung' || (f.status === 'rencana' && f.date <= t)) ? '<button class="btn ghost" data-jd="finish">⏹ Tandai selesai</button>' : ''}
            ${m && !sub && !f.subTeacher && (f.status === 'rencana' || f.status === 'berlangsung') ? '<button class="btn ghost sm" data-jd="hand">🤝 Serahkan ke rekan</button>' : ''}
            ${m && !sub && f.status === 'rencana' ? '<button class="btn ghost sm" data-jd="cancel">🚫 Batalkan (libur, rapat)</button>' : ''}
            ${m && !sub && f.status !== 'rencana' ? '<button class="btn ghost sm" data-jd="reopen">↩ Kembalikan ke rencana</button>' : ''}
            ${m && !sub && (f.status === 'rencana' || f.status === 'batal') ? '<button class="btn ghost sm danger" data-jd="del">🗑️ Hapus</button>' : ''}</div>
          ${hand ? `<div class="jd-hand">${hand === 'loading' ? D.loadingHTML : !hand.length ? '<p class="muted">Belum ada rekan guru lain di sekolah ini. Admin sekolah bisa menambahkan guru di 🏫 Sekolah → Kelola guru.</p>'
    : `<h3>🤝 Serahkan pertemuan ini ke rekan</h3><p class="small muted">Rekan Anda melihat pertemuan ini di jadwalnya, mendapat pengingat, dan bisa memulai serta menyelesaikannya. Kelas tetap milik Anda.</p>
            <div class="jd-grid"><label>Rekan guru<select name="jdsub">${hand.map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}</select></label>
              <label>Alasan<select name="jdwhy">${REASONS.map((r) => `<option>${r}</option>`).join('')}</select></label></div>
            <label class="jd-lbl">Pesan untuk rekan (boleh kosong)<input name="jdmsg" maxlength="140" placeholder="mis. Lanjut dari halaman 34, siswa sudah dibagi tim"></label>
            <div class="row-btn left"><button class="btn sm" data-jd="handsave">🤝 Serahkan</button><button class="btn ghost sm" data-jd="handclose">Batal</button></div>`}</div>` : ''}
          <div id="jd-finbox"></div></section>
        ${f.status === 'selesai' ? `<section class="card"><h2>📝 Ringkasan</h2><div class="jd-chips">${autoChips(f.summary || {})}<span>${(TUNTAS.find((x) => x[0] === (f.summary || {}).tuntas) || ['', 'Materi: –'])[1]}</span>${(f.summary || {}).via === 'manual' ? '<span>✍️ ditandai manual</span>' : ''}</div>${f.note ? `<p>${esc(f.note)}</p>` : ''}<p class="small muted">Selesai ${f.endedAt ? new Date(f.endedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</p></section>` : ''}
        ${prep.length && f.status !== 'selesai' ? `<section class="card"><h2>📋 Yang perlu disiapkan</h2><p class="small muted">Centang yang sudah siap. Metiq mengingatkan dua hari sebelumnya.</p>
          ${prep.map(([k, txt, link]) => `<label class="jd-prep"><input type="checkbox" data-jd="tick" data-k="${k}" ${ticks[k] ? 'checked' : ''}><span class="grow">${txt}</span>${link}</label>`).join('')}</section>` : ''}
        ${sub ? '' : `<section class="card"><h2>${m ? '✏️ Ubah pertemuan' : 'Isi pertemuan'}</h2><form class="jd-form" data-jd="form">
          <div class="jd-grid"><label>Date<input type="date" name="date" value="${f.date}" ${locked ? 'disabled' : ''} required></label>
            <label>Grade<select name="classId">${allCls.map((c) => `<option value="${c.id}" ${c.id === f.classId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
            <label>Level<select name="grade" data-jd="grade">${D.GRADES.map((g) => `<option value="${g.id}" ${g.id === grade ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
            <label>Chapter<select name="unit"><option value="">– Tanpa bab (pengulangan, ulangan) –</option>${D.unitsOf(grade).map((x) => `<option value="${x.id}" ${f.units[0] === x.id ? 'selected' : ''}>${x.icon} ${esc(x.id)}. ${esc(x.name)}</option>`).join('')}</select></label></div>
          <label>Judul (boleh kosong)<input name="title" value="${esc(f.title || '')}" maxlength="120" placeholder="mis. Ulangan harian bab 4"></label>
          <label>Catatan persiapan (hanya untuk Anda)<textarea name="prep" rows="2" maxlength="1000">${esc(f.prep || '')}</textarea></label>
          <button class="btn">${m ? '💾 Simpan perubahan' : '💾 Simpan pertemuan'}</button></form></section>`}`;
    };
    draw();
    box.onchange = (e) => {
      if (e.target.dataset.jd === 'grade') { grade = +e.target.value; const fd = new FormData(box.querySelector('form')); Object.assign(f, { classId: fd.get('classId'), title: fd.get('title'), prep: fd.get('prep'), units: [] }); if (fd.get('date')) f.date = fd.get('date'); return draw(); }
      if (e.target.dataset.jd === 'tick') { const k = 'metiq_prep_' + (m ? m.id : 'baru'); let o = {}; try { o = JSON.parse(localStorage.getItem(k)) || {}; } catch (er) { /* */ } o[e.target.dataset.k] = e.target.checked; try { localStorage.setItem(k, JSON.stringify(o)); } catch (er) { /* */ } }
    };
    box.onsubmit = async (e) => {
      e.preventDefault(); const fd = new FormData(e.target);
      const item = { id: m ? m.id : '', classId: fd.get('classId'), date: fd.get('date') || f.date, units: fd.get('unit') ? [fd.get('unit')] : [], title: (fd.get('title') || '').trim(), note: f.note || '', prep: (fd.get('prep') || '').trim() };
      if (!item.units.length && !item.title) return D.toast('Pilih bab, atau tulis judul pertemuan');
      try { const ids = await Meet.save([item]); D.toast('Tersimpan ✔'); refresh(ctx, true); if (m) detail(box, ctx, m.id); else D.go('#/guru/jadwal/' + ids[0]); } catch (er) { D.toast(esc(errMsg(er))); }
    };
    box.onclick = async (e) => {
      const b = e.target.closest('[data-jd]'); if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT' || b.tagName === 'FORM') return;
      const k = b.dataset.jd, run = async (p, msg) => { try { await p; D.toast(msg); refresh(ctx, true); detail(box, ctx, m.id); } catch (er) { D.toast(esc(errMsg(er))); } };
      if (k === 'back') return D.go('#/guru/jadwal');
      if (k === 'start') return startMeeting(m, ctx);
      if (k === 'cancel') { const why = prompt('Alasan dibatalkan (mis. libur nasional, rapat guru):', ''); if (why === null) return; return run(Meet.status(m.id, 'batal', null, why), 'Pertemuan dibatalkan'); }
      if (k === 'reopen') { if (!confirm('Kembalikan pertemuan ini ke rencana? Ringkasannya akan dihapus.')) return; return run(Meet.status(m.id, 'rencana', null, null), 'Dikembalikan ke rencana'); }
      if (k === 'del') { if (!confirm('Hapus pertemuan ini dari jadwal?')) return; try { await Meet.del([m.id]); D.toast('Dihapus'); refresh(ctx, true); D.go('#/guru/jadwal'); } catch (er) { D.toast(esc(errMsg(er))); } return; }
      if (k === 'finish') {
        const fb = box.querySelector('#jd-finbox');
        fb.innerHTML = `${finishHTML(null, f.note)}<div class="row-btn left"><button class="btn" data-jd="fsave">💾 Simpan</button><button class="btn ghost sm" data-jd="fclose">Batal</button></div>`; return;
      }
      if (k === 'fclose') { box.querySelector('#jd-finbox').innerHTML = ''; return; }
      if (k === 'hand') { hand = 'loading'; draw(); try { hand = await Meet.colleagues(); } catch (er) { hand = null; D.toast(esc(errMsg(er))); } return draw(); }
      if (k === 'handclose') { hand = null; return draw(); }
      if (k === 'handsave') {
        const hb = box.querySelector('.jd-hand'), tid = hb.querySelector('[name=jdsub]').value, why = hb.querySelector('[name=jdwhy]').value, msg = hb.querySelector('[name=jdmsg]').value.trim();
        return run(Meet.handover(m.id, tid, msg ? `${why}. ${msg}` : why), `Diserahkan ke ${(hand.find((t) => t.id === tid) || {}).name || 'rekan'} ✔`);
      }
      if (k === 'unhand') { if (!confirm('Batalkan penyerahan? Pertemuan kembali menjadi tanggung jawab Anda.')) return; return run(Meet.handover(m.id, '', ''), 'Penyerahan dibatalkan'); }
      if (k === 'fsave') { const r = readFinish(box.querySelector('#jd-finbox')); if (active() && active().id === m.id) setActive(null); return run(Meet.status(m.id, 'selesai', { tuntas: r.tuntas, via: 'manual' }, r.note), 'Pertemuan tercatat selesai ✔'); }
    };
  }

  /* ---------- Jadwal satu semester sekaligus ---------- */
  let W = null;
  function semesterEnd(s) { const d = parse(s); return d.getMonth() < 6 ? `${d.getFullYear()}-06-20` : `${d.getFullYear()}-12-18`; }
  function plan(w) {
    const dates = [], hol = new Set(w.hol.split(/[\s,;]+/).map(normDate).filter(Boolean));
    for (let s = w.from; s <= w.to && dates.length < 300; s = addDays(s, 1)) if (w.days.includes(parse(s).getDay()) && !hol.has(s)) dates.push(s);
    const units = D.unitsOf(w.grade).filter((u) => w.units.includes(u.id));
    const want = (u) => (w.per === 'auto' ? Math.min(4, Math.max(1, ((LES()[u.id] || {}).parts || []).length || 1)) : +w.per);
    let per = units.map(want), warn = '';
    if (per.reduce((a, b) => a + b, 0) > dates.length) { per = units.map(() => 1); warn = 'Tanggal tidak cukup, jadi setiap bab mendapat 1 pertemuan.'; }
    const items = []; units.forEach((u, i) => { for (let k = 0; k < per[i]; k++) items.push({ units: [u.id], title: per[i] > 1 ? `Bagian ${k + 1} dari ${per[i]}` : '' }); if (w.ulangan) items.push({ units: [u.id], title: `Ulangan: ${u.name}`, extra: true }); });
    // ulangan bab hanya bila tanggal masih cukup
    let list = items.filter((x) => !x.extra);
    if (w.ulangan) { const room = dates.length - list.length; let added = 0; list = []; items.forEach((x) => { if (!x.extra) list.push(x); else if (added < room) { list.push(x); added++; } }); }
    if (list.length > dates.length) { warn = `${list.length - dates.length} pertemuan tidak muat sampai tanggal selesai. Tambah hari mengajar atau kurangi bab.`; list = list.slice(0, dates.length); }
    const rest = dates.length - list.length;
    for (let k = 0; k < rest; k++) list.push({ units: [], title: k === rest - 1 ? 'Pengulangan dan persiapan ujian semester' : 'Pengulangan' });
    return { rows: list.map((x, i) => Object.assign({ date: dates[i] }, x)), dates: dates.length, need: units.length, warn };
  }
  function normDate(s) {
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s); if (m) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
    m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s); if (m) return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;
    return '';
  }
  function wizard(box, ctx) {
    const cls = myClasses(ctx);
    if (!W) { const g = D.getGrade(); W = { classes: [ctx.c.id], from: today(), to: semesterEnd(today()), days: [], hol: '', grade: g, units: D.unitsOf(g).map((u) => u.id), per: 'auto', ulangan: true }; }
    const draw = () => {
      const p = W.days.length && W.units.length ? plan(W) : null;
      box.innerHTML = `<button class="back link" data-jw="back">← Jadwal</button>
        <section class="card"><h2>🗓️ Jadwal satu semester</h2><p class="small muted">Pilih kelas, hari mengajar, dan bab. Metiq membagi bab ke tanggal-tanggal mengajar secara berurutan. Setelah tersimpan, setiap pertemuan masih bisa diubah, dibatalkan, atau dipindah.</p>
          <div class="jd-wz"><div><h3>1. Kelas</h3>${cls.map((c) => `<label class="ss-chk"><input type="checkbox" data-jw="cls" value="${c.id}" ${W.classes.includes(c.id) ? 'checked' : ''}> ${esc(c.name)}</label>`).join('')}<p class="small muted">Kelas dengan hari mengajar yang berbeda? Buat jadwalnya satu per satu.</p></div>
            <div><h3>2. Tanggal</h3><div class="jd-grid"><label>Start<input type="date" data-jw="from" value="${W.from}"></label><label>Done<input type="date" data-jw="to" value="${W.to}"></label></div>
              <p class="jd-q">Hari mengajar</p><div class="jd-days">${[1, 2, 3, 4, 5, 6].map((d) => `<label class="${W.days.includes(d) ? 'on' : ''}"><input type="checkbox" data-jw="day" value="${d}" ${W.days.includes(d) ? 'checked' : ''}>${HARI[d].slice(0, 3)}</label>`).join('')}</div>
              <label class="jd-lbl">Tanggal libur (boleh kosong, pisahkan dengan koma)<input data-jw="hol" value="${esc(W.hol)}" placeholder="mis. 25/12/2026, 1/1/2027"></label></div>
            <div><h3>3. Bab</h3><label class="jd-lbl">Level<select data-jw="grade">${D.GRADES.map((g) => `<option value="${g.id}" ${g.id === W.grade ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
              <div class="ss-sks">${D.unitsOf(W.grade).map((u) => `<label class="ss-chk"><input type="checkbox" data-jw="unit" value="${u.id}" ${W.units.includes(u.id) ? 'checked' : ''}> ${u.icon} <b>${esc(u.id)}</b> ${esc(u.name)}</label>`).join('')}</div>
              <label class="jd-lbl">Pertemuan per bab<select data-jw="per"><option value="auto" ${W.per === 'auto' ? 'selected' : ''}>Otomatis (sesuai banyak materi)</option>${[1, 2, 3, 4].map((n) => `<option value="${n}" ${W.per === String(n) ? 'selected' : ''}>${n} pertemuan</option>`).join('')}</select></label>
              <label class="ss-chk"><input type="checkbox" data-jw="ulangan" ${W.ulangan ? 'checked' : ''}> Tambahkan ulangan setelah setiap bab bila tanggalnya cukup</label></div></div></section>
        <section class="card"><h2>👀 Pratinjau</h2>${!W.days.length ? '<p class="muted">Pilih hari mengajar dulu.</p>' : !W.units.length ? '<p class="muted">Pilih minimal satu bab.</p>'
    : `<p><b>${p.rows.length}</b> pertemuan untuk <b>${W.classes.length}</b> kelas (${p.dates} tanggal mengajar).</p>${p.warn ? `<p class="jd-warn">⚠️ ${esc(p.warn)}</p>` : ''}
          <div class="jd-prev">${p.rows.map((r, i) => { const u = unitOf(r.units[0]); return `<div><span class="jd-n">${i + 1}</span><span class="jd-pd">${fmtD(r.date)}</span><span class="grow">${u ? `${u.icon} ${esc(u.name)}` : '🔁'} <small>${esc(r.title)}</small></span></div>`; }).join('')}</div>`}</section>
        <div class="ss-bfoot"><span class="grow">${p ? `${p.rows.length * W.classes.length} pertemuan akan dibuat` : ''}</span><button class="btn" data-jw="save" ${p && p.rows.length && W.classes.length ? '' : 'disabled'}>💾 Simpan jadwal</button></div>`;
    };
    draw();
    box.onchange = (e) => {
      const k = e.target.dataset.jw; if (!k) return;
      if (k === 'cls') W.classes = [...box.querySelectorAll('[data-jw=cls]:checked')].map((x) => x.value);
      if (k === 'from') { W.from = e.target.value || W.from; if (W.to < W.from) W.to = semesterEnd(W.from); }
      if (k === 'to') W.to = e.target.value || W.to;
      if (k === 'day') W.days = [...box.querySelectorAll('[data-jw=day]:checked')].map((x) => +x.value);
      if (k === 'hol') W.hol = e.target.value;
      if (k === 'grade') { W.grade = +e.target.value; W.units = D.unitsOf(W.grade).map((u) => u.id); }
      if (k === 'unit') W.units = [...box.querySelectorAll('[data-jw=unit]:checked')].map((x) => x.value);
      if (k === 'per') W.per = e.target.value;
      if (k === 'ulangan') W.ulangan = e.target.checked;
      if (diffDays(W.to, W.from) > 380) { W.to = addDays(W.from, 380); D.toast('Satu jadwal paling panjang sekitar satu tahun'); }
      draw();
    };
    box.onclick = async (e) => {
      const b = e.target.closest('[data-jw]'); if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT') return;
      if (b.dataset.jw === 'back') return D.go('#/guru/jadwal');
      if (b.dataset.jw === 'save') {
        const p = plan(W), items = W.classes.flatMap((cid) => p.rows.map((r) => ({ classId: cid, date: r.date, units: r.units, title: r.title, note: '', prep: '' })));
        if (items.length > 600) return D.toast('Terlalu banyak sekaligus. Simpan untuk lebih sedikit kelas.');
        b.disabled = true;
        try { await Meet.save(items); D.toast(`${items.length} pertemuan tersimpan ✔`); W = null; refresh(ctx, true); D.go('#/guru/jadwal'); } catch (er) { b.disabled = false; D.toast(esc(errMsg(er))); }
      }
    };
  }

  /* ---------- Laporan koordinator: semua guru di sekolah ---------- */
  const RP = [['7', '7 hari terakhir'], ['bulan', 'This month'], ['semester', 'Semester ini']];
  function range(k) {
    const t = today(), d = parse(t);
    if (k === '7') return [addDays(t, -6), t];
    if (k === 'bulan') return [`${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`, t];
    return [d.getMonth() < 6 ? `${d.getFullYear()}-01-01` : `${d.getFullYear()}-07-01`, t];
  }
  const RS = { per: 'semester', open: '' };
  async function schoolReport(el, ctx) {
    if (!el) return;
    el.innerHTML = D.loadingHTML;
    const [from, to] = range(RS.per);
    let list; try { list = await Meet.list(from, addDays(to, 7)); } catch (e) { el.innerHTML = `<section class="card"><p>${esc(errMsg(e))}</p></section>`; return; }
    if (!el.isConnected) return;
    const cmap = Object.fromEntries(ctx.classes.map((c) => [c.id, c]));
    list = list.filter((m) => cmap[m.classId]);
    const inRange = list.filter((m) => m.date <= to), t = today();
    const teachers = {};
    ctx.classes.forEach((c) => { const k = c.teacherId || '?'; (teachers[k] = teachers[k] || { name: c.teacherName || 'Teacher', classes: [], ms: [], next: [] }).classes.push(c); });
    inRange.forEach((m) => { const k = cmap[m.classId].teacherId || '?'; teachers[k].ms.push(m); });
    list.filter((m) => m.date > to).forEach((m) => { const k = cmap[m.classId].teacherId || '?'; teachers[k].next.push(m); });
    const rows = Object.entries(teachers).map(([id, x]) => Object.assign({ id }, x, { st: stats(x.ms), late: x.ms.filter((m) => m.status === 'selesai' && m.endedAt && iso(new Date(m.endedAt)) > m.date).length }))
      .sort((a, b) => (a.ms.length ? 0 : 1) - (b.ms.length ? 0 : 1) || (a.st.pct ?? 101) - (b.st.pct ?? 101));
    const tot = stats(inRange);
    el.innerHTML = `<section class="card"><div class="rhead"><h2>📅 Pertemuan guru</h2><span class="grow"></span><button class="btn ghost sm" data-jr="csv">⬇️ Download CSV</button></div>
        <p class="small infonote">ℹ️ Keterlaksanaan jadwal mengajar matematika: berapa pertemuan yang direncanakan sudah dilaksanakan dan ditandai selesai oleh guru. Gunakan untuk pendampingan, bukan satu-satunya dasar penilaian kinerja. Pertemuan yang dibatalkan (libur, rapat) tidak dihitung terlewat.</p>
        <div class="vzpills">${RP.map(([k, l]) => `<button class="${RS.per === k ? 'on' : ''}" data-jr="per" data-v="${k}">${l}</button>`).join('')}</div>
        <div class="jd-stats"><div><b>${tot.pct == null ? '–' : tot.pct + '%'}</b><span>keterlaksanaan</span></div><div><b>${tot.done}<small>/${tot.due}</small></b><span>pertemuan selesai</span></div><div class="${tot.missed ? 'warn' : ''}"><b>${tot.missed}</b><span>terlewat</span></div><div><b>${tot.tuntas}</b><span>materi tuntas</span></div></div>
        <div class="tscroll"><table class="tbl jd-rep"><thead><tr><th>Teacher</th><th>Grade</th><th>Keterlaksanaan</th><th>Done</th><th>Terlewat</th><th>Dibatalkan</th><th>Digantikan rekan</th><th>Materi tuntas</th><th>7 hari ke depan</th><th></th></tr></thead><tbody>
        ${rows.map((r) => `<tr class="${r.ms.length ? '' : 'muted'}"><td><b>${esc(r.name)}</b></td><td>${r.classes.map((c) => esc(c.name)).join(', ')}</td>
          <td>${r.ms.length ? `<span class="ss-bar"><i class="${r.st.pct >= 90 ? 'g' : r.st.pct >= 70 ? 'y' : 'r'}" style="width:${r.st.pct || 0}%"></i></span> <b>${r.st.pct == null ? '–' : r.st.pct + '%'}</b>` : '<small>Belum membuat jadwal</small>'}</td>
          <td>${r.st.done}/${r.st.due}${r.late ? ` <small class="muted">(${r.late} ditandai belakangan)</small>` : ''}</td><td>${r.st.missed ? `<b class="jd-bad">${r.st.missed}</b>` : 0}</td><td>${r.st.off}</td><td>${r.ms.filter((m) => m.subTeacher).length}</td><td>${r.st.tuntas}</td><td>${r.next.length}</td>
          <td>${r.ms.length ? `<button class="btn ghost xs" data-jr="open" data-id="${esc(r.id)}">${RS.open === r.id ? 'Close' : 'Rincian'}</button>` : ''}</td></tr>
          ${RS.open === r.id ? `<tr class="jd-detail"><td colspan="10">${r.ms.slice().reverse().map((m) => `<div class="jd-drow"><span class="jd-pd">${fmtD(m.date)}</span><span>${esc(cmap[m.classId].name)}</span><span class="grow">${unitTxt(m)}${m.title && (m.units || []).length ? ` <small>${esc(m.title)}</small>` : ''}${m.subTeacher ? `<small class="jd-sub">🤝 digantikan ${esc(m.subTeacherName || '')}${m.subReason ? ' · ' + esc(m.subReason) : ''}</small>` : ''}${m.note ? `<small class="jd-note">📝 ${esc(m.note)}</small>` : ''}</span>
            ${m.status === 'selesai' ? `<span class="jd-chips sm">${m.summary && m.summary.tuntas ? `<span>${(TUNTAS.find((x) => x[0] === m.summary.tuntas) || ['', ''])[1]}</span>` : ''}${m.summary && m.summary.mins ? `<span>⏱️ ${m.summary.mins} mnt</span>` : ''}${m.summary && m.summary.via === 'layar' ? '<span>📺 di layar</span>' : ''}</span>` : ''}${statPill(m)}</div>`).join('')}</td></tr>` : ''}`).join('')}
        </tbody></table></div></section>`;
    el.onclick = (e) => {
      const b = e.target.closest('[data-jr]'); if (!b) return;
      if (b.dataset.jr === 'per') { RS.per = b.dataset.v; return schoolReport(el, ctx); }
      if (b.dataset.jr === 'open') { RS.open = RS.open === b.dataset.id ? '' : b.dataset.id; return schoolReport(el, ctx); }
      if (b.dataset.jr === 'csv') {
        const out = [['tanggal', 'guru', 'kelas', 'bab', 'judul', 'status', 'materi', 'minutes', 'cara', 'diajar_oleh', 'pengganti', 'alasan_pengganti', 'catatan']];
        inRange.forEach((m) => { const c = cmap[m.classId], late = m.status === 'rencana' && m.date < t; out.push([m.date, c.teacherName || '', c.name, (m.units || []).map((u) => (unitOf(u) || {}).name || u).join('; '), m.title || '', late ? 'terlewat' : m.status, (m.summary || {}).tuntas || '', (m.summary || {}).mins || '', (m.summary || {}).via || '', m.taughtByName || '', m.subTeacherName || '', m.subReason || '', m.note || '']); });
        const body = out.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + body], { type: 'text/csv' })); a.download = `pertemuan-guru-${from}-${to}.csv`; document.body.appendChild(a); a.click(); a.remove();
      }
    };
  }

  function init(deps) { D = deps; }
  window.METIQ_JADWAL = { init, teacherPage, schoolReport, remindCard, reminders, refresh, finishFromClass, active, setActive, _Meet: Meet, _plan: plan };
})();
