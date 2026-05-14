const prisma = require('../config/prisma');

/**
 * Log an audit event to the database
 */
const logAudit = async ({ userId, electionId, action, details, ipAddress }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        electionId: electionId || null,
        action,
        details: details || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = { logAudit };
