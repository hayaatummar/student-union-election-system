const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');

/**
 * POST /api/votes - Cast a vote
 */
const castVote = async (req, res) => {
  try {
    const { electionId, candidateId, positionId } = req.body;

    // Verify election is active
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return errorResponse(res, 'Election not found.', 404);
    if (election.status !== 'ACTIVE') {
      return errorResponse(res, 'This election is not currently active.', 400);
    }

    // Check election dates
    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      return errorResponse(res, 'Voting is not open at this time.', 400);
    }

    // Check candidate exists and is approved
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, electionId, positionId, status: 'APPROVED' },
    });
    if (!candidate) return errorResponse(res, 'Candidate not found or not approved.', 404);

    // Check duplicate vote (unique constraint on userId+electionId+positionId)
    const existingVote = await prisma.vote.findFirst({
      where: { userId: req.user.id, electionId, positionId },
    });
    if (existingVote) {
      return errorResponse(res, 'You have already voted for this position in this election.', 409);
    }

    // Cast vote in a transaction
    const [vote] = await prisma.$transaction([
      prisma.vote.create({
        data: {
          userId: req.user.id,
          electionId,
          candidateId,
          positionId,
        },
      }),
      prisma.candidate.update({
        where: { id: candidateId },
        data: { voteCount: { increment: 1 } },
      }),
    ]);

    await logAudit({
      userId: req.user.id,
      electionId,
      action: 'VOTE_CAST',
      details: `Voted for candidate ${candidateId} in position ${positionId}`,
      ipAddress: req.ip,
    });

    return successResponse(res, { voteId: vote.id }, 'Vote cast successfully', 201);
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, 'You have already voted for this position.', 409);
    }
    console.error('Vote error:', error);
    return errorResponse(res, 'Failed to cast vote.', 500);
  }
};

/**
 * GET /api/votes/my-votes - Get current user's voting history
 */
const getMyVotes = async (req, res) => {
  try {
    const votes = await prisma.vote.findMany({
      where: { userId: req.user.id },
      include: {
        election: { select: { id: true, title: true, status: true, endDate: true } },
        candidate: {
          include: {
            user: { select: { fullName: true, avatar: true } },
            position: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, votes, 'Voting history fetched');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch voting history.', 500);
  }
};

/**
 * GET /api/votes/check/:electionId - Check if user has voted in election
 */
const checkVoteStatus = async (req, res) => {
  try {
    const { electionId } = req.params;

    const votes = await prisma.vote.findMany({
      where: { userId: req.user.id, electionId },
      include: {
        position: { select: { id: true, title: true } },
        candidate: {
          include: { user: { select: { fullName: true } } },
        },
      },
    });

    // Get all positions for this election
    const positions = await prisma.position.findMany({
      where: { electionId },
      select: { id: true, title: true },
    });

    const votedPositionIds = votes.map((v) => v.positionId);
    const remainingPositions = positions.filter((p) => !votedPositionIds.includes(p.id));

    return successResponse(res, {
      hasVoted: votes.length > 0,
      votes,
      votedPositions: votes.map((v) => v.position),
      remainingPositions,
      totalPositions: positions.length,
      votedCount: votes.length,
    });
  } catch (error) {
    return errorResponse(res, 'Failed to check vote status.', 500);
  }
};

/**
 * GET /api/votes/election/:electionId - Admin: get all votes for election
 */
const getElectionVotes = async (req, res) => {
  try {
    const votes = await prisma.vote.findMany({
      where: { electionId: req.params.electionId },
      include: {
        user: { select: { fullName: true, studentId: true, department: true } },
        candidate: {
          include: { user: { select: { fullName: true } } },
        },
        position: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, votes);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch votes.', 500);
  }
};

module.exports = { castVote, getMyVotes, checkVoteStatus, getElectionVotes };
