// Inti alat terjemahan: menemukan teks yang tampil di sumber JS, lalu menulis salinan berbahasa Inggris.
// Hanya potongan teks yang diganti; kode, rumus, dan pembangkit angka tidak disentuh.
const acorn = require('acorn'), walk = require('acorn-walk');

const SKIP_KEYS = new Set(['id', 'key', 'color', 'type', 'mode', 'level', 'profession', 'bin', 'audio', 'src', 'href', 'act', 'cls', 'className', 'pose', 'who', 'bg', 'font', 'style']);
const SKIP_CALLS = new Set(['getElementById', 'querySelector', 'querySelectorAll', 'closest', 'getAttribute', 'hasAttribute', 'removeAttribute', 'addEventListener', 'removeEventListener', 'createElement', 'add', 'remove', 'toggle', 'contains', 'get', 'set', 'removeItem', 'getItem', 'setItem', 'rpc', 'fetch', 'getPropertyValue', 'setProperty', 'matches', 'require', 'go', 'includes', 'startsWith', 'endsWith', 'split', 'replace', 'replaceAll', 'indexOf', 'toLocaleString', 'localeCompare', 'svg', 'face', 'play', 'scrollIntoView', 'getContext', 'route', 'open']);
const RELAX_CALLS = new Set(['add', 'get', 'set', 'includes', 'indexOf', 'startsWith', 'endsWith', 'split']);
const INLINE = /^(b|i|em|strong|u|small|sub|sup|br|span|a|code)$/i;
const ATTR_TEXT = /\b(placeholder|aria-label|title|alt|data-t|data-msg|data-confirm)="([^"]*)"/g;
const M = (k) => `⟦${k}⟧`;

