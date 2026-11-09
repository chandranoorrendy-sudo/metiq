/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Pelajaran kelas 4–6, dengan metode Singapore Math (model batang, metode satuan, hitung mental). */
(function () {
  const L = (window.METIQ_LESSONS = window.METIQ_LESSONS || {});
  // Elemen ke-4 (opsional) adalah catatan metode Singapore Math untuk subbab itu
  const add = (id, intro, parts) => { L[id] = { intro, parts: parts.map(([t, steps, ex, sg]) => ({ t, steps, ex, sg })) }; };

  /* ---------- Kelas 4 ---------- */
  add('4A', 'Large numbers are read in groups of three digits from the right: ones, thousands, then millions.', [
    ['Digit value', ['Find the digit\'s place: ones, tens, hundreds, thousands, ten thousands, hundred thousands.', 'Value = digit × its place value. A 7 in the ten thousands place is worth 70,000.'], '4A1'],
    ['Reading large numbers', ['Separate every three digits from the right with a comma: 305,420.', 'Read the front group, then say "thousand": three hundred five thousand four hundred twenty.'], '4A2'],
    ['Rounding', ['Look at the digit just right of the rounding place.', '5 or more → raise the digit in the rounding place; less than 5 → keep it. The digits to its right become 0.'], '4A3'],
  ]);
  add('4B', 'Five-digit numbers are still added and subtracted in columns from the right.', [
    ['Adding large numbers', ['Line up all the columns.', 'Add from the ones, carrying 1 if a column\'s result is 10 or more.', 'Estimate first to make checking the answer easy.'], '4B1'],
    ['Subtracting large numbers', ['Subtract from the right, borrowing if needed.', 'Check: result + subtrahend must equal the original number.'], '4B2'],
    ['Word problems', ['Decide whether things are combined (add) or a remainder/difference is sought (subtract).'], '4B3', 'Draw a bar model first, even if the numbers are large. The bars look the same as for small problems.'],
  ]);
  add('4C', 'A factor divides a number exactly. A multiple is a number times another number.', [
    ['Factors', ['Find the multiplication pairs that give the number: 12 = 1 × 12 = 2 × 6 = 3 × 4.', 'The factors of 12 are 1, 2, 3, 4, 6, 12.'], '4C1'],
    ['Multiples', ['Multiples of 4: 4, 8, 12, 16, … (skip counting by 4s).'], '4C2'],
    ['Prime numbers', ['Prime numbers have only two factors: 1 and themselves (2, 3, 5, 7, 11, …).', 'Composite numbers have more than two factors.'], '4C3'],
    ['Common factors and multiples', ['Write the factors (or multiples) of both numbers.', 'Circle those in common. Take the largest (GCF) or smallest (LCM).'], '4C4'],
  ]);
  add('4D', 'Large multiplications are done by place, then the results are added.', [
    ['Four digits × one digit', ['Multiply the ones, tens, hundreds, and thousands in turn.', 'Add carries to the next column.'], '4D1'],
    ['Two digits × two digits', ['Split the second number: 34 × 26 = 34 × 20 + 34 × 6.', '680 + 204 = 884.'], '4D2', 'Singapore Math uses the long column method: two rows of partial products, then add.'],
    ['× 10, 100, 1.000', ['Add as many zeros at the end as there are in the multiplier.'], '4D3'],
  ]);
  add('4E', 'Long division divides from the largest place to the smallest.', [
    ['Long division', ['Divide the leftmost digit (or two digits) by the divisor.', 'Multiply, subtract, bring down the next digit. Repeat.', 'Check: quotient × divisor (+ remainder) = original number.'], '4E1'],
    ['Division with remainders', ['The remainder is what\'s left after the last division.', 'The remainder must be smaller than the divisor.'], '4E2'],
    ['Interpreting remainders', ['If everyone needs a place → add 1.', 'If only complete ones count → ignore the remainder.'], '4E4'],
  ]);
  add('4F', 'Multi-step problems and order of operations need clear rules.', [
    ['Order of operations', ['Do what\'s inside parentheses first.', 'Then multiply and divide, left to right.', 'Finally add and subtract, left to right.'], '4F2'],
    ['Multi-step problems', ['Write what\'s known and what\'s asked.', 'Calculate each step and label it.', 'Check whether the answer makes sense.'], '4F1', 'Bar models can be stacked for multi-step problems: one bar per step.'],
  ]);
  add('4G', 'Number patterns follow a rule, for example adding or multiplying by the same number.', [
    ['Finding the rule', ['Compare two consecutive numbers: going up, going down, or multiplied?', 'Test that rule on the next number.'], '4G1'],
    ['The nth term', ['nth term = first term + (n − 1) × common difference.', 'Example: 4, 7, 10, … term 10 = 4 + 9 × 3 = 31.'], '4G3'],
  ]);
  add('4H', 'Mixed numbers are made of a whole number and a fraction, for example 2 1/3.', [
    ['Equivalent fractions', ['Multiply or divide the numerator and denominator by the same number.'], '4H1'],
    ['Simplifying', ['Find the GCF of the numerator and denominator.', 'Divide both by that GCF.'], '4H2'],
    ['Mixed numbers and improper fractions', ['7/3: 7 ÷ 3 = 2 remainder 1 → 2 1/3.', '2 1/3: 2 × 3 + 1 = 7 → 7/3.'], '4H3'],
    ['Comparing fractions', ['Make the denominators equal first.', 'Then compare the numerators.'], '4H4'],
  ]);
  add('4I', 'Fractions can be added, subtracted, and multiplied by whole numbers.', [
    ['Related denominators', ['Change the fractions so the denominators match: 1/2 + 1/4 → 2/4 + 1/4.', 'Add the numerators: 3/4.'], '4I2'],
    ['Fraction × whole number', ['Multiply only the numerator: 3 × 2/5 = 6/5 = 1 1/5.', 'The denominator isn\'t multiplied.'], '4I3'],
    ['Fraction of an amount', ['2/3 of 12: divide 12 into 3 equal parts (4).', 'Take 2 parts: 2 × 4 = 8.'], '4I4', 'Unitary method: draw a bar of 12 divided into 3 units. 1 unit = 4, so 2 units = 8.'],
  ]);
  add('4J', 'Decimals are another way to write fractions with denominators of 10, 100, or 1,000. In English they\'re written with a decimal point.', [
    ['Fractions and decimals', ['3/10 = 0.3 (three tenths).', '47/100 = 0.47 (forty-seven hundredths).'], '4J1'],
    ['Decimal place value', ['After the decimal point: tenths, hundredths, thousandths.'], '4J2'],
    ['Comparing decimals', ['Match the number of decimal places by adding zeros: 0.5 = 0.50.', 'Compare like regular numbers: 0.50 > 0.45.'], '4J3'],
    ['Adding and subtracting decimals', ['Line up the decimal points.', 'Add zeros to match the length, then calculate as usual.'], '4J4'],
  ]);
  add('4K', 'Line graphs show change over time. Statistics summarize a set of data.', [
    ['Line graphs', ['Find the point above the time asked about.', 'Read its value on the left axis.', 'Rise or fall = difference between two points.'], '4K1'],
    ['Mode, median, range', ['Mode = the most frequent value.', 'Median = the middle value after ordering the data.', 'Range = largest value − smallest value.'], '4K2'],
  ]);
  add('4L', 'The 24-hour clock and units of measure are used in daily life: schedules, recipes, and distances.', [
    ['The 24-hour clock', ['1 in the afternoon = 13:00. Add 12 for times after noon.', 'Conversely, subtract 12 to change to the 12-hour clock.'], '4L1'],
    ['Elapsed time', ['Count from the start time to the full hour, then to the end time.', 'Add the hours and minutes.'], '4L2'],
    ['Converting units', ['Large unit to small: multiply (1.5 kg = 1,500 g).', 'Small unit to large: divide.'], '4L3'],
  ]);
  add('4M', 'Composite shapes can be split into simpler rectangles.', [
    ['Area of squares and rectangles', ['Area = length × width.', 'Square: side × side.'], '4M1'],
    ['Area of composite shapes', ['Method 1: split into two rectangles, then add.', 'Method 2: find the big rectangle, then subtract the missing part.'], '4M2'],
    ['Perimeter of composite shapes', ['Add all the outer sides.', 'For an L-shape, the perimeter equals that of the big rectangle around it.'], '4M4'],
  ]);
  add('4N', 'Angles are measured in degrees (°). One full turn = 360°.', [
    ['Types of angles', ['Acute: less than 90°. Right: exactly 90°.', 'Obtuse: between 90° and 180°. Straight: 180°.'], '4N1'],
    ['Missing angles', ['Angles on a straight line add up to 180°.', 'Two angles forming a right angle add up to 90°.'], '4N3'],
    ['Directions and turns', ['The 8-point compass rose: north, northeast, east, southeast, south, southwest, west, northwest.', 'Every 45° moves one direction; 90° = a quarter turn.'], '4N4', 'Singapore Math 4B uses 8 compass directions and 1/4, 1/2, 3/4 turns.'],
  ]);
  add('4O', 'Triangles and quadrilaterals are identified by their sides and angles. Line symmetry divides a shape into two matching parts.', [
    ['Types of triangles', ['Equilateral: all three sides equal. Isosceles: two sides equal.', 'Scalene: all sides different. Right: one 90° angle.'], '4O1'],
    ['Axis of symmetry', ['Imagine folding the shape.', 'If the two parts match exactly, the fold is a line of symmetry. Count all the ways to fold.'], '4O3'],
  ]);
  add('4P', 'Calculating prices and saving are part of financial literacy.', [
    ['Unit price', ['Price per item = package price ÷ number of items.', 'Compare the prices per item to find the cheaper one.'], '4P1'],
    ['Saving', ['Number of weeks = goal ÷ savings per week.'], '4P2'],
  ]);

  /* ---------- Kelas 5 ---------- */
  add('5A', 'Numbers to the millions and powers of ten make large numbers easy to write.', [
    ['Digit value to the millions', ['Places from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions.'], '5A1'],
    ['Powers of ten', ['10² = 100, 10³ = 1,000: the exponent = the number of zeros.', '5 × 10³ = 5.000.'], '5A3'],
  ]);
  add('5B', 'Multiplying and dividing by two-digit numbers uses estimates to check answers.', [
    ['Three digits × two digits', ['Split the multiplier into tens and ones.', 'Multiply each, then add.'], '5B1'],
    ['Dividing by two digits', ['Estimate how many times the divisor goes into the number.', 'Multiply, subtract, bring down the next digit.', 'Check with multiplication.'], '5B2'],
  ]);
  add('5C', 'The GCF and LCM help solve equal-sharing and repeating-event problems.', [
    ['FPB', ['Write the factors of both numbers (or their prime factorizations).', 'Take the largest common factor.'], '5C1'],
    ['KPK', ['Write the multiples of both numbers.', 'Take the smallest common multiple.'], '5C2'],
    ['Word problems', ['"Meet again", "together again" → LCM.', '"Divide equally into as many as possible" → GCF.'], '5C3'],
  ]);
  add('5D', 'An expression is a mathematical phrase. The order of operations decides which part is calculated first.', [
    ['Order of operations with parentheses', ['Parentheses → multiply/divide (left to right) → add/subtract (left to right).'], '5D1'],
    ['Writing expressions', ['The part done first goes in parentheses.', '"Subtract 4 from 9, then multiply by 3" → (9 − 4) × 3.'], '5D2'],
    ['Expressions with variables', ['A variable like n stands for a number.', '3n means 3 × n. Replace n with its number, then calculate.'], '5D3', 'Singapore Math 5A introduces algebra as "an unknown number", often drawn as one bar.'],
  ]);
  add('5E', 'To add or subtract fractions with different denominators, make the denominators equal first.', [
    ['Different denominators', ['Find the LCM of the two denominators.', 'Change each fraction to an equivalent with that denominator.', 'Add or subtract the numerators, then simplify.'], '5E1'],
    ['Mixed numbers', ['Change to improper fractions, or calculate the whole and fraction parts separately.', 'Simplify and change back to a mixed number.'], '5E3'],
    ['Fraction word problems', ['Decide the operation, then make the denominators equal.'], '5E4', 'Draw a bar model with fraction pieces to see which parts are combined or subtracted.'],
  ]);
  add('5F', 'Multiplying fractions means taking a part of a part. Fractions can also mean division.', [
    ['Fraction × fraction', ['Multiply numerator by numerator and denominator by denominator.', 'Simplify the result.'], '5F1'],
    ['Dividing by unit fractions', ['5 ÷ 1/2: how many halves are in 5? There are 10.', 'Dividing by 1/n is the same as multiplying by n.'], '5F3'],
    ['Fractions as division', ['3 ÷ 4 = 3/4: 3 objects shared among 4 people, each gets 3/4.'], '5F4'],
  ]);
  add('5G', 'Decimals to the thousandths: three digits after the decimal point.', [
    ['Decimal place value', ['Tenths, hundredths, thousandths.', '3.425: 4 tenths, 2 hundredths, 5 thousandths.'], '5G1'],
    ['Rounding decimals', ['Look at the digit just after the rounding place.', '5 or more → raise it; less than 5 → keep it.'], '5G3'],
    ['Decimals and fractions', ['Change the denominator to 10, 100, or 1,000: 3/4 = 75/100 = 0.75.'], '5G4'],
  ]);
  add('5H', 'Decimal operations are like whole numbers; what matters is where the point goes.', [
    ['Adding and subtracting', ['Line up the points, add zeros, then calculate.'], '5H1'],
    ['Multiplying by whole numbers', ['Multiply without the point.', 'Place the point with as many decimal places as in the problem.'], '5H2'],
    ['Multiplying and dividing by 10, 100, 1,000', ['Multiplying: the point moves right 1, 2, or 3 places.', 'Dividing: the point moves left.'], '5H3'],
  ]);
  add('5I', 'A ratio compares two amounts, for example 2 : 3.', [
    ['Writing ratios', ['Write in the order given in the problem: "apples to bananas" → apples : bananas.', 'Simplify by dividing both by the GCF.'], '5I1'],
    ['Ratio word problems', ['Draw bars for each part of the ratio, with all units the same size.', 'Find the value of 1 unit: total ÷ number of units.', 'Multiply to find what\'s asked.'], '5I3', 'The unitary method and bar model are Singapore Math\'s main ways to solve ratio problems.'],
  ]);
  add('5J', 'Percent means "per hundred". 25% = 25/100.', [
    ['Percents, fractions, decimals', ['50% = 1/2 = 0,5. 25% = 1/4 = 0,25. 10% = 1/10 = 0,1.'], '5J1'],
    ['Percent of a number', ['Find 10% first (divide by 10), then multiply.', '30% of 80: 10% = 8, so 30% = 24.'], '5J2', 'A 100% bar model divided into 10 parts: each part is 10%. This is the Singapore way of finding percents without a formula.'],
    ['Discount', ['Calculate the discount (percent × price).', 'Price paid = price − discount.'], '5J3'],
  ]);
  add('5K', 'The coordinate plane uses two axes: horizontal x and vertical y. Points are written (x, y).', [
    ['Reading coordinates', ['Start from (0, 0).', 'Walk across first (x), then climb up (y).', 'Write (x, y) — the order can\'t be swapped.'], '5K1'],
  ]);
  add('5L', 'Volume is the number of unit cubes that fill a solid shape.', [
    ['Volume with unit cubes', ['Count the cubes in one layer: length × width.', 'Multiply by the number of layers (height).'], '5L1'],
    ['Volume of a cuboid', ['Volume = length × width × height.', 'Cube: edge × edge × edge.'], '5L2'],
    ['Liters and cm³', ['1 liter = 1,000 cm³.', 'Find the volume in cm³, then divide by 1,000 to get liters.'], '5L4'],
  ]);
  add('5M', 'The area of a triangle is half that of a rectangle with the same base and height.', [
    ['Area of a triangle', ['Area = base × height ÷ 2.', 'The height is always perpendicular to the base.'], '5M1'],
    ['Angles in a triangle', ['The three angles of a triangle add up to 180°.', 'Third angle = 180° − the two known angles.'], '5M2'],
    ['Angles around a point', ['Angles around a point add up to 360°.', 'Angles on a straight line add up to 180°.'], '5M3'],
  ]);
  add('5N', 'The average is the sum of all data divided by the number of data points.', [
    ['Calculating averages', ['Add all the data.', 'Divide by the number of data points.'], '5N1'],
    ['Total from an average', ['Total = average × number of data points.', 'Use this to find missing data.'], '5N2', 'Singapore Math 5B uses bar models: all bars are leveled to the same height to show the average.'],
  ]);
  add('5O', 'Decimal units, rates, and time often appear in everyday problems.', [
    ['Units with decimals', ['1.25 kg = 1.25 × 1,000 g = 1,250 g.', '750 mL = 750 ÷ 1,000 L = 0.75 L.'], '5O1'],
    ['Rates', ['Find the value for 1 unit first (the price of 1 kg).', 'Multiply by the number of units asked for.'], '5O2', 'This is the unitary method: from "many" to "one", then from "one" to "many".'],
  ]);

  /* ---------- Kelas 6 ---------- */
  add('6A', 'A power is repeated multiplication. A root is its inverse.', [
    ['Powers', ['2⁵ = 2 × 2 × 2 × 2 × 2 = 32.', 'Don\'t mix them up: 2⁵ isn\'t 2 × 5.'], '6A1'],
    ['Squares and square roots', ['7² = 7 × 7 = 49.', '√49 = 7, because 7 × 7 = 49.'], '6A2'],
    ['Order of operations with powers', ['Parentheses → powers → multiply/divide → add/subtract.'], '6A4'],
  ]);
  add('6B', 'Every composite number can be written as a product of primes.', [
    ['Prime factorization', ['Make a factor tree: keep dividing by the smallest prime.', 'Write all the prime factors: 60 = 2 × 2 × 3 × 5.'], '6B1'],
    ['GCF and LCM of three numbers', ['GCF: take the prime factors found in all numbers, with the lowest powers.', 'LCM: take all the prime factors, with the highest powers.'], '6B2'],
  ]);
  add('6C', 'Dividing by a fraction means multiplying by its reciprocal.', [
    ['Dividing fractions', ['Flip the divisor fraction: 1/2 becomes 2/1.', 'Multiply: 3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 1 1/2.'], '6C1', 'Singapore Math 6A explains it with a model: how many 1/2s are in 3/4?'],
    ['Multiplying decimals', ['Multiply without the point.', 'The decimal places in the result = the decimal places of both numbers added together.'], '6C3'],
    ['Dividing decimals by decimals', ['Move the point in both numbers right until the divisor is a whole number.', 'Then divide as usual.'], '6C4'],
  ]);
  add('6D', 'Integers include negative numbers, like temperatures below zero.', [
    ['Comparing', ['On a number line, the one further right is larger.', '−2 is greater than −5.'], '6D1'],
    ['Adding', ['Adding a positive number → move right.', 'Adding a negative number → move left.'], '6D2'],
    ['Subtracting', ['Subtracting = adding the opposite: 3 − (−4) = 3 + 4 = 7.'], '6D3'],
    ['Multiplying and dividing', ['Same signs → positive result.', 'Different signs → negative result.'], '6D4'],
  ]);
  add('6E', 'The four-quadrant coordinate plane uses negative numbers too.', [
    ['Four-quadrant coordinates', ['Positive x → right, negative x → left.', 'Positive y → up, negative y → down.', 'Write (x, y).'], '6E1'],
    ['Distance between two points', ['If x is the same, distance = difference in y. If y is the same, distance = difference in x.', 'From −2 to 3 the distance is 5, not 1.'], '6E2'],
  ]);
  add('6F', 'Ratios, rates, and speed are calculated with the unitary method.', [
    ['Ratio tables', ['Each column is a multiple of the first column.', 'Multiply both rows by the same number.'], '6F1'],
    ['Speed, distance, time', ['Distance = speed × time.', 'Speed = distance ÷ time. Time = distance ÷ speed.'], '6F3', 'Singapore Math 6B treats speed as a rate: distance covered in 1 unit of time.'],
    ['Proportions', ['Find the value for 1 unit.', 'Multiply by the number of units asked for.'], '6F4'],
  ]);
  add('6G', 'Percents are used for discounts, tax, and comparing a part with the whole.', [
    ['Finding a percent', ['Part ÷ whole × 100%.', '12 of 48 = 12/48 × 100% = 25%.'], '6G1'],
    ['Discounts and tax', ['A discount lowers the price; tax raises it.', 'Final price = price ± (percent × price).'], '6G3'],
    ['Finding the whole', ['If 20% = 15, then 10% = 7.5, and 100% = 75.'], '6G4', '100% bar model: if one part is known, multiply to get the whole.'],
  ]);
  add('6H', 'Algebraic expressions use letters for unknown numbers.', [
    ['Value of an expression', ['Replace each letter with its number.', 'Calculate using the order of operations.'], '6H1'],
    ['Like terms', ['Like terms have the same letter: 3x and 5x.', 'Add only the numbers: 3x + 5x = 8x.'], '6H3'],
    ['Distributive property', ['3(x + 4) = 3 × x + 3 × 4 = 3x + 12.'], '6H4'],
  ]);
  add('6I', 'An equation is like a balanced scale: what you do on one side, do on the other too.', [
    ['One-step equations', ['x + 7 = 15 → subtract 7 from both sides → x = 8.', '3x = 21 → divide by 3 → x = 7.'], '6I1'],
    ['Two-step equations', ['Remove addition/subtraction first, then multiplication/division.', '3x + 4 = 19 → 3x = 15 → x = 5.'], '6I2', 'Draw a bar model: 3 bars of x plus 4 equals 19, then find the value of 1 bar.'],
    ['Inequalities', ['x > 5: x is greater than 5 (5 isn\'t included).', 'x ≥ 5: x is greater than or equal to 5 (5 is included).'], '6I3'],
  ]);
  add('6J', 'A circle has a radius (r) and a diameter (d = 2r). π is about 22/7 or 3.14.', [
    ['Angle pairs', ['Supplementary = 180°. Complementary = 90°.', 'Vertical angles are equal.'], '6J1'],
    ['Circumference of a circle', ['Circumference = 2 × π × r = π × d.', 'Use π = 22/7 if r is a multiple of 7.'], '6J3'],
    ['Area of a circle', ['Area = π × r × r.', 'Don\'t confuse it with circumference: area uses r × r.'], '6J4'],
  ]);
  add('6K', 'Surface area is the sum of the areas of all faces of a solid.', [
    ['Parallelograms and trapezoids', ['Parallelogram: base × height.', 'Trapezoid: (sum of parallel sides) × height ÷ 2.'], '6K1'],
    ['Surface area', ['Cube: 6 × side × side.', 'Cuboid: 2 × (l×w + l×h + w×h).'], '6K2', 'Imagine the net: open up the box into 6 rectangles, then add their areas.'],
  ]);
  add('6L', 'The mean, median, and mode summarize data. Pie charts show parts of a whole.', [
    ['Mean (average)', ['Sum of all data ÷ number of data points.'], '6L1'],
    ['Median', ['Order the data. Take the middle value.', 'With an even number of data points, average the two middle values.'], '6L2'],
    ['Pie charts', ['Each slice shows a percent of the whole.', 'Amount = percent × total.'], '6L4'],
  ]);
  add('6M', 'Probability shows how likely an event is, from 0 (impossible) to 1 (certain).', [
    ['Certain, possible, impossible', ['Certain: always happens. Impossible: can\'t happen.', 'Possible: may or may not happen.'], '6M1'],
    ['Probability as a fraction', ['Probability = number of desired outcomes ÷ number of all outcomes.', 'Simplify the fraction.'], '6M2'],
  ]);
  add('6N', 'Financial literacy: interest, profit and loss, and choosing the best price.', [
    ['Savings interest', ['Interest per year = interest rate × savings.', 'Simple interest over t years = t × yearly interest.'], '6N1'],
    ['Profit and loss', ['Profit = selling price − buying price (if selling price is higher).', 'Loss = buying price − selling price.'], '6N2'],
  ]);
})();
