const mongoose = require('mongoose');
const FAQ = require('./models/FAQ');
require('dotenv').config();

const defaultFAQs = [
  {
    question: 'How do I reset my university ERP portal password?',
    answer: 'Go to the ERP login page and click "Forgot Password". Enter your registered email address and you will receive a reset link within a few minutes. If the email doesn\'t arrive, check your spam folder or contact your IT helpdesk with your student ID.',
    category: 'Academic'
  },
  {
    question: 'How do I check my attendance percentage?',
    answer: 'Log in to the ERP portal and navigate to Student → Attendance → View Attendance. Your attendance percentage is displayed subject-wise. You need a minimum of 75% attendance to be eligible for examinations.',
    category: 'Attendance'
  },
  {
    question: 'What happens if my attendance falls below 75%?',
    answer: 'Students with attendance below 75% may be detained from sitting for final examinations. You should immediately meet your faculty advisor or department head to discuss your situation. Medical certificates or other valid reasons may be considered on a case-by-case basis.',
    category: 'Attendance'
  },
  {
    question: 'How do I download my admit card for exams?',
    answer: 'Log in to the ERP portal → Examination → Admit Card. Select the current semester and click "Generate Admit Card". Make sure you have no dues or pending fees — unpaid dues may block admit card generation. Download and print the PDF.',
    category: 'Examination'
  },
  {
    question: 'When are exam results typically announced?',
    answer: 'Results are usually announced 4–6 weeks after the last examination date. You will receive a notification on your registered email. Results can be viewed on the ERP portal under Examination → Results. Contact the examination office if your result is not visible after 6 weeks.',
    category: 'Examination'
  },
  {
    question: 'How do I apply for examination re-evaluation?',
    answer: 'After results are declared, navigate to ERP → Examination → Re-evaluation Request. Fill in the subject details and pay the prescribed fee online. Re-evaluation requests must be submitted within 15 days of the result announcement. The revised result (if any) is published within 30 days.',
    category: 'Examination'
  },
  {
    question: 'How do I set up Node.js on my local machine?',
    answer: 'Download the LTS version of Node.js from nodejs.org. Run the installer and follow the prompts. Verify installation by opening a terminal and running: node --version and npm --version. Both should print version numbers. For version management, consider using nvm (Node Version Manager).',
    category: 'Technical'
  },
  {
    question: 'What is the difference between == and === in JavaScript?',
    answer: '== (loose equality) compares values after type coercion. For example, "5" == 5 is true because the string is converted to a number before comparison. === (strict equality) checks both value AND type — no coercion occurs. "5" === 5 is false. Always prefer === to avoid unexpected bugs from implicit type conversion.',
    category: 'Technical'
  },
  {
    question: 'How do I fix a CORS error in my Express.js backend?',
    answer: 'Install the cors package: npm install cors. Then add it to your Express app before your routes: const cors = require("cors"); app.use(cors()); For production, restrict to specific origins: app.use(cors({ origin: "https://yourdomain.com" })). CORS errors happen because browsers block cross-origin requests by default.',
    category: 'Technical'
  },
  {
    question: 'What is the difference between let, const, and var in JavaScript?',
    answer: 'var is function-scoped and hoisted — avoid it in modern code. let is block-scoped and can be reassigned. const is block-scoped and cannot be reassigned (but objects/arrays it points to can still be mutated). Best practice: use const by default, use let when you need to reassign, and avoid var entirely.',
    category: 'Technical'
  },
  {
    question: 'How do I register for campus placement drives?',
    answer: 'Log in to the Training & Placement portal (or ERP → Placements). Check the eligibility criteria for each company (CGPA, backlogs, branch). Click "Register" before the deadline. Make sure your resume is uploaded and your profile is 100% complete. You will receive shortlisting notifications on your registered email.',
    category: 'Placement'
  },
  {
    question: 'What CGPA is required for most campus placements?',
    answer: 'Most top-tier companies require a minimum CGPA of 7.0 or above with no active backlogs. Some companies set the bar at 6.5 or even 6.0. Government and PSU jobs via campus may require 60% (6.0 CGPA). Always check the specific eligibility criteria posted for each company drive.',
    category: 'Placement'
  },
  {
    question: 'How do I write a strong resume for campus placements?',
    answer: 'Keep it to one page. Start with a brief objective statement. List education with CGPA, relevant projects with tech stack and impact, internships, and skills. Highlight GitHub links, certifications, and competitive programming profiles. Use action verbs (built, developed, optimized). Avoid typos — always proofread. Use a clean, ATS-friendly format (no tables or columns).',
    category: 'Resume'
  },
  {
    question: 'How do I prepare for technical interviews?',
    answer: 'Focus on Data Structures & Algorithms (arrays, linked lists, trees, graphs, dynamic programming). Practice on LeetCode, HackerRank, or GeeksforGeeks — aim for 100+ problems. Revise core subjects: DBMS, OS, Computer Networks, OOP concepts. Be ready for system design basics for senior roles. Mock interviews on Pramp or with peers help a lot.',
    category: 'Placement'
  },
  {
    question: 'How do I find and apply for internships?',
    answer: 'Use platforms like Internshala, LinkedIn, AngelList, and your college placement portal. Apply early — many good internships fill up months before the start date. Tailor your resume and cover letter to each role. Build a portfolio of projects on GitHub. Cold-emailing company employees on LinkedIn with a personalised message can also be effective.',
    category: 'Internship'
  },
  {
    question: 'What is React and why should I learn it?',
    answer: 'React is a JavaScript library for building user interfaces, developed by Meta. It uses a component-based architecture — you break your UI into reusable pieces. React uses a Virtual DOM for efficient updates. It\'s the most popular frontend library with a huge ecosystem (React Router, Redux, Next.js). Learning React makes you highly employable for frontend and full-stack roles.',
    category: 'React'
  },
  {
    question: 'What are React hooks and when should I use them?',
    answer: 'Hooks are functions that let you use state and other React features in functional components. Key hooks: useState (local state), useEffect (side effects like API calls), useContext (shared state), useRef (DOM refs), useMemo/useCallback (performance optimization). Use hooks whenever you need stateful logic in a functional component — they replace class component lifecycle methods.',
    category: 'React'
  },
  {
    question: 'What is the difference between SQL and NoSQL databases?',
    answer: 'SQL databases (MySQL, PostgreSQL) store data in structured tables with a fixed schema and use SQL for queries. They are great for relational data and complex joins. NoSQL databases (MongoDB, Redis) store data in flexible formats like documents, key-value pairs, or graphs. They scale horizontally and handle unstructured data well. Choose SQL for structured, relational data and NoSQL for flexible, high-volume, or hierarchical data.',
    category: 'Technical'
  },
  {
    question: 'How do I get started with competitive programming?',
    answer: 'Start with Codeforces, LeetCode, or HackerRank. Learn the basics: arrays, strings, sorting, binary search, and recursion. Progress to data structures: stacks, queues, trees, graphs, and heaps. Then tackle algorithms: BFS/DFS, dynamic programming, greedy, and divide & conquer. Consistency matters more than speed — solve at least one problem daily. Join programming contests like Codeforces rounds to benchmark your progress.',
    category: 'Technical'
  },
  {
    question: 'What are the most in-demand programming skills for freshers in 2024?',
    answer: 'Top skills employers look for in freshers: JavaScript/TypeScript (full-stack), Python (data science, automation, backend), Java (enterprise, Android), React or Vue (frontend), Node.js or Django (backend), SQL and basic database design, Git and version control, basic cloud knowledge (AWS/GCP free tier), and REST API design. Communication and problem-solving skills matter as much as technical skills.',
    category: 'Placement'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const existing = await FAQ.countDocuments();
    if (existing > 0) {
      console.log(`Found ${existing} existing FAQs. Skipping seed to avoid duplicates.`);
      console.log('To re-seed, drop the faqs collection first.');
      process.exit(0);
    }

    const inserted = await FAQ.insertMany(defaultFAQs);
    console.log(`✓ Seeded ${inserted.length} default FAQs across categories:`);
    const categories = [...new Set(defaultFAQs.map(f => f.category))];
    categories.forEach(cat => {
      const count = defaultFAQs.filter(f => f.category === cat).length;
      console.log(`  · ${cat}: ${count} FAQ${count > 1 ? 's' : ''}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
