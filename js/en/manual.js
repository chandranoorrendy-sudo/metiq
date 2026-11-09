/* Dibuat otomatis oleh tools/i18n/build.js; jangan disunting. */
/* Metiq — Panduan pemakaian untuk guru, orang tua, dan siswa.
 * Setiap bagian: judul, ikon, langkah-langkah, dan catatan tips (opsional).
 */
(function () {
  window.METIQ_MANUAL = {
    guru: {
      title: 'Guide for Teachers',
      intro: 'Metiq helps you give math practice, assign tasks, and monitor each student\'s progress from your phone.',
      sections: [
        { icon: '🔑', t: 'Signing up and logging in', steps: [
          'Open Metiq, then tap <b>I\'m a teacher</b>.',
          'First time: tap <b>No account yet? Sign up</b>. Fill in your name (for example "Ustadzah Diana"), email, password (at least 6 characters), and class name.',
          'School admins also fill in the <b>Admin code</b> given by the Metiq manager. Regular teachers leave it blank.',
          'After that, just log in with your email and password.',
        ], tip: 'Five wrong passwords lock the account for 15 minutes for security.' },
        { icon: '🏫', t: 'Setting up classes and students', steps: [
          'Open the <b>🧒 Students</b> tab, tap <b>➕ Add students</b>, then type the student names. For several students, separate them with commas.',
          'Tap <b>📤 Send code</b> to share the class code with your WhatsApp group. Students open Metiq, tap <b>I\'m a Student</b>, enter the code, then choose their name.',
          'Students who already have their own Metiq account are added with a <b>learning code</b> (at the bottom of the Add students box).',
          'Each student has a <b>parent code</b>. Send it with the <b>📤 Parent</b> button in the student list, or tap <b>🖨️ Print code cards</b>.',
          'Class name, new classes, and class settings are under the <b>⚙️ Class</b> button.',
        ], tip: 'Start from the 🏠 Today tab: Metiq writes the next step, with its button.' },
        { icon: '📲', t: 'Sharing access with students and parents', steps: [
          'Share the same Metiq link with all students and parents.',
          '<b>Students:</b> I\'m a student → enter the class code → tap their name.',
          '<b>Parents:</b> I\'m a parent → enter their child\'s parent code, or create an account and add their child with that code.',
          'Printed code cards can be handed out at parent meetings or photographed and sent via WhatsApp.',
        ], tip: 'Parent codes are private. Give them only to the parents of that student.' },
        { icon: '📌', t: 'Assigning tasks', steps: [
          'Open the <b>📌 Tasks</b> tab. <b>💡 Metiq suggestions</b> lists the topics students need most. Tap <b>Send</b>, done.',
          'Want to choose yourself? Tap <b>➕ Create your own task</b> and follow 3 steps: pick topics, pick who it is for, write a message if needed.',
          'The task appears on the student\'s learning page, and the parent\'s 🔔 bell lights up.',
          '<b>Tasks in progress</b> shows how many students have finished and who has not.',
        ], tip: 'For one student: on 🏠 Today, tap <b>Give practice</b> next to their name. That student immediately gets practice on the topic they find hard.' },
        { icon: '🔔', t: 'Task completion notifications', steps: [
          'A task counts as done when all its skills reach the <b>Proficient</b> level (SmartScore 80 or more), or when a parent taps <b>Report as done</b>.',
          'The bell 🔔 at the top right of the dashboard then shows a number. Tap it to see who has finished.',
          'The <b>Tasks</b> tab also shows how many students have finished and the names of those who have not.',
        ] },
        { icon: '📊', t: 'Monitoring progress', steps: [
          '<b>🏠 Today:</b> how many students practiced, at most three things to do, students who need help, a topic worth reviewing together, and stars of the week.',
          '<b>🧒 Students:</b> students are grouped into Needs help, Not started, No practice, and Good. Tap a name to see what they can do and what they need help with.',
          '<b>📌 Tasks:</b> task suggestions and who has finished them.',
        ], tip: 'Sample wrong answers and error patterns appear automatically on each student\'s page.' },
        { icon: '📈', t: 'Understanding SmartScore', steps: [
          'Each skill has a score from 0–100. The score rises quickly at first and more slowly near 100; wrong answers lower it.',
          '<b>Starting</b> 1–49 · <b>Developing</b> 50–79 · <b>Proficient</b> 80–99 · <b>Complete</b> 100 🏆.',
          'Students must answer correctly and consistently to complete a skill, so a high score shows understanding, not guessing.',
        ] },
        { icon: '📚', t: 'Curriculum, lessons, and references', steps: [
          'Metiq covers Pre-K through Calculus, with skills built from IXL and Singapore Math and mapped to Indonesia\'s Kurikulum Merdeka.',
          'Each chapter has a <b>Lesson</b> with steps, Singapore method notes, and sample questions that can be swapped.',
          '<b>⚙️ Class → 📚 Curriculum reference</b> explains the curriculum sources, Singapore Math methods, a map of each chapter, and the list of error patterns.',
        ] },
        { icon: '🌐', t: 'Super admins and school admins', steps: [
          '<b>Teachers sign up free</b> (I\'m a teacher → Sign up free) and are active right away with their first class. No approval needed.',
          '<b>School admins</b> add teachers to their school under <b>🏫 School → 🧑‍🏫 Manage teachers</b> using the teacher\'s email. That teacher\'s classes and students then appear on the school dashboard. This feature and the school dashboard are part of the <b>School plan</b> (see the Pricing page).',
          '<b>Super admins</b> (Metiq managers) see all schools and homeschool families in the <b>🌐 Super admin</b> tab, activate the School plan after payment (🏫 School → 💳 School plan), read quote requests in <b>📨 Quotes</b>, and approve parent or student requests.',
          'In <b>✋ Requests</b>: check the requester\'s details, choose their school (or create a new one) for teachers, choose a class for students, then tap <b>Approve</b> or <b>Reject</b>. Class codes and parent codes appear in the history and can be sent via WhatsApp.',
          'In <b>📚 Classes</b>, the super admin chooses a teacher for each class (for example Class 2B is taught by Ustadz A). That teacher must already have an active account.',
          'Students who started learning on their own appear in the <b>🧺 No class</b> tab (with a count on the tab), along with their activity: last active, questions this week, accuracy, and current chapter. Filter with the <b>Active</b>, <b>Paused</b>, <b>Inactive</b>, or <b>Not started</b> pills, tap <b>View report</b> for progress by chapter and latest answers, then add the child to a suitable class.',
          'Change a class name in <b>⚙️ Class → Rename</b>. Delete a class with the <b>🗑️ Delete</b> button in ⚙️ Class or 📚 Classes; type the class name to confirm. Students and all their data are deleted too.',
          'The <b>🔬 Research</b> tab holds analytics, the pre/post assessment, and research data. Only super admins can see it.',
          '<b>School admins</b> (coordinators) see all classes in their school in the <b>🏫 School</b> tab. Super admins can make a teacher a school admin in <b>👩‍🏫 Teachers</b>.',
        ] },
        { icon: '🛡️', t: 'Admin only', steps: [
          'Admin accounts see and manage <b>all classes</b> from all teachers.',
          'Choose a class with the selection box under the class name; the owning teacher\'s name is shown too.',
        ] },
        { icon: '🧭', t: 'Student pre-assessment', steps: [
          'Each student does the pre-assessment once, the first time they log in: choosing their age, then 8–15 adaptive questions from key skills.',
          'Results are in the <b>Students</b> tab → student name → <b>More</b>: the grade where the student should learn and the skills they need to learn.',
          'Answer time is used too: all correct and fast → the assessment jumps 2 grades; correct but slow → marked 🐢 needs fluency; wrong in under 3 seconds → ⚠️ may be guessing.',
          'Only super admins can run the final assessment or repeat the starting assessment, so the original data is not overwritten.',
        ] },
        { icon: '🪪', t: 'NISN and BBO Digital', steps: [
          'Open the <b>Students</b> tab → tap the student\'s name → <b>More</b> → <b>🪪 Student data</b>, then enter the <b>NISN</b> (10 digits) and tap Save NISN.',
          'Each time a student with a NISN finishes a task, the report (task, skills, and SmartScore) is automatically sent to <b>BBO Digital</b> for that student.',
          'Sending status is shown in the same section: ✅ Accepted by BBO, ⏳ Sending, or ⚠️ Failed to send.',
        ] },
        { icon: '🏫', t: 'School dashboard (school admins)', steps: [
          'The <b>🏫 School</b> tab appears only for school admins and shows the last 30 days.',
          '<b>Class status:</b> each class is marked 🟢 good, 🟡 keep watching, or 🔴 needs attention, with how many students practiced and how many need help. Tap a class to open it.',
          '<b>Hard topics:</b> chapters least understood across the school, then details per class.',
          '<b>Manage teachers:</b> add teachers by email.',
          'Teachers simply use Metiq in their own classes. The data flows into the school dashboard automatically, so no separate reports are needed.',
        ] },
      ],
    },
    ortu: {
      title: 'Guide for Parents',
      intro: 'With Metiq, you can see your child\'s math learning progress, know which parts need practice, and receive task updates from the teacher.',
      sections: [
        { icon: '🔑', t: 'Two ways to log in', steps: [
          '<b>With a parent code</b> (quick): I\'m a parent → enter the 6-letter/digit code from the teacher → the child\'s report appears right away.',
          '<b>With an account</b> (recommended): I\'m a parent → <b>Sign up</b> → fill in your name, email, and password. An account can hold several children, receive task notifications, and be used to learn together with your child.',
        ] },
        { icon: '👨‍👩‍👧', t: 'Adding a child to your account', steps: [
          'After logging in, open the <b>Add a child</b> section.',
          'Enter the child\'s parent code from the teacher, then tap <b>Add</b>.',
          'Repeat for each child. Each child appears as a card with a learning summary.',
        ] },
        { icon: '📄', t: 'Reading your child\'s report', steps: [
          'Tap <b>View report</b> on the child\'s card.',
          'The top shows <b>this week\'s conclusion</b> in one sentence, with a ✓ for each day your child practiced.',
          '<b>📌 Tasks from the teacher:</b> tasks not yet finished.',
          '<b>🏠 Help at home:</b> topics still hard, a sample wrong answer, and practice tips. Tap <b>📖 Learn together</b> for a short lesson to read with your child.',
          '<b>✅ Can already do:</b> topics already mastered. Tap <b>See details</b> for progress by chapter and incorrect answers.',
        ] },
        { icon: '🔔', t: 'Task notifications from the teacher', steps: [
          'When the teacher gives a task, the bell 🔔 at the top right shows a number.',
          'Tap the bell to see the task, its due date, and which skills your child has mastered (✅).',
          'Tap <b>Do it as [child\'s name]</b> to open your child\'s practice on your phone.',
          'After your child has done it, tap <b>Report as done</b>. The teacher will be notified.',
          'After the task is finished, give <b>stars ⭐ and a comment</b> about it. Your review helps the school improve tasks.',
        ], tip: 'Tasks are also marked done automatically if your child is Proficient in all the task\'s skills.' },
        { icon: '🧒', t: 'Learning together with your child', steps: [
          'On the child\'s card, tap <b>Learn as [child\'s name]</b>. Practice results are recorded in your child\'s name.',
          'Tap <b>← Parent account</b> at the top right to return to your account.',
        ] },
        { icon: '💡', t: 'Tips for supporting your child', steps: [
          'Just <b>10–15 minutes a day</b>; regular practice beats long sessions.',
          'Let your child try first. If wrong, read the <b>How to solve it</b> section together.',
          'For younger children, tap 🔊 to have questions read aloud.',
          'Use real objects at home (buttons, coins, spoons) as suggested in the report.',
          'Praise effort, not just scores. A score dropping a little after a mistake is normal.',
        ] },
      ],
    },
    siswa: {
      title: 'Guide for Students',
      intro: 'Hello! Here\'s how to learn math with Metiq. Let\'s go! 🚀',
      sections: [
        { icon: '👋', t: 'Log in', steps: [
          'Tap <b>I\'m a student</b>.',
          'Type the <b>class code</b> from your teacher, then tap <b>Log in</b>.',
          'Tap <b>your name</b>.',
        ] },
        { icon: '📚', t: 'Choosing practice', steps: [
          'Choose your grade at the top: <b>Grade 1, Grade 2, …</b>',
          'Tap a chapter, then tap the skill you want to practice.',
          'If there\'s a <b>📌 Task from your teacher</b>, do that first!',
          'After doing at least 5 questions in each task skill, tap <b>✅ Turn in</b>. Your teacher is notified right away with your score.',
        ] },
        { icon: '🧭', t: 'Pre-assessment', steps: [
          'The first time you log in, you\'ll be asked to do a <b>pre-assessment</b>. Just once.',
          'Choose your age, then answer about 8–15 questions. Questions get easier or harder based on your answers. If all are correct and fast, questions jump higher. If you don\'t know, just guess.',
          'The results show which grade\'s material you should study and which skills to learn. That list appears in the <b>✨ Suggestions</b> tab.',
        ] },
        { icon: '🤔', t: 'What do you want to learn?', steps: [
          '<b>📌 From your teacher</b>: tasks from your teacher. A red number = unfinished tasks.',
          '<b>🕘 Recent</b>: the skills you last practiced, so they\'re easy to continue.',
          '<b>✨ Suggestions</b>: recommendations for you: review what\'s hard, continue, or new skills.',
          '<b>📈 How am I doing?</b> shows your questions, learning time, and growing skills this week. Tap <b>See my report</b> for the full report.',
        ] },
        { icon: '⭐', t: 'Reviewing tasks', steps: [
          'After a task from your teacher is finished (✅ Done), you\'ll see <b>"What did you think of this task?"</b>.',
          'Tap the stars (1 to 5), write your opinion if you like, then tap <b>Send review</b>.',
        ] },
        { icon: '🎮', t: 'Games and stars', steps: [
          'Tap <b>🎮 Math games</b> on the home page. Choose your grade, then choose a game.',
          '<b>⚡ Blitz</b>: answer as many as you can in 60 seconds. <b>🎈 Balloons</b>: tap the balloons matching the instruction. <b>🃏 Pairs</b>: match question cards with their answers.',
          '<b>🧱 Tower of Pairs</b>: tap a column to drop a block; two touching blocks adding up to the target disappear. <b>🔢 Twin Tower</b>: blocks 2, 4, 8 … keep falling faster. Slide onto a matching block (tap a column or ◀ ▶, then ▼ to drop) to merge into double. If the stack enters the top red row, the game ends!',
          '<b>🪢 Tug of War</b> (a class game, great for large touch screens): Red Team on the left and Blue Team on the right answer questions at the same time. A correct answer pulls the rope toward that team; a wrong answer locks that team\'s buttons for a moment. The team that pulls the flag to its line wins, or the team ahead when the 90 seconds run out.',
          'Fact practice (addition and subtraction to 20, multiplication, division) comes in patterns: one number at a time <b>🔢 in order</b> (6 × 1, 6 × 2, …), then <b>🔀 mixed</b>, then <b>🧩 other forms</b> like 6 × ? = 42 or 6, 12, 18, ?. Then on to the next number. In middle and high school the same pattern applies to procedural practice: factoring, limits, derivatives, integrals, and more.',
          '<b>🏅 Olympiad</b> (from the Play page): non-routine problems for elementary, middle, and high school, divided into Algebra, Number Theory, Geometry, and Combinatorics, levels 1 to 3. Each problem has a Hint and Solution, plus a Simulation of 15 problems in 60 minutes. Most comfortable on a tablet or computer because of the large scratch paper.',
          '<b>🗒️ Fact Sheets</b> (Kindergarten to Grade 4): choose a sheet, for example Subtract 4 or Times 6. Part A is in order (6 × 1, 6 × 2, … read while writing), part B has the same questions shuffled, part C shows other forms of the same facts (skip patterns, repeated addition, or missing numbers). Tap Check, fix the red ones until all are correct. Stars come from the percent correct on the first check.',
          '<b>🧗 Greased Pole</b> (a whole-class game on a big screen): the question appears large, the children answer together, then one child comes up and taps the answer. Correct moves up one level, wrong slides down one level. No time limit; the class tries to beat its own record. The ⛶ button makes the game fill the screen.',
          '<b>💼 Careers</b> (bottom menu): math missions from real jobs and life, now in 12 fields. Examples include dividing a business budget, splitting the cost of a badminton court, managing family money, and programming logic. Children follow a step trail to the finish flag, and graphics move with each question. Dosage problems are arithmetic practice only, not medical guidance.',
          '<b>🧩 Sudoku</b>: fill the empty boxes so that every row, column, and thick box has each number exactly once. Pre-K uses fruit pictures (4 × 4), Grades 1–2 numbers 4 × 4, Grades 3–6 6 × 6, middle and high school 9 × 9. Wrong entries turn red.',
          '<b>📊 Bar Model</b>: read the story, set the bar lengths with − and + to match it, then choose the answer. <b>⚖️ Balance Scale</b>: change the value of □ or x until left is as heavy as right. <b>🗺️ Coordinate Treasure</b>: tap the point for the coordinates, or read the treasure\'s coordinates.',
          '<b>🧱 Number Builder</b>: tap thousands, hundreds, tens, and ones blocks to build the target number. <b>🔺 Shape Hunt</b>: tap all the shapes asked for; from Grade 5 it becomes <b>Cube Nets</b>. <b>📏 Measure and Read</b>: read a ruler, measuring cup, scale, thermometer, or protractor. <b>Guess the Angle</b> (middle and high school): the closer your guess, the more points.',
          '<b>📈 Graph Reading</b>: read pictographs, bar, line, or pie charts, then answer the question. <b>🔁 Patterns and Sequences</b>: find the rule, then fill in what\'s missing. All these games have 10 questions and no time limit.',
          'Each round gives up to <b>3 stars ⭐</b>. Your stars are saved and visible to your teacher and parents.',
        ] },
        { icon: '🎁', t: 'Rewards board', steps: [
          'Each grade has a board with 36 boxes. Behind each box is a reward!',
          'Tap a box to see its challenge, for example "Answer 50 questions" or "Reach a score of 80 in 3 skills".',
          'When the challenge is reached, the box opens by itself. How many rewards can you collect?',
        ] },
        { icon: '✏️', t: 'Answering questions', steps: [
          'Read the question. Tap 🔊 if you want it read aloud.',
          'Tap the correct answer, or type a number with the number keys, then tap <b>Check</b>.',
          'Correct? Great! 🎉 The next question appears by itself.',
          'Not quite? That\'s okay. Read <b>How to solve it</b>, then tap <b>Next</b>.',
        ] },
        { icon: '⭐', t: 'SmartScore', steps: [
          'The number at the top is your <b>SmartScore</b>, from 0 to 100.',
          'Score <b>80</b>: you\'re <b>Proficient</b> ⭐.',
          'Score <b>100</b>: you\'ve <b>Completed</b> it 🏆. Amazing!',
        ] },
        { icon: '📖', t: 'Lessons', steps: [
          'Tap 📖 to read the chapter\'s lesson.',
          'There are steps and sample questions. Tap <b>See how to solve it</b> to see the answer.',
          'Above the lesson is a short <b>🎬 Animation</b> that plays by itself. Tap ⏸ to stop, ↻ to replay, or the dots below to choose a step.',
          'If your answer isn\'t correct during practice, tap <b>🎬 Watch the animation</b> in the How to solve it section.',
        ] },
        { icon: '🎨', t: 'Avatars and sound', steps: [
          'Tap your avatar (with the ✏️) to choose a new one: animals, plants, shapes, and more.',
          'Tap 🔔 on the practice screen to turn sound off or on.',
        ] },
      ],
    },
    faq: [
      ['How do I get a Metiq account?', 'Teachers and homeschool families: tap I\'m a teacher → Sign up free, and the account is active right away. Schools with many classes: open the Pricing page and fill out the School plan quote form.'],
      ['What\'s the difference between the Teacher (free) and School plans?', 'Teachers get all practice and class tools for free: classes, tasks, and the class dashboard. The School plan adds a school dashboard, school admins managing teachers, and training.'],
      ['How do I try Metiq without signing up?', 'On the home page, tap Try as a student, parent, or teacher (or enter the code 1234 on the student or parent page), then write a name. Demo mode uses sample data from one school on that device. Several children (siblings) can try on the same phone with their own names, and a parent on that phone can see all their children\'s results on the My children page. Tap Log out to go back.'],
      ['How do I use Metiq with real students?', 'Teachers sign up free (I\'m a teacher → Sign up a new teacher), add students in the Students tab (with a learning code or name), then share the class code with students and the parent code with parents. Real class data is stored on the server and connected on any phone.'],
      ['Forgot a class code or parent code?', 'Ask the teacher. Teachers can see all codes in the Students tab.'],
      ['Is data lost if I change phones?', 'No. Data is stored on the server. Just log in again on another phone.'],
      ['What if the internet drops during practice?', 'Answers stay saved on the phone and are sent automatically when the internet returns.'],
      ['Still seeing an old version?', 'Pull the screen down to reload the page.'],
      ['How do I install Metiq like an app?', 'Samsung Internet: tap the menu icon ☰ at the bottom right → Add page to → Home screen → Add. Chrome: tap ⋮ at the top right → Add to Home screen. iPhone: tap Share ⬆ → Add to Home Screen. The Metiq icon will appear on your phone. An illustrated guide is on the Metiq home page (📲 Add Metiq to your home screen).'],
    ],
  };
})();
