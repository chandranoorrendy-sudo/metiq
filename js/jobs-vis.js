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
  const receipt = (title, rows, total) => `<div class="jv-rec"><h5>${title}</h5>${rows.map(([l, v], i) => `<p ${d(0.15 + i * 0.28)}><span>${l}</span><b>${v}</b></p>`).join('')}${total ? `<p class="tot" ${d(0.25 + rows.length * 0.28)}><span>${window.METIQ_LANG === 'en' ? 'Total' : 'Jumlah'}</span><b>${total}</b></p>` : ''}</div>`;

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


  // Gambar sampul profesi: alat khas setiap profesi, gaya sama dengan sampul permainan (SVG 120×90)
  const light = (hex, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.substr(i, 2), 16) * (1 - t) + 255 * t).toString(16).padStart(2, '0')).join('');
  const TOOL = {
    // insinyur sipil: helm kerja
    'insinyur-sipil': '<path d="M24 60a36 32 0 0 1 72 0z" fill="#ffc63a" stroke="#c98a00" stroke-width="2.5"/><rect x="54" y="27" width="12" height="33" rx="6" fill="#ffd76a" stroke="#c98a00" stroke-width="2"/><path d="M36 44a24 22 0 0 1 14-14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/><path d="M14 60h92q5 0 5 5v1q0 5-5 5H14q-5 0-5-5v-1q0-5 5-5z" fill="#f0a500" stroke="#c98a00" stroke-width="2.5"/>',
    // arsitek: gambar denah dan penggaris segitiga
    arsitek: '<rect x="20" y="18" width="66" height="50" rx="4" fill="#2f74d8" stroke="#1f5fbf" stroke-width="2.5"/><rect x="82" y="16" width="12" height="54" rx="6" fill="#4d8ee6" stroke="#1f5fbf" stroke-width="2.5"/><path d="M28 30h50M28 42h50M28 54h50M40 22v42M56 22v42" stroke="#fff" stroke-opacity=".18"/><path d="M34 60V42l16-12 16 12v18zM45 60v-9h10v9" stroke="#fff" stroke-width="2.5" fill="none" stroke-linejoin="round"/><path d="M64 80l38-44v44z" fill="#ffc63a" stroke="#e0a800" stroke-width="2.5" stroke-linejoin="round"/><path d="M76 74l18-21v21z" fill="#fffbe9"/>',
    // koki: topi koki
    koki: '<circle cx="42" cy="36" r="15" fill="#fff" stroke="#cfd8d6" stroke-width="2.5"/><circle cx="78" cy="36" r="15" fill="#fff" stroke="#cfd8d6" stroke-width="2.5"/><circle cx="60" cy="26" r="18" fill="#fff" stroke="#cfd8d6" stroke-width="2.5"/><rect x="38" y="38" width="44" height="28" rx="4" fill="#fff" stroke="#cfd8d6" stroke-width="2.5"/><path d="M50 44v18M60 44v18M70 44v18" stroke="#e3e9e7" stroke-width="2"/><rect x="35" y="64" width="50" height="10" rx="5" fill="#ff7a59" stroke="#d9573a" stroke-width="2"/>',
    // petani: caping dan batang padi
    petani: '<path d="M12 56L60 20l48 36q-48 14-96 0z" fill="#e9c37a" stroke="#b98b3c" stroke-width="2.5" stroke-linejoin="round"/><path d="M60 20L38 62M60 20l22 42M60 20v44M60 20L24 58M60 20l36 38" stroke="#c9a157" stroke-width="1.5"/><circle cx="60" cy="20" r="3.5" fill="#b98b3c"/><path d="M98 86q2-14-6-24M24 86q-2-14 6-22" stroke="#6bbf59" stroke-width="3" fill="none" stroke-linecap="round"/>' + [[93, 66], [90, 72], [96, 74], [29, 66], [26, 72], [32, 74]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="4.2" fill="#f2c94c" transform="rotate(${i % 2 ? 25 : -25} ${x} ${y})"/>`).join(''),
    // pengembang gim: stik permainan
    'pengembang-gim': '<path d="M32 34h56q14 0 18 16l4 14q2 12-8 13-7 1-12-6l-6-8H36l-6 8q-5 7-12 6-10-1-8-13l4-14q4-16 18-16z" fill="#9b6dff" stroke="#6f45d8" stroke-width="2.5" stroke-linejoin="round"/><rect x="31" y="47" width="18" height="6" rx="2" fill="#fff"/><rect x="37" y="41" width="6" height="18" rx="2" fill="#fff"/><circle cx="84" cy="44" r="4.5" fill="#ffc800"/><circle cx="93" cy="51" r="4.5" fill="#ff5a5f"/><circle cx="75" cy="51" r="4.5" fill="#4d96ff"/><circle cx="84" cy="58" r="4.5" fill="#35e0bd"/><path d="M40 38a20 8 0 0 1 14-2" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>',
    // ilmuwan data: kaca pembesar di atas diagram
    'ilmuwan-data': '<path d="M16 76h70" stroke="#4c6460" stroke-width="3" stroke-linecap="round"/><rect x="22" y="52" width="13" height="24" rx="3" fill="#4d96ff"/><rect x="40" y="36" width="13" height="40" rx="3" fill="#1fbf9f"/><rect x="58" y="46" width="13" height="30" rx="3" fill="#ff9f43"/><circle cx="80" cy="34" r="19" fill="#e6f8fc" fill-opacity=".85" stroke="#00a8cc" stroke-width="6"/><path d="M70 40l7-7 6 5 8-10" stroke="#00a8cc" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M94 48l14 14" stroke="#00a8cc" stroke-width="8" stroke-linecap="round"/>',
    // pengusaha: tas kerja dan koin
    pengusaha: '<path d="M48 34v-8q0-4 4-4h16q4 0 4 4v8" stroke="#1f4fb8" stroke-width="5" fill="none"/><rect x="24" y="34" width="72" height="44" rx="8" fill="#2f6fed" stroke="#1f4fb8" stroke-width="2.5"/><rect x="24" y="50" width="72" height="6" fill="#1f4fb8" opacity=".55"/><rect x="54" y="47" width="12" height="12" rx="2.5" fill="#ffc800" stroke="#e0a800" stroke-width="2"/><circle cx="98" cy="24" r="12" fill="#ffc800" stroke="#e0a800" stroke-width="2.5"/><text x="98" y="28" text-anchor="middle" font-size="10" font-weight="900" fill="#8a6a00" font-family="Nunito,sans-serif">Rp</text>',
    // guru: papan tulis
    guru: '<path d="M34 68l-8 18M86 68l8 18" stroke="#8a5a3c" stroke-width="4" stroke-linecap="round"/><rect x="16" y="12" width="88" height="56" rx="4" fill="#2f6f4f" stroke="#b5763a" stroke-width="5"/><text x="60" y="46" text-anchor="middle" font-size="19" font-weight="900" fill="#fff" font-family="Nunito,sans-serif">2+3=5</text><path d="M30 56q10-4 20 0" stroke="#ffd76a" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="70" y="64" width="14" height="5" rx="2" fill="#fff"/>',
    // programmer: laptop dengan kode
    programmer: '<rect x="26" y="16" width="68" height="46" rx="5" fill="#16302b" stroke="#0f9d76" stroke-width="3"/><text x="60" y="46" text-anchor="middle" font-size="20" font-weight="900" fill="#35e0bd" font-family="monospace">&lt;/&gt;</text><path d="M14 66h92l-7 12H21z" fill="#b8c3c0" stroke="#8a9a96" stroke-width="2" stroke-linejoin="round"/><rect x="50" y="68" width="20" height="4" rx="2" fill="#8a9a96"/>',
    // olahraga: sepatu olahraga
    olahraga: '<path d="M12 62q0-14 9-22l11-9q6 10 21 13l31 6q22 4 24 15v2H12z" fill="#e8590c" stroke="#b8440a" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 66h96v4q0 6-6 6H18q-6 0-6-6z" fill="#fff" stroke="#cdd6d4" stroke-width="2.5"/><path d="M38 38l9 6M45 34l9 6M52 31l8 6" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M36 58q24 6 52-6" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M90 60q8 2 12 6" stroke="#b8440a" stroke-width="2" fill="none"/>',
    // pengatur uang keluarga: celengan babi
    keluarga: '<circle cx="58" cy="14" r="9" fill="#ffc800" stroke="#e0a800" stroke-width="2.5"/><path d="M28 50q-8-2-8 6" stroke="#d6336c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M68 32l9-11 4 15z" fill="#ff6f9a" stroke="#d6336c" stroke-width="2"/><ellipse cx="58" cy="52" rx="33" ry="24" fill="#ff9ab8" stroke="#d6336c" stroke-width="2.5"/><path d="M50 30h16" stroke="#b8245a" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="91" cy="52" rx="8" ry="7" fill="#ff6f9a" stroke="#d6336c" stroke-width="2"/><circle cx="89" cy="51" r="1.6" fill="#b8245a"/><circle cx="94" cy="51" r="1.6" fill="#b8245a"/><circle cx="76" cy="44" r="2.4" fill="#04382e"/><rect x="38" y="72" width="8" height="10" rx="3" fill="#ff6f9a"/><rect x="68" y="72" width="8" height="10" rx="3" fill="#ff6f9a"/>',
    // perawat dan dokter: stetoskop
    kesehatan: '<path d="M40 12v16q0 18 20 24M80 12v16q0 18-20 24" stroke="#4c6460" stroke-width="4.5" fill="none" stroke-linecap="round"/><circle cx="40" cy="11" r="4.5" fill="#4c6460"/><circle cx="80" cy="11" r="4.5" fill="#4c6460"/><path d="M60 52v8q0 16 16 16h6" stroke="#0b9aa8" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="92" cy="74" r="12" fill="#c9d1d6" stroke="#8a979b" stroke-width="3"/><circle cx="92" cy="74" r="6" fill="#eef3f4"/><rect x="18" y="56" width="18" height="18" rx="4" fill="#fff" stroke="#ff5a5f" stroke-width="2"/><path d="M27 60v10M22 65h10" stroke="#ff5a5f" stroke-width="3.5" stroke-linecap="round"/>',
  };
  const icon = (pid, color) => {
    const t = TOOL[pid]; if (!t) return '';
    const c = color || '#19b796';
    return `<svg class="gart jicon" viewBox="0 0 120 90" aria-hidden="true"><circle cx="60" cy="46" r="38" fill="${light(c, 0.82)}"/><circle cx="14" cy="18" r="3.5" fill="${c}" opacity=".5"/><circle cx="108" cy="78" r="4" fill="${c}" opacity=".45"/><circle cx="106" cy="12" r="2.5" fill="${c}" opacity=".4"/>${t}</svg>`;
  };

  window.METIQ_JV = { rp, stage, donut, bars, growth, jars, receipt, split, court, code, robot, seats, dose, chips, burst, icon, light, COL };
})();
