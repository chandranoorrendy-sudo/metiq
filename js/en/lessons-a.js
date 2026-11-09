/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Pelajaran kelas 1–3.
 * Setiap bab: pengantar singkat dan beberapa subbab. Setiap subbab berisi langkah bernomor
 * dan satu keterampilan contoh; contoh soalnya dibuat dari pembuat soal latihan yang sama.
 */
(function () {
  const L = (window.METIQ_LESSONS = window.METIQ_LESSONS || {});
  // Elemen ke-4 (opsional) adalah catatan metode Singapore Math untuk subbab itu
  const add = (id, intro, parts) => { L[id] = { intro, parts: parts.map(([t, steps, ex, sg]) => ({ t, steps, ex, sg })) }; };

  /* ---------- Kelas 1 ---------- */
  add('A', 'Counting means finding how many objects there are, one by one. The last number you say is how many objects there are.', [
    ['Counting objects', ['Point to the first object and say "one".', 'Move or mark the objects you\'ve counted so none are counted twice.', 'Continue to the last object.', 'The last number you say is the answer.'], 'A1'],
    ['Ten frame', ['A ten frame has 2 rows, with 5 boxes in each row.', 'If the top row is full, start from 5.', 'Count on the dots in the bottom row: 6, 7, 8, …'], 'A2'],
    ['Comparing numbers', ['The number said later when counting is the larger one.', 'The sign <b>&gt;</b> means "greater than", <b>&lt;</b> means "less than", and <b>=</b> means "equal to".', 'Imagine a crocodile\'s mouth 🐊: it always opens toward the larger number.'], 'A5'],
    ['Ordinal numbers', ['Start counting from the starting point (for example the flag 🏁).', 'The first object is 1st, the next is 2nd, and so on.'], 'A6'],
  ]);
  add('B', 'Number bonds show that one number can be split into two parts. This is the key to adding and subtracting.', [
    ['Whole and parts', ['The top circle is the <b>whole</b>, and the two bottom circles are the <b>parts</b>.', 'Part + part = whole.', 'If one part is missing, subtract the known part from the whole.'], 'B1', 'Number bonds are used in all Singapore Math grades. Practice with real objects first (concrete), then circle drawings (pictorial), then numbers (abstract).'],
    ['Making 10', ['Count the dots on the ten frame.', 'Count the empty boxes: that\'s the number needed to make 10.', 'Memorize the pairs of 10: 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5.'], 'B2', 'Pairs of 10 are the basis of the "making 10" strategy for adding and subtracting to 20.'],
  ]);
  add('C', 'Adding means combining two groups and counting them all.', [
    ['Combining two groups', ['Count the first group.', 'Keep counting the objects in the second group.', 'The last number is the sum.'], 'C1'],
    ['Counting on', ['Start from the larger number.', 'Jump right as many times as the other number.', 'Where you stop is the answer.'], 'C2'],
    ['Addition word problems', ['Read the problem slowly.', 'Look for key words: "more", "altogether", "combined", "added".', 'Write the number sentence, then calculate.'], 'C4'],
  ]);
  add('D', 'Subtracting means taking some away from a set of objects, then counting what\'s left.', [
    ['Crossing out what\'s taken', ['Start with all the objects.', 'Cross out as many as are taken.', 'Count the objects not crossed out: that\'s what\'s left.'], 'D1'],
    ['Counting back', ['Start from the first number on the number line.', 'Jump left as many times as the number being subtracted.', 'Where you stop is the answer.'], 'D2'],
    ['Number families', ['Three numbers like 3, 5, 8 form a family.', 'There are two additions: 3 + 5 = 8 and 5 + 3 = 8.', 'There are two subtractions: 8 − 3 = 5 and 8 − 5 = 3.'], 'D5'],
    ['Subtraction word problems', ['Look for key words: "left", "away", "eaten", "given", "popped".', 'Start from the original amount, then subtract.'], 'D4'],
  ]);
  add('E', 'The numbers 11 to 20 are made of one ten (10) and some ones.', [
    ['Tens and ones', ['One bar = 10 cubes.', 'Count the loose cubes (ones).', 'Combine: 10 + ones. For example 10 + 3 = 13.'], 'E1'],
    ['Number patterns', ['Look at two neighboring numbers.', 'Find the difference: how much does it go up or down?', 'Use the same rule to fill in the missing number.'], 'E3'],
  ]);
  add('F', 'To add and subtract to 20, use these strategies: doubles, making 10, and bar models.', [
    ['Doubles and near doubles', ['A double means adding the same number: 6 + 6 = 12.', 'Near double: 6 + 7 = 6 + 6 + 1 = 13.'], 'F1'],
    ['Making 10 to add', ['Choose the number close to 10, for example 8 in 8 + 5.', '8 needs 2 to become 10. Split 5 into 2 and 3.', '8 + 2 = 10, then 10 + 3 = 13.'], 'F2', 'The "make 10" strategy: split the second number with a number bond so the first number becomes exactly 10.'],
    ['Subtracting with the help of 10', ['Split the first number: 14 = 10 + 4.', 'Subtract from 10 first: 10 − 6 = 4.', 'Add the remaining ones: 4 + 4 = 8.'], 'F4', 'The "subtract from 10" strategy: split the first number into 10 and the rest, then subtract from 10.'],
    ['Bar model', ['The long bar is the whole, and its pieces are the parts.', 'If the whole is asked for: add the parts.', 'If one part is asked for: subtract the known part from the whole.', 'To compare: difference = larger − smaller.'], 'F6', 'The bar model is a key feature of Singapore Math for word problems, from grade 1 to grade 6.'],
  ]);
  add('G', 'Numbers to 100 are made of tens and ones.', [
    ['Tens and ones', ['Count the ten-bars: each is worth 10.', 'Count the unit cubes.', 'Write the tens digit first, then the ones.'], 'G1'],
    ['Place value', ['In 47, the digit 4 is in the tens place, with a value of 40.', 'The digit 7 is in the ones place, with a value of 7.'], 'G2'],
    ['Comparing numbers', ['Compare the tens digits first.', 'If the tens are the same, compare the ones.'], 'G3'],
    ['Hundreds chart', ['Going right adds 1, going left subtracts 1.', 'Going down adds 10, going up subtracts 10.'], 'G5'],
  ]);
  add('H', 'Two-digit numbers are added and subtracted by place: ones with ones, tens with tens.', [
    ['Adding and subtracting tens', ['30 + 20 is the same as 3 tens + 2 tens = 5 tens.', 'So 30 + 20 = 50.'], 'H1'],
    ['Column addition without regrouping', ['Write ones under ones and tens under tens.', 'Add the ones first.', 'Then add the tens.'], 'H3'],
    ['Regrouping', ['Add the ones. If the result is 10 or more, write only the ones digit.', 'Carry 1 to the tens column.', 'Add the tens, including the carried 1.'], 'H4'],
  ]);
  add('I', 'Multiplication is adding equal groups. Division is sharing equally.', [
    ['Equal groups', ['Count the number of groups.', 'Count what\'s in one group.', 'Add the contents repeatedly: 3 groups of 4 → 4 + 4 + 4 = 12.'], 'I1', 'Singapore Math introduces multiplication as "equal groups" before memorizing tables.'],
    ['Sharing equally', ['Give objects one at a time to each child.', 'Repeat until the objects are gone.', 'Count the objects one child received.'], 'I3'],
  ]);
  add('J', 'Measuring means comparing the length or weight of objects.', [
    ['Comparing lengths', ['Make sure all objects start from the same line.', 'Look at the end that goes furthest: that\'s the longest.'], 'J1'],
    ['Measuring with a ruler', ['Place the end of the object at 0.', 'Read the number at the other end.', 'If it doesn\'t start at 0, subtract the starting number from the ending number.'], 'J3'],
    ['Heavy and light', ['On a scale, the side that goes down is heavier.', 'The side that goes up is lighter.'], 'J4'],
  ]);
  add('K', 'A clock has two hands: the short hand shows the hour, the long hand shows the minutes.', [
    ['On the hour', ['Look at the long hand: if it\'s at 12, it\'s exactly on the hour.', 'Look at the short hand: the number it points to is the hour.', 'Example: short hand at 3, long hand at 12 → 3:00.'], 'K1'],
    ['Half hours', ['The long hand at 6 means 30 minutes.', 'The short hand is between two numbers; use the smaller number.', '6:30 is also called "half past six", because it\'s halfway from 6 to 7.'], 'K2'],
    ['Days and months', ['Order of days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.', 'One week has 7 days, and one year has 12 months.'], 'K3'],
  ]);
  add('L', 'Rupiah money comes in coins and notes. The value is written on the money.', [
    ['Getting to know money', ['Look at the number written on the coin or note.', 'That\'s the value of the money, for example Rp500 or Rp2,000.'], 'L1'],
    ['Counting money', ['Order the money from the largest value.', 'Start with the largest, then add one by one.'], 'L2'],
    ['Is there enough money?', ['Add up all the money.', 'Compare it with the item\'s price.', 'If the money is equal or more, it\'s enough.'], 'L3'],
  ]);
  add('M', 'Data can be shown with pictographs (pictures) or tally marks (lines).', [
    ['Reading pictographs', ['Read the title and key: each picture is worth 1.', 'Count the pictures in the row asked about.'], 'M1'],
    ['Tally marks', ['One tally group has 5: four upright lines and one diagonal line.', 'Count by 5s for each group, then add the remaining lines.'], 'M2'],
    ['Comparing data', ['Find the two values being compared.', 'How many more = larger − smaller.'], 'M3'],
  ]);
  add('N', 'Flat shapes have sides and corners. A pattern is a sequence that repeats.', [
    ['Flat shapes', ['Count the straight lines (sides) and the corners.', 'A triangle has 3 sides, squares and rectangles have 4 sides, and a circle has no straight sides.'], 'N2'],
    ['3D shapes', ['Sphere: round like ⚽. Cube: all faces are squares like 🎲.', 'Cylinder: like a can 🥫. Cuboid: like a cardboard box 📦. Cone: like an ice cream cone 🍦.'], 'N3'],
    ['Continuing patterns', ['Look for the part that repeats, for example 🔴🔵 🔴🔵.', 'Continue with the same part.'], 'N4'],
  ]);
  add('O', 'A fraction shows a part of one whole divided into equal parts.', [
    ['Equal parts', ['Look at all the parts.', 'If all parts are the same size, the shape is divided equally.'], 'O2'],
    ['Halves, thirds, and quarters', ['Divided into 2 equal parts → one part is <b>one half</b>.', 'Divided into 3 → <b>one third</b>. Divided into 4 → <b>one quarter</b>.'], 'O1'],
  ]);

  /* ---------- Kelas 2 ---------- */
  add('2A', 'Numbers to 1,000 are made of hundreds, tens, and ones.', [
    ['Hundreds, tens, and ones', ['One flat = 100, one bar = 10, one cube = 1.', 'Count each, then write in order: hundreds, tens, ones.'], '2A1'],
    ['Expanded form', ['Split the number by place value.', 'Example: 645 = 600 + 40 + 5.'], '2A3'],
    ['Comparing', ['Compare the hundreds first.', 'If they\'re the same, compare the tens, then the ones.'], '2A5'],
    ['Even and odd', ['Look only at the ones digit.', 'Ones digit 0, 2, 4, 6, 8 → even. Ones digit 1, 3, 5, 7, 9 → odd.'], '2A8'],
  ]);
  add('2B', 'The equal sign (=) means both sides have the same value, like a balanced scale.', [
    ['Balancing equations', ['Work out the complete side first, for example 8 + 5 = 13.', 'The other side must also equal 13.', 'Find the missing number: ? + 6 = 13, so ? = 7.'], '2B2'],
    ['Input and output tables', ['Look at the first pair: what becomes what?', 'Guess the rule (for example + 3), then check it on another pair.', 'Use that rule to fill in what\'s missing.'], '2B3'],
  ]);
  add('2C', 'Two-digit numbers can be added in columns or with mental math strategies.', [
    ['Regrouping', ['Write vertically: ones under ones.', 'Add the ones. If 10 or more, write the ones and carry 1.', 'Add the tens plus the carry.'], '2C1'],
    ['Breaking numbers apart', ['Split the second number into tens and ones: 25 = 20 + 5.', 'Add the tens first, then the ones: 47 + 20 = 67, 67 + 5 = 72.'], '2C2', 'Singapore-style mental math: break numbers into tens and ones, then add them one by one.'],
    ['Compensation', ['For +9, add 10 then subtract 1.', 'For +19, add 20 then subtract 1.'], '2C3', 'The compensation strategy is part of "mental calculation" in Singapore Math 2A.'],
  ]);
  add('2D', 'In column subtraction, if the top digit is smaller, borrow from the column to its left.', [
    ['Borrowing', ['Look at the ones: for example in 52 − 27, the 2 is smaller than 7.', 'Borrow 1 ten: 5 tens becomes 4, and 2 ones becomes 12.', '12 − 7 = 5, then 4 − 2 = 2. The answer is 25.'], '2D2'],
    ['Counting up to subtract', ['Start from the smaller number.', 'Count the jump to the nearest ten, then to the larger number.', 'Add all the jumps.'], '2D3'],
  ]);
  add('2E', 'Adding and subtracting three-digit numbers uses the same method: work by column from the right.', [
    ['Adding or subtracting 10 and 100', ['Adding 10: the tens digit goes up by 1.', 'Adding 100: the hundreds digit goes up by 1. The other digits stay the same.'], '2E1'],
    ['Adding three digits', ['Add the ones, then the tens, then the hundreds.', 'Each column adding up to 10 or more carries 1 to the column on its left.'], '2E3'],
    ['Borrowing across zero', ['Example 400 − 167: the tens and ones are 0.', 'Borrow from the hundreds: 4 hundreds → 3 hundreds and 10 tens.', 'Borrow 1 ten for the ones: 9 tens and 10 ones. Then subtract by column.'], '2E5'],
  ]);
  add('2F', 'Bar models help you understand word problems: draw a bar for each amount in the problem.', [
    ['Parts and whole', ['Draw one long bar for the whole.', 'Divide it into the known parts.', 'Mark what\'s being asked with "?".'], '2F1', 'Part–whole bar model: whole = part + part; part = whole − part.'],
    ['Two-step problems', ['Do the first step and write the result.', 'Use that result for the second step.'], '2F2'],
    ['Ratio', ['Draw two bars, one for each person.', 'The longer part is the difference.'], '2F3', 'Comparison bar model: two stacked bars, with the difference shown as an extra piece.'],
  ]);
  add('2G', 'Multiplication is repeated addition. 3 × 4 means 3 groups of 4.', [
    ['Rows and columns', ['Count the number of rows and how many are in each row.', 'Number of rows × number in each row = total.'], '2G1'],
    ['Repeated addition', ['4 + 4 + 4 is 4 added 3 times.', 'Written 3 × 4 = 12.'], '2G2'],
    ['Multiplying by 2, 5, and 10', ['Skip count by 2s, 5s, or 10s.', 'Count how many times you jump.'], '2G3'],
  ]);
  add('2H', 'Division is sharing equally or making equal groups.', [
    ['Sharing equally', ['12 ÷ 3 means 12 objects shared among 3 children.', 'Give them out one at a time until gone; count one child\'s share.'], '2H1'],
    ['Making groups', ['15 ÷ 5 can mean: how many groups of 5 are in 15 objects?', 'Group them by 5s, then count the groups.'], '2H2'],
    ['Division from multiplication', ['For 20 ÷ 5, think: 5 × ? = 20.', 'Since 5 × 4 = 20, the answer is 4.'], '2H3'],
  ]);
  add('2I', 'A fraction is written with two numbers: the numerator on top and the denominator below.', [
    ['Writing fractions', ['Count all the equal parts: that\'s the <b>denominator</b>.', 'Count the shaded parts: that\'s the <b>numerator</b>.', 'Write numerator/denominator, for example 3/4.'], '2I2'],
    ['Comparing unit fractions', ['Unit fractions have a numerator of 1, for example 1/2 and 1/4.', 'The larger the denominator, the smaller each part.', 'So 1/2 is larger than 1/4.'], '2I3'],
    ['Making one whole', ['One whole = all the parts, for example 4/4.', 'Missing parts = denominator − numerator.'], '2I4'],
  ]);
  add('2J', 'Length is measured in centimeters (cm) for small things and meters (m) for large things.', [
    ['Measuring with a ruler', ['Look at the numbers at the left and right ends of the object.', 'Length = right number − left number.'], '2J1'],
    ['Choosing units', ['Things you can hold (pencils, books) → cm.', 'Large things or distances (doors, fields) → m.'], '2J2'],
  ]);
  add('2K', 'Weight is measured in grams (g) and kilograms (kg). Liquids are measured in liters.', [
    ['Choosing weight units', ['Light things (candy, pencils) → grams.', 'Heavy things (a sack of rice, a watermelon) → kilograms.'], '2K1'],
    ['Scale weights', ['If the scale balances, the object weighs the same as all the weights.', 'Add all the weights.'], '2K2'],
    ['Liters', ['Liters are used to measure liquids, for example water in a bucket.', 'Use addition, subtraction, or multiplication as in regular problems.'], '2K3'],
  ]);
  add('2L', 'The long hand shows the minutes. Each number on the clock is worth 5 minutes.', [
    ['Reading the clock by 5 minutes', ['Look at the short hand: the number it has passed is the hour.', 'Look at the long hand: multiply its number by 5. The number 4 means 20 minutes.'], '2L1'],
    ['The 24-hour clock', ['After 12 noon, add 12.', '3 in the afternoon = 15:00, 7 in the evening = 19:00.'], '2L2'],
    ['Elapsed time', ['Count up from the start time to the end time.', 'Count the full hours first.'], '2L4'],
  ]);
  add('2M', 'Counting money is just like adding numbers, with an Rp sign.', [
    ['Counting money', ['Order from the largest value.', 'Add one by one.'], '2M1'],
    ['Change', ['Change = money paid − price of the item.'], '2M2'],
  ]);
  add('2N', 'Pictographs and bar charts display data. Always read the key first.', [
    ['Pictographs with a scale', ['Read the key, for example "each picture = 2 children".', 'Count the pictures, then multiply by the value of one picture.'], '2N1'],
    ['Bar charts', ['Find the bar being asked about.', 'Draw a line from the top of the bar to the number on the left.'], '2N2'],
  ]);
  add('2O', 'Flat and solid shapes have features you can count. Area is the number of squares inside a shape.', [
    ['Sides and vertices', ['Count the straight lines: those are sides.', 'Count the corners: those are vertices. In a polygon, the numbers are the same.'], '2O2'],
    ['3D shapes', ['Face = flat surface, edge = line where two faces meet, vertex = corner.', 'Cubes and cuboids: 6 faces, 12 edges, 8 vertices.'], '2O3'],
    ['Area with squares', ['Count the number of rows and squares in each row.', 'Rows × squares per row = area.'], '2O4'],
    ['Perimeter', ['Perimeter is the length of all the outer sides.', 'Add the four sides of the rectangle.'], '2O5'],
  ]);
  add('2P', 'Rounding helps you estimate results quickly.', [
    ['Rounding to tens', ['Find the two nearest tens, for example 47 is between 40 and 50.', 'Look at the ones: 5 or more rounds up, less than 5 rounds down.'], '2P1'],
    ['Estimating', ['Round each number first.', 'Add the rounded numbers.'], '2P3'],
  ]);
  add('2Q', 'Many daily acts of worship use numbers: the number of rakaat, the order of prayer times, fasting days, and charity.', [
    ['Adding rakaat', ['Remember the number of rakaat: Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, Isha 4.', 'For two prayers, add their rakaat.', 'Example: Maghrib + Isha = 3 + 4 = 7 rakaat.'], '2Q1'],
    ['Order of prayer times', ['The order is: Fajr, Dhuhr, Asr, Maghrib, Isha.', 'After = one step right, before = one step left.'], '2Q2'],
    ['Days left and money left', ['The whole minus what\'s done = what\'s left.', 'Fasting days: number of days in Ramadan − days completed.', 'Charity: starting money − money given.'], '2Q3', 'Bar model: one whole bar divided into "done" and "left".'],
    ['Sharing equally', ['Give them out one by one until gone.', 'Check with multiplication: number of children × each child\'s share = total.'], '2Q5'],
    ['Rakaat in a day', ['Number of rakaat: Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, Isha 4.', 'Add all five: 2 + 4 + 4 + 3 + 4 = 17 rakaat.'], '2Q6'],
    ['Traveler\'s rakaat', ['A traveler may shorten four-rakaat prayers to two.', 'If two prayers are shortened, the total is 2 + 2 = 4 rakaat.', 'Maghrib isn\'t shortened; it stays three rakaat.'], '2Q7'],
    ['Good deeds multiplied', ['One good deed is rewarded tenfold (QS Al-An\'am 6:160).', 'Multiply the number of good deeds by 10.', 'Example: 7 good deeds × 10 = 70.'], '2Q8'],
    ['Seven ears of a hundred seeds', ['One seed grows into 7 ears (QS Al-Baqarah 2:261).', 'Each ear holds 100 seeds.', '7 × 100 = 700 seeds.'], '2Q9'],
  ]);

  /* ---------- Kelas 3 ---------- */
  add('3A', 'Numbers to 10,000 have four places: thousands, hundreds, tens, and ones.', [
    ['Digit value', ['Find the digit\'s place from the right: ones, tens, hundreds, thousands.', 'Multiply the digit by its place value: 4 in the thousands place = 4,000.'], '3A1'],
    ['Expanded form', ['Split by place value: 4,325 = 4,000 + 300 + 20 + 5.'], '3A2'],
    ['Largest and smallest numbers', ['Largest: put the largest digit first, then go in decreasing order.', 'Smallest: smallest digit first, but not 0.'], '3A4'],
  ]);
  add('3B', 'Rounding makes numbers easier to work with for estimates.', [
    ['Rounding', ['Find the rounding place (tens or hundreds).', 'Look at the digit just to its right.', '5 or more → round up. Less than 5 → round down.'], '3B1'],
    ['Estimating results', ['Round each number to the nearest hundred.', 'Calculate with the rounded numbers.'], '3B2'],
  ]);
  add('3C', 'Large numbers are added and subtracted in columns starting from the ones.', [
    ['Column addition', ['Line up the columns: ones, tens, hundreds, thousands.', 'Add from the right, and carry 1 if a column\'s result is 10 or more.'], '3C2'],
    ['Column subtraction', ['Subtract from the right.', 'If the top digit is smaller, borrow 1 from the column to its left.', 'Check with addition: result + subtrahend = original number.'], '3C3'],
  ]);
  add('3D', 'Multiplication has properties that make calculating easier.', [
    ['Multiplication sentences', ['Number of groups × number in each group.', '4 plates with 6 cakes → 4 × 6.'], '3D1'],
    ['Properties of multiplication', ['Times 0 is 0; times 1 is the number itself.', 'The order can be swapped: 3 × 7 = 7 × 3.'], '3D2'],
    ['Breaking apart multiplication', ['Split one of the numbers: 7 × 8 = 7 × 5 + 7 × 3.', '35 + 21 = 56.'], '3D3', 'Breaking apart multiplication with number bonds (7 × 8 = 7 × 5 + 7 × 3) is the Singapore way to memorize the 6–9 tables.'],
  ]);
  add('3E', 'Knowing your times tables makes calculating much faster.', [
    ['Multiplying by 6 and 7', ['Use 5 as a benchmark: 6 × 7 = 5 × 7 + 1 × 7 = 35 + 7 = 42.'], '3E1'],
    ['Multiplying by 8 and 9', ['× 9 = × 10 then subtract once: 9 × 7 = 70 − 7 = 63.', '× 8 = double of × 4: 8 × 6 = 2 × 24 = 48.'], '3E2'],
    ['Missing factors', ['For ? × 7 = 56, think division: 56 ÷ 7 = 8.'], '3E4'],
  ]);
  add('3F', 'Division doesn\'t always come out even. The part left over is called the remainder.', [
    ['Division facts', ['For 42 ÷ 6, think multiplication: 6 × ? = 42.'], '3F2'],
    ['Division with remainders', ['Find the largest multiple not exceeding the number: 23 ÷ 4 → 4 × 5 = 20.', 'Remainder = 23 − 20 = 3. So 23 ÷ 4 = 5 remainder 3.', 'A remainder is always smaller than the divisor.'], '3F3'],
    ['Remainder word problems', ['Read the question: if everyone must be carried, add 1 for the remainder.', 'If only full ones are asked for, ignore the remainder.'], '3F4'],
  ]);
  add('3G', 'Column multiplication multiplies each place one by one.', [
    ['Two digits × one digit', ['Split by place: 46 × 3 = 40 × 3 + 6 × 3.', '120 + 18 = 138.'], '3G1'],
    ['Multiplying tens and hundreds', ['Multiply the front digits: 40 × 6 → 4 × 6 = 24.', 'Add as many zeros as in the original number: 240.'], '3G4'],
  ]);
  add('3H', 'Word problems can have two steps. Bar models help with "times as many" problems.', [
    ['Two steps', ['Determine what must be found first.', 'Do step 1, then use its result for step 2.'], '3H1'],
    ['Missing numbers', ['Use inverse operations: add ↔ subtract, multiply ↔ divide.', '? + 245 = 600 → ? = 600 − 245.'], '3H2'],
    ['Times as many', ['Draw 1 bar for the smaller amount.', '"3 times as many" = 3 equal bars.'], '3H3', 'Unit bar model: if 1 unit is known, all the other units can be found.'],
  ]);
  add('3I', 'Equivalent fractions are written differently but have the same value.', [
    ['Fractions on a number line', ['Count the parts between 0 and 1: that\'s the denominator.', 'Count the parts from 0 to the point: that\'s the numerator.'], '3I2'],
    ['Equivalent fractions', ['Multiply the numerator and denominator by the same number.', '1/2 = 2/4 = 4/8.'], '3I3', 'Draw two equal strips to see that 1/2 and 2/4 are the same size.'],
    ['Fractions equal to whole numbers', ['If the numerator equals the denominator, the result is 1: 4/4 = 1.', 'Divide the numerator by the denominator: 6/3 = 2.'], '3I4'],
  ]);
  add('3J', 'Comparing and adding fractions is easier when the denominators or numerators are the same.', [
    ['Same denominators', ['Compare the numerators: 5/8 is larger than 3/8.'], '3J1'],
    ['Same numerators', ['Compare the denominators: the larger the denominator, the smaller the fraction.'], '3J2'],
    ['Adding with the same denominator', ['The denominator stays the same.', 'Add or subtract only the numerators: 2/7 + 3/7 = 5/7.'], '3J4'],
  ]);
  add('3K', 'Area is the number of squares inside a shape. Perimeter is the length of all the outer sides.', [
    ['Area of a rectangle', ['Area = length × width.', 'Area units are squared, for example cm².'], '3K2'],
    ['Perimeter', ['Add all the sides.', 'Rectangle: length + width + length + width.'], '3K3'],
    ['Finding a side from the perimeter', ['Square: perimeter ÷ 4.', 'Rectangle: perimeter ÷ 2, then subtract the known side.'], '3K4'],
  ]);
  add('3L', 'A right angle is like the corner of a sheet of paper. Lines can be parallel, perpendicular, or intersecting.', [
    ['Right angle', ['Compare the angle with the corner of a sheet of paper.', 'Narrower = smaller than a right angle; wider = larger.'], '3L2'],
    ['Lines', ['Parallel: never meet.', 'Perpendicular: meet to form a right angle.'], '3L3'],
    ['Types of quadrilaterals', ['Square: 4 equal sides, 4 right angles.', 'Parallelogram: opposite sides are parallel. Trapezoid: only one pair of parallel sides.'], '3L1'],
  ]);
  add('3M', 'Clocks can be read to the minute. Elapsed time is counted from start to finish.', [
    ['Reading minutes', ['Count by 5s up to the last number the long hand has passed.', 'Add the small marks after it (1 minute per mark).'], '3M1'],
    ['Elapsed time', ['Count up to the next full hour.', 'Add the hours and remaining minutes.'], '3M2'],
    ['Units of time', ['1 hour = 60 minutes, 1 minute = 60 seconds.'], '3M3'],
  ]);
  add('3N', 'Metric units are related by 10, 100, or 1,000.', [
    ['Converting units', ['1 m = 100 cm, 1 km = 1,000 m, 1 kg = 1,000 g, 1 L = 1,000 mL.', 'From a large unit to a small unit: multiply.'], '3N1'],
    ['Choosing units', ['Choose the unit that fits the size: distance between cities → km, a glass of water → mL.'], '3N2'],
  ]);
  add('3O', 'Bar charts and pictographs often use a scale, for example each line is worth 5.', [
    ['Bar charts with a scale', ['Find the value of each line on the axis.', 'Read the top of the bar; if it\'s between two lines, the value is halfway.'], '3O1'],
    ['Pictographs with a scale', ['Read the key: each picture = how many?', 'Number of pictures × value of one picture.'], '3O2'],
  ]);
  add('3P', 'Money problems use addition, subtraction, and multiplication like regular numbers.', [
    ['Totals and change', ['Add all the prices.', 'Change = money paid − total price.'], '3P1'],
    ['Price of several items', ['Total price = price of one × number of items.'], '3P2'],
  ]);
})();
