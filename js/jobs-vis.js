/* Metiq — grafik bergerak untuk misi Profesi: panggung adegan, donat anggaran, stoples uang, nota, lapangan, panel kode, dan lainnya.
 * Setiap fungsi mengembalikan HTML/SVG; gerakannya memakai CSS dengan jeda per elemen, jadi diputar ulang setiap kali elemen ditempel.
 */
(function () {
  const rp = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
  const COL = ['#2f6fed', '#ff7a59', '#1fbf9f', '#f5a524', '#8e5bd6', '#e0464b'];
  const d = (s) => `style="animation-delay:${s.toFixed(2)}s"`;
  const glyphs = (s) => (typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter('id', { granularity: 'grapheme' }).segment(s)].map((x) => x.segment) : [s]);

  // Panggung adegan: orang berjalan masuk, benda kerja jatuh dari atas, awan bergerak
  function stage(people, art, color, big) {
    const P = glyphs(people), A = glyphs(art);
    return `<div class="jv-stage ${big ? 'big' : ''}" style="--c:${color}" aria-hidden="true"><i class="sun"></i><i class="cloud a"></i><i class="cloud b"></i><i class="ground"></i>
      <div class="art">${A.map((x, i) => `<span ${d(0.25 + i * 0.18)}>${x}</span>`).join('')}</div>
      <div class="ppl">${P.map((x, i) => `<span ${d(0.1 + i * 0.22)}>${x}</span>`).join('')}</div></div>`;
  }

  // Donat anggaran: tiap bagian tumbuh bergiliran. parts: [nama, nilai, warna?]
  function donut(parts, o = {}) {
    const tot = parts.reduce((a, p) => a + p[1], 0); let off = 0;
    const arcs = parts.map(([, v, c], i) => { const p = (v / tot) * 100, s = `<circle class="jv-arc" r="15.915" cx="21" cy="21" fill="none" stroke="${c || COL[i % 6]}" stroke-width="6.4" stroke-dasharray="${p.toFixed(2)} ${(100 - p).toFixed(2)}" stroke-dashoffset="${(25 - off).toFixed(2)}" style="--p:${p.toFixed(2)};animation-delay:${(i * 0.32).toFixed(2)}s"/>`; off += p; return s; }).join('');
    const fmt = o.fmt || ((v) => `${Math.round((v / tot) * 100)}%`);
    return `<div class="jv-donut"><svg viewBox="0 0 42 42" role="img" aria-label="Diagram bagian">${arcs}${o.c ? `<text x="21" y="20" class="t1">${o.c}</text>` : ''}${o.c2 ? `<text x="21" y="24.6" class="t2">${o.c2}</text>` : ''}</svg>
      <ul>${parts.map(([l, v, c], i) => `<li ${d(0.2 + i * 0.32)}><i style="background:${c || COL[i % 6]}"></i><span>${l}</span><b>${fmt(v)}</b></li>`).join('')}</ul></div>`;
  }

  // Batang mendatar. rows: [nama, nilai, warna?]
  function bars(rows, o = {}) {
    const max = o.max || Math.max(...rows.map((r) => r[1])), fmt = o.fmt || ((v) => v.toLocaleString('id-ID'));
    return `<div class="jv-bars">${rows.map(([l, v, c], i) => `<div><span>${l}</span><p><i style="width:${(v / max) * 100}%;background:${c || COL[i % 6]};animation-delay:${(i * 0.22).toFixed(2)}s"></i></p><b ${d(0.3 + i * 0.22)}>${fmt(v)}</b></div>`).join('')}</div>`;
  }

  // Batang tegak yang naik bergiliran (pertumbuhan). rows: [label, nilai]
  function growth(rows, o = {}) {
    const max = Math.max(...rows.map((r) => r[1])), fmt = o.fmt || ((v) => v.toLocaleString('id-ID'));
    return `<div class="jv-grow">${rows.map(([l, v], i) => `<div><b ${d(0.25 + i * 0.3)}>${fmt(v)}</b><i style="height:${Math.max(6, (v / max) * 100)}%;background:${o.c || COL[0]};animation-delay:${(i * 0.3).toFixed(2)}s"></i><small>${l}</small></div>`).join('')}</div>`;
  }

  // Stoples uang: terisi sesuai persen. rows: [nama, persen, warna, emoji]
  const jars = (rows) => `<div class="jv-jars">${rows.map(([l, p, c, e], i) => `<div><span class="jar"><i style="height:${p}%;background:${c};animation-delay:${(i * 0.3).toFixed(2)}s"></i><em ${d(0.5 + i * 0.3)}>${e || '🪙'}</em></span><b>${p}%</b><small>${l}</small></div>`).join('')}</div>`;

  // Nota belanja: baris muncul satu per satu. rows: [nama, nilai teks]
  const receipt = (title, rows, total) => `<div class="jv-rec"><h5>${title}</h5>${rows.map(([l, v], i) => `<p ${d(0.15 + i * 0.28)}><span>${l}</span><b>${v}</b></p>`).join('')}${total ? `<p class="tot" ${d(0.25 + rows.length * 0.28)}><span>Jumlah</span><b>${total}</b></p>` : ''}</div>`;

  // Satu jumlah dibagi rata ke n orang
  const split = (total, n, who = '🧑', each = '?') => `<div class="jv-split ${n > 4 ? 'many' : ''}"><div class="pot">${total}</div><div class="lines">${[...Array(n)].map((_, i) => `<i ${d(0.3 + i * 0.1)}></i>`).join('')}</div><div class="ppl">${[...Array(n)].map((_, i) => `<span ${d(0.5 + i * 0.12)}><em>${glyphs(who)[i % glyphs(who).length]}</em><b>${each}</b></span>`).join('')}</div></div>`;

  // Lapangan bulu tangkis: kok terbang bolak-balik di atas net
  const court = (ppl = ['🧑', '🧑‍🦱', '👩', '👨']) => `<div class="jv-court" role="img" aria-label="Lapangan bulu tangkis"><i class="net"></i><i class="line a"></i><i class="line b"></i><i class="line c"></i>${ppl.map((x, i) => `<span class="p p${i}" ${d(i * 0.15)}>${x}</span>`).join('')}<span class="kok">🏸</span></div>`;

  // Panel kode: baris menyala bergiliran. lines: teks; vars: [[nama, nilai]]
  const code = (lines, vars) => `<div class="jv-code"><pre>${lines.map((l, i) => `<code ${d(0.2 + i * 0.55)}><i>${i + 1}</i>${l}</code>`).join('')}</pre>${vars ? `<div class="vars">${vars.map(([k, v]) => `<span><small>${k}</small><b>${v}</b></span>`).join('')}</div>` : ''}</div>`;

  // Robot berjalan di petak sampai bintang
  const robot = (n) => `<div class="jv-robot" style="--n:${n}">${[...Array(n + 1)].map(() => '<i></i>').join('')}<span class="bot" style="--to:${n}">🤖</span><span class="star">⭐</span></div>`;

  // Tempat duduk berkelompok. groups kelompok, per anak per kelompok
  const seats = (groups, per, e = '🧒') => `<div class="jv-seats">${[...Array(groups)].map((_, g) => `<div style="--c:${COL[g % 6]}" ${d(g * 0.18)}>${e.repeat(per)}</div>`).join('')}</div>`;

  // Alat ukur tegak (suntikan/gelas). val dari max
  const dose = (val, max, unit, label) => `<div class="jv-dose"><div class="tube"><i style="height:${(val / max) * 100}%"></i>${[...Array(5)].map((_, i) => `<u style="bottom:${(i + 1) * 20 - 20}%"><small>${(max * i) / 4 === 0 ? '' : (max * i) / 4}</small></u>`).join('')}</div><b>${val} ${unit}</b>${label ? `<small>${label}</small>` : ''}</div>`;

  // Deretan benda yang muncul bergiliran
  const chips = (items) => `<div class="jv-chips">${items.map((x, i) => `<span ${d(i * 0.12)}>${x}</span>`).join('')}</div>`;

  // Kembang api kecil saat jawaban benar
  const burst = () => `<div class="jv-burst" aria-hidden="true">${[...Array(14)].map((_, i) => `<i style="--a:${(i * 360) / 14}deg;--c:${COL[i % 6]}"></i>`).join('')}</div>`;

  window.METIQ_JV = { rp, stage, donut, bars, growth, jars, receipt, split, court, code, robot, seats, dose, chips, burst, COL };
})();
