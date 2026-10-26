/* Metiq — Kurikulum Matematika Kelas 3
 * Dari daftar keterampilan IXL kelas 3 dan Singapore Math 3A/3B: bilangan sampai 10.000,
 * tabel perkalian sampai 12, pembagian bersisa, perkalian bersusun, pecahan senilai,
 * luas dan keliling, sudut siku-siku, waktu sampai menit, serta satuan metrik.
 */
(function () {
  const C = window.METIQ_CURRICULUM;
  const { r, pick, shuffle, range, rp, V, inp, ch, compareQ, two, fmt, opts4, hasCarry, hasBorrow, stack, U } = C.kit;
  const hm = (h, m) => `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
  const grid = (rows, cols) => `<div class="rgrid" style="grid-template-columns:repeat(${cols},22px)">${'<i></i>'.repeat(rows * cols)}</div>`;
  const R = (n, t) => Math.floor(n / t + 0.5) * t;
  const cmpFrac = (a, b, va, vb, tags = {}) => { const s = va < vb ? '<' : va > vb ? '>' : '='; return ch('Pilih tanda yang tepat.', ['<', '>', '='], s, '', { vis: V.big(`${a} <span class="q">?</span> ${b}`), optionTags: tags }); };
  const JAJAR = '<svg class="shape" viewBox="0 0 120 120" style="fill:#0984e3"><polygon points="6,96 82,96 114,24 38,24"/></svg>';

  const UNITS = [
    {
      id: '3A', grade: 3, name: 'Bilangan sampai 10.000', icon: '🔢', color: '#ff7a59',
      sg: '3A · Numbers to 10,000', ixl: 'A, B, M', km: 'Bilangan (CP Fase B: bilangan cacah sampai 10.000)',
      tip: 'Tulis nomor rumah, harga, atau tahun di kertas, lalu tanyakan nilai setiap angkanya.',
      skills: [
        { id: '3A1', name: 'Nilai angka sampai ribuan', gen() { const d = shuffle(range(1, 9)).slice(0, 4), n = +d.join(''), pos = r(0, 3), val = d[pos] * 10 ** (3 - pos); const tags = {}; if (pos < 3) tags[String(d[pos])] = 'nilai-tempat'; return ch(`Pada bilangan <b>${fmt(n)}</b>, angka ${d[pos]} bernilai berapa?`, opts4(fmt(val), [d[pos], d[pos] * 10, d[pos] * 100, d[pos] * 1000].map(fmt)), fmt(val), `Angka ${d[pos]} ada di tempat ${['ribuan', 'ratusan', 'puluhan', 'satuan'][pos]}, jadi nilainya <b>${fmt(val)}</b>.`, { optionTags: tags }); } },
        { id: '3A2', name: 'Bentuk panjang', gen() { const n = r(1001, 9999), [a, b, c, d] = String(n).split('').map(Number); if (Math.random() < 0.5) return inp(`${a * 1000} + ${b * 100} + ${c * 10} + ${d} = ?`, n, `Gabungkan ribuan, ratusan, puluhan, satuan: <b>${fmt(n)}</b>.`, { meta: { kind: 'place' } }); return inp(`${fmt(n)} = ${fmt(a * 1000)} + ? + ${c * 10} + ${d}`, b * 100, `${b} ada di tempat ratusan, nilainya <b>${b * 100}</b>.`, { meta: { kind: 'place', alt: { [String(b)]: 'nilai-tempat' } } }); } },
        { id: '3A3', name: 'Membandingkan bilangan sampai 10.000', gen() { const a = r(1000, 9999); const b = Math.random() < 0.5 ? Math.floor(a / 1000) * 1000 + r(0, 999) : r(1000, 9999); return compareQ(a, b); } },
        { id: '3A4', name: 'Bilangan terbesar dan terkecil dari kartu angka', gen() { const d = shuffle(range(0, 9)).slice(0, 4); const big = Math.random() < 0.5; let s = d.slice().sort((x, y) => (big ? y - x : x - y)); if (!big && s[0] === 0) { const i = s.findIndex((x) => x > 0); [s[0], s[i]] = [s[i], s[0]]; } const n = +s.join(''); return inp(`Susun keempat kartu menjadi bilangan ${big ? 'terbesar' : 'terkecil'}.`, n, big ? `Taruh angka terbesar di tempat ribuan, lalu urut mengecil: <b>${fmt(n)}</b>.` : `Taruh angka terkecil (bukan 0) di depan, lalu urut membesar: <b>${fmt(n)}</b>.`, { vis: V.seq(d), meta: { kind: 'place' } }); } },
      ],
    },
    {
      id: '3B', grade: 3, name: 'Pembulatan dan perkiraan', icon: '🎯', color: '#7c5cff',
      sg: '3A · Estimation (rounding)', ixl: 'C, D, E, F', km: 'Bilangan',
      tip: 'Saat belanja, minta anak memperkirakan total dengan membulatkan harga ke ribuan terdekat.',
      skills: [
        { id: '3B1', name: 'Membulatkan ke puluhan atau ratusan terdekat', gen() { const t = pick([10, 100]), n = r(t === 10 ? 101 : 1001, 9999); if (n % t === 0) return C.SKILLS['3B1'].gen(); const lo = Math.floor(n / t) * t, ans = R(n, t), wrong = ans === lo ? lo + t : lo; return inp(`Bulatkan ${fmt(n)} ke ${t === 10 ? 'puluhan' : 'ratusan'} terdekat.`, ans, `${fmt(n)} ada di antara ${fmt(lo)} dan ${fmt(lo + t)}. Lihat angka ${t === 10 ? 'satuan' : 'puluhan'}nya: 5 atau lebih dibulatkan ke atas. Jawabannya <b>${fmt(ans)}</b>.`, { meta: { kind: 'round', wrong } }); } },
        { id: '3B2', name: 'Memperkirakan hasil penjumlahan', gen() { const a = r(110, 890), b = r(110, 890), ans = R(a, 100) + R(b, 100); return inp(`Perkirakan ${a} + ${b} dengan membulatkan ke ratusan terdekat.`, ans, `${a} ≈ ${R(a, 100)} dan ${b} ≈ ${R(b, 100)}. ${R(a, 100)} + ${R(b, 100)} = <b>${fmt(ans)}</b> (hasil sebenarnya ${fmt(a + b)}).`, { meta: { kind: 'estimate' } }); } },
        { id: '3B3', name: 'Memperkirakan hasil pengurangan', gen() { const a = r(500, 990), b = r(110, a - 150), ans = R(a, 100) - R(b, 100); return inp(`Perkirakan ${a} − ${b} dengan membulatkan ke ratusan terdekat.`, ans, `${a} ≈ ${R(a, 100)} dan ${b} ≈ ${R(b, 100)}. ${R(a, 100)} − ${R(b, 100)} = <b>${ans}</b> (hasil sebenarnya ${a - b}).`, { meta: { kind: 'estimate' } }); } },
      ],
    },
    {
      id: '3C', grade: 3, name: 'Penjumlahan dan pengurangan sampai 10.000', icon: '➕', color: '#00b894',
      sg: '3A · Addition and Subtraction within 10,000', ixl: 'G, H, I, J, K, L', km: 'Bilangan',
      tip: 'Periksa jawaban pengurangan dengan penjumlahan: 5.230 − 1.875 = 3.355, karena 3.355 + 1.875 = 5.230.',
      skills: [
        { id: '3C1', name: 'Menjumlah bilangan tiga angka', gen() { let a, b; do { a = r(150, 750); b = r(120, 999 - a); } while (!hasCarry(a, b)); return inp(`${a} + ${b} = ?`, a + b, `Jumlahkan dari satuan. Kolom yang berjumlah 10 atau lebih menyimpan 1 ke kolom berikutnya. Jawabannya <b>${a + b}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: true } }); } },
        { id: '3C2', name: 'Menjumlah bilangan empat angka', gen() { let a, b; do { a = r(1200, 7800); b = r(1100, 9999 - a); } while (!hasCarry(a, b)); return inp(`${a} + ${b} = ?`, a + b, `Jumlahkan bersusun dari satuan sampai ribuan, jangan lupa simpanan. Jawabannya <b>${fmt(a + b)}</b>.`, { vis: stack(a, '+', b), meta: { op: '+', a, b, regroup: true } }); } },
        { id: '3C3', name: 'Mengurangi bilangan empat angka', gen() { let a, b; do { a = r(3000, 9999); b = r(1001, a - 200); } while (!hasBorrow(a, b)); return inp(`${a} − ${b} = ?`, a - b, `Kurangi bersusun dari satuan. Jika angka atas lebih kecil, pinjam 1 dari kolom kirinya. Jawabannya <b>${fmt(a - b)}</b>.`, { vis: stack(a, '−', b), meta: { op: '-', a, b, regroup: true } }); } },
        { id: '3C4', name: 'Soal cerita sampai 10.000', gen() { const [n1] = two(); if (Math.random() < 0.5) { const a = r(1200, 5000), b = r(800, 4000); return inp(pick([`Sebuah sekolah punya ${fmt(a)} buku di perpustakaan dan ${fmt(b)} buku di kelas. Berapa buku semuanya?`, `Hari Sabtu ada ${fmt(a)} pengunjung kebun binatang, hari Minggu ${fmt(b)}. Berapa pengunjung kedua hari itu?`]), a + b, `${fmt(a)} + ${fmt(b)} = <b>${fmt(a + b)}</b>.`, { vis: V.barModel([[[fmt(a), '', a], [fmt(b), '', b]]], '?'), meta: { op: '+', a, b, regroup: hasCarry(a, b) } }); } const a = r(3000, 9500), b = r(900, a - 500); return inp(`${n1} menabung untuk sepeda seharga Rp${fmt(a)}.000. Ia sudah punya Rp${fmt(b)}.000. Berapa ribu rupiah lagi yang dibutuhkan?`, a - b, `${fmt(a)} − ${fmt(b)} = <b>${fmt(a - b)}</b> ribu rupiah.`, { vis: V.barModel([[[fmt(b), 'sudah', b], ['?', 'kurang', a - b]]], fmt(a)), meta: { op: '-', a, b, regroup: hasBorrow(a, b) } }); } },
      ],
    },
    {
      id: '3D', grade: 3, name: 'Arti dan sifat perkalian', icon: '🧩', color: '#fd79a8',
      sg: '3A · Multiplication (properties)', ixl: 'N, S', km: 'Bilangan (perkalian; CP Fase B)',
      tip: 'Susun kancing atau tutup botol menjadi baris dan kolom. Putar susunannya: 3 × 4 sama banyak dengan 4 × 3.',
      skills: [
        { id: '3D1', name: 'Kelompok sama banyak dan kalimat perkalian', gen() { const g = r(2, 6), e = r(2, 9); const good = `${g} × ${e}`; return ch(`Ada ${g} piring, setiap piring berisi ${e} kue. Kalimat perkalian mana yang sesuai?`, opts4(good, [`${g} + ${e}`, `${g} × ${e + 1}`, `${g + 1} × ${e}`, `${g} × ${Math.max(1, e - 1)}`]), good, `${g} kelompok berisi ${e} ditulis <b>${good}</b> = ${g * e}.`, { vis: '<div class="eqg">' + range(1, g).map(() => `<div class="plate">${'🍪'.repeat(e)}</div>`).join('') + '</div>' }); } },
        { id: '3D2', name: 'Sifat perkalian', gen() { const a = r(2, 12), b = r(2, 9), c = r(2, 5); const t = r(0, 3); if (t === 0) return inp(`${a} × 0 = ?`, 0, 'Bilangan apa pun dikali 0 hasilnya <b>0</b>: 0 kelompok berarti tidak ada apa-apa.'); if (t === 1) return inp(`1 × ${a} = ?`, a, `Bilangan dikali 1 hasilnya bilangan itu sendiri: <b>${a}</b>.`); if (t === 2) return inp(`${a} × ${b} = ${b} × ?`, a, `Urutan perkalian boleh ditukar (sifat pertukaran). Jawabannya <b>${a}</b>.`); return inp(`(${b} × ${c}) × 2 = ${b} × (${c} × ?)`, 2, 'Pengelompokan perkalian boleh diubah (sifat pengelompokan). Jawabannya <b>2</b>.'); } },
        { id: '3D3', name: 'Sifat distributif (memecah perkalian)', gen() { const a = r(3, 9), b = r(6, 9), p = 5; return inp(`${a} × ${b} = ${a} × ${p} + ${a} × ?`, b - p, `Pecah ${b} menjadi ${p} + ${b - p}. Jadi ${a} × ${b} = ${a} × ${p} + ${a} × <b>${b - p}</b> = ${a * p} + ${a * (b - p)} = ${a * b}.`, { vis: V.bond(b, p, '?') }); } },
      ],
    },
    {
      id: '3E', grade: 3, name: 'Tabel perkalian sampai 12', icon: '✖️', color: '#e17055',
      sg: '3A · Multiplication Tables of 6, 7, 8 and 9', ixl: 'O, P, Q, R', km: 'Bilangan',
      tip: 'Latih 5 menit sehari. Trik perkalian 9: 9 × 7 = 63, angka puluhan 1 kurang dari 7, dan 6 + 3 = 9.',
      skills: [
        { id: '3E1', name: 'Perkalian 6 dan 7', gen() { const a = pick([6, 7]), b = r(1, 10), [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]; return inp(`${x} × ${y} = ?`, x * y, `${a} × ${b} = ${a} × 5 + ${a} × ${b - 5 >= 0 ? b - 5 : 0}${b < 5 ? ' (atau lompat hitung)' : ''}. Jawabannya <b>${x * y}</b>.`, { vis: V.big(`${x} × ${y} = <span class="q">?</span>`), meta: { op: 'x', a: x, b: y } }); } },
        { id: '3E2', name: 'Perkalian 8 dan 9', gen() { const a = pick([8, 9]), b = r(1, 10), [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]; return inp(`${x} × ${y} = ?`, x * y, a === 9 ? `9 × ${b} = 10 × ${b} − ${b} = ${10 * b} − ${b} = <b>${9 * b}</b>.` : `8 × ${b} = dobel dari 4 × ${b} = 2 × ${4 * b} = <b>${8 * b}</b>.`, { vis: V.big(`${x} × ${y} = <span class="q">?</span>`), meta: { op: 'x', a: x, b: y } }); } },
        { id: '3E3', name: 'Perkalian campuran sampai 12 × 12', gen() { const a = r(2, 12), b = r(2, 12); return inp(`${a} × ${b} = ?`, a * b, `${a} × ${b} = <b>${a * b}</b>.${a > 10 || b > 10 ? ` Tips: ${Math.max(a, b)} × ${Math.min(a, b)} = 10 × ${Math.min(a, b)} + ${Math.max(a, b) - 10} × ${Math.min(a, b)}.` : ''}`, { vis: V.big(`${a} × ${b} = <span class="q">?</span>`), meta: { op: 'x', a, b } }); } },
        { id: '3E4', name: 'Faktor yang hilang', gen() { const a = r(2, 10), b = r(2, 10); return inp(`? × ${b} = ${a * b}`, a, `Cari bilangan yang dikali ${b} menjadi ${a * b}: ${a} × ${b} = ${a * b}. Jawabannya <b>${a}</b>.`, { vis: V.big(`<span class="q">?</span> × ${b} = ${a * b}`) }); } },
      ],
    },
    {
      id: '3F', grade: 3, name: 'Pembagian', icon: '➗', color: '#0984e3',
      sg: '3A · Division (with remainder)', ixl: 'V, W, X, Y, Z, AA', km: 'Bilangan',
      tip: 'Bagikan kartu ke beberapa orang. Jika ada yang tersisa, itulah "sisa".',
      skills: [
        { id: '3F1', name: 'Arti pembagian', gen() { const g = r(2, 6), e = r(2, 6), t = g * e; if (Math.random() < 0.5) return inp(`${t} permen dibagi rata kepada ${g} anak. Tiap anak dapat berapa? (${t} ÷ ${g})`, e, `Bagikan satu per satu sampai habis: tiap anak dapat <b>${e}</b>, karena ${g} × ${e} = ${t}.`, { vis: V.objects('🍬', t) + '<div class="kids">' + '🧒'.repeat(g) + '</div>', meta: { op: '/', a: t, b: g } }); return inp(`${t} kelereng dimasukkan ke kantong, setiap kantong ${e} kelereng. Berapa kantong? (${t} ÷ ${e})`, g, `Kelompokkan ${e}-${e}: ada <b>${g}</b> kantong.`, { vis: V.objects('🔵', t), meta: { op: '/', a: t, b: e } }); } },
        { id: '3F2', name: 'Fakta pembagian sampai 100', gen() { const d = r(2, 10), q = r(1, 10); return inp(`${d * q} ÷ ${d} = ?`, q, `Pikirkan perkalian: ${d} × ? = ${d * q}. Karena ${d} × ${q} = ${d * q}, jawabannya <b>${q}</b>.`, { vis: V.big(`${d * q} ÷ ${d} = <span class="q">?</span>`), meta: { op: '/', a: d * q, b: d } }); } },
        { id: '3F3', name: 'Pembagian bersisa', gen() { const d = r(2, 9), q = r(2, 9), s = r(1, d - 1), n = d * q + s; if (Math.random() < 0.5) return inp(`${n} ÷ ${d} = ? sisa ${s}`, q, `${d} × ${q} = ${d * q}, dan ${n} − ${d * q} = ${s}. Jadi hasil baginya <b>${q}</b> sisa ${s}.`, { vis: V.objects('🍓', n) }); return inp(`${n} ÷ ${d} = ${q} sisa ?`, s, `${d} × ${q} = ${d * q}. Sisanya ${n} − ${d * q} = <b>${s}</b>. Sisa selalu lebih kecil dari pembagi (${d}).`, { vis: V.objects('🍓', n), meta: { op: '-', a: n, b: d * q } }); } },
        { id: '3F4', name: 'Soal cerita pembagian', gen() { const d = r(3, 9), q = r(3, 9), s = r(1, d - 1), n = d * q + s; if (Math.random() < 0.5) return inp(`Ada ${n} murid yang akan naik mobil. Setiap mobil muat ${d} murid. Berapa mobil yang dibutuhkan agar semua murid terangkut?`, q + 1, `${n} ÷ ${d} = ${q} sisa ${s}. Sisa ${s} murid masih butuh 1 mobil lagi, jadi <b>${q + 1}</b> mobil.`, { meta: { alt: { [String(q)]: 'sisa' } } }); return inp(`Ibu punya ${n} kue dan memasukkan ${d} kue ke setiap kotak. Berapa kotak yang terisi penuh?`, q, `${n} ÷ ${d} = ${q} sisa ${s}. Kotak yang penuh ada <b>${q}</b>, sisa ${s} kue tidak cukup untuk satu kotak.`, { meta: { alt: { [String(q + 1)]: 'sisa' } } }); } },
      ],
    },
    {
      id: '3G', grade: 3, name: 'Perkalian dan pembagian bersusun', icon: '🧮', color: '#00cec9',
      sg: '3A · Multiplication and Division (2- and 3-digit by 1-digit)', ixl: 'U', km: 'Bilangan',
      tip: 'Kalikan per tempat: 46 × 3 = 40 × 3 + 6 × 3 = 120 + 18 = 138.',
      skills: [
        { id: '3G1', name: 'Dua angka dikali satu angka', gen() { const a = r(12, 99), b = r(2, 9), t = Math.floor(a / 10) * 10, o = a % 10; return inp(`${a} × ${b} = ?`, a * b, `${a} × ${b} = ${t} × ${b} + ${o} × ${b} = ${t * b} + ${o * b} = <b>${a * b}</b>.`, { vis: stack(a, '×', b), meta: { op: 'x', a, b } }); } },
        { id: '3G2', name: 'Tiga angka dikali satu angka', gen() { const a = r(101, 999), b = r(2, 9); return inp(`${a} × ${b} = ?`, a * b, `Kalikan satuan, puluhan, lalu ratusan dengan ${b}, jangan lupa simpanan. Jawabannya <b>${fmt(a * b)}</b>.`, { vis: stack(a, '×', b), meta: { op: 'x', a, b } }); } },
        { id: '3G3', name: 'Pembagian bersusun (tanpa sisa)', gen() { const d = r(2, 6), q = r(11, Math.floor(99 / d)), n = d * q; return inp(`${n} ÷ ${d} = ?`, q, `Bagi puluhan dulu, lalu satuan. Periksa: ${d} × ${q} = ${n}. Jawabannya <b>${q}</b>.`, { vis: V.big(`${n} ÷ ${d} = <span class="q">?</span>`), meta: { op: '/', a: n, b: d } }); } },
        { id: '3G4', name: 'Mengalikan dengan puluhan dan ratusan', gen() { const a = r(2, 9), k = pick([10, 100]), b = r(2, 9); return inp(`${a * k} × ${b} = ?`, a * k * b, `${a} × ${b} = ${a * b}, lalu tambahkan ${k === 10 ? 'satu' : 'dua'} nol: <b>${fmt(a * k * b)}</b>.`, { vis: V.big(`${a * k} × ${b} = <span class="q">?</span>`), meta: { op: 'x', a: a * k, b } }); } },
      ],
    },
    {
      id: '3H', grade: 3, name: 'Soal cerita dan bilangan yang hilang', icon: '📘', color: '#a29bfe',
      sg: '3A/3B · Word Problems (bar model, multiplication)', ixl: 'CC, DD, EE, T', km: 'Aljabar (kalimat matematika dengan nilai belum diketahui)',
      tip: 'Untuk "3 kali lebih banyak", gambar 1 batang untuk yang kecil dan 3 batang sama panjang untuk yang besar.',
      skills: [
        { id: '3H1', name: 'Soal cerita dua langkah', gen() { const g = r(3, 8), e = r(4, 12), x = r(2, Math.min(9, g * e - 1)); const t = pick([[`Ibu membeli ${g} kotak telur, setiap kotak berisi ${e} butir. ${x} butir pecah. Berapa telur yang masih utuh?`, g * e - x, `${g} × ${e} = ${g * e}, lalu ${g * e} − ${x}`], [`Ada ${g} rak, setiap rak berisi ${e} buku. Lalu ${x} buku baru ditaruh di meja. Berapa buku semuanya?`, g * e + x, `${g} × ${e} = ${g * e}, lalu ${g * e} + ${x}`]]); return inp(t[0], t[1], `Langkah 1 dan 2: ${t[2]} = <b>${t[1]}</b>.`); } },
        { id: '3H2', name: 'Mencari bilangan yang hilang', gen() { const t = r(0, 3); if (t === 0) { const b = r(120, 480), c = r(b + 50, 999); return inp(`? + ${b} = ${c}`, c - b, `? = ${c} − ${b} = <b>${c - b}</b>.`, { vis: V.big(`<span class="q">?</span> + ${b} = ${c}`), meta: { op: '-', a: c, b } }); } if (t === 1) { const b = r(110, 400), c = r(100, 500); return inp(`? − ${b} = ${c}`, b + c, `Kebalikan dari mengurangi adalah menjumlah: ? = ${c} + ${b} = <b>${b + c}</b>.`, { vis: V.big(`<span class="q">?</span> − ${b} = ${c}`), meta: { op: '+', a: c, b } }); } if (t === 2) { const d = r(2, 9), q = r(2, 9); return inp(`${d * q} ÷ ? = ${q}`, d, `${d * q} dibagi berapa agar hasilnya ${q}? ${d * q} ÷ ${d} = ${q}. Jawabannya <b>${d}</b>.`, { vis: V.big(`${d * q} ÷ <span class="q">?</span> = ${q}`) }); } const a = r(3, 9), b = r(3, 9); return inp(`${a} × ? = ${a * b}`, b, `${a * b} ÷ ${a} = <b>${b}</b>.`, { vis: V.big(`${a} × <span class="q">?</span> = ${a * b}`) }); } },
        { id: '3H3', name: 'Soal "kali lebih banyak" dengan model batang', gen() { const [n1, n2] = two(), a = r(4, 15), k = r(2, 5); const segs = range(1, k).map(() => [a, '', 1]); if (Math.random() < 0.5) return inp(`${n1} punya ${a} kelereng. ${n2} punya ${k} kali lebih banyak. Berapa kelereng ${n2}?`, a * k, `Batang ${n2} = ${k} batang ${n1}: ${k} × ${a} = <b>${a * k}</b>.`, { vis: V.barModel([[[a, n1, 1]], segs]), meta: { op: 'x', a: k, b: a } }); return inp(`${n1} punya ${a} kelereng. ${n2} punya ${k} kali lebih banyak. Berapa kelereng mereka berdua?`, a * (k + 1), `Ada ${k} + 1 = ${k + 1} batang sama panjang: ${k + 1} × ${a} = <b>${a * (k + 1)}</b>.`, { vis: V.barModel([[[a, n1, 1]], segs], '?') }); } },
      ],
    },
    {
      id: '3I', grade: 3, name: 'Memahami pecahan', icon: '🍕', color: '#fab1a0',
      sg: '3B · Fractions (equivalent fractions)', ixl: 'FF, GG, HH, II, JJ', km: 'Bilangan (pecahan senilai; CP Fase B)',
      tip: 'Lipat kertas menjadi 2, lalu 4, lalu 8. Tunjukkan bahwa 1/2 = 2/4 = 4/8 dengan mewarnai.',
      skills: [
        { id: '3I1', name: 'Pecahan dari gambar dan kumpulan benda', gen() { const n = r(3, 9), k = r(1, n - 1), good = `${k}/${n}`; const tags = {}; [`${n - k}/${n}`, `${k}/${n - k}`, `${n}/${k}`].forEach((a) => { tags[a] = 'pecahan'; }); if (Math.random() < 0.5) return ch('Berapa bagian bola yang berwarna merah?', opts4(good, Object.keys(tags)), good, `Ada ${n} bola (penyebut ${n}), ${k} berwarna merah (pembilang ${k}). Jawabannya <b>${good}</b>.`, { vis: `<div class="objs">${'🔴'.repeat(k)}${'⚪'.repeat(n - k)}</div>`, optionTags: tags }); return ch('Berapa bagian yang diwarnai?', opts4(good, Object.keys(tags)), good, `${n} bagian sama besar, ${k} diwarnai: <b>${good}</b>.`, { vis: V.fraction('rect', n, k), optionTags: tags }); } },
        { id: '3I2', name: 'Pecahan pada garis bilangan', gen() { const den = pick([2, 3, 4, 5, 6, 8]), w = pick([1, 1, 2]); let num = r(1, den * w - 1); if (num % den === 0) num++; const good = `${num}/${den}`; return ch('Pecahan berapa yang ditunjuk panah?', opts4(good, [`${num + 1}/${den}`, `${Math.max(1, num - 1)}/${den}`, `${num}/${den + 1}`, `1/${num}`]), good, `Setiap satuan dibagi ${den} bagian sama. Panah ada di garis ke-${num}, jadi <b>${good}</b>.`, { vis: U.fracNL(den, w, num) }); } },
        { id: '3I3', name: 'Pecahan senilai', gen() { const d = r(2, 6), n = r(1, d - 1), k = r(2, 4); if (Math.random() < 0.5) return inp(`${n}/${d} = ?/${d * k}`, n * k, `Penyebut dikali ${k} (${d} × ${k} = ${d * k}), maka pembilang juga dikali ${k}: ${n} × ${k} = <b>${n * k}</b>.`, { vis: `<div class="fstack">${V.fraction('rect', d, n)}${V.fraction('rect', d * k, n * k)}</div>` }); return inp(`${n}/${d} = ${n * k}/?`, d * k, `Pembilang dikali ${k}, maka penyebut juga dikali ${k}: ${d} × ${k} = <b>${d * k}</b>.`); } },
        { id: '3I4', name: 'Pecahan yang sama dengan bilangan bulat', gen() { const d = r(2, 8), w = r(1, 4); if (Math.random() < 0.6) return inp(`${d * w}/${d} = ?`, w, `${d * w} bagian, setiap ${d} bagian = 1 utuh. ${d * w} ÷ ${d} = <b>${w}</b>.`, { vis: range(1, w).map(() => V.fraction('rect', d, d)).join('') }); return inp(`?/${d} = ${w}`, d * w, `${w} utuh = ${w} × ${d} = <b>${d * w}</b> bagian per ${d}.`); } },
      ],
    },
    {
      id: '3J', grade: 3, name: 'Membandingkan dan menjumlah pecahan', icon: '⚖️', color: '#55efc4',
      sg: '3B · Fractions (compare, add and subtract like fractions)', ixl: 'KK, LL, MM, NN', km: 'Bilangan',
      tip: 'Pecahan berpenyebut sama: bandingkan pembilangnya. Berpembilang sama: penyebut yang lebih kecil justru lebih besar.',
      skills: [
        { id: '3J1', name: 'Membandingkan pecahan berpenyebut sama', gen() { const d = r(3, 12), a = r(1, d - 1), b = r(1, d - 1); const q = cmpFrac(`${a}/${d}`, `${b}/${d}`, a, b); q.explain = `Penyebutnya sama (${d}), jadi bandingkan pembilangnya: ${a} ${q.answer} ${b}. Jawabannya <b>${a}/${d} ${q.answer} ${b}/${d}</b>.`; return q; } },
        { id: '3J2', name: 'Membandingkan pecahan berpembilang sama', gen() { const n = r(1, 3), [d1, d2] = shuffle(range(n + 1, 12)).slice(0, 2); const s = d1 < d2 ? '>' : '<'; const tags = { [s === '>' ? '<' : '>']: 'pecahan-satuan' }; const q = cmpFrac(`${n}/${d1}`, `${n}/${d2}`, 1 / d1, 1 / d2, tags); q.explain = `Pembilangnya sama. Semakin besar penyebut, semakin kecil bagiannya. Jadi <b>${n}/${d1} ${s} ${n}/${d2}</b>.`; return q; } },
        { id: '3J3', name: 'Mengurutkan pecahan', gen() { const d = r(5, 12); const ns = shuffle(range(1, d - 1)).slice(0, 3); const asc = Math.random() < 0.5; const sorted = ns.slice().sort((a, b) => (asc ? a - b : b - a)).map((n) => `${n}/${d}`); const ok = sorted.join(', '); const perms = [[0, 2, 1], [1, 0, 2], [2, 1, 0], [2, 0, 1]].map((p) => p.map((i) => sorted[i]).join(', ')); return ch(`Urutkan dari yang paling ${asc ? 'kecil' : 'besar'}.`, opts4(ok, perms), ok, `Penyebut sama, jadi urutkan pembilangnya. Jawabannya <b>${ok}</b>.`, { vis: V.seq(ns.map((n) => `${n}/${d}`)) }); } },
        { id: '3J4', name: 'Menjumlah dan mengurangi pecahan berpenyebut sama', gen() { const d = r(4, 12), a = r(1, d - 2), b = r(1, d - a); const plus = Math.random() < 0.6 || a === b; if (plus) { const good = `${a + b}/${d}`; return ch(`${a}/${d} + ${b}/${d} = ?`, opts4(good, [`${a + b}/${d * 2}`, `${a * b}/${d}`, `${Math.abs(a - b) || 1}/${d}`]), good, `Penyebut tetap ${d}; jumlahkan pembilangnya saja: ${a} + ${b} = ${a + b}. Jawabannya <b>${good}</b>.`, { optionTags: { [`${a + b}/${d * 2}`]: 'penyebut-dijumlah' } }); } const [x, y] = a > b ? [a, b] : [b, a]; const good = `${x - y}/${d}`; return ch(`${x}/${d} − ${y}/${d} = ?`, opts4(good, [`${x + y}/${d}`, `${x - y}/${d * 2}`, `${x - y + 1}/${d}`]), good, `Penyebut tetap ${d}; kurangi pembilangnya: ${x} − ${y} = ${x - y}. Jawabannya <b>${good}</b>.`); } },
      ],
    },
    {
      id: '3K', grade: 3, name: 'Luas dan keliling', icon: '📐', color: '#fdcb6e',
      sg: '3B · Area and Perimeter', ixl: 'OO, PP, QQ', km: 'Pengukuran (luas dan keliling)',
      tip: 'Ukur keliling meja dengan meteran (jumlah semua sisi), dan hitung luas ubin lantai kamar (banyak ubin).',
      skills: [
        { id: '3K1', name: 'Luas dengan menghitung petak', gen() { const rows = r(2, 6), cols = r(2, 8); return inp('Berapa satuan persegi luas bangun ini?', rows * cols, `Hitung petaknya: ${rows} baris × ${cols} kolom = <b>${rows * cols}</b> satuan persegi.`, { vis: grid(rows, cols), meta: { op: 'x', a: rows, b: cols } }); } },
        { id: '3K2', name: 'Luas persegi panjang', gen() { const w = r(3, 15), h = r(2, 10); return inp(`Berapa cm² luas persegi panjang ini?`, w * h, `Luas = panjang × lebar = ${w} × ${h} = <b>${w * h}</b> cm².`, { vis: U.rectLabel(w, h), meta: { op: 'x', a: w, b: h, alt: { [String(2 * (w + h))]: 'luas-keliling' } } }); } },
        { id: '3K3', name: 'Keliling', gen() { if (Math.random() < 0.5) { const s = r(2, 15); return inp(`Berapa cm keliling persegi dengan sisi ${s} cm?`, 4 * s, `Persegi punya 4 sisi sama panjang: 4 × ${s} = <b>${4 * s}</b> cm.`, { vis: U.rectLabel(s, s), meta: { alt: { [String(s * s)]: 'luas-keliling' } } }); } const w = r(3, 15), h = r(2, 10); return inp('Berapa cm keliling persegi panjang ini?', 2 * (w + h), `Keliling = ${w} + ${h} + ${w} + ${h} = <b>${2 * (w + h)}</b> cm.`, { vis: U.rectLabel(w, h), meta: { alt: { [String(w * h)]: 'luas-keliling' } } }); } },
        { id: '3K4', name: 'Mencari sisi dari keliling', gen() { if (Math.random() < 0.5) { const s = r(3, 15); return inp(`Keliling sebuah persegi ${4 * s} cm. Berapa cm panjang sisinya?`, s, `4 sisi sama panjang: ${4 * s} ÷ 4 = <b>${s}</b> cm.`); } const w = r(5, 15), h = r(2, w - 1); return inp(`Keliling persegi panjang ${2 * (w + h)} cm dan panjangnya ${w} cm. Berapa cm lebarnya?`, h, `Panjang + lebar = ${2 * (w + h)} ÷ 2 = ${w + h}. Lebar = ${w + h} − ${w} = <b>${h}</b> cm.`); } },
      ],
    },
    {
      id: '3L', grade: 3, name: 'Garis, sudut, dan segi empat', icon: '🔷', color: '#e84393',
      sg: '3B · Angles, Perpendicular and Parallel Lines', ixl: 'RR, SS, TT', km: 'Geometri (ciri segitiga dan segi empat)',
      tip: 'Gunakan pojok kertas sebagai "pengukur siku-siku" untuk mencari sudut siku-siku di rumah.',
      skills: [
        { id: '3L1', name: 'Jenis segi empat', gen() { const Q = [['persegi', '4 sisi sama panjang dan 4 sudut siku-siku'], ['persegi panjang', 'sisi yang berhadapan sama panjang dan 4 sudut siku-siku, tetapi tidak semua sisi sama panjang'], ['belah ketupat', '4 sisi sama panjang, tetapi sudutnya tidak siku-siku'], ['jajargenjang', 'dua pasang sisi berhadapan sejajar dan sama panjang, sudutnya tidak siku-siku'], ['trapesium', 'hanya satu pasang sisi yang sejajar']]; const [nm, clue] = pick(Q); const names = Q.map((x) => x[0]); if (Math.random() < 0.5) return ch(`Bangun apa yang punya ${clue}?`, opts4(nm, names), nm, `Bangun dengan ${clue} adalah <b>${nm}</b>.`); return ch('Apa nama segi empat ini?', opts4(nm, names), nm, `Ini <b>${nm}</b>: ${clue}.`, { vis: nm === 'jajargenjang' ? JAJAR : V.shape(nm, '#0984e3') }); } },
        { id: '3L2', name: 'Sudut siku-siku', gen() { const t = pick([0, 1, 2]); const deg = t === 1 ? 90 : t === 0 ? r(20, 70) : r(110, 160); const opts = ['lebih kecil dari siku-siku', 'sudut siku-siku', 'lebih besar dari siku-siku']; return ch('Sudut ini...', opts, opts[t], `Bandingkan dengan pojok kertas (90°). Sudut ini <b>${opts[t]}</b>.`, { vis: U.angle(deg) }); } },
        { id: '3L3', name: 'Garis sejajar dan tegak lurus', gen() { const k = pick(['sejajar', 'tegak lurus', 'berpotongan']); return ch('Kedua garis ini...', ['sejajar', 'tegak lurus', 'berpotongan'], k, { sejajar: 'Garis sejajar tidak pernah bertemu walaupun diperpanjang.', 'tegak lurus': 'Garis tegak lurus berpotongan membentuk sudut siku-siku.', berpotongan: 'Garis ini bertemu di satu titik, tetapi tidak membentuk sudut siku-siku.' }[k] + ` Jawabannya <b>${k}</b>.`, { vis: U.lines(k) }); } },
      ],
    },
    {
      id: '3M', grade: 3, name: 'Waktu', icon: '⏰', color: '#ffeaa7',
      sg: '3B · Time (minutes, duration)', ixl: 'UU, VV', km: 'Pengukuran (durasi waktu)',
      tip: 'Saat perjalanan, tanyakan: "Berangkat pukul 07.40, tiba pukul 08.15. Berapa menit perjalanannya?"',
      skills: [
        { id: '3M1', name: 'Membaca jam sampai menit', gen() { const h = r(1, 12); let m = r(1, 59); if (m % 5 === 0) m++; const t = (hh, mm) => `pukul ${hh}.${String(mm).padStart(2, '0')}`; const good = t(h, m); return ch('Pukul berapa sekarang?', opts4(good, [t(h, (m + 5) % 60), t(h % 12 + 1, m), t(h, Math.max(1, m - 2)), t(h, Math.floor(m / 5))]), good, `Jarum pendek melewati ${h}. Jarum panjang: hitung 5-an sampai angka sebelum jarum (${Math.floor(m / 5) * 5}), lalu tambah ${m % 5} garis kecil = ${m} menit. Jadi <b>${good}</b>.`, { vis: V.clock(h, m), optionTags: { [t(h, Math.floor(m / 5))]: 'jam-menit', [t(h % 12 + 1, m)]: 'jam-tertukar' } }); } },
        { id: '3M2', name: 'Lama waktu dalam menit', gen() { const h = r(6, 15), m = r(0, 11) * 5, d = r(3, 30) * 5; const e = h * 60 + m + d; if (Math.random() < 0.5) return inp(`Mulai pukul ${hm(h, m)}, selesai pukul ${hm(Math.floor(e / 60), e % 60)}. Berapa menit lamanya?`, d, `Hitung dari ${hm(h, m)} ke ${hm(Math.floor(e / 60), e % 60)}: <b>${d}</b> menit${d >= 60 ? ` (${Math.floor(d / 60)} jam ${d % 60} menit)` : ''}.`); const good = `pukul ${hm(Math.floor(e / 60), e % 60)}`; const alt = (x) => `pukul ${hm(Math.floor(x / 60), x % 60)}`; return ch(`Film mulai pukul ${hm(h, m)} dan berlangsung ${d} menit. Selesai pukul berapa?`, opts4(good, [alt(e + 10), alt(e - 10), alt(h * 60 + m + (d % 60) + 100), alt(e + 60)]), good, `${hm(h, m)} + ${d} menit = <b>${good.slice(6)}</b>.`); } },
        { id: '3M3', name: 'Jam, menit, dan detik', gen() { const t = r(0, 3); if (t === 0) { const h = r(2, 5); return inp(`${h} jam = ? menit`, h * 60, `1 jam = 60 menit, jadi ${h} × 60 = <b>${h * 60}</b> menit.`, { meta: { kind: 'unit' } }); } if (t === 1) { const m = r(2, 5); return inp(`${m} menit = ? detik`, m * 60, `1 menit = 60 detik: ${m} × 60 = <b>${m * 60}</b> detik.`, { meta: { kind: 'unit' } }); } if (t === 2) { const h = r(1, 3), m = r(5, 55); return inp(`${h} jam ${m} menit = ? menit`, h * 60 + m, `${h} × 60 + ${m} = <b>${h * 60 + m}</b> menit.`); } const tot = r(70, 230); return inp(`${tot} menit = ${Math.floor(tot / 60)} jam ? menit`, tot % 60, `${Math.floor(tot / 60)} jam = ${Math.floor(tot / 60) * 60} menit. ${tot} − ${Math.floor(tot / 60) * 60} = <b>${tot % 60}</b> menit.`); } },
      ],
    },
    {
      id: '3N', grade: 3, name: 'Panjang, berat, dan volume', icon: '📏', color: '#81ecec',
      sg: '3A/3B · Length (km, m, cm), Mass (kg, g), Volume (ℓ, mℓ)', ixl: 'XX (metrik; satuan Amerika di WW tidak dipakai)', km: 'Pengukuran (satuan baku)',
      tip: 'Baca label kemasan bersama: susu 250 mL, minyak 2 L, gula 1 kg. Tanyakan: "Berapa mL dalam 2 L?"',
      skills: [
        { id: '3N1', name: 'Mengubah satuan', gen() { const [big, small, f] = pick([['m', 'cm', 100], ['km', 'm', 1000], ['kg', 'g', 1000], ['L', 'mL', 1000], ['cm', 'mm', 10]]); if (Math.random() < 0.5) { const n = r(2, 9); return inp(`${n} ${big} = ? ${small}`, n * f, `1 ${big} = ${fmt(f)} ${small}, jadi ${n} × ${fmt(f)} = <b>${fmt(n * f)}</b> ${small}.`, { meta: { kind: 'unit' } }); } const n = r(1, 5), p = r(1, f - 1); return inp(`${n} ${big} ${p} ${small} = ? ${small}`, n * f + p, `${n} ${big} = ${fmt(n * f)} ${small}, ditambah ${p}: <b>${fmt(n * f + p)}</b> ${small}.`, { meta: { kind: 'unit' } }); } },
        { id: '3N2', name: 'Memilih satuan yang tepat', gen() { const [q, u, all] = pick([['Isi satu sendok teh obat', 'mL', ['mL', 'L']], ['Isi bak mandi', 'L', ['mL', 'L']], ['Isi segelas air', 'mL', ['mL', 'L']], ['Berat seekor kucing', 'kg', ['g', 'kg']], ['Berat sebuah kancing', 'g', ['g', 'kg']], ['Jarak Jakarta ke Bandung', 'km', ['cm', 'm', 'km']], ['Panjang kelas', 'm', ['cm', 'm', 'km']], ['Panjang pensil', 'cm', ['cm', 'm', 'km']]]); return ch(`${q} paling tepat diukur dengan...`, all, u, `Pilih satuan yang sesuai besarnya benda. Jawabannya <b>${u}</b>.`); } },
        { id: '3N3', name: 'Soal cerita pengukuran', gen() { const t = r(0, 2); if (t === 0) { const used = r(1, 9) * 50 + 50; return inp(`Sebotol air berisi 1 L. ${two()[0]} sudah minum ${used} mL. Berapa mL air yang tersisa?`, 1000 - used, `1 L = 1.000 mL. 1.000 − ${used} = <b>${1000 - used}</b> mL.`, { meta: { kind: 'unit', op: '-', a: 1000, b: used } }); } if (t === 1) { const kg = r(1, 4), g = r(1, 9) * 100; return inp(`Tas berisi buku seberat ${kg} kg dan kotak bekal ${g} g. Berapa gram berat semuanya?`, kg * 1000 + g, `${kg} kg = ${fmt(kg * 1000)} g. ${fmt(kg * 1000)} + ${g} = <b>${fmt(kg * 1000 + g)}</b> g.`, { meta: { kind: 'unit' } }); } const a = r(120, 480), b = r(120, 480); return inp(`${two()[0]} berlari ${a} m, lalu berjalan ${b} m. Berapa meter jarak seluruhnya?`, a + b, `${a} + ${b} = <b>${a + b}</b> m.`, { meta: { op: '+', a, b } }); } },
      ],
    },
    {
      id: '3O', grade: 3, name: 'Data dan diagram', icon: '📊', color: '#74b9ff',
      sg: '3B · Bar Graphs', ixl: 'YY', km: 'Analisis Data dan Peluang (diagram batang)',
      tip: 'Kumpulkan data sederhana (warna mobil di jalan) dan buat diagram batang dengan skala 5.',
      skills: [
        { id: '3O1', name: 'Diagram batang dengan skala', gen() { const cats = shuffle(['Sepak bola', 'Bulu tangkis', 'Renang', 'Basket']).slice(0, 4); const vals = cats.map(() => r(1, 10) * 5); const rows = cats.map((c, i) => [c.split(' ')[0], vals[i]]); const vis = U.barGraph('Olahraga Kesukaan', rows, 50, 5); if (Math.random() < 0.6) { const i = r(0, 3); return inp(`Berapa siswa yang menyukai ${cats[i].toLowerCase()}?`, vals[i], `Setiap garis bernilai 5. Ujung batang ${cats[i]} ada di <b>${vals[i]}</b>.`, { vis }); } const [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2); const [x, y] = vals[i] >= vals[j] ? [i, j] : [j, i]; return inp(`Berapa lebih banyak siswa yang suka ${cats[x].toLowerCase()} daripada ${cats[y].toLowerCase()}?`, vals[x] - vals[y], `${vals[x]} − ${vals[y]} = <b>${vals[x] - vals[y]}</b>.`, { vis, meta: { op: '-', a: vals[x], b: vals[y] } }); } },
        { id: '3O2', name: 'Piktogram dengan skala', gen() { const sc = pick([3, 4, 10]); const cats = shuffle([['🚌', 'Bus'], ['🚗', 'Mobil'], ['🛵', 'Motor'], ['🚲', 'Sepeda']]).slice(0, 3); const icons = shuffle(range(1, 6)).slice(0, 3); const rows = cats.map((c, i) => [c[0], c[1], icons[i]]); const i = r(0, 2); return inp(`Berapa siswa yang datang naik ${rows[i][1].toLowerCase()}?`, icons[i] * sc, `${icons[i]} gambar × ${sc} = <b>${icons[i] * sc}</b> siswa.`, { vis: V.pictograph('Kendaraan ke Sekolah', rows, `Setiap gambar = ${sc} siswa`), meta: { kind: 'scale', icons: icons[i] } }); } },
        { id: '3O3', name: 'Membaca tabel', gen() { const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']; const v = days.map(() => r(12, 60)); const i = r(0, 4), j = (i + r(1, 4)) % 5; const vis = U.table(['Hari', 'Botol terkumpul'], days.map((d, k) => [d, v[k]])); if (Math.random() < 0.5) return inp(`Berapa botol yang terkumpul hari ${days[i]} dan ${days[j]}?`, v[i] + v[j], `${v[i]} + ${v[j]} = <b>${v[i] + v[j]}</b>.`, { vis, meta: { op: '+', a: v[i], b: v[j] } }); const tot = v.reduce((a, b) => a + b, 0); return inp('Berapa botol yang terkumpul selama lima hari?', tot, `${v.join(' + ')} = <b>${tot}</b>.`, { vis }); } },
      ],
    },
    {
      id: '3P', grade: 3, name: 'Uang', icon: '💰', color: '#00b894',
      sg: '3A · Money', ixl: 'ZZ', km: 'Bilangan (konteks uang)',
      tip: 'Beri anak anggaran (mis. Rp20.000) untuk membeli beberapa barang dan menghitung sisanya.',
      skills: [
        { id: '3P1', name: 'Total belanja dan kembalian', gen() { const items = shuffle([['🍞', 'roti', r(5, 16) * 500], ['🥛', 'susu', r(8, 20) * 500], ['📒', 'buku', r(3, 9) * 1000], ['🖊️', 'pulpen', r(4, 10) * 500], ['🍎', 'apel', r(4, 14) * 1000]]).slice(0, 2); const tot = items[0][2] + items[1][2], pay = tot < 20000 ? pick([20000, 50000]) : pick([50000, 100000]); return inp(`Ibu membeli ${items[0][1]} ${items[0][0]} ${rp(items[0][2])} dan ${items[1][1]} ${items[1][0]} ${rp(items[1][2])}. Ibu membayar ${rp(pay)}. Berapa kembaliannya? (tulis angkanya saja)`, pay - tot, `Total ${rp(items[0][2])} + ${rp(items[1][2])} = ${rp(tot)}. Kembalian ${rp(pay)} − ${rp(tot)} = <b>${rp(pay - tot)}</b>.`, { unit: 'Rp', meta: { op: '-', a: pay, b: tot } }); } },
        { id: '3P2', name: 'Harga beberapa barang', gen() { const [e, nm] = pick([['✏️', 'pensil'], ['🧃', 'jus kotak'], ['🍫', 'cokelat'], ['📏', 'penggaris']]), p = r(3, 12) * 500, n = r(2, 9); return inp(`Harga satu ${nm} ${e} ${rp(p)}. Berapa harga ${n} ${nm}? (tulis angkanya saja)`, p * n, `${n} × ${rp(p)} = <b>${rp(p * n)}</b>.`, { unit: 'Rp', meta: { op: 'x', a: n, b: p } }); } },
      ],
    },
  ];

  C.register(UNITS);
  C.GRADES.push({ id: 3, name: 'Kelas 3', ixl: 'https://www.ixl.com/math/grade-3', sg: 'Primary Mathematics / Dimensions Math 3A dan 3B' });
})();
