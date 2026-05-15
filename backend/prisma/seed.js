const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding UoH Election database...');

  // ─── ADMIN ───────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  // Update existing admin OR create new one — handle studentId conflict
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (admin) {
    admin = await prisma.user.update({
      where: { id: admin.id },
      data: {
        fullName: 'Election Commission Officer',
        email: 'admin@uohyd.ac.in',
        password: adminPassword,
        studentId: 'ADMIN001',
        department: 'Administration',
        role: 'ADMIN',
      },
    });
    console.log('✏️  Updated existing admin → admin@uohyd.ac.in');
  } else {
    admin = await prisma.user.create({
      data: {
        fullName: 'Election Commission Officer',
        email: 'admin@uohyd.ac.in',
        password: adminPassword,
        studentId: 'ADMIN001',
        department: 'Administration',
        role: 'ADMIN',
      },
    });
    console.log('✅ Created admin → admin@uohyd.ac.in');
  }

  const studentPassword = await bcrypt.hash('Student@123', 12);

  // ─── VOTER STUDENTS ──────────────────────────────────────────────────────
  const voterData = [
    { fullName: 'Rahul Verma',       email: 'rahul.verma@uohyd.ac.in',     studentId: 'STU001', department: 'School of Computer & Information Sciences' },
    { fullName: 'Priya Nair',        email: 'priya.nair@uohyd.ac.in',      studentId: 'STU002', department: 'School of Physics' },
    { fullName: 'Arjun Reddy',       email: 'arjun.reddy@uohyd.ac.in',     studentId: 'STU003', department: 'School of Chemistry' },
    { fullName: 'Fatima Begum',      email: 'fatima.begum@uohyd.ac.in',    studentId: 'STU004', department: 'School of Humanities' },
    { fullName: 'Suresh Kumar',      email: 'suresh.kumar@uohyd.ac.in',    studentId: 'STU005', department: 'School of Mathematics & Statistics' },
    { fullName: 'Lakshmi Devi',      email: 'lakshmi.devi@uohyd.ac.in',    studentId: 'STU006', department: 'School of Life Sciences' },
    { fullName: 'Vikram Singh',      email: 'vikram.singh@uohyd.ac.in',    studentId: 'STU007', department: 'School of Social Sciences' },
    { fullName: 'Meena Kumari',      email: 'meena.kumari@uohyd.ac.in',    studentId: 'STU008', department: 'School of Economics' },
    { fullName: 'Ravi Shankar',      email: 'ravi.shankar@uohyd.ac.in',    studentId: 'STU009', department: 'School of Management Studies' },
    { fullName: 'Deepa Thomas',      email: 'deepa.thomas@uohyd.ac.in',    studentId: 'STU010', department: 'School of Communication' },
    { fullName: 'Anil Babu',         email: 'anil.babu@uohyd.ac.in',       studentId: 'STU011', department: 'School of Computer & Information Sciences' },
    { fullName: 'Sunita Yadav',      email: 'sunita.yadav@uohyd.ac.in',    studentId: 'STU012', department: 'School of Physics' },
    { fullName: 'Kiran Raj',         email: 'kiran.raj@uohyd.ac.in',       studentId: 'STU013', department: 'School of Chemistry' },
    { fullName: 'Pooja Sharma',      email: 'pooja.sharma@uohyd.ac.in',    studentId: 'STU014', department: 'School of Humanities' },
    { fullName: 'Naveen Goud',       email: 'naveen.goud@uohyd.ac.in',     studentId: 'STU015', department: 'School of Life Sciences' },
  ];

  const voters = [];
  for (const v of voterData) {
    let u = await prisma.user.findFirst({ where: { OR: [{ email: v.email }, { studentId: v.studentId }] } });
    if (u) {
      u = await prisma.user.update({ where: { id: u.id }, data: { ...v, password: studentPassword, role: 'STUDENT' } });
    } else {
      u = await prisma.user.create({ data: { ...v, password: studentPassword, role: 'STUDENT' } });
    }
    voters.push(u);
  }

  // ─── CANDIDATE USERS ─────────────────────────────────────────────────────
  // All 32 known candidates across 6 positions
  const candidateUserData = [
    // PRESIDENT (8 candidates)
    { fullName: 'Siva Palepu',      email: 'siva.palepu@uohyd.ac.in',      studentId: 'CAN001', department: 'School of Social Sciences',               org: 'ABVP–SLVD' },
    { fullName: 'Ananya Dash',      email: 'ananya.dash@uohyd.ac.in',      studentId: 'CAN002', department: 'School of Humanities',                    org: 'BSF–DSU–SFI–TSF' },
    { fullName: 'Raju Naik',        email: 'raju.naik@uohyd.ac.in',        studentId: 'CAN003', department: 'School of Economics',                     org: 'ASA–AISA–Fraternity–MSF' },
    { fullName: 'Preethi Latha',    email: 'preethi.latha@uohyd.ac.in',    studentId: 'CAN004', department: 'School of Life Sciences',                 org: 'NSUI' },
    { fullName: 'Sanjay Mehra',     email: 'sanjay.mehra@uohyd.ac.in',     studentId: 'CAN005', department: 'School of Physics',                       org: 'PDSU' },
    { fullName: 'Kavitha Rao',      email: 'kavitha.rao@uohyd.ac.in',      studentId: 'CAN006', department: 'School of Chemistry',                     org: 'AIOBCSA' },
    { fullName: 'Dinesh Babu',      email: 'dinesh.babu@uohyd.ac.in',      studentId: 'CAN007', department: 'School of Mathematics & Statistics',      org: 'BRSV' },
    { fullName: 'Reshma Sultana',   email: 'reshma.sultana@uohyd.ac.in',   studentId: 'CAN008', department: 'School of Communication',                 org: 'Independent' },
    // VICE PRESIDENT (5 candidates)
    { fullName: 'Debendra Nath',    email: 'debendra.nath@uohyd.ac.in',    studentId: 'CAN009', department: 'School of Computer & Information Sciences', org: 'ABVP–SLVD' },
    { fullName: 'Diwakar Prasad',   email: 'diwakar.prasad@uohyd.ac.in',   studentId: 'CAN010', department: 'School of Social Sciences',               org: 'BSF–DSU–SFI–TSF' },
    { fullName: 'Amina Khatoon',    email: 'amina.khatoon@uohyd.ac.in',    studentId: 'CAN011', department: 'School of Humanities',                    org: 'ASA–AISA–Fraternity–MSF' },
    { fullName: 'Sunil Patil',      email: 'sunil.patil@uohyd.ac.in',      studentId: 'CAN012', department: 'School of Economics',                     org: 'NSUI' },
    { fullName: 'Geetha Kumari',    email: 'geetha.kumari@uohyd.ac.in',    studentId: 'CAN013', department: 'School of Life Sciences',                 org: 'PDSU' },
    // GENERAL SECRETARY (6 candidates)
    { fullName: 'Shruti Priya',     email: 'shruti.priya@uohyd.ac.in',     studentId: 'CAN014', department: 'School of Management Studies',            org: 'ABVP–SLVD' },
    { fullName: 'Mohammed Shadil',  email: 'mohammed.shadil@uohyd.ac.in',  studentId: 'CAN015', department: 'School of Humanities',                    org: 'ASA–AISA–Fraternity–MSF' },
    { fullName: 'Ramya Krishnan',   email: 'ramya.krishnan@uohyd.ac.in',   studentId: 'CAN016', department: 'School of Physics',                       org: 'BSF–DSU–SFI–TSF' },
    { fullName: 'Ajay Tiwari',      email: 'ajay.tiwari@uohyd.ac.in',      studentId: 'CAN017', department: 'School of Chemistry',                     org: 'NSUI' },
    { fullName: 'Bhavana Reddy',    email: 'bhavana.reddy@uohyd.ac.in',    studentId: 'CAN018', department: 'School of Social Sciences',               org: 'AIOBCSA' },
    { fullName: 'Tarun Gupta',      email: 'tarun.gupta@uohyd.ac.in',      studentId: 'CAN019', department: 'School of Economics',                     org: 'Independent' },
    // JOINT SECRETARY (5 candidates)
    { fullName: 'Saurabh Shukla',   email: 'saurabh.shukla@uohyd.ac.in',  studentId: 'CAN020', department: 'School of Computer & Information Sciences', org: 'ABVP–SLVD' },
    { fullName: 'Nandini Murthy',   email: 'nandini.murthy@uohyd.ac.in',   studentId: 'CAN021', department: 'School of Life Sciences',                 org: 'BSF–DSU–SFI–TSF' },
    { fullName: 'Irfan Ahmed',      email: 'irfan.ahmed@uohyd.ac.in',      studentId: 'CAN022', department: 'School of Humanities',                    org: 'ASA–AISA–Fraternity–MSF' },
    { fullName: 'Pallavi Singh',    email: 'pallavi.singh@uohyd.ac.in',    studentId: 'CAN023', department: 'School of Mathematics & Statistics',      org: 'NSUI' },
    { fullName: 'Venkat Rao',       email: 'venkat.rao@uohyd.ac.in',       studentId: 'CAN024', department: 'School of Physics',                       org: 'PDSU' },
    // SPORTS SECRETARY (4 candidates)
    { fullName: 'Jwala Kumar',      email: 'jwala.kumar@uohyd.ac.in',      studentId: 'CAN025', department: 'School of Social Sciences',               org: 'ABVP–SLVD' },
    { fullName: 'Rohit Meshram',    email: 'rohit.meshram@uohyd.ac.in',    studentId: 'CAN026', department: 'School of Chemistry',                     org: 'BSF–DSU–SFI–TSF' },
    { fullName: 'Zara Hussain',     email: 'zara.hussain@uohyd.ac.in',     studentId: 'CAN027', department: 'School of Communication',                 org: 'ASA–AISA–Fraternity–MSF' },
    { fullName: 'Manoj Yadav',      email: 'manoj.yadav@uohyd.ac.in',      studentId: 'CAN028', department: 'School of Economics',                     org: 'NSUI' },
    // CULTURAL SECRETARY (4 candidates)
    { fullName: 'Venus Lakshmi',    email: 'venus.lakshmi@uohyd.ac.in',    studentId: 'CAN029', department: 'School of Management Studies',            org: 'ABVP–SLVD' },
    { fullName: 'Chandra Sekhar',   email: 'chandra.sekhar@uohyd.ac.in',   studentId: 'CAN030', department: 'School of Humanities',                    org: 'BSF–DSU–SFI–TSF' },
    { fullName: 'Nasreen Fatima',   email: 'nasreen.fatima@uohyd.ac.in',   studentId: 'CAN031', department: 'School of Social Sciences',               org: 'ASA–AISA–Fraternity–MSF' },
    { fullName: 'Harish Babu',      email: 'harish.babu@uohyd.ac.in',      studentId: 'CAN032', department: 'School of Life Sciences',                 org: 'AIOBCSA' },
  ];

  const candidateUsers = [];
  for (const c of candidateUserData) {
    let u = await prisma.user.findFirst({ where: { OR: [{ email: c.email }, { studentId: c.studentId }] } });
    if (u) {
      u = await prisma.user.update({
        where: { id: u.id },
        data: { fullName: c.fullName, email: c.email, password: studentPassword, studentId: c.studentId, department: c.department, role: 'CANDIDATE' },
      });
    } else {
      u = await prisma.user.create({
        data: { fullName: c.fullName, email: c.email, password: studentPassword, studentId: c.studentId, department: c.department, role: 'CANDIDATE' },
      });
    }
    candidateUsers.push({ ...u, org: c.org });
  }

  // ─── ELECTIONS ───────────────────────────────────────────────────────────
  const now = new Date();

  // 2025-26 Active Election
  const election2025 = await prisma.election.upsert({
    where: { id: 'uoh-election-2025-26' },
    update: {},
    create: {
      id: 'uoh-election-2025-26',
      title: 'UoH Students\' Union General Election 2025–26',
      description: 'Annual Students\' Union Election at the University of Hyderabad (UoH/HCU). 169 candidates contested across 6 positions with 81%+ voter turnout across 29 polling booths on campus. Major alliances: ABVP–SLVD, BSF–DSU–SFI–TSF, and ASA–AISA–Fraternity–MSF.',
      startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      createdBy: admin.id,
    },
  });

  // 2024-25 Closed Election (previous year — Left/Ambedkarite dominated)
  const election2024 = await prisma.election.upsert({
    where: { id: 'uoh-election-2024-25' },
    update: {},
    create: {
      id: 'uoh-election-2024-25',
      title: 'UoH Students\' Union General Election 2024–25',
      description: 'Previous year election dominated by Left and Ambedkarite alliances including SFI, ASA, AISA, DSU, and BSF. Results have been published.',
      startDate: new Date('2024-09-10T09:00:00'),
      endDate: new Date('2024-09-10T17:00:00'),
      status: 'RESULTS_PUBLISHED',
      createdBy: admin.id,
    },
  });

  // ─── POSITIONS for 2025-26 ────────────────────────────────────────────────
  const positionDefs = [
    { id: 'pos-president-2025',         title: 'President',          description: 'Head of the Students\' Union. Represents all students before the University administration and the Academic Council.' },
    { id: 'pos-vice-president-2025',    title: 'Vice President',     description: 'Assists the President and oversees internal affairs, hostel welfare, and student grievances.' },
    { id: 'pos-gen-secretary-2025',     title: 'General Secretary',  description: 'Manages day-to-day operations of the Students\' Union, maintains records, and coordinates with departments.' },
    { id: 'pos-joint-secretary-2025',   title: 'Joint Secretary',    description: 'Supports the General Secretary and handles inter-departmental student coordination.' },
    { id: 'pos-sports-secretary-2025',  title: 'Sports Secretary',   description: 'Organises and oversees all sports events, tournaments, and athletic activities on campus.' },
    { id: 'pos-cultural-secretary-2025',title: 'Cultural Secretary', description: 'Plans and manages cultural fests, arts events, and student cultural activities throughout the year.' },
  ];

  const positions2025 = [];
  for (const p of positionDefs) {
    const pos = await prisma.position.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, title: p.title, description: p.description, electionId: election2025.id },
    });
    positions2025.push(pos);
  }

  // Positions for 2024-25 (previous year)
  const positionDefs2024 = [
    { id: 'pos-president-2024',         title: 'President',         description: 'Head of the Students\' Union 2024-25.' },
    { id: 'pos-vice-president-2024',    title: 'Vice President',    description: 'Vice President 2024-25.' },
    { id: 'pos-gen-secretary-2024',     title: 'General Secretary', description: 'General Secretary 2024-25.' },
    { id: 'pos-joint-secretary-2024',   title: 'Joint Secretary',   description: 'Joint Secretary 2024-25.' },
  ];
  const positions2024 = [];
  for (const p of positionDefs2024) {
    const pos = await prisma.position.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, title: p.title, description: p.description, electionId: election2024.id },
    });
    positions2024.push(pos);
  }

  // ─── CANDIDATES for 2025-26 ───────────────────────────────────────────────
  // Map: candidateUsers index → positionId, manifesto, voteCount, status
  // Positions order: [0]=President, [1]=VP, [2]=GenSec, [3]=JointSec, [4]=Sports, [5]=Cultural
  const candidateMappings = [
    // PRESIDENT (indices 0-7)
    { idx: 0,  posIdx: 0, status: 'APPROVED', voteCount: 1842, manifesto: 'As a proud UoH student from the ABVP–SLVD alliance, I will fight for better hostel facilities, faster Wi-Fi across campus, and transparent administration. I will ensure every student — regardless of caste, religion, or region — has a voice in the Students\' Union. My priority is academic welfare, mental health support, and strengthening the bond between students and faculty.' },
    { idx: 1,  posIdx: 0, status: 'APPROVED', voteCount: 1789, manifesto: 'The BSF–DSU–SFI–TSF alliance stands for social justice and equality. I will fight against caste discrimination on campus, push for reservation implementation in all departments, and ensure Dalit and Bahujan students receive the support they deserve. Education is a right, not a privilege — and I will make UoH a truly inclusive campus.' },
    { idx: 2,  posIdx: 0, status: 'APPROVED', voteCount: 634,  manifesto: 'The ASA–AISA–Fraternity–MSF alliance represents the most marginalised voices on campus. I will work to end institutional discrimination, support minority students, and build bridges across communities. Together we will create a campus free from fear and full of opportunity.' },
    { idx: 3,  posIdx: 0, status: 'APPROVED', voteCount: 412,  manifesto: 'NSUI stands with the Congress ideology of inclusive development. I will focus on improving library resources, expanding scholarship access, and creating more internship opportunities for UoH students in government and industry.' },
    { idx: 4,  posIdx: 0, status: 'APPROVED', voteCount: 198,  manifesto: 'PDSU believes in progressive democratic values. I will push for student representation in all university committees, demand transparency in fee structures, and fight for the rights of research scholars and PhD students.' },
    { idx: 5,  posIdx: 0, status: 'APPROVED', voteCount: 156,  manifesto: 'AIOBCSA represents the OBC community at UoH. I will ensure OBC students get their rightful share of scholarships, hostel seats, and academic support. No student should be left behind because of their background.' },
    { idx: 6,  posIdx: 0, status: 'APPROVED', voteCount: 89,   manifesto: 'BRSV stands for Telangana students\' rights. I will advocate for more seats for Telangana students, better regional language support, and stronger ties with the state government for student welfare schemes.' },
    { idx: 7,  posIdx: 0, status: 'APPROVED', voteCount: 67,   manifesto: 'As an independent candidate, I am not bound by any party agenda. I will focus purely on student welfare — better canteen food, 24-hour library access, improved sports facilities, and faster grievance redressal.' },
    // VICE PRESIDENT (indices 8-12)
    { idx: 8,  posIdx: 1, status: 'APPROVED', voteCount: 1756, manifesto: 'I will support the President in all administrative matters and specifically focus on hostel welfare, mess quality, and ensuring safe campus infrastructure. ABVP–SLVD is committed to a clean and safe UoH.' },
    { idx: 9,  posIdx: 1, status: 'APPROVED', voteCount: 1698, manifesto: 'The BSF–DSU–SFI–TSF alliance will ensure the Vice President\'s office becomes a real support system for students facing discrimination and academic pressure. I will be accessible to every student on campus.' },
    { idx: 10, posIdx: 1, status: 'APPROVED', voteCount: 589,  manifesto: 'I will work to strengthen the voice of minority and marginalised students in the administration. The ASA–AISA–Fraternity–MSF alliance believes in unity across communities.' },
    { idx: 11, posIdx: 1, status: 'APPROVED', voteCount: 378,  manifesto: 'NSUI will bring a fresh perspective to the Vice President\'s role. I will focus on student mental health, anti-ragging measures, and building a welcoming environment for first-year students.' },
    { idx: 12, posIdx: 1, status: 'APPROVED', voteCount: 167,  manifesto: 'PDSU\'s vision for the Vice President is to be a bridge between students and the administration. I will ensure student concerns are heard at every level of university governance.' },
    // GENERAL SECRETARY (indices 13-18)
    { idx: 13, posIdx: 2, status: 'APPROVED', voteCount: 1823, manifesto: 'As General Secretary, I will maintain transparent records of all Students\' Union activities, ensure timely communication of university decisions to students, and organise regular open meetings. ABVP–SLVD promises accountability and efficiency.' },
    { idx: 14, posIdx: 2, status: 'APPROVED', voteCount: 712,  manifesto: 'The ASA–AISA–Fraternity–MSF alliance will use the General Secretary position to document and address cases of institutional discrimination. Every student complaint will be taken seriously and followed up.' },
    { idx: 15, posIdx: 2, status: 'APPROVED', voteCount: 1534, manifesto: 'BSF–DSU–SFI–TSF will bring organisational strength to the General Secretary role. I will coordinate with all departments, maintain proper minutes of meetings, and ensure the union functions democratically.' },
    { idx: 16, posIdx: 2, status: 'APPROVED', voteCount: 445,  manifesto: 'NSUI will modernise the General Secretary\'s office — digitising records, creating a student portal for grievances, and making the union more accessible to all students.' },
    { idx: 17, posIdx: 2, status: 'APPROVED', voteCount: 234,  manifesto: 'AIOBCSA will ensure OBC and backward class students have proper representation in all union activities. I will maintain inclusive records and ensure no community is overlooked.' },
    { idx: 18, posIdx: 2, status: 'APPROVED', voteCount: 112,  manifesto: 'As an independent candidate, I will bring a non-partisan approach to the General Secretary role, focusing purely on administrative efficiency and student service.' },
    // JOINT SECRETARY (indices 19-23)
    { idx: 19, posIdx: 3, status: 'APPROVED', voteCount: 1798, manifesto: 'I will coordinate between departments and the central union, ensuring every school at UoH has a voice. ABVP–SLVD believes in strong inter-departmental cooperation for student welfare.' },
    { idx: 20, posIdx: 3, status: 'APPROVED', voteCount: 1612, manifesto: 'BSF–DSU–SFI–TSF will use the Joint Secretary position to strengthen grassroots student organising. I will hold regular department-level meetings and bring student concerns directly to the union.' },
    { idx: 21, posIdx: 3, status: 'APPROVED', voteCount: 567,  manifesto: 'The ASA–AISA–Fraternity–MSF alliance will ensure the Joint Secretary\'s office is a safe space for all students. I will work on inter-community dialogue and campus harmony.' },
    { idx: 22, posIdx: 3, status: 'APPROVED', voteCount: 389,  manifesto: 'NSUI will bring energy and innovation to the Joint Secretary role. I will focus on student entrepreneurship, skill development workshops, and career guidance programmes.' },
    { idx: 23, posIdx: 3, status: 'APPROVED', voteCount: 145,  manifesto: 'PDSU will ensure the Joint Secretary position serves research scholars and PhD students who are often overlooked. I will advocate for better stipends and research facilities.' },
    // SPORTS SECRETARY (indices 24-27)
    { idx: 24, posIdx: 4, status: 'APPROVED', voteCount: 1867, manifesto: 'I will revamp the sports calendar at UoH — more inter-university tournaments, better sports equipment, upgraded facilities, and recognition for student athletes. ABVP–SLVD is committed to a healthy and active campus.' },
    { idx: 25, posIdx: 4, status: 'APPROVED', voteCount: 1723, manifesto: 'BSF–DSU–SFI–TSF will ensure sports facilities are equally accessible to all students, including those from marginalised backgrounds. I will push for more sports scholarships and representation in national competitions.' },
    { idx: 26, posIdx: 4, status: 'APPROVED', voteCount: 534,  manifesto: 'The ASA–AISA–Fraternity–MSF alliance will use the Sports Secretary role to promote inclusive sports culture on campus. I will organise community sports events that bring all groups together.' },
    { idx: 27, posIdx: 4, status: 'APPROVED', voteCount: 312,  manifesto: 'NSUI will modernise sports management at UoH — online registration for events, live scoreboards, and better coordination with the Physical Education department.' },
    // CULTURAL SECRETARY (indices 28-31)
    { idx: 28, posIdx: 5, status: 'APPROVED', voteCount: 1834, manifesto: 'I will make UoH\'s cultural fest one of the best in India. More performances, bigger budgets, diverse art forms, and a platform for every student\'s talent. ABVP–SLVD believes culture unites us all.' },
    { idx: 29, posIdx: 5, status: 'APPROVED', voteCount: 1645, manifesto: 'BSF–DSU–SFI–TSF will ensure cultural events celebrate the diversity of UoH — folk arts, tribal culture, Dalit literature, and regional traditions will all have a place on our stage.' },
    { idx: 30, posIdx: 5, status: 'APPROVED', voteCount: 623,  manifesto: 'The ASA–AISA–Fraternity–MSF alliance will use cultural events to promote social awareness. I will organise events that celebrate Ambedkarite thought, minority cultures, and progressive art.' },
    { idx: 31, posIdx: 5, status: 'APPROVED', voteCount: 289,  manifesto: 'AIOBCSA will ensure OBC and backward class cultural traditions are celebrated at UoH. I will create dedicated spaces for regional folk arts and traditional performances.' },
  ];

  const candidateRecords = [];
  for (const m of candidateMappings) {
    const cu = candidateUsers[m.idx];
    const pos = positions2025[m.posIdx];
    const existing = await prisma.candidate.findFirst({ where: { userId: cu.id } });
    let rec;
    if (existing) {
      rec = await prisma.candidate.update({
        where: { id: existing.id },
        data: { voteCount: m.voteCount, status: m.status, manifesto: m.manifesto },
      });
    } else {
      rec = await prisma.candidate.create({
        data: {
          userId: cu.id,
          electionId: election2025.id,
          positionId: pos.id,
          manifesto: m.manifesto,
          year: '3rd Year',
          semester: '6th Semester',
          status: m.status,
          voteCount: m.voteCount,
          socialLinks: {
            twitter: `https://twitter.com/${cu.fullName.split(' ')[0].toLowerCase()}`,
            linkedin: `https://linkedin.com/in/${cu.fullName.split(' ')[0].toLowerCase()}-uoh`,
          },
        },
      });
    }
    candidateRecords.push(rec);
  }

  // ─── VOTES (simulate 81% turnout) ────────────────────────────────────────
  // Each voter votes for one candidate per position
  const voteAssignments = [
    // voter 0 → votes for ABVP winners across all positions
    [0, 8, 13, 19, 24, 28],
    // voter 1 → votes for BSF alliance
    [1, 9, 15, 20, 25, 29],
    // voter 2 → votes for ASA alliance
    [2, 10, 14, 21, 26, 30],
    // voter 3 → votes for NSUI
    [3, 11, 16, 22, 27, 31],
    // voter 4 → votes for ABVP
    [0, 8, 13, 19, 24, 28],
    // voter 5 → votes for BSF
    [1, 9, 15, 20, 25, 29],
    // voter 6 → votes for ABVP
    [0, 8, 13, 19, 24, 28],
    // voter 7 → votes for ASA
    [2, 10, 14, 21, 26, 30],
    // voter 8 → votes for PDSU/Independent mix
    [4, 12, 18, 23, 27, 31],
    // voter 9 → votes for ABVP
    [0, 8, 13, 19, 24, 28],
    // voter 10 → votes for BSF
    [1, 9, 15, 20, 25, 29],
    // voter 11 → votes for ABVP
    [0, 8, 13, 19, 24, 28],
    // voter 12 → votes for ASA
    [2, 10, 14, 21, 26, 30],
    // voter 13 → votes for NSUI
    [3, 11, 16, 22, 27, 31],
    // voter 14 → votes for ABVP
    [0, 8, 13, 19, 24, 28],
  ];

  for (let vi = 0; vi < voters.length; vi++) {
    const assignment = voteAssignments[vi];
    for (let pi = 0; pi < positions2025.length; pi++) {
      const candidateIdx = assignment[pi];
      const candidateRec = candidateRecords[candidateIdx];
      if (!candidateRec) continue;
      try {
        await prisma.vote.create({
          data: {
            userId: voters[vi].id,
            electionId: election2025.id,
            candidateId: candidateRec.id,
            positionId: positions2025[pi].id,
          },
        });
      } catch (e) {
        // skip duplicates on re-seed
      }
    }
  }

  // ─── AUDIT LOGS ──────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, electionId: election2025.id, action: 'ELECTION_CREATED',   details: 'Created UoH Students\' Union General Election 2025–26',          ipAddress: '10.0.0.1' },
      { userId: admin.id, electionId: election2025.id, action: 'ELECTION_ACTIVATED', details: 'Election status changed to ACTIVE. 29 polling booths configured.', ipAddress: '10.0.0.1' },
      { userId: admin.id, electionId: election2024.id, action: 'ELECTION_CREATED',   details: 'Created UoH Students\' Union General Election 2024–25',          ipAddress: '10.0.0.1' },
      { userId: admin.id, electionId: election2024.id, action: 'ELECTION_ACTIVATED', details: 'Election 2024-25 results published.',                             ipAddress: '10.0.0.1' },
      { userId: candidateUsers[0].id, electionId: election2025.id, action: 'CANDIDATE_APPLIED',  details: 'Siva Palepu applied for President (ABVP–SLVD)',       ipAddress: '10.0.0.5' },
      { userId: candidateUsers[1].id, electionId: election2025.id, action: 'CANDIDATE_APPLIED',  details: 'Ananya Dash applied for President (BSF–DSU–SFI–TSF)', ipAddress: '10.0.0.6' },
      { userId: admin.id,             electionId: election2025.id, action: 'CANDIDATE_APPROVED', details: 'All 32 central panel candidates approved',             ipAddress: '10.0.0.1' },
      { userId: voters[0].id,         electionId: election2025.id, action: 'VOTE_CAST',          details: 'Vote cast successfully',                               ipAddress: '10.0.0.10' },
      { userId: voters[1].id,         electionId: election2025.id, action: 'VOTE_CAST',          details: 'Vote cast successfully',                               ipAddress: '10.0.0.11' },
    ],
    skipDuplicates: true,
  });

  console.log('\n✅ UoH Election System seeded successfully!\n');
  console.log('📊 Summary:');
  console.log('   Elections : 2 (2025-26 ACTIVE, 2024-25 RESULTS_PUBLISHED)');
  console.log('   Positions : 6 (President, VP, Gen Sec, Joint Sec, Sports, Cultural)');
  console.log('   Candidates: 32 across all positions');
  console.log('   Voters    : 15 demo students');
  console.log('   Votes     : Simulated 81%+ turnout\n');
  console.log('🔑 Test Credentials:');
  console.log('   Admin     : admin@uohyd.ac.in     / Admin@123');
  console.log('   Student   : rahul.verma@uohyd.ac.in / Student@123');
  console.log('   Candidate : siva.palepu@uohyd.ac.in / Student@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
