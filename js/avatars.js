/* Metiq — avatar siswa dan guru.
 * Avatar disimpan sebagai teks: emoji biasa, atau "svg:<nama>" untuk ilustrasi buatan sendiri
 * (Ustadz, Ustadzah, anak berhijab, anak berpeci) agar tampil sama di semua HP.
 */
(function () {
  const face = (cx, cy, rx, ry, skin) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${skin}"/>`;
  const eyes = (y, dx = 4.2, cx = 32) => `<circle cx="${cx - dx}" cy="${y}" r="1.7" fill="#2e2018"/><circle cx="${cx + dx}" cy="${y}" r="1.7" fill="#2e2018"/>`;
  const smile = (y, w = 3.6) => `<path d="M${32 - w} ${y}q${w} ${w * 0.9} ${w * 2} 0" stroke="#b5483f" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
  const cheeks = (y) => `<circle cx="25" cy="${y}" r="2.3" fill="#ff8fa3" opacity=".55"/><circle cx="39" cy="${y}" r="2.3" fill="#ff8fa3" opacity=".55"/>`;
  const svg = (bg, body) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="32" fill="${bg}"/>${body}</svg>`;

  const SVG = {
    // Anak perempuan berhijab
    'girl-hijab': svg('#ffe3ec', '<path d="M32 11c-11.5 0-19 8.5-19 20 0 6 1.6 10.6 4.4 14.2C13 48.6 10.5 53 9.6 64h44.8c-.9-11-3.4-15.4-7.8-18.8 2.8-3.6 4.4-8.2 4.4-14.2C51 19.5 43.5 11 32 11z" fill="#ff6f9c"/><path d="M32 16c-8.6 0-14 6.5-14 15.5S23.4 47 32 47s14-6.5 14-15.5S40.6 16 32 16z" fill="#ffa8c5"/>' + face(32, 32.5, 10.5, 11.5, '#f5c7a1') + eyes(31.5) + cheeks(35.5) + smile(37)),
    // Ustadzah (guru perempuan berhijab)
    'ustadzah': svg('#dff4f1', '<path d="M32 10c-12 0-19.5 9-19.5 20.5 0 6.3 1.8 11 4.8 14.6-4.6 3.6-7.4 8-8.3 18.9h46c-.9-10.9-3.7-15.3-8.3-18.9 3-3.6 4.8-8.3 4.8-14.6C51.5 19 44 10 32 10z" fill="#1f8a7d"/><path d="M32 15.5c-8.8 0-14.3 6.7-14.3 15.6S23.2 46 32 46s14.3-6 14.3-14.9S40.8 15.5 32 15.5z" fill="#3fb3a4"/><circle cx="44.5" cy="44" r="2" fill="#ffd166"/>' + face(32, 31.5, 9.8, 11, '#e9b48c') + '<path d="M25.6 30.4q2.2-1.6 4.4 0M34 30.4q2.2-1.6 4.4 0" stroke="#2e2018" stroke-width="1.7" fill="none" stroke-linecap="round"/>' + smile(36, 3.2)),
    // Ustadz (guru laki-laki berpeci dan berbaju koko)
    'ustadz': svg('#e2eeff', '<path d="M11 64c1.4-10.6 9.4-16 21-16s19.6 5.4 21 16z" fill="#ffffff" stroke="#c9d6ea" stroke-width="1.2"/><path d="M29 48h6v6l-3 3-3-3z" fill="#e3e9f3"/><path d="M32 49v15" stroke="#c9d6ea" stroke-width="1.2"/>' + face(32, 31, 10.5, 12, '#d9a37a') + '<ellipse cx="21.6" cy="31.5" rx="2" ry="3" fill="#d09670"/><ellipse cx="42.4" cy="31.5" rx="2" ry="3" fill="#d09670"/><path d="M21.6 32c.6 8.6 4.8 13.2 10.4 13.2S41.8 40.6 42.4 32c-2 3.6-5.6 5.6-10.4 5.6S23.6 35.6 21.6 32z" fill="#3a2a20"/><path d="M28 39.4h8" stroke="#3a2a20" stroke-width="2.2" stroke-linecap="round"/><path d="M21.2 23.6c0-6.4 4.8-9.8 10.8-9.8s10.8 3.4 10.8 9.8v2.4H21.2z" fill="#1e2333"/><path d="M21.2 24.4h21.6" stroke="#3a4157" stroke-width="1.4"/>' + eyes(30) + '<path d="M29 34.6q3 2.2 6 0" stroke="#b5483f" stroke-width="1.6" fill="none" stroke-linecap="round"/>'),
    // Anak laki-laki berpeci
    'boy-peci': svg('#fff1cc', '<path d="M12 64c1.4-10 9-15 20-15s18.6 5 20 15z" fill="#4d96ff"/><path d="M27 49.5l5 5 5-5" stroke="#fff" stroke-width="2" fill="none"/>' + face(32, 32.5, 11, 12, '#f2c49b') + '<ellipse cx="21" cy="33" rx="2" ry="3" fill="#e8b48a"/><ellipse cx="43" cy="33" rx="2" ry="3" fill="#e8b48a"/><path d="M21.4 25c0-6.3 4.7-9.6 10.6-9.6s10.6 3.3 10.6 9.6v2.2H21.4z" fill="#1e2333"/><path d="M21.4 25.8h21.2" stroke="#3a4157" stroke-width="1.4"/>' + eyes(32) + cheeks(36) + smile(37.5)),
  };

  const CATALOG = [
    ['Anak', ['svg:girl-hijab', 'svg:boy-peci', '👧', '👦', '🧒', '👩‍🎓', '👨‍🎓', '🧕']],
    ['Guru', ['svg:ustadzah', 'svg:ustadz', '👩‍🏫', '👨‍🏫']],
    ['Hewan', ['🦁', '🐯', '🐼', '🐨', '🐸', '🐵', '🦊', '🐰', '🐻', '🐧', '🦄', '🐙', '🐳', '🦋', '🐞', '🐢', '🐱', '🐶', '🐮', '🐔', '🦉', '🐠']],
    ['Tumbuhan', ['🌻', '🌵', '🌳', '🌴', '🍀', '🌷', '🌸', '🍁', '🌿', '🍄', '🌹', '🌾']],
    ['Bentuk', ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⭐', '🔷', '🔶', '💠', '❤️', '🟥']],
    ['Ikon', ['⚽', '🏀', '🚀', '🎨', '🎵', '📚', '✏️', '🌙', '☀️', '🌈', '🚲', '🎈', '🧩', '🏆']],
  ];
  const NAMES = { 'svg:girl-hijab': 'Anak berhijab', 'svg:boy-peci': 'Anak berpeci', 'svg:ustadzah': 'Ustadzah', 'svg:ustadz': 'Ustadz' };

  // HTML avatar: ilustrasi SVG atau emoji
  function html(a) {
    const k = String(a || '').startsWith('svg:') ? String(a).slice(4) : null;
    if (k && SVG[k]) return `<span class="avsvg" role="img" aria-label="${NAMES['svg:' + k] || 'avatar'}">${SVG[k]}</span>`;
    return String(a || '🙂').replace(/[<>&"]/g, '');
  }

  window.METIQ_AVATARS = { CATALOG, NAMES, html };
})();
