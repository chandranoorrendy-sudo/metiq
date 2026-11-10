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

    // token: sesi Google orang tua (sekali pakai), untuk fungsi parent_google_* dari SQL 027
    async rpc(fn, args = {}, token) {
      const headers = { 'Content-Type': 'application/json', apikey: cfg.supabaseKey };
      if (token) headers.Authorization = 'Bearer ' + token;
      else if (cfg.supabaseKey.startsWith('eyJ')) headers.Authorization = 'Bearer ' + cfg.supabaseKey;
      const res = await fetch(`${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args) });
      const txt = await res.text();
      let data = null;
      try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = txt; }
      if (!res.ok) { const err = new Error((data && data.message) || (window.METIQ_LANG === 'en' ? 'Could not connect to the server' : 'Gagal terhubung ke server')); err.status = res.status; throw err; }
      // Sejak SQL 026, kode atau kata sandi yang salah dikembalikan sebagai {"error": "..."} agar percobaannya tetap tercatat
      if (data && typeof data === 'object' && !Array.isArray(data) && typeof data.error === 'string' && Object.keys(data).length === 1) { const err = new Error(data.error); err.status = 400; throw err; }
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

  /* Masuk dengan Google untuk orang tua: tombol resmi Google (Google Identity Services) di metiqmath.com.
   * Google memberi token identitas lewat jendela kecil di atas halaman ini (tanpa pindah ke alamat Supabase), lalu token itu
   * ditukar di Supabase Auth (grant_type=id_token) menjadi token sesi. Token sesi dipakai untuk satu permintaan lalu dibuang,
   * jadi sesi orang tua tidak tertinggal di HP anak. */
  const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
  const base = () => cfg.supabaseUrl.replace(/\/$/, '');
  let gsiLoad = null;
  Cloud.google = {
    // apakah login Google sudah diaktifkan di Supabase (dibaca dari pengaturan publik, disimpan selama sesi)
    async enabled() {
      if (!Cloud.enabled || !cfg.googleClientId) return false;
      const k = 'metiq_g_on'; const c = sessionStorage.getItem(k); if (c) return c === '1';
      try { const r = await fetch(`${base()}/auth/v1/settings`, { headers: { apikey: cfg.supabaseKey } }); const j = await r.json(); const on = !!(j.external && j.external.google); sessionStorage.setItem(k, on ? '1' : '0'); return on; } catch (e) { return false; }
    },
    // apakah SQL 027 sudah dijalankan (fungsi ada, tetapi menolak pemanggil tanpa sesi Google)
    async ready() {
      const k = 'metiq_g_sql'; const c = sessionStorage.getItem(k); if (c) return c === '1';
      try { await Cloud.rpc('parent_google_kids'); sessionStorage.setItem(k, '1'); return true; } catch (e) { const ok = e.status === 401 || e.status === 403 || (e.status === 400 && /Google/.test(e.message)); if (e.status) sessionStorage.setItem(k, ok ? '1' : '0'); return ok; }
    },
    load() {
      if (window.google && window.google.accounts && window.google.accounts.id) return Promise.resolve();
      if (!gsiLoad) gsiLoad = new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true; sc.onload = res; sc.onerror = () => { gsiLoad = null; rej(new Error('offline')); }; document.head.appendChild(sc); });
      return gsiLoad;
    },
    // pasang tombol Google resmi di el; onToken(tokenSesi) dipanggil sesudah orang tua berhasil masuk
    async mount(el, onToken, onError) {
      await Cloud.google.load();
      const raw = new Uint8Array(24); crypto.getRandomValues(raw);
      const nonce = b64url(raw), hashed = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(nonce)));
      window.google.accounts.id.initialize({
        client_id: cfg.googleClientId, nonce: hashed, ux_mode: 'popup', itp_support: true, auto_select: false,
        callback: async (resp) => {
          try {
            const r = await fetch(`${base()}/auth/v1/token?grant_type=id_token`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: cfg.supabaseKey }, body: JSON.stringify({ provider: 'google', id_token: resp.credential, nonce }) });
            const j = await r.json();
            if (!r.ok || !j.access_token) throw Object.assign(new Error(j.error_description || j.msg || 'Gagal masuk dengan Google'), { status: r.status || 400 });
            onToken(j.access_token);
          } catch (e) { onError(e); }
        },
      });
      el.innerHTML = '';
      window.google.accounts.id.renderButton(el, { type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'left', width: Math.max(220, Math.min(360, el.clientWidth || 320)), locale: window.METIQ_LANG === 'en' ? 'en' : 'id' });
    },
  };

  window.addEventListener('online', () => Cloud.flush());
  if (Cloud.enabled) setTimeout(Cloud.flush, 2000);
  window.Cloud = Cloud;

  // Metiq pindah ke metiqmath.com: alamat lama (GitHub Pages dan metiq-math.vercel.app)
  // diarahkan ke alamat baru, setelah jawaban yang masih tersimpan di perangkat terkirim ke server.
  const NEW_HOME = 'https://metiqmath.com/';
  if (location.hostname.endsWith('github.io') || location.hostname === 'metiq-math.vercel.app') {
    const move = () => location.replace(NEW_HOME + location.search + location.hash);
    // selama masih ada jawaban yang belum terkirim (mis. sedang offline), tetap di sini dan coba lagi
    const tryMove = async () => {
      if (Cloud.enabled && Object.keys(outbox).length) await Cloud.flush();
      if (!Cloud.enabled || !Object.keys(outbox).length) move(); else setTimeout(tryMove, 5000);
    };
    tryMove();
  }
})();
