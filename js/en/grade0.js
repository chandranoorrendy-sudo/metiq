/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
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
  const SHAPES = ['circle', 'triangle', 'square', 'rectangle'];
  const SOLID = [['⚽', 'balls'], ['🎲', 'cube'], ['🥫', 'cylinder'], ['🍦', 'cone'], ['🎁', 'cube'], ['🏀', 'balls'], ['🔋', 'cylinder'], ['🎉', 'cone']];
  const COLORS = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'];
  const KOIN = [100, 200, 500, 1000];

  const TKA = [
    {
      id: 'TAA', grade: -2, name: 'Numbers 1 to 5', icon: '🖐️', color: '#ff7a59', ixl: 'A–D', sg: 'Preschool · Getting to know numbers', km: 'Numbers', coret: false,
      tip: 'Count fingers, stairs, or shirt buttons while touching each one.',
      skills: [
        { id: 'TAA1', name: 'Counting pictures to 5', gen() { const [e, nm] = pick(BENDA), n = r(1, 5); return inp(`How many ${nm} are there?`, n, `Touch each one while counting: ${range(1, n).join(', ')}. There are <b>${n}</b>.`, { vis: V.objects(e, n), meta: { kind: 'count' } }); } },
        { id: 'TAA2', name: 'Getting to know numerals to 5', gen() { const n = r(1, 5); return ch(`Tap the number ${kata(n)}.`, nums(n, 1, 5), n, `The number ${kata(n)} is written <b>${n}</b>.`); } },
        { id: 'TAA3', name: 'Counting dots to 5', gen() { const n = r(1, 5); return ch('How many dots are there?', nums(n, 1, 5), n, `Count the dots: ${range(1, n).join(', ')}. There are <b>${n}</b> dots.`, { vis: dots(n), meta: { kind: 'count' } }); } },
      ],
    },
    {
      id: 'TAB', grade: -2, name: 'Numbers 6 to 10', icon: '🔟', color: '#4d96ff', ixl: 'E–H', sg: 'Preschool · Getting to know numbers', km: 'Numbers', coret: false,
      tip: 'Use a 10-hole egg carton as a ten frame for marbles.',
      skills: [
        { id: 'TAB1', name: 'Counting pictures to 10', gen() { const [e, nm] = pick(BENDA), n = r(6, 10); return inp(`How many ${nm} are there?`, n, `Count one by one: ${range(1, n).join(', ')}. There are <b>${n}</b>.`, { vis: V.objects(e, n), meta: { kind: 'count' } }); } },
        { id: 'TAB2', name: 'Counting on a ten frame', gen() { const n = r(3, 10); return inp('How many red circles are there?', n, `One row has 5. ${n > 5 ? `5 and ${n - 5} more` : `There are ${n}`}: the total is <b>${n}</b>.`, { vis: V.tenFrame(n), meta: { kind: 'count' } }); } },
        { id: 'TAB3', name: 'Next number to 10', gen() { const s = r(1, 7); const seq = [s, s + 1, s + 2]; return ch(`After ${seq.join(', ')}, what number comes next?`, nums(s + 3, 1, 10), s + 3, `Count forward by ones: ${seq.join(', ')}, <b>${s + 3}</b>.`, { vis: V.seq([...seq, '?']) }); } },
      ],
    },
    {
      id: 'TAC', grade: -2, name: 'One more and one less', icon: '➕', color: '#1fbf9f', ixl: 'I', sg: 'Preschool · Getting to know numbers', km: 'Numbers', coret: false,
      tip: 'Put out 4 cakes, then add one: how many now? Take one away: how many are left?',
      skills: [
        { id: 'TAC1', name: 'One more with pictures', gen() { const [e] = pick(BENDA), n = r(1, 9); return ch(`There are ${n}. One more comes. How many are there now?`, nums(n + 1, 1, 10), n + 1, `One more than ${n} is <b>${n + 1}</b>.`, { vis: V.groups(e, n, 1) }); } },
        { id: 'TAC2', name: 'One less with pictures', gen() { const [e] = pick(BENDA), n = r(2, 10); return ch(`There are ${n}. One is taken away. How many are left?`, nums(n - 1, 1, 10), n - 1, `One less than ${n} is <b>${n - 1}</b>.`, { vis: V.objects(e, n, 1) }); } },
      ],
    },
    {
      id: 'TAD', grade: -2, name: 'More and fewer', icon: '⚖️', color: '#e84393', ixl: 'K–L', sg: 'Preschool · Comparing', km: 'Numbers', coret: false,
      tip: 'Line up spoons and forks in pairs: which ones are left over? That\'s the group with more.',
      skills: [
        { id: 'TAD1', name: 'Which has more', gen() { const s = shuffle(BENDA), a = r(1, 8); let b = r(1, 8); while (b === a) b = r(1, 8); const more = Math.random() < 0.5; const ans = (more ? a > b : a < b) ? s[0][1] : s[1][1]; return ch(`Which group has the ${more ? 'most' : 'fewest'}?`, [s[0][1], s[1][1]], ans, `There are ${a} ${s[0][1]} and ${b} ${s[1][1]}. The answer is <b>${ans}</b>.`, { vis: V.labeled([[s[0][1], s[0][0], a], [s[1][1], s[1][0], b]]), meta: { kind: 'compare' } }); } },
        { id: 'TAD2', name: 'The larger number', gen() { const [a, b] = shuffle(range(1, 10)).slice(0, 2), big = Math.random() < 0.5, ans = big ? Math.max(a, b) : Math.min(a, b); return ch(`Which group has the ${big ? 'largest' : 'smallest'}?`, [a, b].map(String), ans, `When counting, ${Math.min(a, b)} comes before ${Math.max(a, b)}. So the ${big ? 'largest' : 'smallest'} is <b>${ans}</b>.`); } },
      ],
    },
    {
      id: 'TAE', grade: -2, name: 'Pattern', icon: '🔁', color: '#9b6dff', ixl: 'M', sg: 'Preschool · Patterns', km: 'Algebra', coret: false,
      tip: 'Arrange beads alternating red-blue-red-blue, then ask your child to continue.',
      skills: [
        { id: 'TAE1', name: 'Color patterns', gen() { const [a, b, c] = shuffle(COLORS); const unit = pick([[a, b], [a, b, c], [a, a, b]]); const seq = Array.from({ length: unit.length * 2 + 1 }, (_, i) => unit[i % unit.length]); const ans = unit[(unit.length * 2 + 1) % unit.length]; return ch('What\'s next?', shuffle([...new Set([a, b, c])]), ans, `The pattern repeats: ${unit.join(' ')}. Next is <b>${ans}</b>.`, { vis: V.seq([...seq, '?']) }); } },
        { id: 'TAE2', name: 'Picture patterns', gen() { const [x, y] = shuffle(BENDA).slice(0, 2).map((v) => v[0]); const unit = pick([[x, y], [x, x, y], [x, y, y]]); const seq = Array.from({ length: unit.length * 2 }, (_, i) => unit[i % unit.length]); const ans = unit[0]; return ch('What\'s next?', shuffle([x, y]), ans, `The pattern ${unit.join(' ')} repeats. Next is <b>${ans}</b>.`, { vis: V.seq([...seq, '?']) }); } },
      ],
    },
    {
      id: 'TAF', grade: -2, name: 'Position', icon: '↔️', color: '#00b894', ixl: 'N', sg: 'Preschool · Position', km: 'Geometry', coret: false,
      tip: 'Play "where\'s the doll?": on the table, under the chair, on the left, on the right.',
      skills: [
        { id: 'TAF1', name: 'Left, middle, right', gen() { const row = shuffle(BENDA).slice(0, 3); const i = r(0, 2), pos = ['left', 'middle', 'right'][i]; return ch(`Which picture is at the ${pos}?`, shuffle(row.map((x) => x[0])), row[i][0], `From left to right: ${row.map((x) => x[0]).join(' ')}. The one at the ${pos} is <b>${row[i][0]}</b>.`, { vis: `<div class="tkrow">${row.map((x) => `<span>${x[0]}</span>`).join('')}</div>` }); } },
        { id: 'TAF2', name: 'Top, middle, bottom', gen() { const col = shuffle(BENDA).slice(0, 3); const i = r(0, 2), pos = ['top', 'middle', 'bottom'][i]; return ch(`Which picture is at the very ${pos === 'middle' ? 'middle' : pos}?`, shuffle(col.map((x) => x[0])), col[i][0], `From top to bottom: ${col.map((x) => x[0]).join(' ')}. The one at the ${pos} is <b>${col[i][0]}</b>.`, { vis: `<div class="tkcol">${col.map((x) => `<span>${x[0]}</span>`).join('')}</div>` }); } },
      ],
    },
    {
      id: 'TAG', grade: -2, name: 'Shapes', icon: '🔺', color: '#fdcb6e', ixl: 'O–S', sg: 'Preschool · Shapes', km: 'Geometry', coret: false,
      tip: 'Look for shapes at home: round plate (circle), window (square), roof (triangle).',
      skills: [
        { id: 'TAG1', name: 'Names of flat shapes', gen() { const s = pick(SHAPES); return ch('What shape is this?', shuffle(SHAPES), s, `This is a <b>${s}</b>.`, { vis: V.shape(s, pick(['#ff7a59', '#4d96ff', '#1fbf9f', '#9b6dff'])) }); } },
        { id: 'TAG2', name: 'Shapes of things around us', gen() { const [e, s] = pick(SOLID); return ch(`What is the shape of a ${e}?`, ['balls', 'cube', 'cylinder', 'cone'], s, `A ${e} is shaped like a <b>${s}</b>.`, { vis: `<div class="bigemoji">${e}</div>` }); } },
        { id: 'TAG3', name: 'Same or different', gen() { const [a, b] = shuffle(BENDA).slice(0, 2).map((x) => x[0]); const odd = r(0, 3), row = [0, 1, 2, 3].map((i) => (i === odd ? b : a)); return ch('Which one is different?', shuffle([a, b]), b, `Three pictures are the same (${a}), one is different: <b>${b}</b>.`, { vis: `<div class="tkrow">${row.map((x) => `<span>${x}</span>`).join('')}</div>` }); } },
      ],
    },
    {
      id: 'TAH', grade: -2, name: 'Size', icon: '📏', color: '#00a8cc', ixl: 'T', sg: 'Preschool · Size', km: 'Measurement', coret: false,
      tip: 'Compare two objects: which is longer, taller, heavier?',
      skills: [
        { id: 'TAH1', name: 'Heavier or lighter', gen() { const [h, l] = pick([['🐘', '🐭'], ['🚗', '🚲'], ['🍉', '🍒'], ['🐄', '🐔'], ['🏠', '⚽'], ['🐻', '🐦']]); const heavy = Math.random() < 0.5; const row = shuffle([h, l]); return ch(`Which group has the ${heavy ? 'heaviest' : 'lightest'}?`, row, heavy ? h : l, `${h} is heavier than ${l}. The answer is <b>${heavy ? h : l}</b>.`, { vis: `<div class="tkrow">${row.map((x) => `<span>${x}</span>`).join('')}</div>` }); } },
        { id: 'TAH2', name: 'Longer or shorter', gen() { const a = r(2, 9); let b = r(2, 9); while (b === a) b = r(2, 9); const long = Math.random() < 0.5, ans = (long ? a > b : a < b) ? 'A' : 'B'; return ch(`Which ribbon is the ${long ? 'longest' : 'shortest'}?`, ['A', 'B'], ans, `Ribbon A is ${a} boxes, ribbon B is ${b} boxes. The answer is <b>${ans}</b>.`, { vis: V.bars([{ label: 'A', len: a, color: '#ff7a59' }, { label: 'B', len: b, color: '#4d96ff' }]) }); } },
      ],
    },
    {
      id: 'TAI', grade: -2, name: 'Adding to 5', icon: '🧺', color: '#e17055', ixl: 'V', sg: 'Preschool · Simple operations', km: 'Numbers', coret: false,
      tip: 'Combine two handfuls of marbles, then count them all.',
      skills: [
        { id: 'TAI1', name: 'Adding with pictures to 5', gen() { const [e] = pick(BENDA), a = r(1, 4), b = r(1, 5 - a); return ch(`${a} and ${b} more. How many altogether?`, nums(a + b, 1, 6), a + b, `Count them all: ${range(1, a + b).join(', ')}. There are <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
        { id: 'TAI2', name: 'Addition stories to 5', gen() { const [e, nm] = pick(BENDA), a = r(1, 4), b = r(1, 5 - a), nmA = pick(C.kit.NAMA); return inp(`${nmA} has ${a} ${nm}. Mom gives ${b} more. How many ${nm} does ${nmA} have now?`, a + b, `${a} plus ${b} = <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
      ],
    },
    {
      id: 'TAJ', grade: -2, name: 'Taking away to 5', icon: '🍪', color: '#16a085', ixl: 'X', sg: 'Preschool · Simple operations', km: 'Numbers', coret: false,
      tip: 'There are 5 cakes and a little sibling eats 2. Count the cakes left on the plate.',
      skills: [
        { id: 'TAJ1', name: 'Taking away with pictures to 5', gen() { const [e] = pick(BENDA), a = r(2, 5), b = r(1, a - 1); return ch(`There are ${a}. ${b} are crossed out. How many are left?`, nums(a - b, 0, 5), a - b, `Count the ones not crossed out: <b>${a - b}</b>.`, { vis: V.objects(e, a, b), meta: { op: '-', a, b } }); } },
      ],
    },
  ];

  const TKB = [
    {
      id: 'TBA', grade: -1, name: 'Numbers to 20', icon: '🔢', color: '#ff7a59', ixl: 'DD–EE', sg: 'Kindergarten · Numbers', km: 'Numbers', coret: false,
      tip: 'Count stairs or passing cars up to 20.',
      skills: [
        { id: 'TBA1', name: 'Counting on two ten frames', gen() { const n = r(11, 20); return inp('How many circles are there?', n, `The first frame is full = 10. The second frame has ${n - 10}. The total is 10 + ${n - 10} = <b>${n}</b>.`, { vis: V.tenFrame(n, 2), meta: { kind: 'count' } }); } },
        { id: 'TBA2', name: 'Number names to 20', gen() { const n = r(0, 20); return ch(`Tap the number "${kata(n)}".`, nums(n, Math.max(0, n - 6), Math.min(20, n + 6)), n, `"${kata(n)}" is written <b>${n}</b>.`); } },
        { id: 'TBA3', name: 'Counting pictures to 15', gen() { const [e, nm] = pick(BENDA), n = r(8, 15); return inp(`How many ${nm} are there?`, n, `Count one by one and mark the ones you've counted. There are <b>${n}</b>.`, { vis: V.objects(e, n), meta: { kind: 'count' } }); } },
      ],
    },
    {
      id: 'TBB', grade: -1, name: 'Counting forward and backward', icon: '🔜', color: '#4d96ff', ixl: 'L, GG', sg: 'Kindergarten · Numbers', km: 'Numbers', coret: false,
      tip: 'Count down before lifting off like a rocket: 10, 9, 8, ..., 1, liftoff!',
      skills: [
        { id: 'TBB1', name: 'Before, after, and between', gen() { const n = r(2, 19), kind = pick(['after', 'before', 'between']); const ans = kind === 'after' ? n + 1 : kind === 'before' ? n - 1 : n; return inp(kind === 'between' ? `What number is between ${n - 1} and ${n + 1}?` : `What number comes right ${kind} ${n}?`, ans, kind === 'between' ? `${n - 1}, <b>${n}</b>, ${n + 1}.` : `Counting ${kind === 'after' ? 'forward' : 'backward'} by one from ${n}: <b>${ans}</b>.`, { vis: V.seq(kind === 'between' ? [n - 1, '?', n + 1] : kind === 'after' ? [n, '?'] : ['?', n]) }); } },
        { id: 'TBB2', name: 'Counting backward', gen() { const s = r(6, 20); const seq = [s, s - 1, s - 2, s - 3]; const j = r(1, 3); return inp('What number is missing?', seq[j], `Count backward by ones: ${seq.join(', ')}. The missing number is <b>${seq[j]}</b>.`, { vis: V.seq(seq.map((v, i) => (i === j ? '?' : v))) }); } },
        { id: 'TBB3', name: 'Jumping on a number line', gen() { const a = r(0, 12), b = r(1, 6), fwd = Math.random() < 0.6 || a < b, end = fwd ? a + b : a - b; return inp(`Start at ${a} and jump ${b} times to the ${fwd ? 'right' : 'left'}. Where do you land?`, end, `Each jump ${fwd ? 'add' : 'subtract'} 1: ${a} ${fwd ? '+' : '−'} ${b} = <b>${end}</b>.`, { vis: V.numberLine(0, 20, { from: a, to: end }) }); } },
      ],
    },
    {
      id: 'TBC', grade: -1, name: 'Comparing numbers to 20', icon: '🐊', color: '#1fbf9f', ixl: 'M, HH', sg: 'Kindergarten · Numbers', km: 'Numbers', coret: false,
      tip: 'The crocodile\'s mouth always opens toward the larger number.',
      skills: [
        { id: 'TBC1', name: 'Greater than, less than, or equal', gen() { return C.kit.compareQ(r(0, 20), r(0, 20)); } },
        { id: 'TBC2', name: 'The largest of three numbers', gen() { const xs = shuffle(range(0, 20)).slice(0, 3), big = Math.random() < 0.5, ans = big ? Math.max(...xs) : Math.min(...xs); return ch(`Which one has the ${big ? 'largest' : 'smallest'}?`, xs.map(String), ans, `In order: ${[...xs].sort((a, b) => a - b).join(', ')}. The ${big ? 'largest' : 'smallest'} is <b>${ans}</b>.`); } },
      ],
    },
    {
      id: 'TBD', grade: -1, name: 'Teen numbers', icon: '🧱', color: '#e84393', ixl: 'II', sg: 'Kindergarten · Early place value', km: 'Numbers', coret: false,
      tip: 'Tie 10 popsicle sticks with a rubber band: 1 bundle and 4 loose sticks = 14.',
      skills: [
        { id: 'TBD1', name: 'Tens and ones', gen() { const o = r(1, 9); return inp(`10 and ${o} = ?`, 10 + o, `One ten and ${o} ones is <b>${10 + o}</b>.`, { vis: V.blocks(1, o) }); } },
        { id: 'TBD2', name: 'Breaking apart teen numbers', gen() { const o = r(1, 9); return inp(`${10 + o} = 10 + ?`, o, `${10 + o} is made of 10 and <b>${o}</b>.`, { vis: V.blocks(1, o) }); } },
      ],
    },
    {
      id: 'TBE', grade: -1, name: 'Skip counting by ten to 100', icon: '💯', color: '#9b6dff', ixl: 'KK–LL', sg: 'Kindergarten · Numbers', km: 'Numbers', coret: false,
      tip: 'Count the whole family\'s fingers by tens: 10, 20, 30, ...',
      skills: [
        { id: 'TBE1', name: 'Counting by 10', gen() { const s = r(1, 6) * 10; const seq = [s, s + 10, s + 20, s + 30]; const j = r(1, 3); return inp('What number is missing?', seq[j], `Count by tens: ${seq.join(', ')}. The missing number is <b>${seq[j]}</b>.`, { vis: V.seq(seq.map((v, i) => (i === j ? '?' : v))) }); } },
        { id: 'TBE2', name: 'Counting groups of ten', gen() { const t = r(1, 9); return inp('What\'s the total? (each bar = 10)', t * 10, `There are ${t} ten-bars: ${range(1, t).map((i) => i * 10).join(', ')}. The total is <b>${t * 10}</b>.`, { vis: V.blocks(t, 0) }); } },
      ],
    },
    {
      id: 'TBF', grade: -1, name: 'Addition to 10', icon: '➕', color: '#00b894', ixl: 'N–U', sg: 'Kindergarten · Operations', km: 'Numbers', coret: false,
      tip: 'Play "make 10" with fingers: 7 fingers up, how many more to make 10?',
      skills: [
        { id: 'TBF1', name: 'Adding with pictures to 10', gen() { const [e] = pick(BENDA), a = r(1, 8), b = r(1, 10 - a); return inp(`${a} + ${b} = ?`, a + b, `Combine and count them all: <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
        { id: 'TBF2', name: 'Making 10', gen() { const a = r(1, 9); return inp(`${a} + ? = 10`, 10 - a, `The ten frame has ${a}. It has <b>${10 - a}</b> empty boxes.`, { vis: V.tenFrame(a), meta: { kind: 'bond' } }); } },
        { id: 'TBF3', name: 'Addition stories to 10', gen() { const [e, nm] = pick(BENDA), a = r(1, 7), b = r(1, 10 - a), n1 = pick(C.kit.NAMA); return inp(`${n1} has ${a} ${nm}. An older sibling gives ${b} more. How many ${nm} does ${n1} have now?`, a + b, `"More" means add: ${a} + ${b} = <b>${a + b}</b>.`, { vis: V.groups(e, a, b), meta: { op: '+', a, b } }); } },
      ],
    },
    {
      id: 'TBG', grade: -1, name: 'Subtraction to 10', icon: '➖', color: '#fdcb6e', ixl: 'V–AA', sg: 'Kindergarten · Operations', km: 'Numbers', coret: false,
      tip: 'There are 8 balloons and 3 fly away. Count the balloons still being held.',
      skills: [
        { id: 'TBG1', name: 'Taking away with pictures to 10', gen() { const [e] = pick(BENDA), a = r(2, 10), b = r(1, a - 1); return inp(`${a} − ${b} = ?`, a - b, `There are ${a}, and ${b} are crossed out. <b>${a - b}</b> are left.`, { vis: V.objects(e, a, b), meta: { op: '-', a, b } }); } },
        { id: 'TBG2', name: 'Subtraction stories to 10', gen() { const [e, nm] = pick(BENDA), a = r(3, 10), b = r(1, a - 1), n1 = pick(C.kit.NAMA); return inp(`${n1} has ${a} ${nm}. ${b} are given to a friend. How many are left?`, a - b, `"Given" means subtract: ${a} − ${b} = <b>${a - b}</b>.`, { vis: V.objects(e, a, b), meta: { op: '-', a, b } }); } },
        { id: 'TBG3', name: 'Adding or subtracting 0, 1, 2', gen() { const a = r(2, 10), b = r(0, 2), add = Math.random() < 0.5 && a + b <= 10, ans = add ? a + b : a - b; return inp(`${a} ${add ? '+' : '−'} ${b} = ?`, ans, b === 0 ? `Adding or subtracting 0 doesn't change the number: <b>${a}</b>.` : `Counting ${add ? 'forward' : 'backward'} ${b} from ${a}: <b>${ans}</b>.`, { meta: { op: add ? '+' : '-', a, b } }); } },
      ],
    },
    {
      id: 'TBH', grade: -1, name: 'Patterns and grouping', icon: '🧩', color: '#00a8cc', ixl: 'MM, OO, UU', sg: 'Kindergarten · Patterns', km: 'Algebra', coret: false,
      tip: 'Group toys by color or shape, then count each group.',
      skills: [
        { id: 'TBH1', name: 'Completing patterns', gen() { const [a, b, c] = shuffle(COLORS); const unit = pick([[a, b, c], [a, b, b], [a, a, b, c]]); const seq = Array.from({ length: unit.length * 2 + 2 }, (_, i) => unit[i % unit.length]); const j = r(unit.length, seq.length - 1); return ch('What\'s missing?', shuffle([...new Set([a, b, c])]), seq[j], `The pattern ${unit.join(' ')} repeats. The missing one is <b>${seq[j]}</b>.`, { vis: V.seq(seq.map((v, i) => (i === j ? '?' : v))) }); } },
        { id: 'TBH2', name: 'Which one doesn\'t belong', gen() { const G = pick([[['🍎', '🍌', '🍇', '🍊'], ['🚗', '⚽', '🐱']], [['🐶', '🐱', '🐰', '🐻'], ['🍎', '🚲', '✏️']], [['🚗', '🚌', '🚲', '✈️'], ['🍌', '🐟', '🌸']], [['🔴', '🍓', '🍎', '🌹'], ['🍌', '🐸', '💧']]]); const three = shuffle(G[0]).slice(0, 3), odd = pick(G[1]); return ch('Which one doesn\'t belong?', shuffle([...three, odd]), odd, `${three.join(' ')} are in one group. The different one is <b>${odd}</b>.`); } },
      ],
    },
    {
      id: 'TBI', grade: -1, name: 'Shapes and their parts', icon: '🔷', color: '#e17055', ixl: 'PP–TT', sg: 'Kindergarten · Geometry', km: 'Geometry', coret: false,
      tip: 'Fold paper into two equal parts: that\'s a half.',
      skills: [
        { id: 'TBI1', name: 'Number of sides and corners', gen() { const [s, n] = pick([['triangle', 3], ['square', 4], ['rectangle', 4], ['hexagon', 6]]); const what = pick(['sides', 'corners']); return inp(`How many ${what} does this ${s} have?`, n, `Count the ${what === 'sides' ? 'straight lines' : 'corners'}: there are <b>${n}</b>.`, { vis: V.shape(s, '#4d96ff'), meta: { kind: 'count' } }); } },
        { id: 'TBI2', name: 'Equal parts (halves)', gen() { const eq = Math.random() < 0.5, kind = pick(['circle', 'rect']); return ch('Are the two parts equal?', ['ya', 'no'], eq ? 'ya' : 'no', eq ? 'The two parts are equal: each is <b>one half</b>.' : 'One part is bigger, so they are <b>not</b> equal.', { vis: kind === 'circle' && !eq ? V.fraction('rect', 2, 1, false) : V.fraction(kind, 2, 1, eq) }); } },
        { id: 'TBI3', name: '3D shapes', gen() { const [e, s] = pick(SOLID); return ch(`A ${e} is shaped like a ...`, ['balls', 'cube', 'cylinder', 'cone'], s, `A ${e} is shaped like a <b>${s}</b>.`, { vis: `<div class="bigemoji">${e}</div>` }); } },
      ],
    },
    {
      id: 'TBJ', grade: -1, name: 'Data and picture graphs', icon: '📊', color: '#16a085', ixl: 'VV', sg: 'Kindergarten · Data', km: 'Data Analysis and Probability', coret: false,
      tip: 'Ask about the family\'s favorite fruits, then stick pictures in a row.',
      skills: [
        { id: 'TBJ1', name: 'Reading picture graphs', gen() { const cats = shuffle([['🍎', 'Apple'], ['🍌', 'Banana'], ['🍊', 'Orange']]); const ns = shuffle(range(1, 6)).slice(0, 3); const rows = cats.map((c, i) => [c[0], c[1], ns[i]]); const i = r(0, 2); return inp(`How many children like ${rows[i][1].toLowerCase()}?`, rows[i][2], `Count the ${rows[i][0]} pictures: there are <b>${rows[i][2]}</b>.`, { vis: V.pictograph('Favorite Fruits', rows, 'Each picture = 1 child') }); } },
        { id: 'TBJ2', name: 'Most and fewest', gen() { const cats = shuffle([['🐱', 'Cat'], ['🐶', 'Dog'], ['🐟', 'Fish']]); const ns = shuffle(range(1, 6)).slice(0, 3); const rows = cats.map((c, i) => [c[0], c[1], ns[i]]); const most = Math.random() < 0.5; const pickRow = rows.reduce((a, b) => ((most ? b[2] > a[2] : b[2] < a[2]) ? b : a)); return ch(`Which animal is liked by the ${most ? 'most' : 'fewest'} children?`, rows.map((x) => x[1]), pickRow[1], `${pickRow[1]} has ${pickRow[2]} pictures, the ${most ? 'most' : 'fewest'}. The answer is <b>${pickRow[1]}</b>.`, { vis: V.pictograph('Favorite Animals', rows, 'Each picture = 1 child') }); } },
      ],
    },
    {
      id: 'TBK', grade: -1, name: 'Measuring and time', icon: '⏰', color: '#ff9f43', ixl: 'WW–XX', sg: 'Kindergarten · Measurement', km: 'Measurement', coret: false,
      tip: 'Measure the length of a table with paper clips or hand spans.',
      skills: [
        { id: 'TBK1', name: 'Measuring with clips', gen() { const n = r(2, 8); return inp('How many clips long is this pencil?', n, `Count the clips from end to end: <b>${n}</b> clips.`, { vis: V.clips(n), meta: { kind: 'count' } }); } },
        { id: 'TBK2', name: 'Reading the hour', gen() { const h = r(1, 12); return ch('What time is it?', opt4(`${h} o'clock`, range(1, 12).map((x) => `${x} o'clock`)), `${h} o'clock`, `The long hand is at 12, the short hand at ${h}: <b>${h} o'clock</b>.`, { vis: V.clock(h, 0) }); } },
      ],
    },
    {
      id: 'TBL', grade: -1, name: 'Getting to know money', icon: '🪙', color: '#d99a00', ixl: 'YY–ZZ', sg: 'Kindergarten · Money', km: 'Measurement', coret: false,
      tip: 'Play buying and selling with real coins: Rp100, Rp200, Rp500, and Rp1,000.',
      skills: [
        { id: 'TBL1', name: 'Coin value', gen() { const v = pick(KOIN); return ch('How much is this coin worth?', opt4(`Rp${v.toLocaleString('en-US')}`, KOIN.map((x) => `Rp${x.toLocaleString('en-US')}`)), `Rp${v.toLocaleString('en-US')}`, `The number on the coin shows its value: <b>Rp${v.toLocaleString('en-US')}</b>.`, { vis: V.money([v]) }); } },
        { id: 'TBL2', name: 'Which coin is worth more', gen() { const [a, b] = shuffle(KOIN).slice(0, 2); const ans = `Rp${Math.max(a, b).toLocaleString('en-US')}`; return ch('Which coin is worth more?', [a, b].map((x) => `Rp${x.toLocaleString('en-US')}`), ans, `${Math.max(a, b)} is greater than ${Math.min(a, b)}. The answer is <b>${ans}</b>.`, { vis: V.money([a, b]) }); } },
        { id: 'TBL3', name: 'Needs or wants', gen() { const [it, ans] = pick([['🍚 rice', 'need'], ['💧 drinking water', 'need'], ['👕 clothes', 'need'], ['🏠 home', 'need'], ['🧸 new doll', 'want'], ['🍭 candy', 'want'], ['🎮 toy', 'want'], ['🎈 balloon', 'want']]); return ch(`${it}: need or want?`, ['need', 'want'], ans, ans === 'need' ? 'Needs are what we require to live healthy and safe.' : 'Wants are fun, but we can still live without them.'); } },
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
  C.GRADES.unshift({ id: -2, name: 'Pre-K', short: 'A', stage: 'TK', ixl: 'https://www.ixl.com/math/pre-k', sg: 'Preschool (ages 4–5)' }, { id: -1, name: 'Kindergarten', short: 'B', stage: 'TK', ixl: 'https://www.ixl.com/math/kindergarten', sg: 'Preschool (ages 5–6)' });

  lesson('TAA', 'Counting means saying one number for each object.', [['Counting objects', ['Touch the objects one by one.', 'Say the numbers: one, two, three.', 'The last number = how many objects.'], 'TAA1']]);
  lesson('TAB', 'A ten frame has 2 rows, with 5 boxes in each row.', [['Ten frame', ['One full row = 5.', 'Two full rows = 10.'], 'TAB2']]);
  lesson('TAC', 'One more means add one; one less means take one away.', [['One more', ['Count, then add one more.'], 'TAC1'], ['One less', ['Count, then take one away.'], 'TAC2']]);
  lesson('TAD', 'Pair objects one to one to see which group has more.', [['Comparing', ['Line them up in pairs.', 'The ones left over = more.'], 'TAD1']]);
  lesson('TAE', 'A pattern is an arrangement that repeats.', [['Continuing a pattern', ['Find the part that repeats.', 'Repeat that part.'], 'TAE1']]);
  lesson('TAF', 'Position words: left, right, middle, top, bottom.', [['Left and right', ['The hand holding the spoon is usually the right one.'], 'TAF1']]);
  lesson('TAG', 'Flat shapes: circle, triangle, square. Solid shapes: sphere, cube, cylinder, cone.', [['Flat shapes', ['A circle is round with no corners.', 'A triangle has 3 sides.', 'A square has 4 equal sides.'], 'TAG1'], ['3D shapes', ['A ball rolls.', 'A cube is like a die.'], 'TAG2']]);
  lesson('TAH', 'We can compare length, height, and weight.', [['Comparing', ['Line things up from the same end to compare length.', 'Lift with two hands to compare weight.'], 'TAH2']]);
  lesson('TAI', 'Adding means combining.', [['Combining', ['Put two groups together.', 'Count them all.'], 'TAI1']]);
  lesson('TAJ', 'Subtracting means taking away.', [['Taking away', ['Cross out what\'s taken.', 'Count what\'s left.'], 'TAJ1']]);
  lesson('TBA', 'The numbers 11 to 20 are 10 plus some more.', [['Two frames', ['The first frame is full = 10.', 'Keep counting in the second frame.'], 'TBA1']]);
  lesson('TBB', 'Counting forward = add one, backward = subtract one.', [['Number line', ['To the right, numbers get bigger.', 'To the left, numbers get smaller.'], 'TBB3']]);
  lesson('TBC', 'The number said later when counting is larger.', [['Sign', ['> greater than, < less than, = equal to.'], 'TBC1']]);
  lesson('TBD', 'A teen number = one ten and some ones.', [['Tens and ones', ['14 = 10 + 4.'], 'TBD1']]);
  lesson('TBE', 'Skip counting by ten: 10, 20, 30, ..., 100.', [['Count by ten', ['The first digit goes up by one, and the last digit stays 0.'], 'TBE1']]);
  lesson('TBF', 'Addition to 10.', [['Making 10', ['Pairs that make 10: 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5.'], 'TBF2']]);
  lesson('TBG', 'Subtraction to 10.', [['Taking away', ['Start from the larger number.', 'Count backward by as many as were taken.'], 'TBG1']]);
  lesson('TBH', 'Repeating patterns and grouping objects.', [['Groups', ['Look for what\'s the same: color, shape, or type.'], 'TBH2']]);
  lesson('TBI', 'Shapes have sides and corners; a half means two equal parts.', [['Sides and corners', ['Triangle 3, square 4, hexagon 6.'], 'TBI1'], ['One half', ['The two parts must be equal.'], 'TBI2']]);
  lesson('TBJ', 'Picture graphs help compare amounts.', [['Reading graphs', ['Count the pictures in each row.', 'Longest row = the most.'], 'TBJ1']]);
  lesson('TBK', 'Measuring length with identical objects, and reading the hour.', [['On the hour', ['The long hand is at 12.', 'The short hand points to the hour.'], 'TBK2']]);
  lesson('TBL', 'Money is used to buy needs first, then wants.', [['Coins', ['Rp100, Rp200, Rp500, Rp1,000.'], 'TBL1'], ['Needs and wants', ['Needs: food, drink, clothing, home.'], 'TBL3']]);
})();
