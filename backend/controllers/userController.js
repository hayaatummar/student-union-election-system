const prisma = require('../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');
const bcrypt = require('bcryptjs');
const path = require('path');

/**
 * GET /api/users - Admin: list all users
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      AND: [
        search ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { studentId: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        role ? { role } : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true, fullName: true, email: true, studentId: true,
          department: true, role: true, avatar: true, isActive: true, createdAt: true,
          _count: { select: { votes: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(res, users, {
      total, page: parseInt(page), limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch users.', 500);
  }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, fullName: true, email: true, studentId: true,
        department: true, role: true, avatar: true, isActive: true, createdAt: true,
        candidate: { include: { election: true, position: true } },
        votes: { include: { election: true, candidate: { include: { user: true } } } },
      },
    });
    if (!user) return errorResponse(res, 'User not found.', 404);
    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch user.', 500);
  }
};

/**
 * PUT /api/users/:id - Admin update user
 */
const updateUser = async (req, res) => {
  try {
    const { fullName, department, role, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { fullName, department, role, isActive },
      select: {
        id: true, fullName: true, email: true, studentId: true,
        department: true, role: true, isActive: true,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'USER_UPDATED',
      details: `Updated user: ${user.email}`,
      ipAddress: req.ip,
    });

    return successResponse(res, user, 'User updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update user.', 500);
  }
};

/**
 * DELETE /api/users/:id - Admin delete user
 */
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return errorResponse(res, 'Cannot delete your own account.', 400);
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    await logAudit({
      userId: req.user.id,
      action: 'USER_DELETED',
      details: `Deleted user ID: ${req.params.id}`,
      ipAddress: req.ip,
    });
    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to delete user.', 500);
  }
};

/**
 * PUT /api/users/profile - Update own profile
 */
const updateProfile = async (req, res) => {
  try {
    const { fullName, department } = req.body;
    const updateData = { fullName, department };

    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true, fullName: true, email: true, studentId: true,
        department: true, role: true, avatar: true,
      },
    });

    return successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update profile.', 500);
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, updateProfile };
