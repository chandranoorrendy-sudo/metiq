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
  // Mode bintang server: angka bintang tidak lagi dikirim dari perangkat, hanya klaim putaran.
  const SRV = !!cfg.starsServer;
  const isStarKey = (k) => /^(x|u|g):/.test(k);

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
      const box = outbox[sid] = outbox[sid] || { code, answers: [], progress: {}, claims: [] };
      box.code = code;
      box.answers.push(answer);
      box.progress[answer.skill] = progress;
      saveOut();
      clearTimeout(flushTimer);
      flushTimer = setTimeout(Cloud.flush, 1500);
    },

    queueProgress(sid, code, key, progress) {
      if (SRV && isStarKey(key)) return;
      const box = outbox[sid] = outbox[sid] || { code, answers: [], progress: {}, claims: [] };
      box.code = code; box.progress[key] = progress;
      saveOut(); clearTimeout(flushTimer); flushTimer = setTimeout(Cloud.flush, 1500);
    },
    // Klaim satu putaran (latihan, ujian bab, atau permainan). Server yang memutuskan bintangnya.
    queueClaim(sid, code, claim) {
      if (!SRV || !claim || !claim.id) return;
      const box = outbox[sid] = outbox[sid] || { code, answers: [], progress: {}, claims: [] };
      box.claims = box.claims || [];
      if (!box.claims.some((c) => c.id === claim.id)) box.claims.push(claim);
      box.code = code;
      saveOut(); clearTimeout(flushTimer); flushTimer = setTimeout(Cloud.flush, 1500);
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
          const claims = (box.claims || []).slice(0, 50);
          if (!batch.length && !Object.keys(prog).length && !claims.length) { delete outbox[sid]; continue; }
          try {
            const args = { p_code: box.code, p_student_id: sid, p_answers: batch, p_progress: prog };
            if (SRV) { args.p_claims = claims; args.p_server = true; }
            const out = await Cloud.rpc('student_sync', args);
            // Angka bintang resmi dari server menggantikan angka di perangkat.
            if (out && out.progress && window.Store) {
              window.Store.applySync(sid, out.progress);
              window.dispatchEvent(new CustomEvent('metiq:sync', { detail: { sid } }));
            }
          } catch (e) {
            // siswa sudah dihapus guru atau kode kelas berubah: data tidak bisa dikirim lagi
            if (e.status === 400 && /tidak ditemukan/.test(e.message)) { delete outbox[sid]; continue; }
            throw e;
          }
          const sent = new Set(batch.map((a) => a.id));
          box.answers = box.answers.filter((a) => !sent.has(a.id));
          Object.keys(prog).forEach((k) => { if (JSON.stringify(box.progress[k]) === JSON.stringify(prog[k])) delete box.progress[k]; });
          if (claims.length) { const cs = new Set(claims.map((c) => c.id)); box.claims = (box.claims || []).filter((c) => !cs.has(c.id)); }
          if (!box.answers.length && !Object.keys(box.progress).length && !(box.claims || []).length) delete outbox[sid];
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

  // Metiq pindah ke Vercel: alamat lama di GitHub Pages diarahkan ke alamat baru,
  // setelah jawaban yang masih tersimpan di perangkat terkirim ke server.
  const NEW_HOME = 'https://metiq-math.vercel.app/';
  if (location.hostname.endsWith('github.io')) {
    const move = () => location.replace(NEW_HOME + location.hash);
    // selama masih ada jawaban yang belum terkirim (mis. sedang offline), tetap di sini dan coba lagi
    const tryMove = async () => {
      if (Cloud.enabled && Object.keys(outbox).length) await Cloud.flush();
      if (!Cloud.enabled || !Object.keys(outbox).length) move(); else setTimeout(tryMove, 5000);
    };
    tryMove();
  }
})();