function parse(src) { return acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', ranges: true, allowReturnOutsideFunction: true }); }

// Kata atau kode yang bukan teks tampil
function isCode(t) {
  if (/^ke-⟦\w+⟧/.test(t) || /^[A-Z][a-z]+\/[a-z]+$/.test(t)) return false; // bilangan urutan: ke-3; judul seperti Soal/siswa
  const s = t.replace(/⟦\w+⟧|<\/?[a-zA-Z][^<>]*>/g, ' ').trim(); // hanya tag sungguhan: "x < 3 atau x > 5" tetap teks
  if (/^[A-ZÀ-Ý][a-zà-ÿ]+:$/.test(s) || /^\([A-Za-z]{4,}\)$/.test(s) || /^[A-Z][a-z]+\/[A-Z][a-z]+$/.test(s)) return false; // label "Jawaban:", "(Contoh)", "Ayah/Bunda"
  if (!/[A-Za-zÀ-ÿ]{2,}/.test(s)) return true;
  if (/^[A-Z0-9_]{1,6}$/.test(s)) return true; // kode singkat: TBD1, ID
  if (/^#?[\w-]+\.(js|mp3|png|svg|html|css)/.test(s)) return true;
  if (/^(https?:|mailto:|#\/|\.\/)/.test(s)) return true;
  if (!/\s/.test(s) && /[-_./:#()=]/.test(s) && !/^[A-Za-z]+-[a-z]+$/.test(s)) return true; // kelas, jalur, url
  if (/^[a-z-]+\s*:\s*[^ ]+;?$/.test(s) || /(^|;)\s*[a-z-]+:[^;]+;/.test(s)) return true; // gaya CSS
  if (/^([a-z][\w-]*)(\s+[a-z][\w-]*)*$/.test(s) && /(^|\s)(mq|jv|on|off|sel|ok|hide|active|grow|pulse|ghost|lock|wide|tall)(-|\s|$)/.test(s)) return true; // daftar kelas
  return false;
}

// Satu rangkaian: daftar bagian {t:'text'} atau {e:[awal, akhir]} menjadi potongan teks yang bisa diterjemahkan
const KEY_WORDS = new Set(['segitiga', 'persegi', 'lingkaran', 'trapesium', 'Merah', 'Biru', 'Hijau', 'Kuning', 'sejajar', 'berpotongan', 'modus', 'jangkauan']);
function runsOf(parts) {
  let flat = '', exprs = [];
  parts.forEach((p) => { if (p.e) { flat += M(exprs.length); exprs.push(p.e); } else flat += p.t; });
  const out = []; // {text, kind:'run'|'keep'}
  const tagRe = /<\/?[a-zA-Z][^<>]*>/g; let i = 0, m, buf = ''; const attrs = {}; let nA = 0;
  const flush = () => { if (buf) out.push({ run: buf }); buf = ''; };
  while ((m = tagRe.exec(flat))) {
    buf += flat.slice(i, m.index); i = m.index + m[0].length;
    const name = (m[0].match(/^<\/?([a-zA-Z0-9]+)/) || [])[1] || '';
    if (INLINE.test(name) && !ATTR_TEXT.test(m[0])) { ATTR_TEXT.lastIndex = 0; if (/\s/.test(m[0].trim().slice(1, -1)) && m[0][1] !== '/') { const k = 'a' + nA++; attrs[k] = m[0]; buf += M(k); } else buf += m[0]; continue; }
    ATTR_TEXT.lastIndex = 0; flush();
    // tag blok: teks di atributnya tetap bisa diterjemahkan
    let last = 0, a; const tag = m[0];
    while ((a = ATTR_TEXT.exec(tag))) { const vs = a.index + a[0].indexOf('"') + 1; out.push({ keep: tag.slice(last, vs) }); out.push({ run: a[2] }); last = vs + a[2].length; }
    out.push({ keep: tag.slice(last) });
  }
  buf += flat.slice(i); flush();
  return { out, exprs, attrs };
}
const core = (r) => { const m = r.match(/^(\s*)([\s\S]*?)(\s*)$/); return [m[1], m[2], m[3]]; };
const norm = (s) => s.replace(/\s+/g, ' ');

function candidates(ast, src, relaxed) {
  const found = [];
  const skip = (anc) => {
    const n = anc[anc.length - 1], p = anc[anc.length - 2]; if (!p) return true;
    if (p.type === 'Property' && p.key === n && !p.computed && !(relaxed === true && n.type === 'Literal')) return true;
    if (p.type === 'Property' && p.value === n && !p.computed && SKIP_KEYS.has(p.key.name || p.key.value)) return true;
    if (p.type === 'BinaryExpression' && /^(===|!==|==|!=|in)$/.test(p.operator)) return relaxed !== true;
    if (p.type === 'SwitchCase' && p.test === n) return relaxed !== true;
    if (p.type === 'MemberExpression' && p.property === n) return true;
    if (p.type === 'CallExpression' && p.arguments.includes(n)) { const c = p.callee, nm = c.name || (c.property && c.property.name); if (SKIP_CALLS.has(nm) && !(relaxed && RELAX_CALLS.has(nm))) return true; }
    return false;
  };
  walk.ancestor(ast, {
    Literal(n, _, anc) { if (typeof n.value === 'string' && !skip(anc)) found.push(n); },
    TemplateLiteral(n, _, anc) { if (!skip(anc)) found.push(n); },
  });
  return found.sort((a, b) => a.start - b.start);
}

function partsOf(n, src) {
  if (n.type === 'Literal') { const raw = src.slice(n.start + 1, n.end - 1), q = src[n.start]; return { q, parts: [{ t: raw.split('\\' + q).join(q) }] }; }
  const parts = []; n.quasis.forEach((q, i) => { parts.push({ t: q.value.raw.split('\\`').join('`') }); if (n.expressions[i]) parts.push({ e: [n.expressions[i].start, n.expressions[i].end] }); });
  return { q: '`', parts };
}

// Kumpulkan semua potongan yang layak diterjemahkan dari satu berkas
function extract(src) {
  const list = [], ast = parse(src);
  for (const n of candidates(ast, src, 'calls')) {
    const { parts } = partsOf(n, src), { out } = runsOf(parts);
    for (const o of out) { if (!o.run) continue; const [, c] = core(o.run), k = norm(c); if (k && !isCode(k)) list.push(k); }
  }
  return list;
}

// Tulis ulang sumber dengan kamus; ekspresi di dalam templat ikut diterjemahkan secara rekursif
function apply(src, dict) {
  const ast = parse(src), nodes = candidates(ast, src, true); let used = new Set();
  const esc = (s, q) => { let r = s.split('\\').join('\\\\').split(q).join('\\' + q); if (q === '`') r = r.split('${').join('\\${'); return r; };
  const restoreBackslash = (s) => s.split('\\\\').join('\\'); // kunci menyimpan garis miring mentah
  const keyNodes = []; walk.simple(ast, { ObjectExpression(o) { o.properties.forEach((p) => { if (p.key && p.key.type === 'Identifier' && !p.computed && !p.shorthand && KEY_WORDS.has(p.key.name) && dict[p.key.name] !== undefined) keyNodes.push(p.key); }); } });
  for (const k of keyNodes) nodes.push({ ...k, isKey: true }); nodes.sort((x, y) => x.start - y.start);
  function emit(a, b) { // salin sumber [a,b) sambil mengganti node di dalamnya
    let res = '', i = a;
    for (const n of nodes) { if (n.start < i || n.end > b) continue; if (n.start < a) continue; res += src.slice(i, n.start) + node(n); i = n.end; }
    return res + src.slice(i, b);
  }
  function node(n) {
    if (n.isKey) return JSON.stringify(dict[n.name]);
    const { q, parts } = partsOf(n, src), { out, exprs, attrs } = runsOf(parts);
    let any = false;
    const body = out.map((o) => {
      if (o.keep !== undefined) return fill(o.keep, exprs, attrs, q, true);
      const [l, c, r] = core(o.run), k = norm(c);
      if (dict[k] !== undefined && dict[k] !== null) { any = true; used.add(k); return l + fill(dict[k], exprs, attrs, q, false) + r; }
      return fill(o.run, exprs, attrs, q, true);
    }).join('');
    if (!any && !exprs.length) return src.slice(n.start, n.end);
    if (!any && n.type === 'Literal') return src.slice(n.start, n.end);
    return q + body + q;
  }
  function fill(t, exprs, attrs, q, raw) {
    return t.split(/(⟦\w+⟧)/).map((p) => {
      const m = p.match(/^⟦(\w+)⟧$/); if (!m) return raw ? escRaw(p, q) : escTr(p, q);
      if (m[1][0] === 'a') return fill(attrs[m[1]], exprs, attrs, q, true);
      const [s, e] = exprs[+m[1]]; return '${' + emit(s, e) + '}';
    }).join('');
  }
  // teks mentah sudah berupa sumber (garis miring tetap); hanya tanda kutip yang tadi dibuka perlu ditutup lagi
  const escRaw = (s, q) => s.split(q).join('\\' + q);
  const escTr = (s, q) => { let r = s.split(q).join('\\' + q); if (q === '`') r = r.split('${').join('\\${'); return r; };
  return { code: emit(0, src.length), used };
}
module.exports = { extract, apply, parse };
