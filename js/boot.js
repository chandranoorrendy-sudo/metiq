// Pemuat aplikasi. Bahasa dipilih sebelum aplikasi dimuat: ID memakai js/, EN memakai salinan js/en/ hasil tools/i18n/build.js.
// Sengaja berupa berkas terpisah (bukan skrip di index.html) supaya Content-Security-Policy bisa melarang semua skrip inline.
// Nomor versi (?v=) diambil dari alamat berkas ini di index.html, jadi cukup ganti nomornya di index.html.
(function () {
  var me = document.currentScript, v = ((me && me.src.match(/[?&]v=(\d+)/)) || [])[1] || '0';
  var q = /[?&]lang=(en|id)\b/.exec(location.search), L = q && q[1];
  try { if (L) localStorage.setItem('metiq_lang', L); else L = localStorage.getItem('metiq_lang'); } catch (e) {}
  var en = L === 'en'; window.METIQ_LANG = en ? 'en' : 'id';
  if (en) {
    document.documentElement.lang = 'en'; document.title = 'Metiq — Math from Pre-K to High School';
    document.querySelector('meta[name=description]').content = 'Metiq — math practice from Pre-K through Calculus, with a teacher dashboard and parent reports.';
  }
  var plain = { config: 1, cloud: 1, sound: 1, avatars: 1, mascot: 1, 'jobs-vis': 1 };
  ['config', 'curriculum', 'kolom', 'pola', 'grade2', 'kit-upper', 'grade3', 'grade4', 'grade5', 'grade6', 'kit-hs', 'grade0', 'stories-tk', 'grade7', 'grade8', 'algebra1', 'geometry', 'algebra2', 'precalculus', 'calculus', 'pola-hs', 'olimpiade', 'iman-units', 'lessons-a', 'lessons-b', 'lessons-iman', 'avatars', 'sound', 'manual', 'games', 'jobs-vis', 'jobs', 'jobs-real', 'anim', 'store', 'cloud', 'iman', 'album', 'mascot', 'mascot-friends', 'en-fix', 'jadwal', 'sesi', 'kelas', 'app'].forEach(function (f) {
    if (f === 'en-fix' && !en) return;
    document.write('<script src="js/' + (en && !plain[f] ? 'en/' : '') + f + '.js?v=' + v + '"><\/script>');
  });
  // Mode offline (sw.js): hanya di https atau localhost
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
