const prisma = require('../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');

/**
 * GET /api/candidates
 */
const getCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 10, electionId, positionId, status, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      AND: [
        electionId ? { electionId } : {},
        positionId ? { positionId } : {},
        status ? { status } : {},
        search ? {
          user: {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { department: { contains: search, mode: 'insensitive' } },
            ],
          },
        } : {},
      ],
    };

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: { select: { id: true, fullName: true, email: true, department: true, avatar: true } },
          election: { select: { id: true, title: true, status: true } },
          position: { select: { id: true, title: true } },
        },
        orderBy: { voteCount: 'desc' },
      }),
      prisma.candidate.count({ where }),
    ]);

    return paginatedResponse(res, candidates, {
      total, page: parseInt(page), limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch candidates.', 500);
  }
};

/**
 * GET /api/candidates/:id
 */
const getCandidateById = async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, fullName: true, email: true, department: true, avatar: true } },
        election: true,
        position: true,
      },
    });
    if (!candidate) return errorResponse(res, 'Candidate not found.', 404);
    return successResponse(res, candidate);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch candidate.', 500);
  }
};

/**
 * POST /api/candidates/apply - Candidate applies for election
 */
const applyForElection = async (req, res) => {
  try {
    const { electionId, positionId, manifesto, year, semester, socialLinks } = req.body;

    // Check election is active or draft
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return errorResponse(res, 'Election not found.', 404);
    if (!['DRAFT', 'ACTIVE'].includes(election.status)) {
      return errorResponse(res, 'Cannot apply for this election.', 400);
    }

    // Check if already applied
    const existing = await prisma.candidate.findFirst({
      where: { userId: req.user.id, electionId },
    });
    if (existing) return errorResponse(res, 'You have already applied for this election.', 409);

    const updateData = { electionId, positionId, manifesto, year, semester };
    if (socialLinks) updateData.socialLinks = socialLinks;
    if (req.file) updateData.campaignPoster = `/uploads/posters/${req.file.filename}`;

    const candidate = await prisma.candidate.create({
      data: {
        userId: req.user.id,
        ...updateData,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, department: true } },
        election: true,
        position: true,
      },
    });

    // Update user role to CANDIDATE
    await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'CANDIDATE' },
    });

    await logAudit({
      userId: req.user.id,
      electionId,
      action: 'CANDIDATE_APPLIED',
      details: `Applied for position: ${positionId}`,
      ipAddress: req.ip,
    });

    return successResponse(res, candidate, 'Application submitted successfully', 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to submit application.', 500);
  }
};

/**
 * PUT /api/candidates/:id/status - Admin approve/reject candidate
 */
const updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return errorResponse(res, 'Invalid status. Use APPROVED or REJECTED.', 400);
    }

    const candidate = await prisma.candidate.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: { select: { fullName: true, email: true } },
        position: true,
      },
    });

    await logAudit({
      userId: req.user.id,
      electionId: candidate.electionId,
      action: `CANDIDATE_${status}`,
      details: `${status} candidate: ${candidate.user.fullName}`,
      ipAddress: req.ip,
    });

    return successResponse(res, candidate, `Candidate ${status.toLowerCase()} successfully`);
  } catch (error) {
    return errorResponse(res, 'Failed to update candidate status.', 500);
  }
};

/**
 * PUT /api/candidates/profile - Candidate updates own profile
 */
const updateCandidateProfile = async (req, res) => {
  try {
    const { manifesto, year, semester, socialLinks } = req.body;

    const candidate = await prisma.candidate.findFirst({
      where: { userId: req.user.id },
    });
    if (!candidate) return errorResponse(res, 'Candidate profile not found.', 404);

    const updateData = { manifesto, year, semester };
    if (socialLinks) updateData.socialLinks = JSON.parse(socialLinks);
    if (req.file) updateData.campaignPoster = `/uploads/posters/${req.file.filename}`;

    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data: updateData,
      include: {
        user: { select: { id: true, fullName: true, email: true, department: true, avatar: true } },
        election: true,
        position: true,
      },
    });

    return successResponse(res, updated, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update profile.', 500);
  }
};

/**
 * GET /api/candidates/me - Get own candidate profile
 */
const getMyCandidateProfile = async (req, res) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, fullName: true, email: true, department: true, avatar: true } },
        election: true,
        position: true,
      },
    });
    if (!candidate) return errorResponse(res, 'Candidate profile not found.', 404);
    return successResponse(res, candidate);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch profile.', 500);
  }
};

module.exports = {
  getCandidates, getCandidateById, applyForElection,
  updateCandidateStatus, updateCandidateProfile, getMyCandidateProfile,
};
