/* Metiq — sinkronisasi ke Supabase lewat fungsi RPC.
 * Jawaban siswa disimpan dulu di kotak keluar (outbox) di perangkat, lalu dikirim ke server.
 * Jika internet putus, jawaban tetap aman dan terkirim otomatis saat kembali online.
 */
(function () {
  const cfg = window.METIQ_CONFIG || {};
  const OUT = 'metiq_outbox';
  let outbox;
  try { outbox = JSON.parse(localStorage.getItem(OUT)) || {}; } catch (e) { outbox = {}; }
  const saveOut = () => { try { localStorage.setItem(OUT, JSON.stringify(outbox)); } catch (e) {} };
  let flushTimer = null, flushing = false;

  const Cloud = {
    enabled: !!(cfg.supabaseUrl && cfg.supabaseKey),

    async rpc(fn, args = {}) {
      const headers = { 'Content-Type': 'application/json', apikey: cfg.supabaseKey };
      if (cfg.supabaseKey.startsWith('eyJ')) headers.Authorization = 'Bearer ' + cfg.supabaseKey;
      const res = await fetch(`${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args) });
      const txt = await res.text();
      let data = null;
      try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = txt; }
      if (!res.ok) { const err = new Error((data && data.message) || 'Gagal terhubung ke server'); err.status = res.status; throw err; }
      return data;
    },

    queue(sid, code, answer, progress) {
      const box = outbox[sid] = outbox[sid] || { code, answers: [], progress: {} };
      box.code = code;
      box.answers.push(answer);
      box.progress[answer.skill] = progress;
      saveOut();
      clearTimeout(flushTimer);
      flushTimer = setTimeout(Cloud.flush, 1500);
    },

    pending(sid) { return outbox[sid] || null; },
    pendingCount(sid) { return outbox[sid] ? outbox[sid].answers.length : 0; },

    async flush() {
      if (flushing || !Cloud.enabled) return;
      flushing = true;
      try {
        for (const [sid, box] of Object.entries(outbox)) {
          const batch = box.answers.slice(0, 300);
          const prog = JSON.parse(JSON.stringify(box.progress));
          if (!batch.length && !Object.keys(prog).length) { delete outbox[sid]; continue; }
          try {
            await Cloud.rpc('student_sync', { p_code: box.code, p_student_id: sid, p_answers: batch, p_progress: prog });
          } catch (e) {
            // siswa sudah dihapus guru atau kode kelas berubah: data tidak bisa dikirim lagi
            if (e.status === 400 && /tidak ditemukan/.test(e.message)) { delete outbox[sid]; continue; }
            throw e;
          }
          const sent = new Set(batch.map((a) => a.id));
          box.answers = box.answers.filter((a) => !sent.has(a.id));
          Object.keys(prog).forEach((k) => { if (JSON.stringify(box.progress[k]) === JSON.stringify(prog[k])) delete box.progress[k]; });
          if (!box.answers.length && !Object.keys(box.progress).length) delete outbox[sid];
          saveOut();
        }
      } catch (e) {
        clearTimeout(flushTimer);
        flushTimer = setTimeout(Cloud.flush, 15000);
      } finally { flushing = false; saveOut(); }
    },
  };

  window.addEventListener('online', () => Cloud.flush());
  if (Cloud.enabled) setTimeout(Cloud.flush, 2000);
  window.Cloud = Cloud;
})();
