const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      fullName: 'System Administrator',
      email: 'admin@university.edu',
      password: adminPassword,
      studentId: 'ADMIN001',
      department: 'Administration',
      role: 'ADMIN',
    },
  });

  // Create Students
  const studentPassword = await bcrypt.hash('Student@123', 12);
  const students = [];
  const studentData = [
    { fullName: 'Alice Johnson', email: 'alice@university.edu', studentId: 'STU001', department: 'Computer Science' },
    { fullName: 'Bob Smith', email: 'bob@university.edu', studentId: 'STU002', department: 'Engineering' },
    { fullName: 'Carol White', email: 'carol@university.edu', studentId: 'STU003', department: 'Business' },
    { fullName: 'David Brown', email: 'david@university.edu', studentId: 'STU004', department: 'Arts' },
    { fullName: 'Emma Davis', email: 'emma@university.edu', studentId: 'STU005', department: 'Science' },
    { fullName: 'Frank Wilson', email: 'frank@university.edu', studentId: 'STU006', department: 'Law' },
    { fullName: 'Grace Lee', email: 'grace@university.edu', studentId: 'STU007', department: 'Medicine' },
    { fullName: 'Henry Taylor', email: 'henry@university.edu', studentId: 'STU008', department: 'Computer Science' },
  ];

  for (const s of studentData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, password: studentPassword, role: 'STUDENT' },
    });
    students.push(student);
  }

  // Create Candidate Users
  const candidateData = [
    { fullName: 'James Martinez', email: 'james@university.edu', studentId: 'CAN001', department: 'Computer Science' },
    { fullName: 'Sarah Anderson', email: 'sarah@university.edu', studentId: 'CAN002', department: 'Engineering' },
    { fullName: 'Michael Thomas', email: 'michael@university.edu', studentId: 'CAN003', department: 'Business' },
    { fullName: 'Lisa Jackson', email: 'lisa@university.edu', studentId: 'CAN004', department: 'Arts' },
  ];

  const candidateUsers = [];
  for (const c of candidateData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { ...c, password: studentPassword, role: 'CANDIDATE' },
    });
    candidateUsers.push(user);
  }

  // Create Election
  const now = new Date();
  const election = await prisma.election.upsert({
    where: { id: 'election-2024-001' },
    update: {},
    create: {
      id: 'election-2024-001',
      title: 'Student Union General Election 2024',
      description: 'Annual student union election for the academic year 2024-2025. Vote for your representatives!',
      startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      createdBy: admin.id,
    },
  });

  // Create Positions
  const positions = [];
  const positionData = [
    { title: 'President', description: 'Lead the student union and represent all students' },
    { title: 'Vice President', description: 'Support the president and manage internal affairs' },
    { title: 'Secretary General', description: 'Handle communications and documentation' },
    { title: 'Treasurer', description: 'Manage student union finances and budgets' },
  ];

  for (const p of positionData) {
    const position = await prisma.position.upsert({
      where: { id: `pos-${p.title.toLowerCase().replace(' ', '-')}-2024` },
      update: {},
      create: {
        id: `pos-${p.title.toLowerCase().replace(' ', '-')}-2024`,
        ...p,
        electionId: election.id,
      },
    });
    positions.push(position);
  }

  // Create Candidates
  const candidateRecords = [];
  const manifestos = [
    'I will work tirelessly to improve student facilities and ensure every voice is heard. My vision is a united, progressive student community.',
    'My goal is to bridge the gap between students and administration. I will advocate for better academic resources and mental health support.',
    'I promise transparent governance and regular town halls. Together we can build a stronger student community.',
    'I will focus on financial transparency and securing more funding for student activities and clubs.',
  ];

  for (let i = 0; i < candidateUsers.length; i++) {
    const candidate = await prisma.candidate.upsert({
      where: { userId: candidateUsers[i].id },
      update: {},
      create: {
        userId: candidateUsers[i].id,
        electionId: election.id,
        positionId: positions[i].id,
        manifesto: manifestos[i],
        year: '3rd Year',
        semester: '6th Semester',
        status: 'APPROVED',
        voteCount: Math.floor(Math.random() * 50) + 10,
        socialLinks: {
          twitter: `https://twitter.com/${candidateUsers[i].fullName.split(' ')[0].toLowerCase()}`,
          linkedin: `https://linkedin.com/in/${candidateUsers[i].fullName.split(' ')[0].toLowerCase()}`,
        },
      },
    });
    candidateRecords.push(candidate);
  }

  // Create some votes
  for (let i = 0; i < students.length; i++) {
    const positionIndex = i % positions.length;
    try {
      await prisma.vote.create({
        data: {
          userId: students[i].id,
          electionId: election.id,
          candidateId: candidateRecords[positionIndex].id,
          positionId: positions[positionIndex].id,
        },
      });
    } catch (e) {
      // Skip duplicate votes
    }
  }

  // Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, electionId: election.id, action: 'ELECTION_CREATED', details: 'Created Student Union General Election 2024', ipAddress: '127.0.0.1' },
      { userId: admin.id, electionId: election.id, action: 'ELECTION_ACTIVATED', details: 'Election status changed to ACTIVE', ipAddress: '127.0.0.1' },
      { userId: candidateUsers[0].id, electionId: election.id, action: 'CANDIDATE_APPLIED', details: 'Applied for President position', ipAddress: '192.168.1.1' },
      { userId: admin.id, action: 'CANDIDATE_APPROVED', details: `Approved candidate ${candidateUsers[0].fullName}`, ipAddress: '127.0.0.1' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin:     admin@university.edu / Admin@123');
  console.log('Student:   alice@university.edu / Student@123');
  console.log('Candidate: james@university.edu / Student@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
