const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { fullName, email, password, studentId, department, role } = req.body;

    // Check existing user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { studentId: studentId || undefined }] },
    });
    if (existing) {
      return errorResponse(res, 'Email or Student ID already registered.', 409);
    }

    // Only allow STUDENT or CANDIDATE self-registration
    const allowedRoles = ['STUDENT', 'CANDIDATE'];
    const userRole = allowedRoles.includes(role) ? role : 'STUDENT';

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        studentId,
        department,
        role: userRole,
      },
      select: {
        id: true, fullName: true, email: true, studentId: true,
        department: true, role: true, avatar: true, createdAt: true,
      },
    });

    const token = generateToken(user.id);

    await logAudit({
      userId: user.id,
      action: 'USER_REGISTERED',
      details: `New ${userRole} registered: ${email}`,
      ipAddress: req.ip,
    });

    return successResponse(res, { user, token }, 'Registration successful', 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Registration failed. Please try again.', 500);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid credentials or account deactivated.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials.', 401);
    }

    const token = generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      details: `User logged in: ${email}`,
      ipAddress: req.ip,
    });

    return successResponse(res, { user: userWithoutPassword, token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed. Please try again.', 500);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, fullName: true, email: true, studentId: true,
        department: true, role: true, avatar: true, isActive: true, createdAt: true,
        candidate: {
          include: { election: true, position: true },
        },
      },
    });
    return successResponse(res, user, 'User fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch user.', 500);
  }
};

/**
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    await logAudit({ userId: req.user.id, action: 'PASSWORD_CHANGED', ipAddress: req.ip });

    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to change password.', 500);
  }
};

module.exports = { register, login, getMe, changePassword };
