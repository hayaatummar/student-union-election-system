const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getElections, getElectionById, createElection,
  updateElection, deleteElection, updateElectionStatus, getElectionResults,
} = require('../controllers/electionController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', authenticate, getElections);
router.get('/:id', authenticate, getElectionById);
router.get('/:id/results', authenticate, getElectionResults);

router.post('/', authenticate, authorize('ADMIN'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  validate,
], createElection);

router.put('/:id', authenticate, authorize('ADMIN'), updateElection);
router.put('/:id/status', authenticate, authorize('ADMIN'), [
  body('status').isIn(['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'RESULTS_PUBLISHED']).withMessage('Invalid status'),
  validate,
], updateElectionStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteElection);

module.exports = router;
