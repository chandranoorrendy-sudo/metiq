/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Profesi tambahan dengan masalah nyata: usaha, guru, programmer, olahraga, keuangan keluarga, dan kesehatan.
 * Format sama dengan js/jobs.js, ditambah done: grafik yang menggantikan vis setelah jawaban benar. Jawaban ditulis sebagai hitungan.
 */
(function () {
  const J = window.METIQ_JOBS, V = window.METIQ_JV, { rp, donut, bars, growth, jars, receipt, split, court, code, robot, seats, dose, chips } = V;
  Object.assign(J.INTERESTS, { usaha: '💼 Business', orang: '🤝 Helping people', olahraga: '🏸 Sports', keluarga: '🏠 Family' });
  J.PROFESSIONS.push(
    { id: 'pengusaha', name: 'Entrepreneur', people: '👩‍💼👨‍💼', art: '📈💰', color: '#2f6fed', interest: 'usaha', what: 'Entrepreneurs run businesses: setting prices, dividing budgets for marketing, sales, and staff, and keeping the business profitable.', math: 'Percents, ratios, budgets, profit and loss, and break-even points.' },
    { id: 'guru', name: 'Teacher', people: '👩‍🏫👨‍🏫', art: '📚✏️', color: '#8e5bd6', interest: 'orang', what: 'Teachers design lessons, form groups, calculate grades, and read data to know who needs help.', math: 'Division, averages, grade weights, and statistics.' },
    { id: 'programmer', name: 'Programmer', people: '👩‍💻👨‍💻', art: '⌨️🤖', color: '#0f9d76', interest: 'teknologi', what: 'Programmers write step-by-step instructions so computers can solve problems.', math: 'Sequences, if-then logic, loops, binary numbers, and algorithm speed.' },
    { id: 'olahraga', name: 'Players and Coaches', people: '🧑‍🦱🏃', art: '🏸🏆', color: '#e8590c', interest: 'olahraga', what: 'Players and coaches plan training, split shared playing costs, and read match data.', math: 'Fair sharing, percents, probability, and speed.' },
    { id: 'keluarga', name: 'Family Money Manager', people: '👨‍👩‍👧', art: '🏠🪙', color: '#d6336c', interest: 'keluarga', what: 'Every family needs to manage money: how much for needs, savings, charity, and growing it.', math: 'Percents, budgets, compound growth, and zakat.' },
    { id: 'kesehatan', name: 'Nurses and Doctors', people: '👩‍⚕️👨‍⚕️', art: '🩺💊', color: '#0b9aa8', interest: 'orang', what: 'Nurses and doctors calculate medicine doses, infusion rates, and read test results.', math: 'Ratios, units, half-life, and probability.' }
  );
  const MED = 'This is math practice. Real medicine doses are always determined by a doctor or pharmacist.';
  const blk = (w, c) => `<span class="jblk" style="width:${w}px;background:${c}"></span>`;
  const row = (a) => chips(a);

  J.MISSIONS.push(
    /* ---------- Pengusaha ---------- */
    { id: 'biz-cake-stall', key: 'bizTK', profession: 'pengusaha', level: 'TK', audio: true, title: 'Arranging cakes for sale', scenario: 'Ms. Ani sells cakes at the market. The cakes must be sorted so buyers can choose easily.', art: '👩‍🍳🧁', topics: ['bilangan'], units: ['TBH', 'TAA'],
      steps: [
        { type: 'drag', mode: 'sort', question: 'Sort the cakes.', bins: [{ id: 'a', label: '🍪' }, { id: 'b', label: '🧁' }], items: [{ id: '1', html: '🍪', bin: 'a' }, { id: '2', html: '🧁', bin: 'b' }, { id: '3', html: '🍪', bin: 'a' }, { id: '4', html: '🧁', bin: 'b' }], hint: 'The same cakes go in the same box.', explanation: 'Round cakes together, cupcakes together. Now buyers can choose easily.' },
        { type: 'choice', question: 'How many cupcakes are there?', vis: row(['🧁', '🧁', '🧁', '🧁']), options: ['3', '4', '5'], answer: '4', hint: 'Touch the cakes one by one while counting.', explanation: 'One, two, three, four. There are four cakes.' },
      ], wrapUp: 'Great! Ms. Ani\'s stall is tidy.', nextMath: ['Counting money (Grades 1–3)', 'Profit and capital (Grades 4–6)'] },
    { id: 'biz-ice-profit', key: 'biz13', profession: 'pengusaha', level: 'SD 1-3', title: 'Profit from selling ice drinks', scenario: 'Dina sells iced orange drinks at the school bazaar. One glass costs Rp2,000. Today 12 glasses are sold. The ingredients cost Rp15,000.', art: '🧒🍹', topics: ['bilangan'], units: ['2G', '3P', '2D'],
      steps: [
        { type: 'number', question: 'How much money did Dina take in?', unit: 'rupiah', vis: receipt('Today\'s sales', [['Iced orange', '12 glasses'], ['Price per glass', rp(2000)]]), answer: 12 * 2000, hint: 'Multiply the number of glasses by the price.', explanation: '12 × 2,000 = 24,000 rupiah.' },
        { type: 'number', question: 'The ingredients cost Rp15,000. What is Dina\'s profit?', unit: 'rupiah', vis: bars([['Sales', 24000, '#1fbf9f'], ['Capital', 15000, '#ff7a59']], { fmt: rp }), done: bars([['Sales', 24000, '#1fbf9f'], ['Capital', 15000, '#ff7a59'], ['Profit', 9000, '#f5a524']], { fmt: rp }), answer: 24000 - 15000, hint: 'Profit = sales − capital.', explanation: '24,000 − 15,000 = 9,000 rupiah.' },
        { type: 'number', question: 'Dina buys a book for Rp5,000 from her profit. How much profit is left?', unit: 'rupiah', answer: 9000 - 5000, hint: 'Subtract the book\'s price from the profit.', explanation: '9,000 − 5,000 = 4,000 rupiah.' },
      ], wrapUp: 'Dina knows the difference between sales and profit.', nextMath: ['Percent budgets (Grades 4–6)', 'Break-even point (high school)'] },
    { id: 'biz-shop-budget', key: 'biz46', profession: 'pengusaha', level: 'SD 4-6', title: 'Dividing a store\'s budget', scenario: 'Mr. Rudi\'s store has a budget of Rp2,000,000 each month. 50% is for buying goods, 20% for marketing, and the rest for staff wages.', art: '👨‍💼🏪', topics: ['bilangan', 'data'], units: ['5J', '4P', '6N'],
      steps: [
        { type: 'number', question: 'How many rupiah for buying goods?', unit: 'rupiah', vis: donut([['Goods', 50], ['Marketing', 20], ['Wages', 30]], { c: 'Rp2 million', c2: 'per month' }), answer: 2000000 * 50 / 100, hint: '50% is the same as half.', explanation: '50% × 2,000,000 = 1,000,000 rupiah.' },
        { type: 'number', question: 'How many rupiah for marketing?', unit: 'rupiah', answer: 2000000 * 20 / 100, hint: '10% of 2,000,000 is 200,000. What is 20%?', explanation: '20% × 2,000,000 = 400,000 rupiah.' },
        { type: 'number', question: 'How many rupiah are left for wages?', unit: 'rupiah', vis: bars([['Goods', 1000000], ['Marketing', 400000]], { fmt: rp, max: 2000000 }), done: bars([['Goods', 1000000], ['Marketing', 400000], ['Wages', 600000]], { fmt: rp, max: 2000000 }), answer: 2000000 - 1000000 - 400000, hint: 'Subtract the two budgets from Rp2,000,000.', explanation: '2,000,000 − 1,000,000 − 400,000 = 600,000 rupiah.' },
        { type: 'number', question: 'The wages are shared equally between 2 employees. What is each person\'s wage?', unit: 'rupiah', vis: split(rp(600000), 2, '👩‍💼👨‍💼'), done: split(rp(600000), 2, '👩‍💼👨‍💼', rp(300000)), answer: 600000 / 2, hint: 'Divide 600,000 by 2.', explanation: '600,000 ÷ 2 = 300,000 rupiah.' },
      ], wrapUp: 'Every rupiah in Mr. Rudi\'s store now has a job.', nextMath: ['Budget ratios (middle school)', 'Break-even point (high school)'] },
    { id: 'biz-department-budget', key: 'bizSMP', profession: 'pengusaha', level: 'SMP', title: 'Marketing, sales, and HR budgets', scenario: 'A small company has a budget of Rp60,000,000 per quarter. It\'s divided among Marketing : Sales : HR : Operations = 2 : 3 : 1 : 4.', art: '👩‍💼📊', topics: ['bilangan', 'data'], units: ['7D', '5I'],
      steps: [
        { type: 'number', question: 'How many rupiah is one part worth?', unit: 'rupiah', vis: donut([['Marketing', 2], ['Sales', 3], ['HR', 1], ['Operations', 4]], { c: 'Rp60 million', fmt: (v) => `${v} parts` }), answer: 60000000 / (2 + 3 + 1 + 4), hint: 'Add all the parts, then divide the budget.', explanation: '2 + 3 + 1 + 4 = 10 parts. 60,000,000 ÷ 10 = 6,000,000 rupiah.' },
        { type: 'number', question: 'What is the Marketing budget?', unit: 'rupiah', answer: 2 * 6000000, hint: 'Marketing gets 2 parts.', explanation: '2 × 6,000,000 = 12,000,000 rupiah.' },
        { type: 'number', question: 'The Marketing budget brings in 300 customers. What does it cost to get one customer?', unit: 'rupiah', vis: bars([['Budget', 12000000, '#2f6fed']], { fmt: rp }), answer: 12000000 / 300, hint: 'Divide the budget by the number of customers.', explanation: '12,000,000 ÷ 300 = 40,000 rupiah per customer.' },
        { type: 'number', question: 'Each customer gives a gross profit of Rp55,000. What\'s the remaining profit per customer after marketing costs?', unit: 'rupiah', answer: 55000 - 40000, hint: 'Subtract the cost of getting a customer.', explanation: '55,000 − 40,000 = 15,000 rupiah.' },
        { type: 'choice', question: 'A customer from ad A costs Rp40,000 and from ad B Rp70,000, with the same gross profit of Rp55,000. Which should be increased?', options: ['Ad A', 'Ad B', 'Both are the same'], answer: 'Ad A', hint: 'Which ad still leaves a profit?', explanation: 'Ad A still earns Rp15,000 per customer, while ad B loses Rp15,000.' },
      ], wrapUp: 'You divided the budget and judged whether marketing is really profitable.', nextMath: ['Break-even and linear functions (high school)', 'Business statistics'] },
    { id: 'biz-break-even', key: 'bizSMA', profession: 'pengusaha', level: 'SMA', title: 'Break-even and the best price', scenario: 'A packaged coffee business has fixed costs of Rp12,000,000 per month. Making one package costs Rp10,000, and it sells for Rp25,000.', art: '🧑‍💼☕', topics: ['aljabar'], units: ['A1C', '8F'],
      steps: [
        { type: 'number', question: 'What is the profit from one package (before fixed costs)?', unit: 'rupiah', vis: receipt('One package', [['Selling price', rp(25000)], ['Cost to make', rp(10000)]]), answer: 25000 - 10000, hint: 'Selling price − cost to make.', explanation: '25,000 − 10,000 = 15,000 rupiah.' },
        { type: 'number', question: 'How many packages must be sold to break even (zero profit)?', unit: 'packages', answer: 12000000 / 15000, hint: 'Fixed costs divided by profit per package.', explanation: '12,000,000 ÷ 15,000 = 800 packages.' },
        { type: 'number', question: 'For a profit of Rp6,000,000, how many packages must be sold?', unit: 'packages', answer: (12000000 + 6000000) / 15000, hint: 'Add the profit target to the fixed costs.', explanation: '18,000,000 ÷ 15,000 = 1,200 packages.' },
        { type: 'number', question: 'At a price of Rp25,000, 1,500 packages sell. What is the profit?', unit: 'rupiah', answer: 1500 * 15000 - 12000000, hint: 'Number × profit per package − fixed costs.', explanation: '1,500 × 15,000 − 12,000,000 = 10,500,000 rupiah.' },
        { type: 'number', question: 'If the price rises to Rp28,000, sales drop to 1,200 packages. What is the profit?', unit: 'rupiah', answer: 1200 * (28000 - 10000) - 12000000, hint: 'Profit per package becomes 28,000 − 10,000.', explanation: '1,200 × 18,000 − 12,000,000 = 9,600,000 rupiah.' },
        { type: 'choice', question: 'Which price gives the larger profit?', vis: bars([['Rp25.000', 10500000, '#1fbf9f'], ['Rp28.000', 9600000, '#ff7a59']], { fmt: rp }), options: ['Rp25.000', 'Rp28.000', 'The same'], answer: 'Rp25.000', hint: 'Compare the two profits.', explanation: 'The Rp10,500,000 profit is larger. A higher price isn\'t always more profitable.' },
      ], wrapUp: 'You modeled profit as a function and made a pricing decision.', nextMath: ['Quadratic functions for the optimal price', 'Calculus: optimization'] },

    /* ---------- Guru ---------- */
    { id: 'edu-groups-tk', key: 'eduTK', profession: 'guru', level: 'TK', audio: true, title: 'Forming groups', scenario: 'The teacher has six children in class. The children will play in two equal groups.', art: '👩‍🏫🧒', topics: ['bilangan'], units: ['TAD', 'TBF'],
      steps: [
        { type: 'choice', question: 'There are six children and two groups. How many children are in each group?', vis: seats(2, 3), options: ['2', '3', '4'], answer: '3', hint: 'Count the children in one group.', explanation: 'Each group has three children.' },
        { type: 'choice', question: 'There are three children. Each child needs one crayon. How many crayons are needed?', vis: row(['🧒', '🧒', '🧒']), options: ['2', '3', '4'], answer: '3', hint: 'One child, one crayon.', explanation: 'Three children need three crayons.' },
      ], wrapUp: 'Thank you! All the children have a group and crayons.', nextMath: ['Division (Grades 1–3)', 'Averages (Grades 4–6)'] },
    { id: 'edu-class-supplies', key: 'edu13', profession: 'guru', level: 'SD 1-3', title: 'Preparing class supplies', scenario: 'There are 24 students in class. Ms. Lia divides them into groups of 4. Each group needs 3 large sheets of paper.', art: '👩‍🏫📄', topics: ['bilangan'], units: ['2H', '2G'],
      steps: [
        { type: 'number', question: 'How many groups are there?', unit: 'kelompok', vis: seats(6, 4), answer: 24 / 4, hint: 'Divide 24 by 4.', explanation: '24 ÷ 4 = 6 groups.' },
        { type: 'number', question: 'How many sheets of paper do all the groups need?', unit: 'sheets', answer: 6 * 3, hint: 'There are 6 groups with 3 sheets each.', explanation: '6 × 3 = 18 sheets.' },
        { type: 'number', question: 'There are 20 sheets in the cupboard. How many sheets are left?', unit: 'sheets', answer: 20 - 18, hint: 'Subtract those used.', explanation: '20 − 18 = 2 sheets.' },
      ], wrapUp: 'Ms. Lia\'s class is ready and no one is short of paper.', nextMath: ['Average scores (Grades 4–6)', 'Grade weights (middle school)'] },
    { id: 'edu-average', key: 'edu46', profession: 'guru', level: 'SD 4-6', title: 'Calculating a class average', scenario: 'Mr. Bayu checks five students\' quizzes. The scores are 70, 80, 90, 60, and 100.', art: '👨‍🏫📝', topics: ['data'], units: ['5N', '4K'],
      steps: [
        { type: 'number', question: 'What is the average score?', vis: growth([['Ani', 70], ['Budi', 80], ['Citra', 90], ['Dedi', 60], ['Eka', 100]], { c: '#8e5bd6' }), answer: (70 + 80 + 90 + 60 + 100) / 5, hint: 'Add all the scores, then divide by 5.', explanation: '400 : 5 = 80.' },
        { type: 'number', question: 'What is the difference between the highest and lowest scores?', answer: 100 - 60, hint: 'Highest − lowest.', explanation: '100 − 60 = 40.' },
        { type: 'number', question: 'A sixth student scores 86. What is the new average?', answer: (400 + 86) / 6, hint: 'Add 86 to the old total of 400, then divide by 6.', explanation: '486 : 6 = 81.' },
        { type: 'choice', question: 'Who most needs Mr. Bayu\'s help?', options: ['Dedi (60)', 'Citra (90)', 'Eka (100)'], answer: 'Dedi (60)', hint: 'Find the score far below the average.', explanation: 'Dedi is 20 points below the average. Data helps teachers know who needs help.' },
      ], wrapUp: 'You used data to help students.', nextMath: ['Grade weights (middle school)', 'Standard deviation (high school)'] },
    { id: 'edu-weighted-grade', key: 'eduSMP', profession: 'guru', level: 'SMP', title: 'Weighted report card grades', scenario: 'A report card grade is calculated from Homework 20%, Midterm 30%, and Final Exam 50%. Siti scores Homework 80, Midterm 70, Final Exam 90.', art: '👩‍🏫📊', topics: ['bilangan', 'data'], units: ['7D', '7I'],
      steps: [
        { type: 'number', question: 'How much does Homework contribute?', vis: donut([['Tasks', 20], ['Midterm', 30], ['Final Exam', 50]], { c: '100%' }), answer: 80 * 20 / 100, hint: '20% of 80.', explanation: '20% × 80 = 16.' },
        { type: 'number', question: 'How much does the Midterm contribute?', answer: 70 * 30 / 100, hint: '30% of 70.', explanation: '30% × 70 = 21.' },
        { type: 'number', question: 'What is Siti\'s report card grade?', answer: 16 + 21 + 90 * 50 / 100, hint: 'Add 50% of 90 to the previous result.', explanation: '16 + 21 + 45 = 82.' },
        { type: 'number', question: 'Andi has Homework 90 and Midterm 60 and wants a report card grade of 75. What Final Exam score is needed?', answer: (75 - 18 - 18) / 0.5, hint: 'Write 18 + 18 + 0.5x = 75.', explanation: '0.5x = 39, so x = 78.' },
      ], wrapUp: 'You see why heavily weighted exams matter more.', nextMath: ['Score distribution (high school)', 'Linear equations'] },
    { id: 'edu-spread', key: 'eduSMA', profession: 'guru', level: 'SMA', title: 'Reading score distributions', scenario: 'A teacher analyzes five students\' scores: 60, 70, 80, 90, and 100. The teacher also wants to compare students from different classes fairly.', art: '👨‍🏫📈', topics: ['data'], units: ['8I', '7I'],
      steps: [
        { type: 'number', question: 'What is the mean?', vis: growth([['A', 60], ['B', 70], ['C', 80], ['D', 90], ['E', 100]], { c: '#8e5bd6' }), answer: (60 + 70 + 80 + 90 + 100) / 5, hint: 'The sum divided by 5.', explanation: '400 : 5 = 80.' },
        { type: 'number', question: 'What is the variance (the mean of the squared differences from the mean)?', answer: (400 + 100 + 0 + 100 + 400) / 5, hint: 'The differences are −20, −10, 0, 10, 20.', explanation: '(400 + 100 + 0 + 100 + 400) : 5 = 200.' },
        { type: 'number', question: 'Class A: mean 70, standard deviation 10. Budi scores 85. What is Budi\'s z-score?', answer: (85 - 70) / 10, hint: 'z = (score − mean) ÷ standard deviation.', explanation: '(85 − 70) : 10 = 1,5.' },
        { type: 'number', question: 'Class B: mean 80, standard deviation 5. Cici scores 85. What is Cici\'s z-score?', answer: (85 - 80) / 5, hint: 'Use the same formula.', explanation: '(85 − 80) : 5 = 1.' },
        { type: 'choice', question: 'Both scored 85. Who did better within their class?', options: ['Budi', 'Cici', 'The same'], answer: 'Budi', hint: 'Which z-score is larger?', explanation: 'Budi is further above his class mean. z-scores make comparisons fairer.' },
        { type: 'number', question: 'A class average rises from 60 to 72 after a study program. What percent did it rise?', unit: '%', vis: bars([['Before', 60, '#ff7a59'], ['After', 72, '#1fbf9f']]), answer: (72 - 60) / 60 * 100, hint: 'The increase divided by the starting score, times 100%.', explanation: '12 : 60 × 100% = 20%.', tol: 0.001 },
      ], wrapUp: 'You read education data like a researcher.', nextMath: ['Normal distribution', 'Statistical tests'] },

    /* ---------- Programmer ---------- */
    { id: 'code-sequence-tk', key: 'codTK', profession: 'programmer', level: 'TK', audio: true, title: 'Commands for a robot', scenario: 'A robot only understands commands in order. Let\'s help the robot wash its hands and walk to the star.', art: '🤖⭐', topics: ['bilangan'], units: ['TAE', 'TAF'],
      steps: [
        { type: 'drag', mode: 'order', question: 'Put the steps for washing hands in order.', items: [{ id: 'k', html: '🧻' }, { id: 'a', html: '💧' }, { id: 's', html: '🧼' }], answer: ['a', 's', 'k'], hint: 'Wet your hands, use soap, then dry them.', explanation: 'Water, soap, then towel. The right order makes the robot succeed.' },
        { type: 'choice', question: 'How many steps until the robot reaches the star?', vis: robot(3), options: ['2', '3', '4'], answer: '3', hint: 'Count the boxes to the star.', explanation: 'One, two, three. Three steps.' },
      ], wrapUp: 'Great! You just gave commands to a robot.', nextMath: ['Loops (Grades 1–3)', 'Variables (Grades 4–6)'] },
    { id: 'code-loops', key: 'cod13', profession: 'programmer', level: 'SD 1-3', title: 'Repeating commands', scenario: 'Programmers use a repeat command so they don\'t write the same thing many times.', art: '👩‍💻🔁', topics: ['bilangan'], units: ['2G', '2O'],
      steps: [
        { type: 'number', question: 'How many steps does the robot walk?', unit: 'steps', vis: code(['repeat 4 times:', '&nbsp;&nbsp;move 2 steps']), answer: 4 * 2, hint: '4 times forward 2.', explanation: '4 × 2 = 8 steps.' },
        { type: 'number', question: 'How many stars are drawn?', unit: 'bintang', vis: code(['repeat 3 times:', '&nbsp;&nbsp;draw ⭐⭐']), answer: 3 * 2, hint: 'Each round draws 2 stars.', explanation: '3 × 2 = 6 stars.' },
        { type: 'choice', question: 'If number = 7, which way does the robot turn?', vis: code(['if number is even:', '&nbsp;&nbsp;turn left 👈', 'otherwise:', '&nbsp;&nbsp;turn right 👉'], [['number', 7]]), options: ['👈 left', '👉 right'], answer: '👉 right', hint: 'Is 7 an even number?', explanation: '7 is odd, so the "otherwise" part runs: turn right.' },
      ], wrapUp: 'You understood loops and decisions, two basics of programming.', nextMath: ['Variables (Grades 4–6)', 'Logic and binary (middle school)'] },
    { id: 'code-variables', key: 'cod46', profession: 'programmer', level: 'SD 4-6', title: 'Tracing variables', scenario: 'When making a game, programmers store the score in a variable. Follow the program line by line.', art: '👨‍💻🎮', topics: ['bilangan', 'aljabar'], units: ['5D', '4G'],
      steps: [
        { type: 'number', question: 'What is the score at the end of the program?', vis: code(['score = 0', 'repeat 5 times:', '&nbsp;&nbsp;score = score + 3']), answer: 5 * 3, hint: 'Each round the score goes up by 3.', explanation: 'The score becomes 3, 6, 9, 12, 15. Finally 15.' },
        { type: 'number', question: 'What is the value of x at the end of the program?', vis: code(['x = 2', 'repeat 3 times:', '&nbsp;&nbsp;x = x × 2']), answer: 2 * 2 * 2 * 2, hint: 'Follow: 2, then 4, then what?', explanation: 'x becomes 4, 8, 16. Finally 16.' },
        { type: 'number', question: 'What is the total at the end of the program?', vis: code(['total = 0', 'for i from 1 to 4:', '&nbsp;&nbsp;total = total + i']), answer: 1 + 2 + 3 + 4, hint: 'Calculate 1 + 2 + 3 + 4.', explanation: 'The total becomes 1, 3, 6, 10. Finally 10.' },
        { type: 'choice', question: 'What does the program display?', vis: code(['score = 70', 'if score ≥ 75:', '&nbsp;&nbsp;display "Pass"', 'otherwise:', '&nbsp;&nbsp;display "Try again"'], [['nilai', 70]]), options: ['Pass', 'Try again'], answer: 'Try again', hint: 'Is 70 greater than or equal to 75?', explanation: '70 is less than 75, so "Try again" is displayed.' },
      ], wrapUp: 'You can read a program like a computer.', nextMath: ['Logic and binary (middle school)', 'Algorithm speed (high school)'] },
    { id: 'code-logic-binary', key: 'codSMP', profession: 'programmer', level: 'SMP', title: 'Logic and binary numbers', scenario: 'Computers store data as 0 and 1, then make decisions with logic.', art: '👩‍💻💡', topics: ['bilangan'], units: ['6A', '7E'],
      steps: [
        { type: 'number', question: 'What is the binary number 1011 in decimal?', vis: chips(['1×8', '0×4', '1×2', '1×1']), answer: 8 + 0 + 2 + 1, hint: 'Its place values are 8, 4, 2, 1.', explanation: '8 + 0 + 2 + 1 = 11.' },
        { type: 'number', question: 'Write 12 in binary (four digits).', answer: 1100, hint: '12 = 8 + 4.', explanation: '12 = 8 + 4, so 1100.' },
        { type: 'choice', question: 'x = 12. What is the result of this logic?', vis: code(['(x > 3) AND (x < 10)'], [['x', 12]]), options: ['Correct', 'False'], answer: 'False', hint: 'AND is true only if both conditions are true.', explanation: '12 > 3 is true, but 12 < 10 is false. So the result is false.' },
        { type: 'number', question: 'How many times does "count" go up?', vis: code(['count = 0', 'for i from 1 to 20:', '&nbsp;&nbsp;if i is divisible by 3:', '&nbsp;&nbsp;&nbsp;&nbsp;count = count + 1']), answer: Math.floor(20 / 3), hint: 'How many multiples of 3 are there up to 20?', explanation: '3, 6, 9, 12, 15, 18. That\'s 6 times.' },
        { type: 'number', question: 'How many times does the "print" line run?', vis: code(['for i from 1 to 3:', '&nbsp;&nbsp;for j from 1 to 4:', '&nbsp;&nbsp;&nbsp;&nbsp;print(i, j)']), answer: 3 * 4, hint: 'Each i runs through all of j.', explanation: '3 × 4 = 12 times.' },
      ], wrapUp: 'You understand how computers count and think.', nextMath: ['Algorithm complexity (high school)', 'Logarithms'] },
    { id: 'code-algorithm-speed', key: 'codSMA', profession: 'programmer', level: 'SMA', title: 'Which algorithm is faster?', scenario: 'An app must find one name in a sorted list. A programmer compares the number of steps in each algorithm.', art: '👨‍💻⚡', topics: ['aljabar'], units: ['A2D', 'A2E'],
      steps: [
        { type: 'number', question: 'A one-by-one search through 1,024 names. What\'s the most steps it could take?', unit: 'steps', answer: 1024, hint: 'At worst, the name is last.', explanation: 'At most 1,024 steps.' },
        { type: 'number', question: 'Binary search throws away half the list each step. How many steps for 1,024 names?', unit: 'steps', vis: growth([['1 step', 512], ['2', 256], ['3', 128], ['4', 64], ['5', 32]], { c: '#0f9d76' }), answer: Math.log2(1024), hint: '2 to what power equals 1,024?', explanation: '2¹⁰ = 1,024, so 10 steps.' },
        { type: 'number', question: 'An n² algorithm runs on n = 1,000. How many operations are needed?', unit: 'operations', answer: 1000 * 1000, hint: 'Square 1,000.', explanation: '1,000 × 1,000 = 1,000,000 operations.' },
        { type: 'number', question: 'Recursive program: f(1) = 1, f(2) = 1, f(n) = f(n − 1) + f(n − 2). What is f(6)?', vis: code(['function f(n):', '&nbsp;&nbsp;if n ≤ 2: return 1', '&nbsp;&nbsp;return f(n−1) + f(n−2)']), answer: 8, hint: 'The sequence is 1, 1, 2, 3, ...', explanation: '1, 1, 2, 3, 5, 8. So f(6) = 8.' },
        { type: 'choice', question: 'A list has 1 million sorted names. Which algorithm should be chosen?', options: ['Binary search', 'One by one', 'Equally fast'], answer: 'Binary search', hint: 'Compare about 20 steps with 1 million steps.', explanation: 'Binary search only needs about 20 steps because 2²⁰ is more than 1 million.' },
      ], wrapUp: 'You chose an algorithm with math, not guessing.', nextMath: ['Logarithms and series', 'Discrete math'] },

    /* ---------- Olahraga ---------- */
    { id: 'sport-balls-tk', key: 'spoTK', profession: 'olahraga', level: 'TK', audio: true, title: 'Tidying up the balls', scenario: 'The coach tidies up the balls after training. Balls must go in the basket of the same type.', art: '🧑‍🦱⚽', topics: ['bilangan'], units: ['TBH', 'TAA'],
      steps: [
        { type: 'drag', mode: 'sort', question: 'Put the balls in their baskets.', bins: [{ id: 'a', label: '⚽' }, { id: 'b', label: '🏀' }], items: [{ id: '1', html: '⚽', bin: 'a' }, { id: '2', html: '🏀', bin: 'b' }, { id: '3', html: '🏀', bin: 'b' }, { id: '4', html: '⚽', bin: 'a' }], hint: 'The same balls go in the same basket.', explanation: 'All the balls are in their baskets.' },
        { type: 'choice', question: 'How many goals did the red team score?', vis: row(['⚽', '⚽', '⚽']), options: ['2', '3', '4'], answer: '3', hint: 'Count the balls.', explanation: 'One, two, three. Three goals.' },
      ], wrapUp: 'Thank you! The field is tidy.', nextMath: ['Scores and differences (Grades 1–3)', 'Sharing costs (Grades 4–6)'] },
    { id: 'sport-futsal-score', key: 'spo13', profession: 'olahraga', level: 'SD 1-3', title: 'A futsal match score', scenario: 'Two teams play futsal. Each team has 5 players. The Blue Team scores 4 goals and the Red Team 2 goals.', art: '🏃⚽', topics: ['bilangan'], units: ['2D', '2G'],
      steps: [
        { type: 'number', question: 'What is the goal difference?', unit: 'goals', vis: bars([['Blue Team', 4, '#2f6fed'], ['Red Team', 2, '#e0464b']]), answer: 4 - 2, hint: 'Subtract the smaller number of goals.', explanation: '4 − 2 = 2 goals.' },
        { type: 'number', question: 'How many players are there in all?', unit: 'players', answer: 2 * 5, hint: 'There are 2 teams with 5 players each.', explanation: '2 × 5 = 10 players.' },
        { type: 'number', question: 'Each player drinks 2 bottles of water. How many bottles must be prepared?', unit: 'bottles', answer: 10 * 2, hint: '10 players, 2 bottles each.', explanation: '10 × 2 = 20 bottles.' },
      ], wrapUp: 'The match went smoothly because the supplies were calculated.', nextMath: ['Sharing costs (Grades 4–6)', 'Percents (middle school)'] },
    { id: 'sport-badminton-split', key: 'spo46', profession: 'olahraga', level: 'SD 4-6', title: 'Splitting the cost of badminton', scenario: 'Six friends rent a badminton court for 2 hours at Rp60,000 per hour. They use 6 shuttlecocks. A tube of 12 shuttlecocks costs Rp84,000.', art: '🧑‍🦱🏸', topics: ['bilangan'], units: ['4E', '4F', '4P'],
      steps: [
        { type: 'number', question: 'What is the court rental cost?', unit: 'rupiah', vis: court(), answer: 2 * 60000, hint: '2 hours at Rp60,000 per hour.', explanation: '2 × 60,000 = 120,000 rupiah.' },
        { type: 'number', question: 'What is the price of one shuttlecock?', unit: 'rupiah', vis: receipt('One tube of shuttlecocks', [['Contains', '12 shuttlecocks'], ['Price', rp(84000)]]), answer: 84000 / 12, hint: 'Divide the tube\'s price by the number inside.', explanation: '84,000 ÷ 12 = 7,000 rupiah.' },
        { type: 'number', question: 'What is the price of the 6 shuttlecocks used?', unit: 'rupiah', answer: 6 * 7000, hint: '6 times the price of one shuttlecock.', explanation: '6 × 7,000 = 42,000 rupiah.' },
        { type: 'number', question: 'What is the total cost?', unit: 'rupiah', vis: receipt('Cost of playing', [['Court rental', rp(120000)], ['6 shuttlecocks', rp(42000)]]), done: receipt('Cost of playing', [['Court rental', rp(120000)], ['6 shuttlecocks', rp(42000)]], rp(162000)), answer: 120000 + 42000, hint: 'Add the court rental and the shuttlecock price.', explanation: '120,000 + 42,000 = 162,000 rupiah.' },
        { type: 'number', question: 'The cost is split equally among 6 people. How much does each person pay?', unit: 'rupiah', vis: split(rp(162000), 6, '🧑🧑‍🦱👩👨👧🧔'), done: split(rp(162000), 6, '🧑🧑‍🦱👩👨👧🧔', rp(27000)), answer: 162000 / 6, hint: 'Divide the total cost by 6.', explanation: '162,000 ÷ 6 = 27,000 rupiah per person.' },
      ], wrapUp: 'The split is fair and no one loses out.', nextMath: ['Sharing costs by playing time (middle school)', 'Match statistics (high school)'] },
    { id: 'sport-fair-split', key: 'spoSMP', profession: 'olahraga', level: 'SMP', title: 'A fair split by playing time', scenario: 'Andi, Budi, and Citra play for 2 hours. Dedi and Eka play for only 1 hour. The court rental is Rp160,000. The cost is split by playing time.', art: '🧑‍🦱🏸', topics: ['bilangan', 'aljabar'], units: ['7D', '5I'],
      steps: [
        { type: 'number', question: 'What is everyone\'s total playing time in hours?', unit: 'jam', vis: bars([['Andi', 2], ['Budi', 2], ['Citra', 2], ['Dedi', 1], ['Eka', 1]], { max: 2 }), answer: 3 * 2 + 2 * 1, hint: 'Three people 2 hours, two people 1 hour.', explanation: '3 × 2 + 2 × 1 = 8 hours.' },
        { type: 'number', question: 'What is the rental cost per hour of play?', unit: 'rupiah', answer: 160000 / 8, hint: 'The rental divided by total playing hours.', explanation: '160,000 ÷ 8 = 20,000 rupiah.' },
        { type: 'number', question: 'How much rental does Andi pay?', unit: 'rupiah', answer: 2 * 20000, hint: 'Andi plays for 2 hours.', explanation: '2 × 20,000 = 40,000 rupiah.' },
        { type: 'number', question: 'They use shuttlecocks worth Rp64,000, also split by playing time. What is Dedi\'s share of the shuttlecocks?', unit: 'rupiah', answer: 64000 / 8 * 1, hint: 'Calculate the shuttlecock cost per hour of play first.', explanation: '64,000 ÷ 8 = 8,000 rupiah for Dedi\'s 1 hour of play.' },
        { type: 'number', question: 'What is Andi\'s total payment (rental and shuttlecocks)?', unit: 'rupiah', answer: 40000 + 2 * 8000, hint: 'Andi\'s shuttlecocks for 2 hours of play.', explanation: '40,000 + 16,000 = 56,000 rupiah.' },
      ], wrapUp: 'Splitting by usage is often fairer than splitting equally.', nextMath: ['Match analysis (high school)', 'Systems of equations'] },
    { id: 'sport-analytics', key: 'spoSMA', profession: 'olahraga', level: 'SMA', title: 'Match analysis', scenario: 'A badminton coach uses data to prepare athletes: smash accuracy, probability, speed, and tournament schedules.', art: '🏃📊', topics: ['data', 'aljabar'], units: ['A1G', 'A2H', '8I'],
      steps: [
        { type: 'number', question: 'Of 24 smashes, 18 go in. What is the accuracy percentage?', unit: '%', vis: court(), answer: 18 / 24 * 100, hint: 'Successful divided by all, times 100%.', explanation: '18 : 24 × 100% = 75%.' },
        { type: 'number', question: 'The chance of winning one rally is 0.6. What\'s the chance of winning two rallies in a row?', answer: 0.6 * 0.6, tol: 0.001, hint: 'Independent events: multiply the probabilities.', explanation: '0,6 × 0,6 = 0,36.' },
        { type: 'number', question: 'A runner covers 100 m in 12.5 seconds. What is the speed (m/second)?', unit: 'm/detik', answer: 100 / 12.5, hint: 'Distance divided by time.', explanation: '100 ÷ 12.5 = 8 m/second.' },
        { type: 'number', question: 'A ball\'s height is h(t) = −5t² + 10t + 2 meters. What is its maximum height?', unit: 'meters', answer: -5 + 10 + 2, hint: 'The vertex is at t = −b/(2a) = 1.', explanation: 'At t = 1: −5 + 10 + 2 = 7 meters.' },
        { type: 'number', question: 'Eight teams each play each other once. How many matches are there?', unit: 'matches', answer: 8 * 7 / 2, hint: 'Choose 2 teams from 8.', explanation: 'C(8, 2) = 8 × 7 ÷ 2 = 28 matches.' },
      ], wrapUp: 'You used math like a sports analyst.', nextMath: ['Probability distributions', 'Calculus for motion'] },

    /* ---------- Keuangan keluarga ---------- */
    { id: 'family-piggy-tk', key: 'kelTK', profession: 'keluarga', level: 'TK', audio: true, title: 'Piggy banks and needs', scenario: 'Dad teaches an older sibling to save in a piggy bank and to tell needs from wants.', art: '👨‍👧🐖', topics: ['bilangan'], units: ['TBL', 'TBF'],
      steps: [
        { type: 'choice', question: 'The older sibling has three coins, then saves two more. How many coins are there now?', vis: row(['🪙', '🪙', '🪙', '➕', '🪙', '🪙']), options: ['4', '5', '6'], answer: '5', hint: 'Count all the coins.', explanation: 'Three and two make five coins.' },
        { type: 'drag', mode: 'sort', question: 'Which are needs and which are wants?', bins: [{ id: 'a', label: '🍚 Need' }, { id: 'b', label: '🧸 Want' }], items: [{ id: '1', html: '🍚', bin: 'a' }, { id: '2', html: '🧸', bin: 'b' }, { id: '3', html: '💧', bin: 'a' }, { id: '4', html: '🍭', bin: 'b' }], hint: 'We need rice and water every day.', explanation: 'Rice and water are needs. Dolls and candy are only wants.' },
      ], wrapUp: 'Smart! You know what should come first.', nextMath: ['Pocket money (Grades 1–3)', 'Family budget (Grades 4–6)'] },
    { id: 'family-pocket-money', key: 'kel13', profession: 'keluarga', level: 'SD 1-3', title: 'Pocket money and savings', scenario: 'Rani gets Rp5,000 of pocket money each school day, 5 days a week. Every day she saves Rp2,000. Rani wants to buy a book costing Rp30,000.', art: '👧🐖', topics: ['bilangan'], units: ['3P', '2G', '2H'],
      steps: [
        { type: 'number', question: 'How much pocket money does Rani get in a week?', unit: 'rupiah', answer: 5 * 5000, hint: '5 days times Rp5,000.', explanation: '5 × 5,000 = 25,000 rupiah.' },
        { type: 'number', question: 'How much does Rani save in a week?', unit: 'rupiah', vis: jars([['Saved', 40, '#1fbf9f', '🐖'], ['Spent', 60, '#f5a524', '🍱']]), answer: 5 * 2000, hint: '5 days times Rp2,000.', explanation: '5 × 2,000 = 10,000 rupiah.' },
        { type: 'number', question: 'How many weeks does Rani save to buy the book?', unit: 'minggu', answer: 30000 / 10000, hint: 'The book\'s price divided by weekly savings.', explanation: '30,000 ÷ 10,000 = 3 weeks.' },
      ], wrapUp: 'Rani can buy the book with her own savings.', nextMath: ['Percent budgets (Grades 4–6)', 'Saving goals (middle school)'] },
    { id: 'family-monthly-budget', key: 'kel46', profession: 'keluarga', level: 'SD 4-6', title: 'Spending, saving, and charity', scenario: 'A family\'s income is Rp5,000,000 a month. 60% is for needs, 20% is saved, 10% is for charity, and the rest is for fun.', art: '👨‍👩‍👧🏠', topics: ['bilangan', 'data'], units: ['5J', '4P', '6N'],
      steps: [
        { type: 'number', question: 'How many rupiah for needs?', unit: 'rupiah', vis: jars([['Needs', 60, '#2f6fed', '🍚'], ['Savings', 20, '#1fbf9f', '🐖'], ['Charity', 10, '#f5a524', '🤲'], ['Fun', 10, '#e0464b', '🎈']]), answer: 5000000 * 60 / 100, hint: '10% of 5,000,000 is 500,000.', explanation: '60% × 5,000,000 = 3,000,000 rupiah.' },
        { type: 'number', question: 'How many rupiah are saved?', unit: 'rupiah', answer: 5000000 * 20 / 100, hint: '20% is twice 10%.', explanation: '20% × 5,000,000 = 1,000,000 rupiah.' },
        { type: 'number', question: 'How many rupiah for charity?', unit: 'rupiah', answer: 5000000 * 10 / 100, hint: 'Calculate 10%.', explanation: '10% × 5,000,000 = 500,000 rupiah.' },
        { type: 'number', question: 'How much is left for fun?', unit: 'rupiah', answer: 5000000 - 3000000 - 1000000 - 500000, hint: 'Subtract the three parts.', explanation: '5,000,000 − 3,000,000 − 1,000,000 − 500,000 = 500,000 rupiah.' },
        { type: 'number', question: 'If the savings stay the same, how much is saved after 6 months?', unit: 'rupiah', vis: growth([['1', 1], ['2', 2], ['3', 3], ['4', 4], ['5', 5], ['6', 6]], { c: '#1fbf9f', fmt: (v) => `${v} million` }), answer: 6 * 1000000, hint: 'Rp1,000,000 every month.', explanation: '6 × 1,000,000 = 6,000,000 rupiah.' },
      ], wrapUp: 'Families who plan are calmer in facing their needs.', nextMath: ['Saving for goals (middle school)', 'Compound growth (high school)'] },
    { id: 'family-goals-zakat', key: 'kelSMP', profession: 'keluarga', level: 'SMP', title: 'Saving, growing, and zakat', scenario: 'Dad earns Rp8,000,000 a month. The family sets aside 20% for savings and also wants to grow money in a halal way.', art: '👨‍👩‍👦🪙', topics: ['bilangan'], units: ['7D', '6N', '6G'],
      steps: [
        { type: 'number', question: 'How much is saved each month?', unit: 'rupiah', vis: donut([['Savings', 20, '#1fbf9f'], ['Other', 80, '#c9d6d2']], { c: 'Rp8 million' }), answer: 8000000 * 20 / 100, hint: '20% of 8,000,000.', explanation: '20% × 8,000,000 = 1,600,000 rupiah.' },
        { type: 'number', question: 'A school laptop costs Rp9,600,000. How many months of saving?', unit: 'bulan', answer: 9600000 / 1600000, hint: 'The price divided by monthly savings.', explanation: '9,600,000 ÷ 1,600,000 = 6 months.' },
        { type: 'number', question: 'Gold savings of Rp10,000,000 rise 8% in a year. What is the value now?', unit: 'rupiah', vis: growth([['Pre', 10000000], ['One year', 10800000]], { c: '#f5a524', fmt: rp }), answer: 10000000 * 1.08, tol: 1, hint: 'An 8% increase of 10,000,000, then add it.', explanation: '10,000,000 + 800,000 = 10,800,000 rupiah.' },
        { type: 'number', question: 'Wealth of Rp100,000,000 has reached the nisab and haul. What is the 2.5% zakat?', unit: 'rupiah', answer: 100000000 * 2.5 / 100, hint: '1% is 1,000,000.', explanation: '2.5% × 100,000,000 = 2,500,000 rupiah.' },
      ], wrapUp: 'Saving, growing, and paying zakat all use percents.', nextMath: ['Compound growth (high school)', 'Geometric sequences'] },
    { id: 'family-compound', key: 'kelSMA', profession: 'keluarga', level: 'SMA', title: 'Growth and inflation', scenario: 'A family invests Rp10,000,000 in a profit-sharing business that grows an average of 10% per year, and the returns are reinvested.', art: '👩‍👦📈', topics: ['aljabar'], units: ['A1I', 'A2E'],
      simplified: 'The growth figure is kept fixed to make calculation easy. A real business can go up or down.',
      steps: [
        { type: 'number', question: 'What is the value after 2 years?', unit: 'rupiah', vis: growth([['Pre', 10000000], ['1 yr', 11000000], ['2 yrs', 12100000], ['3 yrs', 13310000]], { c: '#d6336c', fmt: (v) => `${(v / 1e6).toFixed(1)} million` }), answer: 10000000 * 1.1 * 1.1, tol: 1, hint: 'Multiply by 1.1 twice.', explanation: '10,000,000 × 1.1 × 1.1 = 12,100,000 rupiah.' },
        { type: 'number', question: 'What is the value after 3 years?', unit: 'rupiah', answer: 12100000 * 1.1, tol: 1, hint: 'Multiply the previous result by 1.1.', explanation: '12,100,000 × 1.1 = 13,310,000 rupiah.' },
        { type: 'number', question: 'Rule of 72: if money grows 8% per year, in about how many years does it double?', unit: 'years', answer: 72 / 8, hint: '72 divided by the growth percent.', explanation: '72 ÷ 8 = 9 years.' },
        { type: 'number', question: 'Inflation is 5%. What will an item costing Rp100,000 cost next year?', unit: 'rupiah', answer: 100000 * 1.05, tol: 1, hint: 'Multiply by 1.05.', explanation: '100,000 × 1.05 = 105,000 rupiah.' },
        { type: 'number', question: 'Rp1,000,000 is deposited at the start of each year for 3 years, with 10% growth. What is the value at the end of year 3?', unit: 'rupiah', answer: 1000000 * (1.1 + 1.21 + 1.331), tol: 1, hint: 'The first deposit grows 3 times, the second 2 times, the third 1 time.', explanation: '1,331,000 + 1,210,000 + 1,100,000 = 3,641,000 rupiah.' },
      ], wrapUp: 'You saw the power of time in growing money.', nextMath: ['Geometric series', 'Logarithms for calculating time'] },

    /* ---------- Kesehatan ---------- */
    { id: 'health-bandage-tk', key: 'medTK', profession: 'kesehatan', level: 'TK', audio: true, title: 'Helping the nurse', scenario: 'The nurse arranges bandages from longest to shortest, then prepares blankets for patients.', art: '👩‍⚕️🩹', topics: ['ukur'], units: ['TAH', 'TAA'],
      steps: [
        { type: 'drag', mode: 'order', question: 'Order them from longest to shortest.', items: [{ id: 'k', html: blk(30, '#ff7a59') }, { id: 'b', html: blk(66, '#4d96ff') }, { id: 's', html: blk(46, '#1fbf9f') }], answer: ['b', 's', 'k'], hint: 'Find the longest first.', explanation: 'Long, medium, then short. Very tidy.' },
        { type: 'choice', question: 'There are three patients. Each patient needs one blanket. How many blankets are needed?', vis: row(['🛏️', '🛏️', '🛏️']), options: ['2', '3', '4'], answer: '3', hint: 'One patient, one blanket.', explanation: 'Three patients need three blankets.' },
      ], wrapUp: 'Thank you for helping the nurse!', nextMath: ['Counting medicine (Grades 1–3)', 'Milliliters (Grades 4–6)'] },
    { id: 'health-tablets', key: 'med13', profession: 'kesehatan', level: 'SD 1-3', title: 'Counting medicine', scenario: 'A patient takes 3 tablets a day for 5 days. One strip holds 10 tablets.', art: '👨‍⚕️💊', topics: ['bilangan'], units: ['2G', '2H'], simplified: MED,
      steps: [
        { type: 'number', question: 'How many tablets are needed?', unit: 'tablets', vis: chips(['💊💊💊', '💊💊💊', '💊💊💊', '💊💊💊', '💊💊💊']), answer: 3 * 5, hint: '3 tablets every day for 5 days.', explanation: '3 × 5 = 15 tablets.' },
        { type: 'number', question: 'How many strips must be prepared?', unit: 'strips', answer: Math.ceil(15 / 10), hint: 'One strip isn\'t enough for 15 tablets.', explanation: '2 strips are needed because one strip only has 10 tablets.' },
        { type: 'number', question: 'How many tablets are left?', unit: 'tablets', answer: 20 - 15, hint: 'Two strips hold 20 tablets.', explanation: '20 − 15 = 5 tablets.' },
      ], wrapUp: 'There\'s exactly enough medicine for the whole treatment.', nextMath: ['Milliliters (Grades 4–6)', 'Dose by body weight (middle school)'] },
    { id: 'health-syrup', key: 'med46', profession: 'kesehatan', level: 'SD 4-6', title: 'Syrup and body temperature', scenario: 'A child is given 5 ml of syrup 3 times a day for 4 days. The bottle holds 100 ml. The nurse also records body temperature.', art: '👩‍⚕️🌡️', topics: ['ukur', 'data'], units: ['4F', '5N'], simplified: MED,
      steps: [
        { type: 'number', question: 'How many ml of syrup are taken in a day?', unit: 'ml', vis: dose(5, 20, 'ml', 'each dose'), done: dose(15, 20, 'ml', 'per day'), answer: 5 * 3, hint: '5 ml, 3 times.', explanation: '5 × 3 = 15 ml.' },
        { type: 'number', question: 'How many ml for 4 days?', unit: 'ml', answer: 15 * 4, hint: '15 ml every day.', explanation: '15 × 4 = 60 ml.' },
        { type: 'number', question: 'How many ml of syrup are left in the bottle?', unit: 'ml', answer: 100 - 60, hint: 'The bottle\'s contents minus what was taken.', explanation: '100 − 60 = 40 ml.' },
        { type: 'number', question: 'Body temperature is 37 in the morning, 38 at midday, and 39 degrees at night. What\'s the average?', unit: '°C', vis: growth([['Morning', 37], ['Midday', 38], ['Night', 39]], { c: '#0b9aa8' }), answer: (37 + 38 + 39) / 3, hint: 'Add them, then divide by 3.', explanation: '114 ÷ 3 = 38 degrees.' },
      ], wrapUp: 'Nurses calculate carefully to protect patients.', nextMath: ['Dose by body weight (middle school)', 'Half-life (high school)'] },
    { id: 'health-dosage-infusion', key: 'medSMP', profession: 'kesehatan', level: 'SMP', title: 'Doses and infusions', scenario: 'A child weighing 24 kg needs medicine at 10 mg per kg of body weight. The syrup contains 120 mg in every 5 ml.', art: '👨‍⚕️💉', topics: ['bilangan', 'ukur'], units: ['7D', '6F'], simplified: MED,
      steps: [
        { type: 'number', question: 'How many mg of medicine are needed?', unit: 'mg', answer: 24 * 10, hint: 'Body weight times 10 mg.', explanation: '24 × 10 = 240 mg.' },
        { type: 'number', question: 'How many ml of syrup are given?', unit: 'ml', vis: dose(10, 20, 'ml'), answer: 240 / 120 * 5, hint: '240 mg is how many times 120 mg?', explanation: '240 ÷ 120 × 5 = 10 ml.' },
        { type: 'number', question: 'A 500 ml infusion is given over 5 hours. How many ml per hour?', unit: 'ml/jam', answer: 500 / 5, hint: 'Volume divided by time.', explanation: '500 ÷ 5 = 100 ml/hour.' },
        { type: 'number', question: 'What is the body mass index of a person weighing 60 kg and 1.6 m tall? (1 decimal)', answer: 60 / (1.6 * 1.6), tol: 0.05, hint: 'Weight divided by height squared.', explanation: '60 : 2,56 ≈ 23,4.' },
      ], wrapUp: 'The right ratios keep patients safe.', nextMath: ['Half-life (high school)', 'Medical test probability (high school)'] },
    { id: 'health-halflife-test', key: 'medSMA', profession: 'kesehatan', level: 'SMA', title: 'Half-life and test results', scenario: 'A 400 mg dose of medicine in the body halves every 6 hours. The hospital also assesses how trustworthy a test is.', art: '👩‍⚕️🧪', topics: ['aljabar', 'data'], units: ['A1I', '8I'], simplified: MED,
      steps: [
        { type: 'number', question: 'How many mg of medicine remain after 12 hours?', unit: 'mg', vis: growth([['0 j', 400], ['6 j', 200], ['12 j', 100], ['18 j', 50], ['24 j', 25]], { c: '#0b9aa8' }), answer: 400 / 2 / 2, hint: '12 hours means two half-lives.', explanation: '400 → 200 → 100 mg.' },
        { type: 'number', question: 'How many mg after 24 hours?', unit: 'mg', answer: 400 / 2 ** 4, hint: '24 hours means 4 half-lives.', explanation: '400 ÷ 2⁴ = 25 mg.' },
        { type: 'number', question: 'Of 1,000 people, 1% are sick. How many people are sick?', unit: 'orang', answer: 1000 * 1 / 100, hint: '1% of 1,000.', explanation: '1% × 1,000 = 10 people.' },
        { type: 'number', question: 'The test detects 90% of sick people. How many sick people test positive?', unit: 'orang', answer: 10 * 90 / 100, hint: '90% of 10.', explanation: '90% × 10 = 9 people.' },
        { type: 'number', question: 'The test is falsely positive for 10% of healthy people. How many healthy people test positive?', unit: 'orang', answer: 990 * 10 / 100, hint: 'There are 990 healthy people.', explanation: '10% × 990 = 99 people.' },
        { type: 'number', question: 'What percent of people testing positive are really sick? (1 decimal)', unit: '%', vis: bars([['Really sick', 9, '#e0464b'], ['Actually healthy', 99, '#0b9aa8']]), answer: 9 / 108 * 100, tol: 0.06, hint: 'Sick and positive, divided by all positives.', explanation: '9 ÷ 108 × 100% ≈ 8.3%. That\'s why doctors often order a second test.' },
      ], wrapUp: 'You understand why test results need to be read with probability.', nextMath: ['Exponential functions', 'Conditional probability'] }
  );
})();
