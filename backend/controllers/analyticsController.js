const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/analytics/dashboard - Admin dashboard stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalCandidates,
      totalVotes,
      activeElections,
      recentVotes,
      departmentStats,
      electionStats,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { in: ['STUDENT', 'CANDIDATE'] } } }),
      prisma.candidate.count({ where: { status: 'APPROVED' } }),
      prisma.vote.count(),
      prisma.election.count({ where: { status: 'ACTIVE' } }),
      // Recent votes (last 7 days grouped by day)
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM votes
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      // Votes by department
      prisma.$queryRaw`
        SELECT u.department, COUNT(v.id) as vote_count
        FROM votes v
        JOIN users u ON v.user_id = u.id
        WHERE u.department IS NOT NULL
        GROUP BY u.department
        ORDER BY vote_count DESC
        LIMIT 10
      `,
      // Election participation stats
      prisma.election.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          _count: { select: { votes: true, candidates: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return successResponse(res, {
      overview: { totalStudents, totalCandidates, totalVotes, activeElections },
      recentVotes,
      departmentStats,
      electionStats,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return errorResponse(res, 'Failed to fetch analytics.', 500);
  }
};

/**
 * GET /api/analytics/election/:id - Detailed election analytics
 */
const getElectionAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        positions: {
          include: {
            candidates: {
              where: { status: 'APPROVED' },
              include: {
                user: { select: { fullName: true, department: true, avatar: true } },
              },
              orderBy: { voteCount: 'desc' },
            },
          },
        },
        _count: { select: { votes: true } },
      },
    });

    if (!election) return errorResponse(res, 'Election not found.', 404);

    // Votes over time for this election
    const votesOverTime = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM votes
      WHERE election_id = ${id}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Voter turnout by department
    const turnoutByDept = await prisma.$queryRaw`
      SELECT u.department, COUNT(DISTINCT v.user_id) as voters
      FROM votes v
      JOIN users u ON v.user_id = u.id
      WHERE v.election_id = ${id} AND u.department IS NOT NULL
      GROUP BY u.department
      ORDER BY voters DESC
    `;

    return successResponse(res, {
      election,
      votesOverTime,
      turnoutByDept,
    });
  } catch (error) {
    console.error('Election analytics error:', error);
    return errorResponse(res, 'Failed to fetch election analytics.', 500);
  }
};

/**
 * GET /api/analytics/audit-logs - Admin audit logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action = '', userId = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      AND: [
        action ? { action: { contains: action, mode: 'insensitive' } } : {},
        userId ? { userId } : {},
      ],
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: { select: { fullName: true, email: true, role: true } },
          election: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return successResponse(res, {
      logs,
      pagination: {
        total, page: parseInt(page), limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch audit logs.', 500);
  }
};

module.exports = { getDashboardStats, getElectionAnalytics, getAuditLogs };
