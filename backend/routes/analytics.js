const express = require('express');
const router = express.Router();
const { getDashboardStats, getElectionAnalytics, getAuditLogs } = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/dashboard', authenticate, authorize('ADMIN'), getDashboardStats);
router.get('/election/:id', authenticate, authorize('ADMIN'), getElectionAnalytics);
router.get('/audit-logs', authenticate, authorize('ADMIN'), getAuditLogs);

module.exports = router;
