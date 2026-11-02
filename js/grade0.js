/* Metiq — TK A (setara Pre-K IXL, usia 4–5 tahun) dan TK B (setara Kindergarten IXL, usia 5–6 tahun).
 * Kalimat soal pendek dan bergambar agar bisa dibacakan (tombol 🔊). Kedua jenjang memakai id kelas −2 dan −1
 * sehingga tampil sebelum Kelas 1 dan selalu terbuka.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, range, kata, V, inp, ch, BENDA, lesson } = C.kit;
  const opt4 = (ans, pool) => shuffle([ans, ...shuffle(pool.filter((x) => String(x) !== String(ans))).slice(0, 3)].map(String));
  const nums = (ans, lo, hi) => opt4(ans, range(lo, hi));
  const dots = (n) => `<div class="tkdots">${'●'.repeat(n)}</div>`;
  const SHAPES = ['lingkaran', 'segitiga', 'persegi', 'persegi panjang'];
  const SOLID = [['⚽', 'bola'], ['🎲', 'kubus'], ['🥫', 'tabung'], ['🍦', 'kerucut'], ['🎁', 'kubus'], ['🏀', 'bola'], ['🔋', 'tabung'], ['🎉', 'kerucut']];
  const COLORS = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'];
  const KOIN = [100, 200, 500, 1000];

  const TKA = [
    {
      id: 'TAA', grade: -2, name: 'Bilangan 1 sampai 5', icon: '🖐️', color: '#ff7a59', ixl: 'A–D', sg: 'PAUD · Mengenal bilangan', km: 'Bilangan', coret: false,
      tip: 'Hitung jari tangan, anak tangga, atau kancing baju sambil menyentuh satu per satu.',
      skills: [
        { id: 'TAA1', name: 'Menghitung gambar sampai 5', gen() { const [e, nm] = pick(BENDA), n = r(1, 5); return inp(`Ada berapa ${nm}?`, n, `Sentuh satu per satu sambil menghitung: ${range(1, n).join(', ')}. Ada <b>${n}</b>.`, { vis: V.objects(e, n), meta: { kind: 'count' } }); } },
        { id: 'TAA2', name: 'Mengenal angka sampai 5', gen() { const n = r(1, 5); return ch(`Ketuk angka ${kata(n)}.`, nums(n, 1, 5), n, `Angka ${kata(n)} ditulis <b>${n}</b>.`); } },
        { id: 'TAA3', name: 'Menghitung titik sampai 5', gen() { const n = r(1, 5); return ch('Ada berapa titik?', nums(n, 1, 5), n, `Hitung titiknya: ${range(1, n).join(', ')}. Ada <b>${n}</b> titik.`, { vis: dots(n), meta: { kind: 'count' } }); } },
      ],
    },
    {
      id: 'TAB', grade: -2, name: 'Bilangan 6 sampai 10', icon: '🔟', color: '#4d96ff', ixl: 'E–H', sg: 'PAUD · Mengenal bilangan', km: 'Bilangan', coret: false,
      tip: 'Pakai karton telur berisi 10 lubang sebagai bingkai sepuluh untuk menaruh kelereng.',
      skills: [
        { id: 'TAB1', name: 'Menghitung gambar sampai 10', gen() { const [e, nm] = pick(BENDA), n = r(6, 10); return inp(`Ada berapa ${nm}?`, n, `Hitung satu per satu: ${range(1, n).join(', ')}. Ada <b>${n}</b>.`, { vis: V.objects(e, n), meta: { kind: 'count' } }); } },
        { id: 'TAB2', name: 'Menghitung pada bingkai sepuluh', gen() { const n = r(3, 10); return inp('Ada berapa bulatan merah?', n, `Satu baris berisi 5. ${n > 5 ? `5 dan ${n - 5} lagi` : `Ada ${n}`}: jumlahnya <b>${n}</b>.`, { vis: V.tenFrame(n), meta: { kind: 'count' } }); } },
        { id: 'TAB3', name: 'Angka berikutnya sampai 10', gen() { const s = r(1, 7); const seq = [s, s + 1, s + 2]; return ch(`Setelah ${seq.join(', ')}, angka apa berikutnya?`, nums(s + 3, 1, 10), s + 3, `Berhitung maju satu-satu: ${seq.join(', ')}, <b>${s + 3}</b>.`, { vis: V.seq([...seq, '?']) }); } },
      ],
    },
    {
      id: 'TAC', grade: -2, name: 'Satu lebih dan satu kurang', icon: '➕', color: '#1fbf9f', ixl: 'I', sg: 'PAUD · Mengenal bilangan', km: 'Bilangan', coret: false,
      tip: 'Taruh 4 kue, lalu tambah satu: sekarang ada berapa? Ambil satu: sisa berapa?',
      skills: [
        { id: 'TAC1', name: 'Satu lebih dengan gambar', gen() { const [e] = pick(BENDA), n = r(1, 9); return ch(`Ada ${n}. Satu lagi datang. Sekarang ada berapa?`, nums(n + 1, 1, 10), n + 1, `Satu lebih dari ${n} adalah <b>${n + 1}</b>.`, { vis: V.groups(e, n, 1) }); } },
        { id: 'TAC2', name: 'Satu kurang dengan gambar', gen() { const [e] = pick(BENDA), n = r(2, 10); return ch(`Ada ${n}. Satu diambil. Sisa berapa?`, nums(n - 1, 1, 10), n - 1, `Satu kurang dari ${n} adalah <b>${n - 1}</b>.`, { vis: V.objects(e, n, 1) }); } },
      ],
    },
    {
      id: 'TAD', grade: -2, name: 'Lebih banyak dan lebih sedikit', icon: '⚖️', color: '#e84393', ixl: 'K–L', sg: 'PAUD · Membandingkan', km: 'Bilangan', coret: false,
      tip: 'Jejerkan sendok dan garpu berpasangan: mana yang tersisa? Itulah yang lebih banyak.',
      skills: [
        { id: 'TAD1', name: 'Mana yang lebih banyak', gen() { const s = shuffle(BENDA), a = r(1, 8); let b = r(1, 8); while (b === a) b = r(1, 8); const more = Math.random() < 0.5; const ans = (more ? a > b : a < b) ? s[0][1] : s[1][1]; return ch(`Mana yang lebih ${more ? 'banyak' : 'sedikit'}?`, [s[0][1], s[1][1]], ans, `Ada ${a} ${s[0][1]} dan ${b} ${s[1][1]}. Jawabannya <b>${ans}</b>.`, { vis: V.labeled([[s[0][1], s[0][0], a], [s[1][1], s[1][0], b]]), meta: { kind: 'compare' } }); } },
        { id: 'TAD2', name: 'Angka yang lebih besar', gen() { const [a, b] = shuffle(range(1, 10)).slice(0, 2), big = Math.random() < 0.5, ans = big ? Math.max(a, b) : Math.min(a, b); return ch(`Mana yang lebih ${big ? 'besar' : 'kecil'}?`, [a, b].map(String), ans, `Saat berhitung, ${Math.min(a, b)} datang lebih dulu dari ${Math.max(a, b)}. Jadi yang lebih ${big ? 'besar' : 'kecil'} <b>${ans}</b>.`); } },
      ],
    },
    {
      id: 'TAE', grade: -2, name: 'Pola', icon: '🔁', color: '#9b6dff', ixl: 'M', sg: 'PAUD · Pola', km: 'Aljabar', coret: false,
      tip: 'Susun manik-manik berselang-seling merah-biru-merah-biru, lalu minta anak meneruskan.',
      skills: [
        { id: 'TAE1', name: 'Pola warna', gen() { const [a, b, c] = shuffle(COLORS); const unit = pick([[a, b], [a, b, c], [a, a, b]]); const seq = Array.from({ length: unit.length * 2 + 1 }, (_, i) => unit[i % unit.length]); const ans = unit[(unit.length * 2 + 1) % unit.length]; return ch('Apa berikutnya?', shuffle([...new Set([a, b, c])]), ans, `Polanya berulang: ${unit.join(' ')}. Berikutnya <b>${ans}</b>.`, { vis: V.seq([...seq, '?']) }); } },
        { id: 'TAE2', name: 'Pola gambar', gen() { const [x, y] = shuffle(BENDA).slice(0, 2).map((v) => v[0]); const unit = pick([[x, y], [x, x, y], [x, y, y]]); const seq = Array.from({ length: unit.length * 2 }, (_, i) => unit[i % unit.length]); const ans = unit[0]; return ch('Apa berikutnya?', shuffle([x, y]), ans, `Polanya ${unit.join(' ')} berulang. Berikutnya <b>${ans}</b>.`, { vis: V.seq([...seq, '?']) }); } },
      ],
    },
    {
      id: 'TAF', grade: -2, name: 'Posisi', icon: '↔️', color: '#00b894', ixl: 'N', sg: 'PAUD · Posisi', km: 'Geometri', coret: false,
      tip: 'Main "di mana bonekanya?": di atas meja, di bawah kursi, di kiri, di kanan.',
      skills: [
        { id: 'TAF1', name: 'Kiri, tengah, kanan', gen() { const row = shuffle(BENDA).slice(0, 3); const i = r(0, 2), pos = ['kiri', 'tengah', 'kanan'][i]; return ch(`Gambar apa yang di ${pos}?`, shuffle(row.map((x) => x[0])), row[i][0], `Dari kiri ke kanan: ${row.map((x) => x[0]).join(' ')}. Yang di ${pos} <b>${row[i][0]}</b>.`, { vis: `<div class="tkrow">${row.map((x) => `<span>${x[0]}</span>`).join('')}</div>` }); } },
        { id: 'TAF2', name: 'Atas, tengah, bawah', gen() { const col = shuffle(BENDA).slice(0, 3); const i = r(0, 2), pos = ['atas', 'tengah', 'bawah'][i]; return ch(`Gambar apa yang paling ${pos === 'tengah' ? 'tengah' : pos}?`, shuffle(col.map((x) => x[0])), col[i][0], `Dari atas ke bawah: ${col.map((x) => x[0]).join(' ')}. Yang di ${pos} <b>${col[i][0]}</b>.`, { vis: `<div class="tkcol">${col.map((x) => `<span>${x[0]}</span>`).join('')}</div>` }); } },
      ],
    },
    {
      id: 'TAG', grade: -2, name: 'Bentuk', icon: '🔺', color: '#fdcb6e', ixl: 'O–S', sg: 'PAUD · Bentuk', km: 'Geometri', coret: false,
      tip: 'Cari bentuk di rumah: piring bulat (lingkaran), jendela (persegi), atap (segitiga).',
      skills: [
        { id: 'TAG1', name: 'Nama bentuk datar', gen() { const s = pick(SHAPES); return ch('Bentuk apa ini?', shuffle(SHAPES), s, `Ini <b>${s}</b>.`, { vis: V.shape(s, pick(['#ff7a59', '#4d96ff', '#1fbf9f', '#9b6dff'])) }); } },
        { id: 'TAG2', name: 'Bentuk benda di sekitar kita', gen() { const [e, s] = pick(SOLID); return ch(`Bentuk ${e} seperti apa?`, ['bola', 'kubus', 'tabung', 'kerucut'], s, `${e} berbentuk <b>${s}</b>.`, { vis: `<div class="bigemoji">${e}</div>` }); } },
        { id: 'TAG3', name: 'Sama atau berbeda', gen() { const [a, b] = shuffle(BENDA).slice(0, 2).map((x) => x[0]); const odd = r(0, 3), row = [0, 1, 2, 3].map((i) => (i === odd ? b : a)); return ch('Mana yang berbeda?', shuffle([a, b]), b, `Tiga gambar sama (${a}), satu berbeda: <b>${b}</b>.`, { vis: `<div class="tkrow">${row.map((x) => `<span>${x}</span>`).join('')}</div>` }); } },
      ],
    },
    {
      id: 'TAH', grade: -2, name: 'Ukuran', icon: '📏', color: '#00a8cc', ixl: 'T', sg: 'PAUD · Ukuran', km: 'Pengukuran', coret: false,
      tip: 'Bandingkan dua benda: mana yang lebih panjang, lebih tinggi, lebih berat?',
      skills: [
        { id: 'TAH1', name: 'Lebih berat atau lebih ringan', gen() { const [h, l] = pick([['🐘', '🐭'], ['🚗', '🚲'], ['🍉', '🍒'], ['🐄', '🐔'], ['🏠', '⚽'], ['🐻', '🐦']]); const heavy = Math.random() < 0.5; const row = shuffle([h, l]); return ch(`Mana yang lebih ${heavy ? 'berat' : 'ringan'}?`, row, heavy ? h : l, `${h} lebih berat daripada ${l}. Jawabannya <b>${heavy ? h : l}</b>.`, { vis: `<div class="tkrow">${row.map((x) => `<span>${x}</span>`).join('')}</div>` }); } },
        { id: 'TAH2', name: 'Lebih panjang atau lebih pendek', gen() { const a = r(2, 9); let b = r(2, 9); while (b === a) b = r(2, 9); const long = Math.random() < 0.5, ans = (long ? a > b : a < b) ? 'A' : 'B'; return ch(`Pita mana yang lebih ${long ? 'panjang' : 'pendek'}?`, ['A', 'B'], ans, `Pita A ${a} kotak, pita B ${b} kotak. Jawabannya <b>${ans}</b>.`, { vis: V.bars([{ label: 'A', len: a, color: '#ff7a59' }, { label: 'B', len: b, color: '#4d96ff' }]) }); } },
      ],
    },
    {
      id: 'TAI', grade: -2, name: 'Menambah sampai 5', icon: '🧺', color: '#e17055', ixl: 'V', sg: 'PAUD · Operasi sederhana', km: 'Bilangan', coret: false,
      tip: 'Gabungkan dua genggam kelereng, lalu hitung semuanya.',
      skills: [
        { id: 'TAI1', name: 'Menambah dengan gambar sampai 5', gen() { const [e] = pick(BENDA), a = r(1, 4), b = r(1, 5 - a); return ch(`${a} dan ${b} lagi. Semuanya berapa?`, nums(a + b, 1, 6), a + b, `Hitung semuanya: ${range(1, a + b).join(', ')}. Ada <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
        { id: 'TAI2', name: 'Cerita penjumlahan sampai 5', gen() { const [e, nm] = pick(BENDA), a = r(1, 4), b = r(1, 5 - a), nmA = pick(C.kit.NAMA); return inp(`${nmA} punya ${a} ${nm}. Ibu memberi ${b} lagi. Berapa ${nm} ${nmA} sekarang?`, a + b, `${a} ditambah ${b} = <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
      ],
    },
    {
      id: 'TAJ', grade: -2, name: 'Mengurangi sampai 5', icon: '🍪', color: '#16a085', ixl: 'X', sg: 'PAUD · Operasi sederhana', km: 'Bilangan', coret: false,
      tip: 'Ada 5 kue, adik makan 2. Hitung kue yang tersisa di piring.',
      skills: [
        { id: 'TAJ1', name: 'Mengurangi dengan gambar sampai 5', gen() { const [e] = pick(BENDA), a = r(2, 5), b = r(1, a - 1); return ch(`Ada ${a}. ${b} dicoret. Sisa berapa?`, nums(a - b, 0, 5), a - b, `Hitung yang tidak dicoret: <b>${a - b}</b>.`, { vis: V.objects(e, a, b), meta: { op: '-', a, b } }); } },
      ],
    },
  ];

  const TKB = [
    {
      id: 'TBA', grade: -1, name: 'Bilangan sampai 20', icon: '🔢', color: '#ff7a59', ixl: 'DD–EE', sg: 'TK B · Bilangan', km: 'Bilangan', coret: false,
      tip: 'Hitung anak tangga atau mobil yang lewat sampai 20.',
      skills: [
        { id: 'TBA1', name: 'Menghitung pada dua bingkai sepuluh', gen() { const n = r(11, 20); return inp('Ada berapa bulatan?', n, `Bingkai pertama penuh = 10. Bingkai kedua ${n - 10}. Jumlahnya 10 + ${n - 10} = <b>${n}</b>.`, { vis: V.tenFrame(n, 2), meta: { kind: 'count' } }); } },
        { id: 'TBA2', name: 'Nama bilangan sampai 20', gen() { const n = r(0, 20); return ch(`Ketuk bilangan "${kata(n)}".`, nums(n, Math.max(0, n - 6), Math.min(20, n + 6)), n, `"${kata(n)}" ditulis <b>${n}</b>.`); } },
        { id: 'TBA3', name: 'Menghitung gambar sampai 15', gen() { const [e, nm] = pick(BENDA), n = r(8, 15); return inp(`Ada berapa ${nm}?`, n, `Hitung satu per satu dan tandai yang sudah dihitung. Ada <b>${n}</b>.`, { vis: V.objects(e, n), meta: { kind: 'count' } }); } },
      ],
    },
    {
      id: 'TBB', grade: -1, name: 'Berhitung maju dan mundur', icon: '🔜', color: '#4d96ff', ixl: 'L, GG', sg: 'TK B · Bilangan', km: 'Bilangan', coret: false,
      tip: 'Hitung mundur sebelum meluncur seperti roket: 10, 9, 8, ..., 1, meluncur!',
      skills: [
        { id: 'TBB1', name: 'Sebelum, sesudah, dan di antara', gen() { const n = r(2, 19), kind = pick(['sesudah', 'sebelum', 'antara']); const ans = kind === 'sesudah' ? n + 1 : kind === 'sebelum' ? n - 1 : n; return inp(kind === 'antara' ? `Bilangan apa di antara ${n - 1} dan ${n + 1}?` : `Bilangan apa yang tepat ${kind} ${n}?`, ans, kind === 'antara' ? `${n - 1}, <b>${n}</b>, ${n + 1}.` : `Berhitung ${kind === 'sesudah' ? 'maju' : 'mundur'} satu dari ${n}: <b>${ans}</b>.`, { vis: V.seq(kind === 'antara' ? [n - 1, '?', n + 1] : kind === 'sesudah' ? [n, '?'] : ['?', n]) }); } },
        { id: 'TBB2', name: 'Berhitung mundur', gen() { const s = r(6, 20); const seq = [s, s - 1, s - 2, s - 3]; const j = r(1, 3); return inp('Bilangan apa yang hilang?', seq[j], `Berhitung mundur satu-satu: ${seq.join(', ')}. Yang hilang <b>${seq[j]}</b>.`, { vis: V.seq(seq.map((v, i) => (i === j ? '?' : v))) }); } },
        { id: 'TBB3', name: 'Melompat di garis bilangan', gen() { const a = r(0, 12), b = r(1, 6), fwd = Math.random() < 0.6 || a < b, end = fwd ? a + b : a - b; return inp(`Mulai di ${a}, lompat ${b} kali ke ${fwd ? 'kanan' : 'kiri'}. Sampai di angka berapa?`, end, `Setiap lompatan ${fwd ? 'tambah' : 'kurang'} 1: ${a} ${fwd ? '+' : '−'} ${b} = <b>${end}</b>.`, { vis: V.numberLine(0, 20, { from: a, to: end }) }); } },
      ],
    },
    {
      id: 'TBC', grade: -1, name: 'Membandingkan bilangan sampai 20', icon: '🐊', color: '#1fbf9f', ixl: 'M, HH', sg: 'TK B · Bilangan', km: 'Bilangan', coret: false,
      tip: 'Mulut buaya selalu terbuka ke bilangan yang lebih besar.',
      skills: [
        { id: 'TBC1', name: 'Lebih besar, lebih kecil, atau sama', gen() { return C.kit.compareQ(r(0, 20), r(0, 20)); } },
        { id: 'TBC2', name: 'Bilangan terbesar dari tiga', gen() { const xs = shuffle(range(0, 20)).slice(0, 3), big = Math.random() < 0.5, ans = big ? Math.max(...xs) : Math.min(...xs); return ch(`Mana yang paling ${big ? 'besar' : 'kecil'}?`, xs.map(String), ans, `Urutkan: ${[...xs].sort((a, b) => a - b).join(', ')}. Yang paling ${big ? 'besar' : 'kecil'} <b>${ans}</b>.`); } },
      ],
    },
    {
      id: 'TBD', grade: -1, name: 'Bilangan belasan', icon: '🧱', color: '#e84393', ixl: 'II', sg: 'TK B · Nilai tempat awal', km: 'Bilangan', coret: false,
      tip: 'Ikat 10 stik es krim dengan karet: 1 ikat dan 4 stik lepas = 14.',
      skills: [
        { id: 'TBD1', name: 'Sepuluh dan satuan', gen() { const o = r(1, 9); return inp(`10 dan ${o} = ?`, 10 + o, `Satu puluhan dan ${o} satuan adalah <b>${10 + o}</b>.`, { vis: V.blocks(1, o) }); } },
        { id: 'TBD2', name: 'Memecah bilangan belasan', gen() { const o = r(1, 9); return inp(`${10 + o} = 10 + ?`, o, `${10 + o} terdiri atas 10 dan <b>${o}</b>.`, { vis: V.blocks(1, o) }); } },
      ],
    },
    {
      id: 'TBE', grade: -1, name: 'Loncat sepuluh sampai 100', icon: '💯', color: '#9b6dff', ixl: 'KK–LL', sg: 'TK B · Bilangan', km: 'Bilangan', coret: false,
      tip: 'Hitung jari seluruh keluarga dengan loncat sepuluh: 10, 20, 30, ...',
      skills: [
        { id: 'TBE1', name: 'Membilang loncat 10', gen() { const s = r(1, 6) * 10; const seq = [s, s + 10, s + 20, s + 30]; const j = r(1, 3); return inp('Bilangan apa yang hilang?', seq[j], `Loncat sepuluh: ${seq.join(', ')}. Yang hilang <b>${seq[j]}</b>.`, { vis: V.seq(seq.map((v, i) => (i === j ? '?' : v))) }); } },
        { id: 'TBE2', name: 'Menghitung kelompok sepuluh', gen() { const t = r(1, 9); return inp('Berapa jumlahnya? (setiap batang = 10)', t * 10, `Ada ${t} batang sepuluh: ${range(1, t).map((i) => i * 10).join(', ')}. Jumlahnya <b>${t * 10}</b>.`, { vis: V.blocks(t, 0) }); } },
      ],
    },
    {
      id: 'TBF', grade: -1, name: 'Penjumlahan sampai 10', icon: '➕', color: '#00b894', ixl: 'N–U', sg: 'TK B · Operasi', km: 'Bilangan', coret: false,
      tip: 'Main "membuat 10" dengan jari: 7 jari berdiri, berapa lagi agar 10?',
      skills: [
        { id: 'TBF1', name: 'Menjumlah dengan gambar sampai 10', gen() { const [e] = pick(BENDA), a = r(1, 8), b = r(1, 10 - a); return inp(`${a} + ${b} = ?`, a + b, `Gabungkan dan hitung semuanya: <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
        { id: 'TBF2', name: 'Membuat 10', gen() { const a = r(1, 9); return inp(`${a} + ? = 10`, 10 - a, `Bingkai sepuluh berisi ${a}. Kotak kosongnya <b>${10 - a}</b>.`, { vis: V.tenFrame(a), meta: { kind: 'bond' } }); } },
        { id: 'TBF3', name: 'Cerita penjumlahan sampai 10', gen() { const [e, nm] = pick(BENDA), a = r(1, 7), b = r(1, 10 - a), n1 = pick(C.kit.NAMA); return inp(`${n1} punya ${a} ${nm}. Kakak memberi ${b} lagi. Berapa ${nm} ${n1} sekarang?`, a + b, `"Lagi" berarti ditambah: ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
      ],
    },
    {
      id: 'TBG', grade: -1, name: 'Pengurangan sampai 10', icon: '➖', color: '#fdcb6e', ixl: 'V–AA', sg: 'TK B · Operasi', km: 'Bilangan', coret: false,
      tip: 'Ada 8 balon, 3 terbang. Hitung balon yang masih dipegang.',
      skills: [
        { id: 'TBG1', name: 'Mengurangi dengan gambar sampai 10', gen() { const [e] = pick(BENDA), a = r(2, 10), b = r(1, a - 1); return inp(`${a} − ${b} = ?`, a - b, `Ada ${a}, ${b} dicoret. Sisa <b>${a - b}</b>.`, { vis: V.objects(e, a, b), meta: { op: '-', a, b } }); } },
        { id: 'TBG2', name: 'Cerita pengurangan sampai 10', gen() { const [e, nm] = pick(BENDA), a = r(3, 10), b = r(1, a - 1), n1 = pick(C.kit.NAMA); return inp(`${n1} punya ${a} ${nm}. ${b} diberikan kepada teman. Sisa berapa?`, a - b, `"Diberikan" berarti dikurangi: ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.objects(e, a, b), meta: { op: '-', a, b } }); } },
        { id: 'TBG3', name: 'Tambah atau kurang 0, 1, 2', gen() { const a = r(2, 10), b = r(0, 2), add = Math.random() < 0.5 && a + b <= 10, ans = add ? a + b : a - b; return inp(`${a} ${add ? '+' : '−'} ${b} = ?`, ans, b === 0 ? `Menambah atau mengurangi 0 tidak mengubah bilangan: <b>${a}</b>.` : `Berhitung ${add ? 'maju' : 'mundur'} ${b} dari ${a}: <b>${ans}</b>.`, { meta: { op: add ? '+' : '-', a, b } }); } },
      ],
    },
    {
      id: 'TBH', grade: -1, name: 'Pola dan pengelompokan', icon: '🧩', color: '#00a8cc', ixl: 'MM, OO, UU', sg: 'TK B · Pola', km: 'Aljabar', coret: false,
      tip: 'Kelompokkan mainan menurut warna atau bentuk, lalu hitung setiap kelompok.',
      skills: [
        { id: 'TBH1', name: 'Melengkapi pola', gen() { const [a, b, c] = shuffle(COLORS); const unit = pick([[a, b, c], [a, b, b], [a, a, b, c]]); const seq = Array.from({ length: unit.length * 2 + 2 }, (_, i) => unit[i % unit.length]); const j = r(unit.length, seq.length - 1); return ch('Apa yang hilang?', shuffle([...new Set([a, b, c])]), seq[j], `Polanya ${unit.join(' ')} berulang. Yang hilang <b>${seq[j]}</b>.`, { vis: V.seq(seq.map((v, i) => (i === j ? '?' : v))) }); } },
        { id: 'TBH2', name: 'Mana yang bukan kelompoknya', gen() { const G = pick([[['🍎', '🍌', '🍇', '🍊'], ['🚗', '⚽', '🐱']], [['🐶', '🐱', '🐰', '🐻'], ['🍎', '🚲', '✏️']], [['🚗', '🚌', '🚲', '✈️'], ['🍌', '🐟', '🌸']], [['🔴', '🍓', '🍎', '🌹'], ['🍌', '🐸', '💧']]]); const three = shuffle(G[0]).slice(0, 3), odd = pick(G[1]); return ch('Mana yang bukan kelompoknya?', shuffle([...three, odd]), odd, `${three.join(' ')} satu kelompok. Yang berbeda <b>${odd}</b>.`); } },
      ],
    },
    {
      id: 'TBI', grade: -1, name: 'Bentuk dan bagiannya', icon: '🔷', color: '#e17055', ixl: 'PP–TT', sg: 'TK B · Geometri', km: 'Geometri', coret: false,
      tip: 'Lipat kertas menjadi dua bagian sama besar: itu setengah.',
      skills: [
        { id: 'TBI1', name: 'Banyak sisi dan sudut', gen() { const [s, n] = pick([['segitiga', 3], ['persegi', 4], ['persegi panjang', 4], ['segi enam', 6]]); const what = pick(['sisi', 'sudut (pojok)']); return inp(`Berapa ${what} ${s} ini?`, n, `Hitung ${what === 'sisi' ? 'garis lurusnya' : 'pojoknya'}: ada <b>${n}</b>.`, { vis: V.shape(s, '#4d96ff'), meta: { kind: 'count' } }); } },
        { id: 'TBI2', name: 'Bagian sama besar (setengah)', gen() { const eq = Math.random() < 0.5, kind = pick(['circle', 'rect']); return ch('Apakah kedua bagian sama besar?', ['ya', 'tidak'], eq ? 'ya' : 'tidak', eq ? 'Kedua bagian sama besar: masing-masing <b>setengah</b>.' : 'Satu bagian lebih besar, jadi <b>tidak</b> sama besar.', { vis: kind === 'circle' && !eq ? V.fraction('rect', 2, 1, false) : V.fraction(kind, 2, 1, eq) }); } },
        { id: 'TBI3', name: 'Bangun ruang', gen() { const [e, s] = pick(SOLID); return ch(`${e} berbentuk ...`, ['bola', 'kubus', 'tabung', 'kerucut'], s, `${e} berbentuk <b>${s}</b>.`, { vis: `<div class="bigemoji">${e}</div>` }); } },
      ],
    },
    {
      id: 'TBJ', grade: -1, name: 'Data dan grafik gambar', icon: '📊', color: '#16a085', ixl: 'VV', sg: 'TK B · Data', km: 'Analisis Data dan Peluang', coret: false,
      tip: 'Tanya buah kesukaan keluarga, lalu tempel gambarnya berjajar.',
      skills: [
        { id: 'TBJ1', name: 'Membaca grafik gambar', gen() { const cats = shuffle([['🍎', 'Apel'], ['🍌', 'Pisang'], ['🍊', 'Jeruk']]); const ns = shuffle(range(1, 6)).slice(0, 3); const rows = cats.map((c, i) => [c[0], c[1], ns[i]]); const i = r(0, 2); return inp(`Berapa anak yang suka ${rows[i][1].toLowerCase()}?`, rows[i][2], `Hitung gambar ${rows[i][0]}: ada <b>${rows[i][2]}</b>.`, { vis: V.pictograph('Buah Kesukaan', rows, 'Setiap gambar = 1 anak') }); } },
        { id: 'TBJ2', name: 'Paling banyak dan paling sedikit', gen() { const cats = shuffle([['🐱', 'Kucing'], ['🐶', 'Anjing'], ['🐟', 'Ikan']]); const ns = shuffle(range(1, 6)).slice(0, 3); const rows = cats.map((c, i) => [c[0], c[1], ns[i]]); const most = Math.random() < 0.5; const pickRow = rows.reduce((a, b) => ((most ? b[2] > a[2] : b[2] < a[2]) ? b : a)); return ch(`Hewan apa yang paling ${most ? 'banyak' : 'sedikit'} disukai?`, rows.map((x) => x[1]), pickRow[1], `${pickRow[1]} punya ${pickRow[2]} gambar, paling ${most ? 'banyak' : 'sedikit'}. Jawabannya <b>${pickRow[1]}</b>.`, { vis: V.pictograph('Hewan Kesukaan', rows, 'Setiap gambar = 1 anak') }); } },
      ],
    },
    {
      id: 'TBK', grade: -1, name: 'Mengukur dan waktu', icon: '⏰', color: '#ff9f43', ixl: 'WW–XX', sg: 'TK B · Pengukuran', km: 'Pengukuran', coret: false,
      tip: 'Ukur panjang meja dengan klip kertas atau jengkal tangan.',
      skills: [
        { id: 'TBK1', name: 'Mengukur dengan klip', gen() { const n = r(2, 8); return inp('Berapa klip panjang pensil ini?', n, `Hitung klipnya dari ujung ke ujung: <b>${n}</b> klip.`, { vis: V.clips(n), meta: { kind: 'count' } }); } },
        { id: 'TBK2', name: 'Membaca jam tepat', gen() { const h = r(1, 12); return ch('Jam berapa?', opt4(`pukul ${h}`, range(1, 12).map((x) => `pukul ${x}`)), `pukul ${h}`, `Jarum panjang di angka 12, jarum pendek di angka ${h}: <b>pukul ${h}</b>.`, { vis: V.clock(h, 0) }); } },
      ],
    },
    {
      id: 'TBL', grade: -1, name: 'Mengenal uang', icon: '🪙', color: '#d99a00', ixl: 'YY–ZZ', sg: 'TK B · Uang', km: 'Pengukuran', coret: false,
      tip: 'Main jual-beli dengan koin asli: Rp100, Rp200, Rp500, dan Rp1.000.',
      skills: [
        { id: 'TBL1', name: 'Nilai koin', gen() { const v = pick(KOIN); return ch('Berapa nilai koin ini?', opt4(`Rp${v.toLocaleString('id-ID')}`, KOIN.map((x) => `Rp${x.toLocaleString('id-ID')}`)), `Rp${v.toLocaleString('id-ID')}`, `Angka di koin menunjukkan nilainya: <b>Rp${v.toLocaleString('id-ID')}</b>.`, { vis: V.money([v]) }); } },
        { id: 'TBL2', name: 'Koin mana yang lebih besar nilainya', gen() { const [a, b] = shuffle(KOIN).slice(0, 2); const ans = `Rp${Math.max(a, b).toLocaleString('id-ID')}`; return ch('Koin mana yang nilainya lebih besar?', [a, b].map((x) => `Rp${x.toLocaleString('id-ID')}`), ans, `${Math.max(a, b)} lebih besar dari ${Math.min(a, b)}. Jawabannya <b>${ans}</b>.`, { vis: V.money([a, b]) }); } },
        { id: 'TBL3', name: 'Kebutuhan atau keinginan', gen() { const [it, ans] = pick([['🍚 nasi', 'kebutuhan'], ['💧 air minum', 'kebutuhan'], ['👕 baju', 'kebutuhan'], ['🏠 rumah', 'kebutuhan'], ['🧸 boneka baru', 'keinginan'], ['🍭 permen', 'keinginan'], ['🎮 mainan', 'keinginan'], ['🎈 balon', 'keinginan']]); return ch(`${it}: kebutuhan atau keinginan?`, ['kebutuhan', 'keinginan'], ans, ans === 'kebutuhan' ? 'Kebutuhan adalah yang kita perlukan untuk hidup sehat dan aman.' : 'Keinginan menyenangkan, tetapi kita tetap bisa hidup tanpanya.'); } },
      ],
    },
  ];

  // Pilihan yang isinya hanya gambar (emoji) ditampilkan besar agar mudah diketuk anak
  const EMOJI = /^[\p{Extended_Pictographic}‍️]+$/u, big = (x) => `<span class="tkem">${x}</span>`;
  [...TKA, ...TKB].forEach((u) => u.skills.forEach((sk) => {
    const gen = sk.gen;
    sk.gen = function () { const q = gen.call(this); if (q.type === 'choice' && q.options.every((o) => EMOJI.test(o))) { q.options = q.options.map(big); q.answer = big(q.answer); } return q; };
  }));
  C.register([...TKA, ...TKB]);
  C.GRADES.unshift({ id: -2, name: 'TK A', short: 'A', stage: 'TK', ixl: 'https://www.ixl.com/math/pre-k', sg: 'PAUD (usia 4–5 tahun)' }, { id: -1, name: 'TK B', short: 'B', stage: 'TK', ixl: 'https://www.ixl.com/math/kindergarten', sg: 'PAUD (usia 5–6 tahun)' });

  lesson('TAA', 'Berhitung berarti menyebut satu bilangan untuk setiap benda.', [['Menghitung benda', ['Sentuh benda satu per satu.', 'Sebut bilangannya: satu, dua, tiga.', 'Bilangan terakhir = banyaknya benda.'], 'TAA1']]);
  lesson('TAB', 'Bingkai sepuluh punya 2 baris, setiap baris 5 kotak.', [['Bingkai sepuluh', ['Satu baris penuh = 5.', 'Dua baris penuh = 10.'], 'TAB2']]);
  lesson('TAC', 'Satu lebih berarti tambah satu; satu kurang berarti ambil satu.', [['Satu lebih', ['Hitung, lalu tambah satu lagi.'], 'TAC1'], ['Satu kurang', ['Hitung, lalu ambil satu.'], 'TAC2']]);
  lesson('TAD', 'Pasangkan benda satu-satu untuk melihat mana yang lebih banyak.', [['Membandingkan', ['Jejerkan berpasangan.', 'Yang tersisa = lebih banyak.'], 'TAD1']]);
  lesson('TAE', 'Pola adalah susunan yang berulang.', [['Meneruskan pola', ['Cari bagian yang berulang.', 'Ulangi bagian itu.'], 'TAE1']]);
  lesson('TAF', 'Kata posisi: kiri, kanan, tengah, atas, bawah.', [['Kiri dan kanan', ['Tangan yang memegang sendok biasanya kanan.'], 'TAF1']]);
  lesson('TAG', 'Bentuk datar: lingkaran, segitiga, persegi. Bangun ruang: bola, kubus, tabung, kerucut.', [['Bentuk datar', ['Lingkaran bulat tanpa pojok.', 'Segitiga punya 3 sisi.', 'Persegi punya 4 sisi sama panjang.'], 'TAG1'], ['Bangun ruang', ['Bola menggelinding.', 'Kubus seperti dadu.'], 'TAG2']]);
  lesson('TAH', 'Kita bisa membandingkan panjang, tinggi, dan berat.', [['Membandingkan', ['Jejerkan dari ujung yang sama untuk membandingkan panjang.', 'Angkat dengan dua tangan untuk membandingkan berat.'], 'TAH2']]);
  lesson('TAI', 'Menambah berarti menggabungkan.', [['Menggabungkan', ['Taruh dua kelompok bersama.', 'Hitung semuanya.'], 'TAI1']]);
  lesson('TAJ', 'Mengurangi berarti mengambil.', [['Mengambil', ['Coret yang diambil.', 'Hitung yang tersisa.'], 'TAJ1']]);
  lesson('TBA', 'Bilangan 11 sampai 20 adalah 10 ditambah beberapa.', [['Dua bingkai', ['Bingkai pertama penuh = 10.', 'Hitung terus di bingkai kedua.'], 'TBA1']]);
  lesson('TBB', 'Berhitung maju = tambah satu, mundur = kurang satu.', [['Garis bilangan', ['Ke kanan makin besar.', 'Ke kiri makin kecil.'], 'TBB3']]);
  lesson('TBC', 'Bilangan yang disebut belakangan saat berhitung lebih besar.', [['Tanda', ['> lebih besar dari, < lebih kecil dari, = sama dengan.'], 'TBC1']]);
  lesson('TBD', 'Bilangan belasan = satu puluhan dan beberapa satuan.', [['Puluhan dan satuan', ['14 = 10 + 4.'], 'TBD1']]);
  lesson('TBE', 'Membilang loncat sepuluh: 10, 20, 30, ..., 100.', [['Loncat sepuluh', ['Angka depan bertambah satu, angka belakang tetap 0.'], 'TBE1']]);
  lesson('TBF', 'Penjumlahan sampai 10.', [['Membuat 10', ['Pasangan 10: 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5.'], 'TBF2']]);
  lesson('TBG', 'Pengurangan sampai 10.', [['Mengambil', ['Mulai dari bilangan besar.', 'Berhitung mundur sebanyak yang diambil.'], 'TBG1']]);
  lesson('TBH', 'Pola berulang dan pengelompokan benda.', [['Kelompok', ['Cari kesamaan: warna, bentuk, atau jenis.'], 'TBH2']]);
  lesson('TBI', 'Bentuk punya sisi dan sudut; setengah berarti dua bagian sama besar.', [['Sisi dan sudut', ['Segitiga 3, persegi 4, segi enam 6.'], 'TBI1'], ['Setengah', ['Dua bagian harus sama besar.'], 'TBI2']]);
  lesson('TBJ', 'Grafik gambar membantu membandingkan banyak benda.', [['Membaca grafik', ['Hitung gambar setiap baris.', 'Baris terpanjang = paling banyak.'], 'TBJ1']]);
  lesson('TBK', 'Mengukur panjang dengan benda yang sama, dan membaca jam tepat.', [['Jam tepat', ['Jarum panjang di 12.', 'Jarum pendek menunjuk jamnya.'], 'TBK2']]);
  lesson('TBL', 'Uang dipakai untuk membeli kebutuhan dulu, baru keinginan.', [['Koin', ['Rp100, Rp200, Rp500, Rp1.000.'], 'TBL1'], ['Kebutuhan dan keinginan', ['Kebutuhan: makan, minum, pakaian, rumah.'], 'TBL3']]);
})();
