// node tools/i18n/show.js <berkas.js> <jumlah> : cetak antrean terjemahan "N<TAB>teks"
const fs = require('fs'), path = require('path');
process.chdir(path.join(__dirname, '..', '..'));
const [, , file, n] = process.argv, todo = JSON.parse(fs.readFileSync(`tools/i18n/todo/${file}.json`, 'utf8'));
console.log(`# ${file}: ${todo.length} tersisa`);
todo.slice(0, +n).forEach((t, i) => console.log(i + '\t' + t));
