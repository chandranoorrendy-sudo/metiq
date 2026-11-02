/* Metiq — teman-teman Meti: Tito si semut (berhitung, pengukuran, uang), Nahla si lebah (geometri, pola, pecahan),
 * dan Lumo si lumba-lumba (waktu, koordinat, data). Dimuat setelah js/mascot.js.
 * Semua memakai wajah, pose, dan warna efek yang sama dengan Meti (METIQ_MASCOT.KIT), viewBox 200 × 200,
 * mata di y ≈ 84 dan mulut di y ≈ 110. Bagian tubuh: lapisan belakang (limbs 'back'), tubuh + wajah, lalu
 * "tangan" di depan (limbs 'front') yang berubah menurut pose.
 *   METIQ_MASCOT.svg('cheer', { size: 120, who: 'nahla' })
 */
(function () {
  const M = window.METIQ_MASCOT;
  if (!M || !M.KIT) return;
  const { tent, star, features } = M.KIT;
  const TEAL = '#35e0bd', TEAL_D = '#1db796', TEAL_L = '#8cf5e0';

  // Papan klip kecil + pensil (pose "ask"), dipakai Tito
  const clipboard = (x, y) => `<g transform="rotate(-8 ${x + 20} ${y + 26})"><rect x="${x}" y="${y}" width="40" height="50" rx="6" fill="#c8741a"/><rect x="${x + 5}" y="${y + 7}" width="30" height="38" rx="3" fill="#fff"/><rect x="${x + 13}" y="${y - 3}" width="14" height="8" rx="3" fill="#9a5a12"/>
    <path d="M${x + 9} ${y + 17}h22M${x + 9} ${y + 25}h22M${x + 9} ${y + 33}h15" stroke="#bfe9e0" stroke-width="3" stroke-linecap="round"/></g>`;
  const pencil = (x, y) => `<g transform="rotate(30 ${x} ${y})"><rect x="${x - 5}" y="${y - 30}" width="10" height="36" rx="2" fill="#ffd54a"/><path d="M${x - 5} ${y + 6}h10l-5 11z" fill="#f3d3a3"/><path d="M${x} ${y + 17}l-2-4h4z" fill="#444"/><rect x="${x - 5}" y="${y - 36}" width="10" height="7" rx="2" fill="#ff9eb5"/></g>`;
  // Lengan berujung bulat; kelas animasi sama dengan Meti
  const limb = (d, w, c, end, endC, cls) => { const s = tent(d, w, c) + (end ? `<circle cx="${end[0]}" cy="${end[1]}" r="${w * 0.72}" fill="${endC || c}"/>` : ''); return cls ? `<g class="${cls}">${s}</g>` : s; };

  /* ---------- Tito si semut merah ---------- */
  const T = { body: '#ff5a5f', shade: '#d93d45', light: '#ff9a9d' };
  const titoAntennae = `<g class="mq-tuft">${tent('M84 40C78 24 70 14 58 12', 6, T.shade)}${tent('M116 40C122 24 130 14 142 12', 6, T.shade)}
    <ellipse cx="58" cy="12" rx="10" ry="7" fill="${TEAL}"/><ellipse cx="55" cy="10" rx="4" ry="2.4" fill="${TEAL_L}"/><ellipse cx="68" cy="22" rx="6.5" ry="4.5" fill="${TEAL_D}"/>
    <ellipse cx="142" cy="12" rx="10" ry="7" fill="${TEAL}"/><ellipse cx="139" cy="10" rx="4" ry="2.4" fill="${TEAL_L}"/><ellipse cx="132" cy="22" rx="6.5" ry="4.5" fill="${TEAL_D}"/></g>`;
  const titoHead = (pose) => `<ellipse cx="100" cy="88" rx="66" ry="56" fill="${T.body}"/>
    <path d="M54 52C64 40 80 35 92 35" fill="none" stroke="${T.light}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="142" cy="50" r="5" fill="${T.light}"/><circle cx="153" cy="65" r="3.2" fill="${T.light}"/>
    <ellipse cx="100" cy="94" rx="56" ry="34" fill="${T.light}" opacity=".35"/>${features(pose, T.shade)}`;
  const tito = {
    id: 'tito', name: 'Tito', label: 'Tito si semut', colors: T, effects: 'sparkles', faceBox: '14 0 172 150',
    body(pose) {
      return `<ellipse cx="100" cy="172" rx="38" ry="24" fill="${T.body}"/><ellipse cx="88" cy="164" rx="16" ry="7" fill="${T.light}" opacity=".6"/>
        <ellipse cx="100" cy="142" rx="25" ry="15" fill="${T.shade}"/>
        ${tent('M86 132L84 160', 6, TEAL)}${tent('M114 132L116 160', 6, TEAL)}<rect x="94" y="140" width="12" height="7" rx="3" fill="${TEAL_D}"/>
        ${titoAntennae}${titoHead(pose)}`;
    },
    limbs(kind, layer) {
      if (layer === 'back') {
        return `<rect x="56" y="126" width="88" height="54" rx="20" fill="${TEAL_D}"/><rect x="64" y="132" width="72" height="12" rx="6" fill="${TEAL}"/>
          ${tent('M74 168C58 174 50 184 46 194', 8, T.shade)}${tent('M126 168C142 174 150 184 154 194', 8, T.shade)}
          ${tent('M74 148C56 148 44 158 36 170', 8, T.shade)}${tent('M126 148C144 148 156 158 164 170', 8, T.shade)}`;
      }
      const c = T.body, e = T.shade;
      let L = limb('M78 136C62 142 54 156 58 170', 9, c, [58, 170], e), R = limb('M122 136C138 142 146 156 142 170', 9, c, [142, 170], e), over = '';
      if (kind === 'wave') R = limb('M122 136C146 126 160 104 158 80', 9, c, [158, 80], e, 'mq-wave');
      if (kind === 'cheer') { L = limb('M78 136C56 124 44 100 46 74', 9, c, [46, 74], e, 'mq-cheerL'); R = limb('M122 136C144 124 156 100 154 74', 9, c, [154, 74], e, 'mq-cheerR'); }
      if (kind === 'think') R = limb('M122 138C150 146 152 128 134 122', 9, c, [134, 122], e);
      if (kind === 'clip') { over = clipboard(28, 124); L = limb('M78 136C64 142 58 150 56 158', 9, c, [56, 158], e); R = limb('M122 136C140 138 150 146 154 154', 9, c, [154, 154], e) + pencil(158, 150); }
      return `<g class="mq-arms">${over}${L}${R}</g>`;
    },
    face(pose) { return `${titoAntennae}${titoHead(pose)}`; },
  };

  /* ---------- Nahla si lebah ---------- */
  const N = { body: '#ffc23d', shade: '#e09b12', light: '#ffe08a', stripe: '#1f3c88' };
  // Pita garis yang mengikuti lengkung tubuh bulat (pusat 100,104; jari-jari 72)
  const band = (y1, y2) => { const R = 72, cy = 104, h = (y) => Math.sqrt(R * R - (y - cy) ** 2); return `<path d="M${100 - h(y1)} ${y1}L${100 + h(y1)} ${y1}A${R} ${R} 0 0 1 ${100 + h(y2)} ${y2}L${100 - h(y2)} ${y2}A${R} ${R} 0 0 1 ${100 - h(y1)} ${y1}Z" fill="${N.stripe}"/>`; };
  const hex = (x, y, r, fill, stroke, op) => `<path d="M${[0, 1, 2, 3, 4, 5].map((i) => { const a = (Math.PI / 3) * i; return `${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`; }).join('L')}Z" fill="${fill || 'none'}"${stroke ? ` stroke="${stroke}" stroke-width="2.5"` : ''}${op ? ` opacity="${op}"` : ''}/>`;
  const nahlaWings = `<g class="mq-wings"><ellipse cx="54" cy="46" rx="32" ry="20" transform="rotate(-32 54 46)" fill="${TEAL}" opacity=".45"/><ellipse cx="146" cy="46" rx="32" ry="20" transform="rotate(32 146 46)" fill="${TEAL}" opacity=".45"/>
    <path d="M70 58C60 48 48 42 36 40M130 58C140 48 152 42 164 40" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></g>`;
  const nahlaAntennae = `<g class="mq-tuft">${tent('M86 40C82 24 74 18 70 10', 5, N.stripe)}${tent('M114 40C118 24 126 18 130 10', 5, N.stripe)}<circle cx="70" cy="10" r="7" fill="${N.stripe}"/><circle cx="130" cy="10" r="7" fill="${N.stripe}"/><circle cx="68" cy="8" r="2.4" fill="#fff" opacity=".7"/><circle cx="128" cy="8" r="2.4" fill="#fff" opacity=".7"/></g>`;
  const nahlaBody = (pose) => `<circle cx="100" cy="104" r="72" fill="${N.body}"/>
    ${band(136, 150)}${band(160, 172)}
    ${hex(80, 126, 7, null, N.shade, '.45')}${hex(93, 126, 7, null, N.shade, '.45')}${hex(106, 126, 7, null, N.shade, '.45')}${hex(119, 126, 7, null, N.shade, '.45')}${hex(100, 155, 6, null, N.light, '.35')}
    <path d="M50 64C60 46 78 38 92 38" fill="none" stroke="${N.light}" stroke-width="9" stroke-linecap="round"/><circle cx="144" cy="54" r="5" fill="${N.light}"/><circle cx="154" cy="70" r="3.2" fill="${N.light}"/>
    <ellipse cx="100" cy="92" rx="58" ry="34" fill="${N.light}" opacity=".4"/>${features(pose, N.shade)}`;
  const nahla = {
    id: 'nahla', name: 'Nahla', label: 'Nahla si lebah', colors: N, effects: 'sparkles', faceBox: '14 0 172 150',
    body(pose) { return nahlaBody(pose); },
    limbs(kind, layer) {
      if (layer === 'back') return `${nahlaWings}${nahlaAntennae}<path d="M90 170L100 190L110 170Z" fill="${N.stripe}" stroke="${N.stripe}" stroke-width="7" stroke-linejoin="round"/>
        <ellipse cx="82" cy="178" rx="9" ry="6" fill="${N.stripe}"/><ellipse cx="118" cy="178" rx="9" ry="6" fill="${N.stripe}"/>`;
      const c = N.shade;
      let L = limb('M34 124C22 134 20 148 28 156', 13, c, [28, 156]), R = limb('M166 124C178 134 180 148 172 156', 13, c, [172, 156]), over = '';
      if (kind === 'wave') R = limb('M166 120C182 110 188 90 180 72', 13, c, [180, 72], null, 'mq-wave');
      if (kind === 'cheer') { L = limb('M34 118C18 106 14 86 22 68', 13, c, [22, 68], null, 'mq-cheerL'); R = limb('M166 118C182 106 186 86 178 68', 13, c, [178, 68], null, 'mq-cheerR'); }
      if (kind === 'think') R = limb('M166 126C180 142 160 150 138 132', 13, c, [138, 132]);
      if (kind === 'clip') { R = limb('M166 124C178 132 180 140 174 148', 13, c, [174, 148]); over = `${hex(170, 156, 20, '#ffb000', '#c8741a')}${hex(170, 156, 12, '#ffd54a')}<path d="M166 172C164 180 168 184 170 184C172 184 176 180 174 172Z" fill="#ffb000"/>`; }
      return `<g class="mq-arms">${L}${over}${R}</g>`;
    },
    face(pose) { return `${nahlaWings}${nahlaAntennae}${nahlaBody(pose)}`; },
  };

  /* ---------- Lumo si lumba-lumba ---------- */
  const L = { body: '#1f3c88', shade: '#142a63', light: '#4a6fc7', belly: TEAL_L };
  const lumoFin = `<path class="mq-tuft" d="M90 32C94 12 112 2 126 4C118 12 112 22 114 36Z" fill="${L.shade}"/>`;
  const lumoSonar = `<g class="mq-sonar" fill="none" stroke="${TEAL_L}" stroke-width="4" stroke-linecap="round"><path d="M176 64Q184 74 176 84"/><path d="M186 58Q198 74 186 90" opacity=".6"/></g>`;
  const lumoBody = (pose) => `<path d="M36 112C28 58 64 24 100 24S172 58 164 112C160 156 134 180 100 180C66 180 40 156 36 112Z" fill="${L.body}"/>
    <ellipse cx="100" cy="148" rx="46" ry="30" fill="${L.belly}"/>
    <path d="M52 58C62 42 78 34 92 34" fill="none" stroke="${L.light}" stroke-width="9" stroke-linecap="round"/><circle cx="142" cy="48" r="5" fill="${L.light}"/><circle cx="153" cy="63" r="3.2" fill="${L.light}"/>
    <ellipse cx="100" cy="82" rx="64" ry="32" fill="${L.light}" opacity=".55"/>
    <ellipse cx="100" cy="116" rx="32" ry="19" fill="${L.belly}"/>${features(pose, L.shade)}`;
  const lumo = {
    id: 'lumo', name: 'Lumo', label: 'Lumo si lumba-lumba', colors: L, effects: 'bubbles', faceBox: '14 0 186 150',
    body(pose) { return lumoBody(pose); },
    limbs(kind, layer) {
      if (layer === 'back') return `${lumoFin}${lumoSonar}<path d="M100 168C90 184 72 192 58 188C70 180 82 170 90 160Z" fill="${L.shade}"/><path d="M100 168C110 184 128 192 142 188C130 180 118 170 110 160Z" fill="${L.shade}"/>`;
      const c = L.light;
      let Lf = limb('M40 128C26 140 22 154 28 166', 16, c), R = limb('M160 128C174 140 178 154 172 166', 16, c), over = '';
      if (kind === 'wave') R = limb('M160 124C178 114 186 94 178 74', 16, c, null, null, 'mq-wave');
      if (kind === 'cheer') { Lf = limb('M40 120C22 108 16 88 24 70', 16, c, null, null, 'mq-cheerL'); R = limb('M160 120C178 108 184 88 176 70', 16, c, null, null, 'mq-cheerR'); }
      if (kind === 'think') R = limb('M160 128C178 142 158 152 136 136', 16, c);
      if (kind === 'clip') { Lf = limb('M40 128C30 136 28 146 32 152', 16, c); over = `<g transform="rotate(-6 46 150)"><rect x="18" y="124" width="48" height="44" rx="6" fill="#fff" stroke="${TEAL_D}" stroke-width="3"/><rect x="26" y="148" width="8" height="12" rx="2" fill="#ff7aa8"/><rect x="38" y="138" width="8" height="22" rx="2" fill="#ffc800"/><rect x="50" y="132" width="8" height="28" rx="2" fill="#6ecbff"/></g>`; }
      return `<g class="mq-arms">${Lf}${over}${R}</g>`;
    },
    face(pose) { return `${lumoFin}${lumoSonar}${lumoBody(pose)}`; },
  };

  [tito, nahla, lumo].forEach(M.register);
})();
