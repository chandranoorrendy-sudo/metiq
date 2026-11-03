/* Metiq — Album Nusantara: gambar puzzle di halaman Hadiah.
 * Setiap tantangan papan hadiah yang selesai memberi 1 keping; 9 keping membuka satu gambar.
 * Ilustrasi digambar sendiri sebagai SVG (300 × 300) agar ringan dan tidak butuh gambar dari luar.
 */
(function () {
  // latar: langit bergradasi + tanah
  const sky = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="300" height="300" fill="url(#${id})"/>`;
  const sun = (x, y, r = 22, c = '#ffd23f') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".9"><ellipse cx="0" cy="0" rx="26" ry="12"/><ellipse cx="18" cy="-8" rx="18" ry="12"/><ellipse cx="-16" cy="-5" rx="14" ry="10"/></g>`;
  const ground = (y, c, c2) => `<path d="M0 ${y}q75 -14 150 0t150 0V300H0z" fill="${c}"/>${c2 ? `<path d="M0 ${y + 26}q90 -10 180 0t120 2V300H0z" fill="${c2}"/>` : ''}`;
  const palm = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0q4 -30 -2 -58" stroke="#8a5a2b" stroke-width="5" fill="none"/><g fill="#2fa84f"><path d="M-2 -58q-26 -6 -36 10q18 -14 36 -10z"/><path d="M-2 -58q26 -8 36 8q-18 -12 -36 -8z"/><path d="M-2 -58q-14 -20 -34 -18q20 4 34 18z"/><path d="M-2 -58q12 -22 32 -22q-18 6 -32 22z"/></g></g>`;

  const ART = {
    monas: sky('sk1', '#7cc8ff', '#d9f1ff') + sun(240, 60) + cloud(70, 70) + cloud(200, 110, .8)
      + ground(240, '#7bd389', '#5cbf73')
      + '<rect x="90" y="226" width="120" height="16" rx="3" fill="#e9e3d3"/><rect x="104" y="210" width="92" height="18" rx="3" fill="#f4efe2"/>'
      + '<path d="M140 210l4 -140h12l4 140z" fill="#f7f4ec" stroke="#d8d0bd" stroke-width="2"/><rect x="134" y="66" width="32" height="8" rx="2" fill="#e9e3d3"/>'
      + '<path d="M150 66c-12 -8 -8 -22 0 -34c3 10 12 14 8 26c-1 4 -4 6 -8 8z" fill="#ffc531" stroke="#e09a00" stroke-width="2"/>',
    borobudur: sky('sk2', '#ffb27a', '#ffe5c4') + sun(70, 70, 26, '#ff8a3d') + cloud(230, 60, .9)
      + ground(236, '#6fbf6a', '#4fa851')
      + [0, 1, 2, 3, 4].map((i) => `<rect x="${50 + i * 16}" y="${214 - i * 22}" width="${200 - i * 32}" height="24" rx="2" fill="${i % 2 ? '#8e7e6b' : '#a3917c'}"/>`).join('')
      + [96, 124, 150, 176, 204].map((x) => `<path d="M${x - 9} 126q9 -16 18 0z" fill="#8e7e6b"/>`).join('')
      + '<path d="M132 112q18 -40 36 0z" fill="#9a8a75"/><rect x="148" y="66" width="4" height="12" fill="#9a8a75"/><circle cx="150" cy="64" r="4" fill="#9a8a75"/>'
      + palm(36, 246, .9) + palm(268, 250, .8),
    gadang: sky('sk3', '#8fd3ff', '#e6f7ff') + cloud(80, 60) + cloud(230, 80, .7)
      + '<path d="M0 220q60 -50 120 -20t180 -10V300H0z" fill="#5aa85a"/>' + ground(244, '#7bd389')
      + '<path d="M40 150q20 -10 30 -70q10 50 40 52q22 -48 40 -70q18 22 40 70q30 -2 40 -52q10 60 30 70z" fill="#5a3b26"/>'
      + '<rect x="58" y="150" width="184" height="66" fill="#b5532f"/><g fill="#f3c24e">' + [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${70 + i * 28}" y="164" width="16" height="24" rx="2"/>`).join('') + '</g>'
      + '<path d="M58 196h184" stroke="#7a2f18" stroke-width="4"/><g fill="#5a3b26">' + [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${62 + i * 28}" y="216" width="8" height="30"/>`).join('') + '</g>',
    tongkonan: sky('sk4', '#9fe0ff', '#effbff') + sun(250, 56, 20) + cloud(70, 64, .8)
      + ground(238, '#78c97a', '#5cb562')
      + '<path d="M30 132q120 -70 240 0q-20 6 -40 0q-80 -30 -160 0q-20 6 -40 0z" fill="#3d2a1e"/><path d="M50 132q100 -50 200 0v16H50z" fill="#4e3626"/>'
      + '<rect x="80" y="148" width="140" height="56" fill="#8b2f1f"/><g stroke="#f1c84b" stroke-width="3" fill="none">' + [0, 1, 2, 3].map((i) => `<path d="M${92 + i * 32} 160l12 12l-12 12l-12 -12z"/>`).join('') + '</g>'
      + '<path d="M80 190h140" stroke="#111" stroke-width="3"/><g fill="#3d2a1e">' + [0, 1, 2, 3, 4].map((i) => `<rect x="${86 + i * 30}" y="204" width="9" height="40"/>`).join('') + '</g>'
      + '<g fill="#fff"><circle cx="150" cy="128" r="5"/></g>',
    jamgadang: sky('sk5', '#7fc4ff', '#dff2ff') + cloud(60, 70) + cloud(240, 50, .8)
      + '<path d="M0 200q50 -30 100 -10t200 -20V300H0z" fill="#6aa86a"/>' + ground(248, '#e7d7b5')
      + '<rect x="118" y="96" width="64" height="152" fill="#f2efe6" stroke="#d6cfbf" stroke-width="2"/><path d="M110 96h80l-8 -20h-64z" fill="#c43c2a"/><path d="M126 76q24 -40 48 0z" fill="#c43c2a"/><rect x="147" y="30" width="6" height="12" fill="#c43c2a"/>'
      + '<circle cx="150" cy="124" r="20" fill="#fff" stroke="#3b3b3b" stroke-width="4"/><path d="M150 124v-12M150 124l9 5" stroke="#222" stroke-width="3" stroke-linecap="round"/>'
      + '<g fill="#bfe3ff">' + [0, 1, 2].map((i) => `<rect x="${130 + i * 15}" y="166" width="10" height="18" rx="5"/>`).join('') + '</g><rect x="138" y="214" width="24" height="34" rx="12" fill="#8a5a2b"/>',
    rajaampat: sky('sk6', '#5ec8ff', '#c9f0ff') + sun(240, 60, 20) + cloud(80, 56, .8)
      + '<rect y="170" width="300" height="130" fill="#14a3c7"/><path d="M0 200h300" stroke="#5fd3ea" stroke-width="3" opacity=".7"/><path d="M0 240h300" stroke="#5fd3ea" stroke-width="3" opacity=".5"/>'
      + '<path d="M20 180q20 -60 50 -60q34 4 40 60z" fill="#2f9e55"/><path d="M110 182q16 -80 50 -86q36 10 44 86z" fill="#268a49"/><path d="M200 180q16 -44 40 -46q26 6 36 46z" fill="#33a95c"/>'
      + '<g fill="#1d7a3f">' + [[50, 132], [70, 128], [140, 108], [160, 104], [180, 116], [234, 144]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9"/>`).join('') + '</g>'
      + '<path d="M120 268q20 -10 40 0q-20 10 -40 0z" fill="#ff8a65"/><circle cx="154" cy="266" r="2" fill="#222"/><path d="M60 286q8 -16 16 0M220 284q10 -18 20 0" stroke="#ff6b81" stroke-width="5" fill="none" stroke-linecap="round"/>',
    prambanan: sky('sk7', '#ffcf8a', '#fff1d6') + sun(60, 60, 22, '#ffb020') + cloud(220, 70, .8)
      + ground(244, '#9fd27e', '#82c06a')
      + '<path d="M120 244l6 -150l24 -50l24 50l6 150z" fill="#8f7f6c"/><path d="M128 94h44M126 130h48M124 170h52M122 210h56" stroke="#6f604f" stroke-width="4"/><circle cx="150" cy="40" r="5" fill="#8f7f6c"/>'
      + '<path d="M54 244l4 -90l16 -32l16 32l4 90z" fill="#a3917c"/><path d="M206 244l4 -90l16 -32l16 32l4 90z" fill="#a3917c"/><path d="M60 180h28M212 180h28" stroke="#806f5c" stroke-width="3"/>',
    bromo: sky('sk8', '#ffa77a', '#ffe3c2') + sun(240, 70, 26, '#ff7a45')
      + '<path d="M0 220l70 -90l40 30l40 -60l50 50l40 -20l60 90z" fill="#7a6a8a"/><path d="M110 170q40 -60 80 0z" fill="#6b5b78"/><path d="M130 140q20 -12 40 0" stroke="#3e3448" stroke-width="5" fill="none"/>'
      + '<path d="M146 138q-6 -20 4 -36q-2 18 8 26" stroke="#e8e8e8" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/>'
      + '<rect y="220" width="300" height="80" fill="#c9b08a"/><path d="M0 250q80 -12 160 0t140 -4" stroke="#b39874" stroke-width="4" fill="none"/>'
      + '<g fill="#5a3b26"><path d="M60 262l8 -14l8 14z"/><rect x="66" y="262" width="4" height="8"/></g>',
    toba: sky('sk9', '#86d0ff', '#e3f6ff') + cloud(70, 60) + cloud(220, 76, .8)
      + '<path d="M0 160l60 -40l50 30l60 -50l60 40l70 -30v80H0z" fill="#5f9e72"/>'
      + '<rect y="170" width="300" height="130" fill="#2f8fd1"/><path d="M90 220q60 -34 120 0q-60 24 -120 0z" fill="#4caf63"/><path d="M120 214q30 -16 60 0z" fill="#3c9a53"/>'
      + '<path d="M60 262q20 -10 40 0M200 270q20 -10 40 0" stroke="#8fd0ff" stroke-width="3" fill="none"/>'
      + '<path d="M150 214l-10 -22q10 -10 20 0z" fill="#7a3b22"/><rect x="144" y="200" width="12" height="14" fill="#c4502e"/>',
    honai: sky('sk10', '#9cd8ff', '#ecf9ff') + sun(60, 56, 20) + cloud(230, 60, .8)
      + '<path d="M0 190q70 -60 150 -30t150 -10V300H0z" fill="#4f9a5a"/>' + ground(240, '#8fce7c', '#76bd68')
      + [[100, 1], [200, .8]].map(([x, s]) => `<g transform="translate(${x} 244) scale(${s})"><path d="M-56 -50q56 -90 112 0z" fill="#c7a15a"/><path d="M-56 -50q56 -70 112 0" stroke="#a37e3c" stroke-width="3" fill="none"/><path d="M-30 -84q30 -20 60 0" stroke="#a37e3c" stroke-width="3" fill="none"/><rect x="-46" y="-50" width="92" height="50" fill="#8a5a2b"/><rect x="-10" y="-34" width="20" height="34" rx="2" fill="#4a2f17"/></g>`).join(''),
    komodo: sky('sk11', '#ffd08a', '#fff4dd') + sun(240, 60, 22, '#ffa53d') + cloud(70, 70, .7)
      + '<path d="M0 200q60 -50 120 -30t180 -20V300H0z" fill="#b9a26b"/>' + ground(232, '#d8c690', '#c9b47c')
      + '<path d="M40 242q40 -26 110 -20q40 2 64 -8q22 -6 44 4q-14 6 -24 4q-20 16 -54 22q-60 10 -120 6q-30 -2 -20 -8z" fill="#6f7d4a"/>'
      + '<path d="M70 238l-8 18M110 236l-6 20M170 236l4 18M196 230l8 18" stroke="#5a663a" stroke-width="7" stroke-linecap="round"/>'
      + '<circle cx="246" cy="214" r="3" fill="#222"/><path d="M262 220l12 2l-10 4" stroke="#ff5a5f" stroke-width="2" fill="none"/>' + palm(40, 214, .7),
    ampera: sky('sk12', '#ff9e80', '#ffd9c4') + sun(150, 120, 30, '#ffcf5a')
      + '<rect y="200" width="300" height="100" fill="#3b7fb4"/><path d="M0 232h300M0 262h300" stroke="#6aa7d6" stroke-width="3" opacity=".6"/>'
      + '<rect x="0" y="176" width="300" height="12" fill="#c62f2f"/>'
      + '<rect x="70" y="86" width="16" height="114" fill="#d13a3a"/><rect x="214" y="86" width="16" height="114" fill="#d13a3a"/><rect x="66" y="80" width="24" height="10" fill="#a92424"/><rect x="210" y="80" width="24" height="10" fill="#a92424"/>'
      + '<path d="M86 100h128" stroke="#d13a3a" stroke-width="8"/><g stroke="#a92424" stroke-width="3">' + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${90 + i * 16} 104v72"/>`).join('') + '</g>'
      + '<path d="M120 236q20 -8 40 0l-6 8h-28z" fill="#8a5a2b"/><path d="M140 228v-14l14 12z" fill="#fff"/>',
  };

  const ALBUM = [
    { id: 'monas', order: [0, 2, 6, 8, 3, 5, 4, 7, 1], name: 'Monas', place: 'Jakarta', fact: 'Tugu Monumen Nasional tingginya 132 meter. Puncaknya berbentuk lidah api berlapis emas.' },
    { id: 'borobudur', order: [0, 2, 6, 8, 3, 5, 7, 4, 1], name: 'Candi Borobudur', place: 'Magelang, Jawa Tengah', fact: 'Candi Buddha terbesar di dunia, dibangun lebih dari seribu tahun lalu (abad ke-9).' },
    { id: 'gadang', order: [6, 8, 3, 5, 7, 0, 2, 4, 1], name: 'Rumah Gadang', place: 'Sumatra Barat', fact: 'Rumah adat Minangkabau. Atapnya runcing ke atas seperti tanduk kerbau, disebut gonjong.' },
    { id: 'tongkonan', order: [0, 1, 2, 6, 8, 7, 3, 5, 4], name: 'Tongkonan', place: 'Toraja, Sulawesi Selatan', fact: 'Rumah adat Toraja dengan atap melengkung seperti perahu dan ukiran berwarna merah, hitam, dan kuning.' },
    { id: 'jamgadang', order: [0, 2, 6, 8, 3, 5, 7, 1, 4], name: 'Jam Gadang', place: 'Bukittinggi, Sumatra Barat', fact: 'Menara jam yang dibangun tahun 1926 dan menjadi ikon Kota Bukittinggi.' },
    { id: 'rajaampat', order: [0, 1, 2, 6, 8, 7, 3, 5, 4], name: 'Raja Ampat', place: 'Papua Barat Daya', fact: 'Kepulauan dengan ratusan pulau kecil dan terumbu karang yang sangat kaya. Surga para penyelam!' },
    { id: 'prambanan', order: [0, 2, 6, 8, 3, 5, 7, 4, 1], name: 'Candi Prambanan', place: 'Yogyakarta dan Jawa Tengah', fact: 'Kompleks candi Hindu terbesar di Indonesia. Candi utamanya setinggi sekitar 47 meter.' },
    { id: 'bromo', order: [0, 2, 6, 8, 3, 5, 7, 1, 4], name: 'Gunung Bromo', place: 'Jawa Timur', fact: 'Gunung berapi aktif yang dikelilingi lautan pasir yang luas.' },
    { id: 'toba', order: [0, 1, 2, 3, 5, 6, 8, 4, 7], name: 'Danau Toba', place: 'Sumatra Utara', fact: 'Danau vulkanik terbesar di Indonesia. Di tengahnya ada Pulau Samosir.' },
    { id: 'honai', order: [0, 1, 2, 8, 5, 6, 3, 7, 4], name: 'Honai', place: 'Pegunungan Papua', fact: 'Rumah adat Papua berbentuk bulat beratap jerami, menjaga penghuninya tetap hangat di udara dingin pegunungan.' },
    { id: 'komodo', order: [0, 1, 2, 3, 5, 4, 6, 7, 8], name: 'Komodo', place: 'Nusa Tenggara Timur', fact: 'Kadal terbesar di dunia. Hidup di Taman Nasional Komodo dan hanya ada di Indonesia.' },
    { id: 'ampera', order: [0, 1, 2, 6, 8, 7, 3, 5, 4], name: 'Jembatan Ampera', place: 'Palembang, Sumatra Selatan', fact: 'Jembatan merah di atas Sungai Musi yang diresmikan tahun 1965.' },
  ];
  ALBUM.forEach((a) => { a.svg = `<svg viewBox="0 0 300 300" class="alb-art" role="img" aria-label="${a.name}">${ART[a.id]}</svg>`; });
  window.METIQ_ALBUM = ALBUM;
})();
