/* Metiq — Meti, maskot gurita turquoise.
 * Delapan lengan = alat hitung bawaan. Satu fungsi menggambar semua pose sebagai SVG,
 * jadi mengganti maskot cukup mengubah file ini.
 *   METIQ_MASCOT.svg('hello', { size: 160, float: true })
 * Pose: normal, hello, ask, cheer, happy, think, sad, oops
 */
(function () {
  const BODY = '#35e0bd', LIGHT = '#8cf5e0', SHADE = '#1db796', INK = '#04382e', CHEEK = '#ff9eb5';

  const POSES = {
    normal: { eyes: 'n', mouth: 'smile', arms: 'down' },
    hello: { eyes: 'n', mouth: 'open', arms: 'wave' },
    ask: { eyes: 'n', mouth: 'smile', arms: 'clip' },
    cheer: { eyes: 'sparkle', mouth: 'open', arms: 'cheer', confetti: true },
    happy: { eyes: 'happy', mouth: 'open', arms: 'down' },
    think: { eyes: 'n', look: [6, -6], mouth: 'flat', arms: 'think', mark: true },
    sad: { eyes: 'sad', mouth: 'frown', arms: 'down', tear: true },
    oops: { eyes: 'n', look: [0, 4], mouth: 'o', arms: 'down', sweat: true },
  };

  const tent = (d, w, c) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const star = (x, y, r, c) => `<path d="M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z" fill="${c}"/>`;

  function eye(cx, cy, kind, look) {
    const [dx, dy] = look || [0, 0];
    if (kind === 'happy') return `<path d="M${cx - 15} ${cy + 6}Q${cx} ${cy - 16} ${cx + 15} ${cy + 6}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    const pupil = kind === 'sparkle'
      ? `<circle cx="${cx + dx}" cy="${cy + dy}" r="12.5" fill="${INK}"/>${star(cx + dx - 3, cy + dy - 4, 5.5, '#fff')}${star(cx + dx + 5, cy + dy + 5, 3, '#fff')}`
      : `<circle cx="${cx + dx}" cy="${cy + dy}" r="10.5" fill="${INK}"/><circle cx="${cx + dx - 3.5}" cy="${cy + dy - 3.5}" r="3.6" fill="#fff"/>`;
    return `<g class="mq-eye"><circle cx="${cx}" cy="${cy}" r="21" fill="#fff"/>${pupil}</g>`;
  }

  function mouth(kind) {
    if (kind === 'open') return `<path d="M85 106Q100 140 115 106Z" fill="${INK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="100" cy="123" rx="7" ry="4.5" fill="${CHEEK}"/>`;
    if (kind === 'o') return `<ellipse cx="100" cy="118" rx="6.5" ry="8.5" fill="${INK}"/>`;
    if (kind === 'frown') return `<path d="M87 122Q100 108 113 122" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    if (kind === 'flat') return `<path d="M90 116Q100 120 110 114" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    return `<path d="M86 109Q100 125 114 109" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }

  // Delapan lengan: empat di belakang (lebih gelap), empat di depan. Lengan luar berubah menurut pose.
  function arms(kind) {
    const back = [
      tent('M66 126C46 148 44 176 58 186', 17, SHADE), tent('M100 128C96 152 98 174 102 190', 17, SHADE),
      tent('M134 126C154 148 156 176 142 186', 17, SHADE), tent('M82 128C74 156 78 178 88 190', 16, SHADE),
    ].join('');
    const inL = tent('M80 126C66 150 70 180 90 184C101 186 104 175 95 172', 21, BODY);
    const inR = tent('M120 126C134 150 130 180 110 184C99 186 96 175 105 172', 21, BODY);
    const dotsL = '<circle cx="73" cy="156" r="3" fill="#b9fff0"/><circle cx="76" cy="170" r="3" fill="#b9fff0"/>';
    const dotsR = '<circle cx="127" cy="156" r="3" fill="#b9fff0"/><circle cx="124" cy="170" r="3" fill="#b9fff0"/>';
    const outL = tent('M52 118C24 126 14 158 36 172C50 178 62 168 54 160', 22, BODY);
    const outR = tent('M148 118C176 126 186 158 164 172C150 178 138 168 146 160', 22, BODY);
    let L = outL, R = outR, over = '';
    if (kind === 'wave') R = `<g class="mq-wave">${tent('M148 116C174 110 188 84 178 58C174 48 162 50 166 60', 22, BODY)}</g>`;
    if (kind === 'cheer') {
      L = `<g class="mq-cheerL">${tent('M52 116C26 106 12 78 22 52C26 42 38 46 34 56', 22, BODY)}</g>`;
      R = `<g class="mq-cheerR">${tent('M148 116C174 106 188 78 178 52C174 42 162 46 166 56', 22, BODY)}</g>`;
    }
    if (kind === 'think') R = tent('M148 120C170 132 150 146 124 128', 22, BODY);
    if (kind === 'clip') {
      L = tent('M52 118C30 124 20 146 30 160', 22, BODY);
      over = `<g transform="rotate(-8 56 150)"><rect x="30" y="118" width="52" height="64" rx="7" fill="#c8741a"/><rect x="36" y="127" width="40" height="49" rx="3" fill="#fff"/><rect x="47" y="114" width="18" height="10" rx="3" fill="#9a5a12"/>
        <path d="M41 138h30M41 147h30M41 156h22" stroke="#bfe9e0" stroke-width="3" stroke-linecap="round"/></g>${tent('M30 160C32 166 44 168 48 160', 17, BODY)}`;
      R = tent('M148 118C170 124 178 142 168 156', 22, BODY)
        + '<g transform="rotate(32 160 142)"><rect x="150" y="112" width="12" height="46" rx="2" fill="#ffd54a"/><path d="M150 158h12l-6 14z" fill="#f3d3a3"/><path d="M156 172l-2.4-4.8h4.8z" fill="#444"/><rect x="150" y="106" width="12" height="8" rx="2" fill="#ff9eb5"/></g>'
        + tent('M168 156C160 158 156 150 160 146', 15, BODY);
    }
    return `<g class="mq-arms">${back + L + R + inL + inR + dotsL + dotsR}</g>${over}`;
  }

  function head(pose) {
    const p = POSES[pose] || POSES.normal;
    const look = p.look || [0, 0];
    return `
      <path class="mq-tuft" d="M100 26C94 8 114 2 112 16" fill="none" stroke="${SHADE}" stroke-width="7" stroke-linecap="round"/>
      <path d="M34 120C24 62 62 22 100 22S176 62 166 120C162 138 38 138 34 120Z" fill="${BODY}"/>
      <path d="M52 52C62 36 80 30 92 30" fill="none" stroke="${LIGHT}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="140" cy="46" r="5" fill="${LIGHT}"/><circle cx="152" cy="62" r="3.2" fill="${LIGHT}"/><circle cx="48" cy="72" r="3.6" fill="${LIGHT}"/>
      <ellipse cx="100" cy="92" rx="66" ry="40" fill="${LIGHT}" opacity=".5"/>
      <ellipse cx="54" cy="108" rx="10" ry="6.5" fill="${CHEEK}" opacity=".7"/><ellipse cx="146" cy="108" rx="10" ry="6.5" fill="${CHEEK}" opacity=".7"/>
      ${eye(74, 84, p.eyes, look)}${eye(126, 84, p.eyes, look)}
      ${p.eyes === 'sad' ? `<path d="M52 72L88 62M148 72L112 62" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` : ''}
      ${mouth(p.mouth)}
      ${p.tear ? '<path d="M64 108C58 118 60 126 66 126C72 126 74 118 64 108Z" fill="#7fd3ff"/>' : ''}
      ${p.sweat ? '<path d="M158 40C152 50 154 58 160 58C166 58 168 50 158 40Z" fill="#7fd3ff"/>' : ''}
      ${p.mark ? `<circle cx="172" cy="30" r="15" fill="#fff" stroke="${SHADE}" stroke-width="4"/><text x="172" y="38" text-anchor="middle" font-size="22" font-weight="900" fill="${INK}" font-family="Nunito,sans-serif">?</text>` : ''}
      ${p.confetti ? `${star(24, 34, 9, '#ffc800')}${star(178, 28, 8, '#ff7aa8')}${star(14, 98, 6, '#6ecbff')}${star(188, 96, 7, '#ffc800')}<circle cx="46" cy="14" r="4" fill="#ff7aa8"/><circle cx="154" cy="12" r="4" fill="#6ecbff"/>` : ''}`;
  }

  // Gelembung kecil yang naik saat Meti muncul (animasi di css/duo.css)
  const BUBBLES = '<g class="mq-bubbles"><circle class="b1" cx="30" cy="150" r="6"/><circle class="b2" cx="172" cy="140" r="5"/><circle class="b3" cx="96" cy="176" r="4"/><circle class="b4" cx="150" cy="172" r="3"/></g>';
  // enter: false = tanpa animasi muncul (dipakai saat maskot diganti pose di tengah soal)
  function svg(pose = 'normal', o = {}) {
    const p = POSES[pose] || POSES.normal, size = o.size || 140, enter = o.enter !== false;
    return `<svg class="mq-mascot mq-p-${pose}${enter ? ' mq-enter' : ''}${o.float ? ' mq-float' : ''}${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="Meti si gurita">${enter ? BUBBLES : ''}${arms(p.arms)}${head(pose)}</svg>`;
  }
  // Hanya kepala (untuk ikon kecil dan avatar)
  function face(size = 48, pose = 'normal') {
    return `<svg class="mq-mascot mq-face" viewBox="14 8 172 140" width="${size}" height="${Math.round(size * 140 / 172)}" role="img" aria-label="Meti">${head(pose)}</svg>`;
  }

  window.METIQ_MASCOT = { name: 'Meti', svg, face, poses: Object.keys(POSES) };
})();
