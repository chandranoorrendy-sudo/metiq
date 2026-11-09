// node tools/i18n/extract.js : tulis tools/i18n/todo/<berkas>.json berisi teks yang belum punya terjemahan
const fs = require('fs'), path = require('path'), { extract } = require('./lib'), patches = require('./patches');
process.chdir(path.join(__dirname, '..', '..'));
const SKIP = new Set(['config.js', 'cloud.js', 'sound.js', 'avatars.js', 'mascot.js', 'jobs-vis.js']);
const dict = fs.existsSync('tools/i18n/en.json') ? JSON.parse(fs.readFileSync('tools/i18n/en.json', 'utf8')) : {};
fs.mkdirSync('tools/i18n/todo', { recursive: true });
const seen = new Set(); let total = 0, chars = 0; const rows = [];
for (const f of fs.readdirSync('js').filter((x) => x.endsWith('.js') && !SKIP.has(x))) {
  let src = fs.readFileSync('js/' + f, 'utf8').replace(/\r\n/g, '\n');
  for (const [file, find, rep] of patches.exact) if (file === f && src.includes(find)) src = src.split(find).join(rep);
  const list = extract(src), todo = [];
  for (const k of list) { if (seen.has(k) || dict[k] !== undefined) continue; seen.add(k); todo.push(k); }
  fs.writeFileSync(`tools/i18n/todo/${f}.json`, JSON.stringify(todo, null, 0));
  const c = todo.reduce((a, x) => a + x.length, 0); total += todo.length; chars += c; rows.push([todo.length, c, f]);
}
rows.sort((a, b) => a[0] - b[0]).forEach((r) => console.log(String(r[0]).padStart(6), String(r[1]).padStart(8), r[2]));
console.log('UNIK BELUM DITERJEMAHKAN', total, 'karakter', chars);
