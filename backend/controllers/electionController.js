const prisma = require('../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');

/**
 * GET /api/elections
 */
const getElections = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      AND: [
        status ? { status } : {},
        search ? { title: { contains: search, mode: 'insensitive' } } : {},
      ],
    };

    const [elections, total] = await Promise.all([
      prisma.election.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          positions: true,
          _count: { select: { candidates: true, votes: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.election.count({ where }),
    ]);

    return paginatedResponse(res, elections, {
      total, page: parseInt(page), limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch elections.', 500);
  }
};

/**
 * GET /api/elections/:id
 */
const getElectionById = async (req, res) => {
  try {
    const election = await prisma.election.findUnique({
      where: { id: req.params.id },
      include: {
        positions: {
          include: {
            candidates: {
              where: { status: 'APPROVED' },
              include: {
                user: {
                  select: { id: true, fullName: true, email: true, department: true, avatar: true },
                },
              },
            },
          },
        },
        _count: { select: { votes: true, candidates: true } },
      },
    });
    if (!election) return errorResponse(res, 'Election not found.', 404);
    return successResponse(res, election);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch election.', 500);
  }
};

/**
 * POST /api/elections - Admin create election
 */
const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, positions } = req.body;

    const election = await prisma.election.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdBy: req.user.id,
        positions: {
          create: positions?.map((p) => ({
            title: p.title,
            description: p.description,
            maxVotes: p.maxVotes || 1,
          })) || [],
        },
      },
      include: { positions: true },
    });

    await logAudit({
      userId: req.user.id,
      electionId: election.id,
      action: 'ELECTION_CREATED',
      details: `Created election: ${title}`,
      ipAddress: req.ip,
    });

    return successResponse(res, election, 'Election created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create election.', 500);
  }
};

/**
 * PUT /api/elections/:id - Admin update election
 */
const updateElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, status } = req.body;

    const election = await prisma.election.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
      },
      include: { positions: true },
    });

    await logAudit({
      userId: req.user.id,
      electionId: election.id,
      action: 'ELECTION_UPDATED',
      details: `Updated election: ${title}`,
      ipAddress: req.ip,
    });

    return successResponse(res, election, 'Election updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update election.', 500);
  }
};

/**
 * DELETE /api/elections/:id - Admin delete election
 */
const deleteElection = async (req, res) => {
  try {
    await prisma.election.delete({ where: { id: req.params.id } });

    await logAudit({
      userId: req.user.id,
      action: 'ELECTION_DELETED',
      details: `Deleted election ID: ${req.params.id}`,
      ipAddress: req.ip,
    });

    return successResponse(res, null, 'Election deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to delete election.', 500);
  }
};

/**
 * PUT /api/elections/:id/status - Admin change election status
 */
const updateElectionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'RESULTS_PUBLISHED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status.', 400);
    }

    const election = await prisma.election.update({
      where: { id: req.params.id },
      data: { status },
    });

    await logAudit({
      userId: req.user.id,
      electionId: election.id,
      action: `ELECTION_STATUS_CHANGED`,
      details: `Status changed to ${status}`,
      ipAddress: req.ip,
    });

    return successResponse(res, election, `Election status updated to ${status}`);
  } catch (error) {
    return errorResponse(res, 'Failed to update election status.', 500);
  }
};

/**
 * GET /api/elections/:id/results - Get election results
 */
const getElectionResults = async (req, res) => {
  try {
    const election = await prisma.election.findUnique({
      where: { id: req.params.id },
      include: {
        positions: {
          include: {
            candidates: {
              where: { status: 'APPROVED' },
              include: {
                user: {
                  select: { id: true, fullName: true, department: true, avatar: true },
                },
              },
              orderBy: { voteCount: 'desc' },
            },
          },
        },
        _count: { select: { votes: true } },
      },
    });

    if (!election) return errorResponse(res, 'Election not found.', 404);

    return successResponse(res, election, 'Results fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch results.', 500);
  }
};

module.exports = {
  getElections, getElectionById, createElection,
  updateElection, deleteElection, updateElectionStatus, getElectionResults,
};
