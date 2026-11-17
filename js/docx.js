/* Metiq — ekspor lembar soal ke Microsoft Word (.docx).
 *
 * Dibuat tanpa pustaka luar supaya tetap jalan di situs statis dengan CSP yang ketat:
 *  1) ZIP ditulis sendiri (metode "store", tanpa kompresi) — format .docx hanyalah ZIP berisi XML.
 *  2) Isi dokumen memakai WordprocessingML, dan pecahan memakai OMML <m:f> sehingga di Word
 *     tampil sebagai pecahan dua baris: pembilang di atas, penyebut di bawah, keduanya bisa diketik.
 *
 * API: window.METIQ_DOCX = { build, save, genQuestions, fromSession, bin }
 */
(function () {
  const T = (id, en) => (window.METIQ_LANG === 'en' ? en : id);
  const LET = ['A', 'B', 'C', 'D', 'E', 'F'];

  /* ---------------- utilitas teks ---------------- */
  const esc = (s) => String(s == null ? '' : s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const strip = (s) => String(s == null ? '' : s).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const slug = (s) => strip(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'metiq';

  /* ---------------- ZIP (store) ---------------- */
  let CRC_TABLE = null;
  function crcTable() {
    if (CRC_TABLE) return CRC_TABLE;
    CRC_TABLE = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c >>> 0;
    }
    return CRC_TABLE;
  }
  function crc32(bytes) {
    const t = crcTable();
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = t[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  const enc = new TextEncoder();
  function dosTime(d) {
    const time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31);
    const date = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
    return { time, date };
  }
  // files: [{ name, data: Uint8Array }] -> Uint8Array (ZIP)
  function zip(files) {
    const { time, date } = dosTime(new Date());
    const chunks = [], central = [];
    let offset = 0;
    const u = (n, bytes) => { const a = new Uint8Array(bytes); for (let i = 0; i < bytes; i++) a[i] = (n >>> (8 * i)) & 255; return a; };
    const concat = (list) => { const len = list.reduce((n, x) => n + x.length, 0), out = new Uint8Array(len); let at = 0; list.forEach((x) => { out.set(x, at); at += x.length; }); return out; };
    files.forEach((f) => {
      const name = enc.encode(f.name), data = f.data, crc = crc32(data);
      const head = concat([
        u(0x04034b50, 4), u(20, 2), u(0x0800, 2), u(0, 2), u(time, 2), u(date, 2),
        u(crc, 4), u(data.length, 4), u(data.length, 4), u(name.length, 2), u(0, 2), name,
      ]);
      chunks.push(head, data);
      central.push(concat([
        u(0x02014b50, 4), u(20, 2), u(20, 2), u(0x0800, 2), u(0, 2), u(time, 2), u(date, 2),
        u(crc, 4), u(data.length, 4), u(data.length, 4), u(name.length, 2), u(0, 2), u(0, 2), u(0, 2), u(0, 2),
        u(0, 4), u(offset, 4), name,
      ]));
      offset += head.length + data.length;
    });
    const cd = concat(central);
    const end = concat([u(0x06054b50, 4), u(0, 2), u(0, 2), u(files.length, 2), u(files.length, 2), u(cd.length, 4), u(offset, 4), u(0, 2)]);
    return concat(chunks.concat([cd, end]));
  }

  /* ---------------- WordprocessingML ---------------- */
  function rPr(o) {
    let x = '';
    if (o.font) x += `<w:rFonts w:ascii="${o.font}" w:hAnsi="${o.font}" w:cs="${o.font}"/>`;
    if (o.b) x += '<w:b/>';
    if (o.i) x += '<w:i/>';
    if (o.color) x += `<w:color w:val="${o.color}"/>`;
    if (o.sz) x += `<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`;
    if (o.u) x += '<w:u w:val="single"/>';
    if (o.vert) x += `<w:vertAlign w:val="${o.vert}"/>`;
    return x ? `<w:rPr>${x}</w:rPr>` : '';
  }
  function run(text, o) {
    o = o || {};
    const parts = String(text).split('\n');
    const body = parts.map((t, i) => (i ? '<w:br/>' : '') + `<w:t xml:space="preserve">${esc(t)}</w:t>`).join('');
    return `<w:r>${rPr(o)}${body}</w:r>`;
  }
  // Pecahan OMML: <m:f> punya dua kotak (pembilang/penyebut) yang bisa disunting di Word.
  function frac(num, den, o) {
    o = o || {};
    const sz = o.sz || 22;
    const mr = (t) => `<m:r><w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/>${o.b ? '<w:b/>' : ''}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><m:t>${esc(t)}</m:t></m:r>`;
    return `<m:oMath><m:f><m:fPr><m:ctrlPr><w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/></w:rPr></m:ctrlPr></m:fPr><m:num>${mr(num)}</m:num><m:den>${mr(den)}</m:den></m:f></m:oMath>`;
  }
  // Teks biasa: "3/4" diubah menjadi pecahan dua baris supaya guru bisa langsung mengeditnya.
  const FRAC_RE = /(^|[^\d/])(\d{1,3})\s*\/\s*(\d{1,3})(?![\d/])/g;
  function textRuns(text, o) {
    o = o || {};
    const s = String(text);
    if (!/\d\s*\/\s*\d/.test(s)) return run(s, o);
    let out = '', last = 0, m;
    FRAC_RE.lastIndex = 0;
    while ((m = FRAC_RE.exec(s))) {
      const start = m.index + m[1].length;
      if (start > last) out += run(s.slice(last, start), o);
      out += frac(m[2], m[3], o);
      last = start + m[2].length + (m[0].length - m[1].length - m[2].length);
    }
    if (last < s.length) out += run(s.slice(last), o);
    return out || run(s, o);
  }
  // HTML soal -> runs Word (tebal, miring, pangkat, pecahan gfr/mfr). SVG dilewati.
  function htmlRuns(html, base) {
    const box = document.createElement('div');
    box.innerHTML = String(html == null ? '' : html);
    const out = [];
    const walk = (node, ctx) => {
      if (node.nodeType === 3) {
        const t = node.nodeValue.replace(/\s+/g, ' ');
        if (t.trim()) out.push(textRuns(t, ctx));
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      if (tag === 'svg' || tag === 'math' || tag === 'canvas') return;
      if (tag === 'br') { out.push('<w:r><w:br/></w:r>'); return; }
      const nx = Object.assign({}, ctx);
      if (tag === 'b' || tag === 'strong') nx.b = true;
      if (tag === 'i' || tag === 'em') nx.i = true;
      if (tag === 'u') nx.u = true;
      if (tag === 'sup') nx.vert = 'superscript';
      if (tag === 'sub') nx.vert = 'subscript';
      if (tag === 'span' && typeof node.className === 'string' && /(^|\s)(gfr|mfr)(\s|$)/.test(node.className)) {
        const bs = node.querySelectorAll('b');
        if (bs.length >= 2) { out.push(frac(bs[0].textContent.trim(), bs[1].textContent.trim(), nx)); return; }
      }
      Array.prototype.forEach.call(node.childNodes, (c) => walk(c, nx));
    };
    walk(box, base || {});
    return out.join('');
  }
  function para(inner, o) {
    o = o || {};
    let p = '';
    if (o.keepNext) p += '<w:keepNext/>';
    if (o.border) p += '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="2" w:color="D9E3DF"/></w:pBdr>';
    if (o.tabs && o.tabs.length) p += `<w:tabs>${o.tabs.map((t) => `<w:tab w:val="${t.val || 'left'}" w:leader="${t.leader || 'none'}" w:pos="${t.pos}"/>`).join('')}</w:tabs>`;
    if (o.before != null || o.after != null) p += `<w:spacing${o.before != null ? ` w:before="${o.before}"` : ''}${o.after != null ? ` w:after="${o.after}"` : ''}/>`;
    if (o.line) p += `<w:spacing w:line="${o.line}" w:lineRule="auto"/>`;
    if (o.indent || o.hanging) p += `<w:ind${o.indent ? ` w:left="${o.indent}"` : ''}${o.hanging ? ` w:hanging="${o.hanging}"` : ''}/>`;
    if (o.align) p += `<w:jc w:val="${o.align}"/>`;
    return `<w:p>${p ? `<w:pPr>${p}</w:pPr>` : ''}${inner}</w:p>`;
  }
  const empty = (after) => para('', { after: after == null ? 120 : after });
  function cell(inner, w) { return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/></w:tcPr>${inner}</w:tc>`; }
  function metaTable(nameLabel, dateLabel, scoreLabel) {
    const line = (label) => para(run(label + ' ', { sz: 20, color: '6A7F7A' }) + '<w:r><w:tab/></w:r>', { tabs: [{ val: 'left', leader: 'dot', pos: 2300 }], after: 0 });
    return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="3400"/><w:gridCol w:w="3400"/><w:gridCol w:w="2600"/></w:tblGrid><w:tr>${cell(line(nameLabel), 3400)}${cell(line(dateLabel), 3400)}${cell(line(scoreLabel), 2600)}</w:tr></w:tbl>`;
  }

  /* ---------------- isi dokumen ---------------- */
  function answerText(q) {
    const raw = q.answer == null ? '' : String(q.answer);
    if (q.options && q.options.length) {
      const i = q.options.findIndex((o) => strip(o) === strip(raw) || String(o) === raw);
      if (i >= 0) return LET[i] + '. ' + strip(q.options[i]);
    }
    if (q.unit === 'Rp') return 'Rp ' + raw;
    return raw + (q.unit && q.unit !== 'Rp' ? ' ' + q.unit : '');
  }
  function visLine(vis) {
    const s = String(vis || '');
    if (!s) return '';
    const d = document.createElement('div'); d.innerHTML = s;
    const txt = (d.textContent || '').replace(/\s+/g, ' ').trim();
    if (!txt) return '';
    return para(run(txt, { sz: 24 }), { indent: 720, after: 120 });
  }
  // SVG soal -> PNG, supaya gambar (pecahan, garis bilangan, timbangan) ikut ke Word.
  // Warna diambil dari CSS halaman, jadi gaya dihitung dulu lalu ditempel ke salinan SVG.
  function rasterizeVis(vis) {
    return new Promise((resolve) => {
      const s = String(vis || '');
      if (!s || (s.match(/<svg/gi) || []).length !== 1) return resolve(null);
      let host = null;
      try {
        host = document.createElement('div');
        host.style.cssText = 'position:absolute;left:-9999px;top:0;width:700px;height:700px;overflow:hidden;pointer-events:none';
        host.innerHTML = s;
        document.body.appendChild(host);
        const svgEl = host.querySelector('svg');
        if (!svgEl) return resolve(null);
        const vb = (svgEl.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
        const vw = vb.length === 4 && vb[2] > 0 ? vb[2] : 0, vh = vb.length === 4 && vb[3] > 0 ? vb[3] : 0;
        if (!vw || !vh) return resolve(null);
        const src = [svgEl].concat(Array.prototype.slice.call(svgEl.querySelectorAll('*')));
        const clone = svgEl.cloneNode(true);
        const dst = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll('*')));
        const props = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-opacity', 'fill-opacity', 'opacity', 'font-size', 'font-family', 'font-weight', 'text-anchor'];
        src.forEach((el, i) => {
          const cs = getComputedStyle(el);
          props.forEach((p) => { const v = cs.getPropertyValue(p); if (v && v !== 'auto') dst[i].setAttribute(p, v); });
        });
        const markup = new XMLSerializer().serializeToString(clone);
        const img = new Image();
        const scale = Math.min(2.5, 520 / vw);
        const cw = Math.max(1, Math.round(vw * scale)), ch = Math.max(1, Math.round(vh * scale));
        img.onload = () => {
          try {
            const c = document.createElement('canvas');
            c.width = cw; c.height = ch;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
            ctx.drawImage(img, 0, 0, cw, ch);
            const dispW = Math.min(vw, 425), dispH = Math.round(dispW * (vh / vw));
            resolve({ data: c.toDataURL('image/png'), w: dispW, h: dispH });
          } catch (e) { resolve(null); }
        };
        img.onerror = () => resolve(null);
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
      } catch (e) { resolve(null); }
      finally { setTimeout(() => { if (host && host.parentNode) host.remove(); }, 0); }
    });
  }
  function imagePara(im, n) {
    const cap = 4000000;
    let cx = Math.round(im.w * 9525), cy = Math.round(im.h * 9525);
    if (cx > cap) { cy = Math.round(cy * cap / cx); cx = cap; }
    return `<w:p><w:pPr><w:ind w:left="720"/><w:spacing w:after="120"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${n}" name="Gambar ${n}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${n}" name="Gambar ${n}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${im.rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  }
  function questionBlock(q, i) {
    let x = para(`<w:r><w:t xml:space="preserve">${i + 1}.</w:t></w:r><w:r><w:tab/></w:r>` + htmlRuns(q.text), { indent: 420, hanging: 420, tabs: [{ val: 'left', pos: 420 }], after: 60, keepNext: true });
    x += q._img ? imagePara(q._img, i + 1) : visLine(q.vis);
    if (q.options && q.options.length) {
      // dua pilihan per baris, huruf pilihan rata di kolom sendiri
      for (let k = 0; k < q.options.length; k += 2) {
        const one = (idx) => `<w:r>${rPr({ sz: 22 })}<w:t xml:space="preserve">${LET[idx]}.</w:t></w:r><w:r><w:tab/></w:r>` + htmlRuns(q.options[idx], { sz: 22 });
        const pair = one(k) + (q.options[k + 1] != null ? '<w:r><w:tab/></w:r>' + one(k + 1) : '');
        x += para(pair, { indent: 720, tabs: [{ val: 'left', pos: 1440 }, { val: 'left', pos: 4860 }], after: 40, keepNext: true });
      }
      x += empty(140);
    } else {
      x += para(run(T('Jawaban: ', 'Answer: '), { sz: 20, color: '6A7F7A' }) + '<w:r><w:tab/></w:r>',
        { indent: 720, tabs: [{ val: 'left', leader: 'dot', pos: 8900 }], after: 200 });
    }
    return x;
  }
  function buildXml(opt) {
    const qs = opt.questions || [];
    const title = opt.title || T('Lembar soal', 'Worksheet');
    const sub = [opt.className, opt.teacherName, opt.due ? T('Tenggat ', 'Due ') + opt.due : ''].filter(Boolean).join(' · ');
    let body = '';
    body += para(run(title, { b: true, sz: 34 }), { align: 'center', after: 40 });
    if (sub) body += para(run(sub, { sz: 19, color: '6A7F7A' }), { align: 'center', after: 160 });
    body += metaTable(T('Nama', 'Name'), T('Tanggal', 'Date'), T('Nilai', 'Score'));
    if (opt.skills && opt.skills.length) body += para(run(T('Materi: ', 'Topics: ') + opt.skills.join(', '), { sz: 18, color: '6A7F7A' }), { after: 80 });
    body += para(run(T('Petunjuk: kerjakan soal berikut. Tulis jawabanmu di tempat yang disediakan.', 'Instructions: answer the questions below. Write your answers in the space provided.'), { sz: 19, color: '4C6460' }), { after: 160, border: true });
    body += empty(80);
    qs.forEach((q, i) => { body += questionBlock(q, i); });

    if (opt.withKey !== false) {
      body += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      body += para(run(T('Kunci jawaban', 'Answer key') + ' — ' + title, { b: true, sz: 30 }), { after: 60 });
      body += para(run(T('Untuk guru.', 'For the teacher.'), { sz: 18, color: '6A7F7A' }), { after: 160, border: true });
      qs.forEach((q, i) => {
        let x = para(`<w:r><w:t xml:space="preserve">${i + 1}.</w:t></w:r><w:r><w:tab/></w:r>` + htmlRuns(answerText(q), { b: true }), { indent: 420, hanging: 420, tabs: [{ val: 'left', pos: 420 }], after: 20, keepNext: !!(q.explain) });
        if (q.explain) x += para(htmlRuns(q.explain, { sz: 18, color: '6A7F7A' }), { indent: 420, after: 140 });
        body += x;
      });
    }

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  }

  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="id-ID"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>`;

  const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;

  const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;

  const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

  function coreXml(title) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(title)}</dc:title><dc:creator>Metiq</dc:creator><cp:lastModifiedBy>Metiq</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</dcterms:modified></cp:coreProperties>`;
  }
  const APP = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Metiq</Application></Properties>`;

  /* ---------------- pembuat soal untuk lembar kerja ---------------- */
  function genQuestions(skillIds, total) {
    const ALL = (window.METIQ_CURRICULUM || {}).SKILLS || {};
    const ids = (skillIds || []).filter((id) => ALL[id]);
    const out = [], seen = new Set();
    if (!ids.length) return out;
    for (let i = 0; out.length < total && i < total * 8; i++) {
      const sk = ALL[ids[i % ids.length]];
      try {
        const q = sk.gen();
        if (!q || !q.text) continue;
        const options = q.options && q.options.length ? q.options.map(String) : null;
        // soal yang pilihannya hanya gambar tidak bisa dipindah ke Word tanpa gambarnya
        if (options && options.some((o) => !strip(o))) continue;
        const key = strip(q.text) + '|' + strip(q.vis || '');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          text: q.text,
          vis: q.vis,
          options,
          answer: q.answer == null ? '' : String(q.answer),
          unit: q.unit,
          explain: q.explain,
        });
      } catch (e) { /* lewati soal yang gagal dibuat */ }
    }
    return out;
  }

  /* ---------------- API ---------------- */
  function dataUrlBytes(url) {
    const b64 = String(url).split(',')[1] || '';
    const bin = atob(b64), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function build(opt) {
    opt = opt || {};
    const qs = opt.questions || [];
    const media = [];
    for (let i = 0; i < qs.length; i++) {
      const made = await rasterizeVis(qs[i].vis);
      if (made) {
        const n = media.length + 1;
        qs[i]._img = { rid: 'rIdImg' + n, name: 'image' + n + '.png', data: made.data, w: made.w, h: made.h };
        media.push(qs[i]._img);
      }
    }
    const xml = buildXml(opt);
    const files = [
      { name: '[Content_Types].xml', data: enc.encode(CONTENT_TYPES) },
      { name: '_rels/.rels', data: enc.encode(RELS) },
      { name: 'word/document.xml', data: enc.encode(xml) },
      { name: 'word/styles.xml', data: enc.encode(STYLES) },
      { name: 'word/_rels/document.xml.rels', data: enc.encode(DOC_RELS.replace('</Relationships>', media.map((m) => `<Relationship Id="${m.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${m.name}"/>`).join('') + '</Relationships>')) },
      { name: 'docProps/core.xml', data: enc.encode(coreXml(opt.title || 'Metiq')) },
      { name: 'docProps/app.xml', data: enc.encode(APP) },
    ];
    media.forEach((m) => files.push({ name: 'word/media/' + m.name, data: dataUrlBytes(m.data) }));
    return new Blob([zip(files)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }
  function save(blob, filename) {
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename || 'metiq-lembar-soal.docx';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  // Soal dari sesi kelas (data sudah tersimpan): text, vis, options, answer, explain.
  function fromSession(s) {
    return (s && s.questions ? s.questions : []).map((q) => ({
      text: q.text,
      vis: q.vis,
      options: q.options && q.options.length ? q.options : null,
      answer: q.answer,
      unit: q.unit,
      explain: q.explain,
    }));
  }

  window.METIQ_DOCX = { build, save, genQuestions, fromSession, fileSlug: slug, _xml: buildXml, _zip: zip };
})();
