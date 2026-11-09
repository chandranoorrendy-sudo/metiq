// node tools/i18n/merge.js <berkas.js> <batch.txt> : gabungkan terjemahan "N<TAB>teks" ke en.json. "=" artinya biarkan apa adanya.
const fs = require('fs'), path = require('path');
process.chdir(path.join(__dirname, '..', '..'));
const [, , file0, batch] = process.argv;
let file = file0, todo = file0 === '-' ? [] : JSON.parse(fs.readFileSync(`tools/i18n/todo/${file0}.json`, 'utf8'));
const dictPath = 'tools/i18n/en.json', dict = fs.existsSync(dictPath) ? JSON.parse(fs.readFileSync(dictPath, 'utf8')) : {};
const marks = (s) => (s.match(/⟦\w+⟧/g) || []).sort().join('');
const tags = (s) => (s.match(/<\/?[a-zA-Z]+/g) || []).sort().join('');
let ok = 0, bad = 0;
for (const line of fs.readFileSync(batch, 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue;
  if (line.startsWith('@@ ')) { file = line.slice(3).trim(); todo = JSON.parse(fs.readFileSync(`tools/i18n/todo/${file}.json`, 'utf8')); continue; }
  const i = line.indexOf('\t'); if (i < 0) { console.log('NO TAB', line.slice(0, 60)); bad++; continue; }
  const n = +line.slice(0, i), en = line.slice(i + 1), k = todo[n];
  if (k === undefined) { console.log('NO INDEX', file, n); bad++; continue; }
  if (en === '=') { dict[k] = k; ok++; continue; }
  if (marks(k) !== marks(en)) { console.log('MARK', file, n, k.slice(0, 70), '=>', en.slice(0, 70)); bad++; continue; }
  if (tags(k) !== tags(en)) { console.log('TAG', file, n, k.slice(0, 70), '=>', en.slice(0, 70)); bad++; continue; }
  dict[k] = en; ok++;
}
fs.writeFileSync(dictPath, JSON.stringify(dict, null, 0));
console.log('merged', ok, 'bad', bad, 'dict', Object.keys(dict).length);
