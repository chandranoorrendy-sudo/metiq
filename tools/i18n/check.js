// node tools/i18n/check.js : bandingkan bundel ID dan EN. Angka harus sama, teks EN tidak boleh menyisakan bahasa Indonesia.
const fs = require('fs'), path = require('path'), vm = require('vm');
process.chdir(path.join(__dirname, '..', '..'));
const LOAD = ['curriculum', 'kolom', 'pola', 'grade2', 'kit-upper', 'grade3', 'grade4', 'grade5', 'grade6', 'kit-hs', 'grade0', 'stories-tk', 'grade7', 'grade8', 'algebra1', 'geometry', 'algebra2', 'precalculus', 'calculus', 'pola-hs', 'olimpiade', 'iman-units', 'lessons-a', 'lessons-b', 'lessons-iman', 'jobs-vis', 'jobs', 'jobs-real'];
function bundle(dir) {
  let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const M = Object.create(Math); M.random = rnd;
  const ctx = { console, Math: M, setTimeout() {}, Intl };
  ctx.window = ctx; ctx.document = { createElement: () => ({}), addEventListener() {}, documentElement: {} }; vm.createContext(ctx);
  for (const f of LOAD) { const p = (dir === 'en' && f !== 'jobs-vis' ? 'js/en/' : 'js/') + f + '.js'; try { vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: p }); } catch (e) { console.log('LOAD', p, e.message); } }
  if (dir === 'en') vm.runInContext(fs.readFileSync('js/en/en-fix.js', 'utf8'), ctx);
  return { ctx, reseed: (s) => { seed = s; } };
}
const id = bundle('id'), en = bundle('en');
const ST = /\b(yang|dan|dari|berapa|adalah|dengan|untuk|ini|jadi|tidak|bilangan|soal|jawaban|hasilnya|sama|lebih|kurang|setiap|ada|punya|dibagi|maka|atau|nilai|buah|anak|hari|jam)\b/i;
const strip = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ');
const numsOf = (s) => (strip(s).replace(/:/g, '.').replace(/(\d)[.,](?=\d{3}\b)/g, '$1').replace(/,/g, '.').match(/\d+(?:\.\d+)?/g) || []).join(' ');
const issues = {}; const add = (t, m) => { (issues[t] = issues[t] || []).push(m); };
const SKILLS = (b) => { const C = b.ctx.METIQ_CURRICULUM, out = []; const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (typeof o.gen === 'function' && o.id) out.push(o); else for (const k of Object.keys(o)) { if (k === 'kit') continue; walk(o[k]); } } }; walk(C.UNITS); return out; };
const a = SKILLS(id), b = SKILLS(en), mapA = new Map(a.map((s) => [s.id, s]));
console.log('skills id', a.length, 'en', b.length);
let n = 0;
for (const s of b) {
  const p = mapA.get(s.id); if (!p) { add('missing', s.id); continue; }
  for (let i = 0; i < 40; i++) {
    n++;
    let qe, qi;
    try { en.reseed(1000 + i * 37); qe = s.gen(); id.reseed(1000 + i * 37); qi = p.gen(); } catch (e) { add('throw', s.id + ' ' + e.message); break; }
    if (qe.type !== qi.type) add('type', s.id);
    if (qe.type === 'choice' && !qe.options.includes(qe.answer)) add('ans-not-in-options', s.id + ' ' + qe.answer + ' | ' + qe.options);
    if (qe.options && new Set(qe.options).size !== qe.options.length) add('dup-options', s.id + ' ' + qe.options);
    const blob = [qe.text, qe.explain, qe.answer, ...(qe.options || [])].map(strip).join(' | ');
    if (/undefined|NaN|⟦/.test(blob)) add('undef', s.id + ' ' + blob.slice(0, 120));
    if (ST.test(blob)) { const m = blob.match(ST); add('indo', s.id + ' [' + m[0] + '] ' + blob.slice(Math.max(0, m.index - 30), m.index + 30)); }
    if (/\d,\d{1,2}(?!\d)/.test(String(qe.answer)) || /\d,\d{1,2}(?!\d)/.test(strip(qe.text))) add('comma-decimal', s.id + ' ' + qe.answer + ' | ' + strip(qe.text).slice(0, 70));
    const mPl = strip(qe.text).match(/\b1 [a-z]+s\b/); if (mPl && !/\b1 (class|glass|bus|dress|is|comes|was|has|plus|minus)\b/.test(mPl[0])) add('plural-1', s.id + ' ' + mPl[0]);
    if (numsOf(qe.answer) !== numsOf(qi.answer)) add('answer-number', s.id + ' EN ' + qe.answer + ' ID ' + qi.answer);
  }
}
for (const c of ['id', 'en']) { const J = (c === 'id' ? id : en).ctx.METIQ_JOBS; if (J) console.log(c, 'jobs', J.MISSIONS.length); }
const Ji = id.ctx.METIQ_JOBS, Je = en.ctx.METIQ_JOBS;
Je.MISSIONS.forEach((m, i) => m.steps.forEach((s, k) => { const o = Ji.MISSIONS[i].steps[k]; const blob = [s.question, s.hint, s.explanation, ...(s.options || [])].map(strip).join(' | '); if (ST.test(blob)) { const q = blob.match(ST); add('indo-job', m.id + '#' + (k + 1) + ' [' + q[0] + '] ' + blob.slice(Math.max(0, q.index - 30), q.index + 30)); } if (s.type !== o.type) add('job-type', m.id); if (s.type === 'choice') { if (!s.options.includes(s.answer)) add('job-ans', m.id + '#' + (k + 1) + ' ' + s.answer); if (s.options.indexOf(s.answer) !== o.options.indexOf(o.answer)) add('job-ans-pos', m.id + '#' + (k + 1)); } else if (s.type === 'number' && s.answer !== o.answer) add('job-num', m.id + '#' + (k + 1)); }));
console.log('generated', n, 'questions');
for (const t of Object.keys(issues).sort()) { const u = [...new Set(issues[t])]; console.log('\n##', t, u.length); u.slice(0, 40).forEach((x) => console.log('  ' + x.slice(0, 170))); }
