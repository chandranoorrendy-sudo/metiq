/* Versi Inggris: merapikan bentuk tunggal seperti "1 apples" menjadi "1 apple". Bahasa Indonesia tidak butuh ini karena kata bendanya tidak berubah. */
(function () {
  const KEEP = new Set(['is', 'was', 'has', 'as', 'this', 'its', 'us', 'plus', 'minus', 'less', 'comes', 'goes', 'makes', 'equals', 'fish', 'gives', 'adds', 'means', 'stays']);
  const ONE = (w) => {
    if (w.length < 3 || !w.endsWith('s') || KEEP.has(w)) return w;
    if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (/(ch|sh|x|ss|o)es$/.test(w)) return w.slice(0, -2);
    return w.slice(0, -1);
  };
  const fix = (s) => (typeof s !== 'string' ? s : s.replace(/(^|[^\d.,/:-])1 ([a-z]+)\b/g, (m, a, w) => a + '1 ' + ONE(w)).replace(/\b1 are\b/g, '1 is').replace(/\bchildren\b(?<=\b1 children)/g, 'child'));
  window.METIQ_EN_FIX = fix;
  (window.METIQ_CURRICULUM.UNITS || []).forEach((u) => (u.skills || []).forEach((sk) => {
    const gen = sk.gen; if (typeof gen !== 'function') return;
    sk.gen = function () { const q = gen.apply(this, arguments); if (q && typeof q === 'object') { q.text = fix(q.text); q.explain = fix(q.explain); if (typeof q.answer === 'string') q.answer = fix(q.answer); if (Array.isArray(q.options)) q.options = q.options.map(fix); } return q; };
  }));
})();
