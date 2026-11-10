/* Metiq — service worker: Metiq tetap terbuka saat internet putus (dibutuhkan juga untuk aplikasi Play Store).
 * - Halaman (index.html): ambil dari internet dulu supaya pembaruan langsung terlihat; jika gagal, pakai salinan terakhir,
 *   dan jika belum ada salinan, tampilkan offline.html.
 * - Berkas bernomor versi (?v=…), ikon, dan rekaman suara: pakai salinan jika ada, jika belum ada ambil lalu simpan.
 *   Versi lama dari berkas yang sama dihapus agar penyimpanan tidak membengkak.
 * - Permintaan ke server lain (Supabase, Google) dan selain GET tidak pernah disimpan.
 */
const CACHE = 'metiq-v1';
const CORE = ['./', 'index.html', 'offline.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// simpan satu berkas dan buang versi lain dari berkas yang sama
async function keep(req, res) {
  const c = await caches.open(CACHE), url = new URL(req.url);
  await c.put(req, res);
  if (!url.search) return;
  for (const k of await c.keys()) { const u = new URL(k.url); if (u.pathname === url.pathname && u.search !== url.search) c.delete(k); }
}

self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;
  // halaman: internet dulu
  if (req.mode === 'navigate') {
    const home = url.pathname === '/' || url.pathname.endsWith('/index.html');
    e.respondWith(fetch(req).then((res) => { if (res.ok && home) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('index.html', copy)); } return res; })
      .catch(async () => (await caches.match('index.html')) || (await caches.match('offline.html')) || Response.error()));
    return;
  }
  // berkas aplikasi: salinan dulu
  if (/\.(js|css|png|svg|webp|jpg|mp3|webmanifest|woff2?)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok && res.type === 'basic') keep(req, res.clone()); return res; })));
  }
});
