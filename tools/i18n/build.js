// node tools/i18n/build.js : tulis js/en/*.js dari js/*.js + en.json + patches.js. Jalankan setiap kali sumber berubah.
const fs = require('fs'), path = require('path'), cp = require('child_process'), { apply } = require('./lib');
process.chdir(path.join(__dirname, '..', '..'));
const SKIP = new Set(['config.js', 'cloud.js', 'sound.js', 'avatars.js', 'mascot.js', 'jobs-vis.js', 'boot.js']);
const raw = JSON.parse(fs.readFileSync('tools/i18n/en.json', 'utf8')), dict = {}; for (const k in raw) if (raw[k] !== k) dict[k] = raw[k];
const patches = require('./patches');
fs.mkdirSync('js/en', { recursive: true });
let fail = 0, nFiles = 0;
for (const f of fs.readdirSync('js').filter((x) => x.endsWith('.js') && !SKIP.has(x))) {
  let src = fs.readFileSync('js/' + f, 'utf8').replace(/\r\n/g, '\n');
  // patch diterapkan pada sumber lebih dulu agar teksnya ikut pengganti; anchor hilang berarti kode asli berubah dan harus ditinjau
  for (const [file, find, rep] of patches.exact) if (file === f) { if (!src.includes(find)) { console.log('ANCHOR HILANG', f, find.slice(0, 70)); fail++; } else src = src.split(find).join(rep); }
  for (const [re, rep] of patches.all) src = src.replace(re, rep);
  const out = '/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */\n' + apply(src, dict).code;
  fs.writeFileSync('js/en/' + f, out); nFiles++;
  try { cp.execFileSync(process.execPath, ['--check', 'js/en/' + f], { stdio: 'pipe' }); } catch (e) { console.log('SINTAKS RUSAK', f, String(e.stderr).split('\n').slice(0, 5).join(' / ').slice(0, 400)); fail++; }
}
fs.copyFileSync('tools/i18n/en-fix.js', 'js/en/en-fix.js');
console.log('built', nFiles, 'files; dict', Object.keys(raw).length, 'fail', fail);
process.exit(fail ? 1 : 0);
