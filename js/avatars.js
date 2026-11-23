/* Metiq — avatar siswa dan guru.
 * Avatar disimpan sebagai teks: emoji biasa, atau "svg:<nama>" untuk ilustrasi buatan sendiri
 * (Ustadz, Ustadzah, anak berhijab, anak berpeci, dan wajah maskot Meti, Tito, Nahla, Lumo) agar tampil sama di semua HP.
 */
(function () {
  const face = (cx, cy, rx, ry, skin) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${skin}"/>`;
  const eyes = (y, dx = 4.2, cx = 32) => `<circle cx="${cx - dx}" cy="${y}" r="1.7" fill="#2e2018"/><circle cx="${cx + dx}" cy="${y}" r="1.7" fill="#2e2018"/>`;
  const smile = (y, w = 3.6) => `<path d="M${32 - w} ${y}q${w} ${w * 0.9} ${w * 2} 0" stroke="#b5483f" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
  const cheeks = (y) => `<circle cx="25" cy="${y}" r="2.3" fill="#ff8fa3" opacity=".55"/><circle cx="39" cy="${y}" r="2.3" fill="#ff8fa3" opacity=".55"/>`;
  const svg = (bg, body) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="32" fill="${bg}"/>${body}</svg>`;
  const hijabAvatar = (bg, scarf, inner, skin, accent) => svg(bg,
    `<path d="M32 10c-12 0-20 8.8-20 21 0 6.5 2.1 11.8 5.8 15.5C13.1 50.2 10.6 55 10 64h44c-.6-9-3.1-13.8-7.8-17.5C49.9 42.8 52 37.5 52 31 52 18.8 44 10 32 10z" fill="${scarf}" stroke="${accent}" stroke-width="1.4"/>
    <path d="M32 15.5c-8.8 0-14.5 6.5-14.5 15.4 0 8.7 5.7 15.6 14.5 15.6s14.5-6.9 14.5-15.6c0-8.9-5.7-15.4-14.5-15.4z" fill="${inner}"/>
    ${face(32, 32.2, 10.5, 11.4, skin)}${eyes(31.5)}${cheeks(35.5)}${smile(37)}
    <path d="M17 45.5c4 3.2 9.3 5 15 5s11-1.8 15-5" fill="none" stroke="${accent}" stroke-width="1.6" opacity=".8"/>
    <circle cx="46.5" cy="46.5" r="2.2" fill="${accent}"/><circle cx="46.5" cy="46.5" r=".9" fill="#fff4cf"/>`);

  const SVG = {
    // Anak perempuan berhijab
    'girl-hijab': svg('#ffe3ec', '<path d="M32 11c-11.5 0-19 8.5-19 20 0 6 1.6 10.6 4.4 14.2C13 48.6 10.5 53 9.6 64h44.8c-.9-11-3.4-15.4-7.8-18.8 2.8-3.6 4.4-8.2 4.4-14.2C51 19.5 43.5 11 32 11z" fill="#ff6f9c"/><path d="M32 16c-8.6 0-14 6.5-14 15.5S23.4 47 32 47s14-6.5 14-15.5S40.6 16 32 16z" fill="#ffa8c5"/>' + face(32, 32.5, 10.5, 11.5, '#f5c7a1') + eyes(31.5) + cheeks(35.5) + smile(37)),
    // Anak berhijab biru
    'girl-hijab-blue': svg('#e4f1ff', '<path d="M32 11c-11.5 0-19 8.5-19 20 0 6 1.6 10.6 4.4 14.2C13 48.6 10.5 53 9.6 64h44.8c-.9-11-3.4-15.4-7.8-18.8 2.8-3.6 4.4-8.2 4.4-14.2C51 19.5 43.5 11 32 11z" fill="#4d96ff"/><path d="M32 16c-8.6 0-14 6.5-14 15.5S23.4 47 32 47s14-6.5 14-15.5S40.6 16 32 16z" fill="#8cbaff"/>' + face(32, 32.5, 10.5, 11.5, '#f0c29b') + eyes(31.5) + cheeks(35.5) + smile(37)),
    // Pilihan hijab baru dengan ragam warna kulit dan warna kerudung
    'girl-hijab-lilac': hijabAvatar('#f0e9ff', '#8965c5', '#c6a8eb', '#d59a70', '#6844a0'),
    'girl-hijab-teal': hijabAvatar('#e2f7f2', '#188d7c', '#67cabb', '#905b3e', '#116f64'),
    'girl-hijab-peach': hijabAvatar('#fff0e4', '#df8065', '#f5b49b', '#f0c6a1', '#b85a49'),
    'girl-hijab-navy': hijabAvatar('#e9f0ff', '#405b91', '#8da7dc', '#b87850', '#2d426f'),
    // Anak perempuan berkuncir
    'girl-ponytail': svg('#e6f0ff', '<circle cx="48" cy="28" r="8" fill="#5a3a2a"/><circle cx="50" cy="35.5" r="6" fill="#5a3a2a"/><circle cx="32" cy="33" r="18" fill="#5a3a2a"/>' + face(32, 33, 11, 12, '#f7c9a3') + '<path d="M20 28c0-8 5-12 12-12s12 4 12 12c-4-3.6-8-5.2-12-5.2S24 24.4 20 28z" fill="#67412e"/><path d="M18.6 30c-1 5 0 9 3 12M45.4 30c1 5 0 9-3 12" stroke="#5a3a2a" stroke-width="3.2" fill="none" stroke-linecap="round"/>' + eyes(33.5) + cheeks(37.5) + smile(38.5)),
    // Ustadzah (guru perempuan berhijab)
    'ustadzah': svg('#dff4f1', '<path d="M32 10c-12 0-19.5 9-19.5 20.5 0 6.3 1.8 11 4.8 14.6-4.6 3.6-7.4 8-8.3 18.9h46c-.9-10.9-3.7-15.3-8.3-18.9 3-3.6 4.8-8.3 4.8-14.6C51.5 19 44 10 32 10z" fill="#1f8a7d"/><path d="M32 15.5c-8.8 0-14.3 6.7-14.3 15.6S23.2 46 32 46s14.3-6 14.3-14.9S40.8 15.5 32 15.5z" fill="#3fb3a4"/><circle cx="44.5" cy="44" r="2" fill="#ffd166"/>' + face(32, 31.5, 9.8, 11, '#e9b48c') + '<path d="M25.6 30.4q2.2-1.6 4.4 0M34 30.4q2.2-1.6 4.4 0" stroke="#2e2018" stroke-width="1.7" fill="none" stroke-linecap="round"/>' + smile(36, 3.2)),
    // Ustadz (guru laki-laki berpeci dan berbaju koko)
    'ustadz': svg('#e2eeff', '<path d="M11 64c1.4-10.6 9.4-16 21-16s19.6 5.4 21 16z" fill="#ffffff" stroke="#c9d6ea" stroke-width="1.2"/><path d="M29 48h6v6l-3 3-3-3z" fill="#e3e9f3"/><path d="M32 49v15" stroke="#c9d6ea" stroke-width="1.2"/>' + face(32, 31, 10.5, 12, '#d9a37a') + '<ellipse cx="21.6" cy="31.5" rx="2" ry="3" fill="#d09670"/><ellipse cx="42.4" cy="31.5" rx="2" ry="3" fill="#d09670"/><path d="M21.6 32c.6 8.6 4.8 13.2 10.4 13.2S41.8 40.6 42.4 32c-2 3.6-5.6 5.6-10.4 5.6S23.6 35.6 21.6 32z" fill="#3a2a20"/><path d="M28 39.4h8" stroke="#3a2a20" stroke-width="2.2" stroke-linecap="round"/><path d="M21.2 23.6c0-6.4 4.8-9.8 10.8-9.8s10.8 3.4 10.8 9.8v2.4H21.2z" fill="#1e2333"/><path d="M21.2 24.4h21.6" stroke="#3a4157" stroke-width="1.4"/>' + eyes(30) + '<path d="M29 34.6q3 2.2 6 0" stroke="#b5483f" stroke-width="1.6" fill="none" stroke-linecap="round"/>'),
    // Anak laki-laki berpeci
    'boy-peci': svg('#fff1cc', '<path d="M12 64c1.4-10 9-15 20-15s18.6 5 20 15z" fill="#4d96ff"/><path d="M27 49.5l5 5 5-5" stroke="#fff" stroke-width="2" fill="none"/>' + face(32, 32.5, 11, 12, '#f2c49b') + '<ellipse cx="21" cy="33" rx="2" ry="3" fill="#e8b48a"/><ellipse cx="43" cy="33" rx="2" ry="3" fill="#e8b48a"/><path d="M21.4 25c0-6.3 4.7-9.6 10.6-9.6s10.6 3.3 10.6 9.6v2.2H21.4z" fill="#1e2333"/><path d="M21.4 25.8h21.2" stroke="#3a4157" stroke-width="1.4"/>' + eyes(32) + cheeks(36) + smile(37.5)),
    // Anak laki-laki berkacamata
    'boy-glasses': svg('#e8f3ff', face(32, 33, 11, 12, '#e2ab7f') + '<path d="M20 27c0-7 5-11 12-11s12 4 12 11c-4-3-8-4.6-12-4.6S24 24 20 27z" fill="#241a14"/><g fill="none" stroke="#2b3a4a" stroke-width="1.9"><rect x="21.4" y="30.4" width="9.6" height="7.8" rx="3.8"/><rect x="33" y="30.4" width="9.6" height="7.8" rx="3.8"/><path d="M31 33.4h2"/></g><circle cx="26.2" cy="34.2" r="1.5" fill="#2e2018"/><circle cx="37.8" cy="34.2" r="1.5" fill="#2e2018"/>' + cheeks(39) + smile(40, 3.2)),
    // Anak laki-laki berambut keriting
    'boy-curly': svg('#eefbe6', '<g fill="#3b2a1e"><circle cx="22" cy="25" r="7"/><circle cx="32" cy="19.5" r="8"/><circle cx="42" cy="25" r="7"/><circle cx="18.5" cy="33" r="5"/><circle cx="45.5" cy="33" r="5"/></g>' + face(32, 34, 10.5, 11.5, '#9a6340') + eyes(34) + cheeks(38) + smile(39)),
  };

  const T = (id, en) => (window.METIQ_LANG === 'en' ? en : id);
  const CATALOG = [
    [T('Anak', 'Children'), [...Array(12)].map((_, i) => `portrait:${i}`).concat(['svg:girl-hijab', 'svg:girl-hijab-blue', 'svg:girl-hijab-lilac', 'svg:girl-hijab-teal', 'svg:girl-hijab-peach', 'svg:girl-hijab-navy', 'svg:girl-ponytail', 'svg:boy-peci', 'svg:boy-glasses', 'svg:boy-curly', '👧', '👦', '🧒', '👩‍🎓', '👨‍🎓', '🧕'])],
    [T('Guru', 'Teachers'), ['svg:ustadzah', 'svg:ustadz', '👩‍🏫', '👨‍🏫']],
    [T('Hewan', 'Animals'), ['svg:meti', 'svg:tito', 'svg:nahla', 'svg:lumo', '🦁', '🐯', '🐼', '🐨', '🐸', '🐵', '🦊', '🐰', '🐻', '🐧', '🦄', '🐙', '🐳', '🦋', '🐞', '🐢', '🐱', '🐶', '🐮', '🐔', '🦉', '🐠']],
    [T('Tumbuhan', 'Plants'), ['🌻', '🌵', '🌳', '🌴', '🍀', '🌷', '🌸', '🍁', '🌿', '🍄', '🌹', '🌾']],
    [T('Bentuk', 'Shapes'), ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⭐', '🔷', '🔶', '💠', '❤️', '🟥']],
    [T('Ikon', 'Icons'), ['⚽', '🏀', '🚀', '🎨', '🎵', '📚', '✏️', '🌙', '☀️', '🌈', '🚲', '🎈', '🧩', '🏆']],
  ];
  const NAMES = { 'svg:girl-hijab': T('Anak berhijab', 'Child with hijab'), 'svg:girl-hijab-blue': T('Anak berhijab biru', 'Child with blue hijab'), 'svg:girl-hijab-lilac': T('Anak berhijab ungu dan kulit sawo matang', 'Child with lilac hijab and tan skin'), 'svg:girl-hijab-teal': T('Anak berhijab hijau dan kulit gelap', 'Child with teal hijab and dark skin'), 'svg:girl-hijab-peach': T('Anak berhijab jingga dan kulit cerah', 'Child with peach hijab and light skin'), 'svg:girl-hijab-navy': T('Anak berhijab biru tua dan kulit cokelat', 'Child with navy hijab and brown skin'), 'svg:girl-ponytail': T('Anak berkuncir', 'Girl with ponytail'), 'svg:boy-peci': T('Anak berpeci', 'Child with peci'), 'svg:boy-glasses': T('Anak berkacamata', 'Boy with glasses'), 'svg:boy-curly': T('Anak berambut keriting', 'Boy with curly hair'), 'svg:ustadzah': 'Ustadzah', 'svg:ustadz': 'Ustadz', 'svg:meti': T('Meti si gurita', 'Meti the octopus'), 'svg:tito': T('Tito si semut', 'Tito the ant'), 'svg:nahla': T('Nahla si lebah', 'Nahla the bee'), 'svg:lumo': T('Lumo si lumba-lumba', 'Lumo the dolphin') };
  const portraitNames = [T('Anak berambut pirang', 'Child with blonde hair'), T('Anak berambut merah', 'Child with auburn hair'), T('Anak berambut hitam panjang', 'Child with long dark hair'), T('Anak berkacamata', 'Child with glasses'), T('Anak berambut ikal', 'Child with wavy hair'), T('Anak berkulit gelap dan berambut keriting', 'Child with dark skin and curly hair'), T('Anak berhijab ungu', 'Child with a purple hijab'), T('Anak berambut cokelat ikal', 'Child with curly brown hair'), T('Anak dengan rambut keriting', 'Child with coily hair'), T('Anak berkacamata dan rambut ikal', 'Child with glasses and wavy hair'), T('Anak berambut hitam pendek', 'Child with short dark hair'), T('Anak dengan kepang', 'Child with braids')];
  portraitNames.forEach((name, i) => { NAMES[`portrait:${i}`] = name; });
  // Wajah maskot Metiq sebagai avatar (digambar oleh js/mascot.js saat ditampilkan)
  const MASCOT_BG = { meti: '#e6fffa', tito: '#ffe8e9', nahla: '#fff4d6', lumo: '#e3ebff' };
  const mascotAvatar = (k) => { const M = window.METIQ_MASCOT; if (!M || !(k in MASCOT_BG)) return null; const f = M.face(62, 'happy', k === 'meti' ? undefined : k).replace('<svg ', '<svg x="1" y="7" ').replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"'); return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="32" fill="${MASCOT_BG[k]}"/>${f}</svg>`; };

  // HTML avatar: ilustrasi SVG atau emoji
  function html(a) {
    const portrait = /^portrait:(\d+)$/.exec(String(a || ''));
    if (portrait) { const i = Math.min(11, Number(portrait[1])); return `<span class="avportrait" role="img" aria-label="${T('Avatar anak', 'Child avatar')}" style="--px:${(i % 4) * 33.333}%;--py:${Math.floor(i / 4) * 50}%"></span>`; }
    const k = String(a || '').startsWith('svg:') ? String(a).slice(4) : null;
    if (k && SVG[k]) return `<span class="avsvg" role="img" aria-label="${NAMES['svg:' + k] || 'avatar'}">${SVG[k]}</span>`;
    const mv = k && mascotAvatar(k);
    if (mv) return `<span class="avsvg" role="img" aria-label="${NAMES['svg:' + k]}">${mv}</span>`;
    return String(a || '🙂').replace(/[<>&"]/g, '');
  }

  window.METIQ_AVATARS = { CATALOG, NAMES, html };
})();
